import { describe, it, expect } from 'vitest';
import { readFamilyBundle, validateFamilies } from '../scripts/validate-families.ts';
import { readRelations } from '../src/history/relations.ts';
const original = readFamilyBundle();
describe('sourced party registry and family research', () => {
  it('resolves all lists, parties, lineage and sources and independently reconciles every total', () => {
    expect(() => validateFamilies(original)).not.toThrow();
  });
  it.each(['duplicate', 'total', 'mixed', 'source', 'party', 'cycle'] as const)('rejects corrupted %s evidence', kind => {
    const b = structuredClone(original), r = b.families.find(f => f.id === 'haredi')!.elections[0];
    if (kind === 'duplicate') r.members.push(structuredClone(r.members[0]));
    if (kind === 'total') r.computed.includedUnmixed.votes++;
    if (kind === 'mixed') r.members.find(m => m.treatment === 'separate-segment')!.treatment = 'include';
    if (kind === 'source') r.members[0].classificationEvidence.sourceIds = ['missing'];
    if (kind === 'party') r.members[0].partyIds = ['missing'];
    if (kind === 'cycle') {
      const edge = structuredClone(b.lineage.edges[0]);
      edge.id = 'corrupt-cycle'; edge.from = [...edge.to]; edge.to = ['mapai']; edge.date = '2000'; edge.datePrecision = 'year';
      b.lineage.edges.push(edge);
    }
    expect(() => validateFamilies(b)).toThrow();
  });
});

// Audit 12 Nov (ax-build-guesses-05): a pending item may be weaker evidence, never a way past the structure checks, and a
// proposed relation that passes must reach the app (readRelations skips what it cannot read, without a word).
describe('pending lineage items', () => {
  const relation = { id: 'audit-pending', from: ['likud'], to: ['labor'], relation: 'merged-into', date: '1990', datePrecision: 'year',
    sources: ['mergers'], evidence: { status: 'unresolved', interpretation: 'test' }, certainty: 'unknown' };
  const withPending = (item: object) => { const b = structuredClone(original); (b.lineage as unknown as { pending: object[] }).pending.push(item); return b; };
  it('accepts a well-formed proposed relation and the stored open checks', () => {
    expect(() => validateFamilies(withPending(relation))).not.toThrow();
    expect(() => validateFamilies(withPending({ ...relation, relation: undefined, date: undefined, datePrecision: undefined }))).not.toThrow();
  });
  it.each([
    ['the audit example', { id: 'broken-audit', from: ['likud'], to: ['missing-party-audit'], relation: 'invented-relation', date: 'not-a-date', sources: [] }],
    ['an unknown relation', { ...relation, relation: 'invented-relation' }],
    ['an unknown party', { ...relation, to: ['missing-party-audit'] }],
    ['one end only', { ...relation, to: [] }],
    ['a bad date', { ...relation, date: 'not-a-date' }],
    ['no sources', { ...relation, sources: [] }],
    ['an unknown source', { ...relation, sources: ['missing-source'] }],
    ['no evidence', { ...relation, evidence: undefined }],
    ['an unknown certainty', { ...relation, certainty: 'sure' }],
    ['a duplicate id', { ...relation, id: 'labor-1968' }],
    ['an open check on an unknown party', { id: 'audit-open', partyIds: ['missing-party-audit'], sources: ['mergers'], evidence: { status: 'unresolved', interpretation: 't' }, certainty: 'unknown' }],
  ])('rejects %s', (_, item) => {
    expect(() => validateFamilies(withPending(item))).toThrow();
  });
  it('the app reads every stored edge and every proposed relation', () => {
    const lineage = original.lineage as unknown as Parameters<typeof readRelations>[0];
    const proposed = lineage.pending.filter((p) => p.from || p.to || p.relation);
    expect(readRelations(lineage).map((r) => r.id).sort()).toEqual([...lineage.edges, ...proposed].map((e) => e.id).sort());
  });
});
