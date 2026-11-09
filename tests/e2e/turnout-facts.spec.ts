// The Turnout tab's facts (owner, 8 Nov: "total possible votes ... growth since last election as a percentage and a
// number"): key numbers at Simple, the full block and the all-elections chart from Standard, missing early figures
// said in words, edits marked against the official result, Hebrew charts left to right, and readable contrast.
import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';

async function open(page: Page, { lang = 'en', level = 'standard', election = 'k26', width = 1500 }: { lang?: 'en' | 'he'; level?: string; election?: string; width?: number } = {}) {
  await page.setViewportSize({ width, height: 1000 });
  await page.addInitScript(([lang, level]) => {
    if (sessionStorage.getItem('started')) return;
    sessionStorage.setItem('started', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false, decimals: 2 } }));
  }, [lang, level] as const);
  await page.goto('/');
  if (election !== 'k26') await choose(page.getByRole('button', { name: lang === 'en' ? 'Election' : 'בחירות', exact: true }), election);
  await page.locator('#tab-turnout').click();
  return page.locator('.tn-facts');
}
const fact = (facts: ReturnType<Page['locator']>, id: string) => facts.locator(`[data-fact="${id}"]`);

test('Standard: eligible voters, turnout and votes cast with their change since the previous election', async ({ page }) => {
  const facts = await open(page);
  await expect(fact(facts, 'registered').locator('.tn-v')).toHaveText('7,331,981');
  await expect(fact(facts, 'registered').locator('.tn-since')).toHaveText('▲ +543,177 · +8% since 2022');
  await expect(fact(facts, 'turnout').locator('.tn-v')).toHaveText('77.98%');
  await expect(fact(facts, 'turnout').locator('.tn-since')).toHaveText('▲ +7.35 pp since 2022');
  await expect(fact(facts, 'cast').locator('.tn-since')).toHaveText('▲ +922,804 · +19.25% since 2022');
  await expect(fact(facts, 'valid').locator('.tn-v')).toHaveText('5,691,426');
  await expect(fact(facts, 'invalid').locator('.tn-d')).toHaveText('0.45% of votes cast');
  await expect(fact(facts, 'threshold').locator('.tn-v')).toHaveText('184,972 votes');
  await expect(fact(facts, 'threshold').locator('.tn-d')).toHaveText('3.25% of valid votes');
  await expect(fact(facts, 'boxes')).toHaveCount(0);
  // a rounded share shows its exact value on hover
  await fact(facts, 'registered').locator('.tn-since .percentage').hover();
  await expect(page.locator('.percentage-pop')).toContainText('8.00107');
  // the change carries its sign and arrow, not only its colour
  await expect(fact(facts, 'registered').locator('.tn-delta')).toHaveAttribute('data-sign', '1');
});

test('Simple shows the few key numbers and no chart', async ({ page }) => {
  const facts = await open(page, { level: 'simple', election: 'k25' });
  await expect(facts.locator('.tn-fact')).toHaveCount(2);
  await expect(fact(facts, 'turnout').locator('.tn-d')).toHaveText('4,794,593 votes cast');
  await expect(fact(facts, 'turnout').locator('.tn-since')).toHaveText('▲ +3.18 pp since 2021');
  await expect(facts.locator('.tn-history')).toHaveCount(0);
});

test('1949 says what is missing: no earlier election, no threshold, no ballot-box count', async ({ page }) => {
  const facts = await open(page, { level: 'expert', election: 'k1' });
  await expect(facts.locator('.tn-first')).toHaveText('The first election: there is no earlier one to compare with.');
  await expect(facts.locator('.tn-since')).toHaveCount(0);
  await expect(fact(facts, 'threshold').locator('.tn-v')).toHaveText('None');
  await expect(fact(facts, 'boxes').locator('.tn-d')).toHaveText('Not in the source for this election');
  await expect(fact(facts, 'envelopes').locator('.tn-d')).toHaveText('Not in the source for this election');
});

test('Expert: ballot boxes and double envelopes where the source has them', async ({ page }) => {
  const facts = await open(page, { level: 'expert', election: 'k25' });
  await expect(fact(facts, 'boxes').locator('.tn-v')).toHaveText('12,545');
  await expect(fact(facts, 'boxes').locator('.tn-since')).toHaveText('▼ −381 · −2.95% since 2021');
  await expect(fact(facts, 'envelopes').locator('.tn-v')).toHaveText('462,807');
});

