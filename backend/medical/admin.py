from django.contrib import admin
from .models import MedicalCard, MedicalRecord


admin.site.register(MedicalCard)
admin.site.register(MedicalRecord)
