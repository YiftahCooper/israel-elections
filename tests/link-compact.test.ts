// Short share links (owner, 16 Nov 2026: links of thousands of characters are unacceptable). A link writes lists and
// candidates against the published election and keeps only the last of repeated edits; opening it must give back
// exactly the same scenario.
import { readFileSync } from 'node:fs';
import { deflateRawSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { scenarioFromDataset, type Action, type Scenario } from '../src/model/scenario.ts';
import { applyAction } from '../src/model/actions.ts';
import { partSnapshot } from '../src/model/parts.ts';
import { coalesce, compactLog, expandLog } from '../src/app/linkCompact.ts';

const ds = JSON.parse(readFileSync('public/data/k25.json', 'utf8')) as ElectionDataset;
const base = scenarioFromDataset(ds);
const id = (en: string) => base.lists.find((l) => l.shortEn === en)!.id;
const replay = (log: Action[]) => log.reduce<Scenario>((s, a) => applyAction(s, a, '2026-11-16T00:00:00.000Z'), base);
const inputs = (s: Scenario) => JSON.stringify({ ...s, log: undefined });
/** the link's characters after #s= (the app's encoding: JSON, deflate-raw, base64url) */
const size = (payload: unknown) => deflateRawSync(Buffer.from(JSON.stringify(payload))).toString('base64url').length;
const link = (log: Action[], v2: boolean) => size({ e: 'k25', n: 'Test', b: ds.buildInfo.builtAt, f: false, ...(v2 ? { v: 2, l: compactLog(log, ds) } : { l: log }) });

// three real cases from the screens
const likud = id('Likud'), yesh = id('Yesh Atid');
const typed: Action[] = [1100000, 1120000, 1130000, 1135000].map((votes) => ({ type: 'setVotes', listId: likud, votes }) as Action)
  .concat([{ type: 'transfer', from: likud, to: yesh, votes: 20000 }]);
// "Restore votes" on the votes marker starts the votes part from the reference: a snapshot of every list
const restore: Action[] = [{ type: 'setVotes', listId: likud, votes: 1200000 }, { type: 'startPart', part: 'votes', source: 'saved', snapshot: partSnapshot(base, 'votes'), name: 'Reference' },
  { type: 'setVotes', listId: yesh, votes: 900000 }];
// a joint list's parties: Balad joins Hadash–Ta'al, Ta'al runs on its own, and an edited roster
const joined = applyAction(base, { type: 'joinList', listId: '25-ד', into: '25-ום' });
const roster = joined.lists.find((l) => l.id === '25-ום')!.candidates;
const structure: Action[] = [{ type: 'joinList', listId: '25-ד', into: '25-ום' },
  { type: 'candidates', listId: '25-ום', candidates: [roster[1], roster[0], ...roster.slice(2)], note: 'reordered' },
  { type: 'leaveList', listId: '25-ום', partyId: 'taal', votes: 60000, newId: 'sim-t', nameHe: 'תע״ל', shortEn: "Ta'al", letters: 'ום2', color: '#2e7d32' }];

describe('short share links', () => {
  for (const [name, log] of [['typed votes', typed], ['restore votes', restore], ['joint list', structure]] as const) {
    it(`${name}: the link opens exactly the scenario it was made from`, () => {
      const back = expandLog(JSON.parse(JSON.stringify(compactLog(log, ds))), ds);
      expect(back).toEqual(coalesce(log));
      expect(inputs(replay(back))).toBe(inputs(replay(log)));
    });
  }
  it('is much shorter where a step carries lists, and never longer', () => {
    const rows = ([['typed votes', typed], ['restore votes', restore], ['joint list', structure]] as const).map(([n, log]) => [n, link(log, false), link(log, true)] as const);
    console.log(rows.map(([n, a, b]) => `${n}: ${a} → ${b} characters`).join('\n'));
    for (const [, before, after] of rows) expect(after).toBeLessThanOrEqual(before);
    expect(rows[1][2]).toBeLessThan(rows[1][1] / 10);
  });
  it('a link naming a list the data lacks is refused', () => {
    expect(() => expandLog([{ type: 'startPart', part: 'votes', source: 'saved', snapshot: { lists: [{ $b: 'no-such-list' }] } }], ds)).toThrow();
  });
});
