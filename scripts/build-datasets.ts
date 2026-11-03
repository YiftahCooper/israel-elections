import { buildK8 } from './lib/historical/k8.ts';
import { buildK9 } from './lib/historical/k9.ts';
import { buildK10 } from './lib/historical/k10.ts';
import { buildK11 } from './lib/historical/k11.ts';
import { buildK12 } from './lib/historical/k12.ts';
// Builds the app datasets in public/data/ from the raw official sources in data/raw/.
//   node scripts/build-datasets.ts
// Every figure is derived from a raw file listed in data/raw/SOURCES.json; the script fails loudly
// on any internal inconsistency (totals that do not reconcile, rank gaps, unknown letters).
import { buildK18 } from './lib/historical/k18.ts';
import { buildK19 } from './lib/historical/k19.ts';
import { buildK20 } from './lib/historical/k20.ts';
import { buildK21 } from './lib/historical/k21.ts';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { buildK16 } from './lib/historical/k16.ts';
import { buildK17 } from './lib/historical/k17.ts';
import { buildK22 } from './lib/historical/k22.ts';
import { buildK23 } from './lib/historical/k23.ts';
import { buildK24 } from './lib/historical/k24.ts';
import { parseK25Gazette } from './lib/parse-k25-gazette.ts';
import { joinItems, pdfLines } from './lib/pdf-text.ts';
import { BLOCS, META, neutralColor } from './lib/list-meta.ts';
import type { AgreementRecord, Candidate, ElectionDataset, ListRecord, LocalityDataset } from '../src/data/schema.ts';
import { DATASET_SCHEMA_VERSION } from '../src/data/schema.ts';

const ROOT = join(import.meta.dirname, '..');
const RAW = join(ROOT, 'data', 'raw');
const OUT = join(ROOT, 'public', 'data');
mkdirSync(OUT, { recursive: true });
const sources = JSON.parse(readFileSync(join(RAW, 'SOURCES.json'), 'utf8')) as { id: string; sha256?: string; file: string }[];
const sha = (ids: string[]) => Object.fromEntries(ids.map((id) => [id, sources.find((s) => s.id === id)?.sha256 ?? 'manual']));

