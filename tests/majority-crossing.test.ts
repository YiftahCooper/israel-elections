import { describe, expect, it } from 'vitest';
import { majorityCrossing } from '../src/app/governmentSupport.ts';

// V2 fault A8 (19 Nov 2026): the 61 line of a recommendation bar ran through a list's ballot letters.
describe('majorityCrossing', () => {
  it('finds the piece the 61 line crosses and its larger side', () => {
    // 2021 first round: Netanyahu's 52, then Yesh Atid's 17 from 52 to 69; the line at 61 leaves 9 seats before it
    expect(majorityCrossing([30, 9, 7, 6, 17, 7, 7, 6, 31])).toEqual({ index: 4, side: 'start', room: 9 });
    expect(majorityCrossing([58, 10, 52])).toEqual({ index: 1, side: 'end', room: 7 });
  });
  it('is null when the line falls between two pieces', () => {
    expect(majorityCrossing([61, 59])).toBeNull();
  });
});
