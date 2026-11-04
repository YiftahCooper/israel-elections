# Party logos, run 2: 1977–1999

As of 4 November 2026. Scope: the 76 missing **whole-list** logos among 89
seat-winning lists in k9–k15. Existing 13 logos are preserved. Constituents are
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

## k12 · 1988

### מחל — הליכוד

**Accepted:** dated official print crop; details below.

- General discovery: `query: '"ליכוד" "1988" (כרזה OR כרזות OR לוגו) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.facebook.com/100064467291406/videos/1988-%D7%A0%D7%AA%D7%A0%D7%99%D7%94%D7%95-%D7%95%D7%91%D7%99%D7%99%D7%9C%D7%99%D7%9F-%D7%A8%D7%90%D7%A9-%D7%91%D7%A8%D7%90%D7%A9/498585077233120), [lead 2](https://cartoon.org.il/articles/%D7%9E%D7%9F-%D7%94%D7%90%D7%A8%D7%9B%D7%99%D7%95%D7%9F-%D7%A7%D7%A8%D7%99%D7%A7%D7%98%D7%95%D7%A8%D7%95%D7%AA-%D7%A0%D7%91%D7%97%D7%A8%D7%95%D7%AA-%D7%9C%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA), [lead 3](https://www.idi.org.il/articles/9401), [lead 4](https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf).
- NLI targeted discovery: `query: site:nli.org.il "ליכוד" "1988" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/newspapers/hadashot/1988/10/26/01/page/1?&), [lead 2](https://www.nli.org.il/he/newspapers/hadashot/1988/08/05/01/page/14), [lead 3](https://www.nli.org.il/he/newspapers/bamahane/1988/11/02/01/page/8).

Inspected [catalogue](https://www.jabotinsky.org/%D7%90%D7%A8%D7%9B%D7%99%D7%95%D7%9F/%D7%97%D7%99%D7%A4%D7%95%D7%A9-%D7%9E%D7%AA%D7%A7%D7%93%D7%9D/%D7%A4%D7%A8%D7%99%D7%98?itemId=36187) and [scan](https://www.infocenters.co.il/jabo/jabo_multimedia/%D7%9B%D7%A8%D7%96%D7%95%D7%AA/21/3457_0203.jpg); printed event date **1988-10-18**. Crop `[7, 370, 211, 422]` from `[324, 448]`; final `logos/likud-print-1988.png`, 20609 bytes. Original SHA-256 `e6ba475827dd43d552edb52b2f3535f35097bbcde6aa2f0eec3dc8673900b412`; final SHA-256 `a07ac95c83cd4da976ec0126674582a2191f747a299c897c60ded4518021876f`. Catalogue HTML and scan are retained at `data/raw/logos/k12/`. Fair-use identification, no free licence asserted.

### אמת — המערך

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"המערך" "1988" (כרזה OR כרזות OR לוגו) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.idi.org.il/policy/parties-and-elections/elections/1988), [lead 2](https://www.kan.org.il/content/archive1/archive_treasury/news-politics/148802), [lead 3](https://main.knesset.gov.il/mk/elections/pages/knesset26elections.aspx), [lead 4](https://he.wikipedia.org/wiki/%D7%94%D7%9E%D7%A2%D7%A8%D7%9A).
- NLI targeted discovery: `query: site:nli.org.il "המערך" "1988" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/discover/israel/elections), [lead 2](https://www.nli.org.il/ar/newspapers/hadashot/1988/08/01/01/page/14?&), [lead 3](https://www.nli.org.il/he/newspapers/hadashot/1988/10/20/01/article/82?&).

### ג — יהדות התורה המאוחדת – אגודת ישראל

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"אגודת ישראל" "1988" (כרזה OR כרזות OR לוגו) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://he.wikipedia.org/wiki/%D7%90%D7%92%D7%95%D7%93%D7%AA_%D7%99%D7%A9%D7%A8%D7%90%D7%9C), [lead 2](https://www.idi.org.il/policy/parties-and-elections/parties/agudat-israel), [lead 3](https://www.hamichlol.org.il/%D7%90%D7%92%D7%95%D7%93%D7%AA_%D7%99%D7%A9%D7%A8%D7%90%D7%9C), [lead 4](https://commons.wikimedia.org/wiki/File:Agudat_Yisrael_logo_2020.svg).
- NLI targeted discovery: `query: site:nli.org.il "אגודת ישראל" "1988" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/journals/NNL-Journals990020496580205171/NLI).

### רצ — רצ – התנועה לזכויות האזרח ולשלום

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"רצ" "1988" (כרזה OR כרזות OR לוגו) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.instagram.com/reel/DecJrDQqSL0), [lead 2](https://www.gov.il/BlobFolder/legalinfo/logosequencecomputersltd/he/8437.pdf), [lead 3](https://www.idi.org.il/policy/parties-and-elections/elections/1988), [lead 4](https://library.mevaker.gov.il/sites/DigitalLibrary/Pages/Reports/2361-1.aspx).
- NLI targeted discovery: `query: site:nli.org.il "רצ" "1988" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/newspapers/hadashot/1988/10/14/01/article/82?&), [lead 2](https://www.nli.org.il/he/newspapers/mar/1988/06/23/01), [lead 3](https://www.nli.org.il/he/newspapers/hadashot/1988/09/28/01).

### ב — מפד״ל חזית דתית לאומית, המזרחי – הפועל המזרחי

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"מפדל" "1988" (כרזה OR כרזות OR לוגו) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.instagram.com/reel/DecJrDQqSL0), [lead 2](https://www.youtube.com/watch?v=XUUc9N6x-s8), [lead 3](https://www.instagram.com/reel/DeeU32dozjL), [lead 4](https://www.walla.co.il/tags/%D7%94%D7%9E%D7%A4%D7%93%22%D7%9C).
- NLI targeted discovery: `query: site:nli.org.il "מפדל" "1988" תעמולה`
  Empty result set for this exact query.

### ו — חזית דמוקרטית לשלום ולשוויון – המפלגה הקומוניסטית הישראלית (רק״ח); פנתרים שחורים וחוגי ציבור יהודים וערבים

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"חדש" "1988" (כרזה OR כרזות OR לוגו) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.themoviedb.org/movie/10126-colors/images/posters?language=he), [lead 2](https://www.idi.org.il/policy/parties-and-elections/elections/1988), [lead 3](https://www.kan.org.il/content/dig/digital/p-976891/s1/1089900), [lead 4](https://open.spotify.com/track/3pVlcImBBhKpSkqNywUadB).
- NLI targeted discovery: `query: site:nli.org.il "חזית דמוקרטית לשלום" "1988" תעמולה`
  Empty result set for this exact query.

### הן — תנועת המרכז – שינוי (שינוי־לע״מ־המרכז הליברלי)

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"שינוי" "1988" (כרזה OR כרזות OR לוגו) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.amazon.com/-/he/%D7%9E%D7%93%D7%94%D7%99%D7%9E%D7%94-%D7%A7%D7%99%D7%A9%D7%95%D7%98%D7%99-%D7%A9%D7%9C%D7%95%D7%A9%D7%99%D7%9D-%D7%95%D7%A9%D7%9E%D7%95%D7%A0%D7%94-%D7%9C%D7%92%D7%91%D7%A8%D7%99%D7%9D/dp/B098PYQV48), [lead 2](https://www.walla.co.il/news/israel/2608242), [lead 3](https://jfc.org.il/news_journal/124269), [lead 4](https://journal.bezalel.ac.il/v1/he/article/4044).
- NLI targeted discovery: `query: site:nli.org.il "שינוי" "1988" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/discover/israel/elections), [lead 2](https://www.nli.org.il/ar/newspapers/hadashot/1988/08/01/01/page/14?&), [lead 3](https://www.nli.org.il/he/newspapers/mar/1988/09/05/01).

### שס — התאחדות הספרדים שומרי תורה – ש״ס

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"שס" "1988" (כרזה OR כרזות OR לוגו) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%9C%D7%92%D7%AA_%D7%A9%22%D7%A1), [lead 2](https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf), [lead 3](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997011437305505171/NLI), [lead 4](https://www.youtube.com/watch?v=XUUc9N6x-s8).
- NLI targeted discovery: `query: site:nli.org.il "שס" "1988" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/ar/newspapers/hadashot/1988/08/18/01?&).

### ת — התחיה

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"התחיה" "1988" (כרזה OR כרזות OR לוגו) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://library.mevaker.gov.il/sites/DigitalLibrary/Pages/Reports/2361-1.aspx), [lead 2](https://he.wikipedia.org/wiki/%D7%94%D7%AA%D7%97%D7%99%D7%94), [lead 3](https://www.idi.org.il/policy/parties-and-elections/elections/1988), [lead 4](https://arts.tau.ac.il/theater/arc/Yerushalaim).
- NLI targeted discovery: `query: site:nli.org.il "התחיה" "1988" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/newspapers/hadashot/1988/08/05/01/page/14), [lead 2](https://www.nli.org.il/he/newspapers/mar/1988/06/23/01), [lead 3](https://www.nli.org.il/he/newspapers/hadashot/1988/08/24/01?&).

### פ — הרשימה המתקדמת לשלום

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"הרשימה המתקדמת לשלום" "1988" (כרזה OR כרזות OR לוגו) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.idi.org.il/policy/parties-and-elections/parties/hareshima-hamitkademet-leshalom), [lead 2](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL990032573700205171/NLI), [lead 3](https://library.mevaker.gov.il/sites/DigitalLibrary/Pages/Reports/2361-1.aspx), [lead 4](https://www.nevo.co.il/FilesFolderPermalink.aspx?b=files&r=%D7%9E%D7%95%D7%A1%D7%93%D7%95%D7%AA+%D7%9E%D7%9E%D7%A9%D7%9C%5C%D7%9E%D7%91%D7%A7%D7%A8+%D7%94%D7%9E%D7%93%D7%99%D7%A0%D7%94%5C%D7%93%D7%95%D7%97%D7%95%D7%AA+%D7%9E%D7%99%D7%9E%D7%95%D7%9F+%D7%9E%D7%A4%D7%9C%D7%92%D7%95%D7%AA).
- NLI targeted discovery: `query: site:nli.org.il "הרשימה המתקדמת לשלום" "1988" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/newspapers/hadashot/1988/09/28/01).

### ט — מולדת

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"מולדת" "1988" (כרזה OR כרזות OR לוגו) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.idi.org.il/policy/parties-and-elections/parties/moledet), [lead 2](https://open.spotify.com/track/0SgJ1gySQ1yYD5oRI6HRbB), [lead 3](https://he.wikipedia.org/wiki/%D7%9E%D7%95%D7%9C%D7%93%D7%AA_(%D7%9E%D7%A4%D7%9C%D7%92%D7%94)), [lead 4](https://il.bidspirit.com/ui/lotPage/third-time/source/catalog/auction/25774/lot/179722/canonical?lang=he).
- NLI targeted discovery: `query: site:nli.org.il "מולדת" "1988" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/newspapers/mar/1988/02/05/01/article/141?&), [lead 2](https://www.nli.org.il/he/newspapers/hadashot/1988/08/24/01?&), [lead 3](https://www.nli.org.il/he/newspapers/hadashot/1989/05/19/01).

### עץ — אגודת החרדים – דגל התורה

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"דגל התורה" "1988" (כרזה OR כרזות OR לוגו) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.idi.org.il/policy/parties-and-elections/parties/degel-hatora), [lead 2](https://he.wikipedia.org/wiki/%D7%93%D7%92%D7%9C_%D7%94%D7%AA%D7%95%D7%A8%D7%94), [lead 3](https://library.mevaker.gov.il/sites/DigitalLibrary/Pages/Publications/418.aspx), [lead 4](https://yi.hamichlol.org.il/%D7%A8%D7%95%D7%99:%D7%93%D7%92%D7%9C_%D7%94%D7%AA%D7%95%D7%A8%D7%94).
- NLI targeted discovery: `query: site:nli.org.il "דגל התורה" "1988" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/ar/newspapers/kolhair/1988/10/28/01/article/48?&), [lead 2](https://www.nli.org.il/he/newspapers/hadashot/1988/10/25/01), [lead 3](https://www.nli.org.il/he/newspapers/hadashot/1988/08/24/01?&).

### ע — המפלגה הדמוקרטית הערבית

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"המפלגה הדמוקרטית הערבית" "1988" (כרזה OR כרזות OR לוגו)   -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.idi.org.il/policy/parties-and-elections/parties/arab-democratic-party), [lead 2](https://www.nli.org.il/he/articles/RAMBI990006340250705171/NLI), [lead 3](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997012849354405171/NLI), [lead 4](https://library.mevaker.gov.il/sites/DigitalLibrary/Pages/Reports/2353-1.aspx).
- NLI targeted discovery: `query: site:nli.org.il "המפלגה הדמוקרטית הערבית" "1988" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/articles/RAMBI990006340230705171/NLI).

