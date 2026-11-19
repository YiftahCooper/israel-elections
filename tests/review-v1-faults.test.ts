// Faults found by the 19 Nov review of the top bar, Overview, editing, Compare and History (lane FV1).
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import type { ElectionDataset } from '../src/data/schema.ts';
import { scenarioFromDataset } from '../src/model/scenario.ts';
import { allocationOf, blocPieces } from '../src/app/derive.ts';

const load = (id: string) => JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8')) as ElectionDataset;

describe('bloc bar pieces', () => {
  it('a joint list\'s parties sit together in the bar, as on the seat chart (1977, 1996, April 2019)', () => {
    for (const id of ['k9', 'k14', 'k21']) {
      const s = scenarioFromDataset(load(id)), pieces = blocPieces(s, allocationOf(s));
      const keys = pieces.map((p) => `${p.listId}|${p.bloc}|${p.partyId}`);
      expect(new Set(keys).size, id).toBe(keys.length);
      expect(pieces.reduce((t, p) => t + p.n, 0)).toBe(120);
    }
  });
});

describe('Undo and Redo name the step they take', () => {
  it('Start over is "Start over", never the colour entry that ends the fresh list (V1 F20); revert is named too', async () => {
    const { applyAction } = await import('../src/model/actions.ts');
    const { stepName } = await import('../src/app/actionDescription.ts');
    const s0 = scenarioFromDataset(load('k25'));
    const l = s0.lists.find((x) => x.shortEn === 'Labor')!;
    const s1 = applyAction(s0, { type: 'setWithdrawn', listId: l.id, withdrawn: true });
    const s2 = applyAction(s1, { type: 'setVotes', listId: s0.lists[0].id, votes: s0.lists[0].votes + 1000 });
    // Start over keeps the user's colours by replaying a colour entry on the fresh scenario
    const fresh = applyAction(scenarioFromDataset(load('k25')), { type: 'setBlocAppearance', blocs: s0.blocs });
    expect(stepName(s2, fresh, 'en')).toBe('Start over');
    expect(stepName(s2, fresh, 'he')).toBe('התחלה מחדש');
    expect(stepName(s1, s2, 'en')).toMatch(/^Likud: set to/);
    // History's "revert to here": a shorter list of changes
    expect(stepName(s2, s1, 'en')).toBe('Back to an earlier change');
  });
});
