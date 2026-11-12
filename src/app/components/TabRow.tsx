import { useCallback, useRef } from 'react';
import { LEVEL_LABELS, RANK, type Preset } from '../features.ts';
import { useL, useLang } from '../i18n.ts';
import { groupTabs } from '../tabGroups.ts';
import { motionReduced } from '../store.ts';
import './tab-row.css';

/** `muted`: not shown at this level, by the level itself or by a Custom choice of Collapsed (featureVisibility). */
type Tool = { id: string; level: Preset; muted: boolean };
/** The tools strip: every tool by name under three small headings ("Your scenario", "What happened", "How it
 *  works"). Each heading names a tab list of its own; the strip as a whole is still one Tab stop, and the arrow keys
 *  run through every tab across the headings. Tools above the current level (or set to Collapsed on the Custom page)
 *  stay listed, muted, at the end of their heading's tabs. On a phone the headings become three buttons above the sideways-scrolling strip. */
export function TabRow({ tools, level, selected, label, onOpen, onKey, onPrefetch }: {
  tools: readonly Tool[]; level: Preset; selected: string | null; label: (id: string) => string;
  onOpen: (id: string) => void; onKey: (id: string) => void; onPrefetch: (id: string) => void;
}) {
  const L = useL(), lang = useLang();
  const strip = useRef<HTMLDivElement>(null);
  // one stable callback: a new function each render would tear down and rebuild the observers on every render
  const stripRef = useCallback((el: HTMLDivElement | null) => { strip.current = el; return trackTabOverflow(el); }, []);
  const locked = (t: Tool) => t.muted;
  // said after a muted tool's name: the level it belongs to, or Collapsed when a Custom choice put it there
  const why = (t: Tool) => RANK[t.level] > RANK[level] ? L(...LEVEL_LABELS[t.level]) : L('Collapsed', 'מכווץ');
  // this level's tools first under each heading, then the others (never hidden)
  const groups = groupTabs(tools).map(g => ({ ...g, tabs: [...g.tabs.filter(t => !locked(t)), ...g.tabs.filter(locked)] }));
  const ordered = groups.flatMap(g => g.tabs);
  const stop = ordered.some(t => t.id === selected) ? selected : ordered[0]?.id;
  // scrolls the strip only (scrollIntoView would also shift the toolbar itself, which clips its overflow)
  const jump = (id: string) => {
    const s = strip.current, g = s?.querySelector<HTMLElement>(`[data-tab-group="${id}"]`);
    if (!s || !g) return;
    const a = g.getBoundingClientRect(), b = s.getBoundingClientRect();
    s.scrollBy({ left: lang === 'he' ? a.right - b.right : a.left - b.left, behavior: motionReduced() ? 'auto' : 'smooth' });
  };
  return <nav className="toolbar" aria-label={L('Tools', 'כלים')}>
    <div className="tab-jumps">{groups.map(g => <button key={g.id} type="button" data-current={g.tabs.some(t => t.id === selected) ? '' : undefined}
      onClick={() => jump(g.id)}>{L(...g.label)}</button>)}</div>
    <div ref={stripRef} className="tabs tab-strip">
      {groups.map(g => {
        const firstLocked = g.tabs.findIndex(locked);
        return <div key={g.id} className="tab-group" data-tab-group={g.id}>
          <span className="tab-group-head" id={`tab-group-${g.id}`}>{L(...g.label)}</span>
          <div className="tab-group-tabs" role="tablist" aria-labelledby={`tab-group-${g.id}`}>
            {g.tabs.map((t, i) => [
              i === firstLocked ? <span key="more" className="more-label" aria-hidden>{L('More in other levels', 'עוד ברמות אחרות')}</span> : null,
              <button key={t.id} id={`tab-${t.id}`} role="tab" aria-selected={selected === t.id} aria-controls="analysis-panel" tabIndex={stop === t.id ? 0 : -1}
                className={locked(t) ? 'locked' : ''}
                onClick={() => onOpen(t.id)} onPointerEnter={() => onPrefetch(t.id)} onFocus={() => onPrefetch(t.id)}
                onKeyDown={(e) => {
                  const rtl = lang === 'he', at = ordered.indexOf(t);
                  const next = e.key === 'Home' ? 0 : e.key === 'End' ? ordered.length - 1
                    : e.key === (rtl ? 'ArrowLeft' : 'ArrowRight') ? (at + 1) % ordered.length
                    : e.key === (rtl ? 'ArrowRight' : 'ArrowLeft') ? (at - 1 + ordered.length) % ordered.length : -1;
                  if (next < 0) return;
                  e.preventDefault(); onKey(ordered[next].id);
                  (document.getElementById(`tab-${ordered[next].id}`) as HTMLElement | null)?.focus();
                }}>{label(t.id)}{locked(t) && <span className="sr-only"> ({why(t)})</span>}</button>,
            ])}
          </div>
        </div>;
      })}
    </div>
  </nav>;
}

/** Keep the trailing fade only while more tools remain outside the visible strip. */
function trackTabOverflow(el: HTMLDivElement | null) {
  if (!el) return;
  const update = () => el.toggleAttribute('data-more', el.scrollWidth - el.clientWidth - Math.abs(el.scrollLeft) > 1);
  const observer = new ResizeObserver(update);
  observer.observe(el); el.addEventListener('scroll', update, { passive: true });
  const content = new MutationObserver(update);
  content.observe(el, { childList: true, subtree: true, characterData: true });
  void document.fonts.ready.then(update);
  return () => { observer.disconnect(); content.disconnect(); el.removeEventListener('scroll', update); };
}
