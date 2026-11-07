# Locality map lines — audited source and depiction decisions

7 November 2026. Twelve separately controlled layers ship. This revision addresses the second independent review of `81b1e00`, following the first review of `1cdcde2`; its geometry and source claims supersede the earlier reports. These are approximate historical/cartographic overlays, not pillar surveys. No product has been shown to provide independent original survey control. Provider labels and boundaries remain hidden.

## Lines and source checks

| Layer | Sources / dates | Check and depiction | Shipped |
|---|---|---|---|
| Armistice lines · Judea and Samaria | OSM relation 7304999 and local OCHA Ramadin segment, retrieved 2026-11-07; UN map229, November1949; signed Map1; 1949 Jordan agreement V(1)(a–c), VI(9), VI(11) | Raw OSM/OCHA maximum 2,370.5 m includes the Scopus outline missing from OCHA. Central Jerusalem replaces the faulty OSM pair with a UN229 digitization under a seven-control similarity registration (8–59 m residuals). Outside that coverage, OSM remains approximate: ordinary source differences reach about843m. The signed Map1 tie-break supports OCHA locally at Ramadin, substituted without invented joins. No unverified rectification is claimed. | Yes, with scale limits |
| No-man’s-land · 1949–1967 | OSM paired edges at Latrun; UN229 in central Jerusalem; MFA Jerusalem background; Frid, pp.470–473 | Two polygons: Latrun and corrected central Jerusalem north of Palestine-grid N130. Government House is separate. Abu Tor gap is about 280 m at 31.7694 N. North pair/fill continues to the registered raster edge near 31.800 N. Latrun eastern closure follows OSM and was never defined on an agreed map. | Yes |
| Government House zone · 1949–1967 | OSM outlines; Israel State Archives; MFA Jerusalem background; Frid (TAU, 2024), pp.470–477 | Separate cross-hatch, clipped at Palestine Belt grid N128000 and N130000. Government House point is inside this zone and outside no-man’s-land. The temporary four-month civilian terms, Jordan’s refusal to approve the unsigned Nuwar–Dayan line, and de facto recognition are described; its internal civilian line is not invented. Positional accuracy is unquantified, so overview only. | Yes |
| Mount Scopus · Israeli enclave · 1948–1967 | OSM northern arc; State Archives and MFA | Partial open northern outline, excluding Augusta Victoria’s southern lobe. No guessed internal border or closed perimeter. The 7 July 1948 arrangement included an Israeli enclave and adjoining Jordanian Augusta Victoria section under UN protection. Isawiya’s mapped/in-practice distinction and disputed limits are explicit. Overview only. | Partial |
| Israel–Gaza Strip boundary | OSM 1473938; OCHA; UN global cartography; S/1471, 22 February 1950 | Present Israel-facing land boundary, not an original-1949 reconstruction. OSM/OCHA maximum 922.5 m; OSM/UN 372.9 m. S/1471’s patrol arrangements and Article III reservation are distinguished from the present line. No yellow line or military buffer. | Yes |
| Egypt · international border | OSM 1473946; UN 1:1 million; Natural Earth 1:10 million; MFA1979 treaty Art.II; UNTS1136 p.117 | OSM/UN 359.9 m; OSM/NE 3,211.7 m. Generalized NE is a coarse check, not pillar control. Excludes Gaza–Egypt. Treaty’s Gaza-status reservation remains explicit. | Yes |
| Jordan · international border | OSM 184818; UN / NE; MFA 1994 treaty Art.3(2); official government Hebrew record | Original whole-source OSM/UN 763.2 m; OSM/NE 5,921.4 m. New distinct administrative sector below. Hamat Gader extension removed; northern drawing ends near MR209.5–232.2, converted to 35.63141 E,32.68356 N. This is a scope cut, not a claim to have obtained binding treaty coordinates. | Yes |
| Jordan · line with Judea and Samaria | Same OSM; MFA Annex I(a) 2.A.7; official government Hebrew text | Separate dash style and literal treaty disclaimer. Source tags plus the connecting river way identify the sector; northern source junction is 35.5549603 E,32.3890173 N, where the Green Line meets the Jordan. No arbitrary latitude cut. | Yes |
| Lebanon · Blue Line | **UN withdrawal map 4143 Rev.1, July 2000**, native path133 | Complete UN line replaces the partial OSM selection, including Har Dov and Margaliot. All 701 source vertices retained. Prior independent comparison of53 OSM ways remains evidence:49 agree within165m, four differ301–636m. Indicative ±200m cartographic precision, not a barrel survey. | Yes |
| Golan · 1974 Alpha | **UNDOF map2916 Rev.143, September2026**, native path1742 | UN stroke now used directly. Independent OSM comparison: maximum460.1m, reverse429.8m; grid residual48.8m. Indicative cartographic precision ±210m; overview only. | Yes |
| Golan · 1974 Bravo | UNDOF2916 Rev.143, September2026; 1974 agreement B(3–4) | Native paths1743–1748 retain their printed gaps, without connectors. ±210m indicative precision; maximum zoom11. | Yes |
| Golan · area of separation | UNDOF2916 Rev.143, September2026; 1974 agreement B(3)/C | Native white fill900 split exactly at Alpha1742, excluding the separate Quneitra A/A-1 strip. ±210m indicative precision; maximum zoom11. A-1 itself remains withheld. | Yes |
| Security barrier | OSM1410327; OCHA status candidate | No dated, independently defended built/planned classification. | No |

