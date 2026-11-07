# Glossary sources (info-icon definitions)

Source log for `src/app/glossary-data.ts` (`GLOSSARY_TERMS`, 48 terms; `outside-support` added 7 November 2026). All checks: **4 November 2026**,
from Israel, with `curl` (browser user agent). A check passes only when the URL returned **HTTP 200** and
the page contained the supporting passage (for the Nevo statute page, also the cited section anchor).
All **50** distinct URLs passed. The check script and its raw results are scratch
(`.backup-scratch/verify.py`, `verify/results.json`); rerun it to re-verify.

## Source policy applied

1. The statute: consolidated texts on **Nevo** (`nevo.co.il`), and original gazette PDFs from the Knesset
   legislation archive (`fs.knesset.gov.il`).
2. The **Central Elections Committee**: the official 2022 results site (`votes25.bechirot.gov.il`).
3. The **Israel Democracy Institute** (`www.idi.org.il`, `en.idi.org.il`).
4. **No Wikipedia in any language.** English Wikipedia is excluded by owner rule (4 Nov 2026). Hebrew
   Wikipedia was considered as a secondary fallback for the general method terms but proved unnecessary:
   IDI article 3498 (Hebrew) and 3302 (English) cover Hare, Droop, largest remainder, highest averages,
   D'Hondt, Sainte-Laguë and modified Sainte-Laguë.

## Sites that could not be verified (not linked)

| Site | Result on 2026-11-04 | Consequence |
|---|---|---|
| `main.knesset.gov.il`, `knesset.gov.il` (incl. the lexicon "מילון מונחים" and the English law translations) | HTTP 247: a JavaScript bot challenge (Reblaze) for both `curl` and WebFetch | Not linked; no circumvention attempted. Knesset content is reached instead via its file server `fs.knesset.gov.il` (PDFs load). |
| `www.gov.il` (incl. the archived CEC election sites under `/apps/elections/`) | HTTP 403: Cloudflare "Just a moment…" challenge | Not linked. |
| `bechirot.gov.il` (home page, `/election/about`) | Served a "page not found" page (`maintenance.gov.il`) | Not linked; the CEC results subdomain `votes25.bechirot.gov.il` loads and is used. |
| `aceproject.org` | HTTP 503 / 404 | Not linked. |
| `britannica.com` | HTTP 403 Cloudflare challenge | Not linked. |

The English-language Knesset Elections Law translation could therefore not be linked. English
"learn more" links point to IDI explainers. Statutory citations are to the Hebrew text.

## Where official sources differ from earlier app wording (the law is preferred)

* **Threshold history** (old `threshold` text listed only 1.5%/2%/3.25%). Nevo's amendment history for s.81(a)
  shows 1% → 1.5% (Amendment 23, 1991) → 2% (Amendment 51, in force 27.5.2004) → 3.25% (Amendment 62,
  19.3.2014). The 1951 law sets 1%, and the 1949 ordinance sets no percentage. The new text covers all eras.
* **1949 "threshold"**. IDI's 1949 page states "אחוז החסימה 0.83%". The ordinance sets no percentage
  threshold; 0.83% ≈ 1/121 is the effective one-quota barrier. The new text follows the law and explains the
  0.83% figure. The app's "No percentage threshold applies" is correct.
* **Majority needed to form a government**. IDI's 2013 article 10248 says a new government needs "a majority
  of the Knesset (at least 61)". Basic Law: The Government s.13(d), and IDI's 2026 article 63976, say
  confidence is enough: more votes for than against. `majority-61` follows the law. 10248 is not cited
  anywhere (7 November 2026): `minimal-winning-coalition` rests on IDI 3417 (Hebrew), with 63976 as its
  English learn-more link.
* **Name of the surplus agreement**. The statute (s.67) calls it התקשרות בין רשימות מועמדים. IDI notes that
  הסכם עודפים is the popular name. `surplus` keeps the popular name and mentions the legal one.
* **Double envelopes**. The statute's term is מעטפה חיצונית (outer envelope); IDI and the app say מעטפות
  כפולות. `envelopes` uses both.
* The old glossary had 10 ids, not 9: `valid, threshold, qualifying, unrepresented, quota, baderofer, surplus,
  listquota, cap, envelopes`. All 10 ids are kept.

## Terms without a definitional trusted source

* `withdrawn-list`: no statutory provision or CEC text was located for how a withdrawn list's ballots
  are treated. The definition describes the app's model. The link is background on invalid votes.
