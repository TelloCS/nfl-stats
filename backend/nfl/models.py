from django.db import models
from django.contrib.postgres.indexes import GinIndex


class GlobalMetadata(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.CharField(max_length=255)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Global Metadata"

    def __str__(self):
        return f"{self.key}: {self.value}"


class Team(models.Model):
    slug = models.SlugField(max_length=255, unique=True, help_text="URL-friendly identifier")

    full_name = models.CharField(max_length=50, blank=True, default="")
    nickname = models.CharField(max_length=50, blank=True, default="")
    abbreviation = models.CharField(
        max_length=5,
        unique=True,
        blank=True,
        null=True,
        help_text="e.g., KC, SF",
    )

    conference = models.CharField(max_length=3, blank=True, default="")
    division = models.CharField(max_length=5, blank=True, default="")

    def __str__(self):
        return f"{self.full_name}"

    class Meta:
        ordering = ['abbreviation']


class Player(models.Model):
    slug = models.SlugField(max_length=255, help_text="URL-friendly identifier")
    espn_id = models.CharField(max_length=255, unique=True, help_text="Unique ID from ESPN API")

    first_name = models.CharField(max_length=50, blank=True, default="")
    last_name = models.CharField(max_length=50, blank=True, default="")
    full_name = models.CharField(max_length=100, blank=True, default="")
    position = models.CharField(max_length=50, blank=True, default="", db_index=True)

    jersey = models.CharField(max_length=3, blank=True, default="")
    experience = models.IntegerField(default=0)

    team = models.ForeignKey(Team, on_delete=models.SET_NULL, related_name='team', null=True, blank=True)

    def __str__(self):
        return f"{self.full_name} ({self.position})"

    class Meta:
        indexes = [
            GinIndex(
                fields=['full_name'],
                name='idx_player_name_gin',
                opclasses=['gin_trgm_ops']
            )
        ]


class Game(models.Model):
    date = models.DateTimeField()
    name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=64)
    season_year = models.IntegerField()
    season_type = models.IntegerField()
    week = models.IntegerField()

    homeTeam = models.ForeignKey(
        Team,
        on_delete=models.PROTECT,
        related_name='home_team',
        help_text='The team playing at home.',
        null=False
    )

    awayTeam = models.ForeignKey(
        Team,
        on_delete=models.PROTECT,
        related_name='away_team',
        help_text='The visiting team.',
        null=False
    )

    home_score = models.IntegerField(default=0)
    away_score = models.IntegerField(default=0)
    status = models.CharField(max_length=30, default="")

    event = models.CharField(max_length=20, unique=True, blank=True, default="")

    def __str__(self):
        return f"{self.awayTeam.abbreviation} @ {self.homeTeam.abbreviation} - Week {self.week} ({self.date})"

    class Meta:
        unique_together = ('homeTeam', 'awayTeam', 'date')
        indexes = [
            models.Index(fields=['season_year', 'season_type'], name='idx_game_season'),
            models.Index(fields=['date'], name='idx_game_date_asc'),
        ]
        ordering = ['date']


class PlayerGameStats(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='stats', null=False)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='game', null=False)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='players', null=False)

    is_starter = models.BooleanField(default=False)

    pass_attempts = models.IntegerField(default=0)
    completions = models.IntegerField(default=0)
    pass_yards = models.IntegerField(default=0)
    pass_touchdowns = models.IntegerField(default=0)
    interceptions = models.IntegerField(default=0)

    completion_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    yards_per_pass_attempt = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    long_passing = models.IntegerField(default=0)
    sacks = models.IntegerField(default=0)
    pass_rating = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    adjusted_qbr = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)

    rush_attempts = models.IntegerField(default=0)
    rush_yards = models.IntegerField(default=0)
    rush_touchdowns = models.IntegerField(default=0)

    yards_per_rush_attempt = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    long_rushing = models.IntegerField(default=0)

    receptions = models.IntegerField(default=0)
    rec_targets = models.IntegerField(default=0)
    rec_yards = models.IntegerField(default=0)
    rec_touchdowns = models.IntegerField(default=0)

    yards_per_reception = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    long_reception = models.IntegerField(default=0)

    fumbles = models.IntegerField(default=0)
    fumbles_lost = models.IntegerField(default=0)

    two_pt_conversions = models.IntegerField(default=0)
    off_fum_rec_tds = models.IntegerField(default=0)
    kick_return_tds = models.IntegerField(default=0)
    punt_return_tds = models.IntegerField(default=0)

    ppr_points = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    half_ppr_points = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    non_ppr_points = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    yahoo_points = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    draftkings_points = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    fanduel_points = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)

    def __str__(self):
        return f"{self.player.full_name} Stats for Game {self.game.id}"

    class Meta:
        unique_together = ('player', 'game')
        verbose_name_plural = 'Player Game Stats'
        ordering = ['-game__week', 'id']


