import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useL, useLang } from '../i18n.ts';
import { activeFeatures, getState, setCustom, setFeature, setMapLines, setPreference, setSetting, setState, settingChanged, toast, useStore } from '../store.ts';
import { CHOICE, resetFeatures, resetRows, restore, snapshot } from '../settingsReset.ts';
import { DECIMAL_CHOICES, FEATURE_GROUP, FEATURE_ROWS, GROUPS, SETTINGS, TIERS, featureMatches, textMatches, isExternal, rowMatches, rowTier, rowVisible, settingValue, type GroupId, type SettingId, type SettingRow } from '../settings.ts';
import { CUSTOM_LABEL, FEATURE_PREVIEWS, LEVEL_LABELS, PRESETS, SHOW_OR_HIDE, TOOL_FEATURES, featureLabel, featureLevel, ownChoices, shownAs, type FeatureId, type Preset, type Visibility } from '../features.ts';
import { PREFERENCES } from '../preferences.ts';
import { listLabel } from '../derive.ts';
import { RememberedAnswers } from './SourcePicker.tsx';
import { ColourChanges } from './ColourChanges.tsx';
import { Info, Seg } from './ui.tsx';
import { Complexity } from './Complexity.tsx';
import { Languages } from 'lucide-react';
import './personal-settings.css';
import { textZoom } from '../textScale.ts';