### ץ — צומת – התנועה להתחדשות ציונית ובלתי מפלגתיים

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"צומת" "1988" (כרזה OR כרזות OR לוגו) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://open.spotify.com/track/0KGTDsLMPAEGlk9C0n4JU6), [lead 2](https://library.mevaker.gov.il/sites/DigitalLibrary/Pages/Reports/2353-1.aspx), [lead 3](https://www.idi.org.il/policy/parties-and-elections/parties/tzomet), [lead 4](https://hadashot.iaa.org.il/sheet_list.aspx?id=82).
- NLI targeted discovery: `query: site:nli.org.il "צומת" "1988" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/newspapers/mar/1988/02/05/01/article/141?&), [lead 2](https://www.nli.org.il/he/discover/israel/elections), [lead 3](https://www.nli.org.il/he/newspapers/mar/1988/03/25/01/page/51).

Batch k12 verification: dataset builder passed; all 26 datasets compared equal to prior commit after removing only `logo` and `builtAt`. `npx vitest run`: 57 files / 484 tests passed; `npx tsc -p tsconfig.json --noEmit`, `npx vite build`, and logo validator passed. Only the model digest was re-recorded after the comparison; other four digest families passed unchanged. 

## k13 · 1992

### אמת — העבודה בראשות רבין

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"העבודה רבין" "1992" (כרזה OR לוגו OR תעמולה) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://ashdod.muni.il/he-il/%D7%90%D7%AA%D7%A8-%D7%94%D7%A2%D7%99%D7%A8/%D7%90%D7%A8%D7%9B%D7%99%D7%95%D7%9F-%D7%97%D7%93%D7%A9%D7%95%D7%AA/%D7%97%D7%93%D7%A9%D7%95%D7%AA/2013/10/%D7%A2%D7%A6%D7%A8%D7%AA-%D7%9C%D7%94%D7%A0%D7%A6%D7%97%D7%AA-%D7%99%D7%A6%D7%97%D7%A7-%D7%A8%D7%91%D7%99%D7%9F), [lead 2](https://www.walla.co.il/news/politics/3396238), [lead 3](https://www.ynet.co.il/articles/0,7340,L-425348,00.html), [lead 4](https://fs.knesset.gov.il/12/Plenum/12_ptm_531956.pdf).
- NLI targeted discovery: `query: site:nli.org.il "העבודה רבין" "1992" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/newspapers/hadashot/1992/12/21/01/page/2), [lead 2](https://www.nli.org.il/he/newspapers/hadashot/1992/04/17/01/article/22?&), [lead 3](https://www.nli.org.il/en/newspapers/mar/1992/04/22/01/page/2?&).

### מחל — הליכוד

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"ליכוד" "1992" (כרזה OR לוגו OR תעמולה) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.facebook.com/KnessetTv/videos/%D7%99%D7%A9%D7%A8%D7%90%D7%9C-%D7%9E%D7%97%D7%9B%D7%94-%D7%9C%D7%A8%D7%91%D7%99%D7%9F-%EF%B8%8F%D7%A2%D7%9D-%D7%A4%D7%AA%D7%99%D7%97%D7%AA-%D7%A9%D7%99%D7%93%D7%95%D7%A8%D7%99-%D7%94%D7%AA%D7%A2%D7%9E%D7%95%D7%9C%D7%94-%D7%A9%D7%9C-%D7%9E%D7%A2%D7%A8%D7%9B%D7%AA-%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-%D7%94%D7%A0%D7%95%D7%9B%D7%97%D7%99%D7%AA-%D7%90%D7%A0%D7%97%D7%A0%D7%95-%D7%97%D7%95%D7%96%D7%A8%D7%99%D7%9D-/1745645527560538), [lead 2](https://www.tiktok.com/@knessettv/video/7696491262928620820), [lead 3](https://www.instagram.com/reel/DcYwoWpN-JO), [lead 4](https://www.idi.org.il/media/20997/%D7%94%D7%9E%D7%A4%D7%9C%D7%92%D7%95%D7%AA-%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C-2021-1992.pdf).
- NLI targeted discovery: `query: site:nli.org.il "ליכוד" "1992" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/ar/newspapers/hadashot/1992/04/30/01/article/6?&), [lead 2](https://www.nli.org.il/en/newspapers/mar/1992/02/16/01), [lead 3](https://www.nli.org.il/he/newspapers/hadashot/1992/05/25/01).

### ץ — צומת - התנועה להתחדשות ציונית ובלתי מפלגתיים

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"צומת" "1992" (כרזה OR לוגו OR תעמולה) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.idi.org.il/policy/parties-and-elections/elections/1992), [lead 2](https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%9C%D7%92%D7%AA_%D7%A6%D7%95%D7%9E%D7%AA), [lead 3](https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf), [lead 4](https://elections.walla.co.il/item/2581811).
- NLI targeted discovery: `query: site:nli.org.il "צומת" "1992" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/newspapers/hadashot/1992/06/26/01/page/8?&), [lead 2](https://www.nli.org.il/he/newspapers/mar/1992/01/31/01/article/301?&), [lead 3](https://www.nli.org.il/ar/newspapers/mar/1992/03/13/01/page/206).

### שס — ש״ס - התאחדות הספרדים שומרי תורה

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"שס" "1992" (כרזה OR לוגו OR תעמולה) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%9C%D7%92%D7%AA_%D7%A9%22%D7%A1), [lead 2](https://www.idi.org.il/media/20997/%D7%94%D7%9E%D7%A4%D7%9C%D7%92%D7%95%D7%AA-%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C-2021-1992.pdf), [lead 3](https://fs.knesset.gov.il/12/Plenum/12_ptm_531910.pdf), [lead 4](https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf).
- NLI targeted discovery: `query: site:nli.org.il "שס" "1992" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://blog.nli.org.il/politics), [lead 2](https://www.nli.org.il/he/newspapers/mar/1992/02/14/01/article/202.2?&).

### ב — מפד״ל חזית דתית לאומית - המזרחי הפועל המזרחי

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"מפדל" "1992" (כרזה OR לוגו OR תעמולה) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.instagram.com/reel/DeeXK3vKF0K), [lead 2](https://www.instagram.com/reel/Decb20IhxK5), [lead 3](https://www.instagram.com/reel/DecJrDQqSL0), [lead 4](https://library.mevaker.gov.il/sites/DigitalLibrary/Documents/primaries/2009-Keneset18-Makdimot-Dec18/2009-Makdimot-Knesset18-Report.pdf).
- NLI targeted discovery: `query: site:nli.org.il "מפדל" "1992" תעמולה`
  Empty result set for this exact query.

### ג — יהדות התורה המאוחדת - אגודת ישראל - דגל התורה - הרב יצחק פרץ

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"יהדות התורה" "1992" (כרזה OR לוגו OR תעמולה) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://he.wikipedia.org/wiki/%D7%99%D7%94%D7%93%D7%95%D7%AA_%D7%94%D7%AA%D7%95%D7%A8%D7%94), [lead 2](https://www.idi.org.il/policy/parties-and-elections/parties/yahadut-hatorah), [lead 3](https://www.c14.co.il/article/1764484), [lead 4](https://library.mevaker.gov.il/sites/DigitalLibrary/Pages/Reports/2314-1.aspx).
- NLI targeted discovery: `query: site:nli.org.il "יהדות התורה" "1992" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/ar/newspapers/mar/1992/02/28/01/article/237?&), [lead 2](https://www.nli.org.il/en/newspapers?a=d&d=mar19920228-01.1.100&l=en).

### ו — חזית דמוקרטית לשלום ולשוויון - המפלגה הקומוניסטית הישראלית וחוגי ציבור יהודים וערבים

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"חדש" "1992" (כרזה OR לוגו OR תעמולה) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.idi.org.il/policy/parties-and-elections/elections/1992), [lead 2](https://www.nevo.co.il/law_html/law00/72887.htm), [lead 3](https://www.zman.co.il/718660), [lead 4](https://www.instagram.com/reel/Decb20IhxK5).
- NLI targeted discovery: `query: site:nli.org.il "חזית דמוקרטית לשלום" "1992" תעמולה`
  Empty result set for this exact query.

### ט — מולדת

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"מולדת" "1992" (כרזה OR לוגו OR תעמולה) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.facebook.com/KnessetTv/videos/%D7%99%D7%A9%D7%A8%D7%90%D7%9C-%D7%9E%D7%97%D7%9B%D7%94-%D7%9C%D7%A8%D7%91%D7%99%D7%9F-%EF%B8%8F%D7%A2%D7%9D-%D7%A4%D7%AA%D7%99%D7%97%D7%AA-%D7%A9%D7%99%D7%93%D7%95%D7%A8%D7%99-%D7%94%D7%AA%D7%A2%D7%9E%D7%95%D7%9C%D7%94-%D7%A9%D7%9C-%D7%9E%D7%A2%D7%A8%D7%9B%D7%AA-%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-%D7%94%D7%A0%D7%95%D7%9B%D7%97%D7%99%D7%AA-%D7%90%D7%A0%D7%97%D7%A0%D7%95-%D7%97%D7%95%D7%96%D7%A8%D7%99%D7%9D-/1745645527560538), [lead 2](https://he.wikipedia.org/wiki/%D7%9E%D7%95%D7%9C%D7%93%D7%AA_(%D7%9E%D7%A4%D7%9C%D7%92%D7%94)), [lead 3](https://www.idi.org.il/policy/parties-and-elections/parties/moledet), [lead 4](https://elections.walla.co.il/item/2581811).
- NLI targeted discovery: `query: site:nli.org.il "מולדת" "1992" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/en/archives/NNL_ARCHIVE_AL997012156954105171/NLI), [lead 2](https://www.nli.org.il/en/newspapers/hbkr/1947/01/12/01/page/1?&).

### ע — המפלגה הדמוקרטית הערבית

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"המפלגה הדמוקרטית הערבית" "1992" (כרזה OR לוגו OR תעמולה)   -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.idi.org.il/policy/parties-and-elections/parties/arab-democratic-party), [lead 2](https://dayan.org/file-download/download/public/16324), [lead 3](https://fs.knesset.gov.il/12/Plenum/12_ptm_531910.pdf), [lead 4](https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%9C%D7%92%D7%95%D7%AA_%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C).
- NLI targeted discovery: `query: site:nli.org.il "המפלגה הדמוקרטית הערבית" "1992" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/newspapers/hadashot/1992/04/17/01/page/70?&), [lead 2](https://www.nli.org.il/he/newspapers/hadashot/1992/04/17/01/article/143?&).

Batch k13 verification: dataset builder passed; all 26 datasets compared equal to prior commit after removing only `logo` and `builtAt`. `npx vitest run`: 57 files / 484 tests passed; `npx tsc -p tsconfig.json --noEmit`, `npx vite build`, and logo validator passed. No logo or digest changed in this batch. 

## k14 · 1996

### אמת — העבודה

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"העבודה" "1996" (כרזה OR לוגו OR תעמולה) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%90%D7%A8%D7%91%D7%A2_%D7%A2%D7%A9%D7%A8%D7%94_%D7%95%D7%9C%D7%A8%D7%90%D7%A9%D7%95%D7%AA_%D7%94%D7%9E%D7%9E%D7%A9%D7%9C%D7%94), [lead 2](https://www.tiktok.com/@knessettv/video/7120232409597086977), [lead 3](https://www.idi.org.il/policy/parties-and-elections/elections/1996), [lead 4](https://elections.walla.co.il/item/2581858).
- NLI targeted discovery: `query: site:nli.org.il "העבודה" "1996" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997013034403305171/NLI), [lead 2](https://www.nli.org.il/he/newspapers/dav/1952/07/25/01/page/4?&), [lead 3](https://blog.nli.org.il/chov-yanait-aharonson).

### שס — ש״ס התאחדות הספרדים העולמית שומרי תורה

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"שס" "1996" (כרזה OR לוגו OR תעמולה) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%90%D7%A8%D7%91%D7%A2_%D7%A2%D7%A9%D7%A8%D7%94_%D7%95%D7%9C%D7%A8%D7%90%D7%A9%D7%95%D7%AA_%D7%94%D7%9E%D7%9E%D7%A9%D7%9C%D7%94), [lead 2](https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf), [lead 3](https://fs.knesset.gov.il/20/Committees/20_cs_bg_502730.pdf), [lead 4](https://www.haifa.ac.il/2026/10/26/%D7%9B%D7%9B%D7%94-%D7%A0%D7%A8%D7%90%D7%95-%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-%D7%A4%D7%A2%D7%9D-%D7%AA%D7%9E%D7%95%D7%A0%D7%95%D7%AA-%D7%9E%D7%94%D7%90%D7%95%D7%A1%D7%A4%D7%99%D7%9D-%D7%94).
- NLI targeted discovery: `query: site:nli.org.il "שס" "1996" תעמולה`
  Empty result set for this exact query.

### ב — מפד״ל המפלגה הדתית לאומית המזרחי - הפועל המזרחי

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"מפדל" "1996" (כרזה OR לוגו OR תעמולה) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.instagram.com/reel/DecJrDQqSL0), [lead 2](https://dayan.org/he/file-download/download/public/16411), [lead 3](https://library.mevaker.gov.il/sites/DigitalLibrary/Documents/mekomiyot/mekomiyot_2008-1989/1999-RashuyotNov98/1999-RashuyotNov98-Full.pdf), [lead 4](https://www.makorrishon.co.il/nrg/online/1/ART1/053/325.html).
- NLI targeted discovery: `query: site:nli.org.il "מפדל" "1996" תעמולה`
  Empty result set for this exact query.

### מרצ — מרצ - ישראל הדמוקרטית רצ מפם שינוי

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"מרצ" "1996" (כרזה OR לוגו OR תעמולה) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.idi.org.il/policy/parties-and-elections/parties/meretz), [lead 2](https://he.wikipedia.org/wiki/%D7%9E%D7%A8%D7%A6), [lead 3](https://www.facebook.com/Meretz/posts/%D7%9B%D7%A8%D7%96%D7%94-%D7%A9%D7%9C-%D7%9E%D7%A8%D7%A6-%D7%9E-1996-%D7%A2%D7%93%D7%99%D7%99%D7%9F-%D7%A8%D7%9C%D7%95%D7%95%D7%A0%D7%98%D7%99-%D7%9E%D7%93%D7%99/10157493256653128), [lead 4](https://www.youtube.com/playlist?list=PLjesnSVT_Ghy61hMTfpSQCErcwHLiYh6f).
- NLI targeted discovery: `query: site:nli.org.il "מרצ" "1996" תעמולה`
  Empty result set for this exact query.

### כן — ישראל בעליה בראשותו של נתן שרנסקי

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"ישראל בעליה" "1996" (כרזה OR לוגו OR תעמולה) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://he.wikipedia.org/wiki/%D7%99%D7%A9%D7%A8%D7%90%D7%9C_%D7%91%D7%A2%D7%9C%D7%99%D7%94), [lead 2](https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%90%D7%A8%D7%91%D7%A2_%D7%A2%D7%A9%D7%A8%D7%94_%D7%95%D7%9C%D7%A8%D7%90%D7%A9%D7%95%D7%AA_%D7%94%D7%9E%D7%9E%D7%A9%D7%9C%D7%94), [lead 3](https://www.hamichlol.org.il/%D7%99%D7%A9%D7%A8%D7%90%D7%9C_%D7%91%D7%A2%D7%9C%D7%99%D7%94), [lead 4](https://library.mevaker.gov.il/sites/DigitalLibrary/Pages/Reports/1996-1.aspx).
- NLI targeted discovery: `query: site:nli.org.il "ישראל בעליה" "1996" תעמולה`
  Empty result set for this exact query.

### ו — חזית דמוקרטית לשלום ולשוויון (המפלגה הקומוניסטית הישראלית וחוגי ציבור יהודים וערבים) והברית הלאומית הדמוקרטית

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"חדש בלד" "1996" (כרזה OR לוגו OR תעמולה) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.idi.org.il/policy/parties-and-elections/parties/balad), [lead 2](https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%90%D7%A8%D7%91%D7%A2_%D7%A2%D7%A9%D7%A8%D7%94_%D7%95%D7%9C%D7%A8%D7%90%D7%A9%D7%95%D7%AA_%D7%94%D7%9E%D7%9E%D7%A9%D7%9C%D7%94), [lead 3](https://dayan.org/file-download/download/public/16324), [lead 4](https://www.kan.org.il/content/kan-news/politic/250926).
- NLI targeted discovery: `query: site:nli.org.il "חדש בלד" "1996" תעמולה`
  Empty result set for this exact query.

### ג — יהדות התורה המאוחדת אגודת ישראל - דגל התורה

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"יהדות התורה" "1996" (כרזה OR לוגו OR תעמולה) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.idi.org.il/policy/parties-and-elections/parties/yahadut-hatorah), [lead 2](https://he.wikipedia.org/wiki/%D7%99%D7%94%D7%93%D7%95%D7%AA_%D7%94%D7%AA%D7%95%D7%A8%D7%94), [lead 3](https://elections.walla.co.il/item/2581858), [lead 4](https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf).
- NLI targeted discovery: `query: site:nli.org.il "יהדות התורה" "1996" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997013034400705171/NLI).

