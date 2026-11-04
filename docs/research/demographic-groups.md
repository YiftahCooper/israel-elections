# People groups: evidence review and model

As of 4 November 2026. **Verdict for this retained evidence set: defer the nationwide
people-group simulator. No complete group × election passes the owner's three-measure gate.**
This is a bounded review, not proof that usable sources do not exist. The code and explicit
missing-data records can support later reviewed evidence without fabricating today's gaps.
No UI is changed. The existing geographic tool remains a separate, working feature.

## Verdict per group

| Group | Nationwide people simulator | Deciding evidence / speculative alternatives |
|---|---|---|
| Arab citizens | Not viable with retained three-measure baseline | Official non-Jewish-locality coverage is broad but includes Druze/Circassians and excludes mixed cities and envelopes. Published Arab-vote methods use differing locality universes. Existing locality turnout tool remains usable as an explicitly ecological experiment. |
| Haredim | Not viable; 2021/2022 split evidence speculative only | Large IDI pooled self-report studies have samples and methods but no subgroup error margins. Seven authorities omit Jerusalem, Beit Shemesh and dispersed Haredim; their electorate is not a nationwide denominator. |
| Religious Zionists | Not viable; 2021/2022 split evidence speculative only | IDI self-identification, including Torani/Hardal, measures preferences; compatible electorate and turnout absent. List identity cannot classify voters. |
| Traditional Jews | Not viable; 2021/2022 split evidence speculative only | IDI combines religious/nonreligious traditional categories. Adult Social Survey proportions are not eligible-electorate shares. |
| Secular Jews | Not viable; 2021/2022 split evidence speculative only | Large pooled study, but some parties lumped and no compatible electorate/turnout. |
| Druze | Not viable as nationwide people group | ≥95% locality cohort is a dated geographic subset, omits mixed-religion towns and includes Golan residents who need not have citizenship. |
| Bedouin | Not viable as nationwide people group | Existing tribe codes omit recognized Bedouin towns; tribe/locality counts cannot represent the whole population. |
| FSU immigrants | Not viable | IDI published sample/margin, but population includes descendants and post-election arrivals; vote table denominator includes nonvoters/refusals. Requires compatible eligibility and weighted reanalysis. |
| Ethiopian Israelis | Not viable | No compatible reviewed three-measure election baseline established in this pass. |
| Young voters (18–24) | Not viable | No compatible reviewed three-measure election baseline; CBS age-20-plus surveys cannot silently replace 18–24 eligible citizens. |

“Not viable” means **unavailable in this implementation**, including speculative mode. It is
not a claim that the population cannot be studied. A speculative setting can unlock an
`estimate`, never an `insufficient` measure. Existing geographic experiments must keep their
place-based definitions; they are not promoted into national population estimates.

## Sources and claim accounting

Hebrew searches first; official and academic/research publishers before media. All retained
files are under `data/raw/demographics/`, with URL, retrieval date, bytes and SHA-256 in
`data/raw/SOURCES.json`. Reviewed JSON is project-derived evidence (`url:null`), not a download;
its `derivedFrom` entries identify actual retained sources. Builders verify those hashes.
Original downloads used a generic User-Agent, requests spaced by at least 1.1 seconds per
host, no proxies, challenge bypass, registration or institutional contact. Failed downloads
were not registered as retained sources. No Wikipedia evidence was used.

