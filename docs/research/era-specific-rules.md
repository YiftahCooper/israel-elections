# Election-specific rules and circumstances: coverage inventory

| Item | Elections affected | App support | Explorer priority |
|---|---|---|---|
| A1. Constituent Assembly identity and transition | 1949 / k1 | Partial | High |
| A2. 1949 quota, admission to remainders, rounded quotients | k1 | Supported | High |
| A3. Largest unused remainders; one award per unit | 1951–1969 / k2–k7 | Supported | High |
| A4. Bader–Ofer and half-seats safeguard | 1973 onward / k8–k26 | Supported | High |
| A5. Percentage threshold changes | k1; k2–k12; k13–k16; k17–k19; k20–k26 | Supported | High |
| A6. Connections/surplus agreements predate Bader–Ofer | All eras; different eligibility in k1 | Supported | High |
| A7. Era-specific ties and official lotteries | k1; k2–k7; k8–k26 | Partial | High for exact counterfactual ties |
| A8. Flatto-Sharon's unfillable second seat | 1977 / k9 | Partial: implemented inference | High |
| A9. Complete candidate capacity outside k9 | All, especially early truncated rosters | Missing as a general legal model | Medium |
| B1. Separate PM ballot, separate valid/invalid totals | 1996 / k14; 1999 / k15 | Missing | High |
| B2. Five nominated PM candidates, three withdrawals | 1999 / k15 | Missing | High |
| B3. PM majority/runoff and candidacy conditions | 1996, 1999, 2001 | Missing | Medium; high for simulation |
| B4. Standalone PM election; no new Knesset | 2001, during k15 | Missing | High |
| B5. Split-ticket voting and ballot independence | 1996, 1999 | Missing | High |
| C1. Excluded lists and reversed exclusions | k6, k11–k13, k16, k18–k26 (details below) | Partial: final inputs, little procedural history | High |
| C2. Individual disqualification versus list exclusion | 2019 k21–k22; 2026 k26; reversals in other years | Partial | High |
| C3. Withdrawn lists versus valid below-threshold lists | Selected elections, including k18, k19, k21–k23, k26 | Partial | High |
| C4. Registered, declared elected and opening-day members | k3, k12–k16, k20, k23–k24; others possible | Partial | High for candidate browsing |
| D1. Official corrections versus secondary/transcription errors | k11, k14, k16–k19; possibly others | Partial | High |
| D2. Appeals, recounts and changing provisional seats | Especially k21–k22; general appeals framework | Partial: final result only | High |
| D3. Soldiers/double envelopes and late counting | All eras; documented k19 example | Partial | High |
| D4. Prison voting, hospital voting, overseas/ship voting | Era-dependent; k12 onward, k14 and later; see below | Partial | Medium |
| D5. Pandemic voting arrangements | 2020 / k23; 2021 / k24 | Partial: final votes only | Medium |
| E1. War-delayed election | 1973 / k8 | Partial: correct date | High |
| E2. Early and repeat elections are separate contests | Especially 2019–2022 / k21–k25 | Partial | High |
| E3. Joint lists, subsequent faction splits and bloc dates | Many; k11, k15, k22–k24 particularly | Partial | High |
| E4. Norwegian law changes members, not list seats | From 2015 / k20 onward, version-dependent | Missing membership timeline | Medium |
| E5. Rotation versus statutory alternate PM | 1984 / k11; 2020 / k23; 2021 / k24 | Partial: initial coalition grouping | Medium |
| E6. Campaign-finance equality and party-registration changes | 1969 / k7; later elections including k13–k14 | Missing context | Low for seat calculation |
| E7. Publication status is part of the result | Especially 2026 / k26 | Partial: explicit pending gazette | High |

## Scope, evidence and meaning of support

Research date: **4 November 2026**. Repository baseline: `a6052af`, branch `t3/bc2a1d0e`. This is a report only; proposed work below has not been implemented. “Supported” means the audited source path represents the relevant calculation/input, not that every historical administrative detail has been independently certified. “Partial” identifies both working support and its boundary. Priorities concern understanding the selected election, not political importance.

The inventory covers allocation, ballot types, participation, result versions and circumstances that change interpretation of the app's votes, elected names or coalitions. It does not enumerate every polling-place instruction, campaign case, resignation or funding amendment. **No defensible claim of an exhaustive list of every one-off circumstance is possible from the inspected archive set.** Unclosed searches are recorded below, particularly court-ordered recounts, printed PM-ballot withdrawals and some point-in-time amendments. These are research gaps, not findings that the events never occurred.

Evidence labels used throughout:

- **Observed**: inspected repository content, source text or scan page; distinguishes the app's state from historical truth.
- **Sourced**: stated by the identified publisher; secondary accounts are expressly labelled.
- **Inference**: a proposed interpretation or implementation implication, not a fact supplied by the source.
- **Unresolved**: insufficient inspected primary evidence to promote the claim into historical data.

Requested files were read first: `README.md`, `PRODUCT.md`, `docs/DEVELOPMENT.md`, `src/engine/rules.ts`, `src/engine/allocate.ts`, `src/model/scenario.ts`, `scripts/build-datasets.ts`, `data/meta/README.md`. Follow-up inspection covered the schema, historical builders, published JSON, candidate notes and existing decision/research records. Older decision records retain historical release holds; their later addenda and current code supersede them. In particular, earlier statements that k8 is unavailable or that envelope handling is hard-coded to 9999 are stale.

## A. Seat rules

### A1–A3. The founding election and the pre-1973 method

