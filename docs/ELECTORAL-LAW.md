# The seat-allocation law implemented by the engine

Source: Knesset Elections Law [Consolidated Version], 5729-1969 (חוק הבחירות לכנסת [נוסח משולב], התשכ"ט-1969),
sections 67, 81–83, as in force for the 20th–26th Knessets (threshold set by Amendment 62, 2014).
Israeli statutes are not subject to copyright (Copyright Law 5768-2007, s. 6).

## Text (Hebrew, verbatim)

> **67.** (א) רשימות מועמדים רשאיות להתקשר ביניהן לשם חלוקת המנדטים, אך אין רשימה רשאית להתקשר אלא עם רשימה אחת בלבד, ואין תוצאה להתקשרות אלא זו הקבועה בסעיף 82.
>
> **81.** (א) בחלוקת המנדטים ישתתפו רק רשימות מועמדים שקיבלו, כל אחת, קולות כשרים במספר שאינו פחות מ-3.25% (שלושה אחוזים ורבע) מסך כל הקולות הכשרים.
> (ב) סך כל הקולות הכשרים של כל הרשימות המשתתפות בחלוקת המנדטים יחולק למספר חברי הכנסת, והמספר השלם היוצא מן החילוק יהיה "המודד".
> (ג) כל רשימה המשתתפת בחלוקת המנדטים תזכה במספר מנדטים כמספר השלם היוצא מחילוק קולותיה הכשרים במודד.
> (ד) המנדטים שנותרו אחרי חלוקת המנדטים לפי סעיף קטן (ג) יחולקו בין הרשימות המשתתפות בחלוקת המנדטים באופן זה:
> (1) לכל רשימה ייקבע "מודד רשימה" על ידי חילוק מספר הקולות הכשרים שקיבלה למספר המנדטים שזכתה בהם לפי סעיף קטן (ג) נוסף אחד;
> (2) הרשימה שקיבלה את מודד הרשימה הגדול ביותר, תזכה במנדט נוסף; היו לשתי רשימות או יותר מודדי רשימה שווים, תכריע הגרלה שתערוך הועדה המרכזית, איזו מהן תזכה במנדט הנוסף;
> (3) החלוקה לפי הוראות פסקאות (1) ו-(2) תימשך עד שיחולקו כל המנדטים, כשלרשימה שזכתה במנדט נוסף לפי פסקה (2) ייקבע מודד רשימה חדש בהתחשב במנדט הנוסף;
> (4) רשימה שלא קיבלה יותר ממחצית כל הקולות הכשרים של כל הרשימות המשתתפות בחלוקת המנדטים, וזכתה במחצית כל המנדטים, לא תוסיף להשתתף בחלוקת המנדטים, והחלוקה תימשך בין הרשימות האחרות.
>
> **82.** (א) שתי רשימות מועמדים שהתקשרו ביניהן ייחשבו לענין חלוקת המנדטים לפי סעיף 81(ד) כרשימה אחת בעלת מספר הקולות הכשרים שקיבלו שתיהן יחד ובעלת המנדטים שזכו בהם שתיהן יחד, ובלבד שכל אחת מהם בפני עצמה קיבלה את אחוז הקולות הקבוע בסעיף 81(א).
> (ב) המנדטים שזכו בהם שתי הרשימות הקשורות יחולקו ביניהן לפי שיטת החלוקה הקבועה בסעיף 81 לגבי חלוקת כל המנדטים בין כל הרשימות.
>
> **83.** רשימת מועמדים שזכתה במנדטים, יהיו האנשים ששמותיהם נקובים בראש הרשימה, בזה אחר זה, חברי הכנסת.

## How each clause maps to code (`src/engine/allocate.ts`)

| Clause | Implementation |
|---|---|
| 81(a) threshold | `votes × 400 ≥ 13 × total valid` (exact integers; 3.25% = 13/400). Total valid includes lists that fail. |
| 81(b) quota | `⌊qualifying votes ÷ 120⌋` |
| 81(c) whole-quota seats | `⌊votes ÷ quota⌋` per list |
| 81(d)(1–3) Bader–Ofer | each remaining seat to the highest `votes ÷ (seats + 1)`, compared as exact fractions; recomputed after every seat |
| 81(d)(2) ties | flagged `lottery-required`; the user may record the lottery outcome (`lotteryWinners`) |
| 81(d)(4) half-seats cap | a unit with `2 × votes ≤ qualifying` and `2 × seats ≥ 120` stops receiving remainder seats |
| 67(a), 82(a) agreements | exactly two lists; one agreement per list; effective only if both pass 81(a); combined only in the 81(d) stage |
| 82(b) internal division | the pair's seats are re-divided from scratch by the whole of section 81 (pair quota, whole seats, Bader–Ofer, cap) |
| 83 elected members | the first *n* candidates on the list as registered |

Notes on interpretation, each covered by tests (`tests/engine.test.ts`):

* The half-seats cap within a pair is applied with the pair as the universe ("לפי שיטת החלוקה הקבועה בסעיף 81").
* With very small hypothetical vote totals the whole-number quota can give more whole-quota seats than exist; the statute
  does not cover this, so the engine warns (`quota-over-allocation`) and uses the exact quota. This never arises with real
  Knesset vote totals.
* A pair may end with fewer seats for one partner than that partner's own whole-quota seats; 82(b) mandates this re-division and the engine reports it (`internal-loss`).

## Validation

* 25th Knesset (2022): every list's seats equal the official CEC result; quota 36,227; 113 whole-quota seats and 7 remainder seats; threshold 154,855 votes.
* 26th Knesset (2026): the result equals the seat counts reported from the CEC final count (Likud 27, Yashar! 21, Together 12, Joint List 11, Democrats 8, Ra'am 8, Otzma Yehudit 7, UTJ 7, Yisrael Beiteinu 7, Religious Zionism–Zehut 6, Shas 6); quota 44,873; 5 remainder seats.
* Without agreements and with an exact quota, Bader–Ofer equals D'Hondt; 200 random elections are cross-checked against an independent D'Hondt implementation.

## Earlier statutory eras (Knessets 16–24)

The engine now defines three exact presets. All retain Bader–Ofer, 120 seats, the floor
quota, two-list agreements effective only when both lists qualify, and the statutory
majority cap. The changed parameter is the qualifying threshold:

| Election | Preset | Exact threshold |
|---|---|---|
| 16 (2003) | `il-1992-bader-ofer-1.5` | 3/200 = 1.5% |
| 17–19 (2006–2013) | `il-2004-bader-ofer-2` | 1/50 = 2% |
| 20–26 (2015 onward) | `il-2014-bader-ofer-3.25` | 13/400 = 3.25% |

The Knesset's [threshold history](https://main.knesset.gov.il/About/Lexicon/pages/qualifying-threshold.aspx)
identifies the 1992 change, May 2004 change, and 11 March 2014 change. The CEC's
[2006 electoral-system explanation](https://www.gov.il/apps/elections/elections-knesset-17/heb/about/ElectoralSystem.html)
explicitly describes the change from 1.5% to 2% during the 16th Knesset. Thus the
2004 change applies to the **17th election**, not retroactively to the 2003 election.
The Knesset Research and Information Center's
[2021 research note](https://fs.knesset.gov.il/globaldocs/MMM/d5c6ad87-7f7a-eb11-810c-00155d0aee38/2_d5c6ad87-7f7a-eb11-810c-00155d0aee38_11_17733.pdf)
also explicitly places the 1.5% era at elections 13–16.

These are institutional historical descriptions. Historical amendment texts and every
other clause's point-in-time wording have **not** yet been compared exhaustively.
No additional allocation-method difference has been established in this implementation.

`historicalRules()` resolves each preset; returning from experimental mode restores the
election's era, using its historical base scenario when provided. Tests cover that rule
plumbing for each election id. They do **not** establish seat reproduction for Knessets
16–24: those datasets remain unreleased pending the checks in DATA.md.

### Knessets 16–17: checked clauses and archive-date limitation

For **2003**, use `ISRAEL_1992` (1.5%). The CEC's
[2003 allocation explanation](https://www.gov.il/apps/elections/elections-knesset-16/heb/about/seats_system.html)
explicitly states 1.5% and describes the general quota, pair competition and internal
re-division. Caution: the [law page in the 2003 archive](https://www.gov.il/apps/elections/elections-knesset-16/heb/laws/elections_law.html)
currently includes Amendment 51 and **2%**; it was updated after that election. Its URL
is not evidence of point-in-time wording. No additional modeled rule difference was found,
but a complete pre-2003 amendment-chain comparison remains unverified.

For **2006**, use `ISRAEL_2004` (2%). The CEC's
[consolidated law, updated 1 January 2006](https://www.gov.il/apps/elections/elections-knesset-17/heb/law/ElectionLaw.html),
section 81(a), states 2%. Sections 81(b), 81(d)(4) and 82(a–b) retain the floor quota,
half-seats cap, both-partners-qualify condition, remainder-stage combination and full
internal re-division modeled today. The indexed statutory text was inspected; direct HTML
retrieval returned 403. No additional parameter change is supported by this evidence.
Decision [0051](decisions/0051-k16-k17-historical-allocation-evidence.md) records the limits.

The new k16/k17 tests exercise actual historical national vote fixtures and reproduce all
gazetted seats, with thresholds **47,226 / 62,742** and quotas **25,138 / 24,619**.
They are explicitly research fixtures: both elections remain unavailable because gazette
figures conflict with polling data, full candidate rosters are unverified and required
locality fields are missing. Successful allocation does not clear those release gates.

## Knessets 13–15 (1992–1999)

All three elections map to `ISRAEL_1992`: exact threshold **3/200**, 120 seats,
floor quota, Bader–Ofer, the half-seats cap, and two-list agreements requiring both
partners to qualify. The original [1991 Amendment No. 23](https://fs.knesset.gov.il/12/law/12_lsr_210711.PDF)
changes section 81(a) to 1.5%. The original [1973 Amendment No. 4](https://fs.knesset.gov.il/7/law/7_lsr_211799.pdf)
expressly establishes section 81(d)'s highest quotients, lottery and half-seats cap.
Both are retained and hashed in the research manifest and k13–k15 source entries.

The recovered agreement notices for 1996 and 1999 are section 67 publications of
six and nine pairs respectively. Current agreement behavior agrees with the CEC's
sections 67/82 text; a complete point-in-time intervening amendment-chain audit is
**not complete**. See decision [0082](decisions/0082-k13-k15-rule-era-evidence.md)
for exactly what was checked and why result reproduction is not statutory proof.

Research fixtures reproduce every gazetted seat with thresholds/quotas **39,253 /
20,715** (1992), **45,782 / 24,779** (1996), **49,642 / 25,936** (1999). All fill
120 seats and need no lottery. The 1992 fixture uses only sourced inputs: no agreement
notice was found, and no agreement was inferred. This reproduces seats but does not
establish agreement completeness. Candidate coverage still blocks all three releases;
no public election datasets are emitted. Tests also exercise historical rule reset and
scenario import for ids k13–k15, independently of the real-seat checks.
