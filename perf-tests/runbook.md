# Performance Testing Runbook — NCD Web Application

**Target URL:** `https://ncd.web.id`  
**Host Architecture:** Vercel Edge (Frontend Vite SPA) + Go Chi Backend + Supabase PostgreSQL  
**Primary Test Objective:** Evaluate system performance under 50–70 concurrent users (VUs) within a 1-minute ramp/sustain window.  
**Execution Environment:** Local execution with Load Generator (LG) Monitor Sidecar  

---

## 1. Workflows Defined

### Workflow 1: Public Visitor (`w1-public-visitor`) — ~80% Traffic
- **Description:** Anonymous visitor exploring public pages and fetching public REST APIs.
- **Endpoints Visited:**
  - `GET /` (Landing Page & stats)
  - `GET /api/v1/public/stats`
  - `GET /api/v1/public/members`
  - `GET /api/v1/public/projects`
  - `GET /api/v1/public/achievements`
  - `GET /api/v1/public/posts`
- **Auth Required:** No.
- **Nature:** Read-only, highly cacheable edge traffic.

### Workflow 2: Member Portal Session (`w2-member-portal`) — ~15% Traffic
- **Description:** Registered member logging in with access token and interacting with the member portal.
- **Endpoints Visited:**
  - `POST /api/v1/auth/login` (Token exchange)
  - `GET /api/v1/auth/me`
  - `GET /api/v1/member/profile`
  - `GET /api/v1/portal/tokens/my-token`
- **Auth Required:** Yes (Access Token `NCD-FAUZAN` or test member token).
- **Nature:** Read-mostly authenticated traffic with JWT verification.

### Workflow 3: Recruitment Application (`w3-recruitment-apply`) — ~5% Traffic
- **Description:** Prospective member reviewing the join page and submitting an application.
- **Endpoints Visited:**
  - `GET /join`
  - `POST /api/v1/public/apply` (with synthetic test data `perf-test-vu-*@ncd.dev`)
- **Auth Required:** No.
- **Nature:** Write transaction triggering validation, Supabase insert, and notification pipeline.

---

## 2. Test Credentials & Test Data Strategy
- **Member Access Token:** Dedicated test member key or non-destructive member token.
- **Synthetic Application Flag:** Applications submitted during performance tests use `email: "perf-test-vu-<id>@ncd.dev"` and `full_name: "K6 Perf Bot <id>"`.
- **Destructive Actions to Avoid:** Void/deletion endpoints are excluded from the automated load runner.

---

## 3. SLOs and Threshold Targets
- **Global Error Rate:** `http_req_failed: ['rate<0.02']` (Under 2% failures).
- **Public API Latency:** `http_req_duration{name:PublicStats}: ['p(95)<400']`.
- **Portal Authenticated Latency:** `http_req_duration{name:AuthMe}: ['p(95)<600']`.
- **Overall Response Time:** `p(95) < 800ms`, `p(99) < 2000ms`.
- **Load Generator Health:** Laptop CPU idle ≥ 30% throughout the 1-minute test.

---

## 4. Execution Plan
- **Ramping Profile (1 Minute):**
  - 0s - 15s: Ramp up from 0 to 50 VUs
  - 15s - 45s: Sustain 50 to 70 VUs
  - 45s - 60s: Ramp down from 70 to 0 VUs
- **Workload Distribution:**
  - Protocol Scenario drives the 50-70 VUs across the 3 workflows.
  - Browser VU (1 VU) records browser rendering and Web Vitals under load.
- **Sidecar Monitor:** `tools/lg-monitor.sh` runs simultaneously to verify the test machine is not saturating.
