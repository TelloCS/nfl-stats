from django_filters import FilterSet, CharFilter, NumberFilter, ChoiceFilter
from django.db.models import Q, F, Prefetch
from .models import Player, PlayerGameStats

class PlayerFilter(FilterSet):
    fullName = CharFilter(
        field_name='full_name',
        lookup_expr='icontains'
    )

    class Meta:
        model = Player
        fields = ['fullName']

class PlayerStatFilter(FilterSet):
    season_year = NumberFilter(field_name='stats__game__season_year')
    season_type = NumberFilter(field_name='stats__game__season_type')
    location = ChoiceFilter(choices=[('home', 'Home'), ('away', 'Away')])

    class Meta:
        model = Player
        fields = []

    def filter_queryset(self, queryset):
        year = self.request.query_params.get('season_year')
        stype = self.request.query_params.get('season_type')
        loc = self.request.query_params.get('location')

        stats_filter = PlayerGameStats.objects.select_related('game')

        if year:
            stats_filter = stats_filter.filter(game__season_year=year)
        
        if stype:
            stats_filter = stats_filter.filter(game__season_type=stype)

        if loc == 'home':
            stats_filter = stats_filter.filter(player__team=F('game__homeTeam'))
        elif loc == 'away':
            stats_filter = stats_filter.filter(player__team=F('game__awayTeam'))

        return queryset.prefetch_related(
            Prefetch(
                'stats', 
                queryset=stats_filter
            )
        ).distinct()

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
        if not opponent: return queryset

        return queryset.filter(
            Q(game__homeTeam__abbreviation=opponent) |
            Q(game__awayTeam__abbreviation=opponent)
        ).exclude(player__team__abbreviation=opponent)
    
    def filter_by_location(self, queryset, name, value):
        if value == 'home':
            return queryset.filter(player__team=F('game__homeTeam'))
        elif value == 'away':
            return queryset.filter(player__team=F('game__awayTeam'))
        return queryset
    
class UpcomingGameFilter(FilterSet):
    week = NumberFilter(
        field_name='week',
        lookup_expr='exact'
    )

    status = CharFilter(
        field_name='status',
        lookup_expr='exact'
    )