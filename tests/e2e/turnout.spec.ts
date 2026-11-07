import { expect, test, type Page } from '@playwright/test';
import { choose } from './choices.ts';

async function open(page: Page, lang: 'en' | 'he', election = 'k25') {
  // the figures below were drawn at one decimal place (Settings → Decimal places)
  await page.addInitScript(lang => localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 1 } })); return JSON.stringify(o); })({ lang, level: 'expert', hintDismissed: true })), lang);
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
  await expect(page.getByText(/Added 93,840 voters \(Arab localities \+10 pp\)/).first()).toBeVisible();
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

for (const lang of ['en', 'he'] as const) test(`groups start unchanged and a custom group is editable: ${lang}`, async ({ page }) => {
  const panel = await open(page, lang);
  const picker = panel.getByRole('button', { name: lang === 'en' ? 'Voter group' : 'קבוצת מצביעים', exact: true });
  await choose(picker, 'src:arab');
  await expect(panel.locator('#vg-change')).toHaveValue('0');
  await panel.getByLabel(lang === 'en' ? 'New turnout %' : 'שיעור הצבעה חדש %', { exact: true }).fill('63.2');
  await panel.getByLabel(lang === 'en' ? 'New turnout %' : 'שיעור הצבעה חדש %', { exact: true }).press('Enter');
  await picker.click();
  await page.getByRole('button', { name: lang === 'en' ? 'Custom group…' : 'קבוצה מותאמת אישית…', exact: true }).click();
  await expect(panel.locator('#vg-change')).toHaveValue('0');
  await expect(panel.getByRole('heading', { name: lang === 'en' ? 'Custom group' : 'קבוצה מותאמת אישית' })).toBeVisible();
  const voters = panel.getByRole('textbox', { name: lang === 'en' ? 'Group size' : 'גודל הקבוצה', exact: true });
  await voters.fill('200000'); await voters.press('Enter');
  await expect(voters).toHaveValue('200,000');
  await expect(panel.locator('#vg-change')).toHaveValue('0');
  await choose(picker, 'src:arab');
  await expect(panel.locator('#vg-change')).toHaveValue('0');
});

test('zero-vote split descendants share observed local votes once when adding turnout', async ({ page }) => {
  const { readFileSync } = await import('node:fs');
  const ds = JSON.parse(readFileSync('public/data/k25.json', 'utf8'));
  const local = JSON.parse(readFileSync('public/data/k25-localities.json', 'utf8'));
  const [a, b] = ds.lists;
  const actions = [
    { type: 'setVotes', listId: a.id, votes: 0 },
    { type: 'split', id: a.id, parts: ['child-a', 'child-b'].map(newId => ({ newId, nameHe: newId, letters: newId, color: '#123456', votes: 0, candidateIds: [] })) },
  ];
  await page.addInitScript(actions => {
    localStorage.setItem('israel-elections:v1', JSON.stringify({ lang: 'en', level: 'expert', hintDismissed: true }));
    localStorage.setItem('israel-elections:workspace:v1', JSON.stringify({ v: 1, electionId: 'k25', current: {
      id: 'split-test', name: 'Split test', electionId: 'k25', ref: null,
      log: actions.map(action => ({ action, at: '2026-11-07T00:00:00Z' })),
    }, sessions: [], drafts: [] }));
  }, actions);
  await page.route('**/data/k25-localities.json', route => route.fulfill({ json: {
    ...local, listIds: [a.id, b.id],
    rows: [{ ...local.rows[0], code: 1, registered: 1000, votesCast: 200, valid: 200, invalid: 0, votes: [100, 100] }],
    groups: [{ ...local.groups[0], id: 'test', codes: [1], coverage: { localities: 1, registered: 1000, valid: 200, nationalValidShare: 0 } }],
  } }));
  await page.goto('/');
  await expect(page.locator('.election .choice-trigger')).toHaveAttribute('data-value', 'k25');
  await page.locator('#tab-turnout').click();
  const panel = page.locator('#analysis-panel');
  await choose(panel.getByRole('button', { name: 'Voter group', exact: true }), 'src:test');
  const target = panel.getByLabel('New turnout %', { exact: true });
  await target.fill('30'); await target.press('Enter');
  await panel.getByRole('button', { name: 'Add 100 voters', exact: true }).click();
  await expect.poll(() => page.evaluate(() => {
    const last = JSON.parse(localStorage.getItem('israel-elections:workspace:v1') ?? 'null')?.current?.log.at(-1)?.action;
    return last?.type === 'addVoters' ? last.allocations.map((x: { votes: number }) => x.votes) : null;
  })).toEqual([25, 25, 50]);
});
