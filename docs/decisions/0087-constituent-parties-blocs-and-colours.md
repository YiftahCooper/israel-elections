# Constituent parties, per-election blocs and per-election colours

Decided by the parent agent on behalf of the owner, 4 November 2026. The owner asked for
these features and left the design "in your hands". Extends [0012](0012-informal-editable-blocs.md).
The design pass used the product-design skill; rule IDs in brackets are from that skill.

## Context

Many lists are alliances of separate parties: United Torah Judaism (Agudat Yisrael and Degel
HaTorah), National Unity in 2022 (Blue and White and New Hope), the Alignment, Gahal, the Joint
List and others. After an election these parties often act separately. A party on a joint list
may join a government its partners oppose. Before an election, users want to ask what would
have happened had the partners run separately.

Today the app treats each list as indivisible:
- Blocs exist only for 2022 and 2026. They are app-assigned, and the bloc editor is hidden in
  Expert → Rules.
- A two-way split exists in Standard → Mergers, splits & agreements. Its by-party option uses
  the candidate party affiliation (`partyHe`) that exists only for 2019 onwards.
- Party colours are harmonised across elections; they are not per election.

## Users and jobs

- **A curious voter (Simple):** "Who would govern if New Hope had sat with the coalition?" and
  "How big was each camp?" They need to see blocs at a glance without configuring anything.
- **A student or journalist (Standard):** "Group these parties my way", "Move Degel HaTorah to
  the opposition", "What if UTJ's two parties had run separately?"
- **A researcher (Expert):** edit vote shares for a separate run, colours, and every assumption.

## Decisions

### 1. A party is a sub-unit of a list, carried by its candidates

- A dataset list may declare its constituent parties, each with an id that is stable across
  elections, its names, its colour and its sources.
- Each candidate may carry the id of the party they represented on that list. Affiliations
  come only from sources, never from guesses. Candidates without a recorded affiliation stay
  unassigned, and the app says so.
- **Why candidates carry it:** the seats of a list go to its elected candidates, so a party's
  seats are the number of its candidates who were seated. No vote estimate is involved.
  Affiliations survive merges, splits and roster edits because they travel with the
  candidate. [rule/preserve-mental-model]: the list remains the electoral unit the law
  allocates seats to; the party is shown inside it.

### 2. Moving a party to another bloc does not change the election

- Bloc membership resolves per seat:
  - a seated candidate whose party has its own bloc assignment counts for that bloc;
  - otherwise the seat counts for its list's bloc.
- A list with an unavailable roster counts entirely for its list's bloc.
- Bloc counts, the chamber and coalition arithmetic all use this per-seat resolution. So
  moving New Hope to another bloc moves its seated MKs, and the seat allocation is untouched.
- The action is undoable and recorded in the change history.
- **Consequence the interface must state:** "Moves this party's N elected members. Votes and
  seats are unchanged." [rule/name-object-scope-consequence]

### 3. Running separately is an explicit counterfactual with a stated assumption

- On a joint list, "Run as separate lists" splits it into one list per constituent party, as
  a generalisation of the existing split action [rule/smallest-intervention].
- **Candidates:** each part keeps its own candidates in their original relative order.
  Unassigned candidates stay with the part whose party holds the list's first rank, and the
  confirmation says how many there are.
- **Votes:** the default share is each party's share of the list's seated members, the
  closest observable proxy. The assumption is named in the panel and can be edited in
  Standard (shares) and Expert (exact votes).
- **Surplus agreements:** the joint list's agreements are dropped, as in the existing split.
- **Consequence the interface must state, before applying:** "Votes are an estimate; each
  part must pass the threshold on its own; surplus agreements of the joint list are dropped.
  Undo restores the joint list." The result is reversible through undo, so no extra
  confirmation dialog is needed [rule/destructive-proportional].
- **Rosters:** a list whose roster is unavailable, or whose affiliations are entirely
  unknown, offers the generic split instead. It explains why with the reason inline, never as
  a silently disabled control (see the surfaces reference).

