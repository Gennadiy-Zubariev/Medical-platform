from django.db import models
from django.conf import settings
from appointments.models import Appointment


class ChatRoom(models.Model):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name="chat_room")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        users = ", ".join([u.username for u in self.participants.all()])
        return f"Room ({users})"


class Message(models.Model):
    room = models.ForeignKey(
        ChatRoom,
        on_delete=models.CASCADE,
        related_name="messages"
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_messages"
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Повідомлення від {self.sender.username} у чаті {self.room.id}'


