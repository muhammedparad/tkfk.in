# 05 — Data Flow & Sequence Diagrams

> **Module:** System Sequences, End-to-End Tracing & Data-Flow Diagrams  
> **Status:** Grounded in Verified Source Code  
> **Target Audience:** Integration Engineers, Backend Developers, Security Auditors

---

## 1. API Communication Architecture (Diagram 6)

The diagram below maps how client applications, external providers, and internal backend components interact over HTTP/HTTPS protocols.

```mermaid
graph TD
    subgraph Clients ["Client Applications"]
        BrowserUser["Participant Browser<br/>(Desktop / Mobile)"]
        BrowserAdmin["Administrator Browser<br/>(Management Console)"]
        RazorpayWebhookNode["Razorpay Webhook Dispatcher<br/>(External Server)"]
    end

    subgraph Boundary ["Next.js Server Application Boundary"]
        subgraph Perimeter ["Security Perimeter"]
            EdgeMW["Next.js Edge Middleware<br/>(Token Validation & Route Guard)"]
        end

        subgraph Endpoints ["REST API Endpoints"]
            EP_Reg["/api/register"]
            EP_Order["/api/payment/create-order"]
            EP_VerifyPay["/api/payment/verify"]
            EP_Webhook["/api/payment/webhook"]
            EP_QuizLogin["/api/quiz/login"]
            EP_QuizSess["/api/quiz/session"]
            EP_Proctor["/api/quiz/proctoring-frame"]
            EP_Cert["/api/verify"]
            EP_Admin["/api/admin/*"]
        end

        subgraph Core_Services ["Domain Logic & Data Services"]
            Svc_Pay["PaymentService"]
            Svc_Quiz["QuizEngineService"]
            Svc_DB["DBService (Data Access Object)"]
        end
    end

    subgraph Data_Stores ["Persistence Layer"]
        SupabaseDB[("Supabase PostgreSQL")]
        RazorpayAPI["Razorpay REST API<br/>(api.razorpay.com)"]
    end

    %% Client Communication Flows
    BrowserUser -->|POST: Registration Details| EP_Reg
    BrowserUser -->|POST: Init Payment Order| EP_Order
    BrowserUser -->|POST: Client Signature| EP_VerifyPay
    BrowserUser -->|POST: Public ID + Phone| EP_QuizLogin
    BrowserUser -->|GET / POST / PUT: Exam Lifecycle| EP_QuizSess
    BrowserUser -->|POST: Base64 Webcam Snapshots| EP_Proctor
    BrowserUser -->|GET: Query Certificate Code| EP_Cert

    BrowserAdmin -->|Administrative Operations| EdgeMW
    EdgeMW -->|Forward Authorized| EP_Admin

    RazorpayWebhookNode -->|POST: Asynchronous Event Payload| EP_Webhook

    %% Internal Orchestration
    EP_Reg --> Svc_DB
    EP_Order --> Svc_Pay
    EP_VerifyPay --> Svc_Pay
    EP_Webhook --> Svc_Pay
    Svc_Pay -->|HTTP: Create Order| RazorpayAPI
    Svc_Pay --> Svc_DB

    EP_QuizLogin --> Svc_DB
    EP_QuizSess --> Svc_Quiz
    EP_Proctor --> Svc_DB
    Svc_Quiz --> Svc_DB
    EP_Cert --> Svc_DB
    EP_Admin --> Svc_DB

    Svc_DB -->|Parameterized SQL & RPCs| SupabaseDB
```

---

## 2. Authentication & Session Verification (Diagram 7)

