# Individual MKs: departures, replacements and members who act apart from their list

Design and recommendations, 7 November 2026. Design only: no application or data changes. The mock-ups were
rendered from real data in a scratch folder; they are listed in [§6.8](#68-mock-ups) and not committed.

**The rule in one sentence:** an MK is shown apart from their list only because of **their own recorded act**,
which is dated and labelled with its basis (**Official** Knesset record, **Recorded vote**, or **Own statement**),
and only in the view that the act is about. Commentary and other people's descriptions never move or mark anyone.

**Short version of the recommendations**

- **No "rebel" mark or word.** Use specific factual labels: *Left the faction / פרש מהסיעה*, *Voted against /
  הצביע נגד*, *Left the coalition / פרש מהקואליציה*.
- **Not the red ring.** The seat is **drawn where its vote or support went**, keeps its own list colour, and gets a
  small ink **pip**. Mock-up A2.
- **Silman** moves to the opposition side in the *Government support* view from 6 April 2022, labelled
  **Own statement**. She stays in Yamina in the *Factions* view, because the Knesset never recorded otherwise.
  **Chikli** moves in the vote view from 13 June 2021 (**Recorded vote**). He becomes a one-member faction from
  25 April 2022 (**Official**).
- **Seats with more than one holder** get a holder list in the seat sheet, with dates, reasons and basis. A light
  "stack" mark is optional. The Knesset-on-a-date view lives in *After the election*, not in the election result.
- **Individual changes in the coalition tool are scenario edits.** They are recorded as actions, marked "Edited",
  and carried in links, saved scenarios and Compare. Official exceptions are data, not edits.

---

## 1. Prior art: what serious tools do

| Tool | What it models | Borrow | Avoid |
|---|---|---|---|
| **Knesset OData `ParliamentInfo`** (`KNS_Person`, `KNS_PersonToPosition`, `KNS_Faction`) | One row per person per position with start and end dates. PositionID 43/61 is MK tenure; 54 is faction membership, with the faction ID. Factions themselves are dated. | The **interval model** (person × role × [start, end)) and the stable **PersonID**. This is the official spine. | Taking rows as the legal reason. A faction row says *where* someone sat, not *why* (split, leaving, rename). Some dates lag the political event (§3, Gur). |
| **Knesset website** (MK pages, "פילוגים ואיחודים" split/merge history, House Committee protocols) | Per-MK biographies, faction history, official split and merge list. | Its **split/merge vocabulary**, which this design uses for the event names. | Refused by location during this research, so it couldn't be relied on (also M2's finding). |
| **Open Knesset (oknesset.org)** | A static mirror of member pages and committee meetings. | A convenient **pointer** to protocols, e.g. the 15 Aug 2022 House Committee meeting on Silman's request. | It is a mirror, so treat it as **secondary**; cite the protocol itself where it can be reached. |
| **UK Parliament "State of the parties"; by-election lists** | Seat totals by party **as of a date**, with a change log. MPs who lost the whip are listed as *Independent* under their own row. | The **"as of" date** next to any composition, and a change log that explains each difference from the election result. Separate rows for official status changes. | The UK has no list replacements, so its seat model is constituency-based. |
| **Bundestag "Mandatsveränderungen" / abgeordnetenwatch** | List successors (*Nachrücker*) entering when a member leaves; *Fraktionswechsel* (changes of parliamentary group) with dates. | The closest equivalent to the Israeli list system: **a successor enters from the same list**. The successor is shown as a new person on the same mandate, with a reason. | abgeordnetenwatch adds vote-by-vote scoring, which would be scope creep here (§8). |
| **ParlGov** | Party-level cabinets and parliament seats only. No individuals. | It confirms that **party-level seat counts stay the analytical unit**; individuals are a layer on top. | Nothing to borrow for individuals. |
| **Hansard Society** (UK) | Explainers on whips, rebellions and confidence votes. | Its practice of reporting **specific divisions** ("voted against the government on X") instead of a general label. | Its "rebel" vocabulary: in an Israeli context the word reads as a judgement. |
| **Israel Democracy Institute** (explainers on the Norwegian law and on members who leave their faction) | Plain-language explanations of §42c and of leaving a faction (§6A, Knesset Law §61). | The **(i) texts**: short legal explanations with a link. | Nothing. |
| **Hebrew Wikipedia** "חברי הכנסת ה-N" tables | Replacement tables with dates. | A **labelled secondary pointer** for finding cases to check. | Never the source of record. |

**What we take from this:**

- Model **person-tenures with dates**, keyed by Knesset PersonID.
- Show composition with an explicit **"as of" date**.
- Report **specific acts** (a vote, a faction change), never a general character label.
- Keep list seats from votes as the core unit.

---

## 2. Taxonomy of individual events

"Class" says what kind of evidence the event is. It drives the label and the basis chip.

- **Official** is a Knesset or statutory record.
- **Vote** is a recorded roll call.
- **Statement** is the MK's own public, dated statement.
- **Commentary** is anyone else's description.

