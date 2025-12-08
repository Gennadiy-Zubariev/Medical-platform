from rest_framework import viewsets, permissions,status
from rest_framework.decorators import action
from rest_framework.response import Response
from accounts.permissions import IsDoctor, IsPatient
from .models import Appointment
from .serializers import AppointmentReadSerializer, AppointmentsWriteSerializer

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
        qs = super().get_queryset()

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
            patient_profile = user.patient_profile
            serializer.save(patient=patient_profile)

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

