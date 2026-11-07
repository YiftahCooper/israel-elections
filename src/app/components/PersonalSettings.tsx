import { useEffect, useRef } from 'react';
import { useL } from '../i18n.ts';
import { setState, useDigits, useStore } from '../store.ts';
import { ChoicePicker } from './ChoicePicker.tsx';
import { PreferenceSettings } from './SourcePicker.tsx';
import { Info } from './ui.tsx';
import './personal-settings.css';

/** Native modal leaves the current page mounted and restores its invoking control. */
export function PersonalSettings() {
  const L = useL();
  const open = useStore(st => st.settingsOpen);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = dialog.current;
    if (!open || !d) return;
    const previous = document.activeElement as HTMLElement | null;
    d.showModal();
    d.focus({ preventScroll: true });
    return () => { d.close(); previous?.focus({ preventScroll: true }); };
  }, [open]);
  const close = () => setState({ settingsOpen: false });
  return <dialog ref={dialog} tabIndex={-1} className="personal-settings" aria-label={L('Your settings', 'ההגדרות שלכם')}
    onCancel={e => { e.preventDefault(); e.stopPropagation(); close(); }}
    onKeyDown={e => e.stopPropagation()} onClick={e => { if (e.target === e.currentTarget) close(); }}>
    <div className="row"><h2>{L('Your settings', 'ההגדרות שלכם')}</h2><button className="btn" aria-label={L('Close', 'סגירה')} onClick={close}>×</button></div>
    {open && <SettingsContent />}
  </dialog>;
}

/** App settings, not part of any scenario: a separate card so they are never mistaken for rules. */
function SettingsContent() {
  const L = useL();
  const level = useStore(st => st.level);
  const digits = useDigits();
  const showComponentSeats = useStore(st => st.showComponentSeats);
  // precision is an Expert control (useDigits): other levels show it, fixed, rather than a select that does nothing
  const precision = level === 'expert';
  return (
    <section className="settings-card" aria-labelledby="settings-title">
      <h3 id="settings-title">{L('Settings', 'הגדרות')}</h3>
      <p className="small ink2" style={{ margin: '0 0 4px' }}>{L('Every election · this browser', 'לכל הבחירות · בדפדפן זה')} <Info title={L('Settings', 'הגדרות')}>{L('Settings are kept in this browser and apply to every election. They are not part of a scenario: not undone, saved or shared with it.', 'ההגדרות נשמרות בדפדפן זה וחלות על כל הבחירות. הן אינן חלק מתרחיש: אינן מבוטלות, נשמרות או משותפות איתו.')}</Info></p>
      <h4>{L('Display', 'תצוגה')}</h4>
      <div className="row" style={{ gap: 4 }}><label className="switch small"><input type="checkbox" checked={showComponentSeats} onChange={e => setState({ showComponentSeats: e.target.checked })} />{L('Party colours in split joint lists', 'צבעי מפלגות ברשימות משותפות שפוצלו')}</label>
      <Info title={L('Party colours', 'צבעי מפלגות')}>{L('When a joint list is split into its parties after the election, the seats and bars of its parties show the party colour inside the list colour. Off: the list colour only. Missing or similar colours are adjusted for display; they are not researched party colours.', 'כשרשימה משותפת מפוצלת למפלגותיה אחרי הבחירות, המושבים והעמודות של מפלגותיה מציגים את צבע המפלגה בתוך צבע הרשימה. כבוי: צבע הרשימה בלבד. צבעים חסרים או דומים מותאמים לתצוגה; אין בכך מידע מחקרי על צבעי המפלגות.')}</Info></div>
      <label className="field" style={{ maxWidth: 260, marginBlockStart: 8 }}>{L('Decimal places for percentages', 'ספרות אחרי הנקודה באחוזים')}
        {precision ? <ChoicePicker label={L('Decimal places for percentages', 'ספרות אחרי הנקודה באחוזים')} value={String(digits)} onChange={v => setState({ digits: Number(v) })} options={[0, 1, 2, 3, 4, 6, 8].map(d => ({ value: String(d), label: String(d) }))} /> : <span>{digits}</span>}
        {!precision && <span className="tiny muted">{L('Expert level', 'ברמת מומחה')}</span>}
      </label>
      <h4>{L('Editing', 'עריכה')} <Info title={L('Questions while editing', 'שאלות בזמן עריכה')}>{L('Some edits ask how to apply them. Just this once: asked again next time. For this list or bloc: saved per election in this browser. For this scenario: kept until reload. Always: used everywhere; change it here.', 'חלק מהעריכות שואלות איך להחיל אותן. רק הפעם: תישאלו שוב בפעם הבאה. לרשימה או לגוש: נשמר בדפדפן זה לכל בחירות בנפרד. לתרחיש זה: נשמר עד לטעינה מחדש. תמיד: חל בכל מקום; ניתן לשנות כאן.')}</Info></h4>
      <PreferenceSettings />
    </section>
  );
}

