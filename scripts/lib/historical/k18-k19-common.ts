import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { joinItems, pdfLines, type PdfItem, type PdfLine } from '../pdf-text.ts';
import type { Candidate, ElectionDataset, ListRecord, LocalityDataset } from '../../../src/data/schema.ts';
import { aggregateByCode, checkRowArithmetic, geographyTotals, readDatastoreRows, sumRows, type VoteRow } from '../build/locality.ts';
import { agreementRecords, listRecord, officialSeatsOf } from '../build/records.ts';
import { candidateId, checkContiguousRanks } from '../build/roster.ts';
import { RAW, rawJson, ROOT, sha256 as hash, sourceRecord, verifySources } from '../build/sources.ts';
import { checkAgreementPairs, checker, checkReproducesOfficialSeats, whole, type Check } from '../build/validate.ts';

export const check: Check = checker('k18/k19');
export const datastoreLetter = (n: 18 | 19, letter: string) => n === 19 && letter === 'מרצ' ? 'מרץ' : letter;
interface Roster { letters: string; nameHe: string; candidates: Candidate[] }

/** The 2013 PDF has an occluded, repeated PlacedPDF Labor template on 20 pages.
 * Discard that complete marked-content object, not fonts (rank fonts are shared).
 * Its 185 nonempty text runs are checked before exclusion. Keep all other objects.
 */
export async function candidatePages(n: 18 | 19): Promise<PdfLine[][]> {
  if (n === 18) return pdfLines(join(RAW, 'k18/candidates.pdf'));
  const doc = await getDocument({ data: new Uint8Array(readFileSync(join(RAW, 'k19/candidates.pdf'))), verbosity: 0 }).promise;
  const pages: PdfLine[][] = [];
  let removed = 0;
  for (let pn = 1; pn <= doc.numPages; pn++) {
    const tc = await (await doc.getPage(pn)).getTextContent({ includeMarkedContent: true });
    type Text = { str: string; transform: number[]; width: number };
    const segments: Text[][] = [[]];
    for (const item of tc.items) {
      if ('type' in item) { segments.push([]); continue; }
      if (item.str.trim()) segments.at(-1)!.push(item);
    }
    const lines: PdfLine[] = [];
    for (const seg of segments) {
      const repeated = pn > 2 && seg.slice(0, 4).map(i => i.str).join(' ') === 'אות הרשימה : אמת';
      if (repeated) { check(seg.length === 185, `k19 p${pn}: unexpected template object length ${seg.length}`); removed++; continue; }
      for (const i of seg) {
        // PDF p7 visibly prints 117; its text encoding incorrectly returns 551.
        const str = pn === 7 && i.str === '551' && Math.abs(i.transform[4] - 174.8076) < 0.1 ? '117' : i.str;
        const it: PdfItem = { str, x: i.transform[4], y: i.transform[5], w: i.width };
        let line = lines.find(l => Math.abs(l.y - it.y) < 1);
        if (!line) { line = { y: it.y, items: [], text: '' }; lines.push(line); }
        line.items.push(it);
      }
    }
    for (const l of lines) l.text = joinItems(l.items.sort((a, b) => b.x - a.x));
    pages.push(lines.sort((a, b) => b.y - a.y));
  }
  check(removed === 20, `k19: expected 20 repeated templates, got ${removed}`);
  return pages;
}

