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

	

# --- Seed Commands ---
seed-accounts:
	docker compose run --rm web python manage.py seed_accounts

seed-hr:
	docker compose run --rm web python manage.py seed_hr

seed-payroll:
	docker compose run --rm web python manage.py seed_payroll

seed-finance:
	docker compose run --rm web python manage.py seed_finance

seed-all:
	docker compose run --rm web python manage.py seed_accounts
	docker compose run --rm web python manage.py seed_hr
	docker compose run --rm web python manage.py seed_payroll
	docker compose run --rm web python manage.py seed_finance