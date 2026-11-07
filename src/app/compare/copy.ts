// Plans Compare copies (design: docs/design/compare-workbench.md §7). Pure: each plan is a list of concrete,
// already-computed actions for the destination side, wrapped in one `copyFrom` step. Inputs travel; results never do:
// seats, quotas and elected members are recalculated by the engine on the destination.
import { applyAction, ActionError, apportion } from '../../model/actions.ts';
import { historicalRules, electionRuleSetId, votesCast, type Action, type CopyProvenance, type Scenario, type SimAgreement, type SimCandidate, type SimList } from '../../model/scenario.ts';
import { percentToRational } from '../../engine/rational.ts';
import { sourceValue } from '../preferences.ts';
import { stayingHome, type SourceChoice } from '../voteEdit.ts';
import { fmtInt, fmtPct } from '../format.ts';
import { getSetting } from '../store.ts';
import { personKey, type MatchRow } from './match.ts';

export type Msg = { en: string; he: string };
export type CopyMode = 'count' | 'share' | 'change';
/** The owner's default for copies between elections (one constant; Settings can override it per person). */
export const COPY_MODE_DEFAULT: Exclude<CopyMode, 'change'> = 'share';
export interface CopySource { sc: Scenario; /** the side's starting point, for As change */ start: Scenario; name: string; official: boolean }
export interface CopyUnit { src: string[]; dst: string[] }
export type Plan = { ok: true; action: Action; result: Scenario; targets: { listId: string; before: number; after: number }[]; capped?: number } | { ok: false; reason: Msg };

const refuse = (en: string, he: string): Plan => ({ ok: false, reason: { en, he } });
const valid = (s: Scenario) => s.lists.reduce((t, l) => t + l.votes, 0);
const sum = (s: Scenario, ids: string[]) => ids.reduce((t, id) => t + (s.lists.find((l) => l.id === id)?.votes ?? 0), 0);
const nameOf = (s: Scenario, ids: string[]) => ids.map((id) => s.lists.find((l) => l.id === id)?.shortHe ?? id).join(' + ');
/** round(num/den) to the nearest integer, halves up; num, den ≥ 0 */
const nearest = (num: bigint, den: bigint) => (2n * num + den) / (2n * den);
const floor = (num: bigint, den: bigint) => num / den;
const ceil = (num: bigint, den: bigint) => (num + den - 1n) / den;
type Rat = { num: bigint; den: bigint };

/** Applies inner actions as one copy, so the plan can be previewed and is validated exactly as it will commit. */
function finish(dest: Scenario, ctx: { base?: Scenario }, provenance: CopyProvenance, actions: Action[], extra: Partial<Extract<Plan, { ok: true }>> = {}): Plan {
  if (!actions.length) return refuse('Nothing to copy: the values are already the same.', 'אין מה להעתיק: הערכים כבר זהים.');
  const action: Action = { type: 'copyFrom', provenance, actions };
  try {
    const result = applyAction(dest, action, undefined, ctx);
    const ids = provenance.targetListIds ?? [];
    return { ok: true, action, result, targets: ids.map((id) => ({ listId: id, before: dest.lists.find((l) => l.id === id)?.votes ?? 0, after: result.lists.find((l) => l.id === id)?.votes ?? 0 })), ...extra };
  } catch (e) {
    return refuse(e instanceof ActionError ? e.message : String(e), e instanceof ActionError ? e.message : String(e));
  }
}

const provenanceOf = (from: CopySource, field: CopyProvenance['field'], rest: Partial<CopyProvenance>): CopyProvenance =>
  ({ electionId: from.sc.electionId, sourceName: from.name, official: from.official, field, paths: [], ...rest });

/**
 * Votes, for one or several rows at once (one transaction).
 *  count:  x = s (exact).
 *  share:  p = s/S exactly; fixed total (other lists, one list): x = p·V; new voters: x = p·O/(1−P), O the other lists' votes.
 *  change: the source's change in share since its starting point, added to the destination's share.
 * Rounded to the nearest vote, except that a list never lands on the other side of the threshold from its exact share.
 */
