from rest_framework import serializers
from payroll.models import PayrollConfig, Payslip

class PayrollConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayrollConfig
        fields = '__all__'


class PayslipSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.email', read_only=True)
    employee_code = serializers.CharField(source='employee.employee_code', read_only=True)

    class Meta:
        model = Payslip
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']