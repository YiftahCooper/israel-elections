# Term-event promotion handoff: k18–k25

Checked 5 November 2026 on branch `t3/2494c5ea`, starting at
`b74bb07387b2542434dddc0892e8a868a45950fc`. Research follows PROMOTE.md and COMMON.md.
These remain **pilot records**, not production-ready histories. No push or integration
merge was performed. The initial `git merge --ff-only origin/main` reported already up to date.

The claim/source ledgers are the nine edited `data/meta/aftermath/kN.json` files:
`sources` identifies publisher, kind, URL and access date; each event’s `cites` maps
its bilingual claim to inspected excerpts. `term.chronologies` names the selection
sources. Existing formation, recommendation, coalition, result and polling research
was preserved; k26 has only a retrieval-status update.

## Results in the requested order

| Record | Included before → after / pending after | Added events and qualifying selection evidence | Notable remaining gaps | Local commit |
| --- | --- | --- | --- | --- |
| k25 | 1 → 3 / 7 | 4 Jan 2023 judicial proposals: IDI October 2024 retrospective + Reuters judicial timeline. 24 July reasonableness amendment: IDI retrospective + Jerusalem Post’s chronological 2023 review. | Hostage exchange has Reuters/JPost retrospective selection but no retrieved official/academic counterpart; Supreme Court ruling has IDI but no second qualifying chronology. Later 2024–26 developments remain incomplete. | `de7d7d7b7352b5539e7f4292e7607aa20e2acb3b` |
| k24 | 3 → 4 / 7 | 6 Apr 2022 loss of majority after Silman’s departure: EJPR Political Data Yearbook 2022 + IPF election timeline; IDI 2022 election retrospective also selects the spring majority loss. Existing budget row gains IDI/IPF chronology support. | Meron and Guardian of the Walls precede this record’s government-term start; the latter is recorded in k23. Negev Summit, attacks, Biden visit and Breaking Dawn lack an inspected qualifying pair. | `bc37a97fedbc05a0a9691ccc6c9dee817c5df3fd` |
| k23 | 0 → 3 / 4 | 15 Sep 2020 Abraham Accords signing: SIPRI 2020 + CFR timeline. 23 Dec automatic dissolution: IDI 2021 retrospective + IPF timeline, with Commons Library resolving the deadline-night date. 10–21 May 2021 fighting: CFR + Reuters confrontation chronology. | March COVID emergency precedes government start. Budget extension, September lockdown and vaccination-launch chronology pairs remain incomplete. | `8f6d93e7d539674b0aa15a85b700ee571e275c96` |
| k22 | 0 → 2 / 1 | 21 Nov 2019 decision to indict Netanyahu: Brookings political chronology + CNN Editorial Research timeline. 28 Jan 2020 US peace proposal: SIPRI 2020 + CFR. | November Gaza fighting appears in SIPRI 2019; a second qualifying chronology was not inspected. Indictment decision is distinguished from later court filing and is not a guilt finding. | `b6de42c7985cd0bf57a4dce2b1df378144bf455c` |
| k21 | 0 → 0 / 1 | SIPRI 2019 registered as the inspected chronology for the 4–5 May escalation; no event promoted. | No second qualifying chronology for May fighting; the attempted AP timeline locator returned a cache miss. | `d268f681ee5606ba1d5bebe5eb30b4563930ca0f` |
| k20 | 0 → 1 / 4 | 14 May 2018 embassy opening: CRS’s selected US-actions chronology + CFR; the archived White House opening-day record supplies day precision. | Coalition accession, Resolution 2334, Nation-State Basic Law and the combined fighting/resignation candidate lack an inspected qualifying pair. | `312c4947413f5e570c0b9926da6da4f94605dad8` |
| k19 | 0 → 2 / 5 | 8 July 2014 Protective Edge launch: SIPRI 2014 + Reuters confrontation chronology. 2 Dec dismissal of Lapid/Livni: IDI 2015 + IPU 2015 retrospectives; Ofer Kenig’s IDI historical overview supplies day precision. | CFR selects July 2013 talks but no second chronology was added. Bundled conscription/threshold legislation needs narrower scope and original date evidence. | `9b0f258d9e807d3573bdbdabb7d645dc48eed383` |
| k18 | 0 → 2 / 7 | 18 Oct 2011 Shalit exchange: SIPRI 2011 + Reuters confrontation chronology. 14–21 Nov 2012 Pillar of Defense: SIPRI 2012 + Reuters. | Bar-Ilan, flotilla, Carmel fire, protests and faction/coalition changes lack an inspected qualifying pair. | `3c5d5d622e819ecec9670d00458ebfbbf382699b` |
| k26 | 0 → 0 / 0 | Retrieval recheck only, as of **20:51 Israel time**. | No formal Likud recommendation or presidential mandate decision confirmed from the retrieved official homepage/archive and targeted searches. | `9c805626a54c63cb397a54fa3951e7372e9433c0` |

Total: **13 additional term events**. All surviving candidates have more precise
reasons for remaining pending; “not retrieved” never means the event did not occur.
This was a bounded chronology search, not exhaustive historical coverage. Other events
selected in only one inspected chronology (for example the July 2013 negotiations)
were considered and left pending. No casualty totals, motives, political judgments or
polling-based causal claims were imported.

