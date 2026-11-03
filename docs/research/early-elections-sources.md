# Sources for Israel’s 1st–15th Knesset elections, 1949–1999

Research checked **3 November 2026**. This is a source handoff for the explorer and exact seat simulator, after reading `README.md` and `docs/DATA.md`. It does not add application datasets or claim that any new election has passed the app’s release checks.

**National results and published seats are recoverable for all 15 elections.** Government-hosted polling-station scans were found for **1951–1992**, and nonpartisan spreadsheet mirrors for **1996 and 1999**. The main remaining difficulty is verified historical allocation inputs and careful transcription, rather than a complete absence of results.

Two assumptions in the brief need correction. **1949 was an exception:** it had no statutory percentage threshold and used a highest-average allocation, with a natural entry requirement of approximately 0.83%. Also, agreements did not begin in the 1970s: the 1948 ordinance already provided for connected lists. See the rule sections below.

## How to read the coverage table

* **Official** means the CEC’s statutory publication, a government table or a parliamentary source. A Reshumot scan on **olaw.org.il is an official document on a third-party mirror**, not an independently produced result.
* **Found** means an accessible source was identified; it does not mean its entire content has been transcribed or reconciled. **Not found** means this search did not recover it, not that no record exists.
* **Scan** means image-based tables needing extraction and visual checking. For the large polling scans, HTTP status, content type and size were checked; the full documents were **not** downloaded or page-by-page inspected.
* **Derived locality totals** means summing polling-station rows by locality, keeping special/outside-envelope votes separate. This is not an independent locality source or an independent reconciliation.
* **T** is the [official CBS national totals table][T], common to every row: registered voters, cast votes and valid votes; exact invalid counts can be derived as cast minus valid. **IDI** is the secondary Israel Democracy Institute page for that year. Its vote tables have errors in several years; see the arithmetic audit.
* Stable source labels (N01, C01, etc.) match `data/raw/research/MANIFEST.json`. Links below resolve to publishers’ URLs; retained copies and hashes are in that manifest.

## Election-by-election availability