The earlier UN 1:1 million international-boundary comparison **cannot establish Blue Line identity**. The March2026 UNIFIL deployment map is also not used as the point-by-point withdrawal-line reference: its OGL team boundary must not be mistaken for the Blue Line. Map4143 explicitly identifies the June2000 withdrawal line and its WGS84/UTM36N grid.

## Jerusalem registration and closures

Retained [registration controls](../../data/raw/map-lines/jerusalem-registration.json) use seven monument symbols distributed through the map. The similarity has one common scale, **4.0885 m/pixel**, agreeing with the scale bar. The former four-control affine fit had unequal axis scales and unreliable extrapolation; it has been replaced, including the retained docs JSON. Residuals are not a survey guarantee. [Pixel centre traces](../../data/raw/map-lines/jerusalem-un229-traces.json) are retained inputs; production regeneration needs no network or fresh tracing.

UN229’s top coverage edge, transformed with those controls, is near **31.800 N**, rather than the review’s approximate31.798 N. Both lines remain distinct there. The prior single OSM line inside UN coverage is removed and replaced by the two traced sides. Outside UN coverage, the single OSM alignment remains an explicitly approximate cartographic continuation; no side identity or precise historical tie-breaker was established. Its conservative scale limit prevents it being enlarged as a detailed boundary. The hatch’s northern closure is a **source-coverage edge**, not an agreed transverse boundary. The southern hatch ends at N130; Government House’s southern edge is N128. Grid boxes are densified before coordinate conversion so projected straight grid edges are not approximated by erroneous long WGS84 chords.

Government House’s internal civilian line remains absent. Frid describes an initially temporary civilian-use arrangement, subsequent stone marking and later de facto confirmation; the app does not call this a permanent political partition. State Archives distinguishes demilitarized Government House and Scopus from the prohibited-access gaps between the forces’ lines. Scopus’s internal Israeli/Jordanian division is not available as a verified map. The partial northern OSM arc deliberately leaves that division open.

## Official text and exact source scope

