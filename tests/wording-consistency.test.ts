import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Wording and consistency rules for on-screen strings (19 Nov 2026 audit). Each block scans the source or data that
// reaches the screen and fails on any instance of the family, so a later edit cannot bring one back.
const files = (dir: string, re = /\.(ts|tsx)$/): string[] => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? files(p, re) : re.test(f) ? [p] : [];
});
const QUOTED = /'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g;
/** Every quoted string in src/, with file:line, comments skipped. */
const srcStrings = (): { at: string; s: string }[] => files('src').flatMap((f) => readFileSync(f, 'utf8').split('\n')
  .flatMap((line, i) => /^\s*(\/\/|\*|\/\*)/.test(line) ? [] : (line.match(QUOTED) ?? []).map((s) => ({ at: `${f}:${i + 1}`, s }))));

describe('complexity, not "level", in Hebrew', () => {
  // Simple, Standard and Expert are complexities (owner, 19 Nov 2026). רמה alone is "level"; the only Hebrew level
  // word allowed is רמת מורכבות. Other meanings stay: date precision (ברמת שנה), a turnout level (לרמת 2015), and
  // the Settings search synonyms, which must keep the words people type.
  const ALLOWED = [/ברמת שנה/, /לרמת 2015/, /synonyms|מצב רמה פירוט/];
  it('says רמת מורכבות wherever a level word is used', () => {
    const hits = srcStrings().filter(({ s }) => /(^|[^א-ת])[בלמוה]?(רמה|רמת|רמות|הרמה)(?![א-ת])/.test(s.replace(/רמת המורכבות|רמת מורכבות/g, ''))
      && !ALLOWED.some((a) => a.test(s))).map(({ at, s }) => `${at} ${s.slice(0, 80)}`);
    expect(hits).toEqual([]);
  });
  it('calls Simple פשוט, never בסיסי', () => {
    expect(srcStrings().filter(({ s }) => /בסיסי/.test(s)).map(({ at }) => at)).toEqual([]);
  });
});

describe('words about a person follow the Knesset record, else neutral', () => {
  // A candidate, a named MK or a nominee may be a woman, and most candidates have no Knesset person record. Labels
  // that describe one person are nouns (כניסה, הימנעות), never a masculine verb or possessive.
  const HE_LABELS = /L\('(?:moved|enters|leaves|Their vote|votes as its list now|Candidate name|Withdrawn before polling|Member|Abstain|Abstained|Absent)', '([^']*)'\)/g;
  const MASCULINE = /^(הועבר|נכנס|יוצא|ההצבעה שלו|מצביע כעת כמו רשימתו|שם המועמד|פרש לפני ההצבעה|חבר בקואליציה|נמנע|נעדר)$/;
  it('labels about one person are not masculine', () => {
    const hits = files('src').flatMap((f) => [...readFileSync(f, 'utf8').matchAll(HE_LABELS)]
      .filter((m) => MASCULINE.test(m[1])).map((m) => `${f}: ${m[0]}`));
    expect(hits).toEqual([]);
  });
  it('the neutral form of a gendered word is not the feminine one', () => {
    // gw(gender, masculine, feminine, neutral) and g(...): "חזרה לכנסת" reads as "she returned" for anyone
    const CALL = /\b(?:gw|g)\(\s*[\w.]+,\s*'([^']*)',\s*'([^']*)',\s*'([^']*)'\)/g;
    const hits = files('src').flatMap((f) => [...readFileSync(f, 'utf8').matchAll(CALL)]
      .filter((m) => m[3] === m[2] || m[3] === m[1]).map((m) => `${f}: ${m[0]}`));
    expect(hits).toEqual([]);
  });
  it('notes about candidates with no Knesset record use no gendered verb', () => {
    const notes = JSON.parse(readFileSync('data/meta/candidate-notes.json', 'utf8')).notes as { candidateId: string; he: string; en: string }[];
    const VERB = /(^|[\s;:,])(התפטר|נבחר|הוכרז|הודיע|נשמר|הוחלף|פרש|כיהן|נכנס)(?=[\s;:,.]|$)/;
    const hits = notes.filter((n) => {
      const ds = JSON.parse(readFileSync(`public/data/k${n.candidateId.split('-')[0]}.json`, 'utf8'));
      const c = ds.lists.flatMap((l: { candidates: { id: string; bio?: { knesset?: string } }[] }) => l.candidates).find((x: { id: string }) => x.id === n.candidateId);
      // a clause naming someone else by list number ("עידית סילמן (8) כיהנה") is about that person
      return !c?.bio?.knesset && (n.he.split(/[.;]/).some((s) => !/\(\S*\d+\)/.test(s) && VERB.test(s.replace(/השם נשמר/g, ""))) || /\b(he|she|his|her)\b/i.test(n.en));
    }).map((n) => n.candidateId);
    expect(hits).toEqual([]);
  });
  it('election-context text about Davidi and Shohat (no Knesset record) is neutral', () => {
    const texts = readFileSync('data/meta/election-context.json', 'utf8').split('\n').filter((l) => /Davidi|Shohat|דוידי|שוחט/.test(l));
    expect(texts.length).toBeGreaterThan(0);
    expect(texts.filter((l) => /\b(he|his|him)\b|הודיע|מופיע כנבחר|הוכרז כנבחר|יישאר|ייכנס/i.test(l))).toEqual([]);
  });
});

describe('Hebrew Wikipedia is labelled secondary in the link text', () => {
  it('no link text names Wikipedia without the label', () => {
    // the bare names that were link text: "Wikipedia (he)", "ויקיפדיה", "Hebrew Wikipedia (a secondary source)"
    const hits = srcStrings().filter(({ s }) => /^['"`](Wikipedia \(he\)|ויקיפדיה|ויקיפדיה העברית|Hebrew Wikipedia|Hebrew Wikipedia \(a secondary source\))['"`]$/.test(s))
      .filter(({ at }) => !/publisherName\.ts/.test(at)).map(({ at, s }) => `${at} ${s}`);
    expect(hits).toEqual([]);
  });
  it('every component that links a source by its publisher runs the name through sourceLinkText', () => {
    // a source link shows its publisher's name; a Hebrew Wikipedia address must show the labelled name instead
    const LINK_BY_NAME = /<a [^>]*href=\{(s\.url|url)\}[^>]*>\{?(?!sourceLinkText)(name|publisherIn|s\.publisher|name\(s\))/;
    const hits = files('src/app/components', /\.tsx$/).filter((f) => LINK_BY_NAME.test(readFileSync(f, 'utf8')));
    expect(hits).toEqual([]);
  });
  it('labels a Hebrew Wikipedia address whatever the record calls it', async () => {
    const { sourceLinkText } = await import('../src/app/hewiki.ts');
    expect(sourceLinkText('https://he.wikipedia.org/wiki/x', 'Wikipedia (he)', 'en')).toBe('Hebrew Wikipedia (secondary)');
    expect(sourceLinkText('https://he.m.wikipedia.org/wiki/x', 'ויקיפדיה העברית', 'he')).toBe('ויקיפדיה העברית (משני)');
    expect(sourceLinkText('https://www.ynet.co.il/x', 'Ynet', 'en')).toBe('Ynet');
  });
});