### ע — המפלגה הדמוקרטית הערבית - הרשימה הערבית המאוחדת

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"הרשימה הערבית המאוחדת" "1996" (כרזה OR לוגו OR תעמולה)   -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.ariel.ac.il/wp/middle-east/blog/%D7%A4%D7%A2%D7%99%D7%9C%D7%95%D7%AA-%D7%94%D7%9B%D7%A0%D7%A1%D7%AA-%D7%A9%D7%9C-%D7%94%D7%A8%D7%A9%D7%99%D7%9E%D7%94-%D7%94%D7%A2%D7%A8%D7%91%D7%99%D7%AA-%D7%94%D7%9E%D7%90%D7%95%D7%97%D7%93%D7%AA), [lead 2](https://he.wikipedia.org/wiki/%D7%94%D7%A8%D7%A9%D7%99%D7%9E%D7%94_%D7%94%D7%A2%D7%A8%D7%91%D7%99%D7%AA_%D7%94%D7%9E%D7%90%D7%95%D7%97%D7%93%D7%AA), [lead 3](https://www.idi.org.il/policy/parties-and-elections/parties/raam), [lead 4](https://www.gov.il/BlobFolder/guide/candidates-lists-26/he/pr5_26_annex.pdf).
- NLI targeted discovery: `query: site:nli.org.il "הרשימה הערבית המאוחדת" "1996" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/journals/NNL-Journals990020496580205171/NLI).

### ט — מולדת

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"מולדת" "1996" (כרזה OR לוגו OR תעמולה) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%90%D7%A8%D7%91%D7%A2_%D7%A2%D7%A9%D7%A8%D7%94_%D7%95%D7%9C%D7%A8%D7%90%D7%A9%D7%95%D7%AA_%D7%94%D7%9E%D7%9E%D7%A9%D7%9C%D7%94), [lead 2](https://www.idi.org.il/policy/parties-and-elections/parties/moledet), [lead 3](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997012156953705171/NLI), [lead 4](https://open.spotify.com/track/4S3WkqUjzMBsSaybPHT91w).
- NLI targeted discovery: `query: site:nli.org.il "מולדת" "1996" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/en/items/NNL_MUSIC_AL990036589260205171).

