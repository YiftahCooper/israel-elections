/** Default identities have pairwise CIEDE2000 distance ≥ 15. Official results reserve neutral ink. */
export const SCENARIO_PALETTE = ['#8b45c8', '#486b78', '#ea7a00', '#e0569b', '#2e8b2e', '#2565d0', '#d1342c', '#a89a00'] as const;
/** Existing explicit choices remain valid and keep their appearance. */
export const SCENARIO_COLOURS = [...SCENARIO_PALETTE, '#65508a', '#77633d', '#80556a', '#526c55', '#356b82', '#87614c', '#686d35'] as const;
