from django.urls import reverse
from django.test import Client
from django.core import mail
from django.contrib.auth import get_user_model
from rest_framework import status
from .setup import BaseAuthTestCase

User = get_user_model()


class PasswordResetTests(BaseAuthTestCase):
    def setUp(self):
        super().setUp()
        self.client = Client(enforce_csrf_checks=True)
        self.user = User.objects.create_user(
            email="test@example.com",
            password="old-password123",
            username="testuser"
        )
        self.reset_url = reverse('password-reset')
        self.confirm_url = reverse('password-reset-confirm')
        self.token = self.get_csrf_token(self.client)

    def test_password_reset_request_sends_email(self):
        """Test that a valid email triggers a reset email."""
        payload = {"email": "test@example.com"}
        response = self.client.post(
            self.reset_url,
            payload,
            content_type='application/json',
            HTTP_X_CSRFTOKEN=self.token
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Password Reset Request", mail.outbox[0].subject)
        self.assertIn("test@example.com", mail.outbox[0].to)

    def test_password_reset_request_silent_fail(self):
        """Security check: Ensure non-existent emails return 200 but send no email."""
        payload = {"email": "nonexistent@example.com"}
        response = self.client.post(
            self.reset_url,
            payload,
            content_type='application/json',
            HTTP_X_CSRFTOKEN=self.token
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 0)

    def test_password_reset_confirm_success(self):
        """Test the full flow: request token -> use token -> check password change."""
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes

        token = default_token_generator.make_token(self.user)
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))

        payload = {
            "uid": uid,
            "token": token,
            "new_password": "new-secure-password123"
        }
        response = self.client.post(
            self.confirm_url,
            payload,
            content_type='application/json',
            HTTP_X_CSRFTOKEN=self.token
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("new-secure-password123"))
