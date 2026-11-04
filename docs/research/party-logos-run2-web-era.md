# Party logos run 2 — web era, k16–k26

As of 4 November 2026. Scope: every initially missing logo of a seat-winning list and every missing emblem of its named constituent parties, k16–k26. Baseline: **82 whole lists and 137 constituents (219 campaign-specific identities)**. k26 winners use the application's allocation of retained CEC final counts, not gazetted seats. No nonwinner expansion, no application or election-result changes, no push or merge.

Acceptance follows decision 0089 and the logo README: official origin plus dated campaign use; a joint list and its constituent emblems are different identities. A Commons description explicitly crediting an official origin and a campaign-period design date may qualify at medium confidence. Upload date alone, current branding, ballot-paper lettering, wrong countries and later variants do not qualify. This report distinguishes discovery results from opened evidence. An unsuccessful search establishes only that this bounded search did not verify a logo, never nonexistence.

## Method and reproducibility

Each initial gap receives three separately recorded Jina search_web queries: Hebrew official/campaign discovery; Commons discovery; official-social discovery. Each query's returned URLs are retained below, including false positives, with no claim they were all opened. Promising Commons descriptions were opened through the MediaWiki API (revisions and imageinfo/extmetadata); the compact catalogue below records the inspected metadata and rejection limitations. Search snippets are discovery only. English Wikipedia was never opened or cited as evidence; incidental links in Commons were not followed. The deliberately broad Commons queries have geographic false positives; they are not counted as corroboration.

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

Baseline whole lists: **8/11**; constituents: **8/19**. Every one of the 14 initial gaps below was queried in all three routes.

**L `ג` — יהדות התורה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"יהדות התורה" "2026" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/policy/parties-and-elections/parties/yahadut-hatorah>; <https://he.wikipedia.org/wiki/%D7%99%D7%94%D7%93%D7%95%D7%AA_%D7%94%D7%AA%D7%95%D7%A8%D7%94>; <https://www.kan.org.il/content/kan-news/politic/1112697>.
- S2: `site:commons.wikimedia.org "United Torah Judaism" logo 2026` → no returned URLs.
- S3: `site:facebook.com "יהדות התורה" 2026 בחירות` → no returned URLs.

**L `ט` — הציונות הדתית–זהות.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"הציונות הדתית–זהות" "2026" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.kan.org.il/content/kan-news/politic/1113524>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%A9>; <https://polimeter.co.il/parties/religious-zionism>.
- S2: `site:commons.wikimedia.org "Religious Zionism–Zehut" logo 2026` → no returned URLs.
- S3: `site:facebook.com "הציונות הדתית–זהות" 2026 בחירות` → no returned URLs.

**L `עם` — רע״ם.** Added fair-use whole-list logo from the dated official Ra’am brochure.

