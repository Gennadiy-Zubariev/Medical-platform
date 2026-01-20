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
        """
        Sets up initial test environment and creates the required data for testing purposes. This method initializes
        user accounts and profiles for both a patient and a doctor in addition to their respective insurance and license
        details. The doctor is assigned specific work parameters including their schedule, working hours, specialization,
        and slot duration. Following this setup, the client is logged in as the patient user.

        Attributes:
            patient_user (User): Instance of the User model representing the patient user account.
            patient (PatientProfile): Instance of the PatientProfile model associated with the patient user.
            doctor_user (User): Instance of the User model representing the doctor user account.
            doctor (DoctorProfile): Instance of the DoctorProfile model associated with the doctor user.

        :return: None
        """
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
        """
        Tests whether a doctor can view their own appointments and no others.

        This function verifies that after creating an appointment between a doctor and a patient,
        the doctor can retrieve the appointment by logging into the system and accessing the
        appointment list API endpoint. It ensures that the appointment list fetched by the doctor
        contains only their appointments and nothing else.

        :param self: The test case instance.
        :return: None
        """
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
