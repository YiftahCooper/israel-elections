# Settings popup, rebuilt: design spec (Claude)

Written 7 November 2026 for task V2 (design phase). It is one of two independent designs; the coordinator merges
them and one implementer builds the result. No app code is changed by this document.

Evidence used:

- the code at `754c93b`;
- the running app at 1500 px (English, dark) for Simple, Standard and Expert, every tab, the list page and the
  Settings popup;
- 390 px (Hebrew, light) for Simple and Expert, including the board and the popup;
- k25 with the Religious Zionism list open.

Screenshots are under `.backup-scratch/v2a-claude/shots/` and are not committed.

The owner's words this design answers (7 November):

> "The settings … are not clear, lack features, and are not optimised. For instance Joint-list seats by party should
> be a toggle. It should also have separate options for showing parties from lists with no seats … so that every
> subjective feature, anything that is a matter of personal taste that users may want to disable can be done so.
> Probably best to have different settings for each complexity mode."

Earlier owner rules that bind this design:

- generalise each example;
- concise copy, with explanations behind (i);
- ask at point of use, with Just this once / For this item / Always, changeable later in Settings (owner comments
  of 5 and 6 November);
- "Settings open anywhere as a popup that doesn't disrupt the page … human readable and brief and simple" (owner, 6
  November, answer 7d);
- mark every edit;
- no jumps;
- levels hide depth, never the existence of a feature (PRODUCT.md, principle 4).

---

## 0. What is wrong today (short)

The popup (`src/app/components/PersonalSettings.tsx`) has 5 controls. Measured against the owner's rules:

| Problem | Where | Rule broken |
|---|---|---|
| "Joint-list seats by party" is an On/Off **popup picker**, not a switch | `SourcePicker.tsx:146-152` | State is shown as state |
| "Votes come from" and "Mark differences from" open a full-screen picker for 3 choices | `SourcePicker.tsx:148` | Segmented control for 2–4 options |
| The decimal setting shows a dead "2 · Expert level" below Expert | `PersonalSettings.tsx:46-49`, `store.ts:503-505` | Nothing shown that does nothing |
| The seat-chart layout and colouring are Expert-only, sit only on the chamber, and are **forgotten on reload** | `Hemicycle.tsx:79-81`, `store.ts:105,112` | Taste must be settable and remembered |
| Language, theme and level are not in Settings; the theme has no "follow my device" | `TopBar.tsx:88,144-146`, `store.ts:104` | Findable by what it does |
| Taste behaviours have no off switch: <br>• zero-seat parties<br>• folded seatless lists<br>• logos versus ballot letters<br>• hover popups<br>• animation<br>• bloc shading<br>• the small reference chamber<br>• the starter tip once dismissed | see §1 | The owner's request |
| The table preference exists only inside Party families → Manage | `Families.tsx:97` | Generalise |
| One flat list: no groups by task, no search, no reset | `PersonalSettings.tsx` | Scan-ability |
| The header line "Every election · this browser" is prime space spent on a footnote | `PersonalSettings.tsx:42` | Concise copy |

---

## 1. Inventory: every taste-dependent behaviour today

Column key:

- **Setting?** means a setting exists today.
- **Want different?** means a reasonable user might want it off or different.
- **Class** gives the §2 verdict:
  - **S** = global setting;
  - **F** = fixed;
  - **P** = per-election or per-scenario choice;
  - **R** = remembered automatically at the tool, with no setting.

### 1.1 Language, look and motion

| # | Behaviour | Where | Default today | Setting? | Want different? | Class |
|---|---|---|---|---|---|---|
| 1 | Interface language | `TopBar.tsx:144`, `store.ts:104` | Hebrew | Top bar only | Yes | S |
| 2 | Light or dark theme | `TopBar.tsx:145`, `store.ts:104` | The device's theme at first visit, then frozen | Top bar only | Yes; also "follow my device" | S |
| 3 | Detail level (Simple / Standard / Expert / Custom) | `TopBar.tsx:88`, `features.ts` | Simple | Top bar and the Custom page | Yes | S (shown in Settings too) |
| 4 | Animations (see the list after this table) | `styles.css:237-238, 280, 285, 318, 324, 335, 399, 506, 562, 625, 660`; `WhatIf.tsx:58` | On; off only when the OS asks for reduced motion (`styles.css:300, 509, 578, 644, 674, 917`) | No | Yes | S |
| 5 | Text size | `styles.css:83-84` (fixed px) | 13 px body, 12 px tiny | No (browser zoom only) | Yes, for readability | S (new) |
| 6 | Display density (spacing) | `styles.css` throughout | One density | No | Some users | F (see §2.4) |
| 7 | Sounds | none in the app | none | n/a | n/a | none to add |

The animations in row 4 are:

- the bars grow;
- the seats fade in;
- the bloc wedges morph;
- a tick pulses;
- the switch slides;
- What if scrolls smoothly.

### 1.2 Lists and parties

