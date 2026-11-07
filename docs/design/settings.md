# Settings: merged design

7 November 2026. This document merges two independent designs, written the same day:

- the Claude design (a 67-behaviour inventory);
- the Codex design (42 settings).

Both are kept outside the repository, under `.backup-scratch/brief-1107/`. This document is what the code implements.

The coordinator set some defaults. Each is marked **(coord.)**, and each is one registry value in
`src/app/settings.ts`, so the owner can change it later.

## 1. Principles

- **One registry, `SETTINGS`** in `src/app/settings.ts`, holds every setting. Each entry has:
  - an id and a group;
  - its labels, options and (i) text in English and Hebrew;
  - its control;
  - its default, which is either a value or a map by level;
  - its levels, and an optional owning feature;
  - search synonyms.

  The popup, the search, the resets, the Simple hint and the unit tests all read this registry.
- **Settings apply live.** There is no Save button.
- **Settings are never scenario edits.** They are not undone, saved or shared with a scenario.
- **A hidden setting keeps working.** A setting can be hidden by the level or by Custom, and its value still applies.
  Switching level never resets a value.
  - This replaces the old rule that forced 2 decimals and the arc/list chamber below Expert.
  - It does not replace ADR 0013. At Simple, vote edits are still balanced proportionally, so *Votes come from* is
    not shown there.
- **Some defaults depend on the level.** Such a setting follows the level until the user changes it. From then on,
  the user's value applies at every level.
- **Controls:**
  - a toggle for on/off, labelled by what *on* means;
  - segmented buttons for 2–4 options;
  - a select only for many options (none in Settings now).
- **Every row has an (i)**, except Language. Labels are a few words, and explanations live behind the (i).
- **Truth labels are never settings.** These are fixed:
  - edit markers;
  - the scenario tint and chip;
  - ▲▼ with sign;
  - tie, lottery, publication and data-qualification notices;
  - delete confirmations;
  - full numbers;
  - left-to-right graphics.

## 2. Levels

A row is shown when one of these is true:

- the current level is at or above the row's minimum level;
- in Custom, the row's owning feature is set to *Show*.

The **Starter tip** row is the exception: it shows at Simple only, because the tip exists only there.

- **Simple** ends with one quiet line, **"N more settings in Standard"** / **"עוד N הגדרות ברמת רגיל"** **(coord.)**. Pressing it
  opens those rows in place, under the heading *More settings*. Each of them carries a level tag. Nothing moves above
  the line.
- **Search** finds every setting at every level. A result from a higher level carries its level tag, and it can be
  changed in place.
- **Detail level** is the first row, because it decides what the rest shows. Changing it re-filters only the rows
  below it.

| Group | Simple | Standard | Expert |
|---|---|---|---|
| Top | Detail level | same | same |
| General | Language, Theme, Spacing, Starter tip | Language, Theme, Spacing, Open on | same as Standard |
| Lists & parties | List symbol, Joint lists by party, Party colour in seats, Parties with no seats, Lists with no seats, Vote counts | + Parties of seatless lists, Lists that withdrew, Order lists by, All candidates | same as Standard |
| Seat chart | – | Layout, Colour seats by, Bloc backgrounds, Comparison chamber, List key, Dim other seats | same |
| Numbers | Max decimal places 0·1·2·3 | same | same |
| Editing | Mark changes since, Confirm start over | + Votes come from, Copy votes between elections as, Hover previews, Community scenarios | same |
| Analysis | – | Compare with, Option previews | same |
| Accessibility | all 5, at every level **(coord.)** | all 5 | all 5 |

## 3. The settings

Abbreviations used in this section:

- **All** = Simple, Standard, Expert and Custom.
- **Std+** = Standard and Expert, plus Custom where the owning feature is shown.
- The control types are **T** (toggle), **G** (segmented) and **D** (select).
- A row marked "choice" is a point-of-use question, stored in the existing `PREFERENCES` registry under the
  `israel-elections:preferences` key.

### Top

**Detail level / רמת פירוט**

- Control: G, Simple · Standard · Expert / פשוט · רגיל · מומחה, plus a **Custom…** / **מותאם…** link that opens the Custom
  page.
