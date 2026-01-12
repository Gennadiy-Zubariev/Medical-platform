from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response


from .models import PatientProfile, DoctorProfile
from .serializers import (
    UserSerializer,
    PatientRegisterSerializer,
    DoctorRegisterSerializer,
    PatientProfileSerializer,
    DoctorProfileSerializer,
    PatientProfileUpdateSerializer,
    DoctorProfileUpdateSerializer,
    DoctorScheduleUpdateSerializer,
    DoctorPublicSerializer,
)

from .permissions import IsOwnerOrReadOnly, IsDoctor

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


class RegisterPatientView(generics.CreateAPIView):
    """
    POST /api/accounts/register/patient/
    Реєстрація пацієнта.
    """
    serializer_class = PatientRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class RegisterDoctorView(generics.CreateAPIView):
    """
    POST /api/accounts/register/doctor/
    Реєстрація лікаря з перевіркою ліцензії.
    """
    serializer_class = DoctorRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)



class PatientProfileViewSet(viewsets.ModelViewSet):
    queryset = PatientProfile.objects.select_related('user')
    serializer_class = PatientProfileSerializer

    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]


    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return self.queryset
        return self.queryset.filter(user=user)

    @action(detail=False, methods=["get", "patch"], url_path="me")
    def me(self, request):
        """
        GET /api/accounts/patient-profiles/me/  -> поточний профіль
        PATCH /api/accounts/patient-profiles/me/ -> оновити поточний профіль
        """
        profile = request.user.patient_profile

        if request.method == "GET":
            serializer = PatientProfileSerializer(profile)
            return Response(serializer.data)

        if request.method == "PATCH":
            serializer = PatientProfileUpdateSerializer(profile, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            profile.refresh_from_db()
            return Response(PatientProfileSerializer(profile).data)


class DoctorProfileViewSet(viewsets.ModelViewSet):
    queryset = DoctorProfile.objects.select_related('user')
    serializer_class = DoctorProfileSerializer

    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]


    def get_queryset(self):
        user = self.request.user
        if user.is_doctor():
            return self.queryset.filter(user=user)
        return self.queryset

    @action(detail=False, methods=["get", "patch"], url_path="me")
    def me(self, request):
        """
        GET /api/accounts/doctor-profiles/me/
        PATCH /api/accounts/doctor-profiles/me/
        """
        profile = request.user.doctor_profile

        if request.method == "GET":
            serializer = DoctorProfileSerializer(profile)
            return Response(serializer.data)

        if request.method == "PATCH":
            serializer = DoctorProfileUpdateSerializer(profile, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            profile.refresh_from_db()
            return Response(DoctorProfileSerializer(profile).data)


    @action(
        detail=False,
        methods=["post"],
        permission_classes=[IsAuthenticated, IsDoctor],
        url_path="toggle-booking"
    )
    def toggle_booking(self, request):
        doctor = request.user.doctor_profile
        doctor.is_booking_open = not doctor.is_booking_open
        doctor.save(update_fields=["is_booking_open"])

        return Response(
            {"is_booking_open": doctor.is_booking_open},
            status=status.HTTP_200_OK
        )

    # @action(detail=False, methods=["patch"], url_path="me/schedule", permission_classes=[permissions.IsAuthenticated])
    # def update_schedule(self, request):
    #     profile = request.user.doctor_profile
    #     serializer = DoctorScheduleUpdateSerializer(profile, data=request.data, partial=True)
    #     serializer.is_valid(raise_exception=True)
    #     serializer.save()
    #     return Response(DoctorProfileSerializer(profile).data, status=status.HTTP_200_OK)


class DoctorScheduleView(RetrieveUpdateAPIView):
    serializer_class = DoctorScheduleUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.doctor_profile


class DoctorSpecializationsAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self,request):
        specs = (
            DoctorProfile.objects
            .exclude(specialization__isnull=True)
            .exclude(specialization__exact="")
            .values_list("specialization", flat=True)
            .distinct()
            .order_by("specialization")
        )
        return Response(list(specs))


class DoctorPublicListAPIView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = DoctorPublicSerializer

    def get_queryset(self):
        queryset = DoctorProfile.objects.select_related("user")


        spec = self.request.query_params.get("specialization")
        if spec:
            queryset = queryset.filter(specialization__iexact=spec)


        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search)
            )

        return queryset.order_by("user__last_name", "user__first_name")


class DoctorPublicDetailAPIView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = DoctorPublicSerializer
    queryset = DoctorProfile.objects.select_related("user")