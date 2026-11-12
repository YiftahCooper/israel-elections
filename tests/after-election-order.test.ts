// After the election, second audit pass (12 Nov 2026): the order of events, the fact that ends the term, the
// Sources page's aftermath list and the Coalitions presets, checked over every record.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { aftermathRecords, chronological, visibleTermEvents, termEndFact, sourceLabel, pageSources, type DatedFact } from '../src/data/aftermath-runtime.ts';
import type { ElectionDataset } from '../src/data/schema.ts';

const records = Object.values(aftermathRecords).sort((a, b) => Number(a!.electionId.slice(1)) - Number(b!.electionId.slice(1)));
/** b is not before a: compared at the precision the coarser of the two dates has */
const notBefore = (a: string, b: string) => { const n = Math.min(a.length, b.length); return b.slice(0, n) >= a.slice(0, n); };

describe('c-famous-early-05: events are listed in the order they happened', () => {
  it('no list on the page goes backwards, in all 26 elections', () => {
    let pairs = 0;
    for (const r of records) {
      const lists: [string, DatedFact[]][] = [['formation', r!.formation.events], ['term', visibleTermEvents(r!.term.events)], ['reaction', r!.reaction?.items ?? []], ['changes', r!.government?.changes ?? []]];
      for (const [name, events] of lists) {
        const shown = chronological(events);
        shown.slice(1).forEach((e, i) => { pairs++; expect(notBefore(shown[i].date, e.date), `${r!.electionId} ${name}: ${shown[i].date} then ${e.date}`).toBe(true); });
      }
    }
    expect(records).toHaveLength(26);
    expect(pairs).toBeGreaterThan(150);
  });
  it('the three cases the audit found', () => {
    const term = (k: string) => chronological(visibleTermEvents(aftermathRecords[k as 'k6']!.term.events)).map(e => e.textEn);
    const k6 = term('k6');
    expect(k6.findIndex(t => t.includes('national unity government'))).toBeLessThan(k6.findIndex(t => t.includes('Six-Day War, 5–10 June')));
    const k9 = term('k9');
    expect(k9.findIndex(t => t.includes('Coastal Road massacre'))).toBeLessThan(k9.findIndex(t => t.includes('Operation Litani')));
    const k2 = chronological(aftermathRecords.k2!.formation.events).filter(e => e.date === '1955-06-29').map(e => e.type);
    expect(k2).toEqual(['mandate-given', 'confidence-vote']);
  });
  it('an ordering field never moves an event outside its own date, and always says why', () => {
    for (const r of records) for (const e of [...r!.formation.events, ...r!.term.events]) {
      if (e.orderDate !== undefined) expect(e.orderDate.startsWith(e.date), `${r!.electionId} ${e.date}`).toBe(true);
      if (e.orderDate !== undefined || e.orderSeq !== undefined) expect(e.orderBasis, `${r!.electionId} ${e.date}`).toBeTruthy();
    }
  });
});

describe('c-design-principles-15: the fact that ends the term is said once', () => {
  it('the footer skips it where the formation or term list already shows the same dated event', () => {
    const skipped = records.filter(r => r!.term.endedBy?.cites?.length && !termEndFact(r!)).map(r => r!.electionId);
    expect(skipped).toEqual(['k21', 'k22', 'k23']);
    expect(termEndFact(aftermathRecords.k20!)?.date).toBe('2018-12-26');
    // a different event in the same month is not the same fact (1996: the bombings and the early election)
    expect(termEndFact(aftermathRecords.k13!)?.type).toBe('early-election');
  });
});

describe('c-design-principles-17 / c-rtl-phone-06: the Sources page lists aftermath sources by name', () => {
  it('a source with a publisher never shows its web address, in either language', () => {
    for (const r of records) for (const s of Object.values(r!.sources)) for (const lang of ['en', 'he'] as const) {
      const label = sourceLabel(s, lang);
      if (s.publisher || s.publisherHe || s.title) expect(label, `${r!.electionId} ${s.url} ${lang}`).not.toBe(new URL(s.url).hostname);
    }
  });
  it('k26: official sources first, one row per address, the President’s Residence named in Hebrew', () => {
    const rows = pageSources(aftermathRecords.k26!);
    expect(rows.map(s => s.url)).toEqual([...new Set(rows.map(s => s.url))]);
    expect(rows.length).toBe(22); // 24 records, the Maariv page among them three times
    const kinds = rows.map(s => s.kind);
    expect(kinds.lastIndexOf('official')).toBeLessThan(kinds.indexOf('secondary'));
    expect(rows.filter(s => sourceLabel(s, 'he') === 'בית הנשיא')).toHaveLength(16);
    expect(rows.map(s => sourceLabel(s, 'he'))).not.toContain('www.president.gov.il');
  });
});

describe('c-famous-early-08: sibling Coalitions presets follow one pattern', () => {
  const meta = (k: number) => JSON.parse(readFileSync(`data/meta/k${k}.json`, 'utf8')) as { blocSchemes?: { id: string; nameEn: string; nameHe: string; blocs: { id: string; color: string }[] }[] };
  const ds = (k: number) => JSON.parse(readFileSync(`public/data/k${k}.json`, 'utf8')) as ElectionDataset;
  it('the first-government preset: one title pattern and one colour per side, every election that has one', () => {
    let n = 0;
    for (let k = 1; k <= 26; k++) {
      const scheme = meta(k).blocSchemes?.find(s => s.id === 'first-government');
      if (!scheme) continue;
      const number = aftermathRecords[`k${k}` as 'k1']!.government!.number;
      expect(scheme.nameEn, `k${k}`).toBe(`Government ${number} (first government of the Knesset)`);
      expect(scheme.nameHe, `k${k}`).toBe(`הממשלה ה־${number} (הממשלה הראשונה של הכנסת)`);
      expect(Object.fromEntries(scheme.blocs.map(b => [b.id, b.color.toUpperCase()])), `k${k}`).toMatchObject({ coalition: '#3A6EA5', opposition: '#8C8C8C' });
      n++;
    }
    expect(n).toBe(23);
  });
  it('the satellite-list preset is named after that year’s party, from the dataset’s own list names', () => {
    for (let k = 1; k <= 9; k++) {
      const scheme = meta(k).blocSchemes!.find(s => s.id === 'labour-affiliated-arab-lists')!;
      const party = ds(k).lists.find(l => ['Mapai', 'Alignment'].includes(l.shortEn!))!;
      expect(scheme.nameEn, `k${k}`).toBe(party.shortEn === 'Mapai' ? 'Mapai and its affiliated Arab (satellite) lists' : 'The Alignment and its affiliated Arab (satellite) lists');
      expect(scheme.nameHe, `k${k}`).toBe(party.shortEn === 'Mapai' ? `${party.shortHe} והרשימות הערביות המסונפות אליה (רשימות לוויין)` : `${party.shortHe} והרשימות הערביות המסונפות אליו (רשימות לוויין)`);
    }
  });
});
