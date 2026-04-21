from django.urls import reverse
from django.test import Client
from rest_framework import status
from .setup import BaseAuthTestCase


class ProfileTests(BaseAuthTestCase):
    """
    Tests 'Contextual Data Retrieval'.
    Ensures 'user/me/' only returns the data for the current session.
    """
    def setUp(self):
        super().setUp()
        self.client = Client(enforce_csrf_checks=True)
        self.profile_url = reverse('user-me')

    def test_get_own_profile_authenticated(self):
        self.create_and_login(username="me", email="me@test.com")
        response = self.client.get(self.profile_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], "me")
        self.assertEqual(response.data['email'], "me@test.com")

    def test_get_profile_unauthenticated(self):
        response = self.client.get(self.profile_url)
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_user_me_session_persistence(self):
        """
        Ensures that after login, 'user/me' consistently returns the right user.
        """
        self.create_and_login(email="me@test.com")
        # First check
        res1 = self.client.get(self.profile_url)

        # Second check (ensure session didn't drop)
        res2 = self.client.get(self.profile_url)

        self.assertEqual(res1.data['email'], "me@test.com")
        self.assertEqual(res2.data['email'], "me@test.com")
