import os
import logging
import requests
from dotenv import load_dotenv
from typing import Any
from aiohttp import ClientSession
from asyncio import TaskGroup, run
from dateutil import parser
from datetime import datetime, timezone
from nfl import models
from nfl.services.utils import (
    DEFAULT_HEADERS,
    Endpoint,
    EndpointGenerator,
    WebScraping,
    Table,
    generate_slug
)
from nfl.services.utils import PIPELINE_CONFIG

load_dotenv()
logger = logging.getLogger(__name__)

class Teams(Endpoint):
    base_url = os.getenv('TEAMS_URL')

    def __init__(self):
        self.team_ids: list = []
        self.raw = None

    async def send_api_request(self, session: ClientSession):
        override_accept = {"Accept": "application/json"}
        async with session.get(url=Teams.base_url, headers=override_accept) as response:
            self.raw = await response.json()
            return self.helper()
    
    def transform(self) -> None:
        for conference in self.raw["content"]["standings"]["groups"]:
            for division in conference["groups"]:
                for team in division["standings"]["entries"]:
                    team_name: str = team["team"]["displayName"]
                    
                    defaults = {
                        "slug": team_name.lower().replace(' ', '-'),
                        "full_name": team['team']['displayName'],
                        "nickname": team['team']['name'],
                        "abbreviation": team['team']['abbreviation'],
                        "conference": conference['abbreviation'],
                        "division": division['abbreviation'],
                    }

                    obj, created = models.Team.objects.update_or_create(
                        abbreviation=defaults['abbreviation'],
                        defaults=defaults
                    )

                    if created:
                        logger.info(f"CREATED: TEAM {obj.full_name.upper()}")
                    else:
                        logger.debug(f"UPDATED: TEAM {obj.full_name.upper()}")
        self.raw = None
    
    def helper(self) -> None:
        for conference in self.raw["content"]["standings"]["groups"]:
            for division in conference["groups"]:
                for team in division["standings"]["entries"]:
                    self.team_ids.append(team["team"]["id"])
        return self.team_ids

class Odds(Endpoint):
    base_url = os.getenv('ODDS_URL')

    async def send_api_request(self, session: ClientSession) -> None:
        async with session.get(url=Odds.base_url) as response:
            data = await response.json()
            
            for week in data["lines"][:1]:
                logger.info(week["displayValue"])
                for event in week['events']:
                    for comp in event['competitions']:
                        logger.info(comp)

class Players(EndpointGenerator):
    base_url = os.getenv('PLAYERS_URL')

    def __init__(self):
        self.raw = []
        self.util = []
        self.player_ids = []
        
    async def spawn_tasks(self, session: ClientSession, team_ids: list[str]) -> None:
        async with TaskGroup() as tg:
            tasks = [
                tg.create_task(
                    self.send_api_request(
                        session=session,
                        team_id=team_id,
                    )
                ) for team_id in team_ids
            ]
        self.raw = [t.result() for t in tasks]
        return self.helper()

    async def send_api_request(self, session: ClientSession, team_id: str) -> None:
        override_accept = {"Accept": "application/json"}
        async with session.get(url=self.base_url.format(team_id=team_id), headers=override_accept) as response:
            return await response.json()

    def transform(self) -> None:
        positions = {'QB', 'WR', 'RB', 'TE'}
        category = {'offense', 'injuredReserveOrOut'}

        team_abbreviatons = {team.abbreviation: team for team in models.Team.objects.all()}
        for team in self.raw:
            for position in team["athletes"]:
                if position["position"] in category:
                    for athlete in position["items"]:
                        if athlete["position"]["abbreviation"] in positions:
                            
                            util_map = {
                                'player_id': str(athlete.get('id', '')),
                                "full_name": str(athlete.get('displayName', '')),
                            }
                            self.util.append(util_map)

                            team_instance = team_abbreviatons.get(str(team['team']["abbreviation"]))

                            if not team_instance:
                                logger.warning(f"Skipping profile for unknown player: {str(athlete.get('displayName', ''))}")
                                continue
                            
                            defaults = {
                                "slug": generate_slug(athlete["displayName"]),
                                "espn_id": str(athlete.get('id', '')),
                                "first_name": str(athlete.get('firstName', '')),
                                "last_name": str(athlete.get('lastName', '')),
                                "full_name": str(athlete.get('displayName', '')),
                                "position": str(athlete['position']['abbreviation']),
                                "jersey": str(athlete.get('jersey', '')),
                                "experience": int(athlete.get('experience', {}).get('years', 0)),
                                'team': team_instance
                            }

                            obj, created = models.Player.objects.update_or_create(
                                espn_id=defaults['espn_id'],  
                                defaults=defaults
                            )

                            if created:
                                logger.info(f"CREATED: PLAYER {obj.full_name.upper()}")
                            else:
                                logger.debug(f"UPDATED: PLAYER {obj.full_name.upper()}")
        self.raw.clear()

    def helper(self):
        positions = {'QB', 'WR', 'RB', 'TE'}
        category = {'offense', 'injuredReserveOrOut'}
        
        for team in self.raw:
            for position in team["athletes"]:
                if position["position"] in category:
                    for athlete in position["items"]:
                        if athlete["position"]["abbreviation"] in positions:
                            self.player_ids.append(athlete['id'])
        return self.player_ids

