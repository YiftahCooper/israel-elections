# Party logos run 2 — 1949–1973

Research date: 4 November 2026. Scope: the 98 seat-winning lists in k1–k8 and their 32 distinct constituent-election identities. Baseline: 2 list logos, 0 constituent logos. The first coverage command used `python` and failed (`command not found`); rerun successfully with `python3` before research. No election results, ballot letters or party identities are changed.

The goal of closing every gap is **not achieved**. Every missing list and constituent received a live identity-specific search attempt. Search snippets are discovery leads only, never proof of campaign use or absence. This is a bounded pass, not exhaustive inspection of every archive holding. No list is classified “no emblem in use”: one letter-only poster cannot establish campaign-wide absence. No design is carried across campaigns, and no constituent emblem replaces a joint-list lockup.

## Coverage before and after

| Election | Winners | Before | After | Constituent before → after |
|---|---:|---:|---:|---:|
| k1 | 12 | 1 | 2 | 0 → 0 (7 identities) |
| k2 | 15 | 0 | 0 | 0 → 0 (0 identities) |
| k3 | 12 | 0 | 0 | 0 → 0 (4 identities) |
| k4 | 12 | 0 | 0 | 0 → 0 (2 identities) |
| k5 | 11 | 0 | 0 | 0 → 0 (0 identities) |
| k6 | 13 | 1 | 1 | 0 → 0 (4 identities) |
| k7 | 13 | 0 | 0 | 0 → 0 (4 identities) |
| k8 | 10 | 0 | 0 | 0 → 0 (11 identities) |

## Evidence and limits

