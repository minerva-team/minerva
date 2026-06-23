from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, OTPVerification

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'role', 'is_active', 'created_at']
    search_fields = ['email', 'phone_number']
    ordering = ['-created_at']
    list_filter = ['role', 'is_active']
    readonly_fields = ['last_login', 'date_joined', 'created_at', 'updated_at']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone_number', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important Dates', {'fields': ('last_login', 'date_joined', 'created_at', 'updated_at')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'phone_number', 'role', 'password')}
        ),
    )
    
@admin.register(OTPVerification)
class OTPVerificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'purpose', 'is_used', 'expires_at']
    search_fields = ['user__email']
    list_filter = ['purpose', 'is_used']