| Election and date | National results source(s), official status | Published seats source | Locality-level availability | Polling-station availability | Surplus-agreement source | Candidate rosters | Rule details | Gaps before an exact, fully featured release |
|---|---|---|---|---|---|---|---|---|
| **1 (1949)** — 25 January 1949 | [N01: Official Gazette 49][N01] (official gov.il copy); T; [IDI][I01] (secondary). | [N01][N01], list-by-list election seats, not later faction membership. | No complete locality table found. | No complete station table found; CEC allocation memorandum exists, contents unchecked. | No election-specific complete notice recovered; do not assume no agreements. | [Official candidate gazette][C01], Official Gazette 43; [IDI per-list links][I01]. | No statutory %; natural ≈0.83%; 1949 quota + highest averages. | Special 1949 rules and actual connections; no detailed geography verified; IDI sum short by 7. |
| **2 (1951)** — 30 July 1951 | [N02: YP 181][N02] (official gov.il copy); T; [IDI][I02] (secondary). | [N02][N02], list-by-list election seats, not later faction membership. | Derivable from [official station scan][L02]; no separate locality file inspected. | [Official CBS/CEC scan][L02], HTTP 200; >5 MB, contents unchecked. | No election-specific complete notice recovered; do not assume no agreements. | [Official candidate gazette][C02], YP 174; [IDI per-list links][I02]. | 1%; Hare largest remainder. | Agreements and period-specific rounding; station scan needs extraction. |
| **3 (1955)** — 26 July 1955 | [N03: YP 432][N03] (official gov.il copy); T; [IDI][I03] (secondary). | [N03][N03], list-by-list election seats, not later faction membership. | Derivable from [official station scan][L03]; no separate locality file inspected. | [Official CBS/CEC scan][L03], HTTP 200; >5 MB, contents unchecked. | No election-specific complete notice recovered; do not assume no agreements. | [Official candidate gazette][C03], YP 425; [IDI per-list links][I03]. | 1%; Hare largest remainder. | Agreements; station scan needs extraction; one IDI roster link missing. |
| **4 (1959)** — 3 November 1959 | [N04: YP 717][N04] (official gov.il copy); T; [IDI][I04] (secondary). | [N04][N04], list-by-list election seats, not later faction membership. | Derivable from [official station scan][L04]; no separate locality file inspected. | [Official CBS/CEC scan][L04], HTTP 200; >5 MB, contents unchecked. | No election-specific complete notice recovered; do not assume no agreements. | [Official candidate gazette][C04], YP 704; [IDI per-list links][I04]. | 1%; Hare largest remainder. | Agreements; IDI sum high by 6,994; scan extraction. |
| **5 (1961)** — 15 August 1961 | [N05: YP 869][N05] (official gov.il copy); T; [IDI][I05] (secondary). | [N05][N05], list-by-list election seats, not later faction membership. | Derivable from [official station scan][L05]; no separate locality file inspected. | [Official CBS/CEC scan][L05], HTTP 200; >5 MB, contents unchecked. | No election-specific complete notice recovered; do not assume no agreements. | [Official candidate gazette][C05], YP 863; [IDI per-list links][I05]. | 1%; Hare largest remainder. | Agreements; scan extraction. |
| **6 (1965)** — 2 November 1965 | [N06: YP 1230][N06] (official gov.il copy); T; [IDI][I06] (secondary). | [N06][N06], list-by-list election seats, not later faction membership. | Derivable from [official station scan][L06]; no separate locality file inspected. | [Official CBS/CEC scan][L06], HTTP 200; >5 MB, contents unchecked. | No election-specific complete notice recovered; do not assume no agreements. | [Official candidate gazette][C06], YP 1222; [IDI per-list links][I06]. | 1%; Hare largest remainder. | Agreements; IDI sum short by 53,104; academic date off by one day. |
| **7 (1969)** — 28 October 1969 | [N07: YP 1573][N07] (official via olaw mirror); T; [IDI][I07] (secondary). | [N07][N07], list-by-list election seats, not later faction membership. | Derivable from [official station scan][L07]; no separate locality file inspected. | [Official CBS/CEC scan][L07], HTTP 200; >5 MB, contents unchecked. | No election-specific complete notice recovered; do not assume no agreements. | [Official candidate gazette][C07], YP 1563; [IDI per-list links][I07]. | 1%; Hare largest remainder. | Agreements; national gazette retained from mirror; scan extraction. |
| **8 (1973)** — 31 December 1973 | [N08: YP 1979][N08] (official gov.il copy); T; [IDI][I08] (secondary). | [N08][N08], list-by-list election seats, not later faction membership. | Derivable from [official station scan][L08]; no separate locality file inspected. | [Official CBS/CEC scan][L08], HTTP 200; >5 MB, contents unchecked. | No election-specific complete notice recovered; do not assume no agreements. | [Official candidate gazette][C08], YP 1954; [IDI per-list links][I08]. | 1%; Bader–Ofer. | Agreements; candidate publication is October 1973, so check later changes before December election. |
| **9 (1977)** — 17 May 1977 | [N09: YP 2326][N09] (official gov.il copy); T; [IDI][I09] (secondary). | [N09][N09], list-by-list election seats, not later faction membership. | Derivable from [official station scan][L09]; no separate locality file inspected. | [Official CBS/CEC scan][L09], HTTP 200; >5 MB, contents unchecked. | [Official notice in candidate gazette][C09], YP 2319 p. 1319: six pairs. | [Official candidate gazette][C09], YP 2319; [IDI per-list links][I09]. | 1%; Bader–Ofer. | One-candidate Flatto-Sharon list needs list-length cap/reallocation verification; station extraction. |
| **10 (1981)** — 30 June 1981 | [N10: YP 2727][N10] (official gov.il copy); T; [IDI][I10] (secondary). | [N10][N10], list-by-list election seats, not later faction membership. | Derivable from [official station scan][L10]; no separate locality file inspected. | [Official CBS/CEC scan][L10], HTTP 200; >5 MB, contents unchecked. | No election-specific complete notice recovered; do not assume no agreements. | [Official candidate gazette][C10], YP 2721; [IDI per-list links][I10]. | 1%; Bader–Ofer. | Agreements; station scan needs extraction. |
| **11 (1984)** — 23 July 1984 | [N11: YP 3081][N11] (official gov.il copy); T; [IDI][I11] (secondary). | [N11][N11], list-by-list election seats, not later faction membership. | Derivable from [official station scan][L11]; no separate locality file inspected. | [Official CBS/CEC scan][L11], HTTP 200; >5 MB, contents unchecked. | [Official notice in candidate gazette][C11], YP 3073 p. 2839: four pairs (mirror). | [Official candidate gazette][C11], YP 3073; [IDI per-list links][I11]. Government pattern failed; mirror copy recovered. | 1%; Bader–Ofer. | Sources sufficient to begin exact national seat verification; scan extraction; IDI sum high by 90. |
| **12 (1988)** — 1 November 1988 | [N12: YP 3591][N12] (official gov.il copy); T; [IDI][I12] (secondary). | [N12][N12], list-by-list election seats, not later faction membership. | Derivable from [official station scan][L12]; no separate locality file inspected. | [Official CBS/CEC scan][L12], HTTP 200; >5 MB, contents unchecked. | No election-specific complete notice recovered; do not assume no agreements. | [Official candidate gazette][C12], YP 3588; [IDI per-list links][I12]. | 1%; Bader–Ofer. | Agreements; IDI and academic row sums both disagree with total; station extraction. |
| **13 (1992)** — 23 June 1992 | [N13: YP 4021][N13] (official gov.il copy); T; [IDI][I13] (secondary). | [N13][N13], list-by-list election seats, not later faction membership. | Derivable from [official station scan][L13]; no separate locality file inspected. | [Official CBS/CEC scan][L13], HTTP 200; >5 MB, contents unchecked. | No election-specific complete notice recovered; do not assume no agreements. | [Official candidate gazette][C13], YP 4017; [IDI per-list links][I13]. | 1.5%; Bader–Ofer. | Agreements; IDI sum short by 1,000; station extraction. |
| **14 (1996)** — 29 May 1996 | [N14: YP 4414][N14] (official gov.il copy); T; [IDI][I14] (secondary). | [N14][N14], list-by-list election seats, not later faction membership. | Derivable from [mirror XLS][O14]; summary/special-vote rows need handling. | [Nonpartisan mirror XLS][O14], downloaded and rows inspected; official catalogue also advertises a station link. | [Official notice, YP 4411 p. 3398][G14]: six pairs (mirror). | [Official candidate gazette][C14], YP 4408; [IDI per-list links][I14]. | 1.5%; Bader–Ofer. | Sources sufficient to begin exact national seat verification; correct 550-vote secondary-table discrepancy; ordinary station XLS omits outside envelopes. |
| **15 (1999)** — 17 May 1999 | [N15: YP 4757][N15] (official gov.il copy); T; [IDI][I15] (secondary). | [N15][N15], list-by-list election seats, not later faction membership. | Derivable from [mirror XLS][O15]; summary/special-vote rows need handling. | [Nonpartisan mirror XLS][O15], downloaded and rows inspected; official catalogue also advertises a station link. | No election-specific complete notice recovered; do not assume no agreements. | [Official candidate gazette][C15], YP 4748; [IDI per-list links][I15]. | 1.5%; Bader–Ofer. | Agreements; station spreadsheet has mixed detail/summary rows; keep PM ballot separate. |

