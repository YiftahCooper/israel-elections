// Three small headings over the tab row ("Your scenario", "What happened", "How it works"): every tab stays one click
// away, each heading names a tab list of its own, levels and Custom keep working, and phones get three buttons.
import { expect, test, type Page } from '@playwright/test';
import { TOOL_FEATURES } from '../../src/app/features.ts';
import { TAB_GROUP } from '../../src/app/tabGroups.ts';

const open = async (page: Page, { lang = 'en', level = 'expert', width = 1500, customFeatures }: { lang?: string; level?: string; width?: number; customFeatures?: Record<string, string> } = {}) => {
  await page.setViewportSize({ width, height: 900 });
  await page.addInitScript(([lang, level, customFeatures]) => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level, ...(customFeatures ? { customFeatures } : {}) }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { theme: 'light', starterTip: false } }));
  }, [lang, level, customFeatures ?? null] as const);
  await page.goto('/');
  await expect(page.locator('#tab-board')).toBeVisible();
};
const tools = (page: Page) => page.getByRole('navigation', { name: /^(Tools|כלים)$/ });
const list = (page: Page, name: string) => tools(page).getByRole('tablist', { name, exact: true });
const ids = (page: Page, name: string) => list(page, name).getByRole('tab').evaluateAll(es => es.map(e => e.id.replace('tab-', '')));

test('three headings group every tab; on a laptop every tab is in view', async ({ page }) => {
  await open(page);
  await expect(tools(page).getByRole('tablist')).toHaveCount(3);
  expect(await ids(page, 'Your scenario')).toEqual(['board', 'scenarios', 'whatif', 'coal', 'structure', 'compare', 'security', 'charts', 'turnout', 'sens'].filter(id => TOOL_FEATURES.some(f => f[0] === id)));
  expect(await ids(page, 'What happened')).toEqual(['after', 'families', 'loc', 'sources']);
  expect(await ids(page, 'How it works')).toEqual(['walk', 'rules']);
  await expect(tools(page).getByRole('tab')).toHaveCount(TOOL_FEATURES.length);
  for (const tab of await tools(page).getByRole('tab').all()) await expect(tab).toBeInViewport({ ratio: 1 });
  // the headings are labels, not tabs or buttons
  await expect(tools(page).getByRole('tab', { name: 'What happened' })).toHaveCount(0);
  await expect(page.locator('.tab-jumps')).toBeHidden();
});

test('every tool has a heading', async () => {
  for (const [id] of TOOL_FEATURES) expect(TAB_GROUP[id], id).toBeTruthy();
});

test('Simple: tools of other levels stay under their own heading, muted, after “More in other levels”', async ({ page }) => {
  await open(page, { level: 'simple' });
  expect(await ids(page, 'What happened')).toEqual(['after', 'families', 'sources', 'loc']);
  expect(await ids(page, 'How it works')).toEqual(['walk', 'rules']);
  const happened = page.locator('[data-tab-group="happened"]');
  await expect(happened.locator('.more-label')).toHaveText('More in other levels');
  await expect(page.locator('#tab-loc')).toHaveClass(/locked/);
  await expect(page.locator('#tab-loc')).toHaveAccessibleName('Localities (Expert)');
  for (const tab of await tools(page).getByRole('tab').all()) await expect(tab).toBeInViewport({ ratio: 1 });
  await page.locator('#tab-loc').click();
  await expect(page.locator('#tab-loc')).toHaveAttribute('aria-selected', 'true');
});

test('keyboard: one Tab stop for the strip; arrows cross headings; Home and End', async ({ page }) => {
  await open(page);
  await expect(tools(page).locator('[role=tab][tabindex="0"]')).toHaveCount(1);
  await page.locator('#tab-sens').click();
  await page.locator('#tab-sens').press('ArrowRight');
  await expect(page.locator('#tab-after')).toBeFocused();
  await expect(page.locator('#tab-after')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#tab-sens')).toHaveAttribute('tabindex', '-1');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#tab-sens')).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.locator('#tab-rules')).toBeFocused();
  await page.keyboard.press('Home');
  await expect(page.locator('#tab-board')).toBeFocused();
  await expect(tools(page).locator('[role=tab][tabindex="0"]')).toHaveCount(1);
});

test('Hebrew: the headings in Hebrew, the order mirrored', async ({ page }) => {
  await open(page, { lang: 'he' });
  await expect(list(page, 'התרחיש שלכם')).toBeVisible();
  await expect(list(page, 'מה קרה')).toBeVisible();
  await expect(list(page, 'איך זה עובד')).toBeVisible();
  const first = (await page.locator('[data-tab-group="scenario"]').boundingBox())!, second = (await page.locator('[data-tab-group="happened"]').boundingBox())!;
  expect(second.x).toBeLessThan(first.x);
  // ArrowLeft goes forward in Hebrew
  await page.locator('#tab-board').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#tab-scenarios')).toBeFocused();
});

test('Custom: a hidden tool leaves its heading; a heading with no tools left disappears', async ({ page }) => {
  await open(page, { customFeatures: { charts: 'hidden', walk: 'hidden', rules: 'hidden' } });
  await expect(page.locator('#tab-charts')).toHaveCount(0);
  await expect(list(page, 'Your scenario')).toBeVisible();
  await expect(list(page, 'How it works')).toHaveCount(0);
  await expect(tools(page).getByRole('tablist')).toHaveCount(2);
});

test('phone: three heading buttons above the sideways strip; each brings its tabs into view', async ({ page }) => {
  await open(page, { level: 'simple', width: 390, lang: 'he' });
  const jumps = page.locator('.tab-jumps button');
  await expect(jumps).toHaveText(['התרחיש שלכם', 'מה קרה', 'איך זה עובד']);
  await expect(jumps.first()).toHaveAttribute('data-current', '');
  await expect(page.locator('#tab-walk')).not.toBeInViewport();
  await jumps.last().click();
  await expect(page.locator('#tab-walk')).toBeInViewport({ ratio: 1 });
  // the tab lists keep their names for screen readers
  await expect(list(page, 'איך זה עובד')).toBeAttached();
  const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  expect(sw).toBeLessThanOrEqual(cw);
});
