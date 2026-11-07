/** Default identities have pairwise CIEDE2000 distance ≥ 20. Official results reserve neutral ink. */
export const SCENARIO_PALETTE = ['#8e48cb', '#417182', '#da7205', '#e0569b', '#2e8b2e', '#6b82fc', '#d1342c', '#9b8f00'] as const;
/** Existing explicit choices remain valid and keep their appearance. */
export const SCENARIO_COLOURS = [...SCENARIO_PALETTE, '#65508a', '#77633d', '#80556a', '#526c55', '#356b82', '#87614c', '#686d35'] as const;
