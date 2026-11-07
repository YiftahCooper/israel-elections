import { createPortal } from 'react-dom';
import { PARTS, partSnapshot } from '../../model/parts.ts';
import { inputPart } from '../../model/editScopes.ts';
import { dispatch } from '../store.ts';
import { Floating, useHoverBridge } from '../floating.tsx';
import {markerOwner,registerMarker,subscribeMarkers} from '../markerOwners.ts';
import { useActiveReference } from '../useActiveReference.ts';
import { useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { changeText, ChangeValue } from '../changeValue.tsx';
import type { Scenario } from '../../model/scenario.ts';
import { baselineOf, editPathLabel, markerPath, markerReference, type EditPath } from '../derive.ts';
import { useSetting, useStore } from '../store.ts';
import { useL, useLang } from '../i18n.ts';
export function EditMarker({ s, path, summary = false, outlet = '' }: { s: Scenario; path: EditPath; summary?: boolean; outlet?: string }) {
  const L = useL(), lang = useLang(), id = useId();
  const { markerReference: reference } = useActiveReference();
  const committed = useStore(st => st.scenario);
  const preview = useStore(st => st.preview);
  if (s === preview && committed) s = committed;
  const ds = useStore(st => st.datasets[s.electionId]);
  const base = reference ?? (ds ? baselineOf(ds) : null);
  const resolved=base?markerPath(s,base,path):null;
  const key=`${s.id}/${outlet}/${resolved?.join('/')??''}`;
  const owner=useSyncExternalStore(subscribeMarkers,()=>markerOwner(key),()=> '');
  const anchor = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const hover = useHoverBridge(() => setOpen(false));
  const hoverPopups = useSetting('hoverPopups');
  useLayoutEffect(()=>{if(!resolved||!anchor.current)return;return registerMarker(key,{id,node:anchor.current,priority:path[0]==='parts'||path[0]==='customGroupingName'?0:summary?2:1});},[key,id,!!resolved,path[0],summary]);
  if (!base || !resolved) return null;
  const before=markerReference(s,base,resolved);
  const logicalPath=resolved;
  const visible=owner===id;
  const context = editPathLabel(s, logicalPath[0] === 'agreements' && logicalPath.length === 2 ? ['agreements'] : logicalPath, lang, base);
  const label = context + ' · ' + L('Edited: was ', 'נערך: קודם ') + changeText(before, logicalPath, lang);
  const part = inputPart(logicalPath);
  const listId = logicalPath[0] === 'lists' ? logicalPath[1] : logicalPath[0] === 'parts' ? logicalPath[2] : undefined;
  return <span ref={anchor} className="edit-marker-slot" data-marker-path={logicalPath.join('/')}>{visible&&<span className="edit-marker" data-marker-kind={logicalPath[0]==='parts'?'part':'item'} role="button" tabIndex={visible?0:undefined} aria-expanded={open} aria-controls={open ? id : undefined} aria-label={label} aria-describedby={open&&visible ? id : undefined}
    onMouseEnter={() => { if (!hoverPopups) return; hover.cancel(); setOpen(true); }} onMouseLeave={hover.leave} onClick={e => { e.stopPropagation(); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node) && !document.getElementById(id)?.contains(e.relatedTarget as Node)) setOpen(false); }}
    onKeyDown={e => { if (e.key === 'Tab' && !e.shiftKey && e.target === e.currentTarget && open && part) { e.preventDefault(); document.getElementById(id)?.querySelector<HTMLButtonElement>('button')?.focus(); } if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.stopPropagation(); setOpen(true); } if (e.key === 'Escape' && open) { e.stopPropagation(); setOpen(false); } }}>{L('Edited', 'נערך')}
    {open && visible && createPortal(<Floating id={id} role="dialog" label={label} onPointerEnter={hover.cancel} onPointerLeave={hover.leave} className="edit-tooltip" anchor={() => anchor.current?.getBoundingClientRect()}>
      {context} · {L('Edited: was ', 'נערך: קודם ')}<ChangeValue s={before} path={logicalPath} lang={lang} />
      {part && <button type="button" className="btn small marker-restore" onBlur={e => { if (!anchor.current?.contains(e.relatedTarget as Node)) setOpen(false); }} onKeyDown={e => { if (e.key === 'Tab' && e.shiftKey || e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); anchor.current?.querySelector<HTMLElement>('.edit-marker')?.focus(); if(e.key === 'Escape') setOpen(false); } }} onClick={e => { e.stopPropagation(); dispatch({ type: 'startPart', part, source: 'saved', snapshot: partSnapshot(before, part), name: L('Reference', 'נקודת הייחוס'), ...(listId ? { listId } : {}) }); setOpen(false); }}>{L('Restore ', 'שחזור ')}{PARTS[part][lang]}</button>}
    </Floating>, document.body)}
  </span>}</span>;
}
