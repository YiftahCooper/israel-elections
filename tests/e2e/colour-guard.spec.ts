import{expect,test}from'@playwright/test';
import{deflateRawSync}from'node:zlib';
import{dataset}from'../graphics-cases.ts';
import{deltaE2000}from'../../src/data/colour.ts';
import{contrastRatio}from'../../src/data/colourGuard.ts';
for(const lang of ['en','he'])for(const theme of ['light','dark'])for(const width of [1500,390])test(`colour guidance and Save as identities ${lang} ${theme} ${width}`,async({page})=>{
 const L=(en:string,he:string)=>lang==='en'?en:he,ds=dataset(25);
 await page.setViewportSize({width,height:1000});await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(v=>{localStorage.setItem('israel-elections:v1',JSON.stringify({lang:v.lang,level:'expert'}));localStorage.setItem('israel-elections:settings',JSON.stringify({v:2,values:{theme:v.theme,decimals:2,starterTip:false}}));},{lang,theme});
 const p={e:'k25',n:'Colour A',b:ds.buildInfo.builtAt,l:[{type:'setVotes',listId:ds.lists[0].id,votes:ds.lists[0].votes+1}]};
 await page.goto('/#s='+deflateRawSync(JSON.stringify(p)).toString('base64url'));
 await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
 await page.getByRole('tab',{name:L('Scenarios','תרחישים'),exact:true}).click();
 await page.locator('.scn-save').click();
 for(const name of ['Colour B','Colour C']){
  await page.locator('.scn-current').getByRole('button',{name:L('Save as…','שמירה בשם…'),exact:true}).click();
  const dialog=page.locator('dialog[open]');await dialog.getByRole('button',{name:L('Choose another name','בחירת שם אחר'),exact:true}).click();await dialog.getByRole('textbox').fill(name);await dialog.getByRole('button',{name:L('Save','שמירה'),exact:true}).click();
 }
 const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('israel-elections:v1')!).saved);
 await expect.poll(async()=>new Set((await saved()).map((s:any)=>s.log.findLast((a:any)=>a.type==='setIdentityColor').color)).size).toBe(3);
 const entries=await saved(),colors=entries.map((s:any)=>s.log.findLast((a:any)=>a.type==='setIdentityColor').color);
 colors.forEach((a:string,i:number)=>colors.slice(i+1).forEach((b:string)=>expect(deltaE2000(a,b)).toBeGreaterThanOrEqual(20)));
 await page.locator('.scn-options summary').click();
 const picker=page.locator('.scn-options .colour-picker'),input=picker.locator('input[type=color]');
 const clash=entries.find((s:any)=>s.name==='Colour A').log.findLast((a:any)=>a.type==='setIdentityColor').color;
 await input.fill(clash);await expect(input).toHaveValue(clash);
 await expect(picker.getByRole('status')).toContainText(L('Hard to tell apart from','קשה להבחין בינו לבין'));
 await picker.getByRole('button',{name:L('Colour checks','בדיקת צבעים'),exact:true}).click();
 await expect(page.getByRole('tooltip')).toContainText('CIEDE2000');await page.keyboard.press('Escape');
 // The rebuilt Settings popup and large-text layout preserve the explicit choice and its advice.
 await page.locator('.scn-options').getByRole('button',{name:L('Settings…','הגדרות…'),exact:true}).click();
 const settings=page.locator('.personal-settings');
 await expect(settings.locator('[data-setting="markChanges"]')).toBeInViewport();
 await settings.locator('[data-setting="textSize"]').getByRole('button',{name:L('Large','גדול'),exact:true}).click();
 await page.keyboard.press('Escape');
 await expect(page.locator('html')).toHaveAttribute('data-text','large');
 await expect(input).toHaveValue(clash);
 await expect(picker.getByRole('status')).toContainText(L('Hard to tell apart from','קשה להבחין בינו לבין'));
 await page.screenshot({path:`.backup-scratch/v1c/advice-${lang}-${theme}-${width}.png`,fullPage:true});
 await picker.getByRole('button',{name:L('Use alternative','בחירת חלופה'),exact:true}).click();
 await expect(input).toBeFocused();expect(await input.inputValue()).not.toBe(clash);
 const band=await page.locator('.band').evaluate(el=>({background:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color}));
 const hex=(s:string)=>'#'+s.match(/\d+/g)!.slice(0,3).map(x=>(+x).toString(16).padStart(2,'0')).join('');
 expect(contrastRatio(hex(band.color),hex(band.background))).toBeGreaterThanOrEqual(4.5);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
