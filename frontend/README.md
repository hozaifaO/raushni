# Raushni Frontend

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38BDF8)](https://tailwindcss.com/)
[![Jest](https://img.shields.io/badge/Jest-tested-C21325)](https://jestjs.io/)

The Raushni frontend is the web experience for Raushni Educational & Social Welfare Trust. It powers the public website, authentication flows, administrative dashboard, CMS-backed content, document workflows, API integrations, and reusable UI system for the platform.

This app is built with the Next.js App Router and is designed to run both as part of the full Docker Compose stack and as an individual local development service.

## At a Glance

| Area | Details |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI runtime | React 18 |
| Language | TypeScript with strict checks |
| Styling | Tailwind CSS |
| Auth | NextAuth and app-level auth contexts |
| API layer | Service modules under `services/api` and `services/cms` |
| Testing | Jest, React Testing Library, Cypress |
| UI development | Storybook |
| Build output | Next.js standalone production output |

## Product Areas

| Area | Routes and responsibilities |
| --- | --- |
| Public site | Home, about, activities, events, blog, gallery, careers, volunteer, contact, and donation entry points. |
| Authentication | Login, registration, password reset, email verification, and auth route handlers. |
| Dashboard shell | Shared header, sidebar, footer, navigation, settings context, notifications, and protected workflows. |
| Management modules | Members, beneficiaries, donations, crowdfunding, internships, projects, enquiries, reports, news, activities, certificates, and settings. |
| CMS integration | Rich content rendering, media upload, preview mode, SEO metadata, and CMS webhooks. |
| Documents | Document preview, download helpers, QR generation, upload helpers, and PDF-related workflows. |

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- Backend API available locally or by URL
- CMS service available locally or by URL when working with CMS-backed content

Recommended full-stack local services:

| Service | Default URL |
| --- | --- |
| Frontend | `http://localhost:3000` |
| Backend API | `http://localhost:8000` |
| CMS | `http://localhost:1337` |

## Quick Start

From the repository root:

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

If port `3000` is already in use, Next.js will print the alternate local URL.

## Environment Configuration

Full Docker stack: [docs/LOCAL_DEV.md](../docs/LOCAL_DEV.md). Hosted secrets model: [docs/SECURITY.md](../docs/SECURITY.md).

When running the frontend on the host:

```bash
cp .env.example .env.local
```

Example local values (see `.env.example` for the full list):

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CMS_URL=http://localhost:1337
NEXT_PUBLIC_PYTHON_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=local-dev-nextauth-secret-32chars!!
NEXTAUTH_ADMIN_EMAIL=admin@raushni.com
NEXTAUTH_ADMIN_PASSWORD=LocalDevAdminPass1!

API_INTERNAL_URL=http://localhost:8000
CMS_INTERNAL_URL=http://localhost:1337
INTERNAL_API_KEY=localdev-internal-api-key-xxxxxxxx
CMS_API_TOKEN=localdev-cms-api-token-xxxxxxxxxxxx
```

Environment variables:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL used by clients and `/api/:path*` rewrites. |
| `NEXT_PUBLIC_CMS_URL` | Yes | CMS base URL used by clients and `/cms/api/:path*` rewrites. |
| `NEXT_PUBLIC_PYTHON_URL` | Optional | Python/document service URL for document-related integrations. |
| `NEXT_PUBLIC_APP_URL` | Recommended | Canonical frontend URL for app flows and links. |
| `NEXTAUTH_URL` | Yes for auth | Base URL used by NextAuth. |
| `NEXTAUTH_SECRET` | Yes for auth | Secret used by NextAuth signing/encryption. |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Optional | Enables analytics-related frontend behavior. |
| `NEXT_PUBLIC_ENABLE_DEBUG_MODE` | Optional | Enables extra debug behavior in development. |
| `NEXT_PUBLIC_MAX_FILE_SIZE` | Optional | Maximum upload size in bytes. |
| `NEXT_PUBLIC_ALLOWED_FILE_TYPES` | Optional | Comma-separated list of allowed upload MIME types. |

Never commit real production secrets.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Start the production server after building. |
| `npm run lint` | Run ESLint across TS, TSX, JS, and JSX files. |
| `npm run type-check` | Run TypeScript without emitting output. |
| `npm run test` | Run Jest tests. |
| `npm run test:ci` | Run Jest in CI mode with no-watch behavior. |
| `npm run test:watch` | Run Jest in watch mode. |
| `npm run test:coverage` | Generate Jest coverage output. |
| `npm run format` | Format files with Prettier. |
| `npm run format:check` | Check Prettier formatting. |
| `npm run analyze` | Run a production build with bundle analysis enabled. |
| `npm run storybook` | Start Storybook on port `6006`. |
| `npm run build-storybook` | Build Storybook. |
| `npm run cypress:open` | Open Cypress. |
| `npm run cypress:run` | Run Cypress headlessly. |

## Quality Gate

Run these before opening a pull request or shipping a build:

```bash
npm run type-check
npm run lint
npm run test:ci
npm run build
```

Current known lint warnings may appear for raw `<img>` usage in layout files. Prefer `next/image` when optimizing those images.

## Project Structure

```text
frontend/
  app/                     Next.js App Router routes, layouts, route groups, and API routes
  components/              Shared UI, layout, CMS, dashboard, and document components
  config/                  Site, API, navigation, and app constants
  contexts/                React providers for auth, CMS, notifications, settings, and theme
  public/                  Static assets, favicons, images, PWA assets, and fonts
  services/                API clients, CMS services, webhooks, and websocket clients
  types/                   Shared request, response, model, and app TypeScript types
  utils/                   Formatters, validators, file helpers, QR helpers, and constants
```

Route groups:

```text
app/(public)       Public website pages
app/(auth)         Login, register, and account recovery pages
app/(dashboard)    Dashboard shell and management modules
app/api            Next.js API routes, uploads, revalidation, and webhooks
```

## Route Map

Public routes:

| Route | Purpose |
| --- | --- |
| `/` | Home page |
| `/about` | Organization overview |
| `/activities` | Public activity content |
| `/blog` | Blog/news-style content |
| `/careers` | Career and opportunity information |
| `/contact` | Contact page |
| `/donate` | Donation entry point |
| `/events` | Public events |
| `/gallery` | Media gallery |
| `/volunteer` | Volunteer entry point |

Authentication routes:

| Route | Purpose |
| --- | --- |
| `/login` | Sign in |
| `/register` | Account registration |
| `/forgot-password` | Password reset request |
| `/reset-password/[token]` | Password reset confirmation |
| `/verify-email/[token]` | Email verification |

Dashboard routes:

| Route | Purpose |
| --- | --- |
| `/dashboard` | Dashboard landing area |
| `/members` | Member management |
| `/beneficiaries` | Beneficiary management |
| `/beneficiaries/create` | Beneficiary creation |
| `/beneficiaries/[id]` | Beneficiary details |
| `/donations` | Donation management |
| `/certificates` | Certificate workflows |
| `/crowdfunding` | Crowdfunding campaigns |
| `/internships` | Internship workflows |
| `/projects` | Project management |
| `/news` | News management |
| `/enquiries` | Enquiry management |
| `/reports` | Reports |
| `/settings` | Settings |
| `/dashboard/events` | Dashboard event management |

Some dashboard modules currently render a shared coming-soon placeholder while their full workflow screens are implemented.

API routes:

| Route | Purpose |
| --- | --- |
| `/api/auth/[...nextauth]` | NextAuth route handler |
| `/api/upload` | Upload handler |
| `/api/revalidate` | Revalidation handler |
| `/api/cms/webhook` | CMS webhook handler |
| `/api/webhook/stripe` | Stripe webhook handler |

## Frontend Architecture

The frontend keeps route concerns, reusable UI, and integration code separated:

| Layer | Location | Guidance |
| --- | --- | --- |
| Pages and layouts | `app/` | Keep route-specific composition here. |
| Reusable UI | `components/` | Prefer existing common or UI components before adding new patterns. |
| API access | `services/api/` | Keep backend calls in typed service modules. |
| CMS access | `services/cms/` | Keep Strapi/content operations isolated from page components. |
| Shared state | `contexts/` | Use providers for app-wide state such as auth, theme, settings, and notifications. |
| Domain types | `types/` | Keep request, response, and model contracts explicit. |
| Helpers | `utils/` | Keep formatting, validation, export, download, file, and QR helpers reusable. |

## API Rewrites and Integrations

`next.config.js` proxies frontend requests to local services:

```text
/api/:path*      -> NEXT_PUBLIC_API_URL/api/:path*
/cms/api/:path*  -> NEXT_PUBLIC_CMS_URL/api/:path*
```

Fallbacks are Docker-oriented:

```text
http://backend:8000/api/:path*
http://strapi:1337/api/:path*
```

Security headers configured globally:

| Header | Value |
| --- | --- |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `1; mode=block` |

Allowed remote image hosts:

- `localhost`
- `api.raushni.com`
- `cms.raushni.com`

## Docker

Build and run the development image:

```bash
docker build -f Dockerfile.dev -t raushni-frontend-dev .
docker run --rm -p 3000:3000 raushni-frontend-dev
```

Build and run the production image:

```bash
docker build -t raushni-frontend .
docker run --rm -p 3000:3000 raushni-frontend
```

Run the complete platform from the repository root:

```bash
docker-compose up -d
```

## Development Standards

- Use `@/` imports from the `frontend` root.
- Keep API calls in `services/api` or `services/cms`.
- Keep route-only components inside the relevant `app` route group.
- Use shared `components/Common` and `components/UI` patterns before adding new primitives.
- Keep business display formatting inside `utils/formatters`.
- Keep validation logic inside `utils/validators` or schema-specific modules.
- Store static assets in `public`.
- Avoid committing generated output such as `.next/`, coverage folders, screenshots, and local build artifacts.

## Troubleshooting

If the dev server reports that another Next.js process is already running, use the URL shown by Next.js or stop the existing process.

If API calls fail locally, check the backend health endpoint:

```bash
curl http://localhost:8000/health
```

If CMS requests fail, confirm Strapi is running:

```bash
curl http://localhost:1337
```

If Jest reports a haste module naming collision with `.next/standalone/package.json`, remove the generated build directory and rerun tests:

```bash
rm -rf .next
npm run test:ci
```

If a production build fails only inside a restricted sandbox because Turbopack cannot bind a local port, rerun the build in a normal local shell:

```bash
npm run build
```

## Related Documentation

- [Root project README](../README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
