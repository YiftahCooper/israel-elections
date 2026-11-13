// Where to read about a list or party at that election: its own voice (site, platform, newspaper, election
// material) and a neutral source (Knesset, Hebrew Wikipedia marked secondary, the Elections Committee, research).
// English Wikipedia is never linked (the build refuses it).
import type { PartyLink } from '../../data/schema.ts';
import { useL, useLang } from '../i18n.ts';
import { datesInText, formatDate } from '../dateFormat.ts';

const safe = (u: string) => /^https:\/\//.test(u);

export function PartyLinks({ links, name }: { links?: PartyLink[]; name: string }) {
  const L = useL(); const lang = useLang();
  const ok = (links ?? []).filter((x) => safe(x.url));
  if (!ok.length) return null;
  const label = (x: PartyLink) => {
    const year = x.archivedAt?.slice(0, 4);
    switch (x.sourceType) {
      case 'party-site': return year ? L(`Party site, ${year}`, `אתר המפלגה, ${year}`) : L('Party site', 'אתר המפלגה');
      case 'platform': return L('Platform', 'מצע');
      case 'ephemera': return L('Election material (National Library)', 'חומרי תעמולה (הספרייה הלאומית)');
      case 'party-newspaper': return year ? L(`Party newspaper, ${year}`, `עיתון המפלגה, ${year}`) : L('Party newspaper', 'עיתון המפלגה');
      case 'repo-scan': return L('Scan (this project)', 'סריקה (בפרויקט זה)');
      case 'knesset': return L('Knesset', 'הכנסת');
      case 'hewiki': return L('Wikipedia (he)', 'ויקיפדיה');
      case 'cec': return L('Elections Committee', 'ועדת הבחירות');
      // the publisher is stored as published (in Hebrew); the one research institute linked has an official English name
      case 'academic': return x.publisher === 'המכון הישראלי לדמוקרטיה' ? L('Israel Democracy Institute', x.publisher) : L('Research', x.publisher);
    }
  };
  const title = (x: PartyLink) => [datesInText(L(x.titleEn ?? name, x.titleHe ?? name)), x.kind === 'partisan' ? L('the party’s own voice (partisan)', 'בקולה של המפלגה (מפלגתי)') : L('a neutral source', 'מקור ניטרלי'),
    x.sourceType === 'hewiki' ? L('Hebrew Wikipedia: a secondary source', 'ויקיפדיה העברית: מקור משני') : '', x.archivedAt ? L(`archived ${formatDate(x.archivedAt, lang)}`, `ארכיון ${formatDate(x.archivedAt, lang)}`) : '',
    x.confidence === 'medium' ? L('probable match', 'התאמה סבירה') : ''].filter(Boolean).join(' · ');
  const group = (kind: PartyLink['kind']) => ok.filter((x) => x.kind === kind);
  return (
    <span className="party-links tiny" role="group" aria-label={L(`About ${name}`, `על ${name}`)}>
      {(['partisan', 'neutral'] as const).map((k) => group(k).length > 0 && (
        <span key={k} className="pl-group">
          <span className="muted">{k === 'partisan' ? L('Partisan:', 'מפלגתי:') : L('Neutral:', 'ניטרלי:')}</span>
          {group(k).map((x) => <a key={x.url} href={x.url} target="_blank" rel="noreferrer" title={title(x)} hrefLang={x.sourceType === 'hewiki' ? 'he' : undefined}>{label(x)}</a>)}
        </span>
      ))}
    </span>
  );
}
