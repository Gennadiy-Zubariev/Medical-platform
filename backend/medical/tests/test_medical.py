from datetime import date, time, timedelta
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User, PatientProfile, DoctorProfile
from appointments.models import Appointment
from medical.models import MedicalCard, MedicalRecord
from registry.models import DoctorLicense, InsurancePolicy


class MedicalAPITest(APITestCase):
    def setUp(self):
        self.policy = InsurancePolicy.objects.create(
            insurance_policy="INS-MED-1",
            full_name="Medical Patient",
            provider="Medical Insurer",
            valid_until=date.today() + timedelta(days=365),
        )
        self.license_entry = DoctorLicense.objects.create(
            license_number="DOC-MED-1",
            full_name="Medical Doctor",
            issued_date=date.today() - timedelta(days=365),
            valid_until=date.today() + timedelta(days=365),
        )
        self.patient_user = User.objects.create_user(
            username="patient-med",
            password="test123",
            role=User.Roles.PATIENT,
        )
        self.patient_profile = PatientProfile.objects.create(
            user=self.patient_user,
            insurance_policy=self.policy,
        )
        self.doctor_user = User.objects.create_user(
            username="doctor-med",
            password="test123",
            role=User.Roles.DOCTOR,
        )
        self.doctor_profile = DoctorProfile.objects.create(
            user=self.doctor_user,
            license_number=self.license_entry,
            specialization="Кардіолог",
            work_start=time(9, 0),
            work_end=time(17, 0),
            slot_duration=30,
            work_days=list(range(7)),
        )

    def test_patient_can_view_own_medical_card(self):
        self.client.login(username="patient-med", password="test123")
        response = self.client.get(reverse("medical-cards-my"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["patient"]["user"]["username"], "patient-med")

    def test_doctor_can_create_medical_record(self):
        card = MedicalCard.objects.create(patient=self.patient_profile)
        appointment = Appointment.objects.create(
            patient=self.patient_profile,
            doctor=self.doctor_profile,
            start_datetime=timezone.now() + timedelta(days=1),
            duration_minutes=30,
        )
        self.client.login(username="doctor-med", password="test123")
        payload = {
            "card_id": card.id,
            "diagnosis": "ГРВІ",
            "appointment": appointment.id,
            "recommendations": "Відпочинок",
        }
        response = self.client.post(reverse("medical-records-list"), payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        record = MedicalRecord.objects.get(pk=response.data["id"])
        self.assertEqual(record.doctor, self.doctor_profile)
