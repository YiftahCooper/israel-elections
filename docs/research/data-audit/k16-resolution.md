# k16 audit reconciliation — 6 November 2026

Both audit branches were merged after the fast-forward check against origin/main.
The binding source hierarchy exactly matches origin/main (SHA-256
9366afa55f516c4f6855c5684bf116813706d5e667d8199449b46e7833f0865d).

Deduplicated disposition: **15 finding groups corrected, 2 rejected as current
repair requirements, 0 owner questions**. Four broad verification limitations
remain; two already disclosed vote discrepancies are retained with deciding
arithmetic, rather than counted as new repairs. Counts refer to groups, not
individual scalar facts. Neither successful builds nor these targeted rechecks
constitute a complete independent verification of the auditors' unaudited scope.

## Evidence rechecked

- **C, rank 1:** retained `data/raw/k16/candidates.pdf`, YP 5148,
  [CEC approved candidates](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset16-cand.pdf).
  Rendered pp.1195, 1196 and 1202 with pdfjs-dist 6.5.438 and read visually,
  including an enlarged רע״ש crop. Page 1195 ends Hadash–Ta'al at
  rank 119; p.1196 prints “תורתי אברהם”; p.1202 prints
  “משקוץ ארקדי”. The four approved זך candidates are also on p.1196.
- **R, rank 1:** retained `data/raw/k16/results.pdf`, YP 5155,
  [CEC results](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset16-results.pdf),
  p.1406 re-rendered and read. Withdrawal note: “התפטרו כל המועמדים”.
  Printed Mafdal/Lider values remain 132,730 / 883; valid total is 3,148,364.
- **A, rank 1:** retained `data/raw/k16/yp5151-surplus.pdf`, YP 5151,
  p.1312 read visually. Exactly six agreements in the Knesset 16 notice,
  signed 20 January and published 26 January 2003; no 2006 notice on that page.
