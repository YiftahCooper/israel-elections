# Data audit k03 (26 July 1955, 3rd Knesset): Opus auditor

Auditor: Claude Opus (independent; did not read the Codex report). Base: `5f2a4f3` (contains `53cca36`). Accessed:
2026-11-06 for every source below unless stated. Method: [BRIEF.md](BRIEF.md) with
[source-hierarchy.md](../source-hierarchy.md). No data edited, no build run.

## Summary

| Class | Count | Notes |
|---|---:|---|
| OK | 374 | Counted per field: 6 national facts (date, Knesset number, registered, cast, valid, invalid); 17 lists × letters/votes/seats + 18th list votes/seats; 15 list names; 4 agreement pairs; quota and full seat reproduction; 120 elected names; 120 bios Knesset IDs; Kol→Idov Cohen opening note (2 places); 16 joint-list member assignments; 6 first-government facts; 14 aftermath facts; logo year; 9 dataset hashes; 6 external links |
| WRONG | 9 | Ballot letter סא (should be סצ); 3 list names; 1 approved list missing; logo source URL 404; stale hash in parties.json; 2 wrong aftermath gap texts |
| UNSUPPORTED | 4 | "Second scan copy" is byte-identical; one constituent assignment rests on Hebrew WP alone; anachronistic "מפד״ל / NRP" and "Mapai/Alignment" labels |
| UNVERIFIABLE | 1 | Why list יז did not run (withdrawn or struck off) |
| DISPUTED | 0 | |

Main points:

- **The official notices are retained and I read them myself.** `data/raw/research/k03-results.pdf` is Reshumot
  **YP 432 (8 Aug 1955), pp. 1137–1139**, "הודעה על תוצאות הבחירות לכנסת השלישית", signed by CEC chair Justice
  Shimon Agranat on "ט״ז באב תשט״ו (4 באוגוסט 1955)". I also read a **different scan** of the same issue on olaw
  (`yalkut-0432.pdf`, sha256 `f198e580…`), the candidate notice YP 425 (10 Jul 1955) and the connection notice YP 427
  (18 Jul 1955). No later correction notice was found in the retained issues.
- **Votes, totals and seats are right.** All 18 list votes and seats match YP 432. Registered 1,057,795, cast 876,085,
  valid 853,219 match CBS table 27.2. Invalid 22,866 matches YP 432 §2. Valid + invalid = cast, and the list votes sum to
  853,219. My own run (1% threshold; quota 832,602/120 = 6,938.35; Hare largest remainder with the five YP 427
  connections) gives every gazetted seat, including the splits א 40/יד 2 and נ 2/ע 1.
- **The ballot letters of one list are wrong everywhere.** The Sephardim list is **סצ** in all three gazettes (YP 425,
  YP 427 and YP 432, in both scans). The dataset, ids (`3-סא`), agreements, tests and docs use **סא**.
- **Three list names copy misreadings**, and **one approved list (יז) is missing** without any record (details below).
- **Elected members and identities check out.** All 120 elected names match YP 432 §4 in order. All 120
  `bios/k3.json` Knesset PersonIDs are in the retained OData opening membership (1955-08-15), with no duplicates. The
  only opening-day difference is Moshe Kol (פ #2) → Idov Cohen (פ #6), which is correctly noted in
  `candidate-notes.json` and `election-context.json`.
- **Formation is confirmed from the Knesset records.** Government 7's confidence vote was 73–32–3 on 3 Nov 1955
  (plenum record). Government 8's vote was 76–33 on 7 Jan 1958. The mandate was given on 18 Aug 1955 (Ben-Gurion's
  presentation speech). Consultations began on 16 Aug 1955 (JTA original bulletin, dateline "JERUSALEM, Aug. 16").
- No English Wikipedia URL anywhere (`grep en.wikipedia` = 0 in `data/meta/k3.json`, `aftermath/k3.json`,
  `bios/k3.json`, `logos/k3.json`, `party-links/k3.json`, `public/data/k3.json` and `data/raw/k3/*.json`).
- **Reversed Hebrew parentheses:** none found. Both bracketed list names (ב, גד) are correctly ordered.
- **Editorial stance:** no partisan wording found. "Sinai Campaign" uses Israeli terminology. The Kafr Qasim text
  follows the Knesset's own history.

## Non-OK findings

Severity: **H** high (wrong fact shown to users), **M** medium, **L** low (wording or formatting, or not displayed).

