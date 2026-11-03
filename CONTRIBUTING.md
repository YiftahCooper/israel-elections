# Contributing

Explain the user-visible change and keep each contribution focused. Read the
[development notes](docs/DEVELOPMENT.md) and existing decision records first.

## Checks

Use Node.js >=22.18 (CI uses 24), then run these from the project root:

```sh
npm ci
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

For source or parser changes, also run `npm run data:build` before testing and inspect
the generated changes. CI rebuilds the data as part of every run. Add tests that prove
changed behaviour, especially allocation boundaries and official-result reproduction.

## Data principles

Never invent votes, candidates, affiliations or agreements. Retain sources and record
URLs, retrieval times and hashes in `data/raw/SOURCES.json`. Prefer primary publications;
label secondary sources explicitly, including affected candidate rosters. Never use, cite or
link English-language Wikipedia (see the source policy in [DATA.md](docs/DATA.md)). A downloaded
source is not a verified dataset. Keep elections unavailable until their data and
allocation checks pass. See [DATA.md](docs/DATA.md) for outstanding verification work.

## Commit style

Follow the existing short, imperative subjects: for example, “Add …” or “Fix …”.
Describe the concrete change; do not introduce a mandatory prefix scheme. Use the body
for material qualifications and validation evidence. Keep unrelated edits out of a commit.