class PlayerStats(EndpointGenerator):
    base_url = os.getenv('STATS_URL')

    def __init__(self):
        self.raw = []

    async def spawn_tasks(self, session, player_ids, season):
        async with TaskGroup() as taskgroup:
            tasks = [
                taskgroup.create_task(
                    self.send_api_request(session, player_id, season)
            ) for player_id in player_ids
        ]
        self.raw = [t.result() for t in tasks]

    async def send_api_request(self, session: ClientSession, player_id: str, season):
        url = PlayerStats.base_url.format(player_id=player_id)
        headers = {"Accept": "application/json"}

        params = {}
        if season:
            params['season'] = season

        async with session.get(url, headers=headers, params=params) as response:
            return await response.json()
    
    def transform(self, util: list) -> None:
        games_map = {game.event: game for game in models.Game.objects.all()}
        players_map = {player.espn_id: player for player in models.Player.objects.all()}
        teams_map = {team.abbreviation: team for team in models.Team.objects.all()}

        if len(self.raw) != len(util):
            logger.error(f"CRITICAL MISMATCH: Stats Raw ({len(self.raw)}) vs Util ({len(util)}).")
            raise ValueError("Zip alignment failed! Aborting stats transformation.")

        for player_data, u in zip(self.raw, util):
            player_instance = players_map.get(str(u['player_id']))
            if not player_instance:
                continue

            for season_type in player_data.get("seasonTypes", []):
                for category in season_type["categories"]:
                    games_played = len(category['events'])
                    
                    for event in category["events"]:
                        if category['splitType'] not in ('2', '3'):
                            continue

                        event_id = str(event.get('eventId'))
                        game_instance = games_map.get(event_id)

                        if not game_instance:
                            logger.debug(f"Game ID {event_id} not found in DB. Skipping.")
                            continue
                        
                        stats = {name: stat for name, stat in zip(player_data["names"], event["stats"])}

                        team_abbr = player_data['events'].get(event_id, {}).get('team', {}).get('abbreviation')
                        team_instance = teams_map.get(team_abbr)
                        if not team_instance:
                            logger.warning(f"Team {team_abbr} not found in teams_map. Skipping stats for this event.")
                            continue
                        
                        defaults = {
                            'team': team_instance,
                            'is_starter': stats.get('isStarter', True),
                            'pass_attempts': self.check(value=stats.get('passingAttempts', 0)),
                            'completions': self.check(value=stats.get('completions', 0)),
                            'pass_yards': self.check(value=stats.get('passingYards', 0)),
                            'pass_touchdowns': self.check(value=stats.get('passingTouchdowns', 0)),
                            'interceptions': self.check(value=stats.get('interceptions', 0)),

                            'completion_pct': self.check(value=stats.get('completionPct', 0.0)),
                            'yards_per_pass_attempt': self.check(value=stats.get('yardsPerPassAttempt', 0.0)),
                            'long_passing': self.check(value=stats.get('longPassing', 0)),
                            'sacks': self.check(value=stats.get('sacks', 0)),
                            'pass_rating': self.check(value=stats.get('QBRating', 0)),
                            'adjusted_qbr': self.check(value=stats.get('adjQBR', 0.0)),

                            'rush_attempts': self.check(value=stats.get('rushingAttempts', 0)),
                            'rush_yards': self.check(value=stats.get('rushingYards', 0)),
                            'rush_touchdowns': self.check(value=stats.get('rushingTouchdowns', 0)),

                            'yards_per_rush_attempt': self.check(value=stats.get('yardsPerRushAttempt', 0.0)),
                            'long_rushing': self.check(value=stats.get('longRushing', 0)),

                            'receptions': self.check(value=stats.get('receptions', 0)),
                            'rec_targets': self.check(value=stats.get('receivingTargets', 0)),
                            'rec_yards': self.check(value=stats.get('receivingYards', 0)),
                            'rec_touchdowns': self.check(value=stats.get('receivingTouchdowns', 0)),

                            'yards_per_reception': self.check(value=stats.get('yardsPerReception', 0.0)),
                            'long_reception': self.check(value=stats.get('longReception', 0)),
                            
                            'fumbles': self.check(value=stats.get('fumbles', 0)),
                            'fumbles_lost': self.check(value=stats.get('fumblesLost', 0)),
                            'games_played': games_played,
                        }

                        _, created = models.PlayerGameStats.objects.update_or_create(
                            player=player_instance,
                            game=game_instance,
                            defaults=defaults
                        )

                        if created:
                            logger.info(f"CREATED: PLAYER_STATS {str(u['full_name']).upper()}")
                        else:
                            logger.debug(f"UPDATED: PLAYER_STATS {str(u['full_name']).upper()}")
        self.raw.clear()

    def check(self, value: Any):
        if value == '-' or value is None:
            return 0
        try:
            return value
        except ValueError:
            return 0
        
