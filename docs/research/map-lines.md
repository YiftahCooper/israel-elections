# The historical and border lines on the Localities map: sources and decisions

*Written 7 November 2026; rewritten in plain language on 8 November 2026. Nothing was removed: every fact, date, number and source of the earlier version is kept.*

## In short

- **What this is about.** The Localities map (the map of election results by town) can show historical and border lines: the 1949 armistice lines, the Jerusalem no-man's-land, the borders with Egypt and Jordan, the Blue Line with Lebanon and the UN lines on the Golan. This document records where each line comes from, how it was checked and what the app says about it.
- **Why it exists.** These lines must be right, and some are politically sensitive. Every shape and every sentence needs a source someone else can check.
- **What ships.** Twelve layers, each with its own on/off switch, source date and explanation behind an (i). One more layer, the security barrier, is **not** shown, because no dated, well-sourced version was found.
- **How accurate it is.** These are approximate historical and map-scale lines, not land surveys. Lines taken straight from UN maps are as precise as those maps' printed scale allows (about ±200 m for the Blue Line, ±210 m on the Golan); the traced Jerusalem lines fit their UN map's control points within 8–59 m. Where sources disagree (some armistice stretches, by up to about 843 m), the (i) says so, and the line disappears when you zoom in so far that the uncertainty would show.
- **How it was checked.** A separate reviewer checked the lines three times, re-measuring them against the 1949 maps signed by both sides, UN maps and the treaty texts. Every problem found was fixed or openly disclosed. The details are below.
- **Sources used.** Shapes come from the signed 1949 maps, UN maps, treaty texts, Israeli official records and scholarship. OpenStreetMap (a free, volunteer-made world map) is used only where it agrees with those, and the difference is stated. No advocacy-group maps were used, from any side. No English Wikipedia was used.
- **Scope (7 Nov).** The armistice lines, UN zones and similar lines are shown, each with a correct explanation. Official non-partisan Israeli sources (Survey of Israel, govmap, IDF/COGAT, MFA) are acceptable primary sources for map lines.

## Terms used in this document

- **Armistice lines (1949).** The ceasefire lines Israel agreed in 1949 with Egypt, Jordan, Lebanon and Syria. The line with Jordan is often called the **Green Line**, after the ink colour on the maps. They were not international borders.
- **No-man's-land.** Strips between the two sides' armistice lines, which neither side's forces could enter. Jerusalem and Latrun had such strips from 1949 to 1967.
- **Signed map ("Map 1").** The armistice map signed by both Israel and Jordan in 1949. It comes in a north sheet and a south sheet.
- **UN map 229.** A UN map of central Jerusalem from November 1949, showing both sides' lines in detail.
- **OpenStreetMap (OSM).** A free world map drawn by volunteers. Its lines are convenient but not authoritative, so we check them against official sources.
- **OCHA.** The UN Office for the Coordination of Humanitarian Affairs, which publishes its own map data.
- **Natural Earth.** A free, public-domain world map at a coarse scale.
- **Blue Line.** The line the UN identified in 2000 to confirm that Israel had withdrawn from Lebanon. It is not an international border. **UNIFIL** is the UN force in southern Lebanon.
- **UNDOF, Alpha and Bravo lines.** UNDOF is the UN force that has separated Israeli and Syrian forces on the Golan since the 1974 disengagement agreement. The **Alpha** line is the western edge of the separation area, on the Israeli side; the **Bravo** line is its eastern edge, on the Syrian side. Between them lies the **area of separation**. Near Quneitra there is also a dashed line called **A-1**.
- **Registration.** Lining up a scanned paper map with real-world coordinates, using recognisable points on it (**control points**, such as printed monument symbols or grid lines). The **residual** is the leftover mismatch at those points after lining up; small residuals mean a good fit.
- **Grids.** Old maps print a coordinate grid. The 1949 maps use the British-era **Palestine grid** (also called the Palestine Belt grid); a point on it is written as a map reference, for example **MR 1877–1005**. Modern UN maps use **UTM**, the international grid. Lines such as "N130" or "N128000" are northings (east–west grid lines) on the Palestine grid.
- **Zoom level.** How far in the map is zoomed: about 3 shows the whole region, 15 shows streets. A line with a "maximum zoom" disappears when you zoom in further, so that its uncertainty is never enlarged into false precision.

## The layers on the map

Each layer has its own switch and (i). The table gives the overview; the details follow.

| Layer | Shown? | Main sources | Biggest known difference between sources |
|---|---|---|---|
| Armistice lines · Judea and Samaria | Yes, with scale limits | OpenStreetMap; a short OCHA stretch; UN map 229; the signed Map 1; the 1949 Israel–Jordan agreement | Up to about 843 m outside central Jerusalem |
| No-man's-land · 1949–1967 | Yes | OpenStreetMap (Latrun); UN map 229 (Jerusalem); MFA; Frid | — |
| Government House zone · 1949–1967 | Yes, overview only | OpenStreetMap; Israel State Archives; MFA; Frid | Not measurable; about 0.5 km short of UN map 229 at one edge |
| Mount Scopus · Israeli enclave · 1948–1967 | Partly (northern outline only) | OpenStreetMap; State Archives; MFA | Not measurable |
| Israel–Gaza Strip boundary | Yes | OpenStreetMap; OCHA; UN; UN document S/1471 | 922.5 m (OpenStreetMap vs OCHA) |
| Egypt · international border | Yes | OpenStreetMap; UN; Natural Earth; 1979 peace treaty | 359.9 m (OpenStreetMap vs UN) |
| Jordan · international border | Yes | OpenStreetMap; UN; Natural Earth; 1994 peace treaty | 763.2 m (OpenStreetMap vs UN) |
| Jordan · line with Judea and Samaria | Yes, in a different style | OpenStreetMap; 1994 treaty Annex I | — |
| Lebanon · Blue Line | Yes | UN withdrawal map 4143 Rev.1, July 2000 | Drawn from the UN map itself |
| Golan · 1974 Alpha line | Yes, overview only | UNDOF map 2916 Rev.143, September 2026 | Drawn from the UN map itself |
| Golan · 1974 Bravo line | Yes, up to zoom 11 | The same UN map; 1974 agreement | Drawn from the UN map itself |
| Golan · area of separation | Yes, up to zoom 11 | The same UN map; 1974 agreement | Drawn from the UN map itself |
| Security barrier | **No** | OpenStreetMap; an OCHA status list | No dated, well-defended source for what is built and what is planned |

