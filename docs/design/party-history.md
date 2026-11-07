# Party identity across elections, party history and "compared with last time"

Design and recommendations, 7 November 2026. Design only: no application or data changes. The mock-ups were
rendered with the real app, components and data in a scratch folder; they are listed in [§7](#7-mock-ups) and are
not committed.

**The rule in one sentence:** a list is compared with **whole earlier lists**, chosen only from **recorded
organisational facts** (the same party, a rename, a merger, a joint list, a split), each shown with how sure the
record is. A joint list's votes are never divided among its parties.

**Short version**

- **Coverage today.** Compare's matcher links **248 of 296** seat-winning lists (84%) in 1951–2026 to the previous
  election. 47 are "New" and 1 is "Check" (The Democrats). About half of the 47 are genuinely new parties; the rest
  are gaps in our records (§2).
- **Four model gaps matter most.** No "ran jointly" tag (Compare calls Likud Beiteinu 2013 a *merger*). No
  renames at all (0 edges). No identity link for Hadash (Rakah → Communist Party → Hadash, so Hadash 1992 is "New").
  No faction splits (Kadima 2005, Likud Beiteinu 2014, Yesh Atid 2020).
- **The Democrats can be settled from the record.** It is two separate facts, not one disputed merger: **Labor
  renamed The Democrats** (probable; IDI) and **Meretz ran on its list in 2026** (confirmed; the CEC list
  submission). Meretz is still a separately registered party. So the 2026 list is compared with **Labor + Meretz
  2022: 4 → 8 ▲4**, marked *Probable*. No legal merger is asserted.
- **Party history.** Click a list and its panel gains a small **History** chart: one bar per election, back to 1949.
  **Full history** opens a wide sheet with a seats/share switch, the party's names over time, dated events with
  certainty, and exact figures.
- **Joint lists, cleanly.** In the seats chart, the **solid part is the party's own elected members** and the
  **hatched part is its partners'** (official per-person records, available for all 99 seat-winning joint lists).
  Likud 2013 reads as 20 solid + 11 hatched, not as a mystery bar. In vote share, the whole list is hatched,
  because votes cannot be divided. This replaces the line-plus-bar drawing that looked bad.
- **"Since 2022" line.** In the results list, the panel and Compare: *2022: 5 ▲6 · Hadash–Ta'al + Balad*. The (i)
  shows which lists, why, and how sure.
- **Recommendation:** build it in four stages: data, then one shared comparison function, then the UI, then user
  overrides (§9). The data stage is research, best done first by the research lane.

---

## 1. What exists today (verified)

| Piece | Where | What it does | Limits found |
|---|---|---|---|
| Party registry | `data/meta/parties.json` | 587 identities: 116 parties, 363 one-election "electoral vehicles", 108 alliances; 975 list appearances (singleton / constituent / alliance) | A vehicle has no continuity by design, so a recurring list such as Tami (1981, 1984) is two unrelated identities |
| Lineage graph | `data/meta/party-lineage.json` | 116 documented edges: 108 `electoral-partner` (one per joint list), 6 `merged-into`, 2 `split-from`, **0 `renamed-to`**; 29 pending items | 27 of the 29 pending items are "ancestry not yet established" placeholders, one is a general note, one is `democrats-2024` |
| Joint-list facts | `data/meta/joint-facts.json` | For every joint list: head party, **elected members per party**, opening-day factions, sources (CEC candidate lists, Knesset OData) | None for this purpose. All 99 seat-winning joint lists are covered |
| Families | `src/families/*`, `docs/design/party-families.md` | Family charts with mixed (hatched) joint-list points and a policy selector | A family is an editorial grouping, not a party's own history |
| Compare matching | `src/app/compare/match.ts` | Pairs lists across elections from the registry and lineage only (Same, Renamed, Joined, Merged, Split, New, Ended, Check) | §2.3 lists three behaviours to fix |
| List panel | `ListSidePanel.tsx`, `ListDetail.tsx` | Seats, votes, agreement, parties, candidates | **No history and no comparison with the previous election** |

## 2. Coverage audit

Method: the real `matchRows` run on every consecutive pair of official results (k1→k2 … k25→k26), counting each
list that won seats in the later election. The script is under `.backup-scratch/p1/audit.ts`. k1 (1949) has no
predecessor.

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

Linked rows by tag: Same 174, Split 40, Merged 24, Joined 10.

### 2.2 The 48 unlinked, sorted by cause

- **Our records miss a link to a predecessor that is already in the data (8).** Hadash 1992 (the 1988 list was the
  same front under the Communist Party's registration). Jewish Home 2009 (the NRP's successor). Independent Liberals
  1965 (the edge exists, but the matcher drops it, §2.3). Tami 1984 and HaOlam HaZeh 1969 (each a recurring list
  stored as two one-off vehicles). Maki 1965 (the unresolved `communist-identities` conflict). Sephardim and
  Yemenite Association 1951 (both also ran in 1949).
- **Split-offs with no recorded split (12).** Ahdut HaAvoda 1955, Rafi 1965, Rakah 1965, National List 1969, Free
  Centre 1969, Shinui 1981, Tehiya 1981, Arab Democratic Party 1988, Third Way 1996, Am Ehad 1999, Kadima 2006,
  Hatnuah 2013. Each needs a dated record, usually the Knesset's splits-and-mergers register. **A split-off is still
  "New" for comparison**: it has no earlier votes of its own. The split appears as an event in both parties'
  histories.
- **Possible mergers to research (2).** United Arab List 1977 (from earlier Arab lists); Democratic List for
  Israeli Arabs 1951 (the 1949 Nazareth list is a pending item).
- **Genuinely new (25).** For example Dash 1977, Shas 1984, Moledet 1988, Yisrael BaAliyah 1996, Yisrael Beiteinu
  1999, Gil 2006, Yesh Atid 2013, Kulanu 2015, New Hope 2021, Yashar! 2026. Founders who came from another party do
  not make a predecessor (§3.3).
- **Check (1).** The Democrats 2026, resolved in §4.

### 2.3 Ten hard cases, checked

| Case | What the data and matcher do | Verdict |
|---|---|---|
| **Kadima** | 2006 New; 2009 Same; 2013 Same (2 seats). Hatnuah 2013 New | Right for comparison. Missing: the 2005 faction split from Likud and the 2012 departures to Hatnuah, as events |
| **Gesher** | Two identities: `gesher` (David Levy, 1996–99) and `gesher-2019` (Orly Levy) | Right: same name, different party. Make it an explicit "not the same party" fact so no future name match joins them |
| **Likud Beiteinu 2013** | Tagged **Merged** (Likud + Yisrael Beiteinu); 2015 splits correctly | **Wrong word.** They ran jointly and never merged. Needs a "Ran jointly" tag. Joint facts: Likud 20, Yisrael Beiteinu 11 elected. The 2014 faction split is missing |
| **Blue and White 2019–22** | 2019 Joined (Yesh Atid); 2021 Split into Yesh Atid 17 and Blue and White 8; 2022 National Unity Merged | Right. Missing: the March 2020 faction split as an event |
| **Yamina / New Right** | 2019 Sep Merged (New Right + URWP); 2021 Split; Religious Zionism 2021 **Joined from Otzma 2020 (0 seats)** | **Misleading.** Religious Zionism 2021 is led by Tkuma, which ran inside Yamina in 2020. Pairing it with Otzma's 0-seat list shows +6. The proposed rule (§3.4) gives "Yamina 2020 → 2 lists" instead |
| **Joint List 2015–2026** | 2015 Merged; 2019 Apr Split; Sep Merged; 2021 Split (Ra'am out); 2022 Split; 2026 Merged | Right throughout |
| **The Democrats** | Check (pending `democrats-2024`) | Resolvable from the record (§4) |
| **Ra'am in and out** | 1996 Joined (with the Arab Democratic Party); 2015–20 inside the Joint List; 2021 Split; 2022 and 2026 Same | Right |
| **Shas / Degel / Aguda in UTJ** | Shas always alone, Same; UTJ 1992 Merged (Aguda + Degel); head party changes handled; the 1988 Degel split documented | Right. Missing: UTJ's mid-term faction splits as events |
| **National Union / Tkuma / RZP / Otzma** | 1999 National Union Same; 2013 Jewish Home Merged; 2022 Same; 2026 Split into three, compared as a group (14 → 13 ▼1) | Right, except Religious Zionism 2021 (above). Tkuma's later name (Religious Zionist Party) is not recorded as a rename, but its id is unchanged, so nothing breaks |

**Matcher behaviours to fix** (found in the audit):

1. A documented split is dropped when its parent list is part of a merged row. Independent Liberals 1965 shows as
   New although `independent-liberals-1965` exists.
2. A joint run is tagged Merged. Compare needs **Ran jointly** next to **Merged**.
3. The list a party "joined" can be a minor partner's 0-seat list (Religious Zionism 2021), so the leading party's
   real origin is shown only as a "moved" note.

## 3. Model

### 3.1 Three layers

1. **Party**: an organisation, with dated names (already in the registry).
2. **List**: what was on the ballot at one election, with its constituent parties (already in the registry and
   joint facts).
3. **Relations**: dated facts between parties, each with sources and a certainty under
   [source-policy.md](../source-policy.md). Only relations move a history or a comparison across a change of party.

### 3.2 Relations: what exists and what to add

| Relation | Meaning | Example | Best record | Today |
|---|---|---|---|---|
| **Ran jointly** | Parties shared one list at one election | Likud + Yisrael Beiteinu 2013; Democrats + Meretz 2026 | CEC list submission (primary) | Exists as `electoral-partner`; **needs its own Compare tag** |
| **Renamed** | Same organisation, new name | Labor → The Democrats (2024) | Registrar of Parties notice (primary); IDI (scholarship) | Kind exists, **0 edges** |
| **Merged** | Several parties became one new party | Mapai + Ahdut HaAvoda + Rafi → Labor (1968); Herut + Liberals → Likud (1988) | Registrar notice; scholarship | 6 edges |
| **Absorbed** | One party joined another, which keeps its identity | Yisrael BaAliyah → Likud (2003) | Registrar notice; scholarship | Stored as `merged-into`. Add the kind so the successor's name is not treated as new |
| **Merger stage** | Announced → approved by party bodies → registered | The Democrats and Meretz: announced and approved 2024; not registered as one | Party decisions (primary for what they said); Registrar | Missing |
| **Split** | A group left and formed a new party | Rakah from Maki (1965); Degel from Aguda (1988) | Knesset register; scholarship | 2 edges |
| **Faction split** | A Knesset faction divided during the term | Kadima from Likud (2005); Likud Beiteinu (2014); Yesh Atid from Blue and White (2020) | Knesset faction records (primary) | Missing |
| **Same party, recorded under another id** | One organisation stored under several ids | Rakah = Communist Party = Hadash's registered party; recurring vehicles (Tami, HaOlam HaZeh) | Registrar; the CEC 2026 Joint List submission names the Israeli Communist Party | Missing (the conflict is noted) |
| **Not the same party** | Same or similar name, different organisation | Gesher 1996 vs Gesher 2019; Koach Lehashpia 2009 vs 2013; Achi 2026 vs Ahi | Registrar; scholarship | Two conflicts are noted in prose only |
| **Disputed succession** | Reliable sources disagree on who continues whom | Example to research: "Herut – the National Movement" (1999) and the historical Herut | Both sides cited | Missing; use certainty `disputed` |

**Certainty.** Every relation takes the policy's ceilings. A Registrar notice or a CEC submission is primary
(confirmed). An IDI profile alone is scholarship (probable). Press needs the policy's counts. "To verify" in the
mock-ups is the policy's *unknown*: shown, never used to compare.

### 3.3 What never makes a relation

- **Ideology or "spiritual heirs".** Political descent is contested and editorial; this is where neutrality would
  break.
- **Founders who came from elsewhere** (Kahlon from Likud to Kulanu; Eisenkot from National Unity to Yashar!).
  Compare already shows the factual hint: "8 candidates also ran for National Unity in 2022", counted by Knesset
  member record and never asserted.
- **"Technical bloc"** as a label. Whether a joint list was "only technical" is a judgement. The recorded facts say
  it plainly: a joint list, its opening-day factions, and the date it split.
- **Names, ballot letters or vote rank.** These are already excluded today.

### 3.4 The comparison rule ("comparable predecessor")

For a list at election *k*, look at each of its parties at election *k − 1* (following renames and mergers):

- **Counted:** an earlier list counts **whole** when all of its parties are on the current list.
- **Not counted:** an earlier list that also held parties now elsewhere is named and left out, because its votes
  cannot be divided.
- **Split:** when the leading party's earlier list is now spread over several lists, the comparison is the group:
  "Religious Zionism 2022 → 3 lists: 14 → 13 ▼1". There is no per-successor figure.
- **New:** no earlier list qualifies.

The certainty of a comparison is the weakest relation it used. The 2026 results:

| 2026 list | Compared with (2022) | Seats | Note |
|---|---|---|---|
| Joint List | Hadash–Ta'al + Balad | 5 → 11 ▲6 | Combined; votes 317,352 → 500,755 |
| The Democrats | Labor + Meretz | 4 → 8 ▲4 | Combined; *Probable* (the rename) |
| Likud | Likud | 32 → 27 ▼5 | Partial: New Hope not counted (it ran inside National Unity) |
| Together (Bennett) | Yesh Atid | 24 → 12 ▼12 | Together's own party is new |
| Religious Zionism–Zehut, Otzma Yehudit, Noam | Religious Zionism | 14 → 13 ▼1 | Group only |
| UTJ, Shas, Ra'am, Yisrael Beiteinu | Same list | 7 → 7, 11 → 6, 5 → 8, 6 → 7 | — |
| Yashar! | — | New | Hint: shared candidates with National Unity |

**Seats by party inside a joint list.** The number of elected members of each party is a recorded fact about
people, not a split of votes (joint facts, from the CEC candidate lists and Knesset OData). It may be used **for
seats only**, labelled "elected members". Votes and vote share always stay with the whole list.

## 4. The Democrats, from the record

| Fact | Source | Tier | Certainty |
|---|---|---|---|
| The 2026 list was submitted by two parties: "הדמוקרטים מיסודה של תנועת העבודה" and "מרצ" | CEC 2026 list submission (`public/data/k26.json`, `26-אמת`, `partiesHe`) | Primary | **Confirmed**: Meretz ran jointly; it was a separate submitting party in 2026 |
| Labor is the legal platform of the new party and changes its name to "The Democrats"; both parties stay registered separately | IDI, Assaf Shapira, "איחוד העבודה ומרצ למפלגת 'הדמוקרטים'", 4 July 2024 (idi.org.il/articles/54838) | Scholarship | **Probable**: Labor renamed The Democrats |
| The union was announced on 30 June 2024; both parties' bodies later approved it | Contemporary press (Maariv, 30 June 2024, for the announcement); approval dates not yet cited | Contemporary | Announcement: provisional (one report); approval dates to cite in the data stage |
| A completed legal merger with Meretz | None found | — | **Not asserted**. The deciding record is the Registrar of Parties entry |

**Model:** `labor —renamed→ democrats` (probable), plus `democrats + meretz —ran jointly→ 2026 list` (confirmed),
plus a merger stage of "announced" for Meretz. The pending item `democrats-2024` is replaced, and Compare shows
*Merged* ("Labor, renamed + Meretz 2022") with a *Probable* chip instead of *Check*. Labor's history continues
unbroken into 2026 under its new name. Meretz keeps its own history, with 2026 as a joint-list year (1 elected
member).

## 5. Interface

### 5.1 Party history

**Where it opens.** It opens from the list panel, from any seat or list row that opens the panel, from a Compare row's
menu, and from a member party on the Party families page. The panel section shows at every level, because it is a
fact, not an edit.

**Panel section (compact)** [M1, M3a]
- Title "History · since 1949".
- For a joint list, **party chips** (The Democrats | Meretz) choose whose history is shown. The leading party is
  chosen first.
- The party's names over time in one line: "Mapai → Labor → The Democrats".
- A small chart: one bar per election, the current one boxed.
- The "Since 2022" line (§5.2).
- **Full history ›**.

**Full sheet** [M2, M3, M4] (wide on desktop, full screen on phones)
- **Header:** the name, the chain of names, and one line: "Ran in 26 of 26 elections · won seats in 26 · most: 56
  (1969)".
- **Controls:** party chips; **Seats | Vote share**.
- **Chart (always left to right, in Hebrew too):**
  - Seats: the solid part is the party's own elected members; the hatched part is its partners' members. Each bar
    is labelled with the list's total.
  - Vote share: whole-list bars, hatched when joint, dashed when the party ran inside another party's list.
  - "·" marks an election it missed between runs. Nothing is drawn before the party's first run.
  - A **name strip** under the axis (Mapai | Labor | The Democrats).
  - An **event lane** with dated markers and a word under each (Merged, Renamed, Faction split). The ring shows
    certainty: solid for confirmed, dashed for probable, amber "?" for "To verify". Events in the same year share
    one marker.
- **Selected election card:** list name, seats, share and votes; "Led a joint list with Ta'al, Balad"; "Elected:
  Hadash 5 · Ta'al 3 · Balad 3"; "Votes are for the whole list".
- **Events list:** year (or "1988–92" when only the interval is known), wording, certainty chip, and (i) for the
  evidence.
- **Exact figures (26 elections):** a collapsed table, as on the family page.

Keyboard: the bars are focusable, and arrow keys move between elections, as in the family charts. Hover and focus
show the card. Tables-instead-of-charts opens the table.

### 5.2 "Compared with last time"

- **Results list rows** [M5], Standard and above: one line, "2022: 5 ▲6 · Hadash–Ta'al + Balad". The name is left
  out when it is unchanged ("2022: 6 ▲1"); a partial comparison carries "*". Green ▲ and red ▼ with a sign, as
  everywhere. The year prefix keeps it apart from the edit change beside the seat count, which compares with the
  official result.
- **List panel** [M1]: "Since 2022 **Labor + Meretz** 4 → 8 ▲4 · −0.4 pp", the certainty chip when it is not
  confirmed, and (i). The (i) lists the earlier lists with seats and votes, the relation and its source. Anything
  "not counted" is one tiny line.
- **Compare** [M6]: tags gain **Ran jointly** and **Renamed**. Under the later list's name goes one line: "= Labor,
  renamed + Meretz 2022 *Probable*", or "with New Hope · not counted: it ran inside National Unity in 2022". The
  Matching panel's reason becomes "Compared with the whole 2022 lists: Labor (4) + Meretz (0)", with each relation,
  its chip and its evidence.

### 5.3 Your own comparison and lineage (analysis, not edits)

- **This list, this time:** "Compare with…" in the panel's (i) and in Compare's Matching panel (the existing **Map
  to…**). You pick whole earlier lists; suggestions are ranked by shared candidates. It is marked **Yours**.
- **My lineage:** a personal relation, for example "treat Kadima as continuing Likud". It is saved like a personal
  family preset (browser storage, export and import), carried in comparison and scenario share links, and marked
  **Yours** wherever it is used.
- **Class:** these are analysis choices. They never change a result, never mark the scenario as edited, and never
  enter the sourced registry. This is the same class as Compare mappings today.

### 5.4 Learn or Play

Party history is **factual context**: it belongs with Learn, whatever that becomes. It is reached from Play
through the shared list panel, so no tab is needed now. The comparison line sits on results in both. Overrides are
Play (analysis). A later **Parties** index (A–Z, each party opening its sheet) fits naturally in Learn.

### 5.5 Levels, language and phone

- **Simple:** the panel history (chart, one line, Full history). No row line, no chips beyond the list's parties.
- **Standard:** adds the row line and the Compare tags.
- **Expert:** adds the evidence details inside (i) and the exact-figures table open by default.
- Hebrew and English are complete, with short party names in chips. Graphics never mirror.
- Phone: the sheet is full screen, years every 4 elections, events without words (the list below has them).

## 6. Data contract (for the build)

- `party-lineage.json`:
  - new `relation` values: `renamed-to` (already allowed), `absorbed-into`, `faction-split`, `same-organisation`,
    `not-same-organisation`;
  - an optional `stage` (`announced` | `approved` | `registered`) on `merged-into`;
  - `certainty` derived from the cites, as in `src/data/evidence.ts`.
- One shared function `comparablePredecessor(electionId, listId, relations, userOverrides)`. It returns counted
  lists, not-counted parties, the group, the kind and the certainty. It is used by the list rows, the panel and
  `match.ts`.
- A compact runtime (like the families runtime): per election, list ids, names, colours, whole-list votes and seats,
  constituents, and elected members per party. The mock-up's copy is about 230 KB raw, with logos and colours; the
  production one should stay under the families' 200 KB ceiling by dropping logos.
- Tests:
  - the 2026 table in §3.4;
  - every 26-election identity series for Labor, Likud and Hadash;
  - "votes never divided" (no constituent vote figure exists anywhere);
  - the three matcher fixes in §2.3;
  - each certainty chip follows the policy.

## 7. Mock-ups

Rendered with the real app (temporary hooks in the list panel, list rows and Compare, now reverted) and real data.
Files are in `.backup-scratch/p1/png/` in the design worktree, not committed: `<id>-<lang>-<theme>-<width>.png`.
Each was captured in en/he × light/dark at 1500 and 390.

| Id | Shows |
|---|---|
| M1 `m1-panel-democrats-k26-*` | 2026 Democrats panel: History section, chips, chain, compact chart, "Since 2022 Labor + Meretz 4 → 8 ▲4 *Probable*" |
| M2 `m2-history-labor-*` | Full history, Labor 1949–2026: Mapai → Labor → The Democrats; the Alignment years with Mapam's members hatched; 2024 rename and union markers |
| M3 `m3-history-hadash-*`, M3a `m3a-panel-jointlist-k26-*` | Hadash via the Joint List: chips Hadash · Ta'al · Balad; Rakah → Communist Party → Hadash with two "To verify" identity links |
| M4 `m4-history-likud-2013-*` | Likud from 2013: Likud Beiteinu 20 solid + 11 hatched; Herut → Likud; 1988 merger; 2003 absorption; faction splits to verify |
| M5 `m5-results-rows-k26-*` | 2026 results list with the "2022: …" line on every seat-winning list |
| M6 `m6-compare-table-*`, `m6-compare-matching-*` | Compare 2022 ↔ 2026: Democrats as Merged with the rename chip; Likud's "not counted" note; Matching reasons with evidence |

Before images, for contrast: `before-panel-democrats-en-light-1500.png`, `before-compare-matching-en-light-1500.png`.

## 8. Risks and downsides

- **Contested successions (neutrality).** Who "continues" a party is a political claim. Labor, Herut, the National
  Union names and the Arab parties are all sensitive. *Mitigation:* only organisational acts with records; no
  ideology, no founders, no "technical bloc"; disputes shown with both sides. The cost is that some links people
  expect will not appear.
- **Mis-attribution.** A wrong identity link silently changes every comparison and history it touches. Gesher is
  the classic trap. *Mitigation:* "not the same party" facts, per-party snapshot tests, and certainty chips. A
  relation below probable is never used automatically.
- **Probable used as if certain.** The Democrats comparison rests on scholarship until the Registrar is checked.
  *Mitigation:* the chip, plus the (i) naming the deciding record (owner question Q2).
- **Complexity.** A new line in every row, chips, event markers and certainty. *Mitigation:* the row line only from
  Standard, and words not icons; detail goes behind (i).
- **Partial comparisons mislead in their own way.** "Likud 32 → 27" ignores New Hope's 1 elected member in 2026.
  *Mitigation:* the visible "not counted" note. The seat chart's solid/hatched split shows it at a glance.
- **Maintenance.** Each election needs an identity review: renames, joint lists, splits. There are about 40 records
  to research now (the 8 gaps, 12 splits, 2 possible mergers and the faction splits). The Registrar and Knesset
  registers are partly behind access walls, so some links will stay "To verify" for a while.
- **Elected-member counts are per person at the election.** Later replacements or MKs leaving their party are not
  reflected, which is correct for an election history. The card says "elected".

## 9. Recommendation and staged plan

Do it. The comparison people actually want ("did the Joint List do better than last time?") is currently
unanswerable or wrong in a few visible places. Most of the data needed already exists.

1. **Data (research lane, Codex):**
   - the Democrats facts (§4) and the Registrar check;
   - the Hadash identity chain; NRP → Jewish Home;
   - the 8 identity gaps and the 12 splits;
   - faction splits from the Knesset register (2005, 2014, 2020, UTJ);
   - "not the same party" facts.

   Every item is cited under the source policy.
2. **One comparison function** and the three matcher fixes, with the tests in §6.
3. **Interface:** the panel History section and full sheet, the row line (Standard), and the Compare tags and
   reasons.
4. **Your own comparison and lineage** (§5.3).

Stages 2–3 do not wait for all of stage 1. Missing links simply show as New or "To verify".

## 10. Sources

- Repository: `data/meta/parties.json`, `data/meta/party-lineage.json`, `data/meta/joint-facts.json`,
  `public/data/k1–k26.json`, `src/app/compare/match.ts`, [source-policy.md](../source-policy.md),
  [compare-workbench.md](compare-workbench.md), [party-families.md](party-families.md).
- Israel Democracy Institute, Assaf Shapira, "איחוד העבודה ומרצ למפלגת 'הדמוקרטים' | השלכות ומשמעויות", 4 July 2024,
  https://www.idi.org.il/articles/54838 (scholarship).
- Israel Democracy Institute, Assaf Shapira, mergers article already cited in the lineage file as `mergers`,
  https://en.idi.org.il/articles/54874 (scholarship).
- CEC 2026 list submissions as transcribed in `public/data/k26.json` (`sponsorsHe`, `partiesHe`) (primary).
- To retrieve in the data stage: the Registrar of Parties entries (Labor / The Democrats, Meretz, the Israeli
  Communist Party, Jewish Home, NRP); the Knesset "splits and mergers" register.

---

## Owner questions

### Q1. How should joint-list years look in a party's seat chart?

**What it is:** in a party's history, the years it ran on a joint list (Likud with Yisrael Beiteinu in 2013, Hadash
in the Joint List). **Why there's a choice:** the seats belong to the list, but we do know which party each elected
member belongs to. Votes can never be divided. You disliked the earlier line with a hatched bar. See M2–M4.

- **a)** Seats: the party's own elected members solid, partners' members hatched on top. Vote share: whole list,
  hatched.