class Events(EndpointGenerator):
    base_url = os.getenv('EVENTS_URL')

    def __init__(self):
        self.raw = []

    async def spawn_tasks(self, session: ClientSession, year: int = None, season_type: int = None, start_week: int = None, end_week: int = None) -> None:
        if start_week is not None and end_week is not None:
            weeks_to_fetch = range(start_week, end_week + 1)
        elif start_week is not None:
            weeks_to_fetch = [start_week]
        else:
            weeks_to_fetch = [None]

        async with TaskGroup() as taskgroup:
            tasks = [
                taskgroup.create_task(
                    self.send_api_request(session, year, season_type, week)
                ) for week in weeks_to_fetch
            ]
        self.raw = [t.result() for t in tasks]

    async def send_api_request(self, session: ClientSession, year: int = None, season_type: int = None, week: int = None):
        override_accept = {"Accept": "application/json"}
        if year and season_type and week:
            params = {
                "dates": year,
                "seasontype": season_type,
                "week": week
            }

            logger.info(f"Fetching: Year {year} | Type {season_type} | Week {week}")
            async with session.get(Events.base_url, params=params, headers=override_accept) as response:
                return await response.json()
        else:
            logger.info("Fetching LIVE data")
            async with session.get(Events.base_url) as response:
                return await response.json()
        
    def transform(self) -> None:
        if not self.raw:
            return
        
        team_abbreviatons = {team.abbreviation: team for team in models.Team.objects.all()}
        for data in self.raw:
            for event in data['events']:
                for comp in event['competitions']:
                    for team in comp['competitors']:
                        if team['team']['abbreviation'] not in team_abbreviatons:
                            home_team_instance, away_team_instance = None, None
                            continue

                        if team['homeAway'] == 'home':
                            home_team = team['team']['abbreviation']
                            home_team_instance = team_abbreviatons.get(home_team)
                            home_score = team['score']
                        else:
                            away_team = team['team']['abbreviation']
                            away_team_instance = team_abbreviatons.get(away_team)
                            away_score = team['score']

                if not home_team_instance and not away_team_instance:
                    continue

                defaults = {
                    'date': event['date'],
                    'name': event['name'],
                    'short_name': event['shortName'],
                    'season_year': event['season']['year'],
                    'season_type': event['season']['type'],
                    'week': event['week']['number'],
                    'home_score': home_score, 
                    'away_score': away_score,
                    'homeTeam': home_team_instance,
                    'awayTeam': away_team_instance,
                    'status': event['status']['type']['detail'], 
                    'event': event['id'] 
                }

                obj, created = models.Game.objects.update_or_create(
                    event=defaults['event'],
                    defaults=defaults
                )

                if created:
                    logger.info(f"CREATED: EVENT {obj.short_name.upper()} - WEEK {obj.week}")
                else:
                    logger.debug(f"UPDATED: EVENT {obj.short_name.upper()} - WEEK {obj.week}")
        self.raw.clear()

