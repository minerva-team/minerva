from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PayrollConfigAPIView, PayslipViewSet

app_name = 'payroll'

router = DefaultRouter()
router.register(r'payslips', PayslipViewSet, basename='payslip')

urlpatterns = [
    path('config/', PayrollConfigAPIView.as_view(), name='payroll-config'),
    path('', include(router.urls)),
]