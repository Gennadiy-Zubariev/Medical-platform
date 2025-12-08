from rest_framework import serializers
from .models import ChatRoom, Message


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.ReadOnlyField(source="sender.username")

    class Meta:
        model = Message
        fields = ["id", "room", "sender", "sender_username", "text", "created_at"]
        read_only_fields = ["sender"]


class ChatRoomSerializer(serializers.ModelSerializer):
    participants_usernames = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ["id", "participants", "participants_usernames", "created_at"]

    def get_participants_usernames(self, obj):
        return [u.username for u in obj.participants.all()]
