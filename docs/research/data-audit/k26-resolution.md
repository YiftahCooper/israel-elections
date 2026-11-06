# k26 audit resolution — 6 November 2026

Scope: reconciled both reports merged into `t3/79708c0b`. Counts use the reports' **47 non-OK rows**, including overlapping observations: **23 corrected, 1 rejected after verification, 23 retained with verification limits, 0 owner questions**. Retained does not mean verified. No vote count, candidate roster, ideological family assignment or logo was invented. No push, main integration or Playwright run.

## Deciding sources and retrieval

All retrieval/check dates below are **2026-11-06**. Official sources rank 1, news reports rank 4, IDI rank 3; existing explicitly editorial Hebrew-Wikipedia colour references rank 5.

- **R — CEC final results:** https://votes26.bechirot.gov.il/nationalresults?lang=he — “תוצאות סופיות רשמיות”. All 38 rows match retained CSV-derived votes; all eleven winning seats match the engine. Direct web reader showed a JavaScript challenge; ordinary Jina Reader supplied the page text. No challenge circumvention. Durable transcribed rows, retrieval qualification and totals (the supplementary ballot-box/locality/envelope totals are retained CEC CSV derivations, not fields seen on the national page): `data/raw/k26/official-results.json`, hashed in `SOURCES.json`. The build checks its votes against the CSV, list count and seat sum before using its seats. This is an official CEC allocation, not a claim of Gazette publication.
- **P — President's closing statement:** https://www.president.gov.il/תם-סבב-ההתייעצויות-עם-כלל-סיעות-הכנסת-ב/ — dated 5 November; “סיעות המונות 67 חברי כנסת”, “סיעות המונות 46 חברי כנסת”, and “בכוונתי להטיל את המנדט להרכבת ממשלה ביום ראשון הקרוב”. Read full statement. Its related-news section also contains the dated Likud notice and the explicit Netanyahu recommendation. Sunday is **8 November**, a future intention, not a completed tasking.
- **L — Likud notice:** https://www.president.gov.il/סיעת-הליכוד-המליצה-על-ח״כ-בנימין-נתניהו/ — independently quoted in P's related-news section; direct opening of this URL failed. “והמליצה לנשיא המדינה יצחק הרצוג על ח"כ בנימין נתניהו להרכבת הממשלה”.
- **O — Otzma notice:** https://www.president.gov.il/סיעת-עוצמה-יהודית-המליצה-על-ח״כ-בנימין/ — full body read, dated 5 November, same explicit Netanyahu recommendation. Added the missing entry-level citation.
- **A — CEC approval:** https://www.israelhayom.co.il/news/law/article/21776989 — 4 November: “מליאת ועדת הבחירות המרכזית אישרה היום (רביעי) את תוצאות הבחירות לכנסת ה־26 ואת חלוקת המנדטים בין הרשימות”. Full report read; its eleven allocations agree with R. Added citation to aftermath. Receipt of official results by the President was already separately sourced.
- **C — retained official candidate pages:** `data/raw/k26/govil-list-pages.exa.json`, https://www.gov.il/he/pages/raam_list18 (updated 14 October). Re-read Ra’am, HaShutafut, RZ–Zehut, Tekuma and Seder Hadash sections. Ra’am: “ב-24 בספטמבר 2026 החליטה ועדת הבחירות המרכזית כי הרשימה מנועה”; reversal: “ב-2 באוקטובר 2026 קיבל בית המשפט העליון את הערעור”; eligibility: “המועמד חסן אחמד, שהוצב במקום ה-34”. HaShutafut has only seven candidates and none of those notices. These are retained official-origin transcriptions, not fresh authenticating downloads; live page/guide retrieval was inaccessible.
- **B — electoral blocs:** https://www.mako.co.il/news-israel-elections/2026/liveblog-415cd45878581a1027.htm — “53 לגוש נתניהו ו-48 לגוש השינוי”; Arab lists 19. Also opened https://www.ynet.co.il/news/blogs/article/sj60fvepze : final block reports 53/48/19 and eleven list allocations. These establish an electoral grouping, not election-day government membership.
- **K — Knesset summary:** https://main.knesset.gov.il/EN/mk/Pages/ElectionsResults26.aspx — read via ordinary Jina Reader and official search indexing. All eleven seats agree with R, but valid votes are **5,691,396**, against R/CSV **5,691,426**. K's threshold is 184,971; current CSV mathematical ceiling is 184,972. Keep latest direct CEC count; retain the disagreement here and in raw reference. K's English heading calls results official; the Codex report records the Hebrew unofficial heading. R directly settles the official-seat question without assuming gazettal.
- **G — Gazette search:** https://www.gov.il/he/pages/mandates — indexed/reader text lists the results memorandum and allocation annex, updated 4 November, but no verified results Gazette number. Guessed candidate-notice paths `.../guide/candidates-lists-26/he/yp15023.pdf` and `yp15029.pdf` returned unavailable/not-found pages; do not claim they contain recovered rosters. Candidate guide returned 403. Gazette publication remains **unverified**, not disproved.
- **Q — IDI:** https://en.idi.org.il/media/32364/august-voice-index-data.pdf — opened seven-page PDF. Q7 on page 3: “What will have the greatest influence on your decision regarding which party to vote for in the upcoming elections?” This independently supports the existing vote-influence qualification; no national-problem percentages added.

