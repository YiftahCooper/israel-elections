/**
 * Glossary content for the (i) info icons: one entry per term a non-expert meets in the app.
 *
 * Each term carries a short bilingual definition, a "learn more" link per language and the
 * sources that support the wording. Every URL was checked on the date in `checked` (HTTP 200
 * and the supporting passage present); the full log is docs/research/glossary-sources.md.
 *
 * Source policy: the statute first (Nevo consolidated texts, the Knesset legislation archive at
 * fs.knesset.gov.il), then the Central Elections Committee, then the Israel Democracy Institute.
 * English-language Wikipedia is never used (owner rule, 4 Nov 2026). No Wikipedia of any language
 * is used below. The Knesset site (main.knesset.gov.il, knesset.gov.il) and gov.il serve a
 * JavaScript bot challenge to automated checks, so their pages could not be verified and are
 * not linked; bechirot.gov.il's home page returned a "page not found" page on the check date.
 *
 * Terms whose `provenance` is not 'sourced' describe the app's own tools or an inferred
 * procedure: their links give background only, not authority for the definition.
 */

export type GlossaryLevel = 'simple' | 'standard' | 'expert';

export interface GlossaryLink {
  title: string;
  publisher: string;
  url: string;
}

export interface GlossarySource extends GlossaryLink {
  lang: 'he' | 'en';
  /** law = statute text; official = election authority; institute = IDI; secondary = anything weaker */
  kind: 'law' | 'official' | 'institute' | 'secondary';
  /** what this source supports in the definition */
  supports: string;
  /** ISO date the URL was loaded and the passage confirmed */
  checked: string;
}

export interface GlossaryTerm {
  id: string;
  nameHe: string;
  nameEn: string;
  defHe: string;
  defEn: string;
  /** the lowest interface level at which the term is visible */
  level: GlossaryLevel;
  linkHe: GlossaryLink;
  linkEn: GlossaryLink;
  sources: GlossarySource[];
  /** 'sourced' = definition rests on the sources; 'app' = describes an app tool; 'inferred' = no statutory text located */
  provenance: 'sourced' | 'app' | 'inferred';
}

const CHECKED = '2026-11-04';

// ---------- links (each one verified on CHECKED) ----------
const NEVO = 'נבו (מאגר החקיקה)';
const IDI_HE = 'המכון הישראלי לדמוקרטיה';
const IDI_EN = 'Israel Democracy Institute';
const CEC_HE = 'ועדת הבחירות המרכזית לכנסת';

const LAW = 'https://www.nevo.co.il/law_html/law01/190_026.htm';
const law = (anchor: string, sections: string): GlossaryLink => ({
  title: `חוק הבחירות לכנסת [נוסח משולב], התשכ"ט-1969, ${sections}`,
  publisher: NEVO,
  url: `${LAW}#${anchor}`,
});
const L = {
  s9: law('Seif94', 'סעיפים 9–11 (אזורי קלפי)'),
  s14: law('Seif2', 'סעיף 14 (אזור בחירה אחד)'),
  s16: law('Seif4', 'סעיפים 16–17 (הוועדה המרכזית)'),
  s26: law('Seif13', 'סעיף 26 (פנקס הבוחרים)'),
  s57: law('Seif149', 'סעיף 57 (הגשת רשימות מועמדים)'),
  s61: law('Seif103', 'סעיף 61 (כינוי ואות של רשימה)'),
  s67: law('Seif108', 'סעיף 67 (התקשרות בין רשימות)'),
  s68: law('Seif109', 'סעיף 68 (מקום קלפי)'),
  s68a: law('Seif110', 'סעיף 68א ואילך (הצבעה מחוץ לקלפי הרגילה)'),
  s78: law('Seif123', 'סעיף 78 (קולות פסולים)'),
  s81: law('Seif126', 'סעיף 81 (חלוקת המנדטים)'),
  s82: law('Seif127', 'סעיף 82 (רשימות קשורות)'),
  s83: law('Seif128', 'סעיף 83 (קביעת חברי הכנסת)'),
};
const BL_KNESSET: GlossaryLink = { title: 'חוק-יסוד: הכנסת', publisher: NEVO, url: 'https://www.nevo.co.il/law_html/law00/72242.htm' };
const BL_GOV: GlossaryLink = { title: 'חוק-יסוד: הממשלה', publisher: NEVO, url: 'https://www.nevo.co.il/law_html/law00/73690.htm' };
const KNESSET_LAW: GlossaryLink = { title: 'חוק הכנסת, התשנ"ד-1994, פרק ו\' (ראש האופוזיציה)', publisher: NEVO, url: 'https://www.nevo.co.il/law_html/law00/72263.htm' };
const LAW_1949: GlossaryLink = { title: 'פקודת הבחירות לאספה המכוננת (עיתון רשמי 33, תוספת א\'), ס\' 30–31', publisher: 'הכנסת – ארכיון החקיקה', url: 'https://fs.knesset.gov.il/0/law/0_lsr_312706.pdf' };
const LAW_1951: GlossaryLink = { title: 'חוק הבחירות לכנסת, 1951 (ס"ח 74 עמ\' 116), ס\' 38–40', publisher: 'הכנסת – ארכיון החקיקה', url: 'https://fs.knesset.gov.il/1/law/1_lsr_208018.pdf' };
const LAW_1973: GlossaryLink = { title: 'חוק הבחירות לכנסת (תיקון מס\' 4), 1973 (ס"ח 692 עמ\' 108)', publisher: 'הכנסת – ארכיון החקיקה', url: 'https://fs.knesset.gov.il/7/law/7_lsr_211799.pdf' };
const CEC25: GlossaryLink = { title: 'תוצאות הבחירות לכנסת ה-25 – תוצאות ארציות', publisher: CEC_HE, url: 'https://votes25.bechirot.gov.il/' };
const CEC25_CITY: GlossaryLink = { title: 'תוצאות הבחירות לכנסת ה-25 – תוצאות לפי יישובים', publisher: CEC_HE, url: 'https://votes25.bechirot.gov.il/cityresults' };

