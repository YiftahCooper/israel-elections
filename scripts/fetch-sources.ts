// Downloads every programmatically retrievable primary source into data/raw/ and records
// provenance (URL, retrieval time, byte size, SHA-256, publisher) in data/raw/SOURCES.json.
//
//   node scripts/fetch-sources.ts            # fetch everything missing
//   node scripts/fetch-sources.ts --refresh  # re-download everything (e.g. after certification)
//
// Sources that cannot be fetched by script (gov.il HTML pages answer automated clients with
// HTTP 403) were captured manually; they are listed in MANUAL_SOURCES and kept in the manifest.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const RAW = join(ROOT, 'data', 'raw');
const MANIFEST = join(RAW, 'SOURCES.json');
const refresh = process.argv.includes('--refresh');
const UA = 'israel-elections-explorer/0.1 (+https://github.com/YiftahCooper/israel-elections)';

export interface SourceRecord {
  id: string;
  file: string; // relative to data/raw
  url: string;
  publisher: string;
  /** English publisher, where `publisher` is the Hebrew original (shown in English mode) */
  publisherEn?: string;
  official: boolean;
  description: string;
  /** English description, where `description` is a Hebrew dataset title */
  descriptionEn?: string;
  retrievedAt?: string;
  bytes?: number;
  sha256?: string;
  lastModified?: string | null;
  method: 'http' | 'datagov-datastore-api' | 'manual-capture';
  note?: string;
}

const HTTP_SOURCES: Omit<SourceRecord, 'method'>[] = [
  {"id": "k26-candidates-gazette", "file": "k26/yp15023-candidates.pdf", "url": "https://olaw.org.il/yalkut/yalkut-15023.pdf", "publisher": "רשומות / ועדת הבחירות המרכזית — ילקוט הפרסומים 15023 (13.10.2026)", "publisherEn": "Reshumot / Central Elections Committee — Yalkut HaPirsumim 15023 (13 Oct 2026)", "official": true, "description": "Official published candidate lists; reviewed בי p.834, כן p.851; submitting parties זך p.848, רץ p.862, צבי p.859.", "note": "Official publication retrieved from the public mirror olaw.org.il, not a government host. Government-path attempt returned HTTP 404; no official-host byte comparison. PDF pages 8, 25, 22, 36, 33 respectively."},
  { id: 'pm2001-gazette', file: 'pm/yp4960.pdf', url: 'https://olaw.org.il/yalkut/yalkut-4960.pdf', publisher: 'CEC / Reshumot, YP 4960 p.1628 (public mirror)', official: true, description: '2001 PM-only official notice on a disclosed non-government mirror' },
  { id: 'pm1999-idi-totals', file: 'pm/1999-idi.pdf', url: 'https://www.idi.org.il/media/5026/%D7%91%D7%97%D7%99%D7%A8%D7%95%D7%AA_%D7%9E%D7%91%D7%95%D7%90.pdf', publisher: 'Israel Democracy Institute', official: false, description: 'Secondary PM invalid/cast totals, printed p.8 / PDF p.7' },
  {
    id: 'k26-ballots-csv', file: 'k26/expb.csv', url: 'https://media26.bechirot.gov.il/files/expb.csv',
    publisher: 'ועדת הבחירות המרכזית לכנסת ה-26', publisherEn: 'Central Elections Committee for the 26th Knesset', official: true,
    description: '26th Knesset results by polling station (קלפי), final count before publication in Reshumot',
  },
  {
    id: 'k26-localities-csv', file: 'k26/expc.csv', url: 'https://media26.bechirot.gov.il/files/expc.csv',
    publisher: 'ועדת הבחירות המרכזית לכנסת ה-26', publisherEn: 'Central Elections Committee for the 26th Knesset', official: true,
    description: '26th Knesset results by locality (יישוב)',
  },
  {
    id: 'k26-surplus-gazette', file: 'k26/yp15045-surplus.pdf', url: 'https://www.gov.il/BlobFolder/guide/candidates-lists-26/he/yp15045.pdf',
    publisher: 'רשומות — ילקוט הפרסומים 15045 (19.10.2026), עמ׳ 1098', publisherEn: 'Reshumot — Yalkut HaPirsumim 15045 (19 Oct 2026), p. 1098', official: true,
    description: 'Notice of surplus-vote agreements (התקשרות בין רשימות) for the 26th Knesset, section 67(c)',
  },
  {
    id: 'k25-national-html', file: 'k25/nationalresults.html', url: 'https://votes25.bechirot.gov.il/nationalresults',
    publisher: 'ועדת הבחירות המרכזית לכנסת ה-25', publisherEn: 'Central Elections Committee for the 25th Knesset', official: true,
    description: '25th Knesset official final national results: list names, letters, seats, votes, totals',
  },
  {
    id: 'k25-candidates-gazette', file: 'k25/yp10852-candidates.pdf',
    url: 'https://www.gov.il/BlobFolder/guide/election-committee-history/ar/history_election-dates_records_dandidates25.pdf',
    publisher: 'רשומות — ילקוט הפרסומים 10852 (20.10.2022), עמ׳ 292 ואילך', publisherEn: 'Reshumot — Yalkut HaPirsumim 10852 (20 Oct 2022), p. 292 ff.', official: true,
    description: '25th Knesset approved candidate lists published under section 65',
  },
  {
    id: 'k25-surplus-press', file: 'k25/cec-press-surplus-2022-10-23.pdf',
    url: 'https://www.gov.il/BlobFolder/news/dover41/he/press-releases_dover41.pdf',
    publisher: 'ועדת הבחירות המרכזית — הודעה לעיתונות 23.10.2022', publisherEn: 'Central Elections Committee — press release, 23 Oct 2022', official: true,
    description: 'CEC press release listing the surplus-vote agreements filed for the 25th Knesset',
  },
];