/** A row differs from its default (the dot before its label). Language and level are never "changed". */
function useChanged(row: SettingRow): boolean {
  return useStore(st => {
    const q = CHOICE[row.id];
    if (q === 'jointSeats') return st.preferences.jointSeats === 'off';
    if (q) return st.preferences[q] !== undefined;
    return !isExternal(row.id) && settingChanged(st, row.id as SettingId);
  });
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
  const focusRow = useStore(st => st.settingsFocus);
  const [query, setQuery] = useState('');
  const body = useRef<HTMLDivElement>(null);
  const searching = query.trim() !== '';
  // every level shows every setting (owner, 9 Nov 2026), ordered by complexity: the Detail level row, then the Simple
  // settings, then a "Standard" separator and its settings, then "Expert". Search filters within the same layout.
  const shown = useMemo(() => SETTINGS.filter(r => rowVisible(r, level) && rowMatches(r, query)), [query, level]);
  // the tools and sections of each level, beside the settings of the same group and tier (owner, 16 Nov 2026)
  const parts = useMemo(() => FEATURE_ROWS.filter(id => featureMatches(id, query)), [query]);
  const top = shown.filter(r => r.group === 'top');
  // Colours: the user's colour changes, a list of its own in the Simple tier (owner, 16 Nov 2026)
  const colours = textMatches(['Colours colors palette reset', 'צבעים צבע איפוס'], query);
  const tiers = TIERS.map(tier => ({ tier, rows: shown.filter(r => r.group !== 'top' && rowTier(r) === tier), parts: parts.filter(id => featureLevel(id) === tier) })).filter(t => t.rows.length || t.parts.length || (t.tier === 'simple' && colours));
  const inGroup = (t: { rows: SettingRow[]; parts: FeatureId[] }, g: GroupId) => t.rows.some(r => r.group === g) || t.parts.some(id => FEATURE_GROUP[id as Exclude<FeatureId, 'board'>] === g);
  const groups = GROUPS.filter(g => g.id !== 'top' && (g.id === 'colours' ? colours : tiers.some(t => inGroup(t, g.id))));
  const total = shown.length + parts.length;
  // a deep link from the point of use: scroll the popup body (never the page) to the row and mark it briefly
  useLayoutEffect(() => {
    if (!focusRow || !body.current) return;
    const el = body.current.querySelector<HTMLElement>(`[data-setting="${focusRow}"]`);
    if (!el) return;
    // after the dialog is shown (it opens in the parent's effect): measured on screen, the popup body alone scrolls
    const frame = requestAnimationFrame(() => {
      const b = body.current; if (!b) return;
      b.scrollTop += (el.getBoundingClientRect().top - b.getBoundingClientRect().top) / textZoom() - 12; // screen distances are zoomed under Large text
    });
    el.dataset.flash = '';
    const t = setTimeout(() => { delete el.dataset.flash; setState({ settingsFocus: null }); }, 1200);
    return () => { cancelAnimationFrame(frame); clearTimeout(t); };
  }, [focusRow]);
  // a group can appear in several tiers: its chip goes to the first
  const toGroup = (id: GroupId) => { const el = body.current?.querySelector<HTMLElement>(`[data-group="${id}"]`); if (el && body.current) body.current.scrollTop = (el.getBoundingClientRect().top - body.current.getBoundingClientRect().top) / textZoom() + body.current.scrollTop; };
  const resetAll = () => {
    const before = snapshot();
    resetRows(SETTINGS.filter(r => r.id !== 'lang' && r.id !== 'level'));
    resetFeatures();
    toast('info', L('Settings reset', 'ההגדרות אופסו'), { label: L('Undo', 'ביטול'), run: () => restore(before) });
  };
  return <>
    <header className="ps-head">
      <div className="row ps-title"><h2 id="settings-title">{L('Settings', 'הגדרות')}</h2>
        <Info title={L('Settings', 'הגדרות')}>{L('Kept in this browser for every election. Not part of scenarios, undo or share links.', 'נשמרות בדפדפן זה לכל הבחירות. אינן חלק מתרחישים, מהביטול או מקישורי שיתוף.')}</Info>
        <span className="spacer" /><button className="btn ps-close" aria-label={L('Close', 'סגירה')} onClick={close}>×</button></div>
      <input type="search" className="ps-search" value={query} onChange={e => setQuery(e.target.value)} placeholder={L('Find a setting', 'חיפוש הגדרה')} aria-label={L('Find a setting', 'חיפוש הגדרה')} />
      <nav className="ps-chips" aria-label={L('Setting groups', 'קבוצות הגדרות')}>
        {groups.map(g => <button key={g.id} type="button" className="btn small ghost" onClick={() => toGroup(g.id)}>{L(...g.label)}</button>)}
      </nav>
    </header>
    <div className="ps-body" ref={body}>
      {searching && <p className="sr-only" role="status">{L(`${total} settings`, `${total} הגדרות`)}</p>}
      {!total && <p className="muted">{L('No setting matches', 'לא נמצאה הגדרה')}</p>}
      {top.length > 0 && <Group id="top" tier="simple" rows={top} />}
      {!searching && <OwnChoices />}
      {tiers.map(({ tier, rows, parts: tierParts }) => <div key={tier} className="ps-tier" data-tier={tier} role="group" aria-labelledby={`ps-t-${tier}`}>
        {/* the Simple tier needs no separator when it opens the list; any tier after it is named by its level */}
        <h3 id={`ps-t-${tier}`} className={tier === 'simple' && tiers[0].tier === 'simple' ? 'sr-only' : 'ps-tier-sep'}><span>{L(...LEVEL_LABELS[tier])}</span></h3>
        {GROUPS.filter(g => g.id !== 'top' && inGroup({ rows, parts: tierParts }, g.id)).map(g => <Group key={g.id} id={g.id} tier={tier} first={!tiers.slice(0, tiers.findIndex(t => t.tier === tier)).some(t => inGroup(t, g.id))} rows={rows.filter(r => r.group === g.id)} parts={tierParts.filter(id => FEATURE_GROUP[id as Exclude<FeatureId, 'board'>] === g.id)} />)}
        {tier === 'simple' && colours && <section className="ps-group" data-group="colours" data-tier-group="simple:colours" aria-labelledby="ps-g-colours">
          <h4 id="ps-g-colours">{L('Colours', 'צבעים')} <Info title={L('Colours', 'צבעים')}>{L('Colours you chose for lists, parties and blocs. They are never a change to the result, and each can be reset here or beside the colour.', 'צבעים שבחרתם לרשימות, למפלגות ולגושים. הם אף פעם אינם שינוי בתוצאה, ואפשר לאפס כל אחד כאן או ליד הצבע.')}</Info></h4>
          <ColourChanges /></section>}
      </div>)}
      <footer className="ps-foot">
        <button type="button" className="btn small" onClick={resetAll}>{L('Reset all settings', 'איפוס כל ההגדרות')}</button>
        <Info title={L('Reset all settings', 'איפוס כל ההגדרות')}>{L('Back to the defaults, with Undo. Questions answered with “Always” are asked again, Custom is cleared, and every tool and detail follows its complexity again. Language, complexity and answers remembered for one list, bloc or scenario stay.', 'חזרה לברירות המחדל, עם ביטול. שאלות שנענו ב"תמיד" יישאלו שוב, "מותאם אישית" מתנקה וכל כלי ופרט חוזרים לפי רמת המורכבות. השפה, רמת המורכבות והתשובות השמורות לרשימה, לגוש או לתרחיש אחד נשארות.')}</Info>
      </footer>
    </div>
  </>;
}

