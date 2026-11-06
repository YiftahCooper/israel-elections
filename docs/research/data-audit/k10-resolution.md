# k10 reconciliation — 30 June 1981

Fixer: Codex, 6 November 2026. Both auditor branches merged after checking origin/main; the binding 6 November source hierarchy was read from that baseline. No push, integration merge or Playwright.

**25 correction groups fixed; 2 contrary auditor assertions rejected; 1 owner question; 5 verification limitations retained.** Counts group related propagation edits, not scalar facts. The 20 Opus WRONG rows plus Codex F03/F14/F15/F16/F22 are the 25 corrections. The two rejected assertions are Opus's contrary OK/flag claims about the medial mem and absence of acting duties, not two additional corrections.

## Evidence independently inspected

- **R, rank 1:** retained [YP 2727](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset10-results.pdf), printed p. 2190 (PDF p. 2), visually re-rendered. Table quotes include “הס”, “טז”, “טי”, “ימ”, “יס”, “נז”, “נס”, “סז”, “קז”, “קי”; “ישראל אחת”; “הרשימה למען עליה”; “רשימת הגימלאים והקשישים בישראל”; “המחנה התורתי — פועלי אגודת ישראל ודתיים בלתי מפלגתיים”. The retained file and its manifest hash are unchanged.
- **C, rank 1:** retained [YP 2721](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset10-cand.pdf), visually read list headers on pp. 2052, 2054–2055, 2059–2061. P. 2059 prints “1. אבוחצירא אהרון”; p. 2061 heads the pensioners' list with “גהתיה מרים”. It is unrelated to Moked. The United Arab List header on p. 2054 prints medial mem, agreeing with R.
- **P, rank 1:** [5 August plenum](https://fs.knesset.gov.il/10/Plenum/10_ptm_529613.pdf), downloaded and visually read printed pp. 82–83 (PDF pp. 1–2). The agreement announcement explicitly names Likud, NRP, Agudat Yisrael and Tami. It settles coalition membership including Aguda without ministers. The next page reads Begin's letter dated 4 August; it does not settle the presidential mandate date.
- **A, rank 1:** [7 December plenum](https://fs.knesset.gov.il/10/Plenum/10_ptm_529659.pdf), downloaded and visually read printed p. 6 (PDF p. 1). “שמחה ארליך יכהן כממלא מקומו של ראש הממשלה” from “6 בדצמבר 1981” until the PM returns. This is performance of duties, not termination of Begin's legal premiership.
- **T, rank 1:** [Knesset Hebrew history](https://main.knesset.gov.il/About/History/pages/knessethistory.aspx?kns=10), retrieved web text: “20 ביולי 1981 – 13 באוגוסט 1984”. Independently corroborated by retained official `data/raw/k10/knesset-odata-members.json`: 120 opening positions begin 20 July, 112 continue uninterrupted to 13 August; replacement positions also end then. Election dates remain separate.
- **L, derivative logo evidence:** retained source/overlay records and Commons locators were rechecked. The Unity URL lacked the `File:` namespace; corrected overlay and shared source entry together. Attempts to open both Commons file pages returned cache misses; this pass does not claim a fresh full Commons read. Telem's retained provenance names a party and NLI homepage, not a dated 1981 campaign item. Withheld as unresolved rather than claiming verified election use. No image research or asset changes.
- **Access limits:** direct web requests to the State Archives chapter returned 403; UPI was unavailable. Targeted searches did not recover a deciding original presidential letter or bulletin. Existing extracts remain explicitly labelled extracts. No access-control bypass. All direct downloads used the required project User-Agent.

## Every non-OK finding → decision

| Opus | Codex | Decision, evidence and changed inputs |
|---|---|---|
| 1 | — | Fix הם → הס, R/C p. 2052. Raw national row, corresponding meta letters, family cached letters where present. |
| 2 | F01 | Fix טן → טז, R/C p. 2054. Raw/meta. |
| 3 | F02 | Fix יש → טי, R/C p. 2054. Raw row. |
| — | F03 | Fix ים → ימ literally as printed in R/C p. 2054. Reject Opus's assertion that the existing final-mem encoding is correct: identifying the same consonant does not justify replacing the printed medial glyph in a ballot-letter field. Keep opaque ID `10-ים`. |
| 4 | F04 | Fix יפ → יס, R/C p. 2055. Raw/meta. |
| 5 | F05 | Fix נן → נז, R/C p. 2059. Raw/meta. |
| 6 | F06 | Fix נכ → נס, R/C p. 2060. Raw/meta. |
| 7 | F11 | Fix התנועה למען עליה → הרשימה למען עליה, R/C p. 2060; raw/meta, list-meta short label, registry and link title. |
| 8 | — | Fix פז → סז, R/C p. 2060. Raw/meta. |
| 9 | F07 | Fix קנ → קז, R/C p. 2061. Raw row. |
| 10 | F08 | Fix קן → קי, R/C p. 2061. Raw/meta. |
| 11 | F09 | Fix יחד / Yahad → ישראל אחת / One Israel, R/C. `scripts/lib/list-meta.ts`. |
| 12 | F09 | Correct vehicle-10-ט English registry name and dated name to One Israel, R/C. |
| 13 | — | Correct One Israel results-link title, R/C. `party-links/k10.json`. |
| 14 | F10 | Fix מוקד / Moked → רשימת הגימלאים / Pensioners and Elderly List, R/C. `list-meta.ts`; no re-keying. |
| 15 | F13 | Detach pensioners appearance/name from Moked; add separate `vehicle-10-קנ`, keeping the established list key, R/C. Restore Moked's observed last appearance to its remaining 1977 record, explicitly not a claim about organisational lifetime. Registry only; unrelated k9 identity not re-audited here. |
| 16 | F13 | Remove 2,404 pensioner votes from Labour/Zionist-left family. Remaining 745,148 / 1,937,366 = 38.461912%. No replacement ideological classification invented. Family selection is editorial; official list identity disproves the inherited Moked rationale. |
| 17 | — | Correct pensioners results-link title, R/C. |
| 18 | — | Fix comma to dash in Poalei Agudat Yisrael full name, R; propagate registry dated name and family cache. |
| 19 | F12 | Fix אבו-חצירא אהרון → אבוחצירא אהרון, C; remove false spelling variant, correct national roster-check first name, add retained correction/quote. Candidate ID `10-ני#1` unchanged. |
| 20 | — | Close stale certification/opening and coalition gaps using R, T and P. Aftermath metadata. |
| — | F14 | Correct Unity source URL to File: namespace, L; overlay and central logo source registry. |
| — | F15 | Set institutional term to 1981-07-20–1984-08-13, T. Replace explicit election-window explanation with institutional-tenure explanation; election dates/dissolution unchanged. |
| — | F16 | Add Erlich acting-duty appointment from 6 December 1981, A, with return date explicitly unverified. Reject Opus's “no acting PM in between” if read as no acting duties: legal premiership and delegated duties are distinct. Begin's legal PM interval unchanged. |
| 21 | F19 | Preserve 15/16 July dispute; remove unsupported assertion that JTA's web date necessarily reports the previous day. Aftermath conflict and meta research note updated; see owner question. |
| 22 | F18 | Preserve six “not stated” groups and explicitly partial 61-seat report. Existing UPI extracts name the four parties and quote Navon; they are not a freshly inspected official tally. No inferred recommendation from coalition membership. Verification limitation, not grounds to invent competing recommendations. |
| — | F17 | Retain published amendment/roster limitations. Positive final votes support the 31 contestants; no newly established withdrawn/cancelled contestant. No five invented withdrawals from rejected submissions. k22/k24 mechanism reviewed; no k10 entry justified. |
| — | F20 | Keep labelled secondary constituent assignments (25/18/5, 40/7, 3/1). Move official faction-only evidence from party-membership sources to list-level sources and mark confidence medium. This makes Alignment `secondaryAffiliations:true`; official faction evidence cannot certify internal membership. |
| — | F21 | Retained bio IDs match opening PersonIDs; no error established. Preserve pattern verification and source limitations. Did not promote 120 links/renderings or platform dates to freshly verified facts. |
| — | F22 | Telem logo verified → unresolved, L; retained asset integrity and medium identity confidence, election use explicitly unverified. Build omits the logo. |

Additional evidence-quality flag: add P as primary source to first-government scheme and aftermath coalition, replacing the stale “independent check pending” claim. The rank-5 internal party assignments remain secondary. Regeneration has zero unknown opening factions for all three k10 joint lists; no name-matching residue and no edits to `scripts/joint-facts.ts`. Only Alignment's secondary-evidence flag changes in generated joint facts.

## Stable keys, propagation and verification

Coordinator instruction overrides both auditors' re-keying suggestions. Every existing list ID and candidate ID is unchanged, including all ten corrected letter strings. Reviewed national rows retain explicit IDs; the shared historical builder accepts those keys and uses the corrected `letters` for data/UI/export. Meta explains the pre-correction IDs. Existing presentation uses `letters` rather than slicing list IDs; no src changes were needed. The historical test exercises corrected letters, stable keys, zero-seat mappings and candidate identity.

Rebuilt generated outputs, never hand-edited them. Only k10 and the public source manifest change; the 25 other public election datasets are byte-identical. Recursive comparison checks all IDs, candidate IDs, votes, totals and official seat maps unchanged. Changed public fields: ten ballot letters; One Israel/pensioners short labels and link titles; Aliyah full/short label and link title; Poalei punctuation; Abu Hatzeira spelling; withheld Telem logo; Unity source URL; build timestamp and the two reviewed-source hashes. Model differential digest updated only after this field comparison; all four other digests unchanged. All nine family k10 dataset hashes and k10 lineage/registry source hashes refreshed, with no other election hashes changed.

Reproduce with Node v24.18.0: `node scripts/build-datasets.ts`, refresh k10 hashes from generated bytes in the existing registry/lineage/family fields, `node scripts/validate-families.ts`, `python3 scripts/validate-party-logos.py`, `npx tsc -p tsconfig.json --noEmit`, `npx vitest run --maxWorkers=2 --configLoader native`. Joint facts are generated by the build's existing finalization pipeline; standalone `node scripts/joint-facts.ts` without flags only loads exports. PDF reread used PyMuPDF 2.1 in a project scratch venv; originals remain retained or identified by official URLs and quoted locators above. Scratch downloads/renders/logs are disposable; no parallel ledger retained.

Final validation: build passed (2 files written, 36 unchanged); all 9 family presets/registry/lineage passed; logo validation passed (26 overlays, 184 source records, 131 referenced assets); TypeScript passed; final full Vitest run **95 files / 905 tests passed**, including all 5 historical-k10 tests and all 5 differential tests. Used `--maxWorkers=2 --configLoader native`; native loading avoids a temporary bundle in shared read-only dependencies. The subprocess test required the permitted unrestricted runner. An earlier run exposed stale family hashes and the expected model digest change; both were corrected and the complete suite rerun successfully. `git diff --check` and the final recursive data comparison passed.

## Owner questions

**One: formal mandate date, 15 or 16 July 1981?**

- 15 July: inherited UPI contemporary press account (rank 4), and interpretation of [JTA dated 16 July](https://www.jta.org/archive/begin-starts-task-of-forming-new-government) (rank 3 analogue): “formally summoned … today”. The web page date alone does not establish a previous-day event.
- 16 July: [State Archives chapter](https://catalog.archives.gov.il/site/chapter/navon-and-10-knesset-election/) (rank 1 official archival account) reportedly dates Navon's letter to 16 July: “ב-16 ביולי שלח נבון לבגין מכתב”. Original letter unavailable; present evidence is an inherited indexed extract, not a newly inspected scan.
- Recommendation: use 16 July for the formal letter once the original is obtained, and separately date an invitation/meeting if established. Until then retain the inherited 15 July event explicitly disputed against the 16 July account. No invented one-day publication-offset reconciliation. This is a source-access/proof dispute; the owner's choice cannot authenticate the missing original.

## On-screen label/status changes for integration tests

- Ballot letters: הם→הס; טן→טז; יש→טי; ים→ימ; יפ→יס; נן→נז; נכ→נס; פז→סז; קנ→קז; קן→קי.
- יחד / Yahad → ישראל אחת / One Israel.
- מוקד / Moked → רשימת הגימלאים / Pensioners and Elderly List; full results-link title now רשימת הגימלאים והקשישים בישראל.
- התנועה למען עליה → הרשימה למען עליה (full name, short name and results-link title).
- המחנה התורתי, פועלי אגודת ישראל ודתיים בלתי מפלגתיים → המחנה התורתי – פועלי אגודת ישראל ודתיים בלתי מפלגתיים.
- אבו-חצירא אהרון → אבוחצירא אהרון.
- Telem logo removed (source status verified→unresolved); Alignment internal-party evidence now labelled secondary. No bloc scheme name or dataset release-status label changed. Aftermath changes are research-only, not presently wired into the app.
