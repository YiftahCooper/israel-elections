import { useLang } from '../i18n.ts';

/** A cited book's page ("p. 24", Hebrew "עמ׳ 24") and the quoted passage, shown under the source's link in the family
 *  and party-history popups. Other locators (file paths, data pointers) are not reader text and are not shown. */
export function PageAndQuote({ locator, quote }: { locator?: string; quote?: string }) {
  const lang = useLang();
  const page = locator ? /^pp?\. (\S+)$/.exec(locator) : null;
  return <>
    {/* a no-break space keeps "· p. 40" on the line where a long title ends */}
    {page && <>{' · '}{lang === 'he' ? 'עמ׳' : 'p.'}{' '}<bdi dir="ltr">{page[1]}</bdi></>}
    {quote && <blockquote className="source-quote" dir="auto">{quote}</blockquote>}
  </>;
}
