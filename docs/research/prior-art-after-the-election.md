# Prior art: what happened after the election

Research date: 5 November 2026. Scope: presentation precedents for an Israeli elections explorer covering 1949–2026, not a verified historical dataset or an implementation. Recommendation order reflects applicability to this app, not a ranking of publishers' political neutrality.

**Finding:** combine the President's dated faction announcements, IDI's election-to-government narrative, parliament sites' procedural steps, and Parlement.com's separate formation and cabinet records. Keep factual chronology distinct from attributed interpretation. No surveyed source establishes a single complete template for all four requested subjects across every Israeli election.

## Method and evidence boundaries

- Used direct `curl` and the explicitly permitted Jina `read_url`. Direct HTTP requests used `User-Agent: israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)`. Jina's outbound headers are not exposed by its tool; their User-Agent could not be verified. No email was supplied in requests.
- Jina search required an unconfigured API key; Exa was not exposed among available tools. Search-engine discovery through curl was largely unproductive, so discovery mainly followed publishers' navigation, date archives, and linked URLs. Search snippets are not evidence for findings below.
- Every URL below was actually requested. “Retrieved” means substantive text was returned and inspected; “partial” means only a shell, metadata, or index was available. Failures are explicitly “not retrieved.” No login, CAPTCHA solution, paywall bypass, or proxy rotation was used. No English Wikipedia page was opened, cited, or linked; no Hebrew Wikipedia was used.
- This is text/HTML research, not a rendered visual audit. Graphic claims distinguish captions, HTML image references, and tool documentation from visually inspected geometry. No claim of exhaustive coverage, complete archival availability, or live historical correctness is made.
- Source IDs below serve as a compact evidence ledger: each records URL, provenance, inspection boundary, observed structure, graphics, neutrality practice, and implication. Pages from one publisher, translated versions, and articles about one event do not count as independent corroboration. Full academic chapters were not retrieved.

## Israel

### S01 — IDI, English elections and parties portal [research institute; retrieved]
- URL: https://en.idi.org.il/israeli-elections-and-parties/
- Shows / structure: party and election-year selectors, then a government overview and minister/position/party tables. The 37th-government introduction connects the 2022 result, presidential assignment, negotiations, and swearing-in; cabinet membership carries an explicit November 2025 reference date.
- Graphics: structured tables; no recommendation chart identified in the extracted content.
- Neutrality technique / limitation: exact offices, names, parties and an as-of date anchor the record, but the introduction also comments on negotiation duration. The older cabinet snapshot must not be represented as current in November 2026.
- App takeaway: give each government a compact factual identity card with its own effective date, separate from election results.

### S02 — IDI, 2021 election profile [research institute; retrieved]
- URL: https://en.idi.org.il/israeli-elections-and-parties/elections/2021/
- Shows / structure: background to the election → previous failed formations → 2020 government and dissolution → 2021 result → unsuccessful Netanyahu attempt → Lapid negotiations and Bennett/Lapid arrangement → early election; then election metrics and party results.
- Graphics: results table and numerical summary blocks; no recommendation-round visualization established.
- Neutrality technique / limitation: named institutions and chronological transitions make the sequence legible. However, the narrative attributes motives and advocates electoral-system reform; it is not a dates-only neutral template.
- App takeaway: copy the continuity between successive elections, while rewriting evaluative claims as sourced attribution or omitting them.

### S03 — IDI, Hebrew 2022 election profile [research institute; retrieved]
- URL: https://www.idi.org.il/policy/parties-and-elections/elections/2022-1/
- Shows / structure: previous government's composition and parliamentary erosion → early election and change of PM → changes in electoral lists → result and governing majority; then metrics, party table and related articles/video.
- Graphics: votes/seats/share table, headline numbers, embedded video reference; no verified nominee graphic.
- Neutrality technique / limitation: identifies factions and institutional outcomes; related items distinguish overview from opinion. The main account nevertheless uses evaluative instability/governability language.
- App takeaway: connect “why the next election happened” to observable parliamentary changes, preserving source labels for analysis.

