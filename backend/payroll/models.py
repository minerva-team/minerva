from django.db import models
from hr.models import Employee

class PayrollConfig(models.Model):
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2)
    insurance_rate = models.DecimalField(max_digits=5, decimal_places=2)
    overtime_multiplier = models.DecimalField(max_digits=5, decimal_places=2)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=models.Q(id=1),
                name="payrollconfig_singleton_check"
            )
        ]

    def __str__(self):
        return "Payroll Configuration"
    
    
class Payslip(models.Model):
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Approved', 'Approved'),
        ('Paid', 'Paid'),
    ]
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Draft')
    
    employee = models.ForeignKey(Employee, on_delete=models.PROTECT)
    year = models.PositiveIntegerField()
    month = models.PositiveSmallIntegerField()
    gross_salary = models.DecimalField(max_digits=12, decimal_places=2)
    applied_tax_rate = models.DecimalField(max_digits=5, decimal_places=2)
    applied_insurance_rate = models.DecimalField(max_digits=5, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2)
    insurance_amount = models.DecimalField(max_digits=12, decimal_places=2)
    net_salary = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["employee", "year", "month"],
                name="unique_payslip_per_period",
            )
        ]

    def __str__(self):
        return f"{self.employee.user.email} - {self.year}/{self.month}"