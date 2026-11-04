// One-click counterfactuals. Each preset is a list of ordinary scenario actions replayed on the
// historical result, so it is reproducible, undoable and shareable like any manual edit. The headline
// seat changes are computed live from the engine, never written by hand.
import { useMemo } from 'react';
import type { ElectionDataset } from '../../data/schema.ts';
import { allocate } from '../../engine/allocate.ts';
import { goals, minimalChange } from '../../engine/analysis.ts';
import { applyAction } from '../../model/actions.ts';
import { scenarioFromDataset, toEngineInput, type Action, type Scenario } from '../../model/scenario.ts';
import { listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt, signed } from '../format.ts';
import { getState, setState } from '../store.ts';

interface Preset { id: string; titleEn: string; titleHe: string; bodyEn: string; bodyHe: string; actions: (s: Scenario) => Action[] | null }

const has = (s: Scenario, ...ids: string[]) => ids.every((id) => s.lists.some((l) => l.id === id));
const agreementWith = (s: Scenario, id: string) => s.agreements.find((a) => a.members.includes(id));


/** minimal transfer/new votes for `id` to pass the threshold, as an action */
function toPass(s: Scenario, id: string, from?: string): Action[] | null {
  const src = from ? { kind: 'transfer' as const, listId: from } : { kind: 'new' as const };
  const m = minimalChange(toEngineInput(s), id, src, goals.qualify(id));
  if (!m.found || m.votes === null) return null;
  const k = Number(m.votes);
  return [from ? { type: 'transfer', from, to: id, votes: k } : { type: 'setVotes', listId: id, votes: s.lists.find((l) => l.id === id)!.votes + k }];
}

const merge = (s: Scenario, ids: string[], nameHe: string, letters: string, color: string, nameEn?: string): Action[] | null =>
  has(s, ...ids) ? [{ type: 'merge', ids, newId: `sim-${ids.join('+')}`, nameHe, letters, color, retentionPct: 100, candidateOrder: 'interleave', nonRetained: 'abstain' },
    ...(nameEn ? [{ type: 'setListMeta', listId: `sim-${ids.join('+')}`, patch: { shortEn: nameEn } } as Action] : [])] : null;

const COMMON: Preset[] = [
  { id: 'no-agreements', titleEn: 'No surplus agreements at all', titleHe: 'בלי הסכמי עודפים בכלל', bodyEn: 'Every list competes alone for the remainder seats.', bodyHe: 'כל רשימה מתחרה לבדה על המנדטים העודפים.', actions: (s) => s.agreements.map((a) => ({ type: 'removeAgreement', id: a.id })) },
  { id: 'threshold-2', titleEn: 'A 2% threshold', titleHe: 'אחוז חסימה של 2%', bodyEn: 'The threshold before 2014. (Alternative rule: experimental.)', bodyHe: 'אחוז החסימה שלפני 2014. (כלל חלופי: ניסיוני.)', actions: () => [{ type: 'setMode', mode: 'experimental' }, { type: 'setRules', patch: { thresholdPct: '2' } }] },
  { id: 'pure-pr', titleEn: 'Pure proportional representation', titleHe: 'ייצוג יחסי טהור', bodyEn: 'No threshold, Sainte-Laguë for all 120 seats, no agreements. (Experimental.)', bodyHe: 'ללא אחוז חסימה, סנט-לגה לכל 120 המושבים, ללא הסכמים. (ניסיוני.)', actions: (s) => [{ type: 'setMode', mode: 'experimental' }, { type: 'setRules', patch: { thresholdPct: '0', remainderMethod: 'sainte-lague' } }, ...s.agreements.map((a) => ({ type: 'removeAgreement', id: a.id }) as Action)] },
  { id: 'turnout-80', titleEn: 'Turnout of 80%', titleHe: 'שיעור הצבעה של 80%', bodyEn: 'Every list grows in proportion: the threshold in votes rises with it.', bodyHe: 'כל הרשימות גדלות באופן יחסי; אחוז החסימה בקולות עולה בהתאם.', actions: () => [{ type: 'setTurnout', pct: 80 }] },
];

