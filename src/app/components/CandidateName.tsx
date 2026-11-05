import { useLang } from '../i18n.ts';
import { candidateName } from '../derive.ts';

export function CandidateName({ candidate, note = true, text }: { candidate: { nameHe: string; displayNameHe?: string; nameEn?: string }; note?: boolean; text?: string }) {
  const lang = useLang();
  const hebrew = lang === 'he' || !candidate.nameEn;
  return <bdi lang={hebrew ? 'he' : 'en'} dir={hebrew ? 'rtl' : 'ltr'} title={lang === 'en' && hebrew && note ? 'Hebrew name — no official English spelling recorded' : undefined}>{text ?? candidateName(candidate, lang)}</bdi>;
}
