.PHONY: up down build makemigrations migrate shell superuser logs-api logs-front

# --- دستورات اصلی داکر ---
up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

# --- دستورات دیتابیس و بک‌اند (Django) ---
makemigrations:
	docker compose run --rm web python manage.py makemigrations

migrate:
	docker compose run --rm web python manage.py migrate

superuser:
	docker compose run --rm web python manage.py createsuperuser

shell:
	docker compose run --rm web python manage.py shell

# --- دستورات مانیتورینگ و لاگ‌ها ---
logs-api:
	docker compose logs -f web

logs-front:
	docker compose logs -f frontend