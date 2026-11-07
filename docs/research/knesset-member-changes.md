# Knesset member changes: official-record extraction, 1–26

Research snapshot: **7 November 2026**. **Partial for every Knesset** against the full brief. This is a reproducible official database baseline, not a complete legal history of replacements, splits or investiture voting. No app data or app schema is changed.

The extraction contains **3,378 tenure records**, **378 entry episodes after opening**, and **293 grouped faction-membership transitions affecting 1,048 member transitions** across Knessets 1–25. Of the entry episodes, **280 have a probable same-date replacement pairing**; none has been verified against an individual replacement notice. There are **104 unpaired departure records**, which are separate observations and must not be added to the entrant count as additional replacements. Names/counts of people in the table are per term, not globally distinct people.

## Method and evidence boundaries

The question is who served, when, with which factions, and which official decisions explain changes. Research streams were tenure/faction extraction, replacement/candidate validation, formal faction-decision discovery, and investiture roll calls. Qualifying evidence is the official record; indexed pages and repository identity crosswalks remain leads. This snapshot uses the reported source dates without silently repairing them.

Read first: [archive access routes](archive-access-routes.md), [opening-membership audit](elected-names-odata-audit.md), and `scripts/research/bios-party/knesset_spot.py`. No repository-local AGENTS.md or CLAUDE.md was present in this worktree; the supplied workspace governance applies. Existing main-checkout scratch was inspected for available research; new responses are confined to this worktree's `.backup-scratch/m2/`.

- `KNS_PersonToPosition`: PositionID 43/61 identifies MK tenures; 54 identifies faction membership. Retrieved all pages for KnessetNum 1–26, ordered by PersonToPositionID. **7,945 records: 3,378 MK and 4,567 faction-position records**, including 120 future faction positions for K26.
- `KNS_Faction`: 530 registry records; names and dates are retained, without assuming a new ID necessarily means a legally recognized split. Historical renames under an unchanged ID cannot be reconstructed from the current name alone.
- `KNS_KnessetDates`: 165 assembly/session-period records, used as context. These are not a substitute for tenure or resignation dates.
- Names come from the repository's retained official person crosswalks (4 November); these were not refreshed. Each output's `sources.persons.retainedArtifact` identifies its retained crosswalk. Candidate list/rank hints use the existing bios person-ID crosswalk plus the printed candidate dataset and are **provisional repository-derived pointers**, not independent gazette verification. Unmatched candidate ranks stay empty; no matching by name was invented.
- Every item has `cites` and a certainty label. Resolve citation `source` through the file's `sources` dictionary; `recordId` is the exact table key. To reproduce one record, query the cited table with its key, e.g. `KNS_PersonToPosition(23676)?$format=json`. Citations share one Knesset database evidence family; multiple tables are not independent corroboration.
- `confirmed` means the value is directly reported in the official database, or an exact adjacent membership transition is directly observable. It does **not** certify legal effect, full coverage, or factual accuracy beyond that database. `probable` replacement pairings are explicitly inferred. `provisional` denotes unresolved pairing or repository-derived candidate pointers; unknown reasons/status are written `unknown`. No reasons are inferred from office-holding or timing.
- Tenure-linked faction rows retain their original dates and can extend beyond the linked tenure (notably ministerial resignation periods). A person remains affiliated with a faction while temporarily outside the Knesset; a faction position is not proof of MK service. `factionRegistry` preserves faction lifetimes, including rows absent from tenure intersections.
- A replacement hypothesis requires a unique outgoing and incoming member on the **same date** sharing a faction. Both directions must be unique. Simultaneous same-faction replacements stay unpaired; later returns are detected as repeated tenure episodes but **not automatically called Norwegian-law returns**. No nearest-date pairing or eligibility-chain guess is made.
- `factionChanges` groups exact contiguous transitions by date/from-ID/to-ID. The 293 count is **not** a count of House Committee decisions: one political event can produce several transitions. Gaps between faction periods are exposed through assignment checks, not silently converted to a transition.

`tenures`, `replacements`, `factionChanges`, and `investitureVotes` are in each `data/research/knesset-member-changes/kN.json`. The latter is empty because no official vote rows were retrieved; an empty array never means nobody voted or no government was formed. `scheduledFactionMemberships` separately retains K26's future records.

## Coverage

“Partial” applies to A–D collectively. A's reported tenure population is fully paged for K1–25; individual dates, faction gaps and legal notices still need reconciliation. B has entry/departure observations and probable pairs, but reasons, declined candidates and next-eligible checks remain unknown. C has observed affiliation transitions, not a complete decision register. D has no vote coverage.

