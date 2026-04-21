from django.contrib.auth import login, logout, authenticate
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from .serializers import (
    UserInfoSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)
from rest_framework import status
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.contrib.auth import get_user_model

from django.db import transaction
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from .services import process_password_reset_request
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class UserProfileView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        serializer = UserInfoSerializer(request.user)
        return Response(serializer.data)


@method_decorator(ratelimit(key='ip', rate='3/m', method='POST', block=True), name='dispatch')
@method_decorator(csrf_protect, name='dispatch')
class SignUpView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        data = request.data
        email = data.get('email')
        username = data.get('username')
        p1 = data.get('password1')
        p2 = data.get('password2')

        if p1 != p2:
            return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

        validator = UnicodeUsernameValidator()
        try:
            validator(username)
        except ValidationError as e:
            return Response({'error': e.messages[0]}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(p1)
        except ValidationError as e:
            return Response({'error': e.messages}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            User.objects.create_user(
                email=email,
                username=username,
                password=p1
            )

            return Response({'success': 'User created'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.exception(f"Signup Error: {e}")
            return Response({'error': 'Something went wrong creating account'}, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(ratelimit(key='ip', rate='5/m', method='POST', block=True), name='dispatch')
@method_decorator(csrf_protect, name='dispatch')
class LoginView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        if getattr(request, 'ratelimited', False):
            return Response(
                {'error': 'Too many login attempts. Please try again later.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        if request.user.is_authenticated:
            return Response({'error': 'Already logged in'}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data
        email = data.get('email')
        password = data.get('password')

        try:
            user = authenticate(request=request, username=email, password=password)

            if user is not None:
                login(request=request, user=user)
                return Response({'success': 'Logged in'})
            return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            logger.exception(f"Logging in error: {e}")
            return Response({'error': 'Something went wrong when logging in'})


class LogoutView(APIView):
    def post(self, request):
        try:
            logout(request=request)
            return Response({"success": "Logged out successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception(f"Logging out error: {e}")
            return Response({"error": "Something went wrong when logging out"})


class DeleteAccountView(APIView):
    permission_classes = (IsAuthenticated,)

    def delete(self, request):
        try:
            user = request.user
            user.delete()
            logout(request=request)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.exception(f"Deleting user error: {e}")
            return Response(
                {'error': 'Internal server error during deletion'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(ensure_csrf_cookie, name='dispatch')
class GetCSRFToken(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, format=None):
        return Response({'success': 'CSRF cookie set'})


@method_decorator(csrf_protect, name='dispatch')
class PasswordResetRequestView(APIView):
    permission_classes = (AllowAny,)
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'password_reset'

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        process_password_reset_request(serializer.validated_data['email'])

        return Response(
            {"message": "If an account with this email exists, a reset link has been sent."},
            status=status.HTTP_200_OK
        )


@method_decorator(csrf_protect, name='dispatch')
class PasswordResetConfirmView(APIView):
    permission_classes = (AllowAny,)
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'password_reset'

    @transaction.atomic
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uidb64 = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            try:
                validate_password(new_password, user=user)

                user.set_password(new_password)
                user.save()
                return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response(
                    {"error": e.messages},
                    status=status.HTTP_400_BAD_REQUEST
                )

        logger.warning(f"Invalid password reset attempt for uid: {uidb64}")
        return Response({"error": "The reset link is invalid or has expired."}, status=status.HTTP_400_BAD_REQUEST)
