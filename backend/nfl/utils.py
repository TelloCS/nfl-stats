import time
from django.utils import timezone
from django.core.cache import cache


def refresh_application_cache():
    """Ensures Redis and the Frontend Version remain in sync."""
    cache.clear()
    cache.set('etl_version_ts', int(time.time()), timeout=None)


def is_nfl_in_season():
    current_month = timezone.now().month
    return current_month in [9, 10, 11, 12, 1, 2]