| Knesset | Coverage | Tenures / people | Opening | Entry episodes | Probable pairs | Unpaired exits | Grouped faction transitions | Seat anomaly boundaries |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | Partial | 130 / 130 | 120 | 10 | 6 | 4 | 2 | 0 |
| 2 | Partial | 131 / 131 | 120 | 11 | 8 | 3 | 9 | 0 |
| 3 | Partial | 136 / 136 | 120 | 16 | 16 | 1 | 3 | 1 |
| 4 | Partial | 126 / 126 | 120 | 6 | 5 | 3 | 4 | 2 |
| 5 | Partial | 134 / 134 | 120 | 14 | 13 | 2 | 6 | 1 |
| 6 | Partial | 132 / 132 | 120 | 12 | 10 | 2 | 14 | 0 |
| 7 | Partial | 134 / 134 | 120 | 14 | 12 | 3 | 6 | 1 |
| 8 | Partial | 135 / 135 | 120 | 15 | 10 | 6 | 21 | 1 |
| 9 | Partial | 134 / 134 | 120 | 14 | 14 | 0 | 33 | 0 |
| 10 | Partial | 128 / 128 | 120 | 8 | 8 | 0 | 8 | 0 |
| 11 | Partial | 127 / 127 | 120 | 7 | 7 | 0 | 14 | 0 |
| 12 | Partial | 129 / 129 | 120 | 9 | 9 | 0 | 14 | 0 |
| 13 | Partial | 132 / 132 | 120 | 12 | 8 | 4 | 11 | 0 |
| 14 | Partial | 128 / 128 | 120 | 8 | 8 | 0 | 23 | 0 |
| 15 | Partial | 140 / 140 | 120 | 20 | 13 | 7 | 15 | 0 |
| 16 | Partial | 138 / 138 | 120 | 18 | 11 | 7 | 24 | 0 |
| 17 | Partial | 134 / 134 | 120 | 14 | 11 | 3 | 11 | 0 |
| 18 | Partial | 134 / 134 | 120 | 14 | 14 | 0 | 6 | 0 |
| 19 | Partial | 128 / 128 | 120 | 8 | 6 | 2 | 5 | 0 |
| 20 | Partial | 153 / 149 | 120 | 33 | 33 | 0 | 7 | 0 |
| 21 | Partial | 121 / 121 | 120 | 1 | 1 | 0 | 8 | 0 |
| 22 | Partial | 121 / 121 | 120 | 1 | 1 | 0 | 8 | 0 |
| 23 | Partial | 149 / 143 | 120 | 29 | 14 | 15 | 19 | 0 |
| 24 | Partial | 157 / 148 | 120 | 37 | 15 | 22 | 16 | 0 |
| 25 | Partial | 167 / 152 | 120 | 47 | 27 | 20 | 6 | 0 |
| 26 | Partial; future affiliations only | 0 / 0 | not yet held | 0 | 0 | 0 | 0 | 0 |

## Conflicts, diagnostics and notable cases

**Do not force the headcount to 120.** There are 120 opening identities for every K1–25, but the source intervals do not establish 120 sitting members on every later date. A vacancy between death/resignation and accession, a date error, or an endpoint convention can explain a shortfall; the cause requires primary evidence. The brief's “seat count stays 120” is a validation hypothesis, not evidence that every departure has a same-day replacement.

Using diagnostic half-open intervals `[start,end)`, six boundary dates fall below 120: K3 **1959-09-13 (119)**; K4 **1961-06-25 (119), 1961-07-25 (118)**; K5 **1965-09-17 (119)**; K7 **1974-01-15 (119)**; K8 **1977-05-19 (119)**. Each file retains all departure/entry dates for resolving these intervals. Counts are boundary observations, not a count of days vacant. The terminal end date is excluded from that term's headcount diagnostic.

Faction assignment checks examine every tenure/faction boundary and require exactly one faction per active person. Exceptions occur in K2 (1 boundary), K5 (1), K13 (2), K16 (3), K17 (2), K24 (3), K25 (2); IDs/dates are in `checks.factionAssignmentAnomalies`. These can be date discrepancies rather than substantive unknown affiliation. There are no observed multiple-faction assignments under this convention. Faction sizes have **not** been reconciled against the independent House Committee decision universe.

