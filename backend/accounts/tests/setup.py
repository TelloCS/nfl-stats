from django.urls import reverse
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.cache import cache

User = get_user_model()


class BaseAuthTestCase(TestCase):
    """
    Modular Base: Centralizes user creation and authentication.
    Resets the cache between every test to ensure rate-limit isolation.
    """
    def setUp(self):
        cache.clear()

    def tearDown(self):
        cache.clear()

    def get_csrf_token(self, client):
        """Helper to fetch a fresh CSRF token from the backend."""
        response = client.get(reverse('csrf-cookie'))
        return response.cookies.get('csrftoken').value

    def create_and_login(self, username="test" , email="test@example.com", password="password123"):
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        # We use the client to establish the session state
        success = self.client.login(email=email, password=password)
        self.assertTrue(success, f"Login failed for {email}")
        return user
