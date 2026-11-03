// Pins elected names corrected on 4 November 2026 after re-reading the official scans
// (docs/decisions/0088-roster-corrections-and-odata-audit.md). Each corrected name must be what
// the app shows as elected, the old misreading must be gone, and the person must be in the
// retained Knesset OData opening membership (data/raw/kNN/knesset-odata-members.json).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { electedOf } from '../src/app/derive.ts';
import { scenarioFromDataset } from '../src/model/scenario.ts';

/** personId/surname: the Knesset OData opening-day record of the same person (its own spelling). */
interface Fix { id: string; letters: string; rank: number; name: string; was: string; personId?: number; surname?: string }
const FIXES: Fix[] = [
  { id: 'k1', letters: 'ב', rank: 7, name: 'לוינשטין מאיר דוד', was: 'לונשטיין מאיר דוד' },
  // printed under his earlier surname; the Knesset records the later one
  { id: 'k1', letters: 'ב', rank: 15, name: 'צוובנר אברהם חיים', was: 'צנובר אברהם חיים', personId: 2619, surname: 'שאג' },
  { id: 'k2', letters: 'א', rank: 22, name: 'שפר זאב', was: 'שרף זאב', personId: 2663, surname: 'שפר' },
  { id: 'k2', letters: 'א', rank: 37, name: 'טברסקי ז׳ניה', was: 'טברסקי דינה', personId: 2362, surname: 'טברסקי' },
  { id: 'k2', letters: 'א', rank: 38, name: 'אזניה (איזנשטט) ברוך', was: 'אוזניה (אונשטט) ברוך', personId: 2134, surname: 'אזניה' },
  { id: 'k2', letters: 'צ', rank: 8, name: 'בז׳רנו שמעון', was: 'ביזרנו שמעון', personId: 2188, surname: "בז'רנו" },
  { id: 'k2', letters: 'צ', rank: 14, name: 'סוזייב זלמן', was: 'סוייב זלמן', personId: 2500, surname: 'סוזאייב' },
  { id: 'k2', letters: 'צ', rank: 16, name: 'ד״ר סטופ אברהם', was: 'ד״ר סוסמן אברהם', personId: 2504, surname: 'סטופ' },
  { id: 'k2', letters: 'צ', rank: 19, name: 'זיסמן שלום', was: 'יסמן שלום', personId: 2340, surname: 'זיסמן' },
  { id: 'k2', letters: 'צ', rank: 20, name: 'פרלשטין שלמה', was: 'פלדשטיין שלמה', personId: 2554, surname: 'פרלשטיין' },
  { id: 'k2', letters: 'מ', rank: 10, name: 'בסטוני רוסתום', was: 'בסתוני רוסתום', personId: 2211, surname: 'בסטוני' },
  { id: 'k2', letters: 'ע', rank: 1, name: 'חמדאן פארס', was: 'המדאן פארס', personId: 2352, surname: 'חמדאן' },
  { id: 'k3', letters: 'צ', rank: 9, name: 'בז׳רנו שמעון', was: 'ביזרנו שמעון', personId: 2188, surname: "בז'רנו" },
  { id: 'k3', letters: 'צ', rank: 10, name: 'סוזייב זלמן', was: 'סוייב זלמן', personId: 2500, surname: 'סוזאייב' },
  { id: 'k3', letters: 'צ', rank: 13, name: 'פרלשטיין שלמה', was: 'פלדשטיין שלמה', personId: 2554, surname: 'פרלשטיין' },
  { id: 'k4', letters: 'רא', rank: 1, name: 'א-ז׳אהר אחמד', was: 'אי-ד׳אהר אחמד', personId: 2116, surname: "א'-דאהר" },
  { id: 'k4', letters: 'רא', rank: 2, name: 'נח׳לה אליאס', was: 'נחילה אליאס', personId: 2480, surname: 'נחלה' },
  { id: 'k5', letters: 'ל', rank: 18, name: 'פרלשטיין שלמה', was: 'פלדשטיין שלמה', personId: 2554, surname: 'פרלשטיין' },
  { id: 'k7', letters: 'אמת', rank: 29, name: 'דינשטיין צבי', was: 'רייזר-ששון צבי', personId: 2282, surname: 'דינשטיין' },
  { id: 'k10', letters: 'אמת', rank: 17, name: 'חריף משה', was: 'חריש משה', personId: 2356, surname: 'חריף' },
  { id: 'k10', letters: 'אמת', rank: 30, name: 'כץ-עוז אברהם', was: 'בן-אהרן אברהם', personId: 2413, surname: 'כץ-עוז' },
  { id: 'k10', letters: 'אמת', rank: 33, name: 'ותד מחמד', was: 'ורד תמר', personId: 2328, surname: 'ותד' },
  { id: 'k10', letters: 'אמת', rank: 40, name: 'רון אמרי', was: 'רון אמיר', personId: 2603, surname: 'רון' },
  { id: 'k10', letters: 'אמת', rank: 45, name: 'נעים רענן', was: 'נעים עבד', personId: 2491, surname: 'נעים' },
  { id: 'k10', letters: 'מחל', rank: 31, name: 'דורון שרה', was: 'דרורי שרה', personId: 2273, surname: 'דורון' },
  { id: 'k10', letters: 'מחל', rank: 32, name: 'זייגרמן דרור', was: 'וירג׳מן דרור', personId: 2336, surname: 'זייגרמן' },
  { id: 'k10', letters: 'מחל', rank: 38, name: 'רנר צבי', was: 'רבי צבי', personId: 2614, surname: 'רנר' },
  { id: 'k10', letters: 'מחל', rank: 46, name: 'זיגר יצחק', was: 'יגורי יצחק', personId: 2335, surname: 'זיגר' },
  { id: 'k11', letters: 'אמת', rank: 37, name: 'רז נחמן', was: 'רן נחמן', personId: 2606, surname: 'רז' },
  { id: 'k11', letters: 'מחל', rank: 19, name: 'זיגר יצחק', was: 'יגר יצחק', personId: 2335, surname: 'זיגר' },
  { id: 'k11', letters: 'הן', rank: 3, name: 'עטשי זיידאן', was: 'ששי וידאן', personId: 2523, surname: 'עטשי' },
  { id: 'k14', letters: 'מחל', rank: 15, name: 'דיין חיים', was: 'ריבלין חיים', personId: 2276, surname: 'דיין' },
  { id: 'k14', letters: 'מחל', rank: 30, name: 'לנקרי יהודה', was: 'ליבני יהודה', personId: 2444, surname: 'לנקרי' },
  { id: 'k14', letters: 'ע', rank: 3, name: 'אלסאנע טלב', was: 'אלצאנע טלב', personId: 549, surname: 'אלסאנע' },
  { id: 'k9', letters: 'ים', rank: 1, name: 'סייף אלאדין מוחמד סעיד חוסיין זועבי', was: 'סייף אלדין מוחמד סעיד מחמוד זועבי', personId: 2144, surname: 'אלזועבי' },
  { id: 'k12', letters: 'מחל', rank: 32, name: 'גולדברג יוסף', was: '', personId: 2237, surname: 'גולדברג' },
  { id: 'k12', letters: 'הן', rank: 2, name: 'פורז-פוזמנטיר אברהם', was: 'פורזומנסקי אברהם', personId: 519, surname: 'פורז' },
  { id: 'k13', letters: 'אמת', rank: 14, name: 'אור אורי', was: 'אור אריה', personId: 2132, surname: 'אור' },
  { id: 'k15', letters: 'עם', rank: 2, name: 'סאנע טלב', was: 'צאנע טלב', personId: 549, surname: 'אלסאנע' },
];

