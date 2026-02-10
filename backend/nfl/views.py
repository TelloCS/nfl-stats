from rest_framework import generics
from rest_framework.response import Response
from django.views.decorators.cache import cache_page
from django_ratelimit.decorators import ratelimit
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from .models import *
from .pagination import PlayerGameStatsMatchupsPagination
from .serializers import (
    TeamSerializer,
    PlayerSerializer,
    PlayerStatsSerializer,
    TeamStatsSerializer,
    TeamRanksSerializer,
    PlayerGameStatsMatchupsSerializer,
    GameSerializer
)
from .filters import (
    PlayerFilter,
    PlayerStatFilter,
    PlayerMatchupsFilter,
    UpcomingGameFilter
)

ONE_WEEK = 60 * 60 * 24 * 7

class TeamListAPIView(generics.ListAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['nickname',]

    @method_decorator(cache_page(ONE_WEEK))
    @method_decorator(ratelimit(key='ip', rate='30/m', method='GET', block=True))
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)

        data = {"teams": serializer.data}
        return Response(data)
          
class PlayerListAPIView(generics.ListAPIView):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = PlayerFilter
    pagination_class = None

    @method_decorator(cache_page(ONE_WEEK))
    @method_decorator(ratelimit(key='ip', rate='30/m', method='GET', block=True))
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'players': serializer.data
        })

class PlayerGameStatsRetrieveAPIView(generics.RetrieveAPIView):
    queryset = Player.objects.all()
    serializer_class = PlayerStatsSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = PlayerStatFilter
    lookup_field = 'slug'

    @method_decorator(cache_page(ONE_WEEK))
    @method_decorator(ratelimit(key='ip', rate='10/m', method='GET', block=True))
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

class TeamStatsListView(generics.ListAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamStatsSerializer
    pagination_class = None

    @method_decorator(cache_page(60 * 60)) 
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

class TeamRanksListView(generics.ListAPIView):
    queryset = Team.objects.select_related('rank_snapshot').all()
    serializer_class = TeamRanksSerializer
    pagination_class = None
    
    @method_decorator(cache_page(60 * 60)) 
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

class PlayerGameStatsMatchupsListView(generics.ListAPIView):
    queryset = PlayerGameStats.objects.all().select_related('player', 'game', 'player__team').order_by('-game__week', 'id')
    serializer_class = PlayerGameStatsMatchupsSerializer
    pagination_class = PlayerGameStatsMatchupsPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = PlayerMatchupsFilter

    @method_decorator(cache_page(ONE_WEEK))
    @method_decorator(ratelimit(key='ip', rate='60/m', method='GET', block=True))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

class EventListView(generics.ListAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    pagination_class = None
    filter_backends = [DjangoFilterBackend]
    filterset_class = UpcomingGameFilter

    @method_decorator(cache_page(ONE_WEEK))
    @method_decorator(ratelimit(key='ip', rate='10/m', method='GET', block=True))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)