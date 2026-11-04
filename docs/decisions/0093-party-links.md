# Election-specific partisan and neutral party links

Status: accepted for implementation under the owner's request of 4 November 2026.
Extends decisions 0087 (constituent identities) and 0089 (election-specific metadata).

## Decision

Attach optional `links: PartyLink[]` to electoral lists and their constituent parties,
using `data/meta/party-links/kNN.json`. List keys are full list ids; constituent keys are
party ids. A joint-list source does not automatically cover its constituents. Every
identity and missing kind is recorded, even when no qualifying source has been acquired.
No UI changes are part of this decision.

Partisan preference: campaign-period archived official website; party platform, including
neutral archive copies; documented party ephemera or a documented party-organ newspaper;
then an existing repository scan of the same material. Live official sites are acceptable
for 2026 with retrieval date. An official election notice is neutral, never partisan.
Neutral preference: official Knesset faction page for the Knesset concerned; Hebrew
Wikipedia (labelled secondary); CEC/Registrar record; neutral academic/IDI profile.

Every URL must be verified before inclusion. HTTPS only; English Wikipedia is forbidden,
including archive-wrapped URLs. Captures/issues carry their actual date, not retrieval
date. Every link records publisher, source type and confidence. Unknown ids, invalid
metadata and forbidden URLs fail the build. Imported scenarios validate the new fields;
list and constituent links survive dataset-to-scenario conversion.

## Consequences and limits

Research coverage is partial, with exact coverage and unresolved identities recorded in
`docs/research/party-links.md` and the overlays. A dictionary homonym, successor party,
current website for an older election or uninspected CDX record is insufficient evidence.
Official records may cover multiple lists in one document, explicitly labelled as such.
The priority order is a research queue, not a claim that every preferred source has been
exhausted. Missing Knesset retrieval and unsearched NLI holdings remain open gaps.
