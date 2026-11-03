// K20/K21-specific extraction and release gates. No synthetic candidate rosters.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pdfLines, joinItems, type PdfItem } from '../pdf-text.ts';
import { DATASET_SCHEMA_VERSION, type ElectionDataset, type ListRecord } from '../../../src/data/schema.ts';
import { nationalResultsHtml } from '../build/cec-html.ts';
import { checkLocalitiesMatchPolling, checkRowsMatchNational, collapse, geographyTotals, localityDataset, readDatastoreRows, TOTAL_FIELDS, type VoteRow } from '../build/locality.ts';
import { agreementRecords, inKeyOrder, listRecord, officialSeatsOf } from '../build/records.ts';
import { candidateId, checkContiguousRanks } from '../build/roster.ts';
import { fileSha256, RAW, rawJson, ROOT, sha256 as hash, sourceRecord, verifySources } from '../build/sources.ts';
import { checkAgreementPairs, checker, checkReproducesOfficialSeats, type Check } from '../build/validate.ts';

export { RAW };
export const check: Check = checker('k20/k21 build');
export const clean = collapse;
const stripPeriod = (s: string) => clean(s).replace(/\.$/, '');
interface GazetteList {
  letters: string; nameHe: string; sponsorsHe: string;
  candidates: { rank: number; nameHe: string; givenHe: string; familyHe: string; partyHe?: string }[];
}

/** Header-labelled columns, one to three groups, re-read at every page/table boundary.
 * Every rank and every text run in a table must be consumed; identical printed duplicate
 * ranks are coalesced, conflicting duplicates fail. Final singleton rows are retained. */
