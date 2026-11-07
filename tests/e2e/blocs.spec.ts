import { readFileSync } from 'node:fs';
import { choose } from './choices.ts';
// Blocs per election and constituent parties (decision 0087).
import { expect, test, type Page } from '@playwright/test';

const start = async (page: Page, level: string) => {
  await page.addInitScript((v) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('israel-elections:v1', v); const o = JSON.parse(v); localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); sessionStorage.setItem('seeded', '1'); } },
    JSON.stringify({ lang: 'en', hintDismissed: true, level }));
  await page.goto('/');
  await choose(page.getByRole('button', { name: 'Election', exact: true }), 'k25');
  await expect(page.getByRole('button', { name: 'Grouping', exact: true })).toHaveText(/37th government/);
};
const blocs = (page: Page) => page.getByRole('region', { name: 'Seats by bloc' });
/** a bloc's band in the strip; its seat count is the bold figure in its label */
const band = (page: Page, bloc: string) => blocs(page).getByRole('button', { name: new RegExp(`^${bloc}`) });
const blocCount = (page: Page, bloc: string) => band(page, bloc).locator('.label b');
const editor = (page: Page) => page.getByRole('complementary', { name: 'Edit blocs' });
const listRow = (page: Page, name: string) => page.getByRole('region', { name: 'Lists' }).getByRole('button', { name, exact: true });

test('an election opens on its first government, and other sourced groupings can be chosen', async ({ page }) => {
  await start(page, 'simple');
  const grouping = page.getByRole('button', { name: 'Grouping', exact: true });
  await expect(grouping).toHaveText(/37th government/);
  await expect(blocCount(page, 'Coalition')).toHaveText('64');
  await choose(grouping, 'pre-election-blocs');
  await expect(grouping).toContainText('Comparison groups · App');
  // a band opens the bloc editor beside the chamber, at every level
  await band(page, 'Netanyahu bloc').click();
  await expect(editor(page).getByRole('textbox', { name: 'Bloc name' }).first()).toHaveValue('Netanyahu bloc');
  await page.keyboard.press('Escape');
  await expect(editor(page)).toHaveCount(0);
});

test('a bloc is renamed and recoloured where it is shown, and Undo restores it', async ({ page }) => {
  await start(page, 'simple');
  await blocs(page).getByRole('button', { name: 'Edit blocs' }).click();
  const name = editor(page).getByRole('textbox', { name: 'Bloc name' }).first();
  await name.fill('Government');
  await name.press('Enter');
  await expect(band(page, 'Government')).toBeVisible();
  await expect(page.locator('.band .scenario-switcher .choice-trigger')).toHaveAttribute('data-value', 'official');
  await editor(page).getByRole('button', { name: 'Colour of Government' }).click();
  await editor(page).getByRole('button', { name: '#c0392b' }).click();
  await expect(band(page, 'Government')).toHaveCSS('--bc', '#c0392b');
  await page.getByRole('button', { name: /^Undo:/ }).click();
  await page.getByRole('button', { name: /^Undo:/ }).click();
  await expect(band(page, 'Coalition')).toBeVisible();
});

test('moving one party of a joint list to another bloc moves only its members’ seats', async ({ page }) => {
  await start(page, 'standard');
  const before = Number(await blocCount(page, 'Coalition').innerText());
  await band(page, 'Coalition').click();
  // choose the party, then the bloc it moves to
  await editor(page).getByRole('button', { name: /^New Hope, 4 seats/ }).click();
  await expect(editor(page).getByRole('status')).toContainText('Moving New Hope');
  await editor(page).locator('.bp-card').first().getByRole('button', { name: 'Move here' }).click();
  const after = Number(await blocCount(page, 'Coalition').innerText());
  expect(after).toBeGreaterThan(before);
  expect(after - before).toBeLessThan(12); // only New Hope's members, not all of National Unity
  const grouping = page.getByRole('button', { name: 'Grouping', exact: true });
  await expect(grouping).toContainText('Your grouping');
  await choose(grouping, { label: '37th government (Netanyahu VI)' });
  await expect(blocCount(page, 'Coalition')).toHaveText(String(before));
});

test('a joint list’s faction can split after the election, keeping votes and seats', async ({ page }) => {
  await start(page, 'standard');
  await page.getByRole('region', { name: 'Lists' }).getByRole('button', { name: 'National Unity', exact: true }).click();
  const details = page.getByRole('region', { name: 'List details' });
  await details.getByRole('checkbox', { name: 'Count seats by party' }).check();
  // each party now has its own row of seats under the list, and its own place in the chamber
  await expect(page.getByRole('region', { name: 'Lists' }).getByRole('list', { name: /factions after the split/ }).getByText('New Hope')).toBeVisible();
  await expect(listRow(page, 'National Unity')).toContainText('12');
  await expect(page.getByRole('status').filter({ hasText: 'Since official result' })).toContainText('No changes yet');
});

