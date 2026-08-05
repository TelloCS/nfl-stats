import os
import logging
from dotenv import load_dotenv
from curl_cffi.requests import AsyncSession, RequestsError
from nfl.services.utils import DEFAULT_HEADERS

load_dotenv()
logger = logging.getLogger(__name__)

async def fetch_nfl_schedule_raw_async(session: AsyncSession, url: str) -> dict:
    try:
        response = await session.get(url=url, headers=DEFAULT_HEADERS, timeout=10)
        
        if response.status_code == 429:
            logger.warning('NFL API Rate limit hit.')
            response.raise_for_status()
        elif response.status_code != 200:
            logger.error(f'HTTP error occurred: {response.status_code}')
            response.raise_for_status()

        return response.json()

    except RequestsError as error:
        logger.error(f"NFL API request failed: {error}")
        raise

async def fetch_weekly_schedule_async() -> dict:
    schedule_url = os.getenv("EVENTS_URL", "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard")
    if not schedule_url:
        logger.error("EVENTS_URL environment variable is missing.")
        return None
    
    # Use AsyncSession with browser impersonation
    async with AsyncSession(impersonate="chrome120") as session:
        raw_data = await fetch_nfl_schedule_raw_async(session=session, url=schedule_url)

    return raw_data
