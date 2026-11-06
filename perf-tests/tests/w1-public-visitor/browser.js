import { browser } from 'k6/browser';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://ncd.web.id';

export const options = {
  scenarios: {
    public_visitor_browser: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
      options: { browser: { type: 'chromium' } },
    },
  },
  thresholds: {
    browser_web_vital_lcp: ['p(95)<3000'],
  },
};

export default async function () {
  const page = await browser.newPage();
  try {
    const res = await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    check(res, {
      'page loaded 200': () => res && res.status() === 200,
    });

    const title = await page.title();
    check(title, {
      'has valid title': (t) => t && t.length > 0,
    });

    // Wait for main content or headline to hydrate
    await page.waitForSelector('h1, h2, nav', { state: 'visible', timeout: 10000 });
  } finally {
    await page.close();
  }
}
