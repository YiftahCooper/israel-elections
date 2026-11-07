import { partyDisplayColor } from './partyDisplayColor.ts';
import { hebrewPrefix } from './hebrewPrefix.ts';
import { formatDate } from './dateFormat.ts';
import { factLog } from '../model/actionClassification.ts';
import { groupingName } from './groupingName.ts';
import { englishLabel } from '../data/names.ts';
import {inputDiffs,analysisPart,inputPart,replacementScopes,scopeCovers} from '../model/editScopes.ts';
import {PARTS,type Part} from '../model/parts.ts';
import {isFamilyGrouping} from '../families/labels.ts';
import { applyAction } from '../model/actions.ts';
import { compareAllocations } from '../engine/analysis.ts';
// Memoised derivations: every displayed figure comes from allocate(scenario).
import { allocate } from '../engine/allocate.ts';
import type { AllocationResult, EngineWarning } from '../engine/types.ts';
import { NO_COALITION, electionRuleSetId, historicalRules, toEngineInput, validVotes, votesCast, type Scenario, type SimList, type SimRules } from '../model/scenario.ts';
import type { Lang } from './i18n.ts';

const allocCache = new WeakMap<Scenario, AllocationResult>();
export function allocationOf(s: Scenario): AllocationResult {
  let r = allocCache.get(s);
  if (!r) { r = allocate(toEngineInput(s)); allocCache.set(s, r); }
  return r;
}

export { baselineOf } from './factionDefaults.ts';

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
  // the law's method by the name the app gives it (1949: highest averages, not Bader–Ofer)
  if (r.remainderMethod !== law.remainderMethod) out.push(he ? `חלוקת עודפים: ${METHOD[r.remainderMethod][1]} (בחוק: ${methodOf(law).he})` : `remainder seats by ${METHOD[r.remainderMethod][0]} (law: ${methodOf(law).en})`);
  if (Boolean(r.remainderRequiresInitialSeat) !== Boolean(law.remainderRequiresInitialSeat)) out.push(he ? `עודפים ${r.remainderRequiresInitialSeat ? 'רק' : 'גם'} לרשימות ${r.remainderRequiresInitialSeat ? 'עם' : 'בלי'} מודד שלם` : `remainder seats ${r.remainderRequiresInitialSeat ? 'only for' : 'also for'} lists ${r.remainderRequiresInitialSeat ? 'with' : 'without'} a whole quota`);
  if ((r.quotaSeatOffset ?? 0) !== (law.quotaSeatOffset ?? 0)) out.push(he ? (r.quotaSeatOffset ? 'המודד מחולק במושבים ועוד אחד' : 'המודד מחולק במספר המושבים') : (r.quotaSeatOffset ? 'quota divided by seats plus one' : 'quota divided by the seats'));
  if (r.quotaRounding !== law.quotaRounding) out.push(he ? 'מודד ללא עיגול' : 'quota not rounded down');
  if (r.majorityCap !== law.majorityCap) out.push(he ? `מגבלת מחצית המנדטים ${onOff(r.majorityCap)}` : `half-seats cap ${onOff(r.majorityCap)}`);
  if (r.maxAgreementSize !== law.maxAgreementSize) out.push(he ? `הסכמי עודפים של עד ${r.maxAgreementSize} רשימות` : `surplus agreements of up to ${r.maxAgreementSize} lists`);
  if (r.agreementRequiresAllQualify !== law.agreementRequiresAllQualify) out.push(he ? 'הסכם תקף גם אם שותפה לא עברה את החסימה' : 'agreements count even if a partner fails the threshold');
  return out;
}

export const listLabel = (l: Pick<SimList, 'shortHe' | 'shortEn'>, lang: Lang) => (lang === 'en' ? englishLabel(l.shortEn, l.shortHe) : l.shortHe);

/** Pass null only for the real election result; saved bases are always named. */
export function referenceLabel(reference: Pick<Scenario, 'name'> | null, lang: Lang) {
  const he = lang === 'he';
  const name = reference ? reference.name || (he ? 'תרחיש שמור' : 'Saved scenario') : he ? 'התוצאה הרשמית' : 'Official result';
  return {
    name,
    since: he ? hebrewPrefix('מ', name) : `from ${reference ? name : 'the official result'}`,
    at: reference ? (he ? `בתרחיש ${name}` : `in ${name}`) : he ? 'בפועל' : 'officially',
    more: he ? ` יותר מאשר ${hebrewPrefix('ב', name)}` : ` more than ${reference ? name : 'the official result'}`,
    fewer: he ? ` פחות מאשר ${hebrewPrefix('ב', name)}` : ` fewer than ${reference ? name : 'the official result'}`,
    seats: reference ? (he ? `מנדטים בתרחיש ${name}` : `Seats in ${name}`) : he ? 'מנדטים בתוצאה הרשמית' : 'Official seats',
  };
}

