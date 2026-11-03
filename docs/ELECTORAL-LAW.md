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
