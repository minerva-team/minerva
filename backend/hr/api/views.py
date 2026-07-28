from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from pydantic_core import ValidationError  # type: ignore
from drf_spectacular.utils import (  # type: ignore
    OpenApiResponse,
    extend_schema,
    extend_schema_view,
    inline_serializer,
)
from rest_framework import filters, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from hr.models import (
    Attendance,
    Contract,
    ContractType,
    Department,
    Employee,
    EmployeeDocument,
    LeaveRequest,
    LeaveType,
)

from . import serializers as local_serializers
from .permissions import IsHRManagerRole
from service.payslipService.MonthlyPayslipCalculator import MonthlyPayslipCalculator
# ==========================================
# Base ViewSet
# ==========================================
class HRBaseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsHRManagerRole]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]


# ==========================================
# HR ViewSets
# ==========================================
class DepartmentViewSet(HRBaseViewSet):
    queryset = Department.objects.all()
    serializer_class = local_serializers.DepartmentSerializer
    filterset_fields = ['name']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']


@extend_schema_view(
    list=extend_schema(
        summary="List Active Employees (لیست کارمندان)", 
        description="دریافت لیست تمامی پرسنل فعال. کارمندانی که حذف منطقی شده‌اند (is_deleted=True) در این لیست نمایش داده نمی‌شوند.",
        tags=["Employees"]
    ),
    retrieve=extend_schema(
        summary="Employee Detail (جزئیات کارمند)",
        description="دریافت اطلاعات کامل یک کارمند خاص با استفاده از شناسه (ID) آن.",
        tags=["Employees"]
    ),
    create=extend_schema(
        summary="Onboard New Employee (استخدام کارمند جدید)",
        description="ساخت همزمان حساب کاربری (User) و پروفایل کارمندی (Employee) در یک تراکنش امن (Atomic Transaction).",
        responses={
            201: local_serializers.EmployeeListSerializer, 
            400: OpenApiResponse(description="خطای اعتبارسنجی داده‌ها (Validation Error)")
        },
        tags=["Employees"]
    ),
    update=extend_schema(
        summary="Update Employee (ویرایش کامل)",
        description="جایگزینی و ویرایش کامل اطلاعات پروفایل یک کارمند.",
        tags=["Employees"]
    ),
    partial_update=extend_schema(
        summary="Partial Update (ویرایش جزئی)",
        description="بروزرسانی یک یا چند فیلد خاص از پروفایل کارمند (مثلاً فقط تغییر دپارتمان).",
        tags=["Employees"]
    ),
    destroy=extend_schema(
        summary="Delete Employee (حذف کارمند)",
        description="حذف کارمند از سیستم.",
        tags=["Employees"]
    )
)
class EmployeeViewSet(HRBaseViewSet):
    filterset_fields = ['department']
    search_fields = ['employee_code', 'national_id', 'user__email', 'user__first_name', 'user__last_name']
    ordering_fields = ['hire_date', 'created_at']

    def get_queryset(self):
        return Employee.active_employees.select_related('user', 'department')

    def get_serializer_class(self):
        if self.action == 'create':
            return local_serializers.EmployeeRegistrationSerializer
        elif self.action == 'me':
            return local_serializers.EmployeeProfileSerializer
        return local_serializers.EmployeeListSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        employee = serializer.save()
        output_serializer = local_serializers.EmployeeListSerializer(employee)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    # ========================================================
    # Employee Personal Profile Action
    # ========================================================
    @extend_schema(
        summary="My Profile (پروفایل من)",
        description="دریافت اطلاعات کامل کاربر لاگین شده (GET) یا آپدیت کردن عکس و اطلاعات شخصی (PATCH).",
        tags=["Employee Profile"]
    )
    @action(
        detail=False, 
        methods=['get', 'patch'], 
        url_path='me',
        parser_classes=[MultiPartParser, FormParser, JSONParser]
    )
    def me(self, request):
        employee = request.user.employee_profile
        
        if request.method == 'GET':
            serializer = self.get_serializer(employee, context={'request': request})
            return Response(serializer.data)
            
        elif request.method == 'PATCH':
            serializer = self.get_serializer(
                employee, 
                data=request.data, 
                partial=True, 
                context={'request': request}
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

    # ========================================================
    # Employee 360-Degree Metrics (HR/Admin Only)
    # ========================================================
    @extend_schema(
        summary="Employee 360 Metrics (مدیران)",
        description="دریافت تجمیعی اطلاعات مالی، آمار مرخصی و روند ساعات کاری ۷ روز گذشته برای داشبورد مدیران.",
        tags=["Employees"]
    )
    @action(
        detail=True, 
        methods=['get'], 
        url_path='360-metrics',
        permission_classes=[IsHRManagerRole] 
    )
    def metrics_360(self, request, pk=None):
        employee = self.get_object()
        local_time = timezone.localtime(timezone.now())
        today = local_time.date()

        active_contract = Contract.objects.filter(employee=employee, is_active=True).first()
        financials = {
            "baseSalary": f"{active_contract.base_salary:,.0f} تومان" if active_contract else "نامشخص",
            "contractType": active_contract.contract_type.name if active_contract and active_contract.contract_type else "بدون قرارداد"
        }

        annual_used = LeaveRequest.objects.filter(
            employee=employee, status='Approved', leave_type__name__icontains='استحقاقی'
        ).count()
        sick_used = LeaveRequest.objects.filter(
            employee=employee, status='Approved', leave_type__name__icontains='استعلاجی'
        ).count()

        leaves = {
            "annual": {"used": annual_used, "total": 26},
            "sick": {"used": sick_used, "total": 10}
        }

        persian_weekdays = {
            5: 'شنبه', 6: 'یکشنبه', 0: 'دوشنبه', 
            1: 'سه‌شنبه', 2: 'چهارشنبه', 3: 'پنجشنبه', 4: 'جمعه'
        }
        
        attendance_trend = []
        for i in range(6, -1, -1):
            d = today - timedelta(days=i)
            record = Attendance.objects.filter(employee=employee, date=d).first()
            
            hours_worked = 0
            if record and record.clock_in and record.clock_out:
                in_time = timedelta(hours=record.clock_in.hour, minutes=record.clock_in.minute)
                out_time = timedelta(hours=record.clock_out.hour, minutes=record.clock_out.minute)
                diff = out_time - in_time
                hours_worked = round(diff.total_seconds() / 3600, 1) 
            attendance_trend.append({
                "day": persian_weekdays[d.weekday()],
                "hours": hours_worked
            })

        return Response({
            "financials": financials,
            "leaves": leaves,
            "attendanceTrend": attendance_trend
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='calculate-payslip')
    def calculate_payslip(self, request, pk=None):
        """
        API برای محاسبه و صدور فیش حقوقی یک کارمند در یک ماه مشخص
        """
        year = request.data.get('year')
        month = request.data.get('month')

        if not year or not month:
            return Response(
                {"error": "پارامترهای year و month الزامی هستند."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            payslip = MonthlyPayslipCalculator.calculate_for_employee(
                employee_id=pk, 
                year=int(year), 
                month=int(month)
            )
            return Response(
                {"message": "فیش حقوقی با موفقیت محاسبه و صادر شد.", "payslip_id": payslip.id},
                status=status.HTTP_201_CREATED
            )
        except ValidationError as e:
            return Response({"error": e.message}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ==========================================
# Employee Document ViewSet
# ==========================================
@extend_schema_view(
    create=extend_schema(
        summary="Upload Employee Document",
        description="Upload documents like CV, Identity, etc. Requires multipart/form-data."
    )
)
class EmployeeDocumentViewSet(viewsets.ModelViewSet):
    """
    Handles file uploads and CRUD for employee documents.
    Employees see/manage their own. HR sees all.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = local_serializers.EmployeeDocumentSerializer
    parser_classes = [MultiPartParser, FormParser] 
    filterset_fields = ['document_type', 'employee']
    search_fields = ['title']
    ordering_fields = ['created_at']

    def get_queryset(self):
        user = self.request.user
        queryset = EmployeeDocument.objects.select_related('employee', 'employee__user').all()
        
        if user.role in ['HR Manager', 'Admin']:
            return queryset
            
        return queryset.filter(employee__user=user)

    def perform_create(self, serializer):
        user = self.request.user
        
        if user.role == 'Employee':
            serializer.save(employee=user.employee_profile)
        else:
            if 'employee' not in self.request.data:
                serializer.save(employee=user.employee_profile)
            else:
                serializer.save()

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
    serializer_class = local_serializers.ContractTypeSerializer
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
    serializer_class = local_serializers.ContractSerializer
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
    serializer_class = local_serializers.AttendanceSerializer
    filterset_fields = ['status', 'date']
    ordering_fields = ['date']

    def get_queryset(self):
        user = self.request.user
        queryset = Attendance.objects.select_related('employee', 'employee__user').all()
        
        if self.request.query_params.get('my_records') == 'true':
            return queryset.filter(employee__user=user)
        
        if user.role in ['HR Manager', 'Admin']:
            return queryset
            
        return queryset.filter(employee__user=user)
        
    def perform_create(self, serializer):
        """
        Ensures employees can only log attendance for themselves.
        Always uses server time for security.
        """
        user = self.request.user
        local_time = timezone.localtime(timezone.now())
        
        secure_data = {
            'date': local_time.date(),
            'clock_in': local_time.time(),
            'status': 'Present'
        }

        if user.role in ['HR Manager', 'Admin'] and 'employee' in self.request.data:
            serializer.save(**secure_data)
        else:
            serializer.save(employee=user.employee_profile, **secure_data)

    @extend_schema(
        summary="Clock-Out", 
        description="Automatically finds today's attendance record for the logged-in employee and sets the clock_out time."
    )
    @action(detail=False, methods=['post'], url_path='clock-out')
    def clock_out(self, request):
        user = request.user
        
        if not hasattr(user, 'employee_profile'):
            return Response(
                {"detail": "Only employees with active profiles can clock out."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        local_time = timezone.localtime(timezone.now())
        today = local_time.date()
        current_time = local_time.time()

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
    serializer_class = local_serializers.LeaveTypeSerializer
    filterset_fields = ['is_paid']
    search_fields = ['name']
    pagination_class = None 

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return super().get_permissions()


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
        Assigns employee instance automatically based on who is logged in.
        """
        user = self.request.user
        
        if user.role == 'Employee':
            serializer.save(employee=user.employee_profile)
        else:
            if 'employee' not in self.request.data:
                serializer.save(employee=user.employee_profile)
            else:
                serializer.save()

    def get_serializer_class(self):
        """
        Dynamically assigns a serializer based on the user's role.
        """
        if self.request.user and self.request.user.is_authenticated:
            if self.request.user.role in ['HR Manager', 'Admin']:
                return local_serializers.LeaveRequestHRSerializer
                
        return local_serializers.LeaveRequestEmployeeSerializer

    # ========================================================
    # Added actions for Appoving and Rejecting leaves directly
    # ========================================================
    @extend_schema(summary="Approve Leave Request")
    @action(detail=True, methods=['post'], url_path='approve')
    def approve_leave(self, request, pk=None):
        """
        تایید مرخصی (Approve a leave request - HR/Admin only)
        """
        leave_request = self.get_object()
        leave_request.status = 'Approved'
        
        if hasattr(request.user, 'employee_profile'):
            leave_request.approved_by = request.user.employee_profile
        else:
            leave_request.approved_by = None
            
        leave_request.save()
        return Response({"detail": "مرخصی با موفقیت تایید شد."})

    @extend_schema(summary="Reject Leave Request")
    @action(detail=True, methods=['post'], url_path='reject')
    def reject_leave(self, request, pk=None):
        """
        رد مرخصی (Reject a leave request - HR/Admin only)
        """
        leave_request = self.get_object()
        leave_request.status = 'Rejected'
        
        if hasattr(request.user, 'employee_profile'):
            leave_request.approved_by = request.user.employee_profile
        else:
            leave_request.approved_by = None
            
        leave_request.save()
        return Response({"detail": "مرخصی رد شد."})


# ==========================================
# BFF API for Dashboard
# ==========================================
class DashboardStatsAPIView(APIView):
    """
    Dashboard Aggregation API
    Returns tailored data based on the requesting user's role.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get Dashboard Statistics",
        description="Returns KPIs, chart data, and action items tailored to the user's role (Admin/HR vs Employee).",
        responses={
            200: inline_serializer(
                name='DashboardResponse',
                fields={
                    'role': serializers.CharField(),
                    'kpis': serializers.DictField(),
                    'chartLabel': serializers.CharField(),
                    'chartData': serializers.ListField(),
                    'listTitle': serializers.CharField(),
                    'listData': serializers.ListField(),
                    'actionTitle': serializers.CharField(),
                    'actionData': serializers.ListField(),
                }
            )
        }
    )
    def get(self, request):
        user = request.user
        local_time = timezone.localtime(timezone.now())
        today = local_time.date()

        # Helper mapping for Persian weekdays
        persian_weekdays = {
            5: 'شنبه', 6: 'یکشنبه', 0: 'دوشنبه', 
            1: 'سه‌شنبه', 2: 'چهارشنبه', 3: 'پنجشنبه', 4: 'جمعه'
        }

        # ------------------------------------------
        # ADMIN & HR MANAGER VIEW
        # ------------------------------------------
        if user.role in ['HR Manager', 'Admin']:
            active_employees_count = Employee.active_employees.count()
            
            present_today_count = Attendance.objects.filter(
                date=today, 
                clock_in__isnull=False
            ).count()
            
            pending_leaves_count = LeaveRequest.objects.filter(status='Pending').count()

            chart_data = []
            for i in range(6, -1, -1):
                d = today - timedelta(days=i)
                day_present_count = Attendance.objects.filter(date=d, clock_in__isnull=False).count()
                chart_data.append({
                    "name": persian_weekdays[d.weekday()],
                    "value": day_present_count
                })

            present_employee_ids = Attendance.objects.filter(date=today).values_list('employee_id', flat=True)
            absentees = Employee.active_employees.exclude(id__in=present_employee_ids)[:5] 
            
            list_data = []
            for emp in absentees:
                list_data.append({
                    "id": emp.id,
                    "title": emp.user.get_full_name() or emp.user.email,
                    "type": "غیبت",
                    "isAlert": True,
                    "isFile": False
                })

            pending_requests = LeaveRequest.objects.filter(status='Pending').select_related('employee', 'employee__user', 'leave_type')[:3]
            action_data = []
            for req in pending_requests:
                action_data.append({
                    "id": req.id,
                    "title": f"مرخصی {req.employee.user.get_full_name()}",
                    "subtitle": f"{req.leave_type.name} - از {req.start_date}",
                    "isPending": True
                })

            return Response({
                "role": user.role,
                "kpis": {
                    "activeEmployees": active_employees_count,
                    "presentToday": present_today_count,
                    "absentToday": active_employees_count - present_today_count,
                    "pendingLeaves": pending_leaves_count,
                },
                "chartLabel": "روند حضور پرسنل ۷ روز گذشته",
                "chartData": chart_data,
                "listTitle": "وضعیت غایبین امروز",
                "listData": list_data,
                "actionTitle": "تاییدات فوری پرسنلی",
                "actionData": action_data,
            }, status=status.HTTP_200_OK)

        # ------------------------------------------
        # EMPLOYEE VIEW
        # ------------------------------------------
        elif user.role == 'Employee':
            if not hasattr(user, 'employee_profile'):
                return Response({"detail": "پروفایل کارمندی یافت نشد."}, status=status.HTTP_400_BAD_REQUEST)
            
            employee = user.employee_profile
            
            used_leaves = LeaveRequest.objects.filter(
                employee=employee,
                status='Approved'
            ).count()

            absences = Attendance.objects.filter(
                employee=employee,
                status='Absent',
                date__month=today.month
            ).count()

            chart_data = []
            for i in range(6, -1, -1):
                d = today - timedelta(days=i)
                is_present = Attendance.objects.filter(employee=employee, date=d, clock_in__isnull=False).exists()
                chart_data.append({
                    "name": persian_weekdays[d.weekday()],
                    "value": 1 if is_present else 0
                })

            recent_requests = LeaveRequest.objects.filter(employee=employee).order_by('-created_at')[:3]
            action_data = []
            for req in recent_requests:
                status_fa = 'در انتظار' if req.status == 'Pending' else 'تایید شده' if req.status == 'Approved' else 'رد شده'
                action_data.append({
                    "id": req.id,
                    "title": f"درخواست مرخصی {req.leave_type.name}",
                    "subtitle": f"وضعیت: {status_fa}",
                    "isPending": req.status == 'Pending'
                })

            return Response({
                "role": user.role,
                "kpis": {
                    "usedLeaveDays": used_leaves,
                    "remainingLeaveDays": 15 - used_leaves,
                    "absencesMonth": absences,
                    "overtimeHours": 0, 
                },
                "chartLabel": "وضعیت حضور شما (۷ روز گذشته)",
                "chartData": chart_data,
                "listTitle": "فیش‌های حقوقی اخیر",
                "listData": [], 
                "actionTitle": "پیگیری درخواست‌های من",
                "actionData": action_data,
            }, status=status.HTTP_200_OK)

        return Response({"detail": "دسترسی مجاز نیست."}, status=status.HTTP_403_FORBIDDEN)