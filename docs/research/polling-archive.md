# Pre-election polling archive: scope, sources and k25 pilot

4 November 2026. Research draft; no application code. **Observed** means inspected source content; **inferred** means an editorial recommendation or interpretation. A discovered URL or secondary table is not verified poll data.

## Summary and recommendation

**Build an election-specific archive of published estimates, with a source drawer and a table before adding scenario loading. Start with k25, then k21–k24; expand backwards by evidence availability.** Keep each outlet's reported seats and percentages, original names, dates and methods. Never turn a missing value into zero, a poll into a forecast, or synthetic votes into an observation.

The six-outlet k25 acquisition target is **N12/מדגם, חדשות 13/קמיל פוקס with פרויקט המדגם and סטט נט, כאן/Kantar, מעריב/פאנלס פוליטיקס, ישראל היום/מאגר מוחות, and עכשיו 14/דיירקט פולס**. This is a reasonable provisional coverage set, not a measured audience-preference ranking. The strongest cross-outlet evidence supports the three major broadcasters; evidence for ranking the remaining outlets and historical firms by citation frequency is incomplete.

**Pilot limitation:** [the raw pilot](../../data/raw/polls/k25/) contains 19 outlet publications for 20 September–1 November 2022: **12 complete seat rows summing to 120, two complete but inconsistent rows quarantined, and five partial rows**. A secondary index identifies **34 candidate publications** in the selected series/window, leaving **15 acquisition gaps**. Thus this is a sourced, reviewable pilot, **not the complete six-week archive requested**. N12, Kan and Israel Hayom remain acquisition gaps. Do not release it as comprehensive or enable scenario loading from these draft records.

The critical discoveries are (a) a cutoff at the **end of Friday**, rather than a universal rolling 72-hour rule; (b) primary articles with inconsistent seat totals; and (c) a pollster submission whose published percentages explicitly combine samples **without population weighting**. These make a provenance-aware ingestion/review step essential.

## 1. Which outlets and firms belong, and why?

### Selection test and actual citation evidence

Operational definition: “expected” means recurring presence in election news coverage, not the researcher's opinion of reliability, outlet ideology, circulation or polling accuracy. Count **distinct news documents citing an identifiable poll producer**, once per document; a live roundup is one document, and articles repeating one poll are one poll family. Own-publication frequency is a separate measure. Neither is an audience survey.

A bounded, purposive news sample was inspected: JTA's 22 and 30 June 1981 reports, 23 July 1984 report, 27 June and 29 August 1988 reports; COL's 23 March 2006 roundup; Walla's 2012 polling profile; Ynet's January 2013 last poll; Globes' 2018 and 2022 pollster profiles and 2022 live roundup; and Arutz 7's October 2022 final-TV-polls roundup. Source cards below identify the documents. This is **12 documents**, not twelve independent surveys or a representative news corpus.

Observed, reproducible lower bounds within that sample:

| Era/sample | Citation presence | What this establishes |
|---|---|---|
| 1981: two JTA documents | Modiin Ezrachi in 2/2; Dahaf in 1/2 | Both recur in contemporary coverage. Does not rank all 1981 producers. |
| 1984: one JTA document | Hanoch Smith in 1/1, Modiin Ezrachi in 1/1 | Specific newspaper/firm partnerships, not recurrence by itself. |
| 1988: two JTA documents | Dahaf in 2/2; Dessima in 1/2 | Dahaf recurs; party-commissioned surveys also circulated publicly. |
| 2022: Globes profile + live roundup + Arutz 7 roundup | 12, 13 and public broadcaster each in 3/3 | Strongest observed case for a core broadcast trio. Profile includes exit-poll work; do not count exit polls as pre-election archive records. |
| Other eras | Coverage examples below; no representative frequency denominator | Historical recommendations remain provisional. |

The pilot acquisition index separately has, in the chosen window, N12 **7**, Channel 13 **6**, Kan including Reshet Bet **5**, Maariv **7**, Channel 14 **7**, Israel Hayom **2**. These are **secondary-index publication counts**, not news citations, verified captures, quality weights or independent polls. [coverage.json](../../data/raw/polls/k25/coverage.json) preserves dates/outlets without copying its estimates. Its denominator can omit polls. In particular, Hebrew Wikipedia's secondary table omitted some entries found in this index; it was only used to locate primary URLs.

### Per-election acquisition recommendation (inferred unless specified)

