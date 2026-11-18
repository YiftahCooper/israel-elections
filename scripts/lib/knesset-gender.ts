import { readFileSync } from 'node:fs';
/** 'f' or 'm' as the Knesset's own person record gives it (KNS_Person GenderDesc, data/raw/bios/knesset-person-gender.json),
 *  or null for anyone it does not list. Gendered wording about a person comes only from this: never from a name. */
export type Gender = 'f' | 'm' | null;
export function knessetGender(root: string): (personId: number) => Gender {
  const doc = JSON.parse(readFileSync(`${root}/data/raw/bios/knesset-person-gender.json`, 'utf8')) as { female: number[]; male: number[] };
  const f = new Set(doc.female), m = new Set(doc.male);
  return (id) => f.has(id) ? 'f' : m.has(id) ? 'm' : null;
}
