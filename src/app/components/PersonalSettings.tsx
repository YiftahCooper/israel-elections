import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useL, useLang } from '../i18n.ts';
import { getState, resetSettings, restoreSettings, setLevel, setPreference, setSetting, setState, settingChanged, toast, useStore } from '../store.ts';
import { DECIMAL_CHOICES, GROUPS, SETTINGS, isExternal, rowMatches, rowVisible, settingValue, type GroupId, type RowId, type SettingId, type SettingRow, type SettingValues } from '../settings.ts';
import { LEVEL_LABELS, type Preset } from '../features.ts';
import { PREFERENCES, type PreferenceId } from '../preferences.ts';
import { listLabel } from '../derive.ts';
import { RememberedAnswers } from './SourcePicker.tsx';
import { Info, Seg } from './ui.tsx';
import './personal-settings.css';

/** The point-of-use questions behind three rows; their answers live in the PREFERENCES store. */
const CHOICE: Partial<Record<RowId, PreferenceId>> = { jointByParty: 'jointSeats', voteSource: 'voteSource', markChanges: 'comparison', copyMode: 'copyMode' };
type Snapshot = { settings: Partial<SettingValues>; preferences: Partial<Record<PreferenceId, string>> };
const snapshot = (): Snapshot => ({ settings: getState().settings, preferences: { ...getState().preferences } });
function restore(snap: Snapshot) {
  restoreSettings(snap.settings);
  for (const id of ['jointSeats', 'voteSource', 'comparison'] as const) if (getState().preferences[id] !== snap.preferences[id]) setPreference(id, snap.preferences[id]);
}
/** A row differs from its default (the dot before its label). Language and level are never "changed". */
function useChanged(row: SettingRow): boolean {
  return useStore(st => {
    const q = CHOICE[row.id];
    if (q === 'jointSeats') return st.preferences.jointSeats === 'off';
    if (q) return st.preferences[q] !== undefined;
    return !isExternal(row.id) && settingChanged(st, row.id as SettingId);
  });
}
/** Returns rows to their defaults: settings by registry, questions back to their default answer. */
function resetRows(rows: readonly SettingRow[]) {
  resetSettings(rows.filter(r => !isExternal(r.id)).map(r => r.id as SettingId));
  for (const r of rows) { const q = CHOICE[r.id]; if (q && getState().preferences[q] !== undefined) setPreference(q, undefined); }
}

/** Native modal that leaves the current page mounted and returns focus to its opener. */
export function PersonalSettings() {
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
  const close = () => setState({ settingsOpen: false, settingsFocus: null });
  return <dialog ref={dialog} tabIndex={-1} className="personal-settings" aria-labelledby="settings-title"
    onCancel={e => { e.preventDefault(); e.stopPropagation(); close(); }}
    onKeyDown={e => e.stopPropagation()} onClick={e => { if (e.target === e.currentTarget) close(); }}>
    {open && <SettingsContent close={close} />}
  </dialog>;
}

