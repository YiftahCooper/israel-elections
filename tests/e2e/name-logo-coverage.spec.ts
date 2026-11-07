import {test,expect} from '@playwright/test';
import {choose} from './choices.ts';
import {mkdirSync,readFileSync} from 'node:fs';
for(const election of ['k26','k25','k12','k1','k21']) test(`${election}: names and party identity in both languages, themes and sizes`,async({browser})=>{
 test.setTimeout(180_000);
 const errors:string[]=[];
 mkdirSync('.backup-scratch/feedback-data/after',{recursive:true});
 for(const lang of ['en','he'])for(const theme of ['light','dark'])for(const width of [1500,1024,390]){
  const context = await browser.newContext({viewport:{width,height:1000}});
  await context.addInitScript(({lang,theme})=>localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({lang,theme,level:'expert',hintDismissed:true})),{lang,theme});
  const page = await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('/');
  const picker=page.getByRole('button',{name:lang==='en'?'Election':'בחירות',exact:true});
  await expect(picker).toHaveAttribute('data-value','k26');
  if(election!=='k26')await choose(picker,election);
  await page.locator('.lb-row').first().click();
  const panel=page.locator('.side-panel');await expect(panel).toBeVisible();
  if(lang==='en'){
   for(const label of await page.locator('.lb-name,.lb-pname,.party-row > span,.sp-head h2').allTextContents())expect(label).not.toMatch(/[\u0590-\u05ff]/);
   for(const label of await panel.locator('select option').allTextContents())expect(label).not.toMatch(/[\u0590-\u05ff]/);
  }
  const close=page.getByRole('button',{name:lang==='en'?'Close':'סגירה',exact:true});await close.click();
  const democrat=page.getByRole('button',{name:lang==='en'?'The Democrats':'הדמוקרטים',exact:true});
  if(election==='k26'){
   await democrat.click();await panel.locator('.party-rows').scrollIntoViewIfNeeded();
   const meretz=panel.locator('.party-row').filter({hasText:lang==='en'?'Meretz':'מרצ'});
   await expect(meretz.locator('img')).toHaveCount(0);
   await expect(meretz.locator('.slip')).toBeVisible();
   await expect(panel.locator('.sp-head .slip img')).toHaveAttribute('src', 'logos/democrats-2026.svg');
   await expect(panel.locator('.party-row > .swatch')).toHaveCount(0);
  }
  await page.screenshot({path:`.backup-scratch/feedback-data/after/${election}-${lang}-${theme}-${width}.png`,fullPage:true});
  await context.close();
 }
 expect(errors).toEqual([]);
});

test('all 26 elections expose English names in surplus partner menus',async({page})=>{
 test.setTimeout(180_000);
 await page.addInitScript(()=>localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({lang:'en',theme:'light',level:'expert',hintDismissed:true})));
 await page.goto('/');
 const picker=page.getByRole('button',{name:'Election',exact:true});
 for(let n=1;n<=26;n++){
  await choose(picker,`k${n}`);await page.locator('.lb-row').first().click();
  for(const label of await page.locator('.side-panel select option').allTextContents())expect(label,`k${n}`).not.toMatch(/[\u0590-\u05ff]/);
  await page.getByRole('button',{name:'Close',exact:true}).click();
 }
 await page.getByRole('button',{name:'Save & share',exact:true}).click();
 const pending = page.waitForEvent('download');
 await page.getByRole('button',{name:'Export results table (CSV)',exact:true}).click();
 const downloaded = await pending;
 const csv = readFileSync((await downloaded.path())!,'utf8');
 expect(csv).toContain('Tzeva Shahor');expect(csv).not.toContain('צבע שחור');
 await page.getByRole('tab',{name:'Sources',exact:true}).click();
 await page.getByText('English list names',{exact:true}).click();
 await expect(page.getByText(/Tzeva Shahor · Unofficial transliteration/)).toBeVisible();
});
