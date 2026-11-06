# Historical press and presidential-consultation archive access

As of **5 November 2026**. Research only, for the 1949–1992 recommendation and campaign-logo work. Live probes used `israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)`; no credentials, account creation, challenge execution, proxies, or restricted-content downloads. This document records access methods, not a completed recommendation dataset.

**Use ISA's official data.gov.il catalogue API now for file discovery, and Knesset OData plus its document links for primary records.** Both worked without a key. NLI documents a JPress-aware Search API and IIIF, but the tested Search API and newspaper page returned browser challenges; a documented IIIF example returned Forbidden. No working JPress OCR/image API or rights-cleared bulk newspaper mirror was established. The owner should request an NLI key **and confirmation that this project's newspaper access and export are supported**; a key alone is not proven to resolve the challenge.

## Evidence and testing conventions

- **Live** means an HTTP request from this workspace with the exact UA above, with status and body inspected. Requests were sequential, approximately one second apart, bounded by timeouts and small result limits. No 429 or Retry-After was observed. Future agents must stop on 401/403, browser challenges, login/paywall requirements or unexplained refusals; on 429 stop, record Retry-After and do not retry before it expires. Do not change identity, host, scheme, cookies or network location to evade a refusal.
- **Documented** means official documentation read through the web tool. **Indexed only** means a search engine exposed text of an official page but a full fetch was blocked or not performed; treat details as provisional. Web discovery tools do not expose configurable UA or reliable origin HTTP status, so their successes are not custom-UA endpoint tests.
- Initial sandbox requests failed DNS before reaching any service. Authorized ordinary network requests then produced the live results below. The TAU hostname still failed DNS in that network context. DNS failure is not a server refusal or evidence of a site's closure.
- Reproducible responses, PDF copies, extraction dependencies and intermediate text were placed in ignored `.backup-scratch/archive-access/`. The durable evidence is the URLs, parameters, excerpts, hashes and versions here; scratch is not required for using this report. Backup exclusion beyond the repository's ignore rule was not checked.

## Route matrix

