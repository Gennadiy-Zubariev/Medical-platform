from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models




class User(AbstractUser):
    """
    Custom User model based on AbstractUser.
    """

    class Roles(models.TextChoices):
        ADMIN = 'admin', 'Адміністратор'
        DOCTOR = 'doctor', 'Доктор'
        PATIENT = 'patient', 'Пацієнт'

    role = models.CharField(choices=Roles.choices, max_length=20, default=Roles.PATIENT)
    phone_number = models.CharField(max_length=11, blank=True, null=True)


    def is_doctor(self):
        """Повертає True, якщо у користувача створено DoctorProfile"""
        return self.role == self.Roles.DOCTOR


    def is_patient(self):
        """Повертає True, якщо у користувача створено PatientProfile"""
        return self.role == self.Roles.PATIENT

    def __str__(self):
        return f'{self.username} ({self.role})'


class DoctorProfile(models.Model):
    """
    Doctor detail
    OneToOne --> User(role=doctor)
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='doctor_profile'
    )
    bio = models.TextField(blank=True)
    specialization = models.CharField(max_length=255)
    experience_years = models.PositiveIntegerField(default=0)
    photo = models.ImageField(upload_to='doctor_photos/', blank=True, null=True)

    def __str__(self):
        return f'Dr. {self.user.username} ({self.specialization})'


class PatientProfile(models.Model):
    """
    Patient detail
    OneToOne --> User(role=patient)
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='patient_profile'
    )
    date_of_birth = models.DateField(blank=True, null=True)
    adress = models.CharField(max_length=255, blank=True)
    insurance_number = models.CharField(max_length=255, blank=True)
    photo = models.ImageField(upload_to='patient_photos/', blank=True, null=True)


    def __str__(self):
        return f'Patient {self.user.username}'
