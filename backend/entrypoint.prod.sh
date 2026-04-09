#!/bin/sh
set -e

python manage.py wait_for_db

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "Applying database migrations..."
python manage.py migrate --noinput

exec "$@"