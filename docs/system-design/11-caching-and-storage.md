# 11 — Caching Strategies & Cloud Object Storage Architecture

> **Module:** Multi-Tier Caching, Redis Invalidation, S3/R2 Object Storage & Pre-signed URLs  
> **Status:** Production Storage & Caching Blueprint  
> **Target Audience:** Cloud Architects, Performance Engineers, Backend Developers

---

## 1. Multi-Tier Caching Architecture (Diagram 12)

The platform implements a **4-tier caching topology** designed to absorb read spikes and shield the primary database:

```mermaid
graph TD
    subgraph Tier1_Browser ["Tier 1: Client Browser Cache"]
        BrowserCache["Browser Storage & Cache<br/>- Static JS/CSS: Cache-Control: max-age=31536000, immutable<br/>- Exam Answers: LocalStorage Fallback Buffer<br/>- Session Cookie: tkfk26_participant_session"]
    end

    subgraph Tier2_CDN ["Tier 2: Global Edge CDN (Cloudflare)"]
        EdgeCache["Cloudflare Edge Cache<br/>- Next.js Chunks (/_next/static/*)<br/>- Contest Posters (/images/*, /Posters/*)<br/>- Study Module PDF (/PDF/*)<br/>- Public Site Settings: stale-while-revalidate=60"]
    end

    subgraph Tier3_App ["Tier 3: In-Memory Application Cache (Node.js)"]
        MemCache["Node.js Singleton Memory Store<br/>- cachedSiteSettings (TTL: 30s)<br/>- memoryStore Rate Limiting Map"]
    end

    subgraph Tier4_Redis ["Tier 4: Distributed Cache Cluster (Redis)"]
        RedisCache[("Redis 7.x Cluster<br/>- Key: 'site_settings' (TTL: 60s)<br/>- Key: 'questions:master' (TTL: 1 hour)<br/>- Key: 'session:{id}' (Active session cache)<br/>- Key: 'rate:{ip}:{key}' (Sliding window counts)")]
    end

    subgraph Tier5_DB ["Tier 5: Relational Persistence (Supabase PostgreSQL)"]
        PostgresMaster[("PostgreSQL 15 Primary")]
    end

    BrowserCache -->|Cache Miss| EdgeCache
    EdgeCache -->|Cache Miss / Dynamic API| MemCache
    MemCache -->|Cache Miss / Node Reboot| RedisCache
    RedisCache -->|Cache Miss (Cache-Aside)| PostgresMaster
```

---

## 2. Caching Implementation & Invalidation Patterns

### 2.1 The Cache-Aside Pattern (Lazy Loading)
For high-frequency read data (e.g. `site_settings`, `questions`), the application implements the **Cache-Aside** pattern:

```typescript
import { redisClient } from '@/lib/redis';
import { DBService } from '@/services/db';
import { SiteSettings } from '@/types';

const SETTINGS_CACHE_KEY = 'cache:site_settings';
const SETTINGS_TTL_SECONDS = 60;

export async function getCachedSiteSettings(): Promise<SiteSettings> {
  // 1. Attempt retrieval from Redis cache
  try {
    const cached = await redisClient.get(SETTINGS_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached) as SiteSettings;
    }
  } catch (err) {
    console.warn('[REDIS CACHE MISS / UNAVAILABLE] Falling back to database', err);
  }

  // 2. Fetch directly from PostgreSQL primary
  const settings = await DBService.getSiteSettingsFromDB();

  // 3. Asynchronously populate Redis cache with TTL
  try {
    await redisClient.setex(SETTINGS_CACHE_KEY, SETTINGS_TTL_SECONDS, JSON.stringify(settings));
  } catch (err) {
    console.error('[REDIS CACHE WRITE FAILED]', err);
  }

  return settings;
}
```

