import { describe, expect, test } from 'vitest';
import { GROUPS, SETTINGS, SETTING_IDS, DECIMAL_CHOICES, TIERS, rowMatches, rowTier, rowVisible, settingDefault, settingValue, validSettings } from '../src/app/settings.ts';
import { PREFERENCES } from '../src/app/preferences.ts';
import { exactDecimal, fmtPct, fmtPp, pctExactNote } from '../src/app/format.ts';
import { FEATURES } from '../src/app/features.ts';

const he = /[֐-׿]/;
describe('the settings registry', () => {
  test('every row is bilingual, explained, grouped and shown at some level', () => {
    for (const r of SETTINGS) {
      expect(r.label[0], r.id).toMatch(/\w/); expect(r.label[1], r.id).toMatch(he);
      if (r.id !== 'lang') { expect(r.info?.[0], r.id).toBeTruthy(); expect(r.info?.[1], r.id).toMatch(he); }
      expect(GROUPS.some(g => g.id === r.group), r.id).toBe(true);
      expect(['simple', 'standard', 'expert']).toContain(r.min);
      for (const o of r.options ?? []) { expect(o.label[0]).toBeTruthy(); expect(o.label[1]).toBeTruthy(); }
      if (r.feature) expect(FEATURES.some(f => f[0] === r.feature), r.id).toBe(true);
    }
  });
  test('labels are short (explanations live behind the (i))', () => {
    for (const r of SETTINGS) expect(r.label[0].split(' ').length, r.id).toBeLessThanOrEqual(5);
  });
  test('ids are unique, and toggles and segmented controls match their option counts', () => {
    expect(new Set(SETTINGS.map(r => r.id)).size).toBe(SETTINGS.length);
    for (const r of SETTINGS) {
      if (r.control === 'toggle') expect(typeof settingDefault(r.id as never, 'standard'), r.id).toBe('boolean');
      if (r.control === 'seg') expect(r.options!.length, r.id).toBeGreaterThanOrEqual(2), expect(r.options!.length, r.id).toBeLessThanOrEqual(4);
    }
  });
  test('every point-of-use question has a row in Settings', () => {
    const map = { jointSeats: 'jointByParty', voteSource: 'voteSource', comparison: 'markChanges', copyMode: 'copyMode' } as const;
    for (const id of Object.keys(PREFERENCES) as (keyof typeof PREFERENCES)[]) expect(SETTINGS.some(r => r.id === map[id])).toBe(true);
  });
  test('coordinator defaults are each one value', () => {
    expect(settingDefault('theme', 'simple')).toBe('device');
    expect(settingDefault('density', 'simple')).toBe('compact');
    // parties under joint lists (owner, 9 Nov): Simple lists only, Standard parties with seats, Expert all
    expect(settingDefault('jointListParties', 'simple')).toBe('none');
    expect(settingDefault('jointListParties', 'standard')).toBe('seated');
    expect(settingDefault('jointListParties', 'expert')).toBe('all');
    // Simple shows lists only, so its seats carry no party colour by default either
    expect(settingDefault('jointListSeats', 'simple')).toBe('list');
    expect(settingDefault('jointListSeats', 'standard')).toBe('both');
    expect(settingDefault('jointListSeats', 'expert')).toBe('both');
    expect(settingDefault('hoverPopups', 'simple')).toBe(true);
    expect(settingDefault('decimals', 'simple')).toBe(1);
    expect(settingDefault('decimals', 'standard')).toBe(2);
    expect(settingDefault('decimals', 'expert')).toBe(3);
    expect(settingDefault('voteCounts', 'simple')).toBe(false);
    expect(settingDefault('voteCounts', 'standard')).toBe(true);
    // the "compared with last time" row line is opt-in at every level (owner, 8 Nov): Compare shows the change
    for (const level of ['simple', 'standard', 'expert'] as const) expect(settingDefault('lastTimeRows', level)).toBe(false);
  });
  test('a value the user set wins at every level; defaults follow the level', () => {
    expect(settingValue({}, 'decimals', 'simple')).toBe(1);
    expect(settingValue({ decimals: 3 }, 'decimals', 'simple')).toBe(3);
    expect(settingValue({ decimals: 3 }, 'decimals', 'expert')).toBe(3);
  });
  test('invalid stored values fall back silently', () => {
    expect(validSettings({ decimals: 5, theme: 'blue', listSymbol: 'letters', blocShading: 'no', surprise: 1 })).toEqual({ listSymbol: 'letters' });
    expect(validSettings(null)).toEqual({});
    expect(validSettings([1])).toEqual({});
  });
});

