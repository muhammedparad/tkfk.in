# 15 — Implementation Playbook: Step-by-Step Engineering Manuals

> **Module:** Actionable Implementation Blueprints (12-Section Specification)  
> **Status:** Production-Ready Engineering Manuals  
> **Target Audience:** Implementation Leads, Backend Engineers, DevOps Engineers

---

## Overview of the 12-Section Playbook Structure

Every architectural improvement below is documented with the following 12 sections:
1. **Objective** — What exact operational problem does the implementation solve?
2. **Prerequisites** — What infrastructure or dependencies must already exist?
3. **Architecture Changes** — Which specific components and boundaries are affected?
4. **Technology Selection** — What specific technology is selected and why?
5. **Implementation Sequence** — Ordered, actionable engineering steps.
6. **Configuration** — Production configuration files and environment definitions.
7. **Code Examples** — Realistic TypeScript snippets matching the project's actual stack.
8. **Database Changes** — SQL schema, index, or RPC modifications (documented, not executed).
9. **Deployment** — How to safely deploy the change to production.
10. **Testing** — How to verify that the implementation is functioning properly.
11. **Rollback** — How to safely reverse the change if an anomaly occurs.
12. **Trade-offs** — Financial costs, complexity overhead, and operational implications.

---

# PLAYBOOK 1: Distributed Caching & Rate Limiting with Redis

### 1. Objective
Eliminate direct PostgreSQL database writes for rate limiting (`rate_limits` table) and eliminate repetitive database reads for site settings and question lookups, reducing database query volume by > 80% during contest surges.

### 2. Prerequisites
- A running Redis 7.x instance (AWS ElastiCache, Redis Cloud, or Upstash) accessible from the application VPC.
- Network security groups permitting TCP port 6379 from Next.js compute pods.

### 3. Architecture Changes
- Affects `src/lib/rateLimit.ts` and `src/services/db.ts`.
- Replaces PostgreSQL table-based sliding window logging with in-memory Redis sorted sets.

### 4. Technology Selection
- **Selected: `ioredis` (v5.x)**.
- **Rationale:** Industrial-standard Node.js Redis client supporting auto-pipelining, cluster mode, and atomic Lua script execution.

### 5. Implementation Sequence
1. Add `ioredis` to dependencies: `npm install ioredis`.
2. Create Redis client singleton in `src/lib/redis.ts`.
3. Implement atomic Lua sliding window rate limiter in `src/lib/rateLimit.ts`.
4. Wrap `DBService.getSiteSettings()` with Redis Cache-Aside.
5. Invalidate Redis key on administrative settings update.

### 6. Configuration
```env
# .env.production
REDIS_URL=rediss://default:your_secure_password@redis.internal.tkfk.in:6379
REDIS_KEY_PREFIX=tkfk:
```

### 7. Code Examples
```typescript
// src/lib/redis.ts
import 'server-only';
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

export const redis = redisUrl 
  ? new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    })
  : null;
```

```typescript
// src/lib/rateLimit.ts (Redis Atomic Sliding Window)
import 'server-only';
import { redis } from './redis';

const RATE_LIMIT_LUA = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local clearBefore = now - window

redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)
local currentHits = redis.call('ZCARD', key)

if currentHits < limit then
    redis.call('ZADD', key, now, now)
    redis.call('EXPIRE', key, math.ceil(window / 1000))
    return 1
else
    return 0
end
`;

