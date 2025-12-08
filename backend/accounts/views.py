from django.contrib.auth import get_user_model
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import PatientProfile, DoctorProfile
from .serializers import (
    UserSerializer,
    RegisterPatientSerializer,
    RegisterDoctorSerializer,
    PatientProfileSerializer,
    DoctorProfileSerializer,
)
from .permissions import IsOwnerOrReadOnly

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['list', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()

    @action(methods=['get', 'patch'], detail=False, url_path='me')
    def me(self, request):
        user = request.user

        if request.method == 'GET':
            return Response(UserSerializer(user).data)

        serializer = UserSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

########у міксіни
class PatientRegisterViewSet(viewsets.GenericViewSet):
    serializer_class = RegisterPatientSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

########у міксіни
class DoctorRegisterViewSet(viewsets.GenericViewSet):
    serializer_class = RegisterDoctorSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class PatientProfileViewSet(viewsets.ModelViewSet):
    queryset = PatientProfile.objects.select_related('user')
    serializer_class = PatientProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

class DoctorProfileViewSet(viewsets.ModelViewSet):
    queryset = DoctorProfile.objects.select_related('user')
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

