from aiohttp import ClientSession
from celery.utils.log import get_task_logger
from nfl.services.extract import (
    Teams, Players, Events, Games,
    OffensePassing, OffenseRushing, OffenseReceiving,
    DefensePassing, DefenseRushing, DefenseReceiving,
    AdvanceOffense, AdvanceDefense,
    CoverageSchemes, CoverageStatsByPosition, OffenseTendencies
)
from nfl.services.transform import transform

logger = get_task_logger(__name__)

async def run_extraction_pipeline(config: dict):
    async with ClientSession() as session:
        logger.info("Always run Team and Players since rosters can change out of season.")
        teams = Teams()
        await teams.send_api_request(session)

        players = Players()
        await players.spawn_tasks(
            session,
            ids=teams.team_ids,
            id_key='team_id'
        )


        if config is not None:
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
        else:
            logger.info("NFL is out of season. Skipping Game and Team Stats ingestion.")

    return {
        'teams': teams.raw,
        'events': [] if config is None else events.raw,
        'games': [] if config is None else games.raw,
        'players': players.raw,
        'offense_passing': [] if config is None else offense_passing,
        'offense_rushing': [] if config is None else offense_rushing,
        'offense_receiving': [] if config is None else offense_receiving,
        'defense_passing': [] if config is None else defense_passing,
        'defense_rushing': [] if config is None else defense_rushing,
        'defense_receiving': [] if config is None else defense_receiving,
        'advance_offense': [] if config is None else advance_offense,
        'advance_defense': [] if config is None else advance_defense,
        'coverage_schemes': [] if config is None else coverage_schemes,
        'offense_tendencies': [] if config is None else offense_tendencies,
        'coverage_position': [] if config is None else coverage_position
    }


def main(raw_payload, context: dict) -> None:
    transform(raw_payload=raw_payload, config=context)
    return None
