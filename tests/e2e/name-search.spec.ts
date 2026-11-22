// Finding Bennett's 2026 list by any of its spellings (22 Nov 2026): the search boxes that find lists by name share one
// matcher and the party registry's other spellings; the list is still shown as "Beyachad".
import { expect, test, type Page } from './fixtures';
import { pickerName } from './choices.ts';
import { openSideBySide } from './sideBySide.ts';

async function start(page: Page) {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('started')) return;
    sessionStorage.setItem('started', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'en', level: 'standard' }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false, decimals: 2 } }));
  });
  await page.goto('/');
  await expect(page.locator('.lb-row').first()).toBeVisible();
}

test('Side by side: "Find a list" finds Beyachad by every spelling, and shows it as Beyachad', async ({ page }) => {
  await start(page);
  await openSideBySide(page);
  const search = page.getByRole('searchbox', { name: 'Find a list' });
  const rows = page.locator('tr.cmp-row');
  for (const typed of ['Together', "B'Yachad", 'B’Yachad', 'BeYachad', "Be'Yahad", 'beyahad', 'be-yachad', 'ביחד']) {
    await search.fill(typed);
    await expect(rows.filter({ hasText: 'Beyachad' }).first()).toBeVisible();
  }
  // only Beyachad, and shown by its name, never by the spelling typed
  await search.fill('Together');
  await expect(rows.filter({ hasNotText: 'Beyachad' })).toHaveCount(0);
  await expect(rows.first()).not.toContainText('Together');
});

test('a list picker’s search finds Beyachad by its other spellings', async ({ page }) => {
  await start(page);
  await page.locator('.compare-on').click();
  const likud = page.locator('.lb li').filter({ has: page.getByRole('button', { name: 'Likud', exact: true }) });
  await likud.getByRole('button', { name: 'Likud', exact: true }).click();
  await likud.locator('.cmpm-copy-btn').click();
  const box = page.locator('dialog[open].cmpm-copy');
  const from = box.getByRole('button', { name: pickerName('Extra votes come from') });
  await from.click();
  const dialog = page.locator(`[id="${await from.getAttribute('aria-controls')}"]`);
  const search = dialog.getByRole('searchbox', { name: 'Search choices' });
  const beyachad = dialog.locator('[data-choice-value="t:26-רק"]');
  // "Be'Yahad" also finds BeYahad Natzliah, whose own name holds it
  for (const typed of ["Be'Yahad", 'B’Yachad', 'together']) {
    await search.fill(typed);
    await expect(beyachad).toBeVisible();
    await expect(beyachad).toHaveAttribute('aria-label', 'Beyachad');
  }
  await expect(dialog.locator('.choice-option')).toHaveCount(1);
});
