// Parses Yalkut HaPirsumim 10852 (20.10.2022): the 25th Knesset candidate lists as approved.
//
// Layout: per list a header block ("מטעם המפלגה/המפלגות:", "אות/אותיות הרשימה:", "כינוי הרשימה:"),
// a column-header row, then a table of three column groups [rank | given name | family name] read
// right-to-left. Lists continue across pages, and column positions differ between tables, so the
// geometry of every table segment is derived from its own content:
//   * rank numbers are the integer runs; their right edges form one cluster per group;
//   * within a group, given and family names are right-aligned, so their right edges form the two
//     most frequent clusters; text right of the midpoint is the given name, left is the family name;
//   * multi-line cells are vertically centred on their row, so fragments join the nearest rank row.
import { joinItems, pdfLines, type PdfItem, type PdfLine } from './pdf-text.ts';

export interface GazetteCandidate { rank: number; given: string; family: string }
export interface GazetteList { letters: string; nameHe: string; sponsorsHe: string; multipleSponsors: boolean; candidates: GazetteCandidate[]; pages: number[] }

const clean = (s: string) => s.replace(/\s+/g, ' ').replace(/\s+([,.:])/g, '$1').trim();
const FIELD: [RegExp, 'parties' | 'letters' | 'name'][] = [
  [/^מטעם\s*המפלג(ה|ות)\s*:\s*(.*)$/, 'parties'],
  [/^(?:אות|אותיות)\s*הרשימה\s*:\s*(.*)$/, 'letters'],
  [/^כינוי\s*הרשימה\s*:\s*(.*)$/, 'name'],
];
const FOOTER_Y = 90; // footnotes ("ס"ח התשכ"ט ...") and the page footer sit below this
const isHeaderLine = (l: PdfLine) => (l.text.match(/משפחה/g) ?? []).length >= 2 || /^(?:\s*(?:שם|פרטי|משפחה)\s*)+$/.test(l.text);
const isInt = (s: string) => /^\d{1,3}$/.test(s.trim());

export function splitParties(s: string): string[] {
  return clean(s).split(/\s*,\s*/).map((p) => p.trim()).filter(Boolean);
}

function clusters(values: number[], tol = 3): { center: number; count: number }[] {
  const sorted = [...values].sort((a, b) => b - a);
  const out: { center: number; count: number; sum: number }[] = [];
  for (const v of sorted) {
    const c = out.find((k) => Math.abs(k.center - v) <= tol);
    if (c) { c.count++; c.sum += v; c.center = c.sum / c.count; } else out.push({ center: v, count: 1, sum: v });
  }
  return out;
}

interface Seg { list: GazetteList; page: number; items: PdfItem[] }

function resolveSegment(seg: Seg, audit: string[]) {
  const ints = seg.items.filter((i) => isInt(i.str));
  if (ints.length === 0) return;
  // Rank numbers come in rows of consecutive values (r, r+1, r+2 from right to left); dates,
  // footnote markers and signature blocks do not. Seed the rank columns from paired integers only.
  const paired = ints.filter((a) => ints.some((b) => b !== a && Math.abs(b.y - a.y) < 2.5 && Math.abs(Number(b.str) - Number(a.str)) === 1));
  const rankCl = clusters((paired.length ? paired : ints).map((i) => i.x + i.w), 4).sort((a, b) => b.count - a.count).slice(0, 3).sort((a, b) => b.center - a.center);
  const R = rankCl.map((c) => c.center);

  const groupOf = (right: number) => R.findIndex((r, g) => right <= r + 3 && right > (R[g + 1] ?? -Infinity) + 3);
  type Row = { rank: number; y: number; given: PdfItem[]; family: PdfItem[] };
  // an unpaired integer is a rank only on the final row of the table (a 1-candidate last row)
  const lowestPairedY = paired.length ? Math.min(...paired.map((p) => p.y)) : Infinity;
  const rowsAccept = (it: PdfItem) => paired.length === 0 || (it.y < lowestPairedY + 1 && it.y > lowestPairedY - 30);
  const rows: Row[][] = R.map(() => []);
  const byGroup: PdfItem[][] = R.map(() => []);
  for (const it of seg.items) {
    const right = it.x + it.w; const g = groupOf(right);
    if (g < 0) { audit.push(`p${seg.page} ${seg.list.letters}: item outside columns "${it.str}"`); continue; }
    if (isInt(it.str) && Math.abs(right - R[g]) <= 4 && (paired.includes(it) || rowsAccept(it))) rows[g].push({ rank: Number(it.str.trim()), y: it.y, given: [], family: [] });
    else byGroup[g].push(it);
  }
  byGroup.forEach((items, g) => {
    const cl = clusters(items.map((i) => i.x + i.w), 2).sort((a, b) => b.count - a.count);
    const top = cl[0]; const second = cl.find((c) => Math.abs(c.center - top.center) > 10);
    let givenRight: number; let familyRight: number;
    if (second) { givenRight = Math.max(top.center, second.center); familyRight = Math.min(top.center, second.center); }
    else { givenRight = top.center; familyRight = top.center - 45; audit.push(`p${seg.page} ${seg.list.letters}: group ${g + 1} has one alignment cluster`); }
    const mid = (givenRight + familyRight) / 2;
    for (const it of items) {
      let best: Row | null = null; let bd = Infinity;
      for (const r of rows[g]) { const d = Math.abs(r.y - it.y); if (d < bd) { bd = d; best = r; } }
      if (!best || bd > 10) { audit.push(`p${seg.page} ${seg.list.letters}: unattached "${it.str}"`); continue; }
      (it.x + it.w > mid ? best.given : best.family).push(it);
    }
  });
  const text = (items: PdfItem[]) => {
    const lines: { y: number; its: PdfItem[] }[] = [];
    for (const it of items) { const l = lines.find((k) => Math.abs(k.y - it.y) < 1); if (l) l.its.push(it); else lines.push({ y: it.y, its: [it] }); }
    return clean(lines.sort((a, b) => b.y - a.y).map((l) => joinItems(l.its.sort((a, b) => b.x - a.x))).reduce((acc, t) => (acc === '' ? t : /[-–]$/.test(acc) ? acc + t : acc + ' ' + t), ''));
  };
  for (const r of rows.flat().sort((a, b) => a.rank - b.rank)) {
    seg.list.candidates.push({ rank: r.rank, given: text(r.given), family: text(r.family) });
  }
  if (!seg.list.pages.includes(seg.page)) seg.list.pages.push(seg.page);
}

