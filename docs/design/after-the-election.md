# After the election: design

Status: implemented, 7 November 2026 (design approved through the V5 task brief). Research and sourcing rules: [docs/research/after-the-election.md](../research/after-the-election.md).
Reviewed data is wired for k1–k26 after the completed election audits; examples: [`data/meta/aftermath/k24.json`](../../data/meta/aftermath/k24.json) (2021) and
[`data/meta/aftermath/k9.json`](../../data/meta/aftermath/k9.json) (1977).

## What it is

For each election, one read-only page answers four questions in order:

1. **Who recommended whom?** Each list's recommendation to the President, as a seat-weighted bar.
2. **How was the government formed, or why not?** A dated timeline: consultations, mandate, extensions, return,
   second nominee, confidence vote, or dissolution.
3. **Which government?** Number, prime minister(s), coalition lists and seats.
4. **What happened during the term?** A short list of dated national events, then "→ next election".

It is history, not a scenario: nothing here changes when the user edits votes. It never shows a party's or
commentator's characterisation; only dated acts and attributed words.

## Where it lives

- **Now:** a new Explore tab, `after` — "After the election" / "אחרי הבחירות", level *simple*, placed after
  *Overview*. It reads the election chosen in the band, like every tab.
- **If the Learn/Play split is adopted:** it moves to Learn as that area's first per-election page. The data
  file and component are the same; only the tab registration changes.
- **Overview link:** the band's About popover gets one line, "Government 36 · Bennett–Lapid →", that opens the tab.
- **1996, 1999, 2001 (direct PM election):** the recommendations block is replaced by a one-line notice,
  "PM elected directly – no recommendations" (i), per `docs/research/era-specific-rules.md`. No round is invented.
- **2026 (k26):** shows only what has happened so far, with the date of the last check.

## Data schema

One file per election, `data/meta/aftermath/kN.json`. Kept out of the `kN.json` meta files so the history can grow
without touching the result datasets or their hashes. Ballot letters link it to the lists; seats are checked
against `officialSeats` at build time.

```text
{
  schemaVersion: 1,
  electionId: "k24",
  status: "pilot" | "reviewed",
  reviewedAt: "YYYY-MM-DD",
  sources: { <sourceId>: { url, publisher, publisherHe?, kind: official|archival|academic|secondary,
                           accessed, via? } },
  results: { electionDate, officialResultsSourceId?, certified?: Dated, knessetSwornIn?: Dated },
  reaction: { policy, items: Dated[], gap? },
  recommendationRounds: [{
    id, date, endDate?, kind: consultations | updated-positions | written,
    president: { nameEn, nameHe },
    blocSchemeRef?: "pm-recommendations",      // the existing bloc scheme in kN.json, when present
    nominees: { <key>: { nameEn, nameHe } },   // people, or "knesset" (asked to return the task)
    entries: [{ letters, seats,
                status: recommended | none | other | split | unknown,
                nominee?, split?: [{ nominee? | status, seats }], noteEn?, noteHe?, cites? }],
    totals: { <nominee or status>: seats },    // must equal the sum of entries (build check)
    cites: Cite[], notes?
  }],
  formation: { outcome: government-formed | no-government,
               events: [{ date, endDate?, type, person?, days?, votes?, textEn, textHe, cites }],
               conflicts?: [{ about, values: [{ value, source }], resolution }] },
  government?: { number, nameEn, nameHe, startDate, endDate, primeMinisters: [...],
                 coalition: [{ letters, seats, note? }], coalitionSeats, changes?: Dated[], cites },
  term: { start, end, inclusionRule, chronologies?: sourceId[],
          events: [{ id, date, endDate?, category, textEn, textHe, cites, confidence? }],
          candidatesPending: [{ label, date, why }],
          endedBy: { type, date, nextElection, textEn, textHe, cites? } },
  issuePolling: { status: pending | none | filled,
                  items?: [{ date, sourceId, questionEn, questionHe, answers: [{ labelEn, labelHe, pct }] }] },
  gaps: string[]
}
Cite  = { source: <sourceId>, quote: "short verbatim text" }
Dated = { date, textEn?, textHe?, cites }
```