class OffensePassing(WebScraping):
    base_url = str(os.getenv('OFFENSE_PASSING_URL'))
    source = "nfl"

    def __init__(self, year):
        self.raw = None
        self.year = year

    async def send_api_request(self, session: ClientSession):
        url = OffensePassing.base_url.format(season_year=self.year)
        print(url)
        async with session.get(url=url) as response:
            html = await response.text()
            self.raw = Table(html=html, source=OffensePassing.source).parser
    
    def transform(self):
        if not self.raw:
            return

        team_nicknames = {team.nickname: team for team in models.Team.objects.all()}
        for item in self.raw:
            team_instance = team_nicknames.get(str(item['Team']))
            if not team_instance:
                logger.warning(f"Skipping stats for unknown team: {item['Team']}")
                continue

            defaults = {
                'pass_attempts': int(item['Att']),
                'completions': int(item['Cmp']),
                'completion_pct': float(item['Cmp %']),
                'yards_per_attempt': float(item['Yds/Att']),
                'pass_yards': int(item['Pass Yds']),
                'pass_touchdowns': int(item['TD']),
                'interceptions': int(item['INT']),
                'pass_rating': float(item['Rate'] ),
                'sacks': int(item['Sck']),
                'sack_yards': int(item['SckY']),
                'season_year': int(self.year),
                'team': team_instance
            }

            _, created = models.TeamOffensePassingStats.objects.update_or_create(
                team=team_instance,
                defaults=defaults
            )

            if created:
                logger.info(f"CREATED: TEAM OFFENSE_PASSING {str(item['Team']).upper()}")
            else:
                logger.debug(f"UPDATED: TEAM OFFENSE_PASSING {str(item['Team']).upper()}")
        self.raw = None

class OffenseRushing(WebScraping):
    base_url = str(os.getenv('OFFENSE_RUSHING_URL'))
    source = "nfl"

    def __init__(self, year):
        self.raw = None
        self.year = year

    async def send_api_request(self, session: ClientSession):
        url = OffenseRushing.base_url.format(season_year=self.year)
        async with session.get(url=url) as response:
            html = await response.text()
            self.raw = Table(html=html, source=OffenseRushing.source).parser

    def transform(self):
        if not self.raw:
            return
        
        team_nicknames = {team.nickname: team for team in models.Team.objects.all()}
        for item in self.raw:
            team_instance = team_nicknames.get(str(item['Team']))
            if not team_instance:
                logger.warning(f"Skipping stats for unknown team: {item['Team']}")
                continue

            defaults = {
                'rush_attempts': int(item['Att']),
                'rush_yards': int(item['Rush Yds']),
                'yards_per_carry': float(item['YPC']),
                'rush_touchdowns': int(item['TD']),
                'rush_fumbles': int(item['Rush FUM']),
                'season_year': int(self.year),
                'team': team_instance
            }

            _, created = models.TeamOffenseRushingStats.objects.update_or_create(
                team=team_instance,
                defaults=defaults
            )
            
            if created:
                logger.info(f"CREATED: TEAM OFFENSE_RUSHING {str(item['Team']).upper()}")
            else:
                logger.debug(f"UPDATED: TEAM OFFENSE_RUSHING {str(item['Team']).upper()}")
        self.raw = None

class OffenseReceiving(WebScraping):
    base_url = str(os.getenv('OFFENSE_RECEIVING_URL'))
    source = "nfl"

    def __init__(self, year):
        self.raw = None
        self.year = year

    async def send_api_request(self, session: ClientSession):
        url = OffenseReceiving.base_url.format(season_year=self.year)
        async with session.get(url=url) as response:
            html = await response.text()
            self.raw = Table(html=html, source=OffenseReceiving.source).parser
    
    def transform(self):
        if not self.raw:
            return
        
        team_nicknames = {team.nickname: team for team in models.Team.objects.all()}
        for item in self.raw:
            team_instance = team_nicknames.get(str(item['Team']))
            if not team_instance:
                logger.warning(f"Skipping stats for unknown team: {item['Team']}")
                continue

            defaults = {
                'receptions': int(item['Rec']),
                'rec_yards': int(item['Yds']),
                'yards_per_reception': float(item['Yds/Rec']),
                'rec_touchdowns': int(item['TD']),
                'rec_fumbles': int(item['Rec FUM']),
                'season_year': int(self.year),
                'team': team_instance
            }

            _, created = models.TeamOffenseReceivingStats.objects.update_or_create(
                team=team_instance,
                defaults=defaults
            )

            if created:
                logger.info(f"CREATED: TEAM OFFENSE_RECEIVING {str(item['Team']).upper()}")
            else:
                logger.debug(f"UPDATED: TEAM OFFENSE_RECEIVING {str(item['Team']).upper()}")
        self.raw = None

