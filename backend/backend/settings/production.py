from django.core.exceptions import ImproperlyConfigured
from backend.settings.base import *
import dj_database_url
import logging
import os

logger = logging.getLogger(__name__)

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = os.getenv("EMAIL_PORT")
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL")
PASSWORD_RESET_TIMEOUT = int(os.getenv("PASSWORD_RESET_TIMEOUT"))

FRONTEND_URL = os.environ.get('FRONTEND_URL')

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY')

if not SECRET_KEY:
    raise ImproperlyConfigured(
        "The SECRET_KEY environment variable must be set"
    )

DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    raise ImproperlyConfigured(
        "DATABASE_URL environment variable must be set"
    )

DATABASES['default'] = dj_database_url.config(
    default=DATABASE_URL,
    conn_max_age=int(os.getenv('CONN_MAX_AGE')),
    conn_health_checks=True
)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')

USE_HTTPS = os.getenv('USE_HTTPS', 'True') == 'True'

if USE_HTTPS:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

    SECURE_SSL_REDIRECT = False
    SECURE_REFERRER_POLICY = None
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_HSTS_SECONDS = 0
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
else:
    logger.warning("WARNING: Running Production settings without HTTPS security.")

# Nginx handles these configs
SECURE_CONTENT_TYPE_NOSNIFF = False
X_FRAME_OPTIONS = 'DENY'

USE_X_FORWARDED_HOST = True

CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')
CSRF_TRUSTED_ORIGINS = os.getenv('CSRF_TRUSTED_ORIGINS', '').split(',')
