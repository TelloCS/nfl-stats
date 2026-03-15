from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.cache import cache_page
from django_ratelimit.decorators import ratelimit
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.decorators import method_decorator
from .models import (
    Team,
    Player,
    PlayerGameStats,
)
from .pagination import PlayerGameStatsMatchupsPagination
from .serializers import (
    TeamSerializer,
    PlayerSerializer,
    PlayerStatsSerializer,
    TeamStatsSerializer,
    TeamRanksSerializer,
    PlayerGameStatsMatchupsSerializer,
    NFLScheduleSerializer
)
from .filters import (
    PlayerFilter,
    PlayerGameLogFilter,
    PlayerMatchupsFilter
)
from .mixins import KeyBasedCacheMixin
from .services.nfl_service import weekly_schedule


class TeamListAPIView(KeyBasedCacheMixin, generics.ListAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['nickname',]
    cache_timeout = 60 * 60 * 24

    def get_cache_key(self, request):
        cache_key = 'team_list'
        return cache_key

    @method_decorator(ratelimit(key='ip', rate='30/m', method='GET', block=True))
    def list(self, request, *args, **kwargs):
        cached_data = self.retrieve_from_cache(request)
        if cached_data:
            return Response(cached_data)

        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)

        data = {"teams": serializer.data}
        self.store_in_cache(request, data)
        return Response(data)


class PlayerListAPIView(generics.ListAPIView):
    queryset = Player.objects.select_related('team').all()
    serializer_class = PlayerSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = PlayerFilter
    pagination_class = None

    @method_decorator(cache_page(60 * 60 * 24))
    @method_decorator(ratelimit(key='ip', rate='30/m', method='GET', block=True))
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)

        return Response({
            'players': serializer.data
        })


class PlayerGameStatsRetrieveAPIView(KeyBasedCacheMixin, generics.RetrieveAPIView):
    queryset = Player.objects.select_related('team').all()
    serializer_class = PlayerStatsSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = PlayerGameLogFilter
    lookup_field = 'slug'

    def get_cache_key(self, request):
        slug = self.kwargs.get('slug')
        season = request.query_params.get('season_year', 'all')
        stype = request.query_params.get('season_type', 'all')
        return f"player_stats:{slug}:{season}:{stype}"

    @method_decorator(ratelimit(key='ip', rate='10/m', method='GET', block=True))
    def get(self, request, *args, **kwargs):
        cached_data = self.retrieve_from_cache(request)
        if cached_data:
            return Response(cached_data)

        response = super().get(request, *args, **kwargs)
        self.store_in_cache(request, response.data)
        return Response(response.data)


class TeamStatsListView(KeyBasedCacheMixin, generics.ListAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamStatsSerializer
    pagination_class = None
    cache_timeout = 60 * 60 * 24

    def get_cache_key(self, request):
        cache_key = 'team_stats'
        return cache_key

    def list(self, request, *args, **kwargs):
        cached_data = self.retrieve_from_cache(request)
        if cached_data:
            return Response(cached_data)

        response = super().list(request, *args, **kwargs)
        data = response.data
        self.store_in_cache(request, data)
        return Response(data)


class TeamRanksListView(KeyBasedCacheMixin, generics.ListAPIView):
    queryset = Team.objects.select_related('rank_snapshot').all()
    serializer_class = TeamRanksSerializer
    pagination_class = None
    cache_timeout = 60 * 60 * 24

    def get_cache_key(self, request):
        cache_key = 'team_ranks'
        return cache_key

    def list(self, request, *args, **kwargs):
        cached_data = self.retrieve_from_cache(request)
        if cached_data:
            return Response(cached_data)

        response = super().list(request, *args, **kwargs)
        data = response.data
        self.store_in_cache(request, data)
        return Response(data)


class PlayerGameStatsMatchupsListView(generics.ListAPIView):
    queryset = PlayerGameStats.objects.select_related(
        'player',
        'game',
        'team',
        'player__team',
        'game__homeTeam',
        'game__awayTeam'
    ).all()
    serializer_class = PlayerGameStatsMatchupsSerializer
    pagination_class = PlayerGameStatsMatchupsPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = PlayerMatchupsFilter

    @method_decorator(cache_page(60 * 60 * 24))
    @method_decorator(ratelimit(key='ip', rate='60/m', method='GET', block=True))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class NFLScheduleView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        data = weekly_schedule()

        if not data:
            return Response({'events': []}, status=200)

        serializer = NFLScheduleSerializer(data)
        return Response(serializer.data)