export function planVotes(o: { from: CopySource; to: Scenario; ctx?: { base?: Scenario }; units: CopyUnit[]; mode: CopyMode; policy: SourceChoice; fieldOverride?: CopyProvenance['field'] }): Plan {
  const { from, units, mode, policy } = o;
  const ctx = o.ctx ?? {};
  if (!units.length) return refuse('Choose a row to copy.', 'בחרו שורה להעתקה.');
  const dstAll = units.flatMap((u) => u.dst), srcAll = units.flatMap((u) => u.src);
  if (new Set(dstAll).size !== dstAll.length) return refuse('A list would receive two copies at once.', 'רשימה הייתה מקבלת שתי העתקות בבת אחת.');
  if (new Set(srcAll).size !== srcAll.length) return refuse('One source list cannot be copied twice in one step.', 'אי אפשר להעתיק רשימת מקור פעמיים בצעד אחד.');
  for (const id of srcAll) if (!from.sc.lists.some((l) => l.id === id)) return refuse('A source list no longer exists.', 'רשימת מקור כבר אינה קיימת.');
  for (const id of dstAll) if (!o.to.lists.some((l) => l.id === id)) return refuse('A destination list no longer exists.', 'רשימת יעד כבר אינה קיימת.');
  for (const u of units) if (u.src.every((id) => from.sc.lists.find((l) => l.id === id)!.withdrawn))
    return refuse(`${nameOf(from.sc, u.src)} withdrew: there are no votes to copy.`, `${nameOf(from.sc, u.src)} פרשה: אין קולות להעתקה.`);
  // a withdrawn destination is reinstated in the same step (its held votes return), never given votes while withdrawn
  const inner: Action[] = [];
  let w = o.to;
  for (const id of dstAll) if (w.lists.find((l) => l.id === id)!.withdrawn) { const a: Action = { type: 'setWithdrawn', listId: id, withdrawn: false }; inner.push(a); w = applyAction(w, a, undefined, ctx); }
  if (policy.kind === 'transfer') {
    const d = w.lists.find((l) => l.id === policy.listId);
    if (!d || d.withdrawn || dstAll.includes(d.id)) return refuse('The chosen list cannot give these votes.', 'הרשימה שנבחרה אינה יכולה לתת את הקולות.');
  }
  const S = BigInt(valid(from.sc)), V = BigInt(valid(w));
  if (mode !== 'count' && S === 0n) return refuse('The source has no valid votes.', 'אין קולות כשרים במקור.');
  const v = units.map((u) => BigInt(sum(w, u.dst)));
  const fixed = dstAll.length ? w.lists.filter((l) => !dstAll.includes(l.id)).reduce((t, l) => t + BigInt(l.votes), 0n) : V; // O: everyone else
  // target shares as exact rationals (share and change)
  let shares: Rat[] = [];
  if (mode === 'share') shares = units.map((u) => ({ num: BigInt(sum(from.sc, u.src)), den: S }));
  if (mode === 'change') {
    const S0 = BigInt(valid(from.start));
    if (S0 === 0n || V === 0n) return refuse('There is no starting share to compare with.', 'אין שיעור התחלתי להשוואה.');
    shares = units.map((u, i) => {
      const s = BigInt(sum(from.sc, u.src)), s0 = BigInt(sum(from.start, u.src));
      // v/V + s/S − s0/S0
      return { num: v[i] * S * S0 + s * V * S0 - s0 * V * S, den: V * S * S0 };
    });
    if (shares.some((p) => p.num < 0n)) return refuse('Not possible: the list would need negative votes.', 'לא אפשרי: הרשימה הייתה צריכה מספר קולות שלילי.');
  }
  const P = shares.reduce<Rat>((t, p) => ({ num: t.num * p.den + p.num * t.den, den: t.den * p.den }), { num: 0n, den: 1n });
  if (mode !== 'count' && P.num >= P.den) return refuse('Not possible: the other lists would need negative votes.', 'לא אפשרי: שאר הרשימות היו צריכות מספר קולות שלילי.');
  let capped: number | undefined;
  let X: bigint[];
  if (mode === 'count') X = units.map((u) => BigInt(sum(from.sc, u.src)));
  else if (policy.kind === 'new') {
    // x_i = p_i · O / (1 − P)
    X = shares.map((p) => nearest(p.num * fixed * P.den, p.den * (P.den - P.num)));
  } else X = shares.map((p) => nearest(p.num * V, p.den));
  // the threshold guard: rounding never moves a list across the threshold its exact share is on
  if (mode !== 'count') {
    const t = percentToRational(w.rules.thresholdPct);
    for (let pass = 0; pass < 3; pass++) {
      const total = policy.kind === 'new' ? fixed + X.reduce((a, b) => a + b, 0n) : V;
      let moved = false;
      X = X.map((x, i) => {
        const above = shares[i].num * t.den >= t.num * shares[i].den; // p ≥ t
        const isAbove = x * t.den >= t.num * total;
        if (above === isAbove) return x;
        moved = true;
        const exact = policy.kind === 'new' ? { num: shares[i].num * fixed * P.den, den: shares[i].den * (P.den - P.num) } : { num: shares[i].num * V, den: shares[i].den };
        return above ? ceil(exact.num, exact.den) : floor(exact.num, exact.den);
      });
      if (!moved) break;
    }
  }
  // balancing
  const gain = X.reduce((t, x, i) => t + x - v[i], 0n);
  const votes = new Map(w.lists.map((l) => [l.id, BigInt(l.votes)]));
  if (policy.kind === 'new') {
    const home = BigInt(stayingHome(w));
    if (gain > home) {
      if (units.length > 1) return refuse(`Not possible: only ${fmtInt(home)} voters stayed home.`, `לא אפשרי: רק ${fmtInt(home)} בוחרים נשארו בבית.`);
      X = [v[0] + home]; capped = Number(home);
    }
  } else if (gain !== 0n) {
    const donors = policy.kind === 'transfer' ? w.lists.filter((l) => l.id === policy.listId) : w.lists.filter((l) => !dstAll.includes(l.id) && !l.withdrawn && l.votes > 0);
    const pool = donors.reduce((t, l) => t + BigInt(l.votes), 0n);
    if (!donors.length) return refuse('Not possible: no other list can balance these votes.', 'לא אפשרי: אין רשימה אחרת שתאזן את הקולות.');
    if (gain > pool) return policy.kind === 'transfer'
      ? refuse(`${donors[0].shortHe} has only ${fmtInt(pool)} votes.`, `לרשימה ${donors[0].shortHe} רק ${fmtInt(pool)} קולות.`)
      : refuse('Not possible: the other lists would need negative votes.', 'לא אפשרי: שאר הרשימות היו צריכות מספר קולות שלילי.');
    // as every vote edit: taken from (or given back to) the other lists in proportion to their votes, exact largest remainder
    const parts = apportion(Number(gain < 0n ? -gain : gain), donors.map((l) => l.votes));
    donors.forEach((l, i) => votes.set(l.id, votes.get(l.id)! + (gain > 0n ? -BigInt(parts[i]) : BigInt(parts[i]))));
  }
  // within a unit (a merged or split row), the copied total keeps the destination lists' own balance
  units.forEach((u, i) => {
    const weights = u.dst.map((id) => w.lists.find((l) => l.id === id)!.votes);
    const split = apportion(Number(X[i]), weights.some((x) => x > 0) ? weights : weights.map(() => 1));
    u.dst.forEach((id, k) => votes.set(id, BigInt(split[k])));
  });
  for (const l of w.lists) { const n = Number(votes.get(l.id)!); if (n !== l.votes) inner.push({ type: 'setVotes', listId: l.id, votes: n }); }
  const value = mode === 'count' ? fmtInt(X.reduce((a, b) => a + b, 0n)) : mode === 'share' && units.length === 1 ? fmtPct(shares[0].num, shares[0].den, getSetting('decimals')) : undefined;
  const provenance = provenanceOf(from, o.fieldOverride ?? 'votes', {
    mode, policy: sourceValue(policy), sourceListIds: srcAll, targetListIds: dstAll, ...(value ? { value } : {}),
    paths: dstAll.map((id) => ['lists', id, 'votes']),
  });
  return finish(o.to, ctx, provenance, inner, capped !== undefined ? { capped } : {});
}

