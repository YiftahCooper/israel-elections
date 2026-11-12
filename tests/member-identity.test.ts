// Comparison matching joins people across elections by their Knesset member record (memberKey). Who a person is and
// how sure the Wikipedia or party links are are separate questions: a probable Hebrew Wikipedia link must not hide an
// official Knesset identity, and no key may ever join two different people (audit 12 Nov, ax-build-guesses-03).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { memberKey } from '../src/app/compare/match.ts';
import { bioIdentityCertainty } from '../scripts/lib/build/bios.ts';

type Entry = Parameters<typeof bioIdentityCertainty>[0] & { knessetPersonId?: number | null };
const ks = Array.from({ length: 26 }, (_, i) => `k${i + 1}`);
const rows = ks.flatMap((k) => {
  const bios: Record<string, Entry> = JSON.parse(readFileSync(`data/meta/bios/${k}.json`, 'utf8')).candidates;
  const ds: ElectionDataset = JSON.parse(readFileSync(`public/data/${k}.json`, 'utf8'));
  return ds.lists.flatMap((l) => l.candidates.map((c) => ({ k, c, e: bios[c.id] })));
});

describe('Knesset member identity in comparison matching', () => {
  it('keys every candidate whose Knesset identity is confirmed, whatever the other links', () => {
    const missed = rows.filter(({ c, e }) => e && c.bio?.knesset && bioIdentityCertainty(e) === 'confirmed' && memberKey(c) !== c.bio.knesset).map(({ c }) => c.id);
    expect(missed).toEqual([]);
    // Almog Cohen (2022 Otzma Yehudit #7, 2026 Likud #13): one person, one key
    const at = (id: string) => rows.find(({ c }) => c.id === id)!.c;
    expect(memberKey(at('25-ט#7'))).toBeDefined();
    expect(memberKey(at('25-ט#7'))).toBe(memberKey(at('26-מחל#13')));
  });
  it('keys no one whose identity is not confirmed or reviewed high', () => {
    const extra = rows.filter(({ c, e }) => memberKey(c) && !(e && (bioIdentityCertainty(e) === 'confirmed' || e.confidence === 'high'))).map(({ c }) => c.id);
    expect(extra).toEqual([]);
    // 1977 Likud ranks 21 and 24 are both printed כהן יגאל; which rank is which is medium-confidence evidence
    for (const id of ['9-מחל#21', '9-מחל#24']) expect(memberKey(rows.find(({ c }) => c.id === id)!.c), id).toBeUndefined();
  });
  it('never joins two people: one key, one Knesset person id', () => {
    const people = new Map<string, Set<number>>();
    for (const { c, e } of rows) {
      const key = memberKey(c);
      if (!key) continue;
      expect(e?.knessetPersonId, c.id).toEqual(expect.any(Number));
      people.set(key, (people.get(key) ?? new Set()).add(e!.knessetPersonId!));
    }
    expect(people.size).toBeGreaterThan(1000);
    expect([...people].filter(([, ids]) => ids.size > 1)).toEqual([]);
    // and one person never stands twice in one election under the same key
    const seen = new Set<string>();
    for (const { k, c } of rows) { const key = memberKey(c); if (!key) continue; expect(seen.has(`${k} ${key}`), `${c.id} ${key}`).toBe(false); seen.add(`${k} ${key}`); }
  });
});
