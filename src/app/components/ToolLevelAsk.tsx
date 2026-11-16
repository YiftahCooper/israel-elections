import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { LEVEL_LABELS, RANK, type Preset } from '../features.ts';
import type { FeatureId } from '../features.ts';
import { useL } from '../i18n.ts';
import { setFeature, setLevel, useStore } from '../store.ts';

/** A greyed-out tool was chosen (owner, 16 Nov 2026): switch to the level it belongs to, or add it to the level in use.
 *  Either way the tool then opens. A tool the user greyed out at a level that has it is offered back instead. */
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
  const [en, he] = LEVEL_LABELS[toolLevel], [myEn, myHe] = LEVEL_LABELS[level];
  const done = (act: () => void) => { act(); onClose(); onOpen(); };
  return createPortal(<dialog ref={ref} className="tool-ask" aria-labelledby="tool-ask-title" aria-describedby="tool-ask-text"
    onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget) onClose(); }} onKeyDown={e => e.stopPropagation()}>
    <h2 id="tool-ask-title">{name}</h2>
    {above ? <>
      <p id="tool-ask-text">{L(`Part of the ${en} level.`, `חלק מרמת „${he}”.`)}</p>
      <div className="tool-ask-actions">
        <button type="button" className="btn primary" autoFocus onClick={() => done(() => setLevel(toolLevel))}>{L(`Switch to ${en}`, `מעבר לרמת „${he}”`)}</button>
        <button type="button" className="btn" onClick={() => done(() => setFeature(tool as FeatureId, 'show'))}>{L(`Add to ${myEn}`, `הוספה לרמת „${myHe}”`)}</button>
        <button type="button" className="btn ghost" onClick={onClose}>{L('Cancel', 'ביטול')}</button>
      </div>
      <p className="tiny ink2">{L('What you add stays when you change level. Settings lists it.', 'מה שמוסיפים נשאר גם כשמחליפים רמה. ההגדרות מציגות אותו.')}</p>
    </> : <>
      <p id="tool-ask-text">{L('You greyed this tool out.', 'בחרתם להציג את הכלי הזה באפור.')}</p>
      <div className="tool-ask-actions">
        <button type="button" className="btn primary" autoFocus onClick={() => done(() => setFeature(tool as FeatureId, 'show'))}>{L('Show it again', 'להציג שוב')}</button>
        <button type="button" className="btn ghost" onClick={onClose}>{L('Cancel', 'ביטול')}</button>
      </div>
    </>}
  </dialog>, document.body);
}
