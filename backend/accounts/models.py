from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from registry.models import DoctorLicense, InsurancePolicy




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
    license_number = models.OneToOneField(
        DoctorLicense,
        on_delete=models.PROTECT,
        related_name='doctor',
        help_text="Посилання на офіційний номер ліцензії",
    )
    bio = models.TextField(blank=True)
    specialization = models.CharField(max_length=255)
    experience_years = models.PositiveIntegerField(null=True, blank=True)
    photo = models.ImageField(upload_to='doctor_photos/', blank=True, null=True)

    work_start = models.TimeField(blank=True, null=True)
    work_end = models.TimeField(blank=True, null=True)
    slot_duration = models.PositiveIntegerField(blank=True, null=True)

    work_days = models.JSONField(blank=True, null=True, help_text="Робочі дні тижня: 0=Пн … 6=Нд")

    is_booking_open = models.BooleanField(default=False)

    def has_valid_schedule(self):
        if not self.work_start or not self.work_end or not self.slot_duration or not self.work_days:
            return False

        if not isinstance(self.work_days, list) or len(self.work_days) == 0:
            return False

        if any(day not in range(7) for day in self.work_days):
            return False

        return (
                self.work_start < self.work_end
                and self.slot_duration > 0
        )


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
    address = models.CharField(max_length=255, blank=True)
    photo = models.ImageField(upload_to='patient_photos/', blank=True, null=True)
    insurance_policy= models.OneToOneField(
        InsurancePolicy,
        on_delete=models.PROTECT,
        related_name='patient',
    )


    def __str__(self):
        return f'Patient {self.user.username}'



