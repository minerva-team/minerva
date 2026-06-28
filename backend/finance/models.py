from django.db import models
from hr.models import BaseModel
from payroll.models import Payslip

# ==========================================
# 1. Category Model 
# ==========================================
class Category(BaseModel):
    TYPE_CHOICES = [
        ('Income', 'Income'),
        ('Expense', 'Expense'),
    ]    

    name = models.CharField(max_length=100, unique=True)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ['type', 'name']
        indexes = [
            models.Index(fields=['type']),
        ]

    def __str__(self):
        return f"{self.get_type_display()} - {self.name}"
    

# ==========================================
# 2. Transaction Model 
# ==========================================
class Transaction(BaseModel):
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='transactions')
    
    payslip = models.OneToOneField(
        Payslip, 
        on_delete=models.PROTECT, 
        null=True, 
        blank=True,
        related_name='financial_transaction'
    )
    
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.CharField(max_length=255, null=True, blank=True)
    date = models.DateField()

    class Meta:
        verbose_name = "Transaction"
        verbose_name_plural = "Transactions"
        ordering = ['-date', '-id']
        

        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['category', 'date']),
        ]

    def __str__(self):
        return f"{self.category.name} | {self.amount} | {self.date}"