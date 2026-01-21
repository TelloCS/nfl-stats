from rest_framework import generics, viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import NotFound
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from django.core.cache import cache
from django.views.decorators.cache import cache_page
from django_ratelimit.decorators import ratelimit
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.core.cache import cache
from .pagination import *
from .serializers import *
from .filters import *
from django.db.models import F, Window, Prefetch
from django.db.models.functions import DenseRank

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
    
class TeamRetrieveAPIView(generics.RetrieveAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    lookup_field = 'slug'

    def retrieve(self, request, *args, **kwargs):
        isinstance = self.get_object()
        serializer = self.get_serializer(isinstance)

        return Response({
            "team": serializer.data
        })
          
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
    lookup_field = 'slug'

    @method_decorator(cache_page(ONE_WEEK))
    @method_decorator(ratelimit(key='ip', rate='10/m', method='GET', block=True))
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({'players': serializer.data})

class TeamStatsRetrieveAPIView(generics.RetrieveAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamStatsSerializer
    lookup_field = 'slug'

    def retrieve(self, request, *args, **kwargs):
        isinstance = self.get_object()
        serializer = self.get_serializer(isinstance)
        data = {"team": serializer.data}
        return Response(data)

class TeamRanksListView(generics.ListAPIView):
    serializer_class = TeamRanksSerializer
    pagination_class = None

    @method_decorator(cache_page(ONE_WEEK))
    @method_decorator(ratelimit(key='ip', rate='10/m', method='GET', block=True))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        queryset = Team.objects.all()

        top = TeamOffensePassingStats.objects.annotate(
            off_pass_yards_rank=Window(
                expression=DenseRank(),
                order_by=F('pass_yards').desc()
            ),
            off_pass_tds_rank=Window(
                expression=DenseRank(),
                order_by=F('pass_touchdowns').desc()
            ),
            off_pass_rating_rank=Window(
                expression=DenseRank(),
                order_by=F('pass_rating').desc()
            ),
        )

        toru = TeamOffenseRushingStats.objects.annotate(
            off_rush_yards_rank=Window(
                expression=DenseRank(),
                order_by=F('rush_yards').desc()
            ),
            off_rush_tds_rank=Window(
                expression=DenseRank(),
                order_by=F('rush_touchdowns').desc()
            ),
            off_rush_attempts_rank=Window(
                expression=DenseRank(),
                order_by=F('rush_attempts').desc()
            ),
        )

        tore = TeamOffenseReceivingStats.objects.annotate(
            off_receptions_rank=Window(
                expression=DenseRank(),
                order_by=F('receptions').desc()
            ),
            off_rec_yards_rank=Window(
                expression=DenseRank(),
                order_by=F('rec_yards').desc()
            ),
            off_rec_tds_rank=Window(
                expression=DenseRank(),
                order_by=F('rec_touchdowns').desc()
            ),
        )
        
        tdp = TeamDefensePassingStats.objects.annotate(
            def_pass_yards_rank=Window(
                expression=DenseRank(),
                order_by=F('pass_yards').asc()
            ),
            def_pass_tds_rank=Window(
                expression=DenseRank(),
                order_by=F('pass_touchdowns').asc()
            ),
            def_pass_rating_rank=Window(
                expression=DenseRank(),
                order_by=F('pass_rating').asc()
            ),
        )

        tdru = TeamDefenseRushingStats.objects.annotate(
            def_rush_yards_rank=Window(
                expression=DenseRank(),
                order_by=F('rush_yards').asc()
            ),
            def_rush_tds_rank=Window(
                expression=DenseRank(),
                order_by=F('rush_touchdowns').asc()
            ),
            def_rush_attempts_rank=Window(
                expression=DenseRank(),
                order_by=F('rush_attempts').asc()
            ),
        )
        
        tdre = TeamDefenseReceivingStats.objects.annotate(
            def_receptions_rank=Window(
                expression=DenseRank(),
                order_by=F('receptions').asc()
            ),
            def_rec_yards_rank=Window(
                expression=DenseRank(),
                order_by=F('rec_yards').asc()
            ),
            def_rec_tds_rank=Window(
                expression=DenseRank(),
                order_by=F('rec_touchdowns').asc()
            ),
            def_pass_defended_rank=Window(
                expression=DenseRank(),
                order_by=F('pass_defended').asc()
            ),
        )

        tao = TeamAdvanceOffenseStats.objects.annotate(
            off_expected_points_added_per_play_rank=Window(
                expression=DenseRank(),
                order_by=F('expected_points_added_per_play').desc()
            ),
            off_expected_points_added_per_pass_rank=Window(
                expression=DenseRank(),
                order_by=F('expected_points_added_per_pass').desc()
            ),
            off_expected_points_added_per_rush_rank=Window(
                expression=DenseRank(),
                order_by=F('expected_points_added_per_rush').desc()
            ),
        )

        ads = TeamAdvanceDefenseStats.objects.annotate(
            def_expected_points_added_per_play_rank=Window(
                expression=DenseRank(),
                order_by=F('expected_points_added_per_play').asc()
            ),
            def_expected_points_added_allowed_per_pass_rank=Window(
                expression=DenseRank(),
                order_by=F('expected_points_added_allowed_per_pass').asc()
            ),
            def_expected_points_added_allowed_per_rush_rank=Window(
                expression=DenseRank(),
                order_by=F('expected_points_added_allowed_per_rush').asc()
            ),
        )

        tcss = TeamCoverageSchemeStats.objects.annotate(
            man_rate_rank=Window(
                expression=DenseRank(),
                order_by=F('man_rate').desc()
            ),
            zone_rate_rank=Window(
                expression=DenseRank(),
                order_by=F('zone_rate').desc()
            ),
            middle_closed_rate_rank=Window(
                expression=DenseRank(),
                order_by=F('middle_closed_rate').desc()
            ),
            middle_open_rate_rank=Window(
                expression=DenseRank(),
                order_by=F('middle_open_rate').desc()
            ),
        )

        topcs = TeamOffensePlayCallingStats.objects.annotate(
            motion_rate_rank=Window(
                expression=DenseRank(),
                order_by=F('motion_rate').desc()
            ),
            play_action_rate_rank=Window(
                expression=DenseRank(),
                order_by=F('play_action_rate').desc()
            ),
            shotgun_rate_rank=Window(
                expression=DenseRank(),
                order_by=F('shotgun_rate').desc()
            ),
            nohuddle_rate_rank=Window(
                expression=DenseRank(),
                order_by=F('nohuddle_rate').desc()
            ),
        )

        tcsbp = TeamCoverageStatsByPosition.objects.annotate(
            yards_allowed_wr_rank=Window(
                expression=DenseRank(),
                order_by=F('yards_allowed_wr').asc(),
            ),
            yards_allowed_te_rank=Window(
                expression=DenseRank(),
                order_by=F('yards_allowed_te').asc()
            ),
                yards_allowed_rb_rank=Window(
                expression=DenseRank(),
                order_by=F('yards_allowed_rb').asc()
            ),
                yards_allowed_outside_rank=Window(
                expression=DenseRank(),
                order_by=F('yards_allowed_outside').asc()
            ),
                yards_allowed_slot_rank=Window(
                expression=DenseRank(),
                order_by=F('yards_allowed_slot').asc()
            ),
        )

        queryset = queryset.prefetch_related(
            Prefetch('team_offense_passing', queryset=top),
            Prefetch('team_offense_rushing', queryset=toru),
            Prefetch('team_offense_receiving', queryset=tore),
            Prefetch('team_defense_passing', queryset=tdp),
            Prefetch('team_defense_rushing', queryset=tdru),
            Prefetch('team_defense_receiving', queryset=tdre),
            Prefetch('team_advance_offense', queryset=tao),
            Prefetch('team_advance_defense', queryset=ads),
            Prefetch('team_coverage_rates', queryset=tcss),
            Prefetch('team_play_calling', queryset=topcs),
            Prefetch('team_coverage_stats_by_position', queryset=tcsbp)
        )
        
        return queryset

# TESTING
class PlayerGameStatsMatchupsListView(generics.ListAPIView):
    queryset = PlayerGameStats.objects.all()
    serializer_class = GameTest
    pagination_class = None
    filter_backends = [DjangoFilterBackend]
    filterset_class = PlayerMatchupsFilter

    @method_decorator(cache_page(ONE_WEEK))
    @method_decorator(ratelimit(key='ip', rate='10/m', method='GET', block=True))
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