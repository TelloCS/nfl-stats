import os
import logging
from dotenv import load_dotenv
from aiohttp import ClientSession, ClientTimeout, ClientResponseError, ClientError
from requests import Response
from typing import Optional
from nfl.services.utils import DEFAULT_HEADERS

load_dotenv()
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

async def fetch_weekly_schedule_async() -> dict:
    schedule_url = os.getenv("EVENTS_URL")
    if not schedule_url:
        logger.error("EVENTS_URL environment variable is missing.")
        return None
    
    async with ClientSession() as session:
        raw_data = await fetch_nfl_schedule_raw_async(session=session, url=schedule_url)

    return raw_data