| # | Sev | File | JSON path | Current value | Correct value | Class | Source (rank) | Quote | Accessed |
|---|---|---|---|---|---|---|---|---|---|
| 1 | H | `data/raw/k3/national.reviewed.json` → `public/data/k3.json`; also `tests/historical-k03.test.ts`, `scripts/lib/list-meta.ts`, `tests/historical-k1-k7-release.test.ts`, `data/meta/party-links/k3.json` (`lists["3-סא"]`, `gaps["3-סא"]`), `data/meta/parties.json` (`vehicle-3-סא`, `partyAppearances[61]`), `docs/DATA.md` l.432, `docs/ELECTORAL-LAW.md` l.191, decision 0065 | `lists[9].letters`; `agreements.pairs[3]`; public `lists[*].id = "3-סא"`, `officialSeats["3-סא"]`, `agreements[3].members` | `סא` (id `3-סא`; pair `סא–ל`) | **`סצ`** (id `3-סצ`; pair `סצ–ל`) | WRONG | YP 432 p. 1137 §1 and p. 1138 §3 (1) https://www.gov.il/BlobFolder/dynamiccollectorresultitem/records-results3/he/archive_knesset3_records-results3.pdf; second scan (1) https://olaw.org.il/yalkut/yalkut-0432.pdf; YP 427 p. 1053 (1) https://olaw.org.il/yalkut/yalkut-0427.pdf; YP 425 p. 1017 (1) https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset3-cand.pdf | YP 425: "אות הרשימה: סצ. הכינוי: רשימת ספרדים ועדות המזרח, עולים, ותיקים ובלתי מפלגתיים"; YP 427 (4): "…ואת האות ״סצ״ התקשרה עם הרשימה הנושאת את הכינוי ״התאחדות התימנים בישראל״ ואת האות ״ל״"; YP 432 table rows: "סצ … 6994" | 2026-11-06 |
| 2 | H | `data/raw/k3/national.reviewed.json`, `data/meta/k3.json` → `public/data/k3.json`; `data/meta/party-links/k3.json` | national `lists[5].nameHe`; meta `lists[4].nameHe` (יט); public `lists[16].nameHe`, `.shortHe`; party-links `lists["3-יט"][0].titleHe` | `רשימה דתית מקורית, נציגה בני תימן ודתיים בלתי מפלגתיים` | `רשימה דתית מקורית, תנועת בני תימן ודתיים בלתי מפלגתיים` | WRONG | YP 432 pp. 1137, 1138 (1), both scans, URLs as #1; YP 425 p. 1013 (1) | YP 425: "אות הרשימה: יט. הכינוי: רשימה דתית מקורית, תנועת בני תימן ודתיים בלתי מפלגתיים"; YP 432: "יט רשימה דתית מקורית, תנועת בני תימן ודתיים בלתי מפלגתיים 2448" | 2026-11-06 |
| 3 | M | as #2, plus `englishName` | national `lists[16].nameHe`; meta `lists[3].nameHe`, `lists[3].englishName.label` (ש); public `lists[14].nameHe`, `.shortHe`, `.shortEn`, `.englishName.label`; party-links `lists["3-ש"][0].titleHe` | `ליכוד — תנועה כללית עממית`; English "Likud – Tnua Klalit Amamit" | `ליכוד — תנועה כלכלית עממית` ("…Tnua Kalkalit Amamit"; meaning "popular economic movement"). Decision 0065 already calls it "Popular Economic ש", yet the data has "כללית". | WRONG | YP 432 pp. 1137–1138 (1); YP 427 p. 1053 (1); YP 425 pp. 1024–1025 (1); URLs as #1 | YP 427 (2): "…התקשרה עם הרשימה הנושאת את הכינוי ״ליכוד — תנועה כלכלית עממית״ ואת האות ״ש״"; YP 425: "אות הרשימה: ש. הכינוי: ליכוד תנועה כלכלית עממית"; YP 432: "ש ליכוד — תנועה כלכלית עממית 3044" | 2026-11-06 |
| 4 | M | `data/raw/k3/national.reviewed.json` → `public/data/k3.json` | national `lists[10].nameHe`; public `lists[11].nameHe` (ע) | `החקלאות ופיתוח` | `חקלאות ופיתוח`. All three gazettes print it without the article. The app's own shortHe and the party-links title already use this form. | WRONG | YP 432 p. 1137 (1); YP 427 (5) (1); YP 425 p. 1017 (1); URLs as #1 | YP 425: "אות הרשימה: ע. הכינוי: חקלאות ופיתוח"; YP 427: "…עם הרשימה הנושאת את הכינוי ״חקלאות ופיתוח״ והאות ״ע״"; YP 432: "ע חקלאות ופיתוח 9791" | 2026-11-06 |
| 5 | M | `data/raw/k3/national.reviewed.json`, `public/data/k3.json`, `docs/decisions/0065…md`, `docs/DATA.md` | `lists` (absent) | The approved list **יז "איגוד העובד הקשיש בלתי מפלגתי"** (9 candidates, headed by רון־אל שבתאי) is absent from the dataset. Nothing records it as withdrawn or struck off. DATA.md and 0065 speak of "every gazetted list" and 18 lists. | Add `3-יז` with `withdrawn: true` (or the right status) and 0 votes, with a note: approved in YP 425 p. 1013, but not on the YP 432 results. Or document the omission explicitly, as DATA.md does for k19's זה/פך. | WRONG (missing list) | YP 425 p. 1013 (1), URL as #1 (MoJ OCR copy also found via search: free-justice.openapi.gov.il); YP 432 (1) lists only 18 | YP 425: "אות הרשימה: יז. הכינוי: איגוד העובד הקשיש בלתי מפלגתי … 1. רון־אל שבתאי … 9. הלר (וגל) חנה"; YP 432 §1 has no יז row | 2026-11-06 |
| 6 | L | `data/meta/logos/k3.json` → `public/data/k3.json` | `logos[0].sourceUrl` (ל); public `lists[15].logo.sourceUrl` | `https://commons.wikimedia.org/wiki/YemeniteAssociation.png` (HTTP 404; the `File:` namespace is missing) | `https://commons.wikimedia.org/wiki/File:YemeniteAssociation.png` | WRONG | Commons (provenance) | `curl` → 404; `action=raw` on `File:YemeniteAssociation.png` returns the page ("Logo of the Yemenite Association, a stylized Lamed (ל), from 1955.") | 2026-11-06 |
| 7 | L | `data/meta/parties.json` | `datasets.k3.sha256` (l. 283) | `1b582dc9a81abda168eff2f3be0b02fcb9d88ebcab4a5569714b02ce15dc9c41` | `3392fbc308144fdfa875e07a089e8abe392225c3625b59d8bd908c8fb0a2b8ba` (current `public/data/k3.json`; `party-lineage.json` and all 8 family files already carry it). Will change again once #1–#5 are fixed. | WRONG (stale hash) | Internal | `sha256sum public/data/k3.json` = `3392fbc3…` | 2026-11-06 |
| 8 | L | `data/meta/aftermath/k3.json` | `gaps[5]` | "Replacement-coalition snapshots are partial: government 14's faction splits and current seat counts require a separate audit. …" | Remove or rewrite. Government 14 belongs to the 6th Knesset (k6). The k3 term has only governments 7 and 8. The text was copied from another election. | WRONG (stale gap) | Internal: `government.number = 7`, `changes[1].number = 8` | — | 2026-11-06 |
| 9 | L | `data/meta/aftermath/k3.json` | `gaps[4]` | "The mirrored term history … includes an aircraft incident before this election." | The El Al shoot-down it lists happened on **27 July 1955**, the day **after** the 26 July election (before the Knesset opened on 15 Aug). Reword to "an aircraft incident between the election and the first sitting". | WRONG | Knesset history, third Knesset (1, via JVL mirror) https://jewishvirtuallibrary.org/highlights-of-the-third-knesset-1955-1959; CBS 27.2 (1) for the election date | "the shooting down of an El Al plane in the air-space of Bulgaria on 27 July, 1955"; CBS: "26.7.1955 3" | 2026-11-06 |
| 10 | L | `data/raw/SOURCES.json` | `sources[id="k3-candidates-mirror"].description`; `rosters.reviewed.json` `lists[ע].readingNote`; decision 0065 | "Second scan copy used to resolve the Agriculture and Development candidate spelling" | The olaw copy is **byte-identical** to the gov.il copy (both sha256 `25a334b5…`), so it is not an independent reading. The Abu-Mukh name still matches YP 432 p. 1139. Fix the description: "same scan, mirror URL". | UNSUPPORTED | Fresh download of https://olaw.org.il/yalkut/yalkut-0425.pdf (1) | sha256 `25a334b5df28fef5c5fea0662e03cab50da94281b365fab18f464b6d37a9df19` = `k3-candidates-gazette` | 2026-11-06 |
| 11 | L | `data/meta/k3.json` | `lists[0].parties[0].members[rank=8]` (זוארץ פריג׳ה, `evidence: []`) | Hapoel HaMizrachi, on the strength of Hebrew Wikipedia alone | Keep the assignment, but add an official source. OData shows him in the "חזית דתית לאומית" faction only, which does not separate the two parties. The constituent-party `sources` for ב and גד are also Hebrew WP only, although members 1–7 and 9–11 (ב) and all 6 (גד) carry Knesset evidence. | UNSUPPORTED (Hebrew WP sole basis) | Hebrew WP (5) as cited; OData (1) faction list | — | 2026-11-06 |
| 12 | L | `public/data/k3.json` (from list metadata) | `lists[3].shortHe = "מפד״ל"`, `.shortEn = "National Religious Party"` (ב) | 1955 list ב labelled as the NRP | It ran as the **National Religious Front** (חזית דתית לאומית). The meta file's own note says the faction became the merged NRP only on 1957-01-22 (OData factions 982/981). Use "חזית דתית לאומית" / "National Religious Front" for k3. | UNSUPPORTED (anachronism) | YP 432 (1); `data/meta/k3.json` `lists[0].notes[0]` (OData, 1) | YP 432: "ב חזית דתית לאומית (הפועל המזרחי, המזרחי ודתיים בלתי מפלגתיים)" | 2026-11-06 |
| 13 | L | `data/meta/k3.json` → public | `blocSchemes[1].nameHe/nameEn` | "מפא"י/המערך … / Mapai/Alignment and its affiliated Arab (satellite) lists" | For 1955, "מפא"י והרשימות הערביות המסונפות". The Alignment was founded in 1965. | UNSUPPORTED (anachronistic wording) | — | — | 2026-11-06 |
| 14 | — | `data/raw/k3/national.reviewed.json` (#5) | — | Why יז is absent from the results (withdrew, or was struck off by the CEC) | Unknown | UNVERIFIABLE | Tried: YP 425–432 covers (no withdrawal notice in the retained issues); Exa search in Hebrew (only the candidate gazette itself). JPress is behind a bot challenge, so I did not try it. | — | 2026-11-06 |

## Gaps and observations (not counted above)

- **Certification date can be filled.** `aftermath/k3.json` `gaps[0]` says the certification date is "not
  transcribed". The retained YP 432 is signed "ט״ז באב תשט״ו (4 באוגוסט 1955)" and published on 8 Aug 1955 (YP 432,
  p. 1139). The fixer can close this gap.