function Group({ id, tier, rows, parts = [], first = true }: { id: GroupId; tier: Preset; rows: SettingRow[]; parts?: FeatureId[]; first?: boolean }) {
  const L = useL();
  const g = GROUPS.find(x => x.id === id)!;
  const resettable = rows.filter(r => r.id !== 'lang' && r.id !== 'level');
  const anyChanged = useStore(st => resettable.some(r => { const q = CHOICE[r.id]; return q === 'jointSeats' ? st.preferences.jointSeats === 'off' : q ? st.preferences[q] !== undefined : !isExternal(r.id) && settingChanged(st, r.id as SettingId); })
    || (st.custom && ownChoices(st.customFeatures, st.level).some(x => parts.includes(x))));
  const reset = () => { const before = snapshot(); resetRows(resettable); resetFeatures(parts); toast('info', L(`${g.label[0]} reset`, `${g.label[1]}: ההגדרות אופסו`), { label: L('Undo', 'ביטול'), run: () => restore(before) }); };
  const hid = `ps-g-${tier}-${id}`;
  // data-group marks a group's first appearance (the chips scroll there); data-tier-group names each one
  return <section className={`ps-group ${id === 'top' ? 'ps-top' : ''}`} data-group={first ? id : undefined} data-tier-group={`${tier}:${id}`} aria-labelledby={hid}>
    {id !== 'top' && <h4 id={hid}>{L(...g.label)}
      {/* the reset link always keeps its room, so the heading never shifts when it appears */}
      {(resettable.length > 0 || parts.length > 0) && <button type="button" className="link-btn ps-reset" style={{ visibility: anyChanged ? undefined : 'hidden' }} aria-hidden={!anyChanged} tabIndex={anyChanged ? 0 : -1} onClick={reset}>{L('Reset', 'איפוס')}</button>}</h4>}
    {id === 'top' && <h4 id={hid} className="sr-only">{L(...g.label)}</h4>}
    {rows.map(r => <Row key={r.id} row={r} />)}
    {parts.map(p => <PartRow key={p} id={p} />)}
  </section>;
}

const TOOL_IDS: readonly string[] = TOOL_FEATURES.map(f => f[0]);
/** One tool or section of a level: shown, folded (a tool: greyed out in the tab row) or hidden; a detail with no folded
 *  form is a switch. A dot marks the user's own choice, one that differs from what the level gives. */
function PartRow({ id }: { id: FeatureId }) {
  const L = useL();
  const level = useStore(st => st.level);
  const value = useStore(st => activeFeatures(st)?.[id] ?? PRESETS[st.level][id]);
  const own = useStore(st => st.custom && ownChoices(st.customFeatures, st.level).includes(id));
  const label = L(...featureLabel(id));
  const twoWay = SHOW_OR_HIDE.includes(id);
  const tool = TOOL_IDS.includes(id);
  const from = featureLevel(id);
  const head = <>
    <span className="ps-dot" aria-hidden={!own} title={own ? L('Your choice in Custom', 'הבחירה שלכם ב"מותאם אישית"') : undefined}>{own ? '•' : ''}</span>
    {own && <span className="sr-only">{L('Your choice: ', 'הבחירה שלכם: ')}</span>}
    <span className="ps-label-text">{label}</span>
  </>;
  const info = <Info title={label} label={L(`About ${label}`, `הסבר: ${label}`)}>{L(...FEATURE_PREVIEWS[id])}. {from === 'simple' ? L('Part of Simple, Standard and Expert.', 'חלק מכל הרמות.') : L(`Part of ${LEVEL_LABELS[from][0]}${from === 'expert' ? '' : ' and Expert'}.`, `חלק מרמת "${LEVEL_LABELS[from][1]}"${from === 'expert' ? '' : ' ו"מומחה"'}.`)}</Info>;
  if (twoWay) return <div className="ps-row is-toggle" data-setting={`part:${id}`} data-part={id}>
    <label className="ps-label switch-row"><span className="ps-label-inner">{head}</span>
      <span className="switch"><input type="checkbox" aria-label={label} checked={shownAs(id, value) === 'show'} onChange={e => setFeature(id, e.target.checked ? 'show' : PRESETS[level][id] === 'show' ? 'hidden' : PRESETS[level][id])} /></span></label>
    {info}
  </div>;
  const options: { v: Visibility; label: string }[] = [{ v: 'show', label: L('Shown', 'גלוי') }, { v: 'collapsed', label: tool ? L('Greyed out', 'באפור') : L('Folded', 'מקופל') }, { v: 'hidden', label: L('Hidden', 'מוסתר') }];
  return <div className="ps-row is-seg" data-setting={`part:${id}`} data-part={id}>
    <span className="ps-label"><span className="ps-label-inner">{head}</span></span>
    {info}
    <span className="ps-control"><Seg<Visibility> label={label} value={value} onChange={v => setFeature(id, v)} options={options} /></span>
  </div>;
}

