// Rotation agreements for the premiership (16 Nov 2026: shown wherever the government is shown, also when the rotation
// never happened). The research lane keeps them in data/research/government-rotation-agreements.json; each agreement
// names the governments it covers, the two prime ministers (research identifiers in English), the planned and the
// actual handover and its outcome, with its sources. Until that file is in this checkout the list is empty and the
// government card shows no rotation line.
export { personNames } from './aftermath-model.ts';

export interface RotationSource { url?: string; path?: string; publisher?: string; date?: string; locator?: string; inspection?: string; supportingNote?: string }
export interface RotationAgreement {
  id: string;
  governmentNumbers: number[];
  firstPrimeMinister: string;
  secondPrimeMinister: string;
  agreedDate: string | null;
  agreementNotifiedDate?: string | null;
  plannedRotationDate: string | null;
  plannedIntervalMonths?: number | null;
  plannedRotationDateCertainty?: string;
  actualRotationDate: string | null;
  outcome: 'occurred' | 'occurred-early' | 'did-not-occur' | string;
  legalMechanism?: string;
  sources: RotationSource[];
}

const files = import.meta.glob('../../data/research/government-rotation-agreements.json', { eager: true, import: 'default' });
export const rotationAgreements: RotationAgreement[] = Object.values(files).flatMap((d) => (d as { agreements?: RotationAgreement[] }).agreements ?? []);

/** The agreement covering a government (the first number it lists is the government the rotation starts in). */
export function rotationFor(governmentNumber: number, agreements: readonly RotationAgreement[] = rotationAgreements): RotationAgreement | undefined {
  return agreements.find((a) => a.governmentNumbers[0] === governmentNumber);
}

/** The statutory office of alternate prime minister (2020 on), as opposed to the 1984 agreement between two governments. */
export const statutory = (a: RotationAgreement) => /^statutory/i.test(a.legalMechanism ?? '');
