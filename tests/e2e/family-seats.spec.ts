import {test,expect,type Page} from '@playwright/test';
async function start(page:Page,lang='en',level='simple') {
 await page.addInitScript(v=>{if(sessionStorage.getItem('seeded-seats'))return;sessionStorage.setItem('seeded-seats','1');localStorage.setItem('israel-elections:v1',JSON.stringify(v));localStorage.setItem('israel-elections:settings',JSON.stringify({v:2,values:{starterTip:false,decimals:2}}));},{lang,theme:'light',level,hintDismissed:true});
 await page.goto('/');await page.getByRole('tab',{name:lang==='he'?'משפחות מפלגות':'Party families',exact:true}).click();
 await expect(page.locator('.family-seat-section svg')).toHaveCount(1);
}
/** Show one family only (Haredi is selected first). */
async function only(page:Page,name:string){await page.getByRole('button',{name,exact:true}).click();await page.getByRole('button',{name:'Haredi',exact:true}).click();}
const bar=(page:Page,i:number)=>page.locator(`.family-seat-plot [data-bar="${i}"]:not([data-seg])`);
const seg=(page:Page,i:number,s:number)=>page.locator(`.family-seat-plot [data-bar="${i}"][data-seg="${s}"]`);

test('partners are shown by default at Simple, every one, smallest first; the switch hides them and is remembered',async({page})=>{
 await start(page);await only(page,'Religious Zionist');
 const sw=page.getByRole('switch',{name:'Show partners',exact:true});await expect(sw).toBeChecked();
 // 1999 (bar 14): own 7, then Herut 1, Gesher 2, Moledet 2, Labor 23 on top
 await expect(seg(page,14,0)).toHaveAttribute('aria-label',/^Religious Zionist: 7 seats/);
 await expect(page.locator('.family-seat-plot [data-bar="14"][data-seg]')).toHaveCount(5);
 for(const [s,label] of [[1,/^Herut – The National Movement: 1 seat · National Union · 1999$/],[2,/^Gesher: 2 seats · One Israel · 1999$/],[3,/^Moledet: 2 seats · National Union · 1999$/],[4,/^Israeli Labor Party: 23 seats · One Israel · 1999$/]] as const)await expect(seg(page,14,s)).toHaveAttribute('aria-label',label);
 // each partner's colour shows: no segment is empty, and the tall bar fades instead of growing
 for(const s of [1,2,3,4])expect(Number(await seg(page,14,s).getAttribute('height'))).toBeGreaterThan(2);
 await expect(page.locator('.family-seat-plot [data-bar="14"][data-seg="4"]').locator('..')).toHaveAttribute('mask',/url/);
 await expect(page.locator('.family-seat-plot svg')).toHaveJSProperty('clientHeight',300);
 await expect(page.locator('.family-seat-label').nth(14)).toHaveText('7');await expect(page.locator('.family-seat-plus').filter({hasText:'+28'})).toHaveCount(1);
 await sw.uncheck();await expect(page.locator('.family-seat-partner')).toHaveCount(0);await expect(page.locator('.family-seat-plus')).toHaveCount(0);
 await page.reload();await page.getByRole('tab',{name:'Party families',exact:true}).click();await only(page,'Religious Zionist');
 await expect(page.getByRole('switch',{name:'Show partners',exact:true})).not.toBeChecked();await expect(page.locator('.family-seat-partner')).toHaveCount(0);
 await page.getByRole('switch',{name:'Show partners',exact:true}).check();await expect(page.locator('.family-seat-partner').first()).toBeVisible();
});

test('hovering a segment gives its exact facts; the bar lists every partner with seats and list',async({page})=>{
 await start(page,'en','standard');await only(page,'Religious');
 await seg(page,14,6).hover();const tip=page.getByRole('tooltip');
 await expect(tip).toContainText('Israeli Labor Party: 23 seats · One Israel');await expect(tip).toContainText('31 seats');await expect(tip).toContainText('Partners on joint lists: +31');
 for(const row of ['Herut – The National Movement 1 · National Union','Party not recorded 1 · United Arab List','Gesher 2 · One Israel','Moledet 2 · National Union','Arab Democratic Party 2 · United Arab List'])await expect(tip).toContainText(row);
 // the space above a bar is the bar's own target
 await bar(page,25).hover({position:{x:4,y:4}});await expect(tip).toContainText('Zehut 1 · Religious Zionism–Zehut');await expect(tip).not.toContainText('Israeli Labor Party');
});

test('keyboard: arrows move between elections, up and down through a bar’s segments, Enter opens details',async({page})=>{
 await start(page);await only(page,'Russian-speaking');
 await bar(page,25).focus();for(let i=0;i<7;i++)await page.keyboard.press('ArrowLeft');
 await expect(bar(page,18)).toBeFocused();await expect(page.getByRole('tooltip')).toContainText('Partners on joint lists: +20');
 await page.keyboard.press('ArrowUp');await expect(seg(page,18,0)).toBeFocused();await expect(page.getByRole('tooltip')).toContainText('Russian-speaking: 11 seats');
 await page.keyboard.press('ArrowUp');await expect(seg(page,18,1)).toBeFocused();await expect(page.getByRole('tooltip')).toContainText('Likud: 20 seats · Likud–Yisrael Beiteinu');
 await page.keyboard.press('Escape');await expect(bar(page,18)).toBeFocused();
 await page.keyboard.press('Enter');await expect(page.getByRole('dialog',{name:'Election breakdown'})).toBeVisible();
});

test('touch: the first tap shows the facts, the second opens the details; Hebrew names',async({browser})=>{
 const ctx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const page=await ctx.newPage();
 await start(page,'he');await page.getByRole('button',{name:'ציונות דתית',exact:true}).click();await page.getByRole('button',{name:'חרדים',exact:true}).click();
 await seg(page,24,1).tap();await expect(page.getByRole('tooltip')).toContainText('עוצמה יהודית');await expect(page.getByRole('tooltip')).toContainText('הקשה נוספת לפירוט');
 await expect(page.locator('dialog[open]')).toHaveCount(0);
 await seg(page,24,1).tap();await expect(page.getByRole('dialog',{name:'פירוט הבחירות'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await ctx.close();
});

test('years without seats: no list is a dash, a list with no seats is 0, Morasha 1984 on both charts',async({page})=>{
 await start(page);await only(page,'Radical right');
 await expect(bar(page,0)).toHaveAttribute('aria-label',/Did not contest/);await expect(bar(page,18)).toHaveAttribute('aria-label',/Radical right · 0 seats$/);
 await page.getByRole('button',{name:'Haredi',exact:true}).click();await page.getByRole('button',{name:'Radical right',exact:true}).click();
 await expect(seg(page,10,1)).toHaveAttribute('aria-label','Matzad: 1 seat · Morasha · 1984');
 await page.getByRole('button',{name:'Religious Zionist',exact:true}).click();await page.getByRole('button',{name:'Haredi',exact:true}).click();
 await expect(seg(page,10,1)).toHaveAttribute('aria-label','Poalei Agudat Yisrael: 1 seat · Morasha · 1984');
});
