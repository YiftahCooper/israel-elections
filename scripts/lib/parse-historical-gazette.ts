// Historical gazettes use two or three name-column groups. Read column labels and geometry,
// never infer a candidate's party from a joint-list name. Scanned PDFs return no lists.
import { pdfLines, joinItems, type PdfItem } from './pdf-text.ts';
export interface HistoricalList { letters: string; nameHe: string; sponsorsHe: string; candidates: { rank: number; nameHe: string; partyHe?: string }[] }
export async function parseHistoricalGazette(path: string): Promise<HistoricalList[]> {
  const pages = await pdfLines(path);
  const lists: HistoricalList[] = [];
  let cur: HistoricalList | undefined;
  let sponsors = '';
  let cols: { right: number; label: string }[] = [];
  let segment: PdfItem[] = [];
  const flush = () => {
    if (!cur || !cols.length || !segment.length) { segment = []; return; }
    const nameCols = cols.filter(c => c.label !== 'מפלגתית');
    const names = nameCols.filter((_, i) => i % 2 === 0);
    const possibleRanks = segment.filter(i => /^\d{1,3}$/.test(i.str.trim()) && +i.str >= 1 && +i.str <= 120 && names.some(c => i.x > c.right && i.x - c.right < 100));
    const ranks = possibleRanks.filter(r => +r.str !== 1 || possibleRanks.some(p => p !== r && Math.abs(p.y-r.y)<2 && +p.str===2));
    for (const r of ranks) {
      const g = names.findIndex(c => r.x > c.right && r.x - c.right < 100);
      const right = r.x + r.w + 2;
      const left = g + 1 < names.length ? Math.max(...ranks.filter(p => p.x > names[g+1].right && p.x < names[g].right).map(p=>p.x+p.w)) + 2 : 0;
      const peers = ranks.filter(i => Math.abs(i.x-r.x)<20);
      const items = segment.filter(i => i !== r && !ranks.includes(i) && i.x+i.w <= right && i.x+i.w > left && Math.abs(i.y-r.y)<12 && peers.every(p => Math.abs(i.y-r.y) <= Math.abs(i.y-p.y)));
      const groupCols = cols.filter(c => c.right <= right && c.right > left);
      const buckets = new Map<string, PdfItem[]>();
      for (const i of items) {
        const col = [...groupCols].sort((a,b)=>Math.abs(a.right-i.x-i.w)-Math.abs(b.right-i.x-i.w))[0];
        if (col) buckets.set(col.label, [...(buckets.get(col.label)??[]),i]);
      }
      const text = (label: string) => {
        const its = buckets.get(label)??[]; const ys: number[]=[];
        for(const i of its) if(!ys.some(y=>Math.abs(y-i.y)<2)) ys.push(i.y);
        return ys.sort((a,b)=>b-a).map(y=>joinItems(its.filter(i=>Math.abs(y-i.y)<2).sort((a,b)=>b.x-a.x))).join(' ').trim();
      };
      const given=text('פרטי'), family=text('משפחה'), party=text('מפלגתית');
      if (!given || !family) throw new Error(`${path}: ${cur.letters} #${r.str}: empty name column`);
      const candidate = {rank:+r.str,nameHe:`${family} ${given}`, ...(party?{partyHe:party}:{})};
      const old=cur.candidates.find(c=>c.rank===candidate.rank);
      if(old && old.nameHe!==candidate.nameHe) throw new Error(`${path}: conflicting duplicate ${cur.letters} #${r.str}: ${old.nameHe} / ${candidate.nameHe}`);
      if(!old)cur.candidates.push(candidate);
    }
    segment=[];
  };
  let ended=false;
  for(const lines of pages) {
    flush();
    for(const l of lines) {
      // Footers sit at 25–45pt in these editions. Do not reuse the 2022 90pt margin.
      if(/^_{3,}|^ס["״]ח /.test(l.text)){flush();cols=[];continue;}
      if(l.y<45 || /ילקוט הפרסומים|DoCenter|המחיר .*שקלים/.test(l.text))continue;
      if(/^הודעה (?:בדבר|על)|^הודעות מאת הציבור/.test(l.text)&&cur){flush();ended=true;break;}
      if(ended)break;
      const p=l.text.match(/^מטעם המפלג(?:ה|ות)\s*:\s*(.*)$/);
      if(p){flush();cols=[];sponsors=p[1];continue;}
      const a=l.text.match(/^(?:אות|אותיות) הרשימה\s*:\s*(.*)$/);
      if(a){flush();cols=[];const letters=a[1].replace(/[.\s]/g,'');cur=lists.find(k=>k.letters===letters);if(!cur){cur={letters,nameHe:'',sponsorsHe:sponsors,candidates:[]};lists.push(cur);}continue;}
      const name=l.text.match(/^כינוי הרשימה\s*:\s*(.*)$/);
      if(name&&cur){cur.nameHe=name[1];continue;}
      if((l.text.match(/משפחה/g)??[]).length>=2){flush();cols=[];
        for(const i of l.items)for(const label of ['פרטי','משפחה','מפלגתית'])if(i.str.includes(label) || label==='משפחה' && /שם מש/.test(i.str))cols.push({right:i.x+i.w,label});
        cols.sort((a,b)=>b.right-a.right);continue;
      }
      if(cur&&cols.length)segment.push(...l.items.filter(i=>i.str.trim()));
    }
  }
  flush();
  for(const l of lists){l.candidates.sort((a,b)=>a.rank-b.rank);if(l.candidates.some((c,i)=>c.rank!==i+1))throw new Error(`${path}: ${l.letters} rank gap: ${l.candidates.map(c=>c.rank)}`);}
  return lists;
}
