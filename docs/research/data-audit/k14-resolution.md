# k14 audit resolution — 6 November 2026

The two reports contain 34 non-OK ledger rows, with overlapping subjects: **24 fixed, 1 rejected/cleared missing-evidence claim, 9 retained evidence limitations; 0 owner questions**. These counts do not certify the reports' explicitly incomplete wider scope. Advisory omissions are accounted for separately below.

Merged origin/main (already current) and both report branches before repair. Applied the current Hebrew-first hierarchy: retained official Gazette scans decide names, withdrawals, counts and resignations; academic evidence outranks archival reporting. No push, main merge, Playwright, or change to `scripts/joint-facts.ts`.

## Evidence independently rechecked

All accesses/checks below were on 2026-11-06. Retained scans were rendered with PyMuPDF and read visually; no OCR was used to settle the conflicting ballot letters. Disposable renders and logs are under `.backup-scratch/data-audit/k14/`.

- **G, rank 1:** [YP 4414](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset14-results.pdf), retained `data/raw/research/k14-results.pdf`, pp.3482–3483. Names, all national totals/list rows, PM totals, printed shares and signature date read from scans. Examples: “מפלגת ההתישבות”; “הברית המתקדמת”; “אחדות למען העליה בראשות אפרים גור”; “תלם אמונה יהדות בדרכי נועם בראשות הרב יוסף עזרן”.
- **C, rank 1:** [YP 4408](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset14-cand.pdf), retained `data/raw/research/k14-candidates.pdf`, especially pp.3288–3289,3294. Third Way continues from rank 12 into “13. בן צדק ישעיהו” and ends “52. לוי יהודה”. Shas ends at **118, משה משה**. The Codex report correctly identified 118 but incorrectly quoted “118. כהן רפאל”: Cohen is rank 100, not 118.
- **A, rank 1 official content on disclosed mirror:** [YP 4411](https://olaw.org.il/yalkut/yalkut-4411.pdf), retained `data/raw/research/yp4411-agreements-1996.pdf`, p.3398. The enlarged scan says **“אות הרשימה: זך”**, not יך; “הכינוי: מורשת-אבות”; “כל המועמדים ברשימה זו התפטרו ביום ט׳ בסיון התשנ״ו (27 במאי 1996)”. Also Namir: “מועמדת מס׳ 18 – נמיר אורה – התפטרה” with 21 May 1996; Tibi/Saadia and the three other candidate resignations.
- **O, rank 1:** retained `data/raw/k14/knesset-odata-members.json`, [official API](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PersonToPosition?$filter=KnessetNum%20eq%2014%20and%20(PositionID%20eq%2043%20or%20PositionID%20eq%2061)&$format=json). Rejoined all 120 opening members to elected ranks/biography PersonIDs: no missing or extra. Eight subsequent starts matched eight departures by date. All **121 populated k14 biography PersonID/site-ID pairs** also agree with retained `data/raw/bios/knesset-odata-mk-site-codes.json`; this does not authenticate live destination bodies.
- **T, rank 2:** [Efraim Torgovnik, Party Politics 6(1), 2000](https://library.fes.de/libalt/journals/swetsfulltext/7116597.pdf), p.97 table 1 note f, reopened/read: “The number of voters was 3,121,270. 148,681 votes were not valid”. This independent academic corroboration replaces report-only MFA provenance for k14 PM cast/invalid counts. Errors in T's unrelated parliamentary table are not imported.
- **I, rank 2:** reopened [IDI's joint-list survey](https://www.idi.org.il/articles/32955) and [Degel profile](https://www.idi.org.il/policy/parties-and-elections/parties/degel-hatora/). They corroborate joint-list identities and Ravitz/Gafni's party identities, but do not provide a full contemporaneous 1996 rank allocation. No rank-level upgrade is claimed.
- **L, unranked asset provenance:** [Commons Yamin Yisrael file page](https://commons.wikimedia.org/wiki/File:Yamin_Yisrael_logo.jpg), HTTP 200 with project User-Agent. Description “סמליל מפלגת ימין ישראל”; date “1996”; source NLI `IE4160829`; PD-textlogo licence. Existing medium confidence is appropriate: these establish Commons' provenance claim, not fresh inspection of the NLI original. No image re-research or replacement.

## Every non-OK finding

O denotes the numbered Opus finding; F denotes the Codex finding. Generated `public/data/k14.json` and source catalogue were rebuilt from inputs.

| Findings | Decision and evidence | Changed inputs |
|---|---|---|
| O1 / F04 | **Fixed**, with Codex's **יך rejected** as a visual misreading. C and A establish **זך**, withdrawal 27 May. G omits it. Retain the registered list with `withdrawn:true`, zero placeholders, no claimed counted votes; 21 registered, 20 contested. | national transcription; k14-specific withdrawn handling in shared historical builder; list short label; party registry/appearance; link gaps; context; index status |
| O2 / F03 | **Fixed:** Unity for Aliyah, “אחדות למען העליה”, G/C. Official full title keeps Gazette spelling; English is editorial translation. | national, list-meta, registry, party-links, Russian-speaking family |
| O3 / F02 | **Fixed:** Progressive Alliance, “הברית המתקדמת”, G/C. | national, list-meta, registry, party-links |
| O4 / F01 | **Fixed:** Settlement Party, “מפלגת ההתישבות”, G/C. Modern spelling in Codex is normalization; retain printed spelling. | national, list-meta, registry, party-links |
| O5 | **Fixed:** Telem Emuna title says “יהדות”, not “תימן”, G/C/A. | national, registry, haredi and religious families |
| O6 | **Fixed:** “ישראל בעלייה”, G/C. | national, list-meta, registry, Russian-speaking family |
| O7 | **Fixed:** Meretz title restores “רצ, מפ״ם, שינוי”, G/C (ASCII double quote in JSON title). | national, k14 metadata, registry, labour family |
| O8 | **Fixed:** A explicitly gives Namir's resignation date, 21 May. Replace omission-only language and incorrect masculine Hebrew; preserve original candidate ranks and elected set. Her later ambassador appointment is not asserted as the legal cause of resignation in the official notice. | context; k14-specific list note in builder |
| F05 | **Fixed claim:** C proves 52 registered Third Way candidates. Keep the verified 12-name prefix, set incomplete/truncated; remove every live full-roster claim. No invented later names. | roster transcription, index, nine family status caches, historical tests/helper |
| F06 | **Fixed:** Shas published count 120 → 118, C. Also reject the auditor's terminal-name quotation as described above. | roster transcription |
| O9 | **Fixed:** G signed 5 June; O opening-membership snapshot 17 June. Distinguish membership evidence from a first-sitting protocol still not retained. | aftermath gap |
| O10 / F07 | **Fixed:** refresh k14 dataset hashes and family status caches after rebuild; validate registry/lineage and all nine families. | registry, lineage, nine families |
| O11 / F08 | **Fixed:** missing `File:` namespace; L loads normally. Keep original asset/rights and medium confidence. | logo overlay and matching source catalogue |
| F11 | **Rejected/cleared as a missing-evidence claim**, while preserving the auditor's stated access limitation. L explicitly supplies 1996, NLI source and text-logo rights. It supports the existing qualified Commons-based claim, not independent NLI authentication. | URL repair above; no status inflation |
| O12 | **Fixed evidence label:** use G as governing source instead of an unresolved report-only MFA source. National counts remain statutory values; disclose that no later formal correction has been verified. | context source-comparison event |
| O13 | **Fixed provenance:** values unchanged; T independently verifies PM cast/invalid. Preserve the original MFA retrieval limitation in transcription method/manifest. | context, PM transcription, manifest |
| O15 | **Fixed:** G prints 50.49% / 49.51%, while rounded arithmetic gives 50.50% / 49.50%. Store sourced published percentages separately and use them for displayed labels; bar widths still reflect actual vote ratios. Note explains both. | context/PM transcription; typed optional percentage + validation; PM display; regression test |
| F09–F10 | **Fixed claim:** Balad/ Degel colour citations referred to PLP/Morasha. Remove wrong-party citations and label the existing hex values editorial display choices. Preserve actual displayed colours; confidence is not official colour authentication. | k14 metadata |
| O14 / F12–F16 | **Retained evidence limits (6 rows).** Rechecked all five joint lists against regenerated joint-facts: Likud/Gesher/Tzomet 22/5/5; Ratz/Mapam/Shinui 4/3/2; Hadash/Balad 4/1; Aguda/Degel 2/2; Mada/Ra'am 2/2, all with zero unknowns. Existing candidate-rank arrays remain internally consistent. O establishes membership and later faction records, not automatically original constituents. T independently supports five Tzomet elected; I supports joint identities and Degel names. Searches did not recover a complete independent rank-level source for every 1996 constituent. Do not invent allocations, convert later factions into original affiliations, or claim Hebrew-Wikipedia-only entries are independently verified. | No allocation change; original labelled evidence retained |
| O16 | **Retained search limitation.** Absence of a verified correction is not proof none exists. G itself controls until a correction is found; no arithmetic inconsistency justifies overriding it. Both auditors also report unsuccessful correction searches. No exhaustive page-by-page search of all subsequent issues claimed. | Conservative no-verified-correction wording retained in revised context |
| F17 | **Retained link-body limitation.** Rechecked exact opening IDs and all 121 stored site mappings against O/retained official site map. No mismatches; repaired identified list-title errors. This does not clear every archived/party/wiki destination or non-elected biography. | Concrete title repairs only; mapping values unchanged |
| F18 | **Retained semantic audit limitation.** Re-read k14 family memberships, source classifications and registry continuity status; changed identified erroneous cached names/hashes. These are explicitly sourced project classifications/observed appearances, not conclusions proved by a checksum. Neither report supplies a competing historical identity edge requiring an owner arbitration. No wholesale independent history/family audit is claimed. | Name/hash repairs only; no invented continuity |

## Advisory omissions

- **O1 (omission):** added Tibi and Saadia's 21 May resignations from A. Whole Arab Union list remains active: G counts 2,087 votes. Individual resignations do not establish whole-list withdrawal.
- **O2:** added the three other resignation dates read in A: Moledet #93 (9 May); NRP #20 (14 May) and #44 (9 May). None changes elected identities.
- **O3:** added eight candidate notes from exact OData membership transition pairs: Ben-Elissar → Rivlin (1996-09-01); Libai → Cabel (1996-10-15); Stern → Slomiansky (1997-05-12); Hammer → Gabay (1998-01-20); Shahal → R. Haj Yahia (1998-03-20); Gafni → Leizerson (1998-10-23); Olmert → Y. Katz (1998-11-18); Badash → Shmueli (1998-11-30). Original election rosters remain unchanged.
- **O4:** PM note now states the strict majority rule, already evidenced by the direct-election-law source in the existing records. The proposed blank-ballot court story is not added without independent retrieval of that judgment; this is an optional context omission, not a contradictory current value.
- **O5:** expanded retained YP 4411 manifest description to cover candidate resignations and whole-list withdrawal.

## Owner questions

None. Unfinished source coverage is not a subjective decision or an equal-rank unresolved source conflict.

## Changed on-screen labels/status for integration tests

- “Development Party” / “מפלגת ההתפתחות” → “Settlement Party” / “מפלגת ההתישבות”.
- “Democratic Alliance” / “הברית הדמוקרטית” → “Progressive Alliance” / “הברית המתקדמת”.
- “Unity for Peace” / “אחדות למען השלום” → “Unity for Aliyah” / “אחדות למען העליה”; full title keeps “בראשות אפרים גור”.
- Telem Emuna full title: “תימן” → “יהדות”.
- “ישראל בעליה” → “ישראל בעלייה”; Meretz full title “רצ מפם שינוי” → “רצ, מפ״ם, שינוי”.
- Absent → “Moreshet Avot” / “מורשת-אבות”, letters זך, **withdrawn**; 20 dataset lists → 21 registered / 20 contested.
- Third Way “full roster” / “הרשימה המלאה … תועתקה” → explicitly **12 of 52**, incomplete/truncated. Election status stays **official-final**; index and all nine family status caches now use that corrected coverage wording and mention the withdrawn list.
- PM Netanyahu **50.50% → 50.49%**, Peres **49.50% → 49.51%**. PM cast/invalid source label **report-only / unverified MFA → Secondary / Torgovnik**. New explanatory note distinguishes published shares from arithmetic rounding.
- Result-source comparison **Unresolved / טרם הוברר → Official / רשמי**; remove the unresolved prefix and replace narrative with statutory-source priority and the unverified-later-correction caveat.
- Namir omission-only narrative → dated 21 May resignation, feminine Hebrew; eight new replacement notes, five new resignation/withdrawal timeline entries (Moreshet Avot, Arab Union and the three remaining candidates). No bloc scheme title changed.

## Reproduction and verification

Node v24.18.0; lockfile dependencies linked from the established repository. Python standard library for validation; local scratch rendering used PyMuPDF from an already installed workspace cache. Regeneration requires retained PDFs/transcriptions and committed inputs, not the disposable renders. No new unique source bytes reside only in scratch.

Run `BUILD_JOBS=2 node scripts/build-datasets.ts`; refresh only k14 source/dataset hashes and status in the registry, lineage and nine families; `node scripts/validate-families.ts`; `PYTHONPYCACHEPREFIX=.backup-scratch/pycache python3 scripts/validate-party-logos.py`; `npx tsc -p tsconfig.json --noEmit`; `npx vitest run --maxWorkers=2 --configLoader native`. Native config loading avoids Vite trying to write temporary files through the read-only shared dependency symlink. The gallery test needs local Node subprocess permission in this sandbox.

Recursive field comparison found changes only in k14: six corrected name spellings/titles, short labels/link titles, one withdrawal/list placeholder and official zero-seat map, roster status/coverage, Namir and eight membership notes, logo provenance URL, raw hashes and build timestamp. All 25 other national datasets are byte-identical. Votes, elected identities/ranks and seats unchanged. Differential allocation/model digests refreshed only after this comparison; analysis, validation and rules digests unchanged. Shared engine/model code unchanged; PM presentation/validation change is independent of seat computation.

Final verification: rebuild succeeded (0 files written, 38 unchanged); all nine family catalogues passed; logo validation passed (26 overlays, 184 source records, 131 assets); TypeScript passed; **95 Vitest files / 905 tests passed**, including historical k14 and all five differential families. No Playwright.
