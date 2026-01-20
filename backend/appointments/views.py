from datetime import datetime, timedelta
from django.utils import timezone

from rest_framework import viewsets, permissions, status
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
        """
        Determines and returns the appropriate serializer class based on the action being performed.

        :return: The serializer class to be used for the current action. If the action is
            'list' or 'retrieve', it returns `AppointmentReadSerializer`. Otherwise, it
            returns `AppointmentsWriteSerializer`.
        :rtype: Type[Serializer]
        """
        if self.action in ['list', 'retrieve']:
            return AppointmentReadSerializer
        return AppointmentsWriteSerializer

    def get_serializer_context(self):
        """
        Provides additional context for serializer initialization.

        This method extends the parent class's `get_serializer_context` method
        by injecting the current request object into the serializer context,
        enabling serializers to access request-specific information.

        :return: Context dictionary containing additional parameters for serializer initialization.
        :rtype: dict
        """
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        """
        Retrieve a filtered and ordered queryset based on the user's role and permissions.

        This method customizes the queryset retrieval process by applying filters depending
        on the type of user (superuser, patient, or doctor). Superusers are granted access
        to all records, while patients and doctors are restricted to records associated
        with their respective profiles. If none of these roles apply, an empty queryset is
        returned.

        :return: A filtered and ordered queryset based on the user's role and permissions.
        :rtype: QuerySet
        """
        user = self.request.user
        queryset = super().get_queryset().order_by('-start_datetime')

        if user.is_superuser:
            return queryset

        if hasattr(user, 'patient_profile') and user.is_patient():
            return queryset.filter(patient__user=user)

        if hasattr(user, 'doctor_profile') and user.is_doctor():
            return queryset.filter(doctor__user=user)

        return queryset.none()

    def perform_create(self, serializer):
        """
        Saves the object instance using the provided serializer, associating it with the
        current user's patient profile if applicable.

        If the currently authenticated user has a `patient_profile` attribute and is identified
        as a patient (determined by the `is_patient` method), the object will be saved and linked
        to the user's `patient_profile`. Otherwise, the object will be saved without any
        additional associations.

        :param serializer: Serializer instance used to save the object.
        :type serializer: Serializer
        :return: None
        """
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
    def set_status(self, request, pk=None):
        """
        Handles the update of an appointment's status by a doctor. This method allows a doctor to
        update the `status` attribute of an existing appointment to one of the valid statuses defined
        in `Appointment.Status.choices`.

        :param request: The HTTP request object containing the data for setting the new status. It must
            include a `status` field with the new status value.
        :type request: rest_framework.request.Request
        :param pk: The primary key of the appointment to be updated. This is used to fetch the relevant
            appointment object.
        :type pk: int, optional
        :return: A Response object containing the updated appointment data serialized through
            the corresponding serializer or an error message if the new status is invalid.
        :rtype: rest_framework.response.Response
        """
        appointment = self.get_object()
        new_status = request.data.get('status')

        valid_statuses = {choise[0] for choise in Appointment.Status.choices}
        if new_status not in valid_statuses:
            return Response({'detail': 'Невалідний статус.'}, status=status.HTTP_400_BAD_REQUEST)
        appointment.status = new_status
        appointment.save()
        return Response(
            self.get_serializer(appointment).data, status=status.HTTP_200_OK
        )

    @action(
        detail=True,
        methods=["delete"],
        permission_classes=[permissions.IsAuthenticated, IsPatient],
        url_path="cancel"
    )
    def cancel(self, request, pk=None):
        """
        Cancels a specific appointment associated with the requesting authenticated user.

        This action ensures that only the patient who created the appointment can cancel it and
        only if its current status is `PENDING`.

        :param request: The HTTP request object containing user details and other contextual information.
        :type request: HttpRequest
        :param pk: The primary key of the appointment to be canceled.
        :type pk: int or None
        :return: A response indicating the result of the cancellation operation:
                 - HTTP 403 Forbidden if the user is not authorized to cancel the appointment.
                 - HTTP 400 Bad Request if the appointment is not in a 'PENDING' status.
                 - HTTP 204 No Content if the cancellation is successful.
        :rtype: Response
        """
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

        appointment.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'], url_path="my")
    def my(self, request):
        return self.list(request)

    @action(detail=False, methods=["get"], url_path="available-slots")
    def available_slots(self, request):
        """
        Provides an API endpoint to fetch the available appointment slots for a
        specific doctor on a given date.

        The function retrieves the work schedule of the specified doctor, including
        their working hours, slot duration, and working days. Using this information,
        it calculates the available time slots within the given date. Additionally, it
        excludes any time slots that are already taken by existing appointments.

        :param request: DRF request object containing query parameters.
            - `doctor`: The ID of the doctor as a string.
            - `date`: The desired date as an ISO 8601 formatted string.
        :return: JSON response containing a list of available time slots in ISO 8601
            datetime string format.
        """
        doctor_id = request.query_params.get("doctor")
        date_str = request.query_params.get("date")

        doctor = DoctorProfile.objects.get(pk=doctor_id)

        if not doctor.has_valid_schedule():
            return Response([])

        date = datetime.fromisoformat(date_str).date()

        start_dt = timezone.make_aware(
            datetime.combine(date, doctor.work_start)
        )
        end_dt = timezone.make_aware(
            datetime.combine(date, doctor.work_end)
        )

        weekday = date.weekday()
        if weekday not in doctor.work_days:
            return Response([])

        slots = []
        current = start_dt

        while current + timedelta(minutes=doctor.slot_duration) <= end_dt:
            slots.append(current)
            current += timedelta(minutes=doctor.slot_duration)

        busy = Appointment.objects.filter(
            doctor=doctor,
            start_datetime__date=date,
        )

        available = [s for s in slots if s not in busy.values_list("start_datetime", flat=True)]

        return Response([s.isoformat() for s in available])
