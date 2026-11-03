# Election metadata: joint-list parties, blocs and colours

`data/meta/kNN.json` holds researched metadata for one election: constituent parties of joint lists (by candidate rank),
bloc schemes, and list/party colours. These files are research inputs for app features. They are not read by the
current app or build, and they never change `public/data`.

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
