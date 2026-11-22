# 01 — System Requirements Analysis

> **Module:** Requirements Analysis, System Scope, and Constraints  
> **Status:** Grounded in Verified Codebase Implementation  
> **Target Audience:** Enterprise Architects, Product Managers, Lead Engineers

---

## 1. Introduction & Context

The **TKFK Digital Challenge Platform** is a mission-critical web application hosted for educational competitions and creative contests conducted across the state of Kerala. The application must support thousands of simultaneous participants who navigate from landing marketing pages to checkout, examination taking, and credential retrieval.

This document formalizes the complete functional requirements (FRs), non-functional requirements (NFRs), explicit assumptions, and identified unknowns derived from a reverse-engineering audit of the codebase.

---

## 2. Functional Requirements (FR)

Functional requirements are categorized by functional domain and flagged as **[VERIFIED]** (observed directly in codebase implementation) or **[INFERRED]** (logically required by workflows or operational context).

### Domain 1: Participant Identity & Registration
* **FR-1.1 [VERIFIED]:** The system shall collect participant details (`name`, `email`, `phone`, `state`, `city`, `college`, optional `referral_code`, and mandatory `consent`) via `/register` and `/api/register`.
* **FR-1.2 [VERIFIED]:** Phone numbers must be canonically normalized to 10 Indian digits (stripping non-numeric characters, leading `+91`, `91`, or `0`) via `normalizePhoneNumber()` in `src/lib/utils.ts` and enforced in SQL via `create_participant_with_registration` RPC.
* **FR-1.3 [VERIFIED]:** Duplicate registrations must be prevented based on normalized phone and lowercase email. If a user with `PENDING` registration submits again, their record is updated and resumed without creating orphaned participant rows. If already `CONFIRMED` (`status = 'ACTIVE'`), registration is blocked with HTTP 409.
* **FR-1.4 [VERIFIED]:** Participant public IDs (`TKFK26-XXXXXX` or `GKC2026-XXXXXX`) must follow **lazy assignment**: unconfirmed participants maintain `participant_id = NULL`; the unique public ID is generated and committed strictly upon successful payment confirmation.
* **FR-1.5 [VERIFIED]:** Referral codes must be validated against `referral_codes` table, and usage counts incremented atomically upon registration.

### Domain 2: Payment Processing & Order Lifecycle
* **FR-2.1 [VERIFIED]:** The platform must support online payments via Razorpay (production) and a sandbox Mock Adapter (development) orchestrated by `PaymentService`.
* **FR-2.2 [VERIFIED]:** Order creation (`/api/payment/create-order`) must verify participant identity via session cookies, generate a provider order ID, and record an initial `PENDING` transaction in `payment_transactions`.
* **FR-2.3 [VERIFIED]:** Client-side payment callbacks (`/api/payment/verify`) must verify Razorpay HMAC-SHA256 signatures (`razorpay_order_id|razorpay_payment_id`) against `RAZORPAY_KEY_SECRET`.
* **FR-2.4 [VERIFIED]:** Server webhooks (`/api/payment/webhook` and alias `/api/payments/webhook`) must verify signatures, validate currency (`INR`) and exact amount (`₹99`), enforce idempotency via `provider_event_id`, prevent late `payment.failed` events from overwriting already `SUCCESS` registrations, and flag anomalies for `MANUAL_REVIEW`.
* **FR-2.5 [VERIFIED]:** Upon confirmed payment, `activateConfirmedRegistration()` must update registration status to `CONFIRMED`, participant status to `ACTIVE`, generate public ID, and issue a 90-day persistent session token.

### Domain 3: Authentication & Authorization
* **FR-3.1 [VERIFIED]:** Participant authentication is passwordless via `/api/quiz/login`, requiring valid `participant_id` (or email) and registered `phone`.
* **FR-3.2 [VERIFIED]:** Authenticated participants receive a cryptographically signed HMAC-SHA256 session token stored inside an HTTP-only, SameSite cookie (`tkfk26_participant_session`).
* **FR-3.3 [VERIFIED]:** Administrative authentication (`/api/admin/login`) operates against Supabase Auth (`auth.users`) with role verification against `admin_roles` (`super_admin`, `admin`, `auditor`), with an emergency master environment secret fallback.
* **FR-3.4 [VERIFIED]:** Edge middleware (`src/middleware.ts`) intercepts all `/admin/*` and `/api/admin/*` requests, verifying the admin session token using the Web Crypto Subtle API (`verifyAdminSessionTokenEdge`).