- Default: Simple. Levels: All.
- (i) EN: "Decides which tools and settings are shown. Hidden edits and settings keep working."
- (i) HE: "קובעת אילו כלים והגדרות מוצגים. עריכות והגדרות מוסתרות ממשיכות לפעול."

### A. General / כללי

**`lang`: Language / שפה**

- Control: G, עברית · English. Default: Hebrew. Levels: All.
- No (i).
- It stays in the top bar as well.

**`theme`: Theme / ערכת צבעים**

- Control: G, Device · Light · Dark / לפי המכשיר · בהיר · כהה. Levels: All.
- Default: **Device (coord.)**.
- (i) EN: "Device follows your phone or computer, also when it changes at night."
- (i) HE: "לפי המכשיר: כמו בטלפון או במחשב, גם כשזה משתנה בלילה."
- The top-bar sun/moon stays. It sets Light or Dark.

**`density`: Spacing / ריווח**

- Control: G, Compact · Comfortable / צפוף · מרווח. Levels: All.
- Default: **Compact (coord.)**.
- (i) EN: "Comfortable adds space between rows. Touch targets stay large in both."
- (i) HE: "מרווח מוסיף רווח בין השורות. יעדי המגע נשארים גדולים בשני המצבים."

**`starterTip`: Starter tip / טיפ פתיחה**

- Control: T. Default: on until it is dismissed. Levels: Simple.
- (i) EN: "The one-line tip under the Overview. Turn on to see it again."
- (i) HE: "שורת העצה בתחתית תמונת המצב. הפעילו כדי לראות אותה שוב."

**`openOn`: Open on / פתיחה ב־**

- Control: G, Overview · Last tool / תמונת מצב · הכלי האחרון. Default: Overview. Levels: Std+.
- (i) EN: "Where the app opens. A share link wins, and your unsaved work is restored either way."
- (i) HE: "היכן היישום נפתח. קישור שיתוף קודם, והעבודה שלא נשמרה משוחזרת בכל מקרה."

### B. Lists & parties / רשימות ומפלגות

**`listSymbol`: List symbol / סמל הרשימה**

- Control: G, Logo · Ballot letters / סמל · אותיות הפתק. Default: Logo. Levels: All.
- (i) EN: "Logo: the verified symbol from that election, else the letters. Ballot letters: always the letters."
- (i) HE: "סמל: הסמל המאומת מאותן בחירות, אחרת האותיות. אותיות הפתק: תמיד האותיות."

**`jointByParty`: Joint lists by party / רשימות משותפות לפי מפלגה** (choice `jointSeats`)

- Control: **T**. Default: **On (coord.)**. Levels: All.
- (i) EN: "Each party on a joint list shows as its own faction. Votes and seats don't change. Saved scenarios keep
  their choice."
- (i) HE: "כל מפלגה ברשימה משותפת מוצגת כסיעה נפרדת. הקולות והמנדטים אינם משתנים. תרחישים שמורים שומרים את
  הבחירה שלהם."

**`partyColourInSeats`: Party colour in seats / צבע המפלגה במושבים**

- Control: T. Default: On. Levels: All.
- (i) EN: "For a list counted by party, each seat shows the party colour inside the list colour."
- (i) HE: "ברשימה שנספרת לפי מפלגה, כל מושב מציג את צבע המפלגה בתוך צבע הרשימה."

**`seatlessParties`: Parties with no seats / מפלגות ללא מנדטים**

- Control: T, where on = shown. Default: **Off (coord.)**. Levels: All.
- (i) EN: "Parties on a joint list that won seats but had no one elected, e.g. Atid Ehad (2022). They stay one press
  away on the list's page."
- (i) HE: "מפלגות ברשימה משותפת שזכתה במנדטים, שלא נבחר מטעמן איש, למשל עתיד אחד (2022). הן במרחק לחיצה בעמוד
  הרשימה."

**`partiesInSeatlessLists`: Parties of seatless lists / מפלגות ברשימות ללא מנדטים**

- Control: T. Default: Off. Levels: Std+.
- (i) EN: "The parties of a joint list that won no seat, when that list is counted by party."
- (i) HE: "המפלגות של רשימה משותפת שלא זכתה במנדט, כשהרשימה נספרת לפי מפלגה."

