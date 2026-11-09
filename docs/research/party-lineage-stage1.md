In short, the records now link the eight missing identities, describe the twelve historical departures, and date the requested parliamentary splits. The Democrats remain an electoral partner of Meretz; the Labor rename is now disputed because the CEC and Registrar use different names. **A completed legal merger with Meretz is not established.** Two similar-name cases remain unresolved after inspection of the current register. Hadash’s front and its Communist Party component remain distinct.

Checked 8 November 2026. This is research and data only. No reader or interface changes. The facts below are entered in [the lineage data](../../data/meta/party-lineage.json). Each named source key there contains a URL or retained-file locator, the passage it supports, its tier and, for newly downloaded sources, its retrieval hash. Those records and the tables below form the claim ledger: every row supports the stated relation only. An open item is not evidence that an event never happened.

**How sure are these findings?** “Confirmed” below means an official recorded field or membership transition. It does not turn a faction record into a party-registration certificate. “Probable” means institutional scholarship supports the organisational link. A single contemporary report is “Provisional”. Distinct IDI pages count as one institutional origin; the two Walla reports count as one outlet. Neither our generated datasets nor their source documents count twice.

### The Democrats and the registration check

| Item in the data | Finding and certainty | Evidence; what remains open |
| --- | --- | --- |
| `labor-democrats-rename` | Labor is the legal platform of the Democrats; probable. The current legal name is disputed and recorded separately (see Registrar dataset below). | [IDI, Assaf Shapira, 4 July 2024](https://www.idi.org.il/articles/54838), sections on institutions and legal status (`democrats-identity`), plus the changed submitting-party name retained in `public/data/k26.json`, list `26-אמת`. **2024 dates the political agreement, not a verified Registrar effective date.** The article describes a planned name change. Do not display an exact legal rename day from this record. |
| `democrats-announced` | Agreement announced on 30 June 2024; provisional. | [Walla, 30 June 2024](https://www.walla.co.il/news/politics/3674415), opening report (`democrats-announcement`). This establishes an announcement, not legal completion. |
| `democrats-approved` | Labor’s convention approved the agreement on 12 July 2024; provisional. | [Walla, Tal Shalev, 12 July 2024](https://news.walla.co.il/item/3677233), opening paragraphs (`democrats-approval`). This is **Labor’s** approval. Meretz’s own approval date remains unverified here. |
| `partners-26-אמת` | Democrats and Meretz submitted one electoral list; confirmed within the retained CEC record. | `k26` / `cec26`, list `26-אמת`, submitting parties and constituent entries. Meretz is separately named. This proves electoral participation; the current register also separately lists Meretz (see below). |
| `democrats-registrar-date` | Legal name disputed; effective date unknown; no completed merger established. | The current official dataset was inspected instead of retrying the blocked public collection. It separately lists Labor and Meretz; see Registrar dataset below. |

The detailed IDI account is counterevidence to reading the political word “union” as a completed legal merger: it explicitly retains separate corporate and financial entities. The July approval report also describes separate entities. Accordingly, the old undifferentiated pending merger is replaced by a rename relation, two staged political events, the existing electoral-partner relation, and a specific pending Registrar check. Neither political event should be followed as completed organisational succession.

### The eight identity gaps

| Gap | Data entry and conclusion | Certainty and exact supporting evidence |
| --- | --- | --- |
| Hadash, 1992 | `hadash-front-id-k9` through `hadash-front-id-k12` identify the older election vehicles as appearances of the Hadash front. `rakah-local-id` connects Rakah to its descriptive Communist Party constituent ID. `rakah-name-1989` dates the subsequent formal name adoption. | Probable. [IDI Hadash profile](https://en.idi.org.il/israeli-elections-and-parties/parties/hadash/), history and results (`hadash-continuity`); Kenig/Rahat, **p.363**, and retained k9–k12 constituent records. **Hadash is a front, not another name for its Communist Party component.** |
| Jewish Home, 2009 | `nrp-jewish-home-2008`: electoral organisational continuation of NRP after the wider unification failed. | Confirmed continuity after the Registrar check below; [IDI NRP profile](https://www.idi.org.il/policy/parties-and-elections/parties/mafdal/), final history paragraph before results (`nrp-continuity`). Exact legal rename/dissolution date stays open in `nrp-registrar-date`. |
| Independent Liberals, 1965 | Existing `independent-liberals-1965` retained and explicitly marked probable. No duplicate added. | [IDI Independent Liberals profile](https://en.idi.org.il/israeli-elections-and-parties/parties/independent-liberals/) already cited in the data. The design audit identifies this as a reader problem: the edge was already present. |
| Tami, 1984 | `tami-recurring`: same organisation as the 1981 vehicle. | Probable. [IDI Tami profile](https://en.idi.org.il/israeli-elections-and-parties/parties/tami/), continuous history and both results (`tami-continuity`). |
| HaOlam HaZeh, 1969 | `haolam-recurring`: same movement as the 1965 vehicle. | Probable. [IDI HaOlam HaZeh profile](https://en.idi.org.il/israeli-elections-and-parties/parties/haolam-hazeh/), history and both results (`haolam-continuity`). |
| Maki, 1965 | `maki-residual-1965` connects the residual organisation to pre-split Maki. `maki-not-rakah` prevents confusing it with the departing organisation. | Probable. [IDI Maki profile](https://en.idi.org.il/israeli-elections-and-parties/parties/maki/), split paragraph (`maki-history`); Kenig/Rahat p.363. Rakah’s later reuse of the Maki name does not make these two post-1965 parties identical. |
| Sephardim, 1951 | `sephardi-recurring`: same organisation as the first-election vehicle. | Probable. [IDI profile](https://en.idi.org.il/israeli-elections-and-parties/parties/sephardim-and-oriental-communities/), opening history and results (`sephardi-continuity`). |
| Yemenite Association, 1951 | `yemenite-recurring`: same organisation as the first-election vehicle. | Probable. [IDI profile](https://en.idi.org.il/israeli-elections-and-parties/parties/yemenite-association/), opening history and results (`yemenite-continuity`). |

For the Communist chain, the detailed book states that the front includes other movements and distinguishes it from its principal component. Its account controls over the English Hadash profile’s loose description of a “merger”. The front aliases are therefore vehicle-to-front links. There is deliberately no Communist-Party-to-Hadash `same-organisation` relation. The local Communist Party ID is already observed in 1981; that observation does not move the **1989** name-change date backwards.

### The twelve historical departures

The official evidence is retained under `data/research/knesset-member-changes/kN.json`. Each new `odata-kN-positions` / `odata-kN-factions` source copies that file’s original Knesset OData URL and names its retained locator. Membership record IDs below refer to `KNS_PersonToPosition`; faction IDs refer to `KNS_Faction`. The files’ `certaintyScope` limits confirmation to official fields and observed transitions. They are not independent corroboration of the underlying Knesset database.

| Item | Recorded date, relation and certainty | Evidence and limit |
| --- | --- | --- |
| Ahdut HaAvoda, `ahdut-split-1954` | 23 August 1954, from Mapam; confirmed parliamentary departure. | k2: Moshe Aram records **25867→25868**, faction **163**; the other three departing members have matching transitions. This dates parliamentary recognition. |
| Rafi, `rafi-split-1965` | 14 July 1965, from Mapai; confirmed parliamentary departure. | k5: Ben-Gurion **26343→29874**, faction **257**; [IDI Rafi history](https://en.idi.org.il/israeli-elections-and-parties/parties/rafi/) (`rafi-history`). Not a claim about the exact party foundation day. |
| Rakah, `rakah-split-1965` | 1 September 1965, from pre-split Maki; confirmed parliamentary departure. | k5: Toubi **26385→26386**, faction **275**; `maki-history`. Not the founding congress date. |
| National List, `national-list-rafi-departure` | 1968 departure from Rafi; probable link to the later State/National List. | `rafi-history` identifies the successor list. k6 Ben-Gurion records **26542→26543** show his departure into a single-member faction on **23 January 1968**. The list contested in 1969; its registration date is not established. No false 1968 registration claim. |
| Free Centre, `free-centre-split-1967` | 29 March 1967, faction split from Gahal; confirmed. | k6: Tamir **26745→26746**, factions **287→307**. Gahal is the parliamentary parent; it was a joint faction. |
| Shinui, `shinui-faction-1978` | 14 September 1978, faction split from Dash; confirmed. | k9: Rubinstein **27254→27255→27256**, factions **423→413→407**; [IDI Shinui](https://en.idi.org.il/israeli-elections-and-parties/parties/shinui/) (`shinui-history`). Shinui existed before joining Dash; this is not its founding date. |
| Tehiya, `tehiya-faction-1979` | 17 July 1979, faction departure from the Likud joint list; confirmed. | k9: Geula Cohen **27192→29882→27193**, factions **397→688→689**; [IDI Tehiya](https://en.idi.org.il/israeli-elections-and-parties/parties/tehiya/) (`tehiya-history`). Initial departing faction was Banai, subsequently Tehiya-Banai. |
| Arab Democratic Party, `mada-faction-1988` | 15 February 1988, Darawshe leaves Alignment; confirmed. | k11 **27469→27470→27471**. Mada faction **509** starts **7 March 1988**. [IDI profile](https://en.idi.org.il/israeli-elections-and-parties/parties/arab-democratic-party/) (`mada-history`) identifies his Labor origin. Two dates, not one invented foundation day. |
| Third Way, `third-way-faction-1996` | 7 March 1996, faction departure from Labor; confirmed. | k13: Kahalani **27887→27888**, faction **599**; [IDI Third Way](https://en.idi.org.il/israeli-elections-and-parties/parties/third-way/) (`third-way-history`). Movement founded earlier; the party existed before the MKs joined. |
| Am Ehad, `am-ehad-faction-1999` | 25 March 1999, faction departure from Labor; confirmed. | k14: Peretz **28042→28043**, faction **665**; [IDI Am Ehad](https://en.idi.org.il/israeli-elections-and-parties/parties/am-ehad/) (`am-ehad-history`). |
| Kadima, `kadima-faction-2005` | 23 November 2005, faction departure from Likud; confirmed. | k16: Sharon **28517→28518→28519**; faction **542**, National Responsibility, then **562**, Kadima, from **17 January 2006**; [IDI Kadima](https://en.idi.org.il/israeli-elections-and-parties/parties/kadima/) (`kadima-history`). Founding, faction split and later faction rename remain separate facts. |
| Hatnua, `hatnua-faction-2012` | 3 December 2012, faction split from Kadima; confirmed. | k18: Meir Sheetrit **28856→28857**, faction **1048**. Livni had already left the Knesset. The evidence is the parliamentary departure, not a shared leader’s biography. |

These relations supply historical events. A split-off has no earlier votes of its own. No votes are divided, and no departing party is assigned its parent’s earlier electoral result.

### The other requested faction splits

| Entry | Date and finding | Certainty and evidence |
| --- | --- | --- |
| `likud-beiteinu-faction-2014` | 9 July 2014: joint faction divides into Likud and Yisrael Beiteinu. | Confirmed. k19 Lieberman records **28959→28960**, factions **804→843**, plus the retained faction register. A joint run is not a prior legal merger. |
| `blue-white-faction-2020` | 29 March 2020: Blue and White divides; Yesh Atid and Telem appear separately and combine as Yesh Atid–Telem that day. | Confirmed. k23 Lapid records **29905, 29945, 29778**, factions **1079, 950, 955**; Blue and White faction **946**. These are parliamentary changes, not three party foundations. |

Kadima’s 2005 split is in the preceding table. Nine UTJ separations are recorded, all **confirmed as faction dates** from the retained registers and member transitions. Each returns the joint faction to Agudat Yisrael and Degel HaTorah. It does not dissolve the parties or divide votes.

| Entry | Date | Retained term; parent → successor faction IDs |
| --- | --- | --- |
| `utj-faction-k13` | 8 April 1996 | k13: **589→1028,1029** |
| `utj-faction-k14` | 23 February 1999 | k14: **631→1034,625** |
| `utj-faction-k16` | 12 January 2005 | k16: **48→424,422** |
| `utj-faction-k17` | 18 December 2008 | k17: **632→1039,1041** |
| `utj-faction-k20` | 9 January 2019 | k20: **908→1056,1055** |
| `utj-faction-k21` | 10 July 2019 | k21: **928→1063,1064** |
| `utj-faction-k22` | 30 December 2019 | k22: **936→1065,1066** |
| `utj-faction-k23` | 28 December 2020 | k23: **944→1071,1072** |
| `utj-faction-k24` | 15 August 2022 | k24: **965→1083,1082** |

This is the set found in the retained records, not a claim to cover every historical or 2026 UTJ separation. The direct [Knesset splits register](https://main.knesset.gov.il/en/mk/apps/faction/general/split-merge) and its mobile page returned challenge pages (HTTP 247). Search indexing supplied discovery leads, but was not used as sole evidence for these claims. The retained official records supply the evidence instead.

### Similar names do not establish identity

| Case | Finding | Evidence and next deciding record |
| --- | --- | --- |
| Gesher: David Levy / Orly Levy-Abekasis | **Probable different organisations**; `gesher-distinct`. | Kenig/Rahat, **p.536**, explicitly describes Orly’s organisation as a new party using the old name, registered in December 2018. |
| Koach Lehashpia, 2009 / 2013 | **Unknown legal identity**; `koach-distinct-registration` remains pending. | [Walla, 13 January 2009](https://www.walla.co.il/news/israel/1416821), disability campaign (`power2009`); retained CEC k18 list `18-פ` and k19 Amnon Yitzhak list. Different leaders and programmes do not prove different legal entities. Need registration numbers or an explicit account of separate registration. |
| Achi, 2026 / historical Ahi | **Unknown legal identity**; `achi-distinct-registration` remains pending. | Retained CEC k26 list `26-צבי` names Rabbi Yoram Abergel’s movement; k17 faction **1040** names Ahi – Land, Society, Judaism. Need registration numbers before claiming legal non-identity. |

The Registrar check below adds one number for each case, but cannot settle either pair. The last two are stricter than the old registry’s prose conflicts, which simply call them different. The prose was not independently verified, so it has not been promoted into usable relations. Shared founders, ideology, surnames, abbreviations and ballot letters likewise produce no new lineage edges. Kulanu and Yashar do not inherit earlier parties’ votes merely because their founders previously belonged elsewhere.

### The Joint List example

Already present and checked: `partners-25-ום` records Hadash and Ta’al in 2022; Balad is the separate 2022 singleton list `25-ד`; `partners-26-ודם` records Hadash, Ta’al and Balad in 2026. Sources are `k25`, `k26` and `cec26`, with retained submissions in `public/data/k25.json` and `public/data/k26.json` and elected-member detail in `data/meta/joint-facts.json`.

Thus the **whole** 2022 Hadash–Ta’al list plus the **whole** 2022 Balad list supplies the comparison. Balad’s zero seats do not exclude its votes. These are electoral-partner relations, not an organisational merger. No additional whole-list merger edge is necessary or appropriate.

### Registrar dataset

#### registrar-2026-11-08 · [מאגר רשם המפלגות — רשימת המפלגות](https://data.gov.il/dataset/justice-miflagot)

- **Contribution**: Ministry of Justice – Registrar of Parties via data.gov.il, primary record, one evidence family (`justice-registrar-parties`). Package metadata modified **8 November 2026, 09:13:02.559224** (timezone not supplied). Retrieved 8 November 2026. The [CKAN API](https://data.gov.il/api/3/action/datastore_search?resource_id=1dbfc053-e92f-4354-92d6-1b99aadb20d7&limit=500) returned all **170/170** records in one request. The complete privacy-filtered [JSON](../../data/raw/registrar/parties-2026-11-08.json) and [CSV](../../data/raw/registrar/parties-2026-11-08.csv) are retained, with hashes and retrieval time in `data/raw/SOURCES.json`. Rows are located by `מספר מפלגה`, not display-name similarity.
- **Limit**: This is a current register, not a dated history of legal acts. No licence was stated in the inspected package metadata. Ten registration-date cells are populated, 160 empty; Kadima’s value says 29 August 2022 despite its already documented earlier electoral history. Preserve these strings, but do not use them to establish historical dates. Source `~` characters are retained verbatim. A separately retained registration does not establish current electoral activity or disprove a past political absorption.
- **Disagreement**: The 2026 CEC names “הדמוקרטים מיסודה של תנועת העבודה”, while this register still names Labor “מפלגת העבודה הישראלית”; the dataset may lag or the submitting-party name may differ, so the current legal name is disputed. The two records disagree on the name only, not on whether the Democrats continue Labor.

| Claim checked | Official observation | Decision and remaining limit |
| --- | --- | --- |
| Labor / Democrats | **59-900001-5**, מפלגת העבודה הישראלית; no entry named Democrats. CEC k26 `26-אמת` names הדמוקרטים מיסודה של תנועת העבודה and מרצ as submitting parties. | The name disagreement is recorded as **disputed** in `democrats-registrar-date` under the two-primary-record disagreement rule; neither name is silently preferred and no legal day is invented. `labor-democrats-rename` stays **probable**: the records disagree on the name, not on continuity. The CEC name itself says “founded by the Labor movement”, and the register has no other entry the Democrats could be. |
| Meretz / 2026 joint list | **59-900065-0**, מרצ, separate from Labor. | Confirms the two-registration basis of `partners-26-אמת` (**confirmed**, unchanged): ran jointly, consistent with IDI 4 July 2024. No completed legal merger is established. Meretz’s convention approval date is not present. |
| NRP / Jewish Home | **59-900008-0**, הבית היהודי, מיסודה של המפד~ל – המפלגה הדתית לאומית המזרחי הפועל המזרחי בארץ ישראל. | `nrp-jewish-home-2008`: **probable → confirmed** organisational continuity. Exact legal rename date remains unknown; the date cell is empty. |
| Koach, 2009 / 2013 | Only **59-900087-4**, כח להשפיע; objectives concern disability rights, consistent with the 2009 campaign. No separate Amnon Yitzhak entry. | `koach-distinct-registration` stays **unknown**: no second number ties the 2013 vehicle to a different legal entity. Reuse of a platform is not excluded. |
| Ahi / 2026 Achi | Historic אח~י – ארץ חברה יהדות, **59-900067-6**, explicitly formerly ציונות לאומית דתית מתחדשת. CEC `26-צבי` submits through חוזרים לשורשים, absent here. אחי ישראלי – החיבור הוא הסיפור, **59-900115-3**, is another entry. | `achi-distinct-registration` stays **unknown**: the snapshot cannot assign a number to the 2026 submitting party. The extra similar name cannot fill that gap. |
| Gesher namesakes | גשר – בראשות אורלי לוי אבקסיס, **59-900122-9**; no David Levy Gesher entry. | Consistent with the existing scholarly account of a new party; `gesher-distinct` stays **probable**. No second historical number, so no upgrade. |
| Meretz’s older merger | Ratz **59-900003-1**, Mapam **59-900004-9**, Meretz **59-900065-0** remain separate entries. | Qualifies `meretz-unification-1997`: do not read the historical organisational merger as proof that predecessor registrations vanished. The snapshot cannot itself date or overturn that merger. |
| Yisrael Baaliyah / Likud | **59-900017-1** and **59-900002-3** remain separate. | Qualifies `baaliyah-likud-2003`: political absorption does not establish deletion of the old registration. No certainty change. |
| Rakah / Maki / Hadash | One המפלגה הקומוניסטית הישראלית entry, **59-900011-4**; no separate Rakah or Hadash entry. | Confirms only a present registered Communist Party name, not the 1965 identity split or 1989 legal rename date. Existing Communist/front relations retain their certainty. |
| Other pending identities | ש~ס **59-900007-2**; דע~ם **59-900020-5**; מפלגת המרכז **59-900054-4**; אהבת ישראל **59-900051-0**. | Confirms these current registrations only. Their pending ancestry claims remain unknown. The other pending stage-1 histories (including the 1951 and 1977 cases) are not resolved by this current snapshot. |

**Privacy and reproduction.** Requests used the brief’s User-Agent without an email address. The gov.il collection was not retried. The linked official CSV returned HTTP 403; no challenge was bypassed. The committed CSV is explicitly a UTF-8 projection of the complete datastore response, not that original file. Retain only party name, number, registration date and objectives, with source order and strings unchanged except the contact prefix in objectives for **59-900147-6** (שחר כלכלי חדש): remove its phone/email up to `מטרות המפלגה:`. Address, email and internal `_id` columns are omitted from every row. The raw API response containing contacts remains disposable scratch, never committed. To reproduce, request the API once, check `total == len(records)`, apply this allowlist and one redaction, then write JSON and standard quoted CSV; metadata, parameters and retained hashes are in the source manifest. The two representations count as one source, not corroboration. This snapshot is the retained input for later analysis; future downloads may differ.

### Remaining evidence and integration work

- Registrar entries have now been inspected through official open data (below). Exact legal rename dates, both similar-name identities and Meretz’s convention approval date remain open; this dataset contains no convention decisions.
- The possible 1951 Nazareth-list succession and 1977 United Arab List merger were identified in the design but are outside its approved eight-gap/twelve-departure list. They remain open; no new relation is guessed.
- The existing `parties.json` conflict prose has not been rewritten. Its older Communist and Gesher uncertainty is superseded for the precise claims covered here by the cited lineage edges; unrelated identity questions remain open.
- The data uses the design’s new `same-organisation`, `not-same-organisation` and `faction-split` relation values, optional `stage` on `merged-into`, and explicit `certainty`. No additional schema field was invented. Existing readers must honour `stage`: announced or approved political agreements are **not** registered mergers. They must also keep faction events out of organisational continuity matching.
- Source support text records the parliamentary dates, original names and record IDs because a party ID may have a later name. The data’s generic date field cannot separately encode founding, parliamentary recognition and registration; the reader must retain these qualifications. A future exact legal date requires new evidence, not silently dropping the note.

### Reproduction and checks

Public HTML and the book were fetched with `israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)`, without an email address. Downloads, extracted text and diagnostic logs stayed in `.backup-scratch/party-lineage/`. No proxies, access challenges, paywalls or logins were bypassed. No English Wikipedia page was opened or used; incidental search results were excluded. No Wikipedia evidence was used.

The main scholarly reference is [Kenig and Rahat, *המפלגות בישראל 1992–2021*, IDI, 2023](https://www.idi.org.il/media/20997/המפלגות-בישראל-2021-1992.pdf), PDF/printed pp.363 and 536. To reproduce the readings, retrieve the recorded URLs and check these pages or the profile history paragraphs against each source’s support field and hash. The inspection covered those passages, not a reading of the entire 737-page book. Tool-level page-view and token accounting were not measured. Source counts are not used as a confidence argument.

Check outcomes are recorded below after execution. This research changes no screen, so screenshots and browser tests are not applicable.

Earlier stage-1 check history (superseded by the Registrar verification below where applicable):

- `npm run data:build`: passed for k1–k26. Some historical polling-station reconciliations explicitly skipped absent scratch inputs; retained-source and national checks ran. The build rewrote 25 election JSON files for reasons outside this lineage change. Those reproducible outputs were restored to their committed, fingerprint-pinned versions; no election result change is included.
- `node scripts/joint-facts.ts`: passed; no tracked output change.
- `npm run data:gaps`, then `npm run data:gaps:check`: passed. Both compact generated gap summaries are included with this research so they remain consistent with the changed lineage evidence.
- `npx tsc -p tsconfig.json --noEmit`: passed.
- Additional read-only validation: all **156** lineage edges reference existing party IDs and source keys; each explicit certainty is no higher than `certaintyCeiling` in `src/data/evidence.ts`. There are **40 new relations**: 19 faction splits, 10 identity aliases, 4 organisational departures, 3 renames, 2 staged political-union events and 2 explicit non-identity relations.
- `node scripts/validate-families.ts`: **fails** at its old relation whitelist with `unknown relation`. It does not yet allow the new relation values specified in the approved design. Reader/validator changes belong to the parallel implementation task.
- Final `npx vitest run --maxWorkers=2`: **1,271 passed, 2 failed, 1,273 total**, across 131 files. `families.test.ts` fails on the old relation whitelist. `compare-match.test.ts` still expects the Democrats to be unresolved (`check`); it now receives `merged`. This does not demonstrate correct stage handling: the implementation must distinguish political agreements from registered mergers before integration.
- A baseline run of the six initially affected test files with the original lineage and original pinned election datasets passed 71/72 tests; the remaining gallery test hit sandbox child-process `EPERM`. The final run with child-process permission passed that gallery test. The earlier differential and fingerprint failures came from the unrelated regenerated election JSON, and passed after those outputs were restored.
- The optional `.backup-scratch/integration/resolve.py` is absent in this worktree, so its refresh command was not run. `git diff --check` passed. No browser suite, screenshots, server, push or merge was needed or performed.

**Earlier stage-1 handoff (historical):** this was a research commit for the approved expanded contract, not a claim that the application at that stage could consume every new relation correctly. Update the relation whitelist, apply the design’s stage/certainty rules, and replace the old Democrats expectation in the implementation task. No owner decision is needed to resolve these technical integration failures.

### Registrar verification (8 November 2026)

- `npm run data:build`: passed, k1–k26. Missing historical scratch polling inputs were explicitly skipped by the existing build; retained hashes and national checks ran. The 25 unrelated election JSON rewrites were restored to their pinned committed versions. The relevant generated `public/data/sources.json` update is included.
- `npm run data:gaps`, `npm run data:gaps:check`, `npx tsc -p tsconfig.json --noEmit`, `node scripts/validate-families.ts` (9 presets, k1–k26), and `git diff --check`: passed.
- Full `npx vitest run --maxWorkers=2`: **1,312/1,312 passed across 133 files**. The existing gallery-build test needed child-process permission; the sandbox-only attempt reported `spawnSync ... EPERM`.
- After explicitly preserving the two historical merger labels as probable (the current register qualifies them but does not prove their dates), reran all four affected data/history test files: **93/93 passed**, and repeated typecheck, gaps check and lineage validation successfully.
- Six new retained-source checks cover all 170 records, manifest hashes, four-column privacy projection, the embedded-contact redaction, CSV equivalence, certainty boundaries and unresolved identities/dates. Updated one Compare and four history expectations because the Registrar evidence changes the recorded certainties: the disputed rename is no longer used automatically to join Labor’s history to The Democrats, while NRP/Jewish Home continuity is confirmed. No application implementation was changed.
- Screenshots and browser tests: not applicable to this research/data-only brief. No server was started. No push or merge.

### 9 November: further settlements and coverage limits

Kenig and Rahat, *המפלגות בישראל 1992–2021*, pp.262–263, dates Ratz/Mapam’s organisational unification to the founding convention on **12 February 1997**. This corrects the earlier 2003 edge; it does not establish a Registrar filing date. Shinui continued separately. The Meretz comparison in 1999 now finds its 1996 joint-list predecessor, with Shinui’s later separate run explicitly retained.

The [House Committee report for the 12th Knesset](https://www.knesset.gov.il/committees/heb/docs/knesset12.pdf), PDF pp.33–35 (printed 27–29), confirms Moria and Geulat Yisrael recognition on **25 December 1990**. It also records faction renames and the **9 March 1992 parliamentary** merger of Ratz, Mapam and Shinui; that parliamentary act must not be confused with the 1997 party unification. The [23rd-term report](https://www.knesset.gov.il/committees/heb/docs/knesset23.pdf), pp.101–106, and [24th-term report](https://www.knesset.gov.il/committees/heb/docs/knesset24.pdf), pp.103–108, supply further dated decisions, including requests withdrawn without a decision. Their scanned decision pages were inspected as images.

Every one of the **293** faction-membership transitions in the retained k1–k25 records now has a matching dated event under `data/research/knesset-events/`. The reproducible projection is `scripts/research/build-faction-events.py`. Confirmation covers the observed membership fields; formal split, merger and rename decisions are separate events with their own citations. This is complete coverage of the retained transitions, **not** proof of a complete legal history. The underlying extraction remains partial and contains overlapping and same-day records.

The lineage file’s `settledChecks` retains scoped scholarly conclusions for previously generic checks without manufacturing predecessor links. Remaining `pending` entries name actual gaps; a newly founded organisation need not inherit an earlier list’s votes. Yahad’s absorption into Labor during 1984–1988 is probable, but no exact party-merger date is asserted. Current registration snapshots still cannot resolve the Koach Lehashpia and Ahi platform identities or provide missing historical effective dates.
