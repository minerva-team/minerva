import weasyprint
from django.core.exceptions import ValidationError
from django.http import HttpResponse
from django.template.loader import render_to_string
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from hr.api.pagination import StandardResultsSetPagination
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from service.paymentService.PayslipPayment import PayslipPaymentService
from service.payrollService.PayrollReportService import PayrollReportService
from service.payslipService.MonthlyPayslipCalculator import MonthlyPayslipCalculator

from payroll.models import PayrollConfig, Payslip

from .permissions import IsFinanceManager, IsOwnerOrFinanceManager
from .serializers import PayrollConfigSerializer, PayslipSerializer


# ==========================================
# 1. Payroll Config API
# ==========================================
@extend_schema_view(
    list=extend_schema(summary="List Payroll Configurations"),
    retrieve=extend_schema(summary="Retrieve Payroll Configuration"),
    create=extend_schema(summary="Create Payroll Configuration"),
    update=extend_schema(summary="Full Update Payroll Configuration"),
    partial_update=extend_schema(summary="Partial Update Payroll Configuration"),
    destroy=extend_schema(summary="Delete Payroll Configuration")
)
class PayrollConfigViewSet(viewsets.ModelViewSet):
    queryset = PayrollConfig.objects.all()
    serializer_class = PayrollConfigSerializer
    permission_classes = [IsFinanceManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['department', 'contract_type']

# ==========================================
# 2. Payslip ViewSet (CRUD & Actions)
# ==========================================
@extend_schema_view( 
    list=extend_schema(
        summary="List Payslips (With Filters & Sorting)",
        description="Finance Managers see all payslips. Employees see only their own."
    ),
    retrieve=extend_schema(summary="Retrieve a Payslip Detail"),
    create=extend_schema(summary="Create New Payslip (Manual)"),
    update=extend_schema(summary="Full Update Payslip"),
    partial_update=extend_schema(summary="Partial Update Payslip"),
    destroy=extend_schema(summary="Delete Payslip")
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

    # ------------------------------------------
    # سرویس ۱: محاسبه فیش حقوقی (Action)
    # ------------------------------------------
    @extend_schema(
        summary="Calculate Monthly Payslip",
        description="Calculates and generates a Draft payslip for a specific employee.",
        request=OpenApiTypes.OBJECT, # در حالت حرفه‌ای می‌توانی یک Serializer مجزا برای ریکوئست بسازی
    )
    @action(detail=False, methods=['post'], url_path='calculate', permission_classes=[IsFinanceManager])
    def calculate_payslip(self, request):
        employee_id = request.data.get('employee_id')
        year = request.data.get('year')
        month = request.data.get('month')

        if not all([employee_id, year, month]):
            return Response(
                {"error": "پارامترهای employee_id, year و month الزامی هستند."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            payslip = MonthlyPayslipCalculator.calculate_for_employee(
                employee_id=employee_id, year=int(year), month=int(month)
            )
            serializer = self.get_serializer(payslip)
            return Response(
                {"message": "فیش حقوقی با موفقیت محاسبه شد.", "data": serializer.data},
                status=status.HTTP_201_CREATED
            )
        except ValidationError as e:
            return Response({"error": e.message}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # ------------------------------------------
    # سرویس ۲: پرداخت فیش حقوقی (Action)
    # ------------------------------------------
    @extend_schema(
        summary="Pay a Payslip",
        description="Marks a payslip as Paid and creates a financial transaction.",
        request=OpenApiTypes.OBJECT,
    )
    @action(detail=True, methods=['post'], url_path='pay', permission_classes=[IsFinanceManager])
    def pay_payslip(self, request, pk=None):
        category_id = request.data.get('category_id')
        description = request.data.get('description', f"پرداخت فیش حقوقی شماره {pk}")
        
        if not category_id:
            return Response(
                {"error": "شناسه دسته‌بندی مالی (category_id) الزامی است."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            transaction = PayslipPaymentService.process_payment(
                payslip_id=pk,
                category_id=category_id,
                description=description
            )
            return Response(
                {"message": "پرداخت با موفقیت انجام شد و تراکنش ثبت گردید.", "transaction_id": transaction.id},
                status=status.HTTP_200_OK
            )
        except ValidationError as e:
            return Response({"error": e.message}, status=status.HTTP_400_BAD_REQUEST)
    @extend_schema(
        summary="Download Payslip PDF",
        description="Generates and returns an official PDF version of the payslip.",
    )
    @action(detail=True, methods=['get'], url_path='download-pdf')
    def download_pdf(self, request, pk=None):
        payslip = self.get_object()

        html_string = render_to_string('payroll/payslip_pdf.html', {'payslip': payslip})

        pdf_file = weasyprint.HTML(string=html_string).write_pdf()

        response = HttpResponse(pdf_file, content_type='application/pdf')
        
        response['Content-Disposition'] = f'inline; filename="Minerva_Payslip_{payslip.year}_{payslip.month}.pdf"'
        
        response['Access-Control-Expose-Headers'] = 'Content-Disposition'
        
        return response

# ==========================================
# 3. Reports API (Standalone APIView)
# ==========================================
@extend_schema(
    summary="Pending Payslips Report",
    description="Returns a list of un-paid (Draft/Approved) payslips by department.",
    parameters=[
        OpenApiParameter(name="department_id", type=OpenApiTypes.INT, required=True),
        OpenApiParameter(name="year", type=OpenApiTypes.INT, required=False),
        OpenApiParameter(name="month", type=OpenApiTypes.INT, required=False),
    ]
)
class PendingPayslipsReportView(APIView):
    permission_classes = [IsFinanceManager]

    def get(self, request):
        department_id = request.query_params.get('department_id')
        year = request.query_params.get('year')
        month = request.query_params.get('month')

        if not department_id:
            return Response({"error": "پارامتر department_id در URL الزامی است."}, status=status.HTTP_400_BAD_REQUEST)

        payslips = PayrollReportService.get_pending_payslips_by_department(
            department=department_id, year=year, month=month
        )

        serializer = PayslipSerializer(payslips, many=True)
        return Response({"total_count": payslips.count(), "results": serializer.data})