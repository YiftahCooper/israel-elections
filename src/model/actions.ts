import {assignColour,blocColourRules,separateBlocColours} from '../data/colourGuard.ts';
import {BLOC_PALETTE} from './blocColors.ts';
import {familyColor} from '../families/colors.ts';
import {recordEditScope} from './editScopes.ts';
import {familyLabel} from '../families/labels.ts';
import { resolve, distribute } from '../families/model.ts';
import {isHexColour} from '../data/colourGuard.ts';
import { RULESETS } from "../engine/rules.ts";
import { PARTS, partSnapshot } from './parts.ts';
// Pure scenario transitions. Each returns a new Scenario and never mutates its input.
// Vote counts stay non-negative integers; every integer split uses exact largest-remainder rounding.
import { validAction, NO_COALITION, blocSchemeState, electionRuleSetId, historicalRules, type Action, type ActionContext, type Scenario, type SimCandidate, type SimList } from './scenario.ts';
import type { PartyDef } from '../data/schema.ts';

import { ActionError, M, type Msg } from './messages.ts';
export { ActionError };

const isWhole = (n: number) => Number.isSafeInteger(n) && n >= 0;
const need = (cond: unknown, code: string, msg: Msg) => { if (!cond) throw new ActionError(code, msg); };

const safeCount = (n: bigint): number => {
  need(n >= 0n && n <= BigInt(Number.MAX_SAFE_INTEGER), 'votes', M.votesRange);
  return Number(n);
};
const sumVotes = (values: number[]) => safeCount(values.reduce((sum, n) => {
  need(isWhole(n), 'votes', M.votesWhole);
  return sum + BigInt(n);
}, 0n));
const addVotes = (a: number, b: number) => sumVotes([a, b]);

/** Splits `total` into integers proportional to `weights` (largest remainder; ties by order). */
export function apportion(total: number, weights: number[]): number[] {
  need(isWhole(total), 'votes', M.votesWhole);
  need(weights.every((w) => Number.isFinite(w) && w >= 0), 'votes', M.invalid);
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
  if (!l) throw new ActionError('unknown-list', M.unknownList);
  return l;
};

/** Votes of a withdrawn list are held as invalid ballots; editing them would double-count on reinstatement. */
const notWithdrawn = (s: Scenario, ...ids: string[]) => {
  for (const id of ids) {
    const l = s.lists.find((x) => x.id === id);
    need(!l?.withdrawn, 'withdrawn', l ? M.withdrawn(l) : M.unknownList);
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
    need(a.members.length === 2, 'agreement-size', M.agreementTwo);
    for (const m of a.members) {
      need(!seen.has(m), 'agreement-duplicate', M.agreementOnce);
      seen.add(m);
    }
  }
}

/** Removes agreements that reference lists which no longer exist. */
const pruneAgreements = (s: Scenario): Scenario => ({ ...s, agreements: s.agreements.filter((a) => a.members.every((m) => s.lists.some((l) => l.id === m))) });

/** The constituent parties a list keeps after a merge or split: those its candidates still represent. */
function partiesOf(parties: PartyDef[], candidates: SimCandidate[]): Pick<SimList, 'parties'> {
  const used = new Set(candidates.map((c) => c.partyId).filter(Boolean));
  const seen = new Set<string>();
  const kept = parties.filter((p) => used.has(p.id) && !seen.has(p.id) && (seen.add(p.id), true));
  return kept.length ? { parties: kept.map((p) => ({ ...p })) } : {};
}

/** A roster restored or started from another state: its candidates with the parties they stand for and its completeness
 *  flags, together (a roster copied from another election brings its own parties, so restoring must take them back). */
const withRoster = (l: SimList, from: SimList): SimList => {
  // fields keep their place in the list (absent ones stay absent), so a restore that changes nothing leaves it as it was
  const out: SimList = { ...l, candidates: from.candidates, parties: from.parties?.length ? from.parties.map((p) => ({ ...p })) : undefined,
    rosterUnavailable: from.rosterUnavailable || undefined, rosterTruncated: from.rosterTruncated || undefined };
  for (const k of ['parties', 'rosterUnavailable', 'rosterTruncated'] as const) if (out[k] === undefined && !(k in l)) delete out[k];
  return out;
};
/** After a roster restore, a list whose parties changed counts its faction as the source does (`splits`, when known);
 *  a list left with fewer than two parties cannot stay split. Party colours follow the usual restore rule (kept by id). */
