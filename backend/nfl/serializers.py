from rest_framework import serializers
from .models import *


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

class TeamSerializer(serializers.ModelSerializer):
    point_spread = PointSpreadSerializer(many=True, read_only=True)
    moneyline = MoneylineSerializer(many=True, read_only=True)
    total = TotalSerializer(many=True, read_only=True)

    class Meta:
        model = Team
        fields = ['id', 'slug', 'full_name', 'nickname', 'abbreviation', 'conference', 'division', 'point_spread', 'moneyline', 'total']
        read_only_fields = ['slug']
        
class GameSerializer(serializers.ModelSerializer):
    homeTeam = TeamSerializer(read_only=True)
    awayTeam = TeamSerializer(read_only=True)

    class Meta:
        model = Game
        fields = [
            'id', 'date', 'name', 'short_name', 'season_year', 'week', 'status',
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
    """
    Creates a player instance that contains stats instance
    with many games played during the season.
    
    """

    team = PlayerTeamSerializer(read_only=True)
    fullName = serializers.CharField(source='full_name')
    stats = PlayerGameStatsSerializer(many=True, read_only=True)

    class Meta:
        model = Player
        fields = ['id', 'slug', 'fullName', 'position', 'jersey', 'experience', 'team', 'stats']

#######################################################################################################################

class PlayerSerializer(serializers.ModelSerializer):
    """
    For the autocomplete search bar.

    """
    team = TeamSerializer(read_only=True)
    fullName = serializers.CharField(source='full_name')

    class Meta:
        model = Player
        fields = ['id', 'slug', 'fullName', 'position', 'team']


#######################################################################################################################

class TeamOffensePassingStatsSerializer(serializers.ModelSerializer):
    off_pass_yards_rank = serializers.IntegerField(read_only=True)
    off_pass_tds_rank = serializers.IntegerField(read_only=True)
    off_pass_rating_rank = serializers.IntegerField(read_only=True)

    class Meta:
        model = TeamOffensePassingStats
        fields = [
            'pass_attempts', 'completions', 'completion_pct', 'yards_per_attempt', 'pass_yards',
            'pass_touchdowns', 'interceptions', 'pass_rating', 'sacks', 'sack_yards',
            'off_pass_yards_rank', 'off_pass_tds_rank', 'off_pass_rating_rank'
        ]

class TeamOffenseRushingStatsSerializer(serializers.ModelSerializer):
    off_rush_yards_rank = serializers.IntegerField(read_only=True)
    off_rush_tds_rank = serializers.IntegerField(read_only=True)
    off_rush_attempts_rank = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = TeamOffenseRushingStats
        fields = [
            'rush_attempts', 'rush_yards', 'yards_per_carry', 'rush_touchdowns', 'rush_fumbles',
            'off_rush_yards_rank', 'off_rush_tds_rank', 'off_rush_attempts_rank',
        ]

class TeamOffenseReceivingStatsSerializer(serializers.ModelSerializer):
    off_receptions_rank = serializers.IntegerField(read_only=True)
    off_rec_yards_rank = serializers.IntegerField(read_only=True)
    off_rec_tds_rank = serializers.IntegerField(read_only=True)

    class Meta:
        model = TeamOffenseReceivingStats
        fields = [
            'receptions', 'rec_yards', 'yards_per_reception', 'rec_touchdowns', 'rec_fumbles',
            'off_receptions_rank', 'off_rec_yards_rank', 'off_rec_tds_rank',
        ]

class TeamDefensePassingStatsSerializer(serializers.ModelSerializer):
    def_pass_yards_rank = serializers.IntegerField(read_only=True)
    def_pass_tds_rank = serializers.IntegerField(read_only=True)
    def_pass_rating_rank = serializers.IntegerField(read_only=True)

    class Meta:
        model = TeamDefensePassingStats
        fields = [
            'pass_attempts', 'completions', 'completion_pct', 'yards_per_attempt', 'pass_yards',
            'pass_touchdowns', 'interceptions', 'pass_rating', 'sacks',
            'def_pass_yards_rank', 'def_pass_tds_rank', 'def_pass_rating_rank',
        ]

class TeamDefenseRushingStatsSerializer(serializers.ModelSerializer):
    def_rush_yards_rank = serializers.IntegerField(read_only=True)
    def_rush_tds_rank = serializers.IntegerField(read_only=True)
    def_rush_attempts_rank = serializers.IntegerField(read_only=True)

    class Meta:
        model = TeamDefenseRushingStats
        fields = [
            'rush_attempts', 'rush_yards', 'yards_per_carry', 'rush_touchdowns', 'rush_fumbles',
            'def_rush_yards_rank', 'def_rush_tds_rank', 'def_rush_attempts_rank',
        ]

class TeamDefenseReceivingStatsSerializer(serializers.ModelSerializer):
    def_receptions_rank = serializers.IntegerField(read_only=True)
    def_rec_yards_rank = serializers.IntegerField(read_only=True)
    def_rec_tds_rank = serializers.IntegerField(read_only=True)
    def_pass_defended_rank = serializers.IntegerField(read_only=True)

    class Meta:
        model = TeamDefenseReceivingStats
        fields = [
            'receptions', 'rec_yards', 'yards_per_reception', 'rec_touchdowns', 'rec_fumbles', 'pass_defended',
            'def_receptions_rank', 'def_rec_yards_rank', 'def_rec_tds_rank', 'def_pass_defended_rank',
        ]

class TeamAdvanceOffenseStatsSerializer(serializers.ModelSerializer):
    off_expected_points_added_per_play_rank = serializers.IntegerField(read_only=True)
    off_expected_points_added_per_pass_rank = serializers.IntegerField(read_only=True)
    off_expected_points_added_per_rush_rank = serializers.IntegerField(read_only=True)

    class Meta:
        model = TeamAdvanceOffenseStats
        fields = [
            'expected_points_added_per_play', 'total_expected_points_added', 'success_pct', 'expected_points_added_per_pass',
            'expected_points_added_per_rush', 'average_depth_of_target', 'scramble_pct', 'interception_pct',
            'off_expected_points_added_per_play_rank', 'off_expected_points_added_per_pass_rank', 'off_expected_points_added_per_rush_rank',
        ]

class TeamAdvanceDefenseStatsSerializer(serializers.ModelSerializer):
    def_expected_points_added_per_play_rank = serializers.IntegerField(read_only=True)
    def_expected_points_added_allowed_per_pass_rank = serializers.IntegerField(read_only=True)
    def_expected_points_added_allowed_per_rush_rank = serializers.IntegerField(read_only=True)

    class Meta:
        model = TeamAdvanceDefenseStats
        fields = [
            'expected_points_added_per_play', 'total_expected_points_added', 'success_pct', 'expected_points_added_allowed_per_pass',
            'expected_points_added_allowed_per_rush', 'average_depth_of_target_against', 'scramble_pct', 'interception_pct',
            'def_expected_points_added_per_play_rank', 'def_expected_points_added_allowed_per_pass_rank', 'def_expected_points_added_allowed_per_rush_rank'
        ]

class TeamCoverageSchemeStatsSerializer(serializers.ModelSerializer):
    man_rate_rank = serializers.IntegerField(read_only=True)
    zone_rate_rank = serializers.IntegerField(read_only=True)
    middle_closed_rate_rank = serializers.IntegerField(read_only=True)
    middle_open_rate_rank = serializers.IntegerField(read_only=True)

    class Meta:
        model = TeamCoverageSchemeStats
        fields = [
            'man_rate', 'zone_rate', 'middle_closed_rate', 'middle_open_rate',
            'man_rate_rank', 'zone_rate_rank', 'middle_closed_rate_rank', 'middle_open_rate_rank'
        ]

class TeamOffensePlayCallingStatsSerializer(serializers.ModelSerializer):
    motion_rate_rank = serializers.IntegerField(read_only=True)
    play_action_rate_rank = serializers.IntegerField(read_only=True)
    airyards_per_att_rank = serializers.IntegerField(read_only=True)
    shotgun_rate_rank = serializers.IntegerField(read_only=True)
    nohuddle_rate_rank = serializers.IntegerField(read_only=True)

    class Meta:
        model = TeamOffensePlayCallingStats
        fields = [
            'motion_rate', 'play_action_rate', 'airyards_per_att', 'shotgun_rate', 'nohuddle_rate',
            'motion_rate_rank', 'play_action_rate_rank', 'airyards_per_att_rank', 'shotgun_rate_rank', 'nohuddle_rate_rank'
        ]

class TeamCoverageStatsByPositionSerializer(serializers.ModelSerializer):
    yards_allowed_wr_rank = serializers.IntegerField(read_only=True)
    yards_allowed_te_rank = serializers.IntegerField(read_only=True)
    yards_allowed_rb_rank = serializers.IntegerField(read_only=True)
    yards_allowed_outside_rank = serializers.IntegerField(read_only=True)
    yards_allowed_slot_rank = serializers.IntegerField(read_only=True)


    class Meta:
        model = TeamCoverageStatsByPosition
        fields = [
            'yards_allowed_wr', 'yards_allowed_te', 'yards_allowed_rb', 'yards_allowed_outside', 'yards_allowed_slot',
            'yards_allowed_wr_rank', 'yards_allowed_te_rank', 'yards_allowed_rb_rank', 'yards_allowed_outside_rank', 'yards_allowed_slot_rank'
        ]

class TeamRanksSerializer(serializers.ModelSerializer):
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

# Working on these Serializers
class TeamStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'slug', 'full_name', 'nickname', 'abbreviation', 'conference', 'division']
        read_only_fields = ['slug']

