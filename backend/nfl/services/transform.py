import logging
from nfl import models
from dotenv import load_dotenv
from collections import defaultdict
from nfl.services.utils import check, generate_slug

load_dotenv()
logger = logging.getLogger(__name__)

def tranform_teams(teams_raw) -> None:
    for conference in teams_raw["content"]["standings"]["groups"]:
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
    
    return None

def transform_events(events_raw) -> None:
    if not events_raw:
        return

    team_abbreviatons = {team.abbreviation: team for team in models.Team.objects.all()}
    for data in events_raw:
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

    return None


def transform_skill_player_stats(games_raw: list[dict]) -> dict:
    players_map = {player.espn_id: player for player in models.Player.objects.all()}
    games_map = {game.event: game for game in models.Game.objects.all()}
    team_map = {team.abbreviation: team for team in models.Team.objects.all()}

    unique_profiles = {}

    for game in games_raw:
        game_player_map = defaultdict(dict)
        game_id = game.get('header', {}).get('id', 'unknown_game')
        game_instance = games_map.get(game_id)

        # --- Build a lookup map for the Play-by-Play parser ---
        short_name_to_id = {}
        all_athletes = game.get('boxscore', {}).get('players', [])
        
        for team in all_athletes:
            for stat_cat in team.get('statistics', []):
                for athlete in stat_cat.get('athletes', []):
                    first_name = athlete['athlete'].get('firstName', '').strip()
                    last_name = athlete['athlete'].get('lastName', '').strip()

                    if first_name:
                        short_name = f"{first_name[0]}.{last_name}"
                    else:
                        short_name = last_name

                    short_name_to_id[short_name] = athlete['athlete']['id']

        # --- Parse the Boxscore ---
        for team_item in all_athletes:
            team_id = team_item.get('team', {}).get('id')
            team_abbreviaton = team_item.get('team', {}).get('abbreviation')
            team_instance = team_map.get(team_abbreviaton)

            for stat in team_item['statistics']:
                for athlete in stat['athletes']:
                    p_id = athlete['athlete']['id']
                    game_player_map[p_id]['team_instance'] = team_instance
                    game_player_map[p_id]['name'] = athlete['athlete']['displayName']
                    game_player_map[p_id]['first_name'] = athlete['athlete']['firstName']
                    game_player_map[p_id]['team_id'] = team_id
                    game_player_map[p_id]['team_abbreviaton'] = team_abbreviaton

            for stat in team_item['statistics']:
                if stat['name'] not in ('passing', 'rushing', 'receiving', 'fumbles', 'kickReturns', 'puntReturns'):
                    continue
                
                stats_keys = stat['keys']
                for athlete in stat['athletes']:
                    player_id = athlete['athlete']['id']

                    for key, val in zip(stats_keys, athlete['stats']):
                        if key == 'completions/passingAttempts':
                            if '/' in str(val):
                                comp, att = val.split('/')
                                game_player_map[player_id]['completions'] = comp
                                game_player_map[player_id]['passingAttempts'] = att
                        elif key == 'sacks-sackYardsLost':
                            if '-' in str(val) and val != '-':
                                sacks, _ = val.split('-')
                                game_player_map[player_id]['sacks'] = sacks
                        else:
                            game_player_map[player_id][key] = val


        skill_positions = {'QB', 'WR', 'RB', 'TE'}
        athletes_profiles = game.get('entities', {}).get('athletes', {})
        
        athletes_profile_list = athletes_profiles.values() if isinstance(athletes_profiles, dict) else athletes_profiles
        for player in athletes_profile_list:
            position_data = player.get('athletePosition', {})
            if position_data.get('abbreviation') not in skill_positions:
                continue
            
            player_espn_id = player.get('id', '')
            if player_espn_id in unique_profiles:
                continue

            first_name = game_player_map[player_espn_id].get('first_name')
            team = game_player_map[player_espn_id].get('team_abbreviaton')

            defaults = {
                "slug": generate_slug(player["displayName"]),
                "espn_id": str(player_espn_id),
                "first_name": str(first_name),
                "last_name": str(player.get('lastName', '')),
                "full_name": str(player.get('displayName', '')),
                "position": str(position_data.get('abbreviation')),
                "jersey": str(player.get('jersey', '')),
                "experience": int(player.get('experience', {}).get('years', 0)),
                "team": team
            }

            unique_profiles[player_espn_id] = defaults

        for player_id, raw_stats in game_player_map.items():
            player_instance = players_map.get(player_id)

            if not player_instance:
                if player_id in unique_profiles:
                    player_defaults = unique_profiles[player_id].copy()
                    team_abbr = player_defaults.get('team')
                    
                    if team_abbr and team_abbr in team_map:
                        player_defaults['team'] = team_map[team_abbr]
                    else:
                        player_defaults['team'] = None
                        
                    player_instance, _ = models.Player.objects.update_or_create(
                        espn_id=player_id,
                        defaults=player_defaults
                    )
                    players_map[player_id] = player_instance
                else:
                    continue

            player_historical_team = raw_stats.get('team_instance')
            if not player_historical_team and game_instance:
                p_team_abbr = raw_stats.get('team_abbreviaton')
                if game_instance.homeTeam and game_instance.homeTeam.abbreviation == p_team_abbr:
                    player_historical_team = game_instance.homeTeam
                elif game_instance.awayTeam and game_instance.awayTeam.abbreviation == p_team_abbr:
                    player_historical_team = game_instance.awayTeam

            if not player_historical_team:
                logger.warning(f"SKIPPING STATS FOR {raw_stats.get('name')}: Could not resolve historical team.")
                continue
            
            pass_attempts = check(raw_stats.get('passingAttempts', 0))
            completions = check(raw_stats.get('completions', 0))
            
            if pass_attempts > 0:
                calculated_completion_pct = round((completions / pass_attempts) * 100, 1)
            else:
                calculated_completion_pct = 0.0

            player_full_name = raw_stats.get('name')
            defaults = {
                'team': player_historical_team,
                'is_starter': raw_stats.get('isStarter', True),

                # Passing
                'pass_attempts': pass_attempts,
                'completions': completions,
                'pass_yards': check(raw_stats.get('passingYards', 0)),
                'pass_touchdowns': check(raw_stats.get('passingTouchdowns', 0)),
                'interceptions': check(raw_stats.get('interceptions', 0)),
                'completion_pct': calculated_completion_pct,
                'yards_per_pass_attempt': check(raw_stats.get('yardsPerPassAttempt', 0.0)),
                'long_passing': check(raw_stats.get('longPassing', 0)),
                'sacks': check(raw_stats.get('sacks', 0)),
                'pass_rating': check(raw_stats.get('QBRating', 0)),
                'adjusted_qbr': check(raw_stats.get('adjQBR', 0.0)),

                # Rushing
                'rush_attempts': check(raw_stats.get('rushingAttempts', 0)),
                'rush_yards': check(raw_stats.get('rushingYards', 0)),
                'rush_touchdowns': check(raw_stats.get('rushingTouchdowns', 0)),
                'yards_per_rush_attempt': check(raw_stats.get('yardsPerRushAttempt', 0)),
                'long_rushing': check(raw_stats.get('longRushing', 0)),

                # Receiving
                'receptions': check(raw_stats.get('receptions', 0)),
                'rec_targets': check(raw_stats.get('receivingTargets', 0)),
                'rec_yards': check(raw_stats.get('receivingYards', 0)),
                'rec_touchdowns': check(raw_stats.get('receivingTouchdowns', 0)),
                'yards_per_reception': check(raw_stats.get('yardsPerReception', 0.0)),
                'long_reception': check(raw_stats.get('longReception', 0)),
                
                # Fumbles
                'fumbles': check(raw_stats.get('fumbles', 0)),
                'fumbles_lost': check(raw_stats.get('fumblesLost', 0)),
            }
            
            _, created = models.PlayerGameStats.objects.update_or_create(
                player=player_instance,
                game=game_instance,
                defaults=defaults
            )

            if created:
                logger.info(f"CREATED: PLAYER_STATS {str(player_full_name).upper()}")
            else:
                logger.debug(f"UPDATED: PLAYER_STATS {str(player_full_name).upper()}")

    return unique_profiles


