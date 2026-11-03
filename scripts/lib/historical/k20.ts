import { build, check, clean, RAW, type National, type NationalList } from './k20-k21-common.ts';
import { pdfLines } from '../pdf-text.ts';
import { join } from 'node:path';

// End ranks checked against each list's final printed row, YP7000 pp3938–3952.
const COUNTS = { אמת:120, ג:119, ודעם:120, ז:11, זך:28, זץ:20, טב:108, י:11, יז:9, יך:1, יץ:10, כ:33, ל:30, מחל:119, מרצ:120, נז:9, ני:8, נץ:5, ע:40, פה:120, ף:13, ףץ:10, קנ:63, קץ:26, רק:11, שס:120 };
const LEADERS = { מחל:'נתניהו בנימין', אמת:'הרצוג יצחק', ודעם:'עודה איימן', פה:'לפיד יאיר', כ:'כחלון משה', טב:'בנט נפתלי', שס:'דרעי אריה מכלוף', ל:'ליברמן אביגדור', ג:'ליצמן יעקב', מרצ:'גלאון זהבה' };

export async function nationalK20(): Promise<National> {
  const pages = await pdfLines(join(RAW, 'k20/results.pdf'));
  const lists: NationalList[] = [];
  const letters = Object.keys(COUNTS);
  for (const line of pages[1]) {
    const match = line.text.match(/^([א-ת]+)\s+(.+?)(?:\s+([\d,]+))?$/);
    if (!match || !letters.includes(match[1])) continue;
    lists.push({ letters: match[1], name: clean(match[2]), votes: Number((match[3] ?? '0').replace(/,/g, '')), seats: 0 });
  }
  // On p4371 the seat count is a separate text run just above its list's label.
  let pending = 0;
  let seatRows = 0;
  for (const line of pages[2]) {
    if (/^\d{1,3}$/.test(line.text)) { pending = Number(line.text); continue; }
    const l = lists.find(l => line.text.startsWith(l.letters + ' '));
    if (l) { l.seats = pending; pending = 0; seatRows++; }
  }
  check(lists.length === 26 && seatRows === 26 && lists.reduce((s, l) => s + l.seats, 0) === 120, 'k20: incomplete gazetted result');
  const text = pages[1].map(l => l.text).join('\n');
  const valid = Number(text.match(/סך כל הקולות הכשרים ([\d,]+)/)?.[1].replace(/,/g, ''));
  const invalid = Number(text.match(/מספר הקולות שנמצאו פסולים: ([\d,]+)/)?.[1].replace(/,/g, ''));
  check(valid === 4210884 && invalid === 43854, 'k20: gazetted totals changed');
  // YP7010 publishes valid/invalid, not electorate. The two official data.gov.il
  // tables independently aggregate to 5,881,696 registered (decision 0030).
  return { lists, registered: 5881696, votesCast: valid + invalid, valid, invalid };
}
export async function buildK20() {
  return build(20, await nationalK20(), COUNTS, LEADERS, '2015-03-17', '2015-03-25', 'k20-results-gazette');
}
