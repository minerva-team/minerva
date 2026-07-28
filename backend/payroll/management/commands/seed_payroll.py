from django.core.management.base import BaseCommand
from django.db import transaction
from datetime import date, time
from decimal import Decimal
import random

from hr.models import Employee, Contract
from payroll.models import PayrollConfig, Payslip

class Command(BaseCommand):
    help = "Seed Payroll app safely (idempotent, optimized, Persian localized)"

    def add_arguments(self, parser):
        parser.add_argument(
            '--months',
            type=int,
            default=3,
            help="Number of months to generate payslips"
        )

    def handle(self, *args, **kwargs):
        months_back = kwargs['months']

        with transaction.atomic():
            # ==================================================
            # 1. Global Payroll Configuration
            # ==================================================
            config, created = PayrollConfig.objects.get_or_create(
                department=None,
                contract_type=None,
                defaults={
                    "tax_rate": Decimal("10.00"),    
                    "insurance_rate": Decimal("7.00"),
                    "standard_start_time": time(9, 0),
                    "standard_end_time": time(17, 0),
                    "lateness_multiplier": Decimal("1.00"),
                    "overtime_multiplier": Decimal("1.50"),
                }
            )
            self.stdout.write(self.style.SUCCESS("✓ تنظیمات حقوق و دستمزد آماده شد (مالیات ۱۰٪ و بیمه ۷٪)"))

            # ==================================================
            # 2. Employees & Contracts
            # ==================================================
            employees = list(
                Employee.objects
                .filter(is_deleted=False)
                .select_related("user", "department")
            )

            if not employees:
                self.stdout.write(self.style.ERROR("❌ هیچ کارمندی یافت نشد. لطفاً ابتدا seeder بخش HR را اجرا کنید."))
                return

            contracts = (
                Contract.objects
                .filter(employee__in=employees, is_active=True)
                .order_by("-start_date")
            )

            active_contracts = {}
            for contract in contracts:
                if contract.employee_id not in active_contracts:
                    active_contracts[contract.employee_id] = contract

            # ==================================================
            # 3. Generate periods
            # ==================================================
            today = date.today()
            periods = []
            year, month = today.year, today.month

            for _ in range(months_back):
                periods.append((year, month))
                month -= 1
                if month == 0:
                    month = 12
                    year -= 1

            # ==================================================
            # 4. Existing Payslips & Generation
            # ==================================================
            existing_payslips = set(
                Payslip.objects
                .filter(employee__in=employees)
                .values_list("employee_id", "year", "month")
            )

            payslips = []
            skipped_contract = 0

            for employee in employees:
                contract = active_contracts.get(employee.id)

                if not contract:
                    skipped_contract += 1
                    continue

                gross_salary = (
                    contract.base_salary + contract.housing_allowance + contract.transport_allowance
                )
                
                tax_amount = (gross_salary * config.tax_rate / Decimal("100")).quantize(Decimal("0.01"))
                insurance_amount = (gross_salary * config.insurance_rate / Decimal("100")).quantize(Decimal("0.01"))
                net_salary = (gross_salary - tax_amount - insurance_amount)

                for index, (p_year, p_month) in enumerate(periods):
                    if (employee.id, p_year, p_month) in existing_payslips:
                        continue

                    if index == 0:
                        status = "Draft"
                    elif index == 1:
                        status = random.choice(["Approved", "Paid"])
                    else:
                        status = "Paid"

                    payslips.append(
                        Payslip(
                            employee=employee,
                            year=p_year,
                            month=p_month,
                            status=status,
                            gross_salary=gross_salary,
                            applied_tax_rate=config.tax_rate,
                            applied_insurance_rate=config.insurance_rate,
                            tax_amount=tax_amount,
                            insurance_amount=insurance_amount,
                            net_salary=net_salary,
                        )
                    )

            # ==================================================
            # 5. Bulk Insert
            # ==================================================
            if payslips:
                Payslip.objects.bulk_create(payslips, batch_size=500)

            if skipped_contract:
                self.stdout.write(self.style.WARNING(f"⚠ {skipped_contract} کارمند به دلیل نداشتن قرارداد فعال نادیده گرفته شدند."))

            self.stdout.write(self.style.SUCCESS(f"✓ {len(payslips)} فیش حقوقی با موفقیت ایجاد شد."))