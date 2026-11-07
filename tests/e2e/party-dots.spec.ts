import { expect, test } from '@playwright/test';
import { deflateRawSync } from 'node:zlib';
import { readFile } from 'node:fs/promises';
import { dataset } from '../graphics-cases.ts';
import { colourContrast } from '../../src/app/partyDisplayColor.ts';
import { deltaE2000 } from '../../src/data/colour.ts';

for (const lang of ['he', 'en']) for (const theme of ['light', 'dark']) test(`all constituent dots, keys, hovers and exports: ${lang} ${theme}`, async ({page}) => {
  test.setTimeout(120000);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(v => localStorage.setItem('israel-elections:v1', JSON.stringify(v)), {lang, theme, level:'expert', hintDismissed:true});
  for (const n of [25,24,19,16]) {
    const ds=dataset(n), joint=ds.lists.filter((l: {parties?: unknown[]})=>(l.parties?.length??0)>1);
    const payload={e:`k${n}`,n:'Party dots',b:ds.buildInfo.builtAt,l:joint.map((l:{id:string})=>({type:'setFactionSplit',listId:l.id,split:true}))};
    await page.goto('about:blank');
    await page.goto('/#s='+deflateRawSync(JSON.stringify(payload)).toString('base64url'));
    await expect(page.locator('.chamber [data-seat]')).toHaveCount(120, {timeout:30000});
    for (const layout of ['hemicycle','blocks']) {
      await page.getByRole('group',{name:lang==='he'?'פריסה':'Chamber layout'}).getByRole('button',{name:layout==='hemicycle'?(lang==='he'?'קשת':'Arc'):(lang==='he'?'גושים':'Blocks'),exact:true}).click();
      const dots=page.locator('.chamber > svg [data-component-seat]');
      const colours=await dots.evaluateAll(nodes=>nodes.map(dot=>({id:dot.getAttribute('data-component-seat')!,fill:dot.getAttribute('fill')!,ring:dot.parentElement!.querySelector('[data-seat]')!.getAttribute('fill')!, css:getComputedStyle(dot).fill, key:getComputedStyle(document.querySelector(`[data-party-key="${dot.getAttribute('data-component-seat')}"]`)!).backgroundColor})));
      const expected=ds.lists.reduce((sum:number,l:{id:string;parties?:{id:string}[];candidates:{partyId?:string}[]})=>sum+((l.parties?.length??0)>1?l.candidates.slice(0,ds.officialSeats?.[l.id]??0).filter(c=>l.parties!.some(p=>p.id===c.partyId)).length:0),0);
      expect(colours).toHaveLength(expected);
      for (const dot of colours) {
        expect(colourContrast(dot.fill,dot.ring)).toBeGreaterThanOrEqual(3);
        expect(deltaE2000(dot.fill,dot.ring)).toBeGreaterThanOrEqual(20);
        expect(dot.key).toBe(dot.css);
      }
      const partyIds=[...new Set(colours.map(c=>c.id))];
      for (const id of partyIds) {
        const dot=colours.find(c=>c.id===id)!;
        const list=joint.find((l:{parties:{id:string}[]})=>l.parties.some(p=>p.id===id));
        for (const sibling of list.parties) {
          const other=colours.find(c=>c.id===sibling.id);if(other&&other.id!==id)expect(deltaE2000(dot.fill,other.fill)).toBeGreaterThanOrEqual(20);
        }
      }
      await dots.first().locator('..').locator('[data-seat]').hover();
      await expect(page.locator('[data-hover-party]')).toHaveCount(1);
      await page.mouse.move(0,0);
      if (n===25) {
        const pending=page.waitForEvent('download');
        await page.getByRole('button',{name:lang==='he'?'ייצוא SVG':'Export SVG',exact:true}).click();
        const svg=await readFile((await (await pending).path())!,'utf8');
        for (const dot of colours) expect(svg).toContain(`fill="${dot.fill}"`);
        expect(svg).not.toContain('var(--');
      }
    }
  }
});