## Opus non-OK ledger

| Finding | Decision and evidence | Changed inputs/output |
|---|---|---|
| W1 | Corrected exclusion target and URL to Ra’am (C). | `election-context.json` |
| W2 | Corrected reinstatement target and URL to Ra’am (C). | same |
| W3 | Corrected candidate event target, URL and ID; page cites §63, so removed the overbroad §§62B/63 wording (C). | same |
| W4 | Corrected Likud unknown → Netanyahu, 5 November (P/L). | `aftermath/k26.json`, `k26.json` |
| W5 | Corrected totals to 67/46/7, removed unknown (P; existing UTJ notice). | same |
| W6 | Moved Likud into Netanyahu bloc; removed pending bloc (P/L). | same, generated dataset |
| W7 | Updated government note to completed consultations, future 8 November tasking (P). | `k26.json` |
| W8 | Updated asOf, formation event/outcome note, gaps and stale notes; no completed mandate/government inferred (P). Earlier retrieval cutoffs remain in audit/research history. | `aftermath/k26.json` |
| U1 | Corrected officialSeats/status/provenance from R, with separate Gazette caveat and 4 November plenary approval (A). | raw reference/manifest, builder, context, hand-maintained election index, store fallback, UI, tests, generated data/joint facts, family status/hash snapshots |
| U2 | Corrected the claim by relabelling as electoral bloc; removed “UTJ … returned”. Formal outgoing membership is not established. Legacy scheme ID retained for compatibility (B). | `k26.json`, generated dataset |
| U3 | Replaced Hebrew-Wikipedia-only bloc basis with contemporaneous N12 reporting (B). | `k26.json` |
| U4 | Retained explicit editorial colour basis, not official party specifications. Re-read every colour basis/confidence; no specific wrong colour or better historical specification established. Rank-5 provenance stays labelled. | none |
| U5 | Removed contradictory current retrieval notes; added O entry-level cite. Preserve earlier retrieval limits as historical, not current fact (P/L/O). | aftermath and recommendation scheme notes |
| V1 | Retained gap: official roster originals for כן/בי not recovered (G); existing secondary sources remain labelled. R confirms list identity/letters/zero seats, not 51 candidate identities. | none |
| V2 | Retained gap: re-read bios `pattern`/`probable` qualifications; a probe of personal-details/1027 returned 474. OData and website IDs are distinct namespaces; differing numbers do not prove wrong links. No guessed remapping or promotion to verified. | none |
| D1 | Disclosed both forms: candidate-page title דרך חזון ותקומה; ballot caption and R תקומה. Keep full candidate-page title for roster identity, expose results form in notes. These are context-specific names, not evidence for changing a roster. | builder → generated list notes |
| D2 | Disclosed both full-title spellings; keep candidate-page ולבחירות, R has ובחירות. Neither changes list identity (C/R). | builder → generated list notes |

