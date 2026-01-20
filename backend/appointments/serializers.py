from celery.utils.time import weekday
from django.utils import timezone
from rest_framework import serializers
from accounts.models import PatientProfile, DoctorProfile
from accounts.serializers import PatientProfileSerializer, DoctorProfileSerializer
from .models import Appointment
from chat.models import ChatMessage


class AppointmentReadSerializer(serializers.ModelSerializer):
    patient = PatientProfileSerializer(read_only=True)
    doctor = DoctorProfileSerializer(read_only=True)
    end_datetime = serializers.SerializerMethodField()
    has_unread_messages = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient",
            "doctor",
            "start_datetime",
            "duration_minutes",
            "end_datetime",
            "status",
            "reason",
            "created_at",
            "updated_at",
            "has_unread_messages",
        ]

    def get_end_datetime(self, obj):
        """
        Retrieve the `end_datetime` attribute from the provided object.

        :param obj: The object from which to retrieve the `end_datetime` attribute.
        :return: The value of the `end_datetime` attribute from the given object.
        """
        return obj.end_datetime

    def get_has_unread_messages(self, obj):
        """
        Determine if there are any unread messages for the given object in the context of the
        authenticated user. If the request is unavailable or the user is not authenticated, defaults
        to returning False.

        :param obj: The object to check for associated unread messages.
        :type obj: Any
        :return: Boolean indicating whether there are unread messages for the object.
        :rtype: bool
        """
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False

        user = request.user

        return ChatMessage.objects.filter(room__appointment=obj, is_read=False).exclude(sender=user).exists()


class AppointmentsWriteSerializer(serializers.ModelSerializer):
    doctor = serializers.PrimaryKeyRelatedField(
        queryset=DoctorProfile.objects.all(),
        help_text='ID профілю лікаря, до якого записуються.'
    )

    class Meta:
        model = Appointment
        fields = [
            "doctor",
            "start_datetime",
            "duration_minutes",
            "reason",
        ]
        read_only_fields = ["status"]

    def validate(self, attrs):
        """
        Validates the input dictionary `attrs` for constraints related to scheduling appointments,
        such as ensuring start date, duration, and doctor's availability are valid.

        :param attrs: A dictionary containing appointment data. Keys expected include:
            - start_datetime: A datetime object representing the start time of the appointment.
            - duration_minutes: (optional) An integer indicating the duration of the appointment
              in minutes, defaulting to 30.
            - doctor: An object representing the doctor for whom the appointment is being scheduled.

        :raises serializers.ValidationError: Raised if:
            - The `start_datetime` is in the past.
            - The `duration_minutes` is less than or equal to 0.
            - The specified doctor does not have a valid schedule configured.
            - The day of the week for `start_datetime` does not align with the doctor's workdays.
            - There is already an appointment scheduled at the same `start_datetime` for the same doctor.

        :return: A validated dictionary of appointment attributes.
        """

        start = attrs.get("start_datetime")
        duration = attrs.get("duration_minutes", 30)
        doctor = attrs.get("doctor")

        if start is not None and timezone.is_naive(start):
            try:
                start = timezone.make_aware(start)
                attrs["start_datetime"] = start
            except Exception:
                pass

        if start and start < timezone.now():
            raise serializers.ValidationError("Неможливо створити запис у минулому.")

        if duration <= 0:
            raise serializers.ValidationError("Тривалість повинна бути більшою за 0.")

        if doctor and start:
            if not doctor.has_valid_schedule():
                raise serializers.ValidationError("У лікаря не налаштований робочий графік.")

            weekday = start.weekday()

            if weekday not in doctor.work_days:
                raise serializers.ValidationError("Лікар не працює в цей день.")

        if doctor and start:
            exists = Appointment.objects.filter(
                doctor=doctor,
                start_datetime=start,
            ).exists()

            if exists:
                raise serializers.ValidationError(
                    "Цей час уже зайнятий."
                )

        return attrs
