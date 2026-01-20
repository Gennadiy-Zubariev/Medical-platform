from datetime import date, timedelta
from rest_framework.test import APITestCase
from registry.models import DoctorLicense, InsurancePolicy


class RegistryAPITest(APITestCase):
    def setUp(self):
        """
        Sets up the test environment by creating instances of DoctorLicense and
        InsurancePolicy with predefined attributes.

        :returns: None
        """
        self.license = DoctorLicense.objects.create(
            license_number="DOC-REG-1",
            full_name="Dr. Registry",
            issued_date=date.today() - timedelta(days=365),
            valid_until=date.today() + timedelta(days=365),
        )
        self.policy = InsurancePolicy.objects.create(
            insurance_policy="INS-REG-1",
            full_name="Registry Patient",
            provider="Registry Insurer",
            valid_until=date.today() + timedelta(days=365),
        )

    def test_license_lookup(self):
        """
        Tests the behavior and correctness of the license lookup endpoint.

        The method sends a GET request to the license lookup endpoint using the license
        number and verifies that the response contains the correct license number and
        a status code of 200.

        :return: None
        """
        response = self.client.get(f"/api/registry/license/{self.license.license_number}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["license_number"], self.license.license_number)

    def test_insurance_lookup(self):
        """
        Performs a test to validate the retrieval of insurance policy details from the
        insurance lookup API endpoint and ensures that the policy data matches the
        expected results.

        :return: None
        """

        response = self.client.get(f"/api/registry/insurance/{self.policy.insurance_policy}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["insurance_policy"], self.policy.insurance_policy)
