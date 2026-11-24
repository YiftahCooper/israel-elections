import type { Lang } from './i18n.ts';

// The language the app opens in (owner, 24 Nov 2026): the site is reachable from several addresses. A language this
// browser has stored always wins. Without one, the address decides only the starting default: a `?lang=he|en` in the
// link (Cloudflare redirects may add it), else the address's ending (.il → Hebrew, .com → English), else Hebrew (the
// github.io and local addresses). That default is not stored by itself; it is stored with the user's other settings the
// first time the app stores anything (store.ts persist), like any language. index.html repeats this order before the
// first paint; keep the two in step.

/** The language a `?lang=` parameter asks for (null: none, or not one the app has). */
export function langFromQuery(search: string): Lang | null {
  const v = new URLSearchParams(search).get('lang')?.trim().toLowerCase();
  return v === 'he' || v === 'en' ? v : null;
}

/** The language an address's ending suggests (null: no suggestion; the app's default applies). */
export function langFromHost(hostname: string): Lang | null {
  const host = hostname.trim().toLowerCase().replace(/\.$/, '');
  if (host.endsWith('.il')) return 'he';
  if (host.endsWith('.com')) return 'en';
  return null;
}

export const DEFAULT_LANG: Lang = 'he';

/** The starting language: stored > `?lang=` > the address's ending > Hebrew. */
export function startLanguage({ saved, search, hostname }: { saved: Lang | null; search: string; hostname: string }): Lang {
  return saved ?? langFromQuery(search) ?? langFromHost(hostname) ?? DEFAULT_LANG;
}

/** The address without its `lang` parameter (path, other parameters and `#…` kept), or null when it has none. */
export function withoutLangParam(href: string): string | null {
  const url = new URL(href);
  if (!url.searchParams.has('lang')) return null;
  url.searchParams.delete('lang');
  return url.pathname + url.search + url.hash;
}
