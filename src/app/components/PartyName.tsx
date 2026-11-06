import { listLabel } from '../derive.ts';
import { useLang } from '../i18n.ts';
import type { Scenario } from '../../model/scenario.ts';
/** Established swatch + normal-ink name: identity colour never compromises text contrast. */
export function PartyName({ s, id }: { s: Scenario; id: string }) {
  const lang = useLang(), list = s.lists.find(l => l.id === id);
  return <span><span className="swatch" style={{ background: list?.color }} /> <bdi>{list ? listLabel(list, lang) : id}</bdi></span>;
}