### S04 — IDI, President's role in government formation [named expert explainer; retrieved]
- URL: https://en.idi.org.il/articles/67022
- Shows / structure: nine numbered questions covering assignments, deadlines, presidential discretion, recommendations, historical examples, deadlock, comparison and judicial review. Homepage dates it 3 November 2026 and names Ofer Kenig and Dana Blander.
- Graphics: HTML identifies a formation-flowchart image; text captions identify a 2019–2022 assignment comparison with green for successful and yellow for unsuccessful attempts, credited to Blander/Kenig (2024), p.137. Exact visual layout was not inspected.
- Neutrality technique / limitation: distinguishes statutory requirements from convention, uses named historical counterexamples, cites judgments and presents competing views of discretion. Normative discussion is identified as debate rather than an agreed rule.
- App takeaway: recommendations, presidential assignment, and investiture are different events; the largest party or most-recommended nominee does not automatically become PM.

### S05 — IDI, Israeli Democracy Index 2024 [survey publication; landing page and PDF text retrieved]
- URLs: https://en.idi.org.il/publications/57313 ; https://en.idi.org.il/media/27509/israel-democracy-index-2024-e_for_web_17-2-2025.pdf
- Shows / structure: principal findings → introduction and methodology → thematic chapters on democracy/institutions, society, security and international indicators → questionnaire, response distributions, historical comparisons and sample breakdown. Landing page lists publication year 2025; PDF is the 2024 index.
- Graphics: numbered survey figures with question/topic, population and year-range captions; historical trust series and subgroup comparisons; appendix tables. Pixel-level chart forms were not verified.
- Neutrality technique / limitation: denominators, Jewish/Arab sample labels, question wording, methodology, weighting and “don't know” categories make interpretation auditable. This is public-opinion evidence, not an official event chronology or government performance score.
- App takeaway: any term-context survey must retain fieldwork/year, population, question and source; do not turn it into an editorial verdict on the term.

### S06 — President's Residence, recommendation announcements [official; homepage text retrieved]
- URL: https://president.gov.il/
- Shows / structure: date-stamped news cards with highly specific headlines naming the faction and recommended candidate. On the retrieved homepage, 4–5 November 2026 cards distinguish recommendations for named candidates from an explicit decision not to recommend any MK.
- Graphics: news cards and video references; no consolidated seat-weighted tally or all-rounds tracker was retrieved.
- Neutrality technique / limitation: repetitive faction/action/candidate phrasing, announcement dates, and explicit non-recommendation. Homepage cards are a changing selection, not proof of a complete round; individual announcement pages were not retrieved. Direct curl encountered a JavaScript security redirect; Jina had already returned substantive text, and no challenge was solved.
- App takeaway: store each recommendation with faction, round, announcement date and direct evidence; distinguish explicit non-recommendation from unreported or not-yet-consulted.

### S07 — Knesset, all governments [official; partial]
- URL: https://main.knesset.gov.il/mk/government/Pages/governments.aspx
- Shows / structure: official “Governments of Israel” page title and navigation to coalition agreements and government guidelines; underlying government records did not appear in the returned text.
- Graphics: not established; government date/coalition tables **not retrieved**, despite the page shell opening.
- Neutrality technique: institutional navigation is verified; row wording and historical record structure cannot be assessed from this retrieval.
- App takeaway: an authoritative candidate for checking dates and coalition membership, but this research does not verify its table fields or completeness.

### S08 — Knesset Lexicon [official; partial]
- URL: https://main.knesset.gov.il/About/Lexicon/Pages/default.aspx
- Shows / structure: Knesset navigation shell; no substantive lexicon definition of government formation was retrieved.
- Graphics / neutrality technique: **not retrieved** for the requested material; no inferred description of a lexicon entry.
- App takeaway: do not cite the generic shell as support for a procedural rule.

