from datetime import date, time, timedelta
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import User, PatientProfile, DoctorProfile
from appointments.models import Appointment
from registry.models import DoctorLicense, InsurancePolicy


class AppointmentAPITest(APITestCase):
    def setUp(self):
        policy = InsurancePolicy.objects.create(
            insurance_policy="INS-APT-1",
            full_name="Patient User",
            provider="Test Insurance",
            valid_until=date.today() + timedelta(days=365),
        )
        license_entry = DoctorLicense.objects.create(
            license_number="DOC-APT-1",
            full_name="Doctor User",
            issued_date=date.today() - timedelta(days=365),
            valid_until=date.today() + timedelta(days=365),
        )
        self.patient_user = User.objects.create_user(username='patient', password='test123')
        self.patient = PatientProfile.objects.create(user=self.patient_user, insurance_policy=policy)
        self.doctor_user = User.objects.create_user(
            username='doctor',
            password='test123',
            role=User.Roles.DOCTOR,
        )
        self.doctor = DoctorProfile.objects.create(
            user=self.doctor_user,
            license_number=license_entry,
            specialization="Терапевт",
            work_start=time(9, 0),
            work_end=time(17, 0),
            slot_duration=30,
            work_days=list(range(7)),
        )

        self.client.login(username='patient', password='test123')

    def test_create_appointment(self):
        url = reverse('appointment-list')
        start_datetime = timezone.now() + timedelta(days=1)
        data = {
            "doctor": self.doctor.id,
            "start_datetime": start_datetime.isoformat(),
            "duration_minutes": 30,
            "reason": "Болить голова"
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['reason'], "Болить голова")

    def test_doctor_sees_own_appointments(self):
        Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            start_datetime=timezone.now() + timedelta(days=2),
            duration_minutes=30,
        )
        self.client.logout()
        self.client.login(username='doctor', password='test123')
        url = reverse('appointment-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)