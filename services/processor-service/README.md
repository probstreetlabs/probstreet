# Processor Service

The service is responsible for processing core events and persisting state in Probstreet database.

This service listens to events emitted from Kafka by the Matching Engine, handles database writes (trades, balance updates, market resolution), and broadcasts real-time updates via Redis Pub/Sub.

## Setup

1. Install dependencies from the workspace root.
2. Make sure your Docker services (Kafka, Zookeeper, Redis, Postgres) are running first.
3. Run the service locally:
   ```bash
   bun start
   ```

## Key Technologies

- **Runtime:** Bun
- **Database:** PostgreSQL (Prisma via `@probstreet/database`)
- **Message Broker:** Kafka (kafkajs)
- **Pub/Sub:** Redis (ioredis)
- **Validation:** Zod
- **Observability:** OpenTelemetry & Sentry
- **Time Series DB:** InfluxDB

## How It Works

The Processor Service is an event-driven service:

### 1. Event Consumption
It listens to Kafka topics for events emitted by the Matching Engine (e.g., trade executions, order creations, market resolutions).

### 2. Event Processing
When an event is received, the service:
- Parses and processes the event asynchronously.
- Interacts with the PostgreSQL database to persist state changes (transactions, ledger entries, orders).
- Publishes updates to Redis Pub/Sub so that other services (like the Stream Service) can push real-time updates to connected clients.
- Talks to notification service to send notifications to users (email, in-app & push notifications).
