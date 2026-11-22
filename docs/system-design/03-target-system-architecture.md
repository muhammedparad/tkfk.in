# 03 — Target System Architecture

> **Module:** Target Distributed Architecture, Tier Separation & Scalability Blueprint  
> **Status:** Proposed Production Architecture (Preserving Existing Application Code & Logic)  
> **Target Audience:** Principal Architects, Cloud Infrastructure Engineers, Lead DevOps

---

## 1. Architectural Vision & Evolution Strategy

The target system architecture evolves the existing Next.js + Supabase application into a **high-concurrency, resilient distributed system** capable of smoothly absorbing statewide traffic spikes (up to 100,000 concurrent users during peak exam or contest events) **without rewriting existing React components, altering UI/UX, or mutating business logic**.

The evolution adheres to the following core tenets:
1. **Preserve Application Logic:** The Next.js 14 App Router and existing service contracts (`PaymentService`, `QuizEngineService`, `DBService`) remain the core domain compute tier.
2. **Decouple Heavy Media & I/O:** Offload webcam proctoring frames and certificate PDFs from the transactional database to cloud object storage (Cloudflare R2 / AWS S3) via asynchronous queues.
3. **Decouple Fast Volatile Reads:** Introduce **Redis** as a distributed caching and rate-limiting tier to absorb repetitive reads (`system_config`, public settings, question banks, participant session verification).
4. **Scale Database Horizontally for Reads:** Separate transactional writes (Primary PostgreSQL) from read-heavy traffic (Read Replicas with PgBouncer/Supavisor connection pooling).
5. **Edge Security & Acceleration:** Front the entire platform with Cloudflare CDN/WAF and a managed Nginx Reverse Proxy cluster with TLS 1.3 termination, Brotli compression, and DDoS mitigation.

---

## 2. Tiered System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TARGET ARCHITECTURAL TIERS                      │
└────────────────────────────────────────────────────────────────────────┘

  [TIER 1: EDGE CDN & PERIMETER DEFENSE]
  Cloudflare Enterprise / Pro CDN + WAF + DDoS Shield + Edge Caching
  ─── Caches static JS/CSS, images, guidelines, and PDF resources
  ─── Blocks malicious bot traffic, layer 7 attacks, and brute force

  [TIER 2: INGRESS & REVERSE PROXY]
  Managed Nginx Cluster / Cloudflare API Gateway
  ─── Terminates TLS 1.3, manages HTTP/2 and HTTP/3 connections
  ─── Strips malicious headers, applies IP rate limits, gzip/brotli

  [TIER 3: COMPUTE APPLICATION CLUSTER]
  Stateless Next.js 14 Pods (Docker / Kubernetes / AWS ECS / Node.js)
  ─── Auto-scaling group (2 to 20 instances based on CPU / memory)
  ─── Server-Side Rendering (RSC) and dynamic JSON API route handlers
  ─── Zero local session state; fully stateless application runtime

  [TIER 4: ASYNCHRONOUS EVENT & WORKER FLEET]
  BullMQ + Node.js Worker Cluster
  ─── Worker Fleet 1: Proctoring Snapshot Ingestion & Storage Uploader
  ─── Worker Fleet 2: Asynchronous Payment Webhook Processing
  ─── Worker Fleet 3: Certificate Batch Generation & Email Dispatch

  [TIER 5: DISTRIBUTED CACHE & VOLATILE DATA]
  Redis Cluster (AWS ElastiCache / Redis Cloud / Upstash)
  ─── Distributed token blacklists and active session cache
  ─── Sub-millisecond distributed sliding window rate limiter
  ─── Cache-aside for site settings, questions bank, and leaderboards

  [TIER 6: PERSISTENCE & OBJECT STORAGE]
  1. PostgreSQL Primary (Supabase Dedicated / AWS RDS): All ACID writes
  2. PostgreSQL Read Replica: Queries for dashboards, verify, stats
  3. Cloudflare R2 / AWS S3: Immutable storage for webcam frames & certs
