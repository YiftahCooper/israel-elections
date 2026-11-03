// Curated per-candidate notes (data/meta/candidate-notes.json, decision 0088): a corrected display name
// where the candidate notice misprints it, and replacements before the Knesset's first sitting. They
// never change who is seated; the build fails if a note names a candidate that does not exist.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ElectionDataset } from '../../../src/data/schema.ts';

interface Note { candidateId: string; displayNameHe?: string; en: string; he: string; sources: string[] }
const FILE = join(import.meta.dirname, '..', '..', '..', 'data', 'meta', 'candidate-notes.json');
let cache: Note[] | null = null;
const notes = () => (cache ??= (JSON.parse(readFileSync(FILE, 'utf8')) as { notes: Note[] }).notes);

export function applyCandidateNotes(ds: ElectionDataset): ElectionDataset {
  const mine = notes().filter((n) => n.candidateId.startsWith(`${ds.knesset}-`));
  if (!mine.length) return ds;
  const found = new Set<string>();
  const lists = ds.lists.map((l) => ({
    ...l,
    candidates: l.candidates.map((c) => {
      const n = mine.filter((x) => x.candidateId === c.id);
      if (!n.length) return c;
      found.add(c.id);
      const name = n.find((x) => x.displayNameHe)?.displayNameHe;
      return { ...c, ...(name ? { displayNameHe: name } : {}), notes: n.map(({ en, he }) => ({ en, he })) };
    }),
  }));
  const missing = mine.filter((n) => !found.has(n.candidateId));
  if (missing.length) throw new Error(`candidate-notes.json: no candidate ${missing.map((n) => n.candidateId).join(', ')} in ${ds.id}`);
  return { ...ds, lists };
}
