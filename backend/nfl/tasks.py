from datetime import datetime, timezone, timedelta
from asyncio import run
from celery import shared_task, Task
from .services.pipeline import main, run_extraction_pipeline
from .services.nfl_service import fetch_weekly_schedule_async
from celery.utils.log import get_task_logger
from django.db import transaction
from django.db.models import F, Window, Sum, Max, Count, OuterRef, Subquery
from django.db.models.functions import DenseRank
from django.core.cache import cache
from nfl.utils import refresh_application_cache
from .models import (
    TeamRankSnapshot,
    TeamOffensePassingStats, TeamOffenseRushingStats, TeamOffenseReceivingStats,
    TeamDefensePassingStats, TeamDefenseRushingStats, TeamDefenseReceivingStats,
    TeamAdvanceOffenseStats, TeamAdvanceDefenseStats, TeamCoverageSchemeStats,
    TeamOffensePlayCallingStats, TeamCoverageStatsByPosition,
    PlayerGameStats, PlayerSeasonStats
)
from nfl.services.utils import PIPELINE_CONFIG, get_pipeline_context, parse_event

logger = get_task_logger(__name__)


@shared_task
def weekly_nfl_sync():
    context = get_pipeline_context(manual_config=PIPELINE_CONFIG)

    logger.info("Celery task started")
    raw_payload = run(run_extraction_pipeline(config=context))

    logger.info("Starting weekly scheduled ingestion")
    try:
        with transaction.atomic():
            main(raw_payload, context=context)
            logger.info("Main pipeline finished successfully")

            if context is not None:
                season_year = context['dates']
                season_type = context['seasontype']

                logger.info("Triggered follow-up rank update task")
                transaction.on_commit(lambda: update_team_rank_snapshots.delay(
                    season_year=season_year
                ))

                transaction.on_commit(lambda: update_player_season_stats_and_ranks.delay(
                    season_year=season_year,
                    season_type=season_type
                ))
            else:
                transaction.on_commit(cache_invalidated_global_version_bumped)
    except Exception as e:
        logger.exception(f"Scheduled task failed: {e}")


