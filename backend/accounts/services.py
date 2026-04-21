from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.conf import settings
from .tasks import send_password_reset_email_task

User = get_user_model()


def process_password_reset_request(email: str) -> None:
    user = User.objects.filter(email=email).first()

    if user:
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"{settings.FRONTEND_URL}/password-reset-confirm/{uid}/{token}"

        subject = "Password Reset Request"
        message = (
            f"Hello {user.username},\n\n"
            "You requested a password reset. Click the link below to set a new password:\n\n"
            f"{reset_link}\n\n"
            "If you did not request this, please ignore this email."
        )

        send_password_reset_email_task.delay(subject, message, user.email)
