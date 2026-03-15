from .base import *

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'not-secret-key-for-testing'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS').split(',')

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = ["http://localhost:5173"]

# Set to '.yourdomain.com' in production
SESSION_COOKIE_DOMAIN = None

CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False

CSRF_COOKIE_SAMESITE = 'Lax'
