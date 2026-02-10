from celery import shared_task
from .services.services import main
from celery.utils.log import get_task_logger
from django.db import transaction
from django.db.models import F, Window
from django.db.models.functions import DenseRank
from .models import (
    Team, TeamRankSnapshot, 
    TeamOffensePassingStats, TeamOffenseRushingStats, TeamOffenseReceivingStats,
    TeamDefensePassingStats, TeamDefenseRushingStats, TeamDefenseReceivingStats,
    TeamAdvanceOffenseStats, TeamAdvanceDefenseStats, TeamCoverageSchemeStats,
    TeamOffensePlayCallingStats, TeamCoverageStatsByPosition
)

logger = get_task_logger(__name__)

@shared_task
def weekly_nfl_sync():
    logger.info("Celery task started")
    logger.info("Starting weekly scheduled ingestion")
    try:
        with transaction.atomic():
            main()
            logger.info("Main pipeline finished successfully")
        
        update_team_rank_snapshots.delay()
        logger.info("Triggered follow-up rank update task")

    except Exception as e:
        logger.error(f"Scheduled task failed: {e}")

@shared_task
def update_team_rank_snapshots():
    """
    Calculates ranks and updates TeamRankSnapshot. 
    Annotation keys MUST match the TeamRankSnapshot field names exactly.
    """
    
    # Helpers for clean ranking
    def rank_desc(field): 
        return Window(expression=DenseRank(), order_by=F(field).desc())
    
    def rank_asc(field): 
        return Window(expression=DenseRank(), order_by=F(field).asc())

    # --- 1. Calculate Ranks for Each Category ---
    
    # Offense Passing
    off_pass = TeamOffensePassingStats.objects.annotate(
        off_pass_yards_rank=rank_desc('pass_yards'),
        off_pass_tds_rank=rank_desc('pass_touchdowns'),
        off_pass_rating_rank=rank_desc('pass_rating')
    ).values('team_id', 'off_pass_yards_rank', 'off_pass_tds_rank', 'off_pass_rating_rank')

    # Offense Rushing
    off_rush = TeamOffenseRushingStats.objects.annotate(
        off_rush_yards_rank=rank_desc('rush_yards'),
        off_rush_tds_rank=rank_desc('rush_touchdowns'),
        off_rush_attempts_rank=rank_desc('rush_attempts')
    ).values('team_id', 'off_rush_yards_rank', 'off_rush_tds_rank', 'off_rush_attempts_rank')

    # Offense Receiving
    off_rec = TeamOffenseReceivingStats.objects.annotate(
        off_receptions_rank=rank_desc('receptions'),
        off_rec_yards_rank=rank_desc('rec_yards'),
        off_rec_tds_rank=rank_desc('rec_touchdowns')
    ).values('team_id', 'off_receptions_rank', 'off_rec_yards_rank', 'off_rec_tds_rank')

    # Defense Passing
    def_pass = TeamDefensePassingStats.objects.annotate(
        def_pass_yards_rank=rank_asc('pass_yards'),
        def_pass_tds_rank=rank_asc('pass_touchdowns'),
        def_pass_rating_rank=rank_asc('pass_rating')
    ).values('team_id', 'def_pass_yards_rank', 'def_pass_tds_rank', 'def_pass_rating_rank')

    # Defense Rushing
    def_rush = TeamDefenseRushingStats.objects.annotate(
        def_rush_yards_rank=rank_asc('rush_yards'),
        def_rush_tds_rank=rank_asc('rush_touchdowns'),
        def_rush_attempts_rank=rank_asc('rush_attempts')
    ).values('team_id', 'def_rush_yards_rank', 'def_rush_tds_rank', 'def_rush_attempts_rank')

    # Defense Receiving
    def_rec = TeamDefenseReceivingStats.objects.annotate(
        def_receptions_rank=rank_asc('receptions'),
        def_rec_yards_rank=rank_asc('rec_yards'),
        def_rec_tds_rank=rank_asc('rec_touchdowns'),
        def_pass_defended_rank=rank_asc('pass_defended')
    ).values('team_id', 'def_receptions_rank', 'def_rec_yards_rank', 'def_rec_tds_rank', 'def_pass_defended_rank')

    # Advanced Offense
    adv_off = TeamAdvanceOffenseStats.objects.annotate(
        off_expected_points_added_per_play_rank=rank_desc('expected_points_added_per_play'),
        off_expected_points_added_per_pass_rank=rank_desc('expected_points_added_per_pass'),
        off_expected_points_added_per_rush_rank=rank_desc('expected_points_added_per_rush')
    ).values('team_id', 'off_expected_points_added_per_play_rank', 
             'off_expected_points_added_per_pass_rank', 'off_expected_points_added_per_rush_rank')

    # Advanced Defense
    adv_def = TeamAdvanceDefenseStats.objects.annotate(
        def_expected_points_added_per_play_rank=rank_asc('expected_points_added_per_play'),
        def_expected_points_added_allowed_per_pass_rank=rank_asc('expected_points_added_allowed_per_pass'),
        def_expected_points_added_allowed_per_rush_rank=rank_asc('expected_points_added_allowed_per_rush')
    ).values('team_id', 'def_expected_points_added_per_play_rank', 
             'def_expected_points_added_allowed_per_pass_rank', 'def_expected_points_added_allowed_per_rush_rank')

    # Coverage Scheme
    cov_scheme = TeamCoverageSchemeStats.objects.annotate(
        man_rate_rank=rank_desc('man_rate'),
        zone_rate_rank=rank_desc('zone_rate'),
        middle_closed_rate_rank=rank_desc('middle_closed_rate'),
        middle_open_rate_rank=rank_desc('middle_open_rate')
    ).values('team_id', 'man_rate_rank', 'zone_rate_rank', 'middle_closed_rate_rank', 'middle_open_rate_rank')

    # Play Calling
    play_call = TeamOffensePlayCallingStats.objects.annotate(
        motion_rate_rank=rank_desc('motion_rate'),
        play_action_rate_rank=rank_desc('play_action_rate'),
        shotgun_rate_rank=rank_desc('shotgun_rate'),
        nohuddle_rate_rank=rank_desc('nohuddle_rate')
    ).values('team_id', 'motion_rate_rank', 'play_action_rate_rank', 'shotgun_rate_rank', 'nohuddle_rate_rank')

    # Coverage by Position
    pos_cov = TeamCoverageStatsByPosition.objects.annotate(
        yards_allowed_wr_rank=rank_asc('yards_allowed_wr'),
        yards_allowed_te_rank=rank_asc('yards_allowed_te'),
        yards_allowed_rb_rank=rank_asc('yards_allowed_rb'),
        yards_allowed_outside_rank=rank_asc('yards_allowed_outside'),
        yards_allowed_slot_rank=rank_asc('yards_allowed_slot')
    ).values('team_id', 'yards_allowed_wr_rank', 'yards_allowed_te_rank', 'yards_allowed_rb_rank', 
             'yards_allowed_outside_rank', 'yards_allowed_slot_rank')

    master_data = {}

    def merge_results(queryset):
        for item in queryset:
            tid = item['team_id']
            if tid not in master_data:
                master_data[tid] = {}
            stats_only = {k: v for k, v in item.items() if k != 'team_id'}
            master_data[tid].update(stats_only)

    # Execute merges
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
            count = 0
            for tid, stats in master_data.items():
                TeamRankSnapshot.objects.update_or_create(
                    team_id=tid,
                    defaults=stats
                )
                count += 1
            logger.info("Updated TeamRankSnapshot Model")
    except Exception as e:
        logger.error(f"Scheduled task failed for TeamRankSnapshot Model: {e}")