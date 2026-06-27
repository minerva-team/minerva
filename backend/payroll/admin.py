from django.contrib import admin
from django.shortcuts import redirect
from .models import PayrollConfig, Payslip


@admin.register(PayrollConfig)
class PayrollConfigAdmin(admin.ModelAdmin):
    list_display = ['tax_rate', 'insurance_rate', 'overtime_multiplier', 'updated_at']

    def has_add_permission(self, request):
        return not PayrollConfig.objects.exists()


@admin.register(Payslip)
class PayslipAdmin(admin.ModelAdmin):
    list_display = ['employee', 'year', 'month', 'net_salary', 'status']
    search_fields = ['employee__user__email', 'employee__employee_code']
    list_filter = ['year', 'month', 'status']
    ordering = ['-year', '-month']