class DefensePassing(WebScraping):
    base_url = str(os.getenv('DEFENSE_PASSING_URL'))
    source = "nfl"

    def __init__(self, year):
        self.raw = None
        self.year = year

    async def send_api_request(self, session: ClientSession):
        url = DefensePassing.base_url.format(season_year=self.year)
        async with session.get(url=url) as response:
            html = await response.text()
            self.raw = Table(html=html, source=DefensePassing.source).parser

    def transform(self):
        if not self.raw:
            return
        
        team_nicknames = {team.nickname: team for team in models.Team.objects.all()}
        for item in self.raw:
            team_instance = team_nicknames.get(str(item['Team']))
            if not team_instance:
                logger.warning(f"Skipping stats for unknown team: {item['Team']}")
                continue
            
            defaults = {
                'pass_attempts': int(item['Att']),
                'completions': int(item['Cmp']),
                'completion_pct': float(item['Cmp %']),
                'yards_per_attempt': float(item['Yds/Att']),
                'pass_yards': int(item['Yds']),
                'pass_touchdowns': int(item['TD']),
                'interceptions': int(item['INT']),
                'pass_rating': float(item['Rate'] ),
                'sacks': int(item['Sck']),
                'season_year': int(self.year),
                'team': team_instance
            }

            _, created = models.TeamDefensePassingStats.objects.update_or_create(
                team=team_instance,
                defaults=defaults
            )

            if created:
                logger.info(f"CREATED: TEAM DEFENSE_PASSING {str(item['Team']).upper()}")
            else:
                logger.debug(f"UPDATED: TEAM DEFENSE_PASSING {str(item['Team']).upper()}")
        self.raw = None

class DefenseRushing(WebScraping):
    base_url = str(os.getenv('DEFENSE_RUSHING_URL'))
    source = "nfl"

    def __init__(self, year):
        self.raw = None
        self.year = year

    async def send_api_request(self, session: ClientSession):
        url = DefenseRushing.base_url.format(season_year=self.year)
        async with session.get(url=url) as response:
            html = await response.text()
            self.raw = Table(html=html, source=DefenseRushing.source).parser

    def transform(self):
        if not self.raw:
            return

        team_nicknames = {team.nickname: team for team in models.Team.objects.all()}
        for item in self.raw:
            team_instance = team_nicknames.get(str(item['Team']))

            if not team_instance:
                logger.warning(f"Skipping stats for unknown team: {item['Team']}")
                continue

            defaults = {
                'rush_attempts': int(item['Att']),
                'rush_yards': int(item['Rush Yds']),
                'yards_per_carry': float(item['YPC']),
                'rush_touchdowns': int(item['TD']),
                'rush_fumbles': int(item['Rush FUM']),
                'season_year': int(self.year),
                'team': team_instance
            }

            _, created = models.TeamDefenseRushingStats.objects.update_or_create(
                team=team_instance,
                defaults=defaults
            )

            if created:
                logger.info(f"CREATED: TEAM DEFENSE_RUSHING {str(item['Team']).upper()}")
            else:
                logger.debug(f"UPDATED: TEAM DEFENSE_RUSHING {str(item['Team']).upper()}")
        self.raw = None

class DefenseReceiving(WebScraping):
    base_url = str(os.getenv('DEFENSE_RECEIVING_URL'))
    source = "nfl"

    def __init__(self, year):
        self.raw = None
        self.year = year

    async def send_api_request(self, session: ClientSession):
        url = DefenseReceiving.base_url.format(season_year=self.year)
        async with session.get(url=url) as response:
            html = await response.text()
            self.raw = Table(html=html, source=DefenseReceiving.source).parser

    def transform(self):
        if not self.raw:
            return
        
        team_nicknames = {team.nickname: team for team in models.Team.objects.all()}
        for item in self.raw:
            team_instance = team_nicknames.get(str(item['Team']))
            if not team_instance:
                logger.warning(f"Skipping stats for unknown team: {item['Team']}")
                continue
            
            defaults = {
                'receptions': int(item['Rec']),
                'rec_yards': int(item['Yds']),
                'yards_per_reception': float(item['Yds/Rec']),
                'rec_touchdowns': int(item['TD']),
                'rec_fumbles': int(item['Rec FUM']),
                'pass_defended': int(item['PDef']),
                'season_year': int(self.year),
                'team': team_instance
            }

            _, created = models.TeamDefenseReceivingStats.objects.update_or_create(
                team=team_instance,
                defaults=defaults
            )

            if created:
                logger.info(f"CREATED: TEAM DEFENSE_RECEIVING {str(item['Team']).upper()}")
            else:
                logger.debug(f"UPDATED: TEAM DEFENSE_RECEIVING {str(item['Team']).upper()}") 
        self.raw = None