/** Turnout (copied as the percentage: lists and invalid ballots scale, shares stay), registered voters, invalid ballots. */
export function planTotals(o: { from: CopySource; to: Scenario; ctx?: { base?: Scenario }; field: 'turnout' | 'registered' | 'invalid' }): Plan {
  const { from, to, field } = o;
  if (field === 'registered') {
    if (from.sc.registered === to.registered) return refuse('Already the same.', 'כבר זהה.');
    if (votesCast(to) > from.sc.registered) return refuse(`Not possible: ${fmtInt(votesCast(to))} votes were cast, more than ${fmtInt(from.sc.registered)} registered voters.`, `לא אפשרי: הוטלו ${fmtInt(votesCast(to))} קולות, יותר מ־${fmtInt(from.sc.registered)} בעלי זכות בחירה.`);
    return finish(to, o.ctx ?? {}, provenanceOf(from, 'registered', { value: fmtInt(from.sc.registered), paths: [['registered']] }), [{ type: 'setTotals', registered: from.sc.registered }]);
  }
  if (field === 'invalid') {
    if (from.sc.invalid === to.invalid) return refuse('Already the same.', 'כבר זהה.');
    if (valid(to) + from.sc.invalid > to.registered) return refuse('Not possible: votes cast would exceed registered voters.', 'לא אפשרי: מספר המצביעים היה עולה על מספר בעלי זכות הבחירה.');
    return finish(to, o.ctx ?? {}, provenanceOf(from, 'invalid', { value: fmtInt(from.sc.invalid), paths: [['invalid']] }), [{ type: 'setTotals', invalid: from.sc.invalid }]);
  }
  if (!from.sc.registered || !to.registered) return refuse('Turnout is unknown for one side.', 'שיעור ההצבעה אינו ידוע באחד הצדדים.');
  // exact target: votes cast = registered · (source cast / source registered), to the nearest vote
  const target = Number(nearest(BigInt(to.registered) * BigInt(votesCast(from.sc)), BigInt(from.sc.registered)));
  if (target === votesCast(to)) return refuse('Already the same.', 'כבר זהה.');
  let pct = (votesCast(from.sc) / from.sc.registered) * 100;
  for (let i = 0; i < 4 && Math.round(to.registered * (pct / 100)) !== target; i++) pct += (target - to.registered * (pct / 100)) / to.registered * 100;
  if (Math.round(to.registered * (pct / 100)) !== target) return refuse('Turnout could not be copied exactly.', 'לא ניתן להעתיק את שיעור ההצבעה במדויק.');
  return finish(to, o.ctx ?? {}, provenanceOf(from, 'turnout', { value: fmtPct(votesCast(from.sc), from.sc.registered, getSetting('decimals')), paths: [['invalid']] }), [{ type: 'setTurnout', pct }]);
}

