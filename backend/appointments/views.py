from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from backend.appointments.models import Appointment
from backend.appointments.serializers import AppointmentSerializer
from backend.appointments.permissions import IsOwnerOrDoctor
from backend.accounts.permissions import IsDoctor, IsPatient, IsDoctorOrPatient

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsDoctorOrPatient]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        'reason',
        'doctor__user__first_name',
        'doctor__user__last_name',
        'patient__user__first_name',
        'patient__user__last_name'
    ]
    ordering_fields = ['date', 'time']

    def get_queryset(self):
        if self.request.user.is_patient:
            return Appointment.objects.filter(patient__user=self.request.user)
        if self.request.user.is_doctor:
            return Appointment.objects.filter(doctor=self.request.user)
        return Appointment.objects.none()

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsOwnerOrDoctor()]
        return super().get_permissions()


    def perform_create(self, serializer):
        serializer.save(patient=self.request.user.patient_profile)

    @action(detail=True, methods=['post'], permission_classes=[IsDoctor])
    def confirm(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'confirmed'
        appointment.save()
        return Response({'status': 'confirmed'})

    @action()
    def completed(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'completed'
        appointment.save()
        return Response({'status': 'completed'})

    @action(detail=True, methods=['post'], permission_classes=[IsOwnerOrDoctor])
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'cancelled'
        appointment.save()
        return Response({'status': 'cancelled'})


