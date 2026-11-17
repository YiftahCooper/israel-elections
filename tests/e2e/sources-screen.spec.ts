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
  // the project's own transcriptions are listed apart, in plain words, with no file path
  const own = panel.locator('.sources-own');
  await expect(own.getByRole('heading', { name: 'Typed in by this project' })).toBeVisible();
  await expect(own.locator('li').first()).toContainText('typed in from the official results gazette');
  for (const list of [panel.locator('ul.credits').first(), own]) await expect(list).not.toContainText(/data\/raw\/|Project record|decision \d{4}|\bCEC\b|\bYP \d|OData|mirror/);
  await expect(panel.locator('.chip.secondary', { hasText: 'secondary' }).first()).toBeVisible();
  // 1949's sources are all official; its secondary records were the project's own transcriptions, now listed apart
  const kinds = await panel.locator('ul.credits').first().locator('> li .chip').allInnerTexts();
  expect(kinds.length).toBeGreaterThan(3);
  expect(kinds.every(k => k === 'official')).toBe(true);
  // the locality download is offered only where locality data exists
  await expect(panel.getByRole('button', { name: 'localities', exact: true })).toHaveCount(0);
  await expect(panel.getByRole('link', { name: 'original Central Elections Committee names', exact: true })).toHaveCount(0);
});

test('k9: official sources are listed before secondary ones', async ({ page }) => {
  await open(page, 'en', 'k9');
  await sourcesTab(page, 'en');
  const list = page.locator('#analysis-panel ul.credits').first();
  await expect(list.locator('> li .chip').first()).toBeVisible();
  const kinds = await list.locator('> li .chip').allInnerTexts();
  expect(kinds.indexOf('secondary')).toBeGreaterThan(-1);
  expect(kinds.slice(kinds.indexOf('secondary')).every(k => k === 'secondary')).toBe(true);
});

test('k1 in Hebrew: the project’s own transcriptions are described in Hebrew, apart from the sources', async ({ page }) => {
  await open(page, 'he', 'k1');
  await sourcesTab(page, 'he');
  const panel = page.locator('#analysis-panel');
  const own = panel.locator('.sources-own');
  await expect(own.getByRole('heading', { name: 'הוקלד בפרויקט' })).toBeVisible();
  await expect(own.locator('li').first()).toContainText('כפי שהוקלדו מהפרסום הרשמי של התוצאות');
  await expect(own).not.toContainText(/[A-Za-z]{4}/);
  await expect(panel.locator('ul.credits').first()).not.toContainText(/data\/raw\/|ראו החלטה|OData/);
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
  for (const name of ['election data', 'original Central Elections Committee names', 'all sources']) {
    const href = await panel.getByRole('link', { name, exact: true }).getAttribute('href');
    expect((await page.request.get(href!)).ok(), href!).toBe(true);
  }
  const pending = page.waitForEvent('download');
  await panel.getByRole('button', { name: 'localities', exact: true }).click();
  const downloaded = await pending;
  expect(downloaded.suggestedFilename()).toBe('k26-localities-display.json');
  const { readFile } = await import('node:fs/promises');
  const exported = JSON.parse(await readFile((await downloaded.path())!, 'utf8'));
  const locality = exported.rows.find((r: {code:number}) => r.code === 964);
  expect(locality.nameHe).toBe('קודייראת א-צאנע (שבט)');
  expect(locality.cecNameHe).toBe('קודייראת א-צאנע(שבט)');
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
  const note = panel.getByRole('button', { name: 'נתונים של האפליקציה' });
  await expect(note).toBeVisible();
  const before = (await note.boundingBox())!.y;
  await page.waitForTimeout(1200);
  expect((await note.boundingBox())!.y).toBe(before);
  await expect(panel.locator('ul.credits').first().locator('> li').first()).toBeVisible();
});
