# Party families as built

4 November 2026. Implements the historical family profile and one-election actions in
research stages 3–6, consuming the stage 1–2 registry and interpretation files.

## Definitions and evidence

The nine versioned files in `data/meta/families/` are the built-ins. `haredi.json`
is the sole Haredi source, renamed from the pilot draft without dropping its evidence,
input hashes, excluded candidates or independent computed totals. All remain
`research-draft-not-production`. The page quietly labels the active built-in a
**sourced draft interpretation**; documented organisational identity does not make
our classification official. Votes measure selected ballots, never voters' religion.
The metadata validator discovers all JSON files and checks identities, hashes,
sources, appearances, mixed flags and independent BigInt totals.

`src/families/model.ts` contains the generic import guard, membership resolution,
aggregation and vote plans. Chart numbers come from immutable election datasets,
not the cached preset totals. Whole list ids are deduplicated. Missing coverage and
unresolved decisions yield unknown; an empty observed selection is did-not-contest;
an observed selected zero remains zero. Unknown points break the line. Presets may
overlap: compare shows separate small multiples and never adds family totals.

## Page and selection

The profile opens with swatched family chips; selecting multiple chips is comparison.
Hidden definitions stay in Manage, alongside import/export and the exact-figures
preference. Colours are stable by family identity and remain chromatic, separate from
neutral change marks and from the grouping neutrals; every pair of the nine is at least
OKLab ΔE 12.5 apart (tested). A personal copy keeps its source preset's colour and is
named "(mine)"/"(copy)" so two chips never look identical.
The most recently selected family supplies the policy, edit and scenario actions.

The separate share/count charts lead the page. At 1200px and above they sit side by
side, each 300px high; narrow layouts stack them, each at least 240px high. Small
multiples use one shared scale per metric. Actual dates position the points; horizontal
year labels are thinned on phones, not scaled down. End labels identify each series.
Hover/focus reveals exact votes/share/date, mixed totals and publication status. An
election still awaiting its gazette would be drawn hollow and labelled; none is at present. Tab enters the current point;
arrow keys move among the 26 elections, and Enter/Space opens the focused election.
The shared cursor follows chart and table focus. Unknown points break the line;
observed zero and did-not-contest remain different in exact figures.

The table is secondary, under **Exact figures (26 elections)**. It starts collapsed
unless reduced motion or the explicit **Prefer exact figures (screen-reader/table
view)** browser preference is set. Screen-reader use is not inferred or detected.
Both the chart and table remain keyboard-operable. There is no animation.

One short definition line and a quiet sourced-draft label replace repeated headings.
The info button opens the full definition, sources and limitations on demand. Mixed
lists (family + other parties) use Show hatched / Count if family heads it / Count all /
Leave out next to the charts, each with the mark it produces on the chart. It is a
per-family view remembered in this browser, not a membership edit, so it never forks.
Hover reports without taking the pointer or loading anything (list names and mixed-list
compositions are in the compact runtime): the change since the previous election, the
counted lists, and each hatched list with the family's own parties in bold.
Under Separate the line shows whole lists only and a hatched bar stacked on it shows how
far mixed lists could add (one legend states this once); an election where the family
ran only inside mixed lists breaks the line instead of plotting zero. Lists left out by
Exclude, by the user or as contested read "not counted", never "did not contest". Axis
ticks are round values and decades (every 20 years on phones);
with grouping and Edit membership beside them. Editing still forks a built-in.

Edit membership is a modal side sheet (full width on phones). An independent
26-election stepper and ChoicePicker select the election being edited without changing
the open scenario. Search uses bilingual names and registry aliases. Selection chips
persist while filtering; mixed-list checkboxes are indeterminate with named members.
Extensions and contested lists are editable for the sheet's chosen election. Registry
relationship suggestions and manual partner links remain preview-first. Primary
choices throughout the profile/sheet use chips, segments or ChoicePicker, not selects.

Scaling has shared quick-action styling, a ± stepper, −10/−5/+5/+10% shortcuts and a
target-share input mode. Negative percentages lower a family (to −100% at most). Before/after
strips show the family's seats in its colour against the majority line, with the seat
delta, and
exact target votes and conservation/participation consequences before application.

Opening a chart point or table date also sets an ephemeral historical family lens.
On Overview, FamilyTreatment is at the top of the list column, and every selected member row has a small family label and the same tint, including non-adjacent members. Mixed rows have a mixed label and hatching.
This lens never edits the scenario; its close control clears it. Explicit Apply family
as grouping remains a separate undoable scenario action, replacing the lens with
the applied definition. Sorting lists by seats is preserved.

## Personal presets and relationships

Every built-in edit forks a personal definition. Save as my preset freezes the whole
definition, revision, membership and policy. Hide is a separate catalogue preference;
Manage presets restores it. Definitions live under `israel-elections:families:v1`,
separately from scenario logs, with export/import. Storage failure is reported and
export remains available. This is browser-only storage, not backup or sync.

The registry resolves legacy alias ids before matching appearances. Historic links
have explicit lineage/electoral-partner types. Evidenced registry edges are offered
as suggestions, previewed before applying; `pending[]` and leader moves are excluded.
No graph traversal automatically inherits votes or family membership. An accepted
link explicitly adds only whole appearances whose known non-alliance members are
all among the chosen endpoints. Electoral partnerships from the registry are scoped
to their election. Manual electoral-partner links are also scoped to the active election. Manual links preview parties and affected lists before applying the same conservative
whole-appearance rule. Unknown continuity is never manufactured from name matching.

