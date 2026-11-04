import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { expect, it } from 'vitest';
import { electionContext } from '../src/data/electionContext.ts';

const load = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
it('attaches every context list target to a real list in the selected dataset', () => {
  for (const event of electionContext.events) {
    if (event.listId) expect(load(`public/data/${event.electionId}.json`).lists.map((l: any) => l.id), event.id).toContain(event.listId);
  }
});
it('retains hash-verified evidence for every step 3 event and related source', () => {
  const manifest = load('data/raw/SOURCES.json');
  const originalIds = new Set(['assembly-identity', 'assembly-transition', 'war-postponement', 'flatto-capacity']);
  for (const event of electionContext.events.filter(e => !originalIds.has(e.id) && /^(eligibility-|candidate-|list-|withdraw|opening-|registered-|result-source-|double-envelope)/.test(e.id))) {
    for (const source of [event.source, ...(event.relatedSources ?? [])]) {
      const record = manifest.find((s: any) => s.id === source.sourceId);
      expect(record, event.id).toBeDefined();
      expect(createHash('sha256').update(readFileSync(`data/raw/${record.file}`)).digest('hex'), source.sourceId).toBe(record.sha256);
    }
  }
});
it('keeps secondary history qualified and attaches the k26 withdrawal notice to the list whose page carries it', () => {
  expect(electionContext.events.filter(e => e.id.startsWith('eligibility-final-')).every(e => e.source.evidence === 'secondary')).toBe(true);
  // the notice is on Ahi's own CEC page and names Ahi's candidates; Brit Olam contested (252 votes)
  expect(electionContext.events.find(e => e.id === 'withdrawal-k26-צבי')).toMatchObject({ listId: '26-צבי', source: { evidence: 'official', url: 'https://www.gov.il/he/pages/chozrim-leshorashim_list32' } });
  expect(electionContext.events.some(e => e.listId === '26-זץ' && e.type === 'withdrawal')).toBe(false);
  expect(electionContext.events.filter(e => e.id.startsWith('list-') && e.electionId === 'k26').map(e => e.listId)).toEqual(['26-ודם','26-ודם','26-ד','26-ד']);
});
