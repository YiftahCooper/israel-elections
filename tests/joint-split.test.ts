// Splitting a joint list never creates an empty 0-vote list (owner, 8 Nov: Atid Ehad and Eretz Yisrael Shelanu on
// Religious Zionism, 2022). Only a party given votes runs on its own; every candidate stays on exactly one list.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ELECTION_IDS, type ElectionDataset } from '../src/data/schema.ts';
import { scenarioFromDataset, type Action } from '../src/model/scenario.ts';
import { applyAction, apportion } from '../src/model/actions.ts';
import { planPartySplit } from '../src/model/jointSplit.ts';
import { allocationOf, electedOf } from '../src/app/derive.ts';

const scenario = (id: string) => scenarioFromDataset(JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8')) as ElectionDataset);
/** the split screens' default: each party's share of the list's elected members, else of its named candidates */
function defaultVotes(l: ReturnType<typeof scenario>['lists'][number], seats: number) {
  const parties = l.parties ?? [];
  const elected = electedOf(l, seats);
  const w = parties.map((p) => elected.filter((c) => c.partyId === p.id).length);
  const base = w.some((x) => x > 0) ? w : parties.map((p) => l.candidates.filter((c) => c.partyId === p.id).length);
  const t = base.reduce((a, b) => a + b, 0) || 1;
  return apportion(l.votes, base.map((x) => Math.max(0, Math.round((x / t) * 1000))));
}
const split = (l: { id: string; letters: string; color: string; parties?: { nameHe: string }[] }, plan: ReturnType<typeof planPartySplit>): Action => ({
  type: 'split', id: l.id,
  parts: plan.parts.map((pt, k) => ({ newId: `${l.id}-p${k}`, nameHe: l.parties![pt.index].nameHe, letters: `${l.letters}${k + 1}`, color: l.color, votes: pt.votes, candidateIds: pt.candidateIds })),
});

describe('splitting a joint list by party', () => {
  it('Religious Zionism 2022 runs its three parties with candidates; Atid Ehad and Eretz Yisrael Shelanu get no list', () => {
    const s = scenario('k25'), l = s.lists.find((x) => x.id === '25-ט')!;
    const plan = planPartySplit(l, defaultVotes(l, allocationOf(s).lists.find((x) => x.id === l.id)!.seats));
    expect(plan.parts.map((p) => l.parties![p.index].id)).toEqual(['tkuma', 'otzma-yehudit', 'noam']);
    expect(plan.absorbed.map((i) => l.parties![i].id)).toEqual(['atid-ehad', 'eretz-yisrael-shelanu']);
    const after = applyAction(s, split(l, plan));
    expect(after.lists.filter((x) => x.id.startsWith('25-ט-p')).map((x) => x.votes > 0)).toEqual([true, true, true]);
  });

  it('never creates a 0-vote list, at any election, and keeps every candidate exactly once', () => {
    let checked = 0, absorbed = 0;
    for (const id of ELECTION_IDS) {
      const s = scenario(id), r = allocationOf(s);
      for (const l of s.lists.filter((x) => (x.parties?.length ?? 0) >= 2 && x.votes > 0)) {
        const plan = planPartySplit(l, defaultVotes(l, r.lists.find((x) => x.id === l.id)!.seats));
        absorbed += plan.absorbed.length;
        if (plan.parts.length < 2) continue;
        checked++;
        expect(plan.parts.every((p) => p.votes > 0), `${l.id}`).toBe(true);
        const ids = plan.parts.flatMap((p) => p.candidateIds);
        expect(new Set(ids).size, l.id).toBe(ids.length);
        expect(ids.length, l.id).toBe(new Set(l.candidates.map((c) => c.id)).size);
        const after = applyAction(s, split(l, plan));
        expect(after.lists.filter((x) => x.id.startsWith(`${l.id}-p`)).every((x) => x.votes > 0), l.id).toBe(true);
      }
    }
    expect(checked).toBeGreaterThan(40);
    expect(absorbed).toBeGreaterThanOrEqual(17); // the 17 parties found on 8 Nov with no default share
  });

  it('a party given a share runs even without recorded candidates; a party with none stays with the lead', () => {
    const s = scenario('k25'), l = s.lists.find((x) => x.id === '25-ט')!;
    const plan = planPartySplit(l, [100, 100, 100, 50, 0]);
    expect(plan.parts.map((p) => l.parties![p.index].id)).toEqual(['tkuma', 'otzma-yehudit', 'noam', 'atid-ehad']);
    expect(plan.parts[3].candidateIds).toEqual([]);
    // only one party with votes: no split
    expect(planPartySplit(l, [350, 0, 0, 0, 0]).parts).toHaveLength(1);
  });
});
