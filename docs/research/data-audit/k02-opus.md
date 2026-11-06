# Data audit k02 (30 July 1951, 2nd Knesset): Opus auditor

Auditor: Claude Opus (independent; did not read the Codex report). Base: `5f2a4f3` (contains `53cca36`). Accessed:
2026-11-06 for every source below unless stated. Method: [BRIEF.md](BRIEF.md) with
[source-hierarchy.md](../source-hierarchy.md). No data edited, no build run.

Primary documents rendered page by page (PyMuPDF, 150–700 dpi crops), all hashes equal to `data/raw/SOURCES.json`:

- **Results notice**: Reshumot, Yalkut HaPirsumim (YP) 181, 10 Aug 1951, p. 1241, signed by CEC chair Yitzhak
  Olshan, "ד' באב תשי"א (9 באוגוסט 1951)". Retained as `data/raw/research/k02-results.pdf` (sha `ba90a26a…`),
  https://www.gov.il/BlobFolder/dynamiccollectorresultitem/records-results2/he/archive_knesset2_records-results2.pdf
- **Candidates notice**: YP 174, 13 Jul 1951, pp. 1141–1155, signed "ח' בתמוז תשי"א (12 ביולי 1951)". Retained as
  `data/raw/research/k02-candidates.pdf` (sha `4dca7c4e…`),
  https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset2-cand.pdf
- **Connection notice**: YP 177, 26 Jul 1951, p. 1177, retained as `data/raw/k2/agreements.pdf` (sha `ffe25a0f…`),
  https://olaw.org.il/yalkut/yalkut-0177.pdf
- CBS table 27.2 (`data/raw/research/cbs-national-totals-2024.pdf`); Knesset OData membership
  (`data/raw/k2/knesset-odata-members.json`); 1951 election law (`data/raw/k1/law-1951.pdf`); Knesset plenum and
  government-presentation PDFs (fs.knesset.gov.il, main.knesset.gov.il, fetched fresh with the project User-Agent).

## Summary

| Class | Count | Notes |
|---|---:|---|
| OK | 362 | 6 national facts (date, Knesset number, registered, cast, valid, invalid); 17 × votes and 17 × seats; 15 letters; 15 list names; threshold, rule set and full seat reproduction; connection pair; 115 elected names; 120 elected Knesset IDs; first-government scheme (number, date, 15 list placements, 65/55); 21 aftermath facts; party-lineage hash and 9 family hashes; Herut logo; link titles; 3 UI law statements |
| WRONG | 13 | 2 ballot letters (ו shown as ה, טת shown as טח); 2 list names; 5 elected-candidate spellings; UI "roster not available" claim for 2 lists; stale hash in parties.json; 2 stale aftermath gaps |
| UNSUPPORTED | 2 | Mapai-satellite bloc scheme and support-only coalition members rest on Hebrew Wikipedia alone (IDI available); consultation end date 15 Aug |
| UNVERIFIABLE | 0 | |
| DISPUTED | 0 | |

Main points:

- **Votes, seats and totals are all correct.** All 17 list votes and seats equal YP 181 §§1 and 3; invalid 7,515
  equals §2; registered 924,885, cast 695,007 and valid 687,492 equal CBS table 27.2 (valid = sum of list votes).
  My own run of the 1951 law s.38 (1% threshold, Hare quota, largest remainders, צ+סצ as one unit) gives all
  120 gazetted seats.
- **Two ballot letters are wrong (highest severity).** Hapoel HaMizrachi's list "רשימת תורה ועבודה…" ran under
  **ו**, not **ה**, and Emunei Yisrael under **טת**, not **טח**. Both the results notice and the candidates notice
  print these letters. The letters are part of the list ids (`2-ה`, `2-טח`), so the error appears in every file
  that references them. The likely cause is that the transcriber took the results notice's subsection index
  "(ה)" as the ballot letter.
- **Two list names have one wrong word or letter:** "המזרחי **ו**דתיים בלתי מפלגתיים" (the app adds ה) and
  "רשימ**ת** ספרדים ועדות המזרח ותיקים ועולים" (the app has רשימה).
- **Five elected names differ from both official notices.** The app states that it uses candidate-notice spelling,
  but five names do not match it: ששון **סילס** בנימין (app סלים), **ח׳**ניפס צאלח חסן (app חניפס), מעדי **ג׳בר** (app
  גבר), וילנסקה (**בריטשטיין**) אסתר (app ברישטיין), אונ**ה** משה (app אונא). Knesset OData independently has
  "בנימין ששון-סילס", "סאלח חניפס" and "ג'בר מועדי".
