# Party identity across elections, party history and "compared with last time"

*Written 7 November 2026; rewritten in plain language on 8 November 2026. Nothing was removed: every fact, date, number and source of the earlier version is kept.*

## In short

- **What this is about.** Three linked features. First, knowing when a list at one election is "the same party" as a
  list at the previous election. Second, a **party history**: a small chart of a party's results back to 1949.
  Third, a one-line **"compared with last time"** note on each list, for example "2022: 5 ▲6".
- **Why it exists.** The app could not answer a simple question correctly: "did the Joint List do better than last
  time?" In a few visible places it gave no answer or a wrong one. For example, it called Likud Beiteinu 2013 a
  *merger*, although Likud and Yisrael Beiteinu only ran together that year.
- **The main rule.** A list is only ever compared with **whole earlier lists**. Which earlier lists count is decided
  only by **recorded facts about the parties as organisations**: the same party, a change of name, a merger, a
  shared (joint) list, or a split. Each link shows how sure the record is. A joint list's votes are never divided
  among its parties, because nobody knows how many votes each party brought.
- **What we found.** Today the app links **248 of 296** seat-winning lists (84%) from 1951 to 2026 to the previous
  election. Of the other 48, 47 are shown as "New" and 1 (The Democrats, 2026) as "Check". About half of the 47 are
  really new parties; the rest are gaps in our records.
- **The Democrats (2026) can be settled from the record.** Labor changed its name to The Democrats, and Meretz ran on
  The Democrats' list in 2026. So the 2026 list is compared with Labor and Meretz together in 2022: 4 seats then,
  8 now (▲4), marked *Probable*.
- **What you would see.** Click a list and its panel shows a small history chart. A "Full history" button opens a
  wide view with names over time, dated events and exact figures. In a joint-list year, the party's own elected
  members are drawn solid and its partners' members striped.
