# Locality map lines — audited source and depiction decisions

7 November 2026. Ten separately controlled layers ship. This revision corrects the independent review of `1cdcde2`; its geometry and source claims supersede the earlier report. These are approximate historical/cartographic overlays, not pillar surveys. No product has been shown to provide independent original survey control. Provider labels and boundaries remain hidden.

## Lines and source checks

| Layer | Sources / dates | Check and depiction | Shipped |
|---|---|---|---|
| Armistice lines · Judea and Samaria | OSM relation 7304999, retrieved 2026-11-07; UN map 229, November 1949; 1949 Jordan agreement V(1)(a–c), VI(9), VI(11) | Raw OSM/OCHA maximum 2,370.5 m includes the Scopus outline missing from OCHA. Central Jerusalem replaces the faulty OSM pair with a UN229 digitization under a seven-control similarity registration (8–59 m residuals). Outside that coverage, OSM remains approximate: ordinary source differences reach about 843 m. No unverified rectification is claimed. | Yes, with scale limits |
| No-man’s-land · 1949–1967 | OSM paired edges at Latrun; UN229 in central Jerusalem; MFA Jerusalem background; Frid, pp.470–473 | Two polygons: Latrun and corrected central Jerusalem north of Palestine-grid N130. Government House is separate. Abu Tor gap is about 280 m at 31.7694 N. North pair/fill continues to the registered raster edge near 31.800 N. Latrun eastern closure follows OSM and was never defined on an agreed map. | Yes |
| Government House zone · 1949–1967 | OSM outlines; Israel State Archives; MFA Jerusalem background; Frid (TAU, 2024), pp.470–473 | Separate cross-hatch, clipped at Palestine Belt grid N128000 and N130000. Government House point is inside this zone and outside no-man’s-land. The 26 June 1949 MAC civilian-use arrangement is described; its internal civilian line is not invented. Positional accuracy is unquantified, so overview only. | Yes |
| Mount Scopus · Israeli enclave (1948) | OSM northern arc; State Archives and MFA | Partial open northern outline, excluding Augusta Victoria’s southern lobe. No guessed internal border or closed perimeter. The 7 July 1948 arrangement included an Israeli enclave and adjoining Jordanian Augusta Victoria section under UN protection. Isawiya’s mapped/in-practice distinction and disputed limits are explicit. Overview only. | Partial |
| Israel–Gaza Strip boundary | OSM 1473938; OCHA; UN global cartography; S/1471, 22 February 1950 | Present Israel-facing land boundary, not an original-1949 reconstruction. OSM/OCHA maximum 922.5 m; OSM/UN 372.9 m. S/1471’s patrol arrangements and Article III reservation are distinguished from the present line. No yellow line or military buffer. | Yes |
| Egypt · international border | OSM 1473946; UN 1:1 million; Natural Earth 1:10 million; MFA 1979 treaty Art.II | OSM/UN 359.9 m; OSM/NE 3,211.7 m. Generalized NE is a coarse check, not pillar control. Includes Taba; excludes Gaza–Egypt. Treaty’s Gaza-status reservation remains explicit. | Yes |
| Jordan · international border | OSM 184818; UN / NE; MFA 1994 treaty Art.3(2); official government Hebrew record | Original whole-source OSM/UN 763.2 m; OSM/NE 5,921.4 m. New distinct administrative sector below. Hamat Gader extension removed; northern drawing ends near MR209.5–232.2, converted to 35.63141 E,32.68356 N. This is a scope cut, not a claim to have obtained binding treaty coordinates. | Yes |
| Jordan · line with Judea and Samaria | Same OSM; MFA Annex I(a) 2.A.7; official government Hebrew text | Separate dash style and literal treaty disclaimer. Source tags plus the connecting river way identify the sector; northern source junction is 35.5549603 E,32.3890173 N, where the Green Line meets the Jordan. No arbitrary latitude cut. | Yes |
| Lebanon · Blue Line (partial) | OSM Israel relation; **UN withdrawal map 4143 Rev.1, July 2000** | Every original OSM vertex and every ≤10 m segment interval checked against the explicit UN withdrawal line. **49/53 ways accepted**, maximum 164.3 m; four entire unresolved ways omitted (318–636 m differences). CIA provenance and a later UN-name tag alone do not prove identity. Partial label, ±200 m cartographic scale qualification; coincident 1923/1949/2000 routes cannot be distinguished more finely. | Partial |
| Golan · 1974 Alpha | Five OSM A-Line ways; **UNDOF map2916 Rev.143, September2026**; NE 1974 line | Native UN Alpha stroke extracted, registered using the printed Palestine Belt Grid. All five ways follow Alpha, not Bravo/A-1. OSM→UN maximum **460.1 m**, reverse **429.8 m**. Grid registration residual 48.8 m; UN stroke about157 m wide. Coarse NE comparison remains1,093 m. This does not show current deployments. | Yes |
| Bravo / A-1 / separation-area fill | 1974 agreement and UNDOF2916 | Separately identifiable source paths now available, but not promoted into production without their own digitization, registration and topology checks. No guessed polygon. | No |
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
- The scanned government record also includes two Survey of Israel national border maps dated26 October 1994 (PDF pages 104–105, north/south sheets1:250,000). These are overview sheets with their own no-boundary-authority warning, not the binding orthophotos or IJBD94 coordinate list. They do not supply the missing 1949 south sheet or authenticate its Dead Sea crossing.
- The 1949 Art.VI(9) English quotation is from the instrument; the Hebrew is explicitly marked as a translation. This differs from the official Hebrew 1994 quotations.

