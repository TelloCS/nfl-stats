from django.core.cache import cache
from django.db.models.signals import post_save
from django.dispatch import receiver
from nfl.models import PlayerGameStats

@receiver(post_save, sender=PlayerGameStats)
def clear_weekly_stats(sender, **kwargs):
    cache.clear() 
    print("Weekly update detected: Redis cache flushed.")