#!/bin/sh
set -e

if [ "$DB_NAME" = "nfl_db" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $DB_HOST $DB_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL started"

    echo "Collecting static files..."
    python manage.py collectstatic --noinput

    echo "Applying database migrations..."
    python manage.py migrate --noinput
fi

exec "$@"