All 15 national gazettes and all 15 candidate gazettes in the table are retained. Most are scans. Candidate publication establishes the registered order, not a guarantee that every later resignation, disqualification or correction has already been reconciled. IDI has per-list roster links in every year; links were inventoried, but only one linked roster was downloaded as an example. Do not describe every IDI link as separately verified.

## The allocation-rule eras

### 1949: a separate rule set

The [Knesset Research and Information Center’s historical threshold review][R1], printed page 11, says there was **no statutory percentage threshold** in the first election. Its natural threshold was **1/121**, approximately 0.83%. This is not a hardcoded 1% or even an exact 0.83% cutoff. [IDI’s 1949 page][I01] rounds it to 0.83%.

The [1948 ordinance transcription][ORD], sections 30–31, specifies a general quota of `floor(valid votes / 121)`, initial whole quotas, then highest-average remainder allocation among lists already holding a seat. It also provides for **connected pairs**, each already holding a seat, with internal division. That transcription is explicitly unofficial; the original ordinance and all amendments operative on election day have not been assembled here. The official threshold review and the [CEC’s historical-method description][CEC-R] corroborate the 1949 exception; the CEC HTML itself returned 403 and its indexed text was used only as a lead/corroboration.

**Engine consequence:** simply switching the existing largest-remainder option on for 1949 would be wrong. Verify the special quota, entry condition, historical tie treatment and actual connected lists against primary records before claiming exact reproduction. The [CEC allocation memorandum][M01] returned HTTP 200 but is 27,567,306 bytes; contents were not inspected.

### 1951–1969: 1% and Hare largest remainder

The [official Knesset threshold review][R1], printed page 11, places the **1%** rule from the 2nd through the 12th Knessets. [IDI’s method history][R4] describes the switch from the initial highest-average system to Hare, and the [CEC historical explanation][CEC-R] expressly identifies Knessets 2–7 as largest remainder. Thus 1973 itself belongs to the next era.

For exact code, “Hare” alone is insufficient: retrieve the period’s quota-rounding and connected-list provisions. The 1951 law’s sections 38–40 are identified in the [official polling-results publication][L02]; the 1948 ordinance’s connected-list provisions also disprove the premise that agreements were invented in the 1970s. No complete election-specific agreement set was recovered for 1951–1969 in this pass. Missing notices must not become empty agreement arrays labelled complete.

### 1973–1988: 1% and Bader–Ofer

The [original amendment][R2], **Law amending the Knesset Elections Law, Amendment No. 4 (1973)**, published in Sefer HaHukkim 692, 9 April 1973, p. 108, replaces section 81(d) with repeated highest quotients: list votes divided by seats already allocated plus one. It also specifies a lottery for equal quotients and a historical restriction on a list reaching half the seats without more than half the votes for qualifying lists. This is primary text and is stronger than a modern simplified explanation.

Several secondary descriptions, including [IDI’s method article][R4], call it **Amendment No. 5**. The downloaded original visibly says **No. 4**. Use the original citation. The rule first applied at the **8th election, 31 December 1973**; the threshold stayed 1% through 1988, as documented by [R1][R1].

Do not assume today’s consolidated law is identical in all details. Historical rounding, ties, agreement division and the then-operative seat cap require version checks. The [1977 candidate gazette][C09] and [1984 candidate gazette][C11] contain actual agreement notices, so those inputs can be sourced without reverse-engineering the published seats.

### 1992–1999: 1.5% and Bader–Ofer

[Amendment No. 23 (1991)][R3], Sefer HaHukkim 1369, 23 October 1991, p. 2, changes section 81(a) from **1% to 1.5%**. The first applicable election was 1992; the [official threshold review][R1] confirms this period. It did not replace the Bader–Ofer allocation formula.

1996 and 1999 also had a **separate direct prime-ministerial ballot**. Use Knesset votes and invalid-ballot totals for this app; do not substitute the PM totals printed beside them. The [1996 gazette notice][G14] is an explicit complete list of six agreement pairs as published; the 1999 pair list was not recovered.

## Agreements actually recovered

These are primary statutory notices, with mirror hosting disclosed. They are not inferred from the seats.

| Election | Source and location | Pairs as published (short names for readability) |
|---|---|---|
| 1977 | [YP 2319][C09], 9 May 1977, p. 1319; government-hosted | Alignment–United Arab List; Independent Liberals–Dash; Likud–Shlomtzion; National Religious Party–Agudat Israel; Sheli–Women’s Party; Ratz–Arab Reform Movement (letters סם). Six pairs; the last entry is partly stamped but its name is readable at higher resolution. |
| 1984 | [YP 3073][C11], 9 July 1984, p. 2839; olaw mirror | Alignment–Ratz; Agudat Israel–Shas; Centre Party/Shinui–Yahad; Likud–Tehiya/Tzomet. Four pairs. |
| 1996 | [YP 4411][G14], 28 May 1996, p. 3398; olaw mirror | Labour–Meretz; National Religious Party–United Torah Judaism; Third Way–Yisrael BaAliyah; Hadash–United Arab List; Moledet–Telem Emuna; Likud/Gesher/Tzomet–Shas. Six pairs. |

