from rest_framework import serializers

from backend.appointments.models import Appointment
from backend.medical.models import MedicalRecord, MedicalCard

class MedicalCardSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)

    class Meta:
        model = MedicalCard
        fields = '__all__'
        read_only_fields = ['patient']

class MedicalRecordSerializer(serializers.ModelSerializer):
    appointment = serializers.PrimaryKeyRelatedField(
        queryset=Appointment.objects.all(),
        write_only=True
    )
    doctor_name = serializers.CharField(source='doctor.get_full_name', read_only=True)
    patient_name = serializers.CharField(source='card.patient.user.get_full_name', read_only=True)

    class Meta:
        model = MedicalRecord
        fields = '__all__'
        read_only_fields = ['card', 'doctor', 'created_at', 'doctor_name', 'patient_name']

    def validate_appointment(self, appointment):

        if appointment.doctor != self.context['request'].user:
            raise serializers.ValidationError('This is not your reception')
        if appointment.status != 'confirmed':
            raise serializers.ValidationError('You can create an entry only after confirmation')
        return appointment

    def create(self, validated_data):
        appointment = validated_data.pop('appointment')
        card = appointment.patient.medical_card  # ← автоматично!

        return MedicalRecord.objects.create(
            card=card,
            doctor=self.context['request'].user,
            appointment=appointment,
            **validated_data
        )



