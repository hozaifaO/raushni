# Raushni

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-3.11-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-API-009688)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED)](https://www.docker.com/)

Raushni is a digital operations platform for Raushni Educational & Social Welfare Trust. It brings public outreach, beneficiary records, donations, events, reports, document generation, and content publishing into one maintainable system for nonprofit operations.

The repository is organized as a full-stack platform with a Next.js frontend, FastAPI backend, Strapi CMS, PostgreSQL database, Redis cache, PDF/document generation utilities, nginx, Docker Compose, and Kubernetes manifests.

Local Docker: [docs/LOCAL_DEV.md](docs/LOCAL_DEV.md). Security (hosted): [docs/SECURITY.md](docs/SECURITY.md). Multi-tenant: [docs/MULTI_TENANT.md](docs/MULTI_TENANT.md). Deferred work: [docs/DEFERRED.md](docs/DEFERRED.md).

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
- Docker and Docker Compose v2 (recommended for full local stack)
- Node.js 18 or newer (when running frontend/CMS on the host)
- npm 9 or newer
- Python 3.11 or newer (when running the API on the host)

Docker Compose is the recommended way to run the full platform locally. Individual services can also be run directly when focusing on one area. See [docs/LOCAL_DEV.md](docs/LOCAL_DEV.md).

## Quick Start (local Docker)

Clone the repository:

```bash
git clone https://github.com/owais4u/raushni.git
cd raushni
```

Copy the local Docker env template and start the stack (merge both Compose files):

```bash
cp .env.dev.example .env.dev
docker compose --env-file .env.dev -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Or: `make dev-up` (uses `.env.dev.example` directly).

Default local URLs:

| URL | Service |
| --- | --- |
| `http://localhost:3000` | Frontend |
| `http://localhost:8000` | Backend API |
| `http://localhost:8000/health` | Backend health check |
| `http://localhost:1337` | CMS |
| `http://localhost:1337/admin` | Strapi admin |
| `localhost:5432` | PostgreSQL |
| `localhost:6379` | Redis |

Default site dashboard login (local only): `admin@raushni.com` / `LocalDevAdminPass1!` — details in [docs/LOCAL_DEV.md](docs/LOCAL_DEV.md).

Stop the stack:

```bash
make dev-down
# or
docker compose --env-file .env.dev -f docker-compose.yml -f docker-compose.dev.yml down
```

## Hosted production (current)

| Layer | Hosting |
| --- | --- |
| Frontend | Vercel |
| Backend + CMS | Railway |
| Postgres | Neon |
| Redis | Upstash |

Trust boundaries and public surfaces: [docs/SECURITY.md](docs/SECURITY.md). Env templates for hosted/prod-style values: `.env.example`.

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

| File | Purpose |
| --- | --- |
| `.env.dev.example` / `.env.dev` | Local Docker Compose (recommended). |
| `.env.example` | Hosted / production-oriented template. |
| `frontend/.env.local` | Frontend when run on the host. |
| `frontend/.env.example` | Frontend env variable list. |
| `cms/.env` | CMS when run on the host. |

Do not commit real secrets. Use example files and deployment secret managers for production credentials.

Full local walkthrough: [docs/LOCAL_DEV.md](docs/LOCAL_DEV.md).

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

| Path | Purpose |
| --- | --- |
| Local Docker | [docs/LOCAL_DEV.md](docs/LOCAL_DEV.md) — `docker-compose.yml` + `docker-compose.dev.yml` |
| Hosted prod | Vercel (frontend) + Railway (API/CMS) + Neon + Upstash — see [docs/SECURITY.md](docs/SECURITY.md) |
| `docker-compose.minimal.yml` | Lighter API-focused Compose (no Strapi/nginx) |
| `docker-compose.prod.yml` | Production-style Compose variant (self-host) |
| `k8s/` | Kubernetes manifests / overlays |
| `nginx/` | Reverse proxy used by full Compose / self-host |

Build images (self-host):

```bash
cd frontend && docker build -t raushni-frontend .
cd ../backend && docker build -t raushni-backend .
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

If Docker services fail to start, inspect logs (use both Compose files + your env file):

```bash
docker compose --env-file .env.dev -f docker-compose.yml -f docker-compose.dev.yml logs -f backend
docker compose --env-file .env.dev -f docker-compose.yml -f docker-compose.dev.yml logs -f frontend
docker compose --env-file .env.dev -f docker-compose.yml -f docker-compose.dev.yml logs -f strapi
```

More local Docker tips: [docs/LOCAL_DEV.md](docs/LOCAL_DEV.md).

If ports are already in use, stop the conflicting process or change the mapped ports in `docker-compose.yml`.

If frontend tests report a `.next/standalone/package.json` collision, remove the generated `.next` directory before re-running Jest:

```bash
cd frontend
rm -rf .next
npm run test:ci
```

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
