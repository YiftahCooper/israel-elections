# Party families and lineages: research proposal

**Recommendation.** Build a versioned, sourced interpretation layer over the existing election datasets. Keep **organisational lineage**, **electoral partnership**, and **ideological family** separate. Offer several named presets rather than a universal partition of Israeli politics. Default to a separate, visibly labelled segment for mixed lists; never derive constituent votes from seats, candidates, polls or ancestry. Let users fork, hide and edit presets locally. A family should also compile into a one-election grouping and an explicit vote-edit operation.

The accompanying [Haredi draft](../../data/meta/families/haredi.draft.json) covers every local dataset k1–k26, including below-threshold lists, source references, proposed missing party ids, qualifications and computed totals. Its selected-list totals are defensible under its stated definition; **they are not totals of votes cast by Haredi people**. It is a research draft, not production metadata. In particular, 1949 has no identifiable Aguda/Poalei Aguda vote total, and several minor-list boundary cases remain explicit review candidates.

Research date: **4 November 2026**. Scope: national Knesset ballots, 1949–2026; no prime-minister ballots, local elections or demographic estimates. Existing local files are observed inputs, not independently re-certified election returns. `k26` retains `final-count-pending-publication`. Labels below distinguish **observed** source statements or local values, **inferred** editorial decisions, and **unresolved** evidence gaps. A documented party identity does not make its placement in a preset an official fact.

## 1. Prior datasets, classifications and reuse

