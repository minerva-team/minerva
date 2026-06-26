from rest_framework.permissions import BasePermission


class IsHRManagerRole(BasePermission):
    """
        Exclusive access permission for HR managers and system admins.
    """

    def has_permission(self, request, view):
            return bool(
                request.user and 
                request.user.is_authenticated and 
                request.user.role in ['HR Manager', 'Admin']
            )