- **No withdrawn or missing lists.** YP 174 approves exactly 17 lists, the same 17 as the results notice. ש was
  approved on appeal by the Supreme Court (YP 174 p. 1155). None withdrew. YP 177 records only individual
  candidate withdrawals (Mizrachi #73; Yemenite #64, #51, #54), none of them among the elected.
- **Results notice is retained and was not corrected.** I found no later correcting notice. The OCR of the
  printed totals line is clean, and the notice's own sums are consistent.
- Government formation, confidence votes and the four governments of the term all check out against the plenum
  records. No English Wikipedia URL is used in any k2 file (`grep en.wikipedia` = 0 in `data/meta/k2.json`,
  `aftermath/k2.json`, `bios/k2.json`, `logos/k2.json`, `party-links/k2.json`, `public/data/k2.json`). No reversed
  Hebrew parentheses: all 9 bracketed names, e.g. `מימון (פישמן) עדה` and `וילנר (קובנר) מאיר (בר)`, are well formed.

## Non-OK findings

Severity: **H** high (wrong fact shown to users), **M** medium, **L** low (wording or formatting, or not displayed).

| # | Sev | File | JSON path | Current value | Correct value | Class | Source (rank) | Quote | Accessed |
|---|---|---|---|---|---|---|---|---|---|
| 1 | H | `data/raw/k2/national.reviewed.json` → `public/data/k2.json`; also `data/meta/k2.json` (`blocSchemes[0].blocs[0].members[1]`, `colours[3]`), `data/meta/aftermath/k2.json` (every `letters: "ה"`), `data/raw/k2/rosters.reviewed.json` `lists[4].letters`, `data/meta/party-links/k2.json` key `2-ה`, `data/meta/parties.json` (`listId 2-ה`), `families/religious-parties.json`, `families/national-religious.json`, `tests/historical-k02.test.ts` | `lists[4].letters` (national); `lists[3].letters`/`id` (public: `"2-ה"`) | `ה` (רשימת תורה ועבודה הפועל המזרחי ודתיים בלתי מפלגתיים) | **`ו`** (id `2-ו`) | WRONG | YP 181 p. 1241 §§1, 3, 4 (1); YP 174 p. 1145 (1) | YP 181 §1: "ו  רשימת תורה ועבודה הפועל המזרחי ודתיים בלתי מפלגתיים  46347"; §4: "(ה) מרשימת תורה ועבודה הפועל המזרחי ודתיים בלתי מפלגתיים — ו"; YP 174: "אות הרשימה : ו. הכינוי : רשימת תורה ועבודה הפועל המזרחי ודתיים בלתי מפלגתיים" | 2026-11-06 |
| 2 | H | `data/raw/k2/national.reviewed.json` → `public/data/k2.json`; `data/meta/k2.json` `lists[0].letters`; `data/meta/parties.json` (`listId 2-טח`, `vehicle-2-טח`); `data/meta/party-links/k2.json` key `2-טח` | `lists[6].letters` (national); `lists[15]` (public, `"2-טח"`) | `טח` | **`טת`** (id `2-טת`) | WRONG | YP 181 p. 1241 §§1, 3 (1); YP 174 p. 1147 (1) | YP 181: "טת  אמוני ישראל אחוד ספרדים אשכנזים  4038" and "טת … —"; YP 174: "אות הרשימה : טת. הכינוי : אמוני ישראל אחוד ספרדים—אשכנזים" | 2026-11-06 |
| 3 | M | `data/raw/k2/national.reviewed.json` → `public/data/k2.json`; copied into `families/religious-parties.json`, `families/national-religious.json` | `lists[1].nameHe` (national); `lists[10].nameHe` (public, 2-ב) | `המזרחי והדתיים בלתי מפלגתיים` | `המזרחי ודתיים בלתי מפלגתיים` | WRONG | YP 181 §§1, 3, 4 (1); YP 174 p. 1142 (1) | YP 181: "ב  המזרחי ודתיים בלתי מפלגתיים  10383"; YP 174: "אות הרשימה : ב. הכינוי : המזרחי ודתיים בלתי מפלגתיים" | 2026-11-06 |
| 4 | M | `data/raw/k2/national.reviewed.json` → `public/data/k2.json` | `lists[11].nameHe` (national); `lists[9].nameHe` (public, 2-סצ) | `רשימה ספרדים ועדות המזרח ותיקים ועולים` | `רשימת ספרדים ועדות המזרח ותיקים ועולים` | WRONG | YP 181 §§1, 3, 4 (1); YP 174 p. 1150 (1) | YP 181 §1 and §3: "סצ  רשימת ספרדים ועדות המזרח ותיקים ועולים"; YP 174: "אות הרשימה : סצ. הכינוי : רשימת ספרדים ועדות המזרח ותיקים ועולים" | 2026-11-06 |
| 5 | M | `data/raw/k2/rosters.reviewed.json` → `public/data/k2.json` | `lists[10].electedNames[1]`; public `2-סצ#2.nameHe` | `ששון סלים בנימין` | `ששון סילס בנימין` | WRONG | YP 174 p. 1150 (1); YP 181 §4(יא) (1); Knesset OData PersonID 2670 (1) | YP 174: "2. ששון סילס בנימין  עורך־דין — חבר הכנסת"; YP 181: "2. ששון סילס בנימין"; OData: "בנימין ששון-סילס" | 2026-11-06 |
| 6 | L | as #5 | `lists[9].electedNames[0]`; public `2-נ#1.nameHe` | `חניפס צאלח חסן` | `ח׳ניפס צאלח חסן` | WRONG | YP 174 p. 1150 (1); YP 181 §4(י) (1) | YP 174: "1. ח׳ניפס צאלח חסן  אכר  שפרעם"; Knesset site/hewiki: "סאלח-חסן ח'ניפס" | 2026-11-06 |
| 7 | L | as #5 | `lists[6].electedNames[2]`; public `2-יד#3.nameHe` | `מעדי גבר` | `מעדי ג׳בר` | WRONG | YP 174 p. 1148 (1); YP 181 §4(ז) (1); OData PersonID 2454 (1) | YP 174: "3. מעדי ג׳בר  חקלאי  ירכה"; OData: "ג'בר מועדי" | 2026-11-06 |
| 8 | L | as #5 | `lists[14].electedNames[3]`; public `2-ק#4.nameHe` | `וילנסקה (ברישטיין) אסתר` | `וילנסקה (בריטשטיין) אסתר` | WRONG | YP 174 p. 1153 (1); YP 181 §4(טו) (1) | YP 174: "4. וילנסקה (בריטשטיין) אסתר  מורה"; YP 181: "4. וילנסקה (בריטשטיין) אסתר" | 2026-11-06 |
| 9 | L | as #5 | `lists[4].electedNames[1]`; public `2-ה#2.nameHe` | `אונא משה` (modern spelling) | `אונה משה` (both notices). Knesset today spells it "משה אונא"; keep that in `nameEn`/bio, not in the gazette-spelling field. | WRONG | YP 174 p. 1145 (1); YP 181 §4(ה) (1) | YP 174: "2. אונה משה  חקלאי—חבר הכנסת  שדה־אליהו"; YP 181: "2. אונה משה" | 2026-11-06 |
| 10 | M | `src/app/components/Candidates.tsx:49` with `public/data/k2.json` `lists[15]` (טח/טת) and `lists[16]` (ש) `candidatesUnavailable: true` | — | For these two lists the UI says: "The official candidate list for this election is not available in the sources used here, so the names of those elected are not shown." | The official rosters **are** in the retained YP 174: טת 34 names (p. 1147), ש 16 names (p. 1155). They are untranscribed, not unavailable, which is how the status note itself puts it ("losing-list rosters are untranscribed"). Use a truncated/untranscribed flag or transcribe them. Neither list won a seat, so no elected name is missing. | WRONG | YP 174 pp. 1147, 1155 (1) | "אות הרשימה : טת … 1. מוקוטובסקי אברהם אליהו … 34. מגיד צבי"; "אות הרשימה : ש. … 1. פעילן אדם … 16. סגל שמעון" | 2026-11-06 |
| 11 | L | `data/meta/parties.json` | `sources.k2.sha256` | `a35aeb0bc7749263767031127a6201bd9665832bf6bc8ab3976023c89318589b` | `3783c82e3ab6288208e95f997185b69764d7edfd5f84a5b610069f4dc8639f03` (current `public/data/k2.json`; `party-lineage.json` and all 9 family files already carry it) | WRONG | Internal (`sha256sum public/data/k2.json`) | — | 2026-11-06 |
| 12 | L | `data/meta/aftermath/k2.json` | `gaps[4]` | "Replacement-coalition snapshots are partial: government 14’s faction splits and current seat counts require a separate audit…" | Stale text copied from another election: government 14 is not in this term (governments 3–6). Remove it, or restate it for governments 4–6, which use election-list seats despite the 1951–55 faction changes. | WRONG | Internal; plenum records below | — | 2026-11-06 |
| 13 | L | `data/meta/aftermath/k2.json` | `gaps[0]` | "Official result-certification date and the first sitting are not transcribed" | Both are now available. The results notice is signed **9 Aug 1951** ("ד' באב תשי"א (9 באוגוסט 1951)") and published in YP 181 on 10 Aug 1951. The first sitting was **20 Aug 1951** (OData StartDate for all 120 opening members; JTA 14 Aug 1951 reports the session was scheduled for 20 Aug). | WRONG | YP 181 (1); `data/raw/k2/knesset-odata-members.json` (1) | YP 181 p. 2: "ד' באב תשי"א (9 באוגוסט 1951) … יצחק אולשן … יושב ראש ועדת הבחירות המרכזית"; OData: `"StartDate": "1951-08-20T00:00:00"` ×120 | 2026-11-06 |
| 14 | L | `data/meta/k2.json` | `blocSchemes[1]` (labour-affiliated-arab-lists) `.sources`; `blocSchemes[0].sources[1]` and `notes[0]` (support-only coalition lists) | Hebrew Wikipedia is the sole basis for the satellite status of יד, נ and ע, and for their counting in the coalition | Assignments are correct. Add IDI (rank 2), e.g. "one of the minority satellite lists of Mapai" (IDI party profile). For coalition support, the 8 Oct 1951 plenum record (rank 1) has a coalition speaker counting "בערך 65 חברי כנסת עומדים מאחורי הממשלה, 51 נגדה, 4 … נמנעים" (65 = 45+8+2+3+2+3+1+1, including the three Arab lists). | UNSUPPORTED (Hebrew WP sole basis) | IDI EN https://en.idi.org.il/israeli-elections-and-parties/parties/the-democratic-list-for-israeli-arabs/ (2); IDI HE https://www.idi.org.il/policy/parties-and-elections/parties/hareshima-hademocratit/ (2); plenum 2_ptm_250617 (1) | IDI: "was one of the minority satellite lists of Mapai. Its representatives received seats in the Second Knesset in 1951"; IDI HE: "מפלגת לוויין של מפא"י שנכנסה לכנסת השנייה והשלישית" | 2026-11-06 |
| 15 | L | `data/meta/aftermath/k2.json` | `recommendationRounds[0].endDate`, `formation.events[0].endDate` | `1951-08-15` | Not settled by the cited source. The JTA bulletin is datelined **14 Aug 1951** ("datePublished 1951-08-14") and says consultations "will conclude tomorrow". JTA bulletins usually report the previous day's events under the next day's date, so the close was 14 or 15 Aug. Keep 15 Aug only with a note, or show "mid-August". | UNSUPPORTED | JTA 14 Aug 1951 (4) https://www.jta.org/archive/weizmann-continues-consultations-with-party-leaders-on-composition-of-government | "President Weizmann today resumed his consultations … His consultations will conclude tomorrow when he hears the views of the delegates of the Agudas Israel, Mizrachi and the remaining two Arab groups." | 2026-11-06 |

Notes on #1–#2: the decision-0064 roster cross-check and `historical-k02.test.ts` both use the wrong letters, so
they could not catch this error. The correct ballot letter appears beside each list in all three places in YP 181
(§1, §3, and the §4 headings).

## Gaps and observations (not counted above)

- **Replacements not noted.** `data/meta/candidate-notes.json` has no k2 entries. OData lists 11 later entrants
  (2 Progressives on 1951-09-10, Shostak 1951-11-02, Tzabari 1952-04-04, Kalfon 1952-07-13, Ben-Meir 1952-08-14,
  Nitzani 1952-12-08 after Ben-Zvi became President, Hillel 1952-12-21, Ben-Yaakov 1953-05-25, Cohen-Meguri
  1953-07-06, Kamin 1953-12-01). The brief asks whether they are noted; this matches the documented
  "later changes not applied" policy.
- **Aftermath (status `pilot`, not wired).** The government 3 card does not record that Agudat Yisrael and Poalei
  Agudat Yisrael left the coalition during government 3 (1952). `term.start` is the election day
  (1951-07-30), not the first sitting (1951-08-20). This is fine as a chronology window, but it should not be
  labelled as the start of the Knesset term.
- **Gov 6 formation event order.** The `mandate-given` event (6 p.m., 29 Jun 1955) is listed after that
  evening's confidence vote; both dates are correct.
- **Name fields propagate.** The wrong names in #3 also appear as `nameHe` in `families/religious-parties.json`
  and `families/national-religious.json`, and the wrong letters (#1, #2) in `parties.json`, `party-links/k2.json`
  and `aftermath/k2.json`. The fix needs a repo-wide replacement of `2-ה` → `2-ו` and `2-טח` → `2-טת` (data
  files and tests), followed by a rebuild and new hashes.
- YP 181's own misprints, which the app correctly does not follow: "רימלס" for רימלט (YP 174 prints רימלט) and
  "ה' באב" in the footer for ח' באב.
- Agudat Yisrael: YP 174 prints "רשימת עם התורה — אגודת ישראל" with a dash; YP 181 prints it without one, and the
  app follows YP 181. Acceptable.

## Checked and found OK

| Area | What | Source (rank) | Evidence |
|---|---|---|---|
| Totals | registered 924,885; cast 695,007; valid 687,492; invalid 7,515; date 30.7.1951; Knesset 2 | CBS table 27.2 (1); YP 181 §2 (1) | CBS row: "687,492 1.1 75.1 695,007 924,885 30.7.1951 2"; YP 181: "(2) מספר הקולות שנמצאו פסולים: 7515"; Σ list votes = 687,492 |
| Votes | All 17: 256456, 10383, 13799, 11194, 46347, 45651, 4038, 16370, 7965, 86095, 8067, 12002, 7851, 22171, 111394, 27334, 375 | YP 181 §1 (1) | Every value equal |
| Seats | 45/2/3/2/8/8/0/3/1/15/1/2/1/4/20/5/0 | YP 181 §3 (1) | Every value equal; independent s.38 run reproduces all 120 (quota 683,079/120 = 5,692; threshold 6,874.92 excludes טת and ש) |
| Rule set | 1% threshold; largest remainder, one extra seat at most | 1951 law s.38 (1), `data/raw/k1/law-1951.pdf` | "ישתתפו רק רשימות … במספר שאינו פחות מ־1% (אחד למאה) … תזכה כל אחת מהן במנדט אחד נוסף" |
| Connection | צ–סצ, the only pair | YP 177 p. 1177 (1), 20 Tammuz (24 Jul 1951) | "על התקשרות רשימת הסתדרות הציונים הכלליים — מפלגת המרכז (צ) ורשימת ספרדים ועדות המזרח, ותיקים ועולים (סצ)" |
| Letters | א ב ג ד ח יד ל מ נ סצ ע פ צ ק ש | YP 181, YP 174 (1) | Equal (except #1, #2) |
| Names | 15 of 17 list names, including "הסתדרות הציונים הכלליים — מפלגת המרכז", "רשימת החקלאות והפתוח", "למען העולים החדשים והחיילים המשוחררים" | YP 181 §§1, 3 (1) | Equal (except #3, #4) |
| Lists | 17 approved = 17 results; none withdrew | YP 174 (1); YP 177 (1) | 17 "אות הרשימה" headers; YP 177 records only candidate withdrawals |
| Elected | 115 of 120 names in rank order, each list's elected prefix starting at rank 1 | YP 174 (1); YP 181 §4 (1) | Name by name (except #5–#9), including the 2026-11-04 corrections (שפר, טברסקי ז׳ניה, אזניה (איזנשטט), בז׳רנו, סוזייב, סטופ, זיסמן, פרלשטין) |
| Knesset IDs | 120 `knessetPersonId` in `bios/k2.json` | OData (1) | Set equal to the 120 opening members (StartDate 1951-08-20); no duplicates, no nulls |
| Government | Gov 3, sworn 8 Oct 1951; coalition א ו ב ג ד יד נ ע = 65; opposition צ מ ח ק פ סצ ל = 55; main opposition צ | Plenum sitting 13, 8 Oct 1951 (1) https://fs.knesset.gov.il/2/Plenum/2_ptm_250617.pdf; OData ministers (1) | "בעד הצעת חבר־הכנסת ט. ארגוב (הבעת אמון לממשלה) 56, נגד 40, נמנעים 4 … הכנסת השניה בחרה את ממשלת ישראל" |
| Recommendations | One round, Weizmann; all 15 lists "unknown" (no invented positions); mandate to Ben-Gurion 20 Aug 1951 | JTA 14 Aug 1951 (4); gov3.pdf, sitting 12, 7 Oct 1951 (1) | "בעשרים לאוגוסט, הטיל עלי הנשיא הרכבת ממשלת הכנסת השניה" |
| Formation, Gov 4 | Resignation Fri 19 Dec 1952; mandate 21 Dec; confidence 63–24 on 23 Dec; declarations 24 Dec; Gov 3 end 24 Dec 1952; coalition א צ ו ב פ + יד נ ע = 84 | gov4.pdf = sitting 155, Mon **22** Dec 1952 (1); 2_ptm_250692 sitting 158, 23 Dec (1); 2_ptm_250350 sitting 159, 24 Dec (1) | "ביום ו' שעבר הגשתי לנשיא התפטרות הממשלה, ואתמול הטיל עלי…" (spoken 22 Dec → 19 and 21 Dec) |
| Gov 5 | Sharett; presented 25 Jan 1954, confidence 75–23–5 on 26 Jan 1954; four of five previous factions (Progressives out) = 80 | gov5.pdf (1); 2_ptm_250781 (1) | "נתמכת על־ידי ארבע מחמש הסיעות … מפלגת פועלי ארץ־ישראל, הציונים הכלליים, הפועל המזרחי והמזרחי"; "75 … 23 … 5 נמנעים" |
| Gov 6 | Sharett resigned and was re-tasked on 29 Jun 1955; confidence 66–32–3; Mapai, Mizrachi, Hapoel HaMizrachi, Progressives + Yemenite = 65 | gov6.pdf (1); 2_ptm_250532 (1) | "ובשעה שש אחר הצהרים הזמינני והטיל עלי…"; "66 … 32 … 3 נמנעו" |
| PM tenure | Ben-Gurion to Gov 5, then Sharett; no acting PM skipped | as above | Gov 5 presentation: "התפטרותו האישית של ראש־הממשלה" |
| Term | End by election 26 Jul 1955 | IDI (2); CBS (1) "26.7.1955" | Regular end; no dissolution act |
| Term events | Ma'ale Akrabim, 17 Mar 1954, terrorists named as such; Egypt executes two Jews convicted of spying for Israel, 31 Jan 1955 | UN S/3252 (1); Knesset history; MFA (1) | Quotes in file confirmed against their sources; wording meets the editorial stance |
| Hashes | `party-lineage.json` and 9 family files carry k2 sha `3783c82e…` | `node scripts/validate-families.ts` | "Validated 9 presets across k1–k26, registry and lineage." (except #11) |
| Logo | Herut 1951 emblem; Jabotinsky Institute item 33385 | Archive record; asset sha | Record: "אסיפה פומבית, נועדה ל־14.7.1951 … גוף יוצר: תנועת החרות … שנה לועזית: 1951, סוג התאריך: שנה נכונה"; downloaded asset sha `1b65a2f4…` = `originalSha256` |
| Links | Results-PDF links titled "הודעת התוצאות לכנסת 2" | YP 181 (1) | That PDF is the results notice, so the titles are correct; hewiki targets are the right entities |
| UI | Glossary: 1% threshold 1951–1988; largest remainder 1951–1969, one extra seat at most; no tie rule | 1951 law s.38 (1) | As quoted above |
| Context | No k2 rows in `election-context.json` or `joint-facts.json`; meta note "no alliance of separate parties in 1951" | YP 174 (1) | Mizrachi, Hapoel HaMizrachi, Agudah and Poalei Agudah ran as separate lists ב, ו, ג, ד |

Access notes: knesset.gov.il, fs.knesset.gov.il, jta.org, jabotinsky.org and infocenters.co.il all answered HTTP 200
to scripts with the project User-Agent. The Knesset English faction page was not available to Exa. JPress was not
used. No challenge or paywall was circumvented.
