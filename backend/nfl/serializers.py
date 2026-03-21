from rest_framework import serializers
from .models import (
    PointSpread,
    Moneyline,
    Total,
    Team,
    Game,
    PlayerGameStats,
    Player,
    TeamOffensePassingStats,
    TeamOffenseRushingStats,
    TeamOffenseReceivingStats,
    TeamDefensePassingStats,
    TeamDefenseRushingStats,
    TeamDefenseReceivingStats,
    TeamAdvanceOffenseStats,
    TeamAdvanceDefenseStats,
    TeamCoverageSchemeStats,
    TeamOffensePlayCallingStats,
    TeamCoverageStatsByPosition,
    TeamRankSnapshot
)


#######################################################################################################################

# PointSpread, Moneyline, TotalSerializer need to be changed OneToOneFields()
class PointSpreadSerializer(serializers.ModelSerializer):
    class Meta:
        model = PointSpread
        fields = ['display_name', 'open_line', 'open_odds', 'close_line', 'close_odds']


class MoneylineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Moneyline
        fields = ['display_name', 'open_odds', 'close_odds']


class TotalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Total
        fields = ['display_name', 'open_line', 'open_odds', 'close_line', 'close_odds']


class TeamSerializerV1(serializers.ModelSerializer):
    point_spread = PointSpreadSerializer(many=True, read_only=True)
    moneyline = MoneylineSerializer(many=True, read_only=True)
    total = TotalSerializer(many=True, read_only=True)

    class Meta:
        model = Team
        fields = [
            'id', 'slug', 'full_name', 'nickname', 'abbreviation', 'conference', 'division',
            'point_spread', 'moneyline', 'total'
        ]
        read_only_fields = ['slug']


class GameSerializer(serializers.ModelSerializer):
    homeTeam = TeamSerializerV1(read_only=True)
    awayTeam = TeamSerializerV1(read_only=True)

    class Meta:
        model = Game
        fields = [
            'id', 'date', 'name', 'short_name', 'season_year', 'season_type', 'week', 'status',
            'homeTeam', 'awayTeam', 'home_score', 'away_score'
        ]

#######################################################################################################################


class PlayerTeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'slug', 'full_name', 'nickname', 'abbreviation', 'conference', 'division']


class PlayerGameSerializer(serializers.ModelSerializer):
    homeTeam = PlayerTeamSerializer(read_only=True)
    awayTeam = PlayerTeamSerializer(read_only=True)
    date = serializers.DateTimeField(format="%m-%d")

    class Meta:
        model = Game
        fields = [
            'id', 'date', 'name', 'short_name', 'season_year', 'season_type', 'week', 'status',
            'homeTeam', 'awayTeam', 'home_score', 'away_score'
        ]


class PlayerGameStatsSerializer(serializers.ModelSerializer):
    game = PlayerGameSerializer(read_only=True)

    class Meta:
        model = PlayerGameStats
        fields = ('__all__')


class PlayerStatsSerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source='full_name')
    team = PlayerTeamSerializer(read_only=True)
    stats = PlayerGameStatsSerializer(many=True, read_only=True)
    available_seasons = serializers.SerializerMethodField()
    active_season = serializers.SerializerMethodField()

    class Meta:
        model = Player
        fields = [
            'id', 'slug', 'fullName', 'position', 'jersey', 'experience',
            'team', 'available_seasons', 'active_season', 'stats',
        ]

    def get_available_seasons(self, obj):
        return (
            PlayerGameStats.objects.filter(player=obj)
            .values_list('game__season_year', flat=True)
            .distinct()
            .order_by('-game__season_year')
        )

    def get_active_season(self, obj):
        prefetched_stats = list(obj.stats.all())
        if prefetched_stats:
            return prefetched_stats[0].game.season_year
        return None

#######################################################################################################################


class PlayerSerializer(serializers.ModelSerializer):
    """
    For the autocomplete search bar.

    """
    team = TeamSerializerV1(read_only=True)
    fullName = serializers.CharField(source='full_name')

    class Meta:
        model = Player
        fields = ['id', 'slug', 'fullName', 'position', 'team']

#######################################################################################################################


class TeamOffensePassingStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamOffensePassingStats
        fields = [
            'pass_attempts', 'completions', 'completion_pct', 'yards_per_attempt', 'pass_yards',
            'pass_touchdowns', 'interceptions', 'pass_rating', 'sacks', 'sack_yards',
        ]


class TeamOffenseRushingStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamOffenseRushingStats
        fields = [
            'rush_attempts', 'rush_yards', 'yards_per_carry', 'rush_touchdowns', 'rush_fumbles',
        ]


class TeamOffenseReceivingStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamOffenseReceivingStats
        fields = [
            'receptions', 'rec_yards', 'yards_per_reception', 'rec_touchdowns', 'rec_fumbles',
        ]


class TeamDefensePassingStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamDefensePassingStats
        fields = [
            'pass_attempts', 'completions', 'completion_pct', 'yards_per_attempt', 'pass_yards',
            'pass_touchdowns', 'interceptions', 'pass_rating', 'sacks',
        ]


class TeamDefenseRushingStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamDefenseRushingStats
        fields = [
            'rush_attempts', 'rush_yards', 'yards_per_carry', 'rush_touchdowns', 'rush_fumbles',
        ]


class TeamDefenseReceivingStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamDefenseReceivingStats
        fields = [
            'receptions', 'rec_yards', 'yards_per_reception', 'rec_touchdowns', 'rec_fumbles', 'pass_defended',
        ]


class TeamAdvanceOffenseStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamAdvanceOffenseStats
        fields = [
            'expected_points_added_per_play', 'total_expected_points_added', 'success_pct',
            'expected_points_added_per_pass', 'expected_points_added_per_rush',
            'average_depth_of_target', 'scramble_pct', 'interception_pct',
        ]


class TeamAdvanceDefenseStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamAdvanceDefenseStats
        fields = [
            'expected_points_added_per_play', 'total_expected_points_added', 'success_pct',
            'expected_points_added_allowed_per_pass', 'expected_points_added_allowed_per_rush',
            'average_depth_of_target_against', 'scramble_pct', 'interception_pct',
        ]


class TeamCoverageSchemeStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamCoverageSchemeStats
        fields = [
            'man_rate', 'zone_rate', 'middle_closed_rate', 'middle_open_rate',
        ]


class TeamOffensePlayCallingStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamOffensePlayCallingStats
        fields = [
            'motion_rate', 'play_action_rate', 'airyards_per_att', 'shotgun_rate', 'nohuddle_rate',
        ]


class TeamCoverageStatsByPositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamCoverageStatsByPosition
        fields = [
            'yards_allowed_wr', 'yards_allowed_te', 'yards_allowed_rb', 'yards_allowed_outside', 'yards_allowed_slot',
        ]


class TeamStatsSerializer(serializers.ModelSerializer):
    team_offense_passing = TeamOffensePassingStatsSerializer(read_only=True)
    team_offense_rushing = TeamOffenseRushingStatsSerializer(read_only=True)
    team_offense_receiving = TeamOffenseReceivingStatsSerializer(read_only=True)
    team_defense_passing = TeamDefensePassingStatsSerializer(read_only=True)
    team_defense_rushing = TeamDefenseRushingStatsSerializer(read_only=True)
    team_defense_receiving = TeamDefenseReceivingStatsSerializer(read_only=True)
    team_advance_offense = TeamAdvanceOffenseStatsSerializer(read_only=True)
    team_advance_defense = TeamAdvanceDefenseStatsSerializer(read_only=True)
    team_coverage_rates = TeamCoverageSchemeStatsSerializer(read_only=True)
    team_play_calling = TeamOffensePlayCallingStatsSerializer(read_only=True)
    team_coverage_stats_by_position = TeamCoverageStatsByPositionSerializer(read_only=True)

    class Meta:
        model = Team
        fields = [
            'id', 'slug', 'full_name', 'nickname', 'abbreviation', 'conference', 'division',
            'team_offense_passing', 'team_offense_rushing', 'team_offense_receiving',
            'team_defense_passing', 'team_defense_rushing', 'team_defense_receiving',
            'team_advance_offense', 'team_advance_defense', 'team_coverage_rates',
            'team_play_calling', 'team_coverage_stats_by_position'
        ]

        read_only_fields = ['slug']

#######################################################################################################################


class TeamRankSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamRankSnapshot
        exclude = ['id', 'team', 'updated_at']


class TeamRanksSerializer(serializers.ModelSerializer):
    rank_snapshot = TeamRankSnapshotSerializer(read_only=True)

    class Meta:
        model = Team
        fields = [
            'id',
            'slug',
            'full_name',
            'abbreviation',
            'rank_snapshot'
        ]

#######################################################################################################################


class TeamSlimSerializer(serializers.ModelSerializer):
    """
    A version of the Team serializer that does NOT include
    related odds, preventing N+1 leaks.
    """
    class Meta:
        model = Team
        fields = ['id', 'slug', 'full_name', 'nickname', 'abbreviation']


class PlayerOnlySerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source='full_name')

    class Meta:
        model = Player
        fields = ['id', 'slug', 'fullName', 'position']


class GameSlimSerializer(serializers.ModelSerializer):
    homeTeam = TeamSlimSerializer(read_only=True)
    awayTeam = TeamSlimSerializer(read_only=True)

    class Meta:
        model = Game
        fields = [
            'id', 'date', 'name', 'short_name', 'season_year', 'season_type', 'week', 'status',
            'homeTeam', 'awayTeam', 'home_score', 'away_score'
        ]


class PlayerGameStatsMatchupsSerializer(serializers.ModelSerializer):
    player = PlayerOnlySerializer(read_only=True)
    game = GameSlimSerializer(read_only=True)
    team = TeamSlimSerializer(read_only=True)

    class Meta:
        model = PlayerGameStats
        fields = ("__all__")

#######################################################################################################################


class TeamSerializer(serializers.Serializer):
    name = serializers.CharField()
    abbreviation = serializers.CharField()
    displayName = serializers.CharField()
    color = serializers.CharField(required=False, allow_null=True)


class CompetitorSerializer(serializers.Serializer):
    homeAway = serializers.CharField()
    score = serializers.CharField()
    winner = serializers.BooleanField(required=False, allow_null=True)
    team = TeamSerializer()


class CompetitionSerializer(serializers.Serializer):
    competitors = CompetitorSerializer(many=True)


class EventSerializer(serializers.Serializer):
    date = serializers.DateTimeField()
    name = serializers.CharField()
    status = serializers.DictField()
    competitions = CompetitionSerializer(many=True)


class NFLScheduleSerializer(serializers.Serializer):
    season = serializers.DictField(required=False)
    week = serializers.DictField(required=False)
    events = EventSerializer(many=True)
