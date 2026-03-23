import time
from django.core.cache import cache


def refresh_application_cache():
    """Ensures Redis and the Frontend Version remain in sync."""
    cache.clear()
    cache.set('etl_version_ts', int(time.time()), timeout=None)
