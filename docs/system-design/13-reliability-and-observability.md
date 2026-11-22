# 13 — Reliability, Fault Tolerance & Observability Architecture

> **Module:** Health Probes, Structured Logging, Distributed Tracing, DR & Circuit Breakers  
> **Status:** Production SRE & Resilience Blueprint  
> **Target Audience:** Site Reliability Engineers (SREs), DevOps Leads, System Architects

---

## 1. Observability Framework: The Three Pillars

A high-concurrency examination and payment platform requires deep visibility into request execution times, database saturation, and edge errors.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        OBSERVABILITY ARCHITECTURE                      │
├─────────────────────┬───────────────────┬──────────────────────────────┤
│ Pillar              │ Implementation    │ Core Metrics & Outputs       │
├─────────────────────┼───────────────────┼──────────────────────────────┤
│ 1. Structured Logs  │ Pino (JSON)       │ Level, Correlation ID, IP,   │
│                     │                   │ Duration, Route, Status      │
├─────────────────────┼───────────────────┼──────────────────────────────┤
│ 2. Metrics & Alerts │ Prometheus /      │ P95 Latency, Error Rate (5xx)│
│                     │ Grafana Dashboard │ Active DB Pool Connections   │
├─────────────────────┼───────────────────┼──────────────────────────────┤
│ 3. Error Tracking   │ Sentry Node SDK   │ Stack traces, Context, PII   │
│                     │                   │ scrubbing, Release tagging   │
└─────────────────────┴───────────────────┴──────────────────────────────┘
```

### 1.1 Standardized Structured Log Format
All log output across route handlers and services must emit single-line machine-parsable JSON:
```json
{
  "timestamp": "2026-10-30T15:02:14.102Z",
  "level": "info",
  "correlation_id": "req_8f12938a-1029-4b12",
  "method": "POST",
  "path": "/api/quiz/session",
  "status": 200,
  "duration_ms": 14.2,
  "participant_id": "TKFK26-729150",
  "ip": "49.37.112.5",
  "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4)...",
  "action": "AUTOSAVE_ANSWER",
  "metadata": {
    "question_id": "00000000-0000-0000-0000-000000000014",
    "selected_option": "B"
  }
}
```

---

## 2. Health Check Subsystem Architecture

To support zero-downtime rolling deployments and load balancer routing, the platform provides **shallow** and **deep** health probes:

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { redisClient } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const startTime = Date.now();
  const checks: Record<string, { status: string; latency_ms?: number; error?: string }> = {};

  // 1. Database Health Check (Primary PostgreSQL)
  try {
    const dbStart = Date.now();
    const { error } = await supabaseAdmin.from('system_config').select('key').limit(1);
    if (error) throw error;
    checks.database = { status: 'healthy', latency_ms: Date.now() - dbStart };
  } catch (err: any) {
    checks.database = { status: 'unhealthy', error: err.message };
  }

  // 2. Redis Health Check
  try {
    const redisStart = Date.now();
    const ping = await redisClient.ping();
    if (ping !== 'PONG') throw new Error('Invalid PING response');
    checks.redis = { status: 'healthy', latency_ms: Date.now() - redisStart };
  } catch (err: any) {
    checks.redis = { status: 'degraded', error: err.message };
  }

  const isHealthy = checks.database.status === 'healthy';
  const totalLatency = Date.now() - startTime;

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      duration_ms: totalLatency,
      checks,
    },
    { status: isHealthy ? 200 : 503 }
  );
}
```

* **Shallow Probe (`GET /api/site-settings`):** Evaluates whether the Node.js event loop is responsive. Used by Nginx for high-frequency (every 5 seconds) routing decisions.
* **Deep Probe (`GET /api/health`):** Evaluates database connectivity, pool saturation, and Redis responsiveness. Used by Kubernetes / ECS container liveness probes.

---

## 3. Disaster Recovery & Backup Plan

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DISASTER RECOVERY TARGETS                       │
├────────────────────────────────┬───────────────────────────────────────┤
│ Recovery Time Objective (RTO)  │ < 15 Minutes                          │
│ Recovery Point Objective (RPO) │ < 5 Minutes                           │
└────────────────────────────────┴───────────────────────────────────────┘
```

### 3.1 PostgreSQL Backup Strategy
1. **Continuous WAL Archiving (Point-in-Time Recovery):** Write-Ahead Logs are continuously streamed to encrypted cloud storage, allowing the database to be restored to any exact second within the last 30 days.
2. **Daily Logical Snapshots (`pg_dump`):** Automated cron execution creates encrypted, compressed `.sql.gz` dumps stored across multiple cloud regions.
3. **Pre-Contest Frozen Snapshot:** Exactly 1 hour before an exam window commences, an immediate immutable disk snapshot is captured.

### 3.2 Multi-AZ Failover Sequence
```
[Primary Node Failure Detected (AZ-A)]
         │
         ├── Automatic Health Probe Failure (3 consecutive 503s)
         ▼
[Promote Standby Read Replica to Primary Master (AZ-B)]
         │
         ├── Update Database Connection DNS / Pooler Endpoints
         ▼
[Nginx / Compute Reconnection via Keepalive Reset]
         │
         └── Complete Recovery Achieved in < 180 Seconds
```

---

## 4. Graceful Degradation & Circuit Breaking

When downstream systems experience transient degradation, the application employs **circuit breakers** and **graceful degradation** to protect the participant experience:

```
┌────────────────────────────────────────────────────────────────────────┐
│                     GRACEFUL DEGRADATION MATRIX                        │
├─────────────────────┬──────────────────┬───────────────────────────────┤
│ Failure Scenario    │ Trigger          │ Degraded Fallback Behavior    │
├─────────────────────┼──────────────────┼───────────────────────────────┤
│ Redis Cache Outage  │ Redis connection │ System bypasses Redis and     │
│                     │ timeout (>150ms) │ queries PostgreSQL directly;  │
│                     │                  │ in-memory rate limiting active│
├─────────────────────┼──────────────────┼───────────────────────────────┤
│ Razorpay API Outage │ HTTP 503 / 504   │ Payment page displays alert;  │
│                     │ from Razorpay    │ offers manual offline UPI QR  │
│                     │                  │ with manual admin review path │
├─────────────────────┼──────────────────┼───────────────────────────────┤
│ Proctoring Telemetry│ Frame upload     │ Quiz exam continues unabated; │
│ High Latency        │ failure          │ client buffers frame locally; │
│                     │                  │ no disruption to student timer│
├─────────────────────┼──────────────────┼───────────────────────────────┤
│ Emergency Contest   │ Admin toggle via │ /quiz and /register display   │
│ Maintenance         │ system_config    │ branded maintenance message;  │
│                     │                  │ active answers remain safe    │
└─────────────────────┴──────────────────┴───────────────────────────────┘
```

Proceed to **[14-system-design-30-concepts.md](./14-system-design-30-concepts.md)** for the comprehensive, deep-dive evaluation of all 30 system design concepts.
