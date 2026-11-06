/** PYTHONPATH=.backup-scratch/python node scripts/build-locality-map.ts */
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { decodeCBSGrid, itmToWgs84, type LocalityLocation } from '../src/data/locality-coordinates.ts';
import { localityLocationKey } from '../src/data/locality-location-key.ts';
import { isEnvelopeRow, type LocalityDataset } from '../src/data/schema.ts';
import { hebrewNameKey, resolveLocalityEnglish, resolveLocalityCode, type LocalityNames } from '../src/data/locality-names.ts';
// Results spellings that CBS writes differently; the English name is still CBS's.
const HEBREW_SPELLING: Record<string, string> = { 'עופרה': 'עפרה' };
// Rows in no retained CBS list. Written here in CBS transliteration style, from the CBS English of the locality they
// merged into where one exists; the interface labels them as project transliterations.
const PROJECT_ENGLISH: Record<string, string> = {
  'חברון': 'Hebron',
  'גבעת עדה': "Giv'at Ada", // merged into Binyamina-Giv'at Ada
  'גני יהודה': 'Gane Yehuda', // merged into Savyon
  'נווה אפרים': 'Newe Efrayim', // merged into Yehud-Newe Efrayim
  'מכבים-רעות': "Makkabbim-Re'ut", // merged into Modi'in-Makkabbim-Re'ut
  'צור יגאל': "Zur Yig'al", // merged into Kokhav Ya'ir
  'צורן': 'Zoran', // merged into Zoran-Qadima
  'שושנת העמקים (רסק': 'Shoshannat HaAmaqim (Rassco)', // name truncated in the 2006 results file
};
// Evident CBS typos, corrected from the same CBS list: code 1346 has the ayin apostrophe at the start, while its
// tribe entry (code 970) writes "Tarabin as-Sani'".
const CBS_ENGLISH_FIXES: Record<string, string> = { "'Tarabin as-Sani": "Tarabin as-Sani'" };
const projectEnglish = new Map(Object.entries(PROJECT_ENGLISH).map(([he, en]) => [hebrewNameKey(he), en]));
const python = spawnSync('python3', ['scripts/locality-map-cbs.py'], {encoding:'utf8',maxBuffer:10_000_000});
if (python.status !== 0) throw new Error(python.stderr);
const records = JSON.parse(python.stdout) as (LocalityLocation & {grid: unknown})[];
const coverage: Record<string, {placed:number;localities:number;envelopes:number}> = {};
for (const file of readdirSync('public/data').filter(f => /^k\d+-localities.json$/.test(f))) {
  const data = JSON.parse(readFileSync(`public/data/${file}`, 'utf8')) as LocalityDataset;
  const election = JSON.parse(readFileSync(`public/data/${data.id}.json`, 'utf8'));
  const year = Number(election.electionDate.slice(0,4));
  const locations: Record<string, LocalityLocation> = {};
  for (const [index, row] of data.rows.entries()) {
    if (isEnvelopeRow(row)) continue;
    const code = row.code ?? (data.id === 'k17' ? resolveLocalityCode(HEBREW_SPELLING[row.nameHe.trim()] ?? row.nameHe, records) : null);
    if (code === null) continue;
    const candidates = records.filter(r => r.code === code).sort((a,b) => Math.abs(a.year-year)-Math.abs(b.year-year) || a.year-b.year);
    for (const r of candidates) {
      const grid = decodeCBSGrid(r.grid); if (!grid) continue;
      try {
        const p = itmToWgs84(...grid);
        locations[localityLocationKey(row, index)] = {...p, code:r.code, nameHe:r.nameHe.trim(), nameEn:r.nameEn.trim(), aliases:[...new Set(candidates.flatMap(x=>[x.nameHe,...x.aliases]).map(x=>x.trim()))], year:r.year};
        break;
      } catch { /* No plausible source coordinate; never invent a position. */ }
    }
  }
  coverage[data.id] = {placed:data.rows.filter((r,i)=>!isEnvelopeRow(r)&&locations[localityLocationKey(r,i)]).length,localities:data.rows.filter(r=>!isEnvelopeRow(r)).length,envelopes:data.rows.filter(isEnvelopeRow).length};
  writeFileSync(`public/data/${data.id}-locations.json`, JSON.stringify(locations)+'\n');
  const names: LocalityNames = { names: [], project: [] };
  data.rows.forEach((row, i) => {
    if (isEnvelopeRow(row)) { names.names.push(''); return; }
    const cbs = resolveLocalityEnglish({ ...row, nameHe: HEBREW_SPELLING[row.nameHe.trim()] ?? row.nameHe }, year, records);
    const project = cbs ? null : projectEnglish.get(hebrewNameKey(row.nameHe));
    if (!cbs && !project) throw new Error(`No English name for ${data.id} row ${i} ${row.nameHe}`);
    names.names.push(cbs ? CBS_ENGLISH_FIXES[cbs] ?? cbs : project!);
    if (!cbs) names.project.push(i);
  });
  writeFileSync(`public/data/${data.id}-locality-names.json`, JSON.stringify(names)+'\n');
}
writeFileSync('public/data/locality-map-coverage.json', JSON.stringify(coverage,null,2)+'\n');
console.log(coverage);