/** The threshold (exact decimal string), or the whole rule set. Rules that differ from the destination's law switch it to
 *  experimental rules in the same step. */
export function planRules(o: { from: CopySource; to: Scenario; ctx?: { base?: Scenario }; what: 'threshold' | 'rules' }): Plan {
  const { from, to } = o;
  const law = historicalRules(electionRuleSetId(to.electionId));
  const same = (x: object, y: object) => JSON.stringify(Object.entries(x).sort()) === JSON.stringify(Object.entries(y).sort());
  if (o.what === 'threshold') {
    const pct = from.sc.rules.thresholdPct;
    if (pct === to.rules.thresholdPct) return refuse('Already the same.', 'כבר זהה.');
    const lawful = to.mode === 'historical' ? [] : pct === law.thresholdPct && same({ ...to.rules, thresholdPct: pct }, law) ? [{ type: 'setMode', mode: 'historical' } as Action] : [];
    const actions: Action[] = lawful.length ? lawful : [...(to.mode === 'historical' ? [{ type: 'setMode', mode: 'experimental' } as Action] : []), { type: 'setRules', patch: { thresholdPct: pct } }];
    return finish(to, o.ctx ?? {}, provenanceOf(from, 'threshold', { value: `${pct}%`, paths: [['rules', 'thresholdPct']] }), actions);
  }
  if (same(from.sc.rules, to.rules)) return refuse('Already the same.', 'כבר זהה.');
  const mode = same(from.sc.rules, law) ? 'historical' : 'experimental';
  return finish(to, o.ctx ?? {}, provenanceOf(from, 'rules', { paths: [['rules']] }),
    [{ type: 'startPart', part: 'rules', source: 'saved', snapshot: { rules: { ...from.sc.rules }, mode }, name: from.name }]);
}

