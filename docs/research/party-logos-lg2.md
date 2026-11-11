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
| 2015 (k20) | Meretz | Cover prints 2015; complete lower campaign wordmark. |
| 2013 (k19) | Labor | Cover names k19; catalogue row is 2013. |
| 2013 (k19) | Meretz | Cover prints “elections 2013”; complete lower campaign lockup. |
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

PDF page 1 was rendered at scale 1.3 with the locked pdfjs-dist and
@napi-rs/canvas dependencies. Crop coordinates refer to that rendered raster,
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
