# Data audit k12 (1 November 1988, 12th Knesset): Opus auditor

Auditor: Claude Opus (independent; did not read the Codex report). Base: `ece8a47` (contains `53cca36`). Accessed:
2026-11-06 for every source unless stated. Method: [BRIEF.md](BRIEF.md) with
[source-hierarchy.md](../source-hierarchy.md). No data edited.

## Summary

| Class | Count | Notes |
|---|---:|---|
| OK | 528 | Counted per field: 5 national totals/date, 27 lists × votes and seats, 20 letters, 22 list names, 4 agreement pairs, 120 elected persons, 118 elected-name spellings, Reiser omission, 12 recommendation entries + 3 totals + 2 dates, 8 formation steps, government card (number, PM, dates, 6 coalition lists, 97 seats, opposition), 4 term events + end of term, Kach disqualification, 6 joint-list constituent assignments, 2 logos, 121 bio Knesset IDs, 9 family hashes, threshold and rule set |
| WRONG | 22 | **7 minor-list letters and 5 list names differ from both official notices**; 1 agreement pair; 1 elected-name spelling; 1 wrong party link; 1 misdated/unexplained context event (Reiser); 1 stale aftermath gap; 1 stale lineage hash; 3 transliterations derived from the wrong names; 1 English-name typo pair |
| UNSUPPORTED | 3 | Moledet logo year; JVL mirror tagged "official"; Liberal Centre constituent not modelled |
| UNVERIFIABLE | 3 | Hadash, PLP and ADP recommendations of Peres (no contemporary report found; data already says so) |
| DISPUTED | 1 | Alignment #21: candidates notice "בורג אברהם" vs results notice "אברם בורג" (rank 1 vs rank 1) |

**Main finding.** The retained official notices were re-read visually (both PDFs are CCITT scans with no text
layer). Every vote, seat, total and elected member is right. But the **letters of 7 of the 12 non-winning lists, and the
names of 4 of them**, do not match YP 3588 (candidate lists) or YP 3591 (results). They look like misreadings of the
scan, e.g. `זפ / זעם ורעש` for the printed `זעמ / תרשיש` (the letters were read as the name), and `זב / …ישועה
וחיים…` for `זכ / אחדות – למען ויקטור תייר לכנסת`. The wrong IDs (`12-זב`, `12-זפ`, `12-טף`, `12-יע`, `12-מעם`,
`12-קק`, `12-קצץ`) propagate into `scripts/lib/list-meta.ts` (lines 300–317), `data/meta/k12.json`,
`data/meta/party-links/k12.json` (`lists` and `gaps` keys), `data/meta/parties.json` (`vehicle-12-*` ids),
`data/meta/families/haredi.json:1532` and `religious-parties.json:2271` (`12-טף`), the agreement in
`data/raw/k12/national.reviewed.json`, and the generated `public/data/k12.json`.

No English Wikipedia anywhere in the k12 files (`grep en.wikipedia` = 0 in `data/meta/k12.json`,
`aftermath/k12.json`, `bios/k12.json`, `logos/k12.json`, `party-links/k12.json`, `data/raw/k12/*`). No partisan
wording found. Hebrew Wikipedia is the sole basis only for joint-list constituents and colours (rank 1 OData
corroborates the constituents where a faction record exists); see OK table.

The official results notice **is** retained (`k12-results-gazette`); no later correction notice is known to me. The
retained PDF is the whole YP 3591 issue; pp. 245–270 contain unrelated notices (no correction).

## Key sources re-read for this audit

- **YP 3591** (ילקוט הפרסומים 3591, כ"ט בחשון התשמ"ט, 9.11.1988), pp. 242–244: "הודעה על תוצאות הבחירות לכנסת
  השתים־עשרה", signed Eliezer Goldberg, chairman of the CEC. Retained as `data/raw/research/k12-results.pdf`
  (sha256 a6e6b110…), gov.il copy https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset12-results.pdf.
  Rendered at 4.5× and read visually. Rank 1.
- **YP 3588** (ילקוט הפרסומים 3588, י"ב בחשון התשמ"ט, 23.10.1988), pp. 146–169 (candidate lists, each headed
  "אות הרשימה: … / הכינוי: …") and p. 170 ("הודעה בדבר התקשרויות בין רשימות המועמדים לכנסת"). Retained as
  `data/raw/research/k12-candidates.pdf`, gov.il copy …/knesset12-cand.pdf. Rank 1.
