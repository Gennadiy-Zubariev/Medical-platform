from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action

from accounts.permissions import IsDoctor
from .models import MedicalCard, MedicalRecord
from .serializers import MedicalCardSerializer, MedicalRecordSerializer

class MedicalCardViewSet(viewsets.ReadOnlyModelViewSet):

    queryset = MedicalCard.objects.all()
    serializer_class = MedicalCardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            return self.queryset

        if user.is_patient():
            return self.queryset.filter(patient__user=user)

        if user.is_doctor():
            return self.queryset  # можливо потім обмежимо

        return self.queryset.none()


class MedicalRecordViewSet(viewsets.ModelViewSet):

    queryset = MedicalRecord.objects.select_related(
        'card__patient__user',
        'doctor__user',
        'appointment'
    ).all()
    serializer_class = MedicalRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset

        if user.is_superuser or user.is_doctor():
            return qs

        if user.is_patient():
            return qs.filter(card__patient__user=user)

        return qs.none()

    def perform_create(self, serializer):

        user = self.request.user

        if not user.is_doctor():
            raise PermissionError('Тільки лікар може створювати записи.')

        serializer.save(doctor=user.doctor_profile)