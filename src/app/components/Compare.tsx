import { scenarioColor } from '../scenarioIdentity.ts';
import { useMemo } from 'react';
import type { ElectionDataset } from '../../data/schema.ts';
import type { AllocationResult } from '../../engine/types.ts';
import type { Scenario } from '../../model/scenario.ts';
import { referenceChanges, allocationOf, comparisonGroups, groupingBaseline, groupingLabel, nonSeatChanges, blocPieces, electedOf, listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt, fmtPct, fmtRat, fmtSigned, isolate, signed } from '../format.ts';
import { replay, setState, useStore, useDigits } from '../store.ts';
import { Hemicycle } from './Hemicycle.tsx';

export function Compare({ s, r, base, ds }: { s: Scenario; r: AllocationResult; base: Scenario; ds: ElectionDataset }) {
  const L = useL();
  const lang = useLang();
  const reference = useStore(st => st.reference);
  const compareWithRaw = useStore((st) => st.compareWith);
  const saved = useStore((st) => st.saved);
  const compareWith = compareWithRaw === 'official' ? 'official' : saved.some((x) => x.id === compareWithRaw && x.electionId === s.electionId && x.id !== s.id) ? compareWithRaw : 'historical';
  const digits = useDigits();
  const advanced = useStore((st) => st.level === 'expert');
  const other = useMemo(() => {
    if (compareWith === 'official') return base;
    if (compareWith === 'historical') return reference ?? base;
    const sv = saved.find((x) => x.id === compareWith && x.electionId === s.electionId);
    return sv ? replay(ds, sv.name, sv.log).scenario : base;
  }, [compareWith, saved, base, ds, s.electionId, reference]);
  const a = other, ar = allocationOf(other);
  const groups = useMemo(() => comparisonGroups(s, r, a, ar), [ar, a, r, s]);

  const gName = (ids: string[], sc: Scenario) => ids.map((id) => { const l = sc.lists.find((x) => x.id === id); return l ? listLabel(l, lang) : id; }).join(' + ') || '—';
  const changed = groups.filter((g) => g.seatsA !== g.seatsB).sort((x, y) => (y.seatsB - y.seatsA) - (x.seatsB - x.seatsA));
  const gainers = changed.filter((g) => g.seatsB > g.seatsA);
  // direct vs indirect
  const direct = groups.filter((g) => g.votesA !== g.votesB || g.aIds.join() !== g.bIds.join());
  const indirect = changed.filter((g) => !direct.includes(g));

  // candidates entering / leaving
  const electedIds = (sc: Scenario, rr: AllocationResult) => new Map(sc.lists.flatMap((l) => electedOf(l, rr.lists.find((x) => x.id === l.id)?.seats ?? 0).map((c) => [c.id, { c, l }] as const)));
  const ea = electedIds(a, ar), eb = electedIds(s, r);
  const entering = [...eb.entries()].filter(([id]) => !ea.has(id)).map(([, v]) => v);
  const leaving = [...ea.entries()].filter(([id]) => !eb.has(id)).map(([, v]) => v);

  const blocSums = (sc: Scenario, rr: AllocationResult) => Object.fromEntries(sc.blocs.map((b) => [b.id, blocPieces(sc, rr).filter((p) => p.bloc === b.id).reduce((t, p) => t + p.n, 0)]));
  const groupedA = groupingBaseline(s, a);
  const ba = groupedA ? blocSums(groupedA, ar) : {}, bb = blocSums(s, r);

  const nameA = compareWith === 'official' ? L('Official result', 'התוצאה הרשמית') : compareWith === 'historical' ? reference?.name || L('Official result', 'התוצאה הרשמית') : a.name;
  const nameB = s.name || L('Your scenario', 'התרחיש שלכם');
  const colorOfGroup = (g: (typeof groups)[number]) => (s.lists.find((l) => l.id === g.bIds[0]) ?? a.lists.find((l) => l.id === g.aIds[0]))?.color ?? '#888';
  const labelOf = (g: (typeof groups)[number]) => gName(g.bIds.length ? g.bIds : g.aIds, g.bIds.length ? s : a);
  const maxChange = Math.max(1, ...changed.map((g) => Math.abs(g.seatsB - g.seatsA)));
  const total = s.rules.seats, majority = Math.floor(total / 2) + 1;
  const BlocBarRow = ({ sums, title, sc }: { sums: Record<string, number>; title: string; sc: Scenario }) => {
    const rest = sc.rules.seats - sc.blocs.reduce((t, b) => t + (sums[b.id] ?? 0), 0);
    return (
      <div className="cmp-blocrow">
        <span className="small ink2">{title}</span>
        <div className="coal-bar big" aria-label={`${title}: ${sc.blocs.map((b) => `${lang === 'he' ? b.nameHe : b.nameEn} ${sums[b.id] ?? 0}`).join(', ')}`}>
          {sc.blocs.map((b) => (sums[b.id] ?? 0) > 0 && <i key={b.id} style={{ flexBasis: `${((sums[b.id] ?? 0) / total) * 100}%`, background: b.color }} title={`${lang === 'he' ? b.nameHe : b.nameEn} ${sums[b.id]}`}><span className="cmp-n">{sums[b.id]}</span></i>)}
          {rest > 0 && <i style={{ flexBasis: `${(rest / total) * 100}%`, background: 'var(--axis)' }} title={`${L('No bloc', 'ללא גוש')} ${rest}`}><span className="cmp-n">{rest}</span></i>}
          <span className="maj" style={{ insetInlineStart: `${(majority / total) * 100}%` }} />
        </div>
      </div>
    );
  };

  return (
    <div className="cmp">
      <p className="small">{L('Baseline: ', 'בסיס ההשוואה: ')}{nameA} · {groupingLabel(s, lang)}{!groupedA && L(' · custom grouping has no baseline counterpart', ' · לחלוקה אישית אין מקבילה בבסיס')}</p>
      <div className="row" style={{ marginBottom: 12 }}>
        <label className="row small">{L('Compare', 'השוואה בין')} <b>{nameB}</b> {L('with', 'לבין')} <span className="swatch" style={{ background: compareWith === 'official' || (!reference && compareWith === 'historical') ? 'var(--axis)' : scenarioColor(a) }} />
          <select value={compareWith} onChange={(e) => setState({ compareWith: e.target.value })}>
            {reference && <option value="official">{L('the official result', 'התוצאה הרשמית')}</option>}
            <option value="historical">{reference?.name || L('the official result', 'התוצאה הרשמית')}</option>
            {saved.filter((x) => x.electionId === s.electionId && x.id !== s.id).map((x) => <option key={x.id} value={x.id} style={{ color: scenarioColor(replay(ds, x.name, x.log).scenario) }}>{x.name}</option>)}
          </select>
        </label>
        {changed.length === 0 && <span className="small muted">{[L('No seats changed', 'המנדטים לא השתנו'), ...nonSeatChanges(s, a, lang)].join(' · ')}</span>}
      </div>

      <div className="cmp-chambers">
        <figure style={{ border: `2px solid ${compareWith !== 'official' && (reference || compareWith !== 'historical') ? scenarioColor(a) : 'var(--rule)'}` }}><figcaption>{nameA}</figcaption><Hemicycle s={groupedA ?? a} r={ar} compact title={nameA} /></figure>
        <figure style={{ border: `2px solid ${reference || referenceChanges(s, base).length || s.identityColor ? scenarioColor(s) : 'var(--rule)'}` }}><figcaption>{nameB}</figcaption><Hemicycle s={s} r={r} compact title={nameB} /></figure>
      </div>

      {s.blocs.length > 0 && (
        <section className="cmp-section">
          <h3>{L('Blocs', 'גושים')}</h3>
          {groupedA && <BlocBarRow sums={ba} title={nameA} sc={groupedA} />}
          <BlocBarRow sums={bb} title={nameB} sc={s} />
          <div className="legend small" style={{ marginTop: 6 }}>{s.blocs.map((b) => <span key={b.id} className="row" style={{ gap: 5 }}><span className="swatch" style={{ background: b.color }} />{lang === 'he' ? b.nameHe : b.nameEn} <b>{groupedA ? `${ba[b.id] ?? 0} → ` : ''}{bb[b.id] ?? 0}</b></span>)}</div>
        </section>
      )}

      {changed.length > 0 && (
        <section className="cmp-section">
          <h3>{L('Seats gained and lost', 'מנדטים שהתווספו ואבדו')}</h3>
          <ul className="cmp-diff">
            {changed.map((g) => {
              const d = g.seatsB - g.seatsA;
              return (
                <li key={g.key}>
                  <span className="cmp-label"><span className="swatch" style={{ background: colorOfGroup(g) }} /> {labelOf(g)} <span className="muted">{g.seatsA} → {g.seatsB}</span></span>
                  <span className="cmp-neg">{d < 0 && <i style={{ width: `${(-d / maxChange) * 100}%`, background: 'var(--ink)' }} />}</span>
                  <span className="cmp-axis" aria-hidden />
                  <span className="cmp-pos">{d > 0 && <i style={{ width: `${(d / maxChange) * 100}%`, background: 'var(--ink)' }} />}</span>
                  <b className="cmp-d" dir="ltr">{d > 0 ? `+${d}` : `−${-d}`}</b>
                </li>
              );
            })}
          </ul>
          {indirect.length > 0 && <p className="small ink2" style={{ margin: '6px 0 0' }}>{L('Changed only through the recalculation (their votes did not change): ', 'השתנו רק בגלל החישוב מחדש (קולותיהן לא השתנו): ')}{indirect.map((g) => `${gName(g.bIds, s)} ${signed(g.seatsB - g.seatsA)}`).join(', ')}</p>}
          {gainers.length > 1 && <p className="small muted" style={{ margin: '4px 0 0' }}>{L('With several lists gaining, the method does not say which seat “came from” which list; the net changes are exact.', 'כשכמה רשימות מרוויחות, השיטה אינה קובעת איזה מנדט "עבר" מאיזו רשימה; השינויים נטו מדויקים.')}</p>}
        </section>
      )}

      <section className="cmp-section">
        <h3>{L('Key numbers', 'מספרי מפתח')}</h3>
        <div className="figures">
          {[
            [L('Valid votes', 'קולות כשרים'), fmtInt(ar.totalValid), fmtInt(r.totalValid)],
            [L('Threshold (votes)', 'אחוז החסימה (קולות)'), fmtInt(ar.thresholdVotes), fmtInt(r.thresholdVotes)],
            [L('Votes per seat', 'קולות למנדט'), fmtRat(ar.quota, 0), fmtRat(r.quota, 0)],
            [L('Remainder seats', 'מנדטים מעודפים'), String(ar.remainderSeatsTotal), String(r.remainderSeatsTotal)],
            [L('Votes with no seat', 'קולות ללא מנדט'), fmtPct(ar.unrepresentedVotes, ar.totalValid, digits), fmtPct(r.unrepresentedVotes, r.totalValid, digits)],
          ].map(([k, x, y]) => <div key={k} className="fig static"><span className="k"><span>{k}</span></span><span className="v">{y}</span><span className="d">{x === y ? L('unchanged', 'ללא שינוי') : `${L('was', 'היה')} ${x}`}</span></div>)}
        </div>
      </section>

      <div className="grid2 stack-sm cmp-section">
        <div>
          <h3>{L(`Entering the Knesset (${entering.length})`, `נכנסים לכנסת (${entering.length})`)}</h3>
          {entering.length === 0 ? <p className="muted small">—</p> : <ul className="small">{entering.map(({ c, l }) => <li key={c.id} lang="he">{c.nameHe} <span className="muted">· {listLabel(l, lang)} #{l.candidates.indexOf(c) + 1}</span></li>)}</ul>}
        </div>
        <div>
          <h3>{L(`Leaving the Knesset (${leaving.length})`, `יוצאים מהכנסת (${leaving.length})`)}</h3>
          {leaving.length === 0 ? <p className="muted small">—</p> : <ul className="small">{leaving.map(({ c, l }) => <li key={c.id} lang="he">{c.nameHe} <span className="muted">· {listLabel(l, lang)} #{l.candidates.indexOf(c) + 1}</span></li>)}</ul>}
        </div>
      </div>

      <details className="cmp-section" open={advanced}>
        <summary className="small">{L('Every list: votes and seats before and after, and the slope chart', 'כל הרשימות: קולות ומנדטים לפני ואחרי, ותרשים השיפוע')}</summary>
        <Slope groups={groups.map((g) => ({ key: g.key, seatsA: g.seatsA, seatsB: g.seatsB, label: labelOf(g) }))} nameA={nameA} nameB={nameB} colorOf={(key) => colorOfGroup(groups.find((x) => x.key === key)!)} />
        <div className="tablewrap" tabIndex={0} role="region" aria-label={L('Scrollable table', 'טבלה נגללת')}>
          <table className="tbl">
            <thead><tr>
              <th>{L('List(s)', 'רשימה/ות')}</th><th className="n">{L('Votes before', 'קולות לפני')}</th><th className="n">{L('Votes after', 'קולות אחרי')}</th><th className="n">Δ</th><th className="n">{L('Δ share (pp)', 'Δ שיעור (נקודות אחוז)')}</th>
              <th className="n">{L('Seats before', 'מנדטים לפני')}</th><th className="n">{L('after', 'אחרי')}</th><th className="n">Δ</th>
            </tr></thead>
            <tbody>
              {[...groups].sort((x, y) => y.seatsB - x.seatsB || Number(y.votesB - x.votesB)).filter((g) => g.seatsA || g.seatsB || g.votesA !== g.votesB || g.votesB * 100n >= r.totalValid).map((g) => {
                const dv = g.votesB - g.votesA, ds_ = g.seatsB - g.seatsA;
                return (
                  <tr key={g.key}>
                    <td>{g.bIds.length ? g.bIds.map((id) => <button key={id} className="table-action" onClick={() => setState({ selectedListId: id })}>{gName([id], s)}</button>) : gName(g.aIds, a)}{g.aIds.join() !== g.bIds.join() && <small className="muted"> · {L("officially", "בפועל")} {gName(g.aIds, a)}</small>}</td>
                    <td className="n">{fmtInt(g.votesA)}</td><td className="n">{fmtInt(g.votesB)}</td>
                    <td className="n">{dv === 0n ? '—' : fmtSigned(dv)}</td>
                    <td className="n">{ar.totalValid > 0n && r.totalValid > 0n ? fmtRat({ num: 100n * (g.votesB * ar.totalValid - g.votesA * r.totalValid), den: ar.totalValid * r.totalValid }, 2) : '—'}</td>
                    <td className="n">{g.seatsA}</td><td className="n"><b>{g.seatsB}</b></td>
                    <td className="n">{ds_ === 0 ? '—' : ds_ > 0 ? `+${ds_}` : `−${-ds_}`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </details>
      <p className="small muted">{L('Elected candidates are the first names on each list as registered (election night). Later changes in membership are not modelled.', 'הנבחרים הם המועמדים הראשונים בכל רשימה כפי שנרשמה (ליל הבחירות). שינויים מאוחרים בהרכב אינם מוצגים.')}</p>
    </div>
  );
}

/** Seats before → after as a slope chart; one line per list (merged lists line up with their parts). */
export function Slope({ groups, nameA, nameB, colorOf }: { groups: { key: string; seatsA: number; seatsB: number; label: string }[]; nameA: string; nameB: string; colorOf: (key: string) => string }) {
  const rows = groups.filter((g) => g.seatsA || g.seatsB);
  const max = Math.max(1, ...rows.flatMap((g) => [g.seatsA, g.seatsB]));
  const W = 560, H = 360, x1 = 170, x2 = W - 170, top = 30, bottom = H - 16;
  const y = (v: number) => bottom - (v / max) * (bottom - top);
  // keep labels at least 15 units apart on each side
  const spread = (vals: { key: string; y: number }[]) => {
    const s = [...vals].sort((a, b) => a.y - b.y);
    for (let i = 1; i < s.length; i++) if (s[i].y - s[i - 1].y < 15) s[i].y = s[i - 1].y + 15;
    return new Map(s.map((v) => [v.key, v.y]));
  };
  const ly = spread(rows.map((g) => ({ key: g.key, y: y(g.seatsA) })));
  const ry = spread(rows.map((g) => ({ key: g.key, y: y(g.seatsB) })));
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H + 10}`} width="100%" style={{ maxWidth: 640 }} role="img" aria-label={`${nameA} → ${nameB}`}>
      <text x={x1} y={16} textAnchor="middle" fontWeight={600}>{isolate(nameA)}</text>
      <text x={x2} y={16} textAnchor="middle" fontWeight={600}>{isolate(nameB.length > 34 ? nameB.slice(0, 33) + '…' : nameB)}</text>
      <line x1={x1} x2={x1} y1={top - 6} y2={bottom} stroke="var(--axis)" />
      <line x1={x2} x2={x2} y1={top - 6} y2={bottom} stroke="var(--axis)" />
      {rows.map((g) => {
        const c = colorOf(g.key);
        const changed = g.seatsA !== g.seatsB;
        return (
          <g key={g.key} opacity={changed ? 1 : 0.45}>
            <line x1={x1} y1={y(g.seatsA)} x2={x2} y2={y(g.seatsB)} stroke="var(--ink)" strokeWidth={changed ? 3 : 2} />
            <circle cx={x1} cy={y(g.seatsA)} r={4} fill={c} stroke="var(--surface)" strokeWidth={2} />
            <circle cx={x2} cy={y(g.seatsB)} r={4} fill={c} stroke="var(--surface)" strokeWidth={2} />
            <text x={x1 - 8} y={ly.get(g.key)} textAnchor="end" dominantBaseline="middle" fill="var(--ink)"><title>{`${g.label} ${g.seatsA}`}</title>{isolate(`${g.label.length > 22 ? g.label.slice(0, 21) + '…' : g.label} ${g.seatsA}`)}</text>
            <text x={x2 + 8} y={ry.get(g.key)} textAnchor="start" dominantBaseline="middle" fill="var(--ink)" fontWeight={changed ? 700 : 400}>{g.seatsB}{changed ? ` (${signed(g.seatsB - g.seatsA)})` : ''}</text>
          </g>
        );
      })}
    </svg>
  );
}
