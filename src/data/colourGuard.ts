import {deltaE2000,fromOklch,hexToLab,hexToOklch,blocTints,noBlocTints,SEAT_LIGHTNESS,MIN_LIST_DELTA_E,MIN_NEIGHBOUR_DELTA_E} from './colour.ts';

export const isHexColour=(value:unknown):value is string=>typeof value==='string'&&/^#[\da-f]{6}$/i.test(value);
export const COLOUR_RULES={identity:MIN_LIST_DELTA_E,small:MIN_NEIGHBOUR_DELTA_E,neighbour:MIN_NEIGHBOUR_DELTA_E,text:4.5,largeText:3,mark:3,regionTint:8} as const;
export const THEME_SURFACES={light:{page:'#e8ecf0',surface:'#ffffff',quiet:'#f4f6f8',open:'#edf2f8',ink:'#15171a',secondary:'#454d55',muted:'#5d656e'},dark:{page:'#0f1215',surface:'#171b20',quiet:'#1c2127',open:'#1b2634',ink:'#e8eaec',secondary:'#b9c0c7',muted:'#9aa2ab'}} as const;
export const MARK_BACKGROUNDS=[THEME_SURFACES.light.surface,THEME_SURFACES.dark.surface,THEME_SURFACES.light.quiet,THEME_SURFACES.dark.quiet] as const;
export const luminance=(color:string)=>[1,3,5].map(i=>{const n=parseInt(color.slice(i,i+2),16)/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;}).reduce((n,c,i)=>n+c*[.2126,.7152,.0722][i],0);
export function contrastRatio(a:string,b:string){const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
export const inkOn=(background:string)=>contrastRatio('#000000',background)>=contrastRatio('#ffffff',background)?'#000000':'#ffffff';
/** Preserve identity fills; the outline supplies the meaningful boundary when the fill cannot. */
export const markOutline=(fill:string,background:string)=>contrastRatio(fill,background)>=COLOUR_RULES.mark?fill:inkOn(background);
export interface ColourRules {variantOf?:string;minDeltaE?:number;backgrounds?:readonly string[];minContrast?:number;lightness?:readonly[number,number];minChroma?:number;hueFirst?:boolean;allow?:(color:string)=>boolean}
export function colourPasses(color:string,used:readonly string[],rules:ColourRules={}):boolean{
 if(!isHexColour(color))return false;
 if(rules.lightness){const L=hexToLab(color)[0];if(L<rules.lightness[0]||L>rules.lightness[1])return false;}
 if(rules.minChroma&&hexToOklch(color)[1]<rules.minChroma)return false;
 return used.every(c=>deltaE2000(color,c)>=(rules.minDeltaE??COLOUR_RULES.identity))&&(rules.backgrounds??[]).every(bg=>contrastRatio(color,bg)>=(rules.minContrast??COLOUR_RULES.mark))&&(!rules.allow||rules.allow(color));
}
const channels=[0,32,64,96,128,160,192,224,255];
export const COLOUR_CANDIDATES=channels.flatMap(r=>channels.flatMap(g=>channels.map(b=>'#'+[r,g,b].map(c=>c.toString(16).padStart(2,'0')).join(''))));
const distance=(c:string,used:readonly string[])=>used.length?Math.min(...used.map(other=>deltaE2000(c,other))):100;
function bestSpread(candidates:readonly string[],used:readonly string[]){return candidates.reduce((best,c)=>distance(c,used)>distance(best,used)+1e-9?c:best,candidates[0]);}
/** Stable farthest-first assignment. An unused passing palette entry always wins over deriving.
 * A finite colour gamut cannot promise an arbitrary number of ΔE-separated categories; when
 * exhausted, return the best unused margin and let colourPasses/colourClashes expose the limit. */
export function assignColour(palette:readonly string[],used:readonly string[],rules:ColourRules={}):string{
 if(rules.variantOf)return nearestDistinctColour(rules.variantOf,used,{...rules,variantOf:undefined});
 const available=palette.filter(c=>!used.some(u=>u.toLowerCase()===c.toLowerCase())&&colourPasses(c,used,rules));
 if(available.length)return bestSpread(available,used);
 const passing=COLOUR_CANDIDATES.filter(c=>colourPasses(c,used,rules));
 if(passing.length)return bestSpread(passing,used);
 const unused=COLOUR_CANDIDATES.filter(c=>!used.includes(c)&&colourPasses(c,[],rules));
 return bestSpread(unused.length?unused:COLOUR_CANDIDATES.filter(c=>!used.includes(c)),used);
}
function hueVariants(seed:string,shifts:readonly number[],chromaFactors:readonly number[]){const[,C,h]=hexToOklch(seed);const out:string[]=[];for(const dh of shifts)for(const cf of chromaFactors)for(let i=4;i<=98;i++)out.push(fromOklch(i/100,C*cf,h+dh*Math.PI/180));return out;}
export function nearestDistinctColour(seed:string,used:readonly string[],rules:ColourRules={}):string{
 if(colourPasses(seed,used,rules))return seed.toLowerCase();
 const nearest=(colors:readonly string[])=>colors.filter(c=>colourPasses(c,used,rules)).reduce<string|undefined>((best,c)=>!best||deltaE2000(seed,c)<deltaE2000(seed,best)-1e-9?c:best,undefined);
 // A research hue is meaningful: change lightness first, then chroma, then hue only if forced.
 if(rules.hueFirst){
  const same=nearest(hueVariants(seed,[0],[1]));if(same)return same;
  const chroma=nearest(hueVariants(seed,[0],[.4,.7,1.3]));if(chroma)return chroma;
  for(const spread of [6,12,18,24,36,60,90,120,180]){const c=nearest(hueVariants(seed,[-spread,spread],[1,.7,.4]));if(c)return c;}
 }
 return nearest([...hueVariants(seed,[0,-12,12,-24,24],[1,.7,1.3]),...COLOUR_CANDIDATES])??assignColour([],used,rules);
}
export interface NamedColour {color:string;name:string;id?:string}
export const colourClashes=(color:string,others:readonly NamedColour[],min:number=COLOUR_RULES.small)=>others.filter(other=>deltaE2000(color,other.color)<min);
/** Stable base when research has no colour at all; independent of election, list and locale. */
export function idColour(id:string){const h=[...id].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,0);return fromOklch(.65,.18,(h%360)*Math.PI/180);}