### S09 — Israel State Archives [official; not retrieved]
- URLs attempted: https://archives.gov.il/ ; https://www.archives.gov.il/
- Shows / structure / graphics / neutrality technique: **not retrieved**. Jina reported DNS resolution failure for the bare host; direct curl to the www host returned a CloudFront 403 block. No formation exhibition, publication, or archival item was inspected.
- App takeaway: archival facsimiles remain an evidence gap, especially for early elections; do not infer missing recommendation rounds from modern practice.

## Reference works

### S10 — Oxford Handbook of Israeli Politics and Society [academic publisher; description/contents retrieved]
- URL: https://global.oup.com/academic/product/the-oxford-handbook-of-israeli-politics-and-society-9780190675585
- Shows / structure: introduction; society; institutions; international relations; political issues. Relevant chapters separately cover political history, wars, executive branch, electoral system and parties. Publisher lists the hardcover publication as 15 February 2021.
- Graphics: chapter graphics **not retrieved**; publisher metadata and contents are not evidence of an aftermath visualization.
- Neutrality technique / limitation: named specialist authors and a stated commitment to presenting opposed narratives. This is a thematic handbook, not a volume with one election-aftermath chapter; chapter-internal claims were not inspected.
- App takeaway: keep event chronology, institutional explanation and interpretation conceptually separate; do not claim this handbook supplies a standard aftermath template.

### S11 — Arian and Shamir, The Elections in Israel 1988 [academic publisher; contents retrieved]
- URL: https://www.routledge.com/The-Elections-In-Israel1988/Arian-Shamir/p/book/9780367307110
- Shows / structure: campaign/context and voting analyses; groups and parties; change over time; a final government-formation grouping with chapters on national-unity governments/domestic politics and mutual veto in the national coalition.
- Graphics: chapter figures **not retrieved**. Publisher's modern format/reissue dates must not be mistaken for the election year or original research date.
- Neutrality technique / limitation: separates empirical subjects and analytical arguments into attributed chapters; full aftermath chapters were not opened, so their internal organization is unknown.
- App takeaway: government formation deserves a distinct subsection after results rather than a footnote to the winning party.

### S12 — Shamir and Rahat, The Elections in Israel, 2019–2021 [academic publisher; contents/description retrieved]
- URL: https://www.routledge.com/The-Elections-in-Israel-2019-2021/Shamir-Rahat/p/book/9781032213408
- Shows / structure: opening crisis introduction followed by an explicit chronological overview of the four elections, then thematic parts on personalization and on voters/parties/media. Publisher identifies empirical use of Israel National Election Studies data.
- Graphics: publisher lists 32 black-and-white illustrations; their contents were **not retrieved**.
- Neutrality technique / limitation: chronology is separated from interpretation, with named chapter authors and explicit empirical foundations. Several contributors overlap with IDI, so these sources are not wholly institutionally independent. Only chapter 8 is advertised as open access, under CC BY-NC-ND 4.0; that is not a licence for the entire volume.
- App takeaway: a compact chronology can stand independently of optional analysis, and a failed formation can link forward across multiple elections.

### S13 — Britannica [reference work; not retrieved]
- URL attempted: https://www.britannica.com/place/Israel/Political-and-social-repercussions-of-the-war
- Shows / structure / graphics / neutrality technique: **not retrieved**. Jina returned a temporary domain-level 403 access block; no workaround attempted. No claim is made about this article's actual election or government coverage.
- App takeaway: do not claim Britannica endorses a proposed structure without a retrieved entry.

## Abroad: institutions, histories and journalism

### S14 — Tweede Kamer, elections and cabinet formation [official explainer; retrieved]
- URL: https://www.tweedekamer.nl/zo-werkt-de-kamer/verkiezingen-en-kabinetsformatie
- Shows / structure: six numbered steps: voting, counting/seats, admitting members, finding a coalition, agreeing a programme, selecting ministers/state secretaries. Brief paragraphs explain each step in plain language.
- Graphics: ordered step presentation established in extracted content; no rendered Gantt or elapsed-time graphic inspected.
- Neutrality technique / limitation: role-based verbs and institutional process rather than winners/losers. It simplifies ordinary Dutch practice and is not a rulebook transferable to Israel.
- App takeaway: use short, consistently ordered formation milestones with optional deeper explanation.

