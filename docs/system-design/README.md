# TKFK Digital Challenge Platform — Practical System Design, Architecture & Implementation Blueprint

> **System Design, Architecture, and Engineering Blueprint for The Knowledge Forum Kerala (TKFK)**  
> **Platform:** Gandhi Knowledge Challenge & Digital Poster Creation Contest Platform  
> **Author:** Principal Software Architect, Senior Backend Engineer, Database Architect & DevOps Team  
> **Status:** Production-Ready Architectural Documentation  
> **Target Scope:** Documentation exclusively inside `/docs/system-design/` — Zero modifications to production application code, UI/UX, or database schemas.

---

## 1. Executive Summary

This documentation suite constitutes a comprehensive, production-grade system design exercise and technical architectural blueprint for the **The Knowledge Forum Kerala (TKFK) Competition & Examination Platform** (codebase identifier: `gandhi-knowledge-challenge-2026`).

The platform powers high-stakes statewide educational and creative challenges across Kerala, including the **Gandhi Knowledge Challenge (GKC)** and the **TKFK Digital Poster Creation Contest 2026**. The system handles the end-to-end participant lifecycle:
1. Public digital marketing, rules disclosure, and dynamic site-wide event gating.
2. Participant registration with duplicate prevention, canonical phone normalization, and referral tracking.
3. Secure e-commerce payment collection via Razorpay with automated reconciliation, cryptographic HMAC verification, and idempotency protection.
4. Timed online examinations with randomized question seeding, session freezing, server-side grading, and single-attempt integrity enforcement.
5. High-fidelity cryptographic certificate and digital ID generation with public QR code authenticity verification.
6. Real-time administrative operations, question bank authoring, audit logging, and controlled result publication.

The existing application is fully built using modern technologies: **Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Supabase (PostgreSQL with Row Level Security & PL/pgSQL Stored Procedures), and Razorpay SDK**.

This blueprint reverse-engineers the verified implementation, identifies operational constraints under high-concurrency event traffic (from 100 to 100,000 concurrent users), and designs targeted architectural enhancements—accompanied by actionable, copy-pasteable implementation playbooks that require zero speculative rewrites.

---

## 2. Document Map & Blueprint Index

The system design blueprint is organized into **22 specialized architectural modules**:

### Core Architecture Foundations (Modules 01–09)
| Document File | Title & Core Domain | Primary Engineering Audience |
| :--- | :--- | :--- |
| **[01-requirements-analysis.md](./01-requirements-analysis.md)** | Functional & Non-Functional Requirements, Constraints, Traffic Profiles | Architects, Product Managers, SREs |
| **[02-current-system-architecture.md](./02-current-system-architecture.md)** | Reverse Engineering, Actual Tech Stack, Verified Current Architecture | All Engineers, Tech Leads |
| **[03-target-system-architecture.md](./03-target-system-architecture.md)** | Target Distributed Topology, Tier Separation, Scalable Blueprint | Enterprise Architects, Infrastructure |
| **[04-component-architecture.md](./04-component-architecture.md)** | Client, Edge, API Handler, Domain Service & Persistence Components | Frontend & Backend Engineers |
| **[05-data-flow-and-sequence-diagrams.md](./05-data-flow-and-sequence-diagrams.md)** | Sequence & Data-Flow Diagrams for Payments, Exams, Proctoring, Verification | Backend Developers, Integrators |
| **[06-database-design.md](./06-database-design.md)** | PostgreSQL Schema, ER Diagrams, Constraints, Indexes, RPCs, Scaling | Database Architects, DBAs |
| **[07-api-design.md](./07-api-design.md)** | Complete Inventory of 33 API Endpoints, REST Contracts, Idempotency, Webhooks | Backend Engineers, API Consumers |
| **[08-authentication-and-security.md](./08-authentication-and-security.md)** | HMAC Session Auth, Edge Crypto, Admin RBAC, OWASP Top 10 Protections | Security Engineers, Compliance |
| **[09-infrastructure-and-networking.md](./09-infrastructure-and-networking.md)** | DNS Records, Nginx Reverse Proxy, TLS 1.3, CDN Caching, Latency Mitigation | DevOps, Network Engineers |

