from rest_framework.decorators import action
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from backend.accounts.serializers import (
    RegisterPatientSerializer,
    RegisterDoctorSerializer,
    UserProfileSerializer,
    PatientProfileSerializer,
    DoctorProfileSerializer,
)
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterPatientView(generics.CreateAPIView):
    serializer_class = RegisterPatientSerializer
    permission_classes = [AllowAny]


class RegisterDoctorView(generics.CreateAPIView):
    serializer_class = RegisterDoctorSerializer
    permission_classes = [AllowAny]


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


    @action(
    detail=False,
    methods=['post'],
    url_path='deactivate',
    permission_classes=[IsAuthenticated]
    )
    def deactivate(self, request):
        user = request.user
        if not user.is_active:
            return Response(
                {'detail': 'User is already deactivated'},
                status=status.HTTP_400_BAD_REQUEST
            )

        request.user.is_active = False
        request.user.save()
        return Response(
            {'detail': 'User deactivated successfully'},
            status=status.HTTP_200_OK
        )


class PatientProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = PatientProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.patient_profile


class DoctorProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = DoctorProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.doctor_profile
