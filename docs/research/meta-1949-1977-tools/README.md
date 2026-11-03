# Generator scripts for `data/meta/k1.json`–`k9.json` (1949–1977)

Reference copies of the one-off research scripts. They read caches in `.backup-scratch/`, which are not
retained, and contain absolute paths to the original worktree. Run order: `odata.py` (factions,
person-to-position, persons, site codes) → `match.py` → `bios.py` → `emit2.py` → `emit3.py`.
`wiki.sh` fetched raw Hebrew Wikipedia text; `crop.py` (PyMuPDF via `uvx --from pymupdf`) rendered the IDI scans.
Hebrew Wikipedia and IDI inputs are public; Knesset inputs come from `knesset.gov.il/Odata/ParliamentInfo.svc`
and `knesset.gov.il/WebSiteApi/knessetapi/MKs/`. English Wikipedia is not used.
