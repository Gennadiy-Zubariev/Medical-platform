from django.db import models
from django.utils import timezone
from datetime import timedelta
from accounts.models import PatientProfile, DoctorProfile




class Appointment(models.Model):

    class Status(models.TextChoices):
        PENDING = "pending", "Очікує підтвердження"
        CONFIRMED = "confirmed", "Підтверджено"
        COMPLETED = "completed", "Завершено"
        CANCELED = "canceled", "Скасовано"

    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.CASCADE,
        related_name='appointments',
        help_text='Профіль пацієнта, який записався на прийом.'
    )
    doctor = models.ForeignKey(
        DoctorProfile,
        on_delete=models.CASCADE,
        related_name='appointments',
        help_text='Профіль лікаря, до якого записуються.'
    )
    start_datetime = models.DateTimeField(help_text='Дата та час початку консультації.')
    duration_minutes = models.PositiveIntegerField(default=30, help_text='Тривалість прийому в хвилинах (за замовчуванням 30 хв).')
    status = models.CharField(choices=Status.choices, max_length=20, default=Status.PENDING, help_text='Поточний статус запису.')
    reason = models.TextField(blank=True, help_text='Причина звернення, короткий опис симптомів тощо.')
    created_at = models.DateTimeField(auto_now_add=True, help_text='Дата й час створення запису.')
    updated_at = models.DateTimeField(auto_now_add=True, help_text='Дата й час останнього оновлення запису.')

    class Meta:
        ordering = ['-start_datetime']
        unique_together = ('patient', 'doctor', 'start_datetime')


    def __str__(self):
        return (
            f'Пацієнт - {self.patient.user.username}'
            f'Доктор - {self.doctor.user.username}'
        )

    @property
    def end_datatime(self):
        return self.start_datetime + timedelta(minutes=self.duration_minutes)


