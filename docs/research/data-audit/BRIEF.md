# Per-election data audit: method

The owner, 6 Nov 2026:

> "Mistakes in the data like this are really worrying … making sure all data we have is real, reliable, correct, and
> completely factual. I can forgive bugs in the software, but mistakes in the data are actual misinformation. Take this
> seriously."

Each election gets three agents:
- two **independent auditors** (one Claude Opus, one Codex) that only check and report;
- one **Codex fixer** that reconciles both reports and corrects the data.

Source ranks and conflict rules: [source-hierarchy.md](../source-hierarchy.md) (binding).

## Scope for election kN: every fact the app shows about it

Find all of it. These are the known places; `grep -rl` for the id to catch the rest.

| What | Where |
|---|---|
| Results | `data/raw/kN/*` (official inputs) and their manifest entries in `data/raw/SOURCES.json`: election date, Knesset number, eligible voters, votes cast, invalid votes, each list's votes, letters, Hebrew/English names, seats, threshold, surplus agreements, rule set. The generated `public/data/kN.json` shows what the app actually displays. |
| Rosters | Candidates, order, who was elected, replacements and notes (`data/meta/candidate-notes.json`), English names, and the Knesset OData cross-check. |
| Lists and parties | `data/meta/kN.json`: constituent parties of joint lists, candidate party affiliations, colours, and bloc schemes (pre-election blocs, the government formed, and `pm-recommendations`: who recommended whom, date, seat counts). |
| After the election | `data/meta/aftermath/kN.json`: results reaction, recommendation rounds, formation, governments (number, PM, dates, parties), term events, issue polling, end of term. |
| Context | `data/meta/election-context.json` (events and PM contests for kN), `data/meta/joint-facts.json`, `data/meta/party-lineage.json`, `data/meta/parties.json` and `data/meta/families/*.json` (entries for kN lists). |
| Bios and links | `data/meta/bios/kN.json` and `data/meta/party-links/*`, where they concern this election's parties. |
| Logos | `data/meta/logos/kN.json`: claimed year, source and attribution. Check that the evidence supports the claim; do not re-research images. |
| UI text | Anything in `src/` that states a fact about this election (era rules, glossary, notes). `grep` for the year and the id. |

## Auditor (Opus or Codex): check, don't change

1. List every checkable claim, point by point. Group the results into one row per list and check every field.
2. Verify each claim against the best source you can reach (rank 1 first). Prefer sources other than the one already
   cited: the point is an independent check. A cited source still counts if you open it and it actually says this.
3. Classify each claim:
   - **OK**: confirmed, with source and quote.
   - **WRONG**: correct value, source and quote.
   - **UNSUPPORTED**: the cited source doesn't say it, or there is no source, and you could not confirm it.
   - **UNVERIFIABLE**: say what you tried.
   - **DISPUTED**: sources disagree; list each source with its rank.
4. Also flag:
   - wording that is partisan within Israeli politics, or that breaks the editorial stance;
   - English Wikipedia anywhere;
   - Hebrew Wikipedia used as the sole basis where better sources exist.
5. Write `docs/research/data-audit/kNN-<opus|codex>.md`, where kNN is zero-padded (k01 … k26):
   - a short summary with counts per class;
   - a table of all non-OK findings: file, JSON path, current value, correct value, class, source URL, rank, quote,
     accessed date;
   - a brief list of what was checked and found OK, with sources. This can be a compact table.
6. Commit only that file, on your branch. Do not edit data. Do not run the dataset build.

## Fixer (Codex): reconcile and correct

1. Merge both auditor branches into your branch (named in your task). Their reports are your input.
2. For every non-OK finding, from either auditor:
   - re-check it yourself;
   - where the auditors disagree, look for a deciding source;
   - decide by the hierarchy.
3. Fix the **inputs** (`data/meta/*`, `data/raw/*` manifests, transcriptions) with sources and quotes in the existing
   fields. Never hand-edit generated `public/data`.
4. Run, in order:
   - `node scripts/build-datasets.ts`;
   - refresh the dataset hashes that `node scripts/validate-families.ts` checks;
   - `python3 scripts/validate-party-logos.py`;
   - `npx tsc -p tsconfig.json --noEmit`;
   - `npx vitest run --maxWorkers=2`.

   `tests/historical-kNN.test.ts` and `tests/differential.test.ts` must still pass. If the differential digest
   changes **only** because of your corrections, check with a field diff that only the intended fields changed, then
   update the digest with a comment. Do not run Playwright; the coordinator runs it at integration.
5. Write `docs/research/data-audit/kNN-resolution.md`:
   - each finding → decision → source → files changed;
   - **"Owner questions"**: only genuine disputes no source can settle. For each, give the competing values, the best
     source for each with its rank, and your recommendation.
6. Commit on your branch with the identity given in your task. No push, no merge into main. Add one CHANGELOG line
   per election at most.

## Etiquette and identity

Everything in source-hierarchy.md "Access etiquette" applies. Commit as
`git -c user.name="Yiftah Cooper" -c user.email=yiftah.cooper@gmail.com commit`, with the trailer lines your task gives.
