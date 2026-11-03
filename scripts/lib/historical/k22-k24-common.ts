// K22–K24 have top-aligned, two-group candidate tables. This parser deliberately does
// not change the unfinished generic historical prototype or the K25 geometry parser.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pdfLines, joinItems, type PdfItem } from '../pdf-text.ts';
import { META, neutralColor } from '../list-meta.ts';
import type { ElectionDataset, ListRecord, LocalityDataset } from '../../../src/data/schema.ts';
import { allocate } from '../../../src/engine/allocate.ts';
import { scenarioFromDataset, toEngineInput } from '../../../src/model/scenario.ts';

const ROOT = join(import.meta.dirname, '../../..');
const RAW = join(ROOT, 'data/raw');
function check(ok: unknown, message: string): asserts ok { if (!ok) throw new Error(`k22–k24: ${message}`); }
const clean = (s: string) => s.replace(/\s+/g, ' ').trim();
const digest = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
const read = (file: string) => readFileSync(join(RAW, file), 'utf8');
export function nationalResults(n: number) {
  const cells = read(`k${n}/nationalresults.html`).replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, '\n').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').split('\n').map(clean).filter(Boolean);
  const it = cells.findIndex(c => c.startsWith('סה"כ הקולות הפסולים'));
  check(it >= 0, `k${n}: missing national totals`);
  const [registered, votesCast, , valid, invalid] = cells.slice(it + 1, it + 6).map(c => Number(c.replace(/[,%]/g, '')));
  const tab = cells.findIndex(c => c.startsWith('מספר הקולות הכשרים לרשימה'));
  check(tab >= 0, `k${n}: missing national table`);
  const lists: { name: string; letters: string; seats: number; votes: number }[] = [];
  for (let i = tab + 1; i + 4 < cells.length; i += 5) {
    if (!/^\d+$/.test(cells[i + 2]) || !/%$/.test(cells[i + 3])) break;
    lists.push({ name: cells[i], letters: cells[i + 1], seats: Number(cells[i + 2]), votes: Number(cells[i + 4].replace(/,/g, '')) });
  }
  check(lists.length === ({22:32,23:30,24:39} as Record<number,number>)[n], `k${n}: unexpected national list count ${lists.length}`);
  check(lists.reduce((s,l)=>s+l.votes,0) === valid && valid + invalid === votesCast && lists.reduce((s,l)=>s+l.seats,0) === 120, `k${n}: national totals inconsistent`);
  return { lists, totals: { registered, votesCast, valid, invalid } };
}

