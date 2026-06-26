from rest_framework import serializers
from .models import (
    PointSpread,
    Moneyline,
    Total,
    Team,
    Game,
    PlayerGameStats,
    PlayerSeasonStats,
    Player,
    TeamRankSnapshot
)
from django.forms.models import model_to_dict


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
    class Meta:
        model = Team
        fields = [
            'id', 'slug', 'full_name', 'nickname', 'abbreviation', 'conference', 'division',
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
        fields = ['id', 'full_name', 'nickname', 'abbreviation', 'conference', 'division']


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
    team = serializers.SerializerMethodField()
    jersey = serializers.SerializerMethodField()
    stats = PlayerGameStatsSerializer(many=True, read_only=True)
    available_seasons = serializers.ReadOnlyField()
    active_season = serializers.SerializerMethodField()

    class Meta:
        model = Player
        fields = [
            'id', 'slug', 'fullName', 'position', 'jersey', 'experience',
            'team', 'available_seasons', 'active_season', 'stats',
        ]

    def get_team(self, obj):
        if obj.team:
            return PlayerTeamSerializer(obj.team, context=self.context).data

        return {
            "id": None,
            "slug": "free-agent",
            "full_name": "Free Agent",
            "nickname": "Free Agent",
            "abbreviation": "FA",
            "conference": None,
            "division": None
        }

    def get_jersey(self, obj):
        if not obj.team:
            return None
        return obj.jersey

    def get_active_season(self, obj):
        return getattr(obj, 'active_season_value', None)

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


class TeamStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = [
            'id', 'slug', 'full_name', 'nickname', 'abbreviation', 'conference', 'division',
        ]
        read_only_fields = ['slug']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        stat_keys = [
            'team_offense_passing', 'team_offense_rushing', 'team_offense_receiving',
            'team_defense_passing', 'team_defense_rushing', 'team_defense_receiving',
            'team_advance_offense', 'team_advance_defense', 'team_coverage_rates',
            'team_play_calling', 'team_coverage_stats_by_position'
        ]

        for key in stat_keys:
            prefetched_data = getattr(instance, f"prefetched_{key}", None)

            if prefetched_data:
                stats_obj = prefetched_data[0]
                stats_dict = model_to_dict(stats_obj)
                data[key] = {
                    k: v for k, v in stats_dict.items()
                    if v is not None and k not in ('id', 'team')
                }

            else:
                data[key] = None
        return data

#######################################################################################################################


class TeamRankSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamRankSnapshot
        exclude = ['id', 'team', 'updated_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return {k: v for k, v in data.items() if v != 0}


class TeamRanksSerializer(serializers.ModelSerializer):
    rank_snapshot = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = [
            'id',
            'slug',
            'full_name',
            'abbreviation',
            'rank_snapshot'
        ]

    def get_rank_snapshot(self, obj):
        snapshots = getattr(obj, 'prefetched_snapshots', [])
        if snapshots:
            return TeamRankSnapshotSerializer(snapshots[0]).data
        return None

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
    date = serializers.DateTimeField(format="%m-%d")

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
    shortDisplayName = serializers.CharField()
    color = serializers.CharField(required=False, allow_null=True)


class CompetitorSerializer(serializers.Serializer):
    homeAway = serializers.CharField()
    score = serializers.CharField(required=False, allow_null=True)
    winner = serializers.BooleanField(required=False, allow_null=True)
    team = TeamSerializer()


class VenueSerializer(serializers.Serializer):
    id = serializers.CharField(required=False, allow_null=True)
    fullName = serializers.CharField()
    city = serializers.CharField(required=False, allow_null=True)
    state = serializers.CharField(required=False, allow_null=True)
    indoor = serializers.BooleanField(required=False, allow_null=True)


class OddsProviderSerializer(serializers.Serializer):
    id = serializers.CharField(required=False, allow_null=True)
    name = serializers.CharField()


class OddsSerializer(serializers.Serializer):
    provider = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    details = serializers.CharField(required=False, allow_null=True)
    overUnder = serializers.FloatField(required=False, allow_null=True)
    spread = serializers.FloatField(required=False, allow_null=True)


class CompetitionSerializer(serializers.Serializer):
    venue = VenueSerializer(required=False, allow_null=True)
    odds = OddsSerializer(many=True, required=False)
    competitors = CompetitorSerializer(many=True)


class EventSerializer(serializers.Serializer):
    date = serializers.DateTimeField()
    name = serializers.CharField()
    shortName = serializers.CharField()
    season = serializers.DictField()
    week = serializers.DictField()
    status = serializers.DictField()
    competitions = CompetitionSerializer(many=True)


class NFLScheduleSerializer(serializers.Serializer):
    season = serializers.DictField(required=False)
    week = serializers.DictField(required=False)
    events = EventSerializer(many=True)

#######################################################################################################################


class HistoricTeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'


class PlayerSerializerV2(serializers.ModelSerializer):
    fullName = serializers.CharField(source='full_name')

    class Meta:
        model = Player
        fields = ['id', 'slug', 'fullName', 'position']


class PlayerSeasonStatsSerializer(serializers.ModelSerializer):
    player = PlayerSerializerV2()
    historic_team = HistoricTeamSerializer()

    class Meta:
        model = PlayerSeasonStats
        fields = [
            'id', 'player', 'historic_team', 'season_year', 'season_type', 'games_played',

            'ppr_points', 'half_ppr_points', 'non_ppr_points',
            'yahoo_points', 'draftkings_points', 'fanduel_points',

            'rank_ppr', 'rank_half_ppr', 'rank_draftkings',
            'rank_fanduel', 'rank_non_ppr', 'rank_yahoo',

            'pass_yards', 'pass_touchdowns', 'interceptions', 'sacks',
            'rush_yards', 'rush_touchdowns',
            'receptions', 'rec_yards', 'rec_touchdowns',

            'fumbles', 'fumbles_lost', 'two_pt_conversions', 'off_fum_rec_tds',
            'kick_return_tds', 'punt_return_tds',

            'pos_rank_ppr', 'pos_rank_half_ppr', 'pos_rank_draftkings',
            'pos_rank_fanduel', 'pos_rank_non_ppr', 'pos_rank_yahoo'
        ]

#######################################################################################################################


class PlayerCareerStatsSerializer(serializers.ModelSerializer):
    player = PlayerSerializerV2()
    historic_team = HistoricTeamSerializer()

    completion_pct = serializers.ReadOnlyField()
    yards_per_pass_attempt = serializers.ReadOnlyField()
    yards_per_rush_attempt = serializers.ReadOnlyField()
    yards_per_reception = serializers.ReadOnlyField()

    class Meta:
        model = PlayerSeasonStats
        fields = '__all__'