```mermaid
sequenceDiagram
    autonumber
    actor Participant as Participant Browser
    participant API as /api/quiz/login
    participant DB as DBService
    participant Auth as participantAuth.ts
    participant Postgres as Supabase PostgreSQL

    Participant->>API: POST { participantId: "TKFK26-729150", phone: "9876543210" }
    Note over API: Rate Limit Check (10 req/min)
    API->>DB: authenticateParticipant("TKFK26-729150", "9876543210")
    DB->>Postgres: SELECT * FROM participants WHERE (participant_id = $1 OR email = $1)
    Postgres-->>DB: Participant Record Found
    Note over DB: Verify phone matches registered normalized_phone
    DB->>Postgres: SELECT * FROM registrations WHERE participant_id = $id
    Postgres-->>DB: Registration Record (payment_status = 'SUCCESS')
    DB-->>API: Validated Participant & Registration

    API->>Auth: signParticipantSessionToken(participant.id, participant.participant_id, 90)
    Note over Auth: Creates HMAC-SHA256 signature<br/>using PARTICIPANT_SESSION_SECRET<br/>(Zero PII in payload)
    Auth-->>API: Signed Token: "payloadBase64.hmacSignature"

    API-->>Participant: HTTP 200 OK + Set-Cookie: tkfk26_participant_session<br/>(HttpOnly, Secure, SameSite=Lax, Max-Age=90 days)
    Note over Participant: Client stores secure cookie automatically
```

---

## 3. End-to-End Registration & Payment Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Participant
    participant RegPage as /register
    participant RegAPI as /api/register
    participant DB as DBService (PostgreSQL)
    participant PayPage as /payment
    participant OrderAPI as /api/payment/create-order
    participant PayService as PaymentService
    participant Razorpay as Razorpay API
    participant WebhookAPI as /api/payment/webhook

    User->>RegPage: Submit Registration Form (Name, Phone, Email, State, Referral)
    RegPage->>RegAPI: POST /api/register
    Note over RegAPI: Normalizes phone to canonical 10 digits<br/>Validates Indian State & Consent
    RegAPI->>DB: RPC: create_participant_with_registration()
    Note over DB: Atomic Transaction in PostgreSQL:<br/>1. Check duplicates (email / phone)<br/>2. If pending, update row<br/>3. If new, insert participant + registration (status=PENDING)
    DB-->>RegAPI: { status: 'NEW', participant, registration }
    RegAPI-->>RegPage: Success + Set-Cookie (Participant Session)
    RegPage->>PayPage: Redirect to Checkout (/payment)

    PayPage->>OrderAPI: POST /api/payment/create-order { registrationId }
    OrderAPI->>PayService: createOrder({ registrationId, amount: 99, currency: 'INR' })
    PayService->>Razorpay: POST /v1/orders { amount: 9900, currency: "INR" }
    Razorpay-->>PayService: { id: "order_Qz981kL0", status: "created" }
    PayService->>DB: createPaymentTransaction(order_id, status='PENDING')
    PayService-->>OrderAPI: Order Result
    OrderAPI-->>PayPage: { orderId: "order_Qz981kL0", amount: 99, key_id }

    PayPage->>Razorpay: Open Razorpay Checkout Modal
    User->>Razorpay: Completes Payment (UPI / Card / NetBanking)
    Razorpay-->>User: Payment Successful (razorpay_payment_id: "pay_Kx827361")

    par Asynchronous Webhook (Guaranteed Delivery)
        Razorpay->>WebhookAPI: POST /api/payment/webhook (Header: x-razorpay-signature)
        Note over WebhookAPI: 1. Verify HMAC Signature with RAZORPAY_WEBHOOK_SECRET<br/>2. Check Idempotency via payment_events (provider_event_id)<br/>3. Validate amount (₹99) & currency (INR)
        WebhookAPI->>DB: activateConfirmedRegistration(registrationId, paymentId)
        Note over DB: 1. Set registrations.payment_status = 'SUCCESS'<br/>2. Set participants.status = 'ACTIVE'<br/>3. Generate Lazy Participant ID: 'TKFK26-XXXXXX'
        DB-->>WebhookAPI: Activated
        WebhookAPI-->>Razorpay: HTTP 200 OK
    and Synchronous Client Verification (Fast Path)
        PayPage->>PayPage: POST /api/payment/verify { order_id, payment_id, signature }
        Note over PayPage: Verifies signature & activates immediately for instant UI redirect
    end