Formation `type` values: `consultations`, `mandate-given`, `extension`, `mandate-expired`, `mandate-returned`,
`informed-success`, `knesset-21-days`, `confidence-vote`, `knesset-dissolved`, `direct-election`.

Dates may be partial (`1978-09`) when sources disagree on the day; the UI then shows the month.

**Build checks (when wired):** every `cite.source` exists; every `entries[].letters` exists in the election with the
same seats; `totals` equals the entry sums and 120; dates fall between the election and the next election; no
`kind: secondary` source is a cite's only support when an `official` one exists for the same fact (warning);
`en.wikipedia.org` is rejected outright.

## Graphics

### 1. Recommendations bar (reuses the blocs idea)

A single 120-seat bar, left to right in both languages (owner rule: Hebrew graphics do not mirror; only text does).
Segments are grouped by nominee, largest group first, then *other*, then *no recommendation*, then *unknown*.
Within a group, lists keep their own colours, separated by thin gaps, so the bar reads both "who" and "which lists".
A 61 tick marks the majority line. Labels sit under the bar; list names appear on hover/focus and in the table.

```text
Recommendations · 5 Apr 2021                                            (i)
|■■■■■■■■■■■■■■■■■■■■■■■■■■|■■■■■■■■■■■■■■■■■■■■■■■|■■■|░░░░░░░░|
 Netanyahu 52                Lapid 45                 Bennett 7  None 16
                                         ▲ 61
```

Two rounds (2021, 2019b) stack as two thin bars with their dates, so the shift is visible:

```text
5 Apr  |Netanyahu 52 ............|Lapid 45 ..........|B 7|None 16 |
5 May  |To Knesset 52 ...........|Lapid 56 .............|B 7|N 5|
```

`unknown` is hatched, never coloured as a nominee. 1977 shows "Begin 77 · Other 7 · None 32 · Unknown 4".

A chamber (hemicycle) coloured by nominee is offered as a toggle only if the existing chamber component can take
a colour map cheaply; the bar is the default because it shows the 61 line and reads left to right.

### 2. Formation timeline

A horizontal date line from election day to the government's confidence vote (or the dissolution), left to right.
Mandate periods are bars under the line, one row per nominee; extensions are a lighter continuation.

```text
23 Mar        5–6 Apr                    4 May 5 May                    2 Jun     13 Jun
  ●──────────────●─────────────────────────●──●──────────────────────────●─────────●
 Election    Consultations              Expired Lapid tasked          Lapid: formed  Knesset 60–59
             Netanyahu ███████████████████░
                                              Lapid ██████████████████████
```

Narrow screens: the same events as a vertical list with dates (text mirrors, the order stays chronological).

### 3. Government card

```text
Government 36 · 13 Jun 2021 – 29 Dec 2022                              (i)
PM  Bennett → Lapid (1 Jul 2022)
Coalition 62  [Yesh Atid 17][Blue&White 8][Yamina 7][Labor 7][YB 7][New Hope 6][Meretz 6][Ra'am 4]
```

The coalition strip reuses the list colours and the existing first-government bloc scheme.

### 4. The term

At most about eight rows, each one line: date, category icon, sentence. Sources sit behind (i) per row.
Then the closing line.

```text
During the term                                                         (i)
Nov 2021   ⚖  Knesset passed the 2021 budget, 61–59
Jun 2022   🏛  Knesset dissolved, 92–0; election set for 1 Nov
Oct 2022   🌐  Israel and Lebanon signed a maritime boundary agreement
→ Election to the 25th Knesset, 1 Nov 2022
```

Icons are a small fixed set (governance, security, foreign relations, society, economy) with text labels for
screen readers. No photos.

### 5. Most pressing issue (only where data exists)

A small ranked bar list from one named survey, with the question wording behind (i):

