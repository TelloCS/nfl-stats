import logging
from django.db import models
from nfl.models import (
    Team, Game, Player, PlayerGameStats,
    TeamOffensePassingStats, TeamOffenseReceivingStats, TeamOffenseRushingStats,
    TeamDefensePassingStats, TeamDefenseReceivingStats, TeamDefenseRushingStats,
    TeamAdvanceOffenseStats, TeamAdvanceDefenseStats, TeamCoverageSchemeStats,
    TeamCoverageStatsByPosition, TeamOffensePlayCallingStats
    
)
from dotenv import load_dotenv
from collections import defaultdict
from nfl.services.utils import (
    calculate_fantasy_points, extract_play_by_play_edge_cases, check, generate_slug,
    PASSING_STATS_MAP, RUSHING_STATS_MAP, RECEIVING_STATS_MAP,
    ADVANCE_OFF_STATS_MAP, ADVANCE_DEF_STATS_MAP, COVERAGE_SCHEMES_STATS_MAP,
    COVERAGE_STATS_BY_POSITION_STATS_MAP, OFF_TENDENCIES_STATS_MAP
)

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

                Team.objects.update_or_create(
                    abbreviation=defaults['abbreviation'],
                    defaults=defaults
                )

    return None


def transform_events(events_raw) -> None:
    if not events_raw:
        return

    team_abbreviatons = {team.abbreviation: team for team in Team.objects.all()}
    for data in events_raw:
        for event in data['events']:
            for comp in event['competitions']:
                home_team_instance, away_team_instance = None, None
                home_score, away_score = None, None
                skip_game = False
                
                for team in comp['competitors']:
                    if team['team']['abbreviation'] not in team_abbreviatons:
                        skip_game = True
                        break

                    if team['homeAway'] == 'home':
                        home_team = team['team']['abbreviation']
                        home_team_instance = team_abbreviatons.get(home_team)
                        home_score = team['score']
                    else:
                        away_team = team['team']['abbreviation']
                        away_team_instance = team_abbreviatons.get(away_team)
                        away_score = team['score']

            if skip_game or not home_team_instance or not away_team_instance:
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

            Game.objects.update_or_create(
                event=defaults['event'],
                defaults=defaults
            )

    return None


