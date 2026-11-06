import { readFileSync } from 'node:fs';
import { buildHistorical } from './k22-k24-common.ts';

export async function buildK23() {
  const built = await buildHistorical({
    n: 23, date: '2020-03-02',
    counts: {"אמת": 120, "ג": 119, "ודעם": 120, "ז": 8, "זך": 4, "זץ": 10, "טב": 17, "י": 8, "יז": 7, "ינ": 8, "יף": 14, "יק": 8, "יר": 8, "כ": 8, "כן": 11, "ל": 25, "מחל": 120, "נ": 98, "נז": 13, "ני": 8, "נץ": 17, "נק": 12, "ףז": 22, "פה": 120, "ץ": 16, "ק": 12, "קי": 12, "קך": 18, "קץ": 14, "שס": 120},
    notes: {"אמת": ["איתן כבל מרשימת \"העבודה - גשר - מרצ\" התפטר מרשימת המועמדים ביום ז' בשבט התש\"ף (2 בפברואר 2020;)"], "נ": ["בובה לוי מרשימת \"קול הנשים\" התפטרה מרשימת המועמדים ביום ט\"ו בשבט התש\"ף (10 בפברואר 2020;)"], "קך": ["אופיר לוי מרשימת \"סדר חדש לשינוי שיטת הבחירות בראשות עו\"ד אביטל אופק\" התפטר מרשימת המועמדים ביום ט\"ו בשבט התש\"ף (10 בפברואר 2020;)"], "זץ": ["עקב התפטרות כל מועמדי הרשימה כדין, רשימת \"צומת התנועה לציונות מתחדשת\" אינה משתתפת בבחירות לכנסת ה–23."]},
    leaders: {"מחל": "נתניהו בנימין", "פה": "גנץ בנימין", "ודעם": "עודה איימן", "שס": "דרעי אריה מכלוף", "ג": "ליצמן יעקב", "אמת": "פרץ ארמונד עמיר", "ל": "ליברמן אביגדור", "טב": "בנט נפתלי"},
  });
  // Reviewed YP 8698 cell boundaries; keep election-specific transcription inputs
  // separate from the shared k22–k24 geometry parser (k23 audit resolution).
  const { corrections } = JSON.parse(readFileSync(new URL('../../../data/raw/k23/roster-corrections.json', import.meta.url), 'utf8'));
  for (const correction of corrections) {
    const candidate = built.ds.lists.find(l => l.letters === correction.letters)!.candidates.find(c => c.rank === correction.rank)!;
    for (const [key, value] of Object.entries(correction.before)) {
      if (candidate[key as keyof typeof candidate] !== value) throw new Error(`k23 ${correction.letters} #${correction.rank}: correction precondition changed`);
    }
    Object.assign(candidate, correction.after);
    candidate.nameHe = `${candidate.familyHe} ${candidate.givenHe}`;
  }
  return built;
}
