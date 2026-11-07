# Source policy: evidence tiers and certainty

How the project decides what a historical fact is, and how sure it is. It applies to every claim the data carries:
recommendations to the President, government membership and support, formation and term events, party-family
placements and candidate identity links. The rules are code: `src/data/evidence.ts` derives tiers and certainty,
`scripts/lib/build/evidence.ts` rejects data that overstates them, and the [gaps register](data-gaps.md) reports
them. Language, editorial stance and access etiquette are in [source-hierarchy.md](research/source-hierarchy.md).

## Tiers

| Tier | What counts | Examples |
| --- | --- | --- |
| 1. Primary record | The record made by the body performing the act, at the time. | Knesset plenum protocols and OData; Reshumot (Gazette, Yalkut HaPirsumim); CEC publications; President's Residence notices; State Archives documents; signed coalition agreements; government presentations. |
| 2. Contemporary report | Dated reporting of the event by an established outlet, Israeli or international. | Davar, Maariv, Haaretz, Al HaMishmar, HaTzofe, Herut; JTA, NYT, Washington Post, LA Times, Reuters, AP, UPI; Ynet, Times of Israel, Globes, Kan, N12. |
| 3. Scholarship | Peer-reviewed or institutional work by recognised historians and political scientists; institutional accounts. | IDI books and party profiles; the *Elections in Israel* series; Knesset Research and Information Center; Knesset and MFA narrative histories; IPU Parline. |
| 4. Retrospective | Journalism written well after the fact. | Anniversary pieces, timelines, explainers, "fast facts". |
| 5. Pointer | Leads only; never evidence. | Hebrew Wikipedia (labelled). English Wikipedia is never used at all. |

How the code assigns a tier (an explicit `tier` on a source overrides the rule; Hebrew Wikipedia is always a pointer):
- Official records on Israeli government (`*.gov.il`), IDF or UN hosts are primary. Narrative pages on those hosts
  (Knesset history, lexicon and biography pages, MFA *Facts about Israel*, State Archives chapters, Knesset Research
  Center papers) are scholarship. Official documents on other hosts (foreign governments, CRS, mirrors) are
  scholarship unless the retained-source manifest flags a copy of an official publication (`official: true`), or
  the source sets `tier: "primary"` with a `via` note naming the original record. A Wayback copy is judged by the
  page it archived.
- `academic` sources and the named research institutions (IDI, IPU, INES) are scholarship.
- Press is contemporary by default. Timelines, fast facts, year reviews and crisis-group analyses are
  retrospective; any other later account needs `tier: "retrospective"`.

## Independence

