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

const METHOD: Record<SimRules['remainderMethod'], [string, string]> = {
  'bader-ofer': ['Bader–Ofer', 'בדר–עופר'], 'largest-remainder': ['largest remainder', 'השארית הגדולה'], 'sainte-lague': ['Sainte-Laguë', 'סנט-לגה'],
};
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

export interface ScenarioIssue { level: 'error' | 'warning'; en: string; he: string }

/** Internal-consistency checks the user must see (never silently corrected). */
export function scenarioIssues(s: Scenario, r: AllocationResult): ScenarioIssue[] {
  const out: ScenarioIssue[] = [];
  const cast = votesCast(s);
  if (cast > s.registered) out.push({ level: 'warning', en: `Votes cast (${cast.toLocaleString()}) exceed registered voters (${s.registered.toLocaleString()}); turnout would be above 100%. Raise the electorate or reduce votes.`, he: `מספר המצביעים (${cast.toLocaleString()}) עולה על מספר בעלי זכות הבחירה (${s.registered.toLocaleString()}); שיעור ההצבעה עולה על 100%.` });
  for (const l of r.lists) {
    const sl = s.lists.find((x) => x.id === l.id)!;
    if (l.seats > sl.candidates.length) out.push({ level: 'error', en: `${sl.shortEn ?? sl.shortHe} wins ${l.seats} seats but has only ${sl.candidates.length} candidates; ${l.seats - sl.candidates.length} seat(s) would stay vacant.`, he: `${sl.shortHe} זוכה ב-${l.seats} מנדטים אך יש בה רק ${sl.candidates.length} מועמדים; ${l.seats - sl.candidates.length} מושבים יישארו ריקים.` });
  }
  const letters = new Map<string, number>();
  for (const l of s.lists) letters.set(l.letters, (letters.get(l.letters) ?? 0) + 1);
  for (const [k, n] of letters) if (n > 1 && k) out.push({ level: 'warning', en: `Ballot letters “${k}” are used by ${n} lists.`, he: `האותיות "${k}" משמשות ${n} רשימות.` });
  if (validVotes(s) === 0) out.push({ level: 'error', en: 'There are no valid votes.', he: 'אין קולות כשרים.' });
  return out;
}

export const electedOf = (l: SimList, seats: number) => l.candidates.slice(0, seats);

/** Engine warnings in the interface language (the engine's own messages are English diagnostics). */
export function warningText(w: EngineWarning, s: Scenario, lang: Lang): string {
  const he = lang === 'he';
  const nm = (id: string) => { const l = s.lists.find((x) => x.id === id); return l ? listLabel(l, lang) : id; };
  const d = (w.data ?? {}) as Record<string, unknown>;
  switch (w.code) {
    case 'lottery-required': {
      const ids = (d.ids as string[] | undefined) ?? [];
      const names = ids.map((u) => { const a = s.agreements.find((x) => x.id === u); return a ? a.members.map(nm).join('+') : nm(u); }).join(he ? ' ו' : ' and ');
      return he ? `שוויון מדויק בין ${names}: החוק מחייב הגרלה של ועדת הבחירות. בחרו את תוצאת ההגרלה בלשונית "איך חולקו המנדטים".` : `Exact tie between ${names}: the law requires a CEC lottery. Choose the outcome in the “How the seats were allocated” tab.`;
    }
    case 'no-qualifying-lists': return he ? 'אף רשימה לא עברה את אחוז החסימה, ולכן אי אפשר לחלק מושבים.' : 'No list passed the threshold, so no seats can be allocated.';
    case 'zero-quota': return he ? 'יש פחות קולות משתתפים ממושבים, ולכן המודד השלם הוא 0; נעשה שימוש במודד המדויק (לא מעוגל).' : 'There are fewer qualifying votes than seats, so the whole-number quota is 0; the exact (unrounded) quota is used.';
    case 'quota-over-allocation': return he ? 'עם מספרי קולות קטנים כל כך, עיגול המודד כלפי מטה נותן יותר מושבים מהקיים. החוק אינו מתייחס למצב זה; נעשה שימוש במודד המדויק.' : 'With vote totals this small, rounding the quota down gives more seats than exist. The law does not cover this; the exact quota is used.';
    case 'seats-unallocatable': return he ? 'לא ניתן היה לחלק את כל המושבים: אף רשימה אינה זכאית למושב נוסף לפי הכללים הנבחרים.' : 'Not every seat could be allocated: no list is eligible for a further seat under the chosen rules.';
    case 'internal-loss': return he ? `${nm(String(d.list))} מקבלת פחות מושבים ממה שהמודד השלם שלה לבדה היה נותן, כי סעיף 82(ב) מחלק מחדש את מושבי הצמד מתחילה.` : `${nm(String(d.list))} ends with fewer seats than its own whole quota, because section 82(b) re-divides the pair's seats from scratch.`;
    case 'agreement-rule-departure': return he ? 'הסכם של יותר משתי רשימות אינו מותר לפי סעיף 67(א); הוא מחושב כאן ככלל ניסיוני.' : 'An agreement of more than two lists is not allowed by section 67(a); it is computed here as an experimental rule.';
  }
}
