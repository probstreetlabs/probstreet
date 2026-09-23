# Notification Service

The serverless worker responsible for processing and delivering all user notifications in Probstreet.

This service is designed as a Cloudflare Worker that consumes events (like `market.created`, `trade.executed`, `price.alert`, `market.resolved`, `oracle.review`, `oracle.resolved`, `archive.failed`, and payment events) and dispatches the appropriate notifications via Email (Agentmail), Push (Firebase), and In-App (via Stream Service).

## Setup

1. Install dependencies from the workspace root.
2. Set up the `.dev.vars` file for cloudflare variables (if running locally):
   ```bash
   cp .dev.vars.example .dev.vars
   ```
3. Run the worker locally:
   ```bash
   bun dev
   ```

## Key Technologies

- **Runtime:** Cloudflare Workers (via Wrangler)
- **Validation:** Zod (Environment Variables)
- **Database:** Prisma (Neon Edge)
- **Email:** Agentmail
- **In-App Notifications:** Stream Service
- **Push Notifications:** Firebase Cloud Messaging (FCM)

## How It Works

The Notification Service is an event-driven worker:

### 1. Queue Handler

Events are pushed into a Cloudflare Queue. The worker consumes messages from this queue in batches, processing them asynchronously and retrying on failures automatically.

### 2. Event Processing

When an event (e.g., `trade.executed`) is processed, the service:

- Fetches user notification preferences.
- Evaluates if the user wants an Email, Push Notification, or In-App alert.
- Triggers the appropriate third-party API (Agentmail/Firebase) or hits the internal `stream-service` API.
