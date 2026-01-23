from django.urls import path
from .views import CustomSignUpView, CustomLoginView, UserInfoView
from django.contrib.auth.views import LoginView


urlpatterns = [
    path("signup/", CustomSignUpView.as_view(), name="signup"),
    path('login/', CustomLoginView.as_view(), name='login'),
    path('user/me', UserInfoView.as_view(), name='user-me')
]