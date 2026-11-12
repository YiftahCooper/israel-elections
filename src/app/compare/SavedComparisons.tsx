// Saved comparisons on the Scenarios page, beside saved scenarios: one place for everything saved in this browser.
import { FolderOpen, Link2, Trash2 } from 'lucide-react';
import { useL, useLang } from '../i18n.ts';
import { setState, toast, useShown, useStore } from '../store.ts';
import { copyComparisonLink, deleteComparison, openComparison, useSavedComparisons, type SavedComparison } from './sides.ts';

export function SavedComparisons() {
  const L = useL(), lang = useLang();
  const list = useSavedComparisons();
  const elections = useStore((st) => st.elections);
  const year = (id: string) => elections.find((e) => e.id === id)?.date.slice(0, 4) ?? id;
  // the years, unless the name already says them (the suggested name is the years)
  const years = (c: SavedComparison) => `${year(c.link.other.e)} ↔ ${year(c.link.main.e)}`;
  // Side by side set to Hidden (Custom): the comparison opens on the Overview's comparison strip instead
  const sideShown = useShown('compare');
  const open = (c: SavedComparison) => openComparison(c.link).then((ok) => { if (!ok) toast('error', L('This comparison could not be opened.', 'לא ניתן לפתוח את ההשוואה.')); else setState({ tool: sideShown ? 'compare' : 'board' }); });
  // nothing saved yet: no empty section (Compare's Save says where it goes)
  if (!list.length) return null;
  return <section className="scn-comparisons" style={{ marginTop: 18 }}>
    <h3>{L(`Saved comparisons (${list.length})`, `השוואות שמורות (${list.length})`)}</h3>
    <ul className="scn-cards">
      {list.map((c) => <li key={c.id} className="scn-card">
        <div className="scn-title"><b>{c.name}</b><span className="small muted">{!c.name.includes(years(c)) && <><bdi dir="ltr">{years(c)}</bdi> · </>}{new Date(c.savedAt).toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-GB', { dateStyle: 'medium' })}</span></div>
        <div className="row" style={{ gap: 4 }}>
          <button className="btn small" onClick={() => void open(c)}><FolderOpen className="icon sm" aria-hidden />{L('Open', 'פתיחה')}</button>
          <button className="btn small ghost" onClick={() => void copyComparisonLink(c.link)}><Link2 className="icon sm" aria-hidden />{L('Copy link', 'העתקת קישור')}</button>
          <span className="spacer" />
          <button className="btn small ghost danger icon-only" aria-label={L(`Delete ${c.name}`, `מחיקת ${c.name}`)} onClick={() => { if (confirm(L(`Delete “${c.name}” from this browser?`, `למחוק את "${c.name}" מהדפדפן?`))) deleteComparison(c.id); }}><Trash2 className="icon sm" aria-hidden /></button>
        </div>
      </li>)}
    </ul>
  </section>;
}
