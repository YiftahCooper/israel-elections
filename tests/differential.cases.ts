// Deterministic differential corpus for src/engine and src/model. The same seeded cases are run
// by tests/differential.test.ts against the current code and, during refactors, by a scratch
// harness against a frozen copy of the previous engine. Every output is serialised in full
// (seats, quotas, agreements, every remainder step and quotient, internal divisions, warnings,
// analysis answers, scenario states and validation messages) and folded into a SHA-256 digest.
//
// The modules are passed in, so this file imports nothing from src/ and cannot drift with it.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;

export interface Modules {
  allocate: (input: Any) => Any;
  minimalChange: (...a: Any[]) => Any;
  sweepVotes: (...a: Any[]) => Any;
  sweepThreshold: (...a: Any[]) => Any;
  goals: Record<string, (...a: Any[]) => Any>;
  applyAction: (s: Any, a: Any, now?: string, ctx?: Any) => Any;
  scenarioFromDataset: (ds: Any) => Any;
  toEngineInput: (s: Any) => Any;
  validateScenario: (x: unknown) => string[];
  historicalRules: (id: string) => Any;
  electionRuleSetId: (id: Any) => string;
  toRuleSet: (r: Any, id: string | null) => Any;
  ruleDepartures: (a: Any, b: Any) => string[];
  RULESETS: Record<string, Any>;
}

/** Serialises in insertion order (record key order is observable to callers); bigint as `123n`. */
export const ser = (x: unknown) => JSON.stringify(x, (_k, v) => (typeof v === 'bigint' ? `${v}n` : v));

export function rng(seed: number) {
  let s = seed >>> 0;
  const next = () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const int = (n: number) => Math.floor(next() * n);
  return { next, int, pick: <T>(xs: readonly T[]): T => xs[int(xs.length)], chance: (p: number) => next() < p };
}
type Rng = ReturnType<typeof rng>;

const DATA = join(import.meta.dirname, '..', 'public', 'data');
export const datasetIds = () => readdirSync(DATA).filter((f) => /^k\d+\.json$/.test(f)).map((f) => f.slice(0, -5)).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
export const loadDs = (id: string) => JSON.parse(readFileSync(join(DATA, `${id}.json`), 'utf8'));
const scenario = (m: Modules, ds: Any) => ({ ...m.scenarioFromDataset(ds), id: `${ds.id}-fixed` });

/** Random rule set: a statutory preset, or any combination of the optional semantics. */
export function randomRules(r: Rng, m: Modules): Any {
  const presets = Object.values(m.RULESETS);
  if (r.chance(0.4)) return r.pick(presets);
  const base = r.pick(presets);
  const thr = r.pick([{ num: 0n, den: 1n }, { num: 1n, den: 100n }, { num: 13n, den: 400n }, { num: BigInt(r.int(100)), den: 1000n }, { num: 1n, den: 3n }, { num: 1n, den: 1n }]);
  const seats = r.pick([120, 120, 1, 2, 3, 7, 13, 61, 150, 1 + r.int(200)]);
  const rules: Any = {
    ...base, id: 'experimental', historical: false, seats, threshold: thr,
    quotaRounding: r.pick(['floor', 'exact']), remainderMethod: r.pick(['bader-ofer', 'bader-ofer', 'largest-remainder', 'sainte-lague']),
    majorityCap: r.chance(0.5), maxAgreementSize: r.pick([2, 2, 3, 4]), agreementRequiresAllQualify: r.chance(0.7),
  };
  for (const [k, vals] of [['quotaSeatOffset', [0, 1]], ['remainderRequiresInitialSeat', [false, true]], ['agreementRequiresInitialSeat', [false, true]],
    ['quotientRounding', ['exact', 'floor']], ['largestRemainderRepeat', [false, true]], ['tiePolicy', ['lottery', 'unspecified']], ['seatsCappedAtCandidates', [false, true]]] as const) {
    if (r.chance(0.4)) delete rules[k]; else rules[k] = r.pick(vals as readonly unknown[]);
  }
  return rules;
}