function withSplits(s: Scenario, s0: Scenario, splits: string[] | undefined): Scenario {
  const ids = (l?: SimList) => JSON.stringify(l?.parties?.map((p) => p.id) ?? []);
  const changed = (l: SimList) => { const was = s0.lists.find((x) => x.id === l.id); return !!was && ids(was) !== ids(l); };
  const before = s.factionSplits ?? [];
  const kept = before.filter((id) => { const l = s.lists.find((x) => x.id === id); return !l || (l.parties?.length ?? 0) >= 2 && (!splits || !changed(l) || splits.includes(id)); });
  const added = splits ? s.lists.filter((l) => !kept.includes(l.id) && (l.parties?.length ?? 0) >= 2 && changed(l) && splits.includes(l.id)).map((l) => l.id) : [];
  return kept.length === before.length && !added.length ? s : { ...s, factionSplits: [...kept, ...added] };
}

function interleave<T>(arrays: T[][]): T[] {
  const out: T[] = [];
  const n = Math.max(0, ...arrays.map((a) => a.length));
  for (let i = 0; i < n; i++) for (const a of arrays) if (i < a.length) out.push(a[i]);
  return out;
}

export function applyAction(s0: Scenario, action: Action, now = new Date().toISOString(), ctx: ActionContext = {}): Scenario {
  // A bloc edit that only recolours is appearance; renaming, adding or removing a bloc stays a change.
  if(action.type==='setBlocs'&&!action.unassignAll&&(action.name===undefined||action.name===s0.customGroupingName)&&action.blocs.length===s0.blocs.length&&action.blocs.every((b,i)=>s0.blocs[i]?.id===b.id&&s0.blocs[i].nameHe===b.nameHe&&s0.blocs[i].nameEn===b.nameEn))
    action={type:'setBlocAppearance',blocs:action.blocs};
  let s: Scenario = s0;
  const baseList = (id: string) => ctx.base?.lists.find((l) => l.id === id) ?? null;
  switch (action.type) {
    case 'familyOperation': {
      need(validAction(action), 'family', M.invalid);
      const definition = structuredClone(action.definition);
      if (action.operation === 'group') {
        need(resolve(definition,s).every(l => action.placements[l.id] === l.family), 'family', M.invalid);
        s = {...s, familyDefinition:definition, blocSchemeId:null, customGroupingName:!action.name||action.name===definition.nameHe?familyLabel(definition,'he'):action.name===definition.nameEn?familyLabel(definition,'en'):action.name, partyBlocs:{}, candidateBlocs:{},
          blocs:[{id:'selected',nameHe:familyLabel(definition,'he'),nameEn:familyLabel(definition,'en'),color:familyColor(definition)},...(Object.values(action.placements).includes('mixed')?[{id:'mixed',nameHe:'רשימות מעורבות',nameEn:'Mixed lists',color:'#b8a78a'}]:[]),{id:'other',nameHe:'כל השאר',nameEn:'Everyone else',color:'#7d8791'}],
          lists:s.lists.map(l=>({...l,bloc:action.placements[l.id]}))};
        const colors=separateBlocColours(s.blocs.map(b=>b.color));
        s={...s,blocs:s.blocs.map((b,i)=>({...b,color:colors[i]}))};
      } else {
        const ids = action.allocations.map(a=>a.listId);
        need(new Set(ids).size===ids.length, 'family',M.invalid);
        for(const a of action.allocations) { const l=listById(s,a.listId); need(!l.withdrawn && l.votes===a.before,'family',M.staleVotes); }
        const resolved=resolve(definition,s), members=resolved.filter(l=>l.family==='selected'&&!l.withdrawn);
        const donors=resolved.filter(l=>l.family!=='selected'&&!l.withdrawn&&(action.source.kind!=='transfer'||l.id===action.source.listId));
        const expectedMembers=distribute(BigInt(action.target),members.map(l=>BigInt(l.votes)));
        const memberBefore=sumVotes(members.map(l=>l.votes)), delta=action.target-memberBefore;
        need(members.length>0 && ids.length===members.length+(action.source.kind==='new'?0:donors.length),'family',M.invalid);
        members.forEach((l,i)=>need(action.allocations.find(a=>a.listId===l.id)?.votes===expectedMembers[i],'family',M.invalid));
        if(action.source.kind!=='new') {
          const donorTarget=sumVotes(donors.map(l=>l.votes))-delta;
          need(donorTarget>=0,'family',M.donorsShort);
          const shares=distribute(BigInt(donorTarget),donors.map(l=>BigInt(l.votes)));
          donors.forEach((l,i)=>need(action.allocations.find(a=>a.listId===l.id)?.votes===shares[i],'family',M.invalid));
        }
        const before=sumVotes(action.allocations.map(a=>a.before)), after=sumVotes(action.allocations.map(a=>a.votes));
        need(after-before===action.registeredDelta && (action.source.kind==='new' || action.registeredDelta===0),'family',M.invalid);
        s={...s,familyDefinition:definition,registered:s.registered+action.registeredDelta,lists:s.lists.map(l=>({...l,votes:action.allocations.find(a=>a.listId===l.id)?.votes??l.votes}))};
      }
      break;
    }
    case 'setBlocAppearance':
      need(action.blocs.length===s.blocs.length&&action.blocs.every(b=>s.blocs.some(x=>x.id===b.id)), 'blocs', M.invalid);
      s={...s,blocs:s.blocs.map(b=>({...b,color:action.blocs.find(x=>x.id===b.id)!.color}))};break;
    case 'setPartyColor':
      need(listById(s,action.listId).parties?.some(p=>p.id===action.partyId),'party',M.noParty);
      s=replaceList(s,action.listId,l=>({...l,parties:l.parties?.map(p=>p.id===action.partyId?{...p,color:action.color,customColor:true}:p)}));break;
    case 'resetColors': {
      const base=ctx.base;
      need(base,'no-base',M.noOfficial);
      const scheme=s.blocSchemes?.find(g=>g.id===s.blocSchemeId);
      s={...s,lists:s.lists.map(l=>{const b=base!.lists.find(x=>x.id===l.id);return {...l,color:b?.color??'#7d8791',parties:l.parties?.map(p=>({...p,color:base!.lists.flatMap(x=>x.parties??[]).find(x=>x.id===p.id)?.color,customColor:undefined}))};}),blocs:s.blocs.map(b=>({...b,color:(scheme?.blocs??base!.blocs).find(x=>x.id===b.id)?.color??'#7d8791'}))};break;
    }
    case 'setIdentityColor':
      need(isHexColour(action.color), 'colour', M.colour);
      s = { ...s, identityColor: action.color }; break;
    case 'setCoalition':
      // every role present, each unit in at most one (validated): an older two-role log fails here
      need(validAction(action), 'coalition', M.invalid);
      s = { ...s, coalition: action.coalition }; break;
    case 'startPart': {
      need(validAction(action), 'part', M.invalid);
      let snapshot = action.snapshot;
      if (action.source === 'official') {
        need(ctx.base, 'base', M.noOfficial);
        snapshot = partSnapshot(ctx.base!, action.part);
      }
      if (action.source === 'blank') {
        need(PARTS[action.part]?.blank, 'part', M.noBlank);
        if (action.part === 'candidates') snapshot = { lists: s.lists.map(l => ({ ...l, candidates: [], rosterUnavailable: false, rosterTruncated: false })) };
        else if (action.part === 'agreements') snapshot = { agreements: [] };
        else if (action.part === 'coalitions') snapshot = { coalition: NO_COALITION };
        else if (action.part === 'blocs') {
          need(action.name?.trim(), 'name', M.nameGrouping);
          // two clearly different colours from the bloc palette: grey is reserved for No bloc
          snapshot = { blocs: [0, 1].map(i => ({ id: `blank-${i}`, nameHe: `גוש ${i+1}`, nameEn: `Bloc ${i+1}`, color: assignColour(BLOC_PALETTE,i?[BLOC_PALETTE[0]]:[],blocColourRules(i?[BLOC_PALETTE[0]]:[])) })), customGroupingName: action.name, blocSchemeId: null, partyBlocs: {}, candidateBlocs: {}, listBlocs: Object.fromEntries(s.lists.map(l => [l.id, null])) };
        }
      }
      if (action.source === 'preset') {
        if (action.part === 'blocs') {
          need(action.presetId, 'preset', M.chooseGrouping);
          snapshot = partSnapshot(applyAction(s, { type: 'applyBlocScheme', schemeId: action.presetId! }, now, ctx), 'blocs');
        } else if (action.part === 'rules') {
          need(action.presetId && RULESETS[action.presetId], 'preset', M.chooseRules);
          snapshot = { rules: historicalRules(action.presetId!), mode: action.presetId === electionRuleSetId(s.electionId) ? 'historical' : 'experimental' };
        }
      }
      need(snapshot, 'part', M.invalid);
      if (action.part === 'blocs') {
        need(snapshot!.blocs, 'part', M.invalid);
        s = { ...s, familyDefinition:snapshot!.familyDefinition, blocs: snapshot!.blocs!, blocSchemeId: snapshot!.blocSchemeId ?? null, customGroupingName: snapshot!.customGroupingName, partyBlocs: snapshot!.partyBlocs ?? {}, candidateBlocs: snapshot!.candidateBlocs ?? {}, lists: s.lists.map(l => ({ ...l, bloc: snapshot!.listBlocs?.[l.id] ?? null })) };
      } else if (action.part === 'agreements') {
        const ids = new Set(s.lists.map(l => l.id));
        need(snapshot!.agreements?.every(a => a.members.every(id => ids.has(id))), 'lists', M.agreementLists);
        s = { ...s, agreements: snapshot!.agreements! };
      } else if (action.part === 'rules') {
        need(snapshot!.rules && snapshot!.mode, 'part', M.invalid);
        s = { ...s, rules: snapshot!.rules!, mode: snapshot!.mode! };
      }
      else if (action.part === 'coalitions') {
        need(snapshot!.coalition, 'part', M.invalid);
        s = { ...s, coalition: snapshot!.coalition };
      }
      else if (action.part === 'totals') {
        need(snapshot!.registered !== undefined && snapshot!.invalid !== undefined, 'part', M.invalid);
        need(!snapshot!.validVotes || s.lists.some(l => !l.withdrawn && l.votes > 0), 'votes', M.turnoutNeedsVotes);
        const votes = snapshot!.validVotes === undefined ? null : apportion(snapshot!.validVotes!, s.lists.map(l => l.withdrawn ? 0 : l.votes));
        s = { ...s, registered: snapshot!.registered!, invalid: snapshot!.invalid!, lists: votes ? s.lists.map((l,i) => ({ ...l, votes: votes[i] })) : s.lists };
      } else if (action.part === 'structure') {
        need(snapshot!.lists, 'part', M.invalid);
        const heldBefore = s.lists.reduce((sum,l) => sum + (l.heldVotes ?? 0), 0);
        const lists = snapshot!.lists!.map(from => {
          const old = s.lists.find(l => l.id === from.id);
          if (!old) return from;
          const votes = old.votes + (old.heldVotes ?? 0);
          return { ...old, originIds: from.originIds, withdrawn: from.withdrawn,
            votes: from.withdrawn ? 0 : votes, heldVotes: from.withdrawn ? votes : undefined };
        });
        const heldAfter = lists.reduce((sum,l) => sum + (l.heldVotes ?? 0), 0);
        s = { ...s, lists, invalid: Math.max(0, s.invalid - heldBefore + heldAfter), agreements: snapshot!.agreements ?? [], factionSplits: snapshot!.factionSplits ?? [] };
      } else {
        need(snapshot!.lists, 'part', M.invalid);
        if (action.listId) need(s.lists.some(l => l.id === action.listId), 'lists', M.unknownList);
        const heldBefore = s.lists.reduce((sum,l) => sum + (l.heldVotes ?? 0), 0);
        s = { ...s, lists: s.lists.map(l => {
          if (action.listId && action.listId !== l.id) return l;
          const from = snapshot!.lists!.find(x => x.id === l.id);
          need(from, 'lists', M.startMismatch);
          if (action.part === 'votes') {
            need(l.withdrawn === from!.withdrawn, 'lists', M.matchWithdrawals);
            return { ...l, votes: from!.votes, heldVotes: from!.heldVotes };
          }
          if (action.part === 'candidates') return withRoster(l, from!);
          return { ...l, nameHe: from!.nameHe, shortHe: from!.shortHe, shortEn: from!.shortEn, letters: from!.letters, color: from!.color };
        }) };
        if (action.part === 'votes') s = { ...s, invalid: Math.max(0, s.invalid - heldBefore + s.lists.reduce((sum,l) => sum + (l.heldVotes ?? 0), 0)) };
        if (action.part === 'candidates') s = withSplits(s, s0, snapshot!.factionSplits);
      }
      break;
    }
    case 'setVotes':
      need(isWhole(action.votes), 'votes', M.votesWhole);
      notWithdrawn(s, action.listId);
      s = replaceList(s, action.listId, (l) => ({ ...l, votes: action.votes }));
      listById(s, action.listId);
      break;
    case 'transfer': {
      need(isWhole(action.votes), 'votes', M.votesWhole);
      need(action.from !== action.to, 'transfer-self', M.twoLists);
      const from = listById(s, action.from); listById(s, action.to);
      notWithdrawn(s, action.from, action.to);
      need(from.votes >= action.votes, 'transfer-exceeds', M.notEnoughVotes(from, from.votes));
      s = replaceList(s, action.from, (l) => ({ ...l, votes: l.votes - action.votes }));
      s = replaceList(s, action.to, (l) => ({ ...l, votes: addVotes(l.votes, action.votes) }));
      break;
    }
    case 'addVoters': {
      if (!action.demographic) {
        need(isWhole(action.invalid), 'votes', M.invalidWhole);
        for (const a of action.allocations) { need(isWhole(a.votes), 'votes', M.votesWhole); listById(s, a.listId); }
        notWithdrawn(s, ...action.allocations.filter((a) => a.votes > 0).map((a) => a.listId));
        for (const a of action.allocations) s = replaceList(s, a.listId, (l) => ({ ...l, votes: addVotes(l.votes, a.votes) }));
        s = { ...s, invalid: addVotes(s.invalid, action.invalid) };
        break;
      }

      const validDelta = Number.isSafeInteger;
      need(validDelta(action.invalid), 'votes', M.invalid);
      need(new Set(action.allocations.map(a => a.listId)).size === action.allocations.length, 'votes', M.invalid);
      for (const a of action.allocations) { need(validDelta(a.votes), 'votes', M.invalid); listById(s, a.listId); }
      notWithdrawn(s, ...action.allocations.filter(a => a.votes !== 0).map(a => a.listId));
      for (const a of action.allocations) s = replaceList(s, a.listId, l => ({ ...l, votes: safeCount(BigInt(l.votes) + BigInt(a.votes)) }));
      s = { ...s, invalid: safeCount(BigInt(s.invalid) + BigInt(action.invalid)) };
      if (action.demographic) need(addVotes(sumVotes(s.lists.map(l => l.votes)), s.invalid) <= s.registered, 'turnout', M.turnoutOver);
      break;
    }
    case 'redistribute': {
      need(isWhole(action.votes), 'votes', M.votesWhole);
      need(new Set(action.from).size === action.from.length, 'redistribute', M.sourceTwice);
      need(action.to.length > 0 && action.to.reduce((t, x) => t + Math.max(0, x.share), 0) > 0, 'redistribute', M.noReceiver);
      need(!action.to.some((t) => action.from.includes(t.listId)), 'redistribute', M.giveAndTake);
      const sources = action.from.map((id) => listById(s, id));
      notWithdrawn(s, ...action.from, ...action.to.map((t) => t.listId));
      const pool = sumVotes(sources.map((l) => l.votes));
      need(pool >= action.votes, 'transfer-exceeds', M.poolTooSmall(pool));
      const take = apportion(action.votes, sources.map((l) => l.votes));
      sources.forEach((l, i) => { s = replaceList(s, l.id, (x) => ({ ...x, votes: x.votes - take[i] })); });
      const give = apportion(action.votes, action.to.map((t) => t.share));
      action.to.forEach((t, i) => { listById(s, t.listId); s = replaceList(s, t.listId, (x) => ({ ...x, votes: addVotes(x.votes, give[i]) })); });
      break;
    }
    case 'scaleAll': {
      need(Number.isFinite(action.factorPct) && action.factorPct >= 0, 'factor', M.scaleNegative);
      const total = sumVotes(s.lists.map((l) => l.votes));
      const target = Math.round(total * (action.factorPct / 100));
      const parts = apportion(target, s.lists.map((l) => l.votes));
      s = { ...s, lists: s.lists.map((l, i) => ({ ...l, votes: parts[i] })) };
      break;
    }
    case 'merge': {
      need(new Set(action.ids).size === action.ids.length && action.ids.length >= 2, 'merge-size', M.mergeTwo);
      need(!s.lists.some((l) => l.id === action.newId && !action.ids.includes(l.id)), 'duplicate-id', M.listExists);
      need(Number.isFinite(action.retentionPct), 'retention', M.retention);
      need(action.retentionPct >= 0 && action.retentionPct <= 100, 'retention', M.retention);
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
        synthetic: { kind: 'merge', parts: parts.flatMap(p => p.synthetic?.kind === 'merge' ? p.synthetic.parts : [{ letters: p.letters, color: p.color }]) },
        votes: kept, withdrawn: false, candidates, sponsorsHe: parts.map((p) => p.sponsorsHe).filter(Boolean).join('; '),
        ...rosterFlags(parts), ...partiesOf(parts.flatMap((p) => p.parties ?? []), candidates),
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
      need(action.parts.length >= 2, 'split-size', M.splitTwo);
      need(new Set(action.parts.map((p) => p.newId)).size === action.parts.length, 'duplicate-id', M.newListsDiffer);
      need(!action.parts.some((p) => s.lists.some((l) => l.id === p.newId && l.id !== action.id)), 'duplicate-id', M.listExists);
      const sum = sumVotes(action.parts.map((p) => p.votes));
      for (const p of action.parts) need(isWhole(p.votes), 'votes', M.votesWhole);
      need(sum <= orig.votes, 'split-exceeds', M.splitOver(sum, orig.votes));
      need(sum === orig.votes, 'split-total', M.splitTotal);
      const used = new Set<string>();
      const byId = new Map<string, SimCandidate>();
      for (const c of orig.candidates) if (!byId.has(c.id)) byId.set(c.id, c);
      for (const p of action.parts) for (const cid of p.candidateIds) {
        need(byId.has(cid), 'split-candidate', M.splitStranger);
        need(!used.has(cid), 'split-candidate', M.splitTwice);
        used.add(cid);
      }
      const newLists: SimList[] = action.parts.map((p, i) => ({
        synthetic: { kind: 'split', parts: [{ letters: orig.letters, color: orig.color }], part: i + 1, total: action.parts.length },
        id: p.newId, originIds: orig.originIds, letters: p.letters, nameHe: p.nameHe, shortHe: p.nameHe, shortEn: orig.parties?.find(q => q.nameHe === p.nameHe)?.nameEn ?? null, color: p.color,
        ...(orig.parties?.find(q => q.nameHe === p.nameHe)?.logo ? {logo: orig.parties.find(q => q.nameHe === p.nameHe)!.logo} : {}),
        bloc: orig.bloc, votes: p.votes, withdrawn: false, sponsorsHe: orig.sponsorsHe,
        candidates: p.candidateIds.map((cid) => byId.get(cid)!),
        ...rosterFlags([orig]), ...partiesOf(orig.parties ?? [], p.candidateIds.map((cid) => byId.get(cid)!)),
      }));
      const idx = s.lists.findIndex((l) => l.id === action.id);
      const lists = [...s.lists]; lists.splice(idx, 1, ...newLists);
      s = { ...s, lists, agreements: s.agreements.filter((a) => !a.members.includes(action.id)) };
      break;
    }
    case 'addList':
      need(isWhole(action.votes), 'votes', M.votesWhole);
      need(!s.lists.some((l) => l.id === action.newId), 'duplicate-id', M.listExists);
      // a new list is its own lineage, so comparisons and later merges/splits can follow it
      s = { ...s, lists: [...s.lists, { id: action.newId, synthetic: { kind: 'new', parts: [] }, originIds: [action.newId], letters: action.letters, nameHe: action.nameHe, shortHe: action.nameHe, shortEn: null, color: action.color, bloc: null, votes: action.votes, withdrawn: false, candidates: [], sponsorsHe: '' }] };
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
      // moving a list to another bloc makes the grouping the user's own
      if ('bloc' in action.patch && s.blocSchemes) s = { ...s, blocSchemeId: null };
      break;
    case 'setAgreement': {
      const { members } = action.agreement;
      for (const m of members) listById(s, m);
      need(members.length >= 2 && new Set(members).size === members.length, 'agreement-members', M.agreementMembers);
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
      need(Array.isArray(action.candidates), 'candidates', M.invalid);
      const ids = new Set<string>();
      for (const c of action.candidates) { need(c.nameHe.trim().length > 0, 'candidate-name', M.candidateName); need(!ids.has(c.id), 'candidate-dup', M.candidateTwice); ids.add(c.id); }
      s = replaceList(s, action.listId, (l) => ({ ...l, candidates: action.candidates as SimCandidate[],
        // an imported roster brings its constituent parties and completeness flags with it
        ...(action.parties !== undefined ? { parties: action.parties.length ? action.parties.map((p) => ({ ...p })) : undefined } : {}),
        ...(action.rosterUnavailable !== undefined ? { rosterUnavailable: action.rosterUnavailable || undefined } : {}),
        ...(action.rosterTruncated !== undefined ? { rosterTruncated: action.rosterTruncated || undefined } : {}) }));
      break;
    }
    case 'copyFrom': {
      // concrete inner steps, already computed from the source: replay never needs the other side
      need(validAction(action), 'copy', M.invalid);
      for (const a of action.actions) s = applyAction(s, a, now, ctx);
      s = { ...s, log: s0.log };
      break;
    }
    case 'setRules':
      need(s.mode === 'experimental', 'historical-rules', M.rulesByLaw);
      if (action.patch.seats !== undefined) need(Number.isInteger(action.patch.seats) && action.patch.seats >= 1 && action.patch.seats <= 1000, 'seats', M.seats);
      if (action.patch.thresholdPct !== undefined) need(/^\d+(\.\d+)?$/.test(action.patch.thresholdPct) && Number(action.patch.thresholdPct) <= 100, 'threshold', M.threshold);
      if (action.patch.maxAgreementSize !== undefined) need(Number.isInteger(action.patch.maxAgreementSize) && action.patch.maxAgreementSize >= 2, 'agreement-size', M.agreementSize);
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
        // the law's rules, never the reset context's (which may be a saved experiment): preview and commit agree
        s = { ...s, mode: 'historical', rules: historicalRules(electionRuleSetId(s.electionId)), agreements: s.agreements.map((a) => (disabled.has(a.id) ? { ...a, enabled: false } : a)) };
      } else s = { ...s, mode: 'experimental' };
      break;
    case 'setTotals':
      if (action.registered !== undefined) need(isWhole(action.registered), 'votes', M.registeredWhole);
      if (action.invalid !== undefined) need(isWhole(action.invalid), 'votes', M.invalidWhole);
      s = { ...s, registered: action.registered ?? s.registered, invalid: action.invalid ?? s.invalid };
      break;
    case 'setBlocs': {
      const keep = (b: string | null) => (b && action.blocs.some((x) => x.id === b) ? b : null);
      const prune = (m?: Record<string, string | null>) => (m ? Object.fromEntries(Object.entries(m).map(([k, v]) => [k, keep(v)])) : m);
      s = { ...s, customGroupingName: action.name ?? s.customGroupingName, blocs: action.blocs, blocSchemeId: s.blocSchemes ? null : s.blocSchemeId, partyBlocs: prune(s.partyBlocs), candidateBlocs: prune(s.candidateBlocs),
        lists: s.lists.map((l) => (l.bloc && !keep(l.bloc) ? { ...l, bloc: null } : l)) };
      if (action.unassignAll) s = { ...s, blocSchemeId: null, partyBlocs: {}, candidateBlocs: {}, lists: s.lists.map(l => ({ ...l, bloc: null })) };
      break;
    }
    case 'applyBlocScheme': {
      const scheme = s.blocSchemes?.find((x) => x.id === action.schemeId);
      need(scheme, 'unknown-scheme', M.noScheme);
      // lists created by merges/splits take the bloc their origin lists share in the scheme (blocSchemeState)
      const st = blocSchemeState(scheme!, s.lists);
      s = { ...s, customGroupingName: undefined, blocSchemeId: scheme!.id, blocs: st.blocs, partyBlocs: st.partyBlocs, candidateBlocs: st.candidateBlocs,
        lists: s.lists.map((l) => ({ ...l, bloc: st.listBloc[l.id] })) };
      break;
    }
    case 'setPartyBloc': {
      need(s.lists.some((l) => l.parties?.some((p) => p.id === action.partyId)), 'unknown-party', M.noParty);
      need(action.bloc === null || s.blocs.some((b) => b.id === action.bloc), 'unknown-bloc', M.noBloc);
      const partyBlocs = { ...s.partyBlocs };
      if (action.inherit) delete partyBlocs[action.partyId]; else partyBlocs[action.partyId] = action.bloc;
      s = { ...s, blocSchemeId: s.blocSchemes ? null : s.blocSchemeId, partyBlocs };
      break;
    }
    case 'setFactionSplit': {
      const l = listById(s, action.listId);
      need((l.parties?.length ?? 0) >= 2, 'not-joint', M.notJoint);
      const rest = (s.factionSplits ?? []).filter((id) => id !== l.id);
      s = { ...s, factionSplits: action.split ? [...rest, l.id] : rest };
      break;
    }
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
      // the historical bloc only if the current grouping still has it (another grouping may be in use)
      const fixBloc = (l: SimList): SimList => (l.bloc === null || s.blocs.some((b) => b.id === l.bloc) ? l : { ...l, bloc: cur?.bloc ?? null });
      if (restored) s = s.lists.some((l) => l.id === action.listId) ? replaceList(s, action.listId, () => fixBloc(restored)) : { ...s, lists: [...s.lists, fixBloc(restored)] };
      else s = pruneAgreements({ ...s, lists: s.lists.filter((l) => l.id !== action.listId) });
      break;
    }
    case 'resetVotes': {
      const b = baseList(action.listId);
      need(b, 'no-base', M.notInOfficial);
      listById(s, action.listId);
      notWithdrawn(s, action.listId);
      s = replaceList(s, action.listId, (l) => ({ ...l, votes: b!.votes }));
      break;
    }
    case 'resetCandidates': {
      const b = baseList(action.listId);
      need(b, 'no-base', M.notInOfficial);
      listById(s, action.listId);
      s = withSplits(replaceList(s, action.listId, (l) => withRoster(l, b!)), s0, ctx.base!.factionSplits ?? []);
      break;
    }
    case 'setDescription':
      s = { ...s, description: action.description || undefined };
      break;
    case 'rename':
      s = { ...s, name: action.name };
      break;
    case 'setTurnout': {
      need(action.pct > 0 && action.pct <= 100, 'turnout', M.turnoutRange);
      const valid = sumVotes(s.lists.map((l) => l.votes));
      const cast = addVotes(valid, s.invalid);
      need(cast > 0, 'turnout', M.noVotes);
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
        need(src, 'no-base', M.noOfficial);
        const ids = new Set(s.lists.map((l) => l.id));
        s = { ...s, agreements: src!.filter((a) => a.members.every((m) => ids.has(m))).map((a) => ({ ...a, members: [...a.members] })) };
      } else if (action.what === 'totals') {
        const reg = B?.registered ?? action.registered, inv = B?.invalid ?? action.invalid;
        need(reg !== undefined && inv !== undefined, 'no-base', M.noOfficial);
        s = { ...s, registered: reg!, invalid: inv! };
      } else if (action.what === 'blocs') {
        const blocs = B?.blocs ?? action.blocs;
        const listBlocs = B ? Object.fromEntries(B.lists.map((l) => [l.id, l.bloc])) : action.listBlocs;
        need(blocs && listBlocs, 'no-base', M.noOfficial);
        s = { ...s, blocs: blocs!, lists: s.lists.map((l) => (l.id in listBlocs! ? { ...l, bloc: listBlocs![l.id] } : l)),
          ...(B ? { customGroupingName: B.customGroupingName, blocSchemeId: B.blocSchemeId, partyBlocs: B.partyBlocs, candidateBlocs: B.candidateBlocs } : {}) };
      } else s = { ...s, lotteryWinners: {} };
      break;
    }
  }
  if(action.type==='resetList'||action.type==='restore'||action.type==='startPart'||action.type==='resetCandidates') {
    s={...s,lists:s.lists.map(l=>{const old=s0.lists.find(x=>x.id===l.id);return old?{...l,color:old.color,...(l.parties?{parties:l.parties.map(p=>{const color=old.parties?.find(x=>x.id===p.id)?.color;return color?{...p,color,customColor:old.parties?.find(x=>x.id===p.id)?.customColor}:p;})}:{})}:l;}),blocs:s.blocs.map(b=>({...b,color:s0.blocs.find(x=>x.id===b.id)?.color??b.color}))};
  }
  // All transitions, including resets/restores, must keep both counts and derived totals exact.
  need(isWhole(s.registered) && isWhole(s.invalid), 'votes', M.votesRange);
  addVotes(sumVotes(s.lists.map((l) => l.votes)), s.invalid);
  const next = { ...s, log: [...s0.log, { at: now, action }] };
  recordEditScope(s0,next,action);
  return next;
}
