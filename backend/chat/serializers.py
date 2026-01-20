from rest_framework import serializers
from .models import ChatRoom, ChatMessage
from accounts.serializers import UserSerializer


class ChatMassageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    room = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = ChatMessage
        fields = [
            "id",
            "room",
            "sender",
            "text",
            "created_at",
            "is_read",
        ]


class ChatRoomSerializer(serializers.ModelSerializer):
    messages = ChatMassageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatRoom
        fields = [
            'id',
            'appointment',
            'messages',
            'created_at',
        ]
