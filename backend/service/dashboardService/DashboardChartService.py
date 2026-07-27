from datetime import timedelta
from django.utils import timezone
from django.db.models import Sum
from finance.models import Transaction
from datetime import timedelta, datetime
from hr.models import Attendance


class DashboardChartService:

    @classmethod
    def get_minimal_chart_data(cls, user):
        today = timezone.now().date()

        if user.role == 'Finance Manager':
            return cls._get_finance_chart_data(today, user)


        elif user.role == 'HR Manager':
            return cls._get_hr_chart_data(today, user)

        return []

    @classmethod
    def _get_finance_chart_data(cls, today, user):
        chart_data = []


        # فرض بر این است که یوزر به مدل Employee متصل است
        manager_department = user.employee.department

        for i in range(6, -1, -1):
            target_date = today - timedelta(days=i)
            date_str = target_date.strftime("%Y-%m-%d")


            result = Transaction.objects.filter(
                date=target_date,
                payslip__employee__department=manager_department
            ).aggregate(total=Sum('amount'))

            total_amount = result['total'] or 0

            chart_data.append({
                "date": date_str,
                "value": float(total_amount)
            })

        return chart_data



    @classmethod
    def _get_employee_chart_data(cls, today, user):
        chart_data = []
        employee = user.employee

        STD_DAILY_SECONDS = 8 * 3600

        for i in range(6, -1, -1):
            target_date = today - timedelta(days=i)
            date_str = target_date.strftime("%Y-%m-%d")

            attendance = Attendance.objects.filter(
                employee=employee,
                date=target_date,
                clock_in__isnull=False,
                clock_out__isnull=False
            ).first()

            overtime_hours = 0.0
            undertime_hours = 0.0

            if attendance:
                dt_in = datetime.combine(attendance.date, attendance.clock_in)
                dt_out = datetime.combine(attendance.date, attendance.clock_out)

                actual_seconds = (dt_out - dt_in).total_seconds()
                diff_seconds = actual_seconds - STD_DAILY_SECONDS


                if diff_seconds > 0:
                    overtime_hours = round(diff_seconds / 3600, 2)


                elif diff_seconds < 0:

                    undertime_hours = -round(abs(diff_seconds) / 3600, 2)

            chart_data.append({
                "date": date_str,
                "overtime": overtime_hours,
                "undertime": undertime_hours
            })

        return chart_data