/** Custom, the user's own complexity (owner, 19 Nov 2026): the one place that lists its choices, each named, with its
 *  own undo, and all at once. While a named complexity is in use the choices wait here, with a button to use them. */
function OwnChoices() {
  const L = useL();
  const level = useStore(st => st.level);
  const active = useStore(st => st.custom);
  const custom = useStore(st => st.customFeatures);
  const ids = ownChoices(custom, level);
  if (!ids.length) return null;
  const word = (id: FeatureId) => { const v = shownAs(id, custom![id]!); return v === 'show' ? L('added', 'נוסף') : v === 'hidden' ? L('hidden', 'מוסתר') : TOOL_IDS.includes(id) ? L('greyed out', 'באפור') : L('folded', 'מקופל'); };
  const undo = (only?: FeatureId[]) => { const before = snapshot(); resetFeatures(only); toast('info', L('Your choices cleared', 'הבחירות שלכם נוקו'), { label: L('Undo', 'ביטול'), run: () => restore(before) }); };
  return <section className="ps-own" aria-labelledby="ps-own-title" data-setting="own" data-active={active ? '' : undefined}>
    <h4 id="ps-own-title">{L(`${CUSTOM_LABEL[0]}: ${LEVEL_LABELS[level][0]} with your choices`, `${CUSTOM_LABEL[1]}: "${LEVEL_LABELS[level][1]}" עם הבחירות שלכם`)}
      <Info title={L(...CUSTOM_LABEL)}>{L('Tools and details you added or took away. Simple, Standard and Expert stay as they are; Custom starts from the one in use.', 'כלים ופרטים שהוספתם או הורדתם. "פשוט", "רגיל" ו"מומחה" נשארים כמו שהם; "מותאם אישית" מתחיל מהרמה שבשימוש.')}</Info>
      <button type="button" className="link-btn ps-reset" onClick={() => undo()}>{L('Clear all', 'ניקוי הכול')}</button></h4>
    {!active && <p className="ps-own-off small"><span className="ink2">{L(`Not in use: you are on ${LEVEL_LABELS[level][0]}.`, `לא בשימוש: אתם ברמת "${LEVEL_LABELS[level][1]}".`)}</span> <button type="button" className="btn small" onClick={setCustom}>{L(`Use ${CUSTOM_LABEL[0]}`, `מעבר ל"${CUSTOM_LABEL[1]}"`)}</button></p>}
    <ul className="ps-own-list">{ids.map(id => <li key={id}><span>{L(...featureLabel(id))} · <span className="ink2">{word(id)}</span></span>
      <button type="button" className="btn small ghost icon-only" aria-label={L(`Undo: ${featureLabel(id)[0]}`, `ביטול: ${featureLabel(id)[1]}`)} onClick={() => undo([id])}>×</button></li>)}</ul>
  </section>;
}

/** One setting: label and (i) at the start, its control at the end (on a phone, segments go under the label). */
function Row({ row }: { row: SettingRow }) {
  const L = useL();
  const changed = useChanged(row);
  const label = L(...row.label);
  const isToggle = row.control === 'toggle' || row.id === 'jointByParty';
  // the language is found by someone who cannot read the one on screen: a globe, and its name in both scripts
  const head: ReactNode = <>
    <span className="ps-dot" aria-hidden={!changed} title={changed ? L('Changed from the default', 'שונה מברירת המחדל') : undefined}>{changed ? '•' : ''}</span>
    {changed && <span className="sr-only">{L('Changed: ', 'שונה: ')}</span>}
    {row.id === 'lang' ? <span className="ps-label-text ps-lang-label"><Languages className="icon sm" aria-hidden />{label} · <span lang={L('he', 'en')}>{L('שפה', 'Language')}</span></span> : <span className="ps-label-text">{label}</span>}
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
    else if (id === 'mapLines') setMapLines(e.target.checked);
    else setSetting(id as SettingId, e.target.checked as never);
  }} /></span>;
}

function Control({ row, label }: { row: SettingRow; label: string }) {
  const L = useL();
  const lang = useLang();
  const store = useStore(st => st);
  if (row.control === 'level') return <span className="ps-level"><Complexity count={false} /></span>;
  if (row.control === 'lang') return <Seg label={label} value={store.lang} onChange={v => setState({ lang: v as 'he' | 'en' })} options={row.options!.map(o => ({ v: o.value as 'he' | 'en', label: o.label[0], lang: o.value }))} />;
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
