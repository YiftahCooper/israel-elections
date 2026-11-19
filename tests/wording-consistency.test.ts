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

describe('a count of one reads as one, in both languages', () => {
  // "מותאם אישית: 1 בחירות שלכם", "1 smaller lists": every count that can be 1 has its own whole sentence for one.
  // Each pattern below is a plural phrase after a number; the code before it on the line must test for one.
  const PLURALS = [/\$\{[^}]+\} בחירות שלכם/, /\$\{[^}]+\} רשימות קטנות/, /\$\{[^}]+\} רשימות מתחת/, /\$\{[^}]+\} מועמדים משותפים/,
    /: L\(`\$\{entries\.length\} scenarios`/, /\$\{[^}]+\} חברי כנסת לא הצביעו/, /\$\{[^}]+\} (מ|מתוך \$\{whole\} )?מנדטיה השתתפו/,
    /\$\{ran\.length\} בחירות\)/, /מתוך \$\{h\.points\.length - h\.firstRun\} בחירות/];
  it('guards every such phrase with a branch for one', () => {
    const hits = files('src').flatMap((f) => readFileSync(f, 'utf8').split('\n').map((line, i) => ({ line, at: `${f}:${i + 1}` })))
      .flatMap(({ line, at }) => PLURALS.flatMap((p) => { const m = p.exec(line); return m && !/=== 1 \?/.test(line.slice(0, m.index)) ? [`${at} ${m[0]}`] : []; }));
    expect(hits).toEqual([]);
  });
});

