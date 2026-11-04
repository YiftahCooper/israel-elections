# Election-specific party and list logos

`k1.json`–`k26.json` are research overlays keyed by `electionId`. They do not change
ballot letters or election results. An empty `logos` array means no qualifying
image was verified in this bounded research pass; it does **not** establish that
no logo existed. See [the coverage report](../../../docs/research/party-logos.md).

Each entry has exactly one identity key:

- `letters`: exact list letters from `public/data/kNN.json`, scoped to that election.
- `party`: exact constituent ID in `data/meta/kNN.json`. A constituent emblem must
  never silently become the logo of its whole joint list. A few constituent IDs
  can occur in more than one list; resolve them within the election metadata.

Required fields: `file` (relative to `public/`, or null), `sourceUrl` (description
page, not a hotlink), `licence`, `attribution`, `hosted`, `inUseEvidence`, and
`confidence` (`high` or `medium`). Additional fields:

- `suggestedFile`: intended asset location for an outstanding licensed download; it does not exist yet.
- `assetSourceUrl`: actual original download URL (may be the official party origin).
- `displayBackground`: optional rendering hint; `dark` for the white Democrats 2026 design.
- `evidenceId`: stable ID in `sources.json`, including the reviewed Commons revision.
- `status`: `verified` (local asset), `download-unavailable` (dated, licensed source,
  but retrieval failed), or `unresolved` (candidate only; no display permission).
- `sha256`: committed asset hash; `originalSha256`: downloaded original hash.

Only entries with `hosted: true`, `status: "verified"`, and a non-null `file` are
ready for local display. `hosted: false` entries must not be fetched at runtime:
those URLs are research references for a human decision, not permission to embed.
Do not treat every external-only entry as a copyright refusal: read `status`.
Missing entries retain the UI's normal letters fallback. No logo is synthesized
from ballot letters, recoloured, or assigned to a different election by analogy.

## Licence and date policy

Only Commons public-domain or freely licensed files are committed. The specific
Commons licence/template is recorded; attribution for CC BY-SA assets must travel
with the displayed image and link to its source and licence. Resized derivatives
retain the original licence. Public-domain credits are retained for provenance,
although copyright attribution is not required. The project MIT licence does not
relicense these files. Trademark restrictions can still apply.

The evidence must identify the relevant election, period, or a design dated during
that campaign. An upload/recreation date alone does not prove historical use.
Campaign-period date-only evidence is medium confidence and is not extended into
later elections. Explicit election identification on Commons is accepted as
community evidence, not described as independent verification of an NLI original.
No high-confidence assignments are claimed in this pass. Unresolved dates are
omitted; an unresolved rights candidate can be retained with a null file.

English-language Wikipedia was not consulted or linked as a source. Incidental
links within Commons pages were not followed. Hebrew Wikipedia is secondary.
Commons file transfers do not turn an uninspected upstream page into evidence.
`sources.json` preserves compact inspected metadata, including rejected candidates,
without copying full pages or upstream excluded-source URLs.

## Reproduction and verification

The accepted source and transformed PNG/SVG files are durable inputs. Scratch
contains only reproducible downloads and tools, under `.backup-scratch/logos/`
and `.backup-scratch/logo-tools/`; no global tool settings were changed.

For a hosted entry, find its `evidenceId` in `sources.json`. The `revisionUrl`
pins the inspected description; `downloadUrl` identifies the Commons original. Prefer the entry’s `assetSourceUrl`
when present: two files came directly from the official origins credited by Commons. Download
that original, verify `originalSha256`, then keep SVG unchanged. For raster input,
use Python 3.14 and Pillow 12.2.0: `im.convert('RGBA')`,
`im.thumbnail((256, 256), Image.Resampling.LANCZOS)`, and
`im.save(output, optimize=True)` as PNG. Do not overwrite a verified asset with a
new upstream revision without repeating date/licence review. Final hashes are
recorded in each election overlay. Sources may disappear; committed accepted
assets and these parameters preserve the accepted result.

Run `python3 scripts/validate-party-logos.py` from the repository root. This uses
only the standard library and checks identities, hashes, licence/status gates,
SVG safety and PNG dimensions. No frontend tests are needed for these overlays;
there is no UI integration in this change.
