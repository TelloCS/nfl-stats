#!/bin/sh
set -e

if [ "$DB_NAME" = "nfl_db" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $DB_HOST $DB_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL started"

    echo "Making initial migrations"
    python manage.py makemigrations

    echo "Running migrations..."
    python manage.py migrate

    # echo "Running Django tests..."
    # python manage.py test
fi

exec "$@"