@shared_task
def update_team_rank_snapshots(season_year: int):
    """
    Calculates ranks and updates TeamRankSnapshot.
    Annotation keys MUST match the TeamRankSnapshot field names exactly.
    """

    def rank_desc(field):
        return Window(expression=DenseRank(), order_by=F(field).desc())

    def rank_asc(field):
        return Window(expression=DenseRank(), order_by=F(field).asc())

    # Offense Passing
    off_pass = TeamOffensePassingStats.objects.filter(season_year=season_year).annotate(
        off_pass_yards_rank=rank_desc('pass_yards'),
        off_pass_tds_rank=rank_desc('pass_touchdowns'),
        off_pass_rating_rank=rank_desc('pass_rating')
    ).values('team_id', 'off_pass_yards_rank', 'off_pass_tds_rank', 'off_pass_rating_rank')

    # Offense Rushing
    off_rush = TeamOffenseRushingStats.objects.filter(season_year=season_year).annotate(
        off_rush_yards_rank=rank_desc('rush_yards'),
        off_rush_tds_rank=rank_desc('rush_touchdowns'),
        off_rush_attempts_rank=rank_desc('rush_attempts')
    ).values('team_id', 'off_rush_yards_rank', 'off_rush_tds_rank', 'off_rush_attempts_rank')

    # Offense Receiving
    off_rec = TeamOffenseReceivingStats.objects.filter(season_year=season_year).annotate(
        off_receptions_rank=rank_desc('receptions'),
        off_rec_yards_rank=rank_desc('rec_yards'),
        off_rec_tds_rank=rank_desc('rec_touchdowns')
    ).values('team_id', 'off_receptions_rank', 'off_rec_yards_rank', 'off_rec_tds_rank')

    # Defense Passing
    def_pass = TeamDefensePassingStats.objects.filter(season_year=season_year).annotate(
        def_pass_yards_rank=rank_asc('pass_yards'),
        def_pass_tds_rank=rank_asc('pass_touchdowns'),
        def_pass_rating_rank=rank_asc('pass_rating')
    ).values('team_id', 'def_pass_yards_rank', 'def_pass_tds_rank', 'def_pass_rating_rank')

    # Defense Rushing
    def_rush = TeamDefenseRushingStats.objects.filter(season_year=season_year).annotate(
        def_rush_yards_rank=rank_asc('rush_yards'),
        def_rush_tds_rank=rank_asc('rush_touchdowns'),
        def_rush_attempts_rank=rank_asc('rush_attempts')
    ).values('team_id', 'def_rush_yards_rank', 'def_rush_tds_rank', 'def_rush_attempts_rank')

    # Defense Receiving
    def_rec = TeamDefenseReceivingStats.objects.filter(season_year=season_year).annotate(
        def_receptions_rank=rank_asc('receptions'),
        def_rec_yards_rank=rank_asc('rec_yards'),
        def_rec_tds_rank=rank_asc('rec_touchdowns'),
        def_pass_defended_rank=rank_asc('pass_defended')
    ).values('team_id', 'def_receptions_rank', 'def_rec_yards_rank', 'def_rec_tds_rank', 'def_pass_defended_rank')

    # Advanced Offense
    adv_off = TeamAdvanceOffenseStats.objects.filter(season_year=season_year).annotate(
        off_expected_points_added_per_play_rank=rank_desc('expected_points_added_per_play'),
        off_expected_points_added_per_pass_rank=rank_desc('expected_points_added_per_pass'),
        off_expected_points_added_per_rush_rank=rank_desc('expected_points_added_per_rush')
    ).values(
        'team_id', 'off_expected_points_added_per_play_rank',
        'off_expected_points_added_per_pass_rank', 'off_expected_points_added_per_rush_rank'
    )

    # Advanced Defense
    adv_def = TeamAdvanceDefenseStats.objects.filter(season_year=season_year).annotate(
        def_expected_points_added_per_play_rank=rank_asc('expected_points_added_per_play'),
        def_expected_points_added_allowed_per_pass_rank=rank_asc('expected_points_added_allowed_per_pass'),
        def_expected_points_added_allowed_per_rush_rank=rank_asc('expected_points_added_allowed_per_rush')
    ).values(
        'team_id', 'def_expected_points_added_per_play_rank',
        'def_expected_points_added_allowed_per_pass_rank', 'def_expected_points_added_allowed_per_rush_rank'
    )

    # Coverage Scheme
    cov_scheme = TeamCoverageSchemeStats.objects.filter(season_year=season_year).annotate(
        man_rate_rank=rank_desc('man_rate'),
        zone_rate_rank=rank_desc('zone_rate'),
        middle_closed_rate_rank=rank_desc('middle_closed_rate'),
        middle_open_rate_rank=rank_desc('middle_open_rate')
    ).values('team_id', 'man_rate_rank', 'zone_rate_rank', 'middle_closed_rate_rank', 'middle_open_rate_rank')

    # Play Calling
    play_call = TeamOffensePlayCallingStats.objects.filter(season_year=season_year).annotate(
        motion_rate_rank=rank_desc('motion_rate'),
        play_action_rate_rank=rank_desc('play_action_rate'),
        shotgun_rate_rank=rank_desc('shotgun_rate'),
        nohuddle_rate_rank=rank_desc('nohuddle_rate')
    ).values('team_id', 'motion_rate_rank', 'play_action_rate_rank', 'shotgun_rate_rank', 'nohuddle_rate_rank')

    # Coverage by Position
    pos_cov = TeamCoverageStatsByPosition.objects.filter(season_year=season_year).annotate(
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
                    season_year=season_year,
                    defaults=stats
                )

            logger.info("Updated TeamRankSnapshot Model")
            transaction.on_commit(cache_invalidated_global_version_bumped)
    except Exception as e:
        logger.exception(f"Scheduled task failed for TeamRankSnapshot Model: {e}")


