import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { applyMeta } from '../scripts/lib/build/meta.ts';

const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'));

test('all 26 elections: the complete elected joint-list party gap inventory', () => {
  const gaps: string[] = [];
  for (let n = 1; n <= 26; n++) {
    const d = read(`public/data/k${n}.json`) as ElectionDataset;
    const meta = read(`data/meta/k${n}.json`);
    for (const l of d.lists.filter(l => (l.parties?.length ?? 0) > 1)) {
      // Match the family runtime: preserve original ranks and omit candidates never seated.
      const elected = l.candidates.filter(c => !c.notSeated).slice(0, d.officialSeats?.[l.id] ?? 0);
      for (const c of elected.filter(c => !c.partyId)) {
        gaps.push(c.id);
        const evidence = meta.lists.find((m: { letters: string }) => m.letters === l.letters)
          ?.unassignedEvidence?.find((e: { rank: number }) => e.rank === c.rank);
        expect(evidence, c.id).toMatchObject({ status: 'unknown', reviewed: '2026-11-09' });
        expect(evidence.reason.length).toBeGreaterThan(50);
        expect(evidence.evidenceNeeded.length).toBeGreaterThan(50);
        expect(evidence.sources.some((s: { kind: string }) => s.kind === 'official')).toBe(true);
      }
    }
  }
  expect(gaps).toEqual(['9-ו#5', '15-עם#3']);
});

test('1999 UAL: four sourced constituent assignments; Mahameed is never assigned from a later faction', () => {
  const d = read('public/data/k15.json') as ElectionDataset;
  const meta = read('data/meta/k15.json').lists.find((l: { letters: string }) => l.letters === 'עם');
  const rebuilt = applyMeta(d).lists.find(l => l.id === '15-עם')!;
  expect(rebuilt.candidates.map(c => [c.rank, c.partyId ?? null])).toEqual([
    [1, 'ram'], [2, 'arab-democratic-party'], [3, null], [4, 'ram'], [5, 'arab-democratic-party'],
  ]);
  expect(meta.unassignedRanks).toEqual([3]);
  const groups = meta.parties.flatMap((p: { evidenceGroups: { candidateRanks: number[]; confidence: string }[] }) => p.evidenceGroups);
  expect(groups.map((g: { candidateRanks: number[] }) => g.candidateRanks).flat().sort()).toEqual([1, 2, 4, 5]);
  expect(groups.map((g: { confidence: string }) => g.confidence)).toEqual(['high', 'high', 'medium', 'high']);
  expect(meta.unassignedEvidence[0].sources.some((s: { url: string }) => s.url.includes('FactionID=687'))).toBe(true);
});

test('1977 Mwais: faction membership is preserved without inventing Rakah membership', () => {
  const d = read('public/data/k9.json') as ElectionDataset;
  const meta = read('data/meta/k9.json').lists.find((l: { letters: string }) => l.letters === 'ו');
  expect(meta.unassignedRanks).toContain(5);
  expect(applyMeta(d).lists.find(l => l.id === '9-ו')!.candidates.find(c => c.rank === 5)?.partyId).toBeUndefined();
});
