# Round 7 list/name research — 16 November 2026

Data-only handoff. The shared lineage table is consumed by `src/history/relations.ts`, the identity series and Compare matching; the history runtime compiles at build time. New `summaryEn`/`summaryHe` on pending lineage checks are ready for the history UI to consume. It currently uses a generic hard-coded warning instead.

- `faction-names.json`: exact recorded Hebrew names and membership record IDs for the six opening-faction cases and two later factions. Static final names do not date historical renames. No rename date is inferred from a member's departure.
- `register-checks.json`: six checks against the retained official 170-row register, including actual submitting-party names. U'Bizchutan's legal party is Responsibility; Hakel's is Machane Israel. A newer Hatzibur registration is reported by the party, with the live official entry still inaccessible.
- `history-display.json`: sourced known-name display choices (with registered names retained), the Panthers' extra 1977 appearance note, and the unknown constituent-seat-count label. These need U3 integration; adding this file alone does not change the screen.
- `1977-capacity.md`: documented historical ruling, reproduced 119-seat counterfactual, exact inferred implementation rule and official final seat table. U1 must implement and test the engine change.

Continuity added in `data/meta/party-lineage.json`: Gil 2006/2009, Greens 1999–2009, Ale Yarok 1999–2015, Tzomet 2003/2006 to the continuing organisation, Flatto-Sharon 1977/1981, Panthers 1973. Each edge cites an opened IDI profile; Gil also cites dated reporting, which describes a replacement party in 2010 and is therefore not proof of indefinite continuity. These institutional/retrospective links remain probable. No blanket promotion of all same-name parties to confirmed was made.

The six non-serving-candidate matches have not received new evidence here; a shared name is not a person-specific identification. Fifteen other reviewed failed runs now have election-specific evidence, including the new Haim Amsalem 2019 run. Its two independent reports explicitly identify the former Shas MK, rather than merely repeating a candidate name.

Regeneration: `python3 -I scripts/research/build-bios.py`; `node scripts/build-datasets.ts`; refresh dataset SHA-256 pins in `data/meta/{parties,party-lineage}.json` and family records from the named dataset bytes; `node scripts/gaps-register.ts`. Keep caches and intermediate output in `.backup-scratch/`. English display spellings are reviewed inputs in `data/raw/bios/entry-corrections.reviewed.json`; raw Knesset English values remain unchanged. No UI, votes, seats, agreements or roster order was changed.
