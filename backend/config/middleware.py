from django.http import HttpResponseForbidden
from django.shortcuts import redirect
from django.urls import reverse

class SuperuserOnlyAdminMiddleware:
    """
    Middleware to restrict access to the /admin/ panel strictly to superusers.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith('/admin/'):
            if request.user.is_authenticated and not request.user.is_superuser:
                return HttpResponseForbidden(
                    "Access Denied: This section is restricted to Superusers only."
                )
                
        return self.get_response(request)