**Correction to the prior report:** retained UN Treaty Series42 contains the treaty text and a monochrome **Palestine North Sheet,1:250,000**, not the Jerusalem Map2 or the south sheet. It does **not** authenticate a Scopus outline. Claims of a retained Jerusalem annex or complete signed-map set have been removed. The standalone UN229 is a separate central-Jerusalem map, not an annex silently supplied by that volume.

## Additional endpoint and point-by-point checks

### Dead Sea

[dead-sea-check.json](../../data/raw/map-lines/dead-sea-check.json) records the modern OSM endpoint **35.476012 E,31.493120 N**: 4.8 m from the modern UN line and242.5 m from OCHA. Within the stated35.3–35.6 E /31.47–31.53 N comparison box, symmetric sampled maxima are400.1 m to OCHA and526.4 m to UN. These comparisons confirm modern cartographic consistency, **not the original 1949 water crossing**.

ArticleV(1)(c) assigns the **Hebron–Dead Sea** sector to AnnexI Map1, sectionB. ArticleV(1)(d)’s **MR1925–0958** starts the different **Dead Sea–southernmost Palestine** sector. The text alone does not resolve where the mapped sectors meet, or whether that MR point is their shared endpoint. Without Map1 sectionB, neither authenticating the existing water crossing nor moving it about4 km south is justified by this text alone. The absent south sheet prevents primary-map authentication. No invented move or connector was made; this limit is stated in both languages in the Green Line(i).

### Blue Line

[blue-line-check.json](../../data/raw/map-lines/blue-line-check.json) lists **every one of the 53 ways**, maximum, worst coordinates and sample count. Native withdrawal-stroke path133 is extracted from UN4143Rev.1, with three explicit UTM grid controls. All original vertices are retained and segments densified to≤10 m; point-to-segment sampling gap≤5 m. This is a cartographic compatibility check, not a physical-barrel survey.

| Omitted OSM way | Maximum difference | Decision |
|---|---:|---|
|705757468|317.9 m|Unresolved local mismatch; omit whole way|
|830869382|483.8 m|Unresolved local mismatch; omit whole way|
|842176370|300.9 m|Unresolved local mismatch; omit whole way|
|1188316285|636.1 m|Ghajar: source note describes a unified village with no border crossing; withdrawal-line identity is not established; omit|

