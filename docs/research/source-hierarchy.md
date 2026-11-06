# Source hierarchy (ranked)

The order in which sources win when they disagree. It consolidates the source policy in
[DATA.md](../DATA.md), the owner's editorial stance and the archive notes in
[archive-access-routes.md](archive-access-routes.md). Retained sources are catalogued in
`data/raw/SOURCES.json`; party sites and profiles in `data/meta/party-links/`.

## Ranks

1. **Primary official record of the fact.**
   - The law and Reshumot (the official Gazette, ילקוט הפרסומים), including the official results notice.
   - Central Elections Committee (CEC) publications: results, candidate lists, surplus agreements, protocols.
   - Knesset: OData service, member pages, government pages, plenum protocols, Knesset News.
   - The President's Residence for recommendation rounds and mandates.
   - Prime Minister's Office and other gov.il records for governments and official events.
   - Central Bureau of Statistics (CBS).
   - Israel State Archives documents.
2. **Contemporaneous archival press.** National Library Historical Jewish Press (JPress): Davar, Maariv, Haaretz,
   Al HaMishmar, Herut, HaTzofe, Palestine/Jerusalem Post. Same-week reporting of a count, a consultation or a
   formation. Prefer two papers from different camps when the fact is political.
3. **Academic and non-partisan research institutions.** Israel Democracy Institute (IDI), university presses,
   peer-reviewed work, the Knesset Research and Information Center.
4. **Established Israeli news organisations reporting the fact** (secondary). Kan, Ynet, Haaretz, Maariv, Israel Hayom,
   Globes, Walla, N12, Times of Israel, Jerusalem Post. Use them for what happened, never for opinion. When the fact
   is politically contested, prefer outlets not aligned with either side, or cite one from each side.
5. **Hebrew Wikipedia.** Only as a lead to a better source, or as an explicitly labelled secondary source when nothing
   better can be reached. Never the sole basis when a rank 1–4 source is reachable.

**Never used:**
- English Wikipedia, in any role: not cited, not linked, not used as a lead.
- Partisan sources inside Israeli politics: party campaign material, except as evidence of the party's own claims
  (name, logo, list); advocacy NGOs from any camp; opinion columns.

## Rules when sources disagree

- A higher rank beats a lower rank. Within a rank, the document closer in time and closer to the act wins: for
  example, the official notice beats a later summary.
- Record a disagreement; never resolve it silently. In the data, keep the winning value and add a note naming the
  other source. Show it in the app only when it matters to the reader.
- If two sources of the same rank disagree and no higher-ranked source settles it, the item is **disputed**. Present
  both, with sources, to the owner.

## Editorial stance (binding)

- The project is Israeli and Zionist; it is not activist. Israeli accounts of history are not "biased" for this
  project.
- Terror attacks are named as terror. Hamas and the other groups and individuals who took part in 7 October are
  terrorists.
- Use Israeli official terminology: operation names and "War of Independence".
- Neutral means not partisan within Israeli politics. Domestic political events stay factual and attributed.
- Hebrew sources are always welcome.

## Access etiquette

- No proxies, rotating IPs, or bot-challenge, CAPTCHA, paywall or login circumvention. Honour HTTP 429 and
  Retry-After.
- User-Agent: `israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)`. Never send an
  email address.
- JPress (National Library) shows a bot challenge to scripts. Use only what loads normally, or what an authorised API
  key returns once the owner provides one.