| Elections | Initial set/size | Evidence and qualifications |
|---|---|---|
| k1–k6: 1949, 1951, 1955, 1959, 1961, 1965 | No fixed firm quota; archive search first | Early opinion research existed, but no eligible published national list-estimate series was verified here. Do not invent a modern-style polling panel for these years. |
| k7–k8: 1969, 1973 | 0–2 recoverable public series; examine Guttman/Israel Institute of Applied Social Research and newspaper commissions | INES establishes surveys, not their contemporary publication as seat estimates. Include only if the original public table is located. |
| k9: 1977 | 1–3 recoverable press series; inspect Modiin Ezrachi/Tzemach and Smith alongside Guttman leads | Retrospective mentions are leads; Smith's famous TV exit poll is outside scope. No original pre-election newspaper seat table retained here. |
| k10: 1981 | Dahaf and Modiin Ezrachi; add Smith if located (2–3) | Contemporary JTA coverage repeatedly names the first two. Original commissioning-newspaper tables still needed for ingestion. |
| k11: 1984 | Davar/Jerusalem Post–Smith; Maariv–Modiin Ezrachi; check Yedioth–Dahaf (2–3) | First two pairings explicitly observed in JTA's 23 July report. Third is a retrieval target, not verified for this election. |
| k12: 1988 | Dahaf, Smith and Modiin Ezrachi where public; retain named party commissions separately (2–4) | Dahaf recurrence observed. Do not exclude publicly reported party polls silently or conflate them with commissioned news series. Other pairings need campaign-specific verification. |
| k13–k15: 1992, 1996, 1999 | Yedioth/Dahaf, Maariv/Teleseker, Haaretz and broadcast commissions (3–5, provisional) | Recover original masthead/method blocks; no quantitative citation ranking established for these elections. 1996/1999 prime-minister vote polls are a different contest. The 2001 PM-only election is not a Knesset dataset. |
| k16–k18: 2003, 2006, 2009 | Yedioth/Dahaf, Maariv/Teleseker, Haaretz/Dialog, TV commissions and Smith where published (4–6) | COL 2006 explicitly identifies Maariv/Teleseker and Haaretz/Dialog. Walla's 2009 review identifies Geocartography for Channel 1's Politics programme. Check provider per publication. |
| k19: 2013 | Yedioth/Dahaf, Channel 2, Channel 10/Fuchs, Maariv/Teleseker, Haaretz/Dialog, Israel Hayom and Globes/Smith (up to 7) | Ynet's own final publication confirms Dahaf and reports six Yedioth polls over eleven weeks. Some outlets share producers: distinct outlet brands do not imply independent samples. |
| k20: 2015 | 2/Midgam, 10/Fuchs, 1/TNS Teleseker, Maariv/Panels, Haaretz/Dialog, Israel Hayom and optionally Globes/Smith (5–7) | 2015 provider profile found but direct access denied; pairing of TNS with Channel 1/Walla is discovery-level here. Verify original pages before admission. |
| k21–k24: Apr 2019, Sep 2019, 2020, 2021 | 12/Midgam, 13/Fuchs, Kan/Kantar, Maariv/Panels, Israel Hayom/current firm; optionally Yedioth and 20/Direct Polls if actually active (5–7) | Globes' 2018 profile records Midgam for news, Galatz and Yedioth, Dialog for Channel 10/Haaretz; 2022 retrospective names the trio across five rounds. Do not apply 2022 subcontractors automatically to 2019. |
| k25: 2022 | Six-outlet target above; Galatz/103FM/Knesset Channel optional extensions | Repeated TV citations plus recurring primary/secondary-index publications support the target. Radio commissions should get separate survey IDs if independently fielded. |
| k26: 2026 | Same six **outlet targets**, verify every current producer; optional seventh only with recurring citations | Current CEC catalogue was discovered. Current firm identities/frequencies were not audited; do not carry deceased/replaced researchers or changed firms into 2026 by inference. |

**Examples checked, not assumed:** Dahaf/Yedioth and Teleseker/Maariv are supported in the inspected sources for particular periods, not timeless partnerships. Geocartography appears in Walla's 2009 review and Globes' 2018 profile; include its actual commissions, not a mandatory slot every election. **Gallup Israel's election-specific prominence and exact outlet pairings were not established**; international Gallup surveys and TV-rating work are not evidence for that claim. Keep it a historical search lead, not an approved ingestion provider. This is the largest remaining gap in answer 1 alongside historical citation counts.

## 2. How far back can the archive go?

Three different questions must stay separate: did research occur, were voting estimates publicly published before election day, and can the original full figures now be recovered?

