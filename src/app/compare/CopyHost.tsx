// Where the Overview's Copy votes box opens (loaded on first use); it closes when comparing stops.
import { lazy, Suspense, useEffect } from 'react';
import { useStore } from '../store.ts';
import { askCopy, useCopyAsk } from './copyAsk.ts';

const OverviewCopy = lazy(() => import('./OverviewCopy.tsx'));
export function CopyHost() {
  const ask = useCopyAsk();
  const comparing = useStore((st) => st.comparing);
  useEffect(() => { if (!comparing) askCopy(null); }, [comparing]);
  return ask && comparing ? <Suspense fallback={null}><OverviewCopy ask={ask} /></Suspense> : null;
}
