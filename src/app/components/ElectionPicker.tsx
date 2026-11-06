import { ChevronsUpDown } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { electionContext } from '../../data/electionContext.ts';
import type { ElectionDataset, ElectionIndexEntry } from '../../data/schema.ts';
import { scenarioFromDataset } from '../../model/scenario.ts';
import { loadDataset, useStore } from '../store.ts';
import { useL, useLang } from '../i18n.ts';
import { electionLabel } from '../electionLabel.ts';
import { ResultPreview } from './ResultPreview.tsx';
function OfficialPreview({ ds }: { ds: ElectionDataset }) {
  const s = useMemo(() => scenarioFromDataset(ds), [ds]);
  return <ResultPreview s={s} blocs={false} />;
}
export function ElectionPicker({ elections, value, onChange }: { elections: ElectionIndexEntry[]; value: string; onChange: (value: string) => void }) {
  const L = useL(), lang = useLang(), datasets = useStore(st => st.datasets);
  const dialog = useRef<HTMLDialogElement>(null), trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false), [query, setQuery] = useState('');
  const era = (date: string) => Number(date.slice(0, 4)) >= 2015 ? '2015–2026' : Number(date.slice(0, 4)) >= 2003 ? '2003–2013' : Number(date.slice(0, 4)) >= 1992 ? '1992–2001' : '1949–1988';
  const options = [...elections.map(e => ({ value: e.id, electionId: e.id, label: electionLabel(e, elections, lang), date: e.date, group: era(e.date), disabled: !e.available, pm: false })), ...electionContext.pmContests.filter(c => c.contestType === 'prime-minister-only').map(c => ({ value: c.id, electionId: c.electionId, label: `2001 · ${L('Prime Minister only', 'ראש הממשלה בלבד')}`, date: c.effectiveDate, group: era(c.effectiveDate), disabled: false, pm: true }))].sort((a, b) => b.date.localeCompare(a.date));
  const matches = options.filter(o => `${o.label} ${o.date}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const at = options.findIndex(o => o.value === value);
  const close = () => { dialog.current?.close(); setOpen(false); trigger.current?.focus(); };
  const commit = (key: string) => { onChange(key); close(); };
  const previewKey = elections.filter(e => e.available).map(e => e.id).join(',');
  useEffect(() => {
    if (!open) return;
    let live = true;
    // Fetch on opening only. Loading previews never changes the active election or scenario.
    void Promise.allSettled(elections.filter(e => e.available).map(e => loadDataset(e.id))).then(() => {
      if (live) dialog.current?.querySelector<HTMLElement>(`[data-choice-value="${value}"]`)?.scrollIntoView({ block: 'nearest' });
    });
    return () => { live = false; };
  }, [open, previewKey]); // the opened timeline keeps its election snapshot while previews arrive
  return <span className="election choice-picker election-navigation">
    <button className="tool election-arrow" aria-label={L('Previous election', 'הבחירות הקודמות')} disabled={at < 0 || at >= options.length - 1 || options[at + 1]?.disabled} onClick={() => onChange(options[at + 1].value)}><span aria-hidden>‹</span></button>
    <button ref={trigger} className="btn choice-trigger" aria-label={L('Election', 'בחירות')} aria-haspopup="dialog" data-value={value} onClick={() => { setQuery(''); setOpen(true); dialog.current?.showModal(); dialog.current?.querySelector<HTMLInputElement>('input')?.focus(); requestAnimationFrame(() => dialog.current?.querySelector<HTMLElement>(`[data-choice-value="${value}"]`)?.scrollIntoView({ block: 'nearest' })); }}><span className="choice-current">{options[at]?.label}</span><ChevronsUpDown className="icon sm picker-affordance" aria-hidden /></button>
    <button className="tool election-arrow" aria-label={L('Next election', 'הבחירות הבאות')} disabled={at <= 0 || options[at - 1]?.disabled} onClick={() => onChange(options[at - 1].value)}><span aria-hidden>›</span></button>
    <dialog ref={dialog} className="choice-dialog election-dialog" aria-label={L('Election', 'בחירות')} onKeyDown={e => { if (e.key === 'Escape') e.stopPropagation(); }} onCancel={e => { e.preventDefault(); close(); }} onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <div className="timeline-search"><input autoFocus type="search" value={query} aria-label={L('Search choices', 'חיפוש אפשרויות')} placeholder={L('Year, Knesset or date…', 'שנה, כנסת או תאריך…')} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'ArrowDown') { e.preventDefault(); dialog.current?.querySelector<HTMLButtonElement>('.choice-option:not(:disabled)')?.focus(); } }} /><button className="btn" aria-label={L('Close', 'סגירה')} onClick={close}>×</button></div>
      <div className="choice-options" onKeyDown={e => {
        const buttons = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('.choice-option:not(:disabled)')]; const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
        const focused = document.activeElement?.getAttribute('data-choice-value');
        if (e.key === 'Enter' && focused) { e.preventDefault(); commit(focused); return; }
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
        e.preventDefault(); buttons[e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length - 1 : (i + (e.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length]?.focus();
      }}>
        {matches.map((o, i) => <div key={o.value} className={`election-row ${o.pm ? 'pm-only' : ''}`}>
          {o.group !== matches[i - 1]?.group && <h3 className="choice-era">{o.group}</h3>}
          <button className="choice-option" data-choice-value={o.value} aria-label={o.label} aria-description={o.date} aria-current={o.value === value ? 'true' : undefined} disabled={o.disabled} onClick={() => commit(o.value)}>
            <span className="choice-copy"><b>{o.label}</b><small><time>{o.date}</time>{o.disabled ? L(' · unavailable', ' · לא זמין') : ''}</small></span>
            {o.pm ? <span className="pm-marker">{L('PM ballot', 'פתק לראש הממשלה')}</span> : datasets[o.electionId] ? <OfficialPreview ds={datasets[o.electionId]!} /> : <span className="preview-loading" aria-label={L('Loading result preview', 'טעינת תצוגת התוצאה')} />}
            <span className="election-current-mark" aria-hidden>{o.value === value ? '✓' : ''}</span>
          </button>
        </div>)}
        {!matches.length && <p>{L('No matches', 'אין תוצאות')}</p>}
      </div>
    </dialog>
  </span>;
}
