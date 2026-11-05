# Recommendations to the President, 2009–2026

Research pass of 5 November 2026. It covers the `pm-recommendations` bloc scheme in `data/meta/k18.json` … `k26.json`:
who each Knesset faction recommended to the President for forming the government, the later rounds, and what is still
unverified. The bloc scheme always records the **first round of consultations** after the election. Later rounds are
listed here only.

1996, 1999 and 2001 had direct elections for prime minister, so the President held no recommendation round for the
premiership then (see [era-specific-rules.md](era-specific-rules.md)). Elections before 2009 have no scheme yet.

## Source rules and evidence levels

- No English Wikipedia. Hebrew Wikipedia appears only as a labelled `secondary` source next to a stronger one.
- The President's Residence publishes on gov.il. Its pages returned **HTTP 403** to the project client (5 November 2026),
  so no official page was read. This is a retrieval limit, not evidence that no statement exists. No block was bypassed.
  Statements by the President or his office are cited **as quoted** by news reports.
- Every quote below was read in the article body on 5 November 2026, unless marked:
  - **[S]**: known only from a search-engine summary or headline. The body was not read, so treat the fact as unverified.
  - **[R]**: the project's existing record (`governmentNote`, `first-government` scheme). Not re-checked in this pass.
- Seats are the official seats in `public/data/kNN.json`. For k26 they are the app's calculation from the CEC count of
  4 November 2026. The gazetted seat allocation is **not yet verified** (see
  [k26-official-status-2026-11-05.md](k26-official-status-2026-11-05.md)).

## Summary of changes made in this pass

