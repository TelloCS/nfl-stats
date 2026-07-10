from asyncio import run
from aiohttp import ClientSession
from nfl.services.extract import (
    Teams, Players, Events, Games,
    OffensePassing, OffenseRushing, OffenseReceiving,
    DefensePassing, DefenseRushing, DefenseReceiving,
    AdvanceOffense, AdvanceDefense,
    CoverageSchemes, CoverageStatsByPosition, OffenseTendencies
)
from nfl.services.transform import transform

async def run_extraction_pipeline(config: dict):
    async with ClientSession() as session:
        teams = Teams()
        await teams.send_api_request(session)

        events = Events()
        weeks = list(range(config['start_week'], config['end_week'] + 1))
        await events.spawn_tasks(
            session, 
            dates=config['dates'], 
            seasontype=config['seasontype'], 
            weeks=weeks
        )

        games = Games(params={
            'region':'us', 'lang': 'en', 'contentorigin': 'espn', 'features': 'ng'
        })
        await games.spawn_tasks(
            session,
            ids=events.event_ids, # [401772949, 401772851, 401772903, ...]
            id_key='event'
        )

        players = Players()
        await players.spawn_tasks(
            session,
            ids=teams.team_ids,
            id_key='team_id'
        )

        offense_passing = await OffensePassing().send_api_request(session, season_year=config['dates'])
        offense_rushing = await OffenseRushing().send_api_request(session, season_year=config['dates'])
        offense_receiving = await OffenseReceiving().send_api_request(session, season_year=config['dates'])
        defense_passing = await DefensePassing().send_api_request(session, season_year=config['dates'])
        defense_rushing = await DefenseRushing().send_api_request(session, season_year=config['dates'])
        defense_receiving = await DefenseReceiving().send_api_request(session, season_year=config['dates'])
        advance_offense = await AdvanceOffense().send_api_request(session, season=config['dates'])
        advance_defense = await AdvanceDefense().send_api_request(session, season=config['dates'])
        coverage_schemes = await CoverageSchemes().send_api_request(session)
        offense_tendencies = await CoverageStatsByPosition().send_api_request(session)
        coverage_position = await OffenseTendencies().send_api_request(session)

    return {
        'teams': teams.raw,
        'events': events.raw,
        'games': games.raw,
        'players': players.raw,
        'offense_passing': offense_passing,
        'offense_rushing': offense_rushing,
        'offense_receiving': offense_receiving,
        'defense_passing': defense_passing,
        'defense_rushing': defense_rushing,
        'defense_receiving': defense_receiving,
        'advance_offense': advance_offense,
        'advance_defense': advance_defense,
        'coverage_schemes': coverage_schemes,
        'offense_tendencies': offense_tendencies,
        'coverage_position': coverage_position
    }


def main(raw_payload, context: dict) -> None:
    transform(raw_payload=raw_payload, config=context)
    return None
