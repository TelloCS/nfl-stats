from django.urls import path
from .views import (
    UserProfileView,
    SignUpView,
    LoginView,
    LogoutView,
    DeleteAccountView,
    GetCSRFToken,
)

urlpatterns = [
    path("csrf-cookie", GetCSRFToken.as_view(), name="csrf-cookie"),
    path("signup", SignUpView.as_view(), name="signup"),
    path('login', LoginView.as_view(), name='login'),
    path('logout', LogoutView.as_view(), name='logout'),
    path('user/me', UserProfileView.as_view(), name='user-me'),
    path('delete-account', DeleteAccountView.as_view(), name='delete-account')
]