import {expect,test} from '@playwright/test';
import { openSettings } from './barMenu.ts';
import {choose} from './choices.ts';
for(const lang of ['en','he']) for(const theme of ['light','dark']) for(const width of [1500,1024,390]) test(`component identities ${lang} ${theme} ${width}`,async({page})=>{
 test.setTimeout(120000);
 await page.setViewportSize({width,height:1000});
 await page.addInitScript(v=>{if(!localStorage.getItem('israel-elections:v1'))localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })(v))},{lang,theme,level:'expert',hintDismissed:true});
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 for(const election of ['k26','k25','k12','k1']){
  await choose(page.getByRole('button',{name:lang==='en'?'Election':'בחירות',exact:true}),election);
  if(election==='k26') await page.getByRole('region',{name:lang==='en'?'Lists':'הרשימות',exact:true}).getByRole('button',{name:lang==='en'?'The Democrats':'הדמוקרטים',exact:true}).click();
  else await page.locator('.lb-row').first().click();
  const panel=page.locator('.side-panel');
  if(election==='k26'){
   const component=panel.locator('.cand[data-component-party]').first();
   await component.scrollIntoViewIfNeeded();
   await expect(component).toContainText(lang==='en'?'Meretz':'מרצ');
   // Text retains the neutral theme inks over the party tint in both themes.
   const contrast=await component.evaluate(el=>{
    const rgb=(s:string)=>s.match(/[\d.]+/g)!.map(Number);
    const bg=getComputedStyle(el).backgroundColor;
    const rgba=bg.startsWith('color(srgb')?rgb(bg).map(x=>x*255):rgb(bg);
    const lum=(c:number[])=>c.slice(0,3).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);
    return [...el.querySelectorAll('span,a')].filter(e=>e.textContent?.trim()).map(e=>{const a=lum(rgb(getComputedStyle(e).color)),b=lum(rgba);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)});
   });expect(Math.min(...contrast)).toBeGreaterThanOrEqual(4.5);
   await panel.screenshot({path:`.backup-scratch/components/candidates-${lang}-${theme}-${width}.png`});
   await panel.getByRole('checkbox',{name:lang==='en'?'Count seats by party':'ספירת מנדטים לפי מפלגה',exact:true}).check();
   await panel.getByRole('button',{name:lang==='en'?'Close':'סגירה',exact:true}).click();
   await page.locator('.lbars').screenshot({path:`.backup-scratch/components/lists-${lang}-${theme}-${width}.png`});
   const rows=page.locator('.lb-parties li');
   await expect(rows).toHaveCount(2);
   const boxes=await rows.evaluateAll(els=>els.map(el=>{const row=el.getBoundingClientRect(),logo=el.firstElementChild!.getBoundingClientRect();return {top:row.top,bottom:row.bottom,lt:logo.top,lb:logo.bottom}}));
   boxes.forEach(b=>{expect(b.lt).toBeGreaterThanOrEqual(b.top);expect(b.lb).toBeLessThanOrEqual(b.bottom)});
   expect(boxes[1].top).toBeGreaterThanOrEqual(boxes[0].bottom);
   for(const layout of ['Arc','Blocks']){
    await page.getByRole('button',{name:lang==='en'?layout:layout==='Arc'?'קשת':'גושים',exact:true}).click();
    const chamber=page.locator('.chamber').first();
    await expect(chamber.locator('[data-component-seat]')).toHaveCount(8);
    await expect(chamber.locator('[data-seat]')).toHaveCount(120);
    await expect(chamber.locator('.legend')).toContainText(lang==='en'?'Meretz':'מרצ');
    await chamber.screenshot({path:`.backup-scratch/components/${layout}-${lang}-${theme}-${width}.png`});
    if(lang==='en'&&theme==='light'&&width===1500){
     const download=page.waitForEvent('download');await chamber.getByRole('button',{name:'Export SVG'}).click();
     const d=await download;await d.saveAs(`.backup-scratch/components/export-${layout}.svg`);
     const {readFile}=await import('node:fs/promises');const xml=await readFile(`.backup-scratch/components/export-${layout}.svg`,'utf8');expect(xml).toContain('data-component-seat');expect(xml).toContain('Meretz');
     const png=page.waitForEvent('download');await chamber.getByRole('button',{name:'Export PNG'}).click();await (await png).saveAs(`.backup-scratch/components/export-${layout}.png`);
    }
   }
   await page.getByRole('tab',{name:lang==='en'?'Rules':'כללים',exact:true}).click();
   await openSettings(page, lang);
   await page.locator('.personal-settings [data-setting="jointListSeats"]').getByRole('button',{name:lang==='en'?'List':'רשימה',exact:true}).click();
  await page.keyboard.press('Escape');
   await page.getByRole('tab',{name:lang==='en'?'Overview':'תמונת מצב',exact:true}).click();
   await expect(page.locator('.chamber [data-component-seat]')).toHaveCount(0);
   await page.reload();await expect(page.locator('.chamber [data-component-seat]')).toHaveCount(0);
  }else{
   await panel.screenshot({path:`.backup-scratch/components/${election}-${lang}-${theme}-${width}.png`});
   await panel.getByRole('button',{name:lang==='en'?'Close':'סגירה',exact:true}).click();
  }
 }
 expect(errors).toEqual([]);
});
