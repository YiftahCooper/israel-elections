# After-the-election research: k10–k17

Research date: 5 November 2026. These are **pilot drafts**, not reviewed production data.
The eight claim/source ledgers are `data/meta/aftermath/k10.json` through `k17.json`.
No existing result metadata, result dataset, family hash or pilot k9/k24 was changed.

## Coverage and limits

All eight contain the initial government, ballot-list coalition references, election and
next-election dates, sourced formation steps, a term-end disposition, included events,
pending candidates and explicit gaps. Initial-government membership reuses the existing
`first-government` research; its labelled Hebrew Wikipedia evidence is disclosed and
needs a complete primary coalition-agreement cross-check. An official minister roster
establishes appointments, not by itself every supporting faction's coalition membership.

Counts below distinguish formation rows from other formal Dated entries in
`government.changes`; term events do not count those steps a second time except for the
explicit 2001 election event requested for k15.

| Record | Formation / other formal steps | Included / pending term events | Evidence and principal gaps |
|---|---:|---:|---|
| k10 | 7 / 1 | 1 / 4 | Official plenum for the 1981 vote and the complete 1983 Begin-to-Shamir formal succession; JTA archival tasking report; reused partial recommendations (61 Begin, 59 unknown). Preserve 15 July tasking / 16 July presidential-letter discrepancy. Certification and extension records remain missing. |
| k11 | 2 / 1 | 1 / 4 | JTA archival investiture (89–18) and a newly retrieved contemporary report naming **all factions' recommendations**, upgrading the Hebrew Wikipedia dependency. Official MFA government transcription for the 1986 rotation. The 104-seat election-list envelope includes Alignment opponents; actual reported coalition strength is 97. No unsupported partial-list allocation is invented. Extension and rotation confidence tally remain missing. |
| k12 | 5 / 1 | 2 / 4 | JTA archival 1988 extension and investiture (84–19), **15 March 1990 no-confidence vote (60–55)**, Peres returning the mandate, and **11 June 1990 government 24 investiture (62–57)**. The fall is a formal Dated change, not a new election. Reused 63/55/2 recommendation round retains weaker retrospective evidence for Arab lists. Intermediate 1990 tasking/extension letters and government 24 faction splits are not filled. |
| k13 | 4 / 0 | 3 / 4 | JTA archival consultations, 2 July tasking, Rabin investiture (67–53), Peres investiture (62–8, 38 abstentions); Knesset/MFA chronologies for Oslo I, Jordan treaty and Rabin assassination. **All 120 recommendation seats remain unknown**, not “none”: no blocking-bloc inference. Full per-list positions and final dissolution-law date remain gaps. |
| k14 | 2 / 0 | 2 / 3 | **Direct PM election, no recommendation round or presidential mandate.** Official Basic Law quotation reused; IPU formation chronology; contemporary Washington Post investiture (62–50), opened with web extraction after local HTTP timeout. Knesset/MFA chronology pair for Hebron and Wye. Original INES 1996 findings inspected: wording, full coding text, field dates, mode, N and exclusions; selected published percentages only, no microdata calculation. |
| k15 | 4 / 0 | 3 / 5 | **Direct PM election, no recommendation round.** JTA formation report confirms seven coalition lists / 75 election seats. **6 February 2001 PM-only election** appears both as a formal step and a term event; no Knesset election or recommendation round is invented. Contemporary report for Sharon's 7 March investiture (72–21). Barak's investiture tally is withheld: UPI caption returned 403; indexed 75–29 alone is insufficient. Preserve IPU later 73-seat snapshot versus JTA formation-day 75. Knesset mirror misdates Ze'evi assassination; erroneous date not promoted. |
| k16 | 2 / 0 | 2 / 3 | Reused final 87/33 recommendations and contemporary tasking research; IPU / contemporary news for government 30 investiture (66–48). **27 February** used for vote/start, preserving existing scheme's 28 February and IPU's tasking-date disagreement. Knesset/MFA/IPU support disengagement and Kadima formation. January 2006 incapacity formal record remains pending; IPU's December date is not copied. |
| k17 | 3 / 1 | 1 / 5 | Reused **final updated** 78/42 positions; Labor's prior Peretz recommendation and subsequent transfer are expressly distinguished. Contemporary PTI investiture report (65–49); IPU for Livni's failed replacement attempt and term end. MFA/IPU chronologies support Cast Lead start. Attempted Knesset-history mirror supplied no usable term history; other national events remain pending. Original Livni tasking/extension and resignation notices remain gaps. |

