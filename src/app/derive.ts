import {isFamilyGrouping} from '../families/labels.ts';
import { applyAction } from '../model/actions.ts';
import { compareAllocations } from '../engine/analysis.ts';
// Memoised derivations: every displayed figure comes from allocate(scenario).
import type { ElectionDataset } from '../data/schema.ts';
import { allocate } from '../engine/allocate.ts';
import type { AllocationResult, EngineWarning } from '../engine/types.ts';
import { electionRuleSetId, historicalRules, scenarioFromDataset, toEngineInput, validVotes, votesCast, type Scenario, type SimList, type SimRules } from '../model/scenario.ts';
import type { Lang } from './i18n.ts';

const allocCache = new WeakMap<Scenario, AllocationResult>();
export function allocationOf(s: Scenario): AllocationResult {
  let r = allocCache.get(s);
  if (!r) { r = allocate(toEngineInput(s)); allocCache.set(s, r); }
  return r;
}

const baseCache = new WeakMap<ElectionDataset, Scenario>();
export function baselineOf(ds: ElectionDataset): Scenario {
  let s = baseCache.get(ds);
  if (!s) { s = scenarioFromDataset(ds, 'historical'); baseCache.set(ds, s); }
  return s;
}

/** Names, glossary term and per-seat rule of every allocation method, in one place for all screens. */
export const METHODS: Record<SimRules['remainderMethod'], { en: string; he: string; term: string; stepEn: string; stepHe: string }> = {
  'bader-ofer': { en: 'Bader–Ofer', he: 'בדר–עופר', term: 'baderofer', stepEn: 'highest votes ÷ (seats + 1)', stepHe: 'הגבוה ביותר בקולות ÷ (מנדטים + 1)' },
  'largest-remainder': { en: 'largest remainder (Hare quota)', he: 'השארית הגדולה (מודד הייר)', term: 'largest-remainder', stepEn: 'largest remainder (votes − quota × seats)', stepHe: 'השארית הגדולה ביותר (קולות − מודד × מנדטים)' },
  'droop': { en: 'largest remainder (Droop quota)', he: 'השארית הגדולה (מודד דרופ)', term: 'droop-quota', stepEn: 'largest remainder (votes − Droop quota × seats)', stepHe: 'השארית הגדולה ביותר (קולות − מודד דרופ × מנדטים)' },
  'sainte-lague': { en: 'Sainte-Laguë', he: 'סנט-לגה', term: 'sainte-lague', stepEn: 'highest votes ÷ (2 × seats + 1)', stepHe: 'הגבוה ביותר בקולות ÷ (2 × מנדטים + 1)' },
  'modified-sainte-lague': { en: 'modified Sainte-Laguë', he: 'סנט-לגה מתוקנת', term: 'modified-sainte-lague', stepEn: 'highest votes ÷ 1.4 for a first seat, then ÷ (2 × seats + 1)', stepHe: 'הגבוה ביותר בקולות ÷ 1.4 למושב הראשון, ואחר כך ÷ (2 × מנדטים + 1)' },
  'dhondt': { en: 'D’Hondt', he: 'ד׳הונדט', term: 'dhondt', stepEn: 'highest votes ÷ (seats + 1)', stepHe: 'הגבוה ביותר בקולות ÷ (מנדטים + 1)' },
};
/** The method in force, with 1949's highest-averages rule (only lists with a whole-quota seat compete) named as such. */
export function methodOf(rules: Pick<SimRules, 'remainderMethod'> & { remainderRequiresInitialSeat?: boolean }) {
  if (rules.remainderMethod === 'bader-ofer' && rules.remainderRequiresInitialSeat) return { ...METHODS['bader-ofer'], en: 'highest averages', he: 'הממוצע הגבוה', term: 'highest-averages' };
  return METHODS[rules.remainderMethod];
}
const METHOD = Object.fromEntries(Object.entries(METHODS).map(([k, v]) => [k, [v.en, v.he]])) as Record<SimRules['remainderMethod'], [string, string]>;
/** Every way the scenario's rules differ from the law of its election, in plain words (empty = none). */
export function ruleChanges(s: Scenario, lang: Lang): string[] {
  const law = historicalRules(electionRuleSetId(s.electionId));
  const r = s.rules;
  const he = lang === 'he';
  const out: string[] = [];
  const onOff = (v: boolean) => (he ? (v ? 'פעילה' : 'כבויה') : v ? 'on' : 'off');
  if (r.seats !== law.seats) out.push(he ? `${r.seats} מושבים (בחוק: ${law.seats})` : `${r.seats} seats (law: ${law.seats})`);
  if (Number(r.thresholdPct) !== Number(law.thresholdPct)) out.push(he ? `אחוז חסימה ${r.thresholdPct}% (בחוק: ${law.thresholdPct}%)` : `threshold ${r.thresholdPct}% (law: ${law.thresholdPct}%)`);
  if (r.remainderMethod !== law.remainderMethod) out.push(he ? `חלוקת עודפים: ${METHOD[r.remainderMethod][1]} (בחוק: ${METHOD[law.remainderMethod][1]})` : `remainder seats by ${METHOD[r.remainderMethod][0]} (law: ${METHOD[law.remainderMethod][0]})`);
  if (r.quotaRounding !== law.quotaRounding) out.push(he ? 'מודד ללא עיגול' : 'quota not rounded down');
  if (r.majorityCap !== law.majorityCap) out.push(he ? `מגבלת מחצית המנדטים ${onOff(r.majorityCap)}` : `half-seats cap ${onOff(r.majorityCap)}`);
  if (r.maxAgreementSize !== law.maxAgreementSize) out.push(he ? `הסכמי עודפים של עד ${r.maxAgreementSize} רשימות` : `surplus agreements of up to ${r.maxAgreementSize} lists`);
  if (r.agreementRequiresAllQualify !== law.agreementRequiresAllQualify) out.push(he ? 'הסכם תקף גם אם שותפה לא עברה את החסימה' : 'agreements count even if a partner fails the threshold');
  return out;
}

