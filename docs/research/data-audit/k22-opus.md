# Data audit k22 (17 September 2019, 22nd Knesset): Opus auditor

Auditor: Claude Opus (independent; did not read the Codex report). Base: `53cca36`. Accessed: 2026-11-06 for every
source below unless stated. Method: [BRIEF.md](BRIEF.md) with [source-hierarchy.md](../source-hierarchy.md). No data
edited.

## Summary

| Class | Count | Notes |
|---|---:|---|
| OK | 458 | Counted per field. Results (totals, 32 lists × letters/name/votes/seats), 5 agreements, 120 elected names, 120 elected-member Knesset IDs, 19 joint-list constituents, recommendation round, formation timeline, context events, logos |
| WRONG | 9 | 3 withdrawn lists flagged as running; 1 aftermath note contradicted by sources; 1 stale gap; 3 Hebrew text-extraction artefacts; 1 stale status copy |
| UNSUPPORTED | 2 | Party names that are really list names (low); a mislabelled link title (low) |
| UNVERIFIABLE | 1 | Cited Jerusalem Post quote: article body not retrievable (substance confirmed elsewhere) |
| DISPUTED | 1 | Invalid votes: CEC 28,362 vs. official results notice YP 8454 "126,704" (rank 1 vs rank 1; the gazette figure is demonstrably the below-threshold vote total, misprinted on the invalid-votes line) |

Main finding: the **official results notice in Reshumot (YP 8454, 25 Sep 2019)** was not among the retained sources.
It confirms every list's votes and seats and all 120 elected names, and it omits the three lists that withdrew. It
also prints a wrong invalid-vote figure.

No English Wikipedia anywhere in the k22 files (`grep en.wikipedia` = 0 in `data/meta/k22.json`, `aftermath/k22.json`,
`bios/k22.json`, `logos/k22.json`, `party-links/k22.json`).

## Non-OK findings

Severity: **H** high (wrong fact shown to users), **M** medium, **L** low (wording or formatting, or not displayed).