function SettingsContent({ close }: { close: () => void }) {
  const L = useL();
  const level = useStore(st => st.level);
  const custom = useStore(st => st.customFeatures);
  const focusRow = useStore(st => st.settingsFocus);
  const [query, setQuery] = useState('');
  const [more, setMore] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const searching = query.trim() !== '';
  // what this level shows; Search finds every setting, with a level tag on those this level hides
  const shown = useMemo(() => SETTINGS.filter(r => searching ? rowMatches(r, query) : rowVisible(r, level, custom)), [searching, query, level, custom]);
  const hiddenHere = SETTINGS.filter(r => !rowVisible(r, level, custom) && !r.only && rowVisible(r, 'standard', null));
  const extra = level === 'simple' && !searching && more ? hiddenHere : [];
  const groups = GROUPS.filter(g => shown.some(r => r.group === g.id));
  // a deep link from the point of use: scroll the popup body (never the page) to the row and mark it briefly
  useLayoutEffect(() => {
    if (!focusRow || !body.current) return;
    const el = body.current.querySelector<HTMLElement>(`[data-setting="${focusRow}"]`);
    if (!el) return;
    // after the dialog is shown (it opens in the parent's effect): measured on screen, the popup body alone scrolls
    const frame = requestAnimationFrame(() => {
      const b = body.current; if (!b) return;
      b.scrollTop += el.getBoundingClientRect().top - b.getBoundingClientRect().top - 12;
    });
    el.dataset.flash = '';
    const t = setTimeout(() => { delete el.dataset.flash; setState({ settingsFocus: null }); }, 1200);
    return () => { cancelAnimationFrame(frame); clearTimeout(t); };
  }, [focusRow]);
  const toGroup = (id: GroupId) => { const el = body.current?.querySelector<HTMLElement>(`[data-group="${id}"]`); if (el && body.current) body.current.scrollTop = el.offsetTop - body.current.offsetTop; };
  const resetAll = () => {
    const before = snapshot();
    resetRows(SETTINGS.filter(r => r.id !== 'lang' && r.id !== 'level'));
    toast('info', L('Settings reset', 'ההגדרות אופסו'), { label: L('Undo', 'ביטול'), run: () => restore(before) });
  };
  return <>
    <header className="ps-head">
      <div className="row ps-title"><h2 id="settings-title">{L('Settings', 'הגדרות')}</h2>
        <Info title={L('Settings', 'הגדרות')}>{L('Kept in this browser for every election. Not part of scenarios, undo or share links.', 'נשמרות בדפדפן זה לכל הבחירות. אינן חלק מתרחישים, מהביטול או מקישורי שיתוף.')}</Info>
        <span className="spacer" /><button className="btn ps-close" aria-label={L('Close', 'סגירה')} onClick={close}>×</button></div>
      <input type="search" className="ps-search" value={query} onChange={e => setQuery(e.target.value)} placeholder={L('Find a setting', 'חיפוש הגדרה')} aria-label={L('Find a setting', 'חיפוש הגדרה')} />
      <nav className="ps-chips" aria-label={L('Setting groups', 'קבוצות הגדרות')}>
        {groups.filter(g => g.id !== 'top').map(g => <button key={g.id} type="button" className="btn small ghost" onClick={() => toGroup(g.id)}>{L(...g.label)}</button>)}
      </nav>
    </header>
    <div className="ps-body" ref={body}>
      {searching && <p className="sr-only" role="status">{L(`${shown.length} settings`, `${shown.length} הגדרות`)}</p>}
      {!shown.length && <p className="muted">{L('No setting matches', 'לא נמצאה הגדרה')}</p>}
      {groups.map(g => <Group key={g.id} id={g.id} rows={shown.filter(r => r.group === g.id)} tagged={searching} level={level} custom={custom} />)}
      {level === 'simple' && !searching && hiddenHere.length > 0 && <>
        <button type="button" className="btn small ghost ps-more" aria-expanded={more} onClick={() => setMore(m => !m)}>
          {L(`${hiddenHere.length} more settings in Standard`, `עוד ${hiddenHere.length} הגדרות ברמת רגיל`)} <span aria-hidden>{more ? '▾' : '▸'}</span></button>
        {more && <section className="ps-group" aria-label={L('More settings', 'הגדרות נוספות')}><h3>{L('More settings', 'הגדרות נוספות')}</h3>
          {extra.map(r => <Row key={r.id} row={r} tag="standard" />)}</section>}
      </>}
      <footer className="ps-foot">
        <button type="button" className="btn small" onClick={resetAll}>{L('Reset all settings', 'איפוס כל ההגדרות')}</button>
        <Info title={L('Reset all settings', 'איפוס כל ההגדרות')}>{L('Back to the defaults, with Undo. Language, detail level and remembered answers stay.', 'חזרה לברירות המחדל, עם ביטול. השפה, רמת הפירוט והתשובות השמורות נשארות.')}</Info>
      </footer>
    </div>
  </>;
}

function Group({ id, rows, tagged, level, custom }: { id: GroupId; rows: SettingRow[]; tagged: boolean; level: Preset; custom: ReturnType<typeof getState>['customFeatures'] }) {
  const L = useL();
  const g = GROUPS.find(x => x.id === id)!;
  const resettable = rows.filter(r => r.id !== 'lang' && r.id !== 'level');
  const anyChanged = useStore(st => resettable.some(r => { const q = CHOICE[r.id]; return q === 'jointSeats' ? st.preferences.jointSeats === 'off' : q ? st.preferences[q] !== undefined : !isExternal(r.id) && settingChanged(st, r.id as SettingId); }));
  const reset = () => { const before = snapshot(); resetRows(resettable); toast('info', L(`${g.label[0]} reset`, `${g.label[1]}: אופס`), { label: L('Undo', 'ביטול'), run: () => restore(before) }); };
  return <section className={`ps-group ${id === 'top' ? 'ps-top' : ''}`} data-group={id} aria-labelledby={`ps-g-${id}`}>
    {id !== 'top' && <h3 id={`ps-g-${id}`}>{L(...g.label)}
      {/* the reset link always keeps its room, so the heading never shifts when it appears */}
      {resettable.length > 0 && <button type="button" className="link-btn ps-reset" style={{ visibility: anyChanged ? undefined : 'hidden' }} aria-hidden={!anyChanged} tabIndex={anyChanged ? 0 : -1} onClick={reset}>{L('Reset', 'איפוס')}</button>}</h3>}
    {id === 'top' && <h3 id={`ps-g-${id}`} className="sr-only">{L(...g.label)}</h3>}
    {rows.map(r => <Row key={r.id} row={r} tag={tagged && !rowVisible(r, level, custom) ? (r.only ?? r.min) : undefined} />)}
  </section>;
}

