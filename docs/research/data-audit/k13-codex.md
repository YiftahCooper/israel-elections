# k13 independent data audit — Codex

Audit date: **2026-11-06**. Election: **23 June 1992, 13th Knesset**. Auditor only; no election inputs or generated datasets edited. `git merge --ff-only origin/main` returned “Already up to date”; `53cca36` is an ancestor of the audited HEAD `ece8a47`.

This is a bounded audit, with explicit residual coverage below. Counts describe **numbered finding groups / verification groups**, not individual JSON leaves; a roster group can cover many individual names. A field is not OK merely because another project file repeats it. Retained official scans were read visually; fresh OData requests followed pagination (132 membership-position rows, 120 opening-day identities). Scratch contains only reproducible retrievals, renders and PDF tooling. No dataset build or browser test suite was run. All source access dates below are 2026-11-06 unless stated otherwise.

## Summary

COUNT_PLACEHOLDER

The official result notice is retained: Yalkut HaPirsumim **4021, 1 July 1992, pp. 3776–3777**, in `data/raw/research/k13-results.pdf`. Every list's votes and seats agrees. Several list titles do not. Government 25 continued after Rabin's death, under Peres, until 22 November 1995. The aftermath pilot is not yet wired into the app; findings there concern held research data, not a claim that the production UI shows it.

## Evidence key

