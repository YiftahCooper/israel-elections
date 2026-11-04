import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {deflateRawSync} from 'node:zlib';
import {graphicsCases,dataset} from '../graphics-cases.ts';
test.describe.configure({mode:'parallel'});
for(const lang of ['he','en']) for(const theme of ['light','dark']) for(const phone of [false,true]) {
  test(`graphics invariants and captures ${lang} ${theme} ${phone?'phone':'desktop'}`,async({page})=>{
    test.setTimeout(180000);
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.setViewportSize(phone?{width:390,height:844}:{width:1440,height:900});
    await page.addInitScript(v=>localStorage.setItem('israel-elections:v1',JSON.stringify(v)),{lang,theme,level:'expert',hintDismissed:true,markOfficial:true});
    for(const c of [...graphicsCases,...Array.from({length:26},(_,i)=>({name:`k${i+1}`,n:i+1,actions:[]}))]) {
      const payload={e:`k${c.n}`,n:'Graphics audit',b:dataset(c.n).buildInfo.builtAt,l:c.actions};
      await page.goto('about:blank');
      await page.goto('/#s='+deflateRawSync(JSON.stringify(payload)).toString('base64url'));
      await expect(page.locator('.chamber [data-seat]')).toHaveCount(120);
      await page.evaluate(()=>document.fonts.ready);
      const check = async()=> {
        const errors=await page.locator('.chamber').first().evaluate(el=>{
          const svg=el.querySelector('svg[role="img"]') as SVGSVGElement;
          const regions=[...svg.querySelectorAll<SVGGeometryElement>('[data-bloc-region]')];
          const errors:string[]=[];
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
      if(!c.name.startsWith('k')) await page.screenshot({path:`.backup-scratch/graphics-audit/${c.name}-${lang}-${theme}-${phone?'phone':'desktop'}.png`,fullPage:true});
      await page.getByRole('group',{name:lang==='he'?'פריסה':'Chamber layout'}).getByRole('button',{name:lang==='he'?'גושים':'Blocks',exact:true}).click();
      await expect(page.locator('.chamber [data-seat]')).toHaveCount(120);
      await check();
      if(!c.name.startsWith('k')) await page.locator('.chamber').first().screenshot({path:`.backup-scratch/graphics-audit/blocks-${c.name}-${lang}-${theme}-${phone?'phone':'desktop'}.png`});
      for (const mode of ['bloc','party','list']) {
        await page.getByRole('combobox',{name:lang==='he'?'צביעת מושבים לפי':'Colour seats by'}).selectOption(mode);
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
  expect(svg).toContain('Baseline outline');
  expect(svg).toMatch(/stroke-dasharray="3(?:px)?[, ]+2(?:px)?"/);
  await expect(page.locator('.baseline-mini [data-baseline-slot]')).toHaveCount(120);
  await expect(page.locator('.baseline-mini [data-lost]')).toHaveCount(9);
  const readout=(await page.locator('.chamber .graphic-changes').innerText()).replace(/[\u2066-\u2069]/g,'');
  expect(readout).toContain('0 → 4 (+4)');
  expect(readout).toContain('0 → 5 (+5)');
});
