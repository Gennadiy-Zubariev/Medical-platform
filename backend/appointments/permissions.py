from rest_framework import permissions

class IsOwnerOrDoctor(permissions.BasePermission):
    message = 'You must be the owner or doctor to perform this action.'

    def has_object_permission(self, request, view, obj):
        if request.user.is_doctor:
            return obj.doctor == request.user
        if request.user.is_patient:
            return obj.patient.user == request.user
        return False