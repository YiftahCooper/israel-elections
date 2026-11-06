# k18 reconciliation — 10 February 2009

Fixer: Codex, 6 November 2026. Both reports merged after the requested
fast-forward check against origin/main. Decisions follow source-hierarchy.md.

**20 finding groups corrected or explicitly documented; 0 rejected groups;
4 groups already repaired on origin/main; 6 retained verification limitations;
0 owner questions.** Counts are deduplicated finding groups, not scalar fields.
O refers to the Opus report's numbered table; F/S/U/D to the Codex report.

## Evidence independently rechecked

Retained YP 5909 (approved candidates), YP 5917 (results), YP 5912
(agreements/resignations) and the CEC allocation memorandum were re-extracted
with repository pdfjs. All are rank 1. URLs and byte hashes remain in
`data/raw/SOURCES.json`; no original PDF bytes changed.

- YP 5909 p. 2102: “אות הרשימה : פח”, “כינוי הרשימה : מהפך בחינוך”; ranks
  1–12 run from פסקל אברהם to ויינריך איתן. CEC memorandum lists פח and zero votes.
- YP 5912 p. 2254 has seven resignations dated 28 January and five dated
  1 February, covering that entire roster, plus the four other resignations
  in O6. Extract the notice's right column separately to avoid interleaved columns.
- YP 5917 p. 2403 gives “מיכאלי סאמואלסון אנסטסיה”; approved roster prints
  “סאמואלסון מיכלבסקי אנסטסיה”. These are document-specific names of one person,
  not conflicting electoral outcomes.
- YP 5917 invalid count is 49,684; CEC memorandum p. 3 gives 43,097 invalid,
  3,373,490 valid and 3,416,587 cast. The hash-verified retained data.gov file's
  **9,264** polling rows independently reconcile to those CEC totals. Build also
  reconciles all **1,157** locality rows and all 33 vote-bearing list sums.
- Retained Knesset OData plus biography PersonIDs: all **120** elected identities
  have an opening faction on 24 February 2009; no residual unknowns in the
  four reported joint factions.