const DATASTORE_SOURCES: Omit<SourceRecord, 'method'>[] = [
  {
    id: 'k25-ballots-datagov', file: 'k25/ballots.datagov.json',
    url: 'https://data.gov.il/api/3/action/datastore_search?resource_id=cc223336-07bc-485d-b160-62df92967c0a',
    publisher: 'ועדת הבחירות המרכזית via data.gov.il (dataset votes-knesset)', publisherEn: 'Central Elections Committee via data.gov.il (dataset votes-knesset)', official: true,
    description: '25th Knesset final results by polling station',
  },
  {
    id: 'k25-localities-datagov', file: 'k25/localities.datagov.json',
    url: 'https://data.gov.il/api/3/action/datastore_search?resource_id=b392b8ee-ba45-4ea0-bfed-f03a1a36e99c',
    publisher: 'ועדת הבחירות המרכזית via data.gov.il (dataset votes-knesset)', publisherEn: 'Central Elections Committee via data.gov.il (dataset votes-knesset)', official: true,
    description: '25th Knesset final results by locality',
  },
];

export const MANUAL_SOURCES: SourceRecord[] = [
  {
    id: 'k26-list-pages', file: 'k26/govil-list-pages.exa.json', method: 'manual-capture',
    url: 'https://www.gov.il/he/pages/candidates-lists-26 (38 per-list pages)',
    publisher: 'ועדת הבחירות המרכזית לכנסת ה-26 (gov.il)', publisherEn: 'Central Elections Committee for the 26th Knesset (gov.il)', official: true,
    description: 'Official per-list pages: list name, letters, sponsoring parties, full ranked roster, per-candidate party, resignations',
    note: 'gov.il returns HTTP 403 to scripted clients; captured on 2026-11-03 through the Exa page-fetch service, whose text extraction is stored verbatim. Each page carries its own "תאריך עדכון". Two pages (בי, כן) failed to render; their rosters now use the reviewed official publication k26-candidates-gazette.',
  },
  {
    id: 'k26-secondary-fyi', file: 'k26/secondary/', method: 'manual-capture',
    url: 'https://bechirot.fyi/lists/26/בי and /lists/26/כן',
    publisher: 'bechirot.fyi (independent; transcribes the official CEC pages)', official: false,
    description: 'Retained former fallback transcriptions for צומת בית ישראל (בי) and כחול לבן (כן); superseded as roster evidence by k26-candidates-gazette',
  },
  {
    id: 'k26-national-snapshot', file: '', method: 'manual-capture',
    url: 'https://cdn-votes26.bechirot.gov.il/',
    publisher: 'ועדת הבחירות המרכזית לכנסת ה-26', publisherEn: 'Central Elections Committee for the 26th Knesset', official: true,
    description: 'Official results site. Refuses connections from outside Israel; a cached early-count snapshot was read only to confirm the list-name/letter mapping and the statement that final results will be published in Reshumot by 4 Nov 2026. No vote figures are taken from it.',
  },
  {
    id: 'law-elections', file: '', method: 'manual-capture',
    url: 'https://main.knesset.gov.il/Activity/Legislation/Laws/pages/lawbill.aspx?t=lawreshumot&lawitemid=488120',
    publisher: 'חוק הבחירות לכנסת [נוסח משולב], התשכ"ט-1969', publisherEn: 'Knesset Elections Law [Consolidated Version], 5729–1969', official: true,
    description: 'Sections 81–83 (threshold, general quota, Bader–Ofer, surplus agreements, lottery tie-break). Text quoted in docs/ELECTORAL-LAW.md.',
  },
];

