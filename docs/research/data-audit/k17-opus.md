# k17 (28 March 2006) data audit — Opus auditor

PARTIAL — work in progress; sections below are being filled in.

Auditor: Claude Opus 5.5, 6 November 2026. Scope and method: [BRIEF.md](BRIEF.md); ranks: [source-hierarchy.md](../source-hierarchy.md).

## Non-OK findings (so far)

| # | File | JSON path | Current | Correct | Class | Source | Rank | Quote | Accessed |
|---|---|---|---|---|---|---|---|---|---|
| 1 | data/raw/k17/candidates.reviewed.json | lists[14] (ל).candidates[2].nameHe (+ electedCrossCheck.namesHe/resultsNamesHe[2]; transcriptionCorrections ל rank 3) | חסון ארדי ישראל | חסון אדוי ישראל | WRONG | CEC candidate notice YP 5504 p. 2193; results notice YP 5514 p. 2467 (retained scans) | 1 | p. 2193 rank 3: "חסון — אדוי ישראל"; p. 2467 §4(ח) 3: "חסון אדוי ישראל" | 2026-11-06 |
| 2 | data/raw/k17/candidates.reviewed.json | lists[9] (טב).candidates[6].nameHe (+ electedCrossCheck) | גבאי אליהו ברוך | גבאי אליהו בדור | WRONG | YP 5504 p. 2190 rank 7; YP 5514 p. 2466 §4(ו) 7 | 1 | "גבאי — אליהו בדור" (both notices) | 2026-11-06 |
| 3 | data/raw/k17/candidates.reviewed.json | lists[9] (טב).candidates[4].nameHe (+ electedCrossCheck) | סלומינסקי ניסן | סולומינסקי ניסן (Knesset OData spells סלומינסקי) | WRONG | YP 5504 p. 2190 rank 5; YP 5514 p. 2466 §4(ו) 5 | 1 | "סולומינסקי — ניסן" (both notices) | 2026-11-06 |
| 4 | data/raw/k17/candidates.reviewed.json | lists[15] (מחל).candidates[9].nameHe (+ electedCrossCheck) | לבנת לימור אהובה | לבנת לימור אהבה | WRONG | YP 5504 p. 2194 rank 10; YP 5514 p. 2468 §4(ט) 10 | 1 | "לבנת — לימור אהבה" (both notices) | 2026-11-06 |
