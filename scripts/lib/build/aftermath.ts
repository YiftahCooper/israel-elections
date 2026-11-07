import { readFileSync } from 'node:fs';
import { GOVERNMENT_SUPPORT_ROLES, type GovernmentSupport, type GovernmentParticipant, type GovernmentIndividual } from '../../../src/data/aftermath.ts';
import { ELECTION_IDS } from '../../../src/data/schema.ts';
import { checker, whole, type Check } from './validate.ts';
import { CERTAINTIES } from '../../../src/data/evidence.ts';
import { validateEvidenceDocument } from './evidence.ts';
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
    check(whole(g.confidenceVote.for) && whole(g.confidenceVote.against) && whole(g.confidenceVote.abstain ?? 0), 'invalid confidence tally');
    check(g.confidenceVote.for + g.confidenceVote.against + (g.confidenceVote.abstain ?? 0) <= 120, 'confidence tally exceeds chamber');
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
    if (!d.government) continue;
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
