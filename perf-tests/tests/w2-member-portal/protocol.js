import http from 'k6/http';
import { check, group, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://ncd.web.id';
const MEMBER_TOKEN = __ENV.MEMBER_TOKEN || 'NCD-FAUZAN';
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

export const options = {
  vus: 1,
  iterations: 1,
  userAgent: USER_AGENT,
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<1500'],
    checks: ['rate>0.98'],
  },
};

export default function () {
  group('w2-member-portal', function () {
    // 1. Login Shell & Token Exchange
    const loginPayload = JSON.stringify({ key: MEMBER_TOKEN });
    const resLogin = http.post(`${BASE_URL}/api/v1/auth/login`, loginPayload, {
      tags: { name: 'AuthLogin' },
      headers: { 'Content-Type': 'application/json' },
    });

    const loginSuccess = check(resLogin, {
      'login status is 200': (r) => r.status === 200,
      'login returns jwt token': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.token && body.token.length > 20;
        } catch {
          return false;
        }
      },
    });

    if (!loginSuccess) {
      return;
    }

    const token = JSON.parse(resLogin.body).token;
    const authHeaders = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    sleep(0.5);

    // 2. Auth Session verification (/auth/me)
    const resMe = http.get(`${BASE_URL}/api/v1/auth/me`, {
      tags: { name: 'AuthMe' },
      headers: authHeaders,
    });
    check(resMe, {
      'auth/me status is 200': (r) => r.status === 200,
    });

    // 3. Member Profile (/member/profile)
    const resProfile = http.get(`${BASE_URL}/api/v1/member/profile`, {
      tags: { name: 'MemberProfile' },
      headers: authHeaders,
    });
    check(resProfile, {
      'member profile status is 200': (r) => r.status === 200,
    });

    // 4. Personal Token masked readout (/portal/tokens/my-token)
    const resMyToken = http.get(`${BASE_URL}/api/v1/portal/tokens/my-token`, {
      tags: { name: 'MyToken' },
      headers: authHeaders,
    });
    check(resMyToken, {
      'my-token status is 200': (r) => r.status === 200,
      'my-token is masked': (r) => r.body && r.body.includes('••••'),
    });

    // 5. Learning Sessions classes (/portal/learning-sessions/classes)
    const resClasses = http.get(`${BASE_URL}/api/v1/portal/learning-sessions/classes`, {
      tags: { name: 'LearningClasses' },
      headers: authHeaders,
    });
    check(resClasses, {
      'learning classes status is 200': (r) => r.status === 200,
    });
  });
}
