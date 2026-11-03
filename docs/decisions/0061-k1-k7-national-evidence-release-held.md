# K1–K7: reconcile the national gazettes, retain failures, withhold release

3 November 2026.

## Evidence and decision

`data/raw/k1/` through `k7/national.reviewed.json` retain the national list votes
and published seats read visually from the official gazettes in `data/raw/research/`.
`tests/historical-k01.test.ts` through `historical-k07.test.ts` independently fix
the seat tables from those notices. Those expected seats were not computed by the
engine. PDF page references are in each reviewed JSON.

| Election | Gazette; vote/seat PDF pages | Lists | Valid votes | Diagnostic result |
|---|---|---:|---:|---|
| k1 | Official Gazette 49 p.400; 2/2 | 21 | 434,684 | No sourced connections: Herut 15 vs published 14; General Zionists 6 vs 7 |
| k2 | YP 181 p.1241; 1/1 | 17 | 687,492 | No-connections diagnostic matches every list; connection completeness unverified |
| k3 | YP 432 pp.1137–1138; 1/2 | 18 | 853,219 | No-connections diagnostic matches every list; connection completeness unverified |
| k4 | YP 717 pp.263–264; 1/2 | 24 | 969,337 | No sourced connections: Mapai 48 vs 47; Cooperation and Brotherhood 1 vs 2 |
| k5 | YP 869 pp.1937–1938; 1/2 | 14 | 1,006,964 | No-connections diagnostic matches every list; connection completeness unverified |
| k6 | YP 1230 pp.311–312; 1/2 | 17 | 1,206,728 | With the two sourced pairs: Alignment 44 vs 45; HaOlam HaZeh 2 vs 1 |
| k7 | YP 1573 pp.433–434; 1/2 | 16 | 1,367,743 | With the sourced pair: every list matches |

Every gazetted list sum agrees with the retained official CBS table 27.2, PDF p.1.
Every invalid count agrees with CBS cast minus valid. No gazette/CBS discrepancy
was found. In particular, 1965 Gahal is **256,957**, visibly printed in YP 1230;
no list vote was adjusted to fit a total. IDI's 1949 −7, 1959 +6,994 and 1965
−53,104 arithmetic discrepancies remain secondary-source errors, not corrections
to the official gazettes. Full approved-list names/letters require a further
candidate-gazette editorial cross-check before promotion; national arithmetic
is not that check.

The 1965 result with the literal largest-remainder clauses is unresolved despite
the recovered notice. Alignment–Cooperation has 459,843 votes, 45 summed initial
seats, and a 15,198 remainder at quota 9,881. The single-pass implementation gives
the pair one extra seat (46 total). Its fresh internal division gives 44 + 2;
the gazette instead publishes 45 + 2. We preserve both. No inferred agreement,
revised vote, arbitrary seat transfer or special-case result override is used.
This may require a contemporaneous CEC interpretation; it is **not established**
that the gazette is wrong, the notice is incomplete, or any proposed alternative
algorithm is historically authorized. See 0060 for the implementation limitation.

**None of k1–k7 is released.** Full winning-list candidate rosters have not been
transcribed and their elected ranks have not been cross-checked. Zero complete
rosters are claimed; no winning list is labelled `candidatesUnavailable` merely
because its scan needs work. The retained scans exist. k1–k5 also lack complete
connection evidence, and k1/k4/k6 fail exact seat reproduction with current inputs.
The preflight refuses `available: true` and public national/locality outputs.
Research fixtures explicitly distinguish missing connections (`pairs: null`)
from an empty sourced set. There is no locality dataset: the requested scope
excludes station scans and research fixtures carry `hasLocalities: false`.

## Reproduction

Install the locked dependencies, then run `node scripts/build-datasets.ts` and
`npx vitest run`. The seven preflights require committed reviewed JSON and source
hashes, with no scratch dependency. Tests for k1/k4/k6 assert the diagnosed mismatch
and unavailable state; they do **not** assert successful historical reproduction.
The other four compare every engine seat with the independently transcribed table,
with no-connections limitations explicit for k2/k3/k5. No generated source table
or successful-test log substitutes for the original gazettes.

## Correction addendum — 1965 connection (3 November 2026)

Fresh visual inspection of the retained YP 1225 p.189 reads **את–רא**,
Alignment–Progress and Development, not את–יא. The printed name and letters both
contradict the earlier transcription. Correcting that input reproduces every k6
seat without changing the engine; all elected names are now checked and k6 is
released nationally. [0069a](0069a-k6-corrected-connection-national-release.md)
supersedes the 1965-specific mismatch/hold above. Other stated legal limits remain.
