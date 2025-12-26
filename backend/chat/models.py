from django.db import models
from django.conf import settings
from appointments.models import Appointment
from django.db import models


class ChatRoom(models.Model):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name="chat_room")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chat for appointment #{self.appointment.id}"


class ChatMessage(models.Model):
    room = models.ForeignKey(
        ChatRoom,
        on_delete=models.CASCADE,
        related_name="messages"
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="chat_messages"
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'Повідомлення від {self.sender.username} у чаті {self.room.id}'


