from django.contrib import admin
from .models import *

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'type']
    search_fields = ['name']
    list_filter = ['type']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['category', 'amount', 'date']
    search_fields = ['category__name', 'description']
    list_filter = ['category__type']
    ordering = ['-date']

