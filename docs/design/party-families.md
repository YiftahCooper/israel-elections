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

The Party families navigation entry is available at Simple. The definition, coverage,
ambiguity count, policy, separate vote-share/count plots and exact table precede the
editing controls. Election points use actual dates (both 2019 elections remain
separate). Charts share the election cursor with one another and table focus/hover.
Clicking a chart point or date opens the election. Each metric uses one shared scale
across compared families. Phone stacks metrics vertically; the exact table can scroll
within its container when comparisons need more width.

The default Haredi selection is core plus individually toggleable extensions.
Excluded/contested lists are disclosed with one-click inclusion. Search uses Hebrew,
English, registry dated names and canonical appearances, preserving selected chips
while filtering. Checkboxes require no modifier keys. Mixed lists have indeterminate
checkboxes and named constituent descriptions. Core selection can also be edited in
the active election's picker; extensions and contested decisions span all elections.

Mixed policy is per definition: separate hatched whole-list segment (default), include
the whole list, or exclude. Policy accompanies the totals, charts and action controls.
No constituent votes are inferred. A simulation list merging selected and other
origins becomes mixed. Withdrawn simulation lists cannot supply scaling votes.

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
`<he|en>-<light|dark>-<desktop|phone>.png`. These working captures are disposable.

The family page and registry load in a separate chunk. No changes to vote datasets,
engine allocation rules or concurrent control/graphics implementations are needed.