test('a joint list can run as separate lists, with the vote shares stated as an assumption', async ({ page }) => {
  await start(page, 'standard');
  await page.getByRole('region', { name: 'Lists' }).getByRole('button', { name: 'United Torah Judaism', exact: true }).click();
  const details = page.getByRole('region', { name: 'List details' });
  await expect(details.getByText('Parties on this joint list')).toBeVisible();
  await details.getByRole('button', { name: 'Split into separate lists' }).click();
  await expect(details.locator('.joint-split > p').first()).toBeVisible();
  await details.getByRole('button', { name: 'Split assumptions', exact: true }).click();
  await expect(details.getByRole('tooltip')).toContainText('the shares below are an assumption');
  await details.getByRole('button', { name: 'Split assumptions', exact: true }).click();
  await details.getByRole('button', { name: 'Run as 2 separate lists' }).click();
  await expect(listRow(page, 'Agudat Yisrael')).toBeVisible();
  await expect(listRow(page, 'Degel HaTorah').locator('.lb-seats b')).toHaveText('0'); // below the threshold on its own
  await page.getByRole('button', { name: /^Undo:/ }).click();
  await expect(listRow(page, 'United Torah Judaism')).toBeVisible();
});

for (const lang of ['en', 'he'] as const) for (const election of ['k24', 'k25']) {
  test(`${election} app-defined grouping labels retain provenance in ${lang}`, async ({ page }) => {
    await page.addInitScript(({lang}) => localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({lang, level:'standard', hintDismissed:true})), {lang});
    await page.goto('/');
    await choose(page.getByRole('button', {name: lang === 'en' ? 'Election' : 'בחירות', exact:true}), election);
    const picker = page.getByRole('button', {name:lang === 'en' ? 'Grouping' : 'חלוקה לגושים', exact:true});
    const scheme = election === 'k24' ? 'knesset-blocs-2021' : 'pre-election-blocs';
    await picker.click();
    const option = page.locator(`.choice-option[data-choice-value="${scheme}"]`);
    const tag = lang === 'en' ? 'App' : 'יישומון';
    await expect(option).toContainText(`· ${tag}`);
    await expect(option).toHaveAttribute('title', /not an official|אינה חלוקה רשמית/);
    await option.click();
    await expect(picker).toContainText(`· ${tag}`);
    await expect(picker).toHaveAttribute('title', /not an official|אינה חלוקה רשמית/);
    const downloadEvent = page.waitForEvent('download');
    await page.getByRole('button', {name: lang === 'en' ? 'Export SVG' : 'ייצוא SVG', exact:true}).click();
    const download = await downloadEvent;
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
    const svg = Buffer.concat(chunks).toString('utf8');
    expect(svg).toContain(`· ${tag}`);
    expect(svg).toContain('<desc>');
    expect(svg).toMatch(/not an official|אינה חלוקה רשמית/);
    // The visible scheme marker covers every band and legend row in this panel.
    const panel = page.getByRole('region', { name: lang === 'en' ? 'Seats by bloc' : 'מנדטים לפי גוש' });
    await expect(panel.locator('.majority-context')).toContainText(`· ${tag}`);
    expect((await panel.innerText()).split(`· ${tag}`).length - 1).toBe(1);
    expect(svg.split(`· ${tag}`).length - 1).toBe(1);
    const bands = page.locator('.corridor:not(.no-bloc)');
    expect(await bands.count()).toBeGreaterThan(0);
    for (const band of await bands.all()) {
      await expect(band.locator('.label')).not.toContainText(`· ${tag}`);
      await expect(band.locator('.app-grouping-tag')).toHaveCount(0);
      // Tooltips name the bloc alone, so they retain their own provenance.
      await expect(band).toHaveAttribute('title', new RegExp(`· ${tag}`));
      await expect(band).toHaveAttribute('title', /not an official|אינה חלוקה רשמית/);
    }
    for (const label of await page.locator('.strip-legend > span').all()) {
      await expect(label).not.toContainText(`· ${tag}`);
    }
    await page.getByRole('tab', {name: lang === 'en' ? 'Compare' : 'השוואה', exact:true}).click();
    await choose(page.getByRole('button', {name: lang === 'en' ? 'Compare with' : 'השוואה עם', exact:true}), `election:${election === 'k24' ? 'k23' : 'k24'}`);
    // the open scenario's side names the app grouping once, never on each bloc
    const legend = page.locator('.cmp-card[data-role="main"] .majority-context');
    await expect(legend).toContainText(`· ${tag}`);
    expect((await legend.innerText()).split(`· ${tag}`).length - 1).toBe(1);
    for (const row of await legend.locator(':scope > span:not(:first-child)').all()) await expect(row).not.toContainText(`· ${tag}`);
  });
}


test('a bloc in a sourced scheme keeps its own marker', async ({ page }) => {
  await page.route('**/data/k25.json', async route => {
    const ds = JSON.parse(readFileSync('public/data/k25.json', 'utf8'));
    ds.blocSchemes.find((g: {id:string}) => g.id === 'first-government').blocs[0].appDefined = true;
    await route.fulfill({json:ds});
  });
  await start(page, 'standard');
  const panel = blocs(page);
  await expect(panel.locator('.majority-context')).not.toContainText('· App');
  await expect(band(page, 'Coalition').locator('.app-grouping-tag')).toHaveText('· App');
  await expect(band(page, 'Opposition').locator('.app-grouping-tag')).toHaveCount(0);
});
