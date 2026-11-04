import {choose} from './choices.ts';
import {test,expect,type Page} from '@playwright/test';
async function start(page:Page,lang='en',theme='light') {
 await page.addInitScript(v=>localStorage.setItem('israel-elections:v1',JSON.stringify(v)),{lang,theme,level:'expert',hintDismissed:true});
 await page.goto('/');await page.getByRole('tab',{name:lang==='he'?'משפחות מפלגות':'Party families',exact:true}).click();
 await expect(page.locator('.family-chip')).toHaveCount(9);await expect(page.locator('.family-plots svg')).toHaveCount(2);
}
const editor=(page:Page)=>page.getByRole('dialog',{name:'Edit membership',exact:true});
async function edit(page:Page){await page.getByRole('button',{name:'Edit membership',exact:true}).click();await expect(editor(page).locator('.family-picker label').first()).toBeVisible();}
test('hero charts, collapsed table, policy forks, exact pending tooltip',async({page})=>{
 await start(page);await expect(page.locator('.family-exact')).not.toHaveAttribute('open');
 await expect(page.locator('.family-plots svg').first()).toHaveJSProperty('clientHeight',300);
 await page.locator('.family-plots [role=link]').filter({hasText:'Pending gazette'}).first().focus();await expect(page.getByRole('tooltip')).toContainText('Pending gazette');
 await page.getByText('Exact figures (26 elections)',{exact:true}).click();await expect(page.locator('.family-table tbody tr')).toHaveCount(26);await expect(page.locator('.family-table')).toContainText('52,982');
 await page.getByRole('group',{name:'Mixed-list policy',exact:true}).getByRole('button',{name:'Include whole lists',exact:true}).click();
 await expect(page.locator('.family-table')).toContainText('55,817');await expect(page.locator('.family-profile')).toContainText('Personal copy');
 await page.getByRole('group',{name:'Mixed-list policy',exact:true}).getByRole('button',{name:'Exclude',exact:true}).click();await expect(page.locator('.family-table')).not.toContainText('52,982');
});
test('fork, save, hide, restore and cross-election membership persists',async({page})=>{
 await start(page);await edit(page);await editor(page).getByRole('button',{name:'Save as my preset',exact:true}).click();await expect(page.locator('.family-profile')).toContainText('Personal copy');
 const input=editor(page).getByRole('textbox',{name:'Preset name',exact:true});await input.fill('My family');await input.press('Tab');await expect(page.locator('.family-profile h2')).toHaveText('My family');
 await choose(editor(page).getByRole('button',{name:'Membership election',exact:true}),'k12');await expect(editor(page).getByRole('button',{name:'Membership election',exact:true})).toHaveAttribute('data-value','k12');await expect(editor(page).locator('.family-picker')).toContainText('Degel');
 await editor(page).getByRole('button',{name:'Close',exact:true}).click();
 await page.getByRole('button',{name:'Manage',exact:true}).click();await page.getByRole('button',{name:'Hide preset',exact:true}).click();await expect(page.locator('.family-chip')).toHaveCount(9);
 await page.getByRole('checkbox',{name:'My family',exact:true}).check();await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).click();await page.getByRole('button',{name:'My family',exact:true}).click();
 await page.reload();await page.getByRole('tab',{name:'Party families',exact:true}).click();await page.getByRole('button',{name:'My family',exact:true}).click();await expect(page.locator('.family-plots svg')).toHaveCount(4);
});
test('1988 grouping shows Overview bracket; 2022 +10% previews seats and undoes',async({page})=>{
 await start(page);await choose(page.getByRole('button',{name:'Election',exact:true}),'k12');
 await page.getByRole('button',{name:'Apply family as grouping',exact:true}).click();await expect(page.locator('.bloc-panel')).toContainText('Haredi');await expect(page.locator('.bp-card')).toHaveCount(2);await expect(page.locator('.session .moves').last()).toHaveText('Haredi 13Everyone else 107');await expect(page.locator('.session')).not.toContainText('majority');await expect(page.getByRole('button',{name:'Degel HaTorah',exact:true}).locator('.family-row-label')).toHaveText('Haredi');await expect(page.getByRole('button',{name:'Degel HaTorah',exact:true})).toHaveAccessibleDescription(/Haredi/);await expect(page.locator('.family-row-label').first()).toContainText('Haredi');
 await page.screenshot({path:'.backup-scratch/families/overview-grouping-en-light-desktop.png',fullPage:true});await page.getByRole('button',{name:'Degel HaTorah',exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:'.backup-scratch/families/overview-degel-1988-en-light-desktop.png'});
 await choose(page.getByRole('button',{name:'Election',exact:true}),'k25');await page.getByRole('tab',{name:'Party families',exact:true}).click();await expect(page.locator('.family-consequence')).toContainText('740,474');
 await expect(page.locator('.family-consequence .result-preview')).toHaveCount(2);await page.getByRole('button',{name:'Apply vote scaling',exact:true}).click();await expect(page.locator('.family-consequence')).toContainText('814,521');
 await page.getByRole('group',{name:'Scale mode',exact:true}).getByRole('button',{name:'Target share (%)',exact:true}).click();await expect(page.getByRole('textbox',{name:'Scale value',exact:true})).toHaveValue('15.54');await page.getByRole('group',{name:'Scale mode',exact:true}).getByRole('button',{name:'Increase votes (%)',exact:true}).click();
 await page.getByRole('button',{name:/^Undo:/}).click();await expect(page.locator('.family-consequence')).toContainText('740,474');
});
test('screen-reader table preference and reduced motion open exact figures',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await start(page);await expect(page.locator('.family-exact')).toHaveAttribute('open');
 await page.getByRole('button',{name:'Manage',exact:true}).click();await page.getByRole('checkbox',{name:'Prefer exact figures (screen-reader/table view)',exact:true}).check();await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).click();await page.emulateMedia({reducedMotion:'no-preference'});await page.reload();await page.getByRole('tab',{name:'Party families',exact:true}).click();await expect(page.locator('.family-exact')).toHaveAttribute('open');
});
test('profile loads compact runtime without evidence or registry, suggestions only on request',async({page})=>{
 const requests:string[]=[];page.on('request',r=>requests.push(r.url()));await start(page);expect(requests.some(u=>/\/assets\/(haredi-|registry-|FamilyEditor-)/.test(u))).toBe(false);
 await page.getByRole('button',{name:'Definition, sources and limitations',exact:true}).click();await expect(page.getByRole('heading',{name:'Limitations',exact:true})).toBeVisible();await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).click();
 await edit(page);await editor(page).getByText('Link historic partners',{exact:true}).click();
 const picker=editor(page).getByRole('button',{name:'Sourced suggestions',exact:true});await picker.click();const choices=page.getByRole('dialog').last();await choices.locator('.choice-option').first().click();
 await expect(editor(page).getByRole('button',{name:'Apply suggested link',exact:true})).toBeVisible();await expect(page.locator('.family-profile')).toContainText('Sourced draft interpretation');
 await editor(page).getByRole('button',{name:'Apply suggested link',exact:true}).click();await expect(page.locator('.family-profile')).toContainText('Personal copy');
});
for(const lang of ['he','en'])for(const theme of ['light','dark'])for(const phone of [false,true])test(`families screenshot ${lang} ${theme} ${phone?'phone':'desktop'}`,async({page})=>{
 await page.setViewportSize(phone?{width:390,height:844}:{width:1440,height:900});await start(page,lang,theme);
 const prefix=`.backup-scratch/families/${lang}-${theme}-${phone?'phone':'desktop'}`;
 await page.screenshot({path:`${prefix}.png`,fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(await page.locator('.family-plots svg').first().evaluate(e=>e.getBoundingClientRect().height)).toBeGreaterThanOrEqual(220);
 await page.locator('.family-chip').nth(1).click();await expect(page.locator('.family-plots svg')).toHaveCount(4);await page.screenshot({path:`${prefix}-compare.png`,fullPage:true});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:lang==='he'?'עריכת חברות':'Edit membership',exact:true}).click();await expect(page.locator('.family-sheet .family-picker label').first()).toBeVisible();await page.screenshot({path:`${prefix}-edit.png`});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('opening a historical chart retains a family lens without editing the election',async({page})=>{
 await start(page);await page.locator('.family-plots [role=link]').first().click();await expect(page.locator('.family-row-label').first()).toContainText('Mixed lists');await expect(page.locator('.family-treatment')).toContainText('Haredi');await expect(page.getByRole('button',{name:/^Undo:/})).toHaveCount(0);
 await page.screenshot({path:'.backup-scratch/families/overview-family-view-1949.png'});await page.getByRole('button',{name:'Clear family view',exact:true}).click();await expect(page.locator('.family-row-label')).toHaveCount(0);
});
