# Recommendations to the President, 1949–1973 (k1–k8)

Research done on **5 November 2026** for the "after the election" section. The question was what each
Knesset faction recommended to the President (Weizmann, Ben-Zvi, Shazar, Katzir) after the elections of
1949–1973, and to whom the President then gave the task of forming the government. English Wikipedia was
not used. Hebrew Wikipedia appears only as a labelled secondary lead.

## Verdict

- **No election in 1949–1973 has per-faction evidence read in a primary source.** The National Library's
  historical newspapers (JPress), the main archival route, could not be read: every route returned a
  Cloudflare bot challenge, and no attempt was made to get past it (see *Access log*). The Israel State
  Archives catalogue returned HTTP 403 to plain requests. Its 1961 chapter could only be read through
  Exa's copy of the page, and the scanned consultation documents could not be opened.
- The substitute evidence is the **JTA Daily News Bulletin archive**: contemporary news-agency reports,
  labelled `secondary`. The official Knesset government pages supply the mandate dates.
- **Data added** (`pm-recommendations` bloc scheme, same format as k18–k25):
  - **k4 1959**: all 120 seats recommended Mapai's candidate (Ben-Gurion). This rests on one JTA summary
    sentence ("All parties … agreed"). Confidence: medium.
  - **k7 1969**: 104 seats recommended Meir (the outgoing government's factions, "reportedly"). The
    other 16 seats are **Not stated in source**.
  - **k8 1974**: 51 recommended Meir (Alignment) and 39 named no candidate (Likud). The other 30 seats are
    **Not stated in source**.
- **Not added to data**: k1 1949, k2 1951, k3 1955, k5 1961 and k6 1965. Most factions are undocumented,
  or the documented positions are coalition conditions rather than recommendations. These rounds are
  recorded below.
- The "Not stated in source" bloc follows the existing k18 precedent (`unstated`, "לא צוין במקור",
  `#cccccc`). Bloc schemes accept any bloc; `separateBlocColours` shifts its grey to a distinct tint at
  build time, as it already does for k18/k19. Lists in that bloc are **not** "no recommendation".
- **Never inferred from coalition membership.** For 1969, the outgoing-government factions are named by
  the JTA report itself. Gov.14 is used only to identify those factions.

## Legal frame

- **1949–1962, Transition Law (חוק המעבר, תש"ט-1949, ss. 8–11).** The President consults faction
  representatives and assigns the task to a Knesset member. No time limit and no procedure on failure.
- **1962 amendment (No. 7)**: 28 days plus extensions; a second candidate; a majority-request route.
- **Basic Law: The Government (1968)**: 21 days plus up to 21 days of extensions. This applied to 1969
  and 1974.
- Sources for these points: the Knesset law PDFs cited in Hebrew Wikipedia's "הטלת המנדט להקמת ממשלה
  בישראל" (fs.knesset.gov.il/1/law/1_lsr_208911.pdf, 5_lsr_208923.pdf, 6_lsr_208437.PDF). These were
  leads only; the law texts were not re-read in this pass.
- **Consultation order was the President's choice.** In 1955 Ben-Zvi first invited the parties of the
  outgoing coalition. Herut objected and boycotted (JTA, 18 Aug 1955, below). In 1961 he consulted in
  order of size (Israel State Archives chapter).

## Per election

Seats are the official seats in `public/data/kN.json`. Quotes are verbatim from the JTA page text,
fetched with curl and read in full, with page chrome stripped. The JTA "date" is the bulletin's
`datePublished`. Bulletins are datelined the previous day, so an event reported as "today" may fall one
day earlier.

### k1 — 1949 (Weizmann; mandate to Ben-Gurion, 24 Feb 1949 per Hebrew Wikipedia's table, citing gov1.pdf)

| List | Seats | Position at consultation | Source |
|---|---:|---|---|
| א Mapai | 46 | Saw the President on 22 Feb; no recommendation wording reported | JTA 1949-02-23 |
| מ Mapam | 19 | "agreed to enter the Cabinet under the leadership of David Ben Gurion" (a condition for joining, not stated as a recommendation) | JTA 1949-02-23 |
| ב United Religious Front | 16 | Saw the President; no wording reported | JTA 1949-02-23 |
| צ General Zionists | 7 | Saw the President; no wording reported | JTA 1949-02-23 |
| פ Progressives | 5 | Saw the President; no wording reported | JTA 1949-02-23 |
| ח, ס, ק, יד, טו, נ, ל | 27 | Not stated in source | — |

- JTA 1949-02-21, [weizmann-summons-leaders…](https://www.jta.org/archive/weizmann-summons-leaders-of-all-parties-in-assembly-to-consult-today-on-cabinet-make-up):
  "President Weitzman today invited leaders of the various parties in the Israeli Constituent Assembly to
  consult with him tomorrow on composition of the new government." The President invited the party
  leaders for the next day, which places the first meetings on 22 February.
- JTA 1949-02-23, [weizmann-sees-party-lesders…](https://www.jta.org/archive/weizmann-sees-party-lesders-on-new-govt-mapam-outlines-conditions-for-participation):
  "The Mapam agreed to enter the Cabinet under the leadership of David Ben Gurion, Mapai's chief … Other
  parties whose representatives saw President Weizomann today were the Mapai, Religious Bloc, General
  Zionists and Progressives." Mapam agreed to enter a cabinet led by Ben-Gurion; Mapai, the Religious
  Bloc, the General Zionists and the Progressives also met the President that day.
- **Gap:** the meetings of the small lists (and Herut, Maki) are not reported. The JPress reports of
  23–25 Feb 1949 are the route to close it.

### k2 — 1951 (Weizmann; mandate to Ben-Gurion, 20 Aug 1951 per Hebrew Wikipedia's table, citing gov3.pdf)

- JTA 1951-08-14, [weizmann-continues-consultations…](https://www.jta.org/archive/weizmann-continues-consultations-with-party-leaders-on-composition-of-government):
  "He received the representatives of the Mapam, Herut, Poale Mizrachi, Communists, Progressives, Poale
  Agudah and the Arab Democratic League. His consultations will conclude tomorrow when he hears the views
  of the delegates of the Agudas Israel, Mizrachi and the remaining two Arab groups. During the week-end,
  he conferred with representatives of the Mapam [sic, probably Mapai] and General Zionists, the first two
  parties in the new Parliament." The report lists who was received and when, but gives no
  recommendations.
- Ben-Gurion's account (gov4.pdf, 22 Dec 1952): "לאחר שהנשיא הטיל עלי ב-20 באוגוסט להרכיב ממשלה
  חדשה…" (*"After the President charged me on 20 August with forming a new government…"*). This fixes
  the mandate date (official).
- **Gap:** all 15 lists (120 seats) are Not stated in source. Not added to data.

### k3 — 1955 (Ben-Zvi; consultations 16–18 Aug; mandate to Ben-Gurion, 18 Aug per gov7.pdf lead, JTA bulletin 19 Aug)

| List | Seats | Position | Source |
|---|---:|---|---|
| א Mapai | 40 | Ready to lead "the broadest possible coalition, excluding only the Herut and the Communists"; no name in the report | JTA 1955-08-17 |
| ב National Religious Front | 11 | "They suggested that the representatives of the largest party (Mapai) be asked to form a government." (a party, not a person) | JTA 1955-08-17 |
| פ Progressives | 5 | "urged a broad coalition excluding only the Communists"; no name | JTA 1955-08-17 |
| צ General Zionists | 13 | "not ready to enter any coalition"; no name | JTA 1955-08-18 |
| גד Torah Religious Front | 6 | Coalition conditions (Sabbath, pig-raising); no name | JTA 1955-08-18 |
| תו Ahdut HaAvoda | 10 | Broad coalition excluding the General Zionists, Herut and the Communists; no name | JTA 1955-08-18 |
| מ Mapam | 9 | "favored a broad coalition"; no name | JTA 1955-08-18 |
| ח Herut | 15 | **Did not attend**: "refused to accept the President's invitation" over the order of consultations | JTA 1955-08-18 |
| ק, יד, נ, ע | 11 | Not stated in source | — |

- Sources: [JTA 1955-08-17](https://www.jta.org/archive/israel-president-starts-consultations-on-formation-of-cabinet),
  [JTA 1955-08-18](https://www.jta.org/archive/ben-zvi-ends-talks-on-cabinet-formation-will-summon-ben-gurion),
  [JTA 1955-08-19](https://www.jta.org/archive/ben-gurion-authorized-to-form-new-cabinet-seeks-wide-coalition):
  "he invited David Ben Gurion, senior leader of the Mapai Party, to try to form a Cabinet on the
  'broadest possible basis.'" This is the report of the mandate to Ben-Gurion.
- Corroboration of the Herut boycott: Ynet, 11 Nov 2022 (secondary): "ב-1955 החרימה סיעת חירות את
  ההתייעצויות עם הנשיא השני יצחק בן צבי" (*"In 1955 the Herut faction boycotted the consultations with
  the second president, Yitzhak Ben-Zvi"*).
- **Not added to data:** most positions are coalition terms, not recommendations, and four lists are
  unreported. Showing "no recommendation" would overstate the record.

### k4 — 1959 (Ben-Zvi; mandate to Ben-Gurion, Tuesday 8 Dec 1959) — **added**

- JTA 1959-12-09, [israel-president-appoints-ben-gurion…](https://www.jta.org/archive/israel-president-appoints-ben-gurion-to-form-a-new-government):
  "All parties, in their talks with the President, agreed that the Mapai candidate for Prime Minister
  should be given the task of forming a new government." The same report notes that Agudat Yisrael told
  the President it was "forbidden to participate in the Government" by its rabbinical council. That is
  a coalition position, not a recommendation.
- Knesset, gov9.pdf (official; Ben-Gurion, 16 Dec 1959): "לפני שמונה ימים, ביום השלישי של השבוע שעבר,
  הטיל עליי נשיא המדינה – לאחר שהתייעץ עם כל סיעות הכנסת – הרכבת ממשלה" (*"Eight days ago, on Tuesday
  of last week, the President — after consulting all Knesset factions — charged me with forming a
  government"*). This gives 8 December.
- **Data:** a single bloc of all 12 lists (120 seats). This is complete only through the blanket
  statement; no per-faction wording was read, so confidence is medium.

### k5 — 1961 (Ben-Zvi; two mandates)

- **Round 1, 5–6 Sep 1961.** The Israel State Archives chapter "מעשה מרכבה – 'מועדון הארבע' והקמת
  הממשלה ב-1961" (official/archival; catalog.archives.gov.il/site/chapter/eshkol-moadon-haarba/, read
  through Exa's copy because direct requests return 403) says: "מפא"י המליצה על דוד בן-גוריון, חרות מצידה
  בקשה כי הנשיא לא יאפשר שיהוי בהתנהלות בן-גוריון. באם יתעכב, ביקשו להעביר אליהם את התפקיד" (*"Mapai
  recommended David Ben-Gurion; Herut asked the President not to allow delay by Ben-Gurion, and if he
  delayed, to pass the task to them"*). It cites document 1 in file נ-56/1.
- JTA 1961-09-06 ([israel-president-opens-talks…](https://www.jta.org/archive/israel-president-opens-talks-on-cabinet-formation-sees-party-leaders))
  reported the first-day meetings:
  - Mapai "proposed … that Premier David Ben-Gurion be given the task".
  - Herut "asked the President to limit to 14 days the period".
  - The Liberals set coalition terms and named no candidate.
  - The NRP "intimated it was ready to participate in such a coalition under Mr. Ben-Gurion's leadership".
- 6 Sep: the President met Mapam, Ahdut HaAvoda, the Communists, Agudat Yisrael, the Arab lists and PAI
  (ISA, document 2). Their positions are in the scans, which were not readable.
- Mandate to Ben-Gurion on 7 Sep (JTA 1961-09-07, [israel-president-entrusts-ben-gurion…](https://www.jta.org/archive/israel-president-entrusts-ben-gurion-with-formation-of-new-cabinet)).
  Ben-Gurion declined the next day (ISA: "לצערי הרב איני מוכן לקבל על עצמי בתנאים הקיימים הרכבת
  הממשלה" — *"To my great regret I am not prepared, under the present conditions, to undertake forming
  the government"*).
- **Round 2, 14 Sep 1961:** Mapai recommended Levi Eshkol, and the President gave him the task (ISA,
  document 4; [JTA 1961-09-14](https://www.jta.org/archive/mapai-wants-eshkol-to-be-entrusted-with-formation-of-new-cabinet)).
  On 2 Nov Eshkol returned the mandate and the President gave it to Ben-Gurion (Hebrew Wikipedia table
  lead; gov10.pdf).
- **Not added to data:** only Mapai is documented as recommending a person in either round. The Herut
  (17), Liberal (17) and NRP (12) positions are conditional or procedural. Nine lists are unreported.

### k6 — 1965 (Shazar; mandate to Eshkol, 28 Nov 1965 per gov13.pdf lead)

| List | Seats | Position | Source |
|---|---:|---|---|
| חל Gahal | 26 | Proposed that the President "entrust the formation of a new Cabinet to Premier Levi Eshkol" | JTA 1965-11-26 |
| כא Rafi | 10 | Same as Gahal | JTA 1965-11-26 |
| את Alignment | 45 | Consulted first ("The President's consultation will start tomorrow with a meeting with the Mapai-Achdut Avoda alignment faction."); recommendation wording **not found** | [JTA 1965-11-24](https://www.jta.org/archive/israel-president-starts-talks-today-on-formation-of-new-cabinet) |
| ב, מ, לע, ג, ו, רא, ד, יא, ש, ק | 39 | Not stated in source | — |

- [JTA 1965-11-26](https://www.jta.org/archive/formation-of-new-cabinet-by-eshkol-proposed-by-opposition-parties):
  "The two main opposition parties in Israel–the Gahal combination of Herut and Liberals and former Premier
  David Ben-Gurion's dissident Israel Workers party (Rafi)–proposed today to President Zalman Shazar that
  he entrust the formation of a new Cabinet to Premier Levi Eshkol." The two main opposition parties
  proposed Eshkol.
- **Not added to data:** 84 of 120 seats are unreported, including the Alignment's own wording.

### k7 — 1969 (Shazar; mandate to Meir, 10 Nov 1969) — **added**

- [JTA 1969-11-10](https://www.jta.org/archive/shazar-finishes-consultations-with-all-parties-told-all-support-mrs-meir-for-premier):
  "All of the factions represented in the outgoing National Unity Government reportedly told Mr. Shazar
  that they wished Mrs. Meir to continue as Premier." Every faction of the outgoing government is reported
  to have wanted Meir to continue as prime minister. The headline ("told all support Mrs. Meir") goes
  further than the text; the text is used. Consultations began on Saturday 1 Nov per [JTA 1969-11-06](https://www.jta.org/archive/mrs-meir-other-labor-leaders-striving-to-reconcile-opposing-factions).
- The outgoing-government factions come from Knesset gov.14.pdf (official, 17 Mar 1969). In 1969 ballot
  letters they are אמת, חל, ב, לע, ד, רא, יא, with **104 seats** in total. The Druze and Arab-Jewish
  Brotherhood factions won no seats as such in 1969.
- **Not stated in source (16):** ג Agudat Yisrael 4, עמ State List 4, ו Rakah 3, ש HaOlam HaZeh 2,
  ט Free Centre 2, ק Maki 1.
- **Conflict or lead:** Hebrew Wikipedia's table (secondary) says "רוב הסיעות המליצו על מאיר, ואילו
  הרשימה הממלכתית (4) לא הביעה הסכמה" (*"most factions recommended Meir, while the State List (4) did not
  express consent"*). It cites Davar 11 Nov 1969 p. 1 art. 17 (nli.org.il/he/newspapers/dav/1969/11/11/01/article/17),
  which was **not inspected**. The State List therefore stays Not stated in source.
- **Date:** 10 Nov per Hebrew Wikipedia/Davar. The JTA bulletin of 10 Nov expects the mandate "tomorrow".

### k8 — 1973 (Katzir; consultations from 16/17 Jan 1974; mandate to Meir, 30 Jan 1974) — **added**

- [JTA 1974-01-17](https://www.jta.org/archive/official-moves-begun-by-katzir-to-form-new-government):
  "the Labor delegation headed by Knesset member Moshe Baram who reportedly suggested that Premier Golda
  Meir be entrusted to form a new government … Bader told reporters later that he had made no suggestions
  as to the next Prime Minister because 'this is the task of Labor.'" The Labor delegation reportedly
  proposed Meir. Bader, for the Likud, named no candidate, saying it was Labor's task.
- [JTA 1974-01-31](https://www.jta.org/archive/mrs-meir-accepts-task-of-forming-new-govt-efforts-so-far-deadlocked):
  "Katzir charged Mrs. Meir with the task … after two weeks of consultations with the representatives of
  the various parties." The task was given after two weeks of consultations.
- **Data:** אמת Alignment 51 → Meir; חל טעם Likud 39 → no candidate named; Not stated in source (30):
  ב NRP 10, גד Torah Religious Front 5, רצ Ratz 3, ו Rakah 4, לע Independent Liberals 4,
  רא Progress and Development 2, עא Arab List for Bedouin and Villagers 1, קנ Moked 1.
- **Date:** 30 Jan per Hebrew Wikipedia (citing Davar 31 Jan 1974, art. 7, not inspected). The JTA
  bulletin dated 31 Jan says "today".
- The 1974 round after Meir's resignation (Rabin, 26 Apr 1974) is a mid-term round. It is out of scope.

## Access log (what was tried)

| Route | Result |
|---|---|
| JPress page URLs (`nli.org.il/he/newspapers/dav/…/page/1`, `…?a=d&d=…`, search `?a=q`) with curl and the project User-Agent | HTTP 403, Cloudflare "Just a moment…" page |
| Same URL in Playwright (normal page load, waited 8 s, no interaction) | Challenge persisted (403). Stopped; no challenge interaction or circumvention. |
| Jina `read_url` / Exa `web_fetch` on a JPress URL | Empty "Just a moment…" body / CRAWL_HTTP_403 |
| Wayback availability for JPress article URLs | No snapshots for the article URLs checked |
| Israel State Archives `catalog.archives.gov.il` with curl | HTTP 403. The 1961 chapter text was read through Exa's copy; document scans not opened |
| Jina `search_web` | Requires an API key (keyless tier unavailable for search) |
| JTA archive (`jta.org/archive/…`, site search `?s=`) with curl | HTTP 200. Articles read in full, about 1 s between requests |
| Knesset government PDFs (`main.knesset.gov.il/mk/government/documents/govN.pdf`) | HTTP 200 (gov1 fetched); gov4/gov9/gov.14 text read through Exa's index copy |

## How to close the gaps

1. JPress, from a normal browser session that passes the challenge (a human, or an approved access
   route). For each round, read the Davar/Maariv/Haaretz/Herut reports on the consultation days:
   - 22–24 Feb 1949;
   - 12–15 Aug 1951;
   - 16–18 Aug 1955;
   - 1–8 Dec 1959;
   - 5–7 and 14 Sep 1961;
   - 23–28 Nov 1965;
   - 1–11 Nov 1969;
   - 16–31 Jan 1974.

   Known leads are Davar 11 Nov 1969 art. 17, Davar 31 Jan 1974 art. 7 and Haaretz 15 Sep 1961 p. 9.
2. Israel State Archives, President's Office files. Start with file נ-56/1 (1961), documents 1, 2 and 4,
   which record each faction's position. Similar files probably exist for other rounds; this was not
   checked.
3. Then replace the "Not stated in source" lists with sourced positions, and add k1–k3, k5 and k6 if
   they become complete.