- **R (rank 1):** [CEC / Reshumot results notice](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset13-results.pdf), retained file above, SHA-256 `34f6b7dd77c72fde5885e9b1208c37760129d93091f084590aac8ed6b5696b4a`; cover plus printed pp. 3776–3777 visually inspected. Live web fetch returned 403; retained official facsimile is the evidence, not the project transcription.
- **C (rank 1):** [registered candidates, YP 4017, 14 June 1992](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset13-cand.pdf), retained `data/raw/research/k13-candidates.pdf`; supplement facsimiles hosted by IDI are separately linked in the roster table. Handwriting is not treated as official party-affiliation evidence.
- **CBS (rank 1):** [CBS table 27.2](https://www.cbs.gov.il/he/publications/doclib/2024/hnatonelectionstheknessetandgovernment.27/st27_02.pdf), retained `data/raw/research/cbs-national-totals-2024.pdf`, text layer read.
- **P (rank 1):** [13 July 1992 plenum transcript](https://main.knesset.gov.il/Documents/FB/rabin001-92jul13.pdf), ordinary custom-UA download HTTP 200; 80 PDF pages, text layer read. Quotes below preserve words while joining PDF line wrapping.
- **G (rank 1):** [PMO past governments](https://www.gov.il/apps/pmo/history/historyGovernmentsEn.html); [official OData, GovernmentNum 25](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PersonToPosition?$filter=GovernmentNum%20eq%2025&$format=json), fresh HTTP 200, 65 rows.
- **M (rank 1):** [official OData membership query](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PersonToPosition?$filter=KnessetNum%20eq%2013%20and%20(PositionID%20eq%2043%20or%20PositionID%20eq%2061)&$format=json). Follow `odata.nextLink`, adding `$format=json` because the continuation otherwise defaults to XML. Full 132 rows read; compare `StartDate == 1992-07-13T00:00:00`.
- **I (rank 2):** [IDI election 1992](https://www.idi.org.il/policy/parties-and-elections/elections/1992/). Its Tzomet vote entry is **165,366**, contrary to R and the Knesset summary's **166,366**. App correctly follows rank 1; do not import IDI's typo.

## Non-OK findings

Paths use JSONPath; array indexes are zero-based. Name corrections refer to substantive words, not typographic normalization of punctuation. R is linked in every title row so the fixer can inspect the actual document.

| ID | File and exact JSON path | Current | Correct value / action | Class | Source URL; rank; verbatim quote; accessed |
|---|---|---|---|---|---|
| F01 | `data/raw/k13/national.reviewed.json $.lists[3].nameHe`; propagated `public/data/k13.json $.lists[14].nameHe` | התנועה הלאומית הדמוקרטית ועליה | התנועה הלאומית לדמוקרטיה ועליה | WRONG | [R, p. 3776](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset13-results.pdf), rank 1: “התנועה הלאומית לדמוקרטיה ועליה”; 2026-11-06. |
| F02 | `data/raw/k13/national.reviewed.json $.lists[6].nameHe`; propagated `public/data/k13.json $.lists[24].nameHe` | ציפר | ציפור | WRONG | [R, p. 3776](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset13-results.pdf), rank 1: “ציפור”; 2026-11-06. |
| F03 | `data/raw/k13/national.reviewed.json $.lists[8].nameHe`; propagated `public/data/k13.json $.lists[21].nameHe` | התקוה - תנועה חברתית לרווחה בראשות צ׳רלי ביטון | התקוה - תנועה חברתית לוחמת בראשות צ׳רלי ביטון | WRONG | [R, p. 3776](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset13-results.pdf), rank 1: “התקוה - תנועה חברתית לוחמת בראשות צ׳רלי ביטון”; 2026-11-06. |
| F04 | `data/raw/k13/national.reviewed.json $.lists[9].nameHe`; propagated `public/data/k13.json $.lists[18].nameHe` | התורה הארץ בראשות הרב משה לוינגר | התורה והארץ בראשות הרב משה לוינגר | WRONG | [R, p. 3776](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset13-results.pdf), rank 1: “התורה והארץ בראשות הרב משה לוינגר”; 2026-11-06. |
| F05 | `data/raw/k13/national.reviewed.json $.lists[15].nameHe`; propagated `public/data/k13.json $.lists[16].nameHe` | תנועת נפגעי משכנתאות חסרי דיור ועולים משוחררים | תנועת נפגעי משכנתאות, חסרי דיור וחיילים משוחררים | WRONG | [R, p. 3776](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset13-results.pdf), rank 1: “תנועת נפגעי משכנתאות, חסרי דיור וחיילים משוחררים”; 2026-11-06. |
| F06 | `data/raw/k13/national.reviewed.json $.lists[20].nameHe`; propagated `public/data/k13.json $.lists[15].nameHe` | גימלאים עולים קשישים בישראל | גימלאים, עולים וקשישים | WRONG | [R, p. 3776](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset13-results.pdf), rank 1: “גימלאים, עולים וקשישים”; 2026-11-06. |
| F07 | `data/raw/k13/national.reviewed.json $.lists[24].nameHe`; propagated `public/data/k13.json $.lists[10].nameHe` | תחיה | התחיה | WRONG | [R, p. 3776](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset13-results.pdf), rank 1: “התחיה”; 2026-11-06. |
| F08 | `data/meta/aftermath/k13.json $.government.endDate` | `1995-11-04` | `1995-11-22`; Rabin’s personal tenure ended Nov 4, Government 25 did not. | WRONG | [PMO](https://www.gov.il/apps/pmo/history/historyGovernmentsEn.html), rank 1: “The 25th Government 22.11.1995-13.7.1992”; 2026-11-06. |
| F09 | `data/meta/aftermath/k13.json $.government.primeMinisters` | Only Yitzhak Rabin, `1992-07-13`–`1995-11-04` | Retain Rabin; add Shimon Peres, official OData `1995-11-05`–`1995-11-22`, within Government 25; distinguish acting succession from the later Government 26. | WRONG | [G / OData](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PersonToPosition?$filter=GovernmentNum%20eq%2025&$format=json), rank 1, exact response fragments: `"PersonID":456`, `"PositionID":45`, `"GovernmentNum":25`, `"StartDate":"1995-11-05T00:00:00"`, `"FinishDate":"1995-11-22T00:00:00"` (row 4318); 2026-11-06. |

Further verification and coverage notes are being appended in this audit branch.
