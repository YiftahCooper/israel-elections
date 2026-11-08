# Individual MKs: members who leave, are replaced, or act apart from their list

*Written 7 November 2026; rewritten in plain language on 8 November 2026. Nothing was removed: every fact, date, number and source of the earlier version is kept.*

## In short

- **What this is about.** Today the app shows seats as belonging to lists. But during a Knesset term, individual
  members of the Knesset (MKs) resign, die, are replaced, vote against their own list's government, or leave their
  parliamentary group. This document designs how the app could show those individual events.
- **Why it exists.** The owner asked on 7 November for cases like Amichai Chikli (who voted against his own list's
  government in 2021), for a list of everyone who held each seat during a term, and for a visual mark on such seats.
  He also asked where to draw the line, using Idit Silman as the hard example.
- **What was found.** The Knesset's own online database records who sat in the Knesset, and in which parliamentary
  group, with dates. It does not record *why* (for example, leaving the coalition). Recorded votes by name are
  hard to obtain. In 2021–22, 30 of the 120 seats had more than one holder.
- **Decided by the owner on 8 Nov:** the **"Knesset on a date" timeline** (mock-up B1) is the core of the feature.
  It gets arrows to step to the previous or next event. Only events that changed the Knesset or the government go
  on it: 7 October 2023 is not on it, but National Unity joining the government days later is.
- **Decided by the owner on 8 Nov:** **Silman is shown by date.** Before 6 April 2022 she is a coalition member;
  from that day she is on the opposition side, marked. The same applies to everyone.
