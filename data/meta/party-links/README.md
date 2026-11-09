# Election-specific party reading

`kNN.json` contains `electionId`, `reviewedAt`, `lists` keyed by full list id (e.g. `25-פה`),
`parties` keyed by constituent party id, and `gaps` keyed by either id. Every identity is
accounted for, including withdrawn lists. Values are arrays of `PartyLink` (see
`src/data/schema.ts`); empty arrays mean no verified link acquired. Each missing kind has
an explicit reason under `gaps[id][kind]`. A source absent here is not proven nonexistent.

`archivedAt` is the capture/issue date, never the retrieval date. Live 2026 retrieval dates
are retained in `data/raw/party-links` and in link titles. `publisher` labels IDI-hosted
party platforms as party material, distinct from neutral IDI profiles. Hebrew Wikipedia
is secondary. CEC results are whole-election records naming the list, not individual
party histories. Constituents do not inherit their joint list's links.

Rebuild offline: `python3 -I scripts/research/build-party-links.py`, then
`npm run data:build`. These files are generated: `--check` (run by the test suite) fails if a
file differs from a rebuild, so corrections go into `data/raw/party-links/*.reviewed.json`
(`overlay-corrections.reviewed.json`, `platform-reassignments.reviewed.json`), never here.
See `docs/research/party-links.md` for scope and gaps.