class AdvanceOffense(WebScraping):
    base_url = os.getenv('ADVANCE_OFFENSE_URL')
    source = "sumer"

    def __init__(self, year):
        self.raw = None
        self.year = year

    async def send_api_request(self, session: ClientSession):
        params = { "season": self.year }
        async with session.get(url=AdvanceOffense.base_url, params=params) as response:
            html = await response.text()
            self.raw = Table(html=html, source=AdvanceOffense.source).parser

    def transform(self) -> None:
        if not self.raw:
            return
        
        team_nicknames = {team.nickname: team for team in models.Team.objects.all()}
        for item in self.raw:
            team_instance = team_nicknames.get(str(item['Team']))
            if not team_instance:
                logger.warning(f"Skipping stats for unknown team: {item['Team']}")
                continue

            defaults = {
                'expected_points_added_per_play': float(item['EPA/Play']),
                'total_expected_points_added': float(item['Total EPA']),
                'success_pct': float(item['Success %'].split('%')[0]),
                'expected_points_added_per_pass': float(item['EPA/Pass']),
                'expected_points_added_per_rush': float(item['EPA/Rush']),
                'average_depth_of_target': float(item['ADoT']),
                'scramble_pct': float(item['Scramble %'].split('%')[0]),
                'interception_pct': float(item['Int %'].split('%')[0]),
                'season_year': int(self.year),
                'team': team_instance
            }

            _, created = models.TeamAdvanceOffenseStats.objects.update_or_create(
                team=team_instance,
                defaults=defaults
            )

            if created:
                logger.info(f"CREATED: TEAM OFF_ADVANCE_STATS {str(item['Team']).upper()}")
            else:
                logger.debug(f"UPDATED: TEAM OFF_ADVANCE_STATS {str(item['Team']).upper()}")
        self.raw = None

class AdvanceDefense(WebScraping):
    base_url = os.getenv('ADVANCE_DEFENSE_URL')
    source = "sumer"

    def __init__(self, year):
        self.raw = None
        self.year = year

    async def send_api_request(self, session: ClientSession):
        params = { "season": self.year }
        async with session.get(url=AdvanceDefense.base_url, params=params) as response:
            html = await response.text()
            self.raw = Table(html=html, source=AdvanceDefense.source).parser

    def transform(self):
        if not self.raw:
            return
        
        team_nicknames = {team.nickname: team for team in models.Team.objects.all()}
        for item in self.raw:
            team_instance = team_nicknames.get(str(item['Team']))
            if not team_instance:
                logger.warning(f"Skipping stats for unknown team: {item['Team']}")
                continue

            defaults = {
                'expected_points_added_per_play': float(item['EPA/Play']),
                'total_expected_points_added': float(item['Total EPA']),
                'success_pct': float(item['Success %'].split('%')[0]),
                'expected_points_added_allowed_per_pass': float(item['EPA/Pass']),
                'expected_points_added_allowed_per_rush': float(item['EPA/Rush']),
                'average_depth_of_target_against': float(item['ADoT']),
                'scramble_pct': float(item['Scramble %'].split('%')[0]),
                'interception_pct': float(item['Int %'].split('%')[0]),
                'season_year': int(self.year),
                'team': team_instance
            }

            _, created = models.TeamAdvanceDefenseStats.objects.update_or_create(
                team=team_instance,
                defaults=defaults
            )

            if created:
                logger.info(f"CREATED: TEAM DEF_ADVANCE_STATS {str(item['Team']).upper()}")
            else:
                logger.debug(f"UPDATED: TEAM DEF_ADVANCE_STATS {str(item['Team']).upper()}")
        self.raw = None
        
