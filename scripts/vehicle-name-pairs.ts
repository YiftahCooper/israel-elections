// Report only (audit c-screens-compare-04): lists that may be the same registered party stored under two ids. For every
// pair of adjacent elections, a list led by a one-election vehicle id (`vehicle-…`) whose registered Hebrew name (the
// CEC list name, or its short name) is the same as that of a list in the other election led by a party id, or by another
// vehicle id (Gil 2006 and 2009 are both stored as vehicles). The last column says whether a recorded identity relation
// (rename, merger, absorption, same organisation) already links the two. These are leads for checking against the
// Registrar of Parties, never a matching rule: the app pairs lists only from party records.
// Run: node scripts/vehicle-name-pairs.ts > report.md
import { readFileSync } from 'node:fs';
import { compileHistoryRuntime } from './party-history-runtime.ts';

type DsList = { id: string; nameHe: string; shortHe: string; shortEn: string | null; votes: number; withdrawn?: boolean; candidates?: { nameHe: string }[] };
const runtime = compileHistoryRuntime();
// the recorded identity links (data/meta/party-lineage.json), as groups of ids that are one party's history
type Edge = { relation?: string; from?: string[]; to?: string[] };
const lineage = JSON.parse(readFileSync('data/meta/party-lineage.json', 'utf8')) as { edges: Edge[] };
const parent = new Map<string, string>();
const find = (x: string): string => { while (parent.has(x) && parent.get(x) !== x) x = parent.get(x)!; return x; };
for (const e of lineage.edges) if (['renamed-to', 'merged-into', 'absorbed-into', 'same-organisation'].includes(e.relation ?? ''))
  for (const a of e.from ?? []) for (const b of e.to ?? []) parent.set(find(a), find(b));
const dataset = (id: string) => JSON.parse(readFileSync(`public/data/${id}.json`, 'utf8')) as { lists: DsList[] };
// spelling only: quotes, geresh, gershayim, dashes and spaces never tell two names apart
const norm = (s: string) => s.replace(/[״"׳'\s–—-]/g, '');

interface Row { election: string; id: string; lead: string; nameHe: string; shortHe: string; shortEn: string | null; first: string; votes: number }
const rowsOf = (i: number): Row[] => {
  const e = runtime.elections[i];
  const ds = new Map(dataset(e.id).lists.map((l) => [l.id, l]));
  return e.lists.map(([id, votes, , , shortHe, shortEn, , lead]) => {
    const d = ds.get(id);
    return { election: e.id, id, lead: lead ?? '', nameHe: d?.nameHe ?? shortHe, shortHe, shortEn, first: d?.candidates?.[0]?.nameHe ?? '', votes };
  });
};
const year = (i: number) => runtime.elections[i].date.slice(0, 7);
const cell = (r: Row) => `${r.id} · ${r.shortHe}${r.shortEn ? ` (${r.shortEn})` : ''} · lead \`${r.lead}\` · #1 ${r.first || '—'} · ${r.votes.toLocaleString('en-GB')} votes`;

const out: string[] = ['| Elections | Vehicle-led list | Other list (party or vehicle) | Same | Linked already |', '|---|---|---|---|---|'];
const isVehicle = (r: Row) => r.lead.startsWith('vehicle-');
for (let i = 1; i < runtime.elections.length; i++) {
  const a = rowsOf(i - 1), b = rowsOf(i);
  for (const [vs, ps, vi, pi] of [[a, b, i - 1, i], [b, a, i, i - 1]] as const) {
    // a vehicle with a party-led list, either way round; two vehicles once (the earlier one first)
    for (const v of vs.filter(isVehicle)) for (const p of ps.filter((x) => x.lead && (!isVehicle(x) || vi < pi))) {
      const same = norm(v.nameHe) === norm(p.nameHe) ? 'registered name' : norm(v.shortHe) === norm(p.shortHe) ? 'short name' : '';
      if (same) out.push(`| ${year(vi)} ↔ ${year(pi)} | ${cell(v)} | ${cell(p)} | ${same} | ${find(v.lead) === find(p.lead) ? 'yes' : 'no'} |`);
    }
  }
}
console.log(out.join('\n'));
