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
    

class Contract(models.Model):
    CONTRACT_TYPE_CHOICES = [
        ('Full-time', 'Full-time'),
        ('Part-time', 'Part-time'),
        ('Hourly', 'Hourly'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.PROTECT)
    contract_type = models.CharField(max_length=20, choices=CONTRACT_TYPE_CHOICES)
    base_salary = models.DecimalField(max_digits=12, decimal_places=2)
    housing_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    transport_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        constraints = [  
            models.UniqueConstraint(
            fields=["employee"],
            condition=models.Q(is_active=True),
            name="unique_active_contract_per_employee",
            )
        ]
        
    def __str__(self):
        return f"{self.employee} - {self.contract_type}"
    
    
class Attendance(models.Model):
    STATUS_CHOICES = [
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('On Leave', 'On Leave'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.PROTECT)
    date = models.DateField()
    clock_in = models.TimeField(null=True, blank=True)
    clock_out = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["employee", "date"],
                name="unique_daily_attendance",
            )
        ]
        
    def __str__(self):
        return f"{self.employee} - {self.date}"
        
        
class LeaveType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    is_paid = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name