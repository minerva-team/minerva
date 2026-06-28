from rest_framework import viewsets, generics, filters
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse
from .serializers import PayrollConfigSerializer, PayslipSerializer
from payroll.models import PayrollConfig, Payslip
from .permissions import IsFinanceManager, IsOwnerOrFinanceManager
from django_filters.rest_framework import DjangoFilterBackend
from hr.api.pagination import StandardResultsSetPagination

# ==========================================
# 1. Payroll Config API (Singleton)
# ==========================================
@extend_schema_view(
    get=extend_schema(
        summary="Retrieve Payroll Configuration",
        description="Returns the global payroll settings (Tax, Insurance, and Overtime multiplier). If no configuration exists, it initializes with default zero values.",
        responses={200: PayrollConfigSerializer}
    ),
    put=extend_schema(
        summary="Full Update Payroll Configuration",
        description="Updates all fields of the global payroll configuration. Only accessible by Finance Managers.",
        responses={200: PayrollConfigSerializer}
    ),
    patch=extend_schema(
        summary="Partial Update Payroll Configuration",
        description="Updates specific fields of the global payroll configuration. Only accessible by Finance Managers.",
        responses={200: PayrollConfigSerializer}
    )
)
class PayrollConfigAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = PayrollConfigSerializer
    permission_classes = [IsFinanceManager]

    def get_object(self):
        obj, created = PayrollConfig.objects.get_or_create(
            id=1, 
            defaults={
                'tax_rate': 0.0, 
                'insurance_rate': 0.0, 
                'overtime_multiplier': 1.0
            }
        )
        return obj

# ==========================================
# 2. Payslip ViewSet (CRUD)
# ==========================================
@extend_schema_view( 
    list=extend_schema(
            summary="List Payslips (With Filters & Sorting)",
            description="""
            Finance Managers see all payslips. Employees see only their own.
            
            **Advanced Features for Frontend:**
            * **Filtering:** Use `?year=1403&month=2` to get specific periods.
            * **Searching:** Use `?search=Name` to search by email or employee code.
            * **Ordering:** Use `?ordering=-net_salary` to sort highest paid first.
            """,
        ),
    retrieve=extend_schema(
        summary="Retrieve a Payslip Detail",
        description="Fetch a single payslip by its ID. Object-level permission checks ensure employees cannot access others' data.",
    ),
    create=extend_schema(
        summary="Create New Payslip",
        description="Generates a new payslip for an employee. Restricted to Finance Managers.",
    ),
    update=extend_schema(
        summary="Full Update Payslip",
        description="Modify all details of an existing payslip. Restricted to Finance Managers.",
    ),
    partial_update=extend_schema(
        summary="Partial Update Payslip",
        description="Modify specific fields of an existing payslip. Restricted to Finance Managers.",
    ),
    destroy=extend_schema(
        summary="Delete Payslip",
        description="Permanently deletes a payslip record from the system. Restricted to Finance Managers.",
    )
)
class PayslipViewSet(viewsets.ModelViewSet):
    serializer_class = PayslipSerializer
    permission_classes = [IsOwnerOrFinanceManager]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['year', 'month', 'status', 'employee']
    search_fields = ['employee__user__email', 'employee__employee_code']
    ordering_fields = ['year', 'month', 'net_salary', 'created_at']
    ordering = ['-year', '-month'] 

    def get_queryset(self):
        user = self.request.user
        base_queryset = Payslip.objects.select_related('employee__user').all()

        if user.role in ['Finance Manager', 'Admin']:
            return base_queryset
        elif hasattr(user, 'employee_profile'):
            return base_queryset.filter(
                employee=user.employee_profile,
                status__in=['Approved', 'Paid']
            )
        return Payslip.objects.none()