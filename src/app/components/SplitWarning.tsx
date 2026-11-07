import './splitWarning.css';
import { useState } from 'react';
import { useL, useLang } from '../i18n.ts';
import { setSetting, useSetting } from '../store.ts';
import { Info } from './ui.tsx';

/** The joint-list split reminder: English approved by the owner (7 Nov). The Hebrew is provisional and lives only
 *  here, for the separate Hebrew editing pass. */
export const SPLIT_WARNING = [
  'A vote is for the whole list. Election results do not show which party within it each voter preferred—this split is a scenario assumption.',
  'ההצבעה היא לרשימה כולה. תוצאות הבחירות אינן מגלות איזו מפלגה בתוך הרשימה העדיף כל מצביע — הפיצול הוא הנחת תרחיש.',
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
