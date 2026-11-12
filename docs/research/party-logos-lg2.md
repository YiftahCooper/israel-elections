# Party logos: wider collection, 12 November 2026

Winning-list coverage rises from **77 to 87 of 308**, winning-list constituent
coverage from **42 to 43 of 247**. Other-list coverage stays **15 of 400**.
The remaining 221 winning-list gaps are unresolved research, not evidence that
those lists had no emblem. No election totals or app behaviour changed.

Only artwork tied to the particular election is assigned. An unsuccessful retrieval
does not establish that a party had no logo. Lists and their constituent parties
are separate identities under decision 0089.

## Original campaign publications

Nine assignments come from original party platforms preserved by the Israel
Democracy Institute. The retained catalogue page links each exact PDF from its
election-year row. Original covers or first pages were inspected in full, then the
final crops were inspected together. Source cards and the raw-source manifest
retain the complete PDFs, catalogue HTML, hashes and crop coordinates.

| Election | Identity | Date evidence |
|---|---|---|
| 2022 (k25) | Yisrael Beiteinu | Platform explicitly names k25 and prints 14 August 2022. |
| 2015 (k20) | Meretz | Cover prints 2015; only the מרצ word is retained from the lower lockup. |
| 2013 (k19) | Labor | Cover names k19; catalogue row is 2013. |
| 2013 (k19) | Meretz | Cover prints “elections 2013”; wordmark only, without the slogan box or separate tagline. |
| 2009 (k18) | Labor | Platform names k18; catalogue row is 2009. |
| 2009 (k18) | New Movement–Meretz | Cover prints 2009; combined mark belongs to the whole list. |
| 2006 (k17) | Labor constituent | Convention platform names k17 and prints 22 January 2006; no whole-list substitution. |
| 1996 (k14) | Labor | Cover names k14; catalogue row is 1996. |
| 1996 (k14) | Yisrael BaAliyah | Exact catalogue year 1996; original platform scan names the party. |

Year-only dates use decision 0089's single-election-year print rule. Dates are not
expanded into invented days. The two full publication dates precede list filing;
their explicit election references establish campaign-publication identity, not
an assertion of a website capture in the final campaign window. Confidence is
medium: these are preserved originals, without independent historical byte
attestation. IDI is the custodian, not the creator of the artwork.

PDF page 1 was rendered at scale 4 for the two corrected Meretz crops and at
scale 1.3 for the other PDF crops, with the locked pdfjs-dist and
@napi-rs/canvas dependencies. Crop coordinates refer to the recorded rendered raster,
as stated in each publicationEvidence record. Pillow 13.0.0 converts to RGBA,
crops the recorded rectangle, proportionally thumbnails to at most 256 × 256,
and saves optimised PNG. Original colours, paper texture and backdrops remain;
there is no redrawing, background removal or recolouring. The superseded,
unresolved Meretz 2009 community asset is recoverable from Git; its source card
remains.

## Acquisition limits

Twelve current IDI profile images are undated candidates, not historical
assignments. Thirty missing winning-list platform PDFs were retrieved and their
first pages inspected; most contain text alone. One 1999 Likud platform link
actually opens a document naming k14, and is not accepted for k15. The Hadash
k19 web print is dated 30 January 2013, after polling, and is retained as a lead
rather than used to invent a pre-election capture.

The fresh CEC and NLI requests returned HTTP 403; requests to each host stopped.
Catalogue-number leads and newspaper acquisition targets remain research leads,
not proof that a particular uninspected scan contains a usable logo. No English
Wikipedia source was used.

## Further confirmed originals

- **Blue and White, April 2019 (k21):** the original platform at
  `bg19.co.il/wp-content/uploads/2019/03/blueandwhiteplatform.pdf` prints March
  2019. Its complete Gantz/Lapid lockup is retained as an unaltered rectangular
  crop. The PDF payload matches the CDX digest of capture **20190327091028**,
  inside the April campaign. The full observed-use date is 27 March; it is not
  presented as an invented publication day. Neither a year-only assumption nor
  a September-campaign substitution is used. The exact original and its archive
  index are committed, with raster coordinates and render parameters.
- **Yisrael Beiteinu, 2015 (k20):** inspected official homepage capture
  **20150315021149** references its original header PNG. Both HTML and original
  PNG match their retained CDX digests. The whole list receives its own mark;
  it is not borrowed from the joint Likud–Yisrael Beiteinu list in 2013.

The collection checked 55 initial domain addresses, ten corrected historical
addresses, and further targeted domains and paths. Address discovery is separate
from establishing official ownership: a student union at `aguda.org.il`, care
services at `telem.org.il`, a youth organisation at `derecheretz.org.il`, and
repurposed domains are rejected. A website supplier logo and a Facebook button
are also rejected even where their image bytes are correctly archived.

Some archive payloads are gzip-compressed. Exact downloaded bytes are retained
and hashed before lossless decompression for inspection. Empty titles in an
undecoded compressed payload are not evidence of an empty page. Browser-check,
security-check, login-only and default-server responses provide no campaign
artwork evidence. No access challenge was bypassed.

The dated 2022 National Unity mark shown on the Blue and White website does not
identify the Israel Resilience constituent separately. Likewise, the 2026
Religious Zionism mark does not fill the missing combined Religious
Zionism–Zehut list mark. A 2019 Union of Right-Wing Parties design still served
in 2021 is a stale campaign candidate, not a 2021 Yamina assignment.

## Review correction: isolate the two Meretz wordmarks

The first crops mistakenly retained campaign messages. Standing practice in
party-logos.md requires cropping adjacent slogan or notice text out of an emblem.
Both assignments remain verified; only their displayed rectangles changed.

- **2013:** retain the white מרצ wordmark. Omit the rival-directed slogan box and
  השמאל של ישראל, which is separately placed below the wordmark and can be
  separated from it. The tight wordmark rectangle intersects a tiny blue edge
  of the adjacent box; these original background pixels remain, without any
  slogan letters. No background cleaning or recolouring was used.
- **2015:** all 81 pages of the retained publication were rendered and visually
  reviewed. No standalone emblem was found; the interior headers repeat the
  slogan lockup. Retain only the green מרצ word from the cover lockup, with the
  original paper texture, omitting the other words.

Both use PDF page 1 at scale 4, raster dimensions **2382 × 3368**. Rectangles use
exclusive right/bottom coordinates. RGBA, LANCZOS thumbnail to 256 pixels on the
long side, and optimised PNG remain unchanged.

| Asset | Crop rectangle | Final dimensions | Final SHA-256 |
|---|---|---|---|
| meretz-2013-k19-print.png | [974, 2605, 2008, 2995] | 256 × 97 | 8d5e1ec88850545a2b9e16f51e91a97cd6c35c4b507598057c88e8b2411fb427 |
| meretz-2015-k20-print.png | [262, 2983, 868, 3210] | 256 × 96 | 0395338985816ba4b5a5c5df08bb4918f225625e8cdb84c5123fc8056d350636 |

The other nine final images were re-inspected. The four Labor marks and
Yisrael Beiteinu 2015 contain party names only. Yisrael BaAliyah 1996 includes
the party name in Hebrew and Russian; New Movement–Meretz 2009 includes the
combined party name. Blue and White 2019 and Yisrael Beiteinu 2022 retain their
leaders' names as part of the identifying ballot name. No other slogan or notice
text was found. No original PDF, rights basis, date assignment or coverage count
changed.
