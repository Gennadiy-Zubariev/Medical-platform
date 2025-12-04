from rest_framework import serializers
from backend.accounts.models import PatientProfile, DoctorProfile
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model


User = get_user_model()

class RegisterPatientSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_2 = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password_2']

    def validate(self, data):
        if data['password'] != data['password_2']:
            raise serializers.ValidationError('Passwords don\'t match')
        return data

    def create(self, validated_data):
        validated_data.pop('password_2')
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
        )
        PatientProfile.objects.create(user=user)
        return user


class RegisterDoctorSerializer(RegisterPatientSerializer):
    specialization = serializers.CharField(write_only=True, required=True)

    def create(self, validated_data):
        specialization = validated_data.pop('specialization')
        user = super().create(validated_data)
        DoctorProfile.objects.create(user=user, specialization=specialization)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    is_doctor = serializers.BooleanField(source='is_doctor', read_only=True)
    is_patient = serializers.BooleanField(source='is_patient', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_doctor', 'is_patient']
        read_only_fields = ['id', 'is_doctor', 'is_patient']




    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)

    class Meta:
        model = PatientProfile
        fields = ['user', 'birth_date', 'phone', 'adress', 'photo']
        read_only_fields = ['user']


class DoctorProfileSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)

    class Meta:
        model = DoctorProfile
        fields = ['user', 'bio', 'specialization', 'photo', 'experience_years']
        read_only_fields = ['user']
