# After the election: expanded scope and research pilot

Research cut-off: **7 November 2026**. Research/data proposal only; no application or production-data changes. The JSON fragments below are durable, unapplied additions to the existing k24/k25 drafts, not replacement election records.

The page needs to explain **the interval between the result and the government taking office**, then the subsequent term. Reactions alone cannot explain this interval. Include public negotiation positions, the difference between proposals and signed agreements, formation-related public opinion, and institutional steps. Keep the new tab now; its eventual Learn/Play placement is a separate owner decision.

Authority: owner's 5 November message (14:27 and subsequent clarification: historical events, not merely major laws) and 7 November item 5, supplied in `.backup-scratch/brief-1107/owner-messages.txt` and `owner-1107.txt` in the main checkout. The latter expressly requests negotiation statements and relevant post-election polling and accepts single-source events appearing only in Sources. This supersedes the earlier design recommendation to omit reaction content; it does **not** establish that every old reaction must be collected before any negotiation can be documented. The proposed coverage rule below needs editorial acceptance before production use.

Read alongside [existing design](../design/after-the-election.md), [sourcing plan](after-the-election.md), [k25 review](aftermath-k25-review.md), [survey feasibility audit](issue-polling-sources.md), and [vote-intention archive](polling-archive.md). Existing drafts live in `data/meta/aftermath/k1.json` through `k26.json`; k24 and k25 were inspected. Main-checkout scratch `after-election/COMMON.md`, `FILL.md`, and `PROMOTE.md` were read as historical workflow context, not instructions to merge branches for this task.

## 1. Periods, dimensions and evidence rules

Keep three distinct intervals: election → investiture (or documented failure); government tenure, including caretaker service; Knesset tenure. An election, dissolution, notification of success and swearing-in are different events. Store event date, publication date, fieldwork dates and last-check date separately. A current term remains open-ended. In 2026 publish only completed, checked acts, never an expected mandate or government as accomplished.

Era key for the matrix:

- **E1, 1949–1965 (k1–k6):** Knesset plenum scans; Reshumot; presidential/party files at Israel State Archives; contemporary Hebrew newspapers via NLI Historical Jewish Press (JPress). Newspaper holdings, OCR and access vary. Party organs are primary evidence of their own statements, not independent confirmation of rival parties' conduct.
- **E2, 1969–1992 (k7–k13):** E1 plus INES from 1969, IPU election summaries and more broadcast/newspaper reporting. Most negotiation detail still needs issue-by-issue archive work.
- **E3, 1996–2006 (k14–k17):** E2 plus early online Israeli news, deposited coalition documents and INES pre/post waves where documented. Direct PM elections in 1996/1999 require a distinct formation path; 2001 was PM-only within k15, not a 27th Knesset election. Verify the law in force at each date.
- **E4, 2009–2022 (k18–k25):** President/Knesset announcements and videos, coalition agreement PDFs, party statements and Hebrew digital news. IDI Democracy Index (since 2003) and monthly Israeli Voice (verified archive from April 2019) supplement INES and commercial polls. Do not project current outlet/pollster partnerships backwards.
- **E5, 2026 (k26):** contemporary E4 channels, checked at a stated cut-off. Source availability does not prove that a particular event has occurred or a 2026 survey wave has been released.

These are acquisition routes, **not a claim that every dimension has surviving evidence in every election**. Era inventory draws on the linked repository research; fresh access checks and their limitations are in §6.

| Dimension | What to retain | Sources by era | Neutrality and claim checks |
| --- | --- | --- | --- |
| Result and immediate reaction | Election, certification/corrections, concession or acceptance statements; outgoing PM/caretaker status | E1–2: CEC/Reshumot, plenum, presidential files, dated press. E3–5: CEC and direct statements plus news | Provisional versus final results labelled. Quote each speaker only on their own position. Do not infer a concession from silence or an exit poll. Reaction completeness measured against every elected list. |
| President recommendations | Each faction's nominee, explicit non-recommendation, withdrawals/updated rounds | E1–2: consultation files, letters, contemporary reports. E3: applicable-law exception. E4–5: President's per-faction records/video, corroborating reports | Date every round; distinguish elected list, constituent party and later faction. Seats checked against election snapshot; unknown is not none. Highest tally does not legally guarantee tasking. |
| Mandates and extensions | Recipient, date, lawful duration, actual extension, expiry/return, subsequent nominee, Knesset-stage attempts | E1–2: presidential instruments, gazette/plenum; E3–5: official notice and law version plus reporting | Requested extension is not granted extension. Notification of success is not investiture. Day-boundary/time conflicts recorded rather than guessed. |
| Public negotiation positions | Named actor, represented party/faction, interlocutor, exact dated demand/red line/offer, revised position and response | E1–2: party releases and contemporary interviews/press; E3–5: releases, recorded statements, interviews, official consultations and original news reports | Record “X said/requested,” not “X intended.” Distinguish on-record speech, party release and reporter's account of private talks. Anonymous leaks remain candidates; never attribute them as an acknowledged party position. |
| Negotiation milestones | Meetings actually held, suspension/resumption, negotiating-team announcements, offers accepted/rejected, initialled/signed/deposited agreements and annexes | E1–2: presidential/party files, contemporary press and deposited material where found; E3–5: signed agreement corpus and Knesset records plus news | A negotiating draft, portfolio appendix, full coalition pact and enacted law have separate statuses. Read signature/date/parties; record signing, announcement and deposit separately. Link a demand to an agreement clause only when supported. |
| Coalition substance | Publicly agreed portfolios, rotation, guidelines, named policy commitments, deadlines and legislative prerequisites | All eras: original agreement/guidelines, investiture speech and relevant law; secondary reporting as locator/corroboration | Quote/paraphrase the clause, not a journalist's judgement. “Agreed to propose” does not mean passed, funded or implemented. Distinguish party from joint electoral list. |
| Post-election public opinion | Formation preferences/expectations, result satisfaction, hypothetical vote intention, policy proposals and government priorities | E1: selective newspaper/Guttman leads; E2–5: documented INES phases, IDI waves, original commissioned polls and archives (§2) | Keep these five constructs separate. Polls describe respondents at fieldwork time; they do not prove why negotiations failed or whether a policy was legitimate. Exact question, menu, population and missing answers required. |
| Defections and faction changes | Resignations, dissenting votes, formal splits/mergers, declared defection, later affiliations, effective dates | All eras: Knesset committee decisions, membership/faction records and plenum; contemporary reporting for declared positions | A dissenting vote or announcement is not a legally recognised split/defection. Do not rewrite election seats as though the new faction contested that election. Distinguish MK replacement from changing affiliation. |
| Formation outcome or failure | Government number, confidence tally, oath/start, original coalition; no-government path and caretaker continuity | All eras: plenum/Gazette and government records; E2 onward IPU/IDI contextual accounts; E4–5 Knesset News | Coalition seats, confidence votes and recommendation totals may differ. A failed attempt need not mean the whole formation process failed. Do not invent a new government for k21/k22. |
| Developments during tenure | Budgets/economy, security/terror/war, foreign relations, national social events, institutional changes and consequential legislation selected by chronologies | All eras: Knesset/State Archives/Israeli academic histories and an independently authored chronology; primary records for details | Preserve existing two-independent-chronology inclusion test, ≥1 official/academic. Israeli framing and operation names; no partisan adjectives, motives or causal chains without attributed evidence. A law is eligible because the historical selection supports it, not merely because it passed. |
| Government changes and end | PM rotation/replacement, coalition entry/exit, confidence loss, election trigger, dissolution/regular expiry, next election and caretaker end | All eras: applicable law, official vote/appointment/dissolution records and independent chronology; modern announcements as detail | Keep multiple governments within one Knesset and governments continuing across elections. Record legal trigger and observed event, not a simplified “fell because…” inference. Never infer end of government from election day. |

