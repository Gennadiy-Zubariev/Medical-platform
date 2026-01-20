from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.utils import timezone

from chat.models import ChatMessage, ChatRoom
from chat.serializers import ChatMassageSerializer


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        """
        Establishes a connection for the user to the specified chat room. This method
        ensures that the user is authenticated and authorized to access the room before
        proceeding with the connection setup. If the user is not authenticated or lacks
        proper access permissions, the connection request is closed with an appropriate
        error code.

        :raises RuntimeError: if the channel layer group addition or WebSocket acceptance
                              fails during the connection process.

        """
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
        """
        Disconnects a WebSocket connection and removes the channel from the group.

        :param close_code: An integer representing the WebSocket close code. Provides information about the reason
                           for the connection closure.
        :return: None
        """
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        """
        Handles receiving a JSON message, processes it, saves it as a chat message,
        and broadcasts it to the associated group channel.

        :param content: The JSON content received, expected to include a "message" key.
        :type content: dict
        :param kwargs: Additional keyword arguments for the message processing.
        :type kwargs: dict
        :return: None
        """
        message = (content or {}).get("message")
        if not message:
            return
        user = self.scope.get("user")
        if not user or user.is_anonymous:
            return
        saved_message = await self.create_message(self.room_id, user, message)

        # Use serializer to convert the message object to JSON
        serializer = ChatMassageSerializer(saved_message)
        payload = serializer.data

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
        """
        Determines whether a user has access to a specified chat room.

        This method checks if a given user is either the patient or doctor associated
        with the appointment linked to the specified chat room.

        :param user: The user for whom access to the chat room is being checked.
        :type user: User
        :param room_id: The unique identifier of the chat room.
        :type room_id: int
        :return: True if the user has access to the chat room (either as the associated
                 patient or doctor), otherwise False.
        :rtype: bool
        """
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
