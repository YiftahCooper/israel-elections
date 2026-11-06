# Data audit k18 (10 February 2009, 18th Knesset): Opus auditor

Auditor: Claude Opus (independent; did not read the Codex report). Base: `d2c1ed0` (contains `53cca36`). Accessed:
2026-11-06 for every source below unless stated. Method: [BRIEF.md](BRIEF.md) with
[source-hierarchy.md](../source-hierarchy.md). No data edited, no build run.

Retained official files re-read in full for this audit (text layer via `scripts/lib/pdf-text.ts`):
`data/raw/k18/results.pdf` = **Reshumot YP 5917, 17 Feb 2009, pp. 2400–2404, the statutory results notice** (so the
"gazette results notice not retained" class does not apply here); `candidates.pdf` = YP 5909, 29 Jan 2009, pp.
2092–2106 (approved lists); `surplus.pdf` = YP 5912, 2 Feb 2009, p. 2254 (agreements **and** candidate-resignation
notices); `allocation.pdf` = CEC allocation memorandum (Form 30); data.gov polling-station file (9,264 rows, in
`.backup-scratch/raw/k18/ballots.datagov.json`); Knesset OData (retained members file, plus a live query of
`KNS_PersonToPosition?$filter=GovernmentNum eq 32`).

## Summary

| Class | Count | Notes |
|---|---:|---|
| OK | 568 | Counted per field: date and totals (7), 33 lists × letters/name/votes/seats (131 of 132), 8 agreements, rule set/threshold/quota (3), 33 roster sizes, 120 elected names (119 of 120), 120 elected Knesset IDs, 26 joint-list constituent assignments, first-government scheme (11), recommendation round (17), aftermath formation/term (21), context events (3), 41 party links (40 of 41), 7 logos (6 of 7), 9 family dataset hashes, 2 UI text claims, 12 conventional English short names. Non-elected bio links were sampled, not counted |
| WRONG | 5 | A withdrawn list omitted entirely; reversed Hebrew parentheses (list name; 2 candidates); a stale aftermath gap; English-name whitespace/backtick artefacts |
| UNSUPPORTED | 5 | UTJ-accession citation is Hebrew WP only with an elliptical quote, and its gap text is stale; resignations in the retained YP 5912 not noted; party "names" that are list names; Likud logo "design date" wording; Hebrew WP as sole basis for constituent assignments where rank-1/4 sources exist |
| UNVERIFIABLE | 1 | Hadash "2009 platform" PDF is a Nov 2012 web printout |
| DISPUTED | 1 | Yisrael Beiteinu #9: candidate gazette name vs results-notice name (rank 1 vs rank 1) |

Main findings:
1. **List פח "מהפך בחינוך" (Mahapach BeHinuch) is missing from the app.** It was an approved list (YP 5909), all
   12 of its candidates resigned before election day (YP 5912), and the CEC memorandum lists it as one of 34 lists
   with 0 votes. The app shows 33 lists. Precedent (k22/k23) is to keep such a list with `withdrawn: true`.
2. **Reversed parentheses** in the Hadash list name (displayed for a seat-winning list) and in two candidate names.
3. **Stale aftermath gap text** ("No included term event meets the two-chronology rule", while two such events are
   included; "UTJ accession date … a direct contemporary source is still needed", while contemporary sources exist
   and confirm 1 April 2009).

