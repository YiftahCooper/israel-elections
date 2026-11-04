import { useState, type KeyboardEvent } from 'react';
import { useL } from '../i18n.ts';
import { DecimalInput, NumberInput, Seg } from './ui.tsx';
export interface NumericStep { id: string; label: string; amount: number; unit?: 'pp' }
/** One left-to-right numeric control for precise entry and domain steps. Each press commits once.
 *  In the field, ↑/↓ step by the chosen size and PageUp/PageDown by ten times it (a spin button's keys). */
export function NumericStepper({ label, value, onCommit, steps, targetForStep, onPreview, min = 0, max = Number.MAX_SAFE_INTEGER, digits, showLabel = false, defaultStep, onStepCommit }: {
  label: string; value: number; onCommit: (n: number) => void; steps: NumericStep[];
  targetForStep?: (step: NumericStep, direction: -1 | 1) => number | null;
  onPreview?: (target: number) => void; min?: number; max?: number; digits?: number; showLabel?: boolean; defaultStep?: string;
  /** a button or key step, when the caller works the target out itself at commit time */
  onStepCommit?: (step: NumericStep, direction: -1 | 1) => void;
}) {
  const L = useL();
  const [selected, setSelected] = useState(defaultStep ?? steps[0]?.id);
  const step = steps.find(x => x.id === selected) ?? steps[0];
  const targetFor = (s: NumericStep, direction: -1 | 1) => targetForStep ? targetForStep(s, direction) : Math.round((value + direction * s.amount) * 1e6) / 1e6;
  const target = (direction: -1 | 1) => targetFor(step, direction);
  const allowed = (n: number | null) => n !== null && n !== value && Number.isFinite(n) && n >= min && n <= max;
  // past an end the key goes to the end itself, so the field never refuses a key silently
  const clamp = (n: number | null) => n === null || !Number.isFinite(n) ? null : Math.min(max, Math.max(min, n));
  const onKeyDown = (e: KeyboardEvent) => {
    const k = { ArrowUp: 1, ArrowDown: -1, PageUp: 10, PageDown: -10 }[e.key];
    if (!k || !(e.target instanceof HTMLInputElement)) return;
    e.preventDefault();
    const direction = k > 0 ? 1 : -1, times = Math.abs(k);
    const t = clamp(targetFor({ ...step, amount: step.amount * times }, direction));
    if (allowed(t)) { if (onStepCommit && t !== max && t !== min) onStepCommit({ ...step, amount: step.amount * times }, direction); else onCommit(t!); }
  };
  return <div className="numeric-stepper" role="group" aria-label={`${label} ${L('controls', 'בקרים')}`}>
    {showLabel && <span className="small ink2">{label}</span>}
    <div className="stepper-controls" onKeyDown={onKeyDown}>
      {([-1, 1] as const).map(direction => {
        const t = target(direction);
        const button = <button key={direction} type="button" className="btn stepper-nudge" aria-label={`${direction < 0 ? L('Decrease', 'הפחתת') : L('Increase', 'הוספת')} ${label}`} title={`${direction < 0 ? '−' : '+'}${step.label}`} disabled={!allowed(t)} onFocus={() => { if (allowed(t)) onPreview?.(t!); }} onMouseEnter={() => { if (allowed(t)) onPreview?.(t!); }} onClick={() => { if (allowed(t)) { if (onStepCommit) onStepCommit(step, direction); else onCommit(t!); } }}><span aria-hidden>{direction < 0 ? '−' : '+'}</span></button>;
        return direction < 0 ? <span key={direction} className="stepper-value-row">{button}{digits === undefined ? <NumberInput value={value} label={label} onCommit={onCommit} /> : <DecimalInput value={value} label={label} onCommit={onCommit} digits={digits} />}</span> : button;
      })}
    </div>
    {steps.length > 1 && <Seg label={`${label} ${L('step size', 'גודל צעד')}`} value={step.id} onChange={setSelected} options={steps.map(x => ({ v: x.id, label: x.label }))} />}
  </div>;
}
