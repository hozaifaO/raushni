# Raushni CMS

Production-ready Strapi CMS service for Raushni content, media, and publishing workflows.

## What It Manages

- Public landing page content through the `landing-page` single type
- Hero copy, mission, objectives, success stories, volunteer content, and contact details
- Logo, banner, and hero video media fields
- Public read access for landing page content after seeding

## Local Development With Full Stack

Prefer the root local guide: [docs/LOCAL_DEV.md](../docs/LOCAL_DEV.md).

From the repository root:

```bash
cp .env.dev.example .env.dev
docker compose --env-file .env.dev -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Open Strapi at:

```text
http://localhost:1337/admin
```

Seed professional Raushni content after the CMS container is healthy:

```bash
docker compose --env-file .env.dev -f docker-compose.yml -f docker-compose.dev.yml exec strapi npm run seed:raushni
```

## Standalone CMS

From this `cms/` directory:

```bash
cp .env.example .env
docker compose up --build
```

Then seed content:

```bash
docker compose exec strapi npm run seed:raushni
```

## Production Notes

Before deployment, replace every placeholder secret in `.env`:

```bash
openssl rand -base64 32
```

Set these values:

- `STRAPI_APP_KEYS`
- `STRAPI_API_TOKEN_SALT`
- `STRAPI_ADMIN_JWT_SECRET`
- `STRAPI_JWT_SECRET`
- `STRAPI_TRANSFER_TOKEN_SALT`
- `CMS_PUBLIC_URL`
- `CMS_CORS_ORIGINS`
- database username/password values

Uploads are persisted in the `strapi_uploads` volume in the root stack and `cms_uploads` in standalone mode.