### Armistice lines · Judea and Samaria

- **Sources:** OpenStreetMap, retrieved 7 November 2026 (2026-11-07), plus a short OCHA stretch near the village of Arab er-Ramadin; UN map 229 (November 1949); the signed Map 1; and the 1949 Israel–Jordan armistice agreement, Articles V(1)(a–c), VI(9) and VI(11).
- **What the check found:** comparing raw OpenStreetMap and OCHA lines gives a largest gap of 2,370.5 m, but that figure includes the Mount Scopus outline, which OCHA lacks. In central Jerusalem, OpenStreetMap's pair of lines was wrong. It was replaced by tracing both lines from UN map 229, lined up with seven control points (residuals of 8–59 m). Outside the area UN map 229 covers, OpenStreetMap remains an approximation: ordinary differences between sources reach about 843 m.
- **Where sources disagree:** at Arab er-Ramadin, the signed Map 1 sides with OCHA, so OCHA's line is used there, joined exactly to the OpenStreetMap line at both ends (see "Third check" in the technical notes). No unverified later adjustment ("rectification") of the line is claimed.
- **Shown:** yes, with limits on how far you can zoom in.

### No-man's-land · 1949–1967

- **Sources:** OpenStreetMap's paired edges at Latrun; UN map 229 in central Jerusalem; the MFA's Jerusalem background paper; Frid, pp. 470–473.
- **What is drawn:** two areas, Latrun and central Jerusalem, the latter corrected and north of Palestine-grid line N130. The Government House zone is a separate layer.
- **Details:** in Abu Tor the gap between the two lines is about 280 m, at latitude 31.7694 N. The northern pair of lines and the fill between them continue to the edge of the lined-up UN map, near 31.800 N. The eastern end of the Latrun area follows OpenStreetMap; it was never defined on an agreed map.
- **Shown:** yes.

### Government House zone · 1949–1967

- **What it is:** the area around Government House in Jerusalem, which after 1949 was a separate demilitarised zone, not part of no-man's-land.
- **Sources:** OpenStreetMap outlines; the Israel State Archives; the MFA's Jerusalem background; Frid (Tel Aviv University, 2024), pp. 470–477.
- **What is drawn:** its own cross-hatch, cut off at Palestine-grid lines N128000 and N130000. The Government House building lies inside this zone and outside no-man's-land.
- **What the (i) says:** the temporary four-month terms for civilian use; Jordan's refusal to approve the unsigned Nuwar–Dayan line; and the later recognition in practice. The internal civilian line is **not** drawn, because no verified map of it exists; we do not invent it.
- **Shown:** yes, at overview zoom only, because its positional accuracy cannot be measured.

### Mount Scopus · Israeli enclave · 1948–1967

- **Sources:** OpenStreetMap's northern arc; the State Archives; the MFA.
- **What is drawn:** an open, partial northern outline only. It leaves out the southern lobe at Augusta Victoria. There is no guessed internal border and no closed outline.
- **What the (i) says:** the arrangement of 7 July 1948 created an Israeli enclave and an adjoining Jordanian section at Augusta Victoria, both under UN protection. It also explains that Isawiya was mapped one way and treated another in practice, and that the limits were disputed.
- **Shown:** partly, at overview zoom only.

### Israel–Gaza Strip boundary

- **Sources:** OpenStreetMap; OCHA; the UN's global maps; UN document S/1471 of 22 February 1950.
- **What is drawn:** today's land boundary on the Israeli side. It is not a reconstruction of the original 1949 line.
- **Check:** OpenStreetMap differs from OCHA by up to 922.5 m and from the UN by up to 372.9 m.
- **What the (i) says:** S/1471's patrol arrangements and its Article III reservation are kept apart from today's line. There is no "yellow line" and no military buffer zone.
- **Shown:** yes.

### Egypt · international border

- **Sources:** OpenStreetMap; the UN 1:1 million map; Natural Earth 1:10 million; the 1979 peace treaty, Article II, as published by the MFA and in the UN Treaty Series (volume 1136, p. 117).
- **Check:** OpenStreetMap differs from the UN by up to 359.9 m and from Natural Earth by up to 3,211.7 m. Natural Earth is very generalised, so it is only a coarse check, not precise border-marker control.
- **What is drawn:** the border, not including the Gaza–Egypt stretch. The treaty's reservation about Gaza's status is stated.
- **Egypt quotation:** the English treaty text shown in the app is checked word for word against the original instrument in the UN Treaty Series, because the MFA embassy web page has a typing error ("in" where the original says "is"). The Hebrew is marked as a translation. No new claim about Taba is made without the separate arbitration award.
- **Shown:** yes.