Batch k14 verification: dataset builder passed; all 26 datasets compared equal to prior commit after removing only `logo` and `builtAt`. `npx vitest run`: 57 files / 484 tests passed; `npx tsc -p tsconfig.json --noEmit`, `npx vite build`, and logo validator passed. No logo or digest changed in this batch. 

## k15 · 1999

### אמת — ישראל אחת בראשות אהוד ברק - העבודה גשר מימד

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"ישראל אחת" "1999" (כרזה OR לוגו OR תעמולה) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.idi.org.il/policy/parties-and-elections/elections/1999), [lead 2](https://www.maariv.co.il/news/elections-2026/article-1380141), [lead 3](https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA), [lead 4](https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf).
- NLI targeted discovery: `query: site:nli.org.il "ישראל אחת" "1999" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/en/archives/NNL_ARCHIVE_AL997012156936905171/NLI), [lead 2](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997012156936905171/NLI).

### מחל — הליכוד בראשות בנימין נתניהו

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"ליכוד" "1999" (כרזה OR לוגו OR תעמולה) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.likud.org.il/%D7%A2%D7%9C-%D7%94%D7%9C%D7%99%D7%9B%D7%95%D7%93/%D7%94%D7%94%D7%99%D7%A1%D7%98%D7%95%D7%A8%D7%99%D7%94-%D7%A9%D7%9C-%D7%94%D7%AA%D7%A0%D7%95%D7%A2%D7%94), [lead 2](https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf), [lead 3](https://www.facebook.com/KnessetTv/videos/%D7%A9%D7%9E%D7%A2%D7%AA%D7%99-%D7%90%D7%AA-%D7%94%D7%9E%D7%99%D7%9C%D7%94-%D7%9C%D7%99%D7%9B%D7%95%D7%93-%D7%95%D7%A7%D7%99%D7%91%D7%9C%D7%AA%D7%99-%D7%97%D7%A8%D7%A8%D7%94%D7%9E%D7%A0%D7%94%D7%9C-%D7%A7%D7%9E%D7%A4%D7%99%D7%99%D7%9F-%D7%94%D7%9C%D7%99%D7%9B%D7%95%D7%93-%D7%91-1981-%D7%A6%D7%91%D7%99-%D7%A4%D7%A8%D7%99%D7%93%D7%9E%D7%9F-%D7%A9%D7%99%D7%A9%D7%A7%D7%95-%D7%91%D7%95%D7%95%D7%99/28113379411658246), [lead 4](https://www.idi.org.il/articles/3093).
- NLI targeted discovery: `query: site:nli.org.il "ליכוד" "1999" תעמולה`
  Empty result set for this exact query.

### שס — ש״ס התאחדות הספרדים העולמית שומרי תורה

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"שס" "1999" (כרזה OR לוגו OR תעמולה) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf), [lead 2](https://www.instagram.com/reel/DcYTNYNyg6t), [lead 3](https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%9C%D7%92%D7%AA_%D7%A9%22%D7%A1), [lead 4](https://digital.library.ucla.edu/catalog.html?f%5Bhuman_readable_language_sim%5D%5B%5D=English&page=4&per_page=100&range%5Byear_isim%5D%5Bbegin%5D=1999&range%5Byear_isim%5D%5Bend%5D=1999&sort=title_alpha_numeric_ssort+asc&view=gallery).
- NLI targeted discovery: `query: site:nli.org.il "שס" "1999" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997013034850705171/NLI).

### מרצ — מרצ ישראל הדמוקרטית

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"מרצ" "1999" (כרזה OR לוגו OR תעמולה) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.idi.org.il/policy/parties-and-elections/parties/meretz), [lead 2](https://he.wikipedia.org/wiki/%D7%9E%D7%A8%D7%A6), [lead 3](https://www.idi.org.il/policy/parties-and-elections/elections/1999), [lead 4](https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf).
- NLI targeted discovery: `query: site:nli.org.il "מרצ" "1999" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/ar/archives/NNL_ARCHIVE_AL997012156951705171/NLI), [lead 2](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997013034862105171/NLI), [lead 3](https://www.nli.org.il/en/archives/NNL_ARCHIVE_AL997012156961105171/NLI).

### כן — ישראל בעליה בראשות נתן שרנסקי

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"ישראל בעליה" "1999" (כרזה OR לוגו OR תעמולה) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://he.wikipedia.org/wiki/%D7%99%D7%A9%D7%A8%D7%90%D7%9C_%D7%91%D7%A2%D7%9C%D7%99%D7%94), [lead 2](https://www.hamichlol.org.il/%D7%99%D7%A9%D7%A8%D7%90%D7%9C_%D7%91%D7%A2%D7%9C%D7%99%D7%94), [lead 3](https://library.mevaker.gov.il/sites/DigitalLibrary/Pages/Reports/1751-2.aspx), [lead 4](https://www.ynet.co.il/articles/0,7340,L-5046288,00.html).
- NLI targeted discovery: `query: site:nli.org.il "ישראל בעליה" "1999" תעמולה`
  Empty result set for this exact query.

### יש — שינוי - התנועה החילונית בראשות לפיד ופורז

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"שינוי" "1999" (כרזה OR לוגו OR תעמולה) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%9C%D7%92%D7%AA_%D7%A9%D7%99%D7%A0%D7%95%D7%99), [lead 2](https://www.idi.org.il/policy/parties-and-elections/parties/shinui), [lead 3](https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf), [lead 4](https://www.kan.org.il/content/archive1/archivemusic/p-671187/678812).
- NLI targeted discovery: `query: site:nli.org.il "שינוי" "1999" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997012156949805171/NLI), [lead 2](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997012156936905171/NLI), [lead 3](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997012156952105171/NLI).