## Codex non-OK ledger

Rows below follow the original report table order, assigning C1–C30 solely for cross-reference.

| Row | Decision and evidence | Changed inputs/output |
|---|---|---|
| C1 Likud | Corrected, P/L; Opus W4/W6. | aftermath, metadata, generated scheme |
| C2 tally | Corrected, P; Opus W5. | same |
| C3 completion | Corrected, P; Opus W8. | aftermath, notes |
| C4 Ra’am exclusion | Corrected, C; Opus W1. | context |
| C5 Ra’am reversal | Corrected, C; Opus W2. | context |
| C6 Ra’am eligibility | Corrected, C; Opus W3. | context |
| C7 official/count dispute | Corrected official-seat designation using deciding primary source R; keep latest CSV votes and record K discrepancy. Gazette status remains qualified (G). | raw reference/manifest, builder, status/tests/UI |
| C8 FamilyEvidence | Corrected “not published” to “publication unverified”, alongside official CEC result status. | `FamilyEvidence.tsx` |
| C9 outgoing government | Corrected misleading government-membership claim by electoral-bloc label and evidence B. No speculative membership chronology. | metadata, generated scheme |
| C10 בי roster | Retained verification limit; guide/PDF probes unsuccessful (G); identity and votes independently confirmed by R. | none |
| C11 כן roster | Retained verification limit, same; zero votes are not proof of roster identities. | none |
| C12 biographies/English names | Retained `pattern`/probable distinctions, inspected candidate map and blocked destination probe. No claim of verified destination-by-destination coverage. CEC Hebrew roster checks do not establish every English spelling. | none |
| C13 party links | Retained labelled ownership/secondary basis; re-read 38 list link collections, spot-opened current official party origins listed below. Reachability is not full historical title/ownership verification. | none |
| C14 families/continuity | Retained analytical caveats, no classification promoted. Re-read k26 membership/source rows and registry/lineage qualifications; CSV votes and candidate-party columns cannot prove ideological continuity. Mechanical hash/status snapshots refreshed; classifications unchanged. | family hash/status fields only |
| C15 colours | Retained explicit editorial basis; see U4. | none |
| C16 IDI polling | **Rejected as a remaining verification gap:** Q directly supports the existing Q7 vote-influence statement. No numerical polling series populated. | none |
| C17 דרך logo | Retained dated live-header caveat; Yashar source opened, not election-day archived proof. | none |
| C18 yashar logo | Same evidence/qualification as C17. | none |
| C19 מחל logo | Retained; Likud source opened with 27 October campaign context. Live header is not independent election-day asset-byte proof. | none |
| C20 likud logo | Same as C19. | none |
| C21 ל logo | Retained; Beytenu source opened. Existing live post-poll observation qualified, no fresh election-day byte claim. | none |
| C22 ב logo | Retained; Otzma source opened; same temporal limitation. | none |
| C23 otzma logo | Same as C22. | none |
| C24 zehut logo | Retained; Zehut source opened; same temporal limitation. | none |
| C25 new-hope logo | Retained; New Hope source opened; same temporal limitation. | none |
| C26 yesh-atid logo | Retained; Yesh Atid source opened; same temporal limitation. | none |
| C27 noam logo | Retained; Noam source opened; same temporal limitation. | none |
| C28 שס logo | Retained; Telegram source unavailable to reader. Date/visual/rights chain not independently certified. | none |
| C29 עם logo | Retained; Facebook source cache miss. Date/visual/rights chain not independently certified. | none |
| C30 hadash logo | Retained; archive URL unavailable to reader. Retained capture/evidence qualification is not newly authenticated archive proof. | none |

