from rest_framework.permissions import BasePermission


class IsChatParticipant(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        appointment = obj.appointment

        if not user.is_authenticated:
            return False

        if user.is_doctor():
            return appointment.doctor.user == user

        if user.is_patient():
            return appointment.patient.user == user

        return False
