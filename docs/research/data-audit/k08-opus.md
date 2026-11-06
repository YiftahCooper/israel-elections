# Data audit k08 (31 December 1973, 8th Knesset): Opus auditor

Auditor: Claude Opus (independent; did not read the Codex report). Base: `68b836a` (includes `53cca36`). Accessed:
2026-11-06 for every source below unless stated. Method: [BRIEF.md](BRIEF.md) with
[source-hierarchy.md](../source-hierarchy.md). No data edited.

## Summary

| Class | Count | Notes |
|---|---:|---|
| OK | 318 | Counted per field: election identity and totals (8); 21 lists × letters/name/votes/seats (84); 6 surplus agreements; rule set (1); 118 of 120 elected names; Ratz ranks 4–8 (5); no pre-opening replacement (1); 11 joint-list constituents; 4 lineage edges; 10 dataset hashes and 9 family status copies; 14 retained-file manifest hashes; recommendation round (5); formation and governments 16–17 (13); 2 bloc-scheme memberships; 5 term events; end of term (2); context event (1); logo (1); 13 English list labels and party-links publishers spot-checked (bundled as 1); glossary/rule text for 1973 (1) |
| WRONG | 8 | 1 elected-member misprint shown instead of the results-notice name (medium); 1 term-event wording (medium); 6 stale or mislocated texts and locators (low) |
| UNSUPPORTED | 1 | Party-name entries in `parties.json` that are really ballot-list names (low) |
| UNVERIFIABLE | 1 | Positions of the other eight lists in the January 1974 consultations (already marked "unknown" in the data) |
| DISPUTED | 1 | Candidate notice "שנאור" vs results notice and Knesset "שניאור" (Zalman Abramov) (low) |

What's good: **the official results notice YP 1979 (11 Jan 1974, pp. 608–610) is retained** (`k8-results-gazette`)
and is fully legible. I read it page by page. Every list's letters, name, votes and seats, the valid total 1,566,855,
the invalid total 34,243 and the 120 seats match `public/data/k8.json` exactly. Registered voters (2,037,478) and
votes cast (1,601,098) come from CBS table 27.2 (retained), and the State Comptroller's 1978 report gives the same
four totals. The candidate notice YP 1954 (21 Oct 1973, pp. 87–98, retained) has the same 21 lists as the results
notice. **No list withdrew or was cancelled**, so `withdrawn: false` is right for all 21. The State Comptroller
confirms "21 רשימות לכנסת השמינית". The six surplus agreements match the CEC Form 30 appendix §ז (pp. 10–11).
Pairs 2–4 are left blank there because one partner failed the threshold. Both confidence votes match the plenum
records. The dissolution date (5 Jan 1977) is the dissolving act itself, not a procedural step.

Main findings: (1) Likud #38 is shown as **"שחטרמן אברהם"**, the candidate-notice misprint. The results notice and
the Knesset print **"שכטרמן"**, and decision 0088 has a `displayNameHe` mechanism for exactly this case (precedent:
k11 Speiser). (2) The term event "NRP ministers **left** Rabin's government" misstates the event. Rabin removed
them, treating their abstention in a no-confidence vote as resignation. The other findings are low-severity stale
texts in files the app does not display.

No English Wikipedia in any k8 file (`grep -c en.wikipedia` = 0 in `public/data/k8.json`, `meta/k8.json`,
`aftermath/k8.json`, `bios/k8.json`, `logos/k8.json`, `party-links/k8.json`). Reversed Hebrew parentheses appear
only inside verbatim PDF-extraction quotes in `aftermath/k8.json` (see finding 8). There are none in displayed names
or notes.

## Non-OK findings

Severity: **H** high (wrong fact shown to users), **M** medium, **L** low (wording or formatting, or not displayed).

