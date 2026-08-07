import hashlib
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, NotFound
from drf_orjson_renderer.renderers import ORJSONRenderer
from django.core.cache import cache
from django.views.decorators.cache import never_cache
from django_ratelimit.decorators import ratelimit
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.db.models import Max, Prefetch, prefetch_related_objects
from .models import (
    Team,
    Game,
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
    TeamRanksSerializerV2,
    PlayerGameStatsMatchupsSerializer,
    PlayerCareerStatsSerializer,
    PlayerTeammatesSerializer,
    GameSerializer,
    NFLScheduleSerializer
)
from .filters import (
    PlayerFilter,
    PlayerMatchupsFilter,
    TeamRankFilter,
    TeamStatsFilter,
    PlayerSeasonStatsFilter,
    PlayerVsUpcomingMatchupFilter,
    PlayerTeammatesFilter,
    GameScheduleFilter
)
from .mixins import KeyBasedCacheMixin
from nfl.utils import is_nfl_in_season, get_current_etl_version


class TeamRetrieveAPIView(KeyBasedCacheMixin, generics.RetrieveAPIView):
    renderer_classes = [ORJSONRenderer]
    serializer_class = TeamSerializerV1
    lookup_field = 'slug'

    def get_cache_key(self, request):
        v = get_current_etl_version()
        cache_key = f'team_retrieve:v{v}:{request.get_full_path()}'
        return cache_key

    @method_decorator(ratelimit(key='ip', rate='20/m', method='GET', block=True))
    def get(self, request, *args, **kwargs):
        cached_data = self.retrieve_from_cache(request)

        if cached_data:
            return Response(cached_data)

        response = super().get(request, *args, **kwargs)
        self.store_in_cache(request, response.data)
        return response

    def get_queryset(self):
        return Team.objects.all()


class TeamRosterListAPIView(KeyBasedCacheMixin, generics.ListAPIView):
    renderer_classes = [ORJSONRenderer]
    serializer_class = PlayerSerializer
    pagination_class = None

    def get_cache_key(self, request):
        v = get_current_etl_version()
        cache_key = f'team_roster:v{v}:{request.get_full_path()}'
        return cache_key

    @method_decorator(ratelimit(key='ip', rate='20/m', method='GET', block=True))
    def list(self, request, *args, **kwargs):
        cached_data = self.retrieve_from_cache(request)

        if cached_data:
            return Response(cached_data)

        response = super().list(request, *args, **kwargs)
        self.store_in_cache(request, response.data)
        return response

    def get_queryset(self):
        team_slug = self.kwargs.get('team_slug')
        return Player.objects.filter(team__slug=team_slug).select_related('team')


class TeamRanksListAPIView(KeyBasedCacheMixin, generics.ListAPIView):
    renderer_classes = [ORJSONRenderer]
    serializer_class = TeamRanksSerializerV2
    filter_backends = [DjangoFilterBackend]
    pagination_class = None

    def get_cache_key(self, request):
        v = get_current_etl_version()
        cache_key = f'team_ranks:v{v}:{request.get_full_path()}'
        return cache_key

    @method_decorator(ratelimit(key='ip', rate='20/m', method='GET', block=True))
    def list(self, request, *args, **kwargs):
        cached_data = self.retrieve_from_cache(request)

        if cached_data:
            return Response(cached_data)

        response = super().list(request, *args, **kwargs)
        self.store_in_cache(request, response.data)
        return response

    def get_queryset(self):
        team_slug = self.kwargs.get('team_slug')

        return TeamRankSnapshot.objects.filter(
            team__slug=team_slug
        ).select_related('team').order_by('season_year')


