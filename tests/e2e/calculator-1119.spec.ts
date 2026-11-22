// Compare and calculator decisions of 19 Nov 2026: Compare opens on this election's official result once the work is
// edited; no seat change mark beside a row while comparing; the Copy votes box's "Set as default" and "Don't ask
// again" (copies at once, Undo, "Ask next time", Settings); the first election failing to load shows only the error;
// the What if line writes its total once; the turnout line above All elections keeps the field's two decimals.
import { expect, test, type Page } from './fixtures';

async function start(page: Page, { lang = 'en', level = 'standard', settings = {} }: { lang?: 'en' | 'he'; level?: string; settings?: Record<string, unknown> } = {}) {
  await page.setViewportSize({ width: 1500, height: 1000 });
  await page.addInitScript(([lang, level, settings]) => {
    if (sessionStorage.getItem('started')) return;
    sessionStorage.setItem('started', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false, decimals: 2, ...(settings as object) } }));
    localStorage.setItem('israel-elections:preferences', JSON.stringify({ voteSource: 'proportional', comparison: 'reference', jointSeats: 'off' }));
  }, [lang, level, settings] as const);
}
const ready = async (page: Page) => { await page.goto('/'); await expect(page.locator('.lb-row').first()).toBeVisible(); };
const picker = (page: Page) => page.locator('.cmpm-strip').getByRole('button', { name: /^Compare with(: |$)/ });
const likud = (page: Page) => page.locator('.lb-row').filter({ hasText: 'Likud' }).first();
async function addVotes(page: Page, name: string, n: number) {
  await page.locator('.lb-row').filter({ hasText: name }).first().click();
  const votes = page.locator('.side-panel').getByRole('textbox', { name: 'Votes', exact: true });
  const v = Number((await votes.inputValue()).replace(/[^0-9]/g, ''));
  await votes.fill(String(v + n)); await votes.press('Enter');
  await expect(page.locator('.session').getByRole('button', { name: /^Undo:/ })).toBeEnabled();
  await page.keyboard.press('Escape');
}

test('Compare opens on the previous election until something is edited, then on the official result', async ({ page }) => {
  await start(page); await ready(page);
  await page.locator('.compare-on').click();
  await expect(picker(page)).toHaveAttribute('data-value', 'prev');
  await page.locator('.cmpm-strip').getByRole('button', { name: 'Stop comparing', exact: true }).click();
  await addVotes(page, 'Likud', 80_000);
  // the edit's own mark beside the seat count, before comparing
  await expect(likud(page).locator('.lb-seats .seat-delta')).toBeVisible();
  await page.locator('.compare-on').click();
  await expect(picker(page)).toHaveAttribute('data-value', 'official');
  // while comparing the row has no change mark of its own: only the comparison line, which names what it compares with
  await expect(page.locator('.lbars .lb-seats .seat-delta')).toHaveCount(0);
  await expect(page.locator('.lbars .delta-segment')).toHaveCount(0);
});

test('Settings "Previous election" wins over an edit', async ({ page }) => {
  await start(page, { settings: { compareWith: 'previous' } }); await ready(page);
  await addVotes(page, 'Likud', 80_000);
  await page.locator('.compare-on').click();
  await expect(picker(page)).toHaveAttribute('data-value', 'prev');
});

