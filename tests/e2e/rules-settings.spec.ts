import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';

const start = async (page: Page, level = 'expert', lang = 'en') => {
  await page.addInitScript(([level, lang]) => {
    if (!sessionStorage.getItem('rules-start')) {
      localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level, theme: 'light', hintDismissed: true }));
      localStorage.setItem('israel-elections:preferences', '{}');
      sessionStorage.setItem('rules-start', '1');
    }
  }, [level, lang]);
  await page.goto('/');
};
const openRules = (page: Page) => page.getByRole('tab', { name: 'Rules', exact: true }).click();
const election = (page: Page, id: string) => choose(page.getByRole('button', { name: 'Election', exact: true }), id);

test('settings sit in their own card, apart from the scenario rules', async ({ page }) => {
  await start(page); await openRules(page);
  await page.getByRole('button', { name: 'Settings…', exact: true }).click();
  const settings = page.getByRole('dialog', { name: 'Settings', exact: true });
  await expect(settings).toBeVisible();
  for (const name of ['Votes come from', 'Mark changes since']) await expect(settings.getByRole('group', { name, exact: true })).toBeVisible();
  await expect(settings.getByRole('group', { name: 'Max decimal places', exact: true })).toBeVisible();
  await expect(settings.getByRole('group', { name: 'Joint-list seats', exact: true })).toBeVisible();
  // rules are not in the settings card, settings are not among the rules
  await expect(settings.getByRole('textbox', { name: 'Threshold %' })).toHaveCount(0);
  await expect(page.locator('.rules-fields').getByRole('button', { name: 'Votes come from' })).toHaveCount(0);
});

