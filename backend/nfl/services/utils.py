import os
import re
import string
import logging
import requests
from collections import defaultdict
from dateutil import parser
from datetime import datetime, timezone
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    "sec-ch-ua": '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "Referer": "https://www.nfl.com/",
}
 
PIPELINE_CONFIG = None

CUSTOM_PIPELINE_CONFIG = {
    "dates": 2025,
    "seasontype": 2,
    "start_week": 1,
    "end_week": 18
}

PASSING_STATS_MAP = {
    'pass_attempts': ('Att', int),
    'completions': ('Cmp', int),
    'completion_pct': ('Cmp %', float),
    'yards_per_attempt': ('Yds/Att', float),
    'pass_yards': ('Pass Yds', int),
    'pass_touchdowns': ('TD', int),
    'interceptions': ('INT', int),
    'pass_rating': ('Rate', float),
    'sacks': ('Sck', int),
    'sack_yards': ('SckY', int)
}

RUSHING_STATS_MAP = {
    'rush_attempts': ('Att', int),
    'rush_yards': ('Rush Yds', int),
    'yards_per_carry': ('YPC', float),
    'rush_touchdowns': ('TD', int),
    'rush_fumbles': ('Rush FUM', int)
}

RECEIVING_STATS_MAP = {
    'receptions': ('Rec', int),
    'rec_yards': ('Yds', int),
    'yards_per_reception': ('Yds/Rec', float),
    'rec_touchdowns': ('TD', int),
    'rec_fumbles': ('Rec FUM', int)
}

def parse_pct(value):
    """Strips the % sign and casts to float."""
    return float(str(value).replace('%', '').strip())

ADVANCE_OFF_STATS_MAP = {
    'expected_points_added_per_play': ('EPA/Play', float),
    'total_expected_points_added': ('Total EPA', float),
    'success_pct': ('Success %', parse_pct),
    'expected_points_added_per_pass': ('EPA/Pass', float),
    'expected_points_added_per_rush': ('EPA/Rush', float),
    'average_depth_of_target': ('ADoT', float),
    'scramble_pct': ('Scramble %', parse_pct),
    'interception_pct': ('Int %', parse_pct)
}

ADVANCE_DEF_STATS_MAP = {
    'expected_points_added_per_play': ('EPA/Play', float),
    'total_expected_points_added': ('Total EPA', float),
    'success_pct': ('Success %', parse_pct),
    'expected_points_added_allowed_per_pass': ('EPA/Pass', float),
    'expected_points_added_allowed_per_rush': ('EPA/Rush', float),
    'average_depth_of_target_against': ('ADoT', float),
    'scramble_pct': ('Scramble %', parse_pct),
    'interception_pct': ('Int %', parse_pct)
}

COVERAGE_SCHEMES_STATS_MAP = {
    'man_rate': ('Man Rate', parse_pct),
    'zone_rate': ('Zone Rate', parse_pct),
    'middle_closed_rate': ('Middle Closed Rate', parse_pct),
    'middle_open_rate': ('Middle Open Rate', parse_pct)
}

OFF_TENDENCIES_STATS_MAP = {
    'motion_rate': ('Motion Rate', parse_pct),
    'play_action_rate': ('Play Action Rate', parse_pct),
    'airyards_per_att': ('AirYards/Att', parse_pct), 
    'shotgun_rate': ('Shotgun Rate', parse_pct),
    'nohuddle_rate': ('NoHuddle Rate', parse_pct)
}

COVERAGE_STATS_BY_POSITION_STATS_MAP = {
    'yards_allowed_wr': ('YPT Allowed WR', float),
    'yards_allowed_te': ('YPT Allowed TE', float),
    'yards_allowed_rb': ('YPT Allowed RB', float),
    'yards_allowed_outside': ('YPT Allowed Outside', float),
    'yards_allowed_slot': ('YPT Allowed Slot', float)
}