/** The nearest colour a seat fill can use (CIE L* within SEAT_LIGHTNESS), keeping hue and chroma: a research colour
 * too dark or too light to read on both themes (a black or near-white party colour) moves by lightness only. */
export function readableSeatColour(color:string):string{
 const L=hexToLab(color)[0];if(L>=SEAT_LIGHTNESS[0]&&L<=SEAT_LIGHTNESS[1])return color.toLowerCase();
 const[L0,C,h]=hexToOklch(color),up=L<SEAT_LIGHTNESS[0];
 for(let i=1;i<=200;i++){const c=fromOklch(L0+(up?1:-1)*i*.0025,C,h),l=hexToLab(c)[0];if(l>=SEAT_LIGHTNESS[0]&&l<=SEAT_LIGHTNESS[1])return c;}
 return color.toLowerCase();
}

/** Domain adapters share the same assigner and thresholds; research values remain inputs. `obstacles`: colours an item
 * must also clear, each by its own minimum, without moving them (e.g. another list's party seat colours). */
export function separateColours(items: { id: string; color: string; alternatives?: string[] }[], neighbours: Set<string> = new Set(), min = MIN_LIST_DELTA_E, minNeighbour = MIN_NEIGHBOUR_DELTA_E, obstacles: (id: string) => readonly { color: string; min: number }[] = () => []) {
  const placed: { id: string; color: string }[] = [], out = new Map<string, string>(), adjusted = new Set<string>();
  const need = (a: string, b: string) => (neighbours.has(`${a} ${b}`) || neighbours.has(`${b} ${a}`) ? minNeighbour : min);
  // the smallest margin by which `c` clears every placed colour (negative: it fails one)
  const margin = (id: string, c: string) => obstacles(id).reduce((m, o) => Math.min(m, deltaE2000(c, o.color) - o.min), placed.reduce((m, p) => Math.min(m, deltaE2000(c, p.color) - need(id, p.id)), Infinity));
  const readable = (c: string) => { const L = hexToLab(c)[0]; return L >= SEAT_LIGHTNESS[0] && L <= SEAT_LIGHTNESS[1]; };
  const rad = Math.PI / 180;
  for (const { id, color, alternatives = [] } of items) {
    const own = color.toLowerCase();
    let best = own;
    if (margin(id, own) < 0 || !readable(own)) {
      const [L0, C0, h0] = hexToOklch(own);
      let bestCost = Infinity, fallback = own, fallbackM = -Infinity;
      for (const dh of [0, 6, -6, 12, -12, 18, -18, 24, -24]) for (const cf of [1, 0.6, 0.8, 1.2, 1.4]) for (let dl = -0.3; dl <= 0.3001; dl += 0.01) {
        const c = fromOklch(L0 + dl, Math.max(C0, 0.02) * cf, h0 + dh * rad);
        if (!readable(c)) continue;
        const m = margin(id, c);
        if (m >= 0) { const cost = deltaE2000(own, c) + Math.abs(dh) * 0.4; if (cost < bestCost) { bestCost = cost; best = c; } }
        else if (m > fallbackM) { fallbackM = m; fallback = c; }
      }
      // only when no small move of its own colour works: an alternative as it is, else the best available margin
      if (bestCost === Infinity) best = alternatives.map((c) => c.toLowerCase()).find((c) => margin(id, c) >= 0 && readable(c)) ?? fallback;
    }
    best = assignColour([best], placed.map(p=>p.color), {minDeltaE:min,lightness:SEAT_LIGHTNESS,allow:c=>placed.every(p=>deltaE2000(c,p.color)>=need(id,p.id))&&obstacles(id).every(o=>deltaE2000(c,o.color)>=o.min)});
    if (best !== own) adjusted.add(id);
    placed.push({ id, color: best }); out.set(id, best);
  }
  return { colors: out, adjusted };
}

export function blocColourRules(used:readonly string[],min=8):ColourRules{
 const tints=[noBlocTints(),...used.map(blocTints)];
 return{minDeltaE:20,allow:c=>{const next=blocTints(c);return tints.every(other=>next.every((t,i)=>deltaE2000(t,other[i])>=min));}};
}
export function separateBlocColours(colors:readonly string[],min=8){
 const out:string[]=[];for(const seed of colors){out.push(assignColour([seed],out,{...blocColourRules(out,min),variantOf:seed}));}return out;
}
