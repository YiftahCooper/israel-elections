/** PYTHONPATH=.backup-scratch/python node scripts/build-locality-map.ts */
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { decodeCBSGrid, itmToWgs84, type LocalityLocation } from '../src/data/locality-coordinates.ts';
import { isEnvelopeRow, type LocalityDataset } from '../src/data/schema.ts';
const python = spawnSync('python3', ['scripts/locality-map-cbs.py'], {encoding:'utf8',maxBuffer:10_000_000});
if (python.status !== 0) throw new Error(python.stderr);
const records = JSON.parse(python.stdout) as (LocalityLocation & {grid: unknown})[];
const coverage: Record<string, {placed:number;localities:number;envelopes:number}> = {};
for (const file of readdirSync('public/data').filter(f => /^k\d+-localities.json$/.test(f))) {
  const data = JSON.parse(readFileSync(`public/data/${file}`, 'utf8')) as LocalityDataset;
  const election = JSON.parse(readFileSync(`public/data/${data.id}.json`, 'utf8'));
  const year = Number(election.electionDate.slice(0,4));
  const locations: Record<string, LocalityLocation> = {};
  for (const row of data.rows) {
    if (isEnvelopeRow(row) || row.code === null) continue;
    const candidates = records.filter(r => r.code === row.code).sort((a,b) => Math.abs(a.year-year)-Math.abs(b.year-year) || a.year-b.year);
    for (const r of candidates) {
      const grid = decodeCBSGrid(r.grid); if (!grid) continue;
      try {
        const p = itmToWgs84(...grid);
        locations[String(row.code)] = {...p, code:r.code, nameHe:r.nameHe.trim(), nameEn:r.nameEn.trim(), aliases:[...new Set(candidates.flatMap(x=>[x.nameHe,...x.aliases]).map(x=>x.trim()))], year:r.year};
        break;
      } catch { /* No plausible source coordinate; never invent a position. */ }
    }
  }
  coverage[data.id] = {placed:data.rows.filter(r=>!isEnvelopeRow(r)&&r.code!==null&&locations[String(r.code)]).length,localities:data.rows.filter(r=>!isEnvelopeRow(r)).length,envelopes:data.rows.filter(isEnvelopeRow).length};
  writeFileSync(`public/data/${data.id}-locations.json`, JSON.stringify(locations)+'\n');
}
writeFileSync('public/data/locality-map-coverage.json', JSON.stringify(coverage,null,2)+'\n');
console.log(coverage);