The 49 retained ways are individually compatible with the UN2000 withdrawal line at≤200 m map resolution (actual maximum164.3 m). This does not prove that each underlying vertex was newly surveyed in2000 or distinguish where the withdrawal line coincides with the1923 boundary adopted by the 1949 armistice. The reverse full-UN-to-partial-OSM result includes intentionally omitted gaps and unequal eastern extents and is retained as such, not disguised as positional error. No unmatched way is relabelled “1923” without its own evidence. The visible source label means the same thing in Hebrew and English.

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
|F9|Fixed: butt caps,2px strokes,1.4px hatch strokes, matching8px/14px patterns|Shared stroke policy, rendered path assertion, both-theme legend/map inspection|
|F10|Fixed: Latrun eastern closure explicitly OSM and never agreed on a map|Frid passage, bilingual(i), Latrun screenshots|
|F11|Fixed by a new explicit2000-map check; four ways withheld; partial label|All53-way measurement record, source overlays, Blue Line screenshots and equivalent source labels|
|F12|Fixed: per-feature source-precision maxZoom, unknown outlines overview only, every(i) uncertainty|20px policy regression, map zoom-limit e2e, detail screenshots; fixed space prevents the notice moving the map; locality names remain independent|
|F13|Fixed: each flagged sentence rewritten to instrument scope, EN/HE equivalent except faithfully preserved official treaty variant|Source-by-source copy review, all ten bilingual(i) captures; VI(9) Hebrew explicitly translated|
|F14|Checked and reported; additional unsourced layers remain withheld|Dead Sea primary-clause/modern endpoint check, all 53 Blue / all 5 Alpha measurements; next-source requirements below|

## Other historical layers

F14’s 1949 Syrian armistice/three DMZ sectors have textual MR/wadi/shoreline descriptions in UNTS42 No.657 AnnexI. Adding them needs historical wadi/shoreline tracing and a separate registered-map check, including the Golan’s Israeli-law-since1981 context. The missing1:50,000 insert is not replaced by guesses. The1949 Lebanon line “shall follow the international boundary” (V(1)); this is explained with the Blue Line’s common1923 route rather than drawing an indistinguishable duplicate. Original1949 Gaza,1950 patrol zones and ElAujaDMZ can be reconstructed only with their own historical base and source checks. No Gaza yellow line is added: the public IDF explanation has no official mapped coordinates. Government House civilian line and Scopus internal division require the actual Archives/Narkiss map, not a text-only inferred partition.

## Reproduction

All required inputs are retained under `data/raw/map-lines/`; generated production geometry is committed. Python dependencies are pinned in `research-requirements.txt` (Python3.14.4; Shapely2.2, pyproj3.8, NumPy2.5.4, Matplotlib3.11.2, Pillow13, PyMuPDF2.1). Install copies/caches only in project scratch. From the repository root, using that dependency environment:

1. `python3 scripts/check-map-line-sources.py` recreates native-PDF Blue/Alpha/DeadSea JSON checks and diagnostic source overlays in `.backup-scratch/v4-fixes/`.
2. `python3 scripts/build-map-lines.py` rebuilds production GeoJSON offline from retained OSM, UN229 traces and checked Blue-way selection. It fails if the Blue acceptance record is absent.
3. `python3 scripts/audit-map-lines.py` recreates the continuous>100m OCHA/OSM intervals and114 crops under `.backup-scratch/v4/`.
4. `python3 scripts/archive-map-line-audit.py` writes the [coordinate/decision atlas](map-line-stretches.md), retained JSON and copies crops into `.backup-scratch/v4/map-line-checks/`, **never docs**. It records338 continuous portions in114 clusters, without treating either product as authoritative.
5. `python3 scripts/register-jerusalem-map.py` recreates the corrected seven-control source overlays in scratch and the compact control JSON. `python3 scripts/register-golan-map.py` recreates the older2024 diagnostic in scratch; the new native2026 check is the decisive Alpha comparison.
6. `python3 scripts/compare-map-lines.py` reproduces the earlier matched UN/NE comparisons. Those whole-source Jordan/Blue results predate the production scope cuts and are not substituted for the new targeted checks.

