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

## Platform notes (macOS / Windows / Linux)

Day-to-day work targets **localhost ports**. Named hosts (`raushni-dev.com`) are optional.

### Docker

| Platform | Notes |
| --- | --- |
| **macOS** | Install [Docker Desktop](https://docs.docker.com/desktop/). Give it enough RAM (8 GB+ recommended; Strapi + Next + Postgres are heavy). On Apple Silicon, images here are multi-arch friendly; if a pull fails, retry after Desktop is fully started. |
| **Windows** | Use Docker Desktop with the **WSL2** backend (not Hyper-V legacy). Prefer running Compose from **PowerShell, Windows Terminal, or WSL** after Desktop shows “Running”. Error `dockerDesktopLinuxEngine` / pipe not found usually means Desktop is stopped. |
| **Linux** | Docker Engine + Compose plugin (`docker compose`). Add your user to the `docker` group so you do not need `sudo` for every command. |

Bind mounts:

- Compose already uses anonymous volumes for `node_modules` (frontend/CMS) so host OS modules do not overwrite Linux container modules.
- On macOS/Windows, first `npm install` inside a container can be slow; subsequent starts are faster.
- If file watching misses edits on Docker Desktop, restart the service or toggle Desktop → Settings → General file-sharing / VirtioFS (macOS).

### Make vs plain Compose

`make dev-up` / `make dev-down` need GNU Make:

| Platform | How |
| --- | --- |
| macOS | `make` from Xcode CLT or Homebrew (`brew install make`) |
| Linux | Usually preinstalled (`build-essential` / `make`) |
| Windows | Not default. Use **Git Bash**, **WSL**, or Chocolatey/Scoop `make` — or skip Make and run the `docker compose …` commands in this doc |

### Shell / line endings

- Repo shell scripts (`scripts/*.sh`, container entrypoints) expect **LF** endings. `.gitattributes` forces LF for `*.sh`. If a script fails with `$'\r': command not found`, fix CRLF (`git add --renormalize .` after pull) or run from WSL/Git Bash.
- Prefer `docker compose` (v2 plugin). Older `docker-compose` (hyphen) often still works but is not what CI/docs assume.

### Ports

| Port | Quirk |
| --- | --- |
| `3000`, `8000`, `1337`, `5432`, `6379` | Normal user ports — fine on all platforms if nothing else binds them. |
| `80` / `443` (nginx in full Compose) | On macOS/Linux, binding may need elevated privileges or conflict with local Apache/nginx. On Windows, another service (IIS, Skype legacy) can own them. If nginx fails to start, you can still use direct service ports above. |

### Copying env files

```bash
# macOS / Linux / Git Bash / WSL
cp .env.dev.example .env.dev
```

```powershell
# Windows PowerShell
Copy-Item .env.dev.example .env.dev
```

### Health checks / curl

```bash
# macOS / Linux / Git Bash / WSL
curl http://localhost:8000/health
```

```powershell
# Windows PowerShell
Invoke-WebRequest http://localhost:8000/health | Select-Object -ExpandProperty Content
# or, if curl.exe is on PATH (Windows 10+):
curl.exe http://localhost:8000/health
```

### Python venv (host, not Compose)

```bash
# macOS / Linux
python3 -m venv .venv && source .venv/bin/activate
```

```powershell
# Windows PowerShell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### Optional named hosts

| Platform | Setup |
| --- | --- |
| macOS / Linux | `sudo ./scripts/setup-dev-hosts.sh` |
| Windows (Admin PowerShell) | `.\scripts\setup-dev-hosts.ps1` |
| Windows (WSL) | Prefer the `.sh` script against WSL’s `/etc/hosts`, or edit `C:\Windows\System32\drivers\etc\hosts` as Administrator |

Hosts file is only needed for nginx TLS / smoke scripts that expect `*.raushni-dev.com`. Localhost Compose does not need it.

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
cp .env.example .env.local
npm install
npm run dev
```

Point `API_INTERNAL_URL` / `CMS_INTERNAL_URL` at `http://localhost:8000` and `http://localhost:1337` when the BFF runs on the host.

**Backend**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .\.venv\Scripts\Activate.ps1
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

Optional: map `raushni-dev.com` / `api.` / `cms.` to `127.0.0.1` for nginx TLS and K8s-local smoke tests. Day-to-day Docker work does **not** require it — use `localhost` ports.

- macOS/Linux: `sudo ./scripts/setup-dev-hosts.sh`
- Windows: elevated PowerShell `.\scripts\setup-dev-hosts.ps1`

More context: [deployment/DEV_NONPROD_PLAYBOOK.md](deployment/DEV_NONPROD_PLAYBOOK.md).

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
- Port conflicts: stop the conflicting process or change the mapped ports in Compose.
- **Docker daemon down:** start Docker Desktop (macOS/Windows) or `sudo systemctl start docker` (Linux).
- **Windows + Make missing:** use the long `docker compose …` form instead of `make dev-up`.
- **nginx cannot bind 80/443:** ignore nginx and open services on `3000`/`8000`/`1337`, or free those ports.
- **Shell script `\r` errors:** LF line endings required; see Platform notes above.
