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
        """
        Initializes all necessary data fixtures for testing purposes. This method creates
        instances of various models, including insurance policies, doctor licenses,
        users, and their related profiles. The created data includes one patient user
        with an associated insurance policy and one doctor user with an associated
        license and profile. The doctor profile also contains detailed information
        regarding work schedule and specialization.

        Attributes created:
        - InsurancePolicy: An insurance policy associated with the patient.
        - DoctorLicense: A license associated with the doctor.
        - Patient User: A user with the role of "PATIENT" and associated profile.
        - Doctor User: A user with the role of "DOCTOR" and associated profile.

        :return: None
        """
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
        """
        Tests if a patient can successfully view their own medical card.

        The test ensures that a patient user is able to log in and retrieve their
        medical card information through the appropriate endpoint. The response is
        then verified for the correct status code and matching username data.

        :param self: Reference to the test case instance.
        :return: None
        """
        self.client.login(username="patient-med", password="test123")
        response = self.client.get(reverse("medical-cards-my"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["patient"]["user"]["username"], "patient-med")

    def test_doctor_can_create_medical_record(self):
        """
        Tests that a doctor can successfully create a medical record for a patient.

        This test ensures that when a logged-in doctor submits a POST request with
        the necessary details for creating a medical record, the request is processed
        correctly, and the resulting medical record is stored with the appropriate
        values.

        :raises AssertionError: If the HTTP response status code is not 201 (Created),
            or if the created medical record does not have the expected values.

        :return: None
        """
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
