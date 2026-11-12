// A member's days the Knesset's rows leave open are flagged in the research file and counted in the data-gaps register
// (audit 12 Nov, cx-factions-05 and cx-events-06): never a blank faction track or a zero-day service shown as fact.
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { generateFullRegister, memberChangeGaps } from '../scripts/gaps-register.ts';

const dir = 'data/research/knesset-member-changes';
const files = readdirSync(dir).filter((f) => /^k\d+\.json$/.test(f)).map((f) => `${dir}/${f}`);
const docs = files.map((file) => ({ file, doc: JSON.parse(readFileSync(file, 'utf8')) }));
type Span = { start: string; end: string };

// the days of [start, end) no faction row covers (written apart from the app's helper on purpose)
function uncovered(start: string, end: string, rows: { start: string; end: string | null }[]): Span[] {
  const out: Span[] = [];
  let at = start;
  for (const r of [...rows].sort((a, b) => a.start.localeCompare(b.start))) {
    if (r.start > at) out.push({ start: at, end: r.start < end ? r.start : end });
    if ((r.end ?? end) > at) at = r.end ?? end;
  }
  if (at < end) out.push({ start: at, end });
  return out.filter((s) => s.start < s.end);
}

describe('research files flag what the official rows leave open', () => {
  it('every uncovered stretch of a tenure has a faction gap, and every faction gap is such a stretch', () => {
    const missing: string[] = [], extra: string[] = [];
    for (const { doc } of docs) for (const t of doc.tenures) {
      if (t.end !== null && t.end <= t.start) continue;
      const open = t.end === null ? [] : uncovered(t.start, t.end, t.factions).map((s) => `${s.start}→${s.end}`);
      const flagged = (t.gaps ?? []).filter((g: any) => g.about === 'faction').map((g: any) => `${g.start}→${g.end}`);
      for (const s of open) if (!flagged.includes(s)) missing.push(`k${doc.knesset} tenure ${t.id}: ${s}`);
      for (const s of flagged) if (!open.includes(s)) extra.push(`k${doc.knesset} tenure ${t.id}: ${s}`);
    }
    expect(missing).toEqual([]);
    expect(extra).toEqual([]);
  });

  it('a membership that ends no later than it starts is flagged as unsettled dates (Malul, 20 Jul 2025)', () => {
    const bad = docs.flatMap(({ doc }) => doc.tenures.filter((t: any) => t.end !== null && t.end <= t.start)
      .filter((t: any) => !(t.gaps ?? []).some((g: any) => g.about === 'dates')).map((t: any) => `k${doc.knesset} ${t.id}`));
    expect(bad).toEqual([]);
    const malul = docs.find(({ doc }) => doc.knesset === 25)!.doc.tenures.find((t: any) => t.id === 32308);
    expect(malul.gaps.map((g: any) => g.about)).toEqual(['dates']);
  });

  it('the five member-days of cx-events-06 and Litzman’s two days are among them', () => {
    const at = (k: number, id: number) => docs.find(({ doc }) => doc.knesset === k)!.doc.tenures.find((t: any) => t.id === id).gaps
      .map((g: any) => [g.about, g.start, g.end]);
    expect(at(24, 23765)).toEqual([['faction', '2021-04-06', '2021-04-08']]); // Litzman (528)
    expect(at(24, 23824)).toEqual([['faction', '2021-06-20', '2021-06-22']]); // person 23673
    expect(at(24, 23772)).toEqual([['faction', '2021-06-23', '2021-06-25']]); // person 23631
    expect(at(25, 31723)).toEqual([['faction', '2023-10-14', '2023-10-15']]); // person 30809
    expect(at(25, 30390)).toEqual([['faction', '2026-01-20', '2026-01-21']]); // person 1057
  });
});

describe('the data-gaps register counts them', () => {
  it('one open register row per flagged stretch, under Membership records', () => {
    const flagged = docs.reduce((n, { doc }) => n + doc.tenures.reduce((m: number, t: any) => m + (t.gaps?.length ?? 0), 0), 0);
    expect(flagged).toBe(15);
    const rows = generateFullRegister().gaps.filter((g) => g.file.startsWith(dir));
    expect(rows).toHaveLength(flagged);
    expect(rows.every((g) => g.kind === 'unknown' && g.certainty === 'unknown' && g.status === 'open')).toBe(true);
    expect(rows.find((g) => g.locations[0].endsWith('gaps[0]') && /23765/.test(g.item))?.uncertainty).toMatch(/not settled/);
  });
  it('reads only the tenure gaps of a file', () => {
    expect(memberChangeGaps('x/k9.json', { knesset: 9, tenures: [{ id: 1, factions: [] }, { id: 2, gaps: [{ about: 'dates', note: 'n' }] }] }))
      .toMatchObject([{ election: 'k9', item: 'tenure 2 / $.tenures[*].gaps[*].dates', locations: ['$.tenures[1].gaps[0]'] }]);
  });
});