**Elections/rule.** The 25 January 1949 election chose the Constituent Assembly, which became the First Knesset under the Transition Law on 16 February 1949. It was not a second election or a seat reallocation. Primary institutional locator: [Knesset, Constituent Assembly](https://main.knesset.gov.il/About/Lexicon/pages/asefa.aspx); retrieval here redirected to a geographic-unavailability page, so the date/transition is supported by its indexed institutional text and the existing project law research, not a newly inspected Transition Law scan.

For allocation, the original [1948 ordinance, §§26, 30–32](https://fs.knesset.gov.il/0/law/0_lsr_312706.pdf) uses `floor(valid / 121)` for the 120 seats, initial whole quotas, then highest averages among units already holding an initial seat. Quotients are truncated to integers before comparison. There is **no statutory percentage threshold**: calling this simply “1%” or imposing an exact 1/120 threshold would be wrong. Connections require an initial seat for each partner; internal redivision also uses the seat count plus one in its quota divisor.

The [1951 law, §§29, 38–40](https://fs.knesset.gov.il/1/law/1_lsr_208018.pdf), [1955 consolidation, §§33, 43–45](https://fs.knesset.gov.il/2/law/2_lsr_311000.pdf), [1959 consolidation, §§26, 37–39](https://fs.knesset.gov.il/3/law/3_lsr_311002.pdf) and [original 1969 consolidation, §§67, 81–83](https://fs.knesset.gov.il/6/law/6_lsr_311009.pdf) establish the k2–k7 regime: 1%, floor quota over qualifying votes, largest unused remainders, one additional seat per competing unit, no half-seats safeguard. These are retained primary sources; detailed clause/amendment comparison is recorded in [decision 0060](../decisions/0060-k1-k7-primary-allocation-rules.md).

**Observed app support.** `src/engine/rules.ts`: `ISRAEL_1949`, `quotaSeatOffset`, initial-seat conditions, `quotientRounding: 'floor'`; `ISRAEL_1951`, `largestRemainderRepeat: false`, no majority cap. `src/engine/allocate.ts` applies these at national and internal-pair stages. `src/model/scenario.ts:electionRuleSetId` selects by election id. `scripts/lib/historical/k1-k7-common.ts` uses the retained reviewed inputs. Supported for calculation; partial for founding-institution explanation.

**Needed / priority.** UI/data: a short sourced k1 institutional note and accurate quota wording. No new allocation algorithm. High: these change how a voter should interpret the entire walkthrough.

### A4–A6. Bader–Ofer, threshold dates and agreements

**Sourced rule.** [Amendment 4, SH 692 p.108](https://fs.knesset.gov.il/7/law/7_lsr_211799.pdf) introduces the k8-onward highest-average remainder mechanism, the equal-quotient lottery and half-seats restriction. Initial seats still use a floor quota; agreements compete jointly in the remainder stage, followed by fresh internal allocation. It is not safe to describe every intermediate step as plain D'Hondt.

| Elections | Percentage admission threshold | App preset |
|---|---:|---|
| k1 (1949) | No statutory percentage | `ISRAEL_1949` |
| k2–k7 (1951–1969) | 1% | `ISRAEL_1951` |
| k8, k10–k12 (1973, 1981–1988) | 1% | `ISRAEL_1973` |
| k9 (1977) | 1% | `ISRAEL_1977`, with capacity inference |
| k13–k16 (1992–2003) | 1.5% | `ISRAEL_1992` |
| k17–k19 (2006–2013) | 2% | `ISRAEL_2004` |
| k20–k26 (2015–2026) | 3.25% | `ISRAEL_2014` |

Sources for the later threshold chronology: [Knesset threshold lexicon](https://main.knesset.gov.il/About/Lexicon/pages/qualifying-threshold.aspx), and the official CEC [2003 allocation explanation](https://www.gov.il/apps/elections/elections-knesset-16/heb/about/seats_system.html) versus [2006 explanation](https://www.gov.il/apps/elections/elections-knesset-17/heb/about/ElectoralSystem.html), already audited in `docs/ELECTORAL-LAW.md`. The 2004 amendment does **not** apply to the 2003 election. An archived site's current consolidated law can contain later amendments; its directory date is not proof of election-day wording.

**Agreements:** one partner per list, maximum pair size two, existed before 1973. In k2 onward both partners must individually pass the percentage threshold; in k1 both must have initial seats. A connection is not a merger, and cannot rescue a below-threshold partner. The pair itself is a competitor under each era's remainder rule. An agreement with a nonqualifying partner is historically meaningful even when ineffective.

**Observed support.** Supported: presets above; `allocate.ts` structural checks and eligibility; per-election `agreements` with source ids; scenario agreement editing. The retrieved complete [k8 CEC allocation appendix](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/memorandum-knesset8/he/archive_knesset8_memorandum-apdx.pdf), pp.10–11, is the primary source for its six pairs, including ineffective ones; see [k8 research](k8-1973-agreements.md). The 1965 discrepancy was resolved by correcting a misread agreement partner, not inventing a new allocation method (`docs/decisions/0069a-k6-corrected-connection-national-release.md`).

**Needed / priority.** UI/source presentation only for these established rules; keep ineffective agreements visible and never infer them by fitting seats. High. General point-in-time administrative/amendment coverage remains narrower than the engine's “historical” label.

### A7. Ties: statutory lottery versus unresolved earlier procedure

**Elections/rule.** The 1949 ordinance expressly provides a lottery after comparing rounded integer quotients; the 1973 amendment expressly provides one for equal highest-average quotients. The inspected 1951–1969 allocation clauses do not specify the equal-remainder procedure. That absence is not proof that no other applicable instruction existed. No actual historical seat lottery was established in this pass.

**Observed support.** `allocate.ts` records tied units and allows `lotteryWinners`; it otherwise selects a provisional winner with `lottery-required`. `ISRAEL_1951.tiePolicy` is `unspecified`, and its warning preserves that legal uncertainty. Partial: counterfactual machinery exists, but there is no sourced historical-lottery outcome register or complete early procedural authority.

**Needed / priority.** Data/UI: attach actual lottery minutes if located; distinguish a supplied scenario outcome from an official draw. Research, then engine only if early authority changes behavior. High when an exact tie is reached; low for an untied baseline. Do not infer a lottery merely from close votes.

### A8–A9. 1977 candidate capacity and incomplete rosters

**Observed primary result.** [YP 2326 pp.1494–1496](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset9-results.pdf) gives Flatto-Sharon (פש) 35,049 votes and one seat. [YP 2319 p.1330](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset9-cand.pdf) has a sole candidate. An unconstrained allocation gives him two seats. The app caps his seat at one and continues distributing; Sheli receives the other seat and the published table is reproduced.

**Inference, not established law.** The precise statutory/CEC redistribution authority was not located. Reproducing a table does not uniquely prove the historical procedure. [Decision 0073](../decisions/0073-k9-candidate-cap-inference.md) records that limitation; later release decisions preserve it.

**Separate submission limit.** Elections Law §57(a), in the [CEC candidacy-law collection](https://www.gov.il/apps/elections/heb/law/LawsForCandidacy.html), limits a submitted roster to 120 eligible, consenting names in rank order. This is a maximum roster size, not a rule awarding an empty seat or redistributing excess seats. The official indexed text was located; its complete amendment history back to 1949 was not audited. The app accepts hypothetical candidate editing and is not a legal nomination-validation service. This is contextual/partial support; add a submission-limit explanation, and validate per-era roster limits only if legal nomination editing enters product scope.

**Observed support.** `ISRAEL_1977.seatsCappedAtCandidates` is enabled only for k9. `scenario.ts` supplies candidate capacity only for known complete rosters; unavailable/truncated rosters produce unknown capacity. Thus this item is **partial**, even though its selected implementation works. Neither the 120-member chamber nor a maximum submitted-list size is proof of a universal redistribution rule for exhausted candidates.

**Needed / priority.** Research the contemporaneous ruling first; retain the inference label. Data: complete rosters where needed. Engine: generalize capacity/empty-seat behavior only after era-specific authority is found. UI: expose unknown capacity in hypothetical large swings. High for k9; medium for general counterfactuals. The missing Ratz elected-name paragraph in the original publication is a separate publication problem, subsequently cross-checked against Knesset membership; it does not justify changing vote totals.

## B. Direct PM elections: results and modeling boundary

### B1. Official candidate results are retrievable, two already retained

The manifest describes the k14/k15 results files as “Knesset ballot only”; **the complete scans also contain PM notices**. This was visually checked in this pass, not inferred from another website.

| Event | Candidate votes in the CEC signed notice | Valid PM votes | Invalid PM votes | PM votes cast | Proof status |
|---|---|---:|---:|---:|---|
| 29 May 1996, alongside k14 | Benjamin Netanyahu **1,501,023**; Shimon Peres **1,471,566** | **2,972,589** | **148,681** | **3,121,270** | Candidates/valid: CEC notice; invalid/cast: official MFA publication, not printed in the inspected PM notice |
| 17 May 1999, alongside k15 | Ehud Barak **1,791,020**; Benjamin Netanyahu **1,402,474** | **3,193,494** | **179,458** | **3,372,952** | Candidates/valid: CEC notice; invalid/cast: labelled secondary IDI table footnote; primary CEC totals still to verify |
| 6 February 2001, PM only | Ariel Sharon **1,698,077**; Ehud Barak **1,023,944** | **2,722,021** | **83,917** | **2,805,938** | All five figures visually read in CEC notice, YP 4960 p.1628 |

Primary locators and tooling findings:

1. **1996:** [CEC/Reshumot YP 4414, pp.3483–3484](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset14-results.pdf), PDF pp.3–4. Already retained as `data/raw/research/k14-results.pdf`, manifest `k14-results-gazette`. PDF p.3 prints both candidates and total valid; p.4 declares Netanyahu elected. The [official MFA results publication](https://www.gov.il/en/pages/israeli-election-results-may-1996) supplies PM invalid/cast figures. Its **Knesset** figures differ from the app's gazetted final Knesset figures; do not replace the latter with the MFA table.
2. **1999:** [CEC/Reshumot YP 4757, p.3376](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset15-results.pdf), PDF p.2. Already retained as `data/raw/research/k15-results.pdf`, manifest `k15-results-gazette`. The PM notice appears above the Knesset notice; it does not give PM invalid/cast totals. [IDI, *The Elections in Israel 1999*, introductory chapter, printed p.8 / PDF p.7, table 1 footnote](https://www.idi.org.il/media/5026/%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9E%D7%91%D7%95%D7%90.pdf) was visually inspected and gives 179,458 invalid and 3,372,952 participating in the PM ballot. **Secondary**, even though its footnote attributes data to the CEC. Do not compute PM cast from the Knesset cast count.
3. **2001:** The [CEC historical catalogue](https://www.gov.il/he/pages/election-committee-history?chapterindex=7) identifies YP **4960**, **12 February 2001**, **p.1628**, and candidate publication YP 4948 p.1054. [Public mirror of the official YP 4960 issue](https://olaw.org.il/yalkut/yalkut-4960.pdf), PDF p.2, was retrieved successfully with the required User-Agent and read visually. It includes electorate **4,504,769** as well. This is primary statutory content on a non-government mirror, not a newly verified government-hosted download. SHA-256: `405f7587ede7f13dbc4acdabdbf3ddeb99524c5def26add92259e40cdf37970f`.

**Retrievable with project tooling?** For 1996/1999, yes: the required candidate/valid figures are in retained, hashed PDFs already fetched by the project. The existing builders do not extract them. The scans have no useful text layer; `pdfLines` returned no results on these pages. Render with PDF.js using its `wasmUrl` to decode the scanned images, then review/transcribe as with the other historical inputs. For 2001, the same HTTP/PDF/reviewed-JSON workflow can retrieve the public mirror (HTTP 200 observed), but it is **not registered in the current fetcher/manifest** and no builder consumes it. The existing app therefore cannot load the event simply by rerunning `data:build`.

Official archive HTML returned 403 to direct requests; some Knesset pages redirected to geographic-unavailability notices. No bypass was attempted. The CEC catalogue advertises a 1999 PM polling-station download; its actual file was not fetched or reconciled here. Government-hosted 2001 results-table accessibility and primary 1999 invalid/cast totals remain open. Do not confuse “official source located” with “every field machine-extracted and validated.”

**Observed support.** Missing: `src/data/schema.ts` has only Knesset list totals and `ElectionId = k1…k26`; `Scenario` has one electorate/invalid count and no contest type, PM candidates or second ballot. `scripts/lib/historical/k13-k15-common.ts` builds Knesset results only. `scripts/build-datasets.ts` has k1–k26 jobs and no PM-only job.

**Needed / priority.** Data/schema: add a separate sourced PM contest associated with k14/k15, with its own valid, invalid, cast, candidates and publication status; allow an explicit primary-evidence gap rather than invent totals. UI: an adjacent PM results panel. Engine: no Knesset-allocation change to display these results. High.

### B2–B5. Nominations, withdrawals, runoff, independent ballots, 2001

**Sourced law, operative-era starting point.** [Basic Law: The Government (1992), §§3–13, 1992 Elections Law amendments in §62](https://fs.knesset.gov.il/12/law/12_lsr_210707.PDF): separate ballots/envelopes; PM election by over half the valid votes, with an additional round between the leading eligible candidates if necessary. The repeat round is on the first Tuesday after two weeks from publication of first-round results. Ordinary-election PM candidates must head a Knesset list and become MKs. Nomination routes include qualifying parliamentary support or 50,000 electors. A withdrawal does not itself postpone voting; death/incapacity and replacement have separate rules. This is the original enactment, **not proof that no later amendment applied**, particularly to 2001 eligibility. Check the operative consolidated text before implementing candidacy simulation.

**1996:** Netanyahu and Peres were the final candidates. **1999:** five initially stood: Barak, Netanyahu, Yitzhak Mordechai, Ze'ev Binyamin (Benny) Begin and Azmi Bishara; the latter three withdrew before election day. [IDI's 1999 election history](https://www.idi.org.il/policy/parties-and-elections/elections/1999/) is the secondary source; the final CEC notice above independently establishes that only Barak and Netanyahu received the published valid candidate totals. No runoff occurred in these actual results.

**Printed-ballot qualification:** the late withdrawals are well established in secondary histories, but a primary print order/CEC instruction establishing exactly whose already-printed slips remained where, when removed, and how each was classified was **not retrieved**. Do not present withdrawn PM candidates as zero-vote finalists, assign their slips to another candidate, or turn a PM withdrawal into a Knesset-list withdrawal. Their Knesset lists still competed. Obtain the 1999 CEC chair's decisions and withdrawal notices before illustrating this procedure as fact. A further point-in-time gap is the December 2000 amendment commonly called the “Netanyahu law”; [IDI's party-history draft](https://www.idi.org.il/media/17403/political-parties-in-israel-draft.pdf) is a secondary lead to the non-MK eligibility exception, not authority to apply the original MK-only condition unchanged in 2001.

**Split-ticket voting:** independent ballot choices permit supporting a PM and another list. Aggregate PM/list totals cannot reveal individual cross-voting; do not fabricate a voter-transfer matrix from them. The fact of separate ballots is statutory; attribution of fragmentation to the reform is an interpretation and should remain secondary/explanatory. No seat bonus or automatic coalition majority follows a PM win.

**2001:** the special election occurred during the Fifteenth Knesset and elected Sharon against Barak, with **no new Knesset election or seat redistribution**. See the CEC notice and [IDI's 2001–2009 account](https://www.idi.org.il/parliaments/3467/8203) (secondary). Repeal of direct election restored the one-ballot system for the 2003 election; do not erase the 2001 event or relabel it k16.

**Observed support / needed.** All missing as PM functionality. Model PM voting as a separate contest, optionally with a separate majority/runoff function. Retain k15's 1999 seats when displaying the 2001 event; link the event to the later government, rather than overwriting k15's first-government scheme. PM vote edits must not automatically alter list votes. High for history/results; medium for legal candidacy/runoff simulation, which requires additional operative-law verification.

## C. Who could compete and who actually took seats

### C1–C2. Disqualifications: decision, appeal, final status

The [IDI disqualification review, 31 August 2026](https://www.idi.org.il/articles/65951) is **secondary** and its historical table ends in 2022. Its compact chronology is:

| Election | List/person; final outcome |
|---|---|
| 1965 k6 | Socialist List excluded; *Yardor* appeal rejected |
| 1984 k11 | Kach and Progressive List for Peace initially excluded, restored by Supreme Court |
| 1988 k12 | Kach excluded, appeal rejected |
| 1992 k13 | Kach and Kahane Chai excluded, appeals rejected |
| 2003 k16 | Balad, Azmi Bishara, Ahmad Tibi exclusions reversed |
| 2009 k18 | Balad, Ra'am–Ta'al exclusions reversed |
| 2013 k19 | Haneen Zoabi exclusion reversed |
| 2015 k20 | Zoabi and Baruch Marzel exclusions reversed |
| April 2019 k21 | Ra'am–Balad and Ofer Cassif restored; Michael Ben-Ari disqualified by Court |
| September 2019 k22 | Baruch Marzel and Bentzi Gopstein disqualified by Court |
| 2020 k23 | Heba Yazbak and Mishpat Tzedek restored |
| 2021 k24 | Ibtisam Mara'ana restored |
| 2022 k25 | Balad restored |

The governing framework changed: 1965 exclusion preceded express §7A grounds; §7A was added in 1985; personal disqualification powers were added later. Primary reference path: Basic Law: The Knesset §7A and Elections Law §63A; the CEC's [official legal history chapter](https://www.gov.il/BlobFolder/guide/book_75_chapters/he/%D7%94%D7%A4%D7%A8%D7%93%D7%AA%20%D7%A8%D7%A9%D7%95%D7%99%D7%95%D7%AA%20%D7%95%D7%93%D7%99%D7%A0%D7%99%20%D7%93%D7%9E%D7%95%D7%A7%D7%A8%D7%98%D7%99%D7%94.pdf) is an institutional route to the judgments. The entire original judgment set was not inspected; the table is not labelled primary-verified case by case.

**2026 is separately observed in retained CEC captures**, `data/raw/k26/govil-list-pages.exa.json`, and `public/data/k26.json`: Ra'am and the Joint List were restored after initial exclusion; Cassif's exclusion was not approved; Sami Abu Shehadeh withdrew, so his case did not require a Court decision. The captures also contain candidate-eligibility removals under §§62B/63, which are not necessarily ideological §7A exclusions. Exact original per-list URLs are retained inside that source. This prevents incorrectly extending the IDI historical table into a claim that no 2026 exclusions occurred.

**Observed support.** Partial: official final votes determine participating lists, but there is no structured proposed/approved/disqualified/reinstated/withdrawn status history. k26 preserves official Hebrew notes; k22–k24 preserve some gazette notes. Absence of an excluded list from a results table does not explain why it is absent. A zero-vote registered list is not proof of either withdrawal or exclusion.

**Needed / priority.** Data/UI: sourced final-status events with dates, authority, appeal outcome and affected candidate rank; separate whole-list and individual decisions. Engine: consume final eligible rosters, not predictions about court outcomes. High. A final-list input can be correct while its historical explanation is missing.

### C3. Withdrawn lists and continuing Knesset candidacies

**Observed cases:** k18 has an approved פח roster absent from final contestants; k19 similarly has זה/פך zero columns excluded from final contestants (`k18-k19-common.ts`). Do not assign reasons without a withdrawal notice. k21 retains zero-vote Yachad as `withdrawn: false`, whereas secondary accounts describe its withdrawal. k23 explicitly sets Tzomet (זץ) withdrawn following the gazette's all-candidates-resigned notice. k26 sets Blue and White (כן) and Ahi (צבי) withdrawn; the former roster is a labelled secondary fallback, while official withdrawal wording is retained in notes. Other historical withdrawn-list notices remain incompletely catalogued.

**Source authority:** approved gazettes and CEC final results, via `data/raw/SOURCES.json`; for k23, the source-linked gazette and note retained in `public/data/k23.json`; for k26, the captured CEC pages. These are observed input distinctions, not a claim that all absent lists were legally withdrawn.

**Support / need.** Partial. `actions.ts:setWithdrawn` moves held votes into invalid and restores them reversibly; `allocate.ts` excludes withdrawn lists from valid threshold votes and disables agreements. This is a useful hypothetical action, not a history of actual invalid slips. Add evidence-based statuses and zero-vote explanations; preserve the difference between withdrawing and deleting a list. No automatic transfer of its votes to an endorsed party. High.

### C4. Registered rank, gazetted election and opening-day membership

**Observed primary records:** retained candidate/results notices and Knesset OData disagree legitimately when someone declines a seat after election. `data/meta/candidate-notes.json` documents Moshe Kol → Idov Cohen (1955), Natan Sharansky → Marina Solodkin (2003), Ilan Shohat → Robert Ilatov (2015), Yael German → Idan Roll (2020), Alon Davidi → Idit Silman (2021). k12's Reiser issue and k13–k15 skipped ranks are handled from gazetted elected names; Deri's 19 May 1999 withdrawal is printed in YP 4757 p.3378. See [opening-member audit](elected-names-odata-audit.md) and `docs/DATA.md` for the precise retained records and uncertainty about other withdrawal dates.

**Support / need.** Partial: `Candidate.notSeated`, `notSeatedRanks` and notes preserve some pre-declaration omissions; selected later opening-day replacements are notes without changing the simulator's gazetted selection. Add explicit snapshot labels (“registered”, “declared elected”, “served at opening”) and a sourced membership timeline only if desired. List seat counts do not change. High for users inspecting people, medium for seat-only exploration.

## D. Counting, corrections and exceptional voting procedures

### D1. Published contradictions are not all recounts

| Election | Observed distinction and current treatment | Support / work needed |
|---|---|---|
| 1984 k11 | Candidate gazette misprints Eliyahu Speiser; results notice supplies correct name. | Supported display correction in candidate notes; preserve both texts. |
| 1996 k14 | Retained final gazette versus differing MFA Knesset table; also a rejected secondary 550-vote discrepancy in existing research. | Supported use of primary Knesset figures; improve source-version explanations. |
| 2003 k16 | Printed list counts exceed the gazette's own valid total by 410; builder uses reconciled polling sums for Mafdal/Lider. | Partial: documented discrepancy, no verified formal erratum asserted. |
| 2006 k17 | Polling cast sum is nine below national gazette valid+invalid. | Partial: disclosed, authoritative explanation not found. |
| 2009 k18 | Gazette invalid 49,684 versus CEC memorandum/polling invalid 43,097; same valid list votes. | Partial: chosen basis disclosed, no formal erratum located. |
| 2013 k19 | Gazette printed valid 3,792,472 versus list sum/final CEC 3,792,742; final list changes +109 Likud–Yisrael Beiteinu, −107 Kadima, −2 Hayisraelim; seats unchanged. | Partial: final figures represented, causal/official correction history unresolved. |

Primary locators: [2009 CEC memorandum](https://www.gov.il/apps/elections/elections-knesset-18/heb/about/Electoral_result.pdf), [2009 gazette](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset18-results.pdf), and the 2013 CEC results/datastore and gazette sources registered under `k19-*` in `data/raw/SOURCES.json`. Repository evidence: `scripts/lib/historical/k16-k17-common.ts`, `k18.ts`, `k19.ts`, `k18-k19-common.ts`, and decisions 0040–0042. These numeric distinctions are inherited primary-source audits, not fresh re-counts of every polling record in this pass.

**Need / priority.** Data/UI: name the chosen publication, expose conflicting figure and provenance, distinguish source correction from app transcription repair. Engine: no special seat rule established. High for trust and turnout comparisons. Never call a digit transposition a court ruling without one.

### D2. Court appeals and recounts: keep a clear unresolved boundary

The national-election appeal framework permits challenging results; [Knesset's 2019 election information sheet](https://m.knesset.gov.il/News/PressReleases/Documents/b2019.pdf) describes the Jerusalem District Court route. This is different from Supreme Court eligibility appeals before polling.

April 2019's provisional distribution changed before final certification (final k21: Likud 35, UTJ 8); September 2019 final k22 has Likud 32, UTJ 7. Published reporting describes checks and competing appeals: [16 April report](https://www.walla.co.il/news/politics/3230943), [10 October appeal report](https://www.walla.co.il/news/politics/3317488), both **secondary**. The app contains those final seat distributions in `officialSeats`.

**Unresolved:** this pass did not establish a specific court order that changed a national seat result, nor assemble a complete court-ordered recount register for 1949–2026. Requests for recounts, CEC administrative checks, petitions and court-ordered recounts must not be conflated. The early-election search and modern k21/k22 searches did not yield an inspected original order sufficient to make that assertion. Record this as an open primary-source task, not “no court-ordered recounts ever.”

**Support / need.** Partial final snapshots only. Add dated publication/appeal events and links to actual orders, if retrieved; retain separate provisional/certified/corrected datasets only when sources support them. Do not modify the seat engine for ordinary counting corrections. High for recount explanations; lower for reproducing an already-final result.

### D3–D4. Soldiers, late envelopes and changing voting populations

Primary inspected source: [Knesset Research and Information Center, *Voting in double envelopes*, 24 March 2019](https://fs.knesset.gov.il/globaldocs/MMM/2e5ce5ea-ec1e-e911-80e1-00155d0a98a9/2_2e5ce5ea-ec1e-e911-80e1-00155d0a98a9_11_10970.pdf), pp.2–4, 6–8. It explains identity checking and centrally counted envelopes; these include more than soldiers. Prison polling operated from k12 (1988), following the 1986 amendment after *Hukma*. Ship voting last occurred in k14 (1996), as of that 2019 review; a newly legislated staff-voting facility was not used in k21. It gives a concrete k19 (2013) late-count example: a seat shifted from Ra'am–Ta'al to Jewish Home. Counting can take days, while military and diplomatic voting may take place before election day. These are voting/counting procedures, not a different weight per ballot.

The [1996 hospital-voting regulations in the CEC archive](https://www.gov.il/apps/elections/elections-knesset-17/heb/law/HospitalVotes.html) supply an additional era-specific legal locator; initial implementation and subsequent amendments should be checked before claiming all groups were covered identically in every earlier election. [1992 overseas-voting regulations](https://www.gov.il/apps/elections/elections-knesset-17/heb/law/LawIndex.html) are indexed in the official law collection, but not fully inspected in this pass. Do not present general expatriate postal voting as an Israeli facility.

**Observed support.** Partial: final national votes include counted envelopes; locality datasets preserve special aggregates where available. `src/data/schema.ts:isEnvelopeRow` handles explicit flags, canonical 9999 and names beginning מעטפות; `Turnout.tsx` excludes them from locality-demographic presets, `Panels.tsx` labels them unattributable to localities. Builders handle historical codes (k16/k18 code 0, k19 code 875, modern canonicalization). There is no time-ordered election-night count or category-by-category historical eligibility model. k1–k15 currently lack locality files despite available archive leads.

**Need / priority.** Data/UI: a dated procedure note, distinguish envelope groups from geographic residents, never count envelope electorate twice. Use official category/time series only where available. Engine unchanged. High for interpreting localities and “soldiers changed the result”; medium for an administrative history.

### D5. Pandemic exceptions

**Sourced / primary locators.** 2020 and 2021 required arrangements for isolation/infection. For k24, [CEC health instructions, 2021](https://www.gov.il/BlobFolder/legalinfo/kor56/he/files_legislation_corona_Kor56.pdf) and [Knesset research spotlight](https://fs.knesset.gov.il/globaldocs/MMM/c0c3f04c-ad4e-eb11-810a-00155d0aee38/2_c0c3f04c-ad4e-eb11-810a-00155d0aee38_11_17727.pdf) identify special polling and protective arrangements. Their full texts were not successfully opened through the web reader in this pass; indexed official text supports the existence of the arrangements, not every operational detail. Do not import 2021 procedures unchanged into 2020 or 2022.

**Support / need.** Partial final votes; missing contextual events and polling-category explanations. Add source-checked k23/k24 notes; no threshold or seat formula change established. Medium.

## E. Election identity, governments and post-election politics

### E1–E2. Delay, early elections and the 2019–2022 sequence

**1973:** the CEC historical catalogue and [Knesset war history](https://main.knesset.gov.il/About/Occasion/pages/yomkippurwar.aspx) identify postponement from **30 October to 31 December 1973** because of the Yom Kippur War. Correct date is in k8; the pre-delay candidate publication and later final sources are different snapshots. Partial: missing explicit delay explanation. Add a source-linked event, not another election or allocation preset.

**2019–2022:** k21 (9 April 2019), k22 (17 September 2019), k23 (2 March 2020), k24 (23 March 2021), k25 (1 November 2022) are five distinct Knesset elections, not successive rounds of one ballot. k21 and k22 produced no new government; k23 did. Sources: official election dates in the CEC catalogue, institutional Knesset histories, and [IDI's 2019–2021 research volume](https://www.idi.org.il/media/18514/the-elections-in-israel-2019-2021.pdf) (secondary). Dissolution laws, failed formation, budget deadlines and dissolution of the later government are different legal routes; do not label every short term “failed to pass the threshold” or “runoff.”

**Observed support.** All five have separate datasets, comparisons and dates. `data/meta/k21.json`/`k22.json` explicitly omit a first-government scheme and use other dated groupings. There is no general dissolution/formation timeline. Historical triggers for earlier early elections also remain outside the schema. Partial.

**Need / priority.** UI/data: sourced election-to-election timeline with reason, outgoing caretaker government, whether a new government formed, and date of each bloc snapshot. No change to allocation. High, including a distinct link to the 2001 PM-only event.

### E3. Alliances and faction splits do not reallocate election seats

**Observed support.** `data/meta/kNN.json` provides sourced constituent parties, candidate rank attribution, dated bloc schemes and unknown assignments. `scenario.ts:Scenario.factionSplits` and `actions.ts:setFactionSplit` distinguish a post-election faction split from running the parties separately, which changes vote inputs and reruns allocation. Individual/party bloc overrides exist. This is partial historical support, not an automatic membership timeline.

Important examples already documented in metadata include Mapam versus the 1984 unity coalition; One Israel's Labor–Gesher–Meimad composition in 1999 and its later changes; and Blue and White's parties and split after the 2020 election. Primary evidence is retained Knesset faction/member OData and official gazetted sponsors, with later faction history explicitly distinguished from election-day party attribution. [Metadata methodology](../../data/meta/README.md) discloses secondary and uncertain assignments.

**Need / priority.** Keep “run separately” counterfactuals visibly distinct from dated historical faction events. Add history only with dated sources; preserve original list votes/seats and unassigned candidate affiliations. High for coalition/bloc exploration.

### E4. Norwegian law

The law permits specified ministers/deputy ministers to cease serving as MKs, opening places for subsequent list candidates, with return arrangements. A primary institutional confirmation is the [13 October 2015 Knesset Finance Committee explanation](https://m.knesset.gov.il/APPS/committees/922/news/3255); quotas and eligibility changed subsequently, so the 2015 form is not a timeless rule for k23–k26.

**Observed support.** Missing membership timeline. README and development docs explicitly say later replacements are not tracked. This does not invalidate the original allocation; it changes which people sit later. Existing candidate notes and original rank election are only partial context.

**Need / priority.** UI: plainly distinguish “elected from the list” from “currently serving”. Data: dated membership/ministerial cessation-and-return events, if that feature is chosen. No list-seat engine change. Medium; do not expand into a live-MK tracker merely to show a historical seat result.

### E5. Rotation is not an electoral seat bonus

1984's Peres–Shamir rotation was a coalition arrangement; 2020 and 2021 used the statutory alternate-PM/rotation-government framework. Primary locator: Basic Law: The Government's rotation provisions and [Knesset institutional chronology](https://main.knesset.gov.il/About/Occasion/pages/birthday/quiz.aspx); [IDI's 1984 history](https://www.idi.org.il/policy/parties-and-elections/elections/1984/) is secondary corroboration for that earlier arrangement. Original amendment chain and all trigger clauses were not audited here.

**Observed support.** Partial: initial-government bloc schemes, no executive-office or rotation timeline. None of these arrangements changes how the 120 election seats are allocated. A coalition seat total does not itself identify who will be PM or prove a legal rotation trigger.

**Need / priority.** Data/UI: distinguish coalition agreement, statutory alternate PM, scheduled transfer and actual transfer, with dates. No allocation changes. Medium, particularly for interpreting the 2020/2021 coalition display and k15's later 2001 government.

### E6–E7. Contextual law and publication status

**Campaign equality:** the 1969 *Bergman* episode concerned election financing and equal opportunity, not a switch to Bader–Ofer (which starts in 1973). Primary institutional account: [Ministry of Justice, *Roots in Law*, 1969](https://www.gov.il/BlobFolder/reports/roots_1969_2/he/roots-1969-2.pdf). Party-registration and nomination requirements also evolved; the enactment of the Parties Law in 1992 is a research lead for k13/k14-era context, not a verified engine defect. Support: missing historical context; low priority for this seat simulator. No causal vote adjustment is justified by a finance-law change.

**2026 publication:** observed `DatasetStatus` distinguishes `official-final` from `final-count-pending-publication`. k26 `officialSeats` is null; comparisons to reported seats are labelled secondary. Source paths: `scripts/lib/historical/k26.ts`, `public/data/k26.json`, README. Support partial because final-count data exists but gazetted seat/elected-member confirmation is pending in the project's record as of 3–4 November 2026. This is not evidence that certification will never occur. High priority: retain the status prominently and verify the final statutory publication when available; do not promote a reported table into “official seats” by inference.

## Source/retrieval ledger and challenge pass

This compact ledger is part of this report, not a second project-wide source manifest. Existing primary inputs retain their authoritative URLs/hashes in `data/raw/SOURCES.json`. New working downloads and renders were placed only in `.backup-scratch/era-research/`; no runtime/data files were changed.

| Source family / claims | Locator, inspection and access | Evidence limitation |
|---|---|---|
| F1 / A2–A7 | Primary enactments linked above; retained original PDFs and project's clause audit; current code read | Existing allocation audit reused; not every administrative amendment independently re-audited |
| F2 / A8–A9 | YP 2319/2326 plus decision 0073 | Primary roster/result supports capacity fact, not a uniquely proven redistribution rule |
| F3 / B1 1996 | Retained YP 4414 PDF pp.3–4, rendered/read; manifest hash `e803fd2a85fd908367ddff5cd1a92d4d893c0cbaadf8e66447c9713b7bf80c1a`; MFA indexed official table | MFA is an independent publication, but ultimate count is still the same election evidence family |
| F4 / B1 1999 | Retained YP 4757 PDF p.2 rendered/read; SHA-256: `8dd75faf9c4446113f70a5931a6f4d8bb71451859b299fedece2981687045839`; IDI PDF p.7 read visually, SHA-256 `73ca159fe16c24807a8949720eb5eda50e90a7c0eb69ff37b36069f524e8bb00` | IDI derives from CEC; not independent corroboration of every underlying count |
| F5 / B1 2001 | Public mirrored YP 4960, HTTP 200; PDF p.2 rendered/read; hash above | Mirror accessibility verified; official-host availability not established |
| F6 / B3–B5 | 1992 Basic Law retrieved directly, read searchable §§4–13 and ballot amendments; IDI history for actual repeal/special election | Original enactment must not substitute for later operative amendments |
| F7 / C1–C2 | IDI 31 Aug 2026 article opened/read historical tables; k26 official captures inspected | Original judgment set not individually inspected; IDI table's end date is 2022 |
| F8 / C3–C4, D1 | Retained gazettes/OData, candidate notes, published JSON, builders and project audit records | Snapshot evidence; no complete withdrawal/replacement event register |
| F9 / D3–D4 | Knesset MMM 24 Mar 2019 PDF retrieved directly; all eight pages extracted/read; SHA-256 `79fb69eacca9ecd514b2581e462d0017e77937e395198305c2beb6db4a6eb47d` | Describes law/use as of 2019; not proof of every later exception |
| F10 / D2, D5, E1–E6 | Institutional indexed pages plus named secondary histories; some official opens blocked/redirected | Procedural leads separated from fully inspected primary proof; no original recount-order inventory |
| R / every support conclusion | Repository files and schema/functions named in each section | Static source audit, not interactive/browser testing or a new run of all historical tests |

All direct research HTTP requests used exactly `User-Agent: israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)`. Search discovery used the provided web-search service, whose transport User-Agent is not configurable; do not claim it sent the project's header. Direct requests observed 403 on gov.il history HTML and 200 on the public mirror, IDI PDF and two Knesset PDFs. No 429 was observed; no retries against a rate-limit/CAPTCHA/login were attempted. The current project's fetcher uses a slightly different header containing `research;` and throws on non-OK responses; it has no explicit Retry-After scheduler. Any future acquisition work should use the requested exact header and stop/defer according to Retry-After rather than blindly rerunning a refresh.

Reproduction: use the retained k14/k15 PDFs and their manifest hashes; retrieve the named public PDFs with the header above and verify hashes; render scanned pages with PDF.js and its packaged WASM decoders before transcription. This pass used Node v24.18.0 and the existing `pdfjs-dist` 6.5.438 installation. Initial text extraction produced empty pages; initial rendering without the decoder location omitted the scan images, which was corrected before the figures were read. No OCR output was promoted as proof. Source-volume/page-depth counters from search are **not measured**; no claim of independent corroboration by result count is made.

### Conclusion map

| Conclusion / criterion | Supporting claims | Challenge / gaps | Confidence and what could change it |
|---|---|---|---|
| Allocation eras represented in current code | A2–A7 + R, F1 | Exact arithmetic/reproduced seats do not prove every election-day procedure | High for code support; new operative-law text could revise a preset |
| k9 capacity remains a qualified inference | A8–A9 + F2 | Result-fitting is not unique legal proof | High for the limitation; locate CEC ruling/statute to upgrade |
| PM results are absent from app, substantially recoverable | B1–B5 + F3–F6 + R | Primary 1999 invalid/cast; 2001 host; printed-slip treatment; later eligibility amendments | High for missing schema and inspected candidate counts; obtain remaining primary notices before promoting those fields |
| Final-input correctness is not full procedural history | C1–C4, D1–D5 + F7–F10 + R | Zero votes/absence alone cannot prove withdrawal; no national recount-order census | High for support boundary; an event/schema audit or original orders could narrow gaps |
| Government/membership exceptions generally need context, not seat algorithms | E1–E7 + C4 + R | Date-specific law and party/rank evidence still required | High for keeping election seats separate; changes needed if product expands to time-varying membership |

The deliberate challenge pass checked three tempting but false shortcuts: agreements beginning only in 1973; treating 2001 as a new Knesset; treating source discrepancies/recount requests as proven court corrections. It also checked current envelope handling rather than copying stale documentation. No contrary evidence was found to the independent-ballot or fixed-original-seat boundaries; the k9 statutory-authority and recount-history gaps remain unresolved.

## Recommended implementation order

1. **Add a read-only election-context layer.** Define sourced events with effective date, contest type and evidence status. Surface k1's identity, k8's postponement, separate 2019 elections and k26's pending publication. Keep historical context separate from scenario actions. No seat-engine changes.
2. **Publish PM results alongside k14/k15 and the 2001 event.** Reuse the existing official scans; register/review the 2001 gazette. Resolve primary 1999 invalid/cast evidence or show those fields explicitly secondary/unverified. Store independent ballot totals. Add a PM-only event linked to k15 without adding another Knesset id or changing its seats.
3. **Explain final participation and candidate snapshots.** Add sourced disqualification/appeal/withdrawal events; correct status ambiguities such as zero-vote registered lists only after obtaining notices. Preserve registered/elected/opening-member distinctions and the existing notes.
4. **Close legal gaps before enlarging “exact historical” claims.** Locate the 1977 capacity authority, early equal-remainder rules, operative PM amendments and the printed-ballot withdrawal instructions. Add focused calculation tests only where newly established rules demand behavior. Keep unresolved evidence visible.
5. **Expose result provenance and late-count context.** Give users the chosen publication and documented alternatives for k16–k19. Add properly sourced recount/order events if located; keep provisional counts outside certified baseline data. Preserve the current envelope-locality separation.
6. **Only then add optional PM counterfactuals.** Separate plurality/majority/runoff and candidate eligibility from Knesset allocation. Do not infer split-ticket flows or automatic list-vote changes. Validate against all three official candidate tables.
7. **Defer a full membership/government timeline unless selected as product scope.** Norwegian replacements, dated faction changes and actual rotations can enrich candidate/coalition exploration, but they do not warrant rewriting election seat totals. Campaign finance and detailed polling logistics can remain sourced context links.

No app code change, new dataset, push, merge or deployment is part of this report.
