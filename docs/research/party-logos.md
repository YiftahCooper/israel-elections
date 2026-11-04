# Party logos by election — research and source archive

Research objective: supply election-specific list and constituent emblems for the explorer without substituting later designs or redistributing unverified rights. As of 4 November 2026. This is a bounded research pass, not a complete logo catalogue. The source policy in README.md and docs/DATA.md applies.

## Reading coverage

“Hosted” counts whole seat-winning lists with a local, eligible logo. “Dated external” counts whole-list candidates with date evidence but a failed download; these are not display-ready. “Rights only” counts source-only candidates requiring rights clearance, and does not count as coverage. Constituent emblems never count as whole-list coverage. Missing means no qualifying emblem was verified here, not that the party had no emblem.

Seat-winning denominators come from public/data/kNN.json officialSeats; k26 has null officialSeats, so the existing data/meta/k26.json seat transcriptions supply that denominator (reported results, pending official gazettement). The research does not alter or independently verify those results.

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
| k17 · 2006-03-28 | 12 | 0 | 1 | 0 | 0 |
| k18 · 2009-02-10 | 12 | 1 | 1 | 0 | 0 |
| k19 · 2013-01-22 | 12 | 0 | 3 | 1 | 0 |
| k20 · 2015-03-17 | 10 | 0 | 1 | 0 | 0 |
| k21 · 2019-04-09 | 11 | 0 | 1 | 0 | 0 |
| k22 · 2019-09-17 | 9 | 0 | 2 | 0 | 0 |
| k23 · 2020-03-02 | 8 | 0 | 1 | 0 | 0 |
| k24 · 2021-03-23 | 13 | 0 | 3 | 1 | 0 |
| k25 · 2022-11-01 | 10 | 0 | 1 | 5 | 0 |
| k26 · 2026-10-27 | 8 | 2 | 0 | 4 | 0 |

## Licence and retrieval outcome

21 hosted entries; 22 dated freely licensed entries without a local download; 14 source-only unresolved entries.

| Hosted licence | Assets/entries |
|---|---:|
| CC BY-SA 3.0 | 3 |
| CC BY-SA 4.0 | 5 |
| Public domain (PD-textlogo) | 13 |

No source-only image with unverified or conflicting rights was downloaded. Commons supplied licence declarations; these are not legal opinions or proof of third-party ownership. Hosted raster derivatives are PNG, maximum 256 pixels, and every asset is below 60,000 bytes. Original and final hashes are recorded.

Wikimedia returned HTTP 429 after the first ten downloads, with Retry-After: 600. A second batch was attempted after the required delay at one request per second; some files succeeded, then HTTP 429 with another 600-second delay recurred. Further retrieval was stopped. Metadata and licence evidence were retrieved separately through Commons’ public API. Any final download-unavailable entries identify retrieval failure, not a copyright prohibition. Two 2026 logos were retrieved directly from the official party origins cited by Commons; their assetSourceUrl records the actual download. No proxy, challenge bypass, or runtime hotlink is provided.

## Uncertainty and rejected candidates

- The Democrats 2026 official SVG contains white lettering and requires a dark background (displayBackground: dark). It has not been recoloured.
- All accepted assignments have medium confidence. Commons community descriptions, period statements and campaign dates are evidence, but cited NLI originals and campaign videos were generally not independently inspected. A strict independently verified-primary-only policy would reject these until those underlying items are checked.
- A file’s recreation/upload date is distinguished from its stated historical period. The Yesh Atid SVG’s 2012–2014 creation interval does not prove use on election day in 2013; it is omitted. A January 2021 news report confirms a different campaign design, retained source-only.
- Together’s April/July 2026 variants were superseded before polling day according to the election-day design review. Neither is assigned to k26. A source-only reference documents the final branding.
- Likud’s continuing flag-like letter is not evidence that every campaign lockup, subheading or glyph spacing was identical. Its 2009 design is kept separate from later campaigns. The combined Likud–Yisrael Beiteinu candidate has both date and licence ambiguity and remains unresolved.
- Balad’s vector cites both 2006 and 2019 sources, without proving identical rendering; it is assigned only to the dated 2019 constituent, not 2006.
- NatUnionMafdal.png has a mistyped “200d” year. The web fetch failed, but a direct public retrieval of its cited Ynet report succeeded: campaign-launch headline and publication metadata date it to 21 February 2006. The assignment is medium confidence. National Religious Party, Hadash, UTJ and Shas candidates lacking an exact election-use match are likewise not propagated through earlier elections.
- One Nation’s SVG filename says 2002–2005, while its description says 1999–2002 and its cited archive is 2001. It is omitted rather than resolving the conflict by guesswork. The 2003 Am Ehad raster has explicit election evidence.
- The Kadima 2005 GIF is not assigned automatically to 2006, nor the 2021 Blue and White variant to 2019. General website logos, ballot-paper photographs and regional variants are not sufficient for national election branding.
- CC BY-SA claims paired with a fair-use upstream credit are not treated as permission. Source-only news/design references have no verified free image licence; no logo files from those pages are retained.
- Nonwinning lists are outside the primary coverage target. Three useful explicitly dated extras are included: Shinui 2006, New Right April 2019 and Amcha Yisrael 2026.
- Source counts below are inspected records, not independent corroborating sources. Commons mirrors, traced derivatives and the underlying artefact belong to the same evidence lineage. Search-result snippets were only discovery leads.

