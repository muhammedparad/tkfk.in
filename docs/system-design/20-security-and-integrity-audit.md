# 20 — Security, Data Integrity & Hidden Risk Audit

> **Module:** Vulnerability Audit, Race Condition Analysis & Attack Surface Vectors  
> **Status:** Stage 2 Engineering Readiness Audit  
> **Target Audience:** Principal Security Architects, Backend Engineers, Lead DBAs

---

## 1. Executive Summary

This audit evaluates the platform's security posture, data consistency mechanisms, and failure modes under stress. It investigates:
- Concurrency race conditions during simultaneous exam submissions and registrations.
- Payment idempotency and double-spend vectors.
- Single-attempt enforcement and timer manipulation vulnerabilities.
- Data leakage and PII exposure in public endpoints.
- Database connection exhaustion risks.

---

## 2. In-Depth Vulnerability & Risk Matrix

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       SECURITY & INTEGRITY RISK AUDIT                                           │
├─────┬────────────────────────────────┬──────────┬──────────────┬────────────────────────────────────────────────┤
│ ID  │ Risk Area                      │ Severity │ Vulnerable?  │ Detailed Technical Assessment & Evidence       │
├─────┼────────────────────────────────┼──────────┼──────────────┼────────────────────────────────────────────────┤
│ R01 │ Race Condition on Exam Submit  │ **HIGH** │ **SECURED**  │ `submitQuizSession()` enforces atomic update   │
│     │                                │          │              │ `status = 'SUBMITTED' WHERE status =           │
│     │                                │          │              │ 'IN_PROGRESS'`. Prevents duplicate scoring.    │
├─────┼────────────────────────────────┼──────────┼──────────────┼────────────────────────────────────────────────┤
│ R02 │ Duplicate Payment Activation   │ **CRIT** │ **SECURED**  │ Webhooks check `payment_events.provider_event_ │
│     │                                │          │              │ id` UNIQUE constraint before activation.       │
├─────┼────────────────────────────────┼──────────┼──────────────┼────────────────────────────────────────────────┤
│ R03 │ Client-Side Timer Manipulation │ **HIGH** │ **SECURED**  │ Client timer is cosmetic only. Server checks   │
│     │                                │          │              │ `expires_at = started_at + 1500s`. Expired     │
│     │                                │          │              │ sessions reject further answers automatically. │
├─────┼────────────────────────────────┼──────────┼──────────────┼────────────────────────────────────────────────┤
│ R04 │ Multiple Exam Attempts         │ **HIGH** │ **SECURED**  │ `quiz_sessions(participant_id)` UNIQUE         │
│     │                                │          │              │ constraint blocks creating duplicate sessions. │
├─────┼────────────────────────────────┼──────────┼──────────────┼────────────────────────────────────────────────┤
│ R05 │ Concurrent Registrations       │ **MED**  │ **SECURED**  │ Stored procedure `create_participant_with_     │
│     │                                │          │              │ registration` wraps lookup & insert in ACID tx.│
├─────┼────────────────────────────────┼──────────┼──────────────┼────────────────────────────────────────────────┤
│ R06 │ Direct DB Connection Spikes    │ **HIGH** │ **AT RISK**  │ Application currently connects via port 5432   │
│     │                                │          │              │ without pooler; surges could exhaust 60 conns. │
├─────┼────────────────────────────────┼──────────┼──────────────┼────────────────────────────────────────────────┤
│ R07 │ IDOR on Participant Endpoints  │ **HIGH** │ **SECURED**  │ All routes check `session.participantId ===    │
│     │                                │          │              │ targetId`. Returns 403 on mismatch.            │
├─────┼────────────────────────────────┼──────────┼──────────────┼────────────────────────────────────────────────┤
│ R08 │ Certificate Verification PII   │ **HIGH** │ **SECURED**  │ `/api/verify` explicitly strips phone & email, │
│     │ Data Leakage                   │          │              │ returning only name, score, and grade.         │
├─────┼────────────────────────────────┼──────────┼──────────────┼────────────────────────────────────────────────┤
│ R09 │ Fallback Secret Exploitation   │ **MED**  │ **AT RISK**  │ Code contains hardcoded fallback HMAC secrets  │
│     │                                │          │              │ if environment variables are left undefined.   │
├─────┼────────────────────────────────┼──────────┼──────────────┼────────────────────────────────────────────────┤
│ R10 │ Rate Limiting Inconsistency    │ **MED**  │ **AT RISK**  │ In-memory rate limiting map does not sync      │
│     │ Across Instances               │          │              │ across multi-pod or serverless instances.      │
└─────┴────────────────────────────────┴──────────┴──────────────┴────────────────────────────────────────────────┘
```

---

## 3. Detailed Audit Findings & Evidence

### 3.1 Risk R01: Race Conditions During Simultaneous Exam Submissions
- **Attack Scenario:** A contestant clicks "Finish Exam" rapidly or issues parallel `PUT /api/quiz/session` requests to manipulate their score or execution time.
- **Code Audit:** In `src/services/db.ts` (lines 1350–1400):
```typescript
const { data: updatedSession, error: updateErr } = await supabaseAdmin
  .from('quiz_sessions')
  .update({
    status: 'SUBMITTED',
    submitted_at: new Date().toISOString(),
    score: calculatedScore,
    time_taken_seconds: timeTakenSeconds,
  })
  .eq('id', sessionId)
  .eq('status', 'IN_PROGRESS') // Critical atomic guard!
  .select('*')
  .maybeSingle();
