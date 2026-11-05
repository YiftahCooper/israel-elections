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
the app's own origin/path. Old deployments without a valid index can fall back to
the paginated anonymous API. That fallback retains the ten-minute cache, shared
in-flight request and retry throttle; stale cached entries remain visible if
refresh fails. Normal visits make no GitHub API requests.

Reproduce the deployed index using Node 24:
`GITHUB_TOKEN=<provided securely in environment> node scripts/build-gallery.ts`,
then the ordinary build. For an offline deterministic fixture, pass a JSON file
containing the API pages as the script's first argument. Never commit credentials.
