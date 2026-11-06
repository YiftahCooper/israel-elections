import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';
// Release-candidate audit of the lists column and a list's editing controls.
async function start(page: Page, { lang = 'en', level = 'expert', election = 'k25' } = {}) {
  await page.addInitScript(v => localStorage.setItem('israel-elections:v1', JSON.stringify(v)), { lang, theme: 'light', level, hintDismissed: true });
  await page.goto('/');
  await expect(page.locator('.lb-row').first()).toBeVisible();
  await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), election);
}
const open = (page: Page, name: string) => page.getByRole('region', { name: /^(Lists|הרשימות)$/ }).getByRole('button', { name, exact: true }).click();

test('every goal shows the change it makes; Restore votes appears beside them once edited', async ({ page }) => {
  await start(page); await open(page, 'Likud');
  const goals = page.locator('.side-panel .vote-goals');
  await expect(goals.getByRole('button', { name: 'Reach next seat', exact: true })).toContainText('(+29,777)', { timeout: 30000 });
  await expect(goals.getByRole('button', { name: 'Fewest votes to keep 32 seats', exact: true })).toContainText(/\(−[\d,]+\)/);
  await expect(goals.getByRole('button', { name: 'Just below threshold', exact: true })).toContainText(/\(−[\d,]+\)/);
  await expect(goals.getByRole('button', { name: 'Restore votes' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Increase Votes', exact: true }).click();
  const restore = goals.getByRole('button', { name: 'Restore votes', exact: true });
  await expect(restore).toContainText('(−10,000)');
  await restore.click();
  await expect(page.locator('.side-panel').getByRole('textbox', { name: 'Votes', exact: true })).toHaveValue('1,115,336');
  await expect(restore).toHaveCount(0);
  await open(page, 'Meretz');
  await expect(goals.getByRole('button', { name: 'Cross the threshold', exact: true })).toContainText(/\(\+[\d,]+\)/, { timeout: 30000 });
});

test('the vote field steps with the keyboard, reads other digit sets, and says when an entry is not applied', async ({ page }) => {
  await start(page); await open(page, 'Likud');
  const votes = page.locator('.side-panel').getByRole('textbox', { name: 'Votes', exact: true });
  // a national election's default step is 10k: one press is the "add 10k votes" action
  await expect(page.getByRole('group', { name: 'Votes step size', exact: true }).getByRole('button', { name: '10k', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await votes.focus(); await page.keyboard.press('ArrowUp');
  await expect(votes).toHaveValue('1,125,336');
  await page.keyboard.press('PageDown');
  await expect(votes).toHaveValue('1,025,336');
  await votes.fill('١٢٠٠٠٠٠'); await votes.press('Enter');
  await expect(votes).toHaveValue('1,200,000');
  await votes.fill('-5'); await votes.press('Enter');
  await expect(votes).toHaveValue('1,200,000');
  await expect(votes).toHaveAttribute('aria-invalid', 'true');
  await votes.press('Tab');
  await expect(votes).toHaveAttribute('aria-invalid', 'true');
  await votes.fill('1.1m'); await votes.press('Enter');
  await expect(votes).toHaveValue('1,100,000');
  await expect(votes).not.toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByRole('button', { name: /^Undo: Likud: .*votes to the other lists$/ })).toBeVisible();
});

test('a small election defaults to a smaller step', async ({ page }) => {
  await start(page, { election: 'k1' }); await page.locator('.lb-row').first().click();
  await expect(page.getByRole('group', { name: 'Votes step size', exact: true }).getByRole('button', { name: '1k', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('a withdrawn list shows no threshold goals, no stale search and no threshold-crossing note; its row is marked once', async ({ page }) => {
  await start(page); await open(page, 'Likud');
  const panel = page.locator('.side-panel');
  await expect(panel.locator('.seat-search-status')).toContainText('+1 seat', { timeout: 30000 });
  await panel.getByText('Withdrawn from the race').click();
  await expect(panel.getByText(/This list has withdrawn/)).toBeVisible();
  await expect(panel.locator('.vote-goals, .seat-search-status')).toHaveCount(0);
  await expect(panel.locator('.crossing')).toHaveCount(0);
  await expect(panel.getByText('Below the threshold', { exact: true })).toHaveCount(0);
  await expect(panel.locator('.switch .edit-marker')).toHaveCount(1);
  await expect(panel.locator('.edit-marker[aria-label*="Held votes"]')).toHaveCount(0);
  await panel.getByRole('button', { name: 'Close', exact: true }).click();
  const row = page.locator('.lb-row').filter({ has: page.locator('.lb-name', { hasText: /^Likud/ }) });
  await expect(row).toBeVisible();
  await expect(row.locator('.edit-marker')).toHaveCount(1);
  await expect(row.locator('.lb-sub')).toContainText('withdrew');
  await expect(row.locator('.lb-sub')).not.toContainText('of the threshold');
});

test('surplus partners are named on each row and the mark is explained once', async ({ page }) => {
  await start(page, { level: 'standard' });
  await expect(page.locator('.lbars header .lb-key')).toHaveText('⇄ surplus-vote partner');
  await expect(page.locator('.lb-agr')).not.toHaveCount(0);
  const shas = page.locator('.lb-row').filter({ has: page.locator('.lb-name', { hasText: /^Shas/ }) });
  await expect(shas.locator('.lb-agr')).toHaveText('⇄ United Torah Judaism');
  // never cut: the partner name keeps whole on its own line when it does not fit
  const cut = await shas.locator('.lb-agr').evaluate(e => e.scrollWidth > e.clientWidth);
  expect(cut).toBe(false);
});

test('1949: a list that won no seat sits under "Lists that won no seat", not among the members', async ({ page }) => {
  await start(page, { election: 'k1' });
  const band = page.locator('.lb-thr');
  await expect(band).toContainText('Lists that won no seat');
  const seatsAbove = await page.locator('.lb > li').evaluateAll(lis => {
    const i = lis.findIndex(li => li.classList.contains('lb-thr'));
    return lis.slice(0, i).map(li => li.querySelector('.lb-seats b')?.textContent);
  });
  expect(seatsAbove).not.toContain('0');
});

test('a tall logo stays inside its slip', async ({ page }) => {
  await start(page, { election: 'k1' });
  const slip = page.locator('.lb-row').filter({ has: page.locator('.lb-name', { hasText: /^WIZO/ }) }).locator('.slip');
  const [box, img] = await Promise.all([slip.boundingBox(), slip.locator('img').boundingBox()]);
  expect(img!.height).toBeLessThanOrEqual(box!.height);
  expect(img!.y).toBeGreaterThanOrEqual(box!.y);
});

test('Hebrew: a paired transfer reads from the donor to the list with a right-to-left arrow', async ({ page }) => {
  await start(page, { lang: 'he' }); await open(page, 'הליכוד');
  await page.locator('.side-panel').getByRole('button', { name: 'הכפלה, אחוזים והעברה', exact: true }).click();
  await expect(page.locator('.transfer-step p')).toContainText('יש עתיד ← הליכוד');
});

test('phone: the lists come straight after the chamber, before blocs and figures', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await start(page);
  const y = async (sel: string) => (await page.locator(sel).first().boundingBox())!.y;
  const chamber = await y('.chamber-panel'), lists = await y('.lbars'), figures = await y('.figures, .fig');
  expect(chamber).toBeLessThan(lists);
  expect(lists).toBeLessThan(figures);
});

test('a list\'s seat count can be typed: the fewest votes that give it are moved, as one undoable edit', async ({ page }) => {
  // a first visit: nothing remembered, so the first vote edit asks where the votes come from
  await page.addInitScript(() => { if (!sessionStorage.getItem('fresh')) { localStorage.removeItem('israel-elections:vote-source'); localStorage.removeItem('israel-elections:preferences'); sessionStorage.setItem('fresh', '1'); } });
  await start(page); await open(page, 'Likud');
  const panel = page.locator('.side-panel');
  const seats = panel.getByRole('textbox', { name: 'Seats', exact: true });
  const votes = panel.getByRole('textbox', { name: 'Votes', exact: true });
  await expect(seats).toHaveValue('32');
  await seats.fill('35'); await seats.press('Enter');
  // the first seat edit asks where the votes come from; Remember stops asking
  const ask = page.getByRole('dialog', { name: 'Votes from' });
  await expect(ask).toContainText('Likud');
  await ask.getByRole('combobox').selectOption('proportional');
  await ask.getByRole('radio', { name: 'Always', exact: true }).check();
  await ask.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(seats).toHaveValue('35', { timeout: 30000 });
  await expect(votes).not.toHaveValue('1,115,336');
  await expect(panel.locator('.sp-seats b')).toHaveText('35');
  await page.locator('.band').getByRole('button', { name: /^Undo: /i }).click();
  await expect(seats).toHaveValue('32');
  // one seat down uses the search already shown beside the goals
  await expect(panel.getByRole('button', { name: 'Decrease Seats', exact: true })).toBeEnabled({ timeout: 30000 });
  await panel.getByRole('button', { name: 'Decrease Seats', exact: true }).click();
  await expect(seats).toHaveValue('31');
  // below the threshold, 1 seat cannot exist: the list lands on the nearest count and says so
  await open(page, 'Meretz');
  await seats.fill('1'); await seats.press('Enter');
  await expect(page.getByText(/1 seats is not possible from this source; nearest: \d/)).toBeVisible({ timeout: 30000 });
  await expect(seats).toHaveValue('4');
  await panel.screenshot({ path: '.backup-scratch/seat-target.png' });
  // the remembered answer is the setting in Rules → Display, and can go back to asking
  await page.reload();
  await page.getByRole('tab', { name: 'Rules & settings', exact: true }).click();
  await page.locator('.band').getByRole('button', { name: 'Your settings', exact: true }).click();
  const setting = page.getByRole('button', { name: 'Votes come from' });
  await expect(setting).toHaveAttribute('data-value', 'proportional');
  await choose(setting, 'ask');
  await page.keyboard.press('Escape');
  await page.getByRole('tab', { name: 'Overview', exact: true }).click();
  await open(page, 'Likud');
  const now = Number(await seats.inputValue());
  await seats.fill(String(now - 2)); await seats.press('Enter');
  await expect(ask).toBeVisible();
  await page.screenshot({ path: '.backup-scratch/seat-ask.png' });
  // a cancelled question changes nothing
  await page.keyboard.press('Escape');
  await expect(ask).toBeHidden();
  await expect(seats).toHaveValue(String(now));
  // an answer without Remember holds for this list, and is asked again for another
  await seats.fill(String(now - 2)); await seats.press('Enter');
  await ask.getByRole('combobox').selectOption('new');
  await ask.getByRole('radio', { name: 'For this list', exact: true }).check();
  await ask.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(seats).toHaveValue(String(now - 2), { timeout: 30000 });
  await panel.getByRole('button', { name: 'Increase Seats', exact: true }).click();
  await expect(seats).toHaveValue(String(now - 1), { timeout: 30000 });
  await expect(ask).toBeHidden();
  await open(page, 'Labor');
  await panel.getByRole('button', { name: 'Increase Votes', exact: true }).click();
  await expect(ask).toBeVisible();
});

test('Escape closes an open (i) popover only, not the list panel around it', async ({ page }) => {
  await start(page); await open(page, 'Likud');
  const panel = page.locator('.side-panel');
  await panel.locator('.info button').first().click();
  await expect(panel.getByRole('tooltip')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(panel.getByRole('tooltip')).toHaveCount(0);
  await expect(panel).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
});

test('an edit made just before a reload survives it', async ({ page }) => {
  await start(page); await open(page, 'Likud');
  await page.locator('.side-panel').getByRole('button', { name: 'Increase Votes', exact: true }).click();
  const votes = await page.locator('.side-panel').getByRole('textbox', { name: 'Votes', exact: true }).inputValue();
  await page.reload();
  await open(page, 'Likud');
  await expect(page.locator('.side-panel').getByRole('textbox', { name: 'Votes', exact: true })).toHaveValue(votes);
});
