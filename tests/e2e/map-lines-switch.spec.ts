// The Localities map's lines: one "All lines and areas" box over the 12 single boxes (a dash when only some are on),
// remembered on this device, and the same switch in Settings → Analysis. The lines themselves do not change.
import { expect, test, type Page } from '@playwright/test';

const open = async (page: Page, lang: 'en' | 'he' = 'en', values: Record<string, unknown> = {}) => {
  await page.addInitScript(([lang, values]) => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert' }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { theme: 'light', starterTip: false, ...values } }));
  }, [lang, values] as const);
  await page.route('https://tiles.openfreemap.org/**', route => route.abort());
  await page.goto('/');
  await page.locator('#tab-loc').click();
  await expect(page.locator('.leaflet-verified-lines-pane')).toBeAttached();
};
const key = (page: Page) => page.getByRole('group', { name: /^(Lines and areas|קווים ושטחים)$/ });
const all = (page: Page) => key(page).getByRole('checkbox', { name: /^(All lines and areas|כל הקווים והשטחים)$/ });
const settingsButton = (page: Page, name: string) => page.locator(`.band button[aria-haspopup="dialog"][aria-label="${name}"]`);
const paths = (page: Page) => page.locator('.leaflet-verified-lines-pane svg > g path');

test('one box hides or shows every line; a dash when only some are on', async ({ page }) => {
  await open(page);
  await expect(all(page)).toBeChecked();
  await expect(paths(page).first()).toBeAttached();
  await all(page).uncheck();
  await expect(paths(page)).toHaveCount(0);
  for (const box of await key(page).getByRole('checkbox').all()) await expect(box).not.toBeChecked();
  // one line back: only it shows, and the All box shows a dash
  await key(page).getByRole('checkbox', { name: 'Lebanon · Blue Line', exact: true }).check();
  await expect(paths(page).first()).toBeAttached();
  await expect(all(page)).toHaveJSProperty('indeterminate', true);
  // the dash, clicked, turns every line on again
  await all(page).click();
  await expect(all(page)).toBeChecked();
  await expect(all(page)).toHaveJSProperty('indeterminate', false);
  await expect(key(page).getByRole('checkbox', { name: 'Golan · 1974 Alpha line', exact: true })).toBeChecked();
  // unticking the last line on leaves the All box empty, not dashed
  await all(page).uncheck();
  await key(page).getByRole('checkbox', { name: 'Golan · area of separation', exact: true }).check();
  await key(page).getByRole('checkbox', { name: 'Golan · area of separation', exact: true }).uncheck();
  await expect(all(page)).not.toBeChecked();
  await expect(all(page)).toHaveJSProperty('indeterminate', false);
});

test('the ticks are remembered on this device: after leaving the map and after a reload', async ({ page }) => {
  await open(page);
  await key(page).getByRole('checkbox', { name: 'Golan · 1974 Alpha line', exact: true }).uncheck();
  await key(page).getByRole('checkbox', { name: 'Golan · 1974 Bravo line', exact: true }).uncheck();
  await page.locator('#tab-board').click();
  await page.locator('#tab-loc').click();
  await expect(key(page).getByRole('checkbox', { name: 'Golan · 1974 Alpha line', exact: true })).not.toBeChecked();
  await expect(all(page)).toHaveJSProperty('indeterminate', true);
  await page.reload();
  await page.locator('#tab-loc').click();
  await expect(key(page).getByRole('checkbox', { name: 'Golan · 1974 Bravo line', exact: true })).not.toBeChecked();
  await expect(key(page).getByRole('checkbox', { name: 'Lebanon · Blue Line', exact: true })).toBeChecked();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('israel-elections:settings')!).values);
  expect(stored).toMatchObject({ mapLines: true, mapLinesOff: ['golan-alpha', 'golan-bravo'] });
});

test('Settings has the same switch: off there, the map opens clean; the key follows, and back', async ({ page }) => {
  await open(page, 'he');
  await settingsButton(page, 'הגדרות').click();
  const dialog = page.getByRole('dialog');
  const row = dialog.locator('[data-setting="mapLines"]');
  await expect(row).toContainText('קווים ושטחים במפה');
  const toggle = row.getByRole('checkbox');
  await expect(toggle).toBeChecked();
  await toggle.uncheck();
  await page.keyboard.press('Escape');
  await expect(paths(page)).toHaveCount(0);
  await expect(all(page)).not.toBeChecked();
  await page.reload();
  await page.locator('#tab-loc').click();
  await expect(all(page)).not.toBeChecked();
  await expect(paths(page)).toHaveCount(0);
  // the key's box turns the Settings switch back on
  await all(page).check();
  await settingsButton(page, 'הגדרות').click();
  await expect(page.getByRole('dialog').locator('[data-setting="mapLines"]').getByRole('checkbox')).toBeChecked();
});

test('a single line unticked in the key marks the Settings row as changed, and its Reset brings it back', async ({ page }) => {
  await open(page, 'en', { mapLines: true, mapLinesOff: ['blue-line'] });
  await expect(all(page)).toHaveJSProperty('indeterminate', true);
  await settingsButton(page, 'Settings').click();
  const row = page.getByRole('dialog').locator('[data-setting="mapLines"]');
  // a single line unticked counts as a change to the row
  await expect(row.locator('.ps-dot')).toHaveText('•');
  // and the Analysis group's Reset brings it back
  await row.locator('xpath=ancestor::section[1]').locator('.ps-reset').click();
  await expect(row.locator('.ps-dot')).toHaveText('');
  await page.keyboard.press('Escape');
  await expect(key(page).getByRole('checkbox', { name: 'Lebanon · Blue Line', exact: true })).toBeChecked();
  await expect(all(page)).toBeChecked();
});
