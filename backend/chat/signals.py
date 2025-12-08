from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(post_save, sender='appointments.Appointment')
def create_chat_room(sender, instance, **kwargs):
    if instance.status == 'confirmed' and not hasattr(instance, 'chat_room'):
        from backend.chat.models import ChatRoom
        ChatRoom.objects.create(appointment=instance)