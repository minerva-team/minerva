from django.contrib import admin
from .models import *

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']
    
@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['user', 'employee_code', 'national_id', 'is_deleted']
    search_fields = ['employee_code', 'national_id']
    list_filter = ['is_deleted', 'department']
    
@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ['employee', 'contract_type', 'base_salary', 'is_active']
    search_fields = ['employee__employee_code']
    list_filter = ['contract_type', 'is_active']
    
@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['employee', 'date', 'status']
    search_fields = ['employee__employee_code']
    list_filter = ['status']
    
@admin.register(LeaveType)
class LeaveTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_paid']
    list_filter = ['is_paid']
    
@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ['employee', 'leave_type', 'status', 'start_date']
    search_fields = ['employee__employee_code']
    list_filter = ['status', 'leave_type']