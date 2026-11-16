// Short share links: a scenario travels as its change log, and some steps carry whole lists (a "Restore votes" step
// carries every list with its candidates). In a link, any list or candidate that is the same as in the published
// election is written as a reference to it, and only its differences are written out; the link is expanded against the
// same election's data when it opens. Repeated edits of the same thing in a row keep only the last (votes typed in
// several steps arrive as one step).
import type { ElectionDataset } from '../data/schema.ts';
import { scenarioFromDataset, type Action, type SimCandidate, type SimList } from '../model/scenario.ts';

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };
type Obj = { [k: string]: Json };
const isObj = (x: unknown): x is Obj => !!x && typeof x === 'object' && !Array.isArray(x);
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const LIST = '$b', CAND = '$k', DROP = '$x';

interface Base { lists: Map<string, SimList>; people: Map<string, SimCandidate> }
const bases = new WeakMap<ElectionDataset, Base>();
function baseOf(ds: ElectionDataset): Base {
  let b = bases.get(ds);
  if (!b) {
    const s = scenarioFromDataset(ds);
    b = { lists: new Map(s.lists.map((l) => [l.id, l])), people: new Map(s.lists.flatMap((l) => l.candidates.map((c) => [c.id, c] as const))) };
    bases.set(ds, b);
  }
  return b;
}

/** An object written as its published original plus the fields that differ (and the names of fields it lacks). */
function patch(x: Obj, original: Obj, mark: string, inner: (k: string, v: Json, o: Json) => Json): Obj {
  const out: Obj = { [mark]: x.id };
  for (const [k, v] of Object.entries(x)) if (k !== 'id' && !same(v, original[k])) out[k] = inner(k, v, original[k] as Json);
  const gone = Object.keys(original).filter((k) => !(k in x));
  if (gone.length) out[DROP] = gone;
  return out;
}
function unpatch(x: Obj, original: Obj, mark: string, inner: (k: string, v: Json, o: Json) => Json): Obj {
  const out: Obj = { ...(JSON.parse(JSON.stringify(original)) as Obj) };
  for (const [k, v] of Object.entries(x)) if (k !== mark && k !== DROP) out[k] = inner(k, v, original[k] as Json);
  for (const k of (x[DROP] as string[] | undefined) ?? []) delete out[k];
  // key order as in the original, so a restored list is the same object it was
  return out;
}

function compactCandidates(v: Json, b: Base): Json {
  if (!Array.isArray(v)) return v;
  return v.map((c) => {
    if (!isObj(c) || typeof c.id !== 'string') return c;
    const o = b.people.get(c.id) as unknown as Obj | undefined;
    return o ? patch(c, o, CAND, (_k, x) => x) : c;
  });
}
function expandCandidates(v: Json, b: Base): Json {
  if (!Array.isArray(v)) return v;
  return v.map((c) => {
    if (!isObj(c) || typeof c[CAND] !== 'string') return c;
    const o = b.people.get(c[CAND] as string) as unknown as Obj | undefined;
    if (!o) throw new Error(`unknown candidate ${c[CAND]}`);
    const out = unpatch(c, o, CAND, (_k, x) => x);
    return { id: c[CAND], ...Object.fromEntries(Object.entries(out).filter(([k]) => k !== 'id')) };
  });
}

/** Lists and candidates anywhere in a step, written against the published election. */
function walk(x: Json, b: Base, dir: 'out' | 'in'): Json {
  if (Array.isArray(x)) return x.map((v) => walk(v, b, dir));
  if (!isObj(x)) return x;
  if (dir === 'out' && typeof x.id === 'string' && Array.isArray(x.originIds) && Array.isArray(x.candidates) && b.lists.has(x.id))
    return patch(x, b.lists.get(x.id) as unknown as Obj, LIST, (k, v) => (k === 'candidates' ? compactCandidates(v, b) : walk(v, b, dir)));
  if (dir === 'in' && typeof x[LIST] === 'string') {
    const o = b.lists.get(x[LIST] as string) as unknown as Obj | undefined;
    if (!o) throw new Error(`unknown list ${x[LIST]}`);
    const out = unpatch(x, o, LIST, (k, v) => (k === 'candidates' ? expandCandidates(v, b) : walk(v, b, dir)));
    return { id: x[LIST], ...Object.fromEntries(Object.entries(out).filter(([k]) => k !== 'id')) };
  }
  const out: Obj = {};
  for (const [k, v] of Object.entries(x)) out[k] = k === 'candidates' && Array.isArray(v) ? (dir === 'out' ? compactCandidates(v, b) : expandCandidates(v, b)) : walk(v, b, dir);
  return out;
}

/** The thing a step sets outright (a later step setting the same thing replaces it), or null. */
const target = (a: Action): string | null =>
  a.type === 'setVotes' ? `votes:${a.listId}` : a.type === 'rename' ? 'name' : a.type === 'setDescription' ? 'description'
    : a.type === 'setTurnout' ? 'turnout' : a.type === 'setLottery' ? `lottery:${a.key}` : a.type === 'setIdentityColor' ? 'identity' : null;

/** Repeated edits of the same thing in a row keep only the last. */
export function coalesce(log: Action[]): Action[] {
  return log.filter((a, i) => { const t = target(a); return !t || i === log.length - 1 || target(log[i + 1]) !== t; });
}

export function compactLog(log: Action[], ds: ElectionDataset): Json[] {
  const b = baseOf(ds);
  return coalesce(log).map((a) => walk(a as unknown as Json, b, 'out'));
}
/** Throws if the link names a list or candidate this election's data does not have. */
export function expandLog(log: Json[], ds: ElectionDataset): Action[] {
  const b = baseOf(ds);
  return log.map((a) => walk(a, b, 'in') as unknown as Action);
}