- [MFA, Jerusalem — Legal and Political Background](https://www.gov.il/en/pages/jerusalem-legal-and-political-background), Ruth Lapidoth, 30 June 1998: directly read. Separately describes the Government House civilian zone, prohibited-access no-man’s-land and Scopus/Augusta Victoria under UN protection.
- [Israel State Archives, סיפורו של הקו העירוני](https://catalog.archives.gov.il/site/chapter/the-urban-line-2/): the owner-supplied review’s quoted excerpts support the Government House/Scopus status and Isawiya distinction. Normal browser access during this correction returned Forbidden; the reviewer’s saved HTML response also contains only Forbidden. These are attributed review excerpts, not a claim that we directly retrieved that page or a map. No circumvention was used.
- [Yoram Frid, TAU, Israel31–32 (2024)](https://humanities.tau.ac.il/sites/humanities.tau.ac.il/files/media_server/humanities/zionism/%D7%99%D7%A9%D7%A8%D7%90%D7%9C/31-32/yoram_frid.pdf), pp. 463–484, especially 470–473: retained PDF read; publisher issue page confirms the link. Grid128/130, civilian arrangement and Latrun closure are sourced here.
- [MFA 1994 treaty](https://www.gov.il/en/pages/israel-jordan-peace-treaty) and [Annex I](https://www.gov.il/en/pages/israel-jordan-peace-treaty-annex-1): English Art.3(2) and §2.A.7 read directly. Exact bilingual excerpts and locators are in [official-treaty-excerpts.json](../../data/raw/map-lines/official-treaty-excerpts.json).
- **Hebrew-source limitation:** MFA’s Hebrew collector/page could not be retrieved normally (Cloudflare/blocked page). The Hebrew is therefore transcribed verbatim from the **official government Hebrew record, State Archives file 9628/5**, mirrored in [the scanned original](https://commons.wikimedia.org/wiki/File:Israeli_government_original_hebrew_copy_of_the_peace_agreement.pdf), retained locally. PDF pages 5 and 18 were visually checked. It is **not our translation and is not claimed to have been read from MFA Hebrew**. The archive Annex introduction says “הגדה המערבית”; its English counterpart says “West Bank”, whereas the MFA English version has “territory that came under…1967”. The required disclaimer agrees in substance. The app preserves these published versions, without silently replacing words inside a quote. “Judea and Samaria” remains the app’s label.
- The scanned government record also includes two Survey of Israel national border maps dated26 October 1994 (PDF pages 104–105, north/south sheets1:250,000). These are overview sheets with their own no-boundary-authority warning, not the binding orthophotos or IJBD94 coordinate list. They are not used to authenticate the 1949 crossing; the separate signed1949 source now supplies that check.
- The 1949 Art.VI(9) English quotation is from the instrument; the Hebrew is explicitly marked as a translation. This differs from the official Hebrew 1994 quotations.

**Correction to the prior report:** retained UN Treaty Series42 contains the treaty text and a monochrome **Palestine North Sheet,1:250,000**, not the Jerusalem Map2 or the south sheet. It does **not** authenticate a Scopus outline. It must not be confused with the UNISPAL S/1302/Rev.1 page, which does supply the combined officially signed north/south sheets, now retained as scans/armistice-signed-1949.jpg. The standalone UN229 is a separate central-Jerusalem map, not an annex silently supplied by that volume.

## Additional endpoint and point-by-point checks

### Dead Sea

[dead-sea-check.json](../../data/raw/map-lines/dead-sea-check.json) records the modern OSM endpoint **35.476012 E,31.493120 N**: 4.8 m from the modern UN line and242.5 m from OCHA. Within the stated35.3–35.6 E /31.47–31.53 N comparison box, symmetric sampled maxima are400.1 m to OCHA and526.4 m to UN. These modern comparisons are independent of the signed-map check below.

Article V(1)(c) assigns Hebron–Dead Sea to Map1 lineB; V(1)(d)’s MR1925–0958 concerns the separate southern sector. **The earlier missing-sheet assertion was wrong.** The cited UNISPAL page supplies both signed Map1 sheets at3119×8630px. Their printed Palestine grid gives about51m/px. The signed crossing reaches the shore near MR1877–1005 and turns south near1951–1000; the modern line is near1879–0999 and1952–1003. They agree within about0.5km, consistent with registration/symbol width. No endpoint was moved or guessed connector added.

[signed-map-check.json](../../data/raw/map-lines/signed-map-check.json) records the grid formula, controls, limits and all38 Judea/Samaria clusters over300m. All worst-point crops were inspected. Rantis/Qibya supports OSM; Arab er-Ramadin supports OCHA, substituted only in the recorded localbox. The joins between products remain open rather than inventing connectors. This longcluster’s remaining vertices are not certified. Other clusters remain unresolved where ink width, registration or historic staged establishment/rectification prevents a unique tie-break. The signed map is not assumed to be modern ground truth everywhere. VI(3)/VI(11) are possible context, not evidence of a particular local adjustment.

### Blue Line

[blue-line-check.json](../../data/raw/map-lines/blue-line-check.json) lists **every one of the 53 ways**, maximum, worst coordinates and sample count. Native withdrawal-stroke path133 is extracted from UN4143Rev.1, with three explicit UTM grid controls. All original vertices are retained and segments densified to≤10 m; point-to-segment sampling gap≤5 m. This is a cartographic compatibility check, not a physical-barrel survey.

| Omitted OSM way | Maximum difference | Decision |
|---|---:|---|
|705757468|317.9 m|Unresolved local mismatch; omit whole way|
|830869382|483.8 m|Unresolved local mismatch; omit whole way|
|842176370|300.9 m|Unresolved local mismatch; omit whole way|
|1188316285|636.1 m|Ghajar: source note describes a unified village with no border crossing; withdrawal-line identity is not established; omit|

The earlier49-way selection was compatible at≤200m (actual maximum164.3m) but omitted15.9km at HarDov and650m at Margaliot. Production now uses the **entire native UN path133**, not a mixture of unidentified1923/2000 segments. The coordinates are registered from native UTM grid intersections, not traced by eye. ±200m describes published cartographic scale, not surveyed ground accuracy. [UNIFIL’s FAQ](https://unifil.unmissions.org/en/node/28372), read directly, distinguishes the withdrawal line from an international border and the nearby physical barriers. The public copy makes no unsourced claim about Ghajar’s internal split.

### Alpha

[alpha-line-check.json](../../data/raw/map-lines/alpha-line-check.json) records all five ways, maxima and worst coordinates. Native path1742 is the **western edge of the separation area**, labelled Alpha on UNDOF2916Rev.143; separate native paths1743–1748 are Bravo,1749–1755 the dashed Quneitra A-1. They are not mixed. The printed grid is **Palestine Belt**, not UTM. Fourteen grid-stroke controls give separate axis fits with only0.084% scale difference and≤48.8 m residual. Controls are read from actual grid strokes, not the offset label centres. Source-overlay plots were inspected from north to south, including Quneitra and the Yarmouk end.

| OSM Alpha way | OSM→UN maximum |
|---|---:|
|95034190|387.4 m|
|793722585|354.4 m|
|793722588|301.8 m|
|793722591|460.1 m|
|1194778776|190.7 m|

## Review findings and verification

| ID | Status / correction | Check |
|---|---|---|
|F1|Fixed: Government House separate zone/style/legend/i; N130/N128 cuts; no invented civilian line|Grid conversion, point-in-polygon regression, source passages, Jerusalem screenshots|
|F2|Fixed: both central sides traced from UN229; Abu Tor gap restored|Seven-control registration, source overlay and240–310 m gap regression|
|F3|Fixed within source coverage; outside continuation explicitly approximate|North pair/hatch regression at31.7994 N; source overlay; map-coverage closure disclosed|
|F4|Presentation/editorial text fixed; exact official Hebrew source is the government archive, **MFA Hebrew access remains unavailable**|Separate admin-layer geometry/dash, bilingual source fixtures, rendered disclaimer e2e; source-version distinction above|
|F5|Fixed: Hamat Gader extension removed|Two way IDs excluded; Yarmouk cut near converted1949MR point; geometry regression and screenshots|
|F6|Fixed with partial outline: Augusta lobe omitted,1948 date, truthful sources|Open-arc/min-latitude regression, Archives/MFA text, Scopus screenshots|
|F7|Fixed: only central UN229 check claimed; false annex claims removed|Catalogue and report read against retained PDF and source scope|
|F8|Fixed for dark motorway, motorway bridge and runway classes|Non-mutating style unit test and Route50/Atarot dark screenshots; provider boundaries still absent|
|F9|Fixed: butt caps,2px strokes,1.4px hatch strokes, matching8px patterns; GovernmentHouse has a2px dashed outline|Shared stroke policy, rendered path assertion, both-theme legend/map inspection|
|F10|Fixed: Latrun eastern closure explicitly OSM and never agreed on a map|Frid passage, bilingual(i), Latrun screenshots|
|F11|Complete native2000 withdrawal line now replaces the49-way partial selection|All53-way measurement record, source overlays, Blue Line screenshots and equivalent source labels|
|F12|Fixed: per-feature source-precision maxZoom, unknown outlines overview only, every(i) uncertainty|20px policy regression, map zoom-limit e2e, detail screenshots; fixed space prevents the notice moving the map; locality names remain independent|
|F13|Fixed: each flagged sentence rewritten to instrument scope, EN/HE equivalent except faithfully preserved official treaty variant|Source-by-source copy review, all twelve bilingual(i) captures; VI(9) Hebrew explicitly translated|
|F14|Checked and reported; additional unsourced layers remain withheld|Dead Sea primary-clause/modern endpoint check, all 53 Blue / all 5 Alpha measurements; next-source requirements below|

## Other historical layers

F14’s 1949 Syrian armistice/three DMZ sectors have textual MR/wadi/shoreline descriptions in UNTS42 No.657 AnnexI. Adding them needs historical wadi/shoreline tracing and a separate registered-map check, including the Golan’s Israeli-law-since1981 context. The missing1:50,000 insert is not replaced by guesses. The1949 Lebanon agreement V(1) adopts the international boundary; the public BlueLine copy now describes only the independently identified2000 withdrawal line. Original1949 Gaza,1950 patrol zones and ElAujaDMZ can be reconstructed only with their own historical base and source checks. No Gaza yellow line is added: the public IDF explanation has no official mapped coordinates. Government House civilian line and Scopus internal division require the actual Archives/Narkiss map, not a text-only inferred partition.

## Reproduction

All required inputs are retained under `data/raw/map-lines/`; generated production geometry is committed. Python dependencies are pinned in `research-requirements.txt` (Python3.14.4; Shapely2.2, pyproj3.8, NumPy2.5.4, Matplotlib3.11.2, Pillow13, PyMuPDF2.1). Install copies/caches only in project scratch. From the repository root, using that dependency environment:

1. `python3 scripts/check-map-line-sources.py` recreates native-PDF Blue/Alpha/DeadSea JSON checks and diagnostic source overlays in `.backup-scratch/v4-fixes/`.
2. `python3 scripts/check-signed-armistice-map.py` recreates the38 signed-map crops in `.backup-scratch/v4-r2/signed-map/` and the compact decision JSON. `python3 scripts/extract-map-line-vectors.py` extracts the native UN lines/fill offline, using the retained Alpha grid registration. Then `python3 scripts/build-map-lines.py` rebuilds production geometry from these retained inputs. No interpolation connects source gaps.
3. `python3 scripts/audit-map-lines.py` recreates the continuous>100m OCHA/OSM intervals and114 crops under `.backup-scratch/v4/`.
4. The original first-pass workflow `python3 scripts/archive-map-line-audit.py` writes the [coordinate/decision atlas](map-line-stretches.md), retained JSON and copies crops into `.backup-scratch/v4/map-line-checks/`, **never docs**. It predates the signed-sheet tie-break: rerun `check-signed-armistice-map.py` afterward to restore the revised decisions. It records338 continuous portions in114 clusters, without treating either product as authoritative.
5. `python3 scripts/register-jerusalem-map.py` recreates the corrected seven-control source overlays in scratch and the compact control JSON. `python3 scripts/register-golan-map.py` recreates the older2024 diagnostic in scratch; the new native2026 check is the decisive Alpha comparison.
6. `python3 scripts/compare-map-lines.py` reproduces the earlier matched UN/NE comparisons. Those whole-source Jordan/Blue results predate the production scope cuts and are not substituted for the new targeted checks.

Use `PYTHONPATH=.backup-scratch/v4/python MPLCONFIGDIR=.backup-scratch/v4/mpl` with the existing local dependency copy. All 116 PNGs formerly under `docs/research/map-line-checks/` were moved to scratch (the reviewer’s118 files included **two JSONs**, which remain). The atlas has one regeneration note instead of image embeds. The source PDFs/JPGs, manual trace inputs, JSON evidence, accepted outputs and write-ups remain durable. No global temporary-directory setting is changed.

## Rendering, wording and licences

Final bilingual copy, links and quotations live in `src/app/locality-map-line-catalogue.ts`, rendered directly by the legend. Every category has its own toggle and(i), source date and uncertainty. Per-feature maxZoom conservatively keeps quantified source differences below20px at34°N; unquantified GovernmentHouse/Scopus outlines stop at overview zoom10. The locality map itself stops at15, while approximate lines usually disappear earlier. A bilingual notice explains this. Source discrepancy is not claimed to be a guaranteed absolute error bound.

Line and legend caps are butt; patterns/stroke widths match in both themes. Dark motorway interiors/bridges and runways use grey rather than boundary-like black. OSM-derived coordinates remain ©OpenStreetMap contributors, ODbL. Central Jerusalem’s correction is derived from UN map229 and credited separately; UN material is not claimed to be OSM-licensed or UN-endorsed. Native Blue/Alpha/Bravo/area and local OCHA coordinates retain their UN/OCHA credits and source terms. NaturalEarth is public domain. See `data/raw/map-lines/LICENSE.md` and `public/data/map-lines.license.txt`. No English Wikipedia was used. No protected-source circumvention was attempted.

## Second-review corrections (R2)

Merged `origin/main` at `79b4c41`, preserving Settings’ decimal behaviour. The generated gaps register is refreshed from the merged inputs.

| ID | Status / correction | Verification |
|---|---|---|
| R2-1 | Fixed. Retain Government House’s OSM armistice edges through zoom 11; discard sub-2 m extraction stubs. Zone has a 2 px dashed outline and 8 px cross; its 0.5 km UN229/OSM mismatch is disclosed. | Regression samples both edges every ~55 m at every zoom 3–15, respecting source caps; Jerusalem z10/z11 in both themes/languages. |
| R2-2 | Fixed. Retain signed north/south sheets; remove unavailable-sheet claim. Dead Sea crossing agrees within ~0.5 km. | UNISPAL page, signed-sheet grid/crop, regenerated endpoint JSON. |
| R2-3 | Fixed. Distinguish former Iraqi front VI(2), Kh. Deir Arab–Jerusalem V(1)(a), Jerusalem V(1)(b), Hebron–Dead Sea V(1)(c), and VI(11) rectifications. | Treaty text and bilingual copy. |
| R2-4 | Fixed. ההדמאה; no period after 1967. Exact source quotation pinned. | Every quoted Hebrew word reread against retained government PDF indices 4/17. English versions retain their stated official locators. |
| R2-5 | Fixed. `MapLineText` isolates Latin/numeric references with `bdi dir=ltr`; headers localised. Balanced reference parentheses stay inside the isolation; enclosing Hebrew punctuation stays outside. | Unit regression; Hebrew phone e2e checks V(1)(b), ±60, I(א) 2.A.7 and official word. All 12 Hebrew explanations captured in both themes. |
| R2-6 | Fixed. Entire UN4143 native Blue Line, including Har Dov/Margaliot; partial label removed. | All 701 native vertices retained, published source path check and regional captures. |
| R2-7 | Fixed. Four-month civilian terms, Jordan’s refusal on 28 June 1949, unsigned line, practical recognition and June 1957 confirmation. Grid128/130 describes civilian residence terms. | Frid pp. 471, 473, 477; equivalent EN/HE. Internal civilian line still withheld. |
| R2-8 | Partly resolved; remainder explicitly unresolved. OCHA substituted locally at Ramadin without fabricated connectors; Rantis retains OSM. All 38 large clusters recorded; coarse map cannot certify every whole cluster. | Signed-map crops and decision JSON. No invented local rectification. |
| R2-9 | Fixed. Separate Bravo and separation layers from 2916; Quneitra A/A-1 strip excluded under agreement B(3)/C. | Native paths, exact source-path split, valid closed polygon, retained check JSON, overview cap 11 and Golan/Quneitra captures. |
| R2-10 | Fixed. Egypt Art. II quoted; unsupported Taba/common1923/fence detail removed. Official UN1974 agreement and Syria Annex I(24) cited. | Egypt quotation checked against UNTS1136 p.117; retained1974 PDF via official UN viewer; catalogue source-scope readthrough. |
| R2-11 | Fixed. Scopus1948–1967 and 2 px dash marks; Government House8 px cross and outline. | Matching legend/map style; both-theme visual checks. |
| R2-12 | Fixed. Native disclosure collapses phone legend; shorter copy moves method details here. | 390 px default-closed e2e; desktop/phone bilingual captures. Precision notice still reserves fixed space. |

### UNDOF source-path distinction

[The 1974 agreement](https://docs.un.org/en/S/11302/Add.1), obtained through the ordinary UN document viewer and retained locally, states in Annex A B(3) that A–B is the area of separation; paragraph C separately prohibits military forces between A/A-1. Native white fill900 includes both near Quneitra. **Using that entire fill as the area of separation would be wrong.** An exact planar split by native Alpha1742 retains the main16,982.009 pt² polygon and removes the132.355 pt² Quneitra strip, plus subpixel print slivers. No new line is interpolated. Alpha, Bravo and the fill are rendered separately; native Bravo pieces preserve sub-0.3 pt print gaps. [undof-area-check.json](../../data/raw/map-lines/undof-area-check.json) records the operation. These are map-scale coordinates, not surveyed treaty coordinates or current deployments. A-1 itself is not drawn.

### Egypt quotation

The MFA embassy HTML has a typographical “in” where the original instrument has “is”. The displayed English quotation is checked word for word against **UNTS1136, I-17813, p.117**, PDF index134. The source list includes that original; its one-page extract is retained as `scans/egypt-treaty-article-II.pdf`, with the full download’s SHA256 recorded in `official-treaty-excerpts.json`. Hebrew is explicitly marked as a translation. No new factual Taba claim is made without the separate arbitral award.

### Validation

TypeScript and build passed after the main merge. Vitest: **1,206/1,206 tests, 122 files**, two workers. Map e2e: **11/11**, one worker. Full e2e: **667/667 passed**, two workers, isolated port5506, 16.2 minutes. Playwright reports zero unexpected, skipped or flaky results and zero run errors; the retained process exit code is **0**. This run uses the final merged build, including the Egypt source citation. The final metadata-only clarification of two out-of-coverage discrepancy records was followed by a full passing unit run. All browser timeouts remain unchanged.


**180 final native-resolution captures**, with no page errors, are in `.backup-scratch/v4-r2/`. They comprise 96 affected-region captures (12 locations × he/en × light/dark ×1500/390), 36 election overviews (k26/k25/k1;1500/1024/390), and 48 explanations (all12 layers × he/en × light/dark). The affected locations include Jerusalem z10/z11, Latrun, Hamat Gader, Scopus, Dead Sea, Har Dov, Margaliot, the Golan overview, Quneitra, Ramadin and Rantis. All affected-region combinations and all explanations were visually inspected in native-pixel contacts; the contacts crop/arrange the original pixels without resizing them. `capture.mjs`, `contacts.py` and `captures.json` retain exact parameters and viewport/theme/language records in scratch. The final explanation recapture follows the last source-citation correction. Geometry and the four compact source-check outputs reproduce byte-identically from retained inputs.

The production geometry and compact source-check records regenerate offline; the full unit run and the targeted map run both exit0. The screenshot preview remains available on port5503. No push or merge into main was performed.