export async function parseCandidates(n: 18 | 19): Promise<Roster[]> {
  const pages = await candidatePages(n);
  const lists: Roster[] = [];
  let cur: Roster | undefined;
  let items: PdfItem[] = [];
  let inTable = false;
  let readingName = false;
  const flush = () => {
    if (!cur || !items.length) { items = []; return; }
    const ints = items.filter(i => /^\d{1,3}$/.test(i.str) && +i.str <= 120 && +i.str > 0);
    const paired = ints.filter(a => ints.some(b => b !== a && Math.abs(a.y - b.y) < 1 && Math.abs(+a.str - +b.str) === 1));
    const rights: number[] = [];
    for (const i of paired.length ? paired : ints) if (!rights.some(x => Math.abs(x - i.x - i.w) < 4)) rights.push(i.x + i.w);
    rights.sort((a, b) => b - a);
    check(rights.length <= 3, `k${n} ${cur.letters}: ambiguous rank columns ${rights}`);
    const ranks = ints.filter(i => rights.some(r => Math.abs(r - i.x - i.w) < 4));
    const groups = rights.map((right, g) => ({ right, left: rights[g + 1] ?? 0 }));
    const assigned = new Set<PdfItem>();
    for (const r of ranks) {
      const group = groups.find(g => Math.abs(g.right - r.x - r.w) < 4)!;
      const peers = ranks.filter(i => Math.abs(i.x + i.w - group.right) < 4);
      const parts = items.filter(i => !ranks.includes(i) && i.x + i.w < group.right - 3 && i.x + i.w > group.left + 3 && Math.abs(i.y - r.y) < 15 && peers.every(p => Math.abs(i.y - r.y) <= Math.abs(i.y - p.y)));
      for (const i of parts) { check(!assigned.has(i), `k${n} ${cur.letters}: ambiguous name-fragment assignment`); assigned.add(i); }
      const ys: number[] = [];
      for (const p of parts) if (!ys.some(y => Math.abs(y - p.y) < 1)) ys.push(p.y);
      // Preserve touching one-letter fragments, but keep separate name cells separated.
      const nameHe = ys.sort((a, b) => b - a).map(y => {
        const runs = parts.filter(i => Math.abs(i.y - y) < 1).sort((a, b) => b.x - a.x);
        let text = '';
        runs.forEach((run, i) => {
          const prev = runs[i - 1];
          const touchingFragment = prev && prev.x - run.x - run.w < 1.5 && (prev.str.length === 1 || run.str.length === 1 || /[-–]$/.test(prev.str));
          text += (i && !touchingFragment ? ' ' : '') + run.str;
        });
        return text;
      }).join(' ').replace(/\s+/g, ' ').trim();
      check(/[א-ת]/.test(nameHe) && !/\d/.test(nameHe), `k${n} ${cur.letters} #${r.str}: bad name ${nameHe}`);
      const old = cur.candidates.find(c => c.rank === +r.str);
      check(!old || old.nameHe === nameHe, `k${n} ${cur.letters}: conflicting duplicate rank ${r.str}`);
      if (!old) cur.candidates.push({ id: candidateId(`${n}-${cur.letters}`, +r.str), rank: +r.str, nameHe });
    }
    const unattached = items.filter(i => !ranks.includes(i) && !assigned.has(i) && /[א-ת]/.test(i.str));
    check(unattached.length === 0, `k${n} ${cur.letters}: unattached name text: ${unattached.map(i => i.str).join(' / ')}`);
    check(ranks.length > 0, `k${n} ${cur.letters}: table without candidate ranks`);
    items = [];
  };
  for (const page of pages) {
    flush();
    for (const l of page) {
      if (l.y < 60 || /ילקוט הפרסומים|^_{3,}|^ס["״]ח|^\d$/.test(l.text)) continue;
      const a = l.text.match(/^(?:אות|אותיות) הרשימה\s*:\s*([א-ת]+)$/);
      if (a) { flush(); inTable = false; readingName = false; cur = lists.find(x => x.letters === a[1]); if (!cur) { cur = { letters: a[1], nameHe: '', candidates: [] }; lists.push(cur); } continue; }
      if (/^כינוי הרשימה/.test(l.text)) { flush(); inTable = false; readingName = true; if (cur) cur.nameHe = l.text.replace(/^כינוי הרשימה\s*:\s*/, ''); continue; }
      if ((l.text.match(/משפחה/g) ?? []).length >= 2) { flush(); readingName = false; inTable = true; continue; }
      if (/הודעות מאת הציבור|^י"ז בטבת|^כ"ט בטבת|^אליקים רובינשטיין|^אליעזר ריבלין|^\(חמ|^\)2חמ/.test(l.text)) { flush(); inTable = false; continue; }
      if (readingName && cur && !inTable) cur.nameHe += ' ' + l.text;
      if (inTable && cur) items.push(...l.items.filter(i => i.str.trim()));
    }
  }
  flush();
  for (const l of lists) {
    l.candidates.sort((a, b) => a.rank - b.rank);
    checkContiguousRanks(check, `k${n} ${l.letters}`, l.candidates);
  }
  return lists;
}

export interface National { letters: string; nameHe: string; votes: number; seats: number }
export async function gazetteNational(n: 18 | 19): Promise<{ lists: National[]; printedValid: number; printedInvalid: number }> {
  const p = await pdfLines(join(RAW, `k${n}/results.pdf`));
  const lists: National[] = [];
  // Names can wrap, with the count on either their first or final visual line.
  const table = (lines: PdfLine[], stop: RegExp) => {
    const out: { letters: string; nameHe: string; count: number }[] = [];
    let pending = ''; let name = ''; let started = false;
    for (const l of lines) {
      if (stop.test(l.text)) break;
      if (/^אות הרשימה/.test(l.text)) { started = true; continue; }
      if (!started) continue;
      const m = l.text.match(/^([א-ת]{1,3})\s+(.*)$/);
      if (m) { pending = m[1]; name = m[2]; }
      else if (pending) name += ' ' + l.text;
      else { if (out.length) out.at(-1)!.nameHe += ' ' + l.text; continue; }
      const count = l.text.match(/(?:^|\s)([\d,]+)$/);
      if (count && pending) { out.push({ letters: pending, nameHe: name.replace(/[\d,]+$/, '').trim(), count: +count[1].replaceAll(',', '') }); pending = ''; name = ''; }
    }
    return out;
  };
  for (const r of table(p[1], /סך כל הקולות הכשרים/)) lists.push({ letters: r.letters, nameHe: r.nameHe, votes: r.count, seats: 0 });
  for (const r of table(p[2], /סך כל המנדטים/)) {
    const list = lists.find(l => l.letters === r.letters); check(list, `k${n}: seat row ${r.letters} without vote row`); list.seats = r.count;
  }
  check(lists.length === (n === 18 ? 33 : 32), `k${n}: expected national table rows, got ${lists.length}`);
  check(lists.reduce((s, l) => s + l.seats, 0) === 120, `k${n}: gazetted seats do not total 120`);
  const number = (text: string) => +(text.match(/[\d,]+$/)?.[0] ?? 'NaN').replaceAll(',', '');
  return { lists, printedValid: number(p[1].find(l => /סך כל הקולות הכשרים/.test(l.text))!.text), printedInvalid: number(p[2].find(l => /מספר הקולות שנמצאו פסולים/.test(l.text))!.text) };
}

// These sources always provide a locality code and electorate (the committee is not given: 0).
type LocRow = VoteRow;
export function readRows(n: 18 | 19, path: string, letters: string[]): LocRow[] {
  return readDatastoreRows(path, letters, check, { column: l => datastoreLetter(n, l), registered: n === 18 ? "בז''ב" : 'בזב', committee: 'zero',
    name: s => s.trim(), zeroColumns: n === 18 ? ['פח'] : ['זה', 'פך'] }); // withdrawn lists' columns must hold no votes
}
/** Polling stations summed per official locality code, sorted by code. */
export const aggregate = (rows: LocRow[]): LocRow[] => aggregateByCode(rows).sort((a, b) => a.code - b.code);
export async function agreements(n: 18 | 19, pairs: [string, string][]): Promise<ElectionDataset['agreements']> {
  const pages = await pdfLines(join(RAW, `k${n}/surplus.pdf`));
  // Only the notice's column; adjacent notices can contain the same ballot letters.
  const lines = pages[n === 18 ? 7 : 1].filter(l => l.y > 60).map(l => joinItems(l.items.filter(i => i.x > 245)));
  const text = lines.join('\n');
  const start = text.indexOf('הודעה בדבר התקשרויות');
  const body = text.slice(start).split(n === 18 ? 'ז\' בשבט' : 'ב\' בשבט')[0];
  const actual = [...body.matchAll(/-\s*([א-ת]{1,3})[.\s]*(?=\n|$)/g)].map(m => m[1]);
  check(JSON.stringify(actual) === JSON.stringify(pairs.flat()), `k${n}: agreement notice mismatch: ${actual}`);
  return agreementRecords(n, pairs, `k${n}-surplus-gazette`);
}

export interface BuildOptions {
  n: 18 | 19; date: string; asOf: string; pairs: [string, string][];
  candidateCounts: Record<string, number>;
  candidateLeaders: Record<string, string>;
  totals: ElectionDataset['totals']; noteHe: string; noteEn: string;
}
export async function buildHistorical(o: BuildOptions): Promise<{ ds: ElectionDataset; loc: LocalityDataset }> {
  const { n } = o;
  const national = await gazetteNational(n);
  const rosters = await parseCandidates(n);
  const finalCapture = n === 19 ? JSON.parse(readFileSync(join(RAW, 'k19/final-results.capture.json'), 'utf8')) as { lists: National[] } : null;
  const correction = n === 19 ? { מחל: 109, כן: -107, יק: -2 } : {};
  if (finalCapture) {
    const deltas = Object.fromEntries(national.lists.map(l => {
      const final = finalCapture.lists.find(r => r.letters === l.letters); check(final, `k19: final CEC row missing for ${l.letters}`);
      return [l.letters, final.votes - l.votes];
    }).filter(([, delta]) => delta !== 0));
    check(JSON.stringify(deltas) === JSON.stringify({ יק: -2, כן: -107, מחל: 109 }), 'k19: documented list discrepancies changed');
  }
  const lists: ListRecord[] = national.lists.map((l, i) => {
    const r = rosters.find(r => r.letters === l.letters);
    check(r, `k${n}: roster missing for ${l.letters}`);
    check(r.candidates.length === o.candidateCounts[l.letters], `k${n} ${l.letters}: candidate count differs from reviewed last rank`);
    return listRecord(n, i, { letters: l.letters, nameHe: l.nameHe, fallbackShortHe: r.nameHe,
      votes: finalCapture?.lists.find(r => r.letters === l.letters)?.votes ?? l.votes,
      candidates: r.candidates, candidatesSource: `k${n}-candidates-gazette`,
      notesHe: n === 19 && l.letters in correction ? ['מספר הקולות לפי התוצאות הסופיות באתר ועדת הבחירות; שונה מפרסום רשומות המקורי. ראו החלטה 0041.'] : [] });
  });
  for (const [letters, leader] of Object.entries(o.candidateLeaders)) check(lists.find(l => l.letters === letters)?.candidates[0].nameHe === leader, `k${n} ${letters}: unexpected first candidate`);
  const letters = lists.map(l => l.letters);
  checkAgreementPairs(check, `k${n}`, o.pairs, letters);
  const sourceIds = [`k${n}-results-gazette`, `k${n}-candidates-gazette`, `k${n}-surplus-gazette`, `k${n}-ballots-datagov`, ...(n === 18 ? ['k18-allocation-memorandum'] : ['k19-localities-datagov', 'k19-final-results-capture'])];
  // the polling-station copy lives in ignored scratch; its hash is checked when present
  const rawSha256 = verifySources(sourceIds, check, { allowMissingFile: true });
  // The retained fingerprint covers the original election evidence, before additive demographic metadata.
  // Rebuild that exact object; new metadata is verified and reattached by the top-level builder.
  const { groups: _groups, demographicNoteEn: _en, demographicNoteHe: _he, ...loc } =
    JSON.parse(readFileSync(join(ROOT, `public/data/k${n}-localities.json`), 'utf8')) as Omit<LocalityDataset, 'rows'> & { rows: LocRow[] };
  check(loc.id === `k${n}` && JSON.stringify(loc.listIds) === JSON.stringify(lists.map(l => l.id)), `k${n}: locality schema/list order mismatch`);
  const fingerprint = rawJson(`k${n}/localities.sha256.json`);
  check(hash(JSON.stringify(loc)) === fingerprint.sha256, `k${n}: committed locality checksum differs`);
  check(loc.rows.length === fingerprint.rows, `k${n}: locality row count differs`);
  for (const row of loc.rows) {
    check(row.votes.length === lists.length && row.votes.every(whole), `k${n} locality ${row.code}: invalid totals`);
    checkRowArithmetic(check, `k${n} locality ${row.code}`, row);
  }
  const sums = sumRows(loc.rows, lists.length);
  check(sums.valid === o.totals.valid && sums.invalid === o.totals.invalid && sums.votesCast === o.totals.votesCast, `k${n}: locality totals differ from national`);
  lists.forEach((l, i) => check(l.votes === sums.votes[i], `k${n} ${l.letters}: national/locality votes differ`));
  check(lists.reduce((s, l) => s + l.votes, 0) === o.totals.valid, `k${n}: national lists do not sum to valid`);
  if (n === 19) {
    check(sums.registered === o.totals.registered, 'k19: registered total differs');
    const envelope = rawJson('k19/envelopes.derived.json');
    check(envelope.sourceSha256 === rawSha256['k19-ballots-datagov'] && envelope.row.code === 875 && envelope.pollingRows === 228, 'k19: external envelope provenance differs');
    const independent = [...readRows(n, join(RAW, 'k19/localities.datagov.json'), letters), envelope.row].sort((a, b) => a.code - b.code);
    check(JSON.stringify(independent) === JSON.stringify(loc.rows), 'k19: locality rows differ from independent source');
    check(national.printedValid === 3792472 && national.printedInvalid === 40904, 'k19: gazette exception changed');
  } else check(national.printedValid === 3373490 && national.printedInvalid === 49684 && sums.registered - (loc.rows.find(r => r.code === 0)?.registered ?? 0) === o.totals.registered, 'k18: documented gazette/envelope exceptions changed');
  check(fingerprint.pollingSourceSha256 === rawSha256[`k${n}-ballots-datagov`], `k${n}: locality derivation source hash differs`);
  const ballotPath = join(ROOT, `.backup-scratch/raw/k${n}/ballots.datagov.json`);
  if (existsSync(ballotPath)) {
    const ballots = readRows(n, ballotPath, letters);
    check(ballots.length === o.totals.ballotBoxes, `k${n}: polling row count changed`);
    check(JSON.stringify(aggregate(ballots)) === JSON.stringify(loc.rows), `k${n}: polling/locality reconciliation failed`);
    console.log(`k${n}: full polling-station/locality reconciliation passed`);
  } else console.log(`k${n}: scratch polling stations absent; skipping full polling reconciliation; committed locality SHA-256 and national checks passed`);
  const ds: ElectionDataset = { schemaVersion: 1, id: `k${n}`, knesset: n, electionDate: o.date,
    nameHe: `הבחירות לכנסת ה-${n}`, nameEn: `Election to the ${n}th Knesset`,
    status: { stage: 'official-final', asOf: o.asOf, noteHe: o.noteHe, noteEn: o.noteEn },
    // envelope rows are not localities: code 0 (double envelopes), 9999, or the external-envelope group by name
    ruleSetId: 'il-2004-bader-ofer-2', totals: { ...o.totals, localities: geographyTotals(loc.rows, r => r.code === 0 || r.code === 9999 || r.nameHe === 'מעטפות חיצוניות').localities }, lists, agreements: await agreements(n, o.pairs), blocs: [],
    officialSeats: officialSeatsOf(n, national.lists), officialSeatsSourceId: `k${n}-results-gazette`, sourceIds,
    buildInfo: { builtAt: new Date().toISOString(), rawSha256 } };
  // Independently retained CEC totals corroborate each documented national exception.
  if (n === 19) {
    const final = rawJson('k19/final-results.capture.json');
    check(['registered', 'votesCast', 'invalid', 'valid'].every(k => final.totals[k] === o.totals[k as keyof typeof o.totals]), 'k19: CEC final totals differ');
    check(final.lists.length === lists.length && final.lists.every((r: National) => lists.some(l => l.letters === r.letters && l.votes === r.votes && ds.officialSeats![l.id] === r.seats)), 'k19: CEC final per-list numbers differ');
  } else {
    const memorandum = (await pdfLines(join(RAW, 'k18/allocation.pdf')))[2].map(l => l.text).join(' ');
    for (const value of ['5,278,985', '3,416,587', '43,097', '3,373,490']) check(memorandum.includes(value), `k18: CEC memorandum lacks ${value}`);
  }
  checkReproducesOfficialSeats(check, ds);
  return { ds, loc };
}

/** Explicit maintenance command; ordinary builds never bless changed locality hashes.
 * Recover scratch with fetch-sources.ts first, then regenerate and review the diff.
 */
export async function regenerateLocalities() {
  const { writeFileSync } = await import('node:fs');
  for (const n of [18, 19] as const) {
    const letters = (await gazetteNational(n)).lists.map(l => l.letters);
    const ballots = readRows(n, join(ROOT, `.backup-scratch/raw/k${n}/ballots.datagov.json`), letters);
    const rows = aggregate(ballots);
    const sourceSha256 = sourceRecord(`k${n}-ballots-datagov`)!.sha256!;
    check(hash(readFileSync(join(ROOT, `.backup-scratch/raw/k${n}/ballots.datagov.json`))) === sourceSha256, `k${n}: source hash differs before regeneration`);
    if (n === 19) {
      const independent = readRows(n, join(RAW, 'k19/localities.datagov.json'), letters).sort((a, b) => a.code - b.code);
      check(JSON.stringify(rows.filter(r => r.code !== 875)) === JSON.stringify(independent), 'k19: independent locality reconciliation failed before regeneration');
      const envelope = rows.find(r => r.code === 875);
      check(envelope, 'k19: missing external-envelope group');
      writeFileSync(join(RAW, 'k19/envelopes.derived.json'), JSON.stringify({ sourceId: 'k19-ballots-datagov', sourceSha256, pollingRows: ballots.filter(r => r.code === 875).length, row: envelope }, null, 2) + '\n');
    }
    const loc: LocalityDataset = { schemaVersion: 1, id: `k${n}`, listIds: letters.map(l => `${n}-${l}`), rows };
    const json = JSON.stringify(loc);
    writeFileSync(join(ROOT, `public/data/k${n}-localities.json`), json);
    writeFileSync(join(RAW, `k${n}/localities.sha256.json`), JSON.stringify({ sha256: hash(json), rows: rows.length,
      derivation: n === 18 ? 'Polling stations grouped by official locality code; code 0 is double envelopes.' : 'Independent locality rows plus code 875 external envelopes derived from 228 polling rows, sorted by official code.', pollingSourceSha256: sourceSha256 }, null, 2) + '\n');
  }
}
if (import.meta.url === `file://${process.argv[1]}` && process.argv.includes('--regenerate-localities')) await regenerateLocalities();
