import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const k24 = read('data/research/knesset-events/k24.json');
const k25 = read('data/research/knesset-events/k25.json');
const changes = read('data/research/knesset-member-changes/k25.json');
const event = (doc: typeof k25, id: string) => doc.events.find((e: any) => e.id === id);

describe('official Knesset records recovered on 12 November', () => {
  test('every positive-duration K25 entry is represented once; the zero-length Malul row is excluded', () => {
    for (const [i, change] of changes.replacements.entries()) {
      if (change.kind !== 'entryEpisode') continue;
      const tenure = changes.tenures.find((t: any) => t.id === change.enteringTenureId);
      const references = k25.events.filter((e: any) => e.replacement?.memberChangesRefs?.some((r: any) => r.pointer === `/replacements/${i}`));
      expect(references.length, `tenure ${tenure.id}`).toBe(tenure.start === tenure.end ? 0 : 1);
    }
  });
  test('revised budget separates the actual vote from Edelstein’s recorded intention', () => {
    const e = event(k25, 'k25-budget2023-revised');
    expect([e.vote.for, e.vote.against, e.vote.abstain]).toEqual([59, 45, 0]);
    expect(e.certainty).toBe('confirmed');
    expect(e.marker).toBeNull();
    expect(e.vote.crossVotes).toEqual([]);
  });
  test('citizenship-law dissent is nine individual votes, with continuing support unchanged', () => {
    const e = event(k24, 'k24-citizenship-final-reading');
    expect(e.markerPersonIds).toEqual([511, 23653, 30713, 30752, 30758, 30803, 30805, 30818, 30821]);
    expect(e.vote.crossVotes).toHaveLength(9);
    expect(e.vote.crossVotes.every((v: any) => v.vote === 'against')).toBe(true);
    expect(e.marker).toBe('D3');
    expect(e.seatsAfter).toBeNull();
  });
  test('retained-profits final vote is 59–58 and six named dissenters, excluding Almog Cohen and Eichler', () => {
    const e = event(k25, 'k25-retained-profits-tax');
    expect([e.vote.for, e.vote.against]).toEqual([59, 58]);
    expect(e.markerPersonIds).toEqual([30671, 30811, 30847, 30849, 30859, 30867]);
    expect(e.markerPersonIds).not.toContain(30833);
    expect(e.markerPersonIds).not.toContain(1057);
  });
  test('unverified reasons stay unknown and replacements do not assign government support', () => {
    const additions = k25.events.filter((e: any) => e.id.startsWith('k25-replacement-'));
    expect(additions).toHaveLength(18);
    expect(additions.every((e: any) => e.seatsAfter === null && e.supportEffect === 'none-established')).toBe(true);
    const mixed = event(k25, 'k25-replacement-2025-07-20-שס');
    expect(mixed.replacement.reason).toBe('unknown');
    expect(mixed.replacement.enteringPersonIds).toHaveLength(3);
    expect(mixed.replacement.leavingPersonIds).toHaveLength(3);
  });
});