/** Surplus agreements mapped through the row matching. Pairs that cannot be mapped are listed, never dropped silently. */
export function planAgreements(o: { from: CopySource; to: Scenario; ctx?: { base?: Scenario }; rows: MatchRow[]; direction: 'toRight' | 'toLeft' }): Plan & { skipped?: { members: string[]; reason: Msg }[] } {
  const map = new Map<string, string>();
  for (const r of o.rows) {
    if (r.left.length !== 1 || r.right.length !== 1 || r.tag === 'check' || r.group) continue;
    if (o.direction === 'toRight') map.set(r.left[0], r.right[0]); else map.set(r.right[0], r.left[0]);
  }
  const skipped: { members: string[]; reason: Msg }[] = [];
  const out: SimAgreement[] = [];
  const taken = new Set<string>();
  for (const a of o.from.sc.agreements.filter((x) => x.enabled)) {
    const members = a.members.map((m) => map.get(m));
    if (members.some((m) => !m)) { skipped.push({ members: a.members, reason: { en: 'a list has no one-to-one counterpart', he: 'לרשימה אין מקבילה אחת לאחת' } }); continue; }
    if (members.some((m) => o.to.lists.find((l) => l.id === m)?.withdrawn)) { skipped.push({ members: a.members, reason: { en: 'a counterpart withdrew', he: 'רשימה מקבילה פרשה' } }); continue; }
    if (members.some((m) => taken.has(m!)) || o.to.mode === 'historical' && members.length !== 2) { skipped.push({ members: a.members, reason: { en: 'breaks the destination’s rules', he: 'סותר את כללי היעד' } }); continue; }
    members.forEach((m) => taken.add(m!));
    out.push({ id: `cmp-${a.id}`, members: members as string[], enabled: true });
  }
  const same = JSON.stringify(out.map((a) => [...a.members].sort())) === JSON.stringify(o.to.agreements.filter((a) => a.enabled).map((a) => [...a.members].sort()));
  if (same) return { ...refuse('Already the same.', 'כבר זהה.'), skipped };
  const plan = finish(o.to, o.ctx ?? {}, provenanceOf(o.from, 'agreements', { value: String(out.length), paths: [['agreements']] }),
    [{ type: 'startPart', part: 'agreements', source: 'saved', snapshot: { agreements: out }, name: o.from.name }]);
  return { ...plan, skipped };
}

/** Roster import: the source roster and order, with its parties and completeness flags. Candidates keep their ids;
 *  `originListId` becomes the destination list and `importedFrom` keeps where they came from. */
