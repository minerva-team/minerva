from django.db import models
from accounts.models import User
from .manager import ActiveEmployeeManager

# 1. Core Base Model (Abstract)
class BaseModel(models.Model):

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


# 2. HR Models
class Department(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['name']
        verbose_name = "Department"
        verbose_name_plural = "Departments"

    def __str__(self):
        return self.name


class Employee(BaseModel):
    user = models.OneToOneField(User, on_delete=models.PROTECT, related_name='employee_profile')
    department = models.ForeignKey(Department, on_delete=models.PROTECT, null=True, blank=True, related_name='employees')
    employee_code = models.CharField(max_length=20, unique=True)
    national_id = models.CharField(max_length=10, unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    hire_date = models.DateField()
    is_deleted = models.BooleanField(default=False)
    
    objects = models.Manager()
    active_employees = ActiveEmployeeManager()
    
    class Meta:
        ordering = ['-hire_date']
        verbose_name = "Employee"
        verbose_name_plural = "Employees"
        indexes = [
            models.Index(fields=['is_deleted']), 
        ]

    def __str__(self):
        return f"{self.user.email} ({self.employee_code})"


class Contract(BaseModel):
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

    class Meta:
        ordering = ['-is_active', '-start_date']
        get_latest_by = 'start_date'
        verbose_name = "Contract"
        verbose_name_plural = "Contracts"
        
        constraints = [  
            models.UniqueConstraint(
                fields=["employee"],
                condition=models.Q(is_active=True),
                name="unique_active_contract_per_employee",
            )
        ]
        indexes = [
            models.Index(fields=['employee', 'is_active']),
        ]

        
    def __str__(self):
        return f"{self.employee.employee_code} - {self.contract_type}"
    
    
class Attendance(BaseModel):
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
    
    class Meta:
        ordering = ['-date', 'employee']
        get_latest_by = 'date'
        verbose_name = "Attendance"
        verbose_name_plural = "Attendances"
        
        constraints = [
            models.UniqueConstraint(
                fields=["employee", "date"],
                name="unique_daily_attendance",
            )
        ]
        indexes = [
            models.Index(fields=['employee', 'date']),
            models.Index(fields=['status', 'date']),
        ]
        
    def __str__(self):
        return f"{self.employee.employee_code} - {self.date}"
        
        
class LeaveType(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    is_paid = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = "Leave Type"
        verbose_name_plural = "Leave Types"
    
    def __str__(self):
        return self.name
    

class LeaveRequest(BaseModel):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.PROTECT, related_name='leave_requests')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.PROTECT)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Pending')
    reason = models.TextField(null=True, blank=True)
    approved_by = models.ForeignKey(Employee, on_delete=models.PROTECT, null=True, blank=True, related_name='approved_leaves')

    class Meta:
        ordering = ['-created_at']
        get_latest_by = 'created_at'
        verbose_name = "Leave Request"
        verbose_name_plural = "Leave Requests"
        
        constraints = [
            models.CheckConstraint(
                condition=models.Q(end_date__gte=models.F('start_date')),
                name="check_leave_end_date_after_start_date"
            )
        ]
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['employee', 'status']),
        ]


    def __str__(self):
        return f"{self.employee.employee_code} - {self.leave_type} - {self.status}"