**Coverage protocol (proposed).** Use a faction-by-phase coverage table: election reaction; initial formation position; material change during negotiations; final agreement/refusal. Search every elected list with the same Hebrew terms and time windows. Include all verified material position changes that affect participation, leadership/rotation, portfolios or explicitly negotiated policy; no quota based on media attention. Record “not found after search,” “declined,” “not applicable” and “not yet searched” separately. Do not manufacture equal numbers of quotations for each camp. The pilot is a sample of this protocol, not completed all-party coverage.

**Promotion protocol.** A verified single-source item stays in Sources with its supporting excerpt, gap and next check. Two URLs do not suffice: identify editorial origin, ownership, wire attribution and underlying release/interview/dataset. A public statement is evidence of what was said, not of the truth of its accusations. Independently researched corroboration may confirm an event; two reprints of its press release do not. For term-event *selection*, the stronger two-chronology rule still applies. Do not substitute two daily news reports for those chronologies.

## 2. Post-election polling: availability and admission

| Era | Institutions, pollsters and archives to search | Realistic delivery |
| --- | --- | --- |
| 1949–1965 | Guttman/Israel Institute of Applied Social Research holdings and IDI's Guttman/Viterbi centre; contemporary Maariv, Davar, Haaretz, Al HaMishmar and Palestine/Jerusalem Post via NLI/authorised holdings. Knesset Research and Information Center (RIC) is a later retrospective locator, not a contemporaneous pollster for this era. | Selected questions only if original questionnaire/table and fieldwork can be recovered. No verified continuous post-election series; no numeric pilot promised for k1–k6. A headline or retrospective narrative is insufficient. |
| 1969–1988 | INES/TAU and ISDC study documentation; Guttman holdings; Hebrew newspapers/broadcasts. Dahaf and Modiin Ezrachi appear in particular 1981/1988 contemporary reports; Smith and Dessima are additional dated leads in the prior archive. | INES makes systematic searching plausible from k7, but a wave's existence does not establish a post-election interview or published topline. Confirm phase and item. Commercial pollster activity observed in a campaign does not prove after-election availability. |
| 1992–1999 | INES questionnaires/codebooks; Yedioth/Dahaf, Maariv/Teleseker, Haaretz and television commissions as election-specific leads, not certified permanent pairings. Newspaper archives and Knesset RIC retrospectives. | Some post-election instruments, especially 1999, explicitly exist in prior survey audit. Published proportions still need verification. Separate direct-PM choices from Knesset vote intention in 1996/1999. |
| 2003–2015 | INES; IDI annual Democracy Index from 2003, Guttman/Viterbi publications/Data Israel, Peace Index with instrument-specific checks; Dahaf, Dialog, Teleseker, Midgam, Panels/Smith where the original publication identifies them. RIC reports may link studies. | Feasible selectively for k16–k20. Annual Index questions often concern institutions/social tensions rather than formation or the most urgent problem. Verify fieldwork relative to investiture. Do not relabel an annual observation as an immediate post-election poll. |
| 2019–2022 | INES by wave; IDI Israeli Voice monthly archive and full question/result PDFs; original news commissions, typically 12/Midgam, 13/Fuchs, Kan/Kantar, Maariv/Panels, other reputable outlets with named provider and method. | Strongest practical coverage (k21–k25), but datasets/brands can share sample providers. This pilot verifies April/May 2021 and Nov–Dec 2022 fieldwork; it does not establish a full monthly series of any one question. |
| 2026 | Current IDI instruments/Data Israel, original outlet commissions, CEC published poll submissions where applicable; INES only if an actual released 2026 wave is located. | Rolling research with cut-off, no projected observations. A campaign filing is not automatically a post-election poll; check legal contest and survey date. |

Archive authority is limited: **RIC collects and analyses evidence; it is not a substitute pollster**, and the Knesset page access was challenged in this pass. NLI is an archive of often partisan newspapers, not an endorsement of their polling methods. INES/ISDC access and reuse conditions vary. Existing [issue-polling audit](issue-polling-sources.md) establishes question/document leads, including 1969 instruments and post-election 1999 questions; this report does not upgrade those leads to verified numeric post-election observations.

