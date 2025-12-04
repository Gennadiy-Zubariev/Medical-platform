from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from backend.accounts.permissions import IsDoctor, IsPatient, IsDoctorOrPatient
from backend.medical.models import MedicalCard, MedicalRecord
from backend.medical.serializers import MedicalCardSerializer, MedicalRecordSerializer
from backend.medical.permissions import IsDoctorAndOwner

class MedicalCardViewSet(viewsets.ReadOnlyModelViewSet):
    """Пацієнт і лікар можуть переглядати картку"""
    serializer_class = MedicalCardSerializer
    permission_classes = [IsDoctorOrPatient]

    def get_queryset(self):
        if self.request.user.is_patient:
            return MedicalCard.objects.filter(patient__user=self.request.user)
        if self.request.user.is_doctor:
            return MedicalCard.objects.filter(
                patient__appointments__doctor=self.request.user
            ).distinct()

class MedicalRecordViewSet(viewsets.ModelViewSet):
    """Тільки лікарі створюють/редагують записи"""
    serializer_class = MedicalRecordSerializer
    permission_classes = [IsDoctor, IsDoctorAndOwner]

    def get_queryset(self):
        if self.request.user.is_doctor:
            return MedicalRecord.objects.filter(doctor=self.request.user)
        return MedicalRecord.objects.filter(card__patient__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user)
