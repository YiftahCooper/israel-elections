# k12 reconciliation — 6 November 2026

Both reports were merged after `origin/main` (including the 6 November source hierarchy and joint-faction name fix). All 37 numbered non-OK report rows were reconsidered. Outcome by report row: **31 corrected or qualified, 1 rejected proposed value (Codex F06), 5 retained evidence limitations; 0 owner questions**. Overlapping auditor rows are counted separately, not as independent historical errors. No vote, seat allocation, list ID, candidate ID or lineage key changed.

## Deciding evidence

Rank 1: retained [YP 3588](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset12-cand.pdf), printed pp.146–170 (`data/raw/research/k12-candidates.pdf`), and [YP 3591](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset12-results.pdf), pp.242–244 (`k12-results.pdf`), re-rendered and visually read for the corrections below. The results table and candidate headings agree on the seven corrected letters. Gazette final/nonfinal letter forms are retained as printed: זעמ and יענ.

Rank 1 deciding coalition source: [Knesset plenum, 22 December 1988](https://fs.knesset.gov.il/12/Plenum/12_ptm_531200.PDF), printed p.238, Ravitz: **“נגזר עלינו לשרת את בוחרינו כאופוזיציה”**. The same speech says **“אנו נצביע היום בעד הממשלה”**. Both passages were inspected in the PDF; support in the confidence vote does not establish coalition membership. The original 97-seat classification, accepted by Opus from later secondary sources, loses to this contemporaneous official statement. Opening coalition: Likud 40 + Alignment 39 + Aguda 5 + NRP 5 + Shas 6 = **95**, opposition **25**. Later support or later membership is not projected backwards.

Rank 1 deciding Reiser source: [Knesset personal details, site ID 623](https://main.knesset.gov.il/mk/apps/mk/mk-personal-details/623): **“תאריך פטירה: ט״ז בחשוון תשמ״ט , 27/10/1988”**. Retrieved normally; exact excerpt retained and hashed as `k12-reiser-personal-details`. The wrong MKID query returned only a generic shell; the actual member route supplies the death date. No inference from a membership FinishDate is needed.

Access date for all new checks: 2026-11-06. PDF rendering: Python 3.14 / PyMuPDF 2.1 (see installed scratch environment for exact package version); build Node 24.18.0 and lockfile dependencies. Disposable renders, downloaded plenum working copy and test logs are in `.backup-scratch/k12-fix/`. Durable evidence consists of retained official gazettes, the new Knesset excerpt, source manifest, input quotations and this resolution.

## Every non-OK finding

`O` = Opus numbered row; `C` = Codex F-number. Generated k12 data is rebuilt from the named inputs.

| Finding | Decision, evidence and changes |
|---|---|
| O1 / C01 | Correct זכ, **אחדות – למען ויקטור תייר לכנסת**; C p.153 and R p.242: “זכ”, “ויקטור תייר”. Raw national, meta, short-label map, party registry, party-link title; English transliteration corrected. |
| O2 / C02 | Correct **זעמ / תרשיש**; C p.154: “אות הרשימה: זעמ”, “הכינוי: תרשיש”; R p.242 agrees. Same input chain, English `Tarshish`. |
| O3 / C03 | Correct **מעש / תנועה למען מושבים, ערי פיתוח ושכונות**; C p.156/R p.242: “מושבים”. Same chain; comma is display punctuation. |
| O4 / C07 | Correct **קמע / גימלאים**; C p.164/R p.242. Raw letters/name corrected; existing short labels “גימלאים” / “Pensioners” retained. |
| O5 / C06 | **Reject Codex’s proposed קס; accept Opus’s קם.** Independently magnified C p.164 and R p.242 both read “קם”. The final mem is boxed, unlike same-page samekh. Actual input קק is corrected to קם. This is a transcription disagreement, settled by the official documents, not an unresolved equal-rank source dispute. |
| O6 | Correct **יענ**, including the קז–יענ surplus agreement. C p.155 and connection notice p.170: “התנועה למען חברה צודקת – קז עם התאחדות התימנים בישראל – יענ”. Raw agreement uses corrected letters; generated agreement members retain opaque IDs `12-קז`, `12-יע`. |
| O7 / C08 | Correct **טיף** (C p.154/R p.242). Meta/raw and both relevant family member letter fields corrected; stable `12-טף` preserved. |
| O8 / C09 | Correct Shinui title’s **ל״ע**, not לע״מ: C p.150 and connection notice p.170. Raw/meta, centre family and registry corrected; no change to elected affiliations. |
| O9 | Correct **פארס חסיין**, candidate rank 3 of Mapam, in candidate transcription and its cross-check spelling record. C p.157: “פארס חסיין”; R p.244: “חסיין פארס”. |
| O10 | Remove the 2020 Derech Eretz party’s article from the unrelated 1988 list. C p.154 names the 1988 candidates (אורבך טל נפתלי דב, קבלאן נביל); the linked article described Hendel/Hauser. A structured neutral-link gap replaces it. |
| O11 | Correct Reiser context date to **1988-10-27**, explain death before polling. Official personal page quoted above; context and hashed retained excerpt changed. Registered rank 25 remains present and `notSeated`; all IDs retained. |
| O12 | Narrow stale aftermath gap: results published **9 November 1988**, R p.244, and opening membership **21 November 1988**, retained OData. Do not claim a first-sitting protocol was fetched. |
| O13 / C04 | Refresh lineage and all nine family source hashes to rebuilt k12 bytes; refresh family dataset status copies. Local byte hashes are the proof. |
| O14 | Three English list transliterations corrected from the newly checked Hebrew names; explicitly unofficial transliterations remain labelled. |
| O15 | Preserve raw official English-header extract; add k12-only reviewed display overrides **Moshe Zeev Feldman**, **Yehoshua Sagi**, with explicit transliteration provenance and candidate notes explaining “Moseh  Zeev” / “Yeushua”. Hebrew official names in C/R identify the spelling being transliterated; no claim that the Hebrew notice supplies official English spellings. |
| O16 / C15 | Mark **Moledet and Mapam campaign-use status unresolved**, retain assets but withhold their display. Rechecked retained source-catalogue qualifications: Moledet description says election 12 while date says 1992-01-01; credited NLI item not inspected. Mapam’s description identifies a 1988 broadcast tracing, but the underlying broadcast frame was not independently inspected. No new image research, no invented replacement. Opus’s Mapam OK and Codex’s narrower limitation are reconciled conservatively. |
| O17 | JVL chronology source relabelled `secondary`, explicitly a mirror of Knesset history. Does not count twice or claim official hosting. |
| O18 | Explain in Shinui meta why Liberal Centre is not assigned a constituent seat/candidate: the official title names it, but title alone supplies no individual affiliation. Both elected candidates remain Shinui; Independent Liberals have zero elected. No invented party-seat split. |
| O19 | Retained evidence limitation, handled alongside C11: no admissible contemporary named-party confirmation for Hadash/PLP/ADP. No competing recommendation invented. |
| O20 | Add candidate note: C p.146 registered **בורג אברהם**, later R p.243 elected **אברם בורג**. These concern registered versus declared-elected spelling, not conflicting identities. Preserve registered name and explain later variant. No owner arbitration needed. |
| C05 | Correct opening coalition **97–23 → 95–25** by primary plenum statement above. Meta/aftermath counts, memberships and source notes corrected. |
| C10 | Correct release-index input/status to **121 retained candidate entries (120 declared elected)**. Recounted arrays: Likud 41 including Reiser; overall 121/120. Build copies corrected status to dataset; family copies refreshed. Other amendment-chain limitations remain. |
| C11 | Remove excluded +972 source and unsupported definitive Peres assignments for Hadash/PLP/ADP. Meta and aftermath show **49** named-party Peres seats and **8 unconfirmed** (including Degel); notes preserve separately reported aggregate **63/55** as a report, never as proof of per-party recommendations. Hebrew searches did not produce an admissible deciding named-party record. |
| C12 | Retain amendment/withdrawal-chain limitation. R/C do not certify every subsequent correction. No missing withdrawn approved list was established; Kach remains a disqualification context, not a fabricated zero-vote withdrawn list. Reviewed k22/k24 mechanism; it is not applicable without evidence of a k12 withdrawal. |
| C13 | Retain pattern verification of bio destinations. Official member page 623 was individually read for Reiser, not extrapolated to 121 others; opening person-set match is not URL verification. |
| C14 | Retain general English-spelling coverage limitation; two concrete display typos handled under O15. Official raw extract remains intact. No wholesale transliteration certification. |
| C16 | Retain qualified constituent/profile/lineage/family coverage. Regenerated baseline `joint-facts.json` now has **zero unknown elected and unknown faction counts** for all three k12 joint lists (ג, ו, הן); no residue requiring input repairs. Affiliations remain differentiated from later factions and editorial families remain labelled inferred. Existing medium confidence for Hadash is not upgraded to rank-1 constituent proof. `scripts/joint-facts.ts` unchanged. |
| C17 | Degel’s formal recommendation remains **unconfirmed**, replacing definitive “none”. Support for a broad government is not a formal abstention. Same unconfirmed bloc as C11; no false claim that Degel recommended a different person. |

Opus’s unclassified replacement table was also checked against retained membership dates. The product’s released roster is the registered winning prefix with opening-election exceptions, not a complete membership ledger; do not add nine midterm entrants to the candidate prefix or infer their registered rank from matching entry dates. The retained OData keeps this information available; no false completeness claim added.

Other discrepancies are preserved in the research record: the later CEC summary’s cast total 2,305,252 loses to gazetted valid 2,283,123 + invalid 22,444 = **2,305,567**, independently matched by CBS. IDI’s Tehiya 70,370 / Quiet Power 1,574 lose to the official results **70,730 / 1,579**. These are rejected alternative source values, not changes to correct app totals.

## Stable identifiers and display verification

Coordinator decision: **every internal list/candidate ID remains byte-for-byte unchanged**. National review supplies `legacyId` for seven corrected letter records; minimal builder support uses it for lists, agreements, seats, candidate IDs and metadata lookup. It defaults to existing behaviour for every other election. The election meta explains that these IDs predate the correction. Party registry IDs, lineage edges, candidate notes, scenario action references and share keys remain stable.

Read `src/model/scenario.ts` (origin IDs/actions/import schema), `src/app/components/TopBar.tsx` (CSV explicitly exports `l.letters`), `src/app/components/ui.tsx` / `Walkthrough.tsx` (ballot display explicitly uses letters), synthetic image export, scenario annotations and `src/app/actionDescription.ts` (resolves names). Family runtime resolves historical names through dataset keys; removed its unknown-key fallback that stripped digits from an ID and could expose old letters. Matching unknown-list fallbacks in comparison, warning text, source preferences and What if now use the same generic label instead of exposing full IDs. Unknown entries now say **Unknown list / רשימה לא ידועה**. Added tests exercise corrected letters, unchanged IDs/agreement references, Degel opening placement and runtime lookup/fallback. Portable JSON still exports opaque IDs intentionally, alongside corrected `letters`; they are not presented as ballot text. Existing saved scenarios are historical snapshots; no destructive migration of stored user content was attempted.

## Owner questions

None. Remaining items are explicit evidence limitations, not competing equal-rank historical claims requiring an owner choice.

## Regeneration and validation

`BUILD_JOBS=2 node scripts/build-datasets.ts`; refresh k12-only family/lineage hashes and status; `node scripts/validate-families.ts`; `PYTHONPYCACHEPREFIX=.backup-scratch/k12-fix/pycache python3 scripts/validate-party-logos.py`; `npx tsc -p tsconfig.json --noEmit`; `npx vitest run --maxWorkers=2`.

Recursive field comparison against the merged audit baseline confirms only k12 changed among the 26 national dataset files: corrected letters/names, two English display overrides, three candidate notes, removed wrong party link, withheld two unresolved logos, opening coalition/recommendation groups, and status/source hashes/build timestamp. All list/candidate IDs, votes, allocated seats, agreement ID/member references, roster order and colours remain equal. Allocation/analysis/validation/rules differential digests stay unchanged; only the model digest changes for reviewed display/metadata corrections. Shared source catalogue adds the Reiser excerpt and corrected input hashes.

Initial checks exposed a read-only shared Vite cache and a sandbox-denied test subprocess; local cache paths were created under the worktree and the full suite rerun with subprocess permission. No global cache settings changed. Final test results are recorded below after completion. No Playwright, push or main integration.

Final verification: dataset rebuild successful (only k12 national data changed); family validation passed for all nine presets; logo validation passed for 26 overlays / 184 source records / 131 retained assets (139 hosted entries, 9 unresolved); TypeScript passed; **95 Vitest files / 905 tests passed**, including historical-k12 and all five differential families. `git diff --check` passed. New model digest: `69dd044dc9d0e04edd52fb0cb91b3fd2df6e0d7dd281e6c369bb6d03b09b1bd7`.

On-screen/export changes for integration browser tests:

- Ballot letters: `זב → זכ`, `זפ → זעמ`, `טף → טיף`, `יע → יענ`, `מעם → מעש`, `קק → קם`, `קצץ → קמע` (internal IDs unchanged).
- Hebrew names: `אחדות – למען ישועה וחיים לכנסת → אחדות – למען ויקטור תייר לכנסת`; `זעם ורעש → תרשיש`; `תנועה למען מועמדים־ערי פיתוח ושכונות → תנועה למען מושבים, ערי פיתוח ושכונות`; full pensioners name `הגימלאים → גימלאים`; Shinui title substring `שינוי־לע״מ־המרכז הליברלי → שינוי – ל״ע – המרכז הליברלי`.
- English list labels: `Ahdut – Lemaan Yeshua VeHayim → Ahdut – Lemaan Victor Tayar LaKnesset`; `Zaam VeRaash → Tarshish`; `Tnua Lemaan Muamadim – Arei Pituah UShkhunot → Tnua Lemaan Moshavim, Arei Pituah UShkhunot`.
- Candidate labels: `פארס חסין → פארס חסיין`; `Moseh  Zeev Feldman → Moshe Zeev Feldman`; `Yeushua Sagi → Yehoshua Sagi`. New explanatory candidate notes for Feldman, Sagi and Burg; Burg’s registered display name itself unchanged.
- Opening coalition/opposition counts: `97/23 → 95/25`, Degel moved to opposition. Scheme titles and Coalition/Opposition labels unchanged.
- Recommendation group: `No recommendation (backed a broad government) → Recommendation unconfirmed`; `לא המליצו (תמכו בממשלה רחבה) → המלצה לא מאומתת`. Hadash/PLP/ADP move from Peres to unconfirmed; Degel from none to unconfirmed. Display group counts `63/55/2 → 63/49/8`.
- Data status phrase: `120 transcribed ranks → 121 retained candidate entries (120 declared elected)`; `120 מועמדים תומללו → 121 מועמדים נשמרו (120 הוכרזו נבחרים)`; `asOf 2026-11-03 → 2026-11-06`. Stage remains official-final.
- Reiser context: opening-day omission with unknown cause/date → documented death before polling, `1988-11-21 → 1988-10-27`.
- Unknown-list fallback: stripped/full ID text → `Unknown list / רשימה לא ידועה` (family runtime, comparison/warnings/preferences/What if).
- Mapam/Moledet logos: shown → withheld (`verified → unresolved` in source overlay). Unrelated 2020 Derech Eretz history link: shown → removed. Aftermath research source-kind/gap text is corrected, but aftermath remains unwired into the current UI.
