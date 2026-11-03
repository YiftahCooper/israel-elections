import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildK8, verifyK8 } from '../scripts/lib/historical/k8.ts';
import { researchDataset } from '../scripts/lib/historical/k8-k12-common.ts';
import { allocate } from '../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput, validateScenario } from '../src/model/scenario.ts';

// Independently read from YP 1979, p. 608 (letters as printed there; decision 0077).
// Zero seats for every other gazetted list; never calculated expectations.
const published: Record<string, number> = { 'אמת': 51, 'ב': 10, 'גד': 5, 'ו': 4, 'חל טעם': 39, 'לע': 4, 'עא': 1, 'קנ': 1, 'רא': 2, 'רצ': 3 };
// CEC Form 30 appendix, section ז, printed pp. 10–11, re-read by the parent from the scan.
const connections = [['ב', 'גד'], ['חל טעם', 'ער'], ['סנ', 'ענ'], ['קנ', 'ז'], ['רא', 'עא'], ['לע', 'רצ']];

describe('k8 (1973) — released on the official list connections', () => {
  it('reconciles every national vote with the gazette and CBS totals', () => {
    const { review: r } = verifyK8({ log: false });
    expect(r.lists).toHaveLength(21);
    expect(r.lists.reduce((s, l) => s + l.gazetteVotes, 0)).toBe(1566855);
    expect(r.gazetteTotals).toMatchObject({ valid: 1566855, invalid: 34243 });
    expect(r.supplementalTotals).toMatchObject({ registered: 2037478, votesCast: 1601098 });
    for (const l of r.lists) expect(l.officialSeats, l.letters).toBe(published[l.letters] ?? 0);
  });
  it('uses the corrected ballot letters from the notices', () => {
    const letters = verifyK8({ log: false }).review.lists.map((l) => l.letters);
    expect(letters).toEqual(expect.arrayContaining(['לע', 'סנ', 'רה']));
    expect(letters).not.toEqual(expect.arrayContaining(['ל']));
    expect(letters.includes('סז') || letters.includes('רם')).toBe(false);
  });
  it('retains exactly the six sourced connections', () => {
    const a = verifyK8({ log: false }).review.agreements;
    expect(a).toMatchObject({ sourceId: 'k8-cec-memorandum-appendix', page: 10, complete: true });
    expect(a.pairs).toEqual(connections);
  });
  it('reproduces every official seat through the application pipeline', () => {
    const a = verifyK8({ log: false });
    const s = scenarioFromDataset(researchDataset(a));
    expect(validateScenario(JSON.parse(JSON.stringify(s)))).toEqual([]);
    const result = allocate(toEngineInput(s));
    expect(result.thresholdVotes).toBe(15669n);
    expect(result.quota).toEqual({ num: 12424n, den: 1n });
    expect(result.seatsAllocated).toBe(120);
    expect(result.warnings).toEqual([]);
    for (const l of result.lists) expect(l.seats, l.id).toBe(published[l.id.slice(2)] ?? 0);
    expect(a.review.allocationCheck).toMatchObject({ exact: true, differences: [] });
    // the CEC's own within-pair splits (printed pp. 16–18)
    const pair = (x: string, y: string) => result.agreements.find((g) => g.members.includes(`8-${x}`) && g.members.includes(`8-${y}`));
    expect(pair('ב', 'גד')?.active).toBe(true);
    expect(pair('לע', 'רצ')?.active).toBe(true);
    expect(pair('רא', 'עא')?.active).toBe(true);
  });
  it('is release-ready, with every elected member cross-checked', () => {
    const a = verifyK8({ log: false });
    expect(a.releaseReady).toBe(true);
    expect(a.review.candidateChecks.completeWinningRostersVerified).toBe(true);
    const seated = a.rosters.reduce((t, r) => t + (r.electedCrossCheck?.namesHe?.length ?? 0), 0);
    expect(seated).toBe(120);
    expect(buildK8({ log: false })).toHaveLength(1);
    const ds = JSON.parse(readFileSync('public/data/k8.json', 'utf8'));
    expect(ds.hasLocalities).toBe(false);
    expect(ds.agreements).toHaveLength(6);
  });
});