export const listLabel = (l: Pick<SimList, 'shortHe' | 'shortEn'>, lang: Lang) => (lang === 'en' && l.shortEn ? l.shortEn : l.shortHe);

/** Pass null only for the real election result; saved bases are always named. */
export function referenceLabel(reference: Pick<Scenario, 'name'> | null, lang: Lang) {
  const he = lang === 'he';
  const name = reference ? reference.name || (he ? 'תרחיש שמור' : 'Saved scenario') : he ? 'התוצאה הרשמית' : 'Official result';
  return {
    name,
    since: reference ? (he ? `מאז ${name}` : `Since ${name}`) : he ? 'מאז התוצאה הרשמית' : 'Since official result',
    at: reference ? (he ? `בתרחיש ${name}` : `in ${name}`) : he ? 'בפועל' : 'officially',
    more: he ? ` יותר מאשר ב${name}` : ` more than ${reference ? name : 'the official result'}`,
    fewer: he ? ` פחות מאשר ב${name}` : ` fewer than ${reference ? name : 'the official result'}`,
    seats: reference ? (he ? `מנדטים בתרחיש ${name}` : `Seats in ${name}`) : he ? 'מנדטים בפועל' : 'Historical seats',
  };
}

export interface ScenarioIssue { level: 'error' | 'warning'; en: string; he: string }

/** Internal-consistency checks the user must see (never silently corrected). */
export function scenarioIssues(s: Scenario, r: AllocationResult): ScenarioIssue[] {
  const out: ScenarioIssue[] = [];
  const cast = votesCast(s);
  if (cast > s.registered) out.push({ level: 'warning', en: `Votes cast (${cast.toLocaleString()}) exceed registered voters (${s.registered.toLocaleString()}); turnout would be above 100%. Raise the electorate or reduce votes.`, he: `מספר המצביעים (${cast.toLocaleString()}) עולה על מספר בעלי זכות הבחירה (${s.registered.toLocaleString()}); שיעור ההצבעה עולה על 100%.` });
  for (const l of r.lists) {
    const sl = s.lists.find((x) => x.id === l.id)!;
    // an unavailable or truncated roster is unknown beyond what is listed, not short of candidates
    const n = seatedOrder(sl).length;
    if (l.seats > n && !sl.rosterUnavailable && !sl.rosterTruncated) out.push({ level: 'error', en: `${sl.shortEn ?? sl.shortHe} wins ${l.seats} seats but has only ${n} candidates; ${l.seats - n} seat(s) would stay vacant.`, he: `${sl.shortHe} זוכה ב-${l.seats} מנדטים אך יש בה רק ${n} מועמדים; ${l.seats - n} מושבים יישארו ריקים.` });
  }
  const letters = new Map<string, number>();
  for (const l of s.lists) letters.set(l.letters, (letters.get(l.letters) ?? 0) + 1);
  for (const [k, n] of letters) if (n > 1 && k) out.push({ level: 'warning', en: `Ballot letters “${k}” are used by ${n} lists.`, he: `האותיות "${k}" משמשות ${n} רשימות.` });
  if (validVotes(s) === 0) out.push({ level: 'error', en: 'There are no valid votes.', he: 'אין קולות כשרים.' });
  return out;
}