@shared_task
def update_player_season_stats_and_ranks(season_year: int, season_type: int):
    """
    Aggregates game stats into season totals and computes league-wide
    and positional ranks isolated by season_year and season_type (2=Reg, 3=Post).
    """
    def rank_desc(field):
        return Window(expression=DenseRank(), order_by=F(field).desc())

    # Partitions rank logic strictly within the player's position group
    def rank_pos_desc(field):
        return Window(
            expression=DenseRank(),
            partition_by=[F('player__position')],
            order_by=F(field).desc()
        )

    latest_team_sq = PlayerGameStats.objects.filter(
        player_id=OuterRef('player_id'),
        game__season_year=season_year,
        game__season_type=season_type
    ).order_by('-game__date').values('team_id')[:1]

    # Filter by BOTH season parameters before grouping
    season_aggregates = PlayerGameStats.objects.filter(
        game__season_year=season_year,
        game__season_type=season_type  # Ensure Game model maps to your integer types (2 or 3)
    ).values(
        'player_id',
        'player__position'
    ).annotate(
        historic_team_id=Subquery(latest_team_sq),
        total_games=Count('game_id', distinct=True),

        # Volume Sums
        sum_pass_att=Sum('pass_attempts'),
        sum_comp=Sum('completions'),
        sum_pass_yds=Sum('pass_yards'),
        sum_pass_tds=Sum('pass_touchdowns'),
        sum_ints=Sum('interceptions'),
        sum_sacks=Sum('sacks'),
        max_long_pass=Max('long_passing'),

        sum_rush_att=Sum('rush_attempts'),
        sum_rush_yds=Sum('rush_yards'),
        sum_rush_tds=Sum('rush_touchdowns'),
        max_long_rush=Max('long_rushing'),

        sum_rec=Sum('receptions'),
        sum_targets=Sum('rec_targets'),
        sum_rec_yds=Sum('rec_yards'),
        sum_rec_tds=Sum('rec_touchdowns'),
        max_long_rec=Max('long_reception'),

        sum_fumb=Sum('fumbles'),
        sum_fumb_lost=Sum('fumbles_lost'),
        sum_two_pt=Sum('two_pt_conversions'),
        sum_off_fum_td=Sum('off_fum_rec_tds'),
        sum_kick_td=Sum('kick_return_tds'),
        sum_punt_td=Sum('punt_return_tds'),

        sum_ppr=Sum('ppr_points'),
        sum_half_ppr=Sum('half_ppr_points'),
        sum_non_ppr=Sum('non_ppr_points'),
        sum_yahoo=Sum('yahoo_points'),
        sum_dk=Sum('draftkings_points'),
        sum_fd=Sum('fanduel_points')
    ).annotate(
        # Ranks (Automatically scoped since the queryset is pre-filtered by season_type)
        r_p_yds=rank_desc('sum_pass_yds'),
        r_p_tds=rank_desc('sum_pass_tds'),
        r_r_yds=rank_desc('sum_rush_yds'),
        r_r_tds=rank_desc('sum_rush_tds'),
        r_rc_yds=rank_desc('sum_rec_yds'),
        r_rc_tds=rank_desc('sum_rec_tds'),
        r_f_ppr=rank_desc('sum_ppr'),
        r_f_half=rank_desc('sum_half_ppr'),
        r_f_dk=rank_desc('sum_dk'),
        r_f_fd=rank_desc('sum_fd'),
        r_f_non_ppr=rank_desc('sum_non_ppr'),
        r_f_yahoo=rank_desc('sum_yahoo'),

        # Positional Base Ranks
        pr_p_yds=rank_pos_desc('sum_pass_yds'),
        pr_p_tds=rank_pos_desc('sum_pass_tds'),
        pr_r_yds=rank_pos_desc('sum_rush_yds'),
        pr_r_tds=rank_pos_desc('sum_rush_tds'),
        pr_rc_yds=rank_pos_desc('sum_rec_yds'),
        pr_rc_tds=rank_pos_desc('sum_rec_tds'),
        pr_f_ppr=rank_pos_desc('sum_ppr'),
        pr_f_half=rank_pos_desc('sum_half_ppr'),
        pr_f_dk=rank_pos_desc('sum_dk'),
        pr_f_fd=rank_pos_desc('sum_fd'),
        pr_f_non_ppr=rank_pos_desc('sum_non_ppr'),
        pr_f_yahoo=rank_pos_desc('sum_yahoo'),
    )

    # Write atomic updates using the updated composite unique key
    with transaction.atomic():
        for row in season_aggregates:
            PlayerSeasonStats.objects.update_or_create(
                player_id=row['player_id'],
                season_year=season_year,
                season_type=season_type,
                defaults={
                    'historic_team_id': row['historic_team_id'],
                    'games_played': row['total_games'],
                    'pass_attempts': row['sum_pass_att'],
                    'completions': row['sum_comp'],
                    'pass_yards': row['sum_pass_yds'],
                    'pass_touchdowns': row['sum_pass_tds'],
                    'interceptions': row['sum_ints'],
                    'sacks': row['sum_sacks'],
                    'long_passing': row['max_long_pass'],
                    'rush_attempts': row['sum_rush_att'],
                    'rush_yards': row['sum_rush_yds'],
                    'rush_touchdowns': row['sum_rush_tds'],
                    'long_rushing': row['max_long_rush'],
                    'receptions': row['sum_rec'],
                    'rec_targets': row['sum_targets'],
                    'rec_yards': row['sum_rec_yds'],
                    'rec_touchdowns': row['sum_rec_tds'],
                    'long_reception': row['max_long_rec'],
                    'fumbles': row['sum_fumb'],
                    'fumbles_lost': row['sum_fumb_lost'],
                    'two_pt_conversions': row['sum_two_pt'],
                    'off_fum_rec_tds': row['sum_off_fum_td'],
                    'kick_return_tds': row['sum_kick_td'],
                    'punt_return_tds': row['sum_punt_td'],
                    'ppr_points': row['sum_ppr'],
                    'half_ppr_points': row['sum_half_ppr'],
                    'non_ppr_points': row['sum_non_ppr'],
                    'yahoo_points': row['sum_yahoo'],
                    'draftkings_points': row['sum_dk'],
                    'fanduel_points': row['sum_fd'],

                    # Overall Rank Mappings
                    'rank_pass_yards': row['r_p_yds'],
                    'rank_pass_tds': row['r_p_tds'],
                    'rank_rush_yards': row['r_r_yds'],
                    'rank_rush_tds': row['r_r_tds'],
                    'rank_rec_yards': row['r_rc_yds'],
                    'rank_rec_tds': row['r_rc_tds'],
                    'rank_ppr': row['r_f_ppr'],
                    'rank_half_ppr': row['r_f_half'],
                    'rank_draftkings': row['r_f_dk'],
                    'rank_fanduel': row['r_f_fd'],
                    'rank_non_ppr': row['r_f_non_ppr'],
                    'rank_yahoo': row['r_f_yahoo'],

                    # Positional Rank Mappings
                    'pos_rank_pass_yards': row['pr_p_yds'],
                    'pos_rank_pass_tds': row['pr_p_tds'],
                    'pos_rank_rush_yards': row['pr_r_yds'],
                    'pos_rank_rush_tds': row['pr_r_tds'],
                    'pos_rank_rec_yards': row['pr_rc_yds'],
                    'pos_rank_rec_tds': row['pr_rc_tds'],
                    'pos_rank_ppr': row['pr_f_ppr'],
                    'pos_rank_half_ppr': row['pr_f_half'],
                    'pos_rank_draftkings': row['pr_f_dk'],
                    'pos_rank_fanduel': row['pr_f_fd'],
                    'pos_rank_non_ppr': row['pr_f_non_ppr'],
                    'pos_rank_yahoo': row['pr_f_yahoo'],
                }
            )