## Scenario actions and arithmetic

`familyOperation` is one plain-data action, either grouping or scaling. Each action
freezes the complete definition and revision, and the scenario holds the applied
snapshot. It is validated on import/replay and works with existing store undo/redo;
no separate undo history was added. Bloc part snapshots retain family provenance.

Apply family as grouping compiles to a named custom grouping: selected family,
mixed lists, everyone else. It clears previous party/candidate bloc overrides and
marks the grouping edited. The bloc panel has a small additive navigation hook;
ListBars has a small additive data attribute and one explanatory line, with pale
selected backgrounds and mixed hatching. Historical allocation inputs stay intact.

Scale supports increase by a percentage multiplier and a target share. Fixed-total
sources conserve valid ballots exactly; an active specific-list source limits donors
to that list. New-voter mode explicitly changes electorate and valid total. Target
shares in that mode solve against the new denominator. Integer targets use rational
arithmetic, then integer largest remainders (stable list-order ties) distribute both
member and donor totals. No floating-point multiplication decides allocations.
Zero-weight families, impossible shares and inadequate donors refuse instead of
silently clipping. The list-by-list consequence is expandable before applying.
Replay checks pre-edit counts, donor eligibility and proportional allocations.

Features `families`, `familyEdit`, `familyGrouping`, `familyScale` are registered.
The profile defaults to Simple; editors default to Standard. Interpretation, policy,
publication status and data qualifications are outside optional editor disclosures.
Native controls and keyboard chart activation are included; no WCAG conformance or
screen-reader certification is claimed.

## Reproduction and integration

Run the repository typecheck, Vitest with two workers, Vite build, then Playwright
with `PW_PORT=5316`. Tests independently reconcile 26 Haredi totals, policies,
rounding/conservation, fork/hide/restore, malformed imports, alias resolution and all
nine built-ins, plus the metadata branch's evidence tests. Browser coverage opens
26 elections, changes policy, persists/hides/restores a personal copy, groups 1988,
and scales 2022 by +10% followed by undo. Screenshot cases cover Hebrew/English,
light/dark, 1440×900 and 390×844, saved under `.backup-scratch/families/` as
`<he|en>-<light|dark>-<desktop|phone>.png`, with `-compare` and `-edit` variants. Overview captures also show the grouping and the unedited 1949 family lens. These working captures are disposable.

## Compact runtime and lazy evidence

`scripts/family-runtime.ts` compiles metadata during Vite build (and development) to
`data/families-runtime.json` and the profile's virtual runtime module. It packs ids,
bilingual names/definitions, membership/outcome flags, review ids, dates, publication
flags, immutable whole-list votes and derived totals. A unit test keeps the JSON under
200,000 bytes and independently reconciles every
family/election with the full metadata. No generated copy is checked into source.

The initial profile does not import the registry or full evidence, or fetch 26 complete
election datasets. Full family files are separate dynamic chunks, opened by the
sources sheet and explicitly loaded when saving/editing/exporting/applying a definition
so personal files and scenario snapshots retain the original evidence. The registry
and one elected dataset load only when the editor/import needs them. Full hashes,
pointers and qualifications remain in metadata, never in the compact profile payload.

ChoicePicker exposes its dialog via aria-controls; browser helpers follow that stable
id so closing a picker nested inside the editor is not mistaken for closing the sheet.

The family page and registry load in separate chunks. No changes to vote datasets,
engine allocation rules or concurrent control/graphics implementations are needed.


## Short-label repair

Each built-in carries `labelEn` / `labelHe` for chips, profile headings, grouping names,
bloc cards, legends and the session band. The complete `nameEn` / `nameHe` titles
remain in the information sheet with the definitions. Labels are presentation metadata;
classification, membership, votes and evidence revisions are unchanged. Legacy snapshots
without labels resolve the nine known preset ids to these same short names; custom
definitions fall back to their own names. Renaming a personal preset updates its label.

Family grouping creates a Mixed bloc only when the resolved election has separate mixed
list placements. Include-whole and exclude policies do not create an empty Mixed bloc.
The session band gives each family/other bloc count once, without repeating the grouping
title or asserting a political majority. A scale-only family snapshot does not change
summary semantics for an ordinary sourced grouping.

The Overview keeps seat order. Every visible selected or mixed member has an individual
label and tint, including separated runs such as Degel in 1988; no multi-row bracket
implies adjacency. The list-column header is one short label plus the mixed policy.

Applying a family grouping uses the same stable family colour as its chart/chip for the
family bloc, muted grey for everyone else, and a distinct muted sand for mixed lists.
The grouping replacement has one part marker; member lists are not individually marked.

## Joint-list facts and explicit counting

Mixed whole-list ballots stay **Separate** by default; seat shares never stand in
for unobserved constituent votes. The policy selector additionally offers **If
family heads list** (registered rank 1), alongside whole-list inclusion and
exclusion. There is no hidden two-thirds rule. This remains a remembered view,
not a fork; Edit membership offers per-list Use policy / Include / Exclude
on a personal copy. Applying a grouping freezes the viewed policy as before.

Only joint lists show official head-party, constituent elected-seat and opening
faction facts in list details and the family profile's selected election. The
facts describe the original dataset, including its provisional status, rather
than scenario seats. Official submission text, sources, per-party faction counts
and uncertainty are available in the same (i). Unknown identity or opening-day
membership is never inferred from a later faction. The deterministic derivation
and refresh instructions are in the families metadata README.
