# Raushni Frontend

Next.js frontend for the Raushni Educational & Social Welfare Trust management platform.

The app includes public pages, authentication screens, dashboard modules, CMS integrations, API clients, shared UI components, and document-related helpers.

## Tech Stack

- Next.js 16 with the App Router
- React 18
- TypeScript
- Tailwind CSS
- NextAuth
- React Query
- Jest and React Testing Library
- Cypress for browser/e2e tests
- Storybook for UI component development

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- Raushni backend API running locally or reachable by URL
- CMS service running locally or reachable by URL, when working with content pages

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

The development server starts at:

```text
http://localhost:3000
```

If port `3000` is already in use, Next.js will choose another available port.

## Environment Variables

Create or update `frontend/.env.local` for local development.

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CMS_URL=http://localhost:1337
NEXT_PUBLIC_PYTHON_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-local-secret

NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true

NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf
```

Common variables:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL for backend API requests and `/api/:path*` rewrites. |
| `NEXT_PUBLIC_CMS_URL` | Base URL for CMS requests and `/cms/api/:path*` rewrites. |
| `NEXT_PUBLIC_PYTHON_URL` | URL for Python/document-generation service integrations. |
| `NEXT_PUBLIC_APP_URL` | Public app URL used by frontend flows. |
| `NEXTAUTH_URL` | Base URL used by NextAuth. |
| `NEXTAUTH_SECRET` | Local signing secret for NextAuth. |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enables or disables frontend analytics code paths. |
| `NEXT_PUBLIC_ENABLE_DEBUG_MODE` | Enables extra debug behavior in development. |
| `NEXT_PUBLIC_MAX_FILE_SIZE` | Maximum upload size in bytes. |
| `NEXT_PUBLIC_ALLOWED_FILE_TYPES` | Comma-separated list of allowed MIME types. |

Do not commit real production secrets.

## Scripts

```bash
npm run dev
```

Start the local Next.js development server.

```bash
npm run build
```

Create a production build.

```bash
npm run start
```

Run the production server after building.

```bash
npm run type-check
```

Run TypeScript checks without emitting files.

```bash
npm run lint
```

Run ESLint for TypeScript, TSX, JavaScript, and JSX files.

```bash
npm run test
npm run test:ci
npm run test:coverage
```

Run Jest tests.

```bash
npm run storybook
npm run build-storybook
```

Run or build Storybook.

```bash
npm run cypress:open
npm run cypress:run
```

Run Cypress tests.

## App Routes

Public pages:

- `/`
- `/about`
- `/activities`
- `/blog`
- `/careers`
- `/contact`
- `/donate`
- `/events`
- `/gallery`
- `/volunteer`

Authentication pages:

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password/[token]`
- `/verify-email/[token]`

Dashboard pages:

- `/dashboard`
- `/members`
- `/beneficiaries`
- `/donations`
- `/certificates`
- `/crowdfunding`
- `/internships`
- `/projects`
- `/activities`
- `/events`
- `/news`
- `/enquiries`
- `/reports`
- `/settings`

Some dashboard modules currently use a shared coming-soon placeholder while the full workflow screens are being built.

## Project Structure

```text
frontend/
  app/                 Next.js App Router routes and route groups
  components/          Reusable UI, layout, CMS, dashboard, and document components
  config/              Site, API, navigation, and app constants
  contexts/            React context providers
  public/              Static assets, icons, images, and PWA files
  services/            API, CMS, and websocket service clients
  types/               Shared TypeScript types
  utils/               Formatters, validators, helpers, and constants
```

Important route groups:

```text
app/(public)      Public website pages
app/(auth)        Login, register, and password flows
app/(dashboard)   Authenticated dashboard pages
app/api           Next.js API routes and webhooks
```

## API Rewrites

`next.config.js` proxies local frontend requests:

```text
/api/:path*      -> NEXT_PUBLIC_API_URL/api/:path*
/cms/api/:path*  -> NEXT_PUBLIC_CMS_URL/api/:path*
```

When the environment variables are missing, Docker-oriented defaults are used:

```text
http://backend:8000/api/:path*
http://strapi:1337/api/:path*
```

## Development Notes

- Use `@/` imports from the `frontend` root.
- Prefer shared components from `components/Common` and `components/UI` before adding new one-off UI.
- Keep API calls in `services/api` or `services/cms` instead of calling `fetch` directly from many components.
- Keep route-specific UI inside the related `app` route group when it is not reusable elsewhere.
- Static files should go in `public`.

## Quality Checks

Before opening a PR or deploying, run:

```bash
npm run type-check
npm run lint
npm run test:ci
npm run build
```

Current known lint warnings may appear for raw `<img>` usage in layout files. Replace those with `next/image` when optimizing images.

## Docker

Development image:

```bash
docker build -f Dockerfile.dev -t raushni-frontend-dev .
docker run --rm -p 3000:3000 raushni-frontend-dev
```

Production image:

```bash
docker build -t raushni-frontend .
docker run --rm -p 3000:3000 raushni-frontend
```

From the repository root, the full stack can also be started with Docker Compose:

```bash
docker-compose up -d
```

## Troubleshooting

If Next.js says another dev server is already running, stop the existing process or use the URL shown in the terminal.

If Jest reports a haste module naming collision with `.next/standalone/package.json`, remove the generated `.next` directory and run tests again:

```bash
rm -rf .next
npm run test:ci
```

If API calls fail locally, confirm the backend URL in `.env.local` and verify the backend is running:

```bash
curl http://localhost:8000/health
```

If CMS content is missing, confirm `NEXT_PUBLIC_CMS_URL` and verify Strapi is running:

```bash
curl http://localhost:1337
```
