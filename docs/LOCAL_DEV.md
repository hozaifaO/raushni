# Local development

How to run Raushni on your machine with Docker, and how that differs from the hosted stack.

## Two environments

| | Local Docker | Hosted (current production) |
| --- | --- | --- |
| Frontend | Next.js container or `npm run dev` on `:3000` | Vercel (`https://raushni.vercel.app`) |
| API | FastAPI container on `:8000` | Railway |
| CMS | Strapi container on `:1337` | Railway |
| Postgres | Compose `postgres` service (dual DBs) | Neon |
| Redis | Compose `redis` service | Upstash |
| Auth (site dashboard) | NextAuth env in Compose / `.env.dev` | Vercel env |
| Auth (CMS admin) | Strapi admin user created on first boot / seed | Railway Strapi |

Do **not** point local Compose at production Neon/Upstash unless you intend to. Default local URLs stay on `localhost`.

Security model for the hosted stack: [SECURITY.md](SECURITY.md).

## Prerequisites

- Docker Desktop (Windows/macOS) or Docker Engine + Compose v2 — **the daemon must be running**
- Optional: Node 18+, Python 3.11+ for running a single service outside Compose
- Optional: GNU Make (`make dev-up`) — or use the `docker compose` commands below

## Recommended: full local stack

From the repo root:

```bash
cp .env.dev.example .env.dev
docker compose --env-file .env.dev -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Or:

```bash
make dev-up
```

(`make` uses `.env.dev.example` directly. Prefer copying to `.env.dev` if you customize secrets.)

**Important:** always merge both Compose files. `docker-compose.dev.yml` alone is an override file and will fail validation if used by itself. Base `docker-compose.yml` alone starts Strapi with production-style settings that are awkward for day-to-day DX.

### URLs

| URL | Service |
| --- | --- |
| http://localhost:3000 | Frontend |
| http://localhost:8000 | Backend API |
| http://localhost:8000/health | Backend health |
| http://localhost:1337 | Strapi |
| http://localhost:1337/admin | Strapi admin |
| localhost:5432 | Postgres |
| localhost:6379 | Redis |

Optional nginx on `:80` / `:443` is part of the full Compose stack.

### Default local dashboard login

From `.env.dev.example` (override in `.env.dev` as needed):

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@raushni.com` | `LocalDevAdminPass1!` |
| Staff | `staff@raushni.com` | `LocalDevStaffPass1!` |

These are local-only. They intentionally avoid `ChangeMe` / `replace-` strings, which the app treats as unusable placeholders.

Strapi CMS admin is separate: create the first admin in `/admin` on a fresh volume, or use your team’s seed/credentials process.

### Seed CMS content

After Strapi is healthy:

```bash
docker compose --env-file .env.dev -f docker-compose.yml -f docker-compose.dev.yml exec strapi npm run seed:raushni
```

### Stop

```bash
make dev-down
# or
docker compose --env-file .env.dev -f docker-compose.yml -f docker-compose.dev.yml down
```

Add `-v` only if you want to wipe Postgres/Redis/upload volumes.

## API-only / lighter stack

`docker-compose.minimal.yml` brings up Postgres, Redis, backend, and a thin frontend. It does **not** run Strapi or nginx. Prefer the full stack above unless you are iterating on API-only work.

```bash
docker compose -f docker-compose.minimal.yml up --build
```

## Running services outside Docker

Keep Compose Postgres + Redis (or your own), then:

**Frontend**

```bash
cd frontend
cp .env.example .env.local   # if present; otherwise copy values from .env.dev.example
npm install
npm run dev
```

Point `API_INTERNAL_URL` / `CMS_INTERNAL_URL` at `http://localhost:8000` and `http://localhost:1337` when the BFF runs on the host.

**Backend**

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
source .venv/bin/activate
pip install -r requirements.txt
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/raushni_backend
# REDIS_URL=redis://localhost:6379
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**CMS**

```bash
cd cms
cp .env.example .env
npm install
npm run develop
```

## Env files

| File | Role |
| --- | --- |
| `.env.dev.example` | Checked-in local Docker template (safe defaults) |
| `.env.dev` | Your local copy (gitignored if you create it) |
| `.env.example` | Production-oriented / hosted template |
| `frontend/.env.local` | Frontend when run on the host |
| `cms/.env` | CMS when run on the host |

Never commit real production secrets or credential dump files.

## Named hosts (`raushni-dev.com`)

Optional: map `raushni-dev.com` / `api.` / `cms.` to `127.0.0.1` (see `scripts/setup-dev-hosts.sh`) for nginx TLS and K8s-local smoke tests. That path is documented in [deployment/DEV_NONPROD_PLAYBOOK.md](deployment/DEV_NONPROD_PLAYBOOK.md). Day-to-day Docker work does **not** require it — use `localhost` ports.

## Troubleshooting

```bash
docker compose --env-file .env.dev -f docker-compose.yml -f docker-compose.dev.yml logs -f backend
docker compose --env-file .env.dev -f docker-compose.yml -f docker-compose.dev.yml logs -f frontend
docker compose --env-file .env.dev -f docker-compose.yml -f docker-compose.dev.yml logs -f strapi
curl http://localhost:8000/health
```

- First start builds images and can take several minutes.
- If Postgres init scripts already ran on an old volume, schema changes may need `down -v` (destructive) or manual migrations.
- Frontend Compose command clears `.next` on start so stale routes do not stick around.
- Port conflicts: stop the other process or change host port mappings in Compose.
