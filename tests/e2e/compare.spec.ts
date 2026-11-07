// Compare screen: previous-election defaults, explicit targets, another election as a
// comparison, a dumbbell that keeps tied lists readable, and left-to-right graphics and signs in Hebrew.
import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';

async function start(page: Page, lang: 'en' | 'he' = 'en', election = 'k26', width = 1500) {
  await page.setViewportSize({ width, height: 1000 });
  await page.addInitScript((lang) => {
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert', hintDismissed: true }));
    localStorage.setItem('israel-elections:preferences', JSON.stringify({ voteSource: 'proportional' }));
  }, lang);
  await page.goto('/');
  if (election !== 'k26') await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), election);
}
async function editFirstList(page: Page, votes: string) {
  await page.locator('.lb-row').first().click();
  const input = page.locator('aside input[aria-label="Votes"], aside input[aria-label="קולות"]').first();
  await input.fill(votes); await input.press('Enter');
  await page.keyboard.press('Escape');
  if (await page.locator('aside .sp-head').count()) await page.keyboard.press('Escape');
  await expect(page.locator('aside .sp-head')).toHaveCount(0);
}
const compare = (page: Page) => page.locator('#tab-compare').click();

test('an unchanged scenario opens directly on the previous election and respects an explicit official target', async ({ page }) => {
  await start(page);
  await compare(page);
  await expect(page.locator('.cmp-empty')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Compare with', exact: true })).toHaveAttribute('data-value', 'election:k25');
  const figs = page.locator('.cmp-chambers figure');
  await expect(figs).toHaveCount(2);
  await expect(figs.nth(0).locator('figcaption')).toContainText('2022 · 25th Knesset');
  await expect(figs.nth(1).locator('figcaption')).toContainText('2026 · 26th Knesset');
  await expect(page.locator('.cmp')).toContainText('Lists are not matched across elections');
  await expect(page.locator('.cmp-diff, .cmp table')).toHaveCount(0);
  await expect(page.locator('.cmp .fig').filter({ hasText: 'Votes per seat' }).locator('.d')).toHaveText('2022: 36,227');
  // the other election's seats do not open a list of the current scenario
  await figs.nth(0).locator('[data-seat]').first().click();
  await expect(page.locator('aside .sp-head')).toHaveCount(0);
  // and its picker returns to this election's comparisons
  await page.locator('.cmp-head').getByRole('button', { name: 'Compare with' }).click();
  await page.locator('dialog[open] [data-choice-value="historical"]').click();
  await expect(page.locator('.cmp-empty')).toBeVisible();
  await page.getByRole('tab', { name: 'Overview', exact: true }).click();
  await compare(page);
  await expect(page.locator('.cmp-empty')).toBeVisible();
});

test('the automatic comparison follows an edit and undo without storing an election target', async ({ page }) => {
  await start(page, 'en', 'k25');
  await compare(page);
  await expect(page.getByRole('button', { name: 'Compare with', exact: true })).toHaveAttribute('data-value', 'election:k24');
  await page.getByRole('tab', { name: 'Overview', exact: true }).click();
  await editFirstList(page, '1300000');
  await compare(page);
  await expect(page.locator('.cmp-head .choice-trigger')).toHaveAttribute('data-value', 'historical');
  await expect(page.locator('.cmp-key')).toContainText('Outlined: seats gained compared with Official result');
  await page.getByRole('button', { name: /^Undo:/ }).click();
  await expect(page.locator('.cmp-head .choice-trigger')).toHaveAttribute('data-value', 'election:k24');
});

test('another election chosen in Compare with sticks across tabs and edits', async ({ page }) => {
  await start(page);
  await compare(page);
  await choose(page.getByRole('button', { name: 'Compare with', exact: true }), 'election:k24');
  await page.getByRole('tab', { name: 'Overview', exact: true }).click();
  await editFirstList(page, '1300000');
  await compare(page);
  await expect(page.locator('.cmp-head .choice-trigger')).toHaveAttribute('data-value', 'election:k24');
  await expect(page.locator('.cmp-chambers figure').first()).toContainText('2021 · 24th Knesset');
});

for (const lang of ['en', 'he'] as const) test(`the earliest election keeps the chooser (${lang})`, async ({ page }) => {
  await start(page, lang, 'k1');
  await compare(page);
  await expect(page.locator('.cmp-empty')).toBeVisible();
  await expect(page.locator('.cmp-chambers')).toHaveCount(0);
  await expect(page.locator('.cmp-empty').getByRole('button', { name: lang === 'he' ? 'שאלת "מה אם"…' : 'A What-if question…' })).toBeVisible();
});

test('the seats-by-list chart keeps tied lists apart and the chamber pair adds no third chamber', async ({ page }) => {
  await start(page, 'en', 'k25');
  await editFirstList(page, '1300000');
  await compare(page);
  await expect(page.locator('.cmp .baseline-mini, .cmp .compact-changes')).toHaveCount(0);
  await expect(page.locator('.cmp-key')).toContainText('Outlined: seats gained compared with Official result');
  const rows = page.locator('.cmp-dumbbell li');
  expect(await rows.count()).toBeGreaterThan(9);
  const boxes = await rows.locator('.cmp-label').evaluateAll(nodes => nodes.map(n => n.getBoundingClientRect()).map(r => [r.top, r.bottom]));
  for (let i = 1; i < boxes.length; i++) expect(boxes[i][0]).toBeGreaterThanOrEqual(boxes[i - 1][1] - 0.5);
  await expect(rows.filter({ hasText: 'Likud' }).locator('.db-v')).toHaveText('32 → 37');
  await expect(rows.filter({ hasText: 'United Torah Judaism' }).locator('.db-v')).toHaveText('7');
});

test('Hebrew Compare keeps bars, tracks and signs left to right', async ({ page }) => {
  await start(page, 'he', 'k25');
  await editFirstList(page, '1300000');
  await compare(page);
  const gain = page.locator('.cmp-diff li').first();
  expect((await gain.locator('.cmp-pos i').boundingBox())!.x).toBeGreaterThan((await gain.locator('.cmp-axis').boundingBox())!.x);
  expect((await gain.locator('.cmp-label').boundingBox())!.x).toBeGreaterThan((await gain.locator('.cmp-pos i').boundingBox())!.x);
  const ticks = page.locator('.db-axis .db-track span');
  expect((await ticks.first().boundingBox())!.x).toBeLessThan((await ticks.last().boundingBox())!.x);
  const shares = await page.locator('.cmp tbody tr').first().locator('td bdi').allTextContents();
  expect(shares.every(t => /^(?:[▲▼]\s*)?[+−±]/.test(t))).toBe(true);
});

test('an election without a threshold says so', async ({ page }) => {
  await start(page, 'en', 'k1');
  await editFirstList(page, '200000');
  await compare(page);
  await expect(page.locator('.cmp .fig').filter({ hasText: 'Threshold (votes)' }).locator('.v')).toHaveText('None');
});

test('collapsing Votes & seats by list keeps its heading under the pointer, and the heading is a full-size target', async ({ page }) => {
  await start(page, 'en', 'k25');
  await editFirstList(page, '1300000');
  await compare(page);
  const summary = page.locator('.cmp details > summary');
  expect((await summary.boundingBox())!.height).toBeGreaterThanOrEqual(24);
  // the heading mid-screen near the page end: collapsing shortens the page below the scroll position
  await summary.evaluate(el => window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 300, behavior: 'instant' }));
  for (const open of [false, true]) {
    const box = (await summary.boundingBox())!, before = box.y;
    expect(before).toBeGreaterThan(250);
    await page.mouse.click(box.x + 40, box.y + box.height / 2);
    await expect(page.locator('.cmp details')).toHaveJSProperty('open', open);
    expect(Math.abs((await summary.boundingBox())!.y - before)).toBeLessThanOrEqual(1);
  }
});
