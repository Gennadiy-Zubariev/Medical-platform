from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from backend.accounts.models import User, PatientProfile, DoctorProfile
from datetime import date, time

from backend.appointments.models import Appointment


class AppointmentAPITest(APITestCase):
    def setUp(self):
        self.patient_user = User.objects.create_user(username='patient', password='test123')
        self.patient = PatientProfile.objects.create(user=self.patient_user)
        self.doctor_user = User.objects.create_user(username='doctor', password='test123')
        self.doctor = DoctorProfile.objects.create(user=self.doctor_user, specialization="Терапевт")

        self.client.login(username='patient', password='test123')

    def test_create_appointment(self):
        url = reverse('appointment-list')
        data = {
            "doctor": self.doctor_user.id,
            "date": "2025-12-15",
            "time": "14:30:00",
            "reason": "Болить голова"
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['reason'], "Болить голова")

    def test_doctor_sees_own_appointments(self):
        Appointment.objects.create(
            patient=self.patient, doctor=self.doctor_user,
            date=date(2025, 12, 15), time=time(14, 30)
        )
        self.client.logout()
        self.client.login(username='doctor', password='test123')
        url = reverse('appointment-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)