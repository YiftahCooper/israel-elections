import { describe, it, expect } from 'vitest';
import { readFamilyBundle, validateFamilies } from '../scripts/validate-families.ts';
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
