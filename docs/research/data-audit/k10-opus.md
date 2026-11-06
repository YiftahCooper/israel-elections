# Data audit k10 (30 June 1981, 10th Knesset): Opus auditor

Auditor: Claude Opus (independent; did not read the Codex report). Base: `2e15191` (contains `53cca36`). Accessed:
2026-11-06 for every source below. Method: [BRIEF.md](BRIEF.md) with [source-hierarchy.md](../source-hierarchy.md).
No data edited; no dataset build run.

Primary evidence opened and read page by page (rendered at 300–600 dpi, not only text layers):

- **YP 2727** (10 July 1981), pp. 2190–2192, the official results notice, signed by CEC chairman Moshe Etzioni on
  9 July 1981. Retained as `data/raw/research/k10-results.pdf` (`k10-results-gazette`, gov.il host).
- **YP 2721** (21 June 1981), pp. 2047–2063, the candidate lists notice. Retained as
  `data/raw/research/k10-candidates.pdf`. I read every list header on pp. 2048–2063.
- **YP 2720** (21 June 1981), p. 2027, the surplus-agreement notice. Retained as `data/raw/k10/yp2720-agreements.pdf`.
- CBS table 27.2 (`data/raw/research/cbs-national-totals-2024.pdf`).
- Knesset plenum protocols: 5 Aug 1981 (`10_ptm_529613.pdf`) and 10 Oct 1983 (`10_ptm_530067.pdf`).
- Knesset OData: `KNS_PersonToPosition` for governments 19 and 20, `KNS_Bill(169419)` and `KNS_PlmSessionItem`. I
  also used the retained `data/raw/k10/knesset-odata-members.json`.
- Knesset website MK API (`GetMkdetailsHeader`): all 120 bio links.
- The Israel State Archives chapter "הנשיא נבון והבחירות לכנסת העשירית", and the JTA bulletins of 15 and 16 July 1981.

## Summary

| Class | Count | Notes |
|---|---:|---|
| OK | 469 | Counted per field: 6 national totals; 31 votes; 31 seats; 29 list names; 22 letters; 31 withdrawn flags; 3 agreements; 10 published-roster counts; 119 elected names; 120 Knesset bio links; opening membership; 3 faction-change notes; 7 joint-list constituents and their counts; 13 first-government bloc fields; 12 recommendation fields; 21 aftermath facts; 10 dataset hashes |
| WRONG | 20 | **9 ballot letters**; 1 list name; 1 list-name punctuation; 2 fabricated short names (Yahad, Moked), which also reach parties.json, party-links and a family file (7 rows in all); 1 elected-name spelling; 1 stale gap |
| UNSUPPORTED | 0 | |
| UNVERIFIABLE | 1 | What the Alignment, Hadash, Tehiya, Telem, Shinui and Ratz told President Navon. The data already says "not stated", which is accurate. |
| DISPUTED | 1 | Begin's tasking: 15 July (press) or 16 July 1981 (date of the President's letter, State Archives). The data already records this conflict. |

Main findings:

1. **Nine of the 21 non-winning lists carry the wrong ballot letters.** The transcription misreads ז as ן, ס as
   כ/פ/ם, and so on. Both notices print the same letters, and the alphabetical order of the gazette table rules out
   three of the current values outright: הם, טן and נן would sort before הן, טי and ני.
