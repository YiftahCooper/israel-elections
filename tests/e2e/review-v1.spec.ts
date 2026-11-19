// Faults found by the 19 Nov review of the top bar, Overview, editing, Compare and History (lane FV1).
import { choose } from './choices.ts';
import { expect, test, type Page } from '@playwright/test';

async function start(page: Page, election: string, { lang = 'en', level = 'standard', prefs = '', levelDecimals = false } = {}) {
  await page.addInitScript(([lang, level, prefs, levelDecimals]) => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang, level }));
    // older figures were drawn at two decimals; levelDecimals keeps each complexity's own decimal places
    localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { starterTip: false, ...(levelDecimals ? {} : { decimals: 2 }) } }));
    if (prefs) localStorage.setItem('israel-elections:preferences', prefs);
  }, [lang, level, prefs, levelDecimals] as const);
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

for (const level of ['simple', 'standard', 'expert']) test(`the Turnout tile reads 77.98% at ${level}, open or closed`, async ({ page }) => {
  // the owner's turnout digits: two decimals at every complexity, the same as the field (TURNOUT_FIELD_DIGITS)
  await start(page, 'k26', { level, levelDecimals: true });
  const tile = page.locator('.fig').filter({ has: page.locator('.k', { hasText: /^Turnout$/ }) }).first();
  await expect(tile.locator('.v')).toHaveText('77.98%');
  if (level === 'expert') {
    await tile.locator('button').first().click();
    await expect(page.locator('.tile-editor input').first()).toHaveValue('77.98');
    await expect(tile.locator('.v')).toHaveText('77.98%');
  }
});

test('line of changes: the rest of a long line is one press away; Hebrew keeps a space before a bloc\'s change', async ({ page }) => {
  await start(page, 'k26', { level: 'expert' });
  await editVotes(page, 'Likud', '1247591');
  const strip = page.locator('.session .session-changes');
  const end = strip.getByText('no bloc has a majority');
  const inView = async () => { const [a, b] = [await strip.boundingBox(), await end.boundingBox()]; return !!a && !!b && b.x >= a.x && b.x + b.width <= a.x + a.width + 1; };
  expect(await inView()).toBe(false);
  await page.locator('.session').getByRole('button', { name: 'Show the rest of the line' }).click();
  await expect.poll(inView).toBe(true);
  // every change mark sits in its own left-to-right run with the space before it outside that run, so the bidi
  // algorithm never drops it in Hebrew (V1 F22)
  const runs = await page.locator('.session .moves span[dir="ltr"]').evaluateAll((els) => els.map((e) => [e.textContent, e.previousSibling?.textContent ?? '']));
  expect(runs.length).toBeGreaterThan(3);
  for (const [text, before] of runs) { expect(text).toMatch(/^\(/); expect(before).toMatch(/ $/); }
});

test('withdrawing a list: the line says so and counts the seats in no bloc (2022, Labor)', async ({ page }) => {
  await start(page, 'k25', { level: 'expert' });
  await page.getByRole('region', { name: 'Lists', exact: true }).getByRole('button', { name: 'Labor', exact: true }).click();
  await page.locator('.side-panel').getByText('Withdrawn from the race').click();
  const line = page.locator('.session .session-changes');
  await expect(line).toContainText('list withdrawn');
  await expect(line).not.toContainText('votes changed');
  await expect(line).toContainText('No bloc 4 (▲ +4)');
});

test('Copy votes box: counts lists as the message does, names where a row\'s votes come from, no dangling dot, unchanged said so', async ({ page }) => {
  await start(page, 'k26');
  await editVotes(page, 'Likud', '1247591');
  await page.locator('.session').getByRole('button', { name: 'Compare' }).click();
  await choose(page.locator('.cmpm-strip').getByRole('button', { name: 'Compare with', exact: true }), 'prev');
  await page.getByRole('button', { name: 'Copy votes…' }).first().click();
  const box = page.locator('.cmpm-copy');
  // one row holds three 2026 lists (Religious Zionism–Zehut, Otzma Yehudit and Noam)
  await expect(box.locator('legend').first()).toHaveText('Lists to copy (12 of 12)');
  await expect(box.locator('.cmpm-copy-ticks')).toContainText('Religious Zionism–Zehut + Otzma Yehudit + Noamfrom 2022: Religious Zionism');
  for (const t of await box.locator('.cmp-mode').allInnerTexts()) expect(t).not.toMatch(/votes ·\s*$/m);
  await box.getByRole('button', { name: 'Copy into 2026' }).click();
  await expect(page.locator('.toast').last()).toContainText('for 12 lists');
  await page.locator("xpath=//button[normalize-space()='Copy votes…'][preceding::*[contains(@class,'lb-row')][1][contains(., 'Shas')]]").first().click();
  const count = box.locator('.cmp-mode[data-mode="count"]');
  await expect(count).toContainText('Shas 9 (unchanged)');
  await expect(count).not.toContainText('9 → 9');
});