### ב — המפד״ל - המפלגה הדתית לאומית המזרחי - הפועל המזרחי

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"מפדל" "1999" (כרזה OR לוגו OR תעמולה) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://library.mevaker.gov.il/sites/DigitalLibrary/Documents/mekomiyot/mekomiyot_2008-1989/1999-RashuyotNov98/1999-RashuyotNov98-Full.pdf), [lead 2](https://dayan.org/he/file-download/download/public/16411), [lead 3](https://www.walla.co.il/tags/%D7%94%D7%9E%D7%A4%D7%93%22%D7%9C), [lead 4](https://hebrew.alibaba.com/product-detail/High-quality-Custom-Logo-Graphite-Pickleball-1601364092328.html).
- NLI targeted discovery: `query: site:nli.org.il "מפדל" "1999" תעמולה`
  Empty result set for this exact query.

### ג — יהדות התורה המאוחדת והשבת אגודת ישראל - דגל התורה

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"יהדות התורה" "1999" (כרזה OR לוגו OR תעמולה) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://he.wikipedia.org/wiki/%D7%99%D7%94%D7%93%D7%95%D7%AA_%D7%94%D7%AA%D7%95%D7%A8%D7%94), [lead 2](https://www.idi.org.il/policy/parties-and-elections/parties/yahadut-hatorah), [lead 3](https://digital.library.ucla.edu/catalog?f%5Bsubject_sim%5D%5B%5D=%D7%99%D7%94%D7%93%D7%95%D7%AA+%D7%94%D7%AA%D7%95%D7%A8%D7%94+%D7%94%D7%9E%D7%90%D7%95%D7%97%D7%93%D7%AA+-+%D7%90%D7%92%D7%95%D7%93%D7%AA+%D7%99%D7%A9%D7%A8%D7%90%D7%9C+%D7%93%D7%92%D7%9C+%D7%94%D7%AA%D7%95%D7%A8%D7%94&per_page=10&range%5Byear_isim%5D%5Bbegin%5D=1800&range%5Byear_isim%5D%5Bend%5D=1999), [lead 4](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997012156926305171/NLI).
- NLI targeted discovery: `query: site:nli.org.il "יהדות התורה" "1999" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997012156926305171/NLI), [lead 2](https://www.nli.org.il/en/archives/NNL_ARCHIVE_AL997013034870405171/NLI), [lead 3](https://www.nli.org.il/he/images/NNL_ARCHIVE_AL997009325878305171/NLI).

### עם — הרשימה הערבית המאוחדת

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"הרשימה הערבית המאוחדת" "1999" (כרזה OR לוגו OR תעמולה)   -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://he.wikipedia.org/wiki/%D7%94%D7%A8%D7%A9%D7%99%D7%9E%D7%94_%D7%94%D7%A2%D7%A8%D7%91%D7%99%D7%AA_%D7%94%D7%9E%D7%90%D7%95%D7%97%D7%93%D7%AA), [lead 2](https://www.gov.il/BlobFolder/guide/candidates-lists-26/he/pr5_26_annex.pdf), [lead 3](https://www.idi.org.il/policy/parties-and-elections/parties/raam), [lead 4](https://dayan.org/he/file-download/download/public/16411).
- NLI targeted discovery: `query: site:nli.org.il "הרשימה הערבית המאוחדת" "1999" תעמולה`
  Empty result set for this exact query.

### ו — חזית דמוקרטית לשלום ולשוויון - חד״ש (המפלגה הקומוניסטית הישראלית וחוגי ציבור יהודים וערבים)

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"חדש" "1999" (כרזה OR לוגו OR תעמולה) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.kan.org.il/content/kan/kan-11/p-13736/%D7%AA%D7%95%D7%A6%D7%90%D7%95%D7%AA-%D7%90%D7%9E%D7%AA-%D7%A4%D7%A8%D7%A7%D7%99%D7%9D-%D7%9E%D7%9C%D7%90%D7%99%D7%9D/110394), [lead 2](https://www.idi.org.il/policy/parties-and-elections/elections/1999), [lead 3](https://www.facebook.com/AmitSegalNews/videos/%D7%95%D7%94%D7%99%D7%95%D7%9D-%D7%91%D7%A4%D7%99%D7%A0%D7%94-%D7%A9%D7%97%D7%95%D7%96%D7%A8%D7%AA-%D7%90%D7%9C-%D7%94%D7%94%D7%99%D7%A1%D7%98%D7%95%D7%A8%D7%99%D7%94-%D7%A9%D7%9C-%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-%D7%9E%D7%94-%D7%9E%D7%A9%D7%95%D7%AA%D7%A3-%D7%9C%D7%94%D7%A4%D7%A1%D7%93%D7%99%D7%9D-%D7%A9%D7%9C-%D7%A0%D7%AA%D7%A0%D7%99%D7%94%D7%95-%D7%95%D7%90%D7%99%D7%9A-%D7%94%D7%A6%D7%9C%D7%99%D7%97/4162291357403722), [lead 4](https://www.amazon.com/-/he/College-Flags-Banners-Kentucky-Wildcats/dp/B07NCB25R7).
- NLI targeted discovery: `query: site:nli.org.il "חזית דמוקרטית לשלום" "1999" תעמולה`
  Empty result set for this exact query.

### ל — ישראל ביתנו בראשות אביגדור ליברמן

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"ישראל ביתנו" "1999" (כרזה OR לוגו OR תעמולה) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://he.wikipedia.org/wiki/%D7%99%D7%A9%D7%A8%D7%90%D7%9C_%D7%91%D7%99%D7%AA%D7%A0%D7%95), [lead 2](https://il.bidspirit.com/ui/lotPage/kedmatdena/source/catalog/auction/78308/lot/143180/%D7%90%D7%95%D7%A1%D7%A3-%D7%97%D7%95%D7%9E%D7%A8%D7%99-%D7%AA%D7%A2%D7%9E%D7%95%D7%9C%D7%94-%D7%A4%D7%95%D7%9C%D7%99%D7%98%D7%99%D7%99%D7%9D-%D7%9E%D7%A8%D7%90%D7%A9%D7%99%D7%AA%D7%94?lang=en), [lead 3](https://www.idi.org.il/policy/parties-and-elections/parties/yisrael-beytenu), [lead 4](https://www.facebook.com/The.Israel.Democracy.Institute/posts/%D7%99%D7%9E%D7%99%D7%9F-%D7%A9%D7%9E%D7%90%D7%9C-%D7%90%D7%95-%D7%A9%D7%91%D7%9B%D7%9C%D7%9C-%D7%9E%D7%A8%D7%9B%D7%96%D7%9B%D7%9E%D7%94-%D7%A2%D7%95%D7%91%D7%93%D7%95%D7%AA-%D7%A2%D7%9C-%D7%9E%D7%A4%D7%9C%D7%92%D7%AA-%D7%99%D7%A9%D7%A8%D7%90%D7%9C-%D7%91%D7%99%D7%AA%D7%A0%D7%951-%D7%94%D7%9E%D7%A4%D7%9C%D7%92%D7%94-%D7%94%D7%95%D7%A7%D7%9E%D7%94-%D7%91%D7%A9%D7%A0%D7%AA-1999-%D7%A2/3061554607190754).
- NLI targeted discovery: `query: site:nli.org.il "ישראל ביתנו" "1999" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997012156949805171/NLI), [lead 2](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997012156937105171/NLI), [lead 3](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997013034866205171/NLI).

