import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { PRESETS, RANK, TOOL_FEATURES, featureLabel, type Preset } from '../features.ts';
import { useL } from '../i18n.ts';
import { groupTabs } from '../tabGroups.ts';
import { activeFeatures, setState, useStore } from '../store.ts';
import { useCloseOnFocusAway } from '../focusReturn.ts';
import { ToolLevelAsk } from './ToolLevelAsk.tsx';
import './app-menu.css';

type Tool = { id: string; level: Preset; muted: boolean };
/** Every tool not hidden, as the tab row lists them: this level's first under each heading, then the greyed ones. */
export function useToolList(): Tool[] {
  const level = useStore(st => st.level), custom = useStore(st => activeFeatures(st));
  return TOOL_FEATURES.map(([id,,,, min]) => ({ id, level: min as Preset, v: id === 'board' ? 'show' : custom?.[id] ?? PRESETS[level][id] }))
    .filter(t => t.v !== 'hidden').map(({ id, level: l, v }) => ({ id, level: l, muted: v !== 'show' }));
}

/** The three-lines side panel (owner, 16 Nov 2026): the tools under their three headings, so they can be reached with
 *  the tab rows scrolled away (short screens) or cut off (narrow ones). On a phone it also holds what the bar has no
 *  room for: the level, language, theme, Settings and the election's About. The scenario has its own panel, opened
 *  from the bar's scenario button, so the two buttons never do the same job. */
export function AppMenu({ onClose, children }: { onClose: () => void; children?: ReactNode }) {
  const L = useL();
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const tools = useToolList();
  const level = useStore(st => st.level);
  const current = useStore(st => st.tool && st.tool !== 'compare' ? st.tool : 'board');
  const [ask, setAsk] = useState<Tool | null>(null);
  const groups = groupTabs(tools).map(g => ({ ...g, tabs: [...g.tabs.filter(t => !t.muted), ...g.tabs.filter(t => t.muted)] }));
  const open = (id: string) => { setState({ tool: id }); window.scrollTo({ top: 0 }); close.current(); };
  useCloseOnFocusAway(!ask, t => !!ref.current?.contains(t) || !!t.closest('.band-menu-btn, .band-tools-btn, dialog'), () => close.current());
  useEffect(() => {
    // the tool on screen, else the first button (one selector list matched the Close button first: review V4 A12)
    (ref.current?.querySelector<HTMLElement>('[aria-current="page"]') ?? ref.current?.querySelector<HTMLElement>('button'))?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !document.querySelector('dialog[open]')) { close.current(); document.querySelector<HTMLElement>('.band-menu-btn, .band-tools-btn')?.focus({ preventScroll: true }); } };
    const onDown = (e: PointerEvent) => { const t = e.target as Element; if (!ref.current?.contains(t) && !t.closest?.('.band-menu-btn, .band-tools-btn, dialog')) close.current(); };
    document.addEventListener('keydown', onKey); document.addEventListener('pointerdown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown); };
  }, []);
  const why = (t: Tool) => RANK[t.level] > RANK[level] ? L(` (${['Simple', 'Standard', 'Expert'][RANK[t.level]]})`, ` (${['פשוט', 'רגיל', 'מומחה'][RANK[t.level]]})`) : L(' (greyed out)', ' (באפור)');
  return createPortal(<>
    <div className="app-menu-scrim" aria-hidden />
    <div ref={ref} id="app-menu" className="app-menu" role="dialog" aria-label={L('Menu', 'תפריט')}>
      <div className="app-menu-head"><p className="app-menu-brand">{L('Israeli Elections Explorer', 'סייר הבחירות לכנסת')}</p>
        <button type="button" className="btn ghost icon-only app-menu-close" aria-label={L('Close', 'סגירה')} onClick={() => { close.current(); document.querySelector<HTMLElement>('.band-menu-btn, .band-tools-btn')?.focus({ preventScroll: true }); }}><X className="icon" aria-hidden /></button></div>
      <nav className="app-menu-tools" aria-label={L('Tools', 'כלים')}>
        {groups.map(g => <section key={g.id} aria-labelledby={`am-${g.id}`}>
          <h2 id={`am-${g.id}`}>{L(...g.label)}</h2>
          <ul>{g.tabs.map(t => <li key={t.id}><button type="button" className={`app-menu-tool ${t.muted ? 'locked' : ''}`} aria-current={current === t.id ? 'page' : undefined}
            onClick={() => t.muted && current !== t.id ? setAsk(t) : open(t.id)}>{L(...featureLabel(t.id as typeof TOOL_FEATURES[number][0]))}{t.muted && <span className="sr-only">{why(t)}</span>}</button></li>)}</ul>
        </section>)}
      </nav>
      {children}
    </div>
    {ask && <ToolLevelAsk tool={ask.id} toolLevel={ask.level} name={L(...featureLabel(ask.id as typeof TOOL_FEATURES[number][0]))} onOpen={() => open(ask.id)} onClose={() => setAsk(null)} />}
  </>, document.body);
}
