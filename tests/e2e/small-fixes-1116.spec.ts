// Small fixes of 16 Nov 2026: a reviewed identity's English name (Kahalani, 2003), every member named given name first
// in the seat chart and Find an MK (new members of the 26th Knesset too), the timeline's lines all start at the same
// edge, a checked party register said as checked, and
// the double-envelope figures labelled for what they count.
import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';
import { openTool } from './openTool.ts';

async function start(page: Page, { lang = 'en', level = 'standard', width = 1500, election = 'k26' }: { lang?: 'en' | 'he'; level?: string; width?: number; election?: string } = {}) {
  await page.setViewportSize({ width, height: width < 800 ? 844 : 1000 });
  await page.addInitScript(([lang, level]) => {
    if (sessionStorage.getItem('started')) return;
    sessionStorage.setItem('started', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level, hintDismissed: true }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false, decimals: 2 } }));
  }, [lang, level] as const);
  await page.goto('/');
  if (election !== 'k26') await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), election);
}
const listRow = (page: Page, name: string) => page.locator('.lb-row', { has: page.locator('.lb-name', { hasText: new RegExp(`^${name}`) }) }).first();

test('2003: Avigdor Kahalani, Likud No. 41, is named in English', async ({ page }) => {
  await start(page, { election: 'k16' });
  await listRow(page, 'Likud').click();
  await page.getByRole('button', { name: /^Show all \d+ candidates$/ }).click();
  // the English name beside the printed Hebrew one, as for every other member with an official English name
  await expect(page.locator('aside .cands li', { hasText: 'קהלני אביגדור' })).toContainText('Avigdor Kahalani');
});

for (const lang of ['he', 'en'] as const) test(`2026: Find an MK names a new member given name first, like every other member (${lang})`, async ({ page }) => {
  await start(page, { lang });
  const box = page.locator('.chamber .find-mk input').first();
  await box.fill(lang === 'he' ? 'יורם' : 'יורם כהן');
  const mark = page.locator('.chamber .found-mark text');
  await expect(mark).toHaveCount(1);
  await expect(mark).toContainText('יורם כהן');
  await expect(mark).not.toContainText('כהן יורם');
  // a returning member reads the same way (the Knesset records him as גד)
  await box.fill(lang === 'he' ? 'איזנקוט' : 'Eisenkot');
  await expect(mark).toContainText(lang === 'he' ? 'גד איזנקוט' : 'Gadi Eisenkot');
});

for (const lang of ['he', 'en'] as const) test(`timeline, 13 Jun 2021 at Standard: every line starts at the same edge (${lang})`, async ({ page }) => {
  await start(page, { lang, election: 'k24' });
  await page.getByRole('tab', { name: lang === 'he' ? 'אחרי הבחירות' : 'After the election', exact: true }).click();
  const tl = page.locator('section.tl');
  for (let i = 0; i < 40 && (await tl.locator('.tl-tick[data-current]').getAttribute('data-date')) !== '2021-06-13'; i++) await tl.getByRole('button', { name: lang === 'he' ? /^הצעד הבא/ : /^Next step/ }).click();
  await expect(tl.locator('.tl-lines li[data-kind="speaker-elected"]')).toContainText(lang === 'he' ? 'מיקי לוי נבחר ליושב ראש הכנסת' : 'Mickey Levy becomes Speaker of the Knesset');
  const starts = await tl.locator('.tl-lines li .tl-line-text').evaluateAll((els, rtl) => els.map((e) => {
    const r = e.getBoundingClientRect(), p = e.closest('li')!.getBoundingClientRect();
    return Math.round(rtl ? p.right - r.right : r.left - p.left);
  }), lang === 'he');
  expect(starts.length).toBeGreaterThan(3);
  expect(new Set(starts).size).toBe(1);
});

// 1977 Hadash rank 5 in the chamber key: tests/e2e/overview-fixes.spec.ts (counted by party)

test('the Democrats: the party register check says what was found, never "not yet checked"', async ({ page }) => {
  await start(page, { level: 'simple' });
  await listRow(page, 'The Democrats').click();
  await page.locator('aside .ph-sec').getByRole('button', { name: 'Full history', exact: true }).click();
  const events = page.locator('dialog[open].ph-sheet .ph-events');
  await expect(events).toContainText('Party register checked: The registered name and the date of the legal change are not yet known');
  await expect(events).not.toContainText('not yet checked');
});

test('double envelopes: the count says it includes invalid ballots, the same words wherever it appears', async ({ page }) => {
  await start(page, { level: 'expert' });
  await openTool(page, 'turnout');
  const env = page.locator('.tn-facts [data-fact="envelopes"]');
  await expect(env.locator('.tn-v')).toHaveText('452,687');
  await expect(env.locator('.tn-d')).toContainText('of votes cast, incl. invalid');
});
