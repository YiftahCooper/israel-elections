// 25th Knesset (2022): CEC final national HTML, data.gov.il locality and polling tables,
// the approved-lists gazette (YP 10852) and the CEC surplus-agreement press release.
import { join } from 'node:path';
import type { Candidate, ElectionDataset } from '../../../src/data/schema.ts';
import { DATASET_SCHEMA_VERSION } from '../../../src/data/schema.ts';
import { parseK25Gazette } from '../parse-k25-gazette.ts';
import { pdfLines } from '../pdf-text.ts';
import { BLOCS } from '../list-meta.ts';
import { nationalResultsHtml } from '../build/cec-html.ts';
import { checkLocalitiesMatchPolling, checkRowsMatchNational, geographyTotals, localityDataset, readDatastoreRows } from '../build/locality.ts';
import { agreementRecords, listRecord, officialSeatsOf } from '../build/records.ts';
import { candidateId } from '../build/roster.ts';
import { RAW, verifySources } from '../build/sources.ts';
import { checker, type Check } from '../build/validate.ts';

const check: Check = checker('build-datasets');
const norm = (s: string) => s.replace(/[`׳']/g, "'").replace(/[״"]/g, '"').replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();

const SOURCE_IDS = ['k25-national-html', 'k25-localities-datagov', 'k25-ballots-datagov', 'k25-candidates-gazette', 'k25-surplus-press'];

export async function buildK25() {
  const rawSha256 = verifySources(SOURCE_IDS, check);
  const national = nationalResultsHtml('k25/nationalresults.html', 40, check, 'k25');
  const letters = national.lists.map(n => n.letters);

  const locRows = readDatastoreRows(join(RAW, 'k25/localities.datagov.json'), letters, check);
  const ballotRows = readDatastoreRows(join(RAW, 'k25/ballots.datagov.json'), letters, check);
  checkRowsMatchNational(check, 'k25 localities', locRows, national, ['registered', 'votesCast', 'invalid', 'valid']);
  checkRowsMatchNational(check, 'k25 ballots', ballotRows, national, []);
  checkLocalitiesMatchPolling(check, 'k25', locRows, ballotRows);

  const { lists: gaz, audit } = await parseK25Gazette(join(RAW, 'k25/yp10852-candidates.pdf'));
  const gazByLetters = new Map(gaz.map(g => [g.letters, g]));
  check(gaz.length === 40 && letters.every(L => gazByLetters.has(L)), `k25: gazette letters do not match national letters: ${gaz.map(g => g.letters).join(',')}`);
  const badAudit = audit.filter(a => /not contiguous|empty name/.test(a));
  check(badAudit.length === 0, `k25 gazette audit: ${badAudit.join('; ')}`);

  const lists = national.lists.map((n, i) => {
    const g = gazByLetters.get(n.letters)!;
    const id = `25-${n.letters}`;
    const letterOnly = (s: string) => norm(s).replace(/[^א-ת]/g, '');
    const a = letterOnly(g.nameHe); const b = letterOnly(n.name);
    check(a.startsWith(b.slice(0, 25)) || b.startsWith(a.slice(0, 25)), `k25 ${n.letters}: gazette name "${g.nameHe}" vs results "${n.name}"`);
    const candidates: Candidate[] = g.candidates.map(c => ({ id: candidateId(id, c.rank), rank: c.rank, nameHe: `${c.family} ${c.given}`, givenHe: c.given, familyHe: c.family }));
    return listRecord(25, i, {
      letters: n.letters, nameHe: g.nameHe, votes: n.votes, sponsorsHe: g.sponsorsHe, partiesHe: g.multipleSponsors ? null : [g.sponsorsHe],
      candidates, candidatesSource: 'k25-candidates-gazette',
    });
  });

  // agreements: CEC press release of 23.10.2022 (verified against the PDF text)
  const press = (await pdfLines(join(RAW, 'k25/cec-press-surplus-2022-10-23.pdf'))).flat().map(l => l.text).join('\n');
  const pairs: [string, string][] = [['שס', 'ג'], ['אמת', 'מרצ'], ['מחל', 'ט'], ['כן', 'פה'], ['נק', 'ף']];
  for (const [a, b] of pairs) check(new RegExp(`– ${a}\\s*\\nעם\\n[^\\n]*– ${b}`).test(press), `k25 agreement ${a}/${b} not found in press release text`);

  const { registered, votesCast, invalid, valid } = national;
  const ds: ElectionDataset = {
    schemaVersion: DATASET_SCHEMA_VERSION, id: 'k25', knesset: 25, electionDate: '2022-11-01',
    nameHe: 'הבחירות לכנסת ה-25', nameEn: 'Election to the 25th Knesset',
    status: { stage: 'official-final', asOf: '2022-11-10', noteHe: 'תוצאות סופיות רשמיות של ועדת הבחירות המרכזית.', noteEn: 'Official final results of the Central Elections Committee.' },
    ruleSetId: 'il-2014-bader-ofer-3.25',
    totals: { registered, votesCast, invalid, valid, ballotBoxes: ballotRows.length, ...geographyTotals(locRows) },
    lists, agreements: agreementRecords(25, pairs, 'k25-surplus-press'), blocs: BLOCS.k25,
    officialSeats: officialSeatsOf(25, national.lists),
    officialSeatsSourceId: 'k25-national-html',
    sourceIds: [...SOURCE_IDS, 'law-elections'],
    buildInfo: { builtAt: new Date().toISOString(), rawSha256 },
  };
  return { ds, loc: localityDataset('k25', locRows, lists) };
}
