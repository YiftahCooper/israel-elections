// Editing who runs on a joint list: a list joins another (all its votes go with it), and a party leaves a joint list with
// the votes given to it. Balad into Hadash–Ta'al (2022) is the worked example.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { scenarioFromDataset, validAction, type Action } from '../src/model/scenario.ts';
import { applyAction, ownPartyId } from '../src/model/actions.ts';
import { allocationOf, seatBlocsOf } from '../src/app/derive.ts';

const k25 = () => scenarioFromDataset(JSON.parse(readFileSync('public/data/k25.json', 'utf8')) as ElectionDataset);
const HT = '25-ום', BALAD = '25-ד';
const join: Action = { type: 'joinList', listId: BALAD, into: HT };

describe('a list joins a joint list', () => {
  it('Balad into Hadash–Ta’al: all of Balad’s votes and candidates go with it, under Hadash–Ta’al’s name and letters', () => {
    const s = k25(), ht = s.lists.find((l) => l.id === HT)!, balad = s.lists.find((l) => l.id === BALAD)!;
    const after = applyAction(s, join);
    const j = after.lists.find((l) => l.id === HT)!;
    expect(after.lists.some((l) => l.id === BALAD)).toBe(false);
    expect(j.votes).toBe(ht.votes + balad.votes);
    expect([j.letters, j.nameHe]).toEqual([ht.letters, ht.nameHe]);
    expect(j.parties!.map((p) => p.id)).toEqual(['hadash', 'taal', ownPartyId(BALAD)]);
    expect(j.candidates).toHaveLength(ht.candidates.length + balad.candidates.length);
    // each roster keeps its own order
    const baladOrder = j.candidates.filter((c) => c.partyId === ownPartyId(BALAD)).map((c) => c.id);
    expect(baladOrder).toEqual(balad.candidates.map((c) => c.id));
    expect(j.originIds).toEqual(expect.arrayContaining([...ht.originIds, ...balad.originIds]));
    // places are shared in proportion to the votes: Balad (about 44%) holds 2 of the first 5
    expect(j.candidates.slice(0, 5).filter((c) => c.partyId === ownPartyId(BALAD))).toHaveLength(2);
    // the joint list passes the threshold and wins seats Balad could not win alone
    const seats = (x: typeof s, id: string) => allocationOf(x).lists.find((l) => l.id === id)?.seats ?? 0;
    expect(seats(after, HT)).toBeGreaterThan(seats(s, HT));
    expect(validAction(join)).toBe(true);
  });

  it('seats of a list from another bloc keep counting for that bloc; a list in no bloc follows its host', () => {
    const s = k25(), ht = s.lists.find((l) => l.id === HT)!;
    const target = s.lists.find((l) => l.bloc && l.bloc !== ht.bloc && l.votes > 500000)!;
    const after = applyAction(s, { type: 'joinList', listId: HT, into: target.id });
    const j = after.lists.find((l) => l.id === target.id)!;
    const blocs = seatBlocsOf(after, j, allocationOf(after).lists.find((l) => l.id === j.id)!.seats);
    expect(blocs).toContain(ht.bloc);
    expect(blocs).toContain(target.bloc);
    // Balad has no bloc in this grouping: its seats inside Hadash–Ta'al count for Hadash–Ta'al's
    const joined = applyAction(s, join);
    expect(joined.partyBlocs?.[ownPartyId(BALAD)]).toBeUndefined();
  });

  it('refuses joining itself', () => {
    expect(() => applyAction(k25(), { type: 'joinList', listId: HT, into: HT })).toThrow();
  });
});

describe('a party leaves a joint list', () => {
  it('taking Balad back out after it joined gives a list like Balad again, and Hadash–Ta’al as it was', () => {
    const s = k25(), ht = s.lists.find((l) => l.id === HT)!, balad = s.lists.find((l) => l.id === BALAD)!;
    const joined = applyAction(s, join);
    const out = applyAction(joined, { type: 'leaveList', listId: HT, partyId: ownPartyId(BALAD), votes: balad.votes, newId: 'b2', nameHe: balad.nameHe, shortEn: balad.shortEn, letters: balad.letters, color: balad.color });
    const back = out.lists.find((l) => l.id === 'b2')!, rest = out.lists.find((l) => l.id === HT)!;
    expect(back.votes).toBe(balad.votes);
    expect(back.candidates.map((c) => c.id)).toEqual(balad.candidates.map((c) => c.id));
    expect(back.candidates.every((c) => !c.partyId)).toBe(true);
    expect(back.originIds).toEqual([BALAD]);
    expect(rest.votes).toBe(ht.votes);
    expect(rest.candidates.map((c) => c.id)).toEqual(ht.candidates.map((c) => c.id));
    expect(rest.parties!.map((p) => p.id)).toEqual(['hadash', 'taal']);
  });

  it('Ta’al leaves Hadash–Ta’al with its candidates; the rest keeps the list’s name, letters and agreement', () => {
    const s = k25(), ht = s.lists.find((l) => l.id === HT)!;
    const taal = ht.parties!.find((p) => p.id === 'taal')!;
    const out = applyAction(s, { type: 'leaveList', listId: HT, partyId: 'taal', votes: 70000, newId: 't', nameHe: taal.nameHe, shortEn: taal.nameEn, letters: 'עם', color: '#123456' });
    const t = out.lists.find((l) => l.id === 't')!, rest = out.lists.find((l) => l.id === HT)!;
    expect(t.votes + rest.votes).toBe(ht.votes);
    expect(t.candidates.length).toBeGreaterThan(0);
    expect(t.candidates.every((c) => c.partyId === 'taal')).toBe(true);
    expect(rest.candidates.some((c) => c.partyId === 'taal')).toBe(false);
    expect(rest.letters).toBe(ht.letters);
    expect(out.agreements.filter((a) => a.members.includes(HT))).toEqual(s.agreements.filter((a) => a.members.includes(HT)));
  });

  it('refuses more votes than the list has, and a list of one party', () => {
    const s = k25(), ht = s.lists.find((l) => l.id === HT)!;
    expect(() => applyAction(s, { type: 'leaveList', listId: HT, partyId: 'taal', votes: ht.votes + 1, newId: 't', nameHe: 'x', shortEn: null, letters: '', color: '#000000' })).toThrow();
    expect(() => applyAction(s, { type: 'leaveList', listId: BALAD, partyId: ownPartyId(BALAD), votes: 1, newId: 't', nameHe: 'x', shortEn: null, letters: '', color: '#000000' })).toThrow();
  });
});
