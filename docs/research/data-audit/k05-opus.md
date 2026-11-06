# Data audit k5 (15 August 1961, 5th Knesset): Opus auditor

Auditor: Claude Opus (independent; did not read the Codex report). Base: `5f2a4f3` (contains `53cca36`). Accessed:
2026-11-06 for every source below unless stated. Method: [BRIEF.md](BRIEF.md) with
[source-hierarchy.md](../source-hierarchy.md). No data edited, no build run. Scans were rendered with the locked
pdfjs-dist in a scratch Chromium page; rendered crops are disposable scratch, the retained PDFs are the evidence.

## Summary

| Class | Count | Notes |
|---|---:|---|
| OK | 365 | Counted per field: 4 national totals, date, Knesset number; 14 × votes, 14 × seats; 12 letters; 12 list names; 3 connection pairs; threshold + full seat reproduction; 119 elected names + 2 explicit Liberal exclusions; 120 elected Knesset person IDs; government-10 bloc scheme (members, seats); 17 aftermath facts; 2 logo claims; 10 dataset hashes; 1 lineage edge; 13 party appearances; 13 family memberships; no English Wikipedia; 2 UI rule statements |
| WRONG | 13 | Wrong name and letters for the 335-vote list; a withdrawn list missing; wrong letters for the Sephardi list; a dropped word in the NRP name; Ben-Gurion mandate dates one day late; 3 stale aftermath gaps; Liberal exclusions described without the gazette's stated reason; one candidate name; stale hash in parties.json; broken logo source URL; a wrong sentence in the k5 meta notes |
| UNSUPPORTED | 1 | Support-only coalition lists and the Mapai-satellite scheme rest on Hebrew Wikipedia although rank 1–3 sources are reachable |
| UNVERIFIABLE | 0 | |
| DISPUTED | 0 | |

Main points:

- **The official results notice is retained and correct.** `data/raw/research/k05-results.pdf` (sha256 `2c9f3b81…`,
  matches SOURCES.json) is Reshumot **YP 869, 24 Aug 1961, pp. 1937–1939**, signed by CEC chair Justice Zvi Berinson on
  י"א באלול תשכ"א (23 Aug 1961). Every list's votes, the valid total 1,006,964, invalid 30,066 and all 120 seats match
  it. CBS table 27.2 (retained) gives 15.8.1961, eligible 1,271,285, voters 1,037,030, valid 1,006,964. No later
  correction to the results was found in the covers of YP 870–875 (tables of contents only; not exhaustive).
- **Seats reproduce independently.** My own run (1% threshold 10,069.64; Hare quota 8,332.39; largest remainder, one
  remainder seat per unit; YP 865 pairs ב–ד, מ–תו, יא–רא) gives exactly the gazetted 42/12/4/2/17/2/17/9/5/2/8.
- **All 120 elected identities check out.** The 120 Knesset person IDs in `bios/k5.json` equal the 120 members whose
  KNS_PersonToPosition StartDate is 1961-09-04 in the retained OData file, none missing, none extra; names agree up to
  spelling variants.
- **Two list identities are wrong and one approved list is missing** (findings 1–3). The candidates notice YP 863
  approved **15** lists; the app shows 14. The 335-vote list is **עט "שוחרי הדימוקרטיה"**, not "עע הגוש העממי"; the
  Sephardi list's letters are **סש**, not סס; and **שו "רשימת יוצאי תימן"** withdrew when all six candidates resigned
  (YP 866). This is the k22 error class ("withdrew but missing").
- **Recommendations and formation:** the Israel State Archives chapter on the 1961 formation (rank 1 archival
  publication) confirms the 5–6 Sept consultations, Mapai's recommendation of Ben-Gurion, the 14 Sept Mapai
  consultation and Eshkol's assignment, and Poalei Agudat Yisrael's participation. It places Ben-Gurion's mandate on
  6 Sept and his refusal "the next day" (finding 5). All three confidence votes (63–46, 64–43, 59–36–9) are verbatim in
  the full plenum records.
- No English Wikipedia URL in any k5 file (`grep en.wikipedia` = 0 in `data/meta/k5.json`, `aftermath/k5.json`,
  `bios/k5.json`, `logos/k5.json`, `party-links/k5.json`, `public/data/k5.json`, `data/raw/k5/*`). No reversed
  parentheses: the only bracketed name, `גרוס שלמה יעקב (סולומון)`, is correctly ordered.

