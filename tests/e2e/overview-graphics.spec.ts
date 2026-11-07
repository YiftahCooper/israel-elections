import {expect,test} from '@playwright/test';
// Overview board graphics audit (2026-11-04): behaviours that are easy to regress without a visual diff.
test.describe.configure({mode:'parallel'});
for(const lang of ['he','en'] as const) test.describe(lang,()=>{
  test.beforeEach(async({page})=>{
    await page.addInitScript(v=>{try{localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })(v));}catch{}},{lang,theme:'light',level:'standard',hintDismissed:true,markOfficial:true});
  });

  test(`unchanged blocs show no reference strip and state each majority once ${lang}`,async({page})=>{
    await page.goto('/');
    await expect(page.locator('.chamber [data-seat]')).toHaveCount(120);
    const blocs=page.locator('section.blocs').first();
    await expect(blocs.locator('.bloc-reference')).toHaveCount(0);
    // the majority consequence sits in its corridor only, not again in a separate summary line
    const consequence=await blocs.locator('.corridor .consequence').first().innerText();
    expect(consequence.length).toBeGreaterThan(0);
    expect((await blocs.innerText()).split(consequence).length-1).toBe(1);
  });

  test(`collapsed features use one named toggle ${lang}`,async({page})=>{
    await page.goto('/');
    await expect(page.locator('.chamber [data-seat]')).toHaveCount(120);
    const toggles=page.locator('.disclosure-toggle');
    expect(await toggles.count()).toBeGreaterThan(0);
    for(const t of await toggles.all()) {
      await expect(t).toHaveAttribute('aria-expanded',/^(true|false)$/);
      // the visible text is the feature's name, never the bare "More options" prefix
      const text=(await t.innerText()).trim();
      expect(text.length).toBeGreaterThan(0);
      expect(text).not.toMatch(/More options|אפשרויות נוספות/);
    }
  });

  test(`bloc vote entry beyond the available votes explains itself ${lang}`,async({page})=>{
    await page.goto('/');
    await expect(page.locator('.chamber [data-seat]')).toHaveCount(120);
    await page.locator('.strip .corridor').first().click();
    const input=page.locator('.bloc-panel .bp-card').first().locator('.bloc-vote-stepper input');
    const before=await input.inputValue();
    await input.fill('99999999999');
    await input.press('Enter');
    await expect(page.locator('.bloc-panel .bp-card').first().locator('.bloc-vote-stepper [aria-live]')).toContainText(lang==='he'?'לכל היותר':'At most');
    await expect(page.getByText(/selected lists hold only/)).toHaveCount(0);
    await expect(input).toHaveValue(before);
  });
});
