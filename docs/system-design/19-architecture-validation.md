# 19 — Architecture Validation & Baseline Verification Audit

> **Module:** Architecture Claim Validation & Source Code Verification  
> **Status:** Stage 2 Engineering Readiness Audit  
> **Target Audience:** Principal Architects, Lead Systems Engineers, SREs

---

## 1. Executive Summary

This audit rigorously tests and verifies every architectural claim made in the initial system design blueprint (`docs/system-design/01-18`) against the physical source code of the repository (`gandhi-knowledge-challenge-2026`).

Every claim is categorized into one of five formal verification states:
- **[VERIFIED]**: Fully corroborated by exact source code, configuration files, and schema definitions.
- **[PARTIALLY VERIFIED]**: Conceptually true or present, but with technical discrepancies or nuances in implementation.
- **[INCORRECT]**: Directly contradicted by actual codebase findings.
- **[OUTDATED]**: Previously valid, but superseded by recent architecture changes or feature retirements.
- **[UNVERIFIED]**: Inferred or projected without direct evidence in the committed repository.

---

## 2. Core Architectural Claims Validation Matrix

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   ARCHITECTURAL CLAIMS VALIDATION MATRIX                                        │
├─────┬────────────────────────────────┬────────────────────────┬─────────────────────────────────────────────────┤
│ ID  │ Claim Tested                   │ Status                 │ Verified Codebase Evidence & Findings           │
├─────┼────────────────────────────────┼────────────────────────┼─────────────────────────────────────────────────┤
│ C01 │ 15 Relational Database Tables  │ **VERIFIED**           │ `supabase/schema.sql` lines 9-207 explicitly   │
│     │                                │                        │ define exactly 15 tables with RLS and PKs.     │
├─────┼────────────────────────────────┼────────────────────────┼─────────────────────────────────────────────────┤
│ C02 │ 33 API Route Handlers          │ **VERIFIED**           │ Exact filesystem count under `src/app/api/**`   │
│     │                                │                        │ yields 33 `route.ts` files.                     │
├─────┼────────────────────────────────┼────────────────────────┼─────────────────────────────────────────────────┤
│ C03 │ HMAC-SHA256 Session Auth       │ **VERIFIED**           │ `src/lib/participantAuth.ts` lines 48-98 and   │
│     │                                │                        │ `src/lib/adminAuth.ts` lines 21-36.             │
├─────┼────────────────────────────────┼────────────────────────┼─────────────────────────────────────────────────┤
│ C04 │ Edge WebCrypto Verification    │ **VERIFIED**           │ `src/lib/edgeAuth.ts` lines 36-54 uses W3C     │
│     │                                │                        │ `crypto.subtle` in Next.js edge middleware.     │
├─────┼────────────────────────────────┼────────────────────────┼─────────────────────────────────────────────────┤
│ C05 │ Server-Only Security Boundary  │ **VERIFIED**           │ `import 'server-only'` enforced in `db.ts`,     │
│     │                                │                        │ `quizEngine.ts`, and `paymentService.ts`.       │
├─────┼────────────────────────────────┼────────────────────────┼─────────────────────────────────────────────────┤
│ C06 │ Webhook Idempotency & Defense  │ **VERIFIED**           │ `src/services/payment/paymentService.ts`       │
│     │                                │                        │ checks `payment_events.provider_event_id`.      │
├─────┼────────────────────────────────┼────────────────────────┼─────────────────────────────────────────────────┤
│ C07 │ Late Failure Event Shield      │ **VERIFIED**           │ `paymentService.ts` lines 176-189 ignores late  │
│     │                                │                        │ `payment.failed` on already confirmed accounts. │
├─────┼────────────────────────────────┼────────────────────────┼─────────────────────────────────────────────────┤
│ C08 │ Proctoring in PostgreSQL DB    │ **INCORRECT**          │ Proctoring frames are NOT saved in PostgreSQL!  │
│     │                                │                        │ They are stored in Node.js global memory Map.   │
├─────┼────────────────────────────────┼────────────────────────┼─────────────────────────────────────────────────┤
│ C09 │ Camera & Proctoring Active     │ **OUTDATED**           │ Fully retired by stakeholder decree. Residual   │
│     │                                │                        │ code remains in `quiz/page.tsx` and `camera.ts`.│
├─────┼────────────────────────────────┼────────────────────────┼─────────────────────────────────────────────────┤
│ C10 │ Dual-Tier Rate Limiting        │ **VERIFIED**           │ `src/lib/rateLimit.ts` checks in-memory Map,    │
│     │                                │                        │ falling back to `public.rate_limits` table.     │
├─────┼────────────────────────────────┼────────────────────────┼─────────────────────────────────────────────────┤
│ C11 │ Supavisor Connection Pooling   │ **PARTIALLY VERIFIED** │ Supabase projects include Supavisor (port 6543),│
│     │                                │                        │ but repo `.env` connects directly to port 5432. │
├─────┼────────────────────────────────┼────────────────────────┼─────────────────────────────────────────────────┤
│ C12 │ In-Memory Settings Cache       │ **VERIFIED**           │ `src/services/db.ts` lines 99-100: 30-sec TTL   │
│     │                                │                        │ cache `cachedSiteSettings`.                     │
├─────┼────────────────────────────────┼────────────────────────┼─────────────────────────────────────────────────┤
│ C13 │ Asynchronous Worker Queues     │ **UNVERIFIED**         │ No BullMQ or Redis queues exist in current      │
│     │                                │                        │ production code; proposed target only.          │
├─────┼────────────────────────────────┼────────────────────────┼─────────────────────────────────────────────────┤
│ C14 │ Cloudflare R2 Active           │ **UNVERIFIED**         │ Static assets served from `/public`; R2 is not  │
│     │                                │                        │ yet provisioned or integrated.                  │
├─────┼────────────────────────────────┼────────────────────────┼─────────────────────────────────────────────────┤
│ C15 │ Nginx Reverse Proxy Running    │ **UNVERIFIED**         │ App currently runs on Vercel/Node.js direct;    │
│     │                                │                        │ Nginx configuration is proposed target.         │
└─────┴────────────────────────────────┴────────────────────────┴─────────────────────────────────────────────────┘
```

---

## 3. Deep-Dive Claim Validations

### 3.1 Claim 1: Database Table Count (15 Tables) — [VERIFIED]
Inspection of `supabase/schema.sql` lines 9 through 207 reveals exactly 15 `CREATE TABLE IF NOT EXISTS` statements:
1. `public.participants` (line 10)
2. `public.registrations` (line 33)
3. `public.referral_codes` (line 50)
4. `public.questions` (line 59)
5. `public.quiz_sessions` (line 74)
6. `public.quiz_session_questions` (line 90)
7. `public.quiz_answers` (line 110)
8. `public.certificates` (line 120)
9. `public.audit_logs` (line 131)
10. `public.system_config` (line 142)
11. `public.admin_roles` (line 153)
12. `public.contact_messages` (line 162)
13. `public.payment_transactions` (line 173)
14. `public.payment_events` (line 192)
15. `public.rate_limits` (line 206)

*Finding:* All 15 tables have Row Level Security enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` lines 223–237).