def cache_invalidated_global_version_bumped():
    """
    Runs only after the ranks are safely committed to the database.
    """
    refresh_application_cache()
    logger.info("Team caches invalidated and Global Version bumped.")


@shared_task(
    name="nfl.tasks.update_nfl_cache_task",
    bind=True,
    autoretry_for=(Exception,),
    retry_kwargs={'max_retries': 3},
    retry_backoff=True
)
def update_nfl_cache_task(self: Task) -> bool:
    cache_key = "weekly_schedule"
    cached_payload = cache.get(cache_key)

    now = datetime.now(timezone.utc)
    attempt_num: int = self.request.retries + 1

    logger.info(f"Starting schedule sync (Attempt {attempt_num})")

    if cached_payload and "next_update_at" in cached_payload:
        next_update_at = datetime.fromisoformat(cached_payload["next_update_at"])
        if now < next_update_at:
            logger.info(f"Cache [HIT]. Next update at {next_update_at}")
            return True

    logger.info("Cache [MISS]. Fetching fresh schedule from NFL API...")

    try:
        raw_data = run(fetch_weekly_schedule_async())
    except Exception as e:
        logger.error(f"API Fetch failed on attempt {attempt_num}: {e}")
        raise

    if not raw_data:
        logger.warning("API returned an empty payload. Skipping cache write.")
        return False

    events = raw_data.get("events", [])
    is_live: bool = any(e.get("status", {}).get("type", {}).get("state") == "in" for e in events)

    is_warmup = False
    upcoming_times = []

    if not is_live:
        for e in events:
            state = e.get("status", {}).get("type", {}).get("state")
            date_str = e.get("date")

            if state == "pre" and date_str:
                try:
                    start_time = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                    seconds_until = (start_time - now).total_seconds()

                    if -900 < seconds_until <= 900:
                        is_warmup = True
                        break
                    elif seconds_until > 900:
                        upcoming_times.append(seconds_until)
                except ValueError:
                    continue

    if is_live or is_warmup:
        delay_seconds = 60
        logger.info("Game is live or starting soon. Setting TTL to 60s.")
    else:
        if upcoming_times:
            next_game_in_seconds = min(upcoming_times)
            delay_seconds = next_game_in_seconds - 900
        else:
            delay_seconds = 43200

        delay_seconds = max(300, min(delay_seconds, 43200))
        logger.info(f"Next action in {delay_seconds} seconds. Sleeping...")

    target_update_time = now + timedelta(seconds=delay_seconds)
    transformed_payload = {
        "season": raw_data.get("season"),
        "week": raw_data.get("week"),
        "events": [parse_event(e) for e in events],
        "next_update_at": target_update_time.isoformat()
    }

    cache_backend_ttl: int = delay_seconds + 300
    cache.set(key=cache_key, value=transformed_payload, timeout=cache_backend_ttl)
    logger.info(f"Cache updated successfully. Next fetch scheduled for {target_update_time}")
    return True
