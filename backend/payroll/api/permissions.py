from rest_framework.permissions import BasePermission

class IsFinanceManager(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['Finance Manager', 'Admin']

        )

class IsOwnerOrFinanceManager(BasePermission):

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.user.role in ['Finance Manager', 'Admin']:
            return True
            
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            if hasattr(request.user, 'employee_profile'):
                return obj.employee == request.user.employee_profile
                
        return False