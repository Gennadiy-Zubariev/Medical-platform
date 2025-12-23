from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied

from accounts.permissions import IsDoctor, IsPatient
from accounts.models import PatientProfile, DoctorProfile
from appointments.models import Appointment
from .models import MedicalCard, MedicalRecord
from .serializers import MedicalCardSerializer, MedicalRecordSerializer

class MedicalCardViewSet(viewsets.ModelViewSet):

    serializer_class = MedicalCardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_patient():
            return MedicalCard.objects.filter(patient__user=user)


        if user.is_doctor():
            return MedicalCard.objects.all()

        return MedicalCard.objects.none()

    def update(self,request,*args,**kwargs):
        if not request.user.is_patient():
            raise PermissionDenied("Тільки пацієнт може редагувати медичну картку")
        return super().update(request,*args,**kwargs)

    @action(
        detail=False,
        methods=['get'],
        permission_classes=[permissions.IsAuthenticated, IsPatient],
        url_path='my'
    )
    def my(self, request):
        card, _ = MedicalCard.objects.get_or_create(patient=request.user.patient_profile)
        serializer = self.get_serializer(card)
        return Response(serializer.data)


    @action(
        detail=False,
        methods=['get'],
        permission_classes=[permissions.IsAuthenticated, IsDoctor],
        url_path='by-patient/(?P<patient_id>[^/.]+)'
    )
    def by_patient(self, request, patient_id):
        patient = get_object_or_404(PatientProfile, pk=patient_id)
        card, _ = MedicalCard.objects.get_or_create(patient=patient)
        serializer = self.get_serializer(card)
        return Response(serializer.data)



class MedicalRecordViewSet(viewsets.ModelViewSet):

    serializer_class = MedicalRecordSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctor]

    def get_queryset(self):
        doctor = self.request.user.doctor_profile

        patients_ids = Appointment.objects.filter(doctor=doctor).values_list('patient', flat=True)

        return MedicalRecord.objects.filter(
            card__patient_id__in=patients_ids
        ).select_related(
            'card',
            'doctor',
            'appointment',
        ).order_by('-created_at')


    def perform_create(self, serializer):
        doctor = self.request.user.doctor_profile

        card_id = self.request.data.get('card_id')
        if not card_id:
            raise PermissionDenied("card_id обовʼязковий.")

        card = MedicalCard.objects.get(pk=card_id)

        has_appointment = Appointment.objects.filter(doctor=doctor, patient=card.patient).exists()

        if not has_appointment:
            raise PermissionDenied("Ви не маєте прийому з цим пацієнтом.")

        appointment_id = self.request.data.get('appointment')
        appointment = None

        if appointment_id:
            appointment = Appointment.objects.get(pk=appointment_id)

            if appointment.doctor != doctor:
                raise PermissionDenied("Цей прийом не належить вам.")

        serializer.save(card=card, doctor=doctor, appointment=appointment)


    def perform_update(self, serializer):
        record = self.get_object()

        if record.doctor != self.request.user.doctor_profile:
            raise PermissionDenied("Ви можете редагувати тільки свої записи.")
        serializer.save()



    def perform_destroy(self, instance):
        if instance.doctor != self.request.user.doctor_profile:
            raise PermissionDenied("Ви можете видаляти тільки свої записи.")
        instance.delete()