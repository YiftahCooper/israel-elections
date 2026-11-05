import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { electionContext } from '../src/data/electionContext.ts';

// What the Sources screen and the band's About show must read in English on English pages, label
// secondary evidence, and never point at English Wikipedia.
const load = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const manifest: any[] = load('public/data/sources.json');
const index: { id: string; available: boolean; status: any }[] = load('public/data/elections.json');
const datasets = index.filter(e => e.available && !e.id.startsWith('pm')).map(e => load(`public/data/${e.id}.json`));
const hebrewOnly = (t: string) => /[֐-׿]/.test(t) && !/[A-Za-z]{4}/.test(t.replace(/\b(gov\.il|data\.gov\.il|via|dataset|votes-knesset)\b/g, ''));

it('the published source list is the provenance manifest', () => {
  expect(manifest).toEqual(load('data/raw/SOURCES.json'));
});

it('every source an election lists has an English publisher and description', () => {
  const byId = new Map(manifest.map(s => [s.id, s]));
  for (const ds of datasets) for (const id of ds.sourceIds) {
    const s = byId.get(id);
    expect(s, `${ds.id}: ${id}`).toBeDefined();
    expect(hebrewOnly(s.publisherEn ?? s.publisher), `${id} publisher`).toBe(false);
    expect(/[A-Za-z]/.test(s.descriptionEn ?? s.description), `${id} description`).toBe(true);
  }
});

it('no source, logo credit or context link uses English Wikipedia', () => {
  const urls = [...manifest.map(s => s.url ?? ''),
    ...datasets.flatMap(ds => ds.lists.flatMap((l: any) => [l.logo, ...(l.parties ?? []).map((p: any) => p.logo)].filter(Boolean).map((x: any) => x.sourceUrl))),
    ...electionContext.events.flatMap(e => [e.source, ...(e.relatedSources ?? [])].map(s => s.url))];
  for (const u of urls) expect(u, u).not.toMatch(/(^|\/\/|\.)en\.(m\.)?wikipedia\.org/);
});

it('About events give English publishers on English pages', () => {
  for (const e of electionContext.events) for (const s of [e.source, ...(e.relatedSources ?? [])])
    expect(hebrewOnly(s.publisher), `${e.id}: ${s.publisher}`).toBe(false);
});

it('the election index stage matches the dataset stage', () => {
  for (const ds of datasets) {
    const entry = index.find(e => e.id === ds.id)!;
    expect(entry.status.stage, ds.id).toBe(ds.status.stage);
  }
});