test('a "For this list" answer is listed in Settings and Ask again makes the edit ask again', async ({ page }) => {
  await start(page);
  await page.locator('.lb-row').first().click();
  const inc = page.getByRole('button', { name: 'Increase Votes', exact: true });
  await inc.click();
  const ask = page.locator('.source-ask');
  await ask.getByRole('combobox').selectOption('new');
  await ask.getByRole('radio', { name: 'For this list', exact: true }).check();
  await ask.getByRole('button', { name: 'Apply', exact: true }).click();
  await inc.click(); await expect(ask).toBeHidden();
  await page.locator('.band').getByRole('button', { name: 'Settings', exact: true }).click();
  await page.locator('[data-setting="voteSource"]').getByRole('button', { name: 'Remembered for 1' }).click();
  const items = page.getByRole('list', { name: 'Votes come from · For one list or bloc' });
  await expect(items.getByRole('listitem')).toHaveCount(1);
  await expect(items).toContainText('Likud (2026 · 26th Knesset): New voters');
  await expect(page.getByRole('group', { name: 'Votes come from', exact: true }).getByRole('button', { name: 'Ask', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await items.getByRole('button', { name: /^Ask again for Likud/ }).click();
  await expect(items).toHaveCount(0);
  await page.keyboard.press('Escape');
  // the board keeps its selection: Likud's panel is open again
  await page.getByRole('tab', { name: 'Overview', exact: true }).click();
  await inc.click(); await expect(ask).toBeVisible();
});

test('each era shows its own law: names, era rules and threshold timeline', async ({ page }) => {
  await start(page); await openRules(page);
  const law = page.locator('.rules-law');
  await expect(law).toContainText('2014 · Bader–Ofer · 3.25% threshold');
  const eras = page.getByRole('group', { name: 'Thresholds by era' });
  await expect(eras.getByRole('button')).toHaveText(['0%1949', '1%1951–1988', '1.5%1992–2003', '2%2006–2013', '3.25%2015–2026']);
  await expect(eras.getByRole('button', { name: '3.25% (2015–2026)' })).toHaveAttribute('aria-pressed', 'true');
  // a locked field looks locked
  const threshold = page.getByRole('textbox', { name: 'Threshold %', exact: true });
  await expect(threshold).toBeDisabled();
  expect(Number(await threshold.evaluate(e => getComputedStyle(e).opacity))).toBeLessThan(1);
  await threshold.click({ force: true }); await page.keyboard.type('5'); await expect(threshold).toHaveValue('3.25');
  await expect(page.getByText('Locked to the law: choose Experimental to change', { exact: true })).toBeVisible();
  // sibling steppers on the page share one width (turnout, registered, invalid)
  const widths = await page.locator('.rules-page .numeric-stepper').evaluateAll(els => els.map(e => Math.round(e.getBoundingClientRect().width)));
  expect(new Set(widths).size).toBe(1);

  await election(page, 'k1'); await openRules(page);
  await expect(law).toContainText('1949 · Highest averages · No percentage threshold');
  await expect(page.locator('select[aria-labelledby="remainder-method-label"] option:checked')).toHaveText('Highest averages (1949 law)');
  await expect(page.getByRole('checkbox', { name: /Remainder seats only for lists with a whole quota/ })).toBeChecked();
  await expect(eras.getByRole('button', { name: '0% (1949)' })).toHaveAttribute('aria-pressed', 'true');

  await election(page, 'k5'); await openRules(page);
  await expect(page.locator('select[aria-labelledby="remainder-method-label"] option:checked')).toHaveText('Largest remainder (1951–1969 law)');
  await expect(page.getByRole('checkbox', { name: /At most one remainder seat per list/ })).toBeChecked();

  await election(page, 'k9'); await openRules(page);
  await expect(law).toContainText('Candidate cap (inferred)');
  await expect(page.getByRole('checkbox', { name: /No more seats than candidates/ })).toBeChecked();
});

test('an experimental rule edit is marked at its own field, and the era timeline sets the threshold', async ({ page }) => {
  await start(page); await openRules(page);
  await page.getByRole('button', { name: 'Experimental', exact: true }).click();
  await page.getByRole('group', { name: 'Thresholds by era' }).getByRole('button', { name: '1.5% (1992–2003)' }).click();
  await expect(page.getByRole('textbox', { name: 'Threshold %', exact: true })).toHaveValue('1.5');
  const field = page.locator('label.field', { has: page.getByRole('textbox', { name: 'Threshold %', exact: true }) });
  await expect(field.locator('.edit-marker')).toHaveCount(1);
  // one marker per change, not a row of anonymous ones beside the heading
  await expect(page.locator('.rules-page .part-edits .edit-marker')).toHaveCount(0);
});

test('Max decimal places is 0·1·2·3 at every level and works (1 at Simple by default)', async ({ page }) => {
  await page.addInitScript(() => localStorage.removeItem('israel-elections:settings'));
  await start(page, 'simple');
  await page.locator('.band').getByRole('button', { name: 'Settings', exact: true }).click();
  const decimals = page.getByRole('group', { name: 'Max decimal places', exact: true });
  await expect(decimals.getByRole('button')).toHaveText(['0', '1', '2', '3']);
  await expect(decimals.getByRole('button', { name: '1', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await decimals.getByRole('button', { name: '3', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.lb-row').first()).toContainText(/\d\.\d{3}%/);
});

test('Hebrew: the tab and settings are named in Hebrew and the era timeline still runs left to right', async ({ page }) => {
  await start(page, 'expert', 'he');
  await page.getByRole('tab', { name: 'כללים', exact: true }).click();
  await page.getByRole('button', { name: 'הגדרות…', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'הגדרות', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  const buttons = page.getByRole('group', { name: 'אחוזי חסימה לפי תקופה' }).getByRole('button');
  const first = (await buttons.first().boundingBox())!, last = (await buttons.last().boundingBox())!;
  expect(first.x).toBeLessThan(last.x);
  await expect(buttons.first()).toContainText('1949');
});

test('re-choosing what is already in force is not an edit', async ({ page }) => {
  await start(page); await openRules(page);
  const mode = page.getByRole('group', { name: 'Simulation mode' });
  const undo = page.locator('.band').getByRole('button', { name: /^Undo/ });
  await mode.getByRole('button', { name: 'Historically valid', exact: true }).click();
  await expect(undo).toBeDisabled();
  await mode.getByRole('button', { name: 'Experimental', exact: true }).click();
  await expect(undo).toHaveAccessibleName(/^Undo: /);
  const log = () => page.evaluate(() => document.querySelector('.band button[aria-label^="Undo"]')?.getAttribute('aria-label'));
  const before = await log();
  await mode.getByRole('button', { name: 'Experimental', exact: true }).click();
  await page.getByRole('button', { name: '3.25% (2015–2026)' }).click();
  const threshold = page.getByRole('textbox', { name: 'Threshold %', exact: true });
  await threshold.fill('3.25%'); await threshold.press('Enter');
  await page.getByRole('combobox', { name: 'Remainder method' }).selectOption('bader-ofer');
  expect(await log()).toBe(before);
  await undo.click();
  await expect(undo).toBeDisabled();
});
