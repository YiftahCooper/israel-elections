// Copy votes, as offered from 22 Nov 2026: "Number of votes" (with "Adjust for the number of eligible voters", ticked
// by default) and "Share of valid votes" stand for the three stored methods, whose calculations do not change.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { baselineOf } from '../src/app/derive.ts';
import { adjustOf, basisOf, COPY_MODE_DEFAULT, modeOf, planVotes, type DefaultCopyMode } from '../src/app/compare/copy.ts';
import { COPY_WORDS } from '../src/app/compare/copyText.ts';
import { PREFERENCES } from '../src/app/preferences.ts';

describe('the two choices and the checkbox map onto the three stored methods', () => {
  it('ticked is eligible, unticked is count, share ignores the checkbox', () => {
    expect(modeOf('votes', true)).toBe('eligible');
    expect(modeOf('votes', false)).toBe('count');
    expect(modeOf('share', true)).toBe('share');
    expect(modeOf('share', false)).toBe('share');
  });
  it('every stored method shows as its choice and checkbox, and maps back to itself', () => {
    for (const m of ['eligible', 'count', 'share'] as DefaultCopyMode[]) expect(modeOf(basisOf(m), adjustOf(m))).toBe(m);
    expect([basisOf('eligible'), adjustOf('eligible')]).toEqual(['votes', true]);
    expect([basisOf('count'), adjustOf('count')]).toEqual(['votes', false]);
    // share leaves the checkbox at its default, ticked
    expect([basisOf('share'), adjustOf('share')]).toEqual(['share', true]);
  });
  it('the default is the adjusted number of votes: "Number of votes" with the checkbox ticked', () => {
    expect([basisOf(COPY_MODE_DEFAULT), adjustOf(COPY_MODE_DEFAULT)]).toEqual(['votes', true]);
  });
  it('Settings and the remembered answers name each stored method in the box’s words', () => {
    expect(PREFERENCES.copyMode.options.map((o) => o.value)).toEqual(['eligible', 'count', 'share']);
    expect(PREFERENCES.copyMode.options.map((o) => o.label)).toEqual([COPY_WORDS.adjusted, COPY_WORDS.notAdjusted, COPY_WORDS.share]);
    expect(COPY_WORDS.adjust).toEqual(['Adjust for the number of eligible voters', 'התאמה לגודל ציבור הבוחרים']);
    expect(COPY_WORDS.adjusted).toEqual(['Votes adjusted for the number of eligible voters', 'קולות לפי גודל ציבור הבוחרים']);
  });
});

describe('the worked example, re-derived from the official results: Likud 2022 copied into 2026', () => {
  const load = (id: string): ElectionDataset => JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8'));
  const k26 = baselineOf(load('k26')), k25 = baselineOf(load('k25'));
  const L25 = k25.lists.find((l) => l.shortEn === 'Likud')!, L26 = k26.lists.find((l) => l.shortEn === 'Likud')!;
  const copied = (m: DefaultCopyMode) => {
    const p = planVotes({ from: { sc: k25, start: k25, name: '2022', official: true }, to: k26, ctx: { base: k26 }, units: [{ src: [L25.id], dst: [L26.id] }], mode: m, policy: { kind: 'proportional' } });
    if (!p.ok) throw new Error(p.reason.en);
    return p.result.lists.find((l) => l.id === L26.id)!.votes;
  };
  it('number of votes, not adjusted: the literal count', () => expect(copied(modeOf('votes', false))).toBe(1_115_336));
  it('number of votes, adjusted for the number of eligible voters', () => {
    // 1,115,336 × 7,331,981 ÷ 6,788,804, to the nearest vote
    expect([k25.registered, k26.registered]).toEqual([6_788_804, 7_331_981]);
    expect(copied(modeOf('votes', true))).toBe(1_204_575);
  });
  it('share of valid votes', () => expect(copied(modeOf('share', true))).toBe(1_332_255));
});
