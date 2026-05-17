.PHONY: help build start stop dev logs migrate seed backup

help:
	@echo "Available commands:"
	@echo "  make build   - Build Docker image"
	@echo "  make start   - Start all services"
	@echo "  make stop    - Stop all services"
	@echo "  make dev     - Run in development mode"
	@echo "  make logs    - View logs"
	@echo "  make migrate - Run database migrations"
	@echo "  make seed    - Seed initial data"
	@echo "  make backup  - Backup database"

build:
	docker-compose build

start:
	docker-compose up -d

stop:
	docker-compose down

dev:
	npm run develop

logs:
	docker-compose logs -f

migrate:
	docker-compose exec strapi npm run strapi migrate:up

seed:
	docker-compose exec strapi node scripts/seed.js

backup:
	docker-compose exec postgres pg_dump -U strapi_user raushni_cms > backups/strapi_$(shell date +%Y%m%d_%H%M%S).sql