Admission checklist:

1. Recover original commissioner and producer, fieldwork start/end, publication date, target population (including age/language), sample size by relevant population, mode, weighting documentation and published uncertainty. Unknown method fields remain explicit; essential missing fields put the item on hold.
2. Preserve question verbatim in its source language, preceding framing, complete answer menu, question number, denominator, multiple/single choice, undecided/refused and any rounding. English text is a labelled translation or paraphrase; the exact original remains linked at its question/page locator. Do not convert a Jewish-only finding into all Israelis or voters into all adults.
3. Separate issue priorities, formation support, expectations, satisfaction and “if elections were held today” seat estimates. Preserve hypothetical party configurations and threshold treatment. A projected seat table is not actual parliamentary support.
4. Never compute historical frequencies from microdata in this scope. Existing released tables may be transcribed; calculations and weighting would require a separate reproducible method and review. Do not average incompatible instruments, populations or phases.
5. Record reported maximum sampling error as the publisher's statement, not a guarantee covering panel/nonresponse bias. Require method review, not pollster rankings or ideological exclusions. Preserve all answer categories rather than selectively reporting a politically convenient result.
6. The owner's two-source gate is applied conservatively to surveys too: one survey remains one evidence family even if an article, PDF, translation and ten news reports repeat it. An independently collected survey with a different question cannot “confirm” its exact percentages. The pilot therefore retains usable primary figures **as single-source, Sources-only**. Any exception for authentic primary survey results is an owner policy choice, not assumed here.

## 3. Pilot format and claim status

Reuse the existing `Dated` shape (`date`, `textEn`, `textHe`, `cites`) and source registry (`url`, `publisher`, `kind`, `accessed`). Proposed additive extension **`scopeExtensionVersion: 1`** is a research-fragment version, not an increment of the production `schemaVersion`. Add:

- `negotiations.items`: Dated + `id`, `type` (`position-stated`, `offer`, `offer-rejected`, `reported-demand`, `agreement-signed`), `actor`, `letters`, `basis`, `verification`, `notes`. An agreement also needs parties, document locator/version and signing/deposit distinction when collected.
- `postElectionPolling.items`: `id`, `date` (= publication), `kind`, `fieldwork`, bilingual question (verbatim where quoted, otherwise explicitly labelled paraphrase), source-language/exact-question locator, complete `answers`, `method`, `verification`, `cites`. This is separate from the narrow existing `issuePolling`; map only genuine priority questions there later. `questionEn` may be an identified project translation.
- `verification`: `status: single-source | corroborated`, `independentFamilies`, `display: sources-only | main-page`, and `reason`. A future corroborated record must name ≥2 independent evidence families in its cites/notes. No promotion is performed by this document.

Source IDs below resolve in the single archive in §5. To avoid duplicating that archive, the JSON uses `sourceRegistryRef` in place of copying its metadata. Integrators must materialise the cited cards in each election's existing `sources` object before applying fragments; preserve existing source IDs and resolve any collisions. These fragments are intentionally not directly ingestible full kN files. `letters` refers to the elected list; it does not allocate the list's votes among constituent parties.

**Pilot status:** 6 negotiation entries and 3 poll entries. All 9 are explicitly single-source/Sources-only. Multiple reportage URLs are preserved where useful but not asserted to be independent corroboration of a shared public speech/document. This is an evidence-rich research pilot, **not nine page-ready promotions**. No all-party coverage or complete negotiation timeline is claimed.

### k24 — 2021

