# k04 reconciliation — 3 November 1959

Fixer: Codex, 6 November 2026. Both reports merged before editing; source hierarchy
matches origin/main. Counts deduplicate overlapping report rows: **23 finding
groups fixed/documented, 0 wholly rejected groups, 0 owner questions, 5 retained
verification limitations**. Specific erroneous auditor subclaims are rejected below.
This is not complete external verification of every biography or family classification.

## Independent evidence recheck

Retained Gazette scans were rendered with repository pdfjs-dist and @napi-rs/canvas
and visually read, rather than accepting the reports' transcription assertions.
Rank 1 sources:

- [YP 717](https://www.gov.il/BlobFolder/guide/election-committee-history/he/history_election-dates_knesset4-results.pdf),
  retained `data/raw/research/k04-results.pdf`, pp.263–265. Printed rows read
  “טש כוח שלישי”, “סש מפלגה לאומית ספרדית”, “רנ איגוד סוציאליסטי”.
  The full יא name reads **השיתוף והאחוה** (one ו in אחוה).
- [YP 709](https://olaw.org.il/yalkut/yalkut-0709.pdf), retained
  `data/raw/k4/agreements.pdf`, p.126 / PDF p.2. Explicitly connects
  “מפלגת אחדות העבודה — פועלי ציון ובלתי מפלגתיים — האות תו” and
  “מפלגת עבודה ערבית ישראלית — האות שת”.
- [YP 724](https://olaw.org.il/yalkut/yalkut-0724.pdf), newly retained
  `data/raw/k4/correction-0724.pdf`, p.501 / PDF p.5, dated 10 December 1959:
  “במקום ‘יערי יעקב’ צ״ל ‘יערי מאיר’”. The original name is on YP 717 p.265,
  although the correction identifies the notice by its starting page 263.
- [Government presentation](https://fs.knesset.gov.il/4/Plenum/4_ptm_255963.doc),
  16 December 1959: “חמש סיעות המונות יחד 86 חברי כנסת”, including
  “מפלגת פועלי ארץ ישראל והמיעוטים”.
- [July sitting](https://fs.knesset.gov.il/4/Plenum/4_ptm_255878.doc), identified
  through official KNS_DocumentPlenumSession for session 489097:
  “הממשלה החליטה על צירוף חבר-הכנסת בנימין מינץ כחבר הממשלה בתפקיד שר הדואר”.
  Debate also explicitly discusses Poalei Agudat Yisrael entering government.
  [Government positions](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PersonToPosition?$filter=GovernmentNum%20eq%209&$format=json)
  independently returns PersonID 2462, שר הדואר, 1960-07-18 to 1961-05-30.
- [1 February sitting](https://fs.knesset.gov.il/4/Plenum/4_ptm_255804.doc):
  “בישיבת הממשלה אמש הודיע ראש הממשלה על התפטרותו” and the government's
  continuation until its replacement. Date is therefore **31 January 1961**.
  Quotations normalize line breaks and typographic punctuation, not substance.
- [28 March sitting](https://fs.knesset.gov.il/4/Plenum/4_ptm_255927.doc):
  “חוק התפזרות הכנסת הרביעית … נתקבל”, third reading, and election date
  “15 באוגוסט 1961”. Dissolution-law passage is distinct from election day
  and from members' actual end of service.
- [Opening sitting](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PlenumSession(490220)?$format=json)
  returns 1959-11-30T16:02:00. The Gazette notice is signed 12 November,
  published 15 November 1959.
- Retained Mapam KRA3225 image: the stamp reads “עיריית ירושלים”,
  “מס פרסום מודעות”, “עד יום 22.XII.1959”. The imprint names Mapam and
  A. Sarid, with no Haifa. The catalogue's 1959 year remains the dating basis.

[Hebrew IDI 1959](https://www.idi.org.il/policy/parties-and-elections/elections/1959/)
(rank 2) was also opened: it explains 81 ministerial-party seats plus five affiliated
minority-list seats = 86. Its Herut/Progress and Work vote figures cannot override
the primary Gazette. The app's 130,515 / 4,651 are retained.

## Decision ledger

O = Opus row; C = Codex finding. Shared names in other elections are unchanged.

| Finding | Decision and deciding evidence | Inputs changed |
|---|---|---|
| O1 | Correct ב to חזית לאומית דתית הפועל המזרחי, המזרחי ובלתי מפלגתיים. Gazette p.263 wins over Codex's OK assessment. | national review, affected family caches |
| O2 / C W1 | Correct טט→טש and כוח לעלות→כוח שלישי; transliteration Koah Shlishi. Reject C's instruction to retain טט as ballot letters: p.263 prints טש. Internal ID 4-טט stays. | national review, k4 meta, registry, party links |
| O3 / C W3 | Use השיתוף והאחוה. Reject Opus's doubled-ו spelling; scan supports Codex's exact form. Short display label שיתוף ואחווה remains a modern short label. | national review, k4 observed registry name, family cache |
| O4 | Use סיעת תימנים / Siat Teimanim; primary notice overrides Codex's OK. | national review, k4 meta, registry |
| O5 | סט→סש, retaining ID 4-סט. Gazette overrides Codex's OK. | national review, k4 meta |
| O6 / C W4 | Remove initial ה: חקלאות ופתוח. | national review, k4 observed registry name, family cache |
| O7 | רו→רנ, retaining ID 4-רו. Gazette overrides Codex's OK. | national review, k4 meta |
| O8 / C W2 | Use סיעת נכים ונפגעי השואה / Siat Nekhim VeNifgeei HaShoah. | national review, k4 meta, registry, party links |
| O9 | Add the separating comma after אגודת ישראל. | national review, k4 meta, registry, family caches |
| O10 | Add third agreement תו–שת, p.126. Reject Codex O2's complete-two-pair assertion. שת has 3,369 <1%; no published seats change. Original decision 0066's incomplete transcription is explicitly identified in the input note. | national review, source manifest, release tests |
| O11 | שיטרית בכור שלום→שטרית בכור שלום. Results p.264 rank5; reject Codex roster OK on this spelling. | roster review |
| O12 | אוזניה ברוך→אזניה ברוך. Results p.264 rank27; reject Codex roster OK. | roster review |
| O13 | ד״ר יוניצמן שמשון→ד״ר יוניצ׳מן שמשון. Results p.265 rank9; reject Codex roster OK. | roster review |
| O14 | אי-נאשף מחמוד→א-נאשף מחמוד. Results p.265; reject Codex's historical-spelling example. | roster review |
| O15 | Keep the correct Meir Ya'ari display; retain and manifest formal correction, explain original error in roster cross-check and candidate note. | correction PDF, manifest, roster, candidate-notes |
| O16 | Record dissolution-law passage 28 March, next election 15 August. Keep term.end=1961-08-15 because it is the documented selection window, as Codex correctly observes. | aftermath |
| O17 / C W7 | Replace stale certification/first-sitting, missing-law and government14 gaps with sourced k4 facts and honest limits. | aftermath |
| O18 / C W6 | Add PAI entry/Mintz appointment 18 July 1960; resignation 31 January 1961 and caretaker continuation. Formal faction split remains 9 August, independently rechecked against official faction query. No whole גד transfer or speculative new seat total. | aftermath |
| O19 | Correct stamp month/type and remove unsupported Haifa. Reject Codex O10's accession-stamp/November reading. Keep year and asset. Source-ledger dateEvidence must match overlay; both corrected. | logos/k4, logos/sources |
| O20 | Add יד and שת as explicit review candidates, with Gazette evidence and provisional classification. No automatic ideology/continuity upgrade or change to selected-vote metric. | Arab/Arab–Jewish family |
| O21 | Remove anachronistic Alignment from both grouping labels. Mapai is the 1959 name; Alignment is first observed in this project in k6 (1965). | k4 meta |
| O22 | Upgrade coalition explanation with the opened official 86-member presentation. Initial coalition values remain. | k4 meta, aftermath |
| C W5 | Recompute only k4's stale registry hash and all k4 family/lineage hashes after rebuild. | registry, lineage, nine families |

## Retained limitations (not rejected or owner disputes)

| Finding | Recheck / disposition |
|---|---|
| O23 | The reports agree the one JTA article contains the blanket all-party statement. Existing medium-confidence and single-source limitations remain; this is not twelve separately verified endorsements. No contrary faction-level statement was obtained. Coalition participation cannot settle recommendation positions. |
| O24 | Retained membership evidence and reports distinguish six post-opening replacements. They must not replace the opening elected prefixes. No currently shown replacement value is wrong, so no new replacement model was introduced. |
| C U1 | Bio data includes pattern-derived site IDs (e.g. Sharett site672), while opening person identities match official evidence. That does not independently verify every destination or English rendering. No concrete wrong mapping established; preserve coverage limitation. |
| C U2 | All 24 displayed lists occur with positive votes in the primary results. No source-backed withdrawal supplied, so none invented. YP724 settles the previously unlocated correction, but an exhaustive search of all later corrections/withdrawal publications is still not claimed. |
| C U3 | Family data still explicitly labels classifications inferred/proposed; arithmetic validation does not prove ideology. The two missing review candidates are now surfaced under O20. No unsupported cross-election continuity asserted. |

Rechecked current `joint-facts.json` row 4-גד: 3 Agudat Yisrael + 3 PAI,
opening faction239 for both, unknownElected=0, unresolved=[]. No residue to fix;
`scripts/joint-facts.ts` and joint-facts data unchanged.

## Owner questions

None. Primary records settle the substantive disagreements; bounded missing
verification is not a dispute requiring an owner to choose competing facts.

## Reproduction and validation

Node 24.18.0 and repository lockfile. Scratch rendering, extracted text, dependency
cache links and diagnostic outputs are under `.backup-scratch/data-audit/k04/`.
The unique correction scan is durable under data/raw, with SHA-256 in SOURCES.json.
No backup exclusion beyond Git ignore is assumed.

Build: `BUILD_JOBS=1 node scripts/build-datasets.ts`; refresh only k4 hashes/cached
names in registry, lineage and families; run family and logo validators, TypeScript,
and `npx vitest run --maxWorkers=2`. No Playwright, push, or main integration.

Recursive comparison with merged audit HEAD found **35 changed k4 paths**, including
array-length changes: corrected list/candidate labels, three ballot-letter values,
third agreement, Ya'ari note, grouping label/evidence, two link titles and source/build
provenance. All 25 other datasets are byte-identical. List IDs, candidate IDs, list
order, votes, seats and rules are unchanged. Substituting baseline k4 solely at
scenarioFromDataset reproduces the old allocation bf50217e… and model 4faa7f17…
digests exactly. Revised digests are c1cf1f00… / a260ae21…. The other three digests
are unchanged. Hypothetical corpus allocations can change with the extra agreement
although the historical allocation does not.

The first test pass exposed obsolete two-pair/letters-derived-ID fixtures and the
expected digest changes. These are updated. A gallery test's Node subprocess was
blocked by sandbox EPERM; the final run uses normal subprocess access. Writable
Vite/Vitest caches stay under project scratch; no global dependency files changed.

Final checks: dataset build passed; 9 family presets across k1–k26 validated;
logo validator passed (26 overlays, 184 source records, 131 assets; 139 hosted,
9 existing unresolved). TypeScript passed. **97 test files, 923 tests passed**,
including historical-k04, all early-release tests and all five differential families.
`git diff --check` passed. No engine code, other-election dataset, or other-election
registry hash was changed. UI identity rendering uses list.letters / shortHe / shortEn;
no UI code parses a list ID suffix as ballot letters.

## Display-label changes for browser-test integration

No dataset status label changed. New candidate correction note is additive.
The aftermath is still a research draft, not wired into the app.

| Before | After |
|---|---|
| טט | טש |
| סט | סש |
| רו | רנ |
| כוח לעלות | כוח שלישי |
| Koah Laalot | Koah Shlishi |
| סיעת נכים נפגעי נאצים | סיעת נכים ונפגעי השואה |
| Siat Nekhim Nifgeei Natzim | Siat Nekhim VeNifgeei HaShoah |
| סיעת התימנים | סיעת תימנים |
| Siat HaTeimanim | Siat Teimanim |
| חזית דתית לאומית הפועל המזרחי המזרחי ובלתי מפלגתיים | חזית לאומית דתית הפועל המזרחי, המזרחי ובלתי מפלגתיים |
| חזית דתית תורתית אגודת ישראל פועלי אגודת ישראל ודתיים בלתי מפלגתיים | חזית דתית תורתית אגודת ישראל, פועלי אגודת ישראל ודתיים בלתי מפלגתיים |
| שיתוף ואחווה (full official name only) | השיתוף והאחוה |
| החקלאות ופתוח | חקלאות ופתוח |
| שיטרית בכור שלום | שטרית בכור שלום |
| אוזניה ברוך | אזניה ברוך |
| ד״ר יוניצמן שמשון | ד״ר יוניצ׳מן שמשון |
| אי-נאשף מחמוד | א-נאשף מחמוד |
| מפא"י/המערך והרשימות הערביות המסונפות אליה (רשימות לוויין) | מפא״י והרשימות הערביות המסונפות אליה (רשימות לוויין) |
| Mapai/Alignment and its affiliated Arab (satellite) lists | Mapai and its affiliated Arab (satellite) lists |
| כוח לעלות — הודעת התוצאות לכנסת 4 | כוח שלישי — הודעת התוצאות לכנסת 4 |
| סיעת נכים נפגעי נאצים — הודעת התוצאות לכנסת 4 | סיעת נכים ונפגעי השואה — הודעת התוצאות לכנסת 4 |
| רשומות — ילקוט הפרסומים 709, עמ׳ 125 | רשומות — ילקוט הפרסומים 709, עמ׳ 125–126 |
| Reshumot — Yalkut HaPirsumim 709, p. 125 | Reshumot — Yalkut HaPirsumim 709, pp.125–126 |
