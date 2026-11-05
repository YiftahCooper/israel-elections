import { Floating } from '../floating.tsx';
import {markerOwner,registerMarker,subscribeMarkers} from '../markerOwners.ts';
import { useActiveReference } from '../useActiveReference.ts';
import { useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { changeText, ChangeValue } from '../changeValue.tsx';
import type { Scenario } from '../../model/scenario.ts';
import { baselineOf, editPathLabel, markerPath, markerReference, type EditPath } from '../derive.ts';
import { useStore } from '../store.ts';
import { useL, useLang } from '../i18n.ts';
export function EditMarker({ s, path, summary = false }: { s: Scenario; path: EditPath; summary?: boolean }) {
  const L = useL(), lang = useLang(), id = useId();
  const { reference } = useActiveReference();
  const committed = useStore(st => st.scenario);
  const preview = useStore(st => st.preview);
  if (s === preview && committed) s = committed;
  const ds = useStore(st => st.datasets[s.electionId]);
  const base = reference ?? (ds ? baselineOf(ds) : null);
  const resolved=base?markerPath(s,base,path):null;
  const key=`${s.id}/${resolved?.join('/')??''}`;
  const owner=useSyncExternalStore(subscribeMarkers,()=>markerOwner(key),()=> '');
  const anchor = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  useLayoutEffect(()=>{if(!resolved||!anchor.current)return;return registerMarker(key,{id,node:anchor.current,priority:path[0]==='parts'||path[0]==='customGroupingName'?0:summary?2:1});},[key,id,!!resolved,path[0],summary]);
  if (!base || !resolved) return null;
  const before=markerReference(s,base,resolved);
  const logicalPath=resolved;
  const visible=owner===id;
  const context = editPathLabel(s, logicalPath[0] === 'agreements' && logicalPath.length === 2 ? ['agreements'] : logicalPath, lang, base);
  const label = context + ' · ' + L('Edited: was ', 'נערך: קודם ') + changeText(before, logicalPath, lang);
  return <span ref={anchor} className="edit-marker-slot" data-marker-path={logicalPath.join('/')}>{visible&&<span className="edit-marker" data-marker-kind={logicalPath[0]==='parts'?'part':'item'} tabIndex={visible?0:undefined} aria-label={label} aria-describedby={open&&visible ? id : undefined}
    onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
    onKeyDown={e => { if (e.key === 'Escape' && open) { e.stopPropagation(); setOpen(false); } }}>{L('Edited', 'נערך')}
    {open && visible && <Floating id={id} className="edit-tooltip" anchor={() => anchor.current?.getBoundingClientRect()}>
      {context} · {L('Edited: was ', 'נערך: קודם ')}<ChangeValue s={before} path={logicalPath} lang={lang} />
    </Floating>}
  </span>}</span>;
}