### Domain 4: Online Quiz & Examination Engine
* **FR-4.1 [VERIFIED]:** Exam entry is time-gated by event windows configured in `EVENT_CONFIG` (`quiz_open_at` to `quiz_close_at`). Only administrators and whitelisted participant IDs (`reconduct_eligible_ids` or `special_allowed_ids`) can bypass gating.
* **FR-4.2 [VERIFIED]:** When a participant begins the exam (`QuizEngineService.startSession`), 50 questions are selected and randomly shuffled using a deterministic seed (`shuffleWithSeed`).
* **FR-4.3 [VERIFIED]:** The assigned questions must be **frozen** into `quiz_session_questions` to ensure question text, order, and choices remain immutable even if the master question bank is edited.
* **FR-4.4 [VERIFIED]:** The exam duration is strictly enforced to 25 minutes (1,500 seconds). The server calculates `expires_at = started_at + 25 minutes`. If a participant submits after `expires_at`, the server automatically marks the session as `EXPIRED` and computes the score.
* **FR-4.5 [VERIFIED]:** Autosave functionality (`/api/quiz/session` POST) persists selected answers incrementally to `quiz_answers` with conflict upsert protection (`UNIQUE(session_id, question_id)`).
* **FR-4.6 [VERIFIED]:** Automated server-side grading evaluates correct answers against frozen questions upon submission (`QuizEngineService.submitSession`), updating `quiz_sessions.score` and `time_taken_seconds`.
* **FR-4.7 [VERIFIED]:** Single-attempt rule: A participant may only take the quiz once. Multiple attempts are rejected unless an administrator explicitly grants retry permission via `grantParticipantRetry()`.

### Domain 5: Anti-Cheating & Webcam Proctoring Telemetry
* **FR-5.1 [VERIFIED]:** The quiz client captures webcam frames periodically (every 10–15 seconds) using HTML5 `video` and `canvas`.
* **FR-5.2 [VERIFIED]:** Frames, answered counts, time remaining, full-screen violations, and warnings are transmitted via `/api/quiz/proctoring-frame` and ingested into `DBService.recordProctoringFrame()`.
* **FR-5.3 [VERIFIED]:** Administrators can view real-time participant snapshots and streams via `/admin/proctoring` and execute actions (issue warnings, force termination).

### Domain 6: Digital ID Card, Certificates & Verification
* **FR-6.1 [VERIFIED]:** Confirmed participants receive a downloadable Digital ID Pass rendered client-side on an HTML5 canvas (`ParticipantIdCardCanvas.tsx`).
* **FR-6.2 [VERIFIED]:** Certificates are generated with unique certificate codes (`TKFK26-C-XXXXXX`), cryptographic verification hashes (HMAC-SHA256 of participant ID + score + date), and performance grades (`DISTINCTION`, `FIRST_CLASS`, `PASS`).
* **FR-6.3 [VERIFIED]:** Public certificate verification is accessible via `/verify/[id]` and `/api/verify?code=...`, returning verification status and participant name while strictly suppressing email and phone numbers to prevent PII leakage.

### Domain 7: Administrative Console & Control Center
* **FR-7.1 [VERIFIED]:** Dynamic Master Switches (`system_config` table) allow administrators to toggle `registration_open`, `portal_active`, `submission_window_open`, `results_published`, and `maintenance_mode` in real-time without redeploying code.
* **FR-7.2 [VERIFIED]:** Comprehensive admin dashboards provide live metrics: total participants, revenue collected, conversion rates, completed quizzes, and referral leaderboards.
* **FR-7.3 [VERIFIED]:** All administrative write operations (status changes, retries, deletes, setting updates) must be recorded in `audit_logs` with admin user ID, action, entity type, and metadata.

---

## 3. Non-Functional Requirements (NFR)

```
┌────────────────────────────────────────────────────────────────────────┐
│                   NON-FUNCTIONAL REQUIREMENTS MATRIX                   │
├──────────────────────┬──────────────────────┬──────────────────────────┤
│ Metric               │ Verified Baseline    │ Production Target        │
├──────────────────────┼──────────────────────┼──────────────────────────┤
│ API Latency (p95)    │ < 450 ms (Vercel)    │ < 150 ms (Cached/Edge)   │
│ Peak Concurrency     │ ~100 concurrent      │ 10,000 concurrent        │
│ System Availability  │ 99.5% (Single node)  │ 99.95% (Multi-AZ)        │
│ Recovery Time (RTO)  │ ~60 minutes          │ < 15 minutes             │
│ Recovery Point (RPO) │ Daily backup (24 hr) │ < 5 minutes (WAL archiving)│
│ Security Standard    │ OWASP Top 10 Align   │ Strict Zero-Trust & CSP  │
└──────────────────────┴──────────────────────┴──────────────────────────┘
```

