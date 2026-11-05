// Regenerate from the retained official Knesset OData captures. SiteId is the member-page id.
import { readFileSync, writeFileSync } from 'node:fs';
const read = (file: string) => JSON.parse(readFileSync(`data/raw/bios/${file}.json`, 'utf8'));
const persons = new Map<number, { FirstName: string; LastName: string }>(read('knesset-odata-persons').map((p: { PersonID: number }) => [p.PersonID, p]));
const names: Record<string, string> = {};
for (const row of read('knesset-odata-mk-site-codes')) {
  const p = persons.get(row.KnsID);
  if (p?.FirstName && p.LastName && row.SiteId) names[row.SiteId] = `${p.FirstName} ${p.LastName}`;
}
writeFileSync('src/data/candidate-display-names.json', JSON.stringify(names, null, 2) + '\n');
