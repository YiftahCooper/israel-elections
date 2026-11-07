# k15 audit resolution — 6 November 2026

Reconciles the merged [Codex report](k15-codex.md) and [Opus report](k15-opus.md), using the binding [hierarchy](../source-hierarchy.md) from origin/main. Counts use auditor finding rows, **not deduplicated historical defects**: **26 rows addressed (Codex F01–F09, F17–F18, F21; Opus 1–14), 9 retained coverage limitations (Codex F10–F16, F19–F20), 0 owner questions**. Within the addressed rows, **one proposed transcription is rejected**: Codex F04's candidate names. Overlapping findings are explicitly cross-referenced below; these counts do not imply 26 independent defects.

## Deciding evidence

All accessed 2026-11-06. Official scans were read as rendered images; empty extracted text was not treated as evidence. Normal HTTP requests used the prescribed project User-Agent; no challenge bypass. Existing byte-identical resignation PDFs are reused; new unique PDFs are retained and hashed in SOURCES.json; intermediate renders and dependency caches are in project scratch.

| Key | Source and rank | Inspected evidence |
|---|---|---|
| R | [YP 4757](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset15-results.pdf), rank 1; retained research/k15-results.pdf | p.3376: `יט`, `קפ הערבי החדש`, `1,791,020`; all corrected names below. p.3378: `17. גאגולה איסק`. Signature/publication 25 May 1999. |
| C | [YP 4748](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset15-cand.pdf), rank 1; retained research/k15-candidates.pdf | pp.3044,3046: ני and ק registration and candidates; p.3047: `אות הרשימה: קפ`; p.3048: `18. גאגולה איסק`. |
| W1 | [YP 4751](https://olaw.org.il/yalkut/yalkut-4751.pdf), rank 1 official notice, disclosed mirror; retained research/yp4751-candidate-changes-1999.pdf | p.3184 names Roni Kramer, David Sugarman, Shachal Masoud resigning 29 April; David Klein 5 May: `בכך התפטרו כל המועמדים ברשימה זו.` |
| W2 | [YP 4754](https://olaw.org.il/yalkut/yalkut-4754.pdf), rank 1 official notice, disclosed mirror; retained research/yp4754-candidate-changes-1999.pdf | p.3269: Mordechai Karpel resigned 14 May; `בכך התפטרו כל המועמדים ברשימה זו.` Also explicitly uses קפ for New Arab. |
| A | [YP 4755](https://olaw.org.il/yalkut/yalkut-4755.pdf), rank 1; retained k15/yp4755-agreements.pdf | p.3305: יט–כן agreement; PM withdrawals name Bishara, Mordechai and Begin, each `16.5.1999`. |
| D | [CEC chair decision 1/04](https://lacuna.co.il/posts/election_date/04-1.pdf), rank 1 official decision on disclosed mirror; retained k15/cec-dissolution.pdf | pp.26–27 paragraph 1 dates Sharon's presidentially approved dissolution `5.11.2002`, under section 22, followed by election 28 January 2003. |
| G | [Official government 28](https://www.gov.il/BlobFolder/generalpage/gov28/he/gov28.pdf), rank 1; retained k15/gov28-tenure.pdf | p.120 heading: `ממשלת אהוד ברק`, `6.7.1999`, `7.3.2001`. Web tool returned 403; ordinary custom-UA HTTP download succeeded, and retained PDF was independently read. |
| I | [IDI coalition study](https://www.idi.org.il/articles/8082), rank 2 | `כללה הקואליציה שבע סיעות ונסמכה על רוב של 75 חברי כנסת`; UTJ departure in September 1999, without a day. |
| O | Retained official k15/knesset-odata-members.json, rank 1 | Opening membership on 7 June 1999; member/faction identities. Later faction affiliation does not establish pre-election component membership. |

## Every non-OK finding

| Findings | Decision, independent check and changes |
|---|---|
| Codex F01 / Opus 2 | **Fixed.** R/C/A agree on יט. Corrected letters to יט in raw national/roster/elected inputs and metadata. Per the coordinator’s subsequent cross-election decision, opaque list/candidate IDs remain `15-ט` / `15-ט#rank`, with matching context, agreement/bloc, list-meta, bios, party-link, registry/lineage and family references; see the follow-up below. Votes remain 100181 and seats 4. |
| Opus 3 (Codex concluding observation disagrees) | **Fixed.** Enlarged retained R p.3376 shows קפ, as do C p.3047 and W2 p.3269. Codex's statement that R prints קף is a visual-reading error. Corrected letters to קפ while retaining stable `15-קף` IDs, registry vehicle and dependent links/family references per the follow-up below. No numeric change. |
| Codex F02 / Opus 11 | **Fixed.** R's One Israel includes Labor, Gesher and Meimad; later Labor–Meimad faction name is not the ballot label. Correct list-meta English and k15 vehicle English name to One Israel. |
| Codex F03/F04 / Opus 1 | **Fixed, with rejected subclaim.** C confirms both registered lists; W1/W2 settle withdrawal mechanism and dates. Add 0-vote/0-seat presentation records with withdrawn=true, complete 1/4-candidate registrations and statutory source IDs/notes. Zero is a placeholder for absent final-result rows, not a published vote count. Codex F04's שמעוני דן and בסעדה רחל are not printed in C. The printed names are קרמר רוני, קליין דוד, שוגרמן דוד, **בסעוד שחל**. W1 spells the last candidate **שחל מסעוד**, a surname variant; retain C's registration spelling, record the variant here. New English names are project translations, not official English registrations. Builder support is limited to evidence-backed withdrawn records; no invented elected list entries. |
| Opus 4 | **Fixed.** C and R both print גאגולה איסק; O's later יצחק גאגולה does not override contemporaneous notices. Correct both transcriptions and add a sourced candidate note documenting the distinction. Preserve PersonID 485, biography and English rendering. |
| Opus 5–10 / Codex F05 | **Fixed.** R p.3376 controls full ballot names: Balad, Negev, Casino, Da'am, New Arab and NRP/Moreshet/Shas punctuation. Changes to dedicated k15 vehicles and family cached names follow the corrected dataset. Shared historical party names (e.g. NRP, Shas, Da'am across other elections) are not globally overwritten with one year's ballot text. |
| Codex F06 / Opus 13 | **Fixed.** Refresh k15 hashes in lineage, registry and nine family records from rebuilt bytes; update k15 family cached names and identity pointers. Other elections' hashes preserved. |
| Codex F07 | **Fixed.** Re-read R: source description now includes both PM/Knesset results and the separate Deri resignation notice. |
| Codex F08 / Opus 14 | **Fixed evidence claim.** R establishes signed/published 25 May; O gives opening membership 7 June. G independently establishes government 28 tenure. Replace stale gaps and death-template wording; retain uncertainty about an earlier certification act, first-sitting protocol and intermediate legal acts. Do not interpret an OData record boundary as independently proved legal resignation time. |
| Codex F09 / Opus coalition sourcing flag | **Fixed.** I confirms September, not 5 September. Reduce note precision in meta and aftermath; add independent IDI evidence for the 75-seat coalition. Party-affiliated contemporary reporting is not used to upgrade the day. Coalition 75 and qualified later IPU 73 are different snapshots, not unresolved competing founding totals. |
| Opus 12 (Codex O16 says OK) | **Fixed.** D's explicit primary account decides 5 November dissolution versus IPU's 11 November election-date decision. Change aftermath ending act/date/text/citation. The election-to-election term endpoint remains 28 January 2003. |
| Codex F10–F14 / Opus component sourcing flag | **Retained limitations.** Re-read every stored component rank set and its source qualifiers against C and O. Official names establish alliance composition, not every personal component allocation. Existing secondary-affiliation flags remain; no invented replacement allocation. Regenerated joint-facts using the repaired upstream compiler: all five k15 records have zero unknownFaction; UAL retains **one unknownElected** for explicitly unassigned rank 3, not a name-matching failure. No change to scripts/joint-facts.ts. |
| Codex F15 | **Partial independent recheck; retained destination limitation.** All 120 populated English names exactly match retained official knesset-site-mk-names-en.json keyed by their bio siteId. Bios IDs migrate with National Union; pattern verification qualifiers remain. This does not authenticate each live biography/Hebrew-Wikipedia destination or preferred 1999 transliteration. |
| Codex F16 | **Retained limitation.** Read all overlay entries and coverage gaps; preserve platform attribution as party material and Hebrew-Wikipedia labels as secondary. Add official resignation links/gaps for the two new registrations. No blanket assertion that all platform/article payloads were opened. |
| Codex F17/F18 / Opus logo sourcing flag | **Fixed evidence status.** Existing Commons descriptions identify the claimed variants, but are not independently verified contemporary-use records. Both statuses verified → unresolved; retain assets, hashes and source metadata, suppress displayed logos. Centre licence explicitly labels Commons uploader assertion; duplicated Unknown author fixed. No new image research. |
| Codex F19 | **Retained limitation.** Recheck registry/family/lineage k15 references, composition, votes, cached identities and hashes with validators. This proves consistency, not every broad ideological/history claim. Preserve research-draft/editorial qualifiers and avoid unsupported recategorisation. |
| Codex F20 | **Retained limitation.** Reaction/polling gaps describe work not collected, not historical absence. Qualified IPU snapshot and pending term acts remain. No invented polling, recommendation round or new chronology promotion. |
| Codex F21 | **Fixed provenance.** Keep R's 1,791,020 PM votes; record indexed Knesset summary's 1,791,021 discrepancy with index-only qualification. Contemporary statutory notice beats later summary even within rank 1. Both PM ballots' counts remain unchanged. |

Opus advisory flags: PM withdrawals now cite A (16 May 1999) rather than secondary IDI; JVL is explicitly a mirror in publisher metadata; coalition and logo handling above cover the other flags. October event wording now follows the official riots terminology, preserving police-fire killings and the existing IDI citation in both languages. Ze'evi and the founding confidence tally remain pending; neither was required to repair an established error.

## Owner questions

None. Source evidence decides the actual disagreements. The nine remaining groups are verification coverage limitations, not equally supported competing values for owner arbitration.

## Changes visible to users / browser-test coordination

| Before | After |
|---|---|
| Displayed ט (stable ID 15-ט) | Displayed יט (same stable ID) |
| Displayed קף (stable ID 15-קף) | Displayed קפ (same stable ID) |
| Labor–Meimad (1999 list) | One Israel |
| גאגולה יצחק | גאגולה איסק, with variant note |
| אלתג׳מע אלוטני אלדימוקרטי (בל״ד) | אלתג׳מע אלוחדוי אלדמוקרטי (בל״ד) |
| מפלגת הנגב | מפלגת נגב |
| מפלגת הקזינו - עזרא טיסונה מוסד ההימורים הישראלי | מפלגת הקזינו - עזרא טיסונה מיסוד ההימורים בישראל |
| אירגון הפעולה הדמוקרטי דע״ם | ארגון הפעולה הדמוקרטי דע״ם |
| ערבי חדש | הערבי החדש |
| המפד״ל - המפלגה הדתית לאומית המזרחי - הפועל המזרחי | המפד״ל - המפלגה הדתית לאומית, המזרחי - הפועל המזרחי |
| מורשת אבות בראשות הרב בא-גד | מורשת־אבות בראשות הרב בא־גד |
| ש״ס התאחדות הספרדים העולמית שומרי תורה | ש״ס - התאחדות הספרדים העולמית שומרי תורה |
| Two absent lists | מנהיגות יהודית לישראל / Jewish Leadership for Israel (ני); קול הסביבה / Voice of the Environment (ק), both withdrawn |
| UTJ left on 1999-09-05 | left in September 1999 (exact day not independently established) |
| Two displayed list logos, verified | Both withheld, unresolved in provenance metadata |
| PM withdrawal sources: IDI | CEC / Reshumot YP 4755, 16 May 1999 |

Status clarification: “no full rosters” → “no full winning-list rosters”; “Zero-seat rosters unavailable.” → “Contesting zero-seat rosters unavailable; two withdrawn registrations retained.” Hebrew: “אין רשימות מלאות” → “אין רשימות זוכות מלאות”; “רשימות ללא מנדטים אינן מתועתקות.” → “רשימות שהתמודדו ולא זכו במנדטים אינן מתועתקות; נשמרו שתי רשימות שפרשו.” The hand-maintained elections.json index and nine family snapshots follow this clarification. No bloc-scheme title changed. Aftermath remains a research draft not wired into the app; its ending-act and riots prose changes therefore introduce no current screen labels.

## Reproduction and verification

Node 24.18.0; repository lockfile dependencies. Reused installed dependencies with local scratch cache links. Only public/data/k15.json and sources.json change among built outputs; the hand-maintained elections.json input also changes; other 25 national datasets are byte-identical. Build timestamp/source hashes change as expected. Field comparison by migrated identity finds only the labels above, Gagula's note/name, National Union candidate IDs, two removed logo refs, two new withdrawn records, ID-bearing agreement/seat keys, coalition evidence/note, clarified roster status and build provenance. Published votes/seats, retained candidate rank order, rules and agreement pairings are unchanged.

A scratch differential harness substitutes HEAD's k15 only at scenarioFromDataset: it reproduces **all five previous digests** exactly (allocation bf50217e…, model 4faa7f17…). Current allocation is 52d8f62f… and model 99089dfd…; analysis, validation and rules unchanged. The digest fixture comment records the cause. No engine/model implementation changed.

Required order: `BUILD_JOBS=2 node scripts/build-datasets.ts`; refresh only k15 family/registry/lineage hashes; `node scripts/validate-families.ts`; `PYTHONPYCACHEPREFIX=.backup-scratch/data-audit/k15/pycache python3 scripts/validate-party-logos.py`; `npx tsc -p tsconfig.json --noEmit`; `npx vitest run --maxWorkers=2 --testTimeout=120000 --hookTimeout=120000`. Extended timeouts bound concurrent-host-load effects without changing repository policy. Initial suite exposed expected fixtures/coverage updates and sandbox EPERM for gallery's child Node process; final suite uses local subprocess permission. No Playwright, push or main integration.

## Files changed

- `CHANGELOG.md`
- `data/meta/aftermath/k15.json`
- `data/meta/bios/k15.json`
- `data/meta/candidate-notes.json`
- `data/meta/election-context.json`
- `data/meta/families/arab-arab-jewish.json`
- `data/meta/families/centre.json`
- `data/meta/families/haredi.json`
- `data/meta/families/herut-likud.json`
- `data/meta/families/labour-zionist-left.json`
- `data/meta/families/national-religious.json`
- `data/meta/families/radical-right.json`
- `data/meta/families/religious-parties.json`
- `data/meta/families/russian-speaking-immigrant.json`
- `data/meta/joint-facts.json`
- `data/meta/k15.json`
- `data/meta/logos/k15.json`
- `data/meta/parties.json`
- `data/meta/party-lineage.json`
- `data/meta/party-links/k15.json`
- `data/raw/SOURCES.json`
- `data/raw/k15/candidates.reviewed.json`
- `data/raw/k15/elected.reviewed.json`
- `data/raw/k15/national.reviewed.json`
- `public/data/elections.json`
- `public/data/k15.json`
- `public/data/sources.json`
- `scripts/lib/historical/k13-k15-common.ts`
- `scripts/lib/list-meta.ts`
- `tests/differential.test.ts`
- `tests/election-context.test.ts`
- `tests/historical-k13-k15.helpers.ts`
- `tests/historical-k15.test.ts`
- `data/raw/k15/gov28-tenure.pdf`
- `data/raw/k15/cec-dissolution.pdf`
- `docs/research/data-audit/k15-resolution.md`

Final checks: **95 Vitest files / 905 tests passed**, including historical-k15 and all five differential families; family validation (9 presets), logo validation (26 overlays / 184 source records), TypeScript and git diff --check passed. The final source-catalogue-only deduplication reuses byte-identical retained resignation PDFs; a second build confirms k15 dataset bytes unchanged.

## Coordinator follow-up — stable opaque IDs

The coordinator’s cross-election decision supersedes the initial ID migration. Restore every list/candidate key and reference to **15-ט**, **15-ט#1–5**, and **15-קף** (including the vehicle/lineage/context keys derived from them). Historical ballot-letter fields remain **יט** and **קפ**, and all corrected names and prior audit fixes remain. The note in data/meta/k15.json explicitly explains that the keys predate the letter corrections. Raw transcriptions and logo metadata continue to use actual printed letters; they are not opaque-ID keys.

The election-specific builder resolves these two historical keys separately from displayed letters, including candidate IDs, agreement members and official-seat keys. It preserves existing list-meta identities/colours, bios and related data. scripts/joint-facts.ts is unchanged; its output was regenerated from the restored keys. Family/registry/lineage k15 hashes were refreshed.

UI/export check: searched all src TypeScript/TSX for ID suffix extraction (`slice`, `split`, `substring`, `substr`, `replace`) and for assignments combining letters with IDs. No runtime ballot display/export derives letters from a list ID. Inspected Slip/ui.tsx, ListBars, ListSidePanel, Walkthrough and FamilyPoint (each uses the list’s letters field), TopBar CSV rows (`l.letters`), JSON/scenario creation (`letters:l.letters` alongside the preserved id), and synthetic SVG (`p.letters`). IDs remain identifiers in serialized scenarios and DOM keys, not displayed letter strings. One builder diagnostic and two historical-test expectations that inferred letters from IDs now look up the list’s letters. The schema comment now identifies IDs as opaque stable keys.

Regression coverage renders the actual Slip component with the rebuilt scenario, verifies יט/קפ text and stable origin/candidate IDs, and checks National Union agreement/biography references. Browser/Playwright tests were not run.

Recursive comparison with e543560 after canonicalizing only `15-יט` → `15-ט`, `15-קפ` → `15-קף` in keys/reference strings and normalizing builtAt is **exactly equal**. All other 25 national datasets are byte-identical. Thus no names, displayed letters, votes, seats, ranks, colours, flags or source evidence changed. The dataset hash was refreshed in all k15 consumers. The old audit finding is settled historically; this follow-up changes compatibility keys only.

The differential harness substitutes e543560’s k15 dataset at scenarioFromDataset and reproduces all five prior digests: allocation 52d8f62f… and model 99089dfd…. The restored-key digests are allocation 5857d33b… and model 65183270…; analysis, validation and rules are unchanged. The fixture documents this narrow field diff.

Follow-up verification: **95 files / 906 tests passed**, including 6 historical-k15 tests and all five differential checks. TypeScript passed after removing the now-unused ID-suffix helper variable. Family validation (9 presets), logo validation (26 overlays / 184 source records) and git diff --check passed. Final BUILD_JOBS=2 rebuild wrote **0 files, 38 unchanged**. No Playwright or push.

## 7 November 2026 — pre-release identity correction

Owner direction supersedes the earlier stable-ID compatibility rule: internal list IDs now follow the corrected official ballot letters, with candidate IDs and all references updated and no aliases or migration. `15-ט` → `15-יט`; `15-קף` → `15-קפ`. Votes and seats are unchanged.