function fail(msg: string): never { throw new Error(`build-datasets: ${msg}`); }
function assert(cond: unknown, msg: string): asserts cond { if (!cond) fail(msg); }
const norm = (s: string) => s.replace(/[`׳']/g, "'").replace(/[״"]/g, '"').replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();

// ---------------------------------------------------------------- generic tabular votes
interface Row { committee: number; code: number; name: string; registered: number; votesCast: number; invalid: number; valid: number; votes: Record<string, number> }

function rowsFromCsv(file: string, letters: string[]): Row[] {
  const lines = readFileSync(join(RAW, file), 'utf8').replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim());
  const head = lines[0].split(',').map((h) => h.trim());
  const ix = (k: string) => { const i = head.indexOf(k); assert(i >= 0, `${file}: missing column ${k}`); return i; };
  return lines.slice(1).map((l) => {
    const c = l.split(',');
    const num = (k: string) => Number(c[ix(k)] || 0);
    return {
      committee: num('סמל ועדה'), code: num('סמל ישוב'), name: c[ix('שם ישוב')].trim(),
      registered: num('בזב'), votesCast: num('מצביעים'), invalid: num('פסולים'), valid: num('כשרים'),
      votes: Object.fromEntries(letters.map((L) => [L, num(L)])),
    };
  });
}

function rowsFromDatastore(file: string, letters: string[]): Row[] {
  const { records } = JSON.parse(readFileSync(join(RAW, file), 'utf8')) as { records: Record<string, number | string>[] };
  return records.map((r) => ({
    committee: Number(r['סמל ועדה']), code: Number(r['סמל ישוב']), name: String(r['שם ישוב']).trim(),
    registered: Number(r['בזב']), votesCast: Number(r['מצביעים']), invalid: Number(r['פסולים']), valid: Number(r['כשרים']),
    votes: Object.fromEntries(letters.map((L) => [L, Number(r[L] ?? 0)])),
  }));
}

function sumRows(rows: Row[], letters: string[]) {
  const t = { registered: 0, votesCast: 0, invalid: 0, valid: 0, votes: Object.fromEntries(letters.map((L) => [L, 0])) as Record<string, number> };
  for (const r of rows) {
    t.registered += r.registered; t.votesCast += r.votesCast; t.invalid += r.invalid; t.valid += r.valid;
    let rowSum = 0;
    for (const L of letters) { t.votes[L] += r.votes[L]; rowSum += r.votes[L]; }
    assert(rowSum === r.valid, `row ${r.code}/${r.name}: list votes ${rowSum} ≠ valid ${r.valid}`);
    assert(r.valid + r.invalid === r.votesCast, `row ${r.code}/${r.name}: valid+invalid ≠ cast`);
  }
  return t;
}

/** Every locality row must equal the sum of its polling stations (votes per list and ballot totals).
 *  Registered voters are not compared: envelope stations carry none. */
function reconcileLocalities(label: string, loc: Row[], ballots: Row[], letters: string[]) {
  const byCode = new Map<number, Row>();
  for (const b of ballots) {
    const t = byCode.get(b.code) ?? { committee: b.committee, code: b.code, name: b.name, registered: 0, votesCast: 0, invalid: 0, valid: 0, votes: Object.fromEntries(letters.map((L) => [L, 0])) };
    t.votesCast += b.votesCast; t.invalid += b.invalid; t.valid += b.valid;
    for (const L of letters) t.votes[L] += b.votes[L];
    byCode.set(b.code, t);
  }
  const seen = new Set<number>();
  for (const r of loc) {
    const b = byCode.get(r.code);
    assert(b, `${label}: locality ${r.code} (${r.name}) has no polling stations`);
    seen.add(r.code);
    assert(b.votesCast === r.votesCast && b.invalid === r.invalid && b.valid === r.valid, `${label}: locality ${r.code} (${r.name}) totals differ from its polling stations`);
    for (const L of letters) assert(b.votes[L] === r.votes[L], `${label}: locality ${r.code} (${r.name}), list ${L}: ${r.votes[L]} ≠ polling stations ${b.votes[L]}`);
  }
  for (const code of byCode.keys()) assert(seen.has(code), `${label}: polling stations for locality ${code} have no locality row`);
}

function localityDataset(id: 'k25' | 'k26', rows: Row[], lists: ListRecord[]): LocalityDataset {
  return {
    schemaVersion: DATASET_SCHEMA_VERSION, id, listIds: lists.map((l) => l.id),
    rows: rows.map((r) => ({ code: r.code, nameHe: r.name, committee: r.committee, registered: r.registered, votesCast: r.votesCast, invalid: r.invalid, valid: r.valid, votes: lists.map((l) => r.votes[l.letters]) })),
  };
}

function finishList(knesset: number, letters: string, fields: Partial<ListRecord> & { nameHe: string; votes: number }, index: number): ListRecord {
  const id = `${knesset}-${letters}`;
  const m = META[id];
  return {
    id, letters, nameHe: fields.nameHe, shortHe: m?.he ?? fields.nameHe, shortEn: m?.en ?? null,
    sponsorsHe: fields.sponsorsHe ?? '', partiesHe: fields.partiesHe ?? null, votes: fields.votes,
    withdrawn: fields.withdrawn ?? false, color: m?.color ?? neutralColor(index), bloc: m?.bloc ?? null,
    candidates: fields.candidates ?? [], candidatesSource: fields.candidatesSource ?? '', candidatesSecondary: fields.candidatesSecondary ?? false,
    notesHe: fields.notesHe ?? [],
  };
}

// ================================================================ 25th Knesset (2022)
async function buildK25() {
  const html = readFileSync(join(RAW, 'k25/nationalresults.html'), 'utf8');
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, '\n').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
  const cells = text.split('\n').map((s) => s.trim()).filter(Boolean);
  // totals block: registered, cast, turnout, valid, invalid
  const iTot = cells.findIndex((c) => c.startsWith('סה"כ הקולות הפסולים'));
  const nums = cells.slice(iTot + 1, iTot + 6).map((c) => c.replace(/[,%]/g, ''));
  const [registered, votesCast, , valid, invalid] = nums.map(Number);
  // table: name, letters, seats, pct, votes
  const iTab = cells.findIndex((c) => c.startsWith('מספר הקולות הכשרים לרשימה'));
  const national: { name: string; letters: string; seats: number; votes: number }[] = [];
  for (let i = iTab + 1; i + 4 < cells.length; i += 5) {
    if (!/^\d+$/.test(cells[i + 2]) || !/%$/.test(cells[i + 3])) break;
    national.push({ name: cells[i], letters: cells[i + 1], seats: Number(cells[i + 2]), votes: Number(cells[i + 4].replace(/,/g, '')) });
  }
  assert(national.length === 40, `k25: expected 40 lists on national page, got ${national.length}`);
  const letters = national.map((n) => n.letters);

  const locRows = rowsFromDatastore('k25/localities.datagov.json', letters);
  const ballotRows = rowsFromDatastore('k25/ballots.datagov.json', letters);
  const locTot = sumRows(locRows, letters);
  const balTot = sumRows(ballotRows, letters);
  for (const n of national) {
    assert(locTot.votes[n.letters] === n.votes, `k25 ${n.letters}: localities ${locTot.votes[n.letters]} ≠ national ${n.votes}`);
    assert(balTot.votes[n.letters] === n.votes, `k25 ${n.letters}: ballots ${balTot.votes[n.letters]} ≠ national ${n.votes}`);
  }
  assert(locTot.valid === valid && locTot.invalid === invalid && locTot.votesCast === votesCast && locTot.registered === registered, 'k25 locality totals ≠ national totals');
  reconcileLocalities('k25', locRows, ballotRows, letters);

  const { lists: gaz, audit } = await parseK25Gazette(join(RAW, 'k25/yp10852-candidates.pdf'));
  const gazByLetters = new Map(gaz.map((g) => [g.letters, g]));
  assert(gaz.length === 40 && letters.every((L) => gazByLetters.has(L)), `k25: gazette letters do not match national letters: ${gaz.map((g) => g.letters).join(',')}`);
  const badAudit = audit.filter((a) => /not contiguous|empty name/.test(a));
  assert(badAudit.length === 0, `k25 gazette audit: ${badAudit.join('; ')}`);

  const lists = national.map((n, i) => {
    const g = gazByLetters.get(n.letters)!;
    const id = `25-${n.letters}`;
    const letterOnly = (s: string) => norm(s).replace(/[^\u05d0-\u05ea]/g, '');
    const a = letterOnly(g.nameHe); const b = letterOnly(n.name);
    assert(a.startsWith(b.slice(0, 25)) || b.startsWith(a.slice(0, 25)), `k25 ${n.letters}: gazette name "${g.nameHe}" vs results "${n.name}"`);
    const candidates: Candidate[] = g.candidates.map((c) => ({ id: `${id}#${c.rank}`, rank: c.rank, nameHe: `${c.family} ${c.given}`, givenHe: c.given, familyHe: c.family }));
    return finishList(25, n.letters, {
      nameHe: g.nameHe, votes: n.votes, sponsorsHe: g.sponsorsHe, partiesHe: g.multipleSponsors ? null : [g.sponsorsHe],
      candidates, candidatesSource: 'k25-candidates-gazette',
    }, i);
  });

  // agreements: CEC press release of 23.10.2022 (verified against the PDF text)
  const press = (await pdfLines(join(RAW, 'k25/cec-press-surplus-2022-10-23.pdf'))).flat().map((l) => l.text).join('\n');
  const pairs: [string, string][] = [['שס', 'ג'], ['אמת', 'מרצ'], ['מחל', 'ט'], ['כן', 'פה'], ['נק', 'ף']];
  for (const [a, b] of pairs) assert(new RegExp(`– ${a}\\s*\\nעם\\n[^\\n]*– ${b}`).test(press), `k25 agreement ${a}/${b} not found in press release text`);
  const agreements: AgreementRecord[] = pairs.map(([a, b], i) => ({ id: `25-agr-${i + 1}`, members: [`25-${a}`, `25-${b}`], sourceId: 'k25-surplus-press' }));

  const ds: ElectionDataset = {
    schemaVersion: DATASET_SCHEMA_VERSION, id: 'k25', knesset: 25, electionDate: '2022-11-01',
    nameHe: 'הבחירות לכנסת ה-25', nameEn: 'Election to the 25th Knesset',
    status: { stage: 'official-final', asOf: '2022-11-10', noteHe: 'תוצאות סופיות רשמיות של ועדת הבחירות המרכזית.', noteEn: 'Official final results of the Central Elections Committee.' },
    ruleSetId: 'il-2014-bader-ofer-3.25',
    totals: { registered, votesCast, invalid, valid, ballotBoxes: ballotRows.length, localities: locRows.filter((r) => r.code !== 9999).length, envelopeVotes: locRows.find((r) => r.code === 9999)?.votesCast },
    lists, agreements, blocs: BLOCS.k25,
    officialSeats: Object.fromEntries(national.map((n) => [`25-${n.letters}`, n.seats])),
    officialSeatsSourceId: 'k25-national-html',
    sourceIds: ['k25-national-html', 'k25-localities-datagov', 'k25-ballots-datagov', 'k25-candidates-gazette', 'k25-surplus-press', 'law-elections'],
    buildInfo: { builtAt: new Date().toISOString(), rawSha256: sha(['k25-national-html', 'k25-localities-datagov', 'k25-ballots-datagov', 'k25-candidates-gazette', 'k25-surplus-press']) },
  };
  return { ds, loc: localityDataset('k25', locRows, lists) };
}

