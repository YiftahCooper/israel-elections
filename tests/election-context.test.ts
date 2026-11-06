import { describe, expect, it } from 'vitest';
import { electionContext, validateElectionContext } from '../src/data/electionContext.ts';

describe('read-only election context validation', () => {
  it('accepts the reviewed metadata', () => expect(() => validateElectionContext(electionContext)).not.toThrow());
  const mutations: [string, (v: any) => void][] = [
    ['missing source', v => delete v.events[0].source],
    ['missing date', v => delete v.events[0].effectiveDate],
    ['invalid date', v => v.events[0].effectiveDate = '1949-02-30'],
    ['unknown election', v => v.events[0].electionId = 'k27'],
    ['unknown evidence', v => v.events[0].source.evidence = 'proven'],
    ['English Wikipedia', v => v.events[0].source.url = 'https://en.wikipedia.org/wiki/Israel'],
    ['unlabelled Hebrew Wikipedia', v => v.events[0].source.url = 'https://he.wikipedia.org/wiki/ישראל'],
    ['duplicate event', v => v.events.push(v.events[0])],
    ['wrong list target', v => v.events[0].listId = '9-פש'],
    ['ballot mismatch', v => v.pmContests[0].totals.cast.value++],
    ['candidate mismatch', v => v.pmContests[0].candidates[0].votes.value++],
    ['invented withdrawal votes', v => v.pmContests[1].candidates[2].votes = v.pmContests[1].candidates[0].votes],
  ];
  it.each(mutations)('rejects %s', (_, mutate) => { const copy = structuredClone(electionContext); mutate(copy); expect(() => validateElectionContext(copy)).toThrow(); });
  it('allows unresolved evidence without converting it to official', () => {
    const copy = structuredClone(electionContext); copy.events[0].source.evidence = 'unresolved'; validateElectionContext(copy);
    expect(copy.events[0].source.evidence).toBe('unresolved');
  });
});

describe('independent PM ballot totals', () => {
  it.each([
    ['pm1996', 2972589, 148681, 3121270],
    ['pm1999', 3193494, 179458, 3372952],
    ['pm2001', 2722021, 83917, 2805938],
  ])('%s retains and reconciles its own counts', (id, valid, invalid, cast) => {
    const c = electionContext.pmContests.find(c => c.id === id)!;
    expect([c.totals.valid.value, c.totals.invalid.value, c.totals.cast.value]).toEqual([valid, invalid, cast]);
    expect(c.candidates.reduce((sum, p) => sum + (p.votes?.value ?? 0), 0)).toBe(valid);
    expect(valid + invalid).toBe(cast);
  });
  it('preserves secondary 1999 totals and three withdrawn nominees without votes', () => {
    const c = electionContext.pmContests[1];
    expect(c.totals.invalid.source.evidence).toBe('secondary');
    expect(c.totals.cast.source.evidence).toBe('secondary');
    expect(c.candidates.filter(p => p.status === 'withdrawn')).toHaveLength(3);
    expect(c.candidates.filter(p => p.status === 'withdrawn').every(p => !p.votes && p.source?.evidence === 'official' && p.source.sourceId === 'k15-agreements-gazette')).toBe(true);
  });
  it('links 2001 to k15 without a new Knesset', () => {
    expect(electionContext.pmContests[2]).toMatchObject({ electionId: 'k15', contestType: 'prime-minister-only' });
  });
});

// Gazette YP 4414 p.3483 reports shares differently from two-decimal arithmetic rounding.
it('retains sourced published 1996 PM shares independently of vote-ratio rounding', () => {
  const c = electionContext.pmContests.find(c => c.id === 'pm1996')!;
  expect(c.candidates.map(p => p.publishedPercent?.value)).toEqual([50.49, 49.51]);
  expect(c.candidates.map(p => p.publishedPercent?.source.sourceId)).toEqual(['k14-results-gazette', 'k14-results-gazette']);
  const copy = structuredClone(electionContext);
  copy.pmContests[0].candidates[0].publishedPercent!.value = 101;
  expect(() => validateElectionContext(copy)).toThrow('invalid published percentage');
});
