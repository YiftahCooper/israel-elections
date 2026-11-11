import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { choose } from './choices.ts';
import { openSideBySide } from './sideBySide.ts';
test.use({ actionTimeout: 20_000 });

for (const election of ['k26','k25','k1']) test(`${election}: synthetic icons in both languages, themes and widths`, async ({ browser }) => {
 test.setTimeout(600_000);
 mkdirSync('.backup-scratch/u6/final',{recursive:true});
 for(const lang of ['en','he']) for(const theme of ['light','dark']) for(const width of [1500,1024,390]) {
  const context=await browser.newContext({viewport:{width:1500,height:1000}});
  await context.addInitScript(({lang,theme})=>{
   localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({lang,theme,level:'expert',hintDismissed:true}));
   localStorage.setItem('israel-elections:preferences',JSON.stringify({voteSource:'proportional',comparison:'reference'}));
  },{lang,theme});
  const page=await context.newPage(); await page.goto('/');
  if(election!=='k26') await choose(page.getByRole('button',{name:lang==='en'?'Election':'בחירות',exact:true}),election);
  await page.setViewportSize({width,height:1000});
  await page.locator('#tab-structure').click();
  const chips=page.locator('#analysis-panel').getByRole('group',{name:lang==='en'?'Lists':'רשימות',exact:true}).getByRole('button');
  await chips.nth(0).click();await chips.nth(1).click();
  const merge=page.locator('#analysis-panel').getByRole('button',{name:lang==='en'?'Merge 2 lists':'איחוד 2 רשימות',exact:true});
  await merge.click();
  const tile=page.locator('#st-applied .synthetic');await expect(tile).toHaveCount(1);
  expect(await tile.locator('img').getAttribute('src')).toContain('data-kind'); // SVG declares the synthetic kind
  await page.screenshot({path:`.backup-scratch/u6/final/${election}-${lang}-${theme}-${width}-record.png`,fullPage:true});
  await page.locator('#st-applied .st-link').last().click();
  await expect(page.locator('.sp-head .synthetic')).toBeVisible();
  await expect(page.locator('.lb-row .synthetic')).toHaveCount(1);
  const image=page.locator('.sp-head .synthetic img');
  expect(await image.evaluate((el:HTMLImageElement)=>el.complete&&el.naturalWidth>0)).toBe(true);
  await page.screenshot({path:`.backup-scratch/u6/final/${election}-${lang}-${theme}-${width}-overview.png`,fullPage:true});
  await context.close();
 }
});

test('Likud–Shas identity survives Compare and SVG/PNG export; splits and blank new lists use synthetic tiles',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({lang:'en',theme:'light',level:'expert',hintDismissed:true})));
 await page.goto('/');await page.locator('#tab-structure').click();
 const panel=page.locator('#analysis-panel');
 for(const name of ['Likud','Shas'])await panel.getByRole('group',{name:'Lists',exact:true}).getByRole('button',{name,exact:true}).click();
 await panel.getByRole('button',{name:'Merge 2 lists',exact:true}).click();
 await page.locator('#st-applied .st-link').last().click();
 await page.screenshot({path:'.backup-scratch/u6/final/likud-shas.png',fullPage:true});
 const [svg]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Export SVG',exact:true}).click()]);
 const {readFileSync}=await import('node:fs');
 expect(readFileSync((await svg.path())!,'utf8')).toContain('data-kind="merge"');
 const [png]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Export PNG',exact:true}).click()]);
 expect(readFileSync((await png.path())!).subarray(1,4).toString()).toBe('PNG');
 await png.saveAs('.backup-scratch/u6/final/chamber-export.png');
 await openSideBySide(page);await expect(page.locator('.cmp .synthetic').first()).toBeVisible();
 await page.screenshot({path:'.backup-scratch/u6/final/compare.png',fullPage:true});
 await page.locator('#tab-structure').click();await page.locator('.st-head > .seg button').nth(1).click();
 await panel.getByRole('group',{name:'List',exact:true}).getByRole('button',{name:'Likud–Shas',exact:true}).click();
 const splitImages=await panel.locator('.st-task .st-preview .synthetic img').evaluateAll(els=>els.map(el=>decodeURIComponent(el.getAttribute('src')!)));
 expect(splitImages.filter(src=>src.includes('data-kind="split"')).length).toBeGreaterThanOrEqual(2);
 await page.screenshot({path:'.backup-scratch/u6/final/split.png',fullPage:true});
 await page.locator('.st-head > .seg button').nth(2).click();
 await panel.getByLabel('New list name', {exact:true}).fill('New list');
 await expect(panel.locator('.st-task .st-preview .synthetic')).toHaveCount(1);
 await page.screenshot({path:'.backup-scratch/u6/final/new-list.png',fullPage:true});
});
