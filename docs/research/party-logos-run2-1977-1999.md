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

Batch k9 verification: dataset builder passed; all 26 datasets compared equal to prior commit after removing only `logo` and `builtAt`. `npx vitest run`: 57 files / 484 tests passed; `npx tsc -p tsconfig.json --noEmit`, `npx vite build`, and logo validator passed. Only the model digest was re-recorded after the comparison; other four digest families passed unchanged. 

## k10 · 1981

### מחל — הליכוד

**Accepted:** dated official print crop; details below.

- General discovery: `query: ליכוד 1981 כרזה בחירות סמל -site:en.wikipedia.org`
  Returned locators (snippet inspection only): [lead 1](https://he.wikipedia.org/wiki/%D7%94%D7%9C%D7%99%D7%9B%D7%95%D7%93), [lead 2](https://www.nli.org.il/he/discover/israel/elections), [lead 3](https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf).
- NLI targeted discovery: `query: site:nli.org.il "ליכוד" "1981" תעמולה`
  Returned locators (snippet inspection only): [lead 1](https://www.nli.org.il/he/newspapers/dav/1981/06/19/01/article/94), [lead 2](https://www.nli.org.il/he/newspapers/dav/1981/05/31/01?&), [lead 3](https://www.nli.org.il/en/archives/NNL_ARCHIVE_AL990039878190205171/NLI).

Inspected [catalogue](https://www.jabotinsky.org/%D7%90%D7%A8%D7%9B%D7%99%D7%95%D7%9F/%D7%97%D7%99%D7%A4%D7%95%D7%A9-%D7%9E%D7%AA%D7%A7%D7%93%D7%9D/%D7%A4%D7%A8%D7%99%D7%98?itemId=34179) and [scan](https://www.infocenters.co.il/jabo/jabo_multimedia/%D7%9B%D7%A8%D7%96%D7%95%D7%AA/9.05.2013/2423_3966.jpg); printed event date **1981-06-17**. Crop `[244, 405, 313, 436]` from `[314, 448]`; final `logos/likud-print-1981.png`, 5664 bytes. Original SHA-256 `c2a9287390c8a35cf1950973db1c5f5c4829ac5b71c27ef2efe62bd48b8e845a`; final SHA-256 `87a6ff9d0396bc647457dbb098c499511988373214ecc5dbbcea7627d1873f1a`. Catalogue HTML and scan are retained at `data/raw/logos/k10/`. Fair-use identification, no free licence asserted.

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

Batch k10 verification: dataset builder passed; all 26 datasets compared equal to prior commit after removing only `logo` and `builtAt`. `npx vitest run`: 57 files / 484 tests passed; `npx tsc -p tsconfig.json --noEmit`, `npx vite build`, and logo validator passed. Only the model digest was re-recorded after the comparison; other four digest families passed unchanged. 