* `candidate-cap-1977`: the procedure is **inferred** from the published result. The statutory text was
  not located (see docs/decisions/0073). IDI's 1977 page confirms only the result (Flatto-Sharon 1 seat).
* `historical-rules`, `experimental-rules`, `seat-security`, `sensitivity`: these are the app's own modes
  and tools (`provenance: 'app'`). Their links are background, not authority.
* `cap` and `tie-lottery`: sourced to the Hebrew statute only. No English trusted source explains
  them, so the English link is the general IDI explainer.
* `rules-1949`, `largest-remainder` (1951–1969 era), `tie-lottery` (1949/1951 notes): the primary PDFs load
  (HTTP 200, valid PDF). Their clause-level reading is the one recorded in docs/ELECTORAL-LAW.md and
  decisions 0060/0063, not re-read in this task.

## Per-URL log

### חוק-יסוד: הכנסת

נבו (מאגר החקיקה) · <https://www.nevo.co.il/law_html/law00/72242.htm> · HTTP 200, 2026-11-04

- `knesset`: ss.1, 3, 4: house of representatives; 120 members; general, national, direct, equal, secret, proportional
- `knesset`: learn-more (he)
- `electoral-list`: s.5A: a list may be submitted only by a party
- `registered-voters`: s.5: every citizen aged 18 or over may vote
- `norwegian-law`: s.42C: a minister or deputy minister may end Knesset membership
- `proportional-representation`: s.4: elections are proportional

### חוק הכנסת, התשנ"ד-1994, פרק ו' (ראש האופוזיציה)

נבו (מאגר החקיקה) · <https://www.nevo.co.il/law_html/law00/72263.htm> · HTTP 200, 2026-11-04

- `opposition`: s.11(a), (c): opposition factions and their leader
- `opposition`: learn-more (he)

### חוק-יסוד: הממשלה

נבו (מאגר החקיקה) · <https://www.nevo.co.il/law_html/law00/73690.htm> · HTTP 200, 2026-11-04

- `majority-61`: s.28(b): no confidence by a majority of members; s.13(d): government constituted on the Knesset’s confidence
- `majority-61`: learn-more (he)
- `government-formation`: s.7: President assigns the task after consulting factions; s.13: constitution by confidence
- `outside-support`: s.13(d): the government is constituted when the Knesset expresses confidence; no special majority (checked 7 November 2026)

### חוק הבחירות לכנסת [נוסח משולב], התשכ"ט-1969, סעיף 61 (כינוי ואות של רשימה)

נבו (מאגר החקיקה) · <https://www.nevo.co.il/law_html/law01/190_026.htm#Seif103> · HTTP 200, 2026-11-04

- `ballot-letters`: s.61(a)–(b): a name with up to three Hebrew letters; priority for parties in the outgoing Knesset
- `ballot-letters`: learn-more (he)

### חוק הבחירות לכנסת [נוסח משולב], התשכ"ט-1969, סעיף 67 (התקשרות בין רשימות)

נבו (מאגר החקיקה) · <https://www.nevo.co.il/law_html/law01/190_026.htm#Seif108> · HTTP 200, 2026-11-04

- `surplus`: s.67(a): a list may connect with one other list only; effect only as in s.82

### חוק הבחירות לכנסת [נוסח משולב], התשכ"ט-1969, סעיף 68 (מקום קלפי)

נבו (מאגר החקיקה) · <https://www.nevo.co.il/law_html/law01/190_026.htm#Seif109> · HTTP 200, 2026-11-04

- `polling-station`: s.68(a): one ballot box per polling area

### חוק הבחירות לכנסת [נוסח משולב], התשכ"ט-1969, סעיף 68א ואילך (הצבעה מחוץ לקלפי הרגילה)

נבו (מאגר החקיקה) · <https://www.nevo.co.il/law_html/law01/190_026.htm#Seif110> · HTTP 200, 2026-11-04

- `envelopes`: ss.68A–68B, 91, 116B ff.: voting by outer envelope

### חוק הבחירות לכנסת [נוסח משולב], התשכ"ט-1969, סעיף 78 (קולות פסולים)

נבו (מאגר החקיקה) · <https://www.nevo.co.il/law_html/law01/190_026.htm#Seif123> · HTTP 200, 2026-11-04

- `invalid-votes`: s.78: grounds for invalid votes