The 1977 result also needs a candidate-cap check: Flatto-Sharon’s votes were sufficient for more seats than the list had candidates. The gazetted official seat count remains the verification target; an engine reproducing it only after guessing agreements is not verified. The [candidate gazette][C09], printed page 1330, shows Samuel Sharon as the sole candidate on his list. No simulator experiment was performed in this research task.

## National totals and secondary-source checks

The following are from [CBS table 27.2, published 4 July 2024][T]. Invalid counts below are explicitly **derived**, as cast minus valid. They are not estimated from its rounded invalid-vote percentages.

| Knesset | Registered | Cast | Valid | Invalid (derived) |
|---|---:|---:|---:|---:|
| 1 | 506,567 | 440,095 | 434,684 | 5,411 |
| 2 | 924,885 | 695,007 | 687,492 | 7,515 |
| 3 | 1,057,795 | 876,085 | 853,219 | 22,866 |
| 4 | 1,218,483 | 994,306 | 969,337 | 24,969 |
| 5 | 1,271,285 | 1,037,030 | 1,006,964 | 30,066 |
| 6 | 1,499,709 | 1,244,706 | 1,206,728 | 37,978 |
| 7 | 1,748,710 | 1,427,981 | 1,367,743 | 60,238 |
| 8 | 2,037,478 | 1,601,098 | 1,566,855 | 34,243 |
| 9 | 2,236,293 | 1,771,726 | 1,747,820 | 23,906 |
| 10 | 2,490,014 | 1,954,609 | 1,937,366 | 17,243 |
| 11 | 2,654,613 | 2,091,402 | 2,073,321 | 18,081 |
| 12 | 2,894,267 | 2,305,567 | 2,283,123 | 22,444 |
| 13 | 3,409,015 | 2,637,943 | 2,616,841 | 21,102 |
| 14 | 3,933,250 | 3,119,832 | 3,052,130 | 67,702 |
| 15 | 4,285,428 | 3,373,748 | 3,309,416 | 64,332 |

**Do not bulk-import the secondary tables without checks.** Summing the national table’s party-vote rows gives the following differences from CBS valid votes (sum minus official total). These are observed arithmetic differences, not proposed corrections to particular parties.

| Election | IDI difference | Atmor–Stoll workbook difference |
|---|---:|---:|
| 1949 | -7 | +0 |
| 1951 | +0 | +0 |
| 1955 | +0 | +0 |
| 1959 | +6,994 | +0 |
| 1961 | +0 | +0 |
| 1965 | -53,104 | +0 |
| 1969 | +0 | +0 |
| 1973 | +0 | +0 |
| 1977 | +0 | +0 |
| 1981 | +0 | +0 |
| 1984 | +90 | +0 |
| 1988 | -365 | +6 |
| 1992 | -1,000 | +0 |
| 1996 | +550 | +550 |
| 1999 | +0 | +0 |

The [academic workbook][A] also dates 1965 to **1 November**, while [CBS][T] gives **2 November**. [ParlGov’s index][P] repeats the wrong date. For 1988 and 1996, the workbook’s printed “Total” agrees with CBS while its own party rows do not. These discrepancies are small enough to be overlooked and matter for an exact simulator. Correct them from the retained gazettes, with a transparent source note; never adjust a party merely to make the sum fit.

The [1996 mirrored station XLS][O14] contains **6,714 station rows plus a summary row**. Ordinary-station totals are 2,916,434 valid votes, below the national 3,052,130 by **135,696**: outside-envelope votes must be obtained/reconciled separately. Its registered total is 3,933,250. Naively summing its numeric columns counts the summary twice.

The [1999 mirrored XLS][O15] has ordinary stations, outside-envelope rows and summary lines in one sheet. The explicit outside-envelope subtotal is **142,026 valid / 144,344 cast / 2,318 invalid**. This is promising detailed data, but mixed row types make a blind sum wrong. Neither spreadsheet was promoted to a reconciled app dataset here. Locality identifiers and special-vote treatment need checking before deriving locality totals.

## CBS volumes, detailed geography and academic alternatives

### Official detailed results, 1951–1992

These are **direct government URLs**, not merely library catalogue leads. The retrieved responses identify PDFs and declare the following sizes. Full content inspection is pending because of the requested 5 MB retention limit. The indexed opening text of the 1951 volume explicitly describes results for each polling station, ordered by locality. Later scans’ filenames identify polling results; their page structure/completeness has not been independently checked.

| Election | Official polling-results scan | Size (bytes, server-declared) | Locality use |
|---|---|---:|---|
| 1951 | [CEC/CBS station scan][L02] | 5,886,764 | Group station rows by locality after checking special votes. |
| 1955 | [CEC/CBS station scan][L03] | 15,371,932 | Group station rows by locality after checking special votes. |
| 1959 | [CEC/CBS station scan][L04] | 8,465,223 | Group station rows by locality after checking special votes. |
| 1961 | [CEC/CBS station scan][L05] | 11,672,154 | Group station rows by locality after checking special votes. |
| 1965 | [CEC/CBS station scan][L06] | 64,654,874 | Group station rows by locality after checking special votes. |
| 1969 | [CEC/CBS station scan][L07] | 11,838,267 | Group station rows by locality after checking special votes. |
| 1973 | [CEC/CBS station scan][L08] | 16,954,260 | Group station rows by locality after checking special votes. |
| 1977 | [CEC/CBS station scan][L09] | 12,380,157 | Group station rows by locality after checking special votes. |
| 1981 | [CEC/CBS station scan][L10] | 15,482,126 | Group station rows by locality after checking special votes. |
| 1984 | [CEC/CBS station scan][L11] | 18,182,742 | Group station rows by locality after checking special votes. |
| 1988 | [CEC/CBS station scan][L12] | 20,287,261 | Group station rows by locality after checking special votes. |
| 1992 | [CEC/CBS station scan][L13] | 18,233,084 | Group station rows by locality after checking special votes. |