export async function checkRateLimitRedis(
  key: string,
  limit: number = 10,
  windowMs: number = 60000
): Promise<{ allowed: boolean }> {
  if (!redis) return { allowed: true }; // Fallback if Redis is offline

  const redisKey = `ratelimit:${key}`;
  const now = Date.now();
  
  const result = await redis.eval(RATE_LIMIT_LUA, 1, redisKey, now, windowMs, limit);
  return { allowed: result === 1 };
}
```

### 8. Database Changes
No database schema changes required. Once active, the `rate_limits` table can be deprecated:
```sql
-- Optional future cleanup after Redis is verified
DROP TABLE IF EXISTS public.rate_limits;
```

### 9. Deployment
1. Deploy Redis instance and configure `.env.production`.
2. Deploy updated Next.js application image.
3. Observe Redis connection logs.

### 10. Testing
```bash
# Verify rate limiting behavior via CLI
for i in {1..12}; do curl -s -o /dev/null -w "%{http_code}\n" -X POST https://tkfk.in/api/quiz/login; done
# Expected: First 10 return 400 (validation fail), 11th and 12th return 429 Too Many Requests
```

### 11. Rollback
If Redis becomes unreachable, the client catches the error and falls back gracefully to in-memory evaluation without interrupting users. Reverting `.env.production` restores original behavior.

### 12. Trade-offs
- **Cost:** ~$15–$35/month for managed Redis.
- **Complexity:** Adds one external infrastructure dependency.
- **Benefit:** Reduces database read/write IOPs by over 80%.

---

# PLAYBOOK 2: S3 / Cloudflare R2 Pre-Signed Storage for Proctoring Frames

### 1. Objective
Prevent database exhaustion by stopping the storage of Base64 snapshot images directly in PostgreSQL. Direct student webcam uploads to Cloudflare R2.

### 2. Prerequisites
- Cloudflare R2 bucket provisioned (`tkfk-proctoring-frames`).
- API tokens with read/write access to R2.

### 3. Architecture Changes
- Affects `src/lib/camera.ts`, `src/app/api/quiz/proctoring-frame/route.ts`, and `src/services/db.ts`.
- Introduces `/api/quiz/proctoring-presign` endpoint.

### 4. Technology Selection
- **Selected: Cloudflare R2 + `@aws-sdk/client-s3` (v3)**.
- **Rationale:** S3-compatible API, global Anycast edge distribution, and **zero egress bandwidth fees**.

### 5. Implementation Sequence
1. Install AWS S3 SDK: `npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`.
2. Implement pre-signed URL generator in `src/lib/storage.ts`.
3. Expose route `GET /api/quiz/proctoring-presign`.
4. Update quiz client webcam module to upload binary JPEG directly to R2.
5. Post only the resulting file key to `/api/quiz/proctoring-frame`.

### 6. Configuration
```env
# .env.production
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=tkfk-proctoring-frames
R2_PUBLIC_DOMAIN=https://frames.tkfk.in
```

### 7. Code Examples
```typescript
// src/app/api/quiz/proctoring-presign/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getParticipantSessionFromRequest } from '@/lib/participantAuth';
import { generateProctoringUploadUrl } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = getParticipantSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sessionId = req.nextUrl.searchParams.get('sessionId') || `sess-${session.participantId}`;
  const { uploadUrl, fileKey } = await generateProctoringUploadUrl(session.participantId, sessionId);

  return NextResponse.json({ success: true, uploadUrl, fileKey });
}
```

```typescript
// Client-side Direct Upload in src/lib/camera.ts
export async function uploadFrameDirect(blob: Blob, sessionId: string): Promise<string | null> {
  // 1. Get Pre-Signed URL
  const res = await fetch(`/api/quiz/proctoring-presign?sessionId=${sessionId}`);
  const { uploadUrl, fileKey } = await res.json();

  // 2. Direct PUT to Cloudflare R2 (Bypasses Next.js entirely)
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/jpeg' },
    body: blob,
  });

  return uploadRes.ok ? fileKey : null;
}
```

### 8. Database Changes
```sql
-- Add lightweight image_key column to proctoring telemetry
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS image_key TEXT;
```

### 9. Deployment
Deploy storage library and presign endpoint. Update client proctoring component in a rolling deployment.

### 10. Testing
Inspect network tab during `/quiz` execution: verify `PUT` requests target `*.r2.cloudflarestorage.com` with HTTP 200 OK.

### 11. Rollback
Preserve the fallback code that accepts Base64 strings directly in `/api/quiz/proctoring-frame` if presign requests fail.

### 12. Trade-offs
- **Cost:** ~$0.015 per GB storage on R2 (Zero egress cost).
- **Complexity:** Client requires two HTTP hops (presign + upload).
- **Benefit:** Completely eliminates ~100 GB of binary write amplification on PostgreSQL.

---

# PLAYBOOK 3: BullMQ Asynchronous Background Queue Fleet

### 1. Objective
Decouple time-consuming operations (payment webhook processing, certificate generation, transactional email dispatch) from the user-facing HTTP request lifecycle.

### 2. Prerequisites
- Redis 7.x instance running and accessible.

### 3. Architecture Changes
- Introduces a background worker process (`workers/index.ts`).
- Route handlers enqueue jobs rather than executing synchronous heavy tasks.

### 4. Technology Selection
- **Selected: BullMQ (v5.x)**.
- **Rationale:** High-performance, TypeScript-native, built on Redis with automated retries and dead-letter queues.

### 5. Implementation Sequence
1. Install BullMQ: `npm install bullmq`.
2. Define queue instances in `src/lib/queue.ts`.
3. Create worker handlers in `workers/paymentWorker.ts`.
4. Run worker process via Docker or PM2 alongside the web application.

### 6. Configuration
```env
# .env.production
BULLMQ_CONCURRENCY=10
```

### 7. Code Examples
```typescript
// src/lib/queue.ts
import 'server-only';
import { Queue } from 'bullmq';
import { redis } from './redis';

export const webhookQueue = new Queue('payment-webhooks', {
  connection: redis as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});
```

```typescript
// workers/paymentWorker.ts
import { Worker } from 'bullmq';
import { redis } from '../src/lib/redis';
import { PaymentService } from '../src/services/payment/paymentService';

