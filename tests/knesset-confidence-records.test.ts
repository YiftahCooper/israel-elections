import { expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { claimCertainty } from '../scripts/lib/build/evidence.ts';
const read = (file: string) => JSON.parse(readFileSync(file, 'utf8'));
const aftermath = (k: number) => read(`data/meta/aftermath/k${k}.json`);
it('keeps the 2009 nonparticipants distinct from abstentions in both tally views', () => {
  const d = aftermath(18);
  const event = d.formation.events.find((e: any) => e.type === 'confidence-vote');
  expect(event.votes).toEqual({ for: 69, against: 45, abstain: 0 });
  expect(d.government.confidenceVote).toEqual(event.votes);
  expect(event.textEn).toContain('five MKs did not vote');
  // The report of five abstentions is a plain note on the Knesset record, never a cite supporting the tally.
  for (const cites of [event.cites, d.government.confidenceVoteCites]) {
    expect(cites.some((c: any) => /five abstentions/.test(c.quote))).toBe(false);
    expect(cites.find((c: any) => c.source === 'plenum-181874' && c.quote.includes('אין נמנעים')).note).toMatch(/five who did not vote and none abstaining/);
  }
  expect(claimCertainty(event, d.sources)).toBe('confirmed');
});
it('records the counted 1988 repeat and the later, separate 1990 votes', () => {
  const d = aftermath(12);
  expect(d.government.confidenceVote).toEqual({ for: 84, against: 19, abstain: 3 });
  const successor = d.government.changes.find((g: any) => g.number === 24);
  expect(successor.confidenceVote).toEqual({ for: 62, against: 57, abstain: 1 });
  expect(successor.individuals.find((p: any) => p.id === 'avraham-verdiger')).toMatchObject({ vote: 'abstain', certainty: 'provisional' });
});
it('does not infer the seven unknown 1984 named votes from the aggregate result', () => {
  const people = aftermath(11).government.individuals;
  expect(people).toHaveLength(7);
  for (const p of people) {
    expect(p.vote).toBe('unknown');
    expect(p.note).toContain('own vote is unknown');
  }
});
it('failed confidence-linked motions do not change continuing support or become government falls', () => {
  const events = read('data/research/knesset-events/k24.json').events;
  for (const id of ['k24-citizenship-confidence', 'k24-kahana-confidence']) {
    const e = events.find((e: any) => e.id === id);
    expect(e.kind).toBe('confidence-vote');
    expect(e.supportEffect).toBe('none-established');
    expect(e.seatsAfter).toBeNull();
    expect(e.certainty).toBe('provisional'); // Unverified cross-vote subclaims retain their own limit.
  }
});

// What a reader sees in the (i) popups: the claim-by-claim audit stays in data/research/round7/knesset
// (application-map.json, claims.jsonl), never in displayed text, and each (source, quote) is listed once.
const AUDIT = /\bC\d{3}\b|Scope:|OOXML|logical paragraph|evidence family|application-map/;
const DISPLAYED = new Set(['note', 'noteHe', 'noteEn', 'notes', 'locator', 'textEn', 'textHe', 'coalitionSeatsNote', 'resolution', 'publisher', 'publisherHe']);
function walk(o: unknown, path: string, visit: (path: string, key: string, value: unknown) => void) {
  if (Array.isArray(o)) o.forEach((v, i) => walk(v, `${path}[${i}]`, visit));
  else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { visit(path, k, v); walk(v, `${path}.${k}`, visit); }
}
const files = Array.from({ length: 26 }, (_, i) => i + 1).filter((k) => existsSync(`data/meta/aftermath/k${k}.json`));
it('no displayed note, locator or text in the after-election records carries research-audit wording', () => {
  const bad: string[] = [];
  for (const k of files) walk(aftermath(k), `k${k}`, (path, key, v) => {
    if (!DISPLAYED.has(key)) return;
    for (const s of (Array.isArray(v) ? v : [v])) if (typeof s === 'string' && AUDIT.test(s)) bad.push(`${path}.${key}: ${s.slice(0, 80)}`);
  });
  expect(bad).toEqual([]);
});
it('no cite list in the after-election records lists the same source and quote twice', () => {
  const dup: string[] = [];
  for (const k of files) walk(aftermath(k), `k${k}`, (path, key, v) => {
    if (!Array.isArray(v) || !v.length || !v.every((c) => c && typeof c === 'object' && 'source' in c && 'quote' in c)) return;
    const seen = new Set<string>();
    for (const c of v as { source: string; quote: string }[]) { const id = `${c.source}\u0000${c.quote}`; if (seen.has(id)) dup.push(`${path}.${key}: ${c.source} · ${c.quote.slice(0, 40)}`); seen.add(id); }
  });
  expect(dup).toEqual([]);
});
