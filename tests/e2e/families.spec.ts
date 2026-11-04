import { choose } from './choices.ts';
import {test,expect,type Page} from '@playwright/test';
async function start(page:Page,lang='en',theme='light') {
 await page.addInitScript(v=>localStorage.setItem('israel-elections:v1',JSON.stringify(v)),{lang,theme,level:'expert',hintDismissed:true});
 await page.goto('/');await page.getByRole('tab',{name:lang==='he'?'משפחות מפלגות':'Party families',exact:true}).click();
 await expect(page.locator('.family-table tbody tr')).toHaveCount(26);
}
test('26 dates, separate charts and mixed policies fork the built-in',async({page})=>{
 await start(page);await expect(page.locator('.family-plots svg')).toHaveCount(2);await expect(page.locator('.family-table')).toContainText('52,982');
 await page.getByRole('combobox',{name:'Mixed-list policy',exact:true}).selectOption('include-whole-list');
 await expect(page.locator('.family-table')).toContainText('55,817');await expect(page.locator('.families')).toContainText('Personal copy');
 await page.getByRole('combobox',{name:'Mixed-list policy',exact:true}).selectOption('exclude');await expect(page.locator('.family-table')).not.toContainText('52,982');
});
test('fork save hide restore and storage survives reload',async({page})=>{
 await start(page);await page.getByRole('button',{name:'Save as my preset',exact:true}).click();await expect(page.locator('.families')).toContainText('Personal copy');
 await page.getByRole('textbox',{name:'Preset name',exact:true}).fill('My family');await page.getByRole('button',{name:'Hide preset',exact:true}).click();
 await page.getByRole('button',{name:'Manage presets',exact:true}).click();await page.getByRole('checkbox',{name:'My family',exact:true}).check();
 await page.getByRole('combobox',{name:'Preset',exact:true}).selectOption({label:'My family'});await expect(page.locator('.families h3').first()).toHaveText('My family');
 await page.reload();await page.getByRole('tab',{name:'Party families',exact:true}).click();await page.getByRole('combobox',{name:'Preset',exact:true}).selectOption({label:'My family'});await expect(page.locator('.families h3').first()).toHaveText('My family');
});
test('1988 grouping and 2022 scale with undo',async({page})=>{
 await start(page);await choose(page.getByRole('button',{name:'Election',exact:true}),'k12');
 await page.getByRole('button',{name:'Apply family as grouping',exact:true}).click();await expect(page.locator('.bloc-panel')).toContainText('Haredi');
 await choose(page.getByRole('button',{name:'Election',exact:true}),'k25');
 await page.getByRole('tab',{name:'Party families',exact:true}).click();await expect(page.locator('.families')).toContainText('740,474');
 await page.getByRole('button',{name:'Apply vote scaling',exact:true}).click();
 await expect(page.locator('.families')).toContainText('814,521');
 await page.getByRole('button',{name:/^Undo:/}).click();await expect(page.locator('.families')).toContainText('740,474');
});
for(const lang of ['he','en'])for(const theme of ['light','dark'])for(const phone of [false,true])test(`families screenshot ${lang} ${theme} ${phone?'phone':'desktop'}`,async({page})=>{
 await page.setViewportSize(phone?{width:390,height:844}:{width:1440,height:900});await start(page,lang,theme);
 await page.screenshot({path:`.backup-scratch/families/${lang}-${theme}-${phone?'phone':'desktop'}.png`,fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('nine sourced drafts and registry suggestions preview without applying',async({page})=>{
 await start(page);await expect(page.getByRole('combobox',{name:'Preset',exact:true}).locator('option')).toHaveCount(10);
 await page.getByText('Link historic partners',{exact:true}).click();
 const select=page.getByRole('combobox',{name:'Sourced suggestions',exact:true});
 await select.selectOption({index:1});await expect(page.getByRole('button',{name:'Apply suggested link',exact:true})).toBeVisible();
 await expect(page.locator('.families')).toContainText('Sourced draft interpretation');
 await expect(page.locator('.families')).not.toContainText('Personal copy');
 await page.getByRole('button',{name:'Apply suggested link',exact:true}).click();await expect(page.locator('.families')).toContainText('Personal copy');
});
