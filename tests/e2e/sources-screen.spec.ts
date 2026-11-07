import { choose } from './choices.ts';
import { expect, test, type Page } from '@playwright/test';

// The Sources screen, the band's About and the footer: provenance complete and readable, secondary
// evidence labelled, no dead links, downloads served.
async function open(page: Page, lang: 'en' | 'he', election: string) {
  await page.addInitScript(([lang]) => { if (!sessionStorage.getItem('sources-seeded')) { localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({ lang, hintDismissed: true })); sessionStorage.setItem('sources-seeded', '1'); } }, [lang]);
  await page.goto('/');
  const picker = page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true });
  await choose(picker, election);
}
const sourcesTab = (page: Page, lang: 'en' | 'he') => page.getByRole('tab', { name: lang === 'he' ? 'מקורות' : 'Sources', exact: true }).click();

test('k1: no zero counts for missing localities, no dead project links, secondary labelled', async ({ page }) => {
  await open(page, 'en', 'k1');
  await sourcesTab(page, 'en');
  const panel = page.locator('#analysis-panel');
  await expect(panel.getByText('Polling stations and localities', { exact: true })).toBeVisible();
  await expect(panel.getByText('Not in the data', { exact: true })).toBeVisible();
  await expect(panel.getByText('Lists', { exact: true })).toBeVisible();
  await expect(panel.locator('a[href^="local:"], a[href^="project:"]')).toHaveCount(0);
  await expect(panel.getByText(/^Project record: data\/raw\/k1\//).first()).toBeVisible();
  await expect(panel.locator('.chip.secondary', { hasText: 'secondary' }).first()).toBeVisible();
  // official sources are listed before secondary ones
  const kinds = await panel.locator('ul.credits').first().locator('> li .chip').allInnerTexts();
  expect(kinds.indexOf('secondary')).toBeGreaterThan(-1);
  expect(kinds.slice(kinds.indexOf('secondary')).every(k => k === 'secondary')).toBe(true);
  // the locality download is offered only where locality data exists
  await expect(panel.getByRole('link', { name: 'localities', exact: true })).toHaveCount(0);
});

test('k26 in English: English publishers, one credit per logo, downloads served, no English Wikipedia', async ({ page }) => {
  await open(page, 'en', 'k26');
  await sourcesTab(page, 'en');
  const panel = page.locator('#analysis-panel');
  // the source list loads after the tab opens; allInnerTexts does not wait for it
  await expect(panel.locator('ul.credits').first().locator('> li > b').first()).toBeVisible();
  const publishers = await panel.locator('ul.credits').first().locator('> li > b').allInnerTexts();
  expect(publishers.length).toBeGreaterThan(3);
  for (const p of publishers) expect(p, p).toMatch(/[A-Za-z]{4}/);
  await expect(panel.locator('li', { hasText: /^Likud:/ })).toHaveCount(1);
  await expect(panel.getByText('Wikimedia Commons', { exact: true })).toBeVisible();
  // logo credits lead with English; a Hebrew or Arabic name may follow only as a secondary note
  const credits = await panel.locator('ul.credits li > bdi > a').allInnerTexts();
  expect(credits.length).toBeGreaterThan(10);
  for (const c of credits) expect(c, c).toMatch(/^[^\u0590-\u05FF\u0600-\u06FF]*[A-Za-z]/);
  await expect(page.locator('a[href*="en.wikipedia.org"], a[href*="en.m.wikipedia.org"]')).toHaveCount(0);
  for (const name of ['election data', 'localities', 'all sources']) {
    const href = await panel.getByRole('link', { name, exact: true }).getAttribute('href');
    expect((await page.request.get(href!)).ok(), href!).toBe(true);
  }
});

test('Hebrew counts keep their order and About reads as a timeline', async ({ page }) => {
  await open(page, 'he', 'k26');
  await sourcesTab(page, 'he');
  const panel = page.locator('#analysis-panel');
  await expect(panel.getByText('מועמדים בנתונים', { exact: true })).toBeVisible();
  await page.locator('details.election-about > summary').click();
  const dates = await page.locator('details.election-about li > time').evaluateAll(ts => ts.map(t => t.getAttribute('datetime')!));
  expect(dates.length).toBeGreaterThan(3);
  const rest = dates.slice(1);
  expect(rest).toEqual([...rest].sort());
});

test('Hebrew: the page does not move when the source list arrives late', async ({ page }) => {
  await page.route('**/data/sources.json', async route => { await new Promise(r => setTimeout(r, 800)); await route.continue(); });
  await open(page, 'he', 'k26');
  await sourcesTab(page, 'he');
  const panel = page.locator('#analysis-panel');
  const note = panel.getByRole('button', { name: 'נתונים של היישום' });
  await expect(note).toBeVisible();
  const before = (await note.boundingBox())!.y;
  await page.waitForTimeout(1200);
  expect((await note.boundingBox())!.y).toBe(before);
  await expect(panel.locator('ul.credits').first().locator('> li').first()).toBeVisible();
});
