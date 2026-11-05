# Aftermath records: k1–k8 research handoff

Research date: 5 November 2026. These are **research pilots**, not reviewed records or application data.
The requested integration branch was fast-forwarded before work. No push or integration merge is requested.

## Coverage

| Election | Government approvals recorded | Other formal steps | Included / pending term events | Issue polling |
|---|---|---:|---:|---|
| k1, 1949 | 1, 2 | 6 | 0 / 3 | none retrieved before 1969 |
| k2, 1951 | 3, 4, 5, 6 | 4 | 0 / 3 | none retrieved before 1969 |
| k3, 1955 | 7, 8 | 3 | 1 / 3 | none retrieved before 1969 |
| k4, 1959 | 9 | 2 | 0 / 2 | none retrieved before 1969 |
| k5, 1961 | 10, 11, 12 | 6 | 0 / 3 | none retrieved before 1969 |
| k6, 1965 | 13, 14 | 4 | 1 / 2 | none retrieved before 1969 |
| k7, 1969 | 15 | 2 | 1 / 4 | INES instrument identified; toplines pending |
| k8, 1973 | 16, 17 | 2 | 1 / 5 | INES instrument identified; toplines pending |

The existing schema has one `government` card. It describes the first cabinet, with its own end date.
Every successor is a numbered `government.changes` entry and a separate `formation.events` confidence vote.
Changes with no number are resignations. Successor entries carry coalition snapshots where support could be
traced; these are **election-list seat sums**, not the vote tally or an assertion that faction membership
remained unchanged. Government 14's contemporaneous coalition seats need a faction-split audit.

## Official approval evidence

Each link is a full Knesset session, not just the prime minister's presentation extract. Quotes in the JSON
preserve PDF extraction order and OCR errors; whitespace is collapsed. Abstentions are omitted when not
stated in the selected tally, rather than filled with an inferred zero.