def transform_skill_player_stats(games_raw: list[dict]) -> dict:
    players_map = {player.espn_id: player for player in Player.objects.all()}
    games_map = {game.event: game for game in Game.objects.all()}
    team_map = {team.abbreviation: team for team in Team.objects.all()}

    unique_profiles = {}
    skill_positions = {'QB', 'WR', 'RB', 'TE'}

    for game in games_raw:
        game_player_map = defaultdict(dict)
        game_id = game.get('header', {}).get('id', 'unknown_game')
        game_instance = games_map.get(game_id)

        # --- Build a lookup map for the Play-by-Play parser ---
        short_name_to_id = defaultdict(list)
        all_athletes = game.get('boxscore', {}).get('players', [])
        athletes_profiles = game.get('entities', {}).get('athletes', {})
        
        for team in all_athletes:
            team_abbrev = team.get('team', {}).get('abbreviation', '')

            for stat_cat in team.get('statistics', []):
                for athlete in stat_cat.get('athletes', []):
                    player_id = str(athlete.get('athlete', {}).get('id', ''))
                    if not player_id:
                        continue

                    profile = athletes_profiles.get(player_id, {})
                    position = profile.get('athletePosition', {}).get('abbreviation', '')
                    if position not in skill_positions:
                        continue

                    # Creating the map: F.LastName -> Player ID
                    first_name = athlete['athlete'].get('firstName', '')
                    last_name = athlete['athlete'].get('lastName', '')
                    if not first_name or not last_name:
                        continue
                        
                    first_initial = first_name[0]

                    if team_abbrev:
                        team_prefixed_key = f"{team_abbrev}-{first_initial}.{last_name}"
                        if player_id not in short_name_to_id[team_prefixed_key]:
                            short_name_to_id[team_prefixed_key].append(player_id)

                    # Entry B: Full Name Fallback (e.g., "Josh Allen")
                    full_name_key = f"{first_name} {last_name}"
                    if player_id not in short_name_to_id[full_name_key]:
                        short_name_to_id[full_name_key].append(player_id)

                    # Entry C: Standard Short Name (e.g., "M.Pittman Jr.")
                    standard_short_name = f"{first_initial}.{last_name}"
                    if player_id not in short_name_to_id[standard_short_name]:
                        short_name_to_id[standard_short_name].append(player_id)
                    
                    # Entry D: Cleaned Suffix Fallback (e.g., "M.Pittman")
                    suffixes = (' Jr.', ' Sr.', ' III', ' II', ' IV', ' V', ' Jr', ' Sr')
                    cleaned_last_name = last_name
                    for suffix in suffixes:
                        if cleaned_last_name.endswith(suffix):
                            cleaned_last_name = cleaned_last_name[:-len(suffix)].strip()
                            break 
                    
                    cleaned_short_name = f"{first_initial}.{cleaned_last_name}"
                    if cleaned_short_name != standard_short_name:
                        if player_id not in short_name_to_id[cleaned_short_name]:
                            short_name_to_id[cleaned_short_name].append(player_id)

        plays_dict = game.get('entities', {}).get('plays', {})
        two_pt_data, off_fum_data = extract_play_by_play_edge_cases(plays_dict, short_name_to_id)

        # --- Parse the Boxscore ---
        for team_item in all_athletes:
            team_id = team_item.get('team', {}).get('id')
            team_abbreviaton = team_item.get('team', {}).get('abbreviation')
            team_instance = team_map.get(team_abbreviaton)

            for stat in team_item['statistics']:
                if stat['name'] not in ('passing', 'rushing', 'receiving', 'fumbles', 'kickReturns', 'puntReturns'):
                    continue

                stats_keys = stat['keys']

                for athlete in stat['athletes']:
                    player_id = athlete['athlete']['id']
                    game_player_map[player_id]['team_instance'] = team_instance
                    game_player_map[player_id]['name'] = athlete['athlete']['displayName']
                    game_player_map[player_id]['first_name'] = athlete['athlete']['firstName']
                    game_player_map[player_id]['team_id'] = team_id
                    game_player_map[player_id]['team_abbreviaton'] = team_abbreviaton

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

        athletes_profile_list = athletes_profiles.values() if isinstance(athletes_profiles, dict) else athletes_profiles
        for player in athletes_profile_list:
            position_data = player.get('athletePosition', {})
            if position_data.get('abbreviation') not in skill_positions:
                continue
            
            player_espn_id = player.get('id', '')
            if player_espn_id in unique_profiles:
                continue

            player_stats_dict = game_player_map.get(player_espn_id, {})
            first_name = player_stats_dict.get('first_name')
            team = player_stats_dict.get('team_abbreviaton')

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
            if not raw_stats:
                continue
        
            if not game_instance:
                logger.warning(f"SKIPPING STATS FOR {player_id}: Game {game_id} not found in database.")
                continue

            player_instance = players_map.get(player_id)

            if not player_instance:
                if player_id in unique_profiles:
                    player_defaults = unique_profiles[player_id].copy()
                    team_abbr = player_defaults.get('team')
                    
                    if team_abbr and team_abbr in team_map:
                        player_defaults['team'] = team_map[team_abbr]
                    else:
                        player_defaults['team'] = None
                        
                    player_instance, _ = Player.objects.update_or_create(
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

            raw_stats['two_pt_conversions'] = int(two_pt_data.get(player_id, 0))
            raw_stats['off_fum_rec_tds'] = int(off_fum_data.get(player_id, 0))

            player_full_name = raw_stats.get('name')

            fantasy_scores = calculate_fantasy_points(raw_stats)

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

                # Returns
                'kick_return_tds': check(raw_stats.get('kickReturnTouchdowns')),
                'punt_return_tds': check(raw_stats.get('puntReturnTouchdowns')),

                'two_pt_conversions': raw_stats['two_pt_conversions'],
                'off_fum_rec_tds': raw_stats['off_fum_rec_tds'],
                
                'ppr_points': float(fantasy_scores.get('ppr_points', 0.0)),
                'half_ppr_points': float(fantasy_scores.get('half_ppr_points', 0.0)),
                'non_ppr_points': float(fantasy_scores.get('non_ppr_points', 0.0)),
                'yahoo_points': float(fantasy_scores.get('yahoo_points', 0.0)),
                'draftkings_points': float(fantasy_scores.get('draftkings_points', 0.0)),
                'fanduel_points': float(fantasy_scores.get('fanduel_points', 0.0))
            }
            
            PlayerGameStats.objects.update_or_create(
                player=player_instance,
                game=game_instance,
                defaults=defaults
            )

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

    released_players = Player.objects.exclude(team__isnull=True).exclude(espn_id__in=seen_player_ids)
    for player in released_players:
        logger.info(f"FREE AGENT DETECTED: {player.full_name} is no longer on a roster.")
        if player.espn_id in unique_profiles:
            unique_profiles[player.espn_id]['team'] = None
    released_players.update(team=None)

    team_cache = {t.abbreviation: t for t in Team.objects.all()}
    for espn_id, profile_data in unique_profiles.items():
        
        defaults = profile_data.copy()
        team_abbr = defaults.get('team')

        if team_abbr and team_abbr in team_cache:
            defaults['team'] = team_cache[team_abbr]
        else:
            defaults['team'] = None

        Player.objects.update_or_create(
            espn_id=defaults['espn_id'],
            defaults=defaults
        )

    return None


def transform_team_stats(raw_data: dict, season_year: int, model: models.Model, field_mapping: dict, label: str):
    if not raw_data:
        return None
    
    team_nicknames = {team.nickname: team for team in Team.objects.all()}
    legacy_aliases = {
        "Football Team": "Commanders"
    }

    for item in raw_data:
        raw_team_name = str(item.get('Team', ''))
        lookup_name = legacy_aliases.get(raw_team_name, raw_team_name)

        team_instance = team_nicknames.get(lookup_name)
        if not team_instance:
            logger.warning(f"Skipping stats for unknown team: {item['Team']}")
            continue

        defaults = {}
        for model_field, (raw_key, cast_type) in field_mapping.items():
            raw_value = item.get(raw_key, 0)
            defaults[model_field] = cast_type(raw_value)

        model.objects.update_or_create(
            team=team_instance,
            season_year=int(season_year),
            defaults=defaults
        )

    raw_data = None


