import { choose } from './choices.ts';
import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {deflateRawSync} from 'node:zlib';
import {graphicsCases,dataset} from '../graphics-cases.ts';
test.describe.configure({mode:'parallel'});
for(const lang of ['he','en']) for(const theme of ['light','dark']) for(const phone of [false,true]) {
  test(`graphics invariants and captures ${lang} ${theme} ${phone?'phone':'desktop'}`,async({page})=>{
    test.setTimeout(Number(process.env.PW_GRAPHICS_TIMEOUT ?? 180000));
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.setViewportSize(phone?{width:390,height:844}:{width:1440,height:900});
    await page.addInitScript(v=>localStorage.setItem('israel-elections:v1',JSON.stringify(v)),{lang,theme,level:'expert',hintDismissed:true,markOfficial:true});
    for(const c of [...graphicsCases,...Array.from({length:26},(_,i)=>({name:`k${i+1}`,n:i+1,actions:[]}))]) {
      const payload={e:`k${c.n}`,n:'Graphics audit',b:dataset(c.n).buildInfo.builtAt,l:c.actions};
      await page.goto('about:blank');
      await page.goto('/#s='+deflateRawSync(JSON.stringify(payload)).toString('base64url'));
      await expect(page.locator('.chamber [data-seat]')).toHaveCount(120, { timeout: Number(process.env.PW_GRAPHICS_READY_TIMEOUT ?? 15000) });
      await page.evaluate(()=>document.fonts.ready);
      const check = async()=> {
        const errors=await page.locator('.chamber').first().evaluate(el=>{
          const svg=el.querySelector('svg[role="img"]') as SVGSVGElement;
          const regions=[...svg.querySelectorAll<SVGGeometryElement>('[data-bloc-region]')];
          const errors:string[]=[];
          // a hairline in the region's own colour only closes antialiasing seams; any other stroke is a stray outline
          if([...el.querySelectorAll('.wedge')].some(region=>{const st=getComputedStyle(region);return st.stroke!=='none'&&st.stroke!==st.fill;})) errors.push('stroked region');
          if([...svg.querySelectorAll('path:not([data-bloc-boundary]):not([data-bloc-boundary-gap])')].some(path=>getComputedStyle(path).fill==='none' && getComputedStyle(path).stroke!=='none')) errors.push('stray outline');
          for(const seat of svg.querySelectorAll<SVGGeometryElement>('[data-seat]')) {
            const box=seat.getBBox();
            const vb=svg.viewBox.baseVal;
            if(box.x<vb.x||box.y<vb.y||box.x+box.width>vb.x+vb.width||box.y+box.height>vb.y+vb.height)errors.push('seat bounds');
            const bloc=seat.getAttribute('data-bloc') ?? seat.parentElement?.querySelector('[data-bloc-region]')?.getAttribute('data-bloc-region');
            const own=regions.filter(r=>r.getAttribute('data-bloc-region')===bloc);
            for(let k=0;k<16;k++) {
              const a=k*Math.PI/8;
              const p=new DOMPoint(box.x+box.width/2+Math.cos(a)*box.width*.49,box.y+box.height/2+Math.sin(a)*box.height*.49);
              if(!own.some(r=>r.isPointInFill(p))) {errors.push('seat outside region');break;}
            }
          }
          const labels=[...el.querySelectorAll('.legend button')].map(l=>l.getBoundingClientRect());
          const edge=el.getBoundingClientRect(), seats=svg.getBoundingClientRect();
          labels.forEach((a,i)=>{
            if(a.left<edge.left-1||a.right>edge.right+1||a.top<seats.bottom-1) errors.push('label bounds');
            labels.slice(i+1).forEach(b=>{if(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top)errors.push('label overlap');});
          });
          if(document.documentElement.scrollWidth>innerWidth)errors.push('page overflow');
          return errors;
        });
        expect(errors,c.name).toEqual([]);
      };
      await check();
      if(c.name==='owner') {
        // seat changes are said in the change line and on each list row (directly under the chamber on phones), not again under the chamber
        await expect(page.locator('.chamber .graphic-change-row')).toHaveCount(0);
        await expect(page.locator('.lbars .lb-row .delta-segment')).toHaveCount(9);
        await expect(page.locator('.baseline-mini [data-reference-seat]')).toHaveCount(120);
        const lefts=await page.locator('.strip .corridor').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().left));
        expect(lefts).toEqual([...lefts].sort((a,b)=>a-b));
        if(!phone) {
          const main=(await page.locator('.chamber > svg').boundingBox())!;
          const mini=(await page.locator('.baseline-mini').boundingBox())!;
          expect(mini.width/main.width).toBeLessThan(0.38);
        }
      }
      await expect(page.locator('.blocs-head > select, .chamber-panel select')).toHaveCount(0);
      if(!c.name.startsWith('k')) await page.screenshot({path:`.backup-scratch/graphics-audit/${c.name}-${lang}-${theme}-${phone?'phone':'desktop'}.png`,fullPage:true});
      await page.getByRole('group',{name:lang==='he'?'פריסה':'Chamber layout'}).getByRole('button',{name:lang==='he'?'גושים':'Blocks',exact:true}).click();
      await expect(page.locator('.chamber [data-seat]')).toHaveCount(120);
      await check();
      if(!c.name.startsWith('k')) await page.locator('.chamber').first().screenshot({path:`.backup-scratch/graphics-audit/blocks-${c.name}-${lang}-${theme}-${phone?'phone':'desktop'}.png`});
      for (const mode of ['bloc','party','list']) {
        await choose(page.locator('.chamber-tools').getByRole('button',{name:lang==='he'?'צביעת מושבים לפי':'Colour seats by',exact:true}),mode);
        await check();
      }
    }
  });
}