- **The results source id names no issue.** The `k3-results-gazette` entry in SOURCES.json doesn't name the issue.
  It is YP 432, pp. 1137–1139.
- **Sharett's caretaker period is not represented.** Moshe Sharett's government 6 stayed on as a caretaker from the
  election until 3 Nov 1955 (JTA 17 Aug 1955: "the Cabinet of Premier Moshe Sharett which resigned yesterday … will
  remain as a caretaker government"). The aftermath card starts with Ben-Gurion on 1955-11-03, which is right for
  government 7. Note this if the UI ever shows "PM during the term".
- **Mid-term replacements are not noted.** OData has 16 replacements during the term (e.g. Yitzhaki→Hamis
  1955-09-21, Laskov→Nir-Rafalkes 1955-10-12, Tabenkin→Carmel 1958-06-09). Only the Kol/Cohen pre-opening swap is
  noted, which matches the documented "later changes not applied" policy. Idov Cohen (OData 2390) has no bio entry,
  because rank 6 is outside the transcribed prefix.
- **Gazette name order.** Mapam #9 is printed "חיים יהודה" in both YP 425 and YP 432 (OData: LastName יהודה,
  FirstName חיים). The data follows the gazette. Any English rendering should be "Haim Yehuda".
- **Logo rights.** The CZA poster record KRA\3560 ("רשימתך ל התאחדות התימנים בישראל", year 1955,
  http://www.zionistarchives.org.il/Pages/ArchiveItem.aspx?oi=09001e15806fb118&ot=cza_poster) supports the 1955
  claim. The CC BY-SA licence, however, was asserted by a Commons uploader, not by CZA. It may be acceptable as a simple
  letterform; the owner should be aware.
- The `religious-parties` family does not include יט (רשימה דתית מקורית, 2,448 votes). This is editorial; I note it only
  for consistency.
- The `aftermath/k3.json` status is "pilot". Its facts were audited anyway.

## Checked and found OK

| Item | Value | Source (rank) |
|---|---|---|
| Election date, Knesset | 1955-07-26, 3 | CBS 27.2 "26.7.1955 … 3" (1); YP 432 title (1) |
| Registered / cast / valid | 1,057,795 / 876,085 / 853,219 | CBS 27.2 (1) https://www.cbs.gov.il/he/publications/doclib/2024/hnatonelectionstheknessetandgovernment.27/st27_02.pdf |
| Invalid | 22,866 | YP 432 §2 "מספר הקולות שנמצאו פסולים: 22866" (1) |
| 18 list votes and seats | all match (e.g. א 274735/40, ח 107190/15, צ 87099/13, ב 77936/11, תו 69475/10, מ 62401/9) | YP 432 §1, §3, both scans (1) |
| Other 15 list names, letters | match, incl. bracketed ב/גד names and צח "הרשימה הערבית — המרכז", רי "רשימת העולה החדש" | YP 432, YP 425 (1) |
| Agreements א–יד, פ–ש, צ–צח, נ–ע | match | YP 427 p. 1053, signed 12 Jul 1955 by Agranat (1) |
| Quota and seat allocation | 6,938; 120/120 reproduced, incl. intra-pair splits | own computation from YP 432 + YP 427 |
| 120 elected names, in order | match YP 432 §4 (e.g. גד #4 printed "כהן קלמן", #5 "ינקלביץ זלמן"; צ #9 "בז׳רנו", #10 "סוזייב") | YP 432 pp. 1138–1139 (1) |
| 120 bios PersonIDs | all in opening membership; no duplicates | retained OData `k3/knesset-odata-members.json` (1) |
| Opening counts per faction | Mapai 40, Herut 15, GZ 13, NRF 11, AH 10, Mapam 9, RTF 6, Maki 6, Prog 5, DLIA 2, P&W 2, A&D 1 | OData (1) |
| Kol → Idov Cohen before opening | note correct in candidate-notes and election-context | OData opening list has כהן אידוב (2390), not Kol (1) |
| ב split 9 Hapoel HaMizrachi + 2 Mizrachi; גד 3 Agudah + 3 Poalei Agudah | member-level Knesset bio/OData evidence matches | Knesset MK bios, OData factions 169/173 (1) |
| Government 7: number, date, 8 coalition lists (80), 4 opposition (40), main opposition Herut | OK | OData GovernmentNum 7 (1); plenum 3 Nov 1955 (1) |
| Consultations began | 1955-08-16 | JTA Daily News Bulletin 17 Aug 1955, "JERUSALEM, Aug. 16 … began consultations today" (3) http://pdfs.jta.org/1955/1955-08-17_159.pdf |
| NRF asked that the largest party be tasked; Herut refused to attend | OK | JTA 17 and 18 Aug 1955 (3) |
| Mandate to Ben-Gurion | 1955-08-18 | gov7 presentation: "ביום 18 באוגוסט הטיל עלי הנשיא להרכיב ממשלה" (1) https://main.knesset.gov.il/mk/government/documents/gov7.pdf |
| Confidence, govt 7 | 73–32, 3 abstained, 3 Nov 1955 | plenum https://fs.knesset.gov.il/3/Plenum/3_ptm_251311.pdf "הצבעה 73 בעד … 32 נגד 3 … נמנעו"; sitting dated "י״ח בחשון תשט״ז 3 בנובמבר 1955" (1) |
| BG resignation 31 Dec 1957; new mandate 1 Jan 1958 | OK (ח׳ בטבת תשי״ח; "ט׳ בטבת (1 בינואר 1958)") | gov8 presentation (1) https://main.knesset.gov.il/mk/government/documents/gov8.pdf |
| Confidence, govt 8 | 76–33, 7 Jan 1958 | plenum https://fs.knesset.gov.il/3/Plenum/3_ptm_251466.pdf "ט״ו טבת תשי״ח (7 ינואר 1958) … 76 בעד … 33 נגד" (1) |
| Term events: Sinai 29 Oct 1956; Kafr Qasim 29 Oct 1956 | OK, quotes verbatim | Knesset history via JVL (1/mirror); IDI 1959 (2) |
| Next election | 1959-11-03 | IDI https://en.idi.org.il/israeli-elections-and-parties/elections/1959/ "3.11.1959" (2); CBS 27.2 (1) |
| Wadi Salib and grenade held as pending | correct to hold: Knesset history gives 9 May 1959 and 29 Oct 1957 | JVL mirror (1) |
| Logo year (ל, 1955) | supported | CZA poster KRA\3560, "שנה: 1955" (1) |
| Dataset hashes | `party-lineage.json` and 8 family files = `3392fbc3…` | `sha256sum public/data/k3.json` |
| Links | IDI platform files (Mapam, Ahdut HaAvoda), IDI Mizrachi page, IDI 1959, UN yearbook, JVL: all HTTP 200 | fresh `curl` |