SCORING_CONFIGS = {
    "PPR": {
        "pass_yd": 0.04, "pass_td": 4.0, "int": -2.0,
        "rush_yd": 0.1,  "rush_td": 6.0,
        "rec": 1.0,      "rec_yd": 0.1,  "rec_td": 6.0,
        "fumble_lost": -2.0, "two_pt": 2.0, "misc_td": 6.0,
        "bonus_300p": False, "bonus_100r": False, "bonus_100rec": False
    },
    "Half-PPR": {
        "pass_yd": 0.04, "pass_td": 4.0, "int": -2.0,
        "rush_yd": 0.1,  "rush_td": 6.0,
        "rec": 0.5,      "rec_yd": 0.1,  "rec_td": 6.0,
        "fumble_lost": -2.0, "two_pt": 2.0, "misc_td": 6.0,
        "bonus_300p": False, "bonus_100r": False, "bonus_100rec": False
    },
    "Non-PPR": {
        "pass_yd": 0.04, "pass_td": 4.0, "int": -2.0,
        "rush_yd": 0.1,  "rush_td": 6.0,
        "rec": 0.0,      "rec_yd": 0.1,  "rec_td": 6.0,
        "fumble_lost": -2.0, "two_pt": 2.0, "misc_td": 6.0,
        "bonus_300p": False, "bonus_100r": False, "bonus_100rec": False
    },
    "Yahoo": {
        "pass_yd": 0.04, "pass_td": 4.0, "int": -1.0,  # Yahoo default quirk
        "rush_yd": 0.1,  "rush_td": 6.0,
        "rec": 0.5,      "rec_yd": 0.1,  "rec_td": 6.0,
        "fumble_lost": -2.0, "two_pt": 2.0, "misc_td": 6.0,
        "bonus_300p": False, "bonus_100r": False, "bonus_100rec": False
    },
    "DraftKings": {
        "pass_yd": 0.04, "pass_td": 4.0, "int": -2.0,  # DK penalty
        "rush_yd": 0.1,  "rush_td": 6.0,
        "rec": 1.0,      "rec_yd": 0.1,  "rec_td": 6.0,
        "fumble_lost": -1.0, "two_pt": 2.0, "misc_td": 6.0,
        "bonus_300p": True, "bonus_100r": True, "bonus_100rec": True # Milestone triggers
    },
    "FanDuel": {
        "pass_yd": 0.04, "pass_td": 4.0, "int": -1.0,  # FD passing int rule
        "rush_yd": 0.1,  "rush_td": 6.0,
        "rec": 0.5,      "rec_yd": 0.1,  "rec_td": 6.0,
        "fumble_lost": -2.0, "two_pt": 2.0, "misc_td": 6.0,
        "bonus_300p": False, "bonus_100r": False, "bonus_100rec": False
    }
}

