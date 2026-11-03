// Pure scenario transitions. Each returns a new Scenario and never mutates its input.
// Vote counts stay non-negative integers; every integer split uses exact largest-remainder rounding.
import { electionRuleSetId, historicalRules, type Action, type ActionContext, type Scenario, type SimCandidate, type SimList } from './scenario.ts';

export class ActionError extends Error {
  readonly code: string;
  constructor(code: string, message: string) { super(message); this.code = code; }
}

const isWhole = (n: number) => Number.isSafeInteger(n) && n >= 0;
const need = (cond: unknown, code: string, msg: string) => { if (!cond) throw new ActionError(code, msg); };

const safeCount = (n: bigint): number => {
  need(n >= 0n && n <= BigInt(Number.MAX_SAFE_INTEGER), 'votes', 'Vote counts and totals must be safe integers ≥ 0.');
  return Number(n);
};
const sumVotes = (values: number[]) => safeCount(values.reduce((sum, n) => {
  need(isWhole(n), 'votes', 'Vote counts must be safe integers ≥ 0.');
  return sum + BigInt(n);
}, 0n));
const addVotes = (a: number, b: number) => sumVotes([a, b]);

/** Splits `total` into integers proportional to `weights` (largest remainder; ties by order). */
export function apportion(total: number, weights: number[]): number[] {
  need(isWhole(total), 'votes', 'Vote counts must be safe integers ≥ 0.');
  need(weights.every((w) => Number.isFinite(w) && w >= 0), 'votes', 'Weights must be finite numbers ≥ 0.');
  const T = BigInt(total);
  const W = weights.map((w) => BigInt(Math.max(0, Math.round(w * 1e6))));
  const sum = W.reduce((a, b) => a + b, 0n);
  if (sum === 0n) return weights.map((_, i) => (i === 0 ? total : 0));
  const base = W.map((w) => (T * w) / sum);
  const rem = W.map((w, i) => ({ i, r: T * w - base[i] * sum }));
  let left = Number(T - base.reduce((a, b) => a + b, 0n));
  rem.sort((a, b) => (b.r > a.r ? 1 : b.r < a.r ? -1 : a.i - b.i));
  const out = base.map(Number);
  for (const { i } of rem) { if (left <= 0) break; out[i]++; left--; }
  return out;
}

const listById = (s: Scenario, id: string) => {
  const l = s.lists.find((x) => x.id === id);
  if (!l) throw new ActionError('unknown-list', `Unknown list ${id}`);
  return l;
};

/** Votes of a withdrawn list are held as invalid ballots; editing them would double-count on reinstatement. */
const notWithdrawn = (s: Scenario, ...ids: string[]) => {
  for (const id of ids) {
    const l = s.lists.find((x) => x.id === id);
    need(!l?.withdrawn, 'withdrawn', `${l?.shortHe ?? id} has withdrawn: reinstate it before changing its votes.`);
  }
};

const replaceList = (s: Scenario, id: string, f: (l: SimList) => SimList): Scenario => ({ ...s, lists: s.lists.map((l) => (l.id === id ? f(l) : l)) });

/** A roster built from these lists' candidates is incomplete if any of theirs was (merge, split). */
const rosterFlags = (sources: SimList[]): Pick<SimList, 'rosterUnavailable' | 'rosterTruncated'> => ({
  ...(sources.some((p) => p.rosterUnavailable) ? { rosterUnavailable: true } : {}),
  ...(sources.some((p) => p.rosterTruncated) ? { rosterTruncated: true } : {}),
});

function checkAgreements(s: Scenario) {
  if (s.mode !== 'historical') return;
  const seen = new Set<string>();
  for (const a of s.agreements.filter((x) => x.enabled)) {
    need(a.members.length === 2, 'agreement-size', 'Under section 67(a) an agreement joins exactly two lists. Switch to experimental rules to model other arrangements.');
    for (const m of a.members) {
      need(!seen.has(m), 'agreement-duplicate', 'Under section 67(a) a list may sign an agreement with one other list only.');
      seen.add(m);
    }
  }
}

/** Removes agreements that reference lists which no longer exist. */
const pruneAgreements = (s: Scenario): Scenario => ({ ...s, agreements: s.agreements.filter((a) => a.members.every((m) => s.lists.some((l) => l.id === m))) });

