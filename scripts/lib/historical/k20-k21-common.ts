// K20/K21-specific extraction and release gates. No synthetic candidate rosters.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pdfLines, joinItems, type PdfItem } from '../pdf-text.ts';
import { META, neutralColor } from '../list-meta.ts';
import { DATASET_SCHEMA_VERSION, type ElectionDataset, type ListRecord, type LocalityDataset } from '../../../src/data/schema.ts';
import { scenarioFromDataset, toEngineInput } from '../../../src/model/scenario.ts';
import { allocate } from '../../../src/engine/allocate.ts';

export const ROOT = join(import.meta.dirname, '../../..');
export const RAW = join(ROOT, 'data/raw');
export function check(value: unknown, message: string): asserts value {
  if (!value) throw new Error(`k20/k21 build: ${message}`);
}
export const hash = (data: string | Buffer) => createHash('sha256').update(data).digest('hex');
export const clean = (s: string) => s.replace(/\s+/g, ' ').trim();
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
    check(g.candidates.length && g.candidates.every((c, i) => c.rank === i + 1), `k${n} ${g.letters}: non-contiguous ranks`);
  }
  return lists;
}

export interface NationalList { letters: string; name: string; votes: number; seats: number }
export interface National { lists: NationalList[]; registered: number; votesCast: number; invalid: number; valid: number }
export function nationalHtml(n: 21): National {
  const cells = readFileSync(join(RAW, `k${n}/nationalresults.html`), 'utf8')
    .replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, '\n')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
    .split('\n').map(clean).filter(Boolean);
  const idx = cells.findIndex(c => c.startsWith('סה"כ הקולות הפסולים'));
  check(idx >= 0, `k${n}: missing national totals`);
  const [registered, votesCast, , valid, invalid] = cells.slice(idx + 1, idx + 6).map(s => Number(s.replace(/[,%]/g, '')));
  const lists: NationalList[] = [];
  const tab = cells.findIndex(c => c.startsWith('מספר הקולות הכשרים לרשימה'));
  for (let i = tab + 1; i + 4 < cells.length; i += 5) {
    if (!/^\d+$/.test(cells[i + 2]) || !/%$/.test(cells[i + 3])) break;
    lists.push({ name: cells[i], letters: cells[i + 1], seats: Number(cells[i + 2]), votes: Number(cells[i + 4].replace(/,/g, '')) });
  }
  check(lists.length === 43 && lists.reduce((s, l) => s + l.seats, 0) === 120, `k${n}: incomplete national table`);
  return { lists, registered, votesCast, valid, invalid };
}

