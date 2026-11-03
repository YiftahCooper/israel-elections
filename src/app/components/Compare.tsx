import { useMemo } from 'react';
import type { ElectionDataset } from '../../data/schema.ts';
import { compareAllocations } from '../../engine/analysis.ts';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario } from '../../model/scenario.ts';
import { allocationOf, electedOf, listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt, fmtPct, fmtRat, fmtSigned } from '../format.ts';
import { replay, setState, useStore } from '../store.ts';
import { Hemicycle } from './Hemicycle.tsx';

export function Compare({ s, r, base, ds }: { s: Scenario; r: AllocationResult; base: Scenario; ds: ElectionDataset }) {
  const L = useL();
  const lang = useLang();
  const compareWith = useStore((st) => st.compareWith);
  const saved = useStore((st) => st.saved);
  const digits = useStore((st) => st.digits);
  const other = useMemo(() => {
    if (compareWith === 'historical') return base;
    const sv = saved.find((x) => x.id === compareWith && x.electionId === s.electionId);
    return sv ? replay(ds, sv.name, sv.log).scenario : base;
  }, [compareWith, saved, base, ds, s.electionId]);
  const a = other, ar = allocationOf(other);
  const groups = useMemo(() => compareAllocations(ar, a.lists, r, s.lists), [ar, a, r, s]);

  const gName = (ids: string[], sc: Scenario) => ids.map((id) => { const l = sc.lists.find((x) => x.id === id); return l ? listLabel(l, lang) : id; }).join(' + ') || '—';
  const changed = groups.filter((g) => g.seatsA !== g.seatsB).sort((x, y) => (y.seatsB - y.seatsA) - (x.seatsB - x.seatsA));
  const gainers = changed.filter((g) => g.seatsB > g.seatsA);
  const losers = changed.filter((g) => g.seatsB < g.seatsA);
  const blocOf = (g: (typeof groups)[number]) => {
    const bl = new Set([...g.aIds.map((id) => a.lists.find((x) => x.id === id)?.bloc), ...g.bIds.map((id) => s.lists.find((x) => x.id === id)?.bloc)]);
    const b = [...bl].find(Boolean);
    return bl.size === 1 && b ? s.blocs.find((x) => x.id === b) ?? null : null;
  };
  const blocName = (b: ReturnType<typeof blocOf>) => (b ? (lang === 'he' ? b.nameHe : b.nameEn) : L('no bloc', 'ללא גוש'));

  // direct vs indirect
  const direct = groups.filter((g) => g.votesA !== g.votesB || g.aIds.join() !== g.bIds.join());
  const indirect = changed.filter((g) => !direct.includes(g));

  // candidates entering / leaving
  const electedIds = (sc: Scenario, rr: AllocationResult) => new Map(sc.lists.flatMap((l) => electedOf(l, rr.lists.find((x) => x.id === l.id)?.seats ?? 0).map((c) => [c.id, { c, l }] as const)));
  const ea = electedIds(a, ar), eb = electedIds(s, r);
  const entering = [...eb.entries()].filter(([id]) => !ea.has(id)).map(([, v]) => v);
  const leaving = [...ea.entries()].filter(([id]) => !eb.has(id)).map(([, v]) => v);

  const blocSums = (sc: Scenario, rr: AllocationResult) => Object.fromEntries(s.blocs.map((b) => [b.id, sc.lists.filter((l) => l.bloc === b.id).reduce((t, l) => t + (rr.lists.find((x) => x.id === l.id)?.seats ?? 0), 0)]));
  const ba = blocSums(a, ar), bb = blocSums(s, r);

  return (
    <div>
      <div className="row" style={{ marginBottom: 10 }}>
        <label className="field" style={{ minWidth: 260 }}>{L('Compare the current scenario with', 'השוואת התרחיש הנוכחי עם')}
          <select value={compareWith} onChange={(e) => setState({ compareWith: e.target.value })}>
            <option value="historical">{L('Historical result', 'התוצאה בפועל')}</option>
            {saved.filter((x) => x.electionId === s.electionId && x.id !== s.id).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </label>
      </div>

      <div className="callout" style={{ marginBottom: 12 }}>
        {changed.length === 0 ? L('No seat changes.', 'אין שינויים במנדטים.') : (
          <div>
            {gainers.length === 1 ? (
              <p style={{ margin: 0 }}>
                <b>{gName(gainers[0].bIds, s)}</b> {gainers[0].seatsA === 0 ? L(`enters the Knesset with ${gainers[0].seatsB} seats`, `נכנסת לכנסת עם ${gainers[0].seatsB} מנדטים`) : L(`gains ${gainers[0].seatsB - gainers[0].seatsA} seats (${gainers[0].seatsA} → ${gainers[0].seatsB})`, `מוסיפה ${gainers[0].seatsB - gainers[0].seatsA} מנדטים (${gainers[0].seatsA} → ${gainers[0].seatsB})`)}.{' '}
                {L('The seats come from: ', 'המנדטים באים מ: ')}
                {Object.entries(losers.reduce<Record<string, { n: number; names: string[] }>>((acc, g) => { const b = blocName(blocOf(g)); acc[b] ??= { n: 0, names: [] }; acc[b].n += g.seatsA - g.seatsB; acc[b].names.push(`${gName(g.aIds, a)} −${g.seatsA - g.seatsB}`); return acc; }, {}))
                  .map(([b, v]) => `${b}: ${v.n} (${v.names.join(', ')})`).join('; ')}.
              </p>
            ) : (
              <p style={{ margin: 0 }}>
                {L('Gains: ', 'רווחים: ')}{gainers.map((g) => `${gName(g.bIds, s)} +${g.seatsB - g.seatsA}`).join(', ')}. {L('Losses: ', 'הפסדים: ')}{losers.map((g) => `${gName(g.aIds, a)} −${g.seatsA - g.seatsB}`).join(', ')}.
                <span className="small muted"> {L('With several lists gaining, the method does not define which gained seat “came from” which list; only the net changes are exact.', 'כשכמה רשימות מרוויחות, השיטה אינה קובעת איזה מנדט "עבר" מאיזו רשימה; רק השינויים נטו מדויקים.')}</span>
              </p>
            )}
            {s.blocs.length > 0 && <p className="small" style={{ margin: '6px 0 0' }}>{L('Blocs: ', 'גושים: ')}{s.blocs.map((b) => `${lang === 'he' ? b.nameHe : b.nameEn} ${ba[b.id]} → ${bb[b.id]}`).join(' · ')}</p>}
            {indirect.length > 0 && <p className="small" style={{ margin: '6px 0 0' }}>{L('Indirect consequences (votes unchanged, seats changed by recalculation): ', 'השלכות עקיפות (הקולות לא השתנו, המנדטים השתנו בחישוב מחדש): ')}{indirect.map((g) => `${gName(g.bIds, s)} ${g.seatsB > g.seatsA ? '+' : '−'}${Math.abs(g.seatsB - g.seatsA)}`).join(', ')}</p>}
          </div>
        )}
      </div>

      <div className="grid2" style={{ marginBottom: 12 }}>
        <div><h4>{compareWith === 'historical' ? L('Historical', 'בפועל') : a.name}</h4><Hemicycle s={a} r={ar} compact title={L('Before', 'לפני')} /></div>
        <div><h4>{s.name || L('Current scenario', 'התרחיש הנוכחי')}</h4><Hemicycle s={s} r={r} compact title={L('After', 'אחרי')} /></div>
      </div>

      <div className="kv small" style={{ maxWidth: 520, marginBottom: 12 }}>
        <span>{L('Valid votes', 'קולות כשרים')}</span><span>{fmtInt(ar.totalValid)} → {fmtInt(r.totalValid)} ({fmtSigned(r.totalValid - ar.totalValid)})</span>
        <span>{L('Threshold in votes', 'אחוז החסימה בקולות')}</span><span>{fmtInt(ar.thresholdVotes)} → {fmtInt(r.thresholdVotes)}</span>
        <span>{L('General quota', 'המודד הכללי')}</span><span>{fmtRat(ar.quota, 0)} → {fmtRat(r.quota, 0)}</span>
        <span>{L('Remainder seats', 'מנדטים מעודפים')}</span><span>{ar.remainderSeatsTotal} → {r.remainderSeatsTotal}</span>
        <span>{L('Unrepresented votes', 'קולות שלא השתתפו')}</span><span>{fmtPct(ar.unrepresentedVotes, ar.totalValid, digits)} → {fmtPct(r.unrepresentedVotes, r.totalValid, digits)}</span>
      </div>

      <div className="tablewrap">
        <table className="tbl">
          <thead><tr>
            <th>{L('List(s)', 'רשימה/ות')}</th><th className="n">{L('Votes before', 'קולות לפני')}</th><th className="n">{L('Votes after', 'קולות אחרי')}</th><th className="n">Δ</th><th className="n">Δ%</th>
            <th className="n">{L('Seats before', 'מנדטים לפני')}</th><th className="n">{L('after', 'אחרי')}</th><th className="n">Δ</th>
          </tr></thead>
          <tbody>
            {[...groups].sort((x, y) => y.seatsB - x.seatsB || Number(y.votesB - x.votesB)).filter((g) => g.seatsA || g.seatsB || g.votesA !== g.votesB || g.votesB * 100n >= r.totalValid).map((g) => {
              const dv = g.votesB - g.votesA, ds_ = g.seatsB - g.seatsA;
              return (
                <tr key={g.key} onClick={() => g.bIds[0] && setState({ selectedListId: g.bIds[0] })} style={{ cursor: 'pointer' }}>
                  <td>{g.aIds.join() === g.bIds.join() ? gName(g.bIds, s) : `${gName(g.aIds, a)} → ${gName(g.bIds, s)}`}</td>
                  <td className="n">{fmtInt(g.votesA)}</td><td className="n">{fmtInt(g.votesB)}</td>
                  <td className={`n ${dv > 0n ? 'up' : dv < 0n ? 'down' : 'muted'}`}>{dv === 0n ? '—' : fmtSigned(dv)}</td>
                  <td className="n">{g.votesA > 0n && dv !== 0n ? `${dv > 0n ? '+' : ''}${fmtRat({ num: dv * 100n, den: g.votesA }, 2)}%` : ''}</td>
                  <td className="n">{g.seatsA}</td><td className="n"><b>{g.seatsB}</b></td>
                  <td className={`n ${ds_ > 0 ? 'up' : ds_ < 0 ? 'down' : 'muted'}`}>{ds_ === 0 ? '—' : ds_ > 0 ? `+${ds_}` : `−${-ds_}`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid2" style={{ marginTop: 12 }}>
        <div>
          <h4 className="up">{L(`Entering the Knesset (${entering.length})`, `נכנסים לכנסת (${entering.length})`)}</h4>
          {entering.length === 0 ? <p className="muted small">—</p> : <ul className="small">{entering.map(({ c, l }) => <li key={c.id} lang="he">{c.nameHe} <span className="muted">· {listLabel(l, lang)} #{l.candidates.indexOf(c) + 1}</span></li>)}</ul>}
        </div>
        <div>
          <h4 className="down">{L(`Leaving the Knesset (${leaving.length})`, `יוצאים מהכנסת (${leaving.length})`)}</h4>
          {leaving.length === 0 ? <p className="muted small">—</p> : <ul className="small">{leaving.map(({ c, l }) => <li key={c.id} lang="he">{c.nameHe} <span className="muted">· {listLabel(l, lang)} #{l.candidates.indexOf(c) + 1}</span></li>)}</ul>}
        </div>
      </div>
      <p className="small muted">{L('Elected candidates are the first names on each list as registered, i.e. those elected on election night. Later changes in membership (resignations, replacements, the Norwegian Law) are not modelled.', 'הנבחרים הם המועמדים הראשונים בכל רשימה כפי שנרשמה — כלומר מי שנבחרו בליל הבחירות. שינויים מאוחרים בהרכב (התפטרויות, מחליפים, החוק הנורבגי) אינם מוצגים.')}</p>
    </div>
  );
}
