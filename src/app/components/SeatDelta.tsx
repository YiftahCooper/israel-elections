import { seatDeltaText } from '../format.ts';
import './seat-delta.css';
/** Direction and sign stay LTR even in Hebrew; colour is an additional cue. */
export function SeatDelta({ value }: { value: number }) {
  return <bdi dir="ltr" className="seat-delta" data-sign={Math.sign(value)}>{seatDeltaText(value)}</bdi>;
}