| # | Sev | File | JSON path | Current value | Correct value | Class | Source (rank) | Quote | Accessed |
|---|---|---|---|---|---|---|---|---|---|
| 1 | H | `data/raw/k22/nationalresults.html` → `public/data/k22.json` | `totals.invalid` | 28,362 | Keep **28,362**; add a note that YP 8454 §2 prints 126,704 in error | DISPUTED | (a) CEC national results https://votes22.bechirot.gov.il/nationalresults (1); (b) Reshumot YP 8454 p. 15079 https://free-justice.openapi.gov.il/free/moj/portal/rest/searchpredefinedapi/v1/SearchPredefinedApi/Documents/OZqqMinV~LFxfTj7LC7UkojANzy747BQrZqHtwBxR30= (1); (c) data.gov locality and polling files (1) | (a) "סה"כ הקולות הפסולים שהוזנו - סופי … 28,362"; (b) "2. מספר הקולות שנמצאו פסולים: 126,704." (verified on the rendered page, not only the text layer) | 2026-11-06 |
| 2 | H | `data/raw/k22` build → `public/data/k22.json` | `lists[29].withdrawn` (22-זן, Zehut) | `false` | `true`: Zehut withdrew before the election | WRONG | YP 8454 §1 and §3 (1): Zehut is absent from the official results notice, which lists 29 lists; N12 (4) https://www.mako.co.il/news-israel-elections/elections_2019-q3_2019/Article-9293fde87fdec61027.htm | N12, 1 Sep 2019: "עכשיו זה רשמי: מתפקדי מפלגת זהות אישרו הערב (ראשון) את פרישת המפלגה מהמרוץ לבחירות לכנסת ה-22" | 2026-11-06 |
| 3 | H | as above | `lists[31].withdrawn` (22-כ, Noam) | `false` | `true`: Noam withdrew on 15 Sep 2019 | WRONG | YP 8454 (1): absent from the notice; Times of Israel (4) https://www.timesofisrael.com/fringe-far-right-party-noam-quits-knesset-race-2-days-before-elections/; Walla (4) https://elections.walla.co.il/item/3312758 | ToI: "A far-right religious party on Sunday said it was withdrawing its candidacy in Tuesday's Knesset elections" | 2026-11-06 |
| 4 | M | as above | `lists[30].withdrawn` (22-נץ, Kol Yisrael Ahim LeShivyon Hevrati) | `false` | `true` (withdrew; date not found) | WRONG | YP 8454 (1): absent from both the vote table and the seat table of the official results notice; CEC page shows 0 votes | YP 8454 lists only 29 lists: letters אמת … שס, without זן/נץ/כ. Press confirmation of this list's withdrawal not found. | 2026-11-06 |
| 5 | M | `data/meta/aftermath/k22.json` | `recommendationRounds[0].entries[8].noteEn` (ודעם) | "…Odeh disputed that the original thirteen-member recommendation had changed." | Drop the Odeh clause. The sources say: Ahmad Tibi, as faction chairman, wrote at the Balad MKs' request that the recommendation was from 10 MKs. Odeh later said Blue and White had *asked* for 10 rather than 13. | WRONG | Times of Israel 23 Sep 2019 (4) https://www.timesofisrael.com/joint-list-tells-president-only-10-of-its-13-members-are-backing-gantz-for-pm/; Ynetnews/Reuters 26 Sep 2019 (4) https://www.ynetnews.com/articles/0,7340,L-5597465,00.html | ToI: "'…the three Balad Knesset members have asked me as the faction chairman to declare that the Joint List's recommendation of MK Benny Gantz does not include them, and therefore the recommendation is in the name of ten MKs and not 13,' MK Ahmad Tibi of Ta'al wrote". Ynet: "'Blue and White asked us to make a recommendation of 10 MKs not 13, so that Netanyahu would be tasked with forming a government first,' Joint List Chairman Ayman Odeh said" | 2026-11-06 |
| 6 | L | `data/meta/aftermath/k22.json` | `gaps[5]` | "No term event satisfies the two-chronology rule in this pass." | Remove (stale). `term.events` holds two events that meet the rule: the indictment announcement and the US peace plan. | WRONG | Internal: `term.events[0].cites` (official judgment + Brookings + CNN), `term.events[1].cites` (White House + SIPRI + CFR) | n/a | 2026-11-06 |
| 7 | M | `data/raw/k22/candidates.pdf` transcription → `public/data/k22.json` | `lists[0].candidates[23]` nameHe/givenHe; `lists[3].candidates[110]`; `lists[7].candidates[73]` familyHe; `lists[8].candidates[22]` familyHe | `תמנו פנינה )פנחש(`, `שגיב אייל )יצחק(`, `ביטי )שלוח( אורלי`, `כהן )כהנא( ניצן` | `(פנחש)`, `(יצחק)`, `(שלוח)`, `(כהנא)`: logical parentheses reversed by PDF extraction, so they render backwards in RTL | WRONG | YP 8454 §4(ח) (1) for #24; YP 8420 (1) | YP 8454: "24 תמנו פנינה (פנחש)" | 2026-11-06 |
| 8 | L | same transcription | `lists[0,1,2,5,6,7,8,24].sponsorsHe` (פה, מחל, ודעם, ג, טב, אמת, מרצ, ינ) | e.g. `יש עתיד - בראשות יאיר לפיד )להלן - יש עתיד(` | `(להלן - יש עתיד)`, and the same for all reversed pairs. Shown in Hebrew ListDetail "הוגשה מטעם:" (`src/app/components/ListDetail.tsx:324`) | WRONG | YP 8420 (1) | "מטעם המפלגות: יש עתיד - בראשות יאיר לפיד (להלן - יש עתיד); חוסן ישראל; …" | 2026-11-06 |
| 9 | L | same transcription | `lists[9,10,13,14].notesHe`, `lists[30].notesHe` | `…(19 באוגוסט 2019;)` | `…(19 באוגוסט 2019);` (punctuation outside the bracket). Dates and names are correct. | WRONG | YP 8420 p. 14492 (1) | "התפטר מרשימת המועמדים ביום י"ח באב התשע"ט (19 באוגוסט 2019);" | 2026-11-06 |
| 10 | L | `data/meta/families/*.json` (all 9) | `elections[21].datasetStatus.noteEn/noteHe` | "No default blocs assigned." / "ללא שיוך לגושים." | Stale copy: `public/data/k22.json` now has `defaultBlocScheme: "pm-recommendations"` and its status note no longer says this. `datasetSha256` (cce32e…) also differs from `party-lineage.json` (06f121…). Refresh with the family hash step. | WRONG | Internal | n/a | 2026-11-06 |
| 11 | L | `data/meta/parties.json` | `parties[id=daam|tzomet|otzma-yehudit|yisrael-beiteinu|shas].names[date=2019-09-17].nameHe` | List ballot names, e.g. daam = "דעם - כלכלה ירוקה מדינה אחת", otzma-yehudit = "עוצמה יהודית בראשות איתמר בן גביר" | Registered submitting parties are "ארגון הפעולה הדמוקרטי - דע"ם", "צומת - התנועה לציונות מתחדשת", "חזית יהודית לאומית", "ישראל ביתנו", "ש"ס - התאחדות הספרדים העולמית שומרי תורה". Either label these entries as list names or record the party names. | UNSUPPORTED | YP 8420 "מטעם המפלגה" lines (1) | "מטעם המפלגה: חזית יהודית לאומית" (Otzma); "מטעם המפלגה: ארגון הפעולה הדמוקרטי - דע"ם" | 2026-11-06 |
| 12 | L | `data/meta/party-links/k22.json` | `lists["22-שס"][0].titleHe`, `lists["22-אמת"][0].titleHe` | "… — הודעת התוצאות לכנסת 22" (url = CEC results page) | The URL is the CEC results web page, not the Reshumot results notice ("הודעה בדבר תוצאות הבחירות", YP 8454). Retitle, or point to YP 8454. | UNSUPPORTED | CEC page (1); YP 8454 (1) | n/a | 2026-11-06 |
| 13 | L | `data/meta/k22.json` | `blocSchemes[0].sources[0].quote`, also `aftermath/k22.json` `recommendationRounds[0].cites[0]` | JPost quote ("President Reuven Rivlin subtracted Balad … 55 recommendations to Gantz's 54 …") | Substance confirmed by ToI, Israel Hayom and the President's own statement (see OK table). The JPost article body would not load (headline and date only), so the verbatim quote is unconfirmed. Consider adding the rank-4 Ynet text of the President's statement as the primary citation. | UNVERIFIABLE | https://www.jpost.com/Israel-Elections/Netanyahu-to-have-more-support-than-Gantz-after-Balad-revocation-602566 (4) | Fetched page: title "Balad votes won't count for Gantz, putting Netanyahu in lead", 24 Sep 2019; no body | 2026-11-06 |

