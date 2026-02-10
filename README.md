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
|      ├── settings.py
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
3. In the root directory initial docker compose command
```shell
docker compose -f docker-compose.yml up --build
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

Though this is tedious if you want you can modify DEFAULT_THROTTLE_RATES or even remove the ratelimit decorators in the nfl app views.py and just rebuild the docker container.
```text
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '250/day',
        'user': '750/day'
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
<img width="1643" height="872" alt="image" src="https://github.com/user-attachments/assets/ae0f8c9f-c715-4d15-adcb-926d131c83b3" />

## Credits and references
- https://gist.github.com/nntrn/ee26cb2a0716de0947a0a4e9a157bc1c [Source of ESPN API endpoints]
- https://www.nfl.com/stats/team-stats/
- https://www.sharpfootballanalysis.com
- https://sumersports.com/
