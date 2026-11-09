# Source policy: how we decide what is a fact, and how sure we are

*Policy in force since 7 November 2026; rewritten in plain language on 8 November 2026. Nothing was removed: every
fact, date, number and source of the earlier version is kept.*

## In short

- **What this is.** The rulebook the app uses for every historical claim it shows. Examples: which party recommended
  whom to the President after an election, which parties were in a government or supported it from outside, when a
  government was formed or fell, which "family" a party belongs to, and whether a candidate in our data is the same
  person as a Knesset member.
- **Why it exists.** The app needs one source-reliability rule: official records first, then reliable historians
  and journalists, with a way to rank them when the official record is missing. This document is that policy.
- **The ladder of sources.** Five levels, from strongest to weakest: the official record made at the time; news
  reports from the time; academic and institutional history; later journalism; and "pointers" that only help us find
  evidence (Hebrew Wikipedia is one; English Wikipedia is never used at all).
- **How sure we are.** Every fact gets one of five labels: confirmed, probable, provisional, disputed or unknown. The
  label follows from how many independent sources support it, and of which kind.
- **It is enforced automatically.** Every time the data is rebuilt, the build checks each fact's label against its
  sources and refuses data that claims more certainty than the sources allow. A public list of open gaps is produced
  from the same rules.
- **When the official record is out of reach.** Respected scholarship can settle a fact (as "probable", or
  "confirmed" with a news report from the time), but the missing official record is still named so it can be checked
  later.
- **Neutral means not partisan within Israeli politics.** Israeli and Hebrew sources are welcome and are the main
  body of evidence. Opinion columns and advocacy groups from any camp are not evidence.

## What the policy covers

It applies to every historical claim the data carries:

- the recommendations parties made to the President after an election (the President consults every party and then
  asks one Knesset member to form a government);
- which parties were members of a government, and which supported it from outside;
- events in the life of a government and a Knesset term: formation, resignation, early elections;
- where a party is placed in a party family;
- links between a candidate on a list and a person in the Knesset's own records.

Guidance on languages, editorial stance and polite access to archives is in a separate page,
[source-hierarchy.md](research/source-hierarchy.md). The rules below are not just advice: they are written into the
app's code (see the technical notes at the end) and reported in the [gaps register](data-gaps.md), the public list of
facts that are still unconfirmed.

## The five kinds of source (tiers)

We sort every source into one of five "tiers". Tier 1 is the strongest.

