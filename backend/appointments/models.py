from django.db import models
from datetime import timedelta
from accounts.models import PatientProfile, DoctorProfile
from django.db.models import Q


class Appointment(models.Model):
    """
    Represents an appointment between a patient and a doctor.

    This model stores information about a medical appointment, including the patient and doctor involved, the start time
    and duration of the appointment, its current status, a description of the reason for the appointment, and timestamps
    for when it was created and last updated. It ensures uniqueness of non-canceled appointments for a doctor at a
    specific start time.

    :ivar patient: Foreign key to the PatientProfile, representing the profile of the patient making the appointment.
    :ivar doctor: Foreign key to the DoctorProfile, representing the profile of the doctor for the appointment.
    :ivar start_datetime: The start date and time of the consultation.
    :ivar duration_minutes: The duration of the appointment in minutes (default is 30 minutes).
    :ivar status: The current status of the appointment, chosen from predefined values: PENDING, CONFIRMED, or COMPLETED.
    :ivar reason: A brief description of the reason for the appointment and relevant symptoms (optional).
    :ivar created_at: The timestamp indicating when the appointment was created.
    :ivar updated_at: The timestamp indicating when the appointment was last updated.
    """
    class Status(models.TextChoices):
        PENDING = "pending", "Очікує підтвердження"
        CONFIRMED = "confirmed", "Підтверджено"
        COMPLETED = "completed", "Завершено"

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
    duration_minutes = models.PositiveIntegerField(default=30,
                                                   help_text='Тривалість прийому в хвилинах (за замовчуванням 30 хв).')
    status = models.CharField(choices=Status.choices, max_length=20, default=Status.PENDING,
                              help_text='Поточний статус запису.')
    reason = models.TextField(blank=True, help_text='Причина звернення, короткий опис симптомів тощо.')
    created_at = models.DateTimeField(auto_now_add=True, help_text='Дата й час створення запису.')
    updated_at = models.DateTimeField(auto_now=True, help_text='Дата й час останнього оновлення запису.')

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['doctor', 'start_datetime'],
                condition=~Q(status="canceled"),
                name='unique_appointment'),
        ]

    def __str__(self):
        return (
            f'Пацієнт - {self.patient.user.username}'
            f'Доктор - {self.doctor.user.username}'
        )

    @property
    def end_datetime(self):
        return self.start_datetime + timedelta(minutes=self.duration_minutes)