- [Ynet, 1 April 2009](https://www.ynet.co.il/articles/0,7340,L-3695524,00.html),
  rank 4: “מפלגת הליכוד חתמה על הסכם קואליציוני עם יהדות התורה.”
  [IDI formation study](https://en.idi.org.il/articles/11757), rank 2:
  “a coalition of five parties, who together hold 69 seats”.
- [Walla, 12 February](https://news.walla.co.il/item/1434768), rank 4, opened
  through Jina: calls Gilon “מספר 2 במרצ”.
- [Walla, 25 December 2008](https://news.walla.co.il/item/1405053), rank 4:
  reserves slot 39 for Ahi. This does **not** independently prove slot 45.
- [Dissolution law, SH 2383](https://fs.knesset.gov.il/18/law/18_lsr_301510.pdf),
  rank 1, official search-index text: passed 16 October, effective 15 October.
  [Knesset release](https://main.knesset.gov.il/News/PressReleases/Pages/press160112.aspx)
  is dated 16 October, 00:50. Direct PDF redirects to geographic unavailability;
  no bypass attempted. Access limitation is recorded in the input note.
- [Commons Likud file history](https://commons.wikimedia.org/wiki/File:Likud_Logo.svg)
  distinguishes the 4 January 2009 upload from the 9 November 2012 “original
  vector”. An archive URL alone does not identify the byte revision. Neither
  auditor established official campaign use of the retained exact asset.
- IDI-hosted [Hadash PDF](https://www.idi.org.il/media/6525/hadash-2009org.pdf)
  was independently retrieved through Jina: footer is “18/11/2012” and
  `http://hadash.org.il/matzahadash/`. It cannot establish a 2009 edition.

## Decisions and input changes

| Finding | Decision and deciding evidence | Files changed |
|---|---|---|
| O1 | Add פח with 12 approved candidates, zero votes, withdrawal note and zero seats. YP 5912 establishes withdrawal, not merely zero votes. | k18-corrections.json; k18/k19 builder; registry and party-link coverage; DATA.md; generated k18 and locality data |
| O2 / F08 | Restore logical Hadash parentheses; preserve exact Hebrew wording. PDF text-layer delimiter order is not logical display order. | corrections input; parties registry; Arab family cached name; generated k18 |
| O3 | Restore Landver and Halpert parentheses, preserving ranks and IDs. | corrections input; builder; generated k18 |
| O4 / F10 | Remove stale claim that no included term events exist. Two sourced entries already exist; broader chronology verification remains U06. | aftermath/k18.json |
| O5 | UTJ accession on 1 April is confirmed by dated Hebrew reporting; remove stale source gap. | k18.json scheme evidence; aftermath |
| O6 | Add four resignation notes dated 26/28 January from YP 5912. Preserve original roster and elected membership. The withdrawn list gets a collective all-12 note. | candidate-notes.json; corrections input |
| O7 | Retain approved-roster spelling and annotate the later elected-name notice. These names describe different publication snapshots; no owner decision needed. | candidate-notes.json |
| O8 | Normalize four displayed English names' backticks/whitespace for k18 only. Regev's reported malformed name is not displayed on the merged baseline, so no replacement is invented. Raw Knesset file unchanged. | build/bios.ts; bios regression expectation |
| O9 | Explicitly label five registry name-history entries as observed ballot-list labels, not registered names. | parties.json |
| O10 / S01 | Remove unsupported design-date claim. Mark exact Likud campaign-use evidence unresolved; retain original asset, stop applying it. Neither 2009 nor 2012 byte identity is asserted solely from the URL. | logos/k18.json; generated k18 |
| O11 | Replace formation sources; add Walla slot-39 evidence and YP 5917 p.2405 Moledet representative evidence. Remaining rank assignments are not newly certified; see U03. | k18.json; regenerated joint-facts |
| O12 | Retitle Hadash platform to disclose November 2012 print date and unverified election year. | party-links/k18.json |
| F01 | Correct formation-day snapshot to 69 coalition / 51 opposition, placing UTJ outside it. Opus accepted a mixed-date 74-seat snapshot; dated accession evidence and IDI settle this in Codex's favour. | k18.json; aftermath cross-reference; generated scheme |
| F06 | Assign Gilon (rank 2) to Meretz: seven roster assignments, three elected assigned, no unknown elected. Walla plus official identity join settle Opus's conservative omission. | k18.json; joint-facts; generated k18 |
| F07 | Correct Ra'am expansion to הרשימה הערבית המאוחדת, as the official list name prints. | k18.json; joint-facts; generated k18 |
| F09 | Date the vote event 16 October; retain 15 October effective dissolution explicitly. Rank-1 law settles the lower-rank press/IPU date shorthand. | aftermath/k18.json |
| F11 | Describe 18–19 February as start/end consultation window, not call the start date the last day. Dates unchanged. | aftermath/k18.json |
| F12 | Narrow Ta'al/Moledet gaps to missing profile/platform; retained official homepages already establish campaign-period identity. Rechecked retained page/CSS references cited by logo metadata. | party-links/k18.json |
| S02 | Meretz upload chronology establishes availability, not official campaign use. Mark unresolved and stop applying; retain asset and attribution. | logos/k18.json; generated k18 |
| D01 | Retain CEC 43,097 invalid and 3,416,587 cast, explicitly preserving Gazette disagreement in existing status/context notes and decision 0040. As with k22, arithmetic plus independent primary polling rows identifies an inconsistent Gazette count; no invented cast total. Gazette valid plus printed invalid exceeds the independently recorded cast by 6,587. No formal erratum or explanation of that difference was found; this decision does not claim one. | existing disclosed inputs unchanged; this resolution records adjudication |

F02–F05: already fixed on origin/main by the dedicated name-matching repair.
Independent stable-ID check confirms Likud 27, Degel 2, Ra'am 3 and Tkuma 2,
all with zero unknown faction. No shared matching code changed. Joint-facts was
regenerated only for k18 affiliation/name/source edits; all other elections equal baseline.

## Retained verification limitations

These are rechecked limitations, not rejected findings or claims of complete verification.

| Finding | Disposition |
|---|---|
| U01 | Pattern-linked biography endpoints are not body-verified pages. Official identity joins confirm the elected 120, not every unelected URL or transliteration. Existing probability flags remain; no concrete wrong destination established. |
| U02 | Colours remain documented display conventions, explicitly not official 2009 specifications. Exact historical infobox hex values were not comprehensively recertified. |
| U03 | Better sources added where independently readable. Slot 45, all unelected internal affiliations and inferred Likud complement remain lower-rank/partial evidence; official joint-faction membership cannot prove an internal constituent assignment. No new blanket certification. |
| U04 | Hadash's concrete platform-year defect corrected. Other link targets remain source-labelled; not every redirect/page body was reacquired. |
| U05 | Full polling/locality numeric reconciliation now passes using the retained manifest hash. Demographic and family interpretations remain inferred; no invented constituent vote split or complete historical-classification audit. |
| U06 | Dates/window and internally present two-chronology citations checked. Full all-party recommendation matrix and every secondary chronology body were not independently reacquired; existing provenance remains explicit. Removing a stale gap does not certify those unperformed checks. |

## Owner questions

None. The documented source distinctions and primary arithmetic resolve the
concrete disagreements without asking the owner to ratify technical uncertainty.
Remaining research limits above are not equally supported competing values.

## Reproduction and validation

Node 24.18.0 and repository lockfile dependencies. Reproducible scratch material
is under `.backup-scratch/data-audit/k18`; polling source is copied into the
manifest's `.backup-scratch/raw/k18` path from the main checkout and hash-verified.
Dependencies are reused through a local scratch link farm so tool caches are writable.
No Playwright, push, deployment or main integration.

The builder uses existing `listRecord.withdrawn` support with election-scoped
corrections. It checks the original locality fingerprint first, then appends the
withdrawn zero column; subsequent builds project out that verified zero column
before checking the original source fingerprint. A second serial build is byte-stable.
No original locality evidence is blessed with a new source hash.

Recursive dataset review: only k18 changes. Original active-list votes, seats,
agreements, rules, candidate IDs/ranks and totals are unchanged. Locality data
changes only by the new list ID and 1,157 zero vote cells. Dataset changes are the
withdrawn list, its zero-seat entry, three Hebrew strings, four English strings,
five candidate notes, one party expansion/affiliation, one platform label, two
logo removals, UTJ's bloc membership and build timestamp. Family/registry/lineage
hashes and cached Hadash identity are refreshed.

Substituting merged HEAD's k18 into `scenarioFromDataset` reproduces old
allocation **bf733b00…** and model **ffb2cc3a…** exactly; only those digests change.
The withdrawn list changes the deterministic hypothetical corpus input;
engine/model code is untouched. The digest fixture documents this review.

Final validation:

- Dataset build passed, including full 9,264-row polling reconciliation; repeat serial build wrote zero files.
- Family validation: 9 presets across k1–k26, registry and lineage passed.
- Logo validation: 26 overlays, 184 records, 134 applied assets; 142 hosted records and 6 unresolved records. Retained unresolved bytes are still integrity-checked.
- TypeScript passed (`npx tsc -p tsconfig.json --noEmit`).
- Vitest: **95 files, 903 tests passed**, including historical-k18 and all five differential families, 37.78 seconds. Command: `npx vitest run --maxWorkers=2 --testTimeout=180000 --hookTimeout=180000`.
- `git diff --check` passed. No Playwright.

Initial runs exposed missing coverage entries/English-label qualification for the new list,
which were corrected. The sandbox blocked Vite cache writes and the gallery Node
subprocess; the final suite used project-scratch cache links and approved subprocess
execution. Extended timeouts accommodate concurrent host load without changing assertions.

## Display changes for coordinator

- List count: 33 → 34 approved lists; new **מהפך בחינוך / Mahapach BeHinuch**, withdrawn, zero votes.
- Hadash full name and candidate names לנדבר סופיה / הלפרט שמואל: `)…(` → `(…)`.
- `Ze\`ev Boim` → `Ze'ev Boim`; `Akram  Hasson` → `Akram Hasson`;
  `Moshe  Kahlon` → `Moshe Kahlon`; `Moshe Ya\`alon` → `Moshe Ya'alon`.
- `רע"ם – רשימת האיחוד הערבי` → `רע"ם – הרשימה הערבית המאוחדת`.
- Hadash link `חד"ש — מצע 2009` → `חד"ש — מצע מהאתר (הודפס בנובמבר 2012; שנת הבחירות לא אומתה)`.
- Formation scheme labels unchanged; coalition/opposition counts **74/46 → 69/51**.
- Meretz rank 2: unassigned → Meretz; unknown elected **1 → 0**.
- Likud and Meretz logo evidence: verified → unresolved; images no longer applied.
- Five candidate explanatory notes added; aftermath dissolution vote date **2012-10-15 → 2012-10-16**
  (effective date retained in note). Aftermath is a research record, not yet wired into the app.
- Election stage remains **official-final**, results date remains **2009-02-17**;
  no bloc scheme name or election-status label changed.
