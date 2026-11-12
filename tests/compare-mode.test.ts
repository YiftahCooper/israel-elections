// Comparing as a mode (Design A): what the screen is compared with, and Swap.
import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it } from 'vitest';
import type { ElectionDataset, ElectionIndexEntry } from '../src/data/schema.ts';
import { applyAction } from '../src/model/actions.ts';
import { allocationOf, baselineOf } from '../src/app/derive.ts';
import { getState, setState } from '../src/app/store.ts';
import { compareWith, referenceElection, resolveReference, startComparing, stopComparing, swapWithReference, type Reference } from '../src/app/compare/mode.ts';

const load = (id: string): ElectionDataset => JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8'));
const datasets = { k26: load('k26'), k25: load('k25'), k1: load('k1') };
const elections: ElectionIndexEntry[] = JSON.parse(readFileSync('public/data/elections.json', 'utf8'));
elections.sort((a, b) => b.date.localeCompare(a.date));
const k26 = baselineOf(datasets.k26), k25 = baselineOf(datasets.k25);
const likud = (id: 'k26' | 'k25') => baselineOf(datasets[id]).lists.find((l) => l.shortEn === 'Likud')!.id;
const seats = (s: typeof k26, id: string) => allocationOf(s).lists.find((l) => l.id === id)!.seats;
const edited = applyAction(k26, { type: 'setVotes', listId: likud('k26'), votes: 1_300_000 }, undefined, { base: k26 });

beforeEach(() => setState({ datasets, elections, saved: [], comparing: null, scenario: k26, electionId: 'k26', reference: null, past: [], future: [], sessions: {}, scenarioDrafts: {}, lang: 'en', settings: {},
  compare: { drafts: {}, overrides: {}, snapshot: null, swapped: null, chamber: 'work', back: null } }));
const resolved = (work = getState().scenario!) => resolveReference(work, getState());
const ready = (work = getState().scenario!): Reference => { const r = resolved(work); if (r.status !== 'ready') throw new Error(r.status); return r.ref; };

describe('what the screen is compared with', () => {
  it('is nothing until comparing is turned on, then the previous election', () => {
    expect(resolved().status).toBe('off');
    startComparing();
    const ref = ready();
    expect(ref.ds.id).toBe('k25');
    expect(ref.year).toBe('2022');
    expect(ref.official).toBe(true);
    expect(seats(ref.sc, likud('k25'))).toBe(seats(k25, likud('k25')));
    stopComparing();
    expect(resolved().status).toBe('off');
  });
  it('has no earlier election for the first Knesset', () => {
    setState({ comparing: 'prev' });
    expect(resolved(baselineOf(datasets.k1))).toEqual({ status: 'none', key: 'prev', why: 'first' });
  });
  it('says there is nothing to compare when the reference is exactly what is on screen', () => {
    setState({ comparing: 'official' });
    expect(resolved()).toMatchObject({ status: 'none', why: 'same' });
    expect(ready(edited)).toMatchObject({ same: true, official: true, id: 'official:k26' });
  });
  it('keeps a chosen election when another election is opened, while “the previous election” follows', () => {
    compareWith('election:k1');
    expect(ready(k25).ds.id).toBe('k1');
    compareWith('prev');
    expect(referenceElection('prev', k25, getState())).toBe('k24');
    expect(resolved(k25)).toEqual({ status: 'loading', key: 'prev' });
  });
  it('compares with a saved scenario of another election', () => {
    const log = [{ type: 'setVotes', listId: likud('k25'), votes: 1_300_000 } as const];
    setState({ saved: [{ id: 'mine', name: 'Likud 1.3m (2022)', electionId: 'k25', savedAt: '', baseBuiltAt: '', log }] });
    compareWith('saved:mine');
    const ref = ready();
    expect(ref.name).toBe('Likud 1.3m (2022)');
    expect(ref.sc.id).toBe('mine');
    expect(ref.sc.lists.find((l) => l.id === likud('k25'))!.votes).toBe(1_300_000);
    expect(ref.official).toBe(false);
    // the copy methods that copy an edit compare the saved scenario with its election's official result
    expect(ref.start.lists.find((l) => l.id === likud('k25'))!.votes).toBe(k25.lists.find((l) => l.id === likud('k25'))!.votes);
  });
  it('freezes a copy of your work, which later edits do not change', () => {
    compareWith('snapshot');
    setState({ scenario: edited, past: [k26] });
    const ref = ready();
    expect(ref.sc).toBe(k26);
    expect(ref.name).toBe('Your work (frozen copy)');
  });
});

describe('Swap', () => {
  it('makes the reference your work and keeps your work, with its undo history, as the reference', () => {
    setState({ scenario: edited, past: [k26], comparing: 'prev' });
    expect(swapWithReference(ready())).toBe(true);
    let st = getState();
    expect(st.scenario!.electionId).toBe('k25');
    expect(st.electionId).toBe('k25');
    expect(st.past).toEqual([]);
    expect(st.comparing).toBe('swapped');
    expect(st.compare.swapped!.scenario).toBe(edited);
    const ref = ready();
    expect(ref.name).toMatch(/unsaved draft$/);
    expect(ref.ds.id).toBe('k26');
    // and back: your work returns with its history; the 2022 result is the reference again
    swapWithReference(ref);
    st = getState();
    expect(st.scenario).toBe(edited);
    expect(st.past).toEqual([k26]);
    expect(ready().ds.id).toBe('k25');
    expect(ready().official).toBe(true);
  });
  it('never overwrites unsaved work already waiting for the other election', () => {
    const waiting = applyAction(k25, { type: 'setVotes', listId: likud('k25'), votes: 900_000 }, undefined, { base: k25 });
    setState({ comparing: 'prev', sessions: { k25: { scenario: waiting, past: [k25], future: [], reference: null } } });
    swapWithReference(ready());
    const st = getState();
    expect(st.sessions.k25).toBeUndefined();
    expect(Object.values(st.scenarioDrafts).map((d) => d.scenario)).toContain(waiting);
  });
});