### חוק הבחירות לכנסת [נוסח משולב], התשכ"ט-1969, סעיף 81 (חלוקת המנדטים)

נבו (מאגר החקיקה) · <https://www.nevo.co.il/law_html/law01/190_026.htm#Seif126> · HTTP 200, 2026-11-04

- `valid`: s.81(a): threshold is a share of all valid votes
- `threshold`: s.81(a) and amendment history on the page: 1% → 1.5% (Amendment 23, 1991) → 2% (Amendment 51, in force 27.5.2004) → 3.25% (Amendment 62, 19.3.2014)
- `qualifying`: s.81(b): valid votes of all lists taking part in the allocation
- `qualifying`: learn-more (he)
- `quota`: s.81(b)–(c): integer quotient is "המודד"; one seat per whole quota
- `whole-quota-seats`: s.81(c)
- `remainder-seats`: s.81(d): seats remaining after (c)
- `baderofer`: s.81(d)(1)–(3): list quotient, highest wins, repeated
- `listquota`: s.81(d)(1): "מודד רשימה"
- `listquota`: learn-more (he)
- `hare-quota`: s.81(b): qualifying votes ÷ seats, integer part
- `cap`: s.81(d)(4)
- `cap`: learn-more (he)
- `tie-lottery`: s.81(d)(2): equal list quotients decided by a CEC lottery
- `tie-lottery`: learn-more (he)
- `historical-rules`: background: the current allocation rules (ss.81–82); earlier eras in docs/ELECTORAL-LAW.md
- `historical-rules`: learn-more (he)

### חוק הבחירות לכנסת [נוסח משולב], התשכ"ט-1969, סעיף 82 (רשימות קשורות)

נבו (מאגר החקיקה) · <https://www.nevo.co.il/law_html/law01/190_026.htm#Seif127> · HTTP 200, 2026-11-04

- `surplus`: s.82(a)–(b): combined only for s.81(d), only if both pass the threshold; internal re-division by s.81

### חוק הבחירות לכנסת [נוסח משולב], התשכ"ט-1969, סעיף 83 (קביעת חברי הכנסת)

נבו (מאגר החקיקה) · <https://www.nevo.co.il/law_html/law01/190_026.htm#Seif128> · HTTP 200, 2026-11-04

- `list-order`: s.83: those named at the head of the list, in order, become members
- `list-order`: learn-more (he)
- `candidate-cap-1977`: s.83 names elected members in list order but sets no redistribution rule

### חוק הבחירות לכנסת [נוסח משולב], התשכ"ט-1969, סעיף 26 (פנקס הבוחרים)

נבו (מאגר החקיקה) · <https://www.nevo.co.il/law_html/law01/190_026.htm#Seif13> · HTTP 200, 2026-11-04

- `registered-voters`: s.26: register of citizens resident in the Population Registry, 18 by election day, by polling area
- `registered-voters`: learn-more (he)

### חוק הבחירות לכנסת [נוסח משולב], התשכ"ט-1969, סעיף 57 (הגשת רשימות מועמדים)

נבו (מאגר החקיקה) · <https://www.nevo.co.il/law_html/law01/190_026.htm#Seif149> · HTTP 200, 2026-11-04

- `electoral-list`: s.57(a): up to 120 names, each with a serial number
- `electoral-list`: learn-more (he)
- `joint-list`: s.57(b): "רשימת מועמדים משותפת" with each candidate’s party
- `constituent-party`: s.57(b): each candidate’s party affiliation
- `constituent-party`: learn-more (he)

### חוק הבחירות לכנסת [נוסח משולב], התשכ"ט-1969, סעיף 14 (אזור בחירה אחד)

נבו (מאגר החקיקה) · <https://www.nevo.co.il/law_html/law01/190_026.htm#Seif2> · HTTP 200, 2026-11-04

- `knesset`: s.14: the whole country is one area for election results

### חוק הבחירות לכנסת [נוסח משולב], התשכ"ט-1969, סעיפים 16–17 (הוועדה המרכזית)

נבו (מאגר החקיקה) · <https://www.nevo.co.il/law_html/law01/190_026.htm#Seif4> · HTTP 200, 2026-11-04

- `cec`: ss.16–17: members are faction representatives; chair is a Supreme Court justice

### חוק הבחירות לכנסת [נוסח משולב], התשכ"ט-1969, סעיפים 9–11 (אזורי קלפי)

