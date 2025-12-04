from django.urls import path
from backend.accounts.views import (
    RegisterDoctorView,
    RegisterPatientView,
    ProfileView,
    PatientProfileDetailView,
    DoctorProfileDetailView,
)

urlpatterns = [
    path('register/patient/', RegisterPatientView.as_view(), name='register-patient'),
    path('register/doctor/', RegisterDoctorView.as_view(), name='register-doctor'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/patient/', PatientProfileDetailView.as_view(), name='patient-profile'),
    path('profile/doctor/', DoctorProfileDetailView.as_view(), name='doctor-profile'),

]