class PlayerSeasonStats(models.Model):
    player = models.ForeignKey('Player', on_delete=models.CASCADE, related_name='season_stats')
    historic_team = models.ForeignKey(
        Team,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="The last team the player played for during this specific season."
    )
    season_year = models.IntegerField()
    season_type = models.IntegerField()
    games_played = models.IntegerField(default=0)

    # --- COUNTING SUMS & VALUE FIELDS ---
    # Passing
    pass_attempts = models.IntegerField(default=0)
    completions = models.IntegerField(default=0)
    pass_yards = models.IntegerField(default=0)
    pass_touchdowns = models.IntegerField(default=0)
    interceptions = models.IntegerField(default=0)
    sacks = models.IntegerField(default=0)
    long_passing = models.IntegerField(default=0)  # Stores season-long max

    # Rushing
    rush_attempts = models.IntegerField(default=0)
    rush_yards = models.IntegerField(default=0)
    rush_touchdowns = models.IntegerField(default=0)
    long_rushing = models.IntegerField(default=0)  # Stores season-long max

    # Receiving
    receptions = models.IntegerField(default=0)
    rec_targets = models.IntegerField(default=0)
    rec_yards = models.IntegerField(default=0)
    rec_touchdowns = models.IntegerField(default=0)
    long_reception = models.IntegerField(default=0)  # Stores season-long max

    # Miscellaneous/Edge
    fumbles = models.IntegerField(default=0)
    fumbles_lost = models.IntegerField(default=0)
    two_pt_conversions = models.IntegerField(default=0)
    off_fum_rec_tds = models.IntegerField(default=0)
    kick_return_tds = models.IntegerField(default=0)
    punt_return_tds = models.IntegerField(default=0)

    # Fantasy Points Accumulated
    ppr_points = models.DecimalField(max_digits=6, decimal_places=2, default=0.0)
    half_ppr_points = models.DecimalField(max_digits=6, decimal_places=2, default=0.0)
    non_ppr_points = models.DecimalField(max_digits=6, decimal_places=2, default=0.0)
    yahoo_points = models.DecimalField(max_digits=6, decimal_places=2, default=0.0)
    draftkings_points = models.DecimalField(max_digits=6, decimal_places=2, default=0.0)
    fanduel_points = models.DecimalField(max_digits=6, decimal_places=2, default=0.0)

    # --- OVERALL RANKS (League Wide) ---
    rank_pass_yards = models.IntegerField(null=True, blank=True)
    rank_pass_tds = models.IntegerField(null=True, blank=True)
    rank_rush_yards = models.IntegerField(null=True, blank=True)
    rank_rush_tds = models.IntegerField(null=True, blank=True)
    rank_rec_yards = models.IntegerField(null=True, blank=True)
    rank_rec_tds = models.IntegerField(null=True, blank=True)

    rank_ppr = models.IntegerField(null=True, blank=True)
    rank_half_ppr = models.IntegerField(null=True, blank=True)
    rank_draftkings = models.IntegerField(null=True, blank=True)
    rank_fanduel = models.IntegerField(null=True, blank=True)
    rank_non_ppr = models.IntegerField(null=True, blank=True)
    rank_yahoo = models.IntegerField(null=True, blank=True)

    # --- POSITIONAL RANKS (Partitioned by Position) ---
    pos_rank_pass_yards = models.IntegerField(null=True, blank=True)
    pos_rank_pass_tds = models.IntegerField(null=True, blank=True)
    pos_rank_rush_yards = models.IntegerField(null=True, blank=True)
    pos_rank_rush_tds = models.IntegerField(null=True, blank=True)
    pos_rank_rec_yards = models.IntegerField(null=True, blank=True)
    pos_rank_rec_tds = models.IntegerField(null=True, blank=True)

    pos_rank_ppr = models.IntegerField(null=True, blank=True)
    pos_rank_half_ppr = models.IntegerField(null=True, blank=True)
    pos_rank_draftkings = models.IntegerField(null=True, blank=True)
    pos_rank_fanduel = models.IntegerField(null=True, blank=True)
    pos_rank_non_ppr = models.IntegerField(null=True, blank=True)
    pos_rank_yahoo = models.IntegerField(null=True, blank=True)

    class Meta:
        unique_together = ('player', 'season_year', 'season_type')
        verbose_name_plural = "Player Season Stats"

    # --- DYNAMIC SEASONAL EFFICIENCY PROPERTIES ---
    @property
    def completion_pct(self):
        return round((self.completions / self.pass_attempts) * 100, 2) if self.pass_attempts > 0 else 0.0

    @property
    def yards_per_pass_attempt(self):
        return round(self.pass_yards / self.pass_attempts, 2) if self.pass_attempts > 0 else 0.0

    @property
    def yards_per_rush_attempt(self):
        return round(self.rush_yards / self.rush_attempts, 2) if self.rush_attempts > 0 else 0.0

    @property
    def yards_per_reception(self):
        return round(self.rec_yards / self.receptions, 2) if self.receptions > 0 else 0.0


