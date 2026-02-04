from abc import ABC, abstractmethod
from aiohttp import ClientSession
from asyncio import TaskGroup, run
from typing import Any
import pandas as pd
import string
from .table import Table
from dotenv import load_dotenv
import logging
import os
from nfl import models

load_dotenv()
logger = logging.getLogger(__name__)
print(f"DEBUG: My logger name is: {logger.name}")

class Endpoint(ABC):
    base_url = None
    
    @abstractmethod
    async def send_api_request(self, *args, **kwargs) -> Any:
        pass

    @abstractmethod
    def transform(self) -> Any:
        pass

    @abstractmethod
    def to_df(self) -> Any:
        pass

class EndpointGenerator(Endpoint):
    @abstractmethod
    async def spawn_tasks(self, *args, **kwargs) -> Any:
        pass

class WebScraping(Endpoint):
    source = None

    @abstractmethod
    async def send_api_request(self, *args, **kwargs) -> Any:
        pass

class Teams(Endpoint):
    base_url = os.getenv('TEAMS_URL')

    def __init__(self):
        self.team_ids: list = []
        self.res: list = []
        self.raw = None

    async def send_api_request(self, session: ClientSession):
        async with session.get(url=Teams.base_url) as response:
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

                    self.res.append(defaults)

                    obj, created = models.Team.objects.update_or_create(
                        abbreviation=defaults['abbreviation'],
                        defaults=defaults
                    )

                    if created: logger.info(f"CREATED: TEAM {obj.full_name.upper()}")
                    else: logger.debug(f"UPDATED: TEAM {obj.full_name.upper()}")
    
    def helper(self) -> None:
        for conference in self.raw["content"]["standings"]["groups"]:
            for division in conference["groups"]:
                for team in division["standings"]["entries"]:
                    self.team_ids.append(team["team"]["id"])
        return self.team_ids

    def to_df(self) -> None:
        print(pd.DataFrame(self.res))

class Odds(Endpoint):
    base_url = os.getenv('ODDS_URL')

    async def send_api_request(self, session: ClientSession) -> None:
        async with session.get(url=Odds.base_url) as response:
            data = await response.json()
            
            for week in data["lines"][:1]:
                print(week["displayValue"])
                for event in week['events']:
                    for comp in event['competitions']:
                        print(comp)

class Players(EndpointGenerator):
    base_url = os.getenv('PLAYERS_URL')

    def __init__(self):
        self.res = []
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
        async with session.get(url=self.base_url.format(team_id=team_id)) as response:
            return await response.json()

    def transform(self) -> None:
        positions = {'QB', 'WR', 'RB', 'TE'}

        team_abbreviatons = {team.abbreviation: team for team in models.Team.objects.all()}
        for team in self.raw:
            for position in team["athletes"]:
                if position["position"] == "offense":
                    for athlete in position["items"]:
                        if athlete["position"]["abbreviation"] in positions:
                            team_instance = team_abbreviatons.get(str(team['team']["abbreviation"]))

                            if not team_instance:
                                logger.warning(f"Skipping profile for unknown player: {str(athlete.get('displayName', ''))}")
                                continue
                            
                            defaults = {
                                "slug": generate_slug(athlete["displayName"]),
                                "first_name": str(athlete['firstName']),
                                "last_name": str(athlete.get('lastName', '')),
                                "full_name": str(athlete.get('displayName', '')),
                                "position": str(athlete['position']['abbreviation']),
                                "jersey": str(athlete.get('jersey', '')),
                                "experience": int(athlete['experience']['years']),
                                'team': team_instance
                            }

                            util_map = {
                                'player_id': athlete.get('id', ''),
                                "full_name": str(athlete.get('displayName', '')),
                            }
                            self.util.append(util_map)
                            self.res.append(defaults)

                            obj, created = models.Player.objects.update_or_create(
                                full_name=str(athlete.get('displayName', '')),
                                defaults=defaults
                            )

                            if created:
                                logger.info(f"CREATED: PLAYER {obj.full_name.upper()}")
                            else:
                                logger.debug(f"UPDATED: PLAYER {obj.full_name.upper()}")

    def helper(self):
        positions = {'QB', 'WR', 'RB', 'TE'}
        for team in self.raw:
            for position in team["athletes"]:
                if position["position"] == "offense":
                    for athlete in position["items"]:
                        if athlete["position"]["abbreviation"] in positions:
                            self.player_ids.append(athlete['id'])
        return self.player_ids
    
    def to_df(self) -> None:
        print(pd.DataFrame(self.res))