נבו (מאגר החקיקה) · <https://www.nevo.co.il/law_html/law01/190_026.htm#Seif94> · HTTP 200, 2026-11-04

- `locality`: s.10: a polling area includes no more than one locality
- `polling-station`: ss.9–11: polling areas, one locality, at most 800 voters

### פקודת הבחירות לאספה המכוננת (עיתון רשמי 33, תוספת א'), ס' 30–31

הכנסת – ארכיון החקיקה · <https://fs.knesset.gov.il/0/law/0_lsr_312706.pdf> · HTTP 200, 2026-11-04

- `threshold`: 1949 ordinance: no percentage threshold; only lists with a whole quota compete for further seats
- `quota`: 1949: quota from all valid votes ÷ 121 (see docs/ELECTORAL-LAW.md)
- `droop-quota`: 1949 divisor 121 (docs/ELECTORAL-LAW.md)
- `tie-lottery`: 1949 s.30: lottery for equal integer quotients (docs/ELECTORAL-LAW.md)
- `rules-1949`: ss.30–31: quota, initial seats, highest quotients with fractions discarded, lottery (docs/ELECTORAL-LAW.md)

### חוק הבחירות לכנסת, 1951 (ס"ח 74 עמ' 116), ס' 38–40

הכנסת – ארכיון החקיקה · <https://fs.knesset.gov.il/1/law/1_lsr_208018.pdf> · HTTP 200, 2026-11-04

- `threshold`: 1951 law: 1% threshold
- `remainder-seats`: 1951–1969: largest unused remainders
- `largest-remainder`: 1951 law ss.38–40: largest unused remainders, one additional seat per competing list
- `tie-lottery`: allocation clauses contain no tie rule for equal remainders (docs/ELECTORAL-LAW.md)

### חוק הבחירות לכנסת (תיקון מס' 4), 1973 (ס"ח 692 עמ' 108)

הכנסת – ארכיון החקיקה · <https://fs.knesset.gov.il/7/law/7_lsr_211799.pdf> · HTTP 200, 2026-11-04

- `baderofer`: Amendment No. 4 (1973) introduced the present s.81(d)
- `cap`: introduced by Amendment No. 4, 1973

### תוצאות הבחירות לכנסת ה-25 – תוצאות ארציות

ועדת הבחירות המרכזית לכנסת · <https://votes25.bechirot.gov.il/> · HTTP 200, 2026-11-04

- `ballot-letters`: results table column "אותיות הרשימה"
- `registered-voters`: published total "סה"כ בעלי זכות בחירה"
- `turnout`: national totals: registered voters, votes cast and turnout (70.63% in 2022)
- `turnout`: learn-more (he)
- `polling-station`: results by polling station ("תוצאות לפי קלפיות")

### תוצאות הבחירות לכנסת ה-25 – תוצאות לפי יישובים

ועדת הבחירות המרכזית לכנסת · <https://votes25.bechirot.gov.il/cityresults> · HTTP 200, 2026-11-04

- `locality`: official results by locality
- `locality`: learn-more (he)

### החוק הנורווגי במציאות הישראלית

המכון הישראלי לדמוקרטיה · <https://www.idi.org.il/articles/26069> · HTTP 200, 2026-11-04

- `norwegian-law`: Norwegian law in Israel
- `norwegian-law`: learn-more (he)

### המדריך המלא להסכמים קואליציוניים

המכון הישראלי לדמוקרטיה · <https://www.idi.org.il/articles/26572> · HTTP 200, 2026-11-04

- `coalition`: coalition agreements

### תפקידם של ראשי מדינה בתהליך הרכבת הממשלה

המכון הישראלי לדמוקרטיה · <https://www.idi.org.il/articles/30937> · HTTP 200, 2026-11-04

- `government-formation`: the head of state’s role in government formation
- `government-formation`: learn-more (he)

### כל מה שרציתם לדעת על הסכמי עודפים

המכון הישראלי לדמוקרטיה · <https://www.idi.org.il/articles/33757> · HTTP 200, 2026-11-04

- `whole-quota-seats`: 112 seats allocated in the first round in 2021
- `remainder-seats`: surplus seats are those left after the first round
- `remainder-seats`: learn-more (he)
- `baderofer`: adopted in the 1973 Bader–Ofer law, partly to strengthen large parties
- `listquota`: the "מודד לרשימה" formula; pairs use combined votes and seats
- `surplus`: explainer, including which partner gets the extra seat
- `surplus`: learn-more (he)

