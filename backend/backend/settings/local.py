from backend.settings.base import *
import sys

IS_TESTING = 'test' in sys.argv

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'not-secret-key-for-testing'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'backend']

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
DEFAULT_FROM_EMAIL = 'noreply@testing.com'
PASSWORD_RESET_TIMEOUT = 900

FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')

REST_FRAMEWORK.setdefault('DEFAULT_THROTTLE_RATES', {}).update({
    'password_reset': '5/hour',
})

if 'DEFAULT_THROTTLE_BACKEND' not in REST_FRAMEWORK:
    REST_FRAMEWORK['DEFAULT_THROTTLE_BACKEND'] = 'rest_framework.throttling.SimpleRateThrottle'

if IS_TESTING:
    RATELIMIT_ENABLE = False

    CELERY_TASK_ALWAYS_EAGER = True
    CELERY_TASK_EAGER_PROPAGATES = True

    PASSWORD_HASHERS = [
        'django.contrib.auth.hashers.MD5PasswordHasher',
    ]

    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "unique-snowflake",
        }
    }


if DEBUG and not IS_TESTING:
    INSTALLED_APPS += (
        "debug_toolbar",
    )

    MIDDLEWARE += (
        "debug_toolbar.middleware.DebugToolbarMiddleware",
    )

    DEBUG_TOOLBAR_PANELS = [
        'debug_toolbar.panels.history.HistoryPanel',
        'debug_toolbar.panels.versions.VersionsPanel',
        'debug_toolbar.panels.timer.TimerPanel',
        'debug_toolbar.panels.settings.SettingsPanel',
        'debug_toolbar.panels.headers.HeadersPanel',
        'debug_toolbar.panels.request.RequestPanel',
        'debug_toolbar.panels.sql.SQLPanel',
        'debug_toolbar.panels.staticfiles.StaticFilesPanel',
        'debug_toolbar.panels.templates.TemplatesPanel',
        'debug_toolbar.panels.alerts.AlertsPanel',
        'debug_toolbar.panels.cache.CachePanel',
        'debug_toolbar.panels.signals.SignalsPanel',
        'debug_toolbar.panels.community.CommunityPanel',
        'debug_toolbar.panels.redirects.RedirectsPanel',
        'debug_toolbar.panels.profiling.ProfilingPanel',
    ]

    DEBUG_TOOLBAR_CONFIG = {
        "SHOW_COLLAPSED": True,
        "SHOW_TOOLBAR_CALLBACK": lambda request: DEBUG,
    }

    INTERNAL_IPS = ['localhost', '127.0.0.1', 'backend']

    if 'DEFAULT_RENDERER_CLASSES' not in REST_FRAMEWORK:
        REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] = []

    if 'rest_framework.renderers.BrowsableAPIRenderer' not in REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES']:
        REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'].append(
            'rest_framework.renderers.BrowsableAPIRenderer'
        )

CORS_ALLOWED_ORIGINS = ["http://localhost:5173"]
CSRF_TRUSTED_ORIGINS = ["http://localhost:5173"]

SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

USE_X_FORWARDED_HOST = False