| Election | Change | Evidence |
|---|---|---|
| 2026 (k26) | New scheme. It is partial: 11 of 12 factions were confirmed, and Likud is `pending`. | JPost, JNS (President's Residence statements), Maariv, Haaretz |
| 2009 (k18) | 14 "not stated" seats resolved: Labor, Meretz, Hadash, Ra'am–Ta'al and Balad made **no recommendation** (27). Date 20 → **19 Feb 2009**, the last consultation day. | JPost 19 Feb 2009, JTA |
| 2013 (k19) | **Kadima (2) recommended Netanyahu**: 80 → **82**. Balad (3) is now in "no recommendation", with a note. | Walla, Behadrei Haredim |
| 2015 (k20) | The Joint List and Yesh Atid are now quoted as making no recommendation. The bloc label no longer says "not stated". | Ynetnews, JPost |
| Sept 2019 (k22) | A JPost article body replaces the headline-only citation. No data change. | JPost 24 Sep 2019 |
| 2021 (k24) | The ToI article body replaces the headline-only citation. No data change. | ToI 5 Apr 2021 |
| 2022 (k25) | Added the President's own statement of the totals and a JPost report. No data change. | JNS, JPost |
| Apr 2019 (k21), 2020 (k23) | Checked. No change. The sources already quote the article bodies. | ToI, JNS |

## 2026 — 26th Knesset (consultations 4–5 November 2026)

**Status: partial.** The second and last day was still under way when last checked (about 20:10 Israel time,
5 November 2026). No mandate had been given. Maariv published the schedule: Yashar at 19:15 and Likud at 20:30, which
ends the planned round. Yashar's recommendation was confirmed by then. Likud's is **not recorded**, because nothing
confirmed it before the check.
The President "does not rule out another round of consultations if needed" (Maariv). The new Knesset is due to be
sworn in on 10 November 2026.

| Faction (list) | Seats* | Recommended | Date | Source |
|---|---:|---|---|---|
| Religious Zionism (ט, with Zehut) | 6 (list) | Netanyahu | 4 Nov | JPost 913842 |
| Shas (שס) | 6 | Netanyahu | 4 Nov | JPost 913842; C14 |
| Yisrael Beiteinu (ל) | 7 | Eisenkot | 4 Nov | JPost 913842; C14 |
| Zehut (ט, with Religious Zionism) | (list) | Netanyahu | 4 Nov | JPost 913842; C14 |
| United Torah Judaism (ג) | 7 | No one | 5 Nov | JNS; Maariv |
| Otzma Yehudit (ב) | 7 | Netanyahu | 5 Nov | JNS (President's Residence) |
| The Democrats (אמת) | 8 | Eisenkot | 5 Nov | JNS; Maariv |
| Ra'am (עם) | 8 | Eisenkot | 5 Nov | JNS (President's Residence); Haaretz |
| Joint List (ודם) | 11 | Eisenkot | 5 Nov | Haaretz; Maariv; Arutz 7 |
| B'Yachad (רק) | 12 | Eisenkot | 5 Nov | Haaretz; Maariv; i24NEWS |
| Yashar (דרך) | 21 | Eisenkot | 5 Nov | Maariv (later update); JPost 913989 (see conflict) |
| Likud (מחל) | 27 | **pending** | 5 Nov 20:30 (scheduled) | Maariv schedule |

*The seats are those Maariv reported on 5 November: "ישר! … 21 מנדטים, ביחד … 12, הדמוקרטים … שמונה וישראל ביתנו …
שבעה", and "27 מהליכוד, שבעה מעוצמה יהודית, שישה מש"ס ושישה מרשימת הציונות הדתית-זהות". These match the app's
calculated seats.

Confirmed totals in the scheme: Eisenkot **67**, Netanyahu **19**, no recommendation **7**, pending **27** (Likud)
(120). Reporters projected 46 for Netanyahu, assuming Likud backs its own leader. That projection is **not** recorded
as fact.

Quotes:
- JPost, 4 Nov 2026 (https://www.jpost.com/israel-news/article-913842): "The Religious Zionist Party, Shas, and Zehut
  all recommended Netanyahu. Meanwhile, Yisrael Beytenu, led by Avigdor Liberman, recommended chairman of the Yashar
  party Gadi Eisenkot as the candidate to form the next government."
- JNS, 5 Nov 2026 (https://www.jns.org/news/israel-news/herzog-resumes-talks-on-who-will-form-next-israeli-govt): "The
  United Arab List (Ra'am) recommended that Herzog task Yashar Party leader Gadi Eisenkot with forming a government, the
  President's Residence said. … Otzma Yehudit faction recommended that Herzog task Netanyahu with forming a new
  government, the President's Residence said. … United Torah Judaism told Herzog that it would not recommend any Knesset
  member to form the next government."
- Haaretz live, 5 Nov 2026: "The Together party, led by Naftali Bennett and Yair Lapid, recommended Gadi Eisenkot …
  The Joint List … recommended Yashar party leader Gadi Eisenkot to form Israel's next government".
- Maariv live, 5 Nov 2026 (https://www.maariv.co.il/news/elections-2026/article-1384980), section headings: "ביחד:
  ממליצים על גדי איזנקוט", "הרשימה המשותפת: ממליצים על גדי איזנקוט", "יהדות התורה: לא נמליץ על אף מועמד".
- Maariv live, later update (same URL): "סיעת ישר! הגיעה להתייעצויות בבית הנשיא הערב, והמליצה לנשיא המדינה יצחק הרצוג על
  גדי איזנקוט להרכבת הממשלה."
- Arutz 7, 5 Nov 2026 (https://www.inn.co.il/news/710161): "המליצה הרשימה המשותפת להטיל את מלאכת הרכבת הממשלה על יו"ר
  סיעת ישר, גדי איזנקוט".

Conflicts and nuances (recorded, not resolved):
- **UTJ:** on 4 November Walla reported a split inside UTJ ahead of the meeting. Degel HaTorah representatives were told
  by their yeshiva heads not to recommend anyone, and Agudat Yisrael's chairman was told "not to recommend at this
  stage". On 5 November the faction as a whole told the President it recommends no one (JNS, Maariv, i24NEWS). The
  scheme records the 5 November position.
- **Religious Zionism–Zehut** ran as one list but met the President as two factions. Both recommended Netanyahu, so the
  whole list sits in one bloc. The split of its 6 seats between the two factions was not checked.
- **Yashar:** JPost (https://www.jpost.com/israel-election-2026/article-913989) wrote "Yashar's delegation called on
  the president to award Herzog the mandate". This is an evident slip for Eisenkot, since the same article says
  "Meridor insisted that Eisenkot would form a government". Maariv states the recommendation directly. The scheme
  follows Maariv.
- Reports on 4 November (C14) said Ra'am "announced separately" its support for Eisenkot. Its formal consultation was on
  5 November.

Gaps: Likud's recommendation; the mandate decision; any President's Residence page (gov.il returned 403).
**Update the scheme** when these are confirmed: move מחל out of `pending`, and add the mandate date here.

## 2022 — 25th Knesset (consultations 9–11 November 2022)

| Faction | Seats | Recommended |
|---|---:|---|
| Likud (מחל) | 32 | Netanyahu |
| Shas (שס) | 11 | Netanyahu |
| UTJ (ג) | 7 | Netanyahu |
| Religious Zionism, Otzma Yehudit, Noam (ט; three factions) | 14 | Netanyahu |
| Yesh Atid (פה) | 24 | Lapid |
| Labor (אמת) | 4 | Lapid |
| National Unity (כן) | 12 | No one |
| Yisrael Beiteinu (ל) | 6 | No one |
| Ra'am (עם) | 5 | No one |
| Hadash–Ta'al (ום) | 5 | No one |

Totals: 64 / 28 / 28, as stated by the President himself. JNS
(https://www.jns.org/israel-news/netanyahu-accepts-mandate-the-nation-clearly-decided) quotes Herzog: "64 members of
Knesset recommended Benjamin Netanyahu MK; 28 members of Knesset recommended Yair Lapid MK; and 28 members of Knesset
chose not to recommend any member of Knesset". JPost of 8 Nov 2022 (article-721778): "Labor announced that it would join
Yesh Atid in recommending … Lapid … Yisrael Beytenu and Hadash-Ta'al and National Unity announced that they would not
recommend anyone." That article was published **before** the meetings. The per-faction positions also rest on Hebrew
Wikipedia (secondary). JPost of 10 Nov (article-722008) confirms that UTJ, RZP and Otzma Yehudit recommended Netanyahu.

Rounds: Netanyahu was tasked on 13 November 2022 (JNS, above). Netanyahu formed the 37th government, sworn in on
29 December 2022 [R]. The 14-day extension of December 2022 was not re-checked [S].

## 2021 — 24th Knesset (consultations 5 April 2021)

Times of Israel, 5 Apr 2021
(https://www.timesofisrael.com/netanyahu-secures-most-nominations-for-premiership-after-new-hope-abstains/): "Netanyahu
had been endorsed by 52 MKs (Likud 30; Shas 9; United Torah Judaism 7; Religious Zionism 6). Yesh Atid leader Yair Lapid
was recommended as prime minister by 45 MKs (Yesh Atid 17, Blue and White 8, Yisrael Beytenu 7, Labor 7, Meretz 6), and
Naftali Bennett by the 7 members of his own Yamina party. The three parties who made no recommendation account for the
final 16 Knesset seats (New Hope 6, Joint List 6 and Ra'am 4)." The scheme matches this exactly.

Rounds (all [S] except the last):
- 6 Apr 2021: Netanyahu tasked.
- 4–5 May 2021: Netanyahu's 28 days expired at midnight, and he informed the President that he could not form a
  government.
- 5 May 2021: Rivlin tasked Lapid, after meeting Lapid and Bennett (Globes, Axios, Al-Monitor).
- 2 June 2021: Lapid informed the President that he could form a government. **Not verified in this pass.**
- 13 June 2021: the 36th government (Bennett–Lapid) was sworn in [R].

## 2020 — 23rd Knesset (consultations 15 March 2020)

JNS (https://www.jns.org/israel-news/netanyahu-rival-gantz-to-get-first-chance-to-form-a-government): 61 for Gantz
(33 Blue and White, 6 Labor/Meretz, 7 Yisrael Beiteinu, 15 Joint List) and 58 for Netanyahu. Orly Levy-Abekasis
(Gesher, elected on the Labor–Gesher–Meretz list) is the one remaining MK. Her abstention is **inferred from the totals**,
as noted in the scheme. No change.

Rounds:
- 16 Mar 2020: Gantz tasked [S].
- 16 Apr 2020: Gantz's mandate ended. The President passed the task to the Knesset, which had 21 days for 61 MKs to
  name a candidate (Al Jazeera, Times of Israel) [S].
- 7 May 2020: 72 MKs signed for Netanyahu, and the President tasked him that night (JPost) [S].
- 17 May 2020: the 35th government was sworn in [R].

## September 2019 — 22nd Knesset (consultations 22–23 September 2019)

JPost, 24 Sep 2019
(https://www.jpost.com/Israel-Elections/Netanyahu-to-have-more-support-than-Gantz-after-Balad-revocation-602566):
"President Reuven Rivlin subtracted Balad … from the recommendations for … Gantz … This put … Netanyahu in the lead,
with 55 recommendations to Gantz's 54 … Yisrael Beytenu … chose to recommend no one". Tibi's letter to Rivlin:
"the recommendation is by 10 MKs of Hadash, UAL and Ta'al, and not 13".

Conflict: Joint List leader Ayman Odeh said the recommendation was still in the name of all 13 MKs. The President
counted 10. The scheme follows the President's count, with Balad's 3 seats in "no recommendation".

Rounds:
- 25 Sep 2019: Netanyahu tasked [R].
- 21 Oct 2019: Netanyahu returned the mandate (Globes) [S].
- 23 Oct 2019: Gantz tasked (Ynetnews, ToI) [S].
- About 20–21 Nov 2019: Gantz's mandate ended and the task passed to the Knesset for 21 days [S]. No MK gathered
  61 signatures.
- The Knesset dissolved for the March 2020 election [R]. The exact date was not re-checked.

## April 2019 — 21st Knesset (consultations 15–16 April 2019)

ToI (https://www.timesofisrael.com/netanyahu-secures-majority-backing-after-right-wing-parties-recommend-him-as-pm/):
65 Netanyahu, 45 Gantz (Blue and White, Labor and Meretz, as reported in the same article). The two Arab lists (10) are
the remainder; the retrieved text does **not quote** their position. No change.

Rounds: Netanyahu was tasked on 17 Apr 2019. He did not form a coalition, and the Knesset dissolved itself on
30 May 2019 [R]. The 34th government continued as a transitional government.

## 2015 — 20th Knesset (consultations 22–23 March 2015)

| Faction | Seats | Recommended |
|---|---:|---|
| Likud, Kulanu, Jewish Home, Shas, Yisrael Beiteinu, UTJ | 67 | Netanyahu |
| Zionist Union (אמת), Meretz | 29 | Herzog |
| Joint List (ודעם) | 13 | No one |
| Yesh Atid (פה) | 11 | No one |

Ynetnews (https://www.ynetnews.com/articles/0,7340,L-4639993,00.html): "The Joint Arab List has decided to not nominate
any candidate for prime minister. … Yesh Atid informed President Reuven Rivlin that it would not recommend any
candidate". JPost (…-394780): "24 nominations for … Herzog, 67 for Netanyahu, and 24 MKs have decided not to nominate
anyone", counted before Meretz's 5 seats.

Rounds: Netanyahu was tasked on 25 Mar 2015 [S]. The 34th government was sworn in on 14 May 2015 [R].

## 2013 — 19th Knesset (consultations 30–31 January 2013)

| Faction | Seats | Recommended |
|---|---:|---|
| Likud–Yisrael Beiteinu (מחל) | 31 | Netanyahu |
| Yesh Atid (פה) | 19 | Netanyahu |
| Jewish Home (טב) | 12 | Netanyahu |
| Shas (שס) | 11 | Netanyahu |
| UTJ (ג) | 7 | Netanyahu |
| Kadima (כן) | 2 | Netanyahu (**corrected**) |
| Labor (אמת), Hatnua (צפ), Meretz (מרצ) | 27 | No one |
| Ra'am–Ta'al (עם), Hadash (ו) | 8 | No one |
| Balad (ד) | 3 | No one (see conflict) |

Walla, 1 Feb 2013 (https://news.walla.co.il/item/2612671): "82 חברי כנסת המליצו על נתניהו … מלבד קדימה, המפלגות האחרות
בגוש השמאל לא המליצו על איש … את המצעד סגרה קדימה … 'ומתוקף התוצאות אנו ממליצים על בנימין נתניהו'".
Behadrei Haredim (https://www.bhol.co.il/news/744869): "בממליצים: ש"ס ויהדות התורה …, הבית היהודי, יש עתיד, הליכוד ביתנו
וקדימה".

Conflict and gap: the previous scheme had Kadima as "unverified". Both reports above put Kadima with Netanyahu. One
search summary attributed a "Kadima recommended Livni" line to a JPost item, but that matches **2009**, when Livni led
Kadima. It is treated as a misattribution. For **Balad**, Walla quotes its delegation's reasons but not the words
"did not recommend". The 82 total (120 − 82 = 38 = every other list) and "the other left-bloc parties recommended no
one" place it here. A JPost item titled "Balad, Justice for the Elderly don't recommend premiership candidates" is from
**2006**, not 2013, and is not used.

Rounds: Peres tasked Netanyahu on Saturday night, 2 Feb 2013. Behadrei Haredim (https://bhol.co.il/news/744965):
"On Motzei Shabbos, after the recommendations of the 82 members of the Knesset, the President … awarded the formation of
the new government on Benjamin Netanyahu". The 33rd government was sworn in on 18 Mar 2013 [R].

## 2009 — 18th Knesset (consultations 18–19 February 2009)

JPost, 19 Feb 2009 (https://m.jpost.com/israel/procession-of-party-chiefs-calls-on-the-president): "Of all 12
factions, only Kadima, with its 28 MKs, recommended that Peres designate Kadima leader Tzipi Livni … The Likud, Habayit
Hayehudi, Israel Beiteinu, Shas, National Union and United Torah Judaism (a total of 65 MKs) recommended … Netanyahu,
while Meretz, Balad, Labor, Hadash and the United Arab List-Ta'al refrained from recommending anyone."
JTA, 19 Feb 2009 (https://www.jta.org/?p=428589) agrees on 65 and on Meretz.

The 2009 article was published before Labor's evening meeting on 19 February. Its "refrained" covers Labor too. Hebrew
Wikipedia (kept as secondary) says Labor decided not to recommend anyone. JTA said Labor was "expected to do the same".
No source found says otherwise.

Rounds: on 20 Feb 2009 Peres met Netanyahu and Livni and tasked Netanyahu [S] (several wire reports dated
20 February 2009). The 32nd government was sworn in on 31 Mar 2009 [R].

## Remaining gaps and next steps

1. **2026:** record Likud's recommendation and the mandate (who, date) once reported. Try the President's
   Residence page again if gov.il becomes reachable.
2. **No official President's Residence text** for any year. The old president.gov.il archive, the MFA/embassy mirrors
   (one returned 404) and Knesset News were not reached in the time box.
3. **April 2019:** the two Arab lists' positions are not quoted.
4. **The [S] round dates** above (2015, 2019b, 2020, 2021, 2022 extension) need an article body or an official notice.
5. **2009:** the 20 February tasking is known only from wire-service search results.
