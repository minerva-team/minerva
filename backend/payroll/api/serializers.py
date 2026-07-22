from rest_framework import serializers
from payroll.models import PayrollConfig, Payslip

class PayrollConfigSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    contract_type_name = serializers.CharField(source='contract_type.name', read_only=True)

    class Meta:
        model = PayrollConfig
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class PayslipSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.email', read_only=True)
    employee_code = serializers.CharField(source='employee.employee_code', read_only=True)

    class Meta:
        model = Payslip
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']