/** The name to show: the curated correction of a misprinted candidate-notice name, else the name as printed. */
export const shownName = (c: { nameHe: string; displayNameHe?: string }) => c.displayNameHe ?? c.nameHe;

/** The candidates who fill a list's seats, in order: the roster minus those the official notice did not seat. */
export const seatedOrder = (l: Pick<SimList, 'candidates'>) => l.candidates.filter((c) => !c.notSeated);
export const electedOf = (l: SimList, seats: number) => seatedOrder(l).slice(0, seats);

const tieCache = new WeakMap<Scenario, Map<string, boolean>>();
/** Whether choosing a different winner for this tie would change any list's final seats. */
export function tieAffectsSeats(s: Scenario, w: EngineWarning): boolean {
  const d = (w.data ?? {}) as { key?: string; ids?: string[] };
  if (w.code !== 'lottery-required' || !d.key || !d.ids?.length) return true;
  let c = tieCache.get(s); if (!c) { c = new Map(); tieCache.set(s, c); }
  if (!c.has(d.key)) {
    const base = toEngineInput(s);
    const outcomes = d.ids.map((winner) => JSON.stringify(allocate({ ...base, lotteryWinners: { ...base.lotteryWinners, [d.key!]: winner } }).lists.map((l) => l.seats)));
    c.set(d.key, new Set(outcomes).size > 1);
  }
  return c.get(d.key)!;
}

/** Engine warnings in the interface language (the engine's own messages are English diagnostics). */
export function warningText(w: EngineWarning, s: Scenario, lang: Lang): string {
  const he = lang === 'he';
  const nm = (id: string) => { const l = s.lists.find((x) => x.id === id); return l ? listLabel(l, lang) : id; };
  const d = (w.data ?? {}) as Record<string, unknown>;
  switch (w.code) {
    case 'inferred-candidate-cap': {
      const names = (d.cappedIds as string[]).map(nm).join(he ? ' ו' : ' and ');
      return he ? `מספר המועמדים הגביל את המנדטים של ${names} ושינה את החלוקה. השיטה משחזרת את הטבלה הרשמית של 1977, אך הכלל המשפטי לא אותר; התוצאה הזו היא מסקנה משוערת.` : `Candidate counts limited the seats of ${names} and changed the allocation. This method matches the official 1977 table, but the legal rule was not found; this outcome is an inference.`;
    }
    case 'unfilled-seats': return he ? `${nm(String(d.list))}: ${d.seats} מנדטים ו־${d.candidates} מועמדים. ההליך של תקופה זו למושבים שלא ניתן לאייש אינו ממודל.` : `${nm(String(d.list))}: ${d.seats} seats and ${d.candidates} candidates. This era’s procedure for unfilled seats is not modelled.`;
    case 'lottery-required': {
      const ids = (d.ids as string[] | undefined) ?? [];
      const names = ids.map((u) => { const a = s.agreements.find((x) => x.id === u); return a ? a.members.map(nm).join('+') : nm(u); }).join(he ? ' ו' : ' and ');
      if (!tieAffectsSeats(s, w)) return he ? `שוויון מדויק בין ${names} קובע רק את סדר חלוקת המושבים: כל תוצאה אפשרית נותנת אותם מנדטים בדיוק.` : `An exact tie between ${names} only decides the order in which seats are awarded: every possible outcome gives exactly the same seats.`;
      if (d.tiePolicy === 'unspecified') return he ? `שוויון מדויק בין ${names}: במקורות שנבדקו לא אותר הליך הכרעה לתקופה זו; מוצגת תוצאה משוערת שניתן לשנות. ניתן לבחור תוצאה בלשונית "איך חולקו המנדטים".` : `Exact tie between ${names}: the inspected sources do not establish this era’s tie procedure; a provisional scenario outcome is shown. You can choose one in the “How the seats were allocated” tab.`;
      return he ? `שוויון מדויק בין ${names}: החוק מחייב הגרלה של ועדת הבחירות. בחרו את תוצאת ההגרלה בלשונית "איך חולקו המנדטים".` : `Exact tie between ${names}: the law requires a CEC lottery. Choose the outcome in the “How the seats were allocated” tab.`;
    }
    case 'no-qualifying-lists': return he ? 'אף רשימה לא עברה את אחוז החסימה, ולכן אי אפשר לחלק מושבים.' : 'No list passed the threshold, so no seats can be allocated.';
    case 'zero-quota': return he ? 'יש פחות קולות משתתפים ממושבים, ולכן המודד השלם הוא 0; נעשה שימוש במודד המדויק (לא מעוגל).' : 'There are fewer qualifying votes than seats, so the whole-number quota is 0; the exact (unrounded) quota is used.';
    case 'quota-over-allocation': return he ? 'חישוב המודד נותן יותר מושבים מהקיים. ההליך המשפטי למצב זה לא הוברר; המודד המדויק משמש כחלופה בהדמיה.' : 'The quota calculation gives more seats than are available. The legal procedure for this case is unresolved; the exact quota is a simulation fallback.';
    case 'seats-unallocatable': return he ? 'לא ניתן היה לחלק את כל המושבים: אף רשימה אינה זכאית למושב נוסף לפי הכללים הנבחרים.' : 'Not every seat could be allocated: no list is eligible for a further seat under the chosen rules.';
    case 'internal-loss': return he ? `${nm(String(d.list))} מקבלת פחות מושבים ממה שהמודד השלם שלה לבדה היה נותן, כי סעיף 82(ב) מחלק מחדש את מושבי הצמד מתחילה.` : `${nm(String(d.list))} ends with fewer seats than its own whole quota, because section 82(b) re-divides the pair's seats from scratch.`;
    case 'agreement-rule-departure': return he ? 'הסכם של יותר משתי רשימות אינו מותר לפי סעיף 67(א); הוא מחושב כאן ככלל ניסיוני.' : 'An agreement of more than two lists is not allowed by section 67(a); it is computed here as an experimental rule.';
  }
}