- **CBS table 27.2** (published 04.07.2024), retained as `data/raw/research/cbs-national-totals-2024.pdf`. Rank 1.
- **Knesset OData** `KNS_PersonToPosition` (KnessetNum 12; GovernmentNum 23; PersonID 2608) and `KNS_Person`. Rank 1.
- **Knesset government extracts** https://main.knesset.gov.il/mk/government/documents/gov23.pdf and gov24.pdf
  (Divrei HaKnesset annexes). Rank 1.
- JTA Daily Bulletin archive (rank 3), LA Times/UPI 14 Nov 1988 (rank 3–4), IDI (rank 2), IPU Parline (rank 2).

## Non-OK findings

Severity: **H** high (wrong fact shown to users), **M** medium, **L** low (wording, formatting, or not displayed).
"Gazette letters" are transcribed as printed; 1988 notices print some ballot letters with non-final forms (`זעמ`,
`יענ`). Whether the app normalises to final forms (`זעם`, `יען`) is a display convention for the fixer; the
letters themselves are what matter.

| # | Sev | File | JSON path | Current value | Correct value | Class | Source (rank) | Quote (as printed) | Accessed |
|---|---|---|---|---|---|---|---|---|---|
| 1 | H | `data/raw/k12/national.reviewed.json` (→ `scripts/lib/list-meta.ts:300`, `data/meta/k12.json`, `party-links`, `parties.json`, `public/data/k12.json`) | `lists[letters=זב].letters`, `.nameHe` | `זב`, "אחדות – למען ישועה וחיים לכנסת" | `זכ`, "אחדות – למען ויקטור תייר לכנסת" | WRONG | YP 3588 p. 153 (1); YP 3591 p. 242 §1 row 7 (1) | YP 3588: "אות הרשימה: זכ / הכינוי: אחדות - למען ויקטור תייר לכנסת", candidate 1 "תייר הטי (ויקטור)"; YP 3591: "7. זכ אחדות – למען ויקטור תייר לכנסת 446" | 2026-11-06 |
| 2 | H | same chain | `lists[letters=זפ].letters`, `.nameHe` | `זפ`, "זעם ורעש" | `זעמ` (or `זעם`), "תרשיש" | WRONG | YP 3588 p. 154 (1); YP 3591 p. 242 row 8 (1) | YP 3588: "אות הרשימה: זעמ / הכינוי: תרשיש", candidate 1 "דוויק משה"; YP 3591: "8. זעמ תרשיש 1,654" | 2026-11-06 |
| 3 | H | same chain | `lists[letters=מעם].letters`, `.nameHe` | `מעם`, "תנועה למען מועמדים־ערי פיתוח ושכונות" | `מעש`, "תנועה למען מושבים, ערי פיתוח ושכונות" | WRONG | YP 3588 p. 156 (1); YP 3591 p. 242 row 15 (1) | YP 3588: "אות הרשימה: מעש / הכינוי: תנועה למען מושבים, ערי פיתוח ושכונות"; YP 3591: "15. מעש תנועה למען מושבים, ערי פיתוח ושכו־נות 2,838" | 2026-11-06 |
| 4 | M | same chain | `lists[letters=קצץ].letters`, `.nameHe` | `קצץ`, "הגימלאים" | `קמע`, "גימלאים" (`list-meta.ts:317` and `shortHe` already say "גימלאים") | WRONG | YP 3588 p. 164 (1); YP 3591 p. 242 row 24 (1) | YP 3588: "אות הרשימה: קמע / הכינוי: גימלאים"; YP 3591: "24. קמע גימלאים 16,674" | 2026-11-06 |
| 5 | M | same chain | `lists[letters=קק].letters` | `קק` | `קם` | WRONG | YP 3588 p. 164 (1); YP 3591 p. 242 row 23 (1) | YP 3588: "אות הרשימה: קם / הכינוי: התנועה למען חיילים משוחררים"; YP 3591: "23. קם התנועה למען חיילים משוחררים 1,018" | 2026-11-06 |
| 6 | M | same chain, plus `agreements.pairs[3]` and `public/data/k12.json` `agreements[3].members` | `lists[letters=יע].letters`; `agreements.pairs[3][1]` | `יע`; pair `["קז","יע"]` | `יענ` (or `יען`); pair `["קז","יענ"]` | WRONG | YP 3588 p. 155 and p. 170 §4 (1); YP 3591 p. 242 row 12 (1) | YP 3588 p. 155: "אות הרשימה: יענ / הכינוי: התאחדות התימנים בישראל"; p. 170: "התנועה למען חברה צודקת – קז עם התאחדות התימנים בישראל – יענ." | 2026-11-06 |
| 7 | M | same chain; also `families/haredi.json:1532`, `families/religious-parties.json:2271` | `lists[letters=טף].letters` | `טף` | `טיף` | WRONG | YP 3588 p. 154 (1); YP 3591 p. 242 row 10 (1) | YP 3588: "אות הרשימה: טיף / הכינוי: ישי - יחד שבטי ישראל"; YP 3591: "10. טיף ישי – יחד שבטי ישראל 2,947" | 2026-11-06 |
| 8 | M | `national.reviewed.json`, `data/meta/k12.json` `lists[letters=הן].nameHe` → `public/data/k12.json` | `lists[letters=הן].nameHe` | "תנועת המרכז – שינוי (שינוי־לע״מ־המרכז הליברלי)" | "תנועת המרכז – שינוי (שינוי – ל״ע – המרכז הליברלי)" (ל"ע = Independent Liberals) | WRONG | YP 3588 p. 150 and p. 170 §2 (1); YP 3591 pp. 242–243 (1) | YP 3588: "הכינוי: תנועת המרכז - שינוי (שינוי - ל"ע - המרכז הליברלי)"; YP 3591 §4(ד): "מרשימת תנועת המרכז – שינוי (שינוי־ל"ע־המרכז הליברלי) (הן)". (YP 3591 §1 row 4 prints "תנועת מרכז", without ה; the other three places have "המרכז".) | 2026-11-06 |
| 9 | M | `data/raw/k12/candidates.reviewed.json` lines 873, 890 → `public/data/k12.json` | `lists[letters=מפם].candidates[2].nameHe` | "פארס חסין" | "פארס חסיין" | WRONG | YP 3588 p. 157 rank 3 (1); YP 3591 p. 244 §4(ח) (1) | YP 3588: "3 פארס חסיין"; YP 3591: "3. חסיין פארס" | 2026-11-06 |
| 10 | M | `data/meta/party-links/k12.json` | `lists["12-טע"][0]` (neutral link) | Hebrew WP "דרך ארץ (מפלגה)" | Remove. That article is the 2020–2022 party of Yoaz Hendel and Zvi Hauser, unrelated to the 1988 list (candidates אורבך טל נפתלי דב, קבלאן נביל…). `parties.json` correctly keeps `vehicle-12-טע` and `derech-eretz` separate. | WRONG | Hebrew WP article text (5, used only to show the mismatch); YP 3588 p. 154 (1) | hewiki: "דרך ארץ הייתה מפלגת ימין ישראלית שהוקמה על ידי חברי הכנסת יועז הנדל וצבי האוזר" | 2026-11-06 |
| 11 | M | `data/meta/election-context.json` | `events[id=registered-not-declared-k12-מחל]` `.effectiveDate`, `.textEn/He` | 1988-11-21; "By opening day: … omitted … No resignation date or cause is inferred from the omission." | The cause is documented: Michael Reiser (Likud #25) died on 27 Oct 1988, before election day, which is why YP 3591 skips him. Date 1988-10-27; reword, e.g. "Michael Reiser (#25) died on 27 October 1988, before the election; the results notice skips his place." | WRONG | Knesset OData `KNS_PersonToPosition?$filter=PersonID eq 2608` (1); Hebrew WP "מיכאל רייסר" (5, for the cause) | OData: K11 PositionID 43, StartDate 1984-08-13, **FinishDate 1988-10-27**; hewiki: "(26 באפריל 1946 – 27 באוקטובר 1988) … נפגע אנושות בתאונה, ולאחר יום נפטר" | 2026-11-06 |
| 12 | L | `data/meta/aftermath/k12.json` | `gaps[0]` | "Certification date and official first-sitting record not retrieved…" | Stale. The retained YP 3591 notice is dated כ"ט בחשון התשמ"ט (9 November 1988), and the retained OData file gives the opening day as 1988-11-21 (all 120 StartDates). Remove the gap or record both dates. | WRONG | YP 3591 p. 244 (1); `data/raw/k12/knesset-odata-members.json` (1) | YP 3591: "כ"ט בחשון התשמ"ט (9 בנובמבר 1988) / אליעזר גולדברג / שופט בית המשפט העליון / יושב־ראש ועדת הבחירות המרכזית לכנסת השתים־עשרה" | 2026-11-06 |
| 13 | L | `data/meta/party-lineage.json` | `sources.k12.sha256` | `ff601254…c901a8` | `dcb3854c…db67e1615` (current `sha256sum public/data/k12.json`; all 9 family files already carry it) | WRONG | Internal | n/a | 2026-11-06 |
| 14 | L | `data/meta/k12.json` | `lists[letters=זב/זפ/מעם].englishName.label` | "Ahdut – Lemaan Yeshua VeHayim", "Zaam VeRaash", "Tnua Lemaan Muamadim – Arei Pituah UShkhunot" | Re-transliterate from the corrected names (#1–3), e.g. "Ahdut – Lemaan Victor Tayar LaKnesset", "Tarshish", "Tnua Lemaan Moshavim, Arei Pituah UShkhunot" | WRONG | As #1–3 | n/a | 2026-11-06 |
| 15 | L | `data/raw/bios/knesset-site-mk-names-en.json` → `public/data/k12.json` | `lists[ג].candidates[0].nameEn`; `lists[מחל].candidates[40].nameEn` | "Moseh  Zeev Feldman" (typo + double space); "Yeushua Sagi" | "Moshe Zeev Feldman"; "Yehoshua Sagi". Copied faithfully from the Knesset English site, whose spelling is wrong; a display override is the fixer's call. | WRONG | Knesset OData `KNS_Person` (1): "פלדמן משה-זאב"; YP 3591 (1): "יהושע שגיא" | n/a | 2026-11-06 |
| 16 | L | `data/meta/logos/k12.json` | `logos[letters=ט]` (moledet-1988.png) `.inUseEvidence` | "Commons explicitly identifies the Moledet logo in the 12th Knesset election (1988), citing NLI item IE10915803" | The Commons file page gives `date=1992-01-01`; only the user-written description says "בבחירות לכנסת ה־12". The NLI item (rosetta IE10915803) returned 403 to a normal request and could not be checked. Year 1988 not established. | UNSUPPORTED | Commons File:Moledet_party_old_logo.jpg wikitext (5-equivalent) | "{{he|1=סמליל מפלגת מולדת בבחירות לכנסת ה־12}} … \|date=1992-01-01 \|source=https://rosetta.nli.org.il/…IE10915803" | 2026-11-06 |
| 17 | L | `data/meta/aftermath/k12.json` | `sources.knesset-history.kind` | `official` (URL is jewishvirtuallibrary.org) | JVL is a mirror; cite the Knesset original or mark as a mirror of an official text. (Aftermath is not wired into `src/`; `grep -rl aftermath src scripts` = 0.) | UNSUPPORTED | n/a | n/a | 2026-11-06 |
| 18 | L | `data/meta/k12.json` | `lists[letters=הן].parties` | Shinui + Independent Liberals only; Liberal Centre only in `notes` | The official list name names three components: "שינוי – ל"ע – המרכז הליברלי". Either add the Liberal Centre as a constituent with no elected member, or say in `notes` why it is omitted. | UNSUPPORTED | YP 3588 p. 150 (1) | "(שינוי - ל"ע - המרכז הליברלי)" | 2026-11-06 |
| 19 | L | `data/meta/k12.json` `blocSchemes[pm-recommendations]`; `aftermath/k12.json` `recommendationRounds[0].entries[9,12,13]` | ו, פ, ע → Peres | Recommended Peres | Arithmetically required by the reported 55, but no contemporary report naming these three was found. JTA 9 Nov 1988 names only Mapam, CRM and Shinui for Peres, and says Labor "rest[s] on the assumption that the Hadash Communists would passively support" it. The data already carries this caveat. | UNVERIFIABLE ×3 | JTA 9 Nov 1988 (3) https://www.jta.org/archive/fate-of-next-government-hangs-on-outcome-of-shas-party-session; UPI 14 Nov 1988 (3) | UPI: "Peres … could muster only 55 Knesset members to support a Labor-led government." Tried: JTA archive, LA Times, UPI, Exa search. | 2026-11-06 |
| 20 | L | `candidates.reviewed.json` → `public/data/k12.json` | `lists[אמת].candidates[20].nameHe` | "בורג אברהם" | Candidates notice: "בורג אברהם"; results notice: "אברם בורג". Keep the candidates-notice form and add a display note, or use the results-notice form (it is the later document and his known name). | DISPUTED | YP 3588 p. 146 rank 21 (1) vs YP 3591 p. 243 §4(א) 21 (1) | YP 3588: "21 בורג אברהם"; YP 3591: "21. אברם בורג" | 2026-11-06 |

### Coverage gap (not classified)

No replacement notes exist for k12 (`candidate-notes.json` has none; rosters stop at the elected rank). The retained
OData file shows 9 mid-term changes. If replacements are meant to be noted:

| Left (date) | Entered (same date) | List |
|---|---|---|
| יגאל כהן (1988-12-06) | מיכאל קליינר | מחל |
| מאיר וילנר (1990-01-10) | האשם מחאמיד | ו |
| יובל נאמן (1990-01-30) | גרשון שפט | ת |
| אליעזר ולדמן (1990-01-31) | אליקים העצני | ת |
| תופיק זיאד (1990-02-14) | מוחמד נפאע | ו |
| תופיק טובי (1990-07-04) | תמר גוז'נסקי | ו |
| זלמן שובל (1990-10-08) | חיים קופמן | מחל |
| עזר ויצמן (1992-02-03) | סאלח טריף | אמת |
| חיים קורפו (1992-04-14) | לימור לבנת | מחל |

Source: `data/raw/k12/knesset-odata-members.json` (Knesset OData, rank 1), Start/FinishDate fields. The pairing is by
matching dates within a list; the replacements' list ranks were not checked against YP 3588.

## Checked and found OK

| Area | What | Source (rank) and quote / evidence |
|---|---|---|
| Election date | 1988-11-01 | CBS 27.2 (1): "1.11.1988"; JTA 6 Dec 1988 "the Nov. 1 Knesset elections" |
| Totals | registered 2,894,267; votes cast 2,305,567; valid 2,283,123; invalid 22,444 | CBS 27.2 (1): "2,283,123 / 1.0 / 79.7 / 2,305,567 / 2,894,267"; YP 3591 §1 "סה"כ 2,283,123", §2 "מספר הקולות שנמצאו פסולים: 22,444". valid + invalid = cast exactly |
| Votes (27 lists) | every `gazetteVotes` value | YP 3591 p. 242 §1, read row by row: 685,363 / 89,720 / 102,714 / 39,538 / 84,032 / 1,579 / 446 / 1,654 / 44,174 / 2,947 / 4,253 / 909 / 709,305 / 15,783 / 2,838 / 56,345 / 27,012 / 4,182 / 34,279 / 33,695 / 45,489 / 3,222 / 1,018 / 16,674 / 97,513 / 107,709 / 70,730; sum 2,283,123 |
| Seats (27 lists) | every `officialSeats` value, total 120 | YP 3591 §3: אמת 39, ב 5, ג 5, הן 2, ו 4, ט 2, מחל 40, מפם 3, ע 1, עץ 2, פ 1, ץ 2, רצ 5, שס 6, ת 3, "סה"כ 120" |
| Letters (20) | אמת ב ג הן ו ז ט טע מחל מי מפם ע ענף עץ פ ץ קז רצ שס ת | YP 3588 headings and YP 3591 §1 |
| List names (22) | all except #1–4 and #8 above, incl. ו (full Hadash name), ב, ג, ענף (לאו"ר), ץ ("להתחדשות ציונית", as in YP 3588 p. 162 and YP 3591 §3/§4) | YP 3588 headings (1) |
| Agreements | אמת–רצ, הן–מפם, מחל–ת, שס–עץ (4 OK; קז–יע see #6); complete (5 pairs) | YP 3588 p. 170 (1), dated "י"ב בחשון התשמ"ט (23 באוקטובר 1988)" |
| Threshold / rules | 1% (glossary "1% in 1951–1988"), `il-1973-bader-ofer-1` | `k8-k12-law-1973` retained (1) |
| Elected members | all 120 persons, in order, for 15 lists | YP 3591 pp. 242–244 §4(א)–(טו), compared name by name with `public/data/k12.json`; Likud list jumps from "24. עובדיה עלי" to "25. אריאל ויינשטיין" |
| Reiser omission | `notSeated` on מחל #25 and the Hebrew note | YP 3588 p. 155 "25 רייסר מיכאל"; YP 3591 omits him (cause: see #11) |
| Elected spellings | 118 of 120 match YP 3588 (exceptions #9 and #20). Feldman: YP 3588 "פלדמן משה זאב" (app) vs YP 3591 "זאב משה פלדמן"; app follows the candidates notice; OData "פלדמן משה-זאב". Shinui #2 "פורז-פוזמנטיר אברהם" matches YP 3588 p. 150 | (1) |
| Opening-day membership | 120 bio `knessetPersonId`s = the 120 OData members with StartDate 1988-11-21; Reiser's ID 2608 correct | Retained OData (1) |
| Kach disqualification | `eligibility-final-k12-3` | IDI https://www.idi.org.il/articles/65951 (2): table row "1988 כך הערעור נדחה" |
| Recommendations | מחל 40, שס 6, ג 5, ב 5, ת 3, ץ 2, ט 2 → Shamir (63); אמת 39, רצ 5, מפם 3, הן 2 → Peres; עץ none (2); totals 63/55/2; date 13 Nov 1988 (deadline day; consultations ran over several days) | LA Times 14 Nov 1988 (3) "Besides Shas, Agudat Israel … gave Likud its backing with five seats. Likud had already won the support of the Orthodox National Religious Party … Three other parties to the right are contributing seven."; UPI 14 Nov 1988 (3, read via Exa extract) "Degel Hatorah, pledged its two Knesset seats to a broad-based coalition"; JTA 9 Nov 1988 (3) Mapam/CRM/Shinui → Peres, Tehiya/Tsomet/Moledet → Shamir |
| Mandate | Shamir tasked 14 Nov 1988, 21 days | LA Times/UPI 14 Nov 1988 (3): "asked … Shamir to form Israel's 23rd government today, kicking off a 21-day period" |
| Extension | 5 Dec 1988, +21 days | JTA 6 Dec 1988 (3): "gave … Shamir an additional 21 days … The original 21 days … expired Monday" |
| Government 23 | number, PM Shamir, start 22 Dec 1988, end 11 Jun 1990 | Knesset gov23.pdf (1): "הממשלה העשרים-ושלוש בראשות יצחק שמיר הוצגה ואושרה בכנסת ביום חמישי, י"ד בטבת תשמ"ט, 22 בדצמבר 1988"; gov24.pdf (1): "…אושרה בכנסת ביום שני, י"ח בסיוון תש"ן, 11 ביוני 1990" |
| Confidence vote | 84–19 | JTA 23 Dec 1988 (3): "The lopsided 84-19 vote of confidence" |
| Coalition | מחל, אמת, ג, ב, שס, עץ (no ministers); 97 seats | OData GovernmentNum 23 (1): Agudat's PersonID 2541 פלדמן משה-זאב deputy minister of labour from 1988-12-26; Shas and NRP ministers; hewiki coalition table (5) lists the same six; JTA 15 Mar 1990: "Degel sided with the government" |
| No-confidence | 15 Mar 1990, 60–55; caretaker | JTA 16 Mar 1990 (3): "The 60-55 vote … Shamir remains at the helm of a Likud-led caretaker government"; OData: Labor ministers' FinishDate 1990-03-15 |
| Mandate returned | Peres, 26 Apr 1990 | JTA (3): "Peres' fruitless attempts ended April 26, when he handed back his mandate" |
| Government 24 | 11 Jun 1990, 62–57 | gov24.pdf (1) date; JTA (3) "by a vote of 62-57" |
| Term | end 23 Jun 1992; dissolution law 4 Feb 1992 | CBS 27.2 (1) "23.6.1992"; IPU 1992 (2) "dissolution of this body on 4 February 1992" |
| Term events | Gulf War Scuds 1991; Operation Solomon 24 May 1991; Madrid Oct 1991; 1992 Basic Laws | Cited Knesset history (JVL mirror) and MFA history; IDI constitutional history (2) for the Basic Laws |
| Joint lists | UTJ: Agudat 1, 2, 4, 5 and PAI 3 (Verdiger); Hadash: Rakah 1, 2, 4 and Black Panthers 3 (Biton); Shinui 1, 2 | OData faction records (1) where available (Feldman, Porush, Halpert, Mizrachi "אגודת ישראל"; Biton "פנתרים שחורים" from 1991; Rubinstein "שינוי"); otherwise hewiki (5, labelled). Tzvika Nir is rank 3 of הן (YP 3588 p. 150 "3 ניר צבי"), consistent with the note |
| Logos | Likud 1988 poster crop; Mapam 1988 | Retained Jabotinsky page: "גוף יוצר: הליכוד", "18.10.1988"; Commons Mapam file: "Logo of Mapam as used in the lead up to the 1988 … election", date 1988, traced from the 1988 broadcast |
| Family files | 9 × `datasetSha256` = dcb3854c… = current `public/data/k12.json` | `sha256sum` |
| Party links | 12-יע → hewiki "התאחדות התימנים בישראל" is the right party | hewiki: "לקראת הבחירות לכנסת השתים עשרה (1988) נעשה ניסיון נוסף … רק 909 קולות" |