- **Decided by the owner on 8 Nov:** the rule is **matters of fact** ("voted against the government", "left the
  coalition"), not only official records. Hard cases are settled by trusted historians and journalists. Parties
  that withhold votes or vote against government bills to extract concessions, without meaning to bring the
  government down (for example Otzma Yehudit and UTJ in the 2022 Knesset), are **not** events and get no mark. How
  to judge that intent will be planned later.
- **Still open, being re-asked** on the [rebels page](https://claude.ai/artifact/LsQoG9ihRxFDKjUUodsGka): whether to
  use one word such as "rebel" (Q1); what the mark on such a seat looks like (Q2: new mock-ups are being made); how
  seats with several holders are shown (Q4); whether changing one MK in the coalition tool counts as an edit (Q5);
  and what to build first (Q6). This document keeps the recommendations he was shown on 7 Nov for each, clearly
  labelled as such.
- **Out of date since 7 Nov:** moving a whole list between blocs or coalition roles now counts as a scenario change
  again (see the top of the changelog). The earlier text said the owner had not yet decided this.

## Words used in this document

- **MK:** a member of the Knesset, Israel's parliament (120 seats).
- **List:** what voters choose on the ballot: a party, or several parties running together, with an ordered list of
  candidates. Seats are won by lists.
- **Faction (סיעה):** the parliamentary group of MKs inside the Knesset. It usually starts as the MKs elected on one
  list, but it can split, and MKs can leave it.
- **House Committee:** the Knesset committee that decides on faction splits and on declaring that an MK has left
  their faction.
- **CEC:** the Central Elections Committee, which runs elections and publishes the official list of elected members.
- **Knesset database:** the Knesset publishes an online database (called OData) with one record per person per
  position, with start and end dates. It is the official backbone for who sat where and when.
- **PersonID:** the Knesset's permanent number for each person. Names change spelling; this number does not.
- **Norwegian law:** a rule that lets a minister or deputy minister give up their Knesset seat, so the next
  candidate on the list enters. If they stop being a minister, they can return to the Knesset.
- **Investiture vote:** the vote in which the Knesset approves a new government. A government needs more votes for
  than against.
- **Roll call:** a record of how each MK voted, by name. Many votes are recorded only as totals.
- **Seat chain:** the sequence of people who held one seat during a term, for example Deri → Taieb → Deri → Taieb.
- **Coalition / opposition:** the parties that support the government, and those that do not.
- **App screens mentioned:** *Play* is the sandbox where you change results; *History* shows the past elections;
  *After the election* shows recommendations to the President, government formation and the term's events;
  *Compare* puts two elections or scenarios side by side. The app has levels of detail: *Simple*, *Standard*,
  *Expert* and *Custom*.

## The rule as recommended on 7 Nov

The design shown to the owner on 7 Nov put it in one sentence: an MK is shown apart from their list only because
of **their own recorded act**. The act is dated and labelled with where the fact comes from: **Official** (a
Knesset record), **Recorded vote** (a vote by name), or **Own statement** (the MK's own public words). It is shown
only in the view that the act is about. Other people's commentary and descriptions never move or mark anyone.

The owner's 8 Nov decisions (above, and in [section 3](#3-where-to-draw-the-line)) keep the "matters of fact"
idea but widen it: hard cases are settled by trusted historians and journalists, and some votes are excluded
because they were not real attempts to change the government.

**Summary of the 7 Nov recommendations** (each one is marked with its status now):

- **No "rebel" mark or word.** Use specific factual labels instead: *Left the faction / פרש מהסיעה*, *Voted against /
  הצביע נגד*, *Left the coalition / פרש מהקואליציה*. *Status: being re-asked (Q1).*
- **Not the red ring.** The seat is **drawn where its vote or support went**, keeps its own list colour, and gets a
  small dark dot in its corner. Mock-up A2. *Status: being re-asked with new mock-ups (Q2).*
- **Silman** moves to the opposition side in the *Government support* view from 6 April 2022, labelled
  **Own statement**. She stays in Yamina in the *Factions* view, because the Knesset never recorded otherwise.
  **Chikli** moves in the vote view from 13 June 2021 (**Recorded vote**). He becomes a one-member faction from
  25 April 2022 (**Official**). *Status: replaced on 8 Nov by "shown by date" on the timeline.*
- **Seats with more than one holder** get a list of holders in the panel that opens when you click a seat, with
  dates, reasons and source labels. A faint outline behind the dot (a "stack" mark) is optional. The Knesset-on-a-date
  view lives in *After the election*, not in the election result. *Status: being re-asked (Q4); the timeline
  itself is decided.*
- **Changing an individual MK in the coalition tool is a scenario edit.** It is recorded like any other change,
  marked "Edited", and carried in links, saved scenarios and Compare. Official exceptions are data, not edits.
  *Status: being re-asked (Q5).*

---

## 1. What other tools do

Before designing, the research looked at how serious parliamentary tools handle individual members.

| Tool | What it records | What to borrow | What to avoid |
|---|---|---|---|
| **Knesset database (OData)** | One record per person per position, with start and end dates: one kind of record for being an MK, another for faction membership (with the faction's number). Factions themselves have dates. | The **date-range model**: person × role × from-date to to-date, and the stable **PersonID**. This is the official backbone. | Treating a record as the legal reason. A faction record says *where* someone sat, not *why* (a split, leaving, a rename). Some dates lag behind the political event (see Efraim Gur in [section 3](#3-where-to-draw-the-line)). |
| **Knesset website** (MK pages, the "פילוגים ואיחודים" list of splits and mergers, House Committee minutes) | Biographies, faction history, the official list of splits and mergers. | Its **words for splits and mergers**, which this design uses for its event names. | It refused access from our location during this research, so it couldn't be relied on (the member-changes research found the same). |
| **Open Knesset (oknesset.org)** | A copy of the Knesset's member pages and committee meetings. | A convenient **pointer** to minutes, e.g. the 15 Aug 2022 House Committee meeting on Silman's request. | It is a copy, so treat it as **secondary**; cite the minutes themselves where they can be reached. |
| **UK Parliament "State of the parties"; by-election lists** | Seat totals by party **as of a date**, with a log of changes. MPs who lost the whip are listed as *Independent* under their own row. | The **"as of" date** next to any picture of the parliament, and a change log that explains each difference from the election result. Separate rows for official status changes. | The UK has no list replacements; its seats are constituencies. |
| **Bundestag "Mandatsveränderungen" / abgeordnetenwatch** (Germany) | List successors (*Nachrücker*) who enter when a member leaves; *Fraktionswechsel* (changes of parliamentary group), with dates. | The closest match to the Israeli list system: **a successor enters from the same list**, shown as a new person in the same seat, with a reason. | abgeordnetenwatch also scores every vote, which would go far beyond this feature ([section 8](#8-risks-costs-and-order-of-work)). |
| **ParlGov** | Cabinets and parliament seats by party only. No individuals. | It confirms that **seat counts per party stay the main unit**; individuals are a layer on top. | Nothing to borrow for individuals. |
| **Hansard Society** (UK) | Explainers on whips, rebellions and confidence votes. | Its practice of reporting **specific votes** ("voted against the government on X") instead of a general label. | Its "rebel" vocabulary. In an Israeli context the word can read as a judgement. (The owner has asked whether "rebel" is in fact the normal Israeli word; this is being re-asked, Q1.) |
| **Israel Democracy Institute (IDI)** (explainers on the Norwegian law and on members who leave their faction) | Plain explanations of the Norwegian-law section (§42c) and of leaving a faction (§6A; Knesset Law §61). | The **(i) texts**: short legal explanations with a link. | Nothing. |
| **Hebrew Wikipedia** tables "חברי הכנסת ה-N" (secondary source) | Tables of replacements, with dates. | A **labelled secondary pointer** for finding cases to check. | Never the source of record. |

**What we take from this:**

- Record **each person's time in office with dates**, keyed by the Knesset's PersonID.
- Show any picture of the Knesset with an explicit **"as of" date**.
- Report **specific acts** (a vote, a faction change), never a general character label.
- Keep seats won by lists from votes as the core unit.

---

## 2. What can happen to an individual MK

Each kind of event has a type of evidence. The type decides the label and the small label that says where the
fact comes from.

- **Official:** a Knesset or legal record.
- **Vote:** a recorded vote by name (roll call).
- **Statement:** the MK's own public, dated statement.
- **Commentary:** anyone else's description.

| Event | Where the official record is | Evidence type | What the app does |
|---|---|---|---|
| **Sworn in at the start of the term** | The start date in the Knesset database; the Knesset's swearing-in record | Official | This person is the first holder in the seat's chain. |
| **Did not take up the seat** (declined, or withdrew before swearing-in) | The CEC's list of elected members; the candidate's notice. The Knesset database has no record of time in office for them. | Official | That place on the list is skipped and the next candidate holds the seat. Already partly in the app's data, e.g. Davidi, Yamina #3, 2021. |
| **Resignation** | Basic Law: The Knesset §41 (a resignation letter takes effect **48 hours** later); a Knesset notice; the end date in the database | Official | Ends the person's time in the seat. The next candidate enters "in his place" (§43(a)). The reason may be unknown. |
| **Death** | A Knesset notice; the end date in the database | Official | Ends the time in the seat; the next candidate enters. |
| **Resigning under the Norwegian law** (a minister or deputy minister gives up the seat) | §42c; the Knesset notices of the resignation and of the replacement | Official | Ends the time in the seat, and the next candidate enters. The minister keeps a **right to return**. |
| **Returning under the Norwegian law** (stops being a minister) | §42c and §43(b) and (c): membership is renewed, and **the last person who entered from that list leaves**. A swap notice under §42c(f)/§43(d) is possible. | Official | The returning MK takes over **the seat chain of the person who leaves**. So one person can appear in two chains (Kahana and Kalfon in 2021–22). |
| **Appointment to an office that cannot be combined with being an MK** (e.g. a judge, the State Comptroller), or loss of membership by law | The relevant law plus the Knesset notice | Official | Treated like a resignation. The stated reason is recorded. |
| **Suspension** (by the House Committee or the Ethics Committee) | The committee's decision | Official | **Not a departure.** The person still holds the seat. Shown only in that person's own panel, as an event. Left for later. |
| **Faction split** (התפלגות), recognised by the House Committee | The 1994 Knesset Law (on splits); the House Committee decision; a new faction number in the database | Official | In the *Factions* view, the seats move to the new faction from that date. Most break-ups of joint lists are of this kind (the 2020, 2022 and 2024 cases in [section 3](#3-where-to-draw-the-line)). They are routine, not a departure from the list voters chose. |
| **Leaving the faction** (פרישה), declared by the House Committee | A decision under Knesset Law **§61(a)**; consequences under Basic Law: The Knesset **§6A** (the MK cannot run at the next election on the list of a party represented in the outgoing Knesset, unless they resign "close to" leaving); the database moves them to a one-member faction | Official | In the *Factions* view, the MK sits as a **one-member faction**, labelled *Left the faction (declared)*. The (i) explains §6A in one line. |
| **Joining another faction** | The database's faction records; the House Committee | Official | In the *Factions* view, the MK sits with the new faction from that date. |
| **Sitting alone with no declaration found** | The database shows a one-member faction | Official (the faction record); the legal type is unknown | Shown the same way. The label is *Sits as a one-member faction*, plus *Legal basis not recorded* if no decision was found. |
| **Voting against their own list's position** on the investiture, a confidence or no-confidence vote, the budget, or dissolving the Knesset | The Knesset's vote record (roll call) | Vote | Shown **only in that vote's view**: the seat is drawn with the side it voted for, plus a mark. Abstentions and absences are shown the same way. |
| **Leaving the coalition while staying in the faction** | The MK's own dated public statement (a letter, a press conference). There is no Knesset record. | Statement | Shown in the *Government support* view from that date, labelled **Own statement**. It never changes the *Factions* view. |
| **"Considered a defector", "voting with the opposition", etc.** in commentary | None | Commentary | **Never shown as a label.** It may lead researchers to look for one of the acts above. (Under the 8 Nov rule, the account of a trusted historian or journalist may decide a hard case: see [section 3](#3-where-to-draw-the-line).) |

**Words matter.** The Hebrew word *פורש* has a legal meaning (§61 / §6A). Use it **only** where the House Committee
declared it. A member who only announces that they are leaving the coalition is described differently:

- **Hebrew:** *פרש/ה מהקואליציה*, which means "left the coalition".
- **English:** *Left the coalition*.

---

## 3. Where to draw the line

> **Decided by the owner on 8 Nov:**
> - Use **matters of fact**, such as a recorded vote ("voted against the government") or a dated act ("left the
>   coalition"). An official Knesset record is not required: requiring one would leave out clear cases only because
>   no formal process ever labelled them.
> - For **hard edge cases**, follow trusted historians and journalists (see the
>   [source policy](../source-policy.md) and the [trusted sources plan](../research/trusted-sources.md)).
> - **Not events:** parties that withhold votes, abstain, or vote against a government bill to extract concessions,
>   without meaning to bring the government down. Examples: Otzma Yehudit and UTJ in the 2022 Knesset, voting
>   against or abstaining on government bills despite their coalition agreement. They get no mark and no place on
>   the timeline. Intent is hard to prove; a plan for judging it will be made later.
> - **Silman is shown by date** on the "Knesset on a date" timeline: a coalition member until 5 April 2022; on the
>   opposition side, marked, from 6 April 2022. The same approach applies to everyone.

### 3.1 The rule as recommended on 7 Nov

The earlier recommendation: an MK is shown apart from their list **only on the strength of their own recorded
act**, in the view that the act is about, from the date of the act.

| View | What can move or mark an individual |
|---|---|
| **Election result** (Play, and History's main chart) | Nothing. The seats belong to lists. |
| **Factions** on a date (After the election) | **Official** records only (a split, a declared leaving, joining another faction, a one-member faction). |
| **Government support** on a date (After the election; the starting point of the coalition tool) | **Official** + **Recorded vote** + **Own statement**, with the most recent act in effect. |
| **One specific vote** (e.g. the investiture vote) | That vote's **roll call** only. |

**Why this rule was recommended:**

- It is **neutral**, because it never asks us to judge motives or loyalty. Every mark is something the person did, on
  a date, that anyone can check.
- It keeps the strongest claims (Official) apart from weaker ones (Own statement) with a visible label saying where
  each fact comes from, rather than hiding the difference.
- It handles Chikli and Silman without treating them as "the same category", or as different degrees of a single
  wrong: they did **different things**, and each is shown for what it was.

How the 8 Nov decision changes it: matters of fact still drive everything, and the timeline now shows each person
by date. The new parts are that trusted historians and journalists settle hard cases, and that votes cast only to
extract concessions are excluded.

**How sure each fact is** (from the project's [source policy](../source-policy.md)):

- Each event also carries one of five certainty levels: *confirmed / probable / provisional / disputed / unknown*.
- Normal views show **confirmed** and **probable** events. Probable ones are marked *Probable*.
- **Provisional** and **disputed** events appear only at the Expert level, with a label.
- An **unknown** reason is written as *Reason not recorded*, never guessed.

<details>
<summary><strong>Replaced on 8 Nov:</strong> the old options for Silman (question 3)</summary>

The question shown on 7 Nov was "Does Silman's own statement move her?". In April 2022 Silman announced she was
leaving the coalition, but the Knesset never recorded her as leaving her faction. Moving her matches the politics
(60–60); leaving her matches the official record.

- **a)** Move her only in the *Government support* view, labelled *Own statement*. Leave her in Yamina in the
  *Factions* view (mock-ups B1 and B2). This was the recommendation: it shows both truths, each labelled, and it
  needs the switch between the two views, which was part of the "Knesset on a date" work.
- **b)** Never move anyone without an official record. *Rejected by the owner on 8 Nov.*
- **c)** Move her everywhere. *Rejected by the owner on 8 Nov.*

The owner's 8 Nov decision replaces these: she is shown by date on the timeline (see the box above).

</details>

### 3.2 The cases

Sources are listed in [section 9](#9-sources). The Knesset database records were fetched with this project's own
identification on 7 November 2026. "How it would be shown" is the 7 Nov design; on the decided timeline, each of
these appears from its date.

#### Amichai Chikli (Yamina, 24th Knesset, elected 2021)

- **What happened:**
  - Sworn in on 6 Apr 2021.
  - **Voted against** the investiture of the 36th government (the Bennett–Lapid government) on 13 Jun 2021. The
    result was 60 for, 59 against, 1 abstention.
  - Yamina applied to the House Committee on 7 Apr 2022.
  - On 25 Apr 2022 the Committee **declared him as having left the faction** under §61(a), by 7–0. The Knesset
    database moves him to a one-member faction that day.
  - He withdrew his appeal on 10 Jul 2022.
  - He submitted his resignation on 12 Jul 2022. It took effect on **14 Jul 2022**, and Kalfon entered.
  - On 28 Sep 2022 the CEC chair disqualified him from the Likud list under §6A.
  - **The Supreme Court allowed his appeal on 9 Oct 2022**, by majority.
- **Evidence type:** a vote, then official records.
- **How it would be shown:** in the *investiture vote*, drawn with **Against**, with a mark and "Voted against"
  (Recorded vote). In the *Government support* view from 13 Jun 2021: on the opposition side, with a mark. In the
  *Factions* view from 25 Apr 2022: a one-member faction, "Left the faction (declared)" (Official). Not shown from
  14 Jul 2022.
- **How sure:** confirmed. The Supreme Court judgment ע"ב 6615/22 recites the dates; the Knesset database; press
  reports.

#### Idit Silman (Yamina, 24th Knesset)

- **What happened:**
  - On 6 Apr 2022 she sent a letter ending her membership in the coalition and resigned as coalition chair. This left
    the coalition at 60–60.
  - She was **never declared** as having left the faction.
  - On 15 Aug 2022 the House Committee **refused** her request to split off as a one-member faction, by 4–3.
  - She resigned with effect from 13 Sep 2022 (Starkmann entered).
  - Her candidacy on the Likud list was upheld (9 Oct 2022).
- **Evidence type:** her own statement; the refusal is official.
- **How it would be shown (7 Nov design):** in the *Government support* view from 6 Apr 2022: on the opposition
  side, with a mark, "Left the coalition", labelled **Own statement**, with the note "Still in the Yamina faction".
  In the *Factions* view: in Yamina, with **no mark**, because nothing official changed.
- **Decided by the owner on 8 Nov:** on the timeline she is a coalition member before 6 April 2022 and on the
  opposition side, marked, from that date.
- **How sure:** confirmed. Supreme Court judgment בג"ץ 6600/22; ynet, Israel Hayom, Globes and Haaretz, 6 Apr 2022;
  ynet, 15 Aug 2022.

#### Said al-Harumi (Ra'am, 24th Knesset)

- **What happened:** he **abstained** in the 13 Jun 2021 investiture vote, while Ra'am supported the government.
- **Evidence type:** a vote.
- **How it would be shown:** only in the *investiture vote*: drawn in the Abstained group, with a mark. No mark
  anywhere else: abstaining in one vote is not a departure.
- **How sure:** confirmed. Knesset press release; N12's list of how each MK voted; already in the app's data for
  the 2021 election.

#### The 1990 "dirty trick" (התרגיל המסריח), 12th Knesset

This is the press name for the political crisis of March 1990.

- **What happened (Knesset database):**
  - Modai, Sharir, Goldberg, Goldstein and Grupper move from the Likud faction to "המפלגה לקידום הרעיון הציוני" on
    **15 Mar 1990**.
  - Sharir returns on 18 Jun, Goldberg on 4 Dec.
  - Four more members change faction on **25 Dec 1990**: Mizrachi, Peretz, Gur and Biton.
  - The Shamir government won its investiture vote 62–57 on 11 Jun 1990 (JTA).
- **Evidence type:** official (faction records). The legal type of each move is not verified.
- **How it would be shown:** in the *Factions* view, each member is with the new faction from the date in the
  database, labelled "Moved to faction X". They are **not** called *פורש*: the §6A restriction came with
  Amendment 12 (1991), **after** these events, and no declaration was found. The *1990 investiture vote* shows
  individuals only if a roll call is found. Otherwise it shows **list totals only**, with the note "Roll call not
  available".
- **How sure:** the faction dates are **probable**. The database records are confirmed, but the research could not
  open the Knesset's official page of splits and mergers. The legal type is **unknown**.

#### Efraim Gur (Alignment, 12th Knesset)

- **What happened:** the Knesset database moves him to "אחדות למען השלום והעלייה" only on **25 Dec 1990**, then to
  Likud on 17 May 1992. A secondary source (a copy on Open Knesset) has him as a deputy minister in the Shamir
  government from 16 Jul 1990.
- **Evidence type:** official dates; the earlier support needs a statement or a vote.
- **How it would be shown:** in the *Factions* view, from 25 Dec 1990. In the *Government support* view, from
  16 Jul 1990 **only once** a primary source is found (the Knesset's government record). Until then, from
  25 Dec 1990. This is a reminder that **official faction dates can lag behind the political act**.
- **How sure:** the faction date is **confirmed** (Knesset database). The deputy-minister date is **provisional**
  (secondary source).

#### Orly Levy-Abekasis (20th and 23rd Knessets)

- **What happened:**
  - 20th Knesset: the database moves her from Yisrael Beiteinu to a one-member faction on **15 Mar 2017**. The press
    reports a House Committee declaration; this was not verified here.
  - 23rd Knesset: her faction **split** from Labor–Gesher–Meretz on **23 Mar 2020**, a week after the swearing-in.
- **Evidence type:** official.
- **How it would be shown:** in the *Factions* view, a one-member faction from 15 Mar 2017. The label is *Left the
  faction (declared)* only if the decision is found; otherwise *Sits as a one-member faction*. In 2020: the Gesher
  faction from 23 Mar 2020.
- **How sure:** the 2017 date is **confirmed** (database); the declaration is **provisional**. The 2020 split date is
  **confirmed** (database).

#### Yoaz Hendel and Zvi Hauser (Blue and White, 23rd Knesset)

- **What happened:** the database moves both to "דרך ארץ" (Derech Eretz) on **29 Mar 2020**, the same day Yesh
  Atid–Telem split from Blue and White.
- **Evidence type:** official.
- **How it would be shown:** in the *Factions* view, Derech Eretz from 29 Mar 2020. This is a joint list breaking
  into parts, so it is labelled *Faction split*, not as individuals leaving.
- **How sure:** dates **confirmed** (database); the House Committee decision is **unverified**.

#### Joint lists breaking up, 2022–24 (25th Knesset)

- **What happened:** Otzma Yehudit and Noam split from Religious Zionism on **20 Nov 2022**, before the government
  was formed. New Hope (Sa'ar, Elkin, Shasha-Biton, Haskel) split from National Unity on **13 Mar 2024**.
- **Evidence type:** official.
- **How it would be shown:** in the *Factions* view only, labelled *Faction split*. These cases show why a "split"
  must not be read as individuals leaving.
- **How sure:** dates **confirmed** (database).

### 3.3 Should there be one word, such as "rebel"? (open: being re-asked)

**Status:** this is question 1 on the [rebels page](https://claude.ai/artifact/LsQoG9ihRxFDKjUUodsGka) and is being
re-asked. The owner has asked whether "rebel" is in fact the usual word for MKs like Chikli. The reasoning below is
the recommendation he was shown on 7 Nov.

**The 7 Nov recommendation was: no umbrella word that judges the person, in either language.**

- Words like "rebel" or "defector" characterise someone. The same act is "principled" to some people and a
  "betrayal" to others.
- The Hebrew *מורד* has no legal meaning. *עריק* is pejorative. *פורש* is a **legal** status and must not be used
  loosely.

Instead, the app would use **specific labels**, each tied to an act and a label saying where the fact comes from:

| Act | Hebrew | English | Where the fact comes from |
|---|---|---|---|
| House Committee declared leaving (§61) | פרש מהסיעה | Left the faction | Official |
| One-member faction, no decision found | סיעת יחיד | Sits as a one-member faction | Official · *Legal basis not recorded* |
| Faction split | פיצול סיעה | Faction split | Official |
| Moved to another faction | עבר לסיעת X | Moved to faction X | Official |
| Voted against, by name | הצביע נגד | Voted against | Recorded vote |
| Abstained / absent, by name | נמנע / לא הצביע | Abstained / Did not vote | Recorded vote |
| Public statement of leaving the coalition | פרש/ה מהקואליציה | Left the coalition | Own statement |

The legend in a vote view would use one neutral line with a count: **"Voted differently from own list / הצביע
בשונה מרשימתו"**. In the support view it is **"Apart from own list / בנפרד מרשימתו"**, with a count. The Hebrew uses
the verb form that matches the person's recorded gender (פרש / פרשה).

---

## 4. Time: the election result versus the Knesset on a date

There are three different "times". Each screen should show only one of them, and say which.

| Time | Question it answers | Screens | Individuals shown? |
|---|---|---|---|
| **Election result** | "What did the votes produce?" | Play, History's main chart, Compare | **No.** The seats belong to lists. The seat panel may list the holders ([section 6.4](#64-the-list-of-holders-for-one-seat)), but the chart never changes. |
| **The Knesset on a date** ("as of") | "Who sat where on 25 Apr 2022?" | **After the election**: the Factions and Government support views | Yes, with official and support events up to that date. |
| **A vote** | "How did each member vote on 13 Jun 2021?" | After the election: the investiture vote card, and later other key votes | Yes, from the roll call only. |

> **Decided by the owner on 8 Nov:** the "Knesset on a date" timeline (mock-up B1) is the core idea. It gets
> **arrows to step to the previous or next event**. Only events that changed the Knesset or the government go on
> it. Example: in the 2022 Knesset, 7 October 2023 is not on it; National Unity joining the government days later
> is.

**How the timeline works** (shown in mock-up B1):

- It is a bar along the Knesset term in *After the election*. You move a date marker along it.
- It has **ticks** for the swearing-in, the government's formation, each recorded individual event, the dissolution
  and the end of the term.
- Its **title** always reads like "The Knesset on 25 Apr 2022", so a picture taken from it is never mistaken for the
  election result.
- The marker jumps from event to event. Nothing changes between events, so there is nothing to show day by day.
- The starting date is the day the government was formed. That matches the existing government card.

**In History and After the election:**

- Replacements and faction changes appear as **rows on the term's timeline**, for example:
  - "8 Apr 2021 · Yosef Taieb entered (Deri: Norwegian law)";
  - "25 Apr 2022 · Chikli: left the faction (declared)".
- History's summary for each election could show one short line at Standard level and above, for example "During
  the term: 30 seats changed hands; 1 member left the faction". The line has an (i) and links to *After the
  election*. It is not a chart.

---

## 5. How it fits with scenarios and edits

### 5.1 Three layers

1. **Seats per list, from votes.** Unchanged. This is the only thing the seat-allocation calculation produces.
2. **Who holds each seat.** The elected candidates in list order, after skipping those who declined, then the
   historical **seat chains** over the term. This is **recorded history**, not calculated from votes.
3. **Where each MK stands.** For a given government and date: each MK's faction and support role. By default it
   comes from their list's role in the coalition data (member / outside support / abstains / out). It is then
   overridden by **official individual events** (recorded history) and finally by **your own changes** (edits).

### 5.2 Edits

- **Official individual exceptions are recorded history, not edits.** Chikli voting against, as recorded, is part
  of the real result. It is shown with its source label and **no** "Edited" marker.
- **Changing one MK's role yourself is a real edit.** It is recorded in the scenario's change log, counted in "N
  changes", marked **Edited** on the row and in the chart legend, and can be undone. (Being re-asked: Q5.)
- *Out of date since 7 Nov:* the earlier text said the owner had not yet decided whether **moving a whole list
  between blocs or coalition roles** counts as a scenario change. Such moves now count as changes again, shown with
  "Votes and seats unchanged" when nothing else changed (see the top of the changelog). The 7 Nov design
  recommended that changes to individuals follow the same rule, so that similar controls behave the same way.
- **Share links** carry these changes. Each change names the MK by **Knesset PersonID** (stable and official), not by
  a nickname or a list position. When a link is opened and a change concerns a person who is not seated in that
  scenario, the change is skipped and the skip is reported, as the app already does for other changes.
- **Saved scenarios** store the same changes. The app is not yet released, so there is no need to keep old formats
  working: the existing name-based ids for individuals (such as Chikli's) should switch to PersonID when this is
  built.
- **Compare** lists differences in individuals as rows, for example "Nir Orbach · Supports → Against (Edited)",
  alongside the differences between lists.
- **History of changes** (undo) treats them like any other change.

### 5.3 When you also change the votes

If a what-if changes a list's number of seats, the historical record of who held each seat no longer applies.

- The app falls back to **list order**: the first N candidates who took up their seat, with no term history.
- Any official or user change about a person who is no longer seated is **set aside**, with a one-line notice:
  "1 member change doesn't apply: not elected in this scenario".
- The list of holders and the timeline are shown only for the **historical** result. In a changed scenario, the
  seat panel says "Elected in this scenario", with the name from list order.

### 5.4 How the coalition tool counts

The rule for approving a government is **more for than against** (Basic Law: The Government §13(d)). Counted per
MK:

- *for* = members of supporting lists + outside support, after individual changes;
- *against* = lists that are out, plus individuals who voted against;
- *abstained* and *absent* are counted separately and don't enter the comparison.

Mock-up D shows:

- **Recorded, sourced data:** Chikli Against and al-Harumi Abstains.
- **A what-if made by a user:** Nir Orbach Against. This is a **hypothetical edit made to demonstrate the control**,
  not a claim about his vote. It is marked **Edited**.
- The result is For 59 · Against 60 · Abstained 1, with **"✗ Not approved"**.

**A dependency to note.** The coalition-roles work (outside support and arranged abstention, which appears in the
6 November changelog) was planned on the basis that individuals don't need modelling in Play. That was right for
its scope. This design adds individuals to the coalition tool later, as a layer on top of the per-list roles, so
nothing in that work needs to change now. It only needs to keep roles **per list**, so that a per-person layer can
sit on top.

---

## 6. What you would see

### 6.1 The mark on a seat (open: being re-asked)

**Status:** question 2 on the [rebels page](https://claude.ai/artifact/LsQoG9ihRxFDKjUUodsGka). The owner did not like
any of the 7 Nov mock-ups. He felt his own red-ring idea looked as if the MK was selected, rather than marking a
reservation about that MK. He suggested trying a red exclamation mark in the corner of the seat instead of the small
dark dot, and new mock-ups are being made. The analysis below is what he was shown on 7 Nov.

The seat chart already uses rings and outlines for several meanings:

- a party inside a joint list = a ring in the list's colour, with the inside filled in the party's colour;
- a seat gained = a heavy dark outline;
- a seat lost (compared with the reference chamber) = a dashed dark outline.

Red is also a **party colour** (Labor's seats are red in the 2021 chart), and the app's colour for losses.

| Option | What it looks like | 7 Nov verdict |
|---|---|---|
| **A1. Red ring** (the owner's idea) | The seat stays in its list's place, with a red ring outside the dot. | **Not recommended.** (1) It clashes with the joint-list ring and the gained/lost outlines. (2) It sits next to red Labor seats, and red already means "lost", so colour becomes the main signal. (3) It leaves the seat on the wrong side, so the picture still says Coalition 62 while the vote was 60–59–1. (4) Abstentions can't be shown. (5) Red reads as an accusation. |
| **A2. Seat drawn where its vote went, plus a small dark dot** (recommended on 7 Nov) | The seat moves to the side it actually voted for or supports. It keeps its own list colour, so you can see it came from Yamina. A small **dark dot** with a light halo sits at its upper right. The legend line has a count. | **Recommended.** The arithmetic in the picture is true. The mark is a **shape**, which works in light, dark, print and greyscale. It doesn't clash with rings or outlines, and abstentions get their own group. |
| **A3. Hollow dot in place** | The seat stays, drawn as an outline. | **Not recommended.** It reads as "vacant" or "not sworn in", which is also misleading. The totals are still wrong. |

In that design, the small dark dot was the **only** new seat mark for "apart from own list", in every view. It
always sits at the upper right, in Hebrew too, because graphics are not mirrored. A **selected** seat gets the
existing focus ring, which looks different from the dot.

### 6.2 Seats with several holders during the term (open: being re-asked)

**Status:** question 4 on the rebels page, being re-asked with a clearer explanation and new pictures.

- A faint **"stack" mark** (an outline offset behind the dot) would mean "more than one holder during the term".
  In 2021–22, **30 of 120 seats** had more than one holder (counted from the seat chains built from the Knesset
  database). Showing the mark on all of them by default is too busy.
- The 7 Nov recommendation:
  - the stack mark is **off by default**;
  - it is a switch in the legend ("More than one holder · 30") at Standard level and above, and on by default at
    Expert;
  - the **list of holders** is always available in the panel that opens when you click a seat.

### 6.3 Hovering and clicking a seat

- **Desktop:** hovering shows a one-line tooltip, for example "Amichai Chikli · Yamina #5 · Voted against".
  Clicking opens a **side panel** (mock-ups C1 and E).
- **Phone:** tapping opens a **panel from the bottom of the screen**. At 390 px wide, the dots are about 10 px
  across, so the panel has previous/next arrows to step through neighbouring seats without precise tapping.

The panel for a person (mock-up E) contains:

- the name, the list and the place on the list, and a colour swatch;
- the person's **own timeline of events**, for example "Sworn in · Voted against (Recorded vote) · Left the faction
  (Official) · Resigned, Kalfon entered". Each row has a date, a label saying where the fact comes from, and an (i)
  with the source quotation and link;
- a **"Sources"** line, which opens the citations.

### 6.4 The list of holders for one seat

The owner's idea of "a dropdown on a seat" becomes a **numbered list inside the seat panel** (mock-ups C1 and C2)
rather than a dropdown control. A list shows all holders at once, with dates and reasons, without hiding them
behind a click.

- **Title:** "A Shas seat · 4 terms, 2 people".
- **Each row:** a number, the name, the place on the list, the dates (in Hebrew, the start date is on the right) and
  a reason:
  - "Elected";
  - "Deri left: Norwegian law (i)";
  - "Returned: no longer minister";
  - "Deri resigned".
- **The row for the date chosen on the timeline** is highlighted (●4).
- **Uncertain data is shown honestly** (mock-up C2):
  - **Probable** where the research inferred which departure a newcomer replaced;
  - **Reason not recorded** where no notice was found.
- **Choosing a row** moves the timeline to that person's time in the seat, in *After the election* only.

### 6.5 Legends and (i) texts

- One line per mark, with a count:
  - "● Voted differently from own list 2";
  - "◎ More than one holder during the term 30".
- The labels saying where each fact comes from (Official / Recorded vote / Own statement) appear in the seat panel,
  not in the legend, to keep the legend short.
- **(i) texts** are one or two sentences. Example for *Left the faction*: "The Knesset House Committee declared this
  MK as having left their faction. By law they can't run on a list of a party represented in this Knesset at the
  next election, unless they resign in time." Plus a link.

### 6.6 By level of detail

| | Simple | Standard | Expert |
|---|---|---|---|
| Election-result chart | no individual marks | no individual marks | no individual marks |
| Seat panel | the name of the current holder | + the list of holders | + where each fact comes from, certainty, sources |
| After the election: investiture vote | marks + legend (the vote count must be true) | same | + a table of every MK's vote |
| After the election: the Knesset-on-a-date timeline | – | Government support view | + a switch to the Factions view; provisional items |
| Stack mark for several holders | – | legend switch, off | on |
| Coalition tool: individuals | – | – (Standard once that part is built) | rows for individuals, with Edited marks |

At the Custom level, each row is a separate switch.

### 6.7 Phone, Hebrew and English, light and dark, picture exports

- **Phone:**
  - the seat panel opens from the bottom of the screen;
  - the timeline drops its middle labels and keeps the end labels inside the frame;
  - the legend wraps under the chart.
- **Hebrew and English:**
  - every label is translated;
  - Hebrew names come from the Knesset database, English names from the app's candidate data;
  - where an English name is missing, the Hebrew name is shown with a "no English name" note at Expert level. A
    transliteration is never invented;
  - charts stay left-to-right; only text mirrors;
  - date ranges follow the app's usual convention for each language.
- **Light and dark themes:**
  - the small dark dot uses the app's text colour, with a halo in the background colour; the stack outline uses the
    secondary text colour;
  - in the mock-ups both stay visible against every party colour in both themes, including brown and light grey
    seats. This was checked by eye, not measured.
- **Picture exports (PNG):**
  - the export includes the legend with counts, the **title with the timeline date or the vote's name**, and the
    Edited marker if there is one;
  - the source labels are written as words, so an exported picture never relies on colour.

### 6.8 Mock-ups

The mock-ups are standalone pages drawn from real data: the app's 2021 election data, the Knesset database's
records of time in office and factions, and the app's own seat-chart geometry. Each picture is labelled "Mock-up".
There are 25 pictures at 2× native resolution, covering light and dark, Hebrew and English, desktop and phone. They
are in the design work's scratch folder and are not committed (file names are in the
[technical notes](#technical-notes-for-developers)).

| ID | What it shows |
|---|---|
| A1 | The 2021 vote, with Chikli shown with the red ring (the owner's idea) |
| A2 | The 2021 vote grouped For 60 · Abstained 1 · Against 59, with small dark dots on Chikli and al-Harumi (**recommended on 7 Nov**) |
| A3 | The 2021 vote, with a hollow dot |
| B1 | The Knesset on 25 Apr 2022, Government support view: Coalition 60 · Opposition 60; Chikli (Official), Silman (Own statement). **The owner chose this timeline as the core idea on 8 Nov.** |
| B2 | The same date, Factions view: Chikli as a one-member faction, Silman unmarked in Yamina |
| C1 | A Shas seat: Deri → Taieb → Deri → Taieb, with the list of holders |
| C2 | A Yamina seat chain, with *Probable* and *Reason not recorded* |
| D | The coalition tool with rows for individuals (2 sourced, 1 Edited what-if) |
| E | Chikli's panel, with his timeline of events |

---

## 7. Researching each Knesset

The data would be one file per Knesset, built from the member-changes research plus reviewed reasons and sources.

### 7.1 The checklist for each Knesset

For each Knesset, the researcher would:

1. Download from the Knesset database every record of being an MK and of faction membership, plus the person
   records, for that Knesset. Keep the raw file with the date it was fetched.
2. List everyone's time in office. Check that there are 120 at the opening against the CEC's list of elected
   members. Record who declined their seat.
3. Build the seat chains following §43:
   - the next candidate on the list enters;
   - a returning minister replaces the **last** person to enter (§43(b)).
   Mark each pairing **confirmed** (a notice was found) or **probable** (inferred).
4. For each departure, find the **reason** in a Knesset notice or in Reshumot, the official gazette (resignation,
   death, Norwegian law, appointment). Otherwise record the reason as unknown.
5. For each faction change in the database, find the **House Committee decision** (a split, a §61 declaration,
   joining another faction). Otherwise label it *Legal basis not recorded*.
6. For each government, find the **investiture roll call** (and, if in scope, confidence and dissolution votes).
   Record individuals who voted differently from their list, abstained or were absent.
7. Look for **the MK's own statements** of leaving or joining the coalition. Record only dated statements by the
   person themselves, with a quotation.
8. Check the number of MKs on every date where something changes; explain each gap.
9. Fill in English names only from a source. Record missing ones as gaps.
10. Cross-check with Hebrew Wikipedia's "חברי הכנסת ה-N" table (a **secondary source**, used only as a pointer), and
    resolve any differences from primary sources.

Rules the data follows (in plain words; field names are in the technical notes):

- Each person is identified by their Knesset **PersonID**, and linked to the app's candidates by list and place on
  the list. The existing check of elected members against the Knesset database is the model.
- A date range includes its start date but not its end date.
  - A resignation records both the **date it was submitted** and the **date it took effect** (§41 adds 48 hours).
    Example: Chikli submitted on 12 Jul and it took effect on 14 Jul 2022. These do not contradict each other.
  - The number of MKs is never forced to 120. The member-changes research found six dates with fewer. A vacancy is
    shown as a vacancy.
- Every event records where it comes from: official, vote or statement. Commentary is never stored as an event.
- Certainty uses the source policy's five levels. An unknown reason, and an unresolved pairing of who replaced whom,
  are kept and shown, never filled in from general knowledge.
- Sources use the app's existing list of citations, with short quotations. Secondary sources are labelled.
- **Votes** are a separate table, added only where a roll call has actually been retrieved. **Do not assume roll
  calls exist.** The research's attempt to get vote records was blocked by the Knesset's server (error 473). Without
  a roll call, a vote card shows list totals only and says "Roll call not available".

---

## 8. Risks, costs and order of work

**Risks**

- **Named people raise the stakes.** A wrong date or label about a person is worse than a wrong seat total. What
  reduces the risk:
  - only official and recorded acts (and, since 8 Nov, matters of fact settled by trusted sources);
  - labels saying where each fact comes from, and source quotations;
  - provisional items hidden below Expert level;
  - a "Report a correction" link on every person's panel.
- **Partisan reading.** Even neutral marks can be read as a judgement. What reduces the risk:
  - no umbrella word (recommended on 7 Nov; being re-asked);
  - the same mark in every view and for both sides;
  - joint-list splits labelled as routine.
- **Missing data.** Reasons, pairings, House Committee decisions and roll calls are mostly missing (member-changes
  research). The app must show *Probable* and *Reason not recorded* as normal states, not as errors.
- **Official dates lag behind events.** Example: Gur in 1990. The support view needs statements or votes to be
  accurate. Where they are missing, it falls back to the official date and says so.
- **Doing too much.** Tracking every vote (the abgeordnetenwatch model) would go far beyond the goal. Keep to the
  investiture vote and, later, dissolution and no-confidence votes that brought a government down.
- **Crowding.** 120 dots on a phone. The marks are small, and the stack mark is off by default.

**Order of work, as recommended on 7 Nov** (being re-asked: Q6)

| Step | What | Rough cost |
|---|---|---|
| **First: data** | Turn the member-changes research into seat chains with PersonIDs. Start with the 2021 and 2022 Knessets (the 24th and 25th); reasons from notices. | Research: about a day per Knesset for recent Knessets, more for older ones. Building: 1 day for the data format and its checks. |
| **Then: list of holders** | The seat panel shows holders with dates, reasons and where each fact comes from, at Standard level and above. The stack-mark switch. Read-only. | 2–3 days. |
| **Then: the Knesset on a date** | The timeline in *After the election*: Government support and Factions views, marks, legends. The investiture vote card uses the roll call where one exists (the 2021 Knesset now). *The timeline is decided (8 Nov); it gains previous/next arrows.* | 3–5 days. |
| **Then: individuals in the coalition tool** | Roles per person, recorded as scenario changes; links, saved scenarios, Compare. | 3–4 days, after the coalition-roles work. |
| **Later** | Suspensions; votes other than the investiture; photos; English names for every MK; Knessets before 1991 for the §61 labels (their faction moves can still be shown). | – |

---

## 9. Sources

Primary sources unless labelled otherwise. Accessed 7 November 2026. Certainty levels follow the
[source policy](../source-policy.md).

**Knesset database and laws**

- The Knesset's OData database: records of positions, persons and factions, fetched with this project's
  identification for the 12th, 20th, 23rd, 24th and 25th Knessets. Individual records are cited by number in the
  technical notes and the research.
- **Basic Law: The Knesset** §6A, §41, §42c, §43; **Knesset Law 1994** §61; **Basic Law: The Government** §13(d).

**Court judgments**

- Supreme Court, **ע"ב 6615/22** (Chikli v. CEC), judgment of 9 Oct 2022:
  <https://supremedecisions.court.gov.il/Home/Download?fileName=22066150.V07&path=HebrewVerdicts%2F22%2F150%2F066%2Fv07&type=4>
- Supreme Court, **בג"ץ 6600/22** (Silman), judgment of 9 Oct 2022:
  <https://supremedecisions.court.gov.il/Home/Download?fileName=22066000.V07&path=HebrewVerdicts%2F22%2F000%2F066%2Fv07&type=4>

**Press** (reports from the time, used for dates and for the MKs' own statements)

- **Chikli, 25 Apr 2022:** ynet: <https://www.ynet.co.il/news/article/bjnec7xs5>; Maariv, on what the declaration
  means: <https://www.maariv.co.il/news/politics/article-913697>.
- **Silman, 6 Apr 2022:**
  - Israel Hayom: <https://www.israelhayom.co.il/news/politics/article/9767689>
  - ynet: <https://www.ynet.co.il/news/article/bj9t6tcxc>
  - Globes: <https://www.globes.co.il/news/article.aspx?did=1001408302>
  - Haaretz: <https://www.haaretz.co.il/news/politi/2022-04-06/ty-article/.free/00000180-5ba4-def0-a3c3-5ffd78e50000>
- **Silman, 15 Aug 2022 (split refused):** ynet: <https://www.ynet.co.il/news/article/rjcno100a9>; Jerusalem Post:
  <https://www.jpost.com/israel-elections/article-714777>. Open Knesset's copy of the meeting (secondary):
  <https://oknesset.org/meetings/2/1/2195274.html>.
- **13 Jun 2021, how each MK voted:** N12: <https://www.mako.co.il/news-politics/2021_q2/Article-61ff3bc2da60a71027.htm>;
  already in the app's list of citations.
- **Deri, Norwegian law, Apr 2021:**
  - Kikar HaShabbat: <https://www.kikar.co.il/haredim-news/389092>
  - C14: <https://www.c14.co.il/article/486802>
  - Jerusalem Post: <https://www.jpost.com/breaking-news/deri-and-litzman-resign-from-knesset-under-the-norwegian-law-664298>
- **Deri, resignation, Jan 2022:**
  - ynet: <https://www.ynet.co.il/news/article/hji8ntq6k>
  - Haaretz: <https://www.haaretz.co.il/news/law/2022-01-23/ty-article/0000017f-f63b-d887-a7ff-feffe7380000>
  - Times of Israel: <https://www.timesofisrael.com/deri-resigns-from-the-knesset-in-line-with-tax-offense-plea-deal/>
- **1990 investiture vote, 62–57:** JTA: <https://www.jta.org/archive/shamir-government-wins-approval-in-the-knesset-by-a-vote-of-62-57>.

**Secondary sources and research leads**

- **The member-changes research** done alongside this design: the records of time in office, the probable pairings
  of who replaced whom, and the gaps (details in the technical notes).
- **Hebrew Wikipedia, as a secondary pointer only:** the article on Idit Silman was used to find dates, which were
  then checked against the judgment above.

**Not verified here** (left as gaps, not filled in):

- Gur's deputy-minister date, from primary sources.
- The source of the House Committee declaration for Orly Levy in 2017.
- Why Yamina #10 Maimon did not enter in 2022.
- Starkmann's English name.
- The House Committee decisions for the 1990, 2020 and 2022–24 faction changes.
- Roll calls for investiture votes other than 2021.

---

## Owner questions, as shown on 7 Nov

These are kept so you can see what was asked. Q3 has been answered; the others are being re-asked in plainer
language, with new pictures, on the [rebels page](https://claude.ai/artifact/LsQoG9ihRxFDKjUUodsGka). Answer there,
not here.

### Q1. Should there be a "rebel" mark, and what is it called? (being re-asked)

**What it is:** a way to show, on the seat chart, an MK who acted apart from their own list. Example: Chikli voting
against the 2021 government. **Why there's a choice:** one word for everyone is simple, but words like "rebel" or
"defector" can judge the person, and *פורש* is a legal status that only some of them have.

- **a)** No umbrella word. Each person gets a label for what they did, e.g. *Voted against*, *Left the faction*,
  *Left the coalition*, with a small label saying where it comes from (Official / Recorded vote / Own statement).
- **b)** One neutral umbrella word for everyone, e.g. "Apart from own list / בנפרד מרשימתו", with the details in the
  seat panel.
- **c)** A "rebel / מורד" label.

**The 7 Nov recommendation:** a). The legend still has one neutral line with a count. No extra cost; everything
else builds on this.

### Q2. How should such a seat look? (being re-asked with new mock-ups)

**What it is:** the mark on the seat's dot itself. **Why there's a choice:** rings and outlines already mean "joint
list" and "gained or lost seat"; red is a party colour and means "lost"; and a seat left in its list's place makes
the total look wrong (62 for the coalition while the vote was 60–59). See mock-ups A1–A3.

- **a)** The owner's red ring, with the seat staying in place (A1).
- **b)** The seat is drawn where its vote went, keeps its list colour, and gets a small dark dot (A2).
- **c)** A hollow dot in place (A3).

**The 7 Nov recommendation:** b). The picture adds up, abstentions can be shown, and it doesn't rely on colour.
Same cost as the others. *The owner rejected all three on 8 Nov; new mock-ups are being made.*

### Q3. Does Silman's own statement move her? (answered 8 Nov)

**Answered by the owner on 8 Nov:** she is shown by date on the "Knesset on a date" timeline: a coalition member
before 6 April 2022, on the opposition side, marked, from then on. The old options are kept, collapsed, in
[section 3.1](#31-the-rule-as-recommended-on-7-nov).

### Q4. Where do seats with several holders show? (being re-asked)

**What it is:** during a term, a seat can pass between people, e.g. Deri → Taieb → Deri → Taieb. In 2021–22,
30 of 120 seats changed hands. **Why there's a choice:** showing it everywhere is busy; hiding it loses real history.

- **a)** A list of holders in the seat panel everywhere (Standard level and above), a "stack" mark behind a legend
  switch, and the "as of" date only in *After the election* (C1).
- **b)** The stack mark always on the main chart.
- **c)** Only in *After the election*.

**The 7 Nov recommendation:** a). About 2–3 days after the data is ready.

### Q5. Do changes to individuals in the coalition tool count as edits? (being re-asked)

**What it is:** letting you set one MK's vote in the coalition tool, e.g. "what if Orbach had voted against"
(mock-up D). **Why there was a choice:** it followed the then-open decision on whether moving lists between
coalition roles and blocs counts as a scenario change; similar controls should behave the same. (Such list moves
count as changes again since 7 Nov.)

- **a)** Yes: counted in "N changes", marked *Edited*, and saved in links and Compare.
- **b)** No: treated like a change of appearance.
- **c)** Don't offer individual changes; show official exceptions only.

**The 7 Nov recommendation:** a), together with coalition moves counting too. About 3–4 days, after the
coalition-roles work.

### Q6. What to build first? (being re-asked)

**What it is:** this is four pieces of work. **Why there's a choice:** the research cost is real, and older
Knessets have the most gaps.

- **a)** Data for 2021 and 2022 first, then the list of holders → the Knesset on a date → the coalition tool
  ([section 8](#8-risks-costs-and-order-of-work)).
- **b)** Research every Knesset before building anything.
- **c)** Only the 2021 vote marks for now.

**The 7 Nov recommendation:** a). The first visible result arrives in about a week, and each later step stands on
its own.

---

## Technical notes (for developers)

### Who did what

- **M1** was the design task that produced this document (Opus). Its mock-ups are in its scratch folder
  `.backup-scratch/m1/png/` in the design worktree, not committed.
- **M2** was the data research lane (Codex, Knesset OData), branch commit `34fb656`:
  `docs/research/knesset-member-changes.md` and `data/research/knesset-member-changes/kN.json`. Tenures, probable
  pairings and gaps. Its attempt to fetch vote records was refused with HTTP 473. M2 could not open the official
  split/merge page, which is why the 1990 faction dates are probable.
- **C1** was the coalition-roles work (member / outside support / abstains / out, per list). Its brief said
  "individuals don't need modelling in Play"; this design's individuals layer sits on C1's per-list roles.
- **E1** was the source-policy model ([source-policy.md](../source-policy.md)): the five certainty labels.
- The old "stage" numbers map to the order of work in section 8: stage 0 data, stage 1 holder list, stage 2 Knesset
  on a date (which included the two-view switch for Silman), stage 3 coalition tool individuals (at Standard once
  built), plus Defer. Suspensions were "stage 4 or later".

### Knesset OData

- Service `ParliamentInfo.svc`; tables `KNS_Person`, `KNS_PersonToPosition`, `KNS_Faction`.
- `KNS_PersonToPosition` PositionID 43/61 is MK tenure; 54 is faction membership, with the faction ID. Factions are
  dated.
- Fetched with this project's UA for the 12th, 20th, 23rd, 24th and 25th Knessets. Rows are cited by ID in the
  data contract below and in M2's research.
- Research checklist step 1 means: pull `KNS_PersonToPosition` (43, 61, 54) and `KNS_Person` for the Knesset.
- Hebrew names come from `KNS_Person`; English names from the app's candidate data.

### Edits, links and saved scenarios

- A user change to an individual's role is an action in the scenario log (ADR 0006), e.g.
  `setMemberRole { electionId, governmentId, personId, role }`, counted in "N changes", marked Edited and undoable.
- Share links (ADR 0009) carry the actions, naming a Knesset PersonID, not a slug or a list position. Replay skips an
  action whose person isn't seated and reports the skip.
- Pre-release, so no compatibility shims: the existing slug ids in `data/meta/aftermath/*.json` `individuals[]`
  (e.g. `amichai-chikli`) move to PersonID when this is built.
- al-Harumi's abstention is already in `data/meta/aftermath/k24.json`; the N12 roll call is already registered as
  `n12-2021-06-13`.

### Rendering

- Holder-list date ranges use `rng()`, which puts the start date on the right in Hebrew.
- The mark ("pip") is `--ink` with a `--surface` halo; the stack outline is `--ink-2`. Contrast against party
  colours was checked by eye in the mock-ups, not measured.

### Mock-up files

Standalone HTML/SVG rendered from the app's `k24.json`, Knesset OData tenures and faction rows, and the app's own
`layout.ts` geometry. 25 PNGs at 2× native resolution in `.backup-scratch/m1/png/` (design worktree), not
committed.

| ID | Files |
|---|---|
| A1 | `a-ring-en-light`, `a-ring-he-dark` |
| A2 | `a-moved-en-light`, `a-moved-he-dark`, `a-moved-he-light-phone` |
| A3 | `a-hollow-en-light`, `a-hollow-he-dark` |
| B1 | `b-support-en-light`, `b-support-he-dark`, `b-support-he-light-phone` |
| B2 | `b-factions-en-light`, `b-factions-he-dark` |
| C1 | `c-deri-en-light`, `c-deri-he-dark`, `c-deri-he-light-phone`, `c-deri-en-dark-phone` |
| C2 | `c-yamina-en-light`, `c-yamina-he-light` |
| D | `d-coalition-en-light`, `d-coalition-he-dark`, `d-coalition-he-light-phone` |
| E | `e-sheet-en-light`, `e-sheet-he-dark`, `e-sheet-he-light-phone`, `e-sheet-en-dark-phone` |

### Data contract

One file per Knesset, next to the existing aftermath data, e.g. `data/meta/members/kN.json`, built from M2's
research JSON plus reviewed reasons and sources. Example for the 24th Knesset:

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
- **Dates:** `[start, end)` half-open intervals. A resignation records both the submission date and the effective
  date (§41 adds 48 hours). Never force the head-count to 120 (M2 found six boundary dates with fewer).
- **Basis** is one of `official | vote | statement`. Commentary is never stored as an event.
- **Certainty** uses E1's five labels. `reason: unknown` and `pairingBasis: unresolved` from M2 are kept and shown,
  never filled from general knowledge.
- **Sources** use the existing citation registry, with short quotes. Secondary sources are labelled.
- **Votes** are a separate table (`votes/kN.json`), added only where a roll call has been retrieved (HTTP 473 blocked
  M2's attempt).
