# K8–K12: retain reconciled national evidence without premature release

## Decision

Keep all five elections unavailable. Commit the visually checked national results,
complete agreement notices recovered so far, explicitly partial roster transcriptions,
source hashes and per-election regression tests. Register only evidence preflights in
the data build; they emit no public JSON and reject a premature availability flip.
This is verified progress, **not completion of the requested five release datasets**.

All list vote sums equal the printed valid totals, and valid plus invalid equals CBS
cast votes. CBS table 27.2 (4 July 2024), source CEC, independently supplies registered
voters and turnout. Their absence from the national notices is represented by nulls
in reviewed gazette totals. No list vote has been changed to force reconciliation.
The known secondary arithmetic errors are not promoted into application inputs.

| Election | National primary pages | Lists | Seat reproduction | Roster coverage / remaining gate |
|---|---|---:|---|---|
| K8 | YP 1979 p. 608 | 21 | Not reproduced: actual agreements unknown; no-agreement diagnostic differs for four lists | Alignment first name/terminal rank 120 only; all winning rosters unfinished; 1973 candidate snapshot predates postponed election |
| K9 | YP 2326 pp. 1494–1495 | 22 | Complete agreements, but Flatto-Sharon 2 vs 1, Sheli 1 vs 2 | Complete one-person Flatto-Sharon list and elected name verified; other winning rosters unfinished; legal procedure unresolved (0070) |
| K10 | YP 2727 pp. 2190–2191 | 31 | Every list exact, threshold 19,374, quota 15,312 | Alignment first name/terminal rank 120 only; full winning rosters unfinished |
| K11 | YP 3081 pp. 3006–3007 | 26 | Every list exact, threshold 20,734, quota 16,786 | Alignment all 120 names, contiguous ranks and elected ranks 1–44 checked; other winning rosters unfinished |
| K12 | YP 3591 p. 242 | 27 | Every list exact, threshold 22,832, quota 18,563 | No complete roster transcription; all winning rosters unfinished |

Expected seats in `tests/historical-kNN.test.ts` are transcribed from the statutory
seat tables, including zero for all other listed participants. The k8/k9 tests preserve
known failures explicitly, and must not be cited as successful historical reproduction.
All builds/tests run on committed evidence without ignored scratch inputs.

National fixture metadata records every list, common display names for winners and
historical colour families, without blocs. These diagnostic `ElectionDataset` objects
exist only to exercise `scenarioFromDataset → toEngineInput → allocate`; empty unreviewed
rosters are labelled untranscribed in fixture notes. They are never published as released
datasets, and no `candidatesUnavailable` claim is made for archives that actually exist.
Likewise zero station/locality counts in fixtures are placeholders, not historical counts.
No station-level extraction was attempted and `hasLocalities: false` is explicit.

## Complete agreements read through their signatures

* **1977:** YP 2319 p. 1319, six: אמת–ים, לע–יש, מחל–כנ, ב–ג, ש–נס, רצ–סם.
  Names/letters are from the complete notice; the stamped last item was checked
  against its candidate heading on p. 1329. It is not inferred from the seat count.
* **1981 (new):** YP 2720 p. 2027, 21 June 1981, three: אמת–לע, ג–ד, הן–רצ.
  The notice is on the cover itself. Retained from the **olaw.org.il mirror** of the
  official gazette. Government rosters are the next issue, YP 2721.
* **1984:** YP 3073 p. 2839, four: אמת–רצ, ג–שס, הן–ט, מחל–ת.
  Retained research candidate PDF is an **olaw.org.il mirror** of the official issue.
* **1988 (new discovery within retained source):** YP 3588 p. 170, five:
  אמת–רצ, הן–מפם, מחל–ת, קז–יע, שס–עץ. The fourth pair is ineffective, but must
  remain in the sourced input. Earlier research searched nearby issues and missed
  the notice inside the candidate publication; its cover explicitly lists it.

These are complete **published notices**, not a claim of exhaustive search for every
subsequent correction. The full period-law amendment comparison also remains open.

## Bounded 1973 search and limits

Retrieved and visually checked the covers/contents of olaw issues **1950–1953,
1955–1978**, plus the retained YP **1954** cover and closing roster pages. No entry
identifying a complete national agreement notice was found. This is a bounded contents
search, **not a full-text inspection of every page** and not proof of nonexistence.
The October candidate issue 1954 predates the delayed 31 December poll. No agreements
are invented from the four diagnostic seat differences. Downloads and renders of unrelated
issues stay in ignored `.backup-scratch/notices/`; only new relevant primary evidence
(YP 2720 and the original 1969 law) is retained durably and registered in SOURCES.

For 1981, the bounded cover search checked YP **2719–2726**, with 2720 read in full
for its notice. For 1988, the relevant notice was read directly on candidate PDF page 26.
These limits preserve what was actually inspected without treating mirror copies as
independent confirmations.

## Reproduction and storage

Use locked dependencies (`npm ci`), `node scripts/build-datasets.ts`,
`node scripts/check-colours.ts`, `npx tsc -p tsconfig.json --noEmit`, and `npx vitest run`.
The national and roster JSON under each `data/raw/kNN/` is durable, scoped research
input; original PDFs already under `data/raw/research/` are referenced, not duplicated.
Each preflight hashes every referenced retained source and the reviewed JSON itself.
No generated source is automatically blessed by updating its manifest hash on build.

Visual checking used pdfjs-dist **6.5.438**, its canvas factory and `wasmUrl` pointed
to `node_modules/pdfjs-dist/wasm/`. Temporary dependencies, downloads, text extraction,
crops and renders were kept in project-local `.backup-scratch/`. Those are reproducible
working material; no backup-system exclusion has been verified here. Subsequent candidate
withdrawals/changes and the remaining winning rosters still require review before release.

## Primary sources

Exact URLs and hashes are in SOURCES. New download:
[YP 2720, mirrored official notice](https://olaw.org.il/yalkut/yalkut-2720.pdf).
The retained originals N08–N12/C08–C12 and CBS totals are catalogued in
[the research source inventory](../research/early-elections-sources.md).
