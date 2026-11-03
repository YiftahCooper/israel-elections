# Publish every elected rank for k16/k17 and check the official results names

## Authority and relationship

The owner requires every seat-winning list to retain a contiguous registered prefix
covering at least all its elected ranks. This record implements that explicit instruction
and supersedes 0053's unavailable fallback **for winning lists only**. Later registered
ranks are optional when reliably readable. Unavailable non-winning lists remain allowed.
Decisions 0051–0052, the national discrepancies and locality derivation remain unchanged.
No application, engine, model or schema files change.

## Evidence and method

**Observed primary evidence:** visually read every elected candidate position from
`data/raw/k16/candidates.pdf` (YP 5148) and `data/raw/k17/candidates.pdf` (YP 5504),
then independently transcribed and compared each name in section 4 of the results notices:
**YP 5155 pp. 1407–1408** and **YP 5514 pp. 2465–2468**. These notices print all
120 elected people in each election; inaccessible membership webpages are unnecessary
for this comparison. The new names and comparisons use no secondary name source.

Reproduce the renders with Node 24.18.0, locked pdfjs-dist **6.5.438** and
@napi-rs/canvas **1.1.0**: load the retained PDF bytes with `getDocument`, passing
`wasmUrl: resolve('node_modules/pdfjs-dist/wasm') + '/'`; obtain each page's viewport
with `getViewport({ scale: 4 })`, create a canvas of the ceiling viewport dimensions,
await `page.render({ canvas, canvasContext, viewport }).promise`, and save a PNG.
Keep render scripts, PNGs and enlarged crops in `.backup-scratch/`. Candidate PDF
page indices are gazette page minus **1190 / 2182**; results indices are gazette page
minus **1404 / 2462**. Reread enlarged regions to distinguish glyphs and wrapped fields.
The retained scans, lockfile, parameters and reviewed JSONs are the reproducible inputs
and accepted transcriptions; scratch is disposable, with no claim of backup exclusion.

The new `electedCrossCheck` records keep **both readings**: registered `namesHe` and
independently read `resultsNamesHe`, with section/page references and exact variant
pairs. `previousMembershipCrossCheck` preserves the earlier secondary review as history.
It is no longer the release gate. Existing later-rank/reserve evidence is retained;
this change does not upgrade that evidence into a complete-roster verification.

## Decision and coverage

Publish the previously missing winning lists at exactly ranks 1..seats, rather than
suppressing elected names because a later rank is unresolved. Set `candidatesTruncated`
for these prefixes and publish bilingual reasons. All other existing complete rosters
remain complete. Only zero-seat lists may retain empty `candidatesUnavailable` arrays.
Never infer later candidates from modern membership or fill gaps with guessed names.

There are **368 / 719** published names, adding **73 / 55** names respectively.
Every winning list covers all elected positions: **13 / 12 lists, 120 / 120 ranks**.
There are **10 / 7** truncated winning rosters and **4 / 6** unavailable non-winning
rosters. “Complete” means neither flag is set; “unavailable” means no names published,
not no registered candidates. Printed is the registered terminal rank, not the number
transcribed. The remaining unresolved-rank reasons from 0053 stay in the reviewed JSON.

### k16 (2003)

