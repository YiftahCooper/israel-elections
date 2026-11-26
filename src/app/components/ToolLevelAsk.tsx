import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CUSTOM_LABEL, LEVEL_LABELS, RANK, type Preset } from '../features.ts';
import type { FeatureId } from '../features.ts';
import { useL } from '../i18n.ts';
import { setFeature, setLevel, useStore } from '../store.ts';

/** A greyed-out tool was chosen (owner, 16 Nov 2026): switch to the complexity it belongs to, or add it to Custom, the
 *  user's own complexity, which starts from the one in use (owner, 19 Nov 2026: Simple, Standard and Expert are never
 *  changed). Either way the tool then opens. A tool the user greyed out in Custom is offered back instead. */
export function ToolLevelAsk({ tool, toolLevel, name, onOpen, onClose }: {
  tool: string; toolLevel: Preset; name: string; onOpen: () => void; onClose: () => void;
}) {
  const L = useL();
  const level = useStore(st => st.level);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current; if (!d) return;
    const previous = document.activeElement as HTMLElement | null;
    d.showModal();
    return () => { d.close(); previous?.focus({ preventScroll: true }); };
  }, []);
  const above = RANK[toolLevel] > RANK[level];
  const [en, he] = LEVEL_LABELS[toolLevel], [myEn, myHe] = LEVEL_LABELS[level], [cEn, cHe] = CUSTOM_LABEL;
  const done = (act: () => void) => { act(); onClose(); onOpen(); };
  return createPortal(<dialog ref={ref} className="tool-ask" aria-labelledby="tool-ask-title" aria-describedby="tool-ask-text"
    onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget) onClose(); }} onKeyDown={e => e.stopPropagation()}>
    <h2 id="tool-ask-title">{name}</h2>
    {above ? <>
      <p id="tool-ask-text">{L(`Part of ${en}.`, `חלק מ"${he}".`)}</p>
      <div className="tool-ask-actions">
        <button type="button" className="btn primary" autoFocus onClick={() => done(() => setLevel(toolLevel))}>{L(`Switch to ${en}`, `מעבר ל"${he}"`)}</button>
        <button type="button" className="btn" onClick={() => done(() => setFeature(tool as FeatureId, 'show'))}>{L(`Add to ${cEn}`, `הוספה ל"${cHe}"`)}</button>
        <button type="button" className="btn ghost" onClick={onClose}>{L('Cancel', 'ביטול')}</button>
      </div>
      <p className="tiny ink2">{L(`${cEn} is ${myEn} with what you add. ${myEn} itself stays as it is; Settings lists your choices.`, `"${cHe}" הוא "${myHe}" ועוד מה שתוסיפו. "${myHe}" עצמו נשאר כמו שהוא; ההגדרות מציגות את הבחירות שלכם.`)}</p>
    </> : <>
      <p id="tool-ask-text">{L('You switched this tool off.', 'כיביתם את הכלי הזה.')}</p>
      <div className="tool-ask-actions">
        <button type="button" className="btn primary" autoFocus onClick={() => done(() => setFeature(tool as FeatureId, 'show'))}>{L('Show it again', 'להציג שוב')}</button>
        <button type="button" className="btn ghost" onClick={onClose}>{L('Cancel', 'ביטול')}</button>
      </div>
    </>}
  </dialog>, document.body);
}