/** Changes count result-changing actions, not touched fields; exclude the shared saved history.
 * A divergent/earlier draft also counts reference actions it no longer contains. */
export function changeCount(s: Scenario, reference: Scenario | null): number {
  const now = factLog(s), before = reference ? factLog(reference) : [];
  let common = 0;
  while (common < Math.min(now.length, before.length) && canonical(now[common].action) === canonical(before[common].action)) common++;
  return now.length + before.length - 2 * common;
}
export function changesLabel(count: number, reference: Pick<Scenario, 'name'> | null, lang: Lang, compact = false): string {
  if (!count && !reference) return lang === 'he' ? 'אין שינויים' : 'No changes';
  if (!count && !compact) return `${lang === 'he' ? 'אין שינויים' : 'No changes'} ${referenceLabel(reference, lang).since}`;
  const short = lang === 'he' ? (count === 1 ? 'שינוי אחד' : `${count} שינויים`) : `${count} ${count === 1 ? 'change' : 'changes'}`;
  if (compact && reference) return `${count} ${referenceLabel(reference, lang).since}`;
  return compact ? short : `${short} ${referenceLabel(reference, lang).since}`;
}

/** History keeps the bar's reference first, then explains its full official-result record. */
export function historyChangesLabels(s: Scenario, reference: Scenario | null, lang: Lang) {
  const count = changeCount(s, reference), official = factLog(s).length;
  return {
    active: changesLabel(count, reference, lang),
    official: reference && count !== official ? `${official} ${referenceLabel(null, lang).since}` : null,
  };
}

export interface ScenarioIssue { level: 'error' | 'warning'; en: string; he: string }

/** Internal-consistency checks the user must see (never silently corrected). */
export function scenarioIssues(s: Scenario, r: AllocationResult): ScenarioIssue[] {
  const out: ScenarioIssue[] = [];
  const cast = votesCast(s);
  if (cast > s.registered) out.push({ level: 'warning', en: `Votes cast (${cast.toLocaleString('en-US')}) exceed registered voters (${s.registered.toLocaleString('en-US')}); turnout would be above 100%. Raise the electorate or reduce votes.`, he: `מספר המצביעים (${cast.toLocaleString('en-US')}) עולה על מספר בעלי זכות הבחירה (${s.registered.toLocaleString('en-US')}); שיעור ההצבעה עולה על 100%. הגדילו את מספר בעלי זכות הבחירה או הפחיתו קולות.` });
  for (const l of r.lists) {
    const sl = s.lists.find((x) => x.id === l.id)!;
    // an unavailable or truncated roster is unknown beyond what is listed, not short of candidates
    const n = seatedOrder(sl).length;
    if (l.seats > n && !sl.rosterUnavailable && !sl.rosterTruncated) out.push({ level: 'error', en: `${listLabel(sl, 'en')} wins ${l.seats} seats but has only ${n} candidates; ${l.seats - n} seat(s) would stay vacant.`, he: `${sl.shortHe} זוכה ב-${l.seats} מנדטים אך יש בה רק ${n} מועמדים; ${l.seats - n} מושבים יישארו ריקים.` });
  }
  const letters = new Map<string, number>();
  for (const l of s.lists) letters.set(l.letters, (letters.get(l.letters) ?? 0) + 1);
  for (const [k, n] of letters) if (n > 1 && k) out.push({ level: 'warning', en: `Ballot letters “${k}” are used by ${n} lists.`, he: `האותיות "${k}" משמשות ${n} רשימות.` });
  if (validVotes(s) === 0) out.push({ level: 'error', en: 'There are no valid votes.', he: 'אין קולות כשרים.' });
  return out;
}