| Event | Official source of truth | Class | Effect in the app |
|---|---|---|---|
| **Sworn in at the start** | OData PositionID 43/61 start date; the Knesset's swearing-in record | Official | First holder of a seat chain. |
| **Did not take up the seat** (declined / withdrew before swearing-in) | The CEC list of elected members; the candidate's notice. OData has no tenure. | Official | That list position is skipped; the next candidate holds the seat. Already partly in data (e.g. Davidi, Yamina #3, 2021). |
| **Resignation** | Basic Law: The Knesset §41 (letter; takes effect **48 hours** later); Knesset notice; OData end date | Official | Ends the tenure. The next candidate enters "in his place" (§43(a)). The reason may be unknown. |
| **Death** | Knesset notice; OData end date | Official | Ends the tenure; the next candidate enters. |
| **Norwegian-law resignation** (a minister or deputy minister gives up the seat) | §42c; the Knesset notice of the resignation and of the replacement | Official | Ends the tenure, and the next candidate enters. The minister keeps a **right to return**. |
| **Norwegian-law return** (stops being a minister) | §42c and §43(b) and (c): membership renews, and **the last one who entered from that list leaves**; a swap notice under §42c(f)/§43(d) is possible | Official | The returning MK takes the **seat chain of the person who leaves**. One person can therefore appear in two chains (Kahana, Kalfon in 2021–22). |
| **Appointment to an incompatible office** (e.g. a judge, State Comptroller) or loss of membership by law | The relevant law plus the Knesset notice | Official | Like a resignation. Record the stated reason. |
| **Suspension** (by the House Committee or the Ethics Committee) | Committee decision | Official | **Not a departure.** The person still holds the seat. Show it only in that person's sheet, as an event. Stage 4 or later. |
| **Faction split** (התפלגות), recognised by the House Committee | Knesset Law 1994 (splits); House Committee decision; OData new faction ID | Official | In the *Factions* view, the seats move to the new faction from that date. Most joint-list break-ups are of this kind (2020, 2022, 2024 cases in §3) and are routine, not a departure from the voters' list. |
| **Leaving the faction** (פרישה), declared by the House Committee | Knesset Law **§61(a)** decision; consequences under Basic Law: The Knesset **§6A** (cannot run in the next election on the list of a party represented in the outgoing Knesset unless they resign "close to" leaving); OData move to a one-member faction | Official | In the *Factions* view the MK sits as a **one-member faction**, labelled *Left the faction (declared)*. The (i) explains §6A in one line. |
| **Joining another faction** | OData faction rows; House Committee | Official | In the *Factions* view, the MK sits with the new faction from that date. |
| **Sitting alone without a declaration** | OData shows a one-member faction | Official (faction record); the legal type is unknown | Same as above. The label is *Sits as a one-member faction*, and *Legal basis not recorded* if no decision was found. |
| **Vote against the own list's position** on investiture, confidence or no-confidence, budget, or dissolution | Knesset vote record (roll call) | Vote | Shown **only in that vote's view**: the seat is drawn with the side it voted for, plus a pip. Abstentions and absences are shown the same way. |
| **Leaving the coalition while staying in the faction** | The MK's own dated public statement (letter, press conference). There is no Knesset record. | Statement | Shown in the *Government support* view from that date, labelled **Own statement**. It never changes the *Factions* view. |
| **"Considered a defector", "voting with the opposition", etc.** in commentary | none | Commentary | **Never shown.** It may lead researchers to look for one of the acts above. |

**Words matter.** Hebrew *פורש* has a legal meaning (§61 / §6A). Use it **only** where the House Committee declared it.
A member who merely announces they are leaving the coalition is described in a different way:

- **Hebrew:** *פרש/ה מהקואליציה*, which means "left the coalition".
- **English:** *Left the coalition*.

---

## 3. Where to draw the line

### 3.1 The rule

An MK is shown apart from their list **only on the strength of their own recorded act**, in the view that the act is
about, from the date of the act:

| View | What can move or mark an individual |
|---|---|
| **Election result** (Play, History main chart) | Nothing. The seats belong to lists. |
| **Factions** on a date (After the election) | **Official** records only (split, declared leaving, joining another faction, one-member faction). |
| **Government support** on a date (After the election; coalition tool baseline) | **Official** + **Recorded vote** + **Own statement**, with the most recent act in effect. |
| **A specific vote** (e.g. the investiture) | That vote's **roll call** only. |

**Why this rule works:**

- It is **neutral** because it never asks us to judge motives or loyalty. Every mark is something the person did, on a
  date, that anyone can check.
- It keeps the strongest claims (Official) apart from the weaker ones (Own statement) through a visible **basis chip**,
  rather than hiding the difference.
- It resolves Chikli and Silman without treating them as "the same category" or as different degrees of a
  single sin: they did **different things**, and each is shown for what it was.

**Certainty (per the E1 source-policy model):**

- Each event also carries *confirmed / probable / provisional / disputed / unknown*.
- Default views show **confirmed** and **probable**. Probable is marked *Probable*.
- **Provisional** and **disputed** appear only at Expert, with a chip.
- **Unknown** reasons are written as *Reason not recorded*, never guessed.

### 3.2 The cases

