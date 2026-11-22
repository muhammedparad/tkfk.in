# 14 — Practical Implementation of 30 Core System Design Concepts

> **Module:** Comprehensive 30-Concept System Design Master Analysis  
> **Status:** Every concept analyzed under the mandatory 7-Section Framework  
> **Target Audience:** Principal Architects, Lead Engineers, System Design Evaluators

---

## Overview of the 7-Section Framework

For every one of the 30 concepts below, this document provides:
1. **What it is and how it works.**
2. **Where it fits into the existing application.**
3. **Current implementation and codebase evidence.**
4. **Proposed architecture for this application.**
5. **EXACT implementation procedure.**
6. **Configuration, code examples or pseudocode.**
7. **Testing and verification procedure.**

---

# SECTION A: FOUNDATIONS

---

## Concept 1: Client-Server Architecture

### 1. What It Is and How It Works
Client-Server Architecture partitions tasks between service requesters (clients, such as web browsers or mobile apps) and service providers (servers). The client manages presentation and user input, issuing network requests over protocols like HTTP/HTTPS. The server validates incoming requests, enforces business rules, coordinates access to shared state, and returns structured responses.

### 2. Where It Fits into the Existing Application
In this platform, the client encompasses the Next.js React frontend (desktop and mobile web), client-side Canvas renderers (`ParticipantIdCardCanvas`, `CertificateCanvas`), and the interactive exam interface (`/quiz`). The server encompasses Next.js Node.js Route Handlers (`/api/*`), edge middleware, and the Supabase PostgreSQL database.

### 3. Current Implementation and Codebase Evidence
- **Client Presentation:** `src/app/page.tsx`, `src/app/register/page.tsx`, `src/app/quiz/page.tsx`.
- **Server Route Handlers:** Enforced as server-side execution boundaries via `import 'server-only'` in `src/services/db.ts` (line 1), `src/services/quizEngine.ts` (line 1), and `src/services/payment/paymentService.ts` (line 1).
- **Client-to-Server Communication:** Fetch calls in `src/app/quiz/page.tsx` posting to `/api/quiz/session` and receiving sanitized questions stripped of `correct_option`.

### 4. Proposed Architecture
Strict separation of concerns:
- Client handles local state, animation (GSAP/Lenis), optimistic UI, and offline backup storage (`localStorage`).
- Server functions as a zero-trust policy enforcement point, validating every input, authenticating HMAC tokens, and executing database mutations.

### 5. Exact Implementation Procedure
1. Audit all API response schemas to guarantee no private server-side columns (e.g., `correct_option`, `normalized_phone`, `verification_hash`) are transmitted to the client.
2. Maintain `server-only` guards across all backend modules to prevent accidental inclusion in client Webpack/Turbopack bundles.
3. Configure `next.config.mjs` with runtime boundary protections.

### 6. Code Examples & Configuration
```typescript
// Verified pattern in src/app/api/verify/route.ts
// Server sanitizes database entity before returning to client
return NextResponse.json({
  valid: true,
  certificate_code: res.certificate.certificate_code,
  participant_name: res.certificate.participant_name || res.participant?.name,
  grade: res.certificate.grade,
  issued_at: res.certificate.issued_at
  // Notice: res.participant.email and phone are intentionally excluded
});
```

### 7. Testing & Verification Procedure
Run bundle analysis to verify no server secrets leak into the client:
```bash
npm run build
# Inspect client chunks in .next/static/chunks/ for forbidden strings:
grep -r "SUPABASE_SERVICE_ROLE_KEY" .next/static/
# Expected: Zero matches
```

---

## Concept 2: IP Addresses

### 2.1 What It Is and How It Works
An IP (Internet Protocol) address is a numerical label assigned to every device connected to a computer network. IPv4 uses 32-bit addresses (`192.0.2.1`), while IPv6 uses 128-bit addresses (`2001:db8::1`). Systems distinguish between **public IP addresses** (routable over the global internet) and **private IP addresses** (RFC 1918 ranges such as `10.0.0.0/8`, isolated within private VPC networks).

### 2.2 Where It Fits into the Existing Application
IP addresses identify client origin locations for rate limiting, audit logging, and perimeter security. Server-side, private IPs isolate backend compute instances and databases from unauthorized internet access.

### 2.3 Current Implementation and Codebase Evidence
- Client IP extraction is implemented in `src/lib/rateLimit.ts` via `getClientIp()`:
```typescript
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return headers.get('x-real-ip') || headers.get('cf-connecting-ip') || '127.0.0.1';
}
```
- Client IP is logged during proctoring telemetry in `src/app/api/quiz/proctoring-frame/route.ts` (line 44).

### 2.4 Proposed Architecture
- Ingress reverse proxies possess dual-stack Public IPv4 and IPv6 Anycast addresses via Cloudflare.
- Compute pods and database instances operate strictly on private IPs (`10.0.10.x` and `10.0.50.x`) with zero public inbound access.

### 2.5 Exact Implementation Procedure
1. Place application compute instances inside private VPC subnets.
2. Route outbound traffic (e.g. to Razorpay API) through a Managed NAT Gateway.
3. Configure PostgreSQL pg_hba.conf to whitelist only internal VPC CIDR blocks (`10.0.0.0/16`).

### 2.6 Configuration
```text
# /etc/postgresql/15/main/pg_hba.conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    all             all             10.0.0.0/16             scram-sha-256
host    all             all             0.0.0.0/0               reject
```

### 2.7 Testing & Verification Procedure
From an external network, attempt direct connection to the private IP:
```bash
nc -zv -w3 10.0.50.12 5432
# Expected: Connection timed out / unreachable
```

---

## Concept 3: Domain Name System (DNS)

### 3.1 What It Is and How It Works
DNS translates human-readable hostnames (`tkfk.in`) into machine-routable IP addresses. Recursive resolvers query Root Name Servers, TLD servers (`.in`), and Authoritative Name Servers to locate records:
- `A`: Maps domain to IPv4.
- `AAAA`: Maps domain to IPv6.
- `CNAME`: Maps domain to another hostname (canonical alias).
- `CAA`: Restricts Certificate Authorities permitted to issue SSL certificates.

