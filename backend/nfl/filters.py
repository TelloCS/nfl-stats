from django_filters import FilterSet, CharFilter, DateFilter, NumberFilter
from django.db.models import Q
from .models import *
from pprint import pprint

class PlayerFilter(FilterSet):
    fullName = CharFilter(
        field_name='full_name',
        lookup_expr='icontains'
    )

    class Meta:
        model = Player
        fields = ['fullName']

# TESTING
class PlayerMatchupsFilter(FilterSet):
    class Meta:
        model = PlayerGameStats
        fields = ('position', 'opponent',)

    position = CharFilter(field_name='player__position', lookup_expr='exact')
    opponent = CharFilter(method='filter_by_opponent')

    def filter_by_opponent(self, queryset, name, opponent):
        print(opponent)
        return queryset.filter(
            Q(game__homeTeam__abbreviation=opponent) |
            Q(game__awayTeam__abbreviation=opponent)
        ).exclude(player__team__abbreviation=opponent)
    
# working on it 
class UpcomingGameFilter(FilterSet):
    week = NumberFilter(
        field_name='week',
        lookup_expr='exact'
    )

    status = CharFilter(
        field_name='status',
        lookup_expr='exact'
    )