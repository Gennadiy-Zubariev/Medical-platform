from django.db import models
from django.conf import settings
from backend.accounts.models import PatientProfile
from django.core.validators import MinValueValidator
from django.utils import timezone
from datetime import time



class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('canceled', 'Canceled'),
    ]

    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.CASCADE,
        related_name='patient_appointments'
    )
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'doctor_profile__isnull': False},
        related_name='doctor_appointments'
    )
    date = models.DateField(validators=[MinValueValidator(timezone.now().date())])
    time = models.TimeField()
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('patient', 'date', 'time')
        ordering = ['-date', '-time']

    def __str__(self):
        return f'{self.patient} {self.doctor} | {self.date} {self.time}'
