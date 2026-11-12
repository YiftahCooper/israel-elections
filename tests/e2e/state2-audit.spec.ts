// Audit 12 Nov 2026, lane fx-state2: work is never lost, a failed download can always be tried again, and the analysis
// figures say what they prove. Pictures for the review with CHK_DIR=<folder>.
import { expect, test, type Page } from '@playwright/test';

const OUT = process.env.CHK_DIR;
const WS = 'israel-elections:workspace:v1';

/** first visit only: later reloads keep what the app stored */
async function seed(page: Page, lang: 'en' | 'he', extra: Record<string, string> = {}) {
  await page.addInitScript(([lang, extra]) => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert' }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false, decimals: 2 } }));
    for (const [k, v] of Object.entries(extra)) localStorage.setItem(k, v);
  }, [lang, extra] as const);
}
const savedNames = (page: Page) => page.evaluate(() => (JSON.parse(localStorage.getItem('israel-elections:v1') ?? '{}').saved ?? []).map((x: { name: string }) => x.name));

test('c-robustness-07: a scenario saved in one tab survives an action in a second tab, and the second tab lists it', async ({ context }) => {
  const a = await context.newPage(), b = await context.newPage();
  await seed(a, 'en'); await a.goto('/');
  await b.goto('/'); // the second tab of the same browser: same storage
  await expect(b.locator('.band .election-status')).toBeVisible();
  await a.getByRole('region', { name: 'Lists', exact: true }).getByRole('button', { name: 'Likud', exact: true }).click();
  const votes = a.locator('.side-panel').getByRole('textbox', { name: 'Votes', exact: true });
  await votes.fill('1120000'); await votes.press('Enter');
  await a.locator('.side-panel').getByRole('button', { name: 'Close', exact: true }).click();
  await a.getByRole('button', { name: 'Save & share', exact: true }).click();
  const input = a.getByRole('textbox', { name: 'Scenario name', exact: true });
  await input.fill('From tab A'); await input.press('Enter');
  await a.getByRole('button', { name: 'Save in this browser', exact: true }).click();
  await expect.poll(() => savedNames(a)).toEqual(['From tab A']);
  // tab B, which had not seen the save, changes the open tool: before the fix this wrote its stale copy over it
  await b.locator('#tab-charts').click();
  await expect(b.locator('#analysis-panel figure').first()).toBeVisible();
  await expect.poll(() => savedNames(b)).toEqual(['From tab A']);
  // and B shows it among its scenarios
  await b.getByRole('button', { name: 'Switch scenario', exact: true }).click();
  await expect(b.getByRole('dialog').last().getByRole('button', { name: 'From tab A', exact: true })).toBeVisible();
  await a.reload();
  await expect.poll(() => savedNames(a)).toEqual(['From tab A']);
});

for (const lang of ['en', 'he'] as const) test(`c-robustness-11: last visit's work whose data does not load is kept, with Try again (${lang})`, async ({ page }) => {
  const k25 = await (await page.request.get('/data/k25.json')).json();
  const work = { electionId: 'k25', current: { id: 'k25-w', name: lang === 'en' ? 'My 2022 work' : 'העבודה שלי', electionId: 'k25', ref: null,
    log: [{ at: '2026-11-12T00:00:00.000Z', action: { type: 'transfer', from: k25.lists[0].id, to: k25.lists[1].id, votes: 2022 } }] }, sessions: [], drafts: [] };
  const stored = JSON.stringify({ v: 2, tabs: { earlier: { at: 1, ws: work } } });
  await seed(page, lang, { [WS]: stored });
  let down = true;
  await page.route('**/data/k25.json', (route) => (down ? route.fulfill({ status: 503, body: '' }) : route.continue()));
  await page.goto('/');
  const banner = page.locator('.banner.err');
  await expect(banner).toContainText(lang === 'en' ? 'Your unsaved work on this election is not lost.' : 'העבודה שלא נשמרה על הבחירות האלה לא אבדה.');
  if (OUT) await banner.screenshot({ path: `${OUT}/chk-startup-kept-${lang}.png` });
  await page.waitForTimeout(600);
  expect(await page.evaluate((k) => localStorage.getItem(k), WS)).toBe(stored); // nothing stored changed
  down = false;
  await banner.getByRole('button', { name: lang === 'en' ? 'Try again' : 'נסו שוב', exact: true }).click();
  await expect(page.locator('.band .election-status')).toContainText(lang === 'en' ? 'My 2022 work' : 'העבודה שלי');
  await expect(banner).toHaveCount(0);
});

for (const lang of ['en', 'he'] as const) test(`c-robustness-05: a data file of another version says so, with Reload (${lang})`, async ({ page }) => {
  await seed(page, lang);
  await page.goto('/');
  await expect(page.locator('.band .election-status')).toBeVisible();
  const k25 = await (await page.request.get('/data/k25.json')).json();
  let asked = 0;
  await page.route('**/data/k25.json', (route) => { asked++; return route.fulfill({ json: { ...k25, schemaVersion: 99 } }); });
  await page.getByRole('button', { name: lang === 'en' ? 'Previous election' : 'הבחירות הקודמות', exact: true }).click(); // 2022
  const banner = page.locator('.banner.err');
  await expect(banner).toContainText(lang === 'en' ? 'different versions' : 'מגרסאות שונות');
  await expect(banner.getByRole('button', { name: lang === 'en' ? 'Reload' : 'טעינה מחדש', exact: true })).toBeVisible();
  expect(asked).toBe(2); // the browser's copy, then once more from the server
  if (OUT) await banner.screenshot({ path: `${OUT}/chk-version-banner-${lang}.png` });
});