```text
Most important problem · <survey name, year>                           (i)
<answer 1>      ███████████ NN%
<answer 2>      ████████ NN%
…
```

(Placeholder layout only; no figures have been collected.)

Hidden entirely where no survey meets the rule in the research doc. Never interpolated across years.

## Copy rules

This is an Israeli, Zionist civic project, without an activist purpose. Israeli official and academic accounts
are the preferred historical anchors, and Hebrew sources are welcome. Name terror attacks and terrorists plainly,
including Hamas and the other participants in 7 October, and use Israeli war and operation names. Nonpartisanship
means factual, attributed treatment of disputes within Israeli politics, without adopting either camp’s judgments.
The two-independent-chronology inclusion rule still applies; an Israeli official or academic chronology is the
preferred anchor, and multiple publications from the same institution do not become independent sources.


- Each term-event short text is one concise sentence (about 25 words maximum); keep extra chronology,
  source attribution and caveats in the existing event `notes` and `cites` behind (i), not new detail fields.
- Labels only on screen; dates, provenance, conflicts and caveats behind (i) (owner rule: concise copy).
- Sentences follow one pattern: actor, verb, object, figure. "The Knesset approved the 36th government, 60–59."
- No evaluative adjectives (historic, narrow, dramatic, controversial), no motives, no consequences unless a cited
  source attributes them, and then in quotation with the speaker named.
- Each (i) lists sources with their kind (Official / Archival / Academic / Secondary) like the existing
  `EvidenceLink`.
- Hebrew and English are written separately, not machine-translated; both are reviewed against the quote.

## Implementation notes (7 November 2026)

- `AfterElection.tsx` accepts only the immutable election dataset. Tab registration, About navigation and
  Sources integration are the shell connections. Scenario tint, change summary, editing hints and drawers
  are suppressed on this page.
- `aftermath-model.ts` validates reviewed records during Vite builds and unit tests; `aftermath-runtime.ts` loads
  the separate history files. `aftermath.ts` retains the shared, runtime-independent support types.
  The audit tracker records all 26 audits completed; durable reconciliations
  are in `docs/research/data-audit/kNN-resolution.md`.
- Government participation follows `docs/research/government-support-roles.md`: group members with ministries,
  members without ministries, outside support, confidence-only votes, arranged abstentions and other roles
  separately. Unknown classifications have their own group. Preserve provisional badges and unknown totals;
  never infer a role or membership from an investiture vote. The summary puts membership beside the vote,
  with reconciliation and original research qualifications behind (i). Individual exceptions also appear,
  without double-counting people included in faction seats. Changes use the same renderer and R4 validator.
- Participant `seats` records only the participating portion; `electionListSeats` preserves its election
  envelope. In 1984, the Alignment portion is 37 of 44. Neither figure is a confidence-vote tally.
- Every displayed date uses the local date helper, preserving available precision. Date endpoints are
  individually isolated with explicit locale direction; range containers follow reading direction, so
  Hebrew starts on the right. Chronological graphics remain LTR; their labels use the locale direction.
- Pending events and any single-source term entries are confined to Sources. Research notes remain in
  their original language behind labelled disclosures. The existing audit establishes independent
  chronology support; the runtime additionally rejects term entries with fewer than two distinct sources.
- Polls require bilingual questions and answers, population and field dates; incomplete surveys stay
  hidden. The complete 1996 card is shown. The 2021 record lacks the required bilingual metadata and
  is withheld. Empty reaction and polling sections render nothing; future records slot into them.
- Next-election references accept either an election ID or the older date form. The 2001 direct PM
  election is a dated event within k15, since it did not elect a new Knesset.

## Original design questions (superseded where answered in the V5 brief)

1. Tab now vs. wait for the Learn/Play split. (Recommendation: tab now; moving it later is cheap.)
2. Whether to show the *reaction* block at all. The neutral version is thin (dates, all-or-none statements).
   Recommendation: omit it from the first release and keep the field.
3. Whether to show *candidate* (pending) events, greyed, for transparency. Recommendation: no; list them only in
   the Sources tab.
