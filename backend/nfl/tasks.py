from asyncio import run
from aiohttp import ClientError
from celery import shared_task
from .services.pipeline import main
from .services.nfl_service import get_and_cache_weekly_schedule_async
from celery.utils.log import get_task_logger
from django.db import transaction
from django.db.models import F, Window
from django.db.models.functions import DenseRank
from nfl.utils import refresh_application_cache
from .models import (
    TeamRankSnapshot,
    TeamOffensePassingStats, TeamOffenseRushingStats, TeamOffenseReceivingStats,
    TeamDefensePassingStats, TeamDefenseRushingStats, TeamDefenseReceivingStats,
    TeamAdvanceOffenseStats, TeamAdvanceDefenseStats, TeamCoverageSchemeStats,
    TeamOffensePlayCallingStats, TeamCoverageStatsByPosition
)
from nfl.services.utils import PIPELINE_CONFIG, get_pipeline_context

logger = get_task_logger(__name__)


@shared_task
def weekly_nfl_sync():
    context = get_pipeline_context(manual_config=PIPELINE_CONFIG)

    if not context:
        logger.info("NFL is out of season. Exiting.")
        return

    logger.info("Celery task started")
    logger.info("Starting weekly scheduled ingestion")
    try:
        with transaction.atomic():
            main(context=context)
            logger.info("Main pipeline finished successfully")

            logger.info("Triggered follow-up rank update task")
            transaction.on_commit(lambda: update_team_rank_snapshots.delay())
    except Exception as e:
        logger.exception(f"Scheduled task failed: {e}")


