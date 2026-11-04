# Product

<!-- impeccable:product-schema 1 -->

> Written on 4 November 2026 from the owner's stated requirements across the build sessions and reviewed by
> the owner the same day ("it seems about right").

## Platform

web

## Users

- **Curious voters** (the default audience, served by the Simple level): Hebrew speakers first, also English
  readers, who want to see how changing votes changes the 120 Knesset seats, who formed governments, and how
  blocs added up, without prior knowledge of the electoral law.
- **Students, journalists and engaged citizens** (Standard): compare elections, model mergers, splits,
  surplus-vote agreements, blocs and joint lists, and share scenarios.
- **Researchers and developers** (Expert): inspect every rule, method and data source, and experiment with
  alternative electoral systems.

## Product Purpose

An exact, source-faithful explorer and seat simulator for every Knesset election from 1949 to 2026. Its
value is trust: every published seat is reproduced by the law of that election, every number is computed
exactly, and every datum states its official source or is clearly labelled as secondary or unavailable.
Success means a voter can answer "what if" questions correctly and a specialist can check how.

## Positioning

The only tool that reproduces every official Knesset result since 1949 under each era's own law (Bader–Ofer,
the 1951–1969 largest remainder, the 1949 rules, the 1977 candidate cap) with exact arithmetic and retained
official sources, in Hebrew and English, at three levels of depth.

## Operating Context

- Used in a desktop or phone browser; installed nowhere (a static site, intended for GitHub Pages).
- Hebrew is the default language with right-to-left layout; English is a full alternative. Light and dark themes.
- Three interface levels over one engine: Simple (truly visually minimal), Standard (common, consequential
  edits), Expert (edit as freely as reasonable).

## Capabilities and Constraints

- 26 elections, national results; localities for the modern elections; rosters with every elected member.
- Scenario editing with undo/redo, save, share links, import/export; analyses (what if, coalitions, seat
  security, sensitivity, charts, walkthrough, comparisons).
- Blocs per election (first government, recognised blocs, the user's own) and constituent parties of joint
  lists, which may sit in different blocs and can be run as separate lists.
- Correctness is non-negotiable: never invent candidates, agreements, votes, affiliations or colours; label
  secondary sources; say clearly what is unavailable.
- Source policy: official sources first; English-language Wikipedia is never used or linked (the owner considers
  it unreliable on Israel); Hebrew Wikipedia only as a labelled secondary source.

## Brand Commitments

- Name: "Israeli Elections Explorer" / "סייר הבחירות לכנסת".
- Neutral and non-partisan: not affiliated with the Central Elections Committee or any party; party colours and
  logos represent parties as they presented themselves; no party is visually favoured.

## Evidence on Hand

- Official data and retained sources under `data/raw/` (results notices, candidate lists, CEC records,
  Knesset OData); research files in `data/meta/`; decision records in `docs/decisions/`.
- No testimonials, users, press or usage figures exist; none may be invented.

## Product Principles

1. Truth over polish: a number or a name is shown only when it is sourced; uncertainty is said in plain words.
2. Simple stays simple: complexity is available at Standard and Expert, never forced on the default view.
3. Hebrew first, English equal: both languages are complete, with correct right-to-left behaviour.
4. Every edit is reversible and explains its consequence before or as it happens.
5. Neutrality: blocs, colours and wording never favour a party or camp.

## Interaction Principles

Stated by the owner on 4 November 2026 as general rules drawn from specific complaints. Every screen is checked
against all of them, not only the example that prompted each.

1. **Every visible thing is its own control.** A figure, bar, bloc, seat or label that summarises something opens
   that something when clicked, in place, directly beneath or beside it (votes that won no seat → the lists that
   lost them, with votes and share). No separate panel to go and find.
2. **State is shown as state.** On/off is a switch, a choice among options is a selector showing the current
   option; never a verb button ("Switch off") or a remove-then-add sequence to change a value.
3. **Fewest steps for real tasks.** A common action takes one interaction from where the user is looking.
4. **Everything is findable by what it does.** Tools are signposted by task in plain words; levels hide depth,
   never the existence of a feature.
5. **Labels belong to their context.** A word appears only where it means something (a bloc name never leaks from
   another grouping); every term can be explained in place.
6. **Reality first, then what-ifs.** Real events (a joint list's faction splitting after the election) are direct
   actions; counterfactuals are offered beside them and labelled as such.
7. **Every party is recognisable.** Its own logo as used at that election, its colour and its name, also after it
   is split from a joint list.
8. **Groupings are shown as soft regions.** Blocs are pale tinted areas behind their members, not extra bars.
9. **Craft is checked, not assumed.** Alignment, centring, spacing and wrapping are verified at real sizes in both
   languages, both themes and every level.

## Accessibility & Inclusion

WCAG 2.2 AA as the target: keyboard-complete flows, touch-reachable controls on phones, sufficient contrast in
both themes, non-colour equivalents for charts and the chamber, reduced-motion support.
