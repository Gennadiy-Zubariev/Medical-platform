from django.contrib import admin
from .models import DoctorLicense, InsurancePolicy
# Register your models here.
admin.site.register(DoctorLicense)
admin.site.register(InsurancePolicy)