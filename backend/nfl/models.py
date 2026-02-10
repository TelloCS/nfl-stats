from django.db import models

class Team(models.Model):
    slug = models.SlugField(max_length=255, unique=True, help_text="URL-friendly identifier")

    full_name = models.CharField(max_length=50, blank=True, default="")
    nickname = models.CharField(max_length=50, blank=True, default="")
    abbreviation = models.CharField(max_length=5, unique=True, blank=True, default="", help_text="e.g., KC, SF")

    conference = models.CharField(max_length=3, blank=True, default="")
    division = models.CharField(max_length=5, blank=True, default="")

    def __str__(self):
        return f"{self.full_name}"
    
    class Meta:
        ordering = ['abbreviation']

class Player(models.Model):
    slug = models.SlugField(max_length=255, unique=True, help_text="URL-friendly identifier")

    first_name = models.CharField(max_length=50, blank=True, default="")
    last_name = models.CharField(max_length=50, blank=True, default="")
    full_name = models.CharField(max_length=100, blank=True, default="")
    position = models.CharField(max_length=50, blank=True, default="")

    jersey = models.CharField(max_length=3, blank=True, default="")
    experience = models.IntegerField(default=0)


    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='team', null=False)

    def __str__(self):
        return f"{self.full_name}"
    
    class Meta:
        unique_together = ('full_name', 'team')
    
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
        ordering = ['date']

class PlayerGameStats(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='stats', null=False)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='game', null=False)

    games_played = models.IntegerField(default=0)
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


    yards_per_reception =  models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    long_reception = models.IntegerField(default=0)

    fumbles = models.IntegerField(default=0)
    fumbles_lost = models.IntegerField(default=0)

    # draftkings_fantasy_points = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)

    def __str__(self):
        return f"{self.player.full_name} Stats for Game {self.game.id}"
    
    class Meta:
        unique_together = ('player', 'game')
        verbose_name_plural = 'Player Game Stats'
        ordering = ['game__week']

class TeamOffensePassingStats(models.Model):
    team = models.OneToOneField(
        Team,
        on_delete=models.CASCADE,
        related_name='team_offense_passing',
        null=False)
    
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

class TeamOffenseRushingStats(models.Model):
    team = models.OneToOneField(
        Team,
        on_delete=models.CASCADE,
        related_name='team_offense_rushing',
        null=False)
    
    rush_attempts = models.IntegerField(default=0)
    rush_yards = models.IntegerField(default=0)
    yards_per_carry = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    rush_touchdowns = models.IntegerField(default=0)
    rush_fumbles = models.IntegerField(default=0)

class TeamOffenseReceivingStats(models.Model):
    team = models.OneToOneField(
        Team,
        on_delete=models.CASCADE,
        related_name='team_offense_receiving',
        null=False)
    
    receptions = models.IntegerField(default=0)
    rec_yards = models.IntegerField(default=0)
    yards_per_reception = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    rec_touchdowns = models.IntegerField(default=0)
    rec_fumbles = models.IntegerField(default=0)
    
class TeamDefensePassingStats(models.Model):
    team = models.OneToOneField(
        Team,
        on_delete=models.CASCADE,
        related_name='team_defense_passing',
        null=False)
    
    pass_attempts = models.IntegerField(default=0)
    completions = models.IntegerField(default=0)
    completion_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    yards_per_attempt = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    pass_yards = models.IntegerField(default=0)
    pass_touchdowns = models.IntegerField(default=0)
    interceptions = models.IntegerField(default=0)
    pass_rating = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    sacks = models.IntegerField(default=0)
    
class TeamDefenseRushingStats(models.Model):
    team = models.OneToOneField(
        Team,
        on_delete=models.CASCADE,
        related_name='team_defense_rushing',
        null=False)
    
    rush_attempts = models.IntegerField(default=0)
    rush_yards = models.IntegerField(default=0)
    yards_per_carry = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    rush_touchdowns = models.IntegerField(default=0)
    rush_fumbles = models.IntegerField(default=0)

class TeamDefenseReceivingStats(models.Model):
    team = models.OneToOneField(
        Team,
        on_delete=models.CASCADE,
        related_name='team_defense_receiving',
        null=False)
    
    receptions = models.IntegerField(default=0)
    rec_yards = models.IntegerField(default=0)
    yards_per_reception = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    rec_touchdowns = models.IntegerField(default=0)
    rec_fumbles = models.IntegerField(default=0)
    pass_defended = models.IntegerField(default=0)

class TeamAdvanceOffenseStats(models.Model):
    team = models.OneToOneField(
        Team,
        on_delete=models.CASCADE,
        related_name='team_advance_offense',
        null=False)

    season_year = models.IntegerField()
    expected_points_added_per_play = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    total_expected_points_added = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    success_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    expected_points_added_per_pass = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    expected_points_added_per_rush = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    average_depth_of_target = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    scramble_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    interception_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)

class TeamAdvanceDefenseStats(models.Model):
    team = models.OneToOneField(
        Team,
        on_delete=models.CASCADE,
        related_name='team_advance_defense',
        null=False)

    season_year = models.IntegerField()
    expected_points_added_per_play = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    total_expected_points_added = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    success_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    expected_points_added_allowed_per_pass = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    expected_points_added_allowed_per_rush = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    average_depth_of_target_against = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    scramble_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    interception_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)

class TeamCoverageSchemeStats(models.Model):
    team = models.OneToOneField(
        Team,
        on_delete=models.CASCADE,
        related_name='team_coverage_rates',
        null=False)
    
    man_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    zone_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    middle_closed_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    middle_open_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)

class TeamOffensePlayCallingStats(models.Model):
    team = models.OneToOneField(
        Team,
        on_delete=models.CASCADE,
        related_name='team_play_calling',
        null=False)

    motion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    play_action_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    airyards_per_att = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    shotgun_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    nohuddle_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)

class TeamCoverageStatsByPosition(models.Model):
    team = models.OneToOneField(
        Team,
        on_delete=models.CASCADE,
        related_name='team_coverage_stats_by_position',
        null=False)

    yards_allowed_wr = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    yards_allowed_te = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    yards_allowed_rb = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    yards_allowed_outside = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    yards_allowed_slot = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)

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
    team = models.OneToOneField(Team, on_delete=models.CASCADE, related_name='rank_snapshot')
    updated_at = models.DateTimeField(auto_now=True)

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