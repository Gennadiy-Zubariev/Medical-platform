from datetime import datetime, timedelta
from django.utils import timezone

from rest_framework import viewsets, permissions,status
from rest_framework.decorators import action
from rest_framework.response import Response
from accounts.permissions import IsDoctor, IsPatient
from .models import Appointment
from .serializers import AppointmentReadSerializer, AppointmentsWriteSerializer
from accounts.models import DoctorProfile


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related(
        'patient__user',
        'doctor__user',
    ).all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return AppointmentReadSerializer
        return AppointmentsWriteSerializer

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset().order_by('-start_datetime')

        if user.is_superuser:
            return qs

        if hasattr(user, 'patient_profile') and user.is_patient():
            return qs.filter(patient__user=user)

        if hasattr(user, 'doctor_profile') and user.is_doctor():
            return qs.filter(doctor__user=user)

        return qs.none()


    def perform_create(self, serializer):
        user = self.request.user

        if hasattr(user, 'patient_profile') and user.is_patient():
            serializer.save(patient=user.patient_profile)
        else:
            serializer.save()

    @action(
        detail=True,
        methods=['post'],
        permission_classes=[permissions.IsAuthenticated, IsDoctor],
        url_path='set-status'
    )
    def set_status(self,request,pk=None):
        appointment = self.get_object()
        new_status = request.data.get('status')

        valid_statuses = {choise[0] for choise in Appointment.Status.choices}
        if new_status not in valid_statuses:
            return Response({'detail': 'Невалідний статус.'}, status=status.HTTP_400_BAD_REQUEST)
        appointment.status = new_status
        appointment.save()
        return Response(
            AppointmentReadSerializer(appointment).data,
            status=status.HTTP_200_OK
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[permissions.IsAuthenticated, IsPatient],
        url_path="cancel"
    )
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        user = request.user

        if appointment.patient.user != user:
            return Response(
                {"detail": "Ви не можете скасувати цей запис."},
                status=status.HTTP_403_FORBIDDEN
            )

        if appointment.status != Appointment.Status.PENDING:
            return Response(
                {"detail": "Підтверджений або завершений запис не можна скасувати."},
                status=status.HTTP_400_BAD_REQUEST
            )

        appointment.status = Appointment.Status.CANCELED
        appointment.save(update_fields=["status"])

        return Response(
            AppointmentReadSerializer(appointment).data,
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], url_path="my")
    def my(self, request):
        return self.list(request)

    @action(detail=False, methods=["get"], url_path="available-slots")
    def available_slots(self, request):
        doctor_id = request.query_params.get("doctor")
        date_str = request.query_params.get("date")

        doctor = DoctorProfile.objects.get(pk=doctor_id)

        date = datetime.fromisoformat(date_str).date()

        start_dt = timezone.make_aware(
            datetime.combine(date, doctor.work_start)
        )
        end_dt = timezone.make_aware(
            datetime.combine(date, doctor.work_end)
        )

        slots = []
        current = start_dt

        while current + timedelta(minutes=doctor.slot_duration) <= end_dt:
            slots.append(current)
            current += timedelta(minutes=doctor.slot_duration)

        busy = Appointment.objects.filter(
            doctor=doctor,
            start_datetime__date=date,
        ).exclude(status=Appointment.Status.CANCELED)

        available = [s for s in slots if s not in busy.values_list("start_datetime", flat=True)]

        return Response([s.isoformat() for s in available])