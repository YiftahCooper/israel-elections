import { expect, test } from 'vitest';
import { scenarioFromDataset } from '../src/model/scenario.ts';
import { allocationOf, seatHolders } from '../src/app/derive.ts';
import { chamberKeyRows, seatOrder } from '../src/app/components/Hemicycle.tsx';
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

test('1977 Hadash counted by party: Rakah 3, Black Panthers 1, and 1 seat with no party recorded', () => {
  const base = scenarioFromDataset(dataset(9));
  const hadash = base.lists.find(l => l.shortEn === 'Hadash')!;
  const s = { ...base, factionSplits: [hadash.id] }, r = allocationOf(s);
  const rows = chamberKeyRows(s, seatOrder(s, r, 'list', 'both'), 'both').filter(x => x.l.id === hadash.id);
  expect(rows.map(x => [x.p?.nameEn ?? null, x.n]).sort()).toEqual([[null, 1], ...rows.filter(x => x.p).map(x => [x.p!.nameEn, x.n])].sort());
  expect(rows.reduce((t, x) => t + x.n, 0)).toBe(5);
  expect(rows.find(x => !x.p)?.n).toBe(1);
});
