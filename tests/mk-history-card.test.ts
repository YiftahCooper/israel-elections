// The MK history card, drawn to markup. Review V3 F3, 19 Nov 2026: the key showed a lone "1" for numbered events, also on
// cards with no numbered mark (the owner read the same "1" in the Party history key as "only event 1 is this"). Review D2:
// "Not elected" and "Elected; did not sit" rows with an official note and a linked list had two identical (i) side by side.
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { compileMkHistory, type MkReview } from '../scripts/mk-history-runtime.ts';
import { mkView, type MkRuntime } from '../src/history/mk.ts';
import { MkKey } from '../src/app/components/MkHistory.tsx';

const rt = compileMkHistory(process.cwd(), { leftOut: [], anomalies: [] } as MkReview) as unknown as MkRuntime;
const byRun = (list: string, rank: number) => Number(Object.entries(rt.people).find(([, p]) => p.runs.some((r) => r[1] === list && r[2] === rank))![0]);
const byName = (he: string) => Number(Object.entries(rt.people).find(([, p]) => p.he === he)![0]);

describe('MK history card', () => {
  it('the key explains numbered marks only on a card that has them, and with no number', () => {
    const seen = { with: 0, without: 0 };
    for (const id of [byName('גאולה כהן'), byName('משה דיין'), byRun('25-ג', 7), byRun('24-מחל', 16)]) {
      const v = mkView(rt, id)!;
      const marks = v.rows.some((r) => r.events.some((e) => e.kind === 'recorded'));
      const html = renderToStaticMarkup(createElement(MkKey, { v }));
      expect(html.includes('mk-key-mark'), `${v.he}: key entry`).toBe(marks);
      expect(html).not.toMatch(/mk-key-mark[^>]*>\s*<b>/);
      seen[marks ? 'with' : 'without']++;
    }
    expect(seen.with).toBeGreaterThan(0);
    expect(seen.without).toBeGreaterThan(0);
  });

});