# class PlayerTeamSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Team
#         fields = ['id', 'slug', 'full_name', 'nickname', 'abbreviation', 'conference', 'division']

# class PlayerGameSerializer(serializers.ModelSerializer):
#     homeTeam = PlayerTeamSerializer(read_only=True)
#     awayTeam = PlayerTeamSerializer(read_only=True)
#     date = serializers.DateTimeField(format="%m-%d")

#     class Meta:
#         model = Game
#         fields = [
#             'id', 'date', 'name', 'short_name', 'season_year', 'week', 'status',
#             'homeTeam', 'awayTeam', 'home_score', 'away_score'
#         ]

# class PlayerGameStatsSerializer(serializers.ModelSerializer):
#     game = PlayerGameSerializer(read_only=True)

#     class Meta:
#         model = PlayerGameStats
#         fields = ('__all__')

class PlayerGameStatsMatchupsSerializer(serializers.ModelSerializer):
    team = TeamStatsSerializer(read_only=True)
    stats = PlayerGameStatsSerializer(many=True, read_only=True)

    class Meta:
        model = Player
        fields = ('__all__')

# TESTING
class StatTest(serializers.ModelSerializer):
    player = PlayerSerializer(read_only=True)
    # game = GameSerializer(read_only=True)
    class Meta:
        model = PlayerGameStats
        fields = ("__all__")

class GameTest(serializers.ModelSerializer):
    # game = StatTest(many=True, read_only=True)
    # homeTeam = PlayerTeamSerializer(read_only=True)
    # awayTeam = PlayerTeamSerializer(read_only=True)
    player = PlayerSerializer(read_only=True)
    game = GameSerializer(read_only=True)
    class Meta:
        model = PlayerGameStats
        fields = ("__all__")