for (const lang of ['en', 'he'] as const) test(`c-robustness-09: a tab whose code failed to download loads on Try again (${lang})`, async ({ page }) => {
  await seed(page, lang);
  // the code download fails (the app asks twice, and again on a hover's prefetch) until the server is back
  let down = true, asked = 0;
  await page.route(/\/assets\/Charts-[^/]+\.js(\?.*)?$/, (route) => { asked++; return down ? route.fulfill({ status: 503, body: '' }) : route.continue(); });
  await page.goto('/');
  await page.locator('#tab-charts').click();
  const banner = page.locator('#analysis-panel .banner.err');
  await expect(banner).toContainText(lang === 'en' ? 'could not be downloaded' : 'לא ניתן היה להוריד');
  await expect(banner.getByRole('button', { name: lang === 'en' ? 'Reload' : 'טעינה מחדש', exact: true })).toBeVisible();
  if (OUT) await banner.screenshot({ path: `${OUT}/chk-chunk-banner-${lang}.png` });
  const before = asked;
  down = false;
  await banner.getByRole('button', { name: lang === 'en' ? 'Try again' : 'נסו שוב', exact: true }).click();
  await expect(page.locator('#analysis-panel figure').first()).toBeVisible();
  expect(asked).toBeGreaterThan(before); // the browser really asked again for a module it failed to fetch
});

for (const lang of ['en', 'he'] as const) test(`c-robustness-10: Localities says in words that its data did not load, with Try again (${lang})`, async ({ page }) => {
  await seed(page, lang);
  let failures = 1;
  await page.route('**/data/k26-localities.json', (route) => (failures-- > 0 ? route.fulfill({ status: 500, body: '' }) : route.continue()));
  await page.goto('/');
  await page.locator('#tab-loc').click();
  const err = page.locator('#analysis-panel p.bad');
  await expect(err).toContainText(lang === 'en' ? 'The locality results could not be loaded.' : 'לא ניתן היה לטעון את התוצאות לפי יישובים.');
  await expect(page.locator('#analysis-panel')).not.toContainText('HTTP');
  if (OUT) await err.screenshot({ path: `${OUT}/chk-localities-error-${lang}.png` });
  await err.getByRole('button', { name: lang === 'en' ? 'Try again' : 'נסו שוב', exact: true }).click();
  await expect(page.getByRole('group', { name: lang === 'en' ? 'Locality view' : 'תצוגת יישובים', exact: true })).toBeVisible();
});

for (const lang of ['en', 'he'] as const) test(`c-results-engine-02: Seat safety marks a figure where a tie by lot comes earlier (${lang})`, async ({ page }) => {
  // list details follow the remembered vote source: new voters, as Seat safety is set below
  await seed(page, lang, { 'israel-elections:preferences': JSON.stringify({ voteSource: 'new', comparison: 'reference', jointSeats: 'off' }) });
  await page.goto('/');
  await page.locator('#tab-security').click();
  await page.getByRole('group', { name: lang === 'en' ? 'Votes come from' : 'הקולות מגיעים מ־', exact: true }).getByRole('button', { name: lang === 'en' ? 'New voters' : 'מצביעים חדשים', exact: true }).click();
  const tie = page.locator('.sec-row .sec-tie').first();
  await expect(tie).toBeVisible({ timeout: 60_000 });
  const row = page.locator('.sec-row', { has: page.locator('.sec-r .sec-tie[title*="5,825"]') });
  await expect(row.locator('.sec-r')).toContainText('5,826');
  await expect(row.locator('.sec-r .sec-tie')).toHaveAttribute('title', lang === 'en' ? 'A tie decided by lot is possible from 5,825 votes' : 'שוויון שמוכרע בהגרלה אפשרי החל מ־5,825 קולות');
  await expect(page.locator('.sec')).toContainText(lang === 'en' ? '* fewer votes could already tie for the seat (decided by lot)' : '* כבר בפחות קולות ייתכן שוויון על המנדט (מוכרע בהגרלה)');
  await page.waitForFunction(() => !document.querySelector('.sec [role="status"]'));
  if (OUT) await page.locator('.sec').screenshot({ path: `${OUT}/chk-seat-safety-tie-${lang}.png` });
  // the list's own details say it in words
  await row.locator('.table-action').click();
  const status = page.locator('.side-panel .seat-search-status');
  await expect(status).toContainText(lang === 'en' ? 'A tie decided by lot is possible from 5,825 votes' : 'שוויון שמוכרע בהגרלה אפשרי החל מ־5,825 קולות', { timeout: 60_000 });
  if (OUT) await page.locator('.side-panel .seat-target').locator('..').screenshot({ path: `${OUT}/chk-list-tie-${lang}.png` });
});
