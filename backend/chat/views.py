from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer


class ChatRoomViewSet(viewsets.ModelViewSet):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        room = serializer.save()
        room.participants.add(self.request.user)

    @action(detail=True, methods=["post"])
    def join(self, request, pk=None):
        room = self.get_object()
        room.participants.add(request.user)
        return Response({"detail": "Joined room"})

    @action(detail=True, methods=["get"])
    def messages(self, request, pk=None):
        room = self.get_object()
        messages = room.messages.order_by("created_at")
        return Response(MessageSerializer(messages, many=True).data)


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
