from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import DoctorProfile, PatientProfile
from registry.models import DoctorLicense, InsurancePolicy

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Базовий серіалізатор юзера (для /users/me/ тощо)."""

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "role")


class PatientRegisterSerializer(serializers.ModelSerializer):
    """
    Серіалізатор для реєстрації пацієнта.
    Створює User з роллю PATIENT + PatientProfile.
    """

    insurance_policy = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            "username",
            "password",
            "email",
            "first_name",
            "last_name",
            "insurance_policy",
        )
        extra_kwargs = {
            "password": {"write_only": True},
            "email": {"required": True},
        }

    def validate_insurance_policy(self, value: str):
        """
        1) Перевіряємо, що такий номер є в офіційному реєстрі.
        2) Перевіряємо, що він ще не прив’язаний до іншого пацієнта.
        """
        try:
            insurance_obj = InsurancePolicy.objects.get(insurance_policy=value)
        except InsurancePolicy.DoesNotExist:
            raise serializers.ValidationError("Невірний номер страховки!")


        if hasattr(insurance_obj, "patient"):
            raise serializers.ValidationError("Ця страховка вже використовується іншою особою.")


        self._insurance_obj = insurance_obj
        return value

    def create(self, validated_data):
        insurance_policy = validated_data.pop("insurance_policy")
        insurance_obj = getattr(self, "_insurance_obj", None)
        if insurance_obj is None:
            insurance_obj = InsurancePolicy.objects.get(insurance_policy=insurance_policy)

        user = User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            email=validated_data.get("email"),
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            role=User.Roles.PATIENT,
        )

        PatientProfile.objects.create(
            user=user,
            insurance_policy=insurance_obj,
        )

        return user


class DoctorRegisterSerializer(serializers.ModelSerializer):
    """
    Серіалізатор для реєстрації докторів.
    Перевіряє номер ліцензії по LicenseRegistry.
    """

    license_number = serializers.CharField(write_only=True)
    specialization = serializers.CharField(write_only=True)
    experience_years = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = (
            "username",
            "password",
            "email",
            "first_name",
            "last_name",
            "license_number",
            "specialization",
            "experience_years",
        )
        extra_kwargs = {
            "password": {"write_only": True},
            "email": {"required": True},
        }

    def validate_license_number(self, value: str):
        """
        1) Перевіряємо, що такий номер є в офіційному реєстрі.
        2) Перевіряємо, що він ще не прив’язаний до іншого доктора.
        """
        try:
            license_obj = DoctorLicense.objects.get(license_number=value)
        except DoctorLicense.DoesNotExist:
            raise serializers.ValidationError("Невірний номер ліцензії!")


        if hasattr(license_obj, "doctor"):
            raise serializers.ValidationError("Ця ліцензія вже використовується іншим лікарем.")


        self._license_obj = license_obj
        return value

    def create(self, validated_data):
        license_number = validated_data.pop("license_number")
        specialization = validated_data.pop("specialization")
        experience_years = validated_data.pop("experience_years")


        license_obj = getattr(self, "_license_obj", None)
        if license_obj is None:
            license_obj = DoctorLicense.objects.get(license_number=license_number)

        user = User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            email=validated_data.get("email"),
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            role=User.Roles.DOCTOR,
        )

        DoctorProfile.objects.create(
            user=user,
            license_number=license_obj,
            specialization=specialization,
            experience_years=experience_years,
        )

        return user


class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = PatientProfile
        fields = (
            "id",
            "user",
            "date_of_birth",
            "address",
            "photo",
            "insurance_policy",
        )


class DoctorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    license_number = serializers.CharField(source="license.license_number", read_only=True)
    is_schedule_ready = serializers.SerializerMethodField()


    class Meta:
        model = DoctorProfile
        fields = (
            "id",
            "user",
            "license_number",
            "bio",
            "specialization",
            "experience_years",
            "photo",
            "work_start",
            "work_end",
            "slot_duration",
            "is_booking_open",
            "is_schedule_ready",
        )

    def get_is_schedule_ready(self, obj):
        return obj.has_valid_schedule()


class CurrentUserSerializer(serializers.ModelSerializer):
    """
    Серіалізатор для /users/me/:
    повертає юзера + вбудовані профілі, якщо вони є.
    """
    patient_profile = PatientProfileSerializer(read_only=True)
    doctor_profile = DoctorProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "patient_profile",
            "doctor_profile",
        )


class PatientProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = [
            "insurance_number",
            "photo",
            "address",
        ]

class DoctorProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorProfile
        fields = [
            "bio",
            "specialization",
            "experience_years",
            "license_number",
            "photo",
        ]