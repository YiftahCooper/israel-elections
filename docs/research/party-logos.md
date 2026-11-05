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
| k20 · 2015-03-17 | 10 | 2 | 0 | 0 | 0 |
| k21 · 2019-04-09 | 11 | 2 | 0 | 0 | 0 |
| k22 · 2019-09-17 | 9 | 3 | 0 | 0 | 2 |
| k23 · 2020-03-02 | 8 | 2 | 0 | 0 | 1 |
| k24 · 2021-03-23 | 13 | 5 | 0 | 0 | 1 |
| k25 · 2022-11-01 | 10 | 3 | 0 | 4 | 1 |
| k26 · 2026-10-27 | 11 | 8 | 0 | 1 | 10 |

## Earlier pass: licence and retrieval outcome (historical)

44 hosted entries (43 free-licence, one fair-use identification); no outstanding dated downloads; 13 source-only unresolved entries. The 22 downloads described in the earlier report were **already present at the start of this pass**, completed by the parent on 4 November. This pass verified their hashes/bytes, removed stale download-failure text, and did not download them again. It adds one asset: Together’s archived campaign lockup.

The earlier Wikimedia HTTP 429 / Retry-After: 600 incidents remain retrieval history, not current missing assets. No new Wikimedia requests were needed. Final assets remain below 60,000 bytes; raster assets are PNG at most 256 pixels. Original and final hashes are retained; final byte counts are now explicit.

