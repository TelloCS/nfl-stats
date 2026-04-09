#!/bin/sh
set -e

python manage.py wait_for_db

echo "Applying database migrations..."
python manage.py migrate --noinput

exec "$@"