export async function candidates(n: 20 | 21): Promise<GazetteList[]> {
  const pages = await pdfLines(join(RAW, `k${n}/candidates.pdf`));
  const lists: GazetteList[] = [];
  let cur: GazetteList | undefined;
  let field: 'sponsorsHe' | 'nameHe' | undefined;
  let draft = { sponsorsHe: '', nameHe: '', letters: '' };
  let columns: { right: number; label: 'givenHe' | 'familyHe' | 'partyHe'; group: number }[] = [];
  let segment: PdfItem[] = [];
  const flush = () => {
    if (!segment.length) return;
    check(cur && columns.length, `k${n}: candidate data outside a labelled table`);
    const firstCols = columns.filter((c, i) => i === 0 || c.group !== columns[i - 1].group);
    const ints = segment.filter(it => /^\d{1,3}$/.test(it.str.trim()) && firstCols.some(c => it.x > c.right && it.x - c.right < 60));
    check(ints.length > 0, `k${n} ${cur.letters}: table without ranks`);
    const anchors = firstCols.map(c => {
      const hits = ints.filter(it => it.x > c.right && it.x - c.right < 60);
      // Empty groups occur on singleton final rows.
      return hits.length ? Math.max(...hits.map(it => it.x + it.w)) : c.right + 20;
    });
    const groupOf = (it: PdfItem) => anchors.findIndex((r, g) => it.x + it.w <= r + 3 && it.x + it.w > (anchors[g + 1] ?? -Infinity) + 3);
    const rows = ints.map(it => ({ it, group: groupOf(it), cells: new Map<string, PdfItem[]>() }));
    for (const it of segment) {
      if (ints.includes(it)) continue;
      const g = groupOf(it);
      const row = rows.filter(r => r.group === g).sort((a, b) => Math.abs(a.it.y - it.y) - Math.abs(b.it.y - it.y))[0];
      check(row && Math.abs(row.it.y - it.y) <= 12, `k${n} ${cur.letters}: unattached text "${it.str}"`);
      const col = columns.filter(c => c.group === g).sort((a, b) => Math.abs(a.right - it.x - it.w) - Math.abs(b.right - it.x - it.w))[0];
      check(col, `k${n} ${cur.letters}: unlabelled candidate column`);
      row.cells.set(col.label, [...(row.cells.get(col.label) ?? []), it]);
    }
    const cellText = (items: PdfItem[]) => {
      const lines: { y: number; items: PdfItem[] }[] = [];
      for (const it of items) {
        const l = lines.find(l => Math.abs(l.y - it.y) < 1);
        if (l) l.items.push(it); else lines.push({ y: it.y, items: [it] });
      }
      return clean(lines.sort((a, b) => b.y - a.y).map(l => joinItems(l.items.sort((a, b) => b.x - a.x))).join(' '));
    };
    for (const row of rows) {
      // YP7000 p3944 prints rank 10 as "01" in its PDF text layer (after 7,8,9).
      const rank = n === 20 && cur.letters === 'יץ' && row.it.str === '01' ? 10 : Number(row.it.str);
      const givenHe = cellText(row.cells.get('givenHe') ?? []);
      const familyHe = cellText(row.cells.get('familyHe') ?? []);
      const partyHe = cellText(row.cells.get('partyHe') ?? []);
      check(rank >= 1 && rank <= 120 && givenHe && familyHe, `k${n} ${cur.letters} #${rank}: missing name or invalid rank`);
      const c = { rank, nameHe: `${familyHe} ${givenHe}`, givenHe, familyHe, ...(partyHe ? { partyHe } : {}) };
      const old = cur.candidates.find(c => c.rank === rank);
      check(!old || JSON.stringify(old) === JSON.stringify(c), `k${n} ${cur.letters} #${rank}: conflicting printed duplicate`);
      if (!old) cur.candidates.push(c);
    }
    segment = [];
  };
  let ended = false;
  for (const [pi, lines] of pages.entries()) {
    flush(); columns = [];
    if (pi === 0) continue; // cover/index, not candidate data
    for (const l of lines) {
      if (l.y < 45 || /ילקוט הפרסומים|DoCenter/.test(l.text)) continue;
      if (/^הודעה על|^הודעות מאת הציבור|^י"ז באדר ב'|^ד' באדר התשע"ה/.test(l.text)) { flush(); ended = true; break; }
      if (/^_{3,}|^[12]$|^[סק]"[חת] /.test(l.text)) { flush(); columns = []; continue; }
      const p = l.text.match(/^מטעם המפלג(?:ה|ות|וה)\s*:\s*(.*)$/);
      if (p) { flush(); columns = []; draft = { sponsorsHe: p[1], nameHe: '', letters: '' }; field = 'sponsorsHe'; continue; }
      const a = l.text.match(/^(?:אות|אותיות) הרשימה\s*:\s*(.*)$/);
      if (a) { draft.letters = stripPeriod(a[1]); field = undefined; continue; }
      const title = l.text.match(/^כינוי הרשימה\s*:\s*(.*)$/);
      if (title) { draft.nameHe = title[1]; field = 'nameHe'; continue; }
      if (/משפחה/.test(l.text) && /פרטי/.test(l.text)) {
        flush();
        if (draft.letters) {
          check(!lists.some(g => g.letters === draft.letters), `k${n}: duplicate list ${draft.letters}`);
          cur = { letters: draft.letters, nameHe: stripPeriod(draft.nameHe), sponsorsHe: stripPeriod(draft.sponsorsHe), candidates: [] };
          lists.push(cur); draft = { sponsorsHe: '', nameHe: '', letters: '' };
        }
        field = undefined;
        const labels = l.items.filter(it => /פרטי|משפחה|מפלגתית/.test(it.str));
        const party = labels.some(it => /מפלגתית/.test(it.str));
        columns = labels.map((it, i) => ({ right: it.x + it.w, group: Math.floor(i / (party ? 3 : 2)), label: /פרטי/.test(it.str) ? 'givenHe' : /משפחה/.test(it.str) ? 'familyHe' : 'partyHe' }));
        continue;
      }
      if (/^(?:השתייכות\s*)+$/.test(l.text)) continue;
      if (field) { draft[field] += ' ' + l.text; continue; }
      if (cur && columns.length) segment.push(...l.items.filter(it => it.str.trim()));
    }
    if (ended) break;
  }
  flush();
  for (const g of lists) {
    g.candidates.sort((a, b) => a.rank - b.rank);
    checkContiguousRanks(check, `k${n} ${g.letters}`, g.candidates);
  }
  return lists;
}

export interface NationalList { letters: string; name: string; votes: number; seats: number }
export interface National { lists: NationalList[]; registered: number; votesCast: number; invalid: number; valid: number }
export const nationalHtml = (n: 21): National => nationalResultsHtml(`k${n}/nationalresults.html`, 43, check, `k${n}`);

/** k20/k21 locality rows serialize committee first. */
const ROW_KEYS = ['committee', 'code', 'nameHe', 'registered', 'votesCast', 'invalid', 'valid', 'votes'];
function rows(file: string, letters: string[]): VoteRow[] {
  return readDatastoreRows(file, letters, check, { committee: 'optional' }).map(r => {
    // K20 polling file uses 875 for envelopes, its locality file uses 0; canonical application code 9999.
    const envelope = r.nameHe === 'מעטפות חיצוניות' || r.code === 0 || r.code === 99999;
    return inKeyOrder({ ...r, code: envelope ? 9999 : r.code, nameHe: envelope ? 'מעטפות חיצוניות' : r.nameHe }, ROW_KEYS) as unknown as VoteRow;
  });
}
export function geographical(n: 20 | 21, national: National) {
  const letters = national.lists.map(l => l.letters);
  const loc = rows(join(RAW, `k${n}/localities.datagov.json`), letters).sort((a, b) => a.code - b.code);
  check(new Set(loc.map(r => r.code)).size === loc.length, `k${n}: duplicate locality`);
  checkRowsMatchNational(check, `k${n} localities`, loc, national, TOTAL_FIELDS);
  const evidence = rawJson<{ localitySha256: string; ballotSha256: string; ballotRows: number }>(`k${n}/locality-verification.json`);
  check(hash(JSON.stringify(loc)) === evidence.localitySha256, `k${n}: derived locality SHA-256 differs from retained reconciliation evidence`);
  check(evidence.ballotSha256 === sourceRecord(`k${n}-ballots-datagov`)?.sha256, `k${n}: retained polling evidence differs from source provenance`);
  check(Number.isSafeInteger(evidence.ballotRows) && evidence.ballotRows > 0, `k${n}: invalid retained polling row count`);
  const polling = join(ROOT, `.backup-scratch/raw/k${n}/ballots.datagov.json`);
  if (existsSync(polling)) {
    check(fileSha256(polling) === evidence.ballotSha256, `k${n}: polling source hash changed; reconciliation evidence must be reviewed`);
    const bal = rows(polling, letters);
    check(bal.length === evidence.ballotRows, `k${n}: polling row count changed`);
    checkRowsMatchNational(check, `k${n} ballots`, bal, national, TOTAL_FIELDS);
    checkLocalitiesMatchPolling(check, `k${n}`, loc, bal);
    console.log(`k${n}: reconciled all ${bal.length} polling rows with ${loc.length} locality rows`);
  } else console.log(`k${n}: scratch polling stations absent; skipping full polling reconciliation; retained locality SHA-256 verified`);
  return { rows: loc, ballotRows: evidence.ballotRows };
}

/** Read only the gazette's notice column, in its printed column order. */
export async function surplus(n: 20 | 21): Promise<[string, string][]> {
  const page = (await pdfLines(join(RAW, `k${n}/surplus.pdf`)))[1];
  const columnText = (rightColumn: boolean) => page.map(l => ({ y: l.y, text: joinItems(l.items.filter(it => rightColumn ? it.x > 245 : it.x < 245)) })).filter(l => l.text);
  const right = columnText(true); const left = columnText(false);
  const first = n === 20 ? right : left;
  const start = first.findIndex(l => l.text.startsWith('הודעה בדבר התקשרות'));
  check(start >= 0, `k${n}: missing agreement notice`);
  const text = [...first.slice(start), ...(n === 20 ? left : [])].map(l => l.text).join('\n');
  const end = n === 20 ? text.indexOf('י"ז באדר באדר') : text.indexOf('כ"ד באדר ב\'');
  check(end > 0, `k${n}: agreement notice has no closing signature date`);
  const notice = text.slice(0, end);
  const items = notice.split(n === 20 ? /\)(\d+)\(/ : /\((\d+)\)/).slice(1);
  const pairs: [string, string][] = [];
  for (let i = 0; i < items.length; i += 2) {
    check(Number(items[i]) === pairs.length + 1, `k${n}: non-contiguous agreement numbering`);
    const match = [...items[i + 1].matchAll(/[-–]\s*([א-ת"״]+)\s*[;.\n]/g)].map(m => m[1].replace(/["״]/g, ''));
    check(match.length === 2, `k${n}: ambiguous agreement item ${items[i]}: ${items[i + 1]}`);
    pairs.push([match[0], match[1]]);
  }
  check(pairs.length === (n === 20 ? 4 : 6) && new Set(pairs.flat()).size === pairs.length * 2, `k${n}: incomplete or duplicate agreement pairs`);
  return pairs;
}

export async function build(n: 20 | 21, national: National, expectedCounts: Record<string, number>, leaders: Record<string, string>, date: string, asOf: string, nationalSource: string) {
  const gaz = await candidates(n);
  check(gaz.length === national.lists.length, `k${n}: candidate/result list count differs`);
  const geo = geographical(n, national);
  const lists: ListRecord[] = national.lists.map((l, i) => {
    const g = gaz.find(g => g.letters === l.letters);
    check(g && g.candidates.length === expectedCounts[l.letters], `k${n} ${l.letters}: roster count differs from audited gazette endpoint`);
    if (leaders[l.letters]) check(g.candidates[0].nameHe === leaders[l.letters], `k${n} ${l.letters}: first candidate differs from verified leader`);
    check(g.candidates.length >= l.seats, `k${n} ${l.letters}: fewer candidates than elected seats`);
    const id = `${n}-${l.letters}`;
    const notesHe: string[] = [];
    if (n === 20 && l.letters === 'מחל') notesHe.push('ילקוט הפרסומים 7001: המועמדת נטליה ילינסון התפטרה ביום 26.2.2015. הרשימה כאן מציגה את סדר הרישום בילקוט 7000.');
    if (n === 20 && l.letters === 'יץ') notesHe.push('ילקוט הפרסומים 7001: סעיד בדראן ואבו עאבד ראאף התפטרו ביום 2.3.2015. הרשימה כאן מציגה את סדר הרישום בילקוט 7000.');
    return listRecord(n, i, { letters: l.letters, nameHe: g.nameHe, votes: l.votes,
      sponsorsHe: g.sponsorsHe, partiesHe: g.sponsorsHe.includes(';') ? null : [g.sponsorsHe],
      candidates: g.candidates.map(c => ({ id: candidateId(id, c.rank), ...c })), candidatesSource: `k${n}-candidates-gazette`, notesHe });
  });
  const pairs = await surplus(n);
  checkAgreementPairs(check, `k${n}`, pairs, lists.map(l => l.letters));
  const ids = [nationalSource, `k${n}-localities-datagov`, `k${n}-ballots-datagov`, `k${n}-candidates-gazette`, `k${n}-surplus-gazette`];
  // the polling-station copy lives in ignored scratch; its hash is checked when present
  const rawSha256 = verifySources(ids, check, { allowMissingFile: true });
  const ds: ElectionDataset = {
    schemaVersion: DATASET_SCHEMA_VERSION, id: `k${n}`, knesset: n, electionDate: date, nameHe: `הבחירות לכנסת ה-${n}`, nameEn: `Election to the ${n === 20 ? '20th' : '21st'} Knesset`,
    status: { stage: 'official-final', asOf,
      noteHe: 'תוצאות רשמיות סופיות. המועמדים לפי סדר הרישום בילקוט הפרסומים; הודעות התפטרות ידועות בהערות. לא מוצגת השתייכות לגושים.',
      noteEn: 'Official final results. Candidates follow the gazetted registration order; known resignation notices are labelled. No default blocs assigned.' },
    ruleSetId: 'il-2014-bader-ofer-3.25', totals: { registered: national.registered, votesCast: national.votesCast, invalid: national.invalid, valid: national.valid, ballotBoxes: geo.ballotRows, ...geographyTotals(geo.rows) },
    lists, agreements: agreementRecords(n, pairs, `k${n}-surplus-gazette`), blocs: [], officialSeats: officialSeatsOf(n, national.lists), officialSeatsSourceId: nationalSource,
    sourceIds: [...ids, 'law-elections'], buildInfo: { builtAt: new Date().toISOString(), rawSha256 },
  };
  checkReproducesOfficialSeats(check, ds);
  return { ds, loc: localityDataset(`k${n}`, geo.rows, lists) };
}
