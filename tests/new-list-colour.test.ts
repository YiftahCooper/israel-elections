import { describe, expect, it } from 'vitest';
import { deltaE2000, hexToLab, MIN_NEIGHBOUR_DELTA_E, SEAT_LIGHTNESS } from '../src/data/colour.ts';
import { componentColours, distinctColour, partColours } from '../src/app/newListColour.ts';

// 2026 seat-holding colours (Likud, Yashar!, Together, Joint List, The Democrats, Ra'am, Yisrael Beiteinu,
// Otzma Yehudit, UTJ, Shas, Religious Zionism–Zehut) — a crowded chamber with several blues and greens
const chamber = ['#1f5aa5', '#1baf7a', '#9a5bd0', '#66afa9', '#222dd1', '#008000', '#8fc0e6', '#eda100', '#a0601e', '#5b6ef0', '#a2a2cf'];
const clears = (c: string, taken: string[]) => taken.every((t) => deltaE2000(c, t) >= MIN_NEIGHBOUR_DELTA_E);

describe('colours for lists the user creates', () => {
  it('keeps a seed colour that already stands apart', () => {
    expect(distinctColour('#d1342c', chamber)).toBe('#d1342c');
  });
  it('moves a clashing seed until every chamber colour can be told apart from it, at seat lightness', () => {
    const c = distinctColour('#1f5aa5', chamber);
    expect(clears(c, chamber)).toBe(true);
    const L = hexToLab(c)[0];
    expect(L).toBeGreaterThanOrEqual(SEAT_LIGHTNESS[0]);
    expect(L).toBeLessThanOrEqual(SEAT_LIGHTNESS[1]);
  });
  it('gives colourless split parts distinct colours, keeping sourced ones and the lead part’s list colour', () => {
    const others = chamber.filter((c) => c !== '#a0601e');
    const [lead, b, c] = partColours([null, null, null], '#a0601e', others);
    expect(lead).toBe('#a0601e');
    expect(clears(b, [...others, lead])).toBe(true);
    expect(clears(c, [...others, lead, b])).toBe(true);
    expect(partColours(['#2535d8', '#42b23c'], '#222dd1', others)).toEqual(['#2535d8', '#42b23c']);
  });
});

describe('component-party colours of a joint list', () => {
  it('keep sourced colours, give the lead the list colour and every colourless party one that stands apart', () => {
    const others = chamber.filter((c) => c !== '#a0601e');
    const parties = [{ id: 'degel', color: null }, { id: 'aguda', color: null }, { id: 'yesh', color: '#003aa7' }];
    const out = componentColours(parties, 'aguda', '#a0601e', others);
    expect(out.aguda).toBe('#a0601e');
    expect(out.yesh).toBe('#003aa7');
    expect(clears(out.degel, [...others, '#a0601e'])).toBe(true);
  });
});