- **IDI 2021 (`idi-religiosity-2021`)**:
  [Ariel Finkelstein, 23 October 2022](https://www.idi.org.il/articles/46138).
  Introduction and religious-group sections inspected. Pooled 21 surveys, April 2021–June
  2022; 13,070 Jewish respondents, 11,577 classified voters. Group samples: Haredi 1,272;
  religious-national plus Torani/Hardal 1,351; traditional combined 3,870; secular 5,084.
  These are respondent counts, **not electorate shares**. Repeated retrospective observations,
  nonresponse and self-reported voting prevent treating the sample as official turnout.
  Transcribed only exact list percentages from prose; combined religious parties and remaining
  parties stay `otherPct`. No invented subdivision, margin or turnout estimate.
- **IDI 2022 (`idi-religiosity-2022`)**:
  [Finkelstein, June 2026 PDF](https://www.idi.org.il/media/31202/voting-patterns-of-jews-in-the-2022-elections-by-religious-definition.pdf).
  Methodology and figures 1, 2, 5, 8 inspected. Twenty surveys November 2022–October 2023;
  12,322 Jewish adults, 10,694 classified voters. Main groups each exceed 1,000 respondents;
  exact group counts/error margins not published. The smaller Hardal subgroup (254) is not
  separately delivered. The recorded sample scope distinguishes pooled n from subgroup n.
  Split is `estimate`, not `solid`; large pooled n alone is not a small-error guarantee.
- **IDI FSU (`idi-fsu-2024`)**:
  [Inna Orly Sapozhnikov, September 2024](https://www.idi.org.il/media/25312/survey-of-immigrants-from-the-former-soviet-union-full-research-report.pdf).
  Pages 1, 3, 11–12 inspected. First wave Aug–Oct 2023, 796 immigrants plus 184 second
  generation (18–34), overall stated margin ±3.1 points at 95%. Later arrivals recruited
  through Facebook, which authors explicitly say is not a representative sample. Table p.12
  is among all respondents, including nonvoters and refusals, and includes 2023 immigrants.
  These are not directly valid-ballot shares of the 2022 electorate. Recorded as insufficient
  with provenance, no numeric split/size/turnout value. The approximate million adult residents
  on p.3 is not substituted for an election-day eligible-citizen count.
- **IDI book (`idi-elections-2022-book`)**:
  [The Elections in Israel 2022, Rahat/Gidron/Shamir, February 2025](https://www.idi.org.il/media/27873/the-elections-in-israel-2022.pdf).
  Retained in full; only the geographic turnout discussion/table inspected. It reports 53.5%
  for its Arab-locality universe, while published Arab-vote analyses commonly report 53.2%.
  Our retained CBS-code cohort also differs. These are not averaged: universes and handling
  of mixed towns/envelopes must be reconciled before promotion. Book retention is not a claim
  to have reviewed every chapter or extracted every available table.
- **IDI 2026 (`idi-arab-2026`)**:
  [Arab turnout rise, article 66809](https://www.idi.org.il/articles/66809).
  Inspectable locality-based estimate excludes mixed cities at this stage. This cannot by
  itself establish a complete nationwide Arab eligible-electorate denominator or list split.
- **Moshe Dayan Center/Konrad Adenauer (`dayan-arab-2023`)**:
  [Bayan vol.13 issue 1, 13 March 2023, Inbal Tal](https://dayan.org/he/file-download/download/public/17903).
  Opening discussion inspected: Ra'am's national list total is not the number of Arab Ra'am
  voters. This source is contextual, not an independent three-measure group baseline.
- **INES (`ines-catalogue`)**:
  [Tel Aviv University public catalogue](https://socsci4.tau.ac.il/mu2/ines/data/our-data/).
  Catalogue, survey designs and download links inspected. Public SPSS/STATA links exist for
  2022, 2021, 2020, both 2019 elections, 2015, 2013 and earlier. **Registration/contact is not
  a demonstrated blocker.** No respondent dataset was requested or downloaded in this pass.
  Proper weighted eligible-voter, turnout and valid-voter crosstabs plus effective subgroup
  sample sizes remain unimplemented research, not an institutional-access gap. The pooled
  IDI studies above supply published tables without fresh microdata analysis.
- **CBS**: existing retained annual classification tables, locality definitions and Druze
  table are described in [locality research](locality-demographics.md). The Social Survey
  samples residents aged 20+, not all eligible voters aged 18+; its religiosity/population
  shares cannot be transferred without a justified citizenship/age/abroad adjustment.
  [2026 resident-electorate release](https://www.cbs.gov.il/he/mediarelease/DocLib/2026/332/24_26_332b.pdf)
  was inspected through web extraction but direct download failed (connection reset). Its
  resident-only scope differs from the national register. No numbers were promoted or hash
  claimed for unavailable original bytes.
- **Exit polls**: targeted Hebrew searches found national list projections, not a retained
  published group table with compatible size, turnout, split and subgroup sample/margin.
  No TV breakdown was promoted. Media claims and vote-defined “strongholds” are not substitutes.
  The [Hebrew INSS Arab-vote analysis](https://www.inss.org.il/he/publication/elections-2022-arab-society/)
  was inspected as a corroborating lead; its direct download looped redirects. No retained
  hash or data dependency is claimed.

Evidence families: IDI pooled Viterbi surveys, IDI FSU study, CEC/CBS geographic records,
INES survey programme. The IDI web summaries and PDFs are not independent corroboration.
The book/INSS/2026 locality analyses share CEC observations and differing classifications;
agreement between them is not independent confirmation of individual voter identities.

## Election coverage and grades

Reviewed files `groups-k16.reviewed.json` through `groups-k26.reviewed.json` contain ten
people-group records each: **110 graded records**, not 110 usable baselines. Each has bilingual
names/definitions and a dimension. All dimensions are explicitly partial relative to the
national electorate; religious categories exclude non-Jews, Bedouin overlaps nationality and
origin overlaps religiosity. Cross-dimension simultaneous editing is forbidden.

| Elections | Size | Turnout | Split |
|---|---|---|---|
| 2026 k26 | insufficient | insufficient | insufficient |
| 2022 k25 | insufficient | insufficient | estimate for four Jewish religious groups; insufficient for six others |
| 2021 k24 | insufficient | insufficient | estimate for four Jewish religious groups; insufficient for six others |
| 2020 k23, 2019b k22, 2019a k21, 2015 k20, 2013 k19, 2009 k18, 2006 k17, 2003 k16 | insufficient | insufficient | insufficient |

Earlier elections have no reviewed people-group sibling in this pass. “Insufficient” always
omits `value`, with a reason; it never means zero. No age interpolation, smoothing, inferred
turnout from party totals or conversion of population to electorate is performed. Supporting
`ecologicalReference` points to the existing place groups; k17 has no such reference because
its codes/electorates are missing. Source disagreements and incompatible denominators above
are preserved as gaps rather than averaged into plausible-looking completeness.

## Model integration

```ts
import { demographicGroups, groupAvailability } from '../../src/model/demographicGroups.ts';
const availability = groupAvailability(group); // grade, mode, reasons
const result = demographicGroups(scenario, groupDataset, [
  { groupId: 'haredi', turnoutChangePoints: 5 },
  // or { groupId: 'haredi', turnoutPct: 80, split: { '25-ג': 60, '25-שס': 40 } }
], { speculative: true }); // explicit opt-in for estimate; never unlocks insufficient
applyAction(scenario, result.action);
```

Example percentages above are API illustrations, **not a national demographic estimate**.
Every edit requires size, baseline turnout and attributable baseline split. Percentages are
0–100, valid-vote split shares use historical list IDs, and exact sum must be 100 for simulation.
The integrity gate allows ±0.1 percentage-point published rounding for retained data, but the
calculator refuses to renormalize a rounded incomplete split. `otherPct` preserves lumps;
any positive unattributed remainder blocks simulation even if the caller supplies a new split,
because the historical ballots to remove remain unknown.

`GroupMeasure<T>` carries grade/reason plus source ID, method, locator and published
sample/margin/range when available. The optional invalid-rate measure is graded too. Without
one, historical **national invalid/cast** is used, independent of current scenario edits.
Source provenance is retained in data; action labels log edits, grades/reasons and clamping.

All decisive arithmetic uses BigInt rational decimal interpretation. Eligible-share counts
and target cast ballots round half-up. For each baseline and target, invalid ballots round
half-up; valid ballots use Hamilton largest remainders in scenario list order. The signed
result is **target ballots × target split − baseline ballots × baseline split**, including
split-only changes and invalid turnout scaling. Rounding baseline and target independently
avoids mixing an observed baseline integer with an unrelated rounded rate.

Origins merge by summing and split using current scenario votes; all-zero sharers divide
equally. Missing destinations, withdrawn lists, duplicate edits, unsafe counts, malformed
shares, out-of-range turnout and impossible national turnout reject. Same-dimension reviewed
membership must be disjoint; all cross-dimension edits reject because intersections are unknown.
No group edit mutates inputs. Every returned list/invalid count is nonnegative: requested
removals exceeding availability clamp to zero, with `clamped` reporting requested/applied
signed deltas. Clamping is not redistributed, so conservation relative to the requested edit
can change; callers must show the report. National turnout limits still reject after clamping.

The returned `action` is the existing signed demographic `addVoters` action:
`{type:'addVoters', demographic:true, allocations:[{listId,votes}], invalid,label}`.
No action-union migration is necessary; existing logging, undo and JSON sharing remain valid
without fetching sources on replay. `deltas`, `invalidDelta`, final `votes`, `invalid`,
`votesCast`, `clamped` and `evidence` are returned together. Repeated application accumulates;
preview from a captured baseline, undo or replace the previous preview. The old
`demographicTurnout` place API is unchanged.

Worked 2022 example: the seven-authority Haredi geographic cohort has 214,269 registered
voters. +5 points adds 10,713 ballots after rounding, apportioned by its own observed UTJ,
Shas, other-list and invalid mix. This is tested through the place API and is explicitly not a
national Haredi example. The national Haredi record refuses the same edit because nationwide
size/turnout and the residual list destinations are unavailable.

## Possible extension: ballot-box data in mixed cities

**Deferred by the owner on 4 November 2026; no ballot assignments or mapping implementation
were created.** The k25 retained `ballots.datagov.json` has locality/kalpi identifiers and votes,
but no address or statistical area fields. An additional election-specific official polling-place
address/catchment file, a geographic crosswalk and an external demographic classification are
needed. Classification must use addresses/statistical areas and independently sourced population
characteristics only, never party votes or “Haredi/Arab party share” thresholds. Polling venue
location alone may differ from voters' residence, especially accessible/special boxes.

Expected gains: Arab localities already capture most geographically concentrated Arab voters;
adding Jaffa, Lod, Ramla, Haifa, Akko and eligible Arab citizens in Jerusalem closes a smaller
mixed-city gap. Haredi neighbourhoods of Jerusalem (e.g. Mea Shearim, Ramot, Har Nof) and Beit
Shemesh add potentially substantial coverage beyond the seven authorities, but Haredi cities
already measure a useful geographic voting mix. Religious-Zionist neighbourhoods are often too
mixed to identify a reliable group. Druze/Bedouin gaps need population-specific work; FSU,
traditional, secular, Ethiopian and young groups cannot be made homogeneous by a generic
neighbourhood rule.

Cost: thousands of election-specific box assignments, address normalization, boundary/version
matching, eligibility checks, independent homogeneity evidence and validation against venue vs
residence bias, repeated across elections. Remaining biases include Haredim outside Haredi
neighbourhoods, minority residents within assigned neighbourhoods, absent envelope voters and
noncitizen residents. Quantitative added eligible voters and homogeneity cannot be reported
before a validated join; none are guessed here. A future partial join must be opt-in speculative,
report added electorate separately from national coverage, retain every non-electoral assignment
source and expose a plain-language caveat. The owner judged this cost larger than expected
benefit in this pass. It therefore does not improve any current per-group verdict.

## Verification outcome

Final offline `npx tsx scripts/build-datasets.ts` invocation used a project-scratch cached tsx
runner (`npx --cache .backup-scratch/npm-cache --offline --yes tsx ...`). The repeat reported
0 written / 49 unchanged; SHA-256 comparison of all 50 public JSON files (including the
hand-maintained index) was identical. TypeScript `npx tsc -p tsconfig.json --noEmit` passed;
`npm test` passed 55 files / 468 tests. New retained byte lengths and hashes were independently
checked. `tests/differential.test.ts` digests and historical build timestamps were untouched.