### משחקי הכסא: על קואליציות לאחר בחירות בישראל

המכון הישראלי לדמוקרטיה · <https://www.idi.org.il/articles/3417> · HTTP 200, 2026-11-04

- `coalition`: types of coalitions after Israeli elections
- `coalition`: learn-more (he)
- `minimal-winning-coalition`: "קואליציה מזערית זוכה" definition; "ממשלה צרה"
- `minimal-winning-coalition`: learn-more (he)
- `outside-support`: "תמיכה מבחוץ של המפלגות הערביות" sustaining Rabin’s minority government after 1993 (checked 7 November 2026)
- `outside-support`: learn-more (he)

### מי מנצח בבחירות? תלוי איך סופרים את הקולות

המכון הישראלי לדמוקרטיה · <https://www.idi.org.il/articles/3498> · HTTP 200, 2026-11-04

- `dhondt`: D'Hondt: votes ÷ (seats so far + 1); favours large parties
- `dhondt`: learn-more (he)
- `highest-averages`: "שיטת הממוצע הגדול ביותר" section
- `highest-averages`: learn-more (he)
- `largest-remainder`: "שיטת העודף הגדול ביותר" with Hare quota example
- `largest-remainder`: learn-more (he)
- `hare-quota`: "מכסת הייר" definition
- `hare-quota`: learn-more (he)
- `droop-quota`: "מכסת דרופ" definition
- `droop-quota`: learn-more (he)
- `sainte-lague`: "שיטת סנט לגואה": divisors 1, 3, 5…
- `sainte-lague`: learn-more (he)
- `modified-sainte-lague`: "שיטת סנט לגואה המשופרת": divisors 1.4, 3, 5, 7
- `modified-sainte-lague`: learn-more (he)
- `proportional-representation`: how allocation formulas affect proportionality
- `proportional-representation`: learn-more (he)
- `experimental-rules`: background: how other formulas change results
- `experimental-rules`: learn-more (he)

### ריצה ברשימות משותפות בבחירות: למי זה טוב?

המכון הישראלי לדמוקרטיה · <https://www.idi.org.il/articles/63813> · HTTP 200, 2026-11-04

- `bloc`: discussion of blocs (גוש) in joint-run strategy
- `bloc`: learn-more (he)
- `joint-list`: joint lists explainer
- `joint-list`: learn-more (he)

### מהי ועדת הבחירות המרכזית ואיך היא פועלת?

המכון הישראלי לדמוקרטיה · <https://www.idi.org.il/articles/65164> · HTTP 200, 2026-11-04

- `cec`: what the CEC is and how it works
- `cec`: learn-more (he)

### איך קולות הופכים למנדטים? (כולל מילון מונחים)

המכון הישראלי לדמוקרטיה · <https://www.idi.org.il/articles/65170> · HTTP 200, 2026-11-04

- `valid`: glossary: valid votes = votes counted after deducting invalid votes
- `valid`: learn-more (he)
- `threshold`: 3.25% since 2015; the vote count needed varies with turnout and invalid votes
- `threshold`: learn-more (he)
- `quota`: the quota: votes of qualifying lists ÷ 120 (36,227 in 2022)
- `quota`: learn-more (he)
- `whole-quota-seats`: learn-more (he)
- `baderofer`: remaining seats by the method known as Bader–Ofer
- `baderofer`: learn-more (he)
- `surplus`: "הסכמי עודפים" is the popular name for the s.67 connection
- `envelopes`: glossary entry "מעטפות כפולות (מעטפות חיצוניות)"
- `seat-security`: learn-more (he)
- `sensitivity`: learn-more (he)

### לאן הולכים הקולות הפסולים?

המכון הישראלי לדמוקרטיה · <https://www.idi.org.il/articles/66309> · HTTP 200, 2026-11-04

- `invalid-votes`: invalid votes ignored for the threshold; they only affect published turnout
- `invalid-votes`: learn-more (he)
- `unrepresented`: difference between invalid and wasted votes
- `unrepresented`: learn-more (he)
- `withdrawn-list`: background only: invalid votes do not affect the threshold or seats (no source located for the treatment of a withdrawn list)
- `withdrawn-list`: learn-more (he)

### יום הבחירות לכנסת ה-26: כל מה שהבוחר צריך לדעת

המכון הישראלי לדמוקרטיה · <https://www.idi.org.il/articles/66720> · HTTP 200, 2026-11-04

