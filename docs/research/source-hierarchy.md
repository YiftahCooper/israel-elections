# Source hierarchy (ranked)

The order in which sources win when they disagree. It consolidates the source policy in
[DATA.md](../DATA.md), the owner's editorial stance and the archive notes in
[archive-access-routes.md](archive-access-routes.md). Retained sources are catalogued in
`data/raw/SOURCES.json`; party sites and profiles in `data/meta/party-links/`.

## Language

Most reliable sources for this project are in Hebrew: the Gazette, the CEC, the Knesset, the archives, the press and
most academic work. Search in Hebrew first and treat Hebrew sources as the main body of evidence. English versions of
official pages are often shorter or later, and the Hebrew original wins if they differ.

## Ranks

1. **Primary official record of the fact.**
   - The law and Reshumot (the official Gazette, ילקוט הפרסומים), including the official results notice.
   - Central Elections Committee (CEC) publications: results, candidate lists, surplus agreements, protocols.
   - Knesset: OData service, member pages, government pages, plenum protocols, Knesset News.
   - The President's Residence for recommendation rounds and mandates.
   - Prime Minister's Office and other gov.il records for governments and official events.
   - Central Bureau of Statistics (CBS).
   - Israel State Archives documents.
2. **Academic and non-partisan research institutions.** Israel Democracy Institute (IDI), university presses,
   peer-reviewed work, the Knesset Research and Information Center. They are checked and written with hindsight, so
   they correct early reports.
3. **Contemporaneous archival press.** National Library Historical Jewish Press (JPress): Davar, Maariv, Haaretz,
   Al HaMishmar, Herut, HaTzofe, Palestine/Jerusalem Post. Same-week reporting of a count, a consultation or a
   formation. Prefer two papers from different camps when the fact is political. Early reports can carry preliminary
   counts and rumours, so a rank 2 source beats them. They remain the best evidence of what was said or reported on
   a given day.
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

- The project is Israeli and Zionist; it is not activist.
- **Israel's account of its history is the accepted framing.** It is not treated as "one side" or as biased. For
  example:
  - terror attacks are named as terror; Hamas and the other groups and individuals who took part in 7 October are
    terrorists;
  - Israeli official terminology is used: operation names, "War of Independence";
  - places in Judea and Samaria (the West Bank) and Gaza carry the names Israelis and Hebrew speakers know, certainly
    in Hebrew mode (Shechem, Hevron). Names of places in other countries are not our concern.
- Neutral means not partisan within Israeli politics. Domestic political events stay factual and attributed.

## Access etiquette

- No proxies, rotating IPs, or bot-challenge, CAPTCHA, paywall or login circumvention. Honour HTTP 429 and
  Retry-After.
- User-Agent: `israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)`. Never send an
  email address.
- JPress (National Library) shows a bot challenge to scripts. Use only what loads normally.
- The owner's NLI API key is stored outside the repository at `~/.config/israel-elections/nli_api_key` (mode 600).
  Read it into a shell variable; never print, log or commit it, and never put it in a URL that gets logged. On
  6 Nov 2026 a keyed search still received the same browser challenge (HTTP 403), so the key alone does not grant
  machine access until NLI confirms it.