### ד — אלתג׳מע אלוטני אלדימוקרטי (בל״ד)

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"בלד" "1999" (כרזה OR לוגו OR תעמולה) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.nevo.co.il/FilesFolderPermalink.aspx?b=files&r=%D7%9E%D7%95%D7%A1%D7%93%D7%95%D7%AA+%D7%9E%D7%9E%D7%A9%D7%9C%5C%D7%9E%D7%91%D7%A7%D7%A8+%D7%94%D7%9E%D7%93%D7%99%D7%A0%D7%94%5C%D7%93%D7%95%D7%97%D7%95%D7%AA+%D7%9E%D7%99%D7%9E%D7%95%D7%9F+%D7%9E%D7%A4%D7%9C%D7%92%D7%95%D7%AA), [lead 2](https://library.mevaker.gov.il/sites/DigitalLibrary/Documents/mekomiyot/mekomiyot_2008-1989/1999-RashuyotNov98/1999-RashuyotNov98-Full.pdf), [lead 3](https://www.nli.org.il/he/items/NNL_MUSIC_AL997008900638405171/NLI), [lead 4](https://www.ynet.co.il/news/election2022/article/ryg84urno).
- NLI targeted discovery: `query: site:nli.org.il "בלד" "1999" תעמולה`
  Empty result set for this exact query.

### ם — עם אחד בראשות עמיר פרץ - סיעת העובדים והגימלאים בישראל

**Open gap:** campaign-specific original artwork not verified/acquired. No absence finding.

- General discovery: `query: '"עם אחד" "1999" (כרזה OR לוגו OR תעמולה) -site:en.wikipedia.org'`
  Returned locators (snippet inspection only): [lead 1](https://www.idi.org.il/policy/parties-and-elections/parties/am-ehad), [lead 2](https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%9C%D7%92%D7%AA_%D7%94%D7%A2%D7%91%D7%95%D7%93%D7%94_%D7%94%D7%99%D7%A9%D7%A8%D7%90%D7%9C%D7%99%D7%AA), [lead 3](https://dayan.org/he/file-download/download/public/16411), [lead 4](https://www.ynet.co.il/entertainment/article/hj7nqux3ge).
- NLI targeted discovery: `query: site:nli.org.il "עם אחד" "1999" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997012156949805171/NLI).

Batch k15 verification: dataset builder passed; all 26 datasets compared equal to prior commit after removing only `logo` and `builtAt`. `npx vitest run`: 57 files / 484 tests passed; `npx tsc -p tsconfig.json --noEmit`, `npx vite build`, and logo validator passed. No logo or digest changed in this batch. 

## Supplemental searches and inspected candidate exclusions

The following are additional attempts, not replacements for the 152 identity-specific
queries above. One general k9 Independent Liberals query timed out (500 / 5000 ms);
its targeted query returned locators. Two overlarge initial calls failed validation
and were reissued in legal batches. At the end, five additional Shas punctuation
queries (`"ש״ס" "YEAR" "כרזה"`, YEAR = 1984, 1988, 1992, 1996, 1999) all failed
with Jina “This key is out of quota”. They are **failed attempts**, not empty searches.
No Apify search was used; the authorized Apify scope was specific-file download only.

Inspected Commons pages (one community evidence family per file):

- [Maarach1988.svg](https://commons.wikimedia.org/w/index.php?title=File:Maarach1988.svg&oldid=1201851903):
  caption identifies 1988, but source is own work, dated 31 January 2026. No official
  campaign original is cited. Not accepted under this run's official-origin requirement.
- [Morasha.png](https://commons.wikimedia.org/w/index.php?title=File:Morasha.png&oldid=1004024699):
  CC BY-SA 4.0, caption spans 1984–1988, credited legacy NLI 700127850. Current 1984
  folder lead was found, but the dated original was not inspected. No promotion.
- [Israel First.png](https://commons.wikimedia.org/wiki/File:Israel_First.png):
  describes a June 2026 party mark, not Israel One's 1999 joint-list lockup. Rejected
  identity substitution despite superficially similar English name.

Supplemental exact discovery queries and returned locators (snippet-only):

- `query: '"מפד״ל" "1977" כרזה'`: [lead 1](https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%93%22%D7%9C), [lead 2](https://jewish-faculty.biu.ac.il/files/jewish-faculty/shared/record_group_003_0.pdf), [lead 3](https://www.idi.org.il/policy/parties-and-elections/elections/1977).
- `query: '"מפד״ל" "1981" כרזה'`: [lead 1](https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%93%22%D7%9C), [lead 2](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997012156938005171/NLI), [lead 3](https://jewish-faculty.biu.ac.il/files/jewish-faculty/shared/record_group_003_0.pdf).
- `query: '"מפד״ל" "1984" כרזה'`: [lead 1](https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%93%22%D7%9C), [lead 2](https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%90%D7%97%D7%AA_%D7%A2%D7%A9%D7%A8%D7%94), [lead 3](https://jewish-faculty.biu.ac.il/files/jewish-faculty/shared/record_group_003_0.pdf).
- `query: '"מפד״ל" "1988" כרזה'`: [lead 1](https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%93%22%D7%9C), [lead 2](https://www.youtube.com/watch?v=ryep4UfhxBs), [lead 3](https://jewish-faculty.biu.ac.il/files/jewish-faculty/shared/record_group_003_0.pdf).
- `query: '"מפד״ל" "1992" כרזה'`: [lead 1](https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%93%22%D7%9C), [lead 2](https://jewish-faculty.biu.ac.il/files/jewish-faculty/shared/record_group_003_0.pdf), [lead 3](https://www.idi.org.il/media/20997/%D7%94%D7%9E%D7%A4%D7%9C%D7%92%D7%95%D7%AA-%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C-2021-1992.pdf).
- `query: '"מפד״ל" "1996" כרזה'`: [lead 1](https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%93%22%D7%9C), [lead 2](https://www.facebook.com/AmitSegalNews/videos/%D7%95%D7%94%D7%99%D7%95%D7%9D-%D7%91%D7%A4%D7%99%D7%A0%D7%94-%D7%A9%D7%97%D7%95%D7%96%D7%A8%D7%AA-%D7%90%D7%9C-%D7%94%D7%94%D7%99%D7%A1%D7%98%D7%95%D7%A8%D7%99%D7%94-%D7%A9%D7%9C-%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-%D7%9E%D7%94-%D7%9E%D7%A9%D7%95%D7%AA%D7%A3-%D7%9C%D7%94%D7%A4%D7%A1%D7%93%D7%99%D7%9D-%D7%A9%D7%9C-%D7%A0%D7%AA%D7%A0%D7%99%D7%94%D7%95-%D7%95%D7%90%D7%99%D7%9A-%D7%94%D7%A6%D7%9C%D7%99%D7%97/4162291357403722), [lead 3](https://digital.library.ucla.edu/catalog.html?f%5Bgenre_sim%5D%5B%5D=government+publication&page=5966&per_page=10&range%5Byear_isim%5D%5Bbegin%5D=1996&range%5Byear_isim%5D%5Bend%5D=1997&sort=date_dtsort+desc&view=list).
- `query: '"מפד״ל" "1999" כרזה'`: [lead 1](https://he.wikipedia.org/wiki/%D7%94%D7%90%D7%99%D7%97%D7%95%D7%93_%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99-%D7%9E%D7%A4%D7%93%22%D7%9C), [lead 2](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997012156938005171/NLI), [lead 3](https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%93%22%D7%9C).
- `query: '"מפלגת העבודה" "1992" "כרזה"'`: [lead 1](https://www.maariv.co.il/news/elections-2026/article-1380141), [lead 2](https://www.facebook.com/lavonins/posts/%D7%94%D7%99%D7%95%D7%9D-%D7%A2%D7%A4-%D7%94%D7%AA%D7%90%D7%A8%D7%99%D7%9A-%D7%94%D7%A2%D7%91%D7%A8%D7%99-%D7%9E%D7%A6%D7%95%D7%99%D7%99%D7%9F-28-%D7%A9%D7%A0%D7%94-%D7%9C%D7%94%D7%9E%D7%94%D7%A4%D7%9A-%D7%94%D7%A9%D7%A0%D7%99-%D7%91%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA-%D7%94-13-%D7%91%D7%99%D7%95%D7%A0%D7%99-1992-%D7%94%D7%95%D7%91/1202123136794807), [lead 3](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997012156953705171/NLI).
- `query: '"חד״ש" "1977" "כרזה"'`: [lead 1](https://he.wikipedia.org/wiki/%D7%94%D7%9E%D7%A4%D7%9C%D7%92%D7%94_%D7%94%D7%A7%D7%95%D7%9E%D7%95%D7%A0%D7%99%D7%A1%D7%98%D7%99%D7%AA_%D7%94%D7%99%D7%A9%D7%A8%D7%90%D7%9C%D7%99%D7%AA), [lead 2](https://www.hamichlol.org.il/%D7%94%D7%9E%D7%A4%D7%9C%D7%92%D7%94_%D7%94%D7%A7%D7%95%D7%9E%D7%95%D7%A0%D7%99%D7%A1%D7%98%D7%99%D7%AA_%D7%94%D7%99%D7%A9%D7%A8%D7%90%D7%9C%D7%99%D7%AA), [lead 3](https://maki.org.il/he/wp-content/uploads/2019/01/G04_2019.pdf).
- `query: '"חד״ש" "1996" "כרזה"'`: [lead 1](https://he.wikipedia.org/wiki/%D7%94%D7%9E%D7%A4%D7%9C%D7%92%D7%94_%D7%94%D7%A7%D7%95%D7%9E%D7%95%D7%A0%D7%99%D7%A1%D7%98%D7%99%D7%AA_%D7%94%D7%99%D7%A9%D7%A8%D7%90%D7%9C%D7%99%D7%AA), [lead 2](https://digital.library.ucla.edu/catalog.html?f%5Bcombined_subject_ssim%5D%5B%5D=Candidates+and+lists&f%5Bgenre_sim%5D%5B%5D=monographic&f%5Bmember_of_collections_ssim%5D%5B%5D=Ephemera+Collection+-+The+National+Library+of+Israel&per_page=100&sort=date_dtsort+desc&view=list), [lead 3](https://designarchive.shenkar.ac.il/articles/84).

Archive-route searches also attempted:

- `site:jabotinsky.org "1977" "כרזות"`: selected catalogue 34361;
  also found 34276, 34245, 34157 (not opened). `site:jabotinsky.org "1981" "גוף יוצר: הליכוד" כרזות`:
  selected 34179; 34176 and 34175 remained uninspected leads.
- `site:jabotinsky.org "1988" "גוף יוצר: הליכוד" כרזות`: selected 36187;
  36232 and 36189 remained uninspected leads. Identical queries for 1984 and 1992
  returned empty sets. Looser `site:jabotinsky.org "YEAR" "הליכוד" "כרזות"`,
  YEAR = 1984, 1992, 1999: general institute/newsletter pages, one 1992 polling-place
  photo lead (108005), and no 1999 results, respectively. None supplied a new logo.
- `site:yadtabenkin.org.il "בחירות" "כרזות"` and
  `site:religious-zionism.org.il "כרזות"`: empty sets. Alternate Hebrew-name
  queries `"יד טבנקין" "כרזות" "בחירות"`, `"בית ברל" "ארכיון" "תעמולת בחירות"`,
  `"ארכיון המדינה" "כרזות" "בחירות"`, `"ארכיון בן גוריון" "בחירות" "כרזות"`,
  `"ארכיון הציונות הדתית" "בחירות"`: NLI/State Archives collection leads,
  generic social/news results or finding aids, with no accepted scan.
- `"ארכיון" "העבודה" "1992" "כרזה"`: Lavon Institute social pages and the
  NLI mixed campaign folder; no original acquired.
- `site:digital.library.ucla.edu "ליכוד" "1981"`,
  `site:digital.library.ucla.edu "מורשה"`, and
  `site:digital.library.ucla.edu "המערך" "1988"`: collection/search pages and the
  Morasha item linked in the failure record. Original was not accessed past challenge.
- `site:commons.wikimedia.org "Likud" "1981"`,
  `site:commons.wikimedia.org "Morasha.png"`,
  `site:commons.wikimedia.org "Maarach1988.svg"`,
  `site:commons.wikimedia.org "Israel First.png"`: Commons metadata candidates;
  three file descriptions inspected as above; dated press-conference photo is
  a lead, not an inspected party-produced campaign publication.
- `National Library Israel IIIF ephemera api manifest`, `site:iiif.io "nli" manifest`,
  and `site:nli.org.il "IIIF" "https" "manifest"`: NLI developer routes found
  (iiif.io query empty); access results recorded above.
- Extra initial discovery `site:nli.org.il כרזות בחירות 1977 ליכוד` and
  `site:nli.org.il "1984" "מורשה"`: general election collection and newspaper
  articles, no inspected official emblem.

For k15 Likud, exact CDX query
`https://web.archive.org/cdx/search/cdx?url=www.likud.org.il/navframe.html&from=19990101&to=19990517&output=json&fl=timestamp,original,statuscode,digest&filter=statuscode:200`
returned HTTP 200 and `[]`. This URL/date scope supplies no campaign-byte proof.
No claim is made about all possible frame paths, domains or other party sites.

## Final coverage and remaining reasons

| Election | Winners | Before | After | Added |
|---|---:|---:|---:|---:|
| k9 | 13 | 4 | 5 | 1 |
| k10 | 10 | 1 | 2 | 1 |
| k11 | 15 | 2 | 2 | 0 |
| k12 | 15 | 1 | 2 | 1 |
| k13 | 10 | 1 | 1 | 0 |
| k14 | 11 | 2 | 2 | 0 |
| k15 | 15 | 2 | 2 | 0 |
| **Total** | **89** | **13** | **16** | **3** |

Added: **three fair-use identification crops**, zero free-licence assets, zero
uncropped original logo assets, zero constituent entries. Original complete scans
are retained alongside the catalogue HTML. Each campaign has separate evidence.

All 76 initial gaps were attempted. **73 whole-list gaps remain**. Reasons below
are acquisition outcomes, not a finding that artwork does not exist. Category A
means a catalogue lead was returned, not that its full page/scan was read or that
every item individually returned 403. Category B means the searches did not
produce an inspected qualifying original; secondary/current/undated designs do
not qualify. Both categories need original artwork, exact identity and campaign date.

**A — archival catalogue lead; original scan/date/identity not verified** (24 identities):

- k10: ג, הן, ת, ני.
- k11: ג, רצ, שס, עי, פ, ני.
- k12: שס, פ, ע.
- k13: ט.
- k14: אמת, ג, ט.
- k15: אמת, שס, מרצ, יש, ג, ל, ם.

**B — no inspected qualifying official campaign original from the searches** (49 identities):

- k9: ג, רצ, ב, ו, לע, ים, ש, ד.
- k10: אמת, רצ, ב, ו.
- k11: מחל, אמת, ב, ו, הן, יש, כך.
- k12: אמת, ג, רצ, ב, ו, הן, ת, ט, עץ, ץ.
- k13: אמת, מחל, ץ, שס, ב, ג, ו, ע.
- k14: שס, ב, מרצ, כן, ו, ע.
- k15: מחל, כן, ב, עם, ו, ד.

**No emblem in use:** zero established findings. Even the NRP poster labelled
“ב” has a broad ca. 1999–2003 catalogue date and an uninspected scan; its title alone
cannot establish letters-only use in 1999. Current Agudat Yisrael 2020 and the
recreated Alignment 1988 file do not repair historical campaign evidence gaps.

Conclusion map: each per-election identity subsection is a claim record keyed by
`kNN/letters`. Accepted claims map to retained catalogue+scan publicationEvidence,
with medium confidence and exact hashes. Open claims map to the recorded queries
and snippet-only locators, with **unknown artwork status**, not confidence of
absence. The 73 remaining gaps would change status on inspection and acquisition
of an official dated original (and adequate image quality); aggregate search
volume and generic symbols cannot change that decision. Constituents, nonwinners,
and other election ranges were not newly researched. All-years coverage script
was run first with python3 after `python` was unavailable, and again at the end.

## Verification and local publication

All seven election batches ran `npx vitest run` (57 files / 484 tests),
`npx tsc -p tsconfig.json --noEmit`, `npx vite build`, the dataset builder,
and `python3 scripts/validate-party-logos.py`, successfully before their local
commits. For the three asset batches the first differential-model test detected
the intended metadata change; only its model digest was re-recorded after all
26 datasets compared equal to the previous commit when omitting `logo`/`builtAt`.
The allocation, analysis, validation and rules digests remained unchanged.
The k11 report revision compacted repeated text without changing research content.

Final `PW_PORT=5362 npx playwright test`: **43 passed in 23.3 seconds**.
The first sandbox run could not start config.webServer (exit 1); the same command
passed with local server/browser execution permitted. No public page was automated.
Final logo validator: **26 overlays, 121 source records, 71 assets, 75 hosted
entries**, five unresolved entries, zero download-unavailable entries (all-year
counts include constituents and nonwinners).

Final independent audit reproduced each of the three final PNGs byte-for-byte
from its retained JPEG using the recorded crop recipe; original dimensions and
SHA-256 values match. All 26 election datasets equal initial commit `391483f`
after recursively omitting `logo` and `builtAt`. The repeat dataset build wrote
**zero files, 38 unchanged**. Coverage was re-run after the final build and remains
16/89 in scope. No results, frontend code or rules changed. The evidence extension
is confined to the logo validator and documented overlay fields.

Work is local on branch `t3/8cfc717d`, committed in seven election batches.
No push, merge, deployment or live-system change. The full-logo acquisition goal
is **not achieved**: 73 identities need further evidence; this report records the
attempt for every initial gap and does not relabel unresolved artwork as absent.

### Review correction (parent, 4 November 2026)

The k12 Likud crop `[7, 370, 211, 422]` kept only the slogan fragment "הליכוד יכול" and cut off the
ballot-letter box "מחל", which is what identifies the list. Re-cropped from the same retained scan to the
whole sign-off `[4, 366, 320, 436]` ("רק מחל הליכוד יכול / המחנה הלאומי", above the printer's line),
scaled proportionally to 256 × 57 px (Pillow, Lanczos). Final SHA-256
`89bf228003203889658050b1c936a084f172eaaaed04e1b471d954c5b8d1b35d`, 26,744 bytes; original scan and its hash
unchanged.


## Run 3 — 4 November 2026

Scope: re-check all 24 category-A identities above, then prioritise the largest
seat-winning category-B gaps. Baseline is parent commit `eb4067b`, including its
k12 correction; the existing 16 whole-list logos are preserved. Decisions remain
keyed by election/ballot letters. No emblem-absence inference is made from a
failed request, a text transcription, or a publication without an inspected mark.

Retrieval: Jina read_url on the k10 Shinui lead returned **HTTP 402, account balance
not enough**. Plain HTTP initially failed sandbox DNS (curl 6); network-enabled
requests used the exact project User-Agent, with no email address. Thirty distinct
supplied catalogue URLs were each GET-requested once, serially, at least three
seconds apart. All returned **HTTP 403**, title **Checking your browser...**;
none yielded a catalogue or scan. The table links below are the requested URLs,
not claims of inspected catalogue contents. Shared URLs were fetched once and
mapped to each affected identity. No challenge was solved or bypassed. No 429 or
Retry-After occurred; no archive.org requests or Apify spending ($0).
Supplemental discovery used web search after the Jina balance failure; search
results are leads only. English Wikipedia was neither used nor cited. Failure
HTML, downloads awaiting acceptance, contact sheets, tool installations and caches
are disposable in `.backup-scratch/`; accepted originals and hashes are durable.

Criterion: a dated party-produced campaign publication, complete identifying
sign-off, legible at 64 px, original retained unchanged with SHA-256 and an exact
crop recipe. Catalogue mirrors and search indexes are not independent evidence.
For each A row below the decision is **gap — challenge prevented verification**:
artwork, party origin, date and image quality remain unknown. This closes the
lead check for this run, not the historical question. Evidence that would change
it: lawfully accessible original bytes and campaign-specific date/identity proof.

### Run 3 · k9

No category-A identity for k9.

Category B priority: **ב (12 seats)**. Downloaded the existing [NRP platform
DOC](https://www.idi.org.il/media/6982/hamiflaga-hadatit-leumit-9.doc), HTTP 200,
675,840 bytes. Its Word container metadata says created February 2009; this does
not date the underlying artwork. No campaign original was visually recovered from
the container; no logo promoted. This is an inspection/reproduction gap, not proof
of a later design or a text-only original. The other seven k9 B gaps retain their
run-2 reasons and were not individually re-searched in this supplemental pass.

Coverage: **5 → 5 / 13**; zero additions, zero absence findings.
### Run 3 · k10

| Identity | Lead(s) checked | Decision and observed evidence |
|---|---|---|
| k10/ג | [NNL_ARCHIVE_AL990034751580205171](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL990034751580205171/NLI); [NNL_ARCHIVE_AL997012156926305171](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997012156926305171/NLI) | Gap: each linked URL returned HTTP 403 / browser challenge; no catalogue or scan inspected. |
| k10/הן | [NNL_ARCHIVE_AL997012156936905171](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997012156936905171/NLI) | Gap: each linked URL returned HTTP 403 / browser challenge; no catalogue or scan inspected. |
| k10/ת | [NNL_ARCHIVE_AL990039481790205171](https://www.nli.org.il/en/archives/NNL_ARCHIVE_AL990039481790205171/NLI) | Gap: each linked URL returned HTTP 403 / browser challenge; no catalogue or scan inspected. |
| k10/ני | [NNL_ALEPH990032480450205171](https://www.nli.org.il/he/books/NNL_ALEPH990032480450205171/NLI); [NNL_ARCHIVE_AL990039878190205171](https://www.nli.org.il/en/archives/NNL_ARCHIVE_AL990039878190205171/NLI) | Gap: each linked URL returned HTTP 403 / browser challenge; no catalogue or scan inspected. |

Category B priority: **אמת (47 seats)**. Opened the [IDI Alignment catalogue](https://www.idi.org.il/policy/parties-and-elections/parties/maarach/)
by plain HTTP (200); its 1981 row links `maarach-10.doc` as the platform and
`כנסת-10-מערך.pdf` as the candidate list. These links are discovery only: no
original campaign artwork acquired from them. Also found the [1981 artists' support
poster record](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997009950412005171/NLI)
in search: indexed date 21 June 1981 and issuer a transport-coordination body,
not verified party origin. No scan inspected; no promotion. Remaining B identities
רצ, ב, ו retain their prior reasons, without a fresh individual search.

Coverage: **2 → 2 / 10**; zero additions, zero absence findings.
### Run 3 · k11

| Identity | Lead(s) checked | Decision and observed evidence |
|---|---|---|
| k11/ג | [NNL_ARCHIVE_AL997012948087105171](https://www.nli.org.il/en/archives/NNL_ARCHIVE_AL997012948087105171/NLI) | Gap: each linked URL returned HTTP 403 / browser challenge; no catalogue or scan inspected. |
| k11/רצ | [nnl_archive_al990034513270205171](https://www.nli.org.il/he/sheets/nnl_archive_al990034513270205171/NLI) | Gap: each linked URL returned HTTP 403 / browser challenge; no catalogue or scan inspected. |
| k11/שס | [NNL_ARCHIVE_AL997012156938605171](https://www.nli.org.il/en/archives/NNL_ARCHIVE_AL997012156938605171/NLI) | Gap: each linked URL returned HTTP 403 / browser challenge; no catalogue or scan inspected. |
| k11/עי | [NNL_ARCHIVE_AL990034513450205171](https://www.nli.org.il/he/sheets/NNL_ARCHIVE_AL990034513450205171/NLI) | Gap: each linked URL returned HTTP 403 / browser challenge; no catalogue or scan inspected. |
| k11/פ | [NNL_ARCHIVE_AL990034513320205171](https://www.nli.org.il/he/sheets/NNL_ARCHIVE_AL990034513320205171/NLI); [nnl_archive_al990039878500205171](https://www.nli.org.il/en/archives/nnl_archive_al990039878500205171/NLI) | Gap: each linked URL returned HTTP 403 / browser challenge; no catalogue or scan inspected. |
| k11/ני | [nnl_archive_al990039878500205171](https://www.nli.org.il/en/archives/nnl_archive_al990039878500205171/NLI) | Gap: each linked URL returned HTTP 403 / browser challenge; no catalogue or scan inspected. |

Category B priorities: **אמת (44 seats)** and **מחל (41 seats)**. The opened
IDI Alignment catalogue links `maarach-11.doc` as the 1984 platform; the link alone
supplies no inspected original sign-off. The Likud campaign collection yielded
the accepted poster described below. Other B identities ב, ו, הן, יש, כך were not
individually re-searched in this supplemental pass.

Coverage: **2 → 3 / 15**; one addition, zero absence findings.

Accepted k11/מחל: [catalogue 123512](https://www.jabotinsky.org/%D7%90%D7%A8%D7%9B%D7%99%D7%95%D7%9F/%D7%97%D7%99%D7%A4%D7%95%D7%A9-%D7%A4%D7%A9%D7%95%D7%98/%D7%A4%D7%A8%D7%99%D7%98-%D7%90%D7%A8%D7%9B%D7%99%D7%95%D7%9F/?itemId=123512),
[complete PDF scan](https://www.infocenters.co.il/jabo/jabo_multimedia/%D7%94%201/%D7%9C%D7%99%D7%9B%D7%95%D7%93%20%D7%941/%D7%941%20_%2011_14_9.pdf).
The catalogue describes Likud campaign propaganda for the eleventh Knesset,
with an explicitly **approximate** range 1 June–24 July 1984. The selected poster
itself prints **11.6.84** (11 June 1984), a Shamir rally at Binyanei HaUma.
The recorded campaign-use date is this printed event date, as in the run-2
examples; it is not an assertion that the poster was printed on the event day.

Crop shows the whole **הליכוד** wordmark with its flag-shaped stroke. No ballot
letters occur anywhere on this selected poster. The line beneath the logo is an
invitation to activists/supporters, not part of the mark; it is excluded. Before
acceptance, the whole poster page and crop were viewed side by side, with an
actual 64-px-wide version: legible wordmark, complete identifying artwork, no
slogan substitution or archive watermark removal. Source confidence **medium**:
one official publication evidence family in an archive, not independently
corroborated. The full PDF is preserved, including archive stamps and other pages.

Retained `data/raw/logos/k11/likud-jabotinsky-123512.html` and
`likud-jabotinsky-123512.pdf`; both bytes/hashes registered in `data/raw/SOURCES.json`.
Original PDF SHA-256: `d3a8f6af0741caffdbe26aacf70e57828652c8f0c1cd646bf8ecb5375eb6aca8`.
Final `public/logos/likud-print-1984.png`: **256 × 84**, **14,813 bytes**, SHA-256
`c0d59d4b2db346530f2403a2acd4b6b9483c08f24a105b12aab226ad7dcc713d`.

PDF extraction recipe (CPython **3.13.16**, PyMuPDF **2.1**, Pillow **12.2.0**):
open the retained PDF with `pymupdf.open`; page **35** (zero-based 34) has one
embedded scan, xref **140**; `pymupdf.Pixmap(doc, 140).save(...)` yields its native
**1334 × 1842** pixels without rendering/resampling. `originalDimensions` refers
to that original scanned page inside the retained PDF, not PDF point units.
Then use the existing recipe: Pillow `.crop((210,1130,1145,1435)).convert('RGBA')`,
`.thumbnail((256,256), Image.Resampling.LANCZOS)`, `.save(..., optimize=True)`.
No new overlay fields or validator exceptions; `publicationEvidence.asset`
identifies the unmodified PDF container, whose hash is `originalSha256`.
The extracted full page is reproducible scratch, not a substituted original.
### Run 3 · k12

| Identity | Lead(s) checked | Decision and observed evidence |
|---|---|---|
| k12/שס | [NNL_ARCHIVE_AL997011437305505171](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997011437305505171/NLI) | Gap: each linked URL returned HTTP 403 / browser challenge; no catalogue or scan inspected. |
| k12/פ | [NNL_ARCHIVE_AL990032573700205171](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL990032573700205171/NLI) | Gap: each linked URL returned HTTP 403 / browser challenge; no catalogue or scan inspected. |
| k12/ע | [NNL_ARCHIVE_AL997012849354405171](https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997012849354405171/NLI) | Gap: each linked URL returned HTTP 403 / browser challenge; no catalogue or scan inspected. |

Category B priority: **אמת (39 seats)**. The opened IDI Alignment catalogue
links `maarach-12.doc` as the 1988 platform; no original artwork inspected from
that link. The recreated Commons design rejected in run 2 is still excluded.
No k12 mark is borrowed from k9, k10 or k11. Other B identities ג, רצ, ב, ו, הן,
ת, ט, עץ, ץ retain their prior reasons, without individual fresh searches.
The corrected whole-sign-off Likud asset remains unchanged.

Coverage: **2 → 2 / 15**; zero additions, zero absence findings.
### Run 3 · k13

| Identity | Lead(s) checked | Decision and observed evidence |
|---|---|---|
| k13/ט | [NNL_ARCHIVE_AL997012156954105171](https://www.nli.org.il/en/archives/NNL_ARCHIVE_AL997012156954105171/NLI) | Gap: each linked URL returned HTTP 403 / browser challenge; no catalogue or scan inspected. |

Category B priorities: **אמת (44 seats)**, **מחל (32 seats)**, **ץ (8 seats)**.
Opened [IDI's 1992 election catalogue](https://www.idi.org.il/policy/parties-and-elections/elections/1992/)
and downloaded the [Labor platform](https://www.idi.org.il/media/6676/%D7%A2%D7%91%D7%95%D7%93%D7%94-13.pdf)
(HTTP 200, 5,009,085 bytes, 40 pages). Visually inspected pages 1, 2, 40: contents
and platform text, no candidate crop there; the intervening pages were not fully
visually reviewed. No claim that the booklet lacks all emblems. The [Tzomet
platform](https://www.idi.org.il/media/6732/tzomet-1992.pdf) (200, 2,033,106 bytes,
10 pages) has visible Tzomet wordmarks on the front/back; pages 1, 2, 10 were
visually inspected, but a printed campaign date and complete provenance were not
verified. No exact publication date invented to fill `inUseDate`. The Likud row
links `likud-13.doc`; that link remains uninspected artwork. A supplementary search
for a Jabotinsky thirteenth-Knesset campaign leaflet file yielded no selected
original. Other B identities שס, ב, ג, ו, ע were not individually re-searched.

Coverage: **1 → 1 / 10**; zero additions, zero absence findings.
