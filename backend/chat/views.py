from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from yaml import serialize

from .models import ChatRoom, ChatMessage
from .serializers import ChatRoomSerializer, ChatMassageSerializer
from .permissions import IsChatParticipant
from appointments.models import Appointment


class ChatRoomViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated, IsChatParticipant]

    def retrieve(self, request, pk=None):
        """
        GET /api/chat/rooms/{appointment_id}/
        """
        try:
            appointment = Appointment.objects.get(pk=pk)
        except Appointment.DoesNotExist:
            return Response({'detail': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)
        room, _ = ChatRoom.objects.get_or_create(appointment=appointment)

        self.check_object_permissions(request, room)

        serializer = ChatRoomSerializer(room)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def messages(self, request, pk=None):
        """
        POST /api/chat/rooms/{appointment_id}/messages/
        """
        appointment = Appointment.objects.get(pk=pk)
        room, _ = ChatRoom.objects.get_or_create(appointment=appointment)

        self.check_object_permissions(request, room)

        serializer = ChatMassageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ChatMessage.objects.create(
            room=room,
            sender=request.user,
            text=serializer.validated_data['text']
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """
        Marks all unread chat messages as read for a specific chat room associated with an
        appointment, except for messages sent by the requesting user.

        This endpoint is designed to ensure that a user can explicitly mark messages
        as read within the context of their associated chat room.

        :param request: The HTTP request object that must include the user making
            the request.
        :param pk: The primary key of the appointment for which associated chat
            messages need to be marked as read.
        :return: A Response object containing a dictionary with the key 'status'
            and value 'ok'.
        """
        appointment = Appointment.objects.get(pk=pk)
        room = ChatRoom.objects.get(appointment=appointment)

        self.check_object_permissions(request, room)

        ChatMessage.objects.filter(
            room=room,
            is_read=False
        ).exclude(sender=request.user).update(
            is_read=True
        )

        return Response({'status': 'ok'})
