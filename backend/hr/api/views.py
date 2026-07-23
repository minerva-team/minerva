from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend # type: ignore
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse # type: ignore
from django.utils import timezone

from hr.models import Department, Employee, Contract, ContractType, Attendance, LeaveType, LeaveRequest
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
    list=extend_schema(
        summary="List Contract Types",
        description="Get a list of all defined contract types (e.g., Full-time, Part-time, Hourly)."
    ),
    retrieve=extend_schema(
        summary="Retrieve Contract Type Detail",
        description="Fetch details of a specific contract type by its ID."
    ),
    create=extend_schema(
        summary="Create New Contract Type",
        description="Define a new contract type for the enterprise."
    ),
    update=extend_schema(
        summary="Full Update Contract Type",
        description="Modify all fields of an existing contract type."
    ),
    partial_update=extend_schema(
        summary="Partial Update Contract Type",
        description="Modify specific fields of an existing contract type."
    ),
    destroy=extend_schema(
        summary="Delete Contract Type",
        description="Permanently remove a contract type record."
    )
)
class ContractTypeViewSet(HRBaseViewSet):
    queryset = ContractType.objects.all()
    serializer_class = serializers.ContractTypeSerializer
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']    


@extend_schema_view(
    create=extend_schema(
        summary="Create Contract",
        description="Create new contract. System checks that duplicate active contracts are not created.",
        responses={400: OpenApiResponse(description="An active contract exists for this employee.")}
    )
)
class ContractViewSet(HRBaseViewSet):
    queryset = Contract.objects.select_related('employee', 'employee__user', 'contract_type').all()
    serializer_class = serializers.ContractSerializer
    filterset_fields = ['employee', 'is_active', 'contract_type']
    ordering_fields = ['start_date', 'base_salary']


@extend_schema_view(
    create=extend_schema(
        summary="Log Attendance (Clock-In)",
        description="Record morning attendance. Combination of employee and date must be unique. Frontend does not need to send employee_id.",
        responses={400: OpenApiResponse(description="Attendance for this date has already been recorded.")}
    )
)
class AttendanceViewSet(HRBaseViewSet):
    """
    Handles CRUD operations for Attendance.
    Employees can only view their own attendance records. HR has full access.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = serializers.AttendanceSerializer
    filterset_fields = ['status', 'date']
    ordering_fields = ['date']

    def get_queryset(self):
        """
        Filters attendance data. HR sees all, employees see only their own.
        """
        user = self.request.user
        queryset = Attendance.objects.select_related('employee', 'employee__user').all()
        
        if user.role in ['HR Manager', 'Admin']:
            return queryset
            
        return queryset.filter(employee__user=user)
        
    def perform_create(self, serializer):
        """
        Ensures employees can only log attendance for themselves.
        """
        user = self.request.user
        if user.role == 'Employee':
            serializer.save(employee=user.employee_profile)
        else:
            serializer.save()

    @extend_schema(
        summary="Clock-Out", 
        description="Automatically finds today's attendance record for the logged-in employee and sets the clock_out time."
    )
    @action(detail=False, methods=['post'], url_path='clock-out')
    def clock_out(self, request):
        user = request.user
        
        # چک کردن داشتن پروفایل کارمندی
        if not hasattr(user, 'employee_profile'):
            return Response(
                {"detail": "Only employees with active profiles can clock out."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        today = timezone.now().date()
        current_time = timezone.now().time()

        attendance = Attendance.objects.filter(
            employee=user.employee_profile, 
            date=today
        ).first()

        if not attendance:
            return Response(
                {"detail": "No attendance record found for today. Please clock in first."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if attendance.clock_out:
            return Response(
                {"detail": "Clock-out time has already been recorded for today."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        attendance.clock_out = current_time
        attendance.save()

        return Response(
            {"detail": "Clock-out recorded successfully.", "clock_out": current_time}, 
            status=status.HTTP_200_OK
        )
class LeaveTypeViewSet(HRBaseViewSet):
    queryset = LeaveType.objects.all()
    serializer_class = serializers.LeaveTypeSerializer
    filterset_fields = ['is_paid']
    search_fields = ['name']
     
    pagination_class = None  # Disable pagination for LeaveType


@extend_schema_view(
    create=extend_schema(
        summary="Submit Leave Request",
        description="Statuses include Pending, Approved, Rejected. System checks that end date is not before start date."
    )
)


class LeaveRequestViewSet(HRBaseViewSet):
    """
    Handles CRUD operations for Leave Requests.
    Implements role-based access control (RBAC) to ensure employees 
    can only view and create their own requests, while HR has full access.
    """
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'leave_type']
    ordering_fields = ['start_date', 'created_at']

    def get_queryset(self):
        """
        Filters the dataset based on the user's role.
        HR/Admins see all records. Employees see only their own.
        """
        user = self.request.user
        
        queryset = LeaveRequest.objects.select_related(
            'employee', 'employee__user', 'leave_type', 'approved_by', 'approved_by__user'
        ).all()
        
        if user.role in ['HR Manager', 'Admin']:
            return queryset
            
        return queryset.filter(employee__user=user)
        
    def perform_create(self, serializer):
        """
        Overrides the default save method to inject the employee instance.
        Prevents regular employees from submitting leaves for other colleagues.
        """
        user = self.request.user
        
        if user.role == 'Employee':
            serializer.save(employee=user.employee_profile)
        else:
            serializer.save()

    def get_serializer_class(self):
        """
        Dynamically assigns a serializer based on the user's role.
        Employees get a restricted form, HR gets full access.
        """
        if self.request.user and self.request.user.is_authenticated:
            if self.request.user.role in ['HR Manager', 'Admin']:
                return serializers.LeaveRequestHRSerializer
                
        return serializers.LeaveRequestEmployeeSerializer