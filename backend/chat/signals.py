from django.db.models.signals import post_save
from django.dispatch import receiver
from appointments.models import Appointment
from chat.models import ChatRoom


@receiver(post_save, sender='appointments.Appointment')
def create_chat_room(sender, instance, **kwargs):
    if instance.status == Appointment.Status.CONFIRMED:
        ChatRoom.objects.get_or_create(appointment=instance)