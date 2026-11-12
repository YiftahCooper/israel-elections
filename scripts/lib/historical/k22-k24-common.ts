// K22–K24 have top-aligned, two-group candidate tables. This parser deliberately does
// not change the unfinished generic historical prototype or the K25 geometry parser.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pdfLines, joinItems, type PdfItem, type PdfLine } from '../pdf-text.ts';
import type { ElectionDataset, ListRecord } from '../../../src/data/schema.ts';
import { nationalResultsHtml } from '../build/cec-html.ts';
import { aggregateByCode, checkRowsMatchNational, geographyTotals, localityDataset, readDatastoreRows, type VoteRow } from '../build/locality.ts';
import { agreementRecords, listRecord, officialSeatsOf } from '../build/records.ts';
import { candidateId, checkContiguousRanks } from '../build/roster.ts';
import { manifest, RAW, sha256 as digest, sourceRecord, verifySources } from '../build/sources.ts';
import { checkAgreementPairs, checker, checkReproducesOfficialSeats, type Check } from '../build/validate.ts';

const check: Check = checker('k22–k24');
const read = (file: string) => readFileSync(join(RAW, file), 'utf8');
export function nationalResults(n: number) {
  const { lists, registered, votesCast, valid, invalid } = nationalResultsHtml(`k${n}/nationalresults.html`, ({22:32,23:30,24:39} as Record<number,number>)[n], check, `k${n}`);
  return { lists, totals: { registered, votesCast, valid, invalid } };
}