@shared_task
def update_team_rank_snapshots():
    """
    Calculates ranks and updates TeamRankSnapshot.
    Annotation keys MUST match the TeamRankSnapshot field names exactly.
    """

    def rank_desc(field):
        return Window(expression=DenseRank(), order_by=F(field).desc())

    def rank_asc(field):
        return Window(expression=DenseRank(), order_by=F(field).asc())

    # Offense Passing
    off_pass = TeamOffensePassingStats.objects.filter(season_year=PIPELINE_CONFIG['dates']).annotate(
        off_pass_yards_rank=rank_desc('pass_yards'),
        off_pass_tds_rank=rank_desc('pass_touchdowns'),
        off_pass_rating_rank=rank_desc('pass_rating')
    ).values('team_id', 'off_pass_yards_rank', 'off_pass_tds_rank', 'off_pass_rating_rank')

    # Offense Rushing
    off_rush = TeamOffenseRushingStats.objects.filter(season_year=PIPELINE_CONFIG['dates']).annotate(
        off_rush_yards_rank=rank_desc('rush_yards'),
        off_rush_tds_rank=rank_desc('rush_touchdowns'),
        off_rush_attempts_rank=rank_desc('rush_attempts')
    ).values('team_id', 'off_rush_yards_rank', 'off_rush_tds_rank', 'off_rush_attempts_rank')

    # Offense Receiving
    off_rec = TeamOffenseReceivingStats.objects.filter(season_year=PIPELINE_CONFIG['dates']).annotate(
        off_receptions_rank=rank_desc('receptions'),
        off_rec_yards_rank=rank_desc('rec_yards'),
        off_rec_tds_rank=rank_desc('rec_touchdowns')
    ).values('team_id', 'off_receptions_rank', 'off_rec_yards_rank', 'off_rec_tds_rank')

    # Defense Passing
    def_pass = TeamDefensePassingStats.objects.filter(season_year=PIPELINE_CONFIG['dates']).annotate(
        def_pass_yards_rank=rank_asc('pass_yards'),
        def_pass_tds_rank=rank_asc('pass_touchdowns'),
        def_pass_rating_rank=rank_asc('pass_rating')
    ).values('team_id', 'def_pass_yards_rank', 'def_pass_tds_rank', 'def_pass_rating_rank')

    # Defense Rushing
    def_rush = TeamDefenseRushingStats.objects.filter(season_year=PIPELINE_CONFIG['dates']).annotate(
        def_rush_yards_rank=rank_asc('rush_yards'),
        def_rush_tds_rank=rank_asc('rush_touchdowns'),
        def_rush_attempts_rank=rank_asc('rush_attempts')
    ).values('team_id', 'def_rush_yards_rank', 'def_rush_tds_rank', 'def_rush_attempts_rank')

    # Defense Receiving
    def_rec = TeamDefenseReceivingStats.objects.filter(season_year=PIPELINE_CONFIG['dates']).annotate(
        def_receptions_rank=rank_asc('receptions'),
        def_rec_yards_rank=rank_asc('rec_yards'),
        def_rec_tds_rank=rank_asc('rec_touchdowns'),
        def_pass_defended_rank=rank_asc('pass_defended')
    ).values('team_id', 'def_receptions_rank', 'def_rec_yards_rank', 'def_rec_tds_rank', 'def_pass_defended_rank')

    # Advanced Offense
    adv_off = TeamAdvanceOffenseStats.objects.filter(season_year=PIPELINE_CONFIG['dates']).annotate(
        off_expected_points_added_per_play_rank=rank_desc('expected_points_added_per_play'),
        off_expected_points_added_per_pass_rank=rank_desc('expected_points_added_per_pass'),
        off_expected_points_added_per_rush_rank=rank_desc('expected_points_added_per_rush')
    ).values(
        'team_id', 'off_expected_points_added_per_play_rank',
        'off_expected_points_added_per_pass_rank', 'off_expected_points_added_per_rush_rank'
    )

    # Advanced Defense
    adv_def = TeamAdvanceDefenseStats.objects.filter(season_year=PIPELINE_CONFIG['dates']).annotate(
        def_expected_points_added_per_play_rank=rank_asc('expected_points_added_per_play'),
        def_expected_points_added_allowed_per_pass_rank=rank_asc('expected_points_added_allowed_per_pass'),
        def_expected_points_added_allowed_per_rush_rank=rank_asc('expected_points_added_allowed_per_rush')
    ).values(
        'team_id', 'def_expected_points_added_per_play_rank',
        'def_expected_points_added_allowed_per_pass_rank', 'def_expected_points_added_allowed_per_rush_rank'
    )

    # Coverage Scheme
    cov_scheme = TeamCoverageSchemeStats.objects.filter(season_year=PIPELINE_CONFIG['dates']).annotate(
        man_rate_rank=rank_desc('man_rate'),
        zone_rate_rank=rank_desc('zone_rate'),
        middle_closed_rate_rank=rank_desc('middle_closed_rate'),
        middle_open_rate_rank=rank_desc('middle_open_rate')
    ).values('team_id', 'man_rate_rank', 'zone_rate_rank', 'middle_closed_rate_rank', 'middle_open_rate_rank')

    # Play Calling
    play_call = TeamOffensePlayCallingStats.objects.filter(season_year=PIPELINE_CONFIG['dates']).annotate(
        motion_rate_rank=rank_desc('motion_rate'),
        play_action_rate_rank=rank_desc('play_action_rate'),
        shotgun_rate_rank=rank_desc('shotgun_rate'),
        nohuddle_rate_rank=rank_desc('nohuddle_rate')
    ).values('team_id', 'motion_rate_rank', 'play_action_rate_rank', 'shotgun_rate_rank', 'nohuddle_rate_rank')

    # Coverage by Position
    pos_cov = TeamCoverageStatsByPosition.objects.filter(season_year=PIPELINE_CONFIG['dates']).annotate(
        yards_allowed_wr_rank=rank_asc('yards_allowed_wr'),
        yards_allowed_te_rank=rank_asc('yards_allowed_te'),
        yards_allowed_rb_rank=rank_asc('yards_allowed_rb'),
        yards_allowed_outside_rank=rank_asc('yards_allowed_outside'),
        yards_allowed_slot_rank=rank_asc('yards_allowed_slot')
    ).values(
        'team_id', 'yards_allowed_wr_rank', 'yards_allowed_te_rank', 'yards_allowed_rb_rank',
        'yards_allowed_outside_rank', 'yards_allowed_slot_rank'
    )

    master_data = {}

    def merge_results(queryset):
        for item in queryset:
            tid = item['team_id']
            if tid not in master_data:
                master_data[tid] = {}
            stats_only = {k: v for k, v in item.items() if k not in ['team_id', 'season_year']}
            master_data[tid].update(stats_only)

    merge_results(off_pass)
    merge_results(off_rush)
    merge_results(off_rec)
    merge_results(def_pass)
    merge_results(def_rush)
    merge_results(def_rec)
    merge_results(adv_off)
    merge_results(adv_def)
    merge_results(cov_scheme)
    merge_results(play_call)
    merge_results(pos_cov)

    try:
        with transaction.atomic():
            for tid, stats in master_data.items():
                TeamRankSnapshot.objects.update_or_create(
                    team_id=tid,
                    season_year=PIPELINE_CONFIG['dates'],
                    defaults=stats
                )

            logger.info("Updated TeamRankSnapshot Model")
            transaction.on_commit(finalize_rank_updates)
    except Exception as e:
        logger.exception(f"Scheduled task failed for TeamRankSnapshot Model: {e}")


def finalize_rank_updates():
    """
    Runs only after the ranks are safely committed to the database.
    """
    refresh_application_cache()
    logger.info("Team caches invalidated and Global Version bumped.")


@shared_task(
    name="nfl.tasks.update_nfl_cache_task",
    autoretry_for=(ClientError, ValueError),
    retry_kwargs={'max_retries': 3},
    retry_backoff=True,
    retry_backoff_max=30
)
def update_nfl_cache_task():
    try:
        data = run(get_and_cache_weekly_schedule_async(force_refresh=True))
        if not data or not data.get("events"):
            raise ValueError("Empty events list from NFL API")

        logger.info("NFL background refresh successful.")
        return True
    except Exception as e:
        logger.error(f"Schedule refresh failed: {str(e)}")
        raise