const K25: Preset[] = [
  { id: 'meretz-in', titleEn: 'Meretz passes the threshold', titleHe: 'מרצ עוברת את אחוז החסימה', bodyEn: 'The smallest number of Labor voters switching to Meretz that gets it in.', bodyHe: 'המספר הקטן ביותר של מצביעי העבודה שעוברים למרצ ומכניסים אותה.', actions: (s) => (has(s, '25-מרצ', '25-אמת') ? toPass(s, '25-מרצ', '25-אמת') : null) },
  { id: 'labor-meretz', titleEn: 'Labor and Meretz run together', titleHe: 'העבודה ומרצ רצות יחד', bodyEn: 'One joint list keeping every vote of both.', bodyHe: 'רשימה משותפת אחת ששומרת על כל הקולות של שתיהן.', actions: (s) => merge(s, ['25-אמת', '25-מרצ'], 'העבודה–מרצ', 'אמת', '#eb6834', 'Labor–Meretz') },
  { id: 'balad-in', titleEn: 'Balad passes the threshold', titleHe: 'בל״ד עוברת את אחוז החסימה', bodyEn: 'The smallest number of additional Balad voters.', bodyHe: 'המספר הקטן ביותר של מצביעים נוספים לבל״ד.', actions: (s) => (has(s, '25-ד') ? toPass(s, '25-ד') : null) },
  { id: 'arab-joint', titleEn: 'A joint Arab list', titleHe: 'רשימה ערבית משותפת', bodyEn: 'Ra’am, Hadash–Ta’al and Balad on one list.', bodyHe: 'רע״ם, חד״ש–תע״ל ובל״ד ברשימה אחת.', actions: (s) => merge(s, ['25-עם', '25-ום', '25-ד'], 'הרשימה המשותפת', 'ודעם', '#e34948', 'Joint Arab list') },
  { id: 'no-likud-rz', titleEn: 'No Likud–Religious Zionism agreement', titleHe: 'בלי הסכם הליכוד–הציונות הדתית', bodyEn: 'Remove only that agreement.', bodyHe: 'הסרת ההסכם הזה בלבד.', actions: (s) => { const a = agreementWith(s, '25-מחל'); return a ? [{ type: 'removeAgreement', id: a.id }] : null; } },
  { id: 'jewish-home-in', titleEn: 'The Jewish Home passes', titleHe: 'הבית היהודי עובר', bodyEn: 'Smallest number of additional voters for Ayelet Shaked’s list.', bodyHe: 'המספר הקטן ביותר של מצביעים נוספים לרשימת איילת שקד.', actions: (s) => (has(s, '25-ב') ? toPass(s, '25-ב') : null) },
];

const K26: Preset[] = [
  { id: 'no-likud-rz', titleEn: 'No Likud–Religious Zionism agreement', titleHe: 'בלי הסכם הליכוד–הציונות הדתית', bodyEn: 'Remove only that agreement.', bodyHe: 'הסרת ההסכם הזה בלבד.', actions: (s) => { const a = agreementWith(s, '26-מחל'); return a ? [{ type: 'removeAgreement', id: a.id }] : null; } },
  { id: 'reservists-in', titleEn: 'Hendel–Zelicha passes the threshold', titleHe: 'המילואימניקים והכלכלית עוברת', bodyEn: 'The smallest number of additional voters for the Reservists & New Economic list.', bodyHe: 'המספר הקטן ביותר של מצביעים נוספים לרשימה.', actions: (s) => (has(s, '26-די') ? toPass(s, '26-די') : null) },
  { id: 'otzma-rz', titleEn: 'Otzma Yehudit and Religious Zionism together', titleHe: 'עוצמה יהודית והציונות הדתית יחד', bodyEn: 'As in 2022: one list keeping every vote of both.', bodyHe: 'כמו ב-2022: רשימה אחת ששומרת על כל הקולות.', actions: (s) => merge(s, ['26-ב', '26-ט'], 'הציונות הדתית ועוצמה יהודית', 'ט', '#eda100', 'Religious Zionism–Otzma') },
  { id: 'bennett-yashar', titleEn: 'Bennett and Eisenkot run together', titleHe: 'בנט ואיזנקוט רצים יחד', bodyEn: 'Together and Yashar! on one list.', bodyHe: 'ביחד וישר! ברשימה אחת.', actions: (s) => merge(s, ['26-רק', '26-דרך'], 'ביחד–ישר!', 'רק', '#1baf7a', 'Together–Yashar!') },
  { id: 'arab-joint', titleEn: 'One Arab list', titleHe: 'רשימה ערבית אחת', bodyEn: 'Ra’am and the Joint List on one list.', bodyHe: 'רע״ם והרשימה המשותפת ברשימה אחת.', actions: (s) => merge(s, ['26-עם', '26-ודם'], 'הרשימה הערבית המאוחדת', 'עם', '#e34948', 'United Arab list') },
  { id: 'amcha-in', titleEn: 'Amcha Yisrael passes', titleHe: 'עמך ישראל עוברת', bodyEn: 'Smallest number of additional voters for Ofer Winter’s list.', bodyHe: 'המספר הקטן ביותר של מצביעים נוספים לרשימת עופר וינטר.', actions: (s) => (has(s, '26-ך') ? toPass(s, '26-ך') : null) },
];

