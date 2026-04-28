from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.core.cache import cache
from django.views.decorators.cache import cache_page
from django_ratelimit.decorators import ratelimit
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.db.models import Prefetch, Max
from .models import (
    Team,
    Player,
    PlayerGameStats,
    TeamRankSnapshot,
    TeamOffensePassingStats
)
from .pagination import PlayerGameStatsMatchupsPagination
from .serializers import (
    TeamSerializerV1,
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
    PlayerMatchupsFilter,
    TeamRankFilter,
    TeamStatsFilter
)
from .mixins import KeyBasedCacheMixin
from .services.nfl_service import weekly_schedule
from nfl.utils import is_nfl_in_season


class TeamListAPIView(KeyBasedCacheMixin, generics.ListAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializerV1
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
    serializer_class = PlayerStatsSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = PlayerGameLogFilter
    cache_timeout = 60 * 60 * 24
    lookup_field = 'slug'

    def get_queryset(self):
        queryset = Player.objects.select_related(
            'team',
        ).distinct().all()

        season_year = self.request.query_params.get('season_year')
        season_type = self.request.query_params.get('season_type')
        player_slug = self.kwargs.get(self.lookup_field)

        stats_query = PlayerGameStats.objects.select_related(
            'player',
            'game',
            'game__homeTeam',
            'game__awayTeam',
        ).order_by('game__date')

        if not season_year:
            default_query = PlayerGameStats.objects.filter(
                player__slug=player_slug
            ).aggregate(max_year=Max('game__season_year'))

            season_year = default_query.get('max_year')

        if not season_type:
            season_type = 2

        if season_year:
            stats_query = stats_query.filter(game__season_year=season_year)
        if season_type:
            stats_query = stats_query.filter(game__season_type=season_type)

        prefetch = Prefetch('stats', queryset=stats_query)
        return queryset.prefetch_related(prefetch)

    def get_cache_key(self, request):
        player_slug = self.kwargs.get(self.lookup_field)
        season_year = self.request.query_params.get('season_year')
        season_type = self.request.query_params.get('season_type')
        return f"player_stats:{player_slug}:{season_year}:{season_type}"

    @method_decorator(ratelimit(key='ip', rate='10/m', method='GET', block=True))
    def get(self, request, *args, **kwargs):
        cached_data = self.retrieve_from_cache(request)
        if cached_data:
            return Response(cached_data)

        response = super().get(request, *args, **kwargs)
        self.store_in_cache(request, response.data)
        return Response(response.data)


class TeamStatsListView(KeyBasedCacheMixin, generics.ListAPIView):
    serializer_class = TeamStatsSerializer
    pagination_class = None
    cache_timeout = 60 * 60 * 24
    filter_backends = [DjangoFilterBackend]
    filterset_class = TeamStatsFilter

    def get_queryset(self):
        season_year = self.request.query_params.get('season_year')

        if season_year:
            selected_year = season_year
        else:
            max_year = TeamOffensePassingStats.objects.aggregate(Max('season_year'))['season_year__max']
            selected_year = max_year

        stat_relations = [
            'team_offense_passing', 'team_offense_rushing', 'team_offense_receiving',
            'team_defense_passing', 'team_defense_rushing', 'team_defense_receiving',
            'team_advance_offense', 'team_advance_defense', 'team_coverage_rates',
            'team_play_calling', 'team_coverage_stats_by_position'
        ]

        prefetches = [
            Prefetch(
                rel,
                queryset=getattr(Team, rel).field.model.objects.filter(season_year=selected_year),
                to_attr=f"prefetched_{rel}"
            ) for rel in stat_relations
        ]

        return Team.objects.prefetch_related(*prefetches).distinct()

    def get_cache_key(self, request):
        year = request.query_params.get('season_year', 'default')
        return f'team_stats_{year}'

    def list(self, request, *args, **kwargs):
        cached_data = self.retrieve_from_cache(request)
        if cached_data:
            return Response(cached_data)

        response = super().list(request, *args, **kwargs)
        self.store_in_cache(request, response.data)
        return response


class TeamRanksListView(KeyBasedCacheMixin, generics.ListAPIView):
    serializer_class = TeamRanksSerializer
    pagination_class = None
    cache_timeout = 60 * 60 * 24
    filter_backends = [DjangoFilterBackend]
    filterset_class = TeamRankFilter

    def get_queryset(self):
        year = self.request.query_params.get('season_year')
        snapshot_qs = TeamRankSnapshot.objects.filter(season_year__isnull=False)

        if year:
            snapshot_qs = snapshot_qs.filter(season_year=year)

        return Team.objects.prefetch_related(
            Prefetch(
                'rank_snapshot',
                queryset=snapshot_qs.order_by('-season_year'),
                to_attr='prefetched_snapshots'
            )
        ).all()

    def get_cache_key(self, request):
        year = request.query_params.get('season_year')
        cache_key = f'team_ranks_{year}'
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
        'game__awayTeam',
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


class ETLVersionView(KeyBasedCacheMixin, APIView):
    """
    Direct access to the 'Version Billboard' in Redis.
    No internal caching allowed—this must always be fresh.
    """
    def get(self, request, *args, **kwargs):
        version = cache.get("etl_version_ts", 0)

        return Response({
            'version': version,
            'in_season': is_nfl_in_season(),
            'time': timezone.now().isoformat()
        })
