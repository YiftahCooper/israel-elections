# k01 reconciliation — 25 January 1949

Fixer: Codex; reviewed 6 November 2026. Merged both audit branches after the
origin/main fast-forward check. Binding hierarchy: Hebrew-first, primary official
record above research, research above contemporary press.

**15 finding rows fixed/documented; 0 rejected; 0 owner questions; 1 already fixed
upstream; 2 deferred to coordinator; 3 retained verification limitations.** These
are the 21 deduplicated non-OK rows (Opus 1–17 plus Codex F13/F15/F16/F17), not
atomic-fact counts. Opus 16 is a distinct citation defect accompanying 8.

## Independently checked evidence

- **C / R, rank 1:** retained [Gazette 43, 19 January 1949](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset1-cand.pdf)
  and [Gazette 49, 7 February 1949](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset1-results.pdf).
  Extracted with repository pdfjs-dist 6.5.438; rendered with its JBIG2 WASM and
  @napi-rs/canvas at scale 2. Visually read C PDF pages 2/5/7/10/13 and R pages
  2/3/4. The Gazette candidate spelling governs the roster, without replacing
  historical names with modern biographical names. All eight corrections retain
  their original candidate IDs, ranks, elected mapping and biography identities.
- **P, rank 1:** independently downloaded and extracted [Knesset sitting 12,
  10 March 1949](https://fs.knesset.gov.il/1/Plenum/1_ptm_250182.pdf).
  Roll call: “גלוסקא זכריה (התימנים) בעד”; “כהן רחל (ויצ״ו) בעד”; both Nazareth
  representatives voted for the government. Ben-Zvi and Granovsky were absent.
  Thus supporting-list seats = 46+16+5+4+2+1+1 = **75**, while votes for =
  45+16+4+4+2+1+1 = **73**; against = 19+14+7+4+1 = **45**. Confidence is
  73–45, not 75–45. Membership of a supporting list does not imply a minister.
- **O, rank 1:** retained `data/raw/k1/knesset-odata-members.json`: 120 opening
  positions start 1949-02-14. This supports first sitting, separately from the
  explicitly election-to-election aftermath interval.
- **A, rank 2, indexed-text evidence:** Lilach Rosenberg-Friedman,
  [“רשימת הנשים הדתיות בבחירות הראשונות לכנסת: כישלון או הישג?”, עיונים 32
  (2019), p. 48, note 58](https://in.bgu.ac.il/bgi/iyunim/32/Lilach-Rosenberg-Friedman.pdf).
  The indexed paragraph explicitly names “וכן האיחוד הדתי הבלתי מפלגתי” in the
  November 1948 joint-list agreement. Note 58 cites Zeev Bauer, Hebrew University
  dissertation (2017), pp. 273–306. Direct PDF access now redirects/challenges;
  this is indexed text, not a claim of fresh full-PDF inspection. The author's
  [university publication record](https://sites.biu.ac.il/lilach-rosenberg-friedman/research-outputs)
  independently identifies the article. This election-specific evidence supports
  retaining the fifth **organisation**, alongside the four parties, at medium
  confidence. It does not assign an invented elected candidate to it.
- **I, rank 2:** opened [IDI Hebrew 1949](https://www.idi.org.il/policy/parties-and-elections/elections/1949/)
  and [IDI English 1949](https://en.idi.org.il/israeli-elections-and-parties/elections/1949/).
  English explicitly identifies Nazareth as “an Arab minority party affiliated
  with Mapai.” Its four-party religious-bloc summary does not rule out a non-party
  component. Its five-list coalition summary omits the two additional confidence
  supporters in P; the primary roll call wins under the app's existing joined-or-
  supported definition. The gazette wins the two small-list vote discrepancies:
  3,214 / 239, versus IDI 3,205 / 241. Gazette votes sum to 434,684; IDI's sum is
  seven lower. Disagreement recorded in k1 metadata; votes unchanged.
- **J, rank 3:** independently fetched the [23 February JTA follow-up](https://www.jta.org/archive/weizmann-sees-party-lesders-on-new-govt-mapam-outlines-conditions-for-participation)
  using the required project User-Agent. It reports that talks began “today”; the
  21 February item had scheduled them for “tomorrow.” The linked original bulletin
  `https://pdfs.jta.org/1949/1949-02-23_044.pdf` reset the connection. Opus's
  asserted previous-day dateline therefore remains unproved. Record **1949-02**,
  preserving meetings and unknown recommendations, without inventing a held day.

## Every non-OK finding → disposition

| Opus / Codex | Decision and evidence | Input / downstream files |
|---|---|---|
| 1 / F01 | Fixed Herut #4 to `בן-אליעזר (זברובסקי) אריה`; C p.319 / R p.401 print “בן־אליעזר (זברובסקי), אריה”. | `rosters.reviewed.json`, manifest, generated k1 |
| 2 | Fixed Herut #10 to `ווינשל ד״ר אברהם`; C p.319 prints “ווינשל ד״ר, אברהם”. R's “לאחר שווינשל” includes the conjunction ש; it is not part of the surname. Generated exclusion note follows the corrected input. | same |
| 3 / F02 | Fixed Herut #16 to `דאהן מ׳ משה`; C p.319 “דאהן, מ. משה”; R p.401 “ודאהן”. Exclusion note corrected too. | same |
| 4 | Fixed Sephardim #1 to `שטרית בכור שלום`; C p.324 / R p.402 “שטרית, בכור שלום”. | same |
| 5 / F04 | Fixed General Zionists #6 to `קפטן גיל (ליפשיץ) יעקב`; C p.327 / R p.402 “קפטן גיל (ליפשיץ), יעקב”. | same |
| 6 | Restored Ben-Gurion's hyphen: `בן-גוריון דוד`; C p.316 / R p.400 “בן־גוריון, דוד”. | same |
| 7 | Moved Landau's alternative given name: `לנדאו חיים (הנריך)`; C p.319 / R p.401 “לנדאו, חיים (הנריך)”. | same |
| 8 | Fixed supporting-list grouping: WIZO and Yemenites join the coalition/support side; 75 list seats and 45 opposition seats. P settles Codex O43's incorrect acceptance of 73/47 as a complete joined-or-supported grouping. Confidence remains 73–45. | `meta/k1.json`, `aftermath/k1.json`, generated k1 |
| 9 | Recorded certification 1949-02-07 from R p.402 “ח׳ בשבט תש״ט (7 בפברואר 1949)”; first sitting 1949-02-14 from O. Removed obsolete missing-dates gap. | `aftermath/k1.json` |
| 10 / F12 | Removed copied government-14 gap and redundant termination gap. This election contains governments 1–2. Other real limitations remain. | `aftermath/k1.json` |
| 11 / F05–F10 | Deferred, per explicit coordinator scope: six stored Commons URLs lack `File:`. Inspected the six metadata strings; fix belongs to the coordinator's cross-election namespace repair. No logo URL changed here. | unchanged `logos/k1.json` |
| 12 / F11 | Deferred, per explicit coordinator scope: stored k1 registry hash differs from current generated bytes. Do not mass-refresh `parties.json`; coordinator owns that refresh. Only k1 lineage/family dependency hashes refreshed here. | unchanged `parties.json`; k1 hashes in lineage and nine family files |
| 13 / F03 | Restored al-Zoubi's trailing surname: `אלזועבי סיף-אלדין-מחמד סעיד אלזועבי`; C p.321 / R p.401 print it twice. | rosters, manifest, generated k1 |
| 14 | Already fixed upstream: shared `applyBios` normalizes whitespace. Regenerated `1-מ#10.nameEn` is `Berl Repetur`; retained raw official text has three spaces. No shared code or raw evidence changed. | generated k1 already clean |
| 15 / F14 | Narrowed consultation date to month, citing J's actual follow-up. No day inferred from “today” without the bulletin dateline. This resolves the auditors' different suggestions without an owner decision. | `aftermath/k1.json` |
| 16 | Replaced sole Hebrew-Wikipedia support-group evidence with P; replaced Nazareth-affiliation citations with I's direct research statement. | `meta/k1.json`, `aftermath/k1.json` |
| 17 | Removed the 1965 Alignment from a 1949 scheme title. Existing Mapai-only bloc label remains. | `meta/k1.json`, generated k1 |
| — / F13 | Repaired the fifth component's citation using A's explicit election-specific paragraph, replacing the irrelevant four-party member-list quote. Keep medium confidence and document indexed-only access. Four-party elected split remains 7/4/3/2. | `meta/k1.json` |
| — / F15 | Retained verification limitation, not evidence of a false year. Existing Commons assignments are community provenance at medium confidence; the Fighters entry already explicitly discloses the inaccessible original. Herut retained scan is separately dated. One Commons revision does **not** prove absence of a later redesign. No new original-image research or verification-status promotion. | no logo data change |
| — / F16 | Retained destination-level verification limitation. Inspected the 122-entry biography mapping and labelled party-link structure. High-confidence PersonIDs and opening identities remain anchored in official data; pattern-based website routes and secondary Hebrew links are not all independently verified destinations. No incorrect target established, so no guessed replacement. | no bio/link change |
| — / F17 | Retained exact-CSS verification limitation. Inspected all 17 colour records: they explicitly describe conventions, not official campaign colours. No unsupported claim of independent palette verification or invented official colour added. | no colour change |

No surviving faction-count residue: regenerated `node scripts/joint-facts.ts`
produces byte-identical metadata for k1 (and the full file). `unknownElected=0`,
all `unknownFaction=0`, four party counts 7/4/3/2 and zero for the non-party
organisation. `scripts/joint-facts.ts` is untouched.

## Owner questions

None. The remaining items are declared verification limits or coordinator-owned
repairs, not equally ranked competing historical values requiring owner choice.

## Validation and scope

- `BUILD_JOBS=1 node scripts/build-datasets.ts`: only k1 dataset and source manifest
  output changed; 36 other outputs unchanged. Never hand-edited public data.
- Refreshed only k1 hashes in `party-lineage.json` and nine family files;
  `node scripts/validate-families.ts`: 9 presets validated.
- `python3 scripts/validate-party-logos.py`: 26 overlays, 184 source records,
  131 assets validated. Restored the unrelated tracked Python bytecode change.
- `npx tsc -p tsconfig.json --noEmit`: passed.
- `npx vitest run --maxWorkers=2`: **99 files, 943 tests passed** (including historical k01 and all five differential checks). Initial sandboxed
  run had the intended model digest difference and a process-spawn denial in the
  gallery build test. Rerun permits the local child process; no Playwright run.
- Recursive k1 field diff: 16 differing paths, including two list-array lengths;
  eight candidate names, two note names, two scheme titles, support grouping and
  build provenance only. Votes, official seats, agreements and **all** list and
  candidate IDs are equal. No ballot-letter corrections, no withdrawn lists and
  no shared builder change; coordinator's 10fa1d9 stable-ID mechanism is not needed
  for these changes.
- In-memory substitution of HEAD's k1 dataset with the current engine/model
  reproduces the previous model digest `7f24609e…` exactly. New model digest
  `6ec38569…`; four non-model digests unchanged. Added independent gazette/roll-call
  regression checks in `historical-k01.test.ts`.
- UI list/candidate labels use display names and ballot letters; this task changes
  no IDs or letter fields. No ID migrations or saved-scenario changes.

## Display changes for coordinator/browser-test integration

- `מפא"י/המערך והרשימות הערביות המסונפות אליה (רשימות לוויין)` →
  `מפא"י והרשימות הערביות המסונפות אליה (רשימות לוויין)`.
- `Mapai/Alignment and its affiliated Arab (satellite) lists` →
  `Mapai and its affiliated Arab (satellite) lists`.
- All eight old → new candidate labels are recorded verbatim in the input's
  `corrections` entries and the table above; Herut #10/#16 exclusion-note names
  change with them. `Berl Repetur` was already clean upstream.
- WIZO and Yemenites: opposition → coalition/support; derived seats 73/47 → 75/45.
- Aftermath draft consultation date 1949-02-22 → 1949-02; certification and first
  sitting now present; obsolete gaps removed. No dataset stage/status changed.

Reproduction requires the retained gazettes/OData inputs, source URLs above and
locked repository dependencies (Node 24.18.0 in this run). Diagnostic PDFs, renders,
field-walk harness and test logs are disposable `.backup-scratch/k01-fix/` output;
shared installed dependencies are referenced from a local scratch symlink tree so
Vite writes its temporary config/cache only inside this worktree's scratch.
