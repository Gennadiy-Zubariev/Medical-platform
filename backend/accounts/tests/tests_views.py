from rest_framework.test import APITestCase
from django.urls import reverse
from backend.accounts.models import PatientProfile
from django.contrib.auth import get_user_model

User = get_user_model()

class AccountsAPITest(APITestCase):

    def test_register_patient_create_profile(self):
        url = reverse('register-patient')
        data = {
            'username': 'test_user',
            'email': 'test@test.com',
            'password': 'VeryStrongPassword123!',
            'password_2': 'VeryStrongPassword123!',
        }
        responce = self.client.post(url, data, format='json')
        self.assertEqual(responce.status_code, 201)
        user = User.objects.get(username='test_user')
        self.assertTrue(hasattr(user, 'patient_profile'))
