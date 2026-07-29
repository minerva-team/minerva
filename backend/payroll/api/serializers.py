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
    employee_name = serializers.SerializerMethodField()
    employee_code = serializers.CharField(source='employee.employee_code', read_only=True)

    class Meta:
        model = Payslip
        fields = '__all__'

    def get_employee_name(self, obj):
        first_name = obj.employee.user.first_name
        last_name = obj.employee.user.last_name
        
        if first_name or last_name:
            return f"{first_name} {last_name}".strip()
        return "کاربر بدون نام"