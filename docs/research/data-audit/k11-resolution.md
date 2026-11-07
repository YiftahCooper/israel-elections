# k11 reconciliation — 23 July 1984

Fixer: Codex, 6 November 2026. Merged both audit branches after checking
`origin/main`; the source hierarchy on main governs this reconciliation.

**21 correction groups fixed/documented; 0 finding groups rejected; 0 owner
questions.** Eleven bounded verification limitations remain (Codex U01–U04,
V01–V07; Opus U1/U2/V1 overlap them). These are not competing historical values
requiring an owner decision. Counts deduplicate overlapping findings: Opus
W1–W18 plus Codex W05, W06 and U05's government-22 record.

## Deciding evidence rechecked

All accessed 6 November 2026. Original retained scans were rendered locally;
ordinary source downloads used the required project User-Agent. No challenge,
proxy or paywall bypass; no Playwright.

- **C, rank 1:** [YP 3073](https://olaw.org.il/yalkut/yalkut-3073.pdf),
  retained `data/raw/research/k11-candidates.pdf`. Printed p.2826 rank 61 reads
  **חזיזה יצחק**. Page 2837 explicitly prints **עולי הודו**, with Tzefania
  Tzriker first. This decides the “Mountain immigrants” versus India reading.
- **R, rank 1:** [YP 3081](https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset11-results.pdf),
  retained `data/raw/research/k11-results.pdf`, pp.3006–3008. The results table
  independently confirms the five corrected letters, names, and tenants list.
  Page 3008 is signed 31 July; the issue was published 1 August. Neither date
  is silently relabelled as a separately verified certification act.
- **G, rank 1:** [PMO government-21 history](https://www.gov.il/BlobFolder/generalpage/gov21/he/part21.pdf),
  PDF p.4, printed pp.95–96: Peres's formation speech says “97 חברי כנסת”.
  This decides 97 versus the old rendered 98 (or the metadata's 104 envelope).
- **I, rank 2:** [IDI, The Political System in Israel, chapter 12](https://en.idi.org.il/media/3869/politiacal_system_c12.pdf),
  printed pp.617–618 / PDF pp.32–33, chart 12.9: “פורשי המערך (מפ״ם ויוסי
  שריד — 7)”. The following paragraph states 97 coalition MKs and expressly
  excludes Sarid and Mapam. This supplies the missing individual exception.
- **J, contemporary foreign reporting, rank-4 equivalent:** [JTA, 17 September](https://www.jta.org/archive/peres-defends-new-government)
  identifies Sarid's protest against the coalition and distinguishes the
  confidence vote, 89–18, from coalition membership. His formal faction move
  in retained OData is later (22 October); it was not used to infer his
  September stance. The official government-21 extract was also retrieved;
  it contains guidelines, not an individual roll call. No individual vote
  is claimed from that extract. I settles coalition affiliation independently.
- **E, contemporary foreign reporting, rank-4 equivalent:** [Christian Science Monitor, 27 August](https://www.csmonitor.com/1984/0827/082726.html):
  “won a 21-day extension”; the article says the initial period expired Sunday.
  Sunday was 26 August 1984. This corroborates Opus's date without inventing
  an extension from the statutory allowance.
- **S, rank 1:** [Knesset government-22 protocol](https://main.knesset.gov.il/mk/government/documents/gov22.pdf),
  20 October 1986, first page reproduces Herzog's tasking letter dated
  17 October and Shamir's formation letter dated 19 October. Confidence
  tally remains untranscribed, rather than marked verified.
- **IL/M, rank 2:** IDI's [Independent Liberals](https://www.idi.org.il/policy/parties-and-elections/parties/independent-liberals/)
  confirms one representative elected on the Alignment in 1984;
  [Morasha](https://www.idi.org.il/policy/parties-and-elections/parties/morasha/)
  confirms the Matzad–PAI joint list, two seats and 1986 breakup. Neither
  overview alone certifies every candidate-level party assignment.

## Every non-OK finding reconciled

O = Opus; Cx = Codex. Paths below are inputs unless expressly generated.

| Finding | Decision and evidence | Changed files |
|---|---|---|
| O W1–W5 | Correct הם→הס, טן→טס, פט→כט, נ→ס, עי→עד. C and R decide against Codex's uncorrected “OK” letter readings. Keep opaque IDs unchanged. | raw national/roster, k11 meta/aftermath, family cached labels, shared historical builder, generated k11 |
| O W6 / Cx W04 | לובה אליאב לכנסת; C/R. | raw national, list-meta, registry, links, Labour-family cache |
| O W7 / Cx W02 | עולי הודו, not עולי ההר. C p.2837 is decisive. | raw national, registry, generated k11 |
| O W8 | עזרה זהר, not עזרא זהר. R p.3006 and C. | raw national, list-meta, registry, links |
| O W9 | א. נ., not א.נ.י.; English transliteration A.N. – Irgun Nekhim. R/C. | same plus k11 English-name metadata |
| O W10 / Cx W01 | List ע is National Tenants’ Protection Organisation. Remove ADP label/link and unrelated green colour; use neutral display grey. R/C, not later ADP identity. | list-meta, registry, links |
| O W11 / Cx W02–W03 | Shiluv is a separate electoral vehicle, not Sheli. Remove its 5,499 votes from Labour family and k11 from Sheli history. Core/included 65,046 (3.137286%); whole-list alternative 789,120 (38.060677%). | list-meta, registry/appearances, lineage pending record, Labour family, links |
| O W12 / Cx U05 | Replace stale gap with signed/published dates and opening-membership date 13 August. Qualify Opus: signature date is not independent proof of a distinct certification act. Retained R/OData. | aftermath |
| O W13 | Add actual 26 August mandate extension, 21 days; E. | aftermath |
| O W14 | Replace “two-year” shorthand with takeover after 25 months; existing contemporary coalition report and actual official succession dates. | meta and aftermath recommendation notes |
| O W15 | Results pages include 3008, where elected names and signature continue. R. | raw national, source manifest/generated provenance |
| O W16 | Correct Commons URL to File: namespace in overlay and source catalogue. This repairs a malformed URL, not a new dating claim. Web fetch of corrected page returned cache miss; no fresh claim of complete destination verification. | logos/k11, logos/sources, generated logo ref |
| O W17 | Rehash k11 only; preserve all other registry source hashes. | parties, lineage, nine families |
| O W18 | Restore printed dash/hyphen conventions in Aguda and Has-Mas names. R. | raw national, list-meta (Has-Mas), registry, links |
| Cx W05 | Candidate #61 חזיזה יצחק confirmed visually at C p.2826; replace חייט יהודה יצחק. Rank and ID unchanged. | raw roster, generated k11 |
| Cx W06 | 97/23 scheme, not 98/22 or 104/16: six Mapam plus Sarid (#25) outside coalition. G fixes total, I fixes the seven excluded MKs; J corroborates. Add existing candidate override mechanism. | meta, generated k11, regression tests |
| Cx U05 (government 22) | Replace “primary succession record not retrieved” with S's verified tasking/formation dates, retaining tally gap. Correct JVL mirror “official” provenance label; replace government22 mirror with original protocol. | aftermath |
| Cx U01 / O U2,V1 | Keep 27/14 Likud internal attribution explicitly secondary; retained OData confirms opening faction, not internal party. No stronger per-rank evidence retrieved. Do not turn faction matches into proof of internal affiliation or La’am merger history. | affiliation limitation note in meta; otherwise retained |
| Cx U02 / O U2 | IL corroborates one Independent Liberal seat; Mapam six are independently supported by retained OData/J. Labor/IL rank attribution and unelected ranks remain labelled secondary. | meta source/note |
| Cx U03 / O U2 | C/R identify Hadash's front constituents; Rakah/Black Panthers per-person assignments retain secondary provenance. No competing sourced correction established. | meta limitation note |
| Cx U04 / O U1 | Soften June 1986 party-merger assertion to explicitly attributed Hebrew-Wikipedia claim, distinct from a faction change. M independently corroborates Morasha's joint-list identity/1986 breakup, not all rank identities. | meta note/sources |
| Cx V01 | All 26 participating lists have votes in R; C has the same 26. No evidence warrants adding withdrawn lists. Opus's match is not proof of an exhaustive amendment chain: preserve existing released status caveat. k22/k24 withdrawal precedent reviewed; no k11 correction entry invented. | none |
| Cx V02 | Bios are identity/pattern records; retained OData corroborates elected identities, not every HTML destination or unelected biography. No erroneous specific destination established; preserve verification labels. | none |
| Cx V03 | Colours already state encyclopedia/design convention, not official colours. Correct unrelated tenant/Shiluv associations only; no fabricated historical hex claim. | list-meta only for identified errors |
| Cx V04 | Reaction/polling/Operation Moses/Bus300 gaps state research not recovered, not historical absence. Keep pending status and documented two-chronology selection rule. | none |
| Cx V05 | No changed legal branch or conflicting seat result established. Full allocation reproduces all 120 official seats; this is not certification of every 1973 edge rule. | none |
| Cx V06 | Family definitions remain editorial/inferred. Correct the demonstrated Shiluv identity contamination; do not upgrade other boundaries into official classifications. | family/registry repair above |
| Cx V07 | Party-origin platforms remain party claims, links gaps remain limits of collection. A retained Likud image does not prove a campaign-period external party link. Full platform destination review remains incomplete. | remove false ADP link only |

No English Wikipedia was used as evidence or as a lead. Incidental English
Wikipedia search results were discarded. Foreign contemporary reporting is not
promoted into the hierarchy's Israeli archival-press rank 3.

## Stable identity, UI and exports

Coordinator direction is implemented exactly: every internal list/candidate ID
is unchanged. Corrected `letters` are distinct from `legacyIdLetters` in the
reviewed k11 input. The historical builder uses the latter only for opaque IDs
and seat-table keys; labels/metadata/rosters use the corrected field. The five
legacy values and rationale are recorded in `data/meta/k11.json.identityNotes`.
Shared links serialize an action log (`src/app/store.ts:shareLink`), and saved
scenarios persist IDs; ID renaming would break action targets and candidate,
biography and lineage references. A regression replays old-ID metadata actions.

Static inspection confirms list names use `listLabel` (short names), ballot
slips and chamber labels use `l.letters`, and TopBar CSV exports `l.letters`.
The scenario mapper copies both fields separately. There is no extraction of
ballot letters from a list ID in these rendering/export paths. IDs can still
appear as technical keys in JSON exports; their explicit stable-key meaning is
intentional. No browser claim is made and Playwright was not run.

On-screen label/status changes for coordinator e2e maintenance:

- הם→הס; טן→טס; פט→כט; נ→ס; עי→עד (ballot letters).
- מד״ע / Arab Democratic Party → ארגון ארצי להגנת הדייר / National Tenants’ Protection Organisation.
- שלי / Sheli → שילוב / Shiluv.
- לבא אליאב לכנסת → לובה אליאב לכנסת.
- עצמאות בראשות עזרא זהר → עצמאות בראשות עזרה זהר.
- א.נ.י. – ארגון נכים / ANI – Irgun Nekhim → א. נ. – ארגון נכים / A.N. – Irgun Nekhim.
- הס מס, תנועה לביטול חוק מס הכנסה → הס־מס, תנועה לביטול חוק מס־הכנסה (full/short name and document-link title).
- יהדות התורה אגודת ישראל → יהדות התורה – אגודת ישראל (full name).
- שילוב רשימה עצמאית של עולי ההר לכנסת → שילוב רשימה עצמאית של עולי הודו לכנסת (full name).
- חייט יהודה יצחק → חזיזה יצחק (#61).
- Link titles: מפלגה דמוקרטית ערבית → ארגון ארצי להגנת הדייר — הודעת התוצאות לכנסת 11;
  שלי — הודעת התוצאות לכנסת 11 → שילוב — הודעת התוצאות לכנסת 11.
  Corrected Eliav/Zohar/A.N./Has-Mas names also replace those names in their
  existing “… — הודעת התוצאות לכנסת 11” titles.
- Tenant link source label: Hebrew Wikipedia (secondary) → Official election results record (whole-election document);
  publisher ויקיפדיה העברית (מקור משני) → ועדת הבחירות המרכזית לכנסת ה-11.
- Coalition/opposition seat figures: 98/22 → 97/23; Labour-family core votes
  70,545→65,046, whole-list alternative 794,619→789,120.
- Data as-of date 2026-11-03→2026-11-06. No stage/status text or bloc scheme name changed.

## Validation

- `node scripts/build-datasets.ts`: passed. Recursive field diff: only k11
  corrected labels, one candidate name, neutral identity colours/links,
  Sarid's opposition override, as-of/build/provenance fields differ. All other
  25 datasets unchanged; all k11 votes/totals/seats/agreements and IDs unchanged.
- k11 source hashes, registry/lineage and all nine family hashes refreshed;
  `node scripts/validate-families.ts`: nine presets across k1–k26 passed.
- Regenerated joint facts in memory with unmodified `scripts/joint-facts.ts`:
  all five k11 entries equal the committed file, zero unknown elected/faction
  matches. Counts 27/14, 37/6/1, 3/1, 4/1, 1/1; no residue/input fix needed.
- `python3 scripts/validate-party-logos.py`: 26 overlays, 184 source records,
  131 assets passed. No campaign-design re-research.
- `npx tsc -p tsconfig.json --noEmit`: passed.
- `npx vitest run --maxWorkers=2`: **95 files / 906 tests passed**, including
  historical-k11 and differential. Model digest updated only after the field
  diff above; allocation, analysis, validation and rules digests unchanged.
  First run exposed expected changed model digest plus sandbox EPERM for the
  gallery child process; final complete run passed with execution permission.
- `git diff --check`: passed. No push; no main merge; no Playwright.

## Owner questions

None. Missing verification coverage is retained as a research limitation rather
than asking the owner to ratify technical unknowns.

## 7 November 2026 — pre-release identity correction

Owner direction supersedes the earlier stable-ID compatibility rule: internal list IDs now follow the corrected official ballot letters, with candidate IDs and all references updated and no aliases or migration. `11-הם` → `11-הס`; `11-טן` → `11-טס`; `11-פט` → `11-כט`; `11-נ` → `11-ס`; `11-עי` → `11-עד`. Votes and seats are unchanged.