class PlayerStats(EndpointGenerator):
    base_url = os.getenv('STATS_URL')

    def __init__(self):
        self.raw = []
        self.res = []

    async def spawn_tasks(self, session, player_ids):
        async with TaskGroup() as taskgroup:
            tasks = [
                taskgroup.create_task(
                    self.send_api_request(session, player_id)
            ) for player_id in player_ids
        ]
        self.raw = [t.result() for t in tasks]

    async def send_api_request(self, session: ClientSession, player_id: str):
        async with session.get(PlayerStats.base_url.format(player_id=player_id)) as response:
            return await response.json()
    
    def transform(self, util: list) -> None:
        games_map = {game.event: game for game in models.Game.objects.all()}
        players_map = {player.full_name: player for player in models.Player.objects.all()}
        
        for player_data, u in zip(self.raw, util):
            player_instance = players_map.get(str(u['full_name']))
            if not player_instance:
                logger.warning(f"Player not found in DB: {u['full_name']}")
                continue

            for season_type in player_data.get("seasonTypes", []):
                for category in season_type["categories"]:
                    games_played = len(category['events'])
                    
                    for event in category["events"]:
                        event_id = str(event.get('eventId'))
                        game_instance = games_map.get(event_id)

                        if not game_instance:
                            logger.debug(f"Game ID {event_id} not found in DB. Skipping.")
                            continue
                        
                        stats = {name: stat for name, stat in zip(player_data["names"], event["stats"])}
                        
                        defaults = {
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
                        self.res.append(defaults)

                        _, created = models.PlayerGameStats.objects.update_or_create(
                            player=player_instance,
                            game=game_instance,
                            defaults=defaults
                        )

                        if created:
                            logger.info(f"CREATED: PLAYER_STATS {str(u['full_name']).upper()}")
                        else:
                            logger.debug(f"UPDATED: PLAYER_STATS {str(u['full_name']).upper()}")

    def to_df(self) -> None:
        print(pd.DataFrame(self.res))

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
        self.res = []
        self.raw = []

    async def spawn_tasks(self, session: ClientSession, upcoming_week: int):
        # previous_week = upcoming_week - 1
        async with TaskGroup() as taskgroup:
            tasks = [
                taskgroup.create_task(
                    self.send_api_request(session=session, week=week)
                ) for week in range(1, upcoming_week)
            ]
        self.raw = [t.result() for t in tasks]

    async def send_api_request(self, session: ClientSession, week: int) -> None:
        async with session.get(Events.base_url.format(week=week)) as response:
            return await response.json()
        
    def transform(self) -> None:
        if not self.raw:
            return
        
        team_abbreviatons = {team.abbreviation: team for team in models.Team.objects.all()}
        for data in self.raw:
            for event in data['events']:
                for comp in event['competitions']:
                    for team in comp['competitors']:
                        if team['homeAway'] == 'home':
                            home_team = team['team']['abbreviation']
                            home_team_instance = team_abbreviatons.get(home_team)
                            home_score = team['score']
                        else:
                            away_team = team['team']['abbreviation']
                            away_team_instance = team_abbreviatons.get(away_team)
                            away_score = team['score']

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
                self.res.append(defaults)

                obj, created = models.Game.objects.update_or_create(
                    event=defaults['event'],
                    defaults=defaults
                )

                if created: logger.info(f"CREATED: EVENT {obj.short_name.upper()} - WEEK {obj.week}")
                else: logger.debug(f"UPDATED: EVENT {obj.short_name.upper()} - WEEK {obj.week}")

    def to_df(self) -> None:
        print(pd.DataFrame(self.res))

class OffensePassing(WebScraping):
    base_url = os.getenv('OFFENSE_PASSING_URL')
    source = "nfl"

    def __init__(self):
        self.raw = []
        self.res = []

    async def send_api_request(self, session: ClientSession):
        async with session.get(url=OffensePassing.base_url) as response:
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
                'team': team_instance
            }
            self.res.append(defaults)

            _, created = models.TeamOffensePassingStats.objects.update_or_create(
                team=team_instance,
                defaults=defaults
            )

            if created:
                logger.info(f"CREATED: TEAM OFFENSE_PASSING {str(item['Team']).upper()}")
            else:
                logger.debug(f"UPDATED: TEAM OFFENSE_PASSING {str(item['Team']).upper()}")
    
    def to_df(self) -> None:
        print(pd.DataFrame(self.res))