| List (letters) | Seats | Ranks transcribed | Printed | Candidate gazette pages | Flag |
|---|---:|---|---:|---|---|
| Labor–Meimad (אמת) | 19 | 1–19 | 120 | 1192 | truncated |
| National Religious Party (ב) | 6 | 1–6 | 120 | 1192, 1193 | truncated |
| United Torah Judaism (ג) | 5 | 1–5 | 120 | 1193, 1194 | truncated |
| Balad (ד) | 3 | 1–3 | 118 | 1194, 1195 | truncated |
| Hadash–Ta’al (ו) | 3 | 1–3 | 118 | 1195 | truncated |
| זעם צדק חברתי (ז) | 0 | 1–17 | 17 | 1196 | complete |
| אהבת ישראל בנשיאות גדול המקובלים הרב כדורי (זנ) | 0 | 1–10 | 10 | 1196 | complete |
| מפלגת זכויות הגבר במשפחה - רע״ש (ט) | 0 | 1–7 | 7 | 1196 | complete |
| Shinui (יש) | 15 | 1–15 | 120 | 1196, 1197 | truncated |
| Yisrael BaAliyah (כן) | 2 | 1–24 | 24 | 1197 | complete |
| National Union (ל) | 7 | 1–35 | 35 | 1197 | complete |
| Likud (מחל) | 38 | 1–114 | 114 | 1197, 1198 | complete |
| Meretz (מרצ) | 6 | 1–6 | 120 | 1198, 1199 | truncated |
| Am Ehad (ם) | 3 | 1–3 | 119 | 1199 | truncated |
| ישראל אחרת כי נשבר מפוליטיקאים (נ) | 0 | 1–17 | 17 | 1200 | complete |
| חרות (נץ) | 0 | — | 25 | 1200 | unavailable |
| United Arab List (עם) | 2 | 1–2 | 119 | 1200, 1201 | truncated |
| המרכז - תנועה חברתית לאומית בראשות דוד מגן (פה) | 0 | 1–18 | 18 | 1201 | complete |
| לידר - מפלגה מתקדמת ליברלית דמוקרטית (ף) | 0 | — | 11 | 1201 | unavailable |
| צומת (צ) | 0 | 1–11 | 11 | 1201 | complete |
| הברית הלאומית המתקדמת - מפלגת האחדות הלאומית (צף) | 0 | — | 77 | 1201, 1202 | unavailable |
| ארגון הפעולה הדמוקרטי - דע״ם (ק) | 0 | 1–7 | 7 | 1202 | complete |
| אזרח ומדינה (קך) | 0 | 1–10 | 10 | 1202 | complete |
| Ale Yarok (קנ) | 0 | 1–18 | 18 | 1202 | complete |
| ל.ה.ב.ה (קץ) | 0 | — | 12 | 1202 | unavailable |
| The Greens (רק) | 0 | 1–7 | 7 | 1202 | complete |
| Shas (שס) | 11 | 1–11 | 111 | 1203 | truncated |

### k17 (2006)

| List (letters) | Seats | Ranks transcribed | Printed | Candidate gazette pages | Flag |
|---|---:|---|---:|---|---|
| Labor–Meimad (אמת) | 19 | 1–19 | 120 | 2184 | truncated |
| United Torah Judaism (ג) | 6 | 1–120 | 120 | 2185 | complete |
| Balad (ד) | 3 | 1–3 | 120 | 2186 | truncated |
| ברית עולם (ה) | 0 | 1–22 | 22 | 2187 | complete |
| Hadash (ו) | 3 | 1–3 | 119 | 2187, 2188 | truncated |
| לחם (ז) | 0 | 1–30 | 30 | 2188 | complete |
| עתיד אחד - עתיד טוב לישראל (זה) | 0 | 1–10 | 10 | 2188 | complete |
| Gil (Pensioners) (זך) | 7 | 1–16 | 16 | 2189 | complete |
| חץ - תנועה חילונית ציונית בראשות אברהם פורז (חץ) | 0 | — | 61 | 2189 | unavailable |
| National Union–NRP (טב) | 9 | 1–9 | 120 | 2190 | truncated |
| שינוי - המפלגה האזרחית של ישראל (יש) | 0 | — | 100 | 2191 | unavailable |
| חזית יהודית לאומית בראשות ברוך מרזל (כ) | 0 | — | 10 | 2192 | unavailable |
| Kadima (כן) | 29 | 1–120 | 120 | 2192, 2193 | complete |
| צומת (כץ) | 0 | 1–10 | 10 | 2193 | complete |
| Yisrael Beiteinu (ל) | 11 | 1–23 | 23 | 2193 | complete |
| Likud (מחל) | 12 | 1–12 | 119 | 2194 | truncated |
| Meretz (מרצ) | 5 | 1–5 | 120 | 2195 | truncated |
| חרות (נץ) | 0 | — | 19 | 2196 | unavailable |
| Ra’am–Ta’al (עם) | 4 | 1–4 | 117 | 2196, 2197 | truncated |
| תפנית בראשות עוזי דיין (פ) | 0 | 1–24 | 24 | 2197 | complete |
| לב (פז) | 0 | 1–7 | 7 | 2197 | complete |
| עוז לעניים (פכ) | 0 | 1–21 | 21 | 2198 | complete |
| מפלגה למלחמה בבנקים (פץ) | 0 | 1–10 | 10 | 2198 | complete |
| לידר (ף) | 0 | — | 11 | 2197 | unavailable |
| הציונות החדשה (צה) | 0 | 1–11 | 11 | 2198 | complete |
| דע״ם - מפלגת פועלים (ק) | 0 | 1–55 | 55 | 2198, 2199 | complete |
| צדק לכל - רע״ש (קז) | 0 | 1–14 | 14 | 2199 | complete |
| Ale Yarok (קנ) | 0 | 1–27 | 27 | 2199 | complete |
| המפלגה הלאומית הערבית בראשות מוחמד כנעאן (קפ) | 0 | — | 32 | 2200 | unavailable |
| The Greens (רק) | 0 | 1–26 | 26 | 2200 | complete |
| Shas (שס) | 12 | 1–118 | 118 | 2200, 2201 | complete |

