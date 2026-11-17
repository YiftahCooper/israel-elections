import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { certaintyCeiling, placementBasis, type EvidenceSource } from '../src/data/evidence.ts';
import { evidenceOf } from '../src/history/evidence-of.ts';
import { readFamilyBundle, validateFamilies } from '../scripts/validate-families.ts';

// Books batch 4 (17 Nov 2026): joint-list parties, whole joint lists, party families and party continuity, under the
// owner's book rule (two works with no shared author confirm; one stays probable). A family placement is the project's
// classification, never a certainty: it follows scholarship or the project's own judgement.
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
type Src = EvidenceSource & { quote?: string; locator?: string; publisher?: string; kind?: string };
const ceiling = (sources: Src[]) => certaintyCeiling(sources.map((source, i) => ({ id: String(i), source })));
const party = (k: number, letters: string, id: string) => read(`data/meta/k${k}.json`).lists.find((l: { letters: string }) => l.letters === letters).parties.find((p: { id: string }) => p.id === id);
const books = (sources: Src[]) => sources.filter((s) => s.kind === 'academic' && /^p\. \d+$/.test(s.locator ?? ''));
// What a reader sees must not carry research-pipeline wording or claim ids.
const AUDIT = /\b[XRHC]-?\d{3}(?:-\d)?\b|Scope:|proposal §|evidence family|batch|adjudicat|claims\.jsonl|VETTING/;

