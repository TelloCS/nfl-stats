from django.test import TestCase
from django.db.utils import IntegrityError
from nfl.models import Team, Game, PlayerGameStats
from nfl.factories import (
    TeamFactory, 
    PlayerFactory, 
    GameFactory, 
    PlayerGameStatsFactory,
    TeamOffensePassingStatsFactory
)
from django.utils import timezone
from datetime import datetime

class DataIntegrityTest(TestCase):
    def test_game_must_have_teams(self):
        with self.assertRaises(IntegrityError):
            Game.objects.create(
                date=timezone.make_aware(datetime(2025, 9, 1, 13, 0)), 
                season_year=2025,
                week=1
            )

    def test_player_game_stats_requirements(self):
        player = PlayerFactory()
        
        with self.assertRaises(IntegrityError):
            PlayerGameStats.objects.create(player=player, pass_yards=300)

    def test_unique_stats_per_game(self):
        game = GameFactory()
        player = PlayerFactory(team=game.homeTeam)
        
        PlayerGameStatsFactory(player=player, game=game, pass_yards=100)
        
        with self.assertRaises(IntegrityError):
            PlayerGameStats.objects.create(
                player=player, 
                game=game, 
                pass_yards=50
            )

class StatsLogicTest(TestCase):
    def test_factory_generation(self):
        stat = PlayerGameStatsFactory()
        
        self.assertIsNotNone(stat.player)
        self.assertIsNotNone(stat.game)
        self.assertIsNotNone(stat.game.homeTeam)
        
        self.assertTrue(stat.completions <= stat.pass_attempts)

    def test_team_offense_stats_link(self):
        team = TeamFactory(abbreviation="DET")
        TeamOffensePassingStatsFactory(team=team, pass_yards=4000)
        
        fetched_team = Team.objects.get(abbreviation="DET")
        self.assertEqual(fetched_team.team_offense_passing.pass_yards, 4000)

    def test_game_teams_are_distinct(self):
        game = GameFactory()
        
        self.assertNotEqual(game.homeTeam.id, game.awayTeam.id)
        self.assertNotEqual(game.homeTeam.abbreviation, game.awayTeam.abbreviation)

    def test_bulk_stat_creation(self):
        qb = PlayerFactory(position="QB")
        stats = PlayerGameStatsFactory.create_batch(17, player=qb)
        
        self.assertEqual(qb.stats.count(), 17)
        
        total_yards = sum(s.pass_yards for s in stats)
        self.assertTrue(total_yards > 0)