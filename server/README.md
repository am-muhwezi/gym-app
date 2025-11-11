# Gym CRM — backend README

This repository contains the backend for a Gym CRM used by trainers to manage clients, bookings, payments and goals.

Purpose: provide a clean, RESTful backend (Django + DRF) that the frontend (React + Vite) will consume.

This README is project-focused: stack, how to run and test the backend, where to find code for each resource, and minimal notes about the frontend location.

## Stack

- Python 3.10+
- Django
- Django REST Framework
- SQLite (default for development; configure production DB via env)

## Important files & apps

- `manage.py` — Django management entrypoint
- `requirements.txt` — Python dependencies
- `gymapp/` — Django project (settings, urls)
- `clients/`, `bookings/`, `payments/`, `analytics/` — main Django apps
- `db.sqlite3` — local DB used for development

## Run locally (backend)

1. Create and activate a virtualenv and install deps:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Migrate and (optionally) create a superuser:

```bash
python manage.py migrate
python manage.py createsuperuser
```

3. Run development server:

```bash
python manage.py runserver
```

Default: http://127.0.0.1:8000/

## API basics

- DRF viewsets are used to expose resources. Check each app for serializers and viewsets:
  - `clients/serializers.py`, `clients/views.py`
  - `bookings/serializers.py`, `bookings/views.py`
  - `payments/serializers.py`, `payments/views.py`
- Look in `gymapp/urls.py` for router registration to see exact URL prefixes (common pattern: `/api/`).
- The DRF browsable API is available in development for quick testing.

## Environment variables

Use env vars to configure secrets and production settings. Common vars:

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG` (true / false)
- `DATABASE_URL` (production)

## Tests & checks

- Run tests:

```bash
python manage.py test
```

- Run Django system checks:

```bash
python manage.py check
```