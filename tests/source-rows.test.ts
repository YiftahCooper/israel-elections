import { describe, expect, it } from 'vitest';
import { aftermathRecords, pageSources, sourceRows } from '../src/data/aftermath-runtime.ts';

// V2 fault A9 (19 Nov 2026): two sources that read the same (name, kind and retrieval date) were listed as two identical
// rows. They now share one row, every address kept.
describe('aftermath source rows', () => {
  it('no two rows read the same, and no address is lost, in all 26 elections and both languages', () => {
    for (const r of Object.values(aftermathRecords)) for (const lang of ['en', 'he'] as const) {
      const rows = sourceRows(r!, lang);
      const keys = rows.map(x => `${x.label}|${x.kind}|${x.accessed}`);
      expect(new Set(keys).size, `${r!.electionId} ${lang}`).toBe(keys.length);
      expect(rows.flatMap(x => x.sources.map(s => s.url))).toEqual(expect.arrayContaining(pageSources(r!).map(s => s.url)));
      expect(rows.reduce((n, x) => n + x.sources.length, 0)).toBe(pageSources(r!).length);
    }
  });
  it('1949: the two ministerial-appointment queries share one row', () => {
    const row = sourceRows(aftermathRecords.k1!, 'en').find(x => x.label === 'Knesset open data: ministerial appointments')!;
    expect(row.sources).toHaveLength(2);
  });
});
