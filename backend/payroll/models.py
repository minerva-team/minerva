from django.db import models


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