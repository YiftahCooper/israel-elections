import { describe, expect, test } from 'vitest';
import postcss from 'postcss';
import { scaleAwareMedia, scaleQuery, scopeSelector } from '../scripts/scale-aware-media.ts';

describe('width breakpoints follow the effective width under large text', () => {
  test('breakpoints scale by the zoom, and adjacent ranges still meet', () => {
    expect(scaleQuery('(max-width: 760px)')).toBe('(max-width: 874px)');
    expect(scaleQuery('(min-width: 761px)')).toBe('(min-width: 874.01px)');
    expect(scaleQuery('(min-width: 761px) and (max-width: 1100px)')).toBe('(min-width: 874.01px) and (max-width: 1265px)');
    expect(scaleQuery('(pointer: coarse)')).toBe('(pointer: coarse)');
  });
  test('selectors are scoped on and under the root, without changing specificity', () => {
    expect(scopeSelector('.band', '[data-text="large"]')).toEqual([':where(:root[data-text="large"]) .band', ':where(:root[data-text="large"]).band']);
    expect(scopeSelector('[dir="rtl"] .x', ':not([data-text="large"])')).toContain(':where(:root:not([data-text="large"]))[dir="rtl"] .x');
    expect(scopeSelector('html', '[data-text="large"]')).toEqual(['html:where(:root[data-text="large"])']);
    expect(scopeSelector(':root[data-x] .y', '[data-text="large"]')).toEqual([':root:where([data-text="large"])[data-x] .y']);
  });
  test('a width rule becomes a normal and a large copy; other media rules are untouched', async () => {
    const css = '@media (max-width: 760px) { .band { gap: 2px; } } @media (prefers-reduced-motion: reduce) { .x { transition: none; } } .y { color: red; }';
    const out = (await postcss([scaleAwareMedia()]).process(css, { from: undefined })).css;
    expect(out).toContain('@media (max-width: 760px)');
    expect(out).toContain('@media (max-width: 874px)');
    expect(out).toContain(':where(:root:not([data-text="large"])) .band');
    expect(out).toContain(':where(:root[data-text="large"]) .band');
    expect(out).toContain('@media (prefers-reduced-motion: reduce) { .x { transition: none; } }');
    expect(out).toContain('.y { color: red; }');
    expect(out.match(/@media/g)).toHaveLength(3);
  });
});
