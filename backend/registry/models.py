from django.db import models

class DoctorLicense(models.Model):
    license_number = models.CharField(max_length=50, unique=True)
    full_name = models.CharField(max_length=255)
    issued_date = models.DateField()
    valid_until = models.DateField()

    def __str__(self):
        return f'{self.full_name} - {self.license_number}'

class InsurancePolicy(models.Model):
    insurance_policy = models.CharField(max_length=50, unique=True)
    full_name = models.CharField(max_length=255)
    provider = models.CharField(max_length=255)
    valid_until = models.DateField()

    def __str__(self):
        return f'{self.full_name} - {self.insurance_policy}'