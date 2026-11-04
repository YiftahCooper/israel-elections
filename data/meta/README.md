# Party, bloc and colour metadata (`data/meta/kNN.json`)

Research inputs for three planned features: joint lists split into constituent parties, bloc
schemes per election, and party colours per election. These files are evidence records, not part of the immutable election datasets in `public/data/`.
Ranks always refer to the `rank` of a candidate in the same election's `public/data/kNN.json` roster.

Shared base format (one file per election):

```jsonc
{ "electionId": "k5",
  "lists": [ { "letters": "<ballot letters as in public/data/k5.json>", "nameHe": "<as in dataset>",
               "parties": [ { "id": "mapai", "nameHe": "…", "nameEn": "…", "candidateRanks": [1, 2],
                              "sources": [ { "url": "…", "publisher": "…", "kind": "official|secondary",
                                             "quote": "…", "accessed": "YYYY-MM-DD" } ],
                              "confidence": "high|medium|low" } ],
               "unassignedRanks": [] } ],
  "blocSchemes": [ { "id": "first-government", "nameHe": "…", "nameEn": "…",
                     "kind": "government|pre-election|parliamentary", "date": "YYYY-MM-DD",
                     "blocs": [ { "id": "…", "nameHe": "…", "nameEn": "…", "color": "#hex",
                                  "members": [ { "letters": "…" } ] } ], "sources": [] } ],
  "colours": [ { "letters": "…", "color": "#rrggbb", "basis": "…", "sources": [], "confidence": "…" } ] }
```

## 1949–1977 (k1–k9)

Written by the 1949–1977 research pass on 4 November 2026. The search log, source conflicts and
gaps are in [docs/research/meta-1949-1977.md](../../docs/research/meta-1949-1977.md).

**No English-language Wikipedia source is used** (owner rule). Hebrew Wikipedia is used only as a
labelled `secondary` source and is checked against official Knesset records where possible.

### Extensions to the base format

| Field | Where | Meaning |
|---|---|---|
| `era`, `generated`, `electionDate` | top level | Provenance of the file. |
| `notes` | top level, list, scheme | Plain-language qualifications, for example why a list is *not* split. |
| `datasetAvailable: false` | top level (k8 only) | k8 has no released dataset, so its lists have no rank-based assignments. |
| `members[]` | party | One entry per assigned rank: `rank`, `nameHe` (as in the dataset), `knessetPersonId` (Knesset OData `PersonID`), `knessetBioMentionsParty`, `evidence[]` (same shape as `sources`), `confidence`, optional `note`. Per-member confidence can be lower than the party's. |
| `membersByName[]` | party (k8 only) | `nameHe` and `knessetPersonId` of members of the opening Knesset (21 January 1974), because there are no dataset ranks yet. |
| `note` | party, member, colour | Short qualification. |
| `quoteNote` | source | Marks a *condensed* quotation of a source's member list: `/` separates the source's party headings, `…` marks omitted names, `[ ]` marks editorial text. Other quotes are verbatim, apart from removed wiki markup. |
| `governmentNumber` | government scheme | Number of the government (1, 3, 7, 9, 10, 13, 15, 16, 18). |
| `seats` | bloc | Seats of the member lists at the election (coalition + opposition = 120). |
| `mainOpposition[]` | opposition bloc | The largest opposition list(s); a tie gives several. |
| `affiliatedLists[]` | satellite bloc | Arab lists affiliated with Mapai/the Alignment (the anchor list is also in `members`). |
| `colorKey` | colour | Stable key for the party or list family the colour represents (`mapai`, `herut`, `satellite`, …). |

### Conventions

