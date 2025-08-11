# PredictX

A real-time prediction market platform built with AMM-style pool mechanics for opinion trading.

## 🚀 Overview

PredictX is a real-time prediction market platform using AMM (Automated Market Maker) pool-style mechanics for opinion trading.

### How it works:

1. **Client Interaction** → Users interact with the web app to place votes/bets on prediction topics
2. **API Backend** → Handles authentication, vote processing, and data persistence to PostgreSQL database
3. **Message Queue** → Vote events are published to RabbitMQ for asynchronous processing
4. **Engine Worker** → Consumes vote events and recalculates odds using AMM formula
5. **Redis Pub/Sub** → Engine publishes updated odds; WebSocket server subscribes and broadcasts to clients
6. **Real-time Updates** → Clients receive instant odds updates via WebSocket connections
7. **Data Archiver** → Stores historical data and manages data retention

This event-driven architecture ensures real-time odds updates while maintaining data consistency and system reliability.

## 🏗️ Architecture

![PredictX Architecture](images/architecture.png)

The architecture follows a microservices pattern with clear separation of concerns:
- **Frontend clients** connect via WebSocket for real-time updates
- **API Backend** manages business logic and database operations
- **Message Queue** enables asynchronous, reliable event processing
- **Engine** handles complex odds calculations separately from user-facing operations
- **Redis** provides fast pub/sub messaging and caching layer

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: WebSocket, Redis Pub/Sub
- **Message Queue**: RabbitMQ
- **Package Manager**: Bun
- **Monorepo**: Turborepo

## 📁 Project Structure

```
/packages/backend-common      # shared types & config
/packages/db                  # drizzle schema & db client
/packages/ui                  # shared UI components
/apps/api                     # Express API server (auth, vote, biddings)
/apps/engine                  # Worker: RabbitMQ consumer, calculates odds
/apps/ws-backend              # WebSocket server (ws + Redis subscriber)
/apps/web                     # Next.js frontend (PredictX)
/apps/admin                   # Admin panel for managing topics & results
```

## 📊 Data Model

Tables used in our Drizzle schema:

* **users**: `id, email, password, name, createdAt`
* **wallet**: `id, userId -> users.id, token, createdAt` (one wallet per user)
* **betting_board**: `id, title, category, createdBy, status(OPEN|CLOSED|RESOLVED), createdAt, resolvedAt`
* **options**: `id, text, bettingId -> betting_board.id, payout` (initial payout)
* **votes**: `id, userId -> users.id, optionId -> options.id, amount, createdAt, expectedReturn`
* **transactions**: `id, userId -> users.id, type(enum), amount, relatedVoteId -> votes.id, createdAt`

## 🧮 Odds Calculation (AMM Formula)

**Concept:** Odds/payouts are derived from pool sizes (parimutuel / AMM style). Larger pool on an option → lower payout for winners on that option.

**Formula:**

```
Payout(option) = max( round( (totalPool / optionPool) * HOUSE_EDGE, 2 ), MIN_PAYOUT )
```

Where:
* `HOUSE_EDGE = 0.95` → 5% retained by platform (profit)
* `MIN_PAYOUT` (e.g., `1.1`) prevents extremely low payouts

**Numeric example:**

* Before new votes: CSK ₹300, MI ₹300 → total ₹600
  payout = (600/300) * 0.95 = 1.9x for both
* Two users place ₹100 each on MI:
  CSK ₹300, MI ₹500 → total ₹800
  CSK payout = (800 / 300) * 0.95 = 2.53x
  MI payout = (800 / 500) * 0.95 = 1.52x

So underdog payouts grow, and house keeps 5% of pool (profit).

## 🚀 Quick Start

### Prerequisites

* Node.js (>= 18)
* Bun package manager
* Docker (for Redis / RabbitMQ / Postgres)

### Installation

1. Install dependencies:

```bash
bun install
```

2. Start infrastructure services:

```bash
# Redis
docker run -d --name predictx-redis -p 6379:6379 redis:7

# RabbitMQ (management UI available at port 15672)
docker run -d --name predictx-rabbit -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# Postgres
```bash
# Postgres
docker run -d --name predictx-postgres 
  -e POSTGRES_USER=predictx -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=predictx 
  -p 5432:5432 postgres:15
