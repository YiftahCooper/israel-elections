# Government support roles: evidence and limits

Research as of 7 November 2026. **This is a partial authentication pass, not a completed historical certification.** It covers all 37 numbered governments present in the k1–k26 records, plus the existing government-15 departure snapshot. Governments 20, 22, 24, 26 and 29 previously had no membership snapshot; the positive cabinet evidence is now recorded without copying a predecessor’s parties or election seat counts. Government 14 likewise has partial coverage. k21, k22 and k26 have no new government in the retained record. No UI or original election-result grouping was changed.

## Contract and decision criteria

The role is the participant’s relationship **at the snapshot date**, not its recommendation to the President, every vote in the term, or the elected list’s eventual affiliation. A minister without portfolio is a cabinet member. A deputy minister is not a cabinet minister. Do not infer an arrangement from a vote, a parliamentary office, or ideological affinity.

| Role | Required evidence |
|---|---|
| `member-with-ministries` (M) | Cabinet appointment and representing faction; ministerial record IDs retained. |
| `member-without-ministries` (N) | Formal accession/deposited agreement or governing declaration; no cabinet ministry at that date. |
| `outside-support` (O) | Continuing pledge/arrangement, with no coalition membership. |
| `confidence-vote-only` (V) | Positive investiture vote established; no continuing arrangement recovered. Provisional where absence of an arrangement cannot be established. |
| `abstained-by-arrangement` (A) | Actual arrangement to abstain, not merely a recorded abstention. No new case meets this standard in this pass. |
| `other` (U) | Explicit explanation; `certainty: unknown` for unresolved relationship. This is not an inferred coalition member. |

`certainty` is required: confirmed, provisional († below), or unknown. Unknown rows have a reason and no fabricated quote. `coalitionSeats` counts M/N seats only, `supportSeats` counts O only. Null means an unresolved total, never zero. `knownMemberSeats` is only the established subtotal. Unknown current faction sizes are null; a post-election faction can be identified by `factionNameHe` without inventing ballot letters. Multiple constituent factions must not each inherit their parent’s election seat count.

`individuals[]` records origin list, personal identity, role and actual vote (including unknown). `countedInFactionSeats: true` marks an exception already inside a faction’s count; false identifies an additional crossing MK or an already-excluded opposition MK. Their role describes the faction’s nominal participation when they are an exception; it does not assert personal ministry or personal support. The note makes this distinction explicit. The validator adds only supportive crossing individuals and subtracts included dissenters/abstainers/absentees once.

`confidenceVote` is an independently sourced roll call, not a sum of membership. `reconciliation` is exact, explained, unresolved or vote-unavailable. An `expectedFor` bridge is checked arithmetically against the actual tally. Numeric equality does not prove every MK’s voting identity. A quantified unresolved gap remains an authentication gap: the data does **not** claim to explain why an unidentified person did not vote.

Types: `src/data/aftermath.ts` (re-exported by `schema.ts`). Validation: `scripts/lib/build/aftermath.ts`, called by the normal dataset build. It rejects missing/unrecognised roles, unsupported confirmed/provisional classifications, dangling citations, duplicated identities, impossible totals and invalid bridges. Overlay data is not promoted into runtime datasets.

## Government-by-government role table

All role entries below map directly to `data/meta/aftermath/kN.json`, `government` or numbered `government.changes`, with claim-level source IDs, quotes/extraction notes and certainty. The table is an index, not a replacement source ledger. `?` is unknown; U is not a vote against. Individuals are detailed immediately below.