class TeamListAPIView(KeyBasedCacheMixin, generics.ListAPIView):
    renderer_classes = [ORJSONRenderer]
    queryset = Team.objects.all()
    serializer_class = TeamSerializerV1
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['nickname',]
    cache_timeout = 60 * 60 * 24

    def get_cache_key(self, request):
        v = get_current_etl_version()
        cache_key = f'team_list:v{v}:{request.get_full_path()}'
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
    renderer_classes = [ORJSONRenderer]
    queryset = Player.objects.select_related('team')
    serializer_class = PlayerSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = PlayerFilter
    pagination_class = None
    cache_timeout = 60 * 60 * 24

    def get_cache_key(self, request):
        v = get_current_etl_version()
        cache_key = f"player_list:v{v}:{request.get_full_path()}"
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
    renderer_classes = [ORJSONRenderer]
    serializer_class = PlayerStatsSerializer
    cache_timeout = 60 * 60 * 24
    lookup_field = 'pk'

    def get_object(self):
        pk = self.kwargs.get(self.lookup_field)
        slug = self.kwargs.get('slug')

        try:
            player = Player.objects.select_related('team').get(pk=pk, slug=slug)
        except Player.DoesNotExist:
            raise NotFound("Player not found.")

        available_seasons = list(
            PlayerGameStats.objects.filter(player_id=pk)
            .values_list('game__season_year', flat=True)
            .distinct()
            .order_by('-game__season_year')
        )

        param_year = self.request.query_params.get('season_year')
        param_type = self.request.query_params.get('season_type', 2)

        try:
            season_year = int(param_year)
        except (ValueError, TypeError):
            if available_seasons:
                season_year = available_seasons[0]
            else:
                global_max = PlayerGameStats.objects.aggregate(max_year=Max('game__season_year'))
                season_year = global_max['max_year']

        try:
            season_type = int(param_type)
        except (ValueError, TypeError):
            season_type = 2

        if not available_seasons:
            queryset = PlayerGameStats.objects.none()
        else:
            queryset = PlayerGameStats.objects.filter(
                game__season_year=season_year,
                game__season_type=season_type
            ).select_related(
                'game',
                'game__homeTeam',
                'game__awayTeam',
                'team'
            ).order_by('game__week')

        prefetch_related_objects([player], Prefetch('stats', queryset=queryset))

        player.available_seasons = available_seasons
        player.active_season = season_year
        return player

    def get_cache_key(self, request):
        v = get_current_etl_version()
        return f"player_stats:v{v}:{request.get_full_path()}"

    @method_decorator(ratelimit(key='ip', rate='10/m', method='GET', block=True))
    def get(self, request, *args, **kwargs):
        cached_data = self.retrieve_from_cache(request)
        if cached_data:
            return Response(cached_data)

        response = super().get(request, *args, **kwargs)
        self.store_in_cache(request, response.data)
        return response


class TeamStatsListView(KeyBasedCacheMixin, generics.ListAPIView):
    renderer_classes = [ORJSONRenderer]
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
        v = get_current_etl_version()
        return f'team_stats:v{v}:{request.get_full_path()}'

    def list(self, request, *args, **kwargs):
        cached_data = self.retrieve_from_cache(request)
        if cached_data:
            return Response(cached_data)

        response = super().list(request, *args, **kwargs)
        self.store_in_cache(request, response.data)
        return response


class TeamRanksListView(KeyBasedCacheMixin, generics.ListAPIView):
    renderer_classes = [ORJSONRenderer]
    serializer_class = TeamRanksSerializer
    pagination_class = None
    cache_timeout = 60 * 60 * 24
    filter_backends = [DjangoFilterBackend]
    filterset_class = TeamRankFilter

    def get_queryset(self):
        return TeamRankSnapshot.objects.select_related('team')

    def get_cache_key(self, request):
        v = get_current_etl_version()
        cache_key = f'team_ranks_:v{v}:{request.get_full_path()}'
        return cache_key

    def list(self, request, *args, **kwargs):
        cached_data = self.retrieve_from_cache(request)
        if cached_data:
            return Response(cached_data)

        response = super().list(request, *args, **kwargs)
        self.store_in_cache(request, response.data)
        return response


