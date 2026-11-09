// 26th Knesset (2026): CEC result CSVs (final count), the CEC list pages captured from gov.il,
// two secondary bechirot.fyi rosters for pages that failed to render, and the surplus gazette.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Candidate, ElectionDataset } from '../../../src/data/schema.ts';
import { DATASET_SCHEMA_VERSION } from '../../../src/data/schema.ts';
import { joinItems, pdfLines } from '../pdf-text.ts';
import { BLOCS } from '../list-meta.ts';
import { htmlCells } from '../build/cec-html.ts';
import { checkLocalitiesMatchPolling, geographyTotals, localityDataset, readCsvRows, sumRows } from '../build/locality.ts';
import { agreementRecords, listRecord } from '../build/records.ts';
import { candidateId, sortAndCheckRanks } from '../build/roster.ts';
import { RAW, verifySources } from '../build/sources.ts';
import { checkAgreementPairs, checker, type Check } from '../build/validate.ts';

const check: Check = checker('build-datasets');
interface PageCandidate { rank: number; name: string; party?: string }
interface PageList { url: string; nameHe: string; letters: string; sponsors: string[]; candidates: PageCandidate[]; notes: string[]; updated: string }

// Official note paragraphs on the CEC list pages: resignations, disqualifications, court rulings, withdrawal.
const NOTE_RE = /התפטר|מנוע|אינה מתמודדת|בית המשפט|לא נכלל|נמחק|הוועדה|סעיף 62|הוחלף/;