| Election | Government | Faction role and seats | Member/support totals; recorded vote |
|---|---:|---|---|
| k1 | 1 | Mapai 46 M; United Religious Front 16 M; Progressive Party 5 M; Sephardim and Oriental Communities 4 M; Democratic List of Nazareth 2 N (probable, 7 Nov); WIZO 1 V†; Yemenite Association 1 V (disputed, 7 Nov) | 73 members / 0 outside; 73–45 |
| k1 | 2 | Mapai 46 M; United Religious Front 16 M; Progressive Party 5 M; Sephardim and Oriental Communities 4 M; Democratic List of Nazareth 2 U | ? members / ? outside; 69–42; 2 abstain |
| k2 | 3 | Mapai 45 M; Hapoel HaMizrahi 8 M; Mizrahi 2 M; Agudat Yisrael 3 M; Poalei Agudat Yisrael 2 U; Democratic List for Israeli Arabs 3 U; Progress and Work 1 U; Agriculture and Development 1 U | ? members / ? outside; 56–40; 4 abstain |
| k2 | 4 | Mapai 45 M; General Zionists 20 M; Hapoel HaMizrahi 8 M; Mizrahi 2 U; Progressive Party 4 M; Democratic List for Israeli Arabs 3 U; Progress and Work 1 U; Agriculture and Development 1 U | ? members / ? outside; 63–24 |
| k2 | 5 | Mapai 45 M; General Zionists 20 M; Hapoel HaMizrahi 8 M; Mizrahi 2 U; Democratic List for Israeli Arabs 3 U; Progress and Work 1 U; Agriculture and Development 1 U | ? members / ? outside; 75–23; 5 abstain |
| k2 | 6 | Mapai 45 M; Hapoel HaMizrahi 8 M; Mizrahi 2 N; Progressive Party 4 M; Democratic List for Israeli Arabs 3 U; Progress and Work 1 U; Agriculture and Development 1 U; Yemenite Association 1 U | ? members / ? outside; 66–32; 3 abstain |
| k3 | 7 | Mapai 40 M; National Religious Front 11 M; Ahdut HaAvoda 10 M; Mapam 9 M; Progressive Party 5 M; Democratic List for Israeli Arabs 2 U; Progress and Work 2 U; Agriculture and Development 1 U | ? members / ? outside; 73–32; 3 abstain |
| k3 | 8 | Mapai 40 M; National Religious Front 11 M; Ahdut HaAvoda 10 M; Mapam 9 M; Progressive Party 5 M; Democratic List for Israeli Arabs 2 U; Progress and Work 2 U; Agriculture and Development 1 U | ? members / ? outside; 76–33 |
| k4 | 9 | Mapai 47 M; National Religious Party 12 M; Mapam 9 M; Ahdut HaAvoda 7 M; Progressive Party 6 M; Progress and Development 2 U; Cooperation and Brotherhood 2 U; Agriculture and Development 1 U | ? members / ? outside; 78–33 |
| k5 | 10 | Mapai 42 M; National Religious Party 12 M; Ahdut HaAvoda 8 M; Poalei Agudat Yisrael 2 U; Cooperation and Brotherhood 2 U; Progress and Development 2 U | ? members / ? outside; 63–46 |
| k5 | 11 | Mapai 42 M; National Religious Party 12 M; Ahdut HaAvoda 8 M; Poalei Agudat Yisrael 2 N; Cooperation and Brotherhood 2 N; Progress and Development 2 N | 68 members / 0 outside; 64–43 |
| k5 | 12 | Mapai 42 M; National Religious Party 12 M; Ahdut HaAvoda 8 M; Poalei Agudat Yisrael 2 U; Cooperation and Brotherhood 2 U; Progress and Development 2 U | ? members / ? outside; 59–36; 9 abstain |
| k6 | 13 | Alignment 45 M; National Religious Party 11 M; Mapam 8 M†; Independent Liberals 5 M†; Poalei Agudat Yisrael 2 N; Progress and Development 2 U; Cooperation and Brotherhood 2 U | ? members / ? outside; 71–41 |
| k6 | 14 | מערך ? M; גוש חרות ליברלים ? M; מפלגה דתית לאומית ? M | ? members / ? outside; 84–12; 1 abstain |
| k7 | 15 | Alignment 56 M; Gahal 26 M; National Religious Party 12 M; Independent Liberals 4 M; Progress and Development 2 N; Cooperation and Brotherhood 2 N | 102 members / 0 outside; 90–10; 4 abstain |
| k7 | 15 after Gahal departure | Alignment 56 M; National Religious Party 12 M; Independent Liberals 4 M; Progress and Development 2 N; Cooperation and Brotherhood 2 N | 76 members / 0 outside; 90–10; 4 abstain |
| k8 | 16 | Alignment 51 M; National Religious Party 10 M; Independent Liberals 4 M; Progress and Development 2 U; Arab List for Bedouin and Villagers 1 U | ? members / ? outside; 62–46; 9 abstain |
| k8 | 17 | Alignment 51 M; Independent Liberals 4 M†; Ratz 3 M; Progress and Development 2 N; Arab List for Bedouin and Villagers 1 N | 61 members / 0 outside; 61–51; 5 abstain |
| k9 | 18 | Likud 43 M; Shlomtzion 2 M; National Religious Party 12 M; Agudat Yisrael 4 N; Flatto-Sharon 1 V† | 62 members / 0 outside; 63–53 |
| k10 | 19 | Likud 48 M; Agudat Yisrael 4 N; National Religious Party 6 M; Tami 3 M | 61 members / 0 outside; 61–58 |
| k10 | 20 | תחייה ? M; הליכוד ? M; תנועה למסורת ישראל ? M; התנועה להתחדשות ציונית חברתית ? M; חזית דתית לאומית ? M | ? members / ? outside; 60–53 |
| k11 | 21 | Likud 41 M; Alignment 37 M; Agudat Yisrael 2 N; National Religious Party 4 M; Shinui 3 M; Shas 4 M; Morasha 2 N; Yahad 3 M; Ometz 1 M | 97 members / 0 outside; 89–18 |
| k11 | 22 | הליכוד ? M; מערך ? M; התאחדות הספרדים שומרי תורה - תנועת ש"ס ? M; מפלגה דתית לאומית ? M; אומץ ? M; שינוי ? M | ? members / ? outside; not recovered |
| k12 | 23 | Likud 40 M; Alignment 39 M; Agudat Yisrael 5 U; National Religious Party 5 U; Shas 6 M | ? members / ? outside; 84–19 |
| k12 | 24 | הליכוד ? M; מפלגה לקידום הרעיון הציוני ? M; מפלגה דתית לאומית ? M; צומת ? M; התאחדות הספרדים שומרי תורה - תנועת ש"ס ? M | ? members / ? outside; 62–57 |
| k13 | 25 | Labor 44 M; Meretz 12 M; Shas 6 M; Hadash 3 O†; Arab Democratic Party 2 O† | 62 members / 5 outside; 67–53 |
| k13 | 26 | יעוד ? M; מפלגת העבודה הישראלית ? M; מרצ ? M | ? members / ? outside; 62–8; 38 abstain |
| k14 | 27 | Likud–Gesher–Tzomet 32 M; Shas 10 M; NRP 9 M; Yisrael BaAliyah 7 M; UTJ 4 U; Third Way 4 M | ? members / ? outside; 62–50 |
| k15 | 28 | One Israel 26 M; Shas 17 M; Meretz 10 M; Yisrael BaAliyah 6 M; Centre Party 6 M; NRP 5 M; UTJ 5 N† | 75 members / 0 outside; not recovered |
| k15 | 29 | ש"ס ? M; ישראל אחת ? M; הליכוד ? M; האיחוד הלאומי - ישראל ביתנו ? M; ישראל בעלייה ? M | ? members / ? outside; 72–21 |
| k16 | 30 | Likud 38 M; Shinui 15 M; National Union 7 M; National Religious Party 6 N; Yisrael BaAliyah 2 U | ? members / ? outside; 66–48 |
| k17 | 31 | Kadima 29 M; Labor–Meimad 19 M; Shas 12 M; Gil (Pensioners) 7 M | 67 members / 0 outside; 65–49 |
| k18 | 32 | Likud 27 M; Yisrael Beiteinu 15 M; Labor 13 M; Shas 11 M; Jewish Home 3 M | 69 members / 0 outside; 69–45 |
| k19 | 33 | Likud–Yisrael Beiteinu 31 M; Yesh Atid 19 M; Jewish Home 12 M; Hatnuah 6 M | 68 members / 0 outside; 68–48 |
| k20 | 34 | Likud 30 M; Kulanu 10 M; Jewish Home 8 M; Shas 7 M; United Torah Judaism 6 U | ? members / ? outside; 61–59 |
| k21 | — | No new government recorded | — |
| k22 | — | No new government recorded | — |
| k23 | 35 | Likud 36 M; Shas 9 M; United Torah Judaism 7 M; Blue and White 17 M; Labor–Gesher–Meretz 3 M; Yamina 1 M | 73 members / 0 outside; 73–46 |
| k24 | 36 | Yesh Atid 17 M; Blue and White 8 M; Yamina 7 M; Labor 7 M; Yisrael Beiteinu 7 M; New Hope 6 M; Meretz 6 M; Ra'am 4 N | 62 members / 0 outside; 60–59; 1 abstain |
| k25 | 37 | Likud 32 M; Religious Zionism 14 M; Shas 11 M; United Torah Judaism 7 M | 64 members / 0 outside; 63–54 |
| k26 | — | No new government recorded | — |

