# K21 reconciliation — 9 April 2019

Fixer: Codex, 6 November 2026. Both independent report branches merged after
checking origin/main. Binding hierarchy: Hebrew primary records first.

**15 deduplicated finding groups fixed; 2 unverifiable-quote findings cleared;
0 owner questions; 6 retained verification limitations.** “Cleared” below means
rejected as requiring a correction, not that the auditor falsely reported an
access failure. Counts refer to groups, not scalar facts.

## Independently rechecked sources

All accessed 6 November 2026. The four PDFs below are statutory primary records
(rank 1), hosted on the disclosed olaw.org.il mirror; original bytes and full
SHA-256 hashes are retained in `data/raw/k21/` and `data/raw/SOURCES.json`.

- [YP 8172, 26 March, pp.9194–9195](https://olaw.org.il/yalkut/yalkut-8172.pdf):
  “אבינעם גואלמן”; “אברהם ממה שיינפיין”; “מפלגת הרפורמה”. Items 1–2
  record the two individual resignations; items 3–13 cover all 11 Reform candidates.
- [YP 8186, 4 April, p.9542](https://olaw.org.il/yalkut/yalkut-8186.pdf):
  “אופק חדש בכבוד”; “יחד בראשות אלי ישי”; “אבירם בלזר”.
  The numbered items record all 12 Ofek candidates, 15 Yachad candidates and Balzer.
- [YP 8196, 10 April, p.9858](https://olaw.org.il/yalkut/yalkut-8196.pdf):
  “שמואל גמיל”; “יעקב ברמר”; the final Yachad resignation is dated 8 April.
- [YP 8208, 17 April, pp.10062–10066](https://olaw.org.il/yalkut/yalkut-8208.pdf):
  “סך כל הקולות הכשרים 4,309,270”; “מספר הקולות שנמצאו פסולים: 30,983”.
  Independently extracted all 40 participating-list vote rows and compared each
  with the generated dataset: exact agreement, sum 4,309,270. Three cancelled
  registrations are absent. Page 10067 starts public notices, not election results.
  The sponsor column supplies the corrections recorded below.
- Retained YP 8168, p.9039, PDF page 19, rendered with locked pdfjs-dist and
  @napi-rs/canvas: the second Betah candidate is printed with the parenthesized
  surname “שוורצברג (אמסלם)”. The opening parenthesis is lost in extracted text.
- [Walla, 16 April](https://www.walla.co.il/news/politics/3230871), rank 4:
  “סיעת רע״מ-בל״ד לא המליצה על אף מועמד” (ASCII quotation marks in page).
  This completed-consultation report settles the auditors’ disagreement. The
  earlier ToI report anticipating that consultation was insufficient by itself.
- [ToI, Hadash–Ta’al, 15 April](https://www.timesofisrael.com/hadash-taal-abstains-from-recommending-a-prime-minister/),
  rank 4: “We are not recommending anyone”.
- [ToI, results presentation, 17 April](https://www.timesofisrael.com/liveblog_entry/central-elections-committee-head-submits-final-election-results-to-rivlin/),
  rank 4: “Central Elections Committee chairman Hanan Melcer hands the election results to President Reuven Rivlin”.
  The current verbatim quotation is present in the body, timestamp 14:18.
- [ToI liveblog, 13 May, 14:15](https://www.timesofisrael.com/liveblog-may-13-2019/),
  rank 4: “Netanyahu will now have until May 29 to form the government”.
  The current quotation is present. Both ToI access limitations are resolved by
  ordinary web retrieval; no challenge or paywall was bypassed.

## Finding decisions

O = Opus row; F/U = Codex identifier. Raw gazettes are immutable. Corrections are
inputs, never hand edits of `public/data`.

| Finding | Decision and evidence | Inputs changed |
|---|---|---|
| O1/F3 | Reform cancelled: all 11 resignations in YP 8172; absent from YP 8208. Preserve registration roster. | k21-corrections.json; k20-k21-common.ts optional corrections; k21.ts |
| O2/F1 | Ofek cancelled: all 12 resignations in YP 8186; absent from final results. | same |
| O3/F2 | Yachad cancelled: 15 + 3 resignations in YP 8186/8196; absent from final results. | same |
| O4 | Add resignation notes for all three cancelled lists and URWP #42, Senior Citizens #5, Tzomet #4. No re-ranking or removal of historical registrations. | corrections input |
| O5 | Display יחד בראשות אלי ישי, following later CEC notices, instead of YP 8168’s בראשית misprint. Preserve earlier text in note. | corrections, parties registry, religious-parties family |
| O6 | Correct Tzomet sponsor to צומת - התנועה לציונות מתחדשת from final notice; preserve earlier wording in note. | corrections |
| O7 | Correct fragment בראשות גל הירש to מגן - בראשות גל הירש from final sponsor column. | corrections |
| O8 | Restore logical parentheses in Betah #2 surname, confirmed by rendered p.9039. | corrections |
| O9 | Singular נפסל / מועמדותו for the single excluded Ben-Ari. Substance unchanged. | election-context.json |
| O10 | Refresh k21 dataset hashes and cached status in nine families, registry and lineage. Delete stale “No default blocs assigned” / לא מוצגת השתייכות לגושים sentences from cached status. | families/*.json, parties.json, party-lineage.json |
| O11/F5 | Keep none / 10 seats, replace remainder inference with explicit Hadash–Ta’al and Ra’am–Balad statements. Remove obsolete research gap. No bloc name or totals change. | k21.json, aftermath/k21.json |
| O12 | CEC URLs are webpages; replace Hebrew “הודעת התוצאות לכנסת 21” suffix with “תוצאות ועדת הבחירות לכנסת 21” on 27 links. | party-links/k21.json |
| O13 | Keep observed ballot names; explicitly label seven k21 name-history entries as list display names, not legal submitting-party names, matching k22 precedent. | parties.json |
| O16 | Prefer later statutory results notice זכויותינו בקולנו over candidate notice זכויותנו בקולנו; record both. Hierarchy settles same-rank spelling conflict by proximity to final result. | corrections |
| F4 | Retain/register final results and three resignation gazettes; cite statutory result notice as officialSeatsSourceId, with CEC numerical inputs unchanged. | raw PDFs, SOURCES.json, shared builder |
| O14 | Cleared: existing results-presentation quote retrieved verbatim; no data correction needed. | none |
| O15 | Cleared: existing 29 May deadline quote retrieved verbatim; no data correction needed. | none |

## Retained limitations (not owner disputes or passing historical checks)

| Finding | Independent recheck and disposition |
|---|---|
| U1 | All 121 generated English names exactly match the retained Knesset English-name table by attached website ID. Hebrew gazette alone does not establish these spellings. This verifies reproducible provenance, not a fresh opening of every English profile. Names unchanged; no blanket live-page certification. |
| U2 | Biography records still contain 166 Knesset links with `verified: pattern`. Explicit PersonID mapping and current joint facts cover elected identity, not every page redirect, party archive or Hebrew-Wikipedia article. No concrete wrong mapping supplied; do not upgrade these flags. |
| U3 | Nine family selections remain explicitly editorial interpretations, with separate constituent-vote treatment. Official sponsor/partner identities and totals are supported; a gazette cannot prove every ideological boundary. No new boundary or claim of complete source-history validation introduced. |
| U4 | Ta’al still has medium confidence and discloses July asset capture versus pre-election page reference. Retained reference does not prove exact pre-election bytes. Keep caveat; no image research or confidence upgrade. |
| U5 | Rehashed logo assets through validator. Commons provenance and underlying-newspaper access limitations are preserved. No new campaign-date or copyright adjudication claimed. |
| U6 | Display colours still explicitly disclaim an official party specification. Cross-era history remains outside complete re-audit; seven ballot-name ambiguities corrected under O13. Colours and chronology unchanged. |

The separate joint-facts repair is already present: all eight k21 joint lists have
unknownElected = 0 and every constituent unknownFaction = 0. No change to
`scripts/joint-facts.ts` or `data/meta/joint-facts.json` was required.

## Owner questions

None. Additional sources resolve the recommendation disagreement; the final
statutory notice resolves the sponsor spelling. Verification gaps are not
competing historical values requiring owner adjudication.

## Reproduction and reviewed differences

Node 24.18.0; repository dependency lock; pdfjs-dist and @napi-rs/canvas.
Working extraction, renders and logs belong under `.backup-scratch/data-audit/k21/`.
Unique sources are durable in `data/raw/k21`. Run `BUILD_JOBS=1 node
scripts/build-datasets.ts`, refresh k21 cached dataset hashes/status, then run
family/logo validation, TypeScript and Vitest with `--maxWorkers=2`.

Recursive dataset comparison with merged HEAD: **60 changed leaves**, confined
to three withdrawal flags, one list name, three sponsor pairs, two candidate-name
fields, ten new list notes, 27 link titles, source references/hashes and build time.
Votes, seats, candidate IDs/ranks/counts, rules, agreements, blocs, colours and all
25 other election datasets are unchanged. The generated source catalogue gains
four retained PDFs. No Playwright, push, or main integration.

Differential check: substituting only merged HEAD’s k21 at scenarioFromDataset
reproduces all five old digests exactly. New allocation digest 8d094c35… and model
30648445… reflect cancelled-list exclusion and display fields. Analysis,
validation and rules digests remain unchanged. No engine/model code changed.

Browser-test handoff: labels and statuses changed are the three lists running →
withdrawn; יחד בראשית אלי ישי → יחד בראשות אלי ישי; צומת - התנועה לציוות מתחדשת →
צומת - התנועה לציונות מתחדשת; בראשות גל הירש → מגן - בראשות גל הירש;
זכויותנו בקולנו → זכויותינו בקולנו; שוורצברג אמסלם) אתי → שוורצברג (אמסלם) אתי;
the 27 CEC link-title suffixes above; and Ben-Ari’s נפסלו / מועמדותם → נפסל /
מועמדותו. New resignation/misprint notes appear on eight lists; the source
catalogue gains four titles. Bloc names, data-stage label and status note stay
unchanged in the election dataset; cached family status loses only the two
obsolete bloc sentences. Recommendation evidence notes now state explicit
consultation decisions instead of an inference.

## Final validation

- Dataset build passed; final repeat wrote 0 files (38 unchanged).
- Family validation: 9 presets across k1–k26, registry and lineage passed.
- Logo validation: 26 overlays, 184 source records, 134 assets; 142 hosted
  records and 6 existing unresolved records, no new unresolved claim.
- `npx tsc -p tsconfig.json --noEmit`: passed.
- `npx vitest run --maxWorkers=2 --testTimeout=180000 --hookTimeout=180000`:
  **95 files, 904 tests passed**, including historical-k21 and all differential
  families. Initial run: 901 passed, two expected digest failures and gallery
  subprocess EPERM; after reviewed digests and authorized local subprocess
  access, the complete suite passed. No test assertion was bypassed.
- `git diff --check`: passed. No push or Playwright.
