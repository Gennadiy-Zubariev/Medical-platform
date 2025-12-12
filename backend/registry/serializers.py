from rest_framework import serializers
from .models import DoctorLicense, InsurancePolicy


class LicenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorLicense
        fields = "__all__"


class InsuranceSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsurancePolicy
        fields = "__all__"