### Systems Engineering, Performance & Deep Dives (Modules 10–18)
| Document File | Title & Core Domain | Primary Engineering Audience |
| :--- | :--- | :--- |
| **[10-scaling-and-performance.md](./10-scaling-and-performance.md)** | Capacity Planning (100 to 100k Users), Bottlenecks, Load Balancing | SREs, Performance Engineers |
| **[11-caching-and-storage.md](./11-caching-and-storage.md)** | Multi-tier Caching (Browser, CDN, Redis), Blob Storage (S3/R2) | Backend Engineers, Cloud Architects |
| **[12-distributed-systems.md](./12-distributed-systems.md)** | CAP Theorem, Asynchronous Message Queues (BullMQ), WebSockets vs Polling | Distributed Systems Engineers |
| **[13-reliability-and-observability.md](./13-reliability-and-observability.md)** | Health Probes, Structured Logging, Distributed Tracing, DR & Backups | SREs, DevOps Engineers |
| **[14-system-design-30-concepts.md](./14-system-design-30-concepts.md)** | Rigorous 7-Section Analysis of 30 Core System Design Principles | All System Designers & Interviewers |
| **[15-implementation-playbook.md](./15-implementation-playbook.md)** | 6 Step-by-Step Playbooks (Redis, S3/R2, BullMQ, Nginx, DB Pool, Sentry) | Implementation Leads, DevOps |
| **[16-testing-and-validation.md](./16-testing-and-validation.md)** | Unit, Integration, Load Testing (k6/Locust), Chaos Engineering | QA Engineers, SDETs |
| **[17-rollback-and-recovery.md](./17-rollback-and-recovery.md)** | Zero-Downtime Rollbacks, Database Reversion, Emergency Incident Protocols | On-Call Engineers, Site Leads |
| **[18-architecture-roadmap.md](./18-architecture-roadmap.md)** | Prioritized Engineering Matrix (P0 to P3), Complexity, Dependencies | Engineering Managers, CTOs |

### Stage 2 Validation, Audit & Readiness Suite (Modules 19–22)
| Document File | Title & Core Domain | Primary Engineering Audience |
| :--- | :--- | :--- |
| **[19-architecture-validation.md](./19-architecture-validation.md)** | Source Code Audit of All Architectural Claims, Camera Retirement Analysis | Principal Architects, Tech Leads |
| **[20-security-and-integrity-audit.md](./20-security-and-integrity-audit.md)** | Concurrency Race Conditions, Timer Integrity, IDOR, Hidden Risk Analysis | Security Engineers, DBAs |
| **[21-performance-baseline.md](./21-performance-baseline.md)** | Empirical k6 Load Testing Suite, Non-Fictitious Baseline Framework | Performance Engineers, SREs |
| **[22-final-implementation-plan.md](./22-final-implementation-plan.md)** | Pragmatic Technology Reassessment, Lean Architecture, Phased Action Plan | CTO, Lead Engineers, DevOps |

---

## 3. Master Diagram Index

All architectural diagrams are authored in native **Mermaid** syntax, allowing interactive rendering across GitHub, GitLab, VS Code, and standard Markdown viewers.

| # | Diagram Title | Document Location |
| :---: | :--- | :--- |
| **1** | Current Verified System Architecture | `02-current-system-architecture.md` |
| **2** | Target Distributed System Architecture | `03-target-system-architecture.md` |
| **3** | Client-Server Communication Topology | `09-infrastructure-and-networking.md` |
| **4** | Component Architecture & Layered Boundaries | `04-component-architecture.md` |
| **5** | Relational Database Entity-Relationship Diagram (ERD) | `06-database-design.md` |
| **6** | API Communication & Request Routing Diagram | `05-data-flow-and-sequence-diagrams.md` |
| **7** | Authentication & Session Verification Sequence Diagram | `05-data-flow-and-sequence-diagrams.md` |
| **8** | Data-Flow Diagram (Level 0 Context & Level 1 Decomposition) | `05-data-flow-and-sequence-diagrams.md` |
| **9** | End-to-End HTTP Request Lifecycle Diagram | `05-data-flow-and-sequence-diagrams.md` |
| **10** | DNS Resolution & Reverse Proxy Ingress Architecture | `09-infrastructure-and-networking.md` |
| **11** | Object & Blob Storage Architecture (S3 / Cloudflare R2) | `11-caching-and-storage.md` |
| **12** | Multi-Tier Caching Architecture (Browser, Edge, Redis, DB) | `11-caching-and-storage.md` |
| **13** | Load Balancer & High-Availability Traffic Distribution | `10-scaling-and-performance.md` |
| **14** | Database Primary-Replica Replication Architecture | `12-distributed-systems.md` |
| **15** | Asynchronous Message Queue & Worker Architecture (BullMQ) | `12-distributed-systems.md` |
| **16** | Production Cloud Deployment & Container Pipeline | `03-target-system-architecture.md` |
| **17** | Defense-in-Depth Security & Zero-Trust Architecture | `08-authentication-and-security.md` |

