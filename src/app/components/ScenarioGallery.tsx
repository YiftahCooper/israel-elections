import { Info as InfoPopover } from './ui.tsx';
import { liveScenarioColor, scenarioColor } from '../scenarioIdentity.ts';
import { useEffect, useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import { useL, useLang } from '../i18n.ts';
import { shareLink, useStore } from '../store.ts';
import { GalleryClient, filterEntries, issueUrl, publishUrl, validShareLink, type GalleryEntry } from '../gallery/gallery.ts';
import './ScenarioGallery.css';

/** Mount once on the Scenarios page. Publishes the active store scenario. */
export function ScenarioGallery() {
  const L = useL(), lang = useLang();
  const scenario = useStore(s => s.scenario);
  const elections = useStore(s => s.elections);
  const saved = useStore(s => s.saved);
  const [tags, setTags] = useState('');
  const description = scenario?.description ?? '';
  const [query, setQuery] = useState(''), [year, setYear] = useState(''), [tag, setTag] = useState(''), [sort, setSort] = useState('likes');
  const [entries, setEntries] = useState<GalleryEntry[]>([]), [timestamp, setTimestamp] = useState(0);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [publishing, setPublishing] = useState(false);
  const site = `${location.origin}${location.pathname}`;
  const client = useMemo(() => {
    let storage: Storage | undefined;
    try { storage = localStorage; } catch { /* private browser */ }
    // fetch must be called unbound from its owner (window), never as a method of another object
    return new GalleryClient(site, (input, init) => fetch(input, init), storage);
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
      tab.location.href = publishUrl({ identityColor: liveScenarioColor(scenario, saved), name: scenario.name || L('Untitled scenario', 'תרחיש ללא שם'), description: description.slice(0, 3000), electionId: scenario.electionId, year: election.date.slice(0, 4), tags: tags.split(',').map(t => t.trim()).filter(Boolean), shareLink: link });
    } catch { tab.close(); setError('publish'); }
    finally { setPublishing(false); }
  }
  const visible = filterEntries(entries, query, year, tag, sort);
  const canPublish = !!scenario?.log.length && !publishing;
  return <section className="scenario-gallery" aria-label={L('Community scenario gallery', 'גלריית תרחישים קהילתית')}>
    <h3>{L('Community scenarios', 'תרחישים מהקהילה')}</h3>
    <details className="sg-publish-disclosure"><summary>{L('Publish this scenario on GitHub', 'פרסום התרחיש ב-GitHub')}</summary><div className="sg-publish">
      <div className="sg-what">
        <span className="small ink2">{L('Publish this scenario', 'פרסום התרחיש הזה')}</span>
        <b dir="auto">{scenario?.name || L('Untitled scenario', 'תרחיש ללא שם')}</b>
        <span className="tiny muted">{scenario?.log.length ? L('Uses the name and description above.', 'השם והתיאור מלמעלה.') : L('Edit the scenario first.', 'תחילה שנו את התרחיש.')}</span>
      </div>
      <label className="field">{L('Tags (comma separated)', 'תגיות (מופרדות בפסיקים)')}<input type="text" maxLength={300} value={tags} onChange={e => setTags(e.target.value)} placeholder={L('e.g. turnout, Arab parties', 'למשל: שיעור הצבעה, מפלגות ערביות')} /></label>
      <button type="button" className="btn primary" disabled={!canPublish} onClick={prepare}>{L('Publish on GitHub ↗', 'פרסום ב-GitHub ↗')}</button>
      <p className="tiny muted sg-note">{L('Public · GitHub account required', 'פרסום ציבורי · נדרש חשבון GitHub')} <InfoPopover title={L('Publishing privacy', 'פרטיות בפרסום')}>{L('Publishing is public and needs a GitHub account: the scenario, its description and tags appear under your GitHub username. Do not include private information.', 'הפרסום ציבורי ודורש חשבון GitHub: התרחיש, התיאור והתגיות יופיעו תחת שם המשתמש שלכם. אין לכלול מידע פרטי.')}</InfoPopover></p>
    </div>
    </details>
    {entries.length > 0 && <div className="sg-filters">
      <label className="field sg-search">{L('Search', 'חיפוש')}<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={L('Name, description or tag', 'שם, תיאור או תגית')} /></label>
      <label className="field">{L('Election year', 'שנת בחירות')}<select value={year} onChange={e => setYear(e.target.value)}><option value="">{L('All years', 'כל השנים')}</option>{[...new Set(entries.map(e => e.year))].sort().reverse().map(y => <option key={y}>{y}</option>)}</select></label>
      <label className="field">{L('Tag', 'תגית')}<select value={tag} onChange={e => setTag(e.target.value)}><option value="">{L('All tags', 'כל התגיות')}</option>{[...new Set(entries.flatMap(e => e.tags))].sort().map(t => <option key={t}>{t}</option>)}</select></label>
      <label className="field">{L('Sort', 'מיון')}<select value={sort} onChange={e => setSort(e.target.value)}><option value="likes">{L('Most liked', 'הכי אהובים')}</option><option value="newest">{L('Newest', 'החדשים ביותר')}</option></select></label>
      <button type="button" className="btn ghost" disabled={busy} onClick={refresh} title={L('Refreshes at most every 10 minutes; the community index is updated automatically.', 'מתרענן לכל היותר פעם ב-10 דקות; האינדקס הקהילתי מתעדכן אוטומטית.')}>{busy ? L('Loading…', 'טוען…') : L('Refresh', 'רענון')}</button>
    </div>}
    <p className="tiny muted" role="status">{busy ? L('Loading…', 'טוען…') : L(`${visible.length} of ${entries.length} scenarios`, `${visible.length} מתוך ${entries.length} תרחישים`)}{timestamp > 0 && ` · ${L('updated', 'עודכן')} ${new Date(timestamp).toLocaleString(lang === 'he' ? 'he-IL' : 'en-GB', { dateStyle: 'short', timeStyle: 'short' })}`}</p>
    {error && <p className="banner warn" role="alert">{error === 'rate-limit' ? L('GitHub rate limit reached. Try again later; cached results remain visible.', 'הגעתם למגבלת הבקשות של GitHub. נסו מאוחר יותר; תוצאות שמורות נשארות מוצגות.') : error === 'popup' ? L('Allow pop-ups to open GitHub, then try again.', 'אפשרו חלונות קופצים כדי לפתוח את GitHub ונסו שוב.') : error === 'publish' ? L('Could not prepare the share link. Try again.', 'לא ניתן להכין קישור שיתוף. נסו שוב.') : L('Could not load GitHub. Check your connection and retry in 10 minutes. Cached results remain visible.', 'לא ניתן לטעון מ-GitHub. בדקו את החיבור ונסו שוב בעוד 10 דקות. תוצאות שמורות נשארות מוצגות.')}</p>}
    {!busy && !error && entries.length === 0 && <p className="small muted">{L('No community scenarios yet. Share yours above.', 'עדיין אין תרחישים מהקהילה. אפשר לפרסם למעלה.')}</p>}
    {!busy && entries.length > 0 && !visible.length && <p className="small muted">{L('No matches. Clear your search or filters.', 'לא נמצאו תוצאות. נקו את החיפוש או המסננים.')}</p>}
    {entries.length === 0 && <button type="button" className="btn small ghost" disabled={busy} onClick={refresh}>{L('Refresh', 'רענון')}</button>}
    <ul className="scn-cards">{visible.map(e => <li key={e.issue} className="scn-card">
      <div className="scn-title"><span className="swatch" style={{ background: scenarioColor(e) }} /><b dir="auto">{e.name}</b><span className="small muted">{e.year} · <bdi>{e.author}</bdi> · <time dateTime={e.date}>{new Date(e.date).toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-GB')}</time> · <span aria-label={L(`${e.likes} likes`, `${e.likes} לייקים`)}>♥ {e.likes}</span></span></div>
      {e.tags.length > 0 && <div className="sg-tags">{e.tags.map(t => <button type="button" key={t} className="chip" aria-pressed={tag === t} onClick={() => setTag(tag === t ? '' : t)} dir="auto">{t}</button>)}</div>}
      <details><summary aria-label={L(`Description: ${e.name}`, `תיאור: ${e.name}`)}><Info className="icon sm" aria-hidden /> {L('Description', 'תיאור')}</summary><p className="scenario-gallery-description" dir="auto">{e.description}</p></details>
      <div className="row" style={{ gap: 4 }}><a className="btn small" href={validShareLink(e.shareLink, site) ? e.shareLink : undefined} onClick={event => {
        event.preventDefault();
        // A full navigation also invokes the app's existing startup share importer when only the hash changes.
        if (validShareLink(e.shareLink, site)) { location.assign(e.shareLink); location.reload(); }
      }}>{L('Open', 'פתיחה')}</a><a className="btn small ghost" href={issueUrl(e.issue)} target="_blank" rel="noopener noreferrer">{L('Like on GitHub ↗', 'לייק ב-GitHub ↗')}</a></div>
    </li>)}</ul>
  </section>;
}
