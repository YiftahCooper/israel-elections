import type {Family} from './model.ts';
import type {Scenario} from '../model/scenario.ts';
export function familyLabel(f:Family,lang:'he'|'en'):string {
 return (lang==='he'?f.labelHe:f.labelEn)??(lang==='he'?f.nameHe:f.nameEn);
}
/** A scale-only family snapshot must not turn an ordinary bloc scheme into a family grouping. */
export function isFamilyGrouping(s:Scenario):boolean {
 return !!s.familyDefinition&&s.blocSchemeId===null&&s.blocs.some(b=>b.id==='selected')&&s.blocs.some(b=>b.id==='other')&&s.blocs.every(b=>['selected','mixed','other'].includes(b.id));
}
