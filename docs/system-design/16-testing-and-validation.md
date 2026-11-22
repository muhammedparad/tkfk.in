# 16 — Testing, Load Simulation & Chaos Engineering Framework

> **Module:** Verification Protocols, k6 Load Tests, Chaos Injection & Security Audits  
> **Status:** Production Testing Specifications  
> **Target Audience:** QA Engineers, SDETs, Security Testers, SREs

---

## 1. Multi-Tier Testing Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TESTING PYRAMID & RIGOR                         │
├─────────────────────┬───────────────────┬──────────────────────────────┤
│ Tier                │ Tools             │ Target Coverage              │
├─────────────────────┼───────────────────┼──────────────────────────────┤
│ Unit Tests          │ Vitest / Jest     │ Utility functions, hashing,  │
│                     │                   │ phone normalizer, token auth │
├─────────────────────┼───────────────────┼──────────────────────────────┤
│ Integration Tests   │ Node.js scripts / │ Payment webhook HMAC, RPCs,  │
│                     │ Supertest         │ session lifecycle, grading   │
├─────────────────────┼───────────────────┼──────────────────────────────┤
│ Load & Stress Tests │ k6 / Locust       │ 100 to 100,000 concurrent    │
│                     │                   │ participants, autosave lag   │
├─────────────────────┼───────────────────┼──────────────────────────────┤
│ Chaos Engineering   │ Toxiproxy / Chaos │ DB disconnect, Redis loss,   │
│                     │ Toolkit           │ Razorpay 503 gateway outage  │
├─────────────────────┼───────────────────┼──────────────────────────────┤
│ Security Audits     │ OWASP ZAP,        │ SQLi, IDOR, XSS, CSRF,       │
│                     │ testssl.sh        │ timing attacks, secret leaks │
└─────────────────────┴───────────────────┴──────────────────────────────┘
```

---

## 2. Integration Testing: Payment Webhook & Idempotency

The repository includes a dedicated security integration test in `scripts/test-payment-security.js`. The test validates:
1. Missing signatures are rejected with HTTP 400.
2. Tampered payloads are rejected with HTTP 400.
3. Valid signatures are accepted and recorded.
4. Duplicate event IDs return HTTP 200 with idempotent acknowledgement.
5. Amount mismatches trigger `MANUAL_REVIEW`.

### Execution Command:
```bash
node scripts/test-payment-security.js
```

---

## 3. Load & Concurrency Testing Blueprint (k6 Script)

The script below simulates the active examination surge, modeling 1,000 to 10,000 concurrent students loading the exam, answering questions every 30 seconds, and posting webcam frames:

```javascript
// load-tests/quiz-concurrency.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 500 },   // Warm-up ramp to 500 users
    { duration: '5m', target: 2000 },  // Surge to 2,000 concurrent users
    { duration: '10m', target: 5000 }, // Peak competition load (5,000 users)
    { duration: '3m', target: 0 },     // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<250'],  // 95% of requests must complete under 250ms
    http_req_failed: ['rate<0.01'],    // Error rate must be under 1%
  },
};

const BASE_URL = 'https://staging.tkfk.in';

export default function () {
  const participantId = `TKFK26-${100000 + __VU}`;
  const sessionId = `sess-${participantId}`;

  // 1. Participant requests active session & questions
  const sessionRes = http.get(`${BASE_URL}/api/quiz/session?checkOnly=false`, {
    headers: { 'Cookie': `tkfk26_participant_session=mock_token_${__VU}` },
  });

  check(sessionRes, {
    'session loaded (200)': (r) => r.status === 200,
    'questions array present': (r) => r.json('questions') !== undefined,
  });

  sleep(2);

  // 2. Simulate 5 random question answer autosaves
  for (let q = 1; q <= 5; q++) {
    const payload = JSON.stringify({
      sessionId: sessionId,
      questionId: `00000000-0000-0000-0000-${String(q).padStart(12, '0')}`,
      selectedOption: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
    });

    const saveRes = http.post(`${BASE_URL}/api/quiz/session`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `tkfk26_participant_session=mock_token_${__VU}`,
      },
    });

    check(saveRes, { 'autosave success': (r) => r.status === 200 });
    sleep(15 + Math.random() * 15); // Wait 15-30s before next answer
  }

  // 3. Final submission
  const submitRes = http.put(`${BASE_URL}/api/quiz/session`, JSON.stringify({ sessionId }), {
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `tkfk26_participant_session=mock_token_${__VU}`,
    },
  });

  check(submitRes, { 'session submitted': (r) => r.status === 200 });
}
```

### Execution Command:
```bash
k6 run --vus 1000 --duration 10m load-tests/quiz-concurrency.js
```

---

## 4. Chaos Engineering & Fault Injection

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CHAOS EXPERIMENTS SUITE                         │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ Failure Injected  │ Expected Impact   │ Pass Criteria                  │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ Primary DB Link   │ DB unreachable    │ Health check returns 503;      │
│ Severed (30s)     │ for 30 seconds    │ client retries autosave via    │
│                   │                   │ LocalStorage; zero data loss   │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ Redis Cache Kill  │ Redis cluster     │ System falls back to in-memory │
│                   │ offline           │ rate limiter & direct DB query;│
│                   │                   │ p95 latency rises, no 500s     │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ Razorpay Webhook  │ Razorpay server   │ Webhook buffer queue stores    │
│ Network Drop      │ disconnected      │ events; retries upon reconnect;│
│                   │                   │ zero lost registrations        │
└───────────────────┴───────────────────┴───────────────────────────────┘
```

---

## 5. Security Penetration Testing & Vulnerability Checklist

1. **SQL Injection Audit:**
```bash
sqlmap -u "https://tkfk.in/verify/TKFK26-C-12345" --batch --random-agent --level=3
# Expected: All parameters determined to be not injectable.
```

2. **Insecure Direct Object Reference (IDOR) Test:**
   - Log in as Participant A (`TKFK26-111111`).
   - Attempt to post autosaves or proctoring frames targeting Session B (`sess-TKFK26-222222`).
   - **Expected:** HTTP 403 Forbidden.

3. **Rate Limiting Flood Test:**
```bash
ab -n 100 -c 10 https://tkfk.in/api/quiz/login
# Expected: > 80 requests receive HTTP 429 Too Many Requests.
```

Proceed to **[17-rollback-and-recovery.md](./17-rollback-and-recovery.md)** for rollback procedures, database reversion, and emergency incident protocols.