**`seatlessLists`: Lists with no seats / רשימות ללא מנדטים**

- Control: G, Over 0.5% · All · Folded / מעל 0.5% · כולן · מקופלות. Default: Over 0.5%. Levels: All.
- (i) EN: "How many lists that won no seat show at first. 'Show all' still opens the rest; a list you changed always
  shows."
- (i) HE: "כמה רשימות שלא זכו במנדט מוצגות בהתחלה. 'הצגת הכול' עדיין פותח את השאר; רשימה ששיניתם מוצגת תמיד."

**`withdrawnLists`: Lists that withdrew / רשימות שפרשו**

- Control: T. Default: On. Levels: Std+.
- (i) EN: "Lists that withdrew before election day and got no votes. A list you withdrew is always shown."
- (i) HE: "רשימות שפרשו לפני יום הבחירות ולא קיבלו קולות. רשימה שאתם הוצאתם מוצגת תמיד."

**`listOrder`: Order lists by / סדר הרשימות**

- Control: G, Seats · Votes · Bloc · Name / מנדטים · קולות · גוש · שם. Default: Seats. Levels: Std+.
- (i) EN: "Bloc: the same order as the seats in the chamber."
- (i) HE: "גוש: באותו סדר כמו המושבים במליאה."

**`voteCounts`: Vote counts / מספרי קולות**

- Control: T. Levels: All.
- Default by level: off at Simple, on at Standard and above.
- (i) EN: "The number of votes beside each list's share."
- (i) HE: "מספר הקולות ליד אחוז הקולות של כל רשימה."

**`allCandidates`: All candidates / כל המועמדים**

- Control: T. Default: Off. Levels: Std+.
- (i) EN: "Opens a list's full roster. Off: the elected and the next few first."
- (i) HE: "פותח את רשימת המועמדים המלאה. כבוי: הנבחרים והבאים בתור תחילה."

Where these settings apply:

- **`seatlessParties` and `partiesInSeatlessLists`:**
  - the list column's party rows;
  - the bloc editor's party units;
  - the joint-list page, where the zero-seat rows fold behind "+N with no seats" / "‏+N ללא מנדטים", so they are
    never unreachable;
  - the chamber key, which already hid them.

  Neither ever hides:
  - a party with seats;
  - a party the user gave its own bloc;
  - an unknown affiliation.

  Compare (V3 lane) is to adopt the same rule.
- **`seatlessLists` and `withdrawnLists`:** the list column; `seatlessLists` also sets where Compare's table starts
  (All: every seatless row; Over 0.5%: those with at least 0.5% on either side; Folded: none), and Compare's *Lists
  with no seats* switch then shows or hides all of them for that visit. Charts keep their own fixed filter (withdrawn lists out, lists under 1% with no seat dropped). They never apply to:
  - Sources;
  - the "votes with no seat" figure;
  - exports;
  - donor or search pickers.

  A selected or edited list is always shown.
- **`listSymbol`:** every `Slip`. A party without ballot letters keeps its logo. Generated icons for merged, split and
  new lists are unchanged.

### C. Seat chart / תרשים המליאה (Std+; Custom when *Chamber options* is shown)

The inline chamber controls stay at Expert, as the point of use. They now read and write the same saved values, which
before were lost on reload.

**`chamberLayout`: Layout / פריסה**

- Control: G, Arc · Blocks / קשת · גושים. Default: Arc.
- (i) EN: "The shape only; every seat stays the same."
- (i) HE: "הצורה בלבד; כל מושב נשאר אותו מושב."

**`seatColour`: Colour seats by / צביעת מושבים לפי**

- Control: G, List · Bloc · Party / רשימה · גוש · מפלגה. Default: List.
- (i) EN: "Party: each seat by its member's party, also inside joint lists."
- (i) HE: "מפלגה: כל מושב לפי מפלגת חבר הכנסת, גם ברשימות משותפות."

**`blocShading`: Bloc backgrounds / רקע לגושים**

