// How long an answer to a point-of-use question holds (owner, 19 Nov 2026): Just this once, For this list (or bloc, or
// scenario), or Set as default; under the default a separate "Don't ask again" tick, usable only with it. One component
// for every box that remembers a choice: the vote source, the changes' reference and Copy votes.
import type { ReactNode } from 'react';
import { useL } from '../i18n.ts';
import { Info } from './ui.tsx';
import './scope-choice.css';

export type Scope = 'once' | 'item' | 'default';

/** `item`: the "For this …" option's words, or none when the question has no item; `storable`: whether this answer can
 *  stand without asking (when not, "Don't ask again" stays greyed out); `note`: a line under the choices. */
export function ScopeChoice({ name, scope, onScope, item, dontAsk, onDontAsk, storable = true, dontAskInfo, note }: {
  name: string; scope: Scope; onScope: (s: Scope) => void; item?: string; dontAsk: boolean; onDontAsk: (on: boolean) => void;
  storable?: boolean; dontAskInfo: string; note?: ReactNode;
}) {
  const L = useL();
  const off = scope !== 'default' || !storable;
  const options: [Scope, string][] = [['once', L('Just this once', 'רק הפעם')], ...(item ? [['item', item] as [Scope, string]] : []), ['default', L('Set as default', 'קביעה כברירת מחדל')]];
  return <fieldset className="preference-scope">
    <legend>{L('Use this choice', 'שימוש בבחירה')}</legend>
    {options.map(([v, text]) => <label key={v}><input type="radio" name={name} value={v} checked={scope === v} onChange={() => onScope(v)} />{text}</label>)}
    {/* a second tick under the default: later questions are answered by it at once */}
    <span className="scope-dont-ask" data-off={off ? '' : undefined}>
      <label><input type="checkbox" checked={dontAsk && !off} disabled={off} onChange={(e) => onDontAsk(e.target.checked)} />{L('Don’t ask again', 'לא לשאול שוב')}</label>
      {' '}<Info title={L('Don’t ask again', 'לא לשאול שוב')}>{dontAskInfo}</Info>
    </span>
    {note}
  </fieldset>;
}
