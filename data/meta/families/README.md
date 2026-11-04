# Party family research metadata

These are revisioned research drafts under §4 of
[the proposal](../../../docs/research/party-families.md), not an approved political
classification or a partition of parties. All 26 local datasets are covered;
`reviewCandidates` stay outside totals. Classification is an original, inferred
editorial assessment even when the underlying party identity is documented.

## Schema decisions for consumers

- `../parties.json` has `parties[]`, `partyAppearances[]`, `sources`, and `conflicts`.
  An appearance is exactly `{electionId,listId,partyId,role,sources,status}`, with
  optional evidence locator/continuity qualification. Roles are `singleton`,
  `constituent`, or `alliance`. The latter names the election-specific vehicle;
  do not count it as an additional constituent. Every list has an appearance.
- Canonical ids preserve existing constituent ids. Reviewed legacy aliases are
  `israeli-labor-party` → `labor`, `ram` → `raam`, and `mada` →
  `arab-democratic-party`. Resolve `parties[].aliases[].id` before comparing ids;
  historical datasets and exports retain their original strings.
- `vehicle-<listId>` is an election-scoped identity, not a claim about a continuing
  legal party. For otherwise unresolved singletons it is an `electoral-vehicle`;
  for observed multi-party lists it is an `alliance`. Never join vehicles by
  letters, names or colours. Unknown minor-list continuity remains unresolved.
- `names[]` dates attest use at a particular election, not the effective date of
  a rename. Both languages come from the existing metadata; `nameEn: null`
  records an unverified English name. `activePeriod` bounds observed appearances,
  **not** founding/dissolution. Sources apply at each dated name record.
- Preset records follow `haredi.json`: `members[]`, `reviewCandidates[]`,
  `identityEvidence`, `classificationEvidence`, `computed`. An included list has
  `treatment: include`; a mixed list has `scope: mixed` and
  `treatment: separate-segment` (the pilot encoding of §4's `mixed` outcome).
  `partyIds` are selected constituents; `datasetPartyIds` are untouched legacy ids.
  `proposedPartyIds` describes appearance mappings absent from the input list,
  not necessarily newly created ids. `constituentVotes` is always null.
- The pilot's `mixedHarediVotes: null` key is retained in other presets for shape
  compatibility; it means constituent votes are unknown, regardless of family.
  `coreOnly` uses core included lists; `includedUnmixed` adds extensions;
  `mixedWholeLists` is a separate whole-list segment. The alternative adds the two
  segments by convention. Percent numerators are votes × 100, denominators all
  valid ballots; display rounding alone uses six decimal places. A zero selected
  total does not establish absence of a tendency. Preserve the pilot's k1 null.
- Broad religious means Haredi + national religious + Islamist organisations.
  Raam retains its identity; secular Arab partners make the list mixed. The preset
  is a union of selected organisations, not of all people who are religious.
- Lineage `from` points predecessor → successor. `electoral-partner` points
  constituents → election-scoped vehicle and has an election id; its election-day
  timestamp attests ballot composition, not the alliance's founding date.
  `merged-into`, `split-from`, and `renamed-to` have organisational semantics;
  `leader-moved-to` never establishes organisational continuity. Only evidenced
  events are in `edges`; `pending[]` is not an asserted edge and must not drive
  inheritance. A 2024 announcement is not proof of a completed legal merger.

## Evidence and limits

The proposal's matrix is the retained claim-level decision record; `proposal`
source references inherit that review, not independent corroboration. IDI sources
provide historical context; they do not endorse our presets. Rows separately cite
local dataset identity and external context. The registry's conflicts and graph's
pending records disclose unresolved identity/ancestry. This delivery does **not**
complete a legal-shell audit or a dated organisational genealogy of every minor
party. No external CC0 crosswalk has been imported. No third-party classification
table, prose, or vote allocation has been copied.

Public IDI pages cited by the proposal were retrieved with
`israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)`;
matching source entries retain HTTP status and SHA-256. No 429 occurred. Raw page
bodies are disposable scratch; original assessments, citations and hashes are
retained here. Pilot sources not carrying a retrieval hash inherit its earlier
review; they were not all freshly inspected. No English Wikipedia is used.

Run `npx vitest run --maxWorkers=2` to validate references, appearances, exact
BigInt recomputations, hashes, pointers, mixed flags and lineage cycles. These
metadata files do not enter `data:build`, change votes, or require a model hash
update. To revise decisions, edit the cited records and recompute the cached
metrics from the corresponding `public/data/kN.json`; the validator independently
checks those values and never rewrites them.

The validator can also run directly: `node scripts/validate-families.ts`.
