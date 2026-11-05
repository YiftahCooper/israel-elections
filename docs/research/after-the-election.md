# After the election: prior art, sourcing plan and feasibility

Research checked **5 November 2026**. Companion design: [docs/design/after-the-election.md](../design/after-the-election.md).
Pilot data: `data/meta/aftermath/k9.json` (1977) and `data/meta/aftermath/k24.json` (2021).

Source rules are those of the project brief: no English Wikipedia; Hebrew Wikipedia only as a labelled secondary
source; every fact carries url, publisher, kind, a short verbatim quote and an access date; unknowns stay unknown;
conflicts are recorded; no challenge, paywall or login circumvention.

## 1. Prior art

Findings checked directly in this session are marked ✔. Items from the parallel prior-art helper are in §1.2.

### 1.1 Israeli official and archival sources (✔)

| Source | What it shows | Neutrality technique | Use for us |
|---|---|---|---|
| **Knesset News press releases** (e.g. [36th government approved](https://main.knesset.gov.il/EN/News/PressReleases/Pages/press14621d.aspx), [24th Knesset dissolved](https://main.knesset.gov.il/News/PressReleases/Pages/press30062022D.aspx)) | Vote counts, dates, bill text, explanatory notes; speeches quoted at length | Reports votes and quotes speakers by name; no characterisation | Primary source for confidence votes, dissolutions, budgets (2000s on) |
| **Knesset plenum records** (`fs.knesset.gov.il/<k>/Plenum/…pdf`, e.g. [20 June 1977](https://fs.knesset.gov.il/9/Plenum/9_ptm_254065.pdf)) | Full transcript: the PM-designate's letter to the Speaker (date of tasking), minister list, vote tally | Verbatim record | Primary source for every era's confidence vote and tasking date; PDFs are scans with a text layer |
| **Knesset "Knesset History" per term** (`knessethistory.aspx?kns=N`) | A short official narrative per Knesset: main events, coalition changes, notable debates | Editorial selection by the Knesset, descriptive tone | The best available *chronology* for the inclusion rule (§3d). The page loads by script and answered HTTP 247 to plain requests; its text is mirrored on the Jewish Virtual Library with "Sources: The Knesset" ([9th](https://www.jewishvirtuallibrary.org/highlights-of-the-ninth-knesset-1977-1981)) |
| **Knesset governments list** ([all governments](https://main.knesset.gov.il/en/mk/government/Pages/governments.aspx)) and OData `KNS_PersonToPosition` | Government numbers, dates, ministers by faction | Data only | Government card; already used for `first-government` schemes |
| **Israel State Archives** online chapters, e.g. [President Navon and the 10th Knesset election](https://catalog.archives.gov.il/site/chapter/navon-and-10-knesset-election/) | Narrative built on presidential files, with file numbers and page references; consultation diaries; letters of tasking | Cites file and page for each claim; quotes documents | Primary route for 1949–1990s consultations. It names the presidential formation files, e.g. **נ-571/13 "הנשיאים קציר ונבון – תיקי הרכבת ממשלות – הרכבת הממשלה ה-18"** (1977) |
| **IDI elections pages** (e.g. [1981](https://en.idi.org.il/israeli-elections-and-parties/elections/1981/)) and IDI's explainer on [the head of state's role in forming a government](https://www.idi.org.il/articles/30937) | Per-election narrative, results table, the formation outcome; comparative law of formation | Academic tone, but the narratives include evaluative sentences (e.g. "This successful attack reinstated his popularity") | Good for context and law; quote only factual clauses |
| **Inter-Parliamentary Union, Chronicle of Parliamentary Elections** ([Israel 1981](https://data.ipu.org/election-summary/PDF/ISRAEL_1981_E.PDF)) | Standard per-election summary: purpose (incl. "premature dissolution" and the date it was set), conduct, result, government formed | Fixed template across all countries; dates and outcomes, little comment | Model for the fixed structure, and an independent source for dissolution dates (series runs from the 1960s) |
| **President's Residence statements** | Tally and reasoning when the President tasks a candidate (2021 text reproduced "courtesy of the President's Residence" in [ToI](https://www.timesofisrael.com/liveblog-april-06-2021/)) | The President's own wording; per-faction lists | Primary for 2009–2022 recommendations; the gov.il originals were not retrieved in this session |

### 1.2 Wider prior art

*To be merged from the prior-art helper report (`.backup-scratch/after-election/research-prior-art.md`).*

### 1.3 What the sources have in common

- A **fixed template** per election (IPU, IDI, Knesset term pages): result, formation, government, then term.
- **Tallies come from the head of state's own statement**; party-by-party breakdowns from contemporaneous reports.
- **Selection of term events is editorial** even in official sources; the only defence is to borrow the
  selection of a named, neutral chronology and show its name.
- Neutrality is achieved by **dates, numbers and quotation**, never by balancing adjectives.

## 2. Graphics precedent

The project's own bloc graphic (seat-weighted horizontal bar) is the closest fit; Israeli media show the 2019–2022
consultation results as such bars or tallies. See §1.2 for international examples once merged.

## 3. Sourcing plan per component

### (a) Recommendations per party per election

| Era | Best source | Route | Notes |
|---|---|---|---|
| 1949–1965 | ISA presidential files; Davar/Haaretz/Palestine Post on JPress; Knesset plenum record of the government's presentation | ISA catalogue; JPress (browser challenge to scripts — use only when a human or a permitted browser session can read it); JPost OCR on Internet Archive exists for some years | Before the 1962 amendment the President was not required to consult in the same form; record what happened, not a template |
| 1969–1992 | ISA chapters/files; The Jerusalem Post (Internet Archive OCR, e.g. 1977 issues) ✔; JTA Daily Bulletin archive ✔ | `archive.org/download/TheJerusalemPost<year>IsraelEnglish/…_djvu.txt` gives per-issue text without a browser | 1977 pilot recovered 9 of 13 lists' positions this way |
| 1996, 1999, 2001 | None: PM elected directly | — | Show "no recommendations" notice; do not invent a round |
| 2003–2026 | President's Residence statements (gov.il), Knesset; Times of Israel/Ynet/Globes for per-faction lists | gov.il pages are script-heavy; news reports quote the President verbatim | Several existing `pm-recommendations` cite Hebrew Wikipedia first; upgrade to President's statement + one news report |

Record per list: recommended / none / other (e.g. "return the task to the Knesset", or a named non-candidate) /
split / unknown. Totals are only "official" when the President stated them; otherwise computed and labelled.

### (b) Reaction to the results

Neutral options, in order of safety:

1. **Institutional steps only:** official results published/certified (CEC), Knesset sworn in, consultations held.
2. **Attributed statements, all or none:** a one-line quote from each seated list's leader on election night, or
   no quotes at all. Selecting some leaders' quotes is itself a judgement.
3. **Never:** commentary, "winners and losers", market reactions, foreign-leader congratulations.

Recommendation: ship option 1; keep the field for option 2 if the owner wants it.

### (c) Government formed, or why none

Primary chain per election: President's statements (tasking, extensions, return) → plenum record (presentation,
confidence vote, tally) → Knesset News (2000s on) → Reshumot (dissolution laws). Secondary reports only for times of
day, quotes the official record does not carry, and per-faction lists. "Why none" is stated only as the formal
event (mandate expired / returned / Knesset dissolved by law of date X), not motives.

### (d) The term: significant national events

**Inclusion rule (proposed):** an event is shown if it appears in **at least two independent chronologies**
from this list, one of which is official or academic:

1. The Knesset's per-term history (official) — available for the earlier Knessets; coverage of recent terms to be
   checked.
2. Israel State Archives publications and the Foreign Ministry's historical documents (official, archival).
3. IPU Chronicle / Parline summaries (intergovernmental, per election).
4. An academic reference work or handbook chapter on the period (named in the data file).
5. A reputable news agency's own year-in-review (JTA archive for older years; Reuters/AP/Times of Israel for
   recent years), as secondary.

Each event still needs a direct source for its date and figures. Events that meet only one chronology go into
`candidatesPending` and are not shown. For 2021–22 no retrospective official chronology was retrieved, so the
pilot uses an interim "two independent contemporaneous sources, one official" rule and says so.

**Judging the Jewish Virtual Library:** it is run by the American-Israeli Cooperative Enterprise, an advocacy-adjacent
publisher; its own essays are not neutral enough to cite. Where a JVL page reproduces a named official text (as
with the Knesset term histories, credited "Sources: The Knesset"), cite the official author and record JVL as the
copy used (`via`). Hebrew Wikipedia's "הכנסת ה-N" and "N בישראל" pages are useful for leads only.

### (e) "Most pressing issue" polling

*To be merged from the issue-polling helper report (`.backup-scratch/after-election/research-issue-polling.md`).*

## 4. Feasibility by era (high confidence vs. gaps)

| Component | 1949–1973 | 1977–2006 | 2009–2026 |
|---|---|---|---|
| Recommendations per list | **Partial.** Tasking dates from plenum records are certain; per-list positions need ISA files or Hebrew press on JPress (script-blocked). | **Mostly feasible** 1977–1992 via JPost OCR on Internet Archive + JTA + ISA; 1996–2001 not applicable; 2003–2006 news + President | **Feasible with high confidence** from President's statements + news |
| Formation timeline | **High** (plenum records, Knesset governments list) | **High** | **High** (Knesset News, President) |
| Government and coalition | **High** (Knesset data) | **High** | **High** |
| Term events (rule-based) | **Feasible** where the Knesset term history exists; second chronology from ISA/IPU | **Feasible** (same) | **Medium**: recent terms lack a retrospective official chronology; interim rule needed |
| Reaction (option 1) | **High** for dates; statements sparse | **High** | **High** |
| Issue polling | See §3e | See §3e | See §3e |

## 5. Pilot results

| Item | 2021 (k24) | 1977 (k9) |
|---|---|---|
| Recommendations | Two rounds (5 Apr: 52/45/7/16; 5 May: 56 Lapid/7 Bennett/52 "to the Knesset"/5 none). President's words via news quoting the President's Residence; per-list from ToI/Globes/Ynet | One round (30 May–5 Jun). Begin 77 (Likud, DMC, NRP, Agudat Yisrael, Shlomtzion, Flatto-Sharon), Alignment no candidate (32), Hadash and Sheli other (7), four one-seat lists unknown (4). Archival JPost OCR + Knesset record |
| Formation | Consultations → Netanyahu tasked → expired → Lapid tasked → informed success → 60–59–1 (Knesset News) | Consultations → Begin tasked 7 Jun → 63–53 on 20 Jun (plenum record) |
| Government | 36th, 8 lists, 62 seats; Bennett then Lapid | 18th, Likud+Shlomtzion, NRP, Agudat (no ministers); DMC joined Oct 1977 |
| Term events | 3 included (budget, dissolution, Lebanon maritime agreement); 8 pending, incl. the April 2022 loss of majority (one source so far) | 4 included (Sadat visit, Camp David approval, peace treaty, Iraqi reactor strike); 6 pending |
| Term end | Dissolution 30 Jun 2022, 92–0 (Knesset News, LoC) | Early election set 10 Feb 1981 (IPU, ISA) |
| Issue polling | Pending | Pending |

Source quality: 2021 formation is official for votes and dates, secondary (quoting the President) for tallies.
1977 is official for tasking and the vote, archival (contemporaneous newspaper) for per-list positions, and leans
on a labelled Hebrew Wikipedia page for three minor dates.

## 6. Gaps and what was tried

- **NLI JPress** (Davar, Maariv, Haaretz): every request returned a "Checking your browser" challenge (HTTP 403).
  Not circumvented. Internet Archive's Jerusalem Post OCR was used instead for 1977.
- **Knesset term-history pages**: HTTP 247 to scripted requests and script-loaded content; text read on the credited
  JVL copy.
- **Britannica**: challenge page to scripted requests; search-index copies are truncated teasers. Not used.
- **President's Residence originals** on gov.il were not retrieved; the President's words are cited through news
  reports that reproduce them.
- **ISA presidential formation files** (e.g. נ-571/13) identified but not opened; they are the primary target for
  1949–1992 recommendations.