| Election(s) | Earliest evidence actually located in this study | Admission status |
|---|---|---|
| k1–k6 | IDI describes 1949–1950 government-attitude surveys; not equivalent to pre-election seat estimates | **Unknown**, not “no polls existed”. None admitted. |
| k7 1969 | INES: August 1969 wave; September–October wave; third wave 14 October–28 November crosses election day | Academic data exists; no contemporary public estimate verified. Urban Jewish age-20+ frame, not whole electorate. |
| k8 1973 | INES: May and September, 18–19 November, 19–20 December; January 1974 is post-election | Academic data exists. War postponement requires both planned and actual election dates. Public press tables unverified. |
| k9 1977 | INES: 3–9 March, 12–14 April, 4–5 May; June is post-election | Research exists, urban Jewish frame. Public press-table recovery unresolved. |
| k10 1981 | Contemporary JTA news report **22 June 1981**, and final survey report 30 June | Published seat estimates demonstrably circulated; JTA reports others' surveys. Need original newspaper before retaining those figures as archive records. |
| k11 1984 | Contemporary JTA **23 July 1984**, names Smith in Davar/Jerusalem Post, Modiin Ezrachi in Maariv | Public estimates established; original newspaper tables not transcribed here. |
| k12 1988 | Contemporary JTA **27 June 1988**, then 29 August | Public estimates established, including party commissions; original table recovery pending. |
| k13–k15 | INES inventory contains 1992, 1996, 1999 studies; later press retrospectives point to press polling | Academic availability established. Earliest eligible newspaper date **not established here**. |
| k16 | 2003 Ynet retrospective surfaced; mainly compares exit polls | Discovery only; earliest pre-election source unverified. |
| k17 | COL **23 March 2006** contemporaneous press-poll roundup inspected | Existence/cited brands supported, not an eligible source for importing other outlets' figures. |
| k18 | Walla **25 January 2009**, discussing a 20 January broadcast | Existence established; original broadcast/table needed. |
| k19 | Ynet **18 January 2013** own Dahaf/Yedioth poll | Eligible original-publication example; not the earliest poll of the campaign. |
| k20 | 2015 press source discovered, direct access denied | Recovery target; no earliest eligible publication claim. |
| k21–k24 | Contemporary series indexed by HaMadad; 2018/2022 profiles supply provider history | High feasibility inferred, full source-date audit not done. |
| k25 | First retained pilot date **22 September 2022** (window starts 20 September) | Original outlet pages retained, with partial/conflict states. |
| k26 | CEC 2026 poll catalogue surfaced | Original submissions available in catalogue discovery; earliest public poll date not established. |

“Earliest” here means earliest **located**, not first-ever publication, except where explicitly stated as a pilot boundary. It would be misleading to promise complete coverage for every election based on INES or a modern aggregator.

