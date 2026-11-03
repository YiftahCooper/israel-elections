# Party, bloc and colour metadata (`data/meta/kNN.json`)

Research inputs for three planned features: joint lists split into constituent parties, bloc
schemes per election, and party colours per election. These files are evidence records. The app
does not read them yet, and the datasets in `public/data/` are unchanged.

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
