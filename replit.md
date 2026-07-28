# GoluStore (GoluBazaar)

A full-stack e-commerce web app for selling premium digital services (game accounts, OTT subscriptions, Discord upgrades, etc.).

## Stack

- **Frontend** (`artifacts/golustore`): React + Vite + Tailwind v4 + shadcn/ui + Wouter + TanStack Query + Clerk auth
- **API Server** (`artifacts/api-server`): Express 5 + Clerk auth middleware + Drizzle ORM
- **Database** (`lib/db`): Replit-managed PostgreSQL via Drizzle ORM
- **Auth**: Replit-managed Clerk (whitelabel)
- **Shared libs**: `lib/api-spec` (OpenAPI), `lib/api-client-react` (generated client), `lib/api-zod` (Zod schemas)

## How to run

All three workflows are configured and start automatically:

| Workflow | Command |
|---|---|
| `artifacts/golustore: web` | `pnpm --filter @workspace/golustore run dev` |
| `artifacts/api-server: API Server` | `pnpm --filter @workspace/api-server run dev` |
| `artifacts/mockup-sandbox: Component Preview Server` | `pnpm --filter @workspace/mockup-sandbox run dev` |

## Required secrets

| Secret | Purpose |
|---|---|
| `CLERK_SECRET_KEY` | Clerk server-side auth (auto-provisioned) |
| `CLERK_PUBLISHABLE_KEY` | Clerk key (auto-provisioned) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk key exposed to the frontend (auto-provisioned) |
| `ADMIN_EMAIL` | Initial admin account email |
| `ADMIN_PASSWORD` | Initial admin account password |
| `SESSION_SECRET` | Cookie signing secret |
| `DATABASE_URL` | PostgreSQL connection string (auto-provisioned by Replit) |

## Database

Schema is managed with Drizzle. To push schema changes to the dev database:

```bash
pnpm --filter @workspace/db run push
```

Tables: `products`, `categories`, `orders`, `coupons`, `reviews`, `faq`, `store_settings`, `admin_credentials`.

## Admin panel

Available at `/golustore-control`. Log in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` credentials set as secrets.

## User preferences

_None recorded yet._
