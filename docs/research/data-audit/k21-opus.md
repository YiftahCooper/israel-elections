# Data audit k21 (9 April 2019, 21st Knesset): Opus auditor

Auditor: Claude Opus (independent; did not read the Codex report). Base: `d2c1ed0` (contains `53cca36`). Accessed:
2026-11-06 for every source below unless stated. Method: [BRIEF.md](BRIEF.md) with
[source-hierarchy.md](../source-hierarchy.md). No data edited, no build run.

## Summary

| Class | Count | Notes |
|---|---:|---|
| OK | 543 | Counted per field: election identity, national and derived totals, 43 lists × letters/name/votes/seats, 6 agreements, 43 rosters (1,580 candidates, name by name), 120 elected names, 120 Knesset person IDs, 18 joint-list constituents, recommendation round, formation timeline, context events, logo evidence, lineage edges |
| WRONG | 11 | 3 withdrawn lists flagged as running; no resignation notes at all although the status note says they are labelled; 1 misprinted list name; 2 sponsor-party names; 1 unbalanced bracket in a candidate name; 1 Hebrew grammar slip; stale family/lineage status copy; stale "inferred" notes on the Arab lists' recommendations |
| UNSUPPORTED | 2 | Party-link titles call the CEC page the "results notice"; party records that are really list names |
| UNVERIFIABLE | 2 | Two cited Times of Israel liveblog quotes (bot challenge; Wayback rate-limited). Substance confirmed elsewhere |
| DISPUTED | 1 | Spelling of the Zkhuyotenu sponsor party (candidate gazette vs results notice, both rank 1; low) |

**Main findings (same classes as k22):**

1. **The official results notice was not retained.** It is **Reshumot YP 8208, 17 April 2019, pp. 10062–10066**
   ("הודעה בדבר תוצאות הבחירות לכנסת ה–21"), signed by CEC chairman Hanan Melcer. It confirms every list's votes and
   seats, valid votes 4,309,270, invalid votes 30,983 and all 120 elected names. Unlike k22 it has **no misprint**: its
   figures equal the CEC page and both data.gov files. It lists **40** lists and omits ץז, זנ and נך. Retrieved from
   the olaw.org.il mirror: https://olaw.org.il/yalkut/yalkut-8208.pdf (SHA-256
   `1c55879fd58cacdd1398ac41a6b9382e95d539b0744ea4f03dab6531680b9b09`). A second copy is at
   https://a7.org/?file=20190430024942.pdf. Register it in `SOURCES.json` (suggested id `k21-results-gazette`) as the
   statutory results notice.
2. **Three lists withdrew** (every candidate resigned) and are still marked `withdrawn: false`: Reform Party (נך),
   Ofek Hadash BeKavod (ץז) and Yachad (זנ). The resignations are in three gazette notices that were also not retained:
   **YP 8172** (26 Mar 2019, pp. 9194–9195), **YP 8186** (4 Apr 2019, p. 9542) and **YP 8196** (10 Apr 2019, p. 9858).