/** Random election: ties, tiny and huge counts, withdrawals, capacities, odd agreements. */
export function randomInput(r: Rng, m: Modules): Any {
  const rules = randomRules(r, m);
  const n = 1 + r.int(r.chance(0.2) ? 6 : 36);
  const pool = Array.from({ length: 4 }, () => BigInt(1 + r.int(400_000)));
  const huge = r.chance(0.05);
  const lists = Array.from({ length: n }, (_, i) => {
    const kind = r.int(10);
    const votes = huge ? BigInt(r.int(2 ** 31)) * BigInt(r.int(2 ** 22) + 1) : kind < 4 ? BigInt(r.int(1_500_000)) : kind < 6 ? r.pick(pool) : kind < 8 ? BigInt(r.int(30)) : kind < 9 ? 0n : BigInt(r.int(60_000));
    const l: Any = { id: r.chance(0.1) ? `x${i}` : `L${i}`, votes };
    if (r.chance(0.08)) l.withdrawn = true;
    if (r.chance(0.5)) l.candidateCount = r.chance(0.3) ? r.int(4) : r.int(130);
    return l;
  });
  const ids = lists.map((l) => l.id);
  const agreements: Any[] = [];
  for (let i = 0; i + 1 < n; i += 2) if (r.chance(0.5)) agreements.push({ id: `P${i}`, members: [ids[i], ids[i + 1]] });
  if (r.chance(0.2) && n >= 3) agreements.push({ id: r.chance(0.5) ? ids[2] : `T${n}`, members: [ids[0], ids[1], ids[2]] });
  if (r.chance(0.1)) agreements.push({ id: 'U', members: [ids[0], 'nope'] });
  if (r.chance(0.1)) agreements.push({ id: 'S', members: [ids[n - 1]] });
  if (r.chance(0.1)) agreements.push({ id: ids[0], members: [ids[n - 1], ids[0]] });
  if (r.chance(0.1) && n >= 2) agreements.push({ id: 'D', members: [ids[1], ids[1], ids[0]] });
  return { rules, lists, agreements };
}

/** Every tied decision, decided the other way (and a stale key that must be ignored). */
export function forcedLotteries(res: Any, input: Any, which: 'last' | 'middle'): Any | null {
  const steps = [...res.remainderSteps, ...res.internalDivisions.flatMap((d: Any) => d.steps)].filter((s: Any) => s.tie);
  if (steps.length === 0) return null;
  const lotteryWinners = Object.fromEntries(steps.map((s: Any) => [s.tie.key, which === 'last' ? s.tie.tiedUnitIds.at(-1) : s.tie.tiedUnitIds[Math.floor(s.tie.tiedUnitIds.length / 2)]]));
  return { ...input, lotteryWinners: { ...lotteryWinners, 'national:999:a|b': 'a' } };
}

export function* allocationCases(m: Modules, randomCount: number): Generator<[string, Any]> {
  const r = rng(0x5eed1234);
  for (const id of datasetIds()) {
    const ds = loadDs(id);
    const input = m.toEngineInput(scenario(m, ds));
    yield [`${id}:historical`, input];
    for (const preset of Object.values(m.RULESETS)) yield [`${id}:${preset.id}`, { ...input, rules: preset }];
    for (let j = 0; j < 12; j++) yield [`${id}:rules${j}`, { ...input, rules: randomRules(r, m) }];
    for (let j = 0; j < 12; j++) {
      const lists = input.lists.map((l: Any) => ({ ...l, votes: r.chance(0.3) ? l.votes + BigInt(r.int(40_000)) - (l.votes < 20_000n ? 0n : 20_000n) : l.votes }));
      yield [`${id}:votes${j}`, { ...input, lists }];
    }
  }
  for (let i = 0; i < randomCount; i++) yield [`random${i}`, randomInput(r, m)];
}

