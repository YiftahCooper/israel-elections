# Data audit k7 (28 October 1969, 7th Knesset): Opus auditor

Auditor: Claude Opus (independent; did not read the Codex report). Base: `68b836a` (includes `53cca36`). Accessed:
2026-11-06 for every source below unless stated. Method: [BRIEF.md](BRIEF.md) with
[source-hierarchy.md](../source-hierarchy.md). No data edited.

## Summary

| Class | Count | Notes |
|---|---:|---|
| OK | ~520 | Counted per field: election identity and totals (9); 16 lists × letters/name/votes/seats/withdrawn (80); 16 short labels; 1 surplus agreement; 120 elected names and rank mappings; 120 Knesset PersonIDs; 9 Knesset site IDs (spot check); 82 joint-list member affiliations and 4 constituent counts; 2 lineage edges; recommendation round (18); formation (3); government (11); bloc schemes (6); term events and close (6); 1 logo; 2 platform links; 16 party-link URLs; 9 family memberships and sums; 10 dataset hashes; 2 UI statements |
| WRONG | 6 | 1 missing coalition change (medium); 5 low: wrong minister count in a note, stale gap text, OCR-garbled quotes with reversed parentheses, double space in an English name, English label that doesn't match its cited source |
| UNSUPPORTED | 1 | Party-name entries in `parties.json` that are really ballot-list names (low) |
| UNVERIFIABLE | 0 | |
| DISPUTED | 1 | Two list names differ between the candidates notice and the results notice (low) |

