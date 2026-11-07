import { expect, test, type Page } from '@playwright/test';

const start = (page: Page, lang: 'en' | 'he', width = 1500) => page.setViewportSize({ width, height: 1000 }).then(() =>
  page.addInitScript((lang) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({ lang, level: 'standard', hintDismissed: true })); sessionStorage.setItem('seeded', '1'); } }, lang));
const top = (page: Page, selector: string, nth = 0) => page.locator(selector).nth(nth).evaluate((el) =>
  Math.round(el.getBoundingClientRect().top - document.querySelector('.coal')!.getBoundingClientRect().top));

for (const lang of ['en', 'he'] as const) for (const width of [1500, 390]) {
  test(`coalitions: choosing and inspecting never moves what was clicked ${lang} ${width}`, async ({ page }) => {
    await start(page, lang, width);
    await page.goto('/');
    await page.getByRole('tab', { name: lang === 'he' ? 'קואליציות' : 'Coalitions', exact: true }).click();
    await expect(page.locator('.coal-choice').first()).toBeVisible();
    // Every party card keeps In/Out/Any beside its name, including the compact phone layout (QA2 CO1).
    const layout = await page.locator('.coal-choice').evaluateAll((cards) => cards.map((c) => {
      const who = c.querySelector('.coal-who')!.getBoundingClientRect(), seg = c.querySelector('.seg')!.getBoundingClientRect();
      return seg.top >= who.bottom - 1 ? 'below' : 'beside';
    }));
    expect(new Set(layout).size).toBe(1);
    expect(layout[0]).toBe('beside');
    // the first In/Out adds its reset beside the instruction, not a new line above the cards
    const card = await top(page, '.coal-choice', 2);
    await page.locator('.coal-choice').first().getByRole('button', { name: lang === 'he' ? 'בפנים' : 'In', exact: true }).click();
    await expect(page.locator('.coal-head').getByRole('button', { name: lang === 'he' ? 'ניקוי הקואליציה' : 'Clear the coalition', exact: true })).toBeVisible();
    await expect(page.locator('.coal-head').getByRole('button', { name: lang === 'he' ? 'הקואליציה הרשמית' : 'Official coalition', exact: true })).toHaveCount(0);
    expect(await top(page, '.coal-choice', 2)).toBe(card);
    // a chosen coalition opens beneath its own row; the row and its row-mates stay where they were
    const rows = page.locator('.coal-list > li:not(.coal-detail) > button');
    const before = [await top(page, '.coal-list > li:not(.coal-detail)', 3), await top(page, '.coal-list > li:not(.coal-detail)', 4)];
    await rows.nth(3).click();
    await expect(page.locator('.coal-detail')).toHaveCount(1);
    expect(await top(page, '.coal-list > li:not(.coal-detail)', 3)).toBe(before[0]);
    if (width > 760) expect(await top(page, '.coal-list > li:not(.coal-detail)', 4)).toBe(before[1]);
    const detail = await page.locator('.coal-detail').boundingBox(), row = await rows.nth(3).boundingBox();
    expect(detail!.y).toBeGreaterThanOrEqual(row!.y + row!.height - 1);
    // every partner of a smallest winning coalition is pivotal, so the word is not repeated on each
    await expect(page.locator('.coal-detail')).not.toContainText(lang === 'he' ? 'חיונית לרוב' : 'Pivotal');
    // choosing it again closes it; other coalitions stay selectable
    await rows.nth(3).click();
    await expect(page.locator('.coal-detail')).toHaveCount(0);
    await rows.nth(5).click();
    await expect(rows.nth(5)).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('coalitions: In lists that already win are said to win, not "no coalition fits"', async ({ page }) => {
  await start(page, 'en');
  await page.goto('/');
  await page.getByRole('tab', { name: 'Coalitions', exact: true }).click();
  // 2026: Likud 27, Yashar! 21, Together 12, Joint List 11, The Democrats 8 = 79; any one can leave and 61 remain
  for (const i of [0, 1, 2, 3, 4]) await page.locator('.coal-choice').nth(i).getByRole('button', { name: 'In', exact: true }).click();
  await expect(page.locator('.coal-now .majority-readout')).toHaveText('79 / 120 · 18 above 61');
  await expect(page.locator('.coal-list > li')).toHaveCount(0);
  await expect(page.locator('.coal')).toContainText('Your In lists already have a majority, with lists to spare.');
  await expect(page.locator('.coal')).not.toContainText('No winning coalition fits');
});

test('scenarios: Save shows state — nothing to save, unsaved, saved', async ({ page }) => {
  await start(page, 'en');
  await page.goto('/');
  await page.getByRole('tab', { name: 'Scenarios', exact: true }).click();
  const current = page.locator('.scn-current');
  await expect(current.locator('h3')).toContainText('Official result');
  await expect(current.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
  await expect(current.getByRole('button', { name: 'Duplicate', exact: true })).toBeDisabled();
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Trial');
  await page.getByRole('textbox', { name: 'Name', exact: true }).press('Enter');
  await expect(current.locator('h3')).toContainText('This scenario');
  const save = current.locator('.scn-save');
  const x = (await page.locator('.scn-current > .row > .btn').nth(1).boundingBox())!.x;
  await save.click();
  await expect(save).toHaveText('Saved');
  await expect(save).toBeDisabled();
  expect((await page.locator('.scn-current > .row > .btn').nth(1).boundingBox())!.x).toBe(x);
  await page.getByRole('textbox', { name: 'Description', exact: true }).fill('More');
  await page.getByRole('textbox', { name: 'Description', exact: true }).press('Tab');
  await expect(save).toHaveText('Save');
  await expect(save).toBeEnabled();
  // the saved card names the scenario beside its colour, on one line of actions
  const card = page.locator('.scn-cards .scn-card').first();
  await expect(card.locator('.scn-title b')).toHaveText('Trial *');
  const tops = await card.locator('.row > .btn').evaluateAll((b) => new Set(b.map((x) => Math.round(x.getBoundingClientRect().top))).size);
  expect(tops).toBe(1);
});

test('community gallery never calls the GitHub API and honours Retry-After across reloads', async ({ page }) => {
  await start(page, 'en');
  const api: string[] = [], index: string[] = [];
  page.on('request', (r) => { if (r.url().includes('api.github.com')) api.push(r.url()); });
  await page.route('**/data/scenarios.json', (route) => { index.push(route.request().url()); return route.fulfill({ status: 429, headers: { 'Retry-After': '1800' }, body: '' }); });
  await page.goto('/');
  await page.getByRole('tab', { name: 'Scenarios', exact: true }).click();
  await expect(page.locator('.scenario-gallery [role="alert"]')).toContainText('Too many requests. Trying again after');
  expect(index).toHaveLength(1);
  await page.reload();
  await page.getByRole('tab', { name: 'Scenarios', exact: true }).click();
  await expect(page.locator('.scenario-gallery [role="alert"]')).toContainText('Too many requests');
  expect(index).toHaveLength(1);
  await page.unroute('**/data/scenarios.json');
  await page.route('**/data/scenarios.json', (route) => route.fulfill({ status: 404, body: '' }));
  await page.evaluate(() => localStorage.removeItem('israel-elections:gallery:retry:v1'));
  await page.reload();
  await page.getByRole('tab', { name: 'Scenarios', exact: true }).click();
  await expect(page.locator('.scenario-gallery [role="alert"]')).toContainText('Could not load community scenarios');
  expect(api).toEqual([]);
});
