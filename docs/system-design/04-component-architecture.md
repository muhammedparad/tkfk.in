# 04 — Component Architecture

> **Module:** Subsystem Breakdown, Layered Boundaries & Component Responsibilities  
> **Status:** Grounded in Verified Source Code & Proposed Modular Separation  
> **Target Audience:** Full-Stack Engineers, Software Architects, Code Reviewers

---

## 1. Architectural Layering Model

The TKFK application architecture follows a **5-tier layered design** with strict one-directional dependency flows. Lower layers never depend on higher layers, and server-side components never cross the boundary into client-side bundles.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        5-TIER LAYERED ARCHITECTURE                     │
├────────────────────────────────────────────────────────────────────────┤
│ Layer 1: Client Presentation & UI Subsystems (React / RSC / Canvas)    │
│ Layer 2: Edge Perimeter & Middleware Subsystems (Next.js Edge Runtime) │
│ Layer 3: API Controller & Route Handler Subsystems (App Router Routes) │
│ Layer 4: Domain Business Services Subsystems (Server-Only Singletons)  │
│ Layer 5: Data Access, Caching & External Integration Subsystems        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Architecture Diagram (Diagram 4)

```mermaid
graph TD
    subgraph Layer1_Client ["Layer 1: Client Subsystems (Browser / Mobile)"]
        subgraph UI_Public ["Public & Marketing Domain"]
            Comp_Landing["LandingPage & Sections<br/>(Hero, Problem, Pricing, FAQ)"]
            Comp_Rules["ContestRulesModal<br/>(Lenis Freeze, Backdrop Blur)"]
        end

        subgraph UI_Participant ["Participant Experience Domain"]
            Comp_RegForm["RegistrationForm<br/>(Validation, Phone Normalization)"]
            Comp_Payment["PaymentModal & RazorpayClient<br/>(Checkout Integration)"]
            Comp_QuizClient["QuizInterface & Timer<br/>(Seeded 50 Questions, Autosave)"]
            Comp_Proctoring["WebcamCapture & FaceDetector<br/>(HTML5 Video/Canvas Stream)"]
            Comp_CanvasCards["ParticipantIdCard & Certificate Canvas<br/>(Client-Side 2D Renderers)"]
        end

        subgraph UI_Admin ["Administrative Domain"]
            Comp_AdminNav["AdminSidebar & Header"]
            Comp_AdminViews["Admin Dashboard, Participants,<br/>Proctoring Monitor, Question Banks"]
        end
    end

    subgraph Layer2_Edge ["Layer 2: Edge & Middleware Subsystem"]
        MW_Matcher["Next.js Route Matcher<br/>(/admin/*, /api/admin/*)"]
        MW_EdgeAuth["EdgeAuthEngine<br/>(Web Crypto Subtle API HMAC)"]
    end

    subgraph Layer3_Controllers ["Layer 3: Controller & Route Handler Subsystems"]
        Ctrl_Reg["Registration Controller<br/>(/api/register)"]
        Ctrl_Pay["Payment Controller<br/>(/api/payment/create-order, verify, webhook)"]
        Ctrl_Quiz["Quiz Session Controller<br/>(/api/quiz/session, login, proctoring-frame)"]
        Ctrl_Cert["Certificate Controller<br/>(/api/certificates, /api/verify)"]
        Ctrl_Admin["Admin Management Controller<br/>(/api/admin/*)"]
    end

    subgraph Layer4_Domain ["Layer 4: Domain Business Services (server-only)"]
        Svc_Payment["PaymentService<br/>- RazorpayPaymentAdapter<br/>- MockPaymentAdapter<br/>- Idempotency & Late Failure Shield"]
        Svc_Quiz["QuizEngineService<br/>- Exam Window Gating<br/>- Seeded Shuffler & Session Freezer<br/>- Strict 25-Min Expiration & Grading"]
        Svc_Auth["AuthService<br/>- Participant Token Signer (90d)<br/>- Admin Password & Role Verifier"]
        Svc_RateLimit["RateLimitService<br/>- Composite Key Generator<br/>- Sliding Window Calculator"]
    end

    subgraph Layer5_Persistence ["Layer 5: Data Access, Caching & Integration Subsystems"]
        DAO_DB["DBService (Data Access Object)<br/>- Supabase Admin Client<br/>- Site Settings Cache (30s)<br/>- Question Bank Normalizer"]
        Cache_Redis["Redis Cache Adapter<br/>(Distributed Limits & Settings)"]
        Storage_R2["Object Storage Adapter<br/>(Proctoring Frames & Cert PDFs)"]
        Ext_Razorpay["External: Razorpay REST API"]
        Ext_SupabaseAuth["External: Supabase Auth (GoTrue)"]
        DB_Postgres[("Supabase PostgreSQL Database<br/>Tables, Indexes, RLS, RPC Functions")]
    end

    %% Client Interactions to Edge & Controllers
    Comp_Landing --> Ctrl_Reg
    Comp_RegForm --> Ctrl_Reg
    Comp_Payment --> Ctrl_Pay
    Comp_QuizClient --> Ctrl_Quiz
    Comp_Proctoring --> Ctrl_Quiz
    Comp_CanvasCards --> Ctrl_Cert

    Comp_AdminNav --> MW_Matcher
    Comp_AdminViews --> MW_Matcher
    MW_Matcher --> MW_EdgeAuth
    MW_EdgeAuth -->|Authorized| Ctrl_Admin

    %% Controllers to Domain Services
    Ctrl_Reg --> Svc_RateLimit
    Ctrl_Reg --> DAO_DB
    Ctrl_Pay --> Svc_Payment
    Ctrl_Quiz --> Svc_Quiz
    Ctrl_Quiz --> Svc_RateLimit
    Ctrl_Cert --> DAO_DB
    Ctrl_Admin --> DAO_DB

    %% Domain Services Cross-Communication
    Svc_Payment --> DAO_DB
    Svc_Payment --> Ext_Razorpay
    Svc_Quiz --> DAO_DB
    Svc_Auth --> Ext_SupabaseAuth
    Svc_RateLimit --> Cache_Redis
    Svc_RateLimit --> DAO_DB

    %% Data Access to Physical Layers
    DAO_DB --> DB_Postgres
    DAO_DB --> Storage_R2
    DAO_DB --> Cache_Redis
```

