# Coordinator review: term coverage and conflict wording

Research date: 5 November 2026. Branch `t3/0627de82`; merged `integ-1105`
by fast-forward from `77d72e0` to `825b6d7` before editing. No push.
Read PROMOTE.md, COMMON.md, design/inclusion policy and the previous promotion
report. This addendum supersedes that report’s k25 coverage/gap statements.

The deliverable is the bilingual research JSON, still a **pilot**, not an
exhaustive history. Selection test: two independently authored chronological
selection accounts, at least one official/academic. Retrospective reports and
institutional election histories qualify under PROMOTE.md; a direct event notice
can supply particulars but does not by itself constitute another chronology.
No formation, recommendation, seat, coalition, election-result or polling fields
changed. No government end date inferred from the next election.

## k25: 3 → 8 rows

Related dated developments share rows to keep the section within eight entries.
The IDs below are claim IDs: each row’s `cites` is the claim/source ledger,
`sources` holds publisher/kind/URL/access date, and `notes` separates selection
from date precision and records conflicts. Every displayed sentence is attributed
and matched in Hebrew and English.

| Claim / row | Before → after | Independent selection accounts; particulars |
| --- | --- | --- |
| `judicial-plan-2023` | Announcement alone → announcement plus 2023 protests | Existing IDI October 2024 retrospective + Reuters judicial timeline. Neither source’s political evaluations are adopted. |
| `reasonableness-amendment-2023` | July amendment alone → passage and 1 January 2024 annulment | IDI retrospective + IPF’s dated legislative-history tracker; CNN chronology independently corroborates both dates. This is a grouped enactment/judgment row, not a claim that the law remained in force after annulment. |
| `attack-war-2023` | Attack/airstrikes alone → attributed deaths and hostages, legal war authorization, air/ground war, dated reported Gaza deaths | Knesset’s first-twenty-week chronology + CFR timeline select onset; CRS independently corroborates. MFA’s two-year account supplies the attributed October 7 figures; PMO + IDI supply the authorization and legal distinction. Commons CBP-10085 supplies a dated reported Gaza total, attributed through OCHA to Gaza’s Ministry of Health, not a civilian-only or verified final count. |
| `northern-front-ceasefire` | Absent → October 2023 cross-border fighting, October 2024 ground entry, November 2024 ceasefire | UI regional timeline + Commons Lebanon retrospective select the phase. CRS’s December 2024 retrospective independently selects the ceasefire and distinguishes approval from effect. No permanent end of northern fighting is claimed. |
| `gaza-hostage-ceasefires` | Pending → November 2023 pause/exchange, January–March 2025 agreement, October 2025 agreement | November: Commons + Reuters. January/March: Commons + UI. October: UI + CFR; CNN supplies the 10 October implementation date. These are separate pauses/agreements, not a continuous ceasefire. |
| `international-court-proceedings` | Absent → ICJ provisional measures and ICC warrants | ICJ: Commons + Reuters chronology. ICC: CRS December 2024 retrospective + CNN Editorial Research chronology. The wording distinguishes provisional measures from a merits judgment and warrants/allegations from convictions. |
| `iran-exchanges-and-war` | Pending → April/October 2024 direct exchanges, June 2025 war and ceasefire | April: UI + Reuters (also CRS). October: UI + CRS. June: UI + AP, independently also Commons; PMO’s dated statement supplies effective ceasefire day. No April causal explanation imported from Reuters alone. |
| `election-2026` | Absent → next election on 27 October 2026 | LoC’s dated institutional election account + CRS’s post-election retrospective. The election happened; this does not establish the legal dissolution date or end of the government. |

### Sources and inspection

Source IDs resolve to full metadata and short excerpts in
[`k25.json`](../../data/meta/aftermath/k25.json). Principal new chronological
selection sources actually opened/read:

- [UI/SCEEUS regional timeline](https://www.ui.se/globalassets/ui.se-eng/publications/sceeus/2026/five-wars-and-a-funeral.pdf),
  Aron Lund, 13 January 2026, p.3 and regional discussion: academic reference report.
- [CFR Education timeline](https://www.cfr.org/education/learn/timelines/israeli-palestinian-conflict-timeline),
  updated 14 July 2026: research-institute educational chronology, classified academic,
  not peer-reviewed research. Its captions/photographs do not make it a Reuters reprint.
- Commons Library [Gaza July 2024–March 2025](https://commonslibrary.parliament.uk/research-briefings/cbp-10085/)
  (including PDF pp.58,61), [earlier conflict retrospective](https://commonslibrary.parliament.uk/research-briefings/cbp-9874/),
  [Lebanon retrospective](https://commonslibrary.parliament.uk/research-briefings/cbp-10108/),
  and [Iran June 2025](https://commonslibrary.parliament.uk/research-briefings/cbp-10284/): official parliamentary research.
- [CRS December 2024 regional retrospective](https://www.everycrsreport.com/files/2024-12-05_R44245_a229591d75ea86d8bb24dec2e3ceeade83e5cbc9.html)
  and [CRS October 2024 conflict retrospective](https://www.everycrsreport.com/reports/R47828.html):
  official parliamentary research, read via the identified reproductions.
- [IPF legislation tracker](https://israelpolicyforum.org/judicial-legislation-tracker/)
  and [CNN Editorial Research chronology](https://abc17news.com/news/national-world/cnn-world/2024/01/04/benjamin-netanyahu-fast-facts-4/):
  secondary selection accounts. CNN mirror’s original publication date predates later
  entries; the inspected text is updated through April 2026. Only dated event statements used.
- [AP Iran chronology](https://apnews.com/article/1c1e810598dd3323bcb5f0f771362471):
  independently authored secondary chronology.
- [LoC election explainer](https://blogs.loc.gov/law/2026/10/falqs-israels-upcoming-election-on-october-27-2026/)
  and [CRS election retrospective](https://www.everycrsreport.com/reports/IN12751.html):
  separately authored official institutional accounts. No seat figures imported.

Claim particulars also inspected: [MFA anniversary account](https://embassies.gov.il/cyprus/en/node/9202),
[PMO war authorization](https://www.gov.il/en/pages/spoke-war081023),
[IDI legal explanation](https://en.idi.org.il/articles/51077),
and [PMO June 2025 statement](https://www.gov.il/en/pages/event-statement240625).
PMO pages and the historical MFA PDF were read through Jina when the ordinary
reader returned no text or timed out. No challenge bypass attempted.

### Conflicts, counterevidence and gaps

- PMO’s announcement is **8 October 2023**, updated 9 October, describing approval
  the preceding night. IDI dates approval to 8 October, effective from the attack’s
  beginning. The text dates the announcement rather than asserting an exact vote time.
  Section **40(a)** governs war decisions; **40(a)(1)** permits delegation to the cabinet.
  “40A” is not used as the name of a separate statutory section.
- Casualty/hostage counts vary by source date and definition. The selected MFA account
  reports over 1,200 deaths and 251 hostages; other Commons versions use 253/254 and
  imprecisely label the deaths civilians. Those versions are not silently harmonized;
  the displayed statement is specifically attributed to MFA and does not call all dead civilians.
- Commons CBP-10235’s web summary uses 18 January for the January agreement and
  13 October for the later ceasefire. CBP-10085 gives 19 January; CNN gives 10 October.
  The latter dates are used for implementation; 13 October was the living-hostage release
  date in the later summary. This is a documented conflict, not proof of permanent peace.
- June 2025: Commons dates Trump’s announcement 23 June; AP labels it 24 June.
  PMO’s 24 June statement places a ceasefire that day. Announcement and effective
  cessation are separated. No claim that the June cessation ended later conflicts.
- LoC calls **17 July 2026** dissolution. [Globes, 12 July](https://en.globes.co.il/en/article-date-set-for-knesset-elections-1001549071)
  uses that label but quotes the legal distinction between continuing service and recess.
  The Knesset’s 2 June notice was only **first reading**, with a proposed earlier election
  window. An enacted dissolution law/Gazette was not inspected; legal dissolution remains
  pending rather than promoted from first-reading evidence. Election date is independently supported.
- CFR selects renewed Lebanon fighting following US–Israel attacks on Iran in 2026.
  A second fully inspected chronology for that phase was not assembled; retained pending.
  INSS dashboard and CSIS returned 403; IEMed PDF returned a verification challenge.
  Neither snippets nor challenge pages count as inspected chronologies.
- The emergency-government candidate remains pending. This is a bounded selection,
  not a claim that other national events were unimportant or did not occur.

## Consistency review, k1–k25

Applied the same editorial test to every included war/operation: identify the action
and actors; add an initiating/triggering account only where both selection chronologies
support it; state the verified cessation/withdrawal with its actual meaning. A launch,
a ceasefire announcement, effective cessation, withdrawal and treaty are distinct.
No demand for artificial equivalence or identical causal claims across wars.

| Record / entry changed | Change and evidence |
| --- | --- |
| k3 Sinai | Replaced bare onset with Israel/Egypt action and the UN Yearbook’s record of Israel’s 5 November cessation report. This bilateral report is distinct from the Anglo-French 6–7 November ceasefire. Original Knesset/IDI selection retained. |
| k6 Six-Day War | Added actor, dates and final-front ceasefire: CFR 5–10 June entry + UN Secretary-General S/7930/Add.2, 10 June 1967. No preemption/motive judgment adopted. |
| k7 Yom Kippur War | Added Egyptian/Syrian action, 6 October date and UN ceasefire-resolution sequence (22,23,25 October). No falsely precise single effective end date. Original selection retained, CFR/UN supplement it. |
| k9 Litani | Added June 1978 withdrawal, attributed to ECF’s historical record on Resolution 425. Withdrawal is not called a ceasefire. Original Knesset/MFA selection retained. |
| k10 First Lebanon War | Replaced bare war onset with Israel’s named operation, actor/location and attribution. No trigger or single endpoint invented. |
| k15 Defensive Shield | Added location and attribution. No trigger or ceasefire invented. The read UN 2002 Yearbook itself uses 28 March in its overview but 29 March in its detailed account; retained the original month precision. |
| k17 Second Lebanon War | Added capture of two Israeli soldiers (both MFA/CRS) and 14 August 2006 cessation (CRS). Distinguished from Resolution 1701 adoption on 11 August. |
| k17 Cast Lead | Added attribution, named target and 18 January 2009 ending from CRS; no trigger from one chronology alone. |
| k18 Pillar of Defense | Added Jabari’s killing, airstrikes/rocket-fire sequence, attribution and dated ceasefire. SIPRI alone supplies prior rocket fire as the trigger; Reuters starts at Jabari’s killing. The shared sequence is stated; a shared causal account is not invented. |
| k19 Protective Edge | Added action sequence and 26 August 2014 effective ceasefire from OCHA. Reuters links onset to the teenagers’ abduction/killing; SIPRI’s entry does not, so that trigger is withheld. |
| k23 May 2021 fighting | Retained the shared rocket/airstrike sequence and 21 May ceasefire, adding explicit attribution and years. No extra causal explanation. |

k18–k24 were all reviewed: k20, k21, k22 and k24 contain no **promoted** war/operation
entry needing this wording change (their pending fighting candidates stay pending).
The k18 Shalit exchange is not a military operation and was left intact.
Other terms’ non-war acts, attacks, withdrawals and unrest rows were not rewritten
as wars or given invented ceasefire endings.

Residual scope limits: a verified single cessation endpoint for k10 and k15 was not
established; their JSON notes and this report explicitly record the gap. In k7 the
resolution sequence is documented rather than conflated with universal cessation.
This is an evidence-limited consistency repair, not certification that every historical
operation now has a complete action/trigger/ending account.

## Verification and reproduction

- `node scripts/build-datasets.ts`: 0 written, 38 unchanged. These pilot files are
  outside generated election datasets; no dataset hash or differential digest change.
- `node scripts/validate-families.ts`: all 9 presets across k1–k26 validated.
- `npx tsc -p tsconfig.json --noEmit`: passed.
- `npx vitest run --maxWorkers=2 --configLoader runner --cache=false`: permitted run
  **91 files, 867 tests passed**. Initial sandbox run: 866 passed, gallery subprocess
  failed with Node `spawnSync EPERM`; rerun after permitted subprocess access passed.
- JSON/citation/reference/date and field-scope checks: passed; `git diff --check`: passed.
  These prove structure/scope, not editorial independence; the claim ledger and source
  readings supply the latter assessment. Confidence is high for included acts/dates,
  bounded by the specific conflicts above; pending items remain unresolved.

Reproduce using locked dependencies and the commands above. This worktree uses an
ignored link to the main checkout’s installed `node_modules`; runner/no-cache flags
avoid writes there. Working scripts and logs are in ignored project-local
`.backup-scratch/after-election-review/`; no unique evidence is stored only there.
The JSON excerpts, source URLs, dated source identities and this report retain the
accepted result. Retrieval totals, byte coverage and page-depth metrics were not measured.
