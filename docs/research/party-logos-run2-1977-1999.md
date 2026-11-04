# Party logos, run 2: 1977–1999

As of 4 November 2026. Scope: the 76 missing **whole-list** logos among 89
seat-winning lists in k9–k15. Existing 14 logos are preserved. Constituents are
separate identities and are not substituted for joint-list lockups. This is an
acquisition and search record under decision 0089, not a claim that all logos
have been recovered. Each gap receives a fresh general search and a targeted
NLI search; results below distinguish discovery snippets from inspected originals.

## Criteria and method

Accept official campaign origin plus dated evidence for that election. Retain
complete original bytes and catalogue HTML, each SHA-256 in data/raw/SOURCES.json;
record crop coordinates and dimensions in overlay/source publicationEvidence.
The displayed PNG has its own SHA-256 and is bounded by 256 px and 60,000 bytes.
No emblem is redrawn, recoloured, or assigned across campaigns by resemblance.
A search miss, broad catalogue date or inaccessible scan never establishes
“no emblem in use”. No such absence finding has been established in this run.

Jina search_web provides discovery only (Google snippets; 3 or 4 results requested
per query). All returned locators are recorded below; they are **not** all opened
or independent evidence. Hebrew Wikipedia results are secondary leads only.
English Wikipedia was excluded from general discovery and never opened or cited.
Plain HTTP uses `israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)`.
No email, proxies, CAPTCHA solving, login bypass, or paid Apify retrievals ($0).
NLI site/IIIF challenges were respected; accessible Jabotinsky scans were fetched
serially. Wayback requests were separated by far more than three seconds; no 429
or Retry-After was observed. Counts refer to identity-specific searches, not
independent reviewed sources. Search services do not expose recall or completeness.

## Retrieval failures and shared route checks

- Initial plain HTTP NLI documentation request: curl 6, sandbox DNS failure.
  Network-enabled retry of https://www.nli.org.il/en/research-and-teach/open-library/presentation-api
  returned HTTP 403, challenge HTML; no bypass attempted. Jina read_url returned
  “Just a moment…” for that URL, the sibling `/image-api`, and
  https://www.nli.org.il/he/discover/israel/elections/1977 .
