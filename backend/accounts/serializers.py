from django.contrib.auth import get_user_model
from django.utils.timezone import now
from rest_framework import serializers

from .models import DoctorProfile, PatientProfile
from registry.models import DoctorLicense, InsurancePolicy

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Базовий серіалізатор юзера (для /users/me/ тощо)."""

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "role")

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email']


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

        if PatientProfile.objects.filter(insurance_policy=insurance_obj).exists():
            raise serializers.ValidationError(
                "Ця страховка вже використовується іншою особою."
            )

        if insurance_obj.valid_until < now().date():
            raise serializers.ValidationError("Страховий поліс прострочений")


        #self._insurance_obj = insurance_obj
        return value

    def create(self, validated_data):
        insurance_policy = validated_data.pop("insurance_policy")
        insurance_obj = InsurancePolicy.objects.get(insurance_policy=insurance_policy)
        # if insurance_obj is None:
        #     insurance_obj = InsurancePolicy.objects.get(insurance_policy=insurance_policy)

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

        if DoctorProfile.objects.filter(license=license_obj).exists():
            raise serializers.ValidationError(
                "Ця ліцензія вже використовується іншим лікарем."
            )

        if license_obj.valid_until < now().date():
            raise serializers.ValidationError("Ліцензія прострочена")

        # self._license_obj = license_obj
        return value

    def create(self, validated_data):
        license_number = validated_data.pop("license_number")
        specialization = validated_data.pop("specialization")
        experience_years = validated_data.pop("experience_years")

        license_obj = DoctorLicense.objects.get(license_number=license_number)
        # license_obj = getattr(self, "_license_obj", None)
        # if license_obj is None:
        #     license_obj = DoctorLicense.objects.get(license_number=license_number)

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
    insurance_policy = serializers.CharField(source="insurance_policy.insurance_policy", read_only=True)

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
    license_number = serializers.CharField(source="license_number.license_number", read_only=True)
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
    insurance_policy = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = PatientProfile
        fields = [
            "insurance_policy",
            "photo",
            "address",
        ]

    def validate_insurance_policy(self, value):
        try:
            policy = InsurancePolicy.objects.get(insurance_policy=value)
        except InsurancePolicy.DoesNotExist:
            raise serializers.ValidationError('Страховий поліс не знайдено')

        if (hasattr(policy, 'patient') and policy.patient != self.instance):
            raise serializers.ValidationError('Цей страховий поліс вже використовується')

        self._insurance_policy = policy
        return value

    def update(self, instance, validated_data):
        insurance_policy = validated_data.pop('insurance_policy', None)
        if insurance_policy:
            instance.insurance_policy = self._insurance_policy

        return super().update(instance, validated_data)

class DoctorProfileUpdateSerializer(serializers.ModelSerializer):
    license_number = serializers.CharField(
        write_only=True,
        required=False
    )

    class Meta:
        model = DoctorProfile
        fields = [
            "bio",
            "specialization",
            "experience_years",
            "photo",
            "license_number",
        ]

    def validate_license_number(self, value):
        try:
            license_obj = DoctorLicense.objects.get(license_number=value)
        except DoctorLicense.DoesNotExist:
            raise serializers.ValidationError("Ліцензію не знайдено у реєстрі")

        if (hasattr(license_obj, "doctor") and license_obj.doctor != self.instance):
            raise serializers.ValidationError("Ця ліцензія вже використовується іншим лікарем")

        self._license_obj = license_obj
        return value

    def update(self, instance, validated_data):
        license_number = validated_data.pop("license_number", None)

        if license_number:
            instance.license_number = self._license_obj

        return super().update(instance, validated_data)

class DoctorScheduleUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorProfile
        fields = ["work_start", "work_end", "slot_duration"]

    def validate_slot_duration(self, value):
        if value is None or value <= 0:
            raise serializers.ValidationError("Тривалість слота має бути > 0")
        return value
