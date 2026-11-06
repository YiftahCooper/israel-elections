// "How seats were allocated": every stage of each era's method is taught, the steps fit, tables are whole,
// and an edited scenario is explained against its reference (owner feedback, 5 Nov 2026).
import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';

async function start(page: Page, election = 'k26', lang: 'en' | 'he' = 'en', width = 1500) {
  await page.setViewportSize({ width, height: 1000 });
  await page.addInitScript((lang) => localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert', hintDismissed: true })), lang);
  await page.goto('/');
  if (election !== 'k26') await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), election);
}
const panel = (page: Page) => page.locator('#analysis-panel');
const walk = async (page: Page) => { await page.locator('#tab-walk').click(); await expect(panel(page).locator('.walk-stages')).toBeVisible(); };
const stage = (page: Page, name: string) => panel(page).locator('.walk-stages button').filter({ hasText: name }).click();

test('the stages fit on one line, with the seats and pairs of the open stage beneath', async ({ page }) => {
  await start(page, 'k14');
  await walk(page);
  const stages = panel(page).locator('.walk-stages button');
  await expect(stages).toHaveText(['1Threshold', '2Quota', '3Whole quotas', '4Surplus agreements', '5Remainder seats (6)', '6Within pairs (5)', '7Result']);
  const tops = await stages.evaluateAll((els) => new Set(els.map((e) => Math.round(e.getBoundingClientRect().top))).size);
  expect(tops).toBe(1);
  await stage(page, 'Remainder seats');
  await expect(panel(page).locator('.walk-seat')).toHaveText(['115', '116', '117', '118', '119', '120']);
  // the chamber fills seat by seat: 114 whole-quota seats and the current one
  await expect(panel(page).locator('.walk-tray > span:not(.empty)')).toHaveCount(115);
  await expect(panel(page).locator('.walk-tray > span.cur')).toHaveCount(1);
});

test('the threshold step lists every list and draws the line where they fail; tables are not cut off', async ({ page }) => {
  await start(page, 'k25');
  await walk(page);
  const rows = panel(page).locator('.tbl tbody tr');
  await expect(panel(page).locator('.walk-cut')).toContainText('154,855 votes or more');
  await expect(panel(page).locator('tr.below').first()).toContainText('Meretz');
  await panel(page).getByRole('button', { name: /^Show \d+ more lists below$/ }).click();
  // 40 lists with votes and the threshold line
  await expect(rows).toHaveCount(41);
  const wrap = panel(page).locator('.tablewrap').first();
  expect(await wrap.evaluate((w) => w.scrollHeight - w.clientHeight)).toBeLessThanOrEqual(1);
});

test('surplus agreements are a step of their own and say why one had no effect', async ({ page }) => {
  await start(page, 'k25');
  await walk(page);
  await stage(page, 'Surplus agreements');
  const labor = panel(page).locator('tr', { hasText: 'Labor' });
  await expect(labor).toContainText('no effect: Meretz below the threshold');
  await expect(panel(page).locator('tr', { hasText: 'Yesh Atid' })).toContainText('compete as one');
});

test('each era explains its own remainder rule and why a list cannot compete', async ({ page }) => {
  await start(page, 'k9');
  await walk(page);
  await stage(page, 'Remainder seats');
  await panel(page).locator('.walk-seat', { hasText: '120' }).click();
  // 1977: Flatto-Sharon is out of candidates, not under the half-seats cap
  await expect(panel(page).locator('tr', { hasText: 'Flatto-Sharon' })).toContainText('no more candidates');
  await expect(panel(page).locator('tr', { hasText: 'Flatto-Sharon' })).not.toContainText('half-seats cap');

  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k7');
  await walk(page);
  await stage(page, 'Remainder seats');
  await expect(panel(page)).toContainText('the votes left after its whole quotas. The largest wins. No list wins two.');
  await panel(page).locator('.walk-seat', { hasText: '117' }).click();
  await expect(panel(page).locator('tr').filter({ hasText: /^Agudat Yisrael/ })).toContainText('already won one');
  // the pair's re-division by largest remainder shows a remainder, not a division
  await stage(page, 'Within pairs');
  await expect(panel(page).locator('.walk-calc').first()).toHaveText('19,943 − 11,997 × 1 =');
});

test('1949: lists below one quota win nothing, and the pair quota divides by the seats plus one', async ({ page }) => {
  await start(page, 'k1');
  await walk(page);
  await expect(panel(page).locator('.walk-cut')).toContainText('One quota: 3,592 votes');
  await stage(page, 'Within pairs');
  const formula = await panel(page).locator('.formula').innerText();
  const [, votes, divisor, quota] = formula.replace(/,/g, '').match(/⌊ (\d+) ÷ (\d+) ⌋ = (\d+)/)!;
  const seats = Number((await panel(page).locator('p', { hasText: /The pair won \d+ seats/ }).innerText()).match(/won (\d+) seats/)![1]);
  expect(Number(divisor)).toBe(seats + 1);
  expect(Number(quota)).toBe(Math.floor(Number(votes) / (seats + 1)));
});

test('an edited scenario is explained against the official result at every stage', async ({ page }) => {
  await start(page, 'k25');
  await page.getByRole('region', { name: /^(Lists|הרשימות)$/ }).getByRole('button', { name: 'Meretz', exact: true }).first().click();
  const votes = page.locator('.side-panel').getByRole('textbox', { name: 'Votes', exact: true });
  await votes.fill('160000'); await votes.press('Enter');
  await expect(votes).toHaveValue('160,000');
  await walk(page);
  const meretz = panel(page).locator('tr', { hasText: 'Meretz' });
  await expect(meretz).toContainText('was below');
  await expect(meretz.locator('.edit-marker')).toBeVisible();
  await stage(page, 'Surplus agreements');
  await expect(panel(page).locator('tr', { hasText: 'Labor' })).toContainText('compete as one');
  await expect(panel(page).locator('tr', { hasText: 'Labor' })).toContainText('had no effect');
  await stage(page, 'Result');
  await expect(panel(page).locator('tr', { hasText: 'Meretz' }).locator('.walk-delta')).toHaveText('0 → 4 (▲ +4)');
});

test('Hebrew: formulas read left to right and no table scrolls sideways on a phone', async ({ page }) => {
  await start(page, 'k7', 'he', 390);
  await walk(page);
  const next = panel(page).locator('.walk-controls button').nth(2);
  while (await next.isEnabled()) {
    for (const w of await panel(page).locator('.tablewrap').all()) expect(await w.evaluate((e) => e.scrollWidth - e.clientWidth)).toBeLessThanOrEqual(1);
    for (const f of await panel(page).locator('.formula:has(bdi)').all()) {
      // the label sits at the left and the result at the right, as in English
      const [label, after] = await f.evaluate((e) => { const b = e.querySelector('bdi')!; const r = document.createRange(); r.selectNodeContents(b.nextSibling!); return [b.getBoundingClientRect().right, r.getClientRects()[0].left]; });
      expect(label).toBeLessThanOrEqual(after + 1);
    }
    await next.click();
  }
});