class PlayerGameStatsMatchupsListView(KeyBasedCacheMixin, generics.ListAPIView):
    renderer_classes = [ORJSONRenderer]
    renderer_classes = [ORJSONRenderer]
    serializer_class = PlayerGameStatsMatchupsSerializer
    pagination_class = PlayerGameStatsMatchupsPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = PlayerMatchupsFilter
    cache_timeout = 60 * 60 * 24

    def get_queryset(self):
        return PlayerGameStats.objects.select_related(
            'player',
            'game',
            'team',
            'game__homeTeam',
            'game__awayTeam',
        )

    def paginate_queryset(self, queryset):
        all_data: str = self.request.query_params.get('allData') == 'true'

        if all_data:
            if not self.request.user.is_authenticated:
                raise PermissionDenied("Authentication is required to fetch all data.")
            return None

        return super().paginate_queryset(queryset)

    def get_cache_key(self, request):
        v = get_current_etl_version()
        cache_key = f"matchups:v{v}:{request.get_full_path()}"
        return cache_key

    @method_decorator(ratelimit(key='ip', rate='60/m', method='GET', block=True))
    def list(self, request, *args, **kwargs):
        if not request.query_params.get('opponent'):
            return Response([])

        cached_data = self.retrieve_from_cache(request)
        if cached_data:
            return Response(cached_data)

        response = super().list(request, *args, **kwargs)
        self.store_in_cache(request, response.data)
        return response


class PlayerSeasonStatsListView(KeyBasedCacheMixin, generics.ListAPIView):
    renderer_classes = [ORJSONRenderer]
    serializer_class = PlayerSeasonStatsSerializer
    pagination_class = PlayerGameStatsMatchupsPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = PlayerSeasonStatsFilter

    def get_queryset(self):
        return PlayerSeasonStats.objects.select_related(
            'player',
            'historic_team'
        )

    def get_cache_key(self, request):
        v = get_current_etl_version()
        return f"player_season_stats:v{v}:{request.get_full_path()}"

    @method_decorator(ratelimit(key='ip', rate='20/m', method='GET', block=True))
    def list(self, request, *args, **kwargs):
        cached_data = self.retrieve_from_cache(request)
        if cached_data:
            return Response(cached_data)

        response = super().list(request, *args, **kwargs)
        self.store_in_cache(request, response.data)
        return response


class PlayerVsUpcomingMatchupStatsView(KeyBasedCacheMixin, generics.ListAPIView):
    renderer_classes = [ORJSONRenderer]
    serializer_class = PlayerGameStatsMatchupsSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = PlayerVsUpcomingMatchupFilter
    pagination_class = None

    @method_decorator(ratelimit(key='ip', rate='20/m', method='GET', block=True))
    def list(self, request, *args, **kwargs):
        if not request.query_params.get('team'):
            return Response([])

        cached_data = self.retrieve_from_cache(request)
        if cached_data:
            return Response(cached_data)

        response = super().list(request, *args, **kwargs)
        self.store_in_cache(request, response.data)
        return response

    def get_cache_key(self, request):
        v = get_current_etl_version()
        return f"player_vs:v{v}:{request.get_full_path()}"

    def get_queryset(self):
        player_id = self.kwargs.get('pk')
        queryset = PlayerGameStats.objects.filter(player_id=player_id)

        return queryset.select_related(
            'player', 'game', 'team', 'game__homeTeam', 'game__awayTeam'
        ).order_by('-game__season_year', '-game__week')


class PlayerFantasyRankingsView(KeyBasedCacheMixin, generics.ListAPIView):
    renderer_classes = [ORJSONRenderer]
    serializer_class = PlayerCareerStatsSerializer
    pagination_class = None

    @method_decorator(ratelimit(key='ip', rate='20/m', method='GET', block=True))
    def list(self, request, *args, **kwargs):
        cached_data = self.retrieve_from_cache(request)
        if cached_data:
            return Response(cached_data)

        response = super().list(request, *args, **kwargs)
        self.store_in_cache(request, response.data)
        return response

    def get_cache_key(self, request):
        v, pk = get_current_etl_version(), self.kwargs.get('pk')
        return f"player_rankings:v{v}:{pk}:{request.get_full_path()}"

    def get_queryset(self):
        player_id = self.kwargs.get('pk')

        return PlayerSeasonStats.objects.filter(
            player_id=player_id
        ).select_related(
            'player',
            'historic_team'
        ).order_by('-season_year')


