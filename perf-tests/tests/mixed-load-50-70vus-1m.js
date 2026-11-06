import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { browser } from 'k6/browser';
import { Rate, Trend } from 'k6/metrics';

// --- Custom metrics -------------------------------------------------------------
const publicVisitorSuccess = new Rate('public_visitor_success');
const memberPortalSuccess = new Rate('member_portal_success');
const applySuccess = new Rate('apply_success');

const publicLatency = new Trend('public_visitor_latency', true);
const memberLatency = new Trend('member_portal_latency', true);
const applyLatency = new Trend('apply_latency', true);

// --- Configuration --------------------------------------------------------------
const BASE_URL = __ENV.BASE_URL || 'https://ncd.web.id';
const MEMBER_TOKEN = __ENV.MEMBER_TOKEN || 'NCD-FAUZAN';
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

export const options = {
  scenarios: {
    // Scenario 1: Protocol Load driving 50-70 VUs in 1 minute
    protocol_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 50 },  // 0s-15s: ramp up to 50 concurrent users
        { duration: '35s', target: 70 },  // 15s-50s: push into peak 70 concurrent users
        { duration: '10s', target: 0 },   // 50s-60s: ramp down to 0
      ],
      gracefulRampDown: '5s',
      exec: 'protocolScenario',
    },
    // Scenario 2: Single real Browser VU measuring real-user Web Vitals under that load
    browser_experience: {
      executor: 'constant-vus',
      vus: 1,
      duration: '60s',
      options: { browser: { type: 'chromium' } },
      exec: 'browserScenario',
    },
  },
  thresholds: {
    // Global SLAs
    http_req_failed: ['rate<0.05'], // Allow up to 5% failure/rate-limit ceiling
    http_req_duration: ['p(95)<2000'],
    'http_req_duration{name:HomeShell}': ['p(95)<1000'],
    'http_req_duration{name:PublicStats}': ['p(95)<1200'],

    // Web Vitals under load
    browser_web_vital_lcp: ['p(95)<3500'],
    browser_web_vital_cls: ['p(95)<0.1'],
  },
};

// ================================================================================
// PROTOCOL WORKLOAD (Simulates 50-70 concurrent human users)
// ================================================================================
export function protocolScenario() {
  const rand = Math.random();

  // 1. 80% Public Visitors (Browsing, reading articles, checking portfolio)
  if (rand < 0.80) {
    runPublicVisitor();
  }
  // 2. 15% Member Portal Sessions (Active members checking dash & classes)
  else if (rand < 0.95) {
    runMemberPortal();
  }
  // 3. 5% Recruitment Applications (Prospective applicants submitting form)
  else {
    runRecruitmentApply();
  }
}

function runPublicVisitor() {
  const start = Date.now();
  group('w1_public_visitor', function () {
    // Home Shell
    const resHome = http.get(`${BASE_URL}/`, {
      tags: { name: 'HomeShell' },
      headers: { 'User-Agent': USER_AGENT },
    });
    check(resHome, { 'home status 200': (r) => r.status === 200 });

    sleep(0.3 + Math.random() * 0.4);

    // Public Stats API
    const resStats = http.get(`${BASE_URL}/api/v1/public/stats`, {
      tags: { name: 'PublicStats' },
    });
    check(resStats, { 'stats status 200': (r) => r.status === 200 });

    // Public Members API
    const resMembers = http.get(`${BASE_URL}/api/v1/public/members`, {
      tags: { name: 'PublicMembers' },
    });
    check(resMembers, { 'members status 200': (r) => r.status === 200 });

    // Public Projects API
    const resProjects = http.get(`${BASE_URL}/api/v1/public/projects`, {
      tags: { name: 'PublicProjects' },
    });
    check(resProjects, { 'projects status 200': (r) => r.status === 200 });

    // Public Achievements API
    const resAchievements = http.get(`${BASE_URL}/api/v1/public/achievements`, {
      tags: { name: 'PublicAchievements' },
    });
    check(resAchievements, { 'achievements status 200': (r) => r.status === 200 });

    publicLatency.add(Date.now() - start);
    publicVisitorSuccess.add(resHome.status === 200 && resStats.status === 200);

    sleep(0.5 + Math.random() * 0.5);
  });
}

function runMemberPortal() {
  const start = Date.now();
  group('w2_member_portal', function () {
    // Login
    const loginPayload = JSON.stringify({ key: MEMBER_TOKEN });
    const resLogin = http.post(`${BASE_URL}/api/v1/auth/login`, loginPayload, {
      tags: { name: 'AuthLogin' },
      headers: { 'Content-Type': 'application/json', 'User-Agent': USER_AGENT },
    });

    let success = check(resLogin, {
      'login status is 200 or 429': (r) => r.status === 200 || r.status === 429,
    });

    if (resLogin.status === 200) {
      try {
        const body = JSON.parse(resLogin.body);
        if (body.token) {
          const authHeaders = {
            Authorization: `Bearer ${body.token}`,
            'Content-Type': 'application/json',
          };

          sleep(0.5);

          // Get /auth/me
          http.get(`${BASE_URL}/api/v1/auth/me`, {
            tags: { name: 'AuthMe' },
            headers: authHeaders,
          });

          // Get /member/profile
          http.get(`${BASE_URL}/api/v1/member/profile`, {
            tags: { name: 'MemberProfile' },
            headers: authHeaders,
          });

          // Get /portal/tokens/my-token
          http.get(`${BASE_URL}/api/v1/portal/tokens/my-token`, {
            tags: { name: 'MyToken' },
            headers: authHeaders,
          });
        }
      } catch {
        success = false;
      }
    }

    memberLatency.add(Date.now() - start);
    memberPortalSuccess.add(success);
    sleep(1.0 + Math.random() * 0.5);
  });
}

function runRecruitmentApply() {
  const start = Date.now();
  group('w3_recruitment_apply', function () {
    // Visit /join
    http.get(`${BASE_URL}/join`, {
      tags: { name: 'JoinPage' },
      headers: { 'User-Agent': USER_AGENT },
    });

    sleep(1.0);

    // Submit form
    const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const payload = JSON.stringify({
      full_name: `Perf Test Bot ${uniqueId}`,
      email: `perf-test-${uniqueId}@ncd.dev`,
      phone_whatsapp: '081299990001',
      generation: '2026',
      campus_domicile: 'Depok',
      university: 'Universitas Gunadarma',
      major: 'Informatika',
      referral_source: 'Performance Stress Test Suite',
      skills_interest: 'Stress Testing',
      motivation: 'Evaluation of load under 70 VUs',
      portfolio_links: 'https://github.com',
    });

    const resSubmit = http.post(`${BASE_URL}/api/v1/public/apply`, payload, {
      tags: { name: 'SubmitApplication' },
      headers: { 'Content-Type': 'application/json', 'User-Agent': USER_AGENT },
    });

    const success = check(resSubmit, {
      'apply status 201 or 429': (r) => r.status === 201 || r.status === 429,
    });

    applyLatency.add(Date.now() - start);
    applySuccess.add(success);
    sleep(1.5);
  });
}

// ================================================================================
// REAL BROWSER CLIENT (Renders DOM & Measures Web Vitals under load)
// ================================================================================
export async function browserScenario() {
  const page = await browser.newPage();
  try {
    const res = await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    check(res, {
      'browser page loaded 200': () => res && res.status() === 200,
    });

    await page.waitForSelector('nav', { state: 'visible', timeout: 10000 });
    sleep(5);
  } catch (e) {
    // In case of transient network timeout under high load
  } finally {
    await page.close();
  }
}