| # | Behaviour | Where | Default today | Setting? | Want different? | Class |
|---|---|---|---|---|---|---|
| 8 | **Joint lists counted by party** for every joint list (the global starting point) | `preferences.ts:12-17`, `store.ts:99, 455-479`, `JointParties.tsx:79-82` | Off | Yes, as an On/Off picker; also a switch on each joint list's page | Yes | S |
| 9 | One joint list counted by party | `JointParties.tsx:71-75` | Off unless #8 is on | Per list | Yes | P (per scenario; marked) |
| 10 | Party colour drawn inside the list colour for a list counted by party | `PersonalSettings.tsx:44`, `Hemicycle.tsx:44-45, 82`, `ListBars.tsx:68-71, 101` | On | Yes | Yes | S |
| 11 | **Parties that won no seat**, inside a list counted by party (the owner's 2022 example: Atid Ehad 0, Eretz Yisrael Shelanu 0) | `ListBars.tsx:120-133` (rows of 0), `JointParties.tsx:84-97` (rows with 0), `BlocPanel.tsx:60-67` (party units with n = 0); the chamber key already hides them (`Hemicycle.tsx:307`) | Shown | No | Yes: "they didn't actually make it into the Knesset" | S |
| 12 | Lists that won no seat: those under 0.5 % fold behind "Show all N" | `ListBars.tsx:55-64, 150-153` | Lists of 0.5 % or more are shown; the rest fold | Session "Show all" only | Yes (all of them, or none) | S |
| 13 | Lists that withdrew (0 votes; k26 has 2, k24 has 1) | `ListBars.tsx:110` ("withdrew"), in the folded tail | Shown after "Show all" | No | Yes | S |
| 14 | Order of the list column | `ListBars.tsx:54-55` | Seats, then votes | No | Yes (by bloc, matching the chamber) | S |
| 15 | Vote counts beside percentages in the list column | `ListBars.tsx:108` (`standard &&`) | Hidden in Simple, shown above Simple | Level only | Yes | S (default by level) |
| 16 | Logo or ballot letters as the list's symbol | `ui.tsx:47-70` (`Slip`); used by `ListBars.tsx:93-94`, the chamber key, the seat card, Coalitions, the list page, joint parties, the bloc editor, families and Compare | Logo when a verified logo exists, otherwise letters | No | Yes: some prefer the familiar ballot letters | S |
| 17 | English-mode candidate names fall back to Hebrew with a tooltip | `CandidateName.tsx:8` | Fallback | No | n/a | F (localisation rule: an English name is labelled as transliterated) |
| 18 | Candidate photos | none in the app | n/a | n/a | n/a | none to add (no sourced photos; correctness) |

### 1.3 Seat chart (the chamber)

| # | Behaviour | Where | Default today | Setting? | Want different? | Class |
|---|---|---|---|---|---|---|
| 19 | Layout: arc or blocks | `Hemicycle.tsx:80, 313` | Arc; Expert only; **not saved** | Inline at Expert | Yes | S |
| 20 | Colour seats by list, bloc or party | `Hemicycle.tsx:81, 314` | List; Expert only; **not saved** | Inline at Expert | Yes | S |
| 21 | Bloc backgrounds (tinted wedges and boundary lines) | `Hemicycle.tsx:244-299`, `styles.css:318` | On | No | Yes (a cleaner chart) | S. The V1 lane restyles these; this is only on/off. |
| 22 | Small reference chamber when seats change | `Hemicycle.tsx:321-334` | Shown whenever there are changes | No | Yes | S |
| 23 | Outlines on gained seats and dashes on lost seats | `Hemicycle.tsx:327, 335` | On | No | n/a | F (it marks edits) |
| 24 | The list key under the chamber | `Hemicycle.tsx:347-356` | On | No | Yes: it repeats the list column | S |
| 25 | Seat card on hover (candidate, rank, how the seat was won) | `Hemicycle.tsx:261, 279, 337-346` | Opens on hover | No | Yes (hover-averse users) | S (via #33) |
| 26 | Export buttons (SVG/PNG) | `Hemicycle.tsx:358-362` | Standard and up | Through the Custom page (`chamberLegend` feature) | Via the Custom page | Feature visibility, not a setting |
| 27 | Majority line and seat count in the centre | `Hemicycle.tsx`, `Blocs.tsx` | On | No | No | F (information) |
| 28 | Bloc order, left to right | `blocOrder.ts:3-8` | As declared by the source | No | Some | F (neutrality: the source's order) |

### 1.4 Numbers and dates

| # | Behaviour | Where | Default today | Setting? | Want different? | Class |
|---|---|---|---|---|---|---|
| 29 | Decimal places for percentages | `store.ts:105, 503-505`; `format.ts:8` | 2, forced below Expert; 0–8 at Expert | Expert only | Yes. The owner (6 Nov, answer 4) asked for fewer in simple modes. | S |
| 30 | **Decimals that ignore the setting** (see the list after this table) | the sites listed below | 1 or 2, fixed | No | They should follow #29 | Fix in the build (generalisation) |
| 31 | Thousands separators, Western digits, full numbers (1,167,591) | `format.ts:5-6` | en-US grouping | No | Rare | F (exactness is the product; short forms only on chart axes, `FamilyCharts.tsx:62`) |
| 32 | Date style | `FamilyCharts.tsx:8` (en-GB / he-IL), `BoardChoices.tsx:18` (month and year) | Locale convention | No | Rare (a Hebrew-calendar date was considered, §2.5) | F |

These sites ignore the decimal setting (row 30):

- `LocalityMap.tsx:76, 138`
- `Turnout.tsx:53`
- `ElectionContext.tsx:63`
- `FamilyCharts.tsx:48, 96`
- `Charts.tsx:213`
- `actionDescription.ts:62`

### 1.5 Popups, hints and messages

| # | Behaviour | Where | Default today | Setting? | Want different? | Class |
|---|---|---|---|---|---|---|
| 33 | (i) boxes, seat cards, chart values and edit-marker cards open on **hover** | `ui.tsx:31-33`, `Hemicycle.tsx:261`, `Charts.tsx:131`, `EditMarker.tsx` (`onMouseEnter`) | Hover, focus or click | No | Yes: hover popups cover content | S |
| 34 | Mini seat-chart previews inside choice lists | `BoardChoices.tsx:16-19`, `Hemicycle.tsx:314`, `LocalityMap.tsx:232` | On | No | Yes (clutter, slow phones) | S |
| 35 | Starter tip "Pick a list. Try a change." (Simple) | `App.tsx:255` | Shown until dismissed; there is no way back | Dismiss only | Yes: bring it back | S |
| 36 | Messages (toasts) disappear after 3.5 s, or 7 s for errors | `store.ts:136-141` | Timed | No | Yes (slow readers; WCAG 2.2.1) | S |
| 37 | Prefer tables / exact figures | `Families.tsx:40-41, 97`; `Charts.tsx:57` (chart first); `Panels.tsx:154` (map first) | Charts and map first; a table preference only in Families | Families → Manage only | Yes (screen readers, people who like numbers) | S (generalised) |

### 1.6 Editing and confirmations

| # | Behaviour | Where | Default today | Setting? | Want different? | Class |
|---|---|---|---|---|---|---|
| 38 | Where added votes come from: ask, other lists, new voters, or one list | `preferences.ts:3-10`, `SourcePicker.tsx:46-95` (the ask), `store.ts:442-497` | Ask (Simple always uses other lists, ADR 0013) | Yes (picker) | Yes | S, plus point-of-use |
| 39 | Remembered answers per list or bloc, per election | `store.ts:95-96, 480-484`, `SourcePicker.tsx:134-160` | none | Listed flat, each with Ask again | n/a | S (management) |
| 40 | Mark differences from the loaded scenario or the official result | `preferences.ts:18-24`, `store.ts:276-282` (asked when a saved scenario opens) | Ask | Yes (picker) | Yes | S, plus point-of-use |
| 41 | Confirm "Start over" (Undo can restore it) | `TopBar.tsx:95`, `Scenarios.tsx:108` | Native confirm | No | Yes (it is undoable) | S |
| 42 | Confirm deleting a saved scenario or voter group | `TopBar.tsx:124`, `Scenarios.tsx:136`, `Turnout.tsx:143` | Native confirm | No | No | F (cannot be undone) |
| 43 | Vote step (1k / 10k / 0.1pp / 1pp) | `ListDetail.tsx:215`, `NumericStepper.tsx:15` | 10k for lists of 500k votes or more, else 1k | No | Yes | R (keep the last step used) |
| 44 | Merge order (interleave) and split order (top) | `Structure.tsx:273, 331` | Interleave, top | No | Rarely | P (part of the edit) |
| 45 | Family scaling mode and amount | `Families.tsx:42` | Multiplier, 10 % | No | n/a | P (part of the edit) |
| 46 | Undo and redo shortcuts (Ctrl+Z / Ctrl+Y) | `App.tsx:105-106` | On | No | No | F |
| 47 | Unsaved work restored on reload | `store.ts:522-590` | On | No | Some | F (prevents lost work; owner decision 4 Nov) |

### 1.7 Opening state, tabs and analyses

| # | Behaviour | Where | Default today | Setting? | Want different? | Class |
|---|---|---|---|---|---|---|
| 48 | Tab shown on opening | `App.tsx:174` (`tool` not saved) | Overview | No | Yes ("where I left off") | S |
| 49 | Compare opens against the previous election (else the official result) | `Compare.tsx:102-111, 143` (`compareWith: 'auto'`, session only) | Previous election | No | Yes | S (coordinate with the V3 Compare lane) |
| 50 | Charts tab view: chart or table | `Charts.tsx:57` | Chart | Per visit | Yes | R, with the first view set by #37 |
| 51 | Localities: map or table, sort, colour by bloc or list | `Panels.tsx:154-156`, `LocalityMap.tsx:88` | Map, registered voters, bloc | Per visit | Yes | R (kept in this browser) |
| 52 | Party families: first family shown | `Families.tsx:35` | Haredi | No | Yes | R (last chosen) |
| 53 | Family mixed-list counting (Show hatched, …) | `Families.tsx:22-24, 50` | The family's own default | Per family, remembered | n/a | P (a view of that family) |
| 54 | Family chips shown or hidden | `Families.tsx:96` | All | Manage | n/a | P (per catalogue) |
| 55 | Seat safety "Votes from" | `SeatSecurity.tsx:38` | Other lists | Per visit | It should follow #38 | R (start from the #38 answer) |
| 56 | Scenario gallery sort | `ScenarioGallery.tsx:18` | Most liked | Per visit | n/a | R |
| 57 | Change line: at most 5 moves listed | `ChangeSummary.tsx:23` | 5, then "+N" | No | No | F (truth label; the full list opens on demand) |
| 58 | Coalitions: the 24 smallest winning coalitions | `SeatSecurity.tsx:223` and the Coalitions view | 24 | No | No | F (the order is the meaning) |

### 1.8 Truth labels and identity (listed so that nothing is missed; all fixed)

| # | Behaviour | Where | Class |
|---|---|---|---|
| 59 | Edit markers ("Edited: was X") and their glyph | `EditMarker.tsx` | F: mark every edit |
| 60 | Scenario identity tint, the top-bar chip, the official result's neutral colour | `App.tsx:186`, `scenarioIdentity.ts` | F: never hideable (scenario-reference doc §2–3) |
| 61 | Gains and losses: ▲ green / ▼ red, with sign | `SeatDelta.tsx`, `format.ts:52` | F: owner rule; readable without colour |
| 62 | Hebrew graphics read left to right | throughout | F: owner rule |
| 63 | Tie and lottery notices | `Walkthrough.tsx:301-306, 357`, `Panels.tsx:77` | F: correctness |
| 64 | Publication status, data qualifications, exact or sampled | `ElectionContext.tsx`, `TopBar` "Not yet verified" | F: `TRUTH_LABELS` in `features.ts` |
| 65 | Party and bloc colours, display labels | appearance actions | P: per election, saved with the official result (scenario-reference doc §2, class C) |
| 66 | Bloc grouping in force | `BoardChoices.tsx` | P: per scenario (class B) |
| 67 | Rules: historical or experimental | `Panels.tsx:64-71` | P: per scenario (class A) |

---

## 2. Classification and reasons

### 2.1 Global settings (go in the popup)

All the **S** rows above: 1–5, 8, 10–16, 19–22, 24, 25 (through 33), 29, 33–41, 48, 49.

### 2.2 Fixed, with the reason

| Behaviour | Reason |
|---|---|
| Edit markers, scenario tint and chip, outlines on changed seats, the "Since …" line | **Mark every edit.** Truth labels are never hideable, at any level or in Custom. |
| ▲▼ colours with sign, LTR graphics, the official neutral colour | Owner rules. Accessibility: they are readable without colour. |
| Tie, lottery, publication and qualification notices | Correctness is non-negotiable. |
| Delete confirmations | Irreversible. Start over is reversible, so it gets a setting. |
| Full numbers, Western digits, locale dates | The product's value is exactness. Short forms appear only on chart axes. |
| Bloc order and party colours as presented | Neutrality: as sourced and as the parties presented themselves. |
| Simple uses "other lists" for added votes | ADR 0013. The setting is not shown at Simple, and Simple's behaviour is stated there. |
| Restoring unsaved work on reload | Prevents lost work (owner decision, 4 November). |
| Undo and redo shortcuts, 200-step history | Basic function. |
| Analysis orders (smallest coalitions first, closest seats first) | The order is the meaning of the view. |

### 2.3 Per-election or per-scenario choices (they stay where they are made; not in Settings)

These stay where they are made:

- one joint list counted by party;
- a party's own bloc;
- the bloc grouping;
- list, party and bloc colours;
- rules mode;
- lottery outcomes;
- merge and split options;
- family scaling;
- family mixed-list counting;
- the scenario's identity colour.

These are saved, shared or undone with the scenario (or, for appearance, with that election). Settings only holds their
**global starting point** where one exists: #8 for joint lists.

### 2.4 Remembered automatically at the tool (no setting)

These need no setting, because people expect the app to keep the last choice:

- the vote step;
- Localities' view, sort and colour;
- Charts' view within a visit;
- the last family chosen;
- the gallery sort;
- Seat safety starting from the "Votes come from" answer.

A setting for each of these would be bureaucracy.

**Density is not added.** The owner finds the app dense already. Text size (§3) is the readability lever, and a
compact mode would make the screens denser still.

### 2.5 Considered and not proposed

- **Hebrew-calendar dates beside Gregorian dates.** Pleasant, but it is new content rather than taste over existing
  behaviour. Park it.
- **Colour-blind palette for parties.** Party colours are data, presented as the parties presented them. The non-colour
  cues already exist (logos, letters, keys, ▲▼ signs).
- **"Short numbers (1.2M)".** This conflicts with exactness.
- **A "don't restore my work" switch.** It risks silent loss of work.

---

## 3. The new Settings design

### 3.1 How visibility by level works

Every setting has a minimum level, and some are tied to a feature in `features.ts`.

- **A level shows its own settings and those of lower levels.**
  - Simple shows 17 rows.
  - Standard shows 28: it adds 12 rows and drops the Simple-only starter tip.
  - Expert shows the same 28; it only widens the decimal-places choice. Its depth lives in its tools.
- **Custom** shows the settings of its base level, plus any setting whose owning feature the user set to *Show* on the
  Custom page. For example, Custom based on Simple with *Chamber options* shown also gets the Seat chart group.
- **A hidden setting keeps working with its value.** Its value is never reset by switching level.
- **Some defaults follow the level** (marked "by level" below). Such a setting follows the level until the user
  changes it. From then on the user's value applies at every level.
- **Search (§4) finds every setting at every level.** A result from a higher level carries a small level tag and works
  normally: levels hide depth, never existence.
- **Footer at Simple only.** One quiet line: "12 more in Standard" ("עוד 12 ברמת רגיל").
  This mirrors the tab strip's "More in other levels". Pressing it opens a collapsed group, *More settings* /
  *הגדרות נוספות*, at the end of the popup. Nothing else changes. (Taste call: open question Q3.)

### 3.2 Popup structure (top to bottom)

1. **Header** (sticky):
   - the title **Settings** / **הגדרות**;
   - an (i) saying "Kept in this browser for every election. Not part of scenarios, undo or share links." /
     "נשמרות בדפדפן זה לכל הבחירות. אינן חלק מתרחישים, מהביטול או מקישורי שיתוף.";
   - the Close button ×;
   - the search field (§4);
   - the group chips (§4).
2. **Detail level**, the first row of the body. It sits first because it decides what the rest shows.
3. The groups, in this order:
   - A. General
   - B. Lists & parties
   - C. Seat chart
   - D. Numbers
   - E. Editing
   - F. Analysis
   - G. Accessibility
4. **Footer**:
   - "12 more in Standard" (Simple only);
   - **Reset all settings** / **איפוס כל ההגדרות**.

All changes apply live; there is no Save button. The page behind updates while the popup stays open.

### 3.3 The settings

Level column:

- **All** = Simple, Standard, Expert and Custom.
- **Std+** = Standard and Expert, plus Custom when its owning feature is shown.

Control rules:

- A **toggle** is used for anything on/off. Its label states what *on* means.
- A **segmented** control is used for 2–4 options.
- A **select** is used only for many options.
- An (i) is given for every setting except Language.

#### Top of body

| ID | Label EN / HE | Control | Options EN / HE | Default | Levels | Why this control |
|---|---|---|---|---|---|---|
| `level` | Detail level / רמת פירוט | Segmented + link | Simple · Standard · Expert / פשוט · רגיל · מומחה; then a **Custom…** link / **מותאם…** that opens the Custom page and closes Settings | Simple | All | 3 options plus a page |

(i) for `level`:

- EN: "Decides which tools and settings are shown. Switching hides nothing you made: hidden edits and settings keep
  working."
- HE: "קובעת אילו כלים והגדרות מוצגים. המעבר אינו מוחק דבר: עריכות והגדרות מוסתרות ממשיכות לפעול."

#### A. General / כללי

| ID | Label EN / HE | Control | Options EN / HE | Default | Levels | Why |
|---|---|---|---|---|---|---|
| `lang` | Language / שפה | Segmented | עברית · English | Hebrew | All | 2 options. It stays in the top bar too (point of use). |
| `theme` | Theme / מראה | Segmented | Device · Light · Dark / לפי המכשיר · בהיר · כהה | **Device** (new) | All | 3 options. The top-bar sun/moon stays as a quick switch and sets Light or Dark. |
| `starterTip` | Starter tip / טיפ פתיחה | Toggle | On = the tip shows on the Overview | On until dismissed | Simple (the tip exists only there) | On/off |

(i) for `theme`:

- EN: "Device follows your phone or computer, also when it changes at night."
- HE: "לפי המכשיר: כמו בטלפון או במחשב, גם כשזה משתנה בלילה."

(i) for `starterTip`:

- EN: "The one-line tip at the bottom of the Overview. Turn it on to see it again."
- HE: "השורה בתחתית תמונת המצב. הפעילו כדי לראות אותה שוב."

#### B. Lists & parties / רשימות ומפלגות

| ID | Label EN / HE | Control | Options EN / HE | Default | Levels | Why |
|---|---|---|---|---|---|---|
| `listSymbol` | List symbol / סמל הרשימה | Segmented | Logo · Ballot letters / סמל · אותיות הפתק | Logo | All | 2 options |
| `jointByParty` | Joint lists by party / רשימות משותפות לפי מפלגה | **Toggle** (the owner's example) | On / Off | Off | All | On/off |
| `partyColourInSeats` | Party colour in seats / צבע המפלגה במושבים | Toggle, indented under `jointByParty` | On / Off | On | All | On/off. It stays **enabled** when `jointByParty` is off, because it also applies to lists you count by party one at a time. Its (i) says so. |
| `seatlessParties` | Parties with no seats / מפלגות ללא מנדטים | Toggle (on = shown) | On / Off | **Off** (Q2) | All | On/off |
| `seatlessLists` | Lists with no seats / רשימות ללא מנדטים | Segmented | Over 0.5% · All · Folded / מעל 0.5% · כולן · מקופלות | Over 0.5% (today's behaviour) | All | 3 options |
| `withdrawnLists` | Lists that withdrew / רשימות שפרשו | Toggle (on = shown) | On / Off | On | Std+ | On/off |
| `listOrder` | Order lists by / סדר הרשימות | Segmented | Seats · Bloc / מנדטים · גוש | Seats | Std+ | 2 options |
| `voteCounts` | Vote counts / מספרי קולות | Toggle (on = shown) | On / Off | By level: Off at Simple, On above Simple | Std+ | On/off |

(i) texts for group B:

- `listSymbol`
  - EN: "Logo: the symbol the list used at that election, where one is verified; otherwise its ballot letters.
    Ballot letters: always the letters printed on the ballot slip."
  - HE: "סמל: הסמל שהרשימה השתמשה בו באותן בחירות, כשאומת; אחרת אותיות הפתק. אותיות הפתק: תמיד האותיות שעל הפתק."
- `jointByParty`
  - EN: "Shows each party on a joint list as its own faction in the chamber, blocs and list column. Votes and seats
    don't change. You can still switch one list on its own page. Saved scenarios keep the choice they were made
    with."
  - HE: "כל מפלגה ברשימה משותפת מוצגת כסיעה נפרדת במליאה, בגושים וברשימות. הקולות והמנדטים אינם משתנים. אפשר עדיין
    להחליף רשימה אחת בעמוד שלה. תרחישים שמורים שומרים את הבחירה שאיתה נשמרו."
- `partyColourInSeats`
  - EN: "For a list counted by party, each seat shows its party's colour inside the list's colour. Off: list colour
    only."
  - HE: "ברשימה שנספרת לפי מפלגה, כל מושב מציג את צבע המפלגה בתוך צבע הרשימה. כבוי: צבע הרשימה בלבד."
- `seatlessParties`
  - EN: "Parties that ran inside a joint list but had no one elected, for example Atid Ehad and Eretz Yisrael
    Shelanu in Religious Zionism, 2022. Off: they are left out of seat breakdowns. On a list's own page they stay
    one tap away, so they can still be given a bloc or split off."
  - HE: "מפלגות שרצו ברשימה משותפת ולא נבחר מטעמן איש, למשל עתיד אחד וארץ ישראל שלנו בציונות הדתית, 2022. כבוי:
    הן אינן מוצגות בפירוט המנדטים. בעמוד הרשימה הן במרחק לחיצה, כדי שעדיין אפשר יהיה לשייך אותן לגוש או לפצל
    אותן."
- `seatlessLists`
  - EN: "How many lists below the threshold the list column shows at first. 'Show all' under the column still
    opens the rest. A list you changed is always shown."
  - HE: "כמה רשימות שמתחת לאחוז החסימה מוצגות בהתחלה. 'הצגת הכול' בתחתית עדיין פותח את השאר. רשימה ששיניתם מוצגת
    תמיד."
- `withdrawnLists`
  - EN: "Lists that withdrew before election day received no votes. Off: they are left out of lists and charts.
    Sources still name them, and a list you withdrew in a scenario is always shown."
  - HE: "רשימות שפרשו לפני יום הבחירות לא קיבלו קולות. כבוי: הן אינן מוצגות ברשימות ובתרשימים. המקורות עדיין
    מציינים אותן, ורשימה שסימנתם כפורשת בתרחיש מוצגת תמיד."
- `listOrder`
  - EN: "Bloc: lists in the same order as the seats in the chamber, bloc by bloc."
  - HE: "גוש: הרשימות באותו סדר כמו המושבים במליאה, גוש אחר גוש."
- `voteCounts`
  - EN: "Shows the number of votes next to each list's share."
  - HE: "מציג את מספר הקולות ליד אחוז הקולות של כל רשימה."

What each Lists & parties setting applies to. This is the generalisation; the implementer must cover every outlet.

- **`seatlessParties`:**
  - the list column's party rows (`ListBars.tsx:120-133`);
  - the bloc editor's party units (`BlocPanel.tsx:66-67`);
  - Compare's party breakdowns (V3 lane: give it the same rule);
  - the joint-list page (`JointParties.tsx:84-97`). Here, when the setting is Off, the zero rows fold behind one line,
    "+2 with no seats" / "‏+2 ללא מנדטים", so they are never unreachable;
  - the chamber key, which already hides them; it keeps doing so.
- **`seatlessParties` never hides** a party that the user edited, or that holds a seat in the current scenario. Mark
  every edit wins.
- **`seatlessLists` and `withdrawnLists`:**
  - the list column;
  - Charts' list rows;
  - Seat safety and Sensitivity pickers (which already sort by votes).

  They never apply to:
  - Sources;
  - the "votes with no seat" figure and its drill-down. That is a truth figure, and it must keep every list counted.
- **`listSymbol`:** every `Slip` (`ui.tsx:47-70`). Generated icons for merged, split or new lists are unchanged,
  because they are already built from the letters.
- **`jointByParty`:** keeps today's mechanics (`setFactionDefault`; saved scenarios keep their encoded baseline). The
  joint-list page keeps both of its switches:
  - the per-list switch, "Count seats by party" (a scenario edit, marked);
  - "Use for all joint lists", which is this same setting, mirrored at the point of use.

#### C. Seat chart / תרשים המליאה (Std+)

| ID | Label EN / HE | Control | Options EN / HE | Default | Why |
|---|---|---|---|---|---|
| `chamberLayout` | Layout / פריסה | Segmented | Arc · Blocks / קשת · גושים | Arc | 2 options |
| `seatColour` | Colour seats by / צביעת מושבים לפי | Segmented | List · Bloc · Party / רשימה · גוש · מפלגה | List | 3 options |
| `blocShading` | Bloc backgrounds / רקע לגושים | Toggle | On / Off | On | On/off |
| `referenceChamber` | Comparison chamber / מליאת השוואה | Toggle | On / Off | On | On/off |
| `chamberKey` | List key / מקרא הרשימות | Toggle | On / Off | On | On/off |

Changes from today:

- `chamberLayout` and `seatColour` are **saved** in this browser (today they reset on reload).
- They now show from **Standard**, not Expert.
- The inline controls on the chamber stay as the point of use, now from Standard. They are **the same setting**: one
  source of truth, so changing either place changes both. Simple users get Arc, colour by list, shading on,
  comparison chamber on and the key on (today's look).

(i) texts for group C:

- `seatColour`
  - EN: "Party colours seats by the party each member belongs to, also inside joint lists."
  - HE: "מפלגה: צביעת כל מושב לפי מפלגת חבר הכנסת, גם בתוך רשימות משותפות."
- `blocShading`
  - EN: "The tinted areas and lines that group seats into blocs. Off: seats only."
  - HE: "האזורים הצבועים והקווים שמקבצים מושבים לגושים. כבוי: מושבים בלבד."
- `referenceChamber`
  - EN: "When seats change, a small chamber of the official result (or the opened scenario) appears beside the main
    one. Off: outlines on the main chamber still mark gained seats."
  - HE: "כשמנדטים משתנים, מליאה קטנה של התוצאה הרשמית (או התרחיש שנפתח) מופיעה ליד המליאה הראשית. כבוי: מתארים
    במליאה הראשית עדיין מסמנים מושבים שנוספו."
- `chamberKey`
  - EN: "The row of lists under the seats. The list column beside it names every list either way."
  - HE: "שורת הרשימות מתחת למושבים. עמודת הרשימות שלידה מציגה את כל הרשימות בכל מקרה."

#### D. Numbers / מספרים

| ID | Label EN / HE | Control | Options | Default | Levels | Why |
|---|---|---|---|---|---|---|
| `decimals` | Decimal places / ספרות אחרי הנקודה | Simple and Standard: **segmented** 1 · 2 · 3. Expert: a **select** with 0, 1, 2, 3, 4, 6 and 8. | numerals | **By level: 1 at Simple, 2 at Standard and Expert** (Q1) | All | The segmented control covers the common range. A value outside it (for example 6, chosen at Expert) shows as an extra pressed segment "6", so the state is never hidden. Seven options at Expert justify a select. |

(i) for `decimals`:

- EN: "For vote shares everywhere. Figures are computed exactly; this only sets how they are shown. A share just
  under the threshold is never rounded up to it."
- HE: "לאחוזי הקולות בכל מקום. החישוב מדויק; ההגדרה קובעת רק את התצוגה. אחוז שמעט מתחת לאחוז החסימה לעולם אינו
  מעוגל אליו."

Rules that come with `decimals`:

- **One value applies at every level.** The "forced 2 below Expert" rule (`store.ts:503-505`) ends.
- **It applies everywhere a vote share is shown**, including the hard-coded sites in §1.4 #30. Chart axis ticks keep
  their own fixed format.
- **Correctness rule: a rounded share never lands on the wrong side of the threshold.** Shares are rounded half up
  (`rational.ts:56-61`), which can mislead in two ways:
  - a list just below the threshold can look as if it reached it: 1.46 % shows "1.5%" at 1 decimal, against the
    1.5 % threshold of 1992–2003;
  - a list that passed can look as if it fell short: 3.4 % shows "3%" at 0 decimals, against 3.25 %.

  So, for a share near the threshold, the formatter adds digits until the shown number is on the correct side:
  - below the threshold for a list that did not pass;
  - at or above it for a list that passed.

  Add a unit test for both directions at every era's threshold (1 %, 1.5 %, 2 %, 3.25 %) and every decimal option.

#### E. Editing / עריכה

| ID | Label EN / HE | Control | Options EN / HE | Default | Levels | Why |
|---|---|---|---|---|---|---|
| `voteSource` | Votes come from / הקולות מגיעים מ־ | Segmented | Ask · Other lists · New voters / לשאול · שאר הרשימות · מצביעים חדשים. When "Always: one list" was remembered, a 4th pressed segment shows that list's name. | Ask | Std+ (Simple always uses Other lists; ADR 0013) | 3 or 4 options |
| `markChanges` | Mark changes since / סימון שינויים מאז | Segmented | Ask · Opened scenario · Official result / לשאול · התרחיש שנפתח · התוצאה הרשמית | Ask | All | 3 options |
| `confirmStartOver` | Confirm start over / אישור לפני התחלה מחדש | Toggle | On / Off | On | All | On/off |
| *(block)* | Remembered answers / תשובות שמורות | Disclosure list | see §3.5 | none | Where its question shows | n/a |

(i) texts for group E:

- `voteSource`
  - EN: "When you add or remove votes. Other lists: taken from all of them in proportion; turnout stays the same.
    New voters: turnout changes. Ask: you choose at each edit, and can remember the answer for one list or bloc."
  - HE: "כשמוסיפים או מורידים קולות. שאר הרשימות: מכולן באופן יחסי; ההצבעה לא משתנה. מצביעים חדשים: ההצבעה
    משתנה. לשאול: בוחרים בכל עריכה, ואפשר לזכור את התשובה לרשימה או לגוש."
- `markChanges`
  - EN: "Opened scenario: after you open a saved scenario, only your newer changes are marked. Official result:
    every difference from the election is marked."
  - HE: "התרחיש שנפתח: אחרי פתיחת תרחיש שמור, מסומנים רק השינויים החדשים. התוצאה הרשמית: מסומן כל הבדל מתוצאות
    הבחירות."
- `confirmStartOver`
  - EN: "Asks before clearing all your changes. Undo can always restore them."
  - HE: "שאלה לפני מחיקת כל השינויים. תמיד אפשר לשחזר עם ביטול."

#### F. Analysis / ניתוח (Std+)

| ID | Label EN / HE | Control | Options EN / HE | Default | Why |
|---|---|---|---|---|---|
| `compareWith` | Compare with / השוואה מול | Segmented | Previous election · Official result / הבחירות הקודמות · התוצאה הרשמית | Previous election | 2 options. Coordinate with the V3 lane's new Compare screen: this sets only what it opens against. |
| `openOn` | Open on / פתיחה ב־ | Segmented | Overview · Last tool / תמונת מצב · הכלי האחרון | Overview | 2 options |
| `optionPreviews` | Option previews / תצוגה מקדימה באפשרויות | Toggle | On / Off | On | On/off |

(i) texts for group F:

- `compareWith`
  - EN: "What the Compare screen shows on the other side when it opens. You can change it there at any time."
  - HE: "מה מוצג בצד השני כשמסך ההשוואה נפתח. אפשר לשנות שם בכל עת."
- `openOn`
  - EN: "Where the app opens. Your unsaved work is restored either way."
  - HE: "היכן היישום נפתח. העבודה שלא נשמרה משוחזרת בכל מקרה."
- `optionPreviews`
  - EN: "Small seat charts beside each choice when picking a grouping or colouring. Off: names only, faster on slow
    phones."
  - HE: "תרשימי מושבים קטנים ליד כל אפשרות בבחירת חלוקה או צביעה. כבוי: שמות בלבד, מהיר יותר בטלפונים איטיים."

#### G. Accessibility / נגישות (All, never hidden by level, because access must not depend on expertise)

| ID | Label EN / HE | Control | Options EN / HE | Default | Why |
|---|---|---|---|---|---|
| `textSize` | Text size / גודל טקסט | Segmented | Normal · Large / רגיל · גדול | Normal | 2 options. Large = ×1.15 through a root variable. Charts keep their geometry. |
| `motion` | Animation / אנימציה | Segmented | Device · On · Off / לפי המכשיר · פועלת · כבויה | Device | 3 options |
| `hoverPopups` | Popups on hover / חלוניות במעבר עכבר | Toggle | On / Off | On | On/off |
| `preferTables` | Tables instead of charts / טבלאות במקום תרשימים | Toggle | On / Off | Off | On/off |
| `keepMessages` | Keep messages open / הודעות נשארות פתוחות | Toggle | On / Off | Off | On/off |

How each Accessibility setting is implemented:

- **`motion`.** Off sets `data-motion="off"` on the root, and every `prefers-reduced-motion` rule also matches that
  attribute. On ignores the device's request.
- **`hoverPopups`.** It applies to all of these:
  - Info (i);
  - the seat card;
  - chart value tips;
  - edit-marker cards;
  - choice-option title tips.

  Off makes each of them click or tap only. Focus still opens them for keyboard users. Touch is always tap.
- **`preferTables`.** It sets the first view of:
  - Charts (`Charts.tsx:57`);
  - Families' exact figures, which open expanded (`Families.tsx:40-41`);
  - Localities (`Panels.tsx:154`);
  - any future view with a table twin.

  Each page keeps its own switch. The Families → Manage checkbox becomes a mirror of this setting.
- **`keepMessages`.** On means toasts stay until closed. Errors already stay 7 s; with the setting on, they stay too.

(i) texts for group G:

- `motion`
  - EN: "Device follows your system's 'reduce motion' choice. Off stops moving bars, seats and scrolling."
  - HE: "לפי המכשיר: לפי הגדרת 'הפחתת תנועה' במערכת. כבויה: ללא תנועה של עמודות, מושבים וגלילה."
- `hoverPopups`
  - EN: "Info (i), seat details and chart values open when the pointer rests on them. Off: they open on click
    only. Touch screens always use tap."
  - HE: "מידע (i), פרטי מושב וערכי תרשים נפתחים כשהעכבר עליהם. כבוי: רק בלחיצה. במסכי מגע תמיד בהקשה."
- `preferTables`
  - EN: "Charts, party-family history and the locality map open as tables of exact figures. Useful with a screen
    reader. Each page can still switch."
  - HE: "תרשימים, היסטוריית משפחות המפלגות ומפת היישובים נפתחים כטבלאות של נתונים מדויקים. שימושי עם קורא מסך.
    כל עמוד עדיין ניתן להחלפה."
- `keepMessages`
  - EN: "Short messages, such as 'Saved', stay until you close them."
  - HE: "הודעות קצרות, כמו 'נשמר', נשארות עד שסוגרים אותן."

### 3.4 What each level sees

| Group | Simple | Standard | Expert |
|---|---|---|---|
| Top | Detail level | same | same |
| General | Language, Theme, Starter tip | Language, Theme | Language, Theme |
| Lists & parties | List symbol, Joint lists by party, Party colour in seats, Parties with no seats, Lists with no seats | + Lists that withdrew, Order lists by, Vote counts | same as Standard |
| Seat chart | n/a (defaults: arc, by list, shading, comparison chamber, key) | all 5 | all 5 |
| Numbers | Decimal places 1·2·3 (default 1) | 1·2·3 (default 2) | Select, 0–8 (default 2) |
| Editing | Mark changes since, Confirm start over | + Votes come from | same |
| Analysis | n/a (defaults: previous election, Overview, previews on) | all 3 | all 3 |
| Accessibility | all 5 | all 5 | all 5 |
| Count | 17 | 28 | 28 (Expert's depth lives in its tools, not in more settings) |

### 3.5 Remembered point-of-use answers

**At the edit (the ask dialog)**, following the owner's 5 November comment "separate buttons … instead of the
checkmark":

- The question's answers are **buttons**: "Other lists", "New voters", and a "One list…" select for the long list.
- One press applies the answer.
- Above the buttons, a small segmented control picks the scope: **This time · This list · Always** /
  **הפעם · לרשימה זו · תמיד**. The middle option reads "This bloc" or "This scenario" where it applies, and the default
  is This time.
- A link closes the dialog: **Change in Settings** / **שינוי בהגדרות**. It opens Settings scrolled to that question,
  with the row highlighted for 1 s (no highlight animation when motion is off).

**In Settings**, under its own question, not in a separate place:

- A disclosure line "Remembered for 3 lists ▸" / "‏נשמר ל־3 רשימות ▸" appears only when such answers exist. It is
  collapsed by default, so Settings stays short.
- Each row reads, for example, "Likud (2022): Other lists" with an **Ask again** / **לשאול שוב** button. Bloc and
  scenario answers read the same way.
- A **Forget all** / **מחיקת הכול** button empties the question's per-item answers. It applies at once, and an Undo
  toast lets you take it back.
- Choosing a fixed answer (not "Ask") for the question clears its per-item answers (today's behaviour). The
  disclosure says so in its (i).

  (i) for the disclosure: EN "An answer you chose with 'This list'. It applies only to that list in that
  election." / HE "תשובה שבחרתם עם 'לרשימה זו'. חלה רק על הרשימה הזו בבחירות האלה."
- "This scenario" answers to *Mark changes since* are session-only today. They appear in the same list while they
  last, labelled "(this visit)" / "(ביקור זה)".

### 3.6 Reset

| Scope | Where | Behaviour |
|---|---|---|
| One group | A **Reset** / **איפוס** link at the end of the group heading | Resets only that group's settings to their defaults (level defaults where they apply). Its space is always reserved (`visibility:hidden` when nothing differs), so headings never shift. |
| All settings | **Reset all settings** at the popup's foot | Applies at once and shows a toast "Settings reset · Undo" / "ההגדרות אופסו · ביטול". There is no confirm dialog, because Undo exists. It does **not** reset Language or Detail level (resetting them would change the screen under the user's feet), nor remembered answers. Its (i) says so. |
| Remembered answers | **Forget all**, per question (§3.5) | Separate from settings. |
| A setting changed from its default | A small dot before the label (aria: "changed") | This helps scan what is personal. It is not an edit marker, because settings are not scenario edits. |

---

## 4. Finding a setting fast, and layout

### 4.1 Search and scanning

- **Search field** at the top of the popup: "Find a setting" / "חיפוש הגדרה". It filters as you type.
  - It matches the labels and option labels in **both languages** (a Hebrew user typing "logo" or an English user
    typing "לוגו" both find List symbol).
  - It matches the (i) text.
  - It matches a short synonym list per setting:
    - "dark, night, light" → Theme;
    - "font, bigger" → Text size;
    - "zero, 0 seats, empty" → Parties with no seats and Lists with no seats;
    - "animation, moving" → Animation;
    - "percent, %" → Decimal places;
    - "tooltip, hover" → Popups on hover;
    - "ballot, letters, symbol" → List symbol;
    - "arc, hemicycle" → Layout;
    - "default" → Joint lists by party and every "Ask" setting.
  - Results keep their group headings. Results from a higher level carry a quiet level tag ("Standard").
  - With no matches: "No setting matches" / "לא נמצאה הגדרה".
- **Group chips** under the search: General · Lists · Seat chart · Numbers · Editing · Analysis · Accessibility. A chip
  scrolls **the popup body** to its group, never the page. Chips for groups not shown at this level are not drawn.
- **Deep links from the point of use.** Every inline mirror of a setting can open Settings at that row:
  - the joint-list page's "Use for all joint lists";
  - the chamber toolbar (a small gear after its controls);
  - the ask dialog's "Change in Settings";
  - Families → Manage "Tables";
  - the Rules tab.
- **Rename the "Rules & settings" tab to "Rules"** (`features.ts`, `rules`). App settings no longer live there; its
  "Your settings…" button (`Panels.tsx:139`) stays as a link to the popup.

### 4.2 Desktop (1024 px and wider)

- A centred modal (native `<dialog>`, as today), `inline-size: min(40rem, 100vw - 32px)`,
  `max-block-size: calc(100dvh - 48px)`.
- The header (title, search, chips) is sticky. The body scrolls independently, with `overscroll-behavior: contain`.
  The page behind keeps its scroll position.
- **One row per setting:**
  - label and (i) at the start, the control at the end;
  - toggles align in one column;
  - segmented controls are right-aligned (left-aligned in Hebrew).
- **Row height** is 40 px for toggles and 44 px for segmented controls.
- Close by ×, Escape, or a press on the backdrop. Focus returns to the gear.

### 4.3 Phone (390 px)

- A full-screen sheet: `inset: 0`, `100dvh`, safe-area padding.
- The header stays sticky:
  - the title, and × (44 px target);
  - the search below;
  - the chips as one horizontally scrolling row.
- **Toggle rows**: the whole row is the tap target, with the label wrapping beside the switch.
- **Segmented controls** sit on their own line under the label. This is decided by width class, not by measuring text,
  so nothing reflows when the language or text size changes.
- Segments share the width equally, with a 44 px minimum height.
- Expert's decimals select is full width.
- Optional: the phone top bar currently stacks three rows (screenshot `phone-expert-board.png`). With Theme in
  Settings, the top-bar theme button can move into Settings at widths of 600 px or less, saving one control in the
  header. Language stays in the top bar.

### 4.4 No jumps

- **Settings apply live, but rows never move under the pointer.**
- **Switching Detail level** re-filters the rows *below* the level control only. The control itself stays where it
  is.
- **A dependent setting** (Party colour in seats) is never removed. Its parent's state does not hide it.
- **Group Reset links reserve their space.** Remembered-answer disclosures open downward only.
- **Text size Large** grows the popup's text too. The row the pointer pressed is kept in view by anchoring the scroll
  to it (`scrollTop` corrected by the row's offset change in one frame).
- **The ask dialog's scope control** has a fixed width, sized for its longest label in both languages.
- **The popup has a fixed width per breakpoint.** It never resizes with its content.

---

## 5. Migration (no one loses a choice)

### 5.1 Storage model

- Keep **one registry**, `SETTINGS`, in `src/app/preferences.ts`, which extends today's `PREFERENCES`. Each entry has:
  - an `id` and a group;
  - its labels and (i) text in both languages;
  - its control and options;
  - a default (a value, or a by-level map);
  - a minimum level;
  - an optional owning feature;
  - its synonyms.
- **Store the values sparsely** in a new key, `israel-elections:settings` (`{ v: 2, values: {…} }`). Only a value the
  user has set is written, so level defaults and future default changes reach untouched settings.
- **Migration runs once**, when `v: 2` is absent. It reads the old keys and writes the new object. **The old keys are
  left in place**, so a rollback to the previous build still finds them.
- **Unknown or invalid values fall back to the default**, without error.
- **Unit tests check the registry:**
  - every setting has EN and HE labels, an (i) unless marked obvious, a group and at least one level;
  - every option has both languages;
  - every point-of-use question is a setting.

### 5.2 Mapping

| Old storage | Old value | New setting | New value | Note |
|---|---|---|---|---|
| `israel-elections:v1`.`lang` | `he` / `en` | `lang` | same | It stays where it is (it is also read before the settings load). |
| `…v1`.`theme` | `light` / `dark` | `theme` | the same value, **explicit** | Today the theme is written on every visit, so a deliberate choice cannot be told apart from the first-visit device value. Keeping it explicit preserves what everyone sees. New users get Device. |
| `…v1`.`level`, `customFeatures` | unchanged | `level` | unchanged | The legacy `explore`/`advanced` migration (`store.ts:22`) stays. |
| `…v1`.`hintDismissed` | `true` | `starterTip` | `false` | |
| `…v1`.`digits` | `2` | `decimals` | *not set* (follows the level) | 2 equals the level default above Simple. A Simple user saw 2 before and will see 1 (Q1). |
| `…v1`.`digits` | any other value (0, 1, 3, 4, 6, 8) | `decimals` | the same value, explicit | It was set deliberately at Expert. It now applies at every level, which is a deliberate change; the release note says so. |
| `…v1`.`showComponentSeats` | `false` | `partyColourInSeats` | `false` | `true` or absent stays the default. |
| `…v1`.`markOfficial` | boolean | stays as state | n/a | It is still driven by `markChanges` (`store.ts:279`). |
| `israel-elections:preferences`.`voteSource` | `new` / `proportional` / `t:<id>` | `voteSource` | same | |
| `israel-elections:preferences`.`jointSeats` | `on` / `off` | `jointByParty` | `true` / `false` | `setFactionDefault` keeps working. |
| `israel-elections:preferences`.`comparison` | `reference` / `official` | `markChanges` | same | |
| `israel-elections:vote-source` (oldest) | `new` / `proportional` | `voteSource` | same | Already folded in by `store.ts:98`. Keep that fallback. |
| `israel-elections:item-preferences` | per-item answers | unchanged key and format | n/a | Shown under their questions (§3.5). |
| `israel-elections:families:exact` | `true` | `preferTables` | `true` | The user asked for tables for accessibility, so the generalised setting honours that intent. Families → Manage now mirrors it. |
| `israel-elections:families:policy` | per family | unchanged | n/a | A per-family view, not a setting (§2.3). |
| layout and colour-by (not saved today) | n/a | `chamberLayout`, `seatColour` | defaults | There is nothing to migrate. From now on they are saved. |
| `families:v`, `voter-groups`, `analysis:v`, `gallery:*`, `workspace:v1`, `appearance:<id>` | n/a | untouched | n/a | Data, not settings. |

---

## 6. Open questions for the owner (taste only)

1. **Decimals at Simple.** Should Simple default to 1 decimal place (Standard and Expert stay at 2)? Your 6 November
   note said simple modes don't need long decimals.
   *Recommendation: yes, 1 at Simple.* The threshold rule in §3.3-D keeps it from ever misleading.
2. **Parties with no seats: off by default?** Your words suggest they "arguably don't matter".
   *Recommendation: off.* They stay one tap away on the list's own page, so they can still be given a bloc or split
   off.
3. **Settings from higher levels at Simple.** Should Simple show one quiet line, "12 more in Standard", that
   opens them in place? The alternative is no hint at all; search would still find them.
   *Recommendation: the one line.* It matches the tab strip's "More in other levels" and the rule that levels hide
   depth, never existence.
4. **Theme for new visitors.** Should it follow the device, including changes at night, or stay fixed at the first
   visit's value as today?
   *Recommendation: follow the device.* Existing users keep exactly what they see now.

---

## 7. Notes for the implementer (scope boundaries)

- **V1 lane: the seat-chart bloc shading.** It owns how the shading looks; this spec adds only `blocShading` on/off.
- **V3 lane: Compare.** It owns the Compare screen; `compareWith` sets only its starting side, and `seatlessParties`
  must reach Compare's party rows.
- **Tests to add:**
  - the registry unit tests (§5.1);
  - the migration unit test, covering every row of §5.2;
  - threshold rounding at every era's threshold (§3.3-D).
- **E2e checks:**
  - each level's visible set (§3.4);
  - Custom showing Seat chart once *Chamber options* is shown;
  - search in both languages;
  - the deep link from the ask dialog;
  - no layout shift when toggling (measure the bounding box of the pressed control before and after);
  - 390 px sheet behaviour;
  - `seatlessParties` across the list column, joint-list page and bloc editor at k25 (Religious Zionism with "Joint
    lists by party" on: Atid Ehad and Eretz Yisrael Shelanu hidden, then shown).