### Jordan · international border

- **Sources:** OpenStreetMap; the UN and Natural Earth maps; the 1994 peace treaty, Article 3(2), as published by the MFA; the official Israeli government Hebrew record.
- **Check:** comparing whole sources, OpenStreetMap differs from the UN by up to 763.2 m and from Natural Earth by up to 5,921.4 m.
- **What changed:** the stretch facing Judea and Samaria is now its own layer (next section). An extension at Hamat Gader was removed. The northern end now stops near map reference MR 209.5–232.2, converted to 35.63141 E, 32.68356 N. This is a decision about where to stop drawing, not a claim to have the binding treaty coordinates.
- **Shown:** yes.

### Jordan · line with Judea and Samaria

- **What it is:** the stretch of the Jordan line that faces Judea and Samaria. The 1994 treaty (Annex I(a), section 2.A.7) requires it to be shown differently on maps, with a fixed sentence saying that it is an administrative line and settles nothing about the territory's status.
- **Sources:** the same OpenStreetMap data; the MFA's English Annex I(a) 2.A.7; the official government Hebrew text.
- **What is drawn:** a separate dash style, with the treaty's own disclaimer quoted. The stretch is identified from the source map's labels and the connecting river line. Its northern end is at 35.5549603 E, 32.3890173 N, where the Green Line meets the Jordan. It is not cut at an arbitrary latitude.
- **Shown:** yes.

### Lebanon · Blue Line

- **Source:** **UN withdrawal map 4143 Rev.1, July 2000.** The line is taken directly from the UN map.
- **What changed:** the complete UN line replaced an earlier partial OpenStreetMap selection. It now includes Har Dov and Margaliot. All 701 points of the UN line are kept.
- **Earlier comparison, kept as evidence:** of 53 OpenStreetMap pieces, 49 agreed with the UN line to within 165 m; four differed by 301–636 m.
- **Accuracy:** about ±200 m, the precision the printed map scale allows. It is not a survey of the blue barrels that mark the line on the ground.
- **Shown:** yes.

