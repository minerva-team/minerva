from django.utils import timezone
from payroll.models import Payslip

class PayrollReportService:

    @classmethod
    def get_pending_payslips_by_department(cls, department, year=None, month=None):

        if not year or not month:
            today = timezone.now().date()
            year = year or today.year
            month = month or today.month


        pending_payslips = Payslip.objects.filter(
            employee__department=department,
            year=year,
            month=month,
            status__in=['Draft', 'Approved']
        ).select_related('employee__user')

        return pending_payslips