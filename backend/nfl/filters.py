from django_filters import FilterSet, CharFilter, NumberFilter, ChoiceFilter
from django.db.models import Q, F
from .models import Player, PlayerGameStats


class PlayerFilter(FilterSet):
    fullName = CharFilter(
        field_name='full_name',
        lookup_expr='icontains'
    )

    class Meta:
        model = Player
        fields = ['fullName']


class PlayerGameLogFilter(FilterSet):
    season_year = NumberFilter(field_name='stats__game__season_year')
    season_type = NumberFilter(field_name='stats__game__season_type')

    class Meta:
        model = Player
        fields = ('season_year', 'season_type',)


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
        if not opponent:
            return queryset

        return queryset.filter(
            Q(game__homeTeam__abbreviation=opponent) |
            Q(game__awayTeam__abbreviation=opponent)
        ).exclude(team__abbreviation=opponent)

    def filter_by_location(self, queryset, name, value):
        if value == 'home':
            return queryset.filter(team_id=F('game__homeTeam'))
        elif value == 'away':
            return queryset.filter(team_id=F('game__awayTeam'))
        return queryset