describe('every setting at every level, in tiers (owner, 9 Nov)', () => {
  const ids = (level: 'simple' | 'standard' | 'expert') => SETTINGS.filter(r => rowVisible(r, level)).map(r => r.id);
  test('every level shows every row; only the Simple starter tip is Simple-only', () => {
    expect(ids('simple').length).toBe(SETTINGS.length);
    expect(ids('standard')).toEqual(SETTINGS.filter(r => r.id !== 'starterTip').map(r => r.id));
    expect(ids('expert')).toEqual(ids('standard'));
  });
  test('each tier has rows, in Simple, Standard, Expert order', () => {
    expect(TIERS).toEqual(['simple', 'standard', 'expert']);
    for (const t of TIERS) expect(SETTINGS.some(r => r.group !== 'top' && rowTier(r) === t), t).toBe(true);
    // the point-of-use question for votes is asked at every level, so its setting is a Simple one
    expect(rowTier(SETTINGS.find(r => r.id === 'voteSource')!)).toBe('simple');
    expect(rowTier(SETTINGS.find(r => r.id === 'jointListParties')!)).toBe('simple');
  });
});

describe('bilingual search', () => {
  const find = (q: string) => SETTINGS.filter(r => rowMatches(r, q)).map(r => r.id);
  test('English and Hebrew words find the same setting, whatever the interface language', () => {
    expect(find('logo')).toContain('listSymbol');
    expect(find('סמל')).toContain('listSymbol');
    expect(find('אותיות')).toContain('listSymbol');
    expect(find('dark')).toContain('theme');
    expect(find('כהה')).toContain('theme');
  });
  test('synonyms reach zero-seat rows, decimals and motion', () => {
    expect(find('0 seats')).toEqual(expect.arrayContaining(['jointListParties', 'seatlessLists']));
    expect(find('אפס')).toEqual(expect.arrayContaining(['jointListParties']));
    expect(find('%')).toContain('decimals');
    expect(find('animation')).toContain('reduceMotion');
    expect(find('tooltip')).toContain('hoverPopups');
    expect(find('nothing like this')).toEqual([]);
  });
});

describe('stored values', () => {
  test('every registry setting can be stored and read back', () => {
    for (const id of SETTING_IDS) {
      const v = id === 'decimals' ? DECIMAL_CHOICES[0] : settingDefault(id, 'standard');
      expect(validSettings({ [id]: v }), id).toEqual({ [id]: v });
    }
  });
  test('the record is sparse: an empty one means every default', () => {
    for (const id of SETTING_IDS) expect(settingValue({}, id, 'standard')).toEqual(settingDefault(id, 'standard'));
  });
});

describe('threshold-safe rounding', () => {
  // a share of `num/den` percent, as votes out of a whole of 10^6 (exact)
  const W = 1_000_000;
  const votes = (p: number) => Math.round(p * W / 100);
  test.each([
    ['1', 0.96], ['1', 1.04], ['1.5', 1.46], ['1.5', 1.54], ['2', 1.96], ['2', 2.04], ['3.25', 3.249], ['3.25', 3.251], ['3.25', 3.2], ['3.25', 3.4],
  ])('threshold %s%%, share %f%%: never on the wrong side, at most one digit past the maximum', (t, share) => {
    for (const d of DECIMAL_CHOICES) {
      const shown = fmtPct(votes(share), W, d, t);
      const n = Number(shown.replace(/[<%]/g, '')) - (shown.startsWith('<') ? 1e-9 : 0); // "<1%" reads as below 1
      expect(n < Number(t), `${shown} at ${d} decimals`).toBe(share < Number(t));
      expect((shown.split('.')[1] ?? '%').length - 1, shown).toBeLessThanOrEqual(d + 1);
      // the extra digit only where ordinary rounding would cross
      const plain = fmtPct(votes(share), W, d);
      if ((Number(plain.replace(/[<%]/g, '')) < Number(t)) === (share < Number(t))) expect(shown).toBe(plain);
    }
  });
  test('the owner’s example: 1.46% at 1 decimal against 1.5% shows "1.46%", not "1.5%"', () => {
    expect(fmtPct(votes(1.46), W, 1, '1.5')).toBe('1.46%');
    expect(fmtPct(votes(1.46), W, 1)).toBe('1.5%');
  });
  test('one more digit, not rounding away: 3.4% at 0 decimals against 3.25% shows "3.4%"', () => {
    expect(fmtPct(votes(3.4), W, 0, '3.25')).toBe('3.4%');
    expect(fmtPct(votes(3.251), W, 1, '3.25')).toBe('3.3%');
    expect(fmtPct(votes(3.25), W, 1, '3.25')).toBe('3.3%');
    expect(fmtPct(votes(0.6), W, 0, '1')).toBe('0.6%');
  });
  test('if the extra digit would still cross, it is rounded toward the true side', () => {
    expect(fmtPct(votes(1.4996), W, 1, '1.5')).toBe('1.49%');
    expect(fmtPct(votes(3.2496), W, 2, '3.25')).toBe('3.249%');
  });
  test('away from the threshold nothing changes', () => {
    expect(fmtPct(votes(10.84), W, 1, '3.25')).toBe('10.8%');
    expect(fmtPct(votes(0.2), W, 2, '3.25')).toBe('0.2%');
    expect(fmtPct(votes(3.24), W, 1, '3.25')).toBe('3.2%');
  });
  test('fractional estimates are shown, not refused', () => {
    expect(fmtPct(155811.00000000015, 1_000_000, 1)).toBe('15.6%');
    expect(fmtPct(0.4, 2.5, 0)).toBe('16%');
  });
  test('a non-zero share is never shown as zero', () => {
    expect(fmtPct(3, W, 1)).toBe('<0.1%');
    expect(fmtPct(3, W, 0)).toBe('<1%');
    expect(fmtPct(3, W, 2)).toBe('<0.01%');
    expect(fmtPct(0, W, 1)).toBe('0%');
    expect(fmtPct(5, 0, 1)).toBe('—%');
  });
});

