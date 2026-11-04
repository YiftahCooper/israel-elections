import { useState } from 'react';
import { useL } from '../i18n.ts';
import { DecimalInput, NumberInput, Seg } from './ui.tsx';
export interface NumericStep { id: string; label: string; amount: number; unit?: 'pp' }
/** One mirrored control for precise entry and domain steps. Each press commits once. */
export function NumericStepper({ label, value, onCommit, steps, targetForStep, onPreview, min = 0, max = Number.MAX_SAFE_INTEGER, digits, showLabel = false }: {
  label: string; value: number; onCommit: (n: number) => void; steps: NumericStep[];
  targetForStep?: (step: NumericStep, direction: -1 | 1) => number | null;
  onPreview?: (target: number) => void; min?: number; max?: number; digits?: number; showLabel?: boolean;
}) {
  const L = useL();
  const [selected, setSelected] = useState(steps[0]?.id);
  const step = steps.find(x => x.id === selected) ?? steps[0];
  const target = (direction: -1 | 1) => targetForStep ? targetForStep(step, direction) : Math.round((value + direction * step.amount) * 1e6) / 1e6;
  const allowed = (n: number | null) => n !== null && n !== value && Number.isFinite(n) && n >= min && n <= max;
  return <div className="numeric-stepper" role="group" aria-label={`${label} ${L('controls', 'בקרים')}`}>
    {showLabel && <span className="small ink2">{label}</span>}
    <div className="stepper-controls">
      {([-1, 1] as const).map(direction => {
        const t = target(direction);
        const button = <button key={direction} type="button" className="btn stepper-nudge" aria-label={`${direction < 0 ? L('Decrease', 'הפחתת') : L('Increase', 'הוספת')} ${label}`} disabled={!allowed(t)} onFocus={() => { if (allowed(t)) onPreview?.(t!); }} onMouseEnter={() => { if (allowed(t)) onPreview?.(t!); }} onClick={() => { if (allowed(t)) onCommit(t!); }}><span aria-hidden>{direction < 0 ? '−' : '+'}</span></button>;
        return direction < 0 ? <span key={direction} className="stepper-value-row">{button}{digits === undefined ? <NumberInput value={value} label={label} onCommit={onCommit} /> : <DecimalInput value={value} label={label} onCommit={onCommit} digits={digits} />}</span> : button;
      })}
    </div>
    {steps.length > 1 && <Seg label={`${label} ${L('step size', 'גודל צעד')}`} value={step.id} onChange={setSelected} options={steps.map(x => ({ v: x.id, label: x.label }))} />}
  </div>;
}