const dataset = (id: string) => JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8'));
interface OData { positions: { PersonID: number; StartDate: string }[]; persons: { PersonID: number; LastName: string; FirstName: string }[] }
const odata = (id: string): OData => JSON.parse(readFileSync(`data/raw/${id}/knesset-odata-members.json`, 'utf8'));
const openingIds = (o: OData) => {
  const first = o.positions.map((p) => p.StartDate).sort()[0];
  return new Set(o.positions.filter((p) => p.StartDate === first).map((p) => p.PersonID));
};

describe('scan-verified roster corrections', () => {
  for (const f of FIXES) {
    it(`${f.id} ${f.letters} #${f.rank} is ${f.name}`, () => {
      const ds = dataset(f.id);
      const list = ds.lists.find((l: { letters: string }) => l.letters === f.letters);
      expect(list.candidates.find((c: { rank: number }) => c.rank === f.rank).nameHe).toBe(f.name);
      const sim = scenarioFromDataset(ds).lists.find((l) => l.letters === f.letters)!;
      expect(electedOf(sim, ds.officialSeats[list.id]).map((c) => c.nameHe)).toContain(f.name);
      expect(ds.lists.flatMap((l: { candidates: { nameHe: string }[] }) => l.candidates.map((c) => c.nameHe))).not.toContain(f.was);
      // the corrected person sat in the Knesset from its opening day
      if (f.personId === undefined) return;
      const o = odata(f.id);
      expect(o.persons.find((p) => p.PersonID === f.personId)?.LastName).toBe(f.surname);
      expect(openingIds(o).has(f.personId)).toBe(true);
    });
  }

  it('k11 Alignment #16 keeps the candidate notice’s own misprint, with the results-notice spelling recorded', () => {
    const ds = dataset('k11');
    expect(ds.lists.find((l: { letters: string }) => l.letters === 'אמת').candidates[15].nameHe).toBe('שפירא אליהו');
    const review = JSON.parse(readFileSync('data/raw/k11/candidates.reviewed.json', 'utf8'));
    const variants = review.lists.find((l: { letters: string }) => l.letters === 'אמת').electedCrossCheck.spellingVariants;
    expect(variants).toContainEqual(expect.objectContaining({ rank: 16, candidateNameHe: 'שפירא אליהו', electedNameHe: 'שפייזר אליהו' }));
  });
});