- **b)** The whole list's bar hatched in both views, with partners named.
- **c)** The whole bar solid when the party led the list, with a "+ partners" label.

**Recommendation:** a). It is factual (per-person records), reads at a glance, and makes Likud's dominance on its
lists visible without any rule of thumb. Same cost as the others.

### Q2. Should comparisons use relations that are "Probable" automatically?

**What it is:** the rule for when a recorded relation, such as Labor's rename to The Democrats, decides what a list
is compared with. **Why there's a choice:** many facts are well established by scholarship, but the official record
(the Registrar) is not yet in hand. Using them gives useful answers sooner; waiting is stricter but leaves "Check"
rows.

- **a)** Confirmed and Probable are used automatically, always with the certainty chip and the evidence in (i).
  "To verify" is never used.
- **b)** Only Confirmed is used automatically; Probable shows as "Check" until you accept it.

**Recommendation:** a). It matches the source policy's own meaning of *probable*, and the chip keeps it honest.

### Q3. Where should the "2022: …" comparison show?

**What it is:** the short line under each list saying how it did against its comparable list at the previous
election. **Why there's a choice:** it is useful, but it adds a line to every row.

- **a)** In the list rows from Standard, on by default, with a Settings switch; always in the list panel.
- **b)** At every level, Simple included.
- **c)** Only in the list panel and in Compare.