interface Roster { letters: string; nameHe: string; sponsorsHe: string; candidates: { rank: number; givenHe: string; familyHe: string; partyHe?: string }[] }
export async function candidateRosters(n: number): Promise<Roster[]> {
  const pages = await pdfLines(join(RAW, `k${n}/candidates.pdf`));
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
    check(list.candidates.length>0 && list.candidates.every((c,i)=>c.rank===i+1), `k${n} ${list.letters}: ranks not contiguous: ${list.candidates.map(c=>c.rank)}`);
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

export async function agreementPairs(n: number): Promise<[string,string][]> {
  const lines = await surplusLines(n);
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
  check(new Set(pairs.flat()).size===pairs.length*2,`k${n}: duplicate agreement member`);
  return pairs;
}

interface VoteRow { code:number; nameHe:string; committee:number; registered:number; votesCast:number; invalid:number; valid:number; votes:number[] }
function voteRows(file: string, letters: string[]): VoteRow[] {
  const raw=JSON.parse(readFileSync(file,'utf8')) as {records:Record<string,unknown>[]};
  check(raw.records.length>0,`${file}: no rows`);
  return raw.records.map(r=>{
    const num=(key:string)=>{const value=Number(r[key]);check(r[key]!==null && r[key]!==undefined && Number.isSafeInteger(value)&&value>=0,`${file}: invalid ${key}`);return value;};
    const row={code:num('סמל ישוב'),nameHe:clean(String(r['שם ישוב'])),committee:num('סמל ועדה'),registered:num('בזב'),votesCast:num('מצביעים'),invalid:num('פסולים'),valid:num('כשרים'),votes:letters.map(num)};
    check(row.votes.reduce((s,v)=>s+v,0)===row.valid && row.valid+row.invalid===row.votesCast,`${file}: row ${row.code} totals do not reconcile`);
    return row;
  });
}
function sum(rows:VoteRow[],letters:string[]) {
  const totals={registered:0,votesCast:0,invalid:0,valid:0,votes:letters.map(()=>0)};
  for(const row of rows){for(const key of ['registered','votesCast','invalid','valid'] as const)totals[key]+=row[key];row.votes.forEach((v,i)=>totals.votes[i]+=v);}
  return totals;
}
function projection(rows:VoteRow[]) {return [...rows].sort((a,b)=>a.code-b.code).map(r=>({code:r.code,votesCast:r.votesCast,invalid:r.invalid,valid:r.valid,votes:r.votes}));}
function aggregate(rows:VoteRow[]):VoteRow[]{
  const byCode=new Map<number,VoteRow>();
  for(const row of rows){let total=byCode.get(row.code);if(!total){total={...row,votes:[...row.votes]};byCode.set(row.code,total);}else{total.registered+=row.registered;total.votesCast+=row.votesCast;total.invalid+=row.invalid;total.valid+=row.valid;row.votes.forEach((v,i)=>total!.votes[i]+=v);}}
  return [...byCode.values()];
}
function nationalCheck(n:number,rows:VoteRow[],national:ReturnType<typeof nationalResults>) {
  const total=sum(rows,national.lists.map(l=>l.letters));
  for(const key of ['votesCast','valid','invalid'] as const)check(total[key]===national.totals[key],`k${n}: ${key} differs from national HTML`);
  // ADR 0020: the K22 datastore electorate is 2,812 lower than the national final page.
  const expectedRegistered=n===22?6_391_218:national.totals.registered;
  check(total.registered===expectedRegistered,`k${n}: unexpected registered-voter discrepancy`);
  if(n===22)check(national.totals.registered===6_394_030, 'k22: national electorate changed; review ADR 0020');
  national.lists.forEach((l,i)=>check(l.votes===total.votes[i],`k${n} ${l.letters}: votes differ from national HTML`));
}
interface Source {id:string;file:string;sha256?:string;retrievedAt?:string}
function sources():Source[]{return JSON.parse(read('SOURCES.json'));}
function verifySource(id:string):Source{
  const s=sources().find(s=>s.id===id);check(s?.sha256,`${id}: missing source hash`);
  check(digest(readFileSync(join(RAW,s.file)))===s.sha256,`${id}: raw file SHA-256 differs from manifest`);return s;
}
/** Regenerate only with real polling input present. The normal builder never rewrites this record. */
export function reconciliationRecord(n:number){
  const national=nationalResults(n),letters=national.lists.map(l=>l.letters);
  const localitySource=verifySource(`k${n}-localities-datagov`),ballotSource=verifySource(`k${n}-ballots-datagov`);
  const rows=voteRows(join(RAW,localitySource.file),letters),ballots=voteRows(join(RAW,ballotSource.file),letters);
  nationalCheck(n,rows,national);nationalCheck(n,ballots,national);
  const localityProjection=JSON.stringify(projection(rows)),ballotProjection=JSON.stringify(projection(aggregate(ballots)));
  check(localityProjection===ballotProjection,`k${n}: localities do not reconcile exactly with polling stations`);
  check(new Set(rows.map(r=>r.code)).size===rows.length,`k${n}: duplicate locality code`);
  const loc:LocalityDataset={schemaVersion:1,id:`k${n}` as LocalityDataset['id'],listIds:letters.map(L=>`${n}-${L}`),rows};
  return {version:1,election:`k${n}`,localitySourceSha256:localitySource.sha256,pollingSourceSha256:ballotSource.sha256,pollingStations:ballots.length,derivedLocalityVotesSha256:digest(ballotProjection),localityDatasetSha256:digest(JSON.stringify(loc))};
}
export interface BuildConfig {
  n:22|23|24;date:string;counts:Record<string,number>;leaders:Record<string,string>;
  noteEn?:string;noteHe?:string;notes?:Record<string,string[]>;
}
export async function buildHistorical(config:BuildConfig){
  const {n}=config;
  const ids=[`k${n}-national-html`,`k${n}-localities-datagov`,`k${n}-ballots-datagov`,`k${n}-candidates-gazette`,`k${n}-surplus-gazette`];
  const rawSha256:Record<string,string>={};
  for(const id of ids.filter(id=>!id.includes('-ballots-')))rawSha256[id]=verifySource(id).sha256!;
  const national=nationalResults(n),letters=national.lists.map(l=>l.letters);
  const rows=voteRows(join(RAW,`k${n}/localities.datagov.json`),letters);nationalCheck(n,rows,national);
  check(new Set(rows.map(r=>r.code)).size===rows.length,`k${n}: duplicate locality codes`);
  const loc:LocalityDataset={schemaVersion:1,id:`k${n}`,listIds:letters.map(L=>`${n}-${L}`),rows};
  const record=JSON.parse(read(`k${n}/reconciliation.json`)) as ReturnType<typeof reconciliationRecord>;
  check(record.version===1 && record.election===`k${n}` && record.localitySourceSha256===rawSha256[`k${n}-localities-datagov`] && record.pollingSourceSha256===sources().find(s=>s.id===`k${n}-ballots-datagov`)?.sha256,`k${n}: reconciliation source hashes changed`);
  check(record.derivedLocalityVotesSha256===digest(JSON.stringify(projection(rows))) && record.localityDatasetSha256===digest(JSON.stringify(loc)),`k${n}: committed reconciliation digest does not match derived localities`);
  check(Number.isSafeInteger(record.pollingStations)&&record.pollingStations>0,`k${n}: invalid polling-station count`);
  rawSha256[`k${n}-ballots-datagov`]=record.pollingSourceSha256!;
  rawSha256[`k${n}-reconciliation`]=digest(read(`k${n}/reconciliation.json`));
  const ballotPath=join(RAW,sources().find(s=>s.id===`k${n}-ballots-datagov`)!.file);
  if(existsSync(ballotPath)){
    check(JSON.stringify(reconciliationRecord(n))===JSON.stringify(record),`k${n}: full polling reconciliation differs from retained evidence`);
    console.log(`k${n}: fully reconciled ${record.pollingStations} polling stations with ${rows.length} locality rows`);
  }else console.log(`k${n}: polling-station scratch file absent; skipping full polling reconciliation; retained source hashes and derived locality SHA-256 verified`);
  const noteText = n === 22
    ? (await pdfLines(join(RAW, 'k22/candidates.pdf'))).flat().map(l=>l.text).join(' ')
    : (await surplusLines(n)).join(' ');
  const withoutSpaces = (s:string) => s.replace(/\s+/g,'');
  for(const [letters,notes] of Object.entries(config.notes??{})) for(const note of notes)
    check(withoutSpaces(noteText).includes(withoutSpaces(note)),`k${n} ${letters}: note not found verbatim in official notice`);
  const rosters=await candidateRosters(n);
  check(rosters.length===letters.length && letters.every(L=>rosters.some(r=>r.letters===L)),`k${n}: gazette and national lists differ`);
  const lists:ListRecord[]=national.lists.map((list,i)=>{
    const r=rosters.find(r=>r.letters===list.letters)!;const id=`${n}-${list.letters}`,meta=META[id];
    check(r.candidates.length===config.counts[list.letters],`k${n} ${list.letters}: candidate count ${r.candidates.length} differs from reviewed last rank ${config.counts[list.letters]}`);
    const candidates=r.candidates.map(c=>({...c,id:`${id}#${c.rank}`,nameHe:`${c.familyHe} ${c.givenHe}`}));
    if(config.leaders[list.letters])check(candidates[0].nameHe===config.leaders[list.letters],`k${n} ${list.letters}: unexpected party leader ${candidates[0].nameHe}`);
    return {id,letters:list.letters,nameHe:r.nameHe,shortHe:meta?.he??r.nameHe,shortEn:meta?.en??null,sponsorsHe:r.sponsorsHe,partiesHe:null,votes:list.votes,withdrawn:n===23&&list.letters==='זץ',color:meta?.color??neutralColor(i),bloc:null,candidates,candidatesSource:`k${n}-candidates-gazette`,candidatesSecondary:false,notesHe:config.notes?.[list.letters]??[]};
  });
  const pairs=await agreementPairs(n);
  check(pairs.flat().every(L=>letters.includes(L)),`k${n}: agreement includes unknown list`);
  // A stable capture timestamp makes clean-checkout rebuilds byte-for-byte comparable.
  const ds:ElectionDataset={schemaVersion:1,id:`k${n}`,knesset:n,electionDate:config.date,nameHe:`הבחירות לכנסת ה-${n}`,nameEn:`Election to the ${n}${n===22?'nd':n===23?'rd':'th'} Knesset`,status:{stage:'official-final',asOf:'2026-11-03',noteEn:`Official final CEC votes and seats; candidate rosters as printed in the approved-list gazette, before subsequent resignations. No default blocs assigned. ${config.noteEn??''}`.trim(),noteHe:`תוצאות סופיות רשמיות. המועמדים לפי רשימות המועמדים המאושרות בילקוט הפרסומים, לפני התפטרויות מאוחרות. ללא שיוך לגושים. ${config.noteHe??''}`.trim()},ruleSetId:'il-2014-bader-ofer-3.25',totals:{...national.totals,ballotBoxes:record.pollingStations,localities:rows.filter(r=>r.code!==9999).length,envelopeVotes:rows.find(r=>r.code===9999)?.votesCast},lists,agreements:pairs.map((p,i)=>({id:`${n}-agr-${i+1}`,members:[`${n}-${p[0]}`,`${n}-${p[1]}`],sourceId:`k${n}-surplus-gazette`})),blocs:[],officialSeats:Object.fromEntries(national.lists.map(l=>[`${n}-${l.letters}`,l.seats])),officialSeatsSourceId:`k${n}-national-html`,sourceIds:[...ids,'law-elections'],buildInfo:{builtAt: ids.map(id=>sources().find(s=>s.id===id)?.retrievedAt??'2026-11-03').sort().at(-1)!,rawSha256}};
  const result=allocate(toEngineInput(scenarioFromDataset(ds)));
  for(const l of result.lists)check(l.seats===ds.officialSeats![l.id],`k${n}: engine ${l.id} got ${l.seats}, officially published ${ds.officialSeats![l.id]}`);
  check(result.seatsAllocated===120 && result.warnings.length===0,`k${n}: allocation incomplete or warned`);
  return {ds,loc};
}