class OffenseRushing(WebScraping):
    base_url = os.getenv('OFFENSE_RUSHING_URL')
    source = "nfl"

    def __init__(self):
        self.raw = []
        self.res = []

    async def send_api_request(self, session: ClientSession):
        async with session.get(url=OffenseRushing.base_url) as response:
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
                'team': team_instance
            }
            self.res.append(defaults)

            _, created = models.TeamOffenseRushingStats.objects.update_or_create(
                team=team_instance,
                defaults=defaults
            )
            
            if created:
                logger.info(f"CREATED: TEAM OFFENSE_RUSHING {str(item['Team']).upper()}")
            else:
                logger.debug(f"UPDATED: TEAM OFFENSE_RUSHING {str(item['Team']).upper()}")
        
    def to_df(self) -> None:
        print(pd.DataFrame(self.res))

class OffenseReceiving(WebScraping):
    base_url = os.getenv('OFFENSE_RECEIVING_URL')
    source = "nfl"

    def __init__(self):
        self.raw = []
        self.res = []

    async def send_api_request(self, session: ClientSession):
        async with session.get(url=OffenseReceiving.base_url) as response:
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
                'team': team_instance
            }
            self.res.append(defaults)

            _, created = models.TeamOffenseReceivingStats.objects.update_or_create(
                team=team_instance,
                defaults=defaults
            )

            if created:
                logger.info(f"CREATED: TEAM OFFENSE_RECEIVING {str(item['Team']).upper()}")
            else:
                logger.debug(f"UPDATED: TEAM OFFENSE_RECEIVING {str(item['Team']).upper()}")
        
    def to_df(self) -> None:
        print(pd.DataFrame(self.res))

class DefensePassing(WebScraping):
    base_url = os.getenv('DEFENSE_PASSING_URL')
    source = "nfl"

    def __init__(self):
        self.raw = []
        self.res = []

    async def send_api_request(self, session: ClientSession):
        async with session.get(url=DefensePassing.base_url) as response:
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
                'team': team_instance
            }
            self.res.append(defaults)

            _, created = models.TeamDefensePassingStats.objects.update_or_create(
                team=team_instance,
                defaults=defaults
            )

            if created:
                logger.info(f"CREATED: TEAM DEFENSE_PASSING {str(item['Team']).upper()}")
            else:
                logger.debug(f"UPDATED: TEAM DEFENSE_PASSING {str(item['Team']).upper()}")
        
    def to_df(self) -> None:
        print(pd.DataFrame(self.res))

class DefenseRushing(WebScraping):
    base_url = os.getenv('DEFENSE_RUSHING_URL')
    source = "nfl"

    def __init__(self):
        self.raw = []
        self.res = []

    async def send_api_request(self, session: ClientSession):
        async with session.get(url=DefenseRushing.base_url) as response:
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
                'team': team_instance
            }
            self.res.append(defaults)

            _, created = models.TeamDefenseRushingStats.objects.update_or_create(
                team=team_instance,
                defaults=defaults
            )

            if created:
                logger.info(f"CREATED: TEAM DEFENSE_RUSHING {str(item['Team']).upper()}")
            else:
                logger.debug(f"UPDATED: TEAM DEFENSE_RUSHING {str(item['Team']).upper()}")
        
    def to_df(self) -> None:
        print(pd.DataFrame(self.res))

class DefenseReceiving(WebScraping):
    base_url = os.getenv('DEFENSE_RECEIVING_URL')
    source = "nfl"

    def __init__(self):
        self.raw = []
        self.res = []

    async def send_api_request(self, session: ClientSession):
        async with session.get(url=DefenseReceiving.base_url) as response:
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
                'team': team_instance
            }
            self.res.append(defaults)

            _, created = models.TeamDefenseReceivingStats.objects.update_or_create(
                team=team_instance,
                defaults=defaults
            )

            if created:
                logger.info(f"CREATED: TEAM DEFENSE_RECEIVING {str(item['Team']).upper()}")
            else:
                logger.debug(f"UPDATED: TEAM DEFENSE_RECEIVING {str(item['Team']).upper()}")
        
    def to_df(self) -> None:
        print(pd.DataFrame(self.res))

