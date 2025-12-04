from django.db import models
from django.conf import settings
from backend.accounts.models import PatientProfile
from django.utils import timezone

class MedicalCard(models.Model):
    patient = models.OneToOneField(
        PatientProfile,
        on_delete=models.CASCADE,
        related_name='medical_card'
    )
    blood_type = models.CharField(max_length=3, blank=True)
    allergies = models.TextField(blank=True)
    chronic_diseases = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Medical Card of {self.patient.user.get_full_name()}"

class MedicalRecord(models.Model):
    card = models.ForeignKey(MedicalCard, on_delete=models.CASCADE, related_name='records')
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        limit_choices_to={'doctor_profile__isnull': False},
        related_name='written_records'
    )
    appointment = models.OneToOneField(
        'appointments.Appointment',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='medical_records')
    diagnosis = models.TextField(blank=True, null=True)
    treatment = models.TextField(blank=True, null=True)
    recipe = models.TextField(blank=True, null=True)
    recommendations = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Record from {self.doctor} regarding patient {self.card.patient} | {self.created_at.date()}"






