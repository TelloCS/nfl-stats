# nfl stats hub
Django and React based project with a scheduled ETL pipeline using Python, Celery Beat, and Redis to automate weekly seasonal nfl data. Utilizing python libraries such as asyncio, aiohttp, and BeautifulSoup for web scraping then storing data in a PostgresSQL database.

## Quickstart for local docker containerization

```shell
git clone https://github.com/TelloCS/nfl-stats.git
```
## Heads up
1. Before running the local docker container navigate to the Django settings.py to customize the weekly data ingestion.
```text
.
├── backend/
|  ├── backend/
|      ├── settings/base.py
|
```
2. Modify this code snippet
```shell
# How days of the week are represented starting from Sunday [0-6] and using the 24 hour time format.

CELERY_BEAT_SCHEDULE = {
    'ingest-nfl-data-every-week': {
        'task': 'nfl.tasks.weekly_nfl_sync',
        'schedule': crontab(day_of_week=0, hour=14, minute=15),
    },
}
```
3. Use a docker-compose.override.yml to define target as dev for backend service, define env_file for each service, and set volumes.
```text
# Turn off nginx for hot reloading.
nginx:
    profiles:
      - donotstart

# Turn off dokploy-network.
networks:
  default:
  dokploy-network:
    external: false
```

4. In the root directory
```shell
docker compose up --build
```
## More things to know
Don't need to sign up locally though it provides more API requests to the backend due to rate limiting being implemented. If experiencing rate limiting here is a easy work around.

1. Get the CONTAINER ID
  ```shell
  docker ps
  ```
2. Replace [redis-container] with CONTAINER ID
```shell
docker exec -it [redis-container] redis-cli FLUSHALL
```
- Should get a response saying "OK".

You can modify DEFAULT_THROTTLE_RATES or even remove the ratelimit decorators in the nfl app views.py and just rebuild the docker container.
```text
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '50/minute',
        'user': '5000/hour'
    },
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend'
    ],
    'COERCE_DECIMAL_TO_STRING': False,
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 5
}
```
## Position vs. Opponent Preview
<img width="1643" height="545" alt="image" src="https://github.com/user-attachments/assets/10f2d441-be05-4b7f-82c5-272ba5bbd584" />

## Credits and references
- https://gist.github.com/nntrn/ee26cb2a0716de0947a0a4e9a157bc1c [Source of ESPN API endpoints]
- https://www.nfl.com/stats/team-stats/
- https://www.sharpfootballanalysis.com
- https://sumersports.com/