The [Atmor–Stoll source workbook][A] gives useful CBS publication references: **51** (1955, also used for 1949/1951), **111** (1959), **166** (1961), **216** (1965), **309** (1969), **461** (1973), **553** (1977), **680** (1981), **775** (1984), **855** (1988), **925 vol. A** (1992), and **1054 vol. A** (1996). These are bibliographic references in an academic source, not claims that every original volume was inspected. The [CBS publication catalogue][CBS-CAT] additionally identifies **1055, 1996 vol. B, polling-station detail**; its indexed text was located, but the downloaded catalogue is a scan and its full contents were not read.

The [Hebrew University ISDC catalogue][H] explicitly lists CBS election-result studies for **1977, 1981, 1984, 1988, 1992, 1996 and 1999** (study IDs 610, 620, 630, 615, 618, 619, 621). This is a useful institutional route to machine-readable older data. The linked study 610/Nesstar page failed with a web-tool 502; data variables and access conditions were not inspected. A catalogue entry does not establish unrestricted download access.

No complete 1949 locality/station table was recovered. The 1949 national data is available; it would be misleading to mark the whole election unavailable. The large allocation memorandum is an additional uninspected lead, not proof of geographical coverage.

### Other requested sources

* **data.gov.il:** [package_show for votes-knesset][D1] returned 200 and **17 resources**, starting with Knesset **16 (2003)**. [package_search for בחירות, rows=100][D2] returned 200, **six packages**; the others concern local elections, polling locations or unrelated environmental reporting. No 1949–1999 results resource was found in those responses. This is a bounded catalogue finding, not proof that government has no older data elsewhere.
* **CLEA:** its [main site][CLEA] returned curl 403. However, the researchers’ [UCSB page][STOLL] links the downloaded **Complete Israeli Election Results, 1949–2009** [Atmor–Stoll XLS][A] and identifies it as a CLEA contribution. It contains national party votes and seats and source citations, not locality or polling-station data. Calling Israel one national constituency does not provide subnational geography.
* **ParlGov / Döring and Manow:** the [Israel election index][P] includes every in-scope election. The inspected [1949 page][P1] has absolute votes, percentages, seats and electorate/cast/valid totals, but only **13 result rows for 21 competing lists**, including only one losing-list row; alliance-component rows are also present. It is useful corroboration, not a complete all-list import or a source for rosters/agreements/geography. Its labels may normalize historical parties. Other election pages were not individually audited.
* **Israeli National Election Studies:** the [official site][INES] describes independent, nonpartisan **survey data**. These are respondent studies, not certified counts for all lists or polling stations. ISDC’s catalogue separates the election-results datasets from election surveys beginning in 1969. The `www.ines.tau.ac.il` URL failed TLS validation; the bare `ines.tau.ac.il` URL was readable through the web tool and redirected to TAU’s INES site. No TLS checks were disabled.
* **Knesset:** [the official history pages][KNESS] provide national votes/seats for elected lists, electorate and valid totals; they should not be assumed to include losing lists. Direct curl to the 1949 page returned **247**, an unusable challenge response; the web tool returned an empty readable page. Indexed content was useful for discovery, but the retained gazettes are the primary import sources. A later faction roster is not the election seat result or the full candidate list.
* **Nevo:** the consolidated [Knesset Elections Law URL][NEVO] returned **403**. Some government-hosted gazettes visibly carry Nevo scan marks; those are still the gazette documents. No paywall or challenge was bypassed.

## Recommendation and decision map

**Add national historical results for all 15 elections**, using the gazettes for all lists and seats and CBS for denominators. All have usable source paths; none should be declared wholly missing. Keep secondary figures labelled secondary until individually reconciled.

**Best first exact-verification targets: 1984 and 1996.** National gazettes, full candidate publications and explicit published agreement sets were recovered. This is a recommendation about available inputs, **not** a claim that the engine already reproduces them. Transcribe, check the period’s law, and run actual per-list seat comparisons before release. **1977** has the same source categories, but its list-length cap is an extra implementation/verification dependency.

**For now, use national historical display only for 1949–1973, 1981, 1988, 1992 and 1999** until actual agreement inputs and historical rules are verified. Geography can be added independently after station extraction/reconciliation: large official scans exist for 1951–1992, and the two spreadsheet mirrors can seed 1996/1999 work. Absence of an independent locality file is not a reason to discard station data; label resulting locality totals as derived.

**Unresolved data fields:** complete 1949 geography, election-specific agreement sets except 1977/1984/1996, later candidate corrections/withdrawals, and clean reconciled detailed data tables. These are unavailable **to this handoff**, not proven absent from archives. Do not synthesize missing agreements from the desired seat result.

| Conclusion ID | Evidence and contrary checks | Confidence / what would change the recommendation |
|---|---|---|
| Q1: national import paths exist for all 15 | N01–N15, T; secondary sums challenged against T | High for availability; checked transcription and correction notices still required. |
| Q2: detailed results exist for 1951–1999 | L02–L13: HTTP 200 + PDF headers; O14/O15: actual sheet rows; H catalogue | High for existence, limited for completeness. Full scan inspection and national reconciliation could expose missing rows. |
| Q3: exact-source priority is 1984/1996, then 1977 with cap check | N11/C11, N14/C14/G14, N09/C09; contrary evidence is unverified historical rounding/cap details | Moderate for implementation readiness, not engine success. A failed seat comparison or amended notice changes readiness. |
| Q4: 1949 needs its own rules | R1 printed p. 11; ORD §§30–31; R4 and CEC-R | High for the exception; original ordinance versions/connections still needed for exact behavior. |
| Q5: missing fields must stay explicit | Failed probes, uninspected large sources and unresolved agreement searches | No claim of permanent absence. A new primary record can resolve any gap. |

