from celery import shared_task
from django.core.mail import send_mail
import logging

logger = logging.getLogger(__name__)


@shared_task
def send_password_reset_email_task(subject: str, message: str, email: str) -> None:
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=None,
            recipient_list=[email],
            fail_silently=False
        )
    except Exception as e:
        logger.error(f"Failed to send password reset email to {email}: {str(e)}")