describe('the exact share and percentage-point changes', () => {
  const W = 1_000_000, votes = (p: number) => Math.round(p * W / 100);
  test('every rounded share has an exact note, at every cap; a value shown in full has none', () => {
    for (const d of DECIMAL_CHOICES) {
      expect(pctExactNote(1, 3, d, undefined, 'en')).toBe('33.333333…%: the exact share');
      expect(pctExactNote(0, W, d, undefined, 'en')).toBeUndefined();
      expect(pctExactNote(1, 8, d, undefined, 'en')).toBe(d === 0 ? '12.5%: the exact share' : undefined);
    }
    expect(pctExactNote(votes(10.84), W, 1, '3.25', 'en')).toBe('10.84%: the exact share');
    expect(pctExactNote(votes(10.84), W, 2, '3.25', 'en')).toBeUndefined();
    expect(pctExactNote(1, 3, 3, undefined, 'he')).toBe('33.333333…%: השיעור המדויק');
    // a share shown with an extra digit near the threshold also says why
    expect(pctExactNote(votes(1.4567), W, 1, '1.5', 'en')).toBe('1.4567%: the exact share. One more decimal is shown so it doesn’t look above the 1.5% threshold');
    expect(pctExactNote(votes(1.46), W, 1, '1.5', 'en')).toBeUndefined();
    expect(pctExactNote(votes(3.4), W, 0, '3.25', 'he')).toBeUndefined();
    expect(pctExactNote(votes(3.41), W, 0, '3.25', 'he')).toMatch(/^3\.41%: השיעור המדויק\. .*מתחת לאחוז החסימה \(3\.25%\)$/);
  });
  test('exact decimals are never rounded: in full when they end, else six decimals and an ellipsis', () => {
    expect(exactDecimal(1n, 3n)).toBe('0.333333…');
    expect(exactDecimal(2n, 3n)).toBe('0.666666…');
    expect(exactDecimal(271n, 25n)).toBe('10.84');
    expect(exactDecimal(5n, 1n)).toBe('5');
    expect(exactDecimal(-1n, 8n)).toBe('−0.125');
    expect(exactDecimal(123456789n, 1n)).toBe('123,456,789');
  });
  test('percentage points: signed, capped, never a non-zero change shown as zero', () => {
    expect(fmtPp({ num: 1234n, den: 1000n }, 1)).toBe('+1.2');
    expect(fmtPp({ num: -1234n, den: 1000n }, 0)).toBe('−1');
    expect(fmtPp({ num: 3n, den: 1000n }, 1)).toBe('+<0.1');
    expect(fmtPp({ num: -3n, den: 1000n }, 2)).toBe('−<0.01');
    expect(fmtPp({ num: 0n, den: 1n }, 1)).toBe('0');
    expect(fmtPp({ num: 123456789n, den: 1000000n }, 3)).toBe('+123.457');
  });
});