class CoverageSchemes(WebScraping):
    base_url = os.getenv('COVERAGE_SCHEMES_URL')
    source = "sharp"

    def __init__(self, year):
        self.raw = None
        self.year = year

    async def send_api_request(self, session: ClientSession):
        async with session.get(url=CoverageSchemes.base_url) as response:
            html = await response.text()
            self.raw = Table(html=html, source=CoverageSchemes.source).parser

    def transform(self):
        if not self.raw:
            return
        
        team_nicknames = {team.nickname: team for team in models.Team.objects.all()}
        for item in self.raw:
            team_instance = team_nicknames.get(str(item['Team']))
            if not team_instance:
                logger.warning(f"Skipping stats for unknown team: {item['Team']}")
                continue

            defaults = {
                'man_rate': float(item['Man Rate'].split('%')[0]),
                'zone_rate': float(item['Zone Rate'].split('%')[0]),
                'middle_closed_rate': float(item['Middle Closed Rate'].split('%')[0]),
                'middle_open_rate': float(item['Middle Open Rate'].split('%')[0]),
                'season_year': int(self.year),
                'team': team_instance
            }

            _, created = models.TeamCoverageSchemeStats.objects.update_or_create(
                team=team_instance,
                defaults=defaults
            )

            if created:
                logger.info(f"CREATED: TEAM COVERAGE_SCHEME_STATS {str(item['Team']).upper()}")
            else:
                logger.debug(f"UPDATED: TEAM COVERAGE_SCHEME_STATS {str(item['Team']).upper()}")
        self.raw = None

class OffenseTendencies(WebScraping):
    base_url = os.getenv('OFFENSE_TENDENCIES_URL')
    source = "sharp"

    def __init__(self, year):
        self.raw = None
        self.year = year

    async def send_api_request(self, session: ClientSession):
        async with session.get(url=OffenseTendencies.base_url) as response:
            html = await response.text()
            self.raw = Table(html=html, source=OffenseTendencies.source).parser

    def transform(self):
        if not self.raw:
            return
        
        team_nicknames = {team.nickname: team for team in models.Team.objects.all()}
        for item in self.raw:
            team_instance = team_nicknames.get(str(item['Team']))
            if not team_instance:
                logger.warning(f"Skipping stats for unknown team: {item['Team']}")
                continue

            defaults = {
                'motion_rate': float(item['Motion Rate'].split('%')[0]),
                'play_action_rate': float(item['Play Action Rate'].split('%')[0]),
                'airyards_per_att': float(item['AirYards/Att'].split('%')[0]),
                'shotgun_rate': float(item['Shotgun Rate'].split('%')[0]),
                'nohuddle_rate': float(item['NoHuddle Rate'].split('%')[0]),
                'season_year': int(self.year),
                'team': team_instance
            }

            _, created = models.TeamOffensePlayCallingStats.objects.update_or_create(
                team=team_instance,
                defaults=defaults
            )

            if created:
                logger.info(f"CREATED: TEAM TENDENCIES_STATS {str(item['Team']).upper()}")
            else:
                logger.debug(f"UPDATED: TEAM TENDENCIES_STATS {str(item['Team']).upper()}")
        self.raw = None

class CoverageStatsByPosition(WebScraping):
    base_url = os.getenv('COVERAGE_STATS_BY_POSITION_URL')
    source = "sharp"

    def __init__(self, year):
        self.raw = None
        self.year = year

    async def send_api_request(self, session: ClientSession):
        async with session.get(url=CoverageStatsByPosition.base_url) as response:
            html = await response.text()
            self.raw = Table(html=html, source=CoverageStatsByPosition.source).parser

    def transform(self):
        if not self.raw:
            return
        
        team_nicknames = {team.nickname: team for team in models.Team.objects.all()}
        for item in self.raw:
            team_instance = team_nicknames.get(str(item['Team']))
            if not team_instance:
                logger.warning(f"Skipping stats for unknown team: {item['Team']}")
                continue

            defaults = {
                'yards_allowed_wr': float(item['YPT Allowed WR']),
                'yards_allowed_te': float(item['YPT Allowed TE']),
                'yards_allowed_rb': float(item['YPT Allowed RB']),
                'yards_allowed_outside': float(item['YPT Allowed Outside']),
                'yards_allowed_slot': float(item['YPT Allowed Slot']),
                'season_year': int(self.year),
                'team': team_instance
            }

            _, created = models.TeamCoverageStatsByPosition.objects.update_or_create(
                team=team_instance,
                defaults=defaults
            )

            if created:
                logger.info(f"CREATED: TEAM COVERAGE_STATS_BY_POSITION {str(item['Team']).upper()}")
            else:
                logger.debug(f"UPDATED: TEAM COVERAGE_STATS_BY_POSITION {str(item['Team']).upper()}")
        self.raw = None