type Result = { p: Preset; actions: Action[] | null; lines: string[]; votes: string };
// The cards depend only on the dataset and the language (never on the edited scenario), so their
// engine runs are kept per dataset: edits, tab switches and level changes reuse them.
const resultCache = new WeakMap<ElectionDataset, Map<string, Result[]>>();

export function WhatIf({ ds }: { ds: ElectionDataset }) {
  const L = useL();
  const lang = useLang();
  const presets = useMemo(() => [...(ds.id === 'k25' ? K25 : ds.id === 'k26' ? K26 : []), ...COMMON], [ds.id]);
  const results = useMemo(() => {
    const cached = resultCache.get(ds)?.get(lang);
    if (cached) return cached;
    const out = computeResults();
    const m = resultCache.get(ds) ?? new Map<string, Result[]>(); m.set(lang, out); resultCache.set(ds, m);
    return out;
  }, [ds, presets, lang, L]);
  function computeResults(): Result[] {
    const base = scenarioFromDataset(ds);
    const r0 = allocate(toEngineInput(base));
    return presets.map((p) => {
      const actions = p.actions(base);
      if (!actions || !actions.length) return { p, actions: null, lines: [] as string[], votes: '' };
      let s = base;
      try { for (const a of actions) s = applyAction(s, a); } catch { return { p, actions: null, lines: [], votes: '' }; }
      const r = allocate(toEngineInput(s));
      // compare by origin so merged lists line up with their parts
      const groups = new Map<string, { before: number; after: number; label: string }>();
      for (const l of s.lists) {
        const key = l.originIds.length ? [...l.originIds].sort().join('+') : l.id;
        const before = l.originIds.reduce((t, o) => t + (r0.lists.find((x) => x.id === o)?.seats ?? 0), 0);
        const g = groups.get(key) ?? { before: 0, after: 0, label: listLabel(l, lang) };
        g.after += r.lists.find((x) => x.id === l.id)?.seats ?? 0;
        if (!groups.has(key)) g.before = before;
        groups.set(key, g);
      }
      const lines = [...groups.values()].filter((g) => g.before !== g.after).sort((a, b) => (b.after - b.before) - (a.after - a.before)).map((g) => `${g.label} ${signed(g.after - g.before)}`);
      const moved = actions.find((a) => a.type === 'transfer' || a.type === 'setVotes');
      const nm = (id: string) => { const x = base.lists.find((l) => l.id === id); return x ? listLabel(x, lang) : id; };
      const votes = moved?.type === 'transfer' ? L(`${fmtInt(moved.votes)} voters switch from ${nm(moved.from)}`, `${fmtInt(moved.votes)} מצביעים עוברים מ${nm(moved.from)}`)
        : moved?.type === 'setVotes' ? L(`${fmtInt(moved.votes - base.lists.find((x) => x.id === moved.listId)!.votes)} additional voters`, `${fmtInt(moved.votes - base.lists.find((x) => x.id === moved.listId)!.votes)} מצביעים נוספים`) : '';
      return { p, actions, lines, votes };
    });
  }

  const tryIt = (title: string, actions: Action[]) => {
    const st = getState();
    let s = { ...scenarioFromDataset(ds, title) };
    for (const a of actions) s = applyAction(s, a);
    setState({ scenario: s, past: st.scenario ? [...st.past, st.scenario] : st.past, future: [], selectedListId: null, compareWith: 'historical' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <p className="ink2 small" style={{ marginTop: 0 }}>{L('Each card starts from the real result and changes one thing. The seat changes shown are calculated exactly; “Try it” loads the scenario so you can explore further (Undo returns you to where you were).', 'כל כרטיס מתחיל מהתוצאה האמיתית ומשנה דבר אחד. שינויי המנדטים מחושבים במדויק; "נסו" טוען את התרחיש להמשך חקירה (ביטול מחזיר אתכם).')}</p>
      <div className="whatif">
        {results.map(({ p, actions, lines, votes }) => (
          <article key={p.id} className="wi-card">
            <h3>{lang === 'he' ? p.titleHe : p.titleEn}</h3>
            <p className="small ink2">{lang === 'he' ? p.bodyHe : p.bodyEn}</p>
            {votes && <p className="small"><b>{votes}</b></p>}
            <p className="small" style={{ minHeight: 36 }}>{!actions ? L('Not applicable to this election.', 'לא רלוונטי לבחירות אלה.') : lines.length ? lines.join(' · ') : L('No seat changes.', 'אין שינוי במנדטים.')}</p>
            <button className="btn small primary" disabled={!actions} onClick={() => actions && tryIt(lang === 'he' ? p.titleHe : p.titleEn, actions)}>{L('Try it', 'נסו')}</button>
          </article>
        ))}
      </div>
    </div>
  );
}