def transform(raw_payload: dict, config: dict) -> None:
    season_year = config.get('dates', '') if config is not None else None

    if raw_payload.get('teams', []):
        tranform_teams(raw_payload['teams'])

    if raw_payload.get('events', []):
        transform_events(raw_payload.get('events', []))

    if raw_payload.get('players', []):
        unique_profiles = transform_skill_player_stats(raw_payload.get('games', []))
        transform_player_profiles(raw_payload['players'], unique_profiles)

    if raw_payload.get('offense_passing', []):
        transform_team_stats(
            raw_data=raw_payload.get('offense_passing', []),
            season_year=season_year,
            model=TeamOffensePassingStats,
            field_mapping=PASSING_STATS_MAP,
            label="TEAM OFFENSE_PASSING"
        )
    if raw_payload.get('offense_rushing', []):
        transform_team_stats(
            raw_data=raw_payload.get('offense_rushing', []),
            season_year=season_year,
            model=TeamOffenseRushingStats,
            field_mapping=RUSHING_STATS_MAP,
            label="TEAM OFFENSE_RUSHING"
        )
    if raw_payload.get('offense_receiving', []):
        transform_team_stats(
            raw_data=raw_payload.get('offense_receiving', []),
            season_year=season_year,
            model=TeamOffenseReceivingStats,
            field_mapping=RECEIVING_STATS_MAP,
            label="TEAM OFFENSE_RECEIVING"
        )
    if raw_payload.get('defense_passing', []):
        DEF_PASSING_STATS_MAP = PASSING_STATS_MAP.copy()
        DEF_PASSING_STATS_MAP.pop('pass_yards')
        DEF_PASSING_STATS_MAP.pop('sack_yards')

        DEF_PASSING_STATS_MAP['pass_yards'] = ('Yds', int)

        transform_team_stats(
            raw_data=raw_payload.get('defense_passing', []),
            season_year=season_year,
            model=TeamDefensePassingStats,
            field_mapping=DEF_PASSING_STATS_MAP,
            label="TEAM DEFENSE_PASSING"
        )
    if raw_payload.get('defense_rushing', []):
        transform_team_stats(
            raw_data=raw_payload.get('defense_rushing', []),
            season_year=season_year,
            model=TeamDefenseRushingStats,
            field_mapping=RUSHING_STATS_MAP,
            label="TEAM DEFENSE_RUSHING"
        )
    if raw_payload.get('defense_receiving', []):
        DEF_RECEIVING_STATS_MAP = RECEIVING_STATS_MAP
        DEF_RECEIVING_STATS_MAP['pass_defended'] = ('PDef', int)

        transform_team_stats(
            raw_data=raw_payload.get('defense_receiving', []),
            season_year=season_year,
            model=TeamDefenseReceivingStats,
            field_mapping=DEF_RECEIVING_STATS_MAP,
            label="TEAM DEFENSE_RECEIVING"
        )

    if raw_payload.get('advance_offense', []):
        transform_team_stats(
            raw_data=raw_payload.get('advance_offense', []),
            season_year=season_year,
            model=TeamAdvanceOffenseStats,
            field_mapping=ADVANCE_OFF_STATS_MAP,
            label="TEAM OFF_ADVANCE_STATS"
        )
    if raw_payload.get('advance_defense', []):
        transform_team_stats(
            raw_data=raw_payload.get('advance_defense', []),
            season_year=season_year,
            model=TeamAdvanceDefenseStats,
            field_mapping=ADVANCE_DEF_STATS_MAP,
            label="TEAM DEF_ADVANCE_STATS"
        )

    if raw_payload.get('coverage_schemes', []):
       transform_team_stats(
            raw_data=raw_payload.get('coverage_schemes', []),
            season_year=season_year,
            model=TeamCoverageSchemeStats,
            field_mapping=COVERAGE_SCHEMES_STATS_MAP,
            label="TEAM COVERAGE_SCHEME_STATS"
        )
    if raw_payload.get('offense_tendencies', []):
        transform_team_stats(
            raw_data=raw_payload.get('offense_tendencies', []),
            season_year=season_year,
            model=TeamOffensePlayCallingStats,
            field_mapping=OFF_TENDENCIES_STATS_MAP,
            label="TEAM TENDENCIES_STATS"
        )
    if raw_payload.get('coverage_position', []):
        transform_team_stats(
            raw_data=raw_payload.get('coverage_position', []),
            season_year=season_year,
            model=TeamCoverageStatsByPosition,
            field_mapping=COVERAGE_STATS_BY_POSITION_STATS_MAP,
            label="TEAM COVERAGE_STATS_BY_POSITION"
        )

    return None