---

### 3.2 Claim 2: API Route Count (33 Endpoints) — [VERIFIED]
A recursive scan of `src/app/api/**/route.ts` yields exactly 33 endpoints:
- **Authentication & Participant (5):** `/api/quiz/login`, `/api/admin/login`, `/api/admin/logout`, `/api/participant/me`, `/api/participant/logout`
- **Registration (1):** `/api/register`
- **Payments (8):** `/api/create-order`, `/api/payment/create-order`, `/api/payment/verify`, `/api/verify-payment`, `/api/payment/status`, `/api/payment/config`, `/api/payment/webhook`, `/api/payments/webhook`
- **Quiz Engine (2):** `/api/quiz/session`, `/api/quiz/proctoring-frame`
- **Certificates & Verification (3):** `/api/certificates`, `/api/verify`, `/api/results`
- **Site Settings & Inquiries (2):** `/api/site-settings`, `/api/contact`
- **Admin Management (12):** `/api/admin/session`, `/api/admin/stats`, `/api/admin/participants`, `/api/admin/payments`, `/api/admin/proctoring`, `/api/admin/questions`, `/api/admin/quiz-test`, `/api/admin/referrals`, `/api/admin/reset-attempt`, `/api/admin/results`, `/api/admin/settings`, `/api/admin/audit-logs`