### 4. Each election carries its own bloc schemes

- A dataset may define bloc schemes. Each scheme has an id, names, a kind (`government`,
  `pre-election`, `parliamentary` or `user`), a date, sources and blocs. Each bloc has an id,
  names, a colour and members, where a member is a list or a party.
- **Default scheme for each election:**
  - the first government formed after it (coalition against opposition), which is a matter
    of record;
  - otherwise (for example April and September 2019, or 2026 before a government forms) the
    best-recognised pre-election blocs;
  - otherwise none.
- **Picking a scheme:** a segmented control when there are two or three schemes, a select
  when there are more [rule/control-matches-cardinality]. Labels name the kind and the date,
  such as "First government (Dec 2022)".
- **Editing blocs:**
  - An edit to a sourced scheme never changes it. It creates "My blocs (from …)", so the
    sourced scheme can always be restored.
  - Users can create, rename, recolour and delete blocs. They assign members with checkboxes
    of lists and parties grouped by list. These are keyboard-operable with visible names;
    there is no drag-only interaction [rule/keyboard-complete-flow, rule/accessible-name-required].
- **Where blocs are edited:** a Blocs panel in Standard, inline in the analysis area. It
  replaces the bloc editor hidden in Expert → Rules [rule/inline-before-modal].
- **Empty state:** an election without schemes shows "No recorded blocs for this election"
  with a "Create a bloc" action [rule/empty-state-action].

### 5. Showing party colour and bloc colour together

- **The chamber:** each seat is filled with its party colour (the constituent party's colour
  when known, otherwise the list's colour). Seats are ordered by bloc, then list, then party.
  A thin outer band in the bloc colour spans each bloc's seats, with its name and seat count.
  This reads on a phone, where rings around 120 small seats would not.
- **The bloc bar:** one segment per bloc in the bloc colour, subdivided into party colours,
  with the majority line.
- **Text:** a text legend with numbers gives the same information without colour.

### 6. Per-election colours

- Each list or party takes the colour it was officially or commonly associated with in that
  election, from sourced research in `data/meta/`. The canonical cross-election colour is the
  fallback.
- **Distinguishability:** the existing check (CIE ΔE above 20 between seat-order neighbours)
  still applies. When two associated colours collide, the colour of the less-associated party
  is shifted in lightness only, and the dataset notes "adjusted for contrast".
- **Editing:** users can edit colours (Expert identity editing, and bloc colours in Standard).

### 7. What each level shows

- **Simple:**
  - the bloc bar and chamber bloc band for the default scheme, plus the scheme picker when
    the election has more than one scheme;
  - party tags in "Who gets in";
  - no editing.
- **Standard:**
  - bloc editing;
  - per-party bloc selection in the list panel;
  - "Run as separate lists" with editable shares;
  - Coalitions works at party level when a joint list's parties are in different blocs.
- **Expert:**
  - exact votes for separate runs;
  - colour editing;
  - the colour-by options.

## Reachable states covered

Each of these states is covered:

- a list with no constituent data;
- partial affiliations ("2 of 7 members' party not recorded");
- an unavailable roster;
- a party with no seated members (it can be assigned to a bloc, with a count of 0);
- an election with no schemes;
- 2019a/2019b (no government formed);
- after a merge, split or withdrawal (affiliations follow candidates);
- the experimental mode;
- a shared link or import of older scenarios: actions that predate these features still
  replay, and missing fields default to "no party".

## Non-goals

- Estimating historical vote shares of parties within joint lists. There is no such official
  figure; the stated proxy is used.
- Tracking later defections or faction splits during a Knesset term. The model reflects the
  roster at the election, consistent with the existing disclaimer.

## Consequences

- **Data:** the research files in `data/meta/` feed the dataset build. Every affiliation,
  scheme and colour keeps its sources, and secondary sources are labelled.
- **Model:** new optional fields (`Candidate.partyId`, `parties`, `blocSchemes`) and actions
  (`setPartyBloc`, `applyBlocScheme`, `splitByParty`). Existing scenarios and links remain
  valid.
