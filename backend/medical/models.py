from django.db import models
from django.conf import settings


class MedicalCard(models.Model):
    patient = models.OneToOneField(
        'accounts.PatientProfile',
        on_delete=models.CASCADE,
        related_name='medical_card',
        help_text='Пацієнт, якому належить ця медична картка.'
    )
    blood_type = models.CharField(max_length=3, blank=True)
    allergies = models.TextField(blank=True)
    chronic_diseases = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Медкартка {self.patient.user.username}'


class MedicalRecord(models.Model):
    card = models.ForeignKey(MedicalCard, on_delete=models.CASCADE, related_name='records')
    doctor = models.ForeignKey(
        'accounts.DoctorProfile',
        on_delete=models.SET_NULL,
        null=True,
        related_name='medical_records',
        help_text='Лікар, який зробив цей запис.'
    )
    appointment = models.ForeignKey(
        'appointments.Appointment',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='medical_records',
        help_text='Пов\'язаний запис прийому (необов\'язково).'
    )
    diagnosis = models.CharField(max_length=255, help_text='Основний діагноз або попередній діагноз.')
    recipe = models.TextField(blank=True, null=True, help_text='Рецепти')
    recommendations = models.TextField(blank=True, null=True, help_text='Рекомендації щодо лікування')
    created_at = models.DateTimeField(auto_now_add=True, help_text='Дата створення')
    updated_at = models.DateTimeField(auto_now=True, help_text='Дата оновлення')

    def __str__(self):
        return f'Запис {self.diagnosis} для {self.card.patient.user.username}'
