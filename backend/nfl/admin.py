from django.contrib import admin
from .models import (
    Team,
    Player,
    Game,
    PlayerGameStats,
    TeamOffensePassingStats,
    TeamOffenseRushingStats,
    TeamOffenseReceivingStats,
    TeamDefensePassingStats,
    TeamDefenseRushingStats,
    TeamDefenseReceivingStats,
    TeamAdvanceOffenseStats,
    TeamAdvanceDefenseStats,
    TeamCoverageSchemeStats,
    TeamOffensePlayCallingStats,
    TeamCoverageStatsByPosition,
)

admin.site.register(Team)
admin.site.register(Player)
admin.site.register(Game)
admin.site.register(PlayerGameStats)
admin.site.register(TeamOffensePassingStats)
admin.site.register(TeamOffenseRushingStats)
admin.site.register(TeamOffenseReceivingStats)
admin.site.register(TeamDefensePassingStats)
admin.site.register(TeamDefenseRushingStats)
admin.site.register(TeamDefenseReceivingStats)
admin.site.register(TeamAdvanceOffenseStats)
admin.site.register(TeamAdvanceDefenseStats)
admin.site.register(TeamCoverageSchemeStats)
admin.site.register(TeamOffensePlayCallingStats)
admin.site.register(TeamCoverageStatsByPosition)