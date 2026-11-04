# People-based demographic groups (parked)

**Idea (owner, 4 Nov 2026):** let a user change turnout for a group of voters — Arab citizens, Haredim,
Religious Zionists, traditional or secular Jews, immigrants from the former Soviet Union, Druze, Bedouin,
Ethiopian Israelis, young voters — and how that group splits between the lists, with extra or fewer votes
following the group's own party mix.

**Verdict of the evidence review:** defer. For every group and election, at least one of the three numbers the
model needs (the group's share of eligible voters, its turnout, its split between lists) is missing or not
compatible with the others. Closest: Arab citizens (locality results are broad, but published analyses use
different locality universes and the national total is unresolved) and the 2021/2022 splits of Haredi,
Religious-Zionist, traditional and secular voters from Israel Democracy Institute surveys (splits only, no
compatible size or turnout; usable at most as speculative estimates).

**What exists (on the branch, intact, all tests passing when parked):**
- 110 graded records (10 groups × elections 2003–2026), each number marked solid / estimate / insufficient
  with its source and reason; insufficient numbers are absent, never guessed:
  `data/raw/demographics/groups-k16 … k26.reviewed.json`, with the retained sources (IDI studies, the INES
  catalogue) and their hashes.
- An exact model, `src/model/demographicGroups.ts`: signed vote deltas for turnout and split edits, mapped onto
  merged/split lists, clamped, gated by evidence grade (`{ speculative }` unlocks estimate-grade numbers only),
  returning the existing logged `addVoters` action. Tests: `tests/demographic-groups.test.ts`.
- The full report with sources, methods and gaps: `docs/research/demographic-groups.md`, and decision record
  `docs/decisions/0092-demographic-groups.md` (on the branch).
- Considered and deferred: extending groups into mixed cities with ballot-box results (classified by address,
  never by vote); documented in the report.

**The most promising next step:** the Israel National Election Studies publish downloadable survey data; a
weighted reanalysis could give graded size/turnout/split estimates for several groups.

**Already in the app (separate, place-based):** the Turnout tool's locality groups (Arab localities,
kibbutzim, Judea and Samaria, Haredi authorities…) describe places, not people, and stay as they are.

**To restore:** `git merge speculative/demographic-groups` (purely additive: new data, model, tests, docs and
a build step that writes `public/data/kNN-groups.json`). It adds no interface; a speculative setting and the
group editor would be built on top.
