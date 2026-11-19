import { expect, test } from 'vitest';
import { scenarioFromDataset } from '../src/model/scenario.ts';
import { allocationOf, seatHolders } from '../src/app/derive.ts';
import { chamberKeyGroups, chamberKeyRows, ownPartyLogo, seatOrder } from '../src/app/components/Hemicycle.tsx';
import { dataset } from './graphics-cases.ts';

// Audit c-screens-overview-02 and c-design-principles-06: the chamber's key names every seat drawn, in the order the
// seats are drawn, under every joint-list setting; a joint list counted by party keeps a row for its members with no
// recorded party.
const looks = ['both', 'party', 'list'] as const;
test('in every election the key adds up to the seats allocated, in chamber order, under each joint-list setting', () => {
  for (let n = 1; n <= 26; n++) {
    const base = scenarioFromDataset(dataset(n));
    for (const splits of [[], base.lists.filter(l => (l.parties?.length ?? 0) > 1).map(l => l.id)]) {
      const s = { ...base, factionSplits: splits }, r = allocationOf(s);
      for (const look of looks) for (const colorBy of ['list', 'bloc', 'party'] as const) {
        const seats = seatOrder(s, r, colorBy, look), rows = chamberKeyRows(s, seats, look);
        const at = `k${n} ${splits.length ? 'by party' : 'whole'} ${look} ${colorBy}`;
        expect(rows.reduce((t, x) => t + x.n, 0), at).toBe(r.seatsAllocated);
        // chamber order: each row's first seat comes after the previous row's first seat
        const first = rows.map(x => seats.findIndex(st => (x.byParty ? `${st.listId}:${st.partyId ?? ''}` : st.listId) === x.key));
        expect(first, at).toEqual([...first].sort((a, b) => a - b));
        // every colour drawn is keyed
        for (const st of seats) expect(rows.some(x => x.l.id === st.listId && x.colors.includes(st.color)), at).toBe(true);
        // a list's rows add up to its seats, and agree with the seat holders the lists column uses
        if (look !== 'list') for (const h of seatHolders(s, r).filter(h => h.seats > 0)) {
          const row = rows.find(x => x.key === (h.partyId ? `${h.listId}:${h.partyId}` : splits.includes(h.listId) && (s.lists.find(l => l.id === h.listId)!.parties?.length ?? 0) > 1 ? `${h.listId}:` : h.listId));
          expect(row?.n, `${at} ${h.key}`).toBe(h.seats);
        }
      }
    }
  }
});

test('1977 Hadash counted by party: Rakah 3, Black Panthers 1, Jewish and Arab public circles 1, none unrecorded', () => {
  const base = scenarioFromDataset(dataset(9));
  const hadash = base.lists.find(l => l.shortEn === 'Hadash')!;
  const s = { ...base, factionSplits: [hadash.id] }, r = allocationOf(s);
  const rows = chamberKeyRows(s, seatOrder(s, r, 'list', 'both'), 'both').filter(x => x.l.id === hadash.id);
  expect(rows.map(x => [x.p?.nameEn ?? null, x.n]).sort()).toEqual([['Black Panthers', 1], ['Jewish and Arab public circles', 1], ['Rakah', 3]]);
  expect(rows.reduce((t, x) => t + x.n, 0)).toBe(5);
});

// Owner, 19 Nov 2026: a joint list counted by party is one key entry, under its list's own ballot letters or logo; its
// parties never borrow ballot letters, and show only a logo of their own that is not the list's.
test('every election: the key groups a joint list counted by party under its list, once, with its seats', () => {
  for (let n = 1; n <= 26; n++) {
    const base = scenarioFromDataset(dataset(n), '', true), r = allocationOf(base);
    for (const look of looks) {
      const rows = chamberKeyRows(base, seatOrder(base, r, 'list', look), look), groups = chamberKeyGroups(rows);
      const at = `k${n} ${look}`;
      expect(new Set(groups.map(g => g.l.id)).size, at).toBe(groups.length);
      expect(groups.reduce((t, g) => t + g.n, 0), at).toBe(r.seatsAllocated);
      for (const g of groups) {
        expect(g.rows.every(x => x.l.id === g.l.id && x.byParty === g.byParty), at).toBe(true);
        expect(g.n, at).toBe(r.lists.find(x => x.id === g.l.id)!.seats);
        if (!g.byParty) expect(g.rows, at).toHaveLength(1);
        expect(g.l.letters, `${at} ${g.l.nameHe}`).toBeTruthy();
        for (const x of g.rows) { const own = ownPartyLogo(g.l, x.p); if (own) expect(own.file).not.toBe(g.l.logo?.file); }
      }
      if (look === 'list') expect(groups.every(g => !g.byParty), at).toBe(true);
    }
  }
});

test('2026: Likud heads Likud 26 and New Hope 1, with New Hope\'s own logo and none repeated for Likud', () => {
  const s = scenarioFromDataset(dataset(26), '', true), r = allocationOf(s);
  const likud = chamberKeyGroups(chamberKeyRows(s, seatOrder(s, r, 'list', 'both'), 'both')).find(g => g.l.shortEn === 'Likud')!;
  expect(likud.byParty).toBe(true);
  expect(likud.rows.map(x => [x.p?.nameEn, x.n])).toEqual([['Likud', 26], ['New Hope – the National Right', 1]]);
  expect(likud.rows.map(x => ownPartyLogo(likud.l, x.p)?.file)).toEqual([undefined, 'logos/newhope-2026.png']);
});