describe('books batch 4: joint-list parties', () => {
  it('confirms the 1949 religious front’s four parties from two independent works', () => {
    for (const id of ['mizrachi', 'hapoel-hamizrachi', 'agudat-yisrael', 'poalei-agudat-yisrael']) expect(ceiling(party(1, 'ב', id).sources)).toBe('confirmed');
  });
  it('confirms 2015 constituents from the gazette’s own sponsor line, and leaves the Green Movement unnamed', () => {
    for (const [letters, id] of [['אמת', 'labor'], ['ודעם', 'hadash'], ['ודעם', 'raam'], ['ודעם', 'balad'], ['טב', 'jewish-home'], ['טב', 'tkuma'], ['ג', 'agudat-yisrael'], ['ע', 'mada']] as const) {
      const p = party(20, letters, id);
      expect(p.sources.some((s: Src) => s.kind === 'official' && /מטעם המפלגות/.test(s.quote ?? ''))).toBe(true);
      expect(ceiling(p.sources)).toBe('confirmed');
    }
    expect(party(20, 'אמת', 'green-movement').sources.some((s: Src) => /מטעם המפלגות/.test(s.quote ?? ''))).toBe(false);
  });
  it('adds the 2022 sponsor line where it names the party (UTJ, Hadash–Ta’al, the New Right)', () => {
    for (const [letters, id] of [['ג', 'agudat-yisrael'], ['ג', 'degel-hatorah'], ['ום', 'hadash'], ['ום', 'taal'], ['ב', 'new-right']] as const)
      expect(ceiling(party(25, letters, id).sources)).toBe('confirmed');
  });
  it('keeps a party only one book names at probable', () => {
    for (const [k, letters, id] of [[7, 'חל', 'herut'], [10, 'ו', 'black-panthers'], [18, 'עם', 'raam']] as const) {
      const p = party(k, letters, id);
      expect(books(p.sources).length).toBe(1);
      expect(ceiling(p.sources)).toBe('probable');
    }
  });
  it('cites each book once per quote, with a page and at most 25 words', () => {
    for (let k = 1; k <= 26; k++) for (const l of read(`data/meta/k${k}.json`).lists) for (const p of [l, ...(l.parties ?? [])]) {
      const b = books(p.sources ?? []);
      expect(new Set(b.map((s) => `${s.url}|${s.quote}`)).size).toBe(b.length);
      for (const s of b) { expect(s.quote!.split(/\s+/).length).toBeLessThanOrEqual(25); expect(s.url).toMatch(/^https:\/\/(doi\.org|openlibrary\.org|www\.idi\.org\.il|ebooks\.psik\.io|www\.jstor\.org)\//); }
    }
  });
});

describe('books batch 4: party families', () => {
  const rr = read('data/meta/families/radical-right.json'), ru = read('data/meta/families/russian-speaking-immigrant.json');
  const member = (f: any, k: string, listId: string) => f.elections.find((e: any) => e.electionId === k).members.find((m: any) => m.listId === listId);
  const cited = (f: any, ce: any) => ce.sourceIds.map((id: string) => ({ id, source: f.sources[id] }));
  it('places Kach, Tehiya, Moledet and Otzma by scholarship, with book pages', () => {
    for (const [k, l] of [['k8', '8-כך'], ['k12', '12-ט'], ['k13', '13-ת'], ['k22', '22-כף']]) {
      const ce = member(rr, k, l).classificationEvidence;
      expect([ce.status, placementBasis(ce, cited(rr, ce))]).toEqual(['documented', 'scholarship']);
      expect(ce.sourceIds.filter((id: string) => /^p\. \d+$/.test(rr.sources[id].locator ?? '')).length).toBeGreaterThanOrEqual(2);
      expect(ce.claimHe).toBeTruthy();
    }
  });
  it('records Tzomet 1996 as disputed, both sides cited', () => {
    const ce = member(rr, 'k14', '14-מחל').classificationEvidence;
    expect(ce.certainty).toBe('disputed');
    const quotes = ce.sourceIds.map((id: string) => rr.sources[id].quote ?? '').join(' | ');
    expect(quotes).toMatch(/extreme right-wing parties \(Tehiya, Tzomet and Moledet\)/);
    expect(quotes).toMatch(/party of the center/);
  });
  it('leaves Tzomet 1988 (one flagged author) as it was', () => {
    expect(member(rr, 'k12', '12-צ')?.classificationEvidence.status ?? 'inferred').toBe('inferred');
  });
  it('counts DA 1992 as a Russian-speaking immigrant list; the pensioners’ list and the Jewish Home stay review cases', () => {
    const k13 = ru.elections.find((e: any) => e.electionId === 'k13');
    expect(member(ru, 'k13', '13-ד')).toMatchObject({ scope: 'core', treatment: 'include', votes: 11697 });
    expect(k13.computed.includedUnmixed.votes).toBe(11697);
    expect(k13.reviewCandidates.map((r: any) => r.listId)).toEqual(['13-ק']);
    for (const k of ['k19', 'k20']) expect(rr.elections.find((e: any) => e.electionId === k).reviewCandidates[0].reasonHe).toBeTruthy();
  });
  it('shows no claim ids or pipeline words, and never rests on Bradley', () => {
    for (const f of [rr, ru]) {
      for (const e of f.elections) for (const m of [...e.members, ...e.reviewCandidates]) {
        const ce = m.classificationEvidence;
        if (ce?.status === 'documented') for (const t of [ce.claim, ce.claimHe]) expect(t).not.toMatch(AUDIT);
        if (m.reasonHe) for (const t of [m.reason, m.reasonHe]) expect(t).not.toMatch(AUDIT);
      }
      for (const s of Object.values<any>(f.sources)) if (s.quote) { expect(`${s.publisher} ${s.quote}`).not.toMatch(AUDIT); expect(s.publisher).not.toMatch(/Bradley/); }
    }
  });
});

describe('books batch 4: party continuity', () => {
  const reg = read('data/meta/parties.json'), lin = read('data/meta/party-lineage.json');
  const edge = (id: string) => lin.edges.find((e: any) => e.id === id);
  const edgeCeiling = (e: any) => certaintyCeiling(e.sources.map((id: string) => ({ id, source: evidenceOf(lin.sources[id]) })));
  it('confirms six recurring parties from two works each, and keeps one-work steps probable', () => {
    for (const id of ['yemenite-recurring', 'haolam-recurring', 'state-list-1969-1973', 'r7-flatto-1981', 'tami-recurring', 'r7-gil-2006-2009'])
      expect([id, edge(id).certainty, edgeCeiling(edge(id))]).toEqual([id, 'confirmed', 'confirmed']);
    for (const id of ['sephardi-recurring', 'r7-ale-yarok-15-16', 'r7-ale-yarok-16-17', 'r7-greens-16-17']) expect(edge(id).certainty).toBe('probable');
  });
  it('records Shlomzion joining Herut (1977), and Ometz joining the Likud (1988) at probable: one book’s chapter and glossary', () => {
    expect(edge('r7-shlomzion-herut-1977')).toMatchObject({ from: ['vehicle-9-כנ'], to: ['herut'], relation: 'absorbed-into', certainty: 'confirmed' });
    const ometz = edge('r7-ometz-likud-1988');
    expect(ometz).toMatchObject({ from: ['vehicle-11-יש'], to: ['likud'], relation: 'absorbed-into', certainty: 'probable' });
    expect(new Set(ometz.sources.map((id: string) => lin.sources[id].publisher.replace(/^.*\bin /, ''))).size).toBe(1);
    expect(reg.partyAppearances.find((a: any) => a.listId === '11-יש' && a.electionId === 'k11').continuityEvidence.certainty).toBe('probable');
  });
  it('gives every documented continuity a plain note in both languages, never counting the dataset itself', () => {
    const documented = reg.partyAppearances.filter((a: any) => a.continuity === 'documented');
    expect(documented.length).toBe(22);
    for (const a of documented) {
      const c = a.continuityEvidence;
      expect(c.note && c.noteHe).toBeTruthy();
      for (const t of [c.note, c.noteHe]) expect(t).not.toMatch(AUDIT);
      expect(c.sources.every((id: string) => reg.sources[id].kind !== 'repository-dataset')).toBe(true);
    }
  });
  it('the validator refuses a continuity certainty above its sources', () => {
    const b = readFamilyBundle();
    expect(() => validateFamilies(b)).not.toThrow();
    const one = b.registry.partyAppearances.find((a) => a.continuityEvidence?.certainty === 'probable' && a.continuityEvidence.sources.length === 1)!;
    one.continuityEvidence!.certainty = 'confirmed';
    expect(() => validateFamilies(b)).toThrow(/continuity certainty above its sources/);
  });
});
