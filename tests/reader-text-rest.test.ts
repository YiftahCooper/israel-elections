import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { compileTermTimeline } from '../scripts/term-timeline-runtime.ts';
import { compileMkHistory } from '../scripts/mk-history-runtime.ts';
import { isFieldRecord } from '../src/data/aftermath-model.ts';

// What a reader sees outside the party-family records (those are in reader-text-families.test.ts): the after-election
// popups, the Sources tab, the calculator's data status, candidate notes, the election band's About, the term
// timeline, MK pages and the app's own labels. Sources are named by who published them, spelled out, never by a file,
// a record id or the project itself. The audit wording these replaced is in data/research/round7/reader-text-rest/.
const read = (file: string) => JSON.parse(readFileSync(file, 'utf8'));
type Visit = (path: string, key: string, value: unknown) => void;
function walk(o: unknown, path: string, visit: Visit) {
  if (Array.isArray(o)) o.forEach((v, i) => walk(v, `${path}[${i}]`, visit));
  else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { visit(path, k, v); walk(v, `${path}.${k}`, visit); }
}
const strings = (v: unknown) => (Array.isArray(v) ? v : [v]).filter((s): s is string => typeof s === 'string' && !!s);

/** a file, folder, record id or pipeline word in reader text */
const PIPELINE = /\b(?:data|docs|public|scripts)\/[\w./-]+|\.json\b|\.md\b|\bdecisions? \d{4}\b|\bADR \d|data-puzzles|PersonID|PositionID|\bOData\b|\bmirror\b|\b(?:retained|reused) (?:research|record|copy|file|artifact|data|Knesset)|\bk\d{1,2}-only\b|ראו החלט/;
/** acronyms a reader may not know, in a source's name */
const ACRONYM = /\b(?:CEC|CBS|IDI|YP|JTA|UPI|MFA|OCHA|AP|AFP|YNET)\b|Wikipedia \(he\)/;
/** the project, or its own repository, named as a source */
const OWN = /israel-elections repository|github\.com\/YiftahCooper|Israeli Elections Explorer|^Project |this project|הפרויקט/i;