### S15 — Parlement.com, general formation guide [specialist parliamentary reference; retrieved]
- URL: https://www.parlement.com/kabinetsformatie
- Shows / structure: role of the chamber → four phases → accountability → historical overview. Separates coalition search, programme, portfolio distribution and personnel; explicitly warns that phases can overlap and describes the change in institutional roles since 2012.
- Graphics: numbered phases and section navigation; no verified Gantt.
- Neutrality technique / limitation: distinguishes rules, convention and historical changes; describes minority cabinets as possible. Parlement.com is a reference publisher, not the Tweede Kamer itself.
- App takeaway: label phases without pretending all negotiations follow one rigid sequence or one unchanging historical procedure.

### S16 — Parlement.com, formations since 1945 [specialist reference; retrieved]
- URL: https://www.parlement.com/kabinetsformaties-sinds-1945
- Shows / structure: one short entry per year/formation, naming parties, outcome and failed alternative combinations; includes governments formed between elections.
- Graphics: chronological index rather than a verified proportional time graphic.
- Neutrality technique / limitation: repeatable compact summaries and explicit failed attempts support comparison. Adjectives describing difficult/quick formations still appear, so this is not purely dates-only.
- App takeaway: support several governments per parliamentary term and a “no government formed” outcome per election.

### S17 — Parlement.com, 2021–2022 formation [specialist reference; retrieved]
- URL: https://www.parlement.com/kabinetsformatie-2021-2022
- Shows / structure: separate sections for exploration, information, formation and evaluation; individual negotiator headings include start/end dates, including separate assignments to the same person. Links point to interim/final reports and coalition agreement documents.
- Graphics: dated episode headings and document links; no verified Gantt geometry.
- Neutrality technique / limitation: attributes recommendations and conclusions to the relevant informateur, rather than making all assessments the site's own. Official linked reports were not independently opened here.
- App takeaway: each mandate or extension needs its own event/interval and outcome, even when the person remains unchanged.

### S18 — Parlement.com, 2023–2024 formation [specialist reference; retrieved]
- URL: https://www.parlement.com/kabinetsformatie-2023-2024
- Shows / structure: negotiator-specific narrative → evaluation → overview table with date/action/person/end date/days → coalition and non-coalition seats by chamber.
- Graphics: tabular mandate intervals and coalition-support totals, directly reusable as information architecture for a timeline.
- Neutrality technique / limitation: explicit duration-counting footnote and separation of coalition from other parties. **Counterevidence:** retrieved lead says 223 days, but the table's total says 221; a formateur row's end date/day count also appears inconsistent. Do not copy these duration figures as verified facts.
- App takeaway: retain underlying dates and counting convention, flag conflicting values, and calculate displayed durations from checked events.

### S19 — Parlement.com, Rutte III term [specialist reference; retrieved]
- URL: https://www.parlement.com/kabinet-rutte-iii-2017-2022
- Shows / structure: formation/agreement/policy statement → term dates and caretaker interval → ministers and changes → parliamentary seat snapshots → legislation → thematic national events → annual speeches.
- Graphics: date/duration table and coalition-seat tables at named dates; no verified graphical term timeline.
- Neutrality technique / limitation: dated actions distinguish term, resignation and replacement; policy aims are distinguishable from subsequent events. Its prose and date table contain apparent inconsistencies, so it is a structural precedent, not a checked dataset.
- App takeaway: give the government's lifespan, caretaker phase, changing support and selected national events separate fields; election day does not necessarily end its tenure.

### S20 — German Bundestag, election of the chancellor [official; retrieved]
- URL: https://www.bundestag.de/en/parliament/function/chancellor
- Shows / structure: short institutional explanation of presidential nomination, secret parliamentary vote, required majority, appointment and oath; then constructive no-confidence replacement.
- Graphics: photograph caption, no formation tracker established.
- Neutrality technique / limitation: defines who acts and what decision follows. This page concerns Germany's institutional procedure, not Israel's rules or an election-specific timeline.
- App takeaway: identify the actor and legal/institutional act for every milestone; nomination and appointment are separate.