What's good: the **official results notice (YP 1573, 7 Nov 1969) is retained** (`k7-results-gazette`, sha256
`3d4fff86…` matches). Every list's votes and seats, the valid total (1,367,743) and invalid votes (60,238) match it.
All 120 elected names match it, allowing for the documented convention of keeping candidate-notice spellings
(e.g. the results notice prints אהרון where YP 1563 prints אהרן). The registered and cast totals match CBS table 27.2.
I re-ran the 1969 rule (1% threshold 13,677; quota 11,274; largest remainder, at most one remainder seat each;
יא+רא pooled under YP 1565). It gives 114 whole-quota seats plus 6 remainder seats, exactly the published seats.
JTA reported the same figures at the time ("114 seats … The remaining six seats went to the six lists with the
largest number of extra votes"). **No list withdrew or was cancelled.** YP 1563 prints exactly the 16 lists in
YP 1573. (כן is on printed p. 234, PDF p. 29, after עמ; נס on p. 235.) So `withdrawn: false` × 16 is correct. All 120
elected members are in the Knesset OData opening membership (1969-11-17), and every bios `knessetPersonId` resolves to
the right person.

Main finding: **Gahal left the government on 6 August 1970**, and the app does not record it. Government 15 is shown
from 1969-12-15 to 1974-03-10 with Gahal in a 102-seat coalition and `government.changes: []`.

No English Wikipedia in any k7 file (`en.wikipedia` count = 0 in `public/data/k7.json`, `meta/k7.json`,
`aftermath/k7.json`, `bios/k7.json`, `logos/k7.json`, `party-links/k7.json`). k7 has no `election-context.json`
events, and `candidate-notes.json` has no k7 notes.

## Non-OK findings

Severity: **H** high (wrong fact shown to users), **M** medium, **L** low (wording or formatting, or not displayed).

| # | Sev | File | JSON path | Current value | Correct value | Class | Source (rank) | Quote | Accessed |
|---|---|---|---|---|---|---|---|---|---|
| 1 | M | `data/meta/aftermath/k7.json` | `government.changes` (and `government.coalition` / `coalitionSeats`, which read as covering 1969-12-15 → 1974-03-10) | `[]`; coalition אמת, חל, ב, לע, רא, יא = 102 with no end for חל | Add a dated change: **1970-08-06, Gahal (חל, 26) left the coalition**. Its six ministers ended office that day; the coalition fell to 76 seats (אמת 56, ב 12, לע 4, רא 2, יא 2). The first-cabinet snapshot itself is right. | WRONG (omission) | (a) Knesset OData `KNS_PersonToPosition?$filter=GovernmentNum eq 15` https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PersonToPosition?$filter=GovernmentNum%20eq%2015&$format=json (1); (b) Goldstein, *Cathedra* 183, University of Haifa https://herzl.haifa.ac.il/images/Goldstein__Shilo_Cathedra_183.pdf (2); (c) OData shows Meir taking over transport, trade and industry, development and posts on the same day (1) | (a) PersonID 2179 (Begin, שר בלי תיק), 2320 (Weizman, שר התחבורה), 2442 (Landau, שר הפיתוח), 2512 (Y. Sapir, שר המסחר והתעשיה), 2609 (Rimalt, שר הדואר), 3257 (Dulzin, שר במשרד ראש הממשלה): `StartDate 1969-12-15`, `FinishDate 1970-08-06`; (b) "אך בקיץ 1970 פרשה גח"ל מממשלת גולדה מאיר"; (c) PersonID 2448 "שרת התחבורה … 1970-08-06" | 2026-11-06 |
| 2 | L | `data/meta/k7.json` | `blocSchemes[id=first-government].notes[1]` | "Gahal was in the coalition at formation (four ministers per Knesset OData)." | "…six ministers: four MKs (Begin, Yosef Sapir, Haim Landau, Elimelech Rimalt) and two non-MKs (Ezer Weizman, Aryeh Dulzin)". The OData tabulation counted only ministers with a Knesset faction; Gahal's two non-MK ministers fell into its `NON-MK: 5`. | WRONG | Knesset OData Government 15 (1), as in #1; plenum record 15 Dec 1969, list of ministers https://fs.knesset.gov.il/7/Plenum/7_ptm_253121.pdf p. 9 (1) | Plenum: "שר­מנחם בגין … שר­אריה דולצ'ין … שר התחבורה­עזר וייצמן … שר הפיתוח­חיים לנדאו שר המסחר והתעשיה­יוסף ספיר … שר הדואר­אלימלך [רימלט]". All six end 1970-08-06 in OData. | 2026-11-06 |
| 3 | L | `data/meta/aftermath/k7.json` | `gaps[4]` | "Replacement-coalition snapshots are partial: government 14's faction splits and current seat counts require a separate audit. Other replacement snapshots use election-list seats with stated support-list limitations." | Remove it. It is copied from `aftermath/k6.json` `gaps[5]`: Government 14 belongs to the 6th Knesset, and k7 has no replacement cabinet. Government 15 served the whole term; OData shows Meir as PM 1969-12-15 → 1974-03-10. If #1 is fixed, a replacement gap could say that the post-August-1970 coalition seats are election-list seats. | WRONG | Internal: `aftermath/k6.json` `gaps[5]` (identical text); OData Government 15 (1) | n/a | 2026-11-06 |
| 4 | L | `data/meta/aftermath/k7.json` | `formation.events[1].cites[0].quote` and `formation.events[2].cites[0].quote` | "המ ''ביום 10 בנובמבר 1969 הטיל עלי כבוד נשיא ,13 דינה את התפקיד … סעיף קטן )ב(, לחוק יסוד: הממשלה …"; "הצבעה 90 בעד הבעת אמון לממשלה 0ו נגד 4 נמנעים" | Verbatim from the page image: "ביום 10 בנובמבר 1969 הטיל עלי כבוד נשיא המדינה את התפקיד להרכיב ממשלה. בהתאם לסעיף 13, סעיף קטן (ב), לחוק יסוד: הממשלה, אני מתכבדת להודיעך כי הרכבתי ממשלה." and "בעד הבעת אמון לממשלה — 90; נגד — 10; נמנעים — 4. ההצעה להביע אמון לממשלה נתקבלה." This removes the reversed parentheses )ב( and the "0ו" OCR misreading of 10. The data values (10 Nov; 90–10–4) are correct. | WRONG | Plenum record, Knesset 7 sitting 13, 15 Dec 1969 https://fs.knesset.gov.il/7/Plenum/7_ptm_253121.pdf pp. 2, 45, read visually (1) | as in the correct-value column | 2026-11-06 |
| 5 | L | `public/data/k7.json` (from `data/raw/bios/knesset-site-mk-names-en.json`) | `lists[ט].candidates[0].nameEn` (`7-ט#1`) | "Shmuel  Tamir (Katznelson)" (two spaces) | "Shmuel Tamir (Katznelson)". Normalise whitespace in the display name; the raw capture can stay as captured. | WRONG | Knesset site English name list (1), as captured | `{"siteId": 679, "nameEn": "Shmuel  Tamir (Katznelson)"}` | 2026-11-06 |
| 6 | L | `data/meta/k7.json` | `lists[letters=נס].englishName` | `label: "Reshimat Shalom"`, `sourceId: "k7-candidates-gazette"` ("transliteration of the retained Hebrew list name") | The candidates notice prints **"רשימת השלום"** (Reshimat HaShalom). "רשימת שלום" is the results-notice form. Either cite `k7-results-gazette` or transliterate the candidates-notice form. (See #8.) | WRONG | YP 1563 p. 235, PDF p. 30 (1); YP 1573 pp. 433–434 (1) | YP 1563: "אותיות הרשימה: "נס" הכינוי: רשימת השלום"; YP 1573: "נס רשימת שלום" | 2026-11-06 |
| 7 | L | `data/meta/parties.json` | `parties[id=nrp|agudat-yisrael|poalei-agudat-yisrael|rakah|maki].names[date=1969-10-28].nameHe` | List ballot names, e.g. nrp "חזית דתית לאומית, המזרחי-הפועל המזרחי ובלתי מפלגתיים"; agudat-yisrael "יהדות התורה — אגודת ישראל ודתיים בלתי מפלגתיים"; poalei-agudat-yisrael "המחנה התורתי פועלי אגודת ישראל ודתיים בלתי מפלגתיים"; rakah and maki likewise with "…ובלתי מפלגתיים" | These are list names (כינוי הרשימה), not party names. Either label the entries as list names or use the party names (e.g. "המפלגה הדתית לאומית", "אגודת ישראל", "פועלי אגודת ישראל", "רק"ח", "מק"י"). This is the same pattern as k20 finding #7. | UNSUPPORTED | YP 1573 p. 433 (1): the strings are the "כינוי הרשימה" column | YP 1573: column header "כינוי הרשימה" | 2026-11-06 |
| 8 | L | `data/raw/k7/national.reviewed.json` → `public/data/k7.json`; `parties.json` `vehicle-7-עמ`, `vehicle-7-נס` | `lists[letters=עמ].nameHe`, `lists[letters=נס].nameHe` | "רשימה ממלכתית", "רשימת שלום" (results-notice forms) | Both notices are rank 1 and disagree. The candidates notice, which approves the names, prints **"הרשימה הממלכתית"** and **"רשימת השלום"**. The results notice prints "רשימה ממלכתית" and "רשימת שלום". Recommendation: keep the results-notice form, which matches the votes, and add a list note naming the candidates-notice form. Or follow whatever convention the other early elections use. (Also, YP 1573's seat table prints "כח חדש" for ש where its vote table has "כוח חדש"; the app follows the vote table, which is fine.) | DISPUTED | YP 1563 pp. 232–235, PDF pp. 27–30 (1); YP 1573 pp. 433–434 (1) | YP 1563: "אותיות הרשימה: "עמ" הכינוי: הרשימה הממלכתית"; "אותיות הרשימה: "נס" הכינוי: רשימת השלום". YP 1573: "עמ רשימה ממלכתית"; "נס רשימת שלום" | 2026-11-06 |

### Finding 1 in detail

The 7th Knesset had a single government (15), so the "replacement cabinet" mechanism never applies. But the national
unity coalition did change. Gahal resigned over the government's acceptance of the US (Rogers) initiative and
ceasefire. Every Gahal minister's OData record ends on 1970-08-06, and Meir held their portfolios from that day. As
it stands, the government card and the `first-government` bloc scheme can be read as Gahal sitting in government until
1974. A `government.changes` entry (or the schema's equivalent mid-term step) with date `1970-08-06` and remaining
coalition seats 76 would fix this. The k12 file uses `changes` for a mid-term coalition event (`no-confidence-vote`),
so there is precedent. The 1970 ceasefire that ended the War of Attrition (7–8 August 1970) is not among the term
events either; that is a selection matter, not an error.

## Editorial-stance and source-quality flags (not counted above)

- **Hebrew Wikipedia as sole basis where a rank 1 source exists.** `meta/k7.json` `blocSchemes[first-government]`
  says support-only lists (רא, יא) "rest on Hebrew Wikipedia". The Prime Minister's own statement in the plenum
  (rank 1) gives the six-faction, 102-member coalition directly: "הממשלה המוצעת תכלול שש סיעות, המייצגות ביחד 102
  חברי כנסת, דהיינו — 85% מחברי הבית" (7_ptm_253121.pdf p. 2). The six factions with 102 seats are exactly אמת 56 +
  חל 26 + ב 12 + לע 4 + רא 2 + יא 2. Cite it in `blocSchemes[0].sources` and `aftermath government.cites`.
- **Recommendations (rank 3, single wire source).** The round's 1969-11-01 start rests on JTA 6 Nov 1969 ("President
  Zalman Shazar began consultations last Saturday"). Its 1969-11-09 end rests on JTA 10 Nov ("wound up his
  consultations today … expected to charge … Mrs. Meir tomorrow"). The mandate date of 10 Nov is confirmed at rank 1
  by the plenum record (Meir: "ביום 10 בנובמבר 1969 הטיל עלי כבוד נשיא המדינה את התפקיד"). The 104 "recommended" seats
  map JTA's "all of the factions represented in the outgoing National Unity Government". The official gov.14 record
  names those factions, including "סיעת הקידמה והפיתוח, סיעת השיתוף והאחווה" and "מפלגת פועלי אגודת ישראל", so
  רא, יא and ד are named directly, not inferred. A Davar check (11 Nov 1969 p. 1) would raise confidence if JPress
  becomes reachable. The State List did abstain in the confidence vote (plenum p. 45: "הודעה של הרשימה הממלכתית כי
  היא תימנע מהצבעה"), which fits Hebrew Wikipedia's "did not express consent". Keeping it "Not stated in source" for
  the consultation is still correct.
- **Eligible voters, contemporaneous disagreement (rank 1 wins).** JTA 10 Nov 1969 reported "1,758,658 Israelis
  were eligible to vote"; CBS table 27.2 has 1,748,710. The app uses CBS, which is correct. A source note is optional.
- **Family classification (editorial).** `families/centre.json` puts המרכז החופשי (Free Centre, a 1967 Herut
  breakaway) under "Civil-liberal and modern centre". `families/radical-right.json` has no k7 member, but Israel
  Eldad's "רשימה למען ארץ ישראל" (כן, 7,591) is the obvious candidate. Hebrew Wikipedia's article "ימין רדיקלי
  בישראל" names it: "בבחירות לכנסת השביעית אף רץ בראש "רשימה למען ארץ ישראל"". These are proposal-level judgements,
  not counted.
- **Party link 7-ו.** It points to Hebrew Wikipedia "המפלגה הקומוניסטית הישראלית", an article whose title is Maki's
  name (Rakah took that name later). The article does cover Rakah, so this is acceptable, but a reader may confuse it
  with ק (Maki, Sneh). Not counted.
- **Gaps that could now be filled:** `aftermath gaps[0]` ("Official result-certification date and the first sitting
  are not transcribed"). YP 1573 is signed "כ"ה בחשון תש"ל (6 בנובמבר 1969)" and published 7 Nov 1969. The retained
  OData file gives the opening date 1969-11-17. True as a statement about the aftermath file, so not counted.
- **No replacement notes.** OData shows 14 mid-term entries, e.g. Ben-Gurion out 1970-05-27 → Zalman Shoval in.
  `candidate-notes.json` has no k7 notes. Decision 0069 states this is "not a reconstruction of later Knesset
  membership", so this is a scope limit, not an error.

## Checked and found OK

| Area | Claim(s) | Source (rank) | Quote / evidence |
|---|---|---|---|
| Election identity | date 1969-10-28; Knesset 7; rule set `il-1951-largest-remainder-1`, threshold 1% | CBS table 27.2 `research/cbs-national-totals-2024.pdf` (1); law 1969 SH 556 (1); YP 1573 p. 433 (1) | CBS row: "1,367,743 4.2 81.7 1,427,981 1,748,710 28.10.1969 7" |
| Totals | registered 1,748,710; votes cast 1,427,981; valid 1,367,743; invalid 60,238 | CBS 27.2 (1); YP 1573 pp. 433–434 (1) | YP 1573: "ס"ה 1,367,743"; "(2) מספר הקולות שנמצאו פסולים: 60,238"; 1,427,981 − 1,367,743 = 60,238 |
| Votes, 16 lists | אמת 632,035; ב 133,238; ג 44,002; ד 24,968; ו 38,827; חל 296,294; ט 16,393; יא 19,943; כן 7,591; לע 43,933; נס 5,138; עמ 42,654; פז 2,116; ק 15,712; רא 28,046; ש 16,853 | YP 1573 p. 433 (1), read visually; IDI 1969 page https://www.idi.org.il/policy/parties-and-elections/elections/1969 (2) | Identical in both; sum 1,367,743 |
| Seats | 56/12/4/2/3/26/2/2/0/4/0/4/0/1/2/2 | YP 1573 p. 434 §(3) (1); recomputation (quota 11,274; 114 + 6) | JTA 10 Nov 1969 (3): "The number of votes needed to capture one seat was given as 11,274. A total of 114 seats were distributed…" |
| Letters and names | all 16 letters; 14 names identical to YP 1573 (עמ and נס: see #8) | YP 1573 p. 433 (1); YP 1563 headers (1) | e.g. "חל גח"ל — גוש חרות ליברלים"; "ב חזית דתית לאומית, המזרחי—הפועל המזרחי ובלתי מפלגתיים" |
| No withdrawn/cancelled list | 16 lists in YP 1563 = 16 in YP 1573; `withdrawn: false` × 16 | YP 1563 pp. 207–235 (1), every list header inspected | כן header on p. 234: "אותיות הרשימה: "כן" הכינוי: רשימה למען ארץ ישראל" (27 candidates, #1 "ד"ר אלדד ישראל") |
| Surplus agreement | יא–רא only, `complete: true` | YP 1565 p. 246 (1), read visually | "שיתוף ואחווה עם קידמה ופיתוח", signed "ח' בחשון תש"ל (20 באוקטובר 1969) א' ויתקון" |
| Elected names | 120/120, ranks 1…N for each of 13 lists | YP 1573 pp. 434–435 §(4) (1); YP 1563 pp. 207ff (1) | Candidate spelling kept by convention; results-notice variants (אהרון, כח) are typographic only |
| Knesset identities | 120 `knessetPersonId` = OData opening membership 1969-11-17, no extras or missing | retained `k7/knesset-odata-members.json` (1) | 13 spelling variants only, e.g. OData "קשת בן-ציון" for gazette "קצנלבוגן בן-ציון" (documented) |
| Knesset site IDs (spot check) | 685, 104, 72, 610, 44, 448, 449, 596, 333 | Knesset WebSiteApi `GetMkdetailsHeader` (1) | 685 "גולדה מאיר (מאירסון)"; 610 "בן-ציון קשת (קצנלנבוגן)"; 333 "יצחק גולן (גולדשטיין)" |
| Joint lists | אמת = Labor 49 + Mapam 7 (ranks 5, 10, 19, 26, 33, 40, 46); חל = Herut 15 + Liberal 11 | Knesset member bios (1), cited per member; Hebrew Wikipedia (5) for the split; IDI-hosted YP 1563 scan (2) | e.g. Zoubi: "בשנת 1958 הצטרף למפ"ם"; Harari: "במאי 1968 … הצטרף למפלגת העבודה" |
| Lineage | `partners-7-אמת` (labor, mapam), `partners-7-חל` (herut, liberal-party) | as above | consistent with `joint-facts.json` entries 7, 8 |
| Recommendation round | President Shazar; 13 entries; totals Meir 104 / unstated 16; 1969-11-01 → 11-09 | JTA 6 and 10 Nov 1969 (3); gov.14.pdf (1) | 56+26+12+4+2+2+2 = 104; 4+4+3+2+1+2 = 16 |
| Formation | mandate 1969-11-10; confidence vote 1969-12-15, 90–10–4; government 15 | plenum 7_ptm_253121.pdf pp. 2, 45 (1), read visually | "בעד הבעת אמון לממשלה 90 — נגד 10 — נמנעים 4 —" |
| Government 15 | PM Golda Meir 1969-12-15 → 1974-03-10; start-time coalition 6 lists = 102; opposition 18 | OData GovernmentNum 15 (1); plenum p. 2 (1); plenum 8_ptm_253620.pdf (gov 16, 1974-03-10) (1) | OData PM PersonID 2448 to 1974-03-10; "שש סיעות, המייצגות ביחד 102 חברי כנסת" |
| Term events | Black Panthers 1971; Lod 1972-05-30; Munich 1972-09-05; Yom Kippur War 1973-10-06; "terrorists" wording per stance | MOD archive, MFA timeline, Knesset history (via JVL), CFR (cited) | dates match the cited chronologies |
| Term close | election postponed from 30 Oct to 31 Dec 1973 | IPU 1973 (2); IDI (2); CBS 27.2 "31.12.1973" (1) | IPU: "originally scheduled for October 30, 1973, were postponed until the end of the year" |
| Logo | חל 1969 emblem; in use 1969-10-25 | Jabotinsky Institute item 33732 (1, party-issued poster), retained page and asset, both hashes match | Catalogue: "אסיפת עם לקראת ההכרעה, נועדה ל- 25.10.1969 באשדוד … גוף יוצר: גחל - גוש חרות ליברלים … שנה לועזית: 1969"; the poster shows the חל square monogram |
| Platform links | Gahal 1969 PDF; NRP 1969 .doc (IDI-hosted) | HTTP check | both respond with the expected content type |
| Families | 9 memberships; sums 86,816 / 60,326 / 68,970 / 296,294 / 632,035 / 133,238 / 202,208 | arithmetic from YP 1573 votes | all correct |
| Hashes | `party-lineage.json` `sources.k7.sha256` and all 9 family `datasetSha256` = `ce3a599c…a5` | `sha256sum public/data/k7.json` at `68b836a` | match; all 7 retained raw files match `SOURCES.json` |
| UI text | "1951–1969 law": largest remainder, at most one remainder seat per list | law 1969 s. 81 (1); the recomputation reproduces seats | consistent |
