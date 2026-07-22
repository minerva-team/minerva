from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PayrollConfigViewSet, PayslipViewSet

app_name = 'payroll'

router = DefaultRouter()
router.register(r'configs', PayrollConfigViewSet, basename='payroll-config')
router.register(r'payslips', PayslipViewSet, basename='payslip')

urlpatterns = [
    path('', include(router.urls)),
]