### 3.2 Where It Fits into the Existing Application
Directs user traffic for `tkfk.in`, `www.tkfk.in`, and subdomains to Cloudflare Anycast edge proxies and origin application servers.

### 3.3 Current Implementation and Codebase Evidence
- Base domain `tkfk.in` configured in `next.config.mjs` and `.env.production`.
- Canonical verification URLs generated in `src/lib/utils.ts` pointing to `https://tkfk.in/verify/${code}`.

### 3.4 Proposed Architecture
Cloudflare Authoritative DNS with Anycast routing, DNSSEC enabled, and short TTLs (300 seconds) for agile disaster recovery.

### 3.5 Exact Implementation Procedure
1. Delegate domain registrar nameservers to Cloudflare: `ns1.cloudflare.com`, `ns2.cloudflare.com`.
2. Configure Apex `A` and `AAAA` records with Cloudflare Proxy mode enabled (Orange Cloud).
3. Configure `CAA` record restricting issuance to Let's Encrypt.
4. Enable DNSSEC in registrar portal via DS record.

### 3.6 Configuration
```dns
; Cloudflare DNS Zone Export for tkfk.in
tkfk.in.          300 IN A     172.67.182.11
tkfk.in.          300 IN AAAA  2606:4700:3031::ac43:b60b
www.tkfk.in.      300 IN CNAME tkfk.in.
tkfk.in.          300 IN CAA   0 issue "letsencrypt.org"
```

### 3.7 Testing & Verification Procedure
```bash
dig +dnssec tkfk.in A
# Expected: NOERROR status with RRSIG and valid Cloudflare Anycast IPs
```

---

## Concept 4: Proxy and Reverse Proxy

### 4.1 What It Is and How It Works
A forward proxy acts on behalf of clients (retrieving content from external destinations). A **reverse proxy** acts on behalf of servers, intercepting client requests, terminating TLS, buffering slow clients, applying rate limits, and routing requests to upstream application servers.

### 4.2 Where It Fits into the Existing Application
Shields the Node.js application server from raw internet traffic, offloading SSL/TLS decryption, HTTP/2 multiplexing, and compression.

### 4.3 Current Implementation and Codebase Evidence
- Next.js Edge Middleware (`src/middleware.ts`) functions as an internal reverse proxy / router, inspecting headers before dispatching to Route Handlers.

### 4.4 Proposed Architecture
Dedicated Nginx Reverse Proxy cluster sitting between Cloudflare Edge and Next.js Node.js container pods.

### 4.5 Exact Implementation Procedure
1. Provision Nginx on dual compute instances in DMZ subnet.
2. Install Let's Encrypt SSL certificates with automated Certbot renewal.
3. Configure upstream load balancing with `least_conn` and keepalive sockets.
4. Pass standard proxy headers: `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`.

### 4.6 Configuration
See complete production Nginx configuration in **[09-infrastructure-and-networking.md](./09-infrastructure-and-networking.md)** Section 4.

### 4.7 Testing & Verification Procedure
```bash
curl -I https://tkfk.in/
# Expected: HTTP/2 200, Server: nginx, Strict-Transport-Security header present
```

---

## Concept 5: Latency Optimization

### 5.1 What It Is and How It Works
Latency is the time delay between a client initiating a network action and receiving the corresponding response. It is composed of propagation delay (speed of light in fiber), transmission delay (bandwidth constraints), queuing delay, and processing delay (server compute and database execution).

### 5.2 Where It Fits into the Existing Application
Critical during the 25-minute examination: question autosaves must register instantaneously (< 100 ms) so contestants experience zero lag between answering questions.

### 5.3 Current Implementation and Codebase Evidence
- Quiz questions are frozen into `quiz_session_questions` upon session start (`src/services/db.ts`, line 89), avoiding dynamic joins during the quiz.
- Answers are cached locally in browser memory and written asynchronously.

### 5.4 Proposed Architecture
- Edge Anycast routing through Kochi/Chennai PoPs to minimize propagation delay.
- In-memory Redis caching for site settings and question lookups (< 2 ms).
- PostgreSQL connection pooling via Supavisor to eliminate TLS connection setup latency.

### 5.5 Exact Implementation Procedure
1. Enable Cloudflare Argo Smart Routing to optimize transit across Indian ISP backbones.
2. Wrap `DBService.getSiteSettings()` with Redis Cache-Aside.
3. Configure client-side autosave with a 500 ms debounce.

### 5.6 Code Example
```typescript
// Client-side debounced autosave in src/app/quiz/page.tsx
const debouncedSave = useRef(
  debounce(async (qId: string, opt: string) => {
    await fetch('/api/quiz/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, questionId: qId, selectedOption: opt }),
    });
  }, 300)
).current;
```

### 5.7 Testing & Verification Procedure
```bash
# Measure TTFB (Time to First Byte) using curl
curl -o /dev/null -s -w "Connect: %{time_connect} TTFB: %{time_starttransfer} Total: %{time_total}\n" https://tkfk.in/api/site-settings
# Target: TTFB < 120 ms
```

---

## Concept 6: HTTP / HTTPS & Protocols

### 6.1 What It Is and How It Works
HTTP is the foundation protocol of web communications. HTTPS layers TLS (Transport Layer Security) over HTTP, providing confidentiality (encryption), integrity (tamper detection), and authenticity (server identity certificates). HTTP/2 introduces binary framing and request multiplexing over a single TCP connection.

### 6.2 Where It Fits into the Existing Application
All platform traffic (payments, credentials, proctoring images) must transit exclusively over HTTPS with strict protocol enforcement.

### 6.3 Current Implementation and Codebase Evidence
- Strict security headers configured in `next.config.mjs`:
```javascript
{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }
```

### 6.4 Proposed Architecture
Enforce **TLS 1.3** as default (TLS 1.2 minimum), HTTP/2 multiplexing, HTTP/3 (QUIC) support via Cloudflare, and automated HTTP-to-HTTPS 301 redirects.