```

---

## 4. Online Exam Lifecycle & Proctoring Telemetry Flow

```mermaid
sequenceDiagram
    autonumber
    actor Contestant as Participant Browser
    participant QuizPage as /quiz
    participant QuizAPI as /api/quiz/session
    participant ProctorAPI as /api/quiz/proctoring-frame
    participant QuizEngine as QuizEngineService
    participant DB as DBService (PostgreSQL)

    Contestant->>QuizPage: Enter Exam (/quiz)
    QuizPage->>QuizAPI: GET /api/quiz/session
    QuizAPI->>QuizEngine: startSession(participantId)
    Note over QuizEngine: Check Competition Window (isQuizWindowOpen())<br/>Check Single Attempt Lock
    alt First Time Session Initialization
        QuizEngine->>DB: getOrCreateQuizSession()
        Note over DB: 1. Generate 50 questions with deterministic seed<br/>2. FREEZE questions into quiz_session_questions<br/>3. Set expires_at = NOW() + 1500 seconds (25 mins)
        DB-->>QuizEngine: { session, questions }
    else Resuming Existing Active Session
        QuizEngine->>DB: getFrozenSessionClientQuestions(sessionId)
        DB-->>QuizEngine: Return exact frozen 50 questions & previous answers
    end
    QuizEngine-->>QuizAPI: Active Session & Questions
    QuizAPI-->>QuizPage: { session, questions }

    loop Every Answer Click (Real-Time Autosave)
        Contestant->>QuizPage: Select Option B for Question #14
        QuizPage->>QuizAPI: POST /api/quiz/session { sessionId, questionId, selectedOption: 'B' }
        QuizAPI->>QuizEngine: autoSaveAnswer()
        Note over QuizEngine: Verify Session is not EXPIRED or SUBMITTED
        QuizEngine->>DB: saveAnswer() -> UPSERT into quiz_answers
        DB-->>QuizAPI: Saved OK
        QuizAPI-->>QuizPage: HTTP 200 OK
    end

    loop Every 10–15 Seconds (Proctoring Snapshot)
        QuizPage->>QuizPage: Capture Webcam Canvas Frame (Base64 JPEG)
        QuizPage->>ProctorAPI: POST /api/quiz/proctoring-frame { sessionId, imageData, warningsCount }
        ProctorAPI->>DB: recordProctoringFrame()
        DB-->>ProctorAPI: { success: true, adminWarning: null, forceTerminated: false }
        ProctorAPI-->>QuizPage: Telemetry Acknowledged
    end

    alt Contestant Clicks "Finish Exam" OR 25-Min Timer Expires
        QuizPage->>QuizAPI: PUT /api/quiz/session { sessionId }
        QuizAPI->>QuizEngine: submitSession(sessionId)
        Note over QuizEngine: Server-Side Grading Engine:<br/>1. Fetch frozen questions & correct options<br/>2. Fetch participant answers from quiz_answers<br/>3. Calculate exact score (0 to 50)<br/>4. Compute time_taken_seconds<br/>5. Set session status = 'SUBMITTED'
        QuizEngine->>DB: UPDATE quiz_sessions SET status='SUBMITTED', score=$s
        DB-->>QuizAPI: Finalized Session
        QuizAPI-->>QuizPage: Redirect to /quiz-completed
    end
```

---

## 5. System Data Flow Diagrams (Diagram 8)

### Level 0: Context Diagram
```mermaid
graph LR
    Participant(("Participant"))
    Admin(("Administrator"))
    Razorpay(("Razorpay Gateway"))
    Platform["TKFK Digital Challenge Platform<br/>(Next.js + Supabase)"]

    Participant -->|Registrations, Payments, Quiz Answers, Webcams| Platform
    Platform -->|ID Cards, Certificates, Verification Status| Participant

    Admin -->|Site Toggles, Retries, Question Banks, Proctoring Actions| Platform
    Platform -->|Live Analytics, Audit Logs, Proctoring Feeds| Admin

    Platform -->|Payment Orders| Razorpay
    Razorpay -->|Payment Status Webhooks| Platform
