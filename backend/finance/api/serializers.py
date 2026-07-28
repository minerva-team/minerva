from rest_framework import serializers
from finance.models import Category, Transaction

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'type', 'created_at', 'updated_at']


class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_type = serializers.CharField(source='category.type', read_only=True)
    
    # employee_code = serializers.CharField(source='payslip.employee.employee_code', read_only=True, allow_null=True)
    # payslip_month = serializers.IntegerField(source='payslip.month', read_only=True, allow_null=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'category', 'category_name', 'category_type',
            'payslip', 'amount', 'description', 'date',
            'created_at', 'updated_at'
        ]

    def validate_amount(self, value):
        """جلوگیری از ثبت تراکنش با مبلغ صفر یا منفی"""
        if value <= 0:
            raise serializers.ValidationError("مبلغ تراکنش باید بیشتر از صفر باشد.")
        return value