function interleave<T>(arrays: T[][]): T[] {
  const out: T[] = [];
  const n = Math.max(0, ...arrays.map((a) => a.length));
  for (let i = 0; i < n; i++) for (const a of arrays) if (i < a.length) out.push(a[i]);
  return out;
}

export function applyAction(s0: Scenario, action: Action, now = new Date().toISOString(), ctx: ActionContext = {}): Scenario {
  let s: Scenario = s0;
  const baseList = (id: string) => ctx.base?.lists.find((l) => l.id === id) ?? null;
  switch (action.type) {
    case 'setVotes':
      need(isWhole(action.votes), 'votes', 'Votes must be a whole number ≥ 0.');
      notWithdrawn(s, action.listId);
      s = replaceList(s, action.listId, (l) => ({ ...l, votes: action.votes }));
      listById(s, action.listId);
      break;
    case 'transfer': {
      need(isWhole(action.votes), 'votes', 'Votes must be a whole number ≥ 0.');
      need(action.from !== action.to, 'transfer-self', 'Choose two different lists.');
      const from = listById(s, action.from); listById(s, action.to);
      notWithdrawn(s, action.from, action.to);
      need(from.votes >= action.votes, 'transfer-exceeds', `${from.shortHe} has only ${from.votes.toLocaleString()} votes.`);
      s = replaceList(s, action.from, (l) => ({ ...l, votes: l.votes - action.votes }));
      s = replaceList(s, action.to, (l) => ({ ...l, votes: addVotes(l.votes, action.votes) }));
      break;
    }
    case 'addVoters':
      need(isWhole(action.invalid), 'votes', 'Invalid ballots must be a whole number ≥ 0.');
      for (const a of action.allocations) { need(isWhole(a.votes), 'votes', 'Votes must be whole numbers ≥ 0.'); listById(s, a.listId); }
      notWithdrawn(s, ...action.allocations.filter((a) => a.votes > 0).map((a) => a.listId));
      for (const a of action.allocations) s = replaceList(s, a.listId, (l) => ({ ...l, votes: addVotes(l.votes, a.votes) }));
      s = { ...s, invalid: addVotes(s.invalid, action.invalid) };
      break;
    case 'redistribute': {
      need(isWhole(action.votes), 'votes', 'Votes must be a whole number ≥ 0.');
      need(new Set(action.from).size === action.from.length, 'redistribute', 'A list appears twice among the sources.');
      need(action.to.length > 0 && action.to.reduce((t, x) => t + Math.max(0, x.share), 0) > 0, 'redistribute', 'Choose at least one list to receive the votes.');
      need(!action.to.some((t) => action.from.includes(t.listId)), 'redistribute', 'A list cannot both give and receive votes.');
      const sources = action.from.map((id) => listById(s, id));
      notWithdrawn(s, ...action.from, ...action.to.map((t) => t.listId));
      const pool = sumVotes(sources.map((l) => l.votes));
      need(pool >= action.votes, 'transfer-exceeds', `The selected lists hold only ${pool.toLocaleString()} votes.`);
      const take = apportion(action.votes, sources.map((l) => l.votes));
      sources.forEach((l, i) => { s = replaceList(s, l.id, (x) => ({ ...x, votes: x.votes - take[i] })); });
      const give = apportion(action.votes, action.to.map((t) => t.share));
      action.to.forEach((t, i) => { listById(s, t.listId); s = replaceList(s, t.listId, (x) => ({ ...x, votes: addVotes(x.votes, give[i]) })); });
      break;
    }
    case 'scaleAll': {
      need(Number.isFinite(action.factorPct) && action.factorPct >= 0, 'factor', 'Scale must be ≥ 0%.');
      const total = sumVotes(s.lists.map((l) => l.votes));
      const target = Math.round(total * (action.factorPct / 100));
      const parts = apportion(target, s.lists.map((l) => l.votes));
      s = { ...s, lists: s.lists.map((l, i) => ({ ...l, votes: parts[i] })) };
      break;
    }
    case 'merge': {
      need(new Set(action.ids).size === action.ids.length && action.ids.length >= 2, 'merge-size', 'Select at least two different lists to merge.');
      need(!s.lists.some((l) => l.id === action.newId && !action.ids.includes(l.id)), 'duplicate-id', 'A list with that id already exists.');
      need(Number.isFinite(action.retentionPct), 'retention', 'Retention must be a number.');
      need(action.retentionPct >= 0 && action.retentionPct <= 100, 'retention', 'Retention must be between 0% and 100%.');
      const parts = action.ids.map((id) => listById(s, id));
      const total = sumVotes(parts.map((l) => l.votes));
      const kept = Number((BigInt(total) * BigInt(Math.round(action.retentionPct * 100))) / 10000n);
      const seen = new Set<string>();
      const ordered = action.candidateOrder === 'interleave' ? interleave(parts.map((p) => p.candidates)) : parts.flatMap((p) => p.candidates);
      const candidates = ordered.filter((c) => (seen.has(c.id) ? false : (seen.add(c.id), true)));
      const blocs = new Set(parts.map((p) => p.bloc));
      const merged: SimList = {
        id: action.newId, originIds: [...new Set(parts.flatMap((p) => p.originIds))], letters: action.letters, nameHe: action.nameHe,
        shortHe: action.nameHe, shortEn: null, color: action.color, bloc: blocs.size === 1 ? parts[0].bloc : null,
        votes: kept, withdrawn: false, candidates, sponsorsHe: parts.map((p) => p.sponsorsHe).filter(Boolean).join('; '),
        ...rosterFlags(parts),
      };
      const firstIdx = s.lists.findIndex((l) => action.ids.includes(l.id));
      const rest = s.lists.filter((l) => !action.ids.includes(l.id));
      rest.splice(Math.min(firstIdx, rest.length), 0, merged);
      s = { ...s, lists: rest, invalid: addVotes(s.invalid, (action.nonRetained === 'invalid' ? total - kept : 0)) };
      s = { ...s, agreements: s.agreements.filter((a) => !a.members.some((m) => action.ids.includes(m))) };
      break;
    }
    case 'split': {
      const orig = listById(s, action.id);
      need(action.parts.length >= 2, 'split-size', 'A split needs at least two resulting lists.');
      need(new Set(action.parts.map((p) => p.newId)).size === action.parts.length, 'duplicate-id', 'The new lists need different ids.');
      need(!action.parts.some((p) => s.lists.some((l) => l.id === p.newId && l.id !== action.id)), 'duplicate-id', 'A list with that id already exists.');
      const sum = sumVotes(action.parts.map((p) => p.votes));
      for (const p of action.parts) need(isWhole(p.votes), 'votes', 'Votes must be whole numbers ≥ 0.');
      need(sum <= orig.votes, 'split-exceeds', `The parts total ${sum.toLocaleString()} votes, more than the original ${orig.votes.toLocaleString()}.`);
      need(sum === orig.votes, 'split-total', 'The parts must sum exactly to the original vote count.');
      const used = new Set<string>();
      const byId = new Map<string, SimCandidate>();
      for (const c of orig.candidates) if (!byId.has(c.id)) byId.set(c.id, c);
      for (const p of action.parts) for (const cid of p.candidateIds) {
        need(byId.has(cid), 'split-candidate', 'A part contains a candidate who is not on the original list.');
        need(!used.has(cid), 'split-candidate', 'A candidate can appear on only one of the new lists.');
        used.add(cid);
      }
      const newLists: SimList[] = action.parts.map((p) => ({
        id: p.newId, originIds: orig.originIds, letters: p.letters, nameHe: p.nameHe, shortHe: p.nameHe, shortEn: null, color: p.color,
        bloc: orig.bloc, votes: p.votes, withdrawn: false, sponsorsHe: orig.sponsorsHe,
        candidates: p.candidateIds.map((cid) => byId.get(cid)!),
        ...rosterFlags([orig]),
      }));
      const idx = s.lists.findIndex((l) => l.id === action.id);
      const lists = [...s.lists]; lists.splice(idx, 1, ...newLists);
      s = { ...s, lists, agreements: s.agreements.filter((a) => !a.members.includes(action.id)) };
      break;
    }
    case 'addList':
      need(isWhole(action.votes), 'votes', 'Votes must be a whole number ≥ 0.');
      need(!s.lists.some((l) => l.id === action.newId), 'duplicate-id', 'List id already exists.');
      // a new list is its own lineage, so comparisons and later merges/splits can follow it
      s = { ...s, lists: [...s.lists, { id: action.newId, originIds: [action.newId], letters: action.letters, nameHe: action.nameHe, shortHe: action.nameHe, shortEn: null, color: action.color, bloc: null, votes: action.votes, withdrawn: false, candidates: [], sponsorsHe: '' }] };
      break;
    case 'removeList':
      listById(s, action.listId);
      s = pruneAgreements({ ...s, lists: s.lists.filter((l) => l.id !== action.listId) });
      break;
    case 'setWithdrawn': {
      // Ballots for a list that does not contest are invalid: its votes move to the invalid count and
      // return if the list is reinstated.
      const l = listById(s, action.listId);
      if (action.withdrawn && !l.withdrawn) {
        s = replaceList({ ...s, invalid: addVotes(s.invalid, l.votes) }, l.id, (x) => ({ ...x, withdrawn: true, heldVotes: x.votes, votes: 0 }));
      } else if (!action.withdrawn && l.withdrawn) {
        const back = Math.min(l.heldVotes ?? 0, s.invalid);
        s = replaceList({ ...s, invalid: s.invalid - back }, l.id, (x) => ({ ...x, withdrawn: false, heldVotes: undefined, votes: addVotes(x.votes, back) }));
      }
      break;
    }
    case 'setListMeta':
      listById(s, action.listId);
      s = replaceList(s, action.listId, (l) => ({ ...l, ...action.patch }));
      break;
    case 'setAgreement': {
      for (const m of action.agreement.members) listById(s, m);
      const exists = s.agreements.some((a) => a.id === action.agreement.id);
      s = { ...s, agreements: exists ? s.agreements.map((a) => (a.id === action.agreement.id ? action.agreement : a)) : [...s.agreements, action.agreement] };
      checkAgreements(s);
      break;
    }
    case 'removeAgreement':
      s = { ...s, agreements: s.agreements.filter((a) => a.id !== action.id) };
      break;
    case 'candidates': {
      listById(s, action.listId);
      need(Array.isArray(action.candidates), 'candidates', 'Invalid candidate list.');
      const ids = new Set<string>();
      for (const c of action.candidates) { need(c.nameHe.trim().length > 0, 'candidate-name', 'Every candidate needs a name.'); need(!ids.has(c.id), 'candidate-dup', 'Duplicate candidate.'); ids.add(c.id); }
      s = replaceList(s, action.listId, (l) => ({ ...l, candidates: action.candidates as SimCandidate[] }));
      break;
    }
    case 'setRules':
      need(s.mode === 'experimental', 'historical-rules', 'Electoral rules are fixed by law in a historically valid simulation. Switch to experimental rules to change them.');
      if (action.patch.seats !== undefined) need(Number.isInteger(action.patch.seats) && action.patch.seats >= 1 && action.patch.seats <= 1000, 'seats', 'Seats must be a whole number between 1 and 1000.');
      if (action.patch.thresholdPct !== undefined) need(/^\d+(\.\d+)?$/.test(action.patch.thresholdPct) && Number(action.patch.thresholdPct) <= 100, 'threshold', 'Threshold must be a percentage between 0 and 100.');
      if (action.patch.maxAgreementSize !== undefined) need(Number.isInteger(action.patch.maxAgreementSize) && action.patch.maxAgreementSize >= 2, 'agreement-size', 'Agreements need at least two lists.');
      s = { ...s, rules: { ...s.rules, ...action.patch } };
      break;
    case 'setMode':
      if (action.mode === 'historical') {
        const disabled = new Set<string>();
        const seen = new Set<string>();
        for (const a of s.agreements) {
          if (!a.enabled) continue;
          if (a.members.length !== 2 || a.members.some((m) => seen.has(m))) disabled.add(a.id);
          else a.members.forEach((m) => seen.add(m));
        }
        s = { ...s, mode: 'historical', rules: ctx.base && ctx.base.electionId === s.electionId ? { ...ctx.base.rules } : historicalRules(electionRuleSetId(s.electionId)), agreements: s.agreements.map((a) => (disabled.has(a.id) ? { ...a, enabled: false } : a)) };
      } else s = { ...s, mode: 'experimental' };
      break;
    case 'setTotals':
      if (action.registered !== undefined) need(isWhole(action.registered), 'votes', 'Registered voters must be a whole number ≥ 0.');
      if (action.invalid !== undefined) need(isWhole(action.invalid), 'votes', 'Invalid ballots must be a whole number ≥ 0.');
      s = { ...s, registered: action.registered ?? s.registered, invalid: action.invalid ?? s.invalid };
      break;
    case 'setBlocs':
      s = { ...s, blocs: action.blocs, lists: s.lists.map((l) => (l.bloc && !action.blocs.some((b) => b.id === l.bloc) ? { ...l, bloc: null } : l)) };
      break;
    case 'setLottery': {
      const lw = { ...s.lotteryWinners };
      if (action.winner) lw[action.key] = action.winner; else delete lw[action.key];
      s = { ...s, lotteryWinners: lw };
      break;
    }
    case 'resetList': {
      // first return any votes held as invalid while the list was withdrawn
      const cur = s.lists.find((l) => l.id === action.listId);
      if (!action.keepVotes && cur?.withdrawn && cur.heldVotes) s = { ...s, invalid: Math.max(0, s.invalid - cur.heldVotes) };
      const base = ctx.base ? baseList(action.listId) : action.base ?? null;
      const restored = base && action.keepVotes && cur ? { ...base, votes: cur.votes, withdrawn: cur.withdrawn, ...(cur.heldVotes !== undefined ? { heldVotes: cur.heldVotes } : {}) } : base;
      if (restored) s = s.lists.some((l) => l.id === action.listId) ? replaceList(s, action.listId, () => restored) : { ...s, lists: [...s.lists, restored] };
      else s = pruneAgreements({ ...s, lists: s.lists.filter((l) => l.id !== action.listId) });
      break;
    }
    case 'resetVotes': {
      const b = baseList(action.listId);
      need(b, 'no-base', 'This list has no historical value to reset to.');
      listById(s, action.listId);
      notWithdrawn(s, action.listId);
      s = replaceList(s, action.listId, (l) => ({ ...l, votes: b!.votes }));
      break;
    }
    case 'resetCandidates': {
      const b = baseList(action.listId);
      need(b, 'no-base', 'This list has no historical candidate list.');
      listById(s, action.listId);
      s = replaceList(s, action.listId, (l) => ({ ...l, candidates: b!.candidates }));
      break;
    }
    case 'rename':
      s = { ...s, name: action.name };
      break;
    case 'setTurnout': {
      need(action.pct > 0 && action.pct <= 100, 'turnout', 'Turnout must be above 0% and at most 100%.');
      const valid = sumVotes(s.lists.map((l) => l.votes));
      const cast = addVotes(valid, s.invalid);
      need(cast > 0, 'turnout', 'There are no votes to scale.');
      const target = Math.round(s.registered * (action.pct / 100));
      const invalid = Math.round((s.invalid * target) / cast);
      const parts = apportion(target - invalid, s.lists.map((l) => l.votes));
      s = { ...s, invalid, lists: s.lists.map((l, i) => ({ ...l, votes: parts[i] })) };
      break;
    }
    case 'restore': {
      const B = ctx.base;
      if (action.what === 'agreements') {
        const src = B?.agreements ?? action.agreements;
        need(src, 'no-base', 'Historical agreements are unavailable.');
        const ids = new Set(s.lists.map((l) => l.id));
        s = { ...s, agreements: src!.filter((a) => a.members.every((m) => ids.has(m))).map((a) => ({ ...a, members: [...a.members] })) };
      } else if (action.what === 'totals') {
        const reg = B?.registered ?? action.registered, inv = B?.invalid ?? action.invalid;
        need(reg !== undefined && inv !== undefined, 'no-base', 'Historical totals are unavailable.');
        s = { ...s, registered: reg!, invalid: inv! };
      } else if (action.what === 'blocs') {
        const blocs = B?.blocs ?? action.blocs;
        const listBlocs = B ? Object.fromEntries(B.lists.map((l) => [l.id, l.bloc])) : action.listBlocs;
        need(blocs && listBlocs, 'no-base', 'Historical blocs are unavailable.');
        s = { ...s, blocs: blocs!, lists: s.lists.map((l) => (l.id in listBlocs! ? { ...l, bloc: listBlocs![l.id] } : l)) };
      } else s = { ...s, lotteryWinners: {} };
      break;
    }
  }
  // All transitions, including resets/restores, must keep both counts and derived totals exact.
  need(isWhole(s.registered) && isWhole(s.invalid), 'votes', 'Totals must be safe integers ≥ 0.');
  addVotes(sumVotes(s.lists.map((l) => l.votes)), s.invalid);
  return { ...s, log: [...s0.log, { at: now, action }] };
}