```json
{
  "scopeExtensionVersion": 1,
  "electionId": "k24",
  "status": "pilot",
  "reviewedAt": "2026-11-07",
  "sourceRegistryRef": "docs/research/after-election-scope.md#5-source-archive",
  "negotiations": {
    "items": [
      {
        "id": "k24-netanyahu-rotation-offer",
        "date": "2021-05-30",
        "type": "offer",
        "actor": "Benjamin Netanyahu / בנימין נתניהו",
        "letters": "מחל",
        "basis": "reported-public-proposal",
        "textEn": "Netanyahu proposed a three-way prime-minister rotation with Sa'ar and Bennett.",
        "textHe": "נתניהו הציע רוטציה משולשת בראשות הממשלה עם סער ובנט.",
        "cites": [
          {"source": "S03", "quote": "רוטציה משולשת בראשות הממשלה"},
          {"source": "S04", "quote": "ראשי סיעות הימין-חרדים חתמו על מכתב"}
        ],
        "verification": {"status": "single-source", "independentFamilies": ["F-rotation-proposal"], "display": "sources-only", "reason": "Separate newsroom reports concern the same proposal/letter; underlying independent confirmation not established."},
        "notes": ["N12 gives Bennett one year and a quarter; Ynet's body gives one year and a half. Duration omitted, conflict unresolved. N12 publication and Sa'ar's dated embedded response establish 30 May as the public-report date; private approaches reportedly preceded it."]
      },
      {
        "id": "k24-saar-response",
        "date": "2021-05-30",
        "type": "offer-rejected",
        "actor": "Gideon Sa'ar / גדעון סער",
        "letters": "ת",
        "basis": "attributed-public-statement",
        "textEn": "Responding to the rotation proposal, Sa'ar reiterated his commitment to replacing Netanyahu's government.",
        "textHe": "בתגובה להצעת הרוטציה חזר סער על מחויבותו להחלפת שלטון נתניהו.",
        "cites": [
          {"source": "S04", "quote": "עמדתנו ומחוייבותנו היתה ונותרה: החלפת שלטון נתניהו."},
          {"source": "S03", "quote": "סער סירב להצעה"}
        ],
        "verification": {"status": "single-source", "independentFamilies": ["F-saar-response"], "display": "sources-only", "reason": "Both reports rely on the same public response; no separately authenticated original retrieved."},
        "notes": ["Ynet embeds a tweet dated 30 May. Do not adopt the article's speculation about trust or personal motives."]
      },
      {
        "id": "k24-bennett-lapid-position",
        "date": "2021-05-30",
        "type": "position-stated",
        "actor": "Naftali Bennett / נפתלי בנט",
        "letters": "ב",
        "basis": "attributed-public-statement",
        "textEn": "Bennett announced he would work to form a government with Lapid.",
        "textHe": "בנט הודיע שיפעל להקמת ממשלה עם לפיד.",
        "cites": [
          {"source": "S01", "quote": "אפעל בכל כוחי להקמת ממשלת אחדות"},
          {"source": "S02", "quote": "יחד עם ידידי, יאיר לפיד"}
        ],
        "verification": {"status": "single-source", "independentFamilies": ["F-bennett-address"], "display": "sources-only", "reason": "Both publications report the same address; separate firsthand verification has not been established. Calcalist credits ynet/Calcalist."},
        "notes": ["This announces an intention, not a signed agreement or government in office. 'Unity government' is the speaker's description; project sentence avoids adopting it as a classification."]
      }
    ]
  },
  "postElectionPolling": {
    "items": [
      {
        "id": "k24-may-government-priorities",
        "date": "2021-06-06",
        "kind": "government-priorities",
        "fieldwork": {"start": "2021-05-30", "end": "2021-05-31"},
        "questionHe": "אם תקום ממשלה חדשה, מבין הנושאים הבאים מהו, לדעתך, הנושא החשוב ביותר שיהיה עליה לטפל בו?",
        "questionEn": "Which listed issue should a new government prioritise?",
        "questionNote": "Hebrew question transcribed from S06 body; English is a project paraphrase. Exact English instrument: S07 Q4, p.2. Single choice from supplied menu; linked original retains exact wording.",
        "answers": [
          {"labelHe": "סגירת הפערים החברתיים-כלכליים", "labelEn": "Reducing socioeconomic inequality", "pct": 27.7},
          {"labelHe": "המשא ומתן עם הפלסטינים", "labelEn": "Talks with Palestinians", "pct": 10.4},
          {"labelHe": "האיום האיראני", "labelEn": "Iranian threat", "pct": 8.2},
          {"labelHe": "השקעה וקידום האוכלוסייה הערבית", "labelEn": "Advancement of Israel’s Arab population", "pct": 5.2},
          {"labelHe": "מלחמה בשחיתות", "labelEn": "Anti-corruption efforts", "pct": 8.0},
          {"labelHe": "הגברת האחדות בעם", "labelEn": "Promoting social unity", "pct": 28.9},
          {"labelHe": "אחר", "labelEn": "Other", "pct": 6.5},
          {"labelHe": "לא יודע/ת", "labelEn": "Don't know", "pct": 5.2}
        ],
        "method": {"producer": "IDI Viterbi Center; fieldwork: Midgam", "population": "Israel residents aged 18+, national adult sample as described by publisher", "sampleSize": 765, "hebrewInterviews": 615, "arabicInterviews": 150, "mode": "Internet and telephone supplements", "denominator": "General Public column, not Jewish subsample", "reportedMaximumSamplingErrorPct": 3.59, "reportedConfidenceLevelPct": 95, "weighting": "Not specified in inspected topline; no reweighting performed"},
        "cites": [
          {"source": "S07", "quote": "Closing the socioeconomic gaps"},
          {"source": "S06", "quote": "בין התאריכים 30-31/5/2021"}
        ],
        "verification": {"status": "single-source", "independentFamilies": ["F-idi-may2021"], "display": "sources-only", "reason": "Primary topline and IDI article are the same survey, not independent samples."},
        "notes": ["Survey and publication both precede 13 June investiture. Fieldwork follows the May fighting; not a campaign priority question or proof of election motives. Percentages total 100.1 because of published rounding. Answer labels are project translations/paraphrases of S07 categories, not certified original questionnaire options."]
      }
    ]
  }
}
```

### k25 — 2022

