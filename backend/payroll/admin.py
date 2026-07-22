from django.contrib import admin
from .models import PayrollConfig, Payslip

@admin.register(PayrollConfig)
class PayrollConfigAdmin(admin.ModelAdmin):
    list_display = [
        '__str__', 'department', 'contract_type', 
        'standard_start_time', 'standard_end_time', 
        'lateness_multiplier', 'overtime_multiplier'
    ]
    list_filter = ['department', 'contract_type']

@admin.register(Payslip)
class PayslipAdmin(admin.ModelAdmin):
    list_display = ['employee', 'year', 'month', 'net_salary', 'status']
    search_fields = ['employee__user__email', 'employee__employee_code']
    list_filter = ['year', 'month', 'status']
    ordering = ['-year', '-month']