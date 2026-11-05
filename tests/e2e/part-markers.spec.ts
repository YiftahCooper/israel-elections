import {test,expect,type Page} from '@playwright/test';
import {choose} from './choices.ts';
async function start(page:Page,election='k25'){
 await page.setViewportSize({width:1440,height:900});
 await page.addInitScript(()=>localStorage.setItem('israel-elections:v1',JSON.stringify({lang:'en',theme:'light',level:'expert',hintDismissed:true})));
 await page.goto('/');await choose(page.getByRole('button',{name:'Election',exact:true}),election);
}
const part=(page:Page)=>page.locator('.edit-marker[data-marker-kind=part]');
const items=(page:Page)=>page.locator('.edit-marker[data-marker-kind=item]');
test('1988 family grouping has one part marker, unchanged seats and distinct chamber regions',async({page})=>{
 await start(page,'k12');await page.getByRole('tab',{name:'Party families',exact:true}).click();
 await page.getByRole('button',{name:'Apply family as grouping',exact:true}).click();
 await expect(part(page)).toHaveCount(1);await expect(items(page)).toHaveCount(0);
 await expect(page.locator('.blocs-head .edit-marker')).toHaveCount(1);
 await expect(page.locator('.lb-seats .tick')).toHaveCount(0);
 await expect(page.locator('.bp-chip .edit-marker')).toHaveCount(0);
 await expect(page.locator('.session')).toContainText('No seats changed');
 const colors=await page.locator('.bp-card').evaluateAll(es=>es.map(e=>(e as HTMLElement).style.getPropertyValue('--bc')));
 expect(colors).toContain('#e0569b');expect(new Set(colors).size).toBe(2);
 await page.evaluate(()=>window.scrollTo(0,0));
 await page.screenshot({path:'.backup-scratch/part-markers/1988-family-grouping.png',fullPage:true});
});
test('2022 blank grouping is marked once and undo clears it',async({page})=>{
 await start(page);await page.getByRole('button',{name:'Edit blocs',exact:true}).click();page.once('dialog',d=>d.accept('My grouping'));
 await choose(page.getByRole('button',{name:'Replace: Blocs',exact:true}),'blank');
 await expect(part(page)).toHaveCount(1);await expect(items(page)).toHaveCount(0);
 await expect(page.locator('.blocs-head .edit-marker')).toHaveCount(1);
 await expect(page.locator('.lb-seats .tick')).toHaveCount(0);
 await page.evaluate(()=>window.scrollTo(0,0));
 await page.screenshot({path:'.backup-scratch/part-markers/2022-blank-grouping.png',fullPage:true});
 await page.getByRole('button',{name:/^Undo:/}).click();await expect(part(page)).toHaveCount(0);await expect(items(page)).toHaveCount(0);
});
test('rules preset has one marker, then an individual threshold edit adds one',async({page})=>{
 await start(page);await page.getByRole('tab',{name:'Rules & settings',exact:true}).click();
 await choose(page.getByRole('button',{name:'Replace: Rules',exact:true}),'preset:il-1992-bader-ofer-1.5');
 await expect(part(page)).toHaveCount(1);await expect(items(page)).toHaveCount(0);
 await page.evaluate(()=>window.scrollTo(0,0));
 await page.screenshot({path:'.backup-scratch/part-markers/2022-rules-preset.png',fullPage:true});
 await page.getByRole('textbox',{name:'Threshold %',exact:true}).fill('2');
 await page.getByRole('textbox',{name:'Threshold %',exact:true}).press('Tab');
 await expect(part(page)).toHaveCount(1);await expect(items(page)).toHaveCount(1);
 await items(page).focus();await expect(page.getByRole('tooltip')).toContainText('1.5%');
});