## Evidence quality, independence and conflicts

- SIPRI annual chronology chapters are academic research references. IDI’s per-election
  narratives and October 2024 review are retrospective selection accounts; the latter
  is a thematic annual review, not a daily timeline, used under PROMOTE.md’s explicit
  IDI annual-review category. Their evaluative language is not adopted by the events.
- The EJPR annual political report explicitly dates Silman’s departure. It also contains
  errors outside that claim: its June 20 dissolution wording conflates the announcement
  with enactment; some election-table year labels are wrong. Those clauses are not used.
- CFR and Brookings are research-institute educational/reference chronologies, classified
  `academic` in the ledger; they are not government records or peer-reviewed journal
  articles. IPF is labelled `secondary`. Its timeline independently selects political
  milestones; it is not counted as official/academic evidence. Silman is selected by
  EJPR and also by IDI’s broader account of majority loss.
- Reuters and its KELO/Investing/MarketScreener copies are **one publisher family**, not
  multiple independent chronologies. CNN’s KVIA copy is the CNN Editorial Research family.
  Repeated IDI publications are one institutional family. CFR’s Reuters photographs do
  not make its separately authored educational chronology a Reuters reprint.
- k23 dissolution is retained as **23 December**, following the existing Commons Library
  record. IPF labels the deadline-night event 22 December; both excerpts are retained,
  with the midnight distinction explained. IPU 2021 also uses 22 December; it was not
  substituted for the already sourced date.
- k24’s three original interim-rule rows were retained. Registering chronologies and adding
  support to its budget row does **not** silently convert the complete pilot to the strict
  rule; the inherited `interim-2src` and its caveat remain visible. The new departure row
  has retrospective chronology support.
- Existing government-term windows were preserved, including caretaker periods extending
  beyond an intervening election. Thus the May 2021 fighting is in k23, whose term ends
  13 June, and is not duplicated as a k24 term event. No seat or formation correction
  was made under this task.

## k26 conditional update

The official President’s Residence [homepage](https://www.president.gov.il/) and
[news archive](https://www.president.gov.il/category/news-lobby/) were opened again,
and targeted searches checked formal Likud recommendations and tasking decisions.
They did not provide confirmation beyond the earlier cutoff. Cached/incomplete retrieval
cannot establish non-occurrence. The new recheck note records that limitation.

`data/meta/k26.json` remains unchanged: Eisenkot 67, Netanyahu 19, none 7, pending 27.
The aftermath’s 27 Likud seats remain `unknown`, not `none`. No new government term,
mandate, inauguration or predicted date was introduced. The existing receipt of results
is not treated as gazettal or certification of the calculated seat weights.

## Retrieval limits

The Knesset k24 history reader exposed headings/results but no usable event chronology;
JVL k18/k19 history locators were inaccessible. IISS, IEMed and OSW returned security or
verification challenges; CIE exposed a subscription gate. These were left alone.
The JTA dismissal article returned 403; day precision was recovered from the opened IDI
historical overview instead. Search snippets were discovery leads rather than the sole
support for newly promoted claims. English Wikipedia results were neither opened nor
used. No proxy, challenge or paywall circumvention was attempted.

Web reader and Jina retrieval were used. PDF excerpts were inspected through the web
reader; the JSON retains the accepted excerpts and locators. Page/byte coverage and
request totals were **not measured**. No exhaustive-search claim is made. The report
and JSON are the durable handoff; routine scripts and logs are disposable scratch.

## Verification and reproduction

- `node scripts/build-datasets.ts`: **0 written, 38 unchanged**.
- `node scripts/validate-families.ts`: all **9 presets across k1–k26** validated.
- `npx tsc -p tsconfig.json --noEmit`: passed.
- `npx vitest run --maxWorkers=2 --configLoader runner --cache=false`: **90 files,
  857 tests passed** on the permitted rerun. The first sandboxed run had 856 passes
  and the known Node subprocess `EPERM` in `gallery-build.test.ts`.
- Manual JSON validation: every citation/source and chronology reference resolves;
  source metadata and permitted kinds are present; no prohibited domain; round totals
  and entry seats sum to 120; event IDs are unique; promoted dates fit the existing
  term windows; each promoted event maps to at least two registered chronologies,
  including official/academic evidence. This structural check supplements source reading;
  it does not itself prove editorial independence.
- Field diff: k18–k25 change only `sources` and `term.events`, `term.chronologies`,
  `term.candidatesPending`. k26 changes only the recheck note, `asOf`, `gaps` and
  `formation.outcomeNote`. Seats, recommendation entries/totals, formation events,
  governments and polling are unchanged. `git diff --check` passed.

The app/build/tests do not consume these aftermath records. No generated result dataset
changed, so no family dataset hash refresh or differential digest edit was necessary.
The differential test passed with its existing digest. Use locked dependencies and the
commands above to reproduce; this worktree reused the main checkout’s installed
`node_modules` via a local ignored symlink. Vitest’s runner loader/cache flags avoid
writes to that shared dependency tree. No new test mirrors the research data.
