.PHONY: up down build migrate shell logs

up:
	docker compose up

down:
	docker compose down

build:
	docker compose build

migrate:
	docker compose run --rm web python manage.py migrate

shell:
	docker compose run --rm web python manage.py shell

logs:
	docker compose logs -f web