### 6.5 Exact Implementation Procedure
1. Enable HSTS with `preload` directive.
2. Disable deprecated TLS 1.0 and 1.1 ciphers in Nginx.
3. Enable OCSP Stapling in Nginx to accelerate SSL handshakes.

### 6.6 Configuration
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_stapling on;
ssl_stapling_verify on;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

### 6.7 Testing & Verification Procedure
Run SSL Labs online audit or testssl.sh:
```bash
testssl.sh --protocols --headers https://tkfk.in
# Expected: Grade A+, TLS 1.3 active, zero insecure ciphers
```

---

## Concept 7: APIs

### 7.1 What It Is and How It Works
An Application Programming Interface (API) defines a formal contract of endpoints, data structures, and status codes allowing distinct software systems to communicate deterministically.

### 7.2 Where It Fits into the Existing Application
Connects the Next.js frontend with backend domain services (`DBService`, `PaymentService`, `QuizEngineService`), and connects the platform with external services (Razorpay, Supabase Auth).

### 7.3 Current Implementation and Codebase Evidence
33 specialized API endpoints in `src/app/api/` enforcing strict request body parsing, error serialization, and HTTP status codes (200, 400, 401, 403, 404, 409, 429, 500, 503).

### 7.4 Proposed Architecture
Centralized API error handler, consistent envelope responses (`{ success: boolean, data?: T, error?: string }`), and OpenAPI / Swagger 3.0 contract generation.

### 7.5 Exact Implementation Procedure
1. Standardize API response helpers across all route handlers.
2. Implement schema validation using TypeScript / Zod.
3. Prefix versioned internal routes (`/api/v1/*`) for future backward compatibility.

### 7.6 Code Example
```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

### 7.7 Testing & Verification Procedure
Execute automated contract test suite with Postman/Newman or Vitest:
```bash
npm run test:api
```

---

# SECTION B: API DESIGN

---

## Concept 8: REST (Representational State Transfer)

### 8.1 What It Is and How It Works
REST is an architectural style for networked systems based on stateless client-server interactions, resource identification through URIs, manipulation of resources through standard HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`), and standard HTTP status codes.

### 8.2 Where It Fits into the Existing Application
All 33 API routes in `src/app/api/` follow REST conventions for managing participants, orders, quiz sessions, and questions.

### 8.3 Current Implementation and Codebase Evidence
- `GET /api/quiz/session`: Retrieves existing quiz session resource.
- `POST /api/quiz/session`: Upserts answer resources within the session.
- `PUT /api/quiz/session`: Finalizes session state from `IN_PROGRESS` to `SUBMITTED`.
- `DELETE /api/admin/questions?id=...`: Deletes a question resource.

### 8.4 Proposed Architecture
Refine resource URI naming to strictly use plural nouns and standard HTTP semantics across all endpoints:
- `POST /api/v1/registrations`
- `POST /api/v1/registrations/:id/orders`
- `GET /api/v1/quiz-sessions/current`
- `PUT /api/v1/quiz-sessions/current/submission`

### 8.5 Exact Implementation Procedure
1. Adopt consistent HTTP status codes:
   - `201 Created` for new registrations and questions.
   - `204 No Content` for deletions.
   - `409 Conflict` for duplicate attempts.
2. Implement cursor-based pagination for large administrative datasets (`/api/admin/participants`).

### 8.6 Code Example
```typescript
// Standardized REST Pagination Helper
export function parsePaginationParams(url: URL) {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '25', 10)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}
```

### 8.7 Testing & Verification Procedure
Verify endpoint responses against expected status codes:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"name":""}' https://tkfk.in/api/register
# Expected: HTTP 400 Bad Request with descriptive JSON error
```

---

## Concept 9: GraphQL

### 9.1 What It Is and How It Works
GraphQL is a query language and runtime for APIs that allows clients to request exact data shapes via a single endpoint, reducing over-fetching and under-fetching.

### 9.2 Where It Fits into the Existing Application
Evaluated as an alternative to REST for querying administrative dashboards and exam state.

### 9.3 Current Implementation and Codebase Evidence
The codebase currently uses **REST exclusively**. No GraphQL dependencies or schemas exist in `package.json`.

### 9.4 Proposed Architecture & Relevancy Evaluation
**Verdict: Not Recommended for this Application.**
- **Reasoning:** In this platform, client views are completely fixed and tightly defined (e.g. 50 questions, participant profile, payment status). Over-fetching is already prevented by React Server Components and parameterized Supabase queries.
- **Trade-offs:** GraphQL introduces schema complexity, resolver overhead, difficulties in HTTP caching, and vulnerability to deep recursive DoS attacks.
- **Conditions for Future Relevance:** If TKFK launches public developer APIs, third-party campus partner portals, or mobile SDKs requiring arbitrary client-specified data filtering, a GraphQL layer (via Yoga or Apollo) would be justified.

### 9.5 Exact Implementation Procedure (If Ever Justified)
1. Add `@graphql-yoga/next` and `graphql` to `devDependencies`.
2. Define schema types matching PostgreSQL tables (`Participant`, `QuizSession`, `Question`).
3. Construct resolvers mapping to `DBService` methods.

### 9.6 Code Example (Conceptual Schema)
```graphql
type Participant {
  id: ID!
  participantId: String
  name: String!
  status: String!
  registration: Registration
}