```json
{
  "scopeExtensionVersion": 1,
  "electionId": "k25",
  "status": "pilot",
  "reviewedAt": "2026-11-07",
  "sourceRegistryRef": "docs/research/after-election-scope.md#5-source-archive",
  "negotiations": {
    "items": [
      {
        "id": "k25-levin-public-position",
        "date": "2022-11-09",
        "type": "position-stated",
        "actor": "Yariv Levin / יריב לוין",
        "letters": "מחל",
        "basis": "attributed-public-statement",
        "textEn": "Levin said proposed legislation would be presented once coalition agreements were reached.",
        "textHe": "לוין אמר שהצעת חוק תוצג לאחר הגעה להסכמות קואליציוניות.",
        "cites": [{"source": "S05", "quote": "הצעת חוק מסודרת"}],
        "verification": {"status": "single-source", "independentFamilies": ["F-n12-nov9-report"], "display": "sources-only", "reason": "One report inspected; no second independent account. Original subsequently bot-challenged."},
        "notes": ["Report published 9 November, updated 10 November; describes Wednesday consultations. Discussion concerned an override proposal, not enacted legislation. Original statement recording not inspected."]
      },
      {
        "id": "k25-barbivai-participation-position",
        "date": "2022-11-09",
        "type": "position-stated",
        "actor": "Orna Barbivai, Yesh Atid / אורנה ברביבאי, יש עתיד",
        "letters": "פה",
        "basis": "attributed-public-statement",
        "textEn": "At the President's consultations, Barbivai said Yesh Atid would not sit with a person charged with criminal offences.",
        "textHe": "בהתייעצות אצל הנשיא אמרה ברביבאי שיש עתיד לא תשב עם נאשם בעבירות פליליות.",
        "cites": [{"source": "S05", "quote": "לא נשב עם נאשם"}],
        "verification": {"status": "single-source", "independentFamilies": ["F-n12-nov9-report"], "display": "sources-only", "reason": "One report of the consultation; presidential recording/independent reporting not inspected."},
        "notes": ["Stated participation condition in response to a question about a unity government. Preserve attribution; no inference about the merits of charges."]
      },
      {
        "id": "k25-smotrich-reported-portfolio-demand",
        "date": "2022-11-09",
        "type": "reported-demand",
        "actor": "Bezalel Smotrich / בצלאל סמוטריץ׳",
        "letters": "ט",
        "basis": "reporters-account-of-private-talks",
        "textEn": "N12 reported that Smotrich sought the Finance or Defense portfolio in talks with Netanyahu.",
        "textHe": "לפי דיווח N12, סמוטריץ׳ דרש במגעים עם נתניהו את תיק האוצר או הביטחון.",
        "cites": [{"source": "S05", "quote": "או אוצר או ביטחון"}],
        "verification": {"status": "single-source", "independentFamilies": ["F-n12-nov9-report"], "display": "sources-only", "reason": "Private-talk demand as reported by journalists; no authenticated party statement or independent confirmation."},
        "notes": ["Date is report publication, not a verified timestamp for the private utterance. Do not label this an on-record public red line. Shared electoral list ט is not a claim that all its constituent parties made the demand."]
      }
    ]
  },
  "postElectionPolling": {
    "items": [
      {
        "id": "k25-results-satisfaction",
        "date": "2022-12-06",
        "kind": "result-satisfaction",
        "fieldwork": {"start": "2022-11-28", "end": "2022-12-01"},
        "questionHe": "האם אתה מרוצה או לא מרוצה מתוצאות הבחירות האחרונות?",
        "questionEn": "Are you satisfied or dissatisfied with the results of the last election?",
        "questionNote": "S09 Q4, p.1; English is project translation.",
        "answers": [
          {"labelHe": "מאוד מרוצה", "labelEn": "Very satisfied", "pct": 20.6},
          {"labelHe": "די מרוצה", "labelEn": "Fairly satisfied", "pct": 22.6},
          {"labelHe": "לא כל כך מרוצה", "labelEn": "Not very satisfied", "pct": 20.3},
          {"labelHe": "בכלל לא מרוצה", "labelEn": "Not at all satisfied", "pct": 31.6},
          {"labelHe": "לא יודע/ת", "labelEn": "Don't know", "pct": 4.9}
        ],
        "method": {"producer": "IDI Viterbi Center; fieldwork: Midgam", "population": "National adult population in Israel, aged 18+, as described by publisher", "sampleSize": 747, "hebrewInterviews": 600, "arabicInterviews": 147, "mode": "Internet and telephone supplements", "denominator": "כלל המדגם", "reportedMaximumSamplingErrorPct": 3.59, "reportedConfidenceLevelPct": 95, "weighting": "Not specified in inspected article/topline; no reweighting performed"},
        "cites": [
          {"source": "S09", "quote": "האם אתה מרוצה או לא מרוצה מתוצאות הבחירות האחרונות"},
          {"source": "S08", "quote": "בין התאריכים 28/11-1/12/2022"}
        ],
        "verification": {"status": "single-source", "independentFamilies": ["F-idi-nov2022"], "display": "sources-only", "reason": "Article and questionnaire report one survey. Weighting details and independent corroboration remain unverified."},
        "notes": ["Neither a vote-intention poll nor a policy-priority ranking. Published before 29 December investiture. Full distribution preserved; no arithmetic aggregation presented as an original response category."]
      },
      {
        "id": "k25-negotiation-proposal-legal-advisers",
        "date": "2022-12-06",
        "kind": "negotiation-policy-attitudes",
        "fieldwork": {"start": "2022-11-28", "end": "2022-12-01"},
        "questionHe": "האם אתה תומך או מתנגד למינוי יועצים משפטיים למשרדים כמשרות אמון?",
        "questionEn": "Several proposals were raised in coalition negotiations. Do you support or oppose each proposal: appointing ministry legal advisers as positions of trust of each minister?",
        "questionNote": "Both displayed question texts are project paraphrases; exact Hebrew common coalition-negotiation lead-in and Q8 wording are at S09 pp.2–3. One of seven separately rated proposals, not a single-choice priority menu.",
        "answers": [
          {"labelHe": "מאוד תומך", "labelEn": "Strongly support", "pct": 11.6},
          {"labelHe": "די תומך", "labelEn": "Somewhat support", "pct": 27.7},
          {"labelHe": "די מתנגד", "labelEn": "Somewhat oppose", "pct": 18.5},
          {"labelHe": "מאוד מתנגד", "labelEn": "Strongly oppose", "pct": 15.3},
          {"labelHe": "לא יודע/ת", "labelEn": "Don't know", "pct": 26.7}
        ],
        "method": {"producer": "IDI Viterbi Center; fieldwork: Midgam", "population": "National adult population in Israel, aged 18+, as described by publisher", "sampleSize": 747, "hebrewInterviews": 600, "arabicInterviews": 147, "mode": "Internet and telephone supplements", "denominator": "כלל המדגם", "reportedMaximumSamplingErrorPct": 3.59, "reportedConfidenceLevelPct": 95, "weighting": "Not specified in inspected article/topline; no reweighting performed"},
        "cites": [{"source": "S09", "quote": "משרות האמון"}],
        "verification": {"status": "single-source", "independentFamilies": ["F-idi-nov2022"], "display": "sources-only", "reason": "One original survey. No independent sample reproducing this exact question/distribution was established."},
        "notes": ["Published percentages total 99.8, retained without normalisation. This illustrates the format, not a politically representative selection of proposals. Before page use audit all seven items together and choose a declared selection rule. The question's premise does not by itself establish that a party signed or enacted the proposal."]
      }
    ]
  }
}
```

## 4. Feasibility and effort for all 26 elections

The following are **planning estimates**, not measured productivity or claims of source completeness. Assumption: reuse existing formal timelines, add bounded all-list negotiation coverage (roughly 6–12 material milestones where sources support them), up to 1–3 suitable surveys, and review term selection. Hours include acquisition, claim checks, bilingual copy and a second editorial pass; exclude paid access, travel, microdata analysis, application work and digitising whole archives. Each budget ends with a documented gap if access prevents verification.

