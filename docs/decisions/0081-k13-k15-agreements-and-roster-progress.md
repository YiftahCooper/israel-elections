# K13–K15: agreement notices and bounded candidate transcription

## Agreements

The entire numbered notice in **YP 4411 p. 3398** was read through its signature:
Labor–Meretz; NRP–UTJ; Third Way–Yisrael BaAliyah; Hadash–United Arab List (**ע**,
not the later **עם**); Moledet–Telem Emuna; Likud/Gesher/Tzomet–Shas. All **six**
pairs are retained, including the ineffective Moledet–Telem Emuna pair.
The source is an official statutory publication hosted by the disclosed olaw mirror,
already retained in research, now registered in SOURCES.

The previously missing 1999 notice is recovered from
https://olaw.org.il/yalkut/yalkut-4755.pdf, **YP 4755 p. 3305**, published 19 May 1999.
The notice itself is signed 17 May. Both columns were read in sequence through its
signature: **nine** pairs, Israel One–Meretz; National Union–Yisrael BaAliyah;
Shinui–Greens; Am Ehad–Yisrael Beiteinu; Likud–NRP; United Arab List–Hadash;
Pnina Rosenblum–Power for Pensioners; Centre–Third Way; Shas–UTJ. The whole PDF is
retained in `data/raw/k15/yp4755-agreements.pdf` (under 5 MB). Completeness concerns
this numbered notice, not an exhaustive claim about all possible later corrections.

No complete **1992** agreement notice was recovered. The bounded search read the
contents pages of mirrored issues **4014, 4015, 4016, 4018, 4019, 4020 and 4022**,
and the retained candidate issue 4017 and results issue 4021. The search did not read
every unrelated page of every issue. `agreement-search.reviewed.json` records these
limits. New successful downloads have URL, hash and actual file timestamp in SOURCES;
negative-search working PDFs live in ignored scratch and are recoverable by those URLs.
No claim is made that the empty sourced agreement input proves no agreements existed.
It happens to reproduce every 1992 seat, so there is no need to infer pairs from seats.
A released dataset would have to retain the explicit agreement-completeness caveat.

## Candidate evidence retained, and what is missing

`data/raw/kNN/candidates.reviewed.json` retains **only checked readings**:

* k13: Labor's first **10** ranks, YP 4017 p. 3620, cross-checked against the first
  10 elected members in YP 4021 p. 3776. Its printed terminal rank is 120.
* k14: Labor's first **10** ranks, YP 4408 p. 3286, cross-checked against YP 4414
  p. 3482; terminal rank **117**, not an invented 120. The complete **12-person
  Third Way** roster on p. 3288 is transcribed with contiguous ranks; all four elected
  members agree with YP 4414 p. 3483.
* k15: Israel One's first **10** ranks, YP 4748 p. 3036, cross-checked against
  YP 4757 p. 3377; terminal rank 120.

Names retain published surname/given-name order. Each retained name has a printed
page reference. The scans were rendered with pdfjs-dist and `wasmUrl` pointing to
`node_modules/pdfjs-dist/wasm/`. No OCR output or secondary roster was promoted.
Working full-roster draft readings with uncertain names were not certified or committed.
These are **not full winning-roster coverage**: 10 winning lists in k13, 11 in k14,
and 15 in k15 require complete rosters; only Third Way is complete here.

Keep the elections unavailable. Partial prefixes are evidence, not short complete
lists. The research fixture exposes only the complete Third Way roster; other lists
have `candidatesUnavailable: true` and `candidates: []`, with a research-only note.
This is a transcription gap, not a claim that no official candidate gazette exists.
A future release must finish all winning lists and cross-check all elected ranks.
Nonwinning rosters may remain explicitly unavailable under the user's release contract.

YP 4757 p. 3378 also records Aryeh Deri's post-election resignation on 19 May 1999.
Original registered roster order must not be silently replaced with later membership.
An exhaustive withdrawal/correction history remains unverified.

## Reproduction

Install locked dependencies with `npm ci`, then run `node scripts/build-datasets.ts`
and the historical tests. CI uses only retained JSON and hashed source PDFs, not scratch.
For further visual transcription, render retained PDF pages using pdfjs-dist's Node
canvas factory, with the wasm path above, and keep PNGs in `.backup-scratch/k13-k15/`.
Those images are disposable derivatives of the retained source bytes. New reviewed
names belong in durable JSON only after checking the printed rank, name and page.

## Addendum, 12 November 2026: the negative-search PDFs are now retained

The nine negative-search issues (YP 4014, 4015, 4016, 4018, 4019, 4020 and 4022 for 1992; YP 4750 and 4756 for
1999) were kept in ignored scratch, as above. Scratch was later wiped, so their manifest records pointed at files
that no longer existed, while still carrying a hash and size as if retained (audit 12 Nov, ax-screens-d-03). All
nine were fetched again from the same olaw.org.il URLs and are byte-identical to the recorded SHA-256 and byte
counts. They are now retained in `data/raw/k13/` and `data/raw/k15/` beside the other gazette PDFs of those
elections (16,646,732 bytes together), as decision 0004 keeps PDFs out of scratch, and the build now checks every
manifest record that names a file (`verifyManifest` in `scripts/lib/build/sources.ts`). What the search covered
and its limits, recorded above and in `agreement-search.reviewed.json`, are unchanged.
