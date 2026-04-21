from django.urls import reverse
from django.test import Client
from django.contrib.auth import get_user_model
from rest_framework import status
from .setup import BaseAuthTestCase

User = get_user_model()


class AuthenticationAPITests(BaseAuthTestCase):
    """
    Verifies the Login/Logout API handshake.
    """
    def setUp(self):
        super().setUp()
        self.client = Client(enforce_csrf_checks=True)
        self.login_url = reverse('login')
        self.logout_url = reverse('logout')
        self.user_data = {'email': 'api@test.com', 'password': 'password123'}
        User.objects.create_user(username="api", **self.user_data)

    def test_login_invalid_credentials(self):
        token = self.get_csrf_token(self.client)
        payload = {
            'email': 'api@test.com',
            'password': 'wrongpassword'
        }

        response = self.client.post(
            self.login_url,
            payload,
            content_type='application/json',
            HTTP_X_CSRFTOKEN=token
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIsNone(self.client.session.get('_auth_user_id'))

    def test_full_auth_cycle(self):
        token = self.get_csrf_token(self.client)
        # Login
        self.client.post(
            self.login_url,
            self.user_data,
            content_type='application/json',
            HTTP_X_CSRFTOKEN=token
        )
        self.assertIsNotNone(self.client.session.get('_auth_user_id'))

        # Logout
        self.test_logout_requires_post()

    def test_login_inactive_user(self):
        """
        Security: Inactive users should not be granted sessions.
        """
        email, password = "inactive@test.com", "Pass123!@#"
        user = User.objects.create_user(username="inactive", email=email, password=password)
        user.is_active = False
        user.save()

        token = self.get_csrf_token(self.client)
        payload = {
            'email': email,
            'password': password,
        }

        response = self.client.post(
            self.login_url,
            payload,
            content_type='application/json',
            HTTP_X_CSRFTOKEN=token
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIsNone(self.client.session.get('_auth_user_id'))

    def test_logout_requires_post(self):
        """
        Security: Logout should be a POST request to prevent CSRF logout attacks.
        """
        self.create_and_login()

        # Attempting logout via GET
        response = self.client.get(
            self.logout_url,
        )
        # Depending on your view, this might be 405 Method Not Allowed
        self.assertNotEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(self.client.session.get('_auth_user_id'))