const idiHe = (id: string, title: string): GlossaryLink => ({ title, publisher: IDI_HE, url: `https://www.idi.org.il/articles/${id}` });
const idiEn = (id: string, title: string): GlossaryLink => ({ title, publisher: IDI_EN, url: `https://en.idi.org.il/articles/${id}` });
const H = {
  seats: { title: 'איך קולות הופכים למנדטים? (כולל מילון מונחים)', publisher: IDI_HE, url: 'https://www.idi.org.il/articles/65170' } as GlossaryLink,
  surplus: idiHe('33757', 'כל מה שרציתם לדעת על הסכמי עודפים'),
  methods: idiHe('3498', 'מי מנצח בבחירות? תלוי איך סופרים את הקולות'),
  invalid: idiHe('66309', 'לאן הולכים הקולות הפסולים?'),
  electionDay: idiHe('66720', 'יום הבחירות לכנסת ה-26: כל מה שהבוחר צריך לדעת'),
  joint: idiHe('63813', 'ריצה ברשימות משותפות בבחירות: למי זה טוב?'),
  coalitions: idiHe('3417', 'משחקי הכסא: על קואליציות לאחר בחירות בישראל'),
  coalitionAgreements: idiHe('26572', 'המדריך המלא להסכמים קואליציוניים'),
  headOfState: idiHe('30937', 'תפקידם של ראשי מדינה בתהליך הרכבת הממשלה'),
  norwegian: idiHe('26069', 'החוק הנורווגי במציאות הישראלית'),
  cec: idiHe('65164', 'מהי ועדת הבחירות המרכזית ואיך היא פועלת?'),
  y1949: { title: 'בחירות 1949', publisher: IDI_HE, url: 'https://www.idi.org.il/policy/parties-and-elections/elections/1949/' } as GlossaryLink,
  y1977: { title: 'בחירות 1977', publisher: IDI_HE, url: 'https://www.idi.org.il/policy/parties-and-elections/elections/1977/' } as GlossaryLink,
};
const E = {
  seats: idiEn('63750', 'How Votes Become Knesset Seats'),
  surplus: idiEn('47485', 'Vote-Sharing Agreements'),
  methods: idiEn('3302', 'Who Wins the Israeli Election? That Depends on How You Count the Votes'),
  threshold: idiEn('5225', 'The Electoral Threshold, Wasted Votes, and Proportionality'),
  invalid: idiEn('66508', 'What Happens to Invalid Votes?'),
  electionDay: idiEn('66721', 'Election Day for the 26th Knesset: Everything Voters Need to Know'),
  joint: idiEn('64020', 'Explainer: Running on joint lists in elections: who does it benefit?'),
  knesset101: idiEn('64066', 'Knesset 101: How Parliament and National Elections Work in Israel'),
  coalitions: idiEn('10248', 'Coalition Building in Israel: A Guide for the Perplexed'),
  formation: idiEn('63976', 'Everything You Need to Know About How a Government is Formed Following Elections'),
  president: idiEn('67022', 'The President’s Role in Assigning the Task of Forming a Government'),
  norwegian: idiEn('48367', 'The “Norwegian Law”: Problematic, Yes—But a Necessary Evil'),
  cec: idiEn('65189', 'The Central Elections Committee: What You Need to Know Ahead of the 2026 Elections'),
  opposition: { title: 'The Role of the Opposition in the Knesset', publisher: IDI_EN, url: 'https://en.idi.org.il/publications/6858' } as GlossaryLink,
  y1949: { title: '1949 elections', publisher: IDI_EN, url: 'https://en.idi.org.il/israeli-elections-and-parties/elections/1949/' } as GlossaryLink,
  y1977: { title: '1977 elections', publisher: IDI_EN, url: 'https://en.idi.org.il/israeli-elections-and-parties/elections/1977/' } as GlossaryLink,
};

const src = (link: GlossaryLink, lang: 'he' | 'en', kind: GlossarySource['kind'], supports: string): GlossarySource => ({ ...link, lang, kind, supports, checked: CHECKED });

