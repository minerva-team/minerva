from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PayrollConfigViewSet, PayslipViewSet, PendingPayslipsReportView

router = DefaultRouter()
router.register(r'configs', PayrollConfigViewSet, basename='payroll-config')
router.register(r'payslips', PayslipViewSet, basename='payslip')

urlpatterns = [
    path('reports/pending-payslips/', PendingPayslipsReportView.as_view(), name='pending-payslips-report'),
    
    path('', include(router.urls)),
]