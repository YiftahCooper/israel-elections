// Editable simulation state. A Scenario is a full, self-contained copy of an election's inputs;
// the historical dataset it was created from is never modified. Every displayed figure is derived
// from a Scenario through the engine — no totals are stored separately.
import { ELECTION_IDS, type BlocDef, type ElectionDataset, type ElectionId } from '../data/schema.ts';
import { percentToRational, toPercentString } from '../engine/rational.ts';
import type { AllocationInput, RemainderMethod, RuleSet } from '../engine/types.ts';
import { ISRAEL_1949, ISRAEL_1951, ISRAEL_1973, ISRAEL_1977, ISRAEL_1992, ISRAEL_2004, ISRAEL_2014, OPTIONAL_RULES, RULE_DEFAULTS, RULESETS } from '../engine/rules.ts';

export const SCENARIO_SCHEMA = 'israel-elections-scenario';
export const SCENARIO_VERSION = 1;

export interface SimCandidate {
  id: string; // stable: original candidate id, or `new-…` for inserted candidates
  nameHe: string;
  partyHe?: string;
  /** id of the list the candidate was originally registered on */
  originListId?: string;
  /** skipped when seats are filled (see Candidate.notSeated) */
  notSeated?: boolean;
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
  /** the official roster could not be obtained: candidates is empty for that reason, not because none registered */
  rosterUnavailable?: boolean;
  /** only the first ranks of the official roster are known (at least everyone elected) */
  rosterTruncated?: boolean;
}

export interface SimAgreement { id: string; members: string[]; enabled: boolean }

export interface SimRules {
  seats: number;
  thresholdPct: string; // exact decimal string, e.g. "3.25"
  quotaRounding: RuleSet['quotaRounding'];
  remainderMethod: RemainderMethod;
  majorityCap: boolean;
  seatsCappedAtCandidates?: boolean;
  maxAgreementSize: number;
  agreementRequiresAllQualify: boolean;
  quotaSeatOffset?: number;
  remainderRequiresInitialSeat?: boolean;
  agreementRequiresInitialSeat?: boolean;
  quotientRounding?: RuleSet['quotientRounding'];
  largestRemainderRepeat?: boolean;
  /** Default lottery; unspecified preserves a provisional tie without asserting a statutory procedure. */
  tiePolicy?: 'lottery' | 'unspecified';
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
  | { type: 'resetList'; listId: string; keepVotes?: boolean; base?: SimList | null }
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

/** Election date determines the statutory era, not the year a scenario is edited. */
export function electionRuleSetId(id: ElectionId): string {
  if (id === 'k9') return ISRAEL_1977.id;
  if (id === 'k13' || id === 'k14' || id === 'k15') return ISRAEL_1992.id;
  const n = Number(id.slice(1));
  if (n === 1) return ISRAEL_1949.id;
  if (n >= 2 && n <= 7) return ISRAEL_1951.id;
  if (Number.isInteger(n) && n >= 8 && n <= 12) return ISRAEL_1973.id;
  if (!Number.isInteger(n) || n < 16 || n > 26) throw new Error(`unknown election ${id}`);
  return n === 16 ? ISRAEL_1992.id : n <= 19 ? ISRAEL_2004.id : ISRAEL_2014.id;
}

export function historicalRules(ruleSetId: string): SimRules {
  const r = RULESETS[ruleSetId];
  if (!r) throw new Error(`unknown rule set ${ruleSetId}`);
  const out: SimRules = { seats: r.seats, thresholdPct: toPercentString(r.threshold), quotaRounding: r.quotaRounding, remainderMethod: r.remainderMethod,
    majorityCap: r.majorityCap, ...(r.seatsCappedAtCandidates ? { seatsCappedAtCandidates: true } : {}), maxAgreementSize: r.maxAgreementSize, agreementRequiresAllQualify: r.agreementRequiresAllQualify };
  // optional semantics only where the preset states them
  for (const k of OPTIONAL_RULES) if (r[k] !== undefined) Object.assign(out, { [k]: r[k] });
  return out;
}

/** Historical rules equal the preset field by field; an absent optional field means its default. */
const matchesPreset = (rules: Record<string, unknown>, expected: SimRules) =>
  Boolean(rules.seatsCappedAtCandidates) === Boolean(expected.seatsCappedAtCandidates)
  && Object.entries(expected).every(([k, v]) => rules[k] === v)
  && OPTIONAL_RULES.every((k) => (rules[k] ?? RULE_DEFAULTS[k]) === (expected[k] ?? RULE_DEFAULTS[k]));

/** `historicalId` is the statutory rule set the rules are labelled with, or null for experimental rules. */
export function toRuleSet(r: SimRules, historicalId: string | null): RuleSet {
  return {
    id: historicalId ?? 'experimental', historical: historicalId !== null, seats: r.seats,
    threshold: percentToRational(r.thresholdPct), quotaRounding: r.quotaRounding, remainderMethod: r.remainderMethod,
    majorityCap: r.majorityCap, ...(r.seatsCappedAtCandidates ? { seatsCappedAtCandidates: true } : {}), maxAgreementSize: r.maxAgreementSize, agreementRequiresAllQualify: r.agreementRequiresAllQualify,
    quotaSeatOffset: r.quotaSeatOffset, remainderRequiresInitialSeat: r.remainderRequiresInitialSeat,
    agreementRequiresInitialSeat: r.agreementRequiresInitialSeat, quotientRounding: r.quotientRounding,
    largestRemainderRepeat: r.largestRemainderRepeat, tiePolicy: r.tiePolicy,
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
      candidates: l.candidates.map((c) => ({ id: c.id, nameHe: c.nameHe, partyHe: c.partyHe, originListId: l.id, ...(c.notSeated ? { notSeated: true } : {}) })),
      ...(l.candidatesUnavailable ? { rosterUnavailable: true } : {}),
      ...(l.candidatesTruncated ? { rosterTruncated: true } : {}),
    })),
    agreements: ds.agreements.map((a) => ({ id: a.id, members: [...a.members], enabled: true })),
    blocs: ds.blocs.map((b) => ({ ...b })),
    lotteryWinners: {},
    log: [],
  };
}

