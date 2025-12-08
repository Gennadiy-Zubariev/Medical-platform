from django.urls import path, include
from  rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    PatientRegisterViewSet,
    DoctorRegisterViewSet,
    PatientProfileViewSet,
    DoctorProfileViewSet,
)

router = DefaultRouter()
router.register('users', UserViewSet, basename='users')
router.register('patient-profiles', PatientProfileViewSet, basename='patient-profiles')
router.register('doctor-profiles', DoctorProfileViewSet, basename='doctor-profiles')

patient_register = PatientRegisterViewSet.as_view({'post': 'register'})
doctor_register = DoctorRegisterViewSet.as_view({'post': 'register'})

urlpatterns = [
    path('register/patient/', patient_register, name='register-patient'),
    path('register/doctor/', doctor_register, name='register-doctor'),
    path('', include(router.urls)),
]