class TeamOffensePassingStats(models.Model):
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='team_offense_passing',
        null=False)

    season_year = models.PositiveSmallIntegerField(null=False)
    pass_attempts = models.IntegerField(default=0)
    completions = models.IntegerField(default=0)
    completion_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    yards_per_attempt = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    pass_yards = models.IntegerField(default=0)
    pass_touchdowns = models.IntegerField(default=0)
    interceptions = models.IntegerField(default=0)
    pass_rating = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    sacks = models.IntegerField(default=0)
    sack_yards = models.IntegerField(default=0)

    class Meta:
        unique_together = ('team', 'season_year')


class TeamOffenseRushingStats(models.Model):
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='team_offense_rushing',
        null=False)

    season_year = models.PositiveSmallIntegerField(null=False)
    rush_attempts = models.IntegerField(default=0)
    rush_yards = models.IntegerField(default=0)
    yards_per_carry = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    rush_touchdowns = models.IntegerField(default=0)
    rush_fumbles = models.IntegerField(default=0)

    class Meta:
        unique_together = ('team', 'season_year')


class TeamOffenseReceivingStats(models.Model):
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='team_offense_receiving',
        null=False)

    season_year = models.PositiveSmallIntegerField(null=False)
    receptions = models.IntegerField(default=0)
    rec_yards = models.IntegerField(default=0)
    yards_per_reception = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    rec_touchdowns = models.IntegerField(default=0)
    rec_fumbles = models.IntegerField(default=0)

    class Meta:
        unique_together = ('team', 'season_year')


class TeamDefensePassingStats(models.Model):
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='team_defense_passing',
        null=False)

    season_year = models.PositiveSmallIntegerField(null=False)
    pass_attempts = models.IntegerField(default=0)
    completions = models.IntegerField(default=0)
    completion_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    yards_per_attempt = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    pass_yards = models.IntegerField(default=0)
    pass_touchdowns = models.IntegerField(default=0)
    interceptions = models.IntegerField(default=0)
    pass_rating = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    sacks = models.IntegerField(default=0)

    class Meta:
        unique_together = ('team', 'season_year')


class TeamDefenseRushingStats(models.Model):
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='team_defense_rushing',
        null=False)

    season_year = models.PositiveSmallIntegerField(null=False)
    rush_attempts = models.IntegerField(default=0)
    rush_yards = models.IntegerField(default=0)
    yards_per_carry = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    rush_touchdowns = models.IntegerField(default=0)
    rush_fumbles = models.IntegerField(default=0)

    class Meta:
        unique_together = ('team', 'season_year')


class TeamDefenseReceivingStats(models.Model):
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='team_defense_receiving',
        null=False)

    season_year = models.PositiveSmallIntegerField(null=False)
    receptions = models.IntegerField(default=0)
    rec_yards = models.IntegerField(default=0)
    yards_per_reception = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    rec_touchdowns = models.IntegerField(default=0)
    rec_fumbles = models.IntegerField(default=0)
    pass_defended = models.IntegerField(default=0)

    class Meta:
        unique_together = ('team', 'season_year')


class TeamAdvanceOffenseStats(models.Model):
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='team_advance_offense',
        null=False)

    season_year = models.PositiveSmallIntegerField(null=False)
    expected_points_added_per_play = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    total_expected_points_added = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    success_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    expected_points_added_per_pass = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    expected_points_added_per_rush = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    average_depth_of_target = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    scramble_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    interception_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)

    class Meta:
        unique_together = ('team', 'season_year')


class TeamAdvanceDefenseStats(models.Model):
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='team_advance_defense',
        null=False)

    season_year = models.PositiveSmallIntegerField(null=False)
    expected_points_added_per_play = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    total_expected_points_added = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    success_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    expected_points_added_allowed_per_pass = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    expected_points_added_allowed_per_rush = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    average_depth_of_target_against = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    scramble_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    interception_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)

    class Meta:
        unique_together = ('team', 'season_year')


class TeamCoverageSchemeStats(models.Model):
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='team_coverage_rates',
        null=False)

    season_year = models.PositiveSmallIntegerField(null=False)
    man_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    zone_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    middle_closed_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    middle_open_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)

    class Meta:
        unique_together = ('team', 'season_year')


