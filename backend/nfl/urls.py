from django.urls import path
from .views import (
    TeamListAPIView,
    TeamStatsListView,
    TeamRanksListView,
    PlayerListAPIView,
    PlayerGameStatsRetrieveAPIView,
    PlayerGameStatsMatchupsListView,
    PlayerSeasonStatsListView,
    PlayerVsUpcomingMatchupStatsView,
    PlayerFantasyRankingsView,
    HistoricNFLSchedulesListAPIView,
    NFLScheduleView,
    ETLVersionView,
)

app_name = 'nfl'

urlpatterns = [
    path('teams/', TeamListAPIView.as_view(), name='team-list-api-view'),
    path('team/stats', TeamStatsListView.as_view(), name='team-stats-view'),
    path('team/stats/ranks', TeamRanksListView.as_view(), name='team-stats-ranks-view'),

    # Used for autocomplete search bar
    path('players/', PlayerListAPIView.as_view(), name='player-list-api-view'),
    path(
        'players/<int:pk>/<str:slug>/stats',
        PlayerGameStatsRetrieveAPIView.as_view(),
        name='player-stats-view'
    ),
    path(
        'players/<int:pk>/<str:slug>/upcoming-matchup',
        PlayerVsUpcomingMatchupStatsView.as_view(),
        name='player-upcoming-matchup-view'
    ),
    path(
        'players/<int:pk>/<str:slug>/career',
        PlayerFantasyRankingsView.as_view(),
        name='player-career-view'
    ),
    path(
        'players/position-vs-opponent',
        PlayerGameStatsMatchupsListView.as_view(),
        name='player-position-vs-opponent-view'
    ),
    path('players/fantasy-rankings', PlayerSeasonStatsListView.as_view(), name='player-fantasy-rankings-view'),
    path('slates', HistoricNFLSchedulesListAPIView.as_view(), name='nfl-slates'),

    path('schedule/', NFLScheduleView.as_view(), name='schedule'),
    path('sync-status/', ETLVersionView.as_view(), name='sync-status'),
]