class Table(object):
    def __init__(self, html: str, source: str):
        self.html = html
        self.source = source

    @property
    def parser(self):
        soup = BeautifulSoup(self.html, 'lxml')
        table = soup.find('table')

        if table is None: return None

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

        now = datetime.now()
        in_nfl_season = now.month in range(1, 3) or now.month in range(9, 13)

        if not in_nfl_season:
            logger.info("NFL offseason. Pipeline SKIP.")
            return None

        if is_complete and days_since_game > 7:
            logger.info("Event is stale (> 7 days post-game). Pipeline SKIP.")
            return None

        logger.info(f"Pipeline GO: Year {current_year} | Type {current_type} | Week {current_week}")
        
        return {
            "dates": current_year,
            "seasontype": current_type,
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

def extract_play_by_play_edge_cases(
    plays_dict: dict,
    name_to_id_map: dict
) -> tuple[dict, dict]:
    """
    Scans play-by-play text using a dynamic regex pattern to match names flawlessly.
    """
    two_pt_counts = defaultdict(int)
    off_fum_td_counts = defaultdict(int)

    if not name_to_id_map:
        return two_pt_counts, off_fum_td_counts

    # Sort names by length descending to match full suffixes/spaces first
    sorted_short_names = sorted(name_to_id_map.keys(), key=len, reverse=True)
    escaped_names = [re.escape(name) for name in sorted_short_names]
    
    # Dynamic pattern. The capture group ensures re.findall 
    # returns the clean short_name, ignoring team prefixes like "HST-" or "SF-"
    name_pattern = re.compile(r'(?:[A-Z]{2,4}-)?(' + '|'.join(escaped_names) + r')')

    for play_id, play in plays_dict.items():
        text = play.get('text', '')
        
        if "TWO-POINT CONVERSION ATTEMPT" in text and "ATTEMPT SUCCEEDS" in text:
            attempts = text.split("TWO-POINT CONVERSION ATTEMPT")
            
            for attempt in attempts:
                if "ATTEMPT SUCCEEDS" in attempt and "ATTEMPT FAILS" not in attempt and "REVERSED" not in attempt:
                    players_involved = name_pattern.findall(attempt)
                    unique_players = list(dict.fromkeys(players_involved))
                    for p_name in unique_players:
                        p_ids = name_to_id_map.get(p_name, [])
                        if len(p_ids) == 1:
                            two_pt_counts[p_ids[0]] += 1
                            print(f"[2-PT Conversion] | Player: {p_name} ({p_ids[0]}) | Play ID: {play_id}")
                            print(f"{p_name}, {text}\n")
                        elif len(p_ids) > 1:
                            print(f"[AMBIGUOUS 2-PT Conversion]: '{p_name}' matched multiple IDs {p_ids} on Play: {play_id}. Text: {text}\n")
            
        if "FUMBLES" in text and "TOUCHDOWN" in text:
            recovery_chunks = re.split(r'recovered by', text, flags=re.IGNORECASE)
            
            if len(recovery_chunks) > 1:
                # Example: "HST-W.Anderson" or "HST-W.Marks"
                recovery_token = recovery_chunks[-1].strip().split()[0]
                matched_offensive = name_pattern.findall(recovery_token)
                
                if matched_offensive:
                    scorer_name = matched_offensive[0]
                    p_ids = name_to_id_map.get(scorer_name, [])
                    
                    if len(p_ids) == 1:
                        off_fum_td_counts[p_ids[0]] += 1
                        print(f"[Off Fumble Rec TD] | Player: {scorer_name} ({p_ids[0]}) | Play ID: {play_id}")
                        print(f"{scorer_name}, {text}\n")
                    elif len(p_ids) > 1:
                        print(f"[AMBIGUOUS Fumble Rec TD]: '{scorer_name}' matched multiple IDs {p_ids} on Play: {play_id}. Text: {text}\n")

    return two_pt_counts, off_fum_td_counts

def calculate_fantasy_points(player_row: dict) -> dict:
    """
    Computes fantasy projections for all available format archetypes.
    Returns a dictionary mapping the format name to the calculated points.
    """
    fantasy_scores = {}

    # Extract and clean core stats EXACTLY ONCE (Major performance win)
    p_yds = check(player_row.get('passingYards', 0.0))
    p_td = check(player_row.get('passingTouchdowns', 0.0))
    ints = check(player_row.get('interceptions', 0.0))
    r_yds = check(player_row.get('rushingYards', 0.0))
    r_td = check(player_row.get('rushingTouchdowns', 0.0))
    rec = check(player_row.get('receptions', 0.0))
    rec_yds = check(player_row.get('receivingYards', 0.0))
    rec_td = check(player_row.get('receivingTouchdowns', 0.0))
    fum_lost = check(player_row.get('fumblesLost', 0.0))
    
    kick_td = check(player_row.get('kickReturnTouchdowns', 0))
    punt_td = check(player_row.get('puntReturnTouchdowns', 0))

    two_pt = check(player_row.get('two_pt_conversions', 0))
    fbp_td  = check(player_row.get('off_fum_rec_tds', 0))
    misc_tds = kick_td + punt_td + fbp_td

    # Loop through the configs and run the math engine
    for format_type, cfg in SCORING_CONFIGS.items():
        pts = (
            (p_yds * cfg.get("pass_yd", 0)) + (p_td * cfg.get("pass_td", 0)) + (ints * cfg.get("int", 0)) +
            (r_yds * cfg.get("rush_yd", 0)) + (r_td * cfg.get("rush_td", 0)) +
            (rec * cfg.get("rec", 0))       + (rec_yds * cfg.get("rec_yd", 0)) + (rec_td * cfg.get("rec_td", 0)) +
            (fum_lost * cfg.get("fumble_lost", 0)) + (two_pt * cfg.get("two_pt", 0)) + (misc_tds * cfg.get("misc_td", 0))
        )
        
        # Milestone Bonus Calculations
        if cfg.get("bonus_300p") and p_yds >= 300: pts += 3.0
        if cfg.get("bonus_100r") and r_yds >= 100: pts += 3.0
        if cfg.get("bonus_100rec") and rec_yds >= 100: pts += 3.0

        # Dynamically generate the key (e.g., 'half_ppr_points')
        dict_key = f'{format_type.lower().replace("-", "_")}_points'
        fantasy_scores[dict_key] = round(pts, 2)

    return fantasy_scores

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
