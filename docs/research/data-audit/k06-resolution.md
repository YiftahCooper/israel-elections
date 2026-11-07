# k06 audit resolution — 6 November 2026

Reconciles both complete auditor reports against the source hierarchy on `origin/main`.
Counting: **26 distinct finding groups: 21 corrected or evidence/provenance repaired,
5 rejected as requests for a data correction, 0 owner questions**. Overlapping report
rows are counted once; verification limitations are retained below, not certified away.
All 21 Opus rows and all 19 Codex non-OK rows are mapped explicitly.

## Evidence and decisions

Rank 1 retained primary records:

- **R**: [YP 1230, pp.311–313](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset6-results.pdf),
  `data/raw/research/k06-results.pdf`. Independently rendered and read; the table and
  elected names establish the corrections, without changing votes or seats.
- **C**: [YP 1222](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset6-cand.pdf),
  `data/raw/research/k06-candidates.pdf`; candidate spellings are the roster convention.
- **A**: [YP 1225 p.189](https://olaw.org.il/yalkut/yalkut-1225.pdf),
  `data/raw/k6/agreements.pdf`; official publication on a disclosed mirror.
- **G**: [Eshkol’s 12 January 1966 statement](https://main.knesset.gov.il/mk/government/documents/gov13.pdf),
  independently downloaded and text inspected: “ממשלה חדשה הכוללת את הסיעות” followed by
  Alignment, NRP, Mapam, Independent Liberals and Poalei Agudat Yisrael.
- **O**: [Government 13 OData](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PersonToPosition?$filter=GovernmentNum%20eq%2013&$format=json),
  independently retrieved (45 rows), joined by PersonID to retained
  `data/raw/k6/knesset-odata-members.json` with date intervals enforced.
- **V**: [17 March 1969 plenum, printed p.1982](https://fs.knesset.gov.il/6/Plenum/6_ptm_252808.pdf),
  independently downloaded and page image inspected: 84 for, 12 against, **1** abstention.

All access/rechecks below: 6 November 2026. “Repaired” includes replacing overstated
provenance or date precision, not necessarily changing a numeric value.

| Group | Auditor rows | Decision and source | Inputs / records changed |
|---|---|---|---|
| 1 | Opus 1; Codex F03–F05 | Fixed letters כס→כנ, עס→ענ, סס→פש and connection כא–כנ. R prints “כנ רשימת השלום”, “ענ רשימת התנועה לאחוה”, “פש ישראל הצעירה”. Coordinator overrides the auditors’ proposed ID renaming: every list/candidate/party key stays stable. | national reviewed input; k6 meta; builder; historical fixtures |
| 2 | Opus 2; Codex F02 | Fixed “רשימת תנועת לאורה” to **רשימת התנועה לאחוה** (R/C); unofficial transliteration **Reshimat HaTnua LeAhva**. | national input; meta; link title; party registry |
| 3 | Opus 3; Codex F06 | Fixed official name **השיתוף והאחוה** (R pp.311–313). Modern short label remains separate. | national input; family k6 cache; link title; registry k6 name |
| 4 | Opus 4; Codex F01 | Fixed Alignment’s missing ארץ and dash: “רשימת המערך לאחדות פועלי ארץ-ישראל … מפלגת אחדות העבודה—פועלי ציון …” (R). | national input; meta; family caches; vehicle registry |
| 5 | Opus 5; Codex F04 name | Fixed **רשימת השלום**, **Reshimat HaShalom** (R/C/A). | national input; meta; links; registry |
| 6 | Opus 6; Codex F07 | **קדמה ופיתוח** wins: independently read R p.312. Codex’s suggested קדמה ופתוח is rejected; C’s קידמה ופיתוח and A’s קדמה ופתוח are recorded variants. The results notice is closest to the certified result. | national audit note; k6 family and registry caches |
| 7 | Opus 7 | Fixed NRP rank 11 **דון יחיא שבתאי** (R p.312; retained OData PersonID 2272 דון-יחיא שבתאי). Same candidate ID `6-ב#11`, existing English identity unchanged. | roster input; manifest hashes; regression |
| 8 | Opus 8; Codex F08 | Eshkol ends **26 February 1969**; add **Yigal Allon, acting PM**, until 17 March. O records PersonID 2173 ending 1969-02-26 and PersonID 2142 “ראש הממשלה בפועל” beginning that day. Government 13 itself still ends 17 March. | aftermath PM intervals, citations and succession text |
| 9 | Opus 9 | Fixed the false premise that no list bore כנ. Preserve historical decisions with explicit superseding addenda; DATA now says כא–כנ. | decisions 0068/0069a; DATA |
| 10 | Opus 10; Codex F09 | Repair by distinguishing acts. [Defense Archive](https://archives.mod.gov.il/Exhib/sixdayswar/opening/Pages/default.aspx) (rank 1): “ב-1 ביוני הורחב הבסיס הקואליציוני … וסיעות גח״ל ורפ״י הצטרפו”. O gives formal ministerial appointment starts for Dayan, Begin and Yosef Sapir **5 June**. Political expansion on 1 June and formal appointments on 5 June are compatible. Neither auditor’s single-date account is adequate. | meta notes and sources; aftermath unity event/date |
| 11 | Opus 11; Codex F11 | Removed stale war-date gap: existing event already gives 5–10 June and direct-date citations. | aftermath gaps |
| 12 | Opus 12 | Removed stale certification/opening gap; add signature **9 November**, publication **12 November**, first sitting **22 November**. R signature “י״ד בחשון תשכ״ו (9 בנובמבר 1965)”; retained OData opening StartDate 1965-11-22. | aftermath results and gaps |
| 13 | Opus 13; Codex F10 | Refresh **k6 only** after rebuild, in registry, lineage and all nine family rows/source entries. No other-election hash changes. | registry; lineage; nine family inputs |
| 14 | Opus 14; Codex coalition OK row | Repaired evidence; **retain 75**, by the project’s existing definition “joined or supported … at formation”. G names five participating factions (71 seats). [IDI 1965](https://www.idi.org.il/policy/parties-and-elections/elections/1965/) (rank 2) explicitly adds the minority lists to reach 75. These are four **support-only** seats, not ministerial participation, and not the 71–41 vote. Reject Opus’s proposed 71 as the value of this broader field. | replace Wikipedia-only evidence in meta/aftermath; explicit distinction in notes |
| 15 | Opus 15; Codex F16 | Repaired rank evidence. Independently read IDI-hosted annotated copies: [Alignment](https://www.idi.org.il/media/7012/כנסת-6-מערך.pdf) and [Gahal](https://www.idi.org.il/media/6442/כנסת-6-גחל.pdf) (rank 2 annotations on rank 1 print). Marks support **36/9** and **15/11**; Alignment’s א ranks 3,6,11,17,21,26,31,36,41; Gahal’s ל ranks 2,4,6,8,10,12,14,16,18,20,22. Ruth Haktin rank 21 is א. Handwriting is labelled academic, not official Gazette text. | two retained annotated PDFs and manifest records; party-level sources/notes |
| 16 | Opus 16; Codex F14 | Rafi **verified→unresolved**. Existing Commons source record says “Own work”, date 2018-09-15; no inspected contemporary artefact. Retain asset and licence, withhold from app; confidence describes the reconstruction, not verified 1965 use. No claim that it is a later redesign. | logo overlay |
| 17 | Opus 17 | **Rejected.** Date-joined independent reproduction gives **18 distinct ministers: Alignment 11, NRP 3, NON-MK 4**. Kol’s retained position and faction interval ends **1966-01-11**, before O’s cabinet start on 12 January. NON-MK persons are 2662, 2575, 2210, 2220. The auditor treated an expired faction row as current. This table is by serving MK faction, not political affiliation. | clarification in meta; original table retained |
| 18 | Opus 18; Codex F12 | Repaired precision: use **November 1965** for consultations, with day uncertainty explained. Independently retrieved [JTA 24 November](https://www.jta.org/archive/israel-president-starts-talks-today-on-formation-of-new-cabinet) (rank 3): body says consultations start tomorrow; heading says today. The 26 November bulletin attests recommendations, not an exact complete diary. Preserve the two recommendations and 36 known seats. | aftermath dates, source, notes |
| 19 | Opus 19 | Replace Wikipedia-only affiliation support with IDI 1965 and [IDI Progress and Development](https://www.idi.org.il/policy/parties-and-elections/parties/progress-and-development/) (rank 2): “רשימת מיעוטים נלווית למפא״י (מפלגת לוויין)”. IDI’s 1965 narrative identifies the minority lists accompanying Mapai; no joint-list claim is made. | meta scheme sources |
| 20 | Opus 20 | **Rejected as a correction.** V’s page image clearly prints “נמנע — 1”. Keep one abstention; repair citation and singular grammar. Codex was right on the value. | aftermath quote/grammar only |
| 21 | Opus 21 | **Rejected as a data error.** No later corrigendum is identified. Targeted Hebrew search for YP 1230 / תיקון / 1965 found none; retained final notice and certified seats remain controlling. This is not a claim of exhaustive absence. | no data change |
| 22 | Codex F13 | Repair conflict provenance; **retain 1,499,709**. [CEC administrative historical table](https://www.gov.il/apps/elections/heb/history/BasicFacts.html) (rank 1) explicitly gives 1,499,709, corroborating retained CBS 27.2. Knesset’s later history summary and IDI give 1,499,988. Prefer the election administrator’s own count series, closer to administration of the register, over a general later history summary. The divergent value remains named; contemporary register certification was not recovered. | national input audit note |
| 23 | Codex F15 plus logo URL observations | Repair missing **File:** in Alignment/Rakah description URLs and corresponding source records. Existing retained Rakah metadata names 1965 and NLI item 700098530; Alignment names 1965–68 and item 700094557. Independent live Commons fetch failed; no original NLI item was reopened, so do not claim independent contemporary certification. No evidence of a false attribution or redesign was found. | two overlay URLs and matching source catalogue URLs |
| 24 | Codex F17 | **Rejected as a finding of incorrect data.** Report says all 120 OData IDs match; not opening every destination is a coverage limitation, not counterevidence. Retained exact PersonID/name mappings remain; no invented link corrections. Broken title transcription was fixed under groups 2/5. | no additional changes |
| 25 | Codex F18 | **Rejected as a finding of incorrect data.** Inputs explicitly call colours conventional Wikipedia CSS and say no official campaign colour source exists; no historical official-colour claim or competing value is established. Keep labelled editorial conventions. | no change |
| 26 | Codex F19 | Repair mirrored Knesset history from “official” to **secondary attributed reproduction**. Independently reopened [IDI chronology](https://en.idi.org.il/articles/22171) (rank 2), confirming 1966 abolition; [IPU contemporary account](https://data.ipu.org/election-summary/PDF/ISRAEL_1969_E.PDF), p.75 (rank 2), explicitly says election 28 October 1969 on normal expiry. Keep existing 5–10 June war dates; Defense Archive confirms onset; direct end-date citation remains, but live UN retrieval was denied. Clarify election-cycle window versus institutional membership through 17 November 1969. Original expiry law remains an explicit existing gap. | aftermath source kind, publisher, term-window note |

## Generated-data and interface boundary

Inputs were rebuilt; no public dataset was hand-edited. Recursive comparison against the
merged-report baseline finds **25 changed scalar/property paths in k6 only**: official
names, three ballot letters, two transliterations and associated short labels/link titles,
Don-Yihya’s name, Rafi logo removal, two Commons description URLs, review date and raw
input/build hashes. All list IDs, all candidate IDs, votes, national totals, official
seat maps, agreement IDs/member keys, ordering, rules and allocations are identical.
Only the differential **model** digest changes; allocation/analysis/validation/rules do not.
The historical fixture now resolves IDs through the list records rather than deriving
IDs from letters. The regression checks stable keys and Don-Yihya’s unchanged candidate ID.

UI inspection was static, as requested: `src/app/derive.ts` `listLabel` uses shortHe/shortEn;
ballot renderers use `letters`. Export records retain opaque IDs for identity and separate
letter/name fields for presentation. No UI conversion of the three keys into ballot text
was found. Family-history fallback strips an ID only for missing history records; current
k6 labels are supplied by the rebuilt dataset/catalogue. No browser or Playwright ran.

On-screen changes for integration tests:

- כס → כנ; עס → ענ; סס → פש (including the displayed inactive כא–כנ connection).
- רשימת תנועת לאורה → רשימת התנועה לאחוה; Reshimat Tnuat Leora → Reshimat HaTnua LeAhva.
- רשימת שלום → רשימת השלום; Reshimat Shalom → Reshimat HaShalom.
- Official expanded labels: שיתוף ואחווה → השיתוף והאחוה; קידמה ופתוח → קדמה ופיתוח;
  Alignment’s full name gains ארץ- and the dash before פועלי ציון. Modern short labels remain.
- דיין יחיא שבתי → דון יחיא שבתאי.
- Rafi logo is withheld (metadata verified → unresolved); review date 2026-11-03 → 2026-11-06; no public data-stage or bloc-name change.
- Aftermath is a research pilot, not wired into the UI: Eshkol/Allon intervals, consultation
  precision, unity date and confidence-vote grammar therefore change research labels only.

## Owner questions

None. Source disagreements were settled by document scope/proximity, including the CEC
electorate series and the explicit broader coalition definition. Remaining retrieval and
coverage limits above are not unresolved competing factual values requiring owner arbitration.

## Reproduction and validation

Node v24.18.0; locked project dependencies copied into local `.backup-scratch/node_modules`;
PDF inspection used scratch-only PyMuPDF. Retained scans, inputs and source URLs/hashes
are durable; downloaded comparison records and renders are disposable scratch.
No backup exclusion is assumed. Commands: `BUILD_JOBS=2 node scripts/build-datasets.ts`,
k6-only family/lineage/registry hash refresh, `node scripts/validate-families.ts`,
`PYTHONPYCACHEPREFIX=.backup-scratch/pycache python3 scripts/validate-party-logos.py`,
`npx tsc -p tsconfig.json --noEmit`, `npx vitest run --maxWorkers=2`.

Final verification:

- Dataset rebuild passed; final rerun **0 files written / 38 unchanged**.
- Family validator passed: **9 presets**, with k6-only hash refresh.
- Logo validator passed: **26 overlays / 184 source records / 131 distinct assets**.
- TypeScript passed with no diagnostics.
- Full Vitest passed: **97 files / 923 tests**; final k6 regression rerun **5/5** passed after strengthening the Don-Yihya assertion.
- Differential suite passed all five families; reviewed 25-path k6 field diff explains the model-only digest update.
- `git diff --check` passed. No Playwright, push or main merge.

The initial sandboxed suite had a gallery subprocess EPERM; the authorized unrestricted
full run cleared it. No production code change was made for that environment failure.

## 7 November 2026 — pre-release identity correction

Owner direction supersedes the earlier stable-ID compatibility rule: internal list IDs now follow the corrected official ballot letters, with candidate IDs and all references updated and no aliases or migration. `6-כס` → `6-כנ`; `6-עס` → `6-ענ`; `6-סס` → `6-פש`. Votes and seats are unchanged.
