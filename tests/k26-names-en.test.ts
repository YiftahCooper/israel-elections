// The 26th Knesset's members in English (review V3 F10, 19 Nov 2026: 47 of the 120 showed only their Hebrew name in
// English). English names come only from the Knesset's own English member pages (data/raw/bios/
// knesset-site-mk-names-en.json, keyed by the Knesset's open-data site code); a name it does not give stays Hebrew.
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { electedOf } from '../src/app/derive.ts';
import { scenarioFromDataset } from '../src/model/scenario.ts';

const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'));

it('every member seated in the 26th Knesset has the English name from the Knesset site', () => {
  const ds = read('public/data/k26.json');
  const site = new Map<number, number>(read('data/raw/bios/knesset-odata-mk-site-codes.json').map((r: { KnsID: number; SiteId: number }) => [r.KnsID, r.SiteId]));
  const en = new Map<number, string>(read('data/raw/bios/knesset-site-mk-names-en.json').map((r: { siteId: number; nameEn: string }) => [r.siteId, r.nameEn]));
  const bios = read('data/meta/bios/k26.json').candidates;
  const missing: string[] = [], wrong: string[] = [];
  for (const l of scenarioFromDataset(ds).lists) for (const c of electedOf(l, ds.officialSeats[l.id] ?? 0)) {
    const official = en.get(site.get(bios[c.id]?.knessetPersonId) ?? -1);
    if (!c.nameEn) missing.push(`${c.id} ${c.nameHe}`);
    // the site's text, spaces tidied (it has "Yitzhak  Kroizer")
    else if (official && c.nameEn !== official.replace(/\s+/g, ' ').trim() && !bios[c.id]?.displayNameEn) wrong.push(`${c.id} ${c.nameEn} ≠ ${official}`);
  }
  expect(missing).toEqual([]);
  expect(wrong).toEqual([]);
});