test('Copy votes: Set as default with Don\'t ask again copies at once; Undo and Ask next time take it back', async ({ page }) => {
  await start(page); await ready(page);
  await page.locator('.compare-on').click();
  await expect(picker(page)).toHaveAttribute('data-value', 'prev');
  const box = page.locator('.cmpm-copy');
  await page.getByRole('button', { name: /^Copy votes from .*: Likud$/ }).click();
  await expect(box).toBeVisible();
  const dontAsk = box.getByRole('checkbox', { name: 'Don’t ask again', exact: true });
  // only with a default: off and greyed out until "Set as default" is chosen
  await box.getByRole('radio', { name: 'Just this once', exact: true }).check();
  await expect(dontAsk).toBeDisabled();
  await box.getByRole('radio', { name: 'Set as default', exact: true }).check();
  await expect(dontAsk).toBeEnabled();
  await dontAsk.check();
  await box.getByRole('button', { name: /^Copy into / }).click();
  await expect(box).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('israel-elections:settings')!).values.copyAskEachTime)).toBe(false);

  // the next copy happens at once, says so, and Undo takes it back
  const undo = page.locator('.session').getByRole('button', { name: /^Undo:/ });
  const before = await undo.getAttribute('aria-label');
  await page.getByRole('button', { name: /^Copy votes from .*: Yisrael Beiteinu$/ }).click();
  await expect(box).toHaveCount(0);
  const toast = page.locator('.toast').filter({ hasText: 'Copied at once with your default' });
  await expect(toast).toContainText('Undo takes it back');
  await expect(undo).not.toHaveAttribute('aria-label', before!);
  // the toast's way back: ask again from the next copy
  await toast.getByRole('button', { name: 'Ask next time', exact: true }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('israel-elections:settings')!).values.copyAskEachTime)).toBe(true);
  await page.getByRole('button', { name: /^Copy votes from .*: Shas$/ }).click();
  await expect(box).toBeVisible();
  // the box opens preset on the default method; this time's answer is not stored unless chosen again
  await expect(box.getByRole('radio', { name: /^Number of votes/ })).toBeChecked();
  await expect(box.getByRole('checkbox', { name: 'Adjust for the number of eligible voters' })).toBeChecked();
  await expect(box.getByRole('radio', { name: 'Just this once', exact: true })).toBeChecked();
  await expect(box.getByRole('checkbox', { name: 'Don’t ask again', exact: true })).not.toBeChecked();
});

test('Simple keeps Side by side in the Compare strip', async ({ page }) => {
  await start(page, { level: 'simple' }); await ready(page);
  await page.locator('.compare-on').click();
  await expect(page.locator('.cmpm-strip').getByRole('button', { name: 'Side by side', exact: true })).toBeVisible();
});

test('Settings has the row that turns asking back on', async ({ page }) => {
  await start(page, { settings: { copyAskEachTime: false } }); await ready(page);
  await page.locator('.band').getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Find a setting' }).fill('ask each time');
  await expect(page.getByText('Copy votes: ask each time', { exact: true }).first()).toBeVisible();
});

test('the first election failing to load shows only the error, with Try again and another election', async ({ page }) => {
  await start(page);
  let fail = true;
  await page.route('**/data/k26.json', (r) => fail ? r.fulfill({ status: 503, body: '' }) : r.continue());
  await page.goto('/');
  const error = page.locator('.load-failed');
  await expect(error).toBeVisible();
  await expect(error.getByRole('heading')).toContainText('could not be loaded');
  await expect(error.getByRole('heading')).toContainText('2026');
  // no other election fills the screen
  await expect(page.locator('.lb-row')).toHaveCount(0);
  await expect(page.locator('.band .election-navigation .choice-trigger')).toHaveAttribute('data-value', 'k26');
  await error.getByRole('button', { name: 'Open another election', exact: true }).click();
  await expect(page.locator('.election-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  fail = false;
  await error.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.locator('.lb-row').first()).toBeVisible();
  await expect(page.locator('.load-failed')).toHaveCount(0);
});

test('What if writes a government\'s total once when it equals the votes for', async ({ page }) => {
  await start(page, { level: 'expert' }); await ready(page);
  await page.locator('#tab-whatif').click();
  const row = page.locator('.wi-row').filter({ hasText: 'outside support' }).first();
  await expect(row).toBeVisible();
  await expect(row).toContainText(/outside support = \d+ for · \d+ against/);
  await expect(row).not.toContainText(/= \d+ · \d+ for/);
});

test('the turnout line above All elections keeps the field\'s two decimals whatever the decimals setting', async ({ page }) => {
  await start(page, { level: 'expert', settings: { decimals: 1 } }); await ready(page);
  await page.locator('#tab-turnout').click();
  await expect(page.locator('.tn-readout')).toContainText(/Turnout \d+\.\d\d%/);
});
