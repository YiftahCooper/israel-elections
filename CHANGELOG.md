# Changelog

## 7 November 2026 — Settings

- Edit marks (13 Nov, audit): the “Edited” note on a list's candidates says what changed, not the whole former list: “Edited: moved: Aryeh Deri 1 → 2, Yinon Azoulay 2 → 1”, “added: …”, “removed: …”, “renamed: … → …” (Hebrew “נערך: הזזה: …”, “הוספה”, “הסרה”, “שינוי שם”), at most three names each, and the same short text for screen readers and in exported files. A candidate is named in English only by their official English name, else in Hebrew; the note listed about 150 names, most spelled out letter by letter (“'mvs drvr dvd”).
- Seat card (13 Nov, audit): the place a member had on the list is their place on the full list, not the seat's number. 1999 Shas's first seat reads “Arieh Gamliel · rank 2” (it read rank 1; Aryeh Deri, No. 1, resigned before the Knesset opened), 1992 Likud's second seat “Ariel Sharon · rank 3”. Every seat after a candidate who was not seated (1949, 1961, 1988, 1992, 1996, 1999) was one place too high; a test checks every seat of every election against the stored list.
- Chamber key (13 Nov, audit): a joint list counted by party keeps its members with no recorded party in the key and in the lists column, as “Party not recorded · Hadash 1” (Hebrew “מפלגה לא מתועדת · חד״ש”), so 1977 Hadash adds up to its 5 seats and 1999's United Arab List to its 5. The key now follows the chamber: lists in the order their seats are drawn, a list counted by party expanded into its parties where it sits, and every row starts with a dot in its seats' colours (Likud 40 no longer comes after Shinui 2 in 1988).
- Blocks layout (13 Nov, audit): a second click on a seat of the chosen list closes it, as in the arc.
- Exported chamber (13 Nov, audit): the PNG and SVG name the grouping they shade (“Pre-election blocs · 27 Oct 2026”) and give one line per bloc with its seats out of 120; a long name in the key is shortened at a whole word, the party's name before the list's, so the list's name always stays (it was cut mid-word, and the list's name was the part lost).
- Export the chamber (13 Nov, audit): the PNG and SVG buttons open beside the “Export the chamber” chip at the top of the chamber; they opened under the key, out of view at Simple.
- Chamber key (13 Nov, audit): more room between the key's entries, so a number is not read as the next entry's.
- Seats waffle (13 Nov, audit): the key shows every colour the waffle uses: a list counted by party gets a row per party (“Meretz · The Democrats 1”), with the list's colour and a small inner square in the party's colour, as in the chamber.
- Lists column (13 Nov, audit): an edited list's votes carry the “Edited” mark beside the figure even with the list's panel closed; the mark beside the name stays for a renamed or withdrawn list. A list that only gave or received votes because another list was edited carries none.
- Walkthrough (13 Nov, audit): the “Edited” mark keeps a gap before the vote figure, and the figures stay on one line and in one column.
- Step-size switch (13 Nov, audit): the “1 / 1k / 10k” switch beside a number has one size everywhere (Rules, Turnout, the list's panel, the bloc editor) and never wraps; on phones its buttons keep 44px touch targets. The lone “Settings…” button on Rules is no longer stretched across the page.
- List panel (13 Nov, audit): “Votes per seat won” in Hebrew reads “ממוצע קולות למנדט” (it read “קולות למנדט”, the Overview card's name for the quota, a different figure).
- Sensitivity (13 Nov, audit): with Large text on, choosing a row with the keyboard brings it just under the table's header. It overshot, and on phones the table grew to some 2,000 pixels of blank space to make room.
- Knesset on a date (13 Nov, audit): switching election keeps the timeline's date only when it falls inside the new Knesset's term; any other date starts at the term's first step (going from the 25th Knesset to the 24th landed on the 24th's last step).
- Qualifying votes (13 Nov, audit): with no threshold (1949) the card says “No threshold: all 21 lists take part; 12 won a seat”, and its (i) says that only lists with a whole quota share the remaining seats and that 19,424 valid votes went to lists that won no seat. It said 21 lists “passed the threshold” and that 0 votes went to lists that did not. The quota card's (i) says “All valid votes (there is no threshold)” for 1949.
- MK history and the seat card (13 Nov, audit): days for which the Knesset's own rows record no faction are no longer left blank. Yaakov Litzman's first two days of the 24th Knesset (6–8 April 2021) read “Faction not recorded” (Hebrew “הסיעה לא תועדה”), with a hatched stretch on the bar; so do four shorter stretches of 2021–2026 (Bar Lev, Elharar, Distel, Eichler) and nine of 1953–2008. Erez Malul's second membership row of 20 July 2025, which ends before it starts, is shown as “A second membership record: dates not settled” and is not counted as time in the Knesset. The data-gaps register counts all fifteen.
- Glossary (13 Nov, audit): the polling-station entry now says the 800-voter limit is today's and gives 1949's (1,000, or 1,500 with the committee's approval, from the 1948 ordinance and its amendment); the second ballot box is cited to s.70(b), not s.68. The law texts behind the polling-area, list-letters, direct-election and Swedish-divisor entries are now kept in the repo (data/raw/law), and the entries point at them.
- Colours (13 Nov, audit): lists take the colour the research records for them in that election, and a joint list led by a party with that colour matches its leading seats (Yashar! 2026 light blue, not green; Together blue; Zionist Union 2015 and One Israel 1999 blue, not orange; the National Religious Party plum in every election).
- Chamber (13 Nov, audit): seats of different lists no longer share near-identical colours (2026: Yashar! and Yisrael Beiteinu, the Democrats and Yesh Atid, Otzma Yehudit and Hadash, Tkuma and Balad). The colour check now compares every two seat-winning parties of an election across lists, in all 26 elections.
- Localities (13 Nov, audit): “Find a locality” now finds a city typed in its usual English spelling (Beersheba, Petah Tikva, Bnei Brak, Herzliya, Eilat, Katzrin…). When nothing contains the typed letters, it also accepts the spellings CBS writes differently (q/k, w/v, b/v, tz/z, ei/e, doubled letters, apostrophes and hyphens).
- Logos (13 Nov, audit): Balad’s 2009 and 2013 logos, cream-and-gold outlines, are shown on a dark tile; on the light theme they were almost invisible.
- Party families (13 Nov, audit): an election’s breakdown gave a joint list’s whole seats as the family’s (Likud lineage 2013 under “Count all”: “31 seats; since 2009: +4”). It now gives the family’s own seats and its partners exactly as the seats chart does, whatever the mixed-list choice (“20 seats +11 partners”; “▼ −7 seats”); the list’s 31 stay on the list’s own row.
- Party families (13 Nov, audit): Centre 2026 counts Yesh Atid inside Together (Bennett): 5 seats, with Bennett’s 7 as partners, from the official candidate list (Yalkut HaPirsumim 15023), as it already counted National Unity in 2022. Yashar! and Reservists–New Economic stay under review.
- Party families (13 Nov, audit): “Did not contest” was printed whenever a family named no list (Russian-speaking 1992, although the Democracy and Aliyah list ran). It now reads “No list classified”; a year whose lists are only under review reads “Lists not yet classified”, and a total beside lists under review says “Some lists not yet classified”. The aliyah lists of 1981, 1984 and 1992 are named for review in the Russian-speaking family.
- Party families (13 Nov, audit): Radical right counts the 2003 National Union as a joint list with Yisrael Beiteinu as a partner (its 3 seats are no longer the family’s own), as the Russian-speaking family already did. Religious 2015 counts Yachad as its own and Otzma Yehudit as the partner, as the other religious families do.
- Party families (13 Nov, audit): “Definition, sources and limitations” lists only the sources the family’s own entries cite (the Radical right sheet listed Agudat Israel, Shas and UTJ profiles).
- Sensitivity (13 Nov, audit): an upside-down range now says “The second number must be above the first.” The line still named “To” and “from”, words the range boxes no longer show.
- Knesset on a date (13 Nov, audit): the timeline names each faction as the seat cards and MK history do, in English and Hebrew. Faction moves are written from the factions' records (25th Knesset, 13 Mar 2024: “from National Unity to National Right”, not “to New Hope / United Right”); the 2022 splits and mergers name National Unity, Beyahad, United Torah Judaism and Joint List (Hadash, Balad), not National Camp, Beyachad, UTJ or Joint List (Hadash and Balad). A test checks every faction move in all 26 Knessets against MK history.
- Knesset on a date (13 Nov, audit): a seat card says “Membership ended” (Hebrew “הכהונה הסתיימה”) where it said “Left the Knesset · reason not yet recorded”, as MK history does; a recorded reason still follows (“Membership ended · Resigned”).
- After the election (13 Nov, research): the government records say what the official registers and the Knesset record establish. Government 23 (1988): the National Religious Party and Agudat Yisrael were members without ministers on the day of the vote (Agudat Yisrael provisional). Government 27 (1996): United Torah Judaism was a member with a deputy minister, 66 member seats. Government 34 (2015): United Torah Judaism was a member, 61 member seats, equal to the 61 votes for. Government 30 (2003–2006) gains two changes: Shinui’s five ministers ceased to serve on 4 December 2004, and Labor-Meimad’s ministers joined on 10 January 2005 with Shimon Peres as Vice Prime Minister. Government 37 (2022–2026) lists its changes to January 2026, with Shas’s Abutbul, Maoz and Eichler.
- After the election (13 Nov, research): 1990 shows Herzog tasking Shamir on 27 April 1990 for 21 days, from Shamir’s own letter read to the Knesset on 11 June 1990; the day Peres was tasked is still not recorded. The 20th Knesset’s term gains the Nation-State Basic Law of 19 July 2018 (62 for, 55 against, 2 abstentions, vote 917). The Hebron massacre line (1994) states the 29 worshippers its sources give. Kach’s place in the 1984 recommendations says it was not invited to the consultations. Rehavam Ze’evi’s assassination (17 October 2001) is a term event of the 15th Knesset.
- Side by side (13 Nov): the “Key numbers and rules” rows copy without arrows, as the list rows do: a worded button beside your work’s figure that names where the number goes (“Copy to 2026”), and “⋯” with both directions in words. A copy that would change nothing is greyed and says “Already the same”. The row menus take the keyboard focus when they open, and their headings lost their arrows.
- Names (13 Nov, audit): Tzipi Livni's party is spelled Hatnuah throughout, as on its 2013 list; as a partner on the 2015 Zionist Union list it read Hatnua. A test now checks that no party carries two spellings of one English name.
- MK histories and lists (13 Nov, audit): Aryeh Deri's 1999 run as Shas's number 1 is tied to him by the official results notice, which records that he resigned from the list on 19 May 1999 (Reshumot 4757, p. 3378); his card in the 1999 lists now shows his English name, and his history no longer rests on the name rule for that run. Benny Begin, Moshe Arens, Micha Reisser, Moshe Dayan and Moshe Kol, who also gave up seats they were elected to, stay on the name rule: no stored official record names them as the elected candidate who gave up the seat.
- Party history and MK histories (13 Nov, audit): Yachad's April 2019 list and Zehut's September 2019 list, both withdrawn before the vote, are recorded as the lists of the registered parties Yachad and Zehut, as the official candidate gazettes name them (“מטעם המפלגות: יחד - בראשות אלי ישי”, “מטעם המפלגות: זהות - תנועה ישראלית יהודית”), not as one-election lists of their own. Their histories show those elections as not run, and Eli Yishai's card shows the April 2019 list with “The list withdrew before the election”, as Moshe Feiglin's does for September 2019.
- MK histories (13 Nov, audit): the 25th Knesset ends on 10 Nov 2026 on every member's card, as on the Knesset timeline. All 120 members who served to its end read “Membership ended” on 10 Nov and their bars stopped two days short, because the term ran to the date of the records (12 Nov); a member who left early (Israel Eichler, 21 Jan 2026) still has the line.
- Party history (13 Nov, audit): the full history's “won seats in … · most: …” counts the party's own elected members, as the solid part of the chart does, not the whole joint list it ran on. Kulanu now reads “most: 10 (2015)” (it read 36, Likud's 2020 list), Tzomet “most: 8 (1992)” (it read 32, Likud–Gesher–Tzomet 1996), Otzma Yehudit “won seats in 3” (none of its members was elected in April 2019). An election where a party's own members are not known counts in neither figure.
- Party history (13 Nov, audit): Hadash has one Hebrew name, חד״ש, from 1977, as in English. The 1977–1988 fronts were shown under three long legal names that differ only in punctuation, as if the party had been renamed three times; Sheli likewise reads שלי, not מחנה שלי.
- Compared with last time and Compare (13 Nov, audit): a list that withdrew before the election is treated as no list. Its own line says only “The list withdrew before the election” (Blue and White 2026 read “12 → 0”); Tzomet 2021 is a new list, not “0 → 663 votes” against its withdrawn 2020 list; and Compare no longer pairs National Unity 2022 with Blue and White's withdrawn 2026 list.
- Rules (13 Nov, audit): after experimental rules with a list in two surplus agreements (or one of three lists), “Official rules”, the law's rules chosen as a preset, or copying the law's rules from the compared side left the extra agreement on, and the exported file could not be imported. Every way back to the law's rules now switches off the agreements the law forbids (each list one agreement, with one other list), names them in a message with Undo (“Surplus agreement Labor ⇄ Meretz switched off: by law, each list may have one agreement, with one other list.” / “הסכם העודפים … כובה: לפי החוק, לכל רשימה הסכם אחד עם רשימה אחת.”), and the exported file always imports. Agreements started from a saved experiment under the law's rules are treated the same way.
- Localities (13 Nov, audit): when the locality results did not load, the tab showed a bare “Error: HTTP 500”. It now says “The locality results could not be loaded.” / “לא ניתן היה לטעון את התוצאות לפי יישובים.” with Try again; Turnout says the same where its voter groups need those results. A file of another shape is caught the same way instead of failing inside the screen. The map's coordinates and boundary lines, and the Sources list, have Try again too (Sources said “Reload to try again”).
- Tabs (13 Nov, audit): after a tab's code failed to download, Try again (and coming back to the tab) never loaded it; only reloading the page did. Try again and opening the tab now ask the server again.
- Seat safety and list details (13 Nov, audit): an exact tie at the boundary counted as winning the seat for some lists and as no change for others (2026 Joint List: 5,825 new voters gave the seat only by lot, 2022 Shas the same at 27,327). Every figure is now the first count at which the seat is certain, in every tool that searches; where fewer votes already bring a tie decided by lot, the figure carries * and says from how many votes (“A tie decided by lot is possible from 5,825 votes” / “שוויון שמוכרע בהגרלה אפשרי החל מ־5,825 קולות”); for 1951–1969, when the law set no rule for a tie, it says so. “Fewest votes to keep N seats” stops before the first count where a tie could cost a seat. Votes to flip a majority says the same.
- List details (13 Nov, audit): a seat count typed or stepped to that was found by sampling now says so when it is applied (“≤ Found by sampling: fewer votes may also give 12 seats.”). Under the 1977 candidate cap, a list whose every candidate already has a seat says “Not possible: every candidate on the list already has a seat”, not “No solution from this source”, here and in Seat safety.
- Saving (13 Nov, audit): with the app open in two tabs, a scenario saved in one tab was erased as soon as the other tab changed anything (a tool, a setting), and only one tab's unsaved work was kept for the next visit. Each tab now stores only what it changed itself, on top of what is stored, and takes in the other tab's saves and settings as they happen; the unsaved work of every open tab is kept. Saved comparisons, voter groups and personal families had the same fault and are fixed the same way.
- Start-up (13 Nov, audit): when last visit's open work could not be loaded (a dropped connection), the app opened 2026 in its place and the work was gone at the next change. Nothing stored changes now: a message says the unsaved work is not lost, and Try again reopens it. Try again after a failed link, saved scenario or comparison opens that link, scenario or comparison, not the plain election; the link stays in the address until it opens.
- Errors (13 Nov, audit): a data file made for another version of the app is fetched once more from the server, and if it still does not match, the message says the app and the data are of different versions, with Reload. A tool whose code could not be downloaded says so, with Try again and Reload. An error that no panel contained shows a message with Reload and Start fresh, never a blank page.
- Analysis (13 Nov, audit): results kept in the browser to save searching again are limited in number and size, oldest out first; if the browser's storage is full, saving your work clears them first, so a save is never refused for their sake. Results are kept per version of the calculation, so an update that changes it never shows old results.
- Colours (13 Nov, audit): opening a friend's link or a saved scenario that changes only colours no longer replaces your own colours for the official result; only your own edits of the official result change them.
- Compare (12 Nov, audit): comparing 1992 with 1988 called Hadash a new list and the 1988 Hadash ended (also Sheli 1981 with 1977), while “compared with last time” paired them. Both now follow the recorded continuity of the Hadash and Sheli fronts, so Hadash and Sheli are “Same” and their votes can be copied; a test checks over all 26 elections that every list “compared with last time” counts sits in the same Compare row. Lists of one organisation stored under two records (Tami 1981–84, HaOlam HaZeh, the Sephardim and Yemenite lists) read “Same”, not “Renamed”.
- Compare (12 Nov, audit): a list whose small partner moved to another list is no longer tagged “Split” (Likud 2021 → 2022, Atid Ehad; National Unity 2022 → Blue and White 2026; Balad and Hadash–Ta’al); it reads “Same” with the partner noted as moved on. “Split” is kept for a list spread over several lists.
- Compare (12 Nov, audit): with a later election as the reference, the line under each list said lists that ran together later had split (2022 Labor: “2026: 8 · The Democrats (split into 2)”). It now says what happened: “(ran jointly)” (Hebrew “(רצו יחד)”), or “(merged)” for a recorded merger (General Zionists 1959 → Liberal Party 1961); a real split names its successors on either side (“split into 3”).
- Compared with last time (12 Nov, audit): the Union of Right-Wing Parties (April 2019) was compared with Jewish Home + Yachad 2015 (−6.01 pp), counting Eli Yishai's Yachad, which did not join it. A list whose leading party did not run no longer counts on a partner's new list: it is now Jewish Home 8 → 5, −3.04 pp, with Otzma Yehudit not counted. The same rule changes one more comparison: Agudat Yisrael 1988 is compared with Agudat Yisrael 1984 (2 → 5), with Poalei Agudat Yisrael not counted (it ran inside Morasha), instead of Agudat Yisrael + Morasha (4 → 5).
- Side by side (12 Nov, audit): the arrows that copy surplus agreements, turnout or the seat method were disabled whenever both sides showed the same figure (six agreements each in 2026 and 2021, a turnout that rounds alike, the same method name), although the copy would change them. An arrow now rests only when the copy would change nothing.
- Scenarios (12 Nov, audit): a saved comparison's card repeated its years in reverse (“2026 ↔ 2022”, then “2022 ↔ 2026”) and showed “2019 ↔ 2019” for the two 2019 elections; it now says the years once, with the month when two elections share a year.
- Coalitions (12 Nov, audit): the satellite-list preset is named after that year’s party: Mapai to 1961, the Alignment from 1965 (it read “Mapai/Alignment” in 1951, 1961, 1965, 1969 and 1977). Every first-government preset now has one title, “Government 19 (first government of the Knesset)”, and one blue and grey pair; 1981–2006 had their own wording and green, 2009–2022 a third wording.
- After the election (12 Nov, audit): the recommendations bar shows who recommended whom. A bracket spans each group’s run of the bar, with the name and seats under it, left to right in Hebrew too; in Hebrew the names had read right to left, so “גדי איזנקוט 67” sat under Netanyahu’s block.
- After the election (12 Nov, audit): a mandate still running (2026) is drawn inside the formation timeline as an open bar, “Gadi Eisenkot · ongoing” beside it, the line running to the day the record was checked. It was a grey square past the end of the line, its name at the other end.
- After the election (12 Nov, audit): the chamber of the Knesset on a date has the Overview chamber’s list key (slip, name, seats held on the shown date), so its colours name their lists.
- After the election (12 Nov, audit): the next-election button names the Knesset (“2020 · 23rd Knesset”, not a bare “23”), and the dissolution that ended the term is no longer listed a second time at the foot of the page (April 2019, September 2019, 2020).
- After the election (12 Nov, audit): events are listed in the order they happened: the 1967 unity government before the Six-Day War, Sharett’s tasking before the 29 Jun 1955 confidence vote, the Coastal Road massacre before Operation Litani. Same-day steps follow an ordering field that names its source.
- Sources (12 Nov, audit): the election’s own data status and sources come first; the After the election sources follow, one row per address, each with its publisher’s name (in Hebrew the publisher’s own Hebrew name where it has one, never a web address when a name is recorded), its kind and the date it was retrieved.
- Phones and Large text (12 Nov, audit): with Text size Large, the full-screen Party history, MK history and party family sheets were 15% taller than the screen, so their title, close button and bottom could not be reached; every sheet, dialog, menu and pop-up now fits the screen at any text size and scrolls inside.
- Phones and Large text (12 Nov, audit): with Text size Large, the bloc panel opened scrolled too far (the chosen bloc under the header); it, the Lists column, Settings and the tools strip now scroll exactly to the item.
- List panel (12 Nov, audit): on a phone the History chart and its note were wider than the panel, cutting off the latest elections in English and the first ones in Hebrew; they now fit at every width.
- List panel (12 Nov, audit): on a phone, a list whose seats did not change showed a bare “from the official result”; it now reads “No change from the official result”.
- What if (12 Nov, audit): on a phone a long list name ran under “Open as a scenario” and hid its seat change; the name now wraps and the change stays in view.
- Side by side (12 Nov, audit): the change column was drawn over the “Copy votes…” button on tablets and desktops (the stacked numbers in a 28px slot); the change now sits beside the button or above it. On phones the list name had 0–67px; it keeps at least 7rem and the change wraps.
- Sensitivity (12 Nov, audit): in Hebrew the range rows read backwards (“from” and “to” after their numbers); each row now has one label, “Vote range” / “Threshold range”, then the two boxes low to high with a dash, as on the chart. At 360px the two result tables now fit their box.
- Dates (12 Nov, audit): About (“This election”) and the 1996–1999 Prime Minister panel showed dates as 2026-09-24; they now use the app's date format (24 Sept 2026).
- Top bar (12 Nov, audit): the election selector cut its own name on a desktop (“September 2019 · 22n…”) and on phones (“2026 · 2…”); its slot now fits the longest name, and on phones the name sits on two short lines (year, then the Knesset).
- Change line (12 Nov, audit): on a phone the (i) of “No changes” fell onto a line of its own; it now sits right after the label.
- Keyboard (12 Nov, audit): opening a list from the keyboard now puts focus on its panel's heading, so the next Tab is inside the panel (it took 45 presses to get there); the Blocs panel does the same. Closing either, an MK's history, a party's full history or a Compare dialog gives focus back to the control that opened it (it went to the top of the page). An MK's history opened from a seat card returns to the card. Opening with the mouse leaves focus where it was.
- Keyboard (12 Nov, audit): after an edit, Tab past its “Edited” marker went to the end of the page, so the chamber, blocs and figures could no longer be reached by Tab. Tab now goes from the marker into its popup (Restore) and on to what follows the marker; the same for Compare's marks and its row menu.
- Keyboard (12 Nov, audit): Save & share, About, the phone Menu, a figure's details and History close when focus moves outside them, so they no longer hide the control that has focus.
- Keyboard (12 Nov, audit): rounded percentages are no longer Tab stops (Charts had 21, Turnout 34). A screen reader gets each one's exact value as its description; on the keyboard, each table, list or section has one “Exact values” switch, seen only while it has focus, that shows its values exactly in place. Hover and tap show the exact value as before.
- Screen readers (12 Nov, audit): Rules → Quota rounding had no name, and clicking the words “Quota rounding”, “Threshold %” or “Votes come from” opened the (i) instead of the field; the words now name and focus their field, and a rule's checkbox no longer repeats its name. The page has a top heading (the app's name).
- Screen readers (12 Nov, audit): text in the other language is marked as such, so it is read in the right voice: the language buttons (named “עברית” and “English”), a term's Hebrew name in the (i) and on Sources, ballot letters in the walkthrough, and the language choice in Settings.
- Contrast (12 Nov, audit): the focus ring on the top band was 2.27:1 against the navy band; it now takes the band's own ink (white on navy, black or white on a scenario colour). While a list is open the other rows fade their logo and bar only: their names and numbers stay readable (they fell to 3.22:1).
- Knesset on a date (12 Nov, audit): the 25th Knesset's timeline now ends on 10 Nov 2026, the day the 26th opened, with one closing line and the chamber as it stood on its last day (Coalition 61). Its last step showed an empty chamber (0 seats) and, with seat changes on, 120 members “leaving”; the bar ran to 12 Nov, the date the records were taken. A term whose members' records have all closed ends on that day, as every earlier term does.
- Knesset on a date (12 Nov, audit): United Torah Judaism is one faction of two parties. On 14 Jul 2025 only Degel HaTorah's four MKs now leave the coalition (Coalition 64), and Agudat Yisrael's three on 15 Jul (Coalition 61); all seven left on the 14th and the 15th moved no one.
- Levels (12 Nov, audit): on the Custom page, Show on a tool now brings it into this level's tabs and Collapsed puts it with the muted tools after “More in other levels” (both did nothing before). A tool set to Hidden is no longer opened by a saved comparison (it opens on the Overview's comparison strip instead).
- Levels (12 Nov, audit): choosing a level no longer throws away your Custom choices silently: a message says “Custom choices cleared” with Undo, which brings back the same choices. Settings shows Custom as the level in force, as the top bar does.
- Levels (12 Nov, audit): “Open on: Last tool” reopens After the election too. Side by side is listed on the Custom page as shown at every level, as it is, with Show or Hidden only. Merge lists' folded section is called “Merged list details” (it was “Split list identity”).
- List details (12 Nov, audit): a list's notes on the sources show at every level (they were folded away at Simple and could be hidden), and a candidate marked “not seated” has an (i) with the reason, for example Moshe Dayan in Mapai, 1949. At Simple, “Who gets in” says when it lists only the first 10 (“first 10 of 32”), then offers “Show all 32 elected” before the full roster.
- Party history (12 Nov, audit): a party's English and Hebrew names at one election name the same thing, following the official list records. Tkuma, which submitted its lists of 2015–2026 as האיחוד הלאומי – תקומה (still its registered name), is “National Union–Tkuma” in English for those years, not “Religious Zionist Party”; Ehud Barak's party in September 2019 is “Independence” (מפלגת העצמאות), not “Israel Democratic Party”. Tkuma in 2009 and 2013 and New Hope in 2026 are left as they were: the stored records do not settle them.
- All screens (12 Nov, audit): list and party names in English use one apostrophe, the straight one, as people's names do: Ra'am–Ta'al, Hadash–Ta'al, Da'am, Women's Party, U'Bizchutan read the same in every election.
- MK histories (12 Nov, audit): an end of membership with no recorded reason reads “Membership ended” / “הכהונה הסתיימה”, not “Left the Knesset”, which suggested a choice: the Knesset records give no reason for any end, among them Yitzhak Rabin's (assassinated, 4 Nov 1995) and Rehavam Ze'evi's (murdered by terrorists, 17 Oct 2001). The Hebrew no longer depends on the member's gender.
- MK histories (12 Nov, audit): a member's English name is the one the lists show. The card no longer repeats the Knesset website's misprints (“Moseh Zeev Feldman”, “Yeushua Sagi” are Moshe Zeev Feldman and Yehoshua Sagi) or its backticks for apostrophes (Meir Pa'il, Ra'anan Cohen, Ze'ev Boim, Moshe Ya'alon, Yedidia Be'eri, Ahmad Sa'd, David Re'em).
- MK histories and Party history (12 Nov, audit): a list that withdrew before the vote is no longer shown as a run that “got 0%, below the threshold”. The MK card says “The list withdrew before the election” (Benny Gantz, Blue and White 2026; Moshe Feiglin, Zehut September 2019) and does not count it in “on a list in N elections”; Party history shows that election as not run (Blue and White 2026, Tzomet 2020), and a party whose only list withdrew says it did not run in any election.
- MK histories (12 Nov, audit): nine members of the 25th Knesset (Tzvika Foghel, Boaz Bismuth, Almog Cohen, Eliyahu Revivo, Eli Dallal, Debbie Biton, Limor Sonn Har Melech, Naor Shiri, Sharon Nir) had no 2022 run, and their names in the 2022 lists did not open their history: their Knesset member record is official, only the Wikipedia link is probable, and that hid the run. They are now linked as the comparison already links them. Elected candidates who did not take their seat are linked by the name rule in every election, not only from 2009: Aryeh Deri and Benny Begin (1999, No. 1 of Shas and of National Union), Moshe Arens (1992), Ora Namir (1996), Michael Reisser (1988), Moshe Dayan and Moshe Kol (1949) now show that run as “Elected; did not sit”, with how it is linked behind the (i).
- Lists and seat cards (12 Nov, audit): the 21 candidates whose Knesset member record is official but whose Wikipedia link is probable no longer say “(probable match) — matched by name”; they say the other links are probable, and the seat card names them as the Knesset does. The 1977 Likud ranks 21 and 24, both printed כהן יגאל, no longer carry two different English names: which rank is which person is not certain.
- MK histories and seat cards (12 Nov, audit): a faction is shown under the name the Knesset recorded for it, in Hebrew and in English. A list's short name now stands only for the list's own faction, formed by its elected members at the first sitting; 70 other factions had taken a partner's name, a later party's or an unrelated list's. Joint factions keep every partner (Agudat Yisrael–Poalei Agudat Yisrael 1955, Likud–Tzomet 1999, National Union–Yisrael Beiteinu 2000, Labor–Meimad–Am Ehad 2005, Jewish Home–National Union 2019, Yesh Atid–Telem 2020, Blue and White–National Unity 2025 and more); Paritzky's 2005 Tzalash is no longer “New Right”, Flatto-Sharon's 1978 Development and Peace no longer “Flatto-Sharon”, Agudat Yisrael's 1977 faction no longer “UTJ”, and the 1975 Yaad–Civil Rights Movement and the 1984 Gesher – Zionist Religious Centre no longer take the names and colours of the 1981 Yaad list and the 2019 Gesher. The National Religious Party's faction reads “National Religious Party” in every Knesset (it read “NRP” in 1992–2003).
- MK histories (12 Nov, audit): a change of faction never reads “X (until then X)”. Where two factions are shown under one list's name, the line gives their recorded names: “Labor (until then Labor led by Ehud Barak)”, “Blue and White (until then Blue and White led by Benjamin Gantz)”.
- Votes → seats (12 Nov, audit): a wide range is now complete, not sampled: every change between the checked counts is found, so “Checked every 27 votes … a change could be missed” no longer appears. The test corpus had six ranges where the sampled chart missed a change that reversed within a step; each now matches a vote-by-vote scan. A wide range for a large list takes a few seconds longer.
- Votes to flip a majority (12 Nov, audit): “At most 72,101” (2022, coalition bloc) was the proven minimum. Pairs the first search could not settle are now searched again, every count below the answer; the answer then shows without “At most” unless a pair is still open. The first answer shows meanwhile, marked “at most”.
- Seat safety (12 Nov, audit): under the 1977 candidate cap a list with as many seats as candidates (Flatto-Sharon, one candidate) showed “?” for gaining a seat; it now shows “—”, not possible. The list's own seat target says the same.
- Lists (12 Nov, audit): deleting a list that had withdrawn left its ballots counted as invalid for good; they now leave with it (2022: withdraw Religious Zionism and delete it, and invalid ballots go back from 546,321 to 29,851). Merging or splitting a withdrawn list is refused until it is restored, as its votes are.
- Rules (12 Nov, audit): the “Alternative electoral system” banner now names every way the rules differ from the election's law, among them the 1977 candidate cap, ties, rounding of averages, repeated remainder seats and the 1949 agreement condition (1977 with the 1973 rules moved two seats and said nothing); “quota rounded down” and “agreements count only if every partner passes the threshold” are no longer worded the wrong way round.
- Scenarios (12 Nov, audit): opening a saved scenario, a share link or a comparison of another election no longer deletes the unsaved work kept for that election; it stays in the scenario switcher.
- Scenarios (12 Nov, audit): a saved scenario that only changes colours was taken for the official result, so the switcher could not go back to the official result; it is now its own scenario.
- Mark changes since (12 Nov, audit): the answer “For this scenario” is now remembered after a reload.
- Links (12 Nov, audit): a step in a share link, saved scenario or kept work that this version cannot read is no longer silently skipped; it is counted in the “could not be re-applied” notice. A link that names an unknown election or has no list of changes is reported as damaged, not as a connection failure.
- Start (12 Nov, audit): an election picked while the last visit is still being restored is no longer undone by the restore; the restored work is kept in the scenario switcher.
- Duplicate (12 Nov, audit): when the browser refuses to save a duplicate, the original stays open with its undo history.
- Start (12 Nov, audit): unsaved work restored after a data correction now says the data was rebuilt, as share links and saved scenarios do.
- Start (12 Nov, audit): whatever this browser kept that cannot be read is now said in one line (saved scenarios, saved comparisons, unsaved work, settings), and everything readable is kept: one damaged saved scenario or one damaged part of the last visit's work no longer takes the rest with it.
- Data (12 Nov, audit): an election data file from another version of the app shows the “Could not load” message with Try again instead of a blank page.
- Party history (12 Nov, audit): HaOlam HaZeh's history continues as Meri. The Knesset renamed its faction מחנה רדיקלי ישראלי on 3 Jul 1973, shown as a rename; the list ran as מרי (העולם הזה – כח חדש) that December. The date is the faction's; the party's legal rename date is not known.
- Party history (12 Nov, audit): the State List's history starts with its own 1969 list (National List, 4 seats) and continues inside Likud in 1973; they were two separate histories. The link rests on the Israel Democracy Institute's party profiles, so it is marked probable.
- Party history (12 Nov, audit): each election shows the name the party ran under then, never a later one. New Right in April 2019 to 2020 is New Right, not Yamina (the joint list formed for September 2019); also Tkuma before 2021 (not “Religious Zionist Party”), Israel Resilience in 2019–2020 (not Blue and White), Otzma Leyisrael in 2013, Renewed Religious National Zionism in 2006 and New Hope in 2021–2022; the point card's “As …”, partner and leader names follow the same rule. Spelling variants of one name do not split a history.
- MK histories and seat cards (12 Nov, audit): the faction יהדות התורה is “United Torah Judaism” in every Knesset (it read “UTJ” in the 13th–15th), and the 23rd Knesset's הבית היהודי is “Jewish Home”, as in every other Knesset (it read “The Jewish Home”).
- MK histories and seat cards (12 Nov, audit): factions follow the Knesset's records exactly. Same-day records keep their times of day, so Yigal Yasinov's 1 Feb 2006 reads Shinui 10:01, HaOlim 11:01, National Union 12:01, then Yisrael Beiteinu, the faction that continues (it read backwards from Yisrael Beiteinu); a record that starts and ends at the same midnight is no longer shown as a faction, a change or a bar (28 rows, among them Bennett's “National Unity” on 15 Aug 2022 and 22 in the 2020 Blue and White split); a faction bar no longer starts or ends outside the member's own term (Baruchi, Mashriki, Melaku, Buaron, by one day each).
- After the election (12 Nov, audit): English government-change rows showed letter-by-letter transliterations as party names (“m'rkh”, “thyyh”); every faction now shows its list’s name (Alignment, Tehiya, Tami, Shas, NRP, Yisrael BaAliyah…) or its English faction name, in the list’s colour, and a name with no English form would show in Hebrew, marked as Hebrew. The Coalitions screen used the same fallback and is fixed with it.
- After the election (12 Nov, audit): acting and interim prime ministers are named as such after their name, in both languages: Yigal Allon and Shimon Peres (acting Prime Minister), Ehud Olmert (acting, then interim Prime Minister).
- Recommendations (12 Nov, audit): 1988 read Peres 55 on After the election but Peres 49 and “unconfirmed 8” in the sourced grouping; both now say Shamir 63, Peres 55 (Hadash, PLP and ADP conditionally), no recommendation 2 (Degel HaTorah), and the build checks that every round and its grouping agree list by list.
- Coalitions (12 Nov, audit): pressing Recorded first government was followed by “Different from the recorded first-government partners” in 12 elections (2015, 1977, 1988, 1996 and others); the comparison now uses the same record as the button.
- After the election (12 Nov, audit): the 1961 government’s resignation now says the Lavon affair led to the crisis and the early election; the 2009 investiture shows its 5 abstentions; the August 1970 snapshot no longer repeats the December 1969 investiture vote; four formation bars captioned only “Mandate” name the person tasked; Rivlin’s 2020 refusal no longer counts as an extension; Government 37 lists its coalition changes (National Unity joining and leaving, New Hope, Otzma Yehudit, UTJ and Shas) from the Knesset’s appointment register; government names follow one pattern; Hebrew “נבחר ברשימת” (masculine, also for women) is now “מרשימת”.
- Localities and turnout by group (12 Nov, audit): “Israeli localities in Judea and Samaria” left out the whole Hebron area (Kiryat Arba, Karmel, Otniel and about 15 more), because CBS subdistrict 77 was taken for Gaza; it is Hebron. The group is now all of district 7 plus the Jewish community in Hebron: 130 localities and 237,136 valid votes in 2026, up from 110 and 227,079.
- Import (12 Nov, audit): a scenario file whose results differ from what its own list of changes gives (changed by hand) is no longer opened only to lose that change silently on save or reload; it is refused with a plain message. A file made on older data opens on the current data and says so, as a share link does.
- Scenarios (12 Nov, audit): exporting a saved scenario from its card kept no description (for example a What if question opened as a scenario); the card's export and the Compare reference now carry it.
- What if (12 Nov, audit): the expanded answer for a merger that wins a seat read “14 = 6 + 7”; it now reads “6 + 7 = 13 apart, 14 together (+1)”, in words in both languages, and the equation form stays only where the joint list wins exactly its parts' seats.
- Blocs (12 Nov, audit): applying a sourced grouping again put merged and split lists in no bloc; they now take the bloc their origin lists share (none if the origins differ), also in comparisons of groupings.
- Compare (12 Nov, audit): a renamed candidate counted as “the same” roster, so Compare showed nothing to compare and refused to copy it; every candidate field, the parties and the completeness flags now count.
- Start (12 Nov, audit): a damaged value in this browser's storage (for example the text null) left a blank page; every stored setting, saved scenario, workspace and saved comparison is now checked, and anything malformed is ignored.
- Candidates (12 Nov, audit): restoring the official roster after copying another election's roster kept that election's parties on the list; the restore now brings back the official parties, the completeness flags and how a joint list's faction is counted.
- Compare (12 Nov, audit): copying the official threshold into a saved experiment showed the experiment's 5% in the preview but committed 3.25%; returning to the law's rules now always uses the election's statutory rules, and every copy's preview is exactly what it commits.
- Compare (12 Nov, audit): on a phone the Side by side, Close side by side and Swap icon buttons now have names for screen readers.
- Messages (12 Nov, audit): every refusal from the scenario engine, and the import errors, now come in plain English and Hebrew, say what to do, and name lists in the reader's language (English copy refusals showed Hebrew list names).
- 25th Knesset (12 Nov, audit): its records now run to its end. The Knesset’s database closes all 120 memberships on 10 November 2026, the day the 26th Knesset opened; seat cards and faction histories show that end date instead of “ongoing”, and the timeline ends with it.
- Side by side and Copy (12 Nov, audit): 21 candidates of 2022 and 2026 whose Knesset member record is official (Almog Cohen, Limor Sonn Har Melech, Boaz Bismuth and others) were ignored when matching people across elections, because their Hebrew Wikipedia link is only probable; they now count as the same person, so “also on another list” warnings and shared-candidate suggestions include them. The two 1977 Likud candidates both printed כהן יגאל stay unmatched: which rank is which person is not certain.
- Settings (12 Nov, audit): Undo after “Reset all settings” or a group’s Reset brings back every question’s default answer; “Copy votes: default method” used to stay cleared. The (i) of Reset all now says that answers chosen with “Always” are asked again, and that answers remembered for one list, bloc or scenario stay.
- Seat chart (12 Nov, audit): every seat’s card opens from the keyboard, in Arc and in Blocks: one Tab stop, the arrow keys move between seats as they are drawn, Enter or Space opens the card, Escape closes it. A ring marks the seat, and a screen reader names its list, seat number and member.
- Seat chart (12 Nov, audit): Blocks dims the other seats when a list is chosen, as Arc does. A chamber larger than 120 seats (Rules, Experimental) gets a larger Blocks tray, so every seat shows on screen and in the SVG and PNG exports.
- Custom level (12 Nov, audit): Hidden leaves nothing to open: no “More options” chip, no tab, and no button into a hidden tool (Allocation steps, Walkthrough: threshold, All scenarios, Government & term, Sources, Apply family as grouping). Collapsed keeps its chip, and the settings behind a hidden feature keep working.
- Sensitivity (12 Nov, audit): a vote segment can be chosen from the keyboard, with the arrow keys on the bars and in the table.
- Localities (12 Nov, audit): a map dot’s hover text no longer rounds a small lead to “+0 pp”; it says “<1 pp”, as the selected locality does. The Turnout voter-group label and the percentages in the change list follow the same rule.
- Side by side (12 Nov, audit): the card of an election to the 2nd, 3rd, 12th, 13th, 22nd or 23rd Knesset read “$2nd Knesset” or “$3rd Knesset” in English; every screen now takes the ordinal from one helper.
- Overview (12 Nov, audit): the 1949 “Votes per seat” card wrote the quota as votes ÷ 120 beside a figure that is right only for ÷ 121; it now shows ÷ 121, as the 1949 law set, from the same code as the walkthrough.
- Explanations (12 Nov, audit): polling areas hold up to 800 voters, or 900 with the committee’s approval, and may have a second ballot box; Sweden’s first Sainte-Laguë divisor is 1.2; ballot letters were limited to two until July 2026; the Droop quota adds one; today’s government-formation and no-confidence rules are marked as today’s; for 1951–1969 the walkthrough no longer says the law requires a lottery for ties, since the sources checked state no rule.
- 2019 (September) (12 Nov, audit): Popular Unity’s name reads אלוחדה, not אלחודה. The candidate gazette misprints one word that the same page, the final results notice and the committee’s results page all print correctly; recorded as a reviewed correction.
- Seat cards and MK histories (12 Nov): in the 25th Knesset, Otzma Yehudit's faction is named Otzma Yehudit, not Religious Zionism. The Knesset registers both from the first day, and a list's name now goes to only one of the factions its members formed; no two factions sitting at the same time share a name.
- Timeline (12 Nov): five end-of-term lines said “2th”, “3th”, “21th”, “22th” and “23th Knesset”; the records are corrected and the patch that hid the fault on screen is removed.
- Coalitions (12 Nov): on a phone with large text, “More for than against: 51 for · 64 against” wraps inside its card instead of running past it, never splitting a mark from its label or a number from its word; the totals line keeps “= 51” together.
- Data gaps register (12 Nov): no longer lists “[object Object]” as an election; the register skips the 2022 polling archive’s draft JSON Schema, which describes fields and holds no claims (one false flag removed; 11,467 flags).
- Research: correct generated term ordinals and bilingual faction-move labels; reconcile the 2020 investiture with its complete official roll call and technical correction.
- Logos (12 Nov, wider pass): add eleven election-confirmed assignments from original party platforms and archives, preserving dated originals, exact crops and byte checks; isolate the 2013 and 2015 Meretz wordmarks from adjacent campaign messages.

- Compare as a mode (12 Nov): “⇆ Compare” in the change line turns on comparing with the previous election (or any election, saved scenario or this election’s official result) and a strip says so on every screen; the Lists panel draws each list’s result there as a striped bar and a line (“2022: 32 ▼ −5”, joined, split, new, and a folded “In 2022 only”); a switch over the seat chart shows either chamber in the same place; “Copy votes…” on a row, a list’s panel or every list opens one box (Simple one sentence, Standard three methods, Expert two more) with the figure and seat result of each method, marked “From 2022” and one Undo; Turnout’s changes follow the compared result and copy eligible voters, turnout and (Expert) invalid ballots; Rules (Expert) copies the threshold, all the rules or the surplus agreements; Blocs draws the compared bloc bar under yours; Coalitions shows each partner’s seats there and their lists’ total; the Compare tab is gone: its two-sided page opens as “Side by side” from the strip, your work on the left in English (right in Hebrew), with worded “Copy votes…” buttons.
- After the election (12 Nov): the Knesset-on-a-date arrows stop at every event the bar shows at the level, votes and faction changes included (locked by tests); the 21st and 22nd Knessets, which formed no government, get the timeline too, with the formation attempts and the dissolution; faction moves are named in English.
- Logos (12 Nov): add eight campaign-confirmed list/party assignments from official archived sites (2013, 2015, 2021 and 2022), with original-byte checks; keep a conflicting 2020 header unassigned.
- Data: verify both formerly secondary 2026 rosters against the official candidate gazette, disclose its mirror host, and correct Beit Yemini’s published name.

- Tools strip (12 Nov): three small headings group the tabs, “Your scenario”, “What happened” and “How it works” (each a labelled tab list; tools of other levels stay under their heading after “More in other levels”; wide screens wrap whole groups so every tab is in view; phones get three buttons that scroll the strip to their tabs). Localities map: an “All lines and areas” box over the 12 line boxes (a dash when only some are on); the ticks are remembered on this device, and Settings → Analysis has the same switch (“Map lines and areas”), so the map can always open clean.
- Research (12 Nov): complete the retained 25th-Knesset replacement inventory without guessing unresolved reasons; recover official named dissent votes and correct the revised-budget and retained-profits vote totals.

- Seat chart (12 Nov): the line between blocs is a smooth curve that bends only where the seats force it, and seats are placed so it can (each list's seats stay together); Blocks fills column by column so blocs read left to right like the half circle; Settings → Joint-list seats shows a joint list counted by party as Both (the party colour with a thin ring in the list colour), Party or List, wherever seats are drawn and in exports (Simple: List).
- After the election (11 Nov): the 2021 and 2022 Knessets get “The Knesset on a date”: ◀ ▶ steps through the term (Simple the government and the term, Standard also votes and single MKs, Expert everything, with seat changes chosen in Settings), the seat chart as it stood after each step with coalition seats on the left, rebels marked “!” and drawn on the side they moved to, “voted against/abstained but stayed”, side-change arrows and replaced seats; any seat opens a card of everyone who held it during the term (also on the election chart).
- Polish (9 Nov, P2): 2026 records its official results notice (Yalkut HaPirsumim 15100, 4 Nov 2026; every list total, valid/invalid votes and seats checked by the builder) and no longer says “Gazette not yet verified” anywhere; theme offers Device, Light and Dark on the phone Menu too (the bar’s sun/moon button returns to Device when flipped back to the device’s own theme); the phone top bar stays pinned at the top while scrolling; party-family charts, the turnout history columns and the families table rows follow the shared hover timing.
- MK histories: add 14 source-confirmed candidate runs and complete official rosters for Lider (2003) and the Jewish National Front (2006); retain unresolved identity exclusions.
- Polish (9 Nov): How seats were allocated, Expert, 1973 and 1977: a short note says the Elections Committee’s sheet counted surplus-agreement pairs together in the first stage (117 + 3, 114 + 6) while the law gives the app’s 114 + 6 and 113 + 7, with a link to the sheet; Party families: the Mixed lists switch moves down to the two vote charts it controls; party-family and turnout charts show the selected election as a soft shaded column with its value and year in bold, and say what their x-axis is; ELECTORAL-LAW gives the 2026 quota as 44,874 (from the results notice, Yalkut HaPirsumim 15100).
- Data: audit every elected joint-list member’s missing party (1977 Mwais; 1999 Mahameed), retain explicit evidence gaps and strengthen four 1999 UAL attributions with Knesset and IDI sources.

- Party families: a new “Seats won” chart (above the vote charts, every level) draws the family’s own seats solid and every party elected with it on a joint list striped above, smallest first, from the elected members’ parties (nothing estimated); bars taller than the chart fade out at the top while every partner keeps a visible slice, the label reads “7 +28”, hover, tap or arrow keys give each segment’s party, seats, list and year, and “Show partners” (on by default) is remembered.
- Research (9 Nov): record every retained faction transition across Knessets 1–25, correct Meretz’s organisational unification to 1997, and source further party-history settlements.
- After the election: confirm every 2026 faction recommendation from President’s House notices and record Eisenkot’s 8 November mandate; government formation remains in progress.
- Members of the Knesset (9 Nov): each MK's own history opens from their seat in the chamber and from their name in a list's candidates (and Compare's entering/leaving lists): one row per Knesset with the list, place, result, time served by faction and dated events; elections where the list did not win them a seat are shown from 2009 on (2003 and 2006 for the lists held in full), matched by the Knesset member ID or an identical listed name.

- Owner 9 Nov: party-history charts name each event (a solid line with a label, or a number matching the list when labels don't fit), explain in an (i) why events sit between elections, and shade the selected election instead of a dashed box; no “?” or letter marks; each Compare pairing explains what is compared with what, why and how sure behind an (i) by its tag.
- Owner 9 Nov: Settings lists every setting at every level, Simple ones first, then Standard and Expert; parties under a joint list follow the level (Simple lists only, Standard parties with seats, Expert all); a first visit follows the device theme from the first paint; (i)s, seat details and chart values open after a short rest and close after a short grace; Simple asks where added votes come from, with each answer's effect; phones get a one-row top bar with a Menu; Ra'am 2021's (i) notes the deputy-minister post offered but never taken up.
- Docs (9 Nov): the repository keeps what is needed to build the app and check its numbers. Design specs, review and acceptance reports, prior-art studies and other working notes moved to the private archive; new `docs/features/` notes explain how After the election, party history and party families work; `docs/README.md` and `docs/research/README.md` index what is where.

- Data (8 Nov recheck): Yisrael Beytenu 2026 #8–20 biographies link their 26 October Wayback captures (the live pages now redirect home); the Degel HaTorah leaflet (letters עץ) moves from UTJ 1992 to Degel HaTorah 1988; the 1977 candidate-cap note cites the 1 November 1977 transcript.
- Data (9 Nov): the biography and party-link builders reproduce the committed data offline (audit corrections moved into reviewed inputs; a test fails on drift); 2019–2022 results links say “results”, not “results notice”; older lists no longer link later namesakes (One Israel 1999, Derekh Eretz 2020, the 2026 Reservists–Economic list); two stale k15 list names in link titles corrected; decision 0073 gains a dated addendum on the 1977 transcript.
- Research (9 Nov): the 1977 first-stage count (transcript 114, app 113) is explained: the CEC's 1977 sheet counts surplus-agreement pairs jointly on one page and list by list on the next; the law (§§81(c), 82(a)) gives the app's 113 + 7. Stage counts now tested against the CEC sheets for 1981–2021. No seat changes.

- Research: retain the privacy-filtered official party register; confirm NRP–Jewish Home continuity and separate Labor/Meretz registrations, and record the disputed Labor/Democrats name.

- Research: rethink Compare with an audit of current behaviour, in-place comparison precedents, eligible-voter copying examples, history comparisons and ranked recommendations (israel-elections-private docs/research-internal/compare-rethink.md).

- Owner 8 Nov: the “compared with last time” line under each list is off by default (Settings switch; Compare and the list panel keep it); the joint-list split reminder and its (i)s use the owner’s Hebrew and a matching English; Turnout opens with the election’s facts (eligible voters, turnout, votes cast, valid, invalid, threshold, Expert ballot boxes and envelopes) with the change since the previous election, and a 26-election chart and table. Splitting a joint list runs only the parties given votes: a party with no share (17 cases in 13 elections, such as Atid Ehad in 2022) shows “No list of its own” instead of becoming an empty 0-vote list.
- Docs: eight design and research documents (party history, individual MKs, source policy, trusted sources, archive access, Hebrew quality, Ra’am in 2021, map lines) rewritten in plain language, each opening with “In short”, recording the 8 November owner decisions and ending with technical notes for developers; no facts removed.
- Research: add a partial, source-linked Knesset event history for 2021–2026: 83 classified records, explicit exclusions and hard cases, designated confidence votes, and membership-record references.
- Party history: each list's panel shows its parties' history since 1949 (full sheet with seats or vote share, events and sources) and the comparison with the previous election; list rows show “2022: 5 ▲6” from Standard (Settings switch); Compare adds “Ran jointly”, a note under the later list and the evidence in Matching. Votes are never divided between parties.
- Research: cite party continuity and faction splits; distinguish Democrats political union from legal registration and keep unverified identity checks open.

- Research: check Ra’am’s proposed deputy post against official appointments; add a practical scholarly and newspaper reading plan for unresolved coalition history.
- Research: assess lawful historical archive access, ranked alternatives and bilingual owner enquiry drafts.
- Research: assess Hebrew editing tools and native review, with 25 source-linked copy proposals and a practical quality pipeline.

- Grouping and coalition edits count as changes again: moving lists or parties between blocs, creating, renaming or deleting a bloc, custom groupings and coalition roles appear in “N changes”, History, markers and the scenario tint, with “Votes and seats unchanged” when nothing else changed; only colours are exempt (a bloc recolour is still no change).
- Design: party identity across elections, party history and comparison with the previous election (israel-elections-private docs/design/party-history.md; public summary docs/features/party-history.md).
- Numbers: Max decimal places defaults to 1/2/3 by level and drops trailing zeros; every rounded percentage and percentage-point change shows its exact value on hover, focus or tap. The joint-list split reminder has “Don’t show again” (back in Settings → Editing), and 2013’s declared versus detailed totals are noted behind (i).

- Map: keep Hebrew sentence punctuation outside Latin-reference isolation, join the Ramadin source splice exactly, and name OpenStreetMap in full.


- Integrate Settings with the colour guard: preserve global party fills, dot separators and picker advice across display settings and large-text layouts.

- Rebuilt Settings as one searchable bilingual popup (phone: full screen) with levels, group resets and Undo; every setting now applies wherever it is relevant, with new defaults (Device theme, joint lists by party, parties with no seats hidden) and accessibility options at every level; every percentage now shows at most 0–3 decimals (1 by default, 2 at Expert), never shown on the wrong side of the threshold (one more digit there, the exact share in the tooltip); Compare's shares, percentage-point changes and seatless rows follow Settings, its copy mode is a Settings row, and large text now takes the layout of the narrower page instead of wrapping.

- Map review: restore Government House armistice edges, correct bilingual treaty text and references, complete the UN Blue Line, and add sourced Golan separation layers.

## 6 November 2026 — data audit

- Keep party fills stable across elections with global sibling-colour checks and neutral dot separators.

- Guard automatic colours and custom picker advice across the app; preserve researched party hues and test preset distinctness and contrast in both themes.

- Coalitions: outside support and arranged abstention as roles beside In/Out/Any, with “members + outside support = total”, both the confidence vote (more for than against) and 61, hatched/hollow bar marks, named undo, links and saves; What if… adds a 2026 minority government with outside support; “Recorded first government” fills roles from research with their certainty and says where it differs from the recorded vote, and 1992’s grouping shows outside support as its own group without recolouring any list. Vote tallies read “67 for · 53 against” everywhere, including After the election.
- After the election: distinguish government members, support roles and individual votes; show unknown totals honestly, explain vote reconciliation behind help, and keep localised date ranges in reading order.
- Correct Jerusalem zone identities and paired lines; distinguish the treaty’s Jordan administrative sector, constrain source precision, and verify Blue/Alpha against explicit UN maps.

- Sources: an enforced evidence policy (tiers, independence, certainty confirmed/probable/provisional/disputed/unknown); the gaps register now ranks gaps by importance and certainty.
- Families: count Otzma Yehudit only in Radical right in 2015, as in 2019–2022; the national-religious family keeps Yachad.
- Research: separate government membership, outside support, investiture votes and individual exceptions; validate explicit uncertainty across recorded governments and document unresolved historical authentication.

- Label the Sources polling count as polling-station results and explain that it counts results-table rows, not physical stations.
- Research: refresh the Learn/Play information-architecture brief with current map behaviour, every tab and post-election scope.
- 7 November: replace 44 stale ballot-letter IDs and all references with corrected IDs; remove pre-release saved-format migrations. This supersedes the stable-ID wording in the audit entries below.
- Share historical local votes consistently across split lists in Turnout, demographic adjustments and the map, dividing equally when all descendants have zero votes.
- Give every joint-list party a visible seat dot and consistent, contrast-checked display colours across charts, keys, details and exports.

- Give bloc regions clean shared edges and contrast-checked borders in Arc, Blocks, reference chambers, legend keys and exports.
- Compare becomes a two-sided workbench: lists paired from party records, values copied either way with exact share/count/change rules and marked with their origin, per-side undo, swap, saved comparisons and share links.
- Retain saved references in compact change labels, ellipsise only names, and explain active-reference versus official counts together in History.

- Show change counts once beside History, shorten whole labels by measured fit, and apply Hebrew maqaf prefixes consistently to foreign names.

- Unify changes/שינויים against the official result or saved reference, explain action counts, and localise History times and calendar dates.
- After the election: localise dates with RTL-safe ranges and numbers, use reading-direction arrows, attach help to its context, remove redundant event glyphs and avoid an unsupported coalition membership total.

- After the election: reviewed recommendations, government formation, coalition and term history for all 26 elections, with sources and pending-event separation.
- Locality map: add individually controlled armistice/frontier layers, historical no-man’s-land hatching, source dates and a reproducible disagreement atlas; keep unverified Golan sections out.

- Localities: lazy OpenFreeMap light/dark vectors, CBS-only bilingual labels at every zoom; hide unverified boundaries with an explicit notice and retain geometry checks.
- Compare: the open scenario always stays on the right with matching unchanged; an import that puts someone on two lists warns and offers a one-tap removal; saved comparisons are listed on Scenarios; the share change shows its unit (pp).

- Mark custom bloc, coalition and family groupings locally as analysis while preserving official result identity and factual summaries.

- Keep custom list, party and bloc colours and grouping display names separate from result identity; save/share appearance and reset colours independently of result edits.

- Show app-defined provenance once per marked scheme context; keep individual markers for standalone blocs and tooltips.

- Keep app-defined grouping names concise, with a bilingual App marker and provenance help across views and exports.

- k2: corrected ballot letters with stable IDs, registered names and five elected spellings; transcribed both losing rosters, strengthened satellite-list sources and repaired aftermath dates/gaps.
- k15: corrected ballot identities and gazetted names, restored two withdrawn registrations, clarified PM/dissolution evidence and roster coverage, and withheld unverified logos.
- k24: corrected Demokratit’s withdrawal, retained official final notices, clarified opening membership and polling-station scope, added candidate resignation notes, and corrected overstated source and logo verification claims.
- k19: retained the formal Gazette total correction, repaired list identity, context and stale research notes, strengthened constituent sourcing and withheld three unproven campaign logos.
- k21: corrected three withdrawn lists, gazette name/sponsor transcriptions and resignation notes; retained official results and replaced recommendation inference with explicit reports.
- k18: retain withdrawn Mahapach BeHinuch; correct formation-day coalition, Meretz affiliation, names and dated source claims.
- k16: corrected government/succession and dissolution chronology, two candidate names and roster extent; retained withdrawn Moreshet Avot and clarified source and envelope-voter claims.
- k13: corrected official list names and ballot letters, four candidate spellings, and Government 25’s end (22 November 1995, with Peres as acting prime minister).
- k12: corrected seven ballot-letter readings and list names while retaining stable IDs, settled the opening coalition at 95–25, documented Reiser’s death, and qualified unsupported recommendations and campaign logos.
- k11: corrected ballot labels and small-list identities with stable IDs, removed Shiluv from Sheli’s family/lineage, corrected candidate #61 and the 97-MK coalition, and refreshed sourced aftermath gaps.
- k10: corrected printed ballot letters while preserving stable IDs, repaired One Israel/pensioners/Aliyah identities and family classification, corrected a candidate spelling and tenure dates, and strengthened coalition and logo evidence.
- k9: corrected official ballot letters/names without renaming stable IDs, repaired elected-name and biography displays, sourced the historical candidate cap and first-government support, and reconciled primary-evidence gaps.
- All elections: official English member names now display with apostrophes instead of backticks and single spaces; the raw Knesset values stay as evidence.
- All elections: Commons logo source links now open the file page (eight links lacked “File:” and returned 404); the logo validator rejects such links.
- k17: corrected five elected names and three list names against both gazettes, the election-period constituent label, the 2008 constitutional election route, platform gaps and evidence attribution.
- k14: corrected ballot names, retained withdrawn Moreshet Avot, repaired roster coverage and resignation notes, and displayed the Gazette’s published PM percentages with corroborated ballot totals.
- k7: recorded Gahal’s six-minister withdrawal on 6 August 1970 (102→76 coalition seats), corrected source/quote metadata and Tamir’s English spacing, and removed the unsupported consultation end date.
- k6: corrected three ballot letters, official list names and Don-Yihya, preserved stable IDs, documented coalition/appointment distinctions, restored Allon’s acting tenure and withheld the unproven Rafi logo.
- k8: corrected sourced list display names and historical wording, resolved recommendation evidence and withheld an undated logo; stable keys and all counts unchanged.
- k3: corrected ballot letters and official list names while preserving IDs, retained the official יז withdrawal notice, and repaired anachronistic labels, provenance and copied aftermath caveats.
- k4: corrected three ballot letters, official list names and four elected-member spellings, added the third surplus agreement (תו–שת) and the government chronology; IDs, votes and seats unchanged.
- k5: corrected three ballot letters and list names, added the withdrawn list שו with its six candidates, corrected mandate dates and member spellings; IDs, votes and seats unchanged.
- k1: corrected eight gazette-name transcriptions, first-government support grouping, anachronistic bloc title and aftermath dates; strengthened constituent sourcing and removed copied gaps.

## 5 November 2026 — release review

- UI integration: restore the compact desktop band and readable scenario slots, fit phone actions on one row while retaining 44px targets, and align scenario metadata/grouping tests with view-only semantics.

- Scenarios mark unsaved changes, reopen saved versions while keeping drafts, and resolve duplicate names with overwrite, numbered copy or a custom name.
- Synthetic lists use divided constituent ballot tiles, marked split parts and clean new-list letters through the shared logo path, comparison records, chamber legends and image exports.
- Make allocation walkthrough navigation manual, drop the 80% turnout What-if preset, and name self-defined voter groups “Custom group” in English and Hebrew; new groups still start with no turnout change.
- Sensitivity: votes, majority, then threshold; persistent input-keyed analysis reuse, scenario-colour party labels and preferred precision. Shared signed green/red seat arrows across result and editing screens.
- Personal settings open from every page and level; per-list and bloc vote-source answers persist by election in this browser, with individual and bulk clearing.
- Header controls share comfortable targets and picker affordances; About fits its clickable summary. Edited fields use underlined text annotations with reference details and section restore.
- Keep sourced groupings, faction display and coalition inspection official; preserve view choices in saves and links without edit markers or scenario tint.
- Place 2006 localities through unique normalized CBS Hebrew-name matches; keep ambiguous rows unplaced and explain the method in both languages.

- Compare opens unchanged results against the previous election, including when saved scenarios exist; explicit comparison choices stay selected, edits use the usual official result/reference, and the earliest election keeps its chooser.

- Turnout can no longer pass 100% through vote edits: “new voters” come only from registered voters who stayed home, in the vote field, slider, quick buttons, seat searches, seat security, bloc totals and What if… presets; the list panel shows how many stayed home. Lowering registered voters below votes cast still warns rather than blocks.
- Personal editing preference: count joint lists’ seats by party by default, with an inline remembered default, unedited baselines and portable saved/shared faction counting.

- After the election (research): sourced "Recommendations to the President" groupings for 1984, 1988, 2003 and 2006, and a partial one for 1981; 1977 and 1992 documented as gaps, 1996/1999 as direct-election years with no recommendation round (docs/research/pm-recommendations-1977-2006.md).
- Recommendations to the President: new partial 2026 record (4–5 Nov consultations; Likud pending) and 2009–2022 re-verified against news reports (2013: Kadima recommended Netanyahu, 82; 2009: all 12 factions sourced). See docs/research/pm-recommendations-2009-2026.md.
- Research: recommendations to the President after the 1949–1973 elections (docs/research/pm-recommendations-1949-1973.md); added sourced `pm-recommendations` bloc schemes for 1959, 1969 and 1974, with undocumented lists shown as “Not stated in source”.
- Owner answers: use Hebrew ballot-letter logo fallbacks and neutral constituent badges, shorten data status with full details behind (i), and isolate Hebrew-only candidate names with an English explanation.

- QA2 leftovers: use shared analysis/settings pickers, tighten stable list-panel spacing, place global notices after the work area, and compact the phone header while keeping every control directly available.

- Analysis screens: fixed-scale seat-safety tracks, stable sensitivity loading, complete threshold labels and round axis ticks, nearby chart names with Hebrew phone alignment, inline formula help and compact allocation tables, equal comparison options and compact aligned coalition rows.
- Editing screens: suppress unchanged resets, keep questions independent and edit controls steady, preserve locked explanations, clarify turnout steps and disabled actions, and align locality search and sticky map.
- QA2 Overview and header: keep phone scenarios readable, selection widths and election header slots stable, expose tab scrolling, toggle figure popovers natively, align values and isolate sums, trim the arc’s empty margin, keep show-more triggers before their content, wrap grouping names, unify fallback identities, and show sourced Hebrew member names in given-name order. Shared labels wrap between words; Sources leads with English labels and retains original credits.

- Corrected the English and Hebrew data-status notes for k20–k24 by removing obsolete claims that no default blocs are assigned.

- List panel: Knesset members appear under their official English names (Knesset website) in English mode, with the registered Hebrew name beside them; English link and sponsor labels carry no Hebrew or letter-by-letter text; candidate links say less with detail behind (i); "Restore list" appears only for non-vote edits; renaming a candidate no longer moves its row; component parties without a colour get a distinguishable one on candidates, party rows and when split. Shared controls: short pickers open without a search box and re-choosing the current option is not an edit; secondary-source chips are neutral, not error red; dark-mode sliders are visible; small buttons match a 32px field beside them.
- Overview: the "Since official result" line is always present at one fixed height (sticky on wider screens, History as a popover), so a first edit no longer pushes the page down; the lists column keeps its width when a list opens; focus stays clear of the sticky bars; seat changes are said once (the line), not again under the chamber; Hebrew bloc counts no longer merge with their majority note; the government picker shows its whole name on phones; change bars sit beside their names; What if… previews keep Hebrew names on the reading side.
- How seats were allocated: seven numbered stages on one line (seats or pairs of the open stage beneath, a slider for divisor methods), a seat tray that fills seat by seat, a new surplus-agreements step, every list with the threshold line drawn, full-height tables, era-correct rule text and arithmetic (1949 quota gate and pair quota, 1951–69 remainders, 1977 candidate cap), and edits marked against the reference at each stage.
- Compare offers saved scenarios, the previous or any other election and What-if questions when nothing differs, instead of two identical results; compares two elections side by side without pairing their lists; replaces the crowded slope chart with a seat dumbbell that keeps tied lists readable; and keeps change bars, tracks and signs left to right in Hebrew.
- Rules tab renamed Rules & settings: settings sit in their own card (display, editing questions with each remembered per-list answer and Ask again); each era's law is named, its own rules (1949, 1951–1969, 1977) are shown, thresholds carry their years, locked fields look locked, and rule edits are marked at their field.
- Merge & split: previews and a new "Changed lists" record compare a split once with all its parts (no more "27 → 0" per part); the page stays put after applying; split vote shares are shown as a bar with votes and are editable in place; split parts and new lists get distinguishable colours; each era's surplus-agreement rule is stated; tabs no longer jump.
- Section reset and copy controls appear only when they would change something (“Official turnout”, “Copy from…”, “Remove all agreements”). Turnout models one voter group at a time — sourced CBS locality groups, vote-share localities or typed numbers — with a turnout slider, measured vote mix, seat-change preview, increases and decreases, and saved, exported and imported voter-group presets.
- Distinguish joint-list component candidates and seats with party tints and list-colour envelopes, include component identities in chamber exports, and prevent component-row logo overlap. Component seat colours can be disabled under Rules → Display.
- Keep family-chart hover facts out of page flow, clarify mixed-list counting, and open election breakdowns with named lists, logos, votes, seats and sourced constituent changes before navigating.
- Coalitions: a chosen coalition opens beneath its own row (nothing above it moves), party cards keep In/Out/Any in one place, one “Clear the coalition” replaces three identical resets, “Pivotal” is named only when it tells partners apart, and In lists that already win are said to. Scenarios: Save shows Official / unsaved / Saved, the gallery has one status line, and visitors read only the Pages index — never the GitHub API — waiting out failures and 429/503 Retry-After across reloads.
- Party families: mixed lists are defined where they are chosen (Show hatched / Count if family heads it / Count all / Leave out, each with its chart mark); hover names each hatched list's parties (family's own in bold) and the change since the previous election without loading or taking the pointer; the election breakdown leads with votes, share, seats and their change, orders counted → hatched → not counted, and counts only a mixed list's family parties as represented; membership editing no longer jumps while lists load; Hebrew quick percentages read left to right.
- Keep coalition inspection independent of In/Out filters, show partner seats and pivotal members, and expose local resets. Clarify scenario save/share flow, align name/description fields and bound option widths; serve the community gallery from an automatically generated Pages index instead of anonymous visitor API calls.

- Clarify vote sources, section replacements, joint-list actions and edited markers; remove single-vote nudges and let sliders cover the valid-vote total. Preference prompts offer one-use, item and global scopes with one explicit Apply action.
- Complete English list labels with sourced, explicitly unofficial transliterations where needed; localise menus, exports and identity captions. Show year-labelled nearest-period logos, preserve component logos through splits, and replace bare party squares with monograms.
- Keep list and bloc panels within the viewport with independent body scrolling; prevent edit anchoring jumps. Figures open consistent popovers without reflow. Keep floating content inside the viewport and move the footer independence note into About. Define block-group boundaries, enlarge bloc strips, and separate default bloc/scenario colours while preserving saved choices.

- Keep long edited bloc names and official list names readable on phones, restore contrast for Compare counts, and show family scaling counts once beside their strips.
- Charts: whole list names (stacked above bars on phones), one list order and edge lines in both waffles, votes→seats read left to right in Hebrew, and "Votes with no seat" counted as on the overview (1949 lists that won nothing, no false "below threshold"); table names open their list, and switching to the table no longer shrinks or scrolls the page.
- Prevent map zoom completion from accessing a destroyed pane after tool navigation.
- Seat safety: lay out every row at once and fill figures in place; keep the chart left to right in Hebrew; quote one figure per seat change (votes to lose / gain a seat); show lists below the threshold against it; name the vote source; stop failing on election switch.
- Sensitivity answers on opening, with no Run or Search: plain headings, a threshold drop-out chart, tables against the current result, a bloc seats meter with the result checked against the chamber, and pickers that follow the election.
- Sources: English publishers and descriptions on English pages, official sources listed first, project records named instead of dead links, "not in the data" instead of zero locality counts, one credit per logo (English first, Commons labelled secondary once), method and limits above the glossary, data downloads, and no layout shift when the source list loads; About events in date order.
- What if… answers that move no seat now show what does change (a joint list as the sum of its parts, the threshold in votes, agreements that moved nothing); every question's (i) states its assumptions, including surplus agreements a merger ends, and points to the election's sources. Questions and merged lists use the lists' own names, and each (i) sits on its question's line.
- Localities: English mode names every locality in English (CBS names, including 2006 by exact name; a few labelled project transliterations) on the map, table and lists; the basemap is muted and dark in dark theme; a selected locality shows who leads, by how much, and the bloc breakdown; the address field is styled as an input, a blocked tile server is reported, and zooming no longer scrolls the page.

## 5 November 2026 — concise tool pages

- Keep tool instructions brief in Hebrew and English; retain modelling assumptions, provenance and correctness caveats in named info controls. What-if questions keep their vote and seat consequences visible, with separate assumption controls and reduced-motion-aware navigation.
- Sensitivity ranges and seats/majority fractions retain left-to-right numeric order in Hebrew.

## 5 November 2026 — preferences at the action

- Keep vote-slider previews responsive by leaving edit comparisons and exact searches on committed inputs; capture releases outside the slider, reserve feedback space, and highlight seat changes and majority crossings with reduced-motion support.

- Shorten board guidance and keep joint-list assumptions, provenance and graphic explanations in (i). Clear stale share links after edits and keep the phone save/share menu inside the viewport.

- Choose vote source, then “For this list” or “Always”; saved-scenario opens ask which comparison to mark. Both use one preference dialog and resettable settings in Rules → Editing.
- Keep numeric ± rows and sliders left to right in Hebrew as in English; preserve RTL labels and page layout.

## 5 November 2026 — seat counts you can type; one question for where votes come from

- Joint lists show their head party, elected component seats and opening factions, with sources and unknowns in (i). Mixed family ballots stay separate by default; an explicit head-party policy and per-list overrides replace the hidden two-thirds rule.

- Refresh the 2026 CEC count from the 4 November official files; replace the expired Gazette deadline with an explicit publication-verification caveat.
- A list's seat count is editable (typed or ±1): the engine finds the fewest votes that give it and applies them as one ordinary, marked and undoable vote edit. When no vote count gives exactly that number (e.g. 1 seat just past the threshold), the list lands on the nearest possible count and says so.
- Every vote edit (seat count, votes, goals, share, slider, bloc votes) asks where the votes come from (other lists, new voters, or one list) in one shared dialog, and works its target out under that answer. "Remember" stops asking; the choice lives in Rules → Editing. An unremembered answer holds while the same list or bloc is edited.
- Family scaling chooses its vote source in place.

## 4 November 2026 — party families audit

- Stop plotting elections where a family ran only in mixed lists as zero; stack the mixed range on the whole-list value and state the hatching once in a legend.
- Say "not counted" (only mixed or contested lists) instead of "did not contest"; show excluded mixed votes in tooltips and exact figures.
- Make the mixed-list policy a remembered view that never forks a preset; name personal copies distinctly and let Manage delete them.
- Give the nine families mutually distinct colours; use round axis values and decade ticks; place tooltips beside the point.
- Scale families down as well as up; preview the family's seats before/after with the delta and majority line; keep signs and arrows in Hebrew reading order.
## 4 November 2026 — scenario switching and app chrome (release-candidate audit)

- One switching path everywhere (switcher, Save & share menu, Scenarios page, share links, imports): unsaved work, including an opened share link, is kept as a session draft; resuming a draft removes it from the list; a saved scenario opens with its own undo history.
- A share link pasted into an open tab opens; a damaged link says so. Deleting the open saved scenario keeps it open as unsaved work (the switcher no longer shows a blank "Switch scenario"); the menu's delete now confirms.
- A duplicate gets its own colour and history; an unsaved draft already shows the colour saving will give it.
- One name per tool: the tab strip, Custom page and level names come from `features.ts`. The Overview cannot be collapsed or hidden.
- The tools strip stays one line and sticks under a wrapped band (tablets); About opens on screen on phones, names each list's events and closes on Escape or an outside press; undo/redo mirror in Hebrew; banners keep their dismiss button beside the text; load errors are plain with the technical reason quiet.
## 4 November 2026 — list controls audit

- Every vote goal shows the signed change it makes; "Restore votes" sits beside the goals once a list is edited.
- The vote field steps with ↑/↓ (PageUp/PageDown ×10), reads Arabic-Indic digits and 10k/1.2m, and marks an entry it cannot apply; the default step is 10k (1k in small early elections).
- Withdrawn lists show no stale search, threshold goals or threshold-crossing note; the withdrawal is marked at its switch and each list row carries one marker.
- Surplus partners are explained once in the lists header and never cut off; seatless lists of 1949 sit under "Lists that won no seat".
- Undo labels name the list moved; the Hebrew transfer line reads right to left; tall logos stay inside their slip; ballot letters are larger.
- On phones the lists follow the chamber directly; on tablets the list sheet keeps a readable width.
## 4 November 2026 — tool pages audit

- 1949 with a divisor method (Rules, What if… "Pure proportional representation") no longer leaves all 120 seats unallocated; the 1949-only rules are shown and editable in experimental mode, and the banner names the 1949 method correctly.
- How seats were allocated: the quota formula follows the election's law (seats + 1 in 1949, Droop, unrounded, divisor methods without a quota stage); no "0% threshold" formula; named first steps; exact quotients for every method.
- Charts, Compare and Sensitivity charts keep readable text on phones; Hebrew charts put labels, waffle order and the comparison baseline on the reading side; vote bars are outlined so they read in dark mode.
- Sensitivity: a sweep keeps the range it was run for; long searches can be cancelled; reversed or empty threshold ranges are refused.
- A merged list keeps its first list's colour; seat transitions ("27 → 25") read correctly in Hebrew; source descriptions are no longer scrambled on the Hebrew Sources page.
- State shown as state: the bloc filling a coalition, the loaded smallest coalition and the threshold preset in force are highlighted; repeated "unchanged"/"off"/"active" labels removed; What if… answers drawn as coloured chips and wording fits elections with turnout above 80% or a 2% law.
## 4 November 2026 — overview graphics and colour audit

- Separate party colours in every election (CIEDE2000; all pairs ≥15, neighbours ≥20; both themes), keeping well-known parties' colours, and separate bloc tints from each other and from No bloc.
- Draw chamber regions with smooth boundaries that enclose exactly their seats; fix seat order along the baseline.
- One consistent collapsed-feature toggle; chamber colour and layout choices sit together under Chamber options.
- Blocs bar: show the reference only when it differs, state each bloc's majority once, keep the 61 marker off labels; export legend, Hebrew and dark mode corrected.

## 4 November 2026 — mark replacements once

- Mark whole-part starting points, grouping changes and rules presets once at the part; later individual edits use the replacement as their checkpoint.
- Deduplicate shared marker outlets and keep exports/reference summaries consistent.
- Highlight seat counts only when they differ from the active reference.
- Carry the family chart colour into its bloc, with muted grey for everyone else and distinct sand for mixed lists.

## 4 November 2026 — concise family grouping labels

- Add bilingual short labels to all nine family presets while retaining full titles in their information sheets.
- Omit empty Mixed blocs and repeated family names/majority claims from family session summaries.
- Label and tint each member row consistently, retaining seat order for separated members.
## 4 November 2026 — fill-only chamber regions

- Remove region border strokes from current and reference chambers. Keep pale
  regions uninterrupted, without changing seat positions or counts.
- Add 1988 Haredi grouping stress cases with a 13-seat first and last bloc, covering
  both themes, languages and viewport sizes and rejecting region-outline strokes.


## 4 November 2026 — visual family profiles

- Replace family/compare dropdowns with stable-colour selection chips and hero charts with exact tooltips, pending points and shared scales.
- Move membership and historic-partner editing into a cross-election sheet; collapse exact figures and put import/export in Manage.
- Preview scaling with before/after seat strips; retain an unedited family lens and labelled member brackets on Overview.
- Compile a 41 KB runtime payload, lazy-load evidence/registry, and verify nested ChoicePicker dialogs and all responsive states.


## 4 November 2026 — party families

- Add nine sourced draft family interpretations with date-based share/count charts, exact totals and mixed-list policies.
- Add personal preset forks, hide/restore, browser-only storage, import/export and previewed registry relationship suggestions.
- Add atomic undoable family grouping and proportional vote scaling with frozen definitions and exact integer conservation.
- Keep one Haredi metadata source and validate all nine built-ins; add family model and bilingual/theme/viewport browser coverage.


## 4 November 2026 — graphics review and controls integration

- Use one active reference for summaries, edit markers, list details, Compare
  defaults, graphics and exports; preserve the scenario-switching checkpoint.
- Move No bloc between declared blocs and keep the majority scale counted from
  the physical left in Hebrew and English. Draw clean annular region unions.
- Show a small coloured reference chamber with outlined losses; simplify captions
  and use compact changed-list readouts, collapsed on desktop above five changes.
- Merge the controls branch from main, remove duplicate native grouping/colour
  selectors and their CSS hiding rule, and drive BoardChoices in browser tests.


## 4 November 2026 — graphics consistency

- Keep chamber geometry fixed, move names to wrapping legends, and enclose
  unassigned seats in explicit neutral No bloc regions in both themes.
- Add persistent neutral gain ordinal outlines, a labelled empty baseline loss miniature, dashed bloc references
  and list delta segments with old → new / signed readouts; share origin-aware change drawings across analysis tools.
- Correct list colour mode, Compare region treatment, dense slope label bounds,
  threshold qualification semantics and reduced-motion region transitions.
- Add 26-election and stress-case geometry/label checks plus bilingual theme and
  viewport screenshot coverage; record the audit and encoding contract.

## 4 November 2026 — election context and PM results

- Add sourced, dated election circumstances in an expandable bilingual context layer,
  including list-targeted notes and a single pending-publication warning.
- Show independent 1996/1999 Prime Minister results beside the chamber and a selectable
  2001 PM-only event linked to k15, with neutral majority markers and source-labelled totals.
- Preserve secondary/unverified fields and withdrawn nominees; retain/hash new evidence.
  Knesset datasets, seats and scenario actions are unchanged.
- Add metadata validation, PM reconciliation tests and bilingual/theme/viewport browser coverage.

Notable changes are recorded here using [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
conventions. The history records development commits, not tagged releases; the dated entry
below groups all existing commits from 3 November 2026. `package.json` currently says 0.1.0.

## [Unreleased]

### Added

- Always-visible scenario switcher with identity and result previews, Official result, and
  recoverable unsaved session drafts retaining undo history.
- Searchable election timeline with era groups, repeat-election dates and a distinct 2001
  PM-only marker, nearby elections and a preview/Open boundary; shared keyboard-operated
  pickers become phone sheets.
- Preview pickers for grouping, saved starting parts and colouring.
- Source-aware fine/coarse vote steps, searched “Reach next seat” with exact/sampled status,
  paired 1pp transfers, minimum-seat actions, threshold checkpoints,
  bloc scaling, turnout steps and reuse of official turnout, total steps and era thresholds.
- Browser coverage for scenario switching and unsaved recovery, keyboard/phone election
  navigation, exact +1 seat, +10k and undo, and bilingual/theme/viewport screenshots.

### Changed

- Simplify election browsing to one era timeline with official seat bars and in-place Open;
  keep neighbour arrows beside the header trigger and spell out repeated-election months.
- Replace quick-action walls with a shared numeric stepper, relevant goals and a More menu.
- Automatically balance scenario identity colours, deterministically migrate older saves,
  and show only exceptional source/rule details in switcher rows.
- Replace era side stripes with muted labels and hairline rules.

- Warn in both languages when candidate-cap counterfactuals depend on the inferred 1977
  procedure, and when known candidate shortages have no modelled procedure. Preserve the
  original 1977 result without a warning and unknown rosters without invented capacities.
- Qualify unresolved early ties only when they change seats; disclose internal quota
  fallbacks. Keep warnings beside affected lists and in the banner.
- Replace Custom dropdowns with grouped visibility segments and previews, fix its tab
  selection, bound chamber labels, and move About beside the election picker.
- Cover all elections' rendered chamber bounds and capture both languages/themes/viewports.


### Fixed

- Name saved comparison references consistently in English and Hebrew across list bars,
  accessible deltas, list details, phone results, session summaries and Compare; retain
  real-result labels for dataset-derived figures. Remove the duplicate summary identity.
- Compare matching saved custom bloc groupings, including before/after bars and session
  deltas; keep incompatible groupings without an invented counterpart.
- Commit scenario descriptions and names on blur or Enter as one undoable action.
  Description changes have a bilingual history label and shared edit marker, and replay
  through saves, shares and exports.
- Add B1/B2/B5 browser regressions, helper/grouping/action unit coverage and saved-reference
  screenshots in both languages, themes and desktop/phone sizes.


### Changed

- Show bilingual human change values and colour swatches instead of serialized inputs.
  Name removed agreements beside their markers, keep tooltips inside phone viewports, and
  label rule starting points by era, method, threshold and candidate cap (acceptance B3/B4).
- Complete shared starting points for votes, identity, structure, candidates and totals;
  blank candidate orders and zero-vote new lists are undoable.
- Add a single feature registry, in-place optional controls and browser-persisted Custom
  visibility settings with task groups and preset resets. Truth labels remain visible.

- Saved/loaded scenarios become the edit reference, with a browser setting to mark against
  the official result instead. Shared neutral glyphs explain previous inputs; Compare and
  session summaries name the reference. Candidate ordering is included in the diff.
- Scenarios gain undoable palette colours, chrome-only identity tint, saved/gallery swatches
  and one expandable name chip. Exports add no scenario footer.
- A shared “Start from…” selector resets or reuses blocs, agreements, rules and coalitions.
  Blank blocs create two empty named blocs with every list and party unassigned. Old unnamed
  grouping logs remain replayable. Coalition choices are now undoable scenario inputs.
- The remaining five starting-point editors and Custom level are deferred under the owner's
  bounded first-pass scope; existing level defaults are preserved.

- Wave 1 continuity: phone edit consequences remain visible; majority readouts share wording,
  and coalition membership uses In / Out / Any choices. Baseline, grouping and result status
  labels travel with results; Compare uses percentage points and aligns sourced bloc groupings.
- List edits show their vote-source assumption at every level, source-aware threshold
  checkpoints and search qualifications, plus an explanation linking crossings to the walkthrough.
  History and undo/redo name actions from the existing log. Level gates remain unchanged.

### Fixed

- **Acceptance repairs (4 Nov 2026).** Compare and coalition arithmetic respect member-level bloc moves;
  separately run lists share one official comparison. Seat safety preserves search qualifications.
  Phone election labels and named tools stay visible or accessible; table actions work by keyboard,
  Escape cancels drafts before closing panels, locality results retain historical names, and Compare
  draws change in neutral ink. The counting engine is unchanged.

- **Editing blocs (4 Nov 2026).** Editing blocs was four steps deep (a band, its detail, a Standard-only button, a
  table of menus) and renaming or recolouring was hard to find. Clicking a bloc, or "Edit blocs", now opens a bloc
  editor beside the chamber at every level: each bloc is a card whose name is edited in place and whose colour comes
  from a swatch; its seats are shown against the majority; its lists are chips that move by dragging, or by choosing
  one and then "Move here" (on touch and keyboard too). A party of a joint list moves on its own. "New bloc" and
  delete sit on the cards. Edits become "Your grouping" and the sourced groupings stay under "Start from".

- **Bloc regions easier to see (4 Nov 2026).** The pale bloc tints behind the chamber and in the bloc strip are about
  twice as strong, with a faint edge in the bloc's colour (stronger again in dark mode). The chamber's regions now
  step row by row between neighbouring blocs' seats instead of one straight cut, so no seat sits in another bloc's
  region where rows interleave (a unit test checks every seat).

- **Community gallery, locality map (4 Nov 2026).** The scenario gallery never reached GitHub: it called the
  browser's `fetch` as a method of its own object, which browsers reject ("Illegal invocation"); a unit test now
  guards it. The gallery sits on the Scenarios page in the app's own cards and controls, publishes the current
  scenario's name and description instead of asking for them again, and waits until the scenario has a change. The
  locality map opens fitted to Israel in a tall column on desktop; its drawing layer no longer covers the address
  search after the window narrows (the map frame is always positioned, so Leaflet's layers stay clipped).

### Changed

- **Visual board, owner feedback (4 Nov 2026).** The chamber leads the Overview; lists are a column of seat bars (the
  official seats as an outline, lists below the threshold showing how much of it they reached, split factions with
  their parties); a list opens in a side panel (a drawer on tool pages, a full-screen sheet on phones). Every tool is a
  full-width page that leads with its drawing: Compare shows the two chambers side by side, the blocs against 61 and
  a seat-change bar per list; Coalitions is a builder with a 120-seat bar and each smallest winning coalition drawn;
  Merge & split takes one task at a time with a drawn preview before applying. A new Scenarios page names, describes,
  saves, shares, compares, exports and restores scenarios; What-if questions preview in place and open as named
  scenarios. The election picker no longer flashes white-on-white while browsing it.
- **Redesigned interface ("Market Board", design brief in `.impeccable/surfaces/`).** The official result is the
  opening price and your edits are the session:
  - a navy band (election, level, scenario, undo/redo, save & share, language, theme) and a tools strip under it
    naming every tool at every level (tools above the current level say so and offer that level in place);
  - "What changed": one line of net effects (seats moved against the official result, bloc totals, majority),
    with the undoable history one click away;
  - blocs as pale tinted bands (and chamber wedges) behind their members, with a 61-seat milestone; a band opens
    its members in place, and moving parties between blocs is one button further;
  - the lists as a ruled table (logo, votes, share, seats, change, session trend, surplus partner); a list opens
    inside its own row: votes by number, share or a live slider (the whole board moves while dragging), the exact
    votes to the next seat and to losing one (computed on opening), the surplus partner as a selector with an
    on/off switch, its parties with their logos and blocs, a "Faction split after the election" switch beside
    the "What if they had run separately?" counterfactual, standing, identity and candidates;
  - key figures that open in place ("Votes that won no seat" lists every such list with votes and share);
  - neutral ink for gains and losses; a self-hosted typeface (IBM Plex Sans Hebrew) and drawn icons (Lucide).
  The previous interface is kept on the `legacy-layout` branch and the `layout-v1` tag.

### Added

- Election-specific partisan and neutral links for lists and constituent parties, with validated build/scenario metadata, verified source evidence and an explicit partial-coverage gap inventory (decision 0093).
- Locality results map with live scenario bloc/list colours, bilingual partial search, Photon address lookup, and retained CBS reference coordinates; unmatched and envelope rows remain unplaced.
- Standalone bilingual community scenario gallery backed by public GitHub Issues, with safe share-link publishing, cached browsing, search, filters and likes links (mounting pending).

- Official campaign logos may use fair-use identification (decision 0089), with explicit rights basis,
  campaign-date provenance, byte/hash validation and separate constituent-party emblems.
- Sourced geographic turnout groups for k16 and k18–k26, with bilingual definitions, classification
  years and coverage: Arab localities, kibbutzim, moshavim, Israeli localities in Judea and Samaria,
  Bedouin tribes, and dated Haredi, Druze and development-town reference cohorts. k17 explicitly
  remains unavailable because codes/electorates are missing. Exact demographic turnout model with
  signed replayable actions, overlap rejection and merged/split list mapping (decision 0090).

- Published on GitHub Pages at https://yiftahcooper.github.io/israel-elections/, redeployed on every push to `main`;
  a site icon (the browser no longer requests a missing favicon).
- Twenty-four more elections: 1949, 1951, 1955, 1959, 1961, 1965, 1969, 1973, 1977, 1981, 1984, 1988, 1992, 1996, 1999, 2003, 2006, 2009, 2013, 2015,
  April 2019, September 2019, 2020 and 2021 (Knessets 1–24), built from official sources, under each era's
  allocation law; every
  list's official seats are reproduced exactly (1977 uses an explicitly labelled, inferred rule for
  a list with fewer candidates than seats).
- Per-election bloc groupings (first government and recognised blocs), editable as “Your grouping”;
  constituent parties of joint lists can sit in different blocs without changing votes or seats.
- “Run as separate lists” with editable vote-share assumptions; each part faces the threshold
  separately and the joint list's surplus agreement is dropped.
- Experimental D’Hondt, modified Sainte-Laguë and largest remainder with a Droop quota in Expert.
- Sourced candidate notes for the 1984 Speiser misprint and five replacements before the first sitting.
- 1973 (8th Knesset): its list connections were found in the Central Elections Committee's own seat-calculation record
  (decision 0077); every seat reproduces, all 120 elected members are cross-checked, and three ballot letters and four list
  names were corrected from the notices. All 26 elections are now available.
- Party logos as used at each election (43 freely licensed files, credited in Sources); other lists keep their ballot letters.
- Candidate biography links: each candidate's Knesset member page, the party's own page (archived from the campaign
  where possible) and Hebrew Wikipedia, labelled as a secondary source; name-only matches are marked "probable".
- English-language Wikipedia is never used or linked; the 2003/2006 membership cross-check now uses the Knesset's official data.
- A 47-term bilingual glossary: (i) icons explain terms in the interface language, with a "learn more" link to the law,
  the Central Elections Committee or the Israel Democracy Institute (every link checked; no Wikipedia).
- Faster: heavy analyses run in background workers (no page freezes), tabs load on demand, searches skip
  provably equal counts (2–8× faster), with results identical to before.
- Accessibility and phone fixes: info icons open on tap, keyboard tab navigation, a readable chamber on phones,
  better contrast, and era-correct method names (no more "Bader–Ofer" for 1949–1969).
- Candidates the official results notice did not seat (e.g. 1999's Deri and Begin) are
  skipped when seats are filled, so the members shown match the notice.
- Clear messages where data is missing: unavailable or partial candidate rosters, and
  elections without locality results.
- A documentation map, contributor guidance and retrospective decision records.
- MIT licence for the code and documentation (official source documents excluded).

### Fixed

- Phones: no analysis tab scrolls sideways any more (Sources credits, agreement chips, the 1973 walkthrough's long step names and side-by-side sections now wrap or stack). Checked across all 26 elections, three levels and both languages.
- The Sources note no longer says blocs and colours are assigned by the app; they follow the sources given for each grouping and party.
- Elected members' names in 1949–1999 re-read from the official scans and checked against the Knesset's
  official opening-day membership for every election: 53 roster corrections (for example 1981 Sarah Doron,
  Dror Zeigerman, Moshe Harif, Mohammed Wattad; 1996 Haim Dayan, Yehuda Lancry). In 1988 the Likud seats now
  follow the results notice: Yosef Goldberg is restored at #32, and Michael Reiser (#25), whom the notice does not list, is not seated.

### Changed

- The build merges party, bloc and colour research from `data/meta/`; associated colours need
  medium/high confidence and readable lightness, with a neighbour check for list colours and
  fallback to the app palette. Build and release tests share `finalizeDataset`.
- Differential digest tests lock engine/model outputs; `PW_PORT` isolates browser-test servers.
  Impeccable design critiques are archived in `.impeccable/`.
- Reworked the project overview for readers who are new to the app; moved detailed
  development guidance into its own document.
- Rebuilding the data no longer rewrites unchanged files: a dataset keeps its build timestamp
  until its content changes, so a clean rebuild leaves nothing to commit or restore. The
  builder shares one set of validation, roster and locality rules across all elections and
  builds elections in parallel (about 3.6 s → 1.2 s here). Published data is unchanged.

## 2026-11-03

### Added

- An exact Bader–Ofer seat calculator with official-source datasets for 2022 and 2026,
  source records, dataset consistency checks and allocation tests (`8053f70`).
- A Hebrew/English explorer with a seat chamber, candidates, vote editing, mergers,
  splits, surplus agreements, comparisons, turnout modelling and analysis. Browser-local
  scenario saving, share links, import/export and automated checks followed (`ad479ee`).
- “What if…” tools, seat security, coalition views, clearer comparisons and reset controls
  (`98f4518`).
- Historical sources for **2003–2021**, plus election-specific 1.5%, 2% and 3.25%
  threshold presets. Those historical elections are **not yet available**: datasets
  still need building and verification (`b7229cc`).
- Three interface levels — **Simple, Standard and Expert** — and an election picker
  that marks unfinished datasets unavailable. Switching elections retains work during
  the current session (`2fd4152`).

### Changed

- Unified vote controls around an explicit choice of where votes come from, and introduced
  a simpler starting view (`98f4518`); the later three-level interface replaces that
  earlier two-level arrangement (`2fd4152`).

### Fixed

- Vote-slider behaviour and vote-edit consistency (`98f4518`).
- Browser-test setup for tools that required the earlier Advanced view (`eb62344`).
- 2026 data parsing and candidate handling, scenario replay/reset behaviour, invalid-edit
  checks and several display problems found during review (`8f1406e`).
- Analysis claims for sampled searches and sweeps, comparison handling after structural
  changes, allocation walkthrough details and further model/data checks (`2abba95`).
