from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "patient",
        "doctor",
        "start_datetime",
        "duration_minutes",
        "status",
    )
    list_filter = ("status", "start_datetime")
    search_fields = (
        "patient__user__username",
        "doctor__user__username",
        "reason",
    )