**E1 — Fighters List, k1: logo added.** [Pinned Commons description](https://commons.wikimedia.org/w/index.php?title=File:FightersList.png&oldid=1290629743), file caption “1949”, description explicitly identifies the first Israeli election; credited NLI item NNL_Ephemera700129128. Original PNG downloaded and visually inspected, then resized. Free-licence/PD-textlogo, medium confidence under the existing Commons assignment policy. This does not claim independent verification of the inaccessible NLI artefact. Visible licence says PD-textlogo; structured data says CC BY-SA 4.0, a recorded metadata conflict. No original scan or crop is claimed for this asset.

**E2 — Mapam, k4: gap; unresolved crop retained.** [Central Zionist Archives exhibition](http://www.zionistarchives.org.il/Pages/ElectionPosters.aspx), published 14 October 2026, identifies Mapam poster KRA/3225 as 1959 and credits Shmuel Katz. Full scan inspected; printed issuer is Mapam, Haifa. The isolated white מ roundel is a crop from this dated official campaign publication, a fair-use candidate only. The existing build rejected it with `Invalid campaign-use date: k4`, requiring a full ISO date; the year-only source cannot pass. No validator or builder rule is changed. Year-level date only (`inUseDate: "1959"`); the 22 November 1959 archive accession stamp is not treated as campaign date. Original 1024×764 JPEG; crop `[823, 614, 995, 764]`, right/bottom exclusive. The scan ends at the lower edge of the roundel. No redrawing, recolouring or extrapolation. Roundel remains legible at 64 px. Source type records `official party campaign publication` on the unresolved card; no hosted source-type gate was expanded.

**E3 — inspected letter-only items, no campaign-wide absence claim.** [Jabotinsky Institute item 37884](https://www.jabotinsky.org/ארכיון/חיפוש-מתקדם/פריט?itemId=37884), כר-4129, creator Herut, meeting 23 January 1949: scan shows party name and ח, no separate emblem found. CZA KRA/2767, national religious joint list, 1955: illustrated ballot card, not independently verified as a reusable joint-list emblem. CZA KRA/778 (Maki, 1959) and KRA/726 (Mapai, caption 1951 but prose “1950s”): letters and campaign artwork, no separate emblem accepted. These observations support continued gaps, not “no emblem in use”.

**E4 — Mapam 1955 lead.** [Yad Yaari exhibition](https://www.yad-yaari.org.il/at-the-service-of-an-idea), curator Yuval Danieli, September 2023, describes official party posters for the 1955 campaign, including Shraga Weil’s three hands. Page and image references inspected; no isolated emblem from its original scan was acquired. A poster illustration is not automatically an emblem. This page cannot date the 1959 roundel to 1955.

The accepted Fighters original/final and unresolved Mapam scan/crop have SHA-256 records in the election overlays, source cards and `data/raw/SOURCES.json`. Retained provenance HTML accompanies each. Reproduction: CPython 3.13.16, Pillow 12.2.0; `convert("RGBA")`, stated crop if applicable, `thumbnail((256,256), Image.Resampling.LANCZOS)`, `save(..., optimize=True)` as PNG. Pillow installed only in project scratch. Original scans/accepted assets remain durable under data/raw/logos and public/logos. Bytes and hashes appear below after all election batches.

## Retrieval failures and source routes

Plain HTTP User-Agent: `israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)`. No email address, proxy rotation, CAPTCHA solving, login bypass or archive.org request was used. Apify spend: $0 (not invoked). Initial sandbox curl could not resolve NLI and CZA (curl 6); authorized network execution resolved DNS. HTTPS CZA failed with curl 35, unexpected EOF during TLS; its published HTTP scan URLs worked (200). NLI direct fetch returned 403 with challenge HTML. Jina returned “Just a moment…” for the following URLs; no challenge was bypassed:

- https://www.nli.org.il/he/discover/israel/elections/1951
- https://www.nli.org.il/he/education/teaching-resources/primary-sources/nnl_edu997013031813005171
- https://www.nli.org.il/en/research-and-teach/open-library
- https://www.nli.org.il/en/research-and-teach/open-library/presentation-api
- https://www.nli.org.il/en/research-and-teach/open-library/image-api
- https://merkazruach.nli.org.il/historiyom/bkhyrvt-1973
- https://www.nli.org.il/he/newspapers/hrt/1949/01/23/01/page/1

Current JPress route discovered: `/he/newspapers/hrt/1949/01/23/01/page/1`. Current documented IIIF manifest pattern discovered by search: `http://iiif.nli.org.il/IIIFv21/{RecordId}/manifest`; image pattern `https://iiif.nli.org.il/IIIFv21/{FLid}/full/max/0/default.jpg`. Both HTTP and HTTPS manifest attempts for `NNL_Ephemera700129128` returned “Internal error” XML through Jina; no FL identifier was obtained, so no working IIIF image source is claimed. These are retrieval failures, not nonexistence evidence.

Additional archive discovery queries (Jina search snippets only): `site:yadtabenkin.org.il בחירות 1955 כרזות` (empty); `site:beitberl.ac.il ארכיון מפאי בחירות 1951 כרזות` (empty); `site:jewish-faculty.biu.ac.il המזרחי בחירות 1955 כרזות` (finding aid https://jewish-faculty.biu.ac.il/files/jewish-faculty/shared/khtybh_002.pdf, snippet refers to 1944, not accepted); `site:in.bgu.ac.il bgi בחירות 1961 כרזות` (empty); `site:archives.gov.il בחירות 1973 כרזות` (empty). UCLA catalogue facet pages were returned among identity searches; no original campaign-specific asset acquired from them. These collections have not been exhaustively searched.

Two retry queries (`מוקד 1973 כרזה`, `מפא"י 1955 כרזה`, each with excluded English-language Wikipedia domain) failed: Jina “This key is out of quota”. Initial oversized arrays for k1/k2 were rejected (maximum 5); subsequent batches used ≤5. An accidental empty constituent batch was rejected (minimum 1); it represented no identity. Search failures below preserve timeout errors. No English Wikipedia page was opened or cited; Hebrew Wikipedia results are secondary leads only.

## Per-election outcomes and exact identity searches

Queries below were submitted through Jina search_web (discovery: up to four results; NLI-targeted and constituents: up to two). Returned URLs are indexed at the end; they were inspected as snippets only unless identified in E1–E4. An empty result means “not found in that query”, never “no emblem”. Default **gap** reason: no acquired source simultaneously establishes official origin, that campaign’s design and usable original bytes. NLI retrieval problems apply only to the URLs actually opened above; unvisited leads are not labelled inaccessible.

### k1

**א — Mapai: gap.**
- `מפא״י 1949 כרזת בחירות סמל -site:en.wikipedia.org` → U1, U2, U3, U4
- `site:nli.org.il מפא"י 1949 בחירות` → U181, U6

**מ — Mapam: gap.**
- `מפ״ם 1949 כרזת בחירות סמל -site:en.wikipedia.org` → U5, U6, U3, U7
- `site:nli.org.il מפ"ם 1949 בחירות` → U6, U181

**ב — United Religious Front: gap.**
- `החזית הדתית 1949 כרזת בחירות סמל -site:en.wikipedia.org` → U6, U8, U9, U10
- `site:nli.org.il החזית הדתית 1949 בחירות` → U6, U181

**ח — Herut: gap.**
- `חרות 1949 כרזת בחירות סמל -site:en.wikipedia.org` → U11, U12, U6, U13
- `site:nli.org.il חרות 1949 בחירות` → U6, U16

**צ — General Zionists: gap.**
- `הציונים הכלליים 1949 כרזת בחירות סמל -site:en.wikipedia.org` → U2, U7, U14, U3
- `site:nli.org.il הציונים הכלליים 1949 בחירות` → U16, U182

**פ — Progressive Party: gap.**
- `הפרוגרסיבים 1949 כרזת בחירות סמל -site:en.wikipedia.org` → U7, U8, U5, U15
- `site:nli.org.il הפרוגרסיבים 1949 בחירות` → U183, U184

**ס — Sephardim and Oriental Communities: gap.**
- `ספרדים ועדות המזרח 1949 כרזת בחירות סמל -site:en.wikipedia.org` → U16, U7, U8, U2
- `site:nli.org.il ספרדים ועדות המזרח 1949 בחירות` → U181, U16

**ק — Maki: gap.**
- `מק״י 1949 כרזת בחירות סמל -site:en.wikipedia.org` → U17, U11, U2, U18
- `site:nli.org.il מק"י 1949 בחירות` → U6, U2

**יד — Democratic List of Nazareth: gap.**
- `דמוקרטית נצרת 1949 כרזת בחירות סמל -site:en.wikipedia.org` → U6, U8, U9, U19
- `site:nli.org.il דמוקרטית נצרת 1949 בחירות` → U6, U181

**טו — Fighters List: logo added — E1.**
- `הלוחמים 1949 כרזת בחירות סמל -site:en.wikipedia.org` → U20, U13, U6, U21
- `site:nli.org.il הלוחמים 1949 בחירות` → U6, U185

**ל — Yemenite Association: gap.**
- `התימנים 1949 כרזת בחירות סמל -site:en.wikipedia.org` → U2, U7, U22, U8
- `site:nli.org.il התימנים 1949 בחירות` → U16, U2

Constituents (separate from joint-list lockups):

- `hapoel-hamizrachi` — **gap**. `הפועל המזרחי 1949 כרזה סמל -site:en.wikipedia.org` → U279, U280.
- `mizrachi` — **gap**. `המזרחי 1949 כרזה סמל -site:en.wikipedia.org` → U281, U280.
- `poalei-agudat-yisrael` — **gap**. `פועלי אגודת ישראל 1949 כרזה סמל -site:en.wikipedia.org` → U282, U283.
- `agudat-yisrael` — **gap**. `אגודת ישראל 1949 כרזה סמל -site:en.wikipedia.org` → U282, U284.
- `non-party-religious-union` — **gap**. `האיחוד הדתי הבלתי-מפלגתי 1949 כרזה סמל -site:en.wikipedia.org` → U9, U51.
- `wizo` — **gap**. `הסתדרות נשים ציוניות ויצ"ו 1949 כרזה סמל -site:en.wikipedia.org` → U285, U286.
- `womens-equal-rights-association` — **gap**. `התאחדות נשים לשווי זכויות בישראל 1949 כרזה סמל -site:en.wikipedia.org` → U287, U288.

### k2

**א — Mapai: gap.**
- `מפא״י 1951 כרזת בחירות סמל -site:en.wikipedia.org` → U1, U7, U16, U22
- `site:nli.org.il מפא"י 1951 בחירות` → U16, U186

**צ — General Zionists: gap.**
- `הציונים הכלליים 1951 כרזת בחירות סמל -site:en.wikipedia.org` → U7, U16, U23, U14
- `site:nli.org.il הציונים הכלליים 1951 בחירות` → U16, U187

**מ — Mapam: gap.**
- `מפ״ם 1951 כרזת בחירות סמל -site:en.wikipedia.org` → U7, U5, U16, U22
- `site:nli.org.il מפ"ם 1951 בחירות` → U16, U188

**ה — Hapoel HaMizrahi: gap.**
- `הפועל המזרחי 1951 כרזת בחירות סמל -site:en.wikipedia.org` → U7, U16, U22, U24
- `site:nli.org.il הפועל המזרחי 1951 בחירות` → U16, U189

**ח — Herut: gap.**
- `חרות 1951 כרזת בחירות סמל -site:en.wikipedia.org` → U7, U16, U12, U25
- `site:nli.org.il חרות 1951 בחירות` → U16, U190

**ק — Maki: gap.**
- `מק״י 1951 כרזת בחירות סמל -site:en.wikipedia.org` → U7, U16, U17, U22
- `site:nli.org.il מק"י 1951 בחירות` → U16, U2

**פ — Progressive Party: gap.**
- `הפרוגרסיבים 1951 כרזת בחירות סמל -site:en.wikipedia.org` → U7, U26, U5, U27
- `site:nli.org.il הפרוגרסיבים 1951 בחירות` → U191, U192

**יד — Democratic List for Israeli Arabs: gap.**
- `דמוקרטית לערביי ישראל 1951 כרזת בחירות סמל -site:en.wikipedia.org` → U7, U9, U1, U28
- `site:nli.org.il דמוקרטית לערביי ישראל 1951 בחירות` → U193, U28

**ג — Agudat Yisrael: gap.**
- `אגודת ישראל 1951 כרזת בחירות סמל -site:en.wikipedia.org` → U7, U16, U3, U9
- `פועלי אגודת ישראל 1951 כרזת בחירות סמל -site:en.wikipedia.org` → U7, U16, U3, U9
- `site:nli.org.il אגודת ישראל 1951 בחירות` → U16, U2
- `site:nli.org.il פועלי אגודת ישראל 1951 בחירות` → U16, U2

**סצ — Sephardim and Oriental Communities: gap.**
- `ספרדים ועדות המזרח 1951 כרזת בחירות סמל -site:en.wikipedia.org` → U7, U16, U22, U2
- `site:nli.org.il ספרדים ועדות המזרח 1951 בחירות` → U16, U194

**ב — Mizrahi: gap.**
- `הפועל המזרחי 1951 כרזת בחירות סמל -site:en.wikipedia.org` → U7, U16, U22, U24
- `המזרחי 1951 כרזת בחירות סמל -site:en.wikipedia.org` → U7, U16, U25, U22
- `site:nli.org.il הפועל המזרחי 1951 בחירות` → U16, U189
- `site:nli.org.il המזרחי 1951 בחירות` → U16, U195

**ד — Poalei Agudat Yisrael: gap.**
- `פועלי אגודת ישראל 1951 כרזת בחירות סמל -site:en.wikipedia.org` → U7, U16, U3, U9
- `site:nli.org.il פועלי אגודת ישראל 1951 בחירות` → U16, U2

**נ — Progress and Work: gap.**
- `קידמה ועבודה 1951 כרזת בחירות סמל -site:en.wikipedia.org` → U7, U9, U1, U29
- `site:nli.org.il קידמה ועבודה 1951 בחירות` → U16, U196

**ל — Yemenite Association: gap.**
- `התימנים 1951 כרזת בחירות סמל -site:en.wikipedia.org` → U7, U16, U22, U30
- `site:nli.org.il התימנים 1951 בחירות` → U16, U2

**ע — Agriculture and Development: gap.**
- `חקלאות ופיתוח 1951 כרזה -site:en.wikipedia.org` → U31, U32, U33, U34
- `site:nli.org.il חקלאות ופיתוח 1951 בחירות` → U16, U28

Constituents (separate from joint-list lockups):

None recorded on the winning lists.

### k3

**א — Mapai: gap.**
- `site:nli.org.il מפא"י 1955 בחירות` → U197, U28
- `מפא״י 1955 כרזה -site:en.wikipedia.org` → no URLs; error: 500 Internal Server Error - timeout of 5000ms exceeded

**ח — Herut: gap.**
- `חרות 1955 כרזה -site:en.wikipedia.org` → U35, U36, U37, U25
- `site:nli.org.il חרות 1955 בחירות` → U28, U36

**צ — General Zionists: gap.**
- `site:nli.org.il הציונים הכלליים 1955 בחירות` → U198, U28
- `הציונים הכלליים 1955 כרזה -site:en.wikipedia.org` → no URLs; error: 500 Internal Server Error - timeout of 5000ms exceeded

**ב — National Religious Party: gap.**
- `מפד״ל 1955 כרזה -site:en.wikipedia.org` → U38, U39, U40, U41
- `site:nli.org.il מפד"ל 1955 בחירות` → U199, U200

**תו — Ahdut HaAvoda: gap.**
- `אחדות העבודה 1955 כרזה -site:en.wikipedia.org` → U42, U43, U44, U45
- `site:nli.org.il אחדות העבודה 1955 בחירות` → U28, U201

**מ — Mapam: gap.**
- `מפ״ם 1955 כרזה -site:en.wikipedia.org` → U5, U46, U25, U47
- `site:nli.org.il מפ"ם 1955 בחירות` → U28, U16

**גד — Religious Torah Front: gap.**
- `חזית דתית תורתית 1955 כרזה -site:en.wikipedia.org` → U48, U49, U28, U50
- `site:nli.org.il חזית דתית תורתית 1955 בחירות` → U28, U202

**יד — Democratic List for Israeli Arabs: gap.**
- `דמוקרטית לערביי ישראל 1955 כרזה -site:en.wikipedia.org` → U28, U51, U52, U7
- `site:nli.org.il דמוקרטית לערביי ישראל 1955 בחירות` → U28, U203

**ק — Maki: gap.**
- `מק״י 1955 כרזה -site:en.wikipedia.org` → U53, U17, U54, U55
- `site:nli.org.il מק"י 1955 בחירות` → U204, U205

**נ — Progress and Work: gap.**
- `קידמה ועבודה 1955 כרזה -site:en.wikipedia.org` → U7, U56, U57, U58
- `site:nli.org.il קידמה ועבודה 1955 בחירות` → U16, U206

**פ — Progressive Party: gap.**
- `הפרוגרסיבים 1955 כרזה -site:en.wikipedia.org` → U51, U59, U60, U7
- `site:nli.org.il הפרוגרסיבים 1955 בחירות` → U207, U208

**ע — Agriculture and Development: gap.**
- `חקלאות ופיתוח 1955 כרזה -site:en.wikipedia.org` → U61, U62, U63, U64
- `site:nli.org.il חקלאות ופיתוח 1955 בחירות` → U28, U16

Constituents (separate from joint-list lockups):

- `hapoel-hamizrachi` — **gap**. `הפועל המזרחי 1955 כרזה סמל -site:en.wikipedia.org` → U25, U289.
- `mizrachi` — **gap**. `המזרחי 1955 כרזה סמל -site:en.wikipedia.org` → U28, U290.
- `agudat-yisrael` — **gap**. `אגודת ישראל 1955 כרזה סמל -site:en.wikipedia.org` → U28, U291.
- `poalei-agudat-yisrael` — **gap**. `פועלי אגודת ישראל 1955 כרזה סמל -site:en.wikipedia.org` → U28, U292.

### k4

**א — Mapai: gap.**
- `מפא״י 1959 כרזה -site:en.wikipedia.org` → U22, U25, U65, U66
- `site:nli.org.il מפא"י 1959 בחירות` → U209, U210

**ח — Herut: gap.**
- `חרות 1959 כרזה -site:en.wikipedia.org` → U25, U67, U68, U69
- `site:nli.org.il חרות 1959 בחירות` → U211, U212

**ב — National Religious Party: gap.**
- `מפד״ל 1959 כרזה -site:en.wikipedia.org` → U38, U40, U70, U4
- `site:nli.org.il מפד"ל 1959 בחירות` → U200, U213

**מ — Mapam: gap — E2 (exact date missing).**
- `מפ״ם 1959 כרזה -site:en.wikipedia.org` → U5, U25, U65, U22
- `site:nli.org.il מפ"ם 1959 בחירות` → U6, U209

**צ — General Zionists: gap.**
- `הציונים הכלליים 1959 כרזה -site:en.wikipedia.org` → U25, U71, U22, U72
- `site:nli.org.il הציונים הכלליים 1959 בחירות` → U214, U215

**תו — Ahdut HaAvoda: gap.**
- `אחדות העבודה 1959 כרזה -site:en.wikipedia.org` → U42, U65, U73, U74
- `site:nli.org.il אחדות העבודה 1959 בחירות` → U209, U216

**גד — Religious Torah Front: gap.**
- `חזית דתית תורתית 1959 כרזה -site:en.wikipedia.org` → U50, U75, U76, U77
- `site:nli.org.il חזית דתית תורתית 1959 בחירות` → U217, U218

**רא — Progress and Development: gap.**
- `קידמה ופיתוח 1959 כרזה -site:en.wikipedia.org` → U75, U7, U78, U79
- `site:nli.org.il קידמה ופיתוח 1959 בחירות` → U206, U219

**פ — Progressive Party: gap.**
- `הפרוגרסיבים 1959 כרזה -site:en.wikipedia.org` → U80, U51, U81, U7
- `site:nli.org.il הפרוגרסיבים 1959 בחירות` → U220, U221

**יא — Cooperation and Brotherhood: gap.**
- `שיתוף ואחווה 1959 כרזה -site:en.wikipedia.org` → U82, U83, U84, U85
- `site:nli.org.il שיתוף ואחווה 1959 בחירות` → U222

**ק — Maki: gap.**
- `מק״י 1959 כרזה -site:en.wikipedia.org` → U86, U87, U88, U17
- `site:nli.org.il מק"י 1959 בחירות` → U223, U65

**ע — Agriculture and Development: gap.**
- `חקלאות ופיתוח 1959 כרזה -site:en.wikipedia.org` → U89, U33, U90, U91
- `site:nli.org.il חקלאות ופיתוח 1959 בחירות` → U206, U224

Constituents (separate from joint-list lockups):

- `agudat-yisrael` — **gap**. `אגודת ישראל 1959 כרזה סמל -site:en.wikipedia.org` → U293, U294.
- `poalei-agudat-yisrael` — **gap**. `פועלי אגודת ישראל 1959 כרזה סמל -site:en.wikipedia.org` → U293, U294.

### k5

**א — Mapai: gap.**
- `מפא״י 1961 כרזה -site:en.wikipedia.org` → U25, U4, U22, U92
- `site:nli.org.il מפא"י 1961 בחירות` → U225, U226

**ח — Herut: gap.**
- `חרות 1961 כרזה -site:en.wikipedia.org` → U35, U67, U93, U94
- `site:nli.org.il חרות 1961 בחירות` → U227, U228

**ל — Liberal Party: gap.**
- `הליברלים 1961 כרזה -site:en.wikipedia.org` → U4, U80, U95, U96
- `site:nli.org.il הליברלים 1961 בחירות` → U229, U183

**ב — National Religious Party: gap.**
- `מפד״ל 1961 כרזה -site:en.wikipedia.org` → U38, U4, U40, U97
- `site:nli.org.il מפד"ל 1961 בחירות` → U230, U231

**מ — Mapam: gap.**
- `מפ״ם 1961 כרזה -site:en.wikipedia.org` → U5, U35, U82, U98
- `site:nli.org.il מפ"ם 1961 בחירות` → U226, U232

**תו — Ahdut HaAvoda: gap.**
- `אחדות העבודה 1961 כרזה -site:en.wikipedia.org` → U42, U99, U92, U100
- `site:nli.org.il אחדות העבודה 1961 בחירות` → U233, U234

**ק — Maki: gap.**
- `מק״י 1961 כרזה -site:en.wikipedia.org` → U101, U102, U103, U17
- `site:nli.org.il מק"י 1961 בחירות` → U235, U102

**ג — Agudat Yisrael: gap.**
- `אגודת ישראל 1961 כרזה -site:en.wikipedia.org` → U50, U104, U105, U106
- `פועלי אגודת ישראל 1961 כרזה -site:en.wikipedia.org` → U50, U104, U110, U105
- `site:nli.org.il אגודת ישראל 1961 בחירות` → U236, U237
- `site:nli.org.il פועלי אגודת ישראל 1961 בחירות` → U237, U239

**יא — Cooperation and Brotherhood: gap.**
- `שיתוף ואחווה 1961 כרזה -site:en.wikipedia.org` → U82, U107, U108, U109
- `site:nli.org.il שיתוף ואחווה 1961 בחירות` → U237, U238

**ד — Poalei Agudat Yisrael: gap.**
- `פועלי אגודת ישראל 1961 כרזה -site:en.wikipedia.org` → U50, U104, U110, U105
- `site:nli.org.il פועלי אגודת ישראל 1961 בחירות` → U237, U239

**רא — Progress and Development: gap.**
- `קידמה ופיתוח 1961 כרזה -site:en.wikipedia.org` → U75, U111, U7, U112
- `site:nli.org.il קידמה ופיתוח 1961 בחירות` → U237, U240

Constituents (separate from joint-list lockups):

None recorded on the winning lists.

### k6

**את — Alignment: gap.**
- `המערך 1965 כרזה -site:en.wikipedia.org` → U113, U114, U4, U115
- `site:nli.org.il המערך 1965 בחירות` → U241, U242

**חל — Gahal: gap.**
- `גח״ל 1965 כרזה -site:en.wikipedia.org` → U4, U116, U117, U118
- `site:nli.org.il גח"ל 1965 בחירות` → U231, U243

**ב — National Religious Party: gap.**
- `מפד״ל 1965 כרזה -site:en.wikipedia.org` → U38, U4, U119, U40
- `site:nli.org.il מפד"ל 1965 בחירות` → U241, U231

**מ — Mapam: gap.**
- `מפ״ם 1965 כרזה -site:en.wikipedia.org` → U5, U4, U120, U22
- `site:nli.org.il מפ"ם 1965 בחירות` → U244, U245

**לע — Independent Liberals: gap.**
- `ליברלים עצמאיים 1965 כרזה -site:en.wikipedia.org` → U121, U4, U122, U123
- `site:nli.org.il ליברלים עצמאיים 1965 בחירות` → U241, U246

**ג — Agudat Yisrael: gap.**
- `אגודת ישראל 1965 כרזה -site:en.wikipedia.org` → U124, U50, U125, U126
- `פועלי אגודת ישראל 1965 כרזה -site:en.wikipedia.org` → U50, U130, U131, U115
- `site:nli.org.il אגודת ישראל 1965 בחירות` → U247, U241
- `site:nli.org.il פועלי אגודת ישראל 1965 בחירות` → U241, U242

**ו — Rakah: gap.**
- `רק״ח 1965 כרזה -site:en.wikipedia.org` → U17, U127, U4, U128
- `site:nli.org.il רק"ח 1965 בחירות` → U248, U249

**רא — Progress and Development: gap.**
- `קידמה ופיתוח 1965 כרזה -site:en.wikipedia.org` → U122, U75, U7, U129
- `site:nli.org.il קידמה ופיתוח 1965 בחירות` → U250, U16

**ד — Poalei Agudat Yisrael: gap.**
- `פועלי אגודת ישראל 1965 כרזה -site:en.wikipedia.org` → U50, U130, U131, U115
- `site:nli.org.il פועלי אגודת ישראל 1965 בחירות` → U241, U242

**יא — Cooperation and Brotherhood: gap.**
- `שיתוף ואחווה 1965 כרזה -site:en.wikipedia.org` → U122, U132, U85, U133
- `site:nli.org.il שיתוף ואחווה 1965 בחירות` → U238, U251

**ש — HaOlam HaZeh: gap.**
- `העולם הזה 1965 כרזה -site:en.wikipedia.org` → U134, U135, U117, U136
- `site:nli.org.il העולם הזה 1965 בחירות` → U252, U253

**ק — Maki: gap.**
- `מק״י 1965 כרזה -site:en.wikipedia.org` → U17, U127, U137, U4
- `site:nli.org.il מק"י 1965 בחירות` → U254, U255

Constituents (separate from joint-list lockups):

- `mapai` — **gap**. `מפא"י – מפלגת פועלי ארץ ישראל 1965 כרזה סמל -site:en.wikipedia.org` → U165, U4.
- `ahdut-haavoda` — **gap**. `אחדות העבודה – פועלי ציון 1965 כרזה סמל -site:en.wikipedia.org` → U295, U165.
- `herut` — **gap**. `תנועת החרות 1965 כרזה סמל -site:en.wikipedia.org` → U116, U296.
- `liberal-party` — **gap**. `המפלגה הליברלית 1965 כרזה סמל -site:en.wikipedia.org` → U4, U297.

## Returned search URL index

This index records search leads, including irrelevant and wrong-year returns. Inclusion is not endorsement or evidence of official origin. Repeated archive URLs belong to one evidence family, not independent corroboration.
- **U1**: https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%90%22%D7%99
- **U2**: https://www.nli.org.il/he/discover/israel/elections
- **U3**: https://www.maariv.co.il/news/elections-2026/article-1380141
- **U4**: https://www.jstor.org/stable/26922596
- **U5**: https://he.wikipedia.org/wiki/%D7%9E%D7%A4%22%D7%9D
- **U6**: https://merkazruach.nli.org.il/historiyom/hbkhyrvt-hrshvnvt
- **U7**: https://www.idi.org.il/policy/parties-and-elections/elections/1951
- **U8**: https://www.haaretz.co.il/blogs/beithatfutsot/2020-03-02/ty-article/0000017f-f899-d47e-a37f-f9bdf8960000
- **U9**: https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf
- **U10**: https://www.facebook.com/groups/489778988241028/posts/1950490542169858
- **U11**: https://www.idi.org.il/policy/parties-and-elections/elections/1949
- **U12**: https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA
- **U13**: https://www.facebook.com/lehi.heritage/posts/%D7%91%D7%A7%D7%9C%D7%A4%D7%99-1949%D7%90%D7%99%D7%9A-%D7%A0%D7%A8%D7%90%D7%AA%D7%94-%D7%9E%D7%A2%D7%A8%D7%9B%D7%AA-%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C-%D7%91%D7%A9%D7%A0%D7%AA-1949%D7%90%D7%96-%D7%9C%D7%90-%D7%94%D7%99%D7%94-%D7%98%D7%9C%D7%95%D7%95%D7%99%D7%96%D7%99%D7%94-%D7%98%D7%99%D7%A7%D7%98%D7%95%D7%A7-%D7%95%D7%A7%D7%9E%D7%A4%D7%99/1537361101748877
- **U14**: https://www.israelhayom.co.il/magazine/shishabat/article/3690002
- **U15**: https://kavimvenekudot.wordpress.com/category/%D7%A4%D7%95%D7%9C%D7%99%D7%98%D7%99%D7%A7%D7%94/page/30
- **U16**: https://www.nli.org.il/he/discover/israel/elections/1951
- **U17**: https://he.wikipedia.org/wiki/%D7%94%D7%9E%D7%A4%D7%9C%D7%92%D7%94_%D7%94%D7%A7%D7%95%D7%9E%D7%95%D7%A0%D7%99%D7%A1%D7%98%D7%99%D7%AA_%D7%94%D7%99%D7%A9%D7%A8%D7%90%D7%9C%D7%99%D7%AA
- **U18**: https://www.idi.org.il/policy/parties-and-elections/parties/maki
- **U19**: https://www.idi.org.il/tags/63118
- **U20**: https://www.instagram.com/p/Dei1uivj9uv
- **U21**: https://www.instagram.com/reel/De9uCdAgVFK
- **U22**: https://www.ynet.co.il/articles/0,7340,L-4635875,00.html
- **U23**: https://www.walla.co.il/news/israel/2608246
- **U24**: https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%AA%D7%A9%D7%99%D7%A2%D7%99%D7%AA
- **U25**: http://www.zionistarchives.org.il/Pages/ElectionPosters.aspx
- **U26**: https://www.haaretz.co.il/news/elections/2026-10-14/ty-article/000001a1-3b7a-de23-a5fb-bfff8f510000
- **U27**: https://pop.education.gov.il/
- **U28**: https://www.nli.org.il/he/discover/israel/elections/1955
- **U29**: https://fs.knesset.gov.il/%5C1%5CPlenum%5C1_ptm_250083.pdf
- **U30**: https://www.instagram.com/p/Dd_JouoDEk2
- **U31**: https://www.gov.il/BlobFolder/guide/hofeshmeida/he/hofeshmeida_activity_report_2019.pdf
- **U32**: https://www.youtube.com/watch?v=xa7JcYpcCwk
- **U33**: https://he.wikipedia.org/wiki/%D7%9E%D7%A9%D7%A8%D7%93_%D7%94%D7%97%D7%A7%D7%9C%D7%90%D7%95%D7%AA_%D7%95%D7%91%D7%99%D7%98%D7%97%D7%95%D7%9F_%D7%94%D7%9E%D7%96%D7%95%D7%9F
- **U34**: https://www.facebook.com/aravaopenday/videos/%D7%94%D7%AA%D7%A2%D7%A8%D7%95%D7%9B%D7%94-%D7%94%D7%97%D7%A7%D7%9C%D7%90%D7%99%D7%AA-%D7%94%D7%92%D7%93%D7%95%D7%9C%D7%94-%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C-%D7%97%D7%95%D7%96%D7%A8%D7%AA-%D7%9C%D7%90%D7%97%D7%A8-%D7%A9%D7%A0%D7%AA%D7%99%D7%99%D7%9D-28-29-%D7%91%D7%99%D7%A0%D7%95%D7%90%D7%A8-%D7%AA%D7%97%D7%A0%D7%AA-%D7%99%D7%90%D7%99%D7%A8-%D7%91%D7%97%D7%A6%D7%91%D7%94-%D7%94%D7%9B%D7%A0/1407425267692841
- **U35**: http://www.zionistarchives.org.il/Pages/Elections_and_Purim.aspx
- **U36**: https://www.nli.org.il/he/education/teaching-resources/primary-sources/NNL_EDU997013031886805171
- **U37**: https://kotar.cet.ac.il/kotarapp/index/Book.aspx?nBookID=83388472
- **U38**: https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%93%22%D7%9C
- **U39**: https://digital.library.ucla.edu/catalog.html?f%5Bhuman_readable_language_sim%5D%5B%5D=Hebrew&page=394&per_page=100&range%5Byear_isim%5D%5Bbegin%5D=1955&range%5Byear_isim%5D%5Bend%5D=1955&sort=score+desc&view=gallery
- **U40**: https://jewish-faculty.biu.ac.il/files/jewish-faculty/shared/record_group_003_0.pdf
- **U41**: https://www.nli.org.il/he/sheets/NNL_EPHEMERA997001191370405171/NLI
- **U42**: https://he.wikipedia.org/wiki/%D7%90%D7%97%D7%93%D7%95%D7%AA_%D7%94%D7%A2%D7%91%D7%95%D7%93%D7%94_-_%D7%A4%D7%95%D7%A2%D7%9C%D7%99_%D7%A6%D7%99%D7%95%D7%9F
- **U43**: https://www.nli.org.il/he/education/teaching-resources/primary-sources/nnl_edu997013031893205171
- **U44**: https://infocenters.co.il/yadyaari/notebook_ext.asp?book=110094&lang=heb&site=yadyaari
- **U45**: https://kavimvenekudot.wordpress.com/tag/%D7%90%D7%97%D7%93%D7%95%D7%AA-%D7%94%D7%A2%D7%91%D7%95%D7%93%D7%94
- **U46**: https://il.bidspirit.com/ui/lotPage/susita/source/catalog/auction/4440/lot/130170/%D7%9B%D7%A8%D7%96%D7%94-%D7%9E%D7%A4-%D7%9E-1955-%D7%90%D7%A0%D7%93%D7%A8%D7%98%D7%AA-%D7%94%D7%92%D7%91%D7%95%D7%A8%D7%94-%D7%A0%D7%92%D7%91%D7%94?lang=en
- **U47**: https://www.yad-yaari.org.il/at-the-service-of-an-idea
- **U48**: https://il.bidspirit.com/ui/lotPage/tzolmans/source/catalog/auction/3057/lot/125535/%D7%9B%D7%A8%D7%96%D7%AA-%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-%D7%A7%D7%A8%D7%99%D7%90%D7%AA-%D7%92%D7%93%D7%95%D7%9C%D7%99-%D7%94%D7%AA%D7%95%D7%A8%D7%94?lang=he
- **U49**: https://il.bidspirit.com/ui/lotPage/ometz/source/catalog/auction/2881/lot/118804/canonical?lang=he
- **U50**: https://he.wikipedia.org/wiki/%D7%A4%D7%95%D7%A2%D7%9C%D7%99_%D7%90%D7%92%D7%95%D7%93%D7%AA_%D7%99%D7%A9%D7%A8%D7%90%D7%9C
- **U51**: https://he.wikipedia.org/wiki/%D7%93%D7%95%D7%93_%D7%91%D7%9F-%D7%92%D7%95%D7%A8%D7%99%D7%95%D7%9F
- **U52**: https://dayan.org/he/file-download/download/public/16411
- **U53**: https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997014224212805171/NLI
- **U54**: https://www.jstor.org/stable/27097945
- **U55**: https://www.haaretz.co.il/news/elections/2013-01-22/ty-article/0000017f-dbd1-df62-a9ff-dfd7ea160000
- **U56**: https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997014226737705171/NLI
- **U57**: https://www.instagram.com/p/Daah2IPFS7-
- **U58**: http://talitamir.com/catalog/album/190
- **U59**: https://kavimvenekudot.wordpress.com/2014/12/27/%D7%94%D7%9B%D7%A8%D7%96%D7%95%D7%AA-%D7%A9%D7%9C-%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-1955-%D7%A9%D7%99%D7%A9%D7%99%D7%9D-%D7%A9%D7%A0%D7%94-%D7%9C%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-%D7%94
- **U60**: https://www.haaretz.co.il/blogs/beithatfutsot/2018-04-10/ty-article/0000017f-f8b3-ddde-abff-fcf7d59d0000
- **U61**: https://www.eeoc.gov/poster
- **U62**: https://www.allposters.com/
- **U63**: https://www.yadvashem.org/he/remembrance/posters.html
- **U64**: https://www.rabincenter.org.il/%D7%97%D7%99%D7%A0%D7%95%D7%9A-%D7%9B%D7%A8%D7%96%D7%95%D7%AA
- **U65**: https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997014214595405171/NLI
- **U66**: https://il.bidspirit.com/ui/lotPage/cameo/source/catalog/auction/3971/lot/120720/%D7%9B%D7%A8%D7%96%D7%94-%D7%9E%D7%A9%D7%A0%D7%AA-1959%D7%A9%D7%9C-%D7%9E%D7%A4%D7%9C%D7%92%D7%AA-%D7%9E%D7%A4%D7%90-%D7%99?lang=he
- **U67**: https://rafimann.wordpress.com/2015/01/25/%D7%A8%D7%A7-%D7%A6%D7%A2%D7%A7%D7%94-%D7%AA%D7%92%D7%99%D7%A2-%D7%9B%D7%A8%D7%96%D7%95%D7%AA-%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-%D7%A9%D7%9C-%D7%97%D7%A8%D7%95%D7%AA
- **U68**: https://digital.library.ucla.edu/catalog?f%5Bgenre_sim%5D%5B%5D=monographic&f%5Bhuman_readable_language_sim%5D%5B%5D=German&f%5Bhuman_readable_resource_type_sim%5D%5B%5D=still+image&f%5Bmember_of_collections_ssim%5D%5B%5D=Pevzner+Collection&f%5Bprogram_sim%5D%5B%5D=International+Digital+Ephemera+Project&per_page=10&range%5Byear_isim%5D%5Bbegin%5D=1959&range%5Byear_isim%5D%5Bend%5D=1959&sort=exists%28sort_title_tsort%29+desc%2C+sort_title_tsort+desc&view=gallery
- **U69**: https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_propaganda-law_accountability-final-report.pdf
- **U70**: https://www.makorrishon.co.il/magazine/local-magazine/article/272088
- **U71**: https://digital.library.ucla.edu/catalog.html?f%5Bgenre_sim%5D%5B%5D=government+publication&page=7&per_page=50&range%5Byear_isim%5D%5Bbegin%5D=1958&range%5Byear_isim%5D%5Bend%5D=1959&sort=title_alpha_numeric_ssort+desc&view=gallery
- **U72**: https://designarchive.shenkar.ac.il/items/116013
- **U73**: https://digital.library.ucla.edu/catalog.html?f%5Bcombined_subject_ssim%5D%5B%5D=20th+century&page=2&per_page=100&range%5Byear_isim%5D%5Bbegin%5D=1959&range%5Byear_isim%5D%5Bend%5D=1959&sort=date_dtsort+asc&view=list
- **U74**: https://il.bidspirit.com/ui/catalog/auction/kedem/8445/13?lang=he
- **U75**: https://www.jstor.org/stable/26948865
- **U76**: https://archive.nyu.edu/jspui/bitstream/2451/71452/1/8th%20Knesset%20plenum%20February%2025%201976.pdf
- **U77**: https://www.idi.org.il/media/27873/the-elections-in-israel-2022.pdf
- **U78**: https://www.gov.il/he/pages/2017_dec2262
- **U79**: https://p.ynet.co.il/cityschoice
- **U80**: https://www.academia.edu/10236789/The_General_Zionists_The_liberal_alternative_and_its_failure_1959_1961_%D7%A9%D7%A7%D7%99%D7%A2%D7%AA_%D7%94%D7%A6%D7%99%D7%95%D7%A0%D7%99%D7%9D_%D7%94%D7%9B%D7%9C%D7%9C%D7%99%D7%99%D7%9D_%D7%95%D7%9B%D7%99%D7%A9%D7%9C%D7%95%D7%9F_%D7%94%D7%90%D7%9C%D7%98%D7%A8%D7%A0%D7%98%D7%99%D7%91%D7%94_%D7%94%D7%9C%D7%99%D7%91%D7%A8%D7%9C%D7%99%D7%AA
- **U81**: https://swfs.org/wp-content/uploads/2025/12/Globes-25Dec2025.pdf
- **U82**: https://main.knesset.gov.il/News/PressReleases/Documents/250115-2.pdf
- **U83**: https://www.globes.co.il/news/article.aspx?did=1001366839
- **U84**: https://library.mevaker.gov.il/sites/DigitalLibrary/Documents/1950-2008/1963/1963-Iyooim-10.pdf
- **U85**: https://humanities.m.tau.ac.il/sites/humanities.tau.ac.il/files/media_server/humanities/zionism/%D7%99%D7%A9%D7%A8%D7%90%D7%9C/17/elie_podeh.pdf
- **U86**: https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997014214597405171/NLI
- **U87**: https://il.bidspirit.com/ui/lotPage/kedem/source/catalog/auction/8445/lot/152743/canonical?lang=he
- **U88**: https://www.kedem-auctions.com/he/%D7%9E%D7%A4%D7%9C%D7%92%D7%AA-%D7%9E%D7%A7%D7%99-%E2%80%93-%D7%9B%D7%A8%D7%96%D7%94-%D7%9C%D7%9B%D7%91%D7%95%D7%93-%D7%94-1-%D7%91%D7%9E%D7%90%D7%99-1959
- **U89**: https://www.gov.il/BlobFolder/guide/hofeshmeida/he/hofeshmeida_app_5_2016_chukim.pdf
- **U90**: https://library.mevaker.gov.il/sites/DigitalLibrary/Documents/2024/2024.07-75A/2024.07-75A-301-Agriculture.pdf
- **U91**: https://www.hrw.org/sites/default/files/report_pdf/isrpal0415he_4up.pdf
- **U92**: https://www.facebook.com/lavonins/posts/%D7%9C%D7%A7%D7%A8%D7%90%D7%AA-%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA-%D7%A9%D7%99%D7%99%D7%AA%D7%A7%D7%99%D7%99%D7%9E%D7%95-%D7%94%D7%A9%D7%91%D7%95%D7%A2-%D7%9B%D7%A8%D7%96%D7%94-%D7%9E%D7%90%D7%95%D7%A1%D7%A3-%D7%94%D7%9B%D7%A8%D7%96%D7%95%D7%AA-%D7%A9%D7%9C-%D7%9E%D7%9B%D7%95%D7%9F-%D7%9C%D7%91%D7%95%D7%9F-%D7%9B%D7%A8%D7%96%D7%94-%D7%A9%D7%9C-%D7%9E%D7%A4%D7%90%D7%99-/1485853480312655
- **U93**: https://cartoon.org.il/articles/%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-%D7%91%D7%9E%D7%95%D7%93%D7%A2%D7%95%D7%AA-%D7%94%D7%A7%D7%A8%D7%99%D7%A7%D7%98%D7%95%D7%A8%D7%94-%D7%9B%D7%A0%D7%A9%D7%A7-%D7%91%D7%AA%D7%A2%D7%9E%D7%95%D7%9C
- **U94**: https://www.haaretz.co.il/news/elections/past/2015-02-16/ty-article/.premium/0000017f-e9db-dc91-a17f-fddfafad0000
- **U95**: https://he.wikipedia.org/wiki/%D7%9C%D7%99%D7%91%D7%A8%D7%9C%D7%99%D7%96%D7%9D
- **U96**: https://zoha.org.il/139411
- **U97**: https://www.idi.org.il/media/22681/the-role-of-the-member-of-the-knesset.pdf
- **U98**: https://m.facebook.com/lavonins/photos/%D7%94%D7%97%D7%95%D7%93%D7%A9-%D7%9E%D7%A6%D7%95%D7%99%D7%99%D7%9F-76-%D7%A9%D7%A0%D7%94-%D7%9C%D7%94%D7%A7%D7%9E%D7%AA%D7%94-%D7%A9%D7%9C-%D7%9E%D7%A4%D7%9D-%D7%9E%D7%A4%D7%9C%D7%92%D7%AA-%D7%94%D7%A4%D7%95%D7%A2%D7%9C%D7%99%D7%9D-%D7%94%D7%9E%D7%90%D7%95%D7%97%D7%93%D7%AA-%D7%94%D7%99%D7%99%D7%AA%D7%94-%D7%9E%D7%A4%D7%9C%D7%92%D7%94-%D7%A6%D7%99%D7%95%D7%A0%D7%99%D7%AA-%D7%A1%D7%95%D7%A6%D7%99%D7%90/721898310041513
- **U99**: https://jfc.org.il/news_journal/61465-2/98849-2
- **U100**: https://www.facebook.com/lavonins/posts/1488962083335128
- **U101**: https://zoha.org.il/136188
- **U102**: https://www.nli.org.il/ar/archives/NNL_ARCHIVE_AL997014214702105171/NLI
- **U103**: https://maki.org.il/
- **U104**: http://www.zionistarchives.org.il/Pages/ArchiveSearchResults.aspx?k=%22%D7%90%D7%92%D7%95%D7%93%D7%AA%20%D7%99%D7%A9%D7%A8%D7%90%D7%9C%22&t=T2&v=&p=14
- **U105**: https://hashiloach.org.il/life-of-pai
- **U106**: https://www.nli.org.il/he/newspapers/haretz/1961/10/11/01/page/2
- **U107**: https://www.jewishgen.org/yizkor/lutsk1/files/Lutsk_Hebrew.pdf
- **U108**: https://archive.nyu.edu/bitstream/2451/71288/1/6th%20Knesset%20plenum%20July%2024%201968%20.pdf
- **U109**: https://fs.knesset.gov.il/%5C4%5CPlenum%5C4_ptm_251649.pdf
- **U110**: https://www.nli.org.il/he/newspapers/panimelpanim/1961/02/10/01/page/11
- **U111**: https://fs.knesset.gov.il/%5C4%5CPlenum%5C4_ptm_251731.pdf
- **U112**: https://www.amnesty.org/zh-hans/wp-content/uploads/2021/05/MDE1507452019HEBREW.pdf
- **U113**: https://www.yadvashem.org/he/education/educational-materials/learning-environment/crazot.html
- **U114**: https://www.nli.org.il/he/sheets/NNL_ARCHIVE_AL990034557850205171/NLI
- **U115**: https://www.kkl.org.il/exhibitions_historical_posters
- **U116**: https://he.wikipedia.org/wiki/%D7%AA%D7%A0%D7%95%D7%A2%D7%AA_%D7%94%D7%97%D7%A8%D7%95%D7%AA
- **U117**: https://www.facebook.com/groups/489778988241028/posts/2200410193844557
- **U118**: https://www.nli.org.il/he/sheets/NNL_EPHEMERA997001047360405171/NLI
- **U119**: https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997012156938005171/NLI
- **U120**: https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997014221228805171/NLI
- **U121**: https://jfc.org.il/news_journal/60668-2/96472-2
- **U122**: https://he.wikipedia.org/wiki/%D7%94%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A9%D7%99%D7%A9%D7%99%D7%AA
- **U123**: https://www.nli.org.il/he/sheets/NNL_ARCHIVE_AL990034507400205171/NLI
- **U124**: https://www.nli.org.il/he/archives/NNL_Ephemera997000745190405171/NLI
- **U125**: https://digital.library.ucla.edu/catalog.html?f%5Bgenre_sim%5D%5B%5D=government+publication&page=9&per_page=100&range%5Byear_isim%5D%5Bbegin%5D=1964&range%5Byear_isim%5D%5Bend%5D=1965&sort=date_dtsort+asc&view=gallery
- **U126**: http://www.zionistarchives.org.il/AttheCZA/AdditionalArticles/Pages/Decade.aspx
- **U127**: https://www.hamichlol.org.il/%D7%94%D7%9E%D7%A4%D7%9C%D7%92%D7%94_%D7%94%D7%A7%D7%95%D7%9E%D7%95%D7%A0%D7%99%D7%A1%D7%98%D7%99%D7%AA_%D7%94%D7%99%D7%A9%D7%A8%D7%90%D7%9C%D7%99%D7%AA
- **U128**: https://www.nli.org.il/he/archives/nnl_archive_al990032475900205171/NLI
- **U129**: https://www.knesset.gov.il/committees/heb/docs/mada15-4.htm
- **U130**: https://www.nli.org.il/he/sheets/NNL_EPHEMERA997001550670405171/NLI
- **U131**: http://www.zionistarchives.org.il/events/Looking%20north/Pages/HaGalila.aspx
- **U132**: https://fs.knesset.gov.il/%5C7%5CPlenum%5C7_ptm_252845.pdf
- **U133**: https://www.kan.org.il/content/radio_articles/editors_choice88/1111414
- **U134**: https://he.wikipedia.org/wiki/%D7%94%D7%A2%D7%95%D7%9C%D7%9D_%D7%94%D7%96%D7%94
- **U135**: https://www.mekomit.co.il/%D7%94%D7%A2%D7%95%D7%9C%D7%9D-%D7%94%D7%96%D7%94-2-0
- **U136**: https://documentingtheleft.org/2024/09/24/haolam-hazeh-koah-hadash
- **U137**: https://documentingtheleft.org/2023/07/23/maki
- **U138**: https://il.bidspirit.com/ui/lotPage/kedmatdena/source/catalog/auction/76418/lot/142280/canonical?lang=en
- **U139**: https://www.ynet.co.il/news/article/H158fCGfO
- **U140**: https://www.facebook.com/KnessetMuseum/posts/%D7%94%D7%99%D7%95%D7%9D-%D7%9C%D7%A4%D7%A0%D7%99-56-%D7%A9%D7%A0%D7%94-%D7%96%D7%9B%D7%AA%D7%94-%D7%9E%D7%A4%D7%9C%D7%92%D7%AA-%D7%94%D7%9E%D7%A2%D7%A8%D7%9A-%D7%91-56-%D7%9E%D7%A0%D7%93%D7%98%D7%99%D7%9D%D7%91%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA-%D7%94%D7%A9%D7%91%D7%99%D7%A2%D7%99%D7%AA-%D7%A9%D7%94%D7%AA%D7%A7%D7%99%D7%99%D7%9E%D7%95-%D7%91-28/1142692234718826
- **U141**: https://www.nli.org.il/en/archives/NNL_ARCHIVE_AL997014226598105171/NLI
- **U142**: https://www.nli.org.il/he/sheets/NNL_EPHEMERA997003313240405171/NLI
- **U143**: https://digital.library.ucla.edu/catalog.html?f%5Bgenre_sim%5D%5B%5D=government+publication&page=6&per_page=20&range%5Byear_isim%5D%5Bbegin%5D=1969&range%5Byear_isim%5D%5Bend%5D=1969&sort=date_dtsort+desc&view=gallery
- **U144**: https://www.facebook.com/groups/489778988241028/posts/2176978049521105
- **U145**: https://www.gov.il/apps/elections/elections-knesset-19/heb/cec/notice140113.html
- **U146**: https://digital.library.ucla.edu/catalog.html?f%5Bcombined_subject_ssim%5D%5B%5D=%D7%A1%D7%A4%D7%A8%D7%93%D7%99%D7%9D&per_page=50&range%5Byear_isim%5D%5Bbegin%5D=1969&range%5Byear_isim%5D%5Bend%5D=1969&sort=date_dtsort+desc&view=list
- **U147**: https://archive.nyu.edu/bitstream/2451/71289/1/6th%20Knesset%20plenum%20February%2011%201969.pdf
- **U148**: https://shamir-brothers.com/?id=26.0.0.html
- **U149**: https://humanities.m.tau.ac.il/sites/humanities.tau.ac.il/files/media_server/humanities/zionism/%D7%99%D7%A9%D7%A8%D7%90%D7%9C/31-32/arnon_golan.pdf
- **U150**: https://he.wikipedia.org/wiki/%D7%95%D7%A2%D7%93%D7%AA_%D7%97%D7%A7%D7%99%D7%A8%D7%94_%D7%9E%D7%9E%D7%9C%D7%9B%D7%AA%D7%99%D7%AA_(%D7%99%D7%A9%D7%A8%D7%90%D7%9C)
- **U151**: https://www.adalah.org/uploads/oldfiles/admin/DownLoads/SPics/4504111.pdf
- **U152**: https://www.nevo.co.il/
- **U153**: https://www.facebook.com/TheZalmanShazarCenter/posts/%D7%94%D7%99%D7%95%D7%9D-%D7%98%D7%96-%D7%91%D7%97%D7%A9%D7%95%D7%95%D7%9F-%D7%90%D7%96%D7%A8%D7%97%D7%99-%D7%99%D7%A9%D7%A8%D7%90%D7%9C-%D7%94%D7%95%D7%9C%D7%9B%D7%99%D7%9D-%D7%9C%D7%9E%D7%9E%D7%A9-%D7%90%D7%AA-%D7%96%D7%9B%D7%95%D7%AA%D7%9D-%D7%94%D7%93%D7%9E%D7%95%D7%A7%D7%A8%D7%98%D7%99%D7%AA-%D7%91%D7%A7%D7%9C%D7%A4%D7%99-%D7%95%D7%9C%D7%95%D7%97-%D7%94%D7%A9%D7%A0%D7%94-%D7%94%D7%A2%D7%91%D7%A8%D7%99-/2017428579580087
- **U154**: https://documentingtheleft.org/tag/%D7%A8%D7%A7%D7%97
- **U155**: https://matzpen.org/1969-05-27/%E2%80%8F%D7%90%D7%97%D7%93-%D7%91%D7%9E%D7%90%D7%99-1969-%D7%91%D7%99%D7%A4%D7%95-%D7%94%D7%A9%D7%AA%D7%95%D7%9C%D7%9C%D7%95%D7%AA-%D7%A8%D7%A7%D7%97%D7%99%D7%A1%D7%98%D7%99%D7%AA-%D7%91%D7%AA
- **U156**: https://fs.knesset.gov.il/7/Plenum/7_ptm_253118.pdf
- **U157**: https://www.gov.il/BlobFolder/reports/molsa-research-and-evaluation-nov-2019-2-mitve/he/Documents_Publications_community-involvements.pdf
- **U158**: https://digital.library.ucla.edu/catalog.html?f%5Bgenre_sim%5D%5B%5D=monographic&page=3&per_page=50&range%5Byear_isim%5D%5Bbegin%5D=1960&range%5Byear_isim%5D%5Bend%5D=1969&sort=date_dtsort+asc&view=gallery
- **U159**: https://il.bidspirit.com/ui/catalog/auction/sold2/37335/31?lang=he
- **U160**: https://archive.nyu.edu/bitstream/2451/71479/1/8th%20Knesset%20plenum%20March%2010%201974.pdf
- **U161**: https://bgh.org.il/wp-content/uploads/2026/07/israel-hamechudeshet-b.pdf
- **U162**: https://il.bidspirit.com/ui/catalog/auction/datzke/4267/3
- **U163**: https://www.youtube.com/watch?v=Rb50JHiwCRM
- **U164**: https://www.nli.org.il/en/archives/NNL_ARCHIVE_AL997014217995905171/NLI
- **U165**: https://he.wikipedia.org/wiki/%D7%A8%D7%A9%D7%99%D7%9E%D7%AA_%D7%A4%D7%95%D7%A2%D7%9C%D7%99_%D7%99%D7%A9%D7%A8%D7%90%D7%9C
- **U166**: https://www.facebook.com/KnessetMuseum/posts/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-%D7%94%D7%A8%D7%90%D7%A9%D7%95%D7%A0%D7%95%D7%AA-%D7%A9%D7%A0%D7%93%D7%97%D7%95-%D7%91%D7%92%D7%9C%D7%9C-%D7%9E%D7%9C%D7%97%D7%9E%D7%94-%D7%94%D7%99%D7%95%D7%9D-%D7%9C%D7%A4%D7%A0%D7%99-52-%D7%A9%D7%A0%D7%94%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA-%D7%94%D7%A9%D7%9E%D7%99%D7%A0%D7%99%D7%AA-%D7%94%D7%99%D7%95-%D7%91%D7%97%D7%99%D7%A8/1191932563128126
- **U167**: https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A9%D7%9E%D7%99%D7%A0%D7%99%D7%AA
- **U168**: https://main.knesset.gov.il/About/History/Pages/KnessetHistory.aspx?kns=8
- **U169**: https://merkazruach.nli.org.il/historiyom/bkhyrvt-1973
- **U170**: http://elections-calculator.atwebpages.com/%D7%AA%D7%95%D7%A6%D7%90%D7%95%D7%AA-%D7%A7%D7%95%D7%93%D7%9E%D7%95%D7%AA.php?elections=8
- **U171**: https://www.nli.org.il/he/items/NNL_MUSIC_AL997010179616105171/NLI
- **U172**: https://il.bidspirit.com/ui/catalog/auction/susita/8103/5?lang=he
- **U173**: https://www.kedem-auctions.com/he/node/182265?page=14
- **U174**: https://merkazruach.nli.org.il/ar/historiyom/bkhyrvt-1973
- **U175**: https://fs.knesset.gov.il/%5C7%5CPlenum%5C7_ptm_253094.pdf
- **U176**: https://jfc.org.il/news_journal/111832-2
- **U177**: https://jfc.org.il/news_journal/130379
- **U178**: https://www.hrw.org/sites/default/files/report_pdf/israel0116he_web2.pdf
- **U179**: https://www.gov.il/BlobFolder/policy/document_of_agricultural_and_rural_planning_policy_in_israel/he/rural-planning_document_of_agricultural_and_rural_planning_policy_in_israel_vol_1.pdf
- **U180**: https://fs.knesset.gov.il/%5C7%5CPlenum%5C7_ptm_252942.pdf
- **U181**: https://blog.nli.org.il/chov-first-government
- **U182**: https://blog.nli.org.il/chov-first-elections-campaigns
- **U183**: https://www.nli.org.il/he/newspapers/hrt/1961/06/26/01/article/33
- **U184**: https://www.nli.org.il/he/newspapers/hador/1949/01/31/01
- **U185**: https://www.nli.org.il/en/newspapers/dav/1949/01/23/01/article/20?&
- **U186**: https://merkazruach.nli.org.il/historiyom/mshbr-hdyvr-hbkhyrvt-lknst-hshnyyh
- **U187**: https://www.nli.org.il/he/newspapers/dav/1951/10/09/01/page/1?&
- **U188**: https://www.nli.org.il/he/newspapers/haretz/1951/04/30/01/article/20?&
- **U189**: https://www.nli.org.il/en/newspapers?a=d&d=hrt19510221-01.2.70&l=en
- **U190**: https://www.nli.org.il/he/newspapers/hrt/1951/03/16/01/article/34?&
- **U191**: https://www.nli.org.il/he/newspapers/haretz/1951/04/05/01/article/19
- **U192**: https://www.nli.org.il/en/newspapers?a=d&d=mar19510725-01.1.2&l=en
- **U193**: https://www.nli.org.il/he/newspapers?olive_path=%2FOlive%2FAPA%2FNLI_Heb%2FSharedView%2EArticle%2Easpx&olive_query=parm%3DRztb5SEURfiw%2FwdqEXbuKET7RkWAh14YOWHABanIGgsSH%2Fh2AYQPxH2gmGk%2FLpV6Yw%253D%253D%26mode%3Dimage%26href%3DDAV%2F1951%2F09%2F11%26page%3D1%26rtl%3Dtrue
- **U194**: https://www.nli.org.il/he/newspapers/hed/1951/02?
- **U195**: https://www.nli.org.il/he/newspapers?olive_path=%2Folive%2Fapa%2Fnli_heb%2FSharedView%2EArticle%2Easpx&olive_query=href%3DAHR%2F1951%2F06%2F26%26id%3DAr00103
- **U196**: https://www.nli.org.il/he/newspapers?a=d&d=hrt19510625-01.1.1&l=he
- **U197**: https://merkazruach.nli.org.il/historiyom/mp-y-ngd-rdyv-dmshq-hbkhyrvt-lknst-hshlyshyt
- **U198**: https://www.nli.org.il/he/newspapers?a=d&d=haretz19550323-01.2.21&l=he
- **U199**: https://www.nli.org.il/en/newspapers/zmanim/1955/08/16/01/article/23?&
- **U200**: https://www.nli.org.il/en/newspapers/dav/1978/04/13/01/article/93?&
- **U201**: https://www.nli.org.il/he/newspapers?a=d&d=dav19550531-01.2.17&l=he
- **U202**: https://www.nli.org.il/he/newspapers?olive_path=%2Folive%2Fapa%2Fnli_heb%2FSharedView%2EArticle%2Easpx&olive_query=href%3DLMRV%2F1955%2F06%2F12%26id%3DAr00202
- **U203**: https://www.nli.org.il/he/newspapers/dav/1955/10/06/01/page/3?&
- **U204**: https://www.nli.org.il/he/newspapers/khm/1955/07/24/01/article/10?&
- **U205**: https://www.nli.org.il/he/newspapers/khm/1955/05/22/01/page/1?&
- **U206**: https://www.nli.org.il/en/newspapers/dav/1959/09/09/01/page/1?&
- **U207**: https://www.nli.org.il/he/newspapers/lmrv/1955/06/24/01/article/118
- **U208**: https://www.nli.org.il/he/newspapers/hhr/1955/05/10/01/page/7
- **U209**: https://www.nli.org.il/he/newspapers/dav/1959/10/30/01/page/25?&
- **U210**: https://www.nli.org.il/en/newspapers?a=d&d=dav19590731-01.2.173&l=en
- **U211**: https://www.nli.org.il/he/newspapers?a=d&d=hrt19590522-01.1.2&l=he
- **U212**: https://merkazruach.nli.org.il/historiyom/bkhyrvt-1959-vyrv-y-vdy-slyb
- **U213**: https://www.nli.org.il/he/newspapers/haretz/1968/11/10/01/article/77
- **U214**: https://www.nli.org.il/he/articles/RAMBI990004526120705171/NLI
- **U215**: https://www.nli.org.il/en/newspapers?a=d&d=hrt19590715-01.2.20&l=en
- **U216**: https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997014212794805171/NLI
- **U217**: https://www.nli.org.il/ar/newspapers/shar/1959/09/23/01/page/4?&
- **U218**: https://www.nli.org.il/he/newspapers/hrt/1959/12/01/01/page/2
- **U219**: https://www.nli.org.il/he/newspapers/khm/1959/05/15/01/article/15?&
- **U220**: https://www.nli.org.il/he/newspapers/dav/1959/09/04/01/article/175?&
- **U221**: https://www.nli.org.il/he/newspapers/dav/1959/02/10/01
- **U222**: https://www.nli.org.il/he/newspapers/hbkr/1959/07/17/01/page/2?&
- **U223**: https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997014214604505171/NLI
- **U224**: https://www.nli.org.il/he/newspapers/dav/1959/04/12/01/page/5
- **U225**: https://www.nli.org.il/he/newspapers/dav/1961/04/16/01/article/14?&
- **U226**: https://www.nli.org.il/he/newspapers/dav/1961/04/14/01/article/64?&
- **U227**: https://www.nli.org.il/he/newspapers/hrt/1961/11/13/01/article/28?&
- **U228**: https://www.nli.org.il/he/newspapers/hrt/1961/04/02/01/article/28?&
- **U229**: https://www.nli.org.il/he/newspapers/haretz/1961/07/12/01/article/36
- **U230**: https://www.nli.org.il/he/newspapers/haretz/1961/04/25/01/article/15?&
- **U231**: https://www.nli.org.il/he/newspapers/haretz/1965/11/12/01/article/166?&
- **U232**: https://www.nli.org.il/en/newspapers/ahr/1961/02/13/01/article/89?&
- **U233**: https://www.nli.org.il/he/newspapers/hhr/1961/04/04/01/page/2
- **U234**: https://www.nli.org.il/en/newspapers/hrt/1961/03/14/01/page/1
- **U235**: https://www.nli.org.il/ar/newspapers?a=d&d=hrt19610829-01.2.32&l=ar
- **U236**: https://www.nli.org.il/he/newspapers?a=d&d=dav19610208-01.2.2&l=he
- **U237**: https://www.nli.org.il/ar/newspapers/khm/1961/06/27/01/article/12?&
- **U238**: https://www.nli.org.il/en/newspapers?l=en&olive_path=%2Folive%2Fapa%2Fnli_heb%2FSharedView.Article.aspx&olive_query=href%3DMAR%2F1989%2F03%2F02%26id%3DAr00701
- **U239**: https://www.nli.org.il/he/newspapers/hhr/1961/07/04/01/page/9
- **U240**: https://www.nli.org.il/he/newspapers/hhr/1961/12/19/01/page/11
- **U241**: https://www.nli.org.il/he/newspapers/haretz/1965/11/12/01/article/167?&
- **U242**: https://www.nli.org.il/ar/newspapers/hrt/1965/10/29/01/page/14?&
- **U243**: https://www.nli.org.il/en/newspapers/hrt/1965/11/19/01/article/138?&
- **U244**: https://www.nli.org.il/he/newspapers/ahr/1965/05/17/01/article/107?&
- **U245**: https://www.nli.org.il/he/newspapers/hhr/1965/07/27/01/page/11
- **U246**: https://www.nli.org.il/he/newspapers/mar/1965/03/08/01/article/150?&
- **U247**: https://www.nli.org.il/he/newspapers/haretz/1965/09/20/01/page/7?&
- **U248**: https://www.nli.org.il/ar/newspapers/khm/1965/10/14/01/page/2
- **U249**: https://www.nli.org.il/he/newspapers/haretz/1969/10/31/01/article/98?&
- **U250**: https://www.nli.org.il/en/newspapers?a=d&d=dav19650212-01.1.5&l=en
- **U251**: https://www.nli.org.il/he/items/NNL_MUSIC_AL990036968800205171/NLI
- **U252**: https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL990047362080205171/NLI
- **U253**: https://www.nli.org.il/he/newspapers/lmrv/1965/08/04/01/page/2?&
- **U254**: https://www.nli.org.il/en/newspapers/mar/1965/06/16/01/article/141?&
- **U255**: https://www.nli.org.il/en/newspapers?a=d&d=khm19651021-01.1.3&l=en
- **U256**: https://www.nli.org.il/he/newspapers/hhr/1969/08/26/01/page/2
- **U257**: https://www.nli.org.il/en/newspapers?a=d&d=haretz19690619-01.2.72&l=en
- **U258**: https://www.nli.org.il/he/newspapers/haretz/1969/10/29/01/article/19?&
- **U259**: https://www.nli.org.il/he/newspapers/hayomisr/1969/11/06/01/article/13
- **U260**: https://www.nli.org.il/he/newspapers/haretz/1969/10/29/01/page/5?&
- **U261**: https://suicidology.org/
- **U262**: https://www.apaonline.org/
- **U263**: https://www.nli.org.il/en/newspapers?l=en&olive_path=%2FOlive%2FAPA%2FNLI_heb%2FSharedView.Article.aspx&olive_query=href%3DDAV%252F1969%252F09%252F26%26id%3DAr00209%26sk%3D3361D426
- **U264**: https://www.nli.org.il/he/newspapers/mar/1969/09/01/01/article/130?&
- **U265**: https://www.nli.org.il/he/newspapers/hhr/1969/06/17/01/page/2
- **U266**: https://www.nli.org.il/en/newspapers/dav/1969/11/04/01/page/6?&
- **U267**: https://www.nli.org.il/he/discover/institutions
- **U268**: https://www.nli.org.il/he/newspapers?a=d&d=haretz19690916-01.1.5&l=he
- **U269**: https://www.nli.org.il/he/newspapers/mar/1969/01/29/01/article/59
- **U270**: https://www.nli.org.il/he/newspapers/lmrv/1969/02/10/01/article/22
- **U271**: https://www.nli.org.il/he/newspapers/mar/1973/10/02/01/article/55?&
- **U272**: https://www.nli.org.il/en/newspapers/ahr/1973/06/12/01/article/45
- **U273**: https://www.nli.org.il/he/newspapers/dav/1973/11/07/01/article/51?&
- **U274**: https://www.nli.org.il/he/newspapers/dav/1973/03/13/01/article/2?&
- **U275**: https://www.nli.org.il/he/newspapers/ahr/1973/09/13/01/article/43?&
- **U276**: https://www.nli.org.il/he/newspapers/dav/1973/09/17/01/article/6?&dliv=none&e=-------he-20--1--img-txIN%7CtxTI--------------1&utm_source=he.wikipedia.org&utm_medium=referral&utm_campaign=%22%D7%90%D7%95%D7%A8%D7%99+%D7%90%D7%91%D7%A0%D7%A8%D7%99%22&utm_content=itonut
- **U277**: https://www.nli.org.il/he/discover/israel/israeli-history/israel-wars/yom-kippur-war
- **U278**: https://www.nli.org.il/he/newspapers/ahr/1978/11/01/01/article/48?&
- **U279**: https://www.kedem-auctions.com/he/%D7%97%D7%92%D7%99%D7%92%D7%95%D7%AA-%D7%94%D7%A2%D7%A9%D7%95%D7%A8-%D7%A9%D7%9C-%D7%90%D7%92%D7%95%D7%93%D7%AA-%D7%94%D7%A1%D7%A4%D7%95%D7%A8%D7%98-%D7%90%D7%9C%D7%99%D7%A6%D7%95%D7%A8-1949-%E2%80%93-%D7%9B%D7%A8%D7%96%D7%94
- **U280**: https://www.nli.org.il/he/sheets/NNL_Ephemera997001550090405171/NLI
- **U281**: https://www.facebook.com/israelarchives/posts/10021949-%D7%9E%D7%95%D7%A2%D7%A6%D7%AA-%D7%94%D7%9E%D7%93%D7%99%D7%A0%D7%94-%D7%94%D7%96%D7%9E%D7%A0%D7%99%D7%AA-%D7%9E%D7%90%D7%9E%D7%A6%D7%AA-%D7%90%D7%AA-%D7%A1%D7%9E%D7%9C-%D7%9E%D7%93%D7%99%D7%A0%D7%AA-%D7%99%D7%A9%D7%A8%D7%90%D7%9C-%D7%91%D7%A2%D7%99%D7%A6%D7%95%D7%91%D7%9D-%D7%A9%D7%9C-%D7%94%D7%90%D7%97%D7%99%D7%9D-%D7%A9%D7%9E%D7%99%D7%A8%D7%A2%D7%99%D7%A6%D7%95%D7%91/1027317256099799
- **U282**: http://www.zionistarchives.org.il/en/Pages/TozeretHaaretz.aspx?lang=he
- **U283**: https://www.kedem-auctions.com/he/node/43224?page=24
- **U284**: https://www.israel.com/he/israel-flag
- **U285**: https://www.nli.org.il/he/articles/RAMBI990002051430705171/NLI
- **U286**: https://www.magnespress.co.il/FileManager/Files/Yehiam%20Weitz%20(Cathedra%20178).PDF
- **U287**: http://www.ruthmarkus.com/wp-content/uploads/2016/07/%D7%A0%D7%A9%D7%99%D7%9D-%D7%99%D7%95%D7%A6%D7%A8%D7%95%D7%AA.pdf
- **U288**: https://ptarchive.wordpress.com/category/%D7%A2%D7%91%D7%A8%D7%99%D7%AA
- **U289**: https://www.kedem-auctions.com/he/search?page=2951
- **U290**: https://www.kedem-auctions.com/he/search?page=2441
- **U291**: https://www.imj.org.il/node/6355886
- **U292**: https://il.bidspirit.com/ui/catalog/auction/kedmatdena/79240/18?lang=en
- **U293**: https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997009701753305171/NLI
- **U294**: https://shamir-brothers.com/?id=23.0.0.html
- **U295**: https://www.nli.org.il/he/sheets/NNL_EPHEMERA997000945570405171/NLI
- **U296**: https://humanities.m.tau.ac.il/sites/humanities.tau.ac.il/files/media_server/all-units/%D7%91%D7%99%D7%AA%20%D7%A1%D7%A4%D7%A8%20%D7%9C%D7%9E%D7%93%D7%A2%D7%99%20%D7%94%D7%99%D7%94%D7%93%D7%95%D7%AA/%D7%A2%D7%91%D7%95%D7%93%D7%95%D7%AA%20%D7%93%D7%95%D7%A7%D7%98%D7%95%D7%A8%D7%98/Moshe%20Fuksman%20Shal-%20Ph.D.pdf
- **U297**: https://jfc.org.il/news_journal/60657-2/94938-2
- **U298**: https://jfc.org.il/compilation/%D7%90%D7%95%D7%A1%D7%A3-%D7%90%D7%A8%D7%9B%D7%99%D7%95%D7%9F-%D7%9E%D7%A4%D7%9C%D7%92%D7%AA-%D7%94%D7%A2%D7%91%D7%95%D7%93%D7%94
- **U299**: https://he.wikipedia.org/wiki/%D7%94%D7%9C%D7%99%D7%9B%D7%95%D7%93
- **U300**: https://www.nli.org.il/he/books/NNL_ALEPH990021689040205171/NLI
- **U301**: https://he.wikipedia.org/wiki/%D7%93%D7%92%D7%9C_%D7%94%D7%AA%D7%95%D7%A8%D7%94
- **U302**: https://www.nli.org.il/he/sheets/NNL_EPHEMERA997001285990405171/NLI
- **U303**: https://shamir-brothers.com/?id=10.0.0.html
- **U304**: https://he.wikipedia.org/wiki/%D7%94%D7%94%D7%A1%D7%AA%D7%93%D7%A8%D7%95%D7%AA_%D7%94%D7%9B%D7%9C%D7%9C%D7%99%D7%AA_%D7%A9%D7%9C_%D7%94%D7%A2%D7%95%D7%91%D7%93%D7%99%D7%9D_%D7%91%D7%90%D7%A8%D7%A5_%D7%99%D7%A9%D7%A8%D7%90%D7%9C
- **U305**: https://shamir-brothers.com/?id=6.0.0.html
- **U306**: https://www.nli.org.il/he/archives/NNL_ARCHIVE_AL997014214579805171/NLI
- **U307**: https://www.nli.org.il/en/archives/NNL_ARCHIVE_AL997014214828905171/NLI
- **U308**: https://he.wikipedia.org/wiki/%D7%9B%D7%A8%D7%96%D7%AA_%D7%99%D7%95%D7%9D_%D7%94%D7%A2%D7%A6%D7%9E%D7%90%D7%95%D7%AA
- **U309**: https://www.instagram.com/reel/C9Po0T5IeYQ
- **U310**: https://www.nli.org.il/he/books/NNL_ALEPH990018933960205171/NLI

## Remaining gaps and conclusion map

- **Inaccessible original / API identifier unresolved:** Fighters NLI source remains uninspected (accepted Commons assignment is explicitly medium confidence); current NLI and JPress routes hit challenges and the attempted IIIF manifest returned an internal error. Per-list NLI catalogue hits remain leads, not usable assets.
- **Dated material inspected, no separate emblem accepted:** Herut k1; national religious joint list k3; Maki k4; Mapai k2 (also conflicting caption precision). Letter-only observations do not prove non-use.
- **Original asset not acquired / campaign design not established:** every other identity still marked gap, including all satellite Arab lists and all 32 constituent identities. Search records above identify exact names and years; no borrowing from adjacent elections. Joint-list origin remains separate from constituent origin.

Conclusion map: E1 supports the medium-confidence k1 Fighters assignment under the existing Commons policy; limitation is inaccessible upstream NLI and licence metadata conflict. E2 supports the origin and campaign year of the k4 Mapam crop candidate, but fails the existing complete-date build gate; it remains a gap, also with scan-edge clipping. E3 contradicts the assumption that every poster yields a standalone emblem; it does not support campaign-wide absence. E4 provides a 1955 official-poster lead but does not support transferring the 1959 design. The remaining outcomes are unresolved, with low confidence in any historical absence claim. A retrieved dated official original showing the exact emblem and a legible crop would change each gap outcome. Search-result and source-family totals are not presented as pages reviewed.

## Verification

Election batches run the requested Vitest, TypeScript, Vite and logo-validator commands. Final results and retained byte hashes will be recorded after k8. No push or merge.