| Election | Formation/negotiation outlook | Post-election polling outlook | Research hours |
| --- | --- | --- | --- |
| k1 1949 | Archival formation; presidential transition needs careful dating | No qualifying numerical observation verified | 20–32 |
| k2 1951 | Archival negotiations and later government changes | Sparse Guttman/press leads only | 18–30 |
| k3 1955 | Archive and contemporary party/press comparisons | Sparse leads only | 18–30 |
| k4 1959 | Archive plus plenum/gazette anchors | Sparse leads only | 18–30 |
| k5 1961 | Archive plus plenum/gazette anchors | Sparse leads only | 18–30 |
| k6 1965 | Formation plus term coalition changes | Sparse leads only | 18–30 |
| k7 1969 | Archive and IPU/context histories | INES phases; post-election timing/toplines need checks | 16–26 |
| k8 1973 | Wartime election/formation; careful phase dating | INES phases not interchangeable across war | 18–30 |
| k9 1977 | Existing pilot useful; demands/agreements still archival | INES leads; do not assume all phases post-election | 16–26 |
| k10 1981 | Archive, presidential files, dated press | INES and commercial leads; original tables needed | 14–24 |
| k11 1984 | Rotation and national-unity agreements need document detail | INES/press; selective feasible | 18–30 |
| k12 1988 | Formation and later failed/changed coalitions | INES panel/phase distinction; press leads | 16–26 |
| k13 1992 | Archive/press plus signed-document recovery | INES/press; original post-election distributions needed | 14–24 |
| k14 1996 | Direct-PM path, no invented nomination round | PM versus Knesset questions; known issue table not automatically post-election | 14–24 |
| k15 1999 | Direct-PM path; 2001 PM election within same Knesset | Explicit INES post instrument; extra 2001 phase separate | 18–30 |
| k16 2003 | Online press plus original coalition instruments | INES/IDI annual; fieldwork fit needed | 12–20 |
| k17 2006 | Online press; PM/government continuity | INES/IDI, commissioned-poll leads | 12–20 |
| k18 2009 | Digital formation and agreements | Selective post-election polling likely retrievable | 10–18 |
| k19 2013 | Digital statements and agreements | INES/IDI/commercial, method checks | 10–18 |
| k20 2015 | Digital formation, later coalition entry separate | INES/IDI/commercial, method checks | 10–18 |
| k21 Apr 2019 | Failure and dissolution, no new government | Monthly IDI/INES; distinguish from next campaign | 12–22 |
| k22 Sep 2019 | Two mandates/Knesset-stage failure | Monthly IDI/INES; distinguish from next campaign | 12–22 |
| k23 2020 | Negotiated rotation and legal prerequisites | Monthly IDI/INES, pandemic timing | 14–24 |
| k24 2021 | Rich digital sources; this pilot covers a late-May slice | May primary survey verified; full coverage unfinished | 12–20 |
| k25 2022 | Rich digital sources, many partial/final agreements | November primary survey verified; full term much larger | 16–28 |
| k26 2026 | Open formation/term; initial cut-off record only | Current-wave availability needs continuous checks | 8–14 initial |

**Total: 382–646 researcher-hours**, approximately 10–17 full-time 40-hour weeks before access delays. This is a bounded initial edition, not an exhaustive history. A smaller first delivery concentrating k21–k25 would be about 66–116 hours under these assumptions. A formation-only subset would cost less but would omit the owner's term-context requirement. Pre-1969 all-list speech recovery could exceed the ranges or remain incomplete despite spending them.

Prioritise k24/k25 verification and all-party coverage first; expand to k21–k23, then digital-era k16–k20, then archival eras. Do not hold every election hostage to the weakest historical survey evidence: show an explicit evidence gap and retain the rest of the sourced history. k26 requires follow-up after real milestones; no honest one-off budget can complete a still-open term.

## 5. Source archive

Research objective: preserve the exact sources behind the expanded-scope pilot and the distinctive access/method limits. IDs are local to this document. `kind` follows the existing draft vocabulary; all `accessed` dates are **2026-11-07**. Public accessibility applies unless an individual limit says otherwise. Editorial quality is judged claim by claim, not treated as neutrality certification.

### Negotiations

### S01 · [Bennett announces work toward a government with Lapid](https://www.mako.co.il/news-politics/2021_q2/Article-8c6fff8042eb971027.htm)

- Metadata: N12; `secondary`; published 2021-05-30; Hebrew. Read relevant article passages via web reader and original HTML fetched with specified User-Agent.
- **Contribution**: Dated public statement of Bennett's formation intention; also reports Netanyahu's response. Supports k24-bennett-lapid-position, not subsequent agreement/implementation.
- **Limit**: The address is the underlying evidence family F-bennett-address. Reporting a speech does not verify accusations made in it.

### S02 · [Bennett: working toward a government with Lapid](https://www.calcalist.co.il/local_news/article/H1lswN11c00)

- Metadata: Calcalist, credited ynet/Calcalist; `secondary`; published 2021-05-30 20:32; Hebrew; original HTML and relevant passages inspected.
- **Contribution**: Retains the explicit Lapid attribution in Bennett's address.
- **Relation**: Same underlying speech as S01; not counted as another independent confirmation. This outlet's shared ownership/editorial relationship with Ynet is retained.

### S03 · [Netanyahu's three-way rotation proposal](https://www.mako.co.il/news-politics/2021_q2/Article-35d83e3cbdbb971027.htm)

- Metadata: N12, Amit Segal; `secondary`; published/updated 2021-05-30; Hebrew; original HTML and relevant body inspected.
- **Contribution**: Reports the proposal and Sa'ar's refusal. F-rotation-proposal and F-saar-response are separate claims/documents; neither is independently authenticated here.
- **Disagreement**: Gives Bennett 1¼ years; S04 body says 1½. Pilot omits the conflicting duration, preserving the common three-way proposal.