test('a what-if turnout shows in the facts, with the official value beside it', async ({ page }) => {
  const facts = await open(page, { election: 'k25' });
  await page.locator('.turnout-national').getByRole('button', { name: 'Increase Turnout %', exact: true }).click();
  await expect(fact(facts, 'turnout').locator('.tn-v')).toHaveText('70.73%');
  await expect(fact(facts, 'turnout').locator('.tn-d')).toContainText('70.63%');
  await expect(fact(facts, 'cast').locator('.tn-d')).toContainText('4,794,593');
  // the chart and table keep the official figures
  await expect(facts.locator('.tn-readout')).toContainText('70.63%');
});

test('the chart covers all 26 elections; a column opens its election; the table lists them', async ({ page }) => {
  const facts = await open(page);
  await expect(facts.locator('.tn-col')).toHaveCount(26);
  await expect(facts.locator('.tn-col[aria-current="true"]')).toHaveAttribute('aria-label', /^2026 · Knesset 26: eligible voters 7,331,981, turnout 77\.98%$/);
  await facts.locator('.tn-hit[data-chart="reg"]').nth(24).hover();
  await expect(facts.locator('.tn-readout')).toContainText('2022 · Knesset 25');
  await facts.locator('.tn-hit[data-chart="reg"]').nth(24).click();
  await expect(page.getByRole('button', { name: 'Election', exact: true })).toHaveAttribute('data-value', 'k25');
  await expect(page.locator('#tab-turnout')).toHaveAttribute('aria-selected', 'true');
  await page.locator('.tn-table summary').click();
  await expect(page.locator('.tn-table tbody tr')).toHaveCount(26);
  await expect(page.locator('.tn-table tbody tr').first()).toContainText('None');
});

test('in Hebrew the charts run left to right and every word is Hebrew', async ({ page }) => {
  const facts = await open(page, { lang: 'he', width: 390 });
  const bars = facts.locator('.tn-bar');
  const first = (await bars.first().boundingBox())!, last = (await bars.last().boundingBox())!;
  expect(first.x).toBeLessThan(last.x);
  await expect(fact(facts, 'registered').locator('.tn-since')).toHaveText('▲ +543,177 · +8% לעומת 2022');
  await expect(facts.locator('.tn-grid')).not.toContainText(/[A-Za-z]{2,}/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

for (const theme of ['light', 'dark'] as const) test(`facts text has readable contrast (${theme})`, async ({ page }) => {
  await page.emulateMedia({ colorScheme: theme });
  const facts = await open(page, { level: 'expert', election: 'k25' });
  await expect(fact(facts, 'boxes')).toBeVisible();
  const ratios = await page.locator('.tn-fact dt, .tn-v, .tn-d, .tn-since, .tn-delta, .tn-readout, .tn-cap').evaluateAll(nodes => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    const rgb = (color: string) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1); return [...ctx.getImageData(0, 0, 1, 1).data]; };
    const light = (c: number[]) => c.slice(0, 3).map(v => { const x = v / 255; return x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
    const bg = (el: Element | null): string => { for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (rgb(c)[3] === 255) return c; } return getComputedStyle(document.body).backgroundColor; };
    return nodes.filter(n => n.getClientRects().length).map(n => { const f = light(rgb(getComputedStyle(n).color)), b = light(rgb(bg(n))); return { text: n.textContent, ratio: (Math.max(f, b) + .05) / (Math.min(f, b) + .05) }; });
  });
  expect(ratios.length).toBeGreaterThan(15);
  for (const r of ratios) expect(r.ratio, r.text ?? '').toBeGreaterThanOrEqual(4.5);
});

// 9 Nov 2026: as in the party-history and party-family charts, the open election is a soft shaded column with its
// year in bold, and the (i) says the columns are evenly spaced elections, not a time scale.
test('All elections: the open election is shaded with its year in bold; the (i) explains the even spacing', async ({ page }) => {
  const facts = await open(page, { level: 'expert', election: 'k20' });
  const history = facts.locator('.tn-history');
  await expect(history.locator('.tn-cur')).toHaveCount(2);
  await expect(history.locator('.tn-axis.cur')).toHaveText(['’15', '’15']);
  expect(await history.locator('.tn-axis.cur').first().evaluate((e) => getComputedStyle(e).fontWeight)).toBe('700');
  await history.locator('h4').getByRole('button').click();
  await expect(page.locator('.info .pop')).toContainText('evenly spaced: this is not a time scale');
});
