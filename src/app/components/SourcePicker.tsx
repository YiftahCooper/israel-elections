import { useEffect } from 'react';
import type { Scenario, SimList } from '../../model/scenario.ts';
import { listLabel } from '../derive.ts';
import { useL, useLang } from '../i18n.ts';
import { fmtInt } from '../format.ts';
import { setState, useVoteSource } from '../store.ts';
import { Info } from './ui.tsx';

/** The single setting that decides how every vote edit on a list is balanced. */
export function SourcePicker({ s, l }: { s: Scenario; l: SimList }) {
  const L = useL();
  const lang = useLang();
  const src = useVoteSource();
  const others = s.lists.filter((x) => x.id !== l.id && !x.withdrawn);
  // a transfer partner that no longer exists (or is this list) falls back to proportional
  useEffect(() => {
    if (src.kind === 'transfer' && (src.listId === l.id || !s.lists.some((x) => x.id === src.listId))) setState({ voteSource: { kind: 'proportional' } });
  }, [src, l.id, s.lists]);
  return (
    <div>
      <label className="field">
        <span className="row" style={{ gap: 6 }}>{L('When this list’s votes change, balance the difference with…', 'כשהקולות של רשימה זו משתנים, ההפרש מאוזן על ידי…')}
          <Info title={L('Different counterfactuals', 'תרחישים שונים')}>{L('Taking votes from all other lists keeps turnout and the valid total fixed. New voters (or voters staying home) change the valid total, and so the threshold in votes. A transfer moves votes from or to one list — if that list is below the threshold, those votes stop being wasted. These give different seat results.', 'לקיחה מכל שאר הרשימות שומרת על ההצבעה ועל סך הכשרים. מצביעים חדשים (או נמנעים) משנים את סך הכשרים ולכן את אחוז החסימה בקולות. מעבר מזיז קולות מול רשימה אחת — אם היא מתחת לחסימה, הקולות מפסיקים להתבזבז. התוצאות שונות.')}</Info>
        </span>
        <select aria-label={L('When this list’s votes change, balance the difference with…', 'כשהקולות של רשימה זו משתנים, ההפרש מאוזן על ידי…')} value={src.kind === 'transfer' ? `t:${src.listId}` : src.kind} onChange={(e) => {
          const v = e.target.value;
          setState({ voteSource: v === 'new' ? { kind: 'new' } : v === 'proportional' ? { kind: 'proportional' } : { kind: 'transfer', listId: v.slice(2) } });
        }}>
          <option value="proportional">{L('All other lists, in proportion (turnout unchanged)', 'כל שאר הרשימות, באופן יחסי (ההצבעה ללא שינוי)')}</option>
          <option value="new">{L('New voters / voters staying home (turnout changes)', 'מצביעים חדשים / נמנעים (ההצבעה משתנה)')}</option>
          <optgroup label={L('One specific list (transfer)', 'רשימה אחת מסוימת (מעבר)')}>
            {[...others].sort((a, b) => b.votes - a.votes).map((x) => <option key={x.id} value={`t:${x.id}`}>{listLabel(x, lang)} ({fmtInt(x.votes)})</option>)}
          </optgroup>
        </select>
      </label>
    </div>
  );
}