---

## 4. Engineering Role Reading Guides

To maximize actionable value for different team roles, consult the specific documents below:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ROLE-BASED READING PATHS                        │
└────────────────────────────────────────────────────────────────────────┘
  ├── 👑 PRINCIPAL ARCHITECT & CTO
  │    └── Read: README → 01 → 02 → 19 → 20 → 22 → 18
  │
  ├── ⚙️ BACKEND ENGINEER
  │    └── Read: 02 → 04 → 05 → 06 → 07 → 19 → 20 → 22 → 15
  │
  ├── 🗄️ DATABASE ARCHITECT & DBA
  │    └── Read: 02 → 06 → 19 → 20 → 22 (Playbook 4)
  │
  ├── 🚀 DEVOPS, SRE & INFRASTRUCTURE
  │    └── Read: 03 → 09 → 13 → 19 → 21 → 22 → 17
  │
  └── 🛡️ SECURITY & COMPLIANCE OFFICER
       └── Read: 07 → 08 → 19 → 20 → 16
```

---

## 5. Technology Stack Summary (Verified vs Lean Target)

| Architectural Tier | Current Verified Implementation | Lean Target Optimization |
| :--- | :--- | :--- |
| **Client / Presentation** | Next.js 14 App Router (React 18), Tailwind CSS, GSAP 3, Lenis smooth scroll, HTML5 Canvas API | Camera removed; zero camera permission drop-offs; lightweight mobile client |
| **Edge / Ingress** | Next.js Edge Middleware (`verifyAdminSessionTokenEdge`), Vercel Edge Network | Cloudflare CDN/WAF with Anycast Edge Caching |
| **Application Runtime** | Next.js Serverless Node.js Route Handlers (`force-dynamic`, `server-only`) | Next.js Node.js server fleet with in-memory 30s settings cache |
| **Application Services** | `DBService` (monolithic data access), `QuizEngineService`, `PaymentService` | Proctoring functions retired; clean separation of payment and exam services |
| **Authentication** | HMAC-SHA256 stateless session tokens stored in HTTP-only SameSite cookies | Strict production secret enforcement (zero hardcoded fallback secrets) |
| **Database** | Supabase Managed PostgreSQL 15, PL/pgSQL RPCs, Row Level Security (RLS) | Supavisor Connection Pooling (Port 6543, Transaction Mode) + Composite Indexes |
| **Caching** | In-memory singleton Maps (Node.js runtime), 30s site settings cache | In-memory cache handles up to 5,000 users; Redis deferred until > 5k users |
| **File / Media Storage** | Local static filesystem (`/public`), Base64 image strings stored in DB | Static assets served from `/public`; R2 deferred (no webcam images to store) |
| **Payment Gateway** | Razorpay REST API + Webhooks (`x-razorpay-signature` HMAC verification) | Existing idempotent verification engine handles production checkout flawlessly |
| **Observability** | `console.error` logs, Next.js build-time tracing | OpenTelemetry + Structured JSON logging (Pino) + Sentry Free Tier for exceptions |

---

## 6. Implementation Principles & Guardrails

1. **Codebase Truth:** Every claim, code snippet, and configuration in this documentation is anchored in actual verified source code in `src/`, `supabase/`, and root configurations.
2. **Absolute Code Preservation:** No existing UI components, styling, routing, business logic, or database tables are modified during this system design exercise.
3. **Pragmatic Technology Adoption:** Technologies like Redis, BullMQ, Cloudflare R2, and PostgreSQL Read Replicas are not added prematurely; they are scheduled on clear metric-driven scaling triggers.
4. **Actionable Implementation:** Every architectural proposal includes concrete configurations, TypeScript snippets matching the project structure, migration scripts, and rollback plans.

Proceed to **[19-architecture-validation.md](./19-architecture-validation.md)** to inspect the Stage 2 source code claim validation audit.
