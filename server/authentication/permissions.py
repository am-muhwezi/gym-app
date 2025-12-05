from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """
    Custom permission to only allow admin users or superusers to access the view.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.user_type == 'admin' or request.user.is_superuser)
        )