/** The bloc each seat of a list counts for (decision 0087): the seated candidate's own bloc if set,
 *  else their constituent party's, else the list's. A list without names counts entirely for its list. */
export function seatBlocsOf(s: Scenario, l: SimList, seats: number): (string | null)[] {
  const elected = electedOf(l, seats);
  return Array.from({ length: seats }, (_, i) => {
    const c = elected[i];
    if (c && s.candidateBlocs && c.id in s.candidateBlocs) return s.candidateBlocs[c.id];
    if (c?.partyId && s.partyBlocs && c.partyId in s.partyBlocs) return s.partyBlocs[c.partyId];
    return l.bloc;
  });
}

/** One coloured piece of the chamber: consecutive seats of one list (and party) in one bloc. */
export interface BlocPiece { bloc: string | null; listId: string; partyId: string | null; color: string; n: number }

/** Seats grouped by bloc (in the scenario's bloc order, unassigned last), then by list order, then party. */
export function blocPieces(s: Scenario, r: AllocationResult): BlocPiece[] {
  const pieces: BlocPiece[] = [];
  for (const l of s.lists) {
    const seats = r.lists.find((x) => x.id === l.id)?.seats ?? 0;
    if (!seats) continue;
    const blocs = seatBlocsOf(s, l, seats);
    const elected = electedOf(l, seats);
    blocs.forEach((b, i) => {
      const partyId = elected[i]?.partyId ?? null;
      const party = partyId ? l.parties?.find((p) => p.id === partyId) : undefined;
      const last = pieces[pieces.length - 1];
      if (last && last.listId === l.id && last.bloc === b && last.partyId === partyId) last.n++;
      else pieces.push({ bloc: b, listId: l.id, partyId, color: party?.color ?? l.color, n: 1 });
    });
  }
  const rank = (b: string | null) => { const i = s.blocs.findIndex((x) => x.id === b); return i < 0 ? s.blocs.length : i; };
  return pieces.map((p, i) => ({ p, i })).sort((a, b) => rank(a.p.bloc) - rank(b.p.bloc) || a.i - b.i).map(({ p }) => p);
}