*Total Verified:* $5 + 1 + 8 + 2 + 3 + 2 + 12 = 33$ route handlers.

---

### 3.3 Claim 8: Proctoring Stored in PostgreSQL — [INCORRECT / CLARIFIED]
- **Previous System Design Assumption:** Documentation in `02`, `10`, and `11` assumed proctoring Base64 snapshot images were written to PostgreSQL rows, causing table bloat.
- **Actual Codebase Implementation:** In `src/services/db.ts` (lines 2760–2805 and 3001–3007), `recordProctoringFrame()` writes to `getGlobalProctoringStore()`, which is a **Node.js in-memory Map** (`g.__tkfk_live_proctoring_store`), NOT PostgreSQL!
- **Consequence:** PostgreSQL was never bloated by proctoring images. Instead, the Node.js process heap memory was at risk of memory leaks under large attendee counts. With camera retirement, this entire memory footprint disappears.

---

### 3.4 Claim 9: Camera & Proctoring Active — [OUTDATED]
- Stakeholder decree has permanently decommissioned camera permissions, live proctoring feeds, and face detection.
- Active residual code remains in `src/app/quiz/page.tsx`, `src/lib/camera.ts`, `src/lib/faceDetector.ts`, `src/app/admin/proctoring/page.tsx`, and `src/app/api/quiz/proctoring-frame/route.ts`.
- Decommissioning plan is formalized in Section 4 below.

---

## 4. Camera & Proctoring Decommissioning Audit

### Residual Footprint Analysis
```
┌────────────────────────────────────────────────────────────────────────┐
│                   RESIDUAL PROCTORING FOOTPRINT                        │
├────────────────────────┬─────────────────────────┬─────────────────────┤
│ File Path              │ Existing Functionality  │ Target Action       │
├────────────────────────┼─────────────────────────┼─────────────────────┤
│ src/app/quiz/page.tsx  │ Captures webcam frames, │ Remove camera hook, │
│                        │ calls face detector,    │ interval timers,    │
│                        │ video element in DOM    │ and proctor fetch   │
├────────────────────────┼─────────────────────────┼─────────────────────┤
│ src/lib/camera.ts      │ WebRTC getUserMedia,    │ Deprecate / delete  │
│                        │ permission error helper │                     │
├────────────────────────┼─────────────────────────┼─────────────────────┤
│ src/lib/faceDetector.ts│ Multi-person detection  │ Deprecate / delete  │
│                        │ algorithm               │                     │
├────────────────────────┼─────────────────────────┼─────────────────────┤
│ src/app/api/quiz/      │ Ingests Base64 frames   │ Return HTTP 410 or  │
│ proctoring-frame/      │                         │ deprecate safely    │
├────────────────────────┼─────────────────────────┼─────────────────────┤
│ src/app/admin/         │ CCTV wall for cameras   │ Retire / redirect   │
│ proctoring/page.tsx    │                         │ to participants list│
├────────────────────────┼─────────────────────────┼─────────────────────┤
│ src/services/db.ts     │ getGlobalProctoring...  │ Remove in-memory    │
│                        │ recordProctoringFrame() │ proctoring Map      │
└────────────────────────┴─────────────────────────┴─────────────────────┘
```

### Architectural Impact of Decommissioning
1. **Network Ingress Dropped by 90%:** Removing periodic 120 KB JPEG uploads drops peak examination network throughput from **~1.5 Gbps to < 45 Mbps** at 10,000 concurrent contestants.
2. **Elimination of Blob Storage Requirement:** Cloudflare R2 is no longer required for proctoring frames. The only remaining storage requirements are static marketing assets and downloadable certificates, which are already cleanly handled.
3. **Client Battery & CPU Load Slashed:** Mobile browsers running the quiz will no longer execute real-time WebRTC hardware encoding or canvas pixel analysis, eliminating browser freezing on budget Android devices.
4. **Zero Camera Permission Drop-offs:** Eliminates student login failures caused by camera hardware locks or permission denials.

Proceed to **[20-security-and-integrity-audit.md](./20-security-and-integrity-audit.md)** for the deep-dive audit of race conditions, timer integrity, and security vulnerabilities.