### S21 — Swedish Riksdag, forming a government [official; retrieved]
- URL: https://www.riksdagen.se/en/how-the-riksdag-works/democracy/forming-a-government/
- Shows / structure: reasons a government ends → Speaker's party talks and exploratory assignment → proposal and parliamentary vote → repeated attempts → ministers, policy statement and formal transfer. Caretaker status and reshuffles are explained separately.
- Graphics: nested explanatory headings; no rendered timeline verified.
- Neutrality technique / limitation: explicit failure paths and the distinction between a reshuffle and a new government. Describes Sweden's negative-parliamentarism threshold; do not apply it to Israel.
- App takeaway: show unsuccessful attempts and continuity of the outgoing government, not just successful inauguration.

### S22 — Belgian Monarchy, agenda and audience notice [official; retrieved; limited relevance]
- URLs: https://www.monarchie.be/fr/agenda ; https://www.monarchie.be/fr/agenda/audience-1162
- Shows / structure: date-filterable, paginated event list; individual 4 November 2026 notice states who the King received, the party leadership role, approximate time and location.
- Graphics: event cards; no formation tracker, recommendations tally or mandate timeline was retrieved.
- Neutrality technique / limitation: highly standardized institutional statement with no inferred meeting outcome. **This audience is not verified as a formation consultation**; an audience alone does not establish support or a mandate.
- App takeaway: copy concise event metadata; never infer a recommendation merely because a party attended a meeting.

### S23 — BBC, 2021 Israeli government's approval [journalism; retrieved]
- URL: https://www.bbc.com/news/world-middle-east-57462470
- Shows / structure: dated 13 June 2021 outcome and 60–59 vote → expected rotation → reactions → “why” background → government's composition and likely policy disagreements.
- Graphics: photographs/captions in extracted text; no recommendation chart verified.
- Neutrality technique / limitation: names sources of reactions and separates explanatory questions. Report contains commentary and forecasts; planned September 2023 rotation must not be converted into an event that actually happened. The reported 60–59 investiture also cautions against equating all support measures.
- App takeaway: display investiture vote totals independently from coalition-seat totals and the President's recommendations.

### S24 — Guardian, Israeli formation deadline and success notification [journalism; both retrieved]
- URLs: https://www.theguardian.com/world/2021/jun/02/israeli-opposition-parties-face-midnight-deadline-to-form-government ; https://www.theguardian.com/world/2021/jun/02/yair-lapid-israel-president-government-naftali-bennett-benjamin-netanyahu
- Shows / structure: before-deadline status and alternatives; later account records Lapid's notification and stresses that a parliamentary vote and swearing-in are still required. Both use politician Q&A inserts.
- Graphics: photos and expandable biographical Q&As; no verified mandate-duration graphic.
- Neutrality technique / limitation: direct attribution and conditional wording preserve “proposed” versus completed events. Strong adjectives and political descriptions mean this is not a neutral-language model; the articles are one event family, not two independent confirmations.
- App takeaway: distinguish agreement, notification of success, investiture and commencement of office in both labels and dates.

### S25 — Guardian/AFP, Germany: what happens next [syndicated explainer; retrieved]
- URL: https://www.theguardian.com/world/2021/sep/27/germany-election-what-happens-next-as-parties-vie-to-form-government
- Shows / structure: exploratory talks → first meetings → detailed negotiations → failure scenario; explains outgoing-government continuity and which stages lack a deadline.
- Graphics: photograph; no timeline graphic established.
- Neutrality technique / limitation: institutional sequence and conditional scenarios; identifies AFP authorship. It should be treated as the AFP article family, not independent Guardian reporting. Date and legal wording need primary-source verification for substantive use.
- App takeaway: explicitly say when the endpoint is unknown rather than inventing a fixed formation deadline.