Sources are listed in [§9](#9-sources). The Knesset OData rows were fetched with this project's user agent on
7 November 2026.

| Case | What happened (dated acts) | Class | How it's shown | Certainty |
|---|---|---|---|---|
| **Amichai Chikli** (Yamina, 24th Knesset) | Sworn in 6 Apr 2021. **Voted against** the investiture of the 36th government on 13 Jun 2021 (60–59–1). Yamina asked the House Committee on 7 Apr 2022. The Committee **declared him as having left the faction** under §61(a) on 25 Apr 2022, 7–0, and OData moves him to a one-member faction that day. He withdrew his appeal on 10 Jul 2022. He submitted his resignation on 12 Jul 2022; it took effect on **14 Jul 2022** and Kalfon entered. The CEC chair disqualified him from the Likud list under §6A on 28 Sep 2022. **The Supreme Court allowed his appeal on 9 Oct 2022**, by majority. | Vote, then Official | *Investiture vote:* drawn with **Against**, pip, "Voted against" (Recorded vote). *Support view* from 13 Jun 2021: opposition side, pip. *Factions view* from 25 Apr 2022: one-member faction "Left the faction (declared)" (Official). Not shown from 14 Jul 2022. | Confirmed (Supreme Court judgment ע"ב 6615/22 recites the dates; OData; press). |
| **Idit Silman** (Yamina, 24th Knesset) | On 6 Apr 2022 she sent a letter ending her membership in the coalition and resigned as coalition chair, which left the coalition at 60–60. She was **never declared** as having left the faction. On 15 Aug 2022 the House Committee **refused** her request to split as a one-member faction, 4–3. She resigned with effect from 13 Sep 2022 (Starkmann entered). Her candidacy on the Likud list was upheld (9 Oct 2022). | Statement; the refusal is Official | *Support view* from 6 Apr 2022: opposition side, pip, "Left the coalition", chip **Own statement**, note "Still in the Yamina faction". *Factions view:* in Yamina, with **no mark**, because nothing official changed. | Confirmed (Supreme Court judgment בג"ץ 6600/22; ynet, Israel Hayom, Globes, Haaretz, 6 Apr 2022; ynet, 15 Aug 2022). |
| **Said al-Harumi** (Ra'am, 24th Knesset) | **Abstained** in the 13 Jun 2021 investiture vote, while Ra'am supported the government. | Vote | *Investiture vote* only: drawn in the Abstained group, pip. No mark elsewhere: an abstention in one vote is not a departure. | Confirmed (Knesset press release; N12 roll call; already in `data/meta/aftermath/k24.json`). |
| **The 1990 "dirty trick" (התרגיל המסריח)** (12th Knesset) | OData: Modai, Sharir, Goldberg, Goldstein and Grupper move from the Likud faction to "המפלגה לקידום הרעיון הציוני" on **15 Mar 1990**. Sharir returns on 18 Jun, Goldberg on 4 Dec. Four more members change faction on **25 Dec 1990** (Mizrachi, Peretz, Gur, Biton). The Shamir government won its investiture 62–57 on 11 Jun 1990 (JTA). | Official (faction records); the legal type is not verified | *Factions view:* each member with the new faction from its OData date, labelled "Moved to faction X". **Not** called *פורש*: the §6A restriction came with Amendment 12 (1991), **after** these events, and no declaration was found. *Investiture vote 1990:* only if a roll call is found. Otherwise the view shows **list totals only**, with a "Roll call not available" note. | Faction dates **probable**: OData rows confirmed, but M2 could not open the official split/merge page. Legal type **unknown**. |
| **Efraim Gur** (Alignment, 12th Knesset) | OData moves him to "אחדות למען השלום והעלייה" only on **25 Dec 1990**, then to Likud on 17 May 1992. A secondary source (an oknesset mirror) has him as a deputy minister in the Shamir government from 16 Jul 1990. | Official dates; the earlier support needs a statement or vote | *Factions view:* from 25 Dec 1990. *Support view:* from 16 Jul 1990 **only once** a primary source is found (Knesset government record). Until then, from 25 Dec 1990. This is a reminder that **official faction dates can lag the political act**. | Faction date **confirmed** (OData). Deputy-minister date **provisional** (secondary). |
| **Orly Levy-Abekasis** (20th and 23rd Knessets) | 20th Knesset: OData moves her from Yisrael Beiteinu to a one-member faction on **15 Mar 2017**. Press reports a House Committee declaration, not verified here. 23rd Knesset: her faction **split** from Labor–Gesher–Meretz on **23 Mar 2020**, a week after the swearing-in. | Official | *Factions view:* one-member faction from 15 Mar 2017. The label is *Left the faction (declared)* only if the decision is found, otherwise *Sits as a one-member faction*. 2020: the Gesher faction from 23 Mar 2020. | 2017 date **confirmed** (OData); declaration **provisional**. 2020 split date **confirmed** (OData). |
| **Yoaz Hendel and Zvi Hauser** (Blue and White, 23rd Knesset) | OData: both move to "דרך ארץ" on **29 Mar 2020**, the same day Yesh Atid–Telem split from Blue and White. | Official | *Factions view:* Derech Eretz from 29 Mar 2020. This is a joint list breaking into parts, so it is labelled *Faction split*, not as individuals leaving. | Dates **confirmed** (OData); House Committee decision **unverified**. |
| **Joint-list break-ups, 2022–24** (25th Knesset) | Otzma Yehudit and Noam split from Religious Zionism on **20 Nov 2022**, before the government was formed. New Hope (Sa'ar, Elkin, Shasha-Biton, Haskel) split from National Unity on **13 Mar 2024**. | Official | *Factions view* only, labelled *Faction split*. These show why "split" must not be read as a departure by individuals. | Dates **confirmed** (OData). |

### 3.3 Should a "rebel" mark exist?

**No.** No umbrella word that judges the person, in either language:

- "Rebel", "defector" and "traitor" all characterise someone. The same act is "principled" to some and a
  "betrayal" to others.
- Hebrew *מורד* has no legal meaning. *עריק* is pejorative. *פורש* is a **legal** status and must not be used loosely.

What the app does have is **specific labels**, each tied to an act and a basis chip:

| Act | Hebrew | English | Basis chip |
|---|---|---|---|
| House Committee declared leaving (§61) | פרש מהסיעה | Left the faction | Official |
| One-member faction, no decision found | סיעת יחיד | Sits as a one-member faction | Official · *Legal basis not recorded* |
| Faction split | פיצול סיעה | Faction split | Official |
| Moved to another faction | עבר לסיעת X | Moved to faction X | Official |
| Roll-call vote against | הצביע נגד | Voted against | Recorded vote |
| Roll-call abstention / absent | נמנע / לא הצביע | Abstained / Did not vote | Recorded vote |
| Public statement of leaving the coalition | פרש/ה מהקואליציה | Left the coalition | Own statement |

For the legend in a vote view, a neutral umbrella line is used: **"Voted differently from own list / הצביע בשונה
מרשימתו"**, with a count. In the support view it is **"Apart from own list / בנפרד מרשימתו"**, with a count.
The Hebrew uses the gendered verb from the person's record (פרש / פרשה).

---

## 4. Time: an election result versus the Knesset on a date

There are three different "times". Each screen should show only one of them, and say which.

| Time | Question it answers | Screens | Individuals? |
|---|---|---|---|
| **Election result** | "What did the votes produce?" | Play, the History main chart, Compare | **No.** The seats belong to lists. The seat sheet may list holders (§6.4), but the chart never changes. |
| **Knesset on a date** ("as of") | "Who sat where on 25 Apr 2022?" | **After the election**: Factions and Government support views | Yes, with official and support events up to that date. |
| **A vote** | "How did each member vote on 13 Jun 2021?" | After the election: the investiture vote card, and later other key votes | Yes, from the roll call only. |

**The "as of" control** is a date scrubber on the term timeline in *After the election*, shown in mock-up B1. It has:

- **ticks** for swearing-in, government formation, each recorded individual event, dissolution and the end of term;
- a **title** that always reads "The Knesset on 25 Apr 2022", so a picture taken from it is never mistaken for
  the election result.

The scrubber snaps to events. Between events nothing changes, so there is nothing to show by the day. The default
date is the day the government was formed. That matches the existing government card.

**History and After-the-election.**

- Replacements and faction changes appear as **rows on the term timeline**, e.g.:
  - "8 Apr 2021 · Yosef Taieb entered (Deri: Norwegian law)";
  - "25 Apr 2022 · Chikli: left the faction (declared)".
- History's per-election summary may show one compact line at Standard and above, e.g. "During the term: 30 seats
  changed hands; 1 member left the faction". The line has an (i) and links to *After the election*. It is not a chart.

---

## 5. Engine and scenarios

### 5.1 Layers

1. **Seats per list from votes.** Unchanged, and the only thing the allocation engine computes.
2. **Composition.** Who holds each list seat: elected candidates in list order, after those who declined, then the
   historical **seat chains** over the term. This is **baseline data**, not computed from votes.
3. **Alignment.** For a given government and date: each MK's faction and support role. The default comes from their
   list's role in C1's coalition data (member / outside support / abstains / out). It is overridden by **official
   individual events** (data) and then by **user changes** (edits).

### 5.2 Edits

- **Official individual exceptions are data, not edits.** Chikli voting against, as recorded, is baseline. It is
  shown with its basis chip and **no** "Edited" marker.
- **A user change to an individual's role is a tangible edit.** It is recorded as an action in the scenario log
  (ADR 0006), e.g. `setMemberRole { electionId, governmentId, personId, role }`. It is counted in "N changes",
  marked **Edited** on the row and in the chart legend, and undoable.
- The owner has not yet decided whether **list-level coalition and bloc moves** count as scenario changes.
  Individual changes should follow the same rule so the siblings stay consistent. This design recommends
  counting both (Q5).
- **Share links (ADR 0009)** carry the actions. Each action names a **Knesset PersonID** (stable, official), not
  a slug or a list position. Replay skips an action whose person isn't seated in the scenario and reports the
  skip, as replay already does.
- **Saved scenarios** store the same actions. Pre-release, so there are no compatibility shims: the existing
  slug ids in `data/meta/aftermath/*.json` `individuals[]` (`amichai-chikli`) should move to PersonID when this
  is built.
- **Compare** lists individual differences as rows, e.g. "Nir Orbach · Supports → Against (Edited)", alongside
  list differences.
- **History** (undo) treats them like any other action.

### 5.3 When the user also changes the votes

If a what-if changes a list's seat count, the historical composition no longer applies.

- The app falls back to **list order**: the first N candidates who took up their seat, with no term history.
- Any official or user change about a person who is no longer seated is **set aside**, with a one-line notice:
  "1 member change doesn't apply: not elected in this scenario".
- The holder list and the "as of" scrubber are shown only for the **historical** baseline. In a changed
  scenario, the seat sheet says "Elected in this scenario", with the name from list order.

### 5.4 How the coalition tool counts

C1's investiture rule is **more for than against** (Basic Law: The Government §13(d)). Count per MK:

- `for` = list members + outside support, after individual changes;
- `against` = lists that are out, plus individual "against";
- `abstain` and `absent` are counted separately and don't enter the comparison.

Mock-up D shows:

- **Sourced, official data:** Chikli Against and al-Harumi Abstains.
- **A user what-if:** Nir Orbach Against. This is a **hypothetical edit made to demonstrate the control**, not a
  claim about his vote. It is marked **Edited**.
- The result is For 59 · Against 60 · Abstained 1, with **"✗ Not approved"**.

**Dependency to flag:** C1's brief says "individuals don't need modelling in Play". That is right for C1's
scope. This design adds individuals to the coalition tool as **stage 3**, as a layer on C1's per-list roles, so
nothing in C1 needs to change now. C1 only needs to keep roles **per list**, so that a per-person layer can sit
on top.

---

## 6. UI

### 6.1 Seat dots: the red ring and the alternatives

The chart already gives several meanings to rings and strokes:

- a joint-list component = ring in the list colour + inner fill in the party colour;
- a gained seat = a heavy ink stroke;
- a lost seat in the reference chamber = a dashed ink stroke.

Red is also a **party colour** (Labor's dots are red in the 2021 chart) and the app's colour for losses.

| Option | What it looks like | Verdict |
|---|---|---|
| **A1. Red ring** (owner's idea) | The seat stays in its list's place, with a red ring outside the dot. | **Not recommended.** (1) It collides with the joint-list ring and the gained/lost strokes. (2) It sits next to red Labor dots, and red already means "lost", so colour becomes the main signal. (3) It leaves the seat on the wrong side, so the picture still says Coalition 62 while the vote was 60–59–1. (4) Abstentions can't be shown. (5) Red reads as an accusation. |
| **A2. Seat shown where its vote went + pip** (recommended) | The seat moves to the side it actually voted or supports. It keeps its own list colour, so you can see it came from Yamina. A small **ink pip** with a surface halo sits at the upper right. The legend line has a count. | **Recommended.** The arithmetic in the picture is true. The mark is a **shape** that works in light, dark, print and greyscale. It doesn't collide with rings or strokes, and abstentions get their own group. |
| **A3. Hollow dot in place** | The seat stays, drawn as an outline. | **Not recommended.** It reads as "vacant" or "not sworn in", which is also misleading. The totals are still wrong. |

The pip is the **only** new seat mark for "apart from own list", in every view. It always sits at the upper right,
including in Hebrew, because graphics are not mirrored. A **selected** seat gets the existing focus ring, which is
different from the pip.

### 6.2 Several holders during the term

- A light **"stack" mark** (an offset outline behind the dot) indicates "more than one holder during the term".
  In 2021–22, **30 of 120 seats** had more than one holder (my seat chains from OData). Showing the stack on all
  of them by default is too noisy.
- Recommendation:
  - the stack mark is **off by default**;
  - it is a legend toggle ("More than one holder · 30") at Standard and above, and on by default at Expert;
  - the **holder list** is always available in the seat sheet.

### 6.3 Hover and the seat sheet

- **Desktop:** hover shows a one-line tooltip, e.g. "Amichai Chikli · Yamina #5 · Voted against". Click opens
  the **side sheet** (mock-ups C1 and E).
- **Phone:** tap opens a **bottom sheet**. Dots at 390 px are ~10 px wide, so the sheet has
  previous/next-seat arrows to step through neighbours without precise tapping.

The sheet for a person (E) contains:

- name, list and position, a colour swatch;
- the person's **event timeline**, e.g. "Sworn in · Voted against (Recorded vote) · Left the faction (Official) ·
  Resigned, Kalfon entered". Each row has a date, a basis chip and an (i) with the source quote and link;
- a **"Sources"** line, which opens the citations.

### 6.4 The holder list (the "dropdown")

The owner's "dropdown on a seat" becomes a **numbered list inside the seat sheet** (mock-ups C1 and C2) rather than
a select control. A list shows all holders at once, with dates and reasons, without hiding them behind a click.

- **Title:** "A Shas seat · 4 terms, 2 people".
- **Each row:** number, name, list position, a date range (`rng()` puts the start date on the right in Hebrew)
  and a reason line:
  - "Elected";
  - "Deri left: Norwegian law (i)";
  - "Returned: no longer minister";
  - "Deri resigned".
- **The row for the "as of" date** is filled in (●4).
- **Uncertain data is shown honestly** (C2):
  - **Probable** where M2's pairing of departure and entry is inferred;
  - **Reason not recorded** where no notice was found.
- **Selecting a row** jumps the "as of" date to that tenure, in *After the election* only.

### 6.5 Legends and (i)

- One line per mark, with a count:
  - "● Voted differently from own list 2";
  - "◎ More than one holder during the term 30".
- The basis chips (Official / Recorded vote / Own statement) appear in the sheet, not the legend, to keep the
  legend short.
- **(i) texts** are one or two sentences, e.g. *Left the faction*: "The Knesset House Committee declared this MK
  as having left their faction. By law they can't run on a list of a party represented in this Knesset at the
  next election, unless they resign in time." Plus a link.

### 6.6 Levels

| | Simple | Standard | Expert |
|---|---|---|---|
| Election-result chart | no individual marks | no individual marks | no individual marks |
| Seat sheet | the name of the current holder | + holder list | + basis and certainty chips, sources |
| After the election: investiture vote | pips + legend (the vote count must be true) | same | + roll-call table |
| After the election: "as of" scrubber | – | Government support view | + Factions view toggle; provisional items |
| Stack mark for several holders | – | legend toggle, off | on |
| Coalition tool: individuals | – | – (stage 3: Standard) | individual rows, with Edited marks |

Custom level: each row is a toggle.

### 6.7 Phone, Hebrew/English, light/dark, exports

- **Phone:**
  - bottom sheet;
  - the timeline drops its middle labels and keeps the end labels clamped inside the frame;
  - the legend wraps under the chart.
- **Hebrew/English:**
  - all labels are translated;
  - names come from `KNS_Person` (Hebrew) and the app's candidate data (English);
  - where an English name is missing, the Hebrew name is shown with a "no English name" note at Expert, never
    an invented transliteration;
  - charts stay LTR, and only text mirrors;
  - date ranges follow the app's locale convention.
- **Light/dark:**
  - the pip is `--ink` with a `--surface` halo; the stack outline is `--ink-2`;
  - in the mock-ups both stay visible against every party colour in both themes, including brown and light
    grey dots. This was checked by eye, not measured.
- **Exports (PNG):**
  - the export includes the legend with counts, the **title with the "as of" date or the vote name**, and the
    Edited marker if any;
  - basis chips are written as words, so a PNG never relies on colour.

### 6.8 Mock-ups

The mock-ups are standalone HTML/SVG rendered from real data: the app's `k24.json`, Knesset OData tenures and
faction rows, and the app's own `layout.ts` geometry. Each image is labelled "Mock-up". There are 25 PNGs at
2× native resolution, covering light/dark, HE/EN and desktop/phone. They are in the M1 scratch folder
`.backup-scratch/m1/png/` of the design worktree, and are not committed.

| ID | Scene | Files |
|---|---|---|
| A1 | 2021 vote, Chikli with the red ring (owner's idea) | `a-ring-en-light`, `a-ring-he-dark` |
| A2 | 2021 vote, grouped For 60 · Abstained 1 · Against 59, pips on Chikli and al-Harumi (**recommended**) | `a-moved-en-light`, `a-moved-he-dark`, `a-moved-he-light-phone` |
| A3 | 2021 vote, hollow dot | `a-hollow-en-light`, `a-hollow-he-dark` |
| B1 | Knesset on 25 Apr 2022, Government support view: Coalition 60 · Opposition 60, Chikli (Official), Silman (Own statement) | `b-support-en-light`, `b-support-he-dark`, `b-support-he-light-phone` |
| B2 | Same date, Factions view: Chikli as a one-member faction, Silman unmarked in Yamina | `b-factions-en-light`, `b-factions-he-dark` |
| C1 | A Shas seat: Deri → Taieb → Deri → Taieb, holder list | `c-deri-en-light`, `c-deri-he-dark`, `c-deri-he-light-phone`, `c-deri-en-dark-phone` |
| C2 | A Yamina chain, with *Probable* and *Reason not recorded* | `c-yamina-en-light`, `c-yamina-he-light` |
| D | Coalition tool with individual rows (2 sourced, 1 Edited what-if) | `d-coalition-en-light`, `d-coalition-he-dark`, `d-coalition-he-light-phone` |
| E | Chikli's sheet with his event timeline | `e-sheet-en-light`, `e-sheet-he-dark`, `e-sheet-he-light-phone`, `e-sheet-en-dark-phone` |

---

## 7. Data contract

One file per Knesset, next to the existing aftermath data, e.g. `data/meta/members/kN.json`. It is built from M2's
research JSON plus reviewed reasons and sources.

```jsonc
{
  "schemaVersion": 1,
  "knesset": 24,
  "electionId": "k24",
  "asOf": "2026-11-07",
  "persons": {
    "30786": { "he": "עמיחי שיקלי", "en": "Amichai Chikli", "gender": "m",
               "candidate": { "listId": "ב", "position": 5 } }   // links to the app's candidate rows
  },
  "tenures": [
    { "personId": 30786, "start": "2021-04-06", "end": "2022-07-14",       // [start, end), OData 43/61
      "entry": "elected",                       // elected | replacement | return
      "exit": "resignation",                    // resignation | death | norwegian | appointment | end-of-term | other | unknown
      "seatChain": "ב-5",                       // stable chain id; a returning MK continues the chain of the one who leaves
      "replaces": null, "replacedBy": 30791,   // Kalfon
      "certainty": "confirmed", "sources": ["odata-k24-23841", "bagatz-6615-22"] }
  ],
  "events": [
    { "personId": 30786, "type": "vote", "vote": "against", "voteId": "investiture-36",
      "date": "2021-06-13", "basis": "vote", "certainty": "confirmed",
      "sources": [{ "id": "n12-2021-06-13", "quote": "…" }] },
    { "personId": 30786, "type": "left-faction-declared", "date": "2022-04-25",
      "toFaction": 1080, "legal": "Knesset Law §61(a)", "basis": "official",
      "certainty": "confirmed", "sources": ["bagatz-6615-22", "odata-k24-23676"] },
    { "personId": 30718, "type": "left-coalition", "date": "2022-04-06", "governmentId": "36",
      "basis": "statement", "certainty": "confirmed", "sources": ["israelhayom-9767689", "bagatz-6600-22"] }
  ],
  "factions": { "1080": { "he": "חה\"כ עמיחי שיקלי", "en": null, "from": "2022-04-25" } },
  "gaps": [ { "what": "reason", "candidate": { "listId": "ב", "position": 10 }, "note": "Why #10 did not enter in 2022 is not recorded" } ]
}
```

**Rules:**

- **Key** on Knesset **PersonID**. Link to the app's candidates by list and position; the existing membership audit
  (`docs/research/elected-names-odata-audit.md`) is the template. Slugs in `aftermath/*.json` move to PersonID.
- **Dates:** `[start, end)` half-open intervals.
  - A resignation records both the **submission date** and the **effective date** (§41 adds 48 hours). Example:
    Chikli submitted on 12 Jul and it took effect on 14 Jul 2022. These are not a contradiction.
  - Never force the head-count to 120. M2 found six boundary dates with fewer. Show a vacancy as a vacancy.
- **Basis** is one of `official | vote | statement`. Commentary is never stored as an event.
- **Certainty** uses E1's five labels. `reason: unknown` and `pairingBasis: unresolved` from M2 are kept and
  shown, never filled from general knowledge.
- **Sources** use the existing citation registry, with short quotes. Secondary sources are labelled.
- **Votes** are a separate table (`votes/kN.json`), added only where a roll call has been retrieved. **Do not assume
  roll calls exist.** M2's attempt to get vote records was blocked (HTTP 473). Without a roll call, a vote card shows
  list totals only and says "Roll call not available".

### 7.1 Per-Knesset research checklist

1. Pull OData `KNS_PersonToPosition` (43, 61, 54) and `KNS_Person` for the Knesset. Keep the raw file with its
   fetch date.
2. List tenures; confirm 120 at the opening against the CEC list of elected members. Record who declined.
3. Build seat chains by §43:
   - the next candidate enters;
   - a returning minister displaces the **last** entrant (§43(b)).
   Mark each pairing **confirmed** (notice found) or **probable** (inferred).
4. For each departure, find the **reason** in a Knesset notice or Reshumot (resignation, death, Norwegian law,
   appointment). Otherwise record `reason: unknown`.
5. For each faction change in OData, find the **House Committee decision** (split, §61 declaration, joining).
   Otherwise label it *Legal basis not recorded*.
6. For each government: find the **investiture roll call** (and, if in scope, confidence and dissolution votes).
   Record individuals who voted differently from their list, abstained or were absent.
7. Look for **own statements** of leaving or joining the coalition. Record only dated statements by the person
   themselves, with a quote.
8. Check the head-count on every boundary date; explain each gap.
9. Fill in English names only from a source. Record missing ones as gaps.
10. Cross-check with Hebrew Wikipedia's "חברי הכנסת ה-N" table **as a pointer only**, and resolve differences
    from primary sources.

---

## 8. Risks, costs and a staged plan

**Risks**

- **Named people raise the stakes.** A wrong date or label about a person is worse than a wrong seat total.
  Mitigation:
  - official and recorded acts only;
  - basis chips and source quotes;
  - provisional items hidden below Expert;
  - a "Report a correction" link on every sheet.
- **Partisan reading.** Even neutral marks can be read as a judgement. Mitigation:
  - no umbrella word;
  - the pip is the same for every view and side;
  - joint-list splits are labelled as routine.
- **Data gaps.** Reasons, pairings, House Committee decisions and roll calls are mostly missing (M2). The UI must
  show *Probable* and *Reason not recorded* as normal states, not errors.
- **Official dates lag events.** Example: Gur in 1990. The support view needs statements or votes to be
  accurate. Where they are missing, it falls back to the official date and says so.
- **Scope creep** into vote-by-vote tracking (the abgeordnetenwatch model). Keep to investiture and, later,
  dissolution and no-confidence votes that brought a government down.
- **Density.** 120 dots on a phone. Pips are small, and the stack mark is off by default.

**Staged plan**

| Stage | What | Cost (rough) |
|---|---|---|
| **0. Data** | Normalise M2's tenures into seat chains with PersonIDs. Start with k24 and k25; reasons from notices. | Research: about a day per Knesset for recent Knessets, more for older ones. Build: 1 day for the schema and checks. |
| **1. Holder list** | The seat sheet shows holders with dates, reasons and basis, at Standard and above. Stack-mark toggle. Read-only. | 2–3 days. |
| **2. Knesset on a date** | The "as of" scrubber in *After the election*: Support and Factions views, pips, legends. The investiture vote card uses the roll call where available (k24 now). | 3–5 days. |
| **3. Coalition tool individuals** | Per-person roles as scenario actions; links, saved scenarios, Compare. | 3–4 days, after C1 lands. |
| **Defer** | Suspensions; votes other than investiture; photos; English names for every MK; Knessets before 1991 for the §61 labels (the faction moves can still be shown). | – |

---

## 9. Sources

Primary sources unless labelled. Accessed 7 November 2026. Certainty labels follow E1.

**Knesset OData and laws**

- Knesset OData `ParliamentInfo.svc`: `KNS_PersonToPosition` (43/61/54), `KNS_Person`, `KNS_Faction`. Fetched with
  this project's UA for the 12th, 20th, 23rd, 24th and 25th Knessets. Rows cited by ID in §3.
- **Basic Law: The Knesset** §6A, §41, §42c, §43; **Knesset Law 1994** §61; **Basic Law: The Government** §13(d).

**Court judgments**

- Supreme Court, **ע"ב 6615/22** (Chikli v. CEC), judgment of 9 Oct 2022:
  `https://supremedecisions.court.gov.il/Home/Download?fileName=22066150.V07&path=HebrewVerdicts%2F22%2F150%2F066%2Fv07&type=4`
- Supreme Court, **בג"ץ 6600/22** (Silman), judgment of 9 Oct 2022:
  `https://supremedecisions.court.gov.il/Home/Download?fileName=22066000.V07&path=HebrewVerdicts%2F22%2F000%2F066%2Fv07&type=4`

**Press** (contemporary reports, used for dates and own statements)

- **Chikli, 25 Apr 2022:** ynet: <https://www.ynet.co.il/news/article/bjnec7xs5>; Maariv, on what the declaration
  means: <https://www.maariv.co.il/news/politics/article-913697>.
- **Silman, 6 Apr 2022:**
  - Israel Hayom: <https://www.israelhayom.co.il/news/politics/article/9767689>
  - ynet: <https://www.ynet.co.il/news/article/bj9t6tcxc>
  - Globes: <https://www.globes.co.il/news/article.aspx?did=1001408302>
  - Haaretz: <https://www.haaretz.co.il/news/politi/2022-04-06/ty-article/.free/00000180-5ba4-def0-a3c3-5ffd78e50000>
- **Silman, 15 Aug 2022 (split refused):** ynet: <https://www.ynet.co.il/news/article/rjcno100a9>; Jerusalem Post:
  <https://www.jpost.com/israel-elections/article-714777>. Open Knesset meeting mirror (secondary):
  <https://oknesset.org/meetings/2/1/2195274.html>.
- **13 Jun 2021 roll call:** N12: <https://www.mako.co.il/news-politics/2021_q2/Article-61ff3bc2da60a71027.htm>;
  already registered as `n12-2021-06-13`.
- **Deri, Norwegian law, Apr 2021:**
  - Kikar HaShabbat: <https://www.kikar.co.il/haredim-news/389092>
  - C14: <https://www.c14.co.il/article/486802>
  - Jerusalem Post: <https://www.jpost.com/breaking-news/deri-and-litzman-resign-from-knesset-under-the-norwegian-law-664298>
- **Deri, resignation, Jan 2022:**
  - ynet: <https://www.ynet.co.il/news/article/hji8ntq6k>
  - Haaretz: <https://www.haaretz.co.il/news/law/2022-01-23/ty-article/0000017f-f63b-d887-a7ff-feffe7380000>
  - Times of Israel: <https://www.timesofisrael.com/deri-resigns-from-the-knesset-in-line-with-tax-offense-plea-deal/>
- **1990 investiture, 62–57:** JTA: <https://www.jta.org/archive/shamir-government-wins-approval-in-the-knesset-by-a-vote-of-62-57>.

**Secondary sources and research leads**

- **M2 research** (Codex lane, branch commit `34fb656`): `docs/research/knesset-member-changes.md` and
  `data/research/knesset-member-changes/kN.json`. Tenures, probable pairings and gaps.
- **Hebrew Wikipedia, as a secondary pointer only:** the article on Idit Silman was used to find dates, which were
  then checked against the judgment above.

**Not verified here** (left as gaps, not filled in):

- Gur's deputy-minister date from primary sources.
- The source of the House Committee declaration for Orly Levy in 2017.
- Why Yamina #10 Maimon did not enter in 2022.
- Starkmann's English name.
- The House Committee decisions for the 1990, 2020 and 2022–24 faction changes.
- Roll calls for investitures other than 2021.

---

## Owner questions

### Q1. Should there be a "rebel" mark, and what is it called?

**What it is:** a way to show, on the seat chart, an MK who acted apart from their own list, for example Chikli voting
against the 2021 government. **Why there's a choice:** one word for everyone is simple, but words like "rebel" or
"defector" judge the person, and *פורש* is a legal status that only some of them have.

- **a)** No umbrella word. Each person gets a label for what they did, e.g. *Voted against*, *Left the faction*,
  *Left the coalition*, with a small chip saying where it comes from (Official / Recorded vote / Own statement).
- **b)** One neutral umbrella word for everyone, e.g. "Apart from own list / בנפרד מרשימתו", with details in the sheet.
- **c)** A "rebel / מורד" label.

**Recommendation:** a). The legend still has one neutral line with a count. No extra cost; this is the basis for
everything else.

### Q2. How should such a seat look?

**What it is:** the mark on the dot itself. **Why there's a choice:** rings and strokes already mean "joint list"
and "gained or lost seat", red is a party colour and means "lost", and a seat left in its list's place makes the
total look wrong (62 for the coalition while the vote was 60–59). See mock-ups A1–A3.

- **a)** Your red ring, with the seat staying in place (A1).
- **b)** The seat is drawn where its vote went, keeps its list colour, and gets a small dark pip (A2).
- **c)** A hollow dot in place (A3).

**Recommendation:** b). The picture adds up, abstentions can be shown, and it doesn't rely on colour. Same cost as
the others.