test('chamber export retains labels and standalone comparison ink',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('israel-elections:v1',JSON.stringify({lang:'en',theme:'dark',level:'expert',markOfficial:true})));
  const c=graphicsCases[0];
  await page.goto('/#s='+deflateRawSync(JSON.stringify({e:'k25',n:'Export audit',b:dataset(25).buildInfo.builtAt,l:c.actions})).toString('base64url'));
  await expect(page.locator('.chamber [data-seat]')).toHaveCount(120);
  const pending=page.waitForEvent('download');
  await page.getByRole('button',{name:'Export SVG',exact:true}).click();
  const download=await pending;
  const path='.backup-scratch/graphics-audit/export.svg';
  await download.saveAs(path);
  const svg=readFileSync(path,'utf8');
  expect(svg).toContain('Meretz 4');
  expect(svg).toContain('Balad 5');
  expect(svg).not.toContain('var(--');
  expect(svg).toContain('Official result');
  expect(svg).toMatch(/stroke-dasharray="4(?:px)?[, ]+3(?:px)?"/);
  await expect(page.locator('.baseline-mini [data-reference-seat]')).toHaveCount(120);
  await expect(page.locator('.baseline-mini [data-lost]')).toHaveCount(9);
  // the per-list seat changes are said once, in the change line, not again under the chamber
  await expect(page.locator('.chamber .graphic-changes')).toHaveCount(0);
  const readout=(await page.locator('.session').innerText()).replace(/[\u2066-\u2069]/g,'');
  expect(readout).toContain('Meretz 4 (▲ +4)');
  expect(readout).toContain('Balad 5 (▲ +5)');
});


test('summary, graphics and Compare default follow the same reference setting',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('israel-elections:v1',JSON.stringify({lang:'en',theme:'dark',level:'expert',markOfficial:true})));
  const c=graphicsCases[0];
  await page.goto('/#s='+deflateRawSync(JSON.stringify({e:'k25',n:'Graphics audit',b:dataset(25).buildInfo.builtAt,l:c.actions})).toString('base64url'));
  for(const [setting,name,changed] of [['official','Official result',true],['reference','Graphics audit',false],['official','Official result',true]] as const) {
    await page.getByRole('tab',{name:'Scenarios',exact:true}).click();
    if (!await page.locator('.scn-options').evaluate(el => el.hasAttribute('open'))) await page.locator('.scn-options summary').click();
    await choose(page.getByRole('button',{name:'Mark differences from'}), setting);
    await page.getByRole('tab',{name:'Overview',exact:true}).click();
    await expect(page.locator('.session > b')).toHaveText(`Since ${name==='Official result'?'official result':name}`);
    // the key names the reference once when seats differ; with nothing to mark the session line already says so
    if(changed) await expect(page.locator('.chamber .graphic-key')).toContainText(name);
    else await expect(page.locator('.chamber .graphic-key')).toHaveCount(0);
    await expect(page.locator('.session')).toContainText(changed?'Meretz':'No seats changed');
    await expect(page.locator('.baseline-mini [data-reference-seat]')).toHaveCount(changed?120:0);
    if(changed) {
      await expect(page.locator('.session')).toContainText('+4 more');
      await expect(page.locator('.chamber .graphic-changes')).toHaveCount(0);
      const order=await page.locator('.strip .corridor').evaluateAll(nodes=>nodes.map(n=>n.textContent));
      expect(order[1]).toContain('No bloc');
      const x=await page.locator('.chamber [data-seat][data-bloc="__none"]').evaluateAll(nodes=>nodes.map(n=>Number(n.getAttribute('cx'))));
      expect(Math.min(...x)).toBeGreaterThan(350);
      expect(Math.max(...x)).toBeLessThan(650);
    }
    await page.getByRole('tab',{name:'Compare',exact:true}).click();
    // With nothing to compare, the automatic target is the previous election.
    if(changed) await expect(page.locator('.cmp-head .choice-trigger')).toHaveText(new RegExp(name));
    else await expect(page.locator('.cmp-head .choice-trigger')).toHaveAttribute('data-value', 'election:k24');
    if(changed) expect(await page.locator('.cmp-blocrow').last().locator('i').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-bloc')))).toEqual(expect.arrayContaining(['__none']));
  }
});

test('election choice awaits committed data before opening a list',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('israel-elections:v1',JSON.stringify({lang:'en',level:'simple',hintDismissed:true})));
  let requests=0;
  await page.route('**/data/k24.json',async route=>{
    requests++;
    await new Promise(resolve=>setTimeout(resolve,1000));
    await route.continue();
  });
  await page.goto('/');
  await expect(page.locator('.lb-row').first()).toBeVisible();
  const election=page.getByRole('button',{name:'Election',exact:true});
  await expect(election).toHaveAttribute('data-value','k26');
  await choose(election,'k24');
  expect(await election.getAttribute('data-value')).toBe('k24');
  expect(requests).toBeGreaterThan(0);
  await page.getByRole('region',{name:'Lists',exact:true}).getByRole('button',{name:'Likud',exact:true}).click();
  await expect(page.getByRole('region',{name:'List details',exact:true}).getByText(/^Who gets in/)).toBeVisible();
});