Government tenure extends beyond the next election in some records; the selected term
window ends at the next Knesset election. This is intentional and follows the pilots.
The k11 `coalitionElectionListSeats` (104) and `coalitionSeats` (97) describe different
quantities; **do not render every member of Alignment's 44-seat list as a coalition MK**.

`government.changes` holds formal steps outside the proposal's closed formation type
vocabulary (resignation, no-confidence, succession and failed replacement attempt).
These retain dates, bilingual text and citations and carry `formalStep: true`.
No new `formation.events[].type` value was introduced.

## Selection and provenance

Included national events have two independently authored qualifying chronologies,
including official/academic evidence. Credited Knesset history copies on JVL are cited
as Knesset texts with `via`; the mirror is not counted as independent corroboration.
MFA historical narrative and timeline are **one** evidence family. IPU current/archived
representations of the same election summary are also **one** family. Direct news
reports supply formal acts and tallies; they are not counted as retrospective term
chronologies. Each included event's own citations expose its evidence mapping.

The government histories contain errors and partisan characterizations. Only the
specific dated factual clauses retained in the JSON were used. No motive, evaluative
adjective, polling-based causal explanation or casualty figure was inferred.

Source registries record URL, publisher, kind, access date and mirror/extraction notes.
Claim citations hold short excerpts. Existing recommendation evidence was reused as
instructed, including its weaker sources and access limitations; it is not represented
as a newly inspected presidential original. Existing OData extraction summaries are
labelled as summaries rather than verbatim API serialization.

New direct retrievals used the project User-Agent. HTTP challenges were not bypassed.
IPU PDF locators worked through 1992; later PDFs returned 404 and their official HTML
archive summaries were read instead. Local HTTP for the Houston Chronicle returned a
JavaScript challenge; the article was read via the web tool. The UPI 1999 caption could
not be opened and is not used as the confidence-tally source. Only the original INES
1996 findings qualify for a filled polling card; other waves remain pending, following
the existing polling audit. Hebrew survey wording is labelled an editorial rendering
of the inspected English instrument, not a recovered Hebrew questionnaire.

## Verification

Scoped checks run after the final edits:

- JSON parsing; every citation resolves to a registered source and has a quote.
- Every recommendation entry and coalition election-list seat value matches the
  existing `public/data/kN.json` official seat table; no duplicate recommendation list.
- Every recommendation total is the sum of its entries and totals 120.
- Coalition election-list sums reconcile, with the explicit k11 envelope exception.
- Formation types match the design vocabulary; formation and included-event dates
  fall within the election-to-next-election window; every included event has at least
  two distinct source IDs (independence additionally reviewed manually).
- Required 1996/1999 empty recommendation arrays, k15's 2001 direct-election step,
  and k12's 1990 no-confidence and new-government steps are present.
- Newly retained quotes were checked against locally extracted text after whitespace
  normalization; Washington Post and Houston Chronicle excerpts were checked against
  full web-tool article extractions. Reused citations retain the earlier research's
  qualifications; they are not claimed as freshly reverified original documents.
- `git diff --check` passed. Existing k9/k24 files remain unchanged.

`rg -n 'aftermath' scripts tests src` found **no consumers**. Under FILL.md's conditional
instruction, build-datasets / TypeScript / Vitest were not run for these isolated
research overlays. No dataset or family hash refresh is necessary. No claim of an
application build or test-suite pass is made.
