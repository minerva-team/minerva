from rest_framework import serializers
from django.db import transaction
from accounts.models import User
from hr.models import Department, Employee, Contract, ContractType, Attendance, LeaveType, LeaveRequest

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'created_at']

class EmployeeListSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    phone_number = serializers.CharField(source='user.phone_number', read_only=True)
    
    class Meta:
        model = Employee
        fields = ['id', 'email','phone_number' ,'employee_code', 'national_id', 'department', 'department_name', 'hire_date', 'is_deleted']

class EmployeeRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    phone_number = serializers.CharField(max_length=15)
    first_name = serializers.CharField(max_length=50)
    last_name = serializers.CharField(max_length=50)
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES)
    
    department = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all(), required=False, allow_null=True)
    employee_code = serializers.CharField(max_length=20)
    national_id = serializers.CharField(max_length=10)
    hire_date = serializers.DateField()

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value
    
    def validate_phone_number(self, value):
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("This phone number is already registered.")
        return value
    
    def validate_employee_code(self, value):
        if Employee.objects.filter(employee_code=value).exists():
            raise serializers.ValidationError("This employee code is already in use.")
        return value

    def validate_national_id(self, value):
        if Employee.objects.filter(national_id=value).exists():
            raise serializers.ValidationError("This national ID is already registered.")
        return value

    def create(self, validated_data):
        with transaction.atomic():
            user = User.objects.create_user(
                email=validated_data['email'],
                phone_number=validated_data['phone_number'],
                password=validated_data['password'],
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name'],
                role=validated_data['role']
            )
            employee = Employee.objects.create(
                user=user,
                department=validated_data.get('department'),
                employee_code=validated_data['employee_code'],
                national_id=validated_data['national_id'],
                hire_date=validated_data['hire_date']
            )
        return employee

class ContractTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContractType
        fields = '__all__'
class ContractSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contract
        fields = '__all__'

    def validate(self, attrs):
        employee = attrs.get('employee', self.instance.employee if self.instance else None)
        is_active = attrs.get('is_active', self.instance.is_active if self.instance else True)
        
        queryset = Contract.objects.filter(employee=employee, is_active=True)

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if is_active and queryset.exists():
            raise serializers.ValidationError({
                "is_active": "An active contract already exists for this employee. Deactivate it first."
            })
        return attrs

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'
        
        read_only_fields = ['employee']
        

    def validate(self, attrs):
        request = self.context.get('request')
        date = attrs.get('date')

        if request and hasattr(request.user, 'employee_profile'):
            employee = request.user.employee_profile
            
            if Attendance.objects.filter(employee=employee, date=date).exists():
                raise serializers.ValidationError(
                    {"date": "Attendance for this date has already been recorded."}
                )
                
        return attrs

class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = '__all__'

class LeaveRequestHRSerializer(serializers.ModelSerializer):
    """
        Only for HRmanager
    """
    class Meta:
        model = LeaveRequest
        fields = '__all__'

    def validate(self, attrs):
        start_date = attrs.get("start_date", self.instance.start_date if self.instance else None)
        end_date = attrs.get("end_date", self.instance.end_date if self.instance else None)
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({
                "end_date": "End date cannot be before start date."
            })
        return attrs


class LeaveRequestEmployeeSerializer(serializers.ModelSerializer):
    """
        For Employee
    """
    class Meta:
        model = LeaveRequest
        fields = ['id', 'leave_type', 'start_date', 'end_date', 'reason']   
        read_only_fields = ['employee', 'status', 'approved_by']