### 3.1 Performance & Latency
* **NFR-1.1:** Static marketing pages (`/`, `/rules`, `/faq`) must achieve a First Contentful Paint (FCP) of < 1.0 second and Largest Contentful Paint (LCP) of < 1.8 seconds on 4G mobile devices.
* **NFR-1.2:** Dynamic API endpoints (`/api/register`, `/api/payment/create-order`, `/api/quiz/session`) must respond with a p95 latency under **200 ms** under nominal load (< 500 req/sec).
* **NFR-1.3:** Question autosave operations (`/api/quiz/session` POST) must complete within **100 ms** to eliminate client UI lag during exam progress.

### 3.2 Scalability & Concurrency
* **NFR-2.1:** The system must comfortably scale from baseline idle traffic (< 5 req/sec) to sudden peak surges (1,000–5,000 req/sec) when competition entry windows open (e.g., 3:00 PM IST on contest day).
* **NFR-2.2:** Compute tiers must support horizontal scaling with zero shared local session state across application instances.
* **NFR-2.3:** Database connection utilization must not exceed pool limits (e.g., 60 pooler connections in Supabase) during peak submission windows.

### 3.3 Availability & Reliability
* **NFR-3.1:** High availability target of **99.95%** uptime during active competition windows. Unplanned downtime during the 3-hour exam window constitutes a critical severity incident.
* **NFR-3.2:** The payment ingestion pipeline must be fault-tolerant: webhooks must be received, verified, and queued even if the primary database undergoes transient connection drops.

### 3.4 Data Integrity & Consistency
* **NFR-3.3:** Zero double-spend or duplicate payment activations: all registration status mutations and public ID assignments must be strictly atomic and idempotent.
* **NFR-3.4:** Exam answers must never be lost due to client disconnects: client stores answers locally in `localStorage` as an offline buffer synchronized periodically via autosave.

### 3.5 Security & Compliance
* **NFR-4.1:** All communication must be encrypted in transit using **TLS 1.3** (TLS 1.2 minimum).
* **NFR-4.2:** Sensitive secrets (`RAZORPAY_KEY_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_SESSION_SECRET`) must never leak to client bundles. Enforced via `import 'server-only'` across all service modules.
* **NFR-4.3:** Strict protection against Insecure Direct Object References (IDOR): participants cannot access or mutate registration records, quiz sessions, or proctoring streams belonging to other users.
* **NFR-4.4:** Rate limiting must protect authentication endpoints (`/api/quiz/login`, `/api/admin/login`), payment endpoints, and public contact forms from brute-force and denial-of-service (DoS) attacks.

### 3.6 Maintainability & Cost Efficiency
* **NFR-5.1:** Architectural enhancements must remain cost-effective for a non-profit educational society, leveraging serverless execution and cloud-free tiers wherever feasible.
* **NFR-5.2:** Modular architecture: application logic must be isolated into domain services (`PaymentService`, `QuizEngineService`, `DBService`) with clear interface contracts.

---

## 4. Requirements Classification Matrix

```
┌────────────────────────────────────────────────────────────────────────┐
│                        REQUIREMENTS TAXONOMY                           │
└────────────────────────────────────────────────────────────────────────┘
  ├── ✅ VERIFIED REQUIREMENTS (Established by Code Inspection)
  │    ├── Canonical 10-digit phone normalization (create_participant_with_registration)
  │    ├── Lazy participant_id generation strictly upon confirmed payment
  │    ├── 25-minute hard quiz timer with server-side time verification
  │    ├── Frozen quiz session questions table (quiz_session_questions)
  │    ├── Razorpay HMAC webhook signature & idempotency tracking
  │    ├── Edge HMAC admin session token verification in middleware
  │    └── Dynamic master toggles stored in public.system_config
  │
  ├── 🔍 INFERRED REQUIREMENTS (Logically Required for Operations)
  │    ├── Asynchronous offloading for webcam proctoring frames (avoid DB bloat)
  │    ├── Distributed cache layer (Redis) for high-traffic settings & rate limits
  │    ├── Automated daily database backups with point-in-time recovery (PITR)
  │    ├── Connection pooling (PgBouncer/Supavisor) to prevent connection spikes
  │    └── Automated transactional email notifications upon successful registration
  │
  └── ❓ UNKNOWNS & EXTERNAL DEPENDENCIES
       ├── Production hosting environment (Vercel serverless vs self-hosted Node.js)
       ├── Maximum burst concurrency during contest opening minute
       ├── Exact Razorpay account rate limits and webhook delivery SLAs
       └── Long-term image retention policy for proctoring snapshot storage
```

Proceed to **[02-current-system-architecture.md](./02-current-system-architecture.md)** for the complete reverse engineering and architecture audit.
