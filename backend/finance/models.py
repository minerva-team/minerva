from django.db import models
from payroll.models import Payslip

class Category(models.Model):
    TYPE_CHOICES = [
        ('Income', 'Income'),
        ('Expense', 'Expense'),
    ]    

    name = models.CharField(max_length=100, unique=True)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)


    def __str__(self):
        return f"{self.name} - {self.type}"
    

class Transaction(models.Model):
    category = models.ForeignKey(Category, on_delete=models.PROTECT)
    payslip = models.OneToOneField(Payslip, on_delete=models.PROTECT, null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.CharField(max_length=255, null=True, blank=True)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.category} - {self.amount} - {self.date}"