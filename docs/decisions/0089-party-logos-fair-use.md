# Official campaign logos for identification under fair use

Status: **accepted**. Decided by the owner on 4 November 2026. Extends the party metadata
in [0087](0087-constituent-parties-blocs-and-colours.md).

## Context

The explorer identifies electoral lists and the constituent parties of joint lists. Requiring a
free licence for every emblem excluded official campaign logos even when their origin and use
were documented. The owner chose to allow those logos under fair use for this non-commercial
civic reference tool. This records that product decision, not a finding that every use is licensed.

## Decision

1. A verified official campaign logo may be hosted with `rights: "fair-use-identification"`.
   A party objection means removal of its asset and display reference. No permission or free
   licence is implied; copyright remains with the rights holder.
2. Existing freely licensed entries keep their licence and attribution data and use
   `rights: "free-licence"`. Fair use is not a replacement licence on those entries.
3. Every entry still needs a source and evidence of use in the particular election campaign.
   New fair-use entries cite the official party/campaign origin, official social publication,
   or CEC publication; record an in-use date and archive URL/timestamp when available. A
   dated archive must be inspected, not inferred from the existence of an index record.
4. A joint list receives its own lockup. Constituents use separate entries keyed by party id,
   attached to dataset `list.parties[].logo`. Neither identity substitutes for the other, nor
   does a design carry across elections without dated evidence.
5. Retain download URL, final bytes and SHA-256, and original SHA-256. Prefer official SVG;
   otherwise use PNG at most 256 pixels on its long side, below 60,000 bytes. Preserve the
   original colours and transparency; record a dark backdrop where necessary.
6. Downloads are build-time only. File, identity and hash checks remain mandatory. Missing
   or unverified logos remain absent; their ballot letters continue to identify lists.

## Consequences

Rights basis travels with the dataset logo credit. Secondary reporting can guide discovery,
but does not become the recorded official origin of a newly hosted fair-use image. Existing
Commons assignments retain their documented medium-confidence limitations. Retrieval limits
and unresolved date/variant questions remain research gaps even though free licensing is no
longer a prerequisite. See [the research archive](../research/party-logos.md).

## Addendum — 5 November 2026: remove cross-election substitution

The owner reaffirmed that historical accuracy requires evidence for the particular election: a nearby campaign’s emblem, even with a visible source year, cannot stand in for a missing whole-list or constituent logo. The dataset builder therefore applies only that election’s verified catalog, and the unused source-year caption is removed. Where no logo can be sourced with the required dated evidence, Hebrew ballot letters are the fallback in both English and Hebrew. The original decision and its conclusions remain unchanged; this restores points 3, 4 and 6 above; it neither withdraws retained assets nor asserts that an unsourced emblem never existed. Coverage counts only same-election verified assignments, with research gaps left explicit.
