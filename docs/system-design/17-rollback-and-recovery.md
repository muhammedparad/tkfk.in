# 17 — Rollback Protocols, Emergency Incidents & Disaster Recovery

> **Module:** Zero-Downtime Rollbacks, Database Reversion & Incident Runbooks  
> **Status:** Production Emergency Operations Manual  
> **Target Audience:** Incident Commanders, On-Call SREs, Lead System Engineers

---

## 1. Zero-Downtime Deployment & Rollback Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BLUE-GREEN ROLLBACK TOPOLOGY                    │
└────────────────────────────────────────────────────────────────────────┘

                 [Nginx Reverse Proxy / Cloudflare Ingress]
                                     │
                    ┌────────────────┴────────────────┐
                    │ (Active Traffic)                │ (Standby / Testing)
                    ▼                                 ▼
         [BLUE POOL: v1.0.4]                [GREEN POOL: v1.0.5]
         (Stable Production)                (New Deployment)
```

### 1.1 Fast Instant Traffic Reversion
If an application error rate (5xx) exceeds $1\%$ or p95 latency spikes above 500 ms following a release, Nginx shifts traffic back to the Blue container pool in `< 2 seconds`:

```bash
# Emergency Traffic Switch to Blue Pool via Nginx
sed -i 's/server green_upstream/server blue_upstream/' /etc/nginx/conf.d/tkfk.conf
nginx -s reload
```

---

## 2. Database Migration Rollback & Expand-Contract Pattern

Directly executing breaking schema migrations (such as dropping or renaming columns) breaks running application pods. The platform strictly enforces the **Expand-and-Contract (Parallel Run) Pattern**:

```
[Phase 1: Expand]
Add new nullable column / new table alongside old.
Application code writes to both old and new columns.
                  │
                  ▼
[Phase 2: Transition]
Backfill historical data asynchronously.
Application code reads from new column; writes to both.
                  │
                  ▼
[Phase 3: Contract]
Application code reads and writes exclusively to new column.
Safely drop old column in a planned maintenance window.
```

### Reversible Migration Example
```sql
-- Migration: 20261101_add_image_key_expand.sql
-- Step 1 (UP): Add nullable column
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS image_key TEXT;

-- Step 1 (DOWN / ROLLBACK): Safe rollback script
-- Revert without data loss
ALTER TABLE public.audit_logs DROP COLUMN IF EXISTS image_key;
```

---

## 3. Emergency Incident Runbooks

### Runbook 1: Razorpay Payment Gateway Outage
* **Symptoms:** Razorpay API returns HTTP 500/503 during `/api/payment/create-order` or webhook deliveries halt.
* **Actions:**
  1. Inspect Razorpay Status Dashboard (`status.razorpay.com`).
  2. Activate dynamic maintenance alert via database or Admin Console:
```sql
UPDATE public.system_config 
SET value = jsonb_set(value, '{registration_closed_message}', '"Online payment is undergoing scheduled maintenance by our banking partner. Registration will resume shortly."'::jsonb)
WHERE key = 'site_settings';
```
  3. All pending registrations remain safe in `registrations` with status `PENDING`. No student data is lost.
  4. Once Razorpay recovers, webhooks deliver automatically via Razorpay's 24-hour retry schedule.

---

### Runbook 2: Exam Entry Stampede (Database Connection Starvation)
* **Symptoms:** At 3:00 PM contest opening, `/api/quiz/session` latency spikes to 5,000 ms; PostgreSQL logs show `FATAL: remaining connection slots are reserved for non-replication superuser connections`.
* **Actions:**
  1. Direct all application traffic to the **Supavisor connection pooler** in `Transaction Mode` (Port 6543):
```env
DATABASE_URL=postgres://...:6543/postgres?pgbouncer=true
```
  2. Terminate idle idle-in-transaction connections immediately:
```sql
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle in transaction' AND state_change < current_timestamp - INTERVAL '15 seconds';
```
  3. Enable Redis caching for frozen question retrieval to drop read load on PostgreSQL by 95%.

---

### Runbook 3: Browser Crash / Electrical Outage Requiring Single-Student Reset
* **Symptoms:** A verified student experiences an operating system crash or electrical cut mid-exam, leaving their session locked as `SUBMITTED` or `EXPIRED`.
* **Actions:**
  1. The administrator navigates to `/admin/participants` or executes the atomic retry grant RPC:
```sql
-- Grant single retry securely via verified administrative script
UPDATE public.quiz_sessions 
SET status = 'IN_PROGRESS', 
    expires_at = NOW() + INTERVAL '25 minutes',
    submitted_at = NULL,
    score = 0
WHERE participant_id = (SELECT id FROM public.participants WHERE participant_id = 'TKFK26-729150');

-- Log action in audit trail
INSERT INTO public.audit_logs (admin_user_id, action, entity_type, entity_id, metadata)
VALUES ('ADMIN-SUPER', 'GRANT_RETRY', 'quiz_session', 'TKFK26-729150', '{"reason": "Power cut verified by coordinator"}'::jsonb);
```
  2. The student re-enters `/quiz` and resumes with a full 25-minute timer and clean attempt.

---

### Runbook 4: Question Key Error Discrepancy Requiring Score Recalculation
* **Symptoms:** After the competition, the review board identifies that Question #18 had an incorrect option marked as correct in the question bank.
* **Actions:**
  1. Correct the official key in `public.questions`:
```sql
UPDATE public.questions SET correct_option = 'C' WHERE id = '00000000-0000-0000-0000-000000000018';
UPDATE public.quiz_session_questions SET correct_option = 'C' WHERE question_id = '00000000-0000-0000-0000-000000000018';
```
  2. Execute the existing server-side score recalculation script:
```bash
node scripts/calculate_all_scores_and_rankings.js
```
  3. The script re-evaluates all submitted answers against the corrected key, updates `quiz_sessions.score`, and regenerates rankings atomically without manual data edits.

---

### Runbook 5: Malicious DDoS or Credential Stuffing Attack
* **Symptoms:** Sudden burst of 50,000 req/sec targeting `/api/quiz/login` or `/api/register`.
* **Actions:**
  1. In Cloudflare Dashboard, activate **"Under Attack Mode"** (enforces JavaScript challenge to all incoming web traffic).
  2. Enable Cloudflare Rate Limiting Rule: Block any IP exceeding 30 requests / 10 seconds targeting `/api/*`.
  3. Confirm origin Nginx drop rate via access log inspection:
```bash
tail -f /var/log/nginx/access.log | grep " 429 "
```

Proceed to **[18-architecture-roadmap.md](./18-architecture-roadmap.md)** for prioritized recommendations and the engineering evolution timeline.