**Recommendation:** a). Simple stays visually minimal; the panel still answers the question at every level.

### Q4. Should "founded by former members of …" ever count?

**What it is:** new parties founded by people from another party: Kadima (Likud MKs), Kulanu (Kahlon), Yashar!
(Eisenkot). **Why there's a choice:** people often think of these as successors, but that is a judgement about
people, not a recorded act of the party, and it is where bias creeps in.

- **a)** Never as lineage. Recorded faction splits appear as dated events (Kadima split from the Likud faction,
  2005), and Compare offers the shared-candidate count as a hint ("8 candidates also ran for National Unity").
- **b)** Also show "founders from …" as a labelled event in the party's history.
- **c)** Neither: only mergers, renames and joint lists.

**Recommendation:** a). It keeps the facts that are on record and leaves the interpretation to the user (Q5).

### Q5. Can users define their own comparisons and lineage?

**What it is:** a way to say "compare Kadima 2006 with Likud 2003", or "treat X as continuing Y", for your own
analysis. **Why there's a choice:** it is powerful and fits the sandbox, but it is another thing to explain and
save.

- **a)** Both: "Compare with…" for one list, and personal lineage presets, saved and shared like family presets,
  always marked Yours, never a result edit.
- **b)** Only per-list "Compare with…" (Compare's Map to… already does this inside Compare).
- **c)** Neither in the first version.

**Recommendation:** a), built last (stage 4), after the sourced version is in place.
