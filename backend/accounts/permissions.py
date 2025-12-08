from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsDoctor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_doctor

class IsPatient(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_patient


class IsOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method is SAFE_METHODS:
            return True

        if hasattr(obj, 'user'):
            return obj.user == request.user

        return False