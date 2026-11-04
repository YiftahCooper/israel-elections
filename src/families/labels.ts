import type {Family} from './model.ts';
import type {Scenario} from '../model/scenario.ts';
/** Legacy snapshots without label fields retain their long titles as evidence. */
const legacy:Record<string,readonly [string,string]>={haredi:['Haredi','חרדים'],'arab-arab-jewish':['Arab & Arab–Jewish','ערבים וערבים־יהודים'],centre:['Centre','מרכז'],'herut-likud':['Likud lineage','שושלת הליכוד'],'labour-zionist-left':['Labour & left','העבודה והשמאל'],'national-religious':['Religious Zionist','ציונות דתית'],'radical-right':['Radical right','ימין רדיקלי'],'religious-parties':['Religious','דתיים'],'russian-speaking-immigrant':['Russian-speaking','דוברי רוסית']};
export function familyLabel(f:Family,lang:'he'|'en'):string {
 return (lang==='he'?f.labelHe:f.labelEn)??legacy[f.id]?.[lang==='he'?1:0]??(lang==='he'?f.nameHe:f.nameEn);
}
/** A scale-only family snapshot must not turn an ordinary bloc scheme into a family grouping. */
export function isFamilyGrouping(s:Scenario):boolean {
 return !!s.familyDefinition&&s.blocSchemeId===null&&s.blocs.some(b=>b.id==='selected')&&s.blocs.some(b=>b.id==='other')&&s.blocs.every(b=>['selected','mixed','other'].includes(b.id));
}