---

## 3. Subsystem Breakdown & Responsibility Matrix

### Subsystem A: Client Presentation Layer
| Component | Primary File(s) | Architectural Responsibilities |
| :--- | :--- | :--- |
| **`ContestRulesModal`** | `src/components/contest/ContestRulesModal.tsx` | Provides summary & full contest rules; locks background scrolling via `lenis.stop()` and `overscroll-contain`; renders frosted-glass backdrop blur (`14px`). |
| **`ParticipantIdCardCanvas`** | `src/components/ui/ParticipantIdCardCanvas.tsx` | Pure client-side HTML5 canvas renderer; draws official participant pass with live QR verification link, photo portrait, and watermarks without backend compute cost. |
| **`CertificateCanvas`** | `src/components/ui/CertificateCanvas.tsx` | Draws high-resolution printable award certificates with dynamic student name, score, grade, official signatures, and verification hash. |
| **`QuizInterface`** | `src/app/quiz/page.tsx` | Orchestrates interactive 50-question exam, 25-minute client countdown timer, auto-saves on answer selection, full-screen lockdown, and offline backup storage. |
| **`WebcamProctor`** | `src/lib/camera.ts`, `faceDetector.ts` | Requests camera permissions, samples video stream frames every 10–15 seconds, and reports face tracking status and telemetry to proctoring API. |

### Subsystem B: Edge & Middleware Layer
| Component | Primary File(s) | Architectural Responsibilities |
| :--- | :--- | :--- |
| **`NextRequest Middleware`** | `src/middleware.ts` | Intercepts all administrative page requests (`/admin/*`) and API endpoints (`/api/admin/*`); ensures zero unauthenticated calls reach the Node.js application server. |
| **`EdgeAuth`** | `src/lib/edgeAuth.ts` | Verifies HMAC-SHA256 admin tokens at the edge using the native Web Crypto Subtle API; operates with zero Node.js dependencies in < 2ms execution time. |

### Subsystem C: API Controller Layer
| Controller Group | Endpoints Managed | Architectural Responsibilities |
| :--- | :--- | :--- |
| **Registration API** | `POST /api/register` | Input sanitization, Indian mobile number canonicalization, state validation, and atomic registration orchestration. |
| **Payment APIs** | `POST /api/payment/create-order`<br/>`POST /api/payment/verify`<br/>`POST /api/payment/webhook` | Order initialization, client payment confirmation, and webhook signature verification with idempotency protection. |
| **Exam Engine APIs** | `POST /api/quiz/login`<br/>`GET/POST/PUT /api/quiz/session`<br/>`POST /api/quiz/proctoring-frame` | Participant authentication, session generation, real-time autosave upserts, frame telemetry recording, and final grading. |
| **Verification APIs** | `GET /api/certificates`<br/>`GET /api/verify` | Public certificate authenticity verification, ensuring strict suppression of private participant PII. |
| **Admin APIs** | `13 Endpoints under /api/admin/*` | Participant management, question bank authoring, proctoring live feeds, system configuration toggles, and audit logging. |

### Subsystem D: Domain Services Layer (`server-only`)
| Domain Service | Class Name & Location | Architectural Responsibilities |
| :--- | :--- | :--- |
| **`PaymentService`** | `PaymentService` (`src/services/payment/`) | Factory pattern returning `RazorpayPaymentAdapter` or `MockPaymentAdapter`; validates amount/currency, handles idempotency, and shields against out-of-order events. |
| **`QuizEngineService`** | `QuizEngineService` (`src/services/quizEngine.ts`) | Enforces competition entry window gating; computes seeded question randomization; freezes session questions; enforces strict 25-minute timeout. |
| **`DBService`** | `DBService` (`src/services/db.ts`) | Central data access object; encapsulates Supabase PostgreSQL client operations, connection pooling, and atomic transaction execution. |
| **`RateLimiter`** | `src/lib/rateLimit.ts` | Multi-tier rate limiter implementing in-memory sliding windows with fallback to PostgreSQL `rate_limits` table. |

Proceed to **[05-data-flow-and-sequence-diagrams.md](./05-data-flow-and-sequence-diagrams.md)** for sequence diagrams tracing core transaction lifecycles.