/** The name to show: the curated correction of a misprinted candidate-notice name, else the name as printed. */
export const shownName = (c: { nameHe: string; displayNameHe?: string }) => c.displayNameHe ?? c.nameHe;
/** A candidate's name in the interface language: the official English name when the Knesset publishes one, else the Hebrew. */
export const candidateName = (c: { nameHe: string; displayNameHe?: string; nameEn?: string }, lang: Lang) => (lang === 'en' && c.nameEn ? c.nameEn : shownName(c));

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
  const nm = (id: string) => { const l = s.lists.find((x) => x.id === id); return l ? listLabel(l, lang) : (lang === 'he' ? 'רשימה לא ידועה' : 'Unknown list'); };
  const d = (w.data ?? {}) as Record<string, unknown>;
  switch (w.code) {
    case 'inferred-candidate-cap': {
      const names = (d.cappedIds as string[]).map(nm).join(he ? ' ו' : ' and ');
      return he ? `מספר המועמדים הגביל את המנדטים של ${names} ושינה את החלוקה. ההגבלה ההיסטורית של 1977 מתועדת; החלתה בתרחיש ששונה היא הסקה של האפליקציה.` : `Candidate counts limited the seats of ${names} and changed the allocation. The historical 1977 cap is documented; applying it to this changed scenario is an app inference.`;
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
      else pieces.push({ bloc: b, listId: l.id, partyId, color: party ? partyDisplayColor(l, party.id) : l.color, n: 1 });
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
      out.push({ key: `${l.id}:${p.id}`, listId: l.id, partyId: p.id, nameHe: p.nameHe, nameEn: p.nameEn, color: partyDisplayColor(l, p.id), logo: p.logo, seats: n, bloc });
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
  return g ? `${groupingName(g, lang)}${g.appDefined ? '' : ` · ${g.date ? formatDate(g.date, lang) : (lang === 'he' ? 'חלוקה מוכרת בבחירות אלה' : 'recognised grouping of this election')}`}` : s.customGroupingName ?? (lang === 'he' ? 'החלוקה שלכם' : 'Your grouping');
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
  return changes;
}

function partMarkerValue(s:Scenario,part:Part,listId?:string):unknown {
 const lists=listId?s.lists.filter(l=>l.id===listId):s.lists;
 switch(part){
  case 'blocs':return s.customGroupingName??s.blocSchemes?.find(g=>g.id===s.blocSchemeId)??s.blocs;
  case 'rules':return s.rules;
  case 'totals':return {registered:s.registered,invalid:s.invalid};
  case 'agreements':return s.agreements;
  case 'coalitions':return s.coalition??NO_COALITION;
  case 'votes':return lists.map(l=>({nameHe:l.shortHe,shortEn:l.shortEn,votes:l.votes}));
  case 'identity':return lists.map(l=>({nameHe:l.nameHe,shortEn:l.shortEn,letters:l.letters}));
  case 'candidates':return lists.map(l=>({nameHe:l.shortHe,shortEn:l.shortEn,candidates:l.candidates}));
  case 'structure':return lists.map(l=>({nameHe:l.shortHe,shortEn:l.shortEn,withdrawn:l.withdrawn}));
 }
}
export type EditPath = readonly string[];
/** Stable ID paths for collections: reordering lists cannot mark an unrelated list. */
export function referenceValue(s: Scenario, path: EditPath): unknown {
  if(path[0]==='parts')return partMarkerValue(s,path[1] as Part,path[2]);
  return path.reduce<unknown>((v, k) => Array.isArray(v) ? v.find(x => x?.id === k) : v && typeof v === 'object' ? ((v as Record<string, unknown>)[k] ?? (k === 'coalition' ? NO_COALITION : k === 'partyBlocs' || k === 'candidateBlocs' ? {} : undefined)) : undefined, s);
}
const canonical = (v: unknown): string => JSON.stringify(v, (_k, x) => x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map(k => [k, x[k]])) : x) ?? 'null';
export function differsFromReference(s: Scenario, reference: Scenario, path: EditPath): boolean {
  return canonical(referenceValue(s, path)) !== canonical(referenceValue(reference, path));
}
/** Marker paths preserve replacement intent. Numerical comparisons still use scenario inputs. */
const activeScopes=(s:Scenario,reference:Scenario)=>{
 let common=0;while(common<Math.min(s.log.length,reference.log.length)&&canonical(s.log[common].action)===canonical(reference.log[common].action))common++;
 return replacementScopes(s).filter(x=>x.at>=common);
};
/** Detachment from a sourced scheme is bookkeeping accompanying a manual bloc edit,
 * rather than a second edit to a second item. Sourced view choices are already excluded. */
