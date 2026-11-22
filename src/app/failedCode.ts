// Code downloads that failed are kept as failed (so the panel shows its message instead of asking again in a loop)
// until the user asks again: Try again (components/ErrorBoundary.tsx), or opening the tab (audit 12 Nov 2026,
// c-robustness-09). A module of its own, without JSX, so a data loader can use it (src/app/aftermathData.ts).
const failedCode = new Set<() => void>();
export const rememberFailedCode = (forget: () => void) => { failedCode.add(forget); };
export const forgetFailedCode = () => { for (const forget of failedCode) forget(); failedCode.clear(); };
