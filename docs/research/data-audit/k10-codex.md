# Independent audit: k10 (Codex)

Audit date: 2026-11-06. Baseline: `2e15191`; `git merge --ff-only origin/main` returned already up to date; `53cca36` is an ancestor. Auditor only: no data edits, dataset builds or browser suites.

This report distinguishes a confirmed error from failure to retrieve evidence. Counts below are **claim bundles / table rows**, not individual JSON leaves; each list row checks votes, seats, letters, Hebrew identity, English label, roster and withdrawal state separately. Remaining unverified fields are explicitly identified. This is a partial audit, not certification of every app fact.

## Non-OK findings

All sources accessed 2026-11-06. Gazette quotes below are read visually from the retained original PDF, not OCR guesses. Generated paths identify the visible symptom; fix the inputs and dependent identifiers, never generated JSON directly.

| ID | File and exact JSON path | Current | Correct / required action | Class | Source URL; rank; verbatim quote / locator |
|---|---|---|---|---|---|
| F01 | `data/raw/k10/national.reviewed.json $.lists[9].letters`; `public/data/k10.json $.lists[20].letters` and `.id` | `טן`, `10-טן` | `טז`, `10-טז`; propagate through metadata, links, family IDs | WRONG | [Gazette](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset10-results.pdf), rank 1, p.2190: “טז” beside “המועצה להצלת המולדת – רשימה משותפת לכנסת”; candidate gazette confirms ballot identity. |
| F02 | `data/raw/k10/national.reviewed.json $.lists[10].letters`; `public/data/k10.json $.lists[9].letters` and `.id` | `יש`, `10-יש` | `טי`, `10-טי`; propagate through metadata, links, family IDs | WRONG | [Gazette](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset10-results.pdf), rank 1, p.2190: “טי” beside “תנועת הצעירים”; candidate gazette confirms ballot identity. |
| F03 | `data/raw/k10/national.reviewed.json $.lists[11].letters`; `public/data/k10.json $.lists[12].letters` and `.id` | `ים`, `10-ים` | `ימ`, `10-ימ`; propagate through metadata, links, family IDs | WRONG | [Gazette](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset10-results.pdf), rank 1, p.2190: “ימ” beside “הרשימה הערבית המאוחדת”; candidate gazette confirms ballot identity. |
| F04 | `data/raw/k10/national.reviewed.json $.lists[12].letters`; `public/data/k10.json $.lists[21].letters` and `.id` | `יפ`, `10-יפ` | `יס`, `10-יס`; propagate through metadata, links, family IDs | WRONG | [Gazette](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset10-results.pdf), rank 1, p.2190: “יס” beside “יעד”; candidate gazette confirms ballot identity. |
| F05 | `data/raw/k10/national.reviewed.json $.lists[19].letters`; `public/data/k10.json $.lists[25].letters` and `.id` | `נן`, `10-נן` | `נז`, `10-נז`; propagate through metadata, links, family IDs | WRONG | [Gazette](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset10-results.pdf), rank 1, p.2190: “נז” beside “רשימת האחוה הערבית”; candidate gazette confirms ballot identity. |
| F06 | `data/raw/k10/national.reviewed.json $.lists[21].letters`; `public/data/k10.json $.lists[26].letters` and `.id` | `נכ`, `10-נכ` | `נס`, `10-נס`; propagate through metadata, links, family IDs | WRONG | [Gazette](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset10-results.pdf), rank 1, p.2190: “נס” beside “התנועה למען עליה”; candidate gazette confirms ballot identity. |
| F07 | `data/raw/k10/national.reviewed.json $.lists[26].letters`; `public/data/k10.json $.lists[16].letters` and `.id` | `קנ`, `10-קנ` | `קז`, `10-קז`; propagate through metadata, links, family IDs | WRONG | [Gazette](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset10-results.pdf), rank 1, p.2190: “קז” beside “רשימת הגימלאים והקשישים בישראל”; candidate gazette confirms ballot identity. |
| F08 | `data/raw/k10/national.reviewed.json $.lists[27].letters`; `public/data/k10.json $.lists[30].letters` and `.id` | `קן`, `10-קן` | `קי`, `10-קי`; propagate through metadata, links, family IDs | WRONG | [Gazette](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset10-results.pdf), rank 1, p.2190: “קי” beside “עוצמה”; candidate gazette confirms ballot identity. |
| F09 | `public/data/k10.json $.lists[8].shortEn` (Hebrew source input also `data/raw/k10/national.reviewed.json $.lists[21].nameHe` for עליה) | Yahad | Israel One; for English use a translation of the actual name | WRONG | [Gazette](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset10-results.pdf), rank 1, p.2190: “ישראל אחת”. |
| F10 | `public/data/k10.json $.lists[16].shortEn` (Hebrew source input also `data/raw/k10/national.reviewed.json $.lists[21].nameHe` for עליה) | Moked | Pensioners and Senior Citizens List; for English use a translation of the actual name | WRONG | [Gazette](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset10-results.pdf), rank 1, p.2190: “רשימת הגימלאים והקשישים בישראל”. |
| F11 | `public/data/k10.json $.lists[26].nameHe` (Hebrew source input also `data/raw/k10/national.reviewed.json $.lists[21].nameHe` for עליה) | התנועה למען עליה | הרשימה למען עליה; for English use a translation of the actual name | WRONG | [Gazette](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset10-results.pdf), rank 1, p.2190; candidates p.2060: “הרשימה למען עליה”. |
| F12 | `data/raw/k10/candidates.reviewed.json $.lists[7].candidates[0].nameHe`; `public/data/k10.json $.lists[10].candidates[0].nameHe` | אבו-חצירא אהרון | אבוחצירא אהרון (candidate-notice spelling; keep identity linked) | WRONG | [Candidates](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset10-cand.pdf), rank 1, p.2059 rank 1: “אבוחצירא אהרון”; [results](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset10-results.pdf) p.2192 also has the unhyphenated surname. This is a transcription-fidelity issue, not a different person. |