function sha256(buf: Buffer) { return createHash('sha256').update(buf).digest('hex'); }

async function fetchHttp(src: Omit<SourceRecord, 'method'>): Promise<SourceRecord> {
  const res = await fetch(src.url, { signal: AbortSignal.timeout(60000), headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${src.url}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const head = buf.subarray(0, 200).toString('utf8');
  if (/<title>\s*שגיאה|ERROR: The request could not be satisfied/.test(head)) throw new Error(`${src.url}: error page returned`);
  const out = join(RAW, src.file);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, buf);
  return { ...src, method: 'http', retrievedAt: new Date().toISOString(), bytes: buf.length, sha256: sha256(buf), lastModified: res.headers.get('last-modified') };
}

async function fetchDatastore(src: Omit<SourceRecord, 'method'>): Promise<SourceRecord> {
  const records: unknown[] = [];
  let fields: unknown = null;
  let total = Infinity;
  for (let offset = 0; offset < total; offset += 5000) {
    const res = await fetch(`${src.url}&limit=5000&offset=${offset}`, { signal: AbortSignal.timeout(60000), headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`${src.url}: HTTP ${res.status}`);
    const json = (await res.json()) as any;
    if (!json.success) throw new Error(`${src.url}: API error`);
    total = json.result.total;
    fields = json.result.fields;
    records.push(...json.result.records);
  }
  if (records.length !== total) throw new Error(`${src.url}: expected ${total} records, got ${records.length}`);
  const buf = Buffer.from(JSON.stringify({ fields, records }, null, 0));
  const out = join(RAW, src.file);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, buf);
  return { ...src, method: 'datagov-datastore-api', retrievedAt: new Date().toISOString(), bytes: buf.length, sha256: sha256(buf), lastModified: null };
}

const previous: SourceRecord[] = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : [];
const byId = new Map(previous.map((s) => [s.id, s]));

// Discover resource IDs from the official catalogue rather than assuming download filenames.
const catalogue: Omit<SourceRecord, 'method'> = {
  id: 'datagov-catalogue', file: 'votes-knesset.catalogue.json',
  url: 'https://data.gov.il/api/3/action/package_show?id=votes-knesset',
  publisher: 'data.gov.il / Central Elections Committee', official: true,
  description: 'Catalogue of official election result resources, including original XLS resources',
};
if (refresh || !existsSync(join(RAW, catalogue.file))) byId.set(catalogue.id, await fetchHttp(catalogue));
const resources = JSON.parse(readFileSync(join(RAW, catalogue.file), 'utf8')).result.resources;
for (let n = 16; n <= 24; n++) {
  for (const r of resources.filter((r: any) => r.name.includes(`-${n} `))) {
    const kind = /קלפי/.test(r.name) ? 'ballots' : 'localities';
    DATASTORE_SOURCES.push({
      id: `k${n}-${kind}-datagov`,
      file: kind === 'ballots' ? `../../.backup-scratch/raw/k${n}/ballots.datagov.json` : `k${n}/localities.datagov.json`,
      url: `https://data.gov.il/api/3/action/datastore_search?resource_id=${r.id}`,
      publisher: 'Central Elections Committee via data.gov.il', official: true, description: r.name,
      descriptionEn: `Final results of the election to the ${n}${n === 21 ? 'st' : n === 22 ? 'nd' : n === 23 ? 'rd' : 'th'} Knesset by ${kind === 'ballots' ? 'polling station' : 'locality'} (dataset title translated)`,
    });
  }
  HTTP_SOURCES.push({
    id: `k${n}-candidates-gazette`, file: `k${n}/candidates.pdf`,
    url: 'https://www.gov.il/BlobFolder/guide/election-committee-history/he/' +
      (n <= 20 ? `knesset${n}-cand.pdf` : encodeURIComponent(`ילקוט הפרסומים-${({21:8168,22:8420,23:8698,24:9476} as Record<number, number>)[n]}.pdf`)),
    publisher: 'Central Elections Committee / Reshumot', official: true, description: `Knesset ${n} registered candidate lists`,
  });
  if (n <= 20) HTTP_SOURCES.push({
    id: `k${n}-results-gazette`, file: `k${n}/results.pdf`,
    url: `https://www.gov.il/BlobFolder/guide/election-committee-history/he/knesset${n}-results.pdf`,
    publisher: 'Central Elections Committee / Reshumot', official: true, description: `Knesset ${n} gazetted national results`,
  });
  if (n >= 21) HTTP_SOURCES.push({
    id: `k${n}-national-html`, file: `k${n}/nationalresults.html`,
    url: `https://votes${n}.bechirot.gov.il/nationalresults`, publisher: 'Central Elections Committee',
    official: true, description: `Knesset ${n} final national results`,
  });
}
// Retain regeneration for primary gazettes located during research (including mirror URLs).
for (const source of previous.filter(s => /^k(1[6-9]|2[0-4])-surplus-gazette$/.test(s.id))) {
  const { method: _method, ...http } = source; HTTP_SOURCES.push(http);
}
const persist = () => writeFileSync(MANIFEST, JSON.stringify([...byId.values()], null, 2) + '\n');
const failures: string[] = [];
for (const src of HTTP_SOURCES) {
  if (!refresh && existsSync(join(RAW, src.file)) && byId.get(src.id)?.sha256) continue;
  try { byId.set(src.id, await fetchHttp(src)); persist(); } catch (e) { failures.push(`${src.id}: ${e}`); byId.set(src.id, { ...src, method: 'manual-capture', note: `Download failed; no data inferred: ${e}` }); persist(); console.error(String(e)); continue; }
  console.log('fetched', src.id);
}
for (const src of DATASTORE_SOURCES) {
  if (!refresh && existsSync(join(RAW, src.file)) && byId.get(src.id)?.sha256) continue;
  try { byId.set(src.id, await fetchDatastore(src)); persist(); } catch (e) { failures.push(`${src.id}: ${e}`); byId.set(src.id, { ...src, method: 'manual-capture', note: `Download failed; no data inferred: ${e}` }); persist(); console.error(String(e)); continue; }
  console.log('fetched', src.id);
}
for (const m of MANUAL_SOURCES) {
  const prev = byId.get(m.id);
  const rec: SourceRecord = { ...m, retrievedAt: prev?.retrievedAt ?? '2026-11-03' };
  if (m.file && existsSync(join(RAW, m.file)) && !m.file.endsWith('/')) {
    const buf = readFileSync(join(RAW, m.file));
    rec.bytes = buf.length; rec.sha256 = sha256(buf);
  }
  byId.set(m.id, rec);
}
writeFileSync(MANIFEST, JSON.stringify([...byId.values()], null, 2) + '\n');
console.log('manifest written:', byId.size, 'sources');

if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
