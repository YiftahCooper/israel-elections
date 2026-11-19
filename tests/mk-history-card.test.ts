// The MK history card, drawn to markup. Review V3 F3, 19 Nov 2026: the key showed a lone "1" for numbered events, also on
// cards with no numbered mark (the owner read the same "1" in the Party history key as "only event 1 is this"). Review D2:
// "Not elected" and "Elected; did not sit" rows with an official note and a linked list had two identical (i) side by side.
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { compileMkHistory, type MkReview } from '../scripts/mk-history-runtime.ts';
import { mkView, type MkRuntime } from '../src/history/mk.ts';
import { MkKey, Result, TermBar } from '../src/app/components/MkHistory.tsx';
import { LangContext } from '../src/app/i18n.ts';

const rt = compileMkHistory(process.cwd(), { leftOut: [], anomalies: [] } as MkReview) as unknown as MkRuntime;
const byRun = (list: string, rank: number) => Number(Object.entries(rt.people).find(([, p]) => p.runs.some((r) => r[1] === list && r[2] === rank))![0]);
const byName = (he: string) => Number(Object.entries(rt.people).find(([, p]) => p.he === he)![0]);
const infoButtons = (html: string) => (html.match(/<button/g) ?? []).length;

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

  // review V3 F4: the bar named Moshe Dayan's 1977 faction "MK Moshe Dayan", the line under it "single-member faction of
  // Moshe Dayan"; one faction gets one name on a card
  it('a one-member faction has the same name on the bar as in the line under the row', () => {
    for (const [lang, solo, record] of [['en', /^single-member faction of /, /^MK /], ['he', /^סיעת היחיד של /, /^חה["״]כ /]] as const) {
      for (const [id, k] of [[byName('משה דיין'), 9], [byName('עמיחי שיקלי'), 24]] as const) {
        const v = mkView(rt, id)!, r = v.rows.find((x) => x.k === k)!;
        const html = renderToStaticMarkup(createElement(LangContext.Provider, { value: lang }, createElement(TermBar, { r, v, nums: new Map() })));
        const titles = [...html.matchAll(/class="mk-seg"[^>]*title="([^"]*)"/g)].map((m) => m[1]);
        expect(titles.some((t) => solo.test(t)), `${lang} ${v.he}: ${titles.join(' | ')}`).toBe(true);
        expect(titles.some((t) => record.test(t))).toBe(false);
      }
    }
  });

  it('an official note and how the list is linked share one (i)', () => {
    let both = 0;
    for (const [id, p] of Object.entries(rt.people)) {
      for (const run of p.runs) {
        const v = mkView(rt, Number(id))!, r = v.rows.find((x) => x.k === run[0])!;
        if (!r.run?.notes.length || !(r.run.basis === 'name' && r.run.via || r.run.research?.length)) continue;
        both++;
        const html = renderToStaticMarkup(createElement(Result, { r, v }));
        expect(infoButtons(html), `${p.he} ${run[1]}#${run[2]}`).toBe(1);
      }
    }
    expect(both).toBeGreaterThanOrEqual(2); // 2026 Shas Nos. 7 and 15 (Abutbul, Moshiashvili) at least
  });
});