- **1990, K12:** exact database transitions show five members—Yosef Goldberg, Pinhas Goldstein, Pesah Grupper, Yitzhak Modai, Avraham Sharir—moving from faction 523 to 1026 on **15 March 1990**. Sharir returns on **18 June**, Goldberg on **4 December**. Four other transitions occur on **25 December** (Mizrahi, Peretz, Gur, Biton). The [official split/merge history](https://main.knesset.gov.il/mk/apps/faction/general/split-merge) surfaced as an **indexed-only lead** agreeing with the five-member March transition and December cases; it was not opened after the main website's location refusal. Exact legal decisions remain unverified. Do not retroactively call these members statutory “פורש” solely from the generic Hebrew verb “פורשים”.
- **Chikli, K24:** PersonID 30786 moves from Yamina faction 966 to individual faction 1080 on **25 April 2022**, records 23676/30063. Tenure record 23841 ends **14 July 2022**. The Knesset legal submission [Bagatz661522.pdf](https://main.knesset.gov.il/About/Departments/LDResponses/Bagatz661522.pdf) was indexed as describing the House Committee declaration on 25 April, but opening it returned a location denial. This is a **provisional decision lead**, not a retrieved decision. A [candidate-disqualification filing](https://www.gov.il/BlobFolder/generalpage/pm3_25-4_25/he/candidates_disqualification_pm4_25_disqualification_request_pm4_25.pdf) indexed a **12 July** resignation and an annexed decision, but its fetch returned 403. A resignation submission date and effective termination two days later are different claims; the apparent 12/14 July difference is not silently resolved into a contradiction or a single date.
- **Silman, K24:** PersonID 30718's tenure ends **13 September 2022**, record 23854. The database does not show a same-date faction transition equivalent to Chikli's declaration. Her reported coalition departure must not be converted into an official defector status. Search discovery found a 15 August 2022 committee-transcript mirror about a rejected split request ([locator](https://oknesset.org/meetings/2/1/2195274.html)); this remains an unverified pointer, not evidence promoted into the normalized data.
- **Norwegian-law research, K24:** 157 tenure episodes for 148 people; **9 repeat-entry episodes**. Examples are Matan Kahana's **15 May 2022** return and Yom Tov Kalfon's **14 July 2022** return. The latter coincides with Chikli's tenure end while multiple Yamina membership circumstances complicate pairing. The algorithm leaves ambiguous pairings unresolved rather than equating every departure with the next entrant. Legal grounds and candidate-declination chains still require notices.
- **Norwegian-law research, K25:** 167 tenure episodes for 152 people; **15 repeat-entry episodes**, including clustered July 2025 returns. PersonID 30873, Erez Malul, has a **zero-length 20 July 2025 tenure**, record 32308, retained and flagged rather than deleted. Its existence does not prove a positive-length period of service. Ministerial resignation and return grounds have not been independently verified.
- **Missing tenure-linked affiliation:** Yaakov Litzman, K24 record 23765, **6–8 April 2021**, has no positive-length intersecting faction row under the stated convention. Malul's zero-length K25 row similarly cannot receive an intersecting positive-length affiliation. Do not fill these gaps from general party knowledge.
- **K26:** 120 PositionID 54 records start **10 November 2026**, after this snapshot; there are **no PositionID 43/61 records** and no K26 faction-registry rows in this extraction. The dates table schedules its first period on 10 November, record 169. Therefore k26.json retains scheduled affiliations, leaves tenures empty and does not assert a checked first sitting or actual service. Faction IDs lacking registry rows remain as supplied in the position records.

These are evidence/reconciliation issues, not choices for the owner to settle by preference. Resolution needs official membership notices, committee decisions, and original candidate eligibility evidence.

## Access observations and reproduction

Run with Python 3.14 (standard library only), from the repository root:

```text
python3 scripts/research/fetch-member-changes.py
python3 scripts/research/build-member-changes.py
```

The fetcher makes sequential requests at least 1.1 seconds apart, sends `israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)`, follows returned pagination only within the official service, and stops on errors, refusals, detected challenges or Retry-After. It does not retry. No request includes the user's email. Review any refusal before a later run; the commands are reproduction instructions, not permission to retry a blocked route. No global cache/environment settings change.

88 v3 page responses were read in full as structured records: 80 position pages, 6 faction pages, 2 date pages. Each raw response is in `.backup-scratch/m2/raw/`, with URL, publisher, timestamp, SHA-256, row count and status in `manifest.json`. The builder verifies every recorded response hash and that every table's last page has no continuation. Raw files, schemas and routine build output are ignored scratch, approximately reproducible by those source queries; accepted normalized records and source code are durable. Backup exclusion outside Git was not verified.

Both official metadata URLs returned HTTP 200 and were parsed:

- [v3 metadata](https://knesset.gov.il/Odata/ParliamentInfo.svc/$metadata): no vote entities in the inspected schema.
- [v4 metadata](https://knesset.gov.il/ODATAV4/ParliamentInfo/$metadata): exposes `KNS_PlenumVote` and `KNS_PlenumVoteResult`, with title/subject, vote dates, member IDs and result descriptions.

One bounded v4 discovery query searched VoteTitle/VoteSubject for `כינון` / `כינונה`; it returned **HTTP 473**, no Retry-After. **Stopped, no retries or alternate route.** This is an observed refusal, not proof that the vote tables lack records, or a confirmed diagnosis of a bot challenge. Raw manifest: `.backup-scratch/m2/raw/vote-discovery-manifest.json`. The separate fetch script `fetch-member-change-votes.py` records this route and can retrieve results by *manually verified* vote IDs if authorized access later works. No query results were mistaken for individual roll calls; titles, dates and investiture identity must be verified before importing results, and result descriptions must be inspected before mapping to for/against/abstain/absent. Missing result rows must never automatically mean absent.

Opening the Chikli legal submission through web retrieval returned `https://www.knesset.gov.il/maintenance-page-geo` (“temporarily inaccessible from your location”); the route was stopped. Opening the gov.il filing returned **403**; stopped. Initial sandbox DNS failure was a local network restriction, not an origin refusal; normal authorized network retrieval then succeeded for v3/v4 schemas and the v3 extraction. No location/proxy/cookie/identity change was used to overcome a website refusal.

Press searches were limited to notable-case discovery, not an exhaustive search for all 378 replacement reasons. No English Wikipedia page was opened or used as evidence; incidental search hits were excluded. Official per-Knesset member pages, all Reshumot notices and every House Committee decision were not independently inspected. This is why all coverage remains partial.

## Compact evidence ledger and conclusion map

All rows accessed 7 November 2026 except retained name crosswalks (4 November). Official database queries are recorded in every kN.json source map. Access methods are sequential custom-UA HTTP for OData; web search/open for decision leads and website refusal observations. Publication dates of mutable OData records are not established; effective dates are retained per record.

| Claim | Inspected source and depth | Evidence family / limitation |
|---|---|---|
| E1: 3,378 reported tenures and 4,567 faction positions | Complete 80-page `KNS_PersonToPosition` query; fields read and normalized | Knesset database; one source, legal accuracy not independently checked |
| E2: 530 faction lifetimes and 165 parliamentary-period records | Complete 6-page `KNS_Faction`, 2-page `KNS_KnessetDates`; structured records read | Same database family; current names do not preserve a full rename history |
| E3: every K1–25 opening contains 120 IDs | E1 boundary computation, full retained tenure records | Derived check; not proof of 120 on every later day |
| E4: six later headcount anomalies, affiliation gaps, one zero-length tenure | E1 interval and assignment checks stored per Knesset | Challenges full reconciliation; endpoint semantics/vacancies need notices |
| E5: vote tables exist in v4, discovery refused | Both schemas read; one v4 query returned 473 | Same official service family; no vote-record coverage |
| E6: primary website/filing retrieval failed | One main.knesset.gov.il redirect, one gov.il 403 | Distinct access observations; no general finding that documents do not exist |
| E7: candidate ranks/identities have retained pointers | Existing bios and public candidate datasets read | Repository-derived, provisional, eligibility chain not checked |

| Conclusion / criterion | Supporting / challenging / contextual evidence | Status and confidence; evidence needed |
|---|---|---|
| Official extraction is fully paged for the three selected v3 tables | Supports E1–E2; context E5 | Pass, high for query coverage only; future revisions can change rows |
| Every historical first sitting has 120 reported opening members | Supports E3; context E1 | Pass for reported-date ID counts, high; sitting protocols needed for independent event proof |
| All seats and faction assignments reconcile throughout each term | Challenges E4; context E1–E3 | Unresolved; source intervals do not pass the diagnostic; notices and endpoint semantics needed |
| Complete replacement/eligibility/reason, formal faction-decision and investiture history | Challenges E4–E6; context E7 | Unresolved, high confidence in incompleteness; authorized primary documents, eligibility chains and verified roll calls needed |

Accounting: 3 fully paged table queries, 88 structured response pages, 2 parsed schemas, 1 refused vote query, 2 failed document opens. Indexed decision/history pages and press pointers are discovery only, not reviewed primary records. Independent corroborating families for the normalized facts: **not established**. Search-result counts and total web pages searched were **not measured**; search tools' reliable origin headers are **not available**; a vote-row count is **not available**, not zero.

Verification before commit: all 26 files parsed; every one of the 3,378 source tenure IDs occurred exactly once; normalized tenure and linked faction fields matched raw records; every item citation resolved to its declared source; no probable pairing reused a departure; all 25 opening counts were 120; K26 remained future-affiliation-only. All three research scripts compiled. These checks verify extraction/normalization, not the unresolved historical/legal claims. No application tests were needed because application code and data were untouched.
