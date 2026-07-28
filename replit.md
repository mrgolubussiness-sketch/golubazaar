# GoluBazaar

A full-stack e-commerce storefront for premium digital goods (game accounts, OTT subscriptions, Discord upgrades). Built as a pnpm monorepo.

## Architecture

| Package | Path | Purpose |
|---|---|---|
| `@workspace/golustore` | `artifacts/golustore` | React + Vite storefront (public + admin) |
| `@workspace/api-server` | `artifacts/api-server` | Express 5 REST API |
| `@workspace/db` | `lib/db` | Drizzle ORM + PostgreSQL schema |
| `@workspace/api-zod` | `lib/api-zod` | Zod validation schemas (generated) |
| `@workspace/api-client-react` | `lib/api-client-react` | React Query hooks (generated from OpenAPI spec) |
| `@workspace/api-spec` | `lib/api-spec` | OpenAPI spec + Orval codegen config |

## Running the app

Both services start automatically via Replit workflows:

- **Frontend** (`artifacts/golustore: web`) — Vite dev server on `$PORT` (25722)
- **API server** (`artifacts/api-server: API Server`) — Express on port 8080

The Vite dev server proxies `/api/*` requests to the API server at `http://localhost:8080`.

## Database

Uses Replit's built-in PostgreSQL (Drizzle ORM). Schema is in `lib/db/src/schema/`.

To push schema changes to the database:
```bash
cd lib/db && pnpm run push
```

## Environment variables / secrets

| Variable | Where set | Purpose |
|---|---|---|
| `DATABASE_URL` | Replit built-in (auto) | PostgreSQL connection string |
| `SESSION_SECRET` | Replit Secrets | Cookie signing for admin sessions |
| `PORT` | Replit artifact config (auto) | Per-service port |
| `BASE_PATH` | Replit artifact config (auto) | URL base path for Vite |

## Admin panel

The admin panel lives at a secret path: `/golustore-control`  
(Not linked anywhere on the public site.)

## Code generation

API client hooks and Zod schemas are generated from `lib/api-spec/openapi.yaml` using Orval:
```bash
cd lib/api-spec && pnpm run generate
```

## User preferences

<!-- Agent: add user preferences here when asked to remember something -->
