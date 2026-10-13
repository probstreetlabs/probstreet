# Probstreet Load Testing Suite

This directory contains the k6 load testing suite for Probstreet, focusing on generating credible, reproducible performance metrics.

## Prerequisites

1. Install [k6](https://k6.io/docs/get-started/installation/). (e.g. `brew install k6` on macOS).
2. Ensure you have the full backend stack running (API service, matching engine, Postgres, Redis, Kafka).
3. Seed the database with test users (e.g., `bun run db:seed`). Note if pre-funded wallets are needed for order creation.

## Folder Structure

- `scripts/`: Individual k6 test scripts per endpoint.
- `lib/`: Shared logic for authentication (`auth-setup.js`) and dynamic test options (`thresholds.js`).
- `results/`: Directory for JSON outputs of test runs.

## Environment Variables

- `BASE_URL`: The URL of the API service (default: `http://localhost:3000`).
- `TEST_TYPE`: The type of test to run: `smoke`, `load`, or `stress` (default: `load`).
- `AUTH_EMAIL` & `AUTH_PASSWORD`: Credentials for the test user.
- `TEST_MARKET_ID`: Market ID to use in relevant queries (default: `1`).

## How to Run Tests

### 1. Smoke Test (Run this first!)

Verifies connectivity and auth. Runs a very light load (1-2 VUs) for a short duration.

```bash
k6 run -e TEST_TYPE=smoke -e BASE_URL=http://localhost:3000 scripts/orders-create.js --out json=results/orders-create-smoke-$(date +%s).json
```

### 2. Load Test

Tests steady-state performance (e.g. ramping up to 200 VUs and holding).

```bash
k6 run -e TEST_TYPE=load -e BASE_URL=http://localhost:3000 scripts/orders-create.js --out json=results/orders-create-load-$(date +%s).json
```

### 3. Stress Test

Pushes the system past the expected peak to find its breaking point (e.g. latency SLA breach or error rate > 1%).

```bash
k6 run -e TEST_TYPE=stress -e BASE_URL=http://localhost:3000 scripts/orders-create.js --out json=results/orders-create-stress-$(date +%s).json
```

> **Note:** The `--out json=results/...` flag is crucial. It saves the raw output which is needed to construct the final benchmark tables.

## Important Note on Environment

These scripts are currently designed to run locally. If the load generator (k6) and the system under test are running on the same machine (e.g., Apple M4), they will compete for CPU and memory resources. This means the metrics collected are a _lower bound_ on real capacity. Production on dedicated infrastructure should do better, not worse. This must be explicitly documented in published metrics. (Later i runed tests one by one to get better results)
