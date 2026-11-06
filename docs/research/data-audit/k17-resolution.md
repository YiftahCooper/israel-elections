# k17 audit resolution

Fixer: Codex, 6 November 2026. Reports: [Opus](k17-opus.md) and [Codex](k17-codex.md).
Binding [source hierarchy](../source-hierarchy.md) read from the origin/main baseline before edits.
Both report branches were merged after `git merge --ff-only origin/main` (already current).

**Disposition:** 19 correction/evidence bundles completed (table below), no non-OK finding rejected as an auditor error,
and no owner questions. Four faction findings were already fixed on origin/main and independently confirmed here.
Evidence limitations are retained explicitly; an auditor's inability to verify a claim is not proof it is false.
Overlapping report rows and the consequential status claim are not counted twice.

## Corrections and deciding evidence

All source inspections below were on 6 November 2026. Rank 1 means the primary record, rank 2 academic/research,
and rank 4 established Israeli reporting. Retained scans were rendered afresh with pdfjs-dist 6.5.438 and
@napi-rs/canvas, scale 3, then enlarged for the disputed glyphs. Reading order followed the printed columns.
Sources already retained in the repository remain the evidence; renders are disposable scratch.

Gazette URLs: [candidate notice, YP 5504](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset17-cand.pdf)
and [results notice, YP 5514](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset17-results.pdf).
Both are rank 1. Printed text controls over familiar member names and over either auditor's reading.