/** Who holds seats in the Knesset as factions: one entry per list, except a joint list whose faction has split
 *  (Scenario.factionSplits), which counts as its parties, each with the elected members recorded for it. Members
 *  whose party is not recorded stay with the list. Votes and the allocation are untouched (decision 0091). */
export interface SeatHolder {
  key: string; listId: string; partyId: string | null;
  nameHe: string; nameEn: string | null; color: string; logo?: SimList['logo']; seats: number; bloc: string | null;
}
export function seatHolders(s: Scenario, r: AllocationResult): SeatHolder[] {
  const split = new Set(s.factionSplits ?? []);
  const out: SeatHolder[] = [];
  for (const l of s.lists) {
    const seats = r.lists.find((x) => x.id === l.id)?.seats ?? 0;
    const whole: SeatHolder = { key: l.id, listId: l.id, partyId: null, nameHe: l.shortHe, nameEn: l.shortEn, color: l.color, logo: l.logo, seats, bloc: l.bloc };
    if (!split.has(l.id) || (l.parties?.length ?? 0) < 2) { out.push(whole); continue; }
    const elected = electedOf(l, seats);
    let rest = seats;
    for (const p of l.parties!) {
      const n = elected.filter((c) => c.partyId === p.id).length;
      rest -= n;
      const bloc = s.partyBlocs && p.id in s.partyBlocs ? s.partyBlocs[p.id] : l.bloc;
      out.push({ key: `${l.id}:${p.id}`, listId: l.id, partyId: p.id, nameHe: p.nameHe, nameEn: p.nameEn, color: p.color ?? l.color, logo: p.logo, seats: n, bloc });
    }
    if (rest > 0) out.push({ ...whole, key: `${l.id}:rest`, seats: rest });
  }
  return out;
}

/** The same origin-connected groups used by Compare; a split has one baseline, never one per child. */
const groupsCache = new WeakMap<AllocationResult, WeakMap<AllocationResult, ReturnType<typeof compareAllocations>>>();
/** cached per (result, official result): results are themselves cached per scenario, so redraws reuse the grouping */
export function comparisonGroups(s: Scenario, r: AllocationResult, base: Scenario, baseR: AllocationResult) {
  let inner = groupsCache.get(r);
  if (!inner) groupsCache.set(r, (inner = new WeakMap()));
  let g = inner.get(baseR);
  if (!g) inner.set(baseR, (g = compareAllocations(baseR, base.lists, r, s.lists)));
  return g;
}
export function officialSeatsFor(id: string, s: Scenario, r: AllocationResult, base: Scenario, baseR: AllocationResult): number | null {
  const g = comparisonGroups(s, r, base, baseR).find(g => g.bIds.includes(id));
  return g && g.bIds.length === 1 ? g.seatsA : null;
}
/** Selectable coalition units aggregate contiguous chamber pieces, keeping off-list-bloc seats apart. */
export function coalitionPieces(s: Scenario, r: AllocationResult) {
  const out = new Map<string, BlocPiece & { id: string }>();
  for (const p of blocPieces(s, r)) {
    const l = s.lists.find(l => l.id === p.listId)!;
    const partyId = p.bloc === l.bloc ? null : p.partyId;
    const id = JSON.stringify([p.listId, partyId, p.bloc]);
    const prev = out.get(id);
    if (prev) prev.n += p.n;
    else out.set(id, { ...p, partyId, color: partyId ? p.color : l.color, id });
  }
  return [...out.values()].sort((a,b) => b.n-a.n);
}

/** Custom bases are comparable when their grouping and assignments match; sourced schemes can be reapplied. */
export function groupingBaseline(s: Scenario, base: Scenario): Scenario | null {
  if (!s.blocSchemeId || !base.blocSchemeId) {
    const grouping = (x: Scenario) => [x.blocSchemeId, x.blocs.map(b => b.id).sort(),
      Object.fromEntries(x.lists.map(l => [l.id, l.bloc])), x.partyBlocs ?? {}, x.candidateBlocs ?? {}];
    return canonical(grouping(s)) === canonical(grouping(base)) ? base : null;
  }
  try { return s.blocSchemeId === base.blocSchemeId ? base : applyAction(base, { type: 'applyBlocScheme', schemeId: s.blocSchemeId }); }
  catch { return null; }
}
export function groupingLabel(s: Scenario, lang: Lang): string {
  if(isFamilyGrouping(s)) {const b=s.blocs.find(b=>b.id==='selected')!;return lang==='he'?b.nameHe:b.nameEn;}
  const g = s.blocSchemes?.find(g => g.id === s.blocSchemeId);
  return g ? `${lang === 'he' ? g.nameHe : g.nameEn} · ${g.date ?? (lang === 'he' ? 'חלוקה מוכרת בבחירות אלה' : 'recognised grouping of this election')}` : s.customGroupingName ?? (lang === 'he' ? 'החלוקה שלכם' : 'Your grouping');
}
export function majorityText(n: number, total: number, lang: Lang): string {
  const m = Math.floor(total / 2) + 1;
  return lang === 'he' ? `${n} / ${total} · ${n < m ? `חסרים ${m-n} ל-${m}` : `${n-m} מעל ${m}`}`
    : `${n} / ${total} · ${n < m ? `${m-n} short of ${m}` : `${n-m} above ${m}`}`;
}