class TeamOffensePlayCallingStats(models.Model):
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='team_play_calling',
        null=False)

    season_year = models.PositiveSmallIntegerField(null=False)
    motion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    play_action_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    airyards_per_att = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    shotgun_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    nohuddle_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)

    class Meta:
        unique_together = ('team', 'season_year')


class TeamCoverageStatsByPosition(models.Model):
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='team_coverage_stats_by_position',
        null=False)

    season_year = models.PositiveSmallIntegerField(null=False)
    yards_allowed_wr = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    yards_allowed_te = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    yards_allowed_rb = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    yards_allowed_outside = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    yards_allowed_slot = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)

    class Meta:
        unique_together = ('team', 'season_year')


class PointSpread(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='point_spread', null=False)
    display_name = models.CharField(max_length=255, blank=True, default="")
    open_line = models.CharField(max_length=10, blank=True, default="")
    open_odds = models.CharField(max_length=10, blank=True, default="")
    close_line = models.CharField(max_length=10, blank=True, default="")
    close_odds = models.CharField(max_length=10, blank=True, default="")

    class Meta:
        unique_together = ('team', 'display_name')


class Moneyline(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='moneyline', null=False)
    display_name = models.CharField(max_length=255, blank=True, default="")
    open_odds = models.CharField(max_length=10, blank=True, default="")
    close_odds = models.CharField(max_length=10, blank=True, default="")

    class Meta:
        unique_together = ('team', 'display_name')


class Total(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='total', null=False)
    display_name = models.CharField(max_length=255, blank=True, default="")
    open_line = models.CharField(max_length=10, blank=True, default="")
    open_odds = models.CharField(max_length=10, blank=True, default="")
    close_line = models.CharField(max_length=10, blank=True, default="")
    close_odds = models.CharField(max_length=10, blank=True, default="")

    class Meta:
        unique_together = ('team', 'display_name')


class TeamRankSnapshot(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='rank_snapshot', null=False)
    updated_at = models.DateTimeField(auto_now=True)
    season_year = models.PositiveSmallIntegerField(null=False)

    off_pass_yards_rank = models.IntegerField(default=0)
    off_pass_tds_rank = models.IntegerField(default=0)
    off_pass_rating_rank = models.IntegerField(default=0)

    off_rush_yards_rank = models.IntegerField(default=0)
    off_rush_tds_rank = models.IntegerField(default=0)
    off_rush_attempts_rank = models.IntegerField(default=0)

    off_receptions_rank = models.IntegerField(default=0)
    off_rec_yards_rank = models.IntegerField(default=0)
    off_rec_tds_rank = models.IntegerField(default=0)

    def_pass_yards_rank = models.IntegerField(default=0)
    def_pass_tds_rank = models.IntegerField(default=0)
    def_pass_rating_rank = models.IntegerField(default=0)

    def_rush_yards_rank = models.IntegerField(default=0)
    def_rush_tds_rank = models.IntegerField(default=0)
    def_rush_attempts_rank = models.IntegerField(default=0)

    def_receptions_rank = models.IntegerField(default=0)
    def_rec_yards_rank = models.IntegerField(default=0)
    def_rec_tds_rank = models.IntegerField(default=0)
    def_pass_defended_rank = models.IntegerField(default=0)

    off_expected_points_added_per_play_rank = models.IntegerField(default=0)
    off_expected_points_added_per_pass_rank = models.IntegerField(default=0)
    off_expected_points_added_per_rush_rank = models.IntegerField(default=0)

    def_expected_points_added_per_play_rank = models.IntegerField(default=0)
    def_expected_points_added_allowed_per_pass_rank = models.IntegerField(default=0)
    def_expected_points_added_allowed_per_rush_rank = models.IntegerField(default=0)

    man_rate_rank = models.IntegerField(default=0)
    zone_rate_rank = models.IntegerField(default=0)
    middle_closed_rate_rank = models.IntegerField(default=0)
    middle_open_rate_rank = models.IntegerField(default=0)

    motion_rate_rank = models.IntegerField(default=0)
    play_action_rate_rank = models.IntegerField(default=0)
    shotgun_rate_rank = models.IntegerField(default=0)
    nohuddle_rate_rank = models.IntegerField(default=0)

    yards_allowed_wr_rank = models.IntegerField(default=0)
    yards_allowed_te_rank = models.IntegerField(default=0)
    yards_allowed_rb_rank = models.IntegerField(default=0)
    yards_allowed_outside_rank = models.IntegerField(default=0)
    yards_allowed_slot_rank = models.IntegerField(default=0)

    class Meta:
        verbose_name = "Team Rank Snapshot"
        unique_together = ('team', 'season_year')

        indexes = [
            models.Index(fields=['team', 'season_year'], name='idx_rank_team_season'),
        ]