class AdvanceOffense(WebScraping):
    base_url = os.getenv('ADVANCE_OFFENSE_URL')
    source = "sumer"

    def __init__(self):
        self.raw = []
        self.res = []

    async def send_api_request(self, session: ClientSession):
        async with session.get(url=AdvanceOffense.base_url) as response:
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
                'season_year': int(item['Season']),
                'expected_points_added_per_play': float(item['EPA/Play']),
                'total_expected_points_added': float(item['Total EPA']),
                'success_pct': float(item['Success %'].split('%')[0]),
                'expected_points_added_per_pass': float(item['EPA/Pass']),
                'expected_points_added_per_rush': float(item['EPA/Rush']),
                'average_depth_of_target': float(item['ADoT']),
                'scramble_pct': float(item['Scramble %'].split('%')[0]),
                'interception_pct': float(item['Int %'].split('%')[0]),
                'team': team_instance
            }
            self.res.append(defaults)

            _, created = models.TeamAdvanceOffenseStats.objects.update_or_create(
                team=team_instance,
                defaults=defaults
            )

            if created:
                logger.info(f"CREATED: TEAM OFF_ADVANCE_STATS {str(item['Team']).upper()}")
            else:
                logger.debug(f"UPDATED: TEAM OFF_ADVANCE_STATS {str(item['Team']).upper()}")
        
    def to_df(self) -> None:
        print(pd.DataFrame(self.res))

class AdvanceDefense(WebScraping):
    base_url = os.getenv('ADVANCE_DEFENSE_URL')
    source = "sumer"

    def __init__(self):
        self.raw = []
        self.res = []

    async def send_api_request(self, session: ClientSession):
        async with session.get(url=AdvanceDefense.base_url) as response:
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
                'season_year': int(item['Season']),
                'expected_points_added_per_play': float(item['EPA/Play']),
                'total_expected_points_added': float(item['Total EPA']),
                'success_pct': float(item['Success %'].split('%')[0]),
                'expected_points_added_allowed_per_pass': float(item['EPA/Pass']),
                'expected_points_added_allowed_per_rush': float(item['EPA/Rush']),
                'average_depth_of_target_against': float(item['ADoT']),
                'scramble_pct': float(item['Scramble %'].split('%')[0]),
                'interception_pct': float(item['Int %'].split('%')[0]),
                'team': team_instance
            }
            self.res.append(defaults)

            _, created = models.TeamAdvanceDefenseStats.objects.update_or_create(
                team=team_instance,
                defaults=defaults
            )

            if created:
                logger.info(f"CREATED: TEAM DEF_ADVANCE_STATS {str(item['Team']).upper()}")
            else:
                logger.debug(f"UPDATED: TEAM DEF_ADVANCE_STATS {str(item['Team']).upper()}")
        
    def to_df(self) -> None:
        print(pd.DataFrame(self.res))
        
class CoverageSchemes(WebScraping):
    base_url = os.getenv('COVERAGE_SCHEMES_URL')
    source = "sharp"

    def __init__(self):
        self.raw = []
        self.res = []

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
                'team': team_instance
            }
            self.res.append(defaults)

            _, created = models.TeamCoverageSchemeStats.objects.update_or_create(
                team=team_instance,
                defaults=defaults
            )

            if created:
                logger.info(f"CREATED: TEAM COVERAGE_SCHEME_STATS {str(item['Team']).upper()}")
            else:
                logger.debug(f"UPDATED: TEAM COVERAGE_SCHEME_STATS {str(item['Team']).upper()}")
        
    def to_df(self) -> None:
        print(pd.DataFrame(self.res))

class OffenseTendencies(WebScraping):
    base_url = os.getenv('OFFENSE_TENDENCIES_URL')
    source = "sharp"

    def __init__(self):
        self.raw = []
        self.res = []

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
                'team': team_instance
            }
            self.res.append(defaults)

            _, created = models.TeamOffensePlayCallingStats.objects.update_or_create(
                team=team_instance,
                defaults=defaults
            )

            if created:
                logger.info(f"CREATED: TEAM TENDENCIES_STATS {str(item['Team']).upper()}")
            else:
                logger.debug(f"UPDATED: TEAM TENDENCIES_STATS {str(item['Team']).upper()}")
        
    def to_df(self) -> None:
        print(pd.DataFrame(self.res))

class CoverageStatsByPosition(WebScraping):
    base_url = os.getenv('COVERAGE_STATS_BY_POSITION_URL')
    source = "sharp"

    def __init__(self):
        self.raw = []
        self.res = []

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
                'team': team_instance
            }
            self.res.append(defaults)

            _, created = models.TeamCoverageStatsByPosition.objects.update_or_create(
                team=team_instance,
                defaults=defaults
            )

            if created:
                logger.info(f"CREATED: TEAM COVERAGE_STATS_BY_POSITION {str(item['Team']).upper()}")
            else:
                logger.debug(f"UPDATED: TEAM COVERAGE_STATS_BY_POSITION {str(item['Team']).upper()}")
        
    def to_df(self) -> None:
        print(pd.DataFrame(self.res))