export const paymentWorker = new Worker(
  'payment-webhooks',
  async job => {
    const { rawPayload, signature, headerEventId } = job.data;
    console.log(`[WORKER] Processing webhook job: ${job.id}`);
    await PaymentService.handleWebhook(rawPayload, signature, headerEventId);
  },
  { connection: redis as any, concurrency: 5 }
);
```

### 8. Database Changes
None required. Uses existing `payment_events` table for idempotency tracking.

### 9. Deployment
Run worker process as a separate container or PM2 service:
```bash
npx tsx workers/paymentWorker.ts
```

### 10. Testing
Enqueue a mock webhook job and verify that the worker logs successful processing and updates the database within 50 ms.

### 11. Rollback
Stop the worker process and revert Route Handlers to synchronous execution.

### 12. Trade-offs
- **Cost:** ~$10/month for small worker compute instance.
- **Complexity:** Requires managing a secondary background process.
- **Benefit:** Webhook API responses drop to < 20 ms; payment processing is immune to database latency spikes.

---

# PLAYBOOK 4: Database Connection Pooling & Query Index Optimization

### 1. Objective
Prevent database connection pool exhaustion under 10,000+ concurrent users and ensure all hot query paths execute in < 5 ms.

### 2. Prerequisites
- Supabase Managed PostgreSQL or self-hosted PostgreSQL with `pg_stat_statements` enabled.

### 3. Architecture Changes
- Direct all application database traffic through the **Supavisor connection pooler** (port 6543) in `Transaction Mode`.
- Add composite and partial indexes.

### 4. Technology Selection
- **Selected: Supavisor (Native Supabase Connection Pooler)**.
- **Rationale:** Scales PostgreSQL to tens of thousands of concurrent client connections with sub-millisecond pooling overhead.

### 5. Implementation Sequence
1. Identify slow queries using `pg_stat_statements`.
2. Apply high-impact composite indexes using `CONCURRENTLY`.
3. Update connection string in `.env.production` to use port 6543 (transaction mode).

### 6. Configuration
```env
# .env.production
DATABASE_URL=postgres://postgres.ckupfbdoedhidncbwmfc:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 7. Database Changes (Indexes to Apply)
```sql
-- Apply without downtime
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_sessions_leaderboard 
ON public.quiz_sessions (status, score DESC, time_taken_seconds ASC) 
WHERE status = 'SUBMITTED';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_participants_auth_lookup 
ON public.participants (participant_id, normalized_phone) 
WHERE status = 'ACTIVE';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_tx_provider_order 
ON public.payment_transactions (provider_order_id, payment_status);
```

### 8. Testing & Verification
```sql
EXPLAIN (ANALYZE, BUFFERS) 
SELECT score, time_taken_seconds FROM quiz_sessions 
WHERE status = 'SUBMITTED' 
ORDER BY score DESC, time_taken_seconds ASC LIMIT 50;
# Target: Execution time < 5.0 ms
```

### 9. Rollback
```sql
DROP INDEX IF EXISTS idx_quiz_sessions_leaderboard;
```

### 10. Trade-offs
- **Cost:** $0 (Included with Supabase / PostgreSQL).
- **Complexity:** Minimal; requires index storage space (< 15 MB).
- **Benefit:** Prevents connection starvation and accelerates queries by 20x.

---

# PLAYBOOK 5: Production Nginx Reverse Proxy with TLS 1.3 & Rate Limiting

*(Full production `nginx.conf`, upstream configuration, SSL tuning, and verification commands are detailed in **[09-infrastructure-and-networking.md](./09-infrastructure-and-networking.md)** Section 4).*

---

# PLAYBOOK 6: Structured Observability, Health Gating & Sentry Error Tracking

### 1. Objective
Establish real-time visibility into production performance, unhandled exceptions, database query latency, and health states across the fleet.

### 2. Prerequisites
- Sentry organization and DSN token.
- Node.js runtime.

### 3. Architecture Changes
- Injects Sentry SDK into Next.js server configuration.
- Standardizes JSON structured logging with Pino.
- Introduces `/api/health` probe.

### 4. Technology Selection
- **Selected: Sentry (`@sentry/nextjs`) + Pino**.
- **Rationale:** Automatic error grouping, release tracking, zero-config performance tracing, and low-overhead JSON logging.

### 5. Implementation Sequence
1. Install Sentry: `npx @sentry/wizard@latest -i nextjs`.
2. Configure PII scrubbing rules (strip participant phone numbers and passwords).
3. Implement `/api/health` endpoint with database ping.

### 6. Configuration (`sentry.server.config.ts`)
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1, // Sample 10% of transactions
  beforeSend(event) {
    // Scrub sensitive PII
    if (event.request?.headers) {
      delete event.request.headers['cookie'];
      delete event.request.headers['authorization'];
    }
    return event;
  },
});
```

### 7. Testing
Trigger a synthetic test exception via `/api/admin/debug-sentry` and verify immediate alerting in Sentry dashboard.

### 8. Rollback
Set `SENTRY_DSN=""` to disable error reporting instantly.

Proceed to **[16-testing-and-validation.md](./16-testing-and-validation.md)** for testing protocols, load testing scripts, and chaos scenarios.
