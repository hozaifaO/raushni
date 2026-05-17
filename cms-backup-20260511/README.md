# Raushni CMS

[![Strapi](https://img.shields.io/badge/Strapi-4.15.5-4945FF)](https://strapi.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1)](https://www.postgresql.org/)
[![Jest](https://img.shields.io/badge/Jest-tested-C21325)](https://jestjs.io/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED)](https://www.docker.com/)

Raushni CMS is the Strapi-powered content management service for Raushni Educational & Social Welfare Trust. It owns structured content for the public website, media workflows, SEO metadata, editorial publishing, and operational content that is consumed by the Next.js frontend and other platform services.

The CMS can run as part of the root Docker Compose stack or independently from this directory.

## At a Glance

| Area | Details |
| --- | --- |
| Framework | Strapi 4 |
| Runtime | Node.js 18 through 20 |
| Primary database | PostgreSQL |
| Local container port | `1337` |
| Admin panel | `http://localhost:1337/admin` |
| API styles | REST and GraphQL |
| Media provider | AWS S3 configuration, local uploads in development |
| Email provider | SMTP through Strapi email plugin |
| Tests | Jest contract tests and optional live e2e checks |

## Responsibilities

| Capability | Description |
| --- | --- |
| Editorial content | News, activities, events, project stories, reports, and public content. |
| Structured operations data | Members, beneficiaries, donations, expenses, enquiries, and designations. |
| Media management | Images, files, galleries, report uploads, receipt files, and profile assets. |
| SEO | Reusable metadata component for public content types. |
| APIs | Strapi REST endpoints and GraphQL endpoint for frontend consumption. |
| Admin workflows | Role-based Strapi admin access for content maintainers. |

## Content Model

Collection types:

| Collection | Purpose |
| --- | --- |
| `activity` | Program updates, field activity, and community work. |
| `beneficiary` | People or families supported through Raushni programs. |
| `designation` | Organizational member roles and designations. |
| `donation` | Donation records and receipt metadata. |
| `enquiry` | Public enquiries from contact and volunteer flows. |
| `event` | Public or internal events. |
| `expense` | Operational and program expense records. |
| `member` | NGO member management with unique member IDs and emails. |
| `news` | Announcements, stories, and updates. |
| `project` | Program and impact project records. |
| `report` | Annual, audit, impact, financial, and program reports. |

Reusable components:

| Component | Purpose |
| --- | --- |
| `shared.seo` | Meta title, description, image, robots, canonical URL, and structured data. |
| `shared.rich-text` | Reusable rich text block. |
| `media.image` | Reusable image with caption and alternative text. |

## Prerequisites

- Node.js 18 through 20
- npm 9 or newer
- PostgreSQL 15, or Docker for the bundled database
- Docker and Docker Compose for containerized local development

## Quick Start

From the repository root:

```bash
cd cms
npm install
cp .env.example .env
npm run develop
```

Open the Strapi admin panel:

```text
http://localhost:1337/admin
```

## Docker Development

Run the CMS with its dedicated PostgreSQL service:

```bash
cd cms
docker-compose up -d
```

Useful commands:

```bash
docker-compose logs -f strapi
docker-compose logs -f postgres
docker-compose down
```

The dedicated CMS Compose file maps PostgreSQL to host port `5433` to avoid colliding with the root stack database on `5432`.

## Full Platform Mode

From the repository root:

```bash
docker-compose up -d
```

The root stack starts:

| Service | URL |
| --- | --- |
| Frontend | `http://localhost:3000` |
| Backend API | `http://localhost:8000` |
| CMS | `http://localhost:1337` |
| PostgreSQL | `localhost:5432` |
| Redis | `localhost:6379` |

## Environment Variables

Create `cms/.env` from `cms/.env.example`.

```bash
HOST=0.0.0.0
PORT=1337
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
TRANSFER_TOKEN_SALT=your-transfer-token-salt
JWT_SECRET=your-jwt-secret

DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=raushni_cms
DATABASE_USERNAME=strapi_user
DATABASE_PASSWORD=strapi_password
DATABASE_SSL=false

PUBLIC_URL=http://localhost:1337
GRAPHQL_PLAYGROUND=true
```

Important variables:

| Variable | Required | Purpose |
| --- | --- | --- |
| `APP_KEYS` | Yes | Comma-separated Strapi app keys. |
| `API_TOKEN_SALT` | Yes | Salt for Strapi API tokens. |
| `ADMIN_JWT_SECRET` | Yes | Secret for admin JWT sessions. |
| `TRANSFER_TOKEN_SALT` | Yes | Salt for Strapi transfer tokens. |
| `JWT_SECRET` | Yes | Users-permissions JWT secret. |
| `DATABASE_*` | Yes | PostgreSQL connection settings. |
| `PUBLIC_URL` | Recommended | Public CMS URL used by Strapi. |
| `SMTP_*` | Optional | SMTP email settings. |
| `AWS_*` | Optional | S3 upload provider credentials. |
| `GRAPHQL_PLAYGROUND` | Optional | Enables GraphQL playground in allowed environments. |

Never commit production secrets.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run develop` | Start Strapi in development mode. |
| `npm run start` | Start Strapi in production mode. |
| `npm run build` | Build the Strapi admin panel. |
| `npm run strapi` | Run the Strapi CLI. |
| `npm run lint` | Run ESLint. |
| `npm run format` | Format files with Prettier. |
| `npm run seed` | Seed baseline CMS data. |
| `npm run test` | Run Jest tests. |
| `npm run test:ci` | Run Jest in CI mode. |
| `npm run test:e2e` | Run live CMS e2e checks against `CMS_BASE_URL`. |
| `npm run test:watch` | Run Jest in watch mode. |
| `npm run test:coverage` | Generate Jest coverage. |

Makefile helpers:

```bash
make help
make build
make start
make stop
make logs
make seed
make backup
```

## Testing Strategy

The CMS test suite has two layers.

Contract tests:

```bash
npm run test:ci
```

These validate:

- Strapi config modules resolve correctly.
- Database config points to PostgreSQL with sane pool settings.
- Plugin config enables email, upload, SEO, GraphQL, and users-permissions.
- Content-type schema files are valid JSON Strapi collection schemas.
- Public content schemas include SEO metadata.
- Member identity fields remain required and unique.

Live e2e checks:

```bash
CMS_BASE_URL=http://localhost:1337 npm run test:e2e
```

These validate a running CMS responds through real HTTP requests. Start the CMS before running them:

```bash
npm run develop
```

or:

```bash
docker-compose up -d
```

## Project Structure

```text
cms/
  config/                 Strapi server, database, plugin, admin, and API config
  database/               CMS database assets
  public/                 Public uploads and static assets
  scripts/                Seed, webhook, and maintenance scripts
  src/admin/              Admin customization
  src/api/                Strapi collection types, controllers, services, and lifecycles
  src/components/         Reusable Strapi components
  src/extensions/         Plugin extensions and policies
  tests/                  Jest contract tests and live e2e checks
```

## API Access

Strapi exposes REST APIs under:

```text
http://localhost:1337/api
```

GraphQL is available at:

```text
http://localhost:1337/graphql
```

Frontend rewrites usually access the CMS through:

```text
/cms/api/:path*
```

which maps to:

```text
NEXT_PUBLIC_CMS_URL/api/:path*
```

## Seeding

Seed baseline data:

```bash
npm run seed
```

The current seed script creates:

- Default admin user when missing.
- Default `Volunteer` designation when missing.

Review and update default credentials before using seed data outside local development.

## Deployment Notes

Production image:

```bash
docker build -t raushni-cms .
docker run --rm -p 1337:1337 --env-file .env raushni-cms
```

Operational guidance:

- Use strong `APP_KEYS`, salts, and JWT secrets.
- Use managed PostgreSQL for production.
- Store uploads in durable object storage such as S3.
- Disable GraphQL playground in public production environments unless explicitly required.
- Keep admin access behind appropriate authentication and network controls.
- Back up the CMS database before schema changes or Strapi upgrades.

## Troubleshooting

If Strapi cannot connect to PostgreSQL, verify:

```bash
docker-compose logs -f postgres
docker-compose logs -f strapi
```

If port `1337` is already in use, stop the conflicting process or change the port mapping in `docker-compose.yml`.

If Docker build fails on dependency installation, remove stale Docker cache and rebuild:

```bash
docker-compose build --no-cache strapi
```

If tests cannot run, install dependencies first:

```bash
npm install
npm run test:ci
```

Strapi 4 does not support Node 21 or newer. If native dependencies such as `better-sqlite3` fail during install, switch to Node 18 or Node 20 and reinstall dependencies.

If e2e tests are skipped, set `RUN_CMS_E2E=true` or run:

```bash
npm run test:e2e
```

## Related Documentation

- [Root README](../README.md)
- [Frontend README](../frontend/README.md)
- [Strapi Documentation](https://docs.strapi.io/)
- [Strapi GraphQL Plugin](https://docs.strapi.io/dev-docs/plugins/graphql)
