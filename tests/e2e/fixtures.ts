// Every spec imports `test` and `expect` from here, not from '@playwright/test' (tests/e2e-imports.test.ts checks it).
//
// PW_SLOW=1 slows every page's CPU (Chrome's own throttling, rate PW_SLOW_RATE, 4 by default) and stretches the
// timeouts by the same factor. GitHub's runner is several times slower than a desktop, and tests that read the page
// before it is done (a slide, a frame asked for late, a layout not yet settled) pass here and fail there. A slow run
// shows them before CI does: `PW_SLOW=1 PW_PORT=4360 heavy npx playwright test --workers=2`. See tests/e2e/README.md.
import { test as base, type BrowserContext, type Page } from '@playwright/test';

export * from '@playwright/test';

export const slowRate = process.env.PW_SLOW && process.env.PW_SLOW !== '0' ? Number(process.env.PW_SLOW_RATE ?? 4) : 1;

const throttled = new WeakSet<Page>();
const throttle = async (page: Page) => {
  if (throttled.has(page)) return;
  throttled.add(page);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: slowRate });
};

const patched = new WeakSet<BrowserContext>();
const slowContext = (context: BrowserContext) => {
  if (patched.has(context)) return context;
  patched.add(context);
  const newPage = context.newPage.bind(context);
  context.newPage = async () => { const page = await newPage(); await throttle(page); return page; };
  // pages the app opens itself (window.open); throttled as soon as they appear
  context.on('page', page => { throttle(page).catch(() => {}); });
  return context;
};

export const test = slowRate === 1 ? base : base.extend({
  browser: [async ({ browser }, use) => {
    const newContext = browser.newContext.bind(browser);
    // also covers the built-in `context` and `page` fixtures and browser.newPage(), which all call it
    browser.newContext = async (...args) => slowContext(await newContext(...args));
    await use(browser);
  }, { scope: 'worker' }],
});
