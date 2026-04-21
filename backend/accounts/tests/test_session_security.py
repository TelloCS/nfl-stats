from django.urls import reverse
from django.test import Client
from django.contrib.auth import get_user_model
from rest_framework import status
from .setup import BaseAuthTestCase

User = get_user_model()


class SessionSecurityTests(BaseAuthTestCase):
    """
    Verifies the 'Security Contract' between Django and React.
    """
    def setUp(self):
        super().setUp()
        self.client = Client(enforce_csrf_checks=True)
        self.login_url = reverse('login')
        self.delete_url = reverse('delete-account')

    def test_session_cookie_hardening(self):
        """
        Checks the raw Set-Cookie header to ensure HttpOnly is present.
        """
        token = self.get_csrf_token(self.client)
        User.objects.create_user(username="secure", email="sec@test.com", password="p")

        payload = {
            'email': 'sec@test.com',
            'password': 'p'
        }
        response = self.client.post(
            self.login_url,
            payload,
            content_type='application/json',
            HTTP_X_CSRFTOKEN=token
        )

        session_cookie = response.cookies.get('sessionid')
        self.assertIsNotNone(session_cookie, "Session cookie not issued.")
        self.assertIn('httponly', session_cookie.output().lower())

    def test_csrf_cookie_accessibility(self):
        response = self.client.get(reverse('csrf-cookie'))
        csrftoken = response.cookies.get('csrftoken')
        self.assertIsNotNone(csrftoken)

        # Must be readable by React (No HttpOnly)
        self.assertNotIn('httponly', csrftoken.output().lower())

    def test_csrf_enforcement_on_mutations(self):
        """
        Uses Client(enforce_csrf_checks=True) to prove 403 Forbidden
        is returned when React forgets the CSRF header.
        """
        csrf_client = Client(enforce_csrf_checks=True)
        email, password = "csrf@test.com", "pass123"
        User.objects.create_user(username="csrftest", email=email, password=password)
        csrf_client.login(email=email, password=password)

        # No Header -> 403
        response = csrf_client.delete(reverse('delete-account'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Correct Header -> 204
        token = self.get_csrf_token(csrf_client)

        success_res = csrf_client.delete(
            self.delete_url,
            HTTP_X_CSRFTOKEN=token
        )
        self.assertEqual(success_res.status_code, status.HTTP_204_NO_CONTENT)
