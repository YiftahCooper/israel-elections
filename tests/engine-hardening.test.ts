// Inputs the engine must refuse rather than allocate inconsistently. Scenario validation and the
// model actions already prevent both; these guard direct engine callers.
import { expect, it } from 'vitest';
import { allocate } from '../src/engine/allocate.ts';
import { ISRAEL_2014 } from '../src/engine/rules.ts';

it('rejects repeated list ids (previously 86 of 120 seats were allocated)', () => {
  const lists = [{ id: 'a', votes: 600n }, { id: 'a', votes: 300n }, { id: 'b', votes: 100n }];
  expect(() => allocate({ rules: ISRAEL_2014, lists, agreements: [] })).toThrow('list ids must be unique');
});

it('rejects repeated agreement ids (previously the first pair received no seats)', () => {
  const lists = [{ id: 'a', votes: 400n }, { id: 'b', votes: 300n }, { id: 'c', votes: 200n }, { id: 'd', votes: 100n }];
  const agreements = [{ id: 'P', members: ['a', 'b'] }, { id: 'P', members: ['c', 'd'] }];
  expect(() => allocate({ rules: ISRAEL_2014, lists, agreements })).toThrow('agreement ids must be unique');
  // with distinct ids the two pairs are independent units
  const ok = allocate({ rules: ISRAEL_2014, lists, agreements: [agreements[0], { ...agreements[1], id: 'Q' }] });
  expect(ok.lists.map((l) => l.seats)).toEqual([48, 36, 24, 12]);
});