## Direct URL probes, including failures

The machine-readable curl GET observations are dated 3 November 2026 and recorded with full URLs and retrieval timestamps in [MANIFEST.json](../../data/raw/research/MANIFEST.json). Direct GETs used curl with redirects, time limits and a size ceiling. **No proxy, challenge bypass or disabled certificate validation was used.** The sandbox’s initial curl attempts failed DNS resolution (exit 6 / status 000); subsequent authorized direct-network probes produced the statuses below. Status 000 is not an HTTP response.

### Requested `knessetNN-cand.pdf` / `knessetNN-results.pdf` patterns

Base: `https://www.gov.il/BlobFolder/guide/election-committee-history/he/`.
The table gives the exact requested pattern probes; successful alternate names in the coverage table do not overwrite these results.

| NN | Candidate GET status | Results GET status | Recovery |
|---|---:|---:|---|
| 1 | 404 | 404 | Use [N01][N01] and [C01][C01] above. |
| 2 | 404 | 404 | Use [N02][N02] and [C02][C02] above. |
| 3 | 404 | 404 | Use [N03][N03] and [C03][C03] above. |
| 4 | 404 | 404 | Use [N04][N04] and [C04][C04] above. |
| 5 | 404 | 404 | Use [N05][N05] and [C05][C05] above. |
| 6 | 200 | 200 | Original pattern works for both. |
| 7 | 200 | 404 | Use [N07][N07] and [C07][C07] above. |
| 8 | 404 | 404 | Use [N08][N08] and [C08][C08] above. |
| 9 | 404 | 404 | Use [N09][N09] and [C09][C09] above. |
| 10 | 404 | 404 | Use [N10][N10] and [C10][C10] above. |
| 11 | 404 | 200 | Use [N11][N11] and [C11][C11] above. |
| 12 | 200 | 200 | Original pattern works for both. |
| 13 | 200 | 200 | Original pattern works for both. |
| 14 | 200 | 200 | Original pattern works for both. |
| 15 | 200 | 200 | Original pattern works for both. |

### Other failures and unsuccessful leads

| Tried source or pattern | Observed result | Meaning |
|---|---|---|
| [Current CEC history HTML][CEC-H]; [legacy history HTML][CEC-OLD]; [CEC method page][CEC-R]; [1999 results HTML][CEC99] | curl 403 | HTML access failure; does not imply the attached PDFs are missing. |
| [Knesset 1949 history page][KNESS] | curl 247; web extraction empty | Challenge response, not usable result HTML. |
| [CLEA main site][CLEA] | curl 403 | Researcher-hosted contribution recovered separately. |
| [Nevo consolidated law][NEVO] | curl 403 | Used original parliamentary gazette files instead. |
| `https://olaw.org.il/yalkut/yalkut-{181,432,717,869}.pdf` | 404 for all four | Early national gazettes recovered from gov.il instead. |
| `history_election-dates_knesset7-results.pdf`, `history_election-dates_knesset11-cand.pdf`, `knesset11-cands.pdf` under the base above | 404 each | 1969 results and 1984 candidates recovered from olaw mirrors. |
| `…/dynamiccollectorresultitem/records-results7/he/archive_knesset7_records-results7.pdf` on gov.il | 404 | Another unsuccessful 1969 official filename. |
| Hebrew `תוצאות כנסת NN לפי קלפ1.pdf` under the base, NN=3,5,6,9–15 | 404 each | Correct `לפי קלפי.pdf` spelling works for 3,5,6,9–13. |
| Hebrew `תוצאות כנסת NN לפי קלפי.xls` / `.xlsx`, NN=14,15 | 404 all four | Mirrors were retrieved; the exact current official spreadsheet targets remain unresolved. |
| [1951 polling PDF][L02], HEAD request | 404, despite repeated GET 200 | HEAD was unreliable; report uses GET status and GET Content-Length. |
| [HUJI linked study 610][H610] | web-tool 502 | Catalogue inspected, raw study not retrieved. |
| `https://www.ines.tau.ac.il/` | curl exit 60, status 000 (hostname certificate mismatch) | Bare-host official site worked through web retrieval; no insecure curl retry. |
| Hebrew Wikipedia discovery pages for Knessets 7–10 | curl 429 | Used only to discover official links; not used as factual authority. |

Nearby gazettes **4747, 4749–4754, 4016, 4018–4020, 3586–3589 and 3080** were retrieved and their covers checked during agreement searches. They did not supply a complete agreement set for 1999, 1992 or 1988. Issues [4751][X15A], [4753][X15B] and [4754][X15C] contain candidate amendments/withdrawals; [3589][X12] contains candidate changes. These small sources are retained for roster reconciliation. They are not proof that no agreements exist elsewhere. Only distinctive retained evidence is archived, rather than every unrelated issue inspected. Issue 4017 duplicates the retained 1992 candidate gazette. No complete absence claim follows from this bounded search.

## Retained evidence and reproduction

