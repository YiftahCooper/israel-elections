# K1–K7: connected-list notices and bounded search limits

3 November 2026. Primary gazettes, including mirror disclosure, are registered
in `data/raw/SOURCES.json`. Connections were never inferred from seat results.

## Recovered signed notices

* **1965: YP 1225, 24 October 1965, p.189 (PDF p.1).** The entire notice, through
  Moshe Landau's signature, has two numbered pairs: **את–יא** (Alignment–Cooperation
  and Brotherhood), **כא–כס** (Rafi–Peace). Peace has 5,536 votes and fails the 1%
  threshold, so that pair is inactive. The other two PDF pages are a blank printer
  page and a later scanning certificate; neither continues the notice. Retained
  as `data/raw/k6/agreements.pdf` from
  https://olaw.org.il/yalkut/yalkut-1225.pdf.
* **1969: YP 1565, 22 October 1969, p.246 (PDF p.2).** The complete notice, through
  Alfred Witkon's signature, contains **יא–רא** (Cooperation and Brotherhood–Progress
  and Development). Retained as `data/raw/k7/agreements.pdf` from
  https://olaw.org.il/yalkut/yalkut-1565.pdf. Other notices start below and alongside;
  they are not additional election agreements.

These are official statutory publications on the **olaw.org.il mirror**, not
secondary accounts. Completeness means each signed notice was read in full;
it is not an assertion that no later correction can exist.

## Search bounds

Direct curl GETs of `https://olaw.org.il/yalkut/yalkut-NNNN.pdf` covered candidate
through results issues: **174–181, 425–432, 704–717, 863–869, 1222–1230, 1563–1573**.
All requests in the first four ranges returned **404**. All issues in the latter
two ranges were retrieved, and their complete cover contents inspected. The
relevant signed notices were then rendered/read as above. Other covers showed
candidate withdrawals (YP 1226 p.190), not an additional agreement notice.
Unrelated issues are reproducible scratch material and not retained permanently.
Python HTTP requests initially returned 403; curl succeeded/returned the 404s
reported here. No conclusion about absent notices follows from inaccessible files.

For 1949, the primary **21 January amendment** (`law-1948-312737.pdf`, s.1(c))
changes s.26(c) to require publication in **daily newspapers at least one day
before the election**, replacing Official Gazette publication seven days before.
Thus searching only gazettes cannot establish the election-day connection set.
No complete contemporary newspaper notice was recovered in this pass. The
unofficial combined transcription's amendment attribution was not used as evidence.

An official 1951 CEC memorandum is an additional lead: indexed text at
https://www.gov.il/BlobFolder/dynamiccollectorresultitem/memorandum-knesset2/he/archive_knesset2_memorandum1.pdf
states General Zionists **צ–סצ** (Sephardim/Oriental Communities) and cites **YP 177**.
A bounded download stopped at the 5 MB declared-size limit; its pages were not
visually verified or retained. This is a search lead, **not** a promoted complete
agreement set. YP 177's mirror returned 404. It explains why a no-agreement seat
match alone must not be described as verified historical inputs.

The missing 1951–1961 notices require another archive route. This is a bounded
retrieval record, not proof that the notices or other agreements do not exist.