const markerDiffs=(s:Scenario,reference:Scenario)=>{
 const paths=inputDiffs(s,reference);
 return s.blocSchemeId===null&&paths.some(p=>p[0]!=='blocSchemeId'&&inputPart(p)==='blocs')
  ?paths.filter(p=>p[0]!=='blocSchemeId'):paths;
};
/** The lists a user's vote edits chose, as opposed to lists that only absorbed the balance (the "other lists
 *  proportionally" donors). Only the chosen lists carry a vote marker; the others still show their changed numbers.
 *  null means every list was chosen (a whole-election edit such as turnout or scaling all votes). */
function chosenVoteLists(s:Scenario,reference:Scenario):Set<string>|null{
 const prefix=reference.log.length<=s.log.length&&reference.log.every((e,i)=>s.log[i]===e||s.log[i]?.at===e.at&&JSON.stringify(s.log[i]?.action)===JSON.stringify(e.action));
 const chosen=new Set<string>();
 for(const {action:a} of s.log.slice(prefix?reference.log.length:0)){
  if(a.type==='setVotes')chosen.add(a.listId);
  else if(a.type==='transfer'){chosen.add(a.from);chosen.add(a.to);}
  else if(a.type==='redistribute'){const to=a.to.map(x=>x.listId);
   // the edited side is the one the user named: the smaller side (one list or one bloc against everyone else)
   for(const id of a.from.length<to.length?a.from:to.length<a.from.length?to:[...a.from,...to])chosen.add(id);}
  else if(a.type==='familyOperation'&&a.operation==='scale'){
   // members come first in the allocations; they are the prefix whose new votes sum to the family target
   let sum=0,k=0;for(;k<a.allocations.length;k++){sum+=a.allocations[k].votes;if(sum===a.target)break;}
   for(const x of a.allocations.slice(0,k<a.allocations.length?k+1:a.allocations.length))chosen.add(x.listId);}
  else if(a.type==='addVoters')for(const x of a.allocations)chosen.add(x.listId);
  else if(a.type==='scaleAll'||a.type==='setTurnout')return null;
  else if(a.type==='copyFrom'){if(a.actions.some(x=>x.type==='setTurnout'))return null;for(const id of a.provenance.targetListIds??[])chosen.add(id);}
 }
 return chosen;
}
const markerCache=new WeakMap<Scenario,WeakMap<Scenario,EditPath[]>>();
export function referenceChanges(s:Scenario,reference:Scenario):EditPath[]{
 let cache=markerCache.get(s);if(!cache){cache=new WeakMap();markerCache.set(s,cache);}const hit=cache.get(reference);if(hit)return hit;
 const scopes=activeScopes(s,reference);
 const owner=(p:EditPath)=>scopes.findLast(x=>scopeCovers(x,p));
 const raw=markerDiffs(s,reference),paths:EditPath[]=raw.filter(p=>!owner(p));
 for(const scope of scopes){
  const partPath=['parts',scope.part,...(scope.listId?[scope.listId]:[])];
  if(markerDiffs(scope.checkpoint,reference).some(p=>owner(p)===scope))paths.push(partPath);
  paths.push(...markerDiffs(s,scope.checkpoint).filter(p=>owner(p)===scope));
 }
 const chosen=chosenVoteLists(s,reference);
 // a list whose votes changed only as the balance of someone else's edit is not itself an edit
 const marked=chosen?paths.filter(p=>!(p[0]==='lists'&&p[2]==='votes'&&p.length===3&&!chosen.has(p[1]))):paths;
 const unique=[...new Map(marked.map(p=>[p.join('/'),p])).values()];cache.set(reference,unique);return unique;
}
/** Part headers can address the logical part, while fields only address their own net edits. */
export function markerPath(s:Scenario,reference:Scenario,path:EditPath):EditPath|null {
 const changes=referenceChanges(s,reference);
 const exact=changes.find(p=>canonical(p)===canonical(path));if(exact)return exact;
 const root=path.length===1||path[0]==='customGroupingName';
 if(root){const part=inputPart(path);return changes.find(p=>p[0]==='parts'&&p[1]===part)??null;}
 return null;
}
export function markerReference(s:Scenario,reference:Scenario,path:EditPath):Scenario {
 if(path[0]==='parts')return reference;
 return activeScopes(s,reference).findLast(x=>scopeCovers(x,path))?.checkpoint??reference;
}