[MANIFEST.json](../../data/raw/research/MANIFEST.json) records each retained source’s URL, `retrievedAt`, SHA-256, byte size, publisher, inspection scope and limitations. It also records large-source URLs/sizes and the curl probes. The 15 national and 15 candidate documents, three 1999 amendment issues and one 1988 amendment issue are the primary archive; IDI pages preserve the exact tables audited. The academic workbook, CKAN responses, spreadsheet mirrors and rule sources preserve the remaining evidence. Mirrors of the same gazette are **one evidence family**; IDI, ParlGov and Atmor–Stoll may reuse CEC/CBS figures and are not three independent counts.

PDF inspection used PyMuPDF **2.1**; XLS inspection used xlrd **2.0.2**; HTML tables used Beautiful Soup **4.15.0**, with Python **3.14.4**. For the arithmetic audit, sum numeric vote/seat cells in each IDI election table and each Atmor–Stoll election block, excluding printed totals, and compare with T. For station files, identify detail, subtotal and outside-envelope rows before summing. No OCR output was accepted as a checked transcription. Tools, temporary renders and downloads not selected as evidence remain in ignored `.backup-scratch/early-elections/`; no claim is made about backup-system exclusions.

The main table and manifest form the source ledger: election-specific claims are bounded by the stated inspection level, and Q1–Q5 above map the recommendations to evidence and unresolved gaps. Search-result counts and independent-source counts were not measured; they are not used as quality claims.

