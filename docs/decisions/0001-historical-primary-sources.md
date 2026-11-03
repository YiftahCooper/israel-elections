# Historical election sources

## Context

The extension needs national votes and seats, geographical results, registered candidate
rosters and complete surplus agreements. These are separate facts requiring separate evidence.

## Decision

Retain the CEC history PDFs for candidates (16–24) and national results (16–20), the
CEC national HTML pages (21–24), and the official data.gov.il `votes-knesset` catalogue.
Use the catalogue's paged datastore for locality and polling-station inputs. Even the
16/17 XLS resources have functioning datastore representations. Use independent locality
resources only where the catalogue supplies them (19 onward). A derived locality sum
is not an independent cross-check.

For agreements, retain the primary statutory notices discovered in Yalkut HaPirsumim
7001, 8178 and 8708. These copies came from olaw.org.il, a mirror, which is explicit in
the manifest. A government-issued gazette remains a primary publication when mirrored;
the hosting URL is not misrepresented as a government URL.

## Alternatives considered

Direct e.data.gov.il file downloads are blocked to scripts. Guessing totals or filling
missing affiliation fields from political knowledge would introduce unsupported data.
Reconstructing agreements from seat outcomes cannot prove all pairs were registered.

## Consequences

Raw provenance is retained for every retrieved source. Historical public datasets remain
unreleased until parsing, reconciliation and agreement completeness are established.
The Knesset 19 discrepancy documented in DATA.md cannot be silently corrected.

## Sources

* https://data.gov.il/api/3/action/package_show?id=votes-knesset
* https://www.gov.il/he/pages/election-committee-history
* https://votes21.bechirot.gov.il/nationalresults (also votes22–24)
* https://olaw.org.il/yalkut/yalkut-7001.pdf
* https://olaw.org.il/yalkut/yalkut-8178.pdf
* https://olaw.org.il/yalkut/yalkut-8708.pdf
* Exact files, hashes and retrieval timestamps: data/raw/SOURCES.json.