describe('after-election popups', () => {
  const files = readdirSync('data/meta/aftermath').filter((f) => /^k\d+\.json$/.test(f));
  // every field the (i) popups show (AfterElection.tsx Evidence/HelpText/ConflictText); quotes are verbatim and not checked
  const SHOWN = new Set(['note', 'noteHe', 'noteEn', 'notes', 'locator', 'textEn', 'textHe', 'coalitionSeatsNote', 'roleGap', 'resolution', 'about', 'label', 'why']);
  const SOURCE_NAME = new Set(['publisher', 'publisherHe', 'title']);
  it('reads the after-election records', () => expect(files.length).toBeGreaterThan(20));
  it('no displayed note, locator or text names a file, a record id or a pipeline step', () => {
    const bad: string[] = [];
    for (const f of files) walk(read(`data/meta/aftermath/${f}`), f, (path, key, v) => {
      // the record's own research notes (top level, results, issue polling) are not shown
      if (path === f || path.startsWith(`${f}.results`) || path.startsWith(`${f}.issuePolling`)) return;
      if (SHOWN.has(key) || SOURCE_NAME.has(key)) for (const s of strings(v)) if (PIPELINE.test(s)) bad.push(`${path}.${key}: ${s.slice(0, 100)}`);
    });
    expect(bad).toEqual([]);
  });
  it('every source is named in words by who published it', () => {
    const bad: string[] = [];
    for (const f of files) walk(read(`data/meta/aftermath/${f}`), f, (_path, key, v) => {
      if (key !== 'sources' || !v || typeof v !== 'object' || Array.isArray(v)) return;
      for (const [id, s] of Object.entries(v as Record<string, { publisher?: string; publisherHe?: string; title?: string }>)) {
        const name = [s.publisherHe, s.publisher, s.title].filter(Boolean).join(' · ');
        if (!name.trim() || ACRONYM.test(name) || OWN.test(name)) bad.push(`${f} ${id}: ${name}`);
      }
    });
    expect(bad).toEqual([]);
  });
  it('a quote that is a list of database fields is not shown, and its plain note says what the record holds, in both languages', () => {
    const bad: string[] = []; let n = 0;
    for (const f of files) walk(read(`data/meta/aftermath/${f}`), f, (path, key, v) => {
      if (key !== 'cites' || !Array.isArray(v)) return;
      v.forEach((c: { quote?: string; note?: string; noteHe?: string }, i: number) => { if (c.quote && isFieldRecord(c.quote)) { n++; if (!c.note || !c.noteHe) bad.push(`${path}.cites[${i}]`); } });
    });
    expect(n).toBeGreaterThan(200);
    expect(bad).toEqual([]);
    expect(isFieldRecord('PersonToPositionID 17248; PersonID 965; PositionID 45')).toBe(true);
    expect(isFieldRecord('69 to 45 with five abstentions')).toBe(false);
  });
  // a recorded disagreement and how the research settled it are research notes: the settled fact is shown, its
  // sources stay behind each fact's (i), and the notes never reach a popup (clarity pass, 26 Nov 2026)
  it('research notes and recorded disagreements are not shown in the popups, and never as data', () => {
    const src = readFileSync('src/app/components/AfterElection.tsx', 'utf8');
    expect(src).not.toMatch(/JSON\.stringify\(\s*(?:c|conflict|conflicts)\b/);
    expect(src).not.toMatch(/'Research notes|formation\.conflicts|reconciliation\.note/);
  });
});

describe('Sources tab', () => {
  const used = new Set<string>();
  for (let k = 1; k <= 26; k++) if (existsSync(`public/data/k${k}.json`)) for (const id of read(`public/data/k${k}.json`).sourceIds as string[]) used.add(id);
  type Rec = { id: string; url: string; publisher?: string; publisherEn?: string; description?: string; descriptionEn?: string; note?: string; own?: boolean };
  const records = (read('data/raw/SOURCES.json') as Rec[]).filter((s) => used.has(s.id));
  it('reads the records the elections cite', () => expect(records.length).toBeGreaterThan(100));
  it('the project’s own transcriptions are marked as its own, with a plain description in both languages', () => {
    const own = records.filter((s) => !/^https?:\/\//.test(s.url) || /^Project /.test(s.publisher ?? ''));
    expect(own.length).toBeGreaterThan(20);
    expect(own.filter((s) => !s.own).map((s) => s.id)).toEqual([]);
    expect(own.filter((s) => !s.description || !s.descriptionEn || /[A-Za-z]{4}/.test(s.description.replace(/data\.gov\.il/g, ''))).map((s) => s.id)).toEqual([]);
  });
  it('names and descriptions have no files, record ids or bare acronyms', () => {
    const bad: string[] = [];
    for (const s of records) {
      // the project's own records show only their plain description, under "Copied by hand from the originals"
      if (!s.own) for (const n of strings([s.publisher, s.publisherEn])) if (ACRONYM.test(n) || PIPELINE.test(n)) bad.push(`${s.id} name: ${n}`);
      for (const d of strings([s.description, s.descriptionEn, s.note])) if (PIPELINE.test(d) || /\bCEC\b|\bCBS\b|\bYP \d/.test(d)) bad.push(`${s.id} description: ${d.slice(0, 100)}`);
    }
    expect(bad).toEqual([]);
  });
  it('the Sources panel lists the project’s own work apart and shows no file path', () => {
    const src = readFileSync('src/app/components/Panels.tsx', 'utf8');
    expect(src).toMatch(/sources-own/);
    expect(src).not.toMatch(/Project record:/);
    expect(src).not.toMatch(/see decision \d{4}|ראו החלטה \d{4}/i);
  });
});

describe('data status and candidate notes', () => {
  const STATUS = /See decisions?|See ADR|data-puzzles|ראו החלט|\bk\d+-only\b|OData|\bCEC\b|\bCBS\b|\bYP \d|למ״ס|PersonID|\.json\b|retained (?:Knesset|research)|reviewed roster record/;
  it('every election’s status note is plain', () => {
    const bad: string[] = [];
    for (const e of read('public/data/elections.json') as { id: string; status?: { noteEn?: string; noteHe?: string } }[])
      for (const s of strings([e.status?.noteEn, e.status?.noteHe])) if (STATUS.test(s)) bad.push(`index ${e.id}: ${s.match(STATUS)![0]}`);
    for (let k = 1; k <= 26; k++) {
      const f = `public/data/k${k}.json`; if (!existsSync(f)) continue;
      const ds = read(f);
      for (const s of strings([ds.status.noteEn, ds.status.noteHe])) if (STATUS.test(s)) bad.push(`k${k}: ${s.match(STATUS)![0]}`);
    }
    expect(bad).toEqual([]);
  });
  it('candidate notes are plain', () => {
    const bad = (read('data/meta/candidate-notes.json').notes as { candidateId: string; en: string; he: string }[])
      .flatMap((n) => strings([n.en, n.he]).filter((s) => STATUS.test(s)).map((s) => `${n.candidateId}: ${s.slice(0, 80)}`));
    expect(bad).toEqual([]);
  });
});

describe('election band, term timeline and MK pages', () => {
  it('the band’s source names are spelled out, in each language', () => {
    const bad: string[] = [];
    walk(read('data/meta/election-context.json'), 'context', (path, key, v) => {
      if (key === 'publisher' || key === 'publisherHe') for (const s of strings(v)) if (ACRONYM.test(s) || PIPELINE.test(s) || OWN.test(s)) bad.push(`${path}.${key}: ${s}`);
      if (key === 'publisherHe' && typeof v === 'string' && /^[A-Za-z]/.test(v) && !/^(?:ynet|Globes|data\.gov\.il)/i.test(v)) bad.push(`${path}.publisherHe is English: ${v}`);
    });
    expect(bad).toEqual([]);
  });
  const labels = (o: unknown, out: string[] = []): string[] => {
    if (Array.isArray(o)) {
      if ((o.length === 2 || o.length === 3) && typeof o[0] === 'string' && typeof o[1] === 'string' && /^https?:/.test(o[1])) { out.push(o[0], ...(typeof o[2] === 'string' ? [o[2]] : [])); return out; }
      o.forEach((v) => labels(v, out));
    } else if (o && typeof o === 'object') Object.values(o).forEach((v) => labels(v, out));
    return out;
  };
  it('the term timeline and MK pages name sources by publisher, never a bare web address or the project', () => {
    const all = [...labels(compileTermTimeline()), ...labels(compileMkHistory())];
    expect(all.length).toBeGreaterThan(300);
    const bad = [...new Set(all.filter((s) => !s.trim() || ACRONYM.test(s) || OWN.test(s) || /^(?:www\.)?[\w-]+\.(?:co\.il|org\.il|gov\.il|com|org|net)$/.test(s)))];
    expect(bad).toEqual([]);
  });
});

describe('the app’s own labels', () => {
  const files: string[] = [];
  const list = (dir: string) => { for (const e of readdirSync(dir, { withFileTypes: true })) { const p = join(dir, e.name); if (e.isDirectory()) list(p); else if (/\.tsx?$/.test(e.name)) files.push(p); } };
  list('src/app');
  /** pipeline words a reader should not meet in the interface */
  const JARGON = /\bpresets?\b|\bscope[ds]?\b|\binputs\b|\bcompilation\b|\bproposal\b|\bOData\b|\bCEC\b|\bYP \d|see decision \d|ראו החלטה \d/i;
  it('no English or Hebrew string the reader sees uses internal words or bare acronyms', () => {
    const bad: string[] = [];
    const pair = /\bL\(\s*(['`])((?:\\.|(?!\1).)*)\1\s*,\s*(['`])((?:\\.|(?!\3).)*)\3\s*\)/g;
    for (const f of files) for (const m of readFileSync(f, 'utf8').matchAll(pair)) if (JARGON.test(m[2]) || JARGON.test(m[4])) bad.push(`${f}: ${m[2].slice(0, 80)}`);
    expect(bad).toEqual([]);
  });
});
