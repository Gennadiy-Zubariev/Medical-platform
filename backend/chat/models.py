from django.db import models
from django.conf import settings


class ChatRoom(models.Model):
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="chat_rooms"
    )
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
        return f'Повідомленні від {self.sender.username} in room {self.room.id}'