## Results: list-by-list ledger

Every votes/seats pair below was independently read against the results gazette pp.2190–2192 and CEC memorandum pp.3–5. Zero-seat rows are absent from the winning-seat table and have no mandate in the memorandum. All 31 rows have `withdrawn:false`; their positive official final votes support that they actually contested. The full chain of five unapproved submissions and later amendments is not certified. English labels without a noted error are reasonable display labels, not claimed literal translations. No official English list-name register was retrieved.

| Public list path | Hebrew identity; current letters | Votes / seats | Results / identity / English | Roster scope |
|---|---|---|---|---|
| `$.lists[0]` | הליכוד; `מחל` | 718,941 / 48 | votes/seats OK; identity/letters OK | 48 elected ranks; see roster ledger |
| `$.lists[1]` | המערך – מפלגת העבודה הישראלית, מפלגת הפועלים המאוחדת ובלתי מפלגתיים; `אמת` | 708,536 / 47 | votes/seats OK; identity/letters OK | 47 elected ranks; see roster ledger |
| `$.lists[2]` | יהדות התורה – אגודת ישראל; `ג` | 72,312 / 4 | votes/seats OK; identity/letters OK | 4 elected ranks; see roster ledger |
| `$.lists[3]` | התנועה לזכויות האזרח ולשלום; `רצ` | 27,921 / 1 | votes/seats OK; identity/letters OK | 1 elected ranks; see roster ledger |
| `$.lists[4]` | חזית דתית לאומית, המזרחי – הפועל המזרחי ובלתי מפלגתיים; `ב` | 95,232 / 6 | votes/seats OK; identity/letters OK | 6 elected ranks; see roster ledger |
| `$.lists[5]` | חזית דמוקרטית לשלום ולשוויון, המפלגה הקומוניסטית הישראלית (רק״ח), פנתרים שחורים וחוגי ציבור יהודים וערבים; `ו` | 64,918 / 4 | votes/seats OK; identity/letters OK | 4 elected ranks; see roster ledger |
| `$.lists[6]` | שינוי – מפלגת המרכז; `הן` | 29,837 / 2 | votes/seats OK; identity/letters OK | 2 elected ranks; see roster ledger |
| `$.lists[7]` | התחיה; `ת` | 44,700 / 3 | votes/seats OK; identity/letters OK | 3 elected ranks; see roster ledger |
| `$.lists[8]` | ישראל אחת; `ט` | 3,726 / 0 | votes/seats OK; English WRONG | not transcribed; explicitly unavailable |
| `$.lists[9]` | תנועת הצעירים; `יש` | 412 / 0 | votes/seats OK; letters WRONG | not transcribed; explicitly unavailable |
| `$.lists[10]` | תמ״י – תנועת מסורת ישראל; `ני` | 44,466 / 3 | votes/seats OK; identity/letters OK | 3 elected ranks; F12 spelling exception |
| `$.lists[11]` | המפלגה הליברלית העצמאית ובלתי מפלגתיים; `לע` | 11,764 / 0 | votes/seats OK; identity/letters OK | not transcribed; explicitly unavailable |
| `$.lists[12]` | הרשימה הערבית המאוחדת; `ים` | 11,590 / 0 | votes/seats OK; letters WRONG | not transcribed; explicitly unavailable |
| `$.lists[13]` | מחנה שלי; `ש` | 8,691 / 0 | votes/seats OK; identity/letters OK | not transcribed; explicitly unavailable |
| `$.lists[14]` | פיתוח ושלום בראשות פלאטו שרון; `פש` | 10,823 / 0 | votes/seats OK; identity/letters OK | not transcribed; explicitly unavailable |
| `$.lists[15]` | המחנה התורתי, פועלי אגודת ישראל ודתיים בלתי מפלגתיים; `ד` | 17,090 / 0 | votes/seats OK; identity/letters OK | not transcribed; explicitly unavailable |
| `$.lists[16]` | רשימת הגימלאים והקשישים בישראל; `קנ` | 2,404 / 0 | votes/seats OK; letters WRONG, English WRONG | not transcribed; explicitly unavailable |
| `$.lists[17]` | תלם – תנועה להתחדשות ממלכתית; `כן` | 30,600 / 2 | votes/seats OK; identity/letters OK | 2 elected ranks; see roster ledger |
| `$.lists[18]` | ביטול חוק מס הכנסה; `הם` | 503 / 0 | votes/seats OK; identity/letters OK | not transcribed; explicitly unavailable |
| `$.lists[19]` | מפלגת האיחוד; `זה` | 1,293 / 0 | votes/seats OK; identity/letters OK | not transcribed; explicitly unavailable |
| `$.lists[20]` | המועצה להצלת המולדת – רשימה משותפת לכנסת; `טן` | 405 / 0 | votes/seats OK; letters WRONG | not transcribed; explicitly unavailable |
| `$.lists[21]` | יעד; `יפ` | 1,228 / 0 | votes/seats OK; letters WRONG | not transcribed; explicitly unavailable |
| `$.lists[22]` | יוזמה – תנועת העצמאים בישראל; `כה` | 400 / 0 | votes/seats OK; identity/letters OK | not transcribed; explicitly unavailable |
| `$.lists[23]` | עצמאות; `כט` | 4,710 / 0 | votes/seats OK; identity/letters OK | not transcribed; explicitly unavailable |
| `$.lists[24]` | תנועת כך מיסודו של הרב מאיר כהנא; `כך` | 5,128 / 0 | votes/seats OK; identity/letters OK | not transcribed; explicitly unavailable |
| `$.lists[25]` | רשימת האחוה הערבית; `נן` | 8,304 / 0 | votes/seats OK; letters WRONG | not transcribed; explicitly unavailable |
| `$.lists[26]` | התנועה למען עליה; `נכ` | 6,992 / 0 | votes/seats OK; letters WRONG, Hebrew WRONG | not transcribed; explicitly unavailable |
| `$.lists[27]` | תנועת האזרחים הערבים בישראל; `נק` | 2,596 / 0 | votes/seats OK; identity/letters OK | not transcribed; explicitly unavailable |
| `$.lists[28]` | עמך; `ס` | 460 / 0 | votes/seats OK; identity/letters OK | not transcribed; explicitly unavailable |
| `$.lists[29]` | תנועת האוהלים; `פז` | 545 / 0 | votes/seats OK; identity/letters OK | not transcribed; explicitly unavailable |
| `$.lists[30]` | עוצמה; `קן` | 839 / 0 | votes/seats OK; letters WRONG | not transcribed; explicitly unavailable |

Sources: [official results](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset10-results.pdf) (rank 1); [independently discovered CEC signed memorandum](https://www.gov.il/BlobFolder/dynamiccollectorresultitem/memorandum-knesset10/he/archive_knesset10_memorandum10.pdf) (rank 1, dated 9 July 1981). Memorandum p.3: “רשימות מועמדים מהן אושרו” in the line giving 36 submitted and 31 approved. Do not manufacture five withdrawn contestants from five unapproved submissions.