| Government | Confidence date | Knesset / sitting | For–against–abstain | Full protocol |
|---|---|---|---|---|
| 1 | 1949-03-10 | 1 / 12 | 73–45; abstentions not stated | [protocol](https://fs.knesset.gov.il/1/Plenum/1_ptm_250182.pdf) |
| 2 | 1950-11-01 | 1 / 186 | 69–42–2 | [protocol](https://fs.knesset.gov.il/1/Plenum/1_ptm_250247.pdf) |
| 3 | 1951-10-08 | 2 / 13 | 56–40–4 | [protocol](https://fs.knesset.gov.il/2/Plenum/2_ptm_250617.pdf) |
| 4 | 1952-12-23 | 2 / 158 | 63–24; abstentions not stated | [protocol](https://fs.knesset.gov.il/2/Plenum/2_ptm_250692.pdf) |
| 5 | 1954-01-26 | 2 / 362 | 75–23–5 | [protocol](https://fs.knesset.gov.il/2/Plenum/2_ptm_250781.pdf) |
| 6 | 1955-06-29 | 2 / 623 | 66–32–3 | [protocol](https://fs.knesset.gov.il/2/Plenum/2_ptm_250532.pdf) |
| 7 | 1955-11-03 | 3 / 21 | 73–32–3 | [protocol](https://fs.knesset.gov.il/3/Plenum/3_ptm_251311.pdf) |
| 8 | 1958-01-07 | 3 / 388 | 76–33; abstentions not stated | [protocol](https://fs.knesset.gov.il/3/Plenum/3_ptm_251466.pdf) |
| 9 | 1959-12-17 | 4 / 11 | 78–33; abstentions not stated | [protocol](https://fs.knesset.gov.il/4/Plenum/4_ptm_251773.pdf) |
| 10 | 1961-11-02 | 5 / 19 | 63–46; abstentions not stated | [protocol](https://fs.knesset.gov.il/5/Plenum/5_ptm_252197.pdf) |
| 11 | 1963-06-26 | 5 / 264 | 64–43; abstentions not stated | [protocol](https://fs.knesset.gov.il/5/Plenum/5_ptm_252310.pdf) |
| 12 | 1964-12-22 | 5 / 424 | 59–36–9 | [protocol](https://fs.knesset.gov.il/5/Plenum/5_ptm_252364.pdf) |
| 13 | 1966-01-12 | 6 / 21 | 71–41; abstentions not stated | [protocol](https://fs.knesset.gov.il/6/Plenum/6_ptm_252623.pdf) |
| 14 | 1969-03-17 | 6 / 388 | 84–12–1 | [protocol](https://fs.knesset.gov.il/6/Plenum/6_ptm_252808.pdf) |
| 15 | 1969-12-15 | 7 / 13 | 90–10–4 | [protocol](https://fs.knesset.gov.il/7/Plenum/7_ptm_253121.pdf) |
| 16 | 1974-03-10 | 8 / 21 | 62–46–9 | [protocol](https://fs.knesset.gov.il/8/Plenum/8_ptm_253620.pdf) |
| 17 | 1974-06-03 | 8 / 53 | 61–51–5, corrected by Speaker | [protocol](https://fs.knesset.gov.il/8/Plenum/8_ptm_253635.pdf) |

Government 4's declarations are in sitting 159 on **24 December**, distinct from the confidence vote.
That is the conventional cabinet start used in the change entry. The religious ministers joined on that day;
the 84-seat coalition snapshot describes that composition, not the initial confidence division.
Government 17's protocol initially prints four abstentions, then the Speaker explicitly corrects the number
to five. The corrected figure is used. The first government's vote is **73–45**, as the Speaker states.

## Evidence provenance and confidence

- **Approvals: official, direct, high confidence.** Seventeen full-session records, retrieved using the
  official Knesset OData catalogue. Source IDs and exact excerpts are in the JSON. Presentation extracts
  separately establish tasking and resignation dates. They do not substitute for full confidence records.
- **Recommendations: reused, partial.** See [the existing research](pm-recommendations-1949-1973.md).
  k1–k3 remain 120 seats unknown as personal recommendations. k5 has Mapai's 42 for Ben-Gurion, then 42
  for Eshkol; k6 has Gahal and Rafi's 36 for Eshkol. k4's 120 and k7's 104 are blanket JTA reports,
  with their qualifications retained. k8 has 51 for Meir, Likud's 39 naming no candidate, and 30 unknown.
  These are secondary contemporary reports, not recovered presidential tallies. k7's outgoing-government
  faction identification has separate official evidence. Joining a coalition never supplies a recommendation.
- **Coalitions: mixed official / labelled secondary.** First snapshots reuse the established overlays:
  official ministerial-faction tabulations, secondary evidence for support-only lists. Replacement snapshots
  add explicit official presentation evidence where available. The seat arithmetic is checked against
  `public/data/kN.json`; it does not establish contemporaneous faction size.
- **General term events: limited selection.** Sinai is in the Knesset history and IDI's 1959 chronology;
  the Six-Day War is in the history and IDI's 1969 chronology (year precision only); the Yom Kippur War
  is in the history, IDI and IPU (month precision); NRP ministers' departure is in the eighth-term history
  and IPU's 1977 account (month precision). Other candidates remain pending. The JVL pages are used only
  for texts explicitly credited to the Knesset, with the mirror disclosed. They are not independent from
  their Knesset originals. IDI and IPU provide independently authored chronologies.
- **Endings: partial.** IPU explicitly identifies normal expiry for 1969 and 1973, the 1973 postponement,
  and the Knesset's setting the 1977 early election on 5 January. The original laws remain untranscribed.
  Earlier closing entries identify the next election without inventing a dissolution date or mechanism.

## Gaps and failed access

Certification dates, first sittings, reaction statements, complete consultation diaries, several assignments
and extension acts, and original dissolution laws remain untranscribed. The 1954 Sharett assignment,
1961 Eshkol return, 1974 Rabin assignment and extensions, and the uncompleted January 1977 formation
round need further direct records. The 1961 Eshkol recommendation is verified separately from the assignment;
a fuller source excerpt for the latter was not recovered, so no thinly supported assignment event is included.
The State Archives chapter returned HTTP 403; its earlier inspected research is reused with that limitation.
No challenge was circumvented. NLI's known challenge was not retried. IPU PDFs returned 403 to ordinary
requests but were readable through the web tool. Direct requests used the required project User-Agent.

The mirrored histories contain errors: the third-term page includes an aircraft incident before the election
and misdates Wadi Salib; the eighth-term page says the Agranat Commission preceded the war. None of those
clauses is promoted to an included event. This is a reason to keep exact dates pending, not silently repair
a source in a quotation. Missing INES toplines are not evidence that no issue survey existed.

## Reproduction and checks

The JSON files retain the accepted bilingual text, quotations, canonical locators, source kinds and access dates.
Routine downloaded PDFs, extracted text and diagnostic scripts are disposable project-local scratch.
To locate protocols: query `KNS_PlenumSession` by `StartDate` or by `KnessetNum` and `Number`, then
`KNS_DocumentPlenumSession` by `PlenumSessionID`; select the PDF `FilePath`. A day may have multiple sittings.
PDF text was inspected with pdfjs-dist **6.5.438**, Node **24.18.0**, using the project's installed dependency.
No statistical calculations from survey microdata were performed.

Checks covered every source reference, HTTPS/source-kind/access-date fields, all recommendation-entry and
coalition seat counts against the verified election datasets, 120-seat totals, the complete sequence of
17 government approvals, official vote provenance and vote totals not exceeding 120. Exact normalized
quotes from newly inspected local PDF/history/IDI text were checked against those texts. `git diff --check`
passed. `rg` found no `aftermath` references in `scripts`, `src` or `tests`: these files are not consumed by
the dataset build, TypeScript or Vitest, so those unrelated checks were not run under the FILL.md exception.
No generated datasets, family hashes or model digest changed.
