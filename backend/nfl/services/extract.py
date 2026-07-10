import os
import logging
from typing import Any
from aiohttp import ClientSession, ClientError
from asyncio import TaskGroup, TimeoutError
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type
from dotenv import load_dotenv
from nfl.services.utils import (
    Table,
)

load_dotenv()
logger = logging.getLogger(__name__)

class Extract:
    BASE_URL: str = None
    SOURCE: str = None

    def __init__(self, params = None):
        self.params = params.copy() if params else {}
        self.raw = None

    @retry(
        wait=wait_exponential(multiplier=1, min=2, max=10),
        stop=stop_after_attempt(5),
        retry=retry_if_exception_type((ClientError, TimeoutError)),
        reraise=True
    )
    async def send_api_request(self, session: ClientSession, *args, **kwargs):
        url = self.BASE_URL
        request_params = self.params.copy()

        for key, value in kwargs.items():
            placeholder = "{" + key + "}"
            if placeholder in url:
                url = url.replace(placeholder, str(value))
            else:
                request_params[key] = value

        try:
            async with session.get(url=url, params=request_params) as response:
                logger.info(f"[CACHE MISS] Request: {response.url} | Status: {response.status}")
                response.raise_for_status()
                processed_json = await self.process_response(response)
                self.raw = processed_json
                return self.raw
        except Exception as e:
            logger.exception(f"[API ERROR] Request failed for {url}. Defaulting to empty state. Error: {e}")
            self.raw = None
            return self.raw

    async def spawn_tasks(self, session: ClientSession, ids: list[Any], id_key: str):
        async with TaskGroup() as taskgroup:
            tasks = [
                taskgroup.create_task(
                    self.send_api_request(session=session, **{id_key: tid})
                ) for tid in ids
            ]

        self.raw = [t.result() for t in tasks]
        return self.raw
    
    async def process_response(self, response: ClientSession) -> Any:
        """Default behavior: Return the awaited JSON."""
        return await response.json()


class Teams(Extract):
    BASE_URL: str = os.getenv('TEAMS_URL')
    SOURCE: str = "espn"

    def __init__(self, params = None):
        super().__init__(params)

    @property
    def team_ids(self) -> list[str]:
        if not self.raw:
            return []

        extracted_ids = []
        for conference in self.raw["content"]["standings"]["groups"]:
            for division in conference["groups"]:
                for team in division["standings"]["entries"]:
                    extracted_ids.append(team["team"]["id"])
        return extracted_ids


class Players(Extract):
    BASE_URL: str = os.getenv("PLAYERS_URL")
    SOURCE: str = "espn"

    def __init__(self, params=None):
        super().__init__(params)


class Events(Extract):
    BASE_URL: str = os.getenv('EVENTS_URL')
    SOURCE: str = "espn"

    def __init__(self, params = None):
        super().__init__(params)

    async def spawn_tasks(self, session, dates, seasontype, weeks: list):
        """Custom logic for the 'Dual-Mode' fetcher."""
        async with TaskGroup() as tg:
            tasks = [
                tg.create_task(self.send_api_request(
                    session, dates=dates, seasontype=seasontype, week=w
                )) for w in weeks
            ]
        self.raw = [t.result() for t in tasks]
        return
    
    @property
    def event_ids(self) -> list[str]:
        """Filters self.raw to get a unique list of event IDs."""
        if not self.raw:
            return []
        return [event['id'] for week in self.raw for event in week['events']]


class Games(Extract):
    BASE_URL: str = os.getenv("BOXSCORE_URL")
    SOURCE: str = "espn"

    def __init__(self, params = None):
        super().__init__(params)


class ExtractTable(Extract):
    def __init__(self, params = None):
        super().__init__(params)

    async def process_response(self, response):
        html = await response.text()
        self.raw = Table(html=html, source=self.SOURCE).parser
        return self.raw


class OffensePassing(ExtractTable):
    BASE_URL: str = os.getenv('OFFENSE_PASSING_URL')
    SOURCE: str = "nfl"

    def __init__(self, params = None):
        super().__init__(params)


class OffenseRushing(ExtractTable):
    BASE_URL: str = os.getenv('OFFENSE_RUSHING_URL')
    SOURCE: str = "nfl"

    def __init__(self, params = None):
        super().__init__(params)


class OffenseReceiving(ExtractTable):
    BASE_URL = os.getenv('OFFENSE_RECEIVING_URL')
    SOURCE = "nfl"

    def __init__(self, params = None):
        super().__init__(params)


class DefensePassing(ExtractTable):
    BASE_URL = os.getenv('DEFENSE_PASSING_URL')
    SOURCE = "nfl"

    def __init__(self, params = None):
        super().__init__(params)


class DefenseRushing(ExtractTable):
    BASE_URL = os.getenv('DEFENSE_RUSHING_URL')
    SOURCE = "nfl"

    def __init__(self, params = None):
        super().__init__(params)


class DefenseReceiving(ExtractTable):
    BASE_URL = os.getenv('DEFENSE_RECEIVING_URL')
    SOURCE = "nfl"

    def __init__(self, params = None):
        super().__init__(params)


class AdvanceOffense(ExtractTable):
    BASE_URL = os.getenv('ADVANCE_OFFENSE_URL')
    SOURCE = "sumer"

    def __init__(self, params = None):
        super().__init__(params)


class AdvanceDefense(ExtractTable):
    BASE_URL = os.getenv('ADVANCE_DEFENSE_URL')
    SOURCE = "sumer"

    def __init__(self, params = None):
        super().__init__(params)


class CoverageSchemes(ExtractTable):
    BASE_URL = os.getenv('COVERAGE_SCHEMES_URL')
    SOURCE = "sharp"

    def __init__(self, params = None):
        super().__init__(params)


class OffenseTendencies(ExtractTable):
    BASE_URL = os.getenv('OFFENSE_TENDENCIES_URL')
    SOURCE = "sharp"

    def __init__(self, params = None):
        super().__init__(params)


class CoverageStatsByPosition(ExtractTable):
    BASE_URL = os.getenv('COVERAGE_STATS_BY_POSITION_URL')
    SOURCE = "sharp"

    def __init__(self, params = None):
        super().__init__(params)
