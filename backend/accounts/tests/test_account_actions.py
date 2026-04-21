from django.urls import reverse
from django.test import Client
from django.contrib.auth import get_user_model
from rest_framework import status
from .setup import BaseAuthTestCase

User = get_user_model()


class AccountActionTests(BaseAuthTestCase):
    """
    Lifecycle and security of the deletion process.
    """
    def setUp(self):
        super().setUp()
        self.client = Client(enforce_csrf_checks=True)
        self.delete_url = reverse('delete-account')

    def test_delete_account_lifecycle(self):
        token = self.get_csrf_token(self.client)
        user = self.create_and_login()
        response = self.client.delete(
            self.delete_url,
            HTTP_X_CSRFTOKEN=token
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(id=user.id).exists())
        self.assertIsNone(self.client.session.get('_auth_user_id'))

    def test_delete_account_idor_protection(self):
        token = self.get_csrf_token(self.client)
        self.create_and_login(email="attacker@test.com")
        victim = User.objects.create_user(username="victim", email="victim@test.com", password="p")

        # Attempting to delete victim via payload
        self.client.delete(
            self.delete_url,
            data={'id': victim.id},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=token
        )
        self.assertTrue(User.objects.filter(id=victim.id).exists(), "IDOR vulnerability found!")
