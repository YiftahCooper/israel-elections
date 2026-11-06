# Data audit k15 (17 May 1999, 15th Knesset): Opus auditor

**PARTIAL — work in progress.** Base revision `5e117f0`. All checks accessed **2026-11-06**. No data edited.

## Non-OK findings so far

| # | File | JSON path | Current | Correct / proposed | Class | Source (rank) | Quote | Accessed |
|---|---|---|---|---|---|---|---|---|
| 1 | `data/raw/k15/national.reviewed.json` (→ `public/data/k15.json`) | lists: ק and ני absent | Two registered lists missing | Add ק "קול הסביבה" and ני "מנהיגות יהודית לישראל" as `withdrawn: true`, 0 votes | WRONG (missing withdrawn lists) | YP 4748 p.3044, 3046; YP 4751 p.3184; YP 4754 p.3269 (rank 1) | see final report | 2026-11-06 |
| 2 | `data/raw/k15/national.reviewed.json` etc. | `lists[nameHe=האיחוד הלאומי…].letters` | `ט` | `יט` | WRONG | YP 4757 p.3376–3377; YP 4748 p.3040; YP 4755 p.3305 (rank 1) | "יט האיחוד הלאומי - מולדת חרות תקומה 100,181" | 2026-11-06 |
| 3 | `data/raw/k15/candidates.reviewed.json`, `elected.reviewed.json` | `שס` rank 18 | `גאגולה יצחק` | `גאגולה איסק` | WRONG | YP 4748 p.3048; YP 4757 p.3378 (rank 1) | "18. גאגולה איסק"; "17. גאגולה איסק" | 2026-11-06 |
