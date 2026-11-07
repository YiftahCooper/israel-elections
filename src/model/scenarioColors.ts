/** Default identities have pairwise CIEDE2000 distance ≥ 20. Official results reserve neutral ink. */
export const SCENARIO_PALETTE = ['#8e48cb', '#417182', '#da7205', '#e0569b', '#2e8b2e', '#6b82fc', '#d1342c', '#9b8f00'] as const;
/** Hex validation permits user choices and derived colours beyond this palette. */
export const SCENARIO_COLOURS = SCENARIO_PALETTE;