### Q3. Does Silman's own statement move her?

**What it is:** in April 2022 Silman announced she was leaving the coalition, but the Knesset never recorded her as
leaving her faction. **Why there's a choice:** moving her matches politics (60–60); leaving her matches the
official record.

- **a)** Move her only in the *Government support* view, labelled *Own statement*. Leave her in Yamina in the
  *Factions* view (B1 and B2).
- **b)** Never move anyone without an official record.
- **c)** Move her everywhere.

**Recommendation:** a). It shows both truths, each labelled. It needs the two-view switch, which is part of stage 2.

### Q4. Where do seats with several holders show?

**What it is:** during a term, a seat can pass between people, e.g. Deri → Taieb → Deri → Taieb. In 2021–22,
30 of 120 seats changed hands. **Why there's a choice:** showing it everywhere is noisy; hiding it loses real history.

- **a)** A holder list in the seat sheet everywhere (Standard and above), a "stack" mark behind a legend toggle,
  and an "as of" date only in *After the election* (C1).
- **b)** The stack mark always on the main chart.
- **c)** Only in *After the election*.

**Recommendation:** a). About 2–3 days after the data is ready (stage 1).

### Q5. Do changes to individuals in the coalition tool count as edits?

**What it is:** letting you set one MK's vote in the coalition tool, e.g. "what if Orbach had voted against" (D).
**Why there's a choice:** this follows your open decision on whether coalition and bloc moves count as scenario
changes. Siblings should behave the same.

- **a)** Yes: counted in "N changes", marked *Edited*, and saved in links and Compare.
- **b)** No: treated like appearance.
- **c)** Don't offer individual changes; show official exceptions only.

**Recommendation:** a), together with coalition moves counting too. About 3–4 days, after C1 (stage 3).

### Q6. What to build first?

**What it is:** this is four pieces of work. **Why there's a choice:** the research cost is real, and old Knessets
have the most gaps.

- **a)** Data for 2021 and 2022 first, then the holder list → Knesset on a date → coalition tool (§8).
- **b)** Research every Knesset before building anything.
- **c)** Only the 2021 vote marks for now.

**Recommendation:** a). The first visible result arrives in about a week, and each later stage stands on its own.