| Tier | What counts | Examples |
| --- | --- | --- |
| 1. Primary record | The record made at the time by the body that actually performed the act. | Knesset plenum protocols (the minutes of the full Knesset's sittings) and the Knesset's open database (called OData); Reshumot, the official government publications (the Official Gazette and Yalkut HaPirsumim, the notices gazette); publications of the Central Elections Committee (CEC); notices from the President's Residence; documents in the Israel State Archives; signed coalition agreements; a government's presentation to the Knesset. |
| 2. Contemporary report | A dated news report of the event, written at the time by an established outlet, Israeli or international. | Davar, Maariv, Haaretz, Al HaMishmar, HaTzofe, Herut; the Jewish Telegraphic Agency (JTA), the New York Times, the Washington Post, the LA Times, and the news agencies Reuters, AP and UPI; Ynet, Times of Israel, Globes, Kan, N12. |
| 3. Scholarship | Peer-reviewed or institutional work by recognised historians and political scientists, and accounts written by institutions about their own history. | Books and party profiles from the Israel Democracy Institute (IDI); the *Elections in Israel* book series; papers from the Knesset Research and Information Center; the Knesset's and the Foreign Ministry's own narrative histories; IPU Parline (the Inter-Parliamentary Union's database of parliaments). |
| 4. Retrospective | Journalism written well after the event. | Anniversary pieces, timelines, explainers, "fast facts" boxes. |
| 5. Pointer | Something that helps us find evidence but is never evidence itself. | Hebrew Wikipedia, always labelled as such. English Wikipedia is never used at all, not even as a pointer. |

### How a source's tier is decided

Most sources are sorted by simple rules, so nobody has to tag each one by hand. A source can also be marked with a
different tier on purpose, which overrides the rules. Hebrew Wikipedia is always a pointer, whatever else is said.

- **Official websites.** Official records published on Israeli government websites (addresses ending in `.gov.il`),
  IDF websites or UN websites count as primary records. But narrative pages on those same websites count as
  scholarship, not as primary records. Examples: Knesset history pages, its lexicon and its member biographies; the
  Foreign Ministry's *Facts about Israel*; State Archives chapters (articles written by archivists); and Knesset
  Research Center papers.
- **Official documents hosted elsewhere.** Foreign governments' documents, reports by the US Congressional Research
  Service (CRS) and copies on mirror sites count as scholarship. There are two exceptions. The first is when our
  list of retained sources marks the file as a copy of an official publication. The second is when the source is
  explicitly marked as a primary record, with a note naming the original record it reproduces.
- **Archived web pages.** A copy saved by the Wayback Machine (the Internet Archive's web archive) is judged as if it
  were the page it saved.
- **Academic work.** Academic sources, and the named research institutions (IDI; the IPU; INES, the Israel National
  Election Studies at Tel Aviv University), count as scholarship.
- **The press.** A news report counts as a contemporary report by default. Timelines, "fast facts", reviews of the
  year and analyses by the International Crisis Group count as retrospectives. Any other piece written later must be
  marked as a retrospective by hand.

## Independent sources count once

Certainty depends on how many *independent* sources say something. A source is not independent just because it
appears in a different place. Evidence counts once per independent origin (we call a group of sources that share one
origin an "evidence family"):

- **Copies of one wire story count once.** A wire service, or news agency, sells one report to many papers. A UPI
  story printed in the LA Times and kept in UPI's own archive is one source, not two. We identify the agency from the
  publisher: Reuters, AP, UPI, JTA or AFP.
- **Several reports by the same outlet count once.**
- **A mirror, quotation or reproduction belongs to its original.** If a website reprints a newspaper article, it adds
  nothing; each such copy is recorded as part of the original's family.
- **Our own data never confirms itself.** Data we generated from a source cannot be cited as support for that same
  source.

## Certainty: thresholds

Every fact carries one of five certainty labels. The table says how many independent sources, of which kind, each
label needs. These are the "thresholds".

| Certainty | Threshold (independent sources) |
| --- | --- |
| **confirmed** | A primary record; or one contemporary report plus one scholarly work; or three contemporary reports. |
| **probable** | Scholarship without a primary record; or two reliable reports, at least one of them from the time. |
| **provisional** | One reliable source; or later retrospectives only. |
| **disputed** | Reliable sources disagree. We record this openly, citing both sides, and never quietly pick one. |
| **unknown** | No reliable source, or pointers only. Unknown never means "did not happen". |

Further rules:

- **The threshold is a ceiling, not a target.** It is the highest label the sources allow. A fact may be recorded
  lower when its sources only partly prove it. For example, a roll call (a recorded vote by name) proves how someone
  voted, but it does not prove there was no side arrangement. When a fact is recorded lower than its ceiling, it must
  carry a note explaining why.
- **Checked on every rebuild.** Labels entered by hand are checked against the ceiling every time the data is rebuilt.
  Labels the app works out itself (recommendations to the President, events) are calculated directly from the cited
  sources, so they cannot drift away from them.
- **Party families are editorial.** Placing a party in a family (such as "Radical right") is a judgement, not a fact
  of record. So it can be at most **probable** (when scholarship places the party there); otherwise it is
  **provisional**.
- **Candidate identity.** When the Knesset's own records identify the person, the link is **confirmed**. A match a
  person has reviewed is **probable**. A match made only by a name rule (shown as "probable" in the published
  biography) is **provisional**.
- **Government roles from the 7 November review.** On 7 November the roles of parties in and around each government
  (member, outside supporter and so on) were researched. Those results map directly: confirmed and provisional keep
  their meaning, and unknown stays unknown. Eleven rows that had claimed "confirmed" on the strength of a single news
  report from the time, or a single institutional web page, were lowered, each with a note:
  - ten individual roll-call votes, from 1984, 1990 and 2021, were lowered to **provisional**;
  - the National Religious Party (NRP) in 2003 was lowered to **probable**.

## When sources disagree

1. **A primary record beats every other kind of source.** If two primary records disagree, the fact is **disputed**
   until a third primary record, or the formal act itself (the signed letter, the notice published in the Gazette),
   settles it.
2. **Facts of record** (dates, counts, who was a member): scholarship that cites primary or archive material beats a
   news report from the time. Early reports often carry preliminary counts and rumours.
3. **What was said or reported at the time:** a news report from the time beats later scholarship that cites
   nothing.
4. **Retrospectives and pointers never settle a disagreement.**
5. **Otherwise the fact is disputed.** Both versions stay in the record, each with its sources, and the gaps register
   lists the dispute.

## When scholarship may settle a fact

Primary records are often closed, lost or impossible to locate. Examples: the minutes of the President's
consultations with the parties before the 2000s, or State Archives files behind access restrictions. A fact does not
have to stay unknown just because its primary record is out of reach. Recognised scholarship may settle it:

- one scholarly work that states the fact makes it **probable**;
- scholarship plus an independent news report from the time makes it **confirmed**;
- the primary record that would decide the matter is still named in the note, so a later reader can upgrade or
  overturn the fact.

There are two things scholarship may not do:

- **settle a fact by arithmetic.** For example, if a book gives only the total of parties that recommended a
  candidate, we never work out from that total which individual party recommended whom;
- **read intention from a vote.** How a party voted does not prove what it intended or agreed.

## Bias and partisanship

- **Neutral means not partisan within Israeli politics.** Israeli sources are welcome, and Hebrew sources are the
  main body of evidence.
- **A party's own words prove what it said.** A party's or politician's own statement is primary evidence of what
  they said: a recommendation they announced, their list's name, their logo. It is not evidence of contested facts
  about others.
- **Opinion is not evidence.** Opinion columns and advocacy organisations from any camp are not evidence.
- **Cross the camps.** When a political fact is contested, cite outlets from different camps. Agreement across camps
  is stronger than repetition within one.

## Recommended scholarship

These are bibliographic records checked on 7 November 2026. Being on this list does not mean a work settles any
particular fact: we always cite the page that states the fact.

- Ofer Kenig and Gideon Rahat, *המפלגות בישראל 1992–2021* (Political Parties in Israel, 1992–2021). IDI, 2023,
  ISBN 978-965-519-408-1. Party histories, including some recommendations to the President.
- Asher Arian (editor), later Asher Arian and Michal Shamir (editors), *The Elections in Israel* series. Volumes:
  1969, 1973, 1977, 1981 (Arian); 1984, 1988 (Westview, 1990), 1992 (SUNY, c1995), 1996, 1999, 2003, 2006, 2009
  (Arian and Shamir); 2013 (Shamir); 2015 and 2019–2021 (Shamir and Rahat). The catalogue is the Israel National
  Election Studies (INES) series page.
- Dan Caspi, Abraham Diskin and Emanuel Gutmann (editors), *The Roots of Begin's Success: The 1981 Israeli
  Elections*. Croom Helm / St. Martin's, 1984.
- Abraham Diskin, *Elections and Voters in Israel*. Praeger, 1991; and *The Last Days in Israel: Understanding the
  New Israeli Democracy*. Frank Cass, 2003.
- Itzhak Galnoor and Dana Blander, *The Handbook of Israel's Political System*. Cambridge University Press, 2018,
  DOI 10.1017/9781316160978 (Hebrew original, Am Oved, 2013).
- Dan Horowitz and Moshe Lissak, *Trouble in Utopia: The Overburdened Polity of Israel*. SUNY Press, 1989.
- Reuven Y. Hazan and Gideon Rahat, *Democracy within Parties*. Oxford University Press, 2010.
- Don Peretz and Gideon Doron, *The Government and Politics of Israel*, 3rd edition, 1997.
- Yonathan Shapiro, *The Road to Power: Herut Party in Israel*. SUNY Press, 1991.
- Ehud Sprinzak, *The Ascendance of Israel's Radical Right*. Oxford University Press, 1991.
- Avraham Brichta, *Political Reform in Israel*. Sussex Academic Press, 2001.
- The Knesset Research and Information Center (מרכז המחקר והמידע), for institutional background papers.

Checked and not listed as a book: Ofer Kenig's "Democratizing Party Leadership Selection in Israel" is a 2009 article
in the journal *Israel Studies Forum*.

## Applying the policy in practice

- **Cite each claim with a quote and its location** (page, paragraph). The certainty then follows from the citations.
- **Never raise a certainty by hand.** To raise it, add the evidence that meets the threshold.
- **To lower one**, set the lower label and add a note naming the record that would decide it.
- After any change, rebuild the data (which checks everything) and regenerate the gaps register (which ranks each
  open gap by importance and shows its certainty). The commands are in the technical notes below.

## Technical notes (for developers)

**Where the rules live in code.**

- `src/data/evidence.ts` derives each source's tier and each claim's certainty ceiling from its citations.
- `scripts/lib/build/evidence.ts` runs during the data build and rejects any record whose stated certainty is above
  what its cites support.
- The [gaps register](data-gaps.md) (`docs/data-gaps.md`, with a JSON summary) reports every open item with its
  importance and certainty.

**How the code assigns a tier.** An explicit `tier` on a source overrides the rule; Hebrew Wikipedia is always a
pointer.

- Official records on Israeli government (`*.gov.il`), IDF or UN hosts are primary. Narrative pages on those hosts
  (Knesset history, lexicon and biography pages, MFA *Facts about Israel*, State Archives chapters, Knesset Research
  Center papers) are scholarship.
- Official documents on other hosts (foreign governments, CRS, mirrors) are scholarship unless the retained-source
  manifest flags a copy of an official publication (`official: true`), or the source sets `tier: "primary"` with a
  `via` note naming the original record.
- A Wayback copy is judged by the page it archived.
- `academic` sources and the named research institutions (IDI, IPU, INES) are scholarship.
- Press is contemporary by default. Timelines, fast facts, year reviews and crisis-group analyses are retrospective;
  any other later account needs `tier: "retrospective"`.

**Independence.** The wire agency is read from the publisher (Reuters, AP, UPI, JTA, AFP). A mirror, quotation or
reproduction declares its original with `evidenceFamily`.

**Certainty fields.** Explicit `certainty` values are validated against the ceiling on every data build. Derived
values (recommendations, events) are computed from the cites. To lower a value, set `certainty` and add a note naming
the deciding record; never raise it by hand.

**Commands.**

- `npm run data:build` validates every record against this policy.
- `npm run data:gaps` regenerates the register with importance and certainty.
