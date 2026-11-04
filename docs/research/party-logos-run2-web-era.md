# Party logos run 2 — web era, k16–k26

As of 4 November 2026. Scope: every initially missing logo of a seat-winning list and every missing emblem of its named constituent parties, k16–k26. Baseline: **82 whole lists and 137 constituents (219 campaign-specific identities)**. k26 winners use the application's allocation of retained CEC final counts, not gazetted seats. No nonwinner expansion, no application or election-result changes, no push or merge.

Acceptance follows decision 0089 and the logo README: official origin plus dated campaign use; a joint list and its constituent emblems are different identities. A Commons description explicitly crediting an official origin and a campaign-period design date may qualify at medium confidence. Upload date alone, current branding, ballot-paper lettering, wrong countries and later variants do not qualify. This report distinguishes discovery results from opened evidence. An unsuccessful search establishes only that this bounded search did not verify a logo, never nonexistence.

## Method and reproducibility

Each initial gap receives three separately recorded Jina search_web query attempts: Hebrew official/campaign discovery; Commons discovery; official-social discovery. The entire additional social pass failed with `This key is out of quota`; these failures are explicitly labelled and are not empty search results. Two Hebrew queries also failed (see per-identity error). Each query's returned URLs are retained below, including false positives, with no claim they were all opened. Promising Commons descriptions were opened through the MediaWiki API (revisions and imageinfo/extmetadata); the compact catalogue below records the inspected metadata and rejection limitations. Search snippets are discovery only. English Wikipedia was never opened or cited as evidence; incidental links in Commons were not followed. The deliberately broad Commons queries have geographic false positives; they are not counted as corroboration.

Plain HTTP used `israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)` with no email. **No archive.org request was made in this run**, avoiding contention with the other helpers; retained dated archive HTML/assets/CDX from the checkout were inspected where reused. No CAPTCHA or bot challenge was solved or bypassed, no rotating/residential proxy was used. Apify was not used: **$0 spend**. No archive.today capture was acquired. This is an identity-complete search pass, not an exhaustive search of every possible archive or social post.

Unique accepted artwork, original raster inputs, source cards and hashes are durable. Reproducible HTTP responses, candidate inspections, search output, tool dependencies and routine logs were held in `.backup-scratch/logo-run2/`; exclusion from external backups was not independently verified. Node 24.18.0 and locked npm dependencies; Pillow 13.0.0. Raster recipe: RGBA, thumbnail `(256,256)` with LANCZOS, optimized PNG; no recolouring. SVGs kept unchanged when eligible. `node scripts/build-datasets.ts` regenerated public datasets/source manifests. The existing builder consumes public logo inputs rather than creating artwork; PNGs were programmatically generated from retained originals using the recorded recipe, and SVGs copied unchanged. Public JSON was never hand-edited.

## Inspected primary publication and retrieval outcomes

