from django.core.exceptions import ImproperlyConfigured
from backend.settings.base import *
from dotenv import load_dotenv
import logging
import os

load_dotenv()

logger = logging.getLogger(__name__)

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY')

if not SECRET_KEY:
    raise ImproperlyConfigured(
        "The SECRET_KEY environment variable must be set"
    )

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS').split(',')

USE_HTTPS = os.getenv('USE_HTTPS', 'True') == 'True'

if USE_HTTPS:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

    SECURE_SSL_REDIRECT = True
    SECURE_REFERRER_POLICY = "same-origin"
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
else:
    logger.warning("WARNING: Running Production settings without HTTPS security.")

SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

USE_X_FORWARDED_HOST = True

CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')
CSRF_TRUSTED_ORIGINS = os.getenv('CSRF_TRUSTED_ORIGINS', '').split(',')
