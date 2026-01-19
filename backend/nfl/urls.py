from django.urls import path
from .views import *

app_name = 'nfl'

urlpatterns = [
    path('teams/', TeamListAPIView.as_view(), name='team-list-api-view'),
    path('team/stats/', TeamRanksListView.as_view()),
    # path('team/id/<int:pk>/<str:slug>', TeamRetrieveAPIView.as_view(), name='team-retrieve-api-view'),
    # path('team/stats/id/<int:pk>/<str:slug>', TeamStatsRetrieveAPIView.as_view(), name='team-stats-view'),

    path('players/', PlayerListAPIView.as_view(), name='player-list-api-view'), # Autocomplete

    # need to add fantasy score per game
    path('player/stats/id/<int:pk>/<str:slug>', PlayerGameStatsRetrieveAPIView.as_view(), name='player-game-stats-view'),

    path('player/stats/gamelogs/', PlayerGameStatsMatchupsListView.as_view()),
    path('events/', EventListView.as_view())
]