export async function parseK25Gazette(path: string): Promise<{ lists: GazetteList[]; audit: string[] }> {
  const pages = await pdfLines(path);
  const lists: GazetteList[] = [];
  const audit: string[] = [];
  let cur: GazetteList | null = null;
  let draft: { parties?: string; letters?: string; name?: string; multi?: boolean } | null = null;
  let lastField: 'parties' | 'letters' | 'name' | null = null;
  let seg: Seg | null = null;
  const flush = () => { if (seg) resolveSegment(seg, audit); seg = null; };

  pages.forEach((lines, pi) => {
    const page = pi + 1;
    flush();
    let inTable = cur !== null && draft === null;
    for (const l of lines) {
      if (l.y < FOOTER_Y) continue;
      const field = FIELD.find(([re]) => re.test(l.text));
      if (field) {
        const [re, kind] = field;
        if (kind === 'parties') { flush(); draft = {}; inTable = false; }
        draft ??= {};
        const mm = l.text.match(re)!; draft[kind] = kind === 'parties' ? mm[2] : mm[1]; if (kind === 'parties') draft.multi = mm[1] === 'ות';
        lastField = kind;
        continue;
      }
      if (isHeaderLine(l)) {
        if (draft) {
          cur = { letters: clean(draft.letters ?? '?'), nameHe: clean(draft.name ?? ''), sponsorsHe: clean(draft.parties ?? ''), multipleSponsors: Boolean(draft.multi), candidates: [], pages: [] };
          lists.push(cur);
          draft = null; lastField = null;
        }
        inTable = true;
        continue;
      }
      if (!inTable) {
        if (draft && lastField) draft[lastField] = (draft[lastField] ?? '') + ' ' + l.text; // wrapped header field
        continue;
      }
      if (!cur) continue;
      seg ??= { list: cur, page, items: [] };
      seg.items.push(...l.items.filter((i) => i.str.trim()));
    }
    flush();
  });

  for (const l of lists) {
    const ranks = l.candidates.map((c) => c.rank);
    if (ranks.some((r, i) => r !== i + 1)) audit.push(`${l.letters}: ranks not contiguous: ${ranks.join(',')}`);
    for (const c of l.candidates) if (!c.given || !c.family) audit.push(`${l.letters} #${c.rank}: empty name part ("${c.given}" / "${c.family}")`);
  }
  return { lists, audit };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { lists, audit } = await parseK25Gazette(process.argv[2]);
  for (const l of lists) console.log(l.letters.padEnd(5), String(l.candidates.length).padStart(4), 'pp', l.pages.join(','), '|', l.nameHe, '|', l.multipleSponsors ? 'MULTI' : 'one', l.sponsorsHe);
  console.log('lists', lists.length, 'candidates', lists.reduce((s, l) => s + l.candidates.length, 0));
  console.log(audit.slice(0, 60).join('\n'));
}