export function toEngineInput(s: Scenario): AllocationInput {
  return {
    rules: toRuleSet(s.rules, s.mode === 'historical' ? electionRuleSetId(s.electionId) : null),
    lists: s.lists.map((l) => ({ id: l.id, votes: BigInt(l.votes), withdrawn: l.withdrawn, candidateCount: l.rosterUnavailable || l.rosterTruncated ? undefined : l.candidates.filter((c) => !c.notSeated).length })),
    agreements: s.agreements.filter((a) => a.enabled).map((a) => ({ id: a.id, members: a.members })),
    lotteryWinners: s.lotteryWinners,
  };
}

export const validVotes = (s: Scenario) => s.lists.reduce((t, l) => t + l.votes, 0);
export const votesCast = (s: Scenario) => validVotes(s) + s.invalid;

// Structural guards also cover logged actions without replaying them: old actions may legitimately
// refer to lists which have since been removed, or resolve historical values from a newer dataset.
type Check = (x: unknown) => boolean;
const record = (x: unknown): x is Record<string, unknown> => x !== null && typeof x === 'object' && !Array.isArray(x);
const string: Check = (x) => typeof x === 'string';
const boolean: Check = (x) => typeof x === 'boolean';
const whole: Check = (x) => typeof x === 'number' && Number.isSafeInteger(x) && x >= 0;
const finite: Check = (x) => typeof x === 'number' && Number.isFinite(x);
const optional = (check: Check): Check => (x) => x === undefined || check(x);
const nullable = (check: Check): Check => (x) => x === null || check(x);
const array = (check: Check): Check => (x) => Array.isArray(x) && x.every(check);
const shape = (fields: Record<string, Check>): Check => {
  const entries = Object.entries(fields);
  return (x) => record(x) && entries.every(([k, check]) => check(x[k]));
};
const oneOf = (...values: unknown[]): Check => (x) => values.includes(x);
const uniqueStrings: Check = (x) => array(string)(x) && new Set(x as string[]).size === (x as string[]).length;
const candidate = shape({ id: string, nameHe: string, partyHe: optional(string), originListId: optional(string) });
const candidates: Check = (x) => array(candidate)(x) && new Set((x as SimCandidate[]).map((c) => c.id)).size === (x as SimCandidate[]).length;
const bloc = shape({ id: string, nameHe: string, nameEn: string, color: string });
const agreement = shape({ id: string, members: uniqueStrings, enabled: boolean });
const listFields = shape({ id: string, originIds: uniqueStrings, letters: string, nameHe: string, shortHe: string,
  shortEn: nullable(string), color: string, bloc: nullable(string), votes: whole, withdrawn: boolean,
  heldVotes: optional(whole), sponsorsHe: string });
