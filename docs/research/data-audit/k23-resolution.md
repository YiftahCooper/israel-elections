# k23 fixer resolution — 6 November 2026

Reconciles `k23-opus.md` and `k23-codex.md`, merged from t3/55312d7d and t3/ee136cf9. Scope is election 23 (2 March 2020). Sources follow `../source-hierarchy.md`. Access/re-check date: 2026-11-06. No votes, seat totals, list membership or bloc rank allocations changed.

Count convention: deduplicate the three findings reported by both auditors. Of **19 distinct non-OK units**, **13 are fixed**, **1 is resolved without a correction** (Codex F11), **4 retain explicit evidence limits**, and **1 belongs to the separately assigned faction matcher repair**. **0 findings rejected as erroneous; 0 owner questions.** Coverage limitations are not treated as false historical claims.

## Decisions and evidence

| Auditor finding | Decision and independently re-checked evidence | Files changed |
|---|---|---|
| Opus 1 / Codex F02 | Fixed false Norwegian-law chronology. Retained rank-1 `data/raw/k23/knesset-odata-members.json`, `positions` for PersonIDs 30677/30678/30683: all start `2020-03-16`; finish respectively `2021-04-06`, `2021-01-05`, `2020-06-19`. All three sat on 17 May. No coalition rank change. | `data/meta/k23.json` |
| Opus 2 / Codex F03 | Fixed source and dates. Independently extracted both retained gazettes using pdfjs-dist glyph lines. YP8698 registers Tzomet; **YP8708 p.4468** publishes the resignations: nine on 19 February; Avi-Chen Shashua on 20 February. Quote: `התפטרו מרשימת המועמדים ביום כ"ד בשבט התש"ף (19` and subsequent `בשבט התש"ף (20 בפברואר 2020;)`. [YP8708](https://olaw.org.il/yalkut/yalkut-8708.pdf), rank 1 statutory notice on disclosed mirror. Election-day context date retained. | `data/meta/election-context.json` |
| Opus 3 | Fixed compound surname and displaced party hyphen: `אבו דבאי-נערה`, `חד"ש`. Retained YP8698 p.3917: `23 פידא אבו דבאי- חד"ש`, next-line family cell `נערה`. | `data/raw/k23/roster-corrections.json`, k23 builder, generated dataset, regression test |
| Opus 4 | Fixed `אלמקייס-עמוס`, `גשר`. YP8698 p.3912: `17 כרמן אלמקייס- גשר`, next-line family cell `עמוס`. | Same |
| Opus 5 | Fixed `אלמוג-בר`, `מרצ`. YP8698 p.3912: `43 איתי אלמוג-בר מרצ`. | Same |
| Opus 6 | Fixed `אבידור-הופמן`, `העבודה`. YP8698 p.3913: `78 גלית פסיה אבידור- העבודה`, next-line family cell `הופמן`. | Same |
| Opus 7 | Fixed given name `דוד-משה`, surname `אזולאי`. YP8698 p.3932: glyph right edges place דוד at 193.5, hyphen at 180.4, משה at 176.8 and אזולאי at 138.4; the first three form the given-name cell. `עזריהו` belongs to rank 85. | Same |
| Opus 8 | Confirmed cross-election matcher defect; **assigned elsewhere**, per fixer instructions. Retained primary faction rows include the opening-day membership and nickname variants described by Opus. No changes to `scripts/joint-facts.ts` or `data/meta/joint-facts.json`. This remains an integration dependency. | None |
| Opus 9 / Codex F05 | Removed internally contradicted gap: the file already has three term events with multiple citations. Re-read all events and inclusion rule. Removed IPF advocacy source and its deciding citation; budget event retains independent IDI and Commons Library research, with the midnight distinction explained. | `data/meta/aftermath/k23.json` |
| Opus 10 | Corrected two Hebrew CEC link labels: the linked national-results HTML is not a Reshumot notice. Retained `data/raw/k23/nationalresults.html` is the CEC result page; URL remains `https://votes23.bechirot.gov.il/nationalresults` (rank 1). | `data/meta/party-links/k23.json`, generated dataset |
| Codex F01 | Fixed extension approval to **13 April**. Independently opened [President's 16 April letter reproduced by INN](https://www.israelnationalnews.com/news/278730), rank 4 delivery of primary statement: `On 13 April 2020, before midnight, I acceded to the request of MK Gantz`. Opus's OK chronology did not settle this date; the expressly dated letter reproduction decides against the publication timestamp. Preserve secondary-delivery/translation caveat and earlier ToI cite. | `data/meta/aftermath/k23.json` |
| Codex F04 | Removed unsupported **party-supplied** provenance. Independently opened [Commons description](https://commons.wikimedia.org/wiki/File:Agudat_Yisrael_logo_2020.svg), unranked community metadata: `דרך דואר אלקטרוני, הומר מפורמט PDF לפורמט SVG`. Sender unspecified. Design/date caveat remains; no image re-research. | `data/meta/logos/k23.json` |
| Codex F06 | Confirmed stale lineage SHA against actual bytes, then refreshed to rebuilt k23 SHA-256; no lineage edge changed. | `data/meta/party-lineage.json` |
| Codex F07 | Confirmed all nine stale family status suffixes against current `defaultBlocScheme: first-government`; removed suffixes and refreshed k23 dataset hashes only. | Nine `data/meta/families/*.json` |
| Codex F08 | Partially resolved coverage limit: independently compared all **1,482** normalized CBS 2020 rows, six fields each, with retained original `data/raw/demographics/cbs-2020.json`; all match. Build/test checks cover group derivation. **Every coordinate and every locality translation were not independently certified**, and no replacement is established. Preserve this limit; it is not an unresolved competing-value dispute. | None |
| Codex F09 | Confirmed metadata explicitly labels routes as `verified: pattern`, with 168 bio entries and retained official identity evidence. An inferred route is not a live endpoint verification. No demonstrated identity correction; **all profile routes and campaign-period platform versions remain outside comprehensive endpoint verification**. No promotion of pattern entries to verified endpoints. | None |
| Codex F10 | Confirmed display-colour metadata and editorial distinction; no contemporary official colour specification established. **Exact campaign-period colour provenance remains unverified**. Keep display choices; no invented specification. | None |
| Codex F11 | Resolved with no correction: inspected retained YP8698 glyph cells and their wrapped lines. p.3928 rank 40 explicitly prints `חוסן` (normalization to Israel Resilience is identified, not literal expansion); p.3914 rank 3 `מאיר פרוש אגודת` + wrapped `ישראל`; p.3920 rank 10 `אורית סטרוק האיחוד` + `הלאומי`; p.3919 rank 8 `שרה גילה בק-דור אח"י`. Existing party IDs/ranks are correct. This settles the differing audit coverage, not an auditor error. | None |
| Codex F12 | Reattempted [Commons Telem description](https://commons.wikimedia.org/wiki/File:TELEM.png); web reader returned inaccessible. Existing **medium** confidence and no-primary-capture caveat accurately bound evidence. **Historical-use assertion remains unconfirmed by this fixer**; no established alternate date/artwork, and instructions prohibit re-researching images. | None |

Name corrections use [YP8698](https://www.gov.il/BlobFolder/guide/election-committee-history/he/%D7%99%D7%9C%D7%A7%D7%95%D7%98%20%D7%94%D7%A4%D7%A8%D7%A1%D7%95%D7%9E%D7%99%D7%9D-8698.pdf), rank 1, retained original SHA-256 `900921998691e2888eba3461cf54da4df0359c0207ba5dcbda3d6128d2b83611`. Scoped corrections retain preconditions so changed parser output fails instead of silently masking a future change. The shared k22–k24 parser is untouched.

## Source-quality flags and incidental observations

- Opus F1: replaced three Hebrew-Wikipedia coalition citations with independently opened [IDI, Ofer Kenig, 17 May 2020](https://en.idi.org.il/articles/31613), rank 3: `a coalition of seven factions, which together hold 73 Knesset seats`. Existing rank-1 Knesset faction/government evidence retained. Its analytical faction count is not used to change the cabinet's constituent-party enumeration.
- Opus F2: replaced JNS with independently opened [Ynet, 15 March 2020](https://www.ynet.co.il/articles/0,7340,L-5695357,00.html), rank 4, quoting the President's statement: `חברת כנסת אחת בחרה שלא להמליץ`. The article identifies Levy-Abekasis. Removed the inference-only caveat; totals unchanged.
- Opus F3: added independently opened [Walla, 7 May 2020](https://news.walla.co.il/item/3355611), rank 4, confirming 72 signatories and fourteen days; retained President's letter reproduction as additional evidence.
- Opus F4: retained explicitly disclosed Reuters/Investing mirror; no source conflict is established. IDF official chronology remains an independent source. No claim of reading a Reuters original.
- Cosmetic double-space English name remains source-faithful to official Knesset name input; no factual correction established.
- Codex S4 identifies an additional results gazette not retained in the manifest. It is an optional corroborating source lead, not a demonstrated erroneous manifest entry; this pass does not claim to have retrieved it.

## Owner questions

None. There is no unresolved same-rank factual conflict requiring an owner decision. The four remaining evidence limits and separately assigned faction-matcher work above remain explicit and must not be presented as comprehensive certification.

## Verification

Reproduction: Node 24.18.0, locked project dependencies via existing node_modules; Python 3.14.4. `node scripts/build-datasets.ts` succeeded; second build wrote zero files. A recursive field diff against merged audit baseline permits exactly **17 k23 leaves**: 15 candidate-name/party-text leaves and two Hebrew link-title leaves. All other 25 election datasets and all vote/seat/party-ID/bloc values are byte-identical. No generated data was edited by hand.

Family and logo validators and TypeScript no-emit check passed. Final Vitest: **93 files, 885 tests passed**, including **8 historical-k23** and **5 differential** tests. Commands, in order:

1. `node scripts/build-datasets.ts`
2. Refresh k23 hashes in all nine families and lineage, then `node scripts/validate-families.ts` (9 presets across k1–k26).
3. `PYTHONPYCACHEPREFIX=.backup-scratch/data-audit/k23-fixer/pycache python3 scripts/validate-party-logos.py` (26 overlays, 184 source records, 135 assets).
4. `npx tsc -p tsconfig.json --noEmit`
5. `npx vitest run --maxWorkers=2 --configLoader runner --pool=threads --testTimeout=60000`

The default config bundler attempted to write in the shared read-only dependency directory, so the config runner was used. An initial sandboxed suite encountered process/time restrictions; a completed run then isolated the intended model digest change and a gallery subprocess `EPERM`. After field-diff verification, re-recorded only the model digest (`ba52136e…`); substituting baseline k23 at `scenarioFromDataset` reproduces the old digest (`2694440f…`). All four other digests passed unchanged. The final suite with authorized subprocess access passed in 80.64 seconds. No source/test changes were made to work around the gallery restriction. Rebuilt k23 SHA-256: `6cf6152ae395cc932db87a1301dea0150a6bc1a05f6a14996e9de5aec08f7600`.

Playwright was not run. Scratch extraction/scripts/logs live under `.backup-scratch/data-audit/k23-fixer/`; durable correction inputs, quotations and this resolution suffice to reproduce the repair.
