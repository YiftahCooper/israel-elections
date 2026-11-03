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
  | { type: 'resetList'; listId: string; base: SimList | null }
  | { type: 'rename'; name: string }
  /** sets votes cast to pct% of registered voters; every list and the invalid count scale in proportion */
  | { type: 'setTurnout'; pct: number }
  /** restores one part of the scenario to the given (historical) value */
  | { type: 'restore'; what: 'agreements'; agreements: SimAgreement[] }
  | { type: 'restore'; what: 'totals'; registered: number; invalid: number }
  | { type: 'restore'; what: 'blocs'; blocs: BlocDef[]; listBlocs: Record<string, string | null> }
  | { type: 'restore'; what: 'lottery' };

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