```

---

## 3. Target System Architecture Diagram (Diagram 2)

```mermaid
graph TD
    subgraph Public_Clients ["Clients & External Consumers"]
        MobileClient["Mobile Web Browsers<br/>(Kerala Participants - 4G/5G)"]
        DesktopClient["Desktop Browsers<br/>(Contestants & Admins)"]
        RazorpayEngine["Razorpay Webhook Servers<br/>(Payment Notifications)"]
    end

    subgraph Tier1_Edge ["Tier 1: Global Edge Network & Security (Cloudflare)"]
        EdgeDNS["Cloudflare Authoritative DNS<br/>(tkfk.in - Anycast DNSSEC)"]
        CloudflareWAF["Cloudflare WAF & DDoS Shield<br/>(Rate Limiting & Bot Management)"]
        EdgeCDN["Edge Cache Server<br/>(Static Assets, Images, Guidelines PDF)"]
    end

    subgraph Tier2_Ingress ["Tier 2: Ingress & Reverse Proxy (Nginx)"]
        NginxLB["Nginx Reverse Proxy & Load Balancer<br/>(TLS 1.3 Termination, Brotli, HTTP/2)"]
    end

    subgraph Tier3_Compute ["Tier 3: Horizontally Scalable Application Tier"]
        NextPod1["Next.js Node Pod 1<br/>(App Router & Route Handlers)"]
        NextPod2["Next.js Node Pod 2<br/>(App Router & Route Handlers)"]
        NextPodN["Next.js Node Pod N<br/>(Auto-Scaled Compute Cluster)"]
    end

    subgraph Tier4_AsyncWorkers ["Tier 4: Asynchronous Processing Fleet (BullMQ Workers)"]
        QueueManager["BullMQ Job Queue Engine<br/>(Redis-Backed Queues)"]
        FrameWorker["Proctoring Frame Ingestion Worker<br/>(Base64 to S3/R2 Converter)"]
        WebhookWorker["Payment Webhook Worker<br/>(Idempotent Activation)"]
        CertWorker["Certificate & Email Worker<br/>(Batch Generation & Mailer)"]
    end

    subgraph Tier5_Cache ["Tier 5: Distributed Caching & Rate Limiting (Redis)"]
        RedisCluster[("Redis Cluster / ElastiCache<br/>- Distributed Rate Limits<br/>- Site Settings Cache (TTL 60s)<br/>- Session Revocation List<br/>- Question Bank Cache")]
    end

    subgraph Tier6_Storage ["Tier 6: Persistence & Storage Tier"]
        subgraph DB_Pool ["Database Connection Pooling (Supavisor / PgBouncer)"]
            PrimaryPool["Primary Pooler (Transaction Mode)"]
            ReplicaPool["Replica Pooler (Session Mode)"]
        end

        subgraph Relational_DB ["PostgreSQL Database Cluster"]
            DB_Primary[("PostgreSQL Primary (RW)<br/>ACID Writes, Registrations,<br/>RPCs, Payments")]
            DB_Replica[("PostgreSQL Read Replica (RO)<br/>Leaderboard, Admin Queries,<br/>Certificate Verifications")]
        end

        subgraph Object_Storage ["Cloud Object Storage (Cloudflare R2 / AWS S3)"]
            S3_Frames[("R2 Bucket: proctoring-frames<br/>(Partitioned by Session ID)")]
            S3_Certs[("R2 Bucket: certificates<br/>(Archival High-Res PDFs & PNGs)")]
        end
    end

    %% Ingress Traffic
    MobileClient --> EdgeDNS
    DesktopClient --> EdgeDNS
    RazorpayEngine --> EdgeDNS
    EdgeDNS --> CloudflareWAF
    CloudflareWAF --> EdgeCDN
    CloudflareWAF -->|Cache Miss & Dynamic APIs| NginxLB

    %% Load Balancing to App Pods
    NginxLB -->|Least Connections| NextPod1
    NginxLB -->|Least Connections| NextPod2
    NginxLB -->|Least Connections| NextPodN

    %% Compute Pod Operations
    NextPod1 <-->|Sub-ms Cache & Limits| RedisCluster
    NextPod2 <-->|Sub-ms Cache & Limits| RedisCluster
    NextPodN <-->|Sub-ms Cache & Limits| RedisCluster

    %% Queue Dispatch
    NextPod1 -->|Enqueue Frame Job| QueueManager
    NextPod1 -->|Enqueue Webhook Job| QueueManager
    NextPod2 -->|Enqueue Frame Job| QueueManager

    %% Worker Execution
    QueueManager --> FrameWorker
    QueueManager --> WebhookWorker
    QueueManager --> CertWorker

    FrameWorker --> S3_Frames
    CertWorker --> S3_Certs
    WebhookWorker --> PrimaryPool

    %% Database Access
    NextPod1 -->|Writes: Orders, Answers| PrimaryPool
    NextPod2 -->|Writes: Orders, Answers| PrimaryPool
    NextPodN -->|Writes: Orders, Answers| PrimaryPool

    NextPod1 -.->|Heavy Reads: Stats, Verify| ReplicaPool
    NextPod2 -.->|Heavy Reads: Stats, Verify| ReplicaPool

    PrimaryPool --> DB_Primary
    ReplicaPool --> DB_Replica
    DB_Primary -->|WAL Streaming Replication| DB_Replica