/** Small elections keep the analysis corpus fast under the previous (unoptimised) engine too. */
function smallElection(r: Rng, m: Modules): Any {
  const rules = r.chance(0.5) ? r.pick(Object.values(m.RULESETS)) : randomRules(r, m);
  const n = 2 + r.int(7);
  const lists = Array.from({ length: n }, (_, i) => ({ id: `L${i}`, votes: BigInt(r.int(r.chance(0.3) ? 600 : 6000)), ...(r.chance(0.3) ? { candidateCount: r.int(40) } : {}), ...(r.chance(0.05) ? { withdrawn: true } : {}) }));
  const agreements: Any[] = [];
  for (let i = 0; i + 1 < n; i += 2) if (r.chance(0.5)) agreements.push({ id: `P${i}`, members: [`L${i}`, `L${i + 1}`] });
  return { rules: { ...rules, seats: r.pick([rules.seats, 7, 13, 25]) }, lists, agreements };
}

export function* analysisCases(m: Modules, count: number): Generator<[string, () => Any]> {
  const r = rng(0xa11a);
  const goalNames = ['seatGain', 'seatLoss', 'qualify', 'disqualify', 'seatsAtLeast', 'groupSeatsAtLeast', 'groupSeatsBelow'];
  for (let i = 0; i < count; i++) {
    const input = smallElection(r, m);
    const ids = input.lists.map((l: Any) => l.id);
    const target = r.pick(ids);
    const other = r.pick(ids.filter((x: string) => x !== target));
    const source = r.pick([{ kind: 'new' }, { kind: 'transfer', listId: other }, { kind: 'proportional', listIds: [] }, { kind: 'proportional', listIds: [other] }]);
    const g = r.pick(goalNames);
    const group = ids.filter(() => r.chance(0.5));
    const n = 1 + r.int(input.rules.seats);
    const goal = g === 'seatsAtLeast' ? m.goals.seatsAtLeast(target, n) : g.startsWith('group') ? m.goals[g](group, n) : m.goals[g](target);
    const dir = r.chance(0.3) ? 'lose' : 'gain';
    const limit = r.pick([undefined, 0, 1, 5, 37, 400]);
    yield [`minimalChange${i}:${g}:${source.kind}:${dir}:${limit}`, () => m.minimalChange(input, target, source, goal, dir, limit)];
    if (i % 3 === 0) {
      const from = BigInt(r.int(3000)); const to = from + BigInt(r.int(r.chance(0.5) ? 300 : 20_000));
      yield [`sweepVotes${i}`, () => m.sweepVotes(input, target, from, to, r.pick([undefined, 7, 50, 250]))];
      yield [`sweepThreshold${i}`, () => m.sweepThreshold(input, { num: BigInt(r.int(20)), den: 100n }, { num: BigInt(20 + r.int(60)), den: 100n })];
    }
  }
  // Real elections, every goal the interface uses (the costly scans are bounded by small limits).
  for (const id of ['k1', 'k6', 'k9', 'k25', 'k26']) {
    const input = m.toEngineInput(scenario(m, loadDs(id)));
    const before = m.allocate(input);
    for (const l of before.lists.filter((x: Any) => !x.withdrawn).slice(0, 14)) {
      const src = r.pick([{ kind: 'new' }, { kind: 'proportional', listIds: [] }, { kind: 'transfer', listId: before.lists[0].id }]);
      const lim = r.pick([0, 50, 300]);
      if (!l.qualified) yield [`${id}:${l.id}:qualify`, () => m.minimalChange(input, l.id, src, m.goals.qualify(l.id), 'gain', lim)];
      else yield [`${id}:${l.id}:gain`, () => m.minimalChange(input, l.id, src, m.goals.seatGain(l.id), 'gain', lim)];
      yield [`${id}:${l.id}:lose`, () => m.minimalChange(input, l.id, src, l.seats > 0 ? m.goals.seatLoss(l.id) : m.goals.disqualify(l.id), 'lose', lim)];
    }
    yield [`${id}:sweepThreshold`, () => m.sweepThreshold(input, { num: 0n, den: 1n }, { num: 6n, den: 100n })];
    const t = before.lists.find((x: Any) => !x.withdrawn && x.votes > 1000n);
    yield [`${id}:sweepVotes`, () => m.sweepVotes(input, t.id, 0n, t.votes * 2n, 300)];
  }
}

