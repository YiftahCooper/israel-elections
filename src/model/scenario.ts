import { validFamily, type Family } from '../families/model.ts';
import type { SourceChoice } from '../app/voteEdit.ts';
import {isHexColour} from '../data/colourGuard.ts';
// Editable simulation state. A Scenario is a full, self-contained copy of an election's inputs;
// the historical dataset it was created from is never modified. Every displayed figure is derived
// from a Scenario through the engine — no totals are stored separately.
import type { Part, PartSnapshot } from './parts.ts';
import { ELECTION_IDS, type BlocDef, type BlocScheme, type CandidateBio, type ElectionDataset, type ElectionId, type LogoRef, type PartyDef, type PartyLink } from '../data/schema.ts';
import { percentToRational, toPercentString } from '../engine/rational.ts';
import type { AllocationInput, RemainderMethod, RuleSet } from '../engine/types.ts';
import { ISRAEL_1949, ISRAEL_1951, ISRAEL_1973, ISRAEL_1977, ISRAEL_1992, ISRAEL_2004, ISRAEL_2014, OPTIONAL_RULES, RULE_DEFAULTS, RULESETS } from '../engine/rules.ts';

export const SCENARIO_SCHEMA = 'israel-elections-scenario';
export const SCENARIO_VERSION = 1;

/** Coalitions tool choices, one role per seated unit (list, or a joint list's party when split);
 *  a unit in none of the four is "Any", free for the search to include. Roles follow
 *  docs/research/government-support-roles.md: `in` = government member (with or without ministries);
 *  `support` = outside support, voting for the government without joining it; `abstain` = abstains by
 *  arrangement, so it is not counted among those voting; `out` = never a member, assumed to vote against. */
export interface CoalitionChoices { in: string[]; support: string[]; abstain: string[]; out: string[] }
export type CoalitionRole = keyof CoalitionChoices;
export const COALITION_ROLES = ['in', 'support', 'abstain', 'out'] as const satisfies readonly CoalitionRole[];
export const NO_COALITION: CoalitionChoices = { in: [], support: [], abstain: [], out: [] };
/** The choices with `id` moved to `role` ('any' clears it), keeping every other unit's role. */
export const withCoalitionRole = (c: CoalitionChoices, id: string, role: CoalitionRole | 'any'): CoalitionChoices =>
  ({ in: [], support: [], abstain: [], out: [], ...Object.fromEntries(COALITION_ROLES.map((k) => [k, k === role ? [...c[k].filter((x) => x !== id), id] : c[k].filter((x) => x !== id)])) });

export interface SimCandidate {
  id: string; // stable: original candidate id, or `new-…` for inserted candidates
  nameHe: string;
  partyHe?: string;
  /** id of the list the candidate was originally registered on */
  originListId?: string;
  /** skipped when seats are filled (see Candidate.notSeated) */
  notSeated?: boolean;
  /** shown instead of nameHe where the candidate notice misprints the name (Candidate.displayNameHe) */
  displayNameHe?: string;
  /** official English name (Candidate.nameEn); cleared when the candidate is renamed */
  nameEn?: string;
  /** curated bilingual notes (Candidate.notes) */
  notes?: { en: string; he: string }[];
  /** constituent party on a joint list (Candidate.partyId; decision 0087) */
  partyId?: string;
  /** biography links (Candidate.bio) */
  bio?: CandidateBio;
  /** copied from another election's list (Compare); `originListId` is then the list it now stands on */
  importedFrom?: { electionId: string; listId: string };
}

