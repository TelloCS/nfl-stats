from django.urls import reverse
from django.test import Client
from django.contrib.auth import get_user_model
from rest_framework import status
from .setup import BaseAuthTestCase

User = get_user_model()


class RegistrationTests(BaseAuthTestCase):
    def setUp(self):
        super().setUp()
        self.client = Client(enforce_csrf_checks=True)
        self.signup_url = reverse('signup')

    def test_signup_success(self):
        token = self.get_csrf_token(self.client)
        payload = {
            'email': 'newuser@test.com',
            'username': 'newuser',
            'password1': 'SecurePass123!',
            'password2': 'SecurePass123!'
        }

        response = self.client.post(
            self.signup_url, payload,
            content_type='application/json',
            HTTP_X_CSRFTOKEN=token
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='newuser@test.com').exists())

    def test_signup_passwords_mismatch(self):
        """
        Tests the 'if p1 != p2' logic in your view.
        """
        token = self.get_csrf_token(self.client)
        payload = {
            'email': 'mismatch@test.com',
            'username': 'mismatch',
            'password1': 'password123',
            'password2': 'different456'
        }
        response = self.client.post(
            self.signup_url, payload,
            content_type='application/json',
            HTTP_X_CSRFTOKEN=token
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Passwords do not match')

    def test_signup_duplicate_email(self):
        """
        Tests the filter(email=email).exists() logic in the SignUpView.
        """
        User.objects.create_user(username="existing", email="existing@test.com", password="password123")

        token = self.get_csrf_token(self.client)
        payload = {
            'email': 'existing@test.com',
            'username': 'otheruser',
            'password1': 'NewPass123!',
            'password2': 'NewPass123!'
        }
        response = self.client.post(
            self.signup_url, payload,
            content_type='application/json',
            HTTP_X_CSRFTOKEN=token
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Email already registered')

    def test_signup_invalid_username(self):
        """
        Tests UnicodeUsernameValidator enforcement.
        """
        token = self.get_csrf_token(self.client)
        payload = {
            'email': 'valid@test.com',
            'username': 'bad user',
            'password1': 'Pass123!@#',
            'password2': 'Pass123!@#'
        }

        response = self.client.post(
            self.signup_url, payload,
            content_type='application/json',
            HTTP_X_CSRFTOKEN=token
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_signup_weak_password(self):
        """
        Tests validate_password(p1) enforcement.
        """
        token = self.get_csrf_token(self.client)
        payload = {
            'email': 'weak@test.com',
            'username': 'weakuser',
            'password1': '123',
            'password2': '123'
        }
        response = self.client.post(
            self.signup_url,
            payload,
            content_type='application/json',
            HTTP_X_CSRFTOKEN=token
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(len(response.data['error']) > 0)
