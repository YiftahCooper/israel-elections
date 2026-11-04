import { expect, it } from 'vitest';
import { loadDataset } from './helpers.ts';
import { scenarioFromDataset, validateScenario } from '../src/model/scenario.ts';
import { applyAction } from '../src/model/actions.ts';
import { groupingBaseline, referenceLabel, differsFromReference } from '../src/app/derive.ts';
import { describe } from '../src/app/actionDescription.ts';
const base = scenarioFromDataset(loadDataset('k25'));
it('labels official and saved bases in both languages, including unnamed saves', () => {
  expect(referenceLabel(null, 'en')).toMatchObject({ name: 'Official result', since: 'Since official result', at: 'officially' });
  expect(referenceLabel(null, 'he').at).toBe('בפועל');
  for (const lang of ['en', 'he'] as const) {
    const label = referenceLabel({ ...base, name: 'Review A' }, lang);
    expect(label.name).toBe('Review A');
    expect(label.since).toBe(lang === 'en' ? 'Since Review A' : 'מאז Review A');
    expect(label.at).toBe(lang === 'en' ? 'in Review A' : 'בתרחיש Review A');
    expect(JSON.stringify(label)).not.toMatch(/official|historical|בפועל|רשמי/);
    expect(referenceLabel(base, lang).name).toBe(lang === 'en' ? 'Saved scenario' : 'תרחיש שמור');
  }
});
it('compares saved custom assignments after vote edits but rejects different assignments', () => {
  const partyId = base.lists.flatMap(l => l.parties ?? [])[0].id;
  const custom = applyAction(base, { type: 'setPartyBloc', partyId, bloc: base.blocs[0].id });
  const votes = applyAction(custom, { type: 'setVotes', listId: custom.lists[0].id, votes: 1300000 });
  expect(groupingBaseline(votes, custom)).toBe(custom);
  expect(groupingBaseline(votes, base)).toBeNull();
  const moved = applyAction(votes, { type: 'setPartyBloc', partyId, bloc: votes.blocs[1].id });
  expect(groupingBaseline(moved, custom)).toBeNull();
});
it('description is a replayable, marked action with a truthful history label', () => {
  const action = { type: 'setDescription', description: 'Review description' } as const;
  const next = applyAction(base, action);
  expect(next.description).toBe('Review description');
  expect(next.log.at(-1)?.action).toEqual(action);
  expect(differsFromReference(next, base, ['description'])).toBe(true);
  expect(validateScenario(next)).toEqual([]);
  expect(describe(action, next, 'en')).toContain('description');
});
