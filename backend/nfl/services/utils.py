import os
import string
import logging
import requests
from dateutil import parser
from datetime import datetime, timezone
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,application/json,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US, en;q=0.5",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "DNT": "1",
    "Referer": "https://www.google.com/"
}

PIPELINE_CONFIG = None

CUSTOM_PIPELINE_CONFIG = {
    "dates": 2025,
    "seasontype": 2,
    "start_week": 1,
    "end_week": 18
}

class Table(object):
    def __init__(self, html: str, source: str):
        self.html = html
        self.source = source

    @property
    def parser(self):
        soup = BeautifulSoup(self.html, 'lxml')
        table = soup.find('table')
        headers = [th.get_text(strip=True) for th in table.find_all('th')]

        rows, i = table.find_all('tr'), 0
        if rows and rows[0].find('th'):
            i = 1

        old_table = []
        for row in rows[i:]:
            if self.source == "footballguys":
                td = row.find_all('td')
                data = [d.get_text(strip=True) for d in td]
            else:
                td = row.find_all('td')
                data = [d.get_text(strip=True) for d in td]

            team_name = self.clean_team_field(data[0])
            data[0] = team_name

            if len(data) == len(headers):
                row_dict = dict(zip(headers, data))
                old_table.append(row_dict)
        return old_table

    @property
    def parser2(self):
        soup = BeautifulSoup(self.html, 'lxml')
        thead = soup.find('table').find_all('thead')
        tbody = soup.find('table').find_all('tbody')
        positions = {'Tight End', 'Wide Receiver', 'Running Back', 'Quarterback'}
        res = []

        for table in zip(thead, tbody):
            headers = table[0]
            data = table[1]

            if headers.find('th').get_text() not in positions:
                continue
            
            headers = [th.get_text(strip=True) for th in headers.find_all('th')]
            headers[0], headers[-1] = 'Player', 'Total'

            for td in data.find_all('tr'):
                _data = []
                for r in td.find_all('td'):
                    td = r
                    if td.find('a'):
                        row = td.find('a').get_text(strip=True)
                    elif td.find('b'):
                        row = td.find('b').get_text(strip=True)
                    else:
                        row = td.get_text(strip=True)
                    _data.append(row)

                    if len(_data) == len(headers):
                        mapping = dict(zip(headers, _data))
                        res.append(mapping)
        return res

    def clean_team_field(self, value: str):
        if self.source == 'nfl':
            mid = len(value) // 2
            return value[:mid + (len(value) % 2)]
        elif self.source == 'sumer':
            value = value.split(' ')[-1]
            return value
        else:
            return value

def should_pipeline_run() -> dict:
    base_url = os.getenv("EVENTS_URL")

    try:
        response = requests.get(base_url, timeout=10)

        if response.status_code != 200:
            return None
        
        data: dict = response.json()
        season = data['leagues'][0]['season']
        current_year = season['year']
        current_type = season['type']['id']
        current_week = data['week']['number']
        events = data.get('events', [])

        if not events:
            logger.info("No events found. Pipeline Skip.")
            return None

        last_event = events[-1]
        status = last_event['status']['type']
        game_date_str = last_event['date']
        
        game_date = parser.parse(game_date_str).astimezone(timezone.utc)
        current_date = datetime.now(timezone.utc)
        
        is_complete = status.get('completed', False)
        days_since_game = (current_date - game_date).days

        logger.info(f"Latest Event: {last_event.get('shortName', 'Unknown')}")
        logger.info(f"Status: {'Final' if is_complete else 'Active'}")
        logger.info(f"Time since kickoff: {days_since_game} days")

        if is_complete and days_since_game > 3:
            logger.info("Event is stale (> 3 days post-game). Pipeline SKIP.")
            return None

        logger.info(f"Pipeline GO: Year {current_year} | Type {current_type} | Week {current_week}")
        
        return {
            "year": current_year,
            "season_type": current_type,
            "start_week": current_week,
            "end_week": current_week
        }

    except Exception as e:
        logger.error(f"Error checking season status: {e}")
        return None

def get_pipeline_context(manual_config: dict = None):
    if manual_config:
        logger.info(f"MANUAL MODE: Forcing run for {manual_config}")
        return manual_config

    logger.info("AUTO MODE: Checking if NFL is in season...")
    return should_pipeline_run()

def parse_competitor(competitor: dict) -> dict:
    """Helper to safely extract team and competitor data."""
    team_data = competitor.get("team", {})
    return {
        "homeAway": competitor.get("homeAway"),
        "winner": competitor.get("winner"),
        "score": competitor.get("score"),
        "team": {
            "name": team_data.get("name"),
            "abbreviation": team_data.get("abbreviation"),
            "displayName": team_data.get("displayName"),
            "shortDisplayName": team_data.get("shortDisplayName"),
            "color": team_data.get("color")
        }
    }

def parse_event(event: dict) -> dict:
    """
    Helper to extract high-level event details and process matching inner 
    competitions data structures including team info, venues, and betting odds.
    """
    return {
        "date": event.get("date"),
        "name": event.get("name"),
        "shortName": event.get("shortName"),
        "season": event.get("season"),
        "week": event.get("week"),
        "status": event.get("status"),

        "competitions": [
            {
                "venue": {
                    "id": str(comp["venue"].get("id")) if comp["venue"].get("id") else None,
                    "fullName": comp["venue"].get("fullName"),
                    "city": (comp["venue"].get("address") or {}).get("city"),
                    "state": (comp["venue"].get("address") or {}).get("state"),
                    "indoor": comp["venue"].get("indoor")
                } if comp.get("venue") else None,

                "odds": [
                    {
                        "provider": (
                            odd.get("provider", {}).get("name") 
                            if isinstance(odd.get("provider"), dict) 
                            else odd.get("provider")
                        ),
                        "details": odd.get("details"),        
                        "overUnder": odd.get("overUnder"),    
                        "spread": odd.get("spread")           
                    }
                    for odd in comp.get("odds", [])
                ],

                "competitors": [
                    parse_competitor(c) for c in comp.get("competitors", [])
                ]
            }
            for comp in event.get("competitions", [])
        ]
    }

def check(value):
    if value in ['-', None, '']:
        return 0
    try:
        return float(value)
    except (ValueError, TypeError):
        return 0
    
def generate_slug(name: str) -> str:
    name = ''.join([c for c in name if c not in string.punctuation])
    name = name.lower().replace(' ', '-')
    return name
