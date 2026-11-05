# Community gallery

Visitors read `data/scenarios.json` from Pages, with a ten-minute browser cache.
The checked-in snapshot is the initial/offline build input. Deployment replaces
it with current open issues labelled `scenario`; the generated deployment output
is not committed back to Git. Issue-based publishing remains unchanged: the app
prepares a public GitHub issue, and the user submits it with their own account.

The Pages workflow rebuilds on main pushes, relevant issue events, manual runs,
and a half-hour schedule (also refreshes reaction counts). Scheduled Actions may
be delayed or disabled by GitHub for inactive repositories. New publications
appear after the next successful deployment. No client token, custom secret or
repository-setting change is needed: `github.token` has read-only issue access.
The workflow always checks out main; issue bodies are parsed as data, never code.
Generation fails rather than silently deploying an empty index on API failure.

Both the generator and browser validate the template and restrict share links to
the app's own origin/path. Visitors' browsers never call the GitHub API (the
anonymous fallback was removed on 5 November 2026 because it could exhaust a
shared IP's 60-requests-an-hour quota): they read only the Pages index. A failed
read waits at least ten minutes, or as long as a 429/503 `Retry-After` asks (up
to a day); the wait is stored in the browser so reloads do not retry early, the
page retries by itself when it ends, and stale cached entries remain visible.
The generator retries a rate-limited API page after GitHub's `Retry-After` or
`x-ratelimit-reset` (twice, at most a minute each) and otherwise fails the run.

Reproduce the deployed index using Node 24:
`GITHUB_TOKEN=<provided securely in environment> node scripts/build-gallery.ts`,
then the ordinary build. For an offline deterministic fixture, pass a JSON file
containing the API pages as the script's first argument. Never commit credentials.