export interface SyntheticIdentity {
  kind: 'merge' | 'split' | 'new';
  parts: { letters: string; color: string }[];
  part?: number;
  total?: number;
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
  /** constituent parties of a joint list (ListRecord.parties; decision 0087) */
  parties?: PartyDef[];
  /** the list's logo at this election (ListRecord.logo) */
  logo?: LogoRef;
  /** Scenario artwork, never a verified election logo. */
  synthetic?: SyntheticIdentity;
  links?: PartyLink[];
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
  /** what the scenario explores, in the author's words (optional) */
  description?: string;
  identityColor?: string;
  coalition?: CoalitionChoices;
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
  /** sourced bloc schemes of the election (decision 0087); the active one, or null once edited */
  blocSchemes?: BlocScheme[];
  blocSchemeId?: string | null;
  customGroupingName?: string;
  familyDefinition?: Family;
  /** bloc of a constituent party, overriding its list's bloc for the seats its members hold */
  partyBlocs?: Record<string, string | null>;
  /** bloc of an individual candidate, overriding party and list */
  candidateBlocs?: Record<string, string | null>;
  /** joint lists whose Knesset faction has split into its constituent parties after the election: seats stay
   *  with the list in the allocation; each elected member counts for their own party (decision 0091) */
  factionSplits?: string[];
  /** Implicit faction counting at the start of the action log; persisted separately from edits. */
  factionSplitBaseline?: boolean;
  lotteryWinners: Record<string, string>;
  log: ChangeEntry[];
}

/** Where a Compare copy came from. A snapshot: replay never needs the source, and later source edits never change it. */
export interface CopyProvenance {
  electionId: ElectionId;
  sourceName: string;
  /** the source side was that election's official result */
  official: boolean;
  field: 'votes' | 'list' | 'candidates' | 'turnout' | 'registered' | 'invalid' | 'threshold' | 'rules' | 'agreements' | 'colour';
  mode?: 'count' | 'share' | 'change' | 'eligible' | 'ratio';
  /** how the destination was balanced (preferences.sourceValue form) */
  policy?: string;
  sourceListIds?: string[];
  targetListIds?: string[];
  /** the exact copied value, as shown in the marker (for example "23.41%") */
  value?: string;
  /** the destination inputs this copy set; each carries the "From …" marker until edited again */
  paths: string[][];
}

// Actions are plain data so they can be logged, replayed, shared and undone.
export type Action =
  /** One Compare copy: concrete inner actions applied as one step, with their origin. */
  | { type: 'copyFrom'; provenance: CopyProvenance; actions: Action[] }
  | { type: 'familyOperation'; definition: Family; operation: 'group'; name?: string; placements: Record<string, string> }
  | { type: 'familyOperation'; definition: Family; operation: 'scale'; allocations: {listId:string; before:number; votes:number}[]; source: SourceChoice; target:number; registeredDelta:number }
  | { type: 'setBlocAppearance'; blocs: BlocDef[] }
  | { type: 'setPartyColor'; listId: string; partyId: string; color: string }
  | { type: 'resetColors' }
  | { type: 'setIdentityColor'; color: string }
  | { type: 'setCoalition'; coalition: CoalitionChoices }
  | { type: 'startPart'; part: Part; source: 'official' | 'saved' | 'blank' | 'preset'; snapshot?: PartSnapshot; name?: string; presetId?: string; listId?: string }
  | { type: 'setVotes'; listId: string; votes: number }
  | { type: 'transfer'; from: string; to: string; votes: number }
  /** demographic:true allows signed deltas; resulting counts must remain nonnegative. */
  | { type: 'addVoters'; demographic?: boolean; allocations: { listId: string; votes: number }[]; invalid: number; label?: string }
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
  /** parties/roster flags: set together with a roster imported from another list (Compare) */
  | { type: 'candidates'; listId: string; candidates: SimCandidate[]; note: string; parties?: PartyDef[]; rosterUnavailable?: boolean; rosterTruncated?: boolean }
  | { type: 'setRules'; patch: Partial<SimRules> }
  | { type: 'setMode'; mode: Scenario['mode'] }
  | { type: 'setTotals'; registered?: number; invalid?: number }
  | { type: 'setBlocs'; blocs: BlocDef[]; name?: string; unassignAll?: boolean }
  | { type: 'applyBlocScheme'; schemeId: string }
  /** inherit: drop the party's own bloc so its seats follow its list again */
  | { type: 'setPartyBloc'; partyId: string; bloc: string | null; inherit?: boolean }
  /** a joint list's faction splits into its parties after the election (or rejoins); votes and seats do not change */
  | { type: 'setFactionSplit'; listId: string; split: boolean }
  | { type: 'setLottery'; key: string; winner: string | null }
  /** restores a list from the historical dataset (`base` is only a fallback for logs made before v2) */
  | { type: 'resetList'; listId: string; keepVotes?: boolean; base?: SimList | null }
  | { type: 'resetVotes'; listId: string }
  | { type: 'resetCandidates'; listId: string }
  | { type: 'rename'; name: string }
  | { type: 'setDescription'; description: string }
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