type Query {
  participant(id: ID!): Participant
  leaderboard(limit: Int = 50): [LeaderboardEntry!]!
}
```

### 9.7 Testing & Verification Procedure
Run GraphQL introspection and query depth benchmarks using Apollo Studio.

---

# SECTION C: DATABASE AND STORAGE

---

## Concept 10: Relational Databases

### 10.1 What It Is and How It Works
A Relational Database Management System (RDBMS) organizes data into tables composed of rows and columns, enforcing strict schemas, primary/foreign keys, check constraints, and ACID (Atomicity, Consistency, Isolation, Durability) transaction guarantees.

### 10.2 Where It Fits into the Existing Application
Serves as the single source of truth for the entire platform, storing participant accounts, financial transactions, questions, answers, and audit trails.

### 10.3 Current Implementation and Codebase Evidence
- 15 relational tables in Supabase PostgreSQL defined in `supabase/schema.sql`.
- Atomic multi-table transactions in `create_participant_with_registration` PL/pgSQL function.
- Row Level Security (RLS) enabled across all 15 tables.

### 10.4 Proposed Architecture
Maintain PostgreSQL as the primary relational database. Implement connection pooling (Supavisor) in Transaction Mode to support 10,000+ concurrent users without connection pool exhaustion.

### 10.5 Exact Implementation Procedure
1. Enable `pg_stat_statements` to monitor slow queries.
2. Route all write operations through the primary transactional connection pool (port 6543).
3. Enforce strict `NOT NULL` and `CHECK` constraints on all newly added columns.

### 10.6 Code Example
```sql
-- Enforce transactional isolation on quiz submission
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
  UPDATE public.quiz_sessions 
  SET status = 'SUBMITTED', submitted_at = NOW(), score = 48 
  WHERE id = '9b4c2e10-1234-5678-9abc-def012345678' AND status = 'IN_PROGRESS';
