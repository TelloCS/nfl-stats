FROM python:3.13-slim AS python

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app/backend

COPY requirements.txt .

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    netcat-openbsd \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir -r requirements.txt

RUN groupadd -r nfl && useradd -r -g nfl nfl

EXPOSE 8000

#######################################################################
FROM python AS dev

COPY --chown=nfl:nfl . .
RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]

RUN chown -R nfl:nfl /app

USER nfl

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

#######################################################################
FROM python AS prod

COPY --chown=nfl:nfl . .
RUN chmod +x entrypoint.prod.sh

ENTRYPOINT ["./entrypoint.prod.sh"]

RUN chown -R nfl:nfl /app

USER nfl

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "backend.wsgi:application"]