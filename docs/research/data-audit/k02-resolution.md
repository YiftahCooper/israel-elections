# k02 audit resolution — 6 November 2026

Fixer: Codex. Both auditor branches were merged, then local `main` (including
10fa1d9 and the k3 integration) was merged following the coordinator update.
The binding source hierarchy is the version from main. Counts deduplicate the
reports: **15 groups fixed/addressed, 2 missing-evidence implications rejected,
1 owner question, 1 retained verification limitation** (19 groups total).
A rejected implication does not invalidate the auditor's honestly reported access limit.

## Independently rechecked sources

All accesses below: 2026-11-06. Scans were rendered with the repository's
`render-logo-pdf-page.mjs` / locked pdfjs dependency; ambiguous losing-roster
names were reread at 5×/7×. Original PDFs remain retained, renders are disposable.

- **R, rank 1:** [YP 181, 10 August 1951](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/records-results2/he/archive_knesset2_records-results2.pdf),
  `data/raw/research/k02-results.pdf`, SHA-256 ba90a26a4e7a1d350e5afcdfba20f8fd574b088c60f39dc89722c9653a1d1988.
  p.1241: ו / 46347; טת / 4038; “המזרחי ודתיים בלתי מפלגתיים”.
  p.1242 signature: “ד׳ באב תשי״א (9 באוגוסט 1951)”.
- **C, rank 1:** [YP 174, 13 July 1951](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset2-cand.pdf),
  `data/raw/research/k02-candidates.pdf`, SHA-256 4dca7c4eded942b957081079584c0afa0e358e562ce1d50e27e25cd619f4e995.
  p.1145 “אות הרשימה: ו”; p.1147 34 candidates beginning
  “מוקוטובסקי אברהם אליהו”, ending “מגיד צבי”; p.1155 16 beginning
  “פעילן אדם”, ending “סגל שמעון”. The Emunei heading appears **טח**, not
  an unambiguous טת; the final result's טת controls the results display.
- **K, rank 1:** retained `data/raw/k2/knesset-odata-members.json`,
  [official membership query](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PersonToPosition?$filter=KnessetNum%20eq%202%20and%20(PositionID%20eq%2043%20or%20PositionID%20eq%2061)&$format=json).
  Exactly 120 opening positions have `StartDate:1951-08-20T00:00:00`.
