// What this browser kept and the app cannot read is said once, in one line, and the rest of the app and of the user's
// work stays (audit 12 Nov 2026, c-robustness-01 to -06); a share link naming an unknown election is a damaged link,
// not a connection failure (c-robustness-04).
import { deflateRawSync } from 'node:zlib';
import { expect, test, type Page } from '@playwright/test';

const OUT = process.env.CHK_DIR;
const good = { id: 'k26-kept', name: 'Kept plan', electionId: 'k26', savedAt: '2026-11-01T00:00:00.000Z', baseBuiltAt: 'x', log: [] };
const LINE = {
  en: 'Some of what this browser kept could not be read and was left out: 2 saved scenarios, some settings.',
  he: 'חלק ממה שנשמר בדפדפן הזה לא היה קריא, ולכן הושמט: 2 תרחישים שמורים, חלק מההגדרות.',
};

async function start(page: Page, lang: 'en' | 'he') {
  await page.setViewportSize({ width: 1500, height: 1000 });
  await page.addInitScript(([lang, saved]) => {
    if (sessionStorage.getItem('started')) return;
    sessionStorage.setItem('started', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert', saved }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false, theme: 'purple' } }));
  }, [lang, [good, null, { id: 1 }]] as const);
  await page.goto('/');
}

for (const lang of ['en', 'he'] as const) test(`one plain line says what could not be read, once (${lang})`, async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await start(page, lang);
  await expect(page.locator('.lb-row').first()).toBeVisible();
  const line = page.locator('.app-notices .banner', { hasText: LINE[lang] });
  await expect(line).toBeVisible();
  if (OUT) await line.screenshot({ path: `${OUT}/chk-storage-${lang}.png` });
  // the readable saved scenario is still there
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('israel-elections:v1')!).saved.map((x: { name: string }) => x.name))).toEqual(['Kept plan']);
  await page.reload();
  await expect(page.locator('.lb-row').first()).toBeVisible();
  await expect(page.locator('.app-notices .banner', { hasText: LINE[lang] })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('a share link naming an unknown election says it is damaged and opens the newest election', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const hash = deflateRawSync(Buffer.from(JSON.stringify({ e: 'k99', n: 'x', b: 'b', l: [] }))).toString('base64url');
  await page.setViewportSize({ width: 1500, height: 1000 });
  await page.addInitScript(() => { if (!sessionStorage.getItem('started')) { sessionStorage.setItem('started', '1'); localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'en', level: 'expert' })); } });
  await page.goto(`/#s=${hash}`);
  await expect(page.locator('.lb-row').first()).toBeVisible();
  await expect(page.getByText('This share link is damaged or incomplete; no scenario was opened.')).toBeVisible();
  await expect(page.getByText(/Check the connection/)).toHaveCount(0);
  expect(new URL(page.url()).hash).toBe('');
  expect(errors).toEqual([]);
});

// pictures for the review (CHK_DIR=<folder>): the rules banner (c-state-code-12) and Seat safety under the 1977 cap
// (c-analysis-code-03), both languages
for (const lang of ['en', 'he'] as const) test(`pictures: 1977 with the 1973 rules (${lang})`, async ({ page }) => {
  test.skip(!OUT, 'pictures only');
  const work = { electionId: 'k9', current: { id: 'k9-rules', name: '1973 rules', electionId: 'k9', ref: null,
    log: [{ at: '2026-11-12T00:00:00.000Z', action: { type: 'startPart', part: 'rules', source: 'preset', presetId: 'il-1973-bader-ofer-1' } }] }, sessions: [], drafts: [] };
  const ws = { v: 2, tabs: { earlier: { at: 1, ws: work } } };
  await page.setViewportSize({ width: 1500, height: 1000 });
  await page.addInitScript(([lang, ws]) => {
    if (sessionStorage.getItem('started')) return;
    sessionStorage.setItem('started', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert', tool: 'security' }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false, openOn: 'last' } }));
    localStorage.setItem('israel-elections:workspace:v1', ws);
  }, [lang, JSON.stringify(ws)] as const);
  await page.goto('/');
  const banner = page.locator('.banner', { hasText: lang === 'en' ? 'candidate cap off' : 'מגבלת המועמדים כבויה' });
  await expect(banner).toBeVisible();
  await banner.screenshot({ path: `${OUT}/chk-rules-banner-${lang}.png` });
  // back to the law's rules: Seat safety for Flatto-Sharon, who has one candidate and one seat
  await page.getByRole('button', { name: lang === 'en' ? 'Back to the real rules' : 'חזרה לכללים האמיתיים' }).click();
  const row = page.locator('.sec-row', { hasText: lang === 'en' ? 'Flatto-Sharon' : 'פלאטו־שרון' }).first();
  await expect(row).toContainText('—', { timeout: 30_000 });
  await row.screenshot({ path: `${OUT}/chk-seat-safety-1977-${lang}.png` });
});