interface Roster { letters: string; nameHe: string; sponsorsHe: string; candidates: { rank: number; givenHe: string; familyHe: string; partyHe?: string }[] }
export async function candidateRosters(n: number, pages?: PdfLine[][]): Promise<Roster[]> {
  pages ??= await pdfLines(join(RAW, `k${n}/candidates.pdf`));
  const lists: Roster[] = [];
  let current: Roster | undefined;
  let draft = { sponsorsHe: '', letters: '', nameHe: '' };
  let field: 'sponsorsHe' | 'letters' | 'nameHe' | undefined;
  let columns: { right: number; kind: 'givenHe' | 'familyHe' | 'partyHe' }[] = [];
  let items: PdfItem[] = [];
  const flush = () => {
    if (!current || !columns.length || !items.length) { items = []; return; }
    const consumed = new Map<PdfItem,number>();
    const allRanks = items.filter(i=>/^\d{1,3}$/.test(i.str.trim()));
    const parsedRanks = new Set<PdfItem>();
    const groups = columns.filter(c=>c.kind === 'givenHe');
    for (let g = 0; g < groups.length; g++) {
      const given = groups[g];
      const left = groups[g+1] ? groups[g+1].right + 15 : 0;
      const right = given.right + 100;
      const cols = columns.filter(c=>c.right <= given.right + 3 && c.right > left);
      const ranks = items.filter(i=>/^\d{1,3}$/.test(i.str.trim()) && +i.str >= 1 && +i.str <= 120 && i.x+i.w > given.right + 5 && i.x+i.w < right).sort((a,b)=>b.y-a.y);
      for (let r = 0; r < ranks.length; r++) {
        const rank = ranks[r];
        check(!parsedRanks.has(rank), `k${n}: rank assigned to two columns`);
        parsedRanks.add(rank);
        const buckets: Record<string, PdfItem[]> = { givenHe: [], familyHe: [], partyHe: [] };
        for (const item of items) {
          if (/^\d+$/.test(item.str.trim()) || item.x+item.w > given.right + 16 || item.x+item.w <= left || item.y > rank.y + 6 || item.y <= (ranks[r+1]?.y ?? rank.y - 55) + 6) continue;
          const col = [...cols].sort((a,b)=>Math.abs(a.right-item.x-item.w)-Math.abs(b.right-item.x-item.w))[0];
          check(col, `k${n} ${current.letters}: unassigned name fragment ${item.str} right=${item.x+item.w}, columns=${JSON.stringify(cols)}`);
          buckets[col.kind].push(item);
          consumed.set(item,(consumed.get(item)??0)+1);
        }
        const text = (kind: string) => {
          const lines: {y:number;items:PdfItem[]}[]=[];
          for (const it of buckets[kind]) {let line=lines.find(l=>Math.abs(l.y-it.y)<2);if(!line){line={y:it.y,items:[]};lines.push(line);}line.items.push(it);}
          return lines.sort((a,b)=>b.y-a.y).map(l=>joinItems(l.items.sort((a,b)=>b.x-a.x))).join(' ').replace(/- /g,'-').trim();
        };
        const givenHe=text('givenHe'), familyHe=text('familyHe'), partyHe=text('partyHe');
        check(givenHe && familyHe, `k${n} ${current.letters} #${rank.str}: empty name (${givenHe}/${familyHe})`);
        current.candidates.push({ rank: +rank.str, givenHe, familyHe, ...(partyHe?{partyHe}:{}) });
      }
    }
    check(allRanks.every(r=>parsedRanks.has(r)), `k${n} ${current.letters}: unparsed candidate rank`);
    for (const item of items.filter(i=>/[א-ת]/.test(i.str))) check(consumed.get(item)===1, `k${n} ${current.letters}: lost or duplicate table fragment ${item.str} at ${item.x}/${item.y}`);
    items=[];
  };
  let ended=false;
  for (const lines of pages) {
    flush();
    for (const line of lines) {
      const t=line.text;
      if (line.y < 45 || /ילקוט הפרסומים|DoCenter|מחלקת רשומות|^\d\d\/\d\d\/\d\d|^המחיר /.test(t)) continue;
      if (/^הודעה בדבר|^הודעות לפי|^הודעות בדבר|^הודעה על/.test(t) && current) {flush();ended=true;break;}
      if (/^(?:שם|השתייכות)(?:\s+(?:שם|השתייכות))*$/.test(t)) continue;
      if (/^_{3,}|^ס["״]ח |^\(חמ |^כ["״].*התש/.test(t)) {flush();columns=[];continue;}
      let m=t.match(/^מטעם המפלג(?:ה|ות)\s*:\s*(.*)/);
      if(m){flush();columns=[];draft={sponsorsHe:m[1],letters:'',nameHe:''};field='sponsorsHe';continue;}
      m=t.match(/^(?:אות|אותיות) הרשימה\s*:\s*(.*)/);
      if(m){draft.letters=m[1].replace(/\s/g,'');field='letters';continue;}
      m=t.match(/^כינוי הרשימה\s*:\s*(.*)/);
      if(m){draft.nameHe=m[1];field='nameHe';continue;}
      if((t.match(/פרטי/g)??[]).length>=2 && (t.match(/משפחה/g)??[]).length>=2) {
        flush();
        if(draft.letters) {current={...draft,candidates:[]};lists.push(current);draft={sponsorsHe:'',letters:'',nameHe:''};}
        field=undefined;
        // Join split header glyphs before identifying the party column.
        const header: PdfItem[]=[];
        for(const it of line.items){const prev=header.at(-1);if(prev && (Math.abs(prev.x-(it.x+it.w))<4 || /^(שם|ש|מ)$/.test(prev.str))){prev.str+=it.str;prev.w=prev.x+prev.w-it.x;prev.x=it.x;}else header.push({...it});}
        columns=header.flatMap(it=>{const kind=it.str.includes('פרטי')?'givenHe':it.str.includes('משפחה')?'familyHe':it.str.includes('מפלגתית')?'partyHe':null;return kind?[{right:it.x+it.w,kind:kind as 'givenHe'|'familyHe'|'partyHe'}]:[];});
        // YP 9476 pp. 4266–4267 prints an extra heading over the rank column and
        // shifts the remaining headings one cell. The body retains the preceding
        // page's four name alignments; use those observed positions.
        if (n === 24 && columns.filter(c=>c.kind==='givenHe').length === 3) columns = [
          {right:365.23,kind:'givenHe'},{right:298,kind:'familyHe'},
          {right:163.78,kind:'givenHe'},{right:97.64,kind:'familyHe'},
        ];
        check(columns.filter(c=>c.kind==='givenHe').length===2 && columns.filter(c=>c.kind==='familyHe').length===2, `k${n}: unexpected table header ${t}`);
        continue;
      }
      if(field && !columns.length && !/^השתייכות|^שם השתייכות/.test(t)) draft[field]+=' '+t;
      else if(current && columns.length) items.push(...line.items.filter(i=>i.str.trim()));
    }
    if(ended)break;
  }
  flush();
  for (const list of lists) {
    list.candidates.sort((a,b)=>a.rank-b.rank);
    checkContiguousRanks(check, `k${n} ${list.letters}`, list.candidates);
  }
  check(new Set(lists.map(l=>l.letters)).size===lists.length,`k${n}: duplicate rosters`);
  return lists;
}