```
```

3. Set up environment variables:

```env
# Postgres
DATABASE_URL=postgres://predictx:secret@localhost:5432/predictx

# Redis
REDIS_URL=redis://localhost:6379

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# JWT
JWT_SECRET=your_super_secret_key

# Ports
WS_PORT=8080
API_PORT=3000
```

4. Run database migrations:

```bash
bun db:push
```

### Development

Start all services using Turborepo:

```bash
# Start all services
bun dev

# Or start individual services
bun dev --filter=api
bun dev --filter=engine  
bun dev --filter=ws-backend
bun dev --filter=web
bun dev --filter=admin
```

## 📡 API Endpoints

### Authentication
* `POST /auth/signup` — Create user account
* `POST /auth/signin` — User login (returns JWT)

### Biddings/Topics
* `GET /biddings` — List all open topics
* `GET /biddings/:id` — Get topic details + latest odds
* `GET /biddings/:id/results` — Get resolved topic results

### Voting
* `POST /vote` — Place a vote (requires auth)

**Sample vote request:**
```json
{ "optionId": "opt-abc", "amount": 50 }
```

## 🔌 WebSocket Integration

Connect to live odds updates using the topic ID from `/biddings` API:

```javascript
// First, get a topicId from the API
const response = await fetch('http://localhost:3000/biddings');
const topics = await response.json();
const topicId = topics[0].id; // Use any active topic

// Connect to WebSocket
const ws = new WebSocket(`ws://localhost:8080?topicId=${topicId}`);

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  
  if (msg.type === "initial") {
    // Initial odds data when connecting
    console.log("Initial odds:", msg.data);
  }
  
  if (msg.type === "update") {
    // Live odds update when someone votes
    console.log("Updated odds:", msg.data);
  }
};
```

### Sample WebSocket Messages

**Initial message (on connect):**
```json
{
  "type": "initial",
  "channel": "odds:4b3662a3-36a7-4149-8e7e-778231db88fe",
  "data": {
    "topicId": "4b3662a3-36a7-4149-8e7e-778231db88fe",
    "options": [
      { "id": "opt-csk", "text": "CSK", "payout": 1.9 },
      { "id": "opt-mi", "text": "MI", "payout": 1.9 }
    ],
    "timestamp": "2025-08-12T14:23:00Z"
  }
}
```

**Update message (when odds change):**
```json
{
  "type": "update", 
  "channel": "odds:4b3662a3-36a7-4149-8e7e-778231db88fe",
  "data": {
    "topicId": "4b3662a3-36a7-4149-8e7e-778231db88fe",
    "options": [
      { "id": "opt-csk", "text": "CSK", "payout": 2.53 },
      { "id": "opt-mi", "text": "MI", "payout": 1.52 }
    ],
    "timestamp": "2025-08-12T14:24:15Z"
  }
}
```

## 🎛️ Admin Panel

The admin panel (`/apps/admin`) provides tools for:
* Creating new prediction topics
* Managing topic status (OPEN/CLOSED/RESOLVED)
* Setting initial payouts and options
* Resolving completed topics
* Analytics and monitoring

## 🧪 Development & Testing

### Testing WebSocket Connection
```bash
# Manually publish to Redis for testing
redis-cli PUBLISH odds:4b3662a3-36a7-4149-8e7e-778231db88fe '{"topicId":"4b3662a3-36a7-4149-8e7e-778231db88fe","options":[{"id":"opt-csk","text":"CSK","payout":2.1},{"id":"opt-mi","text":"MI","payout":1.8}],"timestamp":"2025-08-12T14:25:00Z"}'
```

### Testing API Endpoints
```bash
# Place a vote
curl -X POST http://localhost:3000/vote \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"optionId":"opt-abc","amount":50}'