function parseGovilPages(unrecognised: string[]): PageList[] {
  const d = JSON.parse(readFileSync(join(RAW, 'k26/govil-list-pages.exa.json'), 'utf8')) as { text: string }[];
  // The capture service appends "Error fetching <url>: …" for pages it could not render; split those off
  // so they cannot be mistaken for content of the preceding page (they are covered by the fallback).
  const all = d.map(x => x.text).join('').replace(/\n*Error fetching (\S+): [A-Z_]+\s*/g, '\n');
  const pages = all.split(/\n(?=# [^\n]*\nURL: )/);
  const out: PageList[] = [];
  for (const p of pages) {
    const url = p.match(/URL: (\S+)/)?.[1] ?? '';
    const title = p.match(/^# (.*)$/m)?.[1] ?? '';
    if (!title || title === '(no title)') continue;
    const nameHe = title.replace(/\s*ועדת הבחירות המרכזית לכנסת\s*$/, '').trim();
    const ballot = p.match(/תמונת פתק (\S+) /);
    const sub = p.match(/^### רשימת המועמדים הוגשה (.*)$/m)?.[1] ?? '';
    const sponsors = sub.replace(/^מטעם /, '').split(/ ומטעם /).map(s => s.replace(/^מפלגת /, '').trim()).filter(Boolean);
    const updated = p.match(/תאריך עדכון: ([\d.]+)/)?.[1] ?? '';
    const candidates: PageCandidate[] = [];
    const notes: string[] = [];
    const body = p.slice(p.indexOf('תמונת פתק') >= 0 ? p.indexOf('\n', p.indexOf('תמונת פתק')) : p.indexOf(sub) + sub.length);
    const lines = body.split('\n').map(l => l.trim()).filter(Boolean);
    for (let k = 0; k < lines.length; k++) {
      const l = lines[k];
      if (l.startsWith('|')) {
        for (const cell of l.split('|').map(c => c.trim())) {
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
      check(!/Error fetching|CRAWL_|LIVECRAWL/i.test(l), `k26 capture error inside ${url}: ${l}`);
      if (NOTE_RE.test(l)) notes.push(l); else unrecognised.push(`${url}: ${l.slice(0, 80)}`);
    }
    out.push({ url, nameHe, letters: ballot?.[1] ?? '', sponsors, candidates, notes, updated });
  }
  return out;
}

/** Secondary roster (bechirot.fyi) for an official page the capture could not render. */
function parseFyi(letters: string): { nameHe: string; sponsors: string[]; candidates: PageCandidate[]; updated: string } {
  const tok = htmlCells(readFileSync(join(RAW, `k26/secondary/bechirot-fyi-list-${letters}.html`), 'utf8'), { dropStyles: true, collapse: false });
  const iCount = tok.findIndex(x => x.startsWith('מועמדים ברשימה'));
  const nameHe = tok[iCount - 3].replace(/\s*–\s*הרשימה אינה מתמודדת.*$/, '');
  const sponsorLine = tok[iCount + 1].startsWith('מטעם') ? tok[iCount + 1] : '';
  const sponsors = sponsorLine.replace(/\.$/, '').replace(/^מטעם /, '').split(/ ומטעם /).map(s => s.replace(/^מפלגת /, '').trim()).filter(Boolean);
  const candidates: PageCandidate[] = [];
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
  const updated = tok[tok.findIndex(x => x.startsWith(', עודכן')) + 1] ?? '';
  return { nameHe, sponsors, candidates, updated };
}

/** Agreements: Yalkut HaPirsumim 15045, p. 1098. The notice sits in the right-hand column of page 4;
 *  each numbered item reads "(n) <list> - <letters> / עם / <list> - <letters>;". Pairs are parsed
 *  from the gazette itself, and must name existing ballot letters. */
async function agreementPairs(letters: string[]): Promise<[string, string][]> {
  const page4 = (await pdfLines(join(RAW, 'k26/yp15045-surplus.pdf')))[3];
  const col = page4.map(l => joinItems(l.items.filter(i => i.x >= 240))).filter(Boolean).join('\n');
  const nStart = col.indexOf('הודעה בדבר התקשרות');
  const notice = col.slice(nStart, col.indexOf('ז\' בחשוון התשפ"ז', nStart));
  check(nStart >= 0 && notice.length > 100, 'k26 agreements: notice not found in gazette page 4');
  const items = notice.split(/\n?\((\d+)\)\s*/).slice(1);
  const pairs: [string, string][] = [];
  for (let k = 0; k < items.length; k += 2) {
    const body = items[k + 1];
    const parts = body.split(/\nעם\n/);
    check(parts.length === 2, `k26 agreement item (${items[k]}) does not have exactly two parties: ${body}`);
    const letter = (p: string) => p.replace(/\s+/g, ' ').trim().match(/-\s*([֐-׿]+)\s*[;.]?$/)?.[1];
    const [a, b] = parts.map(letter);
    check(a && b && letters.includes(a) && letters.includes(b), `k26 agreement item (${items[k]}): letters not recognised (${a}, ${b})`);
    pairs.push([a!, b!]);
  }
  check(pairs.length >= 1 && pairs.every((_, i) => Number(items[i * 2]) === i + 1), 'k26 agreements: numbering not contiguous');
  checkAgreementPairs(check, 'k26', pairs, letters);
  return pairs;
}

/** Results notice: Yalkut HaPirsumim 15100 (4 Nov 2026), pp. 1634–1645, section 84(a). Section 1 prints one row per
 *  list ("<letters> <name …> <votes>"), then the valid total; section 2 the invalid votes; section 3 the seats per
 *  list and their total; section 4 one heading per seat-winning list ("(n) מרשימת <letters> – …"). The text layer of
 *  page 9 (section 3) overprints page 8's rows on its own, so a seat row there can repeat or be unreadable; every
 *  row that does read must agree, and section 4 names exactly the seat-winning lists. */
async function resultsNotice(letters: string[]) {
  const pages = await pdfLines(join(RAW, 'k26/yp15100-results.pdf'));
  const lines = pages.flat().map(l => l.text);
  const at = (re: RegExp) => { const i = lines.findIndex(l => re.test(l)); check(i >= 0, `k26 results notice: ${re} not found`); return i; };
  const s1 = at(/^1\. מספר הקולות הכשרים/), valid = at(/^סך כל הקולות הכשרים/), invalid = at(/^2\. מספר הקולות שנמצאו פסולים/);
  const s3 = at(/^3\. מספר המנדטים/), seatsTotal = at(/^סך המנדטים/), s4 = at(/^4\. שמות האנשים שנבחרו/);
  const num = (l: string) => Number(l.match(/([\d,]+)$/)?.[1].replaceAll(',', '') ?? NaN);
  const rows = (from: number, to: number) => {
    const out = new Map<string, number>();
    for (const l of lines.slice(from + 1, to)) {
      // the ק row reads "נ ק תקומה …": a stray one-letter glyph (not a ballot letter) precedes the letters cell
      const [a, b] = l.split(' '), first = !letters.includes(a) && a.length === 1 && letters.includes(b) ? b : a;
      if (letters.includes(first) && /\s[\d,]+$/.test(l)) { check(!out.has(first) || out.get(first) === num(l), `k26 results notice: ${first} appears twice with different counts`); out.set(first, num(l)); }
    }
    return out;
  };
  const winners = new Set(lines.slice(s4 + 1).map(l => l.match(/^\([א-ת]+\) מרשימת (\S+) –/)?.[1]).filter((x): x is string => !!x));
  return { votes: rows(s1, valid), valid: num(lines[valid]), invalid: num(lines[invalid]), seats: rows(s3, seatsTotal), seatsTotal: num(lines[seatsTotal]), winners };
}

const SOURCE_IDS = ['k26-localities-csv', 'k26-ballots-csv', 'k26-list-pages', 'k26-surplus-gazette', 'k26-official-results', 'k26-results-gazette'];

export async function buildK26() {
  const rawSha256 = verifySources(SOURCE_IDS, check);
  const head = readFileSync(join(RAW, 'k26/expc.csv'), 'utf8').replace(/^﻿/, '').split(/\r?\n/)[0].split(',').map(h => h.trim());
  const letters = head.slice(head.indexOf('כשרים') + 1).filter(Boolean);
  check(letters.length === 38, `k26: expected 38 letter columns, got ${letters.length}`);
  const locRows = readCsvRows(join(RAW, 'k26/expc.csv'), letters, check);
  const ballotRows = readCsvRows(join(RAW, 'k26/expb.csv'), letters, check);
  const locTot = sumRows(locRows, letters.length);
  const balTot = sumRows(ballotRows, letters.length);
  letters.forEach((L, i) => check(locTot.votes[i] === balTot.votes[i], `k26 ${L}: localities ≠ ballots`));
  check(locTot.valid === balTot.valid && locTot.votesCast === balTot.votesCast && locTot.registered === balTot.registered, 'k26 ballot totals ≠ locality totals');
  checkLocalitiesMatchPolling(check, 'k26', locRows, ballotRows);

  const unrecognised: string[] = [];
  const pages = parseGovilPages(unrecognised);
  // a ballot image whose alt text omits the letters ("תמונת פתק <name>") is resolved by elimination
  for (const p of pages) if (!letters.includes(p.letters)) p.letters = '';
  // Pages without a ballot image: letters from the official guide table (gov.il candidates-lists-26):
  //   "צבי | תנועת אחי תנועתו של הרב יורם אברג'ל זצ"ל – הרשימה אינה מתמודדת בבחירות לכנסת ה-26"
  const GUIDE_FALLBACK: Record<string, { letters: string; nameStarts: string }> = {
    'chozrim-leshorashim_list32': { letters: 'צבי', nameStarts: 'תנועת אחי' },
  };
  for (const p of pages) {
    const fb = GUIDE_FALLBACK[p.url.split('/').pop()!];
    if (fb && !p.letters) { check(p.nameHe.startsWith(fb.nameStarts), `k26: guide fallback name mismatch for ${p.url}`); p.letters = fb.letters; }
  }
  const unmatchedPages = pages.filter(p => !p.letters);
  const fyiLetters = ['בי', 'כן']; // official pages that failed to render (see SOURCES.json)
  const unmatchedLetters = letters.filter(L => !pages.some(p => p.letters === L) && !fyiLetters.includes(L));
  check(unmatchedPages.length === unmatchedLetters.length && unmatchedPages.length <= 1, `k26: cannot resolve ballot letters for ${unmatchedPages.map(p => p.url).join(', ')} / ${unmatchedLetters.join(',')}`);
  if (unmatchedPages.length === 1) unmatchedPages[0].letters = unmatchedLetters[0];
  check(pages.find(p => p.letters === 'י')?.nameHe.startsWith('ישראל תחילה'), 'k26: list י did not resolve to ישראל תחילה');
  const byLetters = new Map(pages.map(p => [p.letters, p]));
  const lists = letters.map((L, i) => {
    const id = `26-${L}`;
    const p = byLetters.get(L);
    let nameHe: string; let sponsors: string[]; let cands: PageCandidate[]; let notes: string[] = []; let secondary = false;
    if (p) { nameHe = p.nameHe; sponsors = p.sponsors; cands = p.candidates; notes = p.notes; }
    else {
      const f = parseFyi(L); // only for pages the official capture could not render
      nameHe = f.nameHe; sponsors = f.sponsors; cands = f.candidates; secondary = true;
      notes = [`רשימת המועמדים נלקחה ממקור משני (bechirot.fyi, עדכון ${f.updated}) משום שעמוד ועדת הבחירות לא נטען.`];
    }
    if (L === 'ק') notes.push('שם הרשימה בעמוד המועמדים: דרך חזון ותקומה; בטבלת התוצאות הסופיות של הוועדה: תקומה (k26-official-results).');
    if (L === 'קך') notes.push('בעמוד המועמדים: ולבחירות אישיות; בטבלת התוצאות הסופיות של הוועדה: ובחירות אישיות (k26-official-results).');
    const withdrawn = L === 'כן' || L === 'צבי';
    if (L === 'כן') notes.push('ועדת הבחירות המרכזית: "הרשימה אינה מתמודדת בבחירות לכנסת ה-26".');
    check(!cands.some(c => /מטעם|\|/.test(c.name)), `k26 ${L}: a candidate name still contains party text or table syntax`);
    sortAndCheckRanks(check, `k26 ${L}`, cands, { nonEmpty: !withdrawn });
    const singleSponsor = sponsors.length === 1 ? sponsors[0] : undefined;
    const candidates: Candidate[] = cands.map(c => ({ id: candidateId(id, c.rank), rank: c.rank, nameHe: c.name, partyHe: c.party ?? singleSponsor }));
    return listRecord(26, i, {
      letters: L, nameHe, votes: locTot.votes[i], sponsorsHe: sponsors.join('; '), partiesHe: sponsors, withdrawn, candidates,
      candidatesSource: secondary ? 'k26-secondary-fyi' : 'k26-list-pages', candidatesSecondary: secondary, notesHe: notes,
    });
  });

  const official = JSON.parse(readFileSync(join(RAW, 'k26/official-results.json'), 'utf8')) as {
    lists: { letters: string; votes: number; seats: number }[];
  };
  check(official.lists.length === lists.length, 'k26 official results: list count mismatch');
  for (const l of lists) {
    const row = official.lists.find(r => r.letters === l.letters);
    check(row && row.votes === l.votes, `k26 official results: vote mismatch for ${l.letters}`);
  }
  check(official.lists.reduce((sum, l) => sum + l.seats, 0) === 120, 'k26 official results: seats do not sum to 120');
  // The gazetted notice must state the same counts: every list that received votes, both totals, every readable seat row.
  const notice = await resultsNotice(letters);
  for (const l of lists) check(l.votes === 0 ? !notice.votes.has(l.letters) : notice.votes.get(l.letters) === l.votes, `k26 results notice: votes for ${l.letters} differ (${notice.votes.get(l.letters)} vs ${l.votes})`);
  check(notice.votes.size === lists.filter(l => l.votes > 0).length, 'k26 results notice: list count differs');
  check(notice.valid === locTot.valid && notice.invalid === locTot.invalid, `k26 results notice: totals differ (${notice.valid}/${notice.invalid} vs ${locTot.valid}/${locTot.invalid})`);
  for (const [L, n] of notice.seats) check(official.lists.find(r => r.letters === L)?.seats === n, `k26 results notice: seats for ${L} differ`);
  check(notice.seats.size >= 30 && notice.seatsTotal === 120, `k26 results notice: seat table unreadable (${notice.seats.size} rows, total ${notice.seatsTotal})`);
  const winners = official.lists.filter(r => r.seats > 0).map(r => r.letters);
  check(winners.length === notice.winners.size && winners.every(L => notice.winners.has(L)), `k26 results notice: elected lists differ (${[...notice.winners].join(',')})`);
  const ds: ElectionDataset = {
    schemaVersion: DATASET_SCHEMA_VERSION, id: 'k26', knesset: 26, electionDate: '2026-10-27',
    nameHe: 'הבחירות לכנסת ה-26', nameEn: 'Election to the 26th Knesset',
    status: {
      stage: 'official-final', asOf: '2026-11-09',
      noteHe: 'תוצאות סופיות רשמיות: ההודעה בדבר תוצאות הבחירות, ילקוט הפרסומים 15100 (4.11.2026). כל סיכומי הקולות והמנדטים תואמים את נתוני הוועדה.',
      noteEn: 'Official final results: the results notice, Yalkut HaPirsumim 15100 (4 Nov 2026). Every vote and seat total agrees with the CEC count.',
    },
    ruleSetId: 'il-2014-bader-ofer-3.25',
    totals: { registered: locTot.registered, votesCast: locTot.votesCast, invalid: locTot.invalid, valid: locTot.valid, ballotBoxes: ballotRows.length, ...geographyTotals(locRows) },
    lists, agreements: agreementRecords(26, await agreementPairs(letters), 'k26-surplus-gazette'), blocs: BLOCS.k26,
    officialSeats: Object.fromEntries(official.lists.map(l => [`26-${l.letters}`, l.seats])), officialSeatsSourceId: 'k26-results-gazette',
    sourceIds: ['k26-localities-csv', 'k26-ballots-csv', 'k26-list-pages', 'k26-secondary-fyi', 'k26-surplus-gazette', 'k26-national-snapshot', 'k26-official-results', 'k26-results-gazette', 'law-elections'],
    buildInfo: { builtAt: new Date().toISOString(), rawSha256 },
  };
  const warnings = unrecognised.length ? [`k26: ${unrecognised.length} unrecognised line(s) on list pages were not published as notes:\n  ${unrecognised.join('\n  ')}`] : [];
  return { ds, loc: localityDataset('k26', locRows, lists), warnings };
}
