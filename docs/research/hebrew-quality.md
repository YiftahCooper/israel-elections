# Making the app's Hebrew read well

*Written 7 November 2026; rewritten in plain language on 8 November 2026. Nothing was removed: every fact, date, number and source of the earlier version is kept.*

## In short

- **What this is about.** Much of the app's Hebrew reads like English translated word for word. This document asks what would actually fix that: software, an AI skill, a different AI model, or a human Hebrew editor.
- **Why it exists.** The owner said the Hebrew is poor and asked whether a tool could fix it. This is the research answer. It is research only: no app text was changed, nothing was installed and nothing was bought.
- **What was found.** The main problem is wording, not spelling. Examples: English-shaped metaphors ("the strength of the list"), stiff noun phrases, and labels that don't say what is being counted. Spell checkers cannot catch this. A person who writes Hebrew well can.
- **No tool fixes it alone.** Mainstream proofreaders (LanguageTool, Grammarly, Ginger) do not proofread Hebrew. Google Docs has no Hebrew grammar check. Microsoft Editor has Hebrew grammar only in its web version and is at best an optional second opinion. Free Hebrew spell-check dictionaries (Hspell) are useful as an automatic test that stops misspellings coming back.
- **What is recommended.** Three steps: (1) a short Hebrew style guide and terms list for this app, built from official sources; (2) every new or changed Hebrew string goes through an editing pass based on that guide, plus an automatic spelling check; (3) a native Hebrew copy editor reviews the whole app once, then only new text. A small open-source Hebrew "AI skill" is worth a trial inside step 2, not as the fix.
- **A worked sample.** The document proposes better Hebrew for 25 real strings from the app, plus the sentence about splitting joint-list votes that the owner flagged. These are proposals: no native editor has approved them yet.
- **Cost.** A professional editor costs roughly ₪200–600 per 1,000 words (a planning range from two published price lists, not a quote). Local spell checking has no running cost.
- **What the owner needs to decide.** Nothing has been decided about Hebrew yet. The question is question 18, "Making the app's Hebrew good", on the [questions page](https://claude.ai/artifact/VNauxmRhqwnzvx8JYsxqCu). The options there: **18a** all three steps with a paid editor, starting with a 25-string trial (recommended); **18b** steps 1 and 2, with the owner reviewing instead of an editor; **18c** tools and AI only, with no human review. The quickest help (about 10 minutes): reply with the row numbers from the table below that still read badly.

## What we were trying to find out

The question was: which practical combination of tools and people gives short, accurate, natural Israeli Hebrew for the app's screens, without changing what any electoral term means?

We looked at four things separately, because a tool can be good at one and useless at another:

- **spelling**;
- **grammar**;
- **idiom and register** (register means the level of formality and tone: whether a sentence sounds like a friendly app, a government form or a legal text);
- **electoral meaning** (for example, keeping "list", "party" and "faction" distinct).

We also looked at whether each option can be automated, what it costs, what its licence allows, and where the text is sent. A vendor saying "we support Hebrew" is not a measurement of how well it edits Hebrew.

What was read: the project's product and design notes, the current changelog, the task briefs, the owner's relevant messages (including his request for short caveats and his rejection of literal translations of political labels), and the existing glossary research. Searches covered five areas: Hebrew language-technology tools; mainstream proofreaders; official language and terminology references; AI skills, connectors and models; and professional editors. A deliberate challenge pass then looked for exceptions: whether Microsoft's support pages make Hebrew exceptions, whether Grammarly's newer multilingual support covers Hebrew, whether any real Hebrew editing skills exist, and what spelling-only checks miss. Claims about what a product does come from the vendor's or project's own pages, not from reviews or popularity.

**How sure each statement is.** Statements are labelled by where they come from:

- **Observed**: seen in the app's own text;
- **Documented**: read in the maker's own published material;
- **Judgment**: an editorial recommendation;
- **Estimate**: a planning allowance;
- **Unverified**: not demonstrated here.

Prices are what the pages showed when checked, not quotes or guaranteed current offers. This is not a survey of the whole market.

## What is wrong with the Hebrew: a 25-string sample

In this hand-picked sample, the main problem is **wording, not misspelling**:

- **English-shaped metaphors** (calques, or "translationese": a phrase copied word for word from English that sounds foreign in Hebrew);
- **compressed technical nouns** strung together;
- **bureaucratic passive sentences**;
- **labels that don't say what is being counted**.

Some existing strings are fine. The sample was chosen for editing practice; it does not measure how many strings in the app are faulty.

**Kinds of problem.** Each row is tagged with one or more letters:

| Letter | Meaning |
|---|---|
| T | Translationese: a word-for-word copy of English (a calque) |
| W | Word order, or unclear what a word refers to |
| R | Register: wrong tone or level of formality |
| G | Gender or number agreement (for example, a masculine verb with a feminine noun) |
| K | Inconsistent spelling |
| P | Punctuation |
| E | Electoral terminology |

These are editorial judgments, not automatic breaches of the Academy of the Hebrew Language's rules. In particular, "ניתן" ("it is possible to") and passive sentences are not wrong in themselves. These 25 rows did not show any general inconsistency between full and defective spelling (כתיב מלא / חסר: Hebrew with or without the extra vowel letters ו and י). Row 24 is about the spelling of one proper name; it is not a reason to apply full spelling to names blindly.

**How to read the table.** "Before" is the app's text exactly as it was, including placeholders such as `${r.failed}` where the app inserts a number. "Proposed after" keeps those placeholders. The "Where in the app" link goes to the exact line of code at the time of the research. Longer sentences belong behind an (i) button or in a short warning that disappears; none of these explanations should become a permanent paragraph on screen.

| # | Where in the app | Before | Proposed after | Why (kind of problem, in plain words) |
|---|---|---|---|---|
| 1 | [Loading message](../../src/app/App.tsx#L175) | טוען נתוני בחירות… | נתוני הבחירות נטענים… | R: "טוען" implies an unexplained male speaker ("[I am] loading"). The proposal is a neutral status line. |
| 2 | [Toolbar note](../../src/app/App.tsx#L203) | עוד ברמות אחרות | כלים נוספים ברמות אחרות | W: say what "more" refers to (more tools), while keeping the fact that there are several other levels. |
| 3 | [Button](../../src/app/App.tsx#L265) | חזרה לכללים האמיתיים | חזרה לכללים ההיסטוריים | E/R: "the real rules" sounds moralising. The button restores the historical election rules. |
| 4 | [Main help (i)](../../src/app/App.tsx#L268) | לחצו על כל רשימה, מושב, גוש או נתון כדי לראות ולשנות את מה שמאחוריו. כל הכלים מופיעים בשורה שמתחת לכותרת. | לחצו על רשימה, מנדט, גוש או נתון כדי לפתוח את פרטיו ולערוך שינויים. הכלים מופיעים מתחת לכותרת. | T/E: replace "what's behind it". Use מנדט (a seat won in the election) in the interactive results. Before shipping, check that clicking really does allow an edit. |
| 5 | [Compare: how two parties are related (i)](../../src/app/compare/dialogs.tsx#L28) | המפלגה לא השתנתה אך שינתה את שמה (שושלת מתועדת). | זו אותה מפלגה בשם חדש (הקשר מתועד במקורות). | T/E: שושלת sounds like a royal dynasty. Also, don't imply a registry source that the original text doesn't name. |
| 6 | [Compare: how two parties are related (i)](../../src/app/compare/dialogs.tsx#L29) | המפלגה רצה כעת בתוך רשימה משותפת בראשות מפלגה אחרת (מרשם המפלגות). | המפלגה מתמודדת כעת ברשימה משותפת בראשות מפלגה אחרת (מרשם המפלגות). | R/W: "runs inside" becomes "competes on". The source (the Registrar of Parties) is kept. |
| 7 | [Compare: caveat](../../src/app/compare/dialogs.tsx#L31) | מפלגותיה רצות כעת בכמה רשימות. אין לחלק את קולותיה לפי רשימה. | המפלגות שהרכיבו אותה מתמודדות כעת ברשימות נפרדות. אין נתונים על חלוקת קולותיה ביניהן. | E/R: the point is that there is no data on how the votes split, not that the user is forbidden to split them in the sandbox. |
| 8 | [Compare: limit warning](../../src/app/compare/dialogs.tsx#L70) | מוגבל ל־${fmtInt(plan.capped)} הנמנעים | השינוי מוגבל למספר הנמנעים: ${fmtInt(plan.capped)} | W: say what is limited. Keep the limit itself (the number of non-voters), rather than suggesting someone chose an arbitrary number. |
| 9 | [Compare: copying modes (i)](../../src/app/compare/dialogs.tsx#L93) | שיעור שומר על כוח הרשימה: חלקה מכלל הקולות הכשרים. מספר מעתיק את מספר הקולות, ולכן ציבור בוחרים גדול או קטן יותר משנה את כוחה. המנדטים תמיד מחושבים מחדש. | בהעתקה לפי שיעור נשמר חלקה של הרשימה בקולות הכשרים. בהעתקה לפי מספר נשמר מספר הקולות, ולכן חלקה עשוי להשתנות אם מספר המצביעים שונה. בשני המקרים המנדטים מחושבים מחדש. | T/E: remove the literal "strength". Explain both copying modes clearly, and keep the fact that seats are always recalculated. |
| 10 | [Compare: heading above choices](../../src/app/compare/dialogs.tsx#L102) | שימוש בבחירה | מתי להשתמש בבחירה? | R/W: the options below answer a question, so the heading should be one. |
| 11 | [List panel: typing a seat target (i)](../../src/app/components/ListDetail.tsx#L246) | הקלידו מספר מנדטים: יועברו הכי מעט קולות שמביאים אותו. | הקלידו מספר מנדטים. יועבר מספר הקולות הקטן ביותר הדרוש להשגתו. | W/R: in "bring it", it is unclear what "it" is. The proposal keeps the original claim that the smallest number of votes is moved. Whether that claim is true needs checking in the calculation code; an editor's approval cannot confirm it. |
| 12 | [List panel: action label](../../src/app/components/ListDetail.tsx#L260) | הכי מעט קולות לשמירת ${lr.seats} מנדטים | מינימום קולות לשמירת ${lr.seats} מנדטים | R: a short, familiar label. It does not claim any more certainty than before. |
| 13 | [List panel: surplus agreement (i)](../../src/app/components/ListDetail.tsx#L303) | כבוי: שתי הרשימות מתחרות לבד על המנדטים הנותרים. | ההסכם מושבת: כל רשימה מתחרה בנפרד על המנדטים הנותרים. | T/W: "both compete alone" becomes "each competes separately". (A surplus agreement lets two lists pool their leftover votes for the last seats.) An agreement that is switched off is not an invalid agreement. |
| 14 | [List panel: warning](../../src/app/components/ListDetail.tsx#L304) | לא מותר לפי הכללים. | הכללים אינם מאפשרים זאת. | R: natural Hebrew instead of a literal "not allowed". |
| 15 | [List panel: result line](../../src/app/components/ListDetail.tsx#L305) | השפעה: אין — אותם מנדטים גם בלעדיו. | אין שינוי במנדטים גם בלי ההסכם. | T/W/P: replace the fragments ("Effect: none —") with the concrete effect. |
| 16 | [Recovery warning](../../src/app/store.ts#L275) | ${r.failed} שינויים לא ניתן היה להחיל מחדש על הנתונים הנוכחיים. | לא הצלחנו להחיל מחדש ${r.failed} שינויים על הנתונים הנוכחיים. | W/R: natural word order; the number of failed changes is kept. It also needs a singular version for when the number is 1. |
| 17 | [Notice about unsaved changes](../../src/app/store.ts#L310) | השינויים שלא נשמרו נשארים במחליף התרחישים למפגש זה. | התרחישים עם השינויים שלא נשמרו זמינים ברשימת התרחישים עד לסיום השימוש הנוכחי. | T/E: "scenario switcher" and "session" are developer words; use the user's words. Don't promise the changes survive closing and reopening the app. |
| 18 | [Storage warning](../../src/app/store.ts#L416) | הדפדפן סירב לשמור (האחסון מלא או חסום). ייצאו את התרחיש כקובץ JSON במקום. | לא הצלחנו לשמור בדפדפן: האחסון מלא או חסום. אפשר לייצא את התרחיש לקובץ JSON. | R: say plainly what failed and what to do, without making the browser a person who "refused". |
| 19 | [Edit history line](../../src/app/actionDescription.ts#L58) | עדכון בעלי זכות / פסולים | עודכנו מספר בעלי זכות הבחירה ומספר הקולות הפסולים | E/W: numbers were changed, not people. Keep both quantities (eligible voters and invalid votes). |
| 20 | [Edit history: restore line](../../src/app/actionDescription.ts#L73) | שוחזרו בעלי זכות הבחירה והפסולים | שוחזרו מספר בעלי זכות הבחירה ומספר הקולות הפסולים | E/W: the same repair, used consistently in the history and restore summaries. |
| 21 | [After the election: role heading](../../src/app/components/AfterElection.tsx#L88) | חברי הקואליציה | סיעות הקואליציה | G/E: the neighbouring category uses חברות, and the entries are factions (party groups in the Knesset), not a list of individual members. Keep labels about individual MKs separate. |
| 22 | [After the election: vote history (i)](../../src/app/components/AfterElection.tsx#L113) | הסכומים שווים; אין בכך אישור להצבעתו של כל חבר כנסת. | המספרים תואמים, אך אין בכך כדי לקבוע כיצד הצביע כל חבר כנסת. | R/E: keeps the crucial difference between "the totals match" and "we know how each member voted". |
| 23 | [After the election: review status](../../src/app/components/AfterElection.tsx#L155) | היסטוריה מתועדת · נבדק | היסטוריה מתועדת · נבדקה | G: make the verb agree with the feminine noun on screen. Check whether the intended subject is instead the whole dataset. |
| 24 | [Seat-method label](../../src/app/changeValue.tsx#L12) | באדר–עופר | בדר–עופר | K/E: match the spelling in the existing glossary, the calculation code and the Israel Democracy Institute (IDI). Keep official names exactly as written elsewhere. (Bader–Ofer is the method Israel uses to share out the last seats.) |
| 25 | [Walkthrough: calculation explanation](../../src/app/components/Walkthrough.tsx#L120) | השברים נמחקים. | התוצאה מעוגלת כלפי מטה למספר שלם. | T/E: explain the operation (the result is rounded down to a whole number) without suggesting that stored votes are deleted. The code does round down. |

### The sentence the owner flagged

The exact sentence the owner quoted was **not found in the app's code at the time of the research**, so it is not counted among the 25. Its useful content is the caveat about what we can and cannot know. Its problem is the abstract phrase "הפיצול כאן הוא הנחה לתרחיש" ("the split here is an assumption for the scenario"), not necessarily its spelling or grammar.

Before: הקול ניתן לרשימה כולה. תוצאות הבחירות אינן מגלות איזו מפלגה בתוכה העדיף כל בוחר — הפיצול כאן הוא הנחה לתרחיש.

Proposed short warning: **חלוקת הקולות בין המפלגות היא הנחה בתרחיש.**

Behind the (i): **מצביעים לרשימה, לא לכל מפלגה בנפרד. מתוצאות הבחירות אי אפשר לדעת כמה מהמצביעים העדיפו כל מפלגה ברשימה.**

This is about splitting **votes**. It should not be reused for the documented split of elected MKs by party, and it should not suggest that party membership itself is unknowable. The owner allows splits in the sandbox with this caveat. It must never become a flat ban on splitting.

## Tools: what each one really does, and whether it fits this app

Each tool is labelled with a source number (S1, S2 …) so the claims can be traced in the table of evidence near the end.

| Tool and evidence | What it checks; how well it fits Hebrew | Licence and cost | Can it be automated? Where does the text go? | Verdict |
|---|---|---|---|---|
| [Hspell README](https://raw.githubusercontent.com/ivrix/hspell/master/README) (S1). Hspell is a free Hebrew spell checker. | Hebrew word spelling and word forms (inflection and morphology). It aims at the Academy's spelling without vowel marks. It does not judge whether a sentence sounds natural. | Free. The AGPL v3 licence covers the code **and the word lists**. | Runs on your own computer from the command line. The original version expects text converted to an old Hebrew encoding (ISO-8859-8). No text is uploaded. | A useful mechanical layer. Pin the exact release, and check how well it covers the 2017 spelling rules and this project's exceptions. |
| [Hunspell-compatible dictionary-he](https://github.com/wooorm/dictionaries/tree/main/dictionaries/he) (S2). Hunspell is the spell-check engine used by many browsers and editors. | A Hebrew dictionary for Hunspell in modern encoding (UTF-8), derived from Hspell. It is the same source family as Hspell, so it is not a second independent judge. | The Hebrew dictionary is AGPL-3.0; the engine has its own licence. This app's code is MIT-licensed, so keep the dictionary in development and test tooling and don't casually bundle it into the published website. | Documented ways to use it from Node (nspell, nodehun) or a local Hunspell he_IL dictionary. Pin the dictionary version and licence. Nothing goes to the cloud. | Prefer this for automatic tests over converting encodings. Two packages with the same name don't prove that every he_IL dictionary contains the same data. |
| [Dicta Nakdan](https://nakdanlive.dicta.org.il/about), [Nakdan paper](https://aclanthology.org/2020.acl-demos.23.pdf), [DictaBERT morphology](https://huggingface.co/dicta-il/dictabert-morph) (S3). Dicta is an Israeli Hebrew language-technology group. | Adding vowel marks and analysing word structure are real capabilities. They do not show a grammar or style corrector for app text. The "about" page (seen only as a search extract; the full page failed to load) describes full and defective spelling while adding vowels. | The 2020 paper describes free access; that is not a current service contract. The word-structure model's licence is CC-BY-4.0. Licence, limits and data retention of the hosted Nakdan were not checked. | The model page includes Python examples for running it locally. Unofficial Nakdan clients exist; no official Nakdan service with guarantees was found. The hosted service receives your text; a local model avoids that. | Valuable Hebrew technology, but the wrong main remedy for app text without vowel marks. No integration is justified here. |
| [Microsoft language matrix](https://support.microsoft.com/en-us/word/editor-s-spelling-grammar-and-refinement-availability-by-language), [Editor service](https://support.microsoft.com/en-us/word/microsoft-editor-checks-grammar-and-more-in-documents-mail-and-the-web) (S4) | Documents Hebrew spelling, grammar and style suggestions, but Hebrew grammar and suggestions are **not yet in desktop Word**. So it depends on the platform; it is not true that "Word always checks Hebrew grammar". Its accuracy was not tested here. | Proprietary. The basic service is free; advanced suggestions need Microsoft 365. The current Israeli price was not checked; use an existing subscription first. | Manual use in the web version that supports it. No public general proofreading interface for programs was found. Microsoft says the Edge browser's Editor sends typed text to its cloud. | The best mainstream candidate for a small optional trial on public app text, not an automatic pass/fail check. |
| [Google Docs help](https://support.google.com/docs/answer/57859?hl=en-GB) (S5) | The official spelling-and-grammar help lists six languages and leaves out Hebrew. Being able to type right-to-left, or seeing a browser's red spelling underline, does not mean Hebrew grammar is checked. | Proprietary; a free consumer editor; Workspace is the paid business version. | Good as a shared review sheet; no Hebrew proofreading interface for programs was found. Shared documents are stored by Google. | A place to collaborate, not a proven Hebrew editor. How Hebrew spell check behaves across apps was not tested. |
| [LanguageTool languages](https://help.languagetool.org/hc/en-us/articles/39254526141463-What-languages-does-LanguageTool-support) (S6) | Hebrew is missing from the free list; Premium covers the same languages. | Free and Premium versions; the price doesn't matter for Hebrew. Licences differ between software and service. | Its programming interface and self-hosting don't add missing Hebrew rules. The cloud version sends text outside. | Reject for Hebrew. Possibly useful for English separately. |
| [Grammarly languages](https://support.grammarly.com/hc/en-us/articles/115000090971-Does-Grammarly-support-languages-other-than-English) (S7) | Grammarly now covers several languages, but Hebrew is not on its documented suggestion list. Translation support is not proofreading. | Proprietary (Free, Pro and others); no purchase recommended. | No Hebrew proofreading automation found; the hosted service processes your text. | Reject for Hebrew. Don't repeat the out-of-date claim that it is "English only". |
| [Ginger support](https://help.gingersoftware.com/hc/en-us/articles/4403495427858-Which-Languages-Does-Ginger-Work-With) (S8) | The maker explicitly limits grammar and writing improvement to English; translation into other languages is separate. | Proprietary; translation is in Premium; nothing relevant to spend on Hebrew. | No usable Hebrew proofreader or interface shown; the hosted service receives the text. | Reject as a Hebrew proofreader, whatever the company's origin. |
| [Morfix terms](https://android.morfix.co.il/ver5-4/about/license.htm), [Rav-Milim subscription contact](https://www.ravmilim.co.il/tempsec/purchase/contactUs.aspx?origin=ravmilim&type=PhonePurchase), [Melingo current FAQ](https://melingo.com/faq/) (S9). Morfix and Rav-Milim are Hebrew dictionaries by the company Melingo. | Dictionaries help choose a single word; they can't tell whether an election warning sounds natural. Melingo's current FAQ describes AI and customer-service integration, not a Hebrew proofreading service. | Proprietary. The Rav-Milim subscription price could not be checked (the page refused access, error 403). The Morfix terms forbid harvesting word lists in bulk; the terms page that was read is an old one that points to current terms. | No licensed Hebrew proofreading interface or price found. Dictionary lookups go to the company; get specific business terms before automating anything. | Optional manual reference. Don't scrape a glossary from it, and don't mistake a customer-service integration for a language checker. |
| [Academy terminology](https://terms.hebrew-academy.org.il/Home/About), [orthography](https://eng.hebrew-academy.org.il/our-work/language-decisions/orthography/), [punctuation](https://eng.hebrew-academy.org.il/our-work/language-decisions/punctuation/) (S10). The Academy of the Hebrew Language is the official authority on Hebrew. | Authoritative references. The terms database is **not a general dictionary**. The punctuation guidance explicitly leaves room for judgment. | Free to read; no licence or interface for bulk reuse was found. A page that is free to read is not open data. | Look things up by hand and cite the decisions; write our own short rules rather than copy the database. No need to send whole strings anywhere. | The standard for spelling and punctuation. It is not a reason to prefer obscure official coinages over clear everyday Israeli app language. The Hebrew rules page and PDF refused access here (error 403). |
| [Government digital-language programme](https://harhayeda.gov.il/digitalit/effective-digital-writing-in-the-public-sector/), [linked government guide PDF](https://harhayeda.gov.il/media/hnuiplox/1757068613_%D7%9E%D7%93%D7%A8%D7%99%D7%9A_%D7%90%D7%A4%D7%99%D7%95%D7%9F_%D7%A9%D7%A4%D7%94_101124.pdf) (S11) | The programme sets up a guide for writing digital public services. The guide itself was not read: the file was too large for the research tool. Targeted searches found no public house-style manual from IDI or the Knesset. | Free to read; no licence for machine reuse or checking interface found. | Human guidance; can be kept for offline reference where lawful. The programme and the guide are one government source family. | Relevant for tone. This document does not claim to follow clauses it has not read. Knesset and IDI explainers are sources for terms, not style manuals. |

## AI skills, connectors and a second AI model

**An existing, relevant skill.** An "AI skill" is a packaged set of instructions an AI assistant follows for one kind of task. [skills-il/localization's hebrew-ai-text-humanizer](https://github.com/skills-il/localization/tree/master/hebrew-ai-text-humanizer) (S12) was read in full (its instructions and its catalogue of patterns). It is MIT-licensed. It targets awkward translated Hebrew, register, how the reader is addressed, agreement and punctuation. It has an optional local Python scanner and a manual route.

- Its rules are the author's own rules of thumb, not a validated Hebrew grammar engine. Its separation between style advice and real rules is useful.
- Some of its blanket preferences need judgment: an accurate technical term or a valid passive sentence is not a defect.
- It does not provide our election glossary.
- Text goes wherever the chosen AI model processes it; the skill itself guarantees no privacy.
- **Worth a trial with a pinned, reviewed version. Not a global install, and not an automatic rewrite.**

**A broader plugin.** [yodem/hebrew-book-producer](https://github.com/yodem/hebrew-book-producer) (S13), MIT-licensed, describes separate agents for language editing and proofreading. Its workflow and optional extra services (CandleKeep, Sefaria) are built for books, not app labels. A repository's existence proves neither editing quality nor that it fits elsewhere. AI usage costs still apply. Don't install an entire book-production system to edit labels.

**Connectors.** A connector (MCP server) lets an AI assistant use an outside service. Targeted public searches found no purpose-built, official, tested Hebrew proofreading connector worth recommending. That is "not found in a limited search", not proof that none exists. A connector that merely wraps an AI model or LanguageTool doesn't improve Hebrew coverage. No new connector is needed.

**A second AI model.** Run the same context-rich packet of strings through a different general AI model the owner already has. Optionally also try [DictaLM-3.0-1.7B-Instruct](https://huggingface.co/dicta-il/DictaLM-3.0-1.7B-Instruct) (S14), a small Hebrew/English model whose page documents its training, the Apache-2.0 licence and how to run it locally.

- Don't assume it edits app text better because it does well on a Hebrew test or because it is small.
- Running it yourself avoids per-request fees but needs computing power and setup; running locally keeps the text local.
- Hosted models have their own data-retention rules and token costs, which were not checked.
- No model has been shown to be best, and no paid experiment was run.

**A fair next experiment.** Use the 25 rows, with each string's purpose on screen, its placeholders and its factual limits. Compare five versions: the original, this document's proposal, the second model, Microsoft Editor where it works, and a native editor. Hide who wrote each version. Ask the owner or editor to judge three things separately: does it sound natural, is it short, and does it keep the meaning? A version that changes a negative, a source note, a number or a level of certainty fails, however fluent it is. Keep a small set of strings back before reusing accepted examples in instructions. Record the model, version, date, instructions and actual usage. Never advertise a "Hebrew quality score" based on pattern matches. This experiment has not been run; it is a proposal, not evidence.

## A professional editor, and a realistic budget

Ask for an **עורך/ת לשון עם ניסיון במיקרוקופי ובמונחי בחירות**: a Hebrew copy editor experienced in short app text ("microcopy") and election terms, not simply someone who translates English into Hebrew. A native speaker may spot awkward phrasing without knowing the electoral distinctions; a specialist editor may still need someone who knows the subject. Pay for a sample first, using these 25 strings with their context, before commissioning the whole app.

Price anchors from the editors' own pages (S15):

- [Shirley Guy](https://www.shirleyguy.co.il/linguistic-editing/) publishes an indicative market range for full editing including rewriting of ₪50–80 per 250 words. That works out at **₪200–320 per 1,000 words**. This is our arithmetic on her estimate, not a quote from her and not a measured market rate.
- [Kamatz Katan](https://www.kkatan.com/cost) lists ₪50 for proofreading, ₪100 for language editing and ₪150 for content editing per 250-word page: **₪200 / ₪400 / ₪600 per 1,000 words**, with a **₪400 minimum**, VAT not included. The same page says websites may need a quote for the whole job or by the hour.
- So plan for **₪200–600 per 1,000 words**, plus any minimum charge, VAT and platform fee. Reviewing app text in context can cost more. Don't estimate a price for the whole app until the unique strings are counted and it is agreed how to charge for placeholders, repeated labels, screenshots, glossary work and rounds of revision. An older academic price list is not a good guide for app text.

Where to find editors: directly (above); a [Fiverr Hebrew editing listing](https://www.fiverr.com/may2311/proofread-and-edit-your-hebrew-text); [ProZ's Hebrew jobs and directory](https://www.proz.com/hebrew-translation-jobs/); [XPlace for finding Hebrew editors](https://www.xplace.com/il/u/ofer2771) (S16). The ProZ and Fiverr pages were opened. The XPlace profile came back mostly as an empty template, so that person's experience was not assessed. These are places to get samples and quotes, not recommendations of individuals. Nobody was contacted or hired.

Working with an editor:

- Human review is a manual approval step. Accept their edits by a stable string ID or a reviewed list of changes, not by copying from a platform's pages.
- Agree who owns the result and how it may be used, confidentiality, whether the editor uses outside AI, and how long they keep the text.
- Send only public app text and its context. There is no reason to send private scenarios, browser data, passwords or keys, or the owner's unpublished comments.

## The recommended process

### Step 1: a basis for editing (estimate: half to one working day, then human review)

Reuse the app's existing glossary and its source notes; don't create a second, competing glossary. Add a short companion Hebrew style guide and a terms file that a program can read. For each term it records: the preferred form, allowed forms, forms to avoid in a given context, grammatical gender, where it applies, its source and the reason for any exception. These files are proposals; this task did not create them.

Starting decisions to review:

| Concept | Preferred form in the app, and where | Evidence or status |
|---|---|---|
| What appears on the ballot | רשימה (list); רשימת מועמדים (list of candidates) when explaining the legal object | The [Central Elections Committee's official results](https://votes25.bechirot.gov.il/nationalresults) (S17) label lists, ballot letters and seats explicitly. Don't replace them all with מפלגה. |
| Party / Knesset faction | מפלגה (party) and סיעה (faction, the party group inside the Knesset), both kept distinct from רשימה | The existing sourced glossary. A [Knesset explanation](https://main.knesset.gov.il/mk/Faction/Pages/FactionEtc.aspx) was found, but it redirected to a location block here. Re-check the official text before marking new definitions as verified. |
| A seat / a physical place in the chamber | מנדט for a seat won in the election; מושב only where the context calls for it | The Central Elections Committee uses מנדטים. This is a house choice, not a claim that מושב is wrong Hebrew. |
| Threshold | אחוז החסימה (the minimum share of the vote a list needs to win seats) | Existing sourced glossary. Use the full term where the idea is first introduced. |
| Surplus agreement / seat method | הסכם עודפים / בדר–עופר | [IDI explainer](https://www.idi.org.il/articles/33757) (S18). This is different from the formal legal term already kept in the glossary. |
| The real result versus the user's version | התוצאה הרשמית (the official result); תרחיש (scenario) for a user's alternative | A product rule set by the owner. Never imply that a scenario is real history. |
| Minimum | מינימום in short labels; המספר הקטן ביותר הדרוש (the smallest number needed) in explanations | House style, not an official required term. Distinguish what is proven from what was sampled. |
| How the reader is addressed | Plural instructions (לחצו) or neutral action nouns; agreement follows the actual subject | Proposed house style for a mixed audience. Never guess a candidate's gender from their name. |

Use the Academy's spelling decisions for ordinary text. Keep historical, legal and party names exactly as the sources write them. Choose one consistent style for the maqaf (the Hebrew hyphen), the geresh and gershayim (the apostrophe-like marks used in abbreviations, such as the ״ in חה״כ) and other punctuation in app text, while leaving quotations and code untouched. Never run a global punctuation replacement over web addresses, formulas, names or quoted evidence. The Academy's punctuation overview explicitly allows stylistic judgment, so not every dash is a grammar error.

### Step 2: editing in context (estimate: 1–2 developer days for the inventory and a first automatic pass; editing time to be quoted)

First, list every Hebrew string with its context. In this app that cannot be done by searching one translation file, because most text is written inline next to its English. The list must also include conditional text, templates, settings, glossary entries, history summaries and the hidden names used by screen readers. Strings that come from the data go in a separate, read-only list. For each string, record: where it is, a fingerprint so changes are noticed, its role on screen, the full sentence, its placeholders and its English pair. Merge exact duplicates but keep every place they are used, because the same words may need different edits in two places. Don't move all the text into a new system just to edit it.

Then edit with a dedicated Hebrew-editor role (later, perhaps, a small project skill) using this instruction, kept verbatim:

> ערכו לעברית ישראלית טבעית, קצרה ועניינית, לקהל שאינו מכיר את שיטת הבחירות. התחילו מהמשמעות ומהפעולה במסך, לא מסדר המילים באנגלית. כותרת או כפתור: מילים מעטות; הסבר: מאחורי (i). פעלו לפי מילון המונחים והדוגמאות שאושרו. שמרו על מספרים, שמות, קישורים, משתנים, שלילה, מקורות ורמת הוודאות. הבחינו בין רשימה, מפלגה וסיעה, ובין נתון מתועד להנחה בתרחיש. אל תהפכו אי־ידיעה לאיסור. אם עריכה עלולה לשנות משמעות, סמנו זאת לבדיקה במקום לנחש. החזירו לכל מזהה: לפני, אחרי, סיבה והאם נדרשת בדיקת תוכן. בדקו התאמה גם עם 0, 1 ו־2, לפי מין ושם העצם בפועל.

(In English: edit into natural, short, matter-of-fact Israeli Hebrew for readers who don't know the election system; start from the meaning and the action on screen, not English word order; headings and buttons are a few words, explanations go behind (i); follow the approved terms and examples; keep numbers, names, links, placeholders, negatives, sources and certainty; keep list, party and faction distinct, and documented facts distinct from scenario assumptions; don't turn "we don't know" into "not allowed"; flag any edit that might change meaning instead of guessing; return, for each ID, before, after, reason and whether a content check is needed; check agreement with 0, 1 and 2 and with the real gender and noun.)

The "editor agent" is simply an AI model following this brief with a fixed input and output; it is not a new language ability. A native editor approves the first complete pass; the owner approves the voice and the election terms. Apply each accepted edit everywhere the string is used, then fix the English wherever the meaning changed. Never show transliterated Hebrew in English mode, and never alter quotations from official sources.

### Step 3: stop problems coming back (estimate: 1–2 more developer days; not built)

1. **Automatic spell check**, run on the developer's machine and in the automatic test run, using a pinned Hspell-based dictionary with its licence notices. Start in "report only" mode to set a reviewed baseline, then fail only on new, unapproved misspellings. Every exception needs a term, a source and a reason, never "ignore all Hebrew". Don't put the dictionaries into the website itself just for testing.
2. **Terminology checks** that understand context and approved alternatives. For example, flag באדר–עופר in app text but not inside a verbatim quotation; allow מנדט both for a seat and for a presidential mandate to form a government, where properly explained. Pattern checks can suggest fixes for translationese; they cannot certify style or grammar.
3. **Fixed structural checks** that make sure placeholders, numbers, web addresses, negative words and source labels survive an edit. They catch structural mistakes but cannot prove the meaning is the same. Add test cases for counts of 0, 1 and 2, for singular and plural subjects, for error messages and for the "we don't know how votes split" caveat. Keep "unknown", "provisional" and "historical" qualifiers. A human checks meaning.
4. **Every change that adds Hebrew text** includes its additions to the string list and names its reviewer. Approved short examples live with the style guide. If a string changes, its earlier review no longer counts. Check the English matches too. Don't call a cloud AI model on every automatic test run: cost, drift and unpredictable answers add little assurance.
5. **After edits are accepted, look at the real screens**: widths 1500, 1024 and 390 pixels, light and dark, Hebrew and English, the 2026, 2022 and 1949 elections, including (i) texts, errors and the edit history. Check line wrapping, cut-off text, screen-reader names and placeholders that mix directions. Keep the existing layout and the left-to-right charts; new wording is no reason to mirror a chart. This research changed no screens, so there was nothing to look at.

**Running costs.** Local checking has no per-use fee, though a developer must maintain it. AI costs are the actual usage under the owner's existing plan or a separately billed provider; no exact price was checked, and no new subscription is needed to start. The main spending should go first to a native editor reviewing text in context; this document's sample gives them something concrete to price.

## What the owner could review, without rewriting anything

Start with rows 5, 7, 9, 16 and 19 and the short split warning (roughly 10–15 minutes, an estimate). For each, approve it or mark it as awkward, and choose the tone of voice you want. Then approve the distinctions in the terms table and one rule for exceptions. There is no need to confirm technical claims about which tools support Hebrew; those can be checked. Hiring an editor, buying a plan, installing a skill or building the automatic checks are later steps; none has been done.

The current question with options is question 18 on the [questions page](https://claude.ai/artifact/VNauxmRhqwnzvx8JYsxqCu) (see "In short" above).

## How sure we are: evidence and conclusions

The tool table and sections above are the record of claims. Each source number (S1 …) points to a narrow set of documented statements, a link and its limits. Everything external is public and was found by web search and opened in the research tool. Makers' pages describe what they say their product does; they are not independent performance tests. Publication dates were mostly missing or not checked; everything was read on 7 November 2026. Exceptions: the Nakdan paper is from 2020; Ginger's help page was last updated 18 August 2024; LanguageTool's list is dated 24 March 2026; the IDI explainer is dated 18 February 2021. To reproduce, follow the cited link and heading. GitHub and model pages change, so pin exact versions before building anything.

| Sources | Kind of source / family | How deeply it was read, and its limits |
|---|---|---|
| S1–S2 | Project documentation; one Hspell word-list family | README and dictionary integration text read. Two wrappers around one word list are not two independent checks. |
| S3 | Dicta project, model and research material; one Dicta family | The word-structure model page was opened. The Nakdan "about" text was seen only in a search extract; the page itself came back empty. The paper is background, not proof of a current hosted service. |
| S4 | Microsoft support pages; one Microsoft Editor family | Language table and service text opened. The Hebrew checker itself was not run. |
| S5–S8 | Official product support pages; one family per company | Language lists opened. The absence of Hebrew limits this to documented proofreading; other AI or translation features were not covered. |
| S9 | Company terms and FAQ; one Melingo family | Terms and FAQ opened; the Morfix home page and the Rav-Milim purchase page were blocked. The old terms page is a caution, not a ruling on current business terms. |
| S10 | Official Academy web pages; one Academy family | The terms "about" page and the English spelling and punctuation pages were opened; the detailed Hebrew rules and PDF were blocked. No clause-by-clause claim is made. |
| S11 | Official government programme and guide; one government family | Programme page read; the PDF was too large, so its detailed advice is unverified. |
| S12 | Community repository instructions; skills-il family | The skill's instructions and pattern catalogue were read. Its script was not run; it was not tested with native speakers, and its dependencies were not fully audited. |
| S13 | Community repository documentation; yodem family | README and licence read; not installed, output quality not tested. |
| S14 | The model maker's own page; Dicta family | Licence and examples read. Its quality claims are the maker's, not adopted here. |
| S15 | Editors' price pages; two separate families (Shirley Guy, Kamatz Katan) | Both opened; units converted openly; no seller contacted. Not a representative market estimate. |
| S16 | Marketplace pages; one family per platform | Fiverr and ProZ opened; the XPlace template showed no reliable profile details. No endorsement. |
| S17–S18 | Official results and an institute explainer; Central Elections Committee and IDI families | Pages and the relevant terms read. The Knesset page redirected to an access block. The existing glossary's source records are evidence from this project, not a fresh independent check. |
| R1 | The app's own files and the owner's brief; this project | The 25 exact strings were checked at the research baseline, with what each control does. The owner's messages were used only for requirements, not as language evidence. |

| Conclusion | What it had to show, and the result | Evidence for and against | Confidence; what is missing; what could change it |
|---|---|---|---|
| C1: buying a language tool is not enough | It would have to cover idiom **and** election meaning. Result: mixed or insufficient. | For: R1, S1–S2, S6–S9. A partial counterexample: S4. | High for this sample, without ranking tools. A test in context, reviewed by a native speaker, showing reliable corrections could change the mix of tools. |
| C2: try a small Hebrew editing skill, not a broad plugin or connector | Relevant scope, clear instructions, little setup. Result: a qualified pass. | For: S12 and R1. Against: S13, and no test of how well it actually works. | Moderate: a real candidate exists, but its quality is unmeasured. A comparison on held-back strings and a review of its instructions and dependencies are needed before adopting it. |
| C3: local spell check + sourced terms + a native editor reviewing in context | Covers mechanics, meaning and idiom. Result: the recommended setup. | For: S1–S2, S10, S15, S17–S18 and R1. S4 might reduce the manual work. | Moderate to high confidence in the approach; whether an editor is available and their final price are unknown. It does not prove all 25 proposals are right. |
| C4: a second AI model may help; no winner yet | A blind comparison of edits that keep the meaning. Result: unresolved. | Background: S12, S14. No comparison results. | Low on choosing a model. It needs outputs from the same context and judgments by native speakers, not general test scores. |

**Totals.** **25 strings from the app**, plus **one sentence the owner supplied that is not in the code**, have proposed edits. Outside sources were read to the depth stated above; search hits were not counted as reviewed documents. Full coverage of long PDFs was not available, and coverage of everything a search could find was not measured. Not measured either: response times, money spent, how often tools catch real errors, how many edits a native speaker would accept, or which model is best. Nothing here claims that every option was found or that the Hebrew has measurably improved.

## Technical notes (for developers)

**Baseline and method.** Source baseline: commit `d0bd5b26880114ddebb06f3000224ade2c0358a2`. The 25 proposed edits were generated in the research session with `gpt-6.1-sol` (high reasoning), using the source contexts and editorial constraints recorded here, then checked by hand against those contexts. They have **not** been approved by a native editor, tested in the UI, or compared experimentally with another model or tool. No paid API, no installation of a language tool and no disclosure of user scenarios were involved. The owner's flagged sentence was not found anywhere under `src` at the baseline.

**Where each row lives** (file and line at the baseline; the table's links point there):

| Rows | Location |
|---|---|
| 1–4 | `src/app/App.tsx` lines 175, 203, 265, 268 |
| 5–10 | `src/app/compare/dialogs.tsx` lines 28, 29, 31, 70, 93, 102 |
| 11–15 | `src/app/components/ListDetail.tsx` lines 246, 260, 303, 304, 305 |
| 16–18 | `src/app/store.ts` lines 275, 310, 416 |
| 19–20 | `src/app/actionDescription.ts` lines 58, 73 |
| 21–23 | `src/app/components/AfterElection.tsx` lines 88, 113, 155 |
| 24 | `src/app/changeValue.tsx` line 12 (spelling to align with the glossary, `derive.ts` and IDI) |
| 25 | `src/app/components/Walkthrough.tsx` line 120 (the branch in the code is floor rounding) |

**Proposed files (not created).** Reuse `src/app/glossary-data.ts` and `docs/research/glossary-sources.md`. Proposed companions: `docs/hebrew-style.md` and a machine-readable terminology file such as `data/meta/hebrew-terminology.json` (preferred / allowed / avoid-in-context forms, grammatical gender, scope, source, exception reason).

**String inventory.** Extract Hebrew with the TypeScript parser from `L(en, he)` calls, conditional strings, templates, settings definitions, glossary data, history formatters and accessibility names. A regex over one i18n file misses most of this app, because `useL` keeps text inline. Generated data strings go in a separate read-only inventory. Attach a stable source location and hash, UI role, full sentence, variables and the paired English.

**Spell-check tooling.** Hspell's original CLI expects ISO-8859-8 input; prefer the UTF-8 Hunspell dictionary (`dictionary-he`) through nspell or nodehun, or a local Hunspell he_IL. Pin dictionary hash/version and AGPL notices; run in development/CI only, never bundled into the client.

**Validation of the research commit.**

- Exact-source check: all 25 "before" strings matched the linked file and line at the baseline; all relative source links resolved. `git diff --check` passed.
- `npx tsc -p tsconfig.json --noEmit`: passed.
- `npx vitest run --maxWorkers=2`: **130 files, 1,268 tests passed**.
- `npx vite build --outDir .backup-scratch/hebrew-quality/dist`: passed, with the existing chunk-size advisory.
- Full Playwright suite: **697 passed**, two workers, port 43179. A disposable config imported the repository config, set an absolute test directory, used the scratch build in the preview command, and kept results under `.backup-scratch/hebrew-quality/test-results`. To reproduce, run the repository suite after building, keeping `PW_PORT` and `--workers=2`; a scratch build needs the matching preview `--outDir` override. Routine logs, config and build output are under `.backup-scratch/hebrew-quality/` and are disposable.

No runtime code or UI strings changed. These checks establish the baseline; they say nothing about whether the proposed edits are correct or fit on screen, and no screenshots of proposed copy were reviewed. Acceptance needs the native, in-context review and screen checks described above. No tool was bought, installed as an editor or connected to user data; no publication or push was part of the task.
