import type {Family} from './model.ts';
/** Stable family identity colours; all chromatic, separate from neutral change marks. */
const colours:Record<string,string>={haredi:'#167f94','arab-arab-jewish':'#9760b4',centre:'#b36b19','herut-likud':'#377cc0','labour-zionist-left':'#bd527b','national-religious':'#5b8a38','radical-right':'#b65039','religious-parties':'#6264c5','russian-speaking-immigrant':'#17876f'};
export function familyColor(f:Family) {if(colours[f.id])return colours[f.id];let h=0;for(const c of f.id)h=(h*31+c.charCodeAt(0))>>>0;return `hsl(${h%360} 64% 47%)`;}
