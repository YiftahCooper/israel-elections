import { describe, expect, test } from 'vitest';
import { GROUPS, SETTINGS, SETTING_IDS, DECIMAL_CHOICES, rowMatches, rowVisible, settingDefault, settingValue, validSettings } from '../src/app/settings.ts';
import { PREFERENCES } from '../src/app/preferences.ts';
import { fmtPct, fmtPp, pctExactNote } from '../src/app/format.ts';
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
    expect(settingDefault('seatlessParties', 'simple')).toBe(false);
    expect(settingDefault('hoverPopups', 'simple')).toBe(true);
    expect(settingDefault('decimals', 'simple')).toBe(1);
    expect(settingDefault('decimals', 'standard')).toBe(1);
    expect(settingDefault('decimals', 'expert')).toBe(2);
    expect(settingDefault('voteCounts', 'simple')).toBe(false);
    expect(settingDefault('voteCounts', 'standard')).toBe(true);
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

describe('visibility by level', () => {
  const ids = (level: 'simple' | 'standard' | 'expert', custom: Record<string, 'show'> | null = null) => SETTINGS.filter(r => rowVisible(r, level, custom)).map(r => r.id);
  test('Simple shows the basics, the starter tip and every accessibility row; not the advanced rows', () => {
    const s = ids('simple');
    for (const id of ['level', 'lang', 'theme', 'starterTip', 'jointByParty', 'seatlessParties', 'seatlessLists', 'decimals', 'markChanges', 'textSize', 'reduceMotion', 'hoverPopups', 'preferTables', 'keepMessages']) expect(s).toContain(id);
    for (const id of ['voteSource', 'chamberLayout', 'compareWith', 'listOrder', 'withdrawnLists']) expect(s).not.toContain(id);
  });
  test('Standard adds the rest and drops the Simple-only tip; Expert shows the same rows', () => {
    expect(ids('standard')).not.toContain('starterTip');
    expect(ids('standard')).toContain('voteSource');
    expect(ids('expert')).toEqual(ids('standard'));
    expect(ids('standard').length).toBe(SETTINGS.length - 1);
  });
  test('Custom shows a row whose owning feature is shown', () => {
    expect(ids('simple', { chamberOptions: 'show' })).toContain('chamberLayout');
    expect(ids('simple', { compare: 'show' })).toContain('compareWith');
    expect(ids('simple', { compare: 'show' })).not.toContain('chamberLayout');
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
    expect(find('0 seats')).toEqual(expect.arrayContaining(['seatlessParties', 'seatlessLists']));
    expect(find('אפס')).toEqual(expect.arrayContaining(['seatlessParties']));
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
  ])('threshold %s%%, share %f%%: never on the wrong side, never more digits than the maximum', (t, share) => {
    for (const d of DECIMAL_CHOICES) {
      const shown = fmtPct(votes(share), W, d, t);
      const n = Number(shown.replace(/[<%]/g, '')) - (shown.startsWith('<') ? 1e-9 : 0); // "<1%" reads as below 1
      expect(n < Number(t), `${shown} at ${d} decimals`).toBe(share < Number(t));
      expect((shown.split('.')[1] ?? '%').length - 1, shown).toBeLessThanOrEqual(d);
    }
  });
  test('the owner’s example: 1.46% at 1 decimal against 1.5% is rounded down, not to "1.5%"', () => {
    expect(fmtPct(votes(1.46), W, 1, '1.5')).toBe('1.4%');
    expect(fmtPct(votes(1.46), W, 1)).toBe('1.5%');
  });
  test('a list above the threshold is rounded up, not below it', () => {
    expect(fmtPct(votes(3.251), W, 1, '3.25')).toBe('3.3%');
    expect(fmtPct(votes(3.4), W, 0, '3.25')).toBe('4%');
    expect(fmtPct(votes(3.25), W, 1, '3.25')).toBe('3.3%');
    expect(fmtPct(votes(0.6), W, 0, '1')).toBe('<1%');
  });
  test('away from the threshold nothing changes', () => {
    expect(fmtPct(votes(10.84), W, 1, '3.25')).toBe('10.8%');
    expect(fmtPct(votes(0.2), W, 2, '3.25')).toBe('0.20%');
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
    expect(fmtPct(0, W, 1)).toBe('0.0%');
    expect(fmtPct(5, 0, 1)).toBe('—%');
  });
});

describe('the exact share and percentage-point changes', () => {
  const W = 1_000_000, votes = (p: number) => Math.round(p * W / 100);
  test('a share rounded toward its side of the threshold carries the exact share for its tooltip', () => {
    expect(pctExactNote(votes(1.46), W, 1, '1.5', 'en')).toBe('1.4600%: the exact share, rounded down to stay below the 1.5% threshold');
    expect(pctExactNote(votes(3.4), W, 0, '3.25', 'en')).toMatch(/^3\.4000%: .*rounded up to stay above/);
    expect(pctExactNote(votes(1.46), W, 1, '1.5', 'he')).toMatch(/^1\.4600%: השיעור המדויק/);
    // ordinary rounding: nothing to explain
    expect(pctExactNote(votes(10.84), W, 1, '3.25', 'en')).toBeUndefined();
    expect(pctExactNote(votes(1.46), W, 2, '1.5', 'en')).toBeUndefined();
  });
  test('percentage points: signed, capped, never a non-zero change shown as zero', () => {
    expect(fmtPp({ num: 1234n, den: 1000n }, 1)).toBe('+1.2');
    expect(fmtPp({ num: -1234n, den: 1000n }, 0)).toBe('−1');
    expect(fmtPp({ num: 3n, den: 1000n }, 1)).toBe('+<0.1');
    expect(fmtPp({ num: -3n, den: 1000n }, 2)).toBe('−<0.01');
    expect(fmtPp({ num: 0n, den: 1n }, 1)).toBe('0.0');
    expect(fmtPp({ num: 123456789n, den: 1000000n }, 3)).toBe('+123.457');
  });
});
