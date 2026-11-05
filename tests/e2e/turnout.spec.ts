import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';

async function open(page: Page, lang: 'en' | 'he', election = 'k25') {
  await page.addInitScript(lang => localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level: 'expert', hintDismissed: true })), lang);
  await page.goto('/');
  await choose(page.getByRole('button', { name: lang === 'en' ? 'Election' : 'בחירות', exact: true }), election);
  await page.locator('#tab-turnout').click();
  return page.locator('#analysis-panel');
}

test('section reset appears only when it would change something', async ({ page }) => {
  const panel = await open(page, 'en');
  const national = panel.locator('.turnout-national');
  await expect(national.locator('.start-from button')).toHaveCount(0); // nothing to reset or copy yet
  await national.getByRole('button', { name: 'Increase Turnout %', exact: true }).click();
  const reset = national.getByRole('button', { name: 'Official turnout', exact: true });
  await expect(reset).toBeVisible();
  await reset.click();
  await expect(national.locator('.start-from button')).toHaveCount(0);
});

test('a sourced voter group adds measured voters, saves, exports and imports', async ({ page }) => {
  const panel = await open(page, 'en');
  await choose(panel.getByRole('button', { name: 'Voter group', exact: true }), 'src:arab');
  await expect(panel.locator('.vg-facts')).toContainText('146 localities · 938,401 registered · turnout 53.2%');
  const target = panel.getByLabel('New turnout %', { exact: true });
  await target.fill('63.2'); await target.press('Enter');
  await expect(panel.locator('.vg-range')).toContainText('53.2% → 63.2%');
  const add = panel.getByRole('button', { name: /^Add [\d,]+ voters$/ });
  await expect(add).toBeEnabled();
  await expect(panel.locator('.vg-seats')).not.toBeEmpty();
  const n = Number((await add.innerText()).replace(/\D/g, ''));
  expect(n).toBe(Math.round(938401 * 0.1)); // 10 points of the group's registered voters
  await add.click();
  await page.getByRole('button', { name: /^History/ }).click();
  await expect(page.getByText(/Added 93,840 voters \(Arab localities \+10\.0 pp\)/).first()).toBeVisible();
  await page.keyboard.press('Escape');

  page.once('dialog', d => d.accept('Arab turnout +10'));
  await panel.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(panel.getByRole('button', { name: 'Voter group', exact: true })).toHaveText(/Arab turnout \+10/);
  const download = page.waitForEvent('download');
  await panel.getByRole('button', { name: 'Export', exact: true }).click();
  const file = await (await download).path();
  const { readFileSync } = await import('node:fs');
  const json = JSON.parse(readFileSync(file, 'utf8'));
  expect(json).toMatchObject({ kind: 'israel-elections/voter-group', schemaVersion: 1, name: 'Arab turnout +10', members: { type: 'sourced', groupId: 'arab' }, turnoutChange: 10, vote: { type: 'observed' } });

  // a sourced group is portable: the imported file applies to another election's localities
  await page.reload();
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k24');
  await page.locator('#tab-turnout').click();
  await panel.locator('.vg-head input[type=file]').setInputFiles({ name: 'g.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ ...json, id: 'vg-imported', name: 'Imported group' })) });
  await expect(panel.getByRole('button', { name: 'Voter group', exact: true })).toHaveText(/Imported group/);
  await expect(panel.locator('.vg-facts')).toContainText('localities');
  await expect(panel.getByRole('button', { name: /^Add [\d,]+ voters$/ })).toBeEnabled();
});

test('elections without locality results explain it and still allow typed groups', async ({ page }) => {
  const panel = await open(page, 'en', 'k14');
  await panel.getByRole('button', { name: 'Voter group', exact: true }).click();
  await expect(page.locator('dialog[open] [data-choice-value=none]')).toBeDisabled();
  await page.locator('dialog[open] [data-choice-value=manual]').click();
  // typed numbers have no observed mix: only the user's shares are offered, and a blocked Add says why
  await expect(panel.getByRole('button', { name: 'Like this group voted', exact: true })).toHaveCount(0);
  const target = panel.getByLabel('New turnout %', { exact: true });
  await target.fill('60'); await target.press('Enter');
  const add = panel.getByRole('button', { name: 'Add 10,000 voters', exact: true });
  await expect(add).toBeDisabled();
  await expect(add).toHaveAccessibleDescription('Give at least one list a share.');
});

test('Hebrew keeps turnout numbers left to right', async ({ page }) => {
  const panel = await open(page, 'he');
  await choose(panel.getByRole('button', { name: 'קבוצת מצביעים', exact: true }), 'src:arab');
  const target = panel.getByLabel('שיעור הצבעה חדש %', { exact: true });
  await target.fill('63.2'); await target.press('Enter');
  const range = panel.locator('.vg-range bdi').first();
  await expect(range).toHaveAttribute('dir', 'ltr');
  await expect(range).toHaveText('53.2% → 63.2%');
  await expect(panel.getByRole('button', { name: /^הוספת [\d,]+ מצביעים$/ })).toBeEnabled();
});
