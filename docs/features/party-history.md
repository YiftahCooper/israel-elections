# Party identity across elections, party history and "compared with last time"

How the app decides that a list at one election is "the same party" as a list at an earlier one, and what it
compares a list with. The rules below are what `src/history/` implements; the tests in
`tests/party-history.test.ts` lock them in. The recorded relations, with their sources, are in
[`data/meta/party-lineage.json`](../../data/meta/party-lineage.json); the research behind them is in
[research/party-lineage-stage1.md](../research/party-lineage-stage1.md).

What the app shows:

- **Party history** (list panel, from every level): a party's results at every election since its first, with its
  names over time and dated events (mergers, renames, splits), each with its certainty and evidence behind an (i).
  Bars are for the whole list the party ran in; in joint-list years the party's own elected members are shown
  separately from its partners'.
- **"Compared with last time"**: in the list panel and on the Compare screen, and as an optional line under each list
  in the results (Settings, off by default). It compares a list with the earlier list or lists chosen by the rule in
  [section 1.4](#14-the-comparison-rule-what-a-list-is-compared-with).
- **Your own comparisons and links** are analysis choices: they never change a result, never mark a scenario as
  edited and never enter the sourced records.

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

## 1. How party identity is modelled

### 1.1 Three layers

1. **Party**: an organisation, with its names and the dates it used each (already in our party registry).
2. **List**: what was on the ballot at one election, with its constituent parties (already in the registry and the
   joint-list facts).
3. **Relations**: dated facts linking parties, each with its sources and a certainty under the
   [source policy](../source-policy.md). Only a relation can carry a party's history or comparison across a change of
   party.

### 1.2 Kinds of relation

| Relation | What it means | Example | Best record |
|---|---|---|---|
| **Ran jointly** | Parties shared one list at one election. | Likud + Yisrael Beiteinu 2013; The Democrats + Meretz 2026 | The CEC list submission (an official, primary record) |
| **Renamed** | The same organisation took a new name. | Labor → The Democrats (2024) | A Registrar of Parties notice (primary); the Israel Democracy Institute, IDI (scholarship) |
| **Merged** | Several parties became one new party. | Mapai + Ahdut HaAvoda + Rafi → Labor (1968); Herut + Liberals → Likud (1988) | Registrar notice; scholarship |
| **Absorbed** | One party joined another, which kept its own identity. | Yisrael BaAliyah → Likud (2003) | Registrar notice; scholarship |
| **Merger stage** | A merger moves through steps: announced → approved by both parties' bodies → registered. | The Democrats and Meretz: announced and approved in 2024; not registered as one party | The parties' own decisions (primary for what they said); the Registrar |
| **Split** | A group left and formed a new party. | Rakah from Maki (1965); Degel from Aguda (1988) | The Knesset's register; scholarship |
| **Faction split** | A Knesset faction divided during the term. | Kadima from Likud (2005); Likud Beiteinu (2014); Yesh Atid from Blue and White (2020) | Knesset faction records (primary) |
| **Same party, stored twice** | One organisation is stored under several identities in our records. | Rakah = the Communist Party = Hadash's registered party; lists that ran more than once (Tami, HaOlam HaZeh) | Registrar; the CEC 2026 Joint List submission names the Israeli Communist Party |
| **Not the same party** | Same or similar name, different organisation. | Gesher 1996 vs Gesher 2019; Koach Lehashpia 2009 vs 2013; Achi 2026 vs Ahi | Registrar; scholarship |
| **Disputed succession** | Reliable sources disagree on who continues whom. | Example to research: "Herut – the National Movement" (1999) and the historical Herut | Both sides cited |

**How sure each relation is.** Every relation follows the source policy's limits. A Registrar notice or a CEC
submission is a primary record, so the relation is *confirmed*. An IDI profile alone is scholarship, so the relation
is *probable*. Newspaper reports need the number of independent reports the policy asks for. "To verify" is the policy's *unknown*: it is shown, but never used to compare.

### 1.3 What never counts as a link

- **Ideology or "spiritual heirs".** Political descent is contested and a matter of opinion. This is exactly where
  the app would stop being neutral.
- **Founders who came from another party.** For example, Kahlon moved from Likud to found Kulanu; Eisenkot moved from
  National Unity to Yashar!. The Compare screen already shows a factual hint instead: "8 candidates also ran for
  National Unity in 2022". This is counted from Knesset member records and is never presented as a link.
- **"Technical bloc"** as a label. Whether a joint list was "only technical" is a judgement. The recorded facts say
  it plainly: a joint list, the factions it formed on the Knesset's opening day, and the date it split.
- **Names, ballot letters or a list's rank by votes.** These are already ignored today.

### 1.4 The comparison rule: what a list is compared with

For a list at one election, look at each of its parties at the previous election, following any renames and
mergers:

- **Counted:** an earlier list counts **whole** when all of its parties are on the current list. A partner that did
  not run at all does not stop it counting; a list whose leading party did not run does not count on a partner's new
  list (Yachad 2015: only Otzma Yehudit joined the Union of Right-Wing Parties in 2019, so Otzma is "not counted").
- **Not counted:** an earlier list that also held parties now running elsewhere is named and left out, because its
  votes cannot be divided.
- **Split:** when the leading party's earlier list is now spread over several lists, the comparison is made for the
  group: "Religious Zionism 2022 → 3 lists: 14 → 13 ▼1". There is no figure for each successor.
- **New:** no earlier list qualifies.

The Compare screen pairs lists by the same records, so a list the comparison counts is always in the same Compare row.
A partner that moved to another list is noted there ("moved on"); the row keeps its word (Same, Renamed), because the
leading party's list did not split.

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

## Where the data and code live

| Piece | Files |
|---|---|
| Party registry | `data/meta/parties.json` |
| Lineage relations | `data/meta/party-lineage.json`, read by `src/history/relations.ts` |
| Joint-list facts (elected members per party) | `data/meta/joint-facts.json` |
| Comparison rule | `src/history/compare.ts` (`comparableFor`), used by the results rows, the list panel and `src/app/compare/match.ts` |
| A party's history series | `src/history/identity.ts`; runtime file built by `scripts/party-history-runtime.ts` |
| Certainty rules | `src/data/evidence.ts`, `src/history/evidence-of.ts` |
| Party families (related, separate feature) | [party-families.md](party-families.md) |

## Data contract

Relation kinds in `party-lineage.json` (`RELATION_KINDS` in `src/history/relations.ts`): `renamed-to`,
`merged-into` (with an optional `stage`: `announced` | `approved` | `registered`), `absorbed-into`, `split-from`,
`faction-split`, `same-organisation`, `not-same-organisation`, `electoral-partner` (ran jointly) and
`leader-moved-to`. Only renames, absorptions, "same organisation" and registered mergers join two ids into one
party's history. Each relation's certainty is derived from its cites (`src/data/evidence.ts`).

One shared function, `comparablePredecessor` in `src/history/compare.ts` (called through `comparableFor`), returns
the counted lists, the not-counted parties, the group, the kind and the certainty. The list rows, the list panel and
`src/app/compare/match.ts` all use it, so they always agree.

The party-history runtime file is built by `scripts/party-history-runtime.ts`, like the families runtime: per
election, list ids, names, colours, whole-list votes and seats, constituents, and elected members per party,
without logos.

## Tests

- the 2026 table in [section 1.4](#14-the-comparison-rule-what-a-list-is-compared-with);
- every 26-election identity series for Labor, Likud and Hadash;
- "votes never divided" (no constituent vote figure exists anywhere);
- the three pairing fixes above;
- each certainty label follows the source policy.

## Sources

- The project's own records: the party registry (`data/meta/parties.json`), the lineage records
  (`data/meta/party-lineage.json`), the joint-list facts (`data/meta/joint-facts.json`) and the official results of
  all 26 elections (`public/data/k*.json`); the [source policy](../source-policy.md).
- Israel Democracy Institute, Assaf Shapira, "איחוד העבודה ומרצ למפלגת 'הדמוקרטים' | השלכות ומשמעויות", 4 July 2024,
  https://www.idi.org.il/articles/54838 (scholarship).
- Israel Democracy Institute, Assaf Shapira, on party mergers, https://en.idi.org.il/articles/54874 (scholarship).
- The CEC's 2026 list submissions, as transcribed in the app's 2026 election data (primary).