class NFLPipeline(object):
    def __init__(self, year: int = None, season_type: int = None, start_week: int = None, end_week: int = None):
        self.endpoints: list[Endpoint] = []
        self.generators: list[EndpointGenerator] = []
        self.year = year
        self.season_type = season_type
        self.start_week = start_week
        self.end_week = end_week

    def create_endpoint(self, endpoint) -> None:
        self.endpoints.append(endpoint)

    def create_generator(self, generator) -> None:
        self.generators.append(generator)
    
    async def extract_data(self):
       async with ClientSession(headers=DEFAULT_HEADERS) as session:
            if not self.endpoints:
                logger.info('No endpoints to process.')
            else:
                for endpoint in self.endpoints:
                    if isinstance(endpoint, Teams):
                        team_ids = await endpoint.send_api_request(session)
                    else:
                        await endpoint.send_api_request(session)
            if not self.generators:
                logger.info("No generators to process.")
            else:
                for generator in self.generators:
                    if isinstance(generator, Events):
                        await generator.spawn_tasks(session, year=self.year, season_type=self.season_type, start_week=self.start_week, end_week=self.end_week)
                    elif isinstance(generator, Players):
                        player_ids = await generator.spawn_tasks(session, team_ids)
                    elif isinstance(generator, PlayerStats):
                        await generator.spawn_tasks(session, player_ids, season=self.year)

def should_pipeline_run() -> dict:
    base_url = os.getenv("EVENTS_URL")

    try:
        response = requests.get(base_url, timeout=10, headers=DEFAULT_HEADERS)

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

def main():
    manual_config = PIPELINE_CONFIG
    # manual_config = None
    
    if manual_config:
        logger.info(f"MANUAL MODE: Forcing run for {manual_config}")
        context = manual_config
    else:
        logger.info("AUTO MODE: Checking if NFL is in season...")
        context = should_pipeline_run()
        
        if not context:
            logger.info("NFL is out of season. Exiting.")
            return

    pl = NFLPipeline(
        year=context['year'],
        season_type=context['season_type'],
        start_week=context['start_week'],
        end_week=context['end_week']
    )
    
    teams = Teams()
    events = Events()
    players = Players()
    stats = PlayerStats()
    offense_passing = OffensePassing(year=context['year'])
    offense_rushing = OffenseRushing(year=context['year'])
    offense_receiving = OffenseReceiving(year=context['year'])
    defense_passing = DefensePassing(year=context['year'])
    defense_rushing = DefenseRushing(year=context['year'])
    defense_receiving = DefenseReceiving(year=context['year'])
    advance_offense = AdvanceOffense(year=context['year'])
    advance_defense = AdvanceDefense(year=context['year'])
    coverage_schemes = CoverageSchemes(year=context['year'])
    offense_tendencies = OffenseTendencies(year=context['year'])
    coverage_position = CoverageStatsByPosition(year=context['year'])

    pl.create_endpoint(teams)
    pl.create_generator(events)
    pl.create_generator(players)
    pl.create_generator(stats)
    pl.create_endpoint(offense_passing)
    pl.create_endpoint(offense_rushing)
    pl.create_endpoint(offense_receiving)
    pl.create_endpoint(defense_passing)
    pl.create_endpoint(defense_rushing)
    pl.create_endpoint(defense_receiving)
    pl.create_endpoint(advance_offense)
    pl.create_endpoint(advance_defense)
    pl.create_endpoint(coverage_schemes)
    pl.create_endpoint(offense_tendencies)
    pl.create_endpoint(coverage_position)


    # Perform Async operations to extract raw data
    run(pl.extract_data())

    # Then transform after async opperations are done
    teams.transform()
    events.transform()
    players.transform()
    stats.transform(players.util)
    offense_passing.transform()
    offense_rushing.transform()
    offense_receiving.transform()
    defense_passing.transform()
    defense_rushing.transform()
    defense_receiving.transform()
    advance_offense.transform()
    advance_defense.transform()
    coverage_schemes.transform()
    offense_tendencies.transform()
    coverage_position.transform()

    teams.team_ids.clear()
    players.player_ids.clear()
    players.util.clear()
    