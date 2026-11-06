import { groupingName } from './groupingName.ts';
import {englishLabel} from '../data/names.ts';
import type { RuleSet } from '../engine/types.ts';
import type { Scenario } from '../model/scenario.ts';
import type { Lang } from './i18n.ts';
import { editPathLabel, referenceValue, type EditPath } from './derive.ts';
import { fmtInt } from './format.ts';

const terms: Record<string, [string, string]> = {
  historical: ['Historical rules', 'כללים היסטוריים'], experimental: ['Experimental rules', 'כללים ניסיוניים'],
  floor: ['Round down', 'עיגול כלפי מטה'], exact: ['Exact', 'מדויק'], lottery: ['Lottery', 'הגרלה'],
  unspecified: ['Not specified', 'לא נקבע'], 'bader-ofer': ['Bader–Ofer', 'באדר–עופר'],
  'largest-remainder': ['Largest remainder', 'השארית הגדולה'], dhondt: ['D’Hondt', 'ד׳הונדט'],
  'droop': ['Droop quota', 'מודד דרופ'], 'nearest': ['Round to nearest', 'עיגול לקרוב'], 'ceil': ['Round up', 'עיגול כלפי מעלה'],
  'sainte-lague': ['Sainte-Laguë', 'סנט־לגה'], 'modified-sainte-lague': ['Modified Sainte-Laguë', 'סנט־לגה מתוקנת'],
};
export function changeText(s: Scenario, path: EditPath, lang: Lang): string {
  const he = lang === 'he', none = he ? 'ללא' : 'None';
  const name = (id: string): string => {
    if (id.startsWith('[')) {
      try { const [listId, partyId] = JSON.parse(id) as string[]; return name(partyId || listId); } catch { return none; }
    }
    const agreement = s.agreements.find(a => a.id === id);
    if (agreement) return agreement.members.map(name).join(' + ');
    const l = s.lists.find(l => l.id === id);
    const b = s.blocs.find(b => b.id === id);
    const g = s.blocSchemes?.find(g => g.id === id);
    const c = s.lists.flatMap(l => l.candidates).find(c => c.id === id);
    const p = s.lists.flatMap(l => l.parties ?? []).find(p => p.id === id);
    if (!l && (b || g)) return groupingName((b ?? g)!, lang);
    const entity = c ?? p;
    return l ? (he ? l.shortHe : englishLabel(l.shortEn,l.shortHe)) : entity ? (he ? entity.nameHe : englishLabel('nameEn' in entity ? entity.nameEn : null,entity.nameHe)) : he ? 'פריט שהוסר' : 'Removed item';
  };
  const format = (v: unknown, key: string): string => {
    if (v === undefined || v === null || v === '') return none;
    if (typeof v === 'boolean') return v ? (he ? 'כן' : 'Yes') : (he ? 'לא' : 'No');
    if (typeof v === 'number') return fmtInt(v);
    if (typeof v === 'string') {
      if (key === 'thresholdPct') return v + '%';
      if (key === 'color') return he ? 'צבע' : 'Colour';
      if (['bloc', 'blocSchemeId', 'members', 'originIds', 'factionSplits', 'in', 'out', 'partyBlocs', 'candidateBlocs', 'lotteryWinners', 'partyId', 'originListId'].includes(key)) return name(v);
      return terms[v]?.[he ? 1 : 0] ?? (!he && ['nameHe','shortHe','sponsorsHe','partyHe'].includes(key) ? englishLabel(null,v) : v);
    }
    if (Array.isArray(v)) return v.length ? v.map(x => format(x, key)).join(key === 'members' ? ' + ' : ' · ') : none;
    const o = v as Record<string, unknown>;
    if ('members' in o) return format(o.members, 'members') + ' · ' + (o.enabled === false ? (he ? 'כבוי' : 'Off') : (he ? 'בתוקף' : 'In force'));
    if ('appDefined' in o && o.appDefined && typeof o.nameHe === 'string' && typeof o.nameEn === 'string') return groupingName({ nameHe: o.nameHe, nameEn: o.nameEn, appDefined: true }, lang);
    if ('nameHe' in o) return String(he ? o.nameHe : englishLabel(String(o.shortEn ?? o.nameEn ?? ''),String(o.nameHe)));
    return Object.entries(o).filter(([k]) => !['id', 'at', 'source'].includes(k)).map(([k,x]) =>
      editPathLabel(s, [k], lang) + ': ' + format(x, ['partyBlocs', 'candidateBlocs', 'lotteryWinners'].includes(key) ? key : k)).join(' · ') || none;
  };
  return format(referenceValue(s, path), path.length > 1 && ['partyBlocs', 'candidateBlocs', 'lotteryWinners'].includes(path[0]) ? path[0] : path.at(-1)!);
}
export function ChangeValue({ s, path, lang }: { s: Scenario; path: EditPath; lang: Lang }) {
  const v = referenceValue(s, path);
  return path.at(-1) === 'color' && typeof v === 'string'
    ? <span className="row"><span className="change-swatch" style={{ background: v }} />{changeText(s, path, lang)}</span>
    : <>{changeText(s, path, lang)}</>;
}

export function ruleEraLabel(r: RuleSet, lang: Lang): string {
  const he = lang === 'he', year = r.id.match(/il-(\d+)/)?.[1] ?? '';
  const method = r.id.includes('1949') ? (he ? 'הממוצע הגבוה' : 'Highest averages')
    : r.remainderMethod === 'largest-remainder' ? (he ? 'השארית הגדולה' : 'Largest remainder') : (he ? 'בדר–עופר' : 'Bader–Ofer');
  const threshold = Number(r.threshold.num) / Number(r.threshold.den) * 100;
  return year + ' · ' + method + ' · ' + (threshold ? threshold + (he ? '% חסימה' : '% threshold') : (he ? 'ללא אחוז חסימה' : 'No percentage threshold'))
    + (r.seatsCappedAtCandidates ? (he ? ' · מגבלת מועמדים (מוסקת)' : ' · Candidate cap (inferred)') : '');
}