# Needs Work
class SnapCount(WebScraping):
    base_url = os.getenv('SNAP_COUNT_URL')
    source = "footballguys"

    def __init__(self, fetching: bool):
        self.fetching = fetching
        self.raw = []
        self.res = []

    async def send_api_request(self, session: ClientSession):
        if self.fetching == False:
            with open('snap-count.html', 'r', encoding='utf-8') as f:
                content = f.read()
        
            self.raw = Table(html=content, source=SnapCount.source).parser2
            print('Read from file')

        if self.fetching == True:
            async with session.get(url=SnapCount.base_url) as response:
                html = await response.text()

                with open('snap-count.html', 'w', encoding='utf-8') as f:
                    f.write(html)

                self.raw = Table(html=html, source=SnapCount.source).parser2
                print('API Request')

    def transform(self):
        return self.raw
                
    def to_df(self) -> None:
        print(pd.DataFrame(self.raw))

# Might deprecate this
def generate_slug(name: str) -> str:
    name = ''.join([c for c in name if c not in string.punctuation])
    name = name.lower().replace(' ', '-')
    return name

class NFLPipeline(object):
    def __init__(self, upcoming_week):
        self.endpoints: list = []
        self.generators: list = []
        self.upcoming_week = upcoming_week

    def create_endpoint(self, endpoint) -> None:
        self.endpoints.append(endpoint)

    def create_generator(self, generator) -> None:
        self.generators.append(generator)
    
    async def extract_data(self):
       async with ClientSession() as session:
            if not self.endpoints:
                print('No endpoints to process.')
            else:
                for endpoint in self.endpoints:
                    if isinstance(endpoint, Teams):
                        team_ids = await endpoint.send_api_request(session)
                    else:
                        await endpoint.send_api_request(session)
            if not self.generators:
                print("No generators to process.")
            else:
                for generator in self.generators:
                    if isinstance(generator, Events):
                        await generator.spawn_tasks(session, upcoming_week=self.upcoming_week)
                    elif isinstance(generator, Players):
                        player_ids = await generator.spawn_tasks(session, team_ids[:1])
                    elif isinstance(generator, PlayerStats):
                        await generator.spawn_tasks(session, player_ids)

def main():
    pl = NFLPipeline(upcoming_week=19)

    teams = Teams()
    events = Events()
    players = Players()
    stats = PlayerStats()
    offense_passing = OffensePassing()
    offense_rushing = OffenseRushing()
    offense_receiving = OffenseReceiving()
    defense_passing = DefensePassing()
    defense_rushing = DefenseRushing()
    defense_receiving = DefenseReceiving()
    advance_offense = AdvanceOffense()
    advance_defense = AdvanceDefense()
    coverage_schemes = CoverageSchemes()
    offense_tendencies = OffenseTendencies()
    coverage_position = CoverageStatsByPosition()

    pl.create_endpoint(teams)
    # pl.create_generator(events)
    pl.create_generator(players)
    pl.create_generator(stats)
    # pl.create_endpoint(offense_passing)
    # pl.create_endpoint(offense_rushing)
    # pl.create_endpoint(offense_receiving)
    # pl.create_endpoint(defense_passing)
    # pl.create_endpoint(defense_rushing)
    # pl.create_endpoint(defense_receiving)
    # pl.create_endpoint(advance_offense)
    # pl.create_endpoint(advance_defense)
    # pl.create_endpoint(coverage_schemes)
    # pl.create_endpoint(offense_tendencies)
    # pl.create_endpoint(coverage_position)


    # Perform Async operations to extract raw data
    run(pl.extract_data())

    # Then transform after async opperations are done
    teams.transform()
    # events.transform()
    players.transform()
    stats.transform(players.util)
    # offense_passing.transform()
    # offense_rushing.transform()
    # offense_receiving.transform()
    # defense_passing.transform()
    # defense_rushing.transform()
    # defense_receiving.transform()
    # advance_offense.transform()
    # advance_defense.transform()
    # coverage_schemes.transform()
    # offense_tendencies.transform()
    # coverage_position.transform()

    # games = {game.event: game for game in models.Game.objects.all()}
    # print(games.get('401772830'))