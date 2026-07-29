
from django.db import models
from hr.models import Employee, Department, ContractType, BaseModel
    
class PayrollConfig(BaseModel):
    department = models.ForeignKey(Department, on_delete=models.CASCADE, null=True, blank=True, related_name='payroll_configs')
    contract_type = models.ForeignKey(ContractType, on_delete=models.CASCADE, null=True, blank=True, related_name='payroll_configs')
    
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2)
    insurance_rate = models.DecimalField(max_digits=5, decimal_places=2)
    
    standard_start_time = models.TimeField(help_text="Expected clock-in time")
    standard_end_time = models.TimeField(help_text="Expected clock-out time")
    
    lateness_multiplier = models.DecimalField(max_digits=5, decimal_places=2, default=1.00, help_text="Multiplier for undertime/lateness penalty")
    overtime_multiplier = models.DecimalField(max_digits=5, decimal_places=2, help_text="Multiplier for overtime pay")

    class Meta:
        verbose_name = "Payroll Configuration"
        verbose_name_plural = "Payroll Configurations"

    def delete(self, *args, **kwargs):
        pass

    def __str__(self):
        parts = []
        if self.department:
            parts.append(f"Dep: {self.department.name}")
        if self.contract_type:
            parts.append(f"Type: {self.contract_type.name}")
            
        if not parts:
            return "Global Fallback Config"
            
        return " | ".join(parts)
class Payslip(BaseModel):
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Approved', 'Approved'),
        ('Paid', 'Paid'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.PROTECT, related_name='payslips')
    year = models.PositiveIntegerField()
    month = models.PositiveSmallIntegerField()
    
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Draft')
    
    gross_salary = models.DecimalField(max_digits=12, decimal_places=2)
    applied_tax_rate = models.DecimalField(max_digits=5, decimal_places=2)
    applied_insurance_rate = models.DecimalField(max_digits=5, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2)
    insurance_amount = models.DecimalField(max_digits=12, decimal_places=2)
    net_salary = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        ordering = ['-year', '-month']
        get_latest_by = ['year', 'month']
        verbose_name = "Payslip"
        verbose_name_plural = "Payslips"
        

        indexes = [
            models.Index(fields=['year', 'month']),
            models.Index(fields=['employee', 'status']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.employee.employee_code} - {self.year}/{self.month:02d}"