- `envelopes`: who may vote in double envelopes
- `envelopes`: learn-more (he)
- `polling-station`: learn-more (he)

### בחירות 1949

המכון הישראלי לדמוקרטיה · <https://www.idi.org.il/policy/parties-and-elections/elections/1949/> · HTTP 200, 2026-11-04

- `threshold`: IDI lists the 1949 "threshold" as 0.83%, the effective one-quota barrier (1/121)
- `rules-1949`: Constituent Assembly that declared itself the First Knesset; results
- `rules-1949`: learn-more (he)

### בחירות 1977

המכון הישראלי לדמוקרטיה · <https://www.idi.org.il/policy/parties-and-elections/elections/1977/> · HTTP 200, 2026-11-04

- `candidate-cap-1977`: published 1977 result: Flatto-Sharon 35,049 votes, 1 seat
- `candidate-cap-1977`: learn-more (he)

### Who Wins the Israeli Election? That Depends on How You Count the Votes

Israel Democracy Institute · <https://en.idi.org.il/articles/3302> · HTTP 200, 2026-11-04

- `dhondt`: D'Hondt divisors 1, 2, 3…; worked example
- `dhondt`: learn-more (en)
- `highest-averages`: "The Largest Average System" section
- `highest-averages`: learn-more (en)
- `largest-remainder`: "The Largest Remainder System" section
- `largest-remainder`: learn-more (en)
- `hare-quota`: "The Hare Quota" section
- `hare-quota`: learn-more (en)
- `droop-quota`: "The Droop Quota" section
- `droop-quota`: learn-more (en)
- `sainte-lague`: "The Sainte Laguë System" section
- `sainte-lague`: learn-more (en)
- `modified-sainte-lague`: modified Sainte-Laguë, divisors 1.4, 3, 5, 7; Norway and Sweden
- `modified-sainte-lague`: learn-more (en)
- `experimental-rules`: learn-more (en)

### Vote-Sharing Agreements

Israel Democracy Institute · <https://en.idi.org.il/articles/47485> · HTTP 200, 2026-11-04

- `listquota`: the "list indicator"
- `listquota`: learn-more (en)
- `surplus`: Vote-sharing agreements explainer
- `surplus`: learn-more (en)

### The “Norwegian Law”: Problematic, Yes—But a Necessary Evil

Israel Democracy Institute · <https://en.idi.org.il/articles/48367> · HTTP 200, 2026-11-04

- `norwegian-law`: Norwegian law explainer
- `norwegian-law`: learn-more (en)

### The Electoral Threshold, Wasted Votes, and Proportionality

Israel Democracy Institute · <https://en.idi.org.il/articles/5225> · HTTP 200, 2026-11-04

- `threshold`: history: 1% to 1988, 1.5% 1992–2003, 2% for three elections, 3.25% from 2014
- `threshold`: learn-more (en)
- `unrepresented`: threshold, wasted votes and proportionality
- `proportional-representation`: threshold as a deliberate departure from pure proportionality
- `sensitivity`: background: how threshold changes affect representation
- `sensitivity`: learn-more (en)

### How Votes Become Knesset Seats

Israel Democracy Institute · <https://en.idi.org.il/articles/63750> · HTTP 200, 2026-11-04

- `valid`: step one: invalid votes subtracted to obtain valid votes
- `valid`: learn-more (en)
- `qualifying`: step three: votes of lists below the threshold are subtracted
- `qualifying`: learn-more (en)
- `quota`: step four: the seat quota
- `quota`: learn-more (en)
- `whole-quota-seats`: step five: first allocation (113 in 2022)
- `whole-quota-seats`: learn-more (en)
- `remainder-seats`: step six: remaining (surplus) seats
- `remainder-seats`: learn-more (en)
- `baderofer`: remaining seats allocated by the D’Hondt highest-average formula
- `baderofer`: learn-more (en)
- `dhondt`: Israel’s remaining seats use the D’Hondt formula
- `cap`: learn-more (en)
- `tie-lottery`: learn-more (en)
- `historical-rules`: learn-more (en)
- `seat-security`: background: why the marginal seat depends on all lists’ remainders
- `seat-security`: learn-more (en)

### Everything You Need to Know About How a Government is Formed Following Elections

Israel Democracy Institute · <https://en.idi.org.il/articles/63976> · HTTP 200, 2026-11-04