2. **Two lists are shown under the names of unrelated parties:**
   - ישראל אחת (One Israel, led by Yitzhak Yitzhaki) appears as "יחד / Yahad", Ezer Weizman's 1984 party;
   - רשימת הגימלאים והקשישים בישראל (pensioners' list, led by Miriam Gahatia) appears as "מוקד / Moked". It is
     filed under the `moked` party entity and classified as a core member of the labour–Zionist-left family.
3. One list name is wrong: הרשימה למען עליה is recorded as "התנועה למען עליה".

Everything else checked holds: totals, votes, seats, agreements, the 120 elected names, the government formation and
the recommendation tallies.

No English Wikipedia anywhere in the k10 files. `grep en.wikipedia` returns 0 in `data/meta/k10.json`,
`aftermath/k10.json`, `bios/k10.json`, `logos/k10.json`, `party-links/k10.json` and the k10 block of
`scripts/lib/list-meta.ts`.

No list withdrew or was cancelled. YP 2721 publishes 31 lists and YP 2727 reports votes for the same 31, so
`withdrawn: false` is correct throughout.

## Non-OK findings

Severity: **H** high (wrong fact shown to users), **M** medium, **L** low (wording or formatting, or not displayed).

List index map used below. In `data/raw/k10/national.reviewed.json` the lists are in gazette order, `lists[0..30]` =
אמת, ב, ג, ד, הן, הם, ו, זה, ט, טן, יש, ים, יפ, כה, כט, כך, כן, לע, מחל, נן, ני, נכ, נק, ס, פז, פש, קנ, קן, רצ, ש, ת.
In `public/data/k10.json` they are in display order: `lists[16]`=קנ, `[18]`=הם, `[20]`=טן, `[9]`=יש, `[21]`=יפ,
`[25]`=נן, `[26]`=נכ, `[29]`=פז, `[30]`=קן, `[8]`=ט, `[10]`=ני, `[15]`=ד.

| # | Sev | File | JSON path | Current value | Correct value | Class | Source (rank) | Quote | Accessed |
|---|---|---|---|---|---|---|---|---|---|
| 1 | H | `data/raw/k10/national.reviewed.json` → `public/data/k10.json` (ids `10-…`) | `lists[5].letters` (ביטול חוק מס הכנסה) | `הם` | **`הס`** | WRONG | YP 2727 p. 2190 (1); YP 2721 p. 2052 header (1) | YP 2721: "אותיות הרשימה: "הס"; הכינוי: ביטול חוק מס הכנסה". Order check: the table runs הן → הס → ו, and הם would sort before הן. | 2026-11-06 |
| 2 | H | same | `lists[9].letters` (המועצה להצלת המולדת) | `טן` | **`טז`** | WRONG | YP 2727 p. 2190 (1); YP 2721 p. 2054 (1) | YP 2721: "אותיות הרשימה: "טז"; הכינוי: המועצה להצלת המולדת — רשימה משותפת לכנסת". The table runs ט → טז → טי, and טן would sort after טי. | 2026-11-06 |
| 3 | H | same | `lists[10].letters` (תנועת הצעירים) | `יש` | **`טי`** | WRONG | YP 2727 p. 2190 (1); YP 2721 p. 2054 (1) | YP 2721: "אותיות הרשימה: "טי"; הכינוי: תנועת הצעירים". The current value is also out of sequence: יש would sort after ים. | 2026-11-06 |
| 4 | H | same | `lists[12].letters` (יעד) | `יפ` | **`יס`** | WRONG | YP 2727 p. 2190 (1); YP 2721 p. 2055 (1) | YP 2721: "אותיות הרשימה: "יס"; הכינוי: יעד". The second letter is the same glyph as the single letter ס of עמך on p. 2060, and visibly different from the פ of פש. (Hebrew WP prints "יט", which would sort before ים, so it is out of sequence too.) | 2026-11-06 |
| 5 | H | same | `lists[19].letters` (רשימת האחוה הערבית) | `נן` | **`נז`** | WRONG | YP 2727 p. 2190 (1); YP 2721 p. 2059 (1) | YP 2721: "אותיות הרשימה: "נז"; הכינוי: רשימת האחוה הערבית". The table runs מחל → נז → ני, and נן would sort after ני. | 2026-11-06 |
| 6 | H | same | `lists[21].letters` (Aliyah list) | `נכ` | **`נס`** | WRONG | YP 2727 p. 2190 (1); YP 2721 p. 2060 (1) | YP 2721: "אותיות הרשימה: "נס"; הכינוי: הרשימה למען עליה" | 2026-11-06 |
| 7 | H | same, plus `data/meta/k10.json` `lists[10].nameHe` and `parties.json` `vehicle-10-נכ` | `lists[21].nameHe` | `התנועה למען עליה` | **`הרשימה למען עליה`** | WRONG | YP 2727 p. 2190 (1); YP 2721 p. 2060 (1) | Both notices: "הרשימה למען עליה" | 2026-11-06 |
| 8 | H | same | `lists[24].letters` (תנועת האוהלים) | `פז` | **`סז`** | WRONG | YP 2727 p. 2190 (1); YP 2721 p. 2060 (1) | YP 2721: "אותיות הרשימה: "סז"; הכינוי: תנועת האוהלים". This is the ס glyph of עמך, not the פ of פש. | 2026-11-06 |
| 9 | H | same | `lists[26].letters` (pensioners) | `קנ` | **`קז`** | WRONG | YP 2727 p. 2190 (1); YP 2721 p. 2061 (1) | YP 2721: "אותיות הרשימה: "קז"; הכינוי: רשימת הגימלאים והקשישים בישראל" | 2026-11-06 |
| 10 | H | same | `lists[27].letters` (עוצמה) | `קן` | **`קי`** | WRONG | YP 2727 p. 2190 (1); YP 2721 p. 2061 (1) | YP 2721: "אותיות הרשימה: "קי"; הכינוי: עוצמה" | 2026-11-06 |
| 11 | H | `scripts/lib/list-meta.ts:245` → `public/data/k10.json` `lists[8].shortHe/shortEn` | `"10-ט"` `he`/`en` | `יחד` / `Yahad` | Short name of **ישראל אחת**, e.g. `ישראל אחת` / `One Israel` (or the transliteration *Yisrael Ahat*). Yahad is Ezer Weizman's 1984 party and did not run in 1981. | WRONG | YP 2721 p. 2053 (1); YP 2727 p. 2190 (1) | YP 2721: "אות הרשימה: "ט"; הכינוי: ישראל אחת", headed by "1. יצחקי יצחק" | 2026-11-06 |
| 12 | M | `data/meta/parties.json` | `parties[id=vehicle-10-ט].nameEn` and `.names[0].nameEn` | `Yahad` | As #11 | WRONG | as #11 | as #11 | 2026-11-06 |
| 13 | L | `data/meta/party-links/k10.json` | `lists["10-ט"][0].titleHe` | `יחד — הודעת התוצאות לכנסת 10` | `ישראל אחת — הודעת התוצאות לכנסת 10` | WRONG | as #11 | as #11 | 2026-11-06 |
| 14 | H | `scripts/lib/list-meta.ts:263` → `public/data/k10.json` `lists[16].shortHe/shortEn` | `"10-קנ"` `he`/`en` | `מוקד` / `Moked` | Short name of the **pensioners' list**, e.g. `רשימת הגימלאים` / `Pensioners and Elderly List`. Moked (1973) is unrelated. The list was headed by Miriam Gahatia. Re-key as `10-קז` (#9). | WRONG | YP 2721 p. 2061 (1) | "אותיות הרשימה: "קז"; הכינוי: רשימת הגימלאים והקשישים בישראל", headed by "1. גהתיה מרים" | 2026-11-06 |
| 15 | M | `data/meta/parties.json` | `parties[id=moked].names[1]` (date 1981-06-30, nameHe רשימת הגימלאים…, nameEn Moked); `.activePeriod.to` = 1981-06-30; `.sources` includes `k10` | The 1981 pensioners' list is attached to the Moked party entity | Detach it: give the 1981 list its own `vehicle-10-קז`, remove the 1981 name from `moked`, and set Moked's `activePeriod.to` back to its own last appearance | WRONG | as #14 | as #14 | 2026-11-06 |
| 16 | M | `data/meta/families/labour-zionist-left.json:1864` | `elections[k10].members[listId=10-קנ]` (`partyIds: ["moked"]`, `scope: core`, `treatment: include`) | Pensioners' list classified as a core labour–Zionist-left member via Moked | Remove it; no family claim is supported for this list | WRONG | as #14 | Classification evidence is only "proposal" and "inferred" | 2026-11-06 |
| 17 | L | `data/meta/party-links/k10.json` | `lists["10-קנ"][0].titleHe` | `מוקד — הודעת התוצאות לכנסת 10` | `רשימת הגימלאים והקשישים בישראל — …` | WRONG | as #14 | — | 2026-11-06 |
| 18 | L | `data/raw/k10/national.reviewed.json` `lists[3].nameHe` → `public/data/k10.json` `lists[15].nameHe`; `parties.json` `poalei-agudat-yisrael` 1981 name | nameHe | `המחנה התורתי, פועלי אגודת ישראל ודתיים בלתי מפלגתיים` | `המחנה התורתי – פועלי אגודת ישראל ודתיים בלתי מפלגתיים`: a dash, not a comma | WRONG | YP 2727 p. 2190 (1); YP 2721 p. 2050 (1); YP 2720 p. 2027 (1) | "המחנה התורתי — פועלי אגודת ישראל ודתיים בלתי מפלגתיים" | 2026-11-06 |
| 19 | L | `data/raw/k10/candidates.reviewed.json` `lists[ני].candidates[0].nameHe` → `public/data/k10.json` `lists[10].candidates[0].nameHe` | nameHe | `אבו-חצירא אהרון` | `אבוחצירא אהרון`. Both notices print it without a hyphen, so the recorded "spelling variant" is not a variant. | WRONG | YP 2721 p. 2059 (1); YP 2727 p. 2192 (1) | YP 2721: "1. אבוחצירא אהרון"; YP 2727 (ח): "1. אבוחצירא אהרון" | 2026-11-06 |
| 20 | L | `data/meta/aftermath/k10.json` | `gaps[0]` | "Certification date and official first-sitting record not retrieved; …" | Stale. The certifying results notice is retained (YP 2727, signed 9 July 1981; the State Archives says the results were delivered to the President on 8 July). The opening sitting of 20 July 1981 is in the retained OData file (`knesset-odata-members.json`, all 120 opening `StartDate` = 1981-07-20). | WRONG | YP 2727 p. 2192 (1); Knesset OData (1) | YP 2727: "ז' בתמוז התשמ"א (9 ביולי 1981) … משה עציוני … יושב ראש ועדת הבחירות המרכזית" | 2026-11-06 |
| 21 | L | `data/meta/aftermath/k10.json` | `formation.events[1].date` (mandate-given) and `formation.conflicts[0]` | 1981-07-15, with the 16 July letter date recorded as a conflict | Keep the recorded conflict. Rank 1 (State Archives) dates the President's tasking letter to **16 July**. Rank 3/4 press (UPI 14 July: "Begin, who will meet Navon Wednesday" = 15 July; JTA bulletin 16 July: "formally summoned … today") puts the meeting on 15 July. Suggest: the invitation meeting on 15 July; formal tasking letter dated 16 July. | DISPUTED | ISA chapter https://catalog.archives.gov.il/site/chapter/navon-and-10-knesset-election/ (1); UPI https://www.upi.com/Archives/1981/07/14/Begin-asked-to-form-new-Israeli-government/8570363931200/ (4); JTA https://www.jta.org/archive/begin-starts-task-of-forming-new-government (3) | ISA: "ב-16 ביולי שלח נבון לבגין מכתב בו הטיל עליו להקים ממשלה" | 2026-11-06 |
| 22 | — | `data/meta/k10.json` `blocSchemes[1]`, `aftermath/k10.json` `recommendationRounds[0].entries[4..9]` | status `unknown` for אמת, ו, ת, כן, הן, רצ | "not stated" | Accurate as stated. I could not find what these six factions formally recommended: JPress is behind a bot challenge, and JTA gives leanings only. | UNVERIFIABLE | JTA 15 July 1981 https://www.jta.org/archive/navon-says-he-will-invite-begin-to-form-a-new-government (3) | "Representatives of Shinui (Change) and the Civil Rights Movement preferred Labor to Likud but were resigned …"; "Moshe Dayan's two-seat Telem party leaned toward Labor" | 2026-11-06 |

### Knock-on effects of findings 1–10 and 14 (for the fixer)

The letters are part of list ids (`10-טן`, `10-יש`, `10-יפ`, `10-נן`, `10-נכ`, `10-פז`, `10-קנ`, `10-קן`, `10-הם`).
They appear in:

- `scripts/lib/list-meta.ts` lines 241–266;
- `data/meta/k10.json` `lists[3,5,6,9,10,13,14].letters` (הם, טן, יפ, נן, נכ, פז, קן);
- `data/meta/party-links/k10.json` list keys;
- `data/meta/parties.json` `vehicle-10-*` ids;
- `data/meta/families/labour-zionist-left.json`, and the family `locator` paths.

Once corrected, the gazette order is: …, ט, טז, טי, ים, יס, כה, …, מחל, נז, ני, נס, נק, ס, סז, פש, קז, קי, רצ, ….
The dataset hashes in `party-lineage.json` and the nine family files (all currently `ea60c8a9…`, matching the current
build) will need refreshing after the rebuild.

The United Arab List letters are **ים / ימ** (yod-mem; the gazette sets the second letter in its medial form). The
current `ים` is correct. Hebrew Wikipedia's "מ" is wrong: the list sits between טי and יס in both notices.

### Flags (no class change)

- **Hebrew Wikipedia as the main basis.**
  - The party split inside the Likud (Herut 25 / Liberal 18 / La'am 5) and the Alignment (Labor 40 / Mapam 7) rests
    on labelled Hebrew WP quotes, with Knesset OData confirming faction only. I found no reachable rank 1–4 source for
    the split. It is acceptable as labelled secondary, but should stay labelled.
  - The `first-government` bloc scheme cites Hebrew WP plus OData minister rows. The minister rows cannot show
    Agudat Yisrael's membership, because it held no ministries. The rank 1 plenum record of 5 Aug 1981 settles all
    four coalition parties and should be added as the primary citation: "ההסכם הקואליציוני לכנסת העשירית בין
    הסיעות: הליכוד, המפלגה הדתית לאומית, יהדות התורה – אגודת ישראל והתנועה למסורת ישראל" (my normalisation of the
    reversed text layer). https://fs.knesset.gov.il/10/Plenum/10_ptm_529613.pdf p. 1.
- **Name forms that differ between the two notices.** These are not errors; the data follows the results notice. The
  candidate notice prints "תל"ם — תנועה להתחדשות ממלכתית" and "מחנה של"י", while the results notice prints "תלם — …"
  and "מחנה שלי". For Alignment #27, the results notice prints "אמיר יעקב ז'אק" and the data keeps the candidate form
  "אמיר ז'אק-יעקב". This is already recorded as a variant.
- **Aftermath not displayed.** It is not imported anywhere in `src/` (`grep -rl aftermath src` = 0). `notes[0]`
  ("not wired into the app") is still accurate, so the aftermath findings are not user-visible today.
- **Mid-term replacements.** The 8 mid-term replacements (Hurvitz, Solodar, Kleiner, Weinstein, Raz, Ramon, Hirschson,
  Shiloah; OData) have no candidate notes. This is consistent with the notes policy, which covers only changes before
  the first sitting, and there were none: all 120 elected names match the opening-day membership.
- **Logos.** The three logo claims (Telem, Unity Party, Likud poster dated 1981-06-17) were not re-examined in this
  pass. The claimed years are consistent with the parties' existence: Telem ran only in 1981; the Unity Party and its
  letters זה are confirmed in YP 2721 p. 2053.
- **Editorial stance.** The Lebanon War entry ("Operation Peace for Galilee against PLO terrorist bases") and the
  other term events follow the binding stance. I found no partisan wording.

## Checked and found OK

| Area | Claim(s) | Value | Source (rank) and quote |
|---|---|---|---|
| Election | date | 1981-06-30 | CBS 27.2 (1): row "30.6.1981 … 10"; ISA chapter (1) |
| Totals | registered, votes cast | 2,490,014; 1,954,609 | CBS 27.2 (1): "2,490,014 … 1,954,609 … 78.5 … 1,937,366" |
| Totals | valid, invalid | 1,937,366; 17,243 | YP 2727 (1): "סה"כ 1,937,366"; "(2) מספר הקולות שנמצאו פסולים: 17,243". Valid + invalid = cast. |
| Rules | 1% threshold, Bader-Ofer, `il-1973-bader-ofer-1` | — | Threshold 19,374 votes; ד (17,090) and below win no seats, matching YP 2727 §3 |
| Votes | all 31 lists | as in `national.reviewed.json` | YP 2727 p. 2190 (1), digit by digit; the sum, 1,937,366, equals the printed total |
| Seats | all 31 lists | מחל 48, אמת 47, ב 6, ג 4, ו 4, ני 3, ת 3, כן 2, הן 2, רצ 1, others 0 (= 120) | YP 2727 §3 p. 2191 (1) |
| Letters | 22 lists | אמת, ב, ג, ד, הן, ו, זה, ט, ים, כה, כט, כך, כן, לע, מחל, ני, נק, ס, פש, רצ, ש, ת | YP 2727 p. 2190 and YP 2721 headers (1) |
| Names | 29 list names (all except #7 and #18) | — | YP 2727 p. 2190 (1) |
| Withdrawn | 31 × `false` | — | YP 2721 publishes exactly the 31 lists that YP 2727 reports |
| Agreements | אמת–לע, ג–ד, הן–רצ; complete | — | YP 2720 p. 2027 (1): "1. המערך … "אמת" עם המפלגה הליברלית העצמאית … "לע"; 2. … "ג" עם המחנה התורתי … "ד"; 3. … "הן" עם … "רצ"", dated 21 June 1981 |
| Rosters | published counts | אמת 120, ב 104, ג 93, הן 120, ו 120, כן 115, מחל 120, ני 41, רצ 119, ת 114 | YP 2721 pp. 2048–2063 (1) |
| Elected | 119 of 120 names (all except #19) | — | YP 2727 §4(א)–(י) pp. 2191–2192 (1) |
| Elected | opening membership | all 120 elected sat from 1981-07-20; no replacement before the first sitting | `knesset-odata-members.json` (1): 120 positions with `StartDate` 1981-07-20; names match modulo spelling |
| Bios | 120 Knesset links | all resolve to the right MK | Knesset MK API (1), e.g. 692 → "מנחם בגין", 559 → "נפתלי פדר", 82 → "דוד מגן (מונסוניגו)"; 3 spelling variants only (כ"ץ-עוז, בר-זוהר, סוויסה) |
| Joint lists | Likud = Herut + Liberal + La'am; Alignment = Labor + Mapam; Hadash front = Rakah + Black Panthers (Biton) | counts 25/18/5, 40/7, 3/1 (joint-facts consistent with meta) | YP 2727 list names (1); OData factions 441/471/473 (1); split per labelled Hebrew WP (5) |
| Faction notes | Aloni joined the Alignment 1981-11-16; Lin and Peretz moved Likud → Alignment 1982-10-26 | — | OData PositionID 54 (1): "ר"ץ 1981-07-20→1981-11-16, מערך 1981-11-16→1984-05-14"; "לין אמנון: הליכוד →1982-10-26, מערך 1982-10-26→" |
| First government | gov 19, 1981-08-05; coalition מחל, ג (no ministers), ב, ני = 61; opposition 59 | — | Plenum 5 Aug 1981 (1): coalition agreement among those four factions; "61 בעד הבעת אמון בממשלה החדשה … 58 נגד"; OData minister list (no Agudah minister) |
| Recommendations | 1981-07-14; Begin backed by מחל, ב, ג, ני = 61 | — | UPI 14 July 1981 (4): "61 Knesset members spoke out in favor of his forming the government … The three religious parties backing Begin are the National Religious Party, the Tami Party and the Agudat Israel Party"; JTA 15 July (3): consultations on 13–14 July |
| Formation | consultations 13–14 July | — | ISA (1): "ב-10 ביולי זימן נבון את סיעות הבית להתייעצויות ב-13 וב-14 ביולי" |
| Formation | Begin informed the Speaker (letter of 4 Aug 1981); confidence vote 5 Aug, 61–58 | — | Plenum 5 Aug 1981 (1): "הריני מתכבד להודיעך כי הרכבתי ממשלה", letter "מיום 4 באוגוסט 1981"; "הממשלה אושרה ב-61 קולות; נגד 58" |
| Formation | Begin resigned 15 Sep 1983; Herzog tasked Shamir 21 Sep; Shamir informed 5 Oct; gov 20 approved 10 Oct, 60–53 | — | Plenum 10 Oct 1983 (1): "התפטר ביום ח' בתשרי התשמ"ד, 15 בספטמבר 1983"; "הטלתי היום את התפקיד … על חבר הכנסת יצחק שמיר" (letter of 21 Sep 1983); "60 – בעד … 53 – נגד" |
| PM tenure | Begin, gov 19, 1981-08-05 → 1983-10-10; no acting PM in between | — | OData `KNS_PersonToPosition` (1): PersonID 2179, PositionID 45, GovernmentNum 19, 1981-08-05 → 1983-10-10; Shamir (2652), gov 20, from 1983-10-10 |
| End of term | dissolution law 1984-04-04; next election 1984-07-23 | — | OData `KNS_PlmSessionItem` (1): bill 169419 at plenum session 305 on 1984-04-04 (statuses 111/114/117); `KNS_Bill` published in ספר החוקים 1116 p. 132 on 1984-04-12; IPU 1984 (2): "dissolution law on 4 April 1984" |
| Term events | Sinai withdrawal completed 1982; Lebanon War June 1982; bank-share collapse Oct 1983 | — | Cited Knesset history, MFA and IDI quotes match their sources' substance |
| Hashes | `party-lineage.json` `sources.k10.sha256` and the 9 family files' `datasetSha256` | `ea60c8a9…` | `sha256sum public/data/k10.json` = `ea60c8a9519f147b6ba123b7ae14b0693da535453e2b849d67dc3fb6fe38eb4d` |
| Lineage | `partners-10-מחל/אמת/ו` edges | — | Consistent with the joint lists above |
| Party links | IDI platform links (Ratz, Hadash, Shinui, Tehiya, 1981) and CEC results-notice links | the URL is the actual YP 2727 scan | gov.il blob = YP 2727 (1) |
