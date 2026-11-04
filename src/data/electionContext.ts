import raw from '../../data/meta/election-context.json' with { type: 'json' };
import { ELECTION_IDS, type ElectionId } from './schema.ts';

export type Evidence = 'official' | 'secondary' | 'unresolved';
export interface ContextSource { url: string; publisher: string; publisherHe: string; evidence: Evidence; sourceId?: string; verification?: 'report-only' }
export interface ContextEvent {
  id: string; electionId: ElectionId; effectiveDate: string; contestType: 'knesset';
  type: 'institutional-identity' | 'postponement' | 'early-repeat-election' | 'government-formation' | 'pm-ballot' | 'disqualification' | 'withdrawal' | 'correction' | 'publication-status' | 'candidate-capacity' | 'membership-snapshot' | 'counting-context';
  textEn: string; textHe: string; source: ContextSource; listId?: string; relatedSources?: ContextSource[];
}
export interface SourcedCount { value: number; source: ContextSource }
export interface PMCandidate { id: string; nameEn: string; nameHe: string; status: 'final' | 'withdrawn'; votes?: SourcedCount; source?: ContextSource }
export interface PMContest {
  id: string; electionId: ElectionId; effectiveDate: string; contestType: 'parallel-pm' | 'prime-minister-only';
  noteEn?: string; noteHe?: string;
  candidates: PMCandidate[]; totals: { valid: SourcedCount; invalid: SourcedCount; cast: SourcedCount }; source: ContextSource;
}
export interface ElectionContext {
  schemaVersion: number; reviewedAt: string; events: ContextEvent[]; pmContests: PMContest[];
  ballotIndependence: { textEn: string; textHe: string; source: ContextSource };
}

/** Runtime validation at the metadata/build boundary; never feeds scenario or seat inputs. */
export function validateElectionContext(input: unknown): asserts input is ElectionContext {
  const fail = (message: string): never => { throw new Error(`Election context: ${message}`); };
  const obj = (v: unknown): Record<string, any> => v && typeof v === 'object' && !Array.isArray(v) ? v : fail('expected object');
  const text = (v: unknown) => typeof v === 'string' && v.trim() ? v : fail('missing text');
  const date = (v: unknown) => { const s = text(v); if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || new Date(s).toISOString().slice(0, 10) !== s) fail('invalid date'); };
  const source = (v: unknown) => {
    const s = obj(v); text(s.publisher); text(s.publisherHe);
    if (!['official', 'secondary', 'unresolved'].includes(s.evidence)) fail('invalid evidence');
    const u = new URL(text(s.url));
    if (!['https:', 'http:'].includes(u.protocol) || /(^|\.)en\.wikipedia\.org$/.test(u.hostname)) fail('forbidden source');
    if (u.hostname.endsWith('wikipedia.org') && (u.hostname !== 'he.wikipedia.org' || s.evidence !== 'secondary')) fail('Wikipedia must be Hebrew and secondary');
  };
  const count = (v: unknown) => { const c = obj(v); if (!Number.isSafeInteger(c.value) || c.value < 0) fail('invalid count'); source(c.source); return c.value as number; };
  const root = obj(input);
  if (root.schemaVersion !== 1) fail('unsupported schema');
  date(root.reviewedAt);
  const ids = new Set<string>();
  const common = (v: unknown) => { const e = obj(v); const id = text(e.id); if (ids.has(id)) fail('duplicate id'); ids.add(id); if (!ELECTION_IDS.includes(e.electionId)) fail('unknown election'); date(e.effectiveDate); source(e.source); return e; };
  if (!Array.isArray(root.events) || !Array.isArray(root.pmContests)) fail('missing arrays');
  for (const v of root.events) {
    const e = common(v); text(e.textEn); text(e.textHe);
    if (e.contestType !== 'knesset' || !['institutional-identity','postponement','early-repeat-election','government-formation','pm-ballot','disqualification','withdrawal','correction','publication-status','candidate-capacity','membership-snapshot','counting-context'].includes(e.type)) fail('invalid event type');
    if (e.listId && !e.listId.startsWith(`${e.electionId.slice(1)}-`)) fail('wrong list election');
    if (e.relatedSources !== undefined) { if (!Array.isArray(e.relatedSources)) fail('invalid sources'); e.relatedSources.forEach(source); }
  }
  for (const v of root.pmContests) {
    const c = common(v);
    if (c.noteEn !== undefined || c.noteHe !== undefined) { text(c.noteEn); text(c.noteHe); }
    if (!['parallel-pm','prime-minister-only'].includes(c.contestType)) fail('invalid PM contest');
    const totals = obj(c.totals); const valid = count(totals.valid);
    if (valid <= 0 || valid + count(totals.invalid) !== count(totals.cast)) fail('PM ballot totals do not reconcile');
    if (!Array.isArray(c.candidates) || c.candidates.length < 2) fail('missing candidates');
    let sum = 0; const candidates = new Set(); let finalists = 0;
    for (const value of c.candidates) {
      const p = obj(value); text(p.id); text(p.nameEn); text(p.nameHe);
      if (candidates.has(p.id)) fail('duplicate candidate'); candidates.add(p.id);
      if (p.status === 'final') { sum += count(p.votes); finalists++; }
      else if (p.status === 'withdrawn') { source(p.source); if (p.votes !== undefined) fail('withdrawn nominee cannot have finalist votes'); }
      else fail('invalid candidate status');
    }
    if (finalists < 2 || sum !== valid) fail('candidate totals do not reconcile');
  }
  const b = obj(root.ballotIndependence); text(b.textEn); text(b.textHe); source(b.source);
}
validateElectionContext(raw);
export const electionContext: ElectionContext = raw;