- **G, rank 1:** [Knesset Hebrew government 30](https://main.knesset.gov.il/mk/government/pages/governments.aspx?govid=30).
  Direct request redirected to geographic denial; Hebrew search-index extract
  was independently retrieved. Table gives Sharon 27.2.2003–4.1.2006 and
  Olmert's PM rows from 14.4.2006 through 4.5.2006. Hebrew explanatory note
  distinguishes cessation of functioning on 4 January from formal tenure ending
  after 100 days on 14 April. This settles the auditors' apparent disagreement:
  active service and formal tenure are different facts. The English note has
  obvious date typos; Hebrew governs.
- **D, rank 1:** [YP 5467](https://olaw.org.il/yalkut/yalkut-5467.pdf),
  cover and p.728 independently read. Retained as `data/raw/k16/yp5467-dissolution.pdf`,
  SHA-256 f55311ec3f3a36b02b16a2774a7668fb9bcae176edb7bde535e0f518dbee0047.
  Order date is 27 November 2005; publication 8 December 2005. This official
  document is hosted by a disclosed mirror. The record identifies publication,
  without asserting immediate termination of the Knesset's tenure. IPU's
  24 November date loses to the original instrument.
- **K, rank 1:** [Knesset Hebrew unity-government lexicon](https://main.knesset.gov.il/About/Lexicon/pages/unitygovt.aspx),
  independently retrieved search-index extract names Likud, Shinui, NRP and
  National Union in the initial government. Ministerial table G independently
  confirms entry dates. This replaces sole Hebrew-Wikipedia coalition evidence.
- **J, rank 2 under the updated hierarchy:** [IDI joint-list table](https://www.idi.org.il/articles/32955),
  independently opened Hebrew page: the 2003 Meretz row distinguishes Mapam,
  Ratz and Democratic Choice. Official campaign title R names Meretz,
  Democratic Choice and Shahar. These support differently scoped descriptions;
  campaign grouping is now explicitly distinguished from legal submitting parties.

## Every non-OK finding and sourcing flag

O denotes the Opus numbered finding; F denotes the Codex finding.

| Group | Finding | Decision, evidence and changed files |
|---|---|---|
| 1 | F01 / O6 | Correct first-government date 28 → 27 February 2003, G; retain secondary-date disagreement in notes. `data/meta/k16.json`, aftermath conflict resolution, generated k16. |
| 2 | F02 / O1 / O8 | Sharon active interval ends 4 January; Olmert acting 4 January–14 April, then interim PM to 4 May. Explicit note preserves Sharon's formal 14 April tenure end. Added two dated formal succession steps under `government.changes`, the overlay's established mechanism for acts outside its closed formation-event vocabulary. Remove stale missing-evidence gap. G; aftermath input only. |
| 3 | F03 / O2 | Publication of dissolution order, 8 December; order dated 27 November. D overrides IPU. Aftermath input, retained PDF and manifests. |
| 4 | O3, Codex coverage observation | Add withdrawn Moreshet Avot rather than infer non-participation solely from zero votes. C establishes four approved candidates; R establishes all withdrew. Keep candidates, zero votes and `withdrawn:true`; no active contestant added. Election-keyed `k16-withdrawn.json` plus k16 wrapper; party-links and electoral-vehicle registry entry, generated national/locality data. No cross-election party continuity inferred. |
| 5 | F04 | `תותחי אברהם` → `תורתי אברהם`, C p.1196. Reviewed candidate input and correction ledger, generated k16. |
| 6 | O4 | `משקוף ארקדי` → `משקוץ ארקדי`, C p.1202. Same files. |
| 7 | F16 | Hadash–Ta'al published extent 118 → 119, C p.1195. Keep only the verified three-name published prefix and add unresolved rank 119. Reviewed input and historical regression expectation. |
| 8 | F06 | Fix Ahavat Israel Commons URL to `File:AhavatIsrael.png` in overlay AND its matching source catalogue. Namespace repair only; no claim to freshly authenticate the NLI object or image use. Generated logo URL follows the input. |
| 9 | F07 | Remove obsolete unreleased-dataset/committee-schema blockers. The released roster/locality inputs establish current coverage. Preserve genuine later-roster and formal-erratum gaps. National reviewed input and source manifest description. |
| 10 | F08 / colour sourcing flag | Inspecting the retained quotes confirms they name Ometz and Shinui, not Moledet and Degel. Remove those unsupported citations; retain exact hex values as arbitrary display conventions, low confidence. k16 metadata only; no invented replacement colour evidence. |
| 11 | F09 | Keep official campaign grouping, explicitly qualify Meretz as the Ratz/Mapam campaign umbrella rather than assert one legal submitting entity. J + R; k16 metadata notes/source. No invented constituent ranks or legal split. |
| 12 | O7 | Drop “four for 2006” from k16 surplus source description, A. k17's separate description untouched. Raw/generated source catalogues. |
| 13 | Coalition sourcing flag | K + G replace sole Hebrew-Wikipedia coalition/date basis; update NRP note without altering 68-seat election-list envelope or 66–48 confidence tally. k16 metadata and aftermath. |
| 14 | Mirror sourcing flag | JVL-hosted Knesset-credited history is now labelled secondary/mirror instead of official hosting. Quotes remain attributed. Aftermath source record. |
| 15 | O9 | Retained locality envelope row independently gives cast 158,296, invalid 2,363, valid 155,933. UI formerly said “votes”; clarify the k16 label as voters including invalid ballots. Numeric value unchanged. `Panels.tsx` only, conditional on k16. |
| Rejected 1 | F05 | Stale on required origin/main baseline. Regenerated joint facts reproduce Labor 18, Tkuma 2, Meretz 5, Degel 2, all unknown=0; retained official opening factions support totals 19/7/6/5. No residue in k16 inputs. Neither `scripts/joint-facts.ts` nor its generated JSON changes. |
| Rejected 2 | O5 | Double space in the retained official English name is presentational whitespace, not an incorrect identity. The input's siteId 731 literally retains “Moshe  Kahlon”; preserve its exact official rendering. A shared-source edit would also change five other elections. No k16-only invented spelling override introduced. This rejects a required factual repair, not the observation that whitespace could be normalised in a separately scoped presentation change. |
| Retained discrepancy | F10 | Keep 132,370 and printed 132,730, transparently labelled. R's printed lines exceed its own valid total; retained locality sums produce 132,370. The independent Knesset history and CEC worked-example evidence recorded in the audits corroborate it, but this fixer's live CEC request returned 403. Existing source-comparison event and caveat stay. |
| Retained discrepancy | F11 | Keep 833 and printed 883 under the same reconciliation. Combined discrepancy is 410. No formal erratum claimed. Neither value silently overwritten. |

## Remaining verification limits

These are not owner disputes, rejected audit limitations or passing checks.

- **F12, biography/link destinations:** inspected 135-entry bio inventory
  (124 high, 11 medium), official-ID linkage method and existing verification
  markers. Identity evidence is distinct from live destination contents; official
  site access remains denied. No complete fresh opening of all 135 destinations,
  archived campaign documents or secondary articles is claimed.
- **F13 / individual-affiliation sourcing flag:** official titles establish
  alliances, not every reserve candidate's party membership. Opening faction
  totals now reconcile; they do not independently prove every constituent
  assignment. Existing medium-confidence/labelled Hebrew secondary evidence stays;
  specifically National Union reserve ranks 8–9 are not upgraded to primary proof.
- **F14, geography/demography:** independently inspected all eight group source-ID
  sets and retained localities/envelope arithmetic. CBS 2003 groups coexist with
  explicitly later IDI Haredi/CBS Druze/development-town classifications. No
  exhaustive coordinate/name/code comparison with every original publication
  performed; labels must retain their source-year caveats.
- **F15, family/history interpretations:** rechecked all nine k16 family rows.
  Most classificationEvidence is explicitly `inferred`; Haredi entries are
  `documented`. Hash refresh does not validate all ideological interpretations,
  historical prose or chronology completeness. No new partisan allocation or
  full historical clearance is claimed.

## Owner questions

None. The PM and dissolution differences are settled by the more precise official
records; the vote-source discrepancy has deciding internal arithmetic and stays
open only as a missing formal erratum. Broad research coverage limitations do not
supply competing values for owner arbitration.

## Regeneration, field comparison and validation

Node 24.18.0, locked repository dependencies, pdfjs-dist 6.5.438. Reproducible
renderings, dependency-cache links, baseline dataset copies and test logs are in
`.backup-scratch/`. Unique inputs, the dissolution PDF and this report are durable.

Run `BUILD_JOBS=2 node scripts/build-datasets.ts`; refresh k16 SHA-256 references
in the nine family files, party registry and lineage; run
`node scripts/validate-families.ts`,
`PYTHONPYCACHEPREFIX=.backup-scratch/pycache python3 scripts/validate-party-logos.py`,
`npx tsc -p tsconfig.json --noEmit`, and
`npx vitest run --maxWorkers=2 --testTimeout=120000 --hookTimeout=120000`.

Recursive baseline comparison: only k16 changes among the 26 national datasets.
Existing lists change only two candidate names and one logo URL; the scheme date,
source hashes/timestamp and added zero-vote withdrawn list/seat key account for
the remaining differences. Localities add only the matching zero column to all
1,172 rows; all existing cells and demographic fields are unchanged. Votes,
seats, threshold, agreements and elected candidate ranks are unchanged.
Replaying all five differential families with baseline datasets and current engine
reproduces every prior digest exactly. Only allocation and model digests change
with the corrected data; analysis, validation and rules remain unchanged.

No Playwright, push or main integration. Final check counts are recorded below.

Final verification: dataset build passed; 9 family presets/registry/lineage passed;
26 logo overlays, 184 source records and 134 retained assets passed; TypeScript
passed; **95 Vitest files / 903 tests passed**, including historical-k16 (11)
and all five differential families. `git diff --check` passed. The earlier run
encountered the gallery subprocess sandbox denial and a 5-second rebuild timeout;
the final two-worker run permits that local subprocess and uses 120-second
limits without changing repository test policy. Baseline comparison explicitly
asserts all 25 other national files are byte-identical and all existing locality
cells/metadata remain equal after removing only the new zero column.

On-screen changes for browser-test coordination:

- First-government date: `2003-02-28` → `2003-02-27`.
- Candidate `תותחי אברהם` → `תורתי אברהם`.
- Candidate `משקוף ארקדי` → `משקוץ ארקדי`.
- k16 `Double-envelope votes` → `Double-envelope voters (including invalid ballots)`;
  `מעטפות חיצוניות` → `מצביעים במעטפות חיצוניות (כולל פסולים)`.
- Previously absent list → `מורשת אבות` / `Moreshet Avot`, with existing
  `withdrew` / `פרשה` status rendering, its four approved names, withdrawal note
  and official-notice link. Existing lists' statuses and the election's
  `official-final` status are unchanged.
- Ahavat Israel logo source hyperlink gains `File:`; visible logo unchanged.
- Aftermath chronology changes are research-overlay facts, not currently wired
  into the app. Arbitrary colour-basis and Meretz-legal-scope notes change inputs,
  without new scheme titles, colours or ideological allocations in the dataset.