export function rosterActions(from: CopySource, src: SimList, to: Scenario, dstId: string): Action[] {
  const dst = to.lists.find((l) => l.id === dstId)!;
  const candidates = src.candidates.map((c) => ({ ...c, originListId: dstId, importedFrom: c.importedFrom ?? { electionId: from.sc.electionId, listId: src.id } }));
  const out: Action[] = [];
  // a faction split belongs to the old parties: undone first, while the list still has them (counted by party is the
  // default, so a joint list usually starts split)
  if (to.factionSplits?.includes(dstId) && JSON.stringify(dst.parties?.map((p) => p.id)) !== JSON.stringify(src.parties?.map((p) => p.id))) out.push({ type: 'setFactionSplit', listId: dstId, split: false });
  out.push({ type: 'candidates', listId: dstId, candidates, note: 'copy', parties: src.parties ?? [], rosterUnavailable: !!src.rosterUnavailable, rosterTruncated: !!src.rosterTruncated });
  return out;
}
/** A candidate on `listId` who also stands on another list. */
export interface Duplicate { candidate: SimCandidate; otherListId: string; otherCandidateId: string }
/** People an imported roster puts on two lists. A person can sit for one list only; the app never decides which. */
export function duplicatePeople(s: Scenario, listId: string): Duplicate[] {
  const l = s.lists.find((x) => x.id === listId);
  if (!l) return [];
  const mine = new Map(l.candidates.map((c) => [personKey(c), c] as const));
  return s.lists.filter((o) => o.id !== listId && !o.withdrawn).flatMap((o) => o.candidates.flatMap((c) => {
    const m = mine.get(personKey(c));
    return m ? [{ candidate: m, otherListId: o.id, otherCandidateId: c.id }] : [];
  }));
}
/** Removing chosen duplicates from their other lists, in the same step (ordinary candidate edits there, marked as edits). */
export type Removal = { listId: string; candidateId: string };
function removalActions(w: Scenario, removals: Removal[]): Action[] {
  return [...new Set(removals.map((r) => r.listId))].flatMap((id) => {
    const l = w.lists.find((x) => x.id === id);
    const gone = new Set(removals.filter((r) => r.listId === id).map((r) => r.candidateId));
    return l && l.candidates.some((c) => gone.has(c.id)) ? [{ type: 'candidates', listId: id, candidates: l.candidates.filter((c) => !gone.has(c.id)), note: 'copy' } as Action] : [];
  });
}

export function planRoster(o: { from: CopySource; to: Scenario; ctx?: { base?: Scenario }; srcId: string; dstId: string; remove?: Removal[] }): Plan {
  const src = o.from.sc.lists.find((l) => l.id === o.srcId), dst = o.to.lists.find((l) => l.id === o.dstId);
  if (!src || !dst) return refuse('The list no longer exists.', 'הרשימה כבר אינה קיימת.');
  if (JSON.stringify(src.candidates.map((c) => c.id)) === JSON.stringify(dst.candidates.map((c) => c.id))) return refuse('Already the same.', 'כבר זהה.');
  return finish(o.to, o.ctx ?? {}, provenanceOf(o.from, 'candidates', { sourceListIds: [src.id], targetListIds: [dst.id], value: String(src.candidates.length), paths: [['lists', dst.id, 'candidates']] }),
    [...rosterActions(o.from, src, o.to, dst.id), ...removalActions(o.to, o.remove ?? [])]);
}

/** A list's colour: appearance only, so the copy carries no marker. */
export function planColour(o: { from: CopySource; to: Scenario; ctx?: { base?: Scenario }; srcId: string; dstId: string }): Plan {
  const src = o.from.sc.lists.find((l) => l.id === o.srcId), dst = o.to.lists.find((l) => l.id === o.dstId);
  if (!src || !dst) return refuse('The list no longer exists.', 'הרשימה כבר אינה קיימת.');
  if (src.color === dst.color) return refuse('Already the same.', 'כבר זהה.');
  return finish(o.to, o.ctx ?? {}, provenanceOf(o.from, 'colour', { sourceListIds: [src.id], targetListIds: [dst.id], paths: [] }), [{ type: 'setListMeta', listId: dst.id, patch: { color: src.color } }]);
}