For newspaper recovery use [NLI's Historical Jewish Press](https://www.nli.org.il/he/discover/newspapers/jpress): search both `סקר`/`מישאל`/`משאל`, `דעת קהל`, `תחזית`, institute names and spelling variants, in the six weeks before **each actual election date**. Start Maariv, Davar, Al HaMishmar, Haaretz and The Palestine/Jerusalem Post according to available holdings; Yedioth may require separate licensed access. OCR search misses charts: inspect complete issue pages, record issue/date/page/article identifier and visual transcription. A stable NLI article/issue URL is preferable to search-result links. **No NLI newspaper issue/page was verified in this pass**, so no invented archival dates or links are supplied. General NLI historical pages and political-opinion surveys are not substitutes.

## 3. Record and identity design

The machine-readable [draft schema](../../data/raw/polls/k25/schema.draft.json), [polls](../../data/raw/polls/k25/polls.json), [sources](../../data/raw/polls/k25/sources.json) and [coverage](../../data/raw/polls/k25/coverage.json) are research inputs; they do not change the election dataset schema. `null` distinguishes missing/unchecked from numeric zero. Add a per-field missing reason before production (`not-published`, `not-transcribed`, `access-blocked`, `conflicting`). Draft nulls deliberately do not assert that the original never published a value.

A production record needs:

- Stable election, survey-family and publication IDs; commissioning outlet, sponsor and funder where given; actual fieldwork firms, individual supervisor and sub-sample contractors. Record relationships with validity dates, not one global outlet→pollster map.
- Publication timestamp/timezone (`Asia/Jerusalem`), update time and original-publication precision; fieldwork start/end, sample size and subgroup sizes; population frame, geography, ages, modes/panels, weighting and likely-voter treatment; quoted question/answer order; invited/responded/refused counts where available; stated margin and its basis/confidence level. Do not calculate an absent margin from sample size.
- One **question/variant** per result set: baseline, withdrawal, merger or hypothetical leadership. Same-day variants share a sample family. Keep commissioned party polls and opt-in/internet straw polls distinctly classified; exclude school ballots and exit polls from the default national archive.
- Literal Hebrew list label, optional leader text, seats as printed, vote share as printed **with denominator and stage** (raw respondents, decided voters, weighted, threshold-adjusted); below-threshold flag and published share/range. A list omitted from a chart is not necessarily tested or at zero. Combined “don't know / will not vote” must not become undecided alone.
- Source URL, headline, author, publisher, page/table/figure or paragraph locator, retrieval time, local capture and SHA-256, verified archive URL/timestamp if available, access/rights state, correction/review status and editor notes. Preserve original conflicting values; corrections are versions, never silent overwrites.

The pilot stores **literal short labels occurring in prose**, not a claim to have transcribed every chart's full ballot wording. Full chart-name transcription is a production gate. `firmEvidence` separates inferred series attribution from a firm's explicit mention; the archive should expose this status.

### Mapping campaign entities to dataset lists

Keep `reportedNameHe` immutable. Introduce campaign entity IDs and a separately reviewed, election-specific alias/crosswalk with source, effective date, relation (`same-list`, `renamed`, `merger`, `split`, `hypothetical`, `unresolved`) and target IDs. Match by documented composition and campaign date, not fuzzy strings or leaders alone. Build rejects unresolved ambiguous mappings for scenario import, but can still display sourced polls.

For k25: the national-camp label maps to `25-כן`; the combined Religious Zionism/Otzma list to `25-ט`; Hadash–Taal to `25-ום`; Balad separately to `25-ד`; Raam to `25-עם`; Jewish Home to `25-ב`. Earlier Joint List estimates cannot be split into Hadash–Taal and Balad from seats alone. Similarly, separate Religious Zionism/Otzma trial runs cannot be merged into observed values for a poll that tested them together. Do not spread a joint-list estimate among constituent parties using final results. Lines should break when a campaign entity changes composition; an optional sum must be labelled an editorial aggregate with all component sources.

## 4. Legal and ethical boundaries

### Poll publication cutoff

**Statute:** Elections (Propaganda Methods) Law, 5719–1959, **section 16ה(ח)**. It prohibits broadcasting or publishing previously unpublished election-poll results from **the end of the Friday preceding opening of polling stations through the close of polling**. Previously published polls can be repeated during that period only with a prominent warning that they are outdated and do not establish voting patterns or public attitudes on the publication day. The [CEC's 2006 statutory text](https://www.gov.il/apps/elections/elections-knesset-17/heb/law/PropagandaLaw.html), [2022 decision 55/25](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/tbk_55_25/he/laws_25_tbk55-25.pdf) and retained statutory transcription support this rule; the 2022 decision quotes the applicable section.

For Tuesday **1 November 2022**, the cutoff began **29 October at 00:00 Israel time**, following Friday 28 October, and ran through poll closing. “Three days before” is shorthand, not the statutory algorithm. The older k16 law page says 24 hours; do not apply obsolete text to k25. For a future live release, verify the then-effective statute and CEC calendar rather than hardcoding a duration.

Sections **16ה(ב)–(ג)** require the first publisher and those publishing within 24 hours to report commissioner, researcher, fieldwork dates, sampled population, invited and actual respondent counts, margin, and (in writing) the questions. **16ה(ה)** requires submission to the CEC; availability there is not CEC endorsement. An archival application should preserve this information even where the statutory first-publication condition does not apply to its later republication. Add Hebrew warning text: `סקר היסטורי — אינו עדכני; אין ללמוד ממנו על עמדות הציבור ביום הצפייה`. Do not relabel a new survey or an unvalidated new model as “archive” to evade restrictions.

### Copyright, attribution and retention

The [original 2007 Copyright Act, Reshumot 2119](https://www.law.co.il/media/computer-law/copyrightlaw2007.pdf), retained locally, distinguishes **facts/data and daily news (section 5)** from their protected expression. Tables/compilations can be protected for original selection/arrangement (**section 4**); articles, photographs, graphics and editorial text retain their rights. Government hosting does not itself free a private pollster's document. Section **19** fair use is contextual, not a blanket archive-republication licence; sections **45–46** concern moral rights, including appropriate author credit when using protected work. Original-act evidence is sufficient for this design distinction; a current legal review of any later amendments and publisher terms remains a release gate.

**Recommendation (legal interpretation, not a rights clearance):** independently transcribe the numeric facts and necessary labels into our own schema and graphics. Attribute outlet, fieldwork firm, date, question and original URL in every detail/export; credit author when relevant. Do not ship article prose, logos, screenshots or copied table styling in the public app merely because figures are factual. Archive links are not licences. The retained raw HTML/PDFs here are research evidence, explicitly outside the project's MIT licence; reconsider public distribution/permission for full third-party captures before publishing this branch. This task authorizes retention and a local commit, not public redistribution.

Do not circumvent paywalls/login/CAPTCHA; an HTTP-200 partial article is still partial. Request only aggregate results, never respondent microdata. Treat outlet selection and gaps transparently: missing outlets must not be hidden by a smooth average. Avoid partisan selection or reliability claims based on this small sample.

## 5. Method honesty: seats, votes and averages

Published seats are a **pollster's processed estimate**. They reflect decisions about undecided respondents, likely voting, thresholds, weighting and allocation. Even where percentages are published, their denominator may differ from the vote vector the engine expects. The exact engine cannot make those upstream assumptions exact.

| Scenario option | Defensible behaviour | Caveat |
|---|---|---|
| Published vote shares | Use only documented, compatible population-weighted voting shares; explicitly choose handling of undecided/nonvoters and missing lists; scale to a declared synthetic total and use deterministic integer rounding | The engine may not reproduce the outlet's published seats; show both. A raw respondent percentage is not automatically election vote share. |
| Seat-proportional synthetic shares | Explicit opt-in: `s_i/120` among represented lists, with a separately declared below-threshold pool and assumptions | Loses discarded votes/threshold distances; agreement and integer allocation can change seats. This is a teaching approximation, not an inverse recovery. |
| Constrained seat-matching synthetic votes | Search for any compatible vote vector under declared rules, threshold, agreements, total and below-threshold assumptions; record objective, constraints, seed/version, found vector and exact forward check | Many solutions; may be infeasible under chosen constraints. “Closest to final result” leaks hindsight. Never imply uniqueness; any seeded priors are user assumptions. |
| Seats-only archive | Read-only reported seats, no vote import | **Recommended first release.** Keeps every sourced poll browsable while honestly withholding unsupported vote inputs. |

**Observed counterexample:** Channel 13's final CEC report has a raw percentage column explicitly described as **unweighted sums of its two population samples**. Its 12.3% is combined “don't know / will not vote”. Another column gives below-threshold adjusted values. The article's stated margin is 3.5%, while the report says 3.4%; its title is 28 October while the fieldwork line says 20 October. [Supplement](../../data/raw/polls/k25/cec-13-final-supplement.json) preserves those distinctions. Neither raw shares nor the combined nonresponse figure should be silently normalized into a “poll scenario”.

Initially show **dots/lines by outlet/firm**, publication dates with fieldwork spans where known, seat/share units selectable only where supported, and explicit gaps. No smoothed curves across identity breaks. The prior-art study's P10 warning applies directly: swing magnitude and synthetic simulations do not justify “likely”, win probability or coalition probability labels.

An optional later **descriptive average** is possible if it states window, estimator, included polls and denominator: one most recent eligible baseline survey per **independent fieldwork family**, equal weights to start, no double counting syndication or alternative questions, and no pooling incompatible list configurations. Show n, dates and every input; do not round to claim an allocatable 120-seat parliament. Seat averages are descriptive means of processed seats, not votes and not engine inputs. Sample-size weighting alone ignores design effects/shared bias; house-effect correction or smoothing would be a separate, validated modelling project. A “range of published estimates” is not a statistical confidence interval. Polls are **not forecasts or probabilities**.

## 6. Pilot results and source gaps

Window: **20 September–1 November 2022** (six weeks before the election). The final newly published polls fall before the Friday cutoff. Captures were requested with `israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)`; each retained source has its retrieval time and SHA-256 in `sources.json`.

| Outlet | Candidate dates in index | Retained publications | Complete/120 | Quarantined | Partial | Gap dates |
|---|---:|---:|---:|---:|---:|---|
| N12 | 7 | 0 | 0 | 0 | 0 | 22, 28 Sep; 11, 18, 20, 24, 28 Oct (20 Oct is Keshet-labelled) |
| Channel 13 | 6 | 6 | 4 | 1 | 1 | None among indexed candidates; metadata still incomplete |
| Kan/Reshet Bet | 5 | 0 | 0 | 0 | 0 | 1, 11, 18, 24, 27 Oct; index contains both public-broadcaster brands, check duplicate publications |
| Maariv | 7 | 6 | 2 | 0 | 4 | 23 Sep primary not located; several retained bodies incomplete |
| Channel 14 | 7 | 7 | 6 | 1 | 0 | None among indexed candidates |
| Israel Hayom | 2 | 0 | 0 | 0 | 0 | 6, 27 Oct; Hebrew secondary index dates the first 5 Oct, requiring original-date reconciliation |

Counts are candidate publications, not guaranteed unique surveys. The table's date lists intentionally expose possible duplicates rather than assigning fabricated distinct wave IDs. `coverage.json` is the exact machine-readable denominator; target-series counts alone cannot prove completeness.

**Quarantined observed contradictions:**

- Channel 14, **29 September**: original prose lists Likud 34 and a full subtotal of **119** while claiming a 62-seat bloc. Secondary index has a different Likud number. We retain 34 and quarantine; we do not “repair” to 35.
- Channel 13, **13 October**: original prose gives Raam five, making **121**; secondary index gives four. Keep the source wording and quarantine pending original graphic/submission reconciliation.
- Maariv, **14 October**: publicly retrieved prose contains a hypothetical “Netanyahu urges a Jewish Home vote” variant whose listed values sum to 119, plus a lead with conflicting baseline information. No alternative-question seats were promoted into the baseline record.

Some sources are HTTP 403, some timeout/503, and two N12 HTTP-200 bodies are access-denial pages, not articles. Maariv's partial bodies are labelled **partial; paywall status unconfirmed**, not an assertion of a paywall that was not established. An original firm-provided PDF was successfully fetched from the CEC although its HTML collection page returned 403. Archive.org's availability endpoint returned **429 without Retry-After** on the first check; further archive requests stopped. No verified Wayback capture is claimed. The retained primary pages satisfy the pilot's “source pages retained or archive URLs” condition for admitted rows; inaccessible items remain gaps.

The draft deliberately leaves missing fieldwork dates null and keeps literal below-threshold percentages without inventing seat zeroes. All records have `scenarioEligible:false`. These are research transcriptions, not final independently double-entered data. Source names, metadata conflicts, five partial tables, 15 acquisitions and archive captures need review before ingestion.

## 7. Proposed implementation plan and effort

Engineering estimates below are **inferred person-days**, excluding licensed archive access, permission waits and unbounded historical discovery. No implementation or new package is included in this commit.

| Step | Files/components | Deliverable and acceptance | Effort |
|---|---|---|---:|
| Finish k25 evidence | `data/raw/polls/k25/`, reviewed crosswalk under `data/meta/` | Resolve 15 acquisitions, full chart names, methods/null reasons, variants and both inconsistent totals; two-person or independent double transcription; stable captures/rights decision | 3–6 days if access works; otherwise unresolved |
| Schema + build | Separate polling types alongside `src/data/schema.ts`; proposed `scripts/build-polls.ts`; extend data build orchestration | Validate schema, IDs/source hashes, dates, duplicates, variant families, bounds, sums only when complete; quarantine rather than normalize; generate `public/data/polls/index.json` and per-election shards | 2–3 |
| Election browse/details | `TopBar.tsx`, `Panels.tsx`; proposed `PollArchive.tsx`, `PollDetail.tsx`; existing `i18n.ts` | One “סקרים לפני הבחירות” entry, election/date/outlet filters, Hebrew-first table, source/method drawer, obvious incomplete/archived labels. Simple signposts existence; detailed exploration in Standard/Expert | 2–3 |
| List history | `ListDetail.tsx`, `Charts.tsx`; proposed `PollTrend.tsx` | Per-list seats/share series, outlet toggles, entity breaks, fieldwork tooltip, gaps and matching data table; no chart made from zero-filled missing values | 2–3 |
| Optional scenario import | `Scenarios.tsx`, `Compare.tsx`, `ChangeSummary.tsx`, `src/app/store.ts`, model validation; proposed `PollScenarioDialog.tsx` | Atomic undoable import using existing scenario validation; source + synthetic-input method/version carried through save/share/export; observed seats alongside computed seats; no backwards filling from election result | 3–5 |
| Release checks | Existing tests plus focused new build/import/chart coverage | Source-figure checks, malformed/repeated poll rejection, split-list breaks, threshold/share denominator cases, synthetic forward-check/mismatch, save/share replay; actual keyboard/RTL/mobile/chart-table verification before accessibility claims | 2–3 |

Browse/trends plus source completion: roughly **11–18 person-days**. Optional synthetic import adds **3–5**. These are rough estimates, not a commitment. Historical backfill is a separate evidence programme: budget a trial day per early election and stop to report access limitations rather than promising a full 1949–2026 time series.

Keep the current exact engine and static deployment. Poll data is loaded only for the selected election; official result remains the baseline until a user explicitly loads a scenario. Do not insert polling source documents into the official-results manifest as if they were CEC-certified returns. Retain this research and raw draft separately; production adoption should record its chosen mapping/method as a reviewed project decision.

## Evidence map, reusable source cards and research limits

This report is the compact source archive for this objective; no parallel research ledger is needed. The JSON source manifest contains individual pilot document locators/captures/hashes. Each source below is journalism unless described otherwise; access was public, inspected through a custom-UA HTTP capture unless marked discovery-only. Shared polling waves and the same mutable page do not count as independent evidence.

### H1–H2 · Contemporary 1981 press coverage

[22 June: Likud, in New Poll, Substantially Boosts Lead](https://www.jta.org/archive/likud-in-new-poll-substantially-boosts-lead) and [30 June: Labor Has Slight Lead on Election Eve](https://www.jta.org/archive/labor-has-slight-lead-on-election-eve), JTA.

- **Contribution:** H1 identifies Jerusalem Post/Modiin Ezrachi and explicitly notes excluded kibbutz/Arab populations; H2 names Dahaf and another Modiin poll. Two documents show recurrent citation, not whole-population representativeness.
- **Limit:** Syndicated reports of other publications; not used to import numeric poll estimates. Daily-bulletin date can differ from the event described; preserve both in later backfill.

### H3 · [23 July 1984: On the Eve of Israel's Elections](https://www.jta.org/archive/on-the-eve-of-israels-elections-some-2-6-million-people-are-eligible-to-vote-labor-given-lead-in)

- **Contribution:** JTA names Smith/Davar/Jerusalem Post and Modiin Ezrachi/Maariv, and separately describes Smith's TV exit survey. Demonstrates why exit and pre-election polls must be classified separately.
- **Limit:** One report, no recurrence denominator for that year.

### H4–H5 · Contemporary 1988 citations

[27 June: Labor Has Tiny Edge over Likud](https://www.jta.org/archive/labor-has-tiny-edge-over-likud) and [29 August: Latest Polls Give Labor Tiny Edge over the Likud](https://www.jta.org/archive/latest-polls-give-labor-tiny-edge-over-the-likud), JTA.

- **Contribution:** Dahaf appears in both documents; August identifies party commissions and a Jewish-only frame. Poll sponsor and population need first-class fields.
- **Limit:** Not a national outlet ranking or permission to ingest figures from secondary reporting.

### H6 · [23 March 2006: press-poll roundup](https://col.org.il/news/18635), COL

- **Contribution:** Contemporary cross-outlet coverage explicitly names Haaretz/Dialog and Maariv/Teleseker.
- **Limit:** Audience-specific selection of parties; no eligible complete original poll table imported.

### H7 · [2012: Everything about polling](https://www.walla.co.il/news/israel/2584250), Walla

- **Contribution:** Interviews/profile demonstrate public prominence of Tzemach/Dahaf and discuss threshold/undecided problems and changes during campaigns.
- **Limit:** Profile, not a census of election-poll citations or proof of all historical pairings.

### H8 · [18 January 2013: final Yedioth/Dahaf poll](https://www.ynet.co.il/articles/0,7340,L-4334096,00.html), Ynet

- **Contribution:** Original publication names commissioner, Dahaf/Tzemach, sample and undecided share; reports six publications in eleven weeks. Supports recurrence for this specific campaign.
- **Limit:** Does not generalize its provider relationship to other years.

### H9 · [2018: polling season returns](https://www.globes.co.il/news/article.aspx?did=1001260881), Globes

- **Contribution:** Interviews Fuchs/Dialog, Geva/Midgam and Degani/Geocartography; identifies commissioning outlets and describes panel/telephone approaches and political clients.
- **Limit:** Discusses pre-campaign practice, not complete k21 poll coverage; editorial nomenclature must not replace actual methods blocks.

### H10 · [2022: the pollsters preparing for election night](https://www.globes.co.il/news/article.aspx?did=1001428353), Globes

- **Contribution:** Identifies 12/Midgam, 13/Fuchs, Kan/Kantar across five election rounds and Channel 14's addition. Supports the broadcast core.
- **Limit:** Mainly election-night profiles; pre-election archive excludes those exit estimates. The actual k25 Channel 13 fieldwork contractors come from its own publications, not this profile's Dialog label.

### H11 · [2022 live poll roundup](https://www.globes.co.il/news/article.aspx?did=1001420159), Globes

- **Contribution:** Multiple dated campaign discussions cite the broadcast trio and Maariv; illustrates the risk of aggregating changed list combinations.
- **Limit:** One mutable document despite many embedded updates. Its averages/figures were not copied into the pilot.

### H12 · [28 October 2022: final television polls](https://www.inn.co.il/news/581341), Arutz 7

- **Contribution:** Cross-outlet citation of the three broadcasters supports inclusion independently of their own publication counts.
- **Limit:** Repeats the underlying polls; not an independent survey or primary outlet source for their figures.

### A1 · [INES: Our Data](https://socsci4.tau.ac.il/mu2/ines/data/our-data/), Tel Aviv University

- **Contribution:** Academic source provides fieldwork periods, populations and instruments dating to 1969, including 1973/1977 waves and later elections.
- **Limit:** Recoverable academic survey data is not proof of a contemporaneously public newspaper seat table. Early urban Jewish age-20+ frames must remain visible.

### A2 · [Early-state public opinion](https://www.idi.org.il/articles/9777), IDI

- **Contribution:** Research overview documents 1949–1950 attitude surveys, challenging the assumption that no polling existed before modern television.
- **Limit:** Does not establish pre-election list-estimate coverage for k1–k6.

### L1 · [CEC decision 55/25](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/tbk_55_25/he/laws_25_tbk55-25.pdf)

- **Contribution:** Primary judicial/administrative source, retained PDF, quotes disclosure/cutoff law and addresses publication of raw percentages including excluded lists. Lists six respondent polling firms.
- **Limit:** A list of respondents is not an audience or citation ranking. Does not endorse a submitted poll's methodology.

### L2 · [Copyright Act as promulgated](https://www.law.co.il/media/computer-law/copyrightlaw2007.pdf)

- **Contribution:** Primary statutory document, third-party mirror, retained PDF; sections 4–5, 19 and 45–46 ground the distinction between numeric facts, protected expression and credit.
- **Limit:** Original 2007 publication, not a current consolidated legal opinion or publisher-specific redistribution clearance.

### P1 · Pilot outlet publications and CEC final-13 report

[Source manifest](../../data/raw/polls/k25/sources.json) identifies all 19 publication families plus corroborating submission and statutory PDFs. Contribution: traceable observed figures, literal prose names and methods. Limits: 15 candidate acquisitions absent, chart labels not fully transcribed, two seat-total contradictions, partial methods and article bodies, no external capture verified. The CEC submission and Channel 13 article are related evidence for the same wave, not two independent polls.

### Other inspected sources / discovery-only links

- [HaMadad k25 index](https://themadad.com/allpolls25/) — inspected secondary discovery index only; dates/outlets and index hash retained. Estimates not used as pilot evidence.
- [Hebrew Wikipedia k25 article](https://he.wikipedia.org/wiki/הבחירות_לכנסת_העשרים_וחמש) — labelled secondary URL index only. All retained figures came from captured original outlet publications or the separately labelled pollster submission.
- [Historical Jewish Press](https://www.nli.org.il/he/discover/newspapers/jpress) — discovery entry point; no newspaper scan inspected.
- [2015 Israel Hayom pollster profile](https://www.israelhayom.co.il/article/265461) — search discovery, HTTP 403 on direct retrieval; affiliations remain unverified in this pass.
- [CEC k26 catalogue](https://www.gov.il/he/departments/topics/knesset_election_polls26) — discovery, not inspected poll data or a completed 2026 provider audit.
- [CEC k25 collection](https://www.gov.il/he/Departments/General/survey25-2) — HTTP 403; individual final-13 PDF accessible.
- [2003 Ynet comparison](https://www.ynet.co.il/articles/mobile/0,7340,L-2403773,00.html) and [2013 N12 eleven-poll roundup](https://www.mako.co.il/news-elections-2013/articles/Article-0e59bf1b3ee4c31004.htm) — discovery only; latter direct request returned 503. Not counted in inspected news sample.
- NLI general historical/exhibit results, unrelated Gallup polls and TV-rating articles were screened out: they do not establish eligible list-estimate records.

### Conclusion map and challenge pass

| Conclusion | Evidence direction | Confidence and remaining test |
|---|---|---|
| Start with modern archive; no promise of 26 complete series | Supports: P1/H8–H12. Context: A1. Challenges a “no early polls” claim: A2 | High for modern feasibility, low for historical completeness. Recover original early press tables and dated issues to change coverage status. |
| Six k25 targets, core broadcast trio | Supports: H10–H12 + index publication counts. Context: P1 gaps | Medium for target selection; low for audience expectations/rank. A representative cross-outlet citation census per election could change the set. |
| Do not infer vote inputs from seats automatically | Supports: P1 CEC denominator warning; engine's threshold/agreement rules; P10 prior-art warning | High for non-uniqueness. An actual compatible published vote vector can permit explicit opt-in conversion for that record. |
| Quarantine rather than fix source totals | Supports: retained 29 Sep/13 Oct prose. Contradicts: secondary index values | High that conflict exists; original broadcast graphics or corrected primary submissions could resolve it. |
| Friday cutoff and careful reuse | Supports: L1/statutory text; L2. Context: old k16 wording | High for k25 cutoff; bounded legal interpretation for rights. Then-effective consolidated law and publisher permissions govern a future release. |

Search streams were source identity/era coverage, early archival counterexamples, statutory/rights texts, k25 acquisition, and inverse-method failure modes. Hebrew/English searches excluded English Wikipedia where filters were specified; incidental search results pointing there were discarded, never opened, cited or followed. Direct source/archival requests used the required User-Agent; search-provider internal transport headers are not exposed. No paywall, CAPTCHA or login was bypassed. Network DNS initially failed in the sandbox; authorized network execution enabled custom-UA fetching. No source-status failure was treated as a recovered article.

The deliberate challenge pass found pre-1980s academic data, old statutory wording, shared outlet producers, partial HTTP-200 bodies, 119/121-seat prose, and unweighted raw shares; these changed the recommendation. Source independence is bounded above; news citations across every era, archive coverage and earliest dates remain explicitly unresolved. Search-engine total recall, citation prevalence in the whole Israeli news universe, audience expectations and microdata accuracy were **not measured**. Source retrieval counts are not page-depth metrics. No chart or trend forecast was generated, and no application tests/build are claimed for this research-only change.

## Owner decisions (4 November 2026)

1. **Polling is its own window.** It covers only elections with wide, reliable polling that a serious project can stand behind. Earlier elections stay unsupported unless a sound way to include them is found. The work is deferred until the core app works well.
2. **Pollsters.** Support the established outlets, plus other reputable ones (for example i24). In settings, users can turn individual pollsters on or off. Any average or chart uses only the pollsters a user has enabled. The app never ranks or scores pollsters itself.
3. **The publication ban is explained in the window's information (i) section.** It is not treated as a problem.
4. **Evidence storage.**
   - A **private** collection holds pollsters, findings, method details, relevant graphics and article copies.
   - The public repository holds the transcribed figures and links to the articles used.
   - The 22 k25 article copies stay on local branch `t3/5f8b5a14` until that private collection exists.
