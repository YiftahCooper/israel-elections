// What if…: a joint list's line never states a false equation (audit 12 Nov 2026, ax-screens-c-03). Every built-in
// question of every election, both languages, the row form and the expanded form.
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import type { ElectionDataset } from '../src/data/schema.ts';
vi.stubGlobal('localStorage', { getItem: () => null, setItem() {} });
const { computeWhatIf } = await import('../src/app/whatIf.ts');
const { Fact } = await import('../src/app/components/WhatIf.tsx');

const text = (html: string) => html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
const nums = (s: string) => (s.match(/[+−-]?\d+/g) ?? []).map((x) => Number(x.replace('−', '-')));

test('every joint fact reads true: the parts add up, and the joint list\'s own seats follow', () => {
  let joints = 0, moved = 0;
  for (let k = 1; k <= 26; k++) {
    const ds = JSON.parse(readFileSync(`public/data/k${k}.json`, 'utf8')) as ElectionDataset;
    for (const lang of ['en', 'he'] as const) for (const r of computeWhatIf(ds, lang)) for (const f of r.facts) {
      if (f.kind !== 'joint') continue;
      joints++;
      const total = f.parts.reduce((n, p) => n + p.seats, 0);
      if (f.seats !== total) moved++;
      for (const full of [false, true]) {
        const t = text(renderToStaticMarkup(createElement(Fact, { f, lang, full })));
        const where = `k${k} ${lang} ${r.p.id} ${full ? 'full' : 'row'}: ${t}`;
        // each "=" joins the parts' sum to their total; the joint list's own seats follow an arrow when they differ
        const sides = t.split('=');
        expect(sides, where).toHaveLength(2);
        const parts = nums(sides[0]).slice(-f.parts.length), after = nums(sides[1]);
        if (f.seats === total) {
          // "joint N = a + b": N is the joint list's seats and equals the parts' sum
          expect(nums(sides[0]).at(-1), where).toBe(f.seats);
          expect(after, where).toEqual(f.parts.map((p) => p.seats));
        } else {
          expect(parts, where).toEqual(f.parts.map((p) => p.seats));
          expect(after.slice(0, 2), where).toEqual([total, f.seats]);
          expect(t, where).toContain('→');
          expect(after[2], where).toBe(f.seats - total);
        }
        if (lang === 'en') expect(t, where).not.toMatch(/[א-ת]/);
      }
    }
  }
  expect(joints).toBeGreaterThan(0);
  expect(moved).toBeGreaterThan(0); // the case the audit found (2026: Religious Zionism–Zehut and Otzma Yehudit, 6 + 7 → 14)
});
