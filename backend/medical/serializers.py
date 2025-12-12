from rest_framework import serializers
from accounts.serializers import DoctorProfileSerializer, PatientProfileSerializer
from .models import MedicalCard, MedicalRecord

class MedicalRecordSerializer(serializers.ModelSerializer):
    doctor = DoctorProfileSerializer(read_only=True)

    class Meta:
        model = MedicalRecord
        fields = [
            'id',
            'card',
            'doctor',
            'appointment',
            'diagnosis',
            'recipe',
            'recommendations',
            'created_at',
        ]
        read_only_fields = ['doctor', 'created_at']

class MedicalCardSerializer(serializers.ModelSerializer):
    patient = PatientProfileSerializer(read_only=True)
    records = MedicalRecordSerializer(many=True, read_only=True)

    class Meta:
        model = MedicalCard
        fields = [
            'id',
            'patient',
            'records',
            'created_at',
            'updated_at',
        ]