/** The bloc state a sourced scheme gives: bloc definitions, each list's bloc, and party/candidate overrides. */
export function blocSchemeState(scheme: BlocScheme, lists: { id: string }[]) {
  const listBloc = new Map<string, string>();
  const partyBlocs: Record<string, string | null> = {};
  const candidateBlocs: Record<string, string | null> = {};
  for (const b of scheme.blocs) {
    for (const l of b.lists) listBloc.set(l, b.id);
    for (const p of b.parties) partyBlocs[p] = b.id;
    for (const c of b.candidates) candidateBlocs[c] = b.id;
  }
  return {
    blocs: scheme.blocs.map(({ id, nameHe, nameEn, color, appDefined }) => ({ id, nameHe, nameEn, color, ...(appDefined || scheme.appDefined ? { appDefined: true } : {}) })),
    listBloc: Object.fromEntries(lists.map((l) => [l.id, listBloc.get(l.id) ?? null])) as Record<string, string | null>,
    partyBlocs, candidateBlocs,
  };
}

export function scenarioFromDataset(ds: ElectionDataset, name = '', splitByDefault = false): Scenario {
  const s = scenarioBase(ds, name);
  if (splitByDefault) {
    s.factionSplitBaseline = true;
    s.factionSplits = s.lists.filter(l => (l.parties?.length ?? 0) >= 2).map(l => l.id);
  }
  const scheme = ds.blocSchemes?.find((x) => x.id === ds.defaultBlocScheme);
  if (!scheme) return s;
  const st = blocSchemeState(scheme, s.lists);
  return { ...s, blocSchemes: ds.blocSchemes!.map((x) => structuredClone(x)), blocSchemeId: scheme.id, blocs: st.blocs,
    partyBlocs: st.partyBlocs, candidateBlocs: st.candidateBlocs, lists: s.lists.map((l) => ({ ...l, bloc: st.listBloc[l.id] })) };
}