/** A random action against a scenario: plausible, malformed or referring to unknown lists. */
function randomAction(r: Rng, s: Any): Any {
  const ids = s.lists.map((l: Any) => l.id);
  const id = () => (r.chance(0.05) ? 'nope' : r.pick(ids));
  const v = () => r.pick([0, 1, 1000, r.int(500_000), -1, 1.5]);
  const fresh = () => `sim-${r.int(1_000_000)}`;
  switch (r.int(27)) {
    case 0: return { type: 'setVotes', listId: id(), votes: v() };
    case 1: return { type: 'transfer', from: id(), to: id(), votes: v() };
    case 2: return { type: 'addVoters', allocations: [{ listId: id(), votes: v() }, { listId: id(), votes: v() }], invalid: r.pick([0, 5, -1]) };
    case 3: return { type: 'redistribute', from: [id()], to: [{ listId: id(), share: r.pick([1, 0, 2.5]) }, { listId: id(), share: 1 }], votes: v() };
    case 4: return { type: 'scaleAll', factorPct: r.pick([0, 50, 100, 133.3, -1]) };
    case 5: { const a = id(); const b = id(); return { type: 'merge', ids: r.chance(0.9) ? [a, b] : [a], newId: r.chance(0.9) ? fresh() : a, nameHe: 'מ', letters: 'מ', color: '#000', retentionPct: r.pick([100, 90, 33.33, 101]), candidateOrder: r.pick(['concat', 'interleave']), nonRetained: r.pick(['abstain', 'invalid']) }; }
    case 6: {
      const l = r.pick(s.lists) as Any; const cut = r.int(l.votes + 1); const cids = l.candidates.map((c: Any) => c.id);
      const k = r.int(cids.length + 1);
      return { type: 'split', id: l.id, parts: [{ newId: fresh(), nameHe: 'a', letters: 'a', color: '#000', votes: cut, candidateIds: cids.slice(0, k) }, { newId: fresh(), nameHe: 'b', letters: 'b', color: '#000', votes: l.votes - cut + (r.chance(0.1) ? 1 : 0), candidateIds: cids.slice(k) }] };
    }
    case 7: return { type: 'addList', newId: r.chance(0.9) ? fresh() : ids[0], nameHe: 'n', letters: 'n', color: '#000', votes: v() };
    case 8: return { type: 'removeList', listId: id() };
    case 9: case 10: return { type: 'setWithdrawn', listId: id(), withdrawn: r.chance(0.6) };
    case 11: return { type: 'setListMeta', listId: id(), patch: { color: '#123456', bloc: r.pick([null, ...s.blocs.map((b: Any) => b.id)]) } };
    case 12: return { type: 'setAgreement', agreement: { id: r.chance(0.5) ? fresh() : (s.agreements[0]?.id ?? 'a'), members: r.chance(0.8) ? [id(), id()] : [id(), id(), id()], enabled: r.chance(0.8) } };
    case 13: return { type: 'removeAgreement', id: r.pick([...s.agreements.map((a: Any) => a.id), 'none']) };
    case 14: { const l = r.pick(s.lists) as Any; return { type: 'candidates', listId: l.id, candidates: l.candidates.slice(r.int(3)).concat(r.chance(0.1) ? [{ id: 'new-1', nameHe: ' ' }] : []), note: '' }; }
    case 15: return { type: 'setRules', patch: r.pick([{ thresholdPct: r.pick(['2', '0', '7.5', 'x', '101']) }, { seats: r.pick([1, 61, 120, 0, 1001]) }, { remainderMethod: r.pick(['largest-remainder', 'sainte-lague', 'bader-ofer']) }, { maxAgreementSize: r.pick([1, 2, 3]) }, { quotaRounding: 'exact', majorityCap: false }, { seatsCappedAtCandidates: true }]) };
    case 16: case 17: return { type: 'setMode', mode: r.pick(['historical', 'experimental', 'experimental']) };
    case 18: return { type: 'setTotals', registered: r.pick([undefined, 7_000_000, -1]), invalid: r.pick([undefined, 0, 30_000]) };
    case 19: return { type: 'setBlocs', blocs: s.blocs.slice(r.int(2)) };
    case 20: return { type: 'setLottery', key: r.pick(['national:1:a|b', 'x']), winner: r.pick(['a', null]) };
    case 21: return { type: 'resetList', listId: id(), keepVotes: r.chance(0.5) };
    case 22: return { type: 'resetVotes', listId: id() };
    case 23: return { type: 'resetCandidates', listId: id() };
    case 24: return { type: 'setTurnout', pct: r.pick([50, 70.5, 100, 0, 101]) };
    case 25: return { type: 'restore', what: r.pick(['agreements', 'totals', 'blocs', 'lottery']) };
    default: return { type: 'rename', name: `n${r.int(9)}` };
  }
}