export function nonSeatChanges(s: Scenario, base: Scenario, lang: Lang): string[] {
  const he = lang === 'he';
  const changes: string[] = [];
  if (JSON.stringify(s.lists.map(l => [l.id,l.votes,l.withdrawn])) !== JSON.stringify(base.lists.map(l => [l.id,l.votes,l.withdrawn]))) changes.push(he ? 'הקולות השתנו' : 'votes changed');
  if (JSON.stringify(s.agreements) !== JSON.stringify(base.agreements)) changes.push(he ? 'הסכמי העודפים השתנו' : 'agreements changed');
  if (s.blocSchemeId !== base.blocSchemeId || JSON.stringify([s.blocs,s.partyBlocs,s.candidateBlocs,s.lists.map(l=>l.bloc)]) !== JSON.stringify([base.blocs,base.partyBlocs,base.candidateBlocs,base.lists.map(l=>l.bloc)])) changes.push(he ? 'החלוקה לגושים השתנתה' : 'grouping changed');
  return changes;
}

export type EditPath = readonly string[];
/** Stable ID paths for collections: reordering lists cannot mark an unrelated list. */
export function referenceValue(s: Scenario, path: EditPath): unknown {
  return path.reduce<unknown>((v, k) => Array.isArray(v) ? v.find(x => x?.id === k) : v && typeof v === 'object' ? ((v as Record<string, unknown>)[k] ?? (k === 'coalition' ? { in: [], out: [] } : k === 'partyBlocs' || k === 'candidateBlocs' ? {} : undefined)) : undefined, s);
}
const canonical = (v: unknown): string => JSON.stringify(v, (_k, x) => x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map(k => [k, x[k]])) : x) ?? 'null';
export function differsFromReference(s: Scenario, reference: Scenario, path: EditPath): boolean {
  return canonical(referenceValue(s, path)) !== canonical(referenceValue(reference, path));
}
/** Only editable inputs, never timestamps, IDs of scenarios, provenance or log entries. */
export function referenceChanges(s: Scenario, reference: Scenario): EditPath[] {
  const paths: string[][] = [];
  const walk = (a: unknown, b: unknown, path: string[]) => {
    if (canonical(a) === canonical(b)) return;
    if (path.at(-1) === 'candidates' && Array.isArray(a) && Array.isArray(b) && a.map(x => x.id).join() !== b.map(x => x.id).join()) { paths.push(path); return; }
    if (Array.isArray(a) && Array.isArray(b) && [...a, ...b].every(x => x && typeof x === 'object' && 'id' in x)) {
      for (const id of new Set([...a, ...b].map(x => x.id))) walk(a.find(x => x.id === id), b.find(x => x.id === id), [...path, id]);
    } else if (a && b && !Array.isArray(a) && !Array.isArray(b) && typeof a === 'object' && typeof b === 'object') {
      for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) walk((a as any)[k], (b as any)[k], [...path, k]);
    } else if (differsFromReference(s, reference, path)) paths.push(path);
  };
  for (const key of ['description', 'lists', 'rules', 'registered', 'invalid', 'agreements', 'blocs', 'blocSchemeId', 'customGroupingName', 'partyBlocs', 'candidateBlocs', 'factionSplits', 'lotteryWinners', 'mode', 'coalition'] as const) walk(referenceValue(s, [key]), referenceValue(reference, [key]), [key]);
  return paths;
}

