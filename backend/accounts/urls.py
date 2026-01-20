from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    RegisterPatientView,
    RegisterDoctorView,
    PatientProfileViewSet,
    DoctorProfileViewSet,
    DoctorSpecializationsAPIView,
    DoctorPublicListAPIView,
    DoctorPublicDetailAPIView,
    DoctorScheduleView,
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')
router.register(r'patient-profiles', PatientProfileViewSet, basename='patient-profiles')
router.register(r'doctor-profiles', DoctorProfileViewSet, basename='doctor-profiles')

urlpatterns = [
    path('register/patient/', RegisterPatientView.as_view(), name='register-patient'),
    path('register/doctor/', RegisterDoctorView.as_view(), name='register-doctor'),
    path("doctors/specializations/", DoctorSpecializationsAPIView.as_view(), name="doctor-specializations"),
    path("doctors/", DoctorPublicListAPIView.as_view(), name="doctor-public-list"),
    path("doctors/<int:pk>/", DoctorPublicDetailAPIView.as_view(), name="doctor-public-detail"),
    path("doctor/schedule/", DoctorScheduleView.as_view(), name="doctor-schedule"),
    path('', include(router.urls)),
]