// ---------- terms ----------
export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // ---- the institution and the ballot ----
  {
    id: 'knesset', nameHe: 'הכנסת', nameEn: 'Knesset', level: 'simple', provenance: 'sourced',
    defHe: 'בית הנבחרים של מדינת ישראל, בן 120 חברים. הכנסת נבחרת בבחירות כלליות, ארציות, ישירות, שוות, חשאיות ויחסיות, וכל שטח המדינה הוא אזור בחירה אחד.',
    defEn: 'Israel’s parliament, with 120 members in a single chamber. It is elected in general, national, direct, equal, secret and proportional elections, with the whole country forming one constituency.',
    linkHe: BL_KNESSET, linkEn: E.knesset101,
    sources: [
      src(BL_KNESSET, 'he', 'law', 'ss.1, 3, 4: house of representatives; 120 members; general, national, direct, equal, secret, proportional'),
      src(L.s14, 'he', 'law', 's.14: the whole country is one area for election results'),
      src(E.knesset101, 'en', 'institute', 'unicameral 120-member parliament elected in one nationwide constituency'),
    ],
  },
  {
    id: 'electoral-list', nameHe: 'רשימת מועמדים', nameEn: 'Electoral list (party list)', level: 'simple', provenance: 'sourced',
    defHe: 'בבחירות לכנסת מצביעים בעד רשימה ולא בעד מועמד יחיד. רק מפלגה רשאית להגיש רשימה; הרשימה כוללת עד 120 מועמדים מסודרים לפי מספר, והבוחרים אינם יכולים לשנות את הסדר.',
    defEn: 'Israelis vote for a list, not for an individual candidate. Only a registered party may submit a list; it holds up to 120 numbered candidates, and voters cannot change their order (a “closed list”).',
    linkHe: L.s57, linkEn: E.knesset101,
    sources: [
      src(BL_KNESSET, 'he', 'law', 's.5A: a list may be submitted only by a party'),
      src(L.s57, 'he', 'law', 's.57(a): up to 120 names, each with a serial number'),
      src(E.knesset101, 'en', 'institute', 'closed party-list system; order submitted in advance to the CEC'),
    ],
  },
  {
    id: 'ballot-letters', nameHe: 'אותיות הרשימה', nameEn: 'Ballot letters', level: 'simple', provenance: 'sourced',
    defHe: 'לכל רשימה כינוי ועד שלוש אותיות עבריות המודפסות על פתק ההצבעה שלה, כדי להבדיל אותה משאר הרשימות. מפלגה המיוצגת בכנסת היוצאת זכאית לעדיפות בבחירת אותיותיה.',
    defEn: 'Each list has a name and up to three Hebrew letters printed on its ballot slip to tell it apart from the others. A party represented in the outgoing Knesset has priority to keep its letters.',
    linkHe: L.s61, linkEn: E.electionDay,
    sources: [
      src(L.s61, 'he', 'law', 's.61(a)–(b): a name with up to three Hebrew letters; priority for parties in the outgoing Knesset'),
      src(CEC25, 'he', 'official', 'results table column "אותיות הרשימה"'),
      src(E.electionDay, 'en', 'institute', 'each slip bears the list’s name and its identifying letter or letters'),
    ],
  },
  {
    id: 'valid', nameHe: 'קולות כשרים', nameEn: 'Valid votes', level: 'standard', provenance: 'sourced',
    defHe: 'הקולות שנמצאו תקינים ונספרו בעד רשימה כלשהי, אחרי ניכוי הקולות הפסולים. הם כוללים גם קולות לרשימות שלא עברו את אחוז החסימה, ומהם מחושב אחוז החסימה.',
    defEn: 'Votes found to be in order and counted for some list, once invalid votes are removed. They include votes for lists that failed the threshold, and the threshold is calculated from them.',
    linkHe: H.seats, linkEn: E.seats,
    sources: [
      src(H.seats, 'he', 'institute', 'glossary: valid votes = votes counted after deducting invalid votes'),
      src(L.s81, 'he', 'law', 's.81(a): threshold is a share of all valid votes'),
      src(E.seats, 'en', 'institute', 'step one: invalid votes subtracted to obtain valid votes'),
    ],
  },
  {
    id: 'invalid-votes', nameHe: 'קולות פסולים', nameEn: 'Invalid ballots', level: 'simple', provenance: 'sourced',
    defHe: 'פתקים שאינם נספרים לאף רשימה: למשל פתק לבן ריק, מעטפה עם פתקים של יותר מרשימה אחת, או סימן שעלול לזהות את המצביע. הם נכללים בשיעור ההצבעה אך אינם משפיעים על אחוז החסימה או על חלוקת המנדטים.',
    defEn: 'Ballots counted for no list, for example a blank slip, an envelope holding slips for more than one list, or a mark that could identify the voter. They count in turnout but have no effect on the threshold or on seats.',
    linkHe: H.invalid, linkEn: E.invalid,
    sources: [
      src(L.s78, 'he', 'law', 's.78: grounds for invalid votes'),
      src(H.invalid, 'he', 'institute', 'invalid votes ignored for the threshold; they only affect published turnout'),
      src(E.invalid, 'en', 'institute', 'grounds under s.78; the only public measure invalid votes affect is turnout'),
    ],
  },
  {
    id: 'registered-voters', nameHe: 'בעלי זכות בחירה', nameEn: 'Registered voters (electorate)', level: 'standard', provenance: 'sourced',
    defHe: 'כל האזרחים הרשומים בפנקס הבוחרים, שמלאו להם 18 עד יום הבחירות. הפנקס נערך מתוך מרשם האוכלוסין, וכל בוחר משויך לקלפי לפי מענו.',
    defEn: 'Every citizen listed in the voters’ register who is 18 by election day. The register is drawn from the Population Registry, and each voter is assigned to a polling station by address.',
    linkHe: L.s26, linkEn: E.electionDay,
    sources: [
      src(BL_KNESSET, 'he', 'law', 's.5: every citizen aged 18 or over may vote'),
      src(L.s26, 'he', 'law', 's.26: register of citizens resident in the Population Registry, 18 by election day, by polling area'),
      src(CEC25, 'he', 'official', 'published total "סה"כ בעלי זכות בחירה"'),
      src(E.electionDay, 'en', 'institute', 'eligibility: citizen, 18 by election day, listed in the electoral register'),
    ],
  },
  {
    id: 'turnout', nameHe: 'שיעור ההצבעה', nameEn: 'Turnout', level: 'simple', provenance: 'sourced',
    defHe: 'מספר המצביעים (כולל קולות פסולים) חלקי מספר בעלי זכות הבחירה. ועדת הבחירות המרכזית מפרסמת אותו לכל הארץ, לכל יישוב ולכל קלפי.',
    defEn: 'The number of people who voted (invalid ballots included) divided by the number of registered voters. The Central Elections Committee publishes it nationally, by locality and by polling station.',
    linkHe: CEC25, linkEn: E.electionDay,
    sources: [
      src(CEC25, 'he', 'official', 'national totals: registered voters, votes cast and turnout (70.63% in 2022)'),
      src(E.invalid, 'en', 'institute', 'invalid votes are included in turnout as reported by the CEC'),
      src(E.electionDay, 'en', 'institute', 'CEC publishes turnout during election day, per polling station'),
    ],
  },
  // ---- from votes to seats ----
  {
    id: 'threshold', nameHe: 'אחוז החסימה', nameEn: 'Electoral threshold', level: 'simple', provenance: 'sourced',
    defHe: 'רשימה משתתפת בחלוקת המנדטים רק אם קיבלה לפחות שיעור קבוע מכלל הקולות הכשרים (סעיף 81(א)): 3.25% מאז 2015, 2% ב-2006–2013, 1.5% ב-1992–2003 ו-1% ב-1951–1988. בבחירות 1949 לא נקבע אחוז, אבל רשימה נזקקה למודד שלם אחד (כ-0.83%). מספר הקולות הנדרש משתנה עם סך הקולות הכשרים.',
    defEn: 'A list takes part in seat allocation only with at least a fixed share of all valid votes (section 81(a)): 3.25% since 2015, 2% in 2006–2013, 1.5% in 1992–2003 and 1% in 1951–1988. In 1949 no percentage was set, but a list needed one whole quota (about 0.83%). The number of votes required changes with the valid total.',
    linkHe: H.seats, linkEn: E.threshold,
    sources: [
      src(L.s81, 'he', 'law', 's.81(a) and amendment history on the page: 1% → 1.5% (Amendment 23, 1991) → 2% (Amendment 51, in force 27.5.2004) → 3.25% (Amendment 62, 19.3.2014)'),
      src(LAW_1951, 'he', 'law', '1951 law: 1% threshold'),
      src(LAW_1949, 'he', 'law', '1949 ordinance: no percentage threshold; only lists with a whole quota compete for further seats'),
      src(H.y1949, 'he', 'institute', 'IDI lists the 1949 "threshold" as 0.83%, the effective one-quota barrier (1/121)'),
      src(H.seats, 'he', 'institute', '3.25% since 2015; the vote count needed varies with turnout and invalid votes'),
      src(E.threshold, 'en', 'institute', 'history: 1% to 1988, 1.5% 1992–2003, 2% for three elections, 3.25% from 2014'),
    ],
  },
  {
    id: 'qualifying', nameHe: 'קולות משתתפים', nameEn: 'Qualifying votes', level: 'standard', provenance: 'sourced',
    defHe: 'סך הקולות הכשרים של כל הרשימות שעברו את אחוז החסימה. רק הם מחולקים בין המנדטים, ולכן חלקה של רשימה מהם גדול מחלקה מכלל הקולות הכשרים.',
    defEn: 'The valid votes of all lists that passed the threshold. Only these are divided among the seats, so a list’s share of them is larger than its share of all valid votes.',
    linkHe: L.s81, linkEn: E.seats,
    sources: [
      src(L.s81, 'he', 'law', 's.81(b): valid votes of all lists taking part in the allocation'),
      src(E.seats, 'en', 'institute', 'step three: votes of lists below the threshold are subtracted'),
    ],
  },
  {
    id: 'unrepresented', nameHe: 'קולות שלא השתתפו בחלוקה ("קולות שהלכו לאיבוד")', nameEn: 'Unrepresented (wasted) votes', level: 'simple', provenance: 'sourced',
    defHe: 'קולות כשרים לגמרי שניתנו לרשימות שלא עברו את אחוז החסימה, ולכן לא תרמו למנדט. בניגוד לקולות פסולים הם כן משפיעים: הם נכללים בסך שממנו מחושב אחוז החסימה. בבחירות 1949 גם רשימה שלא הגיעה למודד שלם לא זכתה במושב.',
    defEn: 'Fully valid votes cast for lists that failed the threshold, so they won no seat. Unlike invalid votes they still matter: they are part of the total from which the threshold is calculated. In 1949 a list short of one whole quota also won nothing.',
    linkHe: H.invalid, linkEn: E.invalid,
    sources: [
      src(H.invalid, 'he', 'institute', 'difference between invalid and wasted votes'),
      src(E.invalid, 'en', 'institute', '"wasted votes": valid votes for lists below the threshold; included in the threshold base (8.8% in 2022)'),
      src(E.threshold, 'en', 'institute', 'threshold, wasted votes and proportionality'),
    ],
  },
  {
    id: 'quota', nameHe: 'המודד הכללי', nameEn: 'General quota', level: 'simple', provenance: 'sourced',
    defHe: 'סך הקולות המשתתפים חלקי 120, והמספר השלם היוצא (סעיף 81(ב)). זהו בקירוב "מחיר" של מנדט: כל רשימה מקבלת תחילה מנדט לכל מודד שלם בקולותיה. ב-1949 חילקו את כל הקולות הכשרים ב-121.',
    defEn: 'Qualifying votes divided by 120, keeping the whole number (section 81(b)). It is roughly the “price” of a seat: each list first gets one seat per whole quota in its votes. In 1949 all valid votes were divided by 121.',
    linkHe: H.seats, linkEn: E.seats,
    sources: [
      src(L.s81, 'he', 'law', 's.81(b)–(c): integer quotient is "המודד"; one seat per whole quota'),
      src(H.seats, 'he', 'institute', 'the quota: votes of qualifying lists ÷ 120 (36,227 in 2022)'),
      src(LAW_1949, 'he', 'law', '1949: quota from all valid votes ÷ 121 (see docs/ELECTORAL-LAW.md)'),
      src(E.seats, 'en', 'institute', 'step four: the seat quota'),
    ],
  },
  {
    id: 'whole-quota-seats', nameHe: 'מנדטים במודד', nameEn: 'Whole-quota seats', level: 'simple', provenance: 'sourced',
    defHe: 'המנדטים שכל רשימה מקבלת בשלב הראשון: מספר הפעמים שהמודד הכללי נכנס בקולותיה, בלי שארית. כך מתחלקים רוב המנדטים: 113 מתוך 120 ב-2022.',
    defEn: 'The seats each list gets in the first stage: the number of times the general quota fits into its votes, ignoring the remainder. This fills most of the chamber: 113 of the 120 seats in 2022.',
    linkHe: H.seats, linkEn: E.seats,
    sources: [
      src(L.s81, 'he', 'law', 's.81(c)'),
      src(H.surplus, 'he', 'institute', '112 seats allocated in the first round in 2021'),
      src(E.seats, 'en', 'institute', 'step five: first allocation (113 in 2022)'),
    ],
  },
  {
    id: 'remainder-seats', nameHe: 'מנדטים עודפים', nameEn: 'Remainder seats', level: 'simple', provenance: 'sourced',
    defHe: 'המנדטים המעטים שנותרו אחרי החלוקה לפי המודד (שבעה ב-2022). מאז 1973 הם מתחלקים בשיטת בדר–עופר, ובבחירות 1951–1969 לפי השארית הגדולה ביותר.',
    defEn: 'The few seats still unfilled after the whole-quota stage (seven in 2022). Since 1973 they are shared out by the Bader–Ofer method; in 1951–1969 they went to the largest remainders.',
    linkHe: H.surplus, linkEn: E.seats,
    sources: [
      src(L.s81, 'he', 'law', 's.81(d): seats remaining after (c)'),
      src(H.surplus, 'he', 'institute', 'surplus seats are those left after the first round'),
      src(E.seats, 'en', 'institute', 'step six: remaining (surplus) seats'),
      src(LAW_1951, 'he', 'law', '1951–1969: largest unused remainders'),
    ],
  },
  {
    id: 'baderofer', nameHe: 'שיטת בדר–עופר', nameEn: 'Bader–Ofer method', level: 'simple', provenance: 'sourced',
    defHe: 'השיטה לחלוקת המנדטים העודפים מאז 1973 (סעיף 81(ד)). המנדטים מחולקים אחד־אחד: לכל רשימה מחשבים "מודד רשימה" – קולותיה ÷ (מנדטיה + 1) – והגבוה ביותר זוכה; החישוב חוזר אחרי כל מנדט. השיטה מעניקה יתרון לרשימות גדולות.',
    defEn: 'Israel’s rule for the remainder seats since 1973 (section 81(d)). Seats are awarded one at a time: for each list compute votes ÷ (seats won + 1), and the highest figure wins a seat; the calculation repeats after every seat. The method favours larger lists.',
    linkHe: H.seats, linkEn: E.seats,
    sources: [
      src(L.s81, 'he', 'law', 's.81(d)(1)–(3): list quotient, highest wins, repeated'),
      src(LAW_1973, 'he', 'law', 'Amendment No. 4 (1973) introduced the present s.81(d)'),
      src(H.seats, 'he', 'institute', 'remaining seats by the method known as Bader–Ofer'),
      src(H.surplus, 'he', 'institute', 'adopted in the 1973 Bader–Ofer law, partly to strengthen large parties'),
      src(E.seats, 'en', 'institute', 'remaining seats allocated by the D’Hondt highest-average formula'),
    ],
  },
  {
    id: 'dhondt', nameHe: "שיטת ד'הונט", nameEn: "D'Hondt method", level: 'expert', provenance: 'sourced',
    defHe: "שיטת 'ממוצע גבוה ביותר' נפוצה: כל מנדט ניתן לרשימה שקולותיה ÷ (מנדטיה + 1) הם הגבוהים ביותר. שיטת בדר–עופר היא בפועל ד'הונט; תוצאתה יכולה להיות שונה רק בגלל הסכמי עודפים, ובמקרי קצה נדירים בגלל מגבלת מחצית המנדטים או עיגול המודד.",
    defEn: "A widely used highest-averages method: each seat goes to the list with the highest votes ÷ (seats + 1). Bader–Ofer is in effect D'Hondt; its result can differ only because of surplus agreements and, in rare edge cases, the half-seats cap or the rounding of the quota.",
    linkHe: H.methods, linkEn: E.methods,
    sources: [
      src(H.methods, 'he', 'institute', "D'Hondt: votes ÷ (seats so far + 1); favours large parties"),
      src(E.methods, 'en', 'institute', "D'Hondt divisors 1, 2, 3…; worked example"),
      src(E.seats, 'en', 'institute', 'Israel’s remaining seats use the D’Hondt formula'),
    ],
  },
  {
    id: 'listquota', nameHe: 'מודד רשימה', nameEn: 'List quotient (next-seat quotient)', level: 'simple', provenance: 'sourced',
    defHe: 'המספר שמשווים בכל צעד בשלב העודפים: קולות הרשימה (או צמד רשימות בהסכם עודפים) ÷ (המנדטים שכבר קיבלה + 1). המודד הגבוה ביותר זוכה במנדט הבא.',
    defEn: 'The figure compared at each step of the remainder stage: the votes of a list (or of a surplus-agreement pair) ÷ (seats already won + 1). The highest quotient wins the next seat.',
    linkHe: L.s81, linkEn: E.surplus,
    sources: [
      src(L.s81, 'he', 'law', 's.81(d)(1): "מודד רשימה"'),
      src(H.surplus, 'he', 'institute', 'the "מודד לרשימה" formula; pairs use combined votes and seats'),
      src(E.surplus, 'en', 'institute', 'the "list indicator"'),
    ],
  },
  {
    id: 'highest-averages', nameHe: 'שיטת הממוצע הגדול ביותר', nameEn: 'Highest-averages method', level: 'expert', provenance: 'sourced',
    defHe: 'משפחת שיטות שבהן המושבים מחולקים אחד־אחד: מחלקים את קולות כל מפלגה במחלקים קבועים, והמנה הגבוהה זוכה. ההבדל בין השיטות הוא סדרת המחלקים (ד\'הונט: 1, 2, 3…; סנט־לגה: 1, 3, 5…).',
    defEn: 'A family of methods that award seats one at a time: each party’s votes are divided by a fixed series of divisors and the highest result wins. Methods differ only in the divisors (D’Hondt 1, 2, 3…; Sainte-Laguë 1, 3, 5…).',
    linkHe: H.methods, linkEn: E.methods,
    sources: [
      src(H.methods, 'he', 'institute', '"שיטת הממוצע הגדול ביותר" section'),
      src(E.methods, 'en', 'institute', '"The Largest Average System" section'),
    ],
  },
  {
    id: 'largest-remainder', nameHe: 'שיטת השארית (העודף) הגדולה ביותר', nameEn: 'Largest-remainder method', level: 'simple', provenance: 'sourced',
    defHe: 'אחרי חלוקת מושבים לפי מודד שלם, המושבים הנותרים ניתנים לרשימות שנותרו להן השאריות הגדולות ביותר, בלי קשר לגודלן. כך חולקו המנדטים העודפים בבחירות 1951–1969, מושב נוסף אחד לכל היותר לכל רשימה.',
    defEn: 'After whole-quota seats are given out, the leftover seats go to the lists with the largest unused remainders, whatever their size. Israel used it for the remainder seats in 1951–1969, at most one extra seat per list.',
    linkHe: H.methods, linkEn: E.methods,
    sources: [
      src(LAW_1951, 'he', 'law', '1951 law ss.38–40: largest unused remainders, one additional seat per competing list'),
      src(H.methods, 'he', 'institute', '"שיטת העודף הגדול ביותר" with Hare quota example'),
      src(E.methods, 'en', 'institute', '"The Largest Remainder System" section'),
    ],
  },
  {
    id: 'hare-quota', nameHe: 'מכסת הייר', nameEn: 'Hare quota', level: 'expert', provenance: 'sourced',
    defHe: 'מכסה שמחושבת כסך הקולות הכשרים (בניכוי רשימות מתחת לחסימה) חלקי מספר המושבים. המודד הכללי בישראל הוא מכסת הייר המעוגלת כלפי מטה.',
    defEn: 'A quota equal to the valid votes (excluding lists below the threshold) divided by the number of seats. Israel’s general quota is a Hare quota rounded down to a whole number.',
    linkHe: H.methods, linkEn: E.methods,
    sources: [
      src(H.methods, 'he', 'institute', '"מכסת הייר" definition'),
      src(E.methods, 'en', 'institute', '"The Hare Quota" section'),
      src(L.s81, 'he', 'law', 's.81(b): qualifying votes ÷ seats, integer part'),
    ],
  },
  {
    id: 'droop-quota', nameHe: 'מכסת דרופ', nameEn: 'Droop quota', level: 'expert', provenance: 'sourced',
    defHe: 'מכסה שבה מחלקים את הקולות הכשרים במספר המושבים ועוד אחד, ולכן היא קטנה מעט ממכסת הייר ומשאירה פחות מושבים עודפים. ישראל אינה משתמשת בה; ב-1949 חילקו ב-121 (מספר המושבים ועוד אחד).',
    defEn: 'A quota obtained by dividing valid votes by the number of seats plus one, so it is slightly smaller than the Hare quota and leaves fewer seats over. Israel does not use it today; in 1949 the divisor was 121, i.e. seats plus one.',
    linkHe: H.methods, linkEn: E.methods,
    sources: [
      src(H.methods, 'he', 'institute', '"מכסת דרופ" definition'),
      src(E.methods, 'en', 'institute', '"The Droop Quota" section'),
      src(LAW_1949, 'he', 'law', '1949 divisor 121 (docs/ELECTORAL-LAW.md)'),
    ],
  },
  {
    id: 'sainte-lague', nameHe: 'שיטת סנט־לגה', nameEn: 'Sainte-Laguë method', level: 'simple', provenance: 'sourced',
    defHe: 'שיטת ממוצע גבוה ביותר שבה המחלקים הם 1, 3, 5, 7 וכן הלאה, במקום 1, 2, 3 של ד\'הונט. היא פחות מיטיבה עם הרשימות הגדולות. באפליקציה היא כלל ניסיוני בלבד ואינה חלק מהחוק בישראל.',
    defEn: 'A highest-averages method whose divisors are 1, 3, 5, 7 and so on, instead of D’Hondt’s 1, 2, 3. It gives large lists less of an edge. In this app it is an experimental rule only; it is not part of Israeli law.',
    linkHe: H.methods, linkEn: E.methods,
    sources: [
      src(H.methods, 'he', 'institute', '"שיטת סנט לגואה": divisors 1, 3, 5…'),
      src(E.methods, 'en', 'institute', '"The Sainte Laguë System" section'),
    ],
  },
  {
    id: 'modified-sainte-lague', nameHe: 'שיטת סנט־לגה המשופרת', nameEn: 'Modified Sainte-Laguë method', level: 'expert', provenance: 'sourced',
    defHe: 'גרסה של סנט־לגה שבה המחלק הראשון הוא 1.4 ולא 1 (1.4, 3, 5, 7…), כדי להקשות על רשימות קטנות מאוד לזכות במושב ראשון. נהוגה בנורווגיה ובשוודיה.',
    defEn: 'A variant of Sainte-Laguë whose first divisor is 1.4 instead of 1 (1.4, 3, 5, 7…), making a first seat harder for very small lists. It is used in Norway and Sweden.',
    linkHe: H.methods, linkEn: E.methods,
    sources: [
      src(H.methods, 'he', 'institute', '"שיטת סנט לגואה המשופרת": divisors 1.4, 3, 5, 7'),
      src(E.methods, 'en', 'institute', 'modified Sainte-Laguë, divisors 1.4, 3, 5, 7; Norway and Sweden'),
    ],
  },
  {
    id: 'surplus', nameHe: 'הסכם עודפים', nameEn: 'Surplus-vote agreement', level: 'simple', provenance: 'sourced',
    defHe: 'הסכם בין שתי רשימות, שבלשון החוק נקרא "התקשרות". בשלב חלוקת העודפים בלבד שתיהן נחשבות לרשימה אחת, ובלבד ששתיהן עברו את אחוז החסימה. מה שזכו בו יחד מחולק ביניהן מחדש באותה שיטה (סעיפים 67, 82).',
    defEn: 'An agreement between two lists (in the law’s words, a “connection”). In the remainder stage only, the pair counts as one list, provided both passed the threshold. Whatever they win together is then re-divided between them by the same method (sections 67 and 82).',
    linkHe: H.surplus, linkEn: E.surplus,
    sources: [
      src(L.s67, 'he', 'law', 's.67(a): a list may connect with one other list only; effect only as in s.82'),
      src(L.s82, 'he', 'law', 's.82(a)–(b): combined only for s.81(d), only if both pass the threshold; internal re-division by s.81'),
      src(H.surplus, 'he', 'institute', 'explainer, including which partner gets the extra seat'),
      src(H.seats, 'he', 'institute', '"הסכמי עודפים" is the popular name for the s.67 connection'),
      src(E.surplus, 'en', 'institute', 'Vote-sharing agreements explainer'),
    ],
  },
  {
    id: 'cap', nameHe: 'מגבלת מחצית המנדטים', nameEn: 'Half-seats cap', level: 'simple', provenance: 'sourced',
    defHe: 'רשימה שלא קיבלה יותר ממחצית הקולות המשתתפים, אך כבר זכתה במחצית המנדטים, אינה ממשיכה להשתתף בחלוקת העודפים (סעיף 81(ד)(4), מאז 1973). כך שיטת העודפים לא יכולה לתת רוב לרשימה שאין לה רוב קולות.',
    defEn: 'A list with no more than half the qualifying votes that already holds half the seats takes no further part in the remainder stage (section 81(d)(4), since 1973). The remainder method thus cannot hand a majority to a list without a majority of the votes.',
    linkHe: L.s81, linkEn: E.seats,
    sources: [
      src(L.s81, 'he', 'law', 's.81(d)(4)'),
      src(LAW_1973, 'he', 'law', 'introduced by Amendment No. 4, 1973'),
    ],
  },
  {
    id: 'tie-lottery', nameHe: 'שוויון והגרלה', nameEn: 'Ties and lottery', level: 'simple', provenance: 'sourced',
    defHe: 'אם לשתי רשימות או יותר יש מודד רשימה זהה בדיוק על המנדט הבא, ועדת הבחירות המרכזית עורכת הגרלה (סעיף 81(ד)(2)). כך גם ב-1949. בחוק של 1951–1969 לא נמצאה הוראה לשוויון בשאריות.',
    defEn: 'If two or more lists have exactly equal quotients for the next seat, the Central Elections Committee draws lots (section 81(d)(2)); the 1949 ordinance did the same. No rule for equal remainders was found in the 1951–1969 law.',
    linkHe: L.s81, linkEn: E.seats,
    sources: [
      src(L.s81, 'he', 'law', 's.81(d)(2): equal list quotients decided by a CEC lottery'),
      src(LAW_1949, 'he', 'law', '1949 s.30: lottery for equal integer quotients (docs/ELECTORAL-LAW.md)'),
      src(LAW_1951, 'he', 'law', 'allocation clauses contain no tie rule for equal remainders (docs/ELECTORAL-LAW.md)'),
    ],
  },
  // ---- where and how people vote ----
  {
    id: 'envelopes', nameHe: 'מעטפות כפולות (חיצוניות)', nameEn: 'Double envelopes', level: 'simple', provenance: 'sourced',
    defHe: 'הסדר שמאפשר לקבוצות מסוימות להצביע מחוץ לקלפי שבה הן רשומות, למשל חיילים ושוטרים, מאושפזים, אסירים, אנשים המוגבלים בניידות, נשים במקלטים ועובדי מדינה בחו"ל. הפתק נכנס למעטפה אנונימית בתוך מעטפה חיצונית מזוהה, והקולות נספרים בנפרד. בקובצי התוצאות הם מרוכזים מחוץ ליישובים, ולכן שיעור ההצבעה ביישוב אינו כולל אותם.',
    defEn: 'An arrangement letting certain groups vote away from their own polling station, such as soldiers and police, hospital patients, prisoners, people with limited mobility, women in shelters and civil servants abroad. The slip goes in an anonymous envelope inside an outer envelope bearing the voter’s details, and these votes are counted centrally. Results files group them outside any locality, so locality turnout excludes them.',
    linkHe: H.electionDay, linkEn: E.invalid,
    sources: [
      src(L.s68a, 'he', 'law', 'ss.68A–68B, 91, 116B ff.: voting by outer envelope'),
      src(H.seats, 'he', 'institute', 'glossary entry "מעטפות כפולות (מעטפות חיצוניות)"'),
      src(H.electionDay, 'he', 'institute', 'who may vote in double envelopes'),
      src(E.invalid, 'en', 'institute', 'double-envelope procedure; counted after checking for double voting'),
    ],
  },
  {
    id: 'locality', nameHe: 'יישוב', nameEn: 'Locality', level: 'simple', provenance: 'sourced',
    defHe: 'עיר, מועצה מקומית או יישוב שבו רשומים הבוחרים. ועדת הבחירות מפרסמת תוצאות לכל יישוב; כל קלפי שייכת ליישוב אחד בלבד.',
    defEn: 'A city, local council or village where voters are registered. The Central Elections Committee publishes results for each locality, and every polling area lies within a single locality.',
    linkHe: CEC25_CITY, linkEn: E.electionDay,
    sources: [
      src(L.s9, 'he', 'law', 's.10: a polling area includes no more than one locality'),
      src(CEC25_CITY, 'he', 'official', 'official results by locality'),
    ],
  },
  {
    id: 'polling-station', nameHe: 'קלפי', nameEn: 'Polling station', level: 'simple', provenance: 'sourced',
    defHe: 'המקום שבו מצביעים. שטח המדינה מחולק לאזורי קלפי ממוספרים, עם קלפי אחת לכל אזור ועד 800 בוחרים, וכל בוחר רשום לקלפי מסוימת לפי מענו. הספירה נעשית בכל קלפי מיד בתום ההצבעה.',
    defEn: 'The place where people vote. The country is divided into numbered polling areas, each with one ballot box and at most 800 voters, and every voter is assigned to one station by address. Votes are counted at each station as soon as voting ends.',
    linkHe: H.electionDay, linkEn: E.electionDay,
    sources: [
      src(L.s9, 'he', 'law', 'ss.9–11: polling areas, one locality, at most 800 voters'),
      src(L.s68, 'he', 'law', 's.68(a): one ballot box per polling area'),
      src(CEC25, 'he', 'official', 'results by polling station ("תוצאות לפי קלפיות")'),
      src(E.knesset101, 'en', 'institute', 'voters assigned in advance to a polling station by registered residence'),
    ],
  },
  {
    id: 'cec', nameHe: 'ועדת הבחירות המרכזית', nameEn: 'Central Elections Committee (CEC)', level: 'simple', provenance: 'sourced',
    defHe: 'הגוף המנהל את הבחירות לכנסת ומפרסם את התוצאות הרשמיות. בראשה שופט בית המשפט העליון, וחבריה הם נציגי הסיעות בכנסת לפי גודלן.',
    defEn: 'The body that runs Knesset elections and publishes the official results. It is chaired by a Supreme Court justice, and its members represent the Knesset factions in proportion to their size.',
    linkHe: H.cec, linkEn: E.cec,
    sources: [
      src(L.s16, 'he', 'law', 'ss.16–17: members are faction representatives; chair is a Supreme Court justice'),
      src(H.cec, 'he', 'institute', 'what the CEC is and how it works'),
      src(E.cec, 'en', 'institute', 'judicial chair, administrative staff, political plenum'),
    ],
  },
  // ---- after the election ----
  {
    id: 'coalition', nameHe: 'קואליציה', nameEn: 'Coalition', level: 'simple', provenance: 'sourced',
    defHe: 'הסיעות שחברו יחד כדי להקים ממשלה ולתמוך בה בכנסת, בדרך כלל על בסיס הסכמים קואליציוניים. מאחר שאף רשימה לא זכתה מעולם ברוב, כל ממשלות ישראל היו קואליציוניות.',
    defEn: 'The factions that join to form a government and support it in the Knesset, usually under signed coalition agreements. Because no list has ever won a majority, every Israeli government has been a coalition.',
    linkHe: H.coalitions, linkEn: E.knesset101,
    sources: [
      src(H.coalitions, 'he', 'institute', 'types of coalitions after Israeli elections'),
      src(H.coalitionAgreements, 'he', 'institute', 'coalition agreements'),
      src(E.knesset101, 'en', 'institute', 'all governments have been coalitions; coalition agreements'),
    ],
  },
  {
    id: 'minimal-winning-coalition', nameHe: 'קואליציה מזערית זוכה', nameEn: 'Minimal winning coalition', level: 'simple', provenance: 'sourced',
    defHe: 'קואליציה שיש לה רוב, אך פרישה של כל אחת מהשותפות תבטל את הרוב. בישראל נהוג לכנות כזאת "ממשלה צרה". באפליקציה זהו חישוב אריתמטי של מנדטים בלבד, ולא תחזית פוליטית.',
    defEn: 'A coalition with a majority that would lose it if any single partner left. In Israel this is often called a “narrow government”. In the app it is pure seat arithmetic, not a political forecast.',
    linkHe: H.coalitions, linkEn: E.coalitions,
    sources: [
      src(H.coalitions, 'he', 'institute', '"קואליציה מזערית זוכה" definition; "ממשלה צרה"'),
      src(E.coalitions, 'en', 'institute', '"A minimal winning coalition" definition'),
    ],
  },
  {
    id: 'opposition', nameHe: 'אופוזיציה', nameEn: 'Opposition', level: 'standard', provenance: 'sourced',
    defHe: 'הסיעות שאינן חלק מהקואליציה, כלומר שאינן צד להסכמים המחייבים לתמוך בממשלה. בראשה עומד ראש האופוזיציה, בדרך כלל מהסיעה הגדולה ביותר שבה.',
    defEn: 'The factions outside the coalition, that is, not party to agreements committing them to support the government. It is led by the Leader of the Opposition, normally from its largest faction.',
    linkHe: KNESSET_LAW, linkEn: E.opposition,
    sources: [
      src(KNESSET_LAW, 'he', 'law', 's.11(a), (c): opposition factions and their leader'),
      src(E.knesset101, 'en', 'institute', 'opposition led by the Leader of the Opposition, usually from the largest opposition faction'),
      src(E.opposition, 'en', 'institute', 'policy paper on the opposition’s role'),
    ],
  },
  {
    id: 'majority-61', nameHe: 'רוב של 61', nameEn: 'Majority of 61', level: 'simple', provenance: 'sourced',
    defHe: '61 הם רוב מוחלט מתוך 120 חברי הכנסת. רוב כזה דרוש כדי להחליף ממשלה בהצבעת אי־אמון. להקמת ממשלה החוק מסתפק ברוב רגיל של המצביעים, אבל כמעט כל הממשלות נהנו מתמיכת 61 לפחות.',
    defEn: '61 is an absolute majority of the 120 members. It is required to replace a government by a no-confidence vote. Forming a government legally needs only more votes for than against, but almost every government has had at least 61 supporters.',
    linkHe: BL_GOV, linkEn: E.formation,
    sources: [
      src(BL_GOV, 'he', 'law', 's.28(b): no confidence by a majority of members; s.13(d): government constituted on the Knesset’s confidence'),
      src(E.formation, 'en', 'institute', 'Basic Law does not require an absolute majority at investiture; governments almost always had ≥61'),
      src(E.knesset101, 'en', 'institute', 'constructive no-confidence needs at least 61 MKs'),
    ],
  },
  {
    id: 'bloc', nameHe: 'גוש', nameEn: 'Bloc', level: 'simple', provenance: 'sourced',
    defHe: 'קבוצת רשימות שנוהגים למנות יחד בשיח הפוליטי, למשל "גוש הימין". זוהי הקבצה לא רשמית: אין לה מעמד בחוק, וגם בשיבוץ שבאפליקציה אין משמעות רשמית, ואפשר לשנות אותו.',
    defEn: 'A group of lists commonly counted together in political debate, such as the “right-wing bloc”. It is informal: blocs have no legal standing, and the app’s grouping is editable and has no official meaning.',
    linkHe: H.joint, linkEn: E.joint,
    sources: [
      src(H.joint, 'he', 'institute', 'discussion of blocs (גוש) in joint-run strategy'),
      src(E.joint, 'en', 'institute', 'centre bloc, right-wing bloc, Arab parties'),
    ],
  },
  {
    id: 'joint-list', nameHe: 'רשימה משותפת', nameEn: 'Joint list', level: 'simple', provenance: 'sourced',
    defHe: 'רשימת מועמדים אחת ששתי מפלגות או יותר מגישות יחד, ובה מצוינת השתייכותו המפלגתית של כל מועמד. לעניין אחוז החסימה וחלוקת המנדטים היא רשימה אחת, ובניגוד להסכם עודפים קולותיה נספרים יחד מההתחלה.',
    defEn: 'A single list submitted jointly by two or more parties, stating each candidate’s party. It is one list for the threshold and for seats; unlike a surplus agreement, its votes are pooled from the start.',
    linkHe: H.joint, linkEn: E.joint,
    sources: [
      src(L.s57, 'he', 'law', 's.57(b): "רשימת מועמדים משותפת" with each candidate’s party'),
      src(H.joint, 'he', 'institute', 'joint lists explainer'),
      src(E.joint, 'en', 'institute', 'legal basis (s.57); the faction may later split by party'),
    ],
  },
  {
    id: 'constituent-party', nameHe: 'מפלגה מרכיבה', nameEn: 'Constituent party', level: 'expert', provenance: 'sourced',
    defHe: 'אחת המפלגות שהגישו יחד רשימה משותפת. החוק מחייב לציין לאיזו מפלגה שייך כל מועמד, ואחרי הבחירות הסיעה המשותפת יכולה להתפצל לפי המפלגות שהרכיבו אותה.',
    defEn: 'One of the parties that jointly submitted a joint list. The law requires each candidate’s party to be stated, and after the election the joint faction may split along those party lines.',
    linkHe: L.s57, linkEn: E.joint,
    sources: [
      src(L.s57, 'he', 'law', 's.57(b): each candidate’s party affiliation'),
      src(E.joint, 'en', 'institute', 'joint faction may split into factions by party'),
    ],
  },
  {
    id: 'government-formation', nameHe: 'הרכבת הממשלה', nameEn: 'Government formation', level: 'simple', provenance: 'sourced',
    defHe: 'אחרי פרסום התוצאות הנשיא מתייעץ עם נציגי הסיעות ומטיל על חבר כנסת את התפקיד להרכיב ממשלה. יש לו 28 ימים ועוד ארכה של עד 14. הממשלה מכוננת כשהכנסת מביעה בה אמון. אם כל הניסיונות נכשלים, נערכות בחירות חדשות.',
    defEn: 'After the results are published, the President consults the factions and asks one Knesset member to form a government, with 28 days plus up to 14 more. The government takes office once the Knesset votes confidence in it. If every attempt fails, new elections are held.',
    linkHe: H.headOfState, linkEn: E.formation,
    sources: [
      src(BL_GOV, 'he', 'law', 's.7: President assigns the task after consulting factions; s.13: constitution by confidence'),
      src(H.headOfState, 'he', 'institute', 'the head of state’s role in government formation'),
      src(E.formation, 'en', 'institute', 'process, time limits, investiture'),
      src(E.president, 'en', 'institute', 'first, second and 61-MK third attempts'),
    ],
  },
  {
    id: 'norwegian-law', nameHe: 'החוק הנורבגי', nameEn: 'Norwegian Law', level: 'simple', provenance: 'sourced',
    defHe: 'הסדר בחוק־יסוד: הכנסת (סעיף 42ג) שמאפשר לשר או לסגן שר לפרוש מהכנסת, כך שהמועמד הבא ברשימה נכנס במקומו; אם יעזוב את הממשלה הוא יכול לחזור לכנסת. האפליקציה מציגה את הנבחרים בליל הבחירות ואינה מדמה החלפות כאלה.',
    defEn: 'A provision of Basic Law: The Knesset (s.42C) letting a minister or deputy minister give up their Knesset seat to the next candidate on the list, with the right to return on leaving the government. The app shows those elected on election night and does not model such replacements.',
    linkHe: H.norwegian, linkEn: E.norwegian,
    sources: [
      src(BL_KNESSET, 'he', 'law', 's.42C: a minister or deputy minister may end Knesset membership'),
      src(H.norwegian, 'he', 'institute', 'Norwegian law in Israel'),
      src(E.norwegian, 'en', 'institute', 'Norwegian law explainer'),
    ],
  },
  {
    id: 'list-order', nameHe: 'סדר המועמדים ברשימה', nameEn: 'Order of candidates', level: 'simple', provenance: 'sourced',
    defHe: 'רשימה שזכתה ב-n מנדטים מכניסה לכנסת את n המועמדים הראשונים בה, לפי הסדר שבו הוגשה (סעיף 83). "הבא בתור" הוא המועמד שייכנס אם הרשימה תזכה במנדט נוסף.',
    defEn: 'A list that wins n seats sends its first n candidates, in the order it registered them, to the Knesset (section 83). “Next in line” is the candidate who would enter if the list won one more seat.',
    linkHe: L.s83, linkEn: E.knesset101,
    sources: [
      src(L.s83, 'he', 'law', 's.83: those named at the head of the list, in order, become members'),
      src(E.knesset101, 'en', 'institute', 'closed list; order submitted in advance'),
    ],
  },
  {
    id: 'withdrawn-list', nameHe: 'רשימה שפרשה', nameEn: 'Withdrawn list', level: 'simple', provenance: 'app',
    defHe: 'רשימה שהוגשה אך פרשה מההתמודדות. באפליקציה הפתקים שלה נספרים כקולות פסולים, ולכן אינם משפיעים על אחוז החסימה או על המנדטים.',
    defEn: 'A list that was registered but pulled out of the race. In the app its ballots count as invalid, so they affect neither the threshold nor the seats.',
    linkHe: H.invalid, linkEn: E.invalid,
    sources: [
      src(H.invalid, 'he', 'institute', 'background only: invalid votes do not affect the threshold or seats (no source located for the treatment of a withdrawn list)'),
    ],
  },
  // ---- the app's own concepts ----
  {
    id: 'proportional-representation', nameHe: 'ייצוג יחסי', nameEn: 'Proportional representation', level: 'simple', provenance: 'sourced',
    defHe: 'שיטה שבה כל רשימה מקבלת מושבים בקירוב לפי חלקה בקולות: כ-10% מהקולות מקנים כ-10% מהמושבים. אחוז החסימה ושיטת חלוקת העודפים מרחיקים מעט את התוצאה מיחסיות מלאה. "ייצוג יחסי טהור" באפליקציה הוא תרחיש ניסיוני בלי חסימה ובלי הסכמים.',
    defEn: 'A system in which each list wins seats roughly in line with its vote share: about 10% of the votes gives about 10% of the seats. The threshold and the remainder method move the result slightly away from exact proportionality. The app’s “pure proportional representation” card is an experimental scenario with no threshold and no agreements.',
    linkHe: H.methods, linkEn: E.knesset101,
    sources: [
      src(BL_KNESSET, 'he', 'law', 's.4: elections are proportional'),
      src(E.knesset101, 'en', 'institute', 'party-list PR: about 10% of votes gives about 10% of seats'),
      src(E.threshold, 'en', 'institute', 'threshold as a deliberate departure from pure proportionality'),
      src(H.methods, 'he', 'institute', 'how allocation formulas affect proportionality'),
    ],
  },
  {
    id: 'historical-rules', nameHe: 'כללים היסטוריים', nameEn: 'Historical rules', level: 'standard', provenance: 'app',
    defHe: 'מצב שבו האפליקציה אוכפת את חוק הבחירות שחל באותן בחירות (מספר המושבים, אחוז החסימה, שיטת העודפים, הסכמי העודפים ומגבלת המחצית). אפשר לשנות קולות ורשימות, אבל לא את השיטה עצמה.',
    defEn: 'The mode in which the app enforces the election law in force for that election: number of seats, threshold, remainder method, surplus agreements and the half-seats cap. You can change votes and lists, but not the system itself.',
    linkHe: L.s81, linkEn: E.seats,
    sources: [
      src(L.s81, 'he', 'law', 'background: the current allocation rules (ss.81–82); earlier eras in docs/ELECTORAL-LAW.md'),
    ],
  },
  {
    id: 'experimental-rules', nameHe: 'כללים ניסיוניים', nameEn: 'Experimental rules', level: 'simple', provenance: 'app',
    defHe: 'מצב שבו אפשר לשנות את שיטת הבחירות עצמה, למשל אחוז החסימה, שיטת חלוקת המושבים או מספר הרשימות בהסכם. התוצאה היא שיטה חלופית ולא תוצאה אפשרית לפי החוק בישראל.',
    defEn: 'The mode in which you may change the electoral system itself, such as the threshold, the seat-allocation method or how many lists an agreement may join. Results describe an alternative system, not a legally possible Israeli result.',
    linkHe: H.methods, linkEn: E.methods,
    sources: [
      src(H.methods, 'he', 'institute', 'background: how other formulas change results'),
    ],
  },
  {
    id: 'seat-security', nameHe: 'עד כמה מנדט בטוח', nameEn: 'Seat security', level: 'standard', provenance: 'app',
    defHe: 'לכל רשימה: כמה קולות היא צריכה לאבד כדי לאבד מנדט, וכמה קולות נוספים דרושים למנדט הבא. המספרים מחושבים בחישוב מחדש של כל הבחירות, והם תלויים בשאלה לאן עוברים הקולות. זה איננו המודד הכללי.',
    defEn: 'For each list, how many votes it would have to lose to lose a seat, and how many more it needs for the next one. The figures come from recomputing the whole election, and they depend on where the votes move. They are not the general quota.',
    linkHe: H.seats, linkEn: E.seats,
    sources: [
      src(E.seats, 'en', 'institute', 'background: why the marginal seat depends on all lists’ remainders'),
    ],
  },
  {
    id: 'sensitivity', nameHe: 'רגישות', nameEn: 'Sensitivity', level: 'expert', provenance: 'app',
    defHe: 'כלים שבודקים איך התוצאה משתנה כשמשנים משתנה אחד: קולות של רשימה אחת בטווח, או אחוז החסימה בטווח, ומראים את הנקודות המדויקות שבהן מנדטים עוברים. אלה תרחישים ולא תחזיות.',
    defEn: 'Tools that show how the result changes as one input varies, either one list’s votes or the threshold across a range, and mark the exact points where seats change hands. They are scenarios, not forecasts.',
    linkHe: H.seats, linkEn: E.threshold,
    sources: [
      src(E.threshold, 'en', 'institute', 'background: how threshold changes affect representation'),
    ],
  },
  // ---- rule eras ----
  {
    id: 'rules-1949', nameHe: 'כללי 1949 (האספה המכוננת)', nameEn: '1949 rules (Constituent Assembly)', level: 'simple', provenance: 'sourced',
    defHe: 'הבחירות הראשונות היו לאספה המכוננת, שהפכה לכנסת הראשונה. לא נקבע אחוז חסימה; המודד היה כל הקולות הכשרים ÷ 121, ורק רשימות שזכו במודד שלם התחרו על המושבים הנותרים, לפי קולות ÷ (מושבים + 1) בלי שברים. שוויון הוכרע בהגרלה, ולא הייתה מגבלת מחצית.',
    defEn: 'The first election chose the Constituent Assembly, which became the First Knesset. There was no percentage threshold; the quota was all valid votes ÷ 121, and only lists with a whole quota competed for the remaining seats, by votes ÷ (seats + 1) with fractions dropped. Ties went to a lottery, and there was no half-seats cap.',
    linkHe: H.y1949, linkEn: E.y1949,
    sources: [
      src(LAW_1949, 'he', 'law', 'ss.30–31: quota, initial seats, highest quotients with fractions discarded, lottery (docs/ELECTORAL-LAW.md)'),
      src(H.y1949, 'he', 'institute', 'Constituent Assembly that declared itself the First Knesset; results'),
      src(E.y1949, 'en', 'institute', 'Constituent Assembly renamed the First Knesset'),
    ],
  },
  {
    id: 'candidate-cap-1977', nameHe: 'הגבלה למספר המועמדים (1977)', nameEn: 'Candidate cap (1977)', level: 'expert', provenance: 'inferred',
    defHe: 'ב-1977 רשימה של מועמד יחיד (פלאטו שרון) קיבלה קולות ליותר ממנדט אחד אך זכתה במנדט אחד, ושאר המנדטים חולקו לרשימות אחרות. האפליקציה משחזרת זאת בהגבלת המנדטים למספר המועמדים. ההליך מוסק מהתוצאה הרשמית, כי נוסח החוק המסדיר אותו לא אותר.',
    defEn: 'In 1977 a one-candidate list (Flatto-Sharon) won enough votes for more than one seat but received one, and the remaining seat went elsewhere. The app reproduces this by capping a list’s seats at its number of candidates. The procedure is inferred from the official result because the governing statutory text was not located.',
    linkHe: H.y1977, linkEn: E.y1977,
    sources: [
      src(H.y1977, 'he', 'institute', 'published 1977 result: Flatto-Sharon 35,049 votes, 1 seat'),
      src(L.s83, 'he', 'law', 's.83 names elected members in list order but sets no redistribution rule'),
    ],
  },
];
