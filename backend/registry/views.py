from rest_framework import generics
from .models import DoctorLicense, InsurancePolicy
from .serializers import LicenseSerializer, InsuranceSerializer

class LicenseCheckAPIView(generics.RetrieveAPIView):
    queryset = DoctorLicense.objects.all()
    serializer_class = LicenseSerializer
    lookup_field = "license_number"


class InsuranceCheckAPIView(generics.RetrieveAPIView):
    queryset = InsurancePolicy.objects.all()
    serializer_class = InsuranceSerializer
    lookup_field = "insurance_policy"