COMMIT;
```

### 10.7 Testing & Verification Procedure
```bash
# Verify active database connections in PostgreSQL
psql -c "SELECT count(*), state FROM pg_stat_activity GROUP BY state;"
```

---

## Concept 11: SQL vs NoSQL

### 11.1 What It Is and How It Works
SQL databases (relational) prioritize schema rigidity, data integrity, complex relational joins, and ACID transactions. NoSQL databases (document, key-value, column-family) prioritize horizontal scalability, schema flexibility, and partition tolerance, often relaxing consistency (BASE model).

### 11.2 Where It Fits into the Existing Application
Evaluated to determine if parts of the platform (e.g., proctoring telemetry or answer logs) should migrate to NoSQL.

### 11.3 Current Implementation and Codebase Evidence
The entire system is implemented on **PostgreSQL (SQL)** with JSONB columns for dynamic metadata (`system_config.value`, `payment_events.payload`, `audit_logs.metadata`).

### 11.4 Proposed Architecture & Evaluation
- **Verdict: Retain PostgreSQL.**
- **Reasoning:** PostgreSQL combines the best of both worlds: full relational ACID guarantees for financial payments and student grades, combined with native **JSONB** support for schema-less data.
- **Migration Considerations (If Needed in Future):** If proctoring telemetry reaches millions of records daily, offload the `proctoring_frames` table to a time-series or document store (AWS DynamoDB or ClickHouse) without modifying core participant or payment schemas.

### 11.5 Exact Implementation Procedure (NoSQL Offloading)
1. Provision DynamoDB table `ProctoringTelemetry` with partition key `sessionId` and sort key `timestamp`.
2. Update `DBService.recordProctoringFrame()` to write to DynamoDB while leaving all other tables in PostgreSQL.

### 11.6 Code Example (DynamoDB Client)
```typescript
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
// Writes frame telemetry to DynamoDB without locking PostgreSQL
await dynamoClient.send(new PutItemCommand({
  TableName: 'ProctoringTelemetry',
  Item: {
    sessionId: { S: sessionId },
    timestamp: { N: Date.now().toString() },
    warningsCount: { N: warningsCount.toString() },
    imageUrl: { S: r2ImageUrl }
  }
}));
```

### 11.7 Testing & Verification Procedure
Benchmark write throughput of DynamoDB vs PostgreSQL under 5,000 writes/sec load test.

---

## Concept 12: Blob & Object Storage

### 12.1 What It Is and How It Works
Object storage manages unstructured data (images, videos, PDF documents, audio) as distinct objects stored with unique keys, metadata, and flat namespaces. Files are accessed directly via HTTP/S3 APIs using pre-signed URLs, completely bypassing application servers for data transfer.

### 12.2 Where It Fits into the Existing Application
Critical for storing webcam proctoring snapshot frames, high-resolution certificate PDFs, and digital poster submissions.

### 12.3 Current Implementation and Codebase Evidence
- Base64 JPEG strings currently accepted in `src/app/api/quiz/proctoring-frame/route.ts` and stored in memory/database.
- Static posters and PDFs served directly from the `/public` folder (`public/images/`, `public/PDF/`).

### 12.4 Proposed Architecture
Introduce **Cloudflare R2** (or AWS S3) for all user-generated media. Clients upload binary frames directly to R2 using short-lived pre-signed URLs (60-second TTL), keeping the application server and database 100% free of binary bloat.

### 12.5 Exact Implementation Procedure
1. Create Cloudflare R2 bucket `tkfk-proctoring-frames`.
2. Configure AWS S3 SDK v3 in `src/lib/storage.ts`.
3. Create endpoint `/api/quiz/proctoring-presign` returning S3 pre-signed PUT URLs.
4. Update quiz client to PUT binary blob to R2 and post metadata URL to backend.

### 12.6 Configuration & Code
See complete pre-signed URL generator in **[11-caching-and-storage.md](./11-caching-and-storage.md)** Section 4.

### 12.7 Testing & Verification Procedure
```bash
# Generate pre-signed URL and upload test image directly via curl
curl -X PUT -T "test_frame.jpg" -H "Content-Type: image/jpeg" "$PRESIGNED_URL"
# Expected: HTTP 200 OK; Image verified in R2 dashboard
```

---

# SECTION D: SCALING STRATEGIES

---

## Concept 13: Vertical Scaling (Scale Up)

### 13.1 What It Is and How It Works
Vertical scaling increases the compute capacity of an existing individual server node by adding more CPU cores, RAM, network bandwidth, or faster NVMe disk drives.

### 13.2 Where It Fits into the Existing Application
Applicable primarily to the **PostgreSQL Database** tier, where maintaining single-node transactional serialization is simpler than distributed data partitioning.

### 13.3 Current Implementation and Codebase Evidence
Supabase compute instance sizing (Small: 2 vCPU, 4 GB RAM) powering the active application.

### 13.4 Proposed Architecture
Scale the primary PostgreSQL database vertically to an 8 vCPU / 32 GB RAM instance during scheduled contest windows, scaling back down to baseline compute during idle periods.

### 13.5 Exact Implementation Procedure
1. Schedule a 10-minute maintenance window 24 hours prior to contest day.
2. In Supabase Dashboard, execute compute upgrade from Small to Pro / 8 vCPU.
3. Validate connection pool allocation (`max_connections` scales from 60 to 250).

### 13.6 Configuration
```sql
-- Adjust PostgreSQL performance parameters for 32GB RAM node
ALTER SYSTEM SET shared_buffers = '8GB';
ALTER SYSTEM SET effective_cache_size = '24GB';
ALTER SYSTEM SET maintenance_work_mem = '2GB';
ALTER SYSTEM SET work_mem = '64MB';
SELECT pg_reload_conf();
```

### 13.7 Testing & Verification Procedure
```sql
SHOW shared_buffers;
SHOW max_connections;
```

---

## Concept 14: Horizontal Scaling (Scale Out)

### 14.1 What It Is and How It Works
Horizontal scaling adds more parallel server instances to the resource pool. An incoming load balancer distributes incoming network traffic across the pool of identical, stateless application servers.

### 14.2 Where It Fits into the Existing Application
Applicable to the **Next.js Compute Tier** and **BullMQ Background Worker Fleet**.

### 14.3 Current Implementation and Codebase Evidence
The application is architected statelessly:
- Sessions are carried in self-contained HMAC cookies (`src/lib/participantAuth.ts`).
- No user state is stored in Node.js global variables.
- Any Next.js instance can handle any incoming participant request.

### 14.4 Proposed Architecture
An Auto-Scaling Group (ASG) running Dockerized Next.js containers across 2 Availability Zones, automatically scaling between 2 and 20 pods based on aggregate CPU utilization (> 70%).

### 14.5 Exact Implementation Procedure
1. Create a production `Dockerfile` using multi-stage build (Node 20 Alpine).
2. Configure Kubernetes Horizontal Pod Autoscaler (HPA) or AWS ECS Auto Scaling.
3. Define scaling policies: Add 2 pods when CPU > 70% for 2 consecutive minutes.

### 14.6 Configuration (Kubernetes HPA)
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: tkfk-nextjs-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: tkfk-nextjs-app
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### 14.7 Testing & Verification Procedure
Simulate load using k6; verify pod count increases automatically:
```bash
kubectl get pods -l app=tkfk-nextjs-app -w
```

---

## Concept 15: Load Balancers

### 15.1 What It Is and How It Works
A load balancer distributes network or application traffic across multiple backend servers to maximize throughput, minimize response time, eliminate server overload, and provide automatic failover.

### 15.2 Where It Fits into the Existing Application
Positioned at the ingress of the compute tier to distribute requests across Next.js pods.

### 15.3 Current Implementation and Codebase Evidence
Edge routing currently managed via Vercel Edge / Cloudflare Anycast.

### 15.4 Proposed Architecture
Managed Nginx Ingress or AWS Application Load Balancer (ALB) operating in Layer 7 mode with `least_conn` load balancing and active HTTP health probes.

### 15.5 Exact Implementation Procedure
1. Deploy Nginx reverse proxy across 2 availability zones.
2. Configure upstream block with health checks against `/api/site-settings`.
3. Disable sticky sessions to guarantee even distribution of stateless requests.

### 15.6 Configuration
See complete Nginx configuration in **[09-infrastructure-and-networking.md](./09-infrastructure-and-networking.md)** Section 4.

### 15.7 Testing & Verification Procedure
Execute curl requests from multiple terminal sessions and verify balancing across upstream IPs in access logs.

---

## Concept 16: Database Indexing

### 16.1 What It Is and How It Works
A database index is a data structure (predominantly B-Tree) that improves the speed of data retrieval operations on a table at the cost of additional storage space and slower write operations.

### 16.2 Where It Fits into the Existing Application
Critical for rapid participant lookups, webhook transaction lookups, and leaderboard ranking generation.

### 16.3 Current Implementation and Codebase Evidence
- Indexes exist on `participants(participant_id)`, `participants(normalized_phone)`, `registrations(participant_id)`, and `quiz_session_questions(session_id)`.
- Verified in `supabase/schema.sql` lines 27–30, 46–47, 107.

### 16.4 Proposed Architecture
Introduce composite indexes and partial indexes to optimize hot query paths under 10k+ concurrent users.

### 16.5 Exact Implementation Procedure
Execute non-blocking index creation using `CONCURRENTLY`:
```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_sessions_leaderboard 
ON public.quiz_sessions (status, score DESC, time_taken_seconds ASC) 
WHERE status = 'SUBMITTED';
```

### 16.6 Code & SQL Statements
See full indexing matrix and `EXPLAIN ANALYZE` benchmarks in **[06-database-design.md](./06-database-design.md)** Section 4.

### 16.7 Testing & Verification Procedure
```sql
EXPLAIN ANALYZE SELECT * FROM quiz_sessions WHERE status = 'SUBMITTED' ORDER BY score DESC LIMIT 50;
# Expected: Index Scan using idx_quiz_sessions_leaderboard, Execution Time < 5 ms
```

---

## Concept 17: Database Replication

### 17.1 What It Is and How It Works
Database replication copies data from a primary database instance to one or more read replicas. The primary handles all data-modifying operations (`INSERT`, `UPDATE`, `DELETE`), while replicas handle read-only queries (`SELECT`), scaling read throughput horizontally.

### 17.2 Where It Fits into the Existing Application
Separates write-heavy exam autosaves and payment updates from read-heavy administrative dashboard analytics, CSV exports, and public certificate verifications.

### 17.3 Current Implementation and Codebase Evidence
Currently running on a single primary Supabase instance. All reads and writes target the same node.

### 17.4 Proposed Architecture
Primary-Replica topology:
- PostgreSQL Primary handles write transactions.
- PostgreSQL Read Replica handles `/api/verify`, `/api/admin/stats`, `/api/admin/participants`, and CSV export scripts.

### 17.5 Exact Implementation Procedure
1. Enable physical streaming replication in Supabase / RDS.
2. Expose `SUPABASE_READ_REPLICA_URL` in environment secrets.
3. Configure `DBService` to route read-only reporting queries to the replica client.

### 17.6 Code Example
```typescript
// Read/Write Routing in src/lib/supabaseServer.ts
export function getSupabaseServerClient(readonly: boolean = false) {
  const url = readonly && process.env.SUPABASE_READ_REPLICA_URL 
    ? process.env.SUPABASE_READ_REPLICA_URL 
    : process.env.SUPABASE_URL;
  return createClient(url!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}
```

### 17.7 Testing & Verification Procedure
```sql
-- Check replication lag on replica node
SELECT now() - pg_last_xact_replay_timestamp() AS replication_lag;
# Target: replication_lag < 50 ms
```

---

## Concept 18: Database Sharding

### 18.1 What It Is and How It Works
Sharding partitions large database tables horizontally across multiple independent physical database instances based on a **shard key** (e.g., `hash(participant_id) % num_shards`).

### 18.2 Where It Fits into the Existing Application
Evaluated as a scaling strategy for the `quiz_answers` and `participants` tables.

### 18.3 Current Implementation and Codebase Evidence
All data resides in a single database schema. No sharding logic exists.

### 18.4 Proposed Architecture & Relevancy Evaluation
**Verdict: Not Recommended at Current or Medium Scale.**
- **Reasoning:** Sharding introduces severe operational complexity (distributed transactions, loss of cross-shard foreign keys, complex schema migrations). The platform's total database size (< 25 GB) and transaction volume (< 5,000 writes/sec) are comfortably handled by a single PostgreSQL instance with connection pooling.
- **Conditions for Future Relevance:** If TKFK scales to multi-national operations with > 10,000,000 participants and sustained write traffic exceeding 50,000 writes/sec, sharding by `state` or `contest_year` would become necessary.

### 18.5 Exact Implementation Procedure (If Ever Justified)
1. Select `contest_id` or `participant_id` as the shard key.
2. Implement Citus Data extension for PostgreSQL or deploy a distributed SQL layer (CockroachDB / YugabyteDB).

### 18.6 Code Example (Conceptual Citus Sharding)
```sql
-- Citus Sharding Syntax
SELECT create_distributed_table('participants', 'id');
SELECT create_distributed_table('quiz_answers', 'session_id');
```

### 18.7 Testing & Verification Procedure
Execute cross-shard routing verification tests using Citus query visualizer.

---

## Concept 19: Vertical Partitioning

### 19.1 What It Is and How It Works
Vertical partitioning splits a wide table into smaller, narrower tables containing fewer columns. Frequently accessed "hot" columns remain together, while rarely accessed "cold" or large binary/text columns are moved to separate tables.

### 19.2 Where It Fits into the Existing Application
Optimizing table layout by separating heavy columns (e.g. Malayalam translation text, explanations, proctoring images) from lightweight indexing columns.

### 19.3 Current Implementation and Codebase Evidence
- `questions` table maintains `question_text`, `question_text_ml`, options, and `explanation`.
- `quiz_session_questions` maintains a frozen snapshot of only the essential exam columns.

### 19.4 Proposed Architecture
1. Move the large Base64 webcam frame strings out of the database into Cloudflare R2 object storage.
2. Separate the `questions` table:
   - `questions` (hot core: id, correct_option, difficulty, category).
   - `question_translations` (text and explanations in English and Malayalam).

### 19.5 Exact Implementation Procedure
1. Create table `public.proctoring_metadata` storing only image URLs and warning counters.
2. Purge historical Base64 image strings from primary relational tables.

### 19.6 Schema Example
```sql
CREATE TABLE public.proctoring_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
    image_r2_url TEXT NOT NULL,
    warnings_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 19.7 Testing & Verification Procedure
Compare average row size (`pg_total_relation_size`) before and after partitioning:
```sql
SELECT pg_size_pretty(pg_total_relation_size('quiz_sessions'));
```

---

# SECTION E: OPTIMIZATION AND DISTRIBUTED SYSTEMS

---

## Concept 20: Caching

### 20.1 What It Is and How It Works
Caching stores copies of data in high-speed, temporary storage (e.g. RAM) so future requests for that data are served significantly faster than querying the primary datastore.

### 20.2 Where It Fits into the Existing Application
Eliminates repetitive database queries for `site_settings`, question banks, and participant session validations.

### 20.3 Current Implementation and Codebase Evidence
- In-memory 30-second cache in `src/services/db.ts`:
```typescript
let cachedSiteSettings: SiteSettings | null = null;
let siteSettingsCacheExpiresAt = 0;
```

### 20.4 Proposed Architecture
Centralized **Redis 7.x Cluster** implementing the Cache-Aside pattern with event-driven invalidation.

### 20.5 Exact Implementation Procedure
1. Provision Redis cluster (e.g. AWS ElastiCache or Redis Cloud).
2. Configure `ioredis` client in `src/lib/redis.ts`.
3. Wrap read methods in `DBService` with Redis lookups.
4. Execute `redis.del()` when administrators update settings.

### 20.6 Code & Configuration
See complete Redis implementation in **[11-caching-and-storage.md](./11-caching-and-storage.md)** and **[15-implementation-playbook.md](./15-implementation-playbook.md)** Playbook 1.

### 20.7 Testing & Verification Procedure
```bash
redis-cli info stats | grep keyspace_hits
```

---

## Concept 21: Denormalization

### 21.1 What It Is and How It Works
Denormalization intentionally adds redundant data to a database schema to reduce or eliminate expensive multi-table `JOIN` operations, trading write performance and storage space for ultra-fast read performance.

### 21.2 Where It Fits into the Existing Application
Used during live contest scoring and leaderboard calculation.

### 21.3 Current Implementation and Codebase Evidence
- `quiz_sessions` stores denormalized `score` and `time_taken_seconds` directly on the session row, eliminating the need to execute `COUNT()` queries across `quiz_answers` on every leaderboard fetch.
- `quiz_session_questions` copies complete question text and options so queries never join back to `questions`.

### 21.4 Proposed Architecture
Maintain current denormalized fields. Add a denormalized `total_registrations_count` in `system_config` updated atomically via database triggers, eliminating table scans on `registrations` for admin dashboards.

### 21.5 Exact Implementation Procedure
1. Create a PostgreSQL trigger on `registrations` to update aggregated stats.
2. Read pre-aggregated counters directly in `/api/admin/stats`.

### 21.6 SQL Example
```sql
CREATE OR REPLACE FUNCTION update_registration_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'SUCCESS' AND OLD.payment_status != 'SUCCESS' THEN
    UPDATE public.system_config 
    SET value = jsonb_set(value, '{confirmed_participants}', (COALESCE((value->>'confirmed_participants')::int, 0) + 1)::text::jsonb)
    WHERE key = 'site_statistics';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 21.7 Testing & Verification Procedure
Verify that `/api/admin/stats` executes in < 3 ms with zero sequential scans on `registrations`.

---

## Concept 22: CAP Theorem

*(Full architectural breakdown and domain categorization provided in **[12-distributed-systems.md](./12-distributed-systems.md)** Section 1).*

---

## Concept 23: Content Delivery Network (CDN)

### 23.1 What It Is and How It Works
A CDN is a geographically distributed network of proxy servers that cache content close to end users, accelerating the delivery of static web assets (HTML, CSS, JavaScript, images, video) and providing edge security.

### 23.2 Where It Fits into the Existing Application
Delivers Next.js static chunks, contest poster graphics (`/images/contest_poster.jpeg`), and the study guide PDF (`/PDF/...`).

### 23.3 Current Implementation and Codebase Evidence
Assets stored in `/public` with cache headers configured in `next.config.mjs`.

### 23.4 Proposed Architecture
Cloudflare Global CDN with Tiered Caching enabled and aggressive edge caching rules:
- `/_next/static/*`: 1-year immutable cache.
- `/images/*` and `/Posters/*`: 30-day edge cache.
- `/PDF/*`: 7-day edge cache.

### 23.5 Exact Implementation Procedure
1. Configure Cloudflare Page Rules / Cache Rules for `tkfk.in/_next/static/*`.
2. Configure Cache Purge API integration in GitHub Actions deployment pipeline.

### 23.6 Configuration
```text
Cloudflare Cache Rule:
Field: URI Path Starts With "/_next/static/"
Cache Level: Cache Everything
Edge Cache TTL: 1 month
Browser Cache TTL: 1 year (immutable)
```

### 23.7 Testing & Verification Procedure
```bash
curl -I https://tkfk.in/_next/static/chunks/main.js
# Expected: cf-cache-status: HIT
```

---

## Concept 24: WebSockets

### 24.1 What It Is and How It Works
WebSocket is a computer communications protocol providing full-duplex, bidirectional communication channels over a single persistent TCP connection.

### 24.2 Where It Fits into the Existing Application
Evaluated for real-time exam timer synchronization, live proctoring feeds, and emergency admin broadcasts.

### 24.3 Current Implementation and Codebase Evidence
The application currently uses **HTTP polling and HTTP POST requests exclusively**.

### 24.4 Proposed Architecture & Relevancy Evaluation
- **Verdict: Not Recommended for Student Exam Flow; Recommended ONLY for Admin Live Monitoring if scale exceeds 20 concurrent proctors.**
- **Reasoning:** Maintaining 10,000 persistent stateful WebSocket connections during an exam creates server memory pressure and connection dropping challenges over mobile 4G. Discrete HTTP requests over HTTP/2 are significantly more resilient to mobile network handoffs.
- *(Full analysis in **[12-distributed-systems.md](./12-distributed-systems.md)** Section 4).*

### 24.5 Exact Implementation Procedure (If Ever Needed for Admin)
1. Deploy a lightweight Node.js `ws` server or utilize Supabase Realtime Channels.
2. Stream proctoring snapshot events to subscribed admin clients.

### 24.6 Code Example (Supabase Realtime)
```typescript
// Admin UI subscribing to live proctoring warnings
supabaseClient
  .channel('live-proctoring')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, payload => {
    showLiveAdminAlert(payload.new);
  })
  .subscribe();
```

### 24.7 Testing & Verification Procedure
Simulate 1,000 socket connections using Artillery or `ws-bench`.

---

## Concept 25: Webhooks

### 25.1 What It Is and How It Works
A webhook is an HTTP callback: an event-driven mechanism where one application sends real-time data to another application immediately upon an event occurring.

### 25.2 Where It Fits into the Existing Application
Ingests asynchronous payment status events from Razorpay (`payment.captured`, `payment.failed`).

### 25.3 Current Implementation and Codebase Evidence
- Dual webhook routes in `src/app/api/payment/webhook/route.ts` and `src/app/api/payments/webhook/route.ts`.
- Complete verification engine in `src/services/payment/paymentService.ts`:
  - Enforces `x-razorpay-signature` verification.
  - Checks idempotency via `payment_events.provider_event_id`.
  - Protects already confirmed accounts from late failure events.

### 25.4 Proposed Architecture
Offload raw webhook processing to an asynchronous BullMQ worker queue so webhook HTTP responses return `200 OK` in < 25 ms, preventing gateway timeout retries.

### 25.5 Exact Implementation Procedure
1. Receive raw webhook in route handler; verify signature synchronously.
2. Enqueue event payload to BullMQ queue `payment-webhooks`.
3. Return `HTTP 200 OK` to Razorpay immediately.
4. Background worker updates database and activates participant.

### 25.6 Code Example
```typescript
// Rapid Ingress Webhook Handler
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature') || '';
  
  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  await webhookQueue.add('process-webhook', { rawBody }, { attempts: 3, backoff: 5000 });
  return NextResponse.json({ success: true, queued: true });
}
```

### 25.7 Testing & Verification Procedure
Run security verification test script:
```bash
node scripts/test-payment-security.js
```

---

## Concept 26: Microservices

*(Full architectural breakdown, domain boundaries, and trade-off evaluation provided in **[12-distributed-systems.md](./12-distributed-systems.md)** Section 5).*

---

## Concept 27: Message Queues

*(Full BullMQ, Redis, DLQ, and worker architecture provided in **[12-distributed-systems.md](./12-distributed-systems.md)** Section 3 and **[15-implementation-playbook.md](./15-implementation-playbook.md)** Playbook 3).*

---

## Concept 28: Rate Limiting

### 28.1 What It Is and How It Works
Rate limiting controls the rate of traffic sent or received by a network interface or service. It prevents server overload, resource starvation, brute-force attacks, and credential stuffing.

### 28.2 Where It Fits into the Existing Application
Protects authentication endpoints (`/api/quiz/login`, `/api/admin/login`), registration (`/api/register`), and contact submissions (`/api/contact`).

### 28.3 Current Implementation and Codebase Evidence
- Implemented in `src/lib/rateLimit.ts` via in-memory sliding window and PostgreSQL `rate_limits` table:
```typescript
export async function checkRateLimitAsync(key: string, options: RateLimitOptions)
```
- Integrated into `src/app/api/register/route.ts` (line 55) and `src/app/api/quiz/login/route.ts` (line 17).

### 28.4 Proposed Architecture
Migrate rate limiting from PostgreSQL `rate_limits` table writes to **Redis Sliding Window Counters** executing an atomic Lua script:
- Sub-millisecond execution (< 1 ms).
- Zero database write overhead.
- True cross-pod synchronization.

### 28.5 Exact Implementation Procedure
Deploy the Redis atomic sliding window rate limiter script across all public POST endpoints.

### 28.6 Code Example (Redis Lua Script)
```lua
-- Atomic Sliding Window Rate Limiter
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
    return 1 -- Allowed
else
    return 0 -- Denied
end
```

### 28.7 Testing & Verification Procedure
Execute 20 rapid curl requests against `/api/quiz/login`:
```bash
for i in {1..20}; do curl -s -o /dev/null -w "%{http_code}\n" -X POST https://tkfk.in/api/quiz/login; done
# Expected: First 10 return 400 (bad input), subsequent 10 return 429 Too Many Requests
```

---

## Concept 29: API Gateway

### 29.1 What It Is and How It Works
An API Gateway is a server that acts as the single point of entry for defined backends, handling routing, composition, protocol translation, authentication, SSL termination, and rate limiting.

### 29.2 Where It Fits into the Existing Application
Evaluated as an ingress router between public clients and backend route handlers.

### 29.3 Current Implementation and Codebase Evidence
Next.js Edge Middleware (`src/middleware.ts`) functions as an embedded API gateway, handling edge path matching and token verification.

### 29.4 Proposed Architecture & Evaluation
- **Verdict: Utilize Cloudflare API Shield + Nginx Reverse Proxy.**
- **Reasoning:** Deploying a standalone enterprise gateway (such as Kong or Envoy) adds operational complexity and infrastructure cost without delivering benefits beyond what Cloudflare + Nginx + Next.js Middleware already provide.

### 29.5 Exact Implementation Procedure
1. Enforce API routing and rate limiting at Nginx.
2. Route administrative endpoints through authenticated middleware.

### 29.6 Configuration
See Nginx configuration in **[09-infrastructure-and-networking.md](./09-infrastructure-and-networking.md)** Section 4.

### 29.7 Testing & Verification Procedure
Verify that unauthorized requests are rejected before reaching the Node.js application server.

---

## Concept 30: Idempotency

### 30.1 What It Is and How It Works
An operation is idempotent if applying it multiple times produces the exact same result as applying it once. In APIs, idempotent endpoints ensure that network retries or double-clicks do not cause duplicate state mutations or multiple payments.

### 30.2 Where It Fits into the Existing Application
Critical for:
1. Registration submission (`/api/register`).
2. Payment order creation (`/api/payment/create-order`).
3. Webhook status processing (`/api/payment/webhook`).
4. Question autosave (`/api/quiz/session`).

### 30.3 Current Implementation and Codebase Evidence
- **Webhook Idempotency:** Enforced via `payment_events.provider_event_id UNIQUE` (`src/services/payment/paymentService.ts`, line 121).
- **Answer Autosave Idempotency:** Enforced via `quiz_answers(session_id, question_id) UNIQUE`.
- **Registration Idempotency:** Enforced via `create_participant_with_registration` PL/pgSQL function checking existing email/phone.

### 30.4 Proposed Architecture
Standardize an `Idempotency-Key` HTTP header protocol for all client state-modifying requests, cached in Redis with a 24-hour TTL.

### 30.5 Exact Implementation Procedure
1. Client generates UUIDv4 `Idempotency-Key` header on checkout and form submission.
2. Next.js middleware checks Redis for `idempotency:{key}`.
3. If found, returns the cached previous response immediately.
4. If not found, acquires a distributed lock, executes the handler, caches the response, and releases the lock.

### 30.6 Code Example
```typescript
// Idempotency Middleware Pattern
export async function withIdempotency(req: NextRequest, handler: Function) {
  const idempotencyKey = req.headers.get('idempotency-key');
  if (!idempotencyKey) return handler(req);

  const cacheKey = `idempotency:${idempotencyKey}`;
  const cachedResponse = await redisClient.get(cacheKey);
  if (cachedResponse) {
    return NextResponse.json(JSON.parse(cachedResponse));
  }

  const response = await handler(req);
  const responseData = await response.clone().json();
  await redisClient.setex(cacheKey, 86400, JSON.stringify(responseData));
  return response;
}
```

### 30.7 Testing & Verification Procedure
Send duplicate payment order requests with identical `Idempotency-Key`:
```bash
curl -X POST -H "Idempotency-Key: test-uuid-1234" -d '{"registrationId":"..."}' https://tkfk.in/api/payment/create-order
curl -X POST -H "Idempotency-Key: test-uuid-1234" -d '{"registrationId":"..."}' https://tkfk.in/api/payment/create-order
# Expected: Identical JSON response, Razorpay API called only once
```

---

Proceed to **[15-implementation-playbook.md](./15-implementation-playbook.md)** for detailed, step-by-step engineering implementation playbooks.