## Non-OK findings

Severity: **H** high (wrong fact shown to users), **M** medium, **L** low (wording or formatting, or not displayed).

| # | Sev | File | JSON path | Current value | Correct value | Class | Source (rank) | Quote | Accessed |
|---|---|---|---|---|---|---|---|---|---|
| 1 | H | `data/raw/k5/national.reviewed.json` → `public/data/k5.json`; also `data/meta/k5.json`, `data/meta/parties.json`, `data/meta/party-links/k5.json`, `tests/historical-k05.test.ts` | national `lists[10]` (`letters`, `nameHe`); public `lists[13]` (`id 5-עע`, `letters`, `nameHe`, `shortHe`, `shortEn`, `englishName`); meta `lists[1]`; parties `parties[61]` (`vehicle-5-עע`) and `partyAppearances[106]`; party-links `lists["5-עע"]`, `gaps["5-עע"]`; test `published` key `עע` | `עע` "הגוש העממי" (335 votes) | **`עט` "שוחרי הדימוקרטיה"**, 335 votes, one candidate (1. ח'ורי דאוד, נצרת). Vote count is right; letters and name are not. Id should become `5-עט`; transliteration e.g. "Shoharei HaDemokratya". | WRONG | YP 869 p.1937 (1) https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset5-results.pdf ; YP 863 p.1813 (1) https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset5-cand.pdf (both retained, `data/raw/research/k05-*.pdf`) | YP 869 table: "עט שוחרי הדימוקרטיה 335". YP 863: "האות : עט. הכינוי : שוחרי הדימוקרטיה … 1. ח'ורי דאוד … נצרת" | 2026-11-06 |
| 2 | M | `data/raw/k5/national.reviewed.json` → `public/data/k5.json`; `data/meta/election-context.json` | `lists` (no entry); `events` (no k5 withdrawal event) | Approved list **שו** absent; dataset says 14 lists | Add `שו` "רשימת יוצאי תימן" with `withdrawn: true`, 0 votes, 0 seats; six registered candidates (1. עמיר חיים, 2. מינס מנשה, 3. מדהלה אהרן, 4. כהן שלמה, 5. ציוני משה, 6. גלוסקא אברהם). Candidates 2–6 and then the sole remaining candidate 1 resigned (notices dated 8 Aug 1961), so the list did not appear in the results. Add a withdrawal context event (date 1961-08-08) and retain YP 866 in SOURCES.json. DATA.md's "Each release preserves every gazetted list" is otherwise untrue for k5. | WRONG | YP 863 p.1815 (1), URL as #1; YP 866 p.1847, 10 Aug 1961 (1) https://olaw.org.il/yalkut/yalkut-0866.pdf | YP 863: "האות : שו. הכינוי : רשימת יוצאי תימן". YP 866: "1. מינס מנשה, מועמד מס' 2 ברשימת המועמדים הנושאת את הכינוי רשימת יוצאי תימן — האות שו; … 5. גלוסקא אברהם, מועמד מס' 6 …"; second notice: "עמיר חיים, מועמד מס' 1 התפטר מרשימת המועמדים הנושאת את הכינוי רשימת יוצאי תימן — האות שו, שהיה היחיד ברשימה זו." Both "כ"ו באב תשכ"א (8 באוגוסט 1961) צבי ברנזון" | 2026-11-06 |
| 3 | M | `data/raw/k5/national.reviewed.json` → `public/data/k5.json`; `data/meta/k5.json`; `parties.json`; `party-links/k5.json`; `tests/historical-k05.test.ts` | national `lists[9].letters`; public `lists[12]` (`id 5-סס`, `letters`); meta `lists[0].letters`; parties `vehicle-5-סס`, `partyAppearances[105]`; party-links `5-סס` | `סס` | **`סש`** (name "למען הצדק והאחווה, רשימה ספרדית דתית" and 3,181 votes are right) | WRONG | YP 869 p.1937 (1); YP 863 p.1812 (1), URLs as #1 | YP 869: "סש למען הצדק והאחווה, רשימה ספרדית דתית 3,181". YP 863: "האות : סש. הכינוי : למען הצדק והאחווה, רשימה ספרדית דתית" | 2026-11-06 |
| 4 | M | `data/raw/k5/national.reviewed.json` → `public/data/k5.json`; `data/meta/families/national-religious.json`, `religious-parties.json` | national `lists[1].nameHe`; public `lists[3].nameHe` (5-ב); families `elections[4].members[*].nameHe` (5-ב) | "חזית דתית לאומית המזרחי הפועל המזרחי ובלתי מפלגתיים" | **"חזית דתית לאומית, המזרחי והפועל המזרחי ובלתי מפלגתיים"**: the word "והפועל" has lost its ו (the comma is punctuation). YP 865's connection notice abbreviates the name differently and is not the name notice. | WRONG | YP 869 p.1937 (1); YP 863 p.1799 (1), URLs as #1 | YP 869: "ב חזית דתית לאומית, המזרחי והפועל המזרחי ובלתי מפלגתיים 98,786". YP 863: "האות : ב. הכינוי : חזית דתית לאומית, המזרחי והפועל המזרחי ובלתי מפלגתיים" | 2026-11-06 |
| 5 | M | `data/meta/aftermath/k5.json` | `formation.events[1].date` (mandate-given, ben-gurion); `formation.events[2].date` (mandate-returned) | 1961-09-07; 1961-09-08 | **1961-09-06**; **1961-09-07**. ISA dates the second consultation day to 6 Sept, after which the President tasked Ben-Gurion, who returned the mandate "the next day". The JTA bulletin used is dated a day after the events it reports: its 6 Sept bulletin reports as "today" the meetings ISA dates to 5 Sept. The data's own note already warns of this lag. A fixer may confirm against ISA file נ-56/1 or Davar. | WRONG | Israel State Archives, "מעשה מרכבה – מועדון הארבע והקמת הממשלה ב-1961" (1) https://catalog.archives.gov.il/site/chapter/eshkol-moadon-haarba/ ; JTA 6 and 7 Sept 1961 (3) https://www.jta.org/archive/israel-president-opens-talks-on-cabinet-formation-sees-party-leaders | ISA: "ב-5 בספטמבר, החל הנשיא יצחק בן-צבי את מפגשיו … ב-6 בספטמבר התייעץ הנשיא עם נציגי מפ"ם … לאחר סיום ההתייעצויות בבית הנשיא, ביקש בן-צבי להטיל את תפקיד הקמת הממשלה על בן-גוריון. בן-גוריון … החליט למחרת להשיב את המנדט". JTA bulletin "September 6, 1961": "He met today with leaders of the Mapai, Herut, the Liberals and the National Religious party." | 2026-11-06 (ISA via Exa fetch) |
| 6 | L | `data/meta/aftermath/k5.json` | `gaps[5]` | "Replacement-coalition snapshots are partial: government 14's faction splits and current seat counts require a separate audit. …" | Remove the government-14 clause. The k5 term has governments 10–12 only; government 14 (1969) belongs to k6/k7. Text copied from another file. | WRONG | Internal (`government.number` 10; `changes` 11, 12) | — | 2026-11-06 |
| 7 | L | `data/meta/aftermath/k5.json` | `gaps[0]` | "Official result-certification date and the first sitting are not transcribed" | Both are in retained files. YP 869 is signed **23 Aug 1961** and published 24 Aug 1961. The opening sitting is **4 Sept 1961** (OData StartDate of all 120 opening members). | WRONG (stale gap) | YP 869 p.1939 (1); `data/raw/k5/knesset-odata-members.json` (1) | "י"א באלול תשכ"א (23 באוגוסט 1961) צבי ברנזון … יושב ראש ועדת הבחירות המרכזית לכנסת החמישית"; header "869 … 24 באוגוסט 1961"; OData `"StartDate": "1961-09-04T00:00:00"` | 2026-11-06 |
| 8 | L | `data/meta/aftermath/k5.json` | `gaps[4]`; `formation.events` (missing step) | Gap: "The 14 September assignment needs a fuller excerpt"; no `mandate-given` event for Eshkol | Add `{date: 1961-09-14, type: mandate-given, person: eshkol}` citing ISA, and shorten the gap to the 2 Nov return only. | WRONG (stale gap / omission) | ISA chapter (1), URL as #5 | "ב-14 בספטמבר התייעץ הנשיא בן-צבי שוב עם נציגי מפא"י שהמליצו בפניו להטיל את מלאכת הרכבת הממשלה על אשכול … לאחר מכן הטיל הנשיא את הקמת הממשלה על אשכול." | 2026-11-06 |
| 9 | L | `public/data/k5.json` (from build); `docs/DATA.md`; `docs/decisions/0067-…` | public `lists[2].notesHe[0..1]` (5-ל); DATA.md line 465; 0067 "does not assert that either person died" | Notes say only that Ichilov (#9) and Kanovitch (#11) "do not appear among the elected… the seat passed to the next candidate"; DATA.md: "It is not used to infer deaths or another biographical reason." | The results notice itself states the reason: **both candidates had died**. Say so in the note, attributed to the notice (e.g. "לפי הודעת התוצאות, המועמד נפטר לפני פרסומה"). Ichilov died 25 June 1961; Hebrew WP, labelled secondary, gives the date and the Davar obituary of 28 Jun 1961. The flags `notSeated: true` and the 1–8, 10, 12–19 mapping are correct. | WRONG (official reason omitted / contradicted) | YP 869 p.1939 (1), URL as #1; Hebrew WP (5, lead only) https://he.wikipedia.org/wiki/עזרא_איכילוב | "מרשימת המפלגה הליברלית — ל (לאחר שהמועמדים איכילוב עזרא וד"ר כנוביץ שמעון נפטרו)." | 2026-11-06 |
| 10 | L | `data/raw/k5/rosters.reviewed.json` → `public/data/k5.json` | rosters `lists[5].electedNames[1]`; public `lists[8].candidates[1].nameHe` (5-יא#2) | `מעדי גבר` | `מעדי ג׳בר` (Jabr Moade). Both notices print the geresh. Without it the name reads "Gever". The first name prints as "מעדי"/"מעודי" across the two notices; that difference is a spelling variant. Elsewhere the dataset keeps the geresh (`ד׳אהר אחמד`, `זוארץ פריג׳ה`). | WRONG | YP 863 p.1807 (1); YP 869 p.1939 (1) | YP 863: "2. מע[ד]די ג'בר"; YP 869: "2. מעודי ג'בר" | 2026-11-06 |
| 11 | L | `data/meta/parties.json` | `sources["k5"].sha256` (repository-dataset, locator `public/data/k5.json`) | `2fc051bfe72bb7e31a5f9225da63a8a8a58f47bcafd79571f951595c11906706` | `c2d2f084abbcea943f29594dd70815bdf2be2e8133659570a4a6979ef56d3bdb` (current file; `party-lineage.json` and all 9 family files already carry it). Refresh again after the fixes above change k5.json. | WRONG (stale hash) | `sha256sum public/data/k5.json` | — | 2026-11-06 |
| 12 | L | `data/meta/logos/k5.json` → `public/data/k5.json` | `logos[0].sourceUrl` (ל); public `lists[2].logo.sourceUrl` | `https://commons.wikimedia.org/wiki/Liberal3.png` | `https://commons.wikimedia.org/wiki/File:Liberal3.png`. The current URL returns HTTP 404. The claim itself is OK: there is a single Commons revision (2021-08-09), its description says it is the 1961 election symbol, and the source is nostal.co.il propaganda posters. | WRONG | Commons API (provenance) https://commons.wikimedia.org/w/api.php?action=query&titles=File:Liberal3.png&prop=imageinfo | "description={{en\|1=Symbol of the Israeli Liberal Party (1961-1988) during the 1961 election, the only one it contested independently.}}"; GET `/wiki/Liberal3.png` → 404 | 2026-11-06 |
| 13 | L | `data/meta/k5.json` | `notes[0]` | "Mizrachi, Hapoel HaMizrachi, Agudat Yisrael and Poalei Agudat Yisrael ran separately in 1951 and 1961…" | Mizrachi and Hapoel HaMizrachi did **not** run separately in 1961: they ran as the single list ב, named after both. (They merged into the NRP in 1956, as the same sentence's tail says.) Suggest: "…ran separately in 1951; in 1961 Agudat Yisrael and Poalei Agudat Yisrael ran separately, and the NRP (ב) was already a merged party." | WRONG | YP 869 p.1937 (1) | "ב חזית דתית לאומית, המזרחי והפועל המזרחי ובלתי מפלגתיים" | 2026-11-06 |
| 14 | L | `data/meta/k5.json`; `data/meta/aftermath/k5.json` | `blocSchemes[0].sources[1]` + `notes[0]` (support-only lists rest on Hebrew WP); `blocSchemes[1].sources` (satellite scheme: Hebrew WP only); aftermath `sources["coalition-2"]` | Hebrew Wikipedia sole basis for 5-ד, 5-יא, 5-רא in government 10 and for the Mapai-satellite scheme | The assignments are correct. Replace or add better sources: Eshkol's government-11 presentation (rank 1) names "פועלי אגודת ישראל, השיתוף והאחווה, הקדמה והפיתוח" as factions of the previous coalition; ISA (rank 1) confirms PAI joined at formation; JTA 7 Sept 1961 (rank 3) calls the Arab lists "Mapai's Arab affiliates". | UNSUPPORTED (Hebrew WP sole basis) | Knesset gov11 presentation (1) https://main.knesset.gov.il/mk/government/documents/gov11.pdf ; ISA (1), URL as #5; JTA (3) https://www.jta.org/archive/israel-president-entrusts-ben-gurion-with-formation-of-new-cabinet | gov11: "ממשלה הנתמכת על-ידי כל סיעות הקואליציה הקודמת: מפלגת פועלי ארץ ישראל, המפלגה הדתית-לאומית, מפלגת אחדות העבודה – פועלי ציון, פועלי אגודת ישראל, השיתוף והאחווה, הקדמה והפיתוח". ISA: "הצליח אשכול לצרף לקואליציה את פועלי אגודת ישראל". JTA: "four seats from Mapai's Arab affiliates" | 2026-11-06 |

## Gaps and observations (not counted above)

- **Downstream of #1–#3.** Fixing the list identities changes list ids (`5-סס` → `5-סש`, `5-עע` → `5-עט`) in
  `public/data/k5.json`, `parties.json` vehicles and appearances, `party-links/k5.json`, the k5 test, DATA.md's
  "14" lists for k5 (table line 434), and the family/dataset hashes. "שוחרי הדימוקרטיה" had an Arab sole candidate from
  Nazareth. Whether it belongs in `families/arab-arab-jewish.json` is a family-scope decision, not a fact I can assert.
- **YP 865 p.1844** (the retained `agreements.pdf`, PDF p.2) also holds a notice that candidates 5 and 7 of list נ
  resigned, and an erratum to YP 863 (Liberal candidate שוקן גרשום's occupation). Losing rosters are untranscribed, so
  neither affects displayed data. If נ's roster is ever transcribed, it must apply that notice.
- **`term.start`** is the election date (1961-08-15). k19 uses a later date, so conventions differ between files. The
  opening sitting (1961-09-04) is in the retained OData if the field is meant as the Knesset's term.
- **Recommendation round 1:** ISA says Herut asked that, if Ben-Gurion delayed, the task pass to Herut. That is a
  conditional position, not a recommendation, so `status: unknown` is defensible. The NRP said it was ready to serve
  under Ben-Gurion (JTA). It too is a stance rather than a recorded recommendation.
- **JTA 7 Sept 1961** reports that Agudat Yisrael, "94 ballots" short of a fifth seat, would challenge two polling
  places. No change to the gazetted seats followed, and nothing in the data claims one. No correction notice was found
  in YP 870–875 (covers only).
- **Colours:** `data/meta/k5.json` gives the Liberal colour `#FECA0A`, but `public/data/k5.json` shows `#17a2b8`. These
  are display conventions sourced to Hebrew WP, not facts; I note the mismatch only.
- The gazette prints Kalman Kahana as "כהן קלמן" in both notices. The app follows it, which is correct under the
  candidate-spelling convention; the Knesset record is "קלמן כהנא".

## Checked and found OK

| Item | Value(s) | Source (rank) |
|---|---|---|
| Election date, Knesset number | 1961-08-15; 5 | CBS 27.2 (1), retained `data/raw/research/cbs-national-totals-2024.pdf` (sha256 `18359d3e…`): "15.8.1961 … 5" |
| Eligible / voters / valid / invalid | 1,271,285 / 1,037,030 / 1,006,964 / 30,066 | CBS 27.2 (1); YP 869 §1 total "1,006,964", §2 "מספר הקולות שנמצאו פסולים: 30,066" (1) |
| Votes of all 14 listed lists | 349,330; 98,786; 37,178; 19,428; 138,599; 19,342; 137,255; 75,654; 3,561; 3,181; 335; 42,111; 16,034; 66,170 (sum 1,006,964) | YP 869 p.1937 (1) |
| Seats | א42 ב12 ג4 ד2 ח17 יא2 ל17 מ9 ק5 רא2 תו8; others 0 | YP 869 §3 p.1938 (1); own reproduction |
| Letters (12 of 14) | א ב ג ד ח יא ל מ נ ק רא תו | YP 869; YP 863 (1) |
| List names (12 of 14) | all except ב (#4) and עט (#1); hyphenation differences (ארץ-ישראל, פועלי-ציון) are typographic | YP 869; YP 863 (1) |
| Connection pairs | ב–ד, מ–תו, יא–רא | YP 865 p.1843, signed 2 Aug 1961 (1), retained `data/raw/k5/agreements.pdf` (sha256 matches) |
| Threshold, quota, reproduction | 1%; quota 8,332; 120/120 seats | Own calculation; `src/engine/rules.ts` ISRAEL_1951 |
| Elected names (119) and Liberal exclusions (2) | All winning-list prefixes; ל ranks 9 and 11 `notSeated` | YP 869 §4 pp.1938–1939; YP 863 (1) |
| Elected Knesset person IDs (120) | `bios/k5.json` = opening-day set | `data/raw/k5/knesset-odata-members.json` (1), sha256 `9038e03c…` |
| Government-10 bloc scheme | Coalition א ב תו ד יא רא = 68; opposition ח ל מ ק ג = 52; 16 ministers 9/3/2 + 2 non-MK | gov10 presentation (1) https://main.knesset.gov.il/mk/government/documents/gov10.pdf (minister list); ISA (1); gov11 (1) |
| Round 1 (5–6 Sept), Mapai → Ben-Gurion | dates and entry | ISA (1): "מפא"י המליצה על דוד בן-גוריון"; JTA (3) |
| Round 2 (14 Sept), Mapai → Eshkol | date and entry | ISA (1): "ב-14 בספטמבר התייעץ הנשיא … שהמליצו … על אשכול" |
| Ben-Gurion re-tasked 2 Nov 1961; govt 10 confidence 63–46 | 1961-11-02 | gov10 presentation (1); plenum sitting 19 (1) https://fs.knesset.gov.il/5/Plenum/5_ptm_252197.pdf: "הצבעה 63 בעד … 46 נגד" |
| Govt 11: mandate 19 Jun 1963; confidence 64–43 on 26 Jun 1963; same six factions | as data | gov11 presentation (1); plenum 264 (1) https://fs.knesset.gov.il/5/Plenum/5_ptm_252310.pdf: "הצבעה 64 בעד … 43 נגד" |
| Eshkol resignation 14 Dec 1964; govt 12 mandate 20 Dec, confidence 59–36–9 on 22 Dec 1964 | as data | gov12 presentation (1); plenum 424 (1) https://fs.knesset.gov.il/5/Plenum/5_ptm_252364.pdf: "הצבעה 59 בעד … 36 נגד 9 נמנעים" |
| Government numbers, PMs, dates | 10 Ben-Gurion 1961-11-02 → 1963-06-26; 11 and 12 Eshkol; no acting PM gap | As above |
| Term end / next election | 1965-11-02 | CBS 27.2 (1): "2.11.1965 … 6" |
| Term events | 1962 economic programme with devaluation; 12 May 1965 relations with West Germany | Cited MFA timeline, German Foreign Office (1 each); not re-fetched beyond the cited quotes |
| Logos | Herut 1961 roundel (Jabotinsky item 4098/37941, "2.8.1961 … שנה נכונה"); Liberal symbol single 2021 Commons revision described as 1961 | Retained `data/raw/logos/k5/*.html` (sha256 matches); Commons API |
| Dataset hashes | `party-lineage.json` and 9 family files = current `c2d2f084…` | `sha256sum` |
| Lineage | `liberals-1961`: General Zionists + Progressives → Liberal Party, 1961 | Consistent with Knesset OData faction "מפלגה ליברלית ישראלית" from 8 May 1961 (via knessetvotes mirror of OData, lead only) |
| Party appearances / family memberships | 13 k5 lists mapped to the expected parties (pre-split Maki, NRP, Mapai, etc.) | Internal consistency with list identities |
| English Wikipedia | none in k5 files | grep |
| UI rule statements | 1951–1969 largest remainder, at most one remainder seat per list; 1% threshold | `src/app/glossary-data.ts`, `src/engine/rules.ts`; consistent with the reproduction |
