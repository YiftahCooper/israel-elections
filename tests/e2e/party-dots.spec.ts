import { expect, test } from '@playwright/test';
import { deflateRawSync } from 'node:zlib';
import { readFile } from 'node:fs/promises';
import { dataset } from '../graphics-cases.ts';
import { deltaE2000 } from '../../src/data/colour.ts';

for (const lang of ['he', 'en']) for (const theme of ['light', 'dark']) test(`all constituent dots, keys, hovers and exports: ${lang} ${theme}`, async ({page}) => {
  test.setTimeout(120000);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(v => {localStorage.setItem('israel-elections:v1',JSON.stringify({lang:v.lang,level:'expert'}));localStorage.setItem('israel-elections:settings',JSON.stringify({v:2,values:{theme:v.theme,decimals:2,starterTip:false}}));}, {lang, theme});
  for (const n of [25,24,19,16]) {
    const ds=dataset(n), joint=ds.lists.filter((l: {parties?: unknown[]})=>(l.parties?.length??0)>1);
    const payload={e:`k${n}`,n:'Party dots',b:ds.buildInfo.builtAt,l:joint.map((l:{id:string})=>({type:'setFactionSplit',listId:l.id,split:true}))};
    await page.goto('about:blank');
    await page.goto('/#s='+deflateRawSync(JSON.stringify(payload)).toString('base64url'));
    await expect(page.locator('.chamber [data-seat]')).toHaveCount(120, {timeout:30000});
    await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
    if(n===25){
      const fills=()=>page.locator('.chamber > svg [data-component-seat]').evaluateAll(nodes=>nodes.map(dot=>dot.getAttribute('fill')));
      const before=await fills();expect(before.length).toBeGreaterThan(0);
      await page.locator('.band').getByRole('button',{name:lang==='he'?'הגדרות':'Settings',exact:true}).click();
      const look=(en:string,he:string)=>page.locator('.personal-settings [data-setting="jointListSeats"]').getByRole('button',{name:lang==='he'?he:en,exact:true}).click();
      const seatFills=()=>page.locator('.chamber > svg [data-seat]').evaluateAll(nodes=>nodes.map(seat=>seat.getAttribute('fill')));
      // list colour only: no party dots, and every party colour is gone from the seats
      await look('List','רשימה');await expect(page.locator('.chamber > svg [data-component-seat]')).toHaveCount(0);
      expect((await seatFills()).some(f=>before.includes(f))).toBe(false);
      // party colour only: no ring, the seats themselves carry exactly the party colours the dots had
      await look('Party','מפלגה');await expect(page.locator('.chamber > svg [data-component-seat]')).toHaveCount(0);
      expect((await seatFills()).filter(f=>before.includes(f)).length).toBe(before.length);
      await look('Both','שניהם');await expect.poll(fills).toEqual(before);
      await page.keyboard.press('Escape');
    }
    for (const layout of ['hemicycle','blocks']) {
      await page.getByRole('group',{name:lang==='he'?'פריסה':'Chamber layout'}).getByRole('button',{name:layout==='hemicycle'?(lang==='he'?'קשת':'Arc'):(lang==='he'?'גושים':'Blocks'),exact:true}).click();
      const dots=page.locator('.chamber > svg [data-component-seat]');
      const expected=ds.lists.reduce((sum:number,l:{id:string;parties?:{id:string}[];candidates:{partyId?:string}[]})=>sum+((l.parties?.length??0)>1?l.candidates.slice(0,ds.officialSeats?.[l.id]??0).filter(c=>l.parties!.some(p=>p.id===c.partyId)).length:0),0);
      await expect(dots).toHaveCount(expected);
      const colours=await dots.evaluateAll(nodes=>nodes.map(dot=>{
        const seat=dot.parentElement!.querySelector('[data-seat]')! as SVGGraphicsElement, a=seat.getBBox(), b=(dot as SVGGraphicsElement).getBBox();
        return {id:dot.getAttribute('data-component-seat')!,fill:dot.getAttribute('fill')!,ring:seat.getAttribute('fill')!,stroke:dot.getAttribute('stroke'),share:b.width/a.width,centred:Math.abs(a.x+a.width/2-b.x-b.width/2)<0.01&&Math.abs(a.y+a.height/2-b.y-b.height/2)<0.01,
          css:getComputedStyle(dot).fill, key:getComputedStyle(document.querySelector(`[data-party-key="${dot.getAttribute('data-component-seat')}"]`)!).backgroundColor};
      }));
      expect(colours).toHaveLength(expected);
      for (const dot of colours) {
        // B4: the party fills most of the seat, the list colour is a thin ring at its edge, no outline between them
        expect(dot.share).toBeCloseTo(0.8,2);
        expect(dot.centred).toBe(true);
        expect(dot.stroke).toBeNull();
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