export function editPathLabel(s: Scenario, path: EditPath, lang: Lang, fallback?: Scenario): string {
  if(path[0]==='parts')return PARTS[path[1] as Part]?.[lang]??'';
  const names: Record<string, [string, string]> = {
    description: ['Description', 'תיאור'],
    lists: ['Lists', 'רשימות'], votes: ['Votes', 'קולות'], nameHe: ['Full name', 'שם מלא'], shortHe: ['Short Hebrew name', 'שם קצר בעברית'], shortEn: ['English name', 'שם באנגלית'], letters: ['Ballot letters', 'אותיות הרשימה'], color: ['Colour', 'צבע'], bloc: ['Bloc membership', 'שיוך לגוש'], blocs: ['Blocs', 'גושים'], nameEn: ['English name', 'שם באנגלית'], candidates: ['Candidates', 'מועמדים'], agreements: ['Agreements', 'הסכמי עודפים'], rules: ['Rules', 'כללים'], registered: ['Registered voters', 'בעלי זכות בחירה'], invalid: ['Invalid ballots', 'קולות פסולים'], withdrawn: ['Withdrawal', 'פרישה'], customGroupingName: ['Grouping name', 'שם החלוקה'], blocSchemeId: ['Grouping', 'חלוקה'], partyBlocs: ['Party membership', 'שיוך מפלגות'], candidateBlocs: ['Member membership', 'שיוך חברים'], factionSplits: ['Faction splits', 'פיצולי סיעות'], coalition: ['Coalition choices', 'בחירת קואליציה'], mode: ['Rule mode', 'מצב כללים'], seats: ['Seats', 'מנדטים'], quotaRounding: ['Quota rounding', 'עיגול המודד'], remainderMethod: ['Remainder method', 'שיטת חלוקת העודפים'], majorityCap: ['Half-seats cap', 'מגבלת מחצית המושבים'], maxAgreementSize: ['Agreement size', 'גודל הסכם'], agreementRequiresAllQualify: ['Agreement threshold condition', 'תנאי החסימה בהסכם'], quotaSeatOffset: ['Quota divisor offset', 'תוספת למחלק המודד'], remainderRequiresInitialSeat: ['Remainder needs a quota seat', 'עודפים מחייבים מנדט במודד'], agreementRequiresInitialSeat: ['Agreement needs a quota seat', 'הסכם מחייב מנדט במודד'], quotientRounding: ['Quotient rounding', 'עיגול המודדים'], largestRemainderRepeat: ['Repeated remainder seats', 'מנדטי שארית חוזרים'], tiePolicy: ['Tie procedure', 'הכרעה בשוויון'], seatsCappedAtCandidates: ['Candidate seat cap', 'מגבלת מושבים לפי מועמדים'], thresholdPct: ['Threshold', 'אחוז החסימה'], lotteryWinners: ['Lottery', 'הגרלה'], sponsorsHe: ['Sponsors', 'מגישים'], members: ['Members', 'חברות'], enabled: ['Enabled', 'בתוקף'], originIds: ['Origins', 'מקור'], heldVotes: ['Held votes', 'קולות מוחזקים'], parties: ['Parties', 'מפלגות'], in: ['In', 'בפנים'], support: ['Outside support', 'תמיכה מבחוץ'], abstain: ['Abstains by arrangement', 'נמנעת בהסדר'], out: ['Out', 'בחוץ'],
  };
  const listName = (id: string) => {
    const l = s.lists.find(l => l.id === id) ?? fallback?.lists.find(l => l.id === id);
    return l ? (lang === 'he' ? l.shortHe : listLabel(l, 'en')) : undefined;
  };
  return path.map(k => {
    if (names[k]) return names[k][lang === 'he' ? 1 : 0];
    const agreement = s.agreements.find(a => a.id === k) ?? fallback?.agreements.find(a => a.id === k);
    if (agreement) return agreement.members.map(id => listName(id) ?? (lang === 'he' ? 'רשימה שהוסרה' : 'Removed list')).join(' + ');
    const entity = [...s.blocs, ...(s.blocSchemes ?? []), ...s.lists.flatMap(l => [...l.candidates, ...(l.parties ?? [])]),
      ...(fallback ? [...fallback.blocs, ...(fallback.blocSchemes ?? []), ...fallback.lists.flatMap(l => [...l.candidates, ...(l.parties ?? [])])] : [])].find(x => x.id === k);
    return listName(k) ?? (entity ? (lang === 'he' ? entity.nameHe : englishLabel('nameEn' in entity ? entity.nameEn : null,entity.nameHe)) : (lang === 'he' ? 'פרט' : 'Detail'));
  }).join(' · ');
}

/** A-only comparison for chrome, identity and factual summaries. Marker scopes remain A/B. */
export const resultChanges=(s:Scenario,reference:Scenario):EditPath[]=>referenceChanges(s,reference).filter(p=>!analysisPart(p));
