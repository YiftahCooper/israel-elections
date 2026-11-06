# k9 reconciliation — 17 May 1977

Fixer: Codex, 6 November 2026. Reports: k09-opus.md (O), k09-codex.md (C).
Both audit branches merged after `origin/main` was confirmed already included.
The hierarchy on origin/main governs; all IDs remain opaque stable keys by the
coordinator's explicit decision.

**18 groups fixed/documented; 2 auditor readings rejected; 0 owner questions.**
These are deduplicated issue groups, not independently certified scalar facts.
Remaining verification limitations are disclosed below; none is a source dispute
requiring the owner to invent a historical fact.

## Independently rechecked deciding evidence

- **G (rank 1)**: retained YP 2326, pp.1494–1495, rendered with pdfjs 6.5.438
  and @napi-rs/canvas. [Official results](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset9-results.pdf).
  Read all affected rows directly: “הפ”, “זך”, “ימ”, “כך”, “ספ”, “פ”, “פז”;
  1,085 / 9,505 / 24,185 / 4,396 / 5,695 / 1,798 / 2,498 votes respectively.
  Name fragments: “דו־קיום בצדק”, “ציונית חברתית”, “ברית יוצאי תימן”,
  “רשימת עובדי ייצור וועדי עובדים”, “יוצאי עודד”. Alignment rank 16:
  “אשל תמר (עדה)”. G settles both auditor letter disagreements: זך, not זר;
  כך, not כד. Candidate submission spelling דו קיום בצדק is retained as the
  long name; G's hyphenated spelling is a variant, not a competing identity.
- **C (rank 1)**: retained YP 2319; [official candidates](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset9-cand.pdf).
  The scans contain losing-list rosters (e.g. p.1326, heading “כה”, 24 ranks,
  independently rendered). They are not absent archival records. Complete reliable
  transcription of every losing roster was not achieved here; no names were guessed.
  CandidatesUnavailable remains an application coverage flag, with an explicit
  Hebrew note saying the roster exists but has not been transcribed.