### S04 · [Netanyahu proposed a rotation; Sa'ar refused](https://www.ynet.co.il/news/article/ryyrQjl500)

- Metadata: Ynet, Moran Azulay; `secondary`; public response embedded with 2021-05-30 date; exact article publication timestamp not recovered from reader text. Original HTML/body inspected.
- **Contribution**: Embedded dated Sa'ar response and description of signed commitment letter; independently bylined journalism, but common statement/letter provenance prevents a two-family promotion claim here.
- **Limit**: Embedded tweet and letter were not separately authenticated. Reported private offers preceded the public reporting date. Motive speculation is excluded.

### S05 · [Formation talks: portfolios and public consultation statements](https://www.mako.co.il/news-israel-elections/election_2022/Article-2d60f5ca6bd5481027.htm)

- Metadata: N12, Dafna Liel and Yaron Avraham; `secondary`; published 2022-11-09 22:28, updated 2022-11-10 00:58; Hebrew. Relevant full article passages inspected through the web reader **before** a direct request returned a Radware block page (HTTP 200). Direct original thereafter treated as inaccessible; no retries/bypass.
- **Contribution**: Separates reporters' account of Smotrich's private portfolio demand from on-record Levin and Barbivai statements at consultations. All three remain single-source.
- **Limit**: No original recording, party transcript or second independent report inspected. A search-readable page and HTTP success are not proof of unobstructed original access. Pilot's three entries share F-n12-nov9-report.

### Surveys

### S06 · [May 2021 Israeli Voice: new-government priorities](https://www.idi.org.il/articles/34614)

- Metadata: IDI, Tamar Hermann and Or Anabi; `academic` (research-institute primary survey publication, not claimed peer-reviewed); published 2021-06-06; Hebrew. Relevant question and methodology read in original HTML/web reader.
- **Contribution**: Hebrew priority question heading; fieldwork 30–31 May, 615 Hebrew/150 Arabic interviews, mode and reported uncertainty. Source for timing/population of k24-may-government-priorities.
- **Relation**: F-idi-may2021, same data as S07/S10; not independent corroboration. Bilingual questionnaire/option fidelity still needs editorial review.

### S07 · [May 2021 full question/results table](https://en.idi.org.il/media/16382/israeli_voice_index_data_2105_eng-first.pdf)

- Metadata: IDI; `academic`; May 2021 survey, individual PDF release date not established; English; Q4 p.2 and method p.3 inspected via web PDF reader; original PDF fetched with required User-Agent.
- **Contribution**: Complete national Q4 answer distribution, including other/don't know, and method. Published values total 100.1; no normalisation performed.
- **Limit**: Same F-idi-may2021. English PDF used for complete numeric table after Hebrew-first article inspection. Hebrew answer labels in pilot are identified translations, not silently certified originals.

### S08 · [November 2022 Israeli Voice report](https://www.idi.org.il/articles/46625)

- Metadata: IDI, Hermann/Anabi; `academic`; published 2022-12-06; Hebrew; relevant article and method passages inspected in original HTML/web reader.
- **Contribution**: Explicitly identifies first survey after the election; method: 28 November–1 December, 600 Hebrew/147 Arabic interviews, internet/telephone, national adult population, publisher-reported ±3.59% at 95% confidence. Supports the method used in both k25 observations.
- **Limit**: One F-idi-nov2022 dataset with S09. The article's interpretations and political labels are not imported into project copy.

### S09 · [November 2022 full Hebrew question/results table](https://www.idi.org.il/media/18826/israeli-voice-index-november-2022-heb-data.pdf)

- Metadata: IDI; `academic`; November 2022 survey, individual PDF release date not established; Hebrew. Q4 p.1, common proposal lead-in/Q8 pp.2–3 read via web PDF reader. Original downloaded with required User-Agent.
- **Contribution**: Complete national satisfaction distribution and ministry-legal-adviser proposal ratings. The table header order must be read correctly: national figures are not the Jewish or Arab column. Q8 crosses a page boundary; “strongly oppose” is 15.3, not adjacent subgroup 15.5/14.1.
- **Limit**: Same F-idi-nov2022. Questionnaire premise is not independent evidence of actual party conduct. Q8 sums to 99.8; rounding retained.

### S10 · [May 2021 Hebrew full report](https://www.idi.org.il/media/16368/israeli_voice_index_2105_heb.pdf)

- Metadata: IDI; `academic`; May 2021 edition, PDF release date not established; Hebrew. Opened PDF text; original downloaded with required User-Agent. Inspection limited to summary/context, not certification of every chart.
- **Contribution**: Confirms the Hebrew edition distinguishes national threats from new-government priorities. That distinction prevents relabelling one construct as another.
- **Relation**: F-idi-may2021; not another survey or independent proof of exact S07 figures.

### Archive routes and other considered material

### A02 · [Viterbi/Guttman centre](https://www.idi.org.il/centers/1123)

- Metadata: IDI; `academic`; current archive/centre page, publication date unspecified; Hebrew; relevant centre description read in original HTML/web search.
- **Contribution**: Identifies Viterbi as the former Guttman centre and a route to preserved empirical public-opinion research. It does not establish a formation-poll series for every historical election.

### Inspected; no distinctive additional contribution

