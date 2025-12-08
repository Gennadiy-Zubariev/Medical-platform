from django.contrib import admin
from django.contrib.auth import get_user_model

from .models import PatientProfile, DoctorProfile

User = get_user_model()


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "email", "role")
    list_filter = ("role",)
    search_fields = ("username", "email")


admin.site.register(PatientProfile)
admin.site.register(DoctorProfile)
