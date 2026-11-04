import { allocationOf, blocPieces } from '../derive.ts';
import type { Scenario } from '../../model/scenario.ts';
export function ResultPreview({ s, blocs = true, party = false }: { s: Scenario; blocs?: boolean; party?: boolean }) {
  const r = allocationOf(s);
  const pieces = party ? blocPieces(s, r).map(p => ({ color: p.color, n: p.n })) : blocs ? blocPieces(s, r).map(p => ({ color: s.blocs.find(b => b.id === p.bloc)?.color ?? 'var(--muted)', n: p.n })) : r.lists.map(l => ({ color: s.lists.find(x => x.id === l.id)!.color, n: l.seats }));
  return <span className="result-preview" aria-hidden>{pieces.filter(p => p.n > 0).map((p, i) => <i key={i} style={{ background: p.color, flex: p.n }} />)}</span>;
}
