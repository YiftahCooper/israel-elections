# K26 official count check — 5 November 2026

The [CEC locality CSV](https://media26.bechirot.gov.il/files/expc.csv) and
[CEC polling CSV](https://media26.bechirot.gov.il/files/expb.csv) were retrieved directly on
5 November 2026 (Israel time) with the project User-Agent. Their Last-Modified headers
are 4 November 2026, 09:42:15 GMT and 09:42:14 GMT respectively. The retained files,
byte lengths and SHA-256 hashes are in `data/raw/SOURCES.json`.

## Publication evidence and limits

Verified: the CEC has updated its complete count files on 4 November. The files do not
establish gazettal or provide an official seat allocation. Gazette number/date/URL and
an official seat allocation remain unverified; neither is inferred from the expired
4 November deadline. This does **not** establish that publication has not occurred.

Direct retrieval of the national results page returned 404; the web reader returned
a JavaScript robot-verification page. The CEC gov.il page returned 403, and the Knesset
results page returned 247 without results. The official history page
(https://www.gov.il/he/pages/election-committee-history?chapterindex=7) had no readable
content in the web reader. Targeted searches of official sites did not locate a result
notice. No access checks were bypassed. This is a retrieval limitation, not evidence
of nonpublication. The dataset retains its conservative publication-unverified status.

## Exact changes from the prior retained count

Previous source files remain recoverable at git commit
`79bfd5233d09edc825da44ad86bf63b0726c8e87`. Updated locality and polling files must
reconcile at every locality and list through `buildK26` before release.

| Total | Previous | Updated | Delta |
|---|---:|---:|---:|
| registered | 7331981 | 7331981 | +0 |
| votesCast | 5717386 | 5717397 | +11 |
| invalid | 25990 | 25971 | -19 |
| valid | 5691396 | 5691426 | +30 |

| Ballot letters | Previous votes | Updated votes | Delta |
|---|---:|---:|---:|
| מחל | 1167589 | 1167591 | +2 |
| ב | 326788 | 326793 | +5 |
| ג | 312630 | 312632 | +2 |
| ט | 290548 | 290549 | +1 |
| דרך | 913630 | 913629 | -1 |
| אמת | 366285 | 366278 | -7 |
| רק | 531991 | 532018 | +27 |
| עם | 337718 | 337720 | +2 |
| ודם | 500650 | 500755 | +105 |
| די | 155089 | 155199 | +110 |
| ך | 95703 | 95764 | +61 |
| זך | 10599 | 10604 | +5 |
| ד | 4222 | 4077 | -145 |
| צדק | 2085 | 2086 | +1 |
| קך | 920 | 918 | -2 |
| פה | 872 | 871 | -1 |
| קץ | 775 | 778 | +3 |
| רץ | 607 | 580 | -27 |
| ז | 507 | 501 | -6 |
| ה | 427 | 322 | -105 |

All other 18 list totals are unchanged. Registered voters, polling-row count
(12,929), and locality-row count including envelopes (1,225) are unchanged.

Regenerate with `npm run data:build`; check with TypeScript, Vitest and Playwright
on port 5531 as configured in the release brief. No official seat figures were added.

The refreshed count yields the same seats for every list. Independently summed qualifying
votes: 5,384,948; threshold ceiling: 184,972; general quota: 44,874; five remainder seats.
Family metadata caches were refreshed only for k26 votes, denominators, status and hashes;
classifications are unchanged. Differential allocation/analysis/model digests were recorded
again for these data changes; no engine/model implementation changed and validation/rules
digests stayed identical.

Control check: the unchanged current engine/model run against HEAD’s original k26
dataset reproduced all five previous differential digests exactly. The same code
against the updated data produced the revised digests in the regression test.

Coordinator follow-up outside this task’s component scope: FamilyCharts.tsx,
Families.tsx and FamilyEvidence.tsx still describe publication as pending/not yet
gazetted. Align those labels with the verification caveat when integrating the
parallel UI work; lack of readable publication evidence is not proof of nonpublication.

To reproduce the dependent family snapshots, update only each k26 row from the
retained dataset: dataset SHA-256/status, valid-vote denominator, member/review
votes. Recompute core/included/mixed/whole-list metrics with the existing membership
treatments, numerator = votes × 100, denominator = valid, displayPct rounded to six
decimals. Preserve null core metrics. `node scripts/validate-families.ts` independently
checks the hashes, membership pointers, integer totals and percentages.