### Finding 1 in detail (for the fixer and the owner)

The gazette figure is not a competing count: **126,704 = 4,436,806 − 4,310,102**, which is exactly the valid votes
cast for the 23 lists below the threshold. Check: the nine seat-winning lists total 1,151,214 + 1,113,617 + 470,211 +
330,199 + 310,154 + 268,775 + 260,655 + 212,782 + 192,495 = 4,310,102. The CEC's 28,362 agrees with three
independent official files: the national page, the data.gov locality sum (`פסולים` = 28,362) and the data.gov
polling-station sum (10,901 rows, 28,362). It also satisfies valid + invalid = cast (4,436,806 + 28,362 =
4,465,168). With 126,704, cast would be 4,563,510, contradicting the notice's own source data. I found no correction
notice (searched for "תיקון טעות" against YP 8454).

**Recommendation:** keep 28,362, record the YP 8454 misprint in a note, and register YP 8454 in `SOURCES.json` as
the statutory results notice. Owner question only if the hierarchy rule "the official notice beats a later summary"
is applied literally; the arithmetic makes the misprint unambiguous.

### Findings 2–4 in detail

`withdrawn: true` is supported by the schema: k23 Tzomet uses it, according to DATA.md. The three lists stay on the
CEC page with 0 votes, which is consistent with withdrawal. Ballots for withdrawn lists were counted as invalid; Israel
Hayom reported "28 to the former and 1098 to the latter" for Zehut and Noam
(https://www.israelhayom.co.il/article/693593, rank 4). Noam is also partner in agreement `22-agr-5` (with Otzma
Yehudit); the agreement notice YP 8430 of 8 Sep predates Noam's 15 Sep withdrawal, so the agreement entry itself is
correct. `data/meta/families/national-religious.json` and `radical-right.json` list Noam under `reviewCandidates`
with 0 votes, which is consistent.