```

### Level 1: Functional Decomposition
```mermaid
graph TD
    User(("Participant"))

    subgraph Processes ["Platform Subsystems"]
        P1["1.0 Registration & Validation"]
        P2["2.0 Payment & Order Reconciliation"]
        P3["3.0 Session Gating & Exam Engine"]
        P4["4.0 Proctoring & Anti-Cheat Monitor"]
        P5["5.0 Credentialing & Verification"]
    end

    subgraph Datastores ["Database Entities"]
        D_Part[("D1: participants")]
        D_Reg[("D2: registrations")]
        D_Pay[("D3: payment_events & transactions")]
        D_Ques[("D4: questions & frozen_session_questions")]
        D_Ans[("D5: quiz_answers & sessions")]
        D_Cert[("D6: certificates")]
    end

    User -->|Submit Details| P1
    P1 -->|Insert / Update| D_Part
    P1 -->|Create Pending Order| D_Reg

    User -->|Execute Checkout| P2
    P2 -->|Record Event & Transactions| D_Pay
    P2 -->|Confirm & Assign Public ID| D_Part
    P2 -->|Update to SUCCESS| D_Reg

    User -->|Start Exam & Autosave| P3
    P3 -->|Read Frozen Questions| D_Ques
    P3 -->|Upsert User Answers| D_Ans
    P3 -->|Grade & Finalize Score| D_Ans

    User -->|Stream Webcam Frames| P4
    P4 -->|Store Telemetry| D_Ans

    P3 -->|Trigger Issuance| P5
    P5 -->|Generate Hash & Code| D_Cert
    User -->|Verify Certificate QR| P5
    P5 -->|Query Valid Code| D_Cert
```

---

## 6. HTTP Request Lifecycle (Diagram 9)

```mermaid
graph TD
    ClientReq["Incoming Client HTTP/HTTPS Request"] --> CF_Edge["Cloudflare Edge Network<br/>(WAF, DDoS Filter, Edge Cache)"]
    
    CF_Edge -->|Static Asset| CacheHit["Edge Cache HIT (HTTP 200 / 304)<br/>Return Cached Static File"]
    CF_Edge -->|Dynamic Route / Cache Miss| NginxProxy["Nginx Ingress Reverse Proxy<br/>(TLS 1.3 Termination, Rate Limiting)"]

    NginxProxy --> NextEdge["Next.js Edge Middleware (src/middleware.ts)"]

    NextEdge -->|Admin Route Without Valid HMAC| AuthReject["HTTP 401 Unauthorized /<br/>Redirect to /admin/login"]
    NextEdge -->|Public or Authenticated Request| RouteHandler["Next.js Node.js Route Handler"]

    RouteHandler --> InputValidation["Input Sanitization & Normalization<br/>(Zod / Regex / Phone Normalizer)"]
    InputValidation --> RateLimitCheck{"Rate Limiter Allowed?"}

    RateLimitCheck -->|Exceeded Limit| RateReject["HTTP 429 Too Many Requests<br/>(Retry-After Header)"]
    RateLimitCheck -->|Allowed| DomainService["Domain Business Service<br/>(PaymentService / QuizEngine / DBService)"]

    DomainService --> DBPool["Supabase PostgreSQL Connection Pool"]
    DBPool --> DBExec["PostgreSQL Execution<br/>(Query, Constraint Check, PL/pgSQL RPC)"]

    DBExec --> FormatResponse["Format JSON Response & Set HTTP-Only Cookies"]
    FormatResponse --> OutgoingResponse["HTTP 200 / 201 Response Streamed to Client"]
```

Proceed to **[06-database-design.md](./06-database-design.md)** for the complete schema, entity-relationship diagrams, and query performance optimizations.
