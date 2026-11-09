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

## Publishing and the issue template

Publishing opens a prefilled GitHub issue in a new tab; the visitor signs in and submits it. Everything published,
including scenario edits, description, tags and GitHub identity, is public, so it must never include private
information. No token is requested or stored. Likes happen on GitHub. Issue content is untrusted text: React renders
it without HTML or Markdown interpretation. Metadata and likes are community content, not verified election facts.

Template v1: the exact body is `Scenario gallery v1`, a blank line, and one fenced `json` block. The JSON object has
required string fields `name`, `description`, `electionId` (`k1`–`k26`), `year` (four digits), `shareLink` (this
site's exact origin/path plus a base64url `#s=` fragment), and `tags` (array of strings). `buildBody` and
`parseBody` in `src/app/gallery/gallery.ts` are authoritative. Malformed issues and pull requests are skipped.
URL validation does not certify scenario content.

## Maintainer setup

Labels, created once on the repository (per-election labels tell apart two elections in the same year):

```bash
gh label create scenario --repo YiftahCooper/israel-elections --color 1D76DB --description 'Community shared scenario'
for n in {26..1}; do
  gh label create "k$n" --repo YiftahCooper/israel-elections --color C5DEF5 --description "Knesset $n election"
done
```

Issue submission must be enabled on the repository. Maintainers remove an inappropriate entry by closing or
unlabelling its issue; it disappears after the next deployment.