| Resource | Observed Israeli coverage and classification | Rights and recommended use |
|---|---|---|
| **ParlGov** | Inspected development CSVs linked by the 4 Nov 2023 data page: 94 Israeli party records and 25 distinct parliamentary election dates, 1949–2022. The 2024 stable release is updated through June 2023. Its broad cross-national families are not Israeli lineages: Aguda is `Special issue`, Degel is `Conservative` in the inspected CSV. Small unsuccessful lists are not comprehensively covered. | Official project states Dataverse data are **CC0 1.0**. Reusable crosswalks and external classification annotations; pin release, citation and file hash. Do not replace local identities, dates or counts. [Data](https://www.parlgov.org/data-info/), [licence](https://github.com/hdigital/parlgov), [2024 release](https://www.parlgov.org/2024/08/12/parlgov-2024-released/), [codebook](https://parlgov.fly.dev/docs/codebook/). |
| **PartyFacts** | Version 2023 `core-parties.csv`: 106 `ISR` rows inspected. Links identities across datasets, not a family ontology or a complete election series. Aguda id `641`; Poalei Aguda `1491`. The latter's recorded last year is 1977, whereas IDI documents its independent 1981 run: coverage dates must not terminate local identity. | **CC0 1.0**, confirmed in Dataverse API metadata. Reuse ids and reviewed links; underlying linked datasets keep their own terms. Omit Wikipedia URL/description fields entirely under this project's source policy. [Release](https://doi.org/10.7910/DVN/TJINLQ), [project](https://partyfacts.herokuapp.com/). |
| **Manifesto Project** | Israeli programmes extend back to 1949 in its document catalogue; coverage selects electorally relevant parties and available programmes, not all lists. `parfam` is time-invariant; its Christian-democratic category expressly also includes Jewish parties in Israel. That cannot distinguish Haredi from national religious or capture ideological change. Exact latest Israel election/document completeness was not audited. | Posted terms prohibit redistribution without written authorisation and require provenance and citations. **Do not bundle data, programme texts or derived classification extracts** on the assumption that public download means an open licence. Use the public methodology as a cited comparison; obtain explicit permission for any proposed data import. [Terms](https://manifesto-project.wzb.eu/information/documents/terms_of_use), [2024a codebook, `parfam`](https://manifesto-project.wzb.eu/down/data/2024a/codebooks/codebook_MPDataset_MPDS2024a.pdf), [historical document catalogue](https://manifesto-project.wzb.eu/down/data/2015a/codebooks/documents_MPDataset_MPDS2015a.pdf). |
| **CLEA / THEA** | Coverage page lists Israel's **25 elections, 1949–2022**, including both 2019 ballots. Constituency/list electoral returns, not Israeli ideological genealogy. Israel is one national electoral constituency; this adds no constituent-vote split. | Current terms state **ODbL 1.0**, Database Contents License, attribution, share-alike and keeping open; also a commercial-permission requirement and a request concerning substantial republication. Those additional terms require clarification rather than silently treating it as unrestricted ODbL. No import is needed: retain independently sourced local official counts. Any approved adaptation belongs in a separately licensed, attributed external data package, outside the MIT dataset. [Coverage](https://electiondataarchive.org/data-and-documentation/clea-lower-chamber-elections-archive/countries-and-elections/), [terms](https://electiondataarchive.org/about/licensing/). |
| **Israel Democracy Institute (IDI)** | Strongest practical Israeli-language starting point: party profiles, election tables, joint-list constituents through 2021, and Kenig/Rahat's *Parties in Israel 1992–2021*. Recognises Haredi, national religious, immigrant, centre and radical-right categories, but authors' boundaries vary. Profiles have some 2026 updates; that is not a complete verified 2026 classification. | Publications carry copyright; no blanket open-data licence was established. The 2018 Shas monograph expressly reserves reproduction rights. Cite facts and write original assessments; **do not copy its tables, chapter text or scans into an MIT compilation**. Obtain permission for bulk reproduction. [Joint lists](https://www.idi.org.il/articles/32955), [book](https://www.idi.org.il/media/20997/המפלגות-בישראל-2021-1992.pdf), [Shas monograph, copyright p.2 PDF](https://www.idi.org.il/media/10320/a-flock-with-no-shepherd-shas-leadership-the-day-after-rabbi-ovadia-yosef.pdf). |
| **Academic lineage and cleavage work** | Barnea and Rahat (2011), *“Out with the old, in with the ‘new’: What constitutes a new party?”*, supplies a conceptual distinction between continuity and newness, not a ready k1–k26 lookup. Berman (2020), *Inequality, Identity, and the Long-Run Evolution of Political Cleavages in Israel 1949–2019*, Table A1, provides a concrete alternative bloc classification. Its Haredi, centre and Arab categories demonstrate useful practice but also collapse difficult early alliances and differ between survey and election coding. | No reusable blanket licence established for either article's classification material. Cite concepts and independently establish local assignments; do not transcribe Table A1. The Barnea/Rahat publisher landing page/abstract was discoverable; full text was not used or bypassed. Berman's public paper was opened, including Table A1. [Barnea/Rahat DOI](https://doi.org/10.1177/1354068810369148), [Berman paper](https://wid.world/document/inequality-identity-and-the-long-run-evolution-of-political-cleavages-in-israel-1949-2019-world-inequality-lab-wp-2020-17/). |
| **Knesset party/faction histories** | Official faction records and dated split/merger register across parliamentary terms. Strong evidence for institutional events; not an official ideology taxonomy, and a parliamentary faction is not necessarily the party or ballot alliance. Non-elected lists are outside this register's effective coverage. | No CC0/MIT grant established. Cite/restate institutional facts with date and locator; treat reproduced site prose, images and extracts under the Knesset's own terms. Do not relicense source content as MIT. Site terms page had no readable body in this retrieval, so unrestricted bulk redistribution is **not cleared**. [Splits/mergers](https://main.knesset.gov.il/en/mk/apps/faction/general/split-merge), [example 1955 faction](https://main.knesset.gov.il/mk/apps/faction/faction-lobby?FactionID=211&KnessetID=3), [terms](https://main.knesset.gov.il/About/pages/termsofuse.aspx). |

**Decision:** reuse reviewed CC0 crosswalks; author the preset assignments here from cited historical facts. No share-alike data or third-party classification table is included in this deliverable. Separation means a separately licensed package and rights notice, not merely a subdirectory labelled MIT. Linking to a copyrighted publication is not importing its contents. These are operational reuse recommendations, not a claim that every underlying factual datum is copyrightable.

Observed crosswalk cautions: ParlGov's inspected election file dates the 1965 election `1965-11-01`, while local k6 says `1965-11-02`; do not join on date alone. PartyFacts may merge or scope entities differently from the project's constituent ids. Match identity, period and alliance role, and record conflicts.

## 2. Expected presets and election-by-election membership proposal

### Definitions and sources for assignment

Each preset is an **inferred, named interpretation**. The following source keys support the historical entities or criteria; the election matrix resolves them to actual local list ids. A matrix cell has its column's source key plus `public/data/kN.json` for the observed list identity and `data/meta/kN.json` for observed constituents. Sources do not claim to endorse our complete preset. Cross-family alliances get `M`, not constituent vote allocations. A dash means no selected list under this definition, not proof that no voters of that tendency existed.

| Key / preset | Inclusion rule, source basis and disputed alternatives |
|---|---|
| **H — Haredi / חרדיות** | Organisational Aguda, Poalei Aguda, Degel and Shas lineages plus specified offshoots/self-described lists. [Aguda](https://en.idi.org.il/israeli-elections-and-parties/parties/agudat-israel/), [Poalei Aguda](https://www.idi.org.il/policy/parties-and-elections/parties/poalei-agudat-yisrael/), [Degel](https://en.idi.org.il/israeli-elections-and-parties/parties/degel-hatora/), [Shas](https://www.idi.org.il/policy/parties-and-elections/parties/shas/), [UTJ](https://en.idi.org.il/israeli-elections-and-parties/parties/united-torah-judaism/). Full mapping and evidence in §5 and JSON. Offer establishment-only and broader offshoot variants. |
| **A — Arab and Arab–Jewish / ערביות וערביות־יהודיות** | Umbrella with visible subfamilies: Mapai-affiliated Arab lists; communist/Jewish–Arab lists; Arab nationalist; Islamist. Include Maki/Rakah/Hadash as Jewish–Arab, not ethnically Arab parties. Keep satellites distinct from autonomous opposition; Labour affiliation is not a merger. [Hadash](https://www.idi.org.il/policy/parties-and-elections/parties/hadash/), [Balad](https://www.idi.org.il/policy/parties-and-elections/parties/balad/), [Ra'am](https://www.idi.org.il/policy/parties-and-elections/parties/raam/), and local `labour-affiliated-arab-lists` schemes. Early Maki and the later Jewish-majority Maki branch need separate identities after 1965; do not transfer Rakah's history to Moked. |
| **N — National religious / ציונות דתית** | Mizrachi, Hapoel HaMizrachi, NRP/Jewish Home institutional trunk; Meimad and Tkuma as separately marked branches. New Right/Yamina are a broader, disputed successor option, since they sought secular as well as religious voters. [NRP history](https://en.idi.org.il/israeli-elections-and-parties/parties/national-religious-party/), [IDI on its changing alignment](https://www.idi.org.il/articles/25502), [joint lists](https://www.idi.org.il/articles/32955). [IDI identifies Noam with the Hardal current](https://en.idi.org.il/articles/31683); it is not automatically Haredi. Names such as “Religious Zionism” identify both a party brand and an alliance in different elections. |
| **L — Labour Zionist and Zionist left lineage / תנועת העבודה והשמאל הציוני** | Mapai, Ahdut HaAvoda, Rafi and Labor; separate Mapam/Ratz/Meretz branch. Broad preset adds civil-rights and democratic-socialist partners; narrow Labour trunk does not absorb all of Meretz's ancestry. [Labor](https://en.idi.org.il/israeli-elections-and-parties/parties/labor-party/), [Meretz](https://en.idi.org.il/israeli-elections-and-parties/parties/meretz/), [2024 Democrats merger](https://en.idi.org.il/articles/54874). Am Ehad belongs to a labour-organisational variant; centrist split-offs do not stay here merely because a founder served in Labor. |
| **R — Herut–Likud organisational lineage / חרות–הליכוד** | Herut → Gahal → Likud; external partners stay explicit. This is broader than a strictly Revisionist ideological lineage because Gahal incorporates Liberal ancestry. Offer “Revisionist trunk” separately from “all Likud ancestors”. [Likud profile](https://www.idi.org.il/policy/parties-and-elections/parties/likud/), [IDI on alliance-to-merger histories](https://www.idi.org.il/articles/33649). Do not automatically count Kadima, New Hope or every politician who left Likud. |
| **C — Centre / מרכז** | Election-specific positioning, **not a single lineage**: early General Zionists/Progressives and liberals as a historical civil-centre variant; Dash/Shinui, Centre Party, Third Way, Kadima, Hatnuah, Yesh Atid, Kulanu, Blue and White and National Unity as later variants. Broad centre includes centre-right; strict centre excludes New Hope. [Shinui](https://www.idi.org.il/policy/parties-and-elections/parties/shinui/), [Kadima](https://www.idi.org.il/policy/parties-and-elections/parties/kadima/), [Berman, discussion pp.2–3 printed](https://wid.world/document/inequality-identity-and-the-long-run-evolution-of-political-cleavages-in-israel-1949-2019-world-inequality-lab-wp-2020-17/). 2026 new brands need contemporary review rather than inherited leader labels. |
| **I — Russian-speaking immigrant parties / מפלגות העולים דוברי הרוסית** | Yisrael BaAliyah and Yisrael Beiteinu electoral vehicles; never a claim about the language of every voter. Keep their different ideologies and changes in audience visible. [Yisrael Beiteinu profile](https://www.idi.org.il/policy/parties-and-elections/parties/yisrael-beytenu/), [documented BaAliyah merger into Likud](https://en.idi.org.il/articles/54874). Earlier/newer micro-lists advertising aliyah need individual review, not automatic inclusion from a Russian candidate's name. |
| **X — Radical right / ימין רדיקלי** | Named ideological preset with disclosable variants: Kach/Kahanist-Otzma branch versus broader Tehiya, Moledet, Tzomet, National Union/Tkuma and Noam. Secular radical right and Hardal are not synonyms. [Kenig/Rahat book, radical-right chapter](https://www.idi.org.il/media/20997/המפלגות-בישראל-2021-1992.pdf), [IDI's explicit classification of Tkuma and Otzma](https://www.idi.org.il/articles/33649). Tzomet, Zehut and modern Tkuma boundaries are contested; entries below recommend a broad variant, never an unqualified universal label. |

### Election matrix

Numbers before the hyphen are the Knesset number, **not** the letter `k`. Thus `8-חל טעם` is the exact local Likud id, including its space. `M` indicates a mixed family segment; `?` means a proposed extension pending classification review. H memberships are detailed separately in §5. The matrix is the proposed named presets, not a disjoint partition: e.g. Tkuma can be both N and X, and Yisrael Beiteinu both I and X. No sums across columns are meaningful without deduplication.

| Election | A | N | L | R | C | I | X |
|---|---|---|---|---|---|---|---|
| k1 · 1949-01-25 | `1-ק`, `1-יד`, `1-ת` | `1-ב`M | `1-א`, `1-מ` | `1-ח` | `1-צ`, `1-פ` | — | — |
| k2 · 1951-07-30 | `2-ק`, `2-יד`, `2-נ`, `2-ע` | `2-ה`, `2-ב` | `2-א`, `2-מ` | `2-ח` | `2-צ`, `2-פ` | — | — |
| k3 · 1955-07-26 | `3-ק`, `3-יד`, `3-נ`, `3-ע` | `3-ב` | `3-א`, `3-תו`, `3-מ` | `3-ח` | `3-צ`, `3-פ` | — | — |
| k4 · 1959-11-03 | `4-ק`, `4-רא`, `4-יא`, `4-ע`, `4-נ` | `4-ב` | `4-א`, `4-מ`, `4-תו` | `4-ח` | `4-צ`, `4-פ` | — | — |
| k5 · 1961-08-15 | `5-ק`, `5-יא`, `5-רא`, `5-נ` | `5-ב` | `5-א`, `5-מ`, `5-תו` | `5-ח` | `5-ל` | — | — |
| k6 · 1965-11-02 | `6-ו`, `6-רא`, `6-יא`, `6-ק`? | `6-ב` | `6-את`, `6-כא`, `6-מ` | `6-חל` | `6-לע` | — | — |
| k7 · 1969-10-28 | `7-ו`, `7-רא`, `7-יא`, `7-ק`? | `7-ב` | `7-אמת` | `7-חל` | `7-לע`, `7-ט` | — | — |
| k8 · 1973-12-31 | `8-ו`, `8-עא`, `8-רא`, `8-קנ`? | `8-ב` | `8-אמת`, `8-רצ`, `8-ש` | `8-חל טעם` | `8-לע` | — | `8-כך` |
| k9 · 1977-05-17 | `9-ו`, `9-ים`, `9-סם` | `9-ב` | `9-אמת`, `9-רצ`, `9-ש` | `9-מחל` | `9-יש`, `9-לע` | — | `9-כך` |
| k10 · 1981-06-30 | `10-ו`, `10-ים` | `10-ב` | `10-אמת`, `10-רצ`, `10-ש`, `10-קנ` | `10-מחל` | `10-הן`, `10-לע`, `10-כן`? | — | `10-ת`, `10-כך` |
| k11 · 1984-07-23 | `11-ו`, `11-פ` | `11-ב`, `11-עי`M | `11-אמת`, `11-רצ`, `11-ש`, `11-דף` | `11-מחל` | `11-הן`, `11-ט`, `11-יש`? | — | `11-ת`, `11-כך` |
| k12 · 1988-11-01 | `12-ו`, `12-פ`, `12-ע` | `12-ב`, `12-מי` | `12-אמת`, `12-רצ`, `12-מפם` | `12-מחל` | `12-הן`, `12-מי`? | — | `12-ת`, `12-ט`, `12-ץ` |
| k13 · 1992-06-23 | `13-ו`, `13-ע`, `13-פ` | `13-ב`, `13-יז`? | `13-אמת`, `13-מרצ` | `13-מחל` | `13-קנ`? | — | `13-ץ`, `13-ט`, `13-ת`, `13-יז`? |
| k14 · 1996-05-29 | `14-ו`, `14-ע`, `14-ד` | `14-ב`, `14-יד`? | `14-אמת`, `14-מרצ` | `14-מחל`M | `14-הד` | `14-כן` | `14-ט`, `14-מחל`M, `14-יד`? |
| k15 · 1999-05-17 | `15-עם`, `15-ו`, `15-ד`, `15-קם`, `15-קף`? | `15-ב`, `15-אמת`M, `15-ט`M | `15-אמת`M, `15-מרצ`, `15-ם` | `15-מחל` | `15-יש`, `15-פה`, `15-הד`, `15-נ`? | `15-כן`, `15-ל` | `15-ט` |
| k16 · 2003-01-28 | `16-ו`, `16-ד`, `16-עם` | `16-ב`, `16-אמת`M, `16-ל`M | `16-אמת`M, `16-מרצ`, `16-ם` | `16-מחל` | `16-יש` | `16-כן`, `16-ל`M | `16-ל` |
| k17 · 2006-03-28 | `17-עם`, `17-ו`, `17-ד` | `17-טב`M, `17-אמת`M | `17-אמת`M, `17-מרצ` | `17-מחל` | `17-כן` | `17-ל` | `17-טב`M |
| k18 · 2009-02-10 | `18-עם`, `18-ו`, `18-ד`, `18-ק` | `18-ב`, `18-ט`M, `18-ה`M | `18-אמת`, `18-מרצ` | `18-מחל` | `18-כן` | `18-ל` | `18-ט` |
| k19 · 2013-01-22 | `19-עם`, `19-ו`, `19-ד`, `19-ק` | `19-טב` | `19-אמת`, `19-מרצ` | `19-מחל`M | `19-פה`, `19-צפ`, `19-כן` | `19-מחל`M | `19-נץ`, `19-טב`? |
| k20 · 2015-03-17 | `20-ודעם`, `20-ע`, `20-יץ`? | `20-טב`, `20-קץ`M | `20-אמת`M, `20-מרצ` | `20-מחל` | `20-פה`, `20-כ`, `20-אמת`M | `20-ל` | `20-קץ`M, `20-טב`? |
| k21 · 2019-04-09 | `21-ום`, `21-דעם`, `21-ר`, `21-ץ`, `21-ךק`? | `21-טב`M, `21-נ`?, `21-ז`? | `21-אמת`, `21-מרצ` | `21-מחל`M | `21-פה`, `21-כ`, `21-נר`? | `21-ל` | `21-טב`M, `21-קי`, `21-ז`? |
| k22 · 2019-09-17 | `22-ודעם`, `22-ץ` | `22-טב`, `22-כ`? | `22-אמת`M, `22-מרצ`M | `22-מחל`M | `22-פה`, `22-אמת`M | `22-ל` | `22-כף`, `22-טב`M, `22-כ`? |
| k23 · 2020-03-02 | `23-ודעם`, `23-ץ` | `23-טב` | `23-אמת`M | `23-מחל`M | `23-פה`, `23-אמת`M | `23-ל` | `23-נץ`, `23-טב`M |
| k24 · 2021-03-23 | `24-ודעם`, `24-עם`, `24-ץ` | `24-ב`?, `24-ט` | `24-אמת`, `24-מרצ` | `24-מחל`M | `24-פה`, `24-כן`, `24-ת`? | `24-ל` | `24-ט` |
| k25 · 2022-11-01 | `25-עם`, `25-ום`, `25-ד` | `25-ט`, `25-ב` | `25-אמת`, `25-מרצ` | `25-מחל` | `25-פה`, `25-כן`M | `25-ל` | `25-ט` |
| k26 · 2026-10-27 | `26-עם`, `26-ודם`, `26-ד`?, `26-בד`? | `26-ט`M, `26-ני`, `26-ך`?, `26-רק`M? | `26-אמת` | `26-מחל`M | `26-דרך`?, `26-רק`M?, `26-די`?, `26-כן`? | `26-ל` | `26-ב`, `26-ט`M, `26-ני`, `26-ך`? |

**How to read the evidence:** every non-`?` cell is a recommended assignment under the stated rule, with observed ballot identity and an inferred family interpretation. `M` does not automatically enter the family's unmixed vote sum. `?` entries are **excluded by default**. Their existence is observed, their classification unresolved or contested. The matrix deliberately defines recognisable named presets, not an exhaustive classification of every unsuccessful micro-list. Lists absent from a preset are unselected; absence does not establish an opposing ideology. The H pilot additionally audits plausible fringe candidates.

Important per-election qualifications:

- **A, k1–k10:** the satellite subfamily uses the local per-election `labour-affiliated-arab-lists` metadata. Communist `ק` before the 1965 split is the earlier Maki. At k6–k7 the Jewish Maki branch is optional; k8 Moked likewise is an optional Jewish–Arab socialist extension, not the Rakah institutional trunk. At k11, `11-ע` has a misleading `shortEn: Arab Democratic Party` but a Hebrew name meaning a tenants' organisation. **Do not assign it from that English label.** The matrix excludes it. Subsequent Mada is not evidence for retroactive inclusion.
- **N:** k3's National Religious Front preceded the merged NRP of 1956; k11 Morasha is mixed; k15–k17 Labor–Meimad is mixed; National Union alliances involving secular Moledet/Yisrael Beiteinu are mixed. k19 Jewish Home's Tkuma partnership is wholly selected under the broad N rule. k24–k25 Tkuma–Otzma–Noam requires a visible warning that a national-religious family is not identical to each partner's tradition; strict N can instead mark those lists mixed. k26 Zehut and Bennett/Lapid-related brands remain separate boundary decisions.
- **L:** Ratz's rights-liberal ancestry is not Labour-Zionist organisational ancestry. Inclusion is for the explicitly broader Zionist-left variant. k13–k14 Meretz includes Shinui; a narrow Labour-lineage preset must mark it mixed. k15 “Labor–Meimad” also contains Gesher in the local constituents, despite its English short label. k20 Zionist Union includes Hatnuah; k22 Labor–Gesher and Democratic Union, and k23 Labor–Gesher–Meretz, have partners whose inclusion depends on the chosen variant. k26 retains the local `democrats`/`meretz` constituent representation without treating the 2024 legal merger as proof that every 2026 sponsor is one entity.
- **R:** Gahal and early Likud are all-in under an organisational **Herut–Likud alliance trunk** convention, not evidence that Liberals were Revisionists. A strict Revisionist preset marks these as mixed. k14 Gesher/Tzomet and k19 Yisrael Beiteinu are explicitly mixed. k21 Ahi, k22–k23 Kulanu, k24 Atid Ehad and k26 New Hope are recorded partners; users can select a whole-list convention, but constituent percentages stay unknown.
- **C:** early civil-liberal centre, 1977 Dash and modern centre are distinct eras. Meretz's Shinui component is an organisational link, not a reason to count all Meretz votes as centre. k20 Hatnuah cannot be separated from Zionist Union votes; k22–k23 Gesher cannot be separated from its Labour alliances. k25 National Unity contains New Hope, making it mixed under strict centre, wholly selected under broad centre-right. k26 proposed additions are not confirmed just because a former general leads a list.
- **I/X:** k16 National Union mixes Yisrael Beiteinu with other right-wing constituents; k19 Likud–Yisrael Beiteinu mixes immigrant and Likud lineages. Counting either whole alliance for I is an optional convention. A specific Kahanist preset selects Kach/Otzma, not automatically Tzomet/Tkuma. **1988 Kach was barred**: no invented k12 Kach list/votes. [State Comptroller's contemporaneous report, §4(c)](https://library.mevaker.gov.il/sites/DigitalLibrary/Pages/Reports/2359-1.aspx).
- **2026:** local list ids, registered names and constituents are observed; newer party classification is largely inferred. The [CEC candidate-list capture](../../data/raw/k26/govil-list-pages.exa.json) is retained evidence, not a political-science classification. [IDI's Yashar profile](https://www.idi.org.il/policy/parties-and-elections/parties/yashar/) identifies its leader and platform, but does not settle where a centre preset's boundary should lie.

### Other useful presets

Add **communist/Jewish–Arab left** (early Maki; after 1965 Rakah→Hadash, with the separate Maki→Moked→Sheli branch as an option), **civil liberal** (Progressives→Independent Liberals and the partly separate Shinui tradition), **environmental** (Greens and Green Movement; distinguish cannabis-focused Ale Yarok), **pensioners**, and **Sephardi/Mizrahi representation** (early Sephardim and Oriental Communities, Tami, Shas and selected offshoots). These are additional dimensions, not mutually exclusive families. They need the same election-specific evidence before release. In particular Tami is not automatically Haredi, and a shared constituency does not prove organisational succession. Use existing party profiles and local constituent metadata as the discovery list; do not ship unsourced universal memberships for these additional presets.

## 3. Hard cases and recommended handling

### Indivisible joint-list votes

For each family/list intersection, offer three explicit policies:

1. **Separate mixed segment — default.** The full list's ballots are shown in a hatched/outlined segment titled e.g. “United Religious Front: Haredi + national religious; internal votes unknown.” Keep the unmixed family total separate. A joint list selected by several families is rendered once in a combined chart.
2. **Include the whole list.** Counts every ballot for this family by the user's declared convention. Show the convention next to the total; do not label it measured constituent support.
3. **Exclude the mixed list.** Show the excluded list and its ballots on inspection. Do not draw an apparently continuous precise historical trend across the gap.

Do not call unmixed-only and whole-list totals statistical confidence bounds. At most they bound allocation **within those identified joint lists**, conditional on this definition. They cannot bound all votes from Haredi individuals, who may vote for other parties or abstain.

| Case | Observed evidence | Recommended interpretation |
|---|---|---|
| **1949 United Religious Front, `1-ב`** | [IDI joint-list history](https://www.idi.org.il/articles/32955) and local constituent metadata identify Mizrachi, Hapoel HaMizrachi, Aguda and Poalei Aguda; metadata also records a non-party religious union. | Separate mixed H/N segment. Never allocate using the constituents' later 1951 totals or MK counts. Broad “religious parties” preset can include the entire list without splitting it. |
| **1955, 1959, 1973 Religious Torah Front** | [Aguda profile](https://en.idi.org.il/israeli-elections-and-parties/parties/agudat-israel/) and [Poalei Aguda profile](https://www.idi.org.il/policy/parties-and-elections/parties/poalei-agudat-yisrael/) identify both members. | Entire list is unmixed under H; its own internal party votes remain null. Similar English names do not make it the mixed 1949 Front. |
| **1984 Morasha, `11-עי`** | [IDI Morasha](https://www.idi.org.il/policy/parties-and-elections/parties/morasha/) identifies national-religious Matzad plus Poalei Aguda. | Separate mixed H/N segment; PAΙ's one elected member does not give its ballot share. |
| **1988 Aguda and 1992 UTJ** | [IDI constituent table](https://www.idi.org.il/articles/32955) records Poalei Aguda alongside Aguda in 1988 and Moria alongside Aguda/Degel in 1992. | Whole lists in H, counted once. Preserve `moria` and `poalei-agudat-yisrael` rather than overwriting them with the alliance brand. |
| **2015 Yachad–Otzma, `20-קץ`** | [IDI Yachad](https://en.idi.org.il/israeli-elections-and-parties/parties/yachad/) describes a Haredi–Hardal bridge; local metadata identifies `yachad` and `otzma-yehudit`. | Mixed segment even before considering the partner. An Eli Yishai/Shas offshoot preset is a possible user alternative, not a licence to assign all ballots to Shas descendants. |
| **Shas throughout** | [IDI's Haredi-community description](https://en.idi.org.il/articles/52891) identifies Shas with the Sephardi Haredi community; [Ettinger/Leon](https://www.idi.org.il/media/10320/a-flock-with-no-shepherd-shas-leadership-the-day-after-rabbi-ovadia-yosef.pdf) analyses its broader social reach. | Include organisationally in H. Offer a narrower Ashkenazi-Haredi preset under that honest name. Never exclude Shas because some supporters are traditional rather than Haredi. |
| **Noam** | Local `noam` constituent occurs in k24–k25 joint lists and k26's own alliance. [Yair Sheleg / IDI (2020)](https://en.idi.org.il/articles/31683) identifies Noam with the Hardal current; extending that classification to each later alliance is an interpretation. | Exclude from H by default; candidate for N and broad X. Hardal (“Haredi-national”) does not automatically mean membership in the sociological Haredi party family. Flag interpretation. |
| **Poalei Aguda / NRP / Yisrael Beiteinu** | IDI describes Poalei Aguda's more Zionist posture and later hawkish turn; NRP history documents its move toward the right; immigrant-party studies distinguish changing constituencies from origins. | Keep stable organisational ids, date-bound ideological assignments. A party can remain H by institutional descent while changing foreign-policy position. Modern ideological categories must not be projected backward. |
| **Am Shalem** | [Ettinger/Leon, PDF pp.35–36](https://www.idi.org.il/media/10320/a-flock-with-no-shepherd-shas-leadership-the-day-after-rabbi-ovadia-yosef.pdf) documents Shas ancestry and challenges to the Haredi establishment. | Excluded from the default organisational H selection, recorded as contested; optional Shas-lineage extension at k19 and k24. This is a boundary choice, not a claim that its founder lacks Haredi history. |
| **Na Nach and self-described Haredi women's/new lists** | Registered names are observed; several sponsor names differ from public brands. Religious subculture, electoral sponsor and organisational descent are distinct evidence claims. | Include explicit Haredi self-descriptions as a labelled extension. Na Nach is unresolved for organisational H, not silently counted or asserted non-Haredi. Do not force a gender-based exclusion of U'Bizchutan. |

### Splits, mergers and changes of character

Represent a dated directed graph with typed edges: `split-from`, `merged-into`, `renamed-to`, `electoral-partner`, and optionally `leader-moved-to`. Only the first three can establish organisational continuity, and even those need a documented decision about entity boundaries. A leader changing parties is not a party merger. A parliamentary split after polling day must not change the historical ballot composition.

Examples for initial lineage curation: Mapai+Ahdut HaAvoda+Rafi→Labor (1968); General Zionists+Progressives→Liberals (1961), then Independent Liberals split and Herut/Liberal Gahal alliance (1965); Likud alliance (1973) versus merged party (1988); Degel split (1988) followed by UTJ electoral alliance (1992); Meretz's alliance-to-party history and the 2024 Labor–Meretz Democrats merger. [IDI alliance/merger distinction](https://www.idi.org.il/articles/33649) and [Knesset event register](https://main.knesset.gov.il/en/mk/apps/faction/general/split-merge) should anchor event dates. Never manufacture an exact date when only a year is established.

The lineage graph should support several predecessors, competing successor claims and different validity periods. Do not automatically propagate every family's membership transitively: otherwise Kadima becomes Revisionist, Meretz becomes centre through Shinui, and much of the system becomes Labour through individual founders. Historical partnership is a separate user-visible link type.

## 4. Proposed data model fitted to this repository

This section is a proposal, **not implemented schema or app code**. Read against [dataset schema](../../src/data/schema.ts), [Scenario and Action](../../src/model/scenario.ts), [action reducer](../../src/model/actions.ts), and [part snapshots](../../src/model/parts.ts).

### Stable party registry and list appearances

Add `data/meta/parties.json`: canonical ids, bilingual names, dated aliases, entity type (`party`, `alliance`, `electoral-vehicle`), active period with date precision, sources, external ids with dataset version, and evidence status. Reuse existing `agudat-yisrael`, `degel-hatorah`, `poalei-agudat-yisrael`, `moria`, `tkuma`, etc. An alliance is not an alias for all its constituents. Resolve `labor` versus `israeli-labor-party` explicitly through a registry alias review, preserving old references and exports; do not silently treat duplicate spellings as independent historical organisations.

Continue `lists[].parties` for sourced constituent definitions. Single-party lists currently often have **no** `parties` entry; the metadata convention intentionally lists alliances only. Recommended compatible extension is a separate sourced `partyAppearances` mapping `{electionId, listId, partyId, role, sources, status}` plus an optional singleton `partyId` in a later version of `ListRecord`. If instead adding singleton entries to `parties`, first audit UI logic that interprets presence as an alliance; otherwise a single-party list may gain a misleading split control. No historical votes need change.

A party's registered legal shell and campaign brand may differ. Store both when verified, and do not equate reuse of a shell with ideological continuity. The pilot's `proposedPartyIds` identifies ids requiring an appearance mapping at that list: some are existing canonical ids reused for singleton runs, others are new proposals. They are not silently installed registry entries. Candidate-party id changes must follow the same alias mapping used for list appearances.

### Lineage file

`data/meta/party-lineage.json`:

```json
{
  "schemaVersion": 1,
  "edges": [{
    "id": "degel-split-1988",
    "from": ["agudat-yisrael"], "to": ["degel-hatorah"],
    "relation": "split-from", "date": "1988", "datePrecision": "year",
    "effectiveFor": "organisation",
    "sources": ["idi-degel"],
    "evidence": {"status": "documented", "interpretation": "Organisational split; not transferred ballots"}
  }]
}
```

Keep both endpoint direction and relation convention explicit; here `from` is predecessor and `to` successor. `electoral-partner` needs an election id and no inheritance semantics. Enforce known ids, nonempty evidence and no impossible temporal cycles for succession edges; allow repeat partnerships.

### Family preset files

`data/meta/families/<id>.json` should have `id`, immutable `revision`, bilingual labels/definition, author/publisher, criteria, inclusion/exclusion rules, scope, default mixed policy, alternative interpretations, source registry and per-election decisions. Each decision references **list id plus party ids**, includes outcome (`include`, `mixed`, `exclude`, `unresolved`), rationale, effective election, and separate identity/classification evidence. Suggested statuses: `documented`, `self-described`, `inferred`, `contested`, `unresolved`; they are not interchangeable with high/medium/low confidence.

A claim can be documented by a secondary academic source; “documented” does not mean “official classification”. Preserve source kind (`official`, `academic`, `secondary`, `partisan`), narrow locator/page, access date, and exact supporting proposition. A source proving a candidate's affiliation is not evidence of list-level vote shares. Proposed membership review must inspect all participating constituents, including those with no elected candidates.

The delivered JSON is deliberately more explicit than a runtime preset: per-row source ids, local JSON pointers, input SHA-256, counts and exact rational shares aid review. Production should compile approved decisions into runtime metadata, deriving totals at load/build time. Do not introduce a second editable vote database. Dataset ids/hashes and preset revision must travel with exports so results remain reproducible after a preset update.

### User-defined families, hidden presets and scenario actions

Store reusable user presets and preferences in versioned browser storage beside the app's existing saves (no backend): user id/UUID, forked preset id+revision, complete local definition, overrides per election, optional user-authored historic-partner edges, timestamps and hidden preset ids. Hidden means not suggested, not removed from historical data. Provide JSON export/import and include the exact applied definition in shared scenarios. Local storage alone is not cross-device synchronisation or a backup.

Scenario version 1 currently has **no family actions or family storage**. Extend it deliberately, with migration and validators, e.g. `saveFamilyDefinition`, `setFamilyMembership`, `setFamilyMixedPolicy`, `applyFamilyGrouping`, and `scaleFamilyVotes`. Keep catalogue visibility preferences outside election replay; keep changes affecting a scenario's calculations inside replay. Add family definitions/snapshots to Scenario and `PartSnapshot` only where needed; update allowlists, import/share validation and undo/redo together. Never serialize a mutable reference to a user's browser-only preset and assume a recipient can resolve it.

For a vote-share target, resolve the family into **unique whole simulation lists**; let the user decide mixed-list handling before enabling the control. With fixed valid total `V` and target share `p`, use exact rational arithmetic to compute integer target `T`, distribute `T` among selected lists proportional to current votes, and distribute `V-T` among eligible donor lists, using deterministic largest-remainder rounding. Show who supplies/receives votes, excluded/withdrawn lists and rounding results before applying one atomic reversible action. Zero-current-vote families require explicit allocations, not division by zero. Reject impossible targets or unavailable donors. Distinguish “increase family votes by 10%” (multiplier) from “make share 10%” and “add 10 percentage points”. Turnout-changing alternatives must explicitly change turnout and the denominator.

The existing `redistribute`, `setVotes`, `transfer` and exact rounding utilities are useful building blocks but no existing action by itself captures a family definition, policy and simultaneous proportional balancing. The new atomic action should store resolved list allocations, source revision, target, donor policy and preconditions for deterministic replay. Honour `SimList.originIds` after user merges/splits: a simulated list merging H and non-H becomes mixed, not automatically wholly H. A hypothetical split can receive user-entered vote assumptions, clearly labelled hypothetical; historical family charts never adopt those as observations.

### Apply a family as one-election bloc grouping

Existing `BlocScheme` accepts only `government`, `parliamentary`, `pre-election`; a family is none of those. Add a reviewed `family` kind or compile to a **custom grouping** using existing `setBlocs`, `setListMeta` and `setPartyBloc` semantics. Do not mislabel it a historical coalition. Prefer one `applyFamilyGrouping` transaction that snapshots the family revision and replaces the intended bloc assignments, naming it “Your grouping — based on …”. Preserve and restore the previous grouping through undo.

Whole-list placements drive vote totals. `partyBlocs`/`candidateBlocs` can show seat affiliation under a mixed list, but their available candidate assignments do **not** establish votes. A chart must distinguish “seats of identified party members” from “votes for lists”. Overlapping families cannot all be exclusive blocs: offer one selected family versus other/mixed, or require an explicit precedence/order rule with conflicts visible. Keep the pale tinted regions required by PRODUCT.md, and use an outline/pattern and text label so family membership is visually distinct without relying solely on colour.

## 5. Haredi pilot: membership, totals and evidence

The JSON is authoritative for this draft's selections. Its **core** is the Aguda/Poalei Aguda/Degel/Shas institutional trunk; **extensions** add evidenced offshoots and explicit Haredi self-descriptions. A third segment holds mixed alliances. The displayed “unmixed selected” total includes core plus extensions, with the two recoverable separately. All list votes are included regardless of whether the list won seats. No threshold adjustment, prime-minister vote or locality demographic weighting is used.

Source abbreviations below correspond to JSON `sources`: **Ag** = `aguda`; **P** = `pai`; **D** = `degel`; **S** = `shas`; **U** = `utj`; **J** = `joint`; **Mo** = `morasha`; **Y** = `yachad`; **E** = `shas-study`; **G** = `geula` + `kn-splits`; **B** = `yishai` + `yishai-lineage`; **CEC** = local source manifest and `cec26`. The source registry specifies URLs, publishers and claim scope. Every row's counts/denominator come only from that local `public/data/kN.json`; each member records its JSON pointer.

Existing constituent ids are used where present. Singleton proposals are `shas`, `haredim-list-1949`, `yishai-1988`, `geulat-yisrael`, `telem-emuna`, `ahavat-yisrael`, `koach-lehashpia-2013`, `uvizchutan`, `hatzibur-haharedi`, `hakel-2026`. These do not imply that two similarly named lists share a legal organisation. At k13, `moria` is already present; at k26 `homat-torat-yisrael` is already present. Their precise relationship is a source-qualified local observation, not an invented extra vote allocation.

| Election | Selected unmixed list ids | Unmixed selected votes | % of all valid ballots | Separate mixed list (whole votes) | Assignment evidence |
|---|---|---:|---:|---|---|
| k1 · 1949-01-25 | `1-יח`† | 2,835 | 0.652198 | `1-ב` 52,982 | Ag/P/J + CEC name |
| k2 · 1951-07-30 | `2-ג`, `2-ד` | 24,993 | 3.635388 | — | Ag/P |
| k3 · 1955-07-26 | `3-גד` | 39,836 | 4.668907 | — | Ag/P/J |
| k4 · 1959-11-03 | `4-גד` | 45,569 | 4.701048 | — | Ag/P/J |
| k5 · 1961-08-15 | `5-ג`, `5-ד` | 56,606 | 5.621452 | — | Ag/P |
| k6 · 1965-11-02 | `6-ג`, `6-ד` | 61,861 | 5.126342 | — | Ag/P |
| k7 · 1969-10-28 | `7-ג`, `7-ד` | 68,970 | 5.042614 | — | Ag/P |
| k8 · 1973-12-31 | `8-גד` | 60,012 | 3.830093 | — | Ag/P/J |
| k9 · 1977-05-17 | `9-ג`, `9-ד` | 82,223 | 4.704317 | — | Ag/P |
| k10 · 1981-06-30 | `10-ג`, `10-ד` | 89,402 | 4.614616 | — | Ag/P |
| k11 · 1984-07-23 | `11-ג`, `11-שס` | 99,684 | 4.807939 | `11-עי` 33,287 | Ag/S; Mo mixed |
| k12 · 1988-11-01 | `12-ג`, `12-שס`, `12-עץ`, `12-טף`† | 247,649 | 10.846941 | — | Ag/P/S/D/J/B |
| k13 · 1992-06-23 | `13-ג`, `13-שס`, `13-קל`† | 228,365 | 8.726743 | — | U/J/S/G |
| k14 · 1996-05-29 | `14-ג`, `14-שס`, `14-ת`† | 371,190 | 12.161671 | — | U/S/E |
| k15 · 1999-05-17 | `15-ג`, `15-שס` | 556,417 | 16.813148 | — | U/S |
| k16 · 2003-01-28 | `16-ג`, `16-שס`, `16-זנ`† | 399,434 | 12.687034 | — | U/S/E |
| k17 · 2006-03-28 | `17-ג`, `17-שס` | 446,145 | 14.221737 | — | U/S |
| k18 · 2009-02-10 | `18-ג`, `18-שס` | 434,254 | 12.872544 | — | U/S |
| k19 · 2013-01-22 | `19-ג`, `19-שס`, `19-פז`† | 555,809 | 14.654543 | — | U/S/E |
| k20 · 2015-03-17 | `20-ג`, `20-שס`, `20-נז`† | 453,558 | 10.771087 | `20-קץ` 125,158 | U/S + CEC name; Y mixed |
| k21 · 2019-04-09 | `21-ג`, `21-שס` | 507,324 | 11.772852 | — | U/S |
| k22 · 2019-09-17 | `22-ג`, `22-שס` | 598,974 | 13.500117 | — | U/S |
| k23 · 2020-03-02 | `23-ג`, `23-שס` | 627,290 | 13.666264 | — | U/S |
| k24 · 2021-03-23 | `24-ג`, `24-שס` | 564,399 | 12.798012 | — | U/S |
| k25 · 2022-11-01 | `25-ג`, `25-שס` | 673,158 | 14.127900 | — | U/S |
| k26 · 2026-10-27 | `26-ג`, `26-שס`, `26-זך`†, `26-רץ`† | 623,369 | 10.952831 | — | U/S + CEC names (inferred extension) |

† Extension: source-documented offshoot, inferred lineage inclusion or explicit Haredi self-description, distinguished in JSON. The latter establishes a list's claim about itself, not consensus acceptance. k1's 2,835 votes are **only the separately identifiable self-described list**: they are not the entire Haredi vote in 1949. Its core-only value is null. Separate mixed votes are 52,982 (k1), 33,287 (k11) and 125,158 (k20). “Include whole mixed lists” produces 55,817, 132,971 and 578,716 selected ballots respectively; these are alternative conventions, not reconstructed constituent votes.

**Scope and counterexamples.** The JSON exposes Am Shalem (2013 and 2021), Na Nach (2013/2015/April 2019), Black Colour (2026), and additional ambiguous early religious lists as excluded/pending or contested. Black Colour's Torah-protection name alone does not prove Haredi organisational identity. Two explicitly Haredi-named 2026 lists enter the self-described extension; that decision should be easy to turn off. Yachad in April 2019 and Achi in 2026 have zero votes/withdrawal information locally; do not move their zero or hypothetical supporters into UTJ. Tami's traditional/ethnic appeal is not by itself Haredi affiliation.

An identity counterexample was actively checked: [Walla's contemporaneous 13 January 2009 report](https://www.walla.co.il/news/israel/1416821) describes that election's Koach Lehashpia as a disability-rights vehicle. It is excluded at k18. The 2013 list is included on evidence about Amnon Yitzhak in [Ettinger/Leon, PDF pp.35–36](https://www.idi.org.il/media/10320/a-flock-with-no-shepherd-shas-leadership-the-day-after-rabbi-ovadia-yosef.pdf). Name matching would falsely join them. Likewise `ahi` in a national-religious alliance is not automatically the 2026 Achi associated with Rabbi Yoram Abergil.

### Reproduce the arithmetic and validate the mapping

Run the following from repository root with Python 3 (standard library only). It reads the committed selections, checks input hashes and all list/constituent/source references, recomputes exact integer numerators and verifies the cached six-decimal displays. It writes no files. The pilot was generated from local JSON with Python 3.14; no third-party classification data enters the calculation.

```python
import hashlib, json
from pathlib import Path
p = json.loads(Path('data/meta/families/haredi.draft.json').read_text())
assert [r['electionId'] for r in p['elections']] == [f'k{i}' for i in range(1, 27)]
for r in p['elections']:
    raw = Path(r['datasetPath']).read_bytes()
    assert hashlib.sha256(raw).hexdigest() == r['datasetSha256']
    d = json.loads(raw)
    lists = {x['id']: x for x in d['lists']}
    assert d['totals']['valid'] == r['validVotes']
    assert sum(x['votes'] for x in d['lists']) == r['validVotes']
    seen = set()
    for m in r['members']:
        assert m['listId'] not in seen
        seen.add(m['listId'])
        l = lists[m['listId']]
        assert m['votes'] == l['votes'] and m['nameHe'] == l['nameHe']
        actual = [x['id'] for x in l.get('parties', [])]
        assert m['datasetPartyIds'] == actual
        assert all(x in actual or x in m['proposedPartyIds'] for x in m['partyIds'])
        assert all(x in p['sources'] for x in m['classificationEvidence']['sourceIds'])
        assert m['constituentVotes'] is None
    for m in r['reviewCandidates']:
        assert m['listId'] in lists and m['votes'] == lists[m['listId']]['votes']
        assert all(x in p['sources'] for x in m['sourceIds'])
    core = sum(m['votes'] for m in r['members'] if m['scope'] == 'core')
    unmixed = sum(m['votes'] for m in r['members'] if m['treatment'] == 'include')
    mixed = sum(m['votes'] for m in r['members'] if m['scope'] == 'mixed')
    expected = dict(coreOnly=core, includedUnmixed=unmixed,
                    mixedWholeLists=mixed, wholeListInclusionAlternative=unmixed+mixed)
    for key, votes in expected.items():
        got = r['computed'][key]
        if key == 'coreOnly' and r['electionId'] == 'k1':
            assert got is None
            continue
        assert got['votes'] == votes
        assert got['percent'] == dict(numerator=100*votes, denominator=r['validVotes'])
        assert got['displayPct'] == round(100*votes/r['validVotes'], 6)
    assert r['computed']['mixedHarediVotes'] is None
print('26 elections: identities, sources, hashes, votes and shares reconciled')
```

## Evidence ledger, challenge pass and remaining gaps

This compact claim ledger complements the claim-level sources in the pilot. All retrievals are as of 4 November 2026. Publication/effective dates differ: the local datasets describe their polling dates; IDI's profiles are living pages; the joint-list article covers 1949–2021; the Shas study is 2018; Berman is August 2020; crosswalk snapshots are 2023/2024. Repeated IDI pages are **one institutional evidence family**, not independent corroboration. Official CEC inputs, Knesset events, State Comptroller report, independent JTA/Walla reporting, and dataset publishers' own licence records are distinct evidence families.

| Claim id | Claim and direction | Evidence locator / inspection | Limit / proof status |
|---|---|---|---|
| C1 | Supports use of independent interpretation layer | Local README, PRODUCT, metadata README, `schema.ts`, `scenario.ts`, `actions.ts`, `parts.ts`; read locally | Observed schema capability; architecture recommendation is inferred. |
| C2 | Supports CC0 crosswalk reuse; contradicts universal family import | ParlGov project licence, codebook and downloaded party/election CSV; PartyFacts 2023 Dataverse metadata and core CSV; inspected relevant fields | Snapshot-specific coverage, not complete 2026 data. External identities require review. |
| C3 | Contradicts unrestricted MIT data imports | Manifesto posted terms opened/downloaded; CLEA licensing opened; IDI book copyright page inspected; Knesset terms retrieval incomplete | Explicit Manifesto/CLEA limits observed; Knesset bulk permission unresolved. |
| C4 | Supports H core, with historical alliances | IDI Aguda/Poalei Aguda/Degel/Shas/UTJ profiles and joint-list table, plus observed local party metadata | Secondary institutional history; no constituent-vote observation. |
| C5 | Contradicts treating every religious alliance as wholly H | IDI Morasha and Yachad profiles and local 1949 constituents | Mixed membership documented; separate-segment policy inferred. |
| C6 | Supports offshoot extensions, challenges simple labels | Shas study PDF pp.35–36; Kenig/Rahat draft PDF p.230; State Comptroller 1988 report §4(b); JTA 1992 list guide | Ancestry observed; family inclusion remains interpretive. Women's/new list claims have local self-description evidence only. |
| C7 | Contradicts name-only links and universal immutable categories | Walla 2009 disability-rights report; IDI changing NRP/Poalei Aguda histories; ParlGov/PartyFacts boundary conflicts | Different events/identities; taxonomy must be time-scoped. |
| C8 | Supports exact selected-list arithmetic | All 26 local input files, pinned hashes and member JSON pointers in pilot | Observed local numbers; derived totals. No independent 2026 results certification. |
| C9 | Contextual alternative classification | Berman Table A1 opened; Barnea/Rahat abstract/metadata only | Not imported; no claim of full-text review of Barnea/Rahat. |

Conclusion map:

| Decision | Supporting / challenging claims | Status and confidence | Evidence that would change it |
|---|---|---|---|
| Versioned presets separate from immutable elections | C1, C4, C7; C9 offers alternative taxonomies | Recommend; high confidence in model fit, not universal ideological labels | A verified official longitudinal classification matching all required boundaries. |
| Mixed segment as default | C4–C5, C8; alternative whole-list conventions remain useful | Recommend; high confidence ballots are indivisible in these inputs | Actual separately cast constituent ballots, not polls or assigned seats. |
| CC0 crosswalks only for initial integration | C2–C3 | Recommend; release-specific, medium/high confidence; Knesset permission incomplete | Express reuse permission or different verified release terms. |
| H pilot usable for review, not final exhaustive classification | C4–C8; C5/C7 limit totals | Ready as draft; high confidence arithmetic, variable classification evidence | Independent evidence resolving fringe identities, coalition composition and 2026 status. |
| Non-H matrix is implementation research input | C1, C7, C9 and cited family profiles; disputed `?` cells challenge finality | Proposed; medium confidence for major trunks, low for pending fringes/new brands | Claim-by-claim review of dated organisational and ideological evidence before publication. |

**Search and retrieval method.** Workstreams were dataset/licence review, Israeli historical classifications, counterexamples, and local arithmetic/model fit; executed sequentially as requested of a research sub-agent. Preferred official institutional events and CEC counts, then IDI/academic histories, then contemporaneous reporting. No English Wikipedia page was opened, relied on, cited or linked. Some search results and external crosswalk records contained such links; these were excluded from research evidence and committed output. No Hebrew Wikipedia source is needed for this proposal; any future use must remain a labelled pointer to inspectable underlying evidence.

Direct downloads used `User-Agent: israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)`. Search/indexed text was also inspected using the web research tool, whose User-Agent cannot be configured here; those retrievals are not claimed to have used the custom header. Direct CLEA fetches returned 403; public indexed page text was readable. Knesset's dynamic page returned a 247/short body and its terms yielded no readable body. A few guessed IDI slugs returned a generic page with HTTP 200, so status alone was not counted as evidence; correct English profile URLs were used where available. The RNS women's-party page returned 403 and is **not** the pilot's evidence. No login, paywall, CAPTCHA or rate-limit circumvention was attempted. No 429 was observed; download logic stops on 429 and records Retry-After instead of immediate retries. Scratch downloads and working scripts are only in `.backup-scratch/families/`; no new backup-exclusion assumption is made.

All **26 bounded local election datasets** were inspected, and the H pilot is mapped for all of them. This is not a claim of exhaustive political-science literature coverage or an exhaustive census of ideological micro-lists. Search-result counts, total web-source counts, and bytes/pages read across services were **not measured**; the source ledger records inspection depth where material. The first local network attempt failed DNS; approved direct network requests then succeeded. No app or generated election file was changed.

## Proposed implementation plan: data, surfaces and effort

Estimates below are **inferred engineering effort for one developer**, excluding external permission delays and historical review turnaround. They are not commitments or observed benchmarks.

| Stage | Concrete result and acceptance evidence | Effort |
|---|---|---:|
| 1. Identity/rights review | Party registry, alias decisions, reviewed CC0 crosswalk; resolve H extensions and outstanding joint constituents; retain source scope/rights. Every selected list/party resolves and no third-party share-alike table enters MIT data. | 3–5 days |
| 2. Lineage and preset compiler | Typed dated graph; H pilot promoted after review; other seven presets audited election by election; source/status validation, mixed policy, deduplication and full k1–k26 coverage checks. Additional historical research may dominate this stage. | 5–10 days |
| 3. Family exploration page | Dedicated route: absolute votes and % valid ballots, full/mixed/excluded segments, exact date labels including both 2019 elections, source details, switch between definitions. Gaps/nulls stay visible; table/export agrees with charts. | 3–5 days |
| 4. Historical-election surface | Discoverable family selector; soft tinted regions with outline/pattern, list/constituent explanation in place, “apply as your grouping”, mixed policy shown alongside totals. Keep existing government grouping available. | 2–3 days |
| 5. User definitions and persistence | Link historic partners with explicit link types; fork/edit/name/save/export/import; hide/unhide presets; scenario snapshots contain exact definition/revision; migrations, undo and shared import validated. | 3–5 days |
| 6. Family scaling and verification | Share target versus vote multiplier; donor policy; mixed-list gating; deterministic proportional balancing; atomic replay with origins after merge/split. Verify exact conservation, rounding, impossible cases and saved/shared replay. | 3–5 days |
| 7. Release review | Bilingual reading and source review, keyboard/non-colour chart review against accessibility target, regression checks on ordinary simulations; separate observed history from hypothetical scaling in every surface. | 2–3 days |

Total indicative range: **21–36 developer days**, with historical source review the largest uncertainty. Start with the Haredi interpretation and one-election grouping as the pilot; do not label the remaining matrix “verified presets” until its disputed assignments and per-election source review are complete. The first review should settle the preset definition and the mixed-list convention, not request that the owner ratify technical unknowns.

## 7. Stages 1–2 implementation status (4 November 2026)

**Delivered as research drafts, not fully verified production presets.** The stable
registry maps every list in k1–k26 without changing historical datasets. It contains
577 records and 968 appearance rows, including reviewed legacy-id aliases and all
pilot singleton proposals. 354 election-specific singleton vehicle records retain
unresolved continuity rather than guessing identity from a name/letter/colour.
Dated bilingual names attest observed usage; missing English names remain null.

The lineage file contains 116 sourced edges: eight organisational events and 108
election-scoped partnerships. It covers the proposal's initial alliance examples,
including Gahal, the 1973 Likud alliance, UTJ and Meretz. A source challenge found
that IDI's July 2024 Democrats article describes intended unification with deferred
legal completion. That succession remains pending; the 2026 local Meretz sponsor
is preserved. Other unestablished organisational histories have explicit pending
records; partnership coverage is not a complete genealogy.

| Preset | Election coverage | Member-list decisions | Mixed segments | Pending/contested review rows |
|---|---:|---:|---:|---:|
| arab-arab-jewish | 26/26 | 81 | 0 | 8 |
| centre | 26/26 | 43 | 4 | 11 |
| haredi | 26/26 | 60 | 3 | 14 |
| herut-likud | 26/26 | 26 | 8 | 0 |
| labour-zionist-left | 26/26 | 62 | 10 | 0 |
| national-religious | 26/26 | 39 | 19 | 8 |
| radical-right | 26/26 | 31 | 9 | 7 |
| religious-parties | 26/26 | 109 | 27 | 21 |
| russian-speaking-immigrant | 26/26 | 15 | 2 | 0 |

All assignments have source references, local JSON pointers, dataset hashes and
computed exact rational shares. The new presets inherit the §2 matrix's historical
review, with inferred classifications and fresh IDI context checks; they must not
be represented as an independently verified classification of every minor list.
The broad religious preset explicitly includes Raam as an Islamist organisation,
while preserving the identities of all Arab-list partners. Meretz's Shinui,
Alignment's Independent Liberals and other cross-family partners stay mixed where
they fall outside the selected definition, even if the original matrix lacked M.

Remaining work: legal-shell/continuity review of unresolved minor vehicles;
individually dated split/rename/leader-move histories beyond the eight curated
organisational events; the communist-party/front crosswalk and the two Gesher eras;
contemporary classification of the proposed 2026 centre brands; the matrix's `?`
extensions; Haredi pilot Am Shalem, Na Nach and ambiguous self-descriptions.
Pending cases are excluded from totals, not guessed. No CC0 crosswalk was imported.
The validator is wired into Vitest with deliberate corrupted-data rejection tests.
See the [schema decisions](../../data/meta/families/README.md) for consumer details.

Verification: `npx vitest run --maxWorkers=2` passes **557 tests** (550 existing +
7 metadata checks), and `npm run -s typecheck` passes. `npm run -s data:build`
completed successfully; SHA-256 comparison of every `public/data/*.json` file
before and after found **no changes**. No differential model hash was changed.
The standalone `node scripts/validate-families.ts` also validates all nine presets.
