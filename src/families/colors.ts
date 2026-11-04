import type {Family} from './model.ts';
/** Stable family identity colours; all chromatic, separate from neutral change marks and from the
 * grouping neutrals (Everyone else #7d8791, Mixed lists #b8a78a). Chosen so every pair of the nine is
 * distinguishable with normal vision (OKLab ΔE ≥ 13); names always accompany colour for CVD readers. */
export const FAMILY_COLOURS:Record<string,string>={'herut-likud':'#2565d0','labour-zionist-left':'#d1342c','arab-arab-jewish':'#2e8b2e',centre:'#ea7a00','religious-parties':'#8b45c8','national-religious':'#a89a00','radical-right':'#8a5528',haredi:'#e0569b','russian-speaking-immigrant':'#00a6a0'};
/** A personal copy keeps the colour of the preset it came from; its name tells them apart. */
export function familyColor(f:Family):string {
 const id=FAMILY_COLOURS[f.id]?f.id:f.forkedFrom?.id;
 if(id&&FAMILY_COLOURS[id])return FAMILY_COLOURS[id];
 let h=0;for(const c of f.id)h=(h*31+c.charCodeAt(0))>>>0;return `hsl(${h%360} 64% 42%)`;
}