- **P, rank 1:** [Knesset sitting 13, 8 October 1951](https://fs.knesset.gov.il/2/Plenum/2_ptm_250617.pdf),
  fetched normally with the prescribed User-Agent and read with repository PDF extraction:
  “בערך 65 חברי כנסת עומדים מאחורי הממשלה” (spacing normalized).
  This supports the aggregate supporting camp, not a personal recommendation roll call.
- **I, rank 2:** IDI Hebrew profiles independently read:
  [Democratic List](https://www.idi.org.il/policy/parties-and-elections/parties/hareshima-hademocratit/),
  “מפלגת לוויין של מפא״י שנכנסה לכנסת השנייה והשלישית”;
  [Progress and Work](https://www.idi.org.il/policy/parties-and-elections/parties/progress-and-work/),
  [Agriculture and Development](https://www.idi.org.il/policy/parties-and-elections/parties/agriculture-and-development/),
  both “רשימת מיעוטים נלווית למפא״י (מפלגת לוויין)”.
- **U, rank 1:** [UN S/3252, 25 June 1954](https://digitallibrary.un.org/record/603141/files/S_3252-EN.pdf),
  read via ordinary Jina extraction: section I “On 17 March 1954”; incident
  “about noon on the same day”; section II independently describes the observer's
  arrival on 17 March. No source access restrictions bypassed.
- **J, contemporary press (rank 4 conservatively):** [JTA dispatch dated 14 August 1951](https://www.jta.org/archive/weizmann-continues-consultations-with-party-leaders-on-composition-of-government),
  independently reopened: “His consultations will conclude tomorrow”.

## Decisions on every non-OK group

| Report findings | Decision, evidence and files |
|---|---|
| Opus 1 / Codex N1 | **Fixed.** R and C establish ו. `national.reviewed.json`, roster and k2 meta/aftermath letter references corrected. Stable `2-ה` and all eight candidate IDs preserved via national input `legacyId`, using main's shared `keyLetters()` mechanism. Auditor proposals to migrate IDs are superseded by coordinator policy. |
| Opus 2 / Codex N5 | **Fixed with variant recorded.** R prints טת; C's heading appears טח. Codex was right to flag the primary variant; Opus's assertion that both notices clearly agree is not retained. R is the record closest to the final result, and the Codex-read CEC memorandum independently reports טת. Display טת, preserve `2-טח` through `legacyId`. The source disagreement remains in national corrections and k2 meta; no unsupported claim about the physical ballot or a formal correction notice. |
| Opus 3 / Codex N2 | **Fixed.** R/C: “המזרחי ודתיים בלתי מפלגתיים”. National input and copied national-religious/religious family member names corrected. |
| Opus 4 / Codex N6 | **Fixed with printed variant recorded.** C p.1150 has “רשימת ספרדים ועדות המזרח ותיקים ועולים”, also quoted by the retained connection notice. R tables visually have **רשימה**, as Codex observed. Use the registered list name, explicitly record R's variant in national corrections and meta; do not pretend both notices print the same word. |
| Opus 5 | **Fixed.** C p.1150 and R p.1242: “ששון סילס בנימין”; roster candidate/elected fields and correction evidence. |
| Opus 6 | **Fixed.** C p.1150: “ח׳ניפס צאלח חסן”; candidate-era spelling retained in roster rather than modern biography spelling. |
| Opus 7 | **Fixed.** C p.1148 / R p.1242: “מעדי ג׳בר”; roster spelling corrected (geresh normalized). |
| Opus 8 | **Fixed.** C p.1153 / R p.1242: “וילנסקה (בריטשטיין) אסתר”; roster corrected. |
| Opus 9 | **Fixed.** C p.1145 / R p.1242: “אונה משה”; modern Knesset אונא remains a separate biography convention. |
| Opus 10 | **Fixed by transcription.** C pp.1147/1155 contain both losing rosters: all 34 + 16 candidates now retained with ranks, pages and zero elected names. Complete flags replace unavailable flags. k2-only verifier exception permits these known zero-seat rosters without weakening other elections' winning-prefix checks. No candidate is marked withdrawn merely for losing. |
| Opus 11 / Codex N3 | **Fixed.** Rehash final generated k2 bytes in parties, lineage and nine families, updating only k2 source/row hashes and k2 status snapshots. All other election records preserved. |
| Opus 12 / Codex N4 | **Fixed.** Remove foreign government 14 text from this aftermath file; state that governments 4–6 use election-list weights, not reconstructed faction strength. |
| Opus 13 | **Fixed.** R signed 9 August, published 10 August; K opening membership 20 August. Record three separate dates with sources; remove stale missing-evidence gap. Election-cycle window is explicitly distinct from institutional tenure. |
| Opus 14 | **Fixed evidence basis.** I confirms all three satellite affiliations. Replace scheme's Wikipedia-only references with Hebrew IDI sources; add P's aggregate 65 support evidence to first-government scheme and clarify the remaining secondary basis for per-list support assignments. Bloc memberships/titles and seat totals unchanged. |
| Opus 15 / Codex N7 | **Owner question below.** J predicts rather than confirms completion; remove both precise actual `endDate` fields and retain August plus the unresolved 14/15 note. |
| Codex N8 | **Reject missing-English-evidence implication.** Re-read `fetch-mk-names-en.py`, `applyBios`, retained official English headers and all 120 mappings. Every existing English name matches `data/raw/bios/knesset-site-mk-names-en.json` keyed by site ID (apostrophe display normalization). These are modern official English forms, not purported 1951 English gazette spellings. No English correction warranted. |
| Codex N9 | **Addressed; live limitation remains.** All 120 `(knessetPersonId, siteId)` pairs match retained official `data/raw/bios/knesset-odata-mk-site-codes.json`. Change 117 `pattern` markers to explicit official mapping / live destination unverified. Representative live route 684 was inaccessible through the web tool; do not claim a 120-page sweep or current Hebrew-Wikipedia destination validation. URLs and runtime bios unchanged. |
| Codex N10 | **Reject missing-date-evidence implication after recheck.** U explicitly confirms 17 March. Keep the date and already recorded Knesset-history 18 March discrepancy. Rank-1 same-day observation beats later historical summary. Auditor access failure was real; no change to the event warranted. |
| Codex N11 | **Retained verification limitation.** All 17 approved lists appear with votes in R, and C supplies the losing rosters; no whole-list withdrawal established. A targeted Hebrew search for a later 1951 Gazette correction produced no deciding notice. This is not an exhaustive issue-by-issue correction-chain audit. Do not invent withdrawals or declare the chain complete. |

## Owner questions

**Consultation completion: 14 or 15 August 1951?** Best accessible source on both
sides is J (rank 4 contemporary dispatch): a 14 August publication saying
“tomorrow” suggests **15 August**, but a prior-day bulletin dateline could mean
**14 August**, and future tense confirms neither actual finish. No rank-1 diary
or completed-meetings report was recovered. Recommendation: keep only August
as implemented; restore an exact end only after a dated official diary or
contemporary completion report settles it. No owner ratification of an
independently verifiable technical claim is requested.

## Scope, generated diff and validation

- No k2 structured joint-list count residue exists; `joint-facts.json` has no
  k2 alliance to repair. `scripts/joint-facts.ts` was not changed.
- Internal list/candidate IDs, votes, national totals, seats and agreement
  references are unchanged. UI Slip, Candidates and bloc displays use `.letters`
  and names, not suffix extraction from these IDs. Party-link keys stay opaque;
  their titles contain no stale ballot letters. No Playwright run.
- Recursive old/new k2 comparison: 21 changed paths/groups: two letters, two list
  names, five candidate names, two roster lengths and four coverage flags,
  status asOf/notes, two raw hashes and build timestamp. Added candidates are the
  50 visually transcribed rows. Other public election datasets are unchanged
  relative to the merged main baseline; all pre-existing candidate IDs preserved.
- Baseline substitution at `scenarioFromDataset` reproduces all five committed
  differential digests. Only **model** changes with the corrected dataset;
  allocation, analysis, validation and rules digests remain unchanged. Digest
  update has an explanatory comment. Shared release-test fixtures now use display
  letters and allow k2's complete losing rosters.
- Build succeeded; family validator: **9 presets, k1–k26**; logo validator:
  **26 overlays / 184 source records / 131 assets**; tsc passed; final Vitest:
  **99 files, 943 tests passed** (`--maxWorkers=2`). First sandboxed run's gallery
  subprocess EPERM was resolved by rerunning with subprocess permission; no test
  was skipped. Reproduction: run the BRIEF's five checks in order, refreshing
  only k2 family/lineage/registry hashes after the build. No browser tests run.

## Display/status changes for browser-test coordination

No bloc title or `official-final` stage changed. Existing IDs remain unchanged.

- Hapoel HaMizrachi ballot label: **ה → ו**; Emunei: **טח → טת**.
- Full list name: **המזרחי והדתיים בלתי מפלגתיים → המזרחי ודתיים בלתי מפלגתיים**.
- Full list name: **רשימה ספרדים ועדות המזרח ותיקים ועולים → רשימת ספרדים ועדות המזרח ותיקים ועולים**.
- Candidate names: **ששון סלים בנימין → ששון סילס בנימין**;
  **חניפס צאלח חסן → ח׳ניפס צאלח חסן**;
  **מעדי גבר → מעדי ג׳בר**;
  **וילנסקה (ברישטיין) אסתר → וילנסקה (בריטשטיין) אסתר**;
  **אונא משה → אונה משה**.
- Emunei and ש coverage: **candidate list unavailable → complete roster**
  (34 / 16 entries). The unavailable-list message disappears for these lists;
  no shared UI wording changed.
- National-status qualification: **“later ranks and losing-list rosters are
  untranscribed” → “later ranks of winning lists are untranscribed. Both
  losing-list rosters are transcribed in full (34 and 16 candidates).”**
  Hebrew: **“דרגות מאוחרות ורשימות מועמדים ללא מושבים לא תומללו” →
  “דרגות מאוחרות ברשימות הזוכות לא תומללו. שתי הרשימות ללא מושבים תומללו
  במלואן (34 ו־16 מועמדים)”**. Remaining status wording unchanged.
- Status asOf: **2026-11-03 → 2026-11-06**. Source support notes now cite
  IDI/plenum instead of claiming Wikipedia-only support. Aftermath dates/gaps
  are research-only (not wired into the app).

Changed file groups: k2 national/roster transcriptions; raw/source manifests;
k2 meta, bios and aftermath; parties and lineage; all nine family k2 records;
generated k2 and election-index status; shared early verifier (roster coverage
only); k02 and early-release tests; differential model digest; this resolution;
one changelog line. The two auditor reports arrived via their merge commit.

## 7 November 2026 — pre-release identity correction

Owner direction supersedes the earlier stable-ID compatibility rule: internal list IDs now follow the corrected official ballot letters, with candidate IDs and all references updated and no aliases or migration. `2-ה` → `2-ו`; `2-טח` → `2-טת`. Votes and seats are unchanged.