### S26 — Guardian, German election results and coalition possibilities [data journalism; retrieved]
- URL: https://www.theguardian.com/world/ng-interactive/2021/sep/26/german-election-results-exit-poll-and-possible-coalitions
- Shows / structure: provisional result summary → seat totals/changes → party descriptions → geographical vote/change displays → electoral-system explanation → sources/methodology.
- Graphics: map legends, vote-share/change displays and seat-summary content verified in extracted text. Exact coalition-bar/hemicycle geometry and interactive controls were **not retrieved/visually verified**.
- Neutrality technique / limitation: distinguishes exit poll, interim and official provisional results; names the federal returning officer and explains that coalition possibilities are the publisher's calculations, not negotiated agreements.
- App takeaway: mathematical coalition possibility, announced support and an actual coalition must have different labels and provenance.

## Graphics and open-source precedents

### S27 — Geoffrey Brossard, d3-parliament [software documentation/licence; retrieved]
- URLs: https://raw.githubusercontent.com/geoffreybr/d3-parliament/master/README.md ; https://raw.githubusercontent.com/geoffreybr/d3-parliament/master/LICENSE
- Shows / structure: README documents a half-circle parliament layout, party seat totals or individual-seat data, and seat-level events. The licence file confirms **MIT**, with copyright/permission notices to be retained.
- Graphics: documented semicircle of individual seat circles. This is a chart primitive, not evidence that a publisher visualizes Israeli recommendations this way; no code was run or installed.
- Neutrality technique: none inherent in the library; ordering, colours and data provenance remain editorial choices.
- App takeaway: a hemicycle could show per-seat recommendation groups, provided faction identities and a text/table equivalent remain available.

### S28 — Daniel Kao, d3-parliament-chart [software documentation/licence; retrieved]
- URLs: https://raw.githubusercontent.com/dkaoster/d3-parliament-chart/master/README.md ; https://raw.githubusercontent.com/dkaoster/d3-parliament-chart/master/LICENSE
- Shows / structure: supports individual and aggregated seat data, colour, sections, gaps and seat geometry; documentation warns that some settings can leave data without coordinates. Licence file confirms **MIT**.
- Graphics: documented semicircular parliament layout with grouping controls, not a formation timeline.
- Neutrality technique: no political neutrality guarantee; seat ordering is a configurable data decision. Maintenance, accessibility, dependency compatibility and fitness were not audited.
- App takeaway: useful implementation precedent, conditional on independently checking all 120 seats are represented and retaining required notices.

| Requested graphic | Evidence actually retrieved | App interpretation / remaining gap |
| --- | --- | --- |
| Seat-weighted horizontal bars by nominee | No publisher example of this exact encoding verified. S06 establishes categorical announcements; S26 establishes seats versus calculated coalition possibilities. | Recommended synthesis, not an observed Israeli precedent: one row per nominee, sum recommending factions' seats, expose faction segments and unknown/no-recommendation separately. |
| Hemicycle coloured by nominee or coalition | S27–S28 explicitly document half-circle seat geometry and arbitrary colour/group data. | Adaptation is feasible in principle; a real newsroom nominee-coloured example was not verified. Avoid implying literal seating positions or ideological order. |
| Formation timeline / Gantt | S17 has dated assignment headings; S18 has start/end/person/duration columns; S04 has a formation-flowchart reference and outcome-colour caption. | A proportional Gantt with distinct mandate/extension intervals is a synthesis. No rendered Gantt was directly inspected. |
| Government-term timeline | S19 separates tenure/caretaker dates, membership changes, seat snapshots and national-event topics. | A term band with dated event markers is a synthesis, not a claimed reproduction of its visual design. |

## Retrieval failures and incomplete requested areas

For every row here, the requested content's structure, graphics and neutrality technique are **not retrieved**; the takeaway is to avoid citing it as substantive evidence. Failures do not prove the material does not exist.