### 2.2 Cache Invalidation Strategies
1. **Time-To-Live (TTL):** Every cached entry possesses an explicit expiration TTL (e.g., 60 seconds for settings, 3,600 seconds for frozen questions), ensuring eventual consistency even without explicit purge events.
2. **Event-Driven Write-Through Invalidation:** When an administrator updates site settings via `/api/admin/settings`, the controller immediately mutates PostgreSQL and executes:
```typescript
await redisClient.del(SETTINGS_CACHE_KEY);
```
3. **Cache Hit Ratio Testing:**
```bash
# Inspect Redis Cache Hit / Miss Statistics via Redis CLI
redis-cli info stats | grep -E "keyspace_hits|keyspace_misses"
```
* **Production SLA Target:** Cache hit ratio $> 92\%$ on read-heavy operational endpoints.

---

## 3. Object & Blob Storage Architecture (Diagram 11)

In high-concurrency exams, storing Base64 webcam snapshot frames directly inside PostgreSQL rows causes severe database disk bloat and backup degradation. The target architecture routes all media blobs to **Cloudflare R2** (S3-compatible API with zero egress fees).

```mermaid
graph TD
    subgraph Client_App ["Client Browser"]
        QuizClient["Quiz Browser Client<br/>(Captures 120 KB Video Frame)"]
    end

    subgraph App_Server ["Next.js Application Server"]
        PreSignAPI["/api/quiz/proctoring-presign<br/>(Generates S3 Pre-Signed PUT URL)"]
        FrameAPI["/api/quiz/proctoring-frame<br/>(Records URL Metadata Only)"]
    end

    subgraph Object_Store ["Cloudflare R2 Object Storage (S3 API)"]
        R2_Bucket[("R2 Bucket: tkfk-proctoring-frames<br/>- Encrypted at Rest (AES-256)<br/>- Lifecycle Rule: 90-Day Auto Delete<br/>- Zero Egress Fees")]
    end

    subgraph DB_Store ["Supabase PostgreSQL Database"]
        DB_Record[("Table: proctoring_frames<br/>Stores image_url TEXT<br/>(Zero binary bloat)")]
    end

    %% Optimized Pre-signed Direct Upload Flow
    QuizClient -->|1. Request Upload Permit| PreSignAPI
    PreSignAPI -->|2. Return Pre-signed S3 URL (TTL: 60s)| QuizClient
    
    QuizClient -->|3. Direct HTTP PUT Binary (Bypasses Next.js)| R2_Bucket
    R2_Bucket -->>|HTTP 200 OK| QuizClient

    QuizClient -->|4. Post Frame Metadata & R2 Key| FrameAPI
    FrameAPI -->|5. Insert Lightweight Metadata URL| DB_Record
```

---

## 4. Pre-Signed URL Implementation Blueprint

### 4.1 Server Pre-Signed URL Generator (`src/lib/storage.ts`)
```typescript
import 'server-only';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export async function generateProctoringUploadUrl(
  participantId: string,
  sessionId: string
): Promise<{ uploadUrl: string; fileKey: string }> {
  const timestamp = Date.now();
  const fileKey = `proctoring/${sessionId}/${participantId}-${timestamp}.jpg`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME || 'tkfk-proctoring-frames',
    Key: fileKey,
    ContentType: 'image/jpeg',
  });

  // Pre-signed URL valid for strictly 60 seconds
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
  return { uploadUrl, fileKey };
}
```

### 4.2 Architectural Impact of Object Storage
* **Database Size Reduction:** For 5,000 active students uploading 150 frames over 25 minutes ($750,000$ images total):
  - In-Database Base64 Storage: $\approx 100 \text{ GB}$ of database write amplification.
  - Direct R2 Storage: $0 \text{ GB}$ database write amplification (only metadata URLs stored; ~12 MB in PostgreSQL).
* **Network Headroom:** Removes $\approx 90 \text{ GB}$ of binary HTTP transit through Next.js Node.js worker threads.

Proceed to **[12-distributed-systems.md](./12-distributed-systems.md)** for distributed systems architecture, CAP theorem analysis, and message queues.
