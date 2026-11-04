import { useEffect, useMemo, useState } from 'react';
import { isEnvelopeRow, type ElectionId, type LocalityDataset } from '../../data/schema.ts';
import { apportion } from '../../model/actions.ts';
import type { Scenario } from '../../model/scenario.ts';
import { listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt, fmtPct } from '../format.ts';
import { dispatch, toast, useStore } from '../store.ts';
import { Info, NumberInput } from './ui.tsx';

const locCache = new Map<ElectionId, Promise<LocalityDataset>>();
/** Loads an election's locality results; `available` is false when the election has none. */
export function useLocalities(id: ElectionId, available = true) {
  const [d, setD] = useState<LocalityDataset | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    let live = true; // ignore a slower response for an election we have already left
    setD(null); setErr(null);
    if (!available) return;
    let p = locCache.get(id);
    if (!p) { p = fetch(`data/${id}-localities.json`).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }); locCache.set(id, p); }
    p.then((x) => live && setD(x), (e) => { locCache.delete(id); if (live) setErr(String(e)); });
    return () => { live = false; };
  }, [id, available]);
  return { data: d, error: err };
}

/** Maps historical-list vote columns onto the scenario's (possibly merged or split) lists. */
export function mapToScenario(s: Scenario, listIds: string[], votes: number[]): number[] {
  return s.lists.map((l) => l.originIds.reduce((t, o) => {
    const k = listIds.indexOf(o); if (k < 0) return t;
    const sharers = s.lists.filter((x) => x.originIds.includes(o));
    const tot = sharers.reduce((u, x) => u + x.votes, 0);
    return t + (sharers.length === 1 || tot === 0 ? votes[k] : (votes[k] * l.votes) / tot);
  }, 0));
}