## Named exceptions and the three requested early cases

- **Government 1 (1949):** Ben-Gurion’s [presentation](https://main.knesset.gov.il/mk/government/documents/gov1.pdf), p.3, explicitly enumerates the four governing factions (Mapai, United Religious Front, Progressives, Sephardim), 71 seats. The retained [roll-call tabulation](https://fs.knesset.gov.il/1/Plenum/1_ptm_250182.pdf) documents support by WIZO’s Rachel Cohen-Kagan, Yemenite representative Zecharia Gluska and the Nazareth list. They are provisionally V, not promoted to formal members or arranged outside support. No agreement/continuing pledge was recovered. WIZO/Yemenite **votes are established; their arrangement status remains unresolved**, not proved absent. Nazareth’s two seats remain separate as well. The bridge is 71 + 4 − absent Yitzhak Ben-Zvi and Avraham Granovsky = 73 for; 45 against. The original 75-seat supporting-list envelope is not a 75-member coalition.
- **Government 18 (1977):** [plenum record](https://fs.knesset.gov.il/9/Plenum/9_ptm_254065.pdf), Aguda speech, explicitly distinguishes coalition accession from cabinet participation. Thus Aguda is N. Moshe Dayan is an individual M (Foreign Minister), elected on Alignment; Alignment is not added. Flatto-Sharon’s positive vote is established by the retained protocol and [contemporary JTA](https://www.jta.org/archive/begin-takes-oath-of-office-after-long-debate-in-knesset). No contemporary pledge, agreement or promised office was recovered after targeted searches; V is provisional, not a claim that no arrangement existed. Extradition legislation, campaign promises and later immunity disputes do not prove an investiture bargain. Bridge: 61 faction members + Dayan 1 = 62 members; + Flatto-Sharon 1 = 63 for, 53 against. Four MKs did not vote.
- **Government 21 (1984):** the [official formation speech](https://www.gov.il/BlobFolder/generalpage/gov21/he/part21.pdf), printed pp.95–96, names Aguda and Morasha as members. They have no formation-day cabinet ministry. Alignment contributes 37, not all 44 election seats. Six Mapam MKs (Victor Shem-Tov, Elazar Granot, Yair Tsaban, Amira Sartani, Muhammad Wattad, Haika Grossman) and Yossi Sarid are individually recorded as excluded; personal roll-call votes remain unknown. [JTA](https://www.jta.org/archive/peres-defends-new-government) establishes party opposition, not each individual’s vote. They are already excluded from 37, so are not subtracted again. Member total 97 versus 89 votes for leaves an eight-vote membership gap requiring the individual roll call.
- **Government 24 (1990):** [JTA’s formation report](https://www.jta.org/archive/shamir-government-wins-approval-in-the-knesset-by-a-vote-of-62-57) identifies Eliezer Mizrachi’s separate support deal and Avraham Verdiger’s abstention. Both are individual records from Aguda, not an Aguda-wide affiliation. Mizrachi’s O is provisional pending the agreement’s formal membership terms; Verdiger’s abstention is not labelled arranged. The government’s complete membership total remains unknown.
- **Government 25 (1992):** the [contemporary formation report](https://www.jta.org/archive/rabin-becomes-prime-minister-with-pledge-to-work-for-peace) identifies 62 members and the five Hadash/ADP votes, including ADP’s announced year of credit. The [retrospective account](https://www.972mag.com/palestinian-citizens-israel-coalition-elections/) describes the continuing blocking bloc outside coalition membership. Both are O, provisionally for the arrangement’s exact commencement/terms, not M/N. Bridge: 62 + 5 = 67 for, 53 against. The original signed support instrument was not inspected.
- **Government 36 (2021):** [official Knesset announcement](https://main.knesset.gov.il/EN/News/PressReleases/Pages/press14621d.aspx) records 60–59 with one abstention. [N12’s full roll call](https://www.mako.co.il/news-politics/2021_q2/Article-61ff3bc2da60a71027.htm) identifies Amichai Chikli voting against and Said al-Harumi abstaining. Both remain individual exceptions within their elected lists’ counts. Bridge: 62 member-list seats − Chikli − al-Harumi = 60 for; 58 opposition seats + Chikli = 59 against; one abstention. Al-Harumi is not classified as arranged outside abstention.

## Raam: membership and office are separate

Raam is N in government 36. The existing June 2021 formation report names it among the eight coalition parties. Complete [government-36 deputy appointments](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PersonToPosition?$filter=GovernmentNum%20eq%2036%20and%20PositionID%20eq%2040&$format=json) return 11 records for seven people: Abir Kara, Idan Roll, Alon Schuster, Yoav Segalovitz, Yair Golan, Meir Yitzhak Halevi and Matan Kahana. **No Raam MK appears**, and the formation-day cabinet roster likewise contains no Raam minister. Mansour Abbas’s deputy-speaker office is not a deputy ministry.

Counterevidence: [The National, 24 June 2021](https://www.thenationalnews.com/mena/ra-am-who-are-israel-s-first-arab-party-in-government-1.1248411) says Abbas took a deputy-minister role; subsequent reporting distinguishes a proposed post. The official appointment roster does not substantiate appointment, either at formation or later. Do not repeat the appointment claim as fact. Confidence is high for the official roster’s negative result within government 36, with the journalistic disagreement disclosed.

## 1981 tasking date: still unresolved, with the deciding records identified

The discrepancy was **not settled by a newly inspected primary document**. Do not manufacture an announcement-on-15th/letter-on-16th narrative. [JTA’s announcement item](https://www.jta.org/archive/navon-says-he-will-invite-begin-to-form-a-new-government) is published 15 July and schedules the official meeting for the following morning relative to its dispatch. [The tasking item](https://www.jta.org/archive/begin-starts-task-of-forming-new-government) is published 16 July and describes the summons as occurring that day relative to its dispatch. The website publication date is not proof of the original dispatch dateline. The retained UPI research places the appointment on 15 July; the [State Archives account](https://catalog.archives.gov.il/site/chapter/navon-and-10-knesset-election/) describes the presidential letter as dated 16 July. No independent evidence here proves two separate appointments.

The decisive records are the original Navon-to-Begin tasking letter in **Israel State Archives נ-571/13, pp.5–7**, and Navon’s diary/consultation material in **נ-224/4**, already located by the earlier research. Their date, delivery notation and diary appointment would distinguish an announcement/meeting from the formal written act. The catalogue returned HTTP 403 in this pass; original JTA PDF requests failed at transport, and UPI returned 403. No access control was bypassed. The inherited press date remains explicitly disputed in k10; it is not presented as settled historical fact.

## 1988 recommendations: zero newly authenticated entries

**Update 7 November:** under the new [source policy](../source-policy.md), Degel is none (probable) and the three Arab lists recommended Peres conditionally (provisional); see [evidence-policy-pass-1107.md](evidence-policy-pass-1107.md). The same pass made Nazareth (1949) a probable member without ministries, recorded the Yemenite role as disputed and kept the 1981 tasking date disputed.

The 63/55/2 → 63/49/8 change is **k12 (1988)**. Still unconfirmed: Hadash (4), Progressive List for Peace (1), Arab Democratic Party (1), Degel HaTorah (2). No entries were filled by subtraction from an aggregate.

The [JTA 9 November report](https://www.jta.org/archive/fate-of-next-government-hangs-on-outcome-of-shas-party-session) names the other small parties’ preferences and schedules the religious delegations for 13 November, but does not establish these four final positions. The +972/Local Call retrospective explicitly attributes conditional Peres recommendations to the three Arab lists; it is a secondary report of the claimed positions, not a newly authenticated presidential consultation record. Its condition about addressing civic inequalities must not be dropped. Degel’s reported preference for a broad Labor–Likud government is not automatically a personal recommendation or a formal no-recommendation.

For **each** of Hadash, PLP, ADP and Degel, obtain the delegation’s consultation minutes or received recommendation letter in President Chaim Herzog’s **November 1988 formation-consultation records, 7–13 November**, held by the President’s House/Israel State Archives. The exact catalogue shelfmark was not recovered and is not invented. Those records would establish the wording, nominee, conditions and any subsequent revision. Candidate-facing `noteEn` and `noteHe` identify this specific evidence need. Totals remain 63 / 49 / 8, not a certified 63 / 55 / 2.

## Provenance, challenge pass and handoff

The JSON entries are the compact claim ledger: path = claim ID; source ID resolves to publisher/kind/access date/URL; quote or labelled extracted fields show the basis. `certainty`, `note`, `roleGap` and reconciliation are the conclusion map and limits. Official API rows and joins are not verbatim prose quotations. The ministerial roster, faction-membership join and Knesset presentation are related official records, not automatically independent corroborations. Existing source quotations retain their prior access dates and original verification limits.

Newly inspected: all pages of 37 ministerial API queries, the complete government-36 deputy query, relevant government presentations, 1977/1981 plenum text and the named contemporary JTA reports. `data/meta/government-support-evidence.json` retains the unique official first-day tabulations with record IDs and representing-faction joins, plus the complete deputy roster. It is sufficient to audit the positive ministry claims without retaining every download. Inclusive date boundaries can contain transition records; no complete parliamentary seat count was inferred from those joins. Non-MK ministers were not automatically assigned to a faction from their previous Knesset affiliation.

Direct HTTP used `israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)`. Hosted web search/read tools do not expose their transport headers; their User-Agent is unverified. English Wikipedia and mirrors were excluded as evidence; incidental search results were not opened or used. No 429 response was observed. No login, paywall or challenge bypass was attempted. Search volume/page-depth totals were not measured; opening a historical archive page is not independent confirmation of the underlying claim.

Remaining work is concrete: original support agreements for early satellite lists/WIZO/Yemenites/Flatto-Sharon; complete later-government membership (particularly split factions and members without ministries); missing individual roll calls; the two presidential files for 1981; and the four delegation records for 1988. These are evidence gaps, not owner preference questions. This pass must not be presented as full completion of task A, C or D. The existing runtime first-government bloc schemes retain their prior support-inclusive meaning; UI/schema-consumer migration belongs to the separate lane.

## Verification

Regenerate official API evidence using the query URLs embedded in the evidence file, following every `odata.nextLink`; join by `PersonID` to the retained faction records at the snapshot date. This reproduces the extraction method, not a guarantee that a live endpoint never changes. The retained tabulations preserve the accepted values. Run `npm run data:build`, `npx tsc -p tsconfig.json --noEmit`, and `npx vitest run --maxWorkers=2`. Temporary downloads, extracted text, dependency links and test logs belong under `.backup-scratch/r4/` and are not committed. No UI changed, so no screenshots or browser/e2e claims are made.

Verification outcome: all 38 snapshots pass the overlay validator; TypeScript passes; the focused regression set passes 16 tests. The full suite passes 979 tests across 105 files with child-process permission (the restricted run denied the existing gallery test’s Node spawn). The data build writes no runtime datasets (38 unchanged). Browser checks and screenshots are not applicable to this research/schema-only change.
