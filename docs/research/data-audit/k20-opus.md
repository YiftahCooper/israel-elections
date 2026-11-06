# Data audit k20 (17 March 2015, 20th Knesset): Opus auditor

Auditor: Claude Opus (independent; did not read the Codex report). Base: `d2c1ed0` (includes `53cca36`). Accessed:
2026-11-06 for every source below unless stated. Method: [BRIEF.md](BRIEF.md) with
[source-hierarchy.md](../source-hierarchy.md). No data edited.

## Summary

| Class | Count | Notes |
|---|---:|---|
| OK | 1,760 | Counted per field: election identity and totals (10); 26 lists × letters/name/votes/seats (104); 26 English labels; 4 agreements; rule set; 1,283 roster names; 119 elected names; 3 resignation notes; Shohat→Ilatov note; 145 Knesset person IDs; 15 joint-list constituents; 6 lineage edges; recommendation round (15); formation and government (14); term event; 2 context events; 7 logos; 2 platform links; 2 UI statements |
| WRONG | 6 | 1 withdrawn list flagged as running (high); 1 elected-member name misprint not corrected (medium); 4 stale texts/hashes (low) |
| UNSUPPORTED | 1 | Party-name entries that are really ballot-list names (low) |
| UNVERIFIABLE | 0 | |
| DISPUTED | 0 | |

What's good: the **official results notice (YP 7010, 25 Mar 2015) is retained** (`k20-results-gazette`). Every
list's votes and seats, valid and invalid totals, and 119 of 120 elected names match it exactly. The data.gov
locality and polling-station files sum to the same totals. The rosters match the candidate gazette YP 7000, and the
surplus agreements and resignations match YP 7001.

Main finding: **list יך ("מגינים על ילדינו") was cancelled on 11 March 2015**, when its only candidate withdrew. The
CEC says so on its own page and in its results protocol. The app still has `withdrawn: false`.

No English Wikipedia in any k20 file (`grep -c en.wikipedia` = 0 in `data/meta/k20.json`, `aftermath/k20.json`,
`bios/k20.json`, `logos/k20.json`, `party-links/k20.json`). No reversed Hebrew parentheses in k20 strings: I scanned
`public/data/k20.json`, `meta/k20.json`, `aftermath/k20.json` and `bios/k20.json` for `)…(` patterns and found none.

## Non-OK findings

Severity: **H** high (wrong fact shown to users), **M** medium, **L** low (wording or formatting, or not displayed).

