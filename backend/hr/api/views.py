from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse # type: ignore

from hr.models import Department, Employee, Contract, Attendance, LeaveType, LeaveRequest
from .permissions import IsHRManagerRole
from . import serializers

# Base ViewSet
class HRBaseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsHRManagerRole]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]


# HR ViewSets
class DepartmentViewSet(HRBaseViewSet):
    queryset = Department.objects.all()
    serializer_class = serializers.DepartmentSerializer
    filterset_fields = ['name']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']


@extend_schema_view(
    create=extend_schema(
        summary="Onboard New Employee",
        description="Create User account and Employee record simultaneously using atomic transaction.",
        responses={201: serializers.EmployeeListSerializer, 400: OpenApiResponse(description="Validation error")}
    ),
    list=extend_schema(summary="List Active Employees", description="Get list of employees. Deleted employees (is_deleted=True) are not shown.")
)
class EmployeeViewSet(HRBaseViewSet):
    filterset_fields = ['department']
    search_fields = ['employee_code', 'national_id', 'user__email', 'user__first_name', 'user__last_name']
    ordering_fields = ['hire_date', 'created_at']

    def get_queryset(self):
        return Employee.active_employees.select_related('user', 'department')

    def get_serializer_class(self):
        if self.action == 'create':
            return serializers.EmployeeRegistrationSerializer
        return serializers.EmployeeListSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        employee = serializer.save()
        output_serializer = serializers.EmployeeListSerializer(employee)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


@extend_schema_view(
    create=extend_schema(
        summary="Create Contract",
        description="Create new contract. System checks that duplicate active contracts are not created.",
        responses={400: OpenApiResponse(description="An active contract exists for this employee.")}
    )
)
class ContractViewSet(HRBaseViewSet):
    queryset = Contract.objects.select_related('employee', 'employee__user').all()
    serializer_class = serializers.ContractSerializer
    filterset_fields = ['employee', 'is_active', 'contract_type']
    ordering_fields = ['start_date', 'base_salary']


@extend_schema_view(
    create=extend_schema(
        summary="Log Attendance",
        description="Record attendance. Combination of employee and date must be unique.",
        responses={400: OpenApiResponse(description="Attendance for this date has already been recorded.")}
    )
)
class AttendanceViewSet(HRBaseViewSet):
    queryset = Attendance.objects.select_related('employee', 'employee__user').all()
    serializer_class = serializers.AttendanceSerializer
    filterset_fields = ['employee', 'status', 'date']
    ordering_fields = ['date']


class LeaveTypeViewSet(HRBaseViewSet):
    queryset = LeaveType.objects.all()
    serializer_class = serializers.LeaveTypeSerializer
    filterset_fields = ['is_paid']
    search_fields = ['name']


@extend_schema_view(
    create=extend_schema(
        summary="Submit Leave Request",
        description="Statuses include Pending, Approved, Rejected. System checks that end date is not before start date."
    )
)
class LeaveRequestViewSet(HRBaseViewSet):
    queryset = LeaveRequest.objects.select_related(
        'employee',
        'employee__user', 
        'leave_type',
        'approved_by',
        'approved_by__user'
        ).all()
    serializer_class = serializers.LeaveRequestSerializer
    filterset_fields = ['employee', 'status', 'leave_type']
    ordering_fields = ['start_date', 'created_at']