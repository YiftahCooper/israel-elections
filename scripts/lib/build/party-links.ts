// Election-specific sources; no network access at build time (decision 0093).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ElectionDataset, PartyLink } from '../../../src/data/schema.ts';

const ROOT = join(import.meta.dirname, '..', '..', '..');
export interface PartyLinksOverlay {
  electionId: string;
  lists: Record<string, PartyLink[]>;
  parties: Record<string, PartyLink[]>;
}
const TYPES = ['party-site', 'platform', 'ephemera', 'party-newspaper', 'repo-scan', 'knesset', 'hewiki', 'cec', 'academic'];
export function validatePartyLink(value: unknown): asserts value is PartyLink {
  const e = value as PartyLink;
  if (!e || !['partisan', 'neutral'].includes(e.kind) || !TYPES.includes(e.sourceType) ||
      !['high', 'medium'].includes(e.confidence) || typeof e.publisher !== 'string' || !e.publisher.trim()) throw new Error('Invalid party link metadata');
  let u: URL;
  try { u = new URL(e.url); } catch { throw new Error('Party links require an https URL'); }
  if (u.protocol !== 'https:' || u.username || u.password || /\s/.test(e.url)) throw new Error('Party links require an https URL');
  if (/en\.(m\.)?wikipedia\.org/i.test(decodeURIComponent(e.url))) throw new Error('English Wikipedia is never linked');
  if (e.archivedAt !== undefined && (!/^\d{4}-\d{2}-\d{2}(T.*Z)?$/.test(e.archivedAt) || !Number.isFinite(Date.parse(e.archivedAt)))) throw new Error('Invalid party link capture/issue date');
  for (const title of [e.titleHe, e.titleEn]) if (title !== undefined && typeof title !== 'string') throw new Error('Invalid party link title');
  if (e.sourceType === 'hewiki' && (e.kind !== 'neutral' || u.hostname !== 'he.wikipedia.org')) throw new Error('Hebrew Wikipedia must be a labelled neutral secondary source');
  if (['party-site', 'platform', 'ephemera', 'party-newspaper', 'repo-scan'].includes(e.sourceType) && e.kind !== 'partisan') throw new Error('Party material must be labelled partisan');
}
export function applyPartyLinks(ds: ElectionDataset, overlay?: PartyLinksOverlay): ElectionDataset {
  const file = join(ROOT, 'data/meta/party-links', `${ds.id}.json`);
  if (!overlay && !existsSync(file)) return ds;
  const entries = overlay ?? JSON.parse(readFileSync(file, 'utf8')) as PartyLinksOverlay;
  if (entries.electionId !== ds.id) throw new Error('Party links election mismatch');
  const ids = new Set(ds.lists.map((l) => l.id));
  const parties = new Set(ds.lists.flatMap((l) => l.parties?.map((p) => p.id) ?? []));
  for (const [table, known] of [[entries.lists, ids], [entries.parties, parties]] as const) {
    for (const [id, links] of Object.entries(table)) {
      if (!known.has(id)) throw new Error(`data/meta/party-links/${ds.id}.json: unknown id ${id}`);
      if (!Array.isArray(links)) throw new Error(`Invalid party links: ${id}`);
      links.forEach(validatePartyLink);
    }
  }
  return { ...ds, lists: ds.lists.map((l) => ({ ...l,
    ...(entries.lists[l.id]?.length ? { links: structuredClone(entries.lists[l.id]) } : {}),
    ...(l.parties ? { parties: l.parties.map((p) => ({ ...p,
      ...(entries.parties[p.id]?.length ? { links: structuredClone(entries.parties[p.id]) } : {}) })) } : {}),
  })) };
}