// ================================================================ 26th Knesset (2026)
interface PageList { url: string; nameHe: string; letters: string; sponsors: string[]; candidates: { rank: number; name: string; party?: string }[]; notes: string[]; updated: string }

// Official note paragraphs on the CEC list pages: resignations, disqualifications, court rulings, withdrawal.
const NOTE_RE = /התפטר|מנוע|אינה מתמודדת|בית המשפט|לא נכלל|נמחק|הוועדה|סעיף 62|הוחלף/;
const unrecognised: string[] = [];

function parseGovilPages(): PageList[] {
  const d = JSON.parse(readFileSync(join(RAW, 'k26/govil-list-pages.exa.json'), 'utf8')) as { text: string }[];
  // The capture service appends "Error fetching <url>: …" for pages it could not render; split those off
  // so they cannot be mistaken for content of the preceding page (they are covered by the fallback).
  const all = d.map((x) => x.text).join('').replace(/\n*Error fetching (\S+): [A-Z_]+\s*/g, '\n');
  const pages = all.split(/\n(?=# [^\n]*\nURL: )/);
  const out: PageList[] = [];
  for (const p of pages) {
    const url = p.match(/URL: (\S+)/)?.[1] ?? '';
    const title = p.match(/^# (.*)$/m)?.[1] ?? '';
    if (!title || title === '(no title)') continue;
    const nameHe = title.replace(/\s*ועדת הבחירות המרכזית לכנסת\s*$/, '').trim();
    const ballot = p.match(/תמונת פתק (\S+) /);
    const sub = p.match(/^### רשימת המועמדים הוגשה (.*)$/m)?.[1] ?? '';
    const sponsors = sub.replace(/^מטעם /, '').split(/ ומטעם /).map((s) => s.replace(/^מפלגת /, '').trim()).filter(Boolean);
    const updated = p.match(/תאריך עדכון: ([\d.]+)/)?.[1] ?? '';
    const candidates: PageList['candidates'] = [];
    const notes: string[] = [];
    const body = p.slice(p.indexOf('תמונת פתק') >= 0 ? p.indexOf('\n', p.indexOf('תמונת פתק')) : p.indexOf(sub) + sub.length);
    const lines = body.split('\n').map((l) => l.trim()).filter(Boolean);
    for (let k = 0; k < lines.length; k++) {
      const l = lines[k];
      if (l.startsWith('|')) {
        for (const cell of l.split('|').map((c) => c.trim())) {
          const m = cell.match(/^(\d+)\.\s*(.+)$/);
          if (!m) continue;
          // some pages put the sponsoring party in the cell: "<name> מטעם מפלגת <party>"
          const [name, party] = m[2].split(/\s+מטעם\s+/);
          candidates.push({ rank: Number(m[1]), name: name.trim(), party: party ? party.replace(/^מפלגת\s+/, '').trim() : undefined });
        }
        continue;
      }
      const m = l.match(/^(\d+)\.\s*(.+)$/);
      if (m) {
        const next = lines[k + 1] ?? '';
        const party = next.startsWith('מטעם ') ? next.replace(/^מטעם /, '').replace(/^מפלגת /, '').trim() : undefined;
        candidates.push({ rank: Number(m[1]), name: m[2].trim(), party });
        if (party) k++;
        continue;
      }
      if (/^מטעם /.test(l) || /^סוג: /.test(l) || /^### /.test(l)) continue;
      // a failed capture of the NEXT page can leak into this one: never publish it as a note
      assert(!/Error fetching|CRAWL_|LIVECRAWL/i.test(l), `k26 capture error inside ${url}: ${l}`);
      if (NOTE_RE.test(l)) notes.push(l); else unrecognised.push(`${url}: ${l.slice(0, 80)}`);
    }
    out.push({ url, nameHe, letters: ballot?.[1] ?? '', sponsors, candidates, notes, updated });
  }
  return out;
}

function parseFyi(letters: string): { nameHe: string; sponsors: string[]; candidates: { rank: number; name: string; party?: string }[]; updated: string } {
  const html = readFileSync(join(RAW, `k26/secondary/bechirot-fyi-list-${letters}.html`), 'utf8');
  const t = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, '\n').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
  const tok = t.split('\n').map((s) => s.trim()).filter(Boolean);
  const iCount = tok.findIndex((x) => x.startsWith('מועמדים ברשימה'));
  const nameHe = tok[iCount - 3].replace(/\s*–\s*הרשימה אינה מתמודדת.*$/, '');
  const sponsorLine = tok[iCount + 1].startsWith('מטעם') ? tok[iCount + 1] : '';
  const sponsors = sponsorLine.replace(/\.$/, '').replace(/^מטעם /, '').split(/ ומטעם /).map((s) => s.replace(/^מפלגת /, '').trim()).filter(Boolean);
  const candidates: { rank: number; name: string; party?: string }[] = [];
  for (let k = iCount + 1; k < tok.length; k++) {
    if (tok[k].startsWith('הסדר הוא')) break;
    if (/^\d+$/.test(tok[k]) && !/^שאר הרשימה/.test(tok[k - 1] ?? '') && tok[k + 1] && !/^\d+$/.test(tok[k + 1]) && !/^מועמדים$/.test(tok[k + 1])) {
      const name = tok[k + 1];
      const maybeParty = tok[k + 2];
      const party = maybeParty && !/^\d+$/.test(maybeParty) && !/^שאר הרשימה|^הסדר/.test(maybeParty) ? maybeParty : undefined;
      candidates.push({ rank: Number(tok[k]), name, party });
      k += party ? 2 : 1;
    }
  }
  const updated = tok[tok.findIndex((x) => x.startsWith(', עודכן')) + 1] ?? '';
  return { nameHe, sponsors, candidates, updated };
}

const byLettersCheck = (pages: PageList[], L: string, starts: string) => pages.find((p) => p.letters === L)?.nameHe.startsWith(starts) ?? false;

async function buildK26() {
  const head = readFileSync(join(RAW, 'k26/expc.csv'), 'utf8').replace(/^﻿/, '').split(/\r?\n/)[0].split(',').map((h) => h.trim());
  const letters = head.slice(head.indexOf('כשרים') + 1).filter(Boolean);
  assert(letters.length === 38, `k26: expected 38 letter columns, got ${letters.length}`);
  const locRows = rowsFromCsv('k26/expc.csv', letters);
  const ballotRows = rowsFromCsv('k26/expb.csv', letters);
  const locTot = sumRows(locRows, letters);
  const balTot = sumRows(ballotRows, letters);
  for (const L of letters) assert(locTot.votes[L] === balTot.votes[L], `k26 ${L}: localities ≠ ballots`);
  assert(locTot.valid === balTot.valid && locTot.votesCast === balTot.votesCast && locTot.registered === balTot.registered, 'k26 ballot totals ≠ locality totals');
  reconcileLocalities('k26', locRows, ballotRows, letters);

  const pages = parseGovilPages();
  // a ballot image whose alt text omits the letters ("תמונת פתק <name>") is resolved by elimination
  for (const p of pages) if (!letters.includes(p.letters)) p.letters = '';
  // Pages without a ballot image: letters from the official guide table (gov.il candidates-lists-26):
  //   "צבי | תנועת אחי תנועתו של הרב יורם אברג'ל זצ"ל – הרשימה אינה מתמודדת בבחירות לכנסת ה-26"
  const GUIDE_FALLBACK: Record<string, { letters: string; nameStarts: string }> = {
    'chozrim-leshorashim_list32': { letters: 'צבי', nameStarts: 'תנועת אחי' },
  };
  for (const p of pages) {
    const fb = GUIDE_FALLBACK[p.url.split('/').pop()!];
    if (fb && !p.letters) { assert(p.nameHe.startsWith(fb.nameStarts), `k26: guide fallback name mismatch for ${p.url}`); p.letters = fb.letters; }
  }
  const unmatchedPages = pages.filter((p) => !p.letters);
  const fyiLetters = ['בי', 'כן']; // official pages that failed to render (see SOURCES.json)
  const unmatchedLetters = letters.filter((L) => !pages.some((p) => p.letters === L) && !fyiLetters.includes(L));
  assert(unmatchedPages.length === unmatchedLetters.length && unmatchedPages.length <= 1, `k26: cannot resolve ballot letters for ${unmatchedPages.map((p) => p.url).join(', ')} / ${unmatchedLetters.join(',')}`);
  if (unmatchedPages.length === 1) unmatchedPages[0].letters = unmatchedLetters[0];
  assert(byLettersCheck(pages, 'י', 'ישראל תחילה'), 'k26: list י did not resolve to ישראל תחילה');
  const byLetters = new Map(pages.map((p) => [p.letters, p]));
  const lists: ListRecord[] = letters.map((L, i) => {
    const id = `26-${L}`;
    const p = byLetters.get(L);
    let nameHe: string; let sponsors: string[]; let cands: { rank: number; name: string; party?: string }[]; let notes: string[] = []; let secondary = false;
    if (p) { nameHe = p.nameHe; sponsors = p.sponsors; cands = p.candidates; notes = p.notes; }
    else {
      const f = parseFyi(L); // only for pages the official capture could not render
      nameHe = f.nameHe; sponsors = f.sponsors; cands = f.candidates; secondary = true;
      notes = [`רשימת המועמדים נלקחה ממקור משני (bechirot.fyi, עדכון ${f.updated}) משום שעמוד ועדת הבחירות לא נטען.`];
    }
    const withdrawn = L === 'כן' || L === 'צבי';
    if (L === 'כן') notes.push('ועדת הבחירות המרכזית: "הרשימה אינה מתמודדת בבחירות לכנסת ה-26".');
    cands.sort((a, b) => a.rank - b.rank);
    assert(!cands.some((c) => /מטעם|\|/.test(c.name)), `k26 ${L}: a candidate name still contains party text or table syntax`);
    assert(cands.every((c, k) => c.rank === k + 1), `k26 ${L}: ranks not contiguous (${cands.map((c) => c.rank).join(',')})`);
    if (!withdrawn) assert(cands.length > 0, `k26 ${L}: no candidates`);
    const singleSponsor = sponsors.length === 1 ? sponsors[0] : undefined;
    const candidates: Candidate[] = cands.map((c) => ({ id: `${id}#${c.rank}`, rank: c.rank, nameHe: c.name, partyHe: c.party ?? singleSponsor }));
    return finishList(26, L, {
      nameHe, votes: locTot.votes[L], sponsorsHe: sponsors.join('; '), partiesHe: sponsors, withdrawn, candidates,
      candidatesSource: secondary ? 'k26-secondary-fyi' : 'k26-list-pages', candidatesSecondary: secondary, notesHe: notes,
    }, i);
  });

  // agreements: Yalkut HaPirsumim 15045, p. 1098. The notice sits in the right-hand column of page 4;
  // each numbered item reads "(n) <list> - <letters> / עם / <list> - <letters>;". Pairs are parsed
  // from the gazette itself, and must name existing ballot letters.
  const page4 = (await pdfLines(join(RAW, 'k26/yp15045-surplus.pdf')))[3];
  const col = page4.map((l) => joinItems(l.items.filter((i) => i.x >= 240))).filter(Boolean).join('\n');
  const nStart = col.indexOf('הודעה בדבר התקשרות');
  const notice = col.slice(nStart, col.indexOf('ז\' בחשוון התשפ"ז', nStart));
  assert(nStart >= 0 && notice.length > 100, 'k26 agreements: notice not found in gazette page 4');
  const items = notice.split(/\n?\((\d+)\)\s*/).slice(1);
  const pairs: [string, string][] = [];
  for (let k = 0; k < items.length; k += 2) {
    const body = items[k + 1];
    const parts = body.split(/\nעם\n/);
    assert(parts.length === 2, `k26 agreement item (${items[k]}) does not have exactly two parties: ${body}`);
    const letter = (p: string) => p.replace(/\s+/g, ' ').trim().match(/-\s*([\u0590-\u05FF]+)\s*[;.]?$/)?.[1];
    const [a, b] = parts.map(letter);
    assert(a && b && letters.includes(a) && letters.includes(b), `k26 agreement item (${items[k]}): letters not recognised (${a}, ${b})`);
    pairs.push([a!, b!]);
  }
  assert(pairs.length >= 1 && pairs.every((_, i) => Number(items[i * 2]) === i + 1), 'k26 agreements: numbering not contiguous');
  assert(new Set(pairs.flat()).size === pairs.length * 2, 'k26 agreements: a list appears in two agreements');
  const agreements: AgreementRecord[] = pairs.map(([a, b], i) => ({ id: `26-agr-${i + 1}`, members: [`26-${a}`, `26-${b}`], sourceId: 'k26-surplus-gazette' }));

  const env = locRows.find((r) => r.code === 9999);
  const ds: ElectionDataset = {
    schemaVersion: DATASET_SCHEMA_VERSION, id: 'k26', knesset: 26, electionDate: '2026-10-27',
    nameHe: 'הבחירות לכנסת ה-26', nameEn: 'Election to the 26th Knesset',
    status: {
      stage: 'final-count-pending-publication', asOf: '2026-11-03',
      noteHe: 'ספירה סופית שפרסמה ועדת הבחירות המרכזית (קבצי התוצאות מיום 3.11.2026). התוצאות הסופיות יפורסמו ברשומות עד 4.11.2026 ועד אז עשויות להשתנות.',
      noteEn: 'Final count published by the Central Elections Committee (result files of 3 Nov 2026). Final results are due to be gazetted in Reshumot by 4 Nov 2026 and may change until then.',
    },
    ruleSetId: 'il-2014-bader-ofer-3.25',
    totals: { registered: locTot.registered, votesCast: locTot.votesCast, invalid: locTot.invalid, valid: locTot.valid, ballotBoxes: ballotRows.length, localities: locRows.filter((r) => r.code !== 9999).length, envelopeVotes: env?.votesCast },
    lists, agreements, blocs: BLOCS.k26,
    officialSeats: null, officialSeatsSourceId: null,
    sourceIds: ['k26-localities-csv', 'k26-ballots-csv', 'k26-list-pages', 'k26-secondary-fyi', 'k26-surplus-gazette', 'k26-national-snapshot', 'law-elections'],
    buildInfo: { builtAt: new Date().toISOString(), rawSha256: sha(['k26-localities-csv', 'k26-ballots-csv', 'k26-list-pages', 'k26-surplus-gazette']) },
  };
  return { ds, loc: localityDataset('k26', locRows, lists) };
}

// Seat-diagram order: app-defined order (validated colour adjacency), then by votes.
const seatOrder = (lists: ListRecord[]) => [...lists].sort((a, b) => (META[a.id]?.order ?? 999) - (META[b.id]?.order ?? 999) || b.votes - a.votes);

for (const build of [...buildK8(), ...buildK9(), ...buildK10(), ...buildK11(), ...buildK12(), ...buildK16(), ...buildK17(), buildK18, buildK19, buildK20, buildK21, buildK22, buildK23, buildK24, buildK25, buildK26]) {
  const built = await build();
  const ds = { ...built.ds, lists: seatOrder(built.ds.lists) };
  const loc = built.loc;
  writeFileSync(join(OUT, `${ds.id}.json`), JSON.stringify(ds));
  writeFileSync(join(OUT, `${ds.id}-localities.json`), JSON.stringify(loc));
  const cands = ds.lists.reduce((s, l) => s + l.candidates.length, 0);
  console.log(`${ds.id}: ${ds.lists.length} lists, ${cands} candidates, ${ds.agreements.length} agreements, valid ${ds.totals.valid}, ${loc.rows.length} locality rows`);
}
if (unrecognised.length) console.warn(`k26: ${unrecognised.length} unrecognised line(s) on list pages were not published as notes:\n  ${unrecognised.join('\n  ')}`);
const sourcesOut = sources.map(({ id, ...rest }) => ({ id, ...rest }));
writeFileSync(join(OUT, 'sources.json'), JSON.stringify(sourcesOut, null, 1));
