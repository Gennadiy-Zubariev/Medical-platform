from datetime import date, timedelta
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from registry.models import InsurancePolicy

User = get_user_model()


class AccountsAPITest(APITestCase):

    def test_register_patient_create_profile(self):
        """
        Test case for registering a patient and creating their profile.

        This test creates an insurance policy, simulates a patient registration request,
        and validates the creation of a new user and their associated patient profile.

        :raises AssertionError: Raised if the response status code is not 201 or the user
            does not have a patient profile.

        :return: None
        """
        policy = InsurancePolicy.objects.create(
            insurance_policy="INS-123",
            full_name="Test User",
            provider="Test Insurance",
            valid_until=date.today() + timedelta(days=365),
        )
        url = reverse('register-patient')
        data = {
            'username': 'test_user',
            'email': 'test@test.com',
            'password': 'VeryStrongPassword123!',
            'date_of_birth': '1990-01-01',
            'insurance_policy': policy.insurance_policy,
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(username='test_user')
        self.assertTrue(hasattr(user, 'patient_profile'))
