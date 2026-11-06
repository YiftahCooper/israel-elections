import { useRef, useState } from 'react';
import { useL } from '../i18n.ts';
import { nextCopyName } from '../scenarioDocument.ts';
import { getState, saveCurrent, toast, useStore } from '../store.ts';

/** One save flow for the page and header. Native dialog retains focus and Escape behavior. */
export function ScenarioSave({ as = false, disabled = false, className = 'btn', children, onSaved }: {
  as?: boolean; disabled?: boolean; className?: string; children: React.ReactNode; onSaved?: () => void;
}) {
  const L = useL(), saved = useStore(st => st.saved);
  const dialog = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState('');
  const [collision, setCollision] = useState(false);
  const match = saved.find(x => x.name === name.trim());
  const finish = (options?: { newIdentity?: boolean; overwriteId?: string }, chosen = name.trim()) => {
    if (saveCurrent(chosen, options)) { dialog.current?.close(); toast('info', L('Saved in this browser.', 'נשמר בדפדפן זה.')); onSaved?.(); }
  };
  return <>
    <button className={className} disabled={disabled} onClick={() => {
      const s = getState().scenario; if (!s) return;
      const n = s.name || L('Scenario', 'תרחיש'); setName(n);
      const exists = saved.some(x => x.name === n && (as || x.id !== s.id));
      if (!as && !exists) { if (saveCurrent(n)) { toast('info', L('Saved in this browser.', 'נשמר בדפדפן זה.')); onSaved?.(); } return; }
      setCollision(exists); dialog.current?.showModal();
    }}>{children}</button>
    <dialog ref={dialog} className="choice-dialog" aria-label={collision ? L('Name already exists', 'השם כבר קיים') : L('Save as…', 'שמירה בשם…')} onKeyDown={e => { if (e.key === 'Escape') e.stopPropagation(); }}>
      <div className="choice-head"><b>{collision ? L('Name already exists', 'השם כבר קיים') : L('Save as…', 'שמירה בשם…')}</b><button className="btn" aria-label={L('Close', 'סגירה')} onClick={() => dialog.current?.close()}>×</button></div>
      {collision ? <div className="choice-options">
        <button className="choice-option" onClick={() => match && finish({ overwriteId: match.id })}>{L('Overwrite', 'החלפה')}</button>
        <button className="choice-option" onClick={() => finish({ newIdentity: true }, nextCopyName(name.trim(), saved.map(x => x.name)))}>{L('Save as copy', 'שמירה כעותק')} “{nextCopyName(name.trim(), saved.map(x => x.name))}”</button>
        <button className="choice-option" onClick={() => setCollision(false)}>{L('Choose another name', 'בחירת שם אחר')}</button>
      </div> : <form onSubmit={e => { e.preventDefault(); if (match) setCollision(true); else finish({ newIdentity: as }); }}>
        <label className="field">{L('Name', 'שם')}<input autoFocus value={name} onChange={e => setName(e.target.value)} /></label>
        <button className="btn primary" disabled={!name.trim()}>{L('Save', 'שמירה')}</button>
      </form>}
    </dialog>
  </>;
}

export function UnsavedMark() {
  const L = useL();
  return <span role="img" aria-label={L('unsaved changes', 'שינויים שלא נשמרו')}> *</span>;
}
