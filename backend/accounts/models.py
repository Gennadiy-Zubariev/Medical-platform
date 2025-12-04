from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _



class User(AbstractUser):
    """
    Custom User model based on AbstractUser.
    """

    is_active = models.BooleanField(default=True)

    @property
    def is_doctor(self):
        """Повертає True, якщо у користувача створено DoctorProfile"""
        return hasattr(self, 'doctor_profile')

    @property
    def is_patient(self):
        """Повертає True, якщо у користувача створено PatientProfile"""
        return hasattr(self, 'patient_profile')

    def __str__(self):
        return self.username


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
        return f'Dr. {self.user.get_full_name() or self.user.username}'


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
    birth_date = models.DateField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True)
    adress = models.CharField(max_length=255, blank=True)
    photo = models.ImageField(upload_to='patient_photos/', blank=True, null=True)

    def get_full_name(self):
        return self.user.get_full_name()

    def __str__(self):
        return f'Patient {self.user.get_full_name() or self.user.username}'
