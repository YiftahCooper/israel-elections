import{existsSync}from'node:fs';
import{localityLeaderIds}from'../src/data/locality-leaders.ts';
import{MAP_UNASSIGNED_COLOUR}from'../src/app/locality-map-model.ts';
import {readFileSync} from 'node:fs';
import {expect,test} from 'vitest';
import {contrastRatio,inkOn,colourPasses,markOutline,COLOUR_RULES} from '../src/data/colourGuard.ts';
import {blocTints,deltaE2000,mixHex} from '../src/data/colour.ts';
import {SCENARIO_PALETTE} from '../src/model/scenarioColors.ts';
import {FAMILY_COLOURS} from '../src/families/colors.ts';
import {BLOC_PALETTE} from '../src/model/blocColors.ts';
import {dataset} from './graphics-cases.ts';
const css=readFileSync('src/app/styles.css','utf8'),delta=readFileSync('src/app/components/seat-delta.css','utf8');
const tokens=(s:string)=>Object.fromEntries([...s.matchAll(/--([\w-]+):\s*(#[\da-f]{6})/gi)].map(m=>[m[1],m[2]]));
const blocks=(s:string)=>[s.match(/:root\s*\{([^}]+)/)![1],s.match(/\[data-theme="dark"\]\s*\{([^}]+)/)![1]];
for(const [i,theme] of ['light','dark'].entries())test(`${theme}: shipped text, marks and categorical map classes remain legible`,()=>{
 const t={...tokens(blocks(css)[0]),...tokens(blocks(delta)[0]),...(i?{...tokens(blocks(css)[1]),...tokens(blocks(delta)[1])}:{})};
 const problems:string[]=[];
 const check=(fg:string,bg:string,min:number,where:string)=>{const ratio=contrastRatio(fg,bg);if(ratio<min)problems.push(`${where}: ${fg} / ${bg} = ${ratio.toFixed(3)} < ${min}`);};
 for(const fg of ['ink','ink-2','muted','focus','bad','exp','seat-gain','seat-loss'])for(const bg of ['page','surface','surface-2','open'])check(t[fg],t[bg],4.5,`${fg} on ${bg}`);
 for(const bg of ['shell','shell-2'])for(const fg of ['shell-ink','shell-ink-2'])check(t[fg],t[bg],4.5,`${fg} on ${bg}`);
 check(t['warn-ink'],t['warn-bg'],4.5,'warning');check(t.ink,t['err-bg'],4.5,'error');check(t.bad,t['err-bg'],4.5,'error detail');
 for(const bg of ['thr-a','thr-b'])check(t.thr,t[bg],4.5,'threshold hatching');
 check('#15171a',t.slip,4.5,'ballot paper');
 for(const [context,palette]of [['scenarios',SCENARIO_PALETTE],['families',Object.values(FAMILY_COLOURS)],['bloc picker',BLOC_PALETTE]]as const){
  palette.forEach((c,j)=>{check(c,t.surface,3,`${context} mark`);check(c,t['surface-2'],3,`${context} mark on quiet`);check(inkOn(c),c,4.5,`${context} ink`);for(const other of palette.slice(j+1))if(deltaE2000(c,other)<20)problems.push(`${context}: ${c} / ${other} ΔE ${deltaE2000(c,other)}`);});
 }
 // The map is categorical, not a sequential scale. Its classes are these same list/bloc identities
 // plus the tie/unassigned grey. Dual black/white halos isolate points from arbitrary basemap tiles.
 for(let n=1;n<=26;n++){
  const ds=dataset(n),colors=[...ds.lists.filter((l:{id:string})=>(ds.officialSeats?.[l.id]??0)>0).map((l:{color:string})=>l.color),MAP_UNASSIGNED_COLOUR];
  const localFile=`public/data/k${n}-localities.json`;
  if(existsSync(localFile)){const leaders=localityLeaderIds(JSON.parse(readFileSync(localFile,'utf8'))),palette=ds.lists.filter((l:{id:string})=>leaders.has(l.id));
   palette.forEach((a:{color:string;id:string},j:number)=>palette.slice(j+1).forEach((b:{color:string;id:string})=>expect(deltaE2000(a.color,b.color),`k${n} map ${a.id}/${b.id}`).toBeGreaterThanOrEqual(15)));
   for(const a of palette)expect(deltaE2000(a.color,MAP_UNASSIGNED_COLOUR)).toBeGreaterThanOrEqual(20);
  }
  for(const color of colors.filter(c=>c!==MAP_UNASSIGNED_COLOUR))expect(deltaE2000(color,MAP_UNASSIGNED_COLOUR)).toBeGreaterThanOrEqual(20);
  for(const color of colors){check(markOutline(color,t.surface),t.surface,3,`k${n} map/seat boundary`);check(t['ink-2'],t.surface,3,'swatch/bar outline');check(Math.max(contrastRatio('#ffffff',color),contrastRatio('#111418',color))===contrastRatio('#ffffff',color)?'#ffffff':'#111418',color,3,'map halo against fill');}
  for(const scheme of ds.blocSchemes??[])for(const b of scheme.blocs){
   const tint=blocTints(b.color)[i];check(t['ink-2'],tint,3,`k${n} bloc boundary`);
   for(const weight of [i?.20:.13,.20,.22])for(const ink of ['ink','ink-2'])check(t[ink],mixHex(b.color,t.surface,weight),4.5,`k${n} bloc card/chip/corridor text`);
   check(t.ink,mixHex(b.color,t.surface,i?.32:.24),4.5,'corridor consequence');
  }
 }
 expect(problems).toEqual([]);
});
test('palette rules use the shared guard',()=>{for(const c of SCENARIO_PALETTE)expect(colourPasses(c,SCENARIO_PALETTE.filter(x=>x!==c),{minDeltaE:COLOUR_RULES.small,backgrounds:['#ffffff','#171b20']})).toBe(true);});
