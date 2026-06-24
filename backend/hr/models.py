from django.db import models
from accounts.models import User
from .manager import ActiveEmployeeManager
class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)    

    def __str__(self):
        return self.name
    
class Employee(models.Model):
    user = models.OneToOneField(User, on_delete=models.PROTECT, related_name='employee_profile')
    department = models.ForeignKey(Department, on_delete=models.PROTECT, null=True, blank=True, related_name='employees')
    employee_code = models.CharField(max_length=20, unique=True)
    national_id = models.CharField(max_length=10, unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    hire_date = models.DateField()
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at =models.DateTimeField(auto_now=True)
    
    objects = models.Manager()
    active_employees = ActiveEmployeeManager()
    
    def __str__(self):
        return self.employee_code