function scenarioBase(ds: ElectionDataset, name: string): Scenario {
  return {
    schema: SCENARIO_SCHEMA, version: SCENARIO_VERSION, id: `${ds.id}-${Date.now().toString(36)}`, name, electionId: ds.id,
    baseBuiltAt: ds.buildInfo.builtAt, mode: 'historical', rules: historicalRules(ds.ruleSetId),
    registered: ds.totals.registered, invalid: ds.totals.invalid,
    lists: ds.lists.map((l) => ({
      id: l.id, originIds: [l.id], letters: l.letters, nameHe: l.nameHe, shortHe: l.shortHe, shortEn: l.shortEn,
      color: l.color, bloc: l.bloc, votes: l.votes, withdrawn: l.withdrawn, sponsorsHe: l.sponsorsHe,
      candidates: l.candidates.map((c) => ({ id: c.id, nameHe: c.nameHe, partyHe: c.partyHe, originListId: l.id, ...(c.notSeated ? { notSeated: true } : {}),
        ...(c.displayNameHe ? { displayNameHe: c.displayNameHe } : {}), ...(c.nameEn ? { nameEn: c.nameEn } : {}), ...(c.notes?.length ? { notes: c.notes } : {}),
        ...(c.partyId ? { partyId: c.partyId } : {}), ...(c.bio ? { bio: c.bio } : {}) })),
      ...(l.candidatesUnavailable ? { rosterUnavailable: true } : {}),
      ...(l.candidatesTruncated ? { rosterTruncated: true } : {}),
      ...(l.parties?.length ? { parties: structuredClone(l.parties) } : {}),
      ...(l.links ? { links: structuredClone(l.links) } : {}),
      ...(l.logo ? { logo: { ...l.logo } } : {}),
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
const signedWhole: Check = (x) => typeof x === 'number' && Number.isSafeInteger(x);
const whole: Check = (x) => typeof x === 'number' && Number.isSafeInteger(x) && x >= 0;
const finite: Check = (x) => typeof x === 'number' && Number.isFinite(x);
const optional = (check: Check): Check => (x) => x === undefined || check(x);
const nullable = (check: Check): Check => (x) => x === null || check(x);
const array = (check: Check): Check => (x) => Array.isArray(x) && x.every(check);
const shape = (fields: Record<string, Check>): Check => {
  const entries = Object.entries(fields);
  return (x) => record(x) && entries.every(([k, check]) => check(x[k]));
};
/** links that a shared or imported scenario may carry (never javascript: or data: URLs) */
const httpsUrl: Check = (x) => typeof x === 'string' && /^https:\/\/[^\s]+$/.test(x);
const oneOf = (...values: unknown[]): Check => (x) => values.includes(x);
const uniqueStrings: Check = (x) => array(string)(x) && new Set(x as string[]).size === (x as string[]).length;
const candidate = shape({ id: string, nameHe: string, partyHe: optional(string), originListId: optional(string),
  displayNameHe: optional(string), nameEn: optional(string), notes: optional(array(shape({ en: string, he: string }))), partyId: optional(string),
  bio: optional(shape({ knesset: optional(httpsUrl), hewiki: optional(shape({ title: string, url: httpsUrl })),
    party: optional(shape({ url: httpsUrl, publisher: optional(string), archivedAt: optional(string) })), probable: optional(boolean), memberConfirmed: optional(boolean) })),
  importedFrom: optional(shape({ electionId: string, listId: string })) });
const logo = shape({ rights: optional(oneOf('free-licence', 'fair-use-identification')), file: string, licence: string, attribution: string, sourceUrl: string, background: optional(string) });
const partyLinkUrl: Check = (x) => {
  if (!httpsUrl(x)) return false;
  try {
    const url = new URL(x as string);
    return url.protocol === 'https:' && !url.username && !url.password &&
      !/(^|\.)en\.(m\.)?wikipedia\.org$/i.test(url.hostname) &&
      !/en\.(m\.)?wikipedia\.org/i.test(decodeURIComponent(x as string));
  } catch { return false; }
};
const partyLinks = array(shape({ kind: oneOf('partisan', 'neutral'), url: partyLinkUrl,
  titleHe: optional(string), titleEn: optional(string), publisher: string,
  sourceType: oneOf('party-site', 'platform', 'ephemera', 'party-newspaper', 'repo-scan', 'knesset', 'hewiki', 'cec', 'academic'),
  archivedAt: optional((x) => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}(T.*Z)?$/.test(x) && Number.isFinite(Date.parse(x))),
  confidence: oneOf('high', 'medium') }));
const party = shape({ id: string, nameHe: string, nameEn: string, color: optional(string), customColor: optional(boolean), logo: optional(logo), links: optional(partyLinks) });
const candidates: Check = (x) => array(candidate)(x) && new Set((x as SimCandidate[]).map((c) => c.id)).size === (x as SimCandidate[]).length;
const bloc = shape({ id: string, nameHe: string, nameEn: string, appDefined: optional(boolean), color: string });
const agreement = shape({ id: string, members: uniqueStrings, enabled: boolean });
const listFields = shape({ id: string, originIds: uniqueStrings, letters: string, nameHe: string, shortHe: string,
  shortEn: nullable(string), color: string, bloc: nullable(string), votes: whole, withdrawn: boolean,
  synthetic: optional(shape({ kind: oneOf('merge', 'split', 'new'), parts: array(shape({ letters: string, color: string })), part: optional(whole), total: optional(whole) })),
  heldVotes: optional(whole), sponsorsHe: string, parties: optional(array(party)), logo: optional(logo), links: optional(partyLinks) });
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
const strings = array(string);
const blocScheme = shape({ appDefined: optional(boolean), id: string, kind: oneOf('government', 'parliamentary', 'pre-election'), nameHe: string, nameEn: string, date: optional(string),
  blocs: array(shape({ id: string, nameHe: string, nameEn: string, appDefined: optional(boolean), color: string, lists: strings, parties: strings, candidates: strings })) });
// every role is required, and a unit holds at most one role
const coalition: Check = (x) => shape({ in: uniqueStrings, support: uniqueStrings, abstain: uniqueStrings, out: uniqueStrings })(x)
  && new Set(COALITION_ROLES.flatMap((k) => (x as CoalitionChoices)[k])).size === COALITION_ROLES.reduce((n, k) => n + (x as CoalitionChoices)[k].length, 0);
const partSnapshotCheck = shape({ familyDefinition: optional(validFamily), validVotes: optional(whole), lists: optional(array(list)), registered: optional(whole), invalid: optional(whole), factionSplits: optional(uniqueStrings), blocs: optional(array(bloc)), blocSchemeId: optional(nullable(string)), customGroupingName: optional(string), partyBlocs: optional(stringMap(nullable(string))), candidateBlocs: optional(stringMap(nullable(string))), listBlocs: optional(stringMap(nullable(string))), agreements: optional(array(agreement)), rules: optional(rules), mode: optional(oneOf('historical', 'experimental')), coalition: optional(coalition) });
const copyProvenance = shape({ electionId: oneOf(...ELECTION_IDS), sourceName: string, official: boolean,
  field: oneOf('votes', 'list', 'candidates', 'turnout', 'registered', 'invalid', 'threshold', 'rules', 'agreements', 'colour'),
  mode: optional(oneOf('count', 'share', 'change', 'eligible', 'ratio')), policy: optional(string), sourceListIds: optional(strings), targetListIds: optional(strings),
  value: optional(string), paths: array(strings) });
const actionFields: Record<Action['type'], Check> = {
  familyOperation: (x) => record(x) && validFamily(x.definition) && (x.operation === 'group' ? optional(string)(x.name) && record(x.placements) && Object.values(x.placements).every(v => ['selected','mixed','other'].includes(String(v))) : x.operation === 'scale' && array(shape({listId:string,before:whole,votes:whole}))(x.allocations) && signedWhole(x.registeredDelta) && whole(x.target) && shape({kind:oneOf('new','proportional','transfer'),listId:optional(string)})(x.source)),
  setBlocAppearance: shape({ blocs: array(bloc) }),
  setPartyColor: shape({ listId: string, partyId: string, color: string }),
  resetColors: shape({}),
  setIdentityColor: shape({ color: isHexColour }),
  setCoalition: shape({ coalition }),
  startPart: shape({ part: oneOf('votes', 'identity', 'structure', 'agreements', 'blocs', 'coalitions', 'candidates', 'rules', 'totals'), source: oneOf('official', 'saved', 'blank', 'preset'), snapshot: optional(partSnapshotCheck), name: optional(string), presetId: optional(string), listId: optional(string) }),
  setVotes: shape({ listId: string, votes: whole }),
  transfer: shape({ from: string, to: string, votes: whole }),
  addVoters: (x) => record(x) && (x.demographic === true
    ? shape({ allocations: array(shape({ listId: string, votes: signedWhole })), invalid: signedWhole, label: string, demographic: boolean })(x)
    : shape({ allocations: array(shape({ listId: string, votes: whole })), invalid: whole, label: optional(string), demographic: optional(boolean) })(x)),
  redistribute: shape({ from: uniqueStrings, to: array(shape({ listId: string, share: finite })), votes: whole }),
  scaleAll: shape({ factorPct: finite }),
  merge: shape({ ids: uniqueStrings, newId: string, nameHe: string, letters: string, color: string, retentionPct: finite, candidateOrder: oneOf('concat', 'interleave'), nonRetained: oneOf('abstain', 'invalid') }),
  split: shape({ id: string, parts: array(shape({ newId: string, nameHe: string, letters: string, color: string, votes: whole, candidateIds: uniqueStrings })) }),
  addList: shape({ newId: string, nameHe: string, letters: string, color: string, votes: whole }),
  removeList: shape({ listId: string }), setWithdrawn: shape({ listId: string, withdrawn: boolean }),
  setListMeta: shape({ listId: string, patch: partial({ nameHe: string, shortHe: string, shortEn: nullable(string), letters: string, color: string, bloc: nullable(string) }) }),
  setAgreement: shape({ agreement }), removeAgreement: shape({ id: string }),
  candidates: shape({ listId: string, candidates, note: string, parties: optional(array(party)), rosterUnavailable: optional(boolean), rosterTruncated: optional(boolean) }),
  copyFrom: (x) => record(x) && copyProvenance(x.provenance) && Array.isArray(x.actions) && x.actions.length > 0
    && x.actions.every((a) => validAction(a) && (a as { type: string }).type !== 'copyFrom'),
  setRules: shape({ patch: partial(ruleFields) }), setMode: shape({ mode: oneOf('historical', 'experimental') }),
  setTotals: shape({ registered: optional(whole), invalid: optional(whole) }), setBlocs: shape({ blocs: array(bloc), name: optional(string), unassignAll: optional(boolean) }), applyBlocScheme: shape({ schemeId: string }),
  setPartyBloc: shape({ partyId: string, bloc: nullable(string), inherit: optional(boolean) }),
  setFactionSplit: shape({ listId: string, split: boolean }),
  setLottery: shape({ key: string, winner: nullable(string) }),
  resetList: shape({ listId: string, keepVotes: optional(boolean), base: optional(nullable(list)) }),
  resetVotes: shape({ listId: string }), resetCandidates: shape({ listId: string }), rename: shape({ name: string }), setDescription: shape({ description: string }),
  setTurnout: shape({ pct: finite }),
  restore: (x) => record(x) && (
    x.what === 'lottery' ||
    x.what === 'agreements' && optional(array(agreement))(x.agreements) ||
    x.what === 'totals' && optional(whole)(x.registered) && optional(whole)(x.invalid) ||
    x.what === 'blocs' && optional(array(bloc))(x.blocs) && optional(stringMap(nullable(string)))(x.listBlocs)),
};
export const validAction: Check = (x) => record(x) && typeof x.type === 'string' && Object.hasOwn(actionFields, x.type) && actionFields[x.type as Action['type']](x);

/** Full structural validation of an imported scenario; returns problems rather than throwing. */
export function validateScenario(x: unknown): string[] {
  if (!record(x)) return ['not an object'];
  const s = x;
  const e: string[] = [];
  if (s.schema !== SCENARIO_SCHEMA) e.push('not a scenario file exported by this application');
  if (s.version !== SCENARIO_VERSION) e.push('unsupported scenario version');
  if (![s.id, s.name, s.baseBuiltAt].every(string)) e.push('missing scenario identity or build timestamp');
  if (!optional(isHexColour)(s.identityColor)) e.push('invalid scenario colour');
  if (!optional(coalition)(s.coalition)) e.push('invalid coalition choices');
  if (!optional(validFamily)(s.familyDefinition)) e.push('invalid family definition');
  if (!optional(string)(s.customGroupingName)) e.push('invalid grouping name');
  if (!optional(string)(s.description)) e.push('invalid description');
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
  if (!optional(array(blocScheme))(s.blocSchemes) || !optional(nullable(string))(s.blocSchemeId)
    || !optional(stringMap(nullable(string)))(s.partyBlocs) || !optional(stringMap(nullable(string)))(s.candidateBlocs)) e.push('invalid bloc schemes');
  if (s.factionSplitBaseline !== undefined && typeof s.factionSplitBaseline !== 'boolean') e.push('invalid faction split baseline');
  if (!optional(uniqueStrings)(s.factionSplits)) e.push('invalid faction splits');
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
  if (!array(shape({ at: string, action: validAction }))(s.log)) e.push('invalid change log');
  return e;
}
