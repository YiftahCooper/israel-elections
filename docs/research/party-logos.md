# Party logos by election — research and source archive

Research objective: supply election-specific list and constituent emblems for the explorer without substituting later designs, under the owner’s free-licence or fair-use identification policy (decision 0089). As of 4 November 2026. The catalogue remains incomplete; the continuation below records the live-site research and exact remaining gaps. The source policy in README.md and docs/DATA.md applies.

## Reading coverage

“Hosted” counts whole seat-winning lists with a local, eligible logo. “Dated external” counts whole-list candidates with date evidence but a failed download; these are not display-ready. “Rights only” was the earlier name for source-only candidates; these now require official-origin and campaign-date verification, and do not count as coverage. Constituent emblems never count as whole-list coverage. Missing means no qualifying emblem was verified here, not that the party had no emblem.

Seat-winning denominators come from public/data/kNN.json officialSeats; k26 has null officialSeats. Its meta.lists covers joint lists only and therefore incorrectly yielded eight winners in the earlier pass. The eleven members of the pre-election bloc scheme in data/meta/k26.json supply the complete winner set (reported results, pending official gazettement). The research does not alter or independently verify those results.

| Election | Winners | Hosted | Dated external | Rights only | Local constituent emblems |
|---|---:|---:|---:|---:|---:|
| k1 · 1949-01-25 | 12 | 1 | 0 | 0 | 0 |
| k2 · 1951-07-30 | 15 | 0 | 0 | 0 | 0 |
| k3 · 1955-07-26 | 12 | 0 | 0 | 0 | 0 |
| k4 · 1959-11-03 | 12 | 0 | 0 | 0 | 0 |
| k5 · 1961-08-15 | 11 | 0 | 0 | 0 | 0 |
| k6 · 1965-11-02 | 13 | 1 | 0 | 0 | 0 |
| k7 · 1969-10-28 | 13 | 0 | 0 | 0 | 0 |
| k8 · 1973-12-31 | 10 | 0 | 0 | 0 | 0 |
| k9 · 1977-05-17 | 13 | 4 | 0 | 0 | 0 |
| k10 · 1981-06-30 | 10 | 1 | 0 | 0 | 0 |
| k11 · 1984-07-23 | 15 | 2 | 0 | 0 | 0 |
| k12 · 1988-11-01 | 15 | 1 | 0 | 0 | 0 |
| k13 · 1992-06-23 | 10 | 1 | 0 | 0 | 0 |
| k14 · 1996-05-29 | 11 | 2 | 0 | 0 | 0 |
| k15 · 1999-05-17 | 15 | 2 | 0 | 0 | 0 |
| k16 · 2003-01-28 | 13 | 2 | 0 | 0 | 0 |
| k17 · 2006-03-28 | 12 | 1 | 0 | 0 | 0 |
| k18 · 2009-02-10 | 12 | 2 | 0 | 0 | 0 |
| k19 · 2013-01-22 | 12 | 3 | 0 | 1 | 0 |
| k20 · 2015-03-17 | 10 | 1 | 0 | 0 | 0 |
| k21 · 2019-04-09 | 11 | 1 | 0 | 0 | 0 |
| k22 · 2019-09-17 | 9 | 2 | 0 | 0 | 1 |
| k23 · 2020-03-02 | 8 | 1 | 0 | 0 | 1 |
| k24 · 2021-03-23 | 13 | 3 | 1 | 0 | 1 |
| k25 · 2022-11-01 | 10 | 2 | 0 | 4 | 1 |
| k26 · 2026-10-27 | 11 | 8 | 0 | 1 | 10 |

## Earlier pass: licence and retrieval outcome (historical)

44 hosted entries (43 free-licence, one fair-use identification); no outstanding dated downloads; 13 source-only unresolved entries. The 22 downloads described in the earlier report were **already present at the start of this pass**, completed by the parent on 4 November. This pass verified their hashes/bytes, removed stale download-failure text, and did not download them again. It adds one asset: Together’s archived campaign lockup.

The earlier Wikimedia HTTP 429 / Retry-After: 600 incidents remain retrieval history, not current missing assets. No new Wikimedia requests were needed. Final assets remain below 60,000 bytes; raster assets are PNG at most 256 pixels. Original and final hashes are retained; final byte counts are now explicit.

