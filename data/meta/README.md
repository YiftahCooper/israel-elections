# Election metadata (`data/meta/kNN.json`)

Research metadata for three planned features: joint lists split into constituent parties,
blocs per election, and party colours. These files are inputs for the app, not part of the
immutable election datasets in `public/data/`. Ranks always refer to the `rank` of a candidate
in the same election's `public/data/kNN.json` roster.

## 1981–2006 (k10–k17)

Written by the 1981–2006 research pass. The search log, conflicts and gaps are in
[`docs/research/meta-1981-2006.md`](../../docs/research/meta-1981-2006.md).

### Shape

The base shape from the brief (`electionId`, `lists[]`, `blocSchemes[]`, `colours[]`) is used
with these **extensions**, all optional for consumers:

| Field | Where | Meaning |
|---|---|---|
| `generatedNote` | top level | Pointer to this README. |
| `datasetRosterConflicts[]` | top level | `{letters, rank, datasetName, note}`: elected ranks whose dataset name does not match the MK who actually took the seat. **These are data errors to review in `public/data/`;** the rank is still assigned to the correct party. |
| `seats`, `rosterRanks`, `candidatesTruncated` | `lists[]` | Copied from the dataset for convenience (official seats, number of roster ranks, truncation flag). |
| `notes`, `sources`, `conflicts` | `lists[]` | List-level explanation, sources for the alliance as a whole, and source disagreements. |
| `rankNotes[]` | `lists[].parties[]` | `{rank, datasetName, note}` for every rank assigned by explicit identification rather than an exact name match (spelling variants, misread names). |
| `notes` | `lists[].parties[]` | Party-level caveats. A party may have `candidateRanks: []` when it was a named constituent but none of its candidates is within the transcribed roster. |
| `seats`, `members[].note` | `blocSchemes[].blocs[]` | Seat total of the bloc (from official seats) and per-member caveats. |
| `{ "party": "<id>" }` member | `blocSchemes[].blocs[].members[]` | A constituent party placed differently from its list (e.g. Mapam opposed the 1984 unity government that its Alignment list joined). A party entry overrides its list for that party's ranks. |
| `notes` | `blocSchemes[]` | Method and date caveats. |
| `colourId`, `alternatives[]` | `colours[]` | Stable colour key reused across elections; alternative values if any. |

### Conventions

* **Source kinds.** `official` = Knesset OData (`KNS_PersonToPosition`, `KNS_Faction`) or the
  CEC-approved list name as transcribed in the dataset. `secondary` = Hebrew Wikipedia (quoted
  verbatim, links stripped). **English Wikipedia is not used anywhere** (owner rule, 2026-11-04).
* **Confidence (affiliations).** `high` = at least two sources agree (e.g. a Hebrew Wikipedia
  party table plus the official OData faction record after the joint faction split, or two
  independent Hebrew Wikipedia articles). `medium` = one secondary source, or sources that only
  indirectly state the affiliation (e.g. a biography's party membership). OData faction records
  are post-election evidence: they corroborate, but members sometimes moved (Mahameed 1996,
  Kleiner 1996, Peled 1996), so a later faction is never used alone.
* **Unassigned ranks.** Any roster rank without a source stating its party stays in
  `unassignedRanks` (including all non-elected ranks of full rosters, e.g. UTJ 2006 ranks 9–120).
* **Blocs.** `first-government` = lists in the coalition of the first government sworn in after
  the election, and all other seat-winning lists as opposition. Bloc colours are neutral display
  suggestions, not party colours.
* **Colours** are the colours **conventionally used in Hebrew Wikipedia** Knesset and party
  articles — not official party colours, which were not found for this era. Confidence is at most
  `medium`; colours used only once or shared with an unrelated party are `low`. Where Hebrew
  Wikipedia changed a party's colour between eras (Shinui) two `colourId`s are used; otherwise
  a party keeps one colour across elections. Constituent parties with no Hebrew/official colour
  source (Meimad, Tkuma, Ta'al, Maki/Rakah, Black Panthers, Poalei Agudat Yisrael, Independent
  Liberals, Herut – The National Movement, Democratic Choice, Shahar, Ahi, Matzad) have **no**
  colour entry.

### Party ids used (1981–2006)

`herut`, `liberal-party`, `laam`, `labor`, `mapam`, `independent-liberals`,
`israeli-communist-party`, `black-panthers`, `tehiya`, `tzomet`, `matzad`,
`poalei-agudat-yisrael`, `agudat-yisrael`, `degel-hatorah`, `moria`, `shinui`, `ratz`, `likud`,
`gesher`, `hadash`, `balad`, `arab-democratic-party`, `ram`, `taal`, `meimad`, `moledet`, `tkuma`,
`herut-national-movement` (Benny Begin's 1998 party, distinct from historic `herut`),
`yisrael-beiteinu`, `nrp`, `ahi`, `meretz`, `democratic-choice`, `shahar`.
