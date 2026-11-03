// Editable simulation state. A Scenario is a full, self-contained copy of an election's inputs;
// the historical dataset it was created from is never modified. Every displayed figure is derived
// from a Scenario through the engine — no totals are stored separately.
import type { BlocDef, ElectionDataset, ElectionId } from '../data/schema.ts';
import { percentToRational } from '../engine/rational.ts';
import type { AllocationInput, RemainderMethod, RuleSet } from '../engine/types.ts';
import { ISRAEL_2014 } from '../engine/rules.ts';

export const SCENARIO_SCHEMA = 'israel-elections-scenario';
export const SCENARIO_VERSION = 1;

export interface SimCandidate {
  id: string; // stable: original candidate id, or `new-…` for inserted candidates
  nameHe: string;
  partyHe?: string;
  /** id of the list the candidate was originally registered on */
  originListId?: string;
}

export interface SimList {
  id: string; // dataset list id for historical lists; `sim-…` for lists created by merge/split/add
  originIds: string[]; // historical lists this list derives from
  letters: string;
  nameHe: string;
  shortHe: string;
  shortEn: string | null;
  color: string;
  bloc: string | null;
  votes: number;
  withdrawn: boolean;
  /** votes set aside as invalid while the list is withdrawn (returned on reinstatement) */
  heldVotes?: number;
  candidates: SimCandidate[];
  sponsorsHe: string;
}

export interface SimAgreement { id: string; members: string[]; enabled: boolean }

export interface SimRules {
  seats: number;
  thresholdPct: string; // exact decimal string, e.g. "3.25"
  quotaRounding: RuleSet['quotaRounding'];
  remainderMethod: RemainderMethod;
  majorityCap: boolean;
  maxAgreementSize: number;
  agreementRequiresAllQualify: boolean;
}

export interface ChangeEntry { at: string; action: Action }

export interface Scenario {
  schema: typeof SCENARIO_SCHEMA;
  version: number;
  id: string;
  name: string;
  electionId: ElectionId;
  /** sha of the dataset build the scenario was created from (detects later data corrections) */
  baseBuiltAt: string;
  mode: 'historical' | 'experimental';
  rules: SimRules;
  registered: number;
  invalid: number;
  lists: SimList[];
  agreements: SimAgreement[];
  blocs: BlocDef[];
  lotteryWinners: Record<string, string>;
  log: ChangeEntry[];
}

// Actions are plain data so they can be logged, replayed, shared and undone.
export type Action =
  | { type: 'setVotes'; listId: string; votes: number }
  | { type: 'transfer'; from: string; to: string; votes: number }
  | { type: 'addVoters'; allocations: { listId: string; votes: number }[]; invalid: number; label?: string }
  | { type: 'redistribute'; from: string[]; to: { listId: string; share: number }[]; votes: number }
  | { type: 'scaleAll'; factorPct: number }
  | { type: 'merge'; ids: string[]; newId: string; nameHe: string; letters: string; color: string; retentionPct: number; candidateOrder: 'concat' | 'interleave'; nonRetained: 'abstain' | 'invalid' }
  | { type: 'split'; id: string; parts: { newId: string; nameHe: string; letters: string; color: string; votes: number; candidateIds: string[] }[] }
  | { type: 'addList'; newId: string; nameHe: string; letters: string; color: string; votes: number }
  | { type: 'removeList'; listId: string }
  | { type: 'setWithdrawn'; listId: string; withdrawn: boolean }
  | { type: 'setListMeta'; listId: string; patch: Partial<Pick<SimList, 'nameHe' | 'shortHe' | 'shortEn' | 'letters' | 'color' | 'bloc'>> }
  | { type: 'setAgreement'; agreement: SimAgreement }
  | { type: 'removeAgreement'; id: string }
  | { type: 'candidates'; listId: string; candidates: SimCandidate[]; note: string }
  | { type: 'setRules'; patch: Partial<SimRules> }
  | { type: 'setMode'; mode: Scenario['mode'] }
  | { type: 'setTotals'; registered?: number; invalid?: number }
  | { type: 'setBlocs'; blocs: BlocDef[] }
  | { type: 'setLottery'; key: string; winner: string | null }
  /** restores a list from the historical dataset (`base` is only a fallback for logs made before v2) */
  | { type: 'resetList'; listId: string; base?: SimList | null }
  | { type: 'resetVotes'; listId: string }
  | { type: 'resetCandidates'; listId: string }
  | { type: 'rename'; name: string }
  /** sets votes cast to pct% of registered voters; every list and the invalid count scale in proportion */
  | { type: 'setTurnout'; pct: number }
  /** restores one part of the scenario to the given (historical) value */
  /** restores one part from the historical dataset (payload fields are fallbacks for old logs) */
  | { type: 'restore'; what: 'agreements'; agreements?: SimAgreement[] }
  | { type: 'restore'; what: 'totals'; registered?: number; invalid?: number }
  | { type: 'restore'; what: 'blocs'; blocs?: BlocDef[]; listBlocs?: Record<string, string | null> }
  | { type: 'restore'; what: 'lottery' };

/** What reset/restore actions resolve against: the historical scenario of the same dataset. */
export interface ActionContext { base?: Scenario }

export function historicalRules(ruleSetId: string): SimRules {
  if (ruleSetId !== ISRAEL_2014.id) throw new Error(`unknown rule set ${ruleSetId}`);
  return { seats: 120, thresholdPct: '3.25', quotaRounding: 'floor', remainderMethod: 'bader-ofer', majorityCap: true, maxAgreementSize: 2, agreementRequiresAllQualify: true };
}

