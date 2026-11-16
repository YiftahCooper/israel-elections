// MKs apart from their list in the Coalitions tool (owner, 16 Nov 2026): Expert only and folded; a vote can be set for
// "one MK" of a list without naming anyone; the recorded first government brings the research's own exceptions.
import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';

async function start(page: Page, level: string) {
  await page.addInitScript((level) => { if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'en', level }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false } })); }, level);
  await page.goto('/');
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k24');
  await page.getByRole('tab', { name: 'Coalitions', exact: true }).click();
}

test('June 2021 at Expert: the recorded first government counts Chikli against and Alkharumi abstaining: 60 for, 59 against, 61', async ({ page }) => {
  await start(page, 'expert');
  const section = page.locator('details.coal-apart');
  await expect(section).not.toHaveAttribute('open');
  await page.getByRole('button', { name: 'Recorded first government', exact: true }).click();
  const now = page.locator('.coal-now');
  await expect(now.locator('.coal-test').first()).toContainText('60 for · 59 against');
  await expect(now.locator('.majority-readout bdi[dir="ltr"]')).toHaveText('61 / 120');
  await expect(now).toContainText('2 MKs vote apart from their list');
  await expect(now.locator('.coal-recorded')).toHaveCount(0);
  await section.locator('summary').click();
  await expect(section.locator('li')).toHaveCount(2);
  await expect(section.locator('li').filter({ hasText: 'Amichai Chikli' })).toContainText('Recorded vote');
  // one more MK, not named: one of Yesh Atid's MKs votes against (the list votes for); it is the user's edit, and undoable
  await choose(section.getByRole('button', { name: 'List of the MK', exact: true }), { label: 'Yesh Atid' });
  await expect(section.getByRole('button', { name: 'Which MK', exact: true })).toContainText('One MK, not named');
  await expect(section.getByRole('group', { name: 'Their vote' }).getByRole('button', { name: 'Against', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await section.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(section.locator('li').filter({ hasText: 'one MK' })).toContainText('Edited');
  await expect(now.locator('.coal-test').first()).toContainText('59 for · 60 against');
  await expect(now.locator('.majority-readout bdi[dir="ltr"]')).toHaveText('60 / 120');
  await page.locator('.band').getByRole('button', { name: /^Undo: Coalition: .* 3 apart from their list$/ }).click();
  await expect(now.locator('.coal-test').first()).toContainText('60 for · 59 against');
});

// Below Expert it waits behind its folded chip, like every feature of a higher level (owner, 16 Nov 2026, lvl-registry:
// features of other levels can be blended into one's own level; lane U2): nothing of it shows until the chip is pressed.
test('below Expert the section waits behind its folded chip', async ({ page }) => {
  await start(page, 'standard');
  await expect(page.locator('.coal')).toBeVisible();
  await expect(page.locator('details.coal-apart')).toHaveCount(0);
  const chip = page.getByRole('button', { name: 'More options: MKs apart from their list', exact: true });
  await expect(chip).toHaveAttribute('aria-expanded', 'false');
  await chip.click();
  await expect(page.locator('details.coal-apart')).toHaveCount(1);
  await expect(page.locator('details.coal-apart')).not.toHaveAttribute('open');
});
