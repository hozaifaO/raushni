# Raushni

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-3.11-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-API-009688)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED)](https://www.docker.com/)

Raushni is a digital operations platform for Raushni Educational & Social Welfare Trust. It brings public outreach, beneficiary records, donations, events, reports, document generation, and content publishing into one maintainable system for nonprofit operations.

The repository is organized as a full-stack platform with a Next.js frontend, FastAPI backend, Strapi CMS, PostgreSQL database, Redis cache, PDF/document generation utilities, nginx, Docker Compose, and Kubernetes manifests.

## Product Scope

Raushni is designed to support the day-to-day workflows of an educational and social welfare organization:

| Area | Capabilities |
| --- | --- |
| Public website | About, activities, events, news, gallery, careers, volunteer, contact, and donation pages. |
| Dashboard | Modules for members, beneficiaries, donations, certificates, crowdfunding, internships, projects, enquiries, reports, news, activities, and settings. |
| Document generation | Member ID cards, donation receipts, certificates, appointment letters, QR codes, and PDF templates. |
| CMS | Content management through Strapi for public-facing pages and media workflows. |
| Operations | PostgreSQL persistence, Redis cache, backups, migrations, Dockerized local stack, and Kubernetes deployment manifests. |

## Architecture

```text
User
  |
  v
Next.js Frontend  <---->  Strapi CMS
  |
  v
FastAPI Backend  <---->  Redis
  |
  v
PostgreSQL
  |
  v
Document and PDF Services
```

Core services:

| Service | Path | Default Port | Purpose |
| --- | --- | --- | --- |
| Frontend | `frontend/` | `3000` | Next.js app, public website, dashboard, API route handlers, and client integrations. |
| Backend API | `backend/` | `8000` | FastAPI application, business logic, persistence, auth-related services, and operational APIs. |
| CMS | `cms/` | `1337` | Strapi content management service. |
| Database | `database/` | `5432` | PostgreSQL schema, migrations, backups, monitoring, and seed scripts. |
| Redis | Docker image | `6379` | Cache and async workflow support. |
| nginx | `nginx/` | `80`, `443` | Reverse proxy configuration. |
| Document generator | `services/document_generator/` | `8000` when run separately | PDF and document generation service utilities. |

## Repository Structure

```text
raushni/
  backend/                  FastAPI backend application
  cms/                      Strapi CMS application
  database/                 PostgreSQL Docker image, migrations, backups, and tests
  frontend/                 Next.js frontend application
  k8s/                      Kubernetes manifests
  nginx/                    Reverse proxy configuration
  requirements/             Shared Python requirement sets
  scripts/                  Project maintenance, seed, migration, and backup scripts
  services/document_generator/
                            Document generation service
  shared/                   Shared TypeScript constants, types, and utilities
  static/templates/         Email and PDF templates
  tests/                    Unit, integration, e2e, Cypress, and Docker test assets
```

## Prerequisites

- Git
- Docker and Docker Compose
- Node.js 18 or newer
- npm 9 or newer
- Python 3.11 or newer

Docker Compose is the recommended way to run the full platform locally. Individual services can also be run directly when focusing on one area.

## Quick Start

Clone the repository:

```bash
git clone https://github.com/owais4u/raushni.git
cd raushni
```

Create local environment files:

```bash
cp .env.example .env
```

Start the full local stack:

```bash
docker-compose up -d
```

Default local URLs:

| URL | Service |
| --- | --- |
| `http://localhost:3000` | Frontend |
| `http://localhost:8000` | Backend API |
| `http://localhost:8000/health` | Backend health check |
| `http://localhost:1337` | CMS |
| `localhost:5432` | PostgreSQL |
| `localhost:6379` | Redis |

Stop the stack:

```bash
docker-compose down
```

## Running Services Individually

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Useful frontend commands:

```bash
npm run type-check
npm run lint
npm run test:ci
npm run build
```

See [frontend/README.md](frontend/README.md) for frontend-specific setup, scripts, routes, and troubleshooting.

### Backend API

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health check:

```bash
curl http://localhost:8000/health
```

### CMS

```bash
cd cms
npm install
npm run develop
```

### Document Generator

```bash
cd services/document_generator
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

## Configuration

The root `.env` configures the Dockerized stack. Service-specific files are also used:

| File | Purpose |
| --- | --- |
| `.env` | Root environment values for local orchestration. |
| `frontend/.env.local` | Frontend local URLs, NextAuth values, feature flags, and upload settings. |
| `frontend/.env.development` | Development defaults for the frontend. |
| `frontend/.env.production` | Production-facing frontend defaults. |
| `cms/.env` | CMS runtime settings. |

Do not commit real secrets. Use example files and deployment secret managers for production credentials.

## Testing and Quality

Root Makefile targets:

```bash
make test
make test-backend
make test-frontend
make test-e2e
make coverage
```

Frontend checks:

```bash
cd frontend
npm run type-check
npm run lint
npm run test:ci
npm run build
```

Backend checks:

```bash
cd backend
pytest
```

Docker-based test assets are available under `tests/docker/`.

## Database and Migrations

Database assets are split between Alembic and SQL migration folders:

```text
alembic/
database/migrations/
database/scripts/
database/backups/
```

Common workflows:

```bash
python scripts/init_db.py
python scripts/seed_data.py
python scripts/backup_db.py
python scripts/restore_db.py
```

Review each script before running it against non-local data.

## Deployment

The repository includes multiple deployment options:

| Path | Purpose |
| --- | --- |
| `docker-compose.yml` | Local multi-service development stack. |
| `docker-compose.dev.yml` | Development Compose variant. |
| `docker-compose.prod.yml` | Production Compose variant. |
| `k8s/` | Kubernetes namespace, config map, secrets, backend, and Postgres manifests. |
| `nginx/` | Reverse proxy and container image configuration. |

Build the frontend production image:

```bash
cd frontend
docker build -t raushni-frontend .
```

Build the backend image:

```bash
cd backend
docker build -t raushni-backend .
```

## Architecture Diagrams

The project includes C4-style architecture references:

### System Context

![System Context](https://github.com/user-attachments/assets/74c8f514-0935-42ac-b30f-799f65398604)

### Container View

![Container View](https://github.com/user-attachments/assets/8c54440c-6ae5-45a5-a855-36f35e67b86a)

### Backend Component View

![Backend Component View](https://github.com/user-attachments/assets/02a0369a-a0db-4a82-b77f-0f38602a66c7)

### Kubernetes Deployment

![Kubernetes Deployment](https://github.com/user-attachments/assets/2781ef1c-426a-4611-82de-b3a463a0fd46)

## Development Standards

- Keep service-specific code inside its service boundary.
- Prefer shared types and constants from `shared/` where they already exist.
- Keep frontend API access inside `frontend/services/`.
- Keep backend business logic inside `backend/app/services/` and persistence concerns inside repositories.
- Add tests for new behavior, especially API, service, validation, and document-generation workflows.
- Avoid committing generated artifacts such as `.next/`, `node_modules/`, local backups, screenshots, and local installers.

## Troubleshooting

If the frontend cannot reach the API, verify `NEXT_PUBLIC_API_URL` and confirm the backend health endpoint:

```bash
curl http://localhost:8000/health
```

If Docker services fail to start, inspect logs:

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f strapi
docker-compose logs -f postgres
```

If ports are already in use, stop the conflicting process or change the mapped ports in `docker-compose.yml`.

If frontend tests report a `.next/standalone/package.json` collision, remove the generated `.next` directory before re-running Jest:

```bash
cd frontend
rm -rf .next
npm run test:ci
```

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