export function editPathLabel(s: Scenario, path: EditPath, lang: Lang, fallback?: Scenario): string {
  const names: Record<string, [string, string]> = {
    description: ['Description', 'תיאור'],
    lists: ['Lists', 'רשימות'], votes: ['Votes', 'קולות'], nameHe: ['Full name', 'שם מלא'], shortHe: ['Short Hebrew name', 'שם קצר בעברית'], shortEn: ['English name', 'שם באנגלית'], letters: ['Ballot letters', 'אותיות הרשימה'], color: ['Colour', 'צבע'], bloc: ['Bloc membership', 'שיוך לגוש'], blocs: ['Blocs', 'גושים'], nameEn: ['English name', 'שם באנגלית'], candidates: ['Candidates', 'מועמדים'], agreements: ['Agreements', 'הסכמי עודפים'], rules: ['Rules', 'כללים'], registered: ['Registered voters', 'בעלי זכות בחירה'], invalid: ['Invalid ballots', 'קולות פסולים'], withdrawn: ['Withdrawal', 'פרישה'], customGroupingName: ['Grouping name', 'שם החלוקה'], blocSchemeId: ['Grouping', 'חלוקה'], partyBlocs: ['Party membership', 'שיוך מפלגות'], candidateBlocs: ['Member membership', 'שיוך חברים'], factionSplits: ['Faction splits', 'פיצולי סיעות'], coalition: ['Coalition choices', 'בחירת קואליציה'], mode: ['Rule mode', 'מצב כללים'], seats: ['Seats', 'מנדטים'], quotaRounding: ['Quota rounding', 'עיגול המודד'], remainderMethod: ['Remainder method', 'שיטת חלוקת העודפים'], majorityCap: ['Half-seats cap', 'מגבלת מחצית המושבים'], maxAgreementSize: ['Agreement size', 'גודל הסכם'], agreementRequiresAllQualify: ['Agreement threshold condition', 'תנאי החסימה בהסכם'], quotaSeatOffset: ['Quota divisor offset', 'תוספת למחלק המודד'], remainderRequiresInitialSeat: ['Remainder needs a quota seat', 'עודפים מחייבים מנדט במודד'], agreementRequiresInitialSeat: ['Agreement needs a quota seat', 'הסכם מחייב מנדט במודד'], quotientRounding: ['Quotient rounding', 'עיגול המודדים'], largestRemainderRepeat: ['Repeated remainder seats', 'מנדטי שארית חוזרים'], tiePolicy: ['Tie procedure', 'הכרעה בשוויון'], seatsCappedAtCandidates: ['Candidate seat cap', 'מגבלת מושבים לפי מועמדים'], thresholdPct: ['Threshold', 'אחוז החסימה'], lotteryWinners: ['Lottery', 'הגרלה'], sponsorsHe: ['Sponsors', 'מגישים'], members: ['Members', 'חברות'], enabled: ['Enabled', 'בתוקף'], originIds: ['Origins', 'מקור'], heldVotes: ['Held votes', 'קולות מוחזקים'], parties: ['Parties', 'מפלגות'], in: ['In', 'בפנים'], out: ['Out', 'בחוץ'],
  };
  const listName = (id: string) => {
    const l = s.lists.find(l => l.id === id) ?? fallback?.lists.find(l => l.id === id);
    return l ? (lang === 'he' ? l.shortHe : l.shortEn ?? l.shortHe) : undefined;
  };
  return path.map(k => {
    if (names[k]) return names[k][lang === 'he' ? 1 : 0];
    const agreement = s.agreements.find(a => a.id === k) ?? fallback?.agreements.find(a => a.id === k);
    if (agreement) return agreement.members.map(id => listName(id) ?? (lang === 'he' ? 'רשימה שהוסרה' : 'Removed list')).join(' + ');
    const entity = [...s.blocs, ...(s.blocSchemes ?? []), ...s.lists.flatMap(l => [...l.candidates, ...(l.parties ?? [])]),
      ...(fallback ? [...fallback.blocs, ...(fallback.blocSchemes ?? []), ...fallback.lists.flatMap(l => [...l.candidates, ...(l.parties ?? [])])] : [])].find(x => x.id === k);
    return listName(k) ?? (entity ? (lang === 'he' ? entity.nameHe : ('nameEn' in entity ? entity.nameEn : null) ?? entity.nameHe) : (lang === 'he' ? 'פרט' : 'Detail'));
  }).join(' · ');
}
