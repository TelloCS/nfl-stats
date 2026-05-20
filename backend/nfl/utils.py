import time
from nfl.models import GlobalMetadata
from django.utils import timezone
from django.core.cache import cache


def refresh_application_cache():
    """Ensures Redis and the Frontend Version remain in sync."""
    cache.clear()
    current_ts = int(time.time())
    cache.set('etl_version_ts', current_ts, timeout=None)

    GlobalMetadata.objects.update_or_create(
        key="etl_version_ts",
        defaults={"value": str(current_ts)}
    )


def get_current_etl_version():
    """
    Fetches the persistent ETL version. Self-heals from Postgres
    if Redis memory was wiped during a Docker container restart.
    """
    version = cache.get("etl_version_ts")
    if version is None:
        meta_record = GlobalMetadata.objects.filter(key="etl_version_ts").first()
        version = int(meta_record.value) if meta_record else 0
        cache.set("etl_version_ts", version, timeout=None)
    return version


def is_nfl_in_season():
    current_month = timezone.now().month
    return current_month in [9, 10, 11, 12, 1, 2]