- [English version of May 2021 article](https://en.idi.org.il/articles/34615) — same survey as S06/S07; opened, then preferred the Hebrew article.
- [N12 May 2021 reactions roundup](https://www.mako.co.il/news-politics/2021_q2/Article-d6adfeff0deb971027.htm) — opened; same Bennett address, useful only as discovery route to S01.
- [IDI December 2022 report/press release](https://www.idi.org.il/articles/47058) — search-returned substantive text only; fieldwork 26–28 December is distinct from November wave. Not used in pilot; a full questionnaire was not inspected.

- [April 2021 IDI full data](https://www.idi.org.il/media/16292/israeli_voice_index_data_2104_heb.pdf) and [report](https://www.idi.org.il/media/16291/israeli_voice_index_2104_heb-final.pdf) — web-extracted relevant text inspected, but original with specified User-Agent not fetched. Retained as expansion leads: fieldwork 26–28 April, satisfaction/formation questions; not admitted to pilot.

### Surfaced but not inspected as substantive originals

- [INES catalogue](https://socsci4.tau.ac.il/mu2/ines/data/our-data/) — direct connection reset. Prior repository survey audit supplies the historical leads; no fresh catalogue validation claimed.
- [Knesset RIC portal](https://main.knesset.gov.il/activity/info/research/pages/default.aspx) — HTTP 247, no substantive text. Search RIC as a locator for referenced surveys, not as an original continuous polling series.
- [NLI Historical Jewish Press](https://www.nli.org.il/he/discover/newspapers/jpress) — HTTP 403. No historical newspaper issue retrieved in this pass.
- [May 2021 shorter Hebrew report](https://www.idi.org.il/media/16376/israeli_voice_index_2105_heb.pdf) — search text only; not interchangeable with S10 without version comparison.
- [Zman Israel, 4 May 2021 coalition-preference poll](https://www.zman.co.il/live/218743/) — search text only; 43/33/24 lead not admitted without original commissioner publication/question/method. A repeated number is not corroboration.

Search engines also returned unrelated articles and Wikipedia results. No Wikipedia result was opened, used, linked or recommended as evidence. Incidental result slots are not source reviews.

## 6. Evidence accounting, challenge pass and handoff

The pilot's stable `id` is its claim ID; text/question/answers define the proposition. `cites` supplies supporting sources, source cards carry publication/access/inspection metadata and underlying families, and verification/notes preserve limits. This is the compact claim ledger; a duplicate ledger is unnecessary. Web search was discovery; source reading and original HTTP downloads were distinct access methods. Original HTTP requests used `israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)`. Hosted web tools do not expose their transport User-Agent, so compliance cannot be asserted for their requests. No paywall/login/challenge bypass, IP rotation or 429 retry occurred.

Observed retrieval accounting: 14 distinct URLs in the direct-original batch: 10 readable original article/PDF downloads (S01–S04, S06–S10, A02), 2 challenge/empty responses (S05, RIC), and 2 failures (INES reset, NLI 403). S09 was also fetched once before that batch. A successful HTTP status was not equated with readable content. These counts describe direct-original retrieval, not independent-source totals. Search-result counts, total web pages, PDF byte coverage and elapsed research hours were not measured. Original PDF page counts exposed by the web reader: S07 3, S09 5, S10 8; this does not mean every page was read. All accepted excerpts, figures, URLs, fieldwork parameters and conflicts are retained here; downloaded working copies/scripts belong in ignored `.backup-scratch/r2-scope/`.

| Conclusion | Criterion/status | Supporting/contextual claims | Challenge/gap | Confidence and what would change it |
| --- | --- | --- | --- | --- |
| C1: negotiation context belongs beside formal acts | Owner expressly requests it: met | Owner item 5; existing formal drafts; six negotiation pilot IDs | Earlier all-or-none reaction policy could prevent incremental publication | High for scope; coverage protocol is proposed. Owner may set stricter completeness gate. |
| C2: useful post-election surveys exist for both pilots | Full original table plus question/method/timing: met with holds | k24-may-government-priorities; both k25 poll IDs; S06–S09 | Weighting details missing; each is one evidence family; Hebrew-option review pending for k24 | High that published tables exist; no promotion eligibility claimed. Original weighting/questionnaire documentation and independent evidence would resolve holds. |
| C3: reporting requires an independence and status gate | Avoid false corroboration and enacted-policy claims: met | All verification fields; S01/S02 common address, S03/S04 duration disagreement, S05 private-talk attribution | Two newsroom articles could contain independent firsthand work; not established here | High for conservative current status; promote individual claims only with inspected evidence demonstrating independence. |
| C4: all 26 can receive bounded context, not uniform polling completeness | Honest acquisition routes/gaps: mixed | Existing era/issue/polling audits; §4 estimates; actual archive failures | Early-era originals, historical post phases, complete faction coverage and k26 future unavailable/not yet searched | Moderate for acquisition strategy; low-to-moderate for hours, judgement-based. Timed archival sample and restored authorised access could substantially change estimates. |

Counterevidence deliberately checked: shared ownership/syndication; the rotation-duration conflict; publication versus fieldwork date; subgroup/national column reversal; priority versus preference questions; private demand versus on-record speech; challenge pages returning HTTP 200; old reaction policy versus updated owner scope. None is silently resolved in favour of a fuller-looking page.

**Remaining research work:** verify S05 with an accessible original and independent account/recording; recover signed coalition agreements and annex/signature/deposit dates for both pilots; complete the faction-by-phase coverage table; retrieve poll weighting and original Hebrew option text; inspect additional formation-support/vote-intention polls without relying on aggregator snippets. No claim that every signed agreement or all negotiation phases were collected here. Existing k24/k25 institutional timelines and term events were read as context, not recertified by this scope research.

**Owner questions (not blockers for this research):**

1. Should authentic primary survey tables be eligible on their own, explicitly labelled as one survey, or should the current two-independent-source gate keep them in Sources? Under the latter rule most exact historical survey distributions will never qualify through mere news repetition.
2. Is phased publication acceptable once every seated list has a recorded search/coverage status, with verified material negotiation statements added as found, or should the page wait for complete all-list coverage in every phase? The pilot proposes the former and makes no assumption of approval.

The already agreed new tab and Sources-only treatment of single-source events are not reopened. No technical uncertainty is referred to the owner for factual ratification.

Verification: both embedded JSON fragments parsed; all nine claim IDs and citation source IDs checked; sample/language totals and published answer sums checked with rounding preserved; ballot letters checked against the corresponding election dataset; 26 effort rows summed to 382–646 hours; local links and `git diff --check` checked. No application tests/build run because only this research Markdown file changed.
