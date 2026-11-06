# Data audit k13 (23 June 1992, 13th Knesset): Opus auditor

Auditor: Claude Opus (independent; did not read the Codex report). Base: `ece8a47` (contains `53cca36`). Accessed:
2026-11-06 for every source below. Method: [BRIEF.md](BRIEF.md) with [source-hierarchy.md](../source-hierarchy.md).
No data edited.

## Summary

| Class | Count | Notes |
|---|---:|---|
| OK | 384 | Counted per field: national totals and rules (7), 25 lists × votes and seats (50), letters (22/25), list names (15/25), 115/120 elected Hebrew spellings (all 120 in the right list and order), 119/120 English names, Arens omission (1), 16 joint-list rank assignments, 2 bloc schemes, 24 aftermath facts, 2 context events (substance), 2 logos, 9 family hashes |
| WRONG | 24 | Rows 1–24: 3 ballot letters, 9 list names plus 1 punctuation row, 5 candidate spellings, government 25 end date and missing acting PM, 1 stale lineage hash, propagated copies, 1 context wording, 2 stale gap texts, 1 typographic name |
| UNSUPPORTED | 1 | Context event cites a candidate-gazette scan that lacks the Likud page |
| UNVERIFIABLE | 1 | Per-faction recommendations to President Herzog (all 10 entries `unknown`) |
| DISPUTED | 0 | — |

Main findings:

1. **The ballot letters and names of 10 of the 25 lists do not match the official results notice** (Reshumot, YP 4021,
   1 Jul 1992, pp. 3776–3777), which is the cited source (`k13-results-gazette`), nor the candidate notice (YP 4017,
   14 Jun 1992). Three letters are wrong (נז→**נד**, נס→**נכ**, קנ→**קן**), and seven names have wrong words
   ("ציפר" for **ציפור**, "התורה הארץ" for **התורה והארץ**, "…לרווחה" for **…לוחמת**, "…ועולים משוחררים" for
   **…וחיילים משוחררים**, an invented "בישראל", "הלאומית הדמוקרטית" for **הלאומית לדמוקרטיה**). Votes and seats
   are all correct.
2. **Five elected members' names differ from both official notices**, among them Nissim Zvili (data "זווילי"; both
   notices "זוילי") and Avraham Poraz (data "פורמנטיר"; both notices "פוזמנטיר").
3. **Government 25 did not end on 4 Nov 1995.** Knesset OData records Shimon Peres as its prime minister from
   5 to 22 Nov 1995, and 29 positions end on 22 Nov 1995.

The official results notice *is* retained (gov.il copy of YP 4021; sha256 `34f6b7dd…` re-downloaded and matched).
No correction notice was found, but I did not search the 1992 gazette run for one beyond that issue. No English
Wikipedia anywhere in the k13 files (`grep -c en.wikipedia` = 0 in `data/meta/k13.json`, `aftermath/k13.json`,
`bios/k13.json`, `logos/k13.json`, `party-links/k13.json`, `public/data/k13.json`).

## Non-OK findings

Severity: **H** high (a wrong fact users see), **M** medium, **L** low (wording, formatting, or not displayed).

Key sources:
- **YP 4021** = Reshumot, Yalkut HaPirsumim 4021, 1 Jul 1992, "הודעה על תוצאות הבחירות לכנסת השלוש-עשרה", pp.
  3776–3777, https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset13-results.pdf (rank 1;
  retained as `data/raw/research/k13-results.pdf`).
- **YP 4017** = candidate notice, 14 Jun 1992, gov.il scan https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset13-cand.pdf
  (odd pages only, plus 3630 and 3632) and the IDI-hosted page facsimiles in `data/raw/k13/yp4017-*.pdf` (rank 1).

Each name below was read from page renders zoomed to 3–7×, not from a text layer (the PDFs have none).

