import { readFileSync } from 'node:fs';
import { GOVERNMENT_SUPPORT_ROLES, CONFIDENCE_VOTE_KEYS, type GovernmentSupport, type GovernmentParticipant, type GovernmentIndividual } from '../../../src/data/aftermath.ts';
import { ELECTION_IDS } from '../../../src/data/schema.ts';
import { checker, whole, type Check } from './validate.ts';
import { CERTAINTIES } from '../../../src/data/evidence.ts';
import { validateEvidenceDocument } from './evidence.ts';
/** A recorded vote tally: whole numbers within the chamber, and no key the screen does not read. */
export function validTally(v: unknown) {
  if (!v || typeof v !== 'object') return false;
  const t = v as Record<string, unknown>;
  return Object.keys(t).every(k => (CONFIDENCE_VOTE_KEYS as readonly string[]).includes(k) && whole(t[k] as number)) && whole(t.for as number) && whole(t.against as number)
    && CONFIDENCE_VOTE_KEYS.reduce((n, k) => n + ((t[k] as number | undefined) ?? 0), 0) <= 120;
}
type Bloc = { id: string; seats?: number; members: { letters: string }[] };
const ROUND_KEY_OF_BLOC: Record<string, string> = { unstated: 'unknown', 'not-invited': 'other' };
/** A recommendation round and the sourced grouping it references (data/meta/kN.json blocSchemes, `blocSchemeRef`)
 *  must put every list in the same place, and every bloc must carry the round's seats (c-aftermath-01). Bloc ids
 *  are the round's nominee or status keys; the grouping's 'unstated' and 'not-invited' are the round's 'unknown'
 *  and 'other'. A list whose MKs recommended differently sits in one bloc per part. Returns the disagreements. */
