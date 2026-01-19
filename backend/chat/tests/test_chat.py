from datetime import date, time, timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User, PatientProfile, DoctorProfile
from appointments.models import Appointment
from chat.models import ChatMessage
from registry.models import DoctorLicense, InsurancePolicy


class ChatRoomAPITest(APITestCase):
    def setUp(self):
        policy = InsurancePolicy.objects.create(
            insurance_policy="INS-CHAT-1",
            full_name="Chat Patient",
            provider="Chat Insurer",
            valid_until=date.today() + timedelta(days=365),
        )
        license_entry = DoctorLicense.objects.create(
            license_number="DOC-CHAT-1",
            full_name="Chat Doctor",
            issued_date=date.today() - timedelta(days=365),
            valid_until=date.today() + timedelta(days=365),
        )
        self.patient_user = User.objects.create_user(
            username="patient-chat",
            password="test123",
            role=User.Roles.PATIENT,
        )
        self.patient_profile = PatientProfile.objects.create(
            user=self.patient_user,
            insurance_policy=policy,
        )
        self.doctor_user = User.objects.create_user(
            username="doctor-chat",
            password="test123",
            role=User.Roles.DOCTOR,
        )
        self.doctor_profile = DoctorProfile.objects.create(
            user=self.doctor_user,
            license_number=license_entry,
            specialization="Терапевт",
            work_start=time(9, 0),
            work_end=time(17, 0),
            slot_duration=30,
            work_days=list(range(7)),
        )
        self.appointment = Appointment.objects.create(
            patient=self.patient_profile,
            doctor=self.doctor_profile,
            start_datetime=timezone.now() + timedelta(days=1),
            duration_minutes=30,
        )

    def test_patient_can_open_chat_room(self):
        self.client.login(username="patient-chat", password="test123")
        response = self.client.get(reverse("chat-rooms-detail", args=[self.appointment.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["appointment"], self.appointment.id)

    def test_doctor_can_mark_messages_as_read(self):
        self.client.login(username="patient-chat", password="test123")
        message_payload = {"text": "Добрий день!"}
        response = self.client.post(
            reverse("chat-rooms-messages", args=[self.appointment.id]),
            message_payload,
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.client.logout()

        self.client.login(username="doctor-chat", password="test123")
        response = self.client.post(reverse("chat-rooms-mark-as-read", args=[self.appointment.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(ChatMessage.objects.filter(is_read=True).exists())