<!-- Stable publisher URL references. Local copies and exact hashes are in MANIFEST.json. -->
[N01]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset1-results.pdf
[N02]: https://www.gov.il/BlobFolder/dynamiccollectorresultitem/records-results2/he/archive_knesset2_records-results2.pdf
[N03]: https://www.gov.il/BlobFolder/dynamiccollectorresultitem/records-results3/he/archive_knesset3_records-results3.pdf
[N04]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset4-results.pdf
[N05]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset5-results.pdf
[N06]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset6-results.pdf
[N07]: https://olaw.org.il/yalkut/yalkut-1573.pdf
[N08]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset8-results.pdf
[N09]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset9-results.pdf
[N10]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset10-results.pdf
[N11]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset11-results.pdf
[N12]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset12-results.pdf
[N13]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset13-results.pdf
[N14]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset14-results.pdf
[N15]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset15-results.pdf
[C01]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset1-cand.pdf
[C02]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset2-cand.pdf
[C03]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset3-cand.pdf
[C04]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset4-cand.pdf
[C05]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset5-cand.pdf
[C06]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset6-cand.pdf
[C07]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset7-cand.pdf
[C08]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset8-cand.pdf
[C09]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset9-cand.pdf
[C10]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset10-cand.pdf
[C11]: https://olaw.org.il/yalkut/yalkut-3073.pdf
[C12]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset12-cand.pdf
[C13]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset13-cand.pdf
[C14]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset14-cand.pdf
[C15]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset15-cand.pdf
[I01]: https://www.idi.org.il/policy/parties-and-elections/elections/1949/
[I02]: https://www.idi.org.il/policy/parties-and-elections/elections/1951/
[I03]: https://www.idi.org.il/policy/parties-and-elections/elections/1955/
[I04]: https://www.idi.org.il/policy/parties-and-elections/elections/1959/
[I05]: https://www.idi.org.il/policy/parties-and-elections/elections/1961/
[I06]: https://www.idi.org.il/policy/parties-and-elections/elections/1965/
[I07]: https://www.idi.org.il/policy/parties-and-elections/elections/1969/
[I08]: https://www.idi.org.il/policy/parties-and-elections/elections/1973/
[I09]: https://www.idi.org.il/policy/parties-and-elections/elections/1977/
[I10]: https://www.idi.org.il/policy/parties-and-elections/elections/1981/
[I11]: https://www.idi.org.il/policy/parties-and-elections/elections/1984/
[I12]: https://www.idi.org.il/policy/parties-and-elections/elections/1988/
[I13]: https://www.idi.org.il/policy/parties-and-elections/elections/1992/
[I14]: https://www.idi.org.il/policy/parties-and-elections/elections/1996/
[I15]: https://www.idi.org.il/policy/parties-and-elections/elections/1999/
[T]: https://www.cbs.gov.il/he/publications/doclib/2024/hnatonelectionstheknessetandgovernment.27/st27_02.pdf
[D1]: https://data.gov.il/api/3/action/package_show?id=votes-knesset
[D2]: https://data.gov.il/api/3/action/package_search?q=%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA&rows=100
[A]: https://hstoll.faculty.polsci.ucsb.edu/research/atmorstoll2009_Israeli_Election_Results.xls
[O]: https://www.odata.org.il/api/3/action/package_show?id=elections
[O14]: https://www.odata.org.il/dataset/c0ec706c-5970-4c6d-942f-aaf60187dcbb/resource/c166aa81-3541-4636-97f1-9ff134f33d14/download/-14-1996-.xls
[O15]: https://www.odata.org.il/dataset/c0ec706c-5970-4c6d-942f-aaf60187dcbb/resource/5729daf9-adfd-4ec9-b4d3-0f2047189ddb/download/-15-1999-.xls
[H]: https://isdc.huji.ac.il/book/%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA
[R1]: https://fs.knesset.gov.il/globaldocs/MMM/8d6433f2-66cc-e811-80e7-00155d0aeea3/2_8d6433f2-66cc-e811-80e7-00155d0aeea3_11_10898.pdf
[R2]: https://fs.knesset.gov.il/7/law/7_lsr_211799.pdf
[R3]: https://fs.knesset.gov.il/12/law/12_lsr_210711.PDF
[R4]: https://www.idi.org.il/articles/3498
[G14]: https://olaw.org.il/yalkut/yalkut-4411.pdf
[P]: https://parlgov.fly.dev/data/elections/isr/
[P1]: https://parlgov.fly.dev/data/elections/isr/1949-01-25/
[IC1]: https://www.idi.org.il/media/6637/%D7%9B%D7%A0%D7%A1%D7%AA-1-%D7%9E%D7%A4%D7%90%D7%99.pdf
[L02]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/%D7%AA%D7%95%D7%A6%D7%90%D7%95%D7%AA%20%D7%9B%D7%A0%D7%A1%D7%AA%202%20%D7%9C%D7%A4%D7%99%20%D7%A7%D7%9C%D7%A41.pdf
[L03]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/%D7%AA%D7%95%D7%A6%D7%90%D7%95%D7%AA%20%D7%9B%D7%A0%D7%A1%D7%AA%203%20%D7%9C%D7%A4%D7%99%20%D7%A7%D7%9C%D7%A4%D7%99.pdf
[L04]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/%D7%AA%D7%95%D7%A6%D7%90%D7%95%D7%AA%20%D7%9B%D7%A0%D7%A1%D7%AA%204%20%D7%9C%D7%A4%D7%99%20%D7%A7%D7%9C%D7%A41.pdf
[L05]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/%D7%AA%D7%95%D7%A6%D7%90%D7%95%D7%AA%20%D7%9B%D7%A0%D7%A1%D7%AA%205%20%D7%9C%D7%A4%D7%99%20%D7%A7%D7%9C%D7%A4%D7%99.pdf
[L06]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/%D7%AA%D7%95%D7%A6%D7%90%D7%95%D7%AA%20%D7%9B%D7%A0%D7%A1%D7%AA%206%20%D7%9C%D7%A4%D7%99%20%D7%A7%D7%9C%D7%A4%D7%99.pdf
[L07]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/%D7%AA%D7%95%D7%A6%D7%90%D7%95%D7%AA%20%D7%9B%D7%A0%D7%A1%D7%AA%207%20%D7%9C%D7%A4%D7%99%20%D7%A7%D7%9C%D7%A41.pdf
[L08]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/%D7%AA%D7%95%D7%A6%D7%90%D7%95%D7%AA%20%D7%9B%D7%A0%D7%A1%D7%AA%208%20%D7%9C%D7%A4%D7%99%20%D7%A7%D7%9C%D7%A41.pdf
[L09]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/%D7%AA%D7%95%D7%A6%D7%90%D7%95%D7%AA%20%D7%9B%D7%A0%D7%A1%D7%AA%209%20%D7%9C%D7%A4%D7%99%20%D7%A7%D7%9C%D7%A4%D7%99.pdf
[L10]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/%D7%AA%D7%95%D7%A6%D7%90%D7%95%D7%AA%20%D7%9B%D7%A0%D7%A1%D7%AA%2010%20%D7%9C%D7%A4%D7%99%20%D7%A7%D7%9C%D7%A4%D7%99.pdf
[L11]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/%D7%AA%D7%95%D7%A6%D7%90%D7%95%D7%AA%20%D7%9B%D7%A0%D7%A1%D7%AA%2011%20%D7%9C%D7%A4%D7%99%20%D7%A7%D7%9C%D7%A4%D7%99.pdf
[L12]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/%D7%AA%D7%95%D7%A6%D7%90%D7%95%D7%AA%20%D7%9B%D7%A0%D7%A1%D7%AA%2012%20%D7%9C%D7%A4%D7%99%20%D7%A7%D7%9C%D7%A4%D7%99.pdf
[L13]: https://www.gov.il/BlobFolder/guide/election-committee-history/he/%D7%AA%D7%95%D7%A6%D7%90%D7%95%D7%AA%20%D7%9B%D7%A0%D7%A1%D7%AA%2013%20%D7%9C%D7%A4%D7%99%20%D7%A7%D7%9C%D7%A4%D7%99.pdf
[ORD]: https://knesset-tracker.co.il/knesset/statute/2001319
[CEC-R]: https://www.gov.il/he/pages/election-about-info?chapterindex=4
[CEC-H]: https://www.gov.il/he/pages/election-committee-history?chapterindex=7
[CEC-OLD]: https://www.gov.il/apps/elections/heb/history/PubsCollection.html
[CEC99]: https://www.gov.il/apps/elections/elections-knesset-15/heb/results/index.html
[M01]: https://www.gov.il/BlobFolder/dynamiccollectorresultitem/memorandum-knesset1/he/archive_knesset1_memorandum-apdx1.pdf
[CBS-CAT]: https://www.cbs.gov.il/he/publications/DocLib/2022/service/Xerox%20Scan_28112022070137.pdf
[CLEA]: https://electiondataarchive.org/
[STOLL]: https://hstoll.faculty.polsci.ucsb.edu/research.html
[INES]: https://ines.tau.ac.il/
[KNESS]: https://main.knesset.gov.il/About/History/pages/knessethistory.aspx?kns=1
[NEVO]: https://www.nevo.co.il/law_html/law01/190_001.htm
[H610]: http://geobase.huji.ac.il/webview/index.jsp?v=2&mode=documentation&submode=abstract&study=http://geobase.huji.ac.il/obj/fStudy/0610

[X15A]: https://olaw.org.il/yalkut/yalkut-4751.pdf
[X15B]: https://olaw.org.il/yalkut/yalkut-4753.pdf
[X15C]: https://olaw.org.il/yalkut/yalkut-4754.pdf
[X12]: https://olaw.org.il/yalkut/yalkut-3589.pdf