## Elected comparison and exceptions

**Observed:** all 240 elected identities and their ordering agree with the two official
notices. There is no registered-to-results replacement requiring an inferred withdrawal.
There are nine literal printed-name differences, enumerated below. These are resolved by
retaining both official readings at the same rank, not by claiming a formal correction.
Same-person identity is the comparison conclusion; source spellings remain observed facts.

| Election/list | Rank | Candidate notice | Results notice |
|---|---:|---|---|
| k16/אמת | 9 | תמיר יעל יולי | תמיר יולי יעל |
| k16/ל | 6 | אריאל אורי יהודה | אריאל אורי-יהודה |
| k16/מחל | 14 | איתן מיכאל מיקי | איתן מיקי (מיכאל) |
| k16/מחל | 23 | יתום אהוד יצחק | יתום אהוד-יצחק |
| k16/מחל | 33 | בוים זאב דוד | בוים זאב-דוד |
| k16/ם | 1 | פרץ ארמונד עמיר | פרץ ארמונד-עמיר |
| k17/ו | 3 | חנין דב-בוריס | חנין דב - בוריס |
| k17/טב | 9 | אריאל אורי יהודה | אריאל אורי-יהודה |
| k17/ל | 7 | לנדבר אהרון- סופיה סוניה | לנדבר אהרון סופיה סוניה |

The **2006 Yisrael Beiteinu #7–8** layout needed correction. Candidate p. 2193 wraps
**אהרון-** below **לנדבר** in the family-name column at #7. Results p. 2467 explicitly
prints **לנדבר אהרון / סופיה סוניה** at #7 and **אהרונוביץ / יצחק** at #8, resolving
the row assignment. Preserve the candidate-notice trailing hyphen at #7. The previous
transcription wrongly attached it to #8's given name and added an apostrophe to #8's
surname. Both scans also correct **חסון ארני ישראל → חסון ארדי ישראל** at #3, and
Labor #19 **מג'דלה גאלב → מגדלה גאלב**. The JSON records before/after readings and
both page references; these are transcription repairs, not historical name changes.

**Sharansky is a separate post-election exception:** YP 5155 p. 1407 elects Sharansky
#1 and Edelstein #2, matching the candidate notice exactly. The later withdrawal and
Solodkin #3's inauguration membership remain documented by the earlier secondary report
in 0053. No official withdrawal/correction notice has been verified; do not call that
report primary evidence. The simulation still selects registered order and does not
substitute Solodkin. No new withdrawal claim is needed to reconcile section 4.

## Enforcement and remaining limits

The k16/k17 builder verifies contiguous ranks and source pages, exact coverage/flag
agreement, at least seats names for every winner, official results-source provenance,
all elected positions, and an exhaustive exact list of printed-name variants. It refuses
unknown differences and secondary-only elected checks. Reserve evidence is compared to
published names only where those ranks are retained. Manifest SHA-256 and byte counts
are updated only for the two changed reviewed transcriptions; no new source is added.
Dataset and election-index status notes describe coverage in Hebrew and English.

The public candidate arrays now cover every official seat. A scenario awarding more
seats than a truncated prefix may still exhaust transcribed names; truncation is not a
claim of vacant historical seats or absent later candidates. Later omitted ranks,
unavailable non-winning rosters, later candidate amendments, an official Sharansky
withdrawal notice and the exhaustive historical-law amendment chain remain unverified.
The 2003 printed-vote and 2006 nine-cast-vote discrepancies remain as in 0052.

## Validation

The new elected-coverage tests were first run against the previous public datasets:
four failures exposed the missing winning rosters. After rebuilding, both historical
test files passed. Final checks passed:

* `npx tsc -p tsconfig.json --noEmit`.
* `node scripts/build-datasets.ts`, including actual polling reconciliation of **7,885 /
  8,426** rows and **1,172 / 1,150** derived groups from recovered source copies.
* `node scripts/check-colours.ts` (all released elections).
* `npx vitest run`: **27 files, 244 tests passed**.
* CI simulation: move `.backup-scratch/raw` aside, rebuild, compare all four k16/k17
  public files after removing only `buildInfo.builtAt`, then restore polling scratch.
  All four compared equal. The scratch-free build explicitly skipped only the optional
  polling-source reread and still passed retained hashes, coverage and arithmetic gates.

Other elections' regenerated JSONs were checked for timestamp-only differences and
restored before commit. No new external retrieval or live-system change was required.
