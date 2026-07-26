from django.contrib import admin
from .models import *

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']
    
@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ["user", "employee_code", "job_title", "department", "reports_to", "phone", "is_deleted"]
    search_fields = [ "employee_code", "national_id", "job_title", "user__email", "user__first_name", "user__last_name"]
    list_filter = [ "department", "gender", "is_deleted", "hire_date"]
    autocomplete_fields = ["user", "department", "reports_to",]

    fieldsets = (
        (
            "Account and Employment",
            {
                "fields": (
                    "user",
                    "employee_code",
                    "department",
                    "job_title",
                    "reports_to",
                    "hire_date",
                    "is_deleted",
                )
            },
        ),
        (
            "Personal Information",
            {
                "fields": (
                    "profile_picture",
                    "national_id",
                    "gender",
                    "date_of_birth",
                    "phone",
                    "address",
                )
            },
        ),
        (
            "Emergency Contact",
            {
                "fields": (
                    "emergency_contact_name",
                    "emergency_contact_phone",
                    "emergency_contact_relationship",
                )
            },
        ),
    )
@admin.register(ContractType)
class ContractTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']
    
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