- Ra’am: [Mansour Abbas official post](https://www.facebook.com/MansourAbbas.me/videos/1757107092038580) opened with Jina and retained by plain HTTP. Visible publication date **10 October 2026, 13:09**, overriding the search engine's October 14 discovery date. It links [the party's 2026 brochure](https://online.fliphtml5.com/gijql/tgzd/). Downloaded and visually inspected its cover; the cover itself names the 2026 Knesset election. Retained the cover, publication HTML and brochure HTML under `data/raw/logos/k26/`, with manifest SHA-256. Cropped white الموحدة wordmark and its underlines, existing green backdrop, pixel box `(1040,195,1460,335)` on the **1556×2200** original, then thumbnail to 256 pixels. Medium confidence: live dated official publication, not an independently archived historical byte proof. No avatar substitution.
- [Zehut ballot explainer](https://zehut.org.il/petek) opened: explicitly names the 2026 joint run, but artwork is a ballot plus Zehut's separate header; no combined Religious Zionism–Zehut logo established. Its first plain-HTTP sandbox request failed DNS (`Temporary failure in name resolution`); authorized network execution returned HTTP 200. No date/identity inference from ballot letters.
- CEC candidates [UTJ](https://www.gov.il/he/pages/yahadut-degel_list37) and [Religious Zionism–Zehut](https://www.gov.il/he/pages/tzionutdatit-zehut_list31) opened via Jina: candidate identities do not establish a separate verified logo asset.
- [Official 2015 Joint List Facebook photo](https://www.facebook.com/JointListHebrew/photos/a.1565388027047502.1073741825.1557652337821071/1565390087047296) opened via Jina: **login-only response, no photo/date**. Not used as primary date evidence. A different Commons file explicitly dated January 22, 2015 and credited to the Joint List is accepted below at medium confidence.
- Additional social-route queries: `site:t.me/dovrutshas "2022"` returned no results; `site:facebook.com "יהדות התורה" "2022" "לוגו"`, `site:facebook.com "כחול לבן" "2019" "לוגו"`, `site:facebook.com "מרצ" "2021" "לוגו"`, `site:facebook.com "יש עתיד" "2015" "לוגו"` produced mixed discovery leads; none independently supplies accepted bytes. Arabic discovery queries `رعم القائمة العربية الموحدة 2026 شعار الموقع الرسمي`, `الجبهة الديمقراطية 2026 شعار site:hadash.org.il`, `التجمع الوطني الديمقراطي 2026 شعار فيسبوك`, `الحركة العربية للتغيير 2026 شعار فيسبوك` and `דגל התורה 2026 לוגו קמפיין facebook` found the Ra’am publication; the Hadash query was empty, Balad mostly returned Algeria's unrelated RND, and Ta’al yielded profile/secondary leads without a dated inspected emblem.
- Initial dataset build failed `ERR_MODULE_NOT_FOUND: pdfjs-dist`; resolved by `npm ci --cache .backup-scratch/npm-cache`. The first differential check correctly detected the intended model-logo change; model reference updated only after all 26 datasets compared equal to the previous batch excluding `logo` and `builtAt`. Allocation, analysis, validation and rules references were preserved.

## Per-election search ledger (newest first)

Each row is one campaign identity. `L` = whole list, `P` = constituent. S1/S2/S3 show actual queries and returned discovery URLs, not verified sources. Opened Commons descriptions and accepted evidence are distinguished below. Empty results are explicit. Failure to find a qualifying identity/date pair is an **open evidence gap**, not a claim that the logo did not exist.

### k26 · 2026-10-27

Baseline whole lists: **8/11**; constituents: **8/19**. Every one of the 14 initial gaps below was attempted in all three routes; S3 quota failures do not count as completed source searches.

**L `ג` — יהדות התורה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"יהדות התורה" "2026" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections/parties/yahadut-hatorah>; <https://he.wikipedia.org/wiki/%D7%99%D7%94%D7%93%D7%95%D7%AA_%D7%94%D7%AA%D7%95%D7%A8%D7%94>; <https://www.kan.org.il/content/kan-news/politic/1112697>.
- S2: `site:commons.wikimedia.org "United Torah Judaism" logo 2026` → no returned URLs.
- S3: `site:facebook.com "יהדות התורה" 2026 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "יהדות התורה" 2026 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ט` — הציונות הדתית–זהות.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"הציונות הדתית–זהות" "2026" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.kan.org.il/content/kan-news/politic/1113524>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%A9>; <https://polimeter.co.il/parties/religious-zionism>.
- S2: `site:commons.wikimedia.org "Religious Zionism–Zehut" logo 2026` → no returned URLs.
- S3: `site:facebook.com "הציונות הדתית–זהות" 2026 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "הציונות הדתית–זהות" 2026 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `עם` — רע״ם.** Added fair-use whole-list logo from the dated official Ra’am brochure.

- S1: `"רע״ם" "2026" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/elections-2026>; <https://www.kan.org.il/content/kan-news/politic/live-1101961>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%A9>.
- S2: `site:commons.wikimedia.org "Ra'am" logo 2026` → <https://commons.wikimedia.org/wiki/File:Israeli_Knesset_Blocs_2026.svg>; <https://commons.wikimedia.org/wiki/File:Israeli_Knesset_Composition_2026.svg>; <https://commons.wikimedia.org/wiki/File:Opinion_polls_Israel_2026.svg>.
- S3: `site:facebook.com "רעם" 2026 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "רעם" 2026 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `agudat-yisrael` — אגודת ישראל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"אגודת ישראל" "2026" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.gov.il/he/pages/candidates-lists-26>; <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%A9>.
- S2: `site:commons.wikimedia.org "Agudat Yisrael" logo 2026` → <https://commons.wikimedia.org/wiki/Category:SVG_logos_of_political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/Category:Haredi_Judaism>.
- S3: `site:facebook.com "אגודת ישראל" 2026 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "אגודת ישראל" 2026 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `atid-ehad` — עתיד אחד – עתיד טוב לישראל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"עתיד אחד – עתיד טוב לישראל" "2026" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%A9>; <https://www.nli.org.il/he/sheets/NNL_Ephemera997001190900405171/NLI>; <https://www.hamichlol.org.il/%D7%94%D7%A6%D7%99%D7%95%D7%A0%D7%95%D7%AA_%D7%94%D7%93%D7%AA%D7%99%D7%AA_(%D7%A1%D7%99%D7%A2%D7%94)>.
- S2: `site:commons.wikimedia.org "Atid Ehad" logo 2026` → no returned URLs.
- S3: `site:facebook.com "עתיד אחד" 2026 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "עתיד אחד" 2026 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `balad` — בל"ד.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"בל"ד" "2026" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/elections-2026>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%A9>; <https://www.kan.org.il/content/kan-news/politic/1103572>.
- S2: `site:commons.wikimedia.org "Balad" logo 2026` → <https://commons.wikimedia.org/wiki/File:Wust_El-Balad-Logo.jpg>; <https://commons.wikimedia.org/wiki/Category:SVG_logos_of_political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/File:Opinion_polls_Israel_2026.svg>.
- S3: `site:facebook.com "בלד" 2026 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "בלד" 2026 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `degel-hatorah` — דגל התורה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"דגל התורה" "2026" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%93%D7%92%D7%9C_%D7%94%D7%AA%D7%95%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections/parties/degel-hatora>; <https://www.kan.org.il/content/kan-news/newstv/p-963853/s1/1096871>.
- S2: `site:commons.wikimedia.org "Degel HaTorah" logo 2026` → no returned URLs.
- S3: `site:facebook.com "דגל התורה" 2026 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "דגל התורה" 2026 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `eretz-yisrael-shelanu` — ארץ ישראל שלנו.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"ארץ ישראל שלנו" "2026" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%A9>; <https://www.gov.il/he/pages/yehudit-meuhedet_list14>; <https://www.idi.org.il/policy/parties-and-elections/elections/2019-2>.
- S2: `site:commons.wikimedia.org "Eretz Yisrael Shelanu" logo 2026` → no returned URLs.
- S3: `site:facebook.com "ארץ ישראל שלנו" 2026 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "ארץ ישראל שלנו" 2026 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `hadash` — חד"ש (המפלגה הקומוניסטית הישראלית).** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"חד"ש (המפלגה הקומוניסטית הישראלית)" "2026" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://t.me/s/king_of_theneighborhood?before=29968>.
- S2: `site:commons.wikimedia.org "Hadash (Israeli Communist Party)" logo 2026` → no returned URLs.
- S3: `site:facebook.com "חדש" 2026 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "חדש" 2026 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `homat-torat-yisrael` — חומת תורת ישראל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"חומת תורת ישראל" "2026" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%A9>; <https://www.gov.il/he/departments/israeli_corporations_authority>; <https://he.wikipedia.org/wiki/%D7%99%D7%94%D7%93%D7%95%D7%AA_%D7%94%D7%AA%D7%95%D7%A8%D7%94>.
- S2: `site:commons.wikimedia.org "Homat Torat Yisrael" logo 2026` → no returned URLs.
- S3: `site:facebook.com "חומת תורת ישראל" 2026 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "חומת תורת ישראל" 2026 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `meretz` — מרצ.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"מרצ" "2026" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.gov.il/he/pages/hademokratim_list17>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%A9>; <https://www.idi.org.il/policy/parties-and-elections>.
- S2: `site:commons.wikimedia.org "Meretz" logo 2026` → <https://commons.wikimedia.org/wiki/Category:Logos_of_political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/Category:SVG_logos_of_political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/File:Israeli_Knesset_Blocs_2021.svg>.
- S3: `site:facebook.com "מרצ" 2026 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "מרצ" 2026 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `taal` — תע"ל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"תע"ל" "2026" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%A9>; <https://main.knesset.gov.il/News/PressReleases/Documents/141026.pdf>; <https://www.idi.org.il/articles/66556>.
- S2: `site:commons.wikimedia.org "Ta'al" logo 2026` → <https://commons.wikimedia.org/wiki/File:Logo_Hadash_Ta%27al.png>; <https://commons.wikimedia.org/wiki/Category:Logos_of_political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/Category:Joint_List>.
- S3: `site:facebook.com "תעל" 2026 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "תעל" 2026 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `together-bennett` — ביחד בראשות בנט.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"ביחד בראשות בנט" "2026" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%91%D7%99%D7%97%D7%93_(%D7%A8%D7%A9%D7%99%D7%9E%D7%94)>; <https://www.idi.org.il/elections-2026>; <https://www.hamichlol.org.il/%D7%91%D7%99%D7%97%D7%93_(%D7%A8%D7%A9%D7%99%D7%9E%D7%94)>.
- S2: `site:commons.wikimedia.org "Together (Bennett)" logo 2026` → no returned URLs.
- S3: `site:facebook.com "ביחד בראשות בנט" 2026 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "ביחד בראשות בנט" 2026 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `yesodot-yisrael` — יסודות ישראל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"יסודות ישראל" "2026" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%A9>; <https://www.gov.il/he/pages/yashar_list_2>; <https://www.haaretz.co.il/news/elections/2026-07-12/ty-article/0000019f-5763-d6c0-a9df-dfff952f0000>.
- S2: `site:commons.wikimedia.org "Yesodot Yisrael" logo 2026` → no returned URLs.
- S3: `site:facebook.com "יסודות ישראל" 2026 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "יסודות ישראל" 2026 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

Batch verification: `npx vitest run` **57 files / 484 tests passed**; `npx tsc -p tsconfig.json --noEmit`, `npx vite build`, and `python3 scripts/validate-party-logos.py` passed. Dataset build passed; all 26 election datasets equal prior batch after recursively removing `logo` and `builtAt`.

### k25 · 2022-11-01

Baseline whole lists: **4/10**; constituents: **1/11**. Every one of the 16 initial gaps below was attempted in all three routes; S3 quota failures do not count as completed source searches.

**L `ג` — יהדות התורה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"יהדות התורה" "2022" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%99%D7%94%D7%93%D7%95%D7%AA_%D7%94%D7%AA%D7%95%D7%A8%D7%94>; <https://votes25.bechirot.gov.il/>; <https://www.idi.org.il/policy/parties-and-elections/parties/yahadut-hatorah>.
- S2: `site:commons.wikimedia.org "United Torah Judaism" logo 2022` → no returned URLs.
- S3: `site:facebook.com "יהדות התורה" 2022 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "יהדות התורה" 2022 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ום` — חד״ש–תע״ל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"חד״ש–תע״ל" "2022" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%97%D7%93%22%D7%A9-%D7%AA%D7%A2%22%D7%9C>; <https://votes25.bechirot.gov.il/>; <https://www.kan.org.il/tags/generaltags/%D7%97%D7%93%D7%A9-%D7%AA%D7%A2%D7%9C>.
- S2: `site:commons.wikimedia.org "Hadash–Ta'al" logo 2022` → <https://commons.wikimedia.org/wiki/Category:Hadash%E2%80%93Ta%27al>; <https://commons.wikimedia.org/wiki/File:Logo_Hadash_Ta%27al.png>; <https://commons.wikimedia.org/wiki/Category:Logos_of_political_parties_in_Israel>.
- S3: `site:facebook.com "חדש–תעל" 2022 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "חדש–תעל" 2022 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ט` — הציונות הדתית.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"הציונות הדתית" "2022" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes25.bechirot.gov.il/>; <https://he.wikipedia.org/wiki/%D7%94%D7%A6%D7%99%D7%95%D7%A0%D7%95%D7%AA_%D7%94%D7%93%D7%AA%D7%99%D7%AA_(%D7%A1%D7%99%D7%A2%D7%94)>; <https://www.progdemocracy.com/mitpakdim-zionutdatit>.
- S2: `site:commons.wikimedia.org "Religious Zionism" logo 2022` → <https://commons.wikimedia.org/wiki/File:Parti_sioniste_religieux_logo_2022.png>; <https://commons.wikimedia.org/wiki/Category:Religious_Zionist_Party>; <https://commons.wikimedia.org/wiki/File:RZ_logo_2023.svg>.
- S3: `site:facebook.com "הציונות הדתית" 2022 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "הציונות הדתית" 2022 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ל` — ישראל ביתנו.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"ישראל ביתנו" "2022" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes25.bechirot.gov.il/>; <https://www.kan.org.il/content/kan-news/politic/live-1113088>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%97%D7%9E%D7%A9>.
- S2: `site:commons.wikimedia.org "Yisrael Beiteinu" logo 2022` → <https://commons.wikimedia.org/wiki/File:Israel-beytenu-logo.png>; <https://commons.wikimedia.org/wiki/File:Israeli_Knesset_Blocs_2022.svg>; <https://commons.wikimedia.org/wiki/Category:Yisrael_Beiteinu>.
- S3: `site:facebook.com "ישראל ביתנו" 2022 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "ישראל ביתנו" 2022 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `עם` — רע״ם.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"רע״ם" "2022" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%97%D7%9E%D7%A9>; <https://www.kan.org.il/content/kan-news/politic/live-1113088>; <https://www.idi.org.il/elections-2026>.
- S2: `site:commons.wikimedia.org "Ra'am" logo 2022` → <https://commons.wikimedia.org/wiki/File:Raam_logo_2021.svg>; <https://commons.wikimedia.org/wiki/File:Israeli_Knesset_Blocs_2022.svg>; <https://commons.wikimedia.org/wiki/Category:United_Arab_List>.
- S3: `site:facebook.com "רעם" 2022 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "רעם" 2022 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `שס` — ש״ס.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"ש״ס" "2022" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%97%D7%9E%D7%A9>; <https://www.kan.org.il/content/kan-news/politic/live-1113088>; <https://www.inss.org.il/he/publication/israel-elections-2022>.
- S2: `site:commons.wikimedia.org "Shas" logo 2022` → <https://commons.wikimedia.org/wiki/File:Shas_logo.png>; <https://commons.wikimedia.org/wiki/Category:Shas>; <https://commons.wikimedia.org/wiki/File:Shas_electoral_support_in_the_elections_to_the_25th_Knesset.jpg>.
- S3: `site:facebook.com "שס" 2022 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "שס" 2022 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `agudat-yisrael` — אגודת ישראל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"אגודת ישראל" "2022" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes25.bechirot.gov.il/>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%97%D7%9E%D7%A9>; <https://www.idi.org.il/policy/parties-and-elections>.
- S2: `site:commons.wikimedia.org "Agudat Yisrael" logo 2022` → <https://commons.wikimedia.org/wiki/Category:SVG_logos_of_political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/File:Poalei_Agudat_Yisrael.svg>.
- S3: `site:facebook.com "אגודת ישראל" 2022 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "אגודת ישראל" 2022 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `atid-ehad` — עתיד אחד – עתיד טוב לישראל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"עתיד אחד – עתיד טוב לישראל" "2022" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%97%D7%9E%D7%A9>; <https://www.gov.il/BlobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisionsfullbook2022.pdf>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%A9>.
- S2: `site:commons.wikimedia.org "Atid Ehad" logo 2022` → no returned URLs.
- S3: `site:facebook.com "עתיד אחד" 2022 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "עתיד אחד" 2022 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `degel-hatorah` — דגל התורה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"דגל התורה" "2022" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes25.bechirot.gov.il/>; <https://he.wikipedia.org/wiki/%D7%93%D7%92%D7%9C_%D7%94%D7%AA%D7%95%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections>.
- S2: `site:commons.wikimedia.org "Degel HaTorah" logo 2022` → no returned URLs.
- S3: `site:facebook.com "דגל התורה" 2022 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "דגל התורה" 2022 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `eretz-yisrael-shelanu` — ארץ ישראל שלנו.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"ארץ ישראל שלנו" "2022" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%97%D7%9E%D7%A9>; <https://www.idi.org.il/media/27873/the-elections-in-israel-2022.pdf>; <https://www.gov.il/BlobFolder/guide/candidates-lists-26/he/pr_4-6_26_reply_Redacted.pdf>.
- S2: `site:commons.wikimedia.org "Eretz Yisrael Shelanu" logo 2022` → no returned URLs.
- S3: `site:facebook.com "ארץ ישראל שלנו" 2022 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "ארץ ישראל שלנו" 2022 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `hadash` — חד"ש (המפלגה הקומוניסטית הישראלית).** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"חד"ש (המפלגה הקומוניסטית הישראלית)" "2022" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://t.me/s/king_of_theneighborhood?before=29968>.
- S2: `site:commons.wikimedia.org "Hadash (Israeli Communist Party)" logo 2022` → no returned URLs.
- S3: `site:facebook.com "חדש" 2022 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "חדש" 2022 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `israel-resilience` — חוסן ישראל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"חוסן ישראל" "2022" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%9B%D7%97%D7%95%D7%9C_%D7%9C%D7%91%D7%9F_%D7%97%D7%95%D7%A1%D7%9F_%D7%9C%D7%99%D7%A9%D7%A8%D7%90%D7%9C>; <https://www.idi.org.il/policy/parties-and-elections>; <https://www.gov.il/BlobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisionsfullbook2022.pdf>.
- S2: `site:commons.wikimedia.org "Blue and White (Israel Resilience)" logo 2022` → no returned URLs.
- S3: `site:facebook.com "חוסן ישראל" 2022 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "חוסן ישראל" 2022 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `new-hope` — תקווה חדשה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"תקווה חדשה" "2022" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%97%D7%9E%D7%A9>; <https://www.kan.org.il/content/kan-news/opinions/254538>.
- S2: `site:commons.wikimedia.org "New Hope" logo 2022` → <https://commons.wikimedia.org/wiki/Category:Road_signs_for_New_Hope,_Pennsylvania>; <https://commons.wikimedia.org/wiki/File:New_Hope_Creek.jpg>; <https://commons.wikimedia.org/wiki/Category:Road_signs_for_the_New_Hope-Lambertville_Toll_Bridge_in_Pennsylvania>.
- S3: `site:facebook.com "תקווה חדשה" 2022 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "תקווה חדשה" 2022 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `noam` — נעם (לזוז).** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"נעם (לזוז)" "2022" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%97%D7%9E%D7%A9>; <https://www.idi.org.il/media/27873/the-elections-in-israel-2022.pdf>; <https://huggingface.co/dicta-il/neodictabert-bilingual/resolve/main/vocab.txt?download=true>.
- S2: `site:commons.wikimedia.org "Noam (registered as Lazuz)" logo 2022` → no returned URLs.
- S3: `site:facebook.com "נעם" 2022 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "נעם" 2022 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `otzma-yehudit` — עוצמה יהודית (חזית יהודית לאומית).** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"עוצמה יהודית (חזית יהודית לאומית)" "2022" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/articles/46501>; <https://www.gov.il/BlobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisionsfullbook2022.pdf>; <https://www.mako.co.il/finances-news/Article-70e2bd529a88f91026.htm>.
- S2: `site:commons.wikimedia.org "Otzma Yehudit (Jewish National Front)" logo 2022` → no returned URLs.
- S3: `site:facebook.com "עוצמה יהודית" 2022 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "עוצמה יהודית" 2022 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `taal` — תע"ל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"תע"ל" "2022" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes25.bechirot.gov.il/>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%97%D7%9E%D7%A9>; <https://www.idi.org.il/policy/parties-and-elections>.
- S2: `site:commons.wikimedia.org "Ta'al" logo 2022` → <https://commons.wikimedia.org/wiki/File:Ta%27al_party_logo.png>; <https://commons.wikimedia.org/wiki/Category:Hadash%E2%80%93Ta%27al>; <https://commons.wikimedia.org/wiki/File:Logo_Hadash_Ta%27al.png>.
- S3: `site:facebook.com "תעל" 2022 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "תעל" 2022 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

Batch verification: `npx vitest run` **57 files / 484 tests passed**; `npx tsc -p tsconfig.json --noEmit`, `npx vite build`, and `python3 scripts/validate-party-logos.py` passed. Dataset build passed; all 26 election datasets equal prior batch after recursively removing `logo` and `builtAt`.

### k24 · 2021-03-23

Baseline whole lists: **7/13**; constituents: **1/12**. Every one of the 17 initial gaps below was attempted in all three routes; S3 quota failures do not count as completed source searches.

**L `ב` — ימינה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"ימינה" "2021" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes24.bechirot.gov.il/>; <https://www.idi.org.il/policy/parties-and-elections/parties/yamina>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%90%D7%A8%D7%91%D7%A2>.
- S2: `site:commons.wikimedia.org "Yamina" logo 2021` → <https://commons.wikimedia.org/wiki/File:Logo_Yamina,_2021.svg>; <https://commons.wikimedia.org/wiki/File:Yamina_21.png>; <https://commons.wikimedia.org/wiki/Category:Yamina>.
- S3: `site:facebook.com "ימינה" 2021 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "ימינה" 2021 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ג` — יהדות התורה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"יהדות התורה" "2021" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes24.bechirot.gov.il/>; <https://he.wikipedia.org/wiki/%D7%99%D7%94%D7%93%D7%95%D7%AA_%D7%94%D7%AA%D7%95%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections/parties/yahadut-hatorah>.
- S2: `site:commons.wikimedia.org "United Torah Judaism" logo 2021` → no returned URLs.
- S3: `site:facebook.com "יהדות התורה" 2021 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "יהדות התורה" 2021 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ודעם` — הרשימה המשותפת.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"הרשימה המשותפת" "2021" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes24.bechirot.gov.il/>; <https://he.wikipedia.org/wiki/%D7%94%D7%A8%D7%A9%D7%99%D7%9E%D7%94_%D7%94%D7%9E%D7%A9%D7%95%D7%AA%D7%A4%D7%AA>; <https://www.idi.org.il/policy/parties-and-elections>.
- S2: `site:commons.wikimedia.org "Joint List" logo 2021` → <https://commons.wikimedia.org/wiki/File:Joint_List_logo.png>; <https://commons.wikimedia.org/wiki/Category:Joint_List>; <https://commons.wikimedia.org/wiki/File:Logo_of_the_Joint_List_(Israel)_2026_(vector).svg>.
- S3: `site:facebook.com "הרשימה המשותפת" 2021 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "הרשימה המשותפת" 2021 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ט` — הציונות הדתית.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"הציונות הדתית" "2021" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes24.bechirot.gov.il/>; <https://www.idi.org.il/policy/parties-and-elections>; <https://www.inss.org.il/he/publication/israel-elections-2022>.
- S2: `site:commons.wikimedia.org "Religious Zionism" logo 2021` → <https://commons.wikimedia.org/wiki/File:Parti_sioniste_religieux_logo_2022.png>; <https://commons.wikimedia.org/wiki/File:Reuven_Rivlin_with_the_Religious_Zionism_party_representatives_in_the_round_of_consultations_at_Beit_HaNassi,_April_2021_(GPOMN3_3563).jpg>; <https://commons.wikimedia.org/wiki/d:Q42388>.
- S3: `site:facebook.com "הציונות הדתית" 2021 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "הציונות הדתית" 2021 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `מרצ` — מרצ.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"מרצ" "2021" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes24.bechirot.gov.il/>; <https://he.wikipedia.org/wiki/%D7%9E%D7%A8%D7%A6>; <https://www.idi.org.il/policy/parties-and-elections/parties/meretz>.
- S2: `site:commons.wikimedia.org "Meretz" logo 2021` → <https://commons.wikimedia.org/wiki/File:Meretz_Logo.svg>; <https://commons.wikimedia.org/wiki/File:Logo_of_the_Labor-Gesher-Meretz.png>; <https://commons.wikimedia.org/wiki/Category:Logos_of_political_parties_in_Israel>.
- S3: `site:facebook.com "מרצ" 2021 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "מרצ" 2021 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `שס` — ש״ס.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"ש״ס" "2021" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%90%D7%A8%D7%91%D7%A2>; <https://www.idi.org.il/policy/parties-and-elections>; <https://www.inss.org.il/he/publication/israel-elections-2022>.
- S2: `site:commons.wikimedia.org "Shas" logo 2021` → <https://commons.wikimedia.org/wiki/File:Shas_logo.png>; <https://commons.wikimedia.org/wiki/File:Reuven_Rivlin_with_Shas_party_representatives_in_the_round_of_consultations_at_Beit_HaNassi,_April_2021_(GPOMN1_7553).jpg>; <https://commons.wikimedia.org/wiki/File:Israeli_Knesset_Blocs_2021.svg>.
- S3: `site:facebook.com "שס" 2021 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "שס" 2021 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `agudat-yisrael` — אגודת ישראל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"אגודת ישראל" "2021" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes24.bechirot.gov.il/>; <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%90%D7%A8%D7%91%D7%A2>.
- S2: `site:commons.wikimedia.org "Agudat Yisrael" logo 2021` → <https://commons.wikimedia.org/wiki/Category:SVG_logos_of_political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/User_talk:Jozef_Gabcik>.
- S3: `site:facebook.com "אגודת ישראל" 2021 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "אגודת ישראל" 2021 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `atid-ehad` — עתיד אחד – עתיד טוב לישראל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"עתיד אחד – עתיד טוב לישראל" "2021" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%97%D7%9E%D7%A9>; <https://www.gov.il/BlobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisionsfullbook2022.pdf>; <https://www.idi.org.il/articles/33649>.
- S2: `site:commons.wikimedia.org "Atid Ehad" logo 2021` → no returned URLs.
- S3: `site:facebook.com "עתיד אחד" 2021 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "עתיד אחד" 2021 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `balad` — בל"ד.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"בל"ד" "2021" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes24.bechirot.gov.il/>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%90%D7%A8%D7%91%D7%A2>; <https://www.idi.org.il/policy/parties-and-elections>.
- S2: `site:commons.wikimedia.org "Balad" logo 2021` → <https://commons.wikimedia.org/wiki/File:Green_woodwork_in_old_Jeddah_(Al_Balad)_October_8_2021.jpg>; <https://commons.wikimedia.org/wiki/Category:SVG_logos_of_political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/File:Old_Jeddah_(Al_Balad)_architecture_3_Feb_2022.jpg>.
- S3: `site:facebook.com "בלד" 2021 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "בלד" 2021 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `degel-hatorah` — דגל התורה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"דגל התורה" "2021" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes24.bechirot.gov.il/>; <https://he.wikipedia.org/wiki/%D7%93%D7%92%D7%9C_%D7%94%D7%AA%D7%95%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections>.
- S2: `site:commons.wikimedia.org "Degel HaTorah" logo 2021` → no returned URLs.
- S3: `site:facebook.com "דגל התורה" 2021 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "דגל התורה" 2021 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `derech-eretz` — דרך ארץ.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"דרך ארץ" "2021" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/articles/39414>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%90%D7%A8%D7%91%D7%A2>; <https://he.wikipedia.org/wiki/%D7%93%D7%A8%D7%9A_%D7%90%D7%A8%D7%A5_(%D7%9E%D7%A4%D7%9C%D7%92%D7%94)>.
- S2: `site:commons.wikimedia.org "Derech Eretz" logo 2021` → <https://commons.wikimedia.org/wiki/File:Svgfiles_2021-03-02-14-48-01-536744-14416230439496633742_(1).svg>; <https://commons.wikimedia.org/wiki/File:23rd_Knesset_Composition.svg>; <https://commons.wikimedia.org/wiki/wikidata:Q76985>.
- S3: `site:facebook.com "דרך ארץ" 2021 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "דרך ארץ" 2021 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `hadash` — חד"ש (המפלגה הקומוניסטית הישראלית).** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"חד"ש (המפלגה הקומוניסטית הישראלית)" "2021" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://t.me/s/king_of_theneighborhood?before=29968>.
- S2: `site:commons.wikimedia.org "Hadash (Israeli Communist Party)" logo 2021` → no returned URLs.
- S3: `site:facebook.com "חדש" 2021 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "חדש" 2021 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `likud` — הליכוד.** Added fair-use Likud constituent from this election’s retained official header and CDX byte proof.

- S1: `"הליכוד" "2021" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes24.bechirot.gov.il/>; <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%90%D7%A8%D7%91%D7%A2>.
- S2: `site:commons.wikimedia.org "Likud" logo 2021` → <https://commons.wikimedia.org/wiki/File:Likud_Logo.svg>; <https://commons.wikimedia.org/wiki/File:Logo_Likud.png>; <https://commons.wikimedia.org/wiki/Category:Logos_of_political_parties_in_Israel>.
- S3: `site:facebook.com "הליכוד" 2021 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "הליכוד" 2021 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `new-hope` — תקווה חדשה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"תקווה חדשה" "2021" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes24.bechirot.gov.il/>; <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%90%D7%A8%D7%91%D7%A2>.
- S2: `site:commons.wikimedia.org "New Hope" logo 2021` → <https://commons.wikimedia.org/wiki/File:New_Hope_party_logo.png>; <https://commons.wikimedia.org/wiki/File:Birds_nest_NEW_LIFE_NEW_HOPE.jpg>; <https://commons.wikimedia.org/wiki/File:Miller_New_Hope_MB_Church.jpg>.
- S3: `site:facebook.com "תקווה חדשה" 2021 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "תקווה חדשה" 2021 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `noam` — נעם (לזוז).** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"נעם (לזוז)" "2021" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/media/27873/the-elections-in-israel-2022.pdf>; <https://www.idi.org.il/media/18514/the-elections-in-israel-2019-2021.pdf>; <https://huggingface.co/dicta-il/neodictabert-bilingual/resolve/main/vocab.txt?download=true>.
- S2: `site:commons.wikimedia.org "Noam (registered as Lazuz)" logo 2021` → no returned URLs.
- S3: `site:facebook.com "נעם" 2021 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "נעם" 2021 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `taal` — תע"ל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"תע"ל" "2021" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes24.bechirot.gov.il/>; <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%97%D7%9E%D7%A9>.
- S2: `site:commons.wikimedia.org "Ta'al" logo 2021` → <https://commons.wikimedia.org/wiki/File:Joint_List_logo.png>; <https://commons.wikimedia.org/wiki/File:Joint_List_logo_2019.svg>; <https://commons.wikimedia.org/wiki/Category:Logos_of_political_parties_in_Israel>.
- S3: `site:facebook.com "תעל" 2021 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "תעל" 2021 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `tkuma` — האיחוד הלאומי – תקומה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"האיחוד הלאומי – תקומה" "2021" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%90%D7%99%D7%97%D7%95%D7%93_%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99%E2%80%93%D7%AA%D7%A7%D7%95%D7%9E%D7%94>; <https://www.idi.org.il/articles/32955>; <https://library.mevaker.gov.il/sites/DigitalLibrary/Pages/Reports/1409-1.aspx>.
- S2: `site:commons.wikimedia.org "Religious Zionist Party (National Union–Tkuma)" logo 2021` → no returned URLs.
- S3: `site:facebook.com "האיחוד הלאומי" 2021 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "האיחוד הלאומי" 2021 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

Batch verification: `npx vitest run` **57 files / 484 tests passed**; `npx tsc -p tsconfig.json --noEmit`, `npx vite build`, and `python3 scripts/validate-party-logos.py` passed. Dataset build passed; all 26 election datasets equal prior batch after recursively removing `logo` and `builtAt`.

### k23 · 2020-03-02

Baseline whole lists: **3/8**; constituents: **1/18**. Every one of the 22 initial gaps below was attempted in all three routes; S3 quota failures do not count as completed source searches.

**L `ג` — יהדות התורה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"יהדות התורה" "2020" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes23.bechirot.gov.il/>; <https://he.wikipedia.org/wiki/%D7%99%D7%94%D7%93%D7%95%D7%AA_%D7%94%D7%AA%D7%95%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections/parties/yahadut-hatorah>.
- S2: `site:commons.wikimedia.org "United Torah Judaism" logo 2020` → <https://commons.wikimedia.org/wiki/Category:Agudat_Yisrael>.
- S3: `site:facebook.com "יהדות התורה" 2020 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "יהדות התורה" 2020 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ודעם` — הרשימה המשותפת.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"הרשימה המשותפת" "2020" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes23.bechirot.gov.il/>; <https://www.idi.org.il/policy/parties-and-elections/elections/2020-1>; <https://he.wikipedia.org/wiki/%D7%94%D7%A8%D7%A9%D7%99%D7%9E%D7%94_%D7%94%D7%9E%D7%A9%D7%95%D7%AA%D7%A4%D7%AA>.
- S2: `site:commons.wikimedia.org "Joint List" logo 2020` → <https://commons.wikimedia.org/wiki/File:Joint_List_logo.png>; <https://commons.wikimedia.org/wiki/Category:Joint_List>; <https://commons.wikimedia.org/wiki/File:2020_Knesset.svg>.
- S3: `site:facebook.com "הרשימה המשותפת" 2020 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "הרשימה המשותפת" 2020 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `טב` — ימינה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"ימינה" "2020" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes23.bechirot.gov.il/>; <https://www.idi.org.il/policy/parties-and-elections/elections/2020-1>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%90%D7%A8%D7%91%D7%A2>.
- S2: `site:commons.wikimedia.org "Yamina" logo 2020` → <https://commons.wikimedia.org/wiki/File:Yamina_logo.svg>; <https://commons.wikimedia.org/wiki/Category:Yamina>; <https://commons.wikimedia.org/wiki/Category:SVG_logos_of_political_parties_in_Israel>.
- S3: `site:facebook.com "ימינה" 2020 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "ימינה" 2020 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `פה` — כחול לבן.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"כחול לבן" "2020" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes23.bechirot.gov.il/>; <https://he.wikipedia.org/wiki/%D7%9B%D7%97%D7%95%D7%9C_%D7%9C%D7%91%D7%9F_%D7%97%D7%95%D7%A1%D7%9F_%D7%9C%D7%99%D7%A9%D7%A8%D7%90%D7%9C>; <https://www.idi.org.il/policy/parties-and-elections/elections/2020-1>.
- S2: `site:commons.wikimedia.org "Blue and White" logo 2020` → <https://commons.wikimedia.org/wiki/Category:Blue_and_white_logos_with_transparent_background>; <https://commons.wikimedia.org/wiki/Category:Navy_blue_and_white_logos>; <https://commons.wikimedia.org/wiki/Category:Blue_and_white_logos>.
- S3: `site:facebook.com "כחול לבן" 2020 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "כחול לבן" 2020 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `שס` — ש״ס.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"ש״ס" "2020" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections/elections/2020-1>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%97%D7%9E%D7%A9>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf>.
- S2: `site:commons.wikimedia.org "Shas" logo 2020` → <https://commons.wikimedia.org/wiki/File:Shas_logo.png>; <https://commons.wikimedia.org/wiki/Category:Shas>; <https://commons.wikimedia.org/wiki/File:Israeli_Knesset_Blocs_2020.svg>.
- S3: `site:facebook.com "שס" 2020 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "שס" 2020 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `ahi` — אח"י – ארץ חברה יהדות.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"אח"י – ארץ חברה יהדות" "2020" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%9C%D7%92%D7%AA_%D7%90%D7%97%22%D7%99>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%99%D7%AA_%D7%94%D7%99%D7%94%D7%95%D7%93%D7%99>; <https://www.hamichlol.org.il/%D7%94%D7%91%D7%99%D7%AA_%D7%94%D7%99%D7%94%D7%95%D7%93%D7%99>.
- S2: `site:commons.wikimedia.org "Ahi" logo 2020` → <https://commons.wikimedia.org/wiki/File:AHI_logo.svg>; <https://commons.wikimedia.org/wiki/Category:SVG_logos_of_retail_companies>; <https://commons.wikimedia.org/wiki/Category:Maps_of_Spain_in_logos>.
- S3: `site:facebook.com "אחי" 2020 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "אחי" 2020 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `balad` — בל"ד.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"בל"ד" "2020" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes23.bechirot.gov.il/>; <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%90%D7%A8%D7%91%D7%A2>.
- S2: `site:commons.wikimedia.org "Balad" logo 2020` → <https://commons.wikimedia.org/wiki/File:Sada_Elbalad.png>; <https://commons.wikimedia.org/wiki/File:BALAD.jpg>; <https://commons.wikimedia.org/wiki/File:Balad_District.png>.
- S3: `site:facebook.com "בלד" 2020 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "בלד" 2020 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `degel-hatorah` — דגל התורה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"דגל התורה" "2020" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%93%D7%92%D7%9C_%D7%94%D7%AA%D7%95%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections/parties/yahadut-hatorah>; <https://votes23.bechirot.gov.il/>.
- S2: `site:commons.wikimedia.org "Degel HaTorah" logo 2020` → no returned URLs.
- S3: `site:facebook.com "דגל התורה" 2020 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "דגל התורה" 2020 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `gesher` — גשר.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"גשר" "2020" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes23.bechirot.gov.il/>; <https://www.idi.org.il/policy/parties-and-elections/elections/2020-1>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%90%D7%A8%D7%91%D7%A2>.
- S2: `site:commons.wikimedia.org "Gesher" logo 2020` → <https://commons.wikimedia.org/wiki/File:Logo_of_the_Labor-Gesher-Meretz.svg>; <https://commons.wikimedia.org/wiki/File:20-22-Gesher-1954.jpg>; <https://commons.wikimedia.org/wiki/File:Gesher_Benot_Ya%27aqov_(997009157819505171.jpg>.
- S3: `site:facebook.com "גשר" 2020 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "גשר" 2020 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `hadash` — חד"ש (המפלגה הקומוניסטית הישראלית).** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"חד"ש (המפלגה הקומוניסטית הישראלית)" "2020" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%97%D7%96%D7%99%D7%AA_%D7%94%D7%93%D7%9E%D7%95%D7%A7%D7%A8%D7%98%D7%99%D7%AA_%D7%9C%D7%A9%D7%9C%D7%95%D7%9D_%D7%95%D7%9C%D7%A9%D7%95%D7%95%D7%99%D7%95%D7%9F>; <https://maki.org.il/>; <https://www.hamichlol.org.il/%D7%94%D7%9E%D7%A4%D7%9C%D7%92%D7%94_%D7%94%D7%A7%D7%95%D7%9E%D7%95%D7%A0%D7%99%D7%A1%D7%98%D7%99%D7%AA_%D7%94%D7%99%D7%A9%D7%A8%D7%90%D7%9C%D7%99%D7%AA>.
- S2: `site:commons.wikimedia.org "Hadash (Israeli Communist Party)" logo 2020` → no returned URLs.
- S3: `site:facebook.com "חדש" 2020 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "חדש" 2020 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `israel-resilience` — חוסן ישראל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"חוסן ישראל" "2020" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%9B%D7%97%D7%95%D7%9C_%D7%9C%D7%91%D7%9F_%D7%97%D7%95%D7%A1%D7%9F_%D7%9C%D7%99%D7%A9%D7%A8%D7%90%D7%9C>; <https://www.idi.org.il/policy/parties-and-elections>; <https://www.gov.il/BlobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisionsfullbook2022.pdf>.
- S2: `site:commons.wikimedia.org "Israel Resilience" logo 2020` → <https://commons.wikimedia.org/wiki/Category:Blue_and_White_(political_alliance)>.
- S3: `site:facebook.com "חוסן ישראל" 2020 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "חוסן ישראל" 2020 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `jewish-home` — הבית היהודי.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"הבית היהודי" "2020" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → **Tool failure:** Error: Search failed for query ""הבית היהודי" "2020" לוגו בחירות אתר רשמי -site:en.wikipedia.org": 500 Internal Server Error - timeout of 5000ms exceeded.
- S2: `site:commons.wikimedia.org "The Jewish Home" logo 2020` → <https://commons.wikimedia.org/wiki/File:2020_Knesset.svg>; <https://commons.wikimedia.org/wiki/Category:SVG_logos_of_political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/File:Israeli_Knesset_Composition_2020.svg>.
- S3: `site:facebook.com "הבית היהודי" 2020 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "הבית היהודי" 2020 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `kulanu` — כולנו.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"כולנו" "2020" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%90%D7%A8%D7%91%D7%A2>; <https://www.zman.co.il/227742>.
- S2: `site:commons.wikimedia.org "Kulanu" logo 2020` → <https://commons.wikimedia.org/wiki/Category:SVG_logos_of_political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/Category:Moshe_Kahlon>; <https://commons.wikimedia.org/wiki/Category:Yifat_Shasha-Biton>.
- S3: `site:facebook.com "כולנו" 2020 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "כולנו" 2020 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `labor` — העבודה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"העבודה" "2020" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes23.bechirot.gov.il/>; <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%9C%D7%92%D7%AA_%D7%94%D7%A2%D7%91%D7%95%D7%93%D7%94_%D7%94%D7%99%D7%A9%D7%A8%D7%90%D7%9C%D7%99%D7%AA>.
- S2: `site:commons.wikimedia.org "Labor" logo 2020` → <https://commons.wikimedia.org/wiki/Category:Logos_of_the_United_States_Department_of_Labor>; <https://commons.wikimedia.org/wiki/File:Knights_of_Labor_Logo.gif>; <https://commons.wikimedia.org/wiki/File:Korean_Labor_Party_logo.svg>.
- S3: `site:facebook.com "העבודה" 2020 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "העבודה" 2020 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `likud` — הליכוד.** Added fair-use Likud constituent from this election’s retained official header/CDX.

- S1: `"הליכוד" "2020" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes23.bechirot.gov.il/>; <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%97%D7%9E%D7%A9>.
- S2: `site:commons.wikimedia.org "Likud" logo 2020` → <https://commons.wikimedia.org/wiki/File:Likud_Logo.svg>; <https://commons.wikimedia.org/wiki/File:Logo_Likud.png>; <https://commons.wikimedia.org/wiki/Category:SVG_logos_of_political_parties_in_Israel>.
- S3: `site:facebook.com "הליכוד" 2020 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "הליכוד" 2020 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `meretz` — מרצ.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"מרצ" "2020" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes23.bechirot.gov.il/>; <https://he.wikipedia.org/wiki/%D7%9E%D7%A8%D7%A6>; <https://www.idi.org.il/policy/parties-and-elections/elections/2020-1>.
- S2: `site:commons.wikimedia.org "Meretz" logo 2020` → <https://commons.wikimedia.org/wiki/File:Meretz_Logo.png>; <https://commons.wikimedia.org/wiki/File:Meretz_Logo_Israel.png>; <https://commons.wikimedia.org/wiki/File:Haavodameretz.png>.
- S3: `site:facebook.com "מרצ" 2020 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "מרצ" 2020 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `new-right` — הימין החדש (צל"ש).** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"הימין החדש (צל"ש)" "2020" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%99%D7%9E%D7%99%D7%9F_%D7%94%D7%97%D7%93%D7%A9>; <https://www.idi.org.il/media/18514/the-elections-in-israel-2019-2021.pdf>; <https://www.inss.org.il/he/publication/israel-elections-2022>.
- S2: `site:commons.wikimedia.org "New Right (registered as Tzalash)" logo 2020` → no returned URLs.
- S3: `site:facebook.com "הימין החדש" 2020 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "הימין החדש" 2020 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `raam` — רע"ם – רשימת האיחוד הערבי.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"רע"ם – רשימת האיחוד הערבי" "2020" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%A8%D7%A9%D7%99%D7%9E%D7%94_%D7%94%D7%A2%D7%A8%D7%91%D7%99%D7%AA_%D7%94%D7%9E%D7%90%D7%95%D7%97%D7%93%D7%AA>; <https://www.gov.il/BlobFolder/guide/candidates-lists-26/he/pr5_26_annex.pdf>; <https://www.regthink.org/joint-list-comeback-call>.
- S2: `site:commons.wikimedia.org "Ra'am (United Arab List)" logo 2020` → no returned URLs.
- S3: `site:facebook.com "רעם" 2020 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "רעם" 2020 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `taal` — תע"ל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"תע"ל" "2020" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes23.bechirot.gov.il/>; <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%97%D7%9E%D7%A9>.
- S2: `site:commons.wikimedia.org "Ta'al" logo 2020` → <https://commons.wikimedia.org/wiki/File:Joint_List_logo.png>; <https://commons.wikimedia.org/wiki/Category:Joint_List>; <https://commons.wikimedia.org/wiki/Category:Joint_List?uselang=eo>.
- S3: `site:facebook.com "תעל" 2020 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "תעל" 2020 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `telem` — תל"ם.** Added free-licence Telem constituent; Commons dates official-site mark to 2019-12-27.

- S1: `"תל"ם" "2020" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%90%D7%A8%D7%91%D7%A2>; <https://www.kan.org.il/content/kan-news/politic/286610>.
- S2: `site:commons.wikimedia.org "Telem" logo 2020` → <https://commons.wikimedia.org/wiki/File:TELEM.png>; <https://commons.wikimedia.org/wiki/File:Yesh_Atid-Telem.png>; <https://commons.wikimedia.org/wiki/File:2020_Knesset.svg>.
- S3: `site:facebook.com "תלם" 2020 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "תלם" 2020 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `tkuma` — האיחוד הלאומי – תקומה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"האיחוד הלאומי – תקומה" "2020" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%90%D7%99%D7%97%D7%95%D7%93_%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99%E2%80%93%D7%AA%D7%A7%D7%95%D7%9E%D7%94>; <https://www.idi.org.il/articles/33649>; <https://library.mevaker.gov.il/sites/DigitalLibrary/Pages/Reports/1409-1.aspx>.
- S2: `site:commons.wikimedia.org "National Union–Tkuma" logo 2020` → no returned URLs.
- S3: `site:facebook.com "האיחוד הלאומי" 2020 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "האיחוד הלאומי" 2020 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `yesh-atid` — יש עתיד.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"יש עתיד" "2020" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%99%D7%A9_%D7%A2%D7%AA%D7%99%D7%93>; <https://www.kan.org.il/content/kan-news/politic/265674>; <https://www.idi.org.il/policy/parties-and-elections/parties/yesh-atid>.
- S2: `site:commons.wikimedia.org "Yesh Atid" logo 2020` → <https://commons.wikimedia.org/wiki/File:YeshAtidLogo.svg>; <https://commons.wikimedia.org/wiki/File:Yesh_Atid-Telem.png>; <https://commons.wikimedia.org/wiki/File:2020_Knesset.svg>.
- S3: `site:facebook.com "יש עתיד" 2020 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "יש עתיד" 2020 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

Batch verification: `npx vitest run` **57 files / 484 tests passed** (single worker and CLI testTimeout=30000 from k23 onward after existing rebuild tests exceeded 5000ms); `npx tsc -p tsconfig.json --noEmit`, `npx vite build`, and `python3 scripts/validate-party-logos.py` passed. Dataset build passed; all 26 election datasets equal prior batch after recursively removing `logo` and `builtAt`.

### k22 · 2019-09-17

Baseline whole lists: **4/9**; constituents: **2/19**. Every one of the 22 initial gaps below was attempted in all three routes; S3 quota failures do not count as completed source searches.

**L `אמת` — העבודה–גשר.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"העבודה–גשר" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes22.bechirot.gov.il/>; <https://www.idi.org.il/policy/parties-and-elections/parties/haavoda-gesher>; <https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%9C%D7%92%D7%AA_%D7%94%D7%A2%D7%91%D7%95%D7%93%D7%94_%D7%94%D7%99%D7%A9%D7%A8%D7%90%D7%9C%D7%99%D7%AA>.
- S2: `site:commons.wikimedia.org "Labor–Gesher" logo 2019` → <https://commons.wikimedia.org/wiki/Category:Logos_of_political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/Category:Israeli_Labor_Party>.
- S3: `site:facebook.com "העבודה–גשר" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "העבודה–גשר" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ג` — יהדות התורה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"יהדות התורה" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%99%D7%94%D7%93%D7%95%D7%AA_%D7%94%D7%AA%D7%95%D7%A8%D7%94>; <https://votes21.bechirot.gov.il/>; <https://www.idi.org.il/policy/parties-and-elections/parties/yahadut-hatorah>.
- S2: `site:commons.wikimedia.org "United Torah Judaism" logo 2019` → <https://commons.wikimedia.org/wiki/File:United_Torah_Judaism_Logo_2019.svg>.
- S3: `site:facebook.com "יהדות התורה" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "יהדות התורה" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `מרצ` — המחנה הדמוקרטי.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"המחנה הדמוקרטי" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes22.bechirot.gov.il/>; <https://www.idi.org.il/policy/parties-and-elections>; <https://www.haaretz.co.il/news/elections/2019-08-04/ty-article/0000017f-f5a9-d47e-a37f-fdbdba310000>.
- S2: `site:commons.wikimedia.org "Democratic Union" logo 2019` → <https://commons.wikimedia.org/wiki/File:Flag_of_the_Democratic_Union_Party.svg>; <https://commons.wikimedia.org/wiki/File:SDSM_logo_2019.png>; <https://commons.wikimedia.org/wiki/File:Logo_of_the_Freedom_Union_%E2%80%93_Democratic_Union.svg>.
- S3: `site:facebook.com "המחנה הדמוקרטי" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "המחנה הדמוקרטי" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `פה` — כחול לבן.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"כחול לבן" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes22.bechirot.gov.il/>; <https://he.wikipedia.org/wiki/%D7%9B%D7%97%D7%95%D7%9C_%D7%9C%D7%91%D7%9F_(%D7%A8%D7%A9%D7%99%D7%9E%D7%94)>; <https://www.idi.org.il/policy/parties-and-elections/parties/blue-white>.
- S2: `site:commons.wikimedia.org "Blue and White" logo 2019` → <https://commons.wikimedia.org/wiki/Category:Blue_and_white_logos_with_transparent_background>; <https://commons.wikimedia.org/wiki/Category:Blue_and_white_logos>; <https://commons.wikimedia.org/wiki/File:DTM_Blue_and_White_logo.svg>.
- S3: `site:facebook.com "כחול לבן" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "כחול לבן" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `שס` — ש״ס.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"ש״ס" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%AA%D7%99%D7%99%D7%9D>; <https://www.idi.org.il/policy/parties-and-elections>.
- S2: `site:commons.wikimedia.org "Shas" logo 2019` → <https://commons.wikimedia.org/wiki/File:Shas_logo.png>; <https://commons.wikimedia.org/wiki/File:Shas_Election_Booth,_2019.jpg>; <https://commons.wikimedia.org/wiki/Category:Shas>.
- S3: `site:facebook.com "שס" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "שס" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `agudat-yisrael` — אגודת ישראל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"אגודת ישראל" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes22.bechirot.gov.il/>; <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%AA%D7%99%D7%99%D7%9D>.
- S2: `site:commons.wikimedia.org "Agudat Yisrael" logo 2019` → <https://commons.wikimedia.org/wiki/Category:SVG_logos_of_political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/File:RFF_Logo.png>; <https://commons.wikimedia.org/wiki/Category:Political_parties_in_Latvia>.
- S3: `site:facebook.com "אגודת ישראל" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "אגודת ישראל" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `degel-hatorah` — דגל התורה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"דגל התורה" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes21.bechirot.gov.il/>; <https://he.wikipedia.org/wiki/%D7%93%D7%92%D7%9C_%D7%94%D7%AA%D7%95%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections>.
- S2: `site:commons.wikimedia.org "Degel HaTorah" logo 2019` → no returned URLs.
- S3: `site:facebook.com "דגל התורה" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "דגל התורה" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `gesher` — גשר.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"גשר" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes22.bechirot.gov.il/>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%AA%D7%99%D7%99%D7%9D>; <https://www.idi.org.il/policy/parties-and-elections>.
- S2: `site:commons.wikimedia.org "Gesher" logo 2019` → <https://commons.wikimedia.org/wiki/File:Gesher_police_station_2019.jpg>; <https://commons.wikimedia.org/wiki/File:Old-Gesher-241.jpg>; <https://commons.wikimedia.org/wiki/Category:Gesher_police_Building>.
- S3: `site:facebook.com "גשר" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "גשר" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `green-movement` — התנועה הירוקה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"התנועה הירוקה" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%9E%D7%A4%D7%9C%D7%92%D7%94_%D7%94%D7%99%D7%A8%D7%95%D7%A7%D7%94_(%D7%99%D7%A9%D7%A8%D7%90%D7%9C)>; <https://www.idi.org.il/policy/parties-and-elections/elections/2019-september>; <https://www.walla.co.il/news/politics/3381301>.
- S2: `site:commons.wikimedia.org "Green Movement" logo 2019` → <https://commons.wikimedia.org/wiki/Category:Green_Movement_(Israel)>; <https://commons.wikimedia.org/wiki/Category:Green_movements>; <https://commons.wikimedia.org/wiki/File:Althing_2019.svg>.
- S3: `site:facebook.com "התנועה הירוקה" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "התנועה הירוקה" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `hadash` — חד"ש (המפלגה הקומוניסטית הישראלית).** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"חד"ש (המפלגה הקומוניסטית הישראלית)" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%97%D7%96%D7%99%D7%AA_%D7%94%D7%93%D7%9E%D7%95%D7%A7%D7%A8%D7%98%D7%99%D7%AA_%D7%9C%D7%A9%D7%9C%D7%95%D7%9D_%D7%95%D7%9C%D7%A9%D7%95%D7%95%D7%99%D7%95%D7%9F>; <https://www.idi.org.il/policy/parties-and-elections/parties/hadash>; <https://www.hamichlol.org.il/%D7%94%D7%9E%D7%A4%D7%9C%D7%92%D7%94_%D7%94%D7%A7%D7%95%D7%9E%D7%95%D7%A0%D7%99%D7%A1%D7%98%D7%99%D7%AA_%D7%94%D7%99%D7%A9%D7%A8%D7%90%D7%9C%D7%99%D7%AA>.
- S2: `site:commons.wikimedia.org "Hadash (Israeli Communist Party)" logo 2019` → no returned URLs.
- S3: `site:facebook.com "חדש" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "חדש" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `independence` — העצמאות.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"העצמאות" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://main.knesset.gov.il/mk/elections/pages/default.aspx>; <https://www.idi.org.il/policy/parties-and-elections/elections/2019-2>; <https://www.gov.il/he/departments/dynamiccollectors/parties-db>.
- S2: `site:commons.wikimedia.org "Israel Democratic Party (registered as Independence)" logo 2019` → no returned URLs.
- S3: `site:facebook.com "העצמאות" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "העצמאות" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `israel-resilience` — חוסן ישראל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"חוסן ישראל" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%9B%D7%97%D7%95%D7%9C_%D7%9C%D7%91%D7%9F_%D7%97%D7%95%D7%A1%D7%9F_%D7%9C%D7%99%D7%A9%D7%A8%D7%90%D7%9C>; <https://www.idi.org.il/policy/parties-and-elections>; <https://www.gov.il/BlobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisionsfullbook2022.pdf>.
- S2: `site:commons.wikimedia.org "Israel Resilience" logo 2019` → <https://commons.wikimedia.org/wiki/Category:Blue_and_White_(political_alliance)>; <https://commons.wikimedia.org/wiki/Category:Political_parties_established_in_2018?uselang=ms>.
- S3: `site:facebook.com "חוסן ישראל" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "חוסן ישראל" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `jewish-home` — הבית היהודי.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"הבית היהודי" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes22.bechirot.gov.il/>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%97%D7%9E%D7%A9>; <https://www.idi.org.il/policy/parties-and-elections/parties/yamina>.
- S2: `site:commons.wikimedia.org "The Jewish Home" logo 2019` → <https://commons.wikimedia.org/wiki/File:The-Jewish-Home-logo.svg>; <https://commons.wikimedia.org/wiki/Category:The_Jewish_Home>; <https://commons.wikimedia.org/wiki/Category:The_Jewish_Home_elections_posters>.
- S3: `site:facebook.com "הבית היהודי" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "הבית היהודי" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `kulanu` — כולנו.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"כולנו" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes22.bechirot.gov.il/>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%AA%D7%99%D7%99%D7%9D>; <https://www.idi.org.il/policy/parties-and-elections>.
- S2: `site:commons.wikimedia.org "Kulanu" logo 2019` → <https://commons.wikimedia.org/wiki/Category:Kulanu>; <https://commons.wikimedia.org/wiki/File:Kulanu_Israel_Beyteno_Lod_20190324_154031_03.jpg>; <https://commons.wikimedia.org/wiki/File:KulanuNew.svg>.
- S3: `site:facebook.com "כולנו" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "כולנו" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `labor` — העבודה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"העבודה" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes22.bechirot.gov.il/>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%AA%D7%99%D7%99%D7%9D>; <https://www.idi.org.il/policy/parties-and-elections/parties/haavoda-gesher>.
- S2: `site:commons.wikimedia.org "Labor" logo 2019` → <https://commons.wikimedia.org/wiki/File:Israeli_Labor_Party_2019.png>; <https://commons.wikimedia.org/wiki/File:DOL_WHD_logo.svg>; <https://commons.wikimedia.org/wiki/File:Pennsylvania_Department_of_Labor_and_Industry_Logo.svg>.
- S3: `site:facebook.com "העבודה" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "העבודה" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `likud` — הליכוד.** Added fair-use Likud constituent from this election’s retained official header/CDX.

- S1: `"הליכוד" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes22.bechirot.gov.il/>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%AA%D7%99%D7%99%D7%9D>; <https://www.idi.org.il/policy/parties-and-elections>.
- S2: `site:commons.wikimedia.org "Likud" logo 2019` → <https://commons.wikimedia.org/wiki/File:Likud_Logo.svg>; <https://commons.wikimedia.org/wiki/File:Likud_2019_election_billboard.jpg>; <https://commons.wikimedia.org/wiki/File:Logo_Likud.png>.
- S3: `site:facebook.com "הליכוד" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "הליכוד" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `meretz` — מרצ.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"מרצ" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes22.bechirot.gov.il/>; <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%9E%D7%A8%D7%A6>.
- S2: `site:commons.wikimedia.org "Meretz" logo 2019` → <https://commons.wikimedia.org/wiki/File:Meretz_Logo.svg>; <https://commons.wikimedia.org/wiki/Category:Logos_of_political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/Category:SVG_logos_of_political_parties_in_Israel>.
- S3: `site:facebook.com "מרצ" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "מרצ" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `new-right` — הימין החדש (צל"ש).** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"הימין החדש (צל"ש)" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%99%D7%9E%D7%99%D7%9F_%D7%94%D7%97%D7%93%D7%A9>; <https://www.inss.org.il/he/publication/israel-elections-2022>; <https://www.idi.org.il/articles/33646>.
- S2: `site:commons.wikimedia.org "New Right (registered as Tzalash)" logo 2019` → no returned URLs.
- S3: `site:facebook.com "הימין החדש" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "הימין החדש" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `raam` — רע"ם – רשימת האיחוד הערבי.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"רע"ם – רשימת האיחוד הערבי" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.walla.co.il/news/breaking-news/3239617>.
- S2: `site:commons.wikimedia.org "Ra'am (United Arab List)" logo 2019` → no returned URLs.
- S3: `site:facebook.com "רעם" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "רעם" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `taal` — תע"ל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"תע"ל" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes22.bechirot.gov.il/>; <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%97%D7%9E%D7%A9>.
- S2: `site:commons.wikimedia.org "Ta'al" logo 2019` → <https://commons.wikimedia.org/wiki/File:Ta%27al_party_logo.png>; <https://commons.wikimedia.org/wiki/File:Joint_List_logo_2019.svg>; <https://commons.wikimedia.org/wiki/File:Logo_Hadash_Ta%27al.png>.
- S3: `site:facebook.com "תעל" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "תעל" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `telem` — תל"ם.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"תל"ם" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%AA%D7%99%D7%99%D7%9D>; <https://www.kan.org.il/content/kan-news/politic/286610>.
- S2: `site:commons.wikimedia.org "Telem" logo 2019` → <https://commons.wikimedia.org/wiki/File:TELEM.png>; <https://commons.wikimedia.org/wiki/File:Telem_(1981)_Logo.png>; <https://commons.wikimedia.org/wiki/File:Moshe_Ya%27alon_(cropped).jpg>.
- S3: `site:facebook.com "תלם" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "תלם" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `tkuma` — האיחוד הלאומי – תקומה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"האיחוד הלאומי – תקומה" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%90%D7%99%D7%97%D7%95%D7%93_%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99%E2%80%93%D7%AA%D7%A7%D7%95%D7%9E%D7%94>; <https://www.idi.org.il/articles/33649>; <https://library.mevaker.gov.il/sites/DigitalLibrary/Pages/Reports/1409-1.aspx>.
- S2: `site:commons.wikimedia.org "National Union–Tkuma" logo 2019` → no returned URLs.
- S3: `site:facebook.com "האיחוד הלאומי" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "האיחוד הלאומי" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

Batch verification: `npx vitest run` **57 files / 484 tests passed** (single worker and CLI testTimeout=30000 from k23 onward after existing rebuild tests exceeded 5000ms); `npx tsc -p tsconfig.json --noEmit`, `npx vite build`, and `python3 scripts/validate-party-logos.py` passed. Dataset build passed; all 26 election datasets equal prior batch after recursively removing `logo` and `builtAt`.

### k21 · 2019-04-09

Baseline whole lists: **3/11**; constituents: **0/14**. Every one of the 22 initial gaps below was attempted in all three routes; S3 quota failures do not count as completed source searches.

**L `ג` — יהדות התורה.** Added free-licence UTJ whole-list mark; Commons credits party artwork in 2019-04-05 Hamevaser.

- S1: `"יהדות התורה" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes21.bechirot.gov.il/>; <https://he.wikipedia.org/wiki/%D7%99%D7%94%D7%93%D7%95%D7%AA_%D7%94%D7%AA%D7%95%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections/parties/yahadut-hatorah>.
- S2: `site:commons.wikimedia.org "United Torah Judaism" logo 2019` → <https://commons.wikimedia.org/wiki/File:United_Torah_Judaism_Logo_2019.svg>.
- S3: `site:facebook.com "יהדות התורה" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "יהדות התורה" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `דעם` — רע״ם–בל״ד.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"רע״ם–בל״ד" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes21.bechirot.gov.il/>; <https://www.idi.org.il/articles/66556>; <https://www.inss.org.il/he/publication/%D7%94%D7%97%D7%91%D7%A8%D7%94-%D7%94%D7%A2%D7%A8%D7%91%D7%99%D7%AA-%D7%95%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA-%D7%94-22>.
- S2: `site:commons.wikimedia.org "Ra’am–Balad" logo 2019` → <https://commons.wikimedia.org/wiki/File:Israel_Abr_Kneset_2019.svg>.
- S3: `site:facebook.com "רעם–בלד" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "רעם–בלד" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ום` — חד״ש–תע״ל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"חד״ש–תע״ל" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%97%D7%93%22%D7%A9-%D7%AA%D7%A2%22%D7%9C>; <https://www.idi.org.il/policy/parties-and-elections/parties/hadash-taal>; <https://votes21.bechirot.gov.il/>.
- S2: `site:commons.wikimedia.org "Hadash–Ta’al" logo 2019` → <https://commons.wikimedia.org/wiki/File:Logo_Hadash_Ta%27al.png>; <https://commons.wikimedia.org/wiki/File:Joint_List_logo_2019.svg>; <https://commons.wikimedia.org/wiki/Category:Logos_of_political_parties_in_Israel>.
- S3: `site:facebook.com "חדש–תעל" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "חדש–תעל" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `טב` — איחוד מפלגות הימין.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"איחוד מפלגות הימין" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%90%D7%99%D7%97%D7%95%D7%93_%D7%9E%D7%A4%D7%9C%D7%92%D7%95%D7%AA_%D7%94%D7%99%D7%9E%D7%99%D7%9F>; <https://www.idi.org.il/policy/parties-and-elections/parties/ichud-miflagot-hayemin>; <https://www.kan.org.il/content/kan-news/politic/305125>.
- S2: `site:commons.wikimedia.org "Union of Right-Wing Parties" logo 2019` → no returned URLs.
- S3: `site:facebook.com "איחוד מפלגות הימין" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "איחוד מפלגות הימין" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `כ` — כולנו.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"כולנו" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes22.bechirot.gov.il/>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%AA%D7%99%D7%99%D7%9D>; <https://www.idi.org.il/policy/parties-and-elections>.
- S2: `site:commons.wikimedia.org "Kulanu" logo 2019` → <https://commons.wikimedia.org/wiki/Category:Kulanu>; <https://commons.wikimedia.org/wiki/File:KulanuNew.svg>; <https://commons.wikimedia.org/wiki/File:Kulanu_Israel_Beyteno_Lod_20190324_154031_03.jpg>.
- S3: `site:facebook.com "כולנו" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "כולנו" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `מרצ` — מרצ.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"מרצ" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes22.bechirot.gov.il/>; <https://he.wikipedia.org/wiki/%D7%9E%D7%A8%D7%A6>; <https://www.idi.org.il/policy/parties-and-elections>.
- S2: `site:commons.wikimedia.org "Meretz" logo 2019` → <https://commons.wikimedia.org/wiki/File:Meretz_Logo.svg>; <https://commons.wikimedia.org/wiki/Category:Logos_of_political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/Category:SVG_logos_of_political_parties_in_Israel>.
- S3: `site:facebook.com "מרצ" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "מרצ" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `פה` — כחול לבן.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"כחול לבן" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes22.bechirot.gov.il/>; <https://he.wikipedia.org/wiki/%D7%9B%D7%97%D7%95%D7%9C_%D7%9C%D7%91%D7%9F_(%D7%A8%D7%A9%D7%99%D7%9E%D7%94)>; <https://www.idi.org.il/policy/parties-and-elections/parties/blue-white>.
- S2: `site:commons.wikimedia.org "Blue and White" logo 2019` → <https://commons.wikimedia.org/wiki/Category:Blue_and_white_logos_with_transparent_background>; <https://commons.wikimedia.org/wiki/Category:Blue_and_white_logos>; <https://commons.wikimedia.org/wiki/File:DTM_Blue_and_White_logo.svg>.
- S3: `site:facebook.com "כחול לבן" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "כחול לבן" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `שס` — ש״ס.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"ש״ס" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%AA%D7%99%D7%99%D7%9D>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf>; <https://www.idi.org.il/policy/parties-and-elections>.
- S2: `site:commons.wikimedia.org "Shas" logo 2019` → <https://commons.wikimedia.org/wiki/File:Shas_logo.png>; <https://commons.wikimedia.org/wiki/File:Shas_Election_Booth,_2019.jpg>; <https://commons.wikimedia.org/wiki/Category:Shas>.
- S3: `site:facebook.com "שס" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "שס" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `agudat-yisrael` — אגודת ישראל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"אגודת ישראל" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes22.bechirot.gov.il/>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%97%D7%9E%D7%A9>.
- S2: `site:commons.wikimedia.org "Agudat Yisrael" logo 2019` → <https://commons.wikimedia.org/wiki/Category:SVG_logos_of_political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/File:RFF_Logo.png>; <https://commons.wikimedia.org/wiki/Category:Political_parties_in_Latvia>.
- S3: `site:facebook.com "אגודת ישראל" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "אגודת ישראל" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `ahi` — אח"י – ארץ חברה יהדות.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"אח"י – ארץ חברה יהדות" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%9C%D7%92%D7%AA_%D7%90%D7%97%22%D7%99>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%99%D7%AA_%D7%94%D7%99%D7%94%D7%95%D7%93%D7%99>; <https://www.walla.co.il/news/breaking-news/3239617>.
- S2: `site:commons.wikimedia.org "Ahi" logo 2019` → <https://commons.wikimedia.org/wiki/File:AHI_logo.svg>; <https://commons.wikimedia.org/wiki/File:Israel_Knesset_2019.svg>; <https://commons.wikimedia.org/wiki/File:Kammuri_2019-12-02_0730Z.png>.
- S3: `site:facebook.com "אחי" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "אחי" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `balad` — בל"ד.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"בל"ד" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes22.bechirot.gov.il/>; <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%97%D7%9E%D7%A9>.
- S2: `site:commons.wikimedia.org "Balad" logo 2019` → <https://commons.wikimedia.org/wiki/File:Balad.svg>; <https://commons.wikimedia.org/wiki/File:Joint_List_logo_2019.svg>; <https://commons.wikimedia.org/wiki/File:Al-Balad.svg>.
- S3: `site:facebook.com "בלד" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "בלד" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `degel-hatorah` — דגל התורה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"דגל התורה" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%93%D7%92%D7%9C_%D7%94%D7%AA%D7%95%D7%A8%D7%94>; <https://votes21.bechirot.gov.il/>; <https://www.idi.org.il/policy/parties-and-elections/parties/yahadut-hatorah>.
- S2: `site:commons.wikimedia.org "Degel HaTorah" logo 2019` → no returned URLs.
- S3: `site:facebook.com "דגל התורה" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "דגל התורה" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `hadash` — חד"ש (המפלגה הקומוניסטית הישראלית).** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"חד"ש (המפלגה הקומוניסטית הישראלית)" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%97%D7%96%D7%99%D7%AA_%D7%94%D7%93%D7%9E%D7%95%D7%A7%D7%A8%D7%98%D7%99%D7%AA_%D7%9C%D7%A9%D7%9C%D7%95%D7%9D_%D7%95%D7%9C%D7%A9%D7%95%D7%95%D7%99%D7%95%D7%9F>; <https://www.idi.org.il/policy/parties-and-elections/parties/hadash>; <https://www.hamichlol.org.il/%D7%94%D7%9E%D7%A4%D7%9C%D7%92%D7%94_%D7%94%D7%A7%D7%95%D7%9E%D7%95%D7%A0%D7%99%D7%A1%D7%98%D7%99%D7%AA_%D7%94%D7%99%D7%A9%D7%A8%D7%90%D7%9C%D7%99%D7%AA>.
- S2: `site:commons.wikimedia.org "Hadash (Israeli Communist Party)" logo 2019` → no returned URLs.
- S3: `site:facebook.com "חדש" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "חדש" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `israel-resilience` — חוסן ישראל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"חוסן ישראל" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%97%D7%9E%D7%A9>; <https://www.idi.org.il/media/18514/the-elections-in-israel-2019-2021.pdf>; <https://www.gov.il/BlobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisionsfullbook2022.pdf>.
- S2: `site:commons.wikimedia.org "Israel Resilience" logo 2019` → <https://commons.wikimedia.org/wiki/Category:Blue_and_White_(political_alliance)>; <https://commons.wikimedia.org/wiki/Category:Political_parties_established_in_2018?uselang=ms>.
- S3: `site:facebook.com "חוסן ישראל" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "חוסן ישראל" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `jewish-home` — הבית היהודי.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"הבית היהודי" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes22.bechirot.gov.il/>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%97%D7%9E%D7%A9>; <https://www.idi.org.il/policy/parties-and-elections/parties/yamina>.
- S2: `site:commons.wikimedia.org "The Jewish Home" logo 2019` → <https://commons.wikimedia.org/wiki/File:The-Jewish-Home-logo.svg>; <https://commons.wikimedia.org/wiki/Category:The_Jewish_Home>; <https://commons.wikimedia.org/wiki/Category:The_Jewish_Home_elections_posters>.
- S3: `site:facebook.com "הבית היהודי" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "הבית היהודי" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `likud` — הליכוד.** Added fair-use Likud constituent from this election’s retained official header/CDX.

- S1: `"הליכוד" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes22.bechirot.gov.il/>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%AA%D7%99%D7%99%D7%9D>; <https://www.idi.org.il/policy/parties-and-elections>.
- S2: `site:commons.wikimedia.org "Likud" logo 2019` → <https://commons.wikimedia.org/wiki/File:Likud_Logo.svg>; <https://commons.wikimedia.org/wiki/File:Likud_2019_election_billboard.jpg>; <https://commons.wikimedia.org/wiki/File:Logo_Likud.png>.
- S3: `site:facebook.com "הליכוד" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "הליכוד" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `otzma-yehudit` — עוצמה יהודית (חזית יהודית לאומית).** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"עוצמה יהודית (חזית יהודית לאומית)" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.gov.il/BlobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisionsfullbook2022.pdf>; <https://www.mako.co.il/finances-news/Article-70e2bd529a88f91026.htm>.
- S2: `site:commons.wikimedia.org "Otzma Yehudit (Jewish National Front)" logo 2019` → no returned URLs.
- S3: `site:facebook.com "עוצמה יהודית" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "עוצמה יהודית" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `raam` — רע"ם – רשימת האיחוד הערבי.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"רע"ם – רשימת האיחוד הערבי" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.walla.co.il/news/breaking-news/3239617>.
- S2: `site:commons.wikimedia.org "Ra'am (United Arab List)" logo 2019` → no returned URLs.
- S3: `site:facebook.com "רעם" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "רעם" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `taal` — תע"ל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"תע"ל" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://votes22.bechirot.gov.il/>; <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%97%D7%93%22%D7%A9-%D7%AA%D7%A2%22%D7%9C>.
- S2: `site:commons.wikimedia.org "Ta'al" logo 2019` → <https://commons.wikimedia.org/wiki/File:Ta%27al_party_logo.png>; <https://commons.wikimedia.org/wiki/File:Logo_Hadash_Ta%27al.png>; <https://commons.wikimedia.org/wiki/File:Joint_List_logo_2019.svg>.
- S3: `site:facebook.com "תעל" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "תעל" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `telem` — תל"ם.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"תל"ם" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%AA%D7%9C%22%D7%9D_%E2%80%93_%D7%AA%D7%A0%D7%95%D7%A2%D7%94_%D7%9C%D7%90%D7%95%D7%9E%D7%99%D7%AA_%D7%9E%D7%9E%D7%9C%D7%9B%D7%AA%D7%99%D7%AA>; <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%AA%D7%99%D7%99%D7%9D>.
- S2: `site:commons.wikimedia.org "Telem" logo 2019` → <https://commons.wikimedia.org/wiki/File:TELEM.png>; <https://commons.wikimedia.org/wiki/File:Telem_(1981)_Logo.png>; <https://commons.wikimedia.org/wiki/File:Moshe_Ya%27alon_(cropped).jpg>.
- S3: `site:facebook.com "תלם" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "תלם" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `tkuma` — האיחוד הלאומי – תקומה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"האיחוד הלאומי – תקומה" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%90%D7%99%D7%97%D7%95%D7%93_%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99%E2%80%93%D7%AA%D7%A7%D7%95%D7%9E%D7%94>; <https://www.idi.org.il/articles/33649>; <https://library.mevaker.gov.il/sites/DigitalLibrary/Pages/Reports/1409-1.aspx>.
- S2: `site:commons.wikimedia.org "National Union–Tkuma" logo 2019` → no returned URLs.
- S3: `site:facebook.com "האיחוד הלאומי" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "האיחוד הלאומי" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `yesh-atid` — יש עתיד.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"יש עתיד" "2019" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%99%D7%A9_%D7%A2%D7%AA%D7%99%D7%93>; <https://www.idi.org.il/articles/36664>; <https://www.kan.org.il/content/kan-news/politic/282772>.
- S2: `site:commons.wikimedia.org "Yesh Atid" logo 2019` → <https://commons.wikimedia.org/wiki/Category:Logos_of_political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/File:Israeli_Knesset_Composition-2019.svg>; <https://commons.wikimedia.org/wiki/wikidata:Q133396>.
- S3: `site:facebook.com "יש עתיד" 2019 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "יש עתיד" 2019 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

Batch verification: `npx vitest run` **57 files / 484 tests passed** (single worker and CLI testTimeout=30000 from k23 onward after existing rebuild tests exceeded 5000ms); `npx tsc -p tsconfig.json --noEmit`, `npx vite build`, and `python3 scripts/validate-party-logos.py` passed. Dataset build passed; all 26 election datasets equal prior batch after recursively removing `logo` and `builtAt`.

### k20 · 2015-03-17

Baseline whole lists: **2/10**; constituents: **0/11**. Every one of the 19 initial gaps below was attempted in all three routes; S3 quota failures do not count as completed source searches.

**L `אמת` — המחנה הציוני.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"המחנה הציוני" "2015" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections/parties/zionist-union>; <https://www.inss.org.il/he/publication/%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-2015>; <https://www.kan.org.il/content/kan-news/politic/235369>.
- S2: `site:commons.wikimedia.org "Zionist Union" logo 2015` → <https://commons.wikimedia.org/wiki/File:Zionist_Union.svg>; <https://commons.wikimedia.org/wiki/File:Israel_Knesset_2015.svg>; <https://commons.wikimedia.org/wiki/File:2015_Israeli_Knesset_Composition.svg>.
- S3: `site:facebook.com "המחנה הציוני" 2015 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "המחנה הציוני" 2015 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ג` — יהדות התורה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"יהדות התורה" "2015" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%99%D7%94%D7%93%D7%95%D7%AA_%D7%94%D7%AA%D7%95%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections/parties/yahadut-hatorah>; <https://www.inss.org.il/he/publication/%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-2015>.
- S2: `site:commons.wikimedia.org "United Torah Judaism" logo 2015` → <https://commons.wikimedia.org/wiki/File:2015_Israeli_Knesset_Composition.svg>; <https://commons.wikimedia.org/wiki/Category:Agudat_Yisrael>.
- S3: `site:facebook.com "יהדות התורה" 2015 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "יהדות התורה" 2015 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ודעם` — הרשימה המשותפת.** Added free-licence whole-list mark; Commons credits Joint List and dates it 2015-01-22.

- S1: `"הרשימה המשותפת" "2015" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%A8%D7%A9%D7%99%D7%9E%D7%94_%D7%94%D7%9E%D7%A9%D7%95%D7%AA%D7%A4%D7%AA>; <https://www.idi.org.il/policy/parties-and-elections/parties/joint-arab-list>; <https://www.kan.org.il/content/kan-news/politic/352332>.
- S2: `site:commons.wikimedia.org "Joint List" logo 2015` → <https://commons.wikimedia.org/wiki/File:Joint_list_logo.png>; <https://commons.wikimedia.org/wiki/File:2015_Israeli_Knesset_Composition.svg>; <https://commons.wikimedia.org/wiki/File:Joint_list.jpg>.
- S3: `site:facebook.com "הרשימה המשותפת" 2015 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "הרשימה המשותפת" 2015 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `טב` — הבית היהודי.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"הבית היהודי" "2015" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%AA%D7%A9%D7%A2_%D7%A2%D7%A9%D7%A8%D7%94>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions_jubran_knesset20.pdf>.
- S2: `site:commons.wikimedia.org "Jewish Home" logo 2015` → <https://commons.wikimedia.org/wiki/Category:The_Jewish_Home>; <https://commons.wikimedia.org/wiki/File:Relief_on_exterior_wall_of_the_former_Rosa_Coplon_Jewish_Home_and_Infirmary,_Buffalo,_New_York,_April_2015.jpg>; <https://commons.wikimedia.org/wiki/File:Lost_but_found_-_or,_The_Jewish_home_(1868)_(14781917142).jpg>.
- S3: `site:facebook.com "הבית היהודי" 2015 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "הבית היהודי" 2015 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ל` — ישראל ביתנו.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"ישראל ביתנו" "2015" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections/parties/yisrael-beytenu>; <https://he.wikipedia.org/wiki/%D7%99%D7%A9%D7%A8%D7%90%D7%9C_%D7%91%D7%99%D7%AA%D7%A0%D7%95>; <https://www.inss.org.il/he/publication/%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-2015>.
- S2: `site:commons.wikimedia.org "Yisrael Beiteinu" logo 2015` → <https://commons.wikimedia.org/wiki/File:Israel-beytenu-logo.svg>; <https://commons.wikimedia.org/wiki/Category:Yisrael_Beiteinu>; <https://commons.wikimedia.org/wiki/Category:Yisrael_Beiteinu?uselang=ms>.
- S3: `site:facebook.com "ישראל ביתנו" 2015 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "ישראל ביתנו" 2015 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `מרצ` — מרצ.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"מרצ" "2015" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%9E%D7%A8%D7%A6>; <https://www.idi.org.il/policy/parties-and-elections>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions_jubran_knesset20.pdf>.
- S2: `site:commons.wikimedia.org "Meretz" logo 2015` → <https://commons.wikimedia.org/wiki/File:Meretz_Logo.svg>; <https://commons.wikimedia.org/wiki/File:Meretz_Youth_logo_2014.png>; <https://commons.wikimedia.org/wiki/Category:Meretz>.
- S3: `site:facebook.com "מרצ" 2015 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "מרצ" 2015 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `פה` — יש עתיד.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"יש עתיד" "2015" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%99%D7%A9_%D7%A2%D7%AA%D7%99%D7%93>; <https://www.idi.org.il/policy/parties-and-elections/parties/yesh-atid>; <https://www.inss.org.il/he/publication/%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-2015>.
- S2: `site:commons.wikimedia.org "Yesh Atid" logo 2015` → <https://commons.wikimedia.org/wiki/File:Yesh_Atid_logo.png>; <https://commons.wikimedia.org/wiki/File:YeshAtidLogo.svg>; <https://commons.wikimedia.org/wiki/File:2015_Israeli_Knesset_Composition.svg>.
- S3: `site:facebook.com "יש עתיד" 2015 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "יש עתיד" 2015 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `שס` — ש״ס.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"ש״ס" "2015" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%9C%D7%92%D7%AA_%D7%A9%22%D7%A1>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf>.
- S2: `site:commons.wikimedia.org "Shas" logo 2015` → <https://commons.wikimedia.org/wiki/File:Shas_logo.png>; <https://commons.wikimedia.org/wiki/File:Israel_Elections_2015_Shas.jpg>; <https://commons.wikimedia.org/wiki/Category:Shas>.
- S3: `site:facebook.com "שס" 2015 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "שס" 2015 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `agudat-yisrael` — אגודת ישראל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"אגודת ישראל" "2015" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%90%D7%92%D7%95%D7%93%D7%AA_%D7%99%D7%A9%D7%A8%D7%90%D7%9C>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions_jubran_knesset20.pdf>.
- S2: `site:commons.wikimedia.org "Agudat Yisrael" logo 2015` → <https://commons.wikimedia.org/wiki/Category:Agudat_Yisrael>.
- S3: `site:facebook.com "אגודת ישראל" 2015 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "אגודת ישראל" 2015 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `balad` — בל"ד.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"בל"ד" "2015" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%91%D7%A8%D7%99%D7%AA_%D7%9C%D7%90%D7%95%D7%9E%D7%99%D7%AA_%D7%93%D7%9E%D7%95%D7%A7%D7%A8%D7%98%D7%99%D7%AA>; <https://www.idi.org.il/policy/parties-and-elections/parties/raam-balad>; <https://www.kan.org.il/content/kan-news/politic/1082584>.
- S2: `site:commons.wikimedia.org "Balad" logo 2015` → <https://commons.wikimedia.org/wiki/File:Joint_List_logo.png>; <https://commons.wikimedia.org/wiki/File:Director_Abdulrahman_Thaher_2015.jpg>; <https://commons.wikimedia.org/wiki/File:Balad_Air_Base_Pond_DVIDS22791.jpg>.
- S3: `site:facebook.com "בלד" 2015 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "בלד" 2015 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `degel-hatorah` — דגל התורה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"דגל התורה" "2015" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%93%D7%92%D7%9C_%D7%94%D7%AA%D7%95%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections/parties/yahadut-hatorah>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions_jubran_knesset20.pdf>.
- S2: `site:commons.wikimedia.org "Degel HaTorah" logo 2015` → no returned URLs.
- S3: `site:facebook.com "דגל התורה" 2015 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "דגל התורה" 2015 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `green-movement` — התנועה הירוקה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"התנועה הירוקה" "2015" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%9E%D7%A4%D7%9C%D7%92%D7%94_%D7%94%D7%99%D7%A8%D7%95%D7%A7%D7%94_(%D7%99%D7%A9%D7%A8%D7%90%D7%9C)>; <https://www.idi.org.il/articles/30964>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions_jubran_knesset20.pdf>.
- S2: `site:commons.wikimedia.org "Green Movement" logo 2015` → <https://commons.wikimedia.org/wiki/File:Katr%C3%ADn_Jakobsd%C3%B3ttir_(cropped).jpg>; <https://commons.wikimedia.org/wiki/Category:Political_party_elections>; <https://commons.wikimedia.org/wiki/User_talk:HuangQQ>.
- S3: `site:facebook.com "התנועה הירוקה" 2015 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "התנועה הירוקה" 2015 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `hadash` — חד"ש (המפלגה הקומוניסטית הישראלית).** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"חד"ש (המפלגה הקומוניסטית הישראלית)" "2015" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%97%D7%96%D7%99%D7%AA_%D7%94%D7%93%D7%9E%D7%95%D7%A7%D7%A8%D7%98%D7%99%D7%AA_%D7%9C%D7%A9%D7%9C%D7%95%D7%9D_%D7%95%D7%9C%D7%A9%D7%95%D7%95%D7%99%D7%95%D7%9F>; <https://maki.org.il/>; <https://www.idi.org.il/policy/parties-and-elections/parties/hadash>.
- S2: `site:commons.wikimedia.org "Hadash (Israeli Communist Party)" logo 2015` → no returned URLs.
- S3: `site:facebook.com "חדש" 2015 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "חדש" 2015 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `hatnua` — התנועה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"התנועה" "2015" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.inss.org.il/he/publication/%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-2015>; <https://www.idi.org.il/policy/parties-and-elections>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf>.
- S2: `site:commons.wikimedia.org "Hatnua" logo 2015` → <https://commons.wikimedia.org/wiki/File:Hatnuah_logo.svg>.
- S3: `site:facebook.com "התנועה" 2015 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "התנועה" 2015 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `jewish-home` — הבית היהודי.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"הבית היהודי" "2015" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%AA%D7%A9%D7%A2_%D7%A2%D7%A9%D7%A8%D7%94>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions_jubran_knesset20.pdf>.
- S2: `site:commons.wikimedia.org "The Jewish Home" logo 2015` → <https://commons.wikimedia.org/wiki/Category:The_Jewish_Home>; <https://commons.wikimedia.org/wiki/File:Israel_Knesset_2015.svg>; <https://commons.wikimedia.org/wiki/File:Lost_but_found_-_or,_The_Jewish_home_(1868)_(14781917142).jpg>.
- S3: `site:facebook.com "הבית היהודי" 2015 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "הבית היהודי" 2015 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `labor` — העבודה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"העבודה" "2015" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%9C%D7%92%D7%AA_%D7%94%D7%A2%D7%91%D7%95%D7%93%D7%94_%D7%94%D7%99%D7%A9%D7%A8%D7%90%D7%9C%D7%99%D7%AA>; <https://www.inss.org.il/he/publication/%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-2015>; <https://www.idi.org.il/articles/4349>.
- S2: `site:commons.wikimedia.org "Labor" logo 2015` → <https://commons.wikimedia.org/wiki/File:Seal_of_the_United_States_Department_of_Labor.svg>; <https://commons.wikimedia.org/wiki/File:Australian_Labor_Party_Logo_2015.svg>; <https://commons.wikimedia.org/wiki/United_States_Department_of_Labor>.
- S3: `site:facebook.com "העבודה" 2015 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "העבודה" 2015 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `raam` — רע"ם – רשימת האיחוד הערבי.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"רע"ם – רשימת האיחוד הערבי" "2015" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.gov.il/BlobFolder/guide/candidates-lists-26/he/pr5_26_annex.pdf>; <https://he.wikipedia.org/wiki/%D7%94%D7%A8%D7%A9%D7%99%D7%9E%D7%94_%D7%94%D7%A2%D7%A8%D7%91%D7%99%D7%AA_%D7%94%D7%9E%D7%90%D7%95%D7%97%D7%93%D7%AA>; <https://www.regthink.org/joint-list-comeback-call>.
- S2: `site:commons.wikimedia.org "Ra'am (United Arab List)" logo 2015` → no returned URLs.
- S3: `site:facebook.com "רעם" 2015 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "רעם" 2015 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `taal` — תע"ל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"תע"ל" "2015" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%AA%D7%A9%D7%A2_%D7%A2%D7%A9%D7%A8%D7%94>; <https://www.gov.il/BlobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisionsfullbook2022.pdf>.
- S2: `site:commons.wikimedia.org "Ta'al" logo 2015` → <https://commons.wikimedia.org/wiki/File:Joint_List_logo.png>; <https://commons.wikimedia.org/wiki/Category:Joint_List>; <https://commons.wikimedia.org/wiki/Category:Joint_List?uselang=eo>.
- S3: `site:facebook.com "תעל" 2015 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "תעל" 2015 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `tkuma` — האיחוד הלאומי – תקומה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"האיחוד הלאומי – תקומה" "2015" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%90%D7%99%D7%97%D7%95%D7%93_%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99%E2%80%93%D7%AA%D7%A7%D7%95%D7%9E%D7%94>; <https://library.mevaker.gov.il/sites/DigitalLibrary/Pages/Reports/1409-1.aspx>; <https://www.idi.org.il/articles/32955>.
- S2: `site:commons.wikimedia.org "Tkuma (National Union–Tkuma)" logo 2015` → no returned URLs.
- S3: `site:facebook.com "האיחוד הלאומי" 2015 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "האיחוד הלאומי" 2015 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

Batch verification: `npx vitest run` **57 files / 484 tests passed** (single worker and CLI testTimeout=30000 from k23 onward after existing rebuild tests exceeded 5000ms); `npx tsc -p tsconfig.json --noEmit`, `npx vite build`, and `python3 scripts/validate-party-logos.py` passed. Dataset build passed; all 26 election datasets equal prior batch after recursively removing `logo` and `builtAt`.

### k19 · 2013-01-22

Baseline whole lists: **3/12**; constituents: **0/9**. Every one of the 18 initial gaps below was attempted in all three routes; S3 quota failures do not count as completed source searches.

**L `אמת` — העבודה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"העבודה" "2013" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%AA%D7%A9%D7%A2_%D7%A2%D7%A9%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf>.
- S2: `site:commons.wikimedia.org "Labor" logo 2013` → <https://commons.wikimedia.org/wiki/File:U.S._Department_of_Labor_Centennial_Logo.png>; <https://commons.wikimedia.org/wiki/File:Australian_Labor_Party_Logo.svg>; <https://commons.wikimedia.org/wiki/File:Communist_Labor_Party_of_America_logo.svg>.
- S3: `site:facebook.com "העבודה" 2013 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "העבודה" 2013 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ג` — יהדות התורה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"יהדות התורה" "2013" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%99%D7%94%D7%93%D7%95%D7%AA_%D7%94%D7%AA%D7%95%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections/parties/yahadut-hatorah>; <https://www.inss.org.il/he/publication/%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-2015>.
- S2: `site:commons.wikimedia.org "United Torah Judaism" logo 2013` → <https://commons.wikimedia.org/wiki/Category:Israeli_legislative_election,_2013>; <https://commons.wikimedia.org/wiki/Category:Yaakov_Litzman>; <https://commons.wikimedia.org/wiki/Category:Meir_Porush>.
- S3: `site:facebook.com "יהדות התורה" 2013 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "יהדות התורה" 2013 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ד` — בל״ד.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"בל״ד" "2013" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections/parties/balad>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%AA%D7%A9%D7%A2_%D7%A2%D7%A9%D7%A8%D7%94>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf>.
- S2: `site:commons.wikimedia.org "Balad" logo 2013` → <https://commons.wikimedia.org/wiki/File:Balad-logo.jpg>; <https://commons.wikimedia.org/wiki/File:Al_Balad_Theater_Amman_JO.JPG>; <https://commons.wikimedia.org/wiki/File:090013_Al-Balad_UrduScript.jpg>.
- S3: `site:facebook.com "בלד" 2013 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "בלד" 2013 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ו` — חד״ש.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"חד״ש" "2013" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%AA%D7%A9%D7%A2_%D7%A2%D7%A9%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf>.
- S2: `site:commons.wikimedia.org "Hadash" logo 2013` → <https://commons.wikimedia.org/wiki/File:Hadash.svg>; <https://commons.wikimedia.org/wiki/Category:Political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/Category:Political_parties_in_Israel?uselang=bs>.
- S3: `site:facebook.com "חדש" 2013 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "חדש" 2013 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `טב` — הבית היהודי.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"הבית היהודי" "2013" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%AA%D7%A9%D7%A2_%D7%A2%D7%A9%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf>.
- S2: `site:commons.wikimedia.org "Jewish Home" logo 2013` → <https://commons.wikimedia.org/wiki/File:Bait-Yehudi-2013-poster-001.JPG>; <https://commons.wikimedia.org/wiki/Category:The_Jewish_Home_elections_posters>; <https://commons.wikimedia.org/wiki/File:Habajit_Hajehudi.png>.
- S3: `site:facebook.com "הבית היהודי" 2013 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "הבית היהודי" 2013 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `מחל` — הליכוד–ישראל ביתנו.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"הליכוד–ישראל ביתנו" "2013" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%AA%D7%A9%D7%A2_%D7%A2%D7%A9%D7%A8%D7%94>; <https://www.idi.org.il/books/4123>; <https://he.wikipedia.org/wiki/%D7%99%D7%A9%D7%A8%D7%90%D7%9C_%D7%91%D7%99%D7%AA%D7%A0%D7%95>.
- S2: `site:commons.wikimedia.org "Likud–Yisrael Beiteinu" logo 2013` → <https://commons.wikimedia.org/wiki/File:Logo_Likud_Yisrael_Beitenu.png>.
- S3: `site:facebook.com "הליכוד–ישראל ביתנו" 2013 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "הליכוד–ישראל ביתנו" 2013 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `עם` — רע״ם–תע״ל–מד״ע.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"רע״ם–תע״ל–מד״ע" "2013" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%A8%D7%A2%22%D7%9E-%D7%AA%D7%A2%22%D7%9C>; <https://www.inss.org.il/he/publication/%D7%90%D7%97%D7%95%D7%96-%D7%94%D7%97%D7%A1%D7%99%D7%9E%D7%94-%D7%95%D7%94%D7%A9%D7%9C%D7%9B%D7%95%D7%AA%D7%99%D7%95-%D7%A2%D7%9C-%D7%94%D7%99%D7%99%D7%A6%D7%95%D7%92-%D7%94%D7%A4%D7%95%D7%9C%D7%99>; <https://he.wikipedia.org/wiki/%D7%AA%D7%A0%D7%95%D7%A2%D7%94_%D7%A2%D7%A8%D7%91%D7%99%D7%AA_%D7%9C%D7%94%D7%AA%D7%97%D7%93%D7%A9%D7%95%D7%AA>.
- S2: `site:commons.wikimedia.org "Ra'am–Ta'al–Mada" logo 2013` → no returned URLs.
- S3: `site:facebook.com "רעם–תעל–מדע" 2013 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "רעם–תעל–מדע" 2013 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `פה` — יש עתיד.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"יש עתיד" "2013" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%99%D7%A9_%D7%A2%D7%AA%D7%99%D7%93>; <https://www.idi.org.il/policy/parties-and-elections/parties/yesh-atid>; <https://www.kan.org.il/content/kan-news/politic/282772>.
- S2: `site:commons.wikimedia.org "Yesh Atid" logo 2013` → <https://commons.wikimedia.org/wiki/File:YeshAtidLogo.svg>; <https://commons.wikimedia.org/wiki/File:2013_Knesset.svg>; <https://commons.wikimedia.org/wiki/Category:Political_parties_in_Israel>.
- S3: `site:facebook.com "יש עתיד" 2013 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "יש עתיד" 2013 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `שס` — ש״ס.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"ש״ס" "2013" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%AA%D7%A9%D7%A2_%D7%A2%D7%A9%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections>; <https://www.inss.org.il/he/publication/%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-2015>.
- S2: `site:commons.wikimedia.org "Shas" logo 2013` → <https://commons.wikimedia.org/wiki/File:Shas_logo.png>; <https://commons.wikimedia.org/wiki/File:En-us-Shas_from_Israel_pronunciation_(Voice_of_America).ogg>; <https://commons.wikimedia.org/wiki/File:Israel_Knesset_2013.svg>.
- S3: `site:facebook.com "שס" 2013 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "שס" 2013 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `agudat-yisrael` — אגודת ישראל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"אגודת ישראל" "2013" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%AA%D7%A9%D7%A2_%D7%A2%D7%A9%D7%A8%D7%94>; <https://www.walla.co.il/news/israel/2594279>.
- S2: `site:commons.wikimedia.org "Agudat Yisrael" logo 2013` → <https://commons.wikimedia.org/wiki/Category:Political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/Category:Political_parties_in_Israel?uselang=bs>; <https://commons.wikimedia.org/wiki/Category:Political_parties_in_Israel?uselang=vi>.
- S3: `site:facebook.com "אגודת ישראל" 2013 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "אגודת ישראל" 2013 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `degel-hatorah` — דגל התורה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"דגל התורה" "2013" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%93%D7%92%D7%9C_%D7%94%D7%AA%D7%95%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections/parties/yahadut-hatorah>; <https://www.walla.co.il/news/politics/3865773>.
- S2: `site:commons.wikimedia.org "Degel HaTorah" logo 2013` → <https://commons.wikimedia.org/wiki/Category:Political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/Category:Political_parties_in_Israel?uselang=bs>; <https://commons.wikimedia.org/wiki/Category:Political_parties_in_Israel?uselang=de>.
- S3: `site:facebook.com "דגל התורה" 2013 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "דגל התורה" 2013 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `jewish-home` — הבית היהודי.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"הבית היהודי" "2013" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%AA%D7%A9%D7%A2_%D7%A2%D7%A9%D7%A8%D7%94>; <https://www.idi.org.il/articles/3519>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf>.
- S2: `site:commons.wikimedia.org "The Jewish Home" logo 2013` → <https://commons.wikimedia.org/wiki/Category:The_Jewish_Home_elections_posters>; <https://commons.wikimedia.org/wiki/File:Bait-Yehudi-2013-poster-001.JPG>; <https://commons.wikimedia.org/wiki/File:Habajit_Hajehudi.png>.
- S3: `site:facebook.com "הבית היהודי" 2013 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "הבית היהודי" 2013 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `likud` — הליכוד.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"הליכוד" "2013" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%AA%D7%A9%D7%A2_%D7%A2%D7%A9%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections>; <https://www.likud.org.il/%D7%A2%D7%9C-%D7%94%D7%9C%D7%99%D7%9B%D7%95%D7%93/%D7%94%D7%94%D7%99%D7%A1%D7%98%D7%95%D7%A8%D7%99%D7%94-%D7%A9%D7%9C-%D7%94%D7%AA%D7%A0%D7%95%D7%A2%D7%94>.
- S2: `site:commons.wikimedia.org "Likud" logo 2013` → <https://commons.wikimedia.org/wiki/File:Likud_Logo.svg>; <https://commons.wikimedia.org/wiki/File:Logo_Likud_Yisrael_Beitenu.png>; <https://commons.wikimedia.org/wiki/File:Logo_Likud.png>.
- S3: `site:facebook.com "הליכוד" 2013 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "הליכוד" 2013 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `mada` — מד"ע – המפלגה הערבית הדמוקרטית.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"מד"ע – המפלגה הערבית הדמוקרטית" "2013" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%A8%D7%A9%D7%99%D7%9E%D7%94_%D7%94%D7%A2%D7%A8%D7%91%D7%99%D7%AA_%D7%94%D7%9E%D7%90%D7%95%D7%97%D7%93%D7%AA>; <https://www.idi.org.il/policy/parties-and-elections/parties/balad>; <https://www.inss.org.il/he/publication/%D7%90%D7%97%D7%95%D7%96-%D7%94%D7%97%D7%A1%D7%99%D7%9E%D7%94-%D7%95%D7%94%D7%A9%D7%9C%D7%9B%D7%95%D7%AA%D7%99%D7%95-%D7%A2%D7%9C-%D7%94%D7%99%D7%99%D7%A6%D7%95%D7%92-%D7%94%D7%A4%D7%95%D7%9C%D7%99>.
- S2: `site:commons.wikimedia.org "Arab Democratic Party (Mada)" logo 2013` → no returned URLs.
- S3: `site:facebook.com "מדע" 2013 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "מדע" 2013 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `raam` — רע"ם – רשימת האיחוד הערבי.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"רע"ם – רשימת האיחוד הערבי" "2013" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%A8%D7%A9%D7%99%D7%9E%D7%94_%D7%94%D7%A2%D7%A8%D7%91%D7%99%D7%AA_%D7%94%D7%9E%D7%90%D7%95%D7%97%D7%93%D7%AA>; <https://www.gov.il/BlobFolder/guide/candidates-lists-26/he/pr5_26_annex.pdf>; <https://www.idi.org.il/policy/parties-and-elections/parties/joint-arab-list>.
- S2: `site:commons.wikimedia.org "Ra'am (United Arab List)" logo 2013` → no returned URLs.
- S3: `site:facebook.com "רעם" 2013 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "רעם" 2013 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `taal` — תע"ל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"תע"ל" "2013" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%AA%D7%A9%D7%A2_%D7%A2%D7%A9%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections>; <https://www.gov.il/BlobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisionsfullbook2022.pdf>.
- S2: `site:commons.wikimedia.org "Ta'al" logo 2013` → <https://commons.wikimedia.org/wiki/File:2013_Knesset.svg>; <https://commons.wikimedia.org/wiki/File:Israel_Kn%C3%A9set_2013.svg>; <https://commons.wikimedia.org/wiki/Category:Political_parties_in_Israel>.
- S3: `site:facebook.com "תעל" 2013 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "תעל" 2013 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `tkuma` — האיחוד הלאומי – תקומה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"האיחוד הלאומי – תקומה" "2013" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%90%D7%99%D7%97%D7%95%D7%93_%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99%E2%80%93%D7%AA%D7%A7%D7%95%D7%9E%D7%94>; <https://www.idi.org.il/articles/32955>; <https://library.mevaker.gov.il/sites/DigitalLibrary/Pages/Reports/1409-1.aspx>.
- S2: `site:commons.wikimedia.org "Tkuma (National Union–Tkuma)" logo 2013` → no returned URLs.
- S3: `site:facebook.com "האיחוד הלאומי" 2013 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "האיחוד הלאומי" 2013 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `yisrael-beiteinu` — ישראל ביתנו.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"ישראל ביתנו" "2013" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%AA%D7%A9%D7%A2_%D7%A2%D7%A9%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections/parties/yisrael-beytenu>; <https://www.kan.org.il/content/kan-news/politic/282772>.
- S2: `site:commons.wikimedia.org "Yisrael Beiteinu" logo 2013` → <https://commons.wikimedia.org/wiki/File:Logo_Likud_Yisrael_Beitenu.png>; <https://commons.wikimedia.org/wiki/Category:Political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/Category:Political_parties_in_Israel?uselang=bs>.
- S3: `site:facebook.com "ישראל ביתנו" 2013 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "ישראל ביתנו" 2013 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

Batch verification: `npx vitest run` **57 files / 484 tests passed** (single worker and CLI testTimeout=30000 from k23 onward after existing rebuild tests exceeded 5000ms); `npx tsc -p tsconfig.json --noEmit`, `npx vite build`, and `python3 scripts/validate-party-logos.py` passed. Dataset build passed; all 26 election datasets equal prior batch after recursively removing `logo` and `builtAt`.

### k18 · 2009-02-10

Baseline whole lists: **2/12**; constituents: **0/12**. Every one of the 22 initial gaps below was attempted in all three routes; S3 quota failures do not count as completed source searches.

**L `אמת` — העבודה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"העבודה" "2009" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%9C%D7%92%D7%AA_%D7%94%D7%A2%D7%91%D7%95%D7%93%D7%94_%D7%94%D7%99%D7%A9%D7%A8%D7%90%D7%9C%D7%99%D7%AA>; <https://www.idi.org.il/policy/parties-and-elections/elections/2009>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf>.
- S2: `site:commons.wikimedia.org "Labor" logo 2009` → <https://commons.wikimedia.org/wiki/File:Bureau_of_Labor_Statistics_logo.svg>; <https://commons.wikimedia.org/wiki/File:National_Labor_Relations_Board_logo_-_BW.jpg>; <https://commons.wikimedia.org/wiki/File:Logo_Labor_fuer_Impulstechnik.JPG>.
- S3: `site:facebook.com "העבודה" 2009 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "העבודה" 2009 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ב` — הבית היהודי.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"הבית היהודי" "2009" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections/elections/2009>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%AA%D7%A9%D7%A2_%D7%A2%D7%A9%D7%A8%D7%94>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf>.
- S2: `site:commons.wikimedia.org "Jewish Home" logo 2009` → <https://commons.wikimedia.org/wiki/File:Jewish_Home_New_Mafdal.png>; <https://commons.wikimedia.org/wiki/Category:The_Jewish_Home_elections_posters>; <https://commons.wikimedia.org/wiki/File:Israeli_Knesset_Blocs_2009.svg>.
- S3: `site:facebook.com "הבית היהודי" 2009 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "הבית היהודי" 2009 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ג` — יהדות התורה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"יהדות התורה" "2009" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%99%D7%94%D7%93%D7%95%D7%AA_%D7%94%D7%AA%D7%95%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections/parties/yahadut-hatorah>; <https://www.inss.org.il/he/publication/israel-elections-2022>.
- S2: `site:commons.wikimedia.org "United Torah Judaism" logo 2009` → no returned URLs.
- S3: `site:facebook.com "יהדות התורה" 2009 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "יהדות התורה" 2009 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ד` — בל״ד.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"בל״ד" "2009" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections/parties/balad>; <https://he.wikipedia.org/wiki/%D7%91%D7%A8%D7%99%D7%AA_%D7%9C%D7%90%D7%95%D7%9E%D7%99%D7%AA_%D7%93%D7%9E%D7%95%D7%A7%D7%A8%D7%98%D7%99%D7%AA>; <https://www.gov.il/BlobFolder/guide/election-committee-history/ar/history_election-dates_knesset18-results.pdf>.
- S2: `site:commons.wikimedia.org "Balad" logo 2009` → <https://commons.wikimedia.org/wiki/File:Balad-logo.jpg>; <https://commons.wikimedia.org/wiki/Category:A-Tajammu_(Balad)>; <https://commons.wikimedia.org/wiki/File:Living_pods_Joint_Base_Balad_2009.JPG>.
- S3: `site:facebook.com "בלד" 2009 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "בלד" 2009 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ו` — חד״ש.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"חד״ש" "2009" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%94%D7%97%D7%96%D7%99%D7%AA_%D7%94%D7%93%D7%9E%D7%95%D7%A7%D7%A8%D7%98%D7%99%D7%AA_%D7%9C%D7%A9%D7%9C%D7%95%D7%9D_%D7%95%D7%9C%D7%A9%D7%95%D7%95%D7%99%D7%95%D7%9F>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf>.
- S2: `site:commons.wikimedia.org "Hadash" logo 2009` → <https://commons.wikimedia.org/wiki/File:Hadash.svg>; <https://commons.wikimedia.org/wiki/Category:Political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/Category:Political_parties_in_Israel?uselang=vi>.
- S3: `site:facebook.com "חדש" 2009 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "חדש" 2009 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ט` — האיחוד הלאומי.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"האיחוד הלאומי" "2009" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections/parties/haihud-haleumi>; <https://he.wikipedia.org/wiki/%D7%94%D7%90%D7%99%D7%97%D7%95%D7%93_%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99>; <https://www.hamichlol.org.il/%D7%94%D7%90%D7%99%D7%97%D7%95%D7%93_%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99>.
- S2: `site:commons.wikimedia.org "National Union" logo 2009` → <https://commons.wikimedia.org/wiki/Category:Logos_of_trade_unions>; <https://commons.wikimedia.org/wiki/File:Logo_Uni%C3%B3n_Nacional.png>; <https://commons.wikimedia.org/wiki/File:Ballot2009_NU.jpg>.
- S3: `site:facebook.com "האיחוד הלאומי" 2009 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "האיחוד הלאומי" 2009 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `כן` — קדימה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"קדימה" "2009" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections/elections/2009>; <https://he.wikipedia.org/wiki/%D7%A7%D7%93%D7%99%D7%9E%D7%94_(%D7%9E%D7%A4%D7%9C%D7%92%D7%94)>; <https://elections.kaplanopensource.co.il/locality/53>.
- S2: `site:commons.wikimedia.org "Kadima" logo 2009` → <https://commons.wikimedia.org/wiki/File:Logo_Kadima.svg>; <https://commons.wikimedia.org/wiki/Category:Kadima>; <https://commons.wikimedia.org/wiki/File:PikiWiki_Israel_2218_Election_2009_night_-_Kadima_Party_%D7%A2%D7%A8%D7%91_%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_2009_-_%D7%9E%D7%98%D7%94_%D7%A7%D7%93%D7%99%D7%9E%D7%94.jpg>.
- S3: `site:facebook.com "קדימה" 2009 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "קדימה" 2009 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ל` — ישראל ביתנו.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"ישראל ביתנו" "2009" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%99%D7%A9%D7%A8%D7%90%D7%9C_%D7%91%D7%99%D7%AA%D7%A0%D7%95>; <https://www.idi.org.il/policy/parties-and-elections/parties/yisrael-beytenu>; <https://www.gov.il/BlobFolder/guide/election-committee-history/ar/history_election-dates_knesset18-results.pdf>.
- S2: `site:commons.wikimedia.org "Yisrael Beiteinu" logo 2009` → <https://commons.wikimedia.org/wiki/File:Israel-beytenu-logo.svg>; <https://commons.wikimedia.org/wiki/File:Ballot2009_YB.jpg>; <https://commons.wikimedia.org/wiki/Category:Yisrael_Beiteinu>.
- S3: `site:facebook.com "ישראל ביתנו" 2009 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "ישראל ביתנו" 2009 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `עם` — רע״ם–תע״ל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"רע״ם–תע״ל" "2009" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%A8%D7%A9%D7%99%D7%9E%D7%94_%D7%94%D7%A2%D7%A8%D7%91%D7%99%D7%AA_%D7%94%D7%9E%D7%90%D7%95%D7%97%D7%93%D7%AA>; <https://www.idi.org.il/parliaments/3077/3431>; <https://www.inss.org.il/he/publication/%D7%90%D7%97%D7%95%D7%96-%D7%94%D7%97%D7%A1%D7%99%D7%9E%D7%94-%D7%95%D7%94%D7%A9%D7%9C%D7%9B%D7%95%D7%AA%D7%99%D7%95-%D7%A2%D7%9C-%D7%94%D7%99%D7%99%D7%A6%D7%95%D7%92-%D7%94%D7%A4%D7%95%D7%9C%D7%99>.
- S2: `site:commons.wikimedia.org "Ra'am–Ta'al" logo 2009` → <https://commons.wikimedia.org/wiki/File:Israeli_Knesset_Blocs_2009.svg>; <https://commons.wikimedia.org/wiki/File:2009_Knesset.svg>.
- S3: `site:facebook.com "רעם–תעל" 2009 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "רעם–תעל" 2009 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `שס` — ש״ס.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"ש״ס" "2009" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections/elections/2009>; <https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%9C%D7%92%D7%AA_%D7%A9%22%D7%A1>; <https://elections.kaplanopensource.co.il/locality/8500>.
- S2: `site:commons.wikimedia.org "Shas" logo 2009` → <https://commons.wikimedia.org/wiki/File:Shas_logo.png>; <https://commons.wikimedia.org/wiki/File:Ballot2009_shas.jpg>; <https://commons.wikimedia.org/wiki/Category:Shas>.
- S3: `site:facebook.com "שס" 2009 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "שס" 2009 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `agudat-yisrael` — אגודת ישראל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"אגודת ישראל" "2009" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections>; <https://www.gov.il/BlobFolder/guide/election-committee-history/ar/history_election-dates_knesset18-results.pdf>; <https://he.wikipedia.org/wiki/%D7%90%D7%92%D7%95%D7%93%D7%AA_%D7%99%D7%A9%D7%A8%D7%90%D7%9C>.
- S2: `site:commons.wikimedia.org "Agudat Yisrael" logo 2009` → <https://commons.wikimedia.org/wiki/Category:Political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/Category:Political_parties_in_Lithuania>; <https://commons.wikimedia.org/wiki/Category:Political_parties_in_Israel?uselang=bs>.
- S3: `site:facebook.com "אגודת ישראל" 2009 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "אגודת ישראל" 2009 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `ahi` — אח"י – ארץ חברה יהדות.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"אח"י – ארץ חברה יהדות" "2009" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%9C%D7%92%D7%AA_%D7%90%D7%97%22%D7%99>; <https://www.hamichlol.org.il/%D7%94%D7%90%D7%99%D7%97%D7%95%D7%93_%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%99%D7%AA_%D7%94%D7%99%D7%94%D7%95%D7%93%D7%99>.
- S2: `site:commons.wikimedia.org "Ahi" logo 2009` → <https://commons.wikimedia.org/wiki/File:Ahi.jpg>; <https://commons.wikimedia.org/wiki/Category:S2-AHI_(aircraft)>; <https://commons.wikimedia.org/wiki/Category:9N-AHI_(aircraft)>.
- S3: `site:facebook.com "אחי" 2009 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "אחי" 2009 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `degel-hatorah` — דגל התורה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"דגל התורה" "2009" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%93%D7%92%D7%9C_%D7%94%D7%AA%D7%95%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections/parties/yahadut-hatorah>; <https://www.kan.org.il/content/kan-news/politic/1040501>.
- S2: `site:commons.wikimedia.org "Degel HaTorah" logo 2009` → <https://commons.wikimedia.org/wiki/Category:Political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/Category:Political_parties_in_Israel?uselang=bs>; <https://commons.wikimedia.org/wiki/Category:Political_parties_in_Israel?uselang=vi>.
- S3: `site:facebook.com "דגל התורה" 2009 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "דגל התורה" 2009 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `eretz-yisrael-shelanu` — ארץ ישראל שלנו.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"ארץ ישראל שלנו" "2009" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.gov.il/BlobFolder/guide/election-committee-history/ar/history_election-dates_knesset18-results.pdf>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%AA%D7%A9%D7%A2_%D7%A2%D7%A9%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections/elections/2019-2>.
- S2: `site:commons.wikimedia.org "Eretz Yisrael Shelanu" logo 2009` → no returned URLs.
- S3: `site:facebook.com "ארץ ישראל שלנו" 2009 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "ארץ ישראל שלנו" 2009 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `hatikva` — התקווה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"התקווה" "2009" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.gov.il/BlobFolder/guide/election-committee-history/ar/history_election-dates_knesset18-results.pdf>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%AA%D7%A9%D7%A2_%D7%A2%D7%A9%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections/elections/2021-1>.
- S2: `site:commons.wikimedia.org "Hatikva" logo 2009` → <https://commons.wikimedia.org/wiki/File:Hatikva.svg>; <https://commons.wikimedia.org/wiki/File:PikiWiki_Israel_721_legumes_in_Hatikva_Market_%D7%A7%D7%98%D7%A0%D7%99%D7%95%D7%AA_%D7%91%D7%A9%D7%95%D7%A7_%D7%94%D7%AA%D7%A7%D7%95%D7%95%D7%94.JPG>; <https://commons.wikimedia.org/wiki/Category:Bernie_Fink>.
- S3: `site:facebook.com "התקווה" 2009 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "התקווה" 2009 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `likud` — הליכוד.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"הליכוד" "2009" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections/parties/likud>; <https://he.wikipedia.org/wiki/%D7%94%D7%9C%D7%99%D7%9B%D7%95%D7%93>; <https://www.likud.org.il/%D7%A2%D7%9C-%D7%94%D7%9C%D7%99%D7%9B%D7%95%D7%93/%D7%94%D7%94%D7%99%D7%A1%D7%98%D7%95%D7%A8%D7%99%D7%94-%D7%A9%D7%9C-%D7%94%D7%AA%D7%A0%D7%95%D7%A2%D7%94>.
- S2: `site:commons.wikimedia.org "Likud" logo 2009` → <https://commons.wikimedia.org/wiki/File:Likud_Logo.svg>; <https://commons.wikimedia.org/wiki/File:Logo_Likud.png>; <https://commons.wikimedia.org/wiki/File:Israeli_Knesset_Blocs_2009.svg>.
- S3: `site:facebook.com "הליכוד" 2009 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "הליכוד" 2009 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `meretz` — מרצ.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"מרצ" "2009" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%9E%D7%A8%D7%A6>; <https://www.idi.org.il/policy/parties-and-elections>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf>.
- S2: `site:commons.wikimedia.org "Meretz" logo 2009` → <https://commons.wikimedia.org/wiki/File:Meretz_Logo.svg>; <https://commons.wikimedia.org/wiki/File:Newmovemeretz.gif>; <https://commons.wikimedia.org/wiki/Category:Meretz>.
- S3: `site:facebook.com "מרצ" 2009 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "מרצ" 2009 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `moledet` — מולדת.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"מולדת" "2009" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections>; <https://www.gov.il/BlobFolder/guide/election-committee-history/ar/history_election-dates_knesset18-results.pdf>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%AA%D7%A9%D7%A2_%D7%A2%D7%A9%D7%A8%D7%94>.
- S2: `site:commons.wikimedia.org "Moledet" logo 2009` → <https://commons.wikimedia.org/wiki/Category:Moledet_party>; <https://commons.wikimedia.org/wiki/File:Moledet_Kids_1950.jpg>; <https://commons.wikimedia.org/wiki/File:Yanai_Grove_sign.jpg>.
- S3: `site:facebook.com "מולדת" 2009 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "מולדת" 2009 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `new-movement` — התנועה החדשה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"התנועה החדשה" "2009" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.gov.il/BlobFolder/guide/election-committee-history/ar/history_election-dates_knesset18-results.pdf>; <https://www.idi.org.il/articles/9369>; <https://he.wikipedia.org/wiki/%D7%9E%D7%A8%D7%A6>.
- S2: `site:commons.wikimedia.org "HaTnua HaHadasha (New Movement)" logo 2009` → no returned URLs.
- S3: `site:facebook.com "התנועה החדשה" 2009 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "התנועה החדשה" 2009 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `raam` — רע"ם – רשימת האיחוד הערבי.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"רע"ם – רשימת האיחוד הערבי" "2009" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%A8%D7%A9%D7%99%D7%9E%D7%94_%D7%94%D7%A2%D7%A8%D7%91%D7%99%D7%AA_%D7%94%D7%9E%D7%90%D7%95%D7%97%D7%93%D7%AA>; <https://www.gov.il/BlobFolder/guide/candidates-lists-26/he/pr5_26_annex.pdf>; <https://www.inss.org.il/he/publication/%D7%90%D7%97%D7%95%D7%96-%D7%94%D7%97%D7%A1%D7%99%D7%9E%D7%94-%D7%95%D7%94%D7%A9%D7%9C%D7%9B%D7%95%D7%AA%D7%99%D7%95-%D7%A2%D7%9C-%D7%94%D7%99%D7%99%D7%A6%D7%95%D7%92-%D7%94%D7%A4%D7%95%D7%9C%D7%99>.
- S2: `site:commons.wikimedia.org "Ra'am (United Arab List)" logo 2009` → no returned URLs.
- S3: `site:facebook.com "רעם" 2009 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "רעם" 2009 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `taal` — תע"ל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"תע"ל" "2009" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%AA%D7%A9%D7%A2_%D7%A2%D7%A9%D7%A8%D7%94>; <https://www.gov.il/apps/elections/heb/law/Decisions2009.pdf>.
- S2: `site:commons.wikimedia.org "Ta'al" logo 2009` → <https://commons.wikimedia.org/wiki/File:Israeli_Knesset_Blocs_2009.svg>; <https://commons.wikimedia.org/wiki/File:IDF_Ranks_Ta%27al.svg>; <https://commons.wikimedia.org/wiki/File:Israel_Knesset_2009.svg>.
- S3: `site:facebook.com "תעל" 2009 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "תעל" 2009 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `tkuma` — האיחוד הלאומי – תקומה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"האיחוד הלאומי – תקומה" "2009" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%90%D7%99%D7%97%D7%95%D7%93_%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99%E2%80%93%D7%AA%D7%A7%D7%95%D7%9E%D7%94>; <https://www.gov.il/BlobFolder/guide/election-committee-history/ar/history_election-dates_knesset18-results.pdf>; <https://www.makorrishon.co.il/nrg/online/1/ART1/823/330.html>.
- S2: `site:commons.wikimedia.org "Tkuma (National Union–Tkuma)" logo 2009` → no returned URLs.
- S3: `site:facebook.com "האיחוד הלאומי" 2009 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "האיחוד הלאומי" 2009 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

Batch verification: `npx vitest run` **57 files / 484 tests passed** (single worker and CLI testTimeout=30000 from k23 onward after existing rebuild tests exceeded 5000ms); `npx tsc -p tsconfig.json --noEmit`, `npx vite build`, and `python3 scripts/validate-party-logos.py` passed. Dataset build passed; all 26 election datasets equal prior batch after recursively removing `logo` and `builtAt`.

### k17 · 2006-03-28

Baseline whole lists: **1/12**; constituents: **0/11**. Every one of the 22 initial gaps below was attempted in all three routes; S3 quota failures do not count as completed source searches.

**L `אמת` — העבודה–מימד.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"העבודה–מימד" "2006" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%9C%D7%92%D7%AA_%D7%94%D7%A2%D7%91%D7%95%D7%93%D7%94_%D7%94%D7%99%D7%A9%D7%A8%D7%90%D7%9C%D7%99%D7%AA>; <https://www.idi.org.il/articles/32955>; <https://www.gov.il/BlobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisionsfullbook2022.pdf>.
- S2: `site:commons.wikimedia.org "Labor–Meimad" logo 2006` → <https://commons.wikimedia.org/wiki/Category:Logos_of_political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/File:2006_Knesset_Composition.svg>; <https://commons.wikimedia.org/wiki/Category:Israeli_legislative_election,_2003>.
- S3: `site:facebook.com "העבודה–מימד" 2006 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "העבודה–מימד" 2006 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ג` — יהדות התורה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"יהדות התורה" "2006" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%99%D7%94%D7%93%D7%95%D7%AA_%D7%94%D7%AA%D7%95%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections/parties/yahadut-hatorah>; <https://he.wikipedia.org/wiki/%D7%93%D7%92%D7%9C_%D7%94%D7%AA%D7%95%D7%A8%D7%94>.
- S2: `site:commons.wikimedia.org "United Torah Judaism" logo 2006` → <https://commons.wikimedia.org/wiki/Category:Israeli_legislative_election,_2006>; <https://commons.wikimedia.org/wiki/Category:Yaakov_Litzman>; <https://commons.wikimedia.org/wiki/Category:Meir_Porush>.
- S3: `site:facebook.com "יהדות התורה" 2006 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "יהדות התורה" 2006 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ד` — בל״ד.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"בל״ד" "2006" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections/parties/balad>; <https://he.wikipedia.org/wiki/%D7%91%D7%A8%D7%99%D7%AA_%D7%9C%D7%90%D7%95%D7%9E%D7%99%D7%AA_%D7%93%D7%9E%D7%95%D7%A7%D7%A8%D7%98%D7%99%D7%AA>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf>.
- S2: `site:commons.wikimedia.org "Balad" logo 2006` → <https://commons.wikimedia.org/wiki/File:Balad-logo.jpg>; <https://commons.wikimedia.org/wiki/File:Balad.svg>; <https://commons.wikimedia.org/wiki/Category:2006_at_Joint_Base_Balad>.
- S3: `site:facebook.com "בלד" 2006 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "בלד" 2006 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ו` — חד״ש.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"חד״ש" "2006" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%94%D7%97%D7%96%D7%99%D7%AA_%D7%94%D7%93%D7%9E%D7%95%D7%A7%D7%A8%D7%98%D7%99%D7%AA_%D7%9C%D7%A9%D7%9C%D7%95%D7%9D_%D7%95%D7%9C%D7%A9%D7%95%D7%95%D7%99%D7%95%D7%9F>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf>.
- S2: `site:commons.wikimedia.org "Hadash" logo 2006` → <https://commons.wikimedia.org/wiki/File:Hadash.JPG>; <https://commons.wikimedia.org/wiki/Category:Logos_of_political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/User_talk:Siebrand/Archive03>.
- S3: `site:facebook.com "חדש" 2006 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "חדש" 2006 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `זך` — גיל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"גיל" "2006" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%92%D7%99%D7%9C_-_%D7%92%D7%9E%D7%9C%D7%90%D7%99_%D7%99%D7%A9%D7%A8%D7%90%D7%9C_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA>; <https://www.idi.org.il/policy/parties-and-elections/parties/gil>; <https://www.hamichlol.org.il/%D7%92%D7%99%D7%9C_-_%D7%92%D7%9E%D7%9C%D7%90%D7%99_%D7%99%D7%A9%D7%A8%D7%90%D7%9C_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA>.
- S2: `site:commons.wikimedia.org "Gil (Pensioners)" logo 2006` → no returned URLs.
- S3: `site:facebook.com "גיל" 2006 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "גיל" 2006 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `כן` — קדימה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"קדימה" "2006" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%A7%D7%93%D7%99%D7%9E%D7%94_(%D7%9E%D7%A4%D7%9C%D7%92%D7%94)>; <https://www.idi.org.il/parliaments/3467/8203>; <https://www.facebook.com/AmitSegalNews/videos/%D7%95%D7%94%D7%99%D7%95%D7%9D-%D7%91%D7%A4%D7%99%D7%A0%D7%94-%D7%A9%D7%97%D7%95%D7%96%D7%A8%D7%AA-%D7%90%D7%9C-%D7%94%D7%94%D7%99%D7%A1%D7%98%D7%95%D7%A8%D7%99%D7%94-%D7%A9%D7%9C-%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-%D7%9E%D7%94-%D7%9E%D7%A9%D7%95%D7%AA%D7%A3-%D7%9C%D7%94%D7%A4%D7%A1%D7%93%D7%99%D7%9D-%D7%A9%D7%9C-%D7%A0%D7%AA%D7%A0%D7%99%D7%94%D7%95-%D7%95%D7%90%D7%99%D7%9A-%D7%94%D7%A6%D7%9C%D7%99%D7%97/4162291357403722>.
- S2: `site:commons.wikimedia.org "Kadima" logo 2006` → <https://commons.wikimedia.org/wiki/File:Logo_Kadima.svg>; <https://commons.wikimedia.org/wiki/File:Ehud_Olmert_2006.jpg>; <https://commons.wikimedia.org/wiki/File:Israel_Kn%C3%A9set_2006.svg>.
- S3: `site:facebook.com "קדימה" 2006 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "קדימה" 2006 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ל` — ישראל ביתנו.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"ישראל ביתנו" "2006" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%99%D7%A9%D7%A8%D7%90%D7%9C_%D7%91%D7%99%D7%AA%D7%A0%D7%95>; <https://www.idi.org.il/policy/parties-and-elections/parties/yisrael-beytenu>; <https://www.haaretz.co.il/news/politics/2008-11-28/ty-article/0000017f-e71f-d97e-a37f-f77f7e100000>.
- S2: `site:commons.wikimedia.org "Yisrael Beiteinu" logo 2006` → <https://commons.wikimedia.org/wiki/File:Israel-beytenu-logo.png>.
- S3: `site:facebook.com "ישראל ביתנו" 2006 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "ישראל ביתנו" 2006 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `מחל` — הליכוד.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"הליכוד" "2006" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections/parties/likud>; <https://he.wikipedia.org/wiki/%D7%94%D7%9C%D7%99%D7%9B%D7%95%D7%93>; <https://www.kan.org.il/content/archive1/vod/p-671172/real-results-5>.
- S2: `site:commons.wikimedia.org "Likud" logo 2006` → <https://commons.wikimedia.org/wiki/File:Likud_Logo.svg>; <https://commons.wikimedia.org/wiki/File:Logo_Likud.png>; <https://commons.wikimedia.org/wiki/Category:Logos_of_political_parties_in_Israel>.
- S3: `site:facebook.com "הליכוד" 2006 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "הליכוד" 2006 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `מרצ` — מרצ.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"מרצ" "2006" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%9E%D7%A8%D7%A6>; <https://www.idi.org.il/policy/parties-and-elections/parties/meretz>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf>.
- S2: `site:commons.wikimedia.org "Meretz" logo 2006` → <https://commons.wikimedia.org/wiki/File:Meretz_Logo.svg>; <https://commons.wikimedia.org/wiki/Category:Logos_of_political_parties_in_Israel>.
- S3: `site:facebook.com "מרצ" 2006 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "מרצ" 2006 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `עם` — רע״ם–תע״ל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"רע״ם–תע״ל" "2006" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%A8%D7%A9%D7%99%D7%9E%D7%94_%D7%94%D7%A2%D7%A8%D7%91%D7%99%D7%AA_%D7%94%D7%9E%D7%90%D7%95%D7%97%D7%93%D7%AA>; <https://www.idi.org.il/articles/66556>; <https://he.wikipedia.org/wiki/%D7%A8%D7%A2%22%D7%9E-%D7%AA%D7%A2%22%D7%9C>.
- S2: `site:commons.wikimedia.org "Ra’am–Ta’al" logo 2006` → <https://commons.wikimedia.org/wiki/File:2006_Knesset.svg>; <https://commons.wikimedia.org/wiki/File:2006_Knesset_Composition.svg>.
- S3: `site:facebook.com "רעם–תעל" 2006 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "רעם–תעל" 2006 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `שס` — ש״ס.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"ש״ס" "2006" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections/elections/2006>; <https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%9C%D7%92%D7%AA_%D7%A9%22%D7%A1>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf>.
- S2: `site:commons.wikimedia.org "Shas" logo 2006` → <https://commons.wikimedia.org/wiki/File:Shas_logo.png>; <https://commons.wikimedia.org/wiki/File:Chasan_Shas.JPG>; <https://commons.wikimedia.org/wiki/Category:Logos_of_political_parties_in_Israel>.
- S3: `site:facebook.com "שס" 2006 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "שס" 2006 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `agudat-yisrael` — אגודת ישראל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"אגודת ישראל" "2006" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%90%D7%92%D7%95%D7%93%D7%AA_%D7%99%D7%A9%D7%A8%D7%90%D7%9C>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf>.
- S2: `site:commons.wikimedia.org "Agudat Yisrael" logo 2006` → no returned URLs.
- S3: `site:facebook.com "אגודת ישראל" 2006 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "אגודת ישראל" 2006 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `ahi` — אח"י – ציונות דתית לאומית מתחדשת.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"אח"י – ציונות דתית לאומית מתחדשת" "2006" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%9C%D7%92%D7%AA_%D7%90%D7%97%22%D7%99>; <https://www.idi.org.il/articles/32955>; <https://www.hamichlol.org.il/%D7%94%D7%90%D7%99%D7%97%D7%95%D7%93_%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99>.
- S2: `site:commons.wikimedia.org "Ahi (Renewed Religious National Zionism)" logo 2006` → no returned URLs.
- S3: `site:facebook.com "אחי" 2006 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "אחי" 2006 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `arab-democratic-party` — המפלגה הדמוקרטית הערבית (מד"ע).** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"המפלגה הדמוקרטית הערבית (מד"ע)" "2006" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.walla.co.il/news/israel/2588685>; <https://www.kas.de/documents/263458/263507/KAP+Publication.pdf>; <https://www.makorrishon.co.il/nrg/online/1/ART1/043/288.html>.
- S2: `site:commons.wikimedia.org "Arab Democratic Party" logo 2006` → no returned URLs.
- S3: `site:facebook.com "המפלגה הדמוקרטית הערבית" 2006 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "המפלגה הדמוקרטית הערבית" 2006 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `degel-hatorah` — דגל התורה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"דגל התורה" "2006" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%93%D7%92%D7%9C_%D7%94%D7%AA%D7%95%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections/parties/yahadut-hatorah>; <https://www.law.co.il/media/computer-law/ben_meir9.pdf>.
- S2: `site:commons.wikimedia.org "Degel HaTorah" logo 2006` → <https://commons.wikimedia.org/wiki/Category:Moshe_Gafni?uselang=eo>.
- S3: `site:facebook.com "דגל התורה" 2006 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "דגל התורה" 2006 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `labor` — מפלגת העבודה הישראלית.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"מפלגת העבודה הישראלית" "2006" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%9C%D7%92%D7%AA_%D7%94%D7%A2%D7%91%D7%95%D7%93%D7%94_%D7%94%D7%99%D7%A9%D7%A8%D7%90%D7%9C%D7%99%D7%AA>; <https://www.idi.org.il/policy/parties-and-elections/parties/haavoda>; <https://www.gov.il/BlobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisionsfullbook2022.pdf>.
- S2: `site:commons.wikimedia.org "Israeli Labor Party" logo 2006` → <https://commons.wikimedia.org/wiki/Category:Logos_of_political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/File:HaAvoda_Logo.svg>.
- S3: `site:facebook.com "מפלגת העבודה הישראלית" 2006 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "מפלגת העבודה הישראלית" 2006 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `meimad` — מימד.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"מימד" "2006" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%94%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A9%D7%91%D7%A2_%D7%A2%D7%A9%D7%A8%D7%94>; <https://papers.ssrn.com/sol3/Delivery.cfm/SSRN_ID2649088_code2377032.pdf?abstractid=2649088&mirid=1>.
- S2: `site:commons.wikimedia.org "Meimad" logo 2006` → <https://commons.wikimedia.org/wiki/Category:Logos_of_political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/Category:Israeli_legislative_election,_2003>; <https://commons.wikimedia.org/wiki/Category:Shimon_Peres>.
- S3: `site:facebook.com "מימד" 2006 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "מימד" 2006 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `moledet` — מולדת.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"מולדת" "2006" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A9%D7%A9_%D7%A2%D7%A9%D7%A8%D7%94>; <https://www.inss.org.il/he/publication/egypt-jordan-israel-elections>.
- S2: `site:commons.wikimedia.org "Moledet" logo 2006` → <https://commons.wikimedia.org/wiki/Category:Logos_of_political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/Category:INS_Hanit_(Saar_5)>; <https://commons.wikimedia.org/wiki/Category:INS_Sufa_(Saar_4.5)>.
- S3: `site:facebook.com "מולדת" 2006 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "מולדת" 2006 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `nrp` — המפד"ל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"המפד"ל" "2006" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%93%22%D7%9C>; <https://www.idi.org.il/policy/parties-and-elections/parties/mafdal>; <https://library.mevaker.gov.il/sites/DigitalLibrary/Pages/Reports/1407-1.aspx>.
- S2: `site:commons.wikimedia.org "National Religious Party" logo 2006` → no returned URLs.
- S3: `site:facebook.com "המפדל" 2006 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "המפדל" 2006 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `ram` — רע"ם – הרשימה הערבית המאוחדת (התנועה האסלאמית, הפלג הדרומי).** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"רע"ם – הרשימה הערבית המאוחדת (התנועה האסלאמית, הפלג הדרומי)" "2006" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%A8%D7%A9%D7%99%D7%9E%D7%94_%D7%94%D7%A2%D7%A8%D7%91%D7%99%D7%AA_%D7%94%D7%9E%D7%90%D7%95%D7%97%D7%93%D7%AA>; <https://www.gov.il/BlobFolder/guide/candidates-lists-26/he/pr5_26_annex.pdf>; <https://www.inss.org.il/he/publication/%D7%94%D7%A4%D7%95%D7%9C%D7%99%D7%98%D7%99%D7%A7%D7%94-%D7%94%D7%A2%D7%A8%D7%91%D7%99%D7%AA-%D7%9C%D7%90%D7%97%D7%A8-%D7%94%D7%AA%D7%A4%D7%A6%D7%9C%D7%95%D7%AA-%D7%A8%D7%A2%D7%9E-%D7%9E%D7%94%D7%A8>.
- S2: `site:commons.wikimedia.org "Ra'am – United Arab List (Islamic Movement, southern branch)" logo 2006` → no returned URLs.
- S3: `site:facebook.com "רעם" 2006 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "רעם" 2006 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `taal` — תע"ל – התנועה הערבית להתחדשות.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"תע"ל – התנועה הערבית להתחדשות" "2006" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://oknesset.org/members/208.html>; <https://www.walla.co.il/news/israel/2588685>; <https://www.walla.co.il/news/israel/1386282>.
- S2: `site:commons.wikimedia.org "Ta'al" logo 2006` → <https://commons.wikimedia.org/wiki/Category:Logos_of_political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/File:2006_Knesset.svg>; <https://commons.wikimedia.org/wiki/File:Israel_Kn%C3%A9set_2006.svg>.
- S3: `site:facebook.com "תעל" 2006 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "תעל" 2006 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `tkuma` — תקומה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"תקומה" "2006" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%90%D7%99%D7%97%D7%95%D7%93_%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99%E2%80%93%D7%AA%D7%A7%D7%95%D7%9E%D7%94>; <https://www.idi.org.il/policy/parties-and-elections/elections/2013>; <https://library.mevaker.gov.il/sites/DigitalLibrary/Pages/Reports/1409-1.aspx>.
- S2: `site:commons.wikimedia.org "Tkuma" logo 2006` → no returned URLs.
- S3: `site:facebook.com "תקומה" 2006 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "תקומה" 2006 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

Batch verification: `npx vitest run` **57 files / 484 tests passed** (single worker and CLI testTimeout=30000 from k23 onward after existing rebuild tests exceeded 5000ms); `npx tsc -p tsconfig.json --noEmit`, `npx vite build`, and `python3 scripts/validate-party-logos.py` passed. Dataset build passed; all 26 election datasets equal prior batch after recursively removing `logo` and `builtAt`.

### k16 · 2003-01-28

Baseline whole lists: **2/13**; constituents: **0/14**. Every one of the 25 initial gaps below was attempted in all three routes; S3 quota failures do not count as completed source searches.

**L `ב` — מפד״ל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"מפד״ל" "2003" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%93%22%D7%9C>; <https://www.gov.il/BlobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisionsfullbook2022.pdf>.
- S2: `site:commons.wikimedia.org "National Religious Party" logo 2003` → <https://commons.wikimedia.org/wiki/File:National_Religious_Party_logo.svg>.
- S3: `site:facebook.com "מפדל" 2003 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "מפדל" 2003 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ג` — יהדות התורה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"יהדות התורה" "2003" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%99%D7%94%D7%93%D7%95%D7%AA_%D7%94%D7%AA%D7%95%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections/parties/yahadut-hatorah>; <https://www.inss.org.il/he/publication/israel-elections-2022>.
- S2: `site:commons.wikimedia.org "United Torah Judaism" logo 2003` → no returned URLs.
- S3: `site:facebook.com "יהדות התורה" 2003 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "יהדות התורה" 2003 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ד` — בל״ד.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"בל״ד" "2003" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections/parties/balad>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A9%D7%A9_%D7%A2%D7%A9%D7%A8%D7%94>; <https://supremedecisions.court.gov.il/Home/Download?path=HebrewVerdicts/22/680/066/v06&fileName=22066680.V06&type=4>.
- S2: `site:commons.wikimedia.org "Balad" logo 2003` → <https://commons.wikimedia.org/wiki/File:Balad-logo.jpg>; <https://commons.wikimedia.org/wiki/File:2003_Knesset.svg>; <https://commons.wikimedia.org/wiki/File:Israel_Kn%C3%A9set_2003.svg>.
- S3: `site:facebook.com "בלד" 2003 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "בלד" 2003 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ו` — חד״ש–תע״ל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"חד״ש–תע״ל" "2003" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%97%D7%93%22%D7%A9-%D7%AA%D7%A2%22%D7%9C>; <https://www.idi.org.il/policy/parties-and-elections/parties/hadash>; <https://www.hamichlol.org.il/%D7%97%D7%93%22%D7%A9-%D7%AA%D7%A2%22%D7%9C>.
- S2: `site:commons.wikimedia.org "Hadash–Ta’al" logo 2003` → <https://commons.wikimedia.org/wiki/File:2003_Knesset.svg>; <https://commons.wikimedia.org/wiki/File:Israel_Kn%C3%A9set_2003.svg>; <https://commons.wikimedia.org/wiki/Category:Ahmad_Tibi>.
- S3: `site:facebook.com "חדש–תעל" 2003 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "חדש–תעל" 2003 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `יש` — שינוי.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"שינוי" "2003" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%9C%D7%92%D7%AA_%D7%A9%D7%99%D7%A0%D7%95%D7%99>; <https://www.idi.org.il/policy/parties-and-elections/parties/shinui>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A9%D7%A9_%D7%A2%D7%A9%D7%A8%D7%94>.
- S2: `site:commons.wikimedia.org "Shinui" logo 2003` → <https://commons.wikimedia.org/wiki/File:Logo_Shinui_Israel.png>; <https://commons.wikimedia.org/wiki/File:Israel_Knesset_2003.svg>; <https://commons.wikimedia.org/wiki/File:2003_Knesset.svg>.
- S3: `site:facebook.com "שינוי" 2003 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "שינוי" 2003 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `כן` — ישראל בעלייה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"ישראל בעלייה" "2003" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections>; <https://www.idi.org.il/policy/parties-and-elections/elections/2003>; <https://maor.haifa.ac.il/%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA-%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA-%D7%94%D7%A1%D7%9B%D7%9E%D7%99-%D7%A2%D7%95%D7%93%D7%A4%D7%99%D7%9D-%D7%A8%D7%9E%D7%94-%D7%A8%D7%92%D7%99%D7%9C%D7%94>.
- S2: `site:commons.wikimedia.org "Yisrael BaAliyah" logo 2003` → <https://commons.wikimedia.org/wiki/File:2003_Knesset.svg>; <https://commons.wikimedia.org/wiki/File:Israel_Knesset_2003.svg>.
- S3: `site:facebook.com "ישראל בעלייה" 2003 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "ישראל בעלייה" 2003 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `ל` — האיחוד הלאומי.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"האיחוד הלאומי" "2003" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections/parties/haihud-haleumi>; <https://he.wikipedia.org/wiki/%D7%94%D7%90%D7%99%D7%97%D7%95%D7%93_%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99>; <https://www.hamichlol.org.il/%D7%94%D7%90%D7%99%D7%97%D7%95%D7%93_%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99>.
- S2: `site:commons.wikimedia.org "National Union" logo 2003` → <https://commons.wikimedia.org/wiki/File:Logo_Uni%C3%B3n_Nacional.png>; <https://commons.wikimedia.org/wiki/File:2003_Knesset.svg>; <https://commons.wikimedia.org/wiki/File:Israel_Knesset_2003.svg>.
- S3: `site:facebook.com "האיחוד הלאומי" 2003 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "האיחוד הלאומי" 2003 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `מחל` — הליכוד.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"הליכוד" "2003" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A9%D7%A9_%D7%A2%D7%A9%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf>.
- S2: `site:commons.wikimedia.org "Likud" logo 2003` → <https://commons.wikimedia.org/wiki/File:Likud_Logo.svg>; <https://commons.wikimedia.org/wiki/File:Logo_Likud.png>; <https://commons.wikimedia.org/wiki/File:Israel_Knesset_2003.svg>.
- S3: `site:facebook.com "הליכוד" 2003 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "הליכוד" 2003 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `מרצ` — מרצ.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"מרצ" "2003" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A9%D7%A9_%D7%A2%D7%A9%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections/parties/meretz>; <https://he.wikipedia.org/wiki/%D7%9E%D7%A8%D7%A6>.
- S2: `site:commons.wikimedia.org "Meretz" logo 2003` → <https://commons.wikimedia.org/wiki/File:Meretz_Logo.svg>; <https://commons.wikimedia.org/wiki/File:Meretz_Logo_Israel.png>.
- S3: `site:facebook.com "מרצ" 2003 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "מרצ" 2003 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `עם` — רע״ם.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"רע״ם" "2003" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A9%D7%A9_%D7%A2%D7%A9%D7%A8%D7%94>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf>; <https://www.idi.org.il/articles/66556>.
- S2: `site:commons.wikimedia.org "United Arab List" logo 2003` → <https://commons.wikimedia.org/wiki/File:Raam_logo_2021.svg>.
- S3: `site:facebook.com "רעם" 2003 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "רעם" 2003 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**L `שס` — ש״ס.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"ש״ס" "2003" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A9%D7%A9_%D7%A2%D7%A9%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections/elections/2003>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf>.
- S2: `site:commons.wikimedia.org "Shas" logo 2003` → <https://commons.wikimedia.org/wiki/File:Shas_logo.png>; <https://commons.wikimedia.org/wiki/File:Israel_Knesset_2003.svg>; <https://commons.wikimedia.org/wiki/File:Israel_Kn%C3%A9set_2003.svg>.
- S3: `site:facebook.com "שס" 2003 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "שס" 2003 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `agudat-yisrael` — אגודת ישראל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"אגודת ישראל" "2003" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A9%D7%A9_%D7%A2%D7%A9%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf>.
- S2: `site:commons.wikimedia.org "Agudat Yisrael" logo 2003` → <https://commons.wikimedia.org/wiki/User_talk:Jozef_Gabcik>.
- S3: `site:facebook.com "אגודת ישראל" 2003 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "אגודת ישראל" 2003 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `arab-democratic-party` — המפלגה הדמוקרטית הערבית (מד"ע).** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"המפלגה הדמוקרטית הערבית (מד"ע)" "2003" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.walla.co.il/news/israel/2588685>; <https://www.makorrishon.co.il/nrg/online/1/ART1/568/609.html>; <https://www.kas.de/documents/263458/263507/KAP+Publication.pdf>.
- S2: `site:commons.wikimedia.org "Arab Democratic Party" logo 2003` → no returned URLs.
- S3: `site:facebook.com "המפלגה הדמוקרטית הערבית" 2003 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "המפלגה הדמוקרטית הערבית" 2003 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `degel-hatorah` — דגל התורה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"דגל התורה" "2003" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%93%D7%92%D7%9C_%D7%94%D7%AA%D7%95%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections/parties/yahadut-hatorah>; <https://he.wikipedia.org/wiki/%D7%99%D7%94%D7%93%D7%95%D7%AA_%D7%94%D7%AA%D7%95%D7%A8%D7%94>.
- S2: `site:commons.wikimedia.org "Degel HaTorah" logo 2003` → no returned URLs.
- S3: `site:facebook.com "דגל התורה" 2003 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "דגל התורה" 2003 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `democratic-choice` — הבחירה הדמוקרטית.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"הבחירה הדמוקרטית" "2003" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%9E%D7%A8%D7%A6>; <https://www.idi.org.il/policy/parties-and-elections/parties/meretz>; <https://www.idi.org.il/articles/32955>.
- S2: `site:commons.wikimedia.org "Democratic Choice" logo 2003` → no returned URLs.
- S3: `site:facebook.com "הבחירה הדמוקרטית" 2003 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "הבחירה הדמוקרטית" 2003 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `hadash` — חד"ש.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"חד"ש" "2003" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A9%D7%A9_%D7%A2%D7%A9%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf>.
- S2: `site:commons.wikimedia.org "Hadash" logo 2003` → <https://commons.wikimedia.org/wiki/File:Hadash.svg>; <https://commons.wikimedia.org/wiki/File:Israel_Knesset_2003.svg>; <https://commons.wikimedia.org/wiki/User_talk:Jozef_Gabcik>.
- S3: `site:facebook.com "חדש" 2003 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "חדש" 2003 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `labor` — מפלגת העבודה הישראלית.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"מפלגת העבודה הישראלית" "2003" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%9E%D7%A4%D7%9C%D7%92%D7%AA_%D7%94%D7%A2%D7%91%D7%95%D7%93%D7%94_%D7%94%D7%99%D7%A9%D7%A8%D7%90%D7%9C%D7%99%D7%AA>; <https://www.idi.org.il/policy/parties-and-elections/parties/haavoda>; <https://www.gov.il/BlobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisionsfullbook2022.pdf>.
- S2: `site:commons.wikimedia.org "Israeli Labor Party" logo 2003` → <https://commons.wikimedia.org/wiki/File:Labor-Meimad.png>; <https://commons.wikimedia.org/wiki/File:Logo_haAwoda.svg>; <https://commons.wikimedia.org/wiki/File:HaAvoda_Logo.svg>.
- S3: `site:facebook.com "מפלגת העבודה הישראלית" 2003 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "מפלגת העבודה הישראלית" 2003 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `meimad` — מימד.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"מימד" "2003" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A9%D7%A9_%D7%A2%D7%A9%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections>; <https://elections.kaplanopensource.co.il/locality/1263>.
- S2: `site:commons.wikimedia.org "Meimad" logo 2003` → <https://commons.wikimedia.org/wiki/File:Labor-Meimad.png>.
- S3: `site:facebook.com "מימד" 2003 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "מימד" 2003 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `meretz` — מרצ.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"מרצ" "2003" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A9%D7%A9_%D7%A2%D7%A9%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections>; <https://www.gov.il/blobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisions%20knesset%2022.pdf>.
- S2: `site:commons.wikimedia.org "Meretz" logo 2003` → <https://commons.wikimedia.org/wiki/File:Meretz_Logo.svg>; <https://commons.wikimedia.org/wiki/File:Meretz_Logo_Israel.png>.
- S3: `site:facebook.com "מרצ" 2003 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "מרצ" 2003 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `moledet` — מולדת.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"מולדת" "2003" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → **Tool failure:** Error: Search failed for query ""מולדת" "2003" לוגו בחירות אתר רשמי -site:en.wikipedia.org": 500 Internal Server Error - timeout of 5000ms exceeded.
- S2: `site:commons.wikimedia.org "Moledet" logo 2003` → <https://commons.wikimedia.org/wiki/Category:INS_Sufa_(Saar_4.5)>.
- S3: `site:facebook.com "מולדת" 2003 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "מולדת" 2003 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `ram` — רע"ם – הרשימה הערבית המאוחדת (התנועה האסלאמית, הפלג הדרומי).** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"רע"ם – הרשימה הערבית המאוחדת (התנועה האסלאמית, הפלג הדרומי)" "2003" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%A8%D7%A9%D7%99%D7%9E%D7%94_%D7%94%D7%A2%D7%A8%D7%91%D7%99%D7%AA_%D7%94%D7%9E%D7%90%D7%95%D7%97%D7%93%D7%AA>; <https://www.gov.il/BlobFolder/guide/candidates-lists-26/he/pr5_26_annex.pdf>; <https://www.inss.org.il/he/publication/%D7%94%D7%A9%D7%AA%D7%9C%D7%91%D7%95%D7%AA-%D7%A8%D7%A2%D7%9D-%D7%91%D7%A7%D7%95%D7%90%D7%9C%D7%99%D7%A6%D7%99%D7%94-%D7%A9%D7%95%D7%A8%D7%A9%D7%99%D7%9D-%D7%94%D7%99%D7%A1%D7%98%D7%95>.
- S2: `site:commons.wikimedia.org "Ra'am – United Arab List (Islamic Movement, southern branch)" logo 2003` → no returned URLs.
- S3: `site:facebook.com "רעם" 2003 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "רעם" 2003 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `shahar` — שח"ר.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"שח"ר" "2003" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A9%D7%A9_%D7%A2%D7%A9%D7%A8%D7%94>; <https://www.idi.org.il/articles/30964>; <https://he.wikipedia.org/wiki/%D7%94%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A9%D7%A9_%D7%A2%D7%A9%D7%A8%D7%94>.
- S2: `site:commons.wikimedia.org "Shahar" logo 2003` → <https://commons.wikimedia.org/wiki/File:Ho_Chi_Minh_City_Television_logo_(2003-present).png>; <https://commons.wikimedia.org/wiki/File:Ayelet_Shahar_memorial.JPG>; <https://commons.wikimedia.org/wiki/File:Ayelet_Shahar_garden.JPG>.
- S3: `site:facebook.com "שחר" 2003 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "שחר" 2003 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `taal` — תע"ל – התנועה הערבית להתחדשות.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"תע"ל – התנועה הערבית להתחדשות" "2003" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://oknesset.org/members/208.html>; <https://www.walla.co.il/news/israel/2588685>; <https://www.walla.co.il/news/israel/1386282>.
- S2: `site:commons.wikimedia.org "Ta'al" logo 2003` → <https://commons.wikimedia.org/wiki/File:Israel_Knesset_2003.svg>; <https://commons.wikimedia.org/wiki/File:2003_Knesset.svg>; <https://commons.wikimedia.org/wiki/File:Israel_Kn%C3%A9set_2003.svg>.
- S3: `site:facebook.com "תעל" 2003 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "תעל" 2003 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `tkuma` — תקומה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"תקומה" "2003" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%90%D7%99%D7%97%D7%95%D7%93_%D7%94%D7%9C%D7%90%D7%95%D7%9E%D7%99%E2%80%93%D7%AA%D7%A7%D7%95%D7%9E%D7%94>; <https://www.idi.org.il/media/30714/local-elections-in-israel-2003-2024.pdf>; <https://www.gov.il/BlobFolder/guide/knesset-elections-law/he/laws_old_decision_books_decisionsfullbook2022.pdf>.
- S2: `site:commons.wikimedia.org "Tkuma" logo 2003` → no returned URLs.
- S3: `site:facebook.com "תקומה" 2003 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "תקומה" 2003 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

**P `yisrael-beiteinu` — ישראל ביתנו.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"ישראל ביתנו" "2003" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%99%D7%A9%D7%A8%D7%90%D7%9C_%D7%91%D7%99%D7%AA%D7%A0%D7%95>; <https://www.idi.org.il/policy/parties-and-elections/parties/yisrael-beytenu>; <https://www.inss.org.il/he/publication/israel-elections-2022>.
- S2: `site:commons.wikimedia.org "Yisrael Beiteinu" logo 2003` → no returned URLs.
- S3: `site:facebook.com "ישראל ביתנו" 2003 בחירות` → **Tool failure:** Error: Search failed for query "site:facebook.com "ישראל ביתנו" 2003 בחירות": This key is out of quota. Please top up this key at https://jina.ai.

Batch verification: `npx vitest run` **57 files / 484 tests passed** (single worker and CLI testTimeout=30000 from k23 onward after existing rebuild tests exceeded 5000ms); `npx tsc -p tsconfig.json --noEmit`, `npx vite build`, and `python3 scripts/validate-party-logos.py` passed. Dataset build passed; all 26 election datasets equal prior batch after recursively removing `logo` and `builtAt`.
