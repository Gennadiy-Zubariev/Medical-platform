from django.utils import timezone
from rest_framework import serializers
from accounts.models import PatientProfile, DoctorProfile
from accounts.serializers import PatientProfileSerializer, DoctorProfileSerializer
from .models import Appointment

class AppointmentReadSerializer(serializers.ModelSerializer):
    patient = PatientProfileSerializer(read_only=True)
    doctor = DoctorProfileSerializer(read_only=True)
    end_datetime = serializers.SerializerMethodField()

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
        ]

    def get_end_datetime(self, obj):
        return obj.end_datetime

class AppointmentsWriteSerializer(serializers.ModelSerializer):

    doctor = serializers.PrimaryKeyRelatedField(
        queryset = DoctorProfile.objects.all(),
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

        start = attrs.get("start_datetime")
        duration = attrs.get("duration_minutes", 30)
        doctor = attrs.get("doctor")


        # Ensure timezone-aware datetime
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
            exists = Appointment.objects.filter(
                doctor=doctor,
                start_datetime=start,
            ).exists()

            if exists:
                raise serializers.ValidationError(
                    "Цей час уже зайнятий."
                )


        return attrs