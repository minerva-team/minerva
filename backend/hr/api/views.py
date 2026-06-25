from rest_framework import viewsets, status
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse # type: ignore
from hr.models import Department, Employee, Contract, Attendance, LeaveType, LeaveRequest
from .permissions import IsHRManagerRole
from . import serializers

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = serializers.DepartmentSerializer
    permission_classes = [IsHRManagerRole]

@extend_schema_view(
    create=extend_schema(
        summary="Onboard New Employee",
        description="Create User account and Employee record simultaneously using atomic transaction.",
        responses={201: serializers.EmployeeListSerializer, 400: OpenApiResponse(description="Validation error")}
    ),
    list=extend_schema(summary="List Active Employees", description="Get list of employees. Deleted employees (is_deleted=True) are not shown.")
)
class EmployeeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsHRManagerRole]

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
class ContractViewSet(viewsets.ModelViewSet):
    queryset = Contract.objects.all()
    serializer_class = serializers.ContractSerializer
    permission_classes = [IsHRManagerRole]

@extend_schema_view(
    create=extend_schema(
        summary="Log Attendance",
        description="Record attendance. Combination of employee and date must be unique.",
        responses={400: OpenApiResponse(description="Attendance for this date has already been recorded.")}
    )
)
class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = serializers.AttendanceSerializer
    permission_classes = [IsHRManagerRole]

class LeaveTypeViewSet(viewsets.ModelViewSet):
    queryset = LeaveType.objects.all()
    serializer_class = serializers.LeaveTypeSerializer
    permission_classes = [IsHRManagerRole]

@extend_schema_view(
    create=extend_schema(
        summary="Submit Leave Request",
        description="Statuses include Pending, Approved, Rejected. System checks that end date is not before start date."
    )
)
class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = serializers.LeaveRequestSerializer
    permission_classes = [IsHRManagerRole]
