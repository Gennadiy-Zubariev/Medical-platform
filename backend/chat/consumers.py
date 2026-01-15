from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.utils import timezone

from chat.models import ChatMessage, ChatRoom


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.group_name = f"chat_{self.room_id}"
        user = self.scope.get("user")
        if not user or user.is_anonymous:
            await self.close(code=4001)
            return
        if not await self.user_can_access_room(user, self.room_id):
            await self.close(code=4003)
            return
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        message = (content or {}).get("message")
        if not message:
            return
        user = self.scope.get("user")
        if not user or user.is_anonymous:
            return
        saved_message = await self.create_message(self.room_id, user, message)
        payload = {
            "id": saved_message.id,
            "room_id": self.room_id,
            "sender_id": user.id,
            "text": saved_message.text,
            "created_at": saved_message.created_at.isoformat(),
        }
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "chat.message",
                "payload": payload,
            },
        )

    async def chat_message(self, event):
        await self.send_json(event["payload"])

    @database_sync_to_async
    def user_can_access_room(self, user, room_id):
        try:
            room = ChatRoom.objects.select_related(
                "appointment__patient__user",
                "appointment__doctor__user",
            ).get(id=room_id)
        except ChatRoom.DoesNotExist:
            return False
        return user.id in {
            room.appointment.patient.user_id,
            room.appointment.doctor.user_id,
        }

    @database_sync_to_async
    def create_message(self, room_id, user, text):
        return ChatMessage.objects.create(
            room_id=room_id,
            sender=user,
            text=text,
            created_at=timezone.now(),
        )