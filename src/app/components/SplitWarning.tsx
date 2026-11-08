import './splitWarning.css';
import { useState } from 'react';
import { useL, useLang } from '../i18n.ts';
import { setSetting, useSetting } from '../store.ts';
import { Info } from './ui.tsx';

/** The joint-list split reminder: the Hebrew is the owner's own (8 Nov), the English matches it. The split (i)s
 *  beside it (JointParties, Structure) open with the same point in the same words. */
export const SPLIT_WARNING = [
  'The vote was cast for the whole list. The results don’t show a preference for any one party; the split here is an assumption for the scenario.',
  'הקול ניתן לרשימה כולה. תוצאות הבחירות אינן מצביעות על העדפת מפלגה ספציפית — הפיצול כאן הוא הנחה לתרחיש.',
] as const;
const LAW_HE = 'ההצבעה תהיה בעד רשימות מועמדים שפורסמו בהתאם לסעיף 65.';
const LAW_EN = 'Voting shall be for lists of candidates published in accordance with section 65.';

/** Shown at both split entry points (Merge & split, and a joint list's page). "Don't show again" turns off the
 *  Settings row Editing → Joint-list split warning; the reminder stays on screen until the user leaves, so the
 *  checkbox never disappears under the pointer and can be unticked. */
export function SplitWarning() {
  const L = useL(), lang = useLang(), show = useSetting('splitWarning');
  const [touched, setTouched] = useState(false);
  if (!show && !touched) return null;
  return <aside className="callout small split-warning st-full" role="note">
    <span>{L(...SPLIT_WARNING)} <Info title={L('Knesset Elections Law, §5', 'חוק הבחירות לכנסת, סעיף 5')}>
      <q lang="he" dir="rtl">{LAW_HE}</q>{lang === 'en' && <><br />“{LAW_EN}”</>}
    </Info></span>
    <label className="split-warning-again"><input type="checkbox" checked={!show} onChange={e => { setTouched(true); setSetting('splitWarning', !e.target.checked); }} />{L("Don't show again", 'לא להציג שוב')}</label>
  </aside>;
}

/** Beside a party that gets no vote share in a split: it runs no list of its own (no empty 0-vote list is created). */
export function SplitPartNote({ own, home }: { own: boolean; home: string | null }) {
  const L = useL();
  return <span className="tiny muted split-part-note">{L('No list of its own', 'ללא רשימה משלה')} <Info title={L('No list of its own', 'ללא רשימה משלה')}>
    {own ? (home ? L(`No vote share, so it runs no list of its own; its candidates stay with ${home}. Give it a share to run it.`, `אין לה חלק בקולות, ולכן אינה רצה ברשימה משלה; מועמדיה נשארים עם ${home}. תנו לה חלק כדי להריץ אותה.`)
      : L('No vote share, so it runs no list of its own. Give it a share to run it.', 'אין לה חלק בקולות, ולכן אינה רצה ברשימה משלה. תנו לה חלק כדי להריץ אותה.'))
      : L('No vote share and no recorded candidates, so it runs no list of its own. Give it a share to run it anyway.', 'אין לה חלק בקולות ואין לה מועמדים מתועדים, ולכן אינה רצה ברשימה משלה. תנו לה חלק כדי להריץ אותה בכל זאת.')}
  </Info></span>;
}
