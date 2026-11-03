// The CEC final national results page (votes.cec.gov.il "nationalresults"), retained as HTML for
// k21–k25, and HTML-to-text tokenising shared with the k26 secondary roster pages.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RAW } from './sources.ts';
import { checkNationalTable, type Check } from './validate.ts';

const clean = (s: string) => s.replace(/\s+/g, ' ').trim();

/** Visible text cells of an HTML page, one per tag boundary, empties dropped. Whitespace inside a
 *  cell is collapsed unless `collapse: false` (k26 roster names are published trimmed only). */
export function htmlCells(html: string, { dropStyles = false, collapse = true } = {}): string[] {
  return html.replace(dropStyles ? /<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g : /<script[\s\S]*?<\/script>/g, '')
    .replace(/<[^>]+>/g, '\n').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
    .split('\n').map(collapse ? clean : (s: string) => s.trim()).filter(Boolean);
}

export interface HtmlNationalList { name: string; letters: string; seats: number; votes: number }
export interface HtmlNational { lists: HtmlNationalList[]; registered: number; votesCast: number; valid: number; invalid: number }

/** Parses `data/raw/<file>`: the totals block (registered, cast, turnout, valid, invalid) and the
 *  table of (name, letters, seats, percentage, votes) rows. The table must be complete and consistent. */
export function nationalResultsHtml(file: string, expectedLists: number, check: Check, id: string): HtmlNational {
  const cells = htmlCells(readFileSync(join(RAW, file), 'utf8'));
  const iTot = cells.findIndex(c => c.startsWith('סה"כ הקולות הפסולים'));
  check(iTot >= 0, `${id}: missing national totals`);
  const [registered, votesCast, , valid, invalid] = cells.slice(iTot + 1, iTot + 6).map(c => Number(c.replace(/[,%]/g, '')));
  const iTab = cells.findIndex(c => c.startsWith('מספר הקולות הכשרים לרשימה'));
  check(iTab >= 0, `${id}: missing national table`);
  const lists: HtmlNationalList[] = [];
  for (let i = iTab + 1; i + 4 < cells.length; i += 5) {
    if (!/^\d+$/.test(cells[i + 2]) || !/%$/.test(cells[i + 3])) break;
    lists.push({ name: cells[i], letters: cells[i + 1], seats: Number(cells[i + 2]), votes: Number(cells[i + 4].replace(/,/g, '')) });
  }
  check(lists.length === expectedLists, `${id}: expected ${expectedLists} lists on the national page, got ${lists.length}`);
  checkNationalTable(check, id, lists, { valid, invalid, votesCast, registered });
  return { lists, registered, votesCast, valid, invalid };
}
