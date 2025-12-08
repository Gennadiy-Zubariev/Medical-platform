from datetime import timezone
from rest_framework import serializers
from accounts.models import PatientProfile, DoctorProfile
from accounts.serializers import PatientProfileSerializer, DoctorProfileSerializer
from .models import Appointment

class AppointmentReadSerializer(serializers.ModelSerializer):
    patient = PatientProfileSerializer(read_only=True)
    doctor = DoctorProfileSerializer(read_only=True)
    end_datatime = serializers.SerializerMethodField()

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

    def get_end_datatime(self, obj):
        return obj.end_datatime

class AppointmentsWriteSerializer(serializers.ModelSerializer):
    patient = serializers.PrimaryKeyRelatedField(
        queryset=PatientProfile.objects.all(),
        required=False,
        allow_null=True,
        help_text='ID профілю пацієнта. Якщо викликає пацієнт – буде підставлено автоматично.'
    )
    doctor = serializers.PrimaryKeyRelatedField(
        queryset = DoctorProfile.objects.all(),
        help_text='ID профілю лікаря, до якого записуються.'
    )


    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient",
            "doctor",
            "start_datetime",
            "duration_minutes",
            "status",
            "reason",
        ]
        read_only_fields = ["status"]

    def validate(self, attrs):

        start = attrs.get("start_datetime")
        duration = attrs.get("duration_minutes", 30)

        if start and start < timezone.now():
            raise serializers.ValidationError("Неможливо створити запис у минулому.")

        if duration <= 0:
            raise serializers.ValidationError("Тривалість повинна бути більшою за 0.")

        return attrs