/** One setting: label and (i) at the start, its control at the end (on a phone, segments go under the label). */
function Row({ row, tag }: { row: SettingRow; tag?: Preset }) {
  const L = useL();
  const changed = useChanged(row);
  const label = L(...row.label);
  const isToggle = row.control === 'toggle' || row.id === 'jointByParty';
  const head: ReactNode = <>
    <span className="ps-dot" aria-hidden={!changed} title={changed ? L('Changed from the default', 'שונה מברירת המחדל') : undefined}>{changed ? '•' : ''}</span>
    {changed && <span className="sr-only">{L('Changed: ', 'שונה: ')}</span>}
    <span className="ps-label-text">{label}</span>
    {tag && <span className="ps-tag">{L(...LEVEL_LABELS[tag])}</span>}
  </>;
  // named apart from the control it explains, so the two never share a name
  const info = row.info && <Info title={label} label={L(`About ${label}`, `הסבר: ${label}`)}>{L(...row.info)}</Info>;
  return <div className={`ps-row ${isToggle ? 'is-toggle' : 'is-seg'}`} data-setting={row.id}>
    {isToggle
      ? <label className="ps-label switch-row"><span className="ps-label-inner">{head}</span><ToggleControl row={row} label={label} /></label>
      : <span className="ps-label"><span className="ps-label-inner">{head}</span></span>}
    {info}
    {!isToggle && <span className="ps-control"><Control row={row} label={label} /></span>}
    {row.control === 'choice' && <RememberedAnswers id={CHOICE[row.id]!} />}
  </div>;
}

function ToggleControl({ row, label }: { row: SettingRow; label: string }) {
  const id = row.id;
  const on = useStore(st => id === 'jointByParty' ? st.preferences.jointSeats !== 'off' : settingValue(st.settings, id as SettingId, st.level) as boolean);
  return <span className="switch"><input type="checkbox" aria-label={label} checked={on} onChange={e => {
    if (id === 'jointByParty') setPreference('jointSeats', e.target.checked ? 'on' : 'off');
    else setSetting(id as SettingId, e.target.checked as never);
  }} /></span>;
}

function Control({ row, label }: { row: SettingRow; label: string }) {
  const L = useL();
  const lang = useLang();
  const level = useStore(st => st.level);
  const store = useStore(st => st);
  if (row.control === 'level') return <span className="ps-level">
    <Seg<Preset> label={label} value={level} onChange={setLevel} options={(['simple', 'standard', 'expert'] as const).map(v => ({ v, label: L(...LEVEL_LABELS[v]) }))} />
    <button type="button" className="link-btn" onClick={() => setState({ tool: 'custom', settingsOpen: false, settingsFocus: null })}>{L('Custom…', 'מותאם…')}</button>
  </span>;
  if (row.control === 'lang') return <Seg label={label} value={store.lang} onChange={v => setState({ lang: v as 'he' | 'en' })} options={row.options!.map(o => ({ v: o.value as 'he' | 'en', label: o.label[0] }))} />;
  if (row.control === 'choice') {
    const q = CHOICE[row.id]!;
    const value = store.preferences[q] ?? 'ask';
    const remembered = value.startsWith('t:') ? store.scenario?.lists.find(l => l.id === value.slice(2)) : undefined;
    const options = [{ v: 'ask', label: L('Ask', 'לשאול') }, ...PREFERENCES[q].options.map(o => ({ v: o.value as string, label: L(o.label[0], o.label[1]) })),
      // a list remembered for Always is shown as a fourth, pressed segment: the state is never hidden
      ...(value.startsWith('t:') ? [{ v: value, label: remembered ? listLabel(remembered, lang) : L('One list', 'רשימה אחת') }] : [])];
    return <Seg label={label} value={value} onChange={v => setPreference(q, v === 'ask' ? undefined : v)} options={options} />;
  }
  if (row.control === 'decimals') {
    const value = settingValueOf(store, 'decimals') as number;
    return <Seg label={label} value={String(value)} onChange={v => setSetting('decimals', Number(v))} options={DECIMAL_CHOICES.map(d => ({ v: String(d), label: String(d) }))} />;
  }
  const id = row.id as SettingId;
  return <Seg label={label} value={String(settingValueOf(store, id))} onChange={v => setSetting(id, v as never)} options={row.options!.map(o => ({ v: o.value, label: L(...o.label) }))} />;
}
const settingValueOf = (st: ReturnType<typeof getState>, id: SettingId) => settingValue(st.settings, id, st.level);
