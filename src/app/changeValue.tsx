import { groupingName } from './groupingName.ts';
import {englishLabel} from '../data/names.ts';
import type { RuleSet } from '../engine/types.ts';
import type { CopyProvenance, Scenario, SimCandidate } from '../model/scenario.ts';
import type { Lang } from './i18n.ts';
import { candidateName, editPathLabel, referenceValue, type EditPath } from './derive.ts';
import { markerLead } from './compare/copyText.ts';
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
  // a candidate's own field (a renamed candidate's former name): a person's name is never transliterated
  const person = path[0] === 'lists' && path[2] === 'candidates';
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
    // a person is named as everywhere else: the official English name, else the Hebrew (never letter by letter)
    if (!l && c) return candidateName(c, lang);
    const entity = p;
    return l ? (he ? l.shortHe : englishLabel(l.shortEn,l.shortHe)) : entity ? (he ? entity.nameHe : englishLabel(entity.nameEn,entity.nameHe)) : he ? 'פריט שהוסר' : 'Removed item';
  };
  const format = (v: unknown, key: string): string => {
    if (v === undefined || v === null || v === '') return none;
    if (typeof v === 'boolean') return v ? (he ? 'כן' : 'Yes') : (he ? 'לא' : 'No');
    if (typeof v === 'number') return fmtInt(v);
    if (typeof v === 'string') {
      if (key === 'thresholdPct') return v + '%';
      if (key === 'color') return he ? 'צבע' : 'Colour';
      if (['bloc', 'blocSchemeId', 'members', 'originIds', 'factionSplits', 'in', 'out', 'partyBlocs', 'candidateBlocs', 'lotteryWinners', 'partyId', 'originListId'].includes(key)) return name(v);
      return terms[v]?.[he ? 1 : 0] ?? (!he && !person && ['nameHe','shortHe','sponsorsHe','partyHe'].includes(key) ? englishLabel(null,v) : v);
    }
    if (Array.isArray(v)) return v.length ? v.map(x => format(x, key)).join(key === 'members' ? ' + ' : ' · ') : none;
    const o = v as Record<string, unknown>;
    if ('members' in o) return format(o.members, 'members') + ' · ' + (o.enabled === false ? (he ? 'כבוי' : 'Off') : (he ? 'בתוקף' : 'In force'));
    if ('appDefined' in o && o.appDefined && typeof o.nameHe === 'string' && typeof o.nameEn === 'string') return groupingName({ nameHe: o.nameHe, nameEn: o.nameEn, appDefined: true }, lang);
    if ('nameHe' in o) return person || key === 'candidates' ? candidateName(o as unknown as SimCandidate, lang) : String(he ? o.nameHe : englishLabel(String(o.shortEn ?? o.nameEn ?? ''),String(o.nameHe)));
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

/** A list's whole candidate list changed (order, or who is on it): the path the marker uses then. */
export const isRosterPath = (path: EditPath) => path.length === 3 && path[0] === 'lists' && path[2] === 'candidates';
const isolateLtr = (t: string) => `\u2066${t}\u2069`;

/** What a candidate-list edit changed, in a few names (audit c-screens-overview-08): who moved (place on the list
 *  before → after), who was added or removed, who was renamed. The former list in full is never repeated. */
export function candidateChangeText(before: SimCandidate[], now: SimCandidate[], lang: Lang): string {
  const he = lang === 'he', name = (c: SimCandidate) => candidateName(c, lang);
  const was = new Map(before.map((c, i) => [c.id, i])), is = new Map(now.map((c, i) => [c.id, i]));
  const added = now.filter(c => !was.has(c.id)), removed = before.filter(c => !is.has(c.id));
  const renamed = now.filter(c => was.has(c.id) && before[was.get(c.id)!].nameHe !== c.nameHe);
  // moved: the fewest candidates whose order among the others changed (those outside a longest run kept in order);
  // a place shifted only by someone added or removed above is not a move
  const common = now.filter(c => was.has(c.id)), seq = common.map(c => was.get(c.id)!);
  const tails: number[] = [], prev: number[] = [];
  seq.forEach((v, i) => {
    let lo = 0, hi = tails.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (seq[tails[mid]] < v) lo = mid + 1; else hi = mid; }
    prev[i] = lo ? tails[lo - 1] : -1; tails[lo] = i;
  });
  const kept = new Set<number>();
  for (let i = tails.at(-1) ?? -1; i >= 0; i = prev[i]) kept.add(i);
  let moved = common.filter((_, i) => !kept.has(i));
  // two neighbours that swapped: either one "moved", so both are named
  if (moved.length === 1) {
    const order = [...common].sort((a, b) => was.get(a.id)! - was.get(b.id)!);
    const shifted = common.filter((c, i) => order[i] !== c);
    if (shifted.length === 2) moved = shifted;
  }
  const few = (xs: SimCandidate[], show: (c: SimCandidate) => string) => xs.slice(0, 3).map(show).join(', ')
    + (xs.length > 3 ? (he ? ` ועוד ${xs.length - 3}` : ` and ${xs.length - 3} more`) : '');
  const parts = [
    moved.length && `${he ? 'הזזה' : 'moved'}: ${few(moved, c => `${name(c)} ${isolateLtr(`${was.get(c.id)! + 1} → ${is.get(c.id)! + 1}`)}`)}`,
    added.length && `${he ? 'הוספה' : 'added'}: ${few(added, c => `${name(c)} ${isolateLtr(`(${is.get(c.id)! + 1})`)}`)}`,
    removed.length && `${he ? 'הסרה' : 'removed'}: ${few(removed, c => `${name(c)} ${isolateLtr(`(${was.get(c.id)! + 1})`)}`)}`,
    renamed.length && `${he ? 'שינוי שם' : 'renamed'}: ${few(renamed, c => `${candidateName(before[was.get(c.id)!], lang)} → ${name(c)}`)}`,
  ].filter(Boolean) as string[];
  return parts.join('; ') || (he ? 'פרטי המועמדים שונו' : 'candidate details changed');
}

/** A marker's line after its place: "Edited: was …", or for a whole candidate list what changed in it. */
export function markerChangeText(before: Scenario, now: Scenario, path: EditPath, lang: Lang, origin?: CopyProvenance): string {
  if (isRosterPath(path)) {
    const list = (x: Scenario) => (x.lists.find(l => l.id === path[1])?.candidates ?? []);
    const lead = markerLead(origin, lang, now.electionId).replace(/ · (was|קודם) $/, '');
    return `${origin ? lead : lang === 'he' ? 'נערך' : 'Edited'}: ${candidateChangeText(list(before), list(now), lang)}`;
  }
  return markerLead(origin, lang, now.electionId) + changeText(before, path, lang);
}