const list: Check = (x) => listFields(x) && candidates((x as Record<string, unknown>).candidates);
const ruleFields: Record<keyof SimRules, Check> = {
  seats: (x) => whole(x) && Number(x) >= 1 && Number(x) <= 1000,
  thresholdPct: (x) => {
    if (typeof x !== 'string' || !/^\d+(\.\d+)?$/.test(x)) return false;
    try { const t = percentToRational(x); return t.num <= t.den; } catch { return false; }
  },
  quotaRounding: oneOf('floor', 'exact'), remainderMethod: oneOf('bader-ofer', 'largest-remainder', 'sainte-lague', 'dhondt', 'modified-sainte-lague', 'droop'),
  seatsCappedAtCandidates: optional(boolean),
  majorityCap: boolean, maxAgreementSize: (x) => whole(x) && Number(x) >= 2, agreementRequiresAllQualify: boolean,
  quotaSeatOffset: optional((x) => whole(x) && Number(x) <= 1),
  remainderRequiresInitialSeat: optional(boolean), agreementRequiresInitialSeat: optional(boolean),
  quotientRounding: optional(oneOf('exact', 'floor')), largestRemainderRepeat: optional(boolean),
  tiePolicy: optional(oneOf('lottery', 'unspecified')),
};
const rules = shape(ruleFields);
const partial = (fields: Record<string, Check>): Check => (x) => record(x) && Object.entries(x).every(([k, v]) => Object.hasOwn(fields, k) && fields[k](v));
const stringMap = (value: Check): Check => (x) => record(x) && Object.values(x).every(value);
const actionFields: Record<Action['type'], Check> = {
  setVotes: shape({ listId: string, votes: whole }),
  transfer: shape({ from: string, to: string, votes: whole }),
  addVoters: shape({ allocations: array(shape({ listId: string, votes: whole })), invalid: whole, label: optional(string) }),
  redistribute: shape({ from: uniqueStrings, to: array(shape({ listId: string, share: finite })), votes: whole }),
  scaleAll: shape({ factorPct: finite }),
  merge: shape({ ids: uniqueStrings, newId: string, nameHe: string, letters: string, color: string, retentionPct: finite, candidateOrder: oneOf('concat', 'interleave'), nonRetained: oneOf('abstain', 'invalid') }),
  split: shape({ id: string, parts: array(shape({ newId: string, nameHe: string, letters: string, color: string, votes: whole, candidateIds: uniqueStrings })) }),
  addList: shape({ newId: string, nameHe: string, letters: string, color: string, votes: whole }),
  removeList: shape({ listId: string }), setWithdrawn: shape({ listId: string, withdrawn: boolean }),
  setListMeta: shape({ listId: string, patch: partial({ nameHe: string, shortHe: string, shortEn: nullable(string), letters: string, color: string, bloc: nullable(string) }) }),
  setAgreement: shape({ agreement }), removeAgreement: shape({ id: string }),
  candidates: shape({ listId: string, candidates, note: string }),
  setRules: shape({ patch: partial(ruleFields) }), setMode: shape({ mode: oneOf('historical', 'experimental') }),
  setTotals: shape({ registered: optional(whole), invalid: optional(whole) }), setBlocs: shape({ blocs: array(bloc) }),
  setLottery: shape({ key: string, winner: nullable(string) }),
  resetList: shape({ listId: string, keepVotes: optional(boolean), base: optional(nullable(list)) }),
  resetVotes: shape({ listId: string }), resetCandidates: shape({ listId: string }), rename: shape({ name: string }),
  setTurnout: shape({ pct: finite }),
  restore: (x) => record(x) && (
    x.what === 'lottery' ||
    x.what === 'agreements' && optional(array(agreement))(x.agreements) ||
    x.what === 'totals' && optional(whole)(x.registered) && optional(whole)(x.invalid) ||
    x.what === 'blocs' && optional(array(bloc))(x.blocs) && optional(stringMap(nullable(string)))(x.listBlocs)),
};
const action: Check = (x) => record(x) && typeof x.type === 'string' && Object.hasOwn(actionFields, x.type) && actionFields[x.type as Action['type']](x);