| Bundle | Report finding | Decision and directly checked evidence | Inputs changed |
|---|---|---|---|
| 1 | Opus 1; contradicts Codex elected-name OK claim | Hasson: **חסון אדוי ישראל**, candidate p.2193 rank 3 and results p.2467 §4(ח). Enlarged comparison distinguishes ד from ר and ו from י. | candidates.reviewed.json: candidate, both elected arrays, correction ledger |
| 2 | Opus 2; Codex OK counterclaim | Gabbay: **גבאי אליהו בדור**, candidate p.2190 rank 7 and results p.2466 §4(ו). The actual scan says בדור, not the familiar-looking ברוך. | same |
| 3 | Opus 3; Codex OK counterclaim | **סולומינסקי ניסן**, candidate p.2190 rank 5 and results p.2466. OData's סלומינסקי is a different spelling, explicitly recorded in the correction note; the gazette wins for this transcription. | same |
| 4 | Opus 4; Codex OK counterclaim | **לבנת לימור אהבה**, candidate p.2194 rank 10 and results p.2468 §4(ט), not אהובה. | same |
| 5 | Opus 5; Codex wrapping defence | Join the wrapped surname as **לנדבר-אהרון סופיה סוניה**. Candidate p.2193 has לנדבר / אהרון- in the surname column; results p.2467 prints **לנדבר אהרון סופיה סוניה**. Keep that results variant explicitly; remove the trailing-hyphen artefact. Both auditors correctly associate the continuation with rank 7, not rank 8. | same, including nameVariants explanation |
| 6 | Opus 6; Codex national-name OK counterclaim | **מרצ - ישראל חברתית דמוקרטית**. Results p.2465 §3 and p.2468 §4(י), candidate p.2195 heading: no ה before חברתית. | national.reviewed.json; parties.json; families/labour-zionist-left.json |
| 7 | Opus 7; Codex OK counterclaim | **אלתג׳מוע אלווטני אל דימוקרטי - בל״ד**. Results p.2465 §3 and p.2466 §4(ג) print דימוקרטי. This is a lexical correction, not punctuation normalization. | national.reviewed.json; parties.json; families/arab-arab-jewish.json |
| 8 | Opus 8; Codex OK counterclaim | **הרשימה הערבית המאוחדת התנועה הערבית להתחדשות**. Results p.2465 §3 and p.2468 §4(יא): no conjunction ו before התנועה. | national.reviewed.json; meta/k17.json; parties.json; Arab and religious family files |
| 9 | Opus 10; Codex O24 only confirms IPU attribution | Replace 10 November dissolution with the **27 October presidential notice**, followed by the Basic Law procedure. [CEC's period text of Basic Law: Government](https://www.gov.il/apps/elections/elections-knesset-17/heb/law/BasicLawGovt.html), rank 1, §§9–11: §10 gives a 21-day majority-request period, §11 provides early elections when formation fails. [IDI, עשור של בחירות](https://www.idi.org.il/parliaments/3467/8203), rank 2, confirms the 27 October notice. IPU's unsupported 10 November date loses to the statutory sequence and Hebrew research chronology. | aftermath/k17.json: remove false knesset-dissolved formation event; presidential notice in government.changes; endedBy date/text/citations; retain disagreement note |
| 10 | Opus 11; Codex O04 | Results notice p.2468 signed **4 April 2006**, published **5 April 2006**. Quote: ו׳ בניסן התשס״ו (4 באפריל 2006). Gazette date and signature are independently visible. Retained official opening membership starts **17 April**. Replace stale certification gap; still distinguish membership evidence from an unread first-sitting protocol. | aftermath results/gaps |
| 11 | Opus 12; part of Codex F15 | [IDI 2006 table](https://en.idi.org.il/israeli-elections-and-parties/elections/2006/) explicitly supplies Kadima, Labor and National Union **Platform** links. Opened Kadima PDF (21 pages, heading קדימה), Labor PDF (3 pages), and followed the NU–NRP DOC link (web reader reports unsupported application/msword, not a missing link). This supports the destination identities, not an independent endorsement of platform claims. Added medium-confidence partisan links; removed only their obsolete partisan-gap fields. | party-links/k17.json |
| 12 | Codex F05; Opus minor stale raw scope | Present-tense “Not a released dataset” is false: public k17 is official-final. Qualify the reviewed national file's old scope/blockers as historical, preserving the earlier review history. | raw/SOURCES.json; national.reviewed.json |
| 13 | Codex F06 | Moledet colour quote names **אומץ**, not Moledet. No party-specific proof in the cited material. Keep the hex as an explicitly unsourced project display colour, low confidence, and remove the misleading citation. | meta/k17.json colours[moledet] |
| 14 | Codex F07 | Degel quote names **מורשה** and the URL is the 11th Knesset, contradicting its 12th-Knesset basis. Same conservative display-colour disposition as bundle 13. | meta/k17.json colours[degel-hatorah] |
| 15 | Opus 14; subset of Codex F11 | [Ynet, 10 February 2006](https://www.ynet.co.il/articles/0,7340,L-3213856,00.html), rank 4, names Yaakov Cohen of Gur as Eichler's replacement, in the adjacent account of Agudat's dispute/rotation agreement with Degel. Quote: במקומו של אייכלר הוצב ברשימה יעקב כהן, מחסידות גור. Supports retaining the Agudat assignment without relying solely on Hebrew Wikipedia. | meta/k17.json Agudat sources |
| 16 | Opus 15; subset of Codex F11 | [IDI's joint-list table](https://www.idi.org.il/articles/32955), rank 2, lists the 2006 constituent as **ציונות דתית לאומית מתחדשת**. Use that election-period label, with stable ID ahi; do not retroject the later אח״י expansion. Table also independently confirms all four lists' constituent organisations, not every candidate's affiliation. | meta/k17.json; dated party-registry name and corresponding default; regenerated joint-facts party label |
| 17 | Codex F14; Opus minor confidence citation | [Ynet, 5 May 2006](https://www.ynet.co.il/articles/0,7340,L-3247196,00.html), rank 4, directly reports **65–49**, 4 absent, government approved the previous Thursday. Replace the inaccessible Rediff citation with this read Hebrew report. No tally change. | aftermath vote2006 source and confidence-vote citation |
| 18 | Opus coalition omission | Live [Knesset OData, Lieberman in Government 31](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PersonToPosition?$filter=GovernmentNum%20eq%2031%20and%20PersonID%20eq%20427&$format=json), rank 1, returned three records. ID 4613: Deputy PM, **2006-10-30 → 2008-01-18**; IDs 3385/4622 corroborate ministerial service. Added Yisrael Beiteinu entry and departure, retaining original first-coalition envelope 67. Selected exact official fields are quoted in the input. | aftermath government.changes and source |
| 19 | Opus minor stale hash | Refresh k17 SHA-256 references after regeneration; includes registry, lineage and all nine family rows. | parties.json; party-lineage.json; families/*.json |

Opus 13 (overstated name-check status) is resolved by bundles 1–5 and their regression assertions. No status text,
status enum, numeric result, bloc name, bloc allocation, election date or candidate rank changed.

## Remaining report findings: checked and retained

| Finding | Re-check and disposition |
|---|---|
| Opus 9 / Codex F01–F04 | Already corrected on origin/main. Re-read retained KNS_PersonToPosition official faction rows by date, not candidate spelling: opening 17 April 2006 factions 624=19, 642=9, 632=6, 636=4. Regenerated joint-facts gives Labor/Meimad 18/1; Moledet/Tkuma/renewed Zionism/NRP 2/2/2/3; Agudat/Degel 4/2; Ra'am/Ta'al/ADP 2/1/1, all unknownFaction=0. Parsed diff against baseline changes only the corrected ahi display label and adds the new Ynet evidence URL to UTJ secondarySources. scripts/joint-facts.ts untouched. |
| Codex F08 | Gazette p.2465 independently reads **49,684 invalid**. The retained polling reconciliation has **49,675**, cast **3,186,739**, while gazette-derived cast is **3,186,748**. Official final publication is the primary act of the count and controls; preserve the explicit discrepancy and do not subtract nine votes. No competing equally authoritative final correction found, so no owner choice is needed. |
| Codex F09 | Read the final Globes 6 April statement again: **78** supported Olmert and no other nominee was recorded. Read INN 5 April: UTJ meeting still prospective. Existing metadata explicitly labels the six-seat UTJ attribution as aggregate-derived and lacks a meeting account. Retain that qualifier; do not invent a presidential transcript. |
| Opus 16 | Read [INN 5 April](https://www.israelnationalnews.com/news/101500) and [Globes 6 April](https://www.globes.co.il/news/article.aspx?did=1000081213). INN says NU–NRP initially endorsed Peretz; the existing Ynet account says it requested more time. These concern earlier positions; the later final presidential aggregate settles the app's final-round value. Keep the earlier disagreement explicitly attributed. No owner needs to choose an initial position because the app does not assert one. |
| Codex F10 | Compared all **132** retained Knesset site-ID/PersonID pairs in bios/k17.json to retained official KNS_MkSiteCode: **132 matched, zero mismatches**. Pattern-verified URLs are still pattern-verified, not freshly visited live pages. Medium-confidence non-member links remain probable; no evidence warrants inventing replacements or upgrading them. |
| Codex F11 | New rank-2 IDI table confirms constituent organisations; official retained late-term faction rows corroborate existing rank maps where applicable. Agudat rank 6 now has contemporary evidence (bundle 15). Later faction membership is not treated as a universal pre-election affiliation field. Other secondary-only candidate affiliations retain their confidence and citations; ranks unassigned in the input remain unassigned. |
| Codex F12 | Checked retained reconciliation (8,426 polling rows, 1,149 localities plus envelope aggregate) and locality arithmetic through the build and existing historical test. Polling source scratch is absent here, so no claim of independent raw polling/geographical re-verification. National figures cannot establish coordinates. No incorrect value established; preserve null codes/registered fields and existing provenance. |
| Codex F15 remainder | Existing partisan links are year-qualified IDI destinations, not neutral historical proof; Meimad remains a separately labelled profile link. Finding describes limited auditor coverage, not a proven wrong target. Three definite omissions fixed in bundle 11. No assertion that every existing platform byte or live destination was independently certified in this lane. |
| Opus English-name omission | Shas #11 prints **אמסלם אמיל** in both official notices; bio links to Haim Amsalem as an explicitly medium-confidence reviewed identity. Do not bypass the existing identity confidence gate simply to populate English text. This is a disclosed identity/name evidence gap, not an invented alternative name or an owner preference question. |
| Opus minor localisation | English publisher text in Hebrew publisher fields is a localisation limitation, not misinformation; retained. |
| Opus minor ram/raam IDs | Checked parties.json: **ram is an explicit reviewed alias of canonical raam**. Family datasetPartyIds correctly retains ram while canonical partyIds uses raam. No data correction needed. |

## Owner questions

None. The historical disagreements affecting asserted values are resolved by the primary acts or later final account.
The remaining access/coverage gaps above are not competing values requiring an owner decision.

## Validation and reproduction

Use the repository's locked dependencies and Node v24.18.0. Working renders, field diffs and logs are in ignored
`.backup-scratch/k17-fixer/`; the retained PDFs, JSON inputs, correction notes and this record are sufficient durable evidence.
The worktree uses the existing main-workspace node_modules through a temporary ignored symlink.

- `BUILD_JOBS=1 node scripts/build-datasets.ts`: passed, only k17 and source catalogue regenerated; unchanged elections retained.
- `node scripts/joint-facts.ts`: regenerated metadata; independently checked all four k17 faction counts and parsed diff.
- Refreshed k17 hashes, then `node scripts/validate-families.ts`: 9 presets across k1–k26 passed.
- `python3 scripts/validate-party-logos.py`: 26 overlays, 184 source records, 134 assets passed.
- `npx tsc -p tsconfig.json --noEmit`: see final verification below.
- Recursive field walk of every public election/locality dataset against merged baseline: **only k17 national output changed**.
  Changes: five candidate nameHe values; three list nameHe values; ahi constituent nameHe/nameEn; three added platform
  links; buildInfo timestamp and two reviewed-input hashes. No numerical field, engine or model implementation changed.
  Updated only the model differential digest, with this allowed-field evidence recorded beside it.
- The first complete Vitest run: 95 files, 902 tests, 900 passed; expected model-digest failure and sandbox-only gallery
  spawnSync EPERM. Final rerun uses `--maxWorkers=2 --configLoader runner --cache=false`, avoiding shared dependency cache
  writes; subprocess permission is enabled to verify the gallery test. No Playwright, push or main merge.

Final verification: TypeScript passed (exit 0); Vitest **95 files / 902 tests passed**, including historical-k17 and all five differential families. Final run took 40.25 seconds. `git diff --check` passed.

## On-screen label handoff

No status or bloc-scheme label changed. Exact existing-label replacements:

- חסון ארדי ישראל → חסון אדוי ישראל
- גבאי אליהו ברוך → גבאי אליהו בדור
- סלומינסקי ניסן → סולומינסקי ניסן
- לבנת לימור אהובה → לבנת לימור אהבה
- לנדבר אהרון- סופיה סוניה → לנדבר-אהרון סופיה סוניה
- מרצ - ישראל החברתית דמוקרטית → מרצ - ישראל חברתית דמוקרטית
- אלתג׳מוע אלווטני אל דמוקרטי - בל״ד → אלתג׳מוע אלווטני אל דימוקרטי - בל״ד
- הרשימה הערבית המאוחדת והתנועה הערבית להתחדשות → הרשימה הערבית המאוחדת התנועה הערבית להתחדשות
- אח"י – ציונות דתית לאומית מתחדשת → ציונות דתית לאומית מתחדשת
- Ahi (Renewed Religious National Zionism) → Renewed Religious National Zionism

New links (no previous partisan link): קדימה — מצע 2006; העבודה — מצע 2006; האיחוד הלאומי–מפד״ל — מצע 2006.
Existing neutral links remain alongside them; no label is replaced by a platform label. Aftermath text is a research draft,
not currently wired into the app, and its chronology corrections therefore change no browser-visible label.
