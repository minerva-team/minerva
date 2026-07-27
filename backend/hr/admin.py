from django.contrib import admin
from django.utils.html import format_html
from .models import *
from django.utils.safestring import mark_safe

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at")
    search_fields = ("name",)
    readonly_fields = ("created_at", "updated_at")

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = (
        "display_profile_picture", 
        "user", 
        "employee_code", 
        "job_title", 
        "department", 
        "phone", 
        "is_deleted"
    )
    list_display_links = ("display_profile_picture", "user", "employee_code")
    search_fields = (
        "employee_code", 
        "national_id", 
        "job_title", 
        "user__email", 
        "user__first_name", 
        "user__last_name"
    )
    list_filter = ("department", "gender", "is_deleted", "hire_date")
    autocomplete_fields = ("user", "department", "reports_to")
    date_hierarchy = "hire_date"

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

    def display_profile_picture(self, obj):
        if obj.profile_picture:
            return format_html(
                '<img src="{}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />',
                obj.profile_picture.url
            )
        return mark_safe(
            '<div style="width: 40px; height: 40px; border-radius: 50%; background-color: #333; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px;">N/A</div>'
        )
    display_profile_picture.short_description = "Avatar"

@admin.register(EmployeeDocument)
class EmployeeDocumentAdmin(admin.ModelAdmin):
    list_display = ("title", "employee", "document_type", "created_at")
    list_filter = ("document_type", "created_at")
    search_fields = ("title", "employee__employee_code", "employee__user__email")
    autocomplete_fields = ("employee",)
    readonly_fields = ("created_at", "updated_at")
    date_hierarchy = "created_at"
    ordering = ("-created_at",)
    
    fieldsets = (
        (
            "Document Information",
            {
                "fields": (
                    "employee",
                    "document_type",
                    "title",
                    "file",
                )
            },
        ),
        (
            "Audit Information",
            {
                "classes": ("collapse",),
                "fields": (
                    "created_at",
                    "updated_at",
                ),
            },
        ),
    )


@admin.register(ContractType)
class ContractTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at")
    search_fields = ("name",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ("employee", "contract_type", "base_salary", "start_date", "is_active")
    search_fields = ("employee__employee_code", "employee__user__email")
    list_filter = ("contract_type", "is_active", "start_date")
    date_hierarchy = "start_date"
    list_editable = ("is_active",) 
    autocomplete_fields = ("employee", "contract_type")


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ("employee", "date", "clock_in", "clock_out", "status")
    search_fields = ("employee__employee_code", "employee__user__email")
    list_filter = ("status", "date")
    date_hierarchy = "date"
    autocomplete_fields = ("employee",)


@admin.register(LeaveType)
class LeaveTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "is_paid")
    list_filter = ("is_paid",)
    list_editable = ("is_paid",)
    search_fields = ("name",)


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ("employee", "leave_type", "status", "start_date", "end_date")
    search_fields = ("employee__employee_code", "employee__user__email")
    list_filter = ("status", "leave_type", "start_date")
    date_hierarchy = "start_date"
    autocomplete_fields = ("employee", "leave_type", "approved_by")
    readonly_fields = ("created_at", "updated_at")