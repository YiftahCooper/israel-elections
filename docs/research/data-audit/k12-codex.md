# k12 independent audit — Codex

Audit date: 2026-11-06. Baseline: `ece8a47` (includes `53cca36`); `git merge --ff-only origin/main` returned “Already up to date.” Auditor only: no data changes or dataset builds. This report is being checkpointed during the audit; final classifications and coverage follow below.

Primary evidence independently inspected: retained Yalkut HaPirsumim 3591 (9 November 1988), printed pp. 242–244; YP 3588 (23 October 1988), candidate lists and connections p. 170. The results PDF was also downloaded live with the project User-Agent (HTTP 200). Source URLs:

- R: https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset12-results.pdf (rank 1).
- C: https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset12-cand.pdf (rank 1).

## Non-OK findings (checkpoint)

All accessed 2026-11-06. Paths use zero-based arrays; list selectors identify the intended record even when its identity itself needs correction.

| ID | File / JSON path | Current | Correct / action | Class | URL / rank / verbatim quote |
|---|---|---|---|---|---|
| F01 | `data/raw/k12/national.reviewed.json $.lists[6].nameHe`; `data/meta/k12.json $.lists[4].nameHe`, `.englishName.label`; `public/data/k12.json $.lists[16].nameHe`, `.shortHe`, `.shortEn`; party-links `$.lists["12-זב"][0].titleHe` | אחדות – למען ישועה וחיים לכנסת; Ahdut – Lemaan Yeshua VeHayim | אחדות – למען ויקטור תייר לכנסת; retranslate English. The current name invents words absent from both notices. | WRONG | C p.153; R p.242, rank 1: “אחדות – למען ויקטור תייר לכנסת” |
| F02 | `data/raw/k12/national.reviewed.json $.lists[7].letters`, `.nameHe`; `data/meta/k12.json $.lists[5].letters`, `.nameHe`, `.englishName.label`; public list `[17]` identity, letters, names; party-links key `12-זפ` | זפ / זעם ורעש / Zaam VeRaash | Candidate notice: letters **זעמ**, name **תרשיש**. Correct identity references and translation together. The results notice prints the letters/name adjacent; these must not be concatenated into a fictional list name. | WRONG | C p.154, rank 1: “אות הרשימה: זעמ”; “הכינוי: תרשיש”. Independent corroboration: https://www.ynet.co.il/articles/mobile/0%2C7340%2CL-5466574%2C00.html (rank 4): “השתמשה בצירוף האותיות זעמ” |
| F03 | `data/raw/k12/national.reviewed.json $.lists[14].nameHe`; `data/meta/k12.json $.lists[10].nameHe`, `.englishName.label`; `public/data/k12.json $.lists[22].nameHe`, `.shortHe`, `.shortEn`; party-links `$.lists["12-מעם"][0].titleHe` | תנועה למען מועמדים־ערי פיתוח ושכונות / Tnua Lemaan Muamadim… | תנועה למען מושבים ערי פיתוח ושכונות / Movement for Moshavim, Development Towns and Neighborhoods (unofficial translation). | WRONG | C p.156; R p.242, rank 1: “תנועה למען מושבים ערי פיתוח ושכונות” |
| F04 | `data/meta/party-lineage.json $.sources.k12.sha256` | ff601254033ae24bb99b084fac5253ee7f9be0a08634956c169a047773c901a8 | Baseline bytes hash to `dcb3854c1a3a54ac025e7daa0e0604fb3b8ace440f5fb4818139af6db67e1615`. Refresh after eventual fixes. | WRONG | Local reproducible evidence: SHA-256 of `public/data/k12.json`; source locator is that same file. No historical source rank applicable. |