New primary evidence: [Together’s official homepage](https://be-yahad.org.il/), [inspected capture, 1 October 2026](https://web.archive.org/web/20261001011247/https://be-yahad.org.il/), and [the exact header SVG referenced by that capture](https://be-yahad.org.il/wp-content/uploads/2026/09/LOGO_RAK-02.svg). Visually inspected: blue main lockup, orange underline, Bennett subline. It differs from the current header’s July-path SVG and the rejected April/July candidates. The archive establishes the image reference; the asset was retrieved from the official origin, so confidence remains medium.

[Yashar’s official site](https://yasharwitheisenkot.com/) supplies a January-path WebP logo, but its October capture timed out, then returned HTTP 429. Archive retrieval stopped; an index timestamp alone was not accepted as proof of image contents. No new asset is assigned. Likud, Otzma Yehudit and New Hope official homepages were accessible; their current headers alone do not prove campaign-period use. New Hope’s current logo has a 2024 path, which is not evidence for its 2022 constituent emblem. These candidates remain unhosted.

New entries use `rights: "free-licence" | "fair-use-identification"`; `licence` remains the licence or copyright/identification notice, never an invented grant. All entries require `sourceUrl`, `evidenceId`, attribution and `inUseEvidence`. Hosted files require `bytes`, `sha256`, `originalSha256` and `assetSourceUrl`; new fair-use entries also require `inUseDate` and an official-origin source card. `archiveUrl`/`archiveTimestamp` record an inspected capture when available. Source-only proposals are not display eligible. `letters` identifies a whole list; `party` identifies a constituent id; these are mutually exclusive. A party objection means removal. Free-licence entries keep their licence data.

## Uncertainty and rejected candidates

- The Democrats 2026 official SVG contains white lettering and requires a dark background (displayBackground: dark). It has not been recoloured.
- The earlier accepted assignments have medium confidence; the digest-proof continuation below adds high-confidence entries. Commons community descriptions, period statements and campaign dates are evidence, but cited NLI originals and campaign videos were generally not independently inspected. A strict independently verified-primary-only policy would reject these until those underlying items are checked.
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

Hosted winners: מחל — Likud; כ — Kulanu.

Not locally covered winners: אמת — Zionist Union; ודעם — Joint List; פה — Yesh Atid; טב — Jewish Home; שס — Shas; ל — Yisrael Beiteinu; ג — United Torah Judaism; מרצ — Meretz.

Evidence references: [commons-39073240](https://commons.wikimedia.org/wiki/File:Kulanu_Kahlon_logo.svg).

### k21 · 2019-04-09

Hosted winners: מחל — Likud; אמת — Labor.

Not locally covered winners: פה — Blue and White; שס — Shas; ג — United Torah Judaism; ום — Hadash–Ta’al; ל — Yisrael Beiteinu; טב — Union of Right-Wing Parties; מרצ — Meretz; כ — Kulanu; דעם — Ra’am–Balad.

Evidence references: [commons-76218696](https://commons.wikimedia.org/wiki/File:Israeli_Labor_Party_2019.png), [commons-77001018](https://commons.wikimedia.org/wiki/File:Logo_of_HaYamin_HeHadash.svg).

### k22 · 2019-09-17

Hosted winners: מחל — Likud; ודעם — Joint List; טב — Yamina.

Not locally covered winners: פה — Blue and White; שס — Shas; ל — Yisrael Beiteinu; ג — United Torah Judaism; אמת — Labor–Gesher; מרצ — Democratic Union.

Evidence references: [commons-107297670](https://commons.wikimedia.org/wiki/File:Balad.svg), [commons-130829705](https://commons.wikimedia.org/wiki/File:Yamina_logo.svg), [commons-94577687](https://commons.wikimedia.org/wiki/File:Joint_List_logo_2019.svg).

### k23 · 2020-03-02

Hosted winners: מחל — Likud; אמת — Labor–Gesher–Meretz.

Not locally covered winners: פה — Blue and White; ודעם — Joint List; שס — Shas; ג — United Torah Judaism; ל — Yisrael Beiteinu; טב — Yamina.

Evidence references: [commons-130826979](https://commons.wikimedia.org/wiki/File:Logo_of_the_Labor-Gesher-Meretz.svg), [commons-146621440](https://commons.wikimedia.org/wiki/File:Agudat_Yisrael_logo_2020.svg).

### k24 · 2021-03-23

Hosted winners: מחל — Likud; כן — Blue and White; ת — New Hope; עם — Ra'am; פה — Yesh Atid.

Not locally covered winners: שס — Shas; ב — Yamina; אמת — Labor; ג — United Torah Judaism; ל — Yisrael Beiteinu; ט — Religious Zionism; ודעם — Joint List; מרצ — Meretz.

Evidence references: [commons-100640724](https://commons.wikimedia.org/wiki/File:New_Hope_party_logo.png), [commons-119107430](https://commons.wikimedia.org/wiki/File:Raam_logo_2021.svg), [commons-130826913](https://commons.wikimedia.org/wiki/File:Blue_and_White_logo_2021.svg), [commons-130829740](https://commons.wikimedia.org/wiki/File:Otzma_Yehudit_2021_logo.svg), [srugim-2021-yesh-atid](https://www.srugim.co.il/525439-%D7%94%D7%9C%D7%95%D7%92%D7%95-%D7%94%D7%97%D7%93%D7%A9-%D7%A9%D7%9C-%D7%99%D7%A9-%D7%A2%D7%AA%D7%99%D7%93-%D7%99%D7%90%D7%99%D7%A8-%D7%9C%D7%A4%D7%99%D7%93-%D7%95%D7%96%D7%A8%D7%99%D7%97%D7%94).

### k25 · 2022-11-01

Hosted winners: מחל — Likud; כן — National Unity; פה — Yesh Atid.

Not locally covered winners: ט — Religious Zionism; שס — Shas; ג — United Torah Judaism; אמת — Labor; ל — Yisrael Beiteinu; עם — Ra'am; ום — Hadash–Ta'al.

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

## Alternative-archive and retained-evidence pass — 4 November 2026

Baseline: **dd224be** on main. This bounded pass adds **two** hosted identities: k24 Yesh Atid whole list and k22 Yesh Atid constituent. It also retains and strengthens k25 Yesh Atid's existing provenance. The broader acquisition programme remains incomplete. No src/app changes and no push.

### Accepted sources and claim map

- **yeshatid-archive-20190904 — passes, medium confidence:** retained [4 September official campaign page](https://web.archive.org/web/20190904082028id_/https://www.yeshatid.org.il/) explicitly references `/content/images/logo_header.png`, alt “יש עתיד בראשות יאיר לפיד”. The availability API found an [exact election-day asset capture, 17 September 00:23:12 UTC](https://web.archive.org/web/20190917002312id_/https://www.yeshatid.org.il/content/images/logo_header.png). Visually inspected blue/cyan “לפיד יש עתיד 2019” lockup; original PNG is 5,272 bytes and within 256px, retained unchanged. This establishes the separate party's mark; it does **not** establish a Blue and White joint-list lockup. Page and image captures are different dates in the same campaign, one official-site evidence family.
- **yeshatid-archive-20210301 — passes, medium confidence:** retained [1 March official campaign page](https://web.archive.org/web/20210301193501/https://www.yeshatid.org.il/) references the exact `yeshatid%202021%20logo%20RGB.png` path. [3 March 09:46:52 UTC asset capture](https://web.archive.org/web/20210303094652id_/https://www.yeshatid.org.il/sites/atid/UserContent/images/logo/yeshatid%202021%20logo%20RGB.png) retrieved after backoff. Visually inspected blue lettering and orange sunrise in “2021”, consistent with the earlier January rebrand counterevidence. Original 593×271 PNG retained (13,509 bytes); final 256×117 PNG is 20,863 bytes. No recolouring; Pillow 13.0.0 LANCZOS thumbnail and optimized PNG. No cross-election reuse.
- **yeshatid-archive-20221101 — existing coverage, stronger provenance:** retained [election-day raw homepage](https://web.archive.org/web/20221101013442id_/https://yeshatid.org.il/) and [2 November archived SVG](https://web.archive.org/web/20221102082854id_/https://yeshatid.org.il/wp-content/uploads/2022/05/logo_svg.svg). The latter's bytes equal the current official-origin download and the existing public SVG: SHA-256 `3a969c0c32b70d9cba0b5797f1759314e8282ee333cd154ecc6efcba8b55fc39`, 7,087 bytes. This corrects the earlier report prose's `3e9e…` hash typo; metadata already held the correct `3a969…` hash. The image capture is **one day after** polling; the election-day page establishes the reference. Historical election-day byte identity remains unproven. White artwork retains `displayBackground: dark`. The response identifies an Archive-It collection 20131 WARC, served through Wayback; this is not a successful direct Archive-It retrieval or independent corroboration.

Retained page and asset pairs live in `data/raw/logos/k22/`, `k24/`, `k25/`. Each file has a `data/raw/SOURCES.json` entry with exact retrieval URL, `archiveUsed`, `captureTimestamp`, retrieval date, bytes and SHA-256. `rawEvidence.page` / `rawEvidence.asset` on the logo entry and matching source card resolve to those manifest IDs; `assetArchiveTimestamp` distinguishes image capture from page/use date. HTTP gzip was decoded for the k25 HTML; standard Wayback replay HTML for k24 retains its toolbar and rewritten references. All other accepted bodies are unchanged. These are source documents, not HTML intended for execution by the application.

`python3 -I scripts/validate-party-logos.py` now checks these optional references offline: election-local paths, source-card agreement, retained bytes/hashes, page timestamp, asset timestamp and original asset hash. Existing older entries without retained evidence are not represented as having it. A corruption probe against the new retained k22 PNG was rejected, and restoring the original passed. Dataset construction remains offline and uses the existing hosted-asset integrity checks.

### Routes actually tested and rejected evidence

| Route | Observed result and consequence |
|---|---|
| Memento aggregation, `timetravel.mementoweb.org/api/json/20221001/https://beytenu.org.il/` | DNS resolution failed. No TimeMap inspected and no other-archive coverage inferred. |
| Common Crawl collection list and `CC-MAIN-2022-40-index` for Israel Beiteinu, HTTPS and HTTP | Connections closed without a response; web fetch also failed. No CDX record acquired, therefore no WARC byte-range fetch was possible. This does not establish absence of captures. |
| NLI public archive page and `web-archive.nli.org.il/National_Library/cdx` for Israel Beiteinu | HTTP 403; public page body was a Cloudflare challenge. Stopped without interacting with the challenge. NLI campaign capture contents remain uninspected. |
| Arquivo.pt versionHistory, date-filtered | K26 Religious Zionism, Ra'am and Hadash returned zero rows in August–27 October. K25 Israel Beiteinu, Yesh Atid (non-www), Labor (havoda www/non-www), New Hope, Otzma (both discovery spelling and official www.ozmayeudit.com) and Ra'am returned zero rows in August–1 November. Zero results apply to these queries, not every URL/path in the archive. |
| Arquivo.pt Likud | Two August 2022 index rows: HTTP→HTTPS redirect and captured HTTP 403. Rejected; no qualifying campaign page. Non-www query resolves to the same records. |
| Arquivo.pt Hadash 2022 | One HTTP redirect, no inspected campaign logo. |
| Arquivo.pt Israel Beiteinu replay | Requesting October 2022 resolved to **15 February 2023**, as verified by Memento-Datetime; page references `logo_260.png`, but post-election capture cannot date the 2022 rendering. Exact image replay failed. Not promoted. |
| Arquivo.pt Yesh Atid www | September 2021 homepage inspected, references the 2021 PNG; exact image replay returned 404. It is after k24 and cannot itself support campaign use; not substituted for the retained March page. |
| Arquivo.pt other failures | Shas www/non-www, k24 New Hope and exact 2019 Yesh Atid asset index queries reported network unreachable. Not empty-result claims. |
| Archive-It aggregate TimeMap endpoint | HTTP 200 body was **Session Verification**, not a TimeMap. Stopped; no challenge solving or bypass. |
| Wayback availability API → exact raw captures | Served all three accepted assets/pages above except the k24 page, which succeeded via standard replay. Nearest-date image replays often returned 429; selecting the actual asset timestamp eventually succeeded for k22 and k25, and k24 after a backed-off retry. |
| Wayback remaining captures | Exact Hadash/Religious Zionism k26 and Likud/Israel Beiteinu k25 homepages returned 429. Requests were serial with ≥5-second gaps; failed resources revisited after ≥60 seconds where retried. No Retry-After was exposed. These failures do not imply absent captures. |
| Official origins / search discovery | Yesh Atid 2022 origin SVG matches archived bytes. 2019 origin image is 404; 2021 origin previously 404. Religious Zionism current HTML remains separate party branding. Ra'am `almwahda.com` disconnected. Zehut's official `/petek` page depicts a ballot and explicitly names the joint list, not a qualifying joint campaign logo; rejected. |

No proxies, email-bearing User-Agent, CAPTCHA interaction or bot-challenge bypass. Archive.today, LoC and UK archive capture interfaces were not exercised in this pass; no availability claim is made for them. Search results only guided discovery; no English Wikipedia result was opened, relied on or cited. Diagnostic bodies, rejected captures, tools and build output remain disposable in `.backup-scratch/logo-archives/`; accepted sources are durable.

### Coverage, baseline → this pass

Counts below use `scripts/research/logo-coverage.py`'s winner and constituent definitions, extended over all 26 elections for this comparison. Nonwinning whole-list coverage is unchanged. K25 Jewish Home and all three of its constituents remain unresolved; no nonwinning identities were promoted.

| Election | Winning lists | Winning-list constituents |
|---|---:|---:|
| k26 | 8/11 → 8/11 | 8/19 → 8/19 |
| k25 | 2/10 → 2/10 | 1/11 → 1/11 |
| k24 | 3/13 → 4/13 | 1/12 → 1/12 |
| k23 | 1/8 → 1/8 | 1/18 → 1/18 |
| k22 | 2/9 → 2/9 | 1/19 → 2/19 |
| k21 | 1/11 → 1/11 | 0/14 → 0/14 |
| k20 | 1/10 → 1/10 | 0/11 → 0/11 |
| k19 | 3/12 → 3/12 | 0/9 → 0/9 |
| k18 | 2/12 → 2/12 | 0/12 → 0/12 |
| k17 | 1/12 → 1/12 | 0/11 → 0/11 |
| k16 | 2/13 → 2/13 | 0/14 → 0/14 |
| k15 | 2/15 → 2/15 | 0/12 → 0/12 |
| k14 | 2/11 → 2/11 | 0/12 → 0/12 |
| k13 | 1/10 → 1/10 | 0/6 → 0/6 |
| k12 | 1/15 → 1/15 | 0/6 → 0/6 |
| k11 | 2/15 → 2/15 | 0/11 → 0/11 |
| k10 | 1/10 → 1/10 | 0/7 → 0/7 |
| k9 | 4/13 → 4/13 | 0/11 → 0/11 |
| k8 | 0/10 → 0/10 | 0/11 → 0/11 |
| k7 | 0/13 → 0/13 | 0/4 → 0/4 |
| k6 | 1/13 → 1/13 | 0/4 → 0/4 |
| k5 | 0/11 → 0/11 | 0/0 → 0/0 |
| k4 | 0/12 → 0/12 | 0/2 → 0/2 |
| k3 | 0/12 → 0/12 | 0/4 → 0/4 |
| k2 | 0/15 → 0/15 | 0/0 → 0/0 |
| k1 | 1/12 → 1/12 | 0/7 → 0/7 |

### Remaining gaps and limits

The complete earlier identity inventory remains authoritative **except** k24 whole list פה and k22 constituent yesh-atid, now hosted. In particular:

- **K26 priorities:** ג remains without inspected official campaign-origin artwork; the dated secondary audit reports no official site, and newspaper/social leads remain unverified. ט remains without a verified combined Religious Zionism–Zehut lockup; Zehut's ballot illustration and separate party header do not satisfy that criterion. עם remains without inspected ownership/date/asset evidence; its candidate origin disconnected. Alternative-archive failures above do not resolve any of these.
- **K26 constituents:** agudat-yisrael, degel-hatorah and homat-torat-yisrael still lack separate inspected campaign marks; hadash still lacks a retrievable inspected dated capture; taal/balad retain failed origin leads; meretz retains timeout/date uncertainty; yesodot-yisrael retains official-asset discovery failure; atid-ehad, eretz-yisrael-shelanu and together-bennett retain missing separate campaign evidence. No constituent was inferred from a joint list.
- **K25 winners:** אמת, ג, ום, ט, ל, מחל, עם, שס remain missing. Israel Beiteinu's available alternative page is too late; Likud's Arquivo capture is a 403; other returned indexes, current logos and secondary launch illustrations do not establish final official-origin campaign artwork. Constituents agudat-yisrael, atid-ehad, degel-hatorah, eretz-yisrael-shelanu, hadash, israel-resilience, new-hope, noam, otzma-yehudit, taal remain unverified. Jewish Home's nonwinning list and new-right, jewish-home, religious-national-israeli constituents retain missing exact 2022 official campaign evidence.
- **K24 and k22:** remove only the two newly hosted identities from the previous gap inventory. Other lists/constituents keep their previously stated date, origin and retrieval gaps; this pass did not inspect new qualifying originals for them.
- **K23, k21 and k20 back through k1:** no additional acquisition completed. Every previously enumerated gap remains unresolved for its prior reason; unchanged coverage is not a new finding that no logo exists. Nonwinning identities were not searched exhaustively.

### Reproduction and verification

No network is needed to use the accepted evidence. Manifest IDs under each entry's `rawEvidence` locate the retained HTML/originals; final files are in `public/logos/`. To regenerate the k24 PNG, use Python 3.13.16 with Pillow 13.0.0, open `data/raw/logos/k24/yeshatid-original.png`, call `thumbnail((256, 256), Image.Resampling.LANCZOS)`, then `save(..., optimize=True)` as PNG. K22 PNG and k25 SVG are unchanged archived bytes. Retain the locked npm dependencies. Reproduction helpers/dependencies and caches are disposable scratch; their exclusion by backup systems outside this repository is unverified.

Verification used Node 24.18.0. Dataset build passed, then a second run was byte-stable across all **39** public-data JSON files. Polling-station reconciliation is skipped where scratch station sources are absent, as explicitly reported by the existing builder; retained source and derived-locality integrity checks pass. Production Vite build passed with output under scratch; TypeScript passed. Logo validator passed: **26 overlays, 105 source records, 56 assets, 60 hosted entries**, no download-unavailable entries and seven unresolved entries. Full `npm test`: **54 files, 457 tests passed**.

Only the differential **model** digest was re-recorded, to `3249213d9d3e5c87bc8e5ee3b95ac644b35866d9dde1964248972c6ef2e0035f`. All 26 election datasets compare equal to baseline after recursively removing `logo` and `builtAt`; only k22/k24 datasets changed. Temporarily restoring those two baseline datasets reproduced **all five** previous digests. Allocation, analysis, validation and rules digests remain unchanged. The public source manifest additionally gains the six retained-evidence records. No allocation or candidate data changed.


## CDX byte-proof continuation — 4 November 2026

Outcome: **six additional hosted seat-winning list identities**, k20–k25 Likud (`מחל`), all high confidence. Baseline is `5ddbee1`; the previous retained-evidence procedure at `fb1442f` was followed. This is a bounded acquisition pass, not completion of the website-era catalogue. No constituent or nonwinning identity was added. K1–k13 were not searched. Official campaign logos are retained for identification under decision 0089; no licence grant is asserted.

The acceptance test was fixed before acquisition: inspect the official campaign page's actual header reference, retain the original artwork, and match base32(SHA-1(original bytes)) to an independently queried pre-election CDX asset digest. No English Wikipedia, proxy, email-bearing User-Agent, CAPTCHA or challenge interaction was used. Direct requests used `israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)`, serially with at least 3.2 seconds between requests. No 429 occurred in this pass; timeouts were recorded and other routes tried.

### Accepted claim and evidence map

Each row supports only the named election's list-header assignment. Party homepage and asset/CDX are one official-site evidence family, not independent corroboration. A header establishes the identification mark in use during that campaign, not that it was the only campaign lockup or used on all printed material.

| Election / list | Inspected page UTC | Pre-election asset CDX UTC | Digest proof | Retrieved original capture UTC |
|---|---|---|---|---|
| k20 / מחל — Likud | [20150315041632](https://web.archive.org/web/20150315041632id_/https://likud.org.il/) | 20150316072010 | `4Q3IR5ER4UWQULDBATMHQFY36T3NG3RK` | 20150316072010 |
| k21 / מחל — Likud | [20190409044547](https://web.archive.org/web/20190409044547id_/https://www.likud.org.il/) | 20190210085457 | `UUMFLDUTGIRXWQP5HTS3JPYAI3PQAZWU` | 20220811033925 |
| k22 / מחל — Likud | [20190913072935](https://web.archive.org/web/20190913072935id_/https://www.likud.org.il/) | 20190913072941 | `UUMFLDUTGIRXWQP5HTS3JPYAI3PQAZWU` | 20220811033925 |
| k23 / מחל — Likud | [20200103162620](https://web.archive.org/web/20200103162620id_/https://www.likud.org.il/) | 20200103170015 | `UUMFLDUTGIRXWQP5HTS3JPYAI3PQAZWU` | 20220811033925 |
| k24 / מחל — Likud | [20210226150032](https://web.archive.org/web/20210226150032id_/https://www.likud.org.il/) | 20210214215016 | `UUMFLDUTGIRXWQP5HTS3JPYAI3PQAZWU` | 20210214215016 |
| k25 / מחל — Likud | [20221014225820](https://web.archive.org/web/20221014225820id_/https://www.likud.org.il/) | 20220811033925 | `UUMFLDUTGIRXWQP5HTS3JPYAI3PQAZWU` | 20220811033925 |

**Pass, high confidence:** each original's computed digest equals the row's CDX digest. K20 is a 670×150 PNG with Israeli flag and Likud wordmark/subline, reduced proportionally to 256×57 without cropping/recolouring. K21–k25 SVGs are byte-identical pale-blue Likud wordmark/subline artwork, preserved as-is with `displayBackground: dark`. The independent dated page references and per-election CDX records, rather than a visual analogy, establish the repeated design. K21's asset record is 10 February and page is election morning; k23's January page is earlier than the preferred final campaign weeks, but within the campaign for the March election.

**Later-replay qualification:** k21, k22 and k23 retain the successfully retrieved **11 August 2022** SVG. Its bytes exactly match each election's separately retained **pre-election** CDX digest. This satisfies the explicitly permitted later-replay identity test; no pre-election replay success is claimed for those originals. K22's own image replay timed out. K24 retains its February 2021 image capture, and k25 its August 2022 capture. The true image replay timestamps and the CDX timestamps are distinct in `digestProof`, `assetArchiveTimestamp` and manifests. SHA-1 is used to reproduce CDX identity, with SHA-256 additionally retained for every committed file; this is archive integrity evidence, not an independent historical witness.

Each election's HTML, original artwork and exact CDX response are durable under `data/raw/logos/kNN/`. `rawEvidence.page/asset` and `digestProof.rawIndex` resolve to `data/raw/SOURCES.json`; the generated public manifest carries the same records. CDX `length` is the archive-record length, not a claim about decoded asset byte count. Original SHA-256 and thumbnail SHA-256 are distinct for k20. Reproduction: keep SVG unchanged; for k20 use Chromium headless shell 1248, load the original PNG locally, canvas `drawImage` at proportional dimensions bounded by 256, and `toDataURL('image/png')`. Locked npm dependencies / Node 24.18.0 were used. Reproducible downloads, dependency copies, renders and logs are under `.backup-scratch/logo-digest/`; exclusion by backup systems outside this repository remains unverified.

### Routes and unresolved evidence

- **k15 Likud:** [28 April 1999 homepage](https://web.archive.org/web/19990428045736id_/http://www.likud.org.il:80/) inspected; it is a 457-byte frameset pointing to `navframe.html` and `mainframe.html`, with no image. Frames were not fetched in this bounded pass. No asset/date inference.
- **k16 Likud:** [23 January 2003 homepage](https://web.archive.org/web/20030123024456id_/http://www.likud.org.il:80/) inspected; title explicitly says 2003 Elections, but only embeds `main_likudsite.swf`. No standalone logo verified; Flash was not executed/extracted.
- **k17 Likud:** [4 March 2006 homepage](https://web.archive.org/web/20060304172907id_/http://www.likud.org.il:80/) inspected; header is Flash, with ancillary navigation/background images. No standalone header logo verified; no guessed image selected.
- **k20:** exact non-www asset CDX request timed out. Querying the www alias yielded the exact non-www asset capture on 16 March; retrieved bytes match its digest. No domain analogy: CDX returned the original URL referenced by the retained page.
- **k21:** March–election-day exact asset query returned no rows. Extending to January returned the February record above, whose digest matches the inspected original.
- **k23:** February–election-day www homepage query returned no rows; January–election-day non-www query returned www originals. The 17 January replay timed out; 3 January replay succeeded and references the exact SVG. A zero-row query is scoped to that query, not a nonexistence finding.
- **k25 Israel Beiteinu:** [1 October 2022 page](https://web.archive.org/web/20221001082757id_/https://beytenu.org.il/) now replayed and inspected, referencing `https://beytenu.org.il/wp-content/themes/nisarg/images/logo_260.png`. August–1 November exact-asset CDX returned no rows. Broadening to 2020–2022 found different digests on 28 August 2020 (`NVZH2RFPWK4PUJSIOSJVTXJQ5D5SPS7I`) and **23 November 2022** (`WAMHMSSC2DZG732OVTQ73BAWB5WZZRFL`). Neither proves the 2022 campaign rendering; no image was assigned or claimed absent.

Exact failed replay URLs for the parent / Firecrawl (both timed out, not 429; an image replay is listed for completeness though Firecrawl cannot return its bytes):

- HTML: https://web.archive.org/web/20200117093342id_/https://www.likud.org.il/
- Image: https://web.archive.org/web/20190913072941id_/https://www.likud.org.il/images/layout_images/logo.svg

The exact failed index query was `https://web.archive.org/cdx/search/cdx?url=likud.org.il%2Ftemplates%2Fjoomla-israel%2Fimages%2Flogo-likud-he-il.png&from=20150201&to=20150317&output=json&fl=timestamp%2Coriginal%2Cstatuscode%2Cdigest%2Clength&filter=statuscode%3A200&collapse=digest`. It is not a failed HTML capture. Other historical replay failures in earlier sections were not all retried and remain historical, not this pass's failures.

### Current website-era gaps by election

Missing winner letters below are mechanically recomputed; no other prior exclusions are reversed. Constituent and nonwinner gaps retain the exact identity inventories and reasons above. K26 remains missing ג, ט, עם; its narrower combined-list/official-origin constraints remain unresolved. K14 and k18–k19 received no new source acquisition; no new k26 source was inspected.

| Election | Hosted winners | Still-missing winner letters | Missing winning-list constituents |
|---|---:|---|---:|
| k14 | 2/11 | אמת, ב, ג, ו, ט, כן, מרצ, ע, שס | 12/12 |
| k15 | 2/15 | אמת, ב, ג, ד, ו, יש, כן, ל, ם, מחל, מרצ, עם, שס | 12/12 |
| k16 | 2/13 | ב, ג, ד, ו, יש, כן, ל, מחל, מרצ, עם, שס | 14/14 |
| k17 | 1/12 | אמת, ג, ד, ו, זך, כן, ל, מחל, מרצ, עם, שס | 11/11 |
| k18 | 2/12 | אמת, ב, ג, ד, ו, ט, כן, ל, עם, שס | 12/12 |
| k19 | 3/12 | אמת, ג, ד, ו, טב, מחל, עם, פה, שס | 9/9 |
| k20 | 2/10 | אמת, ג, ודעם, טב, ל, מרצ, פה, שס | 11/11 |
| k21 | 2/11 | ג, דעם, ום, טב, כ, ל, מרצ, פה, שס | 14/14 |
| k22 | 3/9 | אמת, ג, ל, מרצ, פה, שס | 17/19 |
| k23 | 2/8 | ג, ודעם, טב, ל, פה, שס | 17/18 |
| k24 | 5/13 | אמת, ב, ג, ודעם, ט, ל, מרצ, שס | 11/12 |
| k25 | 3/10 | אמת, ג, ום, ט, ל, עם, שס | 10/11 |
| k26 | 8/11 | ג, ט, עם | 11/19 |

No additional constituent evidence was promoted from the new whole-list headers. Notable nonwinners were not reached because seat-winning acquisition remained the priority; existing nonwinner coverage and unresolved Jewish Home 2022 candidates remain unchanged. The next evidence needed is the exact separately dated original for each missing identity; a live mark or general family resemblance does not resolve it.

### Verification for this continuation

`python3 scripts/validate-party-logos.py` passed: **26 overlays, 111 source records, 62 assets, 66 hosted entries**, zero download-unavailable and six unresolved entries. Separately recomputed each of the six original SHA-1 values from retained bytes, found the exact matching CDX timestamp/URL/digest row, and checked each CDX timestamp is on or before polling day. `npx tsc --noEmit -p .` passed. `npx vitest run` passed: **57 files, 483 tests**. `node scripts/build-datasets.ts` passed; its repeat wrote **zero** files. Existing full station reconciliation is skipped when station scratch is absent; retained evidence/locality checks still run.

The model digest alone was re-recorded to `0c04cd08ac86f05d9512fc9cce2600566ec6d799048b692f524466e643898ec1` with a one-line justification. All 26 election datasets compare equal to baseline after recursively removing `logo` and `builtAt`; only k20–k25 election datasets changed. Allocation, analysis, validation and rules digests are unchanged. No application source or election results were changed. Commit is local only; no push or merge.

## All-winners acquisition run — 4 November 2026

Scope: k1–k25 official seat winners and k26 winners derived by the app's historical
allocation of the retained CEC **3 November 2026 final count**, source
`k26-localities-csv` (`data/raw/k26/expc.csv`), with official surplus agreements.
K26 has no gazetted officialSeats; computed seats are not labelled gazetted results.
`scripts/research/logo-coverage.py` now counts actual built `list.logo` fields for
all 26 elections, rather than overlay eligibility, and derives k26 winners from
the app allocation instead of bloc membership. The measured starting point is
**48/308**, not the task brief's 49/335. K1–k25 account for 297 winners and 40 logos;
k26 adds eleven winners and eight logos. No results were changed.

### Batch 1: k25 Labor

Accepted **one fair-use identification** whole-list logo; no new free-licence or
constituent mark. Inspected [official October 28 homepage capture](https://web.archive.org/web/20221028055705/https://havoda.org.il/):
three theme-site-logo images reference `wp-content/uploads/2022/05/logo.svg`.
The [October 27 original](https://web.archive.org/web/20221027193950id_/https://havoda.org.il/wp-content/uploads/2022/05/logo.svg)
computes to CDX digest `2P6YFOCMF2MEAUC3AYPSYKGXGEQ5HE73`. Rendered locally:
navy העבודה with red wheat emblem. Original SVG preserved byte-for-byte.
The dated official header and matching campaign-period bytes support **high**
confidence for k25 only; official page, asset and CDX are one evidence family.
Raw HTML, asset and CDX are retained under `data/raw/logos/k25/`; all have SHA-256
manifest entries, and overlay/source card share `rawEvidence` and `digestProof`.
This replaces Labor's prior secondary-only unresolved proposal.

The builder consumes durable public logo inputs; it does not generate artwork.
The accepted SVG was copied unchanged from retained raw bytes into `public/logos/`,
following the existing batch convention. `node scripts/build-datasets.ts`
regenerated public data and source manifests; no public dataset was hand-edited.

Only k25 logo and builtAt differ across the 26 election datasets, verified by a
recursive comparison to HEAD omitting those keys. The expected model digest changed
as a result; the other four differential families passed unchanged. Locked dependencies
installed with npm ci; source/artwork preserved, temporary downloads and local renders
under `.backup-scratch/logo-all/`. Local Chromium needed sandbox escalation to launch
(`sandbox_host_linux.cc:41`, Operation not permitted); no external page was automated.

### Batch 2: k24 Labor and Yisrael Beiteinu

Accepted **two additional fair-use identification whole-list logos** with high
confidence and separate campaign-period CDX byte proofs:

| Identity | Inspected official page UTC | Exact original UTC | Computed base32 SHA-1 |
|---|---|---|---|
| k24 אמת Labor | 20210317095134 | 20210201193153 | `5ET572XWZDN7XG2ZQ5SOV3VAP2VYG2D3` |
| k24 ל Yisrael Beiteinu | 20210317203513 | 20210317203517 | `NVZH2RFPWK4PUJSIOSJVTXJQ5D5SPS7I` |

The page, asset and CDX URLs are recorded verbatim in the corresponding overlay,
source card and raw manifest. Labor's header is navy lettering with a red wheat
symbol; Yisrael Beiteinu's is a blue roof-like line above ישראל ביתנו and its
Avigdor Lieberman subline. Both original PNGs are retained, with proportional
256-pixel PNG derivatives. Regenerate using Chromium headless shell **1248**
(locked Playwright), load the retained PNG locally, canvas drawImage at rounded
proportional dimensions bounded by 256 and toDataURL('image/png'). No recolouring
or cropping. Labor's HTML arrived gzip encoded and was decoded before retention;
its manifest hashes the retained decoded HTML. Same official-site evidence family
per party/year; CDX establishes byte identity, not independent historical testimony.

Supplementary k21 Labor evidence was also acquired: official page 20190327095556
and original 20190326074701, with the same independently recorded campaign digest
`5ET572XWZDN7XG2ZQ5SOV3VAP2VYG2D3`. **K21 was already covered** by the free-licence
Commons asset. Its existing asset, credit and rights are preserved. The extra
primary evidence is retained as an unselected source card, not a new displayed
logo and not an additional coverage claim. During preparation a temporary replacement
left the existing public asset unreferenced; the validator caught this, and the
existing overlay was restored before committing. No free-licence entry was converted
to fair use.

Batch 1 verification: 57 Vitest files / 484 tests passed, TypeScript passed,
production Vite build passed. Batch 2 verification uses the same commands and
records only the intended logo/builtAt model-digest change; every dataset's other
fields compare equal to the previous commit. The supplemental k21 manifest does
not change results or credit. No constituents were added in either batch.

### Batch 3: Yisrael Beiteinu k21–k23

Accepted **three fair-use identification whole-list logos** (no free-licence or
constituent additions). All three official campaign pages reference `logo2.png`,
which differs from k24's `logo_260.png`. The older original includes substantial
transparent space and a white backdrop shape; neither was cropped or redrawn.

| Election | Inspected page UTC | Campaign-period CDX UTC | Actual original replay UTC |
|---|---|---|---|
| k21 | 20190326154413 | 20190329052747 | 20200215055455 |
| k22 | 20190914092026 | 20190604135636 | 20200215055455 |
| k23 | 20200212042350 | 20200119220419 | 20200215055455 |

All independently dated CDX asset records match computed base32 SHA-1
`QE4JF5VNYWOJQARKBMMNV73PY2IT5KU5`. The **June 4** capture is within the renewed
campaign after the May 30 dissolution; it is earlier than the preferred final
weeks. The separately inspected September 14 header supplies near-election use.
For k21/k22 the actual downloaded original is a **later** replay; byte identity to
their own pre-election digest, rather than design similarity, supports assignment.
The 2020 replay is before k23 polling day. High confidence under the existing
later-replay rule. Each overlay has its own source card, retained HTML/original/CDX
and SHA-256 records. URLs and actual replay versus index timestamps are explicit.
Original PNG bytes are identical in the three raw folders; display PNGs use the
same proportional Chromium/canvas recipe as batch 2. Evidence families remain
the official party site per campaign year, not independent historical witnesses.

### New searches, failures and unresolved candidates

This run used Jina search/read for discovery and Commons/NLI inspection; plain
HTTP used the required project User-Agent, without an email. Archive requests
were serial, at least 3.5 seconds apart within each acquisition batch. No 429,
Retry-After, proxy, CAPTCHA solving or challenge bypass occurred. No Apify runs
or paid retrievals were used (**$0 Apify spend**). The initial sandbox DNS failure
for `web.archive.org` was resolved by authorized network execution. Search snippets
are discovery only, never campaign proof. Incidental excluded-site links on Commons
were not followed or relied on.

| Scope / search record | Inspected evidence / route | Outcome |
|---|---|---|
| k25 Shas: Jina query `שס אתר רשמי בחירות 2022 לוגו`; official homepage CDX August–November | [October 16 official capture](https://web.archive.org/web/20221016093023id_/https://shas.org.il/) references `https://shas.org.il/wp-content/uploads/2021/05/לוגו.png` | Exact asset August–November CDX returned no rows. Broadening to January–November returned only **20220119024745**, digest `JXKJV7TMPGJUHQPNELGDZN3L6EAAHTWQ`. Retried without collapse: same sole row. The January PNG downloaded, but no campaign-period byte proof. Not promoted. |
| Shas earlier elections and k26 | `https://web.archive.org/cdx/search/cdx?url=shas.org.il/&from=20150101&to=20210323&output=json&fl=timestamp,original,statuscode,digest&filter=statuscode:200&collapse=timestamp:6` and September–October 27, 2026 homepage query | Empty results for these URL/date scopes, not evidence that captures or logos do not exist. K26 Shas was already covered. |
| Labor 2022 discovery | Requested `https://web.archive.org/web/20221031234343id_/https://havoda.org.il/` | Redirected to **20221102080814**, after polling day; rejected as campaign-date evidence. Used actual indexed October 28 capture instead. |
| Labor 2021 broad asset discovery | `https://web.archive.org/cdx/search/cdx?url=havoda.org.il/*logo*&from=20210201&to=20210323&output=json&fl=timestamp,original,statuscode,digest,length&filter=statuscode:200&collapse=urlkey` | 35-second timeout. Exact www header URL query succeeded; accepted batch above. |
| Yisrael Beiteinu 2021 original | `https://web.archive.org/web/20210317203517id_/https://beytenu.org.il/wp-content/themes/nisarg/images/logo_260.png` | 35-second timeout, then backed-off retry succeeded; no outstanding download failure. |
| Yisrael Beiteinu 2019–2020 discovery | CDX for `beytenu.org.il/wp-content/themes/nisarg/images/logo_260.png`, March 2019–March 2, 2020 | Zero rows. Inspected actual page headers: older `logo2.png` path. Separate exact-asset campaign queries succeeded as above. |
| k26 UTJ: Jina query `יהדות התורה 2026 אתר רשמי לוגו` | CEC candidate-list page and IDI/secondary discovery results | No official campaign artwork inspected; no assignment. Existing combined-list and separate-constituent gaps persist. |
| k25 Labor/UTJ/Shas/Ra'am/Hadash Commons discovery | Queries `site:commons.wikimedia.org Shas logo 2022`, `site:commons.wikimedia.org "Labor" "2022" logo`, `site:commons.wikimedia.org "Hadash" "2022" logo`, `site:commons.wikimedia.org "Raam" logo election` | Commons HaAvoda Logo.svg is January 2019 recreation, not 2022 campaign proof. Raam logo 2021.svg records June 2022 conversion with conflicting PD/fair-use/structured licence cues: not extended to 2022. Logo Hadash Ta'al.png dates to October 2023, credit mentions fair use despite CC BY-SA: no 2022/2026 assignment. Shas file discovery provides no campaign date. |
| k1 Fighters List: Jina queries `site:commons.wikimedia.org "FightersList" "1949"`, `site:nli.org.il "700129128"` | [Commons FightersList.png](https://commons.wikimedia.org/wiki/File:FightersList.png), credited NLI legacy viewer `https://web.nli.org.il/sites/NLI/English/digitallibrary/Pages/Viewer.aspx?presentorid=NNL_Ephemera&DocID=NNL_Ephemera700129128` | Commons caption says 1949 but file creation is 2020; NLI original returned **410 Gone**. Exact catalogue-ID search returned no results. Dated original not inspected; left absent. |
| k11 Morasha: inspect Commons Morasha.png; query `site:nli.org.il "700127850"` | [Commons Morasha.png](https://commons.wikimedia.org/wiki/File:Morasha.png); legacy NLI `https://web.nli.org.il/sites/nli/english/digitallibrary/pages/viewer.aspx?presentorid=NNL_Ephemera&DocID=NNL_Ephemera700127850` | Commons period caption 1984–1988 is not a dated campaign original. NLI **410 Gone**; exact catalogue-ID search empty. No assignment. |
| Early-election NLI discovery: `site:nli.org.il "בחירות" "מפא" "1951" כרזה` | [NLI 1951 election page](https://www.nli.org.il/he/discover/israel/elections/1951) | Jina returned **Just a moment…**, empty body. Stopped at challenge, no bypass. |
| Early Mapai: `site:commons.wikimedia.org "Mapai" "1949" logo`, `site:nli.org.il "בחירות 1949" "מפאי" "כרזה"` | Discovery surfaced Mapai Logo 1950.svg and a July 1949 newspaper result | Neither proves January 1949 campaign use; no original inspected or asset assigned. |
| Early General Zionists: queries `site:commons.wikimedia.org "General Zionists" "1951" logo` and `site:commons.wikimedia.org "General Zionists" "logo"` | [General Zionists-1.png](https://commons.wikimedia.org/wiki/File:General_Zionists-1.png) description inspected | Says campaign material, but dates recreation to January 2021 without a campaign year. No assignment to k1–k4. |
| Early Progressive Party: queries `site:commons.wikimedia.org "Progressive" "Israel" "1955" logo`, `site:commons.wikimedia.org "Progressivit"` | [Progressivit.png](https://commons.wikimedia.org/wiki/File:Progressivit.png) description inspected | No qualifying election date established. Not assigned to k1–k4. |
| Hazit Datit.png | Commons description inspected | Describes Jewish National Front; not evidence for early United Religious Front. Rejected identity substitution. |

Other previously enumerated missing identities retain their earlier per-election
search scope and reasons above. **They were not all newly searched in this run.**
This is a six-logo acquisition and evidence handoff, not an exhaustive completion
of all historical source families. No absence-of-logo conclusion follows from
an unsearched identity, empty index query, inaccessible original or missing licence.

### Measured coverage before → after, all elections

| Election | Winners | Before | After | Remaining missing winner letters |
|---|---:|---:|---:|---|
| k1 | 12 | 1 | 1 | א, ב, ח, טו, יד, ל, מ, ס, פ, צ, ק |
| k2 | 15 | 0 | 0 | א, ב, ג, ד, ה, ח, יד, ל, מ, נ, סצ, ע, פ, צ, ק |
| k3 | 12 | 0 | 0 | א, ב, גד, ח, יד, מ, נ, ע, פ, צ, ק, תו |
| k4 | 12 | 0 | 0 | א, ב, גד, ח, יא, מ, ע, פ, צ, ק, רא, תו |
| k5 | 11 | 0 | 0 | א, ב, ג, ד, ח, יא, ל, מ, ק, רא, תו |
| k6 | 13 | 1 | 1 | את, ב, ג, ד, ו, חל, יא, לע, מ, ק, רא, ש |
| k7 | 13 | 0 | 0 | אמת, ב, ג, ד, ו, חל, ט, יא, לע, עמ, ק, רא, ש |
| k8 | 10 | 0 | 0 | אמת, ב, גד, ו, חל טעם, לע, עא, קנ, רא, רצ |
| k9 | 13 | 4 | 4 | ב, ג, ד, ו, ים, לע, מחל, רצ, ש |
| k10 | 10 | 1 | 1 | אמת, ב, ג, הן, ו, מחל, ני, רצ, ת |
| k11 | 15 | 2 | 2 | אמת, ב, ג, הן, ו, יש, כך, מחל, ני, עי, פ, רצ, שס |
| k12 | 15 | 1 | 1 | אמת, ב, ג, הן, ו, ט, מחל, ע, עץ, פ, ץ, רצ, שס, ת |
| k13 | 10 | 1 | 1 | אמת, ב, ג, ו, ט, מחל, ע, ץ, שס |
| k14 | 11 | 2 | 2 | אמת, ב, ג, ו, ט, כן, מרצ, ע, שס |
| k15 | 15 | 2 | 2 | אמת, ב, ג, ד, ו, יש, כן, ל, ם, מחל, מרצ, עם, שס |
| k16 | 13 | 2 | 2 | ב, ג, ד, ו, יש, כן, ל, מחל, מרצ, עם, שס |
| k17 | 12 | 1 | 1 | אמת, ג, ד, ו, זך, כן, ל, מחל, מרצ, עם, שס |
| k18 | 12 | 2 | 2 | אמת, ב, ג, ד, ו, ט, כן, ל, עם, שס |
| k19 | 12 | 3 | 3 | אמת, ג, ד, ו, טב, מחל, עם, פה, שס |
| k20 | 10 | 2 | 2 | אמת, ג, ודעם, טב, ל, מרצ, פה, שס |
| k21 | 11 | 2 | 3 | ג, דעם, ום, טב, כ, מרצ, פה, שס |
| k22 | 9 | 3 | 4 | אמת, ג, מרצ, פה, שס |
| k23 | 8 | 2 | 3 | ג, ודעם, טב, פה, שס |
| k24 | 13 | 5 | 7 | ב, ג, ודעם, ט, מרצ, שס |
| k25 | 10 | 3 | 4 | ג, ום, ט, ל, עם, שס |
| k26 | 11 | 8 | 8 | ג, ט, עם |

**Total: 48/308 → 54/308. Six new logos, all fair-use identification; zero new free-licence logos.**

### Remaining gaps grouped by evidence needed

- **Dated original inaccessible:** k1 טו Fighters List and k11 עי Morasha (410 NLI upstream); General Zionists k1–k4 צ and Progressive Party k1–k4 פ lack a verified campaign year on the inspected Commons descriptions. Early NLI discovery also hit a challenge. Their exact new searches appear above.
- **Campaign-period asset bytes unresolved:** k25 שס Shas (October page, January-only asset digest); k25 ל Yisrael Beiteinu retains the earlier post-election-byte gap. No backwards propagation from k24.
- **Combined-list identity / official origin unresolved:** k26 ג UTJ, ט Religious Zionism–Zehut and עם Ra’am; prior constituent-only evidence does not fill the joint-list gaps. Hadash–Ta’al k25 ום has an unsuitable later Commons candidate with conflicting rights credit. Prior modern joint-list exclusions remain in force.
- **Earlier research gaps, not newly resolved or exhaustively re-searched:** all other letters in the table. The preceding per-election sections list their names, prior source cards and bounded search scope. These include undated emblems, current-only marks, secondary-only reproductions, inaccessible captures and identities for which no qualifying source was acquired. Treat these as open research, not verified nonexistence.

Re-run `python3 scripts/research/logo-coverage.py` to recover the complete identity inventory. Constituents and nonwinners remain unchanged. The complete 254 missing-list inventory is the table above; reasons are scoped research outcomes, not definitive historical classifications.

### Final verification and handoff

All three batches ran `npx vitest run`, `npx tsc -p tsconfig.json --noEmit`,
and `npx vite build` successfully before their commits. Final Vitest: **57 files,
484 tests passed**. Logo validator: **26 overlays, 118 source cards, 68 assets,
72 hosted entries** (includes constituents and nonwinners), five unresolved
source-only proposals, zero download-unavailable. The model digest alone is now
`f0db2028cfd9bc17d6473b9870e42a2ce7f416ff213e4c75360c4aded1a1981e`;
allocation, analysis, validation and rules digests remain unchanged. Each model
update followed a recursive comparison showing all 26 datasets equal to the
previous commit after omitting logo and builtAt. Independent final checks recomputed
all six originals' SHA-1 base32 values, found exact URL/timestamp/digest CDX rows,
checked their dates against polling day, and checked the actual HTML references.
The repeat dataset build wrote **zero** files (38 unchanged). Existing station
reconciliation limits in the builder still apply where station scratch is absent.
No runtime/frontend source, vote, seat, candidate or rules data changed.

The final `PW_PORT=5321 npx playwright test` passed: **43 tests in 21.8 seconds**. Everything is local on branch `t3/ec578b65`; no push,
merge, deployment or live-site change. **254 whole-list identities remain without
logos**; the complete coverage goal is not achieved. The table and reason/search
records above are the continuation handoff, with unsearched scope explicitly marked.


## F9/F13 continuation — 5 November 2026

Principles: a language choice applies to every rendered list/party label, including
menus, exports and change descriptions. A component party retains its identity when
split from an alliance. A missing logo is an unresolved research gap, not proof that
no historical mark existed.

The existing per-election `data/meta/kN.json` lists now carry `englishName` where an
English label was absent: `label`, `kind: transliteration`, `sourceId` referencing
the retained Hebrew record, and an explicit unofficial/shortened-label note.
`applyMeta` carries that provenance into the dataset. Sources exposes the list of
unofficial names. Existing common-use labels retain their original app-annotation
status; none was promoted to official English without evidence. Legacy/custom names
and unmatched sponsor/faction labels have conservative consonantal romanisation;
unpointed Hebrew cannot establish their vowels. This is labelled in Sources.

Official-English acquisition attempts, with the project User-Agent, serial plain
HTTP, no bypass or proxies:

- `https://votes25.bechirot.gov.il/en/nationalresults`: HTTP 404.
- `https://main.knesset.gov.il/EN/mk/apps/election/Pages/ElectionResults.aspx?KnessetID=25`:
  HTTP 247/challenge body; stopped, no circumvention.
- `https://www.gov.il/apps/elections/elections-knesset-17/eng/Results/main_results_eng.html`:
  HTTP 403; stopped. Official-source discovery did not establish usable new English
  names. These bounded attempts are **not** an exhaustive official-English-source
  audit for all 26 elections. Official-name upgrades remain open research.

No new external image bytes were accepted. The existing verified logo catalogue is
reused for exactly matching English party identities (or a matching stable component
party id). Whole-list fallbacks only use whole-list marks; a constituent mark never
stands for an alliance. The nearest source-election date wins, with the earlier
source preferred on a tie; a later source can therefore identify an earlier party,
without claiming it was used in that earlier campaign. Every reused reference
carries a visible year, original source URL, rights notice and attribution. Existing
campaign-specific references are unchanged. Sources explains the year convention.
No source card is invented and no existing rights notice is changed.

Meretz on the 2026 Democrats list now uses the retained 2013 emblem, visibly labelled
2013. Its source is [Commons Meretz Logo.svg](https://commons.wikimedia.org/wiki/File:Meretz_Logo.svg),
a labelled secondary source dating the design to December 2012. Reinspection found
an August 2022 optimisation entry, which is **not** evidence of a new 2022 campaign
design. The existing 2013 assignment remains the evidence date. A split into named
component parties carries their own English label/logo; arbitrary split groups do
not inherit an alliance emblem. Unresolved component identities use initials with a
colour border, never bare squares or the alliance's shared ballot letters.

### Coverage (all lists, including nonwinners; component appearances, not unique parties)

| Election | English labels before → after / lists | List logos before → after | Component logos before → after / appearances |
|---|---:|---:|---:|
| k1 | 12 → 21 / 21 | 2 → 3 | 0 → 2 / 7 |
| k2 | 15 → 17 / 17 | 0 → 1 | 0 → 0 / 0 |
| k3 | 14 → 18 / 18 | 0 → 1 | 0 → 1 / 4 |
| k4 | 13 → 24 / 24 | 0 → 1 | 0 → 1 / 2 |
| k5 | 12 → 14 / 14 | 0 → 1 | 0 → 0 / 0 |
| k6 | 13 → 17 / 17 | 1 → 3 | 0 → 0 / 4 |
| k7 | 13 → 16 / 16 | 0 → 1 | 0 → 1 / 4 |
| k8 | 13 → 21 / 21 | 0 → 2 | 0 → 2 / 11 |
| k9 | 16 → 22 / 22 | 5 → 5 | 0 → 1 / 12 |
| k10 | 19 → 31 / 31 | 2 → 5 | 0 → 1 / 7 |
| k11 | 18 → 26 / 26 | 3 → 6 | 0 → 1 / 11 |
| k12 | 17 → 27 / 27 | 2 → 4 | 0 → 1 / 6 |
| k13 | 25 → 25 / 25 | 1 → 4 | 0 → 2 / 6 |
| k14 | 20 → 20 / 20 | 2 → 5 | 0 → 4 / 12 |
| k15 | 31 → 31 / 31 | 2 → 9 | 0 → 3 / 12 |
| k16 | 15 → 27 / 27 | 2 → 7 | 0 → 4 / 14 |
| k17 | 14 → 31 / 31 | 2 → 9 | 0 → 2 / 11 |
| k18 | 32 → 33 / 33 | 2 → 8 | 0 → 4 / 14 |
| k19 | 32 → 32 / 32 | 3 → 7 | 0 → 4 / 9 |
| k20 | 21 → 26 / 26 | 3 → 8 | 0 → 5 / 15 |
| k21 | 38 → 43 / 43 | 5 → 9 | 1 → 8 / 18 |
| k22 | 13 → 32 / 32 | 4 → 8 | 3 → 9 / 19 |
| k23 | 10 → 30 / 30 | 3 → 9 | 3 → 9 / 18 |
| k24 | 15 → 39 / 39 | 7 → 12 | 2 → 7 / 12 |
| k25 | 16 → 40 / 40 | 4 → 9 | 1 → 5 / 14 |
| k26 | 15 → 38 / 38 | 10 → 12 | 10 → 14 / 25 |

Totals: **472/701 → 701/701** English labels, comprising 472 existing app-assigned
labels and **229 new unofficial shortened transliterations**. Logo refs:
**65/701 → 149/701** whole lists; **20/267 → 91/267** component appearances. All
84 + 71 additions are nearest-period reuse, **zero newly verified election-day
marks**. Remaining gaps: 552 whole lists and 176 component appearances. Their
complete identity inventory is reproducible with the existing
`python3 scripts/research/logo-coverage.py` (now reports all-list/name/component
coverage and missing identities as well as the earlier winner subset). No claim of
nonexistence or exhaustive new acquisition is made for those gaps.

### Verification and reproduction

`tests/names-coverage.test.ts` checks English labels/provenance in every election,
legacy fallback and preservation of Meretz's dated logo through a party split.
`tests/e2e/name-logo-coverage.spec.ts` checks all elections' partner menus and writes
60 captures for k26/k25/k12/k1/k21 × Hebrew/English × light/dark × 1500/1024/390,
including the visible Meretz image/year. Captures are disposable under
`.backup-scratch/feedback-data/after/`; recreate with the production build and
`PW_PORT=5483 npx playwright test tests/e2e/name-logo-coverage.spec.ts`.
Shared preview returned ERR_CONNECTION_REFUSED twice before local serving was
available; the brief's local Playwright fallback was used.

All 26 datasets recursively match the baseline after omitting only `shortEn`,
`englishName`, `logo` and `builtAt`; family dataset hash pins were refreshed without
changing research classifications or totals. Current model code with baseline input
datasets passed all five original differential digests. With the new presentation
inputs, only the model digest changes; allocation, analysis, rules and validation
remain unchanged. Dataset rebuilding retains the existing documented omission of
full polling-station reconciliation when that scratch source is unavailable.

Owner clarification during this pass: Hebrew secondary subtitles beside an English
name are welcome. The restriction is **Hebrew-only identity in English mode**.
The existing Hebrew official-name subtitle and original-name editing fields are
preserved; primary labels, menus and exports use English.

Final checks for this continuation: TypeScript and production build passed;
**740 unit tests** and **239 full browser tests** passed (two browser workers).
After the final source-title/sponsor-label rendering adjustment, all **6 targeted
browser tests** passed again, including CSV output and Sources provenance; the 60
captures were regenerated. Logo validator: 26 overlays, 127 source cards, 77 assets,
85 original hosted assignments. Family validator: 9 presets. Repeat dataset build:
**0 written, 38 unchanged**. Existing large-bundle warning remains advisory.

Outside this workstream: side-panel headers still scroll out of view (F1, owned by
another worker), including at 1024px; the name/logo fixes do not alter panel layout.
Locality names still have Hebrew-only paths in English mode (`Panels.tsx` locality
table and `LocalityMap.tsx` unmapped rows/fallbacks); this task's data scope is list
and party identity. Candidate personal-name translation is likewise outside this
list/party task. No new owner preference decision is required.
