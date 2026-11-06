# k13 audit reconciliation — 6 November 2026

Fixer: Codex. Inputs: [Opus](k13-opus.md) and [Codex](k13-codex.md), merged after fast-forward check against origin/main. Binding hierarchy: [source-hierarchy.md](../source-hierarchy.md), 6 November revision. No push, main merge or Playwright.

Of **49 numbered report rows (overlaps counted)**: **40 corrected/refreshed, 1 rejected, 8 retained research limitations; 0 owner questions**. “Corrected” includes stale provenance/gap text and integrity refreshes; it does not mean 40 independent factual defects. All votes, seats, threshold and candidate ranks remain unchanged.

## Evidence independently rechecked

- **R, rank 1:** [Reshumot YP 4021, 1 July 1992, pp. 3776–3777](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset13-results.pdf), retained `data/raw/research/k13-results.pdf`. Visually rendered the original scan, including the three letter cells and elected names. “נד”, “נכ”, “קן”; “התנועה הלאומית לדמוקרטיה ועליה”; “גימלאים, עולים וקשישים”; “התחיה”. Quotes normalize typography, not words.
- **C, rank 1:** [YP 4017 candidate notice](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset13-cand.pdf), retained official scan and [IDI facsimile p. 3636](https://www.idi.org.il/media/6891/%D7%9B%D7%A0%D7%A1%D7%AA-13-%D7%94%D7%9C%D7%99%D7%9B%D7%95%D7%93.pdf), [p. 3638](https://www.idi.org.il/media/6695/%D7%9B%D7%A0%D7%A1%D7%AA-13-%D7%9E%D7%A8%D7%A6.pdf), [p. 3642](https://www.idi.org.il/media/6608/%D7%9B%D7%A0%D7%A1%D7%AA-13-%D7%9E%D7%93%D7%A2.pdf). Visually read p. 3629 “גוז׳נסקי תמר”, p. 3631 “ציפור”, p. 3633 “התורה והארץ בראשות הרב משה לוינגר” and “התקוה - תנועה חברתית לוחמת”, p. 3635 “תל״י תנועה להתחדשות ישראל”, p. 3638 “פורז פוזמנטיר אברהם”, p. 3642 “דראושה עבד-אלוהאב”. Candidate titles settle faint/omitted letters in the result transcription. Neither the results scan nor handwriting should be described as uniformly identical to the candidate notice.
- **G, rank 1:** Fresh ordinary-UA [Knesset OData GovernmentNum 25](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PersonToPosition?$filter=GovernmentNum%20eq%2025&$format=json), HTTP 200. Row 4318: `PersonID:456`, `PositionID:45`, `GovernmentNum:25`, `StartDate:1995-11-05T00:00:00`, `FinishDate:1995-11-22T00:00:00`; Rabin row 4178 ends 4 November. This independently establishes the succession and end date, without relying on Wikipedia or equating the assassination with government termination.
- **P, rank 1:** Fresh HTTP 200 [first-sitting transcript](https://main.knesset.gov.il/Documents/FB/rabin001-92jul13.pdf), 80 pages: “הישיבה הראשונה של הכנסת השלוש=עשרה”, “13 ביולי1992”. Fresh HTTP 200 [coalition agreements](https://main.knesset.gov.il/mk/government/documents/cagreement25.pdf), 10 pages, separately names agreements with Meretz and Shas (“הסכם קואליציוני בין מפלגת העבודה הישראלית לבין”). Replaces empty-heading evidence; 62-seat coalition is distinct from the 67-vote confidence tally.
- **L, rank 1:** Fresh HTTP 200 [Knesset law row 2000623](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_IsraelLaw?$filter=IsraelLawID%20eq%202000623&$format=json): `Name: חוק התפזרות הכנסת השלוש-עשרה, התשנ"ו-1996`, `PublicationDate:1996-02-27T00:00:00`. Publication is not approval: the Codex lead's 26 February approval and Opus's 27 February publication concern different acts. Preserve month precision for the decision, add exact publication wording.
- **I, rank 2:** Reopened [IDI 1992](https://www.idi.org.il/policy/parties-and-elections/elections/1992/): “בלוק חוסם של 61 חברי כנסת”, coalition “שלוש סיעות שלהן רוב של 62 מושבים”; Hadash/ADP external support. Official 166,366 Tzomet votes beats IDI's 165,366; do not import the typo. Reopened [IDI disqualifications](https://www.idi.org.il/articles/65951): both Kach and Kahane Chai, hence plural wording.

All accesses 6 November 2026. Scratch rendering used PyMuPDF 2.1; no OCR was treated as proof. Reproduce core outputs from retained sources with `BUILD_JOBS=2 node scripts/build-datasets.ts`; regenerate joint facts with `node scripts/joint-facts.ts` (script unchanged), refresh k13 hashes in family/registry/lineage sources, then run the checks below. Dependencies come from the repository lockfile. Scratch contains only reproducible tooling, copies and diagnostics.

## Finding-by-finding decisions

O numbers refer to Opus's numbered non-OK rows, F numbers to Codex's. Generated `public/data/k13.json` and `sources.json` are rebuilt from inputs.

| Findings | Decision and deciding evidence | Input files changed |
|---|---|---|
| O1, O3, O4; Codex OK-letter disagreements | Correct נז→נד, נס→נכ, קנ→קן. R letter cells decide. Preserve opaque pre-correction list/vehicle keys; correct only ballot letters (coordinator follow-up below). Zero-seat counts unchanged. | `raw/k13/national.reviewed.json`, `meta/parties.json`, `meta/party-links/k13.json`, `meta/families/centre.json`, `scripts/lib/list-meta.ts` |
| O2 / F05 | “ועולים משוחררים”→“וחיילים משוחררים”, with comma, R. | national transcription and registry |
| O5 / F02 | ציפר→ציפור, Tziper→Tzipor; C p. 3631 decides the title. | national, registry, links, list-meta |
| O6 / F04 | התורה הארץ→התורה והארץ; C p. 3633. | national, registry, family member labels, links, list-meta |
| O7 / F03 | לרווחה→לוחמת; C p. 3633 and R. | national, registry |
| O8 / F01 | הלאומית הדמוקרטית→הלאומית לדמוקרטיה; R. English editorial label updated accordingly. | national, registry, links, list-meta |
| O9 / F06 | Remove invented בישראל; use גימלאים, עולים וקשישים, R. | national, registry |
| O10 / F07 | תחיה→התחיה, R. | national, dated registry name |
| O11 | Remove extra ה in תל״י title, C p. 3635. | national, registry |
| O12 | Add official Meretz/NRP punctuation, R. | national, meta/k13, dated registry names and matching family labels |
| O13–15; Codex roster-OK disagreements | Correct זוילי, פוזמנטיר and גוז׳נסקי, R/C. A zoomed C p. 3629 clearly shows the apostrophe. | candidates/elected transcriptions, correction evidence |
| O16 | **Rejected.** C p. 3636 rank 12 visibly prints **בן-אלישר אליהו**, with hyphen. R §4 rank 11 prints בן אלישר. The auditor's claim that neither notice has a hyphen is false. Keep each notice's own form. | None; regression assertion protects registered spelling |
| O17; Codex roster-OK disagreement | Correct registered עבד-אל-והאב→עבד-אלוהאב; C p. 3642; elected form already agrees. | candidates transcription |
| O18 / F08–09 | Government 25 ends 22 November; add acting Peres 5–22 November, G. Keep Rabin's personal end date. | aftermath/k13 |
| O19 | Refresh lineage hash after corrections. Its old reported hash had already been updated on main; no remaining historical claim dispute. | lineage, registry source and nine family hashes |
| O20 | Propagated names corrected consistently; R/C as above. Internal IDs retain their original values. | registry, links, families, list-meta |
| O21; Codex O46 editorial note | Two excluded lists and appeals, I. No change to election-day status date. | election-context |
| O22 / F14 | Replace stale first-sitting/results-publication gap; R/P. Do not invent an earlier certification act. | aftermath/k13 |
| O23 / F22 | Resolve publication/approval distinction with L. Remove obsolete “unverified” wording, retain month-level decision date. | aftermath/k13 |
| O24 | Normalize literal API backtick to apostrophe for k13 Cohen display only. Preserve raw API bytes and all other elections. This is typography, not a new English-name authority. | bios build overlay and its test |
| O25 | Arens's correct printed rank 2 is in C p. 3636, missing from gov.il scan. Cite retained IDI-hosted official facsimile. Cause/date of omission remains uninferred. | election-context |
| F10 | Correct Commons File namespace in both overlay and evidence registry. | logos/k13, logos/sources |
| F11–12 | Confirmed held citations refer to Yisrael BaAliyah/Morasha, not Moria/Degel. Remove false provenance; retain low-confidence unsourced display convention, no invented historical colour. | meta/k13 |
| F13 | Replace generated output masquerading as official evidence with R. Explicitly separate Peretz's official inclusion from secondary Moria affiliation. | meta/k13; regenerate joint-facts |
| F15 | Primary coalition agreements confirm partners. Upgrade scheme sources and remove stale gap, P/I. | meta/k13, aftermath/k13 |
| O26 / F16 | **Retain unknown**, ten entries/120 seats. Fresh Hebrew searches recovered JTA consultations and the same excluded opinion-column lead, no faction-level qualifying record. No inference from blocking/coalition/confidence totals. | None |
| F17 | **Retain incomplete agreements**, not “no historical agreements”. Rechecked held agreement search and Hebrew search; no primary pair notice recovered. Seat reproduction does not prove absence. | None |
| F18 | **Retain negative-search limitation.** Original notice is authoritative; bounded Hebrew correction search produced no later erratum. No claim of exhaustive absence. Project reading corrections stay labelled as such. | None |
| F19 | **Retain link-verification limitation.** Identity and pattern-based URL records are distinct; OData does not prove 121 live destinations/captures. No new “verified” flags set. | None |
| F20 | **Retain English-spelling limitation**, with only O24 typography corrected. Existing official-name snapshot is retained; Gazette is Hebrew and cannot certify every English form. | None |
| F21 | **Retain scope limitation.** Party platforms remain labelled partisan and are not neutral historical evidence. Shared historical claims were not all re-researched; no falsity inferred. | None |
| F23 | **Retain truncated rosters and total-count verification limitation.** Held prefixes are not the full 10 published lists; no completeness upgrade or invented tail. | None |

Additional sourcing flags: add rank-2 IDI to the blocking scheme and rank-1 R to Meretz **list composition**. Keep per-candidate affiliations secondary: handwritten tags corroborate but are not official. Placing composition evidence on the list (rather than each party) preserves `secondaryAffiliations:true` in regenerated joint-facts. Counts remain Meretz 6/4/2, UTJ 3/1/0, with no unknown opening factions. No change to `scripts/joint-facts.ts`. No newly established withdrawal/cancellation, so no election-specific withdrawal mechanism is needed (k22/k24 precedent reviewed). No English Wikipedia consulted. No JPress/NLI challenges bypassed; their documented machine-access limitations persist.

## Owner questions

None. Remaining items are evidence gaps, not competing equally ranked factual values requiring owner arbitration.

## Visible label changes for integration

- Ballot letters: נז→נד, נס→נכ, קנ→קן. Internal IDs remain `13-נז`, `13-נס`, `13-קנ`.
- ציפר→ציפור; Tziper→Tzipor.
- התורה הארץ→התורה והארץ (also full title ending בראשות הרב משה לוינגר).
- התנועה הלאומית הדמוקרטית ועליה→התנועה הלאומית לדמוקרטיה ועליה; National Democratic Movement and Aliyah→National Movement for Democracy and Aliyah.
- תנועת נפגעי משכנתאות חסרי דיור ועולים משוחררים→תנועת נפגעי משכנתאות, חסרי דיור וחיילים משוחררים.
- גימלאים עולים קשישים בישראל→גימלאים, עולים וקשישים.
- התקוה - תנועה חברתית לרווחה בראשות צ׳רלי ביטון→התקוה - תנועה חברתית לוחמת בראשות צ׳רלי ביטון.
- תחיה→התחיה; תל״י התנועה להתחדשות ישראל→תל״י תנועה להתחדשות ישראל.
- מרצ - ישראל הדמוקרטית - רצ מפם שינוי→מרצ - ישראל הדמוקרטית - רצ, מפם, שינוי.
- מפד״ל חזית דתית לאומית - המזרחי הפועל המזרחי→מפד״ל, חזית דתית לאומית - המזרחי, הפועל המזרחי.
- Candidate labels: זווילי נסים→זוילי נסים; פורז פורמנטיר אברהם→פורז פוזמנטיר אברהם; גוזנסקי תמר→גוז׳נסקי תמר; דראושה עבד-אל-והאב→דראושה עבד-אלוהאב; Ra`anan Cohen→Ra'anan Cohen.
- CEC link titles for ציפור, התורה והארץ and התנועה הלאומית לדמוקרטיה ועליה receive the same replacements, retaining “— הודעת התוצאות לכנסת 13”.
- Context: “The list was excluded; the Supreme Court rejected the appeal.”→“Both lists were excluded; the Supreme Court rejected the appeals.”; “הרשימה נפסלה ובית המשפט העליון דחה את הערעור.”→“שתי הרשימות נפסלו ובית המשפט העליון דחה את הערעורים.”
- No bloc-scheme name, dataset availability/status or joint-fact count/status changed. Aftermath is held research, currently not wired to the production UI.

## Validation

Passed: dataset rebuild (38 outputs unchanged on repeat, 2 build workers); nine family catalogues; logo validator (26 overlays, 184 source records, 131 assets); `npx tsc -p tsconfig.json --noEmit`; **95 Vitest files / 905 tests**, `npx vitest run --maxWorkers=2`, including historical k13 and all five differential families. The first run identified the expected allocation/model snapshot changes, the old literal-backtick assertion, and sandbox EPERM for the gallery test's child process. Corrected the two data expectations and reran with child-process permission; all pass. No Playwright.

Recursive dataset diff: only k13 changes (official titles/letters/IDs, four candidate names, Cohen typography, Tehiya source URL, input hashes and build timestamp). All 25 other national datasets are byte-identical. Numeric totals/votes/seats, ranks, biographies and rules are unchanged. A scratch copy of the corpus with HEAD's k13 restored reproduced the previous allocation `bf50217e…` and model `4faa7f17…`; corrected data produces `13dcbf31…` and `fdf587bb…`. The other three digests stay unchanged. Test comments explain the update. The generated joint-facts diff is confined to adding the official Meretz composition source and replacing UTJ's internal pseudo-official URL; all counts and secondary-affiliation statuses are unchanged.

Changed files (excluding the two merged auditor reports):

- `data/meta/aftermath/k13.json`
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
- `data/meta/k13.json`
- `data/meta/logos/k13.json`
- `data/meta/logos/sources.json`
- `data/meta/parties.json`
- `data/meta/party-lineage.json`
- `data/meta/party-links/k13.json`
- `data/raw/SOURCES.json`
- `data/raw/k13/candidates.reviewed.json`
- `data/raw/k13/elected.reviewed.json`
- `data/raw/k13/national.reviewed.json`
- `public/data/k13.json`
- `public/data/sources.json`
- `scripts/lib/build/bios.ts`
- `scripts/lib/list-meta.ts`
- `tests/bios.test.ts`
- `tests/differential.test.ts`
- `tests/historical-k13.test.ts`
- `docs/research/data-audit/k13-resolution.md`

## Coordinator follow-up: preserve opaque keys

The cross-election decision supplied after the initial repair supersedes the original ID-renaming implementation. A new commit on top of `d1c4eb8` restores **all** pre-correction list/vehicle IDs and keyed references: `13-נז`, `13-נס`, `13-קנ`. The raw official transcription continues to carry corrected ballot letters `נד`, `נכ`, `קן`. An election-specific mapping in the historical builder separates stable identity from ballot text, including official-seat keys and candidate-ID construction. All 121 candidate IDs and all 25 list IDs match the pre-audit baseline; these three lists currently have no transcribed candidates. No raw official data was reverted. The metadata note explains why keys differ from letters.

Verification of presentation: source review found no app code deriving letters by slicing/splitting an ID. The shared `Slip` component, bars, list side panel, bloc panel, walkthrough, family points and synthetic icons read `letters`; `listLabel` reads names. `TopBar`'s CSV ballot-letter column uses `l.letters`; scenario JSON preserves stable opaque keys alongside corrected `letters`. Diagnostics in the historical builder now also look up the field rather than slicing IDs. A regression test renders the actual shared ballot component in Hebrew and English and confirms corrected visible letters and accessible labels, with neither the opaque key nor its obsolete letter suffix present. It also checks rebuilds, official-seat references and scenario serialization. No browser or Playwright run.

A recursive field diff against `d1c4eb8` is limited to the three list IDs, their official-seat keys and `builtAt`; every `letters` field and displayed name remains unchanged. All other 25 national datasets are byte-identical. Only affected keyed metadata, the nine k13 family/source hashes and registry/lineage source hashes were refreshed.

Differential proof: allocation returns to pre-audit `bf50217e327445c12941453eb13b84cb7badc51dce3d0ac173136068075e71ab`. Model now yields `2bd5acda259ad3cc59903ce8328d26b6814206fe577d715c75e18826c4acaa66`; scratch pre-audit k13 still reproduces `4faa7f17…` on unchanged engine/model source. The three other digests remain unchanged. Earlier validation figures above describe the initial repair; follow-up checks are recorded below.

The initial follow-up test run found the expected two stale digest assertions and two unrelated 5-second timeouts (graphics/names coverage) under concurrent machine load. Digest expectations were updated after the field diff and baseline proof; the full suite was rerun with `--maxWorkers=2 --testTimeout=120000 --hookTimeout=120000`. No implementation change was made for the timing failures.

Follow-up verification complete: **96 Vitest files / 906 tests passed**, including historical k13, all five differential families and the stable-ID rendering/serialization regression. Dataset rebuild, all nine family catalogues, logo validation (26 overlays / 184 source records / 131 assets), TypeScript and `git diff --check` passed. Corrected visible letters and names did not change in this follow-up. New test: `tests/k13-stable-identities.test.ts`; schema comment now documents opaque identity semantics. Commit remains local, with no rebase, push, main merge or Playwright.
