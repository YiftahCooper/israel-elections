import {assignColour,MARK_BACKGROUNDS,idColour,isHexColour} from '../data/colourGuard.ts';
import type {Family} from './model.ts';
/** Stable family identity colours; all chromatic, separate from neutral change marks and from the
 * grouping neutrals (Everyone else #7d8791, Mixed lists #b8a78a). Chosen so every pair of the nine is
 * distinguishable with normal vision (CIEDE2000 ΔE ≥ 20); names always accompany colour for CVD readers. */
export const FAMILY_COLOURS:Record<string,string>={'herut-likud':'#2969d4','labour-zionist-left':'#d1342c','arab-arab-jewish':'#2e8b2e',centre:'#da7205','religious-parties':'#8e48ca','national-religious':'#9b8f00','radical-right':'#846641',haredi:'#e0569b','russian-speaking-immigrant':'#169d97'};
/** New personal identities use the same guard as scenarios and lists. */
export function familyColor(f:Family):string {
 if(typeof f.displayColor==='string'&&isHexColour(f.displayColor))return f.displayColor;
 return FAMILY_COLOURS[f.id]??assignColour([],Object.values(FAMILY_COLOURS),{variantOf:idColour(f.id),hueFirst:true,minDeltaE:20,minChroma:.06,backgrounds:MARK_BACKGROUNDS});
}