Evidence counts once per independent origin:
- copies of one wire story (UPI in the LA Times and in UPI's archive) are one source; the agency is read from the
  publisher (Reuters, AP, UPI, JTA, AFP);
- several reports by one outlet are one source;
- a mirror, quotation or reproduction belongs to its original (`evidenceFamily` declares it);
- our own generated data never corroborates the source it was built from.

## Certainty

| Certainty | Threshold (independent sources) |
| --- | --- |
| **confirmed** | A primary record; or a contemporary report and a scholarly work; or three contemporary reports. |
| **probable** | Scholarship without a primary record; or two reliable reports, at least one contemporary. |
| **provisional** | One reliable source; or retrospectives only. |
| **disputed** | Reliable sources conflict. Recorded explicitly with both sides cited; never resolved silently. |
| **unknown** | No reliable source, or pointers only. Unknown never means "did not happen". |

- The threshold is a **ceiling**. A claim may be recorded lower when its sources only partly establish it (a roll
  call proves a vote, not the absence of an arrangement); the record then needs a note saying why.
- Explicit values are validated against the ceiling on every data build. Derived values (recommendations, events)
  are computed from the cites, so they cannot drift.
- Party-family placement is editorial: at most probable (when scholarship places the party), otherwise provisional.
- Candidate identity: an official Knesset identity is confirmed; a reviewed match is probable; a name-rule match
  (`probable` in the published bio) is provisional.
- Government roles from the 7 November support-roles pass map directly: confirmed and provisional keep their
  meaning; unknown stays unknown. Eleven rows that claimed confirmed on one contemporary report or an institutional
  page were lowered with notes: ten individual roll-call votes (1984, 1990, 2021) to provisional, NRP 2003 to probable.

## Conflicts

1. A primary record beats every other tier. Two primary records that disagree are **disputed** until a third
   primary record or the formal act (the signed letter, the gazetted notice) settles it.
2. On facts of record (dates, counts, membership), scholarship that cites primary or archival material beats a
   contemporary report; early reports carry preliminary counts and rumours.
3. On what was said or reported at the time, a contemporary report beats later scholarship that cites nothing.
4. Retrospectives and pointers never settle a conflict.
5. Otherwise the fact is **disputed**: both values stay in the record with their sources, and the register lists it.

## When scholarship may settle a fact

Primary records are often closed, lost or unlocatable (presidential consultation minutes before the 2000s,
State Archives files behind access walls). A fact does not stay unknown merely because the primary record is out of
reach. Recognised scholarship may settle it:
- one scholarly work that states the fact makes it **probable**;
- scholarship plus an independent contemporary report makes it **confirmed**;
- the deciding primary record is still named in the note, so a later reader can upgrade or overturn it.

Scholarship may not settle a fact by arithmetic (a per-party recommendation is never inferred from an aggregate
tally) or by reading intention from a vote.

## Bias and partisanship

Neutral means not partisan within Israeli politics; Israeli sources are welcome and Hebrew sources are the main
body of evidence. A party's or politician's own statement is primary evidence of **what they said** (a declared
recommendation, a list name, a logo), not of contested facts about others. Opinion columns and advocacy
organisations from any camp are not evidence. When a political fact is contested, cite outlets from different
camps; agreement across camps is stronger than repetition within one.

## Recommended scholarship

Verified bibliographic records (7 November 2026); a listing is not a claim that a work settles any particular fact.
Cite the page that states the fact.

- Ofer Kenig and Gideon Rahat, *המפלגות בישראל 1992–2021* (Political Parties in Israel, 1992–2021). IDI, 2023,
  ISBN 978-965-519-408-1. Party histories, including some recommendations to the President.
- Asher Arian (ed.), then Asher Arian and Michal Shamir (eds.), *The Elections in Israel* series: 1969, 1973, 1977,
  1981 (Arian), 1984, 1988 (Westview, 1990), 1992 (SUNY, c1995), 1996, 1999, 2003, 2006, 2009 (Arian and Shamir);
  2013 (Shamir); 2015 and 2019–2021 (Shamir and Rahat). Catalogue: the Israel National Election Studies series page.
- Dan Caspi, Abraham Diskin and Emanuel Gutmann (eds.), *The Roots of Begin's Success: The 1981 Israeli Elections*.
  Croom Helm / St. Martin's, 1984.
- Abraham Diskin, *Elections and Voters in Israel*. Praeger, 1991; *The Last Days in Israel: Understanding the New
  Israeli Democracy*. Frank Cass, 2003.
- Itzhak Galnoor and Dana Blander, *The Handbook of Israel's Political System*. Cambridge University Press, 2018,
  DOI 10.1017/9781316160978 (Hebrew original, Am Oved, 2013).
- Dan Horowitz and Moshe Lissak, *Trouble in Utopia: The Overburdened Polity of Israel*. SUNY Press, 1989.
- Reuven Y. Hazan and Gideon Rahat, *Democracy within Parties*. Oxford University Press, 2010.
- Don Peretz and Gideon Doron, *The Government and Politics of Israel*, 3rd edition, 1997.
- Yonathan Shapiro, *The Road to Power: Herut Party in Israel*. SUNY Press, 1991.
- Ehud Sprinzak, *The Ascendance of Israel's Radical Right*. Oxford University Press, 1991.
- Avraham Brichta, *Political Reform in Israel*. Sussex Academic Press, 2001.
- The Knesset Research and Information Center (מרכז המחקר והמידע) for institutional background papers.

Checked and not listed as a book: Ofer Kenig's "Democratizing Party Leadership Selection in Israel" is a 2009
*Israel Studies Forum* article.

## Applying the policy

- Cite each claim with a quote and locator; the certainty follows from the cites.
- Do not raise a certainty by hand: add the evidence that meets the threshold.
- To lower one, set `certainty` and add a note naming the deciding record.
- `npm run data:build` validates; `npm run data:gaps` regenerates the register with importance and certainty.
