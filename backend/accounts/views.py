from django.shortcuts import redirect
from django.urls import reverse_lazy
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.views import LoginView
from django.views.generic import CreateView
from django_ratelimit.decorators import ratelimit
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .forms import CustomUserCreationForm
from .serializers import UserInfoSerializer
from rest_framework import status
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.utils.decorators import method_decorator

from django.contrib.auth import get_user_model
User = get_user_model()

class UserProfileView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        serializer = UserInfoSerializer(request.user)
        return Response(serializer.data)

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
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
@method_decorator(csrf_protect, name='dispatch')
class LoginView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        if request.user.is_authenticated:
            return Response({'error': 'Already logged in'}, status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data
        email = data.get('email')
        password = data.get('password')

        try:
            user = authenticate(request=request, username=email, password=password)
            
            if user is not None:
                login(request=request, user=user)
                return Response({'success': 'Logged in' })
            return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
        except:
            return Response({'error': 'Something went wrong when logging in'})

class LogoutView(APIView):
    def post(self, request):
        try:
            logout(request=request)
            return Response({"success": "Logged out successfully"})
        except:
            return Response({"error": "Something went wrong when logging out"})

class DeleteAccountView(APIView):
    permission_classes = (IsAuthenticated,)

    def delete(self, request):
        try:
            user = request.user
            User.objects.filter(id=user.id).delete()
            return Response({'success': 'Account deleted'}, status=status.HTTP_204_NO_CONTENT)
        except:
            return Response({'error': 'Something went wrong when trying to delete user'})


@method_decorator(ensure_csrf_cookie, name='dispatch')
class GetCSRFToken(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, format=None):
        return Response({'success': 'CSRF cookie set'})