```

---

## 4. Production Deployment & CI/CD Pipeline (Diagram 16)

```mermaid
graph LR
    subgraph Source_Control ["Source Control & CI/CD"]
        GitRepo["GitHub Repository<br/>(Branch: main)"]
        GHAction["GitHub Actions Pipeline<br/>- TypeScript Check (tsc)<br/>- Next.js Production Build<br/>- Payment Security Tests"]
        DockerBuild["Docker Multi-Stage Build<br/>(Node 20 Alpine Base)"]
        ContainerRegistry["Container Registry<br/>(GitHub Packages / ECR)"]
    end

    subgraph Production_Cluster ["Production Infrastructure (Multi-AZ)"]
        DeployManager["Deployment Orchestrator<br/>(Rolling Zero-Downtime Update)"]
        
        subgraph AZ1 ["Availability Zone A"]
            PodA1["Next.js Container 1"]
            PodA2["Next.js Container 2"]
            WorkerA["BullMQ Worker A"]
        end

        subgraph AZ2 ["Availability Zone B"]
            PodB1["Next.js Container 3"]
            PodB2["Next.js Container 4"]
            WorkerB["BullMQ Worker B"]
        end
    end

    GitRepo -->|Push / Merge| GHAction
    GHAction --> DockerBuild
    DockerBuild --> ContainerRegistry
    ContainerRegistry --> DeployManager
    DeployManager --> AZ1
    DeployManager --> AZ2
```

---

## 5. Architectural Improvements & Business Value

| Target Architecture Component | Operational Problem Solved | Expected Impact & Metric |
| :--- | :--- | :--- |
| **Cloudflare R2 Object Storage** | Eliminates storage of Base64 snapshot images in PostgreSQL. | Reduces DB disk bloat by > 90%; database backups complete 10x faster. |
| **Redis Distributed Cache** | Absorbs high-frequency reads for `system_config` and rate checks. | Reduces DB read load by 85%; eliminates cold-start rate-limit misses. |
| **BullMQ Asynchronous Workers** | Moves proctoring frames and email sending out of the HTTP request lifecycle. | Quiz autosave and frame reporting latency drops from ~350ms to < 45ms. |
| **Read Replica & Pooler** | Prevents long-running admin queries from locking quiz answer writes. | Zero connection starvation during peak concurrent exam submissions. |
| **Nginx Reverse Proxy** | Handles SSL/TLS handshakes, HTTP/2 multiplexing, and compression. | Decreases Node.js CPU usage by ~30%; improves page delivery speeds. |

Proceed to **[04-component-architecture.md](./04-component-architecture.md)** to examine the internal component breakdown and subsystem boundaries.
