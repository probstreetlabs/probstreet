# Probstreet

**Trade your opinion on real-world events with virtual money. Crypto, sports, stocks and more, with live data and automatic settlement.**

> ⚠️ **Paper-trading only.** Probstreet uses virtual currency. No real money changes hands. Payment and KYC integrations run in sandbox/test mode.

<!-- Add media files before publishing -->

![Probstreet hero screenshot](docs/media/hero.png)

![Bun](https://img.shields.io/badge/Bun-000000?style=flat&logo=bun&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) ![Go](https://img.shields.io/badge/Go-00ADD8?style=flat&logo=go&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) ![Hono](https://img.shields.io/badge/Hono-E36002?style=flat&logo=hono&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white) ![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white) ![Kafka](https://img.shields.io/badge/Kafka-231F20?style=flat&logo=apachekafka&logoColor=white) ![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socketdotio&logoColor=white) ![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=flat&logo=cloudflare&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white) ![Sentry](https://img.shields.io/badge/Sentry-362D59?style=flat&logo=sentry&logoColor=white) ![k6](https://img.shields.io/badge/k6-7D64FF?style=flat&logo=k6&logoColor=white)

---

## Table of Contents

1. [Overview](#overview)
2. [The Story](#the-story)
3. [Highlights](#highlights)
4. [Architecture](#architecture)
5. [Engineering Deep Dives](#engineering-deep-dives)
6. [Tech Stack](#tech-stack)
7. [Performance Benchmarks](#performance-benchmarks)
8. [Platform Features](#platform-features)
9. [Getting Started](#getting-started)
10. [Project Structure](#project-structure)
11. [Known Limitations & Roadmap](#known-limitations--roadmap)
12. [Contributing](#contributing)
13. [License](#license)

---

## Overview

Probstreet is a paper-trading prediction-market platform where users stake virtual currency on the outcomes of real-world events — crypto prices, football matches, stock movements, and more. Markets resolve automatically using live data from Binance, football-data.org, and Finnhub, with an AI oracle pipeline as fallback for unstructured events.

The platform is built to production-grade engineering standards: a Go-based matching engine with synthetic order matching, a Kafka-backed trade pipeline, Cloudflare Workers for notifications, and an AI resolution pipeline combining Tavily web search with Groq LLM evaluation.

### Interface Showcase

|                                                                        |                                                                        |                                                                        |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| ![Market list](docs/media/markets.png) _Market list_                   | ![Orderbook & buy panel](docs/media/market-detail.png) _Market detail_ | ![Live crypto tracker](docs/media/crypto-tracker.png) _Crypto tracker_ |
| ![Live sports tracker](docs/media/sports-tracker.png) _Sports tracker_ | ![Portfolio](docs/media/portfolio.png) _Portfolio_                     | ![Leaderboard](docs/media/leaderboard.png) _Leaderboard_               |

### Demos

<!-- Demos are short screen-recording GIFs (10–30s). Record with LICEcap, Kap, or any GIF tool. -->

![Placing a trade](docs/media/place-trade.gif)
_End-to-end trade placement: API → Redis queue → Go engine → Kafka → Postgres → live orderbook update_

![Live tracker](docs/media/live-tracker.gif)
_Live match/crypto tracker embedded in the trading UI_

---

## The Story

It started with a YouTube video.

My mentor, Harkirat Singh, put out a video explaining Probo — an Indian opinion trading platform where users could trade on the outcomes of real-world events. I was immediately fascinated. What is the engineering behind something like this? How do you match thousands of orders per second without running into race conditions? How do you handle money when every millisecond matters?

At the time, Harkirat was also launching his first on-site cohort and was planning to build a project inspired by Probo as part of it. I watched his video explaining how the platform worked at a high level, and that curiosity stuck with me.

I didn't start building it immediately.

A little later, I came back to the idea and decided to figure out how the actual product worked under the hood. I opened up the browser's network tab and started watching requests fly across the screen. I studied the publicly observable behavior of existing prediction-market products (Probo, Kalshi, Polymarket, Adipredictstreet) — the request and response shapes, how different parts of the application communicated — and started rebuilding the APIs piece by piece. I also went through Probo's blog posts and other publicly available material to understand not just _what_ the platform was doing, but _why_ it was built that way and what technologies and architectural ideas were behind it.

Eventually, I had built a working version of the core experience — the APIs, UI, and major features.

Then, one late night while I was working on one of the project's APIs, my uncle called me around 1 AM. He told me that Probo had been shut down in India due to regulatory issues. I remember thinking, _well... there goes the product I'm trying to reverse-engineer._ I stopped working on the project and moved on to other things — different side projects, learning, and eventually my office work. The project sat there unfinished, becoming one of those projects I kept telling myself I'd come back to someday.

---

Fast-forward a few months.

I had some free time, but the idea never really left my mind. I kept thinking about the same question: _if I were to build this again, how would I do it properly?_

So I went deeper.

I started looking beyond Probo and studying other prediction-market platforms like **Kalshi**, **Polymarket**, and **Adipredictstreet**, an official FIFA partner. I spent hours in the network tab, tracing requests, inspecting payloads, and trying to understand what was happening behind every interaction.

How are markets structured? How are orders created and matched? How does the system handle real-time updates? What happens when a market resolves? How is settlement handled? And, most importantly, how do you design all of this so the system remains consistent when thousands of users are interacting with it at the same time?

What started as _"let me understand how this works"_ slowly turned into _"I think I can build this."_

So I went back to the drawing board. This time, I wasn't trying to clone anything. I wanted to take everything I had learned from studying these platforms and build my own version from scratch — **Probstreet**.

And this time, it wasn't just a reverse-engineering experiment. It was going to be a real paper-trading product.

---

## Highlights

- **~4,268 RPS** on market list (`GET /market`) at 300 concurrent users, **0.00% error rate** across ~786k requests in under 6 minutes.
- **~709 orders/sec** sustained on `POST /order/buy` with zero errors — the Redis queue → Go engine → Kafka pipeline absorbs load spikes by queueing rather than dropping requests.
- **Synthetic matching** — the engine mints and merges Yes/No share pairs to synthesize liquidity when no direct counterparty exists.
- **Exactly-once settlement** via atomic CAS locking: `UPDATE ... WHERE status = 'OPEN'` guarantees only one resolver wins, even under concurrent execution.
- **Hybrid resolution** — deterministic resolvers for crypto/sports/stocks (no AI needed), with a Tavily + Groq rubric-based AI oracle as fallback for unstructured events.
- **Full observability** — distributed tracing end-to-end (API → Redis → Go → Kafka → Processor) via OpenTelemetry / New Relic, Sentry for error capture, and structured JSON logging (Pino + Zerolog).

---

## Architecture

![Architecture diagram](docs/architecture.png)

### Services

| Service                  | Role                                                                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| **API Service**          | Hono/Bun HTTP server — auth, market management, order entry, KYC, payments, crons.                                                 |
| **Matching Engine**      | Go process — pops orders from Redis queue, runs the orderbook with synthetic matching, publishes trade events to Kafka.            |
| **Processor Service**    | Kafka consumer — batch-inserts matched trades to Postgres, keeps persistent state consistent.                                      |
| **Stream Service**       | Socket.io/Bun WebSocket server — broadcasts live orderbook and trade updates to connected clients.                                 |
| **Notification Service** | Cloudflare Worker — consumes Cloudflare Queue events, dispatches email (AgentMail), push (Firebase FCM), and in-app notifications. |

### User Flows

#### Signup → Wallet

```
User signs up with phone/email
        │
        ▼
OTP verified via Redis (5-min TTL)
        │
        ▼
JWT issued (HTTP-only cookie)
        │
        ▼
INR wallet atomically created in Postgres → ₹15 signup bonus credited
        │
        ▼
INIT_BALANCE event dispatched to Go engine (balance available in-memory immediately)
```

#### Placing a Trade

```
User clicks "Buy Yes @ ₹6"
        │
        ▼
API Service validates JWT
        │
        ▼
Order pushed to Redis Queue          ← no DB touch here
        │
        ▼
Go Engine pops order
        │
        ▼
Matches against orderbook (standard / synthetic)
        │
        ├── Match found → Execute trade in-memory → Kafka event
        └── No match → Order rests in book
        │
        ▼
Processor Service reads Kafka → Batch inserts to Postgres
        │
        ▼
Stream Service broadcasts updated orderbook to all connected clients
```

#### Market Resolution → Payout

```
Market expires
        │
        ▼
Resolution pipeline routes to correct resolver:
  - Crypto → Binance (deterministic, wick-guard confirmed)
  - Sports → football-data.org (deterministic, match finished)
  - Stocks → Finnhub (deterministic, price vs target)
  - General → Tavily search → Groq AI (rubric ≥ 90)
        │
        ▼
Atomic lock acquired (CAS: OPEN → RESOLVING)
        │
        ▼
Verdict pushed to Redis queue → Engine processes settlement
        │
        ▼
Settlement cron runs:
  - Winning shares → ₹10/share credited
  - Losing shares → ₹0
  - ACID transaction (wallet + ledger in same commit)
        │
        ▼
User balance updated → Engine synced → User notified
```

#### Withdrawal

```
User requests withdrawal
        │
        ▼
KYC check (PAN/Bank verified via Cashfree Secured ID;
           manual admin review only as fallback for ambiguous responses)
        │
        ▼
Cashfree Payouts API initiates transfer (sandbox mode)
        │
        ▼
Balance deducted in atomic DB transaction (double-spend proof)
```

---

## Engineering Deep Dives

### Matching Engine

The first decision was language. The core matching logic had to live in Go. Not because it's trendy, but because:

- Goroutines are cheap and give per-market concurrency without thread pools.
- Go's garbage collector latency is measurable in microseconds, not milliseconds.
- The type system keeps the financial invariants honest.

But here's what makes Probstreet's engine genuinely interesting: **it uses synthetic matching**.

In a regular limit order book, you can only match a Yes-Buy against a Yes-Sell. In a binary market, there's a smarter way. If nobody is selling Yes shares, but someone is bidding ₹4 for No shares — then you can _synthesize_ a Yes trade at ₹6 (since ₹4 + ₹6 = ₹10, the total payout). The engine supports:

- **Standard matching** — direct Yes vs Yes, No vs No.
- **Mint matching** — a new pair of Yes+No shares is created when both sides want to enter the market.
- **Merge matching** — a holder of Yes and No shares exits the market together, cancelling each other out.

This is significantly harder to implement correctly. The matching algorithm has to consider all four order types (Yes/No × Buy/Sell) and pick the best counterparty — comparing direct matches against synthetic equivalents by effective price, breaking ties by timestamp. The engine processes all of this with a per-market `sync.Mutex`, so different markets run fully concurrently without any global lock.

---

### Engine Snapshotting — Designing Around Constraints

The matching engine is intentionally stateful. For speed, the active orderbooks, balances, and other engine state live in the Go process's memory. That gives the engine extremely fast access to the state it needs while matching orders.

But it immediately creates a problem: **what happens when the process crashes?**

RAM is fast, but it's volatile. If the engine goes down, everything that exists only in memory disappears with it.

My first instinct was straightforward: persist periodic snapshots to object storage. If I were deploying the system purely based on architecture, **Amazon S3** would have been the obvious choice. But this project had another constraint: I was building it without a large infrastructure budget.

I looked at **Cloudflare R2** as well. No egress fees, a generous free tier. The only catch was that even using the free tier required adding a payment method — another constraint. So I went one layer deeper.

#### What if the database could store the snapshots?

PostgreSQL supports binary data through the `BYTEA` type. Instead of uploading every snapshot to an object-storage bucket, I could serialize the engine state into a compact binary representation and store the resulting bytes directly in PostgreSQL.

At first, this sounds like a compromise. But then I did the math.

The database instance I was using had **500 MB of storage**, so the real question wasn't _"Is storing binary snapshots in Postgres architecturally perfect?"_ It was: **"How much engine state can I actually fit into 500 MB?"** That calculation changed the decision.

<details>
<summary>Show capacity calculations</summary>

Assuming approximately **56 bytes per order** and **24 bytes per user**, a single latest snapshot could theoretically represent:

- **~9.36 million open orders** if the entire 500 MB were allocated to orders.
- **~21.85 million active users** if the entire 500 MB were allocated to users.

With a more realistic allocation of roughly **10% for users and 90% for the orderbook**:

- **~2 million active users** → ~48 MB
- **~8.4 million resting orders** → ~470 MB

`BYTEA` gives substantially better storage density than `JSONB` for this workload.

**Snapshot history budget:** If snapshots are taken every **10 minutes** and **24 hours** of history are retained:

```
6 snapshots/hour × 24 hours = 144 snapshots
500 MB / 144 ≈ 3.47 MB per snapshot
```

A 3.47 MB snapshot could represent approximately **20,000 active users** and **56,000 resting orders**. These are capacity calculations, not guarantees.

</details>

#### The more interesting bottleneck

And this is where the analysis became more interesting. The database wasn't actually the first thing I needed to worry about. The matching engine itself keeps the active state **in RAM**.

So even if PostgreSQL could comfortably store millions of orders in snapshots, the Go process still has to hold those orders in memory while the engine is running. In Go, the in-memory representation is not simply `number of orders × serialized bytes`. Maps, slices, pointers, object headers, indexes, heap allocations, and GC overhead all add to the real memory footprint.

A theoretical **8.4 million orders** might fit inside the database snapshot calculation, while the live Go process could require **hundreds of megabytes to well over a gigabyte of RAM**, depending on the actual data structures and implementation.

**The practical bottleneck isn't the 500 MB database limit — it's the memory required by the live matching engine.**

#### Why PostgreSQL for now

Instead of immediately adding S3 or R2 to the infrastructure, PostgreSQL `BYTEA` gives a simple, inexpensive recovery mechanism that's good enough for the current scale. The important part wasn't that PostgreSQL was somehow better than object storage — it wasn't. **The important part was choosing the architecture based on the actual constraints of the project.**

At production scale, large snapshot artifacts would move to S3 or R2, with the database responsible for metadata, versions, checksums, and recovery pointers.

---

### The Resolution Pipeline — How Markets Get Resolved

This was the hardest engineering problem in the entire project. When a market expires — _"Will BTC touch $70k today?"_ or _"Will India beat Pakistan?"_ — something needs to determine the winning side. Reliably. Without human intervention at scale. Getting this wrong means settling money incorrectly.

#### Phase 1 — Manual Admin Resolution

The first version was the simplest thing that could work: an admin dashboard where a human checks the real-world result and clicks Resolve Yes or Resolve No. This works when you have 5 markets. It breaks when you have 500.

#### Phase 2 — Exploring On-Chain Oracles & Third-Party Webhooks

I researched how Polymarket and Adipredictstreet handle resolution. Both rely on **Chainlink** — a decentralized oracle network that brings off-chain data on-chain. But Probstreet runs **entirely off-chain**. Using Chainlink would mean paying gas fees for a system that has no blockchain settlement layer. Cost and complexity for zero architectural benefit.

I considered **Make.com** — a no-code automation platform that would monitor the source of truth and hit our API as a webhook. In practice, three problems killed it:

1. **Single point of trust** — the most critical operation in the platform depends entirely on a third-party automation tool.
2. **Fragile data extraction** — if the source website changes its HTML structure, the Make.com scenario silently breaks.
3. **Latency and reliability** — no SLA guarantees for time-sensitive financial operations.

#### Phase 3 — The In-House AI Pipeline (Tavily + Groq)

I decided the resolution system had to be entirely in-house. The architecture: when a market's `endTime` passes, a cron job picks it up and runs it through a **resolution pipeline**.

The core challenge: how do you programmatically determine if _"Will Elon Musk tweet about Dogecoin this week?"_ happened or not? There's no structured API for that.

The answer was combining **Tavily** (real-time web search with structured results) and **Groq** (fast LLM inference at `temperature: 0.1` for determinism) into a pipeline. But I didn't trust raw LLM output — models hallucinate. So I built a **rubric-based scoring system** where the AI must evaluate evidence against five explicit criteria:

| Criterion        | Max Score | What It Measures                                                 |
| ---------------- | --------- | ---------------------------------------------------------------- |
| Event Completion | 25        | Has the event definitively concluded?                            |
| Source Authority | 20        | Is the evidence from an official/authoritative source?           |
| Rule Match       | 25        | Does the outcome satisfy the market's specific YES/NO condition? |
| Data Clarity     | 20        | Is the relevant data (score, price, result) unambiguous?         |
| Corroboration    | 10        | Do multiple sources agree?                                       |

The rubric produces a score from 0–100. **Only if the total score is ≥ 90 AND the verdict is not `INCONCLUSIVE`** does the market auto-resolve. Below that threshold, the market is flagged as `AWAITING_ADMIN` and an admin notification is dispatched. Every resolution attempt is logged to an `OracleLog` table with the full rubric breakdown, raw evidence, and reasoning.

**Enter Jev:** I recently integrated **Jev** (`~typesafe/jev-latest` via OpenRouter) as an alternative probabilistic evaluator, behind a `USE_JEV_ORACLE_RESOLVER` feature flag. When active, Jev takes over the evaluation logic; when inactive, it defaults back to the Groq pipeline.

#### Phase 4 — Deterministic Resolution (No AI Required)

While studying Adipredictstreet and Kalshi's network traffic, I noticed their live trackers. This made me realize something important: **for quantitative markets with structured data APIs, AI is unnecessary overhead.** If the market question is _"Will BTC touch $95k?"_, I can call the Binance API, get the price, and compare it. Zero hallucination risk.

This led to a split architecture — **three dedicated resolver crons**:

**Crypto Resolver** (every 15 seconds):

- Fetches live prices from **Binance** (`/api/v3/ticker/price`).
- Supports **6 coins**: BTC, ETH, SOL, XRP, DOGE, BNB.
- **TOUCH** markets: **Wick Guard** requires price to stay past the target for **2 consecutive checks within a 30-second window** before resolving — prevents false triggers from exchange wicks.
- **DIRECTION** markets: compare price against start price at expiry.

**Sports Resolver** (every 1 minute):

- Polls **football-data.org** with match-specific endpoints.
- Only starts polling within 15 minutes of the scheduled start time to avoid wasting API calls.
- Respects the **10 requests/minute** rate limit via 6-second delays between sequential checks.
- Resolves deterministically once match status is `FINISHED`.

**Stocks Resolver** (every 1 minute):

- Fetches real-time quotes from **Finnhub** (`/api/v1/quote`).
- Extracts ticker symbols from `sourceOfTruth` URL or falls back to regex extraction from the market title.
- Supports the same TOUCH/DIRECTION mechanics as crypto.

All three resolvers share a critical safety mechanism: **atomic resolution locking**. Before settling any market, the resolver calls `tryAcquireResolve()`, which performs an atomic `UPDATE ... WHERE status = 'OPEN'` — a compare-and-swap (CAS) operation at the database level. If two resolver instances race on the same market, only one acquires the lock. **This guarantees exactly-once settlement even under concurrent execution.**

```text
Market Expiry Detected (cron)
        │
        ├── Crypto market? ──→ Crypto Resolver (Binance, every 15s)
        │                        ├── TOUCH → Wick Guard (2 confirms in 30s) → RESOLVED ✓
        │                        └── DIRECTION → Compare at expiry → RESOLVED ✓
        │
        ├── Sports market? ──→ Sports Resolver (football-data.org, every 1m)
        │                        └── Match FINISHED? → Score comparison → RESOLVED ✓
        │
        ├── Stocks market? ──→ Stocks Resolver (Finnhub, every 1m)
        │                        ├── TOUCH → Price vs target → RESOLVED ✓
        │                        └── DIRECTION → Compare at expiry → RESOLVED ✓
        │
        └── General market ──→ Oracle Pipeline (every 1m)
                 │
                 ├── sourceOfTruth JSON + deterministic config? → RESOLVED ✓
                 │
                 └── Fallback:
                      ├── Tavily web search (evidence gathering)
                      ├── Groq AI evaluation (rubric-based, 5 criteria)
                      │    ├── Score ≥ 90 → RESOLVED ✓
                      │    └── Score < 90 → AWAITING_ADMIN (notification sent)
                      └── Full audit log written to OracleLog table
```

---

### The Notification Service — Three Designs, One Decision

Probstreet sends a lot of notifications — trade executions, new market alerts, price alerts triggering, oracle resolutions, deposits, withdrawals. Each one needs to go out across three channels: Email, Push (Firebase FCM), and In-App (via the Stream Service over WebSocket), all while respecting each user's individual preferences.

This feature went through three design phases before landing on the current architecture.

**Phase 1 — Handle it in the Processor Service**

The `processor-service` already consumes Kafka events from the matching engine and writes trade data to Postgres. My first instinct was to bolt notification dispatching onto it. The problem: the processor has one job — persist trade data as fast as possible and keep the system's state consistent. Every millisecond it spends waiting on an email API or scanning the database for user preferences is a millisecond where the next Kafka message isn't being processed. I didn't want to slow down the most critical service in the system with I/O that has nothing to do with trading.

**Phase 2 — A Standalone Notification Service**

The next step was separating it out into its own long-running Node.js service. This would cleanly isolate notification work from the trading pipeline. But it also meant another server to manage, another process to keep alive, another thing that could go down. For something as async and bursty as notifications, running a full server felt like overkill.

**Phase 3 — Serverless on Cloudflare Workers (The Final Architecture)**

Notifications are the perfect use case for serverless: they're event-driven, not latency-sensitive, and bursty by nature. The backend services push events into a **Cloudflare Queue** and forget about it. The Cloudflare Worker wakes up, processes the batch, and shuts down. No servers, no idle processes, no ops overhead.

**The Email Provider Journey**

Finding the right email provider for a serverless environment turned out to be harder than expected.

First I tried **Nodemailer with SMTP**. It works fine on a long-running server, but inside a short-lived Worker invocation, you can't maintain a persistent SMTP connection. Slow and unreliable.

So I switched to **Brevo** (formerly Sendinblue) — clean REST API, works perfectly in serverless. I integrated it, deployed, and immediately hit a wall: Brevo's free tier requires IP whitelisting. Cloudflare Workers run on a massive distributed edge network with constantly rotating IPs. There is no IP to whitelist. Back to square one.

Finally, I found **AgentMail**: clean REST API, generous free tier, no IP whitelisting, no complex domain verification. Exactly what a serverless environment needed. That's what the service runs today.

**The Serverless Database Trap — and the Neon Fix**

While building the worker I hit another unexpected problem. I was using the standard `pg` TCP driver to connect to Postgres from inside the Cloudflare Worker. This works fine locally, but in production it's a disaster. Serverless environments scale by spinning up thousands of temporary "isolates" in parallel. Each one would open its own TCP connection pool to the database. A small traffic spike would instantly exhaust Postgres's connection limit.

The solution is a connection pooler between the Worker and the database. I evaluated three options:

- **Prisma Accelerate** — paid managed pooler. Works well but adds another paid dependency.
- **Cloudflare Hyperdrive** — Cloudflare's own built-in pooler (now free). Routes TCP through their edge and caches `SELECT` queries globally.
- **Neon Serverless** — since the database already runs on Neon, this was the cleanest fit. `@neondatabase/serverless` routes queries over WebSockets directly to Neon's built-in connection pooler, completely sidestepping TCP exhaustion.

I migrated `@probstreet/database` to use `@neondatabase/serverless` + `@prisma/adapter-neon`, which is now what `createEdgePrisma()` uses across all serverless contexts. The Prisma client is also initialized once in the global scope (`getPrisma(env)`) and reused across multiple events on the same Worker isolate — zero reconnection overhead for the common case.

---

### Redis Caching Layer for Live Data

Every live data fetch — whether for the trading UI or for resolution — goes through a **Redis caching layer** with per-provider TTLs tuned to their rate limits and data freshness requirements:

| Provider                   | TTL            | Reasoning                                           |
| -------------------------- | -------------- | --------------------------------------------------- |
| Binance (crypto)           | **3 seconds**  | Prices move fast; Binance has generous rate limits  |
| Finnhub (stocks)           | **5 seconds**  | Moderate rate limits; prices update less frequently |
| football-data.org (sports) | **15 seconds** | Strict 10 req/min limit; match state changes slowly |

The first request for a market's live data fetches from the provider and writes to Redis. All subsequent requests within the TTL window are served from cache. This means even with thousands of concurrent users watching the same BTC market, Binance sees **at most one request every 3 seconds per symbol** from the system.

---

### Leaderboard — Redis Sorted Sets with Lazy Hydration

I read through engineering blogs, including Probo's own technical posts, to understand how production leaderboards work at scale. The naive approach — `SELECT userId, SUM(winnings) GROUP BY userId ORDER BY total DESC` on every API call — would crush the database under read traffic.

The architecture uses **Redis Sorted Sets** (`ZADD` / `ZREVRANGE`) as the primary read path, with lazy hydration from PostgreSQL:

1. **Hydration**: When a leaderboard key doesn't exist in Redis, the system runs a one-time `groupBy` aggregation on the `LedgerEntry` table (filtering for `type: 'WINNINGS'`), pipes the results into a Redis sorted set using a pipeline batch, and sets a 24-hour TTL.
2. **Reads**: All subsequent reads hit Redis — `ZREVRANGE` returns the top 100 users sorted by profit in O(log(N) + M) time. The user's own rank is fetched via `ZREVRANK` in O(log(N)).
3. **Time windows**: Daily, weekly, monthly, and all-time leaderboards via time-bucketed Redis keys (e.g., `leaderboard:weekly:<YYYY-Www>`). Each window hydrates independently.
4. **Enrichment**: Raw entries contain only `userId` and `score`. The controller enriches them with profile data (username, avatar) and actual trade volume from the `Trade` table for both maker and taker sides.

---

### Full Observability & Telemetry Stack

Running a distributed system across 5 services without observability is flying blind. I instrumented the platform at three layers:

**Error Tracking — Sentry**
Each service has its own Sentry project with structured error context. Every `captureError()` call includes tags for `controller`, `action`, and relevant entity IDs (`marketId`, `userId`, `symbol`). Sentry is **completely disabled in development** — no SDK initialization, no network calls, zero overhead. In production, it also hooks into `unhandledRejection` and `uncaughtException` handlers as a safety net. Zerolog in the Go engine is hooked into Sentry — any `ERROR` or `FATAL` level log automatically captures the exception, creating a unified error tracking pipeline without requiring manual `captureError()` calls at every error site in Go.

**Distributed Tracing & Metrics — New Relic via OpenTelemetry**
All TypeScript services export traces, metrics, and logs to New Relic using the **OpenTelemetry SDK** with OTLP/HTTP exporters. The setup auto-instruments HTTP requests, database queries, and Redis operations via `getNodeAutoInstrumentations()` (with filesystem and net instrumentation disabled to reduce noise). Metrics are exported every 10 seconds. The Go matching engine has its own OpenTelemetry integration. This gives end-to-end distributed traces across service boundaries — I can follow a single order from the API, through the Redis queue, into the Go engine, back through Kafka, and into the Processor.

**Structured Logging — Pino (TypeScript) & Zerolog (Go)**
Both loggers emit structured JSON in production for machine parsing, and human-readable pretty-printed output in development. Pino writes to `stdout` asynchronously via `pino.destination(1)`. Zerolog in the Go engine uses console output in development and Unix-timestamp JSON in production.

---

## Tech Stack

| Layer                | Technology                                                   |
| -------------------- | ------------------------------------------------------------ |
| Matching Engine      | Go, goroutines, `sync.Mutex`                                 |
| API Service          | TypeScript, Bun, Hono                                        |
| Stream Service       | TypeScript, Bun, Socket.io                                   |
| Processor Service    | TypeScript, Bun                                              |
| Notification Service | TypeScript, Cloudflare Workers, Cloudflare Queues            |
| Frontend             | React, Zustand, TanStack Query, Vite                         |
| Database             | PostgreSQL 16 (Neon), Prisma ORM, `@neondatabase/serverless` |
| Cache / Queue        | Redis (two instances: cache + pub-sub)                       |
| Message Broker       | Apache Kafka                                                 |
| Payments & KYC       | Cashfree (sandbox)                                           |
| AI Resolution        | Groq, Tavily, OpenRouter (Jev)                               |
| Market Data          | Binance, Finnhub, football-data.org                          |
| Notifications        | Firebase FCM (push), AgentMail (email)                       |
| Media Storage        | Cloudinary                                                   |
| Observability        | Sentry, New Relic, OpenTelemetry (OTLP), Pino, Zerolog       |
| Load Testing         | Grafana k6                                                   |
| Containerization     | Docker, Docker Compose                                       |

### Design Decisions

| Decision                                  | Alternatives Considered                         | Why                                                                                                                                    |
| ----------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **PostgreSQL BYTEA for engine snapshots** | Amazon S3, Cloudflare R2                        | R2 free tier required a payment method; BYTEA keeps architecture simple at current scale. S3/R2 is the right move at production scale. |
| **Cloudflare Workers for notifications**  | Embed in Processor, standalone Node.js service  | Notifications are bursty and async — serverless is a natural fit. No idle processes, no ops overhead.                                  |
| **AgentMail over Brevo**                  | Nodemailer/SMTP, Brevo                          | Brevo requires IP whitelisting; Workers run on rotating IPs. AgentMail works natively serverless.                                      |
| **Neon Serverless driver**                | Prisma Accelerate (paid), Cloudflare Hyperdrive | DB already on Neon; `@neondatabase/serverless` routes over WebSockets to Neon's built-in pooler — zero extra infra.                    |
| **In-house AI oracle**                    | Make.com webhooks, Chainlink                    | Make.com: single point of trust + fragile HTML scraping. Chainlink: gas fees with no blockchain settlement layer.                      |
| **Synthetic matching (mint/merge)**       | Standard limit order book only                  | Creates liquidity from both sides simultaneously; significantly improves market depth on a new platform.                               |

---

## Performance Benchmarks

### Methodology

- **Tool**: Grafana k6
- **Environment**: Local — MacBook (Apple M4, 10 cores, 16GB RAM)
  - **Application services** (running natively): API service, Matching Engine, Processor service, Stream service
  - **Infrastructure** (Docker): PostgreSQL 16, Redis (cache), Redis (pub/sub), Zookeeper, Kafka
- **Load generator**: Co-located on the same machine as the server
- **Network**: localhost
- **Date tested**: September 27, 2026

> ⚠️ These numbers were captured on a single laptop running the load generator, 4 native application services, 5 Dockerized infrastructure containers, the frontend dev server, a Cloudflare tunnel, and normal daily-use applications (browser, IDE, Notion, Docker Desktop) simultaneously — all competing for the same CPU and memory. Production numbers on dedicated infrastructure, with the load generator on a separate machine, are expected to be equal or better. Treat these as a conservative baseline, not a ceiling.

### Results (300 concurrent users)

| Endpoint                                 | VUs | RPS    | Avg     | p50     | p95     | Error Rate |
| ---------------------------------------- | --- | ------ | ------- | ------- | ------- | ---------- |
| `GET /api/v1/capi/balance`               | 300 | 2377.0 | 94.8ms  | 111.8ms | 137.5ms | 0.00%      |
| `GET /api/v1/capi/market`                | 300 | 4268.5 | 52.7ms  | 60.8ms  | 78.2ms  | 0.00%      |
| `GET /api/v1/capi/market/:symbol`        | 300 | 1672.7 | 134.7ms | 154.4ms | 198.0ms | 0.00%      |
| `GET /api/v1/capi/market/:symbol/live`   | 300 | 2378.0 | 94.7ms  | 82.4ms  | 132.0ms | 0.00%      |
| `GET /api/v1/capi/leaderboard`           | 300 | 2830.0 | 79.6ms  | 89.9ms  | 119.9ms | 0.00%      |
| `GET /api/v1/capi/profile/:username`     | 300 | 1991.1 | 113.2ms | 127.7ms | 179.3ms | 0.00%      |
| `GET /api/v1/capi/market/:symbol/trades` | 300 | 3431.1 | 65.6ms  | 75.4ms  | 103.2ms | 0.00%      |
| `POST /api/v1/capi/order/buy`            | 300 | 709.1  | 319.0ms | 374.6ms | 495.6ms | 0.00%      |

### Engineering Notes

- **Total throughput**: The system processed **~786,000 API requests in under 6 minutes** across all 8 endpoints (e.g., the Markets API — `GET /market` — alone handled over 170,000 requests in 40s), with a **0.00% error rate** throughout.
- **Order execution pipeline (`POST /order/buy`)**: Sustains **~709 orders/sec** under load with zero errors. The Redis Queue → Go Engine → Kafka pipeline absorbs load spikes by queueing rather than dropping requests or blocking the database.
- **Portfolio endpoint restructuring (`GET /portfolio`)**: Originally bottlenecked by full table scans (2.9 RPS, ~27s latency). After adding `Promise.all` for parallel queries and a Postgres index on `userId`, throughput improved to **1,639 RPS at ~137ms average latency**. _Note: this monolithic endpoint was subsequently split into distinct APIs (e.g., `/portfolio/summary`, `/portfolio/positions`). The legacy `/portfolio` endpoint is no longer featured in the benchmark table above._
- **Market detail optimization (`GET /market/:symbol`)**: Originally loaded up to 80,000 rows into application memory to compute volume in JavaScript, causing multi-second delays. Moving the aggregation into Postgres via `prisma.$queryRaw` and caching brought this to **1,672 RPS at ~134ms average latency**.
- **Caching layer (`GET /market/:symbol/live`)**: Redis-backed caching serves over 2,300 req/s at sub-100ms latency, shielding the primary database from high-frequency price-ticker traffic.

### Planned Production Optimizations

- **Connection pooling (PgBouncer)**: Postgres defaults to ~100 concurrent connections. For production traffic beyond 500–1000 concurrent users, PgBouncer (or a managed pooler such as Supabase/Prisma Accelerate) will multiplex connections and keep latency consistent under load.
- **Target**: Sub-50ms latency across all endpoints in production, using the above pooling plus short-TTL Redis caching on additional read-heavy endpoints.

---

## Platform Features

### Probi — Market-Maker Bot

An empty orderbook is a dead product. When a new market is created, there's nobody on either side. No liquidity, no trades, no engagement.

To solve this, I built **Probi** — an internal market-maker bot. When a new market goes live, Probi automatically places spread orders on both the Yes and No sides at multiple price levels. This ensures that from minute one, any user who comes in has a counterparty to trade against. Markets feel alive immediately.

Probi operates like a market maker: it quotes both sides, earns the spread, and dynamically adjusts its positions as the real order flow comes in.

### Live Match Tracker & Crypto Feeds

Building the resolution pipeline with dedicated data provider integrations created an opportunity: if we already have real-time data flowing through the system, why not surface it directly in the trading UI?

- **Crypto markets** — Binance 24h ticker showing current price, 24h change, and high/low range alongside the market's target price. Coin logos are mapped from a static registry.
- **Sports markets** — football-data.org providing minute-by-minute scores, team crests, match status (LIVE / HT / FINISHED / UPCOMING), and competition name. The parser normalizes responses across multiple API response shapes.
- **Stock markets** — Finnhub real-time quotes showing current price, daily change, and high/low.

All live data responses flow through the same Redis cache layer described above — the tracker and the resolution pipeline share cached data, no duplicate API calls.

### Price Alerts — One-Shot Notification System

Users can set price alerts on any market for either the Yes or No side. The implementation uses a **cron-based polling approach** (every 50 seconds) rather than in-memory evaluation, keeping the system stateless:

1. The cron fetches all active alerts with their associated market prices and user notification preferences.
2. For each alert, it compares the market's current `yesPrice` or `noPrice` against the user's `targetPrice`.
3. If the threshold is crossed, it checks whether the user still holds a position in that market (no point alerting someone who's already exited).
4. If the user has holdings, a notification is dispatched through the notification service (FCM push + email based on the user's `notificationPrefs`).
5. The alert is then **deactivated** — alerts are one-shot by design. If a user wants to be alerted again, they set a new one.

This one-shot model avoids alert fatigue (repeated notifications as the price oscillates around the threshold) and keeps the database clean — inactive alerts are never re-evaluated.

### Leaderboard

Weekly, monthly, and all-time leaderboards powered by Redis Sorted Sets with lazy hydration from PostgreSQL. See [Engineering Deep Dives](#leaderboard--redis-sorted-sets-with-lazy-hydration) for full details.

### Two-Sided Referral System

To bootstrap the user base, I built a two-sided referral engine using atomic database transactions. When a new user signs up with a referral code, the backend opens a single Prisma transaction that:

1. Credits the referred user with a **₹10 signup bonus** (writing to both `Wallet` and `Transaction` ledger).
2. Creates a pending **₹20 reward** for the referrer in the `Referral` table (to be unlocked once trading volume conditions are met).
3. Marks `isNewUser = false` to prevent double-claiming.

The entire operation is ACID-compliant — if any step fails, the bonus is rolled back, preventing free-money exploits.

### KYC & Verification

Because Probstreet handles withdrawals, every user who wants to withdraw has to go through identity verification first. I started by doing what I usually do when building a feature — I looked at how Probo handles it. I opened their app, went through the KYC flow, and watched the network tab carefully. PAN verification and bank account verification were both completing near-instantly, in seconds. Something automated was happening under the hood. Looking closer at the API requests, I discovered they were using **AuthBridge** as their external verification provider.

I eventually found **Cashfree Secured ID**, their KYC and verification API product. It gives programmatic access to the same government data sources. I integrated it and the flow became fully automated:

- **PAN verification**: Cashfree's PAN Advance endpoint returns `VALID` or `INVALID` within seconds.
- **Bank account verification**: via account number and IFSC through Cashfree's bank account sync API.
- Users under 18 are rejected at submission using a DOB check before the API call is even made.
- If a PAN is already registered to another user, the transaction fails with `PAN_ALREADY_EXISTS`.
- For ambiguous provider responses, the system falls back to manual admin review.

The integration is currently running in **test mode** against Cashfree's sandbox environment. Switching to production is a configuration change. The original in-house manual KYC system code still exists in the codebase — it's just disabled.

---

## Getting Started

**Quick Start** (requires Bun, Go, Docker):

```bash
# 1. Install dependencies
bun install

# 2. Copy environment files
cp packages/database/.env.example packages/database/.env
cp services/api-service/.env.example services/api-service/.env
cp services/stream-service/.env.example services/stream-service/.env
cp services/matching-engine/.env.example services/matching-engine/.env
cp services/notification-service/.dev.vars.example services/notification-service/.dev.vars

# 3. Start infrastructure
docker-compose up -d

# 4. Migrate and seed the database
bun run db:generate && bun run db:migrate && bun run db:seed

# 5. Start backend services
bun run start:all

# 6. Start the matching engine (separate terminal)
make run

# 7. Start the frontend
bun run web:dev
```

→ [Full setup instructions: docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)

---

## Known Limitations & Roadmap

### Planned Production Optimizations

- **Connection pooling (PgBouncer)**: Postgres defaults to ~100 concurrent connections. For production traffic beyond 500–1000 concurrent users, PgBouncer (or a managed pooler such as Supabase/Prisma Accelerate) will multiplex connections and keep latency consistent under load.
- **Target**: Sub-50ms latency across all endpoints in production, using the above pooling plus short-TTL Redis caching on additional read-heavy endpoints.
- **Object storage migration**: At production scale, engine snapshots would move from PostgreSQL `BYTEA` to S3 or Cloudflare R2, with the database keeping only metadata, versions, checksums, and recovery pointers.

---

## Contributing

Contributions focused on correctness, performance, and fault tolerance are welcome.

- **Open an issue first** before sending a PR for anything beyond a small bug fix — it avoids wasted effort if the approach doesn't fit.
- **Bug reports**: include the service name, relevant logs, and steps to reproduce.
- **Performance improvements**: include before/after benchmark numbers.
- **New features**: discuss the design in an issue first.

---

## License

Licensed under the [Apache License 2.0](LICENSE).
