# 07 — API Design, Contracts & Integration Architecture

> **Module:** API Inventory, REST Contracts, Webhook Protocols & Idempotency  
> **Status:** Grounded in Verified Route Handlers (`src/app/api/`)  
> **Target Audience:** Backend Developers, API Architects, Integration Engineers

---

## 1. Complete API Route Inventory (33 Endpoints)

The platform exposes **33 distinct server-side API endpoints** implemented via Next.js Route Handlers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        COMPLETE API ROUTE INVENTORY                    │
├───────┬───────────────────────────────┬──────────────┬─────────────────┤
│ Group │ Route Path                    │ HTTP Methods │ Auth Required   │
├───────┼───────────────────────────────┼──────────────┼─────────────────┤
│ Auth  │ /api/quiz/login               │ POST         │ None (Rate Lmt) │
│       │ /api/admin/login              │ POST         │ None (Rate Lmt) │
│       │ /api/admin/logout             │ POST         │ Admin Session   │
│       │ /api/participant/me           │ GET          │ Participant Ck  │
│       │ /api/participant/logout       │ POST         │ Participant Ck  │
├───────┼───────────────────────────────┼──────────────┼─────────────────┤
│ Reg   │ /api/register                 │ POST         │ None (Rate Lmt) │
├───────┼───────────────────────────────┼──────────────┼─────────────────┤
│ Pay   │ /api/create-order (legacy)    │ POST         │ Participant Ck  │
│       │ /api/payment/create-order     │ POST         │ Participant Ck  │
│       │ /api/payment/verify           │ POST         │ Participant Ck  │
│       │ /api/verify-payment (legacy)  │ POST         │ Participant Ck  │
│       │ /api/payment/status           │ GET          │ Participant Ck  │
│       │ /api/payment/config           │ GET          │ Public          │
│       │ /api/payment/webhook          │ POST         │ Razorpay HMAC   │
│       │ /api/payments/webhook         │ POST         │ Razorpay HMAC   │
├───────┼───────────────────────────────┼──────────────┼─────────────────┤
│ Quiz  │ /api/quiz/session             │ GET/POST/PUT │ Participant Ck  │
│       │ /api/quiz/proctoring-frame    │ POST         │ Participant Ck  │
├───────┼───────────────────────────────┼──────────────┼─────────────────┤
│ Cert  │ /api/certificates             │ GET          │ Public          │
│       │ /api/verify                   │ GET          │ Public          │
│       │ /api/results                  │ GET          │ Public (Gated)  │
├───────┼───────────────────────────────┼──────────────┼─────────────────┤
│ Site  │ /api/site-settings            │ GET          │ Public          │
│       │ /api/contact                  │ POST         │ None (Rate Lmt) │
├───────┼───────────────────────────────┼──────────────┼─────────────────┤
│ Admin │ /api/admin/session            │ GET          │ Admin Session   │
│ (13)  │ /api/admin/stats              │ GET          │ Admin Session   │
│       │ /api/admin/participants       │ GET/POST/DEL │ Admin Session   │
│       │ /api/admin/payments           │ GET          │ Admin Session   │
│       │ /api/admin/proctoring         │ GET/POST     │ Admin Session   │
│       │ /api/admin/questions          │ GET/POST/DEL │ Admin Session   │
│       │ /api/admin/quiz-test          │ GET/POST     │ Admin Session   │
│       │ /api/admin/referrals          │ GET          │ Admin Session   │
│       │ /api/admin/reset-attempt      │ POST         │ Admin Session   │
│       │ /api/admin/results            │ GET/POST     │ Admin Session   │
│       │ /api/admin/settings           │ GET/POST     │ Admin Session   │
│       │ /api/admin/audit-logs         │ GET          │ Admin Session   │
└───────┴───────────────────────────────┴──────────────┴─────────────────┘
```

---

## 2. Core REST API Contracts

### 2.1 Participant Registration (`POST /api/register`)
* **Purpose:** Creates or updates a pending participant profile and order.
* **Rate Limit:** 10 requests / minute per `(IP + email)`.
* **Request Payload:**
```json
{
  "name": "Muhammed Rashid",
  "email": "rashid@example.com",
  "phone": "9876543210",
  "state": "Kerala",
  "city": "Kozhikode",
  "college": "Farook College",
  "referral_code": "CAMPUS10",
  "consent": true
}
```
* **Success Response (HTTP 200 OK):**
```json
{
  "success": true,
  "status": "NEW",
  "message": "Registration initiated successfully.",
  "registration_id": "8a3d4f12-789a-4bc1-9012-3456789abcde",
  "participant": {
    "id": "1c2b3a4d-5678-90ab-cdef-1234567890ab",
    "participant_id": null,
    "name": "Muhammed Rashid",
    "email": "rashid@example.com",
    "phone": "9876543210",
    "normalized_phone": "9876543210",
    "state": "Kerala",
    "status": "PENDING"
  },
  "registration": {
    "id": "8a3d4f12-789a-4bc1-9012-3456789abcde",
    "amount": 99,
    "currency": "INR",
    "payment_status": "PENDING"
  }
}
```
* **Error Response (Duplicate Confirmed Registration - HTTP 409 Conflict):**
```json
{
  "success": false,
  "status": "ALREADY_REGISTERED",
  "message": "This mobile number or email is already registered with a confirmed account. Please log in to your dashboard."
}
```

---

### 2.2 Payment Order Creation (`POST /api/payment/create-order`)
* **Purpose:** Prepares an authorized Razorpay Order ID for client checkout.
* **Authorization:** Valid participant session cookie matching `registration.participant_id`.
* **Request Payload:**
```json
{
  "registrationId": "8a3d4f12-789a-4bc1-9012-3456789abcde"
}
```
* **Success Response (HTTP 200 OK):**
```json
{
  "success": true,
  "order_id": "order_Qz981kL0",
  "amount": 9900,
  "currency": "INR",
  "key_id": "rzp_live_xxxxxxxxxxxx"
}
```

---

### 2.3 Quiz Session Management (`GET / POST / PUT /api/quiz/session`)

#### A. Initialize or Retrieve Session (`GET /api/quiz/session`)
* **Query Parameters:** `?checkOnly=false`
* **Success Response (Active In-Progress Session):**
```json
{
  "success": true,
  "session": {
    "id": "9b4c2e10-1234-5678-9abc-def012345678",
    "participant_id": "1c2b3a4d-5678-90ab-cdef-1234567890ab",
    "started_at": "2026-10-30T15:00:00.000Z",
    "expires_at": "2026-10-30T15:25:00.000Z",
    "status": "IN_PROGRESS",
    "total_questions": 50
  },
  "questions": [
    {
      "id": "00000000-0000-0000-0000-000000000001",
      "question_text": "In which year was the historic Salt March initiated by Mahatma Gandhi?",
      "question_text_ml": "മഹാത്മാഗാന്ധി ചരിത്രപ്രസിദ്ധമായ ഉപ്പുസത്യാഗ്രഹം ആരംഭിച്ച വർഷം ഏത്?",
      "option_a": "1928",
      "option_b": "1930",
      "option_c": "1932",
      "option_d": "1942",
      "category": "Freedom Movement",
      "difficulty": "MEDIUM"
    }
  ]
}
```

#### B. Autosave Answer Selection (`POST /api/quiz/session`)
* **Request Payload:**
```json
{
  "sessionId": "9b4c2e10-1234-5678-9abc-def012345678",
  "questionId": "00000000-0000-0000-0000-000000000001",
  "selectedOption": "B"
}
```
* **Success Response:** `{"success": true}` (HTTP 200)

#### C. Final Session Submission (`PUT /api/quiz/session`)
* **Request Payload:**
```json
{
  "sessionId": "9b4c2e10-1234-5678-9abc-def012345678"
}
```
* **Success Response:**
```json
{
  "success": true,
  "session": {
    "id": "9b4c2e10-1234-5678-9abc-def012345678",
    "status": "SUBMITTED",
    "score": 46,
    "time_taken_seconds": 1142,
    "submitted_at": "2026-10-30T15:19:02.000Z"
  }
}
```

---

## 3. Webhook Architecture & Razorpay Event Ingestion

### Security Protocol (`POST /api/payment/webhook`)
Razorpay asynchronously sends JSON event payloads signed via an HMAC-SHA256 digest in header `x-razorpay-signature`.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        WEBHOOK DEFENSE PIPELINE                        │
└────────────────────────────────────────────────────────────────────────┘

  Razorpay Ingress ──> [Raw Body Text Capture]
                              │
                              ├── Compute: HMAC-SHA256(rawBody, RAZORPAY_WEBHOOK_SECRET)
                              ▼
  [Signature Verification Check] ──(Mismatch)──> HTTP 400 Bad Request
          │
          └──(Valid Signature)──> [Idempotency Guard]
                                        │
                                        ├── Query: payment_events WHERE provider_event_id = $id
                                        ▼
  [Duplicate Event?] ──(True)──> HTTP 200 OK ("Idempotent execution: Already processed")
          │
          └──(False)──> [Amount & Currency Validation]
                              │
                              ├── Expected: ₹99, INR
                              ▼
  [Match?] ──(Mismatch)──> Set Status: MANUAL_REVIEW (Alert Admin)
      │
      └──(Match)──> [Late Failure Shield]
                          │
                          ├── If DB is already 'SUCCESS' & Event is 'payment.failed':
                          │   Discard late failure; keep registration 'SUCCESS'
                          ▼
                    [Activate Participant]
                          │
                          ├── Set registrations.payment_status = 'SUCCESS'
                          ├── Set participants.status = 'ACTIVE'
                          └── Assign Lazy ID: 'TKFK26-XXXXXX'
```