Classes from earlier elections checked and **not** found here: results date off by one (the YP 5917 notice is dated
16 Feb, published 17 Feb; `status.asOf` 2009-02-17 is right); recommendation tallies/dates (all 12 factions, 65/28/27,
18–19 Feb, all confirmed); joint-list faction counts (all re-derived by rank from the gazette, not name matching);
party links pointing at a later party (both doubtful ones, נ → עלי"ה and פי → ברית עולם, are the right parties);
blocs without sources; logo digests (all five Wayback digests recompute); events attached to the wrong list.

No English Wikipedia anywhere in the k18 files (`grep -c en.wikipedia` = 0 in `public/data/k18.json`,
`data/meta/k18.json`, `aftermath/k18.json`, `bios/k18.json`, `logos/k18.json`, `party-links/k18.json`).

## Non-OK findings

Severity: **H** high (wrong fact shown to users), **M** medium, **L** low (wording, formatting, citation quality, or
not displayed).

| # | Sev | File | JSON path | Current value | Correct value | Class | Source (rank) | Quote | Accessed |
|---|---|---|---|---|---|---|---|---|---|
| 1 | M | `scripts/lib/historical/k18.ts` / `k18-k19-common.ts` build → `public/data/k18.json`; `docs/DATA.md:342` | `lists` (no entry for `18-פח`) | List absent; app shows 33 lists. DATA.md: "The approved פח roster has no final votes and is not included among participating lists." | Add `18-פח` "מהפך בחינוך" with `votes: 0`, `withdrawn: true`, its 12-candidate roster, and a note that all 12 candidates resigned (28 Jan and 1 Feb 2009). 34 lists were approved and on the CEC's own list. | WRONG | (a) CEC allocation memorandum, `data/raw/k18/allocation.pdf` p. 2 and p. 3 (1) https://www.gov.il/apps/elections/elections-knesset-18/heb/about/Electoral_result.pdf; (b) YP 5909 p. 2102 (1) `data/raw/k18/candidates.pdf`; (c) YP 5912 p. 2254 (1) https://olaw.org.il/yalkut/yalkut-5912.pdf; (d) IPU Parline (international official) https://data.ipu.org/election-summary/HTML/2155_09.htm | (a) "א. רשימות המועמדים לפי הפרסום ברשומות, ילקוט הפרסומים מס' 5909 … .24 פח מהפך בחינוך"; "ג. … . 24 פח 0". (b) "אות הרשימה : פח / כינוי הרשימה : מהפך בחינוך / 1 פסקל אברהם … 12 ויינריך איתן". (c) "ציון עמר, אריה לוקר, בוריס מנור, ישראל גלבוע, משה בן–דוד, אברהם מאיר גבאי ומריוס לוי שפרן, מרשימת מהפך בחינוך … התפטרו ביום ג' בשבט התשס"ט (28 בינואר 2009)"; "אברהם פסקל, יצחק מימון, ניצה שרה בראל, לבנה ניר ואיתן ויינרייך, מרשימת מהפך בחינוך התפטרו ביום ז' בשבט התשס"ט (1 בפברואר 2009)". (d) "A total of 34 parties participated in the 2009 elections." The data.gov polling file has no פח column, and YP 5917 omits it, both consistent with withdrawal. | 2026-11-06 |
| 2 | M | `data/raw/k18/results.pdf` transcription → `public/data/k18.json`; `data/meta/parties.json`; `data/meta/families/arab-arab-jewish.json` | `lists[8].nameHe` (18-ו); `parties[id=hadash].names[date=2009-02-10].nameHe`; family member `nameHe` | `חד"ש החזית הדמוקרטית לשלום ושיוויון )המפלגה הקומוניסטית הישראלית וחוגי ציבור ערבים ויהודים(` | `… ושיוויון (המפלגה הקומוניסטית הישראלית וחוגי ציבור ערבים ויהודים)`: logical parentheses were reversed by PDF text extraction, so they render backwards in RTL | WRONG | YP 5909 and YP 5917 p. 2400 (1), rendered page; same artefact appears in the text layer of all four PDFs | Rendered: "ו חד"ש החזית הדמוקרטית לשלום ושיוויון (המפלגה הקומוניסטית הישראלית וחוגי ציבור ערבים ויהודים) 112,130" | 2026-11-06 |
| 3 | L | `data/raw/k18/candidates.pdf` transcription → `public/data/k18.json` | `lists[2].candidates[4].nameHe` (18-ל#5); `lists[5].candidates[102].nameHe` (18-ג#103) | `לנדבר סופיה )סוניה(`; `הלפרט שמואל )שמלקי(` | `לנדבר סופיה (סוניה)`; `הלפרט שמואל (שמלקי)` | WRONG | YP 5909 (1); YP 5917 §4(ח) #5 (1) | YP 5917: "5 לנדבר סופיה (סוניה)" | 2026-11-06 |
| 4 | L | `data/meta/aftermath/k18.json` | `gaps[5]` | "No included term event meets the two-chronology rule." | Remove (stale): `term.events` holds two included events (`shalit-exchange-2011`, `pillar-defense-2012`), each with two or more chronologies cited | WRONG | Internal: `term.events[0].cites` (ICT + SIPRI + Reuters), `term.events[1].cites` (IDF + SIPRI + Reuters) | n/a | 2026-11-06 |
| 5 | L | `data/meta/aftermath/k18.json`; `data/meta/k18.json` | `gaps[2]`; `blocSchemes[0].sources[2]` (first-government, UTJ "joined 2009-04-01") | Gap says a direct contemporary source "is still needed"; the only cited source for UTJ in the coalition is Hebrew WP with the elliptical quote "יהדות התורה ... ג ... קואליציה" | Value **2009-04-01 is correct**. Cite JTA and N12 (1 Apr 2009) and remove the gap. Optional: Knesset OData shows UTJ's deputy ministers from 2009-04-06 (Litzman, Porush), which a future government-change event could use. | UNSUPPORTED | JTA 1 Apr 2009 (4) https://www.jta.org/2009/04/01/israel/united-torah-judaism-joins-government; N12 1 Apr 2009 (4) https://www.mako.co.il/news-military/politics/Article-201ce7012b16021004.htm; Knesset OData `KNS_PersonToPosition?$filter=GovernmentNum eq 32` (1) | JTA: "The coalition deal between the United Torah Judaism and Likud parties was completed late Wednesday morning, just hours after Prime Minister Benjamin Netanyahu's new Cabinet was sworn in." N12 (01.04.09): "יום לאחר הקמת הממשלה, נחתם סופסוף ההסכם הקואליציוני עם מפלגת יהדות התורה". OData: ליצמן יעקב, PositionID 40, "סגן שר במשרד הבריאות", StartDate 2009-04-06 | 2026-11-06 |
| 6 | L | `public/data/k18.json` (from build); `data/meta/candidate-notes.json` | `lists[*].notesHe` for 18-אמת#48, 18-ט#12, 18-מרצ#12, 18-צי#11 (and the פח roster, see #1) | `[]` (no notes). Status says "Candidate rosters are the original gazette snapshot; subsequent changes are not applied" | Add resignation notes as in k22: פהים גאנם (אמת #48), שמואל חרמש (ט #12), אבתיסאם מראענה (מרצ #12) resigned 26 Jan 2009; עינב בנימין (צי #11) resigned 28 Jan 2009. None affects who was elected (all below the cut-off). The source is already retained (`surplus.pdf`). | UNSUPPORTED | YP 5912 p. 2254 (1) `data/raw/k18/surplus.pdf` | "נמסרת בזה הודעה כי פהים גאנם, מרשימת העבודה בראשות אהוד ברק, שמואל חרמש, מרשימת האיחוד הלאומי-תקומה, התקווה, ארץ ישראל שלנו, מולדת ואבתיסאם מראענה, מרשימת התנועה החדשה מרצ, התפטרו ביום א' בשבט התשס"ט (26 בינואר 2009)"; "… ועינב בנימין, מרשימת צבר - מפלגת הצעירים של ישראל, התפטרו ביום ג' בשבט התשס"ט (28 בינואר 2009)" | 2026-11-06 |
| 7 | L | `public/data/k18.json` | `lists[2].candidates[8].nameHe` (18-ל#9, elected) | `סאמואלסון מיכלבסקי אנסטסיה` | Both are official: YP 5909 (approved list, 29 Jan) prints `סאמואלסון מיכלבסקי אנסטסיה`; YP 5917 §4(ח) (results notice, 17 Feb, list of those elected) prints `מיכאלי סאמואלסון אנסטסיה`; Knesset OData has `מיכאלי אנסטסיה`. Keep the roster spelling per the stated snapshot policy, but note the results-notice name (the later document, closer to the act of election). | DISPUTED | YP 5909 (1); YP 5917 p. 2403 (1); Knesset OData KNS_Person (1) | YP 5917: "9 מיכאלי סאמואלסון אנסטסיה"; YP 5909: "9 סאמואלסון מיכלבסקי אנסטסיה" | 2026-11-06 |
| 8 | L | `public/data/k18.json` (from Knesset names) | `lists[0].candidates[5].nameEn`, `[0].candidates[34].nameEn`, `[1].candidates[5].nameEn`, `[1].candidates[7].nameEn`, `[1].candidates[26].nameEn` | `Ze`ev Boim`, `Akram  Hasson`, `Moshe  Kahlon`, `Moshe Ya`alon`, `Miri Miriam  Regev` | `Ze'ev Boim`, `Akram Hasson`, `Moshe Kahlon`, `Moshe Ya'alon`, `Miri Miriam Regev` (or `Miri Regev`): backtick for apostrophe and double spaces are source artefacts | WRONG | Formatting; Knesset OData raw names (1) carry the same artefacts | n/a | 2026-11-06 |
| 9 | L | `data/meta/parties.json` | `parties[id=labor|shas|kadima|yisrael-beiteinu|daam].names[date=2009-02-10].nameHe` | List ballot names, e.g. labor = "העבודה בראשות אהוד ברק", kadima = "קדימה - עם ציפי לבני לראשות הממשלה" | These are list names (כינוי הרשימה), not party names. YP 5909 does not print sponsoring parties, so the party names cannot be read from it. Label these entries as list names, or use registered party names from another source. Same class as k22 finding 11. | UNSUPPORTED | YP 5909 (1): only "אות הרשימה" and "כינוי הרשימה" lines | "כינוי הרשימה : העבודה בראשות אהוד ברק" | 2026-11-06 |
| 10 | L | `data/meta/logos/k18.json` | `logos[0].inUseEvidence` (Likud, מחל) | "Commons gives the design date as 3 January 2009, during the campaign …" | Commons gives 3 January 2009 as the **file date** of a vectorised upload ("This is a vectorized version of Image:Likud Logo.png", uploaded 00:56, 4 Jan 2009), not a design date. The asset used (`archive/5/50/20121109014218!Likud_Logo.svg`, 6,613 bytes) is that 2009 revision, so the logo existed during the campaign. Reword to "Commons file (uploaded 4 Jan 2009) …". | UNSUPPORTED | Wikimedia Commons file page (secondary) https://commons.wikimedia.org/wiki/File:Likud_Logo.svg | File history: "00:56, 4 January 2009 … {{Information |Description={{en|1=Logo of the Likud Party}} |Source=This is a vectorized version of Image:ikud Logo.png |Author=Likud Party |Date=January 3, 2009" | 2026-11-06 |
| 11 | L | `data/meta/k18.json` | `lists[*].parties[*].sources` (Likud–Ahi, UTJ, National Union, Ra'am–Ta'al, Meretz, Green–Meimad) and `blocSchemes[0].sources[0..2]` | Hebrew Wikipedia is the only source for every constituent rank assignment and for the formation date/members (with OData on ministers) | Values are correct (see OK table). Add the better sources found: Walla 25 Dec 2008 for Ahi #39; Globes 11 Feb 2009 for Moses #5; YP 5917 p. 2405 for Uri Bank as the Moledet faction's representative; IDI (3) for the 69-seat five-party coalition; JPost/Walla for the recommendation round (already partly cited). Ahi #45 (Edmond Hasin) found only in Hebrew WP/Hamichlol. | UNSUPPORTED | see OK table | see OK table | 2026-11-06 |
| 12 | L | `data/meta/party-links/k18.json` | `lists["18-ו"][0]` ("חד"ש — מצע 2009", https://www.idi.org.il/media/6525/hadash-2009org.pdf) | Titled "מצע 2009" | The PDF is a browser printout dated 18/11/2012 of hadash.org.il/matzahadash/. The content fits 2009: it mentions the Gaza war followed by the Second Lebanon War and free education from age 3 "עד שנת 2011". It may, however, be the page as it stood before the 2013 election. Retitle as "platform as published on hadash.org.il (printed Nov 2012)", or find a dated 2009 copy. The other four IDI platforms are dated for 2009 / the 18th Knesset. | UNVERIFIABLE | IDI-hosted PDF (party material) | Footer on every page: "18/11/2012 http://hadash.org.il/matzahadash/" | 2026-11-06 |

### Finding 1 in detail (for the fixer)

- The builder already knows about the list: `k18-k19-common.ts:155` asserts `zeroColumns: n === 18 ? ['פח'] : …`
  ("withdrawn lists' columns must hold no votes"), and the roster is in the retained YP 5909. Adding it means emitting
  one more list with `withdrawn: true`, as k22/k23 do (DATA.md documents `withdrawn` for k23 Tzomet).
- All 12 candidates are named in the two YP 5912 notices (7 + 5), so the whole list resigned. I found no press report
  of the withdrawal itself; the gazette notices are rank 1 and sufficient.
- `public/data/k18.json` `officialSeats` and the seat test are unaffected (0 votes, 0 seats). `tests/historical-k18`
  and the differential digest will change only by the added list.

### Note on invalid votes (already handled, counted OK)

YP 5917 §2 prints "מספר הקולות שנמצאו פסולים 49,684"; the CEC memorandum p. 3 prints 43,097 ("קולות פסולים ומעטפות
ללא פתקי הצבעה"), and the data.gov polling file sums to exactly 43,097 (`פסולים`), with `מצביעים` 3,416,587 and
`כשרים` 3,373,490. 43,097 satisfies valid + invalid = cast; 49,684 does not. The data already uses 43,097, discloses
the gazette figure in `status.noteEn/He` and in `election-context.json` `result-source-comparison-k18`, and decision
0040 records it. No action needed. I found no published correction notice. Unlike k22, I could not explain 49,684
arithmetically (the difference is 6,587).

## Editorial-stance and source-quality flags (not counted above)

- `aftermath/k18.json` `term.events[0]` (Shalit): "in a prisoner exchange between Israel and Hamas" is neutral. Under
  the stance it could read "the Hamas terrorist organisation", consistent with `term.events[1]`, which already uses
  "Gaza terrorist organizations". Not wrong; the owner may want consistency.
- `election-context.json` `eligibility-final-k18-8/9` cite IDI (rank 3) as "secondary". Two better sources are
  reachable: the Supreme Court judgment of 21 Jan 2009 (rank 1, EA 561/09) and IPU Parline (international
  official), which says: "In January 2009 the High Court of Justice overturned the Central Elections Committee's
  decision to disqualify two Arab parties - Balad and the United Arab List (Ta'al)".
- `data/meta/k18.json` `colours[*]` are sourced only to Hebrew Wikipedia infobox colours and labelled "Not an official
  party specification". This matches DATA.md, so it is noted, not raised.
- `data/meta/k18.json` Meretz: rank 2 (Ilan Gilon, elected) is left unassigned, although he was a Meretz MK. This is
  conservative, not wrong; `coverage.electedAssigned` is 2 of 3.
- No partisan wording found in k18 text fields. Formation events are factual and attributed. Pillar of Defense uses
  the Israeli operation name and terror terminology, per the stance.

## Checked and found OK

| Area | Claims | Value(s) | Source (rank) and quote/evidence |
|---|---|---|---|
| Election date, Knesset number | `electionDate`, `knesset`, `nameHe/En` | 2009-02-10; 18 | CEC memorandum p. 1 (1): "שהתקיימו ביום ט"ז בשבט התשס"ט (10 בפברואר 2009)"; YP 5917 title "הודעה על תוצאות הבחירות לכנסת השמונה עשרה" (1) |
| Results date | `status.asOf` | 2009-02-17 | YP 5917 masthead "כ"ג בשבט התשס"ט 5917 17 בפברואר 2009"; signed "כ"ב בשבט התשס"ט (16 בפברואר 2009)" by Eliezer Rivlin, CEC chairman (1); N12 18 Feb 2009 (4): "התוצאות הסופיות … רק אתמול פורסמו ברשומות" |
| National totals | `registered`, `votesCast`, `invalid`, `valid` | 5,278,985; 3,416,587; 43,097; 3,373,490 | CEC memorandum p. 3 (1): "מספר בעלי זכות לבחור …5,278,985 / 3,416,587 הצביעו / 43,097 קולות פסולים … / מספר הקולות הכשרים …3,373,490"; data.gov polling sums (1): מצביעים 3,416,587, כשרים 3,373,490, פסולים 43,097; `valid` also YP 5917 §1 "סך כל הקולות הכשרים 3,373,490" (1); IPU (turnout ≈ 65%) |
| Derived totals | `ballotBoxes`, `envelopeVotes` | 9,264; 186,919 | data.gov polling file: 9,264 rows (1); בז"ב sum 5,465,904 = 5,278,985 + 186,919, consistent with DATA.md's account of the code-0 envelope row |
| Votes, 33 lists | `lists[*].votes` | Kadima 758,032 … Lohamei Hevra 611 | YP 5917 §1 (1), CEC memorandum §ג (1) and data.gov column sums (1): all 33 identical |
| Seats, 33 lists | `officialSeats` | כן 28, מחל 27, ל 15, אמת 13, שס 11, ג 5, עם 4, ט 4, ו 4, ב 3, ד 3, מרצ 3; others 0 | YP 5917 §3 (1); CEC memorandum §יא–יב (1), reproducing every Bader-Ofer step |
| Ballot letters, 33 | `lists[*].letters` | as dataset | YP 5909 (1), YP 5917 (1) |
| Hebrew list names, 32 of 33 | `lists[*].nameHe` | as dataset (except Hadash, finding 2) | YP 5917 §1 (1) word for word. The memorandum uses variants ("מפד"ל", "בל"ד - אלתג'מוע…", "לוחמי חברה מאוחדים" without "בראשות יגאל אנקורי"); the dataset follows the gazette, the right base |
| English short names | `shortEn` (12 seat-winning lists) | Kadima, Likud, Yisrael Beiteinu, Labor, Shas, UTJ, Ra'am–Ta'al, National Union, Hadash, Meretz, Jewish Home, Balad | Conventional usage in JPost/JTA (4), e.g. JPost 19 Feb 2009: "Habayit Hayehudi, Israel Beiteinu, Shas, National Union and United Torah Judaism" |
| Rule set | `ruleSetId` il-2004-bader-ofer-2 | 2% threshold, quota | CEC memorandum p. 4–5 (1): "2.00% (שני אחוזים) ממספר הקולות הכשרים 67,470"; "המודד הוא … 27,246"; matches DATA.md "threshold 67,470 and quota 27,246" |
| Surplus agreements (8) | `agreements[*]` | אמת–מרצ, מחל–ל, כן–רק, ב–ט, זך–צי, שס–ג, ו–עם, חי–ה | YP 5912 p. 2254 (1): items 1–8 exactly; memorandum §ז (1): five took effect, and "לא תקפות ההתקשרויות" for חי–ה, רק–כן, צי–זך (threshold) |
| Roster sizes | 33 lists, 1,613 candidates | e.g. מחל 118, שס 114, עם 115, ד 105 | YP 5909 (1): highest rank per list equals the dataset count for all 33 (פח, 12, absent; finding 1) |
| Elected members | first N of each list | 119 of 120 names identical | YP 5917 §4 (א)–(יב) (1), name by name (exception: finding 7). Resigned candidates (#48, #12, #12, #11) all sit below their lists' cut-offs, so no elected name is affected |
| Elected Knesset IDs | `bios/k18.json candidates[*].knessetPersonId` | 120 of 120 | Retained OData (1): 120 distinct PersonIDs, all with membership StartDate 2009-02-24; surnames match allowing spelling (שיטרית/שטרית, אדאטו לוי/אדטו, Michaeli) |
| Knesset sworn in | `aftermath results.knessetSwornIn` | 2009-02-24 | Knesset OData (1): every opening membership starts 2009-02-24; IPU: "On 24 February the newly elected Knesset held its first session." |
| Likud–Ahi constituents | `meta lists[מחל].parties` | Ahi at 39 and 45; Likud the rest | YP 5909 (1): #39 לרנר שלום, #45 חסין אדמונד; Walla 25 Dec 2008 (4) https://www.walla.co.il/news/israel/1405053: "המרכז קבע כי המקום ה-39 ברשימה ישוריין לאח"י"; #45 in Hebrew WP/Hamichlol only (finding 11) |
| UTJ constituents | `meta lists[ג].parties` | Agudat Yisrael 1, 3, 5, 6; Degel HaTorah 2, 4 | YP 5909 (1) ranks; Globes 11 Feb 2009 (4) https://www.globes.co.il/news/article.aspx?did=1000424295 on Moses #5 (Vizhnitz, Agudah); N12 5 Apr 2009 (4) on the "אגודת ישראל ודגל התורה" factions; Eichler #6 entered 6 Feb 2011 (rotation), in Hebrew WP |
| National Union constituents | `meta lists[ט].parties` | Tkuma 1–2, Hatikva 3, Eretz Yisrael Shelanu 4, Moledet 5 | YP 5909 (1): "1 כץ יעקב דב 2 אריאל אורי יהודה 3 אלדד אריה 4 בן ארי מיכאל 5 בנק אורי"; YP 5917 p. 2405 (1): "בא כוח סיעת "מולדת-האיחוד הלאומי" הוא אורי בנק"; Knesset OData (1): Eldad and Ben-Ari in "עוצמה לישראל" from 2012-11-19 |
| Ra'am–Ta'al constituents | `meta lists[עם].parties` | Ra'am 1, 3, 4 (3 = el-Sana, Mada); Ta'al 2 | YP 5909 (1) ranks; JPost 19 Feb 2009 (4): "UAL-Ta'al MK Ahmed Tibi … MK Taleb a-Sanaa of the same party" |
| Meretz / New Movement | `meta lists[מרצ].parties` | New Movement 3, 7, 9, 12; Meretz 1, 4 | YP 5909 (1): 3 הורוביץ ניצן, 4 גלאון זהבה, 12 מראענה אבתיסאם; IDI Parliament 61 (3) https://www.idi.org.il/parliaments/3077: "תנועת השמאל החדשה עם מרצ" |
| Green–Meimad | `meta lists[ה].parties` | Meimad 1; Green Movement 2–3 | YP 5909 (1): "1 מלכיאור מיכאל 2 בן ימיני ערן 3 טל אלון"; IDI Parliament 61 (3): "מימד עם הירוקים" |
| Lineage/parties | `party-lineage.json partners-18-*` (6 edges), `parties.json` vehicle entries | match the meta constituents above | Internal consistency with the checked meta |
| First government | `blocSchemes[0]` | Government 32, 2009-03-31; Likud, YB, Labor, Shas, Jewish Home + UTJ joined 2009-04-01; 74/46 | IDI (3) https://en.idi.org.il/articles/11757: "sworn into office on March 31st … Likud (27), Yisrael Beiteinu (15), Labor (13), Shas (11) and Habayit Hayehudi (3)"; Knesset OData (1): PM נתניהו בנימין from 2009-03-31; JTA 1 Apr 2009 (4) for UTJ (finding 5 on citation); seats re-summed: 74 = 27+15+13+11+3+5; 46 = 28+4+4+4+3+3 |
| Recommendation round | `blocSchemes[1]`, `aftermath recommendationRounds[0]` | 18–19 Feb 2009; Netanyahu 65 (מחל, ל, שס, ג, ט, ב); Livni 28 (כן); none 27 (אמת, מרצ, ו, עם, ד) | JPost 19 Feb 2009 (4), cited quote verified verbatim in page JSON: "Of all 12 factions, only Kadima, with its 28 MKs, recommended … (a total of 65 MKs) … while Meretz, Balad, Labor, Hadash and the United Arab List-Ta'al refrained"; Walla 19 Feb 2009 (4) https://www.walla.co.il/news/israel/1438925: "באופן רשמי תומכים בנתניהו 65 חברי כנסת, בעוד לבני זוכה לתמיכתם של 28"; N12 18 Feb 2009 (4) https://www.mako.co.il/news-elections-2009/news/Article-809a7b7552a8f11004.htm: Kadima and Likud met the President on Wednesday 18 Feb, the others on Thursday 19 Feb |
| Mandate | 2009-02-20, 28 days | | INN 20 Feb 2009 (4), cited quote verified: "entrusted him with the task of forming a government. Netanyahu now has 28 days"; N12 20 Feb 2009 (4): "החליט נשיא המדינה, שמעון פרס, להטיל את מלאכת הרכבת הממשלה על נתניהו" |
| Extension | 2009-03-20, 14 days, to 3 Apr | | Reuters via M&G 20 Mar 2009 (4), cited quotes verified: "won a two-week extension on Friday"; "The extension sets April 3 as his new deadline." |
| Investiture | 2009-03-31, 69–45–5 | | JTA 31 Mar 2009 (4), cited quote verified: "by a vote of 69 to 45 with five abstentions" |
| Government record | `aftermath government` | No. 32, Netanyahu, 2009-03-31 → 2013-03-18, coalition 69 | IDI (3) as above; end = 33rd government's investiture (per k19 record) |
| Dissolution | `term.endedBy` | 2012-10-15; 100–0; election 22 Jan 2013 | ToI 15 Oct 2012 (4), cited quote verified: "One hundred MKs voted in favor, with no opposing votes and zero abstentions"; "brings them forward to January 22"; the civil-date caveat is already recorded in `notes` |
| Term events | Shalit 2011-10-18; Pillar of Defense 2012-11-14 → 11-21 | | Cited ICT/SIPRI/Reuters/IDF chronologies (as recorded); dates agree with the IDF page |
| IPU coalition conflict | `formation.conflicts[0]` | IPU wrongly lists NU in the coalition; resolved to IDI | Agreed: IDI (3) and Knesset OData (1) show no National Union minister on 31 Mar 2009 |
| Context events | `eligibility-final-k18-8/9`, `result-source-comparison-k18` | Balad and Ra'am–Ta'al reinstated by the Supreme Court; 49,684 vs 43,097 | IPU (international official): "In January 2009 the High Court of Justice overturned the Central Elections Committee's decision to disqualify two Arab parties - Balad and the United Arab List (Ta'al)"; see the note on invalid votes |
| Party links (40 of 41) | `party-links/k18.json` | HeWP links, IDI platforms (Likud, YB, Labor, Meretz), YP 5917 "הודעת התוצאות" links | `knesset18-results.pdf` **is** YP 5917, the results notice, so those titles are accurate. Hebrew WP "עלי"ה" is Nudelman's party ("אותיות: נ (הבחירות לכנסת ה-18)") and "ברית עולם" is the 2009 list ("פי (הבחירות לכנסת ה-18)"). IDI PDFs fetched (200): Likud "מצע הליכוד", YB "ישראל ביתנו 2009", Labor "מצע מפלגת העבודה לכנסת ה- 18", Meretz "מצע בחירות - 2009". Hadash: finding 12 |
| Logos (6 of 7) | `logos/k18.json` | Hadash, Ta'al, Moledet, National Union, Balad (Wayback); Meretz–New Movement (Commons) | Recomputed SHA-1 base32 of every retained asset equals its CDX digest (QW6IVS26…, W74GGT33…, BJLJRWR6…, BWKWIQMF…, U7VEQTP4…). Each page or stylesheet references the asset path: Hadash `style.css` `background:url(…/images/White_Clean.gif)`, linked from the page; Moledet `homestyles_heb.css` → `hp_logo.jpg`, linked from the page. Meretz: Commons original-upload log "2009-01-16 14:13:11 Bunnyfrosch … Logo von Meretz-Jachad", as claimed |
| Families (9) | `families/*.json elections[k18].datasetSha256` | 7cafc93de3ca… | Equals SHA-256 of current `public/data/k18.json`; no stale status copy |
| UI text | `src/app/whatIf.ts:69` "2% … the law in 2006–2013"; `src/data/schema.ts:197` "2009 uses code 0" | | 2% in force 27.5.2004 (glossary s.81 history); memorandum 2.00% (1); data.gov envelope row has code 0 (1) |
