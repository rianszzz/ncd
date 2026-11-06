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
    http_req_duration: ['p(95)<1500'],
    checks: ['rate>0.98'],
  },
};

export default function () {
  group('w1-public-visitor', function () {
    // 1. Landing Page HTML shell
    const resHome = http.get(`${BASE_URL}/`, {
      tags: { name: 'HomeShell' },
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    check(resHome, {
      'homepage status is 200': (r) => r.status === 200,
    });

    sleep(0.5);

    // 2. OnMount public APIs fan-out
    const resStats = http.get(`${BASE_URL}/api/v1/public/stats`, {
      tags: { name: 'PublicStats' },
    });
    check(resStats, {
      'public stats status is 200': (r) => r.status === 200,
      'public stats has total members': (r) => r.body && r.body.includes('total_members'),
    });

    const resMembers = http.get(`${BASE_URL}/api/v1/public/members`, {
      tags: { name: 'PublicMembers' },
    });
    check(resMembers, {
      'public members status is 200': (r) => r.status === 200,
    });

    const resProjects = http.get(`${BASE_URL}/api/v1/public/projects`, {
      tags: { name: 'PublicProjects' },
    });
    check(resProjects, {
      'public projects status is 200': (r) => r.status === 200,
    });

    const resHistory = http.get(`${BASE_URL}/api/v1/public/history`, {
      tags: { name: 'PublicHistory' },
    });
    check(resHistory, {
      'public history status is 200': (r) => r.status === 200,
    });

    const resAchievements = http.get(`${BASE_URL}/api/v1/public/achievements`, {
      tags: { name: 'PublicAchievements' },
    });
    check(resAchievements, {
      'public achievements status is 200': (r) => r.status === 200,
    });

    const resPosts = http.get(`${BASE_URL}/api/v1/public/posts`, {
      tags: { name: 'PublicPosts' },
    });
    check(resPosts, {
      'public posts status is 200': (r) => r.status === 200,
    });
  });
}