# Get topic details  
curl http://localhost:3000/biddings/4b3662a3-36a7-4149-8e7e-778231db88fe
```

### Debugging Tips
* **WebSocket testing**: Use Postman (New → WebSocket) or browser console
* **Client refresh behavior**: App fetches `/biddings/:id` (reads `latest_odds` from Redis), then WS connects for live updates
* **Queue reliability**: Ensure `channel.ack(msg)` only after successful handling
* **Race condition prevention**: API posts vote → DB transaction committed → vote event published to RabbitMQ

## 🔧 Technical Implementation Details

### Redis Channels
* **Pub/Sub channel:** `odds:<topicId>` — engine publishes JSON updates; WS subscribes and forwards to clients
* **Snapshot key:** `latest_odds:<topicId>` — engine stores latest odds (value = JSON). API / WS read this for initial state

### Data Flow
1. API posts vote → database transaction committed → vote event published to RabbitMQ
2. Engine worker consumes vote events and recalculates odds
3. Updated odds published to Redis Pub/Sub and stored as snapshot
4. WebSocket clients receive real-time updates

### Key Design Principles
* Keep `latest_odds:<topicId>` writes in the engine **after** calculation and before publish
* Ensure worker's DB read includes the latest vote before calculation
* Use `channel.ack(msg)` only after successful handling for reliability

---

*This project is built with Turborepo for efficient monorepo management.*

* **Test WebSocket** in Postman (New → WebSocket) or via a small Node script/browser console.

* **Test Redis publishes** manually:

  ```bash
  redis-cli PUBLISH odds:4b3662a3-36a7-4149-8e7e-778231db88fe '{"topicId":"...","options":[...],"timestamp":"..."}'
  ```

  Connected WS clients should get the update.

* **If a client refreshes**: the app fetches `/biddings/:id` (reads `latest_odds` from Redis). WS then connects to get live updates. This prevents “null” or missed updates.

* **Queue idempotency**: design vote messages with a unique id if you need idempotent processing (duplicate publishes may be possible).

* **Worker reliability**: ensure `channel.ack(msg)` only after successful handling. Use durable queues + persistent messages.

* **Race**: API posts vote → database transaction committed → vote event published. Ensure the worker’s read of DB includes that vote. Best to publish vote event after DB transaction commit.

---

# 14. Security & production concerns

* **Auth**: protect endpoints; verify JWT on vote. Prevent wallet negative balances via DB transaction checks.
* **Rate limiting**: throttle votes and WS connections.
* **Data validation**: zod schemas used for auth/requests — keep them strict.
* **Monitoring**: monitor queue depth, worker errors, Redis memory.
* **House-edge configuration**: keep `HOUSE_EDGE` configurable, and run analytics to tune.
* **Scaling**: for heavy load consider Kafka/Redis Streams rather than simple Redis Pub/Sub. Use Redis cluster for high throughput, or Kinesis/Kafka for durable streams.

---

# 15. Next steps & suggestions

* Add an **admin portal** (Next.js) to create/close/resolve biddings and set initial payouts.
* Consider converting engine to **Go** later (worker can be any language that consumes the queue).
* Add **analytics and payout accounting** endpoints (daily house profit, per-bid totals).
* Implement **automated tests** for worker odds calculation.
* Optionally implement an **order-book** (if you want limit orders & deeper market mechanics). Order-book is more complex; AMM is simpler to start.

---

# 16. Example API cURL & test cases

**Place a vote**

```bash
curl -X POST http://localhost:3000/vote \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"optionId":"opt-abc","amount":50}'
```

**Fetch bidding**

```bash
curl http://localhost:3000/biddings/4b3662a3-36a7-4149-8e7e-778231db88fe
```

**Connect WebSocket in browser console**

```js
const ws = new WebSocket('ws://localhost:8080?topicId=4b3662a3-36a7-4149-8e7e-778231db88fe');
ws.onmessage = e=>console.log(JSON.parse(e.data));
```


# Turborepo starter

This Turborepo starter is maintained by the Turborepo core team.

## Using this example

Run the following command:

```sh
npx create-turbo@latest
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build
yarn dlx turbo build
pnpm exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build --filter=docs

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build --filter=docs
yarn exec turbo build --filter=docs
pnpm exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev
yarn exec turbo dev
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev --filter=web

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev --filter=web
yarn exec turbo dev --filter=web
pnpm exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo login

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo login
yarn exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo link

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo link
yarn exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)