| Route | What it gives | Authentication | Tested outcome | Use/terms boundary |
|---|---|---|---|---|
| [NLI Open Library](https://www.nli.org.il/en/research-and-teach/open-library), `/openlibrary/search` | Catalogue discovery, descriptive metadata and digital-media links; docs explicitly mention JPress | Personal API key; a limited guest key is advertised in indexed docs | Live no-key `dav` query: **403 browser challenge**, not an authentication verdict | NLI warns that item copyright terms still apply; no blanket bulk licence |
| NLI IIIF Presentation / Image | Manifest, page canvases and image services for supported digital objects | Documented URL patterns show no key; item restrictions remain | Map-example manifest: **403 XML Forbidden**; no JPress manifest or page image retrieved | Inspect object rights and image-service capabilities; API availability does not grant reuse rights |
| NLI OAI-PMH / Primo | Potential metadata harvesting / catalogue search | OAI endpoint/access not established; hosted Primo needs institution-configured key | No verified NLI OAI endpoint or institution-authorized Primo configuration to query | Do not invent endpoints or borrow another site's keys |
| [data.gov.il ISA catalogue](https://data.gov.il/dataset/israel-state-archives-catalog) | File titles, creators, reference codes, descriptions, dates, exposure status; CSV and CKAN API | None for tested reads | **200 JSON**; consultation query 157 records; exact נ-56/1 one record | Package says `Other (Open)`; metadata licence is not a licence for underlying scans |
| ISA catalogue / main website | Normally file discovery/viewing; current machine access refused | No public scan API/key process verified | `catalog.archives.gov.il/`: **403 JSON**; main site **403** | Request copies/access through ISA; do not reverse-engineer protected backends |
| [Knesset OData](https://main.knesset.gov.il/Activity/Info/pages/databases.aspx) v3 and v4 | Sessions, agenda items, document URLs; no newspaper images | None in live tests | **200 XML/JSON** including 1959 sessions | Read publicly supplied documents; no blanket image/third-party reuse licence verified |
| Knesset `fs.knesset.gov.il` documents / government PDFs | Scanned protocols and government formation extracts; some have searchable text | None in successful live tests | **200 PDF** for a 1959 plenum session and `gov9.pdf` | Government extract can establish mandate facts, not necessarily each faction's recommendation |
| Former TAU JPress | Historical host; no separate working mirror verified | Unknown | `https://jpress.tau.ac.il/`: DNS failure | Not an independent corpus/permission source merely because an old URL exists |
| [Google News Archive](https://news.google.com/newspapers) | Scanned press browser/index, potentially other newspapers' reporting | No login for tested index | **200 HTML**, no Davar match in index text | No supported bulk API found; Google terms require respecting machine-readable restrictions |
| [Internet Archive search](https://archive.org/advancedsearch.php) | Public item discovery and file metadata; some items list OCR, PDFs, JP2 archives | None for tested metadata | **200 JSON**, including a Davar 1974 upload; exact title search for Davar + 1959: zero | Upload provenance/rights not established; not a verified authorized JPress mirror |
| [OMILab pipeline](https://github.com/omilab/2022_OCR_Pipeline) / [He-Story](https://www.openu.ac.il/he-story/) | Research partnership precedent; code; He-Story's described corpus is nineteenth-century | Selected JPress source files supplied by NLI to project | README read; He-Story returned a JS application shell via web fetch | Code licence does not grant rights to the newspaper corpus; not a 1949–1992 substitute |

## NLI: supported interfaces and what remains unproven

### Search API and key application

NLI's [developer landing page](https://www.nli.org.il/en/research-and-teach/open-library) explicitly offers Search, IIIF Presentation and IIIF Image and links **Sign up** to [api2.nli.org.il/signup/](https://api2.nli.org.il/signup/). The signup form was readable through the web tool: first name, last name and email are required; intended use is optional, and agreement to linked terms is required. Its generic “Data.gov developer network” wording appears to be platform boilerplate, not a reason to apply on data.gov.il instead. Nothing was submitted.

Owner action: follow the official Sign up link, review its current linked terms, describe this repository, the seven newspaper titles, 1949–1992, expected modest request volume, research quotations and possible public logo crops. Keep the issued key outside Git and logs. Ask NLI to confirm API hostname, quota, newspaper coverage, issue/date/full-text search support, and supported export formats. Also ask whether machine access can be authorized without a browser challenge. Approval timing and current production limits were not established.

The indexed [Search API documentation](https://www.nli.org.il/he/research-and-teach/open-library/search-api) calls `api_key` mandatory and advertises a limited guest user. The [common-usage page](https://www.nli.org.il/en/research-and-teach/open-library/search-api/user-help) explicitly gives `material_type=NEWSPAPER&query=title,exact,unzsft` as a JPress example. This is evidence of intended newspaper support, **not proof that every JPress article's OCR is returned**. The guest value was neither used nor copied into this repository.

Live request, **no key**, 18:14 UTC:

```http
GET https://api.nli.org.il/openlibrary/search?material_type=NEWSPAPER&query=title,exact,dav&items_per_page=1
User-Agent: israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)

HTTP/2 403
content-type: text/html; charset=UTF-8
cf-mitigated: challenge
<title>Checking your browser...</title>
```

Stopped. The challenge body identifies `api2.nli.org.il`; this does not establish an independently usable alternate endpoint. No second keyed request was attempted.

**Update 6 November 2026 (keyed, owner's key read from a local file, never logged):** `api.nli.org.il/openlibrary/search` still returns **403 `cf-mitigated: challenge`** with the key, so that host's browser challenge sits in front of key checking. `api2.nli.org.il/openlibrary/search` (the host that issues keys) passed the request without a challenge but returned **HTTP 500 JSON “unsuccessfully to connect with nliWs”**, and a minimal `query=any,contains,davar` returned **HTTP 502**. These are server-side errors, not refusals. Next: retry api2 later at low volume; contact NLI only if it keeps failing or a challenge appears there.

After NLI confirms access, this is a **documentation-based, untested keyed example**, using shell variable `NLI_API_KEY` already supplied securely by the owner:

```bash
curl --get --max-time 30 \
  --user-agent 'israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)' \
  --data-urlencode "api_key=$NLI_API_KEY" \
  --data-urlencode 'material_type=NEWSPAPER' \
  --data-urlencode 'query=title,exact,dav' \
  --data-urlencode 'items_per_page=1' \
  --data-urlencode 'output_format=json' \
  'https://api.nli.org.il/openlibrary/search'
```

Do not enable verbose HTTP logging or retain secret-bearing request URLs. `dav` is the newspaper code, following the documented code-search example; its behaviour here is unverified. For a three-character keyword probe, `query=any,contains,התייעצויות הנשיא` is **not asserted to be supported**: obtain the permitted field list first. Catalogue title search is not equivalent to JPress's OCR full-text search. The common-usage docs advertise `result_page`, up to 50 items/page, `start_date`, and `availability_type=online_and_api_access`; validate their semantics before bulk use and inspect the `Errors` response header because some invalid conditions may be ignored despite HTTP 200. A rate-limit header shown in an old example is not a promised current quota.

### JPress identifiers, OCR and images

The live target was [Davar, 8 December 1959, page 1](https://www.nli.org.il/he/newspapers/dav/1959/12/08/01/page/1): **403**, HTML browser challenge at 18:15 UTC. No page image, article OCR, PDF or article identifier was acquired from it. Indexed [December 1959 calendar metadata](https://www.nli.org.il/he/newspapers/dav/1959/12) lists an issue on the eighth; this is a locator lead, not inspected newspaper evidence.

Useful locator distinctions:

| Identifier | Example / meaning | Conversion caution |
|---|---|---|
| Newspaper code | `dav`, `mar`, `haretz`, `ahr`, `hbkr`, `hrt`, `pls` | Use the title directory to confirm language and edition; `mishmar` is an Arabic publication, not the Hebrew `ahr` |
| Issue/page permalink | `/he/newspapers/dav/1959/12/08/01/page/1` | `01` is an issue/edition discriminator, not a page; verify existence |
| Article permalink | `/he/newspapers/{code}/{yyyy}/{mm}/{dd}/{edition}/article/{id}` | Article IDs must come from returned links; do not invent an article number |
| Legacy JPress `d=` | Existing repo source: `dav19590731-01.2.173`; page example `hrt19590522-01.1.2` | Preserve exactly; do not assume these suffixes map to current article IDs |
| Older Olive locator | Indexed links contain `BaseHref=DAV/1959/12/25` and `EntityId=Ar00310` | Historical viewer identifiers are not Rosetta `FL` identifiers or permission to fetch backend paths |
| NLI `RecordId`, Primo `Identifier` / DOCID | Search-response identifiers used by the documented manifest API | A journal catalogue record, JPress issue, article and digital object need not have interchangeable IDs |
| Rosetta `FL…` | Image-service identifier returned in a supported IIIF manifest | Discover from the manifest; never derive it from the newspaper date |

The legacy examples already occur in [the earlier logo research](party-logos-run2-1949-1973.md); they were not revalidated here. NLI's indexed [newspaper help](https://www.nli.org.il/en/newspapers/help) describes page images, article/page text and OCR full-text search, including inaccurate automatically generated text. **Viewer OCR existence does not establish an open OCR download API.** No public JPress ALTO, PRXML, METS, plain-text endpoint, OAI full-text feed or IIIF Content Search service was verified.

Indexed [Presentation documentation](https://www.nli.org.il/he/research-and-teach/open-library/presentation-api) gives these two manifest patterns:

```text
https://iiif.nli.org.il/IIIFv21/{RecordId}/manifest
https://iiif.nli.org.il/IIIFv21/DOCID/{Identifier}/manifest
```

A live probe of the [older official example](https://openlibrary.nli.org.il/presentationapi.html), upgraded to HTTPS, returned:

```http
GET https://iiif.nli.org.il/IIIFv21/DOCID/NNL_MAPS_JER002366843/manifest
HTTP 403
Content-Type: text/xml
<error><parameter>default_message</parameter><text>Forbidden</text></error>
```

That is a map control, not a JPress item. It proves neither that newspapers support IIIF nor that all NLI IIIF is unavailable. No image request was made because no usable manifest/image ID was obtained. The indexed [Image API documentation](https://iiif.nli.org.il/imageapi.html) describes image information and region/size requests. For an authorized manifest, read `sequences[].canvases[].images[].resource.service` (Presentation 2); follow its service URL to `info.json`, then request a supported small image. Respect advertised dimensions, limits, licence and attribution. Inspect any `seeAlso` or text annotations if present; absence/presence must be observed, not inferred from IIIF support. Do not assume `full/max` is allowed or assemble tiles to defeat download restrictions.

### Coverage, terms and bulk alternatives

These are **indexed title-directory leads, not live issue retrieval tests**:

| Title | Directory code | Indexed coverage/gap relevant to this task |
|---|---|---|
| [Davar](https://www.nli.org.il/he/newspapers/dav/1959/12) | `dav` | 1925–June 1985; cannot assume 1988/1992 coverage |
| [Maariv](https://www.nli.org.il/en/newspapers/mar/1980/02) | `mar` | Extends beyond study period; indexed title description gives contradictory remote-access cutoffs (1993 and 1964); ask NLI |
| [Haaretz](https://www.nli.org.il/en/newspapers/haretz/) | `haretz` | Title page says remote through 1972; [reference guide](https://www.nli.org.il/en/at-your-service/reference/newspapers-search-guide) says 1966; unresolved, check actual edition permissions |
| [Al HaMishmar](https://www.nli.org.il/en/newspapers/ahr) | `ahr` | Title page through March 1979; collection overview says 1978; confirm issue-level availability |
| [HaBoker](https://www.nli.org.il/en/newspapers/hbkr) | `hbkr` | 1935–1965 |
| [Herut](https://www.nli.org.il/en/newspapers/hrt) | `hrt` | 1948–1965; distinguish older `ahj` Ha-Herut |
| [Palestine Post](https://www.nli.org.il/he/newspapers/pls) | `pls` | December 1932–April 1950; useful for 1949 |
| [Jerusalem Post](https://www.nli.org.il/en/newspapers/jlmpost/2023/11) | `jlmpost` | Indexed digital run starts September 1995, outside scope; historical successor coverage must be requested separately |

Rights vary even among these pages. Indexed Davar terms reserve copying/republication subject to permissions and legally permitted uses; Haaretz/HaBoker describe attributed non-commercial teaching/research use. Neither supports a general claim that logo crops may be republished. NLI's [online-access guidance](https://www.nli.org.il/en/at-your-service/reference/online-access) says consult each item's “Possible uses” and the copyright inquiry service. Ask specifically about storing OCR, sharing a research corpus, and publishing cropped advertisements. Human reading, machine harvesting and public reuse are separate questions. Restriction dates conflict, so do not encode guessed cutoffs into agents.

For bulk access, request a **bounded research export** of the named titles/date windows: issue list, page numbers, article segmentation, OCR/ALTO/PRXML if available, images, stable citation IDs, permitted retention/reuse and rate limits. The [OMILab README](https://github.com/omilab/2022_OCR_Pipeline) explicitly reports that NLI supplied selected JPress image/OCR backend files to its research partnership. This is a precedent for asking, not entitlement or a public download service. Its code licence does not transfer newspaper rights. He-Story's indexed description names nineteenth-century newspapers, so it is outside the target period.

No NLI OAI-PMH base URL/set with JPress coverage was located. Do not translate generic Alma/Rosetta support into an operational endpoint. Ask NLI for the approved base URL, sets, metadata formats, authentication and harvest policy; only then use `verb=Identify`, `ListMetadataFormats`, `ListSets` and a bounded `ListRecords`. Metadata harvesting alone would not supply OCR/images.

[Primo's vendor documentation](https://developers.exlibrisgroup.com/primo/apis/) describes regional `/primo/v1/search` access with an institution-configured key and view/scope/tab parameters. No NLI-specific supported configuration was obtained or guessed; no meaningful NLI Primo query could therefore be tested. Prefer NLI's advertised wrapper. An NLI Open Library key is not established to be a Primo vendor key.

Live data.gov.il `package_search` queries `q=nli` and `q="הספרייה הלאומית"`, `rows=2`, returned **count 0**. This is limited keyword discovery, not proof no NLI datasets exist. GitHub's `/orgs/nli-org-il/repos?per_page=100` returned **404**, whereas `/users/nli-org-il/repos?per_page=100` returned **200 `[]`**. Do not cite this suggested name as a verified bulk corpus publisher. A real community repository, [OriHoch/nli-data-pipelines](https://github.com/OriHoch/nli-data-pipelines), has a [DATA.md](https://raw.githubusercontent.com/OriHoch/nli-data-pipelines/master/DATA.md) successfully fetched with the specified UA. It describes collection/manifest metadata and a `data` branch, not a proven JPress OCR corpus. Its [MIT licence](https://raw.githubusercontent.com/OriHoch/nli-data-pipelines/master/LICENSE) applies to software; no newspaper redistribution permission was established. No large ZIP was downloaded.

## Israel State Archives: a working official catalogue export

### Public CKAN API: verified and immediately usable

Discover the publisher's [catalogue package](https://data.gov.il/dataset/israel-state-archives-catalog) using:

```http
GET https://data.gov.il/api/3/action/package_search?q=%D7%90%D7%A8%D7%9B%D7%99%D7%95%D7%9F%20%D7%94%D7%9E%D7%93%D7%99%D7%A0%D7%94&rows=2
HTTP 200
{"success":true,"result":{"count":2,"results":[...]}}
```

Inspected result: publisher `archives` / ארכיון המדינה, package `israel-state-archives-catalog`, ID `8b18bbc7-4951-43a2-83ac-18d196eba835`, metadata modified `2026-08-18T16:12:08.353615`. Its CSV resource ID is **`1296c3cd-0cb6-47a3-8ca9-e3af6e774681`**, with `datastore_active=true` and `datastore_contains_all_records_of_source_file=true`. The advertised [CSV download](https://data.gov.il/dataset/8b18bbc7-4951-43a2-83ac-18d196eba835/resource/1296c3cd-0cb6-47a3-8ca9-e3af6e774681/download/-.csv) is 625,953,600 bytes according to metadata; **not downloaded/tested**. Resource `last_modified` says April 2024, so catalogue freshness is uncertain despite newer package metadata. Prefer narrow API queries initially.

Two reproducible request examples (Bash, curl; no key) are below. Inspect body and status; successful response shapes are abbreviated projections, not full dumps.

```bash
curl --get --max-time 30 \
  --user-agent 'israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)' \
  --data-urlencode 'resource_id=1296c3cd-0cb6-47a3-8ca9-e3af6e774681' \
  --data-urlencode 'q=הרכבת הממשלה' --data-urlencode 'limit=2' \
  'https://data.gov.il/api/3/action/datastore_search'

curl --get --max-time 30 \
  --user-agent 'israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)' \
  --data-urlencode 'resource_id=1296c3cd-0cb6-47a3-8ca9-e3af6e774681' \
  --data-urlencode 'filters={"Reference_code":"נ-56/1"}' \
  --data-urlencode 'limit=1' \
  'https://data.gov.il/api/3/action/datastore_search'
```

Both **200**. First query returned `total=157`, `total_was_estimated=false`. Its two records included נ-846/13 (presidential speeches, 1974–1977) and **נ-571/2**, the fifteenth government's formation file, 31 December 1973–10 March 1974. The latter's description explicitly mentions consultation protocols and party platforms. This is a promising file lead, not a read consultation transcript.

Exact-reference response projection:

```json
{
  "success": true,
  "result": {
    "total": 1,
    "records": [{
      "_id": 53991,
      "Signature": "000ddpc",
      "Reference_code": "נ-56/1",
      "Title": "בן-צבי יצחק - התפטרות הממשלה ה- 9 והקמת הממשלה ה-10",
      "Creator": "בית נשיא מדינת ישראל/לשכת נשיא המדינה",
      "Closure_status": "גלוי",
      "Creation_date_from": "16/12/1959",
      "Creation_date_until": "02/11/1961",
      "File_type": "תיק מסמכים"
    }]
  }
}
```

The field list also contains `Description`, but no scan URL/OCR field. The description concerns consultations for the **tenth** government and includes older ninth-government background. Do not assign this whole file to the December 1959 post-election round. `גלוי` is a catalogue exposure label, not proof every scan is online or redistributable. `Signature` is returned metadata, not a verified download URL component.

Use `fields` to inspect schema, `offset`/`limit` or returned `_links.next` for bounded pagination, and exact `filters` for a known reference. Dates are strings in `DD/MM/YYYY` format; parse them locally rather than lexically comparing them as ISO dates. The broad Hebrew query is search matching, not a guarantee of phrase-exact or exhaustive discovery. Repeat with specific presidents, `התייעצויות`, `לשכת נשיא המדינה` and government numbers as needed; those variants were not all tested here. No read limit/quota was established and no SQL endpoint was needed.

Package `license_title` is `Other (Open)`, `license_url=null`. Preserve that uncertainty and the publisher attribution; do not invent a CC licence or extend a metadata licence to documents. The [resource page](https://data.gov.il/dataset/israel-state-archives-catalog/resource/1296c3cd-0cb6-47a3-8ca9-e3af6e774681) is the place to inspect current dataset terms before reuse.

### Scans, IIIF and the request process

Live `https://catalog.archives.gov.il/` returned **403**, `Content-Type: application/json`, `x-amzn-ErrorType: ForbiddenException`, body `{"message":"Forbidden"}`. The main `https://www.archives.gov.il/` returned a CloudFront **403** error. Neither response demonstrates a supported public scan API. CORS headers mentioning `X-Api-Key` and an AWS gateway are implementation details, **not evidence that ISA offers developer keys**. No protected routes were probed afterward. No official ISA IIIF manifest, public scan API documentation, OCR bulk endpoint or developer registration process was located in the bounded research.

The owner can start at the official [gov.il ISA department page](https://www.gov.il/he/departments/state-archives) and its current contact/reading-room channel. Its indexed notice gives **02-5680680**, 09:00–15:00 by appointment for guidance and digital material. A live fetch of that page also hit a 403 challenge; the phone/hours need confirmation. Do not substitute the Ministry of Defense archive, US `archives.gov` API, or a community “OData” site for ISA.

Suggested request contents: project/repository and purpose; 1949–1992 initial post-election consultation rounds; president/fonds; reference code, returned signature, title and dates; desired PDF/TIFF pages and OCR if held; confirmation of scan completeness, closed/redacted pages, permitted machine access, reuse/attribution and any fees. For נ-56/1 ask which pages belong to which round; ask staff to locate the actual November–December 1959 consultation file separately. Request declassification review through ISA's current process if a required file is closed. No request was sent, and no delivery time, fee or approval was assumed.

## Knesset: tested session-to-document path

The official [OData introduction](https://main.knesset.gov.il/Activity/Info/pages/databases.aspx) identifies the parliamentary data service. Live schemas:

```text
https://knesset.gov.il/Odata/ParliamentInfo.svc/$metadata       -> 200 XML
https://knesset.gov.il/ODATAV4/ParliamentInfo/$metadata         -> 200 XML
```

**Version difference observed:** v3 session key is `PlenumSessionID`; v4 uses `Id`. v3 dates are `Edm.DateTime`; v4 dates are `Edm.DateTimeOffset`. Document records still carry `PlenumSessionID` as the foreign key. Do not mechanically substitute field names or date literals across versions. Both tested JSON responses use `value`; inspect returned continuation links rather than assuming one page is complete.

Live v3 query (encoded by curl in the same form as the tested request):

```bash
curl --get --max-time 30 \
  --user-agent 'israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)' \
  --data-urlencode "\$filter=KnessetNum eq 4 and StartDate ge datetime'1959-12-01T00:00:00' and StartDate lt datetime'1959-12-10T00:00:00'" \
  --data-urlencode '$orderby=StartDate' --data-urlencode '$top=10' \
  --data-urlencode '$format=json' \
  'https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PlenumSession'
```

HTTP **200**, five sessions returned, including:

```json
{"PlenumSessionID":489061,"Number":4,"KnessetNum":4,
 "Name":"ישיבת מליאה בתאריך 08/12/1959 בשעה 16:06",
 "StartDate":"1959-12-08T16:06:00"}
```

Document lookup: [KNS_DocumentPlenumSession for 489061](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_DocumentPlenumSession?$filter=PlenumSessionID%20eq%20489061&$top=2&$format=json), **200**:

```json
{"DocumentPlenumSessionID":"251650","PlenumSessionID":489061,
 "GroupTypeDesc":"דברי הכנסת","ApplicationDesc":"PDF",
 "FilePath":"https://fs.knesset.gov.il//4/Plenum/4_ptm_251650.pdf"}
```

The other returned file is a TIF. The [PDF at the returned URL](https://fs.knesset.gov.il//4/Plenum/4_ptm_251650.pdf) downloaded **200**, 1,294,761 bytes, starts `%PDF`. Text extraction works but spacing/order are poor. The tested [KNS_PlmSessionItem lookup](https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_PlmSessionItem?$filter=PlenumSessionID%20eq%20489061&$top=10&$format=json) returned deputy-speaker selection and bills; it did **not** identify a presidential recommendation item. An agenda match is not guaranteed even for a relevant date.

The separate live v4 query [KnessetNum eq 4, top 1](https://knesset.gov.il/ODATAV4/ParliamentInfo/KNS_PlenumSession?$filter=KnessetNum%20eq%204&$top=1) returned **200**, `Id=158004`, session number 20, 30 December 1959 at 11:00. This confirms historical coverage, not chronological ordering; specify `$orderby` when selecting an earliest session.

The indexed [Knesset archive collections page](https://main.knesset.gov.il/About/Departments/pages/archivecollections.aspx) says plenum protocols through Knesset 12 were scanned, and Knesset 13 onward are digital. Its [services page](https://main.knesset.gov.il/About/Departments/pages/archiveservices.aspx) describes assistance with requests. For a missing file, use the archive contact currently listed there; the indexed collections page lists `arcvd@knesset.gov.il`. No email was sent. The recent NLP “Knesset Corpus” (1998–2022) is outside the requested period and is not a substitute for these earlier records.

### Government pages: a useful primary-source shortcut

The indexed [coalition agreements/government programmes page](https://main.knesset.gov.il/mk/government/pages/coalitionagreements.aspx) links government formation statements from *Divrei HaKnesset*, including [government nine](https://main.knesset.gov.il/mk/government/documents/gov9.pdf). The HTML page's live response was **247**, a script-based challenge shell; it was not executed. The independently identified public PDF downloaded **200**, 327,974 bytes, seven pages, with extractable Hebrew text.

On page 1 of that PDF, the 16 December 1959 statement by Ben-Gurion describes the presidential mandate eight days earlier, following consultations with all factions. Thus **8 December 1959 is supported as the mandate date by this primary text**. The statement does not enumerate each faction's recommendation. Coalition membership, later confidence votes and a general assertion that consultations occurred cannot fill that gap.

The web tool separately reached a location-denial page for this same PDF while the UA-specific live request succeeded. Record these as distinct access contexts. Never route through another region or host to overcome a location refusal; the successful live request here used the ordinary workspace network without such changes.

PDF SHA-256 values, for identifying the inspected versions:

```text
gov9.pdf:             60793bab5cb2011109715b62fe8bbae47cde57d0dff1f29d894000380ff91a61
4_ptm_251650.pdf:     90d25b4fa7acedf55c66cb46b7392703058dba85ccf9b901ebe02388da4932fd
```

Extraction used Python 3.14 and `pypdf` 6.21.4 installed only in scratch. A text layer is not proof of accurate Hebrew reading order; consult the page image before quoting uncertain text. No all-era download sweep or per-party recommendation validation was done.

## Other hosts: discoveries and limits

**TAU.** One live request to `https://jpress.tau.ac.il/` failed DNS; no HTTP response or terms were obtained. NLI's indexed [history of JPress](https://blog.nli.org.il/en/yesterdays-news/) describes the unification of TAU and NLI efforts. Historical `jpress`/Olive references are not evidence of a currently independent mirror. No TAU API or bulk delivery policy was verified.

**Google.** The live [newspaper index](https://news.google.com/newspapers) returned 200, 553,916 bytes. A case-insensitive check found no literal `Davar`, `Maariv`, `Haaretz`, `Palestine` or `Jerusalem` in that response. A targeted web search for Davar there found no usable match. This does not prove absence of every edition or Hebrew-title variant. Google's [own guide](https://newsinitiative.withgoogle.com/en-gb/resources/trainings/fundamentals/google-news-archive-access-the-past/) recommends web discovery with `site:google.com/newspapers` for historical scans; no supported newspaper bulk/OCR API was found. [Google's terms](https://policies.google.com/terms), effective 30 July 2026 in the fetched version, prohibit automated access contrary to machine-readable instructions. Use it for permitted discovery/reading of other contemporary reporting, not an assumed JPress mirror or a tile-scraping pipeline. No image downloads tested.

**Internet Archive.** The live API query `title:(Davar) AND mediatype:texts`, `rows=2`, returned `numFound=37`; one result was an unrelated nineteenth-century book and another [Davar 1974](https://archive.org/details/Davar1974IsraelHebrew). Its [metadata API](https://archive.org/metadata/Davar1974IsraelHebrew) returned 200, listing ABBYY OCR and per-issue `_djvu.txt`, PDFs and JP2-related derivatives. A sample file entry was `Apr 01 1974, דבר (Davar), #14951, Israel (he)_djvu.txt`, size 442,580 bytes. No licence URL or institutional publisher provenance appeared in the inspected item metadata. Public metadata access was verified; legitimacy of redistributing its newspaper files was not.

Narrow date discovery:

```http
GET https://archive.org/advancedsearch.php?q=title%3A%28Davar%29%20AND%20title%3A%281959%29%20AND%20mediatype%3Atexts&fl%5B%5D=identifier&fl%5B%5D=title&rows=2&output=json
HTTP 200
{"response":{"numFound":0,"start":0,"docs":[]}}
```

A broader multi-title/year exploratory query returned nonzero results but used a malformed field-list encoding, so its empty projected objects do not identify relevant issues; it is excluded from the conclusions. A zero title/year query also cannot prove corpus-wide absence. The [IA terms page](https://archive.org/about/terms.php) returned a JavaScript application shell, not readable terms in the inspected response. No general newspaper reuse permission is claimed. If an authorized item is later confirmed, use `/metadata/{identifier}` to select **one exact file name**, then `/download/{identifier}/{URL-encoded-filename}`; those file downloads were not tested. Do not use borrow-only, login-required or restricted derivatives. A verified publisher-authorized mirror or rights confirmation is still needed before recommending IA newspaper files as the project's bulk source.

## Recommended handoff for future research agents

1. **Identify the round first.** Distinguish initial post-election consultations from a later failed mandate, resignation or mid-term replacement. In 1949 the presidency and first Knesset were being constituted; do not mechanically assume later timing rules. Record election, president, consultation window, mandate recipient/date and exact source scope separately.
2. **Use the working metadata routes.** Query ISA's CKAN catalogue by president/reference and formation terms; retain the returned reference, signature, dates, description and exposure status. Use Knesset OData to find sessions in the relevant window and follow returned document links. Try government formation extracts for chronology. Narrow queries before considering the large CSV.
3. **Read a primary record for each claim.** A catalogue description is a file lead. A mandate statement establishes the recipient, not every recommendation. Capture party, recommended person/abstention, consultation date, round, printed page/scan page and brief supporting text. Preserve uncertainty rather than infer from coalition membership or confidence votes.
4. **For newspapers, use approved access.** Wait for NLI's supported API/export answer, request individual scans, or have the owner read through lawful institutional access. Request Davar 8–9 December 1959 plus consultation dates preceding the mandate; use `התייעצויות הנשיא`, `נשיא המדינה`, `בן-צבי`, `הטיל`, `הרכבת הממשלה`, party names and spelling variants. OCR discovery misses are not absence evidence. NLI's scan-order/reference links are available from its [developer/services landing page](https://www.nli.org.il/en/research-and-teach/open-library); no order was placed.
5. **Treat logo evidence separately.** Need an actual election advertisement scan, date, page, issuer and crop coordinates, plus applicable reuse terms. OCR can locate an advertisement but cannot establish the design. A ballot letter, newspaper masthead or illustration is not automatically a party emblem. Do not reconstruct an unavailable image.
6. **Keep a small reproducible record.** Record stable source URL/ID, access date, API parameters/version, relevant response fields, document hash and page citation. Keep raw retrievals/caches under `.backup-scratch/`; preserve accepted evidence and unique rights correspondence durably when received. Do not retain secret-bearing URLs. No new automation or harvest service is implemented by this report.

Owner actions outstanding: NLI API signup and access/export clarification; newspaper edition/rights confirmation including any public logo crops; ISA scan-copy or supported machine-access request using the now-discoverable file metadata. All are requests to make, not approvals already obtained.

## Compact claim/conclusion ledger

All entries accessed 2026-11-05. Publication/effective dates are unknown unless stated. Each family below represents one underlying service/document family, not independent corroboration merely because several URLs expose it. HTTP results describe this network/time, not universal availability. Search page counts and total underlying archive coverage were not measured.

| Claim | Source identity/kind; publisher; access/depth | Family / support and limits |
|---|---|---|
| C1: NLI advertises Search, IIIF, signup | [Developer page](https://www.nli.org.il/en/research-and-teach/open-library), official web page; web tool opened/read; signup form opened | NLI interfaces; documented existence only |
| C2: JPress Search/Image patterns are published | Search/common-usage/Presentation/Image links above, official web pages; indexed text only, full fetches denied | Same NLI interface family; provisional syntax, no live JPress payload |
| C3: tested NLI access failed | Exact Search, Davar-page and map-manifest requests above; official HTTP responses, custom-UA live, headers/body read | NLI access observation; challenge/403 limits, no authentication or coverage verdict |
| C4: selected backend exports have research precedent | [OMILab README](https://github.com/omilab/2022_OCR_Pipeline), researcher repository; web tool opened/read | OMILab partnership; author's report, not a current public export offer |
| C5: ISA publishes usable catalogue metadata | [CKAN package](https://data.gov.il/dataset/israel-state-archives-catalog) and three catalogue-query responses above, official dataset; live JSON read | ISA catalogue dataset; 2024 resource timestamp vs 2026 metadata remains unresolved |
| C6: ISA catalogue/main deny tested access | Two root responses above, official service responses; custom-UA live, read | ISA access observation; says nothing about absence of an official internal API |
| C7: historical Knesset session/document APIs work | v3/v4 schemas, session, agenda and document requests above, official database results; live XML/JSON read | Knesset parliamentary service; small 1959 sample, no all-year completeness claim |
| C8: official primary PDFs are downloadable | Two exact PDFs and hashes above, official files; live bytes and extracted text inspected | Two distinct primary documents; government-nine text supports chronology, not party recommendations |
| C9: no verified newspaper mirror established | TAU DNS observation; Google index/terms; IA search/metadata; GitHub API/DATA.md responses above, live inspected; IA terms shell only | Separate host observations, but copies of a newspaper would still be one underlying newspaper evidence family; rights/coverage unresolved |
| C10: coverage and terms need edition checks | NLI title/help/reference pages linked above, official web pages; indexed only | NLI newspaper catalogue; conflicts explicitly retained; retrieval/rights must be confirmed before use |

| Conclusion / criterion | Claim mapping | Confidence, gaps and what would change it |
|---|---|---|
| Working keyless discovery for ISA files: **pass** | Supports C5; context C6 | High for tested queries; scan retrieval requires separate evidence |
| Working historical Knesset primary-document path: **pass** | Supports C7–C8 | High for two PDFs/1959 examples; untested years and context-dependent site denials remain |
| Ready-to-use JPress OCR/image/bulk pipeline: **unresolved** | Supports intended capability C1–C2; contrary operational evidence C3; context C4, C10 | High confidence that it was not demonstrated here; successful approved keyed issue query, manifest/image/OCR payload and terms would change status |
| A legitimate complete alternative mirror for 1949–1992: **unresolved** | Context C9–C10 | No verified rights-cleared target corpus; an authorized publisher/institution export with issue inventory and terms would change status |
| Mandate recipient/date implies every party recommendation: **fail** | Contrary C8; context C5 | Primary evidence has narrower scope; only consultation transcripts or explicit contemporary reporting can supply the missing party-level facts |
