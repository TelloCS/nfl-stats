from django.shortcuts import redirect
from django.urls import reverse_lazy
from django.contrib.auth import login
from django.contrib.auth.views import LoginView
from django.views.generic import CreateView
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .forms import CustomUserCreationForm
from .serializers import UserInfoSerializer

class CustomSignUpView(CreateView):
    template_name = 'registration/signup.html'
    form_class = CustomUserCreationForm
    success_url = reverse_lazy('home')

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect(settings.LOGIN_REDIRECT_URL)
        return super().dispatch(request, *args, **kwargs)
    
    @method_decorator(ratelimit(key='ip', rate='5/h', method='POST', block=True))
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

    def form_valid(self, form):
        user = form.save()
        login(self.request, user)
        return redirect(self.success_url)

class CustomLoginView(LoginView):
    template_name = 'registration/login.html'
    redirect_authenticated_user = True
    
    @method_decorator(ratelimit(key='ip', rate='10/m', method='POST', block=True))
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)
    
class UserInfoView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        serializer = UserInfoSerializer(request.user)
        return Response(serializer.data)