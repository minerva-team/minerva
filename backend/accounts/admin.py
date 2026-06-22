from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, OTPVerification

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'role', 'is_active', 'created_at']
    search_fields = ['email', 'phone_number']
    ordering = ['-created_at']
    list_filter = ['role', 'is_active']
    
@admin.register(OTPVerification)
class OTPVerificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'purpose', 'is_used', 'expires_at']
    search_fields = ['user__email']
    list_filter = ['purpose', 'is_used']