// Memoised derivations: every displayed figure comes from allocate(scenario).
import type { ElectionDataset } from '../data/schema.ts';
import { allocate } from '../engine/allocate.ts';
import type { AllocationResult } from '../engine/types.ts';
import { scenarioFromDataset, toEngineInput, validVotes, votesCast, type Scenario, type SimList } from '../model/scenario.ts';
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
