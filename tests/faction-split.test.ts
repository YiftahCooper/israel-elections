// A joint list's faction splitting into its parties after the election (decision 0091): seats stay where the
// allocation put them; each elected member counts for their own recorded party.
import { describe, expect, it } from 'vitest';
import { allocate } from '../src/engine/allocate.ts';
import { applyAction } from '../src/model/actions.ts';
import { scenarioFromDataset, toEngineInput, validateScenario } from '../src/model/scenario.ts';
import { seatHolders } from '../src/app/derive.ts';
import { loadDataset } from './helpers.ts';

const ds = loadDataset('k25');
const base = scenarioFromDataset(ds);
const unity = base.lists.find((l) => l.id === '25-כן')!;
const total = (s: typeof base) => seatHolders(s, allocate(toEngineInput(s))).reduce((t, h) => t + h.seats, 0);

describe('faction split', () => {
  it('shows a joint list as one holder until it splits', () => {
    const h = seatHolders(base, allocate(toEngineInput(base))).filter((x) => x.listId === unity.id);
    expect(h).toHaveLength(1);
    expect(h[0].seats).toBe(12);
  });

  it('splits National Unity 2022 into Blue and White and New Hope by recorded members, votes untouched', () => {
    const s = applyAction(base, { type: 'setFactionSplit', listId: unity.id, split: true });
    const r = allocate(toEngineInput(s));
    expect(r.lists).toEqual(allocate(toEngineInput(base)).lists);
    const h = seatHolders(s, r).filter((x) => x.listId === unity.id);
    expect(h.map((x) => x.partyId)).toEqual(['israel-resilience', 'new-hope']);
    // each party's seats are its recorded members among the 12 elected
    const fromRoster = (pid: string) => unity.candidates.filter((c) => !c.notSeated).slice(0, 12).filter((c) => c.partyId === pid).length;
    expect(h.find((x) => x.partyId === 'new-hope')!.seats).toBe(fromRoster('new-hope'));
    expect(fromRoster('new-hope')).toBeGreaterThan(0);
    expect(h.reduce((t, x) => t + x.seats, 0)).toBe(12);
    expect(total(s)).toBe(120);
    expect(validateScenario(s)).toEqual([]);
  });

  it('gives each party its own bloc and colour', () => {
    let s = applyAction(base, { type: 'setFactionSplit', listId: unity.id, split: true });
    const coalition = s.blocs.find((b) => b.id === 'coalition')!.id;
    s = applyAction(s, { type: 'setPartyBloc', partyId: 'new-hope', bloc: coalition });
    const h = seatHolders(s, allocate(toEngineInput(s)));
    expect(h.find((x) => x.partyId === 'new-hope')!.bloc).toBe(coalition);
    expect(h.find((x) => x.partyId === 'israel-resilience')!.bloc).toBe(unity.bloc);
  });

  it('rejoins, and refuses a list with a single party', () => {
    const s = applyAction(applyAction(base, { type: 'setFactionSplit', listId: unity.id, split: true }), { type: 'setFactionSplit', listId: unity.id, split: false });
    expect(s.factionSplits).toEqual([]);
    const single = base.lists.find((l) => (l.parties?.length ?? 0) < 2)!;
    expect(() => applyAction(base, { type: 'setFactionSplit', listId: single.id, split: true })).toThrow();
  });

  it('follows the roster when votes change the list’s seats', () => {
    let s = applyAction(base, { type: 'setFactionSplit', listId: unity.id, split: true });
    s = applyAction(s, { type: 'setVotes', listId: unity.id, votes: Math.round(unity.votes * 1.5) });
    const r = allocate(toEngineInput(s));
    const seats = r.lists.find((x) => x.id === unity.id)!.seats;
    expect(seats).toBeGreaterThan(12);
    expect(seatHolders(s, r).filter((x) => x.listId === unity.id).reduce((t, x) => t + x.seats, 0)).toBe(seats);
    expect(total(s)).toBe(120);
  });
});