export function Turnout({ s }: { s: Scenario }) {
  const L = useL();
  const lang = useLang();
  const hasLocalities = useStore((st) => st.datasets[s.electionId]?.hasLocalities !== false);
  const { data } = useLocalities(s.electionId, hasLocalities);
  const [label, setLabel] = useState('');
  const [electorate, setElectorate] = useState(1_000_000);
  const [cur, setCur] = useState('50');
  const [hyp, setHyp] = useState('60');
  const [inv, setInv] = useState('1');
  const [prefMode, setPrefMode] = useState<'group' | 'custom'>('custom');
  const [custom, setCustom] = useState<Record<string, string>>({});
  // preferences are keyed by list id (never by position) and dropped when the lists change
  const [groupPref, setGroupPref] = useState<Record<string, number> | null>(null);
  const listKey = s.lists.map((l) => l.id).join('|');
  useEffect(() => { setGroupPref(null); setBasis(''); setPrefMode('custom'); }, [listKey]);
  const [basis, setBasis] = useState<string>('');
  // locality preset
  const [presetLists, setPresetLists] = useState<string[]>([]);
  const [presetPct, setPresetPct] = useState('50');

  const num = (t: string) => { const n = Number(String(t).replace('%', '').trim()); return t.trim() !== '' && Number.isFinite(n) ? n : NaN; };
  const curN = num(cur), hypN = num(hyp), invN = num(inv);
  const inputsOk = Number.isFinite(curN) && Number.isFinite(hypN) && Number.isFinite(invN) && curN >= 0 && hypN <= 100 && invN >= 0 && invN < 100;
  const added = inputsOk ? Math.max(0, Math.round((electorate * (hypN - curN)) / 100)) : 0;
  const invalid = Math.round((added * (inputsOk ? invN : 0)) / 100);
  const valid = added - invalid;
  const weights = s.lists.map((l) => (prefMode === 'group' && groupPref ? groupPref[l.id] ?? 0 : Math.max(0, num(custom[l.id] ?? '') || 0)));
  const wsum = weights.reduce((a, b) => a + b, 0);
  const alloc = useMemo(() => (wsum > 0 && valid > 0 ? apportion(valid, weights) : weights.map(() => 0)), [valid, weights, wsum]);

  const buildFromLocalities = () => {
    if (!data) return;
    const cols = presetLists.map((id) => s.lists.find((l) => l.id === id)!).flatMap((l) => l.originIds).map((o) => data.listIds.indexOf(o)).filter((k) => k >= 0);
    const p = Number(presetPct) / 100;
    const rows = data.rows.filter((r) => !isEnvelopeRow(r) && r.valid > 0 && cols.reduce((t, k) => t + r.votes[k], 0) >= p * r.valid);
    // older elections lack locality electorates: the turnout model cannot be built from them
    if (rows.some((r) => r.registered === null)) { toast('error', L('This election’s locality data has no registered-voter counts, so turnout cannot be estimated from it.', 'בנתוני היישובים של בחירות אלה אין מספרי בעלי זכות בחירה, ולכן אי אפשר לאמוד מהם הצבעה.')); return; }
    const reg = rows.reduce((t, r) => t + (r.registered ?? 0), 0), cast = rows.reduce((t, r) => t + r.votesCast, 0), inval = rows.reduce((t, r) => t + r.invalid, 0);
    const sum = data.listIds.map((_, k) => rows.reduce((t, r) => t + r.votes[k], 0));
    const curPct = (cast / Math.max(1, reg)) * 100;
    setElectorate(reg);
    setCur(curPct.toFixed(2));
    setHyp(Math.min(100, curPct + 10).toFixed(2)); // a starting assumption the user can change
    setInv(((inval / Math.max(1, cast)) * 100).toFixed(2));
    const mapped = mapToScenario(s, data.listIds, sum);
    setGroupPref(Object.fromEntries(s.lists.map((l, i) => [l.id, mapped[i]])));
    setPrefMode('group');
    setBasis(L(`${rows.length} localities where ${presetLists.map((id) => listLabel(s.lists.find((l) => l.id === id)!, lang)).join(' + ')} received ≥ ${presetPct}% of valid votes`, `${rows.length} יישובים שבהם ${presetLists.map((id) => listLabel(s.lists.find((l) => l.id === id)!, lang)).join(' + ')} קיבלו ≥ ${presetPct}% מהקולות הכשרים`));
    if (!label) setLabel(L('Locality group', 'קבוצת יישובים'));
  };

  return (
    <div>
      <div className="callout small" style={{ marginBottom: 10 }}>
        <b>{L('Hypothetical modelling.', 'מידול היפותטי.')}</b>{' '}
        {L('Everything here is an assumption you supply, not a historical result. Locality-based groups use official results by locality: they describe places, not individual voters (a mostly-Arab locality is not proof of how each resident voted), and votes in double envelopes are not attributed to localities.', 'כל מה שכאן הוא הנחה שלכם ואינו תוצאה היסטורית. קבוצות לפי יישובים מבוססות על התוצאות הרשמיות ליישוב: הן מתארות מקומות, לא מצביעים יחידים (יישוב שרוב תושביו ערבים אינו מוכיח כיצד הצביע כל תושב), וקולות המעטפות החיצוניות אינם משויכים ליישובים.')} <Info term="envelopes" />
      </div>
      <div className="grid2" style={{ alignItems: 'start', gap: 18 }}>
        <div>
          <h3>{L('1. Define the group', '1. הגדרת הקבוצה')}</h3>
          {hasLocalities && <details open={!!data}>
            <summary className="small">{L('Start from official locality results (optional)', 'התחלה מהתוצאות הרשמיות לפי יישובים (רשות)')}</summary>
            <div className="small" style={{ margin: '6px 0' }}>{L('Localities where these lists together received at least', 'יישובים שבהם הרשימות האלה יחד קיבלו לפחות')}{' '}
              <input type="text" value={presetPct} onChange={(e) => setPresetPct(e.target.value)} style={{ width: 56 }} aria-label="%" />%:
            </div>
            <div className="tablewrap" tabIndex={0} role="region" aria-label={L('Scrollable table', 'טבלה נגללת')} style={{ maxHeight: 150 }}>
              {[...s.lists].filter((l) => l.originIds.length).sort((a, b) => b.votes - a.votes).slice(0, 20).map((l) => (
                <label key={l.id} className="row small" style={{ padding: '2px 8px' }}><input type="checkbox" checked={presetLists.includes(l.id)} onChange={(e) => setPresetLists(e.target.checked ? [...presetLists, l.id] : presetLists.filter((x) => x !== l.id))} />{listLabel(l, lang)}</label>
              ))}
            </div>
            <button className="btn small" style={{ marginTop: 6 }} disabled={!data || !presetLists.length} onClick={buildFromLocalities}>{L('Use these localities', 'שימוש ביישובים אלה')}</button>
            {basis && <p className="small ink2">{L('Basis: ', 'בסיס: ')}{basis}. {L('Electorate, current turnout, invalid rate and party preferences below are measured from these localities.', 'גודל הקבוצה, ההצבעה, שיעור הפסולים וההעדפות להלן נמדדו ביישובים אלה.')}</p>}
          </details>}
          <div className="grid2" style={{ marginTop: 8 }}>
            <label className="field">{L('Group name', 'שם הקבוצה')}<input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder={L('e.g. Arab voters', 'למשל: מצביעים ערבים')} /></label>
            <label className="field">{L('Electorate (registered voters)', 'בעלי זכות בחירה בקבוצה')}<NumberInput value={electorate} onCommit={setElectorate} label={L('Electorate', 'בעלי זכות בחירה')} /></label>
            <label className="field">{L('Current turnout %', 'שיעור הצבעה נוכחי %')}<input type="text" inputMode="decimal" value={cur} onChange={(e) => setCur(e.target.value)} /></label>
            <label className="field">{L('Hypothetical turnout %', 'שיעור הצבעה היפותטי %')}<input type="text" inputMode="decimal" value={hyp} onChange={(e) => setHyp(e.target.value)} /></label>
            <label className="field">{L('Invalid-ballot rate % (of new voters)', 'שיעור פסולים % (מהמצביעים החדשים)')}<input type="text" inputMode="decimal" value={inv} onChange={(e) => setInv(e.target.value)} /></label>
          </div>
        </div>
        <div>
          <h3>{L('2. How do the additional voters vote?', '2. איך מצביעים המצביעים הנוספים?')}</h3>
          <div className="row small" style={{ marginBottom: 6 }}>
            <label className="row"><input type="radio" checked={prefMode === 'group'} disabled={!groupPref} onChange={() => setPrefMode('group')} />{L('Like the group’s current voters', 'כמו המצביעים הנוכחיים בקבוצה')}</label>
            <label className="row"><input type="radio" checked={prefMode === 'custom'} onChange={() => setPrefMode('custom')} />{L('Custom distribution (%)', 'התפלגות מותאמת (%)')}</label>
          </div>
          <div className="tablewrap" tabIndex={0} role="region" aria-label={L('Scrollable table', 'טבלה נגללת')} style={{ maxHeight: 260 }}>
            <table className="tbl">
              <thead><tr><th>{L('List', 'רשימה')}</th><th className="n">{L('Share', 'חלק')}</th><th className="n">{L('Added votes', 'קולות נוספים')}</th></tr></thead>
              <tbody>
                {s.lists.map((l, i) => ({ l, i })).filter(({ l, i }) => (prefMode === 'custom' ? l.votes > 0 || custom[l.id] : weights[i] > 0)).sort((a, b) => (weights[b.i] - weights[a.i]) || (b.l.votes - a.l.votes)).slice(0, prefMode === 'custom' ? 20 : 14).map(({ l, i }) => (
                  <tr key={l.id}>
                    <td><span className="row" style={{ gap: 6 }}><span className="swatch" style={{ background: l.color }} />{listLabel(l, lang)}</span></td>
                    <td className="n">{prefMode === 'custom' ? <input type="text" inputMode="decimal" style={{ width: 64 }} value={custom[l.id] ?? ''} onChange={(e) => setCustom({ ...custom, [l.id]: e.target.value })} aria-label={L('Share %', 'חלק %')} /> : wsum ? fmtPct(Math.round(weights[i] * 1000), Math.round(wsum * 1000), 1) : '—'}</td>
                    <td className="n">{fmtInt(alloc[i] ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small">{L(`Additional voters: ${fmtInt(added)} · invalid: ${fmtInt(invalid)} · valid: ${fmtInt(valid)}`, `מצביעים נוספים: ${fmtInt(added)} · פסולים: ${fmtInt(invalid)} · כשרים: ${fmtInt(valid)}`)}{prefMode === 'custom' && wsum > 0 && Math.abs(wsum - 100) > 0.01 ? L(` (shares sum to ${wsum}%; they are normalised)`, ` (סך החלקים ${wsum}%; מנורמל)`) : ''}</p>
          {!inputsOk && <p className="small down">{L('Enter turnout and invalid rates as numbers between 0 and 100.', 'הזינו שיעורי הצבעה ופסולים כמספרים בין 0 ל-100.')}</p>}
          {inputsOk && hypN < curN && <p className="small down">{L('Only turnout increases are modelled here; use the vote tools to remove votes.', 'כאן ממודלת רק עלייה בהצבעה; להסרת קולות השתמשו בכלי הקולות.')}</p>}
          <button className="btn primary" disabled={valid <= 0 || wsum <= 0} onClick={() => dispatch({ type: 'addVoters', allocations: s.lists.map((l, i) => ({ listId: l.id, votes: alloc[i] ?? 0 })).filter((x) => x.votes > 0), invalid, label: label || 'turnout' })}>
            {L('Add these voters', 'הוספת המצביעים')}
          </button>
          <p className="small muted">{L('The national result is fully recalculated, including the threshold in votes.', 'התוצאה הארצית מחושבת מחדש במלואה, כולל אחוז החסימה בקולות.')}</p>
        </div>
      </div>
    </div>
  );
}
