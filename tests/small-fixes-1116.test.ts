// Small fixes of 16 Nov 2026 (see the e2e twin, tests/e2e/small-fixes-1116.spec.ts).
import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { memberNameGivenFirst } from '../src/app/derive.ts';
import { OPEN_CHECKS } from '../src/history/relations.ts';
import { GLOSSARY_TERMS } from '../src/app/glossary-data.ts';
import type { ElectionDataset } from '../src/data/schema.ts';

const ds = (k: number) => JSON.parse(readFileSync(`public/data/k${k}.json`, 'utf8')) as ElectionDataset;
const elected = (d: ElectionDataset) => d.lists.flatMap((l) => l.candidates.filter((c) => !c.notSeated).slice(0, d.officialSeats?.[l.id] ?? 0));

test('every elected member of every Knesset is named given name first in the seat chart', () => {
  expect(memberNameGivenFirst({ nameHe: 'כהן יורם', memberNameHe: 'יורם כהן' })).toBe('יורם כהן');
  // a printed two-word name is turned round; a longer one is kept, since where its family name ends is not certain
  expect(memberNameGivenFirst({ nameHe: 'שוחט אילן' })).toBe('אילן שוחט');
  expect(memberNameGivenFirst({ nameHe: 'בן ארי מירב' })).toBe('בן ארי מירב');
  // a curated misprint correction wins over the Knesset record's order
  expect(memberNameGivenFirst({ nameHe: 'שפירא אליהו', displayNameHe: 'שפייזר אליהו', memberNameHe: 'אליהו שפייזר' })).toBe('אליהו שפייזר');
  // the 2026 newcomers have the Knesset's own name, though no website page yet
  const k26 = elected(ds(26));
  expect(k26.find((c) => c.id === '26-דרך#2')?.memberNameHe).toBe('יורם כהן');
  expect(k26.filter((c) => !c.memberNameHe)).toEqual([]);
  // across all 26 Knessets only five seats lack the record (two 1977 ranks both printed כהן יגאל, Emil/Haim Amsalem
  // 2006, and two members named elected who never sat), and all five are two-word printed names
  const missing = Array.from({ length: 26 }, (_, i) => elected(ds(i + 1))).flat().filter((c) => !c.memberNameHe);
  expect(missing.map((c) => c.id).sort()).toEqual(['17-שס#11', '20-ל#4', '24-ב#3', '9-מחל#21', '9-מחל#24'].sort());
  for (const c of missing) expect(memberNameGivenFirst(c).split(' ')).toHaveLength(2);
});

test('a party register already read says what it found, so it is never shown as not yet checked', () => {
  const dem = OPEN_CHECKS.find((o) => o.id === 'democrats-registrar-date')!;
  expect(dem.partyIds).toContain('democrats');
  expect(dem.certainty).toBe('disputed');
  expect(dem.checkedAt).toBe('2026-11-16');
  expect(dem.summaryEn).toMatch(/^Registered name and legal change date remain unresolved/);
  expect(dem.summaryHe).toMatch(/^שם הרישום/);
  const lineage = JSON.parse(readFileSync('data/meta/party-lineage.json', 'utf8')) as { pending: { id: string; registerCheckedAt?: string; summaryEn?: string; partyIds?: string[]; from?: string[] }[] };
  for (const p of lineage.pending.filter((p) => p.partyIds?.length && !p.from && p.registerCheckedAt && p.summaryEn))
    expect(OPEN_CHECKS.find((o) => o.id === p.id)?.summaryEn, p.id).toBe(p.summaryEn);
});

test('one English spelling per person: the Knesset record (Saeed Alkharumi), never Alharumi or al-Harumi', () => {
  const files = ['data/meta/aftermath/k24.json', 'data/research/knesset-events/k24.json'];
  for (const f of files) {
    const text = readFileSync(f, 'utf8');
    expect(text, f).not.toMatch(/Alharumi|al-Harumi|Said al/);
    expect(text, f).toContain('Alkharumi');
  }
  const k24 = elected(ds(24));
  expect(k24.find((c) => c.nameHe === 'אלחרומי סעיד')?.nameEn).toBe('Saeed Alkharumi');
  // the other variants found in the same sweep, outside quotations from sources
  const visible = ['data/meta/election-context.json', 'data/meta/candidate-notes.json', 'data/meta/aftermath/k11.json', 'data/meta/aftermath/k4.json', 'data/meta/aftermath/k23.json']
    .map((f) => readFileSync(f, 'utf8').split('\n').filter((l) => !/^\s*"quote"/.test(l)).join('\n')).join('\n');
  for (const variant of ['Haneen Zoabi', 'Michael Ben-Ari', 'Michael Reiser', 'Eliyahu Speiser', "Meir Ya'ari", 'Muhammad Wattad', 'Binyamin Mintz', 'Orly Levy-Abekasis'])
    expect(visible).not.toContain(variant);
});

test('double envelopes: the glossary says the count includes invalid ballots and the map shows the valid ones', () => {
  const g = GLOSSARY_TERMS.find((x) => x.id === 'envelopes')!;
  expect(g.defEn).toContain('includes ballots found invalid');
  expect(g.defHe).toContain('כולל קולות שנפסלו');
  // the two figures the app shows for 2026 are both in the official file: 452,687 envelopes, 450,074 of them valid
  expect(ds(26).totals.envelopeVotes).toBe(452687);
  const rows = (JSON.parse(readFileSync('public/data/k26-localities.json', 'utf8')) as { rows: { code: number; votesCast: number; invalid: number; valid: number }[] }).rows;
  expect(rows.find((r) => r.code === 9999)).toMatchObject({ votesCast: 452687, invalid: 2613, valid: 450074 });
});