Logo rechecks inspected existing `inUseEvidence`, `inUseDate`, `rights`, `retrievedAt` and source fields; no artwork re-research. Current party origins opened: https://yasharwitheisenkot.com/ , https://www.likud.org.il/ , https://beytenu.org.il/ , https://www.ozma-yeudit.co.il/ , https://zehut.org.il/ , https://www.newhope.org.il/ , https://yeshatid.org.il/ , https://www.noamlisrael.org.il/ . Restricted sources: https://t.me/dovrutshas/5327 , https://www.facebook.com/MansourAbbas.me/videos/1757107092038580 , https://web.archive.org/web/20261002043950/https://hadash.org.il/ . Existing logo evidence expressly distinguishes live post-poll headers from election-day observations. Reachability does not certify rights or historical use.

Uncounted Opus remarks (not non-OK rows): withdrawal of כן and RZ–Zehut original rank-31 eligibility already appear in retained list notes/withdrawn fields; optional additional timeline cards were not necessary to correct those facts. No cosmetic English name guessing or ID slug churn. Full list-party rank assignments, votes, agreements and elected-seat allocations remain unchanged.

## Owner questions

None. Remaining retrieval/coverage gaps above have no competing verified values to ask the owner to arbitrate. D1/D2 describe full roster titles versus results/ballot forms and are explicitly disclosed. CEC R is the deciding source for count and official allocation; older Knesset figures are retained as provenance, not substituted.

## Verification

Regenerate with Node 24.18.0 and the repository-locked dependencies: `node scripts/build-datasets.ts`; refresh k26 dataset SHA-256 and status snapshots in the nine existing family inputs; `node scripts/validate-families.ts`; `python3 scripts/validate-party-logos.py`; `npx tsc -p tsconfig.json --noEmit`; `npx vitest run --maxWorkers=2`. Reused existing dependency installation; writable Vite caches are under project `.backup-scratch/data-audit/k26-fixer/`.

Field-by-field comparison with the merged audit HEAD: only `public/data/k26.json` changes among election/locality datasets, in 24 paths covering official seats/source/status, raw source hash/build timestamp, two list-name variant notes, electoral-bloc labels and completed recommendation membership/derived colours. No votes, candidates, agreements, threshold or other election dataset changes. `public/data/sources.json` gains the one source. The hand-maintained `public/data/elections.json` (explicitly identified as hand-maintained in `scripts/lib/build/sources.ts`) has its k26 status/date/notes synchronized. Regenerated `data/meta/joint-facts.json` differs only in eleven k26 `pending` flags (true → false); opening dates and factions remain unknown. Updated the stale Ra’am expectation in `tests/election-context-provenance.test.ts`. Differential allocation, analysis, validation and rules digests stay identical; only model digest re-recorded for these reviewed metadata changes, with an explanatory test comment.

Validation execution limits: default fork-pool Vitest attempts stalled/timed out on a host with load average about 77 (24 CPUs), including unrelated tests; one was externally terminated with SIGTERM. The final full-suite command uses `--pool=threads` and a scratch-only config that spreads `vite.config.ts`, preserves all assertions, adds `testTimeout: 120000`, `hookTimeout: 120000`, `teardownTimeout: 60000`, and a pre-transform on `.test.ts` replacing explicit `, 10_000);`, `, 20_000);`, `, 30_000);`, or `,30000);` timeout endings with 120000. These timing changes are not committed. Reproduce on an overloaded host with the same temporary settings; do not interpret failed default timings as a passing default command.

Final results: dataset rebuild passed (0 writes, 38 unchanged on the final repeat); family validation passed for all 9 presets; logo validation passed for 26 overlays, 184 source records and 135 assets (5 explicitly unresolved); TypeScript passed with no errors; **93 Vitest files, 886 tests passed**, no failures, using the thread/timeout configuration above (80.49 seconds). Historical k26 and differential tests are included. `git diff --check` passed. No Playwright run.
