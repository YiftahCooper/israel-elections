import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';

// What a reader sees from the party-family, party and lineage records (Families.tsx, FamilyEvidence.tsx,
// FamilyPoint.tsx, PartyHistory.tsx, FamilyEditor.tsx): plain words, sources named by who published them. Research
// notes (`support`), file locators, `projectReading` and the project's own research record (`proposal`) stay in fields
// the app does not display. The after-election records have the same check in knesset-confidence-records.test.ts.
const read = (file: string) => JSON.parse(readFileSync(file, 'utf8'));
const BANNED = /proposal §|local compilation|research compilation|inputs;|scoped in|taxonomy|preset/i;
const AUDIT = /\bC\d{3}\b|Scope:|OOXML|logical paragraph|evidence family|application-map|User-Agent|\b(?:data|docs|public)\/[\w./-]+|\.json\b|\bYP \d|\bIDI\b|reviewCandidates|registry conflicts|matrix/;
/** the app's own name, or its own research, presented as a source */
const OWN = /Israeli Elections Explorer|this project|this app|the app\b|research compilation|local compilation|הפרויקט|האפליקציה/i;

type Shown = { where: string; text: string };
type Source = { url?: string; publisher?: string; publisherHe?: string; locator?: string; quote?: string; kind?: string };
const families = readdirSync('data/meta/families').filter((f) => f.endsWith('.json')).map((f) => read(`data/meta/families/${f}`));
const lineage = read('data/meta/party-lineage.json');
const registry = read('data/meta/parties.json');

/** Displayed strings, with where they come from. A locator is shown only as a printed page ("p. 98"). */
function shown(): { text: Shown[]; sources: (Shown & { source: Source })[] } {
  const text: Shown[] = [], sources: (Shown & { source: Source })[] = [];
  const add = (where: string, v: unknown) => { for (const s of Array.isArray(v) ? v : [v]) if (typeof s === 'string' && s) text.push({ where, text: s }); };
  const cite = (where: string, file: Record<string, Source>, id: string) => {
    const s = file[id]; if (!s) return;
    sources.push({ where: `${where} → ${id}`, text: s.publisher ?? '', source: s });
    add(`${where} → ${id}.publisher`, s.publisher); add(`${where} → ${id}.publisherHe`, s.publisherHe); add(`${where} → ${id}.quote`, s.quote);
    if (s.locator && /^pp?\. \S+$/.test(s.locator)) add(`${where} → ${id}.locator`, s.locator);
  };
  for (const f of families) {
    for (const k of ['nameHe', 'nameEn', 'labelEn', 'labelHe', 'definition', 'definitionHe', 'limitations', 'limitationsHe']) add(`${f.id}.${k}`, f[k]);
    for (const e of f.elections) {
      for (const id of e.voteSourceIds ?? []) cite(`${f.id}.${e.electionId} votes`, f.sources, id);
      for (const m of e.members) {
        const w = `${f.id}.${e.electionId}.${m.listId}`;
        add(`${w}.claim`, m.classificationEvidence.claim); add(`${w}.claimHe`, m.classificationEvidence.claimHe);
        for (const id of m.classificationEvidence.sourceIds) cite(w, f.sources, id);
      }
      for (const r of e.reviewCandidates) {
        const w = `${f.id}.${e.electionId}.${r.listId}`;
        add(`${w}.reason`, r.reason); add(`${w}.reasonHe`, r.reasonHe);
        for (const id of r.sourceIds) cite(w, f.sources, id);
      }
    }
  }
  // relations the app reads (edges, and pending items with both ends) show their sources; party-only checks show a summary
  for (const e of [...lineage.edges, ...lineage.pending]) {
    if (e.from?.length && e.to?.length) for (const id of e.sources ?? []) cite(`lineage.${e.id}`, lineage.sources, id);
    add(`lineage.${e.id}.summaryEn`, e.summaryEn); add(`lineage.${e.id}.summaryHe`, e.summaryHe);
  }
  for (const p of registry.parties) { add(`parties.${p.id}.nameHe`, p.nameHe); add(`parties.${p.id}.nameEn`, p.nameEn); }
  return { text, sources };
}
const { text, sources } = shown();

describe('reader text in the party-family, party and lineage records', () => {
  it('reads a sensible amount of displayed text', () => { expect(text.length).toBeGreaterThan(2000); expect(sources.length).toBeGreaterThan(1000); });
  it('no displayed text carries research-pipeline words, file names or claim ids', () => {
    expect(text.filter((s) => BANNED.test(s.text) || AUDIT.test(s.text)).map((s) => `${s.where}: ${s.text.slice(0, 90)}`)).toEqual([]);
  });
  it('every displayed source is named by who published it, never by the app or its own research', () => {
    expect(sources.filter((s) => !s.source.publisher?.trim()).map((s) => s.where)).toEqual([]);
    expect(sources.filter((s) => OWN.test(`${s.source.publisher} ${s.source.publisherHe ?? ''}`)).map((s) => `${s.where}: ${s.source.publisher}`)).toEqual([]);
    expect(sources.filter((s) => /^(?:IDI|CEC|Knesset)$/.test(s.source.publisher!.trim())).map((s) => `${s.where}: ${s.source.publisher}`)).toEqual([]);
  });
  it('the project’s own research record is never a displayed source; a placement resting on it says so in words', () => {
    expect(sources.filter((s) => s.where.endsWith('→ proposal')).map((s) => s.where)).toEqual([]);
    for (const f of families) for (const e of f.elections) for (const m of e.members) {
      const ce = m.classificationEvidence;
      if (ce.projectReading && ce.status === 'inferred') expect([m.listId, ce.claim]).toEqual([m.listId, expect.stringMatching(/^Placed here by this project, from the sources below\./)]);
    }
  });
  it('every displayed claim, reason and definition has its Hebrew', () => {
    const missing: string[] = [];
    for (const f of families) {
      if (!f.definitionHe || !Array.isArray(f.limitationsHe) || f.limitationsHe.length !== f.limitations.length) missing.push(`${f.id} definition/limitations`);
      for (const e of f.elections) {
        for (const m of e.members) if (!m.classificationEvidence.claimHe) missing.push(`${f.id}.${e.electionId}.${m.listId} claim`);
        for (const r of e.reviewCandidates) if (!r.reasonHe) missing.push(`${f.id}.${e.electionId}.${r.listId} reason`);
      }
    }
    expect(missing).toEqual([]);
  });
});