Why this map and not others: an earlier comparison with the UN's 1:1 million international-boundary map **cannot show that a line is the Blue Line**. The March 2026 UNIFIL deployment map is also not used for a point-by-point check, because a team boundary on it (that of Observer Group Lebanon) could be mistaken for the Blue Line. Map 4143 explicitly identifies the June 2000 withdrawal line and gives its WGS84/UTM 36N grid. [UNIFIL's FAQ](https://unifil.unmissions.org/en/node/28372), read directly, distinguishes the withdrawal line from an international border and from the physical barriers nearby. The app makes no unsourced claim about how Ghajar is divided.

### Golan · 1974 Alpha line

- **Source:** **UNDOF map 2916 Rev.143, September 2026.** The UN's own drawn line is used directly.
- **Check:** an independent comparison with OpenStreetMap differs by up to 460.1 m one way and 429.8 m the other. Lining up the UN map with its grid leaves a residual of 48.8 m.
- **Accuracy:** about ±210 m. Overview zoom only.
- **Shown:** yes.

### Golan · 1974 Bravo line

- **Sources:** the same UNDOF map 2916 Rev.143 (September 2026); the 1974 agreement, paragraphs B(3–4).
- **What is drawn:** the UN line with its printed gaps kept; nothing is added to join them.
- **Accuracy:** about ±210 m; maximum zoom 11.
- **Shown:** yes.

### Golan · area of separation

- **Sources:** the same UN map; the 1974 agreement, paragraphs B(3) and C.
- **What is drawn:** the white area printed on the UN map, cut exactly along the Alpha line. That removes a separate strip near Quneitra (between the A and A-1 lines), which is not part of the area of separation. The A-1 line itself is not drawn.
- **Why the cut matters:** the [1974 agreement](https://docs.un.org/en/S/11302/Add.1), obtained through the ordinary UN document viewer and kept locally, says in Annex A, B(3), that the area between lines A and B is the area of separation. Paragraph C separately bans military forces between lines A and A-1. The UN map's white fill covers both near Quneitra. **Using the whole fill as the area of separation would be wrong.** No new line was drawn to make the cut; the existing Alpha line was used. These are map-scale coordinates, not surveyed treaty coordinates or current deployments.
- **Accuracy:** about ±210 m; maximum zoom 11.
- **Shown:** yes.

### Security barrier (not shown)

Sources looked at: OpenStreetMap and a candidate OCHA status list. No dated, independently defensible split between built and planned sections was found, so the layer is not shown. It is optional.

## Jerusalem: lining up the UN map, and where the lines stop

To use UN map 229, its scan had to be lined up with real coordinates. The kept [registration controls](../../data/raw/map-lines/jerusalem-registration.json) use seven monument symbols spread across the map. The fit uses one scale in both directions: **4.0885 m per pixel**, which agrees with the map's printed scale bar. An earlier fit used four control points with a different scale in each direction; it gave unreliable results away from the control points and has been replaced everywhere, including the record kept in the docs. Small residuals do not guarantee survey accuracy. The [pixel-centre traces](../../data/raw/map-lines/jerusalem-un229-traces.json) of both lines are kept, so the production lines can be rebuilt without the internet and without re-tracing.

**Where the lines stop in the north.** The top edge of UN map 229, converted with those controls, is near **31.800 N**, not the reviewer's approximate 31.798 N. Both lines stay separate up to that edge. Inside the UN map's area, the old single OpenStreetMap line was removed and replaced by the two traced sides. Outside it, the single OpenStreetMap line remains, as an openly approximate continuation: we could not establish which side it represents or settle it from a precise historical source. A cautious zoom limit stops it being enlarged into a detailed boundary. The northern end of the no-man's-land shading is **where the source map ends**, not an agreed boundary. The southern shading ends at grid line N130; Government House's southern edge is N128. Grid boxes were converted point by point, so straight grid edges are not replaced by wrong long diagonals in latitude and longitude.

**What is deliberately not drawn.** Government House's internal civilian line is absent. Frid describes an initially temporary arrangement for civilian use, later marked with stones and later confirmed in practice; the app does not call it a permanent political partition. The State Archives distinguish demilitarised Government House and Mount Scopus from the no-entry gaps between the two forces' lines. No verified map of the Israeli/Jordanian division inside Mount Scopus is available, so the partial northern outline deliberately leaves that division open.

## Official texts, and exactly what each source covers

- [MFA, *Jerusalem — Legal and Political Background*](https://www.gov.il/en/pages/jerusalem-legal-and-political-background), by Ruth Lapidoth, 30 June 1998. Read directly. It describes separately the Government House civilian zone, the no-entry no-man's-land, and Mount Scopus and Augusta Victoria under UN protection.
- [Israel State Archives, סיפורו של הקו העירוני ("the story of the city line")](https://catalog.archives.gov.il/site/chapter/the-urban-line-2/). Quotations from it in the review supplied to the project support the Government House and Mount Scopus status and the Isawiya distinction. During this correction, normal browser access returned "Forbidden", and the reviewer's saved copy also contains only "Forbidden". These are quotations credited to the review; we do not claim to have read the page or a map from it directly. No way around the block was attempted.
- [Yoram Frid, Tel Aviv University, *Israel* 31–32 (2024)](https://humanities.tau.ac.il/sites/humanities.tau.ac.il/files/media_server/humanities/zionism/%D7%99%D7%A9%D7%A8%D7%90%D7%9C/31-32/yoram_frid.pdf), pp. 463–484, especially 470–473. The kept PDF was read, and the publisher's issue page confirms the link. Grid lines 128 and 130, the civilian arrangement and the Latrun closure are sourced here.
- [MFA, 1994 Israel–Jordan peace treaty](https://www.gov.il/en/pages/israel-jordan-peace-treaty) and [Annex I](https://www.gov.il/en/pages/israel-jordan-peace-treaty-annex-1). The English Article 3(2) and section 2.A.7 were read directly. The exact quotations in both languages, with their locations, are in [official-treaty-excerpts.json](../../data/raw/map-lines/official-treaty-excerpts.json).
- **Where the Hebrew treaty text comes from.** The MFA's Hebrew page could not be opened normally (it was blocked by Cloudflare). So the Hebrew is copied word for word from the **official government Hebrew record, State Archives file 9628/5**, from [the scanned original](https://commons.wikimedia.org/wiki/File:Israeli_government_original_hebrew_copy_of_the_peace_agreement.pdf), kept locally. PDF pages 5 and 18 were checked by eye. It is **not our translation, and we do not claim it was read from the MFA's Hebrew page**. One wording difference: the archive's Annex introduction says "הגדה המערבית" and its English counterpart says "West Bank", whereas the MFA's English version says "territory that came under…1967". The required disclaimer agrees in substance. The app keeps each published version as it is and never silently changes words inside a quotation. The app's own label remains "Judea and Samaria".
- The scanned government record also contains two Survey of Israel border maps dated 26 October 1994 (PDF pages 104–105, north and south sheets, 1:250,000). These are overview sheets with their own warning that they have no authority over the boundary; they are not the binding aerial photographs or the official coordinate list (IJBD94). They are not used to check where the 1949 line crossed; the separate signed 1949 map now does that.
- The 1949 Article VI(9) English quotation is from the agreement itself; the Hebrew is clearly marked as a translation. This differs from the 1994 quotations, where the Hebrew is official.

**A correction to the earlier report.** The kept UN Treaty Series volume 42 contains the agreement text and a black-and-white **Palestine North Sheet, 1:250,000**. It does not contain the Jerusalem map (Map 2) or the south sheet, and it does **not** confirm a Mount Scopus outline. It must not be confused with the UN UNISPAL page for document S/1302/Rev.1, which does supply the north and south sheets signed by both sides, now kept as a scan. UN map 229 is a separate map of central Jerusalem, not an annex quietly supplied by that volume.

## Further checks of particular points

### The Dead Sea end of the armistice line

- **Modern sources:** the [Dead Sea check record](../../data/raw/map-lines/dead-sea-check.json) gives the modern OpenStreetMap end point as **35.476012 E, 31.493120 N**. It is 4.8 m from the modern UN line and 242.5 m from OCHA. Within the comparison box 35.3–35.6 E / 31.47–31.53 N, the largest sampled differences (measured both ways) are 400.1 m to OCHA and 526.4 m to the UN. These modern comparisons are separate from the signed-map check below.
- **The 1949 agreement:** Article V(1)(c) assigns the Hebron–Dead Sea stretch to line B on Map 1. Article V(1)(d)'s map reference MR 1925–0958 concerns the separate southern sector.
- **The signed map:** **the earlier claim that a sheet was missing was wrong.** The UN UNISPAL page supplies both signed Map 1 sheets, at 3119 × 8630 pixels. Their printed Palestine grid gives about 51 m per pixel. On the signed map, the line reaches the shore near MR 1877–1005 and turns south near 1951–1000; the modern line is near 1879–0999 and 1952–1003. They agree within about 0.5 km, which is what you'd expect from the lining-up and the width of the printed symbols. No end point was moved and no guessed connecting line was added.

### Where the signed map settles a disagreement, and where it can't

The [signed-map check record](../../data/raw/map-lines/signed-map-check.json) holds the grid formula, the control points, the limits, and all 38 places in Judea and Samaria where OpenStreetMap and OCHA differ by more than 300 m. The worst point of each was cropped from the signed map and inspected.

- At **Rantis/Qibya**, the signed map supports OpenStreetMap.
- At **Arab er-Ramadin**, it supports OCHA, which is used only inside a recorded local box. The third check joined the two products at their exact source points; the short joining stretches are cartographic transitions, not surveyed treaty geometry. The remaining points of this long stretch are not certified.
- **Elsewhere** the disagreement stays unresolved, because ink width, the lining-up, or historic changes to the line made in stages (establishment and later rectification) prevent a clear answer.

The signed map is not assumed to be modern ground truth everywhere. Articles VI(3) and VI(11), which allowed later adjustments, are possible background, not evidence of any particular local change.

### Blue Line

The [Blue Line check record](../../data/raw/map-lines/blue-line-check.json) lists **every one of the 53 OpenStreetMap pieces**, with each one's largest difference, the worst coordinates and how many points were sampled. The line itself is extracted from UN map 4143 Rev.1 and lined up with three printed UTM grid points. Every original point is kept, and segments are filled in every 10 m or less; points are sampled at most 5 m apart. This checks that the drawing matches the map; it is not a survey of the physical barrels.

Four OpenStreetMap pieces differed from the UN line by 300.9 m to 636.1 m and were left out entirely (the full list is in the technical notes). One of them is at Ghajar: its source notes describe a unified village with no border crossing, and it could not be shown to be the withdrawal line.

The earlier selection of 49 pieces matched within 200 m (in fact within 164.3 m) but left out 15.9 km at Har Dov and 650 m at Margaliot. The app now uses the **whole UN line**, not a mix of unidentified 1923 and 2000 segments. The coordinates come from the printed UTM grid crossings, not from tracing by eye. "±200 m" describes the published map's scale, not surveyed accuracy on the ground.

### Alpha line

The [Alpha check record](../../data/raw/map-lines/alpha-line-check.json) covers all five OpenStreetMap pieces, with their largest differences and worst coordinates (listed in the technical notes; the largest is 460.1 m). On UNDOF map 2916 Rev.143 the Alpha line is the **western edge of the separation area**; the Bravo line and the dashed Quneitra A-1 line are separate lines on the map and are not mixed up with it. The map's printed grid is the **Palestine Belt** grid, not UTM. Fourteen control points read from actual printed grid lines (not from the grid labels, which are offset) give a fit in which the two directions' scales differ by only 0.084%, with residuals of at most 48.8 m. Overlays of the source were inspected from north to south, including Quneitra and the Yarmouk end.

## Lines not drawn yet, and what they would need

- **The 1949 Syrian armistice line and its three demilitarised zones.** The agreement (UN Treaty Series 42, No. 657, Annex I) describes them in words: map references, wadis (dry riverbeds) and shorelines. Drawing them needs historical tracing of those wadis and shorelines and a separate check against a lined-up map, and must also explain that Israeli law has applied on the Golan since 1981. The missing 1:50,000 inset map is not replaced by guesses.
- **The 1949 Lebanon line.** Article V(1) of that agreement adopts the international boundary. The app's Blue Line text now describes only the separately identified 2000 withdrawal line.
- **The original 1949 Gaza line, the 1950 patrol zones and the El Auja demilitarised zone.** These can be rebuilt only with their own historical base map and source checks.
- **The Gaza "yellow line".** Not added: the IDF's public explanation has no official mapped coordinates.
- **Government House's civilian line and the division inside Mount Scopus.** These need the actual map (from the State Archives or Narkiss), not a split inferred from text.

## How the map shows the lines, and licences

- The final wording, links and quotations in both languages live in one place in the app and are shown directly by the map legend. Every layer has its own switch, an (i), its source date and its uncertainty.
- **Zoom limits.** Each line has its own maximum zoom, set cautiously so that measured differences between sources never exceed 20 pixels on screen (at latitude 34° N). Lines whose accuracy can't be measured (Government House, Mount Scopus) stop at overview zoom 10. The Localities map itself stops at zoom 15, and approximate lines usually disappear earlier. A notice in both languages explains this, in a reserved space so it doesn't move the map. A difference between sources is not claimed to be a guaranteed maximum error.
- **Style.** Line ends are cut square; patterns and line widths are the same in light and dark themes. In dark mode, motorway centres, bridges and runways are grey rather than black, so they don't look like boundaries.
- **Credits and licences.** Coordinates taken from OpenStreetMap remain © OpenStreetMap contributors, under the Open Database Licence (ODbL). The central Jerusalem correction comes from UN map 229 and is credited separately; UN material is not claimed to be under the OpenStreetMap licence or endorsed by the UN. The Blue Line, Alpha, Bravo, the area of separation and the local OCHA stretch keep their UN and OCHA credits and terms. Natural Earth is public domain. No English Wikipedia was used. No protected source was accessed by getting around a block.

## Technical notes (for developers)

### Review history

This revision answered the second independent review of `81b1e00`, after the first review of `1cdcde2`; its geometry and source claims replace the earlier reports. A third check of `27964b1` followed (below). Provider labels and boundaries in the basemap remain hidden. No product was shown to provide independent original survey control.

### Source identifiers per layer

| Layer | Source identifiers |
|---|---|
| Armistice lines · Judea and Samaria | OSM relation 7304999; local OCHA Ramadin segment; UN map229; signed Map1 |
| No-man's-land | OSM paired edges (Latrun); UN229 (central Jerusalem) |
| Government House zone | OSM outlines; clipped at Palestine Belt N128000/N130000 |
| Mount Scopus | OSM northern arc |
| Israel–Gaza Strip boundary | OSM relation 1473938 |
| Egypt · international border | OSM relation 1473946; UNTS 1136, I-17813, p.117 |
| Jordan · international border and administrative sector | OSM relation 184818 |
| Lebanon · Blue Line | UN 4143 Rev.1, native path133 |
| Golan · Alpha | UNDOF 2916 Rev.143, native path1742 |
| Golan · Bravo | UNDOF 2916 Rev.143, native paths 1743–1748 (paths 1749–1755 are the dashed Quneitra A-1, not drawn) |
| Golan · area of separation | UNDOF 2916 Rev.143, native white fill900, split at path1742 |
| Security barrier (not shipped) | OSM relation 1410327; OCHA status candidate |

### Blue Line: omitted OpenStreetMap ways

| Omitted OSM way | Maximum difference | Decision |
|---|---:|---|
| 705757468 | 317.9 m | Unresolved local mismatch; omit whole way |
| 830869382 | 483.8 m | Unresolved local mismatch; omit whole way |
| 842176370 | 300.9 m | Unresolved local mismatch; omit whole way |
| 1188316285 | 636.1 m | Ghajar: source note describes a unified village with no border crossing; withdrawal-line identity is not established; omit |

Native withdrawal stroke path133 is extracted from UN 4143 Rev.1 with three explicit UTM grid controls; all original vertices retained; segments densified to ≤10 m; point-to-segment sampling gap ≤5 m.

### Alpha line: OpenStreetMap comparison

| OSM Alpha way | OSM→UN maximum |
|---|---:|
| 95034190 | 387.4 m |
| 793722585 | 354.4 m |
| 793722588 | 301.8 m |
| 793722591 | 460.1 m |
| 1194778776 | 190.7 m |

### UNDOF fill split

Native white fill900 covers both the area of separation and the Quneitra A/A-1 strip. An exact planar split by native Alpha path1742 keeps the main 16,982.009 pt² polygon and removes the 132.355 pt² Quneitra strip, plus subpixel print slivers. Alpha, Bravo and the fill are rendered separately; native Bravo pieces keep sub-0.3 pt print gaps. The operation is recorded in [undof-area-check.json](../../data/raw/map-lines/undof-area-check.json).

### Egypt quotation

The displayed English is checked word for word against **UNTS 1136, I-17813, p.117**, PDF index 134. The source list includes that original; its one-page extract is kept as `scans/egypt-treaty-article-II.pdf`, with the full download's SHA256 recorded in `official-treaty-excerpts.json`.

### First-round review findings (F1–F14)

| ID | Status / correction | Check |
|---|---|---|
| F1 | Fixed: Government House separate zone/style/legend/(i); N130/N128 cuts; no invented civilian line | Grid conversion, point-in-polygon regression, source passages, Jerusalem screenshots |
| F2 | Fixed: both central sides traced from UN229; Abu Tor gap restored | Seven-control registration, source overlay and 240–310 m gap regression |
| F3 | Fixed within source coverage; outside continuation explicitly approximate | North pair/hatch regression at 31.7994 N; source overlay; map-coverage closure disclosed |
| F4 | Presentation/editorial text fixed; exact official Hebrew source is the government archive, **MFA Hebrew access remains unavailable** | Separate admin-layer geometry/dash, bilingual source fixtures, rendered disclaimer e2e; source-version distinction above |
| F5 | Fixed: Hamat Gader extension removed | Two way IDs excluded; Yarmouk cut near converted 1949 MR point; geometry regression and screenshots |
| F6 | Fixed with partial outline: Augusta lobe omitted, 1948 date, truthful sources | Open-arc/min-latitude regression, Archives/MFA text, Scopus screenshots |
| F7 | Fixed: only central UN229 check claimed; false annex claims removed | Catalogue and report read against retained PDF and source scope |
| F8 | Fixed for dark motorway, motorway bridge and runway classes | Non-mutating style unit test and Route 50/Atarot dark screenshots; provider boundaries still absent |
| F9 | Fixed: butt caps, 2px strokes, 1.4px hatch strokes, matching 8px patterns; Government House has a 2px dashed outline | Shared stroke policy, rendered path assertion, both-theme legend/map inspection |
| F10 | Fixed: Latrun eastern closure explicitly OSM and never agreed on a map | Frid passage, bilingual (i), Latrun screenshots |
| F11 | Complete native 2000 withdrawal line now replaces the 49-way partial selection | All 53-way measurement record, source overlays, Blue Line screenshots and equivalent source labels |
| F12 | Fixed: per-feature source-precision maxZoom, unknown outlines overview only, every (i) states uncertainty | 20px policy regression, map zoom-limit e2e, detail screenshots; fixed space prevents the notice moving the map; locality names remain independent |
| F13 | Fixed: each flagged sentence rewritten to instrument scope, EN/HE equivalent except the faithfully preserved official treaty variant | Source-by-source copy review, all twelve bilingual (i) captures; VI(9) Hebrew explicitly translated |
| F14 | Checked and reported; additional unsourced layers remain withheld | Dead Sea primary-clause/modern endpoint check, all 53 Blue / all 5 Alpha measurements; next-source requirements under "Lines not drawn yet" |

### Second-review corrections (R2)

Merged `origin/main` at `79b4c41`, preserving Settings' decimal behaviour. The generated gaps register was refreshed from the merged inputs.

| ID | Status / correction | Verification |
|---|---|---|
| R2-1 | Fixed. Keep Government House's OSM armistice edges through zoom 11; discard sub-2 m extraction stubs. Zone has a 2 px dashed outline and 8 px cross; its 0.5 km UN229/OSM mismatch is disclosed. | Regression samples both edges every ~55 m at every zoom 3–15, respecting source caps; Jerusalem z10/z11 in both themes/languages. |
| R2-2 | Fixed. Keep signed north/south sheets; remove the unavailable-sheet claim. Dead Sea crossing agrees within ~0.5 km. | UNISPAL page, signed-sheet grid/crop, regenerated endpoint JSON. |
| R2-3 | Fixed. Distinguish former Iraqi front VI(2), Kh. Deir Arab–Jerusalem V(1)(a), Jerusalem V(1)(b), Hebron–Dead Sea V(1)(c), and VI(11) rectifications. | Treaty text and bilingual copy. |
| R2-4 | Fixed. ההדמאה; no full stop after 1967. Exact source quotation pinned. | Every quoted Hebrew word reread against retained government PDF indices 4/17. English versions keep their stated official locators. |
| R2-5 | Fixed. `MapLineText` isolates Latin/numeric references with `bdi dir=ltr`; headers localised. Balanced reference parentheses stay inside the isolation; enclosing Hebrew punctuation stays outside. | Unit regression; Hebrew phone e2e checks V(1)(b), ±60, I(א) 2.A.7 and the official word. All 12 Hebrew explanations captured in both themes. |
| R2-6 | Fixed. Entire UN 4143 native Blue Line, including Har Dov/Margaliot; partial label removed. | All 701 native vertices retained, published source path check and regional captures. |
| R2-7 | Fixed. Four-month civilian terms, Jordan's refusal on 28 June 1949, unsigned line, practical recognition and June 1957 confirmation. Grid 128/130 describes civilian residence terms. | Frid pp. 471, 473, 477; equivalent EN/HE. Internal civilian line still withheld. |
| R2-8 | Partly resolved; remainder explicitly unresolved. OCHA substituted locally at Ramadin, with source-node joins added in the third check; Rantis keeps OSM. All 38 large clusters recorded; the coarse map cannot certify every whole cluster. | Signed-map crops and decision JSON. No invented local rectification. |
| R2-9 | Fixed. Separate Bravo and separation layers from 2916; Quneitra A/A-1 strip excluded under agreement B(3)/C. | Native paths, exact source-path split, valid closed polygon, retained check JSON, overview cap 11 and Golan/Quneitra captures. |
| R2-10 | Fixed. Egypt Art. II quoted; unsupported Taba/common 1923/fence detail removed. Official UN 1974 agreement and Syria Annex I(24) cited. | Egypt quotation checked against UNTS 1136 p.117; retained 1974 PDF via official UN viewer; catalogue source-scope read-through. |
| R2-11 | Fixed. Scopus 1948–1967 and 2 px dash marks; Government House 8 px cross and outline. | Matching legend/map style; both-theme visual checks. |
| R2-12 | Fixed. Native disclosure collapses the phone legend; shorter copy moves method details here. | 390 px default-closed e2e; desktop/phone bilingual captures. Precision notice still reserves fixed space. |

Validation for R2: TypeScript and build passed after the main merge. Vitest: **1,206/1,206 tests, 122 files**, two workers. Map e2e: **11/11**, one worker. Full e2e: **667/667 passed**, two workers, isolated port 5506, 16.2 minutes. Playwright reported zero unexpected, skipped or flaky results and zero run errors; the retained process exit code is **0**. That run used the final merged build, including the Egypt source citation. The final metadata-only clarification of two out-of-coverage discrepancy records was followed by a full passing unit run. All browser timeouts were unchanged.

**180 final native-resolution captures**, with no page errors, are in `.backup-scratch/v4-r2/`: 96 affected-region captures (12 locations × he/en × light/dark × 1500/390), 36 election overviews (k26/k25/k1; 1500/1024/390) and 48 explanations (all 12 layers × he/en × light/dark). The affected locations include Jerusalem z10/z11, Latrun, Hamat Gader, Scopus, Dead Sea, Har Dov, Margaliot, the Golan overview, Quneitra, Ramadin and Rantis. All affected-region combinations and all explanations were inspected in native-pixel contact sheets, which crop and arrange the original pixels without resizing. `capture.mjs`, `contacts.py` and `captures.json` keep the exact parameters and viewport/theme/language records in scratch. The final explanation recapture follows the last source-citation correction. Geometry and the four compact source-check outputs reproduce byte-identically from retained inputs. The production geometry and compact source-check records regenerate offline; the full unit run and the targeted map run both exit 0. The screenshot preview was on port 5503. No push or merge into main was performed.

### Third check of 27964b1

Merged `origin/main` at `f9edd8f`, preserving C1, the colour guard and the dataset fingerprint test. The only stylesheet conflict kept both sets of rules.

- **R2-5 fixed:** the map reference extractor now accepts `. , :` inside a reference only when another alphanumeric character follows. Sentence-final `. , : ;` stay outside the LTR isolate. Nested reference parentheses, decimals, map ratios and document IDs stay intact; quotation text is unchanged. New regressions were seen failing on 27964b1 and passing after the correction. Every public field, source caption and quotation is checked in both languages for isolates ending in punctuation. The live Hebrew popup check applies the same rule.
- **Related-helper audit:** `HistoryText` in `AfterElection.tsx` is the only other automatic prose-token isolation pattern. Its decimal/grouping punctuation already requires following digits, so it cannot absorb sentence-final punctuation. Signed-value and date helpers build their references directly, with punctuation outside. No similar faulty extractor was found elsewhere in `src/`.
- **R2-8 joins fixed:** the replacement keeps all seven accepted OCHA vertices and is spliced to existing OpenStreetMap vertices: west `(34.909792,31.3563778)` on way 95258495; east `(34.9503931,31.3480643)` on way 87237529. The west source way is kept north of the anchor; replaced ways 95258528/95258529 and the old box-cut stubs are removed. The short transitions are about 56 m and 347 m. Both resulting end points are exactly shared with the kept source ways. These are recorded cartographic source transitions, **not surveyed treaty coordinates**; the existing 922 m qualification and maximum zoom 11 are unchanged. The geometry test checks exact end-point equality and matching visibility at every zoom 3–15. Other signed-map discrepancies keep their unresolved status.
- **Publisher names fixed:** every user-facing map label and explanation now says **OpenStreetMap** in full. Internal source IDs and research abbreviations are unaffected. A bilingual catalogue-wide regression rejects the abbreviation in public copy.
- **Stash hygiene:** the earlier named v4-r2 stash was absent from the shared list at the start of this task. Other agents' stashes were not touched. The temporary v4-r3 stash was to be removed only after this task was committed.

**56 new native-resolution captures** are in `.backup-scratch/v4-r3/`: all 12 Hebrew explanations at 1500/390 in light/dark (48 popup crops), plus Ramadin in he/en at 1500/390 in light/dark (8 map captures). All were inspected at native pixel size in contact sheets that arrange the original pixels without resizing. The capture script also rejects live popup isolates ending in sentence punctuation and any remaining abbreviated publisher name. No page errors were recorded. `capture.mjs` and `captures.json` keep the exact parameters and text readbacks.

TypeScript and build pass on the merged state. Vitest: 1246 tests / 128 files passed, including C1, colour guard and fingerprint checks. Targeted map e2e: 11/11 passed. **Full e2e: 684/684 passed**, two workers, isolated port 5520, 11.6 minutes, exit 0. No skipped, flaky or unexpected results and no run errors. All checks used the merged f9edd8f state; timeouts are unchanged. Production and served geometry have the same SHA256, and the geometry plus both source-decision outputs regenerate byte-identically from retained inputs. The screenshot preview was on port 5522. No push or merge into main was performed.

### Rendering code and licence files

Final bilingual copy, links and quotations live in `src/app/locality-map-line-catalogue.ts`, rendered directly by the legend. Per-feature maxZoom keeps quantified source differences below 20px at 34°N; unquantified Government House/Scopus outlines stop at overview zoom 10; the locality map stops at 15. Licence texts: `data/raw/map-lines/LICENSE.md` and `public/data/map-lines.license.txt`.

### Reproduction

All required inputs are kept under `data/raw/map-lines/`; generated production geometry is committed. Python dependencies are pinned in `research-requirements.txt` (Python 3.14.4; Shapely 2.2, pyproj 3.8, NumPy 2.5.4, Matplotlib 3.11.2, Pillow 13, PyMuPDF 2.1). Install copies and caches only in project scratch. From the repository root, using that dependency environment:

1. `python3 scripts/check-map-line-sources.py` recreates the native-PDF Blue/Alpha/Dead Sea JSON checks and diagnostic source overlays in `.backup-scratch/v4-fixes/`.
2. `python3 scripts/check-signed-armistice-map.py` recreates the 38 signed-map crops in `.backup-scratch/v4-r2/signed-map/` and the compact decision JSON. `python3 scripts/extract-map-line-vectors.py` extracts the native UN lines and fill offline, using the retained Alpha grid registration. Then `python3 scripts/build-map-lines.py` rebuilds production geometry from these retained inputs. No interpolation connects source gaps.
3. `python3 scripts/audit-map-lines.py` recreates the continuous >100 m OCHA/OSM intervals and 114 crops under `.backup-scratch/v4/`.
4. The original first-pass workflow `python3 scripts/archive-map-line-audit.py` writes the [coordinate/decision atlas](map-line-stretches.md), retained JSON, and copies crops into `.backup-scratch/v4/map-line-checks/`, **never docs**. It predates the signed-sheet tie-break: rerun `check-signed-armistice-map.py` afterwards to restore the revised decisions. It records 338 continuous portions in 114 clusters, without treating either product as authoritative.
5. `python3 scripts/register-jerusalem-map.py` recreates the corrected seven-control source overlays in scratch and the compact control JSON. `python3 scripts/register-golan-map.py` recreates the older 2024 diagnostic in scratch; the new native 2026 check is the decisive Alpha comparison.
6. `python3 scripts/compare-map-lines.py` reproduces the earlier matched UN/NE comparisons. Those whole-source Jordan/Blue results predate the production scope cuts and are not substituted for the new targeted checks.

Use `PYTHONPATH=.backup-scratch/v4/python MPLCONFIGDIR=.backup-scratch/v4/mpl` with the existing local dependency copy. All 116 PNGs formerly under `docs/research/map-line-checks/` were moved to scratch (the reviewer's 118 files included **two JSONs**, which remain). The atlas has one regeneration note instead of image embeds. The source PDFs/JPGs, manual trace inputs, JSON evidence, accepted outputs and write-ups remain durable. No global temporary-directory setting is changed.
