# Locality result map

The Localities tool opens a Leaflet 1.9.4 canvas circle-marker map, with a Table alternative. Hebrew and English partial search normalizes Unicode combining marks (including niqqud), punctuation, spaces and case. Search results and the table provide keyboard alternatives to canvas markers. Selection shows all nonzero historical list votes, shares and reported turnout. Missing-coordinate rows remain selectable, never placed; envelope votes have no location. Pre-2003 elections have no locality results. K17 (2006) actually retains a locality table, but no CBS codes: the map explains that a reliable code join is impossible and directs readers to the table.

## Sources and conversion

Retained `data/raw/demographics/cbs-YYYY.xls`, `.xlsx` and datastore `.json` files supply CBS locality codes, bilingual names and ITM grid reference points. Existing normalized classification files omit coordinates, so the map builder reads the originals. It joins **only by CBS code**, not fuzzy names. Choose the source year nearest the election (earlier on ties); if its coordinates are missing, try other retained years for that code. Each published location records the actual source year and aliases. Later coordinates can therefore serve as reference points for historical localities; these are not reconstructed historical boundaries or polling stations. No geocoder is used in the data build.

CBS concatenates equally sized easting and northing fields: eight digits mean 100 m, ten mean 10 m, twelve mean 1 m. Decode each half and scale to metres. Transform EPSG:2039 (Israel 1993 / Israeli TM Grid) with proj4 2.22.0 using the published EPSG:9676 seven-parameter position-vector transformation, including the GRS80 ellipsoid, TM origin/scale/false offsets and datum shift. See the exact definition in `src/data/locality-coordinates.ts` and [EPSG definition](https://epsg.io/2039). Tests compare three points against independent PROJ/pyproj 3.7.2 values at 1e-7 degrees. Numerical agreement is not real-world accuracy: EPSG transformation accuracy is about 0.5 m and source reference precision can be 100 m. Reject absent/malformed/out-of-region grids; never invent a coordinate.

To regenerate, install Python `xlrd==2.0.2` and `openpyxl==3.1.5` into `.backup-scratch/python`, install npm dependencies with the lockfile, then run `PYTHONPATH=.backup-scratch/python node scripts/build-locality-map.ts` from the repo root. No network is needed after dependencies are installed. Outputs `public/data/kNN-locations.json` and `locality-map-coverage.json` are retained build assets. Scratch dependencies/logs are disposable. This workflow does not change global Python configuration.

## Colour semantics

These are historical local votes with the **current scenario** list/bloc attribution, not a geographic simulation of national vote edits. A merged list gets its origins' local votes. Split origins distribute by current scenario national vote proportions (equally if all weights are zero). Deleted historical lists remain unassigned. Winners are pluralities of valid votes, including below-threshold lists. Ties, zero votes and unassigned winners are neutral grey.

There are no constituent-party or candidate ballots within a joint list. For a list spanning blocs, apportion its historical local votes by its current elected members' bloc fractions using `allocationOf` and **`seatBlocsOf`**, preserving candidate override → party override → list bloc precedence. Lists with no elected seats use their list bloc. This is an explicitly labelled estimate, not evidence that individual voters voted for a constituent party. Scenario edits recalculate the colours; changing bloc names/colours updates the legend. Winning-list mode applies the same origin mapping without bloc apportionment. Marker outlines remain dark and legible against the light OSM basemap in either application theme; the map is intentionally not filtered/inverted.

## External services

[Photon public service](https://github.com/komoot/photon#demo-server) was selected because it permits reasonable low-volume requests; unlike Nominatim's application-wide 1 request/s ceiling, it does not require a cross-user rate limiter unavailable on a purely static GitHub Pages site. Explicit address submission only: no autocomplete, background queries or bulk geocoding. A shared per-page 1.1-second guard, memory cache, disabled pending submit and timeout limit traffic. User sees provider/data attribution and that the address is sent externally. Up to five address alternatives are shown; the user chooses one, then the app finds the nearest **mapped election locality reference point** by great-circle distance, reports straight-line km, and selects its results. This is not administrative address containment. Photon availability/accuracy is not guaranteed; failures leave local search usable. Move to a private/paid instance if traffic grows.

[OSM tile usage policy](https://operations.osmfoundation.org/policies/tiles/) is observed with the standard HTTPS URL, visible contributor attribution, browser Referer, normal HTTP caching and viewport-only tile loading. No bulk prefetch, offline download, cache bypass or service worker is added. API contracts were checked against [Leaflet 1.9.4 documentation](https://leafletjs.com/reference-1.9.4.html).

## Coverage

Counts exclude the one envelope row per election. Retained machine-readable coverage is `public/data/locality-map-coverage.json`.

| Election | Placed / locality rows |
| --- | --- |
| k16 | 1164 / 1171 |
| k17 | 0 / 1149 (no locality codes) |
| k18 | 1155 / 1156 |
| k19 | 1183 / 1184 |
| k20 | 1194 / 1195 |
| k21 | 1212 / 1213 |
| k22 | 1212 / 1213 |
| k23 | 1212 / 1213 |
| k24 | 1213 / 1214 |
| k25 | 1214 / 1215 |
| k26 | 1223 / 1224 |

Code 3400 (Hebron) lacks a usable retained CBS coordinate. K16 also lacks codes 50, 781, 1062, 1273, 1306, 1308, older localities later merged administratively. They are listed without positions. Ballot-box mapping is deliberately deferred: this delivery makes no claim of station-address availability and does not geocode stations at runtime.

## Verification

`npm run typecheck`, `npm test` (55 files, 465 tests), and `npx vite build` pass. `PW_PORT=4187 npx playwright test tests/e2e/locality-map.spec.ts` passes against the production build: bilingual search with niqqud, result selection, list-mode toggle, mocked address lookup/nearest selection, table fallback/search, k17 explanation, and map width at a 390 px viewport. The browser test blocks public tiles and mocks Photon, so it verifies integration without asserting live external-service availability. No screen-reader or full accessibility-conformance audit was performed.