interface Row { committee: number; code: number; nameHe: string; registered: number; votesCast: number; invalid: number; valid: number; votes: number[] }
function rows(file: string, letters: string[]): Row[] {
  const data = JSON.parse(readFileSync(file, 'utf8')) as { fields: { id: string }[]; records: Record<string, unknown>[] };
  for (const l of letters) check(data.fields.some(f => f.id === l), `${file}: missing list column ${l}`);
  return data.records.map(r => {
    const numeric = (key: string) => { const x = Number(r[key]); check(r[key] !== undefined && r[key] !== null && Number.isSafeInteger(x) && x >= 0, `${file}: invalid ${key}`); return x; };
    const sourceCode = numeric('סמל ישוב');
    // K20 polling file uses 875 for envelopes, its locality file uses 0.
    const code = r['שם ישוב'] === 'מעטפות חיצוניות' ? 9999 : sourceCode;
    return { committee: r['סמל ועדה'] === undefined ? 0 : numeric('סמל ועדה'),
      // Canonical application code for double envelopes; preserve normal locality codes.
      code: code === 0 || code === 99999 ? 9999 : code,
      nameHe: code === 0 || code === 99999 ? 'מעטפות חיצוניות' : clean(String(r['שם ישוב'])),
      registered: numeric('בזב'), votesCast: numeric('מצביעים'), invalid: numeric('פסולים'), valid: numeric('כשרים'), votes: letters.map(numeric) };
  });
}
const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
function validateRows(data: Row[], national: National, label: string) {
  for (const r of data) {
    check(sum(r.votes) === r.valid, `${label} ${r.code}: list votes differ from valid`);
    check(r.valid + r.invalid === r.votesCast, `${label} ${r.code}: valid + invalid differs from cast`);
  }
  for (const key of ['registered', 'votesCast', 'invalid', 'valid'] as const) check(sum(data.map(r => r[key])) === national[key], `${label}: ${key} differs from national total`);
  national.lists.forEach((l, i) => check(sum(data.map(r => r.votes[i])) === l.votes, `${label}: ${l.letters} differs from national result`));
}
export function geographical(n: 20 | 21, national: National) {
  const letters = national.lists.map(l => l.letters);
  const loc = rows(join(RAW, `k${n}/localities.datagov.json`), letters).sort((a, b) => a.code - b.code);
  check(new Set(loc.map(r => r.code)).size === loc.length, `k${n}: duplicate locality`);
  validateRows(loc, national, `k${n} localities`);
  const evidence = JSON.parse(readFileSync(join(RAW, `k${n}/locality-verification.json`), 'utf8')) as { localitySha256: string; ballotSha256: string; ballotRows: number };
  check(hash(JSON.stringify(loc)) === evidence.localitySha256, `k${n}: derived locality SHA-256 differs from retained reconciliation evidence`);
  const sources = JSON.parse(readFileSync(join(RAW, 'SOURCES.json'), 'utf8')) as { id: string; sha256?: string }[];
  check(evidence.ballotSha256 === sources.find(s => s.id === `k${n}-ballots-datagov`)?.sha256,
    `k${n}: retained polling evidence differs from source provenance`);
  check(Number.isSafeInteger(evidence.ballotRows) && evidence.ballotRows > 0, `k${n}: invalid retained polling row count`);
  const polling = join(ROOT, `.backup-scratch/raw/k${n}/ballots.datagov.json`);
  if (existsSync(polling)) {
    check(hash(readFileSync(polling)) === evidence.ballotSha256, `k${n}: polling source hash changed; reconciliation evidence must be reviewed`);
    const bal = rows(polling, letters);
    check(bal.length === evidence.ballotRows, `k${n}: polling row count changed`);
    validateRows(bal, national, `k${n} ballots`);
    const byCode = new Map<number, Row>();
    for (const r of bal) {
      const old = byCode.get(r.code);
      if (!old) byCode.set(r.code, { ...r, votes: [...r.votes] });
      else { old.votesCast += r.votesCast; old.invalid += r.invalid; old.valid += r.valid; r.votes.forEach((v, i) => old.votes[i] += v); }
    }
    check(byCode.size === loc.length, `k${n}: polling/locality coverage differs`);
    for (const r of loc) {
      const b = byCode.get(r.code);
      check(b && b.votesCast === r.votesCast && b.invalid === r.invalid && b.valid === r.valid && JSON.stringify(b.votes) === JSON.stringify(r.votes), `k${n}: locality ${r.code} differs from polling stations`);
    }
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
    const id = `${n}-${l.letters}`; const meta = META[id];
    const notesHe: string[] = [];
    if (n === 20 && l.letters === 'מחל') notesHe.push('ילקוט הפרסומים 7001: המועמדת נטליה ילינסון התפטרה ביום 26.2.2015. הרשימה כאן מציגה את סדר הרישום בילקוט 7000.');
    if (n === 20 && l.letters === 'יץ') notesHe.push('ילקוט הפרסומים 7001: סעיד בדראן ואבו עאבד ראאף התפטרו ביום 2.3.2015. הרשימה כאן מציגה את סדר הרישום בילקוט 7000.');
    return { id, letters: l.letters, nameHe: g.nameHe, shortHe: meta?.he ?? g.nameHe, shortEn: meta?.en ?? null,
      sponsorsHe: g.sponsorsHe, partiesHe: g.sponsorsHe.includes(';') ? null : [g.sponsorsHe], votes: l.votes,
      withdrawn: false, color: meta?.color ?? neutralColor(i), bloc: null,
      candidates: g.candidates.map(c => ({ id: `${id}#${c.rank}`, ...c })), candidatesSource: `k${n}-candidates-gazette`, candidatesSecondary: false, notesHe };
  });
  const pairs = await surplus(n);
  const agreements = pairs.map(([a, b], i) => {
    check(lists.some(l => l.letters === a) && lists.some(l => l.letters === b), `k${n}: agreement letters absent from results`);
    return { id: `${n}-agr-${i + 1}`, members: [`${n}-${a}`, `${n}-${b}`] as [string, string], sourceId: `k${n}-surplus-gazette` };
  });
  const ids = [nationalSource, `k${n}-localities-datagov`, `k${n}-ballots-datagov`, `k${n}-candidates-gazette`, `k${n}-surplus-gazette`];
  const manifest = JSON.parse(readFileSync(join(RAW, 'SOURCES.json'), 'utf8')) as { id: string; file: string; sha256?: string }[];
  const rawSha256 = Object.fromEntries(ids.map(id => {
    const src = manifest.find(s => s.id === id); check(src?.sha256, `missing source hash ${id}`);
    const path = join(RAW, src.file);
    if (existsSync(path)) check(hash(readFileSync(path)) === src.sha256, `source hash mismatch ${id}`);
    return [id, src.sha256];
  }));
  const ds: ElectionDataset = {
    schemaVersion: DATASET_SCHEMA_VERSION, id: `k${n}`, knesset: n, electionDate: date, nameHe: `הבחירות לכנסת ה-${n}`, nameEn: `Election to the ${n === 20 ? '20th' : '21st'} Knesset`,
    status: { stage: 'official-final', asOf,
      noteHe: 'תוצאות רשמיות סופיות. המועמדים לפי סדר הרישום בילקוט הפרסומים; הודעות התפטרות ידועות בהערות. לא מוצגת השתייכות לגושים.',
      noteEn: 'Official final results. Candidates follow the gazetted registration order; known resignation notices are labelled. No default blocs assigned.' },
    ruleSetId: 'il-2014-bader-ofer-3.25', totals: { registered: national.registered, votesCast: national.votesCast, invalid: national.invalid, valid: national.valid, ballotBoxes: geo.ballotRows, localities: geo.rows.filter(r => r.code !== 9999).length, envelopeVotes: geo.rows.find(r => r.code === 9999)?.votesCast },
    lists, agreements, blocs: [], officialSeats: Object.fromEntries(national.lists.map(l => [`${n}-${l.letters}`, l.seats])), officialSeatsSourceId: nationalSource,
    sourceIds: [...ids, 'law-elections'], buildInfo: { builtAt: new Date().toISOString(), rawSha256 },
  };
  const res = allocate(toEngineInput(scenarioFromDataset(ds)));
  check(res.seatsAllocated === 120 && !res.warnings.length, `k${n}: incomplete allocation or engine warning`);
  for (const l of res.lists) check(l.seats === ds.officialSeats![l.id], `k${n}: ${l.id} engine ${l.seats} differs from published ${ds.officialSeats![l.id]}`);
  const loc: LocalityDataset = { schemaVersion: DATASET_SCHEMA_VERSION, id: `k${n}`, listIds: lists.map(l => l.id), rows: geo.rows };
  return { ds, loc };
}