/** Random action sequences: each state (or the ActionError) and the engine input it produces. */
export function* modelCases(m: Modules, sequences: number, length: number): Generator<[string, () => Any]> {
  const r = rng(0x30de1);
  const ids = datasetIds();
  for (let q = 0; q < sequences; q++) {
    const ds = loadDs(ids[q % ids.length]);
    const base = scenario(m, ds);
    const ctx = r.chance(0.8) ? { base } : {};
    let s = base;
    for (let i = 0; i < length; i++) {
      const a = randomAction(r, s);
      let out: Any;
      try { s = m.applyAction(s, a, `T${i}`, ctx); out = { ok: s }; } catch (e) { out = { error: (e as Any).code ?? 'throw', message: (e as Error).message }; }
      const cur = s;
      yield [`seq${q}:${i}:${a.type}`, () => ({ out, input: m.toEngineInput(cur), alloc: m.allocate(m.toEngineInput(cur)).lists.map((l: Any) => l.seats), valid: m.validateScenario(JSON.parse(JSON.stringify(cur))) })];
    }
  }
}

/** Import validation of damaged scenario files. */
export function* validationCases(m: Modules, count: number): Generator<[string, () => Any]> {
  const r = rng(0x7a11d);
  const bases = ['k1', 'k9', 'k25', 'k26'].map((id) => scenario(m, loadDs(id)));
  const damage: ((x: Any) => void)[] = [
    (x) => { x.schema = 'other'; }, (x) => { x.version = 2; }, (x) => { delete x.name; }, (x) => { x.electionId = 'k27'; },
    (x) => { x.mode = 'odd'; }, (x) => { x.mode = 'experimental'; }, (x) => { x.rules.thresholdPct = r.pick(['abc', '101', '3.250', '0']); },
    (x) => { x.rules.seats = r.pick([0, 1001, 1.5, '120']); }, (x) => { x.rules.quotaSeatOffset = r.pick([1, 2, -1, undefined]); },
    (x) => { x.rules.tiePolicy = r.pick(['unspecified', 'lottery', 'votes', undefined]); }, (x) => { x.rules.seatsCappedAtCandidates = r.pick([true, false, 'yes']); },
    (x) => { x.rules.largestRemainderRepeat = r.pick([true, false, undefined]); }, (x) => { x.rules.quotientRounding = r.pick(['exact', 'floor', undefined]); },
    (x) => { x.rules.remainderRequiresInitialSeat = r.pick([true, false, undefined]); }, (x) => { x.rules.maxAgreementSize = r.pick([1, 2, 3]); },
    (x) => { x.registered = -1; }, (x) => { x.invalid = 2 ** 60; }, (x) => { x.blocs.push({ ...x.blocs[0] }); }, (x) => { x.blocs = null; },
    (x) => { x.lists[0].id = x.lists[1].id; }, (x) => { x.lists[0].votes = r.pick([-1, 1.5, '5', Number.MAX_SAFE_INTEGER]); }, (x) => { delete x.lists[0].candidates; },
    (x) => { x.lists[0].bloc = 'nope'; }, (x) => { x.lists[0].originIds = ['a', 'a']; }, (x) => { x.lists[0].heldVotes = -3; }, (x) => { x.lists[0].shortEn = 5; },
    (x) => { x.lists[0].candidates.push({ ...x.lists[0].candidates[0] }); }, (x) => { x.lists = []; }, (x) => { x.lists.push(7); },
    (x) => { x.agreements.push({ id: x.lists[0].id, members: [x.lists[0].id, x.lists[1].id], enabled: true }); },
    (x) => { x.agreements.push({ id: 'z', members: [x.lists[0].id, x.lists[1].id, x.lists[2].id], enabled: r.chance(0.5) }); },
    (x) => { x.agreements.push({ id: 'z', members: [x.lists[0].id, 'nope'], enabled: true }); }, (x) => { x.agreements.push({ id: 'z', members: [x.lists[0].id], enabled: false }); },
    (x) => { x.agreements = [...x.agreements, ...x.agreements]; }, (x) => { x.lotteryWinners = { a: 1 }; }, (x) => { x.lotteryWinners = []; },
    (x) => { x.log = [{ at: 'T', action: { type: 'setVotes', listId: 'a', votes: 1 } }, { at: 'T', action: r.pick([{ type: 'bogus' }, { type: 'setVotes', listId: 'a', votes: -1 }, { type: 'restore', what: 'blocs', listBlocs: { a: null } }, { type: 'setRules', patch: { seats: 5, nope: 1 } }]) }]; },
    (x) => { x.rules = null; },
  ];
  for (let i = 0; i < count; i++) {
    const x = JSON.parse(JSON.stringify(r.pick(bases)));
    for (let j = 1 + r.int(3); j > 0; j--) { const d = r.pick(damage); try { d(x); } catch { /* an earlier damage removed the field */ } }
    yield [`validate${i}`, () => m.validateScenario(x)];
  }
  yield ['validate:not-object', () => [m.validateScenario(null), m.validateScenario([]), m.validateScenario('x')]];
}

