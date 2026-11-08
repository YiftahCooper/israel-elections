# Party and list reading links, 1949–2026

Research as of **4 November 2026**. **Partial coverage**, not completion of the owner's
all-lists/all-constituents goal. The data/build/scenario contract is implemented; sources
are attached only where the retained evidence supports the identity and URL. No UI files
were changed. All 701 lists and all constituent identities have an overlay entry, including
withdrawn lists and lists below the threshold. Empty arrays and kind-specific reasons
are intentional gaps, not findings that sources do not exist.

## Method and evidence

Question: where can a reader find this electoral list's or constituent party's own voice,
and an independent account, for this particular election? Acceptance requires a verified
URL and an unambiguous identity; historical partisan material also requires election-period
evidence. Preference order follows decision 0093 and the owner's source policy. Elections
were queued newest first. Broad IDI platform/neutral lookup provides older coverage without
claiming that the newer-election acquisition programme is complete.

- **Live 2026 official sites:** inspected homepage titles and retained SHA-256, resolved URL,
  size and retrieval date in `data/raw/party-links/url-checks.json`. Previously reviewed official
  origins in the biography/logo research guided discovery; they are the same evidence family,
  not independent corroboration. These sources are not propagated to older elections.
  Small-list additions: [Pirates' own principles](https://www.piratim.org/flag/) and
  [Orot HaShachar's own site regulations](https://orothashachar.org.il/website-regulations/),
  both verified 200; details in `small-list-url-checks.json`. Site regulations identify the
  party and its voice; they are labelled party-site, not a substantive election platform.
- **Wayback:** `archive-checks.json` retains CDX queries and selected captures. Four official
  roots were queried for July–November 2022. Inspected captures support k25 Yesh Atid
  (2022-10-01 10:24:01 UTC) and the separate Hadash constituent (2022-09-02 00:44:51 UTC).
  Likud CDX timed out; Israel Beiteinu replay timed out, so its index is not promoted.
  Archive requests shared a minimum five-second interval. Retrieval code backs off on
  429/503 and honors Retry-After; this archive pass returned timeouts, not a challenge bypass.
- **IDI platforms:** `idi-profiles.json` records 77 downloaded profile identities and 122
  election-labelled platform rows. `idi-platform-checks.json` verifies 119 distinct hosted
  document URLs (the other rows point to live party sites). File signatures were checked:
  PDF, OLE Word documents and a JPEG, with no HTML challenge substituted. The profile's
  explicit **מצע** link and election-year row establish the attribution and period; this is
  one IDI archival family, not independent confirmation from both file and index. Confidence
  is medium: this pass checked the index attribution and document availability, not every
  clause of every platform. Publishers explicitly distinguish the originating party and
  **IDI as host**. The platform remains partisan. April/September 2019 rows are separated;
  an undifferentiated 2019 row is not silently reused for both elections. Where a document's
  own text contradicts its IDI row, `platform-reassignments.reviewed.json` attaches it to the
  election and list the document establishes, and never to the indexed row (below).
- **Correction, 8 November 2026 — `degel-hatora-13.doc`:** IDI indexes
  `https://www.idi.org.il/media/6559/degel-hatora-13.doc` as the 1992 platform of United Torah
  Judaism (list 13-ג), and its Word cover says "כנסת 13, 1992". The leaflet scanned inside it
  (SHA-256 `9247e6bd…a4ae9d`) is the standalone platform of **אגודת החרדים – דגל התורה**: "מצע
  המפלגה", "הצבע עץ", ballot box **עץ**. The official 1988 gazettes list exactly that name under
  the letters עץ (list 12-עץ); in 1992 Degel HaTorah ran inside the joint list ג and no list
  had the letters עץ. Hebrew Wikipedia (secondary, revision 44114316) agrees that 1988 was the
  only election Degel HaTorah contested alone. The leaflet carries no year of its own, but its
  name and ballot letters fit only 1988, so it is linked as **דגל התורה — מצע 1988** on 12-עץ
  and removed from 13-ג, which now has no partisan link.
- **Hebrew Wikipedia:** API queries checked exact titles, redirects and introduction text.
  `hewiki-title-checks.json`, `hewiki-more-*.json` and `approved-hewiki-titles.json` retain the
  evidence and accepted identity set. Explicit aliases are retained; no fuzzy name matches.
  Dictionary homonyms (light, bridge, bread, heart, justice), person biographies, disambiguation
  pages and the 1919 Ahdut HaAvoda were excluded. The 2019 Yashar list was also separated from the new 2026 party. The original Maki (through 1969) and the historical United Arab
  List are not assigned their later namesakes' Wikipedia article. Hebrew articles are labelled
  **secondary**. Two late title-query batches hit 429 and were not promoted; their unverified
  names remain gaps. No English Wikipedia page was queried, cited or linked.
- **CEC:** where no accepted Hebrew article is available, a verified official results document
  supplies a neutral record naming the list, including small losing lists. This is explicitly a
  **whole-election record**, not a dedicated party history. Document identities come from the
  existing build's retained official sources and verified rosters/results; URL checks are in
  `url-checks.json` and `more-url-checks.json`. For 1969 the existing source is an official
  gazette hosted by Osef Hok U-Mishpat; the publisher label identifies the mirror. Constituents
  never inherit the election results link as if it were a separate party record.
- **Knesset preference remains incomplete:** a retrieved official faction URL redirected to
  `https://www.knesset.gov.il/maintenance-page-geo` (location restriction); no workaround was
  attempted. Most seat-winning lists currently use the verified lower-preference Hebrew/CEC
  source. This pass did not exhaust every faction URL.

Retained evidence is compact: identifiers, titles/short extracts, row labels, URLs, checksums,
status and dates. Downloaded working HTML/documents, dependency copies and build/test logs
are reproducible scratch under `.backup-scratch/`. No credentials or email User-Agent used.
API introductions are discovery/identity evidence, not policy claims about the parties.

## Reproduction and safeguards

Python 3.10+ standard library, Node 24.18.0, TypeScript 7.0.2, Vitest 5.1.0. Offline overlays:
`python3 -I scripts/research/build-party-links.py`; dataset build:
`npx tsx scripts/build-datasets.ts`. The build attaches after constituent metadata and validates
both id tables, kind/type/confidence/publisher/date/URL fields. HTTPS only; English Wikipedia,
including archive-wrapped URLs, throws. Scenario conversion clones list/constituent links and
import validation checks them. No network calls occur during dataset building.

Optional network recheck: `python3 -I scripts/research/check-party-link-urls.py`, with
`--include-archive` to opt into paced CDX/capture checks. It writes only scratch results and
never silently promotes or changes accepted evidence. Original query aliases, accepted title
set, IDI row evidence and URL checks are retained, so overlay generation needs no fresh download.

## Scope limits and conclusion map

- **Implemented:** the metadata reaches datasets and scenarios; tests cover both levels, unknown
  ids, forbidden URLs, malformed metadata and complete overlay accounting.
- **Partially supported:** the linked sources support the recorded identities and periods by
  the methods above. Source families and confidence travel with the links; this is no claim
  that sources agree or that a party's statements are true.
- **Unresolved:** historical party organs/issue affiliations and NLI ephemera were not researched
  in this pass; no newspaper affiliation is inferred. The repository's existing official gazette
  scans are neutral records, not partisan material. No repository scan was mislabelled as the
  party's own election material. Joint-list sources do not close constituent gaps.
- **2026 retrieval gaps:** gov.il candidate index returned 403 and the CEC national snapshot
  timed out through both direct retrieval and web fetch. No unverified per-list URLs were
  manufactured. Missing partisan links include major lists as well as smaller lists.
- **What would change coverage:** inspected preferred campaign captures; verified party-produced
  platforms tied to the missing election/identity; NLI item records identifying issuer and date;
  documented party-organ affiliations plus specific dated issues; accessible Knesset/CEC records
  or disambiguated Hebrew party articles. Search absence is not proof of source absence.

## Coverage and exact gaps

Counts are identities with at least one link of the given kind, not number of URLs. Constituent
counts use distinct `parties[].id` per election. Empty denominators mean there are no defined
constituents, not that all sponsoring parties have been independently reconstructed. The overlay
files contain each missing identity's full reason; below is the complete id inventory.

<!-- coverage:start -->
| Election | Lists partisan | Lists neutral | Lists total | Constituents partisan | Constituents neutral | Constituents total |
|---|---:|---:|---:|---:|---:|---:|
| k26 2026 | 9 | 15 | 38 | 11 | 16 | 25 |
| k25 2022 | 4 | 40 | 40 | 1 | 9 | 14 |
| k24 2021 | 2 | 39 | 39 | 0 | 9 | 12 |
| k23 2020 | 2 | 30 | 30 | 0 | 13 | 18 |
| k22 2019 | 3 | 32 | 32 | 0 | 14 | 19 |
| k21 2019 | 3 | 43 | 43 | 0 | 12 | 18 |
| k20 2015 | 2 | 26 | 26 | 0 | 10 | 15 |
| k19 2013 | 5 | 32 | 32 | 0 | 6 | 9 |
| k18 2009 | 5 | 33 | 33 | 2 | 10 | 14 |
| k17 2006 | 6 | 31 | 31 | 1 | 6 | 11 |
| k16 2003 | 7 | 27 | 27 | 3 | 9 | 14 |
| k15 1999 | 16 | 31 | 31 | 1 | 6 | 12 |
| k14 1996 | 7 | 20 | 20 | 1 | 7 | 12 |
| k13 1992 | 8 | 25 | 25 | 0 | 3 | 6 |
| k12 1988 | 10 | 27 | 27 | 2 | 5 | 6 |
| k11 1984 | 4 | 26 | 26 | 1 | 7 | 11 |
| k10 1981 | 4 | 31 | 31 | 0 | 3 | 7 |
| k9 1977 | 5 | 22 | 22 | 0 | 4 | 11 |
| k8 1973 | 2 | 21 | 21 | 0 | 6 | 11 |
| k7 1969 | 2 | 16 | 16 | 0 | 2 | 4 |
| k6 1965 | 2 | 17 | 17 | 0 | 2 | 4 |
| k5 1961 | 5 | 14 | 14 | 0 | 0 | 0 |
| k4 1959 | 3 | 24 | 24 | 0 | 2 | 2 |
| k3 1955 | 2 | 18 | 18 | 0 | 4 | 4 |
| k2 1951 | 1 | 17 | 17 | 0 | 0 | 0 |
| k1 1949 | 0 | 21 | 21 | 0 | 6 | 7 |
<!-- coverage:end -->

<!-- gaps:start -->
### k26 2026

- Lists missing partisan: `26-שס`, `26-ג`, `26-ט`, `26-עם`, `26-די`, `26-ך`, `26-נר`, `26-זך`, `26-ני`, `26-בי`, `26-ד`, `26-צדק`, `26-בד`, `26-י`, `26-קך`, `26-פה`, `26-קץ`, `26-נקי`, `26-קה`, `26-רץ`, `26-ק`, `26-נף`, `26-ז`, `26-נץ`, `26-ה`, `26-יק`, `26-זץ`, `26-כן`, `26-צבי`.
- Lists missing neutral: `26-רק`, `26-נר`, `26-זך`, `26-בי`, `26-ד`, `26-צדק`, `26-בד`, `26-צף`, `26-י`, `26-קך`, `26-פה`, `26-קץ`, `26-נקי`, `26-בקר`, `26-קה`, `26-רץ`, `26-ק`, `26-נף`, `26-ז`, `26-נץ`, `26-ה`, `26-יק`, `26-צבי`.
- Constituents missing partisan: `eretz-yisrael-shelanu`, `degel-hatorah`, `agudat-yisrael`, `homat-torat-yisrael`, `atid-ehad`, `yesodot-yisrael`, `meretz`, `taal`, `balad`, `reservists`, `new-economic`, `national-responsibility`, `beit-yemini`, `tzomet`.
- Constituents missing neutral: `homat-torat-yisrael`, `atid-ehad`, `yashar`, `yesodot-yisrael`, `taal`, `reservists`, `noam`, `national-responsibility`, `beit-yemini`.

### k25 2022

- Lists missing partisan: `25-מחל`, `25-ט`, `25-שס`, `25-ג`, `25-כן`, `25-עם`, `25-ום`, `25-ד`, `25-ב`, `25-אצ`, `25-קץ`, `25-יז`, `25-צ`, `25-ף`, `25-ק`, `25-ת`, `25-ני`, `25-קנ`, `25-נק`, `25-י`, `25-קך`, `25-נץ`, `25-ץ`, `25-רז`, `25-ך`, `25-ז`, `25-קי`, `25-יק`, `25-נז`, `25-נר`, `25-זץ`, `25-יץ`, `25-נף`, `25-ינ`, `25-זך`, `25-זנ`.
- Lists missing neutral: none.
- Constituents missing partisan: `tkuma`, `otzma-yehudit`, `noam`, `atid-ehad`, `eretz-yisrael-shelanu`, `agudat-yisrael`, `degel-hatorah`, `israel-resilience`, `new-hope`, `taal`, `new-right`, `jewish-home`, `religious-national-israeli`.
- Constituents missing neutral: `noam`, `atid-ehad`, `taal`, `new-right`, `religious-national-israeli`.

### k24 2021

- Lists missing partisan: `24-מחל`, `24-פה`, `24-שס`, `24-כן`, `24-ב`, `24-ג`, `24-ט`, `24-ודעם`, `24-ת`, `24-מרצ`, `24-עם`, `24-יז`, `24-ר`, `24-ףז`, `24-כך`, `24-רנ`, `24-י`, `24-קץ`, `24-זץ`, `24-רף`, `24-קך`, `24-נ`, `24-ק`, `24-כ`, `24-צי`, `24-יק`, `24-ני`, `24-ינ`, `24-ז`, `24-קי`, `24-ץ`, `24-יר`, `24-צכ`, `24-צף`, `24-נר`, `24-יף`, `24-רק`.
- Lists missing neutral: none.
- Constituents missing partisan: `likud`, `atid-ehad`, `degel-hatorah`, `agudat-yisrael`, `tkuma`, `otzma-yehudit`, `noam`, `hadash`, `taal`, `balad`, `new-hope`, `derech-eretz`.
- Constituents missing neutral: `atid-ehad`, `noam`, `taal`.

### k23 2020

- Lists missing partisan: `23-מחל`, `23-פה`, `23-ודעם`, `23-שס`, `23-ג`, `23-אמת`, `23-טב`, `23-ז`, `23-נ`, `23-ףז`, `23-קץ`, `23-ק`, `23-כן`, `23-ינ`, `23-קך`, `23-נז`, `23-נק`, `23-ץ`, `23-כ`, `23-קי`, `23-יק`, `23-ני`, `23-יז`, `23-י`, `23-יר`, `23-יף`, `23-זך`, `23-זץ`.
- Lists missing neutral: none.
- Constituents missing partisan: `likud`, `kulanu`, `israel-resilience`, `yesh-atid`, `telem`, `hadash`, `balad`, `taal`, `raam`, `agudat-yisrael`, `degel-hatorah`, `labor`, `gesher`, `meretz`, `new-right`, `jewish-home`, `tkuma`, `ahi`.
- Constituents missing neutral: `taal`, `raam`, `gesher`, `new-right`, `ahi`.

### k22 2019

- Lists missing partisan: `22-פה`, `22-מחל`, `22-ודעם`, `22-שס`, `22-ג`, `22-טב`, `22-אמת`, `22-מרצ`, `22-כי`, `22-יז`, `22-צ`, `22-רק`, `22-נך`, `22-ק`, `22-ףז`, `22-ז`, `22-נ`, `22-קץ`, `22-קך`, `22-זכ`, `22-צן`, `22-ינ`, `22-ץ`, `22-יף`, `22-יק`, `22-י`, `22-זן`, `22-נץ`, `22-כ`.
- Lists missing neutral: none.
- Constituents missing partisan: `israel-resilience`, `yesh-atid`, `telem`, `likud`, `kulanu`, `hadash`, `balad`, `taal`, `raam`, `agudat-yisrael`, `degel-hatorah`, `new-right`, `jewish-home`, `tkuma`, `labor`, `gesher`, `meretz`, `green-movement`, `independence`.
- Constituents missing neutral: `taal`, `raam`, `new-right`, `gesher`, `independence`.

### k21 2019

- Lists missing partisan: `21-מחל`, `21-פה`, `21-שס`, `21-ג`, `21-ום`, `21-טב`, `21-כ`, `21-דעם`, `21-נ`, `21-ז`, `21-נר`, `21-ן`, `21-ר`, `21-צק`, `21-נץ`, `21-ק`, `21-זץ`, `21-י`, `21-נז`, `21-זי`, `21-קף`, `21-ףז`, `21-ףי`, `21-קי`, `21-ףץ`, `21-קן`, `21-ךק`, `21-ץ`, `21-ףך`, `21-יץ`, `21-ןך`, `21-ףנ`, `21-ןנ`, `21-ץי`, `21-יז`, `21-ין`, `21-זך`, `21-ץז`, `21-זנ`, `21-נך`.
- Lists missing neutral: none.
- Constituents missing partisan: `likud`, `ahi`, `israel-resilience`, `yesh-atid`, `telem`, `agudat-yisrael`, `degel-hatorah`, `hadash`, `taal`, `jewish-home`, `tkuma`, `otzma-yehudit`, `raam`, `balad`, `zehut`, `achiezer`, `kol-yisrael-ahim`, `peula-leyisrael`.
- Constituents missing neutral: `ahi`, `taal`, `raam`, `achiezer`, `kol-yisrael-ahim`, `peula-leyisrael`.

### k20 2015

- Lists missing partisan: `20-מחל`, `20-אמת`, `20-ודעם`, `20-פה`, `20-כ`, `20-טב`, `20-שס`, `20-ג`, `20-קץ`, `20-קנ`, `20-ע`, `20-רק`, `20-ףץ`, `20-נז`, `20-יץ`, `20-ף`, `20-נץ`, `20-זץ`, `20-ני`, `20-י`, `20-ז`, `20-זך`, `20-יז`, `20-יך`.
- Lists missing neutral: none.
- Constituents missing partisan: `labor`, `hatnua`, `green-movement`, `hadash`, `raam`, `balad`, `taal`, `jewish-home`, `tkuma`, `agudat-yisrael`, `degel-hatorah`, `yachad`, `otzma-yehudit`, `mada`, `national-arab-party`.
- Constituents missing neutral: `raam`, `taal`, `yachad`, `mada`, `national-arab-party`.

### k19 2013

- Lists missing partisan: `19-מחל`, `19-פה`, `19-טב`, `19-שס`, `19-ג`, `19-צפ`, `19-עם`, `19-ד`, `19-כן`, `19-נץ`, `19-ץ`, `19-ז`, `19-פז`, `19-יק`, `19-רק`, `19-זך`, `19-הפ`, `19-פנ`, `19-צק`, `19-פץ`, `19-פ`, `19-פי`, `19-נק`, `19-ני`, `19-נ`, `19-הק`, `19-הי`.
- Lists missing neutral: none.
- Constituents missing partisan: `likud`, `yisrael-beiteinu`, `jewish-home`, `tkuma`, `agudat-yisrael`, `degel-hatorah`, `raam`, `taal`, `mada`.
- Constituents missing neutral: `raam`, `taal`, `mada`.

### k18 2009

- Lists missing partisan: `18-כן`, `18-שס`, `18-ג`, `18-עם`, `18-ט`, `18-ב`, `18-ד`, `18-ה`, `18-זך`, `18-קנ`, `18-רק`, `18-חי`, `18-צי`, `18-פ`, `18-ק`, `18-נ`, `18-יק`, `18-קץ`, `18-ץ`, `18-קפ`, `18-פק`, `18-ים`, `18-אר`, `18-נפ`, `18-פי`, `18-ינ`, `18-נץ`, `18-נר`.
- Lists missing neutral: none.
- Constituents missing partisan: `ahi`, `agudat-yisrael`, `degel-hatorah`, `raam`, `taal`, `tkuma`, `hatikva`, `eretz-yisrael-shelanu`, `moledet`, `new-movement`, `meimad`, `green-movement`.
- Constituents missing neutral: `ahi`, `raam`, `taal`, `hatikva`.

### k17 2006

- Lists missing partisan: `17-כן`, `17-אמת`, `17-טב`, `17-ג`, `17-עם`, `17-ד`, `17-רק`, `17-קנ`, `17-כ`, `17-פ`, `17-זה`, `17-חץ`, `17-יש`, `17-קז`, `17-ק`, `17-נץ`, `17-פץ`, `17-ה`, `17-פז`, `17-ז`, `17-כץ`, `17-צה`, `17-פכ`, `17-קפ`, `17-ף`.
- Lists missing neutral: none.
- Constituents missing partisan: `meimad`, `moledet`, `tkuma`, `ahi`, `nrp`, `agudat-yisrael`, `degel-hatorah`, `ram`, `taal`, `arab-democratic-party`.
- Constituents missing neutral: `tkuma`, `ahi`, `ram`, `taal`, `arab-democratic-party`.

### k16 2003

- Lists missing partisan: `16-אמת`, `16-שס`, `16-ל`, `16-ג`, `16-ו`, `16-כן`, `16-עם`, `16-קנ`, `16-נץ`, `16-צף`, `16-נ`, `16-זנ`, `16-צ`, `16-פה`, `16-ק`, `16-קך`, `16-ט`, `16-קץ`, `16-ז`, `16-ף`.
- Lists missing neutral: none.
- Constituents missing partisan: `meimad`, `yisrael-beiteinu`, `tkuma`, `moledet`, `democratic-choice`, `shahar`, `agudat-yisrael`, `degel-hatorah`, `taal`, `ram`, `arab-democratic-party`.
- Constituents missing neutral: `tkuma`, `shahar`, `taal`, `ram`, `arab-democratic-party`.

### k15 1999

- Lists missing partisan: `15-שס`, `15-עם`, `15-ט`, `15-פ`, `15-פז`, `15-קץ`, `15-קז`, `15-ים`, `15-נץ`, `15-רם`, `15-נ`, `15-קם`, `15-קף`, `15-ז`, `15-זך`.
- Lists missing neutral: none.
- Constituents missing partisan: `labor`, `gesher`, `meimad`, `agudat-yisrael`, `degel-hatorah`, `ram`, `arab-democratic-party`, `herut-national-movement`, `moledet`, `tkuma`, `taal`.
- Constituents missing neutral: `gesher`, `ram`, `arab-democratic-party`, `herut-national-movement`, `tkuma`, `taal`.

### k14 1996

- Lists missing partisan: `14-שס`, `14-ו`, `14-ע`, `14-ט`, `14-ק`, `14-פ`, `14-פא`, `14-ת`, `14-דן`, `14-יד`, `14-ז`, `14-נ`, `14-ד`.
- Lists missing neutral: none.
- Constituents missing partisan: `likud`, `gesher`, `tzomet`, `ratz`, `mapam`, `shinui`, `balad`, `agudat-yisrael`, `degel-hatorah`, `arab-democratic-party`, `ram`.
- Constituents missing neutral: `gesher`, `ratz`, `mapam`, `arab-democratic-party`, `ram`.

### k13 1992

- Lists missing partisan: `13-שס`, `13-ג`, `13-ע`, `13-פ`, `13-קנ`, `13-קל`, `13-ד`, `13-ק`, `13-נז`, `13-דף`, `13-יז`, `13-נ`, `13-נס`, `13-יד`, `13-ים`, `13-כי`, `13-זה`.
- Lists missing neutral: none.
- Constituents missing partisan: `ratz`, `mapam`, `shinui`, `agudat-yisrael`, `moria`, `degel-hatorah`.
- Constituents missing neutral: `ratz`, `mapam`, `moria`.

### k12 1988

- Lists missing partisan: `12-אמת`, `12-שס`, `12-פ`, `12-ט`, `12-ע`, `12-ז`, `12-זב`, `12-זפ`, `12-טף`, `12-טע`, `12-יע`, `12-מי`, `12-מעם`, `12-ענף`, `12-קז`, `12-קק`, `12-קצץ`.
- Lists missing neutral: none.
- Constituents missing partisan: `poalei-agudat-yisrael`, `israeli-communist-party`, `black-panthers`, `independent-liberals`.
- Constituents missing neutral: `israeli-communist-party`.

### k11 1984

- Lists missing partisan: `11-מחל`, `11-אמת`, `11-ב`, `11-שס`, `11-ת`, `11-עי`, `11-פ`, `11-ט`, `11-יש`, `11-ני`, `11-ע`, `11-ש`, `11-פש`, `11-דף`, `11-הם`, `11-זה`, `11-זך`, `11-טן`, `11-פט`, `11-כך`, `11-נ`, `11-פז`.
- Lists missing neutral: none.
- Constituents missing partisan: `herut`, `liberal-party`, `labor`, `mapam`, `independent-liberals`, `israeli-communist-party`, `black-panthers`, `tzomet`, `matzad`, `poalei-agudat-yisrael`.
- Constituents missing neutral: `herut`, `mapam`, `israeli-communist-party`, `matzad`.

### k10 1981

- Lists missing partisan: `10-מחל`, `10-אמת`, `10-ג`, `10-ב`, `10-ט`, `10-יש`, `10-ני`, `10-לע`, `10-ים`, `10-ש`, `10-פש`, `10-ד`, `10-קנ`, `10-כן`, `10-הם`, `10-זה`, `10-טן`, `10-יפ`, `10-כה`, `10-כט`, `10-כך`, `10-נן`, `10-נכ`, `10-נק`, `10-ס`, `10-פז`, `10-קן`.
- Lists missing neutral: none.
- Constituents missing partisan: `herut`, `liberal-party`, `laam`, `labor`, `mapam`, `israeli-communist-party`, `black-panthers`.
- Constituents missing neutral: `herut`, `laam`, `mapam`, `israeli-communist-party`.

### k9 1977

- Lists missing partisan: `9-אמת`, `9-ו`, `9-לע`, `9-ים`, `9-ש`, `9-כנ`, `9-פש`, `9-ד`, `9-הם`, `9-זה`, `9-חך`, `9-כה`, `9-כך`, `9-נס`, `9-סם`, `9-פז`, `9-פח`.
- Lists missing neutral: none.
- Constituents missing partisan: `herut`, `liberal-party`, `laam`, `ahdut-seidel-1977`, `israeli-labor-party`, `mapam`, `rakah`, `black-panthers`, `independent-socialists`, `moked`, `meri`.
- Constituents missing neutral: `herut`, `laam`, `ahdut-seidel-1977`, `mapam`, `rakah`, `independent-socialists`, `meri`.

### k8 1973

- Lists missing partisan: `8-אמת`, `8-רצ`, `8-ב`, `8-ו`, `8-פ`, `8-לע`, `8-ש`, `8-עא`, `8-רא`, `8-קנ`, `8-ז`, `8-יא`, `8-כך`, `8-מס`, `8-סנ`, `8-ענ`, `8-ער`, `8-רה`, `8-רס`.
- Lists missing neutral: none.
- Constituents missing partisan: `herut`, `liberal-party`, `state-list`, `free-centre`, `greater-israel-movement`, `israeli-labor-party`, `mapam`, `agudat-yisrael`, `poalei-agudat-yisrael`, `blue-red-movement`, `maki`.
- Constituents missing neutral: `herut`, `greater-israel-movement`, `mapam`, `blue-red-movement`, `maki`.

### k7 1969

- Lists missing partisan: `7-אמת`, `7-ג`, `7-לע`, `7-עמ`, `7-ו`, `7-רא`, `7-ד`, `7-יא`, `7-ש`, `7-ק`, `7-ט`, `7-כן`, `7-נס`, `7-פז`.
- Lists missing neutral: none.
- Constituents missing partisan: `israeli-labor-party`, `mapam`, `herut`, `liberal-party`.
- Constituents missing neutral: `mapam`, `herut`.

### k6 1965

- Lists missing partisan: `6-את`, `6-ב`, `6-כא`, `6-לע`, `6-ג`, `6-ו`, `6-רא`, `6-ד`, `6-יא`, `6-ש`, `6-ק`, `6-עס`, `6-כס`, `6-נס`, `6-סס`.
- Lists missing neutral: none.
- Constituents missing partisan: `mapai`, `ahdut-haavoda`, `herut`, `liberal-party`.
- Constituents missing neutral: `mapai`, `herut`.

### k5 1961

- Lists missing partisan: `5-א`, `5-ל`, `5-ק`, `5-יא`, `5-ד`, `5-רא`, `5-נ`, `5-סס`, `5-עע`.
- Lists missing neutral: none.
- Constituents missing partisan: none.
- Constituents missing neutral: none.

### k4 1959

- Lists missing partisan: `4-א`, `4-ב`, `4-צ`, `4-גד`, `4-רא`, `4-פ`, `4-יא`, `4-ק`, `4-ע`, `4-יס`, `4-נ`, `4-יד`, `4-שת`, `4-סט`, `4-סר`, `4-ש`, `4-לש`, `4-רט`, `4-רו`, `4-רי`, `4-טט`.
- Lists missing neutral: none.
- Constituents missing partisan: `agudat-yisrael`, `poalei-agudat-yisrael`.
- Constituents missing neutral: none.

### k3 1955

- Lists missing partisan: `3-א`, `3-ח`, `3-צ`, `3-ב`, `3-גד`, `3-יד`, `3-ק`, `3-נ`, `3-פ`, `3-ע`, `3-סא`, `3-צח`, `3-ש`, `3-ל`, `3-יט`, `3-רי`.
- Lists missing neutral: none.
- Constituents missing partisan: `hapoel-hamizrachi`, `mizrachi`, `agudat-yisrael`, `poalei-agudat-yisrael`.
- Constituents missing neutral: none.

### k2 1951

- Lists missing partisan: `2-א`, `2-צ`, `2-ה`, `2-ח`, `2-ק`, `2-פ`, `2-יד`, `2-ג`, `2-סצ`, `2-ב`, `2-ד`, `2-נ`, `2-ל`, `2-ע`, `2-טח`, `2-ש`.
- Lists missing neutral: none.
- Constituents missing partisan: none.
- Constituents missing neutral: none.

### k1 1949

- Lists missing partisan: `1-א`, `1-מ`, `1-ב`, `1-ח`, `1-צ`, `1-פ`, `1-ס`, `1-ק`, `1-יד`, `1-טו`, `1-נ`, `1-ל`, `1-יא`, `1-ג`, `1-יח`, `1-ת`, `1-פד`, `1-יג`, `1-ש`, `1-ט`, `1-יט`.
- Lists missing neutral: none.
- Constituents missing partisan: `hapoel-hamizrachi`, `mizrachi`, `poalei-agudat-yisrael`, `agudat-yisrael`, `non-party-religious-union`, `wizo`, `womens-equal-rights-association`.
- Constituents missing neutral: `womens-equal-rights-association`.

<!-- gaps:end -->

## Verification

`npx tsx scripts/build-datasets.ts` passed; the second final build wrote **zero** files,
with all **39 public/data JSON files byte-identical** (38 are managed by the build; the
remaining file is also hashed). `npx tsc -p tsconfig.json --noEmit` passed. `npm test`:
**55 test files, 468 tests passed**. `git diff --check` passed. No `src/app/` files changed.

Only the model differential digest was re-recorded, to
`ba6d9de9556b611ed129a52e8474c2ec8ebf9cca464ab0f0edbde0df9fbf2262`.
All 26 datasets compare equal to the baseline after recursively omitting `links` and
`builtAt`. Running the current model with the baseline datasets reproduces the previous
`bf90d94a7fab09a9ba7e62eded247acec1346fb5b23aebdfde2267ab79e9c175` model digest.
Allocation, analysis, validation and rules digests remain unchanged. The historical-namesake
checks cover 2019 Yashar versus 2026 Yashar and original Maki versus post-split Maki.

Dependencies were copied into project scratch to avoid writes through a shared read-only
`node_modules`; tsx was installed with a project scratch npm cache. No push performed.