- **Decided by the owner on 8 Nov.** On the [party history review page](https://claude.ai/artifact/Mr9phDBG3oeADqsETnE3Ku)
  the owner approved all five recommendations (1a, 2a, 3a, 4a, 5a; see [Owner questions](#owner-questions)). The
  feature is going ahead as designed here.
- **Nothing left for the owner to decide in this document.** He also suggested a similar history view for
  individual Knesset members; that is being designed separately.
- **The plan.** First research the missing party facts, then write one shared rule for "what is this list compared
  with", then build the screens, and last let users add their own comparisons ([section 9](#9-recommendation-and-plan)).

---

## Words used in this document

- **List**: what voters see on the ballot at one election, with its ballot letters. A list can belong to one party
  or be shared by several.
- **Joint list**: one list shared by several parties at one election, for example Likud Beiteinu in 2013 (Likud and
  Yisrael Beiteinu) or the Joint List (Hadash, Ta'al, Balad and others). Each party on it is a **constituent party**.
  Votes go to the whole list; nobody knows how many came "for" each party.
- **Party**: the organisation itself, which can run in many elections, sometimes under different names.
- **Faction**: the group of members a list forms inside the Knesset after the election. A **faction split** is when
  that group divides during the Knesset term (for example, Kadima's founders leaving the Likud faction in 2005).
- **CEC**: the Central Elections Committee, which runs elections and receives each list's official submission.
- **Registrar of Parties**: the official body where parties are registered; its records show legal renames and
  mergers.
- **Knesset member (MK)**: a member of the Knesset.
- **Certainty**: how sure the record is, under the project's [source policy](../source-policy.md). *Confirmed*
  means an official record (or enough independent sources); *Probable* means, for example, one recognised academic
  source; *To verify* (the policy's *unknown*) means we have no reliable source yet. A small label next to a fact
  shows its certainty.
- **Lineage**: the chain of recorded links between parties over time (renames, mergers, splits).
- **Compare screen**: the app's screen that sets two elections side by side. Part of it pairs each list with its
  counterpart at the other election, and gives each pair a word such as "Same", "Merged" or "New".
- **List panel**: the panel that opens when you click a list (or a seat) in the results.
- **Levels**: the app has display levels, Simple, Standard and Expert, which show more detail as you go up.

---

## 1. What exists today (verified)

| Piece | What it does | Limits found |
|---|---|---|
| **Party registry** (our list of parties) | 587 identities: 116 parties, 363 one-election "electoral vehicles" (a list name used for one election only) and 108 alliances. Together they make 975 list appearances: a party running alone, a constituent party on a joint list, or the joint list itself. | A one-election vehicle has no continuity by design. So a list that ran twice, such as Tami (1981, 1984), is stored as two unrelated identities. |
| **Lineage records** (links between parties) | 116 documented links: 108 "ran together" links (one per joint list), 6 mergers, 2 splits and **0 renames**. There are also 29 open items. | 27 of the 29 open items are placeholders saying "ancestry not yet established". One is a general note. One is the open question about The Democrats in 2024. |
| **Joint-list facts** | For every joint list: the leading party, **how many elected members belonged to each party**, the factions on the Knesset's opening day, and the sources (CEC candidate lists, the Knesset's official database). | None for this purpose. All 99 seat-winning joint lists are covered. |
| **Party families** (the existing family charts) | Charts for groups of parties ("families"), with striped points for joint lists and a choice of how to count them. | A family is an editorial grouping, not one party's own history. |
| **Compare screen's pairing of lists** | Pairs lists across elections using only the registry and the lineage records. Each pair gets a word: Same, Renamed, Joined, Merged, Split, New, Ended or Check. | [Section 2.3](#23-ten-hard-cases-checked) lists three behaviours to fix. |
| **List panel** | Shows seats, votes, the surplus-vote agreement, the parties on the list and the candidates. | **No history, and no comparison with the previous election.** |

## 2. How many lists we can already link

**How this was counted.** We ran the Compare screen's real pairing on every pair of consecutive official results
(1949→1951 … 2022→2026). For each pair we counted every list that won seats in the later election. The 1949 election
(the first Knesset) has nothing before it, so it is not counted.

### 2.1 Numbers

| Election | Seat-winning lists | Linked | Not linked |
|---|---:|---:|---|
| 1951 | 15 | 10 | Democratic List for Israeli Arabs, Sephardim, Progress and Work, Yemenite Association, Agriculture and Development |
| 1955 | 12 | 11 | Ahdut HaAvoda |
| 1959 | 12 | 10 | Progress and Development, Cooperation and Brotherhood |
| 1961 | 11 | 11 | — |
| 1965 | 13 | 8 | Rafi, Independent Liberals, Rakah, HaOlam HaZeh, Maki |
| 1969 | 13 | 10 | National List, HaOlam HaZeh, Free Centre |
| 1973 | 10 | 8 | Ratz, Arab List for Bedouin and Villagers |
| 1977 | 13 | 9 | Dash, United Arab List, Shlomtzion, Flatto-Sharon |
| 1981 | 10 | 6 | Shinui, Tehiya, Tami, Telem |
| 1984 | 15 | 10 | Shas, Progressive List for Peace, Yahad, Ometz, Tami |
| 1988 | 15 | 13 | Moledet, Arab Democratic Party |
| 1992 | 10 | 9 | Hadash |
| 1996 | 11 | 9 | Yisrael BaAliyah, Third Way |
| 1999 | 15 | 12 | Centre Party, Yisrael Beiteinu, Am Ehad |
| 2003 | 13 | 13 | — |
| 2006 | 12 | 10 | Kadima, Gil |
| 2009 | 12 | 11 | Jewish Home |
| 2013 | 12 | 10 | Yesh Atid, Hatnuah |
| 2015 | 10 | 9 | Kulanu |
| 2019 (Apr) | 11 | 11 | — |
| 2019 (Sep) | 9 | 9 | — |
| 2020 | 8 | 8 | — |
| 2021 | 13 | 12 | New Hope |
| 2022 | 10 | 10 | — |
| 2026 | 11 | 9 | Yashar! (new); The Democrats (Check) |
| **Total** | **296** | **248 (84%)** | **47 New, 1 Check** |

The 248 linked lists were labelled: Same 174, Split 40, Merged 24, Joined 10.

### 2.2 The 48 lists we could not link, sorted by cause

- **Our records miss a link to a predecessor we already have (8).**
  - Hadash 1992: the 1988 list was the same front, registered under the Communist Party.
  - Jewish Home 2009: the successor of the National Religious Party (NRP).
  - Independent Liberals 1965: the link exists in our records, but the Compare screen's pairing drops it (see
    [section 2.3](#23-ten-hard-cases-checked)).
  - Tami 1984 and HaOlam HaZeh 1969: each ran more than once, but is stored as two separate one-election lists.
  - Maki 1965: held back by an unresolved conflict in our records about the communist parties' identities.
  - Sephardim and Yemenite Association 1951: both also ran in 1949.
- **Parties that split off, with no recorded split (12).** Ahdut HaAvoda 1955, Rafi 1965, Rakah 1965, National List
  1969, Free Centre 1969, Shinui 1981, Tehiya 1981, Arab Democratic Party 1988, Third Way 1996, Am Ehad 1999, Kadima
  2006, Hatnuah 2013. Each needs a dated record, usually from the Knesset's official register of splits and mergers.
  **A party that split off still counts as "New" for comparison**: it has no earlier votes of its own. The split
  appears as an event in both parties' histories.
- **Possible mergers to research (2).** United Arab List 1977 (it may come from earlier Arab lists). Democratic List
  for Israeli Arabs 1951 (the 1949 Nazareth list is one of our open items).
- **Really new (25).** For example Dash 1977, Shas 1984, Moledet 1988, Yisrael BaAliyah 1996, Yisrael Beiteinu
  1999, Gil 2006, Yesh Atid 2013, Kulanu 2015, New Hope 2021, Yashar! 2026. A founder who came from another party does
  not make that party a predecessor ([section 3.3](#33-what-never-counts-as-a-link)).
- **Check (1).** The Democrats 2026, resolved in [section 4](#4-the-democrats-from-the-record).

### 2.3 Ten hard cases, checked

| Case | What the data and the Compare screen do today | Verdict |
|---|---|---|
| **Kadima** | 2006: New. 2009: Same. 2013: Same (2 seats). Hatnuah 2013: New. | Right for comparison. Missing as events: Kadima's 2005 split from the Likud faction, and the 2012 departures to Hatnuah. |
| **Gesher** | Two separate identities: Gesher of David Levy (1996–99) and Gesher of Orly Levy (2019). | Right: same name, different party. Record it as an explicit "not the same party" fact, so no future name match joins them. |
| **Likud Beiteinu 2013** | Labelled **Merged** (Likud + Yisrael Beiteinu). The 2015 separation is handled correctly. | **Wrong word.** They ran together and never merged. This needs a "Ran jointly" label. Joint-list facts: Likud 20, Yisrael Beiteinu 11 elected members. The 2014 faction split is missing. |
| **Blue and White 2019–22** | 2019: Joined (with Yesh Atid). 2021: Split into Yesh Atid 17 and Blue and White 8. 2022: National Unity, Merged. | Right. Missing as an event: the March 2020 faction split. |
| **Yamina / New Right** | 2019 (Sep): Merged (New Right + the Union of Right-Wing Parties). 2021: Split. Religious Zionism 2021 is shown as **Joined from Otzma's 2020 list (0 seats)**. | **Misleading.** Religious Zionism 2021 was led by Tkuma, which ran inside Yamina in 2020. Pairing it with Otzma's 0-seat list shows +6. The proposed rule ([section 3.4](#34-the-comparison-rule-what-a-list-is-compared-with)) gives "Yamina 2020 → 2 lists" instead. |
| **Joint List 2015–2026** | 2015: Merged. 2019 (Apr): Split. 2019 (Sep): Merged. 2021: Split (Ra'am left). 2022: Split. 2026: Merged. | Right throughout. |
| **The Democrats** | Check (an open item in our records about 2024). | Can be settled from the record ([section 4](#4-the-democrats-from-the-record)). |
| **Ra'am in and out** | 1996: Joined (with the Arab Democratic Party). 2015–20: inside the Joint List. 2021: Split. 2022 and 2026: Same. | Right. |
| **Shas, Degel HaTorah and Agudat Yisrael in United Torah Judaism (UTJ)** | Shas always runs alone: Same. UTJ 1992: Merged (Aguda + Degel). Changes of leading party are handled. The 1988 Degel split is documented. | Right. Missing as events: UTJ's faction splits during Knesset terms. |
| **National Union / Tkuma / Religious Zionist Party / Otzma Yehudit** | 1999: National Union, Same. 2013: Jewish Home, Merged. 2022: Same. 2026: split into three lists, compared as a group (14 → 13 ▼1). | Right, except Religious Zionism 2021 (above). Tkuma's later name (Religious Zionist Party) is not recorded as a rename, but Tkuma's identity in our records is unchanged, so nothing breaks. |

**Three behaviours of the Compare screen's pairing to fix** (found in this audit):

1. A recorded split is lost when the party it split from was part of a merged pair. Example: Independent Liberals
   1965 shows as New, although we hold the record of that split.
2. Running together is labelled "Merged". The Compare screen needs a separate **Ran jointly** label next to
   **Merged**.
3. The earlier list a party "joined" can be a minor partner's 0-seat list (Religious Zionism 2021). The leading
   party's real origin then appears only as a small "moved" note.

## 3. How party identity is modelled

### 3.1 Three layers

1. **Party**: an organisation, with its names and the dates it used each (already in our party registry).
2. **List**: what was on the ballot at one election, with its constituent parties (already in the registry and the
   joint-list facts).
3. **Relations**: dated facts linking parties, each with its sources and a certainty under the
   [source policy](../source-policy.md). Only a relation can carry a party's history or comparison across a change of
   party.

### 3.2 Kinds of relation: what exists and what to add

| Relation | What it means | Example | Best record | Today |
|---|---|---|---|---|
| **Ran jointly** | Parties shared one list at one election. | Likud + Yisrael Beiteinu 2013; The Democrats + Meretz 2026 | The CEC list submission (an official, primary record) | Exists as a "ran together" link; **needs its own label on the Compare screen** |
| **Renamed** | The same organisation took a new name. | Labor → The Democrats (2024) | A Registrar of Parties notice (primary); the Israel Democracy Institute, IDI (scholarship) | The kind exists, but **no links are recorded** |
| **Merged** | Several parties became one new party. | Mapai + Ahdut HaAvoda + Rafi → Labor (1968); Herut + Liberals → Likud (1988) | Registrar notice; scholarship | 6 links |
| **Absorbed** | One party joined another, which kept its own identity. | Yisrael BaAliyah → Likud (2003) | Registrar notice; scholarship | Stored today as a merger. Add this kind, so the continuing party's name is not treated as new. |
| **Merger stage** | A merger moves through steps: announced → approved by both parties' bodies → registered. | The Democrats and Meretz: announced and approved in 2024; not registered as one party | The parties' own decisions (primary for what they said); the Registrar | Missing |
| **Split** | A group left and formed a new party. | Rakah from Maki (1965); Degel from Aguda (1988) | The Knesset's register; scholarship | 2 links |
| **Faction split** | A Knesset faction divided during the term. | Kadima from Likud (2005); Likud Beiteinu (2014); Yesh Atid from Blue and White (2020) | Knesset faction records (primary) | Missing |
| **Same party, stored twice** | One organisation is stored under several identities in our records. | Rakah = the Communist Party = Hadash's registered party; lists that ran more than once (Tami, HaOlam HaZeh) | Registrar; the CEC 2026 Joint List submission names the Israeli Communist Party | Missing (the conflict is noted) |
| **Not the same party** | Same or similar name, different organisation. | Gesher 1996 vs Gesher 2019; Koach Lehashpia 2009 vs 2013; Achi 2026 vs Ahi | Registrar; scholarship | Two such conflicts are noted in prose only |
| **Disputed succession** | Reliable sources disagree on who continues whom. | Example to research: "Herut – the National Movement" (1999) and the historical Herut | Both sides cited | Missing; use the certainty *disputed* |

**How sure each relation is.** Every relation follows the source policy's limits. A Registrar notice or a CEC
submission is a primary record, so the relation is *confirmed*. An IDI profile alone is scholarship, so the relation
is *probable*. Newspaper reports need the number of independent reports the policy asks for. "To verify" in the
mock-ups is the policy's *unknown*: it is shown, but never used to compare.

### 3.3 What never counts as a link

- **Ideology or "spiritual heirs".** Political descent is contested and a matter of opinion. This is exactly where
  the app would stop being neutral.
- **Founders who came from another party.** For example, Kahlon moved from Likud to found Kulanu; Eisenkot moved from
  National Unity to Yashar!. The Compare screen already shows a factual hint instead: "8 candidates also ran for
  National Unity in 2022". This is counted from Knesset member records and is never presented as a link.
- **"Technical bloc"** as a label. Whether a joint list was "only technical" is a judgement. The recorded facts say
  it plainly: a joint list, the factions it formed on the Knesset's opening day, and the date it split.
- **Names, ballot letters or a list's rank by votes.** These are already ignored today.

### 3.4 The comparison rule: what a list is compared with

For a list at one election, look at each of its parties at the previous election, following any renames and
mergers:

- **Counted:** an earlier list counts **whole** when all of its parties are on the current list.
- **Not counted:** an earlier list that also held parties now running elsewhere is named and left out, because its
  votes cannot be divided.
- **Split:** when the leading party's earlier list is now spread over several lists, the comparison is made for the
  group: "Religious Zionism 2022 → 3 lists: 14 → 13 ▼1". There is no figure for each successor.
- **New:** no earlier list qualifies.

A comparison is only as sure as the least sure relation it used. Applied to the 2026 results:

| 2026 list | Compared with (2022) | Seats | Note |
|---|---|---|---|
| Joint List | Hadash–Ta'al + Balad | 5 → 11 ▲6 | Combined; votes 317,352 → 500,755 |
| The Democrats | Labor + Meretz | 4 → 8 ▲4 | Combined; *Probable* (because of the rename) |
| Likud | Likud | 32 → 27 ▼5 | Partial: New Hope is not counted (it ran inside National Unity) |
| Together (Bennett) | Yesh Atid | 24 → 12 ▼12 | Together's own party is new |
| Religious Zionism–Zehut, Otzma Yehudit, Noam | Religious Zionism | 14 → 13 ▼1 | Group only |
| UTJ, Shas, Ra'am, Yisrael Beiteinu | Same list | 7 → 7, 11 → 6, 5 → 8, 6 → 7 | — |
| Yashar! | — | New | Hint: shares candidates with National Unity |

**Seats by party inside a joint list.** How many elected members belonged to each party is a recorded fact about
people. It is not a division of votes. It comes from the CEC candidate lists and the Knesset's official database.
It may be used **for seats only**, labelled "elected members". Votes and vote share always stay with the whole list.

## 4. The Democrats, from the record

| Fact | Source | Kind of source | Certainty |
|---|---|---|---|
| The 2026 list was submitted by two parties: "הדמוקרטים מיסודה של תנועת העבודה" and "מרצ". | The CEC's 2026 list submission, as recorded in the app's 2026 election data | Primary | **Confirmed**: Meretz ran jointly; it was a separate submitting party in 2026. |
| Labor is the legal platform of the new party and changes its name to "The Democrats"; both parties stay registered separately. | IDI, Assaf Shapira, "איחוד העבודה ומרצ למפלגת 'הדמוקרטים'", 4 July 2024 (idi.org.il/articles/54838) | Scholarship | **Probable**: Labor renamed The Democrats. |
| The union was announced on 30 June 2024; both parties' bodies later approved it. | Contemporary press (Maariv, 30 June 2024, for the announcement); the approval dates are not yet cited | Contemporary report | The announcement is *provisional* (one report). The approval dates are to be cited during the data research. |
| A completed legal merger with Meretz. | None found | — | **Not claimed.** The record that would decide it is the Registrar of Parties entry. |

**How this is recorded.** Three facts: Labor *renamed* The Democrats (probable); The Democrats and Meretz *ran
jointly* on the 2026 list (confirmed); and a merger stage of "announced" for Meretz. This replaces our open item
about The Democrats in 2024. The Compare screen then shows *Merged* ("Labor, renamed + Meretz 2022") with a
*Probable* label instead of *Check*. Labor's history continues unbroken into 2026 under its new name. Meretz keeps
its own history, with 2026 shown as a joint-list year (1 elected member).

## 5. What you would see

### 5.1 Party history

**Where it opens.** From the list panel; from any seat or list row that opens that panel; from the menu of a row on
the Compare screen; and from a member party on the Party families page. The history section appears at every
level, because it is a fact, not an edit.

**In the list panel (compact)** — mock-ups M1 and M3a:
- The title "History · since 1949".
- For a joint list, small **party buttons** (The Democrats | Meretz) choose whose history is shown. The leading party
  is shown first.
- The party's names over time, on one line: "Mapai → Labor → The Democrats".
- A small chart: one bar per election, with the current election boxed.
- The "Since 2022" line ([section 5.2](#52-compared-with-last-time)).
- A **Full history ›** button.

**The wide history view** — mock-ups M2, M3 and M4 (wide on a computer, full screen on a phone):
- **Header:** the name, the chain of names, and one summary line: "Ran in 26 of 26 elections · won seats in 26 ·
  most: 56 (1969)".
- **Controls:** the party buttons, and a **Seats | Vote share** switch.
- **Chart (always left to right, in Hebrew too):**
  - Seats: the solid part of each bar is the party's own elected members; the striped part is its partners'
    members. Each bar is labelled with the whole list's total.
  - Vote share: bars for the whole list, striped in joint-list years, dashed when the party ran inside another
    party's list.
  - A "·" marks an election the party missed between runs. Nothing is drawn before its first run.
  - A **strip of names** under the axis (Mapai | Labor | The Democrats).
  - A **row of events** with dated markers and a word under each (Merged, Renamed, Faction split). The marker's ring
    shows certainty: solid for confirmed, dashed for probable, an amber "?" for "To verify". Events in the same year
    share one marker.
- **Card for the selected election:** the list's name, seats, share and votes; "Led a joint list with Ta'al, Balad";
  "Elected: Hadash 5 · Ta'al 3 · Balad 3"; "Votes are for the whole list".
- **List of events:** the year (or "1988–92" when only the interval is known), the wording, a certainty label, and
  an (i) with the evidence.
- **Exact figures (26 elections):** a table, closed by default, as on the Party families page.

**Keyboard.** The bars can be reached with Tab, and the arrow keys move between elections, as in the family charts.
Hovering or focusing a bar shows its card. The accessibility setting that shows tables instead of charts opens the
table.

### 5.2 "Compared with last time"

- **In the results list** (mock-up M5), from the Standard level up and **off by default** (owner, 8 November: a
  feature of Compare, not shown by default; Settings → Lists → “Compared with last time” turns it on): one line under each list, for example
  "2022: 5 ▲6 · Hadash–Ta'al + Balad". The name is left out when it is unchanged ("2022: 6 ▲1"). A partial
  comparison carries a "*". Rises are a green ▲ and falls a red ▼, always with a sign, as everywhere in the app. The
  year at the start keeps it apart from the edit change shown beside the seat count, which compares with the
  official result.
- **In the list panel** (mock-up M1): "Since 2022 **Labor + Meretz** 4 → 8 ▲4 · −0.4 pp" (pp = percentage points),
  with the certainty label when it is not confirmed, and an (i). The (i) lists the earlier lists with their seats
  and votes, the relation and its source. Anything "not counted" gets one small line.
- **On the Compare screen** (mock-up M6): the pair labels gain **Ran jointly** and **Renamed**. Under the later
  list's name goes one line: "= Labor, renamed + Meretz 2022 *Probable*", or "with New Hope · not counted: it ran
  inside National Unity in 2022". The explanation in the panel that shows how lists were paired becomes "Compared
  with the whole 2022 lists: Labor (4) + Meretz (0)", with each relation, its certainty label and its evidence.

### 5.3 Your own comparisons and links (analysis, not edits)

- **This list, this time:** a "Compare with…" option in the list panel's (i) and in the Compare screen's pairing
  panel (where the existing **Map to…** option already does this). You pick whole earlier lists; suggestions are
  ranked by how many candidates they share. It is marked **Yours**.
- **My lineage:** a personal link, for example "treat Kadima as continuing Likud". It is saved like a personal party
  family preset (in the browser, with export and import), carried in Compare and scenario share links, and marked
  **Yours** wherever it is used.
- **What kind of change this is:** an analysis choice. It never changes a result, never marks the scenario as
  edited, and never enters our sourced records. It works like the Compare screen's pairings today.

### 5.4 Learn or Play

The app is being shaped into two sides: *Learn* (facts and context) and *Play* (the sandbox where you change
results). Party history is **factual context**, so it belongs with Learn, whatever that becomes. It is reached from
Play through the shared list panel, so no new tab is needed now. The comparison line sits on results in both.
Personal comparisons and links belong to Play (analysis). A later **Parties** index (A–Z, each party opening its
history) fits naturally in Learn.

### 5.5 Levels, language and phone

- **Simple:** the history in the panel (chart, one line, Full history). No line under each list, and no party
  buttons beyond the list's own parties.
- **Standard:** adds the line under each list and the new Compare labels.
- **Expert:** adds the evidence details inside the (i), and the exact-figures table open by default.
- Hebrew and English are complete, with short party names on the buttons. Charts never mirror.
- Phone: the history view is full screen, years are labelled every 4 elections, and event markers have no words (the
  list below the chart has them).

## 6. What data the build needs

In plain terms, the build needs:

- **New kinds of relation** in our lineage records: absorbed, faction split, same organisation, not the same
  organisation, and the steps of a merger (announced, approved, registered). Renames are already allowed but none
  are recorded yet. Each relation's certainty is worked out from its sources, as the source policy requires.
- **One shared rule** that answers "what is this list compared with?". It returns the earlier lists that count, the
  parties left out, the group (for splits), the kind of link and its certainty. The results list, the list panel
  and the Compare screen all use it, so they always agree.
- **A small data file for the history charts**, like the one the family charts use: for each election, the lists'
  names, colours, whole-list votes and seats, constituent parties, and elected members per party. The mock-up's copy
  was about 230 KB with logos and colours; the real one should stay under the family charts' 200 KB limit by leaving
  out logos.
- **Tests** that lock in the 2026 table above, the full 26-election series for Labor, Likud and Hadash, the rule that
  votes are never divided, the three pairing fixes, and the certainty labels.

Field names and file paths are in the [technical notes](#technical-notes-for-developers).

## 7. Mock-ups

The mock-ups were made with the real app and real data. Temporary changes to the list panel, the results rows and
the Compare screen were used to draw them, and then removed. They are kept in a scratch folder, not in the
repository. Each was captured in English and Hebrew, light and dark, at 1500 and 390 pixels wide.

| Id | What it shows |
|---|---|
| M1 | The 2026 Democrats panel: the History section, the party buttons, the chain of names, the compact chart, and "Since 2022 Labor + Meretz 4 → 8 ▲4 *Probable*" |
| M2 | Labor's full history, 1949–2026: Mapai → Labor → The Democrats; the Alignment years with Mapam's members striped; markers for the 2024 rename and union |
| M3, M3a | Hadash through the Joint List: buttons for Hadash · Ta'al · Balad; Rakah → Communist Party → Hadash, with two "To verify" identity links |
| M4 | Likud from 2013: Likud Beiteinu as 20 solid + 11 striped; Herut → Likud; the 1988 merger; the 2003 absorption; faction splits to verify |
| M5 | The 2026 results list with the "2022: …" line on every seat-winning list |
| M6 | Compare 2022 ↔ 2026: The Democrats as Merged with the rename label; Likud's "not counted" note; the pairing explanations with evidence |

Two "before" pictures show today's panel and Compare pairing explanation for contrast. File names are in the
[technical notes](#technical-notes-for-developers).

## 8. Risks and downsides

- **Contested successions (neutrality).** Who "continues" a party is a political claim. Labor, Herut, the National
  Union names and the Arab parties are all sensitive. *How we limit it:* only organisational acts with records; no
  ideology, no founders, no "technical bloc"; disputes are shown with both sides. The cost is that some links people
  expect will not appear.
- **Wrong links.** A wrong identity link silently changes every comparison and history it touches. Gesher is the
  classic trap. *How we limit it:* "not the same party" facts, a test for each party's series, and certainty labels.
  A relation below *probable* is never used automatically.
- **Probable treated as if certain.** The Democrats comparison rests on scholarship until the Registrar's record is
  checked. *How we limit it:* the certainty label, plus an (i) naming the record that would decide it (owner
  question 2).
- **Complexity.** A new line in every row, buttons, event markers and certainty. *How we limit it:* the line under
  each list only from Standard, words instead of icons, and detail behind the (i).
- **Partial comparisons can mislead too.** "Likud 32 → 27" ignores New Hope's 1 elected member in 2026. *How we
  limit it:* the visible "not counted" note. The seat chart's solid and striped parts show it at a glance.
- **Upkeep.** Each election needs a check of party identities: renames, joint lists, splits. There are about 40
  records to research now: the 8 missing links, 12 splits, 2 possible mergers and the faction splits. The Registrar's
  and the Knesset's registers are partly behind access blocks, so some links will stay "To verify" for a while.
- **Elected-member counts describe the day of the election.** Later replacements, or MKs who leave their party, are
  not reflected. That is correct for an election history, and the card says "elected".

## 9. Recommendation and plan

**Do it.** The comparison people actually want ("did the Joint List do better than last time?") cannot be answered
today, or is answered wrongly in a few visible places. Most of the data needed already exists.

The work, in order:

1. **Research the missing facts first.** The Democrats facts ([section 4](#4-the-democrats-from-the-record)) and the
   Registrar check; the Hadash identity chain; the NRP → Jewish Home link; the 8 missing links and the 12 splits;
   the faction splits from the Knesset's register (2005, 2014, 2020, and UTJ's); and the "not the same party" facts.
   Every item is cited under the source policy.
2. **Then write the one shared comparison rule**, fix the three pairing problems, and add the tests described in
   [section 6](#6-what-data-the-build-needs).
3. **Then build the screens:** the History section in the list panel and the wide history view, the line under each
   list (from Standard), and the new Compare labels and explanations.
4. **Last, add your own comparisons and links** ([section 5.3](#53-your-own-comparisons-and-links-analysis-not-edits)).

Steps 2 and 3 do not have to wait for all of step 1. Missing links simply show as New or "To verify".

## 10. Sources

- The project's own records: the party registry, the lineage records, the joint-list facts, the official results of
  all 26 elections, and the Compare screen's pairing code (paths in the
  [technical notes](#technical-notes-for-developers)); the [source policy](../source-policy.md); the design notes for
  the [Compare screen](compare-workbench.md) and for [party families](party-families.md).
- Israel Democracy Institute, Assaf Shapira, "איחוד העבודה ומרצ למפלגת 'הדמוקרטים' | השלכות ומשמעויות", 4 July 2024,
  https://www.idi.org.il/articles/54838 (scholarship).
- Israel Democracy Institute, Assaf Shapira, the article on mergers already cited in our lineage records,
  https://en.idi.org.il/articles/54874 (scholarship).
- The CEC's 2026 list submissions, as transcribed in the app's 2026 election data (primary).
- To retrieve during the data research: the Registrar of Parties entries (Labor / The Democrats, Meretz, the Israeli
  Communist Party, Jewish Home, NRP); the Knesset's register of splits and mergers.

---

## Owner questions

All five were answered on 8 Nov on the [party history review page](https://claude.ai/artifact/Mr9phDBG3oeADqsETnE3Ku).
The owner approved every recommendation. The questions and options are kept below for reference.

### Q1. How should joint-list years look in a party's seat chart?

**What it is.** A party's history chart has one bar per election. In some years the party ran on a joint list: for
example Likud with Yisrael Beiteinu in 2013, or Hadash inside the Joint List. **Why there was a choice.** The seats
belong to the whole list, but we do know which party each elected member belongs to. Votes can never be divided. An
earlier drawing (a line on top of a striped bar) looked bad. See mock-ups M2–M4.

- **a)** In the seats view, the party's own elected members are drawn solid and its partners' members striped on
  top. In the vote-share view, the whole list's bar is striped.
- **b)** The whole list's bar is striped in both views, and the partners are named.
- **c)** The whole bar is solid when the party led the list, with a "+ partners" label.

**Recommendation:** a). It is factual (based on records of each person), reads at a glance, and shows Likud's weight
on its joint lists without any rule of thumb. It costs the same as the others.

**Decided by the owner on 8 Nov: a).**

### Q2. Should comparisons use "Probable" links automatically?

**What it is.** The rule for when a recorded link, such as Labor's rename to The Democrats, decides what a list is
compared with. **Why there was a choice.** Many facts are well established by scholarship, but the official record
(the Registrar's) is not yet in hand. Using them gives useful answers sooner. Waiting is stricter, but leaves lists
marked "Check".

- **a)** *Confirmed* and *Probable* links are used automatically, always with the certainty label and the evidence in
  the (i). "To verify" links are never used.
- **b)** Only *Confirmed* links are used automatically. A *Probable* link shows as "Check" until you accept it.

**Recommendation:** a). It matches what *probable* means in the source policy, and the label keeps it honest.

**Decided by the owner on 8 Nov: a).**

### Q3. Where should the "2022: …" comparison line show?

**What it is.** The short line under each list saying how it did against its comparable list at the previous
election. **Why there was a choice.** It is useful, but it adds a line to every row of the results list.

- **a)** Under each list in the results from the Standard level up, on by default, with a switch in Settings; and
  always in the list panel.
- **b)** At every level, Simple included.
- **c)** Only in the list panel and on the Compare screen.

**Recommendation:** a). Simple stays visually minimal, and the list panel still answers the question at every level.

**Decided by the owner on 8 Nov: a).**

### Q4. Should "founded by former members of …" ever count as a link?

**What it is.** New parties founded by people who came from another party: Kadima (Likud MKs), Kulanu (Kahlon),
Yashar! (Eisenkot). **Why there was a choice.** People often think of these as successors. But that is a judgement
about people, not a recorded act of the party, and it is where bias creeps in.

- **a)** Never as a link. Recorded faction splits appear as dated events in the history (Kadima split from the Likud
  faction, 2005), and the Compare screen offers the shared-candidate count as a hint ("8 candidates also ran for
  National Unity").
- **b)** Also show "founders from …" as a labelled event in the party's history.
- **c)** Neither: only mergers, renames and joint lists.

**Recommendation:** a). It keeps the facts that are on record and leaves the interpretation to the user (Q5).

**Decided by the owner on 8 Nov: a).**

### Q5. Can users define their own comparisons and links?

**What it is.** A way to say "compare Kadima 2006 with Likud 2003", or "treat X as continuing Y", for your own
analysis. **Why there was a choice.** It is powerful and fits the sandbox, but it is one more thing to explain and to
save.

- **a)** Both: "Compare with…" for a single list, and personal lineage presets that are saved and shared like party
  family presets, always marked Yours, and never counted as an edit to the result.
- **b)** Only "Compare with…" for a single list (the Compare screen's Map to… already does this inside Compare).
- **c)** Neither in the first version.

**Recommendation:** a), built last, after the sourced version is in place.

**Decided by the owner on 8 Nov: a), built last.**

---

## Technical notes (for developers)

### Where the data and code live

These are the repository files behind the features described above.

| Piece | Files | Notes |
|---|---|---|
| Party registry | `data/meta/parties.json` | 587 identities; one-election vehicles have no continuity by design. Gesher is stored as `gesher` (David Levy) and `gesher-2019` (Orly Levy). |
| Lineage graph | `data/meta/party-lineage.json` | 116 edges: 108 `electoral-partner`, 6 `merged-into`, 2 `split-from`, **0 `renamed-to`**; 29 pending items. One pending item is `democrats-2024`. The IDI mergers article is cited there as `mergers`. |
| Joint-list facts | `data/meta/joint-facts.json` | Elected members per party, opening-day factions, sources. |
| Families | `src/families/*`, `docs/design/party-families.md` | Family runtime and design. |
| Compare pairing | `src/app/compare/match.ts` (`matchRows`) | Uses the registry and lineage only. |
| List panel | `ListSidePanel.tsx`, `ListDetail.tsx` | No history today. |
| Election data | `public/data/k1–k26.json` | The 2026 submission for The Democrats is list `26-אמת` in `public/data/k26.json`, with the submitting parties in `partiesHe` and the sponsors in `sponsorsHe`. |
| Certainty rules | `src/data/evidence.ts` | Certainty is derived from the cites. |

### The coverage audit

The audit ran the real `matchRows` on every consecutive pair of official results (k1→k2 … k25→k26). The script is
`.backup-scratch/p1/audit.ts` in the design worktree (not committed). In the gaps list, Maki 1965 is held by the
unresolved `communist-identities` conflict, and Independent Liberals 1965 is dropped even though
`independent-liberals-1965` exists.

### Pairing fixes, in developer terms

1. A documented split is dropped when its parent list is part of a merged row (so `independent-liberals-1965` shows as
   New).
2. A joint run is tagged Merged; add a **Ran jointly** tag beside **Merged** (and a **Renamed** tag).
3. The "joined" list can be a minor partner's 0-seat list (Religious Zionism 2021 joined from Otzma 2020), so the
   leading party's origin appears only as a "moved" note. The comparable-predecessor rule fixes this.

### Data contract

New relation kinds and fields in `party-lineage.json`:

- new `relation` values: `renamed-to` (already allowed), `absorbed-into`, `faction-split`, `same-organisation`,
  `not-same-organisation`;
- an optional `stage` (`announced` | `approved` | `registered`) on `merged-into`;
- `certainty` derived from the cites, as in `src/data/evidence.ts`.

The Democrats are recorded as `labor —renamed→ democrats` (probable), plus `democrats + meretz —ran jointly→ 2026 list`
(confirmed), plus a merger `stage` of `announced` for Meretz. This replaces the pending item `democrats-2024`.

One shared function returns the counted lists, the not-counted parties, the group, the kind and the certainty. The
list rows, the panel and `match.ts` all call it:

```ts
comparablePredecessor(electionId, listId, relations, userOverrides)
```

A compact runtime file, like the families runtime: per election, list ids, names, colours, whole-list votes and
seats, constituents, and elected members per party. The mock-up's copy is about 230 KB raw, with logos and colours;
the production one should stay under the families' 200 KB ceiling by dropping logos.

### Tests

- the 2026 table in [section 3.4](#34-the-comparison-rule-what-a-list-is-compared-with);
- every 26-election identity series for Labor, Likud and Hadash;
- "votes never divided" (no constituent vote figure exists anywhere);
- the three pairing fixes above;
- each certainty label follows the source policy.

### Mock-up files

Rendered with the real app (temporary hooks in the list panel, list rows and Compare, now reverted) and real data.
Files are in `.backup-scratch/p1/png/` in the design worktree, not committed, named
`<id>-<lang>-<theme>-<width>.png`. Each was captured in en/he × light/dark at 1500 and 390.

| Id | Files |
|---|---|
| M1 | `m1-panel-democrats-k26-*` |
| M2 | `m2-history-labor-*` |
| M3, M3a | `m3-history-hadash-*`, `m3a-panel-jointlist-k26-*` |
| M4 | `m4-history-likud-2013-*` |
| M5 | `m5-results-rows-k26-*` |
| M6 | `m6-compare-table-*`, `m6-compare-matching-*` |

Before images, for contrast: `before-panel-democrats-en-light-1500.png`, `before-compare-matching-en-light-1500.png`.