- `majority-61`: Basic Law does not require an absolute majority at investiture; governments almost always had ≥61
- `majority-61`: learn-more (en)
- `government-formation`: process, time limits, investiture
- `government-formation`: learn-more (en)
- `minimal-winning-coalition`: learn-more (en; added 7 November 2026, replacing 10248)
- `outside-support`: learn-more (en)
- `outside-support`: "the law allows for the establishment of a minority government, if the relative majority that will support it is larger than the minority which opposes it" (checked 7 November 2026)

### Explainer: Running on joint lists in elections: who does it benefit?

Israel Democracy Institute · <https://en.idi.org.il/articles/64020> · HTTP 200, 2026-11-04

- `bloc`: centre bloc, right-wing bloc, Arab parties
- `bloc`: learn-more (en)
- `joint-list`: legal basis (s.57); the faction may later split by party
- `joint-list`: learn-more (en)
- `constituent-party`: joint faction may split into factions by party
- `constituent-party`: learn-more (en)

### Knesset 101: How Parliament and National Elections Work in Israel

Israel Democracy Institute · <https://en.idi.org.il/articles/64066> · HTTP 200, 2026-11-04

- `knesset`: unicameral 120-member parliament elected in one nationwide constituency
- `knesset`: learn-more (en)
- `electoral-list`: closed party-list system; order submitted in advance to the CEC
- `electoral-list`: learn-more (en)
- `polling-station`: voters assigned in advance to a polling station by registered residence
- `coalition`: all governments have been coalitions; coalition agreements
- `coalition`: learn-more (en)
- `opposition`: opposition led by the Leader of the Opposition, usually from the largest opposition faction
- `majority-61`: constructive no-confidence needs at least 61 MKs
- `list-order`: closed list; order submitted in advance
- `list-order`: learn-more (en)
- `proportional-representation`: party-list PR: about 10% of votes gives about 10% of seats
- `proportional-representation`: learn-more (en)

### The Central Elections Committee: What You Need to Know Ahead of the 2026 Elections

Israel Democracy Institute · <https://en.idi.org.il/articles/65189> · HTTP 200, 2026-11-04

- `cec`: judicial chair, administrative staff, political plenum
- `cec`: learn-more (en)

### What Happens to Invalid Votes?

Israel Democracy Institute · <https://en.idi.org.il/articles/66508> · HTTP 200, 2026-11-04

- `invalid-votes`: grounds under s.78; the only public measure invalid votes affect is turnout
- `invalid-votes`: learn-more (en)
- `turnout`: invalid votes are included in turnout as reported by the CEC
- `unrepresented`: "wasted votes": valid votes for lists below the threshold; included in the threshold base (8.8% in 2022)
- `unrepresented`: learn-more (en)
- `envelopes`: double-envelope procedure; counted after checking for double voting
- `envelopes`: learn-more (en)
- `withdrawn-list`: learn-more (en)

### Election Day for the 26th Knesset: Everything Voters Need to Know

Israel Democracy Institute · <https://en.idi.org.il/articles/66721> · HTTP 200, 2026-11-04

- `ballot-letters`: each slip bears the list’s name and its identifying letter or letters
- `ballot-letters`: learn-more (en)
- `registered-voters`: eligibility: citizen, 18 by election day, listed in the electoral register
- `registered-voters`: learn-more (en)
- `turnout`: CEC publishes turnout during election day, per polling station
- `turnout`: learn-more (en)
- `locality`: learn-more (en)
- `polling-station`: learn-more (en)

### The President’s Role in Assigning the Task of Forming a Government

Israel Democracy Institute · <https://en.idi.org.il/articles/67022> · HTTP 200, 2026-11-04

- `government-formation`: first, second and 61-MK third attempts

### 1949 elections

Israel Democracy Institute · <https://en.idi.org.il/israeli-elections-and-parties/elections/1949/> · HTTP 200, 2026-11-04

- `rules-1949`: Constituent Assembly renamed the First Knesset
- `rules-1949`: learn-more (en)

### 1977 elections

Israel Democracy Institute · <https://en.idi.org.il/israeli-elections-and-parties/elections/1977/> · HTTP 200, 2026-11-04

- `candidate-cap-1977`: learn-more (en)

### The Role of the Opposition in the Knesset

Israel Democracy Institute · <https://en.idi.org.il/publications/6858> · HTTP 200, 2026-11-04

- `opposition`: policy paper on the opposition’s role
- `opposition`: learn-more (en)

