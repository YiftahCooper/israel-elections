import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import type { ElectionDataset } from '../src/data/schema.ts';
import { historicalDataset, verifyHistoricalProgress } from '../scripts/lib/historical/k13-k15-common.ts';
import { scenarioFromDataset, validateScenario } from '../src/model/scenario.ts';
import { Slip } from '../src/app/components/ui.tsx';
import { LangContext } from '../src/app/i18n.ts';
import { listLabel } from '../src/app/derive.ts';

const load = (): ElectionDataset => JSON.parse(readFileSync('public/data/k13.json', 'utf8'));
it('uses corrected ballot-letter keys across rebuilds and scenario serialization', () => {
  const ds = load(), rebuilt = historicalDataset(verifyHistoricalProgress('k13', { log: false }));
  const s = scenarioFromDataset(ds);
  const restored = JSON.parse(JSON.stringify(s));
  expect(validateScenario(restored)).toEqual([]);
  for (const [id, letters] of [['13-נד', 'נד'], ['13-נכ', 'נכ'], ['13-קן', 'קן']]) {
    for (const lists of [ds.lists, rebuilt.lists, restored.lists]) expect(lists.find((l: { id: string }) => l.id === id)).toMatchObject({ id, letters });
    expect(ds.officialSeats![id]).toBe(0);
    expect(id).toBe(`13-${letters}`);
    const l = ds.lists.find(l => l.id === id)!;
    // The actual shared ballot component uses the field, including its accessible name.
    for (const lang of ['he', 'en'] as const) {
      const html = renderToStaticMarkup(createElement(LangContext.Provider, { value: lang }, createElement(Slip, { ...l, name: listLabel(l, lang) })));
      expect(html).toContain(`>${letters}</span>`);
      expect(html).toContain(` ${letters} (`);
      expect(html).not.toContain(id);
    }
  }
  // Unaffected candidate identities remain exactly as published before this follow-up.
  expect(ds.lists.flatMap(l => l.candidates).map(c => c.id)).toEqual(rebuilt.lists.flatMap(l => l.candidates).map(c => c.id));
});