---

## 4. Idempotency Implementation Blueprint

Duplicate requests occur due to browser double-clicks, network re-transmissions, or payment gateway webhook retries. The system prevents duplicates across three layers:

1. **Webhook Idempotency (Event Deduplication):**
   - Every webhook payload contains `provider_event_id` (e.g. `event_Qy8129381k`).
   - The table `public.payment_events` enforces `provider_event_id TEXT UNIQUE NOT NULL`.
   - Before executing status updates, an atomic insert into `payment_events` is executed. If a unique violation occurs, the request exits immediately with HTTP 200.

2. **Database Level Idempotency (Unique Constraints):**
   - `quiz_sessions` enforces `UNIQUE(participant_id)` — a user cannot physically start two concurrent sessions.
   - `quiz_answers` enforces `UNIQUE(session_id, question_id)` — multiple autosaves for the same question perform an `ON CONFLICT DO UPDATE` rather than appending duplicate rows.
   - `participants` enforces `UNIQUE(normalized_phone)` and `UNIQUE(participant_id)`.

3. **API Level Idempotency Keys:**
   - For client-initiated payment creation (`/api/payment/create-order`), an `Idempotency-Key` header is derived from `registration_id`. If an order for this registration already exists in `PENDING` state within the last 15 minutes, the existing `orderId` is returned rather than invoking Razorpay's API a second time.

