from rest_framework import serializers
from backend.appointments.models import Appointment
from backend.accounts.serializers import PatientProfileSerializer

class AppointmentSerializer(serializers.ModelSerializer):
    patient = PatientProfileSerializer(read_only=True)
    doctor_name = serializers.CharField(source='doctor.get_full_name', read_only=True)
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)

    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['patient', 'doctor', 'status']

    def validate(self, data):
        doctor = data['doctor']
        date = data['date']
        time = data['time']
        if Appointment.objects.filter(doctor=doctor, date=date, time=time).exists():
            if self.instance and self.instance.time == time and self.instance.date == date:
                return data
            raise serializers.ValidationError('This time slot is already taken')
        return data