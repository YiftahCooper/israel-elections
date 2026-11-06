# Data audit k04 (1959, 4th Knesset): Opus auditor

Auditor: Claude Opus 5.5. Base: `5f2a4f3` (contains `53cca36`). Accessed: 2026-11-06 for every source below unless
stated. No data was edited.

## Summary

| Class | Rows | Atomic facts covered |
|---|---|---|
| OK | 27 | about 400: totals, all 24 list votes, all 12 seat counts, allocation, 116 of 120 elected names, 120 bio identities, government 9, mandate, recommendations, term events, hashes |
| WRONG | 19 | 8 official list names / ballot letters, 1 missing connected-list agreement, 4 elected-name spellings, 1 unrecorded results-notice misprint and its formal correction, 4 aftermath items, 1 logo-evidence text |
| UNSUPPORTED | 3 | family membership of two Arab lists, an anachronistic bloc label, one under-cited coalition note |
| UNVERIFIABLE | 2 | per-faction recommendation wording; mid-term replacements (not modelled) |
| DISPUTED | 0 | none |

The most serious problems:

1. **Eight of the 24 lists have a wrong official name or wrong ballot letters**: טט→**טש**, סט→**סש**, רו→**רנ**. The
   names of ב, טש, יא, לש, ע and ש do not match either 1959 notice. Both the candidate notice (YP 704) and the results
   notice (YP 717) agree on the correct forms. The errors carry into `public/data/k4.json`, the English
   transliterations, `parties.json` list ids and the family files.
2. **A third connected-list agreement is missing.** YP 709, p. 126, on PDF page 2 of the *retained* file
   `data/raw/k4/agreements.pdf`, connects **תו (Ahdut HaAvoda) with שת (Arab Labour Party)**. The data says
   `complete: true` with two pairs. No seat changes, because שת fell below 1%.
3. **The results notice misprints Meir Ya'ari as "יערי יעקב", and a formal correction was published**: YP 724,
   10 Dec 1959, p. 501, "תיקון טעות". Neither the misprint nor the correction is recorded or retained. The app shows the
   correct name, but `rosters.reviewed.json` claims its elected names were "verified name by name against the results
   notice".
4. **Four elected names are misspelt against both notices** (and against Knesset OData): שיטרית→שטרית,
   אוזניה→אזניה, יוניצמן→יוניצ׳מן, אי-נאשף→א-נאשף.
5. **The aftermath ends the term with `type: election`.** The 4th Knesset was dissolved by the חוק התפזרות הכנסת
   הרביעית, passed in its third reading on **28 March 1961**. The file also omits the government's resignation
   (31 Jan 1961) and Poalei Agudat Yisrael joining the coalition (18 Jul 1960). Its gap text is stale and mentions
   "government 14".

No English Wikipedia was found in any k4 file. No partisan wording was found. The Herut, Mapam and Ahdut HaAvoda links
are platform documents, correctly marked `kind: partisan`.

## Sources used (rank)

| Key | Source | Rank | Identity |
|---|---|---|---|
| R | Results notice, YP 717, 15 Nov 1959, pp. 263–265 (retained `data/raw/research/k04-results.pdf`) | 1 | sha256 `1a148be5…9c19` |
| C | Candidate notice, YP 704, 18 Oct 1959, pp. 45–72 (retained `data/raw/research/k04-candidates.pdf`) | 1 | sha256 `ccb60ea8…2c16` |
| A | Connected-list notices, YP 709, 26 Oct 1959, pp. 125–126 (retained `data/raw/k4/agreements.pdf`) | 1 | sha256 `833fc801…81cf` |
| T | Correction notice, YP 724, 10 Dec 1959, p. 501, https://olaw.org.il/yalkut/yalkut-0724.pdf (**not retained**) | 1 | sha256 `1c477432…0f15` |
| S | CBS table 27.2 (retained `research/cbs-national-totals-2024.pdf`) | 1 | — |
| O | Knesset OData `KNS_PersonToPosition` (KnessetNum 4; GovernmentNum 9), `KNS_PlenumSession`, `KNS_Bill`, `KNS_IsraelLaw` | 1 | live |
| P9 | Plenum 16 Dec 1959, sitting 9, https://fs.knesset.gov.il/4/Plenum/4_ptm_255963.doc | 1 | sha256 `f25346ec…7098` |
| P11 | Plenum 17 Dec 1959, sitting 11, https://fs.knesset.gov.il/4/Plenum/4_ptm_255965.doc (text of the cited `4_ptm_251773.pdf`) | 1 | sha256 `ce125630…dd91e12` |
| P223 | Plenum 1 Feb 1961, https://fs.knesset.gov.il/4/Plenum/4_ptm_255804.doc | 1 | — |
| P136 | Plenum 18 Jul 1960, sitting 136, `KNS_DocumentPlenumSession` for session 489097 | 1 | — |
| P265 | Plenum 28 Mar 1961, sitting 265, https://fs.knesset.gov.il/4/Plenum/4_ptm_255927.doc | 1 | sha256 `dbd93cdc…cb45b1` |
| J | JTA Daily News Bulletin, 9 Dec 1959, https://www.jta.org/archive/israel-president-appoints-ben-gurion-to-form-a-new-government | 3 | live |
| H | Hebrew Wikipedia "הכנסת הרביעית" (lead only) | 5 | via Exa |