## Conclusion map

| Conclusion | Status and evidence | What would change it |
|---|---|---|
| Local files are licensed, small and linked to valid election identities | Mechanically verified by scripts/validate-party-logos.py; licence claims in sources.json | A conflicting rights notice or changed file hash |
| Historical assignments have a recorded date/period basis | Medium; each inUseEvidence maps to evidenceId and inspected source revision | A dated original showing a different design |
| Modern coverage is incomplete | Explicit gaps in the table and per-election lists | Newly verified dated/licensed variants or successful outstanding downloads |
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

Hosted winners: None.

Not locally covered winners: כן — Kadima; אמת — Labor–Meimad; שס — Shas; מחל — Likud; ל — Yisrael Beiteinu; טב — National Union–NRP; זך — Gil (Pensioners); ג — United Torah Judaism; מרצ — Meretz; עם — Ra’am–Ta’al; ו — Hadash; ד — Balad.

Evidence references: [commons-101247293](https://commons.wikimedia.org/wiki/File:Shinui_2006.png), [commons-83570887](https://commons.wikimedia.org/wiki/File:NatUnionMafdal.png).

### k18 · 2009-02-10

Hosted winners: מרצ — Meretz.

Not locally covered winners: כן — Kadima; מחל — Likud; ל — Yisrael Beiteinu; אמת — Labor; שס — Shas; ג — United Torah Judaism; עם — Ra'am–Ta'al; ט — National Union; ו — Hadash; ב — Jewish Home; ד — Balad.

Evidence references: [commons-52999529](https://commons.wikimedia.org/wiki/File:Newmovemeretz.gif), [commons-5635696](https://commons.wikimedia.org/wiki/File:Likud_Logo.svg).

### k19 · 2013-01-22

Hosted winners: None.

Not locally covered winners: מחל — Likud–Yisrael Beiteinu; פה — Yesh Atid; אמת — Labor; טב — Jewish Home; שס — Shas; ג — United Torah Judaism; צפ — Hatnuah; מרצ — Meretz; עם — Ra'am–Ta'al–Mada; ו — Hadash; ד — Balad; כן — Kadima.

Evidence references: [commons-138448720](https://commons.wikimedia.org/wiki/File:Logo_Likud_Yisrael_Beitenu.png), [commons-36039828](https://commons.wikimedia.org/wiki/File:Logo_Kadima.svg), [commons-39065631](https://commons.wikimedia.org/wiki/File:Hatnuah_logo.svg), [commons-98922399](https://commons.wikimedia.org/wiki/File:Meretz_Logo.svg).

### k20 · 2015-03-17

Hosted winners: None.

Not locally covered winners: מחל — Likud; אמת — Zionist Union; ודעם — Joint List; פה — Yesh Atid; כ — Kulanu; טב — Jewish Home; שס — Shas; ל — Yisrael Beiteinu; ג — United Torah Judaism; מרצ — Meretz.

Evidence references: [commons-39073240](https://commons.wikimedia.org/wiki/File:Kulanu_Kahlon_logo.svg).

### k21 · 2019-04-09

Hosted winners: None.

Not locally covered winners: מחל — Likud; פה — Blue and White; שס — Shas; ג — United Torah Judaism; ום — Hadash–Ta’al; אמת — Labor; ל — Yisrael Beiteinu; טב — Union of Right-Wing Parties; מרצ — Meretz; כ — Kulanu; דעם — Ra’am–Balad.

Evidence references: [commons-76218696](https://commons.wikimedia.org/wiki/File:Israeli_Labor_Party_2019.png), [commons-77001018](https://commons.wikimedia.org/wiki/File:Logo_of_HaYamin_HeHadash.svg).

### k22 · 2019-09-17

Hosted winners: None.

Not locally covered winners: פה — Blue and White; מחל — Likud; ודעם — Joint List; שס — Shas; ל — Yisrael Beiteinu; ג — United Torah Judaism; טב — Yamina; אמת — Labor–Gesher; מרצ — Democratic Union.

Evidence references: [commons-107297670](https://commons.wikimedia.org/wiki/File:Balad.svg), [commons-130829705](https://commons.wikimedia.org/wiki/File:Yamina_logo.svg), [commons-94577687](https://commons.wikimedia.org/wiki/File:Joint_List_logo_2019.svg).

### k23 · 2020-03-02

Hosted winners: None.

Not locally covered winners: מחל — Likud; פה — Blue and White; ודעם — Joint List; שס — Shas; ג — United Torah Judaism; אמת — Labor–Gesher–Meretz; ל — Yisrael Beiteinu; טב — Yamina.

Evidence references: [commons-130826979](https://commons.wikimedia.org/wiki/File:Logo_of_the_Labor-Gesher-Meretz.svg), [commons-146621440](https://commons.wikimedia.org/wiki/File:Agudat_Yisrael_logo_2020.svg).

### k24 · 2021-03-23

Hosted winners: None.

Not locally covered winners: מחל — Likud; פה — Yesh Atid; שס — Shas; כן — Blue and White; ב — Yamina; אמת — Labor; ג — United Torah Judaism; ל — Yisrael Beiteinu; ט — Religious Zionism; ודעם — Joint List; ת — New Hope; מרצ — Meretz; עם — Ra'am.

Evidence references: [commons-100640724](https://commons.wikimedia.org/wiki/File:New_Hope_party_logo.png), [commons-119107430](https://commons.wikimedia.org/wiki/File:Raam_logo_2021.svg), [commons-130826913](https://commons.wikimedia.org/wiki/File:Blue_and_White_logo_2021.svg), [commons-130829740](https://commons.wikimedia.org/wiki/File:Otzma_Yehudit_2021_logo.svg), [srugim-2021-yesh-atid](https://www.srugim.co.il/525439-%D7%94%D7%9C%D7%95%D7%92%D7%95-%D7%94%D7%97%D7%93%D7%A9-%D7%A9%D7%9C-%D7%99%D7%A9-%D7%A2%D7%AA%D7%99%D7%93-%D7%99%D7%90%D7%99%D7%A8-%D7%9C%D7%A4%D7%99%D7%93-%D7%95%D7%96%D7%A8%D7%99%D7%97%D7%94).

### k25 · 2022-11-01

Hosted winners: None.

Not locally covered winners: מחל — Likud; ט — Religious Zionism; שס — Shas; ג — United Torah Judaism; פה — Yesh Atid; אמת — Labor; כן — National Unity; ל — Yisrael Beiteinu; עם — Ra'am; ום — Hadash–Ta'al.

Evidence references: [commons-130829829](https://commons.wikimedia.org/wiki/File:National_Unity_Party_(Israel)_August_2022.svg), [commons-132175789](https://commons.wikimedia.org/wiki/File:Parti_sioniste_religieux_logo_2022.png), [ynet-2022-typography](https://www.ynet.co.il/news/article/syrrbq9jj).

### k26 · 2026-10-27

Hosted winners: אמת — The Democrats; ודם — Joint List.

Not locally covered winners: מחל — Likud; ב — Otzma Yehudit; ג — United Torah Judaism; ט — Religious Zionism–Zehut; דרך — Yashar!; רק — Together (Bennett).

Evidence references: [alef-2026-design](https://alefalefalef.co.il/elections-design-26/), [commons-198464782](https://commons.wikimedia.org/wiki/File:Amcha_Yisrael.svg), [commons-200023341](https://commons.wikimedia.org/wiki/File:Religious_Zionist_Party_logo_2026.png), [commons-200834372](https://commons.wikimedia.org/wiki/File:The_Democrats_(Israel)_logo_2026.svg), [commons-200835377](https://commons.wikimedia.org/wiki/File:Logo_of_The_Reservists.svg), [commons-201669548](https://commons.wikimedia.org/wiki/File:Logo_of_the_Joint_List_(Israel)_2026_(vector).svg).

## Sources — retained archive

92 inspected source records are retained in [sources.json](../../data/meta/logos/sources.json). Stable Commons IDs use the file-page ID, with the exact reviewed revision URL in the JSON. The API exposed file records, not page-reading depth metrics; exhaustive archive search and total search-engine coverage were not measured. No English-language Wikipedia page was opened, cited or used.

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
