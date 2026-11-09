# After-election research handoff: k18–k26 (except pilot k24)

**9 November 2026 update:** the k26 retrieval gaps below are superseded. Official President’s House
notices confirm every consulted faction, the 67/46/7 totals, and Eisenkot’s completed tasking on
8 November. No new government is verified. See [the updated recommendation record](pm-recommendations-2009-2026.md#2026--26th-knesset-consultations-45-november-2026).
The remainder preserves the original 5 November research handoff.

Checked 5 November 2026; k26 retrieval cutoff **20:36 Israel time**. Local branch
`t3/fd6ac3d1`, based on `integ-1105` at `3122385`. No push or integration merge.

These are **partial research records**, retained as `status: pilot`, not production-ready histories.
Every populated event has source IDs and verbatim excerpts in the corresponding JSON. The
recommendation research is reused, including its explicit inference/unknown qualifications.
No reaction quotes or unqualified issue-polling figures were introduced.

| Record | Populated formation / government information | Evidence kinds | Term events included / pending | Election commits |
| --- | --- | --- | --- | --- |
| k25 | Results received 9 Nov; consultations 9–11 Nov; Netanyahu tasked 13 Nov; **10-day** extension 9 Dec; notification 21 Dec; investiture 29 Dec, 63–54; government 37, 64 election-list coalition seats | Knesset official cabinet record; contemporary secondary reporting quoting the President; Knesset official retrospective + IISS academic retrospective for the included term event | **1 / 9** | `2396a2f`, `79e3c94` |
| k26 | Official results received 4 Nov; consultations 4–5 Nov; 11 lists' positions; no verified tasking/new government | President’s Residence official notices; existing JPost/JNS/Maariv/Haaretz recommendation evidence | **0 / 0** (ongoing formation, no new government term) | `4f94b38`, `41d3478` |
| k23 | Gantz tasked; initial extension refusal; later 48-hour extension; expiry; Knesset 21-day stage; 72-signature request and Netanyahu tasking; successful-formation notification; 73–46 investiture; government 35, split-list coalition portions; budget-triggered dissolution 23 Dec | Official Knesset investiture, established Knesset faction research, Commons Library dissolution account; contemporary secondary presidential reporting | **0 / 7** | `f0b558f` |
| k22 | Netanyahu tasked and returned mandate; Gantz tasked and returned mandate; Knesset 21-day stage expired; dissolution law; **no new government** | Contemporary secondary reports; IDI academic legal history for dissolution mechanism | **0 / 3** | `3dacfe3` |
| k21 | Results received; Netanyahu tasked, extended, deadline reached; dissolution law 74–45; **no new government** | Official Knesset dissolution and Basic Law; contemporary secondary reporting | **0 / 1** | `a46650c` |
| k20 | Tasking, extension, notification, 61–59 investiture; government 34, 61 seats; dissolution 26 Dec 2018, 102–2; caretaker tenure distinguished from next election | Official Knesset dissolution; EPRS official investiture report; IDI academic composition; contemporary secondary reporting | **0 / 5** | `8e0c2f1` |
| k19 | First sitting; tasking, extension, notification, 68–48 investiture (4 absent); government 33, 68 seats; dissolution 8 Dec 2014, 93–0 | IPU official first-session record; official Knesset dissolution; IDI academic composition; contemporary secondary reporting | **0 / 7** | `85b5963` |
| k18 | First sitting; tasking, extension, 69–45–5 investiture; government 32, **69 formation-day coalition seats**, distinguished from later UTJ accession; late 15/early 16 Oct 2012 dissolution | IPU official chronology; IDI academic composition; Reuters/JTA and other secondary reporting | **0 / 9** | `982fae0` |

## k26: conditional metadata update was not triggered

The scheduled Likud meeting time, 5 November at 20:30, had elapsed at the last check.
The retrieved President’s Residence homepage/archive and targeted searches did **not**
confirm its formal recommendation. The Maariv reader still exposed an update headed
20:00. This is a retrieval gap, **not proof that no meeting/recommendation occurred**.

Keep the existing `data/meta/k26.json` scheme unchanged: Eisenkot 67, Netanyahu 19,
none 7, **pending 27**. The aftermath schema has no pending entry status, so those same
27 Likud seats are explicitly `unknown`, not `none`. Its `no-government` outcome is
qualified as **formation in progress**, not a concluded failed formation. No mandate,
inauguration or new-government date is predicted. The official-results receipt does
not independently establish gazettal or an official seat allocation.

## Source conflicts and limits

- **k22 dissolution:** contemporary reporting calls the midnight expiry automatic
  dissolution. IDI’s legal history says a dissolution law passed before presidential
  notification and advanced the election to 2 March. The record distinguishes expiry
  from the law; it does not assert an unverified dissolution vote tally.
- **k20 investiture:** the English Knesset News item says 69 for and 59 against
  (128). EPRS and independent contemporaneous reporting give 61–59. The conflict is
  retained. EPRS’s coalition prose also omits Shas; the IDI five-party table supplies
  composition. The final plenum protocol would settle the official tally directly.
- **k18 composition:** IPU names National Union in the coalition; IDI and the
  established government scheme identify Jewish Home. IPU is not used for composition.
  The 74-seat existing scheme includes UTJ marked as joining after formation. The
  record uses 69 at formation and does not reconstruct the roll-call from that weight.
- **k18 dissolution date:** IPU and ToI use 15 October; reports published after
  midnight on 16 October describe the same sitting. The exact civil-time/Gazette
  date remains a gap.
- **k21 Arab lists / k23 Gesher / k19 Balad:** the existing research's qualified
  inferences remain qualified; no newly discovered direct statement is claimed.
- **Term inclusion:** only k25's 7 October 2023 attack/war onset met the two-chronology
  rule here: the Knesset's twenty-week retrospective and IISS's one-year reference
  report (opening chapter), with Reuters direct-date corroboration. These are separate
  institutional evidence families. Other listed candidates are leads, not factual
  event rows. Knesset k18/k19 history retrieval exposed results/header text but no
  usable event chronology; k20 exposed only the history shell. JVL candidate URLs
  did not return readable histories. No blanket interim two-news-source rule was used.
- **Still missing:** several certification/inauguration records, presidential originals,
  k18's successful-formation notice, later coalition changes, fuller term chronologies,
  and k25's formal end-of-Knesset record. Cabinet end dates use the sourced replacement
  government records rather than election day. No end date is asserted for government 37.
- **Polling:** the existing feasibility audit does not provide qualifying general-problem
  toplines for these elections. INSS 2022 domestic priorities lack the inspected exact
  question/menu; IDI 2026 measures vote influence. Neither is substituted for the card.

Retrieval used the web reader and Jina URL reader. Search snippets alone were not promoted
as newly verified events. Existing recommendation evidence was explicitly reused, not
represented as a new independent inspection. English Wikipedia and its mirrors were not
opened, used or cited. Challenges and inaccessible pages were left alone; the Yahoo
Reuters-copy URL returned 429 and was not retried. Page/request/byte coverage was not
measured, and no exhaustive-search claim is made.

## Verification and regeneration

The app, dataset build and test files currently do **not** read `data/meta/aftermath`.
Manual data checks covered every new record: JSON parsing, referenced source IDs, source
metadata, prohibited source domain, date ordering, all elected lists exactly once per
recommendation round, split-seat sums, nominee totals summing to 120, and coalition
weights against election results (including explicitly labelled split-list portions).
For k26, weights are the established calculated allocation, not certified seats.

`node scripts/build-datasets.ts` completed with **0 files written / 38 unchanged**.
`node scripts/validate-families.ts` validated all 9 presets across k1–k26.
TypeScript completed successfully. The unit suite passed **90 files / 857 tests**.
It required subprocess access for `gallery-build.test.ts`; the first sandboxed run had
856 passing tests and one `spawnSync ... EPERM`, then the full permitted rerun passed.

No `data/meta/kN.json` or generated result dataset changed. Family hashes and differential
digests therefore remain unchanged and valid. No app code or pilot k24 file was edited.

Dependencies were reused from the main checkout via the ignored local `node_modules`
symlink. Vitest used `--configLoader runner --cache=false` to avoid writing into that
read-only dependency tree. Reproducible checks/logs are under `.backup-scratch/after-election/`;
the durable evidence is the JSON records and this handoff. Run the dataset build,
family validation, TypeScript and the unit suite again if result metadata changes.