| # | Sev | File | JSON path | Current value | Correct value | Class | Source (rank) | Quote | Accessed |
|---|---|---|---|---|---|---|---|---|---|
| 1 | H | `data/raw/k20` build → `public/data/k20.json` | `lists[25].withdrawn` (`20-יך`, מגינים על ילדינו) | `false` | `true`: the list was cancelled on 11 Mar 2015 (2015-03-11) after its sole candidate, Yehezkel Shtelzer, resigned. Optionally add a list note citing the CEC. | WRONG | (a) CEC Knesset-20 candidate-lists page https://bechirot20.gov.il/election/Candidates/Pages/default.aspx (1); (b) CEC results-determination protocol, 25 Mar 2015 https://www.gov.il/BlobFolder/dynamiccollectorresultitem/memorandum-knesset20/he/archive_knesset20_memorandum20.pdf (1, OCR text); (c) Arutz 7 11 Mar 2015 https://www.inn.co.il/News/Flash.aspx/480065 (4); (d) Ynet https://www.ynet.co.il/articles/0,7340,L-4638267,00.html (4) | (a) "ביום ‏כ' באדר התשע"ה (11 במרס 2015) התפטר יחזקאל שטצלר מרשימת "מגינים על ילדינו", ומשכך רשימת המועמדים "מגינים על ילדינו" שהאותיות שסימנו אותה הן 'יך' - בטלה." (b) "הוגשו ואושרו 26 רשימות מועמדים … לאחר הפרסום ברשומות בוטלה רשימת "[יך] - מגינים על ילדינו" בשל התפטרות כל מועמדיה." (c) "יחזקאל שטלצר, החליט היום להסיר את מועמדותו ולתמוך במפלגת הבית היהודי" (d) "מפלגת מגינים על ילדינו, שפרשה לפני הבחירות, קיבלה בכל זאת 58 קולות" (these ballots were counted as invalid; the list shows 0 in YP 7010 and data.gov) | 2026-11-06 |
| 2 | M | `public/data/k20.json` (from YP 7000 transcription); fix in `data/meta/candidate-notes.json` | `lists[2].candidates[11]` (`20-ודעם#12`) `nameHe`/`familyHe` | `סעדיה אוסאמה` / `סעדיה` | Shown name **`סעדי אוסאמה`**: add `displayNameHe` per decision 0088. The candidate gazette prints "סעדיה", but the results notice and the Knesset both use "סעדי". | WRONG | YP 7010 p. 4372 §4(ג) (1, retained `data/raw/k20/results.pdf`); Knesset OData KNS_Person 30070 (1, retained `knesset-odata-members.json`); YP 7000 p. 3940 (1) for the misprint | YP 7010: "11 גטאס באסל 12 סעדי אוסאמה"; OData: `{"PersonID": 30070, "LastName": "סעדי", "FirstName": "אוסאמה"}`; YP 7000: "12 סעדיה אוסאמה" | 2026-11-06 |
| 3 | L | `data/meta/aftermath/k20.json` | `gaps[5]` | "No included term event meets the two-chronology rule." | Remove (stale). `term.events[0]` (US embassy in Jerusalem, 2018-05-14) cites both declared chronologies, `crs-us-actions-chronology` and `cfr-conflict-timeline`, plus two official sources. | WRONG | Internal: `term.chronologies`, `term.events[0].cites` | n/a | 2026-11-06 |
| 4 | L | `data/meta/election-context.json` | `events[id=opening-members-k20].textEn/textHe` | "…The records do not establish the exact replacement date." | The replacement is datable. Shohat announced on **24 Mar 2015** that he was giving up his seat to stay mayor of Safed, and Ilatov (#7) took it. Suggested wording: "Shohat announced on 24 March 2015 that he would remain mayor of Safed; Robert Ilatov (#7) took the seat." Cite one press source in `relatedSources`. | WRONG | Globes 24 Mar 2015 https://www.globes.co.il/news/article.aspx?did=1001021770 (4); N12 24 Mar 2015 https://www.mako.co.il/news-military/politics-q1_2015/Article-dfecb8fbdda4c41004.htm (4); Arutz 7 (English) https://www.israelnationalnews.com/news/193097 (4) | Globes: "אילן שוחט, ראש עיריית צפת ומספר 4 ברשימת ישראל ביתנו, הודיע היום על התפטרותו מהכנסת … ובמקומו ייכנס למשכן ח"כ רוברט אילטוב"; N12: "החליט להישאר בתפקידו הנוכחי כראש עיריית צפת ולפנות את מקומו לח"כ רוברט אילטוב, מקום 7 ברשימה" | 2026-11-06 |
| 5 | L | `data/meta/families/*.json` (all 9) | `elections[19].datasetStatus.noteEn/noteHe` (k20) | "…No default blocs assigned." / "…לא מוצגת השתייכות לגושים." | Stale copy. `public/data/k20.json` now has `defaultBlocScheme: "first-government"`, and its `status.noteEn/He` no longer contains this sentence. Refresh with the family hash/status step. (`datasetSha256` 50f850… does match the current dataset.) | WRONG | Internal: `public/data/k20.json` `.status`, `.defaultBlocScheme` | n/a | 2026-11-06 |
| 6 | L | `data/meta/party-lineage.json` | `sources.k20.sha256` | `833d0c0fed196204102bea653ca679b791d376ad2cf545bf031317c4533bceac` | `50f85087b7325dcc109143ad820b91dd6383e7172ad9107f5dd048fad6e3e839` (`sha256sum public/data/k20.json` at `d2c1ed0`; the families already carry it) | WRONG | Internal | n/a | 2026-11-06 |
| 7 | L | `data/meta/parties.json` | `parties[id=likud|shas|yisrael-beiteinu|yesh-atid|meretz|uvizchutan].names[date=2015-03-17].nameHe` | List ballot names, e.g. likud = "הליכוד בהנהגת בנימין נתניהו לראשות הממשלה", shas = "התאחדות הספרדים שומרי תורה תנועתו של מרן הרב עובדיה יוסף זצ"ל", meretz = "השמאל של ישראל" (with `nameEn` "Meretz"), uvizchutan = "ובזכותן - חרדיות עושות שינוי" | The registered submitting parties in YP 7000 are "הליכוד, תנועה לאומית ליברלית", "ש"ס - התאחדות הספרדים העולמית שומרי תורה", "ישראל ביתנו", "יש עתיד - בראשות יאיר לפיד", "מרצ", "אחריות - לב אחד ורוח חדשה". Either label these entries as list names or record the party names. (Kulanu's party and list names are identical, so that entry is fine.) | UNSUPPORTED | YP 7000 "מטעם המפלגה" lines (1), mirrored in `public/data/k20.json` `lists[*].sponsorsHe` | e.g. Meretz list `sponsorsHe`: "מרצ"; נז: "אחריות - לב אחד ורוח חדשה" | 2026-11-06 |

### Finding 1 in detail

The list was approved and gazetted in YP 7000 (4 Mar 2015) with one candidate (`שטלצר יחזקאל`). It then withdrew,
so YP 7010 prints the list with no vote count and no seats. The data.gov `יך` column sums to 0. The build turns that
into `votes: 0, withdrawn: false`, and the list appears as a running list with zero votes. The schema already
supports `withdrawn: true` (as in k23 Tzomet). The cancellation date is 2015-03-11; the CEC page states it. Note the
spelling: the gazette prints "שטלצר", while the CEC page spells it "שטצלר". Keep the gazette spelling. Ynet's
election-morning count gave the list 58 ballots, which were not counted as valid; this may be worth a note.

### Finding 2 in detail

`docs/research/elected-names-odata-audit.md` (k20 row: 118 matched, 2 differences) missed this name. The likely
reason is that "סעדיה" contains "סעדי" as a prefix. `candidate-notes.json` defines `displayNameHe` for exactly this
case: "only where the candidate notice misprints it and the results notice prints the correct name". Both conditions
hold. The same check found no other differences: the other 119 elected names in YP 7010 §4(א)–(י) are identical to
the app's first-N candidates, character for character.

## Editorial-stance and source-quality flags (not counted above)

- **Registered voters:** the `k20-results-gazette` note says registered voters are not published in YP 7010, so
  5,881,696 is derived from data.gov aggregates. A rank-1 document states it directly: the CEC results-determination
  protocol of 25 Mar 2015 (memorandum20 PDF above), "1. מספר בעלי הזכות לבחור … 5,881,696", with 4,254,738 votes cast,
  43,854 invalid and 4,210,884 valid. Consider registering it in `SOURCES.json`.
- **Hebrew Wikipedia as the main basis** in `data/meta/k20.json` for these constituent rank assignments: Joint List
  per-party ranks (Hadash/Ra'am/Balad/Ta'al), Jewish Home/Tkuma, Hatnua's slots 2/8/16/21/24/25, and Arab List #1 =
  Mada. Each is `confidence: medium`, and several are backed by Knesset OData faction rows from 2019. All assignments
  agree with what I know of the 2015 lists, and the realistic-slot split 5/4/3/2 checks arithmetically. Better
  sources could be Knesset member pages for the 13 elected Joint List MKs and the later replacements (Azbarga,
  al-Huroumi, Hijazi, Atauna, Younis, Abu Rahmoun), and contemporaneous press on the Zionist Union seat-sharing
  agreement.
- `data/meta/party-lineage.json` `edges[id=partners-20-אמת]` names `green-movement` as an electoral partner, but YP
  7000 lists only "העבודה הישראלית; התנועה" as submitters. `meta/k20.json` already notes that the Green Movement
  held a Hatnua-allotted slot (#25) and was not a sponsor. This is defensible as a description of who was on the
  list, but it is not an official partner.
- `data/meta/k20.json` `blocSchemes[1].notes[0]` and `aftermath recommendationRounds[0].notes[0]` contain an internal
  change log ("Updated on 5 November 2026: …"). The notes are not built into `public/data/k20.json`, so this is not
  shown to readers; tidy it if they are ever displayed.
- `aftermath/k20.json` `gaps[0]` ("Certification and inauguration dates not independently sourced") can now be
  closed. Certification was 25 Mar 2015 (YP 7010 signature date and the CEC protocol), and the Knesset opened on
  31 Mar 2015 (OData StartDate for all opening MKs).
- Context events for Zoabi and Marzel: IDI (3) is fine. Rank-1 alternatives are the CEC decisions and the HCJ
  judgment (EA 1095/15), if wanted.
- No partisan wording found. The formation and term text is factual and attributed.

## Checked and found OK

| Area | Claims | Value(s) | Source (rank) and quote/evidence |
|---|---|---|---|
| Election date, Knesset number | `electionDate`, `knesset`, `nameHe/En`, `status.asOf` | 2015-03-17; 20; asOf 2015-03-25 | YP 7010 (1): "תוצאות הבחירות לכנסת העשרים … ה' בניסן התשע"ה (25 במרס 2015)"; CEC protocol (1): "הבחירות לכנסת העשרים שקוימו ביום כ"ו באדר התשע"ה (17 במרס 2015)" |
| National totals | `registered`, `votesCast`, `invalid`, `valid` | 5,881,696; 4,254,738; 43,854; 4,210,884 | YP 7010 §1–2 (1): "סך כל הקולות הכשרים 4,210,884", "מספר הקולות שנמצאו פסולים: 43,854"; CEC protocol (1) gives all four; data.gov locality sums (1) `בזב` 5,881,696, `מצביעים` 4,254,738, `פסולים` 43,854, `כשרים` 4,210,884; polling-station file sums `בזב` 5,881,696, `פסולים` 43,854 |
| Derived totals | `ballotBoxes`, `localities`, `envelopeVotes` | 10,414; 1,195; 234,599 | data.gov polling file 10,414 rows (1); locality file 1,196 rows including the envelope row (code 0) with מצביעים 234,599 (1) |
| Votes, 26 lists | `lists[*].votes` | from מחל 985,408 to יז 223; יך 0 | YP 7010 §1 (1): all 25 numeric values identical; יך printed blank; data.gov per-list sums identical (1) |
| Seats, 26 lists | `officialSeats` | מחל 30, אמת 24, ודעם 13, פה 11, כ 10, טב 8, שס 7, ל 6, ג 6, מרצ 5, others 0; total 120 | YP 7010 §3 (1) |
| Letters and Hebrew names, 26 | `lists[*].letters`, `nameHe` | as dataset | YP 7010 §1 (1) and YP 7000 "כינוי הרשימה" (1): exact for all 26; CEC page (1) also lists the 25 running lists |
| English labels, 26 | `shortEn`, `englishName` | 10 seated + Yachad, Ale Yarok, Arab List, Greens etc. conventional; others marked unofficial transliterations | Conventional usage in ToI/JTA/Haaretz English (4); transliterations correctly disclosed |
| Rule set and threshold | `ruleSetId` il-2014-bader-ofer-3.25; glossary "3.25% since 2015" | | 3.25% applied from 2015; Yachad 125,158 / 4,210,884 = 2.97% is below it, consistent with 0 seats in YP 7010 |
| Surplus agreements (4) | `agreements[*]` | אמת–מרצ, ג–שס, טב–מחל, כ–ל | YP 7001 p. 3954 (1), items (1)–(4); CEC protocol §ב (1) |
| Rosters (1,284 names) | `lists[*].candidates[*].nameHe`, order | 1,283 identical | YP 7000 pp. 3938–3952 (1), compared by rank. Two-line names (e.g. "האובנשטוק ווייס צבי", "מלול יוסף צבי ארז") are correctly joined. The יץ rank "01" is correctly read as 10. The one exception is finding 2. |
| Resignation notes (3) | `20-מחל` notesHe (Natalia Yelinson 26.2.2015); `20-יץ` (Sa'id Badran, Abu Abed Raaf 2.3.2015) | | YP 7001 p. 3954 (1): "המועמדת נטליה ילינסון … התפטרה ביום ז' באדר התשע"ה (26 בפברואר 2015)"; "המועמד סעיד בדראן … התפטר ביום י"א באדר התשע"ה (2 במרס 2015)"; same for Abu Abed |
| Elected members (120) | first N candidates per list | 119 identical | YP 7010 §4 (1). The exception is finding 2. |
| Shohat → Ilatov | `candidate-notes` `20-ל#4` | Declared elected; replaced before the first sitting by #7 Ilatov | YP 7010 (1) prints "שוחט אילן"; Knesset OData (1): Ilatov (4412) in opening membership, no Shohat row; Globes/N12/INN 24 Mar 2015 (4) |
| Knesset person IDs (bios) | `bios/k20.json candidates[*].knessetPersonId` | 120 elected + 25 non-elected with IDs | Elected: retained OData persons (1). The 25 IDs outside the retained file were resolved live via `KNS_Person(id)` (1), and all names match, e.g. 30773 שטרן שבח, 455 פינס-פז אופיר, 30719 כסיף עופר, 4419 מיכאלי אברהם |
| Joint-list constituents (15) | `meta.lists[*].parties[*]`, `joint-facts.json`, lineage `partners-20-*` | Zionist Union: Labor, Hatnua (+ Green Movement slot); Joint List: Hadash, Ra'am, Balad, Ta'al; Jewish Home + Tkuma; UTJ: Agudat Yisrael + Degel HaTorah; Yachad + Otzma (Jewish National Front); Arab List: Mada + National Arab Party | YP 7000 "מטעם המפלגות" (1) for every list, e.g. "המפלגה הקומוניסטית הישראלית; רשימת האיחוד הערבי; אלתג'מוע אלווטני אלדמוקרטי; התנועה הערבית להתחדשות"; "יחד - בראשות אלי ישי; חזית יהודית לאומית". Elected splits (Labor 19/Hatnua 5; Hadash 5/Ra'am 3/Balad 3/Ta'al 2; JH 6/Tkuma 2; Agudah 4/Degel 2) are consistent with the rank assignments. The `mada` ↔ `arab-democratic-party` alias is documented in `families/README.md`. |
| Recommendation round | `blocSchemes[pm-recommendations]`, `aftermath recommendationRounds[0]`: 22–23 Mar; Likud, Kulanu, JH, Shas, YB, UTJ → Netanyahu 67; Zionist Union + Meretz → Herzog 29; Joint List + Yesh Atid → none 24 | | Maariv 23 Mar 2015 (4) https://www.maariv.co.il/news/politics/article-469241: "בתום הסבב המליצו 67 חברי כנסת להטיל על נתניהו … ו-29 על הרצוג"; Haaretz 23 Mar 2015 (4): "מספר הממליצים של יו"ר המחנה הציוני ל-29, כש-24 חברי כנסת נמנעו מהמלצה"; Ynet 23 Mar 2015 (4) https://www.ynet.co.il/articles/0,7340,L-4639895,00.html: "סבב ההתייעצויות … החל כבר אתמול … הרשימה המשותפת … החליטה שלא להמליץ על איש"; JTA 23 Mar: "On Sunday, Netanyahu had received 51 … Herzog 24". Seat arithmetic 30+10+8+7+6+6 = 67 |
| Mandate | 2015-03-25, 28 days | | Ynet 23 Mar (4): "ביום רביעי צפוי ריבלין להטיל על ראש הממשלה נתניהו … את המשימה"; JTA: "has 28 days"; cited ToI |
| Extension | 2015-04-20, 14 days | | News1 20 Apr 2015 (4) quoting the President: "אני נותן לך בזאת ארכה של 14 יום"; Ynet, Reuters same day |
| Notification of success | 2015-05-06 | | Globes 20 Apr (4): "יאלץ נתניהו להציג את ממשלתו החדשה עד ל-6 במאי"; cited ToI letter |
| Investiture | 2015-05-14, 61–59; conflict note on Knesset English "69" | | Haaretz English 14 May 2015 (4): "voted on Thursday in a vote of 61-59"; JTA, WSJ, JPost same; Knesset OData (1): ministers' StartDate 2015-05-14 |
| Government | number 34, Netanyahu IV, coalition Likud/Kulanu/JH/Shas/UTJ = 61, opposition 59; UTJ without office on day one | | Ynet 23 Mar (4): "להקים את הממשלה ה-34"; OData GovernmentNum 34 (1): 31 positions from 2015-05-14 with no UTJ holder; deputies including Litzman's deputy health post start 2015-05-19 |
| Government end | 2020-05-17 | | Replacement by the 35th government; consistent with the k23 record |
| Dissolution | 2018-12-26, 102–2, election 2019-04-09 | | ToI 26 Dec 2018 (4): "MKs voted 102-2 in favor of the final reading … the vote for the 21st Knesset will be held on April 9, 2019"; CNN quoting the Knesset website |
| Term event | US embassy in Jerusalem, 2018-05-14 | | Cited White House fact sheet and Knesset News (1); CRS and CFR chronologies |
| Context events (2) | Zoabi, Marzel: CEC exclusion reversed by the Supreme Court, 2015 | | IDI table (3) https://www.idi.org.il/articles/65951: "2015 ברוך מרזל (יח"ד) הפסילה בוטלה 2015 חנין זועבי (בל"ד) הפסילה בוטלה" |
| Logos (7 entries) | 5 official-site entries (Likud, Zionist Union, Jewish Home list/party, Hadash, Ta'al): the page references the asset path, and the asset's SHA-1 base32 equals the CDX digest | | Recomputed from `data/raw/logos/k20/*`: Likud 4Q3IR5ER…, Hadash JCIO34UU…, JH AAWVI5K7…, ZU BNCAOJ2N…, Ta'al DEXNGMTF… all match their `*-logo-cdx.json`; Ta'al `styles.css` references `header.jpg`. Commons (Kulanu, Joint List): the API metadata supports the claims. Kulanu: "original upload date 2015-01-08", source "אתר המפלגה". Joint List: "date=2015-01-22", "source=القائمة المشتركة". |
| Party links | Yisrael Beiteinu 2015 and Meretz 2015 platforms (IDI-hosted); 18 CEC links | | Both IDI PDFs return 200 application/pdf; the CEC links point to the YP 7010 PDF and are titled "הודעת התוצאות", which is correct for this election |
| UI text | `src/app/whatIf.ts:82` (Joint List in k20); `glossary-data.ts:212` (3.25% since 2015) | | YP 7000/7010 (1) |
