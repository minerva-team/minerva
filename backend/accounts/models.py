from django.contrib.auth.models import AbstractUser
from django.db import models
from .manager import UserManager

class User(AbstractUser):
    username = None

    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, unique=True, null=True, blank=True)
    
    ROLE_CHOICES = [
        ('Admin', 'Admin'),
        ('HR Manager', 'HR Manager'),
        ('Finance Manager', 'Finance Manager'),
        ('Employee', 'Employee'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['role']
    
    objects = UserManager()

    class Meta: 
        ordering = ['-created_at']
        verbose_name = 'User'
        verbose_name_plural = 'Users'


    def __str__(self):
        return self.email

class OTPVerification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    
    PURPOSE_CHOICES = [
        ('login', 'Login'),
        ('reset_password', 'Reset Password'),
    ]
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES)
    
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta: 
        ordering = ['-created_at']
        verbose_name = 'OTP Verification'
        verbose_name_plural = 'OTP Verifications'
        indexes = [
            models.Index(fields=['user', 'purpose', 'is_used']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.purpose}"