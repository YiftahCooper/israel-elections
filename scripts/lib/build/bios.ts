// Candidate biography links (data/meta/bios/kNN.json): the official Knesset member page, Hebrew
// Wikipedia (a labelled secondary source) and the party's own page, archived from the campaign where
// possible. Identities were matched by official ids or explicit rules (docs/research/candidate-bios.md);
// the build only attaches them and fails on an id that is not in the roster.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { CandidateBio, ElectionDataset } from '../../../src/data/schema.ts';

const ROOT = join(import.meta.dirname, '..', '..', '..');
interface Entry {
  knesset?: { url: string } | null; hewiki?: { title: string; url: string } | null;
  party?: { url: string; publisher?: string; archivedAt?: string | null; kind?: string } | null; confidence: 'high' | 'medium';
}

export function applyBios(ds: ElectionDataset): ElectionDataset {
  const file = join(ROOT, 'data', 'meta', 'bios', `${ds.id}.json`);
  if (!existsSync(file)) return ds;
  const bios = (JSON.parse(readFileSync(file, 'utf8')) as { candidates: Record<string, Entry> }).candidates;
  const ids = new Set(ds.lists.flatMap((l) => l.candidates.map((c) => c.id)));
  const unknown = Object.keys(bios).filter((id) => !ids.has(id));
  if (unknown.length) throw new Error(`data/meta/bios/${ds.id}.json: not in the roster: ${unknown.slice(0, 5).join(', ')}`);
  const bioOf = (e: Entry): CandidateBio | null => {
    const b: CandidateBio = {
      ...(e.knesset?.url ? { knesset: e.knesset.url } : {}),
      ...(e.hewiki?.url ? { hewiki: { title: e.hewiki.title, url: e.hewiki.url } } : {}),
      ...(e.party?.url ? { party: { url: e.party.url, ...(e.party.publisher ? { publisher: e.party.publisher } : {}), ...(e.party.archivedAt ? { archivedAt: e.party.archivedAt } : {}) } } : {}),
      ...(e.confidence === 'medium' ? { probable: true } : {}),
    };
    if (/en\.wikipedia/.test(JSON.stringify(b))) throw new Error(`data/meta/bios/${ds.id}.json: English Wikipedia is never linked`);
    return b.knesset || b.hewiki || b.party ? b : null;
  };
  return { ...ds, lists: ds.lists.map((l) => ({ ...l, candidates: l.candidates.map((c) => { const e = bios[c.id]; const b = e ? bioOf(e) : null; return b ? { ...c, bio: b } : c; }) })) };
}
