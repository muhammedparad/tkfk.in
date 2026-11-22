# 21 — Performance Baseline & Load Testing Blueprint

> **Module:** Empirical Performance Baseline & k6 Load Testing Specifications  
> **Status:** Stage 2 Engineering Readiness Audit  
> **Target Audience:** SREs, Performance Engineers, Lead Developers

---

## 1. Principles of Empirical Performance Testing

In strict adherence to engineering integrity:
> **Do not invent performance figures or benchmark metrics without testing.**

Performance results depend heavily on serverless cold starts, database instance tier, geography, and network connectivity. This document establishes the **standardized load-testing suite** and measurable SLA criteria that must be executed against the staging/pre-production environment to establish the empirical baseline.

---

## 2. Target Performance Metrics & SLA Thresholds

```
┌────────────────────────────────────────────────────────────────────────┐
│                      SLA PERFORMANCE THRESHOLDS                        │
├─────────────────────────┬──────────────┬──────────────┬────────────────┤
│ Operation               │ Target p50   │ Target p95   │ Target p99     │
├─────────────────────────┼──────────────┼──────────────┼────────────────┤
│ Landing Page Fetch (SSR)│ < 150 ms     │ < 300 ms     │ < 500 ms       │
│ Participant Login       │ < 100 ms     │ < 200 ms     │ < 350 ms       │
│ Quiz Entry & Session Gen│ < 120 ms     │ < 250 ms     │ < 450 ms       │
│ Answer Autosave (POST)  │ < 40 ms      │ < 100 ms     │ < 200 ms       │
│ Final Quiz Submit (PUT) │ < 150 ms     │ < 350 ms     │ < 600 ms       │
│ Public Verify Query     │ < 50 ms      │ < 120 ms     │ < 250 ms       │
│ Webhook Ingestion       │ < 30 ms      │ < 80 ms      │ < 150 ms       │
└─────────────────────────┴──────────────┴──────────────┴────────────────┤
│ Error Rate Ceiling (5xx)│ < 0.1%       │ < 0.5%       │ < 1.0%         │
│ Database CPU Ceiling    │ < 60%        │ < 80%        │ < 90% (Peak)   │
└─────────────────────────┴──────────────┴──────────────┴────────────────┘
```

---

## 3. Comprehensive k6 Load Testing Suite

The following automated test suite models the complete participant lifecycle under varying concurrency stages:

