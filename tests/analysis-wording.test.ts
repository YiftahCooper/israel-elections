// The analysis tools say "at most", "could be missed" or "?" only where the answer is in fact open (audit 12 Nov 2026,
// c-analysis-code-01 and -03; -02 is in tests/exactness.test.ts).
import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { allocate } from '../src/engine/allocate.ts';
import type { VoteSource } from '../src/engine/analysis.ts';
import { runTask, type AnalysisTask, type TransferOutcome } from '../src/app/analysisTasks.ts';
import { scenarioFromDataset, toEngineInput } from '../src/model/scenario.ts';

const load = (id: string) => JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8')) as ElectionDataset;

test('c-analysis-code-01: 2022 coalition bloc: the open pairs, searched again below the best answer, settle it as exact', () => {
  const s = scenarioFromDataset(load('k25')), input = toEngineInput(s), r = allocate(input);
  const likud = s.lists.find((l) => l.shortEn === 'Likud')!;
  const members = s.lists.filter((l) => l.bloc === likud.bloc).map((l) => l.id);
  const seats = r.lists.filter((l) => members.includes(l.id)).reduce((n, l) => n + l.seats, 0);
  expect(seats).toBeGreaterThanOrEqual(61);
  // as the screen builds them: every list of the bloc to every list outside it, among lists with 0.5% or more
  const cands = s.lists.filter((l) => !l.withdrawn && BigInt(l.votes) * 200n >= r.totalValid);
  const tasks = cands.flatMap((from) => cands.filter((to) => members.includes(from.id) && !members.includes(to.id))
    .map((to) => ({ kind: 'groupTransfer', input, from: from.id, to: to.id, ids: members, n: 61, below: true }) as Extract<AnalysisTask, { kind: 'groupTransfer' }>));
  const first = tasks.map((t) => runTask(t) as TransferOutcome);
  const best = first.reduce((b, m) => (m.found && m.votes !== null && (b === null || m.votes < b) ? m.votes : b), null as bigint | null);
  const open = tasks.filter((_, k) => first[k].reason === 'inconclusive' || (first[k].found && !first[k].exact));
  expect(best).toBe(72101n);
  expect(open.length).toBeGreaterThan(0); // the first round alone left it "At most"
  for (const t of open) {
    const m = runTask({ ...t, max: best! - 1n }) as TransferOutcome;
    expect(m.exact, `${t.from} → ${t.to}`).toBe(true);
    expect(m.found, `${t.from} → ${t.to}`).toBe(false);
  }
}, 120_000);

test('c-analysis-code-03: under the 1977 candidate cap a list with as many seats as candidates cannot gain one: "not possible", not "?"', () => {
  const s = scenarioFromDataset(load('k9')), input = toEngineInput(s), r = allocate(input);
  const fs = input.lists.find((l) => l.candidateCount === 1 && (r.lists.find((x) => x.id === l.id)?.seats ?? 0) === 1)!;
  expect(fs).toBeTruthy();
  for (const src of [{ kind: 'proportional', listIds: [] }, { kind: 'new' }] as VoteSource[]) {
    const gain = runTask({ kind: 'security', input, src, part: 'gain', item: { id: fs.id, qualified: true, seats: 1 } });
    expect(gain).toMatchObject({ value: null, exact: true, reason: 'infeasible' });
    expect(runTask({ kind: 'seatTarget', input, src, id: fs.id, seats: 1, n: 2 })).toMatchObject({ found: false, exact: true, reason: 'infeasible' });
  }
  // a list with room on its roster is still searched
  const big = r.lists.reduce((a, b) => (b.seats > a.seats ? b : a));
  expect(runTask({ kind: 'security', input, src: { kind: 'new' }, part: 'gain', item: { id: big.id, qualified: true, seats: big.seats } }).reason).not.toBe('infeasible');
});