| # | Sev | File | JSON path | Current value | Correct value | Class | Source (rank) | Quote | Accessed |
|---|---|---|---|---|---|---|---|---|---|
| 1 | H | `data/raw/k13/national.reviewed.json` → `public/data/k13.json` | `lists[letters=נז].letters` (public `lists[16].id/letters` "13-נז") | `נז` | `נד` | WRONG | YP 4021 §1 p. 3776 (1) | "נד  תנועת נפגעי משכנתאות, חסרי דיור וחיילים משוחררים  5,962" | 2026-11-06 |
| 2 | H | same | `lists[letters=נז].nameHe` (public `lists[16].nameHe`) | `תנועת נפגעי משכנתאות חסרי דיור ועולים משוחררים` | `תנועת נפגעי משכנתאות, חסרי דיור וחיילים משוחררים` | WRONG | YP 4021 §1 (1) | as row 1 | 2026-11-06 |
| 3 | H | same | `lists[letters=נס].letters` (public `lists[20]`) | `נס` | `נכ` | WRONG | YP 4021 §1 (1); YP 4017 p. 3641 (1) | YP 4021: "נכ  מפלגת נשים  2,886"; YP 4017: "אות הרשימה: נכ / הכינוי: מפלגת נשים" | 2026-11-06 |
| 4 | H | same | `lists[letters=קנ].letters` (public `lists[12]`) | `קנ` | `קן` (final nun, as the data already writes `ץ` for Tzomet) | WRONG | YP 4021 §1 (1) | "קן  המפלגה הליברלית החדשה בראשות יצחק מודעי  16,669" | 2026-11-06 |
| 5 | H | same | `lists[letters=זה].nameHe`; public `lists[24].nameHe` and `shortHe`; `shortEn` | `ציפר`; shortEn `Tziper` | `ציפור`; shortEn e.g. `Tzipor` | WRONG | YP 4021 §1 (1); YP 4017 p. 3631 (1) | YP 4021: "זה  ציפור  523"; YP 4017: "אות הרשימה: זה / הכינוי: ציפור" | 2026-11-06 |
| 6 | H | same | `lists[letters=יז].nameHe`; public `lists[18].nameHe`, `shortHe` | `התורה הארץ בראשות הרב משה לוינגר` / `התורה הארץ` | `התורה והארץ בראשות הרב משה לוינגר` / `התורה והארץ` | WRONG | YP 4021 §1 (1); YP 4017 p. 3635 (1) | YP 4017: "אות הרשימה: יז / הכינוי: התורה והארץ בראשות הרב משה לוינגר" | 2026-11-06 |
| 7 | H | same | `lists[letters=יד].nameHe` (public `lists[21]`) | `התקוה - תנועה חברתית לרווחה בראשות צ׳רלי ביטון` | `התקוה - תנועה חברתית לוחמת בראשות צ׳רלי ביטון` | WRONG | YP 4021 §1 (1); YP 4017 p. 3633 (1) | YP 4017: "אות הרשימה: יד / הכינוי: התקוה - תנועה חברתית לוחמת בראשות צ'רלי ביטון" | 2026-11-06 |
| 8 | H | same | `lists[letters=ד].nameHe` and `shortHe`; `shortEn` (public `lists[14]`) | `התנועה הלאומית הדמוקרטית ועליה`; `National Democratic Movement and Aliyah` | `התנועה הלאומית לדמוקרטיה ועליה`; e.g. `National Movement for Democracy and Aliyah` | WRONG | YP 4021 §1 (1); IDI 1992 page (2) https://www.idi.org.il/policy/parties-and-elections/elections/1992/ | YP 4021: "ד  התנועה הלאומית לדמוקרטיה ועליה  11,697"; IDI: "התנועה לדמוקרטיה ועלייה" | 2026-11-06 |
| 9 | M | same | `lists[letters=ק].nameHe` (public `lists[15]`) | `גימלאים עולים קשישים בישראל` | `גימלאים, עולים וקשישים` (no "בישראל" in either notice) | WRONG | YP 4021 §1 (1); YP 4017 p. 3647 (1) | YP 4017: "אות הרשימה: ק / הכינוי: גימלאים, עולים וקשישים" | 2026-11-06 |
| 10 | M | same | `lists[letters=ת].nameHe` (public `lists[10].nameHe`) | `תחיה` | `התחיה` (`shortHe` already `התחיה`) | WRONG | YP 4021 §1 (1); YP 4017 p. 3651 (1) | YP 4021: "ת  התחיה  31,957" | 2026-11-06 |
| 11 | L | same | `lists[letters=כי].nameHe` (public `lists[23]`) | `תל״י התנועה להתחדשות ישראל` | `תל״י תנועה להתחדשות ישראל` | WRONG | YP 4021 §1 (1); YP 4017 p. 3635 (1) | YP 4017: "אות הרשימה: כי / הכינוי: תל"י תנועה להתחדשות ישראל" | 2026-11-06 |
| 12 | L | same | `lists[letters=מרצ].nameHe`, `lists[letters=ב].nameHe` (and `data/meta/k13.json` `lists[0].nameHe`, `parties.json` `parties[44].names[9]`, `parties[189].names[0]`) | `מרצ - ישראל הדמוקרטית - רצ מפם שינוי`; `מפד״ל חזית דתית לאומית - המזרחי הפועל המזרחי` | Punctuation from the notice: `מרצ - ישראל הדמוקרטית - רצ, מפם, שינוי`; `מפד״ל, חזית דתית לאומית - המזרחי, הפועל המזרחי` | WRONG | YP 4021 §1 and §3 (1) | "מרצ – ישראל הדמוקרטית – רצ, מפם, שינוי"; "מפד"ל, חזית דתית לאומית – המזרחי, הפועל המזרחי" | 2026-11-06 |
| 13 | M | `data/raw/k13/candidates.reviewed.json` and `elected.reviewed.json` → `public/data/k13.json` | `lists[0].candidates[9].nameHe` (13-אמת#10) | `זווילי נסים` | `זוילי נסים` | WRONG | YP 4021 §4(א) #10 (1); YP 4017 p. 3620 #10 (1); Knesset OData PersonID 2331 (1) | YP 4021: "10. זוילי נסים"; OData: LastName "זוילי". (Hebrew Wikipedia's title "נסים זווילי", used by the bio match, is the likely origin.) | 2026-11-06 |
| 14 | M | same | `lists[3].candidates[6].nameHe` (13-מרצ#7) | `פורז פורמנטיר אברהם` | `פורז פוזמנטיר אברהם` | WRONG | YP 4021 §4(ז) #7 (1); YP 4017 p. 3638 #7, IDI facsimile `yp4017-6695.pdf` (1) | YP 4021: "7. פורז פוזמנטיר / אברהם"; YP 4017: "7. פורז פוזמנטיר אברהם" | 2026-11-06 |
| 15 | M | same | `lists[7].candidates[2].nameHe` (13-ו#3) | `גוזנסקי תמר` | `גוז׳נסקי תמר` | WRONG | YP 4021 §4(ד) #3 (1); YP 4017 p. 3629 #3 (1); Knesset OData PersonID 541 (1) | YP 4021: "3. גוז'נסקי תמר"; OData LastName "גוז'נסקי" | 2026-11-06 |
| 16 | L | same (`candidates.reviewed.json` only; `elected.reviewed.json` has it right) | `lists[1].candidates[11].nameHe` (13-מחל#12) | `בן-אלישר אליהו` | `בן אלישר אליהו` (no hyphen in either notice) | WRONG | YP 4021 §4(ו) #11 (1); YP 4017 p. 3636 #12, `yp4017-6891.pdf` (1) | YP 4017: "12. בן אלישר אליהו" | 2026-11-06 |
| 17 | L | same (`candidates.reviewed.json` only) | `lists[9].candidates[0].nameHe` (13-ע#1) | `דראושה עבד-אל-והאב` | `דראושה עבד-אלוהאב` | WRONG | YP 4017 p. 3642 #1, `yp4017-6608.pdf` (1); YP 4021 §4(ח) #1 (1) | YP 4017: "1. דראושה עבד-אלוהאב"; YP 4021: "1. דראושה עבד־אלוהאב" | 2026-11-06 |
| 18 | M | `data/meta/aftermath/k13.json` | `government.endDate`; `government.primeMinisters` | `1995-11-04`; only Rabin (to `1995-11-04`) | endDate `1995-11-22`; add Shimon Peres as (acting) PM `1995-11-05` → `1995-11-22`. Rabin's own `to: 1995-11-04` is correct. `gaps[4]` asked for exactly this primary source. | WRONG | Knesset OData `KNS_PersonToPosition()?$filter=GovernmentNum eq 25` (1) https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PersonToPosition()?$filter=GovernmentNum%20eq%2025 | PersonToPositionID 4318: PersonID 456, PositionID 45, DutyDesc "ראש הממשלה", StartDate 1995-11-05, FinishDate 1995-11-22, GovernmentNum 25; 29 of 65 rows end 1995-11-22; Rabin's row 4178 ends 1995-11-04 | 2026-11-06 |
| 19 | L | `data/meta/party-lineage.json` | `sources.k13.sha256` | `92643f881b9e43ed4e3e55ddae9558c649c4193f9bfaa9ac91e54a70d70ae9fe` | Current `public/data/k13.json` hash is `ae0dfff042e9eadf515a5787f1eea5186034dfe1f72afafd32043a336de5e68d`. The family files already carry the new hash; `validate-families.ts` does not check the lineage hash. The hash changes again once rows 1–17 are fixed. | WRONG | Internal (`sha256sum`) | n/a | 2026-11-06 |
| 20 | M | `data/meta/parties.json`, `data/meta/party-links/k13.json` | `parties[195,196,197,199,202,204,205].names[0].nameHe/nameEn`; party-links `lists["13-ד","13-יז","13-זה"][0].titleHe`; list ids `13-נז`, `13-נס`, `13-קנ` in party-links, `party-lineage.json` `partyAppearances[340,344,348]`, vehicle ids `vehicle-13-נז/נס/קנ` | Propagated copies of rows 1–11 (e.g. `ציפר`/`Tziper`, `התורה הארץ`, `…לרווחה`, `…בישראל`) | Re-derive from the corrected names and letters. The ids change with the letters, so rename every reference together. | WRONG | as rows 1–11 (1) | n/a | 2026-11-06 |
| 21 | L | `data/meta/election-context.json` | `events[15].textEn/textHe` (id `eligibility-final-k13-4`) | "Kach and Kahane Chai. The list was excluded; the Supreme Court rejected the appeal." / "הרשימה נפסלה… דחה את הערעור" | Two lists: "Both lists were disqualified; the Supreme Court rejected the appeals." / "שתי הרשימות נפסלו… דחה את הערעורים" | WRONG | IDI, "פסילת רשימות ומועמדים", 31 Aug 2026 (2) https://www.idi.org.il/articles/65951 | "בשנת 1992 נפסלה רשימת כך פעם נוספת יחד עם רשימת כהנא חי"; table rows "1992 / כך / הערעור נדחה" and "1992 / כהנא חי / הערעור נדחה" | 2026-11-06 |
| 22 | L | `data/meta/aftermath/k13.json` | `gaps[0]` | "Certification date and official first-sitting record not retrieved…" | Stale. Results notice YP 4021 is signed "ל' בסיון התשנ"ב (1 ביולי 1992)" by Justice Avraham Halima, CEC chairman. First sitting 13 Jul 1992: Knesset OData MK StartDate 1992-07-13 (retained `k13-membership-odata`), and the Knesset's own record of Rabin's speech (row 25 source). | WRONG | YP 4021 p. 3777 (1); `data/raw/k13/knesset-odata-members.json` (1) | YP 4021: "ל' בסיון התשנ"ב (1 ביולי 1992) … אברהם חלימה … יושב ראש ועדת הבחירות המרכזית לכנסת השלוש-עשרה" | 2026-11-06 |
| 23 | L | `data/meta/aftermath/k13.json` | `term.endedBy.textEn/textHe` | "…the final dissolution-law date remains unverified here." | Now verifiable: חוק התפזרות הכנסת השלוש-עשרה, התשנ"ו-1996, published 27 Feb 1996. `endedBy.date` "1996-02" stays correct and could become `1996-02-27`. | WRONG (stale) | Knesset OData `KNS_IsraelLaw` IsraelLawID 2000623 (1) https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_IsraelLaw()?$filter=KnessetNum%20eq%2013 | Name "חוק התפזרות הכנסת השלוש-עשרה, התשנ"ו-1996", PublicationDate "1996-02-27T00:00:00" | 2026-11-06 |
| 24 | L | `public/data/k13.json` via `data/raw/bios/knesset-site-mk-names-en.json` | `lists[0].candidates[21].nameEn` (13-אמת#22) | ``Ra`anan Cohen`` (backtick) | `Ra'anan Cohen`. The Knesset site literally returns a backtick, so this is a typographic artefact: normalise ` to ’. | WRONG | Knesset site API `GetMkDetailsHeader?mkId=67&languageKey=en` (1) | `"Name":"Ra`anan Cohen"` | 2026-11-06 |
| 25 | L | `data/meta/election-context.json` | `events[46].relatedSources[0]` (Arens) | Cites `k13-candidates-gazette` (gov.il scan `knesset13-cand.pdf`) | The gov.il scan lacks page 3636 (Likud). Arens at #2 is printed in the IDI facsimile `k13-candidates-yp4017-idi-6891`; cite that. The substance is correct: Arens is #2 in YP 4017 and absent from YP 4021 §4(ו). | UNSUPPORTED | YP 4017 p. 3636 via `yp4017-6891.pdf` (1) | "2. ארנס משה" | 2026-11-06 |
| 26 | M | `data/meta/aftermath/k13.json` | `recommendationRounds[0].entries[*].status` (all `unknown`) | 10 × `unknown`, totals.unknown 120 | Could not establish per-faction recommendations. Tried: JTA 29 Jun, 3 Jul, 14 Jul 1992 (consultations, mandate, vote; no per-party tally); UPI 2 Jul 1992 and LA Times 3 Jul 1992 ("Herzog polled all the other parties", no breakdown); Exa searches in Hebrew and English; JPress not attempted (bot challenge, per etiquette). Partial lead only: Ynet 2019 (4) says Arab parties recommended Rabin in 1992. Keeping `unknown` is honest; a JPress/Davar 30 Jun–1 Jul 1992 check would settle it. | UNVERIFIABLE | Ynet (4) https://www.ynet.co.il/articles/0,7340,L-5594477,00.html | "מדובר בפעם הראשונה שמפלגות ערביות ממליצות על מועמד לראשות הממשלה מאז 1992, אז המליצו לנשיא להטיל את מלאכת ההרכבה על יצחק רבין ז"ל" | 2026-11-06 |

### Sourcing flags (no class change)

- **Hebrew Wikipedia as sole basis where a better source exists.**
  - `data/meta/k13.json` `blocSchemes[id=blocking-bloc-1992].sources` cites only Hebrew Wikipedia. IDI (rank 2)
    states it: "לגוש השמאל (עבודה, מרצ, חד"ש ומד"ע) יש בלוק חוסם של 61 חברי כנסת … בקואליציה תמכו מבחוץ … חד"ש
    והמפלגה הדמוקרטית הערבית" (https://www.idi.org.il/policy/parties-and-elections/elections/1992/). Add it.
  - `lists[מרצ].parties[*].sources` cite only Hebrew Wikipedia. The IDI-hosted YP 4017 facsimile
    (`yp4017-6695.pdf`, p. 3638) carries handwritten party tags beside each Meretz name (רצ/מפם/שינוי). They match
    the data's assignment exactly: Ratz 1, 4, 5, 8, 10, 11; Mapam 2, 6, 9, 12; Shinui 3, 7. The tags are unofficial
    annotations, so this corroborates rather than proves.
- **Arens's omission.** Not an error, but resolvable beyond "no cause inferred": he announced on 25 Jun 1992 that
  he was quitting public life (El Tiempo/EFE-Reuters-AFP, 26 Jun 1992, https://www.eltiempo.com/archivo/documento/mam-145450:
  "reveló anoche a la televisión estatal que se retiraba de la vida pública"; Time, 6 Jul 1992). These are foreign
  outlets, outside ranks 1–4. An Israeli press source would be needed to cite it.
- **IDI 1992 table** (rank 2) prints Tzomet 165,366. The official 166,366 (YP 4021) is right and the data uses it;
  IDI also shortens several list names. The data correctly ignores IDI for votes (`sourceNotes`).
- **Editorial stance:** the term-event wording (Hebron massacre, Hamas terrorists, Rabin assassination) is factual
  and attributed, and matches Israeli official chronologies (MFA, Knesset). No partisan wording found.

## Checked and found OK

| Area | Claim(s) | Source (rank) | Quote / note |
|---|---|---|---|
| Date, Knesset | 1992-06-23, 13th | CBS table 27.2 (1), retained `cbs-national-totals-2024.pdf` | row "13 … 23.6.1992" |
| Registered | 3,409,015 | CBS 27.2 (1); IDI (2) | "3,409,015 … 23.6.1992" |
| Votes cast | 2,637,943 | CBS 27.2 (1); IDI (2) | "2,637,943"; turnout 77.4 |
| Valid | 2,616,841 | YP 4021 §1 (1); CBS (1) | "סה"כ קולות כשרים 2,616,841" |
| Invalid | 21,102 | YP 4021 §2 (1) | "מספר הקולות שנמצאו פסולים: 21,102." 2,616,841 + 21,102 = 2,637,943 ✓ |
| Votes, 25 lists | all 25 match | YP 4021 §1 (1) | e.g. אמת 906,810; מחל 651,229; מרצ 250,667; ץ 166,366; ב 129,663; שס 129,347; ג 86,167; ו 62,546; ט 62,269; ע 40,788; ת 31,957; פ 24,181; קן 16,669; קל 12,851; ד 11,697; ק 8,327; נד 5,962; דף 3,750; יז 3,708; נ 3,355; נכ 2,886; יד 2,053; ים 1,734; כי 1,336; זה 523 |
| Seats | 44/32/12/8/6/6/4/3/3/2 = 120; others 0 | YP 4021 §3 (1) | "סה"כ 120 מנדטים" |
| Seat engine | 1.5% threshold (39,252.6 votes; Tehiya out, ADP in); Bader–Ofer with no agreements reproduces every seat | Amendment 23 (1991), retained (1); own recomputation | quota 20,715.4; base 117 + 3 remainders to אמת, מחל, ע |
| Letters | 22 of 25 correct (rows 1, 3, 4 wrong) | YP 4021 (1) | — |
| List names | אמת, מחל, ץ, שס, ג, ו, ט, ע, פ, קל, קן, דף, נ, נכ, ים correct | YP 4021 §1 (1) | — |
| Withdrawn / missing lists | 25 lists in the notice = 25 in the data; none withdrawn | YP 4021 §1 (1) | Kach and Kahane Chai were disqualified, not on the ballot; held as a context event |
| Agreements | none recorded; seats reproduce | as above | agreement notice not found; consistent |
| Elected, 120 names and order | 115 exact; 5 in rows 13–17 | YP 4021 §4 pp. 3776–3777 (1) | candidateRanks mapping correct, including Likud 1, 3–33 |
| Arens (#2) not seated | `notSeated: true`, notesHe | YP 4017 p. 3636 (1); YP 4021 §4(ו) (1) | "2. ארנס משה" / §4 goes 1. שמיר, 2. שרון |
| Opening day | 13 Jul 1992 | Knesset OData (1); Knesset PDF of Rabin's speech (1) https://main.knesset.gov.il/Documents/FB/rabin001-92jul13.pdf | StartDate 1992-07-13 |
| English names (119) | Knesset site names, e.g. "Walid Sadik" (siteId 106), "Nissim Zvili" (52) | Knesset site API (1) | `"Name":"Walid Sadik"` (the Knesset's own current name for וליד צאדק חאג'-יחיא) |
| Joint lists | Meretz = Ratz + Mapam + Shinui, ranks as above; UTJ = Agudat Yisrael (1, 3, 4) + Moria/Peretz (2) + Degel (none elected; Ravitz entered 16 Jul 1992, Gafni 28 Jun 1994) | YP 4021 list titles (1); Knesset OData faction rows (1); YP 4017 annotations (see flags) | OData: רביץ StartDate 1992-07-16; פרץ יצחק-חיים FinishDate 1992-07-16; גפני 1994-06-28 |
| First-government scheme | Labor + Meretz + Shas = 62; opposition 58 with Hadash/ADP noted as blocking | JTA 14 Jul 1992 (3) https://www.jta.org/archive/rabin-becomes-prime-minister-with-pledge-to-work-for-peace; IDI (2) | "Rabin's government, comprising the Labor, Meretz and Shas parties … 67-53. The three coalition partners, which together hold 62 seats" |
| Blocking bloc | 44 + 12 + 3 + 2 = 61 | IDI 1992 (2) | quoted in flags |
| Consultations began | 1992-06-28 (Sunday), 10 factions | JTA 29 Jun 1992 (3) | "began in earnest Sunday, as Israeli President Chaim Herzog began legally mandated meetings with the 10 parties" |
| Mandate to Rabin | 1992-07-02, 21 days | Knesset, Rabin's speech 13 Jul 1992 (1); JTA 3 Jul 1992 (3) | Knesset: "ביום א' בתמוז התשנ"ב, 2 ביולי 1992 הטיל עלי נשיא המדינה להרכיב ממשלה"; JTA: "He was given 21 days" |
| Confidence vote | 1992-07-13, 67–53 | JTA 14 Jul 1992 (3); Knesset speech (1) | "by a comfortable majority of 67-53" |
| Government 25 number, PM, start date | 25, Rabin, 1992-07-13 | Knesset OData GovernmentNum 25 (1) | row 4178 ראש הממשלה, StartDate 1992-07-13 |
| Government 26 confidence vote | 1995-11-22, 62–8, 38 abstentions | JTA 22 Nov 1995 (3) | "The final vote was 62-8, with 38 abstentions." |
| Term events | Oslo I 1993-09-13; Hebron massacre 1994-02-25; Jordan treaty 1994-10-26; Oslo II 1995-09; Rabin assassinated 1995-11-04; Hamas suicide bombings Feb–Mar 1996 | Cited Knesset/MFA quotes (1) present; dates consistent with OData (Rabin's positions end 1995-11-04) | — |
| Next election | 1996-05-29 | CBS 27.2 (1) | "29.5.1996" |
| Logos | Meretz 1992 and Tehiya 1992: evidence matches the claim | Commons file pages (as cited) | Meretz: "Original logo used by Meretz in 1992 … source … dps_pid=IE11705800"; Tehiya: "source=… elect_ephemera_1992.aspx" |
| Family hashes | all 9 `elections[12].datasetSha256` = current `ae0dff…` | Internal | — |
| Party link (New Liberal Party) | hewiki "המפלגה לקידום הרעיון הציוני" is the same party | Hebrew WP (5), as a lead | "המפלגה לקידום הרעיון הציוני או המפלגה הליברלית החדשה" |
| UI text | glossary: 1.5% threshold in 1992–2003; `il-1992-bader-ofer-1.5` | Amendment 23 (1) | — |

Not checked: platform links' contents (partisan IDI-hosted platforms; whether `degel-hatora-13.doc` is a UTJ-wide
platform or Degel-only), bios beyond names and ids, colours (labelled Hebrew Wikipedia convention).