```javascript
// load-tests/tkfk-contest-lifecycle.js
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom Empirical Metrics
const autosaveDuration = new Trend('autosave_duration_ms');
const submitDuration = new Trend('submit_duration_ms');
const errorRate = new Rate('system_errors');
const successfulQuizzes = new Counter('successful_quizzes');

export const options = {
  scenarios: {
    // Scenario 1: Contest Window Surge (Ramps to 1,500 active contestants)
    contest_surge: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 200 },   // Initial early entrants
        { duration: '3m', target: 1000 },  // Peak 3:00 PM contest opening
        { duration: '5m', target: 1500 },  // Sustained answering load
        { duration: '2m', target: 500 },   // Submissions underway
        { duration: '1m', target: 0 },     // Wind-down
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    'autosave_duration_ms': ['p(95)<100'],
    'submit_duration_ms': ['p(95)<350'],
    'system_errors': ['rate<0.01'], // Less than 1% errors allowed
  },
};

const BASE_URL = __ENV.TARGET_URL || 'https://staging.tkfk.in';

export default function () {
  const vuId = __VU;
  const iteration = __ITER;
  const participantPublicId = `TKFK26-${String(100000 + vuId).padStart(6, '0')}`;
  const phone = '9876543210';
  let sessionCookie = '';
  let activeSessionId = '';
  let questionIds = [];

  // STEP 1: Participant Login
  group('01_Login', function () {
    const loginPayload = JSON.stringify({
      participantId: participantPublicId,
      phone: phone,
    });

    const res = http.post(`${BASE_URL}/api/quiz/login`, loginPayload, {
      headers: { 'Content-Type': 'application/json' },
    });

    const success = check(res, {
      'login 200': (r) => r.status === 200,
    });

    if (!success) {
      errorRate.add(1);
      return;
    }

    // Extract HTTP-only session cookie
    const cookies = res.cookies;
    if (cookies && cookies['tkfk26_participant_session']) {
      sessionCookie = cookies['tkfk26_participant_session'][0].value;
    }
  });

  if (!sessionCookie) return;
  sleep(1);

  // STEP 2: Exam Entry & Question Retrieval
  group('02_Enter_Quiz', function () {
    const res = http.get(`${BASE_URL}/api/quiz/session`, {
      headers: {
        'Cookie': `tkfk26_participant_session=${sessionCookie}`,
      },
    });

    const success = check(res, {
      'session 200': (r) => r.status === 200,
      'has session id': (r) => r.json('session.id') !== undefined,
      'has 50 questions': (r) => r.json('questions') && r.json('questions').length === 50,
    });

    if (success) {
      activeSessionId = res.json('session.id');
      const questions = res.json('questions');
      questionIds = questions.map((q) => q.id);
    } else {
      errorRate.add(1);
    }
  });

  if (!activeSessionId || questionIds.length === 0) return;
  sleep(2);

  // STEP 3: Answering 10 Sample Questions (Autosave Cycle)
  group('03_Autosave_Answers', function () {
    for (let i = 0; i < 10; i++) {
      const qId = questionIds[i];
      const selectedOpt = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];

      const savePayload = JSON.stringify({
        sessionId: activeSessionId,
        questionId: qId,
        selectedOption: selectedOpt,
      });

      const start = Date.now();
      const res = http.post(`${BASE_URL}/api/quiz/session`, savePayload, {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `tkfk26_participant_session=${sessionCookie}`,
        },
      });
      autosaveDuration.add(Date.now() - start);

      check(res, {
        'autosave 200': (r) => r.status === 200,
      });

      // Realistic interval between answers (15-25 seconds)
      sleep(1.5); // Accelerated for benchmark run
    }
  });

  // STEP 4: Final Exam Submission & Scoring
  group('04_Submit_Quiz', function () {
    const submitPayload = JSON.stringify({
      sessionId: activeSessionId,
    });

    const start = Date.now();
    const res = http.put(`${BASE_URL}/api/quiz/session`, submitPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `tkfk26_participant_session=${sessionCookie}`,
      },
    });
    submitDuration.add(Date.now() - start);

    const success = check(res, {
      'submit 200': (r) => r.status === 200,
      'status is SUBMITTED': (r) => r.json('session.status') === 'SUBMITTED',
      'score is numeric': (r) => typeof r.json('session.score') === 'number',
    });

    if (success) {
      successfulQuizzes.add(1);
    } else {
      errorRate.add(1);
    }
  });
}
```

---

## 4. Execution & Baselining Instructions

To establish the empirical baseline before making any architectural changes:

1. **Deploy Staging Build:** Deploy current git `main` to the staging environment.
2. **Execute Staging Load Test:**
```bash
# Run 100 concurrent users for 5 minutes
k6 run --env TARGET_URL=https://staging.tkfk.in --vus 100 --duration 5m load-tests/tkfk-contest-lifecycle.js

# Run 1,000 concurrent users surge test
k6 run --env TARGET_URL=https://staging.tkfk.in load-tests/tkfk-contest-lifecycle.js
```
3. **Capture Telemetry Metrics:**
   - In Supabase Dashboard: Note peak active connections and CPU %.
   - In k6 output: Record actual `p50`, `p95`, `p99` latencies.
   - Archive the generated JSON report as `baseline-report.json`.

Proceed to **[22-final-implementation-plan.md](./22-final-implementation-plan.md)** for the actionable, phased engineering execution plan.
