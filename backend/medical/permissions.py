from rest_framework import permissions

class IsDoctorAndOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_doctor

    def has_object_permission(self, request, view, obj):
        return obj.doctor == request.user