def transform_player_profiles(rosters_raw, unique_profiles) -> None:
    """
    Parses ESPN roster data, detects trades and free agents, 
    and syncs the data efficiently to the Django database.
    """
    positions = {'QB', 'WR', 'RB', 'TE'}
    category = {'offense', 'injuredReserveOrOut'}
    seen_player_ids = set()

    for team in rosters_raw:
        current_team_abbr = str(team.get('team', {}).get('abbreviation', ''))
        
        for roster_category in team.get("athletes", []): 
            if roster_category.get("position") in category:
                for athlete in roster_category.get("items", []):
                    athlete_position = athlete.get("position", {}).get("abbreviation", "")
                    
                    if athlete_position in positions:
                        player_espn_id = str(athlete.get('id', ''))
                        
                        if not player_espn_id:
                            continue

                        seen_player_ids.add(player_espn_id)

                        if player_espn_id in unique_profiles:
                            if unique_profiles[player_espn_id].get('team') != current_team_abbr:
                                logger.info(f"TRADE DETECTED: {unique_profiles[player_espn_id].get('full_name')} moved to {current_team_abbr}")
                                unique_profiles[player_espn_id]['team'] = current_team_abbr
                        else:
                            display_name = str(athlete.get('displayName', ''))
                            unique_profiles[player_espn_id] = {
                                "slug": generate_slug(display_name),
                                "espn_id": player_espn_id,
                                "first_name": str(athlete.get('firstName', '')),
                                "last_name": str(athlete.get('lastName', '')),
                                "full_name": display_name,
                                "position": athlete_position,
                                "jersey": str(athlete.get('jersey', '')),
                                "experience": int(athlete.get('experience', {}).get('years', 0)),
                                'team': current_team_abbr
                            }

    for player_espn_id, profile in unique_profiles.items():
        if player_espn_id not in seen_player_ids:
            if profile.get('team') is not None:
                logger.info(f"FREE AGENT DETECTED: {profile.get('full_name')} is no longer on a roster.")
                profile['team'] = None  

    team_cache = {t.abbreviation: t for t in models.Team.objects.all()}
    for espn_id, profile_data in unique_profiles.items():
        
        defaults = profile_data.copy()
        team_abbr = defaults.get('team')

        if team_abbr and team_abbr in team_cache:
            defaults['team'] = team_cache[team_abbr]
        else:
            defaults['team'] = None

        obj, created = models.Player.objects.update_or_create(
            espn_id=defaults['espn_id'],
            defaults=defaults
        )

        if created:
            logger.info(f"CREATED: PLAYER {obj.full_name.upper()}")
        else:
            logger.debug(f"UPDATED: PLAYER {obj.full_name.upper()}")

    return None


def transform(raw_payload) -> None:
    tranform_teams(raw_payload['teams'])
    transform_events(raw_payload['events'])
    unique_profiles = transform_skill_player_stats(raw_payload['games'])
    transform_player_profiles(raw_payload['players'], unique_profiles)
    return None