## Editorial-stance and source-quality flags (not counted above)

- `data/meta/aftermath/k22.json` `term.candidatesPending[0]` (Gaza, Nov 2019; not displayed): if promoted, use the
  Israeli operation name **"Operation Black Belt" (מבצע חגורה שחורה)** and describe Baha Abu al-Ata as a Palestinian
  Islamic Jihad terrorist commander. The SIPRI wording quoted there is neutral-international.
- `data/meta/k22.json` `colours[*]`: every colour is sourced only to Hebrew Wikipedia infobox colours. They are
  labelled as display colours, not official, which matches DATA.md. There is no better source to hand, so this is
  noted rather than raised as a finding.
- `data/meta/election-context.json` `events[id=candidate-exclusion-final-k22]` cites IDI as "secondary". A rank-1
  source is available: YP 8420's preamble cites "ע"ב 5487/19 גיל סגל נ' איתמר בן גביר (25.08.2019)", and Marzel and
  Gopstein are absent from the gazetted Otzma roster. Consider citing it alongside IDI.
- Mid-term replacement not represented. This is expected, since `candidate-notes.json` covers only changes before the
  first sitting. Knesset OData (retained `data/raw/k22/knesset-odata-members.json`): Gadi Yevarkan (פה #33) served
  2019-10-03 → 2020-01-19, and Yorai Lahav-Hertzanu served 2020-01-19 → 2020-03-16. Mention it if the app ever shows
  term membership.
- No partisan wording found in k22 text fields. Formation events are factual and attributed.

## Checked and found OK

| Area | Claims | Value(s) | Source (rank) and quote/evidence |
|---|---|---|---|
| Election date, Knesset number | `electionDate`, `knesset`, `nameHe/En` | 2019-09-17; 22 | CEC page (1): "בחירות לכנסת ה-22 י"ז באלול התשע"ט, 17 בספטמבר 2019"; Meltzer decision 9/22 (1, via Ynet PDF https://pic-upload.ynet.co.il/news/25-09-2019_2.pdf): "התקיימו … בתאריך: 17.09.2019" |
| National totals | `registered`, `votesCast`, `valid` | 6,394,030; 4,465,168; 4,436,806 (turnout 69.83%) | CEC page fetched fresh, byte-identical to the retained copy (SHA-256 ef809c…1211) (1); `valid` also YP 8454 §1 "סך כל הקולות הכשרים 4,436,806" (1) |
| Electorate disclosure | `status.noteEn/He` | National 6,394,030 vs locality/polling 6,391,218 (Δ 2,812) | data.gov locality file sum `בזב` = 6,391,218 (1); CEC page 6,394,030 (1) |
| Derived totals | `ballotBoxes`, `localities`, `envelopeVotes` | 10,901; 1,213; 282,442 | data.gov polling file 10,901 rows (1); locality file 1,214 rows including "מעטפות חיצוניות" with מצביעים 282,442 (1) |
| Votes, 32 lists | `lists[*].votes` | All 32, from פה 1,151,214 to י 434; זן/נץ/כ 0 | CEC page (1) and YP 8454 §1 (1): all 29 non-withdrawn lists identical |
| Seats, 32 lists | `officialSeats` | פה 33, מחל 32, ודעם 13, שס 9, ל 8, ג 7, טב 7, אמת 6, מרצ 5, others 0 | YP 8454 §3 (1); CEC page (1); Globes 25 Sep 2019 on the late Likud +1 / UTJ −1 change (4) |
| Ballot letters, 32 lists | `lists[*].letters` | as dataset | YP 8420 (1), CEC page (1) |
| Hebrew list names, 32 | `lists[*].nameHe` | as dataset | YP 8420 "כינוי הרשימה" (1): exact for all 32. The CEC page and YP 8454 vary slightly in spelling (e.g. "הורוביץ" vs "הורביץ", "אילת" vs "איילת", "שומרי התורה"); the dataset follows the approved-list gazette, which is the right base. |
| English names | `shortEn`, `meta.lists[*].englishName` | 9 conventional names; 20 transliterations labelled unofficial | Conventional usage in ToI/Ynetnews (4); transliterations correctly disclosed as "not a verified official English name" |
| Rule set | `ruleSetId` | il-2014-bader-ofer-3.25 | 3.25% threshold in force since 2014. N12/News1 near-final results quote "3.25% (אחוז החסימה)" (4) |
| Surplus agreements (5) | `agreements[*]` | מחל–טב, מרצ–אמת, שס–ג, פה–ל, כ–כף | YP 8430 p. 14634 (1, olaw mirror): items (1)–(5) exactly |
| Roster size | 1,205 candidates; Likud 119 with #119 unaffiliated | | YP 8420 (1): Likud ends "119 משה נסים בנימין" with no affiliation column |
| Resignation notes (6) | `lists[*].notesHe` (names, lists, dates) | Azulai Amram, Malma, Sliman, Ben Yakar, Schwartz (19 Aug); Korinaldi (27 Aug) | YP 8420 p. 14492 (1), apart from punctuation (finding 9) |
| Elected members (120) | first N candidates of each list | All 120 names | YP 8454 §4 (א)–(ט) (1): identical name by name; Knesset OData KNS_PersonToPosition KnessetNum 22 (1): 120 MKs from 2019-10-03 |
| Bio links, elected (120) | `bios/k22.json candidates[*].knessetPersonId` | 120/120 map to the right person | Retained OData persons (1): surname matches, allowing for spelling variants (חיימוביץ', סמוטריץ', גילאון, שטרית קטי) |
| Joint-list constituents (19) | `meta.lists[*].parties[*]`; `party-lineage.json partners-22-*`; `parties.json partyAppearances` | B&W: Israel Resilience, Yesh Atid, Telem; Likud: Likud, Kulanu; Joint List: Hadash, Ra'am, Ta'al, Balad; UTJ: Agudat Yisrael, Degel HaTorah; Yamina: Tzalash/New Right, Jewish Home, National Union–Tkuma; Labor–Gesher; Democratic Union: Meretz, Green Movement, Independence/Israel Democratic Party | YP 8420 "מטעם המפלגות" (1) and YP 8454 "מטעם מפלגות" column (1) |
| Candidate affiliations (sampled) | `candidateRanks` | Likud/Kulanu 29, 60, 68, 78 = Kulanu; Kahlon #5 = Likud as printed; Labor–Gesher 1–10 | YP 8420 party column (1) |
| Registered-name labels | "New Right (registered as Tzalash)", "Israel Democratic Party (registered as Independence)" | | YP 8420 (1) "צל"ש - ציונות ליברליות ושוויון", "מפלגת העצמאות"; Israel Democratic Party site dem.co.il retained in logo evidence |
| Recommendation round | `blocSchemes[0]` and `aftermath recommendationRounds[0]`: dates 22–23 Sep; 4 lists → Netanyahu 55; 3 lists + 10 Joint List → Gantz 54; Yisrael Beiteinu 8 + Balad 3 → none 11; Joint List split Hadash/Ra'am/Ta'al vs Balad | | President Rivlin's statement, 25 Sep 2019, via Ynet (4, quoting 1) https://www.ynet.co.il/articles/0,7340,L-5597168,00.html: "בחבר הכנסת בנימין נתניהו תמכו 55 חברי כנסת, ובחבר הכנסת בני גנץ תמכו 54 … מפלגת ישראל ביתנו, לא תמכה באף אחד מהמועמדים"; Israel Hayom 23 Sep 2019 (4) https://www.israelhayom.co.il/article/694277: "סיים הבוקר (שני) את ההתייעצויות … 55 ממליצים לנתניהו, 54 לגנץ ו-11"; ToI 23 Sep (4): "only came from three of its four factions and ten of its 13 lawmakers" |
| Mandate to Netanyahu | 2019-09-25, 28 days | | Ynet 25 Sep 2019 (4) quoting the President: "יקבל מידיי, הערב, את המנדט … החוק נותן בידיך, אדוני, 28 ימים" |
| Netanyahu returns mandate | 2019-10-21 | | President's Residence statement quoted by N12 (4) https://www.mako.co.il/news-israel-elections/elections_2019-2019_q4/Article-a5c99d0c64fed61027.htm: "קיבל היום, שני, כ"ב בתשרי, 21 באוקטובר, את הודעתו של ראש הממשלה … כי הוא משיב את המנדט" |
| Mandate to Gantz | 2019-10-23, 28 days | | Walla 23 Oct 2019 (4) https://www.walla.co.il/news/politics/3319436: "העניק הערב (רביעי) ליו"ר כחול לבן בני גנץ את המנדט … עשרים ושמונה ימים" |
| Gantz returns; 21-day period | 2019-11-20; 2019-11-21 → midnight 2019-12-11 | | ToI 21 Nov 2019 (4): "handing the mandate back … after 28 days … which begins Thursday and ends at midnight on December 11" |
| Dissolution and next election | 2019-12-12; election 2020-03-02; formal mechanism; conflict resolution | | IDI (3) https://en.idi.org.il/articles/38887: "early in the morning of December 12, before the President had provided this notification, the Knesset passed a law to dissolve the 22nd Knesset, advancing the elections … by eight days" |
| No government; 34th government continued | `governmentNote`, `formation.outcome`, `term.scope`, context `no-government-k22` | | Sources above; Gantz was tasked with "הממשלה ה-35" (Mivzak Live, 23 Oct 2019, quoting the President's Residence), so the 34th was the outgoing government |
| Term event: indictment announcement | 2019-11-21 | | HCJ 7871/19, 7928/19 ¶2 (1, reproduction) https://bagats.org.il/judgments/…/בגץ-7928-19.html: "ביום 21.11.2019 הודיע היועץ המשפטי לממשלה על החלטתו להגיש כתב אישום" |
| Term event: US peace plan | 2020-01-28 | | White House (1 for a foreign act), cited; SIPRI and CFR cited |
| Context events | `sequence-k22` (five elections 2019–2022), `no-government-k22`, `candidate-exclusion-final-k22` (Marzel, Gopstein) | | CEC history (1); IDI (3) https://www.idi.org.il/articles/65951 (2019: candidates approved by the CEC were disqualified by the Supreme Court); YP 8420 preamble (1) |
| UI text | `src/app/whatIf.ts:82`: Joint List ran together in k20, k22, k23 | | CEC/YP for k22 (1); k21 and k24 split lists, consistent |
| Party link: Yisrael Beiteinu 2019 platform | `party-links/k22.json lists["22-ל"][0]` | | PDF fetched; it is the Sept 2019 platform: "נפעל להקמת קואליציה משלוש מפלגות: "ישראל ביתנו", "הליכוד" ו"כחול לבן"" |
| Logos (13 entries) | 9 official-site entries: page references the asset path; asset SHA-1 base32 equals the campaign-window CDX digest (Likud, Beiteinu, Hadash, Ta'al, Israel Democratic, Democratic Union, New Right; Jewish Home medium, mismatch disclosed; Yesh Atid page reference) | | Recomputed locally from `data/raw/logos/k22/*` against `*-logo-cdx.json`: all claimed digests match. The 3 Commons entries (Joint List, Yamina, Balad) were not re-researched, per the brief. |

### Not checked (time)

- Party affiliation of every one of the 1,205 candidates beyond the samples above, and the English names of
  candidates.
- The 69 "medium" (probable) Knesset/Hebrew Wikipedia bio matches for non-elected candidates.
- Family classifications (editorial inferences rather than facts), apart from their vote figures, which match the
  CEC.
