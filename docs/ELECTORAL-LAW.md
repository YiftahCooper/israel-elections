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

## 1949: Constituent Assembly ordinance

The [primary ordinance](https://fs.knesset.gov.il/0/law/0_lsr_312706.pdf), Official
Gazette 33, supplement A, p.57 (PDF p.6), ss.30–31, defines a different method.
`ISRAEL_1949` (`il-1949-highest-average-0`) has **no statutory percentage threshold**:
`thresholdPct: '0'` represents that absence. The general quota is
`floor(all valid votes / 121)`; each list initially receives whole quotas.
Only lists with an initial seat compete for further seats, repeatedly awarded by
`votes / (current seats + 1)`. Section 30(c)(3) requires **discarding fractions
before comparing**; equal integer quotients require a CEC lottery. There is no
half-seats cap in these clauses.

Two connected lists are one remainder competitor only if **each already has an
initial seat**. Their summed initial seats and votes enter that stage; their total
seats are then divided afresh by s.30, including a pair quota whose divisor is the
pair's seats **plus one**. Section 26 limits each list to one connection. The
[21 January 1949 amendment](https://fs.knesset.gov.il/0/law/0_lsr_312737.pdf), s.1(c),
changes publication of connections to **daily newspapers at least a day before
voting**. A gazette-only search cannot establish the election-day set.

The engine options are `quotaSeatOffset: 1`, `remainderRequiresInitialSeat: true`,
`agreementRequiresInitialSeat: true`, and `quotientRounding: 'floor'`. All default
to modern semantics when omitted. The existing highest-average implementation is
reused; its `bader-ofer` method name does not date that later legislation to 1949.
Registered order governs election of candidates (s.32(a)); s.32(b) provides
replacement by the next candidate when someone resigns, dies or becomes ineligible.
The 1949 results explicitly record withdrawals, so the reviewed roster maps the
published elected names back to registered ranks without rewriting those ranks.
No express candidate-shortage redistribution rule was located. Quota over-allocation
uses a warned **simulation fallback**, not a verified statutory remedy.

The [official CEC calculation appendix](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/memorandum-knesset1/he/archive_knesset1_memorandum-apdx1.pdf),
printed p.5 / PDF p.6, supplies all five actual connections: **ב–ל, ט–יג, יא–יד,
מ–ת, ס–צ**. Only the first and last meet the two-initial-seat condition. PDF
pp.11,13 print internal quotas **3,187** and **3,162**, and divisions **16+1** and
**4+7**. The first handwritten divisor is inconsistent with its stated quotient;
the other explicitly uses seats+1. The statute and both printed quotient values
support the existing optional-field implementation; no engine rule was changed.

Every published final seat now reproduces, including Herut 14 and General Zionists
7. Integer quotients **3,375** tie at seats 118–119. Both lottery choices yield
identical final seats; the historical order is unknown and is not fabricated.
The warning remains visible. Decision [0063](decisions/0063-k1-connections-rosters-national-release.md)
records the evidence, checks both choices and releases the national dataset under
the owner's prefix-roster standard. Decision 0060's counterfactual simulation
limits still apply. UI election labels need the reviewed withdrawal mappings.

## 1951–1969: floor Hare and largest remainders

The primary [1951 law](https://fs.knesset.gov.il/1/law/1_lsr_208018.pdf), ss.38–40,
SH 74 p.116 (PDF p.7), sets a **1%** threshold, quota
`floor(qualifying votes / 120)`, whole-quota initial seats and largest unused vote
remainders. The [1955 consolidation](https://fs.knesset.gov.il/2/law/2_lsr_311000.pdf),
ss.43–45 (PDF pp.8–9), [1959 consolidation](https://fs.knesset.gov.il/3/law/3_lsr_311002.pdf),
ss.37–39 (PDF pp.7–8), and [original 1969 consolidation](https://fs.knesset.gov.il/6/law/6_lsr_311009.pdf),
ss.81–83 (PDF pp.14–15), retain those allocation clauses. Inspected amendments
through the October 1969 election establish no formula change; details and retained
primary files are listed in decision 0060.

`ISRAEL_1951` (`il-1951-largest-remainder-1`) represents the inspected wording:
`remainderMethod: 'largest-remainder'`, `quotaRounding: 'floor'`, no majority cap,
and `largestRemainderRepeat: false`. The last option implements the text's **one
additional seat per competing list**, without silently starting another remainder
round. Both connected partners must separately pass 1%; they combine for the
remainder stage with summed initial seats and votes, and re-divide their total
seats afresh by the same formula. There is no 1949 initial-seat eligibility condition.

**Equal remainders are not resolved in the inspected allocation clauses.**
`tiePolicy: 'unspecified'` warns explicitly and keeps any result provisional; a
scenario's supplied choice is not evidence of a statutory lottery. For compatibility
with the unchanged app warning switch, the warning uses `lottery-required` plus
`data.tiePolicy: 'unspecified'`; the UI must render the qualified diagnostic instead
of asserting that the law mandates a lottery. No express candidate shortage
redistribution provision was found; that behavior is unverified.

**The former 1965 discrepancy was a connection-transcription error.** Fresh visual
inspection of [YP 1225 p.189](https://olaw.org.il/yalkut/yalkut-1225.pdf), PDF p.1,
reads **את–רא (Alignment–Progress and Development)**, not את–יא. With the corrected
primary input, the unchanged preset reproduces all seats: Alignment 45,
HaOlam HaZeh 1. The pair receives 47 seats and re-divides 45+2 at internal quota
9,932. No new quota, remainder rule or RuleSet field is required. Decision
[0069a](decisions/0069a-k6-corrected-connection-national-release.md) supersedes the
1965-specific uncertainty in decisions 0060–0062 and 0068. Follow-up evidence now supplies complete notices for the released
1951–1969 datasets: **YP 177 p.1177** (צ–סצ), **YP 427 p.1053** (א–יד, פ–ש,
צ–צח, סא–ל, נ–ע), **YP 709 p.125** (א–רא, יא–ע), **YP 865 p.1843** (ב–ד,
מ–תו, יא–רא), and **YP 1565 p.246** (יא–רא). Signed primary notices were read
in full; inactive pairs are retained. All seats match with the existing preset,
including the formerly mismatched 1959 Mapai 47 and Cooperation and Brotherhood 2.
Decisions 0064–0067 and 0069 release k2/k3/k4/k5/k7 with reviewed contiguous winning
prefixes and official elected-name cross-checks. Later ranks and localities remain
outside the release. The 1961 Liberal elected-rank exclusions are preserved.

K6 is also released with reviewed winning prefixes and all 120 elected names
cross-checked against YP 1230. The rejected pooled-quota/second-remainder-seat
hypotheses in 0068 were never established law and remain unimplemented.

## 1973–1988: 1% Bader–Ofer, with the explicit K9 inference

`ISRAEL_1973` (`il-1973-bader-ofer-1`) applies the exact **1/100** threshold to
K8 and K10–K12. [Original Amendment No. 4](https://fs.knesset.gov.il/7/law/7_lsr_211799.pdf),
**SH 692 p.108, 9 April 1973**, replaces §81(d): repeated highest quotients, CEC lottery
for equal quotients, and the half-seats restriction. The original visibly says **No.4**.
The [1969 consolidated law](https://fs.knesset.gov.il/6/law/6_lsr_311009.pdf), SH556 p.116,
supplies §§81(a–c),82: 1%, floor quota, whole-quota initial seats, combination only for
remainders when both partners qualify, and full re-division within a pair. §67(a), p.113,
permits one partner. Original PDFs and hashes are retained in SOURCES.

A full comparison of intervening ordinary and temporary amendments through 1988
remains unverified. Under the owner's release decision, this is a bilingual dataset
limitation, **not a release gate**, when the verified provisions reproduce every seat.

The **optional, default-off** `seatsCappedAtCandidates` field caps a list's initial and
remainder seats at a known complete `candidateCount`, then continues the highest-quotient
remainder stage. Pair units retain their combined votes and summed capacities; internal
re-division applies each member's cap. Unknown full counts are unbounded. In particular,
a partial transcription is never treated as a complete candidate count. This matters
for capacity-sensitive counterfactuals; such scenarios are not fully verified when full
rosters are unknown. Scenario import/export, preset validation and departure detection
carry the option; other presets leave it off.

Only `ISRAEL_1977` (`il-1977-bader-ofer-1-candidate-cap`) enables it. With all six
published agreements, it gives Flatto-Sharon **1** and Sheli **2**, exactly as published;
uncapped they receive **2** and **1**. Every other list is unchanged, including NRP **12**.
**This procedure is inferred from the officially published result because the statutory
text was not located.** §83 of the original identifies elected members in order but
supplies no explicit redistribution algorithm. Further searches did not recover a
contemporaneous CEC ruling or operative text for this case. Reproduction is not a
claim of verified legal authority. See [0073](decisions/0073-k9-candidate-cap-inference.md).

**ההליך לשנת 1977 מוסק מהתוצאה הרשמית שפורסמה משום שנוסח החוק המסדיר אותו לא אותר.**
הגבלת מספר המנדטים למספר המועמדים והמשך חלוקת העודפים משחזרים את כל התוצאות,
אך אינם מוכיחים את הסמכות המשפטית. שרשרת התיקונים המלאה נותרה מגבלה מתועדת.

K10–K12 are released with complete required winning-roster prefixes and all elected-name
checks, using notices YP2720 p.2027 (three pairs), YP3073 p.2839 (four), and YP3588 p.170
(five). K8 remains unavailable: agreement notice not located and four seat differences.
K9 also remains unavailable: both copies of YP2326 omit Ratz's elected-member paragraph,
so only 119/120 elected names can be cross-checked against the required results notice.
The full per-list tables and both K9 computations are in
[0075](decisions/0075-k8-k12-release-evidence.md). No app Rules panel edit was made.

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