export function groupingDisagreements(round: { id: string; blocSchemeRef?: string; totals: Record<string, number>; entries: { letters: string; nominee?: string; status?: string; split?: { nominee?: string; status?: string }[] }[] }, schemes: { id: string; blocs: Bloc[] }[]) {
  if (!round.blocSchemeRef) return [];
  const scheme = schemes.find(s => s.id === round.blocSchemeRef);
  if (!scheme) return [`${round.id}: grouping ${round.blocSchemeRef} not found`];
  const keyOf = (b: Bloc) => ROUND_KEY_OF_BLOC[b.id] ?? b.id;
  const inGrouping = new Map<string, string[]>();
  for (const b of scheme.blocs) for (const m of b.members) inGrouping.set(m.letters, [...inGrouping.get(m.letters) ?? [], keyOf(b)]);
  const out: string[] = [];
  const set = (keys: string[]) => [...new Set(keys)].sort().join(' + ');
  for (const e of round.entries) {
    const said = set((e.split ?? [e]).map(p => p.nominee ?? p.status ?? 'unknown'));
    if (said !== set(inGrouping.get(e.letters) ?? [])) out.push(`${round.id}/${e.letters}: round says ${said}, grouping says ${set(inGrouping.get(e.letters) ?? []) || 'nothing'}`);
    inGrouping.delete(e.letters);
  }
  for (const letters of inGrouping.keys()) out.push(`${round.id}/${letters}: in the grouping but not in the round`);
  for (const b of scheme.blocs) if (b.seats !== undefined && b.seats !== round.totals[keyOf(b)]) out.push(`${round.id}/${b.id}: grouping has ${b.seats} seats, round ${round.totals[keyOf(b)] ?? 0}`);
  return out;
}
const member = (r: { role: string }) => r.role === 'member-with-ministries' || r.role === 'member-without-ministries';
export function validateGovernmentSupport(value: unknown, sources: Record<string, unknown>, label: string) {
  const check: Check = checker(label);
  const g = value as GovernmentSupport;
  check(Array.isArray(g.coalition), 'missing coalition');
  const individuals = g.individuals ?? [];
  const rows = [...g.coalition, ...individuals];
  for (const r of rows) {
    check(GOVERNMENT_SUPPORT_ROLES.includes(r.role), 'missing or invalid role');
    check(CERTAINTIES.includes(r.certainty), 'missing role certainty');
    check(r.certainty === 'confirmed' || Boolean(r.note?.trim()), 'uncertain role needs explanation');
    check(r.role !== 'other' || Boolean(r.note?.trim()), 'other role needs explanation');
    check(Array.isArray(r.cites) && (r.certainty === 'unknown' || r.cites.length > 0), 'classification needs evidence');
    for (const c of r.cites) check(c.quote?.trim() && Object.hasOwn(sources, c.source), 'unknown citation source or empty quote');
  }
  check(g.coalition.every(r => (whole(r.seats) || r.seats === null) && (r.letters || r.factionNameHe)), 'invalid faction seats or identity');
  check(['complete', 'partial'].includes(g.membershipCoverage), 'missing membership coverage');
  if (g.membershipCoverage === 'complete') check(g.coalition.length > 0 && g.coalition.every(r => r.certainty !== 'unknown' && r.seats !== null), 'complete membership has unresolved roles or seats');
  else check(g.coalitionSeats === null && g.supportSeats === null, 'partial membership cannot publish complete totals');
  const keys = g.coalition.map(r => `${r.letters}:${r.factionNameHe ?? ''}`);
  check(new Set(keys).size === keys.length, 'duplicate faction');
  check(new Set(individuals.map(r => r.id)).size === individuals.length, 'duplicate individual');
  for (const r of individuals) {
    check(r.id && r.nameEn && r.nameHe && r.fromLetters && typeof r.countedInFactionSeats === 'boolean', 'invalid individual');
    check(['for', 'against', 'abstain', 'absent', 'unknown'].includes(r.vote), 'missing individual vote');
    if (r.countedInFactionSeats) check(g.coalition.some(f => f.letters === r.fromLetters), 'individual exception without faction');
  }
  const extra = individuals.filter(r => !r.countedInFactionSeats);
  const total = (predicate: (r: GovernmentParticipant | GovernmentIndividual) => boolean) => {
    const selected = g.coalition.filter(predicate);
    check(selected.every(r => r.seats !== null), 'unknown seats cannot produce a total');
    return selected.reduce((s, r) => s + r.seats!, 0) + extra.filter(predicate).length;
  };
  if (g.coalitionSeats !== null) check(whole(g.coalitionSeats) && g.coalitionSeats === total(member), 'member seats do not reconcile');
  if (g.supportSeats !== null) check(whole(g.supportSeats) && g.supportSeats === total(r => r.role === 'outside-support'), 'outside-support seats do not reconcile');
  check(g.reconciliation && ['exact', 'explained', 'unresolved', 'vote-unavailable'].includes(g.reconciliation.status) && g.reconciliation.note.trim(), 'missing reconciliation');
  if (g.confidenceVote) {
    check(validTally(g.confidenceVote), 'invalid confidence tally (whole numbers; keys for, against, abstain, absent only)');
    if (g.reconciliation.expectedFor !== undefined) {
      const supportive = (r: { role: string }) => member(r) || r.role === 'outside-support' || r.role === 'confidence-vote-only';
      check(!individuals.some(r => supportive(r) && r.vote === 'unknown'), 'unknown individual vote cannot support an exact reconciliation');
      const exceptions = individuals.filter(r => supportive(r) && ['against', 'abstain', 'absent'].includes(r.vote)).length;
      const expected = total(supportive) - exceptions;
      check(g.reconciliation.expectedFor === expected && expected === g.confidenceVote.for, 'confidence reconciliation differs from recorded vote');
    }
  } else check(g.reconciliation.status === 'vote-unavailable', 'absent vote must be explicit');
}
/** Overlay is validated separately from election datasets; no research data is promoted into UI. */
export function validateAftermathRecords(root = 'data/meta/aftermath') {
  let governments = 0;
  for (const id of ELECTION_IDS) {
    const d = JSON.parse(readFileSync(`${root}/${id}.json`, 'utf8'));
    validateEvidenceDocument(d, `${root}/${id}.json`);
    const fail = (msg: string) => { throw new Error(`${id}: ${msg}`); };
    const schemes = JSON.parse(readFileSync(`${root}/../${id}.json`, 'utf8')).blocSchemes ?? [];
    for (const round of d.recommendationRounds) for (const problem of groupingDisagreements(round, schemes)) fail(`recommendations and grouping disagree, ${problem}`);
    const named = { ...Object.assign({}, ...d.recommendationRounds.map((r: any) => r.nominees)), ...d.formation.people };
    for (const e of d.formation.events) {
      if (e.votes !== undefined && !validTally(e.votes)) fail(`${e.date}: invalid vote tally ${JSON.stringify(e.votes)}`);
      if (e.type === 'mandate-given' && !(e.person && named[e.person])) fail(`${e.date}: the person tasked has no name for the chart (formation.people)`);
      if (/extension/.test(e.type ?? '') && e.days !== undefined && !(e.days > 0)) fail(`${e.date}: an extension of ${e.days} days is not an extension`);
    }
    if (!d.government) continue;
    for (const p of d.government.primeMinisters) {
      if (/[()]/.test(p.nameEn + p.nameHe)) fail(`prime minister ${p.nameEn}: a role belongs in role/titleEn/titleHe, not in the name`);
      if (p.role !== undefined && !(['acting', 'interim'].includes(p.role) && p.titleEn && p.titleHe && p.cites?.length)) fail(`prime minister ${p.nameEn}: role ${p.role} needs titleEn, titleHe and cites`);
    }
    for (const g of [d.government, ...(d.government.changes ?? []).filter((c: any) => c.coalition)]) {
      validateGovernmentSupport(g, d.sources, `${id}/government-${g.number ?? 'change'}`); governments++;
    }
    const recorded = [d.government.number, ...(d.government.changes ?? []).filter((c: any) => c.number && c.coalition).map((c: any) => c.number)];
    for (const c of (d.government.changes ?? []).filter((c: any) => c.type === 'government-succession' && c.governmentNumber)) {
      if (!recorded.includes(c.governmentNumber)) throw new Error(`${id}: successor government ${c.governmentNumber} lacks explicit role coverage`);
    }
    for (const e of d.formation.events.filter((e: any) => e.type === 'confidence-vote' && e.governmentNumber)) {
      if (!recorded.includes(e.governmentNumber)) throw new Error(`${id}: government ${e.governmentNumber} lacks explicit role coverage`);
    }
  }
  return governments;
}