- Search `site:nli.org.il "IIIF" "https" "manifest"` identifies the documented
  format `https://iiif.nli.org.il/IIIFv21/DOCID/{DOCID}/manifest` and the
  record-ID equivalent. Testing
  https://iiif.nli.org.il/IIIFv21/DOCID/NNL_Ephemera700127850/manifest
  (Morasha's known legacy item) returned **HTTP 403**. This is a failed legacy-ID
  resolution attempt, not proof that the identifier is accepted by the new API.
  Current catalogue IDs found below remain uninspected leads; no scan was acquired
  through the new API. The current catalogue route was found, but a working scan
  route was not established.
- https://digital.library.ucla.edu/catalog/ark:/21198/z1k99tmp
  (Morasha candidate found by search) returned “Making sure you're not a bot!”
  through Jina; stopped. University mirror does not independently corroborate NLI.
- https://catalog.archives.gov.il/catalog#!/Catalog/0b07170680034d86/Unit/0b0717068030b15d/Deposit/0b0717068035e29b
  returned `{"message":"Forbidden"}` through Jina. Search identified the State
  Archives printed election-propaganda collection, not an inspected campaign scan.
- https://designarchive.shenkar.ac.il/articles/84 returned “500 Server Error”
  through Jina. Discovery snippet mentions a Prosper Ben Harush Hadash poster,
  1996; combined Hadash–Balad identity and exact artwork remain unverified.
- https://jewish-faculty.biu.ac.il/files/jewish-faculty/shared/record_group_003_0.pdf
  opened through Jina: NRP parliamentary-faction finding aid, not an original
  campaign poster. It establishes an archival route, not a usable campaign logo.
- `https://web.archive.org/web/19990428045736id_/http://www.likud.org.il:80/navframe.html`
  returned HTTP 404 after redirect to actual replay **20120928014244**. Rejected;
  this is not a 1999 frame. Exact campaign-window CDX follow-up is recorded in k15.
- First two Jina search calls attempted arrays of nine queries: validation error
  `Array must contain at most 5 element(s)`; corrected to batches of at most five.
  These failed calls are not counted as completed searches.
- First direct archive-image requests had unencoded Hebrew path components and
  failed locally with ASCII encoding errors. Percent-encoded retries succeeded.
- First dataset build failed because locked dependencies were absent (`pdfjs-dist`);
  installed with npm ci using project-local scratch cache before re-running.

## Accepted print evidence

All three selected sources are official **Likud-produced campaign publications**,
held by Jabotinsky Institute. The catalogue and scan are one evidence family per
poster. Source cards use `official party campaign publication`, rather than
misclassifying print as a party website. The validator adds that source type and
checks retained page/scan hashes, original-asset URL/hash equality, crop bounds,
and publication-date equality. Existing website/CDX checks are preserved.
Medium confidence conservatively reflects small archived scans and catalogue
provenance; high-confidence website/CDX rules are not claimed for print.

Crop recipe: CPython 3.13.16, Pillow 12.2.0; `Image.open(original).crop(box)`
with exclusive right/bottom coordinates, `.convert('RGBA')`,
`.thumbnail((256,256), Image.Resampling.LANCZOS)`, `.save(output,optimize=True)`.
Original scan bytes are not modified. No watermark is removed: the selected
emblem regions lie outside it. Full scans retain their archive watermarks.
SVG was not available for these printed designs. PNGs are original-resolution
crops; no upscaling. Visual inspection includes full scan, crop and 64-px preview.

## Coverage

Final before/after counts and verification are recorded at the end after all batches.

## k9 · 1977

### מחל — הליכוד

**Accepted:** dated official print crop; details below.

- General discovery: `query: ליכוד 1977 כרזה בחירות סמל -site:en.wikipedia.org`
  Returned locators (snippet inspection only): [lead 1](https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%AA%D7%A9%D7%99%D7%A2%D7%99%D7%AA), [lead 2](https://www.idi.org.il/policy/parties-and-elections/elections/1977), [lead 3](https://www.nli.org.il/he/discover/israel/elections).
- NLI targeted discovery: `query: site:nli.org.il "ליכוד" "1977" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/en/newspapers/ahr/1977/05/22/01/article/27?&), [lead 2](https://www.nli.org.il/en/newspapers/ahr/1977/09/26/01/page/9?&), [lead 3](https://www.nli.org.il/en/newspapers/dav/1977/05/19/01/page/1?&).

Inspected [catalogue](https://www.jabotinsky.org/%D7%90%D7%A8%D7%9B%D7%99%D7%95%D7%9F/%D7%97%D7%99%D7%A4%D7%95%D7%A9-%D7%9E%D7%AA%D7%A7%D7%93%D7%9D/%D7%A4%D7%A8%D7%99%D7%98?itemId=34361) and [scan](https://www.infocenters.co.il/jabo/jabo_multimedia/%D7%9B%D7%A8%D7%96%D7%95%D7%AA/12.06.2013/2468_4099.jpg); printed event date **1977-04-28**. Crop `[229, 0, 440, 96]` from `[448, 332]`; final `logos/likud-print-1977.png`, 42274 bytes. Original SHA-256 `0c7bf872c05a3aeaaba08ed6f8903aeee16d4fdf5c43acef4f99b9ca8ba7dd75`; final SHA-256 `a941a49f1f7082db7370dd6715c95afc47c8dd2edb449711ead09c651ded6cbb`. Catalogue HTML and scan are retained at `data/raw/logos/k9/`. Fair-use identification, no free licence asserted.

### ג — יהדות התורה, אגודת ישראל

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: אגודת ישראל 1977 כרזה בחירות סמל -site:en.wikipedia.org`
  Returned locators (snippet inspection only): [lead 1](https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%AA%D7%A9%D7%99%D7%A2%D7%99%D7%AA), [lead 2](https://www.nli.org.il/he/discover/israel/elections), [lead 3](https://www.idi.org.il/policy/parties-and-elections/elections/1977).
- NLI targeted discovery: `query: site:nli.org.il "אגודת ישראל" "1977" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/en/newspapers?a=d&d=ahr19770218-01.1.2&l=en), [lead 2](https://www.nli.org.il/he/newspapers/mar/1984/08/03/01/article/142?&).

### רצ — התנועה לזכויות האזרח

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: רצ 1977 כרזה בחירות סמל -site:en.wikipedia.org`
  Returned locators (snippet inspection only): [lead 1](https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%AA%D7%A9%D7%99%D7%A2%D7%99%D7%AA), [lead 2](https://www.idi.org.il/policy/parties-and-elections/elections/1977), [lead 3](https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf).
- NLI targeted discovery: `query: site:nli.org.il "רצ" "1977" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/en/newspapers?a=d&d=mar19770518-01.1.8&l=en), [lead 2](https://www.nli.org.il/en/newspapers/dav/1977/10/12/01/page/8), [lead 3](https://www.nli.org.il/en/newspapers/ahr/1977/06/17/01/article/109?&).

### ב — חזית דתית לאומית, המזרחי, הפועל המזרחי ובלתי מפלגתיים

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: מפדל 1977 כרזה בחירות סמל -site:en.wikipedia.org`
  Returned locators (snippet inspection only): [lead 1](https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%AA%D7%A9%D7%99%D7%A2%D7%99%D7%AA), [lead 2](https://www.idi.org.il/policy/parties-and-elections/elections/1977), [lead 3](https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%93%22%D7%9C).
- NLI targeted discovery: `query: site:nli.org.il "מפדל" "1977" תעמולה`
  Empty result set for this exact query.

### ו — חזית דמוקרטית לשלום ולשוויון – המפלגה הקומוניסטית הישראלית (רק״ח); פנתרים שחורים וחוגי ציבור יהודים וערבים

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: חדש 1977 כרזה בחירות סמל -site:en.wikipedia.org`
  Returned locators (snippet inspection only): [lead 1](https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%AA%D7%A9%D7%99%D7%A2%D7%99%D7%AA), [lead 2](https://www.idi.org.il/policy/parties-and-elections/elections/1977), [lead 3](https://www.nli.org.il/he/discover/israel/elections).
- NLI targeted discovery: `query: site:nli.org.il "חזית דמוקרטית לשלום" "1977" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/en/newspapers/dav/1977/02/11/01/page/32?&).

### לע — המפלגה הליברלית העצמאית

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `Error: Search failed for query "ליברלים עצמאיים 1977 כרזה בחירות סמל -site:en.wikipedia.org": 500 Internal Server Error - timeout of 5000ms exceeded`
  Failed: Error: Search failed for query "ליברלים עצמאיים 1977 כרזה בחירות סמל -site:en.wikipedia.org": 500 Internal Server Error - timeout of 5000ms exceeded
- NLI targeted discovery: `query: site:nli.org.il "ליברלים עצמאיים" "1977" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/newspapers/dav/1977/07/11/01/page/4?&), [lead 2](https://www.nli.org.il/he/journals/NNL-Journals990012802580205171/NLI).

### ים — הרשימה הערבית המאוחדת

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: הרשימה הערבית המאוחדת 1977 כרזה בחירות סמל -site:en.wikipedia.org`
  Returned locators (snippet inspection only): [lead 1](https://www.gov.il/BlobFolder/guide/candidates-lists-26/he/pr5_26_annex.pdf), [lead 2](https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%AA%D7%A9%D7%99%D7%A2%D7%99%D7%AA), [lead 3](https://www.idi.org.il/policy/parties-and-elections/elections/1977).
- NLI targeted discovery: `query: site:nli.org.il "הרשימה הערבית המאוחדת" "1977" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/newspapers/dav/1977/05/17/01/page/12?&).

### ש — מחנה שלי

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: מחנה שלי 1977 כרזה בחירות סמל -site:en.wikipedia.org`
  Returned locators (snippet inspection only): [lead 1](https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%AA%D7%A9%D7%99%D7%A2%D7%99%D7%AA), [lead 2](https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf), [lead 3](https://www.kan.org.il/?add-to-cart=639&0&1&2&3&custom_field_14=fb.2.1746662400051.504559554473332906&page=506).
- NLI targeted discovery: `query: site:nli.org.il "מחנה שלי" "1977" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/en/newspapers?a=d&d=ahr19781009-01.1.3&l=en).

### ד — המחנה התורתי, פועלי אגודת ישראל ודתיים בלתי מפלגתיים

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: פועלי אגודת ישראל 1977 כרזה בחירות סמל -site:en.wikipedia.org`
  Returned locators (snippet inspection only): [lead 1](https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%AA%D7%A9%D7%99%D7%A2%D7%99%D7%AA), [lead 2](https://www.nli.org.il/he/discover/israel/elections), [lead 3](https://www.idi.org.il/policy/parties-and-elections/elections/1977).
- NLI targeted discovery: `query: site:nli.org.il "פועלי אגודת ישראל" "1977" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/en/newspapers?a=d&d=ahr19770218-01.1.2&l=en).

## k10 · 1981

### מחל — הליכוד

**Accepted:** dated official print crop; details below.

- General discovery: `query: ליכוד 1981 כרזה בחירות סמל -site:en.wikipedia.org`
  Returned locators (snippet inspection only): [lead 1](https://he.wikipedia.org/wiki/%D7%94%D7%9C%D7%99%D7%9B%D7%95%D7%93), [lead 2](https://www.nli.org.il/he/discover/israel/elections), [lead 3](https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf).
- NLI targeted discovery: `query: site:nli.org.il "ליכוד" "1981" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/newspapers/dav/1981/06/19/01/article/94), [lead 2](https://www.nli.org.il/he/newspapers/dav/1981/05/31/01?&), [lead 3](https://www.nli.org.il/en/archives/NNL_ARCHIVE_AL990039878190205171/NLI).

Inspected [catalogue](https://www.jabotinsky.org/%D7%90%D7%A8%D7%9B%D7%99%D7%95%D7%9F/%D7%97%D7%99%D7%A4%D7%95%D7%A9-%D7%9E%D7%AA%D7%A7%D7%93%D7%9D/%D7%A4%D7%A8%D7%99%D7%98?itemId=34179) and [scan](https://www.infocenters.co.il/jabo/jabo_multimedia/%D7%9B%D7%A8%D7%96%D7%95%D7%AA/9.05.2013/2423_3966.jpg); printed event date **1981-06-17**. Crop `[244, 405, 313, 436]` from `[314, 448]`; final `logos/likud-print-1981.png`, 5664 bytes. Original SHA-256 `c2a9287390c8a35cf1950973db1c5f5c4829ac5b71c27ef2efe62bd48b8e845a`; final SHA-256 `87a6ff9d0396bc647457dbb098c499511988373214ecc5dbbcea7627d1873f1a`. Catalogue HTML and scan are retained at `data/raw/logos/k10/`. Fair-use identification, no free licence asserted.

### אמת — המערך – מפלגת העבודה הישראלית, מפלגת הפועלים המאוחדת ובלתי מפלגתיים

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: המערך 1981 כרזה בחירות סמל -site:en.wikipedia.org`
  Empty result set for this exact query.
- NLI targeted discovery: `query: site:nli.org.il "המערך" "1981" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/discover/israel/elections), [lead 2](https://www.nli.org.il/he/newspapers/mar/1981/01/27/01/page/21?&), [lead 3](https://www.nli.org.il/he/newspapers/dav/1981/06/19/01/article/94).

### ג — יהדות התורה – אגודת ישראל

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: אגודת ישראל 1981 כרזה בחירות סמל -site:en.wikipedia.org`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/discover/israel/elections), [lead 2](https://www.maariv.co.il/news/elections-2026/article-1380141), [lead 3](https://www.idi.org.il/policy/parties-and-elections/elections/1951).
- NLI targeted discovery: `query: site:nli.org.il "אגודת ישראל" "1981" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL990034751580205171/NLI), [lead 2](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997012156926305171/NLI), [lead 3](https://www.nli.org.il/he/newspapers/dav/1981/02/25/01/article/127).

### רצ — התנועה לזכויות האזרח ולשלום

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: רצ 1981 כרזה בחירות סמל -site:en.wikipedia.org`
  Returned locators (snippet inspection only): [lead 1](https://www.instagram.com/reel/DcrDZb2jjlQ), [lead 2](https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA), [lead 3](https://www.instagram.com/reel/DcjI7grCKuP).
- NLI targeted discovery: `query: site:nli.org.il "רצ" "1981" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/journals/NNL-Journals990018748160205171/NLI).

### ב — חזית דתית לאומית, המזרחי – הפועל המזרחי ובלתי מפלגתיים

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: מפדל 1981 כרזה בחירות סמל -site:en.wikipedia.org`
  Returned locators (snippet inspection only): [lead 1](https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%93%22%D7%9C), [lead 2](https://www.instagram.com/reel/Decb20IhxK5), [lead 3](https://www.gov.il/BlobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisionsfullbook2022.pdf).
- NLI targeted discovery: `query: site:nli.org.il "מפדל" "1981" תעמולה`
  Empty result set for this exact query.

### ו — חזית דמוקרטית לשלום ולשוויון, המפלגה הקומוניסטית הישראלית (רק״ח), פנתרים שחורים וחוגי ציבור יהודים וערבים

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: חדש 1981 כרזה בחירות סמל -site:en.wikipedia.org`
  Returned locators (snippet inspection only): [lead 1](https://www.instagram.com/reel/DcrDZb2jjlQ), [lead 2](https://www.instagram.com/reel/DcjI7grCKuP), [lead 3](https://www.nli.org.il/he/discover/israel/elections).
- NLI targeted discovery: `query: site:nli.org.il "חזית דמוקרטית לשלום" "1981" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/newspapers/dav/1984/06/08/01/page/2?&).

### הן — שינוי – מפלגת המרכז

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: שינוי 1981 כרזה בחירות סמל -site:en.wikipedia.org`
  Returned locators (snippet inspection only): [lead 1](https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%9C%D7%92%D7%AA_%D7%A9%D7%99%D7%A0%D7%95%D7%99), [lead 2](https://www.nli.org.il/he/discover/israel/elections), [lead 3](https://www.instagram.com/reel/DcrDZb2jjlQ).
- NLI targeted discovery: `query: site:nli.org.il "שינוי" "1981" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997012156936905171/NLI), [lead 2](https://www.nli.org.il/he/discover/israel/elections), [lead 3](https://www.nli.org.il/he/newspapers/mar/1981/01/19/01).

### ת — התחיה

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: התחיה 1981 כרזה בחירות סמל -site:en.wikipedia.org`
  Returned locators (snippet inspection only): [lead 1](https://he.wikipedia.org/wiki/%D7%94%D7%AA%D7%97%D7%99%D7%94), [lead 2](https://www.maariv.co.il/news/elections-2026/article-1380141), [lead 3](https://www.walla.co.il/news/israel/2610533).
- NLI targeted discovery: `query: site:nli.org.il "התחיה" "1981" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/en/archives/NNL_ARCHIVE_AL990039481790205171/NLI), [lead 2](https://www.nli.org.il/he/newspapers/dav/1984/06/29/01/page/18?&).

### ני — תמ״י – תנועת מסורת ישראל

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: תמי 1981 כרזה בחירות סמל -site:en.wikipedia.org`
  Returned locators (snippet inspection only): [lead 1](https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf), [lead 2](https://www.idi.org.il/media/27873/the-elections-in-israel-2022.pdf), [lead 3](https://www.kan.org.il/?remove_item=eddb904a6db773755d2857aacadb1cb0&_wpnonce=5bf7137882&page=487).
- NLI targeted discovery: `query: site:nli.org.il "תמי" "1981" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/books/NNL_ALEPH990032480450205171/NLI), [lead 2](https://www.nli.org.il/ar/newspapers/mar/1981/01/23/01/page/76?&), [lead 3](https://www.nli.org.il/en/archives/NNL_ARCHIVE_AL990039878190205171/NLI).

## k11 · 1984

### מחל — הליכוד

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"ליכוד" "1984" (כרזה OR כרזות OR לוגו) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.israelhayom.co.il/news/local/article/17829673), [lead 2](https://www.kan.org.il/content/kan-news/politic/248346), [lead 3](https://www.nli.org.il/he/newspapers/hadashot/1984/07/15/01/article/85?&), [lead 4](https://he.wikipedia.org/wiki/%D7%94%D7%9C%D7%99%D7%9B%D7%95%D7%93).
- NLI targeted discovery: `query: site:nli.org.il "ליכוד" "1984" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/newspapers/hadashot/1984/07/17/01/article/30?&), [lead 2](https://www.nli.org.il/he/newspapers/hadashot/1984/06/15/01/article/133), [lead 3](https://www.nli.org.il/en/newspapers/mar/1984/07/08/01/article/26?&).

### אמת — המערך

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"המערך" "1984" (כרזה OR כרזות OR לוגו) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.idi.org.il/policy/parties-and-elections/elections/1984), [lead 2](https://www.facebook.com/KnessetTv/videos/%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-84-%D7%9B%D7%A9%D7%A9%D7%99%D7%93%D7%95%D7%A8%D7%99-%D7%94%D7%AA%D7%A2%D7%9E%D7%95%D7%9C%D7%94-%D7%94%D7%99%D7%95-%D7%94%D7%A6%D7%92%D7%94-%D7%A9%D7%9C-%D7%90%D7%99%D7%A9-%D7%90%D7%97%D7%93-%D7%A2%D7%9D-%D7%A4%D7%AA%D7%99%D7%97%D7%AA-%D7%A9%D7%99%D7%93%D7%95%D7%A8%D7%99-%D7%94%D7%AA%D7%A2%D7%9E%D7%95%D7%9C%D7%94-%D7%A9%D7%9C-%D7%9E%D7%A2%D7%A8%D7%9B%D7%AA-/2391771011573063), [lead 3](https://www.maariv.co.il/news/elections-2026/article-1380141), [lead 4](https://www.facebook.com/KnessetTv/videos/%D7%91%D7%9C%D7%99-%D7%90%D7%91%D7%9C-%D7%91%D7%95%D7%90-%D7%94%D7%91%D7%99%D7%AA%D7%94-%D7%9C%D7%9E%D7%A4%D7%93%D7%9C-%EF%B8%8F%D7%A2%D7%9D-%D7%A4%D7%AA%D7%99%D7%97%D7%AA-%D7%A9%D7%99%D7%93%D7%95%D7%A8%D7%99-%D7%94%D7%AA%D7%A2%D7%9E%D7%95%D7%9C%D7%94-%D7%A9%D7%9C-%D7%9E%D7%A2%D7%A8%D7%9B%D7%AA-%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-%D7%94%D7%A0%D7%95%D7%9B%D7%97%D7%99%D7%AA-%D7%90%D7%A0%D7%97%D7%A0%D7%95-/1722662038803378).
- NLI targeted discovery: `query: site:nli.org.il "המערך" "1984" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/newspapers/hadashot/1984/07/17/01/article/30?&), [lead 2](https://www.nli.org.il/he/newspapers/hadashot/1984/06/15/01/article/133), [lead 3](https://www.nli.org.il/ar/newspapers/hadashot/1984/05/24/01/article/67?&).

### ג — יהדות התורה אגודת ישראל

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"אגודת ישראל" "1984" (כרזה OR כרזות OR לוגו) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://he.wikipedia.org/wiki/%D7%90%D7%92%D7%95%D7%93%D7%AA_%D7%99%D7%A9%D7%A8%D7%90%D7%9C), [lead 2](https://www.idi.org.il/policy/parties-and-elections/parties/agudat-israel), [lead 3](https://www.hamichlol.org.il/%D7%90%D7%92%D7%95%D7%93%D7%AA_%D7%99%D7%A9%D7%A8%D7%90%D7%9C), [lead 4](https://www.kshare.co.il/).
- NLI targeted discovery: `query: site:nli.org.il "אגודת ישראל" "1984" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/newspapers/mar/1984/08/03/01/article/142?&), [lead 2](https://www.nli.org.il/en/archives/NNL_ARCHIVE_AL997012948087105171/NLI), [lead 3](https://www.nli.org.il/en/newspapers/hadashot/1984/05/31/01/page/14).

### רצ — התנועה לזכויות האזרח ולשלום

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"רצ" "1984" (כרזה OR כרזות OR לוגו) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/sheets/nnl_archive_al990034513270205171/NLI), [lead 2](https://www.idi.org.il/policy/parties-and-elections/elections/1984), [lead 3](https://he.wikipedia.org/wiki/%D7%A8%D7%A6), [lead 4](https://www.instagram.com/reel/DecJrDQqSL0).
- NLI targeted discovery: `query: site:nli.org.il "רצ" "1984" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/en/newspapers?a=d&d=hadashot19840717-01&l=en), [lead 2](https://www.nli.org.il/en/newspapers?a=d&d=haretz19640703-01.2.40&l=en).

### ב — חזית דתית לאומית – המזרחי הפועל המזרחי ובלתי מפלגתיים

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"מפדל" "1984" (כרזה OR כרזות OR לוגו) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.instagram.com/reel/DecJrDQqSL0), [lead 2](https://www.instagram.com/reel/Cl59l_8oi1I), [lead 3](https://www.instagram.com/reel/DMur57yOy00), [lead 4](https://www.instagram.com/reel/DMZ4Gw2RB3F).
- NLI targeted discovery: `query: site:nli.org.il "מפדל" "1984" תעמולה`
  Empty result set for this exact query.

### ו — חזית דמוקרטית לשלום ולשוויון – המפלגה הקומוניסטית הישראלית (רק״ח), פנתרים שחורים וחוגי ציבור יהודים וערבים

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"חדש" "1984" (כרזה OR כרזות OR לוגו) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.am-oved.co.il/1984_%D7%AA%D7%A8%D7%92%D7%95%D7%9D_%D7%97%D7%93%D7%A9?srsltid=AYCX9vI6dOeqZDclFG-MzPnHA9EbpQhXlvRF8Gz8nTDiB82IpZZ8PwGe), [lead 2](https://he.wikipedia.org/wiki/1984_(%D7%A1%D7%A4%D7%A8)), [lead 3](https://www.hamigdalor.co.il/item/32-22073/1984?srsltid=AYCX9vJNhQOSFjF5jQdbh6MzFLr9zSL7MGQKaOoHFci1ktOs4-LzOWiJ), [lead 4](https://www.e-vrit.co.il/product/13938/1984?srsltid=AYCX9vJSuPDKg5ngcejoEF1B2G2ksSWVzV7RtegmXXTmTNyAK_m6nhWX).
- NLI targeted discovery: `query: site:nli.org.il "חזית דמוקרטית לשלום" "1984" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/newspapers/dav/1984/06/08/01/page/2?&).

### הן — שינוי – מפלגת המרכז

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"שינוי" "1984" (כרזה OR כרזות OR לוגו) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.amazon.com/-/he/%D7%9E%D7%93%D7%94%D7%99%D7%9E%D7%94-%D7%90%D7%A8%D7%91%D7%A2%D7%99%D7%9D-%D7%95%D7%A9%D7%A0%D7%AA%D7%99%D7%99%D7%9D-%D7%A7%D7%99%D7%A9%D7%95%D7%98%D7%99-%D7%9C%D7%92%D7%91%D7%A8%D7%99%D7%9D/dp/B098PZX6RB), [lead 2](https://he.wikipedia.org/wiki/%D7%A7%D7%95%D7%91%D7%A5:1984_%D7%9B%D7%A8%D7%96%D7%94_%D7%A2%D7%91%D7%A8%D7%99%D7%AA.jpg), [lead 3](https://digital.library.ucla.edu/catalog.html?f%5Bgenre_sim%5D%5B%5D=monographic&page=1207&per_page=50&range%5Byear_isim%5D%5Bbegin%5D=1984&range%5Byear_isim%5D%5Bend%5D=1985&sort=title_alpha_numeric_ssort+desc&view=gallery), [lead 4](https://www.instagram.com/reel/DYlyJcXon6H).
- NLI targeted discovery: `query: site:nli.org.il "שינוי" "1984" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/newspapers/hadashot/1984/06/15/01/article/133), [lead 2](https://www.nli.org.il/he/newspapers/mar/1984/08/03/01/article/142?&), [lead 3](https://www.nli.org.il/he/newspapers/dav/1984/06/22/01/page/1?&).

### שס — התאחדות הספרדים שומרי תורה

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"שס" "1984" (כרזה OR כרזות OR לוגו) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%9C%D7%92%D7%AA_%D7%A9%22%D7%A1), [lead 2](https://www.facebook.com/i24NEWSHE/videos/%D7%A2%D7%9C%D7%99%D7%99%D7%AA%D7%95-%D7%95%D7%A0%D7%A4%D7%99%D7%9C%D7%AA%D7%95-%D7%A9%D7%9C-%D7%93%D7%A8%D7%A2%D7%99-%D7%90%D7%99%D7%9A-%D7%A8%D7%99%D7%A1%D7%A7-%D7%99%D7%95%D7%A8-%D7%A9%D7%A1-%D7%90%D7%AA-%D7%94%D7%9E%D7%A4%D7%9C%D7%92%D7%94-%D7%9C-6-%D7%9E%D7%A0%D7%93%D7%98%D7%99%D7%9D/2362862067851083), [lead 3](https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf), [lead 4](https://www.instagram.com/reel/DdrDHPsAiGB).
- NLI targeted discovery: `query: site:nli.org.il "שס" "1984" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/en/archives/NNL_ARCHIVE_AL997012156938605171/NLI), [lead 2](https://www.nli.org.il/he/newspapers/hadashot/1984/05/24/01).

### עי — מורשה מצ״ד – פא״י

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"מורשה" "1984" (כרזה OR כרזות OR לוגו) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.amazon.com/-/he/%D7%93%D7%98%D7%A8%D7%95%D7%99%D7%98-Shirt-Company-1972-1984-%D7%95%D7%90%D7%95%D7%AA%D7%A0%D7%98%D7%99/dp/B07R3RD5C1), [lead 2](https://www.amazon.com/-/he/Head-Case-Designs-%D7%9C-Apple-iPhone/dp/B0DGKWS5R3), [lead 3](https://www.nli.org.il/he/sheets/NNL_ARCHIVE_AL990034513450205171/NLI), [lead 4](https://www.idi.org.il/policy/parties-and-elections/elections/1984).
- NLI targeted discovery: `query: site:nli.org.il "מורשה" "1984" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/newspapers/mar/1984/08/03/01/article/142?&), [lead 2](https://www.nli.org.il/he/newspapers/dav/1984/06/22/01/page/1?&), [lead 3](https://www.nli.org.il/he/newspapers/kotert/1984/06/27/01/article/39).

### פ — הרשימה המתקדמת לשלום

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"הרשימה המתקדמת לשלום" "1984" (כרזה OR כרזות OR לוגו) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.idi.org.il/policy/parties-and-elections/parties/hareshima-hamitkademet-leshalom), [lead 2](https://www.nli.org.il/he/sheets/NNL_ARCHIVE_AL990034513320205171/NLI), [lead 3](https://www.haaretz.co.il/news/elections/hozrot), [lead 4](https://www.idi.org.il/policy/parties-and-elections/elections/1984).
- NLI targeted discovery: `query: site:nli.org.il "הרשימה המתקדמת לשלום" "1984" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/newspapers/mar/1984/08/03/01/article/142?&), [lead 2](https://www.nli.org.il/he/newspapers/hadashot/1984/07/24/01/article/51), [lead 3](https://www.nli.org.il/en/archives/nnl_archive_al990039878500205171/NLI).

### יש — אומץ – להבראת המשק

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"אומץ" "1984" (כרזה OR כרזות OR לוגו) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.themoviedb.org/movie/1884-the-ewok-adventure/images/posters?language=he-IL), [lead 2](https://www.amazon.com/-/he/Inspirational-Wall-Art-Co/dp/B0CJB2JXJY), [lead 3](https://www.idi.org.il/policy/parties-and-elections/parties/ometz), [lead 4](https://il.bidspirit.com/ui/catalog/auction/ometz/10646/3?lang=he).
- NLI targeted discovery: `query: site:nli.org.il "אומץ" "1984" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/newspapers/hadashot/1984/07/24/01/article/51), [lead 2](https://www.nli.org.il/ar/newspapers/kolhair/1989/07/14/01/page/67?&), [lead 3](https://www.nli.org.il/he/newspapers/haretz/1954/05/06/01/page/3).

### ני — תמ״י – תנועת מסורת ישראל

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"תמי" "1984" (כרזה OR כרזות OR לוגו) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.youtube.com/watch?v=awntu_8pfyM), [lead 2](https://www.facebook.com/beit.tami/posts/-%D7%9B%D7%9C-%D7%94%D7%96%D7%9E%D7%9F-%D7%9E%D7%93%D7%91%D7%A8%D7%95%D7%AA-%D7%A2%D7%9C-%D7%9E%D7%94-%D7%A9%D7%94%D7%99%D7%94-%D7%91%D7%A9%D7%99%D7%A0%D7%A7%D7%99%D7%9F-1984%D7%A2%D7%9C-%D7%94%D7%AA%D7%94%D7%9C%D7%95%D7%9B%D7%94-%D7%94%D7%A8%D7%90%D7%A9%D7%95%D7%A0%D7%94-%D7%A2%D7%9C-%D7%94%D7%A8%D7%97%D7%95%D7%91-%D7%A9%D7%94%D7%99%D7%94-%D7%A0%D7%A8%D7%90%D7%94-%D7%9B%D7%9E%D7%95/1404160028412632), [lead 3](https://www.nli.org.il/en/newspapers/kolhair/1984/06/22/01?&), [lead 4](https://he.wikipedia.org/wiki/%D7%96%D7%94%D7%95_%D7%96%D7%94!).
- NLI targeted discovery: `query: site:nli.org.il "תמי" "1984" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/en/newspapers/kolhair/1984/06/22/01?&), [lead 2](https://www.nli.org.il/ar/newspapers/hadashot/1984/05/31/01/page/14), [lead 3](https://www.nli.org.il/en/archives/nnl_archive_al990039878500205171/NLI).

### כך — תנועת כך מיסודו של הרב מאיר כהנא

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"כך" "1984" (כרזה OR כרזות OR לוגו) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://he.wikipedia.org/wiki/%D7%9B%D7%9A), [lead 2](https://www.idi.org.il/policy/parties-and-elections/parties/kach), [lead 3](https://www.instagram.com/p/De83pUIDUmT), [lead 4](https://www.gov.il/apps/elections/elections-knesset-16/heb/protocols/prot291202.html).
- NLI targeted discovery: `query: site:nli.org.il "כך" "1984" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/newspapers/hadashot/1984/07/17/01/article/30?&), [lead 2](https://www.nli.org.il/he/newspapers/hadashot/1984/06/15/01/article/133), [lead 3](https://www.nli.org.il/en/newspapers/hadashot/1984/10/05/01).

