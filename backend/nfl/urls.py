from django.urls import path
from .views import (
    TeamListAPIView,
    TeamStatsListView,
    TeamRanksListView,
    PlayerListAPIView,
    PlayerGameStatsRetrieveAPIView,
    PlayerGameStatsMatchupsListView,
    EventListView
)

app_name = 'nfl'

urlpatterns = [
    path('teams/', TeamListAPIView.as_view(), name='team-list-api-view'),
    path('team/stats/', TeamStatsListView.as_view(), name='team-stats-view'),
    path('team/stats/ranks/', TeamRanksListView.as_view(), name='team-stats-ranks-view'),

    path('players/', PlayerListAPIView.as_view(), name='player-list-api-view'), # Used for autocomplete search bar

    path('player/stats/id/<int:pk>/<str:slug>', PlayerGameStatsRetrieveAPIView.as_view(), name='player-game-stats-view'),

    path('player/stats/gamelogs', PlayerGameStatsMatchupsListView.as_view(), name='player-stats-gamelogs-view'),
    path('events/', EventListView.as_view(), name='events-view')
]