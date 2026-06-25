from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'hr-api'

router = DefaultRouter()
router.register(r'departments', views.DepartmentViewSet, basename='department')
router.register(r'employees', views.EmployeeViewSet, basename='employee')
router.register(r'contracts', views.ContractViewSet, basename='contract')
router.register(r'attendance', views.AttendanceViewSet, basename='attendance')
router.register(r'leave-types', views.LeaveTypeViewSet, basename='leave-type')
router.register(r'leave-requests', views.LeaveRequestViewSet, basename='leave-request')

urlpatterns = [
    path('', include(router.urls)),
]