## Non-OK findings

`NR` = `data/raw/k4/national.reviewed.json`; `RR` = `data/raw/k4/rosters.reviewed.json`; `M4` =
`data/meta/k4.json`; `AF` = `data/meta/aftermath/k4.json`; `PD` = `public/data/k4.json` (generated, for reference
only).

| # | File | JSON path | Current | Correct | Class | Source | Rank | Quote (verbatim) |
|---|---|---|---|---|---|---|---|---|
| 1 | NR (→ PD, `families/national-religious.json`, `families/religious-parties.json`) | `lists[letters=ב].nameHe` | חזית דתית לאומית הפועל המזרחי המזרחי ובלתי מפלגתיים | חזית לאומית דתית הפועל המזרחי, המזרחי ובלתי מפלגתיים | WRONG | R p.263 row ב; C p.48 header | 1 | "חזית לאומית דתית הפועל המזרחי, המזרחי ובלתי מפלגתיים" |
| 2 | NR, M4 (`lists[letters=טט]`), `parties.json` (`listId 4-טט`, `vehicle-4-טט`), party-links, PD | `lists[letters=טט].letters` and `.nameHe`; M4 `englishName.label` "Koah Laalot" | טט / כוח לעלות | **טש** / **כוח שלישי** (transliteration "Koah Shlishi") | WRONG | R p.263; C p.54 ("אות הרשימה: טש. הכינוי: כוח שלישי") | 1 | "טש  כוח שלישי  594" |
| 3 | NR (→ PD, `families/arab-arab-jewish.json`) | `lists[letters=יא].nameHe` | שיתוף ואחווה | השיתוף והאחווה | WRONG | R p.263 and p.265 §(4)(ה); C p.55 | 1 | "יא  השיתוף והאחווה  11104" |
| 4 | NR, M4 `englishName.label` "Siat HaTeimanim" | `lists[letters=לש].nameHe` | סיעת התימנים | סיעת תימנים | WRONG | R p.263; C p.56 | 1 | "לש  סיעת תימנים  1711" |
| 5 | NR, M4, `parties.json` (`4-סט`), PD | `lists[letters=סט].letters` | סט | **סש** | WRONG | R p.263; C p.60 ("אות הרשימה: סש.") | 1 | "סש  מפלגה לאומית ספרדית, עדות מזרח ובלתי מפלגתיים  3133" |
| 6 | NR (→ PD, `families/arab-arab-jewish.json`) | `lists[letters=ע].nameHe` | החקלאות ופתוח | חקלאות ופתוח | WRONG | R p.263, p.265 §(4)(ז); C p.60; A p.125 ("חקלאות ופיתוח") | 1 | "ע  חקלאות ופתוח  10902" |
| 7 | NR, M4, `parties.json` (`4-רו`), PD | `lists[letters=רו].letters` | רו | **רנ** | WRONG | R p.263; C p.69 ("אות הרשימה: רנ.") | 1 | "רנ  איגוד סוציאליסטי „בונד" ובלתי מפלגתיים  1322" |
| 8 | NR, M4 `englishName.label` "Siat Nekhim Nifgeei Natzim" | `lists[letters=ש].nameHe` | סיעת נכים נפגעי נאצים | סיעת נכים ונפגעי השואה | WRONG | R p.263; C p.69 | 1 | "ש  סיעת נכים ונפגעי השואה  1765" |
| 9 | NR, M4, families (haredi, religious-parties) | `lists[letters=גד].nameHe` | …אגודת ישראל פועלי אגודת ישראל… (no comma) | חזית דתית תורתית אגודת ישראל, פועלי אגודת ישראל ודתיים בלתי מפלגתיים | WRONG (punctuation only) | R p.263; C p.50 | 1 | "חזית דתית תורתית אגודת ישראל, פועלי אגודת ישראל ודתיים בלתי מפלגתיים" |
| 10 | NR; `data/raw/SOURCES.json` `k4-agreements-gazette.description` | `agreements.pairs`, `agreements.complete` | 2 pairs [א,רא],[יא,ע]; complete true; "Both signed connected-list notices on PDF p.1, two pairs in total" | 3 pairs: add **[תו, שת]**. Inactive, because שת (3369) < 1% of 969337 | WRONG | A p.126 (PDF page 2 of the retained file) | 1 | "הודעה בדבר התקשרויות בין רשימות מועמדים … 1. מפלגת אחדות העבודה — פועלי ציון ובלתי מפלגתיים — האות תו 2. מפלגת עבודה ערבית ישראלית — האות שת … י״ח בתשרי תש״ך (20 באוקטובר 1959)" |
| 11 | RR (→ PD) | `lists[letters=א].candidates[rank=5].nameHe`, `electedNames[4]` | שיטרית בכור שלום | שטרית בכור שלום | WRONG | C p.45 #5; R p.264 #5 | 1 | "5. שטרית בכור שלום" |
| 12 | RR (→ PD) | `lists[letters=א].candidates[rank=27].nameHe`, `electedNames[26]` | אוזניה ברוך | אזניה ברוך | WRONG | C p.46 #27; R p.264 #27; O (PersonID 2134, LastName "אזניה") | 1 | "27. אזניה ברוך" |
| 13 | RR (→ PD) | `lists[letters=ח].candidates[rank=9].nameHe`, `electedNames[8]` | ד״ר יוניצמן שמשון | ד״ר יוניצ׳מן שמשון | WRONG | C p.52 #9; R p.265 #9; O LastName "יוניצ'מן" | 1 | "9. ד״ר יוניצ׳מן שמשון" |
| 14 | RR (→ PD) | `lists[letters=ע].candidates[rank=1].nameHe`, `electedNames[0]` | אי-נאשף מחמוד | א-נאשף מחמוד | WRONG | C p.60 #1; R p.265 §(4)(ז); O "אנאשף מחמוד" | 1 | "1. א-נאשף מחמוד" |
| 15 | RR `lists[letters=מ].electedNames[0]` and `crossCheck`; `data/meta/candidate-notes.json`; SOURCES (no entry) | — | "יערי מאיר", described as verified against the results notice; no note; correction not retained | The results notice prints **"יערי יעקב"** (misprint). YP 724 p.501 formally corrects it to "יערי מאיר". The app's displayed value is right. Record the misprint and the correction, and retain YP 724. | WRONG (provenance) | R p.265 §(4)(ו) #1; T p.501 | 1 | R: "1. יערי יעקב"; T: "תיקון טעות — בהודעה על תוצאות הבחירות לכנסת הרביעית, שפורסמה בילקוט הפרסומים 717, תש״ך, עמ׳ 263, בסעיף (4) (ו), במקום "יערי יעקב" צ״ל "יערי מאיר"." (the correction itself cites p.263; the name is on p.265) |
| 16 | AF | `term.endedBy` (and `term.end` semantics) | `{type:"election", date:"1961-08-15"}`, "The next Knesset election was held on 1961-08-15" | `type` dissolution law (as in k12 and k19), **date 1961-03-28**, setting the election for 15 Aug 1961. Published SH 335 p.82 on 1961-04-04. | WRONG | P265; O `KNS_IsraelLaw` 2000618 / `KNS_Bill` 147310 | 1 | "נצביע עתה על החוק בקריאה שלישית. הצבעה חוק התפזרות הכנסת הרביעית׳ תשכ״א 1961, נתקבל." Bill text: "הכנסת הרביעית תתפזר לפני גמר תקופת כהונתה … הבחירות לכנסת החמישית יהיו ביום ג׳, ג׳ באלול תשכ״א (15 באוגוסט 1961)" |
| 17 | AF | `gaps[0]`, `gaps[3]`, `gaps[4]` | "result-certification date and the first sitting are not transcribed"; "dissolution/election-date law has not been retrieved"; "government 14's faction splits…" | Stale. The notice is dated 12 Nov 1959 and published 15 Nov 1959 (R). The first sitting was 30 Nov 1959, 16:02 (O `KNS_PlenumSession` 490220). The law is 28 Mar 1961 (#16). "Government 14" belongs to another election. | WRONG | R p.265; O | 1 | R: "י״א בחשון תש״ך (12 בנובמבר 1959)"; O: "ישיבת מליאה בתאריך 30/11/1959 בשעה 16:02" |
| 18 | AF | `government.changes` (empty), `term.events` | `[]` | Add (a) **18 Jul 1960**: Poalei Agudat Yisrael joined the coalition; B. Minz became Minister of Posts. (b) **31 Jan 1961**: Ben-Gurion resigned, so the whole government resigned and continued as a transitional government until 2 Nov 1961. | WRONG (omission) | O GovernmentNum 9: PersonID 2462 שר הדואר 1960-07-18 → 1961-05-30; P136; P223 | 1 | P136: "פועלי אגודת ישראל אינם נכנסים לממשלה בזכותם הם…"; P223 (Eshkol): "בישיבת הממשלה אמש הודיע ראש הממשלה על התפטרותו. דין התפטרות ראש הממשלה, כידוע, כדין התפטרות הממשלה כולה … תישאר ממשלה זאת על כנה" |
| 19 | `data/meta/logos/k4.json` | `logos[0].inUseEvidence`, `.dateEvidence.campaignEvidence` | "the 22 November accession stamp"; "printed issuer מפלגת הפועלים המאוחדת (מפ״ם), Haifa" | The stamp is a Jerusalem municipal advertising-tax stamp, "עד יום 22.XII.1959" (December, not an accession stamp). No "Haifa" is printed; the imprint reads "בהוצאת מפלגת הפועלים המאוחדת (מפ"ם) - האחראי: א. שריד". The year claim, 1959, remains OK. | WRONG (evidence text) | Retained `data/raw/logos/k4/mapam-kra3225-original.jpg` | 1 (artefact) | stamp: "עיריית ירושלים / מס פרסום מודעות / עד יום 22.XII.1959 / שולם" |
| 20 | `data/meta/families/arab-arab-jewish.json` | `elections[k4].members` / `reviewCandidates` | Includes ק, רא, יא, ע, נ; omits **יד** (סיעה עצמאית לערביי ישראל, 3818) and **שת** (מפלגת עבודה ערבית ישראלית, 3369). Neither is listed as a review candidate. | Include them, or state the exclusion reason | UNSUPPORTED | R p.263 (list names) | 1 | "יד סיעה עצמאית לערביי ישראל 3818"; "שת מפלגת עבודה ערבית ישראלית 3369" |
| 21 | M4 | `blocSchemes[id=labour-affiliated-arab-lists].nameHe/nameEn` | "מפא"י/המערך…" / "Mapai/Alignment…" | The Alignment (המערך) did not exist in 1959. For k4 the label should read "מפא"י והרשימות הערביות המסונפות". | UNSUPPORTED (anachronistic wording) | — | — | — |
| 22 | M4, AF | `blocSchemes[first-government].notes[0]`, `government.coalitionSeatsNote` | "support-only lists … rest on Hebrew Wikipedia" | An official source exists: Ben-Gurion's presentation names "מפלגת פועלי ארץ ישראל והמיעוטים" in an 86-member, five-faction government. The coalition values are OK; the note and citation can be upgraded. | UNSUPPORTED (under-cited) | P9 | 1 | "ממשלה של חמש סיעות המונות יחד 86 חברי כנסת: המפלגה הפרוגרסיבית, אחדות העבודה פועלי ציון, מפלגת הפועלים המאוחדת, המפלגה הדתית-לאומית, מפלגת פועלי ארץ ישראל והמיעוטים." |
| 23 | M4 `blocSchemes[pm-recommendations]`; AF `recommendationRounds[0].entries[*]` | per-faction status | "recommended" ×12 lists (120 seats), based on J | Matches J's blanket statement (verified). Per-faction wording could not be read: JPress is behind a bot challenge, so I did not attempt it. | UNVERIFIABLE | J | 3 | "All parties, in their talks with the President, agreed that the Mapai candidate for Prime Minister should be given the task… The President received representatives of the three Arab parties and the Communists." |
| 24 | RR / `candidate-notes.json` | — | Mid-term replacements are not modelled | Six replacements per O (Sneh for Vilner 16 Dec 1959; Yadlin for Becker; Kushnir for Yehuda; Haktin for Allon; Drori for Unichman; Gross for Minz). Information for the fixer; no shown value is wrong. | UNVERIFIABLE (not displayed; outside current model) | O | 1 | — |

