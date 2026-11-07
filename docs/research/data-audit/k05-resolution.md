# k05 reconciliation — 6 November 2026

Both auditor branches merged after `git merge --ff-only origin/main` reported already up to date. Binding hierarchy is the 6 November version on origin/main. Counts deduplicate overlapping rows: **17 finding groups fixed/documented, 1 missing-evidence implication rejected, 1 owner question**. Auditor access limitations are not blanket certifications.

## Evidence independently rechecked

- **R, rank 1:** retained [YP 869, pp.1937–1939](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset5-results.pdf). Rendered pp.1937 and 1939 with PyMuPDF. Table reads “עט שוחרי הדימוקרטיה 335”, “סש”, and “חזית דתית לאומית, המזרחי והפועל המזרחי ובלתי מפלגתיים”. Liberal parenthesis explicitly says “לאחר שהמועמדים איכילוב עזרא וד״ר כנוביץ שמעון נפטרו”. Signature 23 August, publication 24 August.
- **C, rank 1:** retained [YP 863](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset5-cand.pdf), rendered PDF pp.13 and 21 (printed pp.1807,1815). Heading “האות: שו. הכינוי: רשימת יוצאי תימן”. Ranks: עמיר חיים; מינס מנשה; מדהלה אהרן; כהן שלמה; ציוני משה; גלוסקא אברהם. The geresh in candidate #2 of יא is visible: “מעדי ג׳בר”. R uses the spelling מעודי; registered candidate spelling retained.
- **W, rank 1:** freshly downloaded [YP 866 p.1847](https://olaw.org.il/yalkut/yalkut-0866.pdf), retained in `data/raw/k5/withdrawals.pdf` and hashed in SOURCES.json. Visually read both notices. First withdraws ranks 2–6; second: “עמיר חיים, מועמד מס׳ 1 התפטר … רשימת יוצאי תימן — האות שו, שהיה היחיד ברשימה זו”. Both signed 8 August; issue published 10 August. This directly disproves Codex W4's proposed “שלמה” name and its six candidate transcriptions; Opus's transcription wins.
- **G, rank 1:** freshly downloaded and text-read [government 11 presentation](https://main.knesset.gov.il/mk/government/documents/gov11.pdf). Names all six previous coalition factions, including פועלי אגודת ישראל, השיתוף והאחווה, הקדמה והפיתוח. Supports government-10 support membership without Wikipedia.
- **I, rank 1, access limited:** [ISA formation chapter](https://catalog.archives.gov.il/site/chapter/eshkol-moadon-haarba/). Fixer requests returned 403 (direct HTTP, web and reader); stopped without bypass. Its earlier source excerpts and Opus's freshly reported reading are retained with explicit access provenance, not falsely presented as a new fixer read. The chapter dates consultations to 5–6 September, assignment after them, refusal the next day, and Eshkol's assignment to 14 September. Rank 1 beats JTA bulletin publication dates.
- **A, rank 2:** independently opened Arnon Lamfrom's [2008 University of Haifa dissertation](https://levi-eshkol.org.il/wp-content/uploads/2022/04/דוקטורט-למפרום.pdf), printed pp.249–250, PDF pp.260–261. Explicit refusal on 7 September; after the 13 September party meeting, “למחרת ביקשה משלחת מטעם מפא״י … והנשיא עשה זאת באותו יום”. Independently settles Codex's presidential-meeting objection. Footnotes identify contemporary 7–8 and 14–15 September press and archival documents. Does not independently prove the exact 6 September assignment date; that date rests on I with the disclosed access limitation.
- **J, rank 3-equivalent:** freshly fetched [JTA, 7 September](https://www.jta.org/archive/israel-president-entrusts-ben-gurion-with-formation-of-new-cabinet): “four seats from Mapai’s Arab affiliates”. Supports יא/רא affiliation; publication dates are not promoted to event dates.
- **B, rank 1:** independently opened [CBS 27.2](https://www.cbs.gov.il/he/publications/doclib/2024/hnatonelectionstheknessetandgovernment.27/st27_02.pdf), row 5: 1,271,285 eligible; source CEC. The [Knesset English history](https://m.knesset.gov.il/en/About/History/Pages/KnessetHistory.aspx?kns=5), independently search-retrieved, says 1,274,280. See owner question.
- **English names, retained rank 1:** every one of the 120 populated generated English candidate names equals `data/raw/bios/knesset-site-mk-names-en.json`'s official header value keyed by the bio's siteId. This proves retained name evidence, not live URL availability.

Accessed 6 November 2026. Ordinary downloads used the prescribed project User-Agent. No English Wikipedia, challenge bypass, Playwright or new image research.

## Every non-OK finding

O = Opus row; C = Codex ID. Paths are input paths unless stated otherwise.

| Finding | Decision and evidence | Files changed |
|---|---|---|
| O1 / C W2–W3 | Fix to עט / שוחרי הדימוקרטיה / Shoharei HaDemokratya, 335 votes (R). Reject both auditors' suggested ID renaming under coordinator decision; retain opaque `5-עע` and all candidate IDs. | national.reviewed, k5 meta, registry, party-links, shared early builder, k05 regression |
| O2 / C W4 | Add approved שו as withdrawn, zero votes/seats, full six-candidate roster and 8 August context event (C/W). Reject Codex's incorrect proposed name/roster, not its valid omission finding. | withdrawals PDF/manifest, national.reviewed, k5-corrections, k5 builder, k5 English label/links/registry, election-context, tests |
| O3 / C W1 | Correct סס → סש display letter (R), retaining opaque `5-סס`. | national.reviewed, k5 meta, early builder, tests |
| O4 | Restore והפועל and punctuation in NRP full name (R). | national.reviewed; national-religious/religious family cached names |
| O5 / C U1–U2 | Assignment 6 September, refusal 7 September, rather than bulletin-derived 7/8 September (I). A independently confirms refusal. Record conflicting bulletin dates and fixer's ISA access limit explicitly. Consultations remain 5–6 September. | aftermath events/cites/source access note |
| O6 / C W7 | Remove copied government-14 reference; k5 concerns governments 10–12. | aftermath gaps |
| O7 | Replace stale certification/opening gap with 23/24 August signature/publication and 4 September opening. R signature read; retained OData opening membership supports opening date. | aftermath gap |
| O8 / C S1 | Add 14 September Eshkol assignment and citation supporting the presidential consultation, not merely party intent. I/A settle objection. Keep 2 November return excerpt gap. | aftermath event, recommendation-round citations, gap |
| O9 | Attribute both deaths to R. Keep registered ranks, IDs, exclusions and 17-seat mapping unchanged; infer no exact death dates. | k5-corrections, k5 builder, DATA.md, decision 0067 correction |
| O10 | Correct registered spelling מעדי גבר → מעדי ג׳בר; the geresh is visible in C. Retain registered surname variant rather than silently modernising it. | rosters.reviewed + manifest hash |
| O11 / C W6 | Refresh only k5 dataset hashes and cached identities; no other-election registry hashes refreshed. | parties, lineage, nine families |
| O12 | Fix Commons URL to `/wiki/File:Liberal3.png`, matching the retained title. Provenance status treated separately below. | logos/k5 and logos/sources |
| O13 / C W5 | Correct claim about separate religious lists in 1961; R has one merged NRP ballot. | k5 notes |
| O14 | Replace support-only Wikipedia basis with G; satellite grouping with J. No membership/seat-count change. Regenerated joint-facts has no k5 joint list: these are already merged parties or separate affiliate ballots. No joint-facts script change. | k5 bloc sources/notes, aftermath coalition sources/cites/seat notes |
| C U3 | Reject missing-English-name-evidence implication: all 120 English forms have retained official headers and match exactly. Person identities already checked by both auditors. Live biography destinations and Hebrew-Wikipedia pages remain unverified; `pattern` stays explicitly a pattern marker, not a page-body verification. | No bio/name alteration |
| C U4 | Qualify unverifiable campaign provenance: Commons is community metadata; original credited archive item not inspected. Change Liberal logo `verified` → `unresolved`, removing it from displayed dataset. Keep retained asset, attribution and medium-confidence record. | logos/k5; generated logo omitted |
| C U5 | Exact hex colours are display choices. Add explicit caveat that the earlier CSS attribution was not independently reverified; do not claim official campaign colours. Values unchanged. | k5 colour basis fields |
| C D1 | Keep CBS electorate and record conflicting official Knesset summary. No unexplained numerical replacement. | k5 note; owner question below |

## Owner questions

**One: electorate, competing rank-1 summaries.** CBS/CEC statistical table B gives **1,271,285**; official Knesset English historical summary gives **1,274,280**, a difference of **2,995**. [IDI's Hebrew 1961 summary](https://www.idi.org.il/policy/parties-and-elections/elections/1961/) (rank 2, auditors' corroboration) also gives 1,271,285. No final electoral-roll original or correction explaining the difference was recovered. Recommend retaining **1,271,285**, the specialised CEC-sourced statistical series, with this conflict recorded. The displayed value remains unchanged pending a deciding primary electoral-roll source.

## Generated diff and reproducibility

Node 24.18.0; locked project dependencies. PDF reader: PyMuPDF installed only under project `.backup-scratch/data-audit/k5/pylib`. Dependency references reuse the existing checkout; writable Vite caches are linked into project scratch. No global temp/cache changes. Scratch scripts, renders, downloads used solely for rechecking, and routine logs are disposable; the unique withdrawal PDF is durable and manifested.

Recursive comparison to the merged-report HEAD finds **19 changed k5 paths**, treating the new withdrawn list as one subtree. Only Liberal notes/logo, NRP full name, one geresh, two displayed letters, the 335-vote list's displayed identity/translation/link title, new withdrawn roster/zero-seat key, and source/build metadata differ. No existing list/candidate ID, vote, seat, agreement, threshold or rule changes. No other generated election dataset changed.

Substituting baseline k5 into `scenarioFromDataset` with current engine/model reproduces the previous allocation digest `bf50217e…` and model digest `4faa7f17…` exactly. New digests `821b8752…` and `5e92016a…` reflect the new withdrawn list in hypothetical corpus cases and corrected display fields. Analysis, validation and rules digests unchanged. Tests record the reason; engine/model source unchanged.

## On-screen/export changes for integration tests

- Ballot letters **סס → סש**, **עע → עט**; internal IDs unchanged. `listLabel` consumes shortHe/shortEn, ballot widgets and exports use letters. No suffix-derived label is introduced.
- **הגוש העממי → שוחרי הדימוקרטיה**, **HaGush HaAmami → Shoharei HaDemokratya** (including short labels and results-link title).
- Full NRP name **חזית דתית לאומית המזרחי הפועל המזרחי ובלתי מפלגתיים → חזית דתית לאומית, המזרחי והפועל המזרחי ובלתי מפלגתיים**.
- **מעדי גבר → מעדי ג׳בר**.
- Two Liberal “not among elected; seat passed to next” list notes → one attributed note that both named candidates had died and seats passed to next candidates. Individual `notSeated` flags stay unchanged.
- **Absent שו → רשימת יוצאי תימן / Reshimat Yotzei Teiman**, withdrawn with six registered candidates and explanatory context/note; **14 records → 15 records, still 14 contested lists**.
- Liberal **logo displayed → withheld**, overlay **verified → unresolved**. No global election status or bloc scheme title changed.
- Aftermath is still an unwired pilot: mandate dates **7/8 September → 6/7 September**, new **14 September** Eshkol event and corrected gap/provenance text are draft-only changes.

## Final checks

- `BUILD_JOBS=2 node scripts/build-datasets.ts`: passed; final rebuild unchanged (38 outputs); only k5 and source catalogue differ from baseline.
- k5-only registry, lineage and nine family hashes refreshed; `node scripts/validate-families.ts`: 9 presets across k1–k26 passed.
- `PYTHONDONTWRITEBYTECODE=1 python3 scripts/validate-party-logos.py`: 26 overlays, 184 source records, 131 assets passed; 139 hosted and 9 unresolved records.
- `npx tsc -p tsconfig.json --noEmit`: passed.
- `npx vitest run --maxWorkers=2`: **97 files, 923 tests passed**, including historical-k05, the early-release suite and all differential families. Initial run exposed intended new-list/digest expectations and missing English/link metadata (corrected); gallery subprocess test needed sandbox subprocess permission, then passed unchanged.
- `git diff --check`: passed. No push, main integration or Playwright.

## 7 November 2026 — pre-release identity correction

Owner direction supersedes the earlier stable-ID compatibility rule: internal list IDs now follow the corrected official ballot letters, with candidate IDs and all references updated and no aliases or migration. `5-סס` → `5-סש`; `5-עע` → `5-עט`. Votes and seats are unchanged.