- Control: T. Default: On.
- (i) EN: "The tinted areas behind each bloc. Off: seats only."
- (i) HE: "האזורים הצבועים מאחורי כל גוש. כבוי: מושבים בלבד."

**`referenceChamber`: Comparison chamber / מליאת השוואה**

- Control: T. Default: On.
- (i) EN: "A small chamber of the result you compare with, shown when seats change. Outlines still mark gains."
- (i) HE: "מליאה קטנה של התוצאה להשוואה, כשמנדטים משתנים. המתארים עדיין מסמנים מושבים שנוספו."

**`chamberKey`: List key / מקרא הרשימות**

- Control: T. Default: On.
- (i) EN: "The list names under the seats. On a phone it always shows, since seats have no labels there."
- (i) HE: "שמות הרשימות מתחת למושבים. בטלפון הוא מוצג תמיד, כי למושבים אין שם תוויות."

**`dimUnselected`: Dim other seats / עמעום שאר המושבים**

- Control: T. Default: On.
- (i) EN: "When a list is chosen, the other seats and rows fade."
- (i) HE: "כשבוחרים רשימה, שאר המושבים והשורות מתעמעמים."

### D. Numbers / מספרים

**`decimals`: Max decimal places / ספרות אחרי הנקודה (מרבי)** (owner, 7 Nov)

- Control: G, 0 · 1 · 2 · 3, at every level.
- Default by level: **1 at Simple and Standard, 2 at Expert (owner)**. Levels: All.
- (i) EN: "Percentages everywhere show at most this many. Results are still computed exactly. Next to the threshold
  a share gets one more digit, so it never looks like it is on the other side."
- (i) HE: "אחוזים בכל מקום מוצגים עם לכל היותר כמה ספרות. התוצאות עדיין מחושבות במדויק. ליד אחוז החסימה מוצגת ספרה
  נוספת, כדי שהאחוז לא ייראה בצד השני שלו."

Rules for `decimals`:

- **It is a maximum.** No percentage or percentage-point figure on any screen has more decimals; no number anywhere
  has five or more (an unbounded float). An e2e audit (tests/e2e/decimals-audit.spec.ts) scans the overview and list
  page of k26, k25 and k1, Compare, Seat safety, Merge & split, Charts and a split's share form at several maximums.
