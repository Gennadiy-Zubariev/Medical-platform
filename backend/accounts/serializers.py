from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import PatientProfile, DoctorProfile

User = get_user_model()



class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role', 'phone_number']


class RegisterUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField( write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class RegisterPatientSerializer(RegisterUserSerializer):

    def create(self, validated_data):
        validated_data['role'] = User.Roles.PATIENT
        user = super().create(validated_data)
        PatientProfile.objects.create(user=user)
        return user

class RegisterDoctorSerializer(RegisterUserSerializer):
    specialization = serializers.CharField(write_only=True)

    class Meta(RegisterUserSerializer.Meta):
        fields = RegisterUserSerializer.Meta.fields + ['specialization']

    def create(self, validated_data):
        specialization = validated_data.pop('specialization')
        validated_data['role'] = User.Roles.DOCTOR
        user = super().create(validated_data)
        DoctorProfile.objects.create(user=user, specialization=specialization)
        return user

class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = PatientProfile
        fields = ['id', 'user', 'date_of_birth', 'address', 'insurance_number']

class DoctorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = DoctorProfile
        fields = ['id', 'user', 'specialization', 'bio', 'experience_years']