async function surplusLines(n: number): Promise<string[]> {
  // Gazette notices use two independent text columns, not visual full-page rows.
  const lines: string[]=[];
  for(const page of await pdfLines(join(RAW,`k${n}/surplus.pdf`))) for(const right of [true,false]) for(const line of page) {
    if(line.y<45)continue;
    const items=line.items.filter(i=>right?i.x>240:i.x<=240);
    if(items.length)lines.push(joinItems(items));
  }
  return lines;
}

export async function agreementPairs(n: number, lines?: string[]): Promise<[string,string][]> {
  lines ??= await surplusLines(n);
  const title=lines.findIndex(l=>/^הודעה בדבר התקשרו(?:ת|יות) בין רשימות מועמדים$/.test(l));
  check(title>=0,`k${n}: agreement notice missing`);
  const start=lines.findIndex((l,i)=>i>title && l.startsWith('שלהלן התקשרו'));
  const end=lines.findIndex((l,i)=>i>start && /^\(חמ /.test(l));
  check(start>=0 && end>start,`k${n}: agreement notice not bounded by its signature`);
  const notice=lines.slice(start+1,end).join('\n');
  const blocks=[...notice.matchAll(/\((\d+)\)\s*([\s\S]*?)(?=\(\d+\)|$)/g)];
  const pairs: [string,string][]=[];
  for(const [i,m] of blocks.entries()) {
    check(+m[1]===i+1,`k${n}: missing agreement paragraph`);
    const letters=[...m[2].matchAll(/[-–]\s*([א-ת]{1,4})[;.]?\s*$/gm)].map(m=>m[1]);
    check(letters.length===2,`k${n}: agreement paragraph ${i+1} has ${letters.length} ballot letters: ${m[2]}`);
    pairs.push([letters[0],letters[1]]);
  }
  check(pairs.length===({22:5,23:3,24:6} as Record<number,number>)[n],`k${n}: agreement count changed`);
  return pairs;
}

function projection(rows:VoteRow[]) {return [...rows].sort((a,b)=>a.code-b.code).map(r=>({code:r.code,votesCast:r.votesCast,invalid:r.invalid,valid:r.valid,votes:r.votes}));}
function nationalCheck(n:number,rows:VoteRow[],national:ReturnType<typeof nationalResults>) {
  const total=checkRowsMatchNational(check,`k${n}`,rows,{...national.totals,lists:national.lists},['votesCast','valid','invalid']);
  // ADR 0020: the K22 datastore electorate is 2,812 lower than the national final page.
  const expectedRegistered=n===22?6_391_218:national.totals.registered;
  check(total.registered===expectedRegistered,`k${n}: unexpected registered-voter discrepancy`);
  if(n===22)check(national.totals.registered===6_394_030, 'k22: national electorate changed; review ADR 0020');
}
/** The retained reconciliation evidence derived from the locality and polling-station tables. */
function deriveRecord(n:number,national:ReturnType<typeof nationalResults>,rows:VoteRow[],ballots:VoteRow[],localitySourceSha256:string,pollingSourceSha256:string){
  nationalCheck(n,rows,national);nationalCheck(n,ballots,national);
  const localityProjection=JSON.stringify(projection(rows)),ballotProjection=JSON.stringify(projection(aggregateByCode(ballots)));
  check(localityProjection===ballotProjection,`k${n}: localities do not reconcile exactly with polling stations`);
  check(new Set(rows.map(r=>r.code)).size===rows.length,`k${n}: duplicate locality code`);
  const loc=localityDataset(`k${n}` as ElectionDataset['id'],rows,national.lists.map(l=>({id:`${n}-${l.letters}`})));
  return {version:1,election:`k${n}`,localitySourceSha256,pollingSourceSha256,pollingStations:ballots.length,derivedLocalityVotesSha256:digest(ballotProjection),localityDatasetSha256:digest(JSON.stringify(loc))};
}
const sourceFile=(id:string)=>join(RAW,sourceRecord(id)!.file);
/** Regenerate only with real polling input present. The normal builder never rewrites this record. */
export function reconciliationRecord(n:number){
  const national=nationalResults(n),letters=national.lists.map(l=>l.letters);
  const sha=verifySources([`k${n}-localities-datagov`,`k${n}-ballots-datagov`],check);
  const rows=readDatastoreRows(sourceFile(`k${n}-localities-datagov`),letters,check),ballots=readDatastoreRows(sourceFile(`k${n}-ballots-datagov`),letters,check);
  return deriveRecord(n,national,rows,ballots,sha[`k${n}-localities-datagov`],sha[`k${n}-ballots-datagov`]);
}
export interface BuildConfig {
  n:22|23|24;date:string;counts:Record<string,number>;leaders:Record<string,string>;
  noteEn?:string;noteHe?:string;notes?:Record<string,string[]>;
  textReplacements?:Record<string,string>;withdrawn?:string[];
}
export async function buildHistorical(config:BuildConfig){
  const {n}=config;
  const normalize = (s:string) => Object.entries(config.textReplacements ?? {}).reduce((s,[from,to])=>s.replaceAll(from,to),s);
  const ids=[`k${n}-national-html`,`k${n}-localities-datagov`,`k${n}-ballots-datagov`,`k${n}-candidates-gazette`,`k${n}-surplus-gazette`];
  if(n===24) ids.push('k24-results-gazette','k24-cec-protocol','k24-cec-station-breakdown');
  const rawSha256=verifySources(ids.filter(id=>!id.includes('-ballots-')),check);
  const national=nationalResults(n),letters=national.lists.map(l=>l.letters);
  const rows=readDatastoreRows(join(RAW,`k${n}/localities.datagov.json`),letters,check);nationalCheck(n,rows,national);
  check(new Set(rows.map(r=>r.code)).size===rows.length,`k${n}: duplicate locality codes`);
  const loc=localityDataset(`k${n}`,rows,letters.map(L=>({id:`${n}-${L}`})));
  const record=JSON.parse(read(`k${n}/reconciliation.json`)) as ReturnType<typeof reconciliationRecord>;
  const ballotSource=sourceRecord(`k${n}-ballots-datagov`);
  check(record.version===1 && record.election===`k${n}` && record.localitySourceSha256===rawSha256[`k${n}-localities-datagov`] && record.pollingSourceSha256===ballotSource?.sha256,`k${n}: reconciliation source hashes changed`);
  check(record.derivedLocalityVotesSha256===digest(JSON.stringify(projection(rows))) && record.localityDatasetSha256===digest(JSON.stringify(loc)),`k${n}: committed reconciliation digest does not match derived localities`);
  check(Number.isSafeInteger(record.pollingStations)&&record.pollingStations>0,`k${n}: invalid polling-station count`);
  rawSha256[`k${n}-ballots-datagov`]=record.pollingSourceSha256!;
  rawSha256[`k${n}-reconciliation`]=digest(read(`k${n}/reconciliation.json`));
  const ballotPath=join(RAW,ballotSource!.file);
  if(existsSync(ballotPath)){
    const ballotSha=verifySources([`k${n}-ballots-datagov`],check)[`k${n}-ballots-datagov`];
    const full=deriveRecord(n,national,rows,readDatastoreRows(ballotPath,letters,check),rawSha256[`k${n}-localities-datagov`],ballotSha);
    check(JSON.stringify(full)===JSON.stringify(record),`k${n}: full polling reconciliation differs from retained evidence`);
    console.log(`k${n}: fully reconciled ${record.pollingStations} polling stations with ${rows.length} locality rows`);
  }else console.log(`k${n}: polling-station scratch file absent; skipping full polling reconciliation; retained source hashes and derived locality SHA-256 verified`);
  // Each PDF is parsed once: k22's resignation notes are printed in the candidate gazette, k23/k24's in the surplus gazette.
  const candidatePages=await pdfLines(join(RAW,`k${n}/candidates.pdf`));
  const surplus=await surplusLines(n);
  const noteText = n === 22 ? candidatePages.flat().map(l=>l.text).join(' ') : surplus.join(' ');
  const withoutSpaces = (s:string) => s.replace(/\s+/g,'');
  for(const [letters,notes] of Object.entries(config.notes??{})) for(const note of notes)
    check(withoutSpaces(normalize(noteText)).includes(withoutSpaces(note)),`k${n} ${letters}: note not found verbatim in official notice`);
  const rosters=await candidateRosters(n,candidatePages);
  check(rosters.length===letters.length && letters.every(L=>rosters.some(r=>r.letters===L)),`k${n}: gazette and national lists differ`);
  const lists:ListRecord[]=national.lists.map((list,i)=>{
    const r=rosters.find(r=>r.letters===list.letters)!;const id=`${n}-${list.letters}`;
    check(r.candidates.length===config.counts[list.letters],`k${n} ${list.letters}: candidate count ${r.candidates.length} differs from reviewed last rank ${config.counts[list.letters]}`);
    const candidates=r.candidates.map(c=>{
      const givenHe=normalize(c.givenHe),familyHe=normalize(c.familyHe);
      return {...c,givenHe,familyHe,id:candidateId(id,c.rank),nameHe:`${familyHe} ${givenHe}`};
    });
    if(config.leaders[list.letters])check(candidates[0].nameHe===config.leaders[list.letters],`k${n} ${list.letters}: unexpected party leader ${candidates[0].nameHe}`);
    return listRecord(n,i,{letters:list.letters,nameHe:normalize(r.nameHe),votes:list.votes,sponsorsHe:normalize(r.sponsorsHe),withdrawn:config.withdrawn?.includes(list.letters) ?? ((n===23&&list.letters==='זץ')||(n===24&&list.letters==='רק')),
      candidates,candidatesSource:`k${n}-candidates-gazette`,notesHe:config.notes?.[list.letters]??[]});
  });
  const pairs=await agreementPairs(n,surplus);
  checkAgreementPairs(check,`k${n}`,pairs,letters);
  const ds:ElectionDataset={schemaVersion:1,id:`k${n}`,knesset:n,electionDate:config.date,
    nameHe:`הבחירות לכנסת ה-${n}`,nameEn:`Election to the ${n}${n===22?'nd':n===23?'rd':'th'} Knesset`,
    status:{stage:'official-final',asOf:'2026-11-03',
      noteEn:`Official final CEC votes and seats; candidate rosters as printed in the approved-list gazette, before subsequent resignations. ${config.noteEn??''}`.trim(),
      noteHe:`תוצאות סופיות רשמיות. המועמדים לפי רשימות המועמדים המאושרות בילקוט הפרסומים, לפני התפטרויות מאוחרות. ${config.noteHe??''}`.trim()},
    ruleSetId:'il-2014-bader-ofer-3.25',totals:{...national.totals,ballotBoxes:record.pollingStations,...geographyTotals(rows)},
    lists,agreements:agreementRecords(n,pairs,`k${n}-surplus-gazette`),blocs:[],
    officialSeats:officialSeatsOf(n,national.lists),officialSeatsSourceId:`k${n}-national-html`,sourceIds:[...ids,'law-elections'],
    // A stable capture timestamp makes clean-checkout rebuilds byte-for-byte comparable.
    buildInfo:{builtAt: ids.map(id=>manifest().find(s=>s.id===id)?.retrievedAt??'2026-11-03').sort().at(-1)!,rawSha256}};
  checkReproducesOfficialSeats(check,ds);
  return {ds,loc};
}
