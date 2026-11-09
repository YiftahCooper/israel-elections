import { choose } from './choices.ts';
import { closeBarMenu, openBarMenu } from './barMenu.ts';
import { allocate } from '../../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput } from '../../src/model/scenario.ts';
import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

for (const lang of ['he','en']) for (const phone of [false,true]) {
  test(`every election's chamber labels fit: ${lang} ${phone ? 'phone' : 'desktop'}`, async ({page}) => {
    await page.setViewportSize(phone ? {width:390,height:844} : {width:1440,height:900});
    await page.addInitScript(lang => localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({lang,theme:'light',hintDismissed:true})),lang);
    await page.goto('/');
    const picker=page.getByRole('button', {name:lang==='he'?'בחירות':'Election',exact:true});
    for (let n=1;n<=26;n++) {
      await choose(picker, `k${n}`);
      await expect(page.locator('.lb-row').first()).toBeVisible();
      await page.evaluate(()=>document.fonts.ready);
      const diagram=page.locator('.chamber svg').first();
      await expect(diagram).toBeVisible();
      const errors=await diagram.evaluate(svg => {
        const box=svg.getBoundingClientRect();
        return [...svg.querySelectorAll('[data-chamber-label]')].filter(label => {
          const r=label.getBoundingClientRect();
          return r.left < box.left - 1 || r.right > box.right + 1 || r.top < box.top - 1 || r.bottom > box.bottom + 1;
        }).map(label=>label.textContent);
      });
      expect(errors,`k${n}`).toEqual([]);
      if (!phone) {
        const ds=JSON.parse(readFileSync(`public/data/k${n}.json`, 'utf8'));
        const winners=allocate(toEngineInput(scenarioFromDataset(ds))).lists.filter(l=>l.seats>0).length;
        await expect(page.locator('.chamber .legend button')).toHaveCount(winners);
      }
      else {
        await expect(page.locator('.chamber .legend')).toBeVisible();
        expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), JSON.stringify(await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: innerWidth, nodes: [...document.querySelectorAll('body *')].filter(el => { const r = el.getBoundingClientRect(); if (r.width === 0 || r.right <= innerWidth + .1) return false; let p = el.parentElement; while (p && p !== document.body) { if (getComputedStyle(p).overflowX !== 'visible') return false; p = p.parentElement; } return true; }).slice(0, 12).map(el => ({ tag: el.tagName, cls: el.className, text: el.textContent?.slice(0, 80), x: el.getBoundingClientRect().x, width: el.getBoundingClientRect().width })) })))).toBe(true);
      }
    }
  });
}

for (const lang of ['he','en']) for (const theme of ['light','dark']) for (const phone of [false,true]) {
  test(`polish screenshots: ${lang} ${theme} ${phone ? 'phone' : 'desktop'}`,async ({page})=>{
    await page.setViewportSize(phone ? {width:390,height:844} : {width:1440,height:900});
    await page.addInitScript(v=>localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })(v)),{lang,theme,level:'standard',hintDismissed:true});
    await page.goto('/');
    const picker=page.getByRole('button', {name:lang==='he'?'בחירות':'Election',exact:true});
    await choose(picker, 'k26');
    // phones (owner, 9 Nov 2026): one-row bar; its Menu button carries the mark and About is in the Menu
    if (phone) await expect(page.locator('.band .band-menu-btn')).toHaveAttribute('aria-label', new RegExp(lang==='he'?'הפרסום ברשומות טרם אומת':'Gazette not yet verified'));
    expect((await page.locator('.band').boundingBox())!.height).toBeLessThanOrEqual(60);
    await openBarMenu(page);
    await expect(page.locator('.election-about summary')).toContainText(lang==='he'?'רשומות: טרם אומת':'Gazette not yet verified');
    await expect(page.locator('.publication-pending')).toHaveCount(1);
    await page.locator('.election-about summary').click();
    await expect(page.locator('.election-about ul')).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), await page.evaluate(() => [...document.querySelectorAll('body *')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.right > innerWidth + 1; }).slice(0, 8).map(el => `${el.tagName}.${el.className}: ${Math.round(el.getBoundingClientRect().width)}px`).join(', '))).toBe(true);
    await page.screenshot({path:`.backup-scratch/polish/about-${lang}-${theme}-${phone?'phone':'desktop'}.png`});
    if (phone) { await page.keyboard.press('Escape'); await closeBarMenu(page); }
    await choose(picker, 'k15');
    await expect(page.locator('.lb-row').first()).toBeVisible();
    await page.evaluate(()=>document.fonts.ready);
    expect((await page.locator('.band').boundingBox())!.height).toBeLessThanOrEqual(60);
    const suffix=`${lang}-${theme}-${phone?'phone':'desktop'}`;
    await page.screenshot({path:`.backup-scratch/polish/chamber-${suffix}.png`});
    await openBarMenu(page);
    await page.getByRole('button',{name:lang==='he'?'מותאם':'Custom',exact:true}).click();
    await expect(page.getByRole('tab',{selected:true})).toHaveCount(0);
    await expect(page.locator('.custom-grid')).toHaveCount(3);
    await page.screenshot({path:`.backup-scratch/polish/custom-${suffix}.png`});
  });
}
