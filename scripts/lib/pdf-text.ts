// Extracts text lines from a PDF, grouped by visual row (y), with items ordered right-to-left
// (Hebrew reading order). Returns one array of lines per page.
import { readFileSync } from 'node:fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

export interface PdfItem { str: string; x: number; y: number; w: number; }
export interface PdfLine { y: number; items: PdfItem[]; text: string; }

/** Joins glyph runs on one visual line; runs that touch (gap < 1.5pt) belong to the same word. */
export function joinItems(items: PdfItem[], rtl = true): string {
  let out = '';
  for (let k = 0; k < items.length; k++) {
    const cur = items[k];
    if (k > 0) {
      const prev = items[k - 1];
      const gap = rtl ? prev.x - (cur.x + cur.w) : cur.x - (prev.x + prev.w);
      if (gap >= 1.5 && !out.endsWith(' ') && !cur.str.startsWith(' ')) out += ' ';
    }
    out += cur.str;
  }
  return out.replace(/\s+/g, ' ').trim();
}

export async function pdfLines(path: string, opts: { rtl?: boolean; tolerance?: number } = {}): Promise<PdfLine[][]> {
  const rtl = opts.rtl ?? true;
  const tol = opts.tolerance ?? 2;
  const data = new Uint8Array(readFileSync(path));
  const doc = await getDocument({ data, useSystemFonts: false, isEvalSupported: false, verbosity: 0 }).promise;
  const pages: PdfLine[][] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    const items: PdfItem[] = [];
    for (const it of tc.items as any[]) {
      if (typeof it.str !== 'string' || it.str.length === 0) continue;
      items.push({ str: it.str, x: it.transform[4], y: it.transform[5], w: it.width });
    }
    items.sort((a, b) => b.y - a.y);
    const lines: PdfLine[] = [];
    for (const it of items) {
      const line = lines.find((l) => Math.abs(l.y - it.y) <= tol);
      if (line) line.items.push(it); else lines.push({ y: it.y, items: [it], text: '' });
    }
    for (const l of lines) {
      l.items.sort((a, b) => (rtl ? b.x - a.x : a.x - b.x));
      l.text = joinItems(l.items, rtl);
    }
    lines.sort((a, b) => b.y - a.y);
    pages.push(lines);
  }
  return pages;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const pages = await pdfLines(process.argv[2]);
  pages.forEach((lines, i) => { console.log(`=== page ${i + 1}`); for (const l of lines) console.log(l.text); });
}