- **Only alliances are split.** Lists of one party, including mergers (the NRP from 1956, the 1961
  Liberal Party, the 1968 Israeli Labor Party, La'am, Dash), have no `parties` entry.
  Constituents without an elected member are listed with `candidateRanks: []`.
- **Ranks cover the elected members only**, because the k1–k9 rosters in `public/data/` stop at the
  last elected rank. Every elected rank is either assigned or in `unassignedRanks`.
- **Party ids are stable across elections**: `mapai`, `ahdut-haavoda`, `israeli-labor-party`, `mapam`,
  `herut`, `liberal-party`, `laam`, `state-list`, `free-centre`, `greater-israel-movement`, `mizrachi`,
  `hapoel-hamizrachi`, `agudat-yisrael`, `poalei-agudat-yisrael`, `rakah`, `black-panthers`, `maki`,
  `moked`, `blue-red-movement`, `independent-socialists`, `meri`, `wizo`,
  `womens-equal-rights-association`, `non-party-religious-union`, `ahdut-seidel-1977`.
- **Evidence kinds.** `official`: Knesset OData (`KNS_PersonToPosition`, faction membership and
  ministers) and the Knesset website's member biographies (`GetMkPublicActivity`). `secondary`:
  Hebrew Wikipedia, and the Israel Democracy Institute's scans of the official candidates gazette.
  The gazette text in those scans is official, but the handwritten party marks on them are by an
  unknown annotator, so they count as secondary.
- **A biography quote proves membership, not rank.** Where two candidates share a name (k9 Likud
  ranks 21 and 24), the member's confidence is `medium` even when the biography is clear.
- **Bloc schemes.** `first-government` gives the coalition at the government's formation and the
  opposition. Ministers' factions come from OData; lists that supported the government without
  ministers rest on Hebrew Wikipedia. `labour-affiliated-arab-lists` groups Mapai/the Alignment with
  its affiliated Arab ("satellite") lists. Bloc colours (`#3A6EA5` coalition, `#8C8C8C` opposition,
  `#AD0101` labour group) are editorial suggestions, not sourced.
- **Colours.** No official, ballot or campaign colour source was found for 1949–1977. Every colour is
  the convention used in Hebrew Wikipedia's results tables or member legends, so confidence is at
  most `medium`: `medium` means the colour is used consistently for that party; `low` means it is
  shared, changes between articles or appears only once. Several colours repeat, for example the
  Liberal Party, Progressives and Independent Liberals (`#FECA0A`) and Rakah and Sheli (`#AB0E1A`);
  the app will need its own distinct display colours.

## 1981–2006 (k10–k17)

Written by the 1981–2006 research pass. The search log, conflicts and gaps are in
[`docs/research/meta-1981-2006.md`](../../docs/research/meta-1981-2006.md).

### Shape

The base shape from the brief (`electionId`, `lists[]`, `blocSchemes[]`, `colours[]`) is used
with these **extensions**, all optional for consumers:

| Field | Where | Meaning |
|---|---|---|
| `generatedNote` | top level | Pointer to this README. |
| `datasetRosterConflicts[]` | top level | `{letters, rank, datasetName, note}`: elected ranks whose dataset name does not match the MK who actually took the seat. **These are data errors to review in `public/data/`;** the rank is still assigned to the correct party. Empty once resolved. |
| `resolvedRosterConflicts[]` | top level | `{letters, rank, previousDatasetName, datasetName, resolution, evidence, resolvedOn, record}`: conflicts resolved by re-reading the official scans (4 November 2026, [decision 0088](../../docs/decisions/0088-roster-corrections-and-odata-audit.md)). `datasetName` is the current roster reading. |
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

## 2009–2026 (k18–k26)

Research log, conflicts and gaps: [docs/research/meta-2009-2026.md](../../docs/research/meta-2009-2026.md).

### Base shape

```json
{ "electionId": "k25",
  "lists": [ { "letters": "…", "nameHe": "…", "parties": [ { "id": "new-hope", "nameHe": "…", "nameEn": "…",
      "candidateRanks": [2, 5], "sources": [ { "url": "…", "publisher": "…", "kind": "official|secondary", "quote": "…", "accessed": "2026-11-04" } ],
      "confidence": "high|medium|low" } ], "unassignedRanks": [ … ] } ],
  "blocSchemes": [ { "id": "…", "nameHe": "…", "nameEn": "…", "kind": "government|pre-election|parliamentary", "date": "YYYY-MM-DD",
      "blocs": [ { "id": "…", "nameHe": "…", "nameEn": "…", "color": "#hex", "members": [ { "letters": "…" } ] } ], "sources": [ … ] } ],
  "colours": [ { "letters": "…" | "party": "<id>", "color": "#RRGGBB", "basis": "…", "sources": [ … ], "confidence": "…" } ] }
```

`letters`, `nameHe` and candidate ranks refer exactly to `public/data/kNN.json`. Only lists that were alliances of separate
parties appear in `lists`. A rank goes to `unassignedRanks` unless a source attributes it.

### Extensions used in k18–k26

| Where | Field | Meaning |
|---|---|---|
| file | `governmentNote` | Why no `first-government` scheme exists (k21, k22: no government formed; k26: formation still under way on 2026-11-04). |
| list | `seats` | Seats won by the list. For k26 this is the reported CEC final count (the dataset has no gazetted seat table yet). |
| list | `sources` | Sources showing that the list was an alliance (normally the CEC gazette's sponsoring parties or official list name). |
| list | `coverage` | `roster`, `assigned`, `elected` (ranks 1..seats) and `electedAssigned` counts. `rosterTruncated` is copied from the dataset. |
| party | `note` | Caveats for this attribution. |
| party | `evidenceGroups` | When one party's ranks rest on different evidence (for example, an official faction split for some ranks and a secondary source for others), each group keeps its own `candidateRanks`, `sources`, `confidence` and `note`. The party's top-level `confidence` is the lowest of its groups. |
| party | `candidateRanks: []` | A sponsoring party that is named officially but has no candidate attributed by any source used. |
| bloc scheme | `governmentNumber`, `notes` | Government number and caveats. |
| bloc | `seats` | Seats of the bloc, computed from list seats and member ranks. Totals were checked against each source's stated totals where it gives one. |
| bloc member | `{ "letters", "parties": [ids] }` | Only the elected candidates of those constituent parties (as attributed in `lists`). |
| bloc member | `{ "letters", "ranks": [ … ], "note" }` | Only those elected ranks (lists that split between coalition and opposition). |
| bloc member | `joined` | Date a list joined after the scheme's date (UTJ, 1 April 2009). |

Bloc scheme ids: `first-government` (coalition and opposition when the first government after the election was sworn in),
`pm-recommendations` (recommendations to the President), `pre-election-blocs`, `knesset-blocs-2021` and `outgoing-government` (k26).
Bloc display colours are neutral defaults chosen for this research. They are not sourced.

### Source rules applied

- **Official:** CEC/Reshumot candidate gazettes (sponsoring parties and, from 2019, each candidate's party) and Knesset
  OData (`KNS_PersonToPosition`, `KNS_Faction`). Faction splits after an election are used as official evidence of an elected
  member's constituent party.
- **Secondary, labelled:** Hebrew Wikipedia (quotes checked verbatim against the fetched page text), Israeli and English-language
  news outlets (ynet, The Times of Israel, JNS, The Jerusalem Post) and bechirot.fyi for one 2026 roster.
- **Not used:** English-language Wikipedia (en.wikipedia.org), at the owner's instruction. No en.wikipedia source remains in these files.
- **Colours** come from the header colour (`צבע כותרת`) of the party or list infobox on Hebrew Wikipedia. The
  infobox's stated official colours (`צבעים רשמיים`) are quoted with their templates rendered to hex. Confidence is `medium`
  when the infobox also states official colours, otherwise `low`. These are conventional display colours, not party specifications.

### Stable party ids

`likud`, `ahi`, `yisrael-beiteinu`, `kulanu`, `atid-ehad`, `new-hope`, `derech-eretz`, `israel-resilience` (Gantz's party,
named Blue and White from 2021), `yesh-atid`, `telem`, `agudat-yisrael`, `degel-hatorah`, `homat-torat-yisrael`, `hadash`
(registered as the Israeli Communist Party), `balad`, `taal`, `raam` (United Arab List), `mada`, `national-arab-party`,
`tkuma` (registered as האיחוד הלאומי – תקומה, running as the Religious Zionist Party from 2021), `hatikva`, `eretz-yisrael-shelanu`,
`moledet`, `otzma-yehudit` (registered as חזית יהודית לאומית), `noam` (registered as לזוז), `national-responsibility`,
`jewish-home`, `new-right` (registered as צל"ש; also Yamina), `religious-national-israeli`, `labor`, `gesher`, `meretz`,
`new-movement`, `green-movement`, `meimad`, `independence` (Barak's Israel Democratic Party, 2019), `hatnua`, `yachad`,
`zehut`, `achiezer`, `kol-yisrael-ahim`, `peula-leyisrael`, `yashar`, `yesodot-yisrael`, `democrats`, `together-bennett`,
`reservists`, `new-economic`, `tzomet`, `beit-yemini`.

## Read-only election context and PM ballots

`election-context.json` is separate from Knesset datasets and scenario inputs. Each event
has an election id, stable event id, effective date, contest type, typed circumstance,
bilingual text and a source with `official`, `secondary` or `unresolved` evidence.
Optional `listId` targets context to a list panel; `relatedSources` supplies additional evidence.
An unresolved claim must be worded as unresolved, never as established history.

PM contests link to an existing Knesset id; `prime-minister-only` creates no Knesset or
seat allocation. Candidate votes and valid/invalid/cast totals each carry sources.
Withdrawn nominees have status evidence and **no vote count**. The 1999 invalid/cast totals
are secondary IDI figures, not derived from the Knesset ballot. The 1996 MFA invalid/cast
figures carry `verification: report-only`: the earlier report inspected them, but this
implementation's direct request returned 403. The retained reviewed transcription documents
that limit; it is not a captured MFA page. The 2001 official notice is retained from a
public mirror, disclosed in both manifest and UI. See `data/raw/pm/` and `SOURCES.json`.

`src/data/electionContext.ts` validates dates, source policy, evidence labels, ids,
targets and independent ballot reconciliation. `data:build` runs it and checks retained
source hashes. The UI bundles the same validated metadata; changing it does not alter
Knesset build timestamps or the differential engine corpus. All three PM candidate tables
and the IDI totals were visually checked against the retained scan pages on 4 November 2026.
