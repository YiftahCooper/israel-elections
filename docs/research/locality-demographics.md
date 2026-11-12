# Locality geography for demographic turnout

Implemented 4 November 2026. These are **places, not people**. All ballots in a selected
locality contribute to its mix, regardless of the religion, ethnicity or identity of the voter.
No individual demographic identity or individual ballot choice can be inferred. Locality
turnout excludes double envelopes; soldiers, patients, diplomats and other envelope voters
cannot be assigned to their home localities from these data.

## Retained sources and proof

All retrieved bytes, URLs, retrieval timestamps, byte lengths and SHA-256 hashes are in
`data/raw/SOURCES.json`, under `data/raw/demographics/`. Retrieved 4 November 2026, using a
generic agent without contact information and at most one request per second per host.
No proxy or challenge bypass was used. No Wikipedia source was used.

- **Official observed tables:** [CBS locality catalogue](https://data.gov.il/he/datasets/lamas/localities-in-israel).
  Government datastore snapshots for 2017–2023 include all records (`limit=10000`; 1,482–1,484
  records, matching `result.total`). The 2016 datastore contains only names/codes and was
  rejected as insufficient. Historical XLS files for 2003, 2006, 2009, 2013 and 2015 were
  retrieved directly from CBS, for example [2003](https://www.cbs.gov.il/he/publications/doclib/2019/ishuvim/bycode2003.xls).
  The [2024 XLSX](https://www.cbs.gov.il/he/publications/doclib/2019/ishuvim/bycode2024.xlsx)
  is the newest full classification retrieved; the analogous 2025 URL returned HTML rather
  than a workbook. The government catalogue offers no newer file.
- **Official definitions:** [CBS locality introduction](https://www.cbs.gov.il/he/publications/doclib/2019/ishuvim/intro.pdf),
  retained as `cbs-intro` (the document at this URL is dated December 2025). It explains locality
  definitions, mixed localities, changes to locality forms, population groups and tribes.
  Normalization preserves religion, current locality form, district and subdistrict, and
  converts pre-2007 two-digit locality forms to the equivalent three-digit codes.
- **Published secondary classification:** [IDI, The political structure of Haredi local authorities](https://www.idi.org.il/articles/52609),
  `idi-haredi`, names seven authorities and uses a 2021 population table. The criterion is a
  named political/municipal category, with Haredi leadership and all or most council members
  Haredi. **No percentage cutoff is invented.** Beit Shemesh is expressly discussed separately
  as mixed, even though the article reports a Haredi population majority. This is not a CBS flag.
- **Official Druze population table:** [CBS release 124/2024](https://www.cbs.gov.il/he/mediarelease/DocLib/2024/124/11_24_124b.pdf),
  p.3, table B, end-2022 population. The application selects the 13 localities with **≥95%**
  Druze population, using the published percentages, not election results. The other six
  mixed-religion Arab localities in the table are excluded from this group.
- **Official publisher, research-specific town definition:** [CBS working paper 25](https://www.cbs.gov.il/he/publications/DocLib/pw/pw25/pw25.pdf),
  February 2007, printed p.81, defines 15 development towns for its research on 2003 primary
  education spending. This is a sourced research list, **not a universal or current statutory
  entitlement definition**. The paper's authors' research should not be presented as a current
  government policy classification.

Normalization is project-derived evidence (`official:false`, `method:derived`, `derivedFrom`
points to the original); the original government files remain official. Normalized JSON is
retained alongside original bytes, so ordinary builds need neither Python nor network access.
To regenerate it, use Python 3 with xlrd 2.0.2 and openpyxl 3.1.5 installed in
`.backup-scratch/python`, then `PYTHONPATH=.backup-scratch/python python3 scripts/normalize-locality-classifications.py`.
After an intentional change, review the normalized rows and update their manifest hashes.

## Definitions and time

| ID | Rule |
|---|---|
| `arab` | CBS non-Jewish locality code 2 plus tribe code 3. Includes Druze and Circassian localities in the CBS geographic non-Jewish category; does not assert every resident is Arab. Mixed Jewish–Arab code 4 excluded. |
| `kibbutzim` | Current locality form 330 (33 before 2007). |
| `moshavim` | Current forms 310 and 320 (moshavim and collective moshavim). |
| `judea-samaria` | District 7, all seven subdistricts (77 is Hebron: Kiryat Arba, Karmel, Otniel; the Gaza Strip localities were district 8), plus the Jewish community in Hebron, the Central Elections Committee's locality 3400, which no CBS file lists. Israeli localities represented in the election rows only. Until 12 Nov 2026 subdistrict 77 was wrongly excluded as "Gaza". |
| `bedouin-tribes` | Current form 460; tribes only. This is not a list of all Bedouin towns. |
| `haredi` | Seven fixed IDI authorities: Bnei Brak, Modi’in Illit, Beitar Illit, Elad, Rekhasim, Qiryat Yearim, Immanuel; 2021 reference. |
| `druze` | Fixed ≥95% 2022 group: Daliyat al-Karmel, Yirka, Beit Jann, Majdal Shams, Kisra–Sumei, Yanuh–Jat, Buq’ata, Julis, Hurfeish, Sajur, Mas’ade, Ein Qiniyye, Ein al-Asad. |
| `development-towns` | Fixed 2007 research list: Ofakim, Beit She’an, Dimona, Hatzor HaGlilit, Yeruham, Migdal HaEmek, Ma’alot–Tarshiha, Mitzpe Ramon, Netivot, Arad, Qiryat Gat, Qiryat Malakhi, Qiryat Shemona, Sderot, Shelomi. |

CBS reference year equals election year for k16, k18–k25, and 2024 for k26. The separately
labelled Haredi, Druze and development-town groups are **fixed reference cohorts projected onto
each election**, not evidence of the demographic composition at that historical election.
Their `classificationYear` must be displayed with their definitions. Contemporary threshold
series for these three categories were not established; no historical demographic percentages
are supplied. Only codes present in both the selected CBS file and that election's rows count.
Consequently k16 has 12 matched Druze localities and k18 has 11, rather than 13.
The k18 CEC row 494 is the merged **Carmel City** (Daliyat al-Karmel plus Isfiya);
it is explicitly excluded from the ≥95% Druze cohort because its geographic extent differs
from the 2022 reference locality. The original row remains in the wider Arab-locality group. There is no fuzzy
name matching or code substitution across merged or renamed places.

Jerusalem, Haifa, Tel Aviv–Yafo, Lod, Ramla, Akko, Ma’alot–Tarshiha, Nof HaGalil and Neve Shalom
are excluded from the ethnic/religious Arab and Druze groups. Ma’alot–Tarshiha belongs to the
separate development-town group because its research source lists it. A group membership is
not a statement about ethnic composition unless the cited definition says so.

**Unsupported:** k17 has neither CBS codes nor locality electorates, so emits `groups:[]`
and a bilingual unavailable explanation. No unsupported name join is attempted. A comprehensive
recognized-Bedouin-locality series was not established: only the explicitly sourced tribe
category is delivered. The future-year/unsupported classifications are not silently invented.

## Storage and model contract

`kNN-localities.json` carries `groups: LocalityGroup[]` with bilingual names/definitions,
source IDs, classification year, sorted CBS codes and coverage. Coverage is the actual matched
CEC rows: locality count, registered voters, valid votes and fraction of **national** valid
votes (including envelopes in that denominator). Groups overlap and coverage must not be summed.
Build-time source hashes are checked before classification; the locality files remain schema v1
with additive optional fields for backwards compatibility. Primary election datasets and their
build timestamps are unchanged.

```ts
demographicTurnout(
  scenario: Scenario,
  data: LocalityDataset,
  adjustments: DemographicAdjustment[],
): {
  votes: Record<string, number>; // resulting counts keyed by scenario list ID
  invalid: number;              // resulting count
  votesCast: number;            // resulting valid + invalid
  action: Action;               // applyAction(scenario, result.action)
}
// Each adjustment is exactly one of:
{ groupId: string, turnoutChangePoints: number }
{ groupId: string, turnoutPercent: number }
// Returned action (signed DELTAS, not final counts):
{ type: 'addVoters', demographic: true,
  allocations: { listId: string, votes: number }[],
  invalid: number, label: string } // label serializes the adjustment assumptions
```

Percent is absolute group turnout; points are percentage-point changes against **historical**
locality turnout. Each call adds that historical delta to the current scenario, not to a stored
locality state: repeated dispatches accumulate. UI sliders should calculate from a captured
baseline and replace their previous preview, or reset/undo before reapplying. The action is
self-contained and replays without locality data; the normal scenario log/undo/share mechanism
works. Ordinary `addVoters` actions retain their previous nonnegative validation and behavior.

Group target ballots are rounded half-up once from exact decimal input, then the absolute
ballot delta is apportioned jointly across mapped valid list votes and invalid ballots by exact
Hamilton largest remainder. Ties use scenario list order, invalid last. All arithmetic that
determines ballot counts uses BigInt; coverage fractions are display-only numbers.
Merged lists sum origins; split origins use current scenario vote proportions, with equal
weights if all sharers have zero votes. Unmapped historical origins are rejected rather than
silently redistributed. Withdrawing lists must be reinstated first. Empty groups, missing
codes/electorates, envelope membership, malformed totals, overlapping simultaneous adjustments,
unsafe or negative resulting counts and turnout outside 0–100% are rejected. National cast
votes also cannot exceed scenario registration. A zero-observation group cannot create votes.
There is no cap applied silently: the caller receives `ActionError`.

For k25, Arab localities +10 points adds **93,840** ballots, including **922** invalid.
Balad crosses the threshold and receives 4 seats, Ra’am rises from 5 to 6; Likud falls from
32 to 30, Yesh Atid 24 to 23, National Unity 12 to 11 and Yisrael Beiteinu 6 to 5. Other
seat totals stay unchanged. This is an assumption about turnout with a fixed historical mix,
not a prediction about voters. Tests lock the ballot totals and the key seat transitions.

## Coverage of delivered groups

Each row reports locality count, registered electorate, valid votes, and national valid-vote
share. k17 is unavailable as explained above. These are coverage measurements, not estimates
of a demographic population.

| Election | CBS year | Group | Localities | Registered | Valid | National valid % |
|---|---|---|---:|---:|---:|---:|
| k16 | 2003 | arab | 129 | 489,559 | 292,362 | 9.286 |
| k16 | 2003 | kibbutzim | 252 | 102,316 | 70,417 | 2.237 |
| k16 | 2003 | moshavim | 446 | 152,531 | 110,963 | 3.524 |
| k16 | 2003 | judea-samaria | 122 | 119,513 | 90,511 | 2.875 |
| k16 | 2003 | bedouin-tribes | 22 | 20,726 | 7,225 | 0.229 |
| k16 | 2003 | haredi | 7 | 109,004 | 85,466 | 2.715 |
| k16 | 2003 | druze | 12 | 35,377 | 22,226 | 0.706 |
| k16 | 2003 | development-towns | 15 | 220,094 | 134,287 | 4.265 |
| k17 | — | unavailable | — | — | — | — |
| k18 | 2009 | arab | 134 | 613,650 | 322,301 | 9.554 |
| k18 | 2009 | kibbutzim | 256 | 109,959 | 75,594 | 2.241 |
| k18 | 2009 | moshavim | 440 | 181,183 | 131,399 | 3.895 |
| k18 | 2009 | judea-samaria | 118 | 160,480 | 119,094 | 3.530 |
| k18 | 2009 | bedouin-tribes | 20 | 24,142 | 5,723 | 0.170 |
| k18 | 2009 | haredi | 7 | 138,906 | 104,074 | 3.085 |
| k18 | 2009 | druze | 11 | 32,273 | 20,316 | 0.602 |
| k18 | 2009 | development-towns | 15 | 235,809 | 132,050 | 3.914 |
| k19 | 2013 | arab | 143 | 696,998 | 386,940 | 10.202 |
| k19 | 2013 | kibbutzim | 260 | 120,425 | 86,275 | 2.275 |
| k19 | 2013 | moshavim | 441 | 197,373 | 147,567 | 3.891 |
| k19 | 2013 | judea-samaria | 119 | 189,789 | 148,171 | 3.907 |
| k19 | 2013 | bedouin-tribes | 21 | 28,418 | 8,385 | 0.221 |
| k19 | 2013 | haredi | 7 | 159,519 | 129,556 | 3.416 |
| k19 | 2013 | druze | 12 | 47,486 | 28,253 | 0.745 |
| k19 | 2013 | development-towns | 15 | 245,502 | 144,790 | 3.818 |
| k20 | 2015 | arab | 144 | 747,658 | 470,657 | 11.177 |
| k20 | 2015 | kibbutzim | 261 | 125,770 | 92,285 | 2.192 |
| k20 | 2015 | moshavim | 442 | 206,833 | 162,254 | 3.853 |
| k20 | 2015 | judea-samaria | 122 | 206,263 | 163,708 | 3.888 |
| k20 | 2015 | bedouin-tribes | 21 | 32,008 | 10,567 | 0.251 |
| k20 | 2015 | haredi | 7 | 170,730 | 137,156 | 3.257 |
| k20 | 2015 | druze | 12 | 50,448 | 28,670 | 0.681 |
| k20 | 2015 | development-towns | 15 | 251,033 | 163,290 | 3.878 |
| k21 | 2019 | arab | 146 | 848,869 | 413,166 | 9.588 |
| k21 | 2019 | kibbutzim | 262 | 133,118 | 97,801 | 2.270 |
| k21 | 2019 | moshavim | 445 | 225,800 | 174,913 | 4.059 |
| k21 | 2019 | judea-samaria | 125 | 237,694 | 185,004 | 4.293 |
| k21 | 2019 | bedouin-tribes | 20 | 34,268 | 8,609 | 0.200 |
| k21 | 2019 | haredi | 7 | 192,425 | 150,955 | 3.503 |
| k21 | 2019 | druze | 13 | 55,974 | 32,658 | 0.758 |
| k21 | 2019 | development-towns | 15 | 266,185 | 171,116 | 3.971 |
| k22 | 2019 | arab | 146 | 857,661 | 502,027 | 11.315 |
| k22 | 2019 | kibbutzim | 261 | 133,910 | 96,297 | 2.170 |
| k22 | 2019 | moshavim | 445 | 227,353 | 173,517 | 3.911 |
| k22 | 2019 | judea-samaria | 125 | 241,100 | 184,065 | 4.149 |
| k22 | 2019 | bedouin-tribes | 20 | 34,873 | 14,542 | 0.328 |
| k22 | 2019 | haredi | 7 | 195,531 | 154,781 | 3.489 |
| k22 | 2019 | druze | 13 | 54,636 | 27,892 | 0.629 |
| k22 | 2019 | development-towns | 15 | 268,396 | 173,664 | 3.914 |
| k23 | 2020 | arab | 146 | 872,585 | 562,158 | 12.247 |
| k23 | 2020 | kibbutzim | 261 | 135,084 | 96,640 | 2.105 |
| k23 | 2020 | moshavim | 444 | 226,984 | 172,998 | 3.769 |
| k23 | 2020 | judea-samaria | 124 | 244,206 | 186,331 | 4.059 |
| k23 | 2020 | bedouin-tribes | 20 | 35,687 | 15,565 | 0.339 |
| k23 | 2020 | haredi | 7 | 198,990 | 157,072 | 3.422 |
| k23 | 2020 | druze | 13 | 57,287 | 30,999 | 0.675 |
| k23 | 2020 | development-towns | 15 | 271,467 | 178,560 | 3.890 |
| k24 | 2021 | arab | 146 | 900,183 | 396,896 | 9.000 |
| k24 | 2021 | kibbutzim | 262 | 137,692 | 98,119 | 2.225 |
| k24 | 2021 | moshavim | 446 | 232,475 | 172,066 | 3.902 |
| k24 | 2021 | judea-samaria | 124 | 253,681 | 186,687 | 4.233 |
| k24 | 2021 | bedouin-tribes | 20 | 37,574 | 12,035 | 0.273 |
| k24 | 2021 | haredi | 7 | 205,381 | 155,342 | 3.522 |
| k24 | 2021 | druze | 13 | 58,786 | 26,736 | 0.606 |
| k24 | 2021 | development-towns | 15 | 277,080 | 168,150 | 3.813 |
| k25 | 2022 | arab | 146 | 938,401 | 493,995 | 10.368 |
| k25 | 2022 | kibbutzim | 262 | 142,468 | 99,398 | 2.086 |
| k25 | 2022 | moshavim | 446 | 236,943 | 177,020 | 3.715 |
| k25 | 2022 | judea-samaria | 124 | 266,958 | 199,862 | 4.195 |
| k25 | 2022 | bedouin-tribes | 20 | 39,921 | 14,910 | 0.313 |
| k25 | 2022 | haredi | 7 | 214,269 | 168,144 | 3.529 |
| k25 | 2022 | druze | 13 | 61,195 | 29,498 | 0.619 |
| k25 | 2022 | development-towns | 15 | 289,159 | 190,209 | 3.992 |
| k26 | 2024 | arab | 147 | 1,033,589 | 805,683 | 14.156 |
| k26 | 2024 | kibbutzim | 262 | 154,659 | 114,391 | 2.010 |
| k26 | 2024 | moshavim | 443 | 248,550 | 196,447 | 3.452 |
| k26 | 2024 | judea-samaria | 130 | 304,096 | 237,136 | 4.167 |
| k26 | 2024 | bedouin-tribes | 20 | 44,472 | 33,088 | 0.581 |
| k26 | 2024 | haredi | 7 | 242,722 | 193,874 | 3.406 |
| k26 | 2024 | druze | 13 | 71,208 | 41,837 | 0.735 |
| k26 | 2024 | development-towns | 15 | 321,155 | 229,383 | 4.030 |