- **Next to a threshold, one more digit rather than the wrong side (owner, 7 November; 9.7a).** When ordinary
  rounding would put a share on the other side of the threshold, it is shown with one more decimal: against the
  1.5 % threshold, 1.46 % at one decimal shows "1.46%", not "1.5%"; against 3.25 %, 3.4 % at no decimals shows
  "3.4%", not "3%". This is the only case in which the maximum is exceeded, and only by one digit. If even that digit
  would cross (1.4996 % shows "1.50%"), it is rounded toward the true side ("1.49%"). Where a share was shown this
  way, its tooltip gives the exact share ("1.4600%: the exact share. One more decimal is shown so it doesn’t look
  above the 1.5% threshold"): the list column, the list page, the figures, the charts table, the walkthrough and both
  sides of Compare. The decimals audit allows that one extra digit only for a share within one last-digit step of a
  threshold (1, 1.5, 2, 3.25).
  - *Owner choice:* 9.7a (this, recommended) or 9.7b (keep the maximum strictly and round toward the true side:
    "1.4%", "4%"). 9.7b is one line in `fmtPct` (src/app/format.ts) and was the rule until this change.
- **Exact on purpose:** a threshold set in law (3.25 %, 1.5 %), a step size (0.1pp) and the waffle's "each square
  is 0.5%" are fixed values, not results, and are shown exactly (marked `data-exact`); so are the allocation
  quotients in How seats were allocated, and fractions in tooltips where a screen is about precision.
- **A non-zero share is never shown as 0.** It is shown as "<0.1%" (or "<1%", "<0.01%", by the digits).
- **The setting applies everywhere a percentage is shown:**
  - the list column, the list page, the figures and the charts table and tooltips;
  - the walkthrough, Seat safety and Sensitivity;
  - Compare: both sides' shares (threshold-safe), the Change column's percentage-point change ("+1.2 pp", never a
    non-zero change shown as 0: "+<0.1 pp"), the key figures, the phone row sheet and the copied share or turnout
    named on a copy's marker (recorded at the maximum in force when it was copied);
  - Localities: shares, margins and turnout;
  - Turnout, Merge & split shares and their sums, Sensitivity axis ends;
  - Party families: values and changes;
  - the election context;
  - undo labels.
- **Fixed formats:** chart axis ticks and in-plot bar labels keep a fixed compact format, and CSV/JSON exports keep
  exact columns.

### E. Editing / עריכה

**`voteSource`: Votes come from / הקולות מגיעים מ־** (choice)

- Control: G, Ask · Other lists · New voters / לשאול · שאר הרשימות · מצביעים חדשים. When a list was remembered for
  Always, a 4th pressed segment names it.
- Default: Ask. Levels: Std+. At Simple, other lists are always used (ADR 0013).
- (i) EN: "Other lists: from all, in proportion; turnout stays. New voters: turnout changes. Ask: you choose at each
  edit."
- (i) HE: "שאר הרשימות: מכולן, באופן יחסי; ההצבעה לא משתנה. מצביעים חדשים: ההצבעה משתנה. לשאול: בוחרים בכל עריכה."

**`markChanges`: Mark changes since / סימון שינויים מאז** (choice `comparison`)

- Control: G, Ask · Opened scenario · Official result / לשאול · התרחיש שנפתח · התוצאה הרשמית. Default: Ask.
  Levels: All.
- (i) EN: "Opened scenario: only your newer changes are marked. Official result: every difference is marked."
- (i) HE: "התרחיש שנפתח: מסומנים רק השינויים החדשים. התוצאה הרשמית: מסומן כל הבדל."

**`confirmStartOver`: Confirm start over / אישור לפני התחלה מחדש**

- Control: T. Default: On. Levels: All.
- (i) EN: "Asks before clearing all changes. Undo can always restore them."
- (i) HE: "שאלה לפני מחיקת כל השינויים. תמיד אפשר לשחזר עם ביטול."

**`hoverPreviews`: Hover previews / תצוגה מקדימה בריחוף**

- Control: T. Default: On. Levels: Std+.
- (i) EN: "Pointing at a step or goal button previews its result. Nothing changes until you press."
- (i) HE: "הצבעה על כפתור צעד או יעד מציגה את התוצאה מראש. דבר אינו משתנה עד הלחיצה."

**`communityScenarios`: Community scenarios / תרחישי הקהילה**

- Control: T. Default: On. Levels: Std+. The gallery stays visible by default at every level **(coord.)**.
- (i) EN: "Loads the community list on the Scenarios page. Off: your own saves and links only."
- (i) HE: "טעינת רשימת הקהילה בעמוד התרחישים. כבוי: רק השמירות והקישורים שלכם."

**`copyMode`: Copy votes between elections as / העתקת קולות בין בחירות לפי** (choice `copyMode`, V3's Compare)

- Control: G, Ask · Share of the vote · Number of votes / לשאול · שיעור מהקולות · מספר הקולות. Default: Ask.
  Levels: Std+ (Custom: when Compare is shown). Within one election a copy is always the count.
- (i) EN: "Compare: a list’s votes copied from another election. Share of the vote keeps its strength; Number of
  votes copies the count. Ask: you choose at each copy."
- (i) HE: "השוואה: קולות של רשימה שמועתקים מבחירות אחרות. שיעור מהקולות שומר על כוחה; מספר הקולות מעתיק את המספר.
  לשאול: בוחרים בכל העתקה."
- A copy asks only while this or *Votes come from* is unanswered. The copy question opens with the remembered mode
  and links here (Change in Settings). Answers for one list are listed under the row by list name and election; a
  list that exists only on a Compare side (added by a copy) is named from that side.

**Remembered answers** are not a separate row. Each question shows its own, under the question (§5).

### F. Analysis / ניתוח (Std+)

**`compareWith`: Compare with / השוואה מול**

- Control: G, Previous election · Official result / הבחירות הקודמות · התוצאה הרשמית. Default: Previous election.
- Owning feature: `compare`.
- (i) EN: "What Compare shows on the other side when it opens. You can change it there."
- (i) HE: "מה מוצג בצד השני כשההשוואה נפתחת. אפשר לשנות שם."

**`optionPreviews`: Option previews / תצוגה מקדימה באפשרויות**

- Control: T. Default: On.
- (i) EN: "Small seat charts beside choices such as groupings. Off: names only, faster on slow phones."
- (i) HE: "תרשימי מושבים קטנים ליד אפשרויות כמו חלוקות. כבוי: שמות בלבד, מהיר יותר בטלפונים איטיים."

### G. Accessibility / נגישות (All, never hidden by level) (coord.)

**`textSize`: Text size / גודל טקסט**

- Control: G, Normal · Large / רגיל · גדול. Default: Normal.
- (i) EN: "Large makes all text and controls about 15% bigger."
- (i) HE: "גדול מגדיל את כל הטקסט והבקרים בכ־15%."

**`reduceMotion`: Reduce motion / הפחתת תנועה**

- Control: T. Default: Off.
- (i) EN: "Stops moving bars, seats and smooth scrolling. Your device's reduce-motion setting always applies."
- (i) HE: "עוצר תנועה של עמודות, מושבים וגלילה. הגדרת הפחתת התנועה במכשיר חלה תמיד."

**`hoverPopups`: Popups on hover / חלוניות בריחוף**

- Control: T. Default: **On (coord.)**.
- (i) EN: "(i), seat details and chart values open when the pointer rests on them. Off: click only. Touch and keyboard
  always work."
- (i) HE: "(i), פרטי מושב וערכי תרשים נפתחים כשהעכבר עליהם. כבוי: בלחיצה בלבד. מגע ומקלדת פועלים תמיד."

**`preferTables`: Tables instead of charts / טבלאות במקום תרשימים**

- Control: T. Default: Off.
- (i) EN: "Charts, family history and Localities open as tables. Each page can still switch."
- (i) HE: "תרשימים, היסטוריית משפחות ויישובים נפתחים כטבלאות. בכל עמוד אפשר עדיין להחליף."

**`keepMessages`: Keep messages open / הודעות נשארות פתוחות**

- Control: T. Default: Off.
- (i) EN: "Short messages, such as 'Saved', stay until you close them."
- (i) HE: "הודעות קצרות, כמו 'נשמר', נשארות עד שסוגרים אותן."

How each accessibility setting is implemented:

- **`textSize`:** Large sets `zoom: 1.15` on the root. Popups divide their coordinates by that zoom, and measured
  heights written back into CSS (the top bar's) use layout pixels. **Width breakpoints follow the effective width:**
  media queries measure the real screen, so the build (scripts/scale-aware-media.ts, a PostCSS step) gives every
  width `@media` rule a large-text copy with its breakpoints multiplied by 1.15, each copy scoped by a
  zero-specificity root condition. At 1024 px Large lays out exactly as a 890 px page; at 1500 px as a 1304 px page.
  The one breakpoint checked in script (Compare's phone row sheet) uses the same rule (src/app/textScale.ts). On a
  very narrow page (a 340 px phone, or 390 px with Large) the top bar's last actions move to a second row.
- **`reduceMotion`:** `data-motion="reduce"` on the root stops every transition and animation. The device's
  `prefers-reduced-motion` keeps working on its own, and smooth scrolling also checks the setting.
- **`hoverPopups`:** it applies to all of these:
  - Info (i);
  - edit-marker cards;
  - the seat card;
  - chart value tips;
  - family chart points.

  When it is off, a mouse hover opens none of them. Click, keyboard focus and touch still open each one.
- **`preferTables`:** it sets the first view of:
  - Charts;
  - Party families' exact figures (open);
  - Localities.

  The Families → Manage checkbox now mirrors this setting.

## 4. Popup layout

**Header** (sticky):

- the title **Settings** / **הגדרות**;
- an (i): "Kept in this browser for every election. Not part of scenarios, undo or share links." / "נשמרות בדפדפן זה
  לכל הבחירות. אינן חלק מתרחישים, מהביטול או מקישורי שיתוף.";
- ×;
- **Find a setting** / **חיפוש הגדרה**;
- the group chips.

**Body:**

- Detail level, then the groups in order A–G.
- Each group heading has a **Reset** / **איפוס** link. Its space is reserved and hidden when nothing differs, so the
  heading never shifts.
- A small dot before a label means the setting differs from its default. Settings are not edits, so this is not an
  edit marker.

**Footer:**

- the Simple hint;
- **Reset all settings** / **איפוס כל ההגדרות**:
  - It applies at once, with an **Undo** toast. There is no confirm dialog. While a modal popup is open, messages
    show inside it, so their Undo can be clicked.
  - It keeps Language, Detail level and the remembered answers, and its (i) says so.

**Desktop:**

- the native `<dialog>`, fixed width `min(40rem, 100vw − 32px)`;
- the body scrolls inside, with `overscroll-behavior: contain`;
- one row per setting, with the label and (i) at the start and the control at the end.

**Phone (≤ 600 px):**

- a full-screen sheet, where the header stays visible and the chips scroll sideways;
- a toggle row is one tap target;
- segmented controls sit on their own line under the label, decided by width class rather than by measuring text;
- segments share the width, with a minimum height of 44 px.

**No jumps:**

- The popup has a fixed size per breakpoint.
- A dependent row is never removed.
- Reset links reserve their space.
- Search and level changes re-filter only the rows below the field or control the user is touching.
- Close returns focus to the gear.

**Search:**

- It matches labels, option labels and (i) text in both languages, whatever the interface language, plus synonyms.
  For example, typing "logo" or "סמל" finds List symbol, and "0 seats" or "אפס" finds the zero-seat rows.
- No result: "No setting matches" / "לא נמצאה הגדרה".
- A chip scrolls the popup body, never the page. Chips for empty groups are not drawn.

**Deep links:**

- The ask dialog's **Change in Settings** / **שינוי בהגדרות** opens Settings at that question.
- The joint-list page's default switch is the same setting, so it changes the row too.
- The Rules page keeps a link to Settings.

The "Rules & settings" tab is renamed **Rules** / **כללים**.

## 5. Remembered answers

Under a question that has per-item answers, a disclosure line appears: "Remembered for 3 ▸" / "‏נשמר ל־3 ▸". It is
collapsed by default.

- Each row reads "Likud (2022): Other lists" and has an **Ask again** / **לשאול שוב** button.
- A **Forget all** / **מחיקת הכול** button clears that question's per-item answers.
- **Changing the question's default keeps the per-item answers (Codex).** A specific answer wins over Always. Before,
  changing the default silently deleted them.
- At the edit, the ask dialog keeps its three scopes, and adds a **Change in Settings** link.

### One name per question

The point-of-use questions and their Settings rows use the same words, in the ask dialog, in Settings and in its
remembered-answers list: **Votes come from**, **Joint lists by party**, **Mark changes since** (Opened scenario ·
Official result), **Copy votes between elections as** (Share of the vote · Number of votes). The per-edit chooser on
the list page, in Seat safety and in Party families is also **Votes come from**.

The popup is rendered outside the dark top bar, so the bar's own control colours never reach it.

## 6. Storage

The app is pre-release (owner, 7 Nov): there are no users, saved scenarios, share links or stored preferences to
preserve until version 1 is declared released. So nothing is migrated and there are no compatibility shims; old
stored values are simply ignored.

- **Settings** are in `israel-elections:settings`, holding `{ v: 2, values }`. It is sparse: only values the user
  set are written, so defaults by level, and later changes to defaults, reach untouched settings. An invalid value
  falls back to its default.
- **Language, level, Custom, the open page and saved scenarios** are in `israel-elections:v1`. It no longer holds
  theme, decimals, party colours or the starter tip.
- **The point-of-use answers** are in `israel-elections:preferences` and `israel-elections:item-preferences`.
- The old `israel-elections:vote-source` and `israel-elections:families:exact` keys are no longer read.

Every default applies to anyone with no stored value: Device theme, Compact spacing, joint lists by party,
parties with no seats hidden, 1 decimal at Simple.

A saved scenario carries its own joint-list baseline, so changing that setting later does not change it.

## 7. Reconciling the two designs

Where the designs disagreed, this design chose as follows, with the reason for each:

- **Seat chart from Standard, not Expert (Claude).** Layout and colour are taste. The inline controls stay at Expert,
  so the Expert tool surface is unchanged.
- **Reduce motion as a toggle, with the device always respected (Codex).** Claude proposed Device · On · Off. An app
  must not override an operating-system accessibility request.
- **Popups on hover as a toggle (Claude).** It is binary, so it is a toggle, not segmented Hover · Click.
- **Decimals at every level, as a maximum (owner, 7 Nov).** Codex proposed a fixed 2 shown at Std+; the owner asked
  for a 0–3 maximum, 1 by default (2 at Expert), applied to every percentage.
- **Votes come from at Std+ (Claude).** ADR 0013 keeps Simple proportional. Codex proposed All.
- **Mark changes at every level (Claude).** Saved scenarios open at Simple too. Codex proposed Std+.
- **Withdrawn lists shown by default (Claude).** That is today's behaviour; Codex proposed Off.
- **Exceptions are preserved when the default changes (Codex).** This avoids silent loss of a stored choice.
- **Order lists by: the union (Seats · Votes · Bloc · Name).**
- **Analysis view and Locality view become one setting, Tables instead of charts (Claude).** It is one intent, and each
  page keeps its own switch.
- **Starter tip and Tips are one row, Simple only (Claude).** Only Simple has a tip, and a row that does nothing
  elsewhere would break "nothing shown that does nothing".
- **Open on: Overview · Last tool (Claude).** Codex proposed a select of every tool. Two options cover the use, and an
  explicit link still wins.
- **Dim other seats (Codex) also dims the list rows,** so that siblings behave alike.

## 8. Considered and not built

- **Zero-vote lists (Codex).** No standing list in k1–k26 has exactly zero votes; every zero-vote list is withdrawn,
  which *Lists that withdrew* covers. A control that does nothing is not shown.
- **Digit grouping and date style (Codex).** Exactness and locale dates are the product. Digit grouping would also
  change what the inputs accept. Claude classed both as fixed.
- **Party-name length and candidate-name script (Codex).** There is no sourced short/full pair for every list. A
  "registered name" mode would show Hebrew in English mode, against the localisation rule.
- **Candidate parties beside names (Codex).** A recorded affiliation is evidence about a joint list, so it stays
  visible.
- **Change flash (Codex).** *Reduce motion* already stops it, and a second switch for one animation adds a row without
  a distinct need.
- **Success messages off (Codex).** The info messages also carry consequences, such as "unsaved changes kept in the
  switcher", so they cannot be silenced safely. *Keep messages open* covers the accessibility need.
- **Edit marks as text or symbol (Codex).** The coordinator kept the current text style, with no Off.
- **Remember step sizes and locality sort (Codex), and the automatic step memory (Claude).** Steps are chosen per list
  from its size, and the sort is one click in the table header. A global default adds hidden state for little gain.
  Both are parked.
- **Reset scopes "Reset display" and "Reset level" (Codex).** These are replaced by a per-group Reset and Reset all,
  both with Undo. "Reset level" is the Custom page's own reset.
- **A gear in the chamber toolbar (Claude).** Hemicycle is the V1 lane this week. Its inline controls are the same
  setting already.
- **Separate answer buttons in the ask dialog (Claude).** The dialog is shared by every edit and by the existing tests.
  It keeps its scopes and gains the "Change in Settings" link. The buttons are parked for an owner look.
- **Density (Claude dropped it).** It was added back at the coordinator's decision, as Compact by default.

## 9. Tests

Unit tests:

- **The registry:**
  - every row has an EN and HE label, an (i) and at least one level;
  - every option is bilingual;
  - every point-of-use question has a row.
- **Storage:** every setting stores and reads back; an empty record means every default; invalid values fall back.
- **Threshold-safe rounding:** at 1 %, 1.5 %, 2 %, 3.25 % and every decimal option, in both directions.
- **Visibility by level, Custom and the Simple hint count.**

E2e tests:

- each setting takes effect at least once;
- the visible sets at each level;
- search in both languages;
- the 390 px sheet;
- a pressed control does not move;
- k25 Religious Zionism with zero-seat parties shown and hidden.
