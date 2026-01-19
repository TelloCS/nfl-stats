import os
from celery import Celery

# Set default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('nfl')

# Load config from settings.py using a namespace
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load tasks from all registered apps
app.autodiscover_tasks()