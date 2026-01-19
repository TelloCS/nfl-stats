import random
import factory
from django.utils import timezone
from django.utils.text import slugify
from .models import Team, Player, Game, PlayerGameStats, TeamOffensePassingStats

POSITIONS = ['QB', 'RB', 'WR', 'TE']

class TeamFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Team
        django_get_or_create = ('abbreviation',)

    full_name = factory.Faker('company')
    nickname = factory.Faker('word')
    abbreviation = factory.Sequence(lambda n: f"TM{n}")
    conference = factory.Iterator(['AFC', 'NFC'])
    division = factory.Iterator(['North', 'South', 'East', 'West'])

    @factory.lazy_attribute
    def slug(self):
        return slugify(self.full_name)

class PlayerFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Player

    first_name = factory.Faker('first_name_male')
    last_name = factory.Faker('last_name_male')
    position = factory.Iterator(POSITIONS)
    jersey = factory.LazyFunction(lambda: str(random.randint(1, 99)))
    experience = factory.Faker('random_int', min=0, max=15)
    team = factory.SubFactory(TeamFactory)

    @factory.lazy_attribute
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @factory.lazy_attribute
    def slug(self):
        return slugify(self.full_name)

class GameFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Game

    date = factory.Faker('date_time_this_year', tzinfo=timezone.get_current_timezone())
    short_name = factory.LazyAttribute(lambda o: f"{o.awayTeam.abbreviation} @ {o.homeTeam.abbreviation}")
    season_year = 2025
    season_type = 2
    week = factory.Sequence(lambda n: (n % 18) + 1)
    homeTeam = factory.SubFactory(TeamFactory)
    awayTeam = factory.SubFactory(TeamFactory)
    home_score = factory.Faker('random_int', min=0, max=50)
    away_score = factory.Faker('random_int', min=0, max=50)
    status = "Final"
    event = factory.Sequence(lambda n: f"event_{n}")

class PlayerGameStatsFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = PlayerGameStats

    player = factory.SubFactory(PlayerFactory)
    game = factory.SubFactory(GameFactory)
    
    games_played = 1
    is_starter = factory.Faker('boolean')
    pass_attempts = factory.Faker('random_int', min=20, max=50)
    completions = factory.LazyAttribute(lambda o: random.randint(0, o.pass_attempts))
    pass_yards = factory.Faker('random_int', min=150, max=400)
    pass_touchdowns = factory.Faker('random_int', min=0, max=4)
    interceptions = factory.Faker('random_int', min=0, max=2)

class TeamOffensePassingStatsFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = TeamOffensePassingStats

    team = factory.SubFactory(TeamFactory)
    pass_attempts = factory.Faker('random_int', min=300, max=600)
    pass_yards = factory.Faker('random_int', min=3000, max=5000)
    pass_touchdowns = factory.Faker('random_int', min=20, max=40)