New primary evidence: [Together’s official homepage](https://be-yahad.org.il/), [inspected capture, 1 October 2026](https://web.archive.org/web/20261001011247/https://be-yahad.org.il/), and [the exact header SVG referenced by that capture](https://be-yahad.org.il/wp-content/uploads/2026/09/LOGO_RAK-02.svg). Visually inspected: blue main lockup, orange underline, Bennett subline. It differs from the current header’s July-path SVG and the rejected April/July candidates. The archive establishes the image reference; the asset was retrieved from the official origin, so confidence remains medium.

[Yashar’s official site](https://yasharwitheisenkot.com/) supplies a January-path WebP logo, but its October capture timed out, then returned HTTP 429. Archive retrieval stopped; an index timestamp alone was not accepted as proof of image contents. No new asset is assigned. Likud, Otzma Yehudit and New Hope official homepages were accessible; their current headers alone do not prove campaign-period use. New Hope’s current logo has a 2024 path, which is not evidence for its 2022 constituent emblem. These candidates remain unhosted.

New entries use `rights: "free-licence" | "fair-use-identification"`; `licence` remains the licence or copyright/identification notice, never an invented grant. All entries require `sourceUrl`, `evidenceId`, attribution and `inUseEvidence`. Hosted files require `bytes`, `sha256`, `originalSha256` and `assetSourceUrl`; new fair-use entries also require `inUseDate` and an official-origin source card. `archiveUrl`/`archiveTimestamp` record an inspected capture when available. Source-only proposals are not display eligible. `letters` identifies a whole list; `party` identifies a constituent id; these are mutually exclusive. A party objection means removal. Free-licence entries keep their licence data.

## Uncertainty and rejected candidates

- The Democrats 2026 official SVG contains white lettering and requires a dark background (displayBackground: dark). It has not been recoloured.
- All accepted assignments have medium confidence. Commons community descriptions, period statements and campaign dates are evidence, but cited NLI originals and campaign videos were generally not independently inspected. A strict independently verified-primary-only policy would reject these until those underlying items are checked.
- A file’s recreation/upload date is distinguished from its stated historical period. The Yesh Atid SVG’s 2012–2014 creation interval does not prove use on election day in 2013; it is omitted. A January 2021 news report confirms a different campaign design, retained source-only.
- Together’s April/July 2026 variants were superseded before polling day according to the election-day design review. Neither is assigned to k26. The newly hosted September-path lockup is referenced by the inspected 1 October official-site capture.
- Likud’s continuing flag-like letter is not evidence that every campaign lockup, subheading or glyph spacing was identical. Its 2009 design is kept separate from later campaigns. The combined Likud–Yisrael Beiteinu candidate has both date and licence ambiguity and remains unresolved.
- Balad’s vector cites both 2006 and 2019 sources, without proving identical rendering; it is assigned only to the dated 2019 constituent, not 2006.
- NatUnionMafdal.png has a mistyped “200d” year. The web fetch failed, but a direct public retrieval of its cited Ynet report succeeded: campaign-launch headline and publication metadata date it to 21 February 2006. The assignment is medium confidence. National Religious Party, Hadash, UTJ and Shas candidates lacking an exact election-use match are likewise not propagated through earlier elections.
- One Nation’s SVG filename says 2002–2005, while its description says 1999–2002 and its cited archive is 2001. It is omitted rather than resolving the conflict by guesswork. The 2003 Am Ehad raster has explicit election evidence.
- The Kadima 2005 GIF is not assigned automatically to 2006, nor the 2021 Blue and White variant to 2019. General website logos, ballot-paper photographs and regional variants are not sufficient for national election branding.
- A CC BY-SA claim paired with a conflicting upstream credit is not treated as a free licence. Fair-use policy now permits official-origin identification assets, but secondary news/design illustrations are still only discovery leads; none were downloaded.
- The earlier pass treated nonwinning lists as outside the primary coverage target; the continuation includes them as gaps. Three useful explicitly dated extras are included: Shinui 2006, New Right April 2019 and Amcha Yisrael 2026.
- Source counts below are inspected records, not independent corroborating sources. Commons mirrors, traced derivatives and the underlying artefact belong to the same evidence lineage. Search-result snippets were only discovery leads.

## Conclusion map

| Conclusion | Status and evidence | What would change it |
|---|---|---|
| Local files have a recorded rights basis, are small and linked to valid election identities | Mechanically verified by scripts/validate-party-logos.py; rights basis and source claims in sources.json | A conflicting rights notice or changed file hash |
| Historical assignments have a recorded date/period basis | Medium; each inUseEvidence maps to evidenceId and inspected source revision | A dated original showing a different design |
| Modern coverage is incomplete | Explicit gaps in the table and per-election lists | Newly verified dated variants or successful outstanding downloads |
| Joint-list and constituent identities remain distinct | Separate letters/party keys checked against repository metadata | A source establishing a whole-list logo |
| Some superficially plausible variants are wrong for election day | Together and Yesh Atid counterevidence in the secondary source cards | Contrary dated party documentation |

## Per-election lists

### k1 · 1949-01-25

Hosted winners: נ — WIZO.

Not locally covered winners: א — Mapai; מ — Mapam; ב — United Religious Front; ח — Herut; צ — General Zionists; פ — Progressive Party; ס — Sephardim and Oriental Communities; ק — Maki; יד — Democratic List of Nazareth; טו — Fighters List; ל — Yemenite Association.

Evidence references: [commons-115234816](https://commons.wikimedia.org/wiki/File:WIZO1949.png).

Scope note: early-election emblem discovery was limited to the inspected Commons candidates. Ballot-only use or nonexistence is not established for any missing list.

### k2 · 1951-07-30

Hosted winners: None.

Not locally covered winners: א — Mapai; צ — General Zionists; מ — Mapam; ה — Hapoel HaMizrahi; ח — Herut; ק — Maki; פ — Progressive Party; יד — Democratic List for Israeli Arabs; ג — Agudat Yisrael; סצ — Sephardim and Oriental Communities; ב — Mizrahi; ד — Poalei Agudat Yisrael; נ — Progress and Work; ל — Yemenite Association; ע — Agriculture and Development.

Scope note: early-election emblem discovery was limited to the inspected Commons candidates. Ballot-only use or nonexistence is not established for any missing list.

### k3 · 1955-07-26

Hosted winners: None.

Not locally covered winners: א — Mapai; ח — Herut; צ — General Zionists; ב — National Religious Party; תו — Ahdut HaAvoda; מ — Mapam; גד — Religious Torah Front; יד — Democratic List for Israeli Arabs; ק — Maki; נ — Progress and Work; פ — Progressive Party; ע — Agriculture and Development.

Scope note: early-election emblem discovery was limited to the inspected Commons candidates. Ballot-only use or nonexistence is not established for any missing list.

### k4 · 1959-11-03

Hosted winners: None.

Not locally covered winners: א — Mapai; ח — Herut; ב — National Religious Party; מ — Mapam; צ — General Zionists; תו — Ahdut HaAvoda; גד — Religious Torah Front; רא — Progress and Development; פ — Progressive Party; יא — Cooperation and Brotherhood; ק — Maki; ע — Agriculture and Development.

Scope note: early-election emblem discovery was limited to the inspected Commons candidates. Ballot-only use or nonexistence is not established for any missing list.

### k5 · 1961-08-15

Hosted winners: None.

Not locally covered winners: א — Mapai; ח — Herut; ל — Liberal Party; ב — National Religious Party; מ — Mapam; תו — Ahdut HaAvoda; ק — Maki; ג — Agudat Yisrael; יא — Cooperation and Brotherhood; ד — Poalei Agudat Yisrael; רא — Progress and Development.

Scope note: early-election emblem discovery was limited to the inspected Commons candidates. Ballot-only use or nonexistence is not established for any missing list.

### k6 · 1965-11-02

Hosted winners: כא — Rafi.

Not locally covered winners: את — Alignment; חל — Gahal; ב — National Religious Party; מ — Mapam; לע — Independent Liberals; ג — Agudat Yisrael; ו — Rakah; רא — Progress and Development; ד — Poalei Agudat Yisrael; יא — Cooperation and Brotherhood; ש — HaOlam HaZeh; ק — Maki.

Evidence references: [commons-72754288](https://commons.wikimedia.org/wiki/File:Rafi.svg).

Scope note: early-election emblem discovery was limited to the inspected Commons candidates. Ballot-only use or nonexistence is not established for any missing list.

### k7 · 1969-10-28

Hosted winners: None.

Not locally covered winners: אמת — Alignment; חל — Gahal; ב — National Religious Party; ג — Agudat Yisrael; לע — Independent Liberals; עמ — National List; ו — Rakah; רא — Progress and Development; ד — Poalei Agudat Yisrael; יא — Cooperation and Brotherhood; ש — HaOlam HaZeh; ק — Maki; ט — Free Centre.

Scope note: early-election emblem discovery was limited to the inspected Commons candidates. Ballot-only use or nonexistence is not established for any missing list.

### k8 · 1973-12-31

Hosted winners: None.

Not locally covered winners: חל טעם — Likud; אמת — Alignment; גד — Religious Torah Front; רצ — Ratz; ב — National Religious Party; ו — Rakah; לע — Independent Liberals; עא — Arab List for Bedouin and Villagers; רא — Progress and Development; קנ — Moked.

Scope note: early-election emblem discovery was limited to the inspected Commons candidates. Ballot-only use or nonexistence is not established for any missing list.

### k9 · 1977-05-17

Hosted winners: אמת — Alignment; יש — Democratic Movement for Change; כנ — Shlomtzion; פש — Flatto-Sharon.

Not locally covered winners: מחל — Likud; ג — Agudat Yisrael; רצ — Ratz; ב — National Religious Party; ו — Hadash; לע — Independent Liberals; ים — United Arab List; ש — Sheli; ד — Poalei Agudat Yisrael.

Evidence references: [commons-116591510](https://commons.wikimedia.org/wiki/File:Dash1977.png), [commons-119083039](https://commons.wikimedia.org/wiki/File:Alignment_(Israel)_logo,_1977_variant.svg), [commons-90546006](https://commons.wikimedia.org/wiki/File:Shlomtzion.png), [commons-98924546](https://commons.wikimedia.org/wiki/File:Flatto_Sharon_Logo.png).

### k10 · 1981-06-30

Hosted winners: כן — Telem.

Not locally covered winners: מחל — Likud; אמת — Alignment; ג — Agudat Yisrael; רצ — Ratz; ב — National Religious Party; ו — Hadash; הן — Shinui; ת — Tehiya; ני — Tami.

Evidence references: [commons-80273434](https://commons.wikimedia.org/wiki/File:Telem_(1981)_Logo.png).

### k11 · 1984-07-23

Hosted winners: ת — Tehiya–Tzomet; ט — Yahad.

Not locally covered winners: מחל — Likud; אמת — Alignment; ג — Agudat Yisrael; רצ — Ratz; ב — National Religious Party; ו — Hadash; הן — Shinui; שס — Shas; עי — Morasha; פ — Progressive List for Peace; יש — Ometz; ני — Tami; כך — Kach.

Evidence references: [commons-82398313](https://commons.wikimedia.org/wiki/File:Yahad-84.png), [commons-83311131](https://commons.wikimedia.org/wiki/File:TehiyaTzomet.png).

### k12 · 1988-11-01

Hosted winners: מפם — Mapam.

Not locally covered winners: מחל — Likud; אמת — Alignment; ג — Agudat Yisrael; רצ — Ratz; ב — National Religious Party; ו — Hadash; הן — Shinui; שס — Shas; ת — Tehiya; פ — Progressive List for Peace; ט — Moledet; עץ — Degel HaTorah; ע — Arab Democratic Party; ץ — Tzomet.

Evidence references: [commons-103475376](https://commons.wikimedia.org/wiki/File:Mapam_Logo_1988.svg).

### k13 · 1992-06-23

Hosted winners: מרצ — Meretz.

Not locally covered winners: אמת — Labor; מחל — Likud; ץ — Tzomet; שס — Shas; ב — NRP; ג — UTJ; ו — Hadash; ט — Moledet; ע — Arab Democratic Party.

Evidence references: [commons-90743713](https://commons.wikimedia.org/wiki/File:Meretz_(1992).png).

### k14 · 1996-05-29

Hosted winners: מחל — Likud–Gesher–Tzomet; הד — Third Way.

Not locally covered winners: אמת — Labor; שס — Shas; ב — NRP; מרצ — Meretz; כן — Yisrael BaAliyah; ו — Hadash–Balad; ג — UTJ; ע — United Arab List; ט — Moledet.

Evidence references: [commons-100332153](https://commons.wikimedia.org/wiki/File:LikudGesherTzomet.png), [commons-86137067](https://commons.wikimedia.org/wiki/File:Third_Way.png).

### k15 · 1999-05-17

Hosted winners: פה — Centre Party; ט — National Union.

Not locally covered winners: אמת — Labor–Meimad; מחל — Likud; שס — Shas; מרצ — Meretz; כן — Yisrael BaAliyah; יש — Shinui; ב — NRP; ג — UTJ; עם — United Arab List; ו — Hadash; ל — Yisrael Beiteinu; ד — Balad; ם — Am Ehad.

Evidence references: [commons-146621895](https://commons.wikimedia.org/wiki/File:HaIhud_HaLeumi_99_logo.jpg), [commons-82622689](https://commons.wikimedia.org/wiki/File:Merkazi-Logo.png).

### k16 · 2003-01-28

Hosted winners: אמת — Labor–Meimad; ם — Am Ehad.

Not locally covered winners: מחל — Likud; יש — Shinui; שס — Shas; ל — National Union; מרצ — Meretz; ב — National Religious Party; ג — United Torah Judaism; ו — Hadash–Ta’al; ד — Balad; כן — Yisrael BaAliyah; עם — United Arab List.

Evidence references: [commons-115472839](https://commons.wikimedia.org/wiki/File:AmEchad.png), [commons-99877993](https://commons.wikimedia.org/wiki/File:Labor-Meimad.png).

### k17 · 2006-03-28

Hosted winners: טב — National Union–NRP.

Not locally covered winners: כן — Kadima; אמת — Labor–Meimad; שס — Shas; מחל — Likud; ל — Yisrael Beiteinu; זך — Gil (Pensioners); ג — United Torah Judaism; מרצ — Meretz; עם — Ra’am–Ta’al; ו — Hadash; ד — Balad.

Evidence references: [commons-101247293](https://commons.wikimedia.org/wiki/File:Shinui_2006.png), [commons-83570887](https://commons.wikimedia.org/wiki/File:NatUnionMafdal.png).

### k18 · 2009-02-10

Hosted winners: מחל — Likud; מרצ — Meretz.

Not locally covered winners: כן — Kadima; ל — Yisrael Beiteinu; אמת — Labor; שס — Shas; ג — United Torah Judaism; עם — Ra'am–Ta'al; ט — National Union; ו — Hadash; ב — Jewish Home; ד — Balad.

Evidence references: [commons-52999529](https://commons.wikimedia.org/wiki/File:Newmovemeretz.gif), [commons-5635696](https://commons.wikimedia.org/wiki/File:Likud_Logo.svg).

### k19 · 2013-01-22

Hosted winners: צפ — Hatnuah; מרצ — Meretz; כן — Kadima.

Not locally covered winners: מחל — Likud–Yisrael Beiteinu; פה — Yesh Atid; אמת — Labor; טב — Jewish Home; שס — Shas; ג — United Torah Judaism; עם — Ra'am–Ta'al–Mada; ו — Hadash; ד — Balad.

Evidence references: [commons-138448720](https://commons.wikimedia.org/wiki/File:Logo_Likud_Yisrael_Beitenu.png), [commons-36039828](https://commons.wikimedia.org/wiki/File:Logo_Kadima.svg), [commons-39065631](https://commons.wikimedia.org/wiki/File:Hatnuah_logo.svg), [commons-98922399](https://commons.wikimedia.org/wiki/File:Meretz_Logo.svg).

### k20 · 2015-03-17

Hosted winners: כ — Kulanu.

Not locally covered winners: מחל — Likud; אמת — Zionist Union; ודעם — Joint List; פה — Yesh Atid; טב — Jewish Home; שס — Shas; ל — Yisrael Beiteinu; ג — United Torah Judaism; מרצ — Meretz.

Evidence references: [commons-39073240](https://commons.wikimedia.org/wiki/File:Kulanu_Kahlon_logo.svg).

### k21 · 2019-04-09

Hosted winners: אמת — Labor.

Not locally covered winners: מחל — Likud; פה — Blue and White; שס — Shas; ג — United Torah Judaism; ום — Hadash–Ta’al; ל — Yisrael Beiteinu; טב — Union of Right-Wing Parties; מרצ — Meretz; כ — Kulanu; דעם — Ra’am–Balad.

Evidence references: [commons-76218696](https://commons.wikimedia.org/wiki/File:Israeli_Labor_Party_2019.png), [commons-77001018](https://commons.wikimedia.org/wiki/File:Logo_of_HaYamin_HeHadash.svg).

### k22 · 2019-09-17

Hosted winners: ודעם — Joint List; טב — Yamina.

Not locally covered winners: פה — Blue and White; מחל — Likud; שס — Shas; ל — Yisrael Beiteinu; ג — United Torah Judaism; אמת — Labor–Gesher; מרצ — Democratic Union.

Evidence references: [commons-107297670](https://commons.wikimedia.org/wiki/File:Balad.svg), [commons-130829705](https://commons.wikimedia.org/wiki/File:Yamina_logo.svg), [commons-94577687](https://commons.wikimedia.org/wiki/File:Joint_List_logo_2019.svg).

### k23 · 2020-03-02

Hosted winners: אמת — Labor–Gesher–Meretz.

Not locally covered winners: מחל — Likud; פה — Blue and White; ודעם — Joint List; שס — Shas; ג — United Torah Judaism; ל — Yisrael Beiteinu; טב — Yamina.

Evidence references: [commons-130826979](https://commons.wikimedia.org/wiki/File:Logo_of_the_Labor-Gesher-Meretz.svg), [commons-146621440](https://commons.wikimedia.org/wiki/File:Agudat_Yisrael_logo_2020.svg).

### k24 · 2021-03-23

Hosted winners: כן — Blue and White; ת — New Hope; עם — Ra'am.

Not locally covered winners: מחל — Likud; פה — Yesh Atid; שס — Shas; ב — Yamina; אמת — Labor; ג — United Torah Judaism; ל — Yisrael Beiteinu; ט — Religious Zionism; ודעם — Joint List; מרצ — Meretz.

Evidence references: [commons-100640724](https://commons.wikimedia.org/wiki/File:New_Hope_party_logo.png), [commons-119107430](https://commons.wikimedia.org/wiki/File:Raam_logo_2021.svg), [commons-130826913](https://commons.wikimedia.org/wiki/File:Blue_and_White_logo_2021.svg), [commons-130829740](https://commons.wikimedia.org/wiki/File:Otzma_Yehudit_2021_logo.svg), [srugim-2021-yesh-atid](https://www.srugim.co.il/525439-%D7%94%D7%9C%D7%95%D7%92%D7%95-%D7%94%D7%97%D7%93%D7%A9-%D7%A9%D7%9C-%D7%99%D7%A9-%D7%A2%D7%AA%D7%99%D7%93-%D7%99%D7%90%D7%99%D7%A8-%D7%9C%D7%A4%D7%99%D7%93-%D7%95%D7%96%D7%A8%D7%99%D7%97%D7%94).

### k25 · 2022-11-01

Hosted winners: כן — National Unity; פה — Yesh Atid.

Not locally covered winners: מחל — Likud; ט — Religious Zionism; שס — Shas; ג — United Torah Judaism; אמת — Labor; ל — Yisrael Beiteinu; עם — Ra'am; ום — Hadash–Ta'al.

Evidence references: [commons-130829829](https://commons.wikimedia.org/wiki/File:National_Unity_Party_(Israel)_August_2022.svg), [commons-132175789](https://commons.wikimedia.org/wiki/File:Parti_sioniste_religieux_logo_2022.png), [ynet-2022-typography](https://www.ynet.co.il/news/article/syrrbq9jj).

### k26 · 2026-10-27

Hosted winners: אמת — The Democrats; רק — Together (Bennett); ודם — Joint List; מחל — Likud; ב — Otzma Yehudit; דרך — Yashar!; ל — Yisrael Beiteinu; שס — Shas.

Not locally covered winners: ג — United Torah Judaism; ט — Religious Zionism–Zehut; עם — Ra’am. Reasons and constituent gaps are detailed in the continuation below.


## Sources — retained archive

105 inspected source records are retained in [sources.json](../../data/meta/logos/sources.json). Stable Commons IDs use the file-page ID, with the exact reviewed revision URL in the JSON. The API exposed file records, not page-reading depth metrics; exhaustive archive search and total search-engine coverage were not measured. No English-language Wikipedia page was opened, cited or used.

### Sources supporting accepted or source-only entries

#### commons-146621440 · [File:Agudat Yisrael logo 2020.svg](https://commons.wikimedia.org/wiki/File:Agudat_Yisrael_logo_2020.svg)

- Contribution: לוגו מפלגת אגודת ישראל
- Date: 10:40, 31 בינואר 2020 (IST)
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-119083039 · [File:Alignment (Israel) logo, 1977 variant.svg](https://commons.wikimedia.org/wiki/File:Alignment_(Israel)_logo,_1977_variant.svg)

- Contribution: This is the SVG version of the logo of Alignment, a defunct political alliance in Israel.
- Date: 2022-06-08
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-115472839 · [File:AmEchad.png](https://commons.wikimedia.org/wiki/File:AmEchad.png)

- Contribution: Logo of the social democratic, 'One Nation' Party of Amir Peretz, in 2003
- Date: 2022-02-22
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-198464782 · [File:Amcha Yisrael.svg](https://commons.wikimedia.org/wiki/File:Amcha_Yisrael.svg)

- Contribution: Logo of the Amcha Yisrael party
- Date: 2026-08
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-107297670 · [File:Balad.svg](https://commons.wikimedia.org/wiki/File:Balad.svg)

- Contribution: Logo of Balad (political party)
- Date: 2019-08-04
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-130826913 · [File:Blue and White logo 2021.svg](https://commons.wikimedia.org/wiki/File:Blue_and_White_logo_2021.svg)

- Contribution: The Blue and White logo in 2021 Israeli legislative election
- Date: 2021-03-01
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-116591510 · [File:Dash1977.png](https://commons.wikimedia.org/wiki/File:Dash1977.png)

- Contribution: Logo of the Democratic Movement for Change, otherwise known as Dash, an Israeli centrist list that ran in the 1977 Israeli election
- Date: 2022-04-01
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-98924546 · [File:Flatto Sharon Logo.png](https://commons.wikimedia.org/wiki/File:Flatto_Sharon_Logo.png)

- Contribution: Logo utilizing the electoral symbols of Shmuel Flatto-Sharon in the elections on 1977 and 1981
- Date: 2021-01-16
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-146621895 · [File:HaIhud HaLeumi 99 logo.jpg](https://commons.wikimedia.org/wiki/File:HaIhud_HaLeumi_99_logo.jpg)

- Contribution: סמליל מפלגת "האיחוד הלאומי" (בחירות 99)
- Date: Unknown date
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-39065631 · [File:Hatnuah logo.svg](https://commons.wikimedia.org/wiki/File:Hatnuah_logo.svg)

- Contribution: Logo of Israeli political party Hatnuah.
- Date: 27 November 2012 (original upload date)
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-76218696 · [File:Israeli Labor Party 2019.png](https://commons.wikimedia.org/wiki/File:Israeli_Labor_Party_2019.png)

- Contribution: Symbol of Israeli Labor Party since 2019
- Date: 2019-01-30
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-94577687 · [File:Joint List logo 2019.svg](https://commons.wikimedia.org/wiki/File:Joint_List_logo_2019.svg)

- Contribution: The logo of Joint List – joint list of Hadash, Ta'al and Balad for Knesset elections
- Date: 2019-08
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-39073240 · [File:Kulanu Kahlon logo.svg](https://commons.wikimedia.org/wiki/File:Kulanu_Kahlon_logo.svg)

- Contribution: Logo of Israeli Kulanu party
- Date: 8 January 2015 (original upload date)
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-99877993 · [File:Labor-Meimad.png](https://commons.wikimedia.org/wiki/File:Labor-Meimad.png)

- Contribution: Logo used in an ad for the Labor_meimad List in the Israeli election of 2003
- Date: 2021-02-14
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-5635696 · [File:Likud Logo.svg](https://commons.wikimedia.org/wiki/File:Likud_Logo.svg)

- Contribution: Logo of the Likud Party
- Date: 2009-01-03
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-100332153 · [File:LikudGesherTzomet.png](https://commons.wikimedia.org/wiki/File:LikudGesherTzomet.png)

- Contribution: Logo of the Likud-Gesher-Tzomet as seen on a campaign material from the 1996 Israeli Election
- Date: 2021-02-25
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-36039828 · [File:Logo Kadima.svg](https://commons.wikimedia.org/wiki/File:Logo_Kadima.svg)

- Contribution: Logo of Kadima
- Date: 12 באוקטובר 2009
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-138448720 · [File:Logo Likud Yisrael Beitenu.png](https://commons.wikimedia.org/wiki/File:Logo_Likud_Yisrael_Beitenu.png)

- Contribution: Logo Likud Yisrael Beitenu
- Date: 2023-10-03
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-77001018 · [File:Logo of HaYamin HeHadash.svg](https://commons.wikimedia.org/wiki/File:Logo_of_HaYamin_HeHadash.svg)

- Contribution: Logo of the New Right party in Israel
- Date: 2019-02-23
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-200835377 · [File:Logo of The Reservists.svg](https://commons.wikimedia.org/wiki/File:Logo_of_The_Reservists.svg)

- Contribution: Logo of The Reservists
- Date: 2026-02
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-201669548 · [File:Logo of the Joint List (Israel) 2026 (vector).svg](https://commons.wikimedia.org/wiki/File:Logo_of_the_Joint_List_(Israel)_2026_(vector).svg)

- Contribution: Logo of The Joint List for the 2026 Israeli Elections (vector drawing).
- Date: 2026-10
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-130826979 · [File:Logo of the Labor-Gesher-Meretz.svg](https://commons.wikimedia.org/wiki/File:Logo_of_the_Labor-Gesher-Meretz.svg)

- Contribution: Logo of the w:Labor-Gesher-Meretz in the w:2020 Israeli legislative election
- Date: Historical use identified by the description; recreation date not supplied.
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-103475376 · [File:Mapam Logo 1988.svg](https://commons.wikimedia.org/wiki/File:Mapam_Logo_1988.svg)

- Contribution: Logo of Mapam as used in the lead up to the 1988 Israeli legislative election
- Date: 1988
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-90743713 · [File:Meretz (1992).png](https://commons.wikimedia.org/wiki/File:Meretz_(1992).png)

- Contribution: Original logo used by Meretz in 1992, upon its formation as an alliance of Ratz, Shinui and Mapam
- Date: 2020-05-28
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-98922399 · [File:Meretz Logo.svg](https://commons.wikimedia.org/wiki/File:Meretz_Logo.svg)

- Contribution: Logo of Meretz.
- Date: 2012-12
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-82622689 · [File:Merkazi-Logo.png](https://commons.wikimedia.org/wiki/File:Merkazi-Logo.png)

- Contribution: Logo of the Centre Party of Israel (1999-2003)
- Date: 2019-09-28
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-83570887 · [File:NatUnionMafdal.png](https://commons.wikimedia.org/wiki/File:NatUnionMafdal.png)

- Contribution: Logo used by the joint list of the National Union and the National Religious Party (Mafdal) in the 200d Israeli Election.
- Date: 2019-11-01
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-130829829 · [File:National Unity Party (Israel) August 2022.svg](https://commons.wikimedia.org/wiki/File:National_Unity_Party_(Israel)_August_2022.svg)

- Contribution: The National Unity Party logo in w:2022 Israeli legislative election
- Date: Historical use identified by the description; recreation date not supplied.
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-100640724 · [File:New Hope party logo.png](https://commons.wikimedia.org/wiki/File:New_Hope_party_logo.png)

- Contribution: New Hope party logo
- Date: 2021-03-01
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-52999529 · [File:Newmovemeretz.gif](https://commons.wikimedia.org/wiki/File:Newmovemeretz.gif)

- Contribution: Logo von Meretz-Jachad
- Date: Historical use identified by the description; recreation date not supplied.
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-130829740 · [File:Otzma Yehudit 2021 logo.svg](https://commons.wikimedia.org/wiki/File:Otzma_Yehudit_2021_logo.svg)

- Contribution: w:Otzma Yehudit logo in w:2021 Israeli legislative election
- Date: Historical use identified by the description; recreation date not supplied.
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-132175789 · [File:Parti sioniste religieux logo 2022.png](https://commons.wikimedia.org/wiki/File:Parti_sioniste_religieux_logo_2022.png)

- Contribution: Logo du Parti sioniste religieux (Israël)
- Date: 2022-07-16
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-119107430 · [File:Raam logo 2021.svg](https://commons.wikimedia.org/wiki/File:Raam_logo_2021.svg)

- Contribution: Raam logo 2021
- Date: 2022-06-09
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-72754288 · [File:Rafi.svg](https://commons.wikimedia.org/wiki/File:Rafi.svg)

- Contribution: Logo of the Israeli Rafi political party (1965-1968)
- Date: 2018-09-15
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-200023341 · [File:Religious Zionist Party logo 2026.png](https://commons.wikimedia.org/wiki/File:Religious_Zionist_Party_logo_2026.png)

- Contribution: Logo of the Religious Zionist Party since 2026
- Date: 2026-09-22
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-101247293 · [File:Shinui 2006.png](https://commons.wikimedia.org/wiki/File:Shinui_2006.png)

- Contribution: Logo adopted by Shinui during the 2006 Israel election
- Date: 2021-03-08
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-90546006 · [File:Shlomtzion.png](https://commons.wikimedia.org/wiki/File:Shlomtzion.png)

- Contribution: Logo used on party paraphernalia of Shlomtzion, the party founded by Ariel Sharon in 1977 to contest in that year's Israeli Election.
- Date: 2020-05-22
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-83311131 · [File:TehiyaTzomet.png](https://commons.wikimedia.org/wiki/File:TehiyaTzomet.png)

- Contribution: Logo featured on posters and flyers of the Tehiya-Tzomet List during the 1984 Israeli Legislative Election.
- Date: 2019-10-23
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-80273434 · [File:Telem (1981) Logo.png](https://commons.wikimedia.org/wiki/File:Telem_(1981)_Logo.png)

- Contribution: Logo of the Telem Party of Moshe Dayan (1981)
- Date: 2019-07-08
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-200834372 · [File:The Democrats (Israel) logo 2026.svg](https://commons.wikimedia.org/wiki/File:The_Democrats_(Israel)_logo_2026.svg)

- Contribution: 2026 logo of The Democrats - led by Yair Golan
- Date: 2026-08
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-86137067 · [File:Third Way.png](https://commons.wikimedia.org/wiki/File:Third_Way.png)

- Contribution: Logo of the Third Way Party of Avigdor Kahalani, used in flyers and ads for the party during the 1996 Israeli Legislative Election.
- Date: 2020-01-20
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-115234816 · [File:WIZO1949.png](https://commons.wikimedia.org/wiki/File:WIZO1949.png)

- Contribution: Logo/symbol of the WIZO political party, 1949
- Date: 2022-02-13
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-82398313 · [File:Yahad-84.png](https://commons.wikimedia.org/wiki/File:Yahad-84.png)

- Contribution: Logo of Ezer Weizman's Yahad Party for the 1984 Elections
- Date: 2019-09-21
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### commons-130829705 · [File:Yamina logo.svg](https://commons.wikimedia.org/wiki/File:Yamina_logo.svg)

- Contribution: The logo of the Israeli Yemina party
- Date: Historical use identified by the description; recreation date not supplied.
- Limit: community metadata; not independent of the credited source; underlying artefact not independently inspected.

#### srugim-2021-yesh-atid · [Yesh Atid unveils its new 2021 logo](https://www.srugim.co.il/525439-%D7%94%D7%9C%D7%95%D7%92%D7%95-%D7%94%D7%97%D7%93%D7%A9-%D7%A9%D7%9C-%D7%99%D7%A9-%D7%A2%D7%AA%D7%99%D7%93-%D7%99%D7%90%D7%99%D7%A8-%D7%9C%D7%A4%D7%99%D7%93-%D7%95%D7%96%D7%A8%D7%99%D7%97%D7%94)

- Contribution: Reports the new election campaign logo with a sunrise motif; contradicts reuse of the earlier Yesh Atid emblem in 2021.
- Date: 2021-01-10
- Limit: secondary; design commentary or journalism; underlying artefact not independently inspected.

#### ynet-2022-typography · [Which font passes the electoral threshold?](https://www.ynet.co.il/news/article/syrrbq9jj)

- Contribution: Secondary typography review showing and describing 2022 party designs, with historical comparisons; not a free image licence.
- Date: 2022 campaign; exact publication date not exposed in fetched text
- Limit: secondary; design commentary or journalism; underlying artefact not independently inspected.

#### xnet-2019-branding · [Why do all parties look the same this year?](https://xnet.ynet.co.il/articles/0,7340,L-5474505,00.html)

- Contribution: Secondary election branding review showing changes in Labor and other party designs. Does not license article illustrations for redistribution.
- Date: 2019-03-07
- Limit: secondary; design commentary or journalism; underlying artefact not independently inspected.

#### alef-2026-design · [Graphic design in Israel’s 2026 election](https://alefalefalef.co.il/elections-design-26/)

- Contribution: Election-day design commentary distinguishes final Together branding from earlier variants and explains separate Religious Zionism and Zehut campaigns. Author discloses Bennett campaign involvement; historical narrative contains loose chronology, so no unrelated historical dates are adopted.
- Date: 2026-10-27
- Limit: secondary; design commentary or journalism; underlying artefact not independently inspected.

### Other inspected candidates — not assigned

These descriptions/credits/licences were inspected. They contributed discovery leads, corroboration or exclusions but no additional accepted mapping. Their metadata remains in sources.json; absence from overlays is deliberate.

- [File:Alignment (1977).png](https://commons.wikimedia.org/wiki/File:Alignment_(1977).png) — commons-98270218; no additional verified election assignment.
- [File:Bennet2026logo.png](https://commons.wikimedia.org/wiki/File:Bennet2026logo.png) — commons-175372875; no additional verified election assignment.
- [File:Beyahad berashut bennett blue.svg](https://commons.wikimedia.org/wiki/File:Beyahad_berashut_bennett_blue.svg) — commons-198472215; no additional verified election assignment.
- [File:Beyahad.png](https://commons.wikimedia.org/wiki/File:Beyahad.png) — commons-190541500; no additional verified election assignment.
- [File:Gahal.svg](https://commons.wikimedia.org/wiki/File:Gahal.svg) — commons-184233029; no additional verified election assignment.
- [File:HaAvoda Logo.svg](https://commons.wikimedia.org/wiki/File:HaAvoda_Logo.svg) — commons-76163052; no additional verified election assignment.
- [File:HaLikud-Tsommet.png](https://commons.wikimedia.org/wiki/File:HaLikud-Tsommet.png) — commons-123809959; no additional verified election assignment.
- [File:HaMa'arakh logo.svg](https://commons.wikimedia.org/wiki/File:HaMa%27arakh_logo.svg) — commons-39096924; no additional verified election assignment.
- [File:Haavoda logo.png](https://commons.wikimedia.org/wiki/File:Haavoda_logo.png) — commons-75486439; no additional verified election assignment.
- [File:Haavodameretz.png](https://commons.wikimedia.org/wiki/File:Haavodameretz.png) — commons-88529759; no additional verified election assignment.
- [File:Hadash.svg](https://commons.wikimedia.org/wiki/File:Hadash.svg) — commons-52498500; no additional verified election assignment.
- [File:Havoda (1977-1992).png](https://commons.wikimedia.org/wiki/File:Havoda_(1977-1992).png) — commons-90489719; no additional verified election assignment.
- [File:Israel First.png](https://commons.wikimedia.org/wiki/File:Israel_First.png) — commons-198134765; no additional verified election assignment.
- [File:Israel-beytenu-logo.svg](https://commons.wikimedia.org/wiki/File:Israel-beytenu-logo.svg) — commons-82323311; no additional verified election assignment.
- [File:Joint List logo.png](https://commons.wikimedia.org/wiki/File:Joint_List_logo.png) — commons-39065398; no additional verified election assignment.
- [File:Kadima Israel logo (2005).gif](https://commons.wikimedia.org/wiki/File:Kadima_Israel_logo_(2005).gif) — commons-39070174; no additional verified election assignment.
- [File:Kahol Lavan 21.png](https://commons.wikimedia.org/wiki/File:Kahol_Lavan_21.png) — commons-102837645; no additional verified election assignment.
- [File:Likud YisraelBeitenu.png](https://commons.wikimedia.org/wiki/File:Likud_YisraelBeitenu.png) — commons-117932413; no additional verified election assignment.
- [File:Likud-Tzomet.png](https://commons.wikimedia.org/wiki/File:Likud-Tzomet.png) — commons-115883695; no additional verified election assignment.
- [File:Logo Hadash Ta'al.png](https://commons.wikimedia.org/wiki/File:Logo_Hadash_Ta%27al.png) — commons-138448907; no additional verified election assignment.
- [File:Logo Kajol Lavan.png](https://commons.wikimedia.org/wiki/File:Logo_Kajol_Lavan.png) — commons-117932826; no additional verified election assignment.
- [File:Logo Shinui Israel.png](https://commons.wikimedia.org/wiki/File:Logo_Shinui_Israel.png) — commons-98831266; no additional verified election assignment.
- [File:Logo of the Kadima Party.png](https://commons.wikimedia.org/wiki/File:Logo_of_the_Kadima_Party.png) — commons-18308553; no additional verified election assignment.
- [File:Logo of the Labor-Gesher-Meretz.png](https://commons.wikimedia.org/wiki/File:Logo_of_the_Labor-Gesher-Meretz.png) — commons-106789815; no additional verified election assignment.
- [File:Maarach 1965.svg](https://commons.wikimedia.org/wiki/File:Maarach_1965.svg) — commons-181955312; no additional verified election assignment.
- [File:Maarach 1969.svg](https://commons.wikimedia.org/wiki/File:Maarach_1969.svg) — commons-181955876; no additional verified election assignment.
- [File:Maarach1988.svg](https://commons.wikimedia.org/wiki/File:Maarach1988.svg) — commons-182806088; no additional verified election assignment.
- [File:Meretz Logo Israel.png](https://commons.wikimedia.org/wiki/File:Meretz_Logo_Israel.png) — commons-94041285; no additional verified election assignment.
- [File:National Religious Party logo.svg](https://commons.wikimedia.org/wiki/File:National_Religious_Party_logo.svg) — commons-117876116; no additional verified election assignment.
- [File:National Union (1999).png](https://commons.wikimedia.org/wiki/File:National_Union_(1999).png) — commons-90742302; no additional verified election assignment.
- [File:One Israel Logo.gif](https://commons.wikimedia.org/wiki/File:One_Israel_Logo.gif) — commons-195867497; no additional verified election assignment.
- [File:One Nation (Israeli political party) logo (2002-2005 variant).svg](https://commons.wikimedia.org/wiki/File:One_Nation_(Israeli_political_party)_logo_(2002-2005_variant).svg) — commons-170777838; no additional verified election assignment.
- [File:OneNation.png](https://commons.wikimedia.org/wiki/File:OneNation.png) — commons-89644152; no additional verified election assignment.
- [File:Otzma Yehudit logo 2019.png](https://commons.wikimedia.org/wiki/File:Otzma_Yehudit_logo_2019.png) — commons-95277622; no additional verified election assignment.
- [File:Shas logo.png](https://commons.wikimedia.org/wiki/File:Shas_logo.png) — commons-93415032; no additional verified election assignment.
- [File:Shinui - 1977.png](https://commons.wikimedia.org/wiki/File:Shinui_-_1977.png) — commons-90216944; no additional verified election assignment.
- [File:TELEM.png](https://commons.wikimedia.org/wiki/File:TELEM.png) — commons-85322948; no additional verified election assignment.
- [File:Ta'al party logo.png](https://commons.wikimedia.org/wiki/File:Ta%27al_party_logo.png) — commons-130826728; no additional verified election assignment.
- [File:The Democrats led by Yair Golan.svg](https://commons.wikimedia.org/wiki/File:The_Democrats_led_by_Yair_Golan.svg) — commons-149878037; no additional verified election assignment.
- [File:The-Jewish-Home-logo.svg](https://commons.wikimedia.org/wiki/File:The-Jewish-Home-logo.svg) — commons-130829762; no additional verified election assignment.
- [File:United Religious Front.svg](https://commons.wikimedia.org/wiki/File:United_Religious_Front.svg) — commons-112442614; no additional verified election assignment.
- [File:Yahadut HaTorah logo.png](https://commons.wikimedia.org/wiki/File:Yahadut_HaTorah_logo.png) — commons-98839088; no additional verified election assignment.
- [File:Yashar2025.png](https://commons.wikimedia.org/wiki/File:Yashar2025.png) — commons-175141989; no additional verified election assignment.
- [File:YeshAtidLogo.svg](https://commons.wikimedia.org/wiki/File:YeshAtidLogo.svg) — commons-35947960; no additional verified election assignment.

## Earlier pass: coverage and remaining gaps (historical)

The following table is retained as earlier-pass history; the continuation below supersedes it. It compares this worktree’s starting committed assets, not the stale 21-entry report. All missing winners are enumerated in the per-election sections above. Unless a specific exclusion above applies, the reason is **no inspected official-origin campaign-dated emblem established in this bounded pass**; it does not establish that an emblem never existed. Earlier medium-confidence Commons assignments are retained, not promoted to independently verified primary evidence. Nonwinning lists beyond the three existing dated extras were not researched in this pass.

| Election | Hosted winners before | Hosted winners after |
|---|---:|---:|
| k26 | 2/11 | 3/11 |
| k25 | 1/10 | 1/10 |
| k24 | 3/13 | 3/13 |
| k23 | 1/8 | 1/8 |
| k22 | 2/9 | 2/9 |
| k21 | 1/11 | 1/11 |
| k20 | 1/10 | 1/10 |
| k19 | 3/12 | 3/12 |
| k18 | 2/12 | 2/12 |
| k17 | 1/12 | 1/12 |
| k16 | 2/13 | 2/13 |
| k15 | 2/15 | 2/15 |
| k14 | 2/11 | 2/11 |
| k13 | 1/10 | 1/10 |
| k12 | 1/15 | 1/15 |
| k11 | 2/15 | 2/15 |
| k10 | 1/10 | 1/10 |
| k9 | 4/13 | 4/13 |
| k8 | 0/10 | 0/10 |
| k7 | 0/13 | 0/13 |
| k6 | 1/13 | 1/13 |
| k5 | 0/11 | 0/11 |
| k4 | 0/12 | 0/12 |
| k3 | 0/12 | 0/12 |
| k2 | 0/15 | 0/15 |
| k1 | 1/12 | 1/12 |

### Constituent gaps in seat-winning joint lists

Each id below lacks a separately hosted emblem for that election. Reason: no inspected primary campaign-period source for that constituent’s own design; joint-list and later party logos cannot substitute. Existing constituent emblems remain covered separately in the main table. Whole-list winners took priority, so no additional constituent was accepted this pass.

- **k26:** מחל (Likud): likud, new-hope; ב (Otzma Yehudit): otzma-yehudit, eretz-yisrael-shelanu; ג (United Torah Judaism): degel-hatorah, agudat-yisrael, homat-torat-yisrael; ט (Religious Zionism–Zehut): zehut, atid-ehad; דרך (Yashar!): yashar, yesodot-yisrael; אמת (The Democrats): democrats, meretz; רק (Together (Bennett)): together-bennett, yesh-atid; ודם (Joint List): hadash, taal, balad.
- **k25:** ט (Religious Zionism): otzma-yehudit, noam, atid-ehad, eretz-yisrael-shelanu; ג (United Torah Judaism): agudat-yisrael, degel-hatorah; כן (National Unity): israel-resilience, new-hope; ום (Hadash–Ta'al): hadash, taal.
- **k24:** מחל (Likud): likud, atid-ehad; ג (United Torah Judaism): degel-hatorah, agudat-yisrael; ט (Religious Zionism): tkuma, noam; ודעם (Joint List): hadash, taal, balad; ת (New Hope): new-hope, derech-eretz.
- **k23:** מחל (Likud): likud, kulanu; פה (Blue and White): israel-resilience, yesh-atid, telem; ודעם (Joint List): hadash, balad, taal, raam; ג (United Torah Judaism): degel-hatorah; אמת (Labor–Gesher–Meretz): labor, gesher, meretz; טב (Yamina): new-right, jewish-home, tkuma, ahi.
- **k22:** פה (Blue and White): israel-resilience, yesh-atid, telem; מחל (Likud): likud, kulanu; ודעם (Joint List): hadash, taal, raam; ג (United Torah Judaism): agudat-yisrael, degel-hatorah; טב (Yamina): new-right, jewish-home, tkuma; אמת (Labor–Gesher): labor, gesher; מרצ (Democratic Union): meretz, green-movement, independence.
- **k21:** מחל (Likud): likud, ahi; פה (Blue and White): israel-resilience, yesh-atid, telem; ג (United Torah Judaism): agudat-yisrael, degel-hatorah; ום (Hadash–Ta’al): hadash, taal; טב (Union of Right-Wing Parties): jewish-home, tkuma, otzma-yehudit; דעם (Ra’am–Balad): raam, balad.
- **k20:** אמת (Zionist Union): labor, hatnua, green-movement; ודעם (Joint List): hadash, raam, balad, taal; טב (Jewish Home): jewish-home, tkuma; ג (United Torah Judaism): agudat-yisrael, degel-hatorah.
- **k19:** מחל (Likud–Yisrael Beiteinu): likud, yisrael-beiteinu; טב (Jewish Home): jewish-home, tkuma; ג (United Torah Judaism): agudat-yisrael, degel-hatorah; עם (Ra'am–Ta'al–Mada): raam, taal, mada.
- **k18:** מחל (Likud): ahi, likud; ג (United Torah Judaism): agudat-yisrael, degel-hatorah; עם (Ra'am–Ta'al): raam, taal; ט (National Union): tkuma, hatikva, eretz-yisrael-shelanu, moledet; מרצ (Meretz): new-movement, meretz.
- **k17:** אמת (Labor–Meimad): labor, meimad; טב (National Union–NRP): moledet, tkuma, ahi, nrp; ג (United Torah Judaism): agudat-yisrael, degel-hatorah; עם (Ra’am–Ta’al): ram, taal, arab-democratic-party.
- **k16:** אמת (Labor–Meimad): labor, meimad; ל (National Union): yisrael-beiteinu, tkuma, moledet; מרצ (Meretz): meretz, democratic-choice, shahar; ג (United Torah Judaism): agudat-yisrael, degel-hatorah; ו (Hadash–Ta’al): hadash, taal; עם (United Arab List): ram, arab-democratic-party.
- **k15:** אמת (Labor–Meimad): labor, gesher, meimad; ג (UTJ): agudat-yisrael, degel-hatorah; עם (United Arab List): ram, arab-democratic-party; ט (National Union): herut-national-movement, moledet, tkuma; ד (Balad): balad, taal.
- **k14:** מחל (Likud–Gesher–Tzomet): likud, gesher, tzomet; מרצ (Meretz): ratz, mapam, shinui; ו (Hadash–Balad): hadash, balad; ג (UTJ): agudat-yisrael, degel-hatorah; ע (United Arab List): arab-democratic-party, ram.
- **k13:** מרצ (Meretz): ratz, mapam, shinui; ג (UTJ): agudat-yisrael, moria, degel-hatorah.
- **k12:** ג (Agudat Yisrael): agudat-yisrael, poalei-agudat-yisrael; ו (Hadash): israeli-communist-party, black-panthers; הן (Shinui): shinui, independent-liberals.
- **k11:** מחל (Likud): herut, liberal-party; אמת (Alignment): labor, mapam, independent-liberals; ו (Hadash): israeli-communist-party, black-panthers; ת (Tehiya–Tzomet): tehiya, tzomet; עי (Morasha): matzad, poalei-agudat-yisrael.
- **k10:** מחל (Likud): herut, liberal-party, laam; אמת (Alignment): labor, mapam; ו (Hadash): israeli-communist-party, black-panthers.
- **k9:** מחל (Likud): herut, liberal-party, laam, ahdut-seidel-1977; אמת (Alignment): israeli-labor-party, mapam; ו (Hadash): rakah, black-panthers; ש (Sheli): independent-socialists, moked, meri, black-panthers.
- **k8:** חל טעם (Likud): herut, liberal-party, state-list, free-centre, greater-israel-movement; אמת (Alignment): israeli-labor-party, mapam; גד (Religious Torah Front): agudat-yisrael, poalei-agudat-yisrael; קנ (Moked): blue-red-movement, maki.
- **k7:** אמת (Alignment): israeli-labor-party, mapam; חל (Gahal): herut, liberal-party.
- **k6:** את (Alignment): mapai, ahdut-haavoda; חל (Gahal): herut, liberal-party.
- **k4:** גד (Religious Torah Front): agudat-yisrael, poalei-agudat-yisrael.
- **k3:** ב (National Religious Party): hapoel-hamizrachi, mizrachi; גד (Religious Torah Front): agudat-yisrael, poalei-agudat-yisrael.
- **k1:** ב (United Religious Front): hapoel-hamizrachi, mizrachi, poalei-agudat-yisrael, agudat-yisrael, non-party-religious-union; נ (WIZO): wizo, womens-equal-rights-association.

### Earlier pass: verification and regeneration (historical)

Verified with Node 24.18.0, tsx 4.23.15, TypeScript 7.0.2 and Vitest 5.1.0: `npx tsx scripts/build-datasets.ts`, then the same build again (zero files written; all 39 public/data file hashes identical), `python3 -I scripts/validate-party-logos.py` (44 assets), `npx tsc -p tsconfig.json --noEmit`, and `npm test` (52 files, 440 tests). The model differential digest was re-recorded for the new rights metadata, Together logo and build timestamps; temporarily removing those intended changes reproduced the previous digest. Other differential digests are unchanged. Working downloads, copied dependencies and diagnostic logs are disposable under `.backup-scratch/`; final assets and their source/hash records above are retained.

Integration note for the parent: dataset constituent objects carry their own `logo` and retain it through model party metadata. The existing split action creates new lists without assigning a list-level `logo`; selecting the sole constituent’s logo for a split list remains a presentation/model integration task outside this research pass.

## Continuation on 4 November 2026: live official campaigns

Outcome: **partial**, not completion of the requested k26/k25 catalogue. Nine new assets are retained (eight official website headers and one extracted Shas campaign lockup). All asset URLs, retrieval dates, original/final SHA-256, bytes, rights and evidence are in `data/meta/logos/k26.json` and `sources.json`. Existing free-licence entries remain licensed; new official-origin assets use fair-use-identification. The Democrats’ existing party-site mark also has a separately keyed constituent entry. A shared file is counted once as an asset and once per independently identified list/party entry.

Scope: k26 winners, constituent headers, limited nonwinner discovery; then k25 archive retrieval and dated campaign-source discovery. k24–k21 received no new source acquisition in this continuation. No English Wikipedia page was opened or used; incidental search results were excluded. Hebrew searches preceded Arabic party-name searches. No proxies, challenge bypass or contact-bearing User-Agent were used.

### Evidence and confidence

- [Yashar](https://yasharwitheisenkot.com/), [Likud](https://www.likud.org.il/), [Otzma](https://www.ozma-yeudit.co.il/), and [Zehut](https://zehut.org.il/): live header references downloaded and visually inspected on 4 November; contextual corroboration is the [27 October design review](https://alefalefalef.co.il/elections-design-26/). That article covers non-sectoral parties, **not every 2026 list**. It also discusses Israel Beiteinu. Header variants with white letters retain dark-background metadata. These are medium-confidence just-after-campaign observations, not archived polling-day observations.
- [Israel Beiteinu](https://beytenu.org.il/): live campaign homepage still links its ballot publication and candidate team. Its roof-and-white-letter header was visually inspected. The secondary design review provides campaign context. The 2023 upload path alone is not election evidence.
- [New Hope](https://www.newhope.org.il/) and [Yesh Atid](https://yeshatid.org.il/): separate current party-site headers accepted under the requested live-site rule, with medium confidence. Their 2024/2026 upload directories are contextual only. No inspected archive proves their exact election-day bytes; these are weaker assignments than the dated Shas graphic. No 2022 assignment is inferred from them.
- [Noam](https://www.noamlisrael.org.il/): separate live constituent mark for the nonwinning Noam–National Responsibility list, not a combined-list logo. The live header does not establish that a distinct combined mark was absent.
- [Shas official post 5327](https://t.me/dovrutshas/5327), timestamp **2026-09-20T06:13:39+00:00**: full 800×800 graphic inspected. Existing white book emblem and slogan extracted at pixel box `(85,670,485,790)` and reduced to 256×77 PNG. Gold background retained. No redrawing, recolouring or synthetic transparency. The live gold-on-white avatar is a different variant and was rejected. [18 August launch reporting](https://www.inn.co.il/news/704260) corroborates the slogan; it is not the download origin.
- [Religious Zionism](https://zionutdatit.org.il/): current party header downloaded for inspection but not retained as an additional asset; the existing freely licensed tkuma entry is preserved. Neither that party emblem nor Zehut’s separate mark proves a combined list lockup.
- [Ra’am discovery candidate](https://www.almowhada.org/): inspected and **not accepted as an official origin**. Its footer says the information is based on public sources and should be confirmed before official publication. Linking an official Facebook page does not establish ownership of the site.
- Hadash’s live site was inspected, but the two external SVGs found there were navigation arrows, not logos; neither was assigned. `taal.org.il` and `balad.org.il` failed DNS resolution. Meretz’s site timed out. Similar-name construction-company results for Yesodot Israel were excluded.

For live entries, `retrievedAt` and source-card `date` mean the actual inspection date, 4 November. `inUseDate: 2026-10-27` is the election assignment based on the expressly authorized just-after-campaign observation, not an invented capture date. No archive timestamp is fabricated. Exact campaign-day rendering remains a limitation for these medium-confidence live entries.

### Archive continuation and k25 gaps

[Inspected official Israel Beiteinu homepage capture](https://web.archive.org/web/20221001082757/https://beytenu.org.il/): HTML directly referenced `https://beytenu.org.il/wp-content/themes/nisarg/images/logo_260.png`. The CDX index also listed 1 September and 1 November captures; those were discovery records, not inspected image evidence. The October HTML was inspected; its exact header image could not be acquired. Archived-asset requests returned HTTP 429; the live image URL redirects to HTML, not an image. No new logo was hosted.

Wayback returned 429 without Retry-After for the Likud October 2022 capture. After a 60-second fallback backoff, the retry still returned 429. Subsequent serial Otzma and exact Israel Beiteinu asset attempts, separated by further backoff intervals and at least two seconds between requests, also returned 429. No request burst or alternative Wayback proxy was used. The [archive.today viewing fallback](https://archive.ph/https://www.likud.org.il/) timed out during TLS handshake; web-tool viewing was also unavailable. Archive requests were resumed after backoff; the first 429 did not end the research. National Unity, Yesh Atid and New Hope 2022 captures remain uninspected, not “no capture exists”.

Dated-source discovery found [the July 2022 Blue and White–New Hope launch](https://www.ynet.co.il/news/article/bjghbpyiq), which predates the final National Unity identity, and [the Meretz 2022 rebrand report](https://www.ice.co.il/advertising-marketing/news/article/879457). Neither establishes a downloadable official-origin final asset. These leads do not increase coverage. Jewish Home’s whole list and its three constituents remain unverified; its existing 2012-era mark is not propagated by resemblance.

### Reproducible coverage and every gap

Run `python3 scripts/research/logo-coverage.py`. It counts only verified hosted entries and intersects constituent ids with seat-winning lists. In k26 the pre-election bloc scheme enumerates the eleven reported winners, including Shas, Ra’am and Israel Beiteinu omitted by the earlier meta.lists-only count. That election-specific fallback is explicitly scoped; pre-election bloc membership is not a general rule for deciding winners.

| Election | Winner lists before → after | Winner constituents before → after |
|---|---:|---:|
| k26 | 3/11 → 8/11 | 1/19 → 8/19 |
| k25 | 1/10 → 1/10 | 1/11 → 1/11 |
| k24 | 3/13 → 3/13 | 1/12 → 1/12 |
| k23 | 1/8 → 1/8 | 1/18 → 1/18 |
| k22 | 2/9 → 2/9 | 1/19 → 1/19 |
| k21 | 1/11 → 1/11 | 0/14 → 0/14 |

Nonwinning k26 whole-list coverage remains Amcha Yisrael only (1/27 dataset lists without seats, including withdrawn entries); constituent extras are Reservists and Noam. No blanket claim is made that the other nonwinning lists lack distinct logos. All remain gaps for whole-list official-origin campaign evidence. The complete nonwinner identities can be reproduced by subtracting the winner set printed by the script from `public/data/k26.json` lists; the hosted Amcha list has letters ך.

K26 missing whole lists: **ג** — no official campaign-origin file verified; no official website per the [dated website audit](https://finance.walla.co.il/item/3873692), social evidence unresolved. **ט** — verified separate party designs do not establish a joint lockup. **עם** — official ownership and campaign-period rendering not established for the discovered site.

K26 missing constituents: **agudat-yisrael, degel-hatorah, homat-torat-yisrael** — no inspected separate official campaign mark; UTJ lockup cannot substitute. **hadash, taal, balad** — live Hadash yielded no extractable mark in this inspection; Ta’al/Balad DNS leads failed; joint-list mark cannot substitute. **meretz** — official site timed out, no current separate campaign design verified. **yesodot-yisrael** — targeted searches yielded party launch reports but no official asset; unrelated construction-brand logos excluded. **atid-ehad, eretz-yisrael-shelanu** — no campaign-period official emblem established. **together-bennett** — only joint lockup verified; no separate constituent mark established. These are unresolved, not evidence of nonexistence.

- **k25 whole-list gaps:** אמת, ג, ום, ט, ל, מחל, עם, פה, שס. **Constituent gaps:** agudat-yisrael, atid-ehad, degel-hatorah, eretz-yisrael-shelanu, hadash, israel-resilience, new-hope, noam, otzma-yehudit, taal. Israel Beiteinu has an inspected header reference but rate-limited image retrieval. Other identities lack an inspected final official-origin campaign file; launch/report leads and current designs do not establish the 2022 variant. All are distinct unresolved identities, not assertions that a logo did not exist.
- **k24 whole-list gaps:** אמת, ב, ג, ודעם, ט, ל, מחל, מרצ, פה, שס. **Constituent gaps:** agudat-yisrael, atid-ehad, balad, degel-hatorah, derech-eretz, hadash, likud, new-hope, noam, taal, tkuma. No new campaign-source acquisition in this continuation; previously unresolved dated official-origin evidence remains missing. All are distinct unresolved identities, not assertions that a logo did not exist.
- **k23 whole-list gaps:** ג, ודעם, טב, ל, מחל, פה, שס. **Constituent gaps:** ahi, balad, degel-hatorah, gesher, hadash, israel-resilience, jewish-home, kulanu, labor, likud, meretz, new-right, raam, taal, telem, tkuma, yesh-atid. No new campaign-source acquisition in this continuation; previously unresolved dated official-origin evidence remains missing. All are distinct unresolved identities, not assertions that a logo did not exist.
- **k22 whole-list gaps:** אמת, ג, ל, מחל, מרצ, פה, שס. **Constituent gaps:** agudat-yisrael, degel-hatorah, gesher, green-movement, hadash, independence, israel-resilience, jewish-home, kulanu, labor, likud, meretz, new-right, raam, taal, telem, tkuma, yesh-atid. No new campaign-source acquisition in this continuation; previously unresolved dated official-origin evidence remains missing. All are distinct unresolved identities, not assertions that a logo did not exist.
- **k21 whole-list gaps:** ג, דעם, ום, טב, כ, ל, מחל, מרצ, פה, שס. **Constituent gaps:** agudat-yisrael, ahi, balad, degel-hatorah, hadash, israel-resilience, jewish-home, likud, otzma-yehudit, raam, taal, telem, tkuma, yesh-atid. No new campaign-source acquisition in this continuation; previously unresolved dated official-origin evidence remains missing. All are distinct unresolved identities, not assertions that a logo did not exist.

Raster regeneration: retrieve the exact `assetSourceUrl`, verify `originalSha256`, preserve RGBA, thumbnail with Pillow 13.0.0 LANCZOS to 256 pixels maximum, save optimized PNG. Yesh Atid’s 163,082-byte official SVG exceeded the file limit and was rasterized with local Chromium 1248 canvas at 256 pixels; its original SVG hash remains recorded. Shas additionally uses the exact crop above. Reproducible copies, dependencies and inspection images are in ignored `.backup-scratch/`; accepted PNGs and provenance are durable. Scratch backup exclusion outside this repository was not independently verified.

### Nonwinning identities still without a whole-list logo

Each row is a distinct outstanding asset: no verified official-origin campaign logo was acquired. Constituents in parentheses are separately unresolved unless already hosted. “Not acquired” includes unsearched identities and is not proof of absence. Withdrawn entries remain identified because they occur in the dataset.

**k26:**

- די — Reservists & New Economic (separate party gaps: new-economic).
- נר — None.
- זך — None.
- ני — Noam (separate party gaps: national-responsibility).
- בי — None (separate party gaps: beit-yemini, tzomet).
- ד — None.
- צדק — None.
- בד — None.
- צף — None.
- י — None.
- קך — None.
- פה — None.
- קץ — None.
- נקי — None.
- בקר — None.
- קה — None.
- רץ — None.
- ק — None.
- נף — None.
- ז — None.
- נץ — None.
- ה — None.
- יק — None.
- זץ — None.
- כן — Blue and White [withdrawn].
- צבי — None [withdrawn].
**k25:**

- מרצ — Meretz.
- ד — Balad.
- ב — The Jewish Home (separate party gaps: new-right, jewish-home, religious-national-israeli).
- אצ — Economic Freedom.
- קץ — None.
- יז — New Economic Party.
- צ — Young People on Fire.
- ף — None.
- ק — None.
- ת — None.
- ני — None.
- קנ — None.
- נק — None.
- י — None.
- קך — None.
- נץ — None.
- ץ — None.
- רז — None.
- ך — None.
- ז — None.
- קי — None.
- יק — None.
- נז — None.
- נר — None.
- זץ — None.
- יץ — None.
- נף — None.
- ינ — None.
- זך — None.
- זנ — None.

### Continuation verification

Node 24.18.0; Pillow 13.0.0; local Chromium 1248 for the oversized Yesh Atid SVG. `npx tsx scripts/build-datasets.ts` passed (tsx invoked via npm exec with project-local scratch cache); the second final run wrote zero files, with all 39 public/data file hashes identical. `python3 -I scripts/validate-party-logos.py` validates 26 overlays, 102 source records, 53 unique assets and 57 hosted identity entries. `npx tsc -p tsconfig.json --noEmit` passed. Only the model differential digest changed, to `1799c8b1bdc065d754b4483a944cfc0e3fc26c8ff24b494e7c9270a0fb379260`: the entire dataset compares equal after removing logo fields and builtAt. Temporarily restoring the original k26 dataset reproduced all five previous differential digests. Allocation, analysis, validation and rules digests remain unchanged. Final `npm test`: **53 test files and 445 tests passed**. No push was performed.


## Paced archive continuation — 4 November 2026

This continuation is **partial**: one k25 list gap is closed. The requested k26 → k25 → k24 → k23 → k22 → k21 programme is not complete. Baseline is commit c2a5665, including both preceding logo passes. The previous complete gap inventory remains applicable except for k25 **פה**, now hosted. No gap is relabelled as “no distinct logo” without positive evidence.

### Accepted evidence

**yeshatid-archive-20221101** supports the claim that the official Yesh Atid homepage referenced its May 2022 desktop mark on election day. [Inspected capture, 1 November 2022 01:34:42 UTC](https://web.archive.org/web/20221101013442/https://yeshatid.org.il/) contains `img.dt-logo`, alt `יש עתיד`, pointing to [the exact official-origin SVG](https://yeshatid.org.il/wp-content/uploads/2022/05/logo_svg.svg). Retrieved and visually inspected the SVG: white lettering, so `displayBackground: dark`; unchanged SVG, 7,087 bytes, SHA-256 `3e9e0ef9855d144d6b2ece1221d508b823f30c89dfe82f2b06e261cccdf50965` for both original and final. Rights: fair-use identification, copyright retained by the party, under decision 0089. Medium confidence: the archive establishes the image reference; the bytes were retrieved from that official path in 2026, not from an inspected historical asset capture. This is one official-site evidence family, not two independent sources.

### New discovery, counterevidence and retrieval limits

- **UTJ, k26 first priority:** [Hebrew file page](https://he.wikipedia.org/wiki/קובץ:יהדות_התורה_לוגו_2019.svg) identifies an extraction from HaMevaser dated 5 April 2019 and links [Telegram newspaper post 3177](https://t.me/newspaperil/3177). The accessible Telegram response exposes no PDF; it does not verify the original advertisement or continued 2026 use. The 599 KB SVG also exceeds the asset limit. [Dated Degel campaign launch, 28 September 2026](https://www.jdn.co.il/news/2735182/) was read and its photograph inspected: campaign slogan on a lectern, not a clean verified UTJ lockup. No official-origin file acquired. The Commons UTJ raster has conflicting PD/fair-use credit history; it was not promoted.
- **Religious Zionism–Zehut, k26 second priority:** [official Religious Zionism homepage](https://zionutdatit.org.il/) references an August 2026 final PNG. Downloaded and visually inspected: it says Religious Zionism, headed by Bezalel Smotrich; it does not name Zehut. Separate party branding still cannot establish a joint-list mark. The existing constituent remains covered; whole-list **ט** remains unresolved.
- **Ra’am, k26 third priority:** `raam.org.il` failed DNS. Hebrew discovery identifies `almwahda.com`; direct retrieval disconnected, so neither ownership nor campaign rendering was established here. The already-hosted 2021 mark is not propagated to 2026 or 2022.
- **Hadash constituent:** [official homepage](https://hadash.org.il/) embeds a bilingual red/lime mark as a percent-encoded SVG data URI, rather than a named image URL. Extracted without changing its geometry or colours and visually inspected; 9,594 bytes, SHA-256 `107a64b2ace98171a7f712a4714e5747756402dd10ae92280c7d0754841c0b8e`. Current HTML contains Framer release/optimization dates in October 2026; these self-reported build timestamps alone were not accepted as proof of the historical rendering. Its selected October capture returned 429. [News 13 election page](https://storycards.co/reshet/7jSpdaRKM), whose public `story.json` was inspected, labels an SVG “Hadash”; visual inspection shows a white **Joint List** lockup instead. Rejected as constituent evidence. No candidate copied into public assets.
- **Other k26 constituents:** Degel’s HTTPS connection reset; HTTP returned a minimal page without a qualifying mark. Meretz, Agudat Yisrael, Homat Torat Yisrael, Ta’al, Balad, Yesodot Yisrael, Atid Ehad, Eretz Yisrael Shelanu and Together-Bennett retain the distinct unresolved reasons in the preceding inventory. No separate constituent is inferred from a joint lockup.
- **k25 follow-through:** current Israel Beiteinu header has a July 2023 path, so it is not used for 2022. Current Likud, Religious Zionism and Israel Beiteinu pages were inspected, but a live header alone cannot date an exact older variant. Ynet’s typography review HTML supplies an exact publication date, **2 September 2022** (`datePublished`), resolving the earlier report’s “exact date not exposed” limitation; it remains secondary in-use/discovery evidence, not an official asset origin. Jewish Home and its three constituents remain unresolved; no 2012-era mark was silently reused.

Wayback plan: query CDX once per site for campaign-period captures, then select a single relevant homepage per election before replay. Successful indexes cover Israel Beiteinu, Likud, Yesh Atid, Hadash, New Hope and Shas. CDX success is not capture inspection. Replay requests were spaced at least five seconds apart, and blocked captures were resumed later rather than abandoned at the first 429. Replays for Israel Beiteinu and Likud continued to return 429 or timeout; Yesh Atid’s exact 2022 capture eventually succeeded. No `Retry-After` header was exposed by the observed 429 responses. The later queue uses a shared archive lock, five-second minimum interval and 60/120/240-second exponential waits on consecutive 429s; no proxy or challenge workaround was used. Reproducible downloads, HTML, indexes, capture plan and diagnostics remain under ignored `.backup-scratch/logo-pass3/`. No claim is made that failed captures are absent from Wayback.

### Further inspected captures, still unhosted

**yeshatid-archive-20210301:** [official homepage, 1 March 2021 19:35:01 UTC](https://web.archive.org/web/20210301193501/https://www.yeshatid.org.il/) explicitly references `/sites/atid/UserContent/images/logo/yeshatid%202021%20logo%20RGB.png`, alt “יש עתיד בראשות יאיר לפיד”. The live path returns 404; exact archived image replay returned 429, including a backed-off retry. This replaces the k24 secondary-only proposal with an official dated reference, `download-unavailable`; it does not increase hosted coverage or prove the exact rendering. The January 2021 sunrise-design report remains relevant counterevidence against reusing the old mark.

**yeshatid-archive-20190904:** [official homepage, 4 September 2019 08:20:28 UTC](https://web.archive.org/web/20190904082028/https://www.yeshatid.org.il/) references `/content/images/logo_header.png`, alt “יש עתיד בראשות יאיר לפיד”. It identifies the separate Yesh Atid party, not the Blue and White list. Registered under k22 `party: yesh-atid`; exact archived image retrieval returned 429 after the shared backoff, so it remains unhosted pending retrieval and inspection. No propagation to k21 or k23 is made. The selected February 2020 homepage replay returned 429, so it supplies no inspected k23 evidence.

### Hosted coverage, baseline → this continuation

| Election | Winning lists | Winning-list constituents |
|---|---:|---:|
| k26 | 8/11 → 8/11 | 8/19 → 8/19 |
| k25 | 1/10 → 2/10 | 1/11 → 1/11 |
| k24 | 3/13 → 3/13 | 1/12 → 1/12 |
| k23 | 1/8 → 1/8 | 1/18 → 1/18 |
| k22 | 2/9 → 2/9 | 1/19 → 1/19 |
| k21 | 1/11 → 1/11 | 0/14 → 0/14 |

All remaining identities are individually enumerated under **Reproducible coverage and every gap** above; remove only k25 פה from that historical inventory. K24 פה and k22 Yesh Atid now have inspected dated official header references but lack retrievable inspected assets. Other k24/k23/k22/k21 identities retain their existing reasons; this continuation did not complete their acquisition. K25 missing winners remain אמת, ג, ום, ט, ל, מחל, עם, שס; its ten missing winning-list constituents and Jewish Home’s three constituents remain unchanged. No nonexistence finding was made.

Conclusion map: k25 פה **passes** the official-origin plus election-specific reference criterion (medium, one official-site family; historical byte identity remains unverified). K24 פה and k22 Yesh Atid **remain unresolved for hosting** despite stronger date evidence. K26’s three whole-list priorities and all other missing identities **remain unresolved**; current variants, secondary illustrations and capture indexes do not satisfy the criterion. Exact campaign assets or inspectable dated originals would change these outcomes.

Verification: Node 24.18.0; local Chromium headless shell 1248 used only to inspect downloaded artwork. `node scripts/build-datasets.ts` passed; its second run wrote zero files and all **39** public-data file SHA-256 values were identical. The build skips full polling-station reconciliation where scratch sources are absent, while retained source/locality checks pass. `npm run build -- --outDir .backup-scratch/logo-pass3/dist` passed. `python3 -I scripts/validate-party-logos.py` passed: 26 overlays, 105 source records, 54 assets, 58 hosted entries, two download-unavailable and seven unresolved entries. `npx tsc -p tsconfig.json --noEmit` passed. `npm test`: **54 files, 457 tests passed**. Only the model differential digest changed, to `bf90d94a7fab09a9ba7e62eded247acec1346fb5b23aebdfde2267ab79e9c175`; public/data/k25.json is exactly equal to baseline after recursively omitting `logo` and `builtAt`, and no other dataset changed. The other four differential digests remain unchanged. No push.
