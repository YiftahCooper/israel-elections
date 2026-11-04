// Blocs per seat and constituent parties (decision 0087): regrouping never changes votes or seats.
import { describe, expect, it } from 'vitest';
import { allocate } from '../src/engine/allocate.ts';
import { applyAction } from '../src/model/actions.ts';
import { scenarioFromDataset, toEngineInput, validateScenario } from '../src/model/scenario.ts';
import { blocPieces, seatBlocsOf } from '../src/app/derive.ts';
import { loadDataset } from './helpers.ts';

const ds = loadDataset('k25');
const base = scenarioFromDataset(ds);
const r = allocate(toEngineInput(base));
const unity = base.lists.find((l) => l.parties?.some((p) => p.id === 'new-hope'))!;
const seatsOf = (id: string) => r.lists.find((x) => x.id === id)!.seats;
const blocTotals = (s: typeof base) => {
  const out: Record<string, number> = {};
  for (const p of blocPieces(s, allocate(toEngineInput(s)))) out[p.bloc ?? 'none'] = (out[p.bloc ?? 'none'] ?? 0) + p.n;
  return out;
};

describe('bloc schemes', () => {
  it('starts from the first government formed after the election', () => {
    expect(base.blocSchemeId).toBe('first-government');
    expect(Object.values(blocTotals(base)).reduce((a, b) => a + b, 0)).toBe(120);
  });
  it('switches between sourced schemes and back', () => {
    const other = base.blocSchemes!.find((x) => x.id !== 'first-government')!;
    const s = applyAction(base, { type: 'applyBlocScheme', schemeId: other.id });
    expect(s.blocSchemeId).toBe(other.id);
    expect(s.blocs.map((b) => b.id)).toEqual(other.blocs.map((b) => b.id));
    const back = applyAction(s, { type: 'applyBlocScheme', schemeId: 'first-government' });
    expect(blocTotals(back)).toEqual(blocTotals(base));
  });
  it('rejects an unknown scheme', () => {
    expect(() => applyAction(base, { type: 'applyBlocScheme', schemeId: 'nope' })).toThrow();
  });
});

describe('constituent parties', () => {
  const newHope = unity.candidates.filter((c) => c.partyId === 'new-hope');
  const elected = unity.candidates.filter((c) => !c.notSeated).slice(0, seatsOf(unity.id));
  const heldByNewHope = elected.filter((c) => c.partyId === 'new-hope').length;
  it('tag the candidates of a joint list with their party', () => {
    expect(newHope.length).toBeGreaterThan(0);
    expect(heldByNewHope).toBeGreaterThan(0);
  });
  it('move only their own elected members to another bloc, without changing seats', () => {
    const target = base.blocs.find((b) => b.id !== unity.bloc)!;
    const s = applyAction(base, { type: 'setPartyBloc', partyId: 'new-hope', bloc: target.id });
    expect(allocate(toEngineInput(s)).lists.map((l) => l.seats)).toEqual(r.lists.map((l) => l.seats));
    const before = blocTotals(base), after = blocTotals(s);
    expect(after[target.id]).toBe(before[target.id] + heldByNewHope);
    expect(after[unity.bloc!]).toBe(before[unity.bloc!] - heldByNewHope);
    expect(s.blocSchemeId).toBeNull(); // now the user's own grouping
    expect(seatBlocsOf(s, s.lists.find((l) => l.id === unity.id)!, seatsOf(unity.id)).filter((b) => b === target.id)).toHaveLength(heldByNewHope);
    // following the list again restores the totals
    const back = applyAction(s, { type: 'setPartyBloc', partyId: 'new-hope', bloc: null, inherit: true });
    expect(blocTotals(back)).toEqual(before);
    expect(validateScenario(JSON.parse(JSON.stringify(back)))).toEqual([]);
  });
  it('travel with their candidates through a split', () => {
    const v = unity.votes;
    const ids = (pred: (pid?: string) => boolean) => unity.candidates.filter((c) => pred(c.partyId)).map((c) => c.id);
    const s = applyAction(base, { type: 'split', id: unity.id, parts: [
      { newId: 'nh', nameHe: 'nh', letters: 'nh', color: '#000000', votes: Math.floor(v / 3), candidateIds: ids((p) => p === 'new-hope') },
      { newId: 'rest', nameHe: 'rest', letters: 'rest', color: '#111111', votes: v - Math.floor(v / 3), candidateIds: ids((p) => p !== 'new-hope') },
    ] });
    expect(s.lists.find((l) => l.id === 'nh')!.parties!.map((p) => p.id)).toEqual(['new-hope']);
    expect(s.lists.find((l) => l.id === 'rest')!.parties?.some((p) => p.id === 'new-hope') ?? false).toBe(false);
    expect(validateScenario(JSON.parse(JSON.stringify(s)))).toEqual([]);
  });
});