class PlayerTeammatesListAPIView(KeyBasedCacheMixin, generics.ListAPIView):
    renderer_classes = [ORJSONRenderer]
    filter_backends = [DjangoFilterBackend]
    filterset_class = PlayerTeammatesFilter
    pagination_class = None

    def get_cache_key(self, request):
        v = get_current_etl_version()
        return f'player_teammates:v{v}:{request.get_full_path()}'

    @method_decorator(ratelimit(key='ip', rate='20/m', method='GET', block=True))
    def list(self, request, *args, **kwargs):
        cached_data = self.retrieve_from_cache(request)
        if cached_data:
            return Response(cached_data)

        team = request.query_params.get("team")
        season_year = request.query_params.get("season_year")

        if not team:
            return Response({
                "detail": "'team' query parameter is required."
            }, status=400)

        if not season_year:
            default_max_year = PlayerGameStats.objects.filter(
                team__abbreviation=team
            ).aggregate(season_year=Max('game__season_year'))

            season_year = default_max_year['season_year']

        queryset = self.filter_queryset(
            self.get_queryset().filter(game__season_year=season_year)
        )

        results = list(queryset)

        if not results:
            response_data = Response({
                "team": None,
                "players": [],
            })

            self.store_in_cache(request, response_data)
            return Response(response_data)

        serializer = PlayerTeammatesSerializer({
            'team': results[0].team,
            'players': [stat.player for stat in results]
        })

        response_data = serializer.data
        self.store_in_cache(request, response_data)
        return Response(response_data)

    def get_queryset(self):
        return PlayerGameStats.objects.select_related(
            'team',
            'player'
        ).order_by("player_id", "game_id").distinct("player_id")


class HistoricNFLSchedulesListAPIView(KeyBasedCacheMixin, generics.ListAPIView):
    renderer_classes = [ORJSONRenderer]
    serializer_class = GameSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = GameScheduleFilter
    pagination_class = None

    def get_queryset(self):
        return Game.objects.select_related('homeTeam', 'awayTeam').order_by('date')

    def get_cache_key(self, request):
        v = get_current_etl_version()
        param_str = f"slates:v{v}:{request.get_full_path()}"
        param_hash = hashlib.md5(param_str.encode('utf-8')).hexdigest()
        return param_hash

    @method_decorator(ratelimit(key='ip', rate='20/m', method='GET', block=True))
    def list(self, request, *args, **kwargs):
        cached_data = self.retrieve_from_cache(request)
        if cached_data:
            return Response(cached_data)

        season_types = list(
            Game.objects.order_by('season_type')
            .values_list('season_type', flat=True)
            .distinct()
        )

        season_years = list(
            Game.objects.order_by('season_year')
            .values_list('season_year', flat=True)
            .distinct()
        )

        season_type = request.query_params.get('season_type')
        season_year = request.query_params.get('season_year')

        if not season_type:
            season_type = 2
        if not season_year:
            season_year = max(season_years) if season_years else None

        weeks = list(
            Game.objects.filter(season_type=season_type, season_year=season_year)
            .order_by('week')
            .values_list('week', flat=True)
            .distinct()
        )

        week = request.query_params.get('week')
        if not week or int(week) not in weeks:
            week = max(weeks) if weeks else None

        query_params = request.query_params.copy()
        query_params['season_type'] = season_type
        query_params['season_year'] = season_year
        query_params['week'] = week

        filterset = GameScheduleFilter(query_params, queryset=self.get_queryset())
        queryset = filterset.qs

        serializer = self.get_serializer(queryset, many=True)

        data = {
            'current': {
                'season_year': season_year,
                'season_type': season_type,
                'week': week,
            },
            'season_types': season_types,
            'season_years': season_years,
            'weeks': weeks,
            'games': serializer.data,
        }
        self.store_in_cache(request, data)
        return Response(data)


class NFLScheduleView(APIView):
    permission_classes = (AllowAny,)

    @method_decorator(never_cache)
    def get(self, request):
        data = cache.get("weekly_schedule")
        if not data:
            return Response({'events': []}, status=200)

        next_update = data.pop("next_update_at", None)
        serializer = NFLScheduleSerializer(data)
        response = Response(serializer.data)

        if next_update:
            response["X-Next-Update-At"] = next_update

        return response


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
