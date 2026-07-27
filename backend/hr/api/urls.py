from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'departments', views.DepartmentViewSet, basename='department')
router.register(r'employees', views.EmployeeViewSet, basename='employee')
router.register(r'contract-types', views.ContractTypeViewSet, basename='contract-type')
router.register(r'contracts', views.ContractViewSet, basename='contract')
router.register(r'attendance', views.AttendanceViewSet, basename='attendance')
router.register(r'leave-types', views.LeaveTypeViewSet, basename='leave-type')
router.register(r'leave-requests', views.LeaveRequestViewSet, basename='leave-request')

urlpatterns = [
    path('dashboard/stats/', views.DashboardStatsAPIView.as_view(), name='dashboard-stats'),
    
] + router.urls