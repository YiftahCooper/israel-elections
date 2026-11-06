# Data audit k9 (17 May 1977, 9th Knesset): Opus auditor

PARTIAL — work in progress. Results, list names/letters and elected names checked; later sections pending.

## Non-OK findings so far

| # | Sev | File | JSON path | Current | Correct | Class | Source (rank) | Quote | Accessed |
|---|---|---|---|---|---|---|---|---|---|
| 1 | H | `data/raw/k9/national.reviewed.json` → `public/data/k9.json` | list `הם` letters + nameHe | `הם` / `דמוקרטים בצדק` | `הפ` / `דו־קיום בצדק` | WRONG | YP 2326 p.1494; YP 2319 p.1323 (1) | "הפ דו־קיום בצדק 1,085" | 2026-11-06 |
| 2 | H | same | list `זה` nameHe | `התנועה להתחדשות חברתית בראשותו של מרדכי בן־פורת` | `התנועה להתחדשות ציונית חברתית בראשותו של מרדכי בן־פורת` | WRONG | YP 2326 p.1494; YP 2319 p.1324 (1) | | 2026-11-06 |
| 3 | H | same | list `חך` | `חך` / `בית ישראל, ברית נאמני תימן ועדות ישראל` | `זך` / `בית ישראל, ברית יוצאי תימן ועדות ישראל` | WRONG | YP 2326 p.1494; YP 2319 p.1324 (1) | | 2026-11-06 |
| 4 | H | same | list `סם` letters | `סם` | `ספ` | WRONG | YP 2326 p.1494; YP 2319 pp.1319, 1329 (1) | | 2026-11-06 |
| 5 | H | same | list `פז` | `פז` / `הפנתרים הציוניים, רשימת ציבור ודורשי עבודה` | `פ` / `הפנתרים הציוניים, רשימת עובדי ייצור וועדי עובדים` | WRONG | YP 2326 p.1494; YP 2319 p.1329 (1) | | 2026-11-06 |
| 6 | H | same | list `פח` | `פח` / `…ישראל הצעירה, יוצאי עדות, ועדי…` | `פז` / `…ישראל הצעירה, יוצאי עודד, ועדי…` | WRONG | YP 2326 p.1494; YP 2319 p.1329 (1) | | 2026-11-06 |
| 7 | M | `data/raw/k9/candidates.reviewed.json` → `public/data/k9.json` | `9-אמת` rank 16 nameHe | `אשל תמר (שדה)` | `אשל תמר (עדה)` | WRONG | YP 2326 p.1495; YP 2319 p.1320 (1) | "16. אשל תמר (עדה)" | 2026-11-06 |
