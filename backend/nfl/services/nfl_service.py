import os
import logging
from aiohttp import ClientSession, ClientTimeout, ClientResponseError, ClientError
from requests import Response
from typing import Optional
from django.core.cache import cache
from nfl.services.utils import DEFAULT_HEADERS, parse_event

logger = logging.getLogger(__name__)

async def fetch_nfl_schedule_raw_async(session: ClientSession, url: str) -> Optional[Response]:
    timeout = ClientTimeout(total=10, connect=3.05)

    try:
        async with session.get(url=url, headers=DEFAULT_HEADERS, timeout=timeout) as response:
            response.raise_for_status()
            return await response.json()
    except ClientResponseError as http_error:
        if http_error.status == 429:
            logger.warning('NFL API Rate limit hit.')
        else:
            logger.error(f'HTTP error occurred: {http_error.status}')
        # Allows Celery to retry tasks
        raise
    except ClientError as error:
        logger.error(f"NFL API request failed {error}")
        raise

async def get_and_cache_weekly_schedule_async(force_refresh: bool = False) -> dict:
    cache_key = "weekly_schedule"
    cached_data = cache.get(cache_key)
    if not force_refresh:
        if cached_data:
            logger.info(f"Cache HIT: {cache_key}")
            return cached_data
    
    logger.info(f"Cache Miss: Fetching search term {cache_key} from NFL")
    
    schedule_url = os.getenv("WEEKLY_SCHEDULE_URL")
    if not schedule_url:
        logger.error("WEEKLY_SCHEDULE_URL environment variable is missing.")
        return None
    
    async with ClientSession() as session:
        raw_data = await fetch_nfl_schedule_raw_async(session=session, url=schedule_url)
    
    if not raw_data:
        return None

    events = raw_data.get("events", [])
    if not events: 
        return None
    
    events = raw_data.get("events", [])
    
    transformed_payload = {
        "season": raw_data.get("season"),
        "week": raw_data.get("week"),
        "events": [parse_event(e) for e in events]
    }

    # if any event is still active reduce ttl
    is_live = any(not e["status"]["type"]["completed"] for e in events)
    ttl = 60 if is_live else 43200
    cache.set(cache_key, transformed_payload, ttl)

    return transformed_payload