export interface WholeListOptions { votes: boolean; candidates: boolean; identity: boolean; appearance: boolean; mode: CopyMode; policy: SourceChoice }
/** Replace a list with another side's list (votes, candidates, optionally name and letters, colour), or add it beside
 *  the existing lists. Rules, agreements and blocs stay with the destination: copying them is a separate act. */
export function planWholeList(o: { from: CopySource; to: Scenario; ctx?: { base?: Scenario }; srcId: string; dstId: string | null; opts: WholeListOptions; newId?: string; remove?: Removal[] }): Plan {
  const ctx = o.ctx ?? {};
  const src = o.from.sc.lists.find((l) => l.id === o.srcId);
  if (!src) return refuse('The list no longer exists.', 'הרשימה כבר אינה קיימת.');
  if (src.withdrawn) return refuse(`${src.shortHe} withdrew: there is nothing to copy.`, `${src.shortHe} פרשה: אין מה להעתיק.`);
  let w = o.to; const inner: Action[] = [];
  const add = (a: Action) => { inner.push(a); w = applyAction(w, a, undefined, ctx); };
  let dstId = o.dstId;
  try {
    if (!dstId) {
      dstId = o.newId ?? `sim-${o.from.sc.electionId}-${src.id}`;
      if (w.lists.some((l) => l.id === dstId)) return refuse('This list was already added.', 'רשימה זו כבר נוספה.');
      const lettersFree = !w.lists.some((l) => l.letters === src.letters);
      add({ type: 'addList', newId: dstId, nameHe: src.nameHe, letters: lettersFree ? src.letters : '', color: src.color, votes: 0 });
      add({ type: 'setListMeta', listId: dstId, patch: { shortHe: src.shortHe, shortEn: src.shortEn } });
    } else {
      const dst = w.lists.find((l) => l.id === dstId);
      if (!dst) return refuse('The list no longer exists.', 'הרשימה כבר אינה קיימת.');
      if (o.opts.identity) {
        const lettersFree = !w.lists.some((l) => l.id !== dstId && l.letters === src.letters);
        add({ type: 'setListMeta', listId: dstId, patch: { nameHe: src.nameHe, shortHe: src.shortHe, shortEn: src.shortEn, ...(lettersFree ? { letters: src.letters } : {}) } });
      }
      if (o.opts.appearance && dst.color !== src.color) add({ type: 'setListMeta', listId: dstId, patch: { color: src.color } });
    }
    if (o.opts.candidates || !o.dstId) for (const a of rosterActions(o.from, src, w, dstId)) add(a);
    for (const a of removalActions(w, (o.remove ?? []).filter((r) => r.listId !== dstId))) add(a);
  } catch (e) { return refuse(e instanceof Error ? e.message : String(e), e instanceof Error ? e.message : String(e)); }
  let votesPlan: Plan | null = null;
  if (o.opts.votes) {
    votesPlan = planVotes({ from: o.from, to: w, ctx, units: [{ src: [src.id], dst: [dstId] }], mode: o.opts.mode, policy: o.opts.policy });
    if (!votesPlan.ok) return votesPlan;
    inner.push(...(votesPlan.action as Extract<Action, { type: 'copyFrom' }>).actions);
  }
  const vp = votesPlan?.ok ? (votesPlan.action as Extract<Action, { type: 'copyFrom' }>).provenance : undefined;
  const provenance = provenanceOf(o.from, 'list', {
    sourceListIds: [src.id], targetListIds: [dstId], ...(vp ? { mode: vp.mode, policy: vp.policy, ...(vp.value ? { value: vp.value } : {}) } : {}),
    paths: [...(o.opts.votes ? [['lists', dstId, 'votes']] : []), ...(o.opts.candidates || !o.dstId ? [['lists', dstId, 'candidates']] : []), ...(o.opts.identity && o.dstId ? [['lists', dstId, 'nameHe'], ['lists', dstId, 'shortHe'], ['lists', dstId, 'shortEn']] : [])],
  });
  return finish(o.to, ctx, provenance, inner, votesPlan?.ok && votesPlan.capped !== undefined ? { capped: votesPlan.capped } : {});
}
