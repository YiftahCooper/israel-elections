import {choose} from './choices.ts';
import {test,expect,type Page} from '@playwright/test';
async function start(page:Page,lang='en',theme='light') {
 await page.addInitScript(v=>localStorage.setItem('israel-elections:v1',JSON.stringify(v)),{lang,theme,level:'expert',hintDismissed:true});
 await page.goto('/');await page.getByRole('tab',{name:lang==='he'?'משפחות מפלגות':'Party families',exact:true}).click();
 await expect(page.locator('.family-chip')).toHaveCount(9);await expect(page.locator('.family-plots svg')).toHaveCount(2);
}
const editor=(page:Page)=>page.getByRole('dialog',{name:'Edit membership',exact:true});
async function edit(page:Page){await page.getByRole('button',{name:'Edit membership',exact:true}).click();await expect(editor(page).locator('.family-picker label').first()).toBeVisible();}
test('hero charts, collapsed table, policy view, exact pending tooltip',async({page})=>{
 await start(page);await expect(page.locator('.family-exact')).not.toHaveAttribute('open');
 await expect(page.locator('.family-plots svg').first()).toHaveJSProperty('clientHeight',300);
 await page.locator('.family-plots [role=button]').filter({hasText:'Gazette unverified'}).first().focus();await expect(page.getByRole('tooltip')).toContainText('Gazette unverified');
 await page.getByText('Exact figures (26 elections)',{exact:true}).click();await expect(page.locator('.family-table tbody tr')).toHaveCount(26);await expect(page.locator('.family-table')).toContainText('52,982');
 await page.getByRole('group',{name:'Mixed-list policy',exact:true}).getByRole('button',{name:'Count all',exact:true}).click();
 await expect(page.locator('.family-table')).toContainText('55,817');await expect(page.locator('.family-profile')).toContainText('Sourced draft interpretation');await expect(page.locator('.family-chip')).toHaveCount(9);
 await page.getByRole('group',{name:'Mixed-list policy',exact:true}).getByRole('button',{name:'Leave out',exact:true}).click();await expect(page.locator('.family-table tbody tr').first()).toContainText('2,835');await expect(page.locator('.family-table tbody tr').first()).toContainText('Mixed lists left out: 52,982');
});
test('fork, save, hide, restore and cross-election membership persists',async({page})=>{
 await start(page);await edit(page);await editor(page).getByRole('button',{name:'Save as my preset',exact:true}).click();await expect(page.locator('.family-profile')).toContainText('Personal copy');
 const input=editor(page).getByRole('textbox',{name:'Preset name',exact:true});await input.fill('My family');await input.press('Tab');await expect(page.locator('.family-profile h2')).toHaveText('My family');
 await choose(editor(page).getByRole('button',{name:'Membership election',exact:true}),'k12');await expect(editor(page).getByRole('button',{name:'Membership election',exact:true})).toHaveAttribute('data-value','k12');await expect(editor(page).locator('.family-picker')).toContainText('Degel');
 await editor(page).getByRole('button',{name:'Close',exact:true}).click();
 await page.getByRole('button',{name:'Manage',exact:true}).click();await page.getByRole('checkbox',{name:'My family',exact:true}).uncheck();await expect(page.locator('.family-chip')).toHaveCount(9);
 await page.getByRole('checkbox',{name:'My family',exact:true}).check();await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).click();await page.getByRole('button',{name:'My family',exact:true}).click();
 await page.reload();await page.getByRole('tab',{name:'Party families',exact:true}).click();await page.getByRole('button',{name:'My family',exact:true}).click();await expect(page.locator('.family-plots svg')).toHaveCount(4);
});
test('1988 grouping shows Overview bracket; 2022 +10% previews seats and undoes',async({page})=>{
 await start(page);await choose(page.getByRole('button',{name:'Election',exact:true}),'k12');
 await page.getByRole('button',{name:'Apply grouping & open Overview',exact:true}).click();await expect(page.locator('.bloc-panel')).toContainText('Haredi');await expect(page.locator('.bp-card')).toHaveCount(2);await expect(page.locator('.session .moves').last()).toHaveText('Haredi 13Everyone else 107');await expect(page.locator('.session')).not.toContainText('majority');await expect(page.getByRole('button',{name:'Degel HaTorah',exact:true}).locator('.family-row-label')).toHaveText('Haredi');await expect(page.getByRole('button',{name:'Degel HaTorah',exact:true})).toHaveAccessibleDescription(/Haredi/);await expect(page.locator('.family-row-label').first()).toContainText('Haredi');
 await page.screenshot({path:'.backup-scratch/families/overview-grouping-en-light-desktop.png',fullPage:true});await page.getByRole('button',{name:'Degel HaTorah',exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:'.backup-scratch/families/overview-degel-1988-en-light-desktop.png'});
 await choose(page.getByRole('button',{name:'Election',exact:true}),'k25');await page.getByRole('tab',{name:'Party families',exact:true}).click();await expect(page.locator('.family-consequence')).toContainText('740,474');
 await expect(page.locator('.family-consequence .family-seat-strip')).toHaveCount(2);await page.getByRole('button',{name:'Apply vote scaling',exact:true}).click();await expect(page.locator('.family-consequence')).toContainText('814,521');
 await page.getByRole('group',{name:'Scale mode',exact:true}).getByRole('button',{name:'Target share (%)',exact:true}).click();await expect(page.getByRole('textbox',{name:'Scale value',exact:true})).toHaveValue('15.54');await page.getByRole('group',{name:'Scale mode',exact:true}).getByRole('button',{name:'Change votes (%)',exact:true}).click();
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
 await start(page);await page.locator('.family-plots [role=button]').first().click();await page.getByRole('button',{name:'Open this election',exact:true}).click();await expect(page.locator('.family-row-label').first()).toContainText('Mixed lists');await expect(page.locator('.family-treatment')).toContainText('Haredi');await expect(page.getByRole('button',{name:/^Undo:/})).toHaveCount(0);
 await page.screenshot({path:'.backup-scratch/families/overview-family-view-1949.png'});await page.getByRole('button',{name:'Clear family view',exact:true}).click();await expect(page.locator('.family-row-label')).toHaveCount(0);
});
test('mixed-only elections are not plotted as zero; mixed policy is a persistent view that never forks',async({page})=>{
 // 2013: Likud ran jointly with Yisrael Beiteinu (20 of 31 seats), a real partnership, so Likud lineage is mixed-only there
 await start(page);await choose(page.getByRole('button',{name:'Election',exact:true}),'k19');await page.getByRole('tab',{name:'Party families',exact:true}).click();
 await page.getByRole('button',{name:'Haredi',exact:true}).click();await page.getByRole('button',{name:'Likud lineage',exact:true}).click();
 await expect(page.locator('.family-legend')).toHaveCount(1);await expect(page.locator('.family-legend')).toContainText('Mixed lists (up to)');
 const share=page.locator('.family-plots section').first();await share.locator('[role=button]').nth(18).focus();
 await expect(page.getByRole('tooltip')).toContainText('Only in mixed lists');await expect(page.getByRole('tooltip')).not.toContainText('0 votes');
 await expect(page.locator('.family-scale')).toContainText('only mixed lists in this election');
 await page.getByRole('group',{name:'Mixed-list policy',exact:true}).getByRole('button',{name:'Leave out',exact:true}).click();
 await share.locator('[role=button]').nth(18).focus();await expect(page.getByRole('tooltip')).toContainText('Only in mixed lists (left out)');
 await expect(page.locator('.family-chip')).toHaveCount(9);await expect(page.locator('.family-profile')).toContainText('Sourced draft interpretation');
 await page.reload();await page.getByRole('tab',{name:'Party families',exact:true}).click();await page.getByRole('button',{name:'Haredi',exact:true}).click();await page.getByRole('button',{name:'Likud lineage',exact:true}).click();
 await expect(page.getByRole('group',{name:'Mixed-list policy',exact:true}).getByRole('button',{name:'Leave out',exact:true})).toHaveAttribute('aria-pressed','true');
 // Centre names only contested lists in 2026: that is not "did not contest".
 await page.getByRole('button',{name:'Centre',exact:true}).click();await page.getByText('Exact figures (26 elections)',{exact:true}).click();
 await expect(page.locator('.family-table tbody tr').last()).toContainText('No list counted');await expect(page.locator('.family-table tbody tr').last()).not.toContainText('Did not contest');
});
test('even axis ticks, scale down with a seat delta, distinct copies and delete',async({page})=>{
 await start(page);const svg=page.locator('.family-plots svg').first();
 expect(await svg.locator('.family-axis text').allTextContents()).toEqual(['0%','5%','10%','15%','20%','1950','1960','1970','1980','1990','2000','2010','2020']);
 await page.getByRole('button',{name:'−10%',exact:true}).click();await expect(page.getByRole('textbox',{name:'Scale value',exact:true})).toHaveValue('-10');
 await expect(page.locator('.family-seat-count em')).toHaveText(/^[−±]/);await expect(page.locator('.family-consequence')).toContainText('623,349 → 561,014');
 await page.getByRole('textbox',{name:'Scale value',exact:true}).fill('-101');await expect(page.locator('.family-unavailable')).toContainText('−100%');
 await edit(page);await editor(page).getByRole('button',{name:'Save as my preset',exact:true}).click();await editor(page).getByRole('button',{name:'Close',exact:true}).click();
 await expect(page.getByRole('button',{name:'Haredi (mine)',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Haredi',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Manage',exact:true}).click();await page.getByRole('button',{name:'Delete Haredi (mine)',exact:true}).click();await page.getByRole('button',{name:'Delete permanently',exact:true}).click();
 await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).click();await expect(page.locator('.family-chip')).toHaveCount(9);await expect(page.getByText('Choose a family above to explore its history.')).toBeVisible();
});
test('Hebrew scaling keeps signs and arrows in reading order',async({page})=>{
 await start(page,'he');await expect(page.locator('.family-scale .quick-actions bdi').first()).toHaveText('−10%');
 await expect(page.locator('.family-seat-count em bdi')).toHaveText('+2');await expect(page.locator('.family-consequence p[role=status]')).toContainText('623,349 → 685,684');
});
test('head-party counting is explicit, remembered and one-list overrides keep the view policy',async({page})=>{
 await start(page);await page.getByRole('button',{name:'Haredi',exact:true}).click();await page.getByRole('button',{name:'Likud lineage',exact:true}).click();
 const policies=page.getByRole('group',{name:'Mixed-list policy',exact:true});
 await expect(policies.getByRole('button',{name:'Show hatched',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.locator('.family-plots [role=button]').last().click();await expect(page.getByRole('dialog')).toContainText('Family heads this list');await page.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).click();
 await policies.getByRole('button',{name:'Count if family heads it',exact:true}).click();
 await expect(page.locator('.family-chip')).toHaveCount(9);
 await edit(page);await editor(page).getByText('Mixed-list overrides',{exact:true}).click();
 const override=editor(page).getByRole('combobox',{name:/Counting override/}).first();
 await override.selectOption('exclude');await expect(page.locator('.family-profile')).toContainText('Personal copy');
 await expect(policies.getByRole('button',{name:'Count if family heads it',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(editor(page).getByRole('combobox',{name:/Counting override/}).first()).toHaveValue('exclude');
 await editor(page).getByRole('combobox',{name:/Counting override/}).first().selectOption('default');
 await expect(editor(page).getByRole('combobox',{name:/Counting override/}).first()).toHaveValue('default');
});

test('family aggregates open details without navigating; hover never moves plots',async({page})=>{
 await start(page);await page.getByRole('button',{name:'Haredi',exact:true}).click();await page.getByRole('button',{name:'Likud lineage',exact:true}).click();
 const marks=page.locator('.family-plots section').first().locator('g[role=button]');
 const top=await page.locator('.family-plots').evaluate(e=>e.getBoundingClientRect().top);
 for(const i of [0,18,25]){await marks.nth(i).hover();expect(await page.locator('.family-plots').evaluate(e=>e.getBoundingClientRect().top)).toBe(top);}
 await marks.nth(18).focus();await page.keyboard.press('Enter');
 const detail=page.getByRole('dialog',{name:'Election breakdown',exact:true});await expect(detail).toBeVisible();
 await expect(detail).toContainText('Likud');await expect(detail).toContainText('Yisrael Beiteinu');await expect(detail).toContainText('885,163');await expect(detail).toContainText('+156,109');await expect(detail).not.toContainText('0 counted votes');await expect(detail).toContainText('Since');
 await expect(page.getByRole('tab',{name:'Party families',exact:true})).toHaveAttribute('aria-selected','true');
 await detail.getByRole('button',{name:'Open this election',exact:true}).click();await expect(page.locator('.family-treatment')).toContainText('Likud lineage');
});

for(const lang of ['he','en'])test(`family detail sheet keyboard and calculation caveats at 390: ${lang}`,async({page})=>{
 await page.setViewportSize({width:390,height:844});await start(page,lang,'dark');
 const marks=page.locator('.family-plots section').first().locator('g[role=button]');await marks.last().focus();await page.keyboard.press('Home');await expect(marks.first()).toBeFocused();
 await page.keyboard.press('ArrowRight');await expect(marks.nth(1)).toBeFocused();await page.keyboard.press('End');await expect(marks.last()).toBeFocused();await page.keyboard.press('Space');
 const d=page.getByRole('dialog');await expect(d.locator('.family-point')).toBeVisible({timeout:15000});await expect(d).toContainText(lang==='en'?'Calculated seats':'מנדטים מחושבים');
 expect(await d.evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);await d.evaluate(e=>{e.scrollTop=e.scrollHeight;});await expect(d.getByRole('button',{name:lang==='en'?'Close':'סגירה',exact:true})).toBeInViewport();
 await page.keyboard.press('Escape');await expect(d).not.toBeVisible();await expect(marks.last()).toBeFocused();
});


test('1988 changes name constituents in English and retain the sourced split',async({page})=>{
 await start(page);await page.locator('.family-plots section').first().locator('g[role=button]').nth(11).focus();await page.keyboard.press('Enter');
 const changes=page.locator('.family-point-changes');await expect(changes).toBeVisible({timeout:15000});await expect(changes).toContainText('Split · 1988');await expect(changes).toContainText('Degel HaTorah');expect(await changes.innerText()).not.toMatch(/[א-ת]/);
});

test('hover box names hatched lists’ parties, states the change, never grows or takes the pointer',async({page})=>{
 await start(page);const marks=page.locator('.family-plots section').first().locator('g[role=button]');
 await marks.nth(19).hover();const tip=page.getByRole('tooltip');
 await expect(tip).toContainText('Since 22 Jan 2013: −3.88 points');await expect(tip).toContainText('Yachad: Yachad + Otzma Yehudit');await expect(tip.locator('b')).toHaveText('Yachad');
 expect(await tip.evaluate(e=>getComputedStyle(e).pointerEvents)).toBe('none');
 const box=await tip.boundingBox();await page.waitForTimeout(800);expect(await tip.boundingBox()).toEqual(box);
 await page.getByRole('button',{name:'Haredi',exact:true}).click();await page.getByRole('button',{name:'Likud lineage',exact:true}).click();
 await page.locator('.family-plots section').first().locator('g[role=button]').nth(22).hover();await expect(page.getByRole('tooltip')).toContainText('Likud: Likud + Kulanu');
});
test('breakdown marks the family’s own parties in a mixed list and only they count as represented',async({page})=>{
 await start(page);const y=await page.evaluate(()=>scrollY);
 await page.locator('.family-plots section').first().locator('g[role=button]').nth(19).click();
 const d=page.getByRole('dialog',{name:'Election breakdown',exact:true});await expect(d.locator('.family-point-delta')).toContainText('Since 22 Jan 2013: −102,251 votes · −3.88 points · −5 seats');
 const mixed=d.locator('article[data-state=mixed]');await expect(mixed).toHaveCount(1);await expect(mixed.locator('[data-own] b')).toHaveText('Yachad');await expect(mixed).toContainText('Shown hatched, not counted');
 await expect(d.locator('.family-point-changes')).toContainText('Now represented: Yachad · U’Bizchutan');await expect(d.locator('.family-point-changes')).not.toContainText('Otzma');
 await expect(d.locator('article').first()).toHaveAttribute('data-state','counted');
 await d.getByRole('button',{name:'Close',exact:true}).click();expect(await page.evaluate(()=>scrollY)).toBe(y);
});
test('each mixed-list choice is named by its effect and shows its chart mark',async({page})=>{
 await start(page);const group=page.getByRole('group',{name:'Mixed-list policy',exact:true});
 for(const name of ['Show hatched','Count if family heads it','Count all','Leave out'])await expect(group.getByRole('button',{name,exact:true})).toHaveCount(1);
 expect(await group.locator('.family-policy-icon').evaluateAll(es=>es.map(e=>(e as HTMLElement).dataset.policy))).toEqual(['separate-segment','include-headed-list','include-whole-list','exclude']);
 await expect(page.locator('.family-policy')).toContainText('(family + other parties)');
 expect(await group.locator('.family-policy-icon[data-policy=exclude]').evaluate(e=>getComputedStyle(e).borderTopColor)).not.toBe('rgb(255, 255, 255)');
});
test('loading another membership election never moves the sections below',async({page})=>{
 await start(page);await edit(page);const picker=editor(page).locator('.family-picker'),bottom=()=>picker.evaluate(e=>e.getBoundingClientRect().bottom);
 await page.route('**/data/k25.json',async r=>{await new Promise(f=>setTimeout(f,600));await r.continue();});
 await editor(page).getByRole('button',{name:'Earlier membership election',exact:true}).click();await expect(picker).toHaveAttribute('aria-busy','true');const loading=await bottom();
 await expect(picker).toHaveAttribute('aria-busy','false');await expect(picker.locator('label').first()).toBeVisible();expect(await bottom()).toBe(loading);
 await expect(editor(page).getByRole('textbox',{name:'Preset name',exact:true})).toHaveAttribute('type','text');
});
test('Hebrew quick percentages read left to right like the stepper',async({page})=>{
 await start(page,'he');const q=page.locator('.family-scale .quick-actions button');
 const xs=await q.evaluateAll(es=>es.map(e=>[e.textContent,e.getBoundingClientRect().left] as const));expect([...xs].sort((a,b)=>a[1]-b[1]).map(x=>x[0])).toEqual(['−10%','−5%','+5%','+10%']);
});
