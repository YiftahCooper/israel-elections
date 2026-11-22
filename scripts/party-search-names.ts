/** Build-only compiler for the names a party is found by in search boxes (the party registry's `searchNames`, 22 Nov
 *  2026): other spellings and translations people type, such as "Together" or "B'Yachad" for Beyachad. They are for
 *  finding only and are never shown as the name. Only parties that have them are included, so the module stays small. */
import { readFileSync } from 'node:fs';

type Party = { id: string; searchNames?: unknown };

export function compileSearchNames(root = process.cwd()): Record<string, string[]> {
  const registry = JSON.parse(readFileSync(`${root}/data/meta/parties.json`, 'utf8')) as { parties: Party[] };
  const out: Record<string, string[]> = {};
  for (const p of registry.parties) {
    if (p.searchNames === undefined) continue;
    if (!Array.isArray(p.searchNames) || p.searchNames.some((n) => typeof n !== 'string' || !n.trim()))
      throw new Error(`parties.json ${p.id}: searchNames must be a list of non-empty names`);
    out[p.id] = p.searchNames as string[];
  }
  return out;
}
