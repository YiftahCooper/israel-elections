// The "Israeli localities in Judea and Samaria" group. Until 12 Nov 2026 it left out CBS subdistrict 77, described as
// "Gaza in older files". Subdistrict 77 is Hebron (Kiryat Arba, Karmel, Otniel ...); the Gaza Strip localities were
// district 8. The group is district 7 in full, plus the Jewish community in Hebron (the committee's locality 3400).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type Class = { code: number; district: number; subdistrict: number };
type Loc = { rows: { code: number | null }[]; groups?: { id: string; codes: number[]; definitionEn: string; definitionHe: string }[] };
const json = <T,>(p: string): T => JSON.parse(readFileSync(p, 'utf8'));
const YEAR: Record<number, number> = { 16: 2003, 18: 2009, 19: 2013, 20: 2015, 21: 2019, 22: 2019, 23: 2020, 24: 2021, 25: 2022, 26: 2024 };
const KIRYAT_ARBA = 3611, HEBRON = 3400;

describe('Judea and Samaria locality group', () => {
  for (const [k, year] of Object.entries(YEAR)) it(`k${k}: every district 7 locality with results is in it, and nothing else`, () => {
    const loc = json<Loc>(`public/data/k${k}-localities.json`);
    const classes = new Map(json<Class[]>(`data/raw/demographics/cbs-${year}-normalized.json`).map((c) => [c.code, c]));
    const group = loc.groups!.find((g) => g.id === 'judea-samaria')!;
    const voted = loc.rows.map((r) => r.code).filter((c): c is number => c !== null);
    const want = voted.filter((c) => classes.get(c)?.district === 7 || c === HEBRON).sort((a, b) => a - b);
    expect(group.codes).toEqual(want);
    expect(group.codes).toContain(KIRYAT_ARBA);
    expect(group.codes.filter((c) => c !== HEBRON).every((c) => classes.get(c)!.district === 7)).toBe(true);
    expect(group.codes.some((c) => classes.get(c)?.subdistrict === 77)).toBe(true);
    expect(group.definitionEn + group.definitionHe).not.toMatch(/Gaza|עזה/);
  });
});
