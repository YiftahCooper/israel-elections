# Data audit: k24 (23 March 2021, 24th Knesset): Opus auditor

Auditor: Claude Opus 5.5, independent of the Codex auditor. Method and classes: [BRIEF.md](BRIEF.md); ranks:
[source-hierarchy.md](../source-hierarchy.md). Accessed dates are all **2026-11-06** unless stated. Base revision `53cca36`.
No data was edited.

## Summary

| Class | Count |
|---|---|
| OK | 57 check rows (the table at the end; several rows cover many values, e.g. all 39 lists' votes) |
| WRONG | 2 |
| UNSUPPORTED | 3 |
| UNVERIFIABLE | 1 |
| DISPUTED | 0 |

Also listed below, but not counted as classes: 4 omissions (true facts the app does not show), 3 source upgrades, and
2 wording flags for the owner.

**Most serious:** the app shows **"דמוקרטית – חירות, שיוויון וערבות הדדית" (רק)** as a list that ran and got 0 votes
(`withdrawn: false`). The CEC cancelled it before polling day because all of its candidates resigned. The official
results notice (Yalkut HaPirsumim 9511) lists **38** lists, not 39. Every other result number matches the official
results to the vote.

### New rank-1 sources found in this audit (not yet in `data/raw/SOURCES.json`)

| Id (suggested) | Document | URL | Notes |
|---|---|---|---|
| `k24-results-gazette` | **Yalkut HaPirsumim 9511, 31 Mar 2021, pp. 4620–4629: "הודעה בדבר תוצאות הבחירות לכנסת ה–24"**. Gives votes, seats, sponsoring parties and the **names of the 120 members elected** | https://olaw.org.il/yalkut/yalkut-9511.pdf (olaw mirror of Reshumot; same pattern as the retained 9478) | 257,990 bytes, sha256 `a961842ae86030a591274516acebc96030743d4e84e7989719e5715b23873a50` |
| `k24-cec-protocol` | **CEC protocol (זכרון דברים), 30 Mar 2021**: the committee's statutory determination of the results | https://www.emess.co.il/wp-content/uploads/2021/03/%D7%96%D7%9B%D7%A8%D7%95%D7%9F-%D7%93%D7%91%D7%A8%D7%99%D7%9D-24.pdf (non-government host of the CEC document) | 63,005 bytes, sha256 `014168de56d61251c086a4025631255fd4e1ca42d88f128b98c14219d0954d1c` |

## Non-OK findings

| # | File | JSON path | Current value | Correct value | Class | Source URL | Rank | Quote (verbatim) | Accessed |
|---|---|---|---|---|---|---|---|---|---|
| W1 | `public/data/k24.json` (generated). The input is the withdrawn rule in `scripts/lib/historical/k22-k24-common.ts:211` (`withdrawn:n===23&&list.letters==='זץ'`). Also `data/meta/k24.json` `lists[letters=רק]` and `data/meta/parties.json` `vehicle-24-רק` | `lists[id=24-רק].withdrawn` (and `.votes`) | `withdrawn: false`, `votes: 0`; shown as one of 39 contesting lists | `withdrawn: true`. The list was **cancelled after the gazette was published, because all its candidates resigned**, so it did not contest; **38** lists contested. Keep the list in the roster as withdrawn, the way k23 `זץ` is handled. | WRONG | (a) CEC protocol, 30 Mar 2021 (URL above); (b) Yalkut HaPirsumim 9511 (URL above); (c) State Comptroller, election-finance report on the 24th Knesset, https://library.mevaker.gov.il/sites/DigitalLibrary/Documents/2022/2022-Mimun-24-Shotef.pdf ; (d) Zman Yisrael live log, 19 Mar 2021, https://www.zman.co.il/live/206586/ ; (e) Maariv, 10 Mar 2021, https://www.maariv.co.il/elections-2021/article-826964 | (a)(b)(c) 1; (d)(e) 4 | (a) "במועד שנקבע לכך בחוק הוגשו ואושרו 39 רשימות מועמדים … לאחר הפרסום ברשומות בוטלה רשימת "דמוקרטית - חירות, שוויון וערבות הדדית", בשל התפטרות כל המועמדים מטעמה." (b) The results table (pp. 4620–4628) lists 38 lists and has no `רק` row. (c) "רשימה נוספת - "דמוקרטית - חירות, שוויון וערבות הדדית" - הוגשה לוועדת הבחירות המרכזית אך לא התמודדה לבסוף בבחירות." and "בבחירות לכנסת העשרים וארבע התמודדו 38 רשימות". (d) "הושלמה פרישת הרשימה "דמוקרטית" מהבחירות לכנסת. כל חברי הרשימה התפטרו בפני יושב ראש ועדת הבחירות המרכזית … כעת נותרו 38 רשימות" | 2026-11-06 |
| W2 | `data/meta/election-context.json` | `events[id=opening-members-k24].textEn` / `.textHe` | "No retained CEC notice names the elected members for this election … The records do not establish the exact replacement date." | An official notice names the elected members: Yalkut 9511 §4, which lists **Alon Davidi as elected (Yamina #3)**; the CEC protocol of 30 Mar 2021 does the same. Davidi announced on **5 Apr 2021** that he would not take the seat and would stay mayor of Sderot; Idit Silman (#8) was sworn in on 6 Apr. Suggested text: "Declared elected at #3 (results notice, 31 Mar 2021); announced on 5 Apr 2021 he would not take the seat; Idit Silman (#8) sat from the opening on 6 Apr." Retain 9511 as a source. | WRONG (stale gap statement) | Yalkut 9511 (URL above); Haaretz 5 Apr 2021 https://www.haaretz.co.il/news/elections/2021-04-05/ty-article/0000017f-e9ed-df2c-a1ff-fffd9d940000 ; Davar 5 Apr 2021 https://www.davar1.co.il/294946/ ; Arutz 7 5 Apr 2021 https://www.inn.co.il/news/472819 | 1; 4; 4; 4 | 9511: "(ב) מרשימת ב – ימינה בראשות נפתלי בנט: 1 נפתלי בנט 2 אילת שקד 3 אלון דוידי 4 מתן כהנא 5 עמיחי שיקלי 6 ניר אורבך 7 אביר (אברהם) קארה". Haaretz: "ראש העיר שדרות אלון דוידי, הממוקם במקום השלישי ברשימת ימינה, הודיע היום (שני) … כי לא יצטרף לכנסת ה-24 שתושבע מחר … במקומו תושבע מחר בכנסת עידית סילמן שניצבת במקום השמיני ברשימה." Davar: "ראש עיריית שדרות, אלון דוידי, מתפטר מרשימת ימינה ולא יצהיר אמונים לכנסת מחר (שלישי)." | 2026-11-06 |
| U1 | `data/meta/k24.json` | `blocSchemes[id=knesset-blocs-2021]` (all blocs, seats 52/51/11/6, notes) | Sole source: Hebrew Wikipedia | Arithmetic is right (17+8+7+7+6+6 = 51). But the **grouping into blocs** (pro-Netanyahu 52, anti-Netanyahu "led by Lapid" 51, Yamina + Ra'am 11) rests **only on Hebrew Wikipedia**, while rank-4 reporting is reachable. N12 and Ynet (6 Apr 2021) describe the 52 and the Lapid camp but do not define a 51-seat bloc including New Hope. Either cite a rank 1–4 source that defines these blocs or label the scheme as the app's own grouping. | UNSUPPORTED (Hebrew WP sole basis) | https://he.wikipedia.org/wiki/ממשלת_ישראל_השלושים_ושש (as cited) | 5 | (as quoted in the file) | 2026-11-06 |
| U2 | `data/meta/logos/k24.json` | `logos[letters=ת]` (`logos/new-hope-2021.png`) `.status` | `"verified"` (confidence medium) | The record's own evidence says "Commons dates this community reconstruction to 1 March 2021 … official-source derivation is not supplied". That does not show the party used this mark. Downgrade the status (e.g. unverified or community reconstruction) until a campaign-period official asset is found. I did not re-research images, per the brief. | UNSUPPORTED | https://commons.wikimedia.org/wiki/File:New_Hope_party_logo.png | – | inUseEvidence: "Commons dates this community reconstruction to 1 March 2021, during the campaign before the 23 March election; official-source derivation is not supplied." | 2026-11-06 |
| U3 | `data/meta/k24.json` | `colours[*]` (all 13 seat-winning lists) | Every colour comes from a Hebrew Wikipedia infobox (`kind: secondary`) | These are presentation choices and are labelled "Not an official party specification", so they are not misinformation. But Hebrew WP is the sole basis while the party's own campaign marks are retained in the repo (`logos/k24/*`: Likud, Labor, Yisrael Beiteinu, Yesh Atid, Religious Zionism, Hadash). Policy flag only; colours were not re-derived. | UNSUPPORTED (Hebrew WP sole basis) | e.g. https://he.wikipedia.org/wiki/הליכוד | 5 | "צבע כותרת = 1f5aa5 …" | 2026-11-06 |
| V1 | `public/data/k24.json` / `data/meta/bios/k24.json` | `lists[*].candidates[*].bio.knesset` (the `mk-personal-details/<siteId>` numbers) | e.g. Netanyahu → `/90` | Not checked. `main.knesset.gov.il` answered scripted `curl` with HTTP 247 and a 541-byte body, which I treated as a refusal and did not retry. The OData `knessetPersonId` values **were** checked: see OK row 32. | UNVERIFIABLE | https://main.knesset.gov.il/mk/apps/mk/mk-personal-details/90 | 1 | n/a | 2026-11-06 |

### Omissions (true facts the app does not show; not counted as classes)

| # | File / path | Missing fact | Source | Rank | Quote |
|---|---|---|---|---|---|
| O1 | `data/meta/candidate-notes.json` (no entries); rosters `24-צכ#15`, `24-זץ#2`, `24-ת#48` | Three candidates resigned before polling day but still appear without a note: **Sizar Abu Salem** (`צכ` #15, resigned 3 Mar 2021), **Yair Shmuel Fargon** (`זץ` #2, 10 Mar 2021), **Shlomo Barak** (`ת` #48, 10 Mar 2021). The retained `k24/surplus.pdf` already contains this notice. The status note ("before subsequent resignations") covers this generally, so it is not a false claim. | Yalkut HaPirsumim 9478, 15 Mar 2021, p. 4284 (retained `data/raw/k24/surplus.pdf`, https://olaw.org.il/yalkut/yalkut-9478.pdf) | 1 | "(1) סיזאר אבו סאלם מרשימת "מען (יחד) לעידן חדש" התפטר מרשימת המועמדים ביום י"ט באדר התשפ"א (3 במרס 2021); (2) יאיר שמואל פרג'ון מרשימת "צומת - עצמאים, חקלאים, כפרים" התפטר … (10 במרס 2021); (3) שלמה ברק מרשימת "תקווה חדשה בהנהגת גדעון סער לראשות הממשלה" התפטר … (10 במרס 2021)" |
| O2 | `data/meta/aftermath/k24.json` `recommendationRounds[1].notes[1]` (gap: "The one Joint List MK who did not recommend Lapid is not named") | That MK was the **Balad** member, **Sami Abu Shehadeh**. Hadash and Ta'al backed the recommendation; Balad opposed it. | Globes live, 5 May 2021, https://www.globes.co.il/news/article.aspx?did=1001369956 ; Ynetnews, 5 May 2021, https://www.ynetnews.com/article/rki8LGlOd | 4; 4 | Globes, quoting the Joint List's letter: "יצוין, כי חד"ש ותע"ל תמכו בהחלטה זו ואילו בל"ד התנגדה על כל המשתמע מכך". Ynetnews: "MK Sami Abu Shehadeh, the head the Balad sub-faction, is not expected to recommend anyone." (the Ynetnews piece is anticipatory; Globes reports the letter itself) |
| O3 | `data/meta/aftermath/k24.json` `recommendationRounds[0].notes[0]` / `gaps[0]` (the President's statement was "not retrieved") | Arutz 7 carries the President's 6 Apr 2021 statement verbatim in Hebrew, including the per-camp totals | https://www.inn.co.il/news/472940 | 4 (quoting rank 1) | "52 ממליצים ביקשו ממני להטיל את התפקיד על חבר הכנסת בנימין נתניהו. 45 ממליצים ביקשו ממני להטיל את התפקיד על חבר הכנסת יאיר לפיד. שבעה ממליצים ביקשו ממני להטיל את התפקיד על חבר הכנסת נפתלי בנט. 16 חברי כנסת לא המליצו בפני על איש" |
| O4 | `data/meta/aftermath/k24.json` `gaps[1]` ("CEC certification date of the final results … not retrieved") | The CEC fixed the results on **30 Mar 2021** (protocol) and published the notice on **31 Mar 2021** (Yalkut 9511) | CEC protocol; Yalkut 9511 (URLs above) | 1 | Protocol: "בתום יום י"ז בניסן התשפ"א (30 במרץ 2021) … התכנסה ועדת הבחירות המרכזית לכנסת העשרים וארבע, לקבוע … את תוצאות הבחירות"; 9511 header: "י"ח בניסן התשפ"א 9511 31 במרס 2021" |

### Source upgrades (the value is right, but a better source is reachable)

| # | File / path | Current source | Better source | Quote |
|---|---|---|---|---|
| S1 | `data/meta/election-context.json` `events[id=eligibility-final-k24-17]` (Mara'ana) | IDI article (secondary) | The retained candidate gazette itself, Yalkut 9476, p. 4248 (rank 1) | "ובהתאם להחלטת בית המשפט העליון בא"ב 1156/21 עוצמה יהודית - חזית יהודית לאומית, רשימת הציונות הדתית נ' אבתיסאם מרעאנה ואח' (28.02.2021)". Wording note: the case is an election-approval proceeding (א"ב), in which the Court declined to approve the CEC disqualification. "Reversed" is acceptable shorthand but slightly imprecise. |
| S2 | `public/data/k24.json` elected members; `data/meta/candidate-notes.json` `24-ב#3` | Knesset OData opening membership | Add Yalkut 9511 §4 (rank 1, statutory list of the elected) next to OData | see W2 |
| S3 | `data/meta/k24.json` `blocSchemes[id=pm-recommendations]` | Times of Israel + Hebrew WP | N12 / Ynet / Arutz 7 (6 Apr 2021) carry the same per-party split and the President's verbatim totals (see O3); the Hebrew WP citation can be dropped | N12: "נתניהו זכה לתמיכת הליכוד, ש"ס, יהדות התורה והציונות הדתית … יאיר לפיד, קיבל את המלצותיהם של חברי יש עתיד, כחול לבן, העבודה, מרצ וישראל ביתנו - 45 ממליצים … תקווה חדשה … בחרה שלא להמליץ על אף מועמד, וכך עשו גם הרשימה המשותפת ורע"ם." |

### Wording flags (owner decisions, not errors)

- `data/meta/families/radical-right.json` puts Religious Zionism (`24-ט`) under "Radical right — broad contested
  interpretation". The file already labels the family as contested. The owner should confirm that this label meets
  the "not partisan within Israeli politics" rule.
- `public/data/elections.json` k24 `status.noteEn` says "No default blocs assigned", but `public/data/k24.json` has
  `defaultBlocScheme: "first-government"`. This is app text, not an election fact. Check which is meant.

No English Wikipedia was found in any k24 file checked (`grep` over `data/meta/{k24,aftermath/k24,bios/k24,party-links/k24,logos/k24}.json`, `public/data/k24.json`, `election-context.json`, `candidate-notes.json`). No partisan or
loaded wording was found in the aftermath text.

## Checked and found OK

Rank-1 sources used throughout:
- **CEC-live**: the live CEC results page https://votes24.bechirot.gov.il/nationalresults, fetched with the project UA.
- **9511**: Yalkut HaPirsumim 9511.
- **Protocol**: the CEC protocol of 30 Mar 2021.
- **9476**: the retained candidate gazette `data/raw/k24/candidates.pdf`.
- **9478**: the retained surplus-agreement notice `data/raw/k24/surplus.pdf`.
- **OData**: Knesset OData `KNS_PersonToPosition` / `KNS_Person`, queried live and paged with `$skip`.

| # | Claim (file / path) | Value | Source(s), rank |
|---|---|---|---|
| 1 | Election date `electionDate` | 2021-03-23 | CEC-live ("י' בניסן התשפ"א, 23 במרץ 2021"); Protocol. 1 |
| 2 | Knesset number | 24 | 9511. 1 |
| 3 | `totals.registered` | 6,578,084 | CEC-live; Protocol ("מספר בעלי הזכות לבחור 6,578,084"). 1 |
| 4 | `totals.votesCast` | 4,436,365 | CEC-live; Protocol. 1 |
| 5 | `totals.invalid` | 26,313 | CEC-live; Protocol; 9511 §2. 1 |
| 6 | `totals.valid` | 4,410,052 (= sum of all list votes; = cast − invalid) | CEC-live; 9511. 1 |
| 7 | Turnout (derived) | 67.44% | CEC-live "67.44%". 1 |
| 8 | `totals.localities`, `totals.envelopeVotes` | 1,214; 425,512 | Live data.gov resource `9921a347…`: 1,215 rows including "מעטפות חיצוניות" (9999) with 425,512 voters; sums give בזב 6,578,084 and voters 4,436,365. 1 |
| 9 | `totals.ballotBoxes` | 12,926 | Live data.gov resource `419be3b0…` `total: 12926`. 1 |
| 10–22 | 13 seat-winning lists: letters, Hebrew list name, votes, seats (`lists[0..12]`, `officialSeats`) | Likud 1,066,892/30; Yesh Atid 614,112/17; Shas 316,008/9; Blue and White 292,257/8; Yamina 273,836/7; Labor 268,767/7; UTJ 248,391/7; Yisrael Beiteinu 248,370/7; Religious Zionism 225,641/6; Joint List 212,583/6; New Hope 209,161/6; Meretz 202,218/6; Ra'am 167,064/4 | CEC-live; Protocol §ד; 9511 §1, §3. 1 (each matched exactly) |
| 23 | 25 lists without seats (letters, names, votes) | e.g. New Economic 34,883; Rapeh 17,346 … Kvod HaAdam 196 | CEC-live; Protocol. 1. Exception: `רק`, see W1. Name note: `קץ` is "משפט צדק בראשות ד"ר לריסה עמיר טרימבובלר" in the app, matching 9476 and 9511. The CEC website shows "משפט צדק, לרפורמה במערכת המשפט", but the statutory notice outranks it. |
| 24 | Rule set `il-2014-bader-ofer-3.25`; first-round seats in `src/app/glossary-data.ts:264` | 3.25%; 112 seats in the first round | Independent recomputation: threshold 143,326.69 → 13 lists; qualifying votes 4,345,300; quota 36,210; 112 whole-quota seats; Bader–Ofer with the 6 agreements reproduces all 13 official seat counts. Checked against 9511. 1 |
| 25 | `agreements` (6) | New Hope–Yamina; Yisrael Beiteinu–Yesh Atid; Likud–RZ; New Economic–Blue and White; Labor–Meretz; Shas–UTJ | 9478 p. 4284 (retained); Protocol §ב. 1 |
| 26 | Rosters: length and list name, all 38 lists with candidates | e.g. Likud 120, Blue and White 55, Yamina 38, Labor 71, YB 23, RZ 21, New Hope 62, Ra'am 116 … | Parsed 9476 block by block: every count and every list name matches. 1 |
| 27 | Joint-list constituents and candidate affiliations (`data/meta/k24.json lists[*].parties`): Likud (Likud + Atid Ehad #28), UTJ (Degel odd ranks / Agudah even ranks), Joint List (Hadash/Ta'al/Balad), RZ (Tkuma; Otzma 3, 10, 17; Noam/Lazuz 6, 11, 15), New Hope (New Hope; Derech Eretz 4, 8) | as stored | 9476, per-candidate "השתייכות מפלגתית" column, e.g. "28 אופיר סופר עתיד אחד", "4 יועז הנדל דרך ארץ", "3 איתמר בן גביר חזית", "6 אביגדור מעוז לזוז". 1 |
| 28 | `data/meta/joint-facts.json` elected per constituent | Likud 29 + Atid Ehad 1; Degel 4 + Agudah 3; Hadash 3, Ta'al 2, Balad 1; Tkuma 4, Otzma 1, Noam 1; New Hope 5, Derech Eretz 1 | Derived from 9476 ranks × 9511 seats; agrees with IDI, Kenig & Rahat, *המפלגות בישראל 1992–2021*, table 1.2 (2021 column: Likud 29, Atid Ehad 1, Agudah 3, Degel 4, Tkuma 4, Otzma 1, Lazuz 1, New Hope 5, Derech Eretz 1). 1/3 |
| 29 | `sponsorsHe` (sponsoring parties) | e.g. Yamina "צל"ש - ציונות ליברליות ושיוויון"; Ra'am "רשימת האיחוד הערבי" | 9476 and 9511 "מטעם מפלגות" column. 1. That צל"ש is the New Right's shelf party (supports family `partyIds: ["new-right"]`): IDI Kenig & Rahat https://www.idi.org.il/media/20997/המפלגות-בישראל-2021-1992.pdf, "צל״ש (ציונות ליברליות ושוויון שהיא ״מפלגת מדף״ שבה עשתה שימוש מפלגת הימין החדש, אשר מיתגה עצמה מחדש כ"ימינה")". 3 |
| 30 | Who was elected: 120 names (ranks ≤ seats, with Silman for Davidi) | as shown | 9511 §4 (with Davidi at #3) and OData: exactly 120 rows with StartDate 2021-04-06, matched name by name (spelling variants only: מירי/מרים רגב, קטי/קטרין שטרית, מאי/פלורה מאי גולן, מרב/מירב מיכאלי, אורי מקלב, עידן/עדן רול, חילי/יחיאל טרופר). 1 |
| 31 | Candidate note `24-ב#3` (Davidi did not take the seat; Silman from the first sitting) | as stored | OData: Silman PersonID 30718, StartDate 2021-04-06; Haaretz and Davar 5 Apr 2021 (see W2). 1/4 |
| 32 | `data/meta/bios/k24.json` `knessetPersonId` (176 entries; 169 with an id) | as stored | OData `KNS_Person`: every id resolves to the same person. Two flagged as surname mismatches were spelling variants (שיטרית/שטרית; בדרה גולן/גולן). 7 entries have no id (non-MKs; Hebrew WP links only). 1 |
| 33 | `pm-recommendations` scheme and aftermath round r1: per-list recommendations | Likud, Shas, UTJ, RZ → Netanyahu; YA, B&W, YB, Labor, Meretz → Lapid; Yamina → Bennett; New Hope, Joint List, Ra'am → none | N12, 6 Apr 2021 https://www.mako.co.il/news-israel-elections/2021/Article-f68d50bee46a871026.htm ; Ynet, 6 Apr 2021 https://www.ynet.co.il/news/article/BJAucUYrd. 4 (two outlets) |
| 34 | r1 totals | 52 / 45 / 7 / 16 | President's statement as carried verbatim by Arutz 7 (see O3); Globes https://www.globes.co.il/news/article.aspx?did=1001366388. 4 (quoting 1) |
| 35 | r1 date | 2021-04-05 (consultations); task given 6 Apr | Ynet: "אתמול פקד את בית הנשיא מצעד הממליצים" (published 6 Apr). 4 |
| 36 | Mandate to Netanyahu, 6 Apr, 28 days | as stored | Haaretz 6 Apr 2021: "לרשות נתניהו יעמדו 28 ימים להקמת ממשלה"; Globes. 4 |
| 37 | Netanyahu's mandate ended, 4 May (at midnight) | as stored | Ynet 5 May 2021 https://www.ynet.co.il/news/article/ByPTlVguO: "החזיר את המנדט דקות ספורות לפני חצות"; ToI full text: "Yesterday, Prime Minister … informed me that he had been unable to form a government". 4 |
| 38 | r2 (5 May): Lapid 56 (incl. New Hope and 5 of 6 Joint List), Bennett 7, 52 asked to return the task to the Knesset, Ra'am no nominee | as stored | Israel Hayom 5 May 2021 https://www.israelhayom.co.il/news/politics/article/564068: "56 המליצו על לפיד, שבעה על בנט ו-52 חברי גוש הימין קראו להשיב את המנדט לכנסת"; Ynet 5 May. 4 |
| 39 | Mandate to Lapid, 5 May | as stored | Israel Hayom; ToI full text. 4 |
| 40 | Lapid informed the President, 2 June | as stored | Ynet 2 Jun 2021 https://www.ynet.co.il/news/article/S1CJdxH900: "35 דקות לפני המועד האחרון, הודיע אמש (יום ד') יו"ר יש עתיד, יאיר לפיד, לנשיא המדינה … כי הצליח להרכיב ממשלה" (published 23:25, 02.06.21); News1: "(יום ד', 2.6.21) זמן קצר לפני חצות הלילה". 4 |
| 41 | Confidence vote, 13 June 2021: 60–59, 1 abstention; 36th government | as stored | Knesset News https://main.knesset.gov.il/EN/News/PressReleases/Pages/press14621d.aspx (via Exa fetch): "By a vote of 60 to 59, with one abstention, the Knesset Plenum Sunday night confirmed the 36th Government of Israel headed by Prime Minister MK Naftali Bennett". 1 |
| 42 | Government 36: PMs and dates (Bennett 13 Jun 2021 – 30 Jun 2022; Lapid 1 Jul – 29 Dec 2022) | as stored | OData `KNS_PersonToPosition` GovernmentNum 36, PositionID 45: PersonID 23511 2021-06-13→2022-07-01; PersonID 23594 2022-07-01→2022-11-15 and 2022-11-15→2022-12-29. 1 |
| 43 | Coalition (8 lists, 62) / opposition (58) | YA, B&W, Yamina, Labor, YB, New Hope, Meretz, Ra'am; Likud, Shas, UTJ, RZ, Joint List | Arutz 7 2 Jun 2021 (cited); seat arithmetic against 9511. 4/1 |
| 44 | Chikli voted against; al-Harumi abstained | as stored | N12 13 Jun 2021 https://www.mako.co.il/news-politics/2021_q2/Article-61ff3bc2da60a71027.htm: "ח"כ עמיחי שיקלי מימינה הצביע נגד, וח"כ סעיד אלחרומי מרע"ם החליט ברגע האחרון להימנע"; Ynet https://www.ynet.co.il/news/article/S1FY9jmj00: "סעיד אלחרומי מרע"מ … נמנע". 4 (two outlets) |
| 45 | Ra'am in the coalition without ministers | as stored | OData GovernmentNum 36 (no Ra'am office holders). 1 |
| 46 | Knesset sworn in, 6 Apr 2021 | as stored | OData StartDate 2021-04-06 for all 120 opening members. 1 |
| 47 | 2021 budget, 4 Nov 2021, 61–59 | as stored | Reshumot SH 2933 (downloaded): "התקבל בכנסת ביום כ"ט בחשוון התשפ"ב (4 בנובמבר 2021)". This is the Economic Plan law, as the file's own note says. 61–59 per Ynetnews (cited). 1/4 |
| 48 | Coalition lost its majority (Silman), 6 Apr 2022 | as stored | Ynet 6 Apr 2022 https://www.ynet.co.il/news/article/bj9t6tcxc: "ח"כ עידית סילמן (ימינה) הודיעה הבוקר (רביעי) על החלטתה לפרוש מהקואליציה … מה שגורם לכך שהממשלה מאבדת את הרוב שלה בכנסת"; Israel Hayom 6 Apr 2022 https://www.israelhayom.co.il/news/politics/article/9767689; Walla. 4 (plus the cited rank-3 chronologies) |
| 49 | Dissolution, 30 Jun 2022, 92–0; election 1 Nov 2022 | as stored | Knesset News https://main.knesset.gov.il/News/PressReleases/Pages/press30062022D.aspx (via Exa fetch): "בקריאה השלישית תמכו 92 חברי כנסת ללא מתנגדים … הבחירות לכנסת העשרים וחמש תיערכנה ביום ז' בחשוון התשפ"ג, 1 בנובמבר 2022". 1 |
| 50 | Lebanon maritime agreement, 27 Oct 2022 | as stored | Calcalist 27 Oct 2022 https://www.calcalist.co.il/local_news/article/by0uwtwes: "ראש הממשלה יאיר לפיד ונשיא לבנון מישל עאון חתמו היום, בנפרד, על הסכם הגבול הימי"; Ynet 27 Oct 2022 https://www.ynet.co.il/news/article/hy8wjjovi. 4 (cited PMO page, rank 1, not re-opened) |
| 51 | IDI issue poll (May 2021): eight answer shares; fieldwork 30–31 May; 615 Hebrew + 150 Arabic interviews | 28.9 / 27.7 / 10.4 / 8.2 / 8.0 / 5.2 / 6.5 / 5.2 | IDI PDF https://en.idi.org.il/media/16382/israeli_voice_index_data_2105_eng-first.pdf (downloaded): "27.7 … Closing the socioeconomic gaps … 28.9 … Strengthening the unity of the people"; "on May 30-31, 2021, 615 men and women were interviewed in Hebrew and 150 in Arabic". 3 |
| 52 | Context `sequence-k24`: one of five Knesset elections in 2019–2022 | as stored | Knesset News 30 Jun 2022: "עקב קיום חמש מערכות בחירות לכנסת בפרק זמן של פחות מארבע שנים". 1 |
| 53 | Context `eligibility-final-k24-17`: Mara'ana allowed to run | as stored | 9476 p. 4248 (see S1); 9511 lists her as elected (Labor #7). 1 |
| 54 | Families: list identities and votes for k24 members (arab-arab-jewish, centre, haredi, labour-zionist-left, national-religious, radical-right, religious-parties, russian-speaking-immigrant, herut-likud) | votes as stored | Votes match CEC-live. Classifications are editorial and were not judged, apart from the wording flag above. 1 |
| 55 | Logos: 11 of the 12 `logos/k24.json` entries (Yesh Atid, Likud ×2, Labor, Yisrael Beiteinu, Hadash, RZ list, Tkuma, Blue and White, Ra'am, Otzma) | status as stored | The recorded evidence supports the claim: archived official headers with CDX digests, or Commons pages that name the 2021 variant. I did not re-research images. Exception: New Hope (U2). – |
| 56 | No English Wikipedia in k24 data | – | grep, see above |
| 57 | `data/meta/parties.json` k24 name entries for the 39 vehicles and constituents | as stored | 9476 / 9511 names. 1. Exception: `vehicle-24-רק` should carry the withdrawal (W1). |

## What was not done

- No JPress (NLI challenge). No President's Residence page fetched directly: the gov.il archive was not tried after
  `main.knesset.gov.il` returned 247 to scripted requests. The President's words were checked through verbatim press
  copies.
- Party links (`data/meta/party-links/k24.json`, 41 links: 26 CEC, 13 Hebrew WP, 2 platforms hosted by IDI) were
  checked only for kind and source type, not opened one by one.
- Hebrew WP links in bios were not opened.
