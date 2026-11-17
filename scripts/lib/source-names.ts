// A source's name as a reader sees it in the term timeline and the MK pages: who published it, never the project's own
// repository, never a bare host name or acronym (reader-text pass, 17 Nov 2026).

/** the project's own repository: its data is the app's own work, not a source */
export const isOwnRepository = (url: string) => /^https:\/\/github\.com\/YiftahCooper\/israel-elections\b/.test(url);

const HOSTS: Record<string, string> = {
  'he.wikipedia.org': 'Hebrew Wikipedia',
  'www.idi.org.il': 'Israel Democracy Institute', 'en.idi.org.il': 'Israel Democracy Institute',
  'www.ynet.co.il': 'Ynet', 'www.ynetnews.com': 'Ynetnews',
  'main.knesset.gov.il': 'Knesset', 'knesset.gov.il': 'Knesset', 'm.knesset.gov.il': 'Knesset', 'fs.knesset.gov.il': 'Knesset',
  'www.timesofisrael.com': 'The Times of Israel', 'www.jpost.com': 'The Jerusalem Post', 'www.haaretz.co.il': 'Haaretz',
  'www.maariv.co.il': 'Maariv', 'www.israelhayom.co.il': 'Israel Hayom', 'news.walla.co.il': 'Walla', 'www.globes.co.il': 'Globes',
};
const SPELLED: Record<string, string> = { AP: 'Associated Press', AFP: 'Agence France-Presse', JTA: 'Jewish Telegraphic Agency', IDI: 'Israel Democracy Institute' };

/** the recorded publisher, spelled out; with none, the publisher of a known address, else the address without "www." */
export function sourceName(publisher: string | undefined, url: string): string {
  if (publisher?.trim()) return SPELLED[publisher.trim()] ?? publisher.trim();
  const host = new URL(url).hostname;
  return HOSTS[host] ?? host.replace(/^www\./, '');
}