/** Rule plumbing: presets, conversions and departures for every pair. */
export function* ruleCases(m: Modules): Generator<[string, () => Any]> {
  const r = rng(0x9a1e5);
  const eids = Array.from({ length: 26 }, (_, i) => `k${i + 1}`);
  yield ['electionRuleSetId', () => eids.map((id) => m.electionRuleSetId(id))];
  for (const id of Object.keys(m.RULESETS)) {
    yield [`historicalRules:${id}`, () => m.historicalRules(id)];
    yield [`toRuleSet:${id}`, () => [m.toRuleSet(m.historicalRules(id), id), m.toRuleSet(m.historicalRules(id), null)]];
    for (const other of Object.values(m.RULESETS)) yield [`departures:${id}:${other.id}`, () => m.ruleDepartures(m.RULESETS[id], other)];
  }
  for (let i = 0; i < 300; i++) { const a = randomRules(r, m); const b = r.pick(Object.values(m.RULESETS)); yield [`departures:random${i}`, () => m.ruleDepartures(a, b)]; }
}

/** Runs one family of cases; returns the digest and the per-case serialisations (for diagnostics). */
export function digest(cases: Iterable<[string, Any]>, run: (x: Any) => Any, keep = false) {
  const h = createHash('sha256');
  const out: [string, string][] = [];
  let n = 0;
  for (const [name, c] of cases) {
    let s: string;
    try { s = ser(run(c)); } catch (e) { s = `throw:${(e as Error).message}`; }
    h.update(name).update('\0').update(s).update('\n');
    if (keep) out.push([name, s]);
    n++;
  }
  return { digest: h.digest('hex'), count: n, out };
}

export const SIZES = { random: 6000, analysis: 400, sequences: 26, validation: 600 };
export const FAMILIES = ['allocation', 'analysis', 'model', 'validation', 'rules'] as const;
export type Family = (typeof FAMILIES)[number];

/** The five corpus families; `keep` retains per-case output for diagnosing a changed digest. */
export const families = (m: Modules, z = SIZES, keep = false): Record<Family, () => ReturnType<typeof digest>> => ({
  allocation: () => digest(allocationCases(m, z.random), (x) => {
    const res = m.allocate(x);
    const last = forcedLotteries(res, x, 'last'); const mid = forcedLotteries(res, x, 'middle');
    return [res, last && m.allocate(last), mid && m.allocate(mid)];
  }, keep),
  analysis: () => digest(analysisCases(m, z.analysis), (f) => f(), keep),
  model: () => digest(modelCases(m, z.sequences, 20), (f) => f(), keep),
  validation: () => digest(validationCases(m, z.validation), (f) => f(), keep),
  rules: () => digest(ruleCases(m), (f) => f(), keep),
});
