// Party history is its own chunk (it carries every election's lists): requested as soon as the app starts, beside the
// election data, so it is normally in place before the results first draw. Until then these render nothing.
import { useEffect, useState, type ComponentProps } from 'react';
type Module = typeof import('./PartyHistory.tsx');
let loaded: Module | null = null;
const loading = import('./PartyHistory.tsx').then((m) => (loaded = m));

function useModule() {
  const [m, setM] = useState(loaded);
  useEffect(() => { if (!m) void loading.then(setM); }, [m]);
  return m;
}
export function LazyRowComparison(props: ComponentProps<Module['RowComparison']>) {
  const m = useModule();
  return m ? <m.RowComparison {...props} /> : null;
}
export function LazyHistorySection(props: ComponentProps<Module['PartyHistorySection']>) {
  const m = useModule();
  return m ? <m.PartyHistorySection {...props} /> : null;
}