/** Full structural validation of an imported scenario; returns problems rather than throwing. */
export function validateScenario(x: unknown): string[] {
  if (!record(x)) return ['not an object'];
  const s = x;
  const e: string[] = [];
  if (s.schema !== SCENARIO_SCHEMA) e.push('not a scenario file exported by this application');
  if (s.version !== SCENARIO_VERSION) e.push('unsupported scenario version');
  if (![s.id, s.name, s.baseBuiltAt].every(string)) e.push('missing scenario identity or build timestamp');
  const electionKnown = ELECTION_IDS.includes(s.electionId as ElectionId);
  if (!electionKnown) e.push(`unknown election "${String(s.electionId)}"`);
  if (s.mode !== 'historical' && s.mode !== 'experimental') e.push('invalid mode');
  if (!rules(s.rules)) e.push('invalid rules (seats, threshold, rounding, method, agreement size or flags)');
  if (s.mode === 'historical' && electionKnown) {
    const expected = historicalRules(electionRuleSetId(s.electionId as ElectionId));
    if (!record(s.rules) || !matchesPreset(s.rules, expected)) e.push('historical rules must match the election statutory preset');
  }
  if (!whole(s.registered) || !whole(s.invalid)) e.push('registered voters and invalid ballots must be safe whole numbers ≥ 0');
  const blocIds = new Set<string>();
  if (!Array.isArray(s.blocs)) e.push('missing blocs');
  else for (const b of s.blocs) {
    if (!record(b) || !bloc(b)) { e.push('invalid bloc'); continue; }
    if (blocIds.has(b.id as string)) e.push(`duplicate bloc id ${b.id}`);
    blocIds.add(b.id as string);
  }
  const ids = new Set<string>();
  if (!Array.isArray(s.lists) || s.lists.length === 0) e.push('no lists');
  else {
    for (const l of s.lists) {
      if (!record(l) || typeof l.id !== 'string') { e.push('a list without an id'); continue; }
      if (ids.has(l.id)) e.push(`duplicate list id ${l.id}`);
      ids.add(l.id);
      if (!whole(l.votes)) e.push(`invalid vote count for ${l.id}`);
      const rosterValid = candidates(l.candidates);
      if (!rosterValid) e.push(`invalid candidates for ${l.id}`);
      if (!rosterValid || !listFields(l)) e.push(`invalid list fields for ${l.id}`);
      if (l.bloc !== null && (typeof l.bloc !== 'string' || !blocIds.has(l.bloc))) e.push(`unknown bloc for ${l.id}`);
    }
    if (s.lists.every((l) => record(l) && whole(l.votes)) && whole(s.invalid)) {
      const total = s.lists.reduce((sum: bigint, l: SimList) => sum + BigInt(l.votes), BigInt(s.invalid as number));
      if (total > BigInt(Number.MAX_SAFE_INTEGER)) e.push('vote totals exceed safe integers');
    }
  }
  const agreementIds = new Set<string>(), members = new Set<string>();
  if (!Array.isArray(s.agreements)) e.push('missing agreements');
  else for (const a of s.agreements) {
    if (!record(a) || !agreement(a)) { e.push('invalid agreement'); continue; }
    const ag = a as unknown as SimAgreement;
    if (ids.has(ag.id)) e.push(`agreement id ${ag.id} collides with a list id`);
    if (agreementIds.has(ag.id)) e.push(`duplicate agreement id ${ag.id}`);
    agreementIds.add(ag.id);
    if (ag.members.some((m) => !ids.has(m))) e.push(`agreement ${ag.id} refers to an unknown list`);
    // Section 67(a) binds historical scenarios. Experimental ones may hold agreements the engine
    // reports as inactive (too many members, a list already in another agreement).
    const statutory = s.mode !== 'experimental';
    if (ag.members.length < 2 || statutory && ag.enabled && ag.members.length > (record(s.rules) ? Number(s.rules.maxAgreementSize) : 2)) e.push(`invalid agreement size for ${ag.id}`);
    if (statutory && ag.enabled) for (const m of ag.members) {
      if (members.has(m)) e.push(`duplicate active agreement membership for ${m}`);
      members.add(m);
    }
  }
  if (!stringMap(string)(s.lotteryWinners)) e.push('invalid lottery outcomes');
  if (!array(shape({ at: string, action }))(s.log)) e.push('invalid change log');
  return e;
}