describe('one date format per language, one Hebrew quotation mark, isolated English in Hebrew', () => {
  it('writes day.month.year dates like every other date on screen', async () => {
    const { datesInText } = await import('../src/app/dateFormat.ts');
    expect(datesInText('ynet, 29.1.2003.')).toBe('ynet, 29 Jan 2003.');
    expect(datesInText('המקור: ynet, 29.1.2003, ילקוט 15100 (4.11.2026).')).toBe('המקור: ynet, 29 בינו׳ 2003, ילקוט 15100 (4 בנוב׳ 2026).');
    expect(datesInText('כל 18 המועמדים התפטרו בימים 1–8.4.2019')).toBe('כל 18 המועמדים התפטרו בימים 1–8 באפר׳ 2019');
    expect(datesInText('Membership ended 1996-10-15; x')).toBe('Membership ended 15 Oct 1996; x');
    expect(datesInText('https://x/jabo/12.06.2013/2468.jpg')).toBe('https://x/jabo/12.06.2013/2468.jpg');
    expect(datesInText('32.1.2000 and 1.13.2000')).toBe('32.1.2000 and 1.13.2000');
  });
  it('never writes a numeric date (no toLocaleDateString without a style)', () => {
    const hits = files('src').flatMap((f) => readFileSync(f, 'utf8').split('\n').map((l, i) => ({ l, at: `${f}:${i + 1}` })))
      .filter(({ l }) => /toLocaleDateString\((?:[^(),]|\([^()]*\))*\)/.test(l)).map(({ at }) => at);
    expect(hits).toEqual([]);
  });
  it('runs every shown note through datesInText (the seat hover read 1996-10-15)', () => {
    const NOTE = /\{(?:lang === 'he' \? (?:n\.he : n\.en|ds\.status\.noteHe|data\.noteHe|contest\.noteHe)|lang==='he'\?ds\.status\.noteHe)/;
    const hits = files('src/app/components', /\.tsx$/).flatMap((f) => readFileSync(f, 'utf8').split('\n').map((l, i) => ({ l, at: `${f}:${i + 1}` })))
      .filter(({ l }) => NOTE.test(l) && !/datesInText\(\(?lang/.test(l)).map(({ at }) => at);
    expect(hits).toEqual([]);
  });
  it('dates in glossary sources are written out', () => {
    expect(readFileSync('src/app/glossary-data.ts', 'utf8')).not.toMatch(/(?<![\d./])\d{1,2}\.\d{1,2}\.\d{4}(?![\d/])/);
  });
  it('Hebrew uses straight quotation marks ("…"), the style most of the app already uses', () => {
    const code = srcStrings().filter(({ at, s }) => !/bidiRuns/.test(at) && /[א-ת]/.test(s) && /[„“”]/.test(s)
      && !/[A-Za-z]{3,}/.test(s.replace(/\$\{[^}]*\}/g, ''))).map(({ at }) => at);
    expect(code).toEqual([]);
    const data = files('data/meta', /\.json$/).flatMap((f) => readFileSync(f, 'utf8').split('\n').map((l, i) => ({ l, at: `${f}:${i + 1}` })))
      .filter(({ l }) => /^\s*"(noteHe|he|textHe|labelHe|definitionHe|summaryHe)": "/.test(l) && /[א-ת]/.test(l) && /[„“”]/.test(l)).map(({ at }) => at);
    expect(data).toEqual([]);
  });
  it('English candidate notes name people in English', () => {
    const notes = JSON.parse(readFileSync('data/meta/candidate-notes.json', 'utf8')).notes as { en: string }[];
    expect(notes.filter((n) => /[א-ת]+ began serving/.test(n.en)).map((n) => n.en.slice(0, 60))).toEqual([]);
  });
  it('isolates an English quotation inside Hebrew as one run', async () => {
    const { latinQuotesInHebrew } = await import('../src/app/bidiRuns.tsx');
    expect(latinQuotesInHebrew('בלוח בספר רשומה הממשלה כך: "03/49 · Ben-Gurion · Mapai · 73"; 73 מנדטים.'))
      .toEqual([{ text: 'בלוח בספר רשומה הממשלה כך: ', latin: false }, { text: '"03/49 · Ben-Gurion · Mapai · 73"', latin: true }, { text: '; 73 מנדטים.', latin: false }]);
    expect(latinQuotesInHebrew('חלק מ"פשוט", "רגיל" ו"מומחה".')).toEqual([{ text: 'חלק מ"פשוט", "רגיל" ו"מומחה".', latin: false }]);
    expect(latinQuotesInHebrew('An English "quote" stays whole')).toHaveLength(1);
  });
});

describe('one English spelling per name, where the Knesset English data gives one', () => {
  // Shown fields only: quotations, publishers, titles and source descriptions keep the spelling of their source.
  const KEEP = /^\s*"(quote\w*|publisher\w*|attribution|title\w*|url|credit|description\w*|locator|support|scope|conclusion)": /;
  const SKIP_DIRS = /data\/meta\/(bios|logos|party-links)\//;
  const WRONG: [RegExp, string][] = [
    [/Lieberman/, 'Liberman'], [/Pinchas Rosen/, 'Pinhas Rosen'], [/Yitzhak Mordechai/, 'Itzchak Mordechay'],
    [/(?<!Shneor )Zalman Shazar/, 'Shneor Zalman Shazar'], [/Haika Grossman(?!-Orkin)/, 'Haika Grossman-Orkin'],
    [/Pnina Rosenblum/, 'Penina Rosenblum'], [/Ra’am|Ta’al|Sa’ar/, "straight apostrophe (Ra'am, Ta'al, Sa'ar)"],
    [/\bRaam\b/, "Ra'am"], [/National Right/, 'New Hope – The United Right'], [/\bLabour\b/, 'Labor'],
  ];
  const shown = () => [...files('data/meta', /\.json$/), 'scripts/lib/list-meta.ts'].filter((f) => !SKIP_DIRS.test(f))
    .flatMap((f) => readFileSync(f, 'utf8').split('\n').map((l, i) => ({ l, at: `${f}:${i + 1}` })))
    .filter(({ l }) => !KEEP.test(l));
  it('uses the Knesset spelling of people and parties in shown fields', () => {
    const hits = shown().flatMap(({ l, at }) => WRONG.filter(([re]) => re.test(l)).map(([, want]) => `${at} → ${want}`));
    expect(hits).toEqual([]);
  });
  it('never gives אחריות the English name of a different party (U\'Bizchutan)', () => {
    const parties = JSON.parse(readFileSync('data/meta/parties.json', 'utf8')).parties as { names?: { nameHe: string; nameEn: string | null }[] }[];
    const wrong = parties.flatMap((p) => p.names ?? []).filter((n) => n.nameHe.startsWith('אחריות') && /Bizchutan/.test(n.nameEn ?? ''));
    expect(wrong).toEqual([]);
  });
  it('names every election "Election to the Nth Knesset"', () => {
    const odd = files('public/data', /^k\d+\.json$/).map((f) => JSON.parse(readFileSync(f, 'utf8')).nameEn as string)
      .filter((n) => !/^Election to the \d+(st|nd|rd|th) Knesset/.test(n));
    expect(odd).toEqual([]);
  });
});

describe('Hebrew prefixes, quotation marks and geresh', () => {
  it('ב, ל and כ replace the article of the app\'s own definite names, and leave a typed name whole', async () => {
    const { hebrewPrefix, APP_DEFINITE_NAMES } = await import('../src/app/hebrewPrefix.ts');
    expect(hebrewPrefix('ב', 'התוצאה הרשמית')).toBe('בתוצאה הרשמית');
    expect(hebrewPrefix('ל', 'העבודה שלכם')).toBe('לעבודה שלכם');
    expect(hebrewPrefix('כ', 'התוצאה הרשמית')).toBe('כתוצאה הרשמית');
    expect(hebrewPrefix('ב', 'השארית הגדולה ביותר (מכסת הייר)')).toBe('בשארית הגדולה ביותר (מכסת הייר)');
    expect(hebrewPrefix('ב', '⁧התוצאה הרשמית⁩')).toBe('ב⁧תוצאה הרשמית⁩');
    for (const n of APP_DEFINITE_NAMES) expect(hebrewPrefix('ב', n)).toBe(`ב${n.slice(1)}`);
    // מ, ש and ו keep the article; a name a reader typed keeps its ה; a longer word is not the app's name
    expect(hebrewPrefix('מ', 'התוצאה הרשמית')).toBe('מהתוצאה הרשמית');
    expect(hebrewPrefix('ב', 'הסכם')).toBe('בהסכם');
    expect(hebrewPrefix('ב', 'הכנסתי')).toBe('בהכנסתי');
  });

  // Data text the app itself writes (quotations, OCR, source titles and official names keep their source's marks).
  const VERBATIM = /quote|ocr|title|attribution|locator|url|excerpt|verbatim|raw|original/i;
  const strings = (o: unknown, key = ''): { key: string; s: string }[] => typeof o === 'string' ? [{ key, s: o }]
    : Array.isArray(o) ? o.flatMap((v) => strings(v, key)) : o && typeof o === 'object' ? Object.entries(o).flatMap(([k, v]) => strings(v, k)) : [];
  const dataText = () => files('data/meta', /\.json$/).flatMap((f) => strings(JSON.parse(readFileSync(f, 'utf8')))
    .filter(({ key, s }) => !VERBATIM.test(key) && /[א-ת]/.test(s)).map((x) => ({ ...x, f })));
  /** Quotation marks in Hebrew text, each classed as an acronym mark (מפד״ל), an opening or a closing mark. */
  const quoteFaults = (s: string): string[] => {
    const he = /[א-ת]/, word = /[א-תA-Za-z0-9]/, out: string[] = [];
    const marks = [...s.matchAll(/["״„“”]/g)].map((m) => {
      const i = m.index!, b = s[i - 1] ?? ' ', a = s[i + 1] ?? ' ';
      const lone = /[בלמוכשה]/.test(b) && !he.test(s[i - 2] ?? ' '); // ל"…": a prefix letter, then a quotation
      const kind = he.test(b) && he.test(a) ? (lone ? 'lone' : 'acr') : word.test(a) && !word.test(b) ? 'open' : /[^\s(]/.test(b) && !word.test(a) ? 'close' : '?';
      return { ch: m[0], kind };
    }).map((m, j, all) => m.kind === 'lone' ? { ...m, kind: all.slice(j + 1).some((x) => x.kind === 'close') ? 'open' : 'acr' } : m);
    const pairs: Record<string, string> = { '"': '"', '„': '”“', '“': '”' };
    let open: string | null = null;
    for (const { ch, kind } of marks) {
      if ((kind === 'open' || kind === 'close') && ch === '״') out.push('gershayim used as a quotation mark');
      if (kind === 'open') open = ch;
      else if (kind === 'close' && open !== null) { if (!pairs[open]?.includes(ch)) out.push(`opens ${open}, closes ${ch}`); open = null; }
    }
    return out;
  };
  it('pairs every Hebrew quotation mark with one of its own style', () => {
    expect(quoteFaults('תיקון חוק "מיהו יהודי״, אי־נסיגה')).not.toEqual([]);
    expect(quoteFaults('נדפס כ״שפירא אליהו״')).not.toEqual([]);
    expect(quoteFaults('תוקן ל"יערי מאיר". המפד״ל, ש״ס, כ״ך ושינוי – ל״ע')).toEqual([]);
    const hits = dataText().flatMap(({ f, key, s }) => quoteFaults(s).map((p) => `${f} ${key}: ${p}`));
    expect(hits).toEqual([]);
  });
  it('writes the geresh (׳), not an ASCII apostrophe, in the Hebrew text the app writes', () => {
    // Official names (lists, candidates, parties) keep the election committee's typing; see the FV5 report.
    const NAMES = /^(nameHe|shortHe|givenHe|familyHe|memberNameHe|submissionHe|FactionName.*)$/;
    const geresh = (s: string) => s.replace(/'[^'\n]*[א-ת][^'\n]*'/g, '').match(/[א-ת]'/g) ?? []; // drop '…' quotations first
    expect(geresh("ג'רוזלם פוסט")).toHaveLength(1);
    expect(geresh("the slogan 'משהו חדש מתחיל'")).toHaveLength(0);
    // data/meta/bios holds the name-matching research (never shown), which quotes official names as typed
    const data = dataText().filter(({ f, key }) => !NAMES.test(key) && !f.includes('/bios/')).filter(({ s }) => geresh(s).length).map(({ f, key, s }) => `${f} ${key}: ${s.slice(0, 60)}`);
    expect(data).toEqual([]);
    // src/data holds official locality names (CBS), which keep their own typing like the other official names
    const code = srcStrings().filter(({ at, s }) => !at.startsWith('src/data/') && s.startsWith('"') && geresh(s).length).map(({ at }) => at);
    expect(code).toEqual([]);
  });
  it('spells The Jerusalem Post one way in Hebrew', () => {
    const forms = new Set(dataText().flatMap(({ s }) => s.match(/ג.רוזלם פוסט/g) ?? []));
    expect([...forms]).toEqual(['ג׳רוזלם פוסט']);
  });
});
