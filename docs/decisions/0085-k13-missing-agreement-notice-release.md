# K13: release with the agreement-notice gap disclosed

Accepted 2026-11-03 under the owner's explicit fallback authorization.
Related evidence: 0081; new bounded search in
`data/raw/k13/agreement-search.reviewed.json`.

The repeat search used the Hebrew notice title with 1992/תשנ״ב and the olaw mirror.
Downloading `https://olaw.org.il/yalkut/yalkut-4017.pdf` produced the same SHA-256
as the retained gov.il candidate scan. This scan omits many printed pages, including
3654. A Hebrew Wikipedia footnote supplied the **discovery lead** YP 4017 p. 3654,
linking to `https://www.nevo.co.il/law_html/Law10/YALKUT-4017.pdf`; that request
returned HTTP 403. The linked official Ministry of Justice API returned another
22-page scan, also missing the needed pages. Neither discovery text nor a blocked
link is an inspected agreement notice. No inferred pairs are promoted.

The agreement notice remains **not recovered**, not proved nonexistent. Retain
`agreements: []` and release because the existing national votes and 1.5% allocation
preset reproduce every gazetted seat, with 120 seats and no warnings. This does not
prove agreement completeness. Agreements involving nonqualifying lists or otherwise
ineffective agreements may be missing.

Both picker and dataset state this plainly in Hebrew and English. The existing
1996 six-pair and 1999 nine-pair notices are unchanged, including ineffective pairs.
An exhaustive re-search of unrelated gazette pages is outside this bounded release
search; all retrieval and inspection limits remain explicit.
