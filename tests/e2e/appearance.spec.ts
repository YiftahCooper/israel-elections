import { expect, test } from '@playwright/test';
import { choose } from './choices.ts';
for(const election of ['k26','k25']) test(`${election}: cosmetic colours never mark or tint the result through save and share; reset keeps votes`,async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('israel-elections:v1', ((o: { theme?: string; hintDismissed?: boolean; [k: string]: unknown }) => { if (!sessionStorage.getItem('seeded-settings')) sessionStorage.setItem('seeded-settings', '1'), localStorage.setItem('israel-elections:settings', JSON.stringify({ v: 2, values: { ...(o.theme ? { theme: o.theme } : {}), ...(o.hintDismissed ? { starterTip: false } : {}), decimals: 2 } })); return JSON.stringify(o); })({lang:'en',theme:'light',level:'expert',hintDismissed:true})));
 await page.goto('/');await choose(page.getByRole('button',{name:'Election',exact:true}),election);
 // colours never mark or tint the result; a saved colour scenario is still its own entry in the switcher (c-state-code-02)
 const official=async(key:string|RegExp='official')=>{
  await expect(page.locator('.band .scenario-switcher .choice-trigger')).toHaveAttribute('data-value',key);
  expect(await page.locator('.app').evaluate(el=>(el as HTMLElement).style.getPropertyValue('--scenario-color'))).toBe('');
  await expect(page.locator('.session')).toContainText('No changes');await expect(page.locator('.edit-marker')).toHaveCount(0);
 };
 await page.getByRole('button',{name:'Edit blocs',exact:true}).click();
 const panel=page.locator('.bloc-panel');
 await panel.locator('.bp-swatch').first().click();await panel.locator('.bp-palette button').last().click();
 await official();await panel.getByRole('button',{name:'Close',exact:true}).click();
 // Open a joint list so both its list colour and constituent party colour can be edited.
 await page.getByRole('region',{name:'Lists',exact:true}).getByRole('button',{name:'Likud',exact:true}).click();
 const detail=page.locator('.side-panel');
 const colours=detail.locator('input[type=color]');
 await colours.first().fill('#123456');
 if(await colours.count()>1)await colours.nth(1).fill('#654321');
 await official();
 await page.getByRole('tab',{name:'Scenarios',exact:true}).click();
 await page.locator('.scn-save').click();const saved=await page.locator('.band .scenario-switcher .choice-trigger').getAttribute('data-value');
 expect(saved).toMatch(new RegExp(`^${election}-`));await official(saved!);
 await page.getByRole('tab',{name:'Overview',exact:true}).click();
 if(!await page.locator('.side-panel input[type=color]').count())await page.getByRole('region',{name:'Lists',exact:true}).getByRole('button',{name:'Likud',exact:true}).click();
 await page.locator('.side-panel input[type=color]').first().fill('#abcdef');
 await page.getByRole('tab',{name:'Scenarios',exact:true}).click();
 await page.locator('.scn-current').getByRole('button',{name:'Reopen saved version',exact:true}).click();await official(saved!);
 await page.getByRole('button',{name:'Copy a share link',exact:true}).click();
 const link=await page.getByRole('textbox',{name:'Share link',exact:true}).inputValue();await page.goto(link);await official(new RegExp(`^${election}-`));// a named link is its own (unsaved) scenario
 await page.getByRole('tab',{name:'Overview',exact:true}).click();
 await page.getByRole('region',{name:'Lists',exact:true}).getByRole('button',{name:'Likud',exact:true}).click();
 await expect(page.locator('.side-panel input[type=color]').first()).toHaveValue('#123456');
 const votes=page.locator('.side-panel').getByRole('textbox',{name:'Votes',exact:true});
 await votes.fill('1120000');await votes.press('Enter');
 expect(await page.locator('.app').evaluate(el=>(el as HTMLElement).style.getPropertyValue('--scenario-color'))).not.toBe('');
 await page.locator('.side-panel').getByRole('button',{name:'Reset colours',exact:true}).click();
 await expect(votes).toHaveValue('1,120,000');
 expect(await page.locator('.app').evaluate(el=>(el as HTMLElement).style.getPropertyValue('--scenario-color'))).not.toBe('');
 await choose(page.locator('.band .scenario-switcher .choice-trigger'),'official');await official();
 await page.getByRole('region',{name:'Lists',exact:true}).getByRole('button',{name:'Likud',exact:true}).click();
 await expect(page.locator('.side-panel input[type=color]').first()).toHaveValue('#123456');
});