| # | Sev | File | JSON path | Current value | Correct value | Class | Source (rank) | Quote | Accessed |
|---|---|---|---|---|---|---|---|---|---|
| 1 | M | `data/meta/candidate-notes.json` (no k8 entry) → `public/data/k8.json` | `lists[id=8-חל טעם].candidates[37]` (`8-חל טעם#38`) `nameHe` | `שחטרמן אברהם` | Add a note `{candidateId: "8-חל טעם#38", displayNameHe: "שכטרמן אברהם", …}`. The candidate notice misprints the name; the results notice prints it correctly, as decision 0088 requires. `nameEn` "Abraham Shechterman" and the bio already treat him as שכטרמן. | WRONG | YP 1979 p. 609 §4(ה) (1, retained `research/k08-results.pdf`); Knesset OData KNS_Person 2645 (1, retained `k8/knesset-odata-members.json`); YP 1954 p. 91 (1) for the misprint; JTA 8 Jan 1974 https://www.jta.org/archive/list-of-new-knesseters (3) | YP 1979: "38. שכטרמן אברהם"; OData: `{"personId": 2645, "lastName": "שכטרמן", "firstName": "אברהם"}` (also in `meta/k8.json` membersByName "אברהם שכטרמן"); YP 1954: "38. שחטרמן אברהם"; JTA: "Avraham Shechterman" | 2026-11-06 |
| 2 | M | `data/meta/aftermath/k8.json` | `term.events[id=nrp-departure].textEn/textHe` | "The National Religious Party ministers left Rabin's government." / "שרי המפד״ל עזבו את ממשלת רבין." | E.g. "Rabin removed the National Religious Party ministers from his government after two of them abstained in a no-confidence vote, then resigned (December 1976)." / "רבין הוציא את שרי המפד״ל מממשלתו לאחר ששניים מהם נמנעו בהצבעת אי־אמון, ואחר כך התפטר (דצמבר 1976)." The cited IPU source itself says "excluded". | WRONG | IPU Chronicle 1977 https://data.ipu.org/election-summary/PDF/ISRAEL_1977_E.PDF (2, already cited); Politika (Hebrew University) vol. 22 no. 2 https://politika.huji.ac.il/sites/default/files/politika/files/22_no.2.pdf (2); IDI https://www.idi.org.il/policy/parties-and-elections/elections/1977/ (2) | IPU: "Prime Minister Itzhak Rabin had the previous month excluded the three National Religious Party (NRP) members from his coalition Cabinet following the abstention of NRP Knesset members in a vote of confidence"; Politika: "שניים משלושת שרי סיעת המפד"ל נמנעו בהצבעה. ראש הממשלה דאז יצחק רבין … החליט לראות בהצבעתם זו התפטרות … הוא הודיע על כך בכנסת ב-20 בדצמבר"; IDI: "פיטוריהם של שרי המפד"ל בעקבות הימנעותם בהצבעת אי-אמון" | 2026-11-06 |
| 3 | L | `data/meta/aftermath/k8.json` | `term.events[id=disengagement-agreements].notes[0]` | "…Both agreements fall in the eighth Knesset, across the Meir and Rabin cabinets." | Both were signed under Golda Meir. Egypt signed on 18 Jan 1974 (government 15, three days before the 8th Knesset opened on 21 Jan 1974). Syria signed on 31 May 1974 (government 16, before Rabin's government on 3 Jun 1974). Suggested: "Egypt (18 January 1974, before the Knesset opened) and Syria (31 May 1974); both under Meir governments." | WRONG | Israel MFA, Separation of Forces Agreement, 18 Jan 1974 https://www.gov.il/en/pages/23-separation-of-forces-agreement-government-statement-18-january-1974 (1); Israel State Archives https://catalog.archives.gov.il/site/en/chapter/the-separation-of-forces-agreement-with-egypt-january-1974/ (1); ECF https://ecf.org.il/issues/issue/178 (4) | MFA: "The agreement is scheduled to be signed … Friday January 18, at kilometre 101"; ISA: "On January 18, 1974, Chief of Staff David Elazar … signed the agreement"; ECF: "signed on 31 May 1974 in Geneva" | 2026-11-06 |
| 4 | L | `data/meta/aftermath/k8.json` | `gaps[4]` | "Replacement-coalition snapshots are partial: government 14's faction splits and current seat counts require a separate audit…" | Government 14 belongs to k7. The text is boilerplate copied across `aftermath/k1`–`k8.json`. For k8, replace it with a k8 gap: the replacement-coalition changes of government 17 are not recorded (NRP joining in Oct 1974; Ratz leaving in Nov 1974). | WRONG | Internal (`grep` shows the identical string in aftermath k1–k8) | n/a | 2026-11-06 |
| 5 | L | `data/meta/k8.json` | `blocSchemes[id=pm-recommendations].notes[1]` | "Date: Hebrew Wikipedia (citing Davar 31 Jan 1974) gives 30 January 1974 for the mandate; the JTA bulletin dated 31 January says 'today'. One-day uncertainty." | The date is settled: 30 Jan 1974. The President's letter read in the Knesset says "הטלתי היום" and is dated 30 Jan; JTA bulletins carry the next day's date. Drop "One-day uncertainty" and cite the plenum record (already `plenum-gov16` in the aftermath). | WRONG | Knesset plenum, sitting 21, 10 Mar 1974 https://fs.knesset.gov.il/8/Plenum/8_ptm_253620.pdf (1); NYT 28 Feb 1974 https://www.nytimes.com/1974/02/28/archives/mrs-meir-is-given-delay-on-cabinet-gets-a-7day-extension-fo-forming.html (4); JTA PDF 17 Jan 1974 http://pdfs.jta.org/1974/1974-01-17_012.pdf (3) showing the next-day convention | Plenum (as quoted in `aftermath/k8.json`): "ז' בשבט תשל"ד 30 בינואר 1974 … הטלתי היום על חברת־הכנסת גולדה מאיר את התפקיד להרכיב ממשלה"; NYT: "was asked by President Katzir on Jan. 30 to form a new government"; JTA PDF: bulletin dated "January 17, 1974", dateline "JERUSALEM, Jan. 16 (JTA) … met separately today" | 2026-11-06 |
| 6 | L | `data/raw/SOURCES.json` | `sources[id=k8-candidates-reviewed].url` | `project:data/raw/k8/rosters.reviewed.json` | `project:data/raw/k8/candidates.reviewed.json` (the `file` field and the actual file). No `rosters.reviewed.json` exists. | WRONG | Internal (`ls data/raw/k8/`) | n/a | 2026-11-06 |
| 7 | L | `data/meta/k8.json` | `blocSchemes[id=labour-affiliated-arab-lists].nameHe/nameEn` | "מפא\"י/המערך והרשימות הערביות המסונפות אליה" / "Mapai/Alignment and its affiliated Arab (satellite) lists" | In 1973 Mapai no longer existed as a list. It merged into the Israeli Labor Party in 1968, and the 1973 list is the Alignment. Suggested: "המערך והרשימות הערביות המסונפות אליו" / "The Alignment and its affiliated Arab lists". JTA at the time: "These two parties together form the Labor-affiliated Arab List." | WRONG | YP 1979 p. 608 list name (1); JTA 8 Jan 1974 https://www.jta.org/archive/list-of-new-knesseters (3) | JTA: "PROGRESS AND DEVELOPMENT — 2 … BEDOUIN AND VILLAGERS — 1 … (These two parties together form the Labor-affiliated Arab List.)" | 2026-11-06 |
| 8 | L | `data/meta/aftermath/k8.json` | `formation.events[type=mandate-given].cites[0].quote`; `formation.events[governmentNumber=17].cites[0].quote` and the same quote in `government.changes[0].cites[0]` and `government.endDateCites[0]` | Reversed parentheses and scrambled word order from PDF extraction, e.g. "לסעיף 13)א(", "אהרן אבוחצירא )חזית דתית לאומית(" | If these quotes are ever displayed, normalise the parentheses to "13(א)" and "(חזית דתית לאומית)". The file note says the extraction order is preserved deliberately, so this is presentation only; the app does not currently read `aftermath/` (no reference in `src/`). | WRONG | Plenum PDFs above (1) | n/a | 2026-11-06 |
| 9 | L | `data/meta/parties.json` | `parties[id=nrp|rakah|kach].names[date=1973-12-31].nameHe` | List ballot names: nrp = "חזית דתית לאומית – המזרחי, הפועל המזרחי ובלתי מפלגתיים", rakah = "הרשימה הקומוניסטית החדשה בישראל (רק״ח) ובלתי מפלגתיים", kach = "רשימת הליגה (מיסודה של הליגה להגנה יהודית בא״י)" | These are the lists' official names (YP 1954/1979), not the parties' names. Either label them as list names or record the party names (המפלגה הדתית לאומית, רק"ח, …). The same class was found in k20. | UNSUPPORTED | YP 1979 p. 608 (1) | "חזית דתית לאומית — המזרחי, הפועל המזרחי ובלתי מפלגתיים" (list name) | 2026-11-06 |
| 10 | L | `public/data/k8.json` (from YP 1954) | `lists[id=8-חל טעם].candidates[12]` (`8-חל טעם#13`) `nameHe` | `אברמוב שנאור זלמן` | The candidate notice prints "שנאור". The results notice and the Knesset print "שניאור". This may be a variant spelling rather than a misprint, so decision 0088 does not clearly apply. If the owner treats it as a misprint, add `displayNameHe: "אברמוב שניאור זלמן"`. The CEC handwritten appendix follows the candidate notice ("שנאור"). | DISPUTED | YP 1954 p. 91 (1); YP 1979 p. 609 (1); Knesset OData KNS_Person 2126 (1); CEC appendix pp. 23–28 (1) | YP 1954: "13. אברמוב שנאור זלמן"; YP 1979: "13. אברמוב שניאור זלמן"; OData / `meta/k8.json`: "שניאור זלמן אברמוב" | 2026-11-06 |
| 11 | L | `data/meta/aftermath/k8.json`, `data/meta/k8.json` | `recommendationRounds[0].entries[letters∈{ב,גד,רצ,ו,לע,עא,רא,קנ}].status` = "unknown" | "unknown" for 30 seats | Still unknown. A US Embassy cable of 18 Jan 1974 says the NRP met Katzir on 17 Jan, set conditions and "again urged formation national unity government including Likud"; the Independent Liberals "could not accept change in status quo on religious conversions". Neither names a candidate, so "unknown" is correct. JPress (Davar/Maariv 17–18 Jan 1974) would decide it but is behind a bot challenge. | UNVERIFIABLE | US Embassy Tel Aviv cable 1974TELAV00295 https://forum.wikileaks.org/plusd/cables/1974TELAV00295_b.html (declassified US record; lead only); tried JTA archive search (3) and Exa searches | Cable: "IN FORMAL CONSULTATIONS WITH PRESIDENT KATZIR, NATIONAL RELIGIOUS PARTY (NRP) JAN 17 REITERATED ITS POSITION … AND AGAIN URGED FORMATION NATIONAL UNITY GOVERNMENT INCLUDING LIKUD" | 2026-11-06 |

### Finding 1 in detail

`docs/research/elected-names-odata-audit.md` and the opening-membership cross-check paired שחטרמן with OData 2645
שכטרמן as a "reading-based" match. Nobody then applied the display rule. The candidate notice (YP 1954 p. 91, rank
38) clearly prints "שחטרמן אברהם". The results notice (YP 1979 p. 609, §4(ה) 38) prints "שכטרמן אברהם". The Knesset
record and the app's own k7 roster ("שכטרמן אברהם", `meta/k7.json`) agree with the results notice. The CEC
handwritten appendix copies the candidate notice. Decision 0088 §1 keeps the candidate-notice reading as data;
`candidate-notes.json` `displayNameHe` exists for exactly this case, as with k11 Speiser. Add the note with both
sources. Votes and seats are unaffected.

A full comparison of the 120 names (normalised for maqaf, spaces and gershayim) between YP 1954 and YP 1979 found
four differences: אמת#40 (יודין)/דרניצקי order, ב#1 "בורג יוסף שלמה" vs "בורג שלמה יוסף", חל טעם#13 (finding 10)
and חל טעם#38 (finding 1). The first two are not misprints. The Knesset records "דרניצקי יהודה (יודין)" and
"בורג יוסף", which supports the candidate-notice order, so they are OK as shown.

## Editorial-stance and source-quality flags (not counted above)

- **Hebrew Wikipedia as sole basis**: the Herut 17 / Liberal 13 / State List 4 / Free Centre 4 / Greater Israel 1
  split of the Likud's 39 seats in `meta/k8.json` (and `joint-facts.json` `[9]`) rests only on he.wikipedia (rank 5).
  The exception is the Free Centre, where Shostak is backed by a Knesset biography. Knesset member pages state each
  member's party, so a rank 1 source is reachable. The split matches what I know, and the count (39) is
  consistent. I did not re-verify all 39 member by member.
- The Mapam seven also cite OData faction 999, which lists six of them (Zoubi #33 is absent there). Zoubi as Mapam
  rests on Hebrew Wikipedia.
- Colours rest on Hebrew Wikipedia table colours. This is disclosed as convention; acceptable.
- Recommendation sources are JTA (rank 3/4). That is acceptable, because JPress is not reachable by machine.
- Wording checked for stance: Entebbe ("hostages held by terrorists"), Land Day ("security forces killed six Arab
  citizens"; factual, attributed to the Knesset history), UN 3379 (describes the Assembly's act). None is partisan.

## Coverage notes (not findings)

- Government 17's later changes (NRP joining on 30 Oct 1974; Ratz leaving in Nov 1974) and Rabin's April 1977
  leave (Peres acting de facto) are not modelled. k8 shows no PM tenure dates after government 16, so the "skipped
  acting PM" error class cannot occur here. Record it if tenures are later added.
- No later correction notice to YP 1979 was found. YP 1979, the CEC Form 30 appendix and CBS all agree, so a
  correction is unlikely. I did not search exhaustively for one.
- Mid-term replacements (e.g. Sharon, Sapir) are outside the app's model under decision 0088 §4. No replacement
  before the opening sitting occurred: the OData opening membership has 120 members, all paired.

## Checked and found OK

| Claim (path) | Value | Source (rank) | Evidence |
|---|---|---|---|
| `electionDate` | 1973-12-31 | YP 1979 p. 608 heading (1); law below (1); CBS 27.2 (1) | CBS row: "31.12.1973 … 8"; Knesset elections page: "31 בדצמבר 1973 ו' בטבת תשל"ד" |
| `knesset`, `nameHe/En` | 8 | YP 1979 (1) | "הודעה על תוצאות הבחירות לכנסת השמינית" |
| `totals.valid` / `invalid` | 1,566,855 / 34,243 | YP 1979 p. 608 (1); State Comptroller report 28 (1978) https://library.mevaker.gov.il/sites/DigitalLibrary/Documents/1950-2008/1978-28/1978-28-225-Pnim.pdf (1) | YP: "ס"ה 1,566,855"; "מספר הקולות שנמצאו פסולים: 34,243" |
| `totals.registered` / `votesCast` | 2,037,478 / 1,601,098 | CBS st27_02 (1, retained); State Comptroller (1) | CBS: "1,566,855 2.1 78.6 1,601,098 2,037,478 31.12.1973 8" |
| Number of lists; none withdrawn | 21; all `withdrawn: false` | YP 1954 pp. 88–98 (1); YP 1979 (1); State Comptroller (1) | Comptroller: "22 רשימות לעומת 21 רשימות לכנסת השמינית"; the same 21 letters in both notices |
| 21 × letters, `nameHe`, votes, seats | all as in `national.reviewed.json` | YP 1979 p. 608 tables (1) | Read line by line, e.g. "אמת … 621,183 … 51"; "חל טעם … 473,309 … 39"; "רס … 1,201" |
| List names vs candidate notice | app uses the YP 1979 wording | YP 1954 headers (1) | Minor wording differences in the candidate notice (e.g. "השיתוף והאחוה", "המזרחי – הפועל המזרחי") do not make the results-notice names wrong |
| `agreements` (6) | ב+גד, חל טעם+ער, סנ+ענ, קנ+ז, רא+עא, לע+רצ | CEC Form 30 appendix §ז pp. 10–11 (1, retained extract) | "רשימות ב+גד התקשרו ביניהן … 190,361 … 15"; "רא+עא … 39,012 … 3"; "לע+רצ … 91,583 … 7" |
| `ruleSetId` | il-1973-bader-ofer-1 (1% threshold, Bader–Ofer) | Amendment No. 4, SH 692 (1, retained) | Allocation reproduces all seats (`allocationCheck.exact`) |
| Elected names (118/120) | first N candidates | YP 1979 pp. 609–610 (1); JTA 8 Jan 1974 (3) | Name-by-name comparison; JTA list matches all 120 people |
| Ratz ranks 4–8 | רון רם … היל (גבע) משה | YP 1954 p. 96 (1) | "4. רון רם 5. שושני אורי 6. כצנלסון יצחק 7. גורן דינה 8. היל (גבע) משה" |
| No pre-opening replacement | 120 opening members paired | OData (1, retained cross-check) | 102 exact plus 18 same-faction reading pairs |
| Joint-list constituents (11) | Likud 5; Alignment 2; Torah Front 2; Moked 2 | YP 1979 list names (1); OData factions 355/375/379/361/371/385 (1); he.wiki (5) | List names name the components, e.g. "הליכוד – גח״ל, הרשימה הממלכתית, המרכז החפשי, פעילי א״י השלמה" |
| Torah Front split | Agudat 1,3,4; PAI 2,5 | OData factions 361/371 after the split of 15 Mar 1977 (1) | as quoted in `meta/k8.json` |
| Moked: Pa'il = Blue-Red | rank 1 | Knesset bio (1) | "ממייסדי תנועת תכלת-אדום (1973). | עמד בראש מפלגת מוקד" |
| Lineage edges `partners-8-*` (4) | as above | same | consistent with the constituents |
| Dataset hashes | `party-lineage.json sources.k8` and 9 families = `445fd7f3…0da6d` | `sha256sum public/data/k8.json` | match; family `datasetStatus` equals the public `status` (EN/HE/stage) |
| `SOURCES.json` k8 manifest (14 files) | sha256 and bytes | local recomputation | all match; `buildInfo.rawSha256` not stale |
| Consultations start | 1974-01-16 | JTA PDF 17 Jan 1974 (3) | "JERUSALEM, Jan. 16 (JTA) — President Ephraim Katzir met separately today with delegations from the Labor Party and Likud" |
| Alignment → Meir (51); Likud none (39) | as stored | same JTA (3) | "Labor delegation … suggested that Premier Golda Meir be entrusted …"; Bader "had made no suggestions … 'this is the task of Labor'" |
| Mandate to Meir | 1974-01-30 | plenum 10 Mar 1974 (1); NYT (4); US cable 1974TELAV00598 (lead) | see finding 5 |
| Gov 16 confidence vote | 1974-03-10; 62–46–9 | plenum 8_ptm_253620 p. 65 (1) | "בעד ההצבעה: תוצאות … 62 … נגד 46 … נמנעים 9" (extracted) |
| Gov 16 number, PM, start/end, coalition 68 | 16; Meir; 1974-03-10 → 1974-06-03; אמת, ב, לע, רא, עא | plenum (1); NYT 7 Mar 1974 (4); US cable 1974TELAV01330 (lead) | NYT: "expected to command the loyalties of 68 members"; cable: "LABOR ALIGNMENT-INDEPENDENT LIBERALS-NRP COMMANDING 68-SEAT MAJORITY" |
| Gov 17 confidence vote and coalition | 1974-06-03; 61–51–5 (Speaker's correction); אמת, לע, רצ, רא, עא = 61 | plenum 8_ptm_253635 p. 50 (1) | "61 … בעד 51 נגד 4 נמנעים … אני מתקן את תוצאות ההצבעה: נמנעים – חמישה" |
| `first-government` bloc scheme | coalition/opposition membership | as above (1, 4) | consistent |
| Term events: Agranat interim report 1974-04-01; UN 3379 1975-11-10; Land Day 1976-03; Entebbe 1976-07-04; disengagement 1974 (row text) | as stored | MOD archive (1); UN resolution (1); Knesset history (1); MFA (1) | quotes as cited in `aftermath/k8.json`; the disengagement dates are confirmed in finding 3 |
| `endedBy` | 1977-01-05, early election 1977-05-17 | Politika (Hebrew University) (2); Open Knesset committee log (lead); IPU (2) | Politika: "ב-5 בינואר 1977, אישרה הכנסת את הקדמת הבחירות באמצעות 'חוק התפזרות הכנסת השמינית', ואלה נקבעו ל-17 במאי 1977" (the dissolving act itself) |
| Context `war-postponement` | 30 Oct → 31 Dec 1973 | חוק הבחירות לכנסת השמינית ולרשויות המקומיות (הוראת שעה), תשל"ד-1973 https://fs.knesset.gov.il/7/law/7_lsr_208004.pdf (1); IDI https://www.idi.org.il/articles/66422 (2) | "הבחירות לכנסת השמינית שנועדו ליום ד' בחשון תשל"ד (30 באוקטובר 1973) נדחות, והן יתקיימו ביום ו' בטבת תשל"ד (31 בדצמבר 1973)"; passed 25 Oct 1973 |
| Logo `גד` 1973 | Commons, credited to the NLI 1973 ephemera page | Commons file page (lead) | "Source: הספרייה הלאומית – …/elect_ephemera_1973.aspx, CC BY-SA 4.0". The NLI page itself was not opened. |
| Party links | publishers labelled; IDI-hosted platforms marked partisan | spot-check | no English Wikipedia |
