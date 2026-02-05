/---.github/
|   +---workflows/
|   |   |   backend.yml
|   |   |   build-docker.yml
|   |   |   frontend.yml
|   |
|---backend/
|   +---accounts/
|   |   |   __init__.py
|   |   |   admin.py
|   |   |   apps.py   
|   |   |   models.py
|   |   |   serializers.py
|   |   |   test.py
|   |   |   urls.py
|   |   |   views.py
|   |   
|   +---backend/
|   |   |   asgi.py
|   |   |   settings.py
|   |   |   urls.py
|   |   |   wsgi.py
|   |   |
|   |   
|   |---nfl/
|   |   +---migrations/
|   |   +---services/
|   |   +---tests/
|   |   |   __init__.py
|   |   |   admin.py
|   |   |   celery.py
|   |   |   factories.py
|   |   |   filters.py
|   |   |   models.py
|   |   |   pagination.py
|   |   |   serializers.py
|   |   |   tasks.py
|   |   |   urls.py
|   |   |   views.py
|   |   |
|   |   .dockerignore
|   |   Dockerfile
|   |   entrypoint.prod.sh
|   |   entrypoint.sh
|   |   manage.py
|   |   requirements.txt
|   |   
|---frontend/
|   +---src/
|   |   +---components/
|   |   |   +---dashboard/
|   |   |   |   PlayerGraph.jsx
|   |   |
|   |   +---pages/
|   |   |    PlayerStats.jsx
|   |   |
|   |   App.css
|   |   App.jsx
|   |   index.css
|   |   main.jsx
|   |   
|   |   .dockerignore
|   |   .gitignore
|   |   Dockerfile
|   |   eslint.config.js
|   |   index.html
|   |   package-lock.json
|   |   package.json
|   |   README.md
|   |   vite.config.js
|   |   
|---nginx/
|   |   default.conf
|   
|   .gitignore
|   docker-compose.prod.yml
|   docker-compose.yml
|   README.md