export function toRuleSet(r: SimRules, historical: boolean): RuleSet {
  return {
    id: historical ? ISRAEL_2014.id : 'experimental', historical, seats: r.seats,
    threshold: percentToRational(r.thresholdPct), quotaRounding: r.quotaRounding, remainderMethod: r.remainderMethod,
    majorityCap: r.majorityCap, maxAgreementSize: r.maxAgreementSize, agreementRequiresAllQualify: r.agreementRequiresAllQualify,
  };
}

export function scenarioFromDataset(ds: ElectionDataset, name = ''): Scenario {
  return {
    schema: SCENARIO_SCHEMA, version: SCENARIO_VERSION, id: `${ds.id}-${Date.now().toString(36)}`, name, electionId: ds.id,
    baseBuiltAt: ds.buildInfo.builtAt, mode: 'historical', rules: historicalRules(ds.ruleSetId),
    registered: ds.totals.registered, invalid: ds.totals.invalid,
    lists: ds.lists.map((l) => ({
      id: l.id, originIds: [l.id], letters: l.letters, nameHe: l.nameHe, shortHe: l.shortHe, shortEn: l.shortEn,
      color: l.color, bloc: l.bloc, votes: l.votes, withdrawn: l.withdrawn, sponsorsHe: l.sponsorsHe,
      candidates: l.candidates.map((c) => ({ id: c.id, nameHe: c.nameHe, partyHe: c.partyHe, originListId: l.id })),
    })),
    agreements: ds.agreements.map((a) => ({ id: a.id, members: [...a.members], enabled: true })),
    blocs: ds.blocs.map((b) => ({ ...b })),
    lotteryWinners: {},
    log: [],
  };
}

export function toEngineInput(s: Scenario): AllocationInput {
  return {
    rules: toRuleSet(s.rules, s.mode === 'historical'),
    lists: s.lists.map((l) => ({ id: l.id, votes: BigInt(l.votes), withdrawn: l.withdrawn })),
    agreements: s.agreements.filter((a) => a.enabled).map((a) => ({ id: a.id, members: a.members })),
    lotteryWinners: s.lotteryWinners,
  };
}

export const validVotes = (s: Scenario) => s.lists.reduce((t, l) => t + l.votes, 0);
export const votesCast = (s: Scenario) => validVotes(s) + s.invalid;

/** Full structural validation of an imported scenario; returns a list of problems (empty = valid). */
export function validateScenario(x: unknown): string[] {
  const e: string[] = [];
  const s = x as Partial<Scenario>;
  const whole = (n: unknown) => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0;
  if (!s || typeof s !== 'object') return ['not an object'];
  if (s.schema !== SCENARIO_SCHEMA) e.push('not a scenario file exported by this application');
  if (s.electionId !== 'k25' && s.electionId !== 'k26') e.push(`unknown election "${String(s.electionId)}"`);
  if (s.mode !== 'historical' && s.mode !== 'experimental') e.push('invalid mode');
  const r = s.rules as SimRules | undefined;
  if (!r) e.push('missing rules');
  else {
    if (!Number.isInteger(r.seats) || r.seats < 1 || r.seats > 1000) e.push('seats must be 1–1000');
    try { const t = percentToRational(String(r.thresholdPct)); if (t.num > t.den) e.push('threshold above 100%'); } catch { e.push(`invalid threshold "${String(r.thresholdPct)}"`); }
    if (r.quotaRounding !== 'floor' && r.quotaRounding !== 'exact') e.push('invalid quota rounding');
    if (!['bader-ofer', 'largest-remainder', 'sainte-lague'].includes(r.remainderMethod)) e.push('invalid remainder method');
    if (!Number.isInteger(r.maxAgreementSize) || r.maxAgreementSize < 2) e.push('invalid agreement size');
    if (typeof r.majorityCap !== 'boolean' || typeof r.agreementRequiresAllQualify !== 'boolean') e.push('invalid rule flags');
  }
  if (!whole(s.registered) || !whole(s.invalid)) e.push('registered voters and invalid ballots must be whole numbers ≥ 0');
  if (!Array.isArray(s.lists) || s.lists.length === 0) e.push('no lists');
  else {
    const ids = new Set<string>();
    for (const l of s.lists) {
      if (!l || typeof l.id !== 'string') { e.push('a list without an id'); continue; }
      if (ids.has(l.id)) e.push(`duplicate list id ${l.id}`);
      ids.add(l.id);
      if (!whole(l.votes)) e.push(`invalid vote count for ${l.id}`);
      if (typeof l.nameHe !== 'string' || typeof l.shortHe !== 'string' || typeof l.letters !== 'string' || typeof l.color !== 'string') e.push(`missing names or colour for ${l.id}`);
      if (!Array.isArray(l.candidates) || l.candidates.some((c) => !c || typeof c.id !== 'string' || typeof c.nameHe !== 'string')) e.push(`invalid candidates for ${l.id}`);
      if (!Array.isArray(l.originIds)) e.push(`missing origins for ${l.id}`);
      if (typeof l.withdrawn !== 'boolean') e.push(`missing withdrawn flag for ${l.id}`);
    }
    if (!Array.isArray(s.agreements)) e.push('missing agreements');
    else for (const a of s.agreements) if (!Array.isArray(a.members) || a.members.some((m) => !ids.has(m))) e.push(`agreement ${String(a.id)} refers to an unknown list`);
  }
  if (!Array.isArray(s.blocs)) e.push('missing blocs');
  if (!s.lotteryWinners || typeof s.lotteryWinners !== 'object') e.push('missing lottery outcomes');
  if (!Array.isArray(s.log)) e.push('missing change log');
  return e;
}
