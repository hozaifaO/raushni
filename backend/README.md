# Raushni Backend API

[![Python](https://img.shields.io/badge/Python-3.11-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-API-009688)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-ready-336791)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-ready-DC382D)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED)](https://www.docker.com/)

The Raushni backend is the FastAPI service for the Raushni NGO management platform. It provides the API layer for public website features, internal dashboard workflows, operational modules, payments, and integrations with PostgreSQL and Redis. Mail/PDF helpers exist as stubs until those providers are wired.

Local Docker vs hosted: [docs/LOCAL_DEV.md](../docs/LOCAL_DEV.md), [docs/SECURITY.md](../docs/SECURITY.md).

At the moment, the active public API surface exposes health and API discovery endpoints. The package structure already contains the intended domain boundaries for future modules such as members, donations, events, projects, beneficiaries, enquiries, documents, reporting, internships, crowdfunding, news, and activities.

## Table of Contents

- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Docker](#docker)
- [Database and Migrations](#database-and-migrations)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)

## Architecture

```text
Next.js Frontend
      |
      v
FastAPI Backend
      |
      +--> PostgreSQL
      +--> Redis
      +--> Email / payment / document services (stubs or optional extras)
```

Core backend responsibilities:

| Area | Purpose |
| --- | --- |
| API layer | HTTP endpoints, request validation, response shaping, and dependency wiring. |
| Services | Business logic for domain workflows. |
| Repositories | Database access boundaries. |
| Schemas | Pydantic request and response contracts. |
| Models | SQLAlchemy model definitions. |
| Middleware | Cross-cutting request handling such as CORS, auth, rate limiting, request IDs, and errors. |
| Tasks | Background jobs for cleanup, backup, document, report, and email workflows. |
| Utilities | Formatting, validation, file handling, QR codes, PDFs, templates, and exports. |

## Project Structure

```text
backend/
  app/
    api/                 API dependencies, routers, and versioned endpoint packages
    constants/           Shared backend constants
    core/                Configuration, security, database, cache, exceptions, middleware
    middleware/          Request/response middleware modules
    models/              SQLAlchemy model package
    repositories/        Persistence access layer
    schemas/             Pydantic schemas
    services/            Business service layer
    tasks/               Background/scheduled task modules (stubs where unused)
    utils/               Shared utility functions
    main.py              FastAPI application factory and ASGI app
  Dockerfile             Production image (Railway / self-host)
  Dockerfile.dev         Development image (Compose)
  entrypoint.sh          Container startup helper for DB/Redis readiness and migrations
  pytest.ini             Backend pytest configuration
  requirements.txt       Runtime Python dependencies
  requirements-test.txt  Test and quality dependencies
```

## Prerequisites

- Python 3.11
- Docker and Docker Compose
- PostgreSQL 15, when running database-backed work outside Docker
- Redis 7, when running cache/background-job work outside Docker

The recommended local workflow is Docker Compose from the repository root. Running the backend directly is useful for focused API development.

## Quick Start

### Run with Docker Compose

From the repository root (see [docs/LOCAL_DEV.md](../docs/LOCAL_DEV.md)):

```bash
cp .env.dev.example .env.dev
docker compose --env-file .env.dev -f docker-compose.yml -f docker-compose.dev.yml up --build postgres redis backend
```

Or the full stack: `make dev-up`.

The backend will be available at:

```text
http://localhost:8000
```

Health check:

```bash
curl http://localhost:8000/health
```

API discovery:

```bash
curl http://localhost:8000/api
```

Interactive docs (enabled in local `ENVIRONMENT=development`):

```text
http://localhost:8000/docs
http://localhost:8000/redoc
```

### Run Locally Without Docker

From the repository root:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

If you are running database-backed endpoints locally, also provide `DATABASE_URL` and `REDIS_URL` values in your shell or local environment file.

## Configuration

Common runtime variables:

| Variable | Example | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://postgres:postgres@postgres:5432/raushni_backend` | PostgreSQL connection URL. |
| `REDIS_URL` | `redis://redis:6379` | Redis connection URL. |
| `ENVIRONMENT` | `development` | Runtime environment name. |
| `DEBUG` | `true` | Enables development-oriented behavior where supported. |
| `SEED_DATABASE` | `true` | Allows `entrypoint.sh` to seed initial data after migrations. |

Docker Compose sets development values for the backend service in the root [docker-compose.yml](../docker-compose.yml).

Do not commit real credentials. Use local `.env` files for development and a secret manager or orchestrator secrets for production.

## API Endpoints

Currently active endpoints:

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Service health, timestamp, service name, and version. |
| `GET` | `/api` | API metadata and discoverable public endpoints. |
| `GET` | `/docs` | Swagger UI generated by FastAPI. |
| `GET` | `/redoc` | ReDoc API documentation. |
| `GET` | `/openapi.json` | OpenAPI schema. |

Example health response:

```json
{
  "status": "healthy",
  "service": "raushni-backend",
  "timestamp": "2026-05-09T09:30:00.000000+00:00",
  "version": "1.0.0"
}
```

## Testing

Backend tests live under [../tests/backend](../tests/backend).

The suite is organized by test layer:

```text
tests/backend/
  unit/         FastAPI app factory and route registration tests
  mock/         Mock-based tests, such as the uvicorn entrypoint call
  integration/  HTTP contract and CORS behavior tests
  e2e/          Public API smoke workflow tests
```

### Run Tests Locally

From the repository root:

```bash
PYTHONPATH=backend pytest tests/backend -v \
  --cov=backend/app \
  --cov-report=term-missing \
  --cov-report=html:reports/backend/htmlcov \
  --cov-report=xml:reports/backend/coverage.xml \
  --junitxml=reports/backend/junit.xml
```

Or use the project helper:

```bash
make test-backend
```

### Run Tests in Docker

From the repository root:

```bash
docker-compose -f tests/docker/docker-compose.test.yml up --build --abort-on-container-exit backend-tests
docker-compose -f tests/docker/docker-compose.test.yml down --remove-orphans
```

Generated reports:

| Report | Path |
| --- | --- |
| Human-readable summary | [../reports/backend/test-report.md](../reports/backend/test-report.md) |
| JUnit XML | [../reports/backend/junit.xml](../reports/backend/junit.xml) |
| Coverage XML | [../reports/backend/coverage.xml](../reports/backend/coverage.xml) |
| HTML coverage | [../reports/backend/htmlcov/index.html](../reports/backend/htmlcov/index.html) |

The backend coverage threshold is configured at 80% in [pytest.ini](pytest.ini).

### Select Test Groups

```bash
PYTHONPATH=backend pytest tests/backend -m unit
PYTHONPATH=backend pytest tests/backend -m mock
PYTHONPATH=backend pytest tests/backend -m integration
PYTHONPATH=backend pytest tests/backend -m e2e
```

## Docker

Development image:

```bash
docker build -f backend/Dockerfile.dev -t raushni-backend-dev backend
```

Production image:

```bash
docker build -f backend/Dockerfile -t raushni-backend backend
```

Run production image directly:

```bash
docker run --rm -p 8000:8000 \
  -e DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/raushni_backend \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  raushni-backend
```

The production image starts:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The development image starts with hot reload.

## Database and Migrations

The backend uses SQLAlchemy and Alembic dependencies. Migration files currently live at the repository root:

```text
alembic/
alembic/versions/
```

Common migration command from the repository root:

```bash
alembic -c alembic/alembic.ini upgrade head
```

The backend container entrypoint is prepared to:

1. Wait for PostgreSQL.
2. Wait for Redis.
3. Run Alembic migrations.
4. Optionally seed the database when `SEED_DATABASE=true`.
5. Start the configured application command.

## Development Workflow

Recommended flow for backend changes:

1. Add or update tests in the relevant `tests/backend` layer.
2. Implement the backend change in the narrowest applicable package.
3. Run the backend test suite.
4. Confirm coverage and generated reports.
5. Update this README when setup, commands, or behavior changes.

Formatting and quality tools are available through `requirements-test.txt`:

```bash
black app
isort app
flake8 app
mypy app
```

## Implementation Notes

- `app.main:create_app()` is the application factory.
- `app.main:app` is the ASGI application target used by Uvicorn and Docker.
- CORS is currently permissive for development.
- Many domain modules are scaffolded but currently empty; tests should target implemented behavior and grow with each module.
- Keep API contracts explicit in Pydantic schemas as domain endpoints are implemented.
- Prefer service and repository boundaries for business logic and database access instead of placing domain behavior directly in route handlers.

## Troubleshooting

### `ModuleNotFoundError: No module named 'app'`

Run tests from the repository root with `PYTHONPATH=backend`, or run commands from inside the `backend` directory.

```bash
PYTHONPATH=backend pytest tests/backend
```

### Docker container name conflicts

If a previous test run was interrupted:

```bash
docker-compose -f tests/docker/docker-compose.test.yml down --remove-orphans
docker rm -f raushni-test-db raushni-test-redis raushni-backend-tests
```

### Dependency resolution errors

Reinstall dependencies in a clean environment:

```bash
cd backend
rm -rf .venv
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-test.txt
```

### Database connection failures

Confirm PostgreSQL is reachable and `DATABASE_URL` points to the correct host. Inside Docker Compose, use service names such as `postgres` and `redis`. From the host machine, use `localhost` or the mapped port.

## License

This backend is part of the Raushni repository and follows the repository-level license.
