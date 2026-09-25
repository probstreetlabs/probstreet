# API Service

The primary core HTTP backend service for Probstreet, handling all user-facing and admin REST endpoints.

This service manages user authentication, wallet operations, market queries, and admin operations. It delegates order execution and state synchronization to the matching engine via Redis queues to maintain low latency.

## Setup

1. Install dependencies from the workspace root.
2. Make sure your background infrastructure (Redis, Postgres, Kafka) is running first.
3. Run the service locally:
   ```bash
   bun start
   ```

## Key Technologies

- **Runtime:** Bun
- **Framework:** Hono
- **Validation:** Zod (`@hono/zod-validator`)
- **Database:** PostgreSQL (Prisma via `@probstreet/database`)
- **Caching & Queues:** Redis (ioredis)
- **Observability:** New Relic

### Route Namespaces

- **Client API (`/capi`):** Authentication, wallet, user profiles, market queries, and order submissions.
- **Admin API (`/aapi`):** Market creation, event resolution, user management, and KYC approvals.
- **Public API (`/papi`):** Health checks and other public/system utility routes.