```
- **Finding:** The query condition `.eq('status', 'IN_PROGRESS')` ensures that only the first request successfully mutates the session. Any concurrent parallel request matches zero rows and is rejected without recalculating the score. **Verdict: SECURED.**

---

### 3.2 Risk R03: Client-Side Timer Manipulation & Tampering
- **Attack Scenario:** A contestant modifies the client JavaScript timer (`timeLeftSeconds`), pauses DOM timers, or freezes the tab to gain extra answering time.
- **Code Audit:** In `src/services/quizEngine.ts` (lines 43–52) and `src/services/db.ts` (lines 1270–1290):
```typescript
// Server evaluates real server clock against database record
const now = Date.now();
const exp = new Date(existingSession.expires_at).getTime();

if (now > exp) {
  // Session has legally expired according to server UTC clock
  const expiredSession = await DBService.submitQuizSession(existingSession.id);
  return { session: expiredSession, questions: [] };
}
```
- When an answer is submitted via `POST /api/quiz/session`, `DBService.saveAnswer()` re-validates:
```typescript
if (session.status !== 'IN_PROGRESS') {
  return false; // Rejects answer immediately
}
if (Date.now() > new Date(session.expires_at).getTime()) {
  await this.submitQuizSession(sessionId);
  return false; // Automatically expires session and locks answers
}
```
- **Finding:** Client-side timer state is treated as zero-trust presentation data. The server unconditionally enforces expiration using the absolute `expires_at` timestamp. **Verdict: SECURED.**

---

### 3.3 Risk R06: Direct Database Connection Exhaustion (Port 5432)
- **Vulnerability:**
  - The repository's `.env.example` and current connection patterns utilize the standard PostgreSQL direct connection string on port `5432`.
  - In Supabase, direct connections are constrained by the physical RAM of the database instance (typically 60 connections on Small/Medium instances).
  - During the contest opening window (e.g. 3:00 PM), hundreds of participants entering the quiz simultaneously will exhaust available connection slots, resulting in:
    `FATAL: remaining connection slots are reserved for non-replication superuser connections`
- **Mitigation:** Switch connection string to Supabase's transaction pooler (**Supavisor**) on port `6543` with `?pgbouncer=true`. **Verdict: IMMEDIATE ACTION REQUIRED (P0).**

---

### 3.4 Risk R09: Hardcoded Fallback Secrets
- **Vulnerability:**
  - In `src/lib/adminAuth.ts` (lines 15–17) and `src/lib/participantAuth.ts` (lines 13–15):
```typescript
if (!secret) {
  return 'tkfk26_admin_hmac_secret_fallback_9981';
}
```
  - If a production environment is deployed with a missing or empty `ADMIN_SESSION_SECRET` or `PARTICIPANT_SESSION_SECRET`, the application silently defaults to public fallback strings committed to git history, allowing attackers to forge valid administrator session cookies.
- **Mitigation:** Remove hardcoded fallback strings. Throw a fatal startup error if session secrets are missing when `NODE_ENV === 'production'`. **Verdict: IMMEDIATE ACTION REQUIRED (P0).**

---

### 3.5 Risk R10: Rate Limiting Map Desynchronization
- **Vulnerability:**
  - `src/lib/rateLimit.ts` relies primarily on an in-memory `Map<string, RateLimitEntry>`:
```typescript
const memoryStore = new Map<string, RateLimitEntry>();
```
  - When the Next.js application is deployed across multiple container pods, serverless lambdas, or auto-scaled nodes, each instance maintains an isolated memory store.
  - A brute-force attacker can rotate requests across pods, effectively multiplying their allowed request quota by the number of running instances.
- **Mitigation:** Route distributed rate limiting through Redis using an atomic sliding-window script. **Verdict: NEAR-TERM ACTION REQUIRED (P1).**

Proceed to **[21-performance-baseline.md](./21-performance-baseline.md)** for load testing blueprints and performance metrics.
