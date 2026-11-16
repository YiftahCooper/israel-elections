import { useLang } from '../i18n.ts';
import type { Scenario } from '../../model/scenario.ts';
import { ListName } from './ListMark.tsx';
/** The list's mark (logo, else colour dot) + normal-ink name: identity colour never compromises text contrast. */
export function PartyName({ s, id }: { s: Scenario; id: string }) {
  const lang = useLang(), list = s.lists.find(l => l.id === id);
  return list ? <ListName list={list} lang={lang} /> : <span><bdi>{id}</bdi></span>;
}
