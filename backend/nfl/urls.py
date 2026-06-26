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
        'player/stats/id/<int:pk>/<str:slug>',
        PlayerGameStatsRetrieveAPIView.as_view(),
        name='player-game-stats-view'
    ),
    path(
        'player/stats/id/<int:pk>/<str:slug>/vs-upcoming-matchup',
        PlayerVsUpcomingMatchupStatsView.as_view(),
        name='player-vs-upcoming-matchup'
    ),
    path(
        'player/stats/id/<int:pk>/<str:slug>/fantasy-rankings',
        PlayerFantasyRankingsView.as_view(),
        name='player-fantasy-rankings'
    ),
    path('player/stats/gamelogs', PlayerGameStatsMatchupsListView.as_view(), name='player-stats-gamelogs-view'),
    path('fantasy-rankings', PlayerSeasonStatsListView.as_view(), name='player-season-stats-view'),

    path('schedule/', NFLScheduleView.as_view(), name='schedule'),
    path('sync-status/', ETLVersionView.as_view(), name='sync-status'),
]
