import http from 'k6/http';
import { check, group, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://ncd.web.id';
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

export const options = {
  vus: 1,
  iterations: 1,
  userAgent: USER_AGENT,
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<2000'],
    checks: ['rate>0.98'],
  },
};

export default function () {
  group('w3-recruitment-apply', function () {
    // 1. Visit /join page
    const resJoin = http.get(`${BASE_URL}/join`, {
      tags: { name: 'JoinPage' },
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    check(resJoin, {
      'join page status is 200': (r) => r.status === 200,
    });

    sleep(1);

    // 2. Submit synthetic application
    const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const payload = JSON.stringify({
      full_name: `Perf Test Bot ${uniqueId}`,
      email: `perf-test-${uniqueId}@ncd.dev`,
      phone_whatsapp: '081299990001',
      generation: '2026',
      campus_domicile: 'Depok',
      university: 'Universitas Gunadarma',
      major: 'Informatika',
      referral_source: 'Performance Test Suite',
      skills_interest: 'System Testing',
      motivation: 'Automated performance test verification',
      portfolio_links: 'https://github.com',
    });

    const resSubmit = http.post(`${BASE_URL}/api/v1/public/apply`, payload, {
      tags: { name: 'SubmitApplication' },
      headers: { 'Content-Type': 'application/json' },
    });

    check(resSubmit, {
      'application submit status is 200 or 201': (r) => r.status === 200 || r.status === 201,
      'application response is success': (r) => r.body && r.body.includes('success'),
    });
  });
}