## Checked and found OK

| Claim | Where | Source (rank) | Note |
|---|---|---|---|
| Election date 3 Nov 1959 | NR/M4/AF/PD | S (1): "3.11.1959"; J (3): "November 3 elections" | |
| Registered 1,218,483; votes cast 994,306; valid 969,337 | NR `nationalTotals` | S (1); R p.263 total "969337" | |
| Invalid 24,969 | NR | R p.264 §(2): "מספר הקולות שנמצאו פסולים: 24969" | |
| 24 list vote counts | NR `lists[*].votes` | R p.263, every row | Sum equals 969,337 |
| 12 seat counts (47/12/6/17/2/9/1/6/8/3/2/7) | NR `officialSeats` | R p.264 §(3) | |
| Allocation reproduces 120 seats | rule `il-1951-largest-remainder-1`, 1% threshold | Recomputed: quota 7,800.64; א+רא 49 → 47+2; יא+ע 3 → 2+1 | The missing תו–שת pair is inactive, so the result is unchanged |
| Ballot letters of the other 21 lists, and names of א, גד (words), ח, יד, יס, מ, נ, סר, סש (words), פ, צ, ק, רא, רט, רי, רנ (words), שת, תו | NR | R p.263; C headers | |
| No list withdrew; `withdrawn:false` ×24 | PD | C lists exactly the 24 lists in R | |
| Pairs א–רא and יא–ע | NR | A p.125 | |
| 116 of 120 elected names (letter-by-letter against R, and C where it differs) | RR | R pp.264–265; C | Printed forms kept: כהן קלמן (Kahana), כמיס, א-ז׳אהר, רוזנברג, נח׳לה, סמילנסקי |
| 120 bio identities map to the 120 opening-day MKs | `data/meta/bios/k4.json` | O PersonIDs, all StartDate 1959-11-30 | |
| TRF constituents: Agudat 1,3,5; PAI 2,4,6 | M4 `lists[גד].parties` | O factions 215/233 (split 1960-08-09) | |
| Mandate to Ben-Gurion, Tuesday 8 Dec 1959 | AF `formation.events[1]`; M4 pm-recommendations date | P9 "לפני שמונה ימים, ביום השלישי של השבוע שעבר, הטיל עלי נשיא המדינה"; J | |
| Tally 120, all 12 seat-winning lists for Mapai's candidate | AF/M4 | J (3) | Wording quoted in #23 |
| Government 9 confidence vote 17 Dec 1959, 78–33 | AF `formation.events[2]` | P11: "בעד הבעת אמון לממשלה 78 נגד 33" | Sitting 11, 13:18 |
| Government 9 start 17 Dec 1959; PM Ben-Gurion 1959-12-17 → 1961-11-02 (no acting PM) | AF `government`; M4 first-government | O (PM position PersonID 2198, 1959-12-17 → 1961-09-04 → 1961-11-02) | |
| Coalition 86 = א, ב, מ, תו, פ, רא, יא, ע; opposition ח, צ, גד, ק | AF/M4 | P9 (see #22); J (Agudat refusal; General Zionists out) | |
| Government 9 end 2 Nov 1961 (government 10 confidence 63–46) | AF `government.endDate` | O; cited plenum-gov10 | |
| Next election 15 Aug 1961 | AF `term.endedBy.date` (as election date) | P265 bill text; S "15.8.1961" | Type is wrong, see #16 |
| Eichmann captured May 1960; trial opened 11 Apr 1961 | AF `term.events` | Knesset history text (via JVL); cited Asser | |
| Dataset hashes `df29d0db…c924` | `party-lineage.json`, nine family files `sources.k4` / `elections[k4].datasetSha256` | `sha256sum public/data/k4.json` | Current, but the fixes will change them |
| Logo year 1959 for Mapam | `logos/k4.json` | CZA caption "…מפני הצבעה לתנועת החרות, 1959. עיצוב: שמואל כץ. (KRA\3225)"; poster | Evidence-text errors in #19 |
| Results/candidate/agreements gazettes and CBS table retained, with matching hashes | `data/raw/SOURCES.json` | Files on disk | Correction notice T not retained (#15) |
| No English Wikipedia; no partisan wording; Hebrew Wikipedia used only as a labelled secondary source | all k4 files | grep and reading | Colours rest on Hebrew Wikipedia by stated convention (no better source exists) |
| No k4 entries in `election-context.json` or `joint-facts.json`; no k4-specific facts in `src/` apart from the 1959 s.37 rule comment | — | grep | |

## Method notes

- The gazette scans are CCITT G4 images. I decoded them losslessly with Pillow (scratch only) and read them at full
  resolution: 1887×2770 for R and 1858×2767 for C. I zoomed in wherever a single letter mattered.
- Plenum texts are the Knesset's own `.doc` versions, linked from `KNS_DocumentPlenumSession` and decoded as UTF-16.
- YP 718–725 were fetched from olaw.org.il, one request per second, and only their tables of contents were read. Only
  724 carries a k4 correction. Issues after 725 were not checked.