3. **No k21 list has a resignation note**, but the dataset status says "known resignation notices are labelled". The
   notices above also cover three individual candidates on lists that did run (URWP #42, Senior Citizens #5,
   Tzomet #4).

No English Wikipedia anywhere in the k21 files (`grep en.wikipedia` = 0 in `data/meta/k21.json`, `aftermath/k21.json`,
`bios/k21.json`, `logos/k21.json` and `party-links/k21.json`).

## Non-OK findings

Severity: **H** high (wrong fact shown to users), **M** medium, **L** low (wording or formatting, or not displayed).
For the dataset, the input is the builder `scripts/lib/historical/k20-k21-common.ts` (k21 has no hand-edited list
file). It sets `withdrawn` (default false through `scripts/lib/build/records.ts:29`) and `notesHe` (lines 186–191, which
hold k20 notes only). The generated path is given for orientation.

| # | Sev | File | JSON path | Current value | Correct value | Class | Source (rank) | Quote | Accessed |
|---|---|---|---|---|---|---|---|---|---|
| 1 | H | builder → `public/data/k21.json` | `lists[42].withdrawn` (21-נך, מפלגת הרפורמה) | `false` | `true`: all 11 candidates resigned on 17–21 Mar 2019 | WRONG | YP 8172 pp. 9194–9195 (1) https://olaw.org.il/yalkut/yalkut-8172.pdf; YP 8208 (1): absent from §1 and §3 | YP 8172 items (3)–(13), e.g. "(9) עבד אל סלאם קשוע, מרשימת "מפלגת הרפורמה", התפטר מרשימת המועמדים ביום י' באדר ב' התשע"ט (17 במרס 2019);" … "(13) עומיר כבהא, מרשימת "מפלגת הרפורמה", התפטר מרשימת המועמדים ביום י"ד באדר ב' התשע"ט (21 במרס 2019)." | 2026-11-06 |
| 2 | H | as above | `lists[40].withdrawn` (21-ץז, אופק חדש בכבוד) | `false` | `true`: all 12 candidates resigned on 1 Apr 2019 | WRONG | YP 8186 p. 9542 (1) https://olaw.org.il/yalkut/yalkut-8186.pdf; YP 8208 (1): absent | "(1) מוחמד סאלם, יאסר מואסי, ויסאם עאסלה, רבאח טאהא, מאג'ד פלאח, אחמד מנאע, מרעי חיאדרה, מנאר ח'לאילה, שאוקי שנאן, מחמד אלסייד, סלמאן אבו אחמד ומיסם מג'דוב מרשימת "אופק חדש בכבוד" התפטרו מרשימת המועמדים ביום כ"ה באדר ב' התשע"ט (1 באפריל 2019);" | 2026-11-06 |
| 3 | H | as above | `lists[41].withdrawn` (21-זנ, Yachad) | `false` | `true`: withdrawal announced 27 Mar 2019; all 18 candidates resigned on 1, 2, 7 and 8 Apr | WRONG | YP 8186 p. 9542 items (2)–(3) (1); YP 8196 p. 9858 (1) https://olaw.org.il/yalkut/yalkut-8196.pdf; Ynet 27 Mar 2019 (4) https://www.ynet.co.il/articles/0,7340,L-5485370,00.html; Globes 27 Mar 2019 (4) https://www.globes.co.il/news/article.aspx?did=1001279913 | YP 8186: "(2) אליהו ישי, אופיר (פרג') שלי, דוד אוזן, אפי אפרים טויטו, צבי ימין, יונתן יוסף, ניר אריאל, אבנר עורקובי וחיים זאב סיביליה מרשימת "יחד בראשות אלי ישי" התפטרו מרשימת המועמדים ביום כ"ה באדר ב' התשע"ט (1 באפריל 2019)"; item (3) six more on 2 Apr; YP 8196: Gamil (2 Apr), Bremer (7 Apr), Yadgar Babayof (8 Apr). Ynet: "מפלגת יחד שבראשה עמד אלי ישי לא תתמודד בבחירות לכנסת ה-21" | 2026-11-06 |
| 4 | M | builder → `public/data/k21.json`; also `data/meta/families/*.json` `elections[k21].datasetStatus` | `lists[*].notesHe` (all 43 empty); `status.noteHe/noteEn` | `[]`; "known resignation notices are labelled" | Add the gazetted resignations as notes: נך (11, YP 8172); ץז (12, YP 8186); זנ (9 + 6, YP 8186; 3, YP 8196); **טב #42 אבינעם גואלמן, 14 Mar 2019** (YP 8172 item 1); **זי #5 אברהם ממה שיינפיין, 14 Mar 2019** (YP 8172 item 2); **זץ #4 אבירם בלזר, 2 Apr 2019** (YP 8186 item 4). Otherwise the status sentence is false for k21. | WRONG | YP 8172, 8186, 8196 (1). I scanned every YP from 8169 (25 Mar) to 8196 (10 Apr): only these three carry k21 resignation notices | YP 8172: "(1) אבינעם גואלמן, מרשימת "איחוד מפלגות הימין הבית היהודי - האיחוד הלאומי - עוצמה יהודית", התפטר מרשימת המועמדים ביום ז' באדר ב' התשע"ט (14 במרס 2019); (2) אברהם ממה שיינפיין, מרשימת "מפלגת האזרחים הוותיקים", התפטר …"; YP 8186: "(4) אבירם בלזר מרשימת "אורן חזן בראשות "צומת"" התפטר מרשימת המועמדים ביום כ"ו באדר ב' התשע"ט (2 באפריל 2019)." Each notice ends: "הודעתי מיום י"ז באדר ב' התשע"ט (24 במרס 2019), בדבר רשימות המועמדים לכנסת ה–21 תתוקן לפי זה." | 2026-11-06 |
| 5 | L | builder → `public/data/k21.json`; `data/meta/parties.json` `parties[id=vehicle-21-זנ].names[0].nameHe`; `data/meta/families/religious-parties.json` (line 4540) | `lists[41].nameHe` | `יחד בראשית אלי ישי` | `יחד בראשות אלי ישי`. YP 8168 misprints it; the CEC results page and the CEC chairman's own notices (YP 8186, YP 8196) print "בראשות". Follow the `displayNameHe` convention: keep the gazette text in a note | WRONG | CEC page (1), retained `data/raw/k21/nationalresults.html`; YP 8186, YP 8196 (1) | CEC: "יחד בראשות אלי ישי זנ 0"; YP 8196: "שמואל גמיל מרשימת "יחד בראשות אלי ישי" התפטר"; YP 8168 p. 9030: "כינוי הרשימה: יחד בראשית אלי ישי" | 2026-11-06 |
| 6 | L | builder → `public/data/k21.json` | `lists[19].partiesHe[0]`, `sponsorsHe` (21-זץ) | `צומת - התנועה לציוות מתחדשת` | `צומת - התנועה לציונות מתחדשת` (YP 8168 typo) | WRONG | YP 8208 §1 (1) | "זץ \| אורן חזן בראשות “צומת" \| צומת - התנועה לציונות מתחדשת \| 2,417" | 2026-11-06 |
| 7 | L | builder → `public/data/k21.json` | `lists[17].partiesHe[0]`, `sponsorsHe` (21-נץ) | `בראשות גל הירש` | `מגן - בראשות גל הירש` (YP 8168 lost the party name; the field shows a fragment) | WRONG | YP 8208 §1 (1) | "נץ \| מגן בראשות גל הירש \| מגן - בראשות גל הירש \| 3,394" | 2026-11-06 |
| 8 | L | builder → `public/data/k21.json` | `lists[14].candidates[1].familyHe` and `nameHe` (21-ן #2) | `שוורצברג אמסלם)` | Probably `שוורצברג (אמסלם)`. The opening bracket is missing from the PDF text layer (item 79 on p. 19 is "אמסלם)", with no "(" anywhere). Confirm on the rendered page. Either way the unbalanced bracket is a transcription artefact | WRONG | YP 8168 p. 9039 (1), retained `data/raw/k21/candidates.pdf` | text layer: "2 \| אתי \| שוורצברג" / "אמסלם)" | 2026-11-06 |
| 9 | L | `data/meta/election-context.json` | `events[id=candidate-exclusion-final-k21].textHe` | "מיכאל בן ארי נפסלו בבית המשפט העליון לאחר שהוועדה אישרה את מועמדותם" | "מיכאל בן ארי נפסל … את מועמדותו" (one candidate; the plural is a template artefact). The fact is right: Ben-Ari is absent from the gazetted URWP roster | WRONG (wording) | YP 8168 (1): preamble cites the 17 Mar 2019 Supreme Court rulings; טב list has no בן ארי | "ובהתאם להחלטות בית המשפט העליון בא"ב 1806/19 ע"ב 1866/19 … נ' כסיף (17.03.2019)" | 2026-11-06 |
| 10 | L | `data/meta/families/*.json` (all 9); `data/meta/party-lineage.json` | `elections[k21].datasetStatus.noteHe/noteEn`; `sources.k21.sha256` | "…No default blocs assigned." / "לא מוצגת השתייכות לגושים."; lineage `e5d1dd8e…6d73` | Stale. `public/data/k21.json` has `defaultBlocScheme: "pm-recommendations"`, and its status note has no blocs sentence. Its SHA-256 is `b8acc325…780a8b`, which the families file already holds, but lineage does not. Refresh with the hash step | WRONG | Internal | n/a | 2026-11-06 |
| 11 | L | `data/meta/aftermath/k21.json`; `data/meta/k21.json` | `recommendationRounds[0].entries[9,10].noteEn` (ום, דעם); `gaps[0]`; `blocSchemes[0].notes[0]` | "No recommendation inferred from the published 65/45 totals, not a retrieved direct statement by this list." | The value (`status: none`) is right, but direct statements exist. Replace the inference note with citations | WRONG (stale note) | Walla 15 Apr 2019 (4) https://news.walla.co.il/break/3230680; Walla 16 Apr 2019 (4) https://www.walla.co.il/news/politics/3230871; Israel Hayom 15 Apr 2019 (4) https://www.israelhayom.co.il/article/649775 | Walla 15 Apr: "יו"ר חד"ש, איימן עודה, ויו"ר תע"ל, אחמד טיבי, אמרו היום (שני) בפני נשיא המדינה ראובן ריבלין כי הם לא ממליצים על מועמד להרכבת הממשלה"; Walla 16 Apr: "סיעת רע"מ-בל"ד לא המליצה על אף מועמד" | 2026-11-06 |
| 12 | L | `data/meta/party-links/k21.json` | `lists[21-שס,ום,דעם,נר,ן,ר,נץ,ק,י,נז,זי,קף,ףז,ףי,ףץ,קן,ךק,ףך,יץ,ןך,ףנ,ןנ,ץי,יז,ץז,זנ,נך][0].titleHe` | "… — הודעת התוצאות לכנסת 21" (url = CEC results web page) | The URL is the CEC results page, not the Reshumot results notice (YP 8208). For ץז, זנ and נך the title is doubly wrong: the notice omits them. Retitle (e.g. "תוצאות ועדת הבחירות"), or point the 40 running lists to YP 8208 | UNSUPPORTED | CEC page (1); YP 8208 (1) | n/a | 2026-11-06 |
| 13 | L | `data/meta/parties.json` | `parties[id=labor\|shas\|tzomet\|daam\|meretz\|yisrael-beiteinu\|kulanu].names[date=2019-04-09].nameHe` | List ballot names, e.g. labor = "מפלגת העבודה בראשות אבי גבאי", tzomet = "אורן חזן בראשות "צומת"", daam = "כלכלה ירוקה - מדינה אחת", kulanu = "כולנו הימין השפוי בראשות משה כחלון" | Registered submitting parties: "מפלגת העבודה הישראלית", "ש"ס - התאחדות הספרדים העולמית שומרי תורה", "צומת - התנועה לציונות מתחדשת", "ארגון הפעולה הדמוקרטי - דע"ם", "מרצ", "ישראל ביתנו", "כולנו בראשות משה כחלון". Label these entries as list names, or record the party names. The same holds for `new-right` ("צל"ש - ציונות ליברליות ושיוויון"), which the meta file already labels correctly | UNSUPPORTED | YP 8208 "מטעם מפלגות" column (1); YP 8168 "מטעם המפלגה" lines (1) | YP 8208: "כ \| כולנו הימין השפוי בראשות משה כחלון \| כולנו בראשות משה כחלון"; "ץ \| כלכלה ירוקה - מדינה אחת \| ארגון הפעולה הדמוקרטי - דע"ם" | 2026-11-06 |
| 14 | L | `data/meta/aftermath/k21.json` | `results.certified.cites[0]` (source `toi-results`) | ToI liveblog quote "Central Elections Committee chairman Hanan Melcer hands the election results to President Reuven Rivlin" | Substance confirmed: YP 8208 is dated and signed 17 Apr 2019. A CEC press release says the results go to the gazette "as they will be submitted to the President" on Wed 17 Apr (Ynet-hosted PDF https://pic-upload.ynet.co.il/news/01935119.pdf, 1 via 4). The verbatim ToI quote is unconfirmed. Consider citing YP 8208 instead | UNVERIFIABLE | https://www.timesofisrael.com/liveblog_entry/central-elections-committee-head-submits-final-election-results-to-rivlin/ (4) | ToI returned HTTP 403 (bot challenge) to the project UA; the Wayback availability API then returned 429, so I stopped. | 2026-11-06 |
| 15 | L | `data/meta/aftermath/k21.json` | `formation.events[2].cites[0]` (source `toi-deadline`) | "Netanyahu will now have until May 29 to form the government" | Substance confirmed: ToI 13 May 2019 (Wayback 20190529030727, 4): "President Reuven Rivlin on Monday extended by two weeks the deadline", and 17 Apr + 28 days + 14 days = 29 May. The liveblog quote itself is unconfirmed | UNVERIFIABLE | https://www.timesofisrael.com/liveblog-may-13-2019/ (4) | as #14 | 2026-11-06 |
| 16 | L | builder → `public/data/k21.json` | `lists[21].partiesHe[0]` (21-נז) | `זכויותנו בקולנו` | YP 8168 prints the sponsoring party as "זכויותנו בקולנו"; YP 8208 prints "זכויותינו בקולנו" for both the list and the party. Both are rank 1; the later results notice is closer to the act. Low stakes: recommend the YP 8208 spelling with a note | DISPUTED | YP 8168 p. 9037 (1); YP 8208 §1 (1) | YP 8168: "מטעם המפלגות: זכויותנו בקולנו"; YP 8208: "נז \| זכויותינו בקולנו \| זכויותינו בקולנו \| 1,316" | 2026-11-06 |

### Findings 1–4 in detail

- **How the withdrawals happened.** The Elections Law has no separate "list withdrawal" act. A list leaves the race
  when its candidates resign under §87(b), which the CEC chairman gazettes. Each of the three lists lost its whole
  roster: נך 11/11, ץז 12/12, זנ 18/18 (9 + 6 + 3). The candidate counts match `scripts/lib/historical/k21.ts` COUNTS.
  The CEC results page still shows all three with 0 votes, and the official results notice YP 8208 leaves them out.
  The data.gov locality file has 0 votes in the זנ, ץז and נך columns.
- **Precedent in this repo.** k23 Tzomet uses `withdrawn: true` (`scripts/lib/historical/k22-k24-common.ts:211`), and
  k26 uses it for withdrawn lists with a note. The families data already says so: `families/haredi.json:2881` and
  `religious-parties.json:4547` give the reason "Yachad withdrawn; zero votes". So the generated flag contradicts the
  repo's own family records.
- **Dates for notes.** Reform 17–21 Mar 2019; Ofek Hadash 1 Apr 2019; Yachad announced 27 Mar 2019 (Ynet, Walla,
  N12, Channel 13, Globes) with the last resignation on 8 Apr 2019 (YP 8196). Context: Yishai said Yachad would
  support United Torah Judaism (Ynet, Globes). If this is added, keep it as attributed fact.
- **Individual resignations on running lists** (finding 4): טב #42, זי #5, זץ #4. None changes who was elected.
- **Retain the notices.** Suggested `SOURCES.json` entries: `k21-results-gazette` (YP 8208) and
  `k21-resignations-gazette` (YP 8172 + 8186 + 8196). All are on the olaw.org.il mirror. SHA-256: 8172
  `588c0bd7…1538`, 8186 `fd4d5918…231f`, 8196 `78050c0b…9cf4`, 8208 `1c55879f…9b09`.

## Editorial-stance and source-quality flags (not counted above)

- `data/meta/aftermath/k21.json` `term.candidatesPending[0]` (Gaza fighting, 4–6 May 2019; not displayed). If it is
  promoted, describe it as rocket fire from Hamas and Palestinian Islamic Jihad on Israeli communities and the IDF
  response. Use the Israeli official name if the IDF gave the round one (check an IDF or gov.il source; I did not). The
  SIPRI wording "The Gaza–Israel conflict escalates" is neutral-international.
- `data/meta/election-context.json` `eligibility-final-k21-13` (Ra'am–Balad), `-14` (Ofer Cassif) and
  `candidate-exclusion-final-k21` (Ben-Ari) cite only IDI (rank 3, "secondary"). A rank-1 source is available: the
  YP 8168 preamble names the 17 Mar 2019 Supreme Court rulings (א"ב 1806/19, ע"ב 1866/19). The gazetted rosters show
  Ra'am–Balad (דעם) and Cassif (ום #5) running, and Ben-Ari missing from טב. Consider citing it alongside IDI.
- `data/meta/k21.json` `colours[*]`: all sourced to Hebrew Wikipedia infobox colours and labelled "Not an official
  party specification". This is acceptable for display colours, as in k22; noted, not raised.
- `formation.events[3]` dissolution date: the data's **30 May 2019** follows the Knesset release (rank 1, dated
  30.05.19). ToI writes "On May 29, the Knesset voted to dissolve", because the vote ran past midnight on 29–30 May.
  No change needed. Optionally note that the debate began on 29 May.
- Mid-term change, not represented, as expected (candidate-notes cover only changes before the first sitting).
  Retained OData shows Merav Michaeli (Labor #7) entering on 2019-08-01, replacing Avi Gabbay. Mention it if term
  membership is ever shown.
- No partisan wording found in the k21 text fields. Formation events are factual and attributed.

## Checked and found OK

| Area | Claims | Value(s) | Source (rank) and quote/evidence |
|---|---|---|---|
| Election date, Knesset number | `electionDate`, `knesset`, `nameHe/En` | 2019-04-09; 21 | CEC page (1): "בחירות לכנסת ה-21 ד' בניסן התשע"ט, 9 באפריל 2019"; Jerusalem District Court election-appeal judgment (court record, unranked; c14.co.il copy, https://www.c14.co.il/wp-content/uploads/2021/04/1850b2e378010000090037f69e8dac20_f_original_copy.pdf): "הבחירות לכנסת ה21- שהתקיימו ביום 9.4.2019 ואשר תוצאותיהן פורסמו בילקוט הפרסומים ביום 17.4.2019" |
| National totals | `registered`, `votesCast`, `invalid`, `valid` | 6,339,729; 4,340,253; 30,983; 4,309,270 (turnout 68.46%) | CEC page (1); YP 8208 §1 "סך כל הקולות הכשרים 4,309,270" and §2 "מספר הקולות שנמצאו פסולים: 30,983" (1); data.gov locality sums בזב 6,339,729 / מצביעים 4,340,253 / פסולים 30,983 / כשרים 4,309,270 (1); polling-station file sums identical (1). valid + invalid = cast |
| Derived totals | `ballotBoxes`, `localities`, `envelopeVotes` | 10,765; 1,213; 240,783 | data.gov polling file 10,765 rows (1); locality file 1,214 rows including "מעטפות חיצוניות" with מצביעים 240,783 (1) |
| Votes, 43 lists | `lists[*].votes` | מחל 1,140,370 … זך 216; ץז/זנ/נך 0 | CEC page (1); YP 8208 §1 (1): all 40 listed lists identical |
| Seats, 43 lists | `officialSeats` | מחל 35, פה 35, שס 8, ג 8, ום 6, אמת 6, ל 5, טב 5, מרצ 4, כ 4, דעם 4, others 0 | YP 8208 §3 (1), "סך כל המנדטים 120"; CEC page (1). The Likud 36 → 35 / UTJ 7 → 8 change before certification is reported in Israel Hayom, 15 Apr 2019 (4) |
| Ballot letters, 43 lists | `lists[*].letters` | as dataset | YP 8168 (1), CEC page (1), YP 8208 (1) |
| Hebrew list names | `lists[*].nameHe` (42 of 43; Yachad is finding 5) | as dataset | YP 8168 "כינוי הרשימה" (1), exact. YP 8208 agrees, apart from punctuation. The CEC page shortens some names (e.g. ל "ישראל ביתנו"); the dataset correctly follows the gazette |
| Sponsor parties | `sponsorsHe`, `partiesHe` (40 of 43; findings 6, 7, 16) | as dataset | YP 8168 "מטעם" lines (1); YP 8208 "מטעם מפלגות" column (1) |
| Rule set | `ruleSetId` | il-2014-bader-ofer-3.25 | 3.25% threshold in force since 2014. The election-appeal judgment above applies Bader–Ofer (§§81–82) to k21 |
| Surplus agreements (6) | `agreements[*]` | אמת–מרצ, ג–שס, נ–ל, מחל–טב, דעם–ום, ףץ–ףז | YP 8178 p. 9310 (1, retained `surplus.pdf`): items (1)–(6) exactly; Blue and White had none |
| Rosters (43 lists, 1,580 candidates) | `lists[*].candidates[*]` rank, givenHe, familyHe | All end ranks, as in `k21.ts` COUNTS | YP 8168 (1): matched name by name by script. Every mismatch was a PDF line-wrap artefact (ג #33, אמת #57, טב #37, ז #8, זנ #9), except ן #2 (finding 8). The duplicates printed at אמת #100 and שס #70 are coalesced, as documented |
| Candidate affiliations | `partyHe` and `meta.lists[*].parties[*].candidateRanks` for the 8 joint lists | Likud 117 + Ahi 1 (#27); B&W Yesh Atid 55 / Israel Resilience 51 / Telem 14; UTJ Degel 60 / Agudah 59; H–T Hadash 75 / Ta'al 43; URWP Jewish Home 32 / National Union 14 / Otzma 2 (#7, #39); Ra'am–Balad Balad 58 / Ra'am 57; Zehut 110 + Achiezer 1 (#2); KYA 11 / Peula 6 | YP 8168 affiliation column (1): per-rank comparison, 0 mismatches |
| Joint-list constituents (18) | `meta.lists[*].parties`; `party-lineage.json edges partners-21-*` (8) | as above | YP 8168 "מטעם המפלגות" (1) and YP 8208 "מטעם מפלגות" (1) |
| Elected members (120) | first N candidates of each list | All 120 | YP 8208 §4 (א)–(יא) (1): identical name by name. Knesset OData (1, retained): 120 MKs from 2019-04-30 |
| Bio links, elected (120) | `bios/k21.json candidates[*].knessetPersonId` | 120/120 distinct, all in the opening membership | Retained OData persons (1): surnames match, allowing for spelling variants (בן-דהן, שטרית, פרקש הכהן, גילאון) |
| Recommendation round | `blocSchemes[0]`, `aftermath recommendationRounds[0]`: 15–16 Apr; Likud, Shas, UTJ, URWP, YB, Kulanu → Netanyahu 65; B&W, Labor, Meretz → Gantz 45; ום, דעם none 10 | | ToI 16 Apr 2019 (4, Wayback 20190603034003): "After the parties' two days of consultations … premier has the formal support of 65 MKs"; "Yisrael Beytenu, the Union of Right-Wing Parties and Kulanu recommended him"; "the Labor party giving its backing to Gantz"; "The left-wing Meretz party also recommended Gantz"; "On Monday, the ultra-Orthodox Shas and United Torah Judaism parties also recommended Netanyahu". INN 16 Apr (4): "65 … נתניהו. 45 … בני גנץ. 10 לא המליצו כלל". The cited quote (`recommendations-1`) is present verbatim in the article |
| Mandate to Netanyahu | 2019-04-17, 28 days | | ToI 17 Apr 2019 (4, Wayback 20190606190157): "President Reuven Rivlin on Wednesday officially tasked Prime Minister Benjamin Netanyahu"; "Netanyahu will have 28 days to form a government" |
| Extension | 2019-05-13, 14 days, to 2019-05-29 | | ToI/AFP 13 May 2019 (4, Wayback 20190529030727): "extended by two weeks the deadline"; the cited quote is present verbatim |
| Dissolution | 2019-05-30; 74–45; election 17 Sep 2019 | | Knesset News press release 30.05.19 (1), via search extract (the live page is behind a JavaScript challenge): "בהצבעה שמית תמכו 74 והתנגדו 45 … הבחירות לכנסת ה-22 ייערכו ביום שלישי י"ז אלול תשע"ט ה-17 לספטמבר 2019"; Ynet (4) https://www.ynet.co.il/articles/0,7340,L-5517559,00.html; N12 (4) |
| No government; 34th continued | `governmentNote`, `formation.outcome`, `term.scope`, context `no-government-k21` | | Sources above. ToI 17 Apr lists the expected opposition, and no k21 government was sworn in. (The cited Basic Law: The Government quote was not reopened.) |
| Context events | `sequence-k21`, `no-government-k21`, `eligibility-final-k21-13/14`, `candidate-exclusion-final-k21` (substance) | | CEC history (1); YP 8168 preamble and rosters (1); IDI (3) |
| UI text | `src/app/whatIf.ts:82` (the Joint List ran together in k20, k22 and k23, not k21) | | YP 8168: separate lists ום and דעם in 2019 (1) |
| Party links: platforms | `party-links/k21.json` אמת, ל, מרצ (IDI-hosted PDFs) | | Fetched. Labor's is headed "מצע 2019"; Yisrael Beiteinu's "מצע ישראל ביתנו לכנסת ה-21"; Meretz's is undated, but it refers to the 2017 recommendations law, which fits 2019 (medium confidence is right) |
| Logos (9 entries) | 5 official-site or publication entries: Likud, Yisrael Beiteinu and Hadash pages reference the asset path; asset SHA-1 base32 equals the campaign-window CDX digest. Ta'al page references `logo-amc.png` (post-election capture, disclosed, medium). Hadash–Ta'al from the Zo Haderekh PDF, 20 Mar 2019 | | Recomputed locally from `data/raw/logos/k21/*` against `*-logo-cdx.json`: Likud `UUMFLDUT…`, Beiteinu `QE4JF5VN…`, Hadash `JCIO34UU…`, Labor-site asset `5ET572XW…`, all present in the CDX. The 3 Commons entries (Labor, New Right, UTJ) were not re-researched, per the brief |

### Not checked (time)

- The English candidate names, and the 1,460 non-elected bios (Knesset or Hebrew Wikipedia matches).
- The rendered PDF page for finding 8. Only the text layer was inspected.
- `double-envelope-procedure-k21` (Knesset Research Center PDF): not reopened.
- Family classifications (editorial inferences), apart from the k21 vote figures and the Yachad withdrawal reason.