Use `PYTHONPATH=.backup-scratch/v4/python MPLCONFIGDIR=.backup-scratch/v4/mpl` with the existing local dependency copy. All 116 PNGs formerly under `docs/research/map-line-checks/` were moved to scratch (the reviewer’s118 files included **two JSONs**, which remain). The atlas has one regeneration note instead of image embeds. The source PDFs/JPGs, manual trace inputs, JSON evidence, accepted outputs and write-ups remain durable. No global temporary-directory setting is changed.

## Rendering, wording and licences

Final bilingual copy, links and quotations live in `src/app/locality-map-line-catalogue.ts`, rendered directly by the legend. Every category has its own toggle and(i), source date and uncertainty. Per-feature maxZoom conservatively keeps quantified source differences below20px at34°N; unquantified GovernmentHouse/Scopus outlines stop at overview zoom10. The locality map itself stops at15, while approximate lines usually disappear earlier. A bilingual notice explains this. Source discrepancy is not claimed to be a guaranteed absolute error bound.

Line and legend caps are butt; patterns/stroke widths match in both themes. Dark motorway interiors/bridges and runways use grey rather than boundary-like black. OSM-derived coordinates remain ©OpenStreetMap contributors, ODbL. Central Jerusalem’s correction is derived from UN map229 and credited separately; UN material is not claimed to be OSM-licensed or UN-endorsed. NaturalEarth is public domain. See `data/raw/map-lines/LICENSE.md` and `public/data/map-lines.license.txt`. No English Wikipedia was used. No protected-source circumvention was attempted.

## Final validation

Validated on main `4edfdf05c538a11c145742636bda75135ab5c564` plus this branch’s map changes. TypeScript (`tsc -p tsconfig.json --noEmit`) and the Vite build passed. Vitest: **1,145 tests /118 files passed**, two workers. Targeted map e2e: **10/10 passed**, one worker, port 5499. Full e2e: **594/594 passed**, two workers, port 5498, existing time limits unchanged (30.6 minutes). Playwright’s own final JSON reports `status: passed` and no failed tests; the outer execution wrapper nevertheless returned 143 after that completed report. A subsequent same-harness map check on port5498 passed (1/1) and exited0 normally, including server shutdown. The full-run wrapper result remains recorded as a process-status limitation, not hidden as a clean shell exit. The final run follows the last main rebase and the no-jump precision-notice fix. Earlier superseded runs were interrupted rather than counted as final evidence.

The geometry/basemap regression tests were observed failing before their corrections. The new zoom-position test also reproduced a 45.7 px shift before fixed notice space restored a stationary map. Production GeoJSON and the Blue/Alpha/DeadSea measurement JSONs regenerated byte-identically from retained inputs. Only the two control JSONs remain in the former docs image directory.

**268 final browser captures**, with no page errors, are in `.backup-scratch/v4-fixes/`; parameters and locations are in `capture.mjs` and `captures.json`. This comprises192 regional captures (k26/k17;12 regions;he/en;light/dark;1500/390),36 overviews (k26/k25/k1;also 1024), and40 explanation captures. All 15 contact sheets were visually inspected, alongside detailed Jerusalem/source overlays and individual corrected-region images. Three initially incomplete k17Hebrew/light backgrounds were refreshed after explicit MapLibre style/tile readiness and individually inspected. The required Jerusalem,Latrun,HamatGader,Scopus,DeadSea andBlueLine combinations are all included; Alpha,Gaza,Eilat/Taba,Atarot andHebron provide additional checks. The Playwright capture script and routine logs remain in scratch, not the commit.