| Source / exact URL requested | Result and boundary |
| --- | --- |
| https://www.gov.il/he/departments/president/govil-landing-page | Error page saying the requested page was not found. |
| https://www.gov.il/he/departments/president | Cloudflare challenge; stopped. Presidency evidence is limited to S06. |
| https://www.idi.org.il/מדיניות-וממשל/בחירות-ומפלגות/ | 404; recovered via the actual Hebrew navigation to S03 and the portal https://www.idi.org.il/policy/parties-and-elections/ . |
| https://www.tweedekamer.nl/kamerleden_en_commissies/kabinetsformatie ; https://www.tweedekamer.nl/zo-werkt-de-kamer/de-kabinetsformatie | Both page-not-found; navigation led to S14. No election-specific official Dutch tracker retrieved. |
| https://www.parlement.com/kabinetsformatie-2021 | Page-not-found; historical index led to the actual 2021–2022 URL, S17. |
| https://www.bundestag.de/en/parliament/function/government | 404; actual chancellor-election page S20 recovered through navigation. No German election-specific formation timeline retrieved. |
| https://www.ft.dk/da/folkestyret/regeringen | Security-verification page; stopped. Danish formation presentation remains unassessed. |
| https://www.monarchie.be/en/monarchy/royal-role | Page-not-found. |
| https://www.monarchie.be/en/agenda | English shell says content is untranslated; French agenda S22 retrieved. A historical Belgian formation tracker remains unassessed. |
| https://academic.oup.com/edited-volume/28052 | Jina 503; direct curl showed a challenge. Target title not verified at this identifier; S10 is the verified publisher page. |
| https://www.reuters.com/world/middle-east/ | Title-only/empty body, no usable article or formation tracker. A Reuters photo credit in another outlet is not Reuters article retrieval. |
| https://www.economist.com/middle-east-and-africa/2021/06/03/israels-opposition-agrees-to-form-a-government | Page-not-found; no Economist formation explainer inspected. No paywall bypass attempted. |
| https://www.bbc.com/news/world-middle-east-57329237 | Direct response identified a not-found page; S23 is the successfully retrieved BBC article. |
| https://www.theguardian.com/world/2021/jun/02/israel-opposition-parties-agree-coalition-to-oust-netanyahu ; https://www.theguardian.com/world/israel-election-2021 | Both page-not-found. Publisher date archive supplied the actual S24 URLs. |
| https://github.com/archaismo/ParliamentDiagram ; https://raw.githubusercontent.com/archaismo/ParliamentDiagram/master/LICENSE ; https://api.github.com/repos/archaismo/ParliamentDiagram | Jina's GitHub-domain temporary block; raw licence and repository API returned 404. No tool/licence claim made for this candidate; S27–S28 are verified alternatives. |

## Ranked recommendations for the app

These are design inferences from the inspected sources, not claims that every source already implements them.

