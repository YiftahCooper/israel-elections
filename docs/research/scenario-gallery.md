# Community scenario gallery

Mount `ScenarioGallery` from `src/app/components/ScenarioGallery.tsx` on the Scenarios page:

```tsx
import { ScenarioGallery } from './ScenarioGallery.tsx';
// Inside the existing language provider:
<ScenarioGallery />
```

No props or new dependencies. The component reads the active store scenario and election index.
It calls `shareLink()`; opening a validated same-origin, same-path `#s=` URL reloads the app,
letting its existing startup `readSharedFromHash()` / `openElection()` flow import the scenario.
The receiving component was absent in this implementation checkout; mounting is left to the parent task.

Publishing opens a prefilled GitHub issue in a new tab; the visitor must sign in and submit it.
Everything published, including scenario edits, description, tags and GitHub identity, is public.
Never include private information. No token is requested or stored. Likes happen on GitHub.
Issue content is untrusted text; React renders it without HTML or Markdown interpretation.
Metadata and likes are user-controlled community content, not verified election facts.

## Template v1

The exact body is `Scenario gallery v1`, a blank line, and one fenced `json` block.
The JSON object has required string fields `name`, `description`, `electionId` (`k1`–`k26`),
`year` (four digits), `shareLink` (this site's exact origin/path plus a base64url `#s=` fragment),
and `tags` (array of strings). `buildBody` and `parseBody` in `src/app/gallery/gallery.ts`
are authoritative. Malformed issues and pull requests are skipped. HTML stays literal text.
Share payload replay continues to use the existing importer; URL validation does not certify scenario content.

The browser requests open issues labelled `scenario`, 100 per page, up to ten pages (1,000 issues,
GitHub's default newest-first ordering). localStorage stores parsed results with a timestamp;
refresh, including manual refresh, is limited to once per ten minutes. Failures are also throttled
in memory for ten minutes, and stale cached data remains visible. Missing/disabled localStorage
falls back to memory. Multiple tabs and other apps share GitHub's 60 requests/hour/IP allowance;
the cache is not a global rate-limit guarantee. Results beyond the page cap are not displayed.

## Maintainer setup (not executed)

Run these commands against the explicitly scoped repository. Per-election labels disambiguate
two elections in the same year; browsing year and tag filters use parsed body metadata.

```bash
gh label create scenario --repo YiftahCooper/israel-elections --color 1D76DB --description 'Community shared scenario'
for n in {26..1}; do
  gh label create "k$n" --repo YiftahCooper/israel-elections --color C5DEF5 --description "Knesset $n election"
done
```

Issue submission must be available on the repository. No repository settings are changed here.
Maintainers can close or unlabel inappropriate entries to remove them after the next refresh.

## Verification

```bash
npm run typecheck
npm test
npx vite build
```

Unit tests cover template round-trip, literal injected HTML, malformed data, link validation,
Hebrew/English search and intersecting filters, mocked pagination, cache reuse and API failures.
Phone layout uses a wrapping grid, native labelled controls, disclosure and visible focus.
Keyboard, screen-reader and visual checks of the mounted page remain integration checks.
Reproducible dependency copies and diagnostic output belong in `.backup-scratch/` (gitignored).