- **P (rank 1)**: independently downloaded and visually read
  [1 November 1977 plenum](https://fs.knesset.gov.il/9/Plenum/9_ptm_253927.pdf),
  PDF p.26 / printed p.237. Retained as `data/raw/k9/cap-appeal-protocol.pdf`;
  SHA-256 `1cf2999f7a715175d5d722a910a8fefd637361ac2de00d844d93a84d45bb110c`.
  “בדרך זו חולקו 114 מאנדאטים”; six surplus seats then under “סעיף 81(ד)”.
  The House Committee accepted the CEC's initial one-seat cap and rejected Gross's
  appeal; the Knesset adopted that determination. This resolves the historical
  procedure, without certifying every counterfactual use or the entire amendment chain.
- **F (rank 1)**: independently downloaded/read
  [20 June formation sitting](https://fs.knesset.gov.il/9/Plenum/9_ptm_254065.pdf).
  Begin's statement identifies 63 supporters; printed p.69 announces 63–53 and
  contains the Flatto-Sharon exchange immediately before the vote. With the
  project's explicit “joined or supported at formation” definition, whole lists
  give 62 and Dayan individually gives the 63rd. This beats retrospective Hebrew
  Wikipedia's opposition classification (rank 5). Do not move the whole Alignment
  list into the supporter bloc. No claim of a formal coalition agreement with
  Flatto-Sharon is made.
- **D (rank 1)**: independently fetched
  [government-18 accession query](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PersonToPosition?$filter=GovernmentNum%20eq%2018%20and%20StartDate%20eq%20datetime'1977-10-24T00:00:00'&$format=json).
  Four ministry rows: PersonIDs 2676, 3260, 2527, 2527; all
  `StartDate: 1977-10-24T00:00:00` (Justice, Welfare, Communications, Transport).
  Overrides Hebrew Wikipedia's 25 October (rank 5), retained as a disagreement note.
- **V (rank 1)**: independently downloaded/read
  [27 September 1978 sitting](https://fs.knesset.gov.il/9/Plenum/9_ptm_253754.pdf),
  PDF p.120 / printed p.4194. “בעד — 84; נגד — 19; נמנעו — 17”. Sitting ended
  03:32; month precision and overnight explanation retained. The contemporary
  roll call beats the retrospective official lexicon's 13 against (rank 1,
  farther from the act); the museum's 19 agrees.
- **OData (rank 1)**: retained `knesset-odata-members.json` and the opening-session
  record in `search.reviewed.json`: 120 opening MKs start 13 June 1977;
  `PlenumStart: 1977-06-13T00:00:00`. Person 2394 is כהן יגאל; 2399 is
  כהן-אורגד יגאל. Website IDs 446/451 and English names are in the retained
  biography mapping/name files. These confirm two people, not their registered
  rank by themselves: both gazette entries say כהן יגאל. Existing rank-21/rank-24
  assignment remains explicitly medium confidence; new links show `probable`.

## Every non-OK finding: disposition

| Group | Auditor findings | Decision, evidence and changed inputs |
|---|---|---|
| 1 | O1; C L-הפ/N-13 | Correct הם→הפ and Democrats→Coexistence. G; national transcription, k9 metadata, registry and link title. |
| 2 | O2; C N-14 | Restore ציונית in Ben-Porat's full name and English display transliteration. G; same inputs. |
| 3 | O3; C N-15/L-זר | Correct חך→זך and נאמני→יוצאי. G. C's proposed זר rejected by direct scan; all IDs preserved. |
| 4 | O4; C L-ספ | Correct סם→ספ including the raw Ratz agreement. G/C; national, k9 metadata. Stable agreement member remains 9-סם, displaying ספ. |
| 5 | O5; C L-פ/N-20 | Zionist Panthers פז→פ and full workers/committees name. G; national, k9, registry, link title. |
| 6 | O6; C L-פז/N-21 | Hofesh פח→פז, עדות→עודד. G; same inputs. Simultaneous mapping avoids collision. |
| 7 | O7; C L-ימ | ים→ימ in raw rosters, raw agreement, metadata colours/blocs and aftermath; stable ID 9-ים and all candidate keys unchanged. G. |
| 8 | O8; C elected-name OK disagreement | אשל תמר (שדה)→אשל תמר (עדה), both registered/elected arrays and constituent member. G p.1495 decides. |
| 9 | O9 | Clarify all nine omitted losing rosters are **not transcribed**, retain coverage flags per coordinator instruction. C, explicit k9 builder notes; transcription remains a gap. |
| 10 | O10; C BIOLINKS missing two | Add distinct 2394/2399 biographies and official English names; preserve duplicate Hebrew registration and label uncertain rank mapping medium/probable. OData + retained site mapping. |
| folded | O11 | Propagations folded into groups 1–7. Reject requested ID renaming under coordinator's standing compatibility decision. No source value is lost. |
| 11 | O12; C OK-COALITION disagreement | Include Flatto-Sharon in support-inclusive first-government view: 62 whole-list seats, Dayan individually supplies #63. F outranks rank-5 classification. Update metadata and aftermath consistently. |
| 12 | O13; C GAP-DMC | Exact accession 1977-10-24; official evidence replaces stale uncertainty. D; aftermath. |
| 13 | O14; C GAP-OPEN | Confirm first sitting 1977-06-13; replace secondary-only citation/gap and raise confidence. Retained opening OData; aftermath. |
| 14 | O15 | Label NRP, Aguda and PAI 1977 registry observations as **ballot-list display names**, not registered party names. G/C; parties.json. |
| 15 | O16 | Normalize k9 English whitespace only: Shmuel Tamir. k9-scoped bios attachment; shared source and all other datasets unchanged. |
| 16 | C CAP | Resolve historical cap authority with P. National/search transcriptions, manifest, hand-maintained election index, context, glossary and walkthrough. Experimental warning now distinguishes documented historical cap from counterfactual inference; warning code and allocation logic unchanged. |
| 17 | C HASH | Refresh only k9 registry/lineage/family hashes, cached names and status after rebuild. No other election's hashes mass-refreshed. |
| 18 | C GAP-CAMP | Replace stale secondary-only vote gap with V and preserve overnight explanation. Aftermath. |
| rejected | C L-כד | Keep כך. G clearly prints final kaf, also in תנועת כך. No correction to כד. |

### Retained limitations (rechecked, not owner disputes)

- O17 / C REC-UNKNOWN-9..12: the four statuses remain `unknown`, never inferred
  as abstention or support. The evidence inventory still lacks presidential file
  נ-571/13. Existing archival-press gaps are accurately labelled; no new position
  was established here.
- C CONSTITUENT-RANKS: rechecked current regenerated joint-facts against k9 inputs.
  Likud 19/15/8/1, Alignment 28/4, Sheli 1/1/0/0; Hadash 3/1 with one unknown.
  No residual faction-name-matching bug established. Retain the declared provisional
  person-level evidence; shared `scripts/joint-facts.ts` untouched.
- C BIOLINKS: official PersonIDs differ from website destination verification.
  Existing `pattern` markers retained, including the new two bios. No claim that
  every destination or every constituent rank is now independently certified.
- C LOGO-0..3: re-inspected the four overlays and retained provenance; each has
  medium confidence, explicitly attributes 1977 evidence to Commons/NLI/AP/Nostal,
  and distinguishes modern reproduction from historic use. No demonstrated wrong
  year or artwork correction. Original campaign originals/video not independently
  re-audited; no image re-research performed.
- C LINKS: wrong titles fixed above; wider party/manifesto destination coverage
  remains incomplete. Partisan material is evidence only of its own name/logo/claims.
- C COLOUR: all 19 colour entries explicitly describe app/Wikipedia conventions,
  not official 1977 campaign specifications. No contrary colour value established;
  exact historical CSS is still an audit limitation.
- C MANDATE-DAYS: retain 21, explicitly supported by the existing contemporary JTA
  citation, not by Begin's date-only statement. The original 1968 law's duration
  clause was not independently inspected here; no competing duration established.
- O9: losing-list complete transcription remains a source gap. The sampled scan is
  readable, but a complete reliable 196-name transcription was not achieved and is
  not claimed. Coverage flags do not mean the gazette is missing.

## Owner questions

None. Letter and date disagreements have deciding primary records; remaining
coverage limitations do not supply competing equally supported historical values.

## Build, field comparison and compatibility

Node 24.18.0, repository lockfile; pdfjs 6.5.438 for retained PDF rendering.
Scratch tools, renders, logs and dependency links are in `.backup-scratch/k09-fix/`.
The retained sources, links, page numbers and lockfile reproduce the result.

`BUILD_JOBS=1 node scripts/build-datasets.ts` rebuilt k9 and the source catalogue;
36 outputs unchanged. Recursive comparison with the merged audit baseline: **51
changed scalar/structure paths**, confined to intended names/letters, two bios,
English whitespace, omitted-roster notes, supporter membership, status and source
provenance. Every list/candidate ID, rank, vote, total, official seat and agreement
member ID is unchanged. All other election datasets are byte-identical.

UI code inspection: Slip uses supplied `.letters` (`ui.tsx`), detail fields bind
`l.letters` (`ListDetail.tsx`), scenario creation copies the field independently of
ID (`scenario.ts`). No ID suffix is used as a displayed ballot. Regression checks
cover the stable-key/letter map, collision case, saved-scenario validation,
agreement IDs and supporter grouping. Shared builder changes only opt into
`stableListIds` supplied by k9's reviewed input. No Playwright run.

Final verification: TypeScript passed; family validation passed (9 presets across
k1–k26); logo validation passed (26 overlays, 184 source records, 131 assets);
Vitest **95 files / 905 tests passed** with `--maxWorkers=2`. The gallery subprocess
needed execution outside the filesystem sandbox; it passed in the full run.

Differential allocation/analysis digests change only with the warning-message
correction; model also carries the reviewed data changes. Warning code, branch
conditions, numeric engine logic, validation and rule semantics are unchanged.

## On-screen changes for browser-test integration

Full-name changes also apply to matching Gazette-link titles (suffix unchanged):

| Old | New |
|---|---|
| הם; חך; ים; סם; פז (Panthers); פח (Hofesh) | הפ; זך; ימ; ספ; פ; פז |
| דמוקרטים בצדק | דו קיום בצדק |
| התנועה להתחדשות חברתית בראשותו של מרדכי בן־פורת | התנועה להתחדשות ציונית חברתית בראשותו של מרדכי בן־פורת |
| בית ישראל, ברית נאמני תימן ועדות ישראל | בית ישראל, ברית יוצאי תימן ועדות ישראל |
| הפנתרים הציוניים, רשימת ציבור ודורשי עבודה | הפנתרים הציוניים, רשימת עובדי ייצור וועדי עובדים |
| Hofesh name fragment יוצאי עדות | יוצאי עודד |
| Demokratim BeTzedek | Du Kiyum BeTzedek |
| HaTnua LeHithadshut Hevratit | HaTnua LeHithadshut Tzionit Hevratit |
| אשל תמר (שדה) | אשל תמר (עדה) |
| Empty English names at Likud #21 / #24 | Yigal Cohen / Yigal Cohen-Orgad (probable biography links) |
| Shmuel␠␠Tamir (Katznelson) | Shmuel Tamir (Katznelson) |
| Flatto-Sharon: Opposition; first-government whole-list total 61/59 | Coalition/support; 62/58 |
| Glossary provenance inferred; statutory-text-not-located caveat | sourced; 1 Nov 1977 parliamentary determination |
| k9 status / context / cap walkthrough: historical procedure inferred / authority unresolved (Hebrew and English) | documented initial cap, 114 initial + six surplus seats under §81(d) |
| Counterfactual warning: legal rule not found (Hebrew and English) | historical cap documented; applying to changed scenario remains app inference |
| Omitted-roster notes: empty | רשימת המועמדים פורסמה בילקוט הפרסומים 2319, אך טרם תומללה באפליקציה. |
| Status asOf 2026-11-03 | 2026-11-06 |

Scheme names, status stage (`official-final`), unavailable flags, rules, totals and
seat allocation remain unchanged. Aftermath is still an unwired pilot; its date,
confidence and citation changes do not currently change on-screen labels.