---

## 5. GraphQL Architectural Evaluation

| Evaluation Criteria | REST + Next.js Server Components | GraphQL (Apollo / Yoga) |
| :--- | :--- | :--- |
| **Over-fetching / Under-fetching** | React Server Components execute directly on the server, fetching only required database columns. | Client requests custom fields; unnecessary since client UI views are fixed. |
| **Caching Efficiency** | HTTP caching, CDN edge caching, and Next.js route caching work natively with HTTP GET. | POST requests by default; requires complex persisted queries for CDN caching. |
| **Network Overhead & Complexity** | Zero extra dependencies; minimal bundle size. | Requires GraphQL schema parser, resolvers, AST validation, and client runtime. |
| **Security & Query Depth** | Fixed, auditable endpoints; rate limiting by endpoint is straightforward. | Vulnerable to nested query attacks (DoS) requiring query depth limiters. |

**Architectural Verdict:** GraphQL is **unnecessary and discouraged** for this platform. The existing REST API structure with Next.js Server Components provides superior performance, simpler caching, and smaller client bundles.

---

## 6. API Gateway Evaluation

* **Current Architecture:** Next.js Edge Middleware (`src/middleware.ts`) functions as an embedded application gateway, handling route matching, cookie parsing, and HMAC signature verification before requests hit Node.js handlers.
* **Target Scaling Architecture:** For deployments scaling beyond 10,000 concurrent users, fronting Next.js with **Cloudflare API Shield** or a managed **Nginx Ingress** provides centralized TLS offloading, global DDoS filtering, and IP rate limiting without adding internal microservices gateway overhead.

Proceed to **[08-authentication-and-security.md](./08-authentication-and-security.md)** for detailed cryptographic security and OWASP defenses.
