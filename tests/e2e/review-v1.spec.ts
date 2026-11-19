// Faults found by the 19 Nov review of the top bar, Overview, editing, Compare and History (lane FV1).
import { choose } from './choices.ts';
import { expect, test, type Page } from '@playwright/test';

async function start(page: Page, election: string, { lang = 'en', level = 'standard', prefs = '' } = {}) {
  await page.addInitScript(([lang, level, prefs]) => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level }));
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false, decimals: 2 } }));
    if (prefs) localStorage.setItem('israel-elections:preferences', prefs);
  }, [lang, level, prefs]);
  await page.goto('/');
  const lists = page.getByRole('region', { name: lang === 'he' ? 'הרשימות' : 'Lists', exact: true });
  await expect(lists).toBeVisible();
  if (election !== 'k26') await choose(page.getByRole('button', { name: lang === 'he' ? 'בחירות' : 'Election', exact: true }), election);
  return lists;
}

test('1949: the coalition is 73, as the government record says; WIZO and the Yemenites voted confidence only', async ({ page }) => {
  await start(page, 'k1');
  const bar = page.locator('section.blocs .strip');
  await expect(bar).toHaveAttribute('aria-label', /Coalition 73, Voted confidence only 2, Opposition 45/);
  await expect(page.locator('section.blocs .strip-legend')).toContainText('Voted confidence only 2');
  // a group that is not a side gets no distance from 61
  await expect(page.locator('section.blocs .strip-legend')).not.toContainText('59 short of 61');
});

test('1977: a bare majority reads "exactly 61"; outside support has no distance from 61; Likud is one block', async ({ page }) => {
  // joint lists counted by party (the app's default), so Likud's three parties have their own colours
  await start(page, 'k9', { prefs: '{"voteSource":"proportional","comparison":"reference","jointSeats":"on"}' });
  const legend = page.locator('section.blocs .strip-legend');
  await expect(legend).toContainText('Coalition 61 exactly 61');
  await expect(legend).not.toContainText('0 above 61');
  await expect(legend).not.toContainText('60 short of 61');
  // each of Likud's three parties is one piece in the bar (no alternating stripes)
  const colours = await page.locator('section.blocs .corridor').first().locator('.pieces i').evaluateAll((els) => els.map((e) => getComputedStyle(e).backgroundColor));
  const runs = colours.filter((c, i) => c !== colours[i - 1]);
  expect(new Set(runs).size).toBe(runs.length);
});

async function editVotes(page: Page, list: string, votes: string) {
  await page.getByRole('region', { name: 'Lists', exact: true }).getByRole('button', { name: list, exact: true }).click();
  const field = page.locator('.side-panel').getByRole('textbox', { name: 'Votes', exact: true });
  await field.fill(votes); await field.press('Enter');
}

test('History: no Undo and Redo of its own, no "revert to here" on the newest change; one Undo takes it back', async ({ page }) => {
  await start(page, 'k26');
  await editVotes(page, 'Likud', '1247591');
  const line = page.locator('.session');
  await expect(line).toContainText('1 change');
  await line.getByRole('button', { name: 'History', exact: true }).click();
  const history = page.locator('.history');
  await expect(history.locator('li')).toHaveCount(1);
  await expect(history.getByRole('button', { name: 'revert to here' })).toHaveCount(0);
  await expect(history.getByRole('button', { name: /^Undo/ })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await line.getByRole('button', { name: /^Undo: Likud/ }).click();
  await expect(line).not.toContainText('1 change');
});

test('Start over asks in the app\'s own box; Undo and Redo then name it "Start over"', async ({ page }) => {
  let native = 0;
  page.on('dialog', (d) => { native++; void d.dismiss(); });
  await start(page, 'k25', { level: 'expert' });
  await editVotes(page, 'Likud', '1200000');
  await editVotes(page, 'Labor', '200000');
  const line = page.locator('.session');
  await line.getByRole('button', { name: 'Start over', exact: true }).click();
  const box = page.getByRole('dialog', { name: 'Start over from the official result?' });
  await expect(box).toBeVisible();
  await box.getByRole('button', { name: 'Start over', exact: true }).click();
  await expect(box).toHaveCount(0);
  expect(native).toBe(0);
  await expect(line.getByRole('button', { name: 'Undo: Start over', exact: true })).toBeVisible();
  await line.getByRole('button', { name: 'Undo: Start over', exact: true }).click();
  await expect(line).toContainText('2 changes');
  await expect(line.getByRole('button', { name: 'Redo: Start over', exact: true })).toBeEnabled();
  // Cancel leaves the work as it was
  await line.getByRole('button', { name: 'Start over', exact: true }).click();
  await box.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(line).toContainText('2 changes');
});
