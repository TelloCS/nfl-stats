import time
import psycopg2
from django.core.management.base import BaseCommand
from django.db.utils import OperationalError


class Command(BaseCommand):
    """Django command to pause execution until the database is available"""

    def handle(self, *args, **options):
        self.stdout.write('Waiting for postgres...')
        db_up = False

        while not db_up:
            try:
                self.check(databases=['default'])
                db_up = True
            except (psycopg2.OperationalError, OperationalError):
                self.stdout.write('Database unavailable, sleeping for 1 second...')
                time.sleep(1)

        self.stdout.write(self.style.SUCCESS("PostgreSQL started"))