- S1: `"רע״ם" "2026" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/elections-2026>; <https://www.kan.org.il/content/kan-news/politic/live-1101961>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%A9>.
- S2: `site:commons.wikimedia.org "Ra'am" logo 2026` → <https://commons.wikimedia.org/wiki/File:Israeli_Knesset_Blocs_2026.svg>; <https://commons.wikimedia.org/wiki/File:Israeli_Knesset_Composition_2026.svg>; <https://commons.wikimedia.org/wiki/File:Opinion_polls_Israel_2026.svg>.
- S3: `site:facebook.com "רעם" 2026 בחירות` → no returned URLs.

**P `agudat-yisrael` — אגודת ישראל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"אגודת ישראל" "2026" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.gov.il/he/pages/candidates-lists-26>; <https://www.idi.org.il/policy/parties-and-elections>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%A9>.
- S2: `site:commons.wikimedia.org "Agudat Yisrael" logo 2026` → <https://commons.wikimedia.org/wiki/Category:SVG_logos_of_political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/Category:Haredi_Judaism>.
- S3: `site:facebook.com "אגודת ישראל" 2026 בחירות` → no returned URLs.

**P `atid-ehad` — עתיד אחד – עתיד טוב לישראל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"עתיד אחד – עתיד טוב לישראל" "2026" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%A9>; <https://www.nli.org.il/he/sheets/NNL_Ephemera997001190900405171/NLI>; <https://www.hamichlol.org.il/%D7%94%D7%A6%D7%99%D7%95%D7%A0%D7%95%D7%AA_%D7%94%D7%93%D7%AA%D7%99%D7%AA_(%D7%A1%D7%99%D7%A2%D7%94)>.
- S2: `site:commons.wikimedia.org "Atid Ehad" logo 2026` → no returned URLs.
- S3: `site:facebook.com "עתיד אחד" 2026 בחירות` → no returned URLs.

**P `balad` — בל"ד.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"בל"ד" "2026" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.idi.org.il/elections-2026>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%A9>; <https://www.kan.org.il/content/kan-news/politic/1103572>.
- S2: `site:commons.wikimedia.org "Balad" logo 2026` → <https://commons.wikimedia.org/wiki/File:Wust_El-Balad-Logo.jpg>; <https://commons.wikimedia.org/wiki/Category:SVG_logos_of_political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/File:Opinion_polls_Israel_2026.svg>.
- S3: `site:facebook.com "בלד" 2026 בחירות` → no returned URLs.

**P `degel-hatorah` — דגל התורה.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"דגל התורה" "2026" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%93%D7%92%D7%9C_%D7%94%D7%AA%D7%95%D7%A8%D7%94>; <https://www.idi.org.il/policy/parties-and-elections/parties/degel-hatora>; <https://www.kan.org.il/content/kan-news/newstv/p-963853/s1/1096871>.
- S2: `site:commons.wikimedia.org "Degel HaTorah" logo 2026` → no returned URLs.
- S3: `site:facebook.com "דגל התורה" 2026 בחירות` → no returned URLs.

**P `eretz-yisrael-shelanu` — ארץ ישראל שלנו.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"ארץ ישראל שלנו" "2026" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%A9>; <https://www.gov.il/he/pages/yehudit-meuhedet_list14>; <https://www.idi.org.il/policy/parties-and-elections/elections/2019-2>.
- S2: `site:commons.wikimedia.org "Eretz Yisrael Shelanu" logo 2026` → no returned URLs.
- S3: `site:facebook.com "ארץ ישראל שלנו" 2026 בחירות` → no returned URLs.

**P `hadash` — חד"ש (המפלגה הקומוניסטית הישראלית).** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"חד"ש (המפלגה הקומוניסטית הישראלית)" "2026" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://t.me/s/king_of_theneighborhood?before=29968>.
- S2: `site:commons.wikimedia.org "Hadash (Israeli Communist Party)" logo 2026` → no returned URLs.
- S3: `site:facebook.com "חדש" 2026 בחירות` → no returned URLs.

**P `homat-torat-yisrael` — חומת תורת ישראל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"חומת תורת ישראל" "2026" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%A9>; <https://www.gov.il/he/departments/israeli_corporations_authority>; <https://he.wikipedia.org/wiki/%D7%99%D7%94%D7%93%D7%95%D7%AA_%D7%94%D7%AA%D7%95%D7%A8%D7%94>.
- S2: `site:commons.wikimedia.org "Homat Torat Yisrael" logo 2026` → no returned URLs.
- S3: `site:facebook.com "חומת תורת ישראל" 2026 בחירות` → no returned URLs.

**P `meretz` — מרצ.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"מרצ" "2026" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://www.gov.il/he/pages/hademokratim_list17>; <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%A9>; <https://www.idi.org.il/policy/parties-and-elections>.
- S2: `site:commons.wikimedia.org "Meretz" logo 2026` → <https://commons.wikimedia.org/wiki/Category:Logos_of_political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/Category:SVG_logos_of_political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/File:Israeli_Knesset_Blocs_2021.svg>.
- S3: `site:facebook.com "מרצ" 2026 בחירות` → no returned URLs.

**P `taal` — תע"ל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"תע"ל" "2026" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%A9>; <https://main.knesset.gov.il/News/PressReleases/Documents/141026.pdf>; <https://www.idi.org.il/articles/66556>.
- S2: `site:commons.wikimedia.org "Ta'al" logo 2026` → <https://commons.wikimedia.org/wiki/File:Logo_Hadash_Ta%27al.png>; <https://commons.wikimedia.org/wiki/Category:Logos_of_political_parties_in_Israel>; <https://commons.wikimedia.org/wiki/Category:Joint_List>.
- S3: `site:facebook.com "תעל" 2026 בחירות` → no returned URLs.

**P `together-bennett` — ביחד בראשות בנט.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"ביחד בראשות בנט" "2026" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%91%D7%99%D7%97%D7%93_(%D7%A8%D7%A9%D7%99%D7%9E%D7%94)>; <https://www.idi.org.il/elections-2026>; <https://www.hamichlol.org.il/%D7%91%D7%99%D7%97%D7%93_(%D7%A8%D7%A9%D7%99%D7%9E%D7%94)>.
- S2: `site:commons.wikimedia.org "Together (Bennett)" logo 2026` → no returned URLs.
- S3: `site:facebook.com "ביחד בראשות בנט" 2026 בחירות` → no returned URLs.

**P `yesodot-yisrael` — יסודות ישראל.** Open: campaign-specific official-origin design not verified in this pass; a joint/constituent substitution or a different year is not accepted.

- S1: `"יסודות ישראל" "2026" לוגו בחירות אתר רשמי -site:en.wikipedia.org` → <https://he.wikipedia.org/wiki/%D7%94%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9C%D7%9B%D7%A0%D7%A1%D7%AA_%D7%94%D7%A2%D7%A9%D7%A8%D7%99%D7%9D_%D7%95%D7%A9%D7%A9>; <https://www.gov.il/he/pages/yashar_list_2>; <https://www.haaretz.co.il/news/elections/2026-07-12/ty-article/0000019f-5763-d6c0-a9df-dfff952f0000>.
- S2: `site:commons.wikimedia.org "Yesodot Yisrael" logo 2026` → no returned URLs.
- S3: `site:facebook.com "יסודות ישראל" 2026 בחירות` → no returned URLs.

Batch verification: `npx vitest run` **57 files / 484 tests passed**; `npx tsc -p tsconfig.json --noEmit`, `npx vite build`, and `python3 scripts/validate-party-logos.py` passed. Dataset build passed; all 26 election datasets equal prior batch after recursively removing `logo` and `builtAt`.
