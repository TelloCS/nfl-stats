from django_filters import FilterSet, CharFilter, NumberFilter, ChoiceFilter
from django.db.models import Max, Q, F
from .models import Team, Game, Player, PlayerGameStats, PlayerSeasonStats, TeamRankSnapshot


class PlayerFilter(FilterSet):
    fullName = CharFilter(
        field_name='full_name',
        lookup_expr='icontains'
    )

    class Meta:
        model = Player
        fields = ['fullName']


class TeamRankFilter(FilterSet):
    season_year = NumberFilter(field_name='season_year')

    _cached_max_year = None

    class Meta:
        model = TeamRankSnapshot
        fields = ['season_year']

    def __init__(self, *args, **kwargs):
        if TeamRankFilter._cached_max_year is None:
            max_year_dict = TeamRankSnapshot.objects.aggregate(max_year=Max('season_year'))
            TeamRankFilter._cached_max_year = max_year_dict.get('max_year')

        data = kwargs.get('data') or {}

        if not data.get('season_year') and TeamRankFilter._cached_max_year:
            mutable_data = data.copy()
            mutable_data['season_year'] = TeamRankFilter._cached_max_year
            kwargs['data'] = mutable_data

        super().__init__(*args, **kwargs)


class TeamStatsFilter(FilterSet):
    season_year = NumberFilter(field_name='team_offense_passing__season_year')

    class Meta:
        model = Team
        fields = ['season_year']


class PlayerMatchupsFilter(FilterSet):
    position = CharFilter(field_name='player__position', lookup_expr='exact')
    opponent = CharFilter(method='filter_by_opponent')

    season_year = NumberFilter(field_name='game__season_year')
    season_type = NumberFilter(field_name='game__season_type')
    location = ChoiceFilter(
        choices=[('home', 'Home'), ('away', 'Away')],
        method='filter_by_location'
    )

    class Meta:
        model = PlayerGameStats
        fields = ('position', 'opponent', 'season_year', 'season_type', 'location')

    def filter_by_opponent(self, queryset, name, opponent):
        return queryset.exclude(team__abbreviation=opponent).filter(
            Q(game__homeTeam__abbreviation=opponent) |
            Q(game__awayTeam__abbreviation=opponent)
        )

    def filter_by_location(self, queryset, name, value):
        if value == 'home':
            return queryset.filter(team_id=F('game__homeTeam'))
        elif value == 'away':
            return queryset.filter(team_id=F('game__awayTeam'))
        return queryset


class PlayerSeasonStatsFilter(FilterSet):
    SCORING_CHOICES = (
        ("rank_ppr", "PPR Points"),
        ("rank_half_ppr", "Half-PPR Points"),
        ("rank_non_ppr", "Standard (Non-PPR) Points"),
        ("rank_yahoo", "Yahoo Points"),
        ("rank_draftkings", "DraftKings Points"),
        ("rank_fanduel", "FanDuel Points"),
    )

    season_year = NumberFilter(field_name='season_year')
    season_type = NumberFilter(field_name='season_type')
    position = CharFilter(field_name='player__position', lookup_expr='iexact')
    ordering = ChoiceFilter(
        choices=SCORING_CHOICES,
        method='filter_by_scoring_system',
        label='Sort by Scoring System'
    )
    team = CharFilter(field_name='historic_team__abbreviation', lookup_expr='iexact')

    class Meta:
        model = PlayerSeasonStats
        fields = ['position', 'team', 'season_year', 'season_type', 'ordering']

    def filter_by_scoring_system(self, queryset, name, value):
        if not value:
            return queryset

        return queryset.order_by(value)


class PlayerVsUpcomingMatchupFilter(FilterSet):
    team = CharFilter(method='filter_by_team')

    class Meta:
        model = PlayerGameStats
        fields = ['team']

    def filter_by_team(self, queryset, name, team):
        return queryset.exclude(team__abbreviation=team).filter(
            Q(game__homeTeam__abbreviation=team) |
            Q(game__awayTeam__abbreviation=team)
        )


class GameScheduleFilter(FilterSet):
    season_year = NumberFilter(field_name="season_year")
    season_type = NumberFilter(field_name="season_type")
    week = NumberFilter(field_name="week")

    class Meta:
        model = Game
        fields = ['season_year', 'season_type', 'week']


class PlayerTeammatesFilter(FilterSet):
    team = CharFilter(field_name="team__abbreviation")
    season_year = NumberFilter(field_name='game__season_year')

    class Meta:
        model = PlayerGameStats
        fields = ['team', 'season_year']