1. **Use four stable subsections:** recommendations; formation; government term; road to the next election. Begin with a one-sentence outcome and dates. Link an election to zero, one or multiple subsequent governments, rather than assuming one-to-one correspondence. Evidence: S02–S03, S11, S16–S19.
2. **Make recommendations a dated, round-specific record.** Show faction, candidate, seat weight at that time, announcement date, source and any correction/withdrawal. Preserve explicit “none,” unknown and pending separately. Never substitute a later coalition for earlier recommendations. Evidence: S04, S06, S22.
3. **Default to a labelled nominee bar plus a faction table.** Use the same 120-seat scale; expose contributing factions and unmapped seats. Explain that recommendation totals are not an investiture vote and do not legally determine the President's assignment. Evidence: S04, S06, S23; exact bar encoding is a proposed synthesis, not a verified publisher precedent.
4. **Build formation chronology around formal acts.** Include consultation rounds, assignment, granted extension, expiry/return, another assignment, parliamentary fallback, success notification, investiture and inauguration when applicable. Record each failed attempt and an explicit no-government outcome. Evidence: S04, S17–S18, S21, S24.
5. **Show a mandate timeline with actual versus allowed time distinguished.** Separate original mandate and granted extensions; display reported deadlines without implying unused time was spent. Define duration endpoints/counting convention and flag unresolved date conflicts. Evidence: S04, S17–S18; Gantt geometry is an inference.
6. **Separate coalition, outside support, recommendations and confidence votes.** Show each with its date and source; allow changes during the term. Use a hemicycle only as an optional alternate view, with a declared ordering and readable table. Evidence: S04, S18–S19, S23, S27–S28.
7. **Give every government its own tenure record.** Record formation, PM changes/rotation, resignation or caretaker transition, and replacement. Keep planned rotations separate from actual handovers. Show the incumbent during failed formations. Evidence: S02, S19, S21, S23–S24.
8. **Select term events by a published, repeatable rule.** Proposed categories: changes in governing authority/support; major enacted institutional/economic measures; wars and major national emergencies; major diplomatic agreements; events directly leading to the next election. Use dated actions and named responsible institutions. This inclusion rule is an editorial proposal informed by S10 and S19, not an explicit universal rule found in the sources.
9. **Explain the next election through the formal trigger first.** State dissolution legislation, automatic dissolution, term expiry or other historically applicable mechanism; give political explanations separately and attribute disputed causes. End with a link to the next election. Evidence: S02–S04, S16, S21.
10. **Attach citations to individual events and claims.** Prefer the announcing institution for what it announced, legal/official records for formal outcomes, and attributed secondary analysis for causes. Publish source date, event date and verification status separately; label an ongoing 2026 process as of a specific date/time. Evidence: S04–S06, S17, S22, S26.
11. **Adopt controlled neutral phrasing and uncertainty labels.** Examples: “Faction A recommended Candidate B”; “The President assigned the task”; “The mandate ended without a government being presented”; “The Knesset approved the government, X–Y.” Attribute official claims rather than treating them as independent truth; avoid adopting campaign labels, motives, predictions or success/failure adjectives for whole terms. Evidence: S04, S06, S22–S26 and counterexamples S02–S03.
12. **Treat historical and visual gaps explicitly.** Do not retrofit today's legal deadlines or consultation conventions onto 1949–2026. Show “not verified” instead of a fabricated tally; do not use current faction names/seats retroactively. Survey context needs sample/date/question labels. Build original graphics; the two verified chart libraries are MIT, whereas publisher images and book content have separate rights. Evidence: S04–S05, S09–S12, S15, S27–S28.

## Conclusion map and confidence

| Conclusion / criterion | Supporting evidence | Counterevidence / gaps | Confidence and what could change it |
| --- | --- | --- | --- |
| Separate results, recommendations, assignment and investiture; criterion: sources distinguish the acts | S04, S06, S23–S24 | News shorthand sometimes collapses required support measures; early-period law not audited | High for the presentation distinction; historical legal/official records needed for each election. |
| Use separate formation and term records; criterion: handles failures, changes and caretaker continuity | S16–S19, S21 | Detailed Israeli government records not retrieved; Parlement date inconsistencies | High for structure, not for copied dates; official Israeli term records would establish historical completeness. |
| Separate chronology and interpretation; criterion: readers can distinguish observable event from analytical claim | S10–S12, S17, S22, S26 | IDI and journalism contain evaluative wording; official statements can be selective | High for the design recommendation; a publisher's esteem alone cannot establish neutrality of every claim. |
| Recommended charts are adaptations; criterion: exact precedent versus inferred encoding made explicit | S04, S18–S19, S26–S28 | No exact nominee-bar example or rendered Gantt inspected; no visual/accessibility audit | Moderate; a retrieved and visually inspected recommendation tracker could change the preferred encoding. |

Accounting: page-level inspection is recorded per source above; requests include failures, metadata and duplicate retrievals and are not presented as a reviewed-source count. Search-result count, total HTTP bytes, and elapsed-time-per-source were not measured. Jina cache freshness/outbound headers were not available. No comparative chart or implementation artifact was created: this deliverable is the single Markdown research file.
