# Deferred work

Features and surfaces intentionally not shipping in the current honesty / multi-tenant waves.

## ComingSoon modules (Wave 1 Agent A)

Nav entries and placeholder UIs removed or redirected:

| Surface | Status |
|---------|--------|
| **Reports** (`/reports`) | Removed from dashboard nav; route redirects to `/dashboard`. |
| **Help & Support** (`/help`) | Removed from dashboard nav; route redirects to `/dashboard`. |
| **Beneficiary create** (`/beneficiaries/create`) | ComingSoon removed; redirects to `/beneficiaries` list (list CRUD remains live). |
| **Beneficiary detail** (`/beneficiaries/[id]`) | ComingSoon removed; redirects to `/beneficiaries` list. |

Revisit when real report export, help content, and beneficiary create/detail workflows exist.

## Still stubbed (document only; not killed this wave)

- Auth recovery pages (forgot password / reset) may still show “Coming soon.”; optional redirect to login later.
- Public blog/events slug stubs.
- Frontend `services/api/reports.ts` / `reportService.ts` quarantined stubs remain for type imports until reports land.

## Payments / platform (other waves)

- Razorpay integration.
- Public Stripe card/netbanking menu entries (backend Stripe paths may remain unused).
- Apple Pay / Google Pay.
- Document-generator service revival (see `services/document_generator/STUB.md`).
- Better Auth rewrite (memberships + NextAuth bridge only for now).
- Kong API gateway.
- Regenerated print PDFs vs issued receipt DB snapshot archive (later).
