from django.urls import path
from .views import LicenseCheckAPIView, InsuranceCheckAPIView

urlpatterns = [
    path("license/<str:license_number>/", LicenseCheckAPIView.as_view()),
    path("insurance/<str:insurance_policy>/", InsuranceCheckAPIView.as_view()),
]