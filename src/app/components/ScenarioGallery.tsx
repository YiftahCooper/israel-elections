import { useEffect, useMemo, useState } from 'react';
import { useL, useLang } from '../i18n.ts';
import { shareLink, useStore } from '../store.ts';
import { GalleryClient, filterEntries, issueUrl, publishUrl, validShareLink, type GalleryEntry } from '../gallery/gallery.ts';
import './ScenarioGallery.css';

/** Mount once on the Scenarios page. Publishes the active store scenario. */
export function ScenarioGallery() {
  const L = useL(), lang = useLang();
  const scenario = useStore(s => s.scenario);
  const elections = useStore(s => s.elections);
  const [description, setDescription] = useState(''), [tags, setTags] = useState('');
  const [query, setQuery] = useState(''), [year, setYear] = useState(''), [tag, setTag] = useState(''), [sort, setSort] = useState('likes');
  const [entries, setEntries] = useState<GalleryEntry[]>([]), [timestamp, setTimestamp] = useState(0);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [publishing, setPublishing] = useState(false);
  const site = `${location.origin}${location.pathname}`;
  const client = useMemo(() => {
    let storage: Storage | undefined;
    try { storage = localStorage; } catch { /* private browser */ }
    return new GalleryClient(site, fetch, storage);
  }, [site]);
  useEffect(() => {
    let active = true;
    const cached = client.cached();
    if (cached) { setEntries(cached.entries); setTimestamp(cached.timestamp); }
    setBusy(true);
    client.load().then(result => { if (active) { setEntries(result.entries); setTimestamp(result.timestamp); } })
      .catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [client]);
  async function refresh() {
    setBusy(true); setError('');
    try { const result = await client.load(); setEntries(result.entries); setTimestamp(result.timestamp); }
    catch (e) { setError(e instanceof Error ? e.message : 'network'); }
    finally { setBusy(false); }
  }
  async function prepare() {
    if (!scenario) return;
    const tab = window.open('about:blank', '_blank');
    if (!tab) { setError('popup'); return; }
    tab.opener = null;
    setPublishing(true);
    try {
      const link = await shareLink();
      const election = elections.find(e => e.id === scenario.electionId);
      if (!election || !validShareLink(link, site)) throw new Error();
      tab.location.href = publishUrl({ name: scenario.name || L('Untitled scenario', 'תרחיש ללא שם'), description, electionId: scenario.electionId, year: election.date.slice(0, 4), tags: tags.split(',').map(t => t.trim()).filter(Boolean), shareLink: link });
    } catch { tab.close(); setError('publish'); }
    finally { setPublishing(false); }
  }
  const visible = filterEntries(entries, query, year, tag, sort);
  return <section className="scenario-gallery" dir={lang === 'he' ? 'rtl' : 'ltr'} aria-label={L('Community scenario gallery', 'גלריית תרחישים קהילתית')}>
    <h2>{L('Community scenarios', 'תרחישים מהקהילה')}</h2>
    <p>{L('Publishing is public and requires a GitHub account. The scenario, description and tags will be visible to everyone under your GitHub username. Do not include private information.', 'הפרסום ציבורי ודורש חשבון GitHub. התרחיש, התיאור והתגיות יהיו גלויים לכולם תחת שם המשתמש שלכם ב-GitHub. אין לכלול מידע פרטי.')}</p>
    <fieldset>
      <legend>{L('Share the active scenario', 'פרסום התרחיש הפעיל')}</legend>
      <p>{scenario?.name || L('Open a scenario first', 'פתחו תרחיש תחילה')}</p>
      <label>{L('Description', 'תיאור')}<textarea maxLength={3000} value={description} onChange={e => setDescription(e.target.value)} /></label>
      <label>{L('Tags (comma separated)', 'תגיות (מופרדות בפסיקים)')}<input maxLength={300} value={tags} onChange={e => setTags(e.target.value)} /></label>
      <button type="button" disabled={!scenario || publishing} onClick={prepare}>{L('Publish to the gallery ↗', 'פרסום בגלריה ↗')}</button>
    </fieldset>
    <div className="scenario-gallery-filters">
      <label>{L('Search', 'חיפוש')}<input type="search" value={query} onChange={e => setQuery(e.target.value)} /></label>
      <label>{L('Election year', 'שנת בחירות')}<select value={year} onChange={e => setYear(e.target.value)}><option value="">{L('All years', 'כל השנים')}</option>{[...new Set(entries.map(e => e.year))].sort().reverse().map(y => <option key={y}>{y}</option>)}</select></label>
      <label>{L('Tag', 'תגית')}<select value={tag} onChange={e => setTag(e.target.value)}><option value="">{L('All tags', 'כל התגיות')}</option>{[...new Set(entries.flatMap(e => e.tags))].sort().map(t => <option key={t}>{t}</option>)}</select></label>
      <label>{L('Sort', 'מיון')}<select value={sort} onChange={e => setSort(e.target.value)}><option value="likes">{L('Most liked', 'הכי אהובים')}</option><option value="newest">{L('Newest', 'החדשים ביותר')}</option></select></label>
    </div>
    <button type="button" disabled={busy} onClick={refresh}>{L('Refresh', 'רענון')}</button>
    <p role="status">{busy ? L('Loading…', 'טוען…') : L(`${visible.length} scenarios`, `${visible.length} תרחישים`)}{timestamp > 0 && ` · ${L('Updated', 'עודכן')}: ${new Date(timestamp).toLocaleString(lang)}`}</p>
    <p>{L('Refreshes at most every 10 minutes (including manual refresh). Up to 1,000 open issues are checked, newest first. GitHub allows 60 anonymous requests per hour per IP.', 'הרענון מתבצע לכל היותר פעם ב-10 דקות (גם ברענון ידני). נבדקות עד 1,000 סוגיות פתוחות, מהחדשות לישנות. GitHub מאפשר 60 בקשות אנונימיות בשעה לכל כתובת IP.')}</p>
    {error && <p role="alert">{error === 'rate-limit' ? L('GitHub rate limit reached. Try again later; cached results remain visible.', 'הגעתם למגבלת הבקשות של GitHub. נסו מאוחר יותר; תוצאות שמורות נשארות מוצגות.') : error === 'popup' ? L('Allow pop-ups to open GitHub, then try again.', 'אפשרו חלונות קופצים כדי לפתוח את GitHub ונסו שוב.') : error === 'publish' ? L('Could not prepare the share link. Try again.', 'לא ניתן להכין קישור שיתוף. נסו שוב.') : L('Could not load GitHub. Check your connection and retry in 10 minutes. Cached results remain visible.', 'לא ניתן לטעון מ-GitHub. בדקו את החיבור ונסו שוב בעוד 10 דקות. תוצאות שמורות נשארות מוצגות.')}</p>}
    <ul className="scenario-gallery-grid">{visible.map(e => <li key={e.issue}>
      <h3 dir="auto">{e.name}</h3><p>{e.electionId} · {e.year} · <bdi>{e.author}</bdi> · <time dateTime={e.date}>{new Date(e.date).toLocaleDateString(lang)}</time> · 👍 {e.likes}</p>
      <p dir="auto">{e.tags.join(' · ')}</p>
      <details><summary aria-label={L(`Description: ${e.name}`, `תיאור: ${e.name}`)}>ⓘ {L('Description', 'תיאור')}</summary><p className="scenario-gallery-description" dir="auto">{e.description}</p></details>
      <div className="scenario-gallery-actions"><a href={validShareLink(e.shareLink, site) ? e.shareLink : undefined} onClick={event => {
        event.preventDefault();
        // A full navigation also invokes the app's existing startup share importer when only the hash changes.
        if (validShareLink(e.shareLink, site)) { location.assign(e.shareLink); location.reload(); }
      }}>{L('Open', 'פתיחה')}</a><a href={issueUrl(e.issue)} target="_blank" rel="noopener noreferrer">{L('Like on GitHub ↗', 'לייק ב-GitHub ↗')}</a></div>
    </li>)}</ul>
  </section>;
}
