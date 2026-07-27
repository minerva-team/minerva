from decimal import Decimal
from datetime import datetime
from django.core.exceptions import ValidationError
from hr.models import Employee, Contract, Attendance
from payroll.models import PayrollConfig, Payslip

class MonthlyPayslipCalculator:

    @classmethod
    def calculate_for_employee(cls, employee_id: int, year: int, month: int) -> Payslip:


        existing_payslip = Payslip.objects.filter(
            employee_id=employee_id,
            year=year,
            month=month
        ).first()

        if existing_payslip and existing_payslip.status != 'Draft':
            raise ValidationError(
                f"فیش حقوقی این ماه برای این کارمند در وضعیت '{existing_payslip.status}' است "
                "و قابل محاسبه مجدد نیست."
            )


        try:
            employee = Employee.objects.select_related('department').get(pk=employee_id, is_deleted=False)
        except Employee.DoesNotExist:
            raise ValidationError("کارمند مورد نظر یافت نشد.")


        try:
            contract = Contract.objects.select_related('contract_type').get(
                employee=employee,
                is_active=True
            )
        except Contract.DoesNotExist:
            raise ValidationError("این کارمند هیچ قرارداد فعالی ندارد.")


        config = PayrollConfig.objects.filter(
            department=employee.department,
            contract_type=contract.contract_type
        ).first()

        if not config:
            raise ValidationError(
                f"تنظیمات حقوقی (PayrollConfig) برای دپارتمان '{employee.department}' "
                f"با نوع قرارداد '{contract.contract_type.name}' تعریف نشده است."
            )


        time_stats = cls._calculate_working_hours(
            employee=employee,
            year=year,
            month=month,
            std_start=config.standard_start_time,
            std_end=config.standard_end_time
        )


        hourly_rate = contract.base_salary / Decimal('160.0')

        overtime_pay = Decimal(str(time_stats['overtime_hours'])) * hourly_rate * config.overtime_multiplier
        undertime_penalty = Decimal(str(time_stats['undertime_hours'])) * hourly_rate * config.lateness_multiplier

        gross_salary = (
            contract.base_salary +
            contract.housing_allowance +
            contract.transport_allowance +
            overtime_pay -
            undertime_penalty
        )

        gross_salary = max(gross_salary, Decimal('0.00'))

        tax_amount = gross_salary * (config.tax_rate / Decimal('100.0'))
        insurance_amount = gross_salary * (config.insurance_rate / Decimal('100.0'))
        net_salary = gross_salary - (tax_amount + insurance_amount)


        payslip, created = Payslip.objects.update_or_create(
            employee=employee,
            year=year,
            month=month,
            defaults={
                'status': 'Draft',
                'gross_salary': round(gross_salary, 2),
                'applied_tax_rate': config.tax_rate,
                'applied_insurance_rate': config.insurance_rate,
                'tax_amount': round(tax_amount, 2),
                'insurance_amount': round(insurance_amount, 2),
                'net_salary': round(net_salary, 2),
            }
        )

       
        return payslip

    @staticmethod
    def _calculate_working_hours(employee, year, month, std_start, std_end) -> dict:
        attendances = Attendance.objects.filter(
            employee=employee,
            date__year=year,
            date__month=month,
            status='Present',
            clock_in__isnull=False,
            clock_out__isnull=False
        )

        total_overtime_seconds = 0
        total_undertime_seconds = 0

        dummy_date = datetime.today().date()
        dt_std_start = datetime.combine(dummy_date, std_start)
        dt_std_end = datetime.combine(dummy_date, std_end)
        std_daily_seconds = (dt_std_end - dt_std_start).total_seconds()

        for att in attendances:
            dt_in = datetime.combine(att.date, att.clock_in)
            dt_out = datetime.combine(att.date, att.clock_out)

            actual_seconds = (dt_out - dt_in).total_seconds()
            diff_seconds = actual_seconds - std_daily_seconds

            if diff_seconds > 0:
                total_overtime_seconds += diff_seconds
            elif diff_seconds < 0:
                total_undertime_seconds += abs(diff_seconds)

        return {
            'overtime_hours': round(total_overtime_seconds / 3600, 2),
            'undertime_hours': round(total_undertime_seconds / 3600, 2)
        }