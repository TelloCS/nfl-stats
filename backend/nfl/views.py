from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.core.cache import cache
from django.views.decorators.cache import never_cache
from django_ratelimit.decorators import ratelimit
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404
from django.db.models import Prefetch, prefetch_related_objects
from django.db.models import Q
from .models import (
    Team,
    Player,
    PlayerGameStats,
    PlayerSeasonStats,
    TeamRankSnapshot,
    TeamOffensePassingStats,
    GlobalMetadata
)
from .pagination import PlayerGameStatsMatchupsPagination
from .serializers import (
    TeamSerializerV1,
    PlayerSerializer,
    PlayerStatsSerializer,
    PlayerSeasonStatsSerializer,
    TeamStatsSerializer,
    TeamRanksSerializer,
    PlayerGameStatsMatchupsSerializer,
    PlayerCareerStatsSerializer,
    NFLScheduleSerializer
)
from .filters import (
    PlayerFilter,
    PlayerGameLogFilter,
    PlayerMatchupsFilter,
    TeamRankFilter,
    TeamStatsFilter,
    PlayerSeasonStatsFilter
)
from .mixins import KeyBasedCacheMixin
from nfl.utils import is_nfl_in_season, get_current_etl_version


class TeamListAPIView(KeyBasedCacheMixin, generics.ListAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializerV1
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['nickname',]
    cache_timeout = 60 * 60 * 24

    def get_cache_key(self, request):
        version = get_current_etl_version()
        cache_key = f'team_list:v{version}'
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


class PlayerListAPIView(KeyBasedCacheMixin, generics.ListAPIView):
    queryset = Player.objects.select_related('team').all()
    serializer_class = PlayerSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = PlayerFilter
    pagination_class = None
    cache_timeout = 60 * 60 * 24

    def get_cache_key(self, request):
        version = get_current_etl_version()
        cache_key = f"player_list:v{version}:{request.get_full_path()}"
        return cache_key

    @method_decorator(ratelimit(key='ip', rate='30/m', method='GET', block=True))
    def list(self, request, *args, **kwargs):
        cached_data = self.retrieve_from_cache(request)
        if cached_data:
            return Response(cached_data)

        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        data = {'players': serializer.data}

        self.store_in_cache(request, data)
        return Response(data)


class PlayerGameStatsRetrieveAPIView(KeyBasedCacheMixin, generics.RetrieveAPIView):
    serializer_class = PlayerStatsSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = PlayerGameLogFilter
    cache_timeout = 60 * 60 * 24
    lookup_field = 'pk'

    def get_queryset(self):
        return Player.objects.select_related('team').all()

    def get_object(self):
        queryset = self.get_queryset()
        filter_kwargs = {self.lookup_field: self.kwargs.get('pk'), 'slug': self.kwargs.get('slug')}
        obj = get_object_or_404(queryset, **filter_kwargs)

        season_year = self.request.query_params.get('season_year')
        season_type = self.request.query_params.get('season_type', 2)

        obj.available_seasons = list(
            PlayerGameStats.objects.filter(player=obj)
            .values_list('game__season_year', flat=True)
            .distinct().order_by('-game__season_year')
        )

        stats_query = PlayerGameStats.objects.select_related(
            'player',
            'game',
            'game__homeTeam',
            'game__awayTeam',
        ).order_by('game__date')

        if not season_year and obj.available_seasons:
            season_year = obj.available_seasons[0]

        if season_year:
            stats_query = stats_query.filter(game__season_year=season_year)

        stats_query = stats_query.filter(game__season_type=season_type)

        prefetch_related_objects([obj], Prefetch('stats', queryset=stats_query))

        obj.active_season_value = season_year

        return obj

    def get_cache_key(self, request):
        version = get_current_etl_version()
        pk = self.kwargs.get(self.lookup_field)
        syear = self.request.query_params.get('season_year', 'latest')
        stype = self.request.query_params.get('season_type', '2')
        return f"player_stats:{pk}:{syear}:{stype}:v{version}"

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

        if not season_year:
            latest_stat = TeamOffensePassingStats.objects.only('season_year').order_by('-season_year').first()
            selected_year = latest_stat
        else:
            selected_year = season_year

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
        version = get_current_etl_version()
        year = request.query_params.get('season_year', 'default')
        return f'team_stats_{year}:v{version}'

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
        version = get_current_etl_version()
        year = request.query_params.get('season_year')
        cache_key = f'team_ranks_{year}:v{version}'
        return cache_key

    def list(self, request, *args, **kwargs):
        cached_data = self.retrieve_from_cache(request)
        if cached_data:
            return Response(cached_data)

        response = super().list(request, *args, **kwargs)
        data = response.data
        self.store_in_cache(request, data)
        return Response(data)


class PlayerGameStatsMatchupsListView(KeyBasedCacheMixin, generics.ListAPIView):
    queryset = PlayerGameStats.objects.select_related(
        'player',
        'game',
        'team',
        'game__homeTeam',
        'game__awayTeam',
    ).all()
    serializer_class = PlayerGameStatsMatchupsSerializer
    pagination_class = PlayerGameStatsMatchupsPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = PlayerMatchupsFilter
    cache_timeout = 60 * 60 * 24

    def get_cache_key(self, request):
        v = get_current_etl_version()
        cache_key = f"matchups:v{v}:{request.get_full_path()}"
        return cache_key

    @method_decorator(ratelimit(key='ip', rate='60/m', method='GET', block=True))
    def list(self, request, *args, **kwargs):
        all_data = request.query_params.get('allData') == 'true'

        if all_data and not request.user.is_authenticated:
            raise PermissionDenied("Authenticated account required for full trend analysis.")

        if all_data:
            self.pagination_class = None

        cached_data = self.retrieve_from_cache(request)
        if cached_data:
            return Response(cached_data)

        response = super().list(request, *args, **kwargs)
        self.store_in_cache(request, response.data)
        return Response(response.data)


class PlayerSeasonStatsListView(KeyBasedCacheMixin, generics.ListAPIView):
    serializer_class = PlayerSeasonStatsSerializer
    pagination_class = PlayerGameStatsMatchupsPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = PlayerSeasonStatsFilter

    def get_queryset(self):
        season_year = self.request.query_params.get('season_year')
        season_type = self.request.query_params.get('season_type')
        ordering = self.request.query_params.get('ordering')

        queryset = PlayerSeasonStats.objects.select_related(
            'player',
            'historic_team'
        ).filter(
            season_year=season_year,
            season_type=season_type
        )

        if ordering:
            queryset = queryset.order_by(ordering)

        return queryset

    def get_cache_key(self, request):
        v = get_current_etl_version()
        return f"player_season_stats:v{v}:{request.get_full_path()}"

    @method_decorator(ratelimit(key='ip', rate='20/m', method='GET', block=True))
    def get(self, request, *args, **kwargs):
        cached_data = self.retrieve_from_cache(request)
        if cached_data:
            return Response(cached_data)

        response = super().get(request, *args, **kwargs)
        self.store_in_cache(request, response.data)
        return Response(response.data)


class PlayerVsUpcomingMatchupStatsView(KeyBasedCacheMixin, generics.ListAPIView):
    serializer_class = PlayerGameStatsMatchupsSerializer
    pagination_class = None
    ordering = ['-date']

    @method_decorator(ratelimit(key='ip', rate='20/m', method='GET', block=True))
    def list(self, request, *args, **kwargs):
        team_abbr = self.request.query_params.get('team')
        if not team_abbr:
            return Response({"detail": "no matchup available"})

        cached_data = self.retrieve_from_cache(request)
        if cached_data:
            return Response(cached_data)

        response = super().list(request, *args, **kwargs)
        self.store_in_cache(request, response.data)
        return Response(response.data)

    def get_cache_key(self, request):
        v = get_current_etl_version()
        return f"player_vs:v{v}:{request.get_full_path()}"

    def get_queryset(self):
        player_id = self.kwargs.get('pk')
        team_abbr = self.request.query_params.get('team')

        if not team_abbr:
            return PlayerGameStats.objects.none()

        return PlayerGameStats.objects.filter(
            player_id=player_id
        ).filter(
            Q(game__homeTeam__abbreviation__iexact=team_abbr) |
            Q(game__awayTeam__abbreviation__iexact=team_abbr)
        ).select_related(
            'player', 'game', 'team', 'game__homeTeam', 'game__awayTeam'
        )


class PlayerFantasyRankingsView(KeyBasedCacheMixin, generics.ListAPIView):
    serializer_class = PlayerCareerStatsSerializer
    pagination_class = None

    @method_decorator(ratelimit(key='ip', rate='20/m', method='GET', block=True))
    def get(self, request, *args, **kwargs):
        cached_data = self.retrieve_from_cache(request)
        if cached_data:
            return Response(cached_data)

        response = super().get(request, *args, **kwargs)
        self.store_in_cache(request, response.data)
        return Response(response.data)

    def get_cache_key(self, request):
        v = get_current_etl_version()
        player_id = self.kwargs.get('pk')
        return f"player_rankings:v{v}:{player_id}:{request.get_full_path()}"

    def get_queryset(self):
        player_id = self.kwargs.get('pk')

        return PlayerSeasonStats.objects.filter(
            player_id=player_id
        ).select_related(
            'player',
            'historic_team'
        ).order_by('-season_year')


class NFLScheduleView(APIView):
    permission_classes = (AllowAny,)

    @method_decorator(never_cache)
    def get(self, request):
        data = cache.get("weekly_schedule")
        if not data:
            return Response({'events': []}, status=200)

        serializer = NFLScheduleSerializer(data)
        return Response(serializer.data)


class ETLVersionView(KeyBasedCacheMixin, APIView):
    """
    Direct access to the 'Version Billboard' in Redis.
    No internal caching allowed—this must always be fresh.
    """
    @method_decorator(never_cache)
    def get(self, request, *args, **kwargs):
        version = cache.get("etl_version_ts")

        if version is None:
            meta_record = GlobalMetadata.objects.filter(key="etl_version_ts").first()
            if meta_record:
                version = int(meta_record.value)
                cache.set("etl_version_ts", version, timeout=None)
            else:
                version = 0

        return Response({
            'version': version,
            'in_season': is_nfl_in_season(),
            'time': timezone.now().isoformat()
        })
