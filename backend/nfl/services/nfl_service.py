import logging
import requests
from requests import Response
from typing import Optional
from django.core.cache import cache

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

def fetch_from_nfl(base_url: str) -> Optional[Response]:
    try:
        response = requests.get(
            url=base_url,
            headers=DEFAULT_HEADERS,
            timeout=(3.05, 10)
        )
        response.raise_for_status()
        return response
    except requests.exceptions.HTTPError as http_error:
        if http_error.response.status_code == 429:
            logger.warning('NFL API Rate limit hit.')
        else:
            logger.error(f'HTTP error occurred: {http_error}')
        # Allows Celery to retry tasks
        raise
    except requests.exceptions.RequestException as error:
        logger.error(f"NFL API request failed {error}")
        raise

def weekly_schedule(force_refresh: bool = False) -> dict:
    cache_key = "weekly_schedule"
    cached_data = cache.get(cache_key)
    if not force_refresh:
        if cached_data:
            logger.info(f"Cache HIT: {cache_key}")
            return cached_data
    
    logger.info(f"Cache Miss: Fetching search term {cache_key} from NFL")
    
    base_url = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard"
    raw_data = fetch_from_nfl(base_url=base_url).json()
    if not raw_data: return None

    custom_payload = {
        "season": raw_data.get("season"),
        "week": raw_data.get("week"),
        "events": []
    }

    events = raw_data.get("events", [])
    
    for event in events:
        custom_event = {
            "date": event.get("date"),
            "name": event.get("name"),
            "shortName": event.get("shortName"),
            "season": event.get("season"),
            "week": event.get("week"),
            "competitions": [],
            "status": event.get("status")
        }

        for comp in event.get("competitions", []):
            custom_comp = {"competitors": []}

            for competitor in comp.get("competitors", []):
                team_data = competitor.get("team", {})
                
                custom_competitor = {
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
                custom_comp["competitors"].append(custom_competitor)
            custom_event["competitions"].append(custom_comp)
        custom_payload["events"].append(custom_event)

    # if any event is still active reduce ttl
    is_live = any(not e["status"]["type"]["completed"] for e in events)
    ttl = 60 if is_live else 60 * 60 * 12
    cache.